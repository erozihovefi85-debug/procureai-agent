# 供应商收藏按钮测试说明

## 问题诊断

如果收藏按钮没有显示，请按照以下步骤进行诊断：

### 步骤1：检查AI回复内容

确保AI回复同时满足两个条件：

1. **包含关键词**：
   - 供应商
   - 推荐
   - 公司
   - 企业
   - manufacturer
   - supplier

2. **包含可解析的供应商数据**（支持以下格式之一）

### 步骤2：在浏览器控制台测试

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 粘贴以下代码进行测试：

```javascript
// 测试解析功能
const testContent = `推荐以下供应商：

| 供应商名称 | 业务方向 | 联系人 | 电话 |
|-----------|---------|--------|------|
| XX科技公司 | 软件开发、系统集成 | 张三 | 13800138000 |`;

// 检查是否包含关键词
const keywords = ['供应商', '推荐', '公司', '企业'];
const hasKeyword = keywords.some(k => testContent.includes(k));
console.log('包含关键词:', hasKeyword);

// 测试解析（需要应用运行环境）
console.log('测试内容:', testContent);
```

### 步骤3：查看当前消息数据

在控制台执行：

```javascript
// 查看当前渲染的消息
const messages = document.querySelectorAll('[class*="message"]');
console.log('消息数量:', messages.length);

// 检查最后一条AI消息
const lastAiMessage = Array.from(messages).filter(m =>
  m.textContent.includes('供应商') || m.textContent.includes('公司')
).pop();

if (lastAiMessage) {
  console.log('找到包含关键词的消息:', lastAiMessage.textContent.substring(0, 200));
} else {
  console.log('未找到包含关键词的消息');
}
```

### 步骤4：检查网络请求

1. 打开 Network 标签
2. 筛选 XHR 请求
3. 向AI发送问题，等待回复
4. 查看是否有 `/api/suppliers` 相关的请求

### 步骤5：检查渲染逻辑

在控制台执行：

```javascript
// 检查供应商解析器是否加载
console.log('supplierParser是否可用:', typeof window.renderSupplierBookmarks !== 'undefined');
```

## 快速测试方法

### 方法1：直接测试JSON格式

在聊天界面输入：

```
请以JSON格式推荐几个软件开发供应商
```

期望AI回复类似：

```json
推荐以下供应商：
[
  {
    "name": "XX科技有限公司",
    "foundedDate": "2010年",
    "businessDirection": ["软件开发", "系统集成"],
    "contactInfo": {
      "person": "张三",
      "phone": "13800138000"
    }
  }
]
```

### 方法2：测试表格格式

在聊天界面输入：

```
请用表格格式推荐几个供应商，包含名称、业务方向、联系人、电话
```

期望AI回复类似：

```markdown
| 供应商名称 | 业务方向 | 联系人 | 电话 |
|-----------|---------|--------|------|
| XX科技公司 | 软件开发 | 张三 | 13800138000 |
```

### 方法3：测试自然语言格式

在聊天界面输入：

```
推荐一家供应商，公司名为XX科技，主营软件开发，联系人是张三
```

## 常见问题

### Q1: AI回复包含供应商信息，但没有显示收藏按钮？

**可能原因**：
1. AI回复格式不符合解析规则
2. 供应商名称缺失
3. 关键词检测失败

**解决方案**：
1. 确保AI回复明确包含"供应商"或"公司"关键词
2. 确保供应商有明确的名称
3. 尝试使用JSON格式提问

### Q2: 点击收藏后报错？

**检查后端状态**：
```bash
# 检查后端是否运行
curl http://localhost:3001/api

# 检查数据库连接
# 在后端控制台查看日志
```

### Q3: 导出功能报500错误？

**已修复**：路由顺序问题已解决，确保使用最新代码

## 验证修复

后端路由顺序已修复，现在导出功能应该正常工作：

1. 刷新页面
2. 进入供应商收藏夹
3. 点击"导出"按钮
4. 应该能成功下载Excel文件

## 下一步

如果问题仍然存在：

1. 在浏览器控制台执行上述测试代码
2. 检查具体的AI回复内容
3. 查看 Console 中的错误信息
4. 查看 Network 中的请求和响应

## 开发者调试

如果需要调试解析逻辑，可以在浏览器控制台执行：

```javascript
// 临时添加调试日志
const originalParse = window.parseSuppliersFromContent;
window.parseSuppliersFromContent = function(content) {
  console.log('解析内容:', content);
  const result = originalParse(content);
  console.log('解析结果:', result);
  return result;
};
```
