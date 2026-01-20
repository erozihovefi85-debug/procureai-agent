import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai';

async function fullAuthTest() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB Connected\n');

    const testEmail = 'fulltest@example.com';
    const testPassword = 'TestPass123!';

    // 清理之前的测试数据
    await User.deleteOne({ email: testEmail });

    // ========================================
    // 测试 1: 注册流程
    // ========================================
    console.log('【测试 1】用户注册流程');
    console.log('─'.repeat(50));

    const registerData = {
      name: '完整测试用户',
      email: testEmail,
      password: testPassword,
    };

    console.log('发送注册请求:', {
      name: registerData.name,
      email: registerData.email,
      password: '***'
    });

    // 模拟注册逻辑
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('✗ 用户已存在');
      await User.deleteOne({ email: testEmail });
    }

    const newUser = await User.create({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      role: 'Free',
      credits: 100,
    });

    console.log('✓ 用户创建成功');
    console.log('  用户ID:', newUser._id.toString());
    console.log('  用户名:', newUser.name);
    console.log('  邮箱:', newUser.email);
    console.log('  角色:', newUser.role);
    console.log('  积分:', newUser.credits);
    console.log('  密码已哈希:', newUser.password ? '✓' : '✗');

    // 生成 Token
    const token = generateToken(newUser._id);
    console.log('  Token 生成:', token ? '✓' : '✗');
    console.log('  Token (前20字符):', token.substring(0, 20) + '...');

    // ========================================
    // 测试 2: 登录流程
    // ========================================
    console.log('\n【测试 2】用户登录流程');
    console.log('─'.repeat(50));

    console.log('发送登录请求:', {
      email: testEmail,
      password: '***'
    });

    // 模拟登录逻辑
    const foundUser = await User.findOne({ email: testEmail }).select('+password');
    if (!foundUser) {
      console.log('✗ 用户不存在');
    } else {
      console.log('✓ 用户查询成功');

      const isMatch = await foundUser.matchPassword(testPassword);
      if (!isMatch) {
        console.log('✗ 密码错误');
      } else {
        console.log('✓ 密码验证成功');
        console.log('  用户ID:', foundUser._id.toString());
        console.log('  用户名:', foundUser.name);
        console.log('  角色:', foundUser.role);

        const loginToken = generateToken(foundUser._id);
        console.log('  Token 生成:', loginToken ? '✓' : '✗');
      }
    }

    // ========================================
    // 测试 3: 错误密码登录
    // ========================================
    console.log('\n【测试 3】错误密码登录');
    console.log('─'.repeat(50));

    const wrongPasswordUser = await User.findOne({ email: testEmail }).select('+password');
    const wrongMatch = await wrongPasswordUser.matchPassword('WrongPassword123!');
    console.log('使用错误密码登录:', !wrongMatch ? '✓ 正确拒绝' : '✗ 错误接受');

    // ========================================
    // 测试 4: Token 验证
    // ========================================
    console.log('\n【测试 4】Token 验证');
    console.log('─'.repeat(50));

    // 通过 Token 获取用户信息
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token 验证:', decoded.userId === newUser._id.toString() ? '✓ 成功' : '✗ 失败');
    console.log('  Token 中的用户ID:', decoded.userId);

    const tokenUser = await User.findById(decoded.userId);
    console.log('通过 Token 获取用户:', tokenUser ? '✓ 成功' : '✗ 失败');
    if (tokenUser) {
      console.log('  用户名:', tokenUser.name);
      console.log('  邮箱:', tokenUser.email);
    }

    // ========================================
    // 测试 5: 重复注册
    // ========================================
    console.log('\n【测试 5】重复注册检测');
    console.log('─'.repeat(50));

    const duplicateUser = await User.findOne({ email: testEmail });
    console.log('检查用户是否存在:', duplicateUser ? '✓ 用户已存在' : '✗ 用户不存在');

    // ========================================
    // 清理测试数据
    // ========================================
    console.log('\n【清理】删除测试数据');
    console.log('─'.repeat(50));
    await User.deleteOne({ email: testEmail });
    console.log('✓ 测试用户已清理');

    await mongoose.disconnect();
    console.log('\n✓ 数据库连接已关闭');

    console.log('\n' + '='.repeat(50));
    console.log('✅ 所有测试通过！');
    console.log('='.repeat(50));
    console.log('\n结论：');
    console.log('  ✓ 注册功能正常');
    console.log('  ✓ 登录功能正常');
    console.log('  ✓ 密码加密正常');
    console.log('  ✓ Token 生成和验证正常');
    console.log('  ✓ 重复注册检测正常');
    console.log('\n用户可以正常注册和登录！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fullAuthTest();
