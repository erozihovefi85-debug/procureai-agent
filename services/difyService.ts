
import { 
  Conversation, 
  ConversationListResponse, 
  DifyFileType, 
  UploadedFile,
  DifyEvent,
  Message,
  DifyGeneratedFile
} from '../types';
import { API_BASE_URL } from '../config';

// Helper to access default API Key
const DEFAULT_API_KEY = process.env.API_KEY || '';

// Helper to determine file type based on extension
export const getFileType = (fileName: string): DifyFileType => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videoExts = ['mp4', 'mov', 'mpeg', 'webm'];
  const audioExts = ['mp3', 'm4a', 'wav', 'webm', 'mpga'];
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  return 'document';
};

export const fetchConversations = async (user: string, apiKey: string = DEFAULT_API_KEY): Promise<Conversation[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations?user=${user}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    const data: ConversationListResponse = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const deleteConversation = async (conversationId: string, user: string, apiKey: string = DEFAULT_API_KEY): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user })
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
};

export const fetchMessages = async (conversationId: string, user: string, apiKey: string = DEFAULT_API_KEY): Promise<Message[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/messages?conversation_id=${conversationId}&user=${user}&limit=100`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        const messages: Message[] = [];
        const rawMessages = (data.data || []).reverse();

        rawMessages.forEach((item: any) => {
             messages.push({
                 id: item.id + '_user',
                 role: 'user',
                 content: item.query,
                 created_at: item.created_at,
                 files: item.message_files ? item.message_files.map((f: any) => ({
                     id: f.id,
                     name: f.filename || 'file',
                     size: f.size || 0,
                     extension: f.extension || '',
                     mime_type: f.mime_type || '',
                     created_by: 0,
                     created_at: 0
                 })) : []
             });

             if (item.answer) {
                 messages.push({
                     id: item.id + '_assistant',
                     role: 'assistant',
                     content: item.answer,
                     created_at: item.created_at,
                     generated_files: item.message_files?.filter((f: any) => f.transfer_method === 'tool_file' || f.type === 'document')
                 });
             }
        });
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
};

export const uploadFile = async (file: File, user: string, apiKey: string = DEFAULT_API_KEY): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', user);
  const res = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData
  });
  if (!res.ok) throw new Error('File upload failed');
  return await res.json();
};

export const streamChatMessage = async (
  query: string,
  conversationId: string,
  uploadedFiles: UploadedFile[],
  user: string,
  onChunk: (text: string) => void,
  onMessageEnd: (conversationId: string, files?: DifyGeneratedFile[]) => void,
  onError: (err: string) => void,
  apiKey: string = DEFAULT_API_KEY,
  signal?: AbortSignal,
  onNodeChange?: (nodeName: string) => void
) => {
  const filesPayload = uploadedFiles.map(f => ({
    type: getFileType(f.name),
    transfer_method: 'local_file' as const,
    upload_file_id: f.id
  }));

  try {
    const response = await fetch(`${API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: query || ' ', 
        response_mode: 'streaming',
        conversation_id: conversationId,
        user,
        files: filesPayload
      }),
      signal: signal
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const data: any = JSON.parse(jsonStr);
            
            // Support multiple event types for text content
            // 'message' is for Chatbots, 'agent_message' is for Agents
            if ((data.event === 'message' || data.event === 'agent_message') && data.answer) {
              onChunk(data.answer);
            }
            
            // Handle message_replace (some agent tools might use this)
            if (data.event === 'message_replace' && data.answer) {
              // This is a full replacement, but for simplicity in current stream handler 
              // we can treat it as a chunk if logic is additive. 
              // In App.tsx we might need to handle replacement properly if desired.
              onChunk(data.answer); 
            }

            if (data.event === 'node_started' && onNodeChange) {
                const title = data.data?.title || data.data?.node_type || 'Processing';
                onNodeChange(title);
            }
            
            if (data.event === 'message_end' || data.event === 'workflow_finished') {
                if (data.conversation_id) {
                    let generatedFiles: DifyGeneratedFile[] | undefined = undefined;
                    if (data.files) {
                        generatedFiles = data.files;
                    } else if (data.data && data.data.files) {
                        generatedFiles = data.data.files;
                    }
                    onMessageEnd(data.conversation_id, generatedFiles);
                }
            }
            
            if (data.event === 'error') {
                onError(data.message || data.code || 'Workflow error occurred.');
            }
          } catch (e) {
            console.warn("Failed to parse SSE data", e);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return;
    onError(error instanceof Error ? error.message : "Unknown error");
  }
};
