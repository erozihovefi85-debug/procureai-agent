
# AI 采购助手 (ProcureAI Agent)

这是一个基于 React + TypeScript + Tailwind CSS 构建的智能采购助手前端应用，后端集成 Dify Workflow API。该系统旨在通过 AI 智能体协助用户完成采购需求澄清、文档生成、供应商匹配及价格分析等任务。

## ✨ 主要功能

### 1. 双模式体验
*   **随心采购 (Casual Mode)**: 
    *   提供类似 ChatGPT 的通用对话体验。
    *   蓝色主题，轻松活泼。
    *   支持历史会话管理（新建、切换、删除）。
    *   适合日常询价、灵感探索。
*   **规范采购 (Standard Mode)**:
    *   专为企业级采购流程设计。
    *   绿色主题，专业严谨。
    *   **多场景支持**:
        *   **需求澄清**: 智能提取采购文本中的关键要素。
        *   **文档生成**: 自动生成标准的采购需求书 (PR/RFQ)。
        *   **供应商匹配**: 基于需求推荐优质供应商。
        *   **价格分析**: 提供历史价格走势与市场比价。
    *   每个场景拥有独立的历史会话记录，互不干扰。

### 2. 核心特性
*   **流式响应 (Streaming)**: 实时打字机效果，快速反馈 AI 思考过程。
*   **多媒体支持**:
    *   支持上传图片、文档（PDF, Word, Excel 等）进行分析。
    *   支持解析并下载 AI 生成的文件（如自动生成的采购文档）。
*   **会话管理**:
    *   基于 LocalStorage 的本地会话历史存储。
    *   自动生成用户 ID (UUID) 并持久化。
    *   支持删除单条会话记录。
*   **UI/UX 优化**:
    *   **首页**: 动态粒子背景 + 头部客户展示墙。
    *   **响应式布局**: 完美适配移动端与桌面端。
    *   **便捷操作**: 一键复制消息内容、悬浮回到顶部按钮、文件卡片下载。

## 🛠 技术栈

*   **前端框架**: React 18+ (Hooks, Functional Components)
*   **语言**: TypeScript
*   **样式**: Tailwind CSS
*   **图标库**: 自定义 SVG 图标组件
*   **API 集成**: Dify API (SSE 流式传输, Multipart 文件上传)

## ⚙️ 配置说明

项目的核心配置位于 `config.ts` 文件中。

### 1. API 基础地址
配置为后端服务地址（推荐使用 HTTPS 以避免浏览器安全限制）：
```typescript
export const API_BASE_URL = 'https://ai.llmol.com/v1';
```

### 2. API Key 配置
不同的功能模块对应 Dify 平台上不同的应用 (App)。请在 `config.ts` 的 `CONTEXT_API_KEYS` 对象中填入您实际的 API Key。

```typescript
const CONTEXT_API_KEYS = {
    'casual_main': 'YOUR_CASUAL_APP_KEY',       // 随心采购
    'standard_keyword': 'YOUR_KEYWORD_APP_KEY', // 需求澄清
    'standard_docgen': 'YOUR_DOCGEN_APP_KEY',   // 文档生成
    'standard_supplier': 'YOUR_SUPPLIER_KEY',   // 供应商匹配
    'standard_price': 'YOUR_PRICE_KEY',         // 价格分析
};
```

## 🚀 快速开始

1.  **安装依赖**
    ```bash
    npm install
    ```

2.  **启动开发服务器**
    ```bash
    npm run dev
    ```

3.  **构建生产版本**
    ```bash
    npm run build
    ```

## 📂 目录结构

```
/
├── components/         # UI 组件
│   ├── ChatArea.tsx    # 核心聊天区域（消息列表、输入框）
│   ├── HomeView.tsx    # 首页（粒子背景、入口）
│   ├── Sidebar.tsx     # 侧边栏（历史记录）
│   ├── StandardView.tsx# 规范采购布局（Tab 切换）
│   └── Icons.tsx       # SVG 图标集合
├── services/           # API 服务层
│   └── difyService.ts  # 封装 Dify API 调用 (Fetch, SSE)
├── types.ts            # TypeScript 类型定义
├── config.ts           # 全局配置 (API URL, Keys, User ID)
├── App.tsx             # 主应用入口与状态管理
├── index.html          # HTML 入口
└── README.md           # 说明文档
```
