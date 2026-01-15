#!/bin/bash

echo "========================================="
echo "  ProcureAI 一键部署脚本"
echo "========================================="
echo ""

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 停止旧容器
echo "🔄 停止旧容器..."
docker-compose down

# 构建并启动
echo "🚀 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 初始化数据库
echo "📊 初始化数据库 (创建管理员账户)..."
docker-compose exec -T backend node src/scripts/seed.js

# 检查服务状态
echo ""
echo "========================================="
echo "  服务状态"
echo "========================================="
docker-compose ps

echo ""
echo "========================================="
echo "  ✅ 部署完成！"
echo "========================================="
echo ""
echo "访问地址:"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:3001"
echo ""
echo "默认管理员账户:"
echo "  邮箱: admin@procureai.com"
echo "  密码: admin123"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo ""
