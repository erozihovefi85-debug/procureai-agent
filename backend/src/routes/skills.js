import express from 'express';
import { auth } from '../middleware/auth.js';
import Skill from '../models/Skill.js';
import SkillExecution from '../models/SkillExecution.js';
import { getAvailableSkills } from '../services/skillRegistry.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * GET /api/skills - 获取可用技能列表
 * 根据用户角色过滤可见技能
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const userRole = user?.role || 'Free';
    const { category, type, search } = req.query;

    let skills = await getAvailableSkills(req.userId, userRole);

    // 过滤条件
    if (category) {
      skills = skills.filter(s => s.category === category);
    }
    if (type) {
      skills = skills.filter(s => s.type === type);
    }
    if (search) {
      const keyword = search.toLowerCase();
      skills = skills.filter(s =>
        s.name.toLowerCase().includes(keyword) ||
        s.description.toLowerCase().includes(keyword)
      );
    }

    res.json({ data: skills });
  } catch (error) {
    console.error('[Skills] List error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/skills/featured - 获取推荐技能
 */
router.get('/featured', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const userRole = user?.role || 'Free';

    const skills = await Skill.find({
      enabled: true,
      featured: true,
      $or: [
        { visibility: 'public' },
        { owner: req.userId },
      ],
    }).sort({ usageCount: -1 }).limit(10);

    const filtered = skills.filter(s => {
      if (!s.allowedRoles || s.allowedRoles.length === 0) return true;
      return s.allowedRoles.includes(userRole);
    });

    res.json({ data: filtered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/skills/stats/overview - 技能使用统计
 * NOTE: Must be before /:slug to avoid matching 'stats' as a slug
 */
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalSkills = await Skill.countDocuments({ enabled: true });
    const mySkills = await Skill.countDocuments({ owner: req.userId });
    const totalExecutions = await SkillExecution.countDocuments({ userId: req.userId });

    const recentExecutions = await SkillExecution.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('skillId', 'name slug icon');

    const topSkills = await SkillExecution.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$skillId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      data: {
        totalSkills,
        mySkills,
        totalExecutions,
        recentExecutions,
        topSkills,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/skills/:slug - 获取技能详情
 */
router.get('/:slug', auth, async (req, res) => {
  try {
    const skill = await Skill.findOne({ slug: req.params.slug });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json({ data: skill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/skills - 创建自定义技能
 */
router.post('/', auth, async (req, res) => {
  try {
    const {
      name, description, icon, color, category,
      config, parameters, outputFormat,
      visibility, allowedRoles,
    } = req.body;

    // 生成slug
    const slug = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const skill = await Skill.create({
      name,
      slug,
      description,
      icon: icon || 'custom',
      color: color || '#6366F1',
      category: category || 'custom',
      type: 'custom',
      config: config || {},
      parameters: parameters || [],
      outputFormat: outputFormat || 'markdown',
      owner: req.userId,
      visibility: visibility || 'private',
      allowedRoles: allowedRoles || [],
    });

    res.status(201).json({ data: skill });
  } catch (error) {
    console.error('[Skills] Create error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/skills/:slug - 更新自定义技能
 */
router.put('/:slug', auth, async (req, res) => {
  try {
    const skill = await Skill.findOne({ slug: req.params.slug });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // 只允许owner或admin修改
    const user = await User.findById(req.userId);
    if (skill.type !== 'builtin' && String(skill.owner) !== String(req.userId) && user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // 不允许修改内置技能的核心配置
    const updates = { ...req.body };
    if (skill.type === 'builtin') {
      delete updates.type;
      delete updates.config;
      delete updates.slug;
    }

    const updated = await Skill.findByIdAndUpdate(skill._id, updates, { new: true });
    res.json({ data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/skills/:slug - 删除自定义技能
 */
router.delete('/:slug', auth, async (req, res) => {
  try {
    const skill = await Skill.findOne({ slug: req.params.slug });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.type === 'builtin') {
      return res.status(400).json({ message: 'Cannot delete builtin skills' });
    }

    const user = await User.findById(req.userId);
    if (String(skill.owner) !== String(req.userId) && user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await Skill.findByIdAndDelete(skill._id);
    res.json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/skills/:slug/executions - 获取技能执行历史
 */
router.get('/:slug/executions', auth, async (req, res) => {
  try {
    const skill = await Skill.findOne({ slug: req.params.slug });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const executions = await SkillExecution.find({
      skillId: skill._id,
      userId: req.userId,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await SkillExecution.countDocuments({
      skillId: skill._id,
      userId: req.userId,
    });

    res.json({
      data: executions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
