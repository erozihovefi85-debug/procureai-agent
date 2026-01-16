import React, { useState, useEffect } from 'react';
import { BookmarkIcon, BookmarkCheckIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { supplierAPI } from '../services/api';

interface SupplierBookmarkButtonProps {
  supplierInfo: {
    name: string;
    foundedDate?: string;
    businessDirection?: string[];
    contactInfo?: {
      person?: string;
      phone?: string;
      email?: string;
      wechat?: string;
      address?: string;
    };
    customerCases?: Array<{
      title?: string;
      description?: string;
      year?: string;
    }>;
  };
  conversationId?: string;
  userId?: string;
  onBookmarked?: (supplier: any) => void;
}

const SupplierBookmarkButton: React.FC<SupplierBookmarkButtonProps> = ({
  supplierInfo,
  conversationId,
  userId,
  onBookmarked,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 检查供应商是否已在收藏夹中
  useEffect(() => {
    const checkIfBookmarked = async () => {
      if (!userId) {
        console.log('[SupplierBookmarkButton] No userId, skipping bookmark check');
        return;
      }

      try {
        // console.log('[SupplierBookmarkButton] Checking bookmark for:', supplierInfo.name, 'userId:', userId);
        const response = await supplierAPI.getAll({ page: 1, limit: 100 });
        // console.log('[SupplierBookmarkButton] All suppliers:', response.data?.data?.length, 'items');

        const existingSupplier = response.data?.data?.find((s: any) => {
          const match = s.name === supplierInfo.name && s.userId === userId;
          // console.log('[SupplierBookmarkButton] Comparing:', s.name, 'with', supplierInfo.name, 'match:', match);
          return match;
        });

        // console.log('[SupplierBookmarkButton] Existing supplier found:', !!existingSupplier);
        setIsBookmarked(!!existingSupplier);
      } catch (error) {
        console.error('[SupplierBookmarkButton] Check bookmark status error:', error);
      }
    };

    checkIfBookmarked();
  }, [supplierInfo.name, userId]);

  const handleBookmark = async () => {
    if (isBookmarked || isLoading) return;

    setIsLoading(true);
    try {
      const supplierData = {
        name: supplierInfo.name,
        foundedDate: supplierInfo.foundedDate,
        businessDirection: supplierInfo.businessDirection || [],
        contactInfo: supplierInfo.contactInfo || {},
        customerCases: supplierInfo.customerCases || [],
        capabilities: [],
        certifications: [],
        tags: [],
        source: 'ai',
        priority: 'medium' as const,
        conversationId,
      };

      const response = await supplierAPI.create(supplierData);
      setIsBookmarked(true);

      if (onBookmarked) {
        onBookmarked(response.data);
      }

      // 显示成功提示
      showNotification('供应商已添加到收藏夹');
    } catch (error) {
      console.error('Bookmark supplier error:', error);
      showNotification('添加失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // 简单的通知实现，可以后续升级为更优雅的通知组件
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  return (
    <div className="my-4 border border-blue-200 rounded-lg bg-blue-50/50 overflow-hidden">
      {/* 折叠标题栏 */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-600 text-sm font-semibold">供</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {supplierInfo.name}
            </p>
            {supplierInfo.businessDirection && supplierInfo.businessDirection.length > 0 && (
              <p className="text-xs text-slate-500 truncate">
                {supplierInfo.businessDirection.join('、')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {isBookmarked ? (
            <div className="flex items-center gap-1 text-green-600 px-2 md:px-3 py-1.5 rounded-lg bg-green-50 text-xs md:text-sm font-medium">
              <BookmarkCheckIcon className="w-4 h-4" />
              <span className="hidden sm:inline">已收藏</span>
              <span className="sm:hidden">已收藏</span>
            </div>
          ) : (
            <button
              onClick={handleBookmark}
              disabled={isLoading}
              className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                isLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <BookmarkIcon className="w-4 h-4" />
              <span>{isLoading ? '添加中...' : '收藏'}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 展开的详细信息 */}
      {isExpanded && (
        <div className="px-3 md:px-4 pb-4 space-y-3 border-t border-blue-100 pt-3">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-sm">
            {supplierInfo.foundedDate && (
              <div>
                <span className="text-slate-500 text-xs">成立时间：</span>
                <span className="text-slate-700">{supplierInfo.foundedDate}</span>
              </div>
            )}
            {supplierInfo.contactInfo?.person && (
              <div>
                <span className="text-slate-500 text-xs">联系人：</span>
                <span className="text-slate-700">{supplierInfo.contactInfo.person}</span>
              </div>
            )}
          </div>

          {/* 业务方向 */}
          {supplierInfo.businessDirection && supplierInfo.businessDirection.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">业务方向</p>
              <div className="flex flex-wrap gap-1.5">
                {supplierInfo.businessDirection.map((direction, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600"
                  >
                    {direction}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 客户案例 */}
          {supplierInfo.customerCases && supplierInfo.customerCases.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">客户案例</p>
              <div className="space-y-1.5">
                {supplierInfo.customerCases.map((caseItem, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white border border-slate-100 rounded text-xs"
                  >
                    {caseItem.title && (
                      <p className="font-medium text-slate-700 mb-0.5">{caseItem.title}</p>
                    )}
                    {caseItem.description && (
                      <p className="text-slate-500">{caseItem.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierBookmarkButton;
