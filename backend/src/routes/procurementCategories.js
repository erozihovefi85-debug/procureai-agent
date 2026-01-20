import express from 'express';
import multer from 'multer';
import { auth, adminAuth } from '../middleware/auth.js';
import ProcurementCategory from '../models/ProcurementCategory.js';
import * as XLSX from 'xlsx';

const router = express.Router();

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * 获取所有采购品类模板
 * GET /api/procurement-categories
 */
router.get('/', auth, async (req, res) => {
  try {
    const { enabled = 'true' } = req.query;

    const query = {
      ...(enabled === 'true' ? { enabled: true } : {}),
    };

    const categories = await ProcurementCategory.find(query)
      .sort({ priority: 1, name: 1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('[Procurement Categories] Get error:', error);
    res.status(500).json({ success: false, message: '获取品类模板失败' });
  }
});

/**
 * 获取单个品类模板详情
 * GET /api/procurement-categories/:id
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await ProcurementCategory.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!category) {
      return res.status(404).json({ success: false, message: '品类模板不存在' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('[Procurement Categories] Get detail error:', error);
    res.status(500).json({ success: false, message: '获取品类模板详情失败' });
  }
});

/**
 * 根据代码获取品类模板
 * GET /api/procurement-categories/code/:code
 */
router.get('/code/:code', auth, async (req, res) => {
  try {
    const category = await ProcurementCategory.findOne({
      code: req.params.code.toLowerCase(),
      enabled: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: '品类模板不存在' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('[Procurement Categories] Get by code error:', error);
    res.status(500).json({ success: false, message: '获取品类模板失败' });
  }
});

/**
 * 创建品类模板（仅管理员）
 * POST /api/procurement-categories
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      keywords,
      templateConfig,
      identificationPrompt,
      priority,
    } = req.body;

    // 验证必填字段
    if (!name || !code) {
      return res.status(400).json({ success: false, message: '品类名称和代码不能为空' });
    }

    // 检查代码是否已存在
    const existing = await ProcurementCategory.findOne({
      code: code.toLowerCase(),
    });

    if (existing) {
      return res.status(400).json({ success: false, message: '品类代码已存在' });
    }

    const category = await ProcurementCategory.create({
      name,
      code: code.toLowerCase(),
      description,
      keywords: keywords || [],
      templateConfig: templateConfig || getDefaultTemplateConfig(),
      identificationPrompt: identificationPrompt || '',
      priority: priority || 0,
      enabled: true,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    const populated = await ProcurementCategory.findById(category._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('[Procurement Categories] Create error:', error);
    res.status(500).json({ success: false, message: '创建品类模板失败' });
  }
});

/**
 * 更新品类模板（仅管理员）
 * PUT /api/procurement-categories/:id
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      keywords,
      templateConfig,
      identificationPrompt,
      priority,
      enabled,
    } = req.body;

    const category = await ProcurementCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: '品类模板不存在' });
    }

    // 如果修改了代码，检查新代码是否已被使用
    if (code && code.toLowerCase() !== category.code) {
      const existing = await ProcurementCategory.findOne({
        code: code.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({ success: false, message: '品类代码已存在' });
      }
    }

    // 更新字段
    if (name) category.name = name;
    if (code) category.code = code.toLowerCase();
    if (description !== undefined) category.description = description;
    if (keywords) category.keywords = keywords;
    if (templateConfig) category.templateConfig = templateConfig;
    if (identificationPrompt !== undefined) category.identificationPrompt = identificationPrompt;
    if (priority !== undefined) category.priority = priority;
    if (enabled !== undefined) category.enabled = enabled;
    category.updatedBy = req.user._id;

    await category.save();

    const updated = await ProcurementCategory.findById(category._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[Procurement Categories] Update error:', error);
    res.status(500).json({ success: false, message: '更新品类模板失败' });
  }
});

/**
 * 删除品类模板（仅管理员）
 * DELETE /api/procurement-categories/:id
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await ProcurementCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: '品类模板不存在' });
    }

    await ProcurementCategory.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('[Procurement Categories] Delete error:', error);
    res.status(500).json({ success: false, message: '删除品类模板失败' });
  }
});

/**
 * 上传Excel模板文件并解析为品类模板（仅管理员）
 * POST /api/procurement-categories/upload-template
 */
router.post('/upload-template', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请上传Excel文件' });
    }

    // 解析Excel文件
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

    // 读取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 获取表头
    const headers = [];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        headers.push({
          key: cell.v.toString().toLowerCase().replace(/\s+/g, '_'),
          label: cell.v.toString(),
        });
      }
    }

    // 返回解析的表头，供管理员确认后创建品类模板
    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        sheetName,
        headers,
        headerCount: headers.length,
      },
    });
  } catch (error) {
    console.error('[Procurement Categories] Upload template error:', error);
    res.status(500).json({ success: false, message: '上传模板文件失败' });
  }
});

