// 工作流阶段枚举
export enum WorkflowStage {
  REQUIREMENT_INPUT = 'requirement_input',        // 1. 接收需求与开场介绍
  PRELIMINARY_SOURCING = 'preliminary_sourcing',  // 2. 初步调研
  REQUIREMENT_LIST = 'requirement_list',          // 3. 生成结构化需求清单
  DEEP_SOURCING = 'deep_sourcing',                // 4. 深度寻源与资质交付
  SUPPLIER_FAVORITE = 'supplier_favorite',        // 5. 供应商收藏
  SUPPLIER_INTERVIEW = 'supplier_interview'       // 6. 供应商约谈（可选）
}

// 阶段信息配置
export const STAGE_CONFIG: Record<WorkflowStage, {
  title: string;
  description: string;
  icon: string;
  color: string;
  nextTrigger?: string[];  // 触发进入下一阶段的关键词（已全部禁用，改为手动按钮触发）
}> = {
  [WorkflowStage.REQUIREMENT_INPUT]: {
    title: '接收需求',
    description: '描述您的采购需求，小帅将为您分析',
    icon: '💬',
    color: 'blue',
    // nextTrigger: ['初步调研', '开始调研', '开启需求初步调研', '开始初步调研', '已进入**初步调研**']
    nextTrigger: []  // 改为手动触发
  },
  [WorkflowStage.PRELIMINARY_SOURCING]: {
    title: '初步调研',
    description: '小帅正在分析需求并拆解关键信息',
    icon: '🔍',
    color: 'purple',
    // nextTrigger: ['调研分析结果', '基于以上分析', '请确认以下要点', '已进入**需求清单**', '生成结构化需求清单']
    nextTrigger: []  // 改为手动触发
  },
  [WorkflowStage.REQUIREMENT_LIST]: {
    title: '需求清单',
    description: '生成结构化的采购需求清单',
    icon: '📋',
    color: 'green',
    // nextTrigger: ['采购需求清单', '报告！以下是为您生成的采购需求清单', '是否开始深度寻源', '已进入**深度寻源**']
    nextTrigger: []  // 改为手动触发
  },
  [WorkflowStage.DEEP_SOURCING]: {
    title: '深度寻源',
    description: '多信源交叉验证，寻找优质供应商',
    icon: '🔎',
    color: 'indigo',
    // nextTrigger: ['汇报！为您找到以下优质供应商', '企业采购寻源报告', '已进入**供应商收藏**']
    nextTrigger: []  // 改为手动触发
  },
  [WorkflowStage.SUPPLIER_FAVORITE]: {
    title: '供应商收藏',
    description: '将感兴趣的供应商添加到收藏夹',
    icon: '⭐',
    color: 'amber',
    // nextTrigger: ['收藏夹', '已收藏供应商', '已进入**供应商约谈**']
    nextTrigger: []  // 改为手动触发
  },
  [WorkflowStage.SUPPLIER_INTERVIEW]: {
    title: '供应商约谈',
    description: '安排与供应商的约谈（可选阶段）',
    icon: '🤝',
    color: 'emerald',
    nextTrigger: [] // 最后阶段
  }
};

// 工作流状态接口
export interface WorkflowState {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  stageData: Record<WorkflowStage, any>;
  createdAt: number;
  updatedAt: number;
}

// 阶段数据结构
export interface RequirementInputData {
  rawInput: string;
  extractedInfo?: {
    category?: string;
    quantity?: number;
    budget?: number;
    timeline?: string;
  };
}

export interface PreliminaryResearchData {
  analysis: string;
  suggestions: string[];
  marketInsights?: string;
}

export interface RequirementListData {
  items: RequirementItem[];
  summary: string;
}

export interface RequirementItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface DeepSourcingData {
  supplierCount: number;
  recommendations: string[];
  searchCriteria: string[];
}
