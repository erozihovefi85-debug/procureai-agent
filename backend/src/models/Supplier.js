import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  // 所属用户
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // 关联的对话（可选，记录来源）
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },

  // 基本信息
  name: {
    type: String,
    required: true,
    trim: true
  },
  foundedDate: {
    type: String,
    trim: true
  },
  businessDirection: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    person: String,          // 联系人
    phone: String,           // 电话
    email: String,           // 邮箱
    wechat: String,          // 微信号
    address: String          // 地址
  },

  // 详细信息
  customerCases: [{
    title: String,
    description: String,
    year: String
  }],

  // 能力和资质
  capabilities: [String],    // 核心能力
  certifications: [String],  // 资质认证
  employeeCount: String,     // 员工规模
  annualRevenue: String,     // 年营业额

  // 元数据
  source: {
    type: String,
    enum: ['ai', 'manual', 'import'],
    default: 'manual'
  },
  tags: [String],            // 自定义标签
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: String,             // 备注

  // 约谈状态
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: Date,
  interviewResult: String,   // 约谈结果记录
  interviewNotes: String,    // 约谈备注

  // 优先级（用于排序）
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },

  // 状态
  status: {
    type: String,
    enum: ['active', 'contacted', 'in_discussion', 'partner', 'inactive'],
    default: 'active'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
supplierSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 复合索引
supplierSchema.index({ userId: 1, name: 1 });
supplierSchema.index({ userId: 1, status: 1 });
supplierSchema.index({ userId: 1, tags: 1 });

export default mongoose.model('Supplier', supplierSchema);
