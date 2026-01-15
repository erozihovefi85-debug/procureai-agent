
import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, CheckIcon, GiftIcon, UserIcon } from './Icons';
import { User } from '../types';

interface HomeViewProps {
  onSelectMode: (mode: 'casual' | 'standard') => void;
  onLoginRequest: () => void;
  onGoToUserCenter?: () => void;
  user: User | null;
}

/**
 * Toast Notification Component
 */
const Toast: React.FC<{ message: string; isVisible: boolean; onClose: () => void }> = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 2000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                <SparklesIcon className="w-4 h-4 text-yellow-400" />
                {message}
            </div>
        </div>
    );
};

/**
 * Dynamic Particle Background
 */
const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const particleCount = Math.min(Math.floor(width * height / 15000), 100); 
        const connectionDistance = 120;
        const mouseDistance = 150;

        let mouseX = -1000;
        let mouseY = -1000;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                const colors = ['rgba(148, 163, 184, ', 'rgba(59, 130, 246, ', 'rgba(16, 185, 129, '];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;
                    this.vx -= forceDirectionX * force * 0.05;
                    this.vy -= forceDirectionY * force * 0.05;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + '0.5)';
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p, index) => {
                p.update();
                p.draw();

                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(203, 213, 225, ${1 - distance / connectionDistance})`; 
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseDistance) {
                     ctx.beginPath();
                     ctx.strokeStyle = `rgba(59, 130, 246, ${1 - distance / mouseDistance})`; 
                     ctx.lineWidth = 0.8;
                     ctx.moveTo(p.x, p.y);
                     ctx.lineTo(mouseX, mouseY);
                     ctx.stroke();
                }
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };
        
        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

/**
 * Customer Logo Component
 */
const CompanyLogo: React.FC<{ name: string; type: 'alibaba' | 'tencent' | 'bytedance' | 'deepseek' | 'zhipu' | 'moonshot' | 'minimax' | 'meituan' }> = ({ name, type }) => {
    return (
        <div className="flex items-center gap-2 group cursor-default grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
             <div className="w-8 h-8 rounded flex items-center justify-center shrink-0">
                {type === 'alibaba' && <span className="font-bold text-orange-500 text-xl italic">Al</span>}
                {type === 'tencent' && <span className="font-bold text-blue-600 text-lg">T</span>}
                {type === 'bytedance' && (
                    <div className="flex space-x-0.5">
                        <div className="w-1.5 h-4 bg-cyan-400 -skew-x-12"></div>
                        <div className="w-1.5 h-5 bg-blue-500 -skew-x-12"></div>
                    </div>
                )}
                {type === 'meituan' && <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black">M</div>}
                {type === 'deepseek' && <div className="w-6 h-6 bg-blue-700 text-white flex items-center justify-center font-serif font-bold text-xs rounded-tr-lg rounded-bl-lg">DS</div>}
                {type === 'zhipu' && <div className="w-6 h-6 border-2 border-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-600">GL</div>}
                {type === 'moonshot' && <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                {type === 'minimax' && <span className="font-bold text-red-500 text-xl">M</span>}
             </div>
             <span className="font-semibold text-slate-600 group-hover:text-slate-900 text-sm md:text-base">{name}</span>
        </div>
    );
};

/**
 * Navbar Component
 */
const Navbar: React.FC<{ onShowToast: (msg: string) => void; onLoginRequest: () => void; onGoToUserCenter?: () => void; user: User | null }> = ({ onShowToast, onLoginRequest, onGoToUserCenter, user }) => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-6 transition-all">
            <div className="flex items-center gap-3">
                 {/* Browser/Brand Icon */}
                 <div className="w-9 h-9 p-1.5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full overflow-visible">
                       <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                 </div>
                 {/* Metallic Text Style */}
                 <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 tracking-tight italic pr-2">
                    ProcureAI
                 </span>
            </div>

            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => onShowToast('积分系统即将上线，敬请期待！')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors"
                 >
                    <GiftIcon className="w-4 h-4" />
                    <span>领取积分</span>
                 </button>
                 
                 <button 
                    onClick={() => {
                        document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hidden md:block text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
                 >
                    价格
                 </button>

                 {user ? (
                   <button
                     onClick={onGoToUserCenter || (() => onShowToast('用户中心功能开发中'))}
                     className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 transition-all hover:bg-blue-100"
                   >
                      <UserIcon className="w-4 h-4" />
                      <span className="text-xs font-bold truncate max-w-[80px]">{user.name}</span>
                   </button>
                 ) : (
                   <button 
                      onClick={onLoginRequest}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                   >
                      登录
                   </button>
                 )}
            </div>
        </nav>
    );
};

/**
 * Pricing Card Component
 */
const PricingCard: React.FC<{
    title: string;
    price: string;
    period?: string;
    features: string[];
    isPopular?: boolean;
    buttonText?: string;
    subPrice?: string;
    onAction: () => void;
}> = ({ title, price, period, features, isPopular, buttonText = "当前计划", subPrice, onAction }) => {
    return (
        <div className={`relative p-8 rounded-2xl bg-white border ${isPopular ? 'border-teal-500 shadow-xl scale-105 z-10' : 'border-slate-100 shadow-lg'} flex flex-col transition-transform duration-300 hover:-translate-y-1`}>
            {isPopular && (
                <div className="absolute top-0 right-0 bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    PLUS
                </div>
            )}
            
            <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full mb-4">
                    {title}
                </span>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-800">{price}</span>
                    {period && <span className="text-slate-500 text-sm">{period}</span>}
                </div>
                {subPrice && <p className="text-xs text-teal-600 mt-1 font-medium">{subPrice}</p>}
                {!subPrice && <p className="text-xs text-slate-400 mt-1 h-4"> </p>}
            </div>

            <div className="flex-1 space-y-4 mb-8">
                {features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckIcon className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                    </div>
                ))}
            </div>

            <button 
                onClick={onAction}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    isPopular 
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md' 
                    : 'bg-slate-500 text-white hover:bg-slate-600'
                }`}
            >
                {buttonText}
            </button>
        </div>
    );
};

