# AI 采购助手 (ProcureAI) - 完整版

这是一个基于 React + Node.js + MongoDB 构建的完整智能采购助手应用，包含前端、后端、图片识别、用户认证、用户中心和后台管理系统。

## ✨ 主要功能

### 前端功能
- **双模式采购体验**
  - 随心采购模式：日常询价、灵感探索
  - 规范采购模式：企业级采购流程，支持需求澄清、文档生成、供应商匹配、价格分析
- **图片找同款**：上传图片，搜索相似商品
- **流式响应**：实时打字机效果
- **多媒体支持**：支持上传图片、文档（PDF, Word, Excel 等）
- **会话管理**：历史会话记录、新建、切换、删除

### 后端功能
- **用户认证系统**：JWT + 密码哈希，支持注册/登录
- **用户中心**：用户信息管理
- **数据存储**：MongoDB 存储用户、会话、消息、图片搜索记录
- **后台管理界面**
  - 数据统计仪表板
  - 用户管理
  - 会话管理
  - 活动日志
- **图片识别服务**：集成图片找同款API（目前使用mock数据，可替换为真实API）
- **Dify 工作流集成**：调用 Dify API 进行智能对话

## 🛠 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios
- **其他**: React Markdown, Mermaid, LZString

### 后端
- **框架**: Node.js + Express
- **数据库**: MongoDB + Mongoose
- **认证**: JWT + bcryptjs
- **文件上传**: Multer
- **API集成**: Axios (Dify API)
- **其他**: Helmet, Morgan, CORS

## 📦 项目结构

```
procureai0111/
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # API路由
│   │   ├── scripts/        # 脚本
│   │   ├── services/       # 服务层
│   │   ├── utils/          # 工具函数
│   │   └── index.js        # 后端入口
│   ├── uploads/            # 上传文件目录
│   ├── package.json
│   └── .env.example       # 环境变量示例
├── components/             # React组件
├── services/              # API服务层
├── public/                # 静态资源
├── App.tsx               # 主应用
├── config.ts             # 前端配置
├── types.ts              # TypeScript类型
├── index.html            # HTML入口
├── vite.config.ts        # Vite配置
├── package.json
└── README.md

```

## 🚀 快速开始

### 前置要求

- Node.js 18+
- MongoDB 4.4+
- npm 或 yarn

### 1. 克隆项目并安装依赖

```bash
# 进入项目目录
cd "D:\智能体应用\procureai0111"

# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

### 2. 配置环境变量

#### 后端配置

复制 `backend/.env.example` 为 `backend/.env`：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/procureai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Dify API Configuration
DIFY_API_BASE=https://api.dify.ai/v1
DIFY_API_KEY_CASUAL=app-ay5UT5TnYR83d2guU5enM4oG
DIFY_API_KEY_KEYWORD=app-SgyXcIw7mNIKb5vt9MzTBJ5O
DIFY_API_KEY_DOCGEN=app-F7Xn0o7BeFH0FjZ6jsZnEMxp
DIFY_API_KEY_SUPPLIER=app-0yoM8NhLhSYv7JDxnmly4G0l
DIFY_API_KEY_PRICE=app-dMXx5Pz90hBDhCBzXIfcS1EJ

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Admin Configuration
ADMIN_EMAIL=admin@procureai.com
ADMIN_PASSWORD=admin123

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

#### 前端配置

在前端项目根目录创建 `.env.local` 文件：

```env
VITE_API_URL=http://localhost:3001/api
VITE_DIFY_API_BASE=https://api.dify.ai/v1
```

### 3. 启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# Windows (使用服务管理器)
# 或直接启动 MongoDB
mongod --dbpath "C:\data\db"
```

### 4. 初始化数据库

运行种子脚本创建管理员用户：

```bash
cd backend
npm run seed
```

输出示例：
```
Admin user created successfully:
  Email: admin@procureai.com
  Password: admin123
  Please change this password after first login!
```

### 5. 启动服务

#### 方式一：分别启动（开发模式）

启动后端：

```bash
cd backend
npm run dev
```

启动前端：

```bash
# 在新的终端窗口
cd "D:\智能体应用\procureai0111"
npm run dev
```

#### 方式二：使用启动脚本

创建根目录的 `start.bat`（Windows）或 `start.sh`（Linux/Mac）脚本：

**start.bat (Windows):**
```batch
@echo off
echo Starting ProcureAI...

echo Starting backend...
start cmd /k "cd backend && npm run dev"

timeout /t 3

echo Starting frontend...
start cmd /k "npm run dev"

echo All services started!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
pause
```

**start.sh (Linux/Mac):**
```bash
#!/bin/bash
echo "Starting ProcureAI..."

echo "Starting backend..."
cd backend && npm run dev &
BACKEND_PID=$!

sleep 3

echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "All services started!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
```

运行启动脚本：

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

## 📱 访问应用

- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:3001/api
- **API 文档**: http://localhost:3001/api

### 默认管理员账号

- **邮箱**: admin@procureai.com
- **密码**: admin123

### 测试账号

首次注册即可创建普通用户账号，每个用户初始获得 100 积分。

## 🎯 使用指南

### 用户操作流程

1. **注册/登录**
   - 首次访问点击右上角"登录"
   - 可以使用现有账号登录，也可以注册新账号
   - 登录后可以访问"规范采购"和"图片找同款"功能

