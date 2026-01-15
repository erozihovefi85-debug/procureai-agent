import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalConversations,
      totalMessages,
      usersByRole,
      conversationsByMode,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Conversation.countDocuments(),
      Message.countDocuments(),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Conversation.aggregate([
        { $group: { _id: '$mode', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalConversations,
      totalMessages,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      conversationsByMode: conversationsByMode.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's conversations
    const conversations = await Conversation.find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .limit(10);

    // Get user's messages count
    const messagesCount = await Message.countDocuments({ userId: user._id });

    res.json({
      user,
      conversations,
      messagesCount,
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, role, credits } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, credits },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't delete admin users
    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Delete user's data
    await Promise.all([
      Message.deleteMany({ userId: user._id }),
      Conversation.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(req.params.id),
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations
router.get('/conversations', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [conversations, total] = await Promise.all([
      Conversation.find()
        .populate('userId', 'name email')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Conversation.countDocuments(),
    ]);

    res.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/activity', adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const [recentConversations, recentMessages] = await Promise.all([
      Conversation.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit / 2),
      Message.find()
        .populate('userId', 'name email')
        .populate('conversationId', 'name')
        .sort({ createdAt: -1 })
        .limit(limit / 2),
    ]);

    const activities = [
      ...recentConversations.map(c => ({
        type: 'conversation',
        data: c,
        timestamp: c.createdAt,
      })),
      ...recentMessages.map(m => ({
        type: 'message',
        data: m,
        timestamp: m.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    res.json({ activities });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