const HomeView: React.FC<HomeViewProps> = ({ onSelectMode, onLoginRequest, onGoToUserCenter, user }) => {
  const [selectedMode, setSelectedMode] = useState<'casual' | 'standard' | null>(null);
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({ msg: '', show: false });

  const showToast = (msg: string) => {
      setToast({ msg, show: true });
  };

  return (
    <div className="relative h-screen bg-slate-50 overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast(p => ({ ...p, show: false }))} />
      <Navbar onShowToast={showToast} onLoginRequest={onLoginRequest} onGoToUserCenter={onGoToUserCenter} user={user} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col snap-start">
          {/* 动态粒子背景 */}
          <ParticleBackground />

          {/* 主体内容 */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center pt-28 pb-10">
              <div className="mb-12 animate-fadeIn">
                <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">AI采购助手</h1>
                <p className="text-slate-500 text-lg md:text-xl font-light">既是小助理，亦是大专家</p>
              </div>

              <div className="w-full max-w-sm space-y-4 relative">
                {/* Casual Button */}
                <button
                  onClick={() => setSelectedMode('casual')}
                  className={`w-full p-4 rounded-xl transition-all duration-300 border shadow-sm flex items-center justify-center gap-3 backdrop-blur-sm
                    ${selectedMode === 'casual'
                      ? 'bg-blue-600/90 text-white border-blue-600 shadow-blue-200 ring-2 ring-blue-200 transform scale-105'
                      : 'bg-white/80 text-slate-700 hover:bg-white hover:text-blue-600 border-slate-200 hover:shadow-md'
                    }`}
                >
                  {/* 小美头像 - SVG */}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      {/* 脸部 */}
                      <circle cx="32" cy="32" r="20" fill="#FFDAB9" />
                      {/* 头发 */}
                      <path d="M12 32 Q12 12 32 12 Q52 12 52 32 Q52 24 48 20 Q44 16 40 16 Q36 16 32 16 Q28 16 24 16 Q20 16 16 20 Q12 24 12 32" fill="#4A3728" />
                      {/* 眼睛 */}
                      <ellipse cx="26" cy="30" rx="3" ry="4" fill="#333" />
                      <ellipse cx="38" cy="30" rx="3" ry="4" fill="#333" />
                      {/* 微笑 */}
                      <path d="M27 40 Q32 44 37 40" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                      {/* 腮红 */}
                      <circle cx="20" cy="36" r="3" fill="#FFB6C1" opacity="0.5" />
                      <circle cx="44" cy="36" r="3" fill="#FFB6C1" opacity="0.5" />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg">买手助理小美</span>
                </button>

                {/* Standard Button */}
                <button
                  onClick={() => setSelectedMode('standard')}
                  className={`w-full p-4 rounded-xl transition-all duration-300 border shadow-sm flex items-center justify-center gap-3 backdrop-blur-sm
                    ${selectedMode === 'standard'
                      ? 'bg-emerald-600/90 text-white border-emerald-600 shadow-emerald-200 ring-2 ring-emerald-200 transform scale-105'
                      : 'bg-white/80 text-slate-700 hover:bg-white hover:text-emerald-600 border-slate-200 hover:shadow-md'
                    }`}
                >
                  {/* 小帅头像 - SVG */}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      {/* 脸部 */}
                      <circle cx="32" cy="32" r="20" fill="#FFE4C4" />
                      {/* 头发 */}
                      <path d="M10 28 Q10 10 32 10 Q54 10 54 28 L54 24 Q50 14 32 14 Q14 14 10 24 Z" fill="#2C1810" />
                      {/* 眼镜 */}
                      <rect x="20" y="28" width="10" height="8" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                      <rect x="34" y="28" width="10" height="8" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                      <line x1="30" y1="32" x2="34" y2="32" stroke="#1a1a1a" strokeWidth="2" />
                      {/* 眼睛 */}
                      <circle cx="25" cy="32" r="2" fill="#333" />
                      <circle cx="39" cy="32" r="2" fill="#333" />
                      {/* 微笑 */}
                      <path d="M28 42 Q32 45 36 42" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                      {/* 领带 */}
                      <path d="M32 52 L28 58 L32 60 L36 58 L32 52" fill="#10B981" />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg">采购专家小帅</span>
                </button>
              </div>

              {/* Mode Description Area */}
              <div className={`mt-8 w-full max-w-sm bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-100 transition-all duration-500 ease-in-out ${selectedMode ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-4 h-0 overflow-hidden py-0 border-0 shadow-none'}`}>
                {selectedMode === 'casual' && (
                  <div className="text-left animate-fadeIn">
                    <h3 className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 64 64" className="w-full h-full">
                          <circle cx="32" cy="32" r="20" fill="#FFDAB9" />
                          <path d="M12 32 Q12 12 32 12 Q52 12 52 32 Q52 24 48 20 Q44 16 40 16 Q36 16 32 16 Q28 16 24 16 Q20 16 16 20 Q12 24 12 32" fill="#4A3728" />
                          <ellipse cx="26" cy="30" rx="3" ry="4" fill="#333" />
                          <ellipse cx="38" cy="30" rx="3" ry="4" fill="#333" />
                          <path d="M27 40 Q32 44 37 40" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                          <circle cx="20" cy="36" r="3" fill="#FFB6C1" opacity="0.5" />
                          <circle cx="44" cy="36" r="3" fill="#FFB6C1" opacity="0.5" />
                        </svg>
                      </div>
                      买手助理小美
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                      您的私人买手，帮你遍历小红书，找出真实商品评价，并深入全网比价，帮您轻松完成购买决策。
                    </p>
                    <ul className="space-y-2 text-slate-500 text-sm mb-6">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>个性化推荐，发现好物</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>智能比价，性价比优选</li>
                    </ul>
                    <button 
                      onClick={() => onSelectMode('casual')}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      与个人采购助理对话
                    </button>
                  </div>
                )}

                {selectedMode === 'standard' && (
                  <div className="text-left animate-fadeIn">
                    <h3 className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 64 64" className="w-full h-full">
                          <circle cx="32" cy="32" r="20" fill="#FFE4C4" />
                          <path d="M10 28 Q10 10 32 10 Q54 10 54 28 L54 24 Q50 14 32 14 Q14 14 10 24 Z" fill="#2C1810" />
                          <rect x="20" y="28" width="10" height="8" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                          <rect x="34" y="28" width="10" height="8" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                          <line x1="30" y1="32" x2="34" y2="32" stroke="#1a1a1a" strokeWidth="2" />
                          <circle cx="25" cy="32" r="2" fill="#333" />
                          <circle cx="39" cy="32" r="2" fill="#333" />
                          <path d="M28 42 Q32 45 36 42" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                          <path d="M32 52 L28 58 L32 60 L36 58 L32 52" fill="#10B981" />
                        </svg>
                      </div>
                      采购专家小帅
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                      AI驱动的极速寻源智能体，解决企业采购人员寻源耗时多，效率低，缺少可信供应商资源，供应商风险把控难等问题。
                    </p>
                    <ul className="space-y-2 text-slate-500 text-sm mb-6">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>制定详细采购方案</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>大幅缩短供应商寻源周期</li>
                    </ul>
                     <button 
                      onClick={() => onSelectMode('standard')}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      与采购专家对话
                    </button>
                  </div>
                )}
              </div>
          </div>
          
           {/* 客户墙 - Fixed at bottom of hero section */}
           <div className="relative z-10 bg-white/60 backdrop-blur-sm border-t border-slate-200">
              <div className="max-w-6xl mx-auto px-6 py-8">
                  <h4 className="text-center text-slate-400 text-sm font-semibold uppercase tracking-widest mb-8">
                      我们的合作伙伴
                  </h4>
                  <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-90">
                      <CompanyLogo type="alibaba" name="Alibaba Cloud" />
                      <CompanyLogo type="tencent" name="Tencent" />
                      <CompanyLogo type="bytedance" name="ByteDance" />
                      <CompanyLogo type="meituan" name="Meituan" />
                      
                      <div className="hidden md:block w-px h-8 bg-slate-300 mx-2"></div>

                      <CompanyLogo type="deepseek" name="DeepSeek" />
                      <CompanyLogo type="zhipu" name="Zhipu AI" />
                      <CompanyLogo type="moonshot" name="Moonshot AI" />
                      <CompanyLogo type="minimax" name="MiniMax" />
                  </div>
              </div>
          </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="relative z-10 bg-slate-50 py-24 px-6 min-h-screen snap-start flex items-center justify-center">
          <div className="max-w-6xl mx-auto w-full">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">订阅计划与价格</h2>
                  <p className="text-slate-500">选择适合您团队的采购智能化方案</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                  <PricingCard 
                      title="Free"
                      price="免费"
                      features={[
                          "注册获得100积分",
                          "访问个人采购助理",
                          "允许3个上传分析",
                          "基础采购建议"
                      ]}
                      buttonText="当前计划"
                      onAction={() => showToast('免费计划已包含在您的账户中')}
                  />
                  <PricingCard 
                      title="PLUS"
                      price="19.9元"
                      period="/月"
                      subPrice="每月节省 20"
                      isPopular={true}
                      features={[
                          "每月2,000积分",
                          "包含所有 Free 功能",
                          "解锁规范采购模式",
                          "文档生成 (30篇/月)",
                          "优先客户支持"
                      ]}
                      buttonText="升级到 PLUS"
                      onAction={() => showToast('支付系统即将上线')}
                  />
                  <PricingCard 
                      title="PRO"
                      price="2000"
                      period="/月"
                      subPrice="每月节省 100"
                      features={[
                          "每月14,000积分",
                          "包含所有 PLUS 功能",
                          "无限次文档生成",
                          "多账号团队协作",
                          "专属客户经理"
                      ]}
                      buttonText="升级到 PRO"
                      onAction={() => showToast('支付系统即将上线')}
                  />
              </div>
          </div>
      </section>
    </div>
  );
};

export default HomeView;
