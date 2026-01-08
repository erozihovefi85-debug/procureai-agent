# 部署指南

## 快速部署到 Lighthouse

### 1. 推送代码到 GitHub

```bash
cd "d:/智能体应用/procureai-agent (4)"

# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit for deployment"

# 添加远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/procureai-agent.git

# 推送到 GitHub
git push -u origin main
```

### 2. 在 Lighthouse 服务器上部署

将提供给 AI 助手的仓库地址，格式如下：
```
https://github.com/YOUR_USERNAME/procureai-agent.git
```

### 3. 访问应用

部署完成后，通过以下地址访问：
```
http://1.14.64.58
```

## 项目说明

- **端口**: 80
- **技术栈**: React + Vite
- **容器化**: Nginx + Docker 多阶段构建
