import axios from 'axios';

const API_KEY = 'sk-ffioccjhezmyrktocarqngvazbeakqyygbwmhlppqirliknv';
const API_BASE = 'https://api.siliconflow.cn/v1';
const MODEL = 'Qwen/Qwen3-VL-235B-A22B-Instruct';

async function testAPI() {
  try {
    console.log('Testing SiliconFlow API...');
    console.log('API Base:', API_BASE);
    console.log('Model:', MODEL);

    const response = await axios.post(
      `${API_BASE}/chat/completions`,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: '你是一个测试助手' },
          { role: 'user', 'content': '请回复：测试成功' }
        ],
        temperature: 0.3,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ API Test Successful!');
    console.log('Response:', response.data);
    console.log('Message:', response.data.choices[0]?.message?.content);
  } catch (error) {
    console.error('❌ API Test Failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
