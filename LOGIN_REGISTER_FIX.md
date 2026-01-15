# 🔧 临时绕过数据库的登录/注册测试

## 问题描述
登录和注册都提示"操作失败"，原因是后端 MongoDB 连接问题。

## 快速测试方案（不依赖数据库）

### 方案 1：使用 Mock 用户（临时测试）

修改前端 `App.tsx`，临时添加 Mock 登录：

在 `App.tsx` 的 `handleLogin` 函数中添加 Mock 模式：

```typescript
// 在 App.tsx 的 handleLogin 函数开头添加：
const handleLogin = (mockUser: User) => {
  // 临时的 Mock 登录（用于测试，不连接数据库）
  const mockData = {
    id: 'mock-user-' + Date.now(),
    name: 'Mock User',
    email: 'mock@test.com',
    role: 'PRO' as 'Free' | 'PLUS' | 'PRO' | 'ADMIN',
    credits: 999999,
    joinDate: new Date().toISOString(),
  };

  const mockToken = 'mock-token-' + Date.now();

  localStorage.setItem('procureai_token', mockToken);
  localStorage.setItem('procureai_auth_user', JSON.stringify(mockData));

  console.log('[Mock Login] 用户已登录（不使用数据库）:', mockData);
  console.log('[Mock Login] Token:', mockToken);

  setUser(mockData);
  setShowLoginModal(false);
};
```

这样可以直接测试前端功能，无需数据库连接。

---

### 方案 2：修复 MongoDB 连接（推荐）

#### 步骤 1：检查 MongoDB 服务

```batch
sc query MongoDB
```

如果不是 `RUNNING`：
```batch
net start MongoDB
```

#### 步骤 2：禁用 MongoDB 认证（临时）

编辑 MongoDB 配置文件 `C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg`：

找到并注释掉这一行：
```yaml
security:
  authorization: enabled
```

改为：
```yaml
# security:
#   authorization: enabled  ← 注释掉
```

#### 步骤 3：重启 MongoDB

```batch
net stop MongoDB
net start MongoDB
```

#### 步骤 4：检查后端配置

编辑 `backend/.env`，确保连接字符串正确：

```env
# 不带认证的连接（临时）
MONGODB_URI=mongodb://localhost:27017/procureai
```

#### 步骤 5：重启后端

在后端终端按 Ctrl+C 停止，然后重新运行：
```batch
npm run dev
```

#### 步骤 6：测试注册/登录

1. 运行 API 测试：
```batch
test-backend-api.bat
```

2. 如果成功，在浏览器测试注册/登录

---

### 方案 3：使用 MongoDB Atlas（云数据库，推荐）

如果本地 MongoDB 配置困难，使用云数据库：

#### 步骤 1：创建 MongoDB Atlas 账号

1. 访问：https://www.mongodb.com/cloud/atlas
2. 注册免费账号
3. 创建免费集群

#### 步骤 2：获取连接字符串

1. 在 Atlas 控制台
2. 点击 "Connect"
3. 选择 "Connect your application"
4. 复制连接字符串

#### 步骤 3：更新后端配置

编辑 `backend/.env`：

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/procureai?retryWrites=true&w=majority
```

#### 步骤 4：重启后端

---

## 🧪 测试步骤

### 测试 1：检查后端日志

**在后端终端查看是否有错误：**

```
✓ MongoDB Connected: 127.0.0.1  ← 应该看到这个
× MongoDB Connection Failed  ← 如果看到这个，说明数据库连接失败
```

### 测试 2：使用测试脚本

```batch
test-backend-api.bat
```

**期望输出：**

成功：
```json
{
  "user": {
    "id": "...",
    "name": "TestUser",
    "email": "test123@example.com",
    ...
  },
  "token": "..."
}
```

失败：
```json
{
  "message": "Server error"
}
```

### 测试 3：浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 尝试注册/登录

**查看是否有错误：**

常见的错误信息：
- `Network Error` - 无法连接后端
- `500 Internal Server Error` - 后端数据库错误
- `400 User already exists` - 用户已存在
- `401 Invalid credentials` - 密码错误

### 测试 4：Network 标签

1. 切换到 Network 标签
2. 尝试注册
3. 找到 `/api/auth/register` 请求
4. 查看详细信息

**检查：**
- Status Code: 200/201 = 成功
- Status Code: 400 = 客户端错误（用户已存在）
- Status Code: 401 = 认证失败
- Status Code: 500 = 服务器错误（数据库问题）
- Response: 查看错误消息

---

## 📋 调试清单

请按以下顺序检查：

- [ ] MongoDB 服务状态是 `RUNNING`
- [ ] 后端显示 `✓ MongoDB Connected`
- [ ] 运行 `test-backend-api.bat` 成功
- [ ] 后端终端没有错误信息
- [ ] 浏览器 Console 没有错误
- [ ] Network 标签显示 Status 200/201

---

## 🆘 需要帮助？

请告诉我：

1. **运行 `test-backend-api.bat` 的输出是什么？**
2. **后端终端显示什么错误？**
3. **浏览器 Console 显示什么错误？**
4. **Network 标签显示的 Status Code 是多少？**

这样我能更准确地帮您解决问题！
