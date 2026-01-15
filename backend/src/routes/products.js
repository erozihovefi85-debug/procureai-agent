import express from 'express';
const router = express.Router();
import Product from '../models/Product.js';
import { auth } from '../middleware/auth.js';

// 应用认证中间件到所有路由
router.use(auth);

// ==================== 基础 CRUD ====================

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      search,
      status,
      platform,
      category,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // 构建查询条件
    const query = { userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (platform) {
      query.platform = platform;
    }

    if (category) {
      query.category = category;
    }

    // 构建排序
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // 执行查询
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: '获取商品列表失败' });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const product = await Product.findOne({ _id: req.params.id, userId });

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: '获取商品失败' });
  }
});

// 创建商品
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const productData = {
      ...req.body,
      userId
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: '创建商品失败' });
  }
});

// 更新商品
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: '更新商品失败' });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const product = await Product.findOneAndDelete({ _id: req.params.id, userId });

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: '删除商品失败' });
  }
});

// ==================== 批量操作 ====================

// 批量创建商品
router.post('/batch', async (req, res) => {
  try {
    const userId = req.user.id;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: '商品列表格式错误' });
    }

    const productsWithUserId = products.map(p => ({ ...p, userId }));
    const result = await Product.insertMany(productsWithUserId);

    res.status(201).json({
      message: `成功创建 ${result.length} 个商品`,
      imported: result.length
    });
  } catch (error) {
    console.error('Batch create error:', error);
    res.status(500).json({ error: '批量创建失败' });
  }
});

// 批量删除商品
router.post('/batch-delete', async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'ID列表格式错误' });
    }

    const result = await Product.deleteMany({ _id: { $in: ids }, userId });

    res.json({
      message: `成功删除 ${result.deletedCount} 个商品`,
      deleted: result.deletedCount
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    res.status(500).json({ error: '批量删除失败' });
  }
});

// ==================== 统计 ====================

// 获取统计概览
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      total,
      statusCounts,
      totalValue,
      priorityCounts,
      recentActivity
    ] = await Promise.all([
      // 总数
      Product.countDocuments({ userId }),

      // 按状态统计
      Product.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 总价值
      Product.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),

      // 按优先级统计(使用 rating)
      Product.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              high: { $cond: [{ $gte: ['$rating', 4] }, 'high', null] },
              medium: { $cond: [{ $and: [{ $gte: ['$rating', 3] }, { $lt: ['$rating', 4] }] }, 'medium', null] },
              low: { $cond: [{ $lt: ['$rating', 3] }, 'low', null] }
            },
            count: { $sum: 1 }
          }
        }
      ]),

      // 最近活动
      Product.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('_id name updatedAt status')
    ]);

    // 处理状态统计
    const byStatus = {
      pending: 0,
      ordered: 0,
      purchased: 0,
      cancelled: 0
    };
    statusCounts.forEach(item => {
      byStatus[item._id] = item.count;
    });

    // 处理优先级统计
    const byPriority = {
      high: 0,
      medium: 0,
      low: 0
    };
    priorityCounts.forEach(item => {
      if (item._id.high) byPriority.high = item.count;
      if (item._id.medium) byPriority.medium = item.count;
      if (item._id.low) byPriority.low = item.count;
    });

    res.json({
      total,
      ordered: byStatus.ordered,
      purchased: byStatus.purchased,
      pending: byStatus.pending,
      totalValue: totalValue[0]?.total || 0,
      byStatus,
      byPriority,
      recentActivity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

// ==================== 订单状态更新 ====================

// 更新订单状态
router.put('/:id/status', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, orderDate, orderQuantity } = req.body;

    const updateData = { status };
    if (orderDate) updateData.orderDate = new Date(orderDate);
    if (orderQuantity) updateData.orderQuantity = orderQuantity;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: '更新状态失败' });
  }
});

export default router;
