import Skill from '../models/Skill.js';

/**
 * Skill Registry - 技能注册中心
 * 管理所有内置和自定义技能的注册、发现和加载
 */

// 内置技能定义 - 封装现有Dify工作流
const BUILTIN_SKILLS = [
  {
    name: '智能购物助手',
    slug: 'casual-shopping',
    description: 'AI找出全网真实评价与低价好货，智能比价、推荐商品，帮你做出最佳购买决策',
    icon: 'shopping',
    color: '#3B82F6',
    category: 'general',
    type: 'builtin',
    config: {
      difyContextId: 'casual_main',
      difyApiKey: 'DIFY_API_KEY_CASUAL',
    },
    parameters: [
      { name: 'query', label: '购买需求', type: 'text', required: true, placeholder: '描述你想买什么...' },
    ],
    outputFormat: 'markdown',
    visibility: 'public',
    allowedRoles: ['Free', 'PLUS', 'PRO', 'ADMIN'],
    featured: true,
  },
  {
    name: '采购需求提取',
    slug: 'requirement-extraction',
    description: '智能分析采购需求，自动细化品类、数量、规格等关键信息，生成结构化采购清单',
    icon: 'clipboard',
    color: '#10B981',
    category: 'procurement',
    type: 'builtin',
    config: {
      difyContextId: 'standard_keyword',
      difyApiKey: 'DIFY_API_KEY_KEYWORD',
    },
    parameters: [
      { name: 'query', label: '采购需求描述', type: 'text', required: true, placeholder: '详细描述采购需求...' },
    ],
    outputFormat: 'markdown',
    visibility: 'public',
    allowedRoles: ['PLUS', 'PRO', 'ADMIN'],
    featured: true,
  },
  {
    name: '采购文档生成',
    slug: 'document-generation',
    description: '基于需求自动生成标准采购文档（PR/RFQ），支持多种模板格式输出',
    icon: 'document',
    color: '#8B5CF6',
    category: 'document',
    type: 'builtin',
    config: {
      difyContextId: 'standard_docgen',
      difyApiKey: 'DIFY_API_KEY_DOCGEN',
    },
    parameters: [
      { name: 'query', label: '文档需求', type: 'text', required: true, placeholder: '描述需要生成的文档...' },
    ],
    outputFormat: 'markdown',
    visibility: 'public',
    allowedRoles: ['PLUS', 'PRO', 'ADMIN'],
    featured: true,
  },
  {
    name: '供应商智能匹配',
    slug: 'supplier-matching',
    description: '根据采购需求智能匹配优质供应商，提供资质分析、能力评估和推荐报告',
    icon: 'users',
    color: '#F59E0B',
    category: 'supplier',
    type: 'builtin',
    config: {
      difyContextId: 'standard_supplier',
      difyApiKey: 'DIFY_API_KEY_SUPPLIER',
    },
    parameters: [
      { name: 'query', label: '供应商需求', type: 'text', required: true, placeholder: '描述供应商匹配需求...' },
    ],
    outputFormat: 'markdown',
    visibility: 'public',
    allowedRoles: ['PLUS', 'PRO', 'ADMIN'],
    featured: true,
  },
  {
    name: '价格分析比较',
    slug: 'price-analysis',
    description: '历史价格趋势分析、市场行情比价、成本构成拆解，辅助采购决策',
    icon: 'chart',
    color: '#EF4444',
    category: 'analysis',
    type: 'builtin',
    config: {
      difyContextId: 'standard_price',
      difyApiKey: 'DIFY_API_KEY_PRICE',
    },
    parameters: [
      { name: 'query', label: '分析需求', type: 'text', required: true, placeholder: '描述价格分析需求...' },
    ],
    outputFormat: 'markdown',
    visibility: 'public',
    allowedRoles: ['PLUS', 'PRO', 'ADMIN'],
    featured: true,
  },
];

/**
 * 初始化内置技能 - 在应用启动时调用
 * 使用 upsert 确保内置技能始终存在且是最新的
 */
export const initBuiltinSkills = async () => {
  console.log('[SkillRegistry] Initializing builtin skills...');

  for (const skillDef of BUILTIN_SKILLS) {
    try {
      await Skill.findOneAndUpdate(
        { slug: skillDef.slug },
        { $set: { ...skillDef, enabled: true } },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`[SkillRegistry] Failed to init skill ${skillDef.slug}:`, error.message);
    }
  }

  const count = await Skill.countDocuments({ type: 'builtin' });
  console.log(`[SkillRegistry] ${count} builtin skills initialized`);
};

/**
 * 获取用户可用的技能列表
 */
export const getAvailableSkills = async (userId, userRole = 'Free') => {
  const query = {
    enabled: true,
    $or: [
      { visibility: 'public' },
      { visibility: 'shared' },
      { owner: userId },
    ],
  };

  const skills = await Skill.find(query).sort({ featured: -1, usageCount: -1 });

  // 过滤角色权限
  return skills.filter(skill => {
    if (!skill.allowedRoles || skill.allowedRoles.length === 0) return true;
    return skill.allowedRoles.includes(userRole);
  });
};

/**
 * 根据slug获取技能
 */
export const getSkillBySlug = async (slug) => {
  return await Skill.findOne({ slug, enabled: true });
};

/**
 * 获取技能列表（用于Agent路由决策）
 */
export const getSkillSummaries = async (userRole = 'Free') => {
  const skills = await Skill.find({ enabled: true, visibility: 'public' })
    .select('name slug description category type parameters')
    .lean();

  return skills
    .filter(s => !s.allowedRoles || s.allowedRoles.length === 0 || s.allowedRoles.includes(userRole))
    .map(s => ({
      name: s.name,
      slug: s.slug,
      description: s.description,
      category: s.category,
      parameters: (s.parameters || []).map(p => ({ name: p.name, label: p.label, type: p.type, required: p.required })),
    }));
};

export default {
  initBuiltinSkills,
  getAvailableSkills,
  getSkillBySlug,
  getSkillSummaries,
  BUILTIN_SKILLS,
};
