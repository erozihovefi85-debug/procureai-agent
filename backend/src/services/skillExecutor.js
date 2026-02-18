import axios from 'axios';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import Skill from '../models/Skill.js';
import SkillExecution from '../models/SkillExecution.js';
import { streamChatMessage, getApiKey, uploadFile } from './difyService.js';

/**
 * Skill Executor - 技能执行器
 * 负责执行不同类型的Skill，支持流式输出
 */

/**
 * 执行一个Skill（流式）
 * @param {Object} skill - Skill文档
 * @param {Object} params - 执行参数
 * @param {Object} callbacks - 回调函数 { onChunk, onEnd, onError, onNodeChange }
 */
export const executeSkill = async (skill, params, callbacks) => {
  const { userId, query, conversationId, files = [], difyConversationId } = params;
  const { onChunk, onEnd, onError, onNodeChange } = callbacks;

  // 创建执行记录
  const execution = await SkillExecution.create({
    skillId: skill._id,
    userId,
    conversationId,
    input: { query, parameters: params.parameters, files: files.map(f => ({ name: f.name || f.originalname, size: f.size })) },
    status: 'running',
    startedAt: new Date(),
  });

  try {
    switch (skill.type) {
      case 'builtin':
        await executeDifySkill(skill, params, callbacks, execution);
        break;
      case 'custom':
        await executeCustomSkill(skill, params, callbacks, execution);
        break;
      case 'api':
        await executeApiSkill(skill, params, callbacks, execution);
        break;
      default:
        throw new Error(`Unknown skill type: ${skill.type}`);
    }

    // 更新使用统计
    await Skill.findByIdAndUpdate(skill._id, {
      $inc: { usageCount: 1 },
      lastUsedAt: new Date(),
    });
  } catch (error) {
    execution.status = 'failed';
    execution.error = error.message;
    execution.completedAt = new Date();
    execution.duration = Date.now() - execution.startedAt.getTime();
    await execution.save();

    onError(error.message);
  }
};

/**
 * 执行Dify内置技能（流式）
 */
const executeDifySkill = async (skill, params, callbacks, execution) => {
  const { userId, query, files = [], difyConversationId } = params;
  const { onChunk, onEnd, onError, onNodeChange } = callbacks;

  const contextId = skill.config.difyContextId;
  const apiKey = getApiKey(contextId);

  // 上传文件到Dify
  let uploadedFiles = [];
  if (files && files.length > 0) {
    uploadedFiles = await Promise.all(
      files.map(async (f) => {
        const fileBuffer = Buffer.from(f.buffer);
        const file = new File([fileBuffer], f.originalname, { type: f.mimetype });
        return await uploadFile(file, userId);
      })
    );
  }

  let fullResponse = '';

  await streamChatMessage(
    query,
    difyConversationId || '',
    uploadedFiles,
    userId,
    apiKey,
    (chunk) => {
      fullResponse += chunk;
      onChunk(chunk);
    },
    (newDifyConvId, generatedFiles) => {
      // 更新执行记录
      execution.status = 'completed';
      execution.output = { content: fullResponse, format: 'markdown', generatedFiles };
      execution.completedAt = new Date();
      execution.duration = Date.now() - execution.startedAt.getTime();
      execution.save().catch(err => console.error('[SkillExecutor] Failed to save execution:', err));

      onEnd(newDifyConvId, generatedFiles);
    },
    (error) => {
      execution.status = 'failed';
      execution.error = error;
      execution.completedAt = new Date();
      execution.duration = Date.now() - execution.startedAt.getTime();
      execution.save().catch(err => console.error('[SkillExecutor] Failed to save execution:', err));

      onError(error);
    },
    onNodeChange
  );
};

/**
 * 执行自定义技能（流式，使用LangChain LLM）
 */
const executeCustomSkill = async (skill, params, callbacks, execution) => {
  const { query, parameters = {} } = params;
  const { onChunk, onEnd, onError } = callbacks;

  const config = skill.config || {};
  const apiBase = process.env.SILICONFLOW_API_BASE || 'https://api.siliconflow.cn/v1';
  const apiKey = process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    throw new Error('SILICONFLOW_API_KEY not configured');
  }

  // 构建提示词
  let systemPrompt = config.systemPrompt || '';

  // 替换参数占位符
  for (const [key, value] of Object.entries(parameters)) {
    systemPrompt = systemPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }

  const model = new ChatOpenAI({
    model: config.model || 'Qwen/Qwen2.5-72B-Instruct',
    temperature: config.temperature || 0.7,
    maxTokens: config.maxTokens || 4096,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: apiBase,
    },
    streaming: true,
  });

  let fullResponse = '';

  try {
    const messages = [];
    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    messages.push(new HumanMessage(query));

    const stream = await model.stream(messages);

    for await (const chunk of stream) {
      const text = chunk.content;
      if (text) {
        fullResponse += text;
        onChunk(text);
      }
    }

    // 完成
    execution.status = 'completed';
    execution.output = { content: fullResponse, format: skill.outputFormat || 'markdown' };
    execution.completedAt = new Date();
    execution.duration = Date.now() - execution.startedAt.getTime();
    await execution.save();

    onEnd(null, null);
  } catch (error) {
    throw error;
  }
};

/**
 * 执行API调用技能
 */
const executeApiSkill = async (skill, params, callbacks, execution) => {
  const { query, parameters = {} } = params;
  const { onChunk, onEnd, onError } = callbacks;

  const config = skill.config || {};

  if (!config.apiEndpoint) {
    throw new Error('API endpoint not configured for this skill');
  }

  // 构建请求体
  let body = config.apiBodyTemplate || '{"query": "{{query}}"}';
  body = body.replace(/\{\{query\}\}/g, query);
  for (const [key, value] of Object.entries(parameters)) {
    body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }

  try {
    const response = await axios({
      method: config.apiMethod || 'POST',
      url: config.apiEndpoint,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiHeaders || {}),
      },
      data: JSON.parse(body),
      timeout: 30000,
    });

    // 提取结果
    let result = response.data;
    if (config.responseMapping) {
      // 简单的点分路径提取
      const paths = config.responseMapping.split('.');
      for (const path of paths) {
        result = result?.[path];
      }
    }

    const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

    // API技能不支持流式，一次性返回
    onChunk(content);

    execution.status = 'completed';
    execution.output = { content, format: skill.outputFormat || 'json' };
    execution.completedAt = new Date();
    execution.duration = Date.now() - execution.startedAt.getTime();
    await execution.save();

    onEnd(null, null);
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
};

export default { executeSkill };
