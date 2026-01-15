import React from 'react';
import { WorkflowStage, STAGE_CONFIG } from '../types/workflow';
import { CheckCircleIcon, ChevronRightIcon } from './Icons';

interface WorkflowProgressProps {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  onStageClick: (stage: WorkflowStage) => void;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStage,
  completedStages,
  onStageClick
}) => {
  const stages = Object.values(WorkflowStage);
  const currentIndex = stages.indexOf(currentStage);

  // 检查阶段是否可以点击
  const canClickStage = (stage: WorkflowStage): boolean => {
    const index = stages.indexOf(stage);
    const isCompleted = completedStages.includes(stage);
    const isCurrent = stage === currentStage;
    // 只有已完成的阶段才能点击返回查看
    // 当前阶段和上一阶段也可以点击
    const isPrevious = index === currentIndex - 1;

    return isCompleted || isCurrent || isPrevious;
  };

  // 判断阶段状态样式
  const getStageStatus = (stage: WorkflowStage, index: number) => {
    const isCompleted = completedStages.includes(stage);
    const isCurrent = stage === currentStage;

    if (isCompleted) return 'completed';
    if (isCurrent) return 'current';
    // 只有当前阶段之前的已完成阶段才标记为 completed
    // 其他所有未完成的阶段都是 pending（灰色）
    return 'pending';
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3">
      {/* 进度条 */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const config = STAGE_CONFIG[stage];
            const stageStatus = getStageStatus(stage, index);
            const isClickable = canClickStage(stage);

            return (
              <React.Fragment key={stage}>
                {/* 阶段节点 */}
                <div
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    !isClickable ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'
                  }`}
                  onClick={() => isClickable && onStageClick(stage)}
                >
                  {/* 图标 */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                      stageStatus === 'completed'
                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                        : stageStatus === 'current'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 animate-pulse'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {stageStatus === 'completed' ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span>{config.icon}</span>
                    )}
                  </div>

                  {/* 标题 */}
                  <div className="mt-1 text-center">
                    <p
                      className={`text-xs font-medium whitespace-nowrap ${
                        stageStatus === 'current'
                          ? 'text-blue-600'
                          : stageStatus === 'completed'
                          ? 'text-green-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {config.title}
                    </p>
                  </div>
                </div>

                {/* 连接线 */}
                {index < stages.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      stageStatus === 'completed' || (stageStatus === 'current' && index < currentIndex)
                        ? 'bg-gradient-to-r from-green-400 to-blue-400'
                        : 'bg-slate-200'
                    }`}
                    style={{ maxWidth: '60px' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 当前阶段描述 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            <span className="font-medium">当前阶段：</span>
            <span className="ml-1">{STAGE_CONFIG[currentStage].title}</span>
            <span className="mx-2">•</span>
            <span className="text-slate-500">{STAGE_CONFIG[currentStage].description}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;
