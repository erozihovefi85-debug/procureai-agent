import mongoose from 'mongoose';

/**
 * Skill Schema - 技能/插件定义
 *
 * Skill类型:
 * - builtin: 内置技能（封装现有Dify工作流）
 * - custom: 用户自定义技能（低代码配置）
 * - api: 外部API调用技能
 */

const parameterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['string', 'number', 'boolean', 'select', 'file', 'text'], default: 'string' },
  required: { type: Boolean, default: false },
  defaultValue: mongoose.Schema.Types.Mixed,
  placeholder: String,
  description: String,
  options: [{ label: String, value: String }], // for select type
}, { _id: false });

const skillSchema = new mongoose.Schema({
  // 基本信息
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'default' },
  color: { type: String, default: '#3B82F6' },
  category: {
    type: String,
    enum: ['procurement', 'analysis', 'document', 'supplier', 'general', 'custom'],
    default: 'custom'
  },

  // 技能类型
  type: {
    type: String,
    enum: ['builtin', 'custom', 'api'],
    required: true
  },

  // 技能配置
  config: {
    // 对于 builtin (Dify) 类型
    difyContextId: String,   // 对应的Dify应用上下文ID
    difyApiKey: String,      // 对应的Dify API Key（环境变量名）

    // 对于 custom 类型
    systemPrompt: String,    // 系统提示词
    model: { type: String, default: 'Qwen/Qwen2.5-72B-Instruct' },
    temperature: { type: Number, default: 0.7 },
    maxTokens: { type: Number, default: 4096 },

    // 对于 api 类型
    apiEndpoint: String,
    apiMethod: { type: String, enum: ['GET', 'POST', 'PUT'], default: 'POST' },
    apiHeaders: mongoose.Schema.Types.Mixed,
    apiBodyTemplate: String, // JSON template with {{param}} placeholders
    responseMapping: String, // JSONPath expression for extracting result
  },

  // 输入参数定义
  parameters: [parameterSchema],

  // 输出配置
  outputFormat: {
    type: String,
    enum: ['text', 'markdown', 'json', 'table', 'file'],
    default: 'markdown'
  },

  // 权限与可见性
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: {
    type: String,
    enum: ['public', 'private', 'shared'],
    default: 'private'
  },
  allowedRoles: [{ type: String, enum: ['Free', 'PLUS', 'PRO', 'ADMIN'] }],

  // 状态
  enabled: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },

  // 使用统计
  usageCount: { type: Number, default: 0 },
  lastUsedAt: Date,

  // 版本管理
  version: { type: String, default: '1.0.0' },
}, {
  timestamps: true,
});

// 索引
skillSchema.index({ slug: 1 }, { unique: true });
skillSchema.index({ type: 1, enabled: 1 });
skillSchema.index({ owner: 1 });
skillSchema.index({ category: 1 });
skillSchema.index({ visibility: 1 });

export default mongoose.model('Skill', skillSchema);
