import React, { useState, useEffect } from 'react';
import {
  PlusIcon, EditIcon, TrashIcon, CheckIcon, CloseIcon,
  UploadIcon, DownloadIcon, SearchIcon, FileTextIcon
} from './Icons';

interface ProcurementCategory {
  _id: string;
  name: string;
  code: string;
  description: string;
  keywords: string[];
  enabled: boolean;
  priority: number;
  templateConfig: {
    columns: Array<{
      key: string;
      label: string;
      required: boolean;
      width: number;
      type: string;
      options?: string[];
      instruction?: string;
      example?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoryTemplatesProps {
  API_BASE_URL: string;
}

const CategoryTemplates: React.FC<CategoryTemplatesProps> = ({ API_BASE_URL }) => {
  const [categories, setCategories] = useState<ProcurementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFieldsModal, setShowFieldsModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProcurementCategory | null>(null);
  const [viewingCategoryFields, setViewingCategoryFields] = useState<ProcurementCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    keywords: '',
    priority: 0,
    enabled: true,
  });

  // 获取认证token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('procureai_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // 加载品类模板列表
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/procurement-categories`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('加载品类模板失败');
      }

      const result = await response.json();
      setCategories(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error('Load categories error:', err);
      setError('加载品类模板失败，请稍后重试');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化默认模板
  const initDefaultTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/procurement-categories/init-defaults`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ force: false }), // 不强制覆盖，只添加缺失的
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.message?.includes('已存在')) {
          // 如果已存在，询问是否强制重新初始化
          if (confirm('系统已存在品类模板，是否要强制重新初始化？这将删除所有现有模板并创建默认模板。')) {
            const forceResponse = await fetch(`${API_BASE_URL}/procurement-categories/init-defaults`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ force: true }),
            });
            if (forceResponse.ok) {
              const result = await forceResponse.json();
              alert(result.message || '默认模板已重新初始化');
              loadCategories();
            } else {
              throw new Error('强制重新初始化失败');
            }
          }
        } else {
          throw new Error(error.message || '初始化默认模板失败');
        }
      } else {
        const result = await response.json();
        alert(result.message || '默认模板初始化成功');
        loadCategories();
      }
    } catch (err) {
      console.error('Init defaults error:', err);
      alert('初始化默认模板失败: ' + (err as Error).message);
    }
  };

  // 打开新增/编辑模态框
  const openModal = (category: ProcurementCategory | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        code: category.code,
        description: category.description || '',
        keywords: category.keywords?.join(', ') || '',
        priority: category.priority || 0,
        enabled: category.enabled,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        keywords: '',
        priority: 0,
        enabled: true,
      });
    }
    setShowModal(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      keywords: '',
      priority: 0,
      enabled: true,
    });
  };

  // 打开字段查看器
  const openFieldsModal = (category: ProcurementCategory) => {
    setViewingCategoryFields(category);
    setShowFieldsModal(true);
  };

  // 关闭字段查看器
  const closeFieldsModal = () => {
    setShowFieldsModal(false);
    setViewingCategoryFields(null);
  };

  // 保存品类模板
  const saveCategory = async () => {
    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      };

      const url = editingCategory
        ? `${API_BASE_URL}/procurement-categories/${editingCategory._id}`
        : `${API_BASE_URL}/procurement-categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '保存失败');
      }

      closeModal();
      loadCategories();
    } catch (err) {
      console.error('Save category error:', err);
      alert('保存失败: ' + (err as Error).message);
    }
  };

  // 删除品类模板
  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`确定要删除品类模板"${name}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/procurement-categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      loadCategories();
    } catch (err) {
      console.error('Delete category error:', err);
      alert('删除失败: ' + (err as Error).message);
    }
  };

  // 切换启用状态
  const toggleEnabled = async (category: ProcurementCategory) => {
    try {
      const response = await fetch(`${API_BASE_URL}/procurement-categories/${category._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...category,
          enabled: !category.enabled,
        }),
      });

      if (!response.ok) {
        throw new Error('更新状态失败');
      }

      loadCategories();
    } catch (err) {
      console.error('Toggle enabled error:', err);
      alert('更新状态失败: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 过滤品类列表
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索品类模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
              onClick={() => {
                if (confirm('确定要重新初始化默认品类模板吗？这将添加缺失的默认模板。')) {
                  initDefaultTemplates();
                }
              }}
            >
              <UploadIcon className="w-4 h-4" />
              更多操作
            </button>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          新增品类模板
        </button>
      </div>

      {/* 品类模板列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">加载中...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={loadCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl">
          <UploadIcon className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-slate-500 mb-2">暂无品类模板</p>
          <p className="text-sm text-slate-400 mb-4">创建品类模板以支持不同的采购需求清单格式</p>
          {categories.length === 0 && (
            <button
              onClick={initDefaultTemplates}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              初始化默认模板
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${
                category.enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">{category.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">代码: {category.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEnabled(category)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      category.enabled
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {category.enabled ? '已启用' : '已禁用'}
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-slate-600 mb-4">{category.description}</p>
              )}

              {category.keywords && category.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">关键词:</p>
                  <div className="flex flex-wrap gap-1">
                    {category.keywords.slice(0, 5).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                    {category.keywords.length > 5 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
                        +{category.keywords.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-400">
                  字段数: {category.templateConfig?.columns?.length || 0}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openFieldsModal(category)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="查看字段"
                  >
                    <FileTextIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openModal(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id, category.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCategory ? '编辑品类模板' : '新增品类模板'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  品类名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：软件开发、硬件采购"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  品类代码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：software_development"
                  disabled={!!editingCategory}
                />
                <p className="text-xs text-slate-400 mt-1">唯一标识，只能包含小写字母、数字和下划线</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  品类描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="描述该品类包含的内容..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  关键词
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="用逗号分隔，如：软件,开发,系统,平台"
                />
                <p className="text-xs text-slate-400 mt-1">用于AI自动识别匹配该品类</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    优先级
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-400 mt-1">数字越小越优先</p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">启用该模板</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveCategory}
                disabled={!formData.name || !formData.code}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCategory ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 字段查看模态框 */}
      {showFieldsModal && viewingCategoryFields && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewingCategoryFields.name} - 模板字段</h3>
                <p className="text-sm text-slate-500 mt-1">代码: {viewingCategoryFields.code}</p>
              </div>
              <button
                onClick={closeFieldsModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="mb-6">
                <h4 className="font-bold text-slate-700 mb-3">字段列表 ({viewingCategoryFields.templateConfig?.columns?.length || 0})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">字段名称</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">字段键</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">类型</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">必填</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">列宽</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">选项/示例</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingCategoryFields.templateConfig?.columns?.map((column, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">{column.label}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{column.key}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              column.type === 'text' ? 'bg-blue-100 text-blue-600' :
                              column.type === 'number' ? 'bg-green-100 text-green-600' :
                              column.type === 'date' ? 'bg-purple-100 text-purple-600' :
                              column.type === 'select' ? 'bg-orange-100 text-orange-600' :
                              column.type === 'textarea' ? 'bg-pink-100 text-pink-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {column.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {column.required ? (
                              <span className="text-red-500">✓</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{column.width}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                            {column.options?.join(', ') || column.example || column.instruction || '-'}
                          </td>
                        </tr>
                      ))}
                      {(!viewingCategoryFields.templateConfig?.columns || viewingCategoryFields.templateConfig.columns.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            暂无字段配置
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewingCategoryFields.templateConfig?.sheets && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-3">工作表配置</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingCategoryFields.templateConfig.sheets.map((sheet, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          sheet.type === 'main' ? 'bg-blue-100 text-blue-700' :
                          sheet.type === 'summary' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-600'
                        } ${sheet.enabled ? 'opacity-100' : 'opacity-50'}`}
                      >
                        {sheet.name} ({sheet.type})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                提示: 要编辑字段，请使用API直接更新或编辑数据库记录
              </p>
              <button
                onClick={closeFieldsModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTemplates;
