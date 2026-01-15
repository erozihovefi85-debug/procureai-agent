import React, { useState, useEffect } from 'react';
import { Supplier, SupplierStats } from '../types';
import { supplierAPI } from '../services/api';
import {
  BuildingIcon, UsersIcon, CalendarIcon, PhoneIcon, MailIcon,
  MapPinIcon, PlusIcon, SearchIcon, FilterIcon, ImportIcon,
  ExportIcon, CheckCircleIcon, ClockIcon, StarIcon, ChatIcon
} from './Icons';
import SupplierDetailModal from './SupplierDetailModal';

interface SupplierFavoritesProps {
  userId: string;
  onBackToChat?: (conversationId?: string) => void; // 返回聊天的回调
  lastConversationId?: string; // 最后的会话ID
}

const SupplierFavorites: React.FC<SupplierFavoritesProps> = ({ userId, onBackToChat, lastConversationId }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 获取供应商列表
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierAPI.getAll({
        search: searchQuery || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      setSuppliers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await supplierAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [searchQuery, selectedStatus]);

  // 删除供应商
  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个供应商吗？')) return;
    try {
      await supplierAPI.delete(id);
      fetchSuppliers();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      alert('删除失败，请重试');
    }
  };

  // 导出供应商
  const handleExport = async () => {
    try {
      const response = await supplierAPI.export();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `suppliers-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    }
  };

  // 导入供应商
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await supplierAPI.import(file);
      alert(`成功导入 ${response.data.imported} 个供应商`);
      fetchSuppliers();
      fetchStats();
    } catch (error) {
      console.error('Import failed:', error);
      alert('导入失败，请检查文件格式');
    }
    event.target.value = '';
  };

  // 打开供应商详情
  const handleOpenDetail = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplierId(null);
  };

  // 更新后的回调
  const handleSupplierUpdated = () => {
    fetchSuppliers();
    fetchStats();
  };

  return (
    <>
    <div className="h-full flex flex-col bg-slate-50">
      {/* 顶部统计卡片 */}
      {stats && (
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">总供应商</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{stats.total}</p>
                  </div>
                  <BuildingIcon className="w-8 h-8 text-blue-300" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-medium">已约谈</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{stats.interviewScheduled}</p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-green-300" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-600 font-medium">待约谈</p>
                    <p className="text-2xl font-bold text-amber-700 mt-1">{stats.notInterviewed}</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-amber-300" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-600 font-medium">高优先级</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">{stats.byPriority?.high || 0}</p>
                  </div>
                  <StarIcon className="w-8 h-8 text-purple-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 搜索和筛选栏 */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索供应商名称、业务方向..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FilterIcon className="w-5 h-5" />
              <span>筛选</span>
            </button>

            {/* 导入按钮 */}
            <label className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
              <ImportIcon className="w-5 h-5" />
              <span>导入</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {/* 导出按钮 */}
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <ExportIcon className="w-5 h-5" />
              <span>导出</span>
            </button>

            {/* 返回聊天按钮 */}
            {onBackToChat && (
              <button
                onClick={() => onBackToChat(lastConversationId)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <ChatIcon className="w-5 h-5" />
                <span>返回聊天</span>
              </button>
            )}

            {/* 添加供应商按钮 */}
            <button
              onClick={() => {
                setSelectedSupplierId(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              <span>添加供应商</span>
            </button>
          </div>

          {/* 筛选选项 */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">状态</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">全部状态</option>
                    <option value="active">活跃</option>
                    <option value="contacted">已联系</option>
                    <option value="in_discussion">洽谈中</option>
                    <option value="partner">合作伙伴</option>
                    <option value="inactive">非活跃</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">优先级</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">全部优先级</option>
                    <option value="high">高优先级</option>
                    <option value="medium">中优先级</option>
                    <option value="low">低优先级</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 供应商列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-400">加载中...</div>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <BuildingIcon className="w-16 h-16 mb-4 text-slate-200" />
              <p className="text-lg font-medium mb-2">暂无供应商</p>
              <p className="text-sm">点击"添加供应商"或从AI对话中收藏</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <SupplierCard
                  key={supplier._id}
                  supplier={supplier}
                  onDelete={handleDelete}
                  onViewDetail={handleOpenDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* 供应商详情模态框 */}
    <SupplierDetailModal
      supplierId={selectedSupplierId}
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onUpdate={handleSupplierUpdated}
    />
    </>
  );
};

// 供应商卡片组件
interface SupplierCardProps {
  supplier: Supplier;
  onDelete: (id: string) => void;
  onViewDetail: (id: string) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onDelete, onViewDetail }) => {
  const [showContact, setShowContact] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'contacted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_discussion': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'partner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-4 cursor-pointer" onClick={() => onViewDetail(supplier._id)}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-800 truncate">{supplier.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{supplier.foundedDate || '成立时间未填写'}</p>
        </div>
        <div className="flex gap-1.5">
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(supplier.priority)}`}>
            {supplier.priority === 'high' ? '高' : supplier.priority === 'medium' ? '中' : '低'}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(supplier.status)}`}>
            {supplier.status === 'active' ? '活跃' :
             supplier.status === 'contacted' ? '已联系' :
             supplier.status === 'in_discussion' ? '洽谈中' :
             supplier.status === 'partner' ? '合作伙伴' : '非活跃'}
          </span>
        </div>
      </div>

      {/* 业务方向 */}
      {supplier.businessDirection.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1.5">业务方向</p>
          <div className="flex flex-wrap gap-1.5">
            {supplier.businessDirection.slice(0, 3).map((direction, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600"
              >
                {direction}
              </span>
            ))}
            {supplier.businessDirection.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500">
                +{supplier.businessDirection.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 客户案例 */}
      {supplier.customerCases.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1.5">客户案例</p>
          <div className="text-xs text-slate-600 line-clamp-2">
            {supplier.customerCases[0].title} - {supplier.customerCases[0].description}
          </div>
        </div>
      )}

      {/* 联系方式 */}
      {showContact && supplier.contactInfo && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          {supplier.contactInfo.person && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <UsersIcon className="w-4 h-4 text-slate-400" />
              <span>{supplier.contactInfo.person}</span>
            </div>
          )}
          {supplier.contactInfo.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <PhoneIcon className="w-4 h-4 text-slate-400" />
              <span>{supplier.contactInfo.phone}</span>
            </div>
          )}
          {supplier.contactInfo.email && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MailIcon className="w-4 h-4 text-slate-400" />
              <span>{supplier.contactInfo.email}</span>
            </div>
          )}
          {supplier.contactInfo.address && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPinIcon className="w-4 h-4 text-slate-400" />
              <span className="line-clamp-1">{supplier.contactInfo.address}</span>
            </div>
          )}
        </div>
      )}

      {/* 底部操作按钮 */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowContact(!showContact);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            showContact
              ? 'bg-slate-100 text-slate-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showContact ? '隐藏联系方式' : '查看联系方式'}
        </button>

        {supplier.interviewScheduled ? (
          <button
            disabled
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <CheckCircleIcon className="w-4 h-4" />
            已约谈
          </button>
        ) : (
          <button
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-all"
          >
            安排约谈
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(supplier._id);
          }}
          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
        >
          删除
        </button>
      </div>

      {/* 约谈日期 */}
      {supplier.interviewDate && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarIcon className="w-4 h-4" />
            <span>约谈时间: {new Date(supplier.interviewDate).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierFavorites;
