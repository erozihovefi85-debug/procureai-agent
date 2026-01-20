import axios from 'axios';

const API_KEY = 'sk-ffioccjhezmyrktocarqngvazbeakqyygbwmhlppqirliknv';
const API_BASE = 'https://api.siliconflow.cn/v1';
const MODEL = 'Qwen/Qwen3-VL-235B-A22B-Instruct';

async function testJSONFormat() {
  try {
    console.log('Testing with JSON format...');

    const response = await axios.post(
      `${API_BASE}/chat/completions`,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: '你是一个测试助手。请以JSON格式返回结果。' },
          { role: 'user', 'content: '请返回一个包含 name 和 age 的JSON对象' }
        ],
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ JSON format test Successful!');
    console.log('Response:', response.data);
    console.log('Content:', response.data.choices[0]?.message?.content);
  } catch (error) {
    console.error('❌ JSON format test Failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testJSONFormat();
