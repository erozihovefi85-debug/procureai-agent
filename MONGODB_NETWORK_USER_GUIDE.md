# 🌐 MongoDB Network Service User 完整部署指南

## 📋 概述

本指南针对**对外提供服务**的生产环境部署，使用 Network Service User 运行 MongoDB 服务。

---

## 🚀 第一步：运行配置脚本

### 执行 PowerShell 配置脚本

右键点击 `setup-mongodb-network-user.ps1` → 选择"使用 PowerShell 运行"

**脚本会自动：**
- ✅ 创建专用数据目录
- ✅ 创建网络服务用户账户
- ✅ 配置目录权限
- ✅ 生成 MongoDB 配置文件

**生成的重要信息（请记录）：**
```
Service Account:
  Username: mongodsvc
  Password: MongoDB@2024!Secure
```

---

## 🔧 第二步：安装 MongoDB

### 下载 MongoDB

访问：https://www.mongodb.com/try/download/community

选择：
- Version: 6.0.x 或更高
- Platform: Windows
- Package: msi

### 安装配置

运行 `.msi` 安装程序：

#### Choose Setup Type
```
☑ Complete (完整安装)
```

#### Service Configuration（关键！）
```
☑ Install MongoDB as a Service
☑ Run service as Network Service user  ← 选择这个！
☑ Service Name: MongoDB
☑ Data Directory: D:\MongoDB\data  ← 使用脚本创建的目录
☑ Log Directory: D:\MongoDB\logs  ← 使用脚本创建的目录
```

#### MongoDB Compass
```
□ Install MongoDB Compass (可选，生产环境不需要)
```

点击 **Install** 完成安装。

---

## 🔐 第三步：配置安全性

### 1. 创建 MongoDB 超级管理员

**打开 MongoDB Shell：**
```batch
"C:\Program Files\MongoDB\Server\6.0\bin\mongosh.exe"
```

**执行以下命令：**
```javascript
// 切换到 admin 数据库
use admin

// 创建超级管理员
db.createUser({
  user: "admin",
  pwd: "StrongPassword123!@#",
  roles: [
    {
      role: "userAdminAnyDatabase",
      db: "admin"
    },
    {
      role: "readWriteAnyDatabase",
      db: "admin"
    },
    {
      role: "dbAdminAnyDatabase",
      db: "admin"
    }
  ]
})
```

### 2. 配置 MongoDB 启用认证

编辑 MongoDB 配置文件 `C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg`：

```yaml
systemLog:
  destination: file
  path: D:\MongoDB\logs\mongod.log
  logAppend: true
  logRotate: true
  verbosity: 1

storage:
  dbPath: D:\MongoDB\data
  journal:
    enabled: true
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4  # 根据服务器内存调整

net:
  port: 27017
  bindIp: 0.0.0.0  # 允许外部连接
  maxIncomingConnections: 10000

security:
  authorization: enabled  # 启用认证

operationProfiling:
  mode: off
  slowOpThresholdMs: 100
  rateLimit: 10

processManagement:
  windowsService:
    serviceName: MongoDB
    displayName: MongoDB Server
    description: MongoDB Database Server
    serviceUser: .\mongodsvc
    servicePassword: MongoDB@2024!Secure
```

---

## 🔥 第四步：配置防火墙

### 添加防火墙规则

**方法一：使用命令行（推荐）**

```batch
# 允许 MongoDB 端口 27017
netsh advfirewall firewall add rule name="MongoDB Server" dir=in action=allow protocol=TCP localport=27017

# 允许后端端口 3001
netsh advfirewall firewall add rule name="ProcureAI Backend" dir=in action=allow protocol=TCP localport=3001

# 允许前端端口 5173
netsh advfirewall firewall add rule name="ProcureAI Frontend" dir=in action=allow protocol=TCP localport=5173
```

**方法二：使用 Windows 防火墙图形界面**

1. 打开"Windows Defender 防火墙"
2. 点击"高级设置"
3. 左侧点击"入站规则"
4. 点击"新建规则"
5. 选择"端口" → 下一步
6. 选择 TCP → 特定本地端口：27017
7. 选择"允许连接"
8. 根据需要选择网络类型（域、专用、公用）
9. 输入名称："MongoDB Server"
10. 重复上述步骤添加端口 3001 和 5173

