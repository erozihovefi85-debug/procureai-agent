
import React from 'react';
import { MenuIcon } from './Icons';
import WorkflowProgress from './WorkflowProgress';
import { WorkflowState, WorkflowStage } from '../types/workflow';

interface StandardViewProps {
    onMobileMenuClick: () => void;
    workflowState: WorkflowState;
    onStageClick: (stage: WorkflowStage) => void;
    onPreviousStage: () => void;
    children: React.ReactNode;
}

const StandardView: React.FC<StandardViewProps> = ({
    onMobileMenuClick,
    workflowState,
    onStageClick,
    children
}) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 min-w-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm z-10">
                <button
                    onClick={onMobileMenuClick}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors md:hidden"
                >
                    <MenuIcon />
                </button>
                <div className="flex-1">
                     <h2 className="font-semibold text-slate-800">企业寻源数字监理</h2>
                </div>
            </div>

            {/* Workflow Progress Bar */}
            <WorkflowProgress
                currentStage={workflowState.currentStage}
                completedStages={workflowState.completedStages}
                onStageClick={onStageClick}
            />

            {/* Content Area (Chat) */}
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
};

export default StandardView;
