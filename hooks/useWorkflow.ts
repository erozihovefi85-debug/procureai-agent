import { useState, useEffect, useCallback } from 'react';
import { WorkflowStage, WorkflowState, STAGE_CONFIG } from '../types/workflow';

const STORAGE_KEY = 'procureai_workflow_state';
const STORAGE_VERSION = '1.0'; // 版本号，用于检测旧数据
const VERSION_KEY = 'procureai_workflow_version';

// 获取初始状态
const getInitialState = (): WorkflowState => ({
  currentStage: WorkflowStage.REQUIREMENT_INPUT,
  completedStages: [],
  stageData: {} as Record<WorkflowStage, any>,
  createdAt: Date.now(),
  updatedAt: Date.now()
});

export const useWorkflow = () => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>(() => {
    // 从 localStorage 加载
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedVersion = localStorage.getItem(VERSION_KEY);

    // 检查版本，如果不匹配则重置
    if (saved && savedVersion !== STORAGE_VERSION) {
      console.log('Workflow state version mismatch, resetting...');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
      return getInitialState();
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 额外验证：确保数据结构正确
        if (parsed && parsed.currentStage && Array.isArray(parsed.completedStages)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse workflow state:', e);
      }
    }

    // 初始状态
    return getInitialState();
  });

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflowState));
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  }, [workflowState]);

  // 推进到下一阶段
  const advanceToNextStage = useCallback((data?: any) => {
    setWorkflowState(prev => {
      const stages = Object.values(WorkflowStage);
      const currentIndex = stages.indexOf(prev.currentStage);

      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        return {
          ...prev,
          currentStage: nextStage,
          completedStages: [...prev.completedStages, prev.currentStage],
          stageData: {
            ...prev.stageData,
            [prev.currentStage]: data || prev.stageData[prev.currentStage]
          },
          updatedAt: Date.now()
        };
      }

      return prev;
    });
  }, []);

  // 返回上一阶段（受限：只能返回一个阶段）
  const goToPreviousStage = useCallback(() => {
    setWorkflowState(prev => {
      if (prev.completedStages.length === 0) return prev;

      const lastCompleted = prev.completedStages[prev.completedStages.length - 1];
      return {
        ...prev,
        currentStage: lastCompleted,
        completedStages: prev.completedStages.slice(0, -1),
        updatedAt: Date.now()
      };
    });
  }, []);

  // 跳转到指定阶段（仅允许已完成阶段或当前阶段）
  const jumpToStage = useCallback((stage: WorkflowStage) => {
    setWorkflowState(prev => {
      // 检查是否可以跳转
      const stages = Object.values(WorkflowStage);
      const currentIndex = stages.indexOf(prev.currentStage);
      const targetIndex = stages.indexOf(stage);

      // 只允许跳转到已完成阶段或上一阶段
      const isCompletedStage = prev.completedStages.includes(stage);
      const isCurrentStage = stage === prev.currentStage;
      const isPreviousStage = targetIndex === currentIndex - 1;

      if (isCurrentStage || isCompletedStage || isPreviousStage) {
        return {
          ...prev,
          currentStage: stage,
          updatedAt: Date.now()
        };
      }

      return prev;
    });
  }, []);

  // 重置工作流
  const resetWorkflow = useCallback(() => {
    const newState = getInitialState();
    setWorkflowState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  }, []);

  // 检查 AI 响应是否包含阶段转换信号
  const checkForStageTransition = useCallback((aiResponse: string) => {
    const currentConfig = STAGE_CONFIG[workflowState.currentStage];

    if (currentConfig.nextTrigger && currentConfig.nextTrigger.length > 0) {
      const hasTriggerKeyword = currentConfig.nextTrigger.some(keyword =>
        aiResponse.includes(keyword)
      );

      if (hasTriggerKeyword) {
        advanceToNextStage({ aiResponse });
        return true;
      }
    }

    return false;
  }, [workflowState.currentStage, advanceToNextStage]);

  // 手动推进到指定阶段（用于需要用户确认的场景）
  const manuallyAdvanceToStage = useCallback((targetStage: WorkflowStage, data?: any) => {
    setWorkflowState(prev => {
      const stages = Object.values(WorkflowStage);
      const currentIndex = stages.indexOf(prev.currentStage);
      const targetIndex = stages.indexOf(targetStage);

      // 只能向前推进，不能后退
      if (targetIndex <= currentIndex) {
        console.warn('Cannot manually advance to a previous or current stage');
        return prev;
      }

      // 标记当前阶段及中间所有阶段为已完成
      const newlyCompleted = stages.slice(currentIndex, targetIndex);

      return {
        ...prev,
        currentStage: targetStage,
        completedStages: [...prev.completedStages, ...newlyCompleted.slice(0, -1)],
        stageData: {
          ...prev.stageData,
          [prev.currentStage]: data || prev.stageData[prev.currentStage]
        },
        updatedAt: Date.now()
      };
    });
  }, []);

  // 更新当前阶段数据
  const updateStageData = useCallback((data: any) => {
    setWorkflowState(prev => ({
      ...prev,
      stageData: {
        ...prev.stageData,
        [prev.currentStage]: data
      },
      updatedAt: Date.now()
    }));
  }, []);

  return {
    workflowState,
    advanceToNextStage,
    goToPreviousStage,
    jumpToStage,
    resetWorkflow,
    checkForStageTransition,
    manuallyAdvanceToStage,
    updateStageData
  };
};
