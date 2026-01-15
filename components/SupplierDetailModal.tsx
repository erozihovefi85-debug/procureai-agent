import React, { useState, useEffect } from 'react';
import { Supplier, SupplierFormData, SupplierPriority, SupplierStatus } from '../types';
import { supplierAPI } from '../services/api';
import {
  XIcon, BuildingIcon, UsersIcon, PhoneIcon, MailIcon,
  MapPinIcon, CalendarIcon, EditIcon, SaveIcon, XCircleIcon
} from './Icons';

interface SupplierDetailModalProps {
  supplierId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplierId,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData | null>(null);

  // 获取供应商详情
  const fetchSupplier = async () => {
    if (!supplierId) return;

    try {
      setLoading(true);
      const response = await supplierAPI.getById(supplierId);
      setSupplier(response.data);
      setFormData({
        name: response.data.name,
        foundedDate: response.data.foundedDate || '',
        businessDirection: response.data.businessDirection,
        contactInfo: response.data.contactInfo,
        customerCases: response.data.customerCases,
        capabilities: response.data.capabilities,
        certifications: response.data.certifications,
        tags: response.data.tags,
        notes: response.data.notes || '',
        priority: response.data.priority,
      });
    } catch (error) {
      console.error('Failed to fetch supplier:', error);
      alert('加载供应商详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && supplierId) {
      fetchSupplier();
    } else if (isOpen && !supplierId) {
      // 创建新供应商模式，初始化空白表单
      setSupplier(null);
      setFormData({
        name: '',
        foundedDate: '',
        businessDirection: [],
        contactInfo: {},
        customerCases: [],
        capabilities: [],
        certifications: [],
        tags: [],
        notes: '',
        priority: 'medium',
      });
      setIsEditing(true);
    }
  }, [isOpen, supplierId]);

