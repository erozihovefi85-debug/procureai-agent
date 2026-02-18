import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { getSkillSummaries, getSkillBySlug } from './skillRegistry.js';
import { executeSkill } from './skillExecutor.js';

/**
 * Agent Engine - 核心智能体引擎
 *
 * 基于LangChain.js实现的单Agent + 多Skill架构。
 * Agent负责：
 * 1. 理解用户意图
 * 2. 选择合适的Skill
 * 3. 调度Skill执行
 * 4. 整合返回结果
 *
 * 两种模式：
 * - agent: Agent自主决策调用哪个Skill（智能路由）
 * - direct: 直接指定Skill执行（跳过Agent路由）
 */

const AGENT_SYSTEM_PROMPT = `你是ProcureAI智能采购助手的核心调度Agent。你的职责是理解用户意图并选择最合适的技能(Skill)来处理请求。

## 可用技能
{{skills}}

## 决策规则
1. 仔细分析用户的输入，判断他们想要完成什么任务
2. 选择最匹配的技能来处理这个请求
3. 如果用户的请求不明确，请选择最可能的技能并说明原因
4. 如果没有合适的技能，返回 skill_slug 为 "none"

## 响应格式
严格按照以下JSON格式响应，不要添加任何其他内容：
{
  "skill_slug": "技能的slug标识",
  "confidence": 0.0到1.0之间的置信度,
  "reasoning": "选择该技能的简短理由",
  "refined_query": "优化后传给技能的查询内容（保留用户原意但更精确）"
}`;

/**
 * 创建LLM实例用于Agent路由决策
 */
const createRoutingLLM = () => {
  const apiBase = process.env.SILICONFLOW_API_BASE || 'https://api.siliconflow.cn/v1';
  const apiKey = process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    console.warn('[AgentEngine] SILICONFLOW_API_KEY not configured, agent routing disabled');
    return null;
  }

  return new ChatOpenAI({
    model: 'Qwen/Qwen2.5-72B-Instruct',
    temperature: 0.1, // 低温度确保路由决策的一致性
    maxTokens: 512,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: apiBase,
    },
  });
};

/**
 * Agent路由 - 根据用户输入自动选择最佳Skill
 *
 * @param {string} query - 用户输入
 * @param {string} userRole - 用户角色
 * @param {string} contextHint - 上下文提示（如当前页面模式）
 * @returns {Object} { skillSlug, confidence, reasoning, refinedQuery }
 */
export const routeToSkill = async (query, userRole = 'Free', contextHint = '') => {
  const llm = createRoutingLLM();

  // 如果LLM不可用，使用基于规则的路由
  if (!llm) {
    return ruleBasedRouting(query, contextHint);
  }

  try {
    const skills = await getSkillSummaries(userRole);

    if (skills.length === 0) {
      return { skillSlug: 'none', confidence: 0, reasoning: 'No skills available', refinedQuery: query };
    }

    const skillsDescription = skills.map(s =>
      `- **${s.name}** (slug: ${s.slug}): ${s.description} [分类: ${s.category}]`
    ).join('\n');

    const systemPrompt = AGENT_SYSTEM_PROMPT.replace('{{skills}}', skillsDescription);

    let userMessage = query;
    if (contextHint) {
      userMessage = `[当前上下文: ${contextHint}]\n\n${query}`;
    }

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userMessage),
    ]);

    // 解析Agent的路由决策
    const content = response.content.trim();
    try {
      // 尝试提取JSON（可能被包裹在markdown代码块中）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const decision = JSON.parse(jsonMatch[0]);
        return {
          skillSlug: decision.skill_slug || 'none',
          confidence: decision.confidence || 0,
          reasoning: decision.reasoning || '',
          refinedQuery: decision.refined_query || query,
        };
      }
    } catch (parseError) {
      console.warn('[AgentEngine] Failed to parse routing decision:', parseError.message);
    }

    // JSON解析失败，回退到规则路由
    return ruleBasedRouting(query, contextHint);
  } catch (error) {
    console.error('[AgentEngine] Routing error:', error.message);
    return ruleBasedRouting(query, contextHint);
  }
};

/**
 * 基于规则的路由（fallback）
 */
