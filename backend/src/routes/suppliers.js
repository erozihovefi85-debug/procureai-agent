import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import Supplier from '../models/Supplier.js';
import * as XLSX from 'xlsx';

const router = express.Router();

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ==================== 基础 CRUD 接口 ====================

// 获取供应商列表
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      page = 1,
      limit = 20,
      search,
      status,
      tags,
      rating,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    // 构建查询条件
    const query = { userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'businessDirection': { $regex: search, $options: 'i' } },
        { 'contactInfo.person': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // 构建排序
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 执行查询
    const suppliers = await Supplier.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Supplier.countDocuments(query);

    res.json({
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 创建供应商
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // 验证必需字段
    if (!req.body.name) {
      return res.status(400).json({ message: '供应商名称不能为空' });
    }

    // 准备供应商数据
    const supplierData = {
      name: req.body.name,
      foundedDate: req.body.foundedDate || '',
      businessDirection: req.body.businessDirection || [],
      contactInfo: req.body.contactInfo || {},
      customerCases: req.body.customerCases || [],
      capabilities: req.body.capabilities || [],
      certifications: req.body.certifications || [],
      employeeCount: req.body.employeeCount,
      annualRevenue: req.body.annualRevenue,
      source: req.body.source || 'ai',
      tags: req.body.tags || [],
      rating: req.body.rating || 0,
      notes: req.body.notes || '',
      priority: req.body.priority || 'medium',
      status: req.body.status || 'active',
      interviewScheduled: req.body.interviewScheduled || false,
      interviewDate: req.body.interviewDate,
      interviewResult: req.body.interviewResult,
      interviewNotes: req.body.interviewNotes,
      userId,
    };

    // 只有在提供有效的conversationId时才添加
    if (req.body.conversationId && req.body.conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      supplierData.conversationId = req.body.conversationId;
    }

    console.log('Creating supplier with data:', JSON.stringify(supplierData, null, 2));

    const supplier = new Supplier(supplierData);
    await supplier.save();

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value
      })));
      return res.status(400).json({
        message: '数据验证失败：' + error.message,
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== 特殊路由（必须在 /:id 之前定义） ====================

// 批量创建供应商
router.post('/batch', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { suppliers } = req.body;

    if (!Array.isArray(suppliers)) {
      return res.status(400).json({ message: 'suppliers must be an array' });
    }

    const suppliersWithUserId = suppliers.map(s => ({
      ...s,
      userId,
    }));

    const result = await Supplier.insertMany(suppliersWithUserId, {
      ordered: false, // 允许部分失败
    });

    res.status(201).json({
      message: `Successfully created ${result.length} suppliers`,
      data: result,
    });
  } catch (error) {
    console.error('Batch create suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 批量删除供应商
router.post('/batch-delete', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'ids must be an array' });
    }

    const result = await Supplier.deleteMany({
      _id: { $in: ids },
      userId,
    });

    res.json({
      message: `Successfully deleted ${result.deletedCount} suppliers`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Batch delete suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 导入供应商（Excel）
router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 解析 Excel 文件
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // 转换数据格式
    const suppliers = data.map((row, index) => {
      // 尝试匹配各种可能的列名
      const supplier = {
        name: row['名称'] || row['name'] || row['供应商名称'] || `未命名供应商${index + 1}`,
        foundedDate: row['成立时间'] || row['foundedDate'] || '',
        businessDirection: [],
        contactInfo: {
          person: row['联系人'] || row['contact'] || row['person'] || '',
          phone: row['电话'] || row['phone'] || '',
          email: row['邮箱'] || row['email'] || '',
          wechat: row['微信'] || row['wechat'] || '',
          address: row['地址'] || row['address'] || '',
        },
        customerCases: [],
        capabilities: [],
        certifications: [],
        tags: [],
        source: 'import',
        notes: row['备注'] || row['notes'] || '',
      };

      // 处理业务方向（可能是逗号分隔的字符串）
      if (row['业务方向'] || row['businessDirection']) {
        const directionStr = row['业务方向'] || row['businessDirection'];
        supplier.businessDirection = directionStr.toString().split(/[,，、]/).filter(Boolean);
      }

      // 处理客户案例（简化处理）
      if (row['客户案例'] || row['customerCases']) {
        const casesStr = row['客户案例'] || row['customerCases'];
        supplier.customerCases = [{
          title: '案例',
          description: casesStr.toString(),
        }];
      }

      // 处理标签
      if (row['标签'] || row['tags']) {
        const tagsStr = row['标签'] || row['tags'];
        supplier.tags = tagsStr.toString().split(/[,，、]/).filter(Boolean);
      }

      return supplier;
    });

    // 批量插入
    const result = await Supplier.insertMany(
      suppliers.map(s => ({ ...s, userId })),
      { ordered: false }
    );

    res.status(201).json({
      message: `Successfully imported ${result.length} suppliers`,
      data: result,
      total: suppliers.length,
      imported: result.length,
      failed: suppliers.length - result.length,
    });
  } catch (error) {
    console.error('Import suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 导出供应商（Excel）
router.get('/export', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const suppliers = await Supplier.find({ userId }).sort({ updatedAt: -1 });

    // 转换为 Excel 格式
    const data = suppliers.map(s => ({
      '供应商名称': s.name,
      '成立时间': s.foundedDate,
      '业务方向': s.businessDirection.join(', '),
      '联系人': s.contactInfo.person,
      '电话': s.contactInfo.phone,
      '邮箱': s.contactInfo.email,
      '微信': s.contactInfo.wechat,
      '地址': s.contactInfo.address,
      '客户案例': s.customerCases.map(c => c.title).join(', '),
      '标签': s.tags.join(', '),
      '评分': s.rating,
      '备注': s.notes,
      '状态': s.status,
      '约谈状态': s.interviewScheduled ? '已安排' : '未安排',
      '约谈日期': s.interviewDate ? new Date(s.interviewDate).toLocaleDateString('zh-CN') : '',
      '创建时间': new Date(s.createdAt).toLocaleDateString('zh-CN'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '供应商');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=suppliers-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Export suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 获取供应商统计信息
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const [
      total,
      interviewScheduled,
      byStatus,
      byPriority,
      recentActivity,
    ] = await Promise.all([
      Supplier.countDocuments({ userId }),
      Supplier.countDocuments({ userId, interviewScheduled: true }),
      Supplier.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Supplier.aggregate([
        { $match: { userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Supplier.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('name updatedAt status'),
    ]);

    res.json({
      total,
      interviewScheduled,
      notInterviewed: total - interviewScheduled,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity,
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== 单个供应商操作（/:id 路由） ====================

// 获取单个供应商详情
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 更新供应商
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    Object.assign(supplier, req.body);
    await supplier.save();

    res.json(supplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// 删除供应商
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 安排约谈
router.post('/:id/interview', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { interviewDate, notes } = req.body;

    const supplier = await Supplier.findOne({
      _id: req.params.id,
      userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    supplier.interviewScheduled = true;
    supplier.interviewDate = interviewDate ? new Date(interviewDate) : null;
    supplier.interviewNotes = notes || '';
    supplier.status = 'contacted';
    await supplier.save();

    res.json(supplier);
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 更新约谈结果
router.put('/:id/interview-result', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { result, notes, newStatus } = req.body;

    const supplier = await Supplier.findOne({
      _id: req.params.id,
      userId,
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    supplier.interviewResult = result;
    supplier.interviewNotes = notes;
    if (newStatus) {
      supplier.status = newStatus;
    }
    await supplier.save();

    res.json(supplier);
  } catch (error) {
    console.error('Update interview result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
