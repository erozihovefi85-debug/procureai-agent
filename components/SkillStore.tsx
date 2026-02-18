import React, { useState, useEffect } from 'react';
import { Skill, SkillCategory, User } from '../types';
import { skillAPI } from '../services/api';
import { PlusIcon, SearchIcon, HomeIcon, ChevronLeftIcon } from './Icons';

interface SkillStoreProps {
  user: User | null;
  onSelectSkill: (skill: Skill) => void;
  onCreateSkill: () => void;
  onBack: () => void;
}

// Skill图标映射
const SKILL_ICONS: Record<string, string> = {
  shopping: '🛍️',
  clipboard: '📋',
  document: '📄',
  users: '👥',
  chart: '📊',
  custom: '⚡',
  default: '🔧',
};

// 分类标签
const CATEGORY_LABELS: Record<SkillCategory, string> = {
  procurement: '采购管理',
  analysis: '数据分析',
  document: '文档处理',
  supplier: '供应商',
  general: '通用工具',
  custom: '自定义',
};

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  procurement: 'bg-green-100 text-green-700',
  analysis: 'bg-red-100 text-red-700',
  document: 'bg-purple-100 text-purple-700',
  supplier: 'bg-yellow-100 text-yellow-700',
  general: 'bg-blue-100 text-blue-700',
  custom: 'bg-indigo-100 text-indigo-700',
};

const SkillStore: React.FC<SkillStoreProps> = ({ user, onSelectSkill, onCreateSkill, onBack }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const response = await skillAPI.getAll({});
      setSkills(response.data.data || []);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill => {
    if (selectedCategory !== 'all' && skill.category !== selectedCategory) return false;
    if (selectedType !== 'all' && skill.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return skill.name.toLowerCase().includes(q) || skill.description.toLowerCase().includes(q);
    }
    return true;
  });

  const featuredSkills = filteredSkills.filter(s => s.featured);
  const otherSkills = filteredSkills.filter(s => !s.featured);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Skill 技能中心</h1>
              <p className="text-sm text-slate-500">选择或创建技能，让AI帮你完成各种任务</p>
            </div>
          </div>
          <button
            onClick={onCreateSkill}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            创建技能
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索技能..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'procurement', 'general', 'analysis', 'document', 'supplier', 'custom'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? '全部' : CATEGORY_LABELS[cat as SkillCategory] || cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-lg font-medium">没有找到匹配的技能</p>
            <p className="text-sm mt-1">尝试更改搜索条件或创建新技能</p>
          </div>
        ) : (
          <>
            {/* Featured Skills */}
            {featuredSkills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">推荐技能</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredSkills.map(skill => (
                    <SkillCard key={skill._id} skill={skill} onClick={() => onSelectSkill(skill)} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Other Skills */}
            {otherSkills.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-700 mb-4">
                  {featuredSkills.length > 0 ? '其他技能' : '所有技能'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherSkills.map(skill => (
                    <SkillCard key={skill._id} skill={skill} onClick={() => onSelectSkill(skill)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Skill卡片组件
const SkillCard: React.FC<{ skill: Skill; onClick: () => void; featured?: boolean }> = ({ skill, onClick, featured }) => {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-white rounded-xl border transition-all hover:shadow-md ${
        featured ? 'border-indigo-200 hover:border-indigo-300' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: skill.color + '20' }}
          >
            {SKILL_ICONS[skill.icon] || SKILL_ICONS.default}
          </div>
          <div className="flex items-center gap-2">
            {skill.type === 'builtin' && (
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">内置</span>
            )}
            {skill.type === 'custom' && (
              <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">自定义</span>
            )}
            {skill.type === 'api' && (
              <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">API</span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
          {skill.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{skill.description}</p>

        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[skill.category] || 'bg-slate-100 text-slate-600'}`}>
            {CATEGORY_LABELS[skill.category] || skill.category}
          </span>
          <span className="text-xs text-slate-400">
            {skill.usageCount > 0 ? `${skill.usageCount} 次使用` : '尚未使用'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SkillStore;