### 限制访问 IP（推荐）

如果只需要特定 IP 访问，使用：

```batch
# 只允许特定 IP 访问 MongoDB
netsh advfirewall firewall add rule name="MongoDB Specific IP" dir=in action=allow protocol=TCP localport=27017 remoteip=YOUR_SERVER_IP

# 禁止其他 IP 访问
netsh advfirewall firewall add rule name="MongoDB Deny" dir=in action=block protocol=TCP localport=27017
```

---

## 🌍 第五步：配置对外访问

### 1. 更新后端配置

编辑 `backend/.env`：

```env
# Server Configuration
PORT=3001
NODE_ENV=production  # 重要！生产环境

# Database Configuration
# 使用带认证的连接字符串
MONGODB_URI=mongodb://admin:StrongPassword123!@#@localhost:27017/procureai?authSource=admin

# 或者使用公网 IP（如果需要外部访问数据库）
# MONGODB_URI=mongodb://admin:StrongPassword123!@#@YOUR_PUBLIC_IP:27017/procureai?authSource=admin

# CORS Configuration（允许外部域名访问）
CORS_ORIGIN=http://your-domain.com,https://your-domain.com

# JWT Configuration（生产环境使用强密钥）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-openssl-rand-base64-64
JWT_EXPIRE=7d

# Dify API Configuration（保持不变）
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

### 2. 更新前端配置

编辑 `.env.local`：

```env
# 生产环境使用实际域名
VITE_API_URL=http://your-domain.com:3001/api
# 或者如果使用 HTTPS
# VITE_API_URL=https://your-domain.com/api

VITE_DIFY_API_BASE=https://api.dify.ai/v1
```

### 3. 配置域名解析（可选）

如果您有域名，需要：

1. **A 记录**：指向您的服务器公网 IP
2. **或者使用 CDN/反向代理**（如 Nginx）

---

## 🔧 第六步：重启服务

### 1. 重启 MongoDB 服务

```batch
# 停止 MongoDB
net stop MongoDB

# 启动 MongoDB
net start MongoDB

# 验证服务状态
sc query MongoDB
```

**期望输出：**
```
SERVICE_NAME: MongoDB
        STATE: 4 RUNNING
```

### 2. 重启后端服务

在后端终端：
```batch
# 按 Ctrl+C 停止
# 然后重新运行
cd D:\智能体应用\procureai0111\backend
npm run dev
```

### 3. 重启前端服务

在前端终端：
```batch
# 按 Ctrl+C 停止
# 然后重新运行
cd D:\智能体应用\procureai0111
npm run dev
```

---

## 🧪 第七步：测试外部访问

### 1. 测试 MongoDB 连接

**从另一台电脑测试：**

```batch
# 使用 MongoDB Shell 测试连接
"C:\Program Files\MongoDB\Server\6.0\bin\mongosh.exe" "mongodb://admin:StrongPassword123!@#@YOUR_PUBLIC_IP:27017/procureai?authSource=admin"
```

**期望结果：**
```
Connecting to: mongodb://...
procureai>
```

### 2. 测试后端 API

**从另一台电脑的浏览器访问：**

```
http://YOUR_PUBLIC_IP:3001/api
```

**期望结果：**
```json
{
  "name": "ProcureAI Backend API",
  "status": "running"
}
```

### 3. 测试前端应用

**从另一台电脑的浏览器访问：**

```
http://YOUR_PUBLIC_IP:5173
```

---

## 🔒 第八步：安全加固

### 1. 更改默认管理员密码

登录后立即更改管理员密码。

### 2. 配置 SSL/TLS（生产环境必需）

**生成自签名证书（测试用）：**

```batch
# 生成证书
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# 配置 MongoDB 使用 TLS
```

**编辑 `mongod.cfg`：**

```yaml
net:
  ssl:
    mode: requireSSL
    PEMKeyFile: D:\MongoDB\cert.pem
    PEMKeyPassword: your_cert_password
```

### 3. 限制 MongoDB 只允许本地访问

**如果不需要外部访问数据库：**

编辑 `mongod.cfg`：

```yaml
net:
  bindIp: 127.0.0.1  # 只允许本地连接
