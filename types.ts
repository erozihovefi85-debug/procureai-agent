
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
export type AppMode = 'home' | 'casual' | 'standard' | 'user-center';

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
  role: 'Free' | 'PLUS' | 'PRO';
  joinDate: string;
}
