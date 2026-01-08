
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import HomeView from './components/HomeView';
import StandardView from './components/StandardView';
import LoginModal from './components/LoginModal';
import UserCenter from './components/UserCenter';
import { MenuIcon, ChevronLeftIcon, ShareIcon } from './components/Icons';
import LZString from 'lz-string';
import { 
  Conversation, 
  Message, 
  LoadingState, 
  UploadedFile,
  AppMode,
  User
} from './types';
import { 
  fetchConversations, 
  uploadFile, 
  streamChatMessage,
  deleteConversation,
  fetchMessages
} from './services/difyService';
import { CURRENT_USER_ID, getApiKey } from './config';

// Config for placeholders and empty states per context
const UI_CONFIG: Record<string, { placeholder: string; emptyTitle: string; emptyDesc: string }> = {
    'casual_main': {
        placeholder: "输入你的采购需求...",
        emptyTitle: "欢迎使用随心采购",
        emptyDesc: "我将为您提供智能采购建议，让购物更加轻松愉快！"
    },
    'standard_keyword': {
        placeholder: "请详细描述您的采购需求，包括商品类型、数量、规格要求、预算范围、交付时间等信息...",
        emptyTitle: "关键词提取",
        emptyDesc: "智能分析采购文本，快速提取核心要素。"
    },
    'standard_docgen': {
        placeholder: "在此编辑采购需求文档内容...",
        emptyTitle: "采购文档生成",
        emptyDesc: "输入需求要点，自动生成标准的采购文档。"
    },
    'standard_supplier': {
        placeholder: "请输入供应商匹配的具体需求，包括：产品类型、技术规格、质量要求、服务需求、地理位置偏好等...",
        emptyTitle: "供应商匹配分析",
        emptyDesc: "基于需求匹配优质供应商，提供分析建议。"
    },
    'standard_price': {
        placeholder: "请输入需要分析的产品或服务，包括：产品名称、规格型号、数量、期望价格范围、分析周期等...",
        emptyTitle: "价格分析需求",
        emptyDesc: "提供历史价格分析与市场比价服务。"
    }
};

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(() => {
      const saved = localStorage.getItem('procureai_auth_user');
      return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- Shared View Logic ---
  const [sharedMessages, setSharedMessages] = useState<Message[] | null>(null);

  useEffect(() => {
      // Check for share_data in URL
      const params = new URLSearchParams(window.location.search);
      const shareData = params.get('share_data');
      if (shareData) {
          try {
              const jsonStr = LZString.decompressFromEncodedURIComponent(shareData);
              if (jsonStr) {
                  const payload = JSON.parse(jsonStr);
                  const msgs: Message[] = payload.map((p: any, index: number) => ({
                      id: `shared-${index}`,
                      role: p.r,
                      content: p.c,
                      created_at: Date.now(),
                      files: p.f ? p.f.map((f: any, i: number) => ({ name: f.n, size: f.s })) : [],
                      generated_files: p.g
                  }));
                  setSharedMessages(msgs);
                  return;
              }
          } catch (e) {
              console.error("Failed to parse shared data", e);
          }
      }
  }, []);

  // --- Navigation State ---
  const [appMode, setAppMode] = useState<AppMode>('home');
  const [standardTab, setStandardTab] = useState<string>('keyword');

  // --- Chat State ---
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
      try {
          const userId = user?.id || CURRENT_USER_ID;
          const saved = localStorage.getItem(`procureai_history_${userId}`);
          return saved ? JSON.parse(saved) : {};
      } catch (e) {
          return {};
      }
  });
  
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]); 
  
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [currentNodeName, setCurrentNodeName] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const currentContextId = useMemo(() => {
    if (appMode === 'casual') return 'casual_main';
    if (appMode === 'standard') return `standard_${standardTab}`;
    return 'casual_main';
  }, [appMode, standardTab]);

  const currentMessages = useMemo(() => {
    return messagesMap[currentContextId] || [];
  }, [messagesMap, currentContextId]);

  const currentUiConfig = UI_CONFIG[currentContextId] || UI_CONFIG['casual_main'];

  // Handle Auth Changes
  useEffect(() => {
      if (user) {
          localStorage.setItem('procureai_auth_user', JSON.stringify(user));
      } else {
          localStorage.removeItem('procureai_auth_user');
      }
  }, [user]);

  useEffect(() => {
      if (!sharedMessages) {
          try {
              const userId = user?.id || CURRENT_USER_ID;
              localStorage.setItem(`procureai_history_${userId}`, JSON.stringify(messagesMap));
          } catch (e) {
              console.error("Failed to save history", e);
          }
      }
  }, [messagesMap, user, sharedMessages]);

  useEffect(() => {
    if (appMode !== 'home' && appMode !== 'user-center' && !sharedMessages) {
        setCurrentConversationId('');
        loadConversations();
    }
  }, [currentContextId, appMode, sharedMessages]);

  const loadConversations = async () => {
    const userId = user?.id || CURRENT_USER_ID;
    const convs = await fetchConversations(userId, getApiKey(currentContextId));
    setConversations(convs);
  };

  const handleContextSwitch = (newMode: AppMode, newTab?: string) => {
      // Permission check: standard procurement requires login
      if (newMode === 'standard' && !user) {
          setShowLoginModal(true);
          return;
      }
      setAppMode(newMode);
      if (newTab) setStandardTab(newTab);
  };

  const handleUpdateMessages = (fn: (prev: Message[]) => Message[]) => {
      setMessagesMap(prev => ({
          ...prev,
          [currentContextId]: fn(prev[currentContextId] || [])
      }));
  };

  const handleNewChat = () => {
    setCurrentConversationId('');
    setMessagesMap(prev => ({ ...prev, [currentContextId]: [] }));
  };

  const handleSelectConversation = async (id: string) => {
    if (loadingState === LoadingState.UPLOADING || loadingState === LoadingState.STREAMING) return;
    
    setMessagesMap(prev => ({ ...prev, [currentContextId]: [] }));
    setCurrentConversationId(id);
    setLoadingState(LoadingState.IDLE); 
    
    try {
        const userId = user?.id || CURRENT_USER_ID;
        const msgs = await fetchMessages(id, userId, getApiKey(currentContextId));
        setMessagesMap(prev => ({
            ...prev,
            [currentContextId]: msgs
        }));
    } catch (e) {
        console.error("Failed to load conversation", e);
    }
  };

  const handleDeleteConversation = async (id: string) => {
      if (!window.confirm('确定要删除这个会话吗？')) return;
      
      try {
          const userId = user?.id || CURRENT_USER_ID;
          await deleteConversation(id, userId, getApiKey(currentContextId));
          if (id === currentConversationId) {
              handleNewChat();
          }
          loadConversations();
      } catch (e) {
          console.error("Delete failed", e);
      }
  };

  const handleStop = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
      }
      setLoadingState(LoadingState.IDLE);
      setCurrentNodeName(null);
      handleUpdateMessages(msgs => msgs.filter(m => !m.isTyping));
  };

  const handleSend = async (text: string, files: File[]) => {
    const currentKey = getApiKey(currentContextId);
    const userId = user?.id || CURRENT_USER_ID;
    
    // 1. Upload Files
    let uploadedFiles: UploadedFile[] = [];
    if (files.length > 0) {
      setLoadingState(LoadingState.UPLOADING);
      try {
        uploadedFiles = await Promise.all(
          files.map(f => uploadFile(f, userId, currentKey))
        );
      } catch (error) {
        setLoadingState(LoadingState.IDLE);
        return;
      }
    }

    // 2. Add User Message
    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      created_at: Date.now() / 1000,
      files: uploadedFiles
    };

    handleUpdateMessages(prev => [...prev, newUserMsg]);

    // 3. Prepare Stream
    setLoadingState(LoadingState.STREAMING);
    setCurrentNodeName(null);
    const assistantMsgId = (Date.now() + 1).toString();
    
    handleUpdateMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      created_at: Date.now() / 1000,
      isTyping: true
    }]);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let targetConvId = currentConversationId;

    await streamChatMessage(
      text,
      targetConvId,
      uploadedFiles,
      userId,
      (chunk) => {
        handleUpdateMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, content: msg.content + chunk }
            : msg
        ));
      },
      (newConversationId, generatedFiles) => {
        setLoadingState(LoadingState.IDLE);
        setCurrentNodeName(null);
        handleUpdateMessages(prev => prev.map(msg => 
            msg.id === assistantMsgId ? { ...msg, isTyping: false, generated_files: generatedFiles } : msg
        ));
        
        if (!currentConversationId && newConversationId) {
            setCurrentConversationId(newConversationId);
            loadConversations();
        }
      },
      (error) => {
        setLoadingState(LoadingState.ERROR);
        setCurrentNodeName(null);
        handleUpdateMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, isTyping: false, content: msg.content + `\n[Error: ${error}]` }
            : msg
        ));
      },
      currentKey,
      controller.signal,
      (nodeName) => {
          setCurrentNodeName(nodeName);
      }
    );

    abortControllerRef.current = null;
  };

  const handleLogin = (mockUser: User) => {
    setUser(mockUser);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setAppMode('home');
  };

  // --- Render Shared View ---
  if (sharedMessages) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center">
              <header className="w-full bg-white shadow-sm border-b border-slate-200 py-4 px-6 flex justify-between items-center sticky top-0 z-20">
                  <div className="flex items-center gap-2">
                      <ShareIcon className="w-5 h-5 text-blue-600" />
                      <h1 className="font-bold text-slate-800">对话分享</h1>
                  </div>
                  <a href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      我也要用 AI采购助手
                  </a>
              </header>
              <div className="w-full max-w-4xl flex-1 flex flex-col bg-white shadow-lg min-h-0 my-4 rounded-xl overflow-hidden border border-slate-200">
                   <ChatArea 
                      messages={sharedMessages}
                      isLoading={LoadingState.IDLE}
                      onSend={() => {}}
                      readOnly={true}
                      emptyState={{
                          title: "无分享内容",
                          description: ""
                      }}
                   />
              </div>
          </div>
      );
  }

  // --- Normal Rendering ---

  if (appMode === 'home') {
    return (
      <>
        <HomeView 
          onSelectMode={(mode) => handleContextSwitch(mode)} 
          onLoginRequest={() => setShowLoginModal(true)}
          user={user}
        />
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />}
      </>
    );
  }

  if (appMode === 'user-center' && user) {
    return (
      <UserCenter 
        user={user} 
        onBack={() => setAppMode('home')} 
        onLogout={handleLogout} 
      />
    );
  }

  const sidebarTitle = appMode === 'casual' ? '随心采购' : '规范采购';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        title={sidebarTitle}
        conversations={conversations}
        activeId={currentConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        onGoHome={() => setAppMode('home')}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onOpenUserCenter={() => setAppMode('user-center')}
        onLoginRequest={() => setShowLoginModal(true)}
      />

      <div className="relative flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
        
        {appMode === 'standard' ? (
             <StandardView 
                activeTabId={standardTab} 
                onTabChange={(id) => handleContextSwitch('standard', id)}
                onMobileMenuClick={() => setSidebarOpen(true)}
            >
                <ChatArea 
                    messages={currentMessages}
                    isLoading={loadingState}
                    onSend={handleSend}
                    onCancel={handleStop}
                    placeholder={currentUiConfig.placeholder}
                    emptyState={{
                        title: currentUiConfig.emptyTitle,
                        description: currentUiConfig.emptyDesc
                    }}
                    currentNodeName={currentNodeName}
                />
            </StandardView>
        ) : (
            <>
                <header className="h-14 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10 md:hidden">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-500">
                            <MenuIcon />
                        </button>
                        <span className="font-bold text-slate-700">随心采购</span>
                    </div>
                </header>

                <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                    <ChatArea 
                        messages={currentMessages}
                        isLoading={loadingState}
                        onSend={handleSend}
                        onCancel={handleStop}
                        placeholder={currentUiConfig.placeholder}
                        emptyState={{
                            title: currentUiConfig.emptyTitle,
                            description: currentUiConfig.emptyDesc
                        }}
                        currentNodeName={currentNodeName}
                    />
                </main>
            </>
        )}
      </div>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />}
    </div>
  );
};

export default App;