/**
 * AI识别采购品类
 * POST /api/procurement-categories/identify
 */
router.post('/identify', auth, async (req, res) => {
  try {
    const { conversation, messages } = req.body;

    // 获取所有启用的品类模板
    const categories = await ProcurementCategory.find({ enabled: true })
      .sort({ priority: 1 });

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: '没有可用的品类模板' });
    }

    // 构建匹配文本
    const textToAnalyze = conversation || (
      messages ? messages.map((m) => `${m.role}: ${m.content}`).join('\n\n') : ''
    );

    if (!textToAnalyze) {
      return res.status(400).json({ success: false, message: '请提供对话内容' });
    }

    // 简单关键词匹配算法
    const scores = categories.map(category => {
      let score = 0;
      const lowerText = textToAnalyze.toLowerCase();

      // 匹配品类名称
      if (lowerText.includes(category.name.toLowerCase())) {
        score += 10;
      }

      // 匹配品类代码
      if (lowerText.includes(category.code.toLowerCase())) {
        score += 5;
      }

      // 匹配关键词
      category.keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 3;
        }
      });

      return {
        category,
        score,
      };
    });

    // 按分数排序
    scores.sort((a, b) => b.score - a.score);

    // 返回匹配结果
    const matched = scores.filter(s => s.score > 0);

    if (matched.length === 0) {
      return res.json({
        success: true,
        data: {
          matched: false,
          message: '未能识别出明确的采购品类',
          categories: categories.map(c => ({
            _id: c._id,
            name: c.name,
            code: c.code,
            description: c.description,
          })),
        },
      });
    }

    res.json({
      success: true,
      data: {
        matched: true,
        bestMatch: {
          category: matched[0].category,
          score: matched[0].score,
        },
        alternatives: matched.slice(1, 4).map(m => ({
          category: m.category,
          score: m.score,
        })),
      },
    });
  } catch (error) {
    console.error('[Procurement Categories] Identify error:', error);
    res.status(500).json({ success: false, message: '识别采购品类失败' });
  }
});

/**
 * 初始化默认品类模板（仅管理员，用于初始化系统）
 * POST /api/procurement-categories/init-defaults
 */
router.post('/init-defaults', adminAuth, async (req, res) => {
  try {
    const { force } = req.body;

    // 检查是否已存在默认模板（除非强制重新初始化）
    const existingCount = await ProcurementCategory.countDocuments();
    if (existingCount > 0 && !force) {
      return res.status(400).json({ success: false, message: '系统已存在品类模板，如需重新初始化请设置force参数为true' });
    }

    const defaultCategories = getDefaultCategories();

    // 如果是强制重新初始化，先删除所有现有模板
    if (force && existingCount > 0) {
      await ProcurementCategory.deleteMany({});
    }

    await ProcurementCategory.insertMany(defaultCategories.map(cat => ({
      ...cat,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    })));

    const categories = await ProcurementCategory.find()
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: force
        ? `已重新初始化 ${defaultCategories.length} 个默认品类模板`
        : `已创建 ${defaultCategories.length} 个默认品类模板`,
      data: categories,
    });
  } catch (error) {
    console.error('[Procurement Categories] Init defaults error:', error);
    res.status(500).json({ success: false, message: '初始化默认模板失败' });
  }
});

