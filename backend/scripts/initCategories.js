/**
 * 初始化默认品类数据
 * Usage: node scripts/initCategories.js <admin-token>
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';
const ADMIN_TOKEN = process.argv[2];

if (!ADMIN_TOKEN) {
  console.error('Usage: node scripts/initCategories.js <admin-token>');
  console.error('Please provide an admin token');
  process.exit(1);
}

async function initCategories() {
  try {
    console.log('正在初始化默认品类数据...');

    const response = await fetch(`${API_BASE}/procurement-categories/init-defaults`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ force: false }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✓', result.message);
      console.log(`已创建 ${result.data?.length || 0} 个品类模板:`);
      result.data?.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.code})`);
      });
    } else {
      console.error('✗ 初始化失败:', result.message);
      if (result.message.includes('已存在')) {
        console.log('\n提示: 如需重新初始化，请使用 force 参数');
      }
    }
  } catch (error) {
    console.error('✗ 请求失败:', error.message);
  }
}

initCategories();