```

这样更安全，外部只能通过后端 API 访问数据。

### 4. 使用反向代理（推荐）

**使用 Nginx 反向代理：**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 同上面的 location 配置
}
```

---

## 📊 第九步：监控和日志

### 1. 配置日志轮转

MongoDB 日志自动轮转已在配置中启用：

```yaml
systemLog:
  logRotate: true  # 自动轮转
  verbosity: 1      # 日志级别
```

### 2. 查看日志

```batch
# 查看 MongoDB 日志
type D:\MongoDB\logs\mongod.log

# 实时监控日志（新窗口）
tail -f D:\MongoDB\logs\mongod.log
```

### 3. 配置监控

使用 MongoDB Compass 或第三方工具监控：
- MongoDB Atlas（云监控）
- Percona PMM
- Grafana + Prometheus

---

## 💾 第十步：备份策略

### 自动备份脚本

创建 `backup-mongodb.bat`：

```batch
@echo off
set BACKUP_DIR=D:\MongoDB\backups
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_FILE=%BACKUP_DIR%\mongobackup_%TIMESTAMP%

mkdir %BACKUP_DIR% 2>nul

echo Starting MongoDB backup...
"C:\Program Files\MongoDB\Server\6.0\bin\mongodump.exe" ^
  --host=localhost ^
  --port=27017 ^
  --username=admin ^
  --password="StrongPassword123!@#" ^
  --authenticationDatabase=admin ^
  --db=procureai ^
  --out=%BACKUP_FILE%

if %errorlevel% equ 0 (
    echo Backup completed successfully: %BACKUP_FILE%
) else (
    echo Backup failed!
)

echo.
pause
```

### 设置计划任务

使用 Windows 计划任务自动运行备份：

```batch
# 创建每日备份任务
schtasks /create /tn "MongoDB Daily Backup" ^
  /tr "D:\MongoDB\backup-mongodb.bat" ^
  /sc daily ^
  /st 02:00 ^
  /ru SYSTEM
```

---

## 🎯 完整检查清单

### 安装完成检查

- [ ] MongoDB 服务正常运行
- [ ] Network Service User 配置正确
- [ ] 防火墙规则已添加
- [ ] 认证已启用
- [ ] 管理员账户已创建
- [ ] 后端配置已更新
- [ ] 前端配置已更新
- [ ] 外部访问测试成功

### 安全检查

- [ ] 默认密码已更改
- [ ] TLS/SSL 已配置（生产环境）
- [ ] 数据库只允许本地访问（推荐）
- [ ] 防火墙只开放必要端口
- [ ] 使用强密码
- [ ] 启用日志记录
- [ ] 配置自动备份

---

## 🆘 故障排除

### 问题 1：服务无法启动

**错误：**
```
服务无法启动
```

**解决：**
```batch
# 检查日志
type D:\MongoDB\logs\mongod.log

# 检查服务状态
sc query MongoDB

# 手动启动并查看错误
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" ^
  --config "C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg"
```

### 问题 2：外部无法访问

**解决：**
1. 检查防火墙规则
2. 检查 MongoDB 配置的 `bindIp`
3. 检查路由器/云服务器的端口转发
4. 使用 `telnet YOUR_IP 27017` 测试连接

### 问题 3：认证失败

**解决：**
```batch
# 使用正确的认证字符串
mongodb://username:password@host:27017/database?authSource=admin

# 在 mongosh 中测试
mongosh "mongodb://admin:StrongPassword123!@#@localhost:27017/procureai?authSource=admin"
```

---

## 📚 参考资源

- MongoDB 官方文档：https://www.mongodb.com/docs
- Windows 服务配置：https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows
- 安全最佳实践：https://www.mongodb.com/docs/manual/administration/security-checklist

---

## 🎉 完成！

现在您的 ProcureAI 应用已经配置为对外提供服务模式。

**记住的安全要点：**
- 🔐 使用强密码
- 🔒 启用认证和 TLS
- 🌐 使用反向代理
- 📊 定期监控日志
- 💾 配置自动备份
- 🔄 定期更新软件

**祝您部署成功！** 🚀
