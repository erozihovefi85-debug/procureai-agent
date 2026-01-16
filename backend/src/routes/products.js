import express from 'express';
import ExcelJS from 'exceljs';
import multer from 'multer';
const router = express.Router();
import Product from '../models/Product.js';
import { auth } from '../middleware/auth.js';

// 配置 multer 用于文件上传
const upload = multer({ dest: 'uploads/' });

// 应用认证中间件到所有路由
router.use(auth);

// ==================== 特殊路由（必须在 /:id 之前） ====================

// 导出商品到 Excel
router.get('/export', async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await Product.find({ userId }).sort({ createdAt: -1 });

    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('商品心愿单');

    // 设置列
    worksheet.columns = [
      { header: '商品名称', key: 'name', width: 30 },
      { header: '品牌', key: 'brand', width: 15 },
      { header: '型号', key: 'model', width: 15 },
      { header: '价格', key: 'price', width: 12 },
      { header: '货币', key: 'currency', width: 8 },
      { header: '状态', key: 'status', width: 10 },
      { header: '优先级', key: 'rating', width: 10 },
      { header: '平台', key: 'platform', width: 15 },
      { header: '商品链接', key: 'url', width: 40 },
      { header: '图片链接', key: 'imageUrl', width: 40 },
      { header: '描述', key: 'description', width: 30 },
      { header: '分类', key: 'category', width: 15 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    // 添加数据
    products.forEach(product => {
      worksheet.addRow({
        name: product.name || '',
        brand: product.brand || '',
        model: product.model || '',
        price: product.price || 0,
        currency: product.currency || 'CNY',
        status: product.status || 'pending',
        rating: product.rating || 3,
        platform: product.platform || '',
        url: product.url || '',
        imageUrl: product.imageUrl || '',
        description: product.description || '',
        category: product.category || '',
        createdAt: product.createdAt ? new Date(product.createdAt).toLocaleString('zh-CN') : '',
      });
    });

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // 生成 buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=products-${Date.now()}.xlsx`);

    res.send(buffer);
  } catch (error) {
    console.error('Export products error:', error);
    res.status(500).json({ error: '导出失败' });
  }
});

// 从 Excel 导入商品
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const worksheet = workbook.worksheets[0];
    const products = [];

    // 跳过表头，从第2行开始
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // 跳过表头

      const product = {
        name: row.getCell(1).value || '',
        brand: row.getCell(2).value || '',
        model: row.getCell(3).value || '',
        price: parseFloat(row.getCell(4).value) || 0,
        currency: row.getCell(5).value || 'CNY',
        status: row.getCell(6).value || 'pending',
        rating: parseInt(row.getCell(7).value) || 3,
        platform: row.getCell(8).value || '',
        url: row.getCell(9).value || '',
        imageUrl: row.getCell(10).value || '',
        description: row.getCell(11).value || '',
        category: row.getCell(12).value || '',
        userId,
      };

      if (product.name) {
        products.push(product);
      }
    });

    // 批量插入
    const result = await Product.insertMany(products);

    res.json({
      message: `成功导入 ${result.length} 个商品`,
      imported: result.length
    });
  } catch (error) {
    console.error('Import products error:', error);
    res.status(500).json({ error: '导入失败' });
  }
});

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
    console.log('[Create Product] Request body:', JSON.stringify(req.body, null, 2));

    const productData = {
      ...req.body,
      userId
    };

    console.log('[Create Product] Product data:', JSON.stringify(productData, null, 2));

    const product = new Product(productData);
    await product.save();

    console.log('[Create Product] Success:', product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error('[Create Product] Error:', error);

    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      console.error('[Create Product] Validation errors:', messages);
      return res.status(400).json({ error: messages.join(', ') });
    }

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
