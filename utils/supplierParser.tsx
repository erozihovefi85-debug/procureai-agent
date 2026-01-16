import SupplierBookmarkButton from '../components/SupplierBookmarkButton';
import React from 'react';

/**
 * 从 AI 响应内容中解析供应商信息
 *
 * 支持的格式：
 * 1. 结构化 JSON 格式
 * 2. Markdown 列表格式
 * 3. 表格格式
 * 4. 自然语言描述格式
 */

export interface ParsedSupplier {
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
}

/**
 * 从消息内容中提取并渲染供应商收藏按钮
 */
export const renderSupplierBookmarks = (
  content: string,
  userId?: string,
  conversationId?: string,
  onBookmarked?: (supplier: any) => void
): React.ReactNode => {
  const suppliers = parseSuppliersFromContent(content);

  if (suppliers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {suppliers.map((supplier, index) => (
        <SupplierBookmarkButton
          key={`${supplier.name}-${index}`}
          supplierInfo={supplier}
          conversationId={conversationId}
          userId={userId}
          onBookmarked={onBookmarked}
        />
      ))}
    </div>
  );
};

/**
 * 从内容中解析供应商信息
 */
export const parseSuppliersFromContent = (content: string): ParsedSupplier[] => {
  const suppliers: ParsedSupplier[] = [];

  // 1. 尝试解析 JSON 格式
  const jsonSuppliers = parseJsonSuppliers(content);
  if (jsonSuppliers.length > 0) {
    suppliers.push(...jsonSuppliers);
  }

  // 2. 尝试解析 Markdown 表格格式
  if (suppliers.length === 0) {
    const tableSuppliers = parseTableSuppliers(content);
    if (tableSuppliers.length > 0) {
      suppliers.push(...tableSuppliers);
    }
  }

  // 3. 尝试解析 Markdown 列表格式
  if (suppliers.length === 0) {
    const listSuppliers = parseListSuppliers(content);
    if (listSuppliers.length > 0) {
      suppliers.push(...listSuppliers);
    }
  }

  // 4. 尝试解析自然语言描述格式
  if (suppliers.length === 0) {
    const textSuppliers = parseTextSuppliers(content);
    if (textSuppliers.length > 0) {
      suppliers.push(...textSuppliers);
    }
  }

  return suppliers;
};

/**
 * 解析 JSON 格式的供应商信息
 */
const parseJsonSuppliers = (content: string): ParsedSupplier[] => {
  const suppliers: ParsedSupplier[] = [];

  // 尝试查找 JSON 数组
  const jsonMatch = content.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[0]);
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.name || item.供应商名称 || item.公司名称) {
            suppliers.push({
              name: item.name || item.供应商名称 || item.公司名称,
              foundedDate: item.foundedDate || item.成立时间,
              businessDirection: item.businessDirection || item.业务方向
                ? (item.businessDirection || item.业务方向).split(/[,，、]/).filter(Boolean)
                : [],
              contactInfo: {
                person: item.person || item.contact || item.联系人,
                phone: item.phone || item.电话,
                email: item.email || item.邮箱,
                wechat: item.wechat || item.微信,
                address: item.address || item.地址,
              },
              customerCases: item.customerCases || item.客户案例 || [],
            });
          }
        }
      }
    } catch (e) {
      // JSON 解析失败，忽略
    }
  }

  return suppliers;
};

/**
 * 解析表格格式的供应商信息
 */
