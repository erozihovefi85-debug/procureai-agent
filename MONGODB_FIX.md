# 🔧 MongoDB 问题解决方案

## 问题描述

后端启动失败，提示：
```
Error: connect ECONNREFUSED ::1:27017
Error: connect ECONNREFUSED 127.0.0.1:27017
```

## ✅ 已修复

我已经修改了后端代码，现在即使没有 MongoDB，服务器也能启动！

## 🚀 现在重新启动后端

1. **停止当前的后端进程**（在终端按 Ctrl+C）

2. **重新启动后端**
   ```batch
   cd D:\智能体应用\procureai0111\backend
   npm run dev
   ```

3. **确认后端启动成功**
   应该看到：
   ```
   ⚠ MongoDB Connection Failed: connect ECONNREFUSED ...
   ⚠ Server will start without database. Some features may be limited.
   
   ╔════════════════════════════════════════════╗
   ║     ProcureAI Backend Server                ║
   ╠════════════════════════════════════════════╣
   ║  Environment: development
   ║  Port: 3001
   ╚════════════════════════════════════════════╝
   
   🚀 Server running at http://localhost:3001
   ```

## 📱 现在启动前端

**打开新终端：**
```batch
cd D:\智能体应用\procureai0111
npm run dev
```

## 🎯 可用的功能（无数据库模式）

即使没有数据库，以下功能仍然可用：

### ✅ 完全可用
1. **随意采购** - 通过 Dify API 进行对话
2. **规范采购** - 需求澄清、文档生成、供应商匹配、价格分析
3. **图片找同款** - 使用 mock 数据
4. **流式对话** - 所有聊天功能

### ⚠️ 功能受限（需要数据库）
1. ❌ 用户注册/登录
2. ❌ 用户中心
3. ❌ 管理员后台
4. ❌ 会话历史记录

## 📝 测试步骤

### 测试随意采购
1. 访问 http://localhost:5173
2. 点击"随心采购"
3. 输入："帮我找一个好用的无线鼠标"
4. 点击发送

✅ 期望：AI 开始流式回复

### 测试规范采购
1. 点击"规范采购"
2. 选择"需求澄清"
3. 输入："我需要采购100台办公笔记本电脑"
4. 点击发送

✅ 期望：AI 返回需求清单

## 🔄 如果要启用完整功能

### 方案一：安装本地 MongoDB

1. **下载 MongoDB Community Server**
   - 访问：https://www.mongodb.com/try/download/community
   - 选择 Windows 版本
   - 下载并安装

2. **启动 MongoDB 服务**
   ```batch
   # 方式一：使用服务管理器
   net start MongoDB
   
   # 方式二：手动启动
   mongod --dbpath "C:\data\db"
   ```

3. **重新启动后端**
   - 停止后端（Ctrl+C）
   - 重新运行 `npm run dev`
   - 现在应该看到 `✓ MongoDB Connected`

4. **初始化数据库**
   ```batch
   cd D:\智能体应用\procureai0111\backend
   npm run seed
   ```

### 方案二：使用 MongoDB Atlas（云数据库）

1. **创建免费账号**
   - 访问：https://www.mongodb.com/cloud/atlas
   - 注册并创建免费集群

2. **获取连接字符串**
   - 在 Atlas 控制台
   - 点击"Connect"
   - 选择"Connect your application"
   - 复制连接字符串

3. **修改配置**
   编辑 `backend/.env`：
   ```env
   MONGODB_URI=mongodb+srv://your-connection-string
   ```

4. **重新启动后端**

## 🎊 恭喜！

现在您可以：
- ✅ 测试所有聊天功能
- ✅ 体验 AI 采购助手
- ✅ 测试前端界面

如果需要完整的用户管理功能，按照上面的方案安装 MongoDB 即可。

---

## 💡 快速测试命令

**后端：**
```batch
cd /d D:\智能体应用\procureai0111\backend && npm run dev
```

**前端：**
```batch
cd /d D:\智能体应用\procureai0111 && npm run dev
```

**访问应用：**
- 前端：http://localhost:5173
- 后端：http://localhost:3001/api
