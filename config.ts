
// API 基础配置
// Dify API URL - used by backend service for server-to-server calls
export const API_BASE_URL = 'https://api.dify.ai/v1';

// Backend API URL - used by frontend for all operations
export const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// --- User Identity Management ---

const USER_STORAGE_KEY = 'procureai_user_id';

/**
 * Generate a random UUID-like string
 */
const generateUUID = (): string => {
    return 'user-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Initialize or retrieve the current user ID.
 * Logic: Check LocalStorage -> If missing, Generate New -> Save to LocalStorage
 */
const initializeUser = (): string => {
    // 1. Try to get from LocalStorage
    let userId = localStorage.getItem(USER_STORAGE_KEY);
    
    // 2. If not found, generate new and save
    if (!userId) {
        userId = generateUUID();
        localStorage.setItem(USER_STORAGE_KEY, userId);
    }

    return userId;
};

// Export the determined User ID to be used throughout the app
export const CURRENT_USER_ID = initializeUser();

// --- API Key Management ---

// API Key 映射配置
// 请在此处将 'YOUR_..._KEY' 替换为您 Dify 平台对应应用的实际 API Key
// key 对应 App.tsx 中的 contextId
const CONTEXT_API_KEYS: Record<string, string | undefined> = {
    // 私家买手助理 (Casual Mode)
    'casual_main': 'app-ay5UT5TnYR83d2guU5enM4oG',
    
    // 规范采购 (Standard Mode) - 各个子功能对应不同的应用 ID
    'standard_keyword': 'app-mHlMUk8iNbR756RPw9FkwlC2',     // 需求澄清
    'standard_docgen': 'app-mHlMUk8iNbR756RPw9FkwlC2',       // 文档生成
    'standard_supplier': 'app-mHlMUk8iNbR756RPw9FkwlC2',     // 供应商匹配
    'standard_price': 'app-mHlMUk8iNbR756RPw9FkwlC2',        // 价格分析
};

/**
 * 根据上下文 ID 获取对应的 API Key
 */
export const getApiKey = (contextId: string): string => {
    const key = CONTEXT_API_KEYS[contextId];
    
    // 如果配置了具体的 Key 且不是默认占位符，则使用该 Key
    if (key && !key.startsWith('YOUR_')) {
        return key;
    }
    
    // 否则回退到环境变量中的默认 API_KEY (主要用于开发调试)
    return process.env.API_KEY || '';
};