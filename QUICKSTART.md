# 快速启动指南

如果 `start.bat` 无法运行，请按照以下步骤手动启动服务：

## 方法一：手动启动（推荐）

### 步骤 1: 打开第一个终端窗口（后端）

```batch
cd D:\智能体应用\procureai0111\backend
npm run dev
```

等待看到以下输出表示成功：
```
🚀 Server running at http://localhost:3001
```

### 步骤 2: 打开第二个终端窗口（前端）

```batch
cd D:\智能体应用\procureai0111
npm run dev
```

等待看到以下输出表示成功：
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 步骤 3: 初始化数据库（首次使用）

在第三个终端窗口运行：

```batch
cd D:\智能体应用\procureai0111\backend
npm run seed
```

## 方法二：使用 PowerShell 启动

创建文件 `start.ps1`，然后右键选择"使用 PowerShell 运行"：

```powershell
# PowerShell 启动脚本
Write-Host "Starting ProcureAI Services..." -ForegroundColor Cyan
Write-Host ""

# 启动后端
Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd backend && npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# 启动前端
Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Services started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host
```

## 方法三：分别安装依赖

如果依赖未安装：

### 安装前端依赖
```batch
cd D:\智能体应用\procureai0111
npm install
```

### 安装后端依赖
```batch
cd D:\智能体应用\procureai0111\backend
npm install
```

## 访问应用

启动成功后，在浏览器中打开：
- **前端**: http://localhost:5173
- **后端**: http://localhost:3001/api

## 默认管理员账号

- 邮箱: admin@procureai.com
- 密码: admin123

## 常见问题

### Q: start.bat 提示"不是可运行的程序"

**解决方案:**
1. 右键点击 start.bat
2. 选择"以管理员身份运行"
3. 或者使用方法一的手动启动方式

### Q: MongoDB 连接失败

**解决方案:**
1. 确保 MongoDB 服务正在运行
2. 检查 `backend\.env` 中的 `MONGODB_URI` 配置
3. 如果使用 MongoDB Atlas，确保连接字符串正确

### Q: 端口被占用

**解决方案:**
- 后端默认端口: 3001
- 前端默认端口: 5173

如果端口被占用，可以在配置文件中修改：
- 后端: `backend\.env` 中的 `PORT`
- 前端: Vite 默认会自动选择可用端口

### Q: 依赖安装失败

**解决方案:**
1. 清除 npm 缓存: `npm cache clean --force`
2. 删除 node_modules 文件夹
3. 重新运行 `npm install`
4. 如果使用国内网络，可以设置 npm 源:
   ```batch
   npm config set registry https://registry.npmmirror.com
   ```

## 停止服务

在对应的终端窗口中按 `Ctrl + C` 停止服务，或直接关闭窗口。
