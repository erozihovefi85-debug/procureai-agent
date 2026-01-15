import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai');
    console.log('✓ MongoDB Connected\n');

    // Check users
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    if (userCount > 0) {
      const users = await User.find().select('name email role credits createdAt');
      console.log('User List:');
      users.forEach(u => {
        console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}, Credits: ${u.credits}`);
      });
    }
    console.log('');

    // Check conversations
    const convCount = await Conversation.countDocuments();
    console.log(`💬 Conversations: ${convCount}`);
    if (convCount > 0) {
      const conversations = await Conversation.find()
        .populate('userId', 'name email')
        .sort({ updatedAt: -1 })
        .limit(10);

      console.log('Recent Conversations:');
      conversations.forEach(c => {
        console.log(`  - ${c.name} (${c.mode})`);
        console.log(`    User: ${c.userId?.name || 'Unknown'}`);
        console.log(`    Created: ${c.createdAt}`);
        console.log(`    Dify ID: ${c.difyConversationId || 'Not synced'}`);
      });
    }
    console.log('');

    // Check messages
    const msgCount = await Message.countDocuments();
    console.log(`📨 Messages: ${msgCount}`);
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('Database Summary:');
    console.log(`  Total Users: ${userCount}`);
    console.log(`  Total Conversations: ${convCount}`);
    console.log(`  Total Messages: ${msgCount}`);
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkDatabase();
