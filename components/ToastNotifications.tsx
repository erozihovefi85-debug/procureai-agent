import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, XIcon, RobotIcon } from './Icons';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'task_complete';
  title: string;
  message?: string;
  duration?: number; // 自动关闭时间（毫秒），0表示不自动关闭
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastNotificationsProps {
  notifications: ToastNotification[];
  onClose: (id: string) => void;
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({
  notifications,
  onClose
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => (
        <ToastNotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

interface ToastNotificationItemProps {
  notification: ToastNotification;
  onClose: (id: string) => void;
}

const ToastNotificationItem: React.FC<ToastNotificationItemProps> = ({
  notification,
  onClose
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // 等待动画完成
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'task_complete':
        return <RobotIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <RobotIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500';
      case 'error':
        return 'bg-white border-l-4 border-red-500';
      case 'task_complete':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-l-4 border-blue-400';
      default:
        return 'bg-white border-l-4 border-blue-500';
    }
  };

  const getTitleColor = () => {
    if (notification.type === 'task_complete') return 'text-white';
    return 'text-slate-800';
  };

  const getMessageColor = () => {
    if (notification.type === 'task_complete') return 'text-blue-50';
    return 'text-slate-600';
  };

  return (
    <div
      className={`
        pointer-events-auto transform transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className={`${getStyles()} rounded-lg shadow-lg p-4 min-w-[300px]`}>
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${getTitleColor()}`}>
              {notification.title}
            </h4>
            {notification.message && (
              <p className={`text-sm mt-1 ${getMessageColor()}`}>
                {notification.message}
              </p>
            )}
            {notification.action && (
              <button
                onClick={() => {
                  notification.action!.onClick();
                  handleClose();
                }}
                className={`mt-2 text-sm font-medium ${
                  notification.type === 'task_complete'
                    ? 'text-white hover:text-blue-100'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {notification.action.label} →
              </button>
            )}
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${
              notification.type === 'task_complete'
                ? 'text-white hover:text-blue-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotifications;
