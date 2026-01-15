// 工作流阶段枚举
export enum WorkflowStage {
  REQUIREMENT_INPUT = 'requirement_input',        // 1. 提出需求
  PRELIMINARY_RESEARCH = 'preliminary_research',  // 2. 初步调研
  REFINEMENT = 'refinement',                      // 3. 精细化需求
  REQUIREMENT_LIST = 'requirement_list',          // 4. 输出需求清单
  DEEP_SOURCING = 'deep_sourcing',                // 5. 深度寻源
  SUPPLIER_FAVORITE = 'supplier_favorite',        // 6. 供应商收藏
  SUPPLIER_INTERVIEW = 'supplier_interview'       // 7. 供应商约谈
}

// 阶段信息配置
export const STAGE_CONFIG: Record<WorkflowStage, {
  title: string;
  description: string;
  icon: string;
  color: string;
  nextTrigger?: string[];  // 触发进入下一阶段的关键词
}> = {
  [WorkflowStage.REQUIREMENT_INPUT]: {
    title: '提出需求',
    description: '描述您的采购需求',
    icon: '💬',
    color: 'blue',
    nextTrigger: ['我已经记录了您的需求', '需求已接收', '开始进行初步调研', '让我先分析一下']
  },
  [WorkflowStage.PRELIMINARY_RESEARCH]: {
    title: '初步调研',
    description: 'AI 正在分析需求并收集信息',
    icon: '🔍',
    color: 'purple',
    nextTrigger: ['初步调研完成', '基于以上分析', '接下来我需要了解更多', '请您确认以下要点']
  },
  [WorkflowStage.REFINEMENT]: {
    title: '精细化需求',
    description: '进一步明确和细化采购需求',
    icon: '🎯',
    color: 'orange',
    nextTrigger: ['需求已确认', '可以生成清单', '开始生成需求清单', '现在为您生成']
  },
  [WorkflowStage.REQUIREMENT_LIST]: {
    title: '需求清单',
    description: '生成结构化的采购需求清单',
    icon: '📋',
    color: 'green',
    nextTrigger: [] // 需要用户手动确认，不自动推进
  },
  [WorkflowStage.DEEP_SOURCING]: {
    title: '深度寻源',
    description: '寻找并匹配合适的供应商',
    icon: '🔎',
    color: 'indigo',
    nextTrigger: ['推荐以下供应商', '为您找到以下供应商', '寻源结果如下']
  },
  [WorkflowStage.SUPPLIER_FAVORITE]: {
    title: '供应商收藏',
    description: '收藏感兴趣的供应商到收藏夹',
    icon: '⭐',
    color: 'amber',
    nextTrigger: [] // 需要用户实际收藏操作
  },
  [WorkflowStage.SUPPLIER_INTERVIEW]: {
    title: '供应商约谈',
    description: '安排与供应商的约谈',
    icon: '🤝',
    color: 'emerald',
    nextTrigger: [] // 需要用户实际约谈操作
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
