import React from 'react';

interface AvatarProps {
  type: 'xiaomei' | 'xiaoshuai';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ type, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden ${className}`;

  if (type === 'xiaomei') {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-pink-100 to-pink-200`}>
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
    );
  }

  // xiaoshuai
  return (
    <div className={`${baseClasses} bg-gradient-to-br from-emerald-100 to-emerald-200`}>
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
  );
};

export default Avatar;
