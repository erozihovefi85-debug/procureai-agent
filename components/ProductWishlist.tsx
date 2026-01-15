import React, { useState, useEffect } from 'react';
import { ProductWishlistItem, ProductStats } from '../types';
import { productWishlistAPI } from '../services/api';
import {
  PackageIcon, PlusIcon, SearchIcon, FilterIcon, ImportIcon,
  ExportIcon, CheckCircleIcon, ClockIcon, StarIcon, ChatIcon,
  HeartIcon, PriceTagIcon, LinkIcon, ShoppingCartIcon, EditIcon, TrashIcon
} from './Icons';
import ProductDetailModal from './ProductDetailModal';

interface ProductWishlistProps {
  userId: string;
  onBackToChat?: (conversationId?: string) => void;
  lastConversationId?: string;
}

const ProductWishlist: React.FC<ProductWishlistProps> = ({ userId, onBackToChat, lastConversationId }) => {
  const [products, setProducts] = useState<ProductWishlistItem[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 获取商品列表
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productWishlistAPI.getAll({
        search: searchQuery || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      setProducts(response.data?.data || []);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      // 如果后端 API 不可用(404),使用 localStorage
      if (error.response?.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        const localProducts = localStorage.getItem(`procureai_products_${userId}`);
        if (localProducts) {
          const allProducts = JSON.parse(localProducts);
          let filteredProducts = allProducts;

          // 应用搜索过滤
          if (searchQuery) {
            filteredProducts = filteredProducts.filter((p: ProductWishlistItem) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
          }

          // 应用状态过滤
          if (selectedStatus !== 'all') {
            filteredProducts = filteredProducts.filter((p: ProductWishlistItem) => p.status === selectedStatus);
          }

          setProducts(filteredProducts);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await productWishlistAPI.getStats();
      setStats(response.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      // 如果后端 API 不可用,从 localStorage 计算统计
      if (error.response?.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        const localProducts = localStorage.getItem(`procureai_products_${userId}`);
        const allProducts: ProductWishlistItem[] = localProducts ? JSON.parse(localProducts) : [];

        const stats: ProductStats = {
          total: allProducts.length,
          ordered: allProducts.filter(p => p.status === 'ordered').length,
          purchased: allProducts.filter(p => p.status === 'purchased').length,
          pending: allProducts.filter(p => p.status === 'pending').length,
          totalValue: allProducts.reduce((sum, p) => sum + p.price, 0),
          byStatus: {
            pending: allProducts.filter(p => p.status === 'pending').length,
            ordered: allProducts.filter(p => p.status === 'ordered').length,
            purchased: allProducts.filter(p => p.status === 'purchased').length,
            cancelled: allProducts.filter(p => p.status === 'cancelled').length,
          },
          byPriority: {
            high: allProducts.filter(p => p.rating >= 4).length,
            medium: allProducts.filter(p => p.rating >= 3 && p.rating < 4).length,
            low: allProducts.filter(p => p.rating < 3).length,
          },
          recentActivity: allProducts.slice(0, 5).map(p => ({
            _id: p._id,
            name: p.name,
            updatedAt: p.updatedAt,
            status: p.status
          }))
        };
        setStats(stats);
      } else {
        // 其他错误,设置空统计以防止页面崩溃
        setStats({
          total: 0,
          ordered: 0,
          purchased: 0,
          pending: 0,
          totalValue: 0,
          byStatus: {},
          byPriority: {},
          recentActivity: []
        });
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [searchQuery, selectedStatus]);

  // 删除商品
  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个商品吗?')) return;
    try {
      await productWishlistAPI.delete(id);
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      // 如果后端 API 不可用,使用 localStorage
      if (error.response?.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        const localProducts = localStorage.getItem(`procureai_products_${userId}`);
        if (localProducts) {
          const allProducts: ProductWishlistItem[] = JSON.parse(localProducts);
          const filteredProducts = allProducts.filter(p => p._id !== id);
          localStorage.setItem(`procureai_products_${userId}`, JSON.stringify(filteredProducts));
          fetchProducts();
          fetchStats();
        }
      } else {
        console.error('Failed to delete product:', error);
        alert('删除失败,请重试');
      }
    }
  };

  // 导出商品
  const handleExport = async () => {
    try {
      const response = await productWishlistAPI.export();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败,请重试');
    }
  };

  // 导入商品
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await productWishlistAPI.import(file);
      alert(`成功导入 ${response.data.imported} 个商品`);
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Import failed:', error);
      alert('导入失败,请检查文件格式');
    }
    event.target.value = '';
  };

  // 打开商品详情
  const handleOpenDetail = (productId: string) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  // 更新后的回调
  const handleProductUpdated = () => {
    fetchProducts();
    fetchStats();
  };

  // 标记为已购买
  const handleMarkAsPurchased = async (product: ProductWishlistItem) => {
    try {
      await productWishlistAPI.updateStatus(product._id, {
        status: 'purchased',
        orderDate: new Date().toISOString()
      });
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      // 如果后端 API 不可用,使用 localStorage
      if (error.response?.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        const localProducts = localStorage.getItem(`procureai_products_${userId}`);
        if (localProducts) {
          const allProducts: ProductWishlistItem[] = JSON.parse(localProducts);
          const updatedProducts = allProducts.map(p =>
            p._id === product._id
              ? { ...p, status: 'purchased' as const, orderDate: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : p
          );
          localStorage.setItem(`procureai_products_${userId}`, JSON.stringify(updatedProducts));
          fetchProducts();
          fetchStats();
        }
      } else {
        console.error('Failed to update product status:', error);
        alert('更新失败,请重试');
      }
    }
  };

  return (
    <>
    <div className="h-full flex flex-col bg-slate-50">
      {/* 顶部统计卡片 */}
      {stats && (
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-pink-600 font-medium">总商品</p>
                    <p className="text-2xl font-bold text-pink-700 mt-1">{stats.total}</p>
                  </div>
                  <HeartIcon className="w-8 h-8 text-pink-300" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-medium">已购买</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{stats.purchased}</p>
                  </div>
                  <ShoppingCartIcon className="w-8 h-8 text-green-300" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-600 font-medium">待处理</p>
                    <p className="text-2xl font-bold text-amber-700 mt-1">{stats.pending}</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-amber-300" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-600 font-medium">总价值</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">¥{(stats?.totalValue || 0).toLocaleString()}</p>
                  </div>
                  <PriceTagIcon className="w-8 h-8 text-purple-300" />
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
                placeholder="搜索商品名称、品牌..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-pink-50 border-pink-300 text-pink-700'
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
                className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <ChatIcon className="w-5 h-5" />
                <span>返回聊天</span>
              </button>
            )}

            {/* 添加商品按钮 */}
            <button
              onClick={() => {
                setSelectedProductId(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              <span>添加商品</span>
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待处理</option>
                    <option value="ordered">已下单</option>
                    <option value="purchased">已购买</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">优先级</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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

      {/* 商品列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-400">加载中...</div>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <HeartIcon className="w-16 h-16 mb-4 text-slate-200" />
              <p className="text-lg font-medium mb-2">暂无商品</p>
              <p className="text-sm">点击"添加商品"或从AI对话中收藏</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products && products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDelete={handleDelete}
                  onViewDetail={handleOpenDetail}
                  onMarkAsPurchased={handleMarkAsPurchased}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* 商品详情模态框 */}
    <ProductDetailModal
      productId={selectedProductId}
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onUpdate={handleProductUpdated}
    />
    </>
  );
};

// 商品卡片组件
interface ProductCardProps {
  product: ProductWishlistItem;
  onDelete: (id: string) => void;
  onViewDetail: (id: string) => void;
  onMarkAsPurchased: (product: ProductWishlistItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onViewDetail, onMarkAsPurchased }) => {
  const [showDetails, setShowDetails] = useState(false);

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
      case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ordered': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'purchased': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'ordered': return '已下单';
      case 'purchased': return '已购买';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-4 cursor-pointer" onClick={() => onViewDetail(product._id)}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-800 truncate">{product.name}</h3>
          {product.brand && (
            <p className="text-xs text-slate-500 mt-0.5">{product.brand}</p>
          )}
        </div>
        <div className="flex gap-1.5">
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor('medium')}`}>
            {product.rating >= 4 ? '★' + product.rating : '★' + product.rating}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(product.status)}`}>
            {getStatusText(product.status)}
          </span>
        </div>
      </div>

      {/* 商品图片 */}
      {product.imageUrl && (
        <div className="mb-3">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
      )}

      {/* 价格信息 */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-pink-600">
            ¥{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              ¥{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        {product.platform && (
          <p className="text-xs text-slate-500 mt-1">{product.platform}</p>
        )}
      </div>

      {/* 详细信息 */}
      {showDetails && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          {product.description && (
            <p className="text-sm text-slate-600">{product.description}</p>
          )}
          {product.category && (
            <p className="text-xs text-slate-500">
              <span className="font-medium">分类:</span> {product.category}
            </p>
          )}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="text-xs text-slate-500">
              <span className="font-medium">规格:</span>
              {Object.entries(product.specifications).map(([key, value]) => (
                <span key={key} className="ml-2">{key}: {value}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 标签 */}
      {product.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-pink-50 border border-pink-200 rounded text-xs text-pink-600"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 底部操作按钮 */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            showDetails
              ? 'bg-slate-100 text-slate-600'
              : 'bg-pink-600 text-white hover:bg-pink-700'
          }`}
        >
          {showDetails ? '隐藏详情' : '查看详情'}
        </button>

        <a
          href={product.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all flex items-center gap-1"
          title="打开购买链接"
        >
          <LinkIcon className="w-4 h-4" />
          购买
        </a>

        {product.status !== 'purchased' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsPurchased(product);
            }}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-all"
            title="标记为已购买"
          >
            <CheckCircleIcon className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product._id);
          }}
          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 购买日期 */}
      {product.orderDate && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ClockIcon className="w-4 h-4" />
            <span>购买时间: {new Date(product.orderDate).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductWishlist;
