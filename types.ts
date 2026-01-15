
import React from 'react';

// File Types supported by Dify
export type DifyFileType = 'image' | 'document' | 'video' | 'audio' | 'custom';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: number;
  created_at: number;
}

export interface DifyGeneratedFile {
  dify_model_identity?: string;
  id?: string;
  tenant_id?: string;
  type?: string;
  transfer_method?: string;
  remote_url?: string;
  related_id?: string;
  filename: string;
  extension?: string;
  mime_type?: string;
  size?: number;
  url: string;
}

export interface FilePayload {
  type: DifyFileType;
  transfer_method: 'remote_url' | 'local_file';
  url?: string;
  upload_file_id?: string;
}

export interface ChatMessageRequest {
  inputs: Record<string, any>;
  query: string;
  response_mode: 'streaming' | 'blocking';
  conversation_id: string;
  user: string;
  files: FilePayload[];
}

export interface Conversation {
  id: string;
  name: string;
  inputs: Record<string, any>;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
  files?: UploadedFile[]; 
  generated_files?: DifyGeneratedFile[];
  isTyping?: boolean; // UI state
}

export interface ConversationListResponse {
  data: Conversation[];
  has_more: boolean;
  limit: number;
}

// SSE Event Types
export interface DifyEvent {
  event: 'workflow_started' | 'node_started' | 'node_finished' | 'workflow_finished' | 'message' | 'message_end' | 'tts_message' | 'tts_message_end' | 'error' | 'ping';
  task_id?: string;
  workflow_run_id?: string;
  message_id?: string;
  conversation_id?: string;
  answer?: string;
  data?: any;
  metadata?: any;
  files?: DifyGeneratedFile[]; // Sometimes at root
  message?: string; // For error events
  code?: string; // For error events
  status?: number; // For error events
}

export enum LoadingState {
  IDLE,
  UPLOADING,
  STREAMING,
  ERROR
}

// App Navigation Types
export type AppMode = 'home' | 'casual' | 'standard' | 'user-center' | 'admin' | 'suppliers' | 'wishlist';

export interface ScenarioConfig {
    id: string;
    name: string;
    icon?: React.ReactNode;
    description?: string;
    apiKeyEnv?: string; // Key to look up in env or config
    systemPrompt?: string; // Optional UI hint
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
  role: 'Free' | 'PLUS' | 'PRO' | 'ADMIN';
  joinDate: string;
}

// Price Comparison Types
export interface Product {
  title: string;
  num_iid: string;
  price: number;
  original_price: number;
  promotion_price: number;
  pic_url: string;
  detail_url: string;
  sales: number;
  seller_nick: string;
  seller_id: string;
  is_tmall: boolean;
  platform: string;
}

export interface PriceStats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

export interface ByPlatform {
  all: Product[];
  taobao: Product[];
  tmall: Product[];
}

export interface PriceComparisonSearchOptions {
  sort?: 'price_asc' | 'price_desc' | 'sales';
  minPrice?: number;
  maxPrice?: number;
  pageSize?: number;
  page?: number;
  cat?: string;
  cache?: string;
}

export interface PriceComparisonRecord {
  _id: string;
  userId: string;
  query: string;
  products: Product[];
  stats: PriceStats;
  byPlatform: ByPlatform;
  options: PriceComparisonSearchOptions;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

// ==================== Supplier Types ====================

export type SupplierSource = 'ai' | 'manual' | 'import';
export type SupplierPriority = 'high' | 'medium' | 'low';
export type SupplierStatus = 'active' | 'contacted' | 'in_discussion' | 'partner' | 'inactive';

export interface SupplierContactInfo {
  person?: string;          // 联系人
  phone?: string;           // 电话
  email?: string;           // 邮箱
  wechat?: string;          // 微信号
  address?: string;         // 地址
}

export interface SupplierCustomerCase {
  title?: string;
  description?: string;
  year?: string;
}

export interface Supplier {
  _id: string;
  userId: string;
  conversationId?: string;

  // 基本信息
  name: string;
  foundedDate?: string;
  businessDirection: string[];
  contactInfo: SupplierContactInfo;

  // 详细信息
  customerCases: SupplierCustomerCase[];
  capabilities: string[];
  certifications: string[];
  employeeCount?: string;
  annualRevenue?: string;

  // 元数据
  source: SupplierSource;
  tags: string[];
  rating: number;
  notes?: string;

  // 约谈状态
  interviewScheduled: boolean;
  interviewDate?: string;
  interviewResult?: string;
  interviewNotes?: string;

  // 优先级和状态
  priority: SupplierPriority;
  status: SupplierStatus;

  createdAt: string;
  updatedAt: string;
}

export interface SupplierListResponse {
  data: Supplier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupplierStats {
  total: number;
  interviewScheduled: number;
  notInterviewed: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  recentActivity: Array<{
    _id: string;
    name: string;
    updatedAt: string;
    status: SupplierStatus;
  }>;
}

export interface SupplierFormData {
  name: string;
  foundedDate?: string;
  businessDirection: string[];
  contactInfo: SupplierContactInfo;
  customerCases: SupplierCustomerCase[];
  capabilities: string[];
  certifications: string[];
  tags: string[];
  notes?: string;
  priority: SupplierPriority;
}

// ==================== Product Wishlist Types ====================

export type ProductSource = 'ai' | 'manual' | 'import';
export type ProductPriority = 'high' | 'medium' | 'low';
export type ProductStatus = 'pending' | 'ordered' | 'purchased' | 'cancelled';

export interface ProductWishlistItem {
  _id: string;
  userId: string;
  conversationId?: string;

  // 基本信息
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  purchaseUrl: string;
  imageUrl?: string;
  platform?: string;  // 淘宝、京东、拼多多等

  // 详细信息
  category?: string;
  brand?: string;
  specifications?: Record<string, string>; // 规格、尺寸等
  notes?: string;

  // 元数据
  source: ProductSource;
  tags: string[];
  rating: number;  // 用户评分 1-5

  // 订单状态
  status: ProductStatus;
  orderDate?: string;
  orderQuantity?: number;

  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  data: ProductWishlistItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductStats {
  total: number;
  ordered: number;
  purchased: number;
  pending: number;
  totalValue: number;  // 总价值
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  recentActivity: Array<{
    _id: string;
    name: string;
    updatedAt: string;
    status: ProductStatus;
  }>;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  purchaseUrl: string;
  imageUrl?: string;
  platform?: string;
  category?: string;
  brand?: string;
  specifications?: Record<string, string>;
  tags: string[];
  notes?: string;
  priority: ProductPriority;
}
