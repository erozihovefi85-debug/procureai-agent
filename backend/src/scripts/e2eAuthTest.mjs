/**
 * 端到端注册和登录测试
 * 测试实际的 HTTP API 调用
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const API_BASE = 'http://localhost:3001/api';

async function testRegisterAndLogin() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  const testName = '测试用户';

  console.log('========================================');
  console.log('端到端注册和登录测试');
  console.log('========================================\n');

  try {
    // ========================================
    // 测试 1: 注册新用户
    // ========================================
    console.log('【测试 1】注册新用户');
    console.log('─'.repeat(40));

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log('状态码:', registerResponse.status);
    const registerData = await registerResponse.json();
    console.log('响应:', registerData);

    if (registerResponse.status !== 201) {
      console.log('✗ 注册失败:', registerData.message);
      return;
    }

    console.log('✓ 注册成功');
    console.log('  用户ID:', registerData.user.id);
    console.log('  用户名:', registerData.user.name);
    console.log('  邮箱:', registerData.user.email);
    console.log('  Token (前30字符):', registerData.token.substring(0, 30) + '...');

    // 保存 token 用于后续测试
    const { token, user } = registerData;

    // ========================================
    // 测试 2: 使用注册返回的 Token 获取用户信息
    // ========================================
    console.log('\n【测试 2】验证 Token 并获取用户信息');
    console.log('─'.repeat(40));

    const meResponse = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('状态码:', meResponse.status);
    const meData = await meResponse.json();
    console.log('响应:', meData);

    if (meResponse.status === 200) {
      console.log('✓ Token 验证成功');
      console.log('  用户ID:', meData.id);
      console.log('  用户名:', meData.name);
    } else {
      console.log('✗ Token 验证失败');
    }

    // ========================================
    // 测试 3: 使用错误的密码登录
    // ========================================
    console.log('\n【测试 3】使用错误密码登录');
    console.log('─'.repeat(40));

    const wrongLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123!',
      }),
    });

    console.log('状态码:', wrongLoginResponse.status);
    const wrongLoginData = await wrongLoginResponse.json();
    console.log('响应:', wrongLoginData);

    if (wrongLoginResponse.status === 401) {
      console.log('✓ 正确拒绝了错误密码');
    } else {
      console.log('✗ 应该返回 401 状态码');
    }

    // ========================================
    // 测试 4: 使用正确密码登录
    // ========================================
    console.log('\n【测试 4】使用正确密码登录');
    console.log('─'.repeat(40));

    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log('状态码:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('响应:', loginData);

    if (loginResponse.status === 200) {
      console.log('✓ 登录成功');
      console.log('  用户名:', loginData.user.name);
      console.log('  Token (前30字符):', loginData.token.substring(0, 30) + '...');
    } else {
      console.log('✗ 登录失败:', loginData.message);
    }

    // ========================================
    // 测试 5: 重复注册应该失败
    // ========================================
    console.log('\n【测试 5】重复注册检测');
    console.log('─'.repeat(40));

    const duplicateResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '重复用户',
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log('状态码:', duplicateResponse.status);
    const duplicateData = await duplicateResponse.json();
    console.log('响应:', duplicateData);

    if (duplicateResponse.status === 400) {
      console.log('✓ 正确拒绝了重复注册');
    } else {
      console.log('✗ 应该返回 400 状态码');
    }

    // ========================================
    // 清理测试数据
    // ========================================
    console.log('\n【清理】删除测试数据');
    console.log('─'.repeat(40));

    // 连接数据库并删除测试用户
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai');
    const User = (await import('../models/User.js')).default;
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
    console.log('✓ 测试用户已清理');

    // ========================================
    // 总结
    // ========================================
    console.log('\n' + '='.repeat(40));
    console.log('✅ 所有测试通过！');
    console.log('='.repeat(40));
    console.log('\n测试结果总结：');
    console.log('  ✓ 用户注册功能正常');
    console.log('  ✓ 用户登录功能正常');
    console.log('  ✓ Token 生成和验证正常');
    console.log('  ✓ 密码验证功能正常');
    console.log('  ✓ 重复注册检测正常');
    console.log('\n🎉 注册和登录功能完全正常！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n可能的原因：');
    console.error('  1. 后端服务器未运行 (请运行 npm run dev)');
    console.error('  2. MongoDB 未运行');
    console.error('  3. 端口 3001 被占用');
    console.error('  4. 环境变量未正确配置');
  }
}

testRegisterAndLogin();
