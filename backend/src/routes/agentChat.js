import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { agentExecute } from '../services/agentEngine.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
});

/**
 * Helper function to find conversation by either MongoDB ObjectId or Dify UUID
 */
const findConversationById = async (id) => {
  if (id.includes('-')) {
    return await Conversation.findOne({ difyConversationId: id });
  }
  return await Conversation.findById(id);
};

/**
 * POST /api/agent/chat - Agent智能聊天端点
 *
 * 支持两种模式:
 * 1. Agent模式: 不指定skillSlug，由Agent自动路由到最佳Skill
 * 2. 直接模式: 指定skillSlug，直接执行指定Skill
 *
 * 同时兼容旧的contextId模式
 */
router.post('/chat', auth, upload.array('files', 10), async (req, res) => {
  const { query, conversationId, contextId, skillSlug, skillParams } = req.body;
  const userId = req.userId;
  const files = req.files;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // 获取用户角色
    const user = await User.findById(userId);
    const userRole = user?.role || 'Free';

    // 获取或创建会话
    let conv = null;
    if (conversationId) {
      conv = await findConversationById(conversationId);
    }

    if (!conv) {
      conv = await Conversation.create({
        userId,
        contextId: contextId || 'agent',
        name: query.substring(0, 50) + '...',
        mode: contextId?.startsWith('casual') ? 'casual' : contextId?.startsWith('standard') ? 'standard' : 'agent',
        tab: contextId?.replace('standard_', '') || null,
      });
    }

    // 保存用户消息
    await Message.create({
      conversationId: conv._id,
      userId,
      role: 'user',
      content: query,
      files: files?.map(f => ({ name: f.originalname, size: f.size })) || [],
    });

    let fullResponse = '';

    // 通过Agent引擎执行
    await agentExecute(
      {
        query,
        userId,
        userRole,
        skillSlug,
        contextId,
        conversationId: conv._id,
        difyConversationId: conv.difyConversationId || '',
        files: files || [],
        skillParams: skillParams ? JSON.parse(skillParams) : {},
      },
      {
        onChunk: (chunk) => {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        },
        onEnd: (newDifyConvId, generatedFiles) => {
          // 更新Dify会话ID
          if (newDifyConvId && !conv.difyConversationId) {
            conv.difyConversationId = newDifyConvId;
            conv.save();
          }

          // 保存助手消息
          Message.create({
            conversationId: conv._id,
            userId,
            role: 'assistant',
            content: fullResponse,
            generatedFiles,
          }).catch(err => console.error('[AgentChat] Failed to save message:', err));

          res.write(`data: ${JSON.stringify({
            type: 'end',
            conversationId: conv._id,
            generatedFiles,
          })}\n\n`);
          res.end();
        },
        onError: (error) => {
          console.error('[AgentChat] Error:', error);
          res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
          res.end();
        },
        onNodeChange: (nodeName) => {
          res.write(`data: ${JSON.stringify({ type: 'node', nodeName })}\n\n`);
        },
        onSkillSelected: (info) => {
          res.write(`data: ${JSON.stringify({ type: 'skill_selected', skill: info })}\n\n`);
        },
      }
    );
  } catch (error) {
    console.error('[AgentChat] Unhandled error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/agent/execute - 直接执行指定Skill（非聊天模式）
 * 用于Skill工作台一键执行
 */
router.post('/execute', auth, upload.array('files', 10), async (req, res) => {
  const { skillSlug, query, parameters } = req.body;
  const userId = req.userId;
  const files = req.files;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const user = await User.findById(userId);
    const userRole = user?.role || 'Free';

    let fullResponse = '';

    await agentExecute(
      {
        query,
        userId,
        userRole,
        skillSlug,
        files: files || [],
        skillParams: parameters ? JSON.parse(parameters) : {},
      },
      {
        onChunk: (chunk) => {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        },
        onEnd: (_, generatedFiles) => {
          res.write(`data: ${JSON.stringify({ type: 'end', generatedFiles })}\n\n`);
          res.end();
        },
        onError: (error) => {
          res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
          res.end();
        },
        onNodeChange: (nodeName) => {
          res.write(`data: ${JSON.stringify({ type: 'node', nodeName })}\n\n`);
        },
        onSkillSelected: (info) => {
          res.write(`data: ${JSON.stringify({ type: 'skill_selected', skill: info })}\n\n`);
        },
      }
    );
  } catch (error) {
    console.error('[AgentExecute] Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
