import { ProductWishlistItem } from '../types';

/**
 * 从AI响应中提取商品信息
 * 支持多种格式: Markdown列表、结构化文本、JSON等
 */
export function extractProductsFromAIResponse(
  content: string,
  userId: string,
  conversationId?: string
): ProductWishlistItem[] {
  const products: ProductWishlistItem[] = [];

  // 尝试解析JSON格式
  const jsonProducts = tryParseJSONProducts(content, userId, conversationId);
  if (jsonProducts.length > 0) {
    return jsonProducts;
  }

  // 尝试解析Markdown列表格式
  const markdownProducts = parseMarkdownProducts(content, userId, conversationId);
  if (markdownProducts.length > 0) {
    return markdownProducts;
  }

  // 尝试解析自由文本格式
  const textProducts = parseFreeTextProducts(content, userId, conversationId);
  if (textProducts.length > 0) {
    return textProducts;
  }

  return products;
}

/**
 * 尝试从AI响应中解析JSON格式的商品信息
 */
function tryParseJSONProducts(
  content: string,
  userId: string,
  conversationId?: string
): ProductWishlistItem[] {
  const products: ProductWishlistItem[] = [];

  // 查找JSON代码块
  const jsonBlockRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?```/g;
  let match = jsonBlockRegex.exec(content);

  while (match !== null) {
    try {
      const jsonData = JSON.parse(match[1]);

      // 处理数组格式
      if (Array.isArray(jsonData)) {
        for (const item of jsonData) {
          const product = createProductFromObject(item, userId, conversationId);
          if (product) {
            products.push(product);
          }
        }
      }
      // 处理单个对象格式
      else if (typeof jsonData === 'object') {
        const product = createProductFromObject(jsonData, userId, conversationId);
        if (product) {
          products.push(product);
        }
      }
    } catch (e) {
      // JSON解析失败,继续尝试下一个代码块
    }

    match = jsonBlockRegex.exec(content);
  }

  // 如果没有找到代码块,尝试直接解析整个内容
  if (products.length === 0) {
    try {
      const jsonData = JSON.parse(content);
      if (Array.isArray(jsonData)) {
        for (const item of jsonData) {
          const product = createProductFromObject(item, userId, conversationId);
          if (product) {
            products.push(product);
          }
        }
      }
    } catch (e) {
      // 忽略解析错误
    }
  }

  return products;
}

/**
 * 从对象创建商品
 */
function createProductFromObject(
  obj: any,
  userId: string,
  conversationId?: string
): ProductWishlistItem | null {
  // 必需字段检查
  if (!obj.name && !obj.title && !obj.商品名称) {
    return null;
  }

  // 提取价格
  let price = 0;
  if (typeof obj.price === 'number') {
    price = obj.price;
  } else if (typeof obj.price === 'string') {
    const priceMatch = obj.price.match(/(\d+\.?\d*)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    }
  } else if (obj.价格) {
    const priceMatch = String(obj.价格).match(/(\d+\.?\d*)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    }
  }

  // 提取购买链接
  const purchaseUrl = obj.url || obj.link || obj.purchaseUrl || obj.购买链接 || obj.链接 || '';

  if (price <= 0 && !purchaseUrl) {
    return null;
  }

  const product: ProductWishlistItem = {
    _id: '',
    userId,
    conversationId,
    name: obj.name || obj.title || obj.商品名称 || '',
    description: obj.description || obj.desc || obj.描述 || undefined,
    price,
    originalPrice: obj.originalPrice || obj.original_price || obj.原价 || undefined,
    currency: obj.currency || 'CNY',
    purchaseUrl,
    imageUrl: obj.image || obj.img || obj.imageUrl || obj.picture || obj.图片 || undefined,
    platform: obj.platform || obj.平台 || detectPlatform(purchaseUrl),
    category: obj.category || obj.cat || obj.分类 || undefined,
    brand: obj.brand || obj.品牌 || undefined,
    specifications: obj.specifications || obj.specs || obj.规格 || {},
    tags: obj.tags ? (Array.isArray(obj.tags) ? obj.tags : [obj.tags]) : [],
    notes: obj.notes || obj.note || obj.备注 || undefined,
    source: 'ai',
    rating: obj.rating || obj.score || obj.评分 || 3,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return product;
}

/**
 * 从Markdown列表格式解析商品
 */
function parseMarkdownProducts(
  content: string,
  userId: string,
  conversationId?: string
): ProductWishlistItem[] {
  const products: ProductWishlistItem[] = [];

  // 匹配Markdown列表项
  // 格式: - [商品名称](链接) - 价格 ¥xxx
  const listItemRegex = /^\s*[-*]\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*-\s*([^#\n]+))?/gm;
  let match = listItemRegex.exec(content);

  while (match !== null) {
    const name = match[1].trim();
    const url = match[2].trim();
    const desc = match[3] ? match[3].trim() : '';

    // 从描述中提取价格
    let price = 0;
    const priceMatch = desc.match(/[¥￥$]\s*(\d+\.?\d*)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    }

    if (name && (price > 0 || url)) {
      const product: ProductWishlistItem = {
        _id: '',
        userId,
        conversationId,
        name,
        description: desc.replace(/[¥￥$]\s*(\d+\.?\d*)/, '').trim() || undefined,
        price,
        currency: 'CNY',
        purchaseUrl: url,
        platform: detectPlatform(url),
        source: 'ai',
        rating: 3,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      products.push(product);
    }

    match = listItemRegex.exec(content);
  }

  return products;
}

/**
 * 从自由文本中解析商品
 */
function parseFreeTextProducts(
  content: string,
  userId: string,
  conversationId?: string
): ProductWishlistItem[] {
  const products: ProductWishlistItem[] = [];

  // 按行分割
  const lines = content.split('\n');

  for (const line of lines) {
    // 跳过空行
    if (!line.trim()) {
      continue;
    }

    // 检查是否包含商品名称和价格
    // 格式: 商品名 ¥xxx 或 商品名 ￥xxx 或 商品名 $xxx
    const productMatch = line.match(/([^¥￥$,\d]+?)[\s,]*(?:[¥￥$]\s*)?(\d+\.?\d*)?/);

    if (productMatch) {
      const name = productMatch[1].trim();
      const price = productMatch[2] ? parseFloat(productMatch[2]) : 0;

      // 提取链接
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      const url = urlMatch ? urlMatch[0] : '';

      if (name && (price > 0 || url)) {
        const product: ProductWishlistItem = {
          _id: '',
          userId,
          conversationId,
          name,
          description: line.trim(),
          price,
          currency: 'CNY',
          purchaseUrl: url,
          platform: url ? detectPlatform(url) : undefined,
          source: 'ai',
          rating: 3,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        products.push(product);
      }
    }
  }

  return products;
}

/**
 * 检测平台
 */
function detectPlatform(url: string): string | undefined {
  if (!url) {
    return undefined;
  }

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('taobao.com') || lowerUrl.includes('淘宝')) {
    return '淘宝';
  } else if (lowerUrl.includes('tmall.com') || lowerUrl.includes('天猫')) {
    return '天猫';
  } else if (lowerUrl.includes('jd.com') || lowerUrl.includes('京东')) {
    return '京东';
  } else if (lowerUrl.includes('pinduoduo.com') || lowerUrl.includes('拼多多')) {
    return '拼多多';
  } else if (lowerUrl.includes('yangkeduo.com')) {
    return '拼多多';
  }

  return '其他';
}

/**
 * 生成商品卡片HTML
 * 用于在聊天界面中显示"加入心愿单"按钮
 */
export function generateProductCardHTML(product: ProductWishlistItem): string {
  const priceHTML = product.price > 0
    ? `<div class="product-price">¥${product.price.toLocaleString()}</div>`
    : '';

  const originalPriceHTML = product.originalPrice && product.originalPrice > product.price
    ? `<div class="product-original-price">¥${product.originalPrice.toLocaleString()}</div>`
    : '';

  const imageHTML = product.imageUrl
    ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-image" />`
    : '';

  const platformHTML = product.platform
    ? `<div class="product-platform">${product.platform}</div>`
    : '';

  return `
    <div class="product-card" data-product-id="${product._id || ''}">
      ${imageHTML}
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        ${platformHTML}
        <div class="product-prices">
          ${priceHTML}
          ${originalPriceHTML}
        </div>
      </div>
      <button class="add-to-wishlist-btn" data-product-name="${product.name}">
        ❤️ 加入心愿单
      </button>
    </div>
  `;
}

/**
 * 验证商品数据
 */
export function validateProductData(product: Partial<ProductWishlistItem>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('商品名称不能为空');
  }

  if (!product.purchaseUrl || product.purchaseUrl.trim().length === 0) {
    errors.push('购买链接不能为空');
  }

  if (typeof product.price !== 'number' || product.price <= 0) {
    errors.push('价格必须大于0');
  }

  if (product.purchaseUrl && !isValidURL(product.purchaseUrl)) {
    errors.push('购买链接格式不正确');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证URL格式
 */
function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 计算折扣百分比
 */
export function calculateDiscountPercent(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice <= 0 || currentPrice <= 0) {
    return 0;
  }

  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}
