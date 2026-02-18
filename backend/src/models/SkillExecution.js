import mongoose from 'mongoose';

/**
 * SkillExecution Schema - 技能执行记录
 * 记录每次Skill调用的输入、输出、状态和统计信息
 */
const skillExecutionSchema = new mongoose.Schema({
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },

  // 执行内容
  input: {
    query: String,
    parameters: mongoose.Schema.Types.Mixed,
    files: [{ name: String, size: Number, type: String }],
  },
  output: {
    content: String,
    format: { type: String, enum: ['text', 'markdown', 'json', 'table', 'file'] },
    generatedFiles: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed,
  },

  // 执行状态
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  error: String,

  // 性能指标
  startedAt: Date,
  completedAt: Date,
  duration: Number, // in milliseconds
  tokensUsed: Number,
  creditsUsed: { type: Number, default: 1 },
}, {
  timestamps: true,
});

// 索引
skillExecutionSchema.index({ userId: 1, createdAt: -1 });
skillExecutionSchema.index({ skillId: 1, createdAt: -1 });
skillExecutionSchema.index({ status: 1 });

export default mongoose.model('SkillExecution', skillExecutionSchema);
