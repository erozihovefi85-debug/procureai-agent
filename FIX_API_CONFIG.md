# 前端配置检查和修复

## 当前问题
- 前端运行在 3000 端口（Vite 自动选择）
- 后端运行在 3001 端口
- 前端配置的 API 地址可能不正确

## 修复步骤

### 1. 更新前端 API 配置

检查 `.env.local` 文件中的 `VITE_API_URL`。

如果前端运行在 3000，但后端在 3001，需要确保：

```env
# 如果前端在 3000 端口
VITE_API_URL=http://localhost:3001/api
VITE_DIFY_API_BASE=https://api.dify.ai/v1
```

### 2. 重启前端服务

更新 `.env.local` 后需要重启前端：

```batch
# 在前端终端按 Ctrl+C 停止
# 然后重新运行
cd D:\智能体应用\procureai0111
npm run dev
```

### 3. 确认正确访问地址

**前端地址**：http://localhost:3000（或 Vite 显示的实际端口）
**后端地址**：http://localhost:3001/api

### 4. 测试后端 API

在浏览器打开：http://localhost:3001/api

应该看到：
```json
{
  "name": "ProcureAI Backend API",
  "version": "1.0.0",
  "status": "running"
}
```

## 如果看到 "Route not found"

这是因为您访问的是后端根路径（如 http://localhost:3001），而不是 API 路径。

**正确访问路径**：
- ✅ http://localhost:3001/api
- ❌ http://localhost:3001

## 完整启动流程

### 1. 启动后端（终端1）
```batch
cd D:\智能体应用\procureai0111\backend
npm run dev
```

### 2. 更新前端配置（如果需要）

编辑 `.env.local`：
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. 启动前端（终端2）
```batch
cd D:\智能体应用\procureai0111
npm run dev
```

### 4. 记录前端实际端口

查看前端终端输出，找到类似：
```
➜  Local:   http://localhost:XXXXX/
```

这个 `XXXXX` 就是实际端口（可能是 3000、5173 或其他）

### 5. 访问前端

使用步骤 4 记录的端口访问，例如：
```
http://localhost:3000
```

## 测试登录功能

1. 访问前端（如 http://localhost:3000）
2. 点击"登录"
3. 点击"立即注册"
4. 填写信息并注册

如果还是失败，请：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签的错误信息
3. 查看 Network 标签，检查 API 请求的状态

## 常见问题

### 问题 1：前端显示 `Network Error`

**原因**：前端无法连接到后端

**解决**：
1. 检查后端是否正常运行
2. 检查 `.env.local` 中的 `VITE_API_URL`
3. 应该是 `http://localhost:3001/api`

### 问题 2：前端显示 `502 Bad Gateway`

**原因**：后端未正常运行或崩溃

**解决**：
1. 检查后端终端是否有错误
2. 重启后端服务

### 问题 3：浏览器控制台显示 CORS 错误

**原因**：跨域配置问题

**解决**：
1. 检查后端 `.env` 中的 `CORS_ORIGIN`
2. 应该包含前端端口，如：
   ```
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   ```

## 快速修复命令

### 更新前端配置（使用实际前端端口）

如果前端在 3000 端口：

```batch
# 创建或更新 .env.local
echo VITE_API_URL=http://localhost:3001/api > .env.local
echo VITE_DIFY_API_BASE=https://api.dify.ai/v1 >> .env.local
```

### 重启前端

```batch
# 在前端终端按 Ctrl+C
# 然后重新运行
cd D:\智能体应用\procureai0111
npm run dev
```

## 验证配置

### 检查前端配置文件

```batch
type .env.local
```

应该看到：
```
VITE_API_URL=http://localhost:3001/api
VITE_DIFY_API_BASE=https://api.dify.ai/v1
```

### 测试后端连接

```batch
curl http://localhost:3001/api
```

或直接在浏览器打开：http://localhost:3001/api

## 总结

1. **后端**：http://localhost:3001/api
2. **前端**：http://localhost:3000（或实际端口）
3. **前端配置**：`VITE_API_URL=http://localhost:3001/api`
4. **访问**：在浏览器打开前端地址，不是后端地址

现在按照上述步骤操作，应该可以正常登录了！
