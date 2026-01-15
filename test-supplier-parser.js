// 测试供应商解析功能

// 测试数据
const testCases = [
  {
    name: "JSON格式",
    content: `推荐以下供应商：
[
  {
    "name": "XX科技有限公司",
    "foundedDate": "2010年",
    "businessDirection": "软件开发,系统集成,云计算",
    "contactInfo": {
      "person": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com"
    }
  }
]`
  },
  {
    name: "Markdown表格",
    content: `我为您推荐以下供应商：

| 供应商名称 | 业务方向 | 联系人 | 电话 |
|-----------|---------|--------|------|
| XX科技公司 | 软件开发、系统集成 | 张三 | 13800138000 |
| YY企业集团 | 硬件制造 | 李四 | 13900139000 |`
  },
  {
    name: "Markdown列表",
    content: `推荐供应商信息：

1. 供应商名称：XX科技公司
   成立时间：2010年
   业务方向：软件开发、系统集成
   联系人：张三
   电话：13800138000`
  },
  {
    name: "自然语言",
    content: `根据您的需求，我推荐以下供应商：

推荐供应商：XX科技公司，成立于2010年，主营业务包括软件开发、系统集成和云计算服务。
联系方式：张三，电话13800138000，邮箱zhangsan@example.com。`
  },
  {
    name: "无关键词但有公司",
    content: `这里有一些公司信息：
XX科技公司成立于2010年，主要从事软件开发业务。`
  },
  {
    name: "只有关键词无结构化数据",
    content: `我们可以为您推荐一些供应商和厂商，请稍等。`
  }
];

// 导入解析函数（需要在浏览器控制台中执行）
console.log('供应商解析测试');
console.log('==================');

testCases.forEach((testCase, index) => {
  console.log(`\n测试 ${index + 1}: ${testCase.name}`);
  console.log('-------------------');
  console.log('内容:', testCase.content.substring(0, 100) + '...');

  // 检查关键词
  const keywords = ['供应商', '推荐', '公司', '企业', 'manufacturer', 'supplier'];
  const hasKeyword = keywords.some(keyword => testCase.content.includes(keyword));
  console.log('包含关键词:', hasKeyword);

  // 注意：实际解析需要在浏览器环境中执行
  // 这里只是展示测试用例
});

console.log('\n==================');
console.log('请在浏览器控制台中执行以下代码来测试解析功能：');
console.log(`
// 复制粘贴到浏览器控制台
import { parseSuppliersFromContent, containsSupplierInfo } from './utils/supplierParser';

${testCases.map((tc, i) => `
// 测试用例 ${i + 1}: ${tc.name}
const content${i + 1} = \`${tc.content.replace(/`/g, '\\`')}\`;
console.log('测试 ${i + 1} 结果:', parseSuppliersFromContent(content${i + 1}));
console.log('是否显示收藏按钮:', containsSupplierInfo(content${i + 1}));
`).join('\n')}
`);
