import React, { useState } from 'react';
import { RequirementItem } from '../types/workflow';
import {
  FileIcon, EditIcon, CheckIcon, CloseIcon, DownloadIcon,
  PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon
} from './Icons';

interface RequirementListProps {
  items: RequirementItem[];
  summary?: string;
  onEdit?: (id: string, item: RequirementItem) => void;
  onDelete?: (id: string) => void;
  onAdd?: (item: Omit<RequirementItem, 'id'>) => void;
  onExport?: (format: 'word' | 'pdf' | 'json') => void;
  onConfirmAndProceed?: () => void; // 确认清单并开始寻源
  readOnly?: boolean;
}

const RequirementList: React.FC<RequirementListProps> = ({
  items,
  summary,
  onEdit,
  onDelete,
  onAdd,
  onExport,
  onConfirmAndProceed,
  readOnly = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RequirementItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RequirementItem>>({
    title: '',
    description: '',
    priority: 'medium',
    category: '其他'
  });

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, RequirementItem[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleEdit = (item: RequirementItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = () => {
    if (editForm && onEdit) {
      onEdit(editingId!, editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleAdd = () => {
    if (newItem.title && newItem.description && onAdd) {
      onAdd({
        title: newItem.title,
        description: newItem.description,
        priority: newItem.priority || 'medium',
        category: newItem.category || '其他'
      } as Omit<RequirementItem, 'id'>);
      setNewItem({
        title: '',
        description: '',
        priority: 'medium',
        category: '其他'
      });
      setShowAddForm(false);
    }
  };

  const getPriorityColor = (priority: RequirementItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: RequirementItem['priority']) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '中';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <FileIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">采购需求清单</h3>
              <p className="text-sm text-slate-600">共 {items.length} 项需求</p>
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              {onConfirmAndProceed && (
                <button
                  onClick={onConfirmAndProceed}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium shadow-sm"
                >
                  <CheckIcon className="w-4 h-4" />
                  确认清单并开始寻源
                </button>
              )}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                添加需求
              </button>
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                  <DownloadIcon className="w-4 h-4" />
                  导出
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-10">
                  <button
                    onClick={() => onExport?.('word')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    导出为 Word
                  </button>
                  <button
                    onClick={() => onExport?.('pdf')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    导出为 PDF
                  </button>
                  <button
                    onClick={() => onExport?.('json')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    导出为 JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">需求标题</label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入需求标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">需求描述</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入需求描述"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="如：设备、服务、材料"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as RequirementItem['priority'] })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!newItem.title || !newItem.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">需求概要</h4>
          <p className="text-sm text-blue-800">{summary}</p>
        </div>
      )}

      {/* Requirements List */}
      <div className="divide-y divide-slate-100">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-6 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedCategories.has(category) ? (
                  <ChevronDownIcon className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-slate-500" />
                )}
                <span className="font-semibold text-slate-800">{category}</span>
                <span className="text-xs text-slate-500">({categoryItems.length})</span>
              </div>
            </button>
            {expandedCategories.has(category) && (
              <div className="px-6 py-4 space-y-3">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    {editingId === item.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm!.title}
                          onChange={(e) => setEditForm({ ...editForm!, title: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                        />
                        <textarea
                          value={editForm!.description}
                          onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <div className="flex items-center justify-between">
                          <select
                            value={editForm!.priority}
                            onChange={(e) => setEditForm({ ...editForm!, priority: e.target.value as RequirementItem['priority'] })}
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="high">高优先级</option>
                            <option value="medium">中优先级</option>
                            <option value="low">低优先级</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <CloseIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.priority)}`}>
                              {getPriorityLabel(item.priority)}优先级
                            </span>
                            <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                          </div>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.description}</p>
                        </div>
                        {!readOnly && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete?.(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="px-6 py-12 text-center">
          <FileIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">暂无需求项</p>
          {!readOnly && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + 添加第一条需求
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RequirementList;
