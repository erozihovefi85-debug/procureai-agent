
import React, { useState } from 'react';
import { CloseIcon, UserIcon, KeyIcon, LoaderIcon, CheckCircleIcon } from './Icons';
import { User } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

// 预设内测账号
const TEST_ACCOUNTS = [
  { email: 'admin@procure.ai', label: '超级管理员', role: 'PRO' as const },
  { email: 'pro@procure.ai', label: '专业采购员', role: 'PLUS' as const },
  { email: 'test@procure.ai', label: '普通用户', role: 'Free' as const },
];

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = (userEmail: string, userRole: 'Free' | 'PLUS' | 'PRO' = 'PLUS') => {
    setIsLoading(true);
    setError('');

    // 模拟 API 调用延迟
    setTimeout(() => {
      const mockUser: User = {
        id: 'user-auth-' + Math.random().toString(36).substr(2, 9),
        name: userEmail.split('@')[0],
        email: userEmail,
        credits: userRole === 'PRO' ? 14000 : userRole === 'PLUS' ? 2000 : 800,
        role: userRole,
        joinDate: new Date().toISOString().split('T')[0]
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    executeLogin(email);
  };

  const handleQuickLogin = (acc: typeof TEST_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('123456');
    executeLogin(acc.email, acc.role);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <UserIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">内测用户登录</h2>
            <p className="text-slate-500 text-sm mt-1">登录您的账号以解锁“规范采购”等进阶功能</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">邮箱地址</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyIcon className="w-4 h-4" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs mt-1 ml-1 bg-red-50 p-2 rounded-lg border border-red-100">
                <span className="w-1 h-1 rounded-full bg-red-500 shrink-0"></span>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : '立即登录'}
            </button>
          </form>

          <div className="mt-8 space-y-6">
            {/* Quick Login Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">内测账号直登</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {TEST_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    disabled={isLoading}
                    className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{acc.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{acc.email}</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                      acc.role === 'PRO' ? 'bg-purple-100 text-purple-600' : 
                      acc.role === 'PLUS' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {acc.role}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Contact Info */}
            <div className="pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 leading-relaxed">
                还没有账号？<br />
                请联系官方体验官 <span className="text-blue-600 font-bold border-b border-blue-200">13458512978</span> 可加微信
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