// 辅助函数：获取默认模板配置
function getDefaultTemplateConfig() {
  return {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text', example: '企业ERP系统开发' },
      { key: '业务背景', label: '业务背景', required: true, width: 35, type: 'textarea', example: '为提升企业管理效率，需开发ERP系统' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
      { key: '功能需求', label: '功能需求', required: true, width: 40, type: 'textarea', example: '用户管理；订单管理；报表统计' },
      { key: '预算金额', label: '预算金额（元）', required: false, width: 15, type: 'number', example: '100000' },
      { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date', example: '2024-12-31' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
    sheets: [
      { name: '需求清单', type: 'main', enabled: true },
      { name: '项目概要', type: 'summary', enabled: true },
      { name: '填写说明', type: 'instruction', enabled: true },
    ],
  };
}

// 辅助函数：获取默认品类模板
function getDefaultCategories() {
  // 读取Excel数据中的所有三级品类
  const categoryData = [
    // 不动产管理
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '办公室装修总包(含机电)' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '室内软硬装设计' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '办公室暖通方案/空气净化系统' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: 'IT机房空调工程' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '网络布线工程' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '办公室零星工程' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '办公室装修其他费用' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '办公室暖通方案/空气净化系统维护' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '地毯' },
    { l1: '不动产管理', l2: '办公室装修工程相关', l3: '支臂' },
    { l1: '不动产管理', l2: '办公室建设相关顾问服务', l3: '声/光学设计及咨询服务' },
    { l1: '不动产管理', l2: '办公室建设相关顾问服务', l3: '办公室建设造价顾问服务' },
    { l1: '不动产管理', l2: '办公室建设相关顾问服务', l3: '办公室建设其他顾问服务' },
    { l1: '不动产管理', l2: '办公室建设相关顾问服务', l3: '办公楼选择前期顾问服务' },
    { l1: '不动产管理', l2: '办公室建设相关顾问服务', l3: '办公室建设机电顾问服务' },
    { l1: '不动产管理', l2: '办公室建设相关顾问服务', l3: '办公室装修项目管理顾问服务' },
    { l1: '不动产管理', l2: '租赁及物业管理相关', l3: '办公室租赁费用' },
    { l1: '不动产管理', l2: '租赁及物业管理相关', l3: '物业管理费用' },
    { l1: '不动产管理', l2: '租赁及物业管理相关', l3: '办公租赁的中介服务' },
    { l1: '不动产管理', l2: '租赁及物业管理相关', l3: '车位租赁' },
    { l1: '不动产管理', l2: '租赁及物业管理相关', l3: '商务中心会议相关费用' },
    { l1: '不动产管理', l2: '办公室家具', l3: '办公室系统家具' },
    { l1: '不动产管理', l2: '办公室家具', l3: '办公室休闲家具' },
    { l1: '不动产管理', l2: '办公室家具', l3: '家具维修维护' },
    { l1: '不动产管理', l2: '办公室家具', l3: '家具其他配件' },
    { l1: '不动产管理', l2: '办公室装饰工程相关', l3: '办公室软装(包含窗帘、灯具等)' },
    { l1: '不动产管理', l2: '办公室安防系统工程及相关服务', l3: '安保-安防系统维修及维护' },
    { l1: '不动产管理', l2: '办公室安防系统工程及相关服务', l3: '安保-安防系统建设(包含系统及设备)' },
    { l1: '不动产管理', l2: '办公室安防系统工程及相关服务', l3: '安保-保安服务及装备' },
    { l1: '不动产管理', l2: '办公室安防系统工程及相关服务', l3: '安保-SOS咨询服务' },
    { l1: '不动产管理', l2: '办公室安防系统工程及相关服务', l3: '安保-安防设计与顾问费' },
    // 办公室设备及服务
    { l1: '办公室设备及服务', l2: '饮料及食品', l3: '饮料' },
    { l1: '办公室设备及服务', l2: '饮料及食品', l3: '饮用水' },
    { l1: '办公室设备及服务', l2: '饮料及食品', l3: '食品' },
    { l1: '办公室设备及服务', l2: '办公文具及设备', l3: '办公设备' },
    { l1: '办公室设备及服务', l2: '办公文具及设备', l3: '办公设备维修维护及耗材' },
    { l1: '办公室设备及服务', l2: '办公文具及设备', l3: '硒鼓' },
    { l1: '办公室设备及服务', l2: '办公文具及设备', l3: '行政电器' },
    { l1: '办公室设备及服务', l2: '办公文具及设备', l3: '办公文具及耗材' },
    { l1: '办公室设备及服务', l2: '物流快递', l3: '快递（国内、国际）' },
    { l1: '办公室设备及服务', l2: '物流快递', l3: '仓储/物流/搬运' },
    { l1: '办公室设备及服务', l2: '物流快递', l3: '文件管理' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '保洁人员' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '保洁用品' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '树木花卉' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '驻场外包服务' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '办公环境维修维护' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '空调/消防维护' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '消毒杀虫' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '电器设备租赁及维护' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '办公室零星维修维护' },
    { l1: '办公室设备及服务', l2: '设施管理及维护/外包服务', l3: '办公室零星改造' },
    { l1: '办公室设备及服务', l2: '印刷品', l3: '标准印刷' },
    { l1: '办公室设备及服务', l2: '印刷品', l3: '数码印刷' },
    { l1: '办公室设备及服务', l2: '印刷品', l3: '其他行政物料' },
    { l1: '办公室设备及服务', l2: '公司会议', l3: '分支机构年会' },
    { l1: '办公室设备及服务', l2: '公司会议', l3: '董事会及其他会议' },
    { l1: '办公室设备及服务', l2: '其他', l3: '健身费' },
    { l1: '办公室设备及服务', l2: '其他', l3: '财产保险' },
    // 差旅交通及部门内部活动
    { l1: '差旅交通及部门内部活动', l2: '差旅', l3: '差旅管理公司' },
    { l1: '差旅交通及部门内部活动', l2: '差旅', l3: '酒店' },
    { l1: '差旅交通及部门内部活动', l2: '差旅', l3: '机票' },
    { l1: '差旅交通及部门内部活动', l2: '差旅', l3: '火车' },
    { l1: '差旅交通及部门内部活动', l2: '差旅', l3: '第三方支付' },
    { l1: '差旅交通及部门内部活动', l2: '差旅', l3: '差旅其它服务' },
    { l1: '差旅交通及部门内部活动', l2: '车辆', l3: '班车' },
    { l1: '差旅交通及部门内部活动', l2: '车辆', l3: '集中调度车' },
    { l1: '差旅交通及部门内部活动', l2: '车辆', l3: '网约车' },
    { l1: '差旅交通及部门内部活动', l2: '车辆', l3: '领导用车' },
    { l1: '差旅交通及部门内部活动', l2: '部门会议及团建', l3: '部门会议及团建' },
    // 公关品牌相关
    { l1: '公关品牌相关', l2: '线上活动', l3: '线上会议及活动' },
    { l1: '公关品牌相关', l2: '线下活动', l3: '线下会议及活动' },
    { l1: '公关品牌相关', l2: '媒体管理', l3: '媒体关系维护专业服务费' },
    { l1: '公关品牌相关', l2: '媒体管理', l3: '新媒体管理费' },
    { l1: '公关品牌相关', l2: '媒体管理', l3: '危机公关专业服务费' },
    { l1: '公关品牌相关', l2: '媒体管理', l3: '媒体活动' },
    { l1: '公关品牌相关', l2: '媒体管理', l3: '境外媒体宣传' },
    { l1: '公关品牌相关', l2: '媒体管理', l3: '媒体投放' },
    { l1: '公关品牌相关', l2: '品牌管理及推广（境内外）', l3: '品牌战略及管理咨询' },
    { l1: '公关品牌相关', l2: '品牌管理及推广（境内外）', l3: '视频策划与制作' },
    { l1: '公关品牌相关', l2: '品牌管理及推广（境内外）', l3: '多媒体策划及执行' },
    { l1: '公关品牌相关', l2: '品牌管理及推广（境内外）', l3: '平面及活动视觉设计' },
    { l1: '公关品牌相关', l2: '品牌管理及推广（境内外）', l3: '展览展示策划及执行' },
    { l1: '公关品牌相关', l2: '品牌管理及推广（境内外）', l3: '图片等版权素材购买' },
    { l1: '公关品牌相关', l2: '品牌管理及推广（境内外）', l3: '广告投放' },
    { l1: '公关品牌相关', l2: '品牌管理及推广（境内外）', l3: '传统/新媒体合渠道购买' },
    { l1: '公关品牌相关', l2: '线上宣传', l3: '公司官网设计、制作' },
    { l1: '公关品牌相关', l2: '线上宣传', l3: '公司内网设计、制作' },
    { l1: '公关品牌相关', l2: '线上宣传', l3: '新媒体平台宣传' },
    { l1: '公关品牌相关', l2: '线上宣传', l3: '企业微信平台宣传' },
    { l1: '公关品牌相关', l2: '舆情监测', l3: '舆情监测服务' },
    { l1: '公关品牌相关', l2: '内宣', l3: '新闻中心宣传产品建设' },
    { l1: '公关品牌相关', l2: '内宣', l3: '北京年会' },
    { l1: '公关品牌相关', l2: '内宣', l3: '公司品牌礼品制作' },
    { l1: '公关品牌相关', l2: '内宣', l3: 'PR宣传品' },
    { l1: '公关品牌相关', l2: '其他', l3: '其他' },
    { l1: '公关品牌相关', l2: '部门礼品', l3: '部门自行采购礼品' },
    { l1: '公关品牌相关', l2: 'MF渠道营销费', l3: 'MF渠道营销费' },
    // IT类相关
    { l1: 'IT类相关', l2: 'IT硬件', l3: '服务器' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '网络及管理设备' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '通讯设备' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '存储设备' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '机房配套硬件设备' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '其他设备' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '办公及外围设备' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '办公室及会议室设备' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '集中打印设备' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '办公电脑 - 租赁' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '办公电脑 - 非租赁' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '低值License费（Token费等）' },
    { l1: 'IT类相关', l2: 'IT硬件', l3: '办公电脑 – Apple类' },
    { l1: 'IT类相关', l2: 'IT软件及系统', l3: '数据库类软件' },
    { l1: 'IT类相关', l2: 'IT软件及系统', l3: '网络管理类软件' },
    { l1: 'IT类相关', l2: 'IT软件及系统', l3: '办公类软件' },
    { l1: 'IT类相关', l2: 'IT软件及系统', l3: '业务类软件' },
    { l1: 'IT类相关', l2: 'IT软件及系统', l3: '其他类软件' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: '机房租赁服务' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: '软件编程及开发服务-二次开发（非IT外包人力资源池）' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: '工程师驻场服务-运维专用' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: 'IT外包开发服务(开发人力资源池专用）' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: '其他IT相关租赁服务' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: 'IT类处置回收服务' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: 'IT类咨询服务' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: 'FIX' },
    { l1: 'IT类相关', l2: 'IT专业服务', l3: '安装部署实施及IT系统培训服务' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '服务器类维护' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '网络及管理类维护' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '存储类维护' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '办公及外围设备类维护' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '机房类维护' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '数据库类软件维护' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '业务软件类维护' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '通讯设备类维护' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '办公室及会议室设备服务' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '集中打印设备服务' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '办公类软件维保' },
    { l1: 'IT类相关', l2: 'IT软硬件维保服务', l3: '其他类维护' },
    { l1: 'IT类相关', l2: '市场数据', l3: '终端类市场数据' },
    { l1: 'IT类相关', l2: '市场数据', l3: '数据库类市场数据' },
    { l1: 'IT类相关', l2: 'IT通讯类', l3: '线路通讯及租赁服务、专线' },
    { l1: 'IT类相关', l2: 'IT通讯类', l3: '移动通讯费（包括话费，流量等）-公司统一支付' },
    { l1: 'IT类相关', l2: 'IT云相关建设及服务', l3: '服务器租赁' },
    { l1: 'IT类相关', l2: 'IT云相关建设及服务', l3: '网络设备租赁' },
    { l1: 'IT类相关', l2: 'IT云相关建设及服务', l3: '软件订阅及其他服务' },
    // 专业服务
    { l1: '专业服务', l2: '法律咨询及服务', l3: '常务法务' },
    { l1: '专业服务', l2: '法律咨询及服务', l3: '诉讼/仲裁' },
    { l1: '专业服务', l2: '法律咨询及服务', l3: '商标注册服务' },
    { l1: '专业服务', l2: '法律咨询及服务', l3: '合规及监管相关' },
    { l1: '专业服务', l2: '公司保险服务', l3: '保险经纪和保险公司' },
    { l1: '专业服务', l2: '公司财务咨询及服务', l3: '税务咨询' },
    { l1: '专业服务', l2: '公司财务咨询及服务', l3: '审计服务' },
    { l1: '专业服务', l2: '公司财务咨询及服务', l3: '财务外包' },
    { l1: '专业服务', l2: '公司财务咨询及服务', l3: '转移定价' },
    { l1: '专业服务', l2: '公司财务咨询及服务', l3: '鉴证报告' },
    { l1: '专业服务', l2: '公司财务咨询及服务', l3: '财务其他服务' },
    { l1: '专业服务', l2: '公司财务咨询及服务', l3: '税务代理服务' },
    { l1: '专业服务', l2: '公司财务咨询及服务', l3: '财务专项审计' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '员工发展与培训-公司级别' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '培训-部门级别' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '人力资源咨询服务' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '猎头服务' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '背景调查' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '校园招聘' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '员工福利-EAP服务' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '员工福利-保险' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '员工福利-办公室药箱' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '员工福利-员工体检' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '劳务派遣' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '服务外包' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '薪酬数据市场调研' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '个税报税' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '个税咨询' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: 'Payroll服务' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '工作签证服务' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '网络招聘' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '人力资源其他服务' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '人事管理服务' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '企业年金服务费' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '薪酬延付计划服务费' },
    { l1: '专业服务', l2: '人力资源咨询及服务', l3: '员工福利-弹性福利' },
    { l1: '专业服务', l2: '其他业务流程外包或专业服务', l3: 'BPO业务流程外包' },
    { l1: '专业服务', l2: '业务相关服务', l3: '投行业务中介服务-会计师事务所（审计/验资/现金流预测）' },
    { l1: '专业服务', l2: '业务相关服务', l3: '投行业务中介服务-资产评估' },
    { l1: '专业服务', l2: '业务相关服务', l3: '投行业务中介服务-评级机构' },
    { l1: '专业服务', l2: '业务相关服务', l3: '投行业务中介服务-背景调查公司' },
    { l1: '专业服务', l2: '业务相关服务', l3: '投行业务中介服务-人力资源咨询顾问' },
    { l1: '专业服务', l2: '业务相关服务', l3: '产品审计服务和咨询' },
    { l1: '专业服务', l2: '业务相关服务', l3: '投行业务中介服务-Tombstone制作' },
    { l1: '专业服务', l2: '业务相关服务', l3: '投行业务中介服务-财经公关' },
    { l1: '专业服务', l2: '业务相关服务', l3: '私募服务中介业务服务-会计师事务所(项目审计/尽调/及其他财税服务)' },
    { l1: '专业服务', l2: '业务相关服务', l3: '研究咨询服务-投研报告' },
    { l1: '专业服务', l2: '业务相关服务', l3: '产品验资/清算/审计' },
    { l1: '专业服务', l2: '业务相关服务', l3: '其他业务相关服务' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '私募基金业务中介服务-律师事务所（股权投资）' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '私募基金业务中介服务-律师事务所（FOF投资）' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '私募基金业务中介服务-律师事务所（产品/基金设立）' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '私募基金业务中介服务-律师事务所（产品/基金/项目退出和清算）' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '私募基金业务中介服务-律师事务所（基金投后事项）' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '业务法律咨询' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '法律其他服务' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '投行业务中介服务-律师事务所（IPO）' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '投行业务中介服务-律师事务所 (债券发行）' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '投行业务中介服务-律师事务所(ABS及其他）' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '投行业务中介服务-律师事务所(再融资)' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '投行业务中介服务-律师事务所(重组)' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '投行业务中介服务-律师事务所(新三板)' },
    { l1: '专业服务', l2: '业务相关服务-律师事务所', l3: '资本金业务-律师事务所' },
    { l1: '专业服务', l2: '其他服务', l3: '图文编辑及优化-PPT制作/文档美化' },
    { l1: '专业服务', l2: '其他服务', l3: '翻译服务（书面翻译、同声传译等）' },
    { l1: '专业服务', l2: '其他服务', l3: '高管离任审计' },
    { l1: '专业服务', l2: '其他服务', l3: '年度内控审计' },
    { l1: '专业服务', l2: '其他服务', l3: '公司专项审计' },
    { l1: '专业服务', l2: '其他服务', l3: '公司事务服务' },
    { l1: '专业服务', l2: '其他服务', l3: '其他专业服务' },
    { l1: '专业服务', l2: '其他服务', l3: '兼职翻译' },
    { l1: '专业服务', l2: '其他管理咨询服务', l3: '其他管理咨询服务' },
    { l1: '专业服务', l2: '其他管理咨询服务', l3: '行业咨询-访谈/调研服务' },
    { l1: '专业服务', l2: '投研报告', l3: '市场数据（部门自采）' },
    { l1: '专业服务', l2: '安全保密管理相关服务', l3: '咨询服务类' },
  ];

  // 辅助函数：生成英文代码
  const generateCode = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '_')  // 替换非中文字母数字为下划线
      .replace(/[\(\)（）\/\/\-\-\s、，、]/g, '_')  // 替换特殊字符
      .replace(/_+/g, '_')  // 合并多个下划线
      .replace(/^_|_$/g, '')  // 去除首尾下划线
      .substring(0, 50);  // 限制长度
  };

  // 辅助函数：提取关键词
  const extractKeywords = (l1, l2, l3) => {
    const keywords = [];
    // 从一级品类提取
    if (l1.includes('不动产')) keywords.push('装修', '办公室', '租赁', '物业');
    if (l1.includes('办公室设备')) keywords.push('办公', '设备', '用品', '物流');
    if (l1.includes('差旅')) keywords.push('差旅', '交通', '酒店', '机票', '车辆');
    if (l1.includes('公关品牌')) keywords.push('公关', '品牌', '媒体', '宣传', '广告');
    if (l1.includes('IT')) keywords.push('IT', '软件', '硬件', '网络', '服务器');
    if (l1.includes('专业服务')) keywords.push('咨询', '服务', '法律', '财务', '人力资源');
    // 从三级品类提取关键词
    const words = l3.split(/[\(\)\/\-\s、，、]+/);
    words.forEach(w => {
      if (w.length >= 2 && !keywords.includes(w)) {
        keywords.push(w);
      }
    });
    return keywords.slice(0, 10);  // 限制关键词数量
  };

  // 生成品类模板
  const categories = categoryData.map((cat, index) => {
    const code = `cat_${generateCode(cat.l3)}`;
    const keywords = extractKeywords(cat.l1, cat.l2, cat.l3);

    return {
      name: cat.l3,
      code: code,
      description: `${cat.l1} > ${cat.l2} > ${cat.l3}`,
      keywords: keywords,
      templateConfig: getDefaultTemplateConfig(),
      identificationPrompt: `识别${cat.l3}相关采购需求`,
      priority: index + 1,
      enabled: true,
      l1Category: cat.l1,
      l2Category: cat.l2,
      l3Category: cat.l3,
    };
  });

  return categories;
}

export default router;