const parseTableSuppliers = (content: string): ParsedSupplier[] => {
  const suppliers: ParsedSupplier[] = [];

  // 按行分割，查找完整的表格块
  const lines = content.split('\n');
  const tableBlocks: string[][] = [];
  let currentTable: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    // 检测是否是表格行（以 | 开头和结尾）
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      currentTable.push(line);
    } else if (currentTable.length > 0) {
      // 表格结束，保存当前表格块（至少3行：表头、分隔线、数据行）
      if (currentTable.length >= 3) {
        tableBlocks.push(currentTable);
      }
      currentTable = [];
    }
  }

  // 处理最后一个表格
  if (currentTable.length >= 3) {
    tableBlocks.push(currentTable);
  }

  for (const tableLines of tableBlocks) {
    try {
      // 解析表头
      const headers = tableLines[0]
        .split('|')
        .map(h => h.trim())
        .filter(h => h);

      // 查找包含供应商相关信息的列
      const nameCol = headers.findIndex(h =>
        h.includes('供应商全称') || h.includes('名称') || h.includes('name') || h.includes('供应商') || h.includes('公司') || h.includes('企业')
      );
      const directionCol = headers.findIndex(h =>
        h.includes('业务') || h.includes('direction') || h.includes('主营') || h.includes('经营范围')
      );
      const contactCol = headers.findIndex(h =>
        h.includes('联系方式') || h.includes('联系') || h.includes('contact') || h.includes('电话') || h.includes('phone')
      );
      const websiteCol = headers.findIndex(h =>
        h.includes('官网') || h.includes('网站') || h.includes('website') || h.includes('url')
      );
      const sourceCol = headers.findIndex(h =>
        h.includes('信源') || h.includes('来源') || h.includes('source')
      );

      if (nameCol === -1) continue;

      // 解析数据行（跳过分隔行，从第2行开始）
      for (let i = 2; i < tableLines.length; i++) {
        const cells = tableLines[i]
          .split('|')
          .map(c => c.trim())
          .filter(c => c);

        if (cells.length <= nameCol) continue;

        const supplierName = cells[nameCol];
        if (!supplierName || supplierName.length < 2) continue;

        const supplier: ParsedSupplier = {
          name: supplierName,
        };

        if (directionCol !== -1 && cells[directionCol]) {
          supplier.businessDirection = cells[directionCol].split(/[,，、]/).filter(Boolean);
        }

        if (contactCol !== -1 && cells[contactCol]) {
          supplier.contactInfo = {
            ...supplier.contactInfo,
            person: cells[contactCol],
          };
        }

        if (websiteCol !== -1 && cells[websiteCol]) {
          supplier.contactInfo = {
            ...supplier.contactInfo,
            address: cells[websiteCol], // 暂时用 address 字段存储官网
          };
        }

        suppliers.push(supplier);
      }
    } catch (e) {
      // 表格解析失败，忽略
      console.error('[parseTableSuppliers] Table parse error:', e);
    }
  }

  return suppliers;
};

/**
 * 解析列表格式的供应商信息
 */
const parseListSuppliers = (content: string): ParsedSupplier[] => {
  const suppliers: ParsedSupplier[] = [];

  // 检测供应商列表模式（如 "1. 供应商名称：xxx"）
  const listItemPattern = /^\d+[\.\、]\s*【?(.+?)】?[:：]\s*([^\n]+)/gm;
  let matches = Array.from(content.matchAll(listItemPattern));

  if (matches.length > 0) {
    for (const match of matches) {
      const field = match[1].trim();
      const value = match[2].trim();

      // 检测供应商名称字段
      if (field.includes('名称') || field.includes('供应商') || field.includes('公司')) {
        suppliers.push({
          name: value,
        });
      }
    }
  }

  // 另一种列表格式：带破折号的列表
  const dashItemPattern = /-\s*\*\*供应商名称\*\*[:：]\s*([^\n]+)/gi;
  const dashMatches = Array.from(content.matchAll(dashItemPattern));

  if (dashMatches.length > 0) {
    for (const match of dashMatches) {
      suppliers.push({
        name: match[1].trim(),
      });
    }
  }

  return suppliers;
};

/**
 * 解析自然语言描述格式的供应商信息
 */
const parseTextSuppliers = (content: string): ParsedSupplier[] => {
  const suppliers: ParsedSupplier[] = [];

  // 检测推荐供应商的模式
  const patterns = [
    /推荐供应商[：:]\s*([^\n，,]+)/g,
    /供应商[：:]\s*([^\n，,]+)/g,
    /公司名称[：:]\s*([^\n，,]+)/g,
  ];

  for (const pattern of patterns) {
    const matches = Array.from(content.matchAll(pattern));
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 1) {
        suppliers.push({
          name: match[1].trim(),
        });
      }
    }
  }

  return suppliers;
};

/**
 * 判断消息内容是否包含供应商信息
 */
export const containsSupplierInfo = (content: string): boolean => {
  const keywords = [
    '供应商全称',
    '联系方式',
    '官网',
    '信源',
  ];

  const hasKeywords = keywords.some(keyword => content.includes(keyword));

  if (!hasKeywords) return false;

  const suppliers = parseSuppliersFromContent(content);
  return suppliers.length > 0;
};