  // 保存编辑
  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);
      if (supplierId) {
        // 更新现有供应商
        await supplierAPI.update(supplierId, formData);
        await fetchSupplier();
      } else {
        // 创建新供应商
        await supplierAPI.create({
          ...formData,
          source: 'manual',
        });
      }
      setIsEditing(false);
      onUpdate?.();
      alert(supplierId ? '保存成功' : '创建成功');
    } catch (error) {
      console.error('Failed to save supplier:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 添加标签
  const handleAddTag = (tag: string) => {
    if (!formData || !tag.trim()) return;
    setFormData({
      ...formData,
      tags: [...formData.tags, tag.trim()]
    });
  };

  // 删除标签
  const handleRemoveTag = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  // 添加业务方向
  const handleAddBusinessDirection = (direction: string) => {
    if (!formData || !direction.trim()) return;
    setFormData({
      ...formData,
      businessDirection: [...formData.businessDirection, direction.trim()]
    });
  };

  // 删除业务方向
  const handleRemoveBusinessDirection = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      businessDirection: formData.businessDirection.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-emerald-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                <BuildingIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {supplierId ? (supplier?.name || '供应商详情') : '添加供应商'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {supplierId ? (supplier?.foundedDate || '成立时间未填写') : '填写供应商基本信息'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="编辑"
                >
                  <EditIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-400">加载中...</div>
            </div>
          ) : isEditing && formData ? (
            <EditForm
              formData={formData}
              onChange={setFormData}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onAddBusinessDirection={handleAddBusinessDirection}
              onRemoveBusinessDirection={handleRemoveBusinessDirection}
            />
          ) : supplier ? (
            <DetailView supplier={supplier} />
          ) : null}
        </div>

        {/* 底部操作栏 */}
        {isEditing && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={() => {
                if (supplier) {
                  // 编辑模式：取消编辑并恢复原数据
                  setIsEditing(false);
                  setFormData({
                    name: supplier.name,
                    foundedDate: supplier.foundedDate || '',
                    businessDirection: supplier.businessDirection,
                    contactInfo: supplier.contactInfo,
                    customerCases: supplier.customerCases,
                    capabilities: supplier.capabilities,
                    certifications: supplier.certifications,
                    tags: supplier.tags,
                    notes: supplier.notes || '',
                    priority: supplier.priority,
                  });
                } else {
                  // 新建模式：关闭弹窗
                  onClose();
                }
              }}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-all font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {supplierId ? '保存中...' : '创建中...'}
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  {supplierId ? '保存' : '创建'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 详情视图组件
const DetailView: React.FC<{ supplier: Supplier }> = ({ supplier }) => {
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
    <div className="space-y-6">
      {/* 状态标签 */}
      <div className="flex gap-2">
        <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getPriorityColor(supplier.priority)}`}>
          优先级: {supplier.priority === 'high' ? '高' : supplier.priority === 'medium' ? '中' : '低'}
        </span>
        <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(supplier.status)}`}>
          状态: {supplier.status === 'active' ? '活跃' :
                  supplier.status === 'contacted' ? '已联系' :
                  supplier.status === 'in_discussion' ? '洽谈中' :
                  supplier.status === 'partner' ? '合作伙伴' : '非活跃'}
        </span>
        <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${supplier.interviewScheduled ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
          {supplier.interviewScheduled ? '已约谈' : '未约谈'}
        </span>
      </div>

      {/* 基本信息 */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
          <BuildingIcon className="w-4 h-4" />
          基本信息
        </h3>
        <div className="space-y-3">
          <InfoRow label="供应商名称" value={supplier.name} />
          <InfoRow label="成立时间" value={supplier.foundedDate || '未填写'} />
          <InfoRow
            label="业务方向"
            value={supplier.businessDirection.length > 0 ? supplier.businessDirection.join(', ') : '未填写'}
          />
          <InfoRow
            label="来源"
            value={supplier.source === 'ai' ? 'AI推荐' : supplier.source === 'import' ? '导入' : '手动添加'}
          />
          {supplier.notes && (
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">备注</p>
              <p className="text-sm text-slate-700">{supplier.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* 联系方式 */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
          <PhoneIcon className="w-4 h-4" />
          联系方式
        </h3>
        <div className="space-y-3">
          {supplier.contactInfo.person && (
            <InfoRow label="联系人" value={supplier.contactInfo.person} icon={<UsersIcon className="w-4 h-4" />} />
          )}
          {supplier.contactInfo.phone && (
            <InfoRow label="电话" value={supplier.contactInfo.phone} icon={<PhoneIcon className="w-4 h-4" />} />
          )}
          {supplier.contactInfo.email && (
            <InfoRow label="邮箱" value={supplier.contactInfo.email} icon={<MailIcon className="w-4 h-4" />} />
          )}
          {supplier.contactInfo.wechat && (
            <InfoRow label="微信" value={supplier.contactInfo.wechat} />
          )}
          {supplier.contactInfo.address && (
            <InfoRow label="地址" value={supplier.contactInfo.address} icon={<MapPinIcon className="w-4 h-4" />} />
          )}
        </div>
      </div>

      {/* 客户案例 */}
      {supplier.customerCases.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">客户案例</h3>
          <div className="space-y-3">
            {supplier.customerCases.map((caseItem, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-slate-200">
                {caseItem.title && (
                  <p className="text-sm font-medium text-slate-800 mb-1">{caseItem.title}</p>
                )}
                {caseItem.description && (
                  <p className="text-xs text-slate-600">{caseItem.description}</p>
                )}
                {caseItem.year && (
                  <p className="text-xs text-slate-500 mt-1">{caseItem.year}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 能力和资质 */}
      {(supplier.capabilities.length > 0 || supplier.certifications.length > 0) && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">能力和资质</h3>
          {supplier.capabilities.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-2">核心能力</p>
              <div className="flex flex-wrap gap-2">
                {supplier.capabilities.map((capability, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          )}
          {supplier.certifications.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">认证资质</p>
              <div className="flex flex-wrap gap-2">
                {supplier.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 标签 */}
      {supplier.tags.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">标签</h3>
          <div className="flex flex-wrap gap-2">
            {supplier.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 约谈信息 */}
      {supplier.interviewScheduled && (
        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            约谈信息
          </h3>
          {supplier.interviewDate && (
            <InfoRow
              label="约谈日期"
              value={new Date(supplier.interviewDate).toLocaleString('zh-CN')}
            />
          )}
          {supplier.interviewResult && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs text-green-600 mb-1">约谈结果</p>
              <p className="text-sm text-green-800">{supplier.interviewResult}</p>
            </div>
          )}
          {supplier.interviewNotes && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs text-green-600 mb-1">备注</p>
              <p className="text-sm text-green-800">{supplier.interviewNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 编辑表单组件
interface EditFormProps {
  formData: SupplierFormData;
  onChange: (data: SupplierFormData) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (index: number) => void;
  onAddBusinessDirection: (direction: string) => void;
  onRemoveBusinessDirection: (index: number) => void;
}

const EditForm: React.FC<EditFormProps> = ({
  formData,
  onChange,
  onAddTag,
  onRemoveTag,
  onAddBusinessDirection,
  onRemoveBusinessDirection
}) => {
  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">基本信息</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">供应商名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">成立时间</label>
            <input
              type="text"
              value={formData.foundedDate || ''}
              onChange={(e) => onChange({ ...formData, foundedDate: e.target.value })}
              placeholder="例如：2010年"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">业务方向</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.businessDirection.map((direction, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 flex items-center gap-1"
                >
                  {direction}
                  <button
                    onClick={() => onRemoveBusinessDirection(index)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <XCircleIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="添加业务方向"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onAddBusinessDirection((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="添加业务方向"]') as HTMLInputElement;
                  if (input?.value) {
                    onAddBusinessDirection(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
              >
                添加
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">优先级</label>
              <select
                value={formData.priority}
                onChange={(e) => onChange({ ...formData, priority: e.target.value as SupplierPriority })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 联系方式 */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">联系方式</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">联系人</label>
            <input
              type="text"
              value={formData.contactInfo.person || ''}
              onChange={(e) => onChange({
                ...formData,
                contactInfo: { ...formData.contactInfo, person: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">电话</label>
            <input
              type="text"
              value={formData.contactInfo.phone || ''}
              onChange={(e) => onChange({
                ...formData,
                contactInfo: { ...formData.contactInfo, phone: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">邮箱</label>
            <input
              type="email"
              value={formData.contactInfo.email || ''}
              onChange={(e) => onChange({
                ...formData,
                contactInfo: { ...formData.contactInfo, email: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">微信</label>
            <input
              type="text"
              value={formData.contactInfo.wechat || ''}
              onChange={(e) => onChange({
                ...formData,
                contactInfo: { ...formData.contactInfo, wechat: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">地址</label>
            <input
              type="text"
              value={formData.contactInfo.address || ''}
              onChange={(e) => onChange({
                ...formData,
                contactInfo: { ...formData.contactInfo, address: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 标签 */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">标签</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200 flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => onRemoveTag(index)}
                className="hover:text-red-600 transition-colors"
              >
                <XCircleIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="添加标签"
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddTag((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="添加标签"]') as HTMLInputElement;
              if (input?.value) {
                onAddTag(input.value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all"
          >
            添加
          </button>
        </div>
      </div>

      {/* 备注 */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">备注</h3>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => onChange({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="添加备注信息..."
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        />
      </div>
    </div>
  );
};

// 信息行组件
const InfoRow: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="text-slate-400 mt-0.5">{icon}</div>}
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
};

export default SupplierDetailModal;