2. **随心采购（无需登录）**
   - 点击首页"随心采购"
   - 输入采购需求开始对话
   - 支持上传图片和文档

3. **规范采购（需要登录）**
   - 点击首页"规范采购"（需要先登录）
   - 选择场景：需求澄清、文档生成、供应商匹配、价格分析
   - 每个场景有独立的会话历史

4. **图片找同款（需要登录）**
   - 登录后点击侧边栏"图片找同款"
   - 上传商品图片
   - 系统搜索并展示相似商品

5. **用户中心**
   - 查看个人信息
   - 管理账号设置

### 管理员操作流程

1. **访问管理后台**
   - 使用管理员账号登录
   - 点击侧边栏"管理后台"按钮

2. **仪表板**
   - 查看总体统计数据
   - 查看用户分布、会话分布等

3. **用户管理**
   - 查看所有用户列表
   - 编辑用户信息
   - 删除用户

4. **会话管理**
   - 查看所有会话
   - 监控用户活动

5. **活动日志**
   - 查看系统活动
   - 实时监控用户行为

## 🔧 开发指南

### 前端开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 后端开发

```bash
# 启动开发服务器（带热重载）
npm run dev

# 启动生产服务器
npm start

# 初始化数据库（创建管理员用户）
npm run seed
```

### API 端点

#### 认证 API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

#### 会话 API
- `GET /api/conversations` - 获取会话列表
- `GET /api/conversations/:id` - 获取单个会话
- `GET /api/conversations/:id/messages` - 获取会话消息
- `DELETE /api/conversations/:id` - 删除会话

#### 聊天 API
- `POST /api/chat/stream` - 流式聊天（SSE）

#### 图片搜索 API
- `POST /api/image-search/search` - 图片搜索
- `POST /api/image-search/batch` - 批量图片搜索
- `GET /api/image-search/history` - 搜索历史
- `GET /api/image-search/:id` - 获取搜索结果

#### 管理 API (需要管理员权限)
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/users/:id` - 获取用户详情
- `PUT /api/admin/users/:id` - 更新用户
- `DELETE /api/admin/users/:id` - 删除用户
- `GET /api/admin/conversations` - 获取会话列表
- `GET /api/admin/activity` - 获取活动日志

## 🌟 核心功能说明

### 图片识别（图片找同款）

目前使用 mock 数据模拟图片搜索功能。在生产环境中，可以替换为真实的图片搜索服务：

**可集成的服务：**
- Google Cloud Vision + Shopping Search
- Pinterest API
- 淘宝/京东商品搜索API
- eBay Browse API
- Bing Visual Search

**集成步骤：**
1. 在 `backend/src/services/imageSearchService.js` 中替换 `searchSimilarImages` 函数
2. 在 `.env` 中配置相应的 API 密钥
3. 根据API文档调整请求和响应处理

### 用户认证

- 使用 JWT 进行无状态认证
- 密码使用 bcryptjs 进行哈希加密
- Token 存储在 localStorage
- 请求时通过 Authorization header 传递 token
- Token 过期后自动跳转登录页

### Dify 工作流集成

- 通过 Dify API 调用不同场景的工作流
- 支持 SSE 流式响应
- 支持文件上传
- 每个场景使用独立的 API Key

## 📊 数据库模型

### User（用户）
- name: 用户名
- email: 邮箱
- password: 密码（哈希）
- role: 角色（Free, PLUS, PRO, ADMIN）
- credits: 积分
- avatar: 头像
- joinDate: 注册时间

### Conversation（会话）
- userId: 用户ID
- contextId: 上下文ID
- name: 会话名称
- difyConversationId: Dify会话ID
- mode: 模式
- tab: 标签

### Message（消息）
- conversationId: 会话ID
- userId: 用户ID
- role: 角色
- content: 内容
- files: 附件
- generatedFiles: 生成文件
- creditsUsed: 消耗积分

### ImageSearch（图片搜索）
- userId: 用户ID
- imageUrl: 图片URL
- imageType: 图片类型
- searchResults: 搜索结果
- status: 状态

## 🔒 安全建议

1. **修改默认密码**
   - 登录后立即修改管理员密码
   - 在生产环境中使用强密码

2. **环境变量**
   - 不要将 `.env` 文件提交到版本控制
   - 在生产环境使用不同的 JWT_SECRET

3. **HTTPS**
   - 生产环境使用 HTTPS
   - 配置 CORS 允许的域名

4. **数据库**
   - 使用数据库认证
   - 定期备份数据

5. **文件上传**
   - 限制文件类型和大小
   - 扫描上传的文件

## 📝 待办事项

- [ ] 集成真实图片搜索API
- [ ] 实现支付系统
- [ ] 添加邮件验证
- [ ] 实现团队协作功能
- [ ] 添加数据导出功能
- [ ] 实现消息推送
- [ ] 添加更多数据分析图表

## 🐛 故障排除

### MongoDB 连接失败

确保 MongoDB 服务正在运行：
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongodb
```

### 后端启动失败

检查端口是否被占用：
```bash
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001
```

### 前端无法连接后端

检查 CORS 配置和 API_URL 设置：
- 确认后端正在运行
- 检查 `.env.local` 中的 `VITE_API_URL`
- 检查后端 `.env` 中的 `CORS_ORIGIN`

## 📄 许可证

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至: support@procureai.com
