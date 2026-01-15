import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    index: true
  },

  // 基本信息
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'CNY'
  },
  purchaseUrl: {
    type: String,
    required: true
  },
  imageUrl: String,
  platform: String,

  // 详细信息
  category: String,
  brand: String,
  specifications: {
    type: Map,
    of: String
  },
  notes: String,

  // 元数据
  source: {
    type: String,
    enum: ['ai', 'manual', 'import'],
    default: 'manual'
  },
  tags: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },

  // 订单状态
  status: {
    type: String,
    enum: ['pending', 'ordered', 'purchased', 'cancelled'],
    default: 'pending'
  },
  orderDate: Date,
  orderQuantity: Number,

}, {
  timestamps: true
});

// 索引
productSchema.index({ userId: 1, status: 1 });
productSchema.index({ userId: 1, createdAt: -1 });
productSchema.index({ userId: 1, platform: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
