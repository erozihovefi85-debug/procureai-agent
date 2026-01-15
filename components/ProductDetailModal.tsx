import React, { useState, useEffect } from 'react';
import { ProductWishlistItem, ProductFormData, ProductPriority } from '../types';
import { productWishlistAPI } from '../services/api';
import {
  XIcon, SaveIcon, EditIcon, TrashIcon, LinkIcon,
  HeartIcon, PriceTagIcon, PackageIcon, PlusIcon
} from './Icons';

interface ProductDetailModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productId,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [product, setProduct] = useState<ProductWishlistItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    currency: 'CNY',
    purchaseUrl: '',
    imageUrl: '',
    platform: '',
    category: '',
    brand: '',
    specifications: {},
    tags: [],
    notes: '',
    priority: 'medium'
  });
  const [newTag, setNewTag] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // 加载商品详情
  const fetchProduct = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const response = await productWishlistAPI.getById(productId);
      setProduct(response.data);

      // 初始化表单数据
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        price: response.data.price,
        originalPrice: response.data.originalPrice || 0,
        currency: response.data.currency || 'CNY',
        purchaseUrl: response.data.purchaseUrl,
        imageUrl: response.data.imageUrl || '',
        platform: response.data.platform || '',
        category: response.data.category || '',
        brand: response.data.brand || '',
        specifications: response.data.specifications || {},
        tags: response.data.tags || [],
        notes: response.data.notes || '',
        priority: response.data.rating >= 4 ? 'high' : response.data.rating >= 3 ? 'medium' : 'low'
      });
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
      setIsEditing(false);
    } else if (isOpen && !productId) {
      // 新建商品
      setProduct(null);
      setIsEditing(true);
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        currency: 'CNY',
        purchaseUrl: '',
        imageUrl: '',
        platform: '',
        category: '',
        brand: '',
        specifications: {},
        tags: [],
        notes: '',
        priority: 'medium'
      });
    }
  }, [isOpen, productId]);

  // 保存商品
  const handleSave = async () => {
    try {
      setLoading(true);

      // 将优先级转换为评分
      const rating = formData.priority === 'high' ? 5 : formData.priority === 'medium' ? 3 : 1;

      const data = {
        ...formData,
        rating
      };

      if (productId) {
        await productWishlistAPI.update(productId, data);
      } else {
        await productWishlistAPI.create(data);
      }

      onUpdate();
      handleClose();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      // 如果后端 API 不可用,使用 localStorage
      if (error.response?.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        // 获取当前用户ID (从 localStorage 或使用默认值)
        const userId = localStorage.getItem('procureai_auth_user') ?
          JSON.parse(localStorage.getItem('procureai_auth_user')!).id :
          'default_user';

        const localProducts = localStorage.getItem(`procureai_products_${userId}`);
        let products: ProductWishlistItem[] = localProducts ? JSON.parse(localProducts) : [];

        const rating = formData.priority === 'high' ? 5 : formData.priority === 'medium' ? 3 : 1;

        if (productId) {
          // 更新现有商品
          products = products.map(p =>
            p._id === productId
              ? {
                  ...p,
                  name: formData.name,
                  description: formData.description,
                  price: formData.price,
                  originalPrice: formData.originalPrice,
                  currency: formData.currency,
                  purchaseUrl: formData.purchaseUrl,
                  imageUrl: formData.imageUrl,
                  platform: formData.platform,
                  category: formData.category,
                  brand: formData.brand,
                  specifications: formData.specifications,
                  tags: formData.tags,
                  notes: formData.notes,
                  rating,
                  updatedAt: new Date().toISOString()
                }
              : p
          );
        } else {
          // 创建新商品
          const newProduct: ProductWishlistItem = {
            _id: `product_${Date.now()}`,
            userId,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            originalPrice: formData.originalPrice,
            currency: formData.currency || 'CNY',
            purchaseUrl: formData.purchaseUrl,
            imageUrl: formData.imageUrl,
            platform: formData.platform,
            category: formData.category,
            brand: formData.brand,
            specifications: formData.specifications,
            tags: formData.tags,
            notes: formData.notes,
            source: 'manual',
            rating,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          products.push(newProduct);
        }

        localStorage.setItem(`procureai_products_${userId}`, JSON.stringify(products));
        onUpdate();
        handleClose();
      } else {
        alert('保存失败,请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 删除商品
  const handleDelete = async () => {
    if (!productId) return;
    if (!window.confirm('确定要删除这个商品吗?')) return;

    try {
      await productWishlistAPI.delete(productId);
      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('删除失败,请重试');
    }
  };

  // 关闭模态框
  const handleClose = () => {
    setIsEditing(false);
    setProduct(null);
    onClose();
  };

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // 添加规格
  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      });
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  // 删除规格
  const handleRemoveSpec = (keyToRemove: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[keyToRemove];
    setFormData({
      ...formData,
      specifications: newSpecs
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            {productId ? (isEditing ? '编辑商品' : '商品详情') : '添加商品'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-400">加载中...</div>
            </div>
          ) : isEditing || !productId ? (
            /* 编辑模式 */
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <PackageIcon className="w-5 h-5 text-pink-500" />
                  基本信息
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">商品名称 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="请输入商品名称"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">品牌</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="请输入品牌"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="请输入分类"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">价格 *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="请输入价格"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">原价</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="请输入原价"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">购买链接 *</label>
                    <input
                      type="url"
                      value={formData.purchaseUrl}
                      onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="请输入购买链接"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">图片链接</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="请输入图片链接"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">平台</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">请选择平台</option>
                      <option value="淘宝">淘宝</option>
                      <option value="京东">京东</option>
                      <option value="拼多多">拼多多</option>
                      <option value="天猫">天猫</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">商品描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={3}
                      placeholder="请输入商品描述"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProductPriority })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="low">低优先级</option>
                      <option value="medium">中优先级</option>
                      <option value="high">高优先级</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 标签 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <HeartIcon className="w-5 h-5 text-pink-500" />
                  标签
                </h3>

                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-pink-900"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="添加标签"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 规格 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <PriceTagIcon className="w-5 h-5 text-pink-500" />
                  规格
                </h3>

                <div className="space-y-2 mb-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-700">
                        <span className="font-medium">{key}:</span> {value}
                      </span>
                      <button
                        onClick={() => handleRemoveSpec(key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="规格名称"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSpec()}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="规格值"
                  />
                  <button
                    onClick={handleAddSpec}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 备注 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">备注</h3>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                  placeholder="添加备注信息"
                />
              </div>
            </div>
          ) : product ? (
            /* 查看模式 */
            <div className="space-y-6">
              {/* 商品图片 */}
              {product.imageUrl && (
                <div className="flex justify-center">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-w-full h-64 object-contain rounded-lg"
                  />
                </div>
              )}

              {/* 基本信息 */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-800">{product.name}</h3>
                {product.brand && (
                  <p className="text-sm text-slate-600">品牌: {product.brand}</p>
                )}
                {product.category && (
                  <p className="text-sm text-slate-600">分类: {product.category}</p>
                )}
                {product.description && (
                  <p className="text-sm text-slate-600">{product.description}</p>
                )}
              </div>

              {/* 价格信息 */}
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-pink-600">
                    ¥{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-slate-400 line-through">
                      ¥{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.platform && (
                  <p className="text-sm text-slate-600 mt-1">平台: {product.platform}</p>
                )}
              </div>

              {/* 购买链接 */}
              <a
                href={product.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm">打开购买链接</span>
              </a>

              {/* 标签 */}
              {product.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 规格 */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">规格</h4>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 备注 */}
              {product.notes && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">备注</h4>
                  <p className="text-sm text-slate-600">{product.notes}</p>
                </div>
              )}

              {/* 元信息 */}
              <div className="text-xs text-slate-400 pt-4 border-t border-slate-200">
                <p>创建时间: {new Date(product.createdAt).toLocaleString('zh-CN')}</p>
                <p>更新时间: {new Date(product.updatedAt).toLocaleString('zh-CN')}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            {productId && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  删除
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              取消
            </button>
            {(isEditing || !productId) && (
              <button
                onClick={handleSave}
                disabled={loading || !formData.name || !formData.purchaseUrl || formData.price <= 0}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <SaveIcon className="w-4 h-4" />
                保存
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
