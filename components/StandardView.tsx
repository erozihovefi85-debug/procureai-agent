
import React from 'react';
import { 
    KeyIcon, 
    DocumentTextIcon, 
    UsersIcon, 
    ChartBarIcon, 
    MenuIcon 
} from './Icons';

export interface TabConfig {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const TABS: TabConfig[] = [
    { id: 'keyword', label: '需求分析专家', icon: <KeyIcon className="w-4 h-4" /> },
    { id: 'docgen', label: '招标文件专家', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { id: 'supplier', label: '供应商专家', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'price', label: '价格分析专家', icon: <ChartBarIcon className="w-4 h-4" /> },
];

interface StandardViewProps {
    activeTabId: string;
    onTabChange: (id: string) => void;
    onMobileMenuClick: () => void;
    children: React.ReactNode;
}

const StandardView: React.FC<StandardViewProps> = ({ 
    activeTabId, 
    onTabChange, 
    onMobileMenuClick,
    children 
}) => {
    // const activeTab = TABS.find(t => t.id === activeTabId) || TABS[0];

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
                     <h2 className="font-semibold text-slate-800">规范采购</h2>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="bg-white border-b border-slate-200 shrink-0">
                <div className="flex overflow-x-auto no-scrollbar px-2 gap-2 py-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                                ${activeTabId === tab.id 
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }
                            `}
                        >
                            <span className={activeTabId === tab.id ? 'text-emerald-600' : 'text-slate-400'}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Context Header (Optional, describes current tool) */}
            <div className="bg-emerald-50/50 px-4 py-2 text-xs text-emerald-800 border-b border-emerald-100 flex items-center justify-center text-center">
                <span className="font-medium mr-1 shrink-0">功能:</span> 
                <span className="truncate">
                    {activeTabId === 'keyword' && "智能提取采购需求中的关键信息。"}
                    {activeTabId === 'docgen' && "协助编写和生成标准的采购需求文档。"}
                    {activeTabId === 'supplier' && "根据需求匹配合适的供应商，并进行初步分析。"}
                    {activeTabId === 'price' && "分析产品价格走势，提供预算建议和比价服务。"}
                </span>
            </div>

            {/* Content Area (Chat) */}
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
};

export default StandardView;
