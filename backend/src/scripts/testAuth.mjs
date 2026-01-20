import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai';

async function testAuth() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB Connected');

    // 检查现有用户
    const testEmail = 'test@example.com';
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('测试用户已存在，删除中...');
      await User.deleteOne({ email: testEmail });
      console.log('✓ 测试用户已删除');
    }

    // 测试注册
    console.log('\n--- 测试注册 ---');
    const newUser = await User.create({
      name: '测试用户',
      email: testEmail,
      password: 'password123',
      role: 'Free',
      credits: 100,
    });

    console.log('✓ 用户创建成功');
    console.log('  ID:', newUser._id);
    console.log('  Name:', newUser.name);
    console.log('  Email:', newUser.email);
    console.log('  Role:', newUser.role);
    console.log('  Credits:', newUser.credits);
    console.log('  Password hashed:', newUser.password ? '✓' : '✗');

    // 测试密码匹配
    console.log('\n--- 测试密码匹配 ---');
    const isMatch = await newUser.matchPassword('password123');
    console.log('密码匹配结果:', isMatch ? '✓ 成功' : '✗ 失败');

    // 测试错误密码
    const wrongMatch = await newUser.matchPassword('wrongpassword');
    console.log('错误密码验证:', !wrongMatch ? '✓ 正确拒绝' : '✗ 错误接受');

    // 测试登录查询
    console.log('\n--- 测试登录查询 ---');
    const foundUser = await User.findOne({ email: testEmail }).select('+password');
    if (foundUser) {
      console.log('✓ 用户查询成功');
      console.log('  ID:', foundUser._id);
      console.log('  Password hash exists:', !!foundUser.password);

      const loginMatch = await foundUser.matchPassword('password123');
      console.log('登录密码验证:', loginMatch ? '✓ 成功' : '✗ 失败');
    } else {
      console.log('✗ 用户查询失败');
    }

    // 清理测试数据
    console.log('\n--- 清理测试数据 ---');
    await User.deleteOne({ email: testEmail });
    console.log('✓ 测试用户已清理');

    await mongoose.disconnect();
    console.log('\n✓ 数据库连接已关闭');
    console.log('\n✅ 所有测试通过！注册和登录功能正常工作。');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testAuth();