const ruleBasedRouting = (query, contextHint = '') => {
  const lowerQuery = query.toLowerCase();

  // 上下文优先
  if (contextHint) {
    const contextMap = {
      'casual': 'casual-shopping',
      'casual_main': 'casual-shopping',
      'standard_keyword': 'requirement-extraction',
      'standard_docgen': 'document-generation',
      'standard_supplier': 'supplier-matching',
      'standard_price': 'price-analysis',
    };
    if (contextMap[contextHint]) {
      return {
        skillSlug: contextMap[contextHint],
        confidence: 0.9,
        reasoning: '基于当前上下文自动路由',
        refinedQuery: query,
      };
    }
  }

  // 关键词匹配
  const rules = [
    { keywords: ['供应商', '厂家', '厂商', '找供应商', '匹配供应商'], slug: 'supplier-matching' },
    { keywords: ['价格', '比价', '成本', '行情', '报价', '价格分析'], slug: 'price-analysis' },
    { keywords: ['文档', '合同', '申请', 'PR', 'RFQ', '标书', '生成文档'], slug: 'document-generation' },
    { keywords: ['采购', '需求', '清单', '规格', '品类', '采购需求'], slug: 'requirement-extraction' },
    { keywords: ['买', '推荐', '哪里买', '便宜', '性价比', '购物'], slug: 'casual-shopping' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(kw => lowerQuery.includes(kw))) {
      return {
        skillSlug: rule.slug,
        confidence: 0.7,
        reasoning: `关键词匹配: ${rule.keywords.find(kw => lowerQuery.includes(kw))}`,
        refinedQuery: query,
      };
    }
  }

  // 默认使用智能购物助手
  return {
    skillSlug: 'casual-shopping',
    confidence: 0.3,
    reasoning: '未匹配到特定技能，使用默认助手',
    refinedQuery: query,
  };
};

/**
 * Agent执行入口（流式）
 *
 * @param {Object} params
 * @param {string} params.query - 用户输入
 * @param {string} params.userId - 用户ID
 * @param {string} params.userRole - 用户角色
 * @param {string} params.skillSlug - 指定技能slug（直接模式）
 * @param {string} params.contextId - 上下文ID（兼容旧模式）
 * @param {string} params.conversationId - 会话ID
 * @param {string} params.difyConversationId - Dify会话ID
 * @param {Array} params.files - 上传的文件
 * @param {Object} params.skillParams - 技能参数
 * @param {Object} callbacks - { onChunk, onEnd, onError, onNodeChange, onSkillSelected }
 */
export const agentExecute = async (params, callbacks) => {
  const {
    query, userId, userRole = 'Free',
    skillSlug, contextId,
    conversationId, difyConversationId,
    files = [], skillParams = {},
  } = params;
  const { onChunk, onEnd, onError, onNodeChange, onSkillSelected } = callbacks;

  let targetSkill = null;

  // 1. 确定目标Skill
  if (skillSlug) {
    // 直接模式：指定了具体的Skill
    targetSkill = await getSkillBySlug(skillSlug);
    if (!targetSkill) {
      onError(`Skill not found: ${skillSlug}`);
      return;
    }
    onSkillSelected?.({ slug: skillSlug, name: targetSkill.name, mode: 'direct' });
  } else if (contextId) {
    // 兼容模式：使用contextId映射到Skill
    const contextMap = {
      'casual_main': 'casual-shopping',
      'standard_keyword': 'requirement-extraction',
      'standard_docgen': 'document-generation',
      'standard_supplier': 'supplier-matching',
      'standard_price': 'price-analysis',
    };
    const slug = contextMap[contextId];
    if (slug) {
      targetSkill = await getSkillBySlug(slug);
    }
    if (targetSkill) {
      onSkillSelected?.({ slug: targetSkill.slug, name: targetSkill.name, mode: 'context' });
    }
  }

  if (!targetSkill) {
    // Agent模式：智能路由
    onNodeChange?.('分析意图中...');

    const routingResult = await routeToSkill(query, userRole, contextId);

    if (routingResult.skillSlug === 'none') {
      // 无合适技能，使用通用回复
      onChunk('抱歉，我暂时无法处理这个请求。请尝试更具体地描述您的需求，或者直接选择一个技能来使用。');
      onEnd(null, null);
      return;
    }

    targetSkill = await getSkillBySlug(routingResult.skillSlug);
    if (!targetSkill) {
      onChunk('抱歉，所需技能暂不可用。请稍后重试。');
      onEnd(null, null);
      return;
    }

    onSkillSelected?.({
      slug: targetSkill.slug,
      name: targetSkill.name,
      mode: 'agent',
      confidence: routingResult.confidence,
      reasoning: routingResult.reasoning,
    });

    // 使用优化后的查询（如果Agent进行了优化）
    if (routingResult.refinedQuery && routingResult.refinedQuery !== query) {
      params.query = routingResult.refinedQuery;
    }
  }

  // 2. 执行Skill
  onNodeChange?.(`执行: ${targetSkill.name}`);

  await executeSkill(targetSkill, {
    ...params,
    query: params.query || query,
  }, callbacks);
};

export default { routeToSkill, agentExecute };
