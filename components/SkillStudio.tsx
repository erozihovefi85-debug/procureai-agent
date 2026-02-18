import React, { useState } from 'react';
import { Skill, SkillParameter, SkillCategory, User } from '../types';
import { skillAPI, agentAPI } from '../services/api';
import { ChevronLeftIcon, PlusIcon, TrashIcon } from './Icons';

interface SkillStudioProps {
  user: User | null;
  editSkill?: Skill | null;
  onBack: () => void;
  onSaved: (skill: Skill) => void;
}

const MODEL_OPTIONS = [
  { label: 'Qwen2.5-72B (推荐)', value: 'Qwen/Qwen2.5-72B-Instruct' },
  { label: 'Qwen2.5-32B', value: 'Qwen/Qwen2.5-32B-Instruct' },
  { label: 'Qwen2.5-14B', value: 'Qwen/Qwen2.5-14B-Instruct' },
  { label: 'Qwen2.5-7B (快速)', value: 'Qwen/Qwen2.5-7B-Instruct' },
  { label: 'DeepSeek-V3', value: 'deepseek-ai/DeepSeek-V3' },
];

const CATEGORY_OPTIONS: { label: string; value: SkillCategory }[] = [
  { label: '采购管理', value: 'procurement' },
  { label: '数据分析', value: 'analysis' },
  { label: '文档处理', value: 'document' },
  { label: '供应商', value: 'supplier' },
  { label: '通用工具', value: 'general' },
  { label: '自定义', value: 'custom' },
];

const PARAM_TYPES = [
  { label: '文本', value: 'string' },
  { label: '长文本', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: '下拉选择', value: 'select' },
];

const SkillStudio: React.FC<SkillStudioProps> = ({ user, editSkill, onBack, onSaved }) => {
  const isEditing = !!editSkill;

  const [form, setForm] = useState({
    name: editSkill?.name || '',
    description: editSkill?.description || '',
    category: editSkill?.category || 'custom' as SkillCategory,
    icon: editSkill?.icon || 'custom',
    color: editSkill?.color || '#6366F1',
    systemPrompt: editSkill?.config?.systemPrompt || '',
    model: editSkill?.config?.model || 'Qwen/Qwen2.5-72B-Instruct',
    temperature: editSkill?.config?.temperature || 0.7,
    maxTokens: editSkill?.config?.maxTokens || 4096,
    outputFormat: editSkill?.outputFormat || 'markdown',
    visibility: editSkill?.visibility || 'private',
    type: editSkill?.type || 'custom',
    // API type fields
    apiEndpoint: editSkill?.config?.apiEndpoint || '',
    apiMethod: editSkill?.config?.apiMethod || 'POST',
    apiBodyTemplate: editSkill?.config?.apiBodyTemplate || '{"query": "{{query}}"}',
    responseMapping: editSkill?.config?.responseMapping || '',
  });

  const [parameters, setParameters] = useState<SkillParameter[]>(
    editSkill?.parameters || []
  );

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'prompt' | 'params' | 'test'>('basic');

  const handleSave = async () => {
    if (!form.name || !form.description) {
      alert('请填写技能名称和描述');
      return;
    }
    if (form.type === 'custom' && !form.systemPrompt) {
      alert('请填写系统提示词');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        category: form.category,
        icon: form.icon,
        color: form.color,
        outputFormat: form.outputFormat,
        visibility: form.visibility,
        config: form.type === 'custom' ? {
          systemPrompt: form.systemPrompt,
          model: form.model,
          temperature: form.temperature,
          maxTokens: form.maxTokens,
        } : {
          apiEndpoint: form.apiEndpoint,
          apiMethod: form.apiMethod,
          apiBodyTemplate: form.apiBodyTemplate,
          responseMapping: form.responseMapping,
        },
        parameters,
      };

      let result;
      if (isEditing && editSkill) {
        result = await skillAPI.update(editSkill.slug, data);
      } else {
        result = await skillAPI.create(data);
      }

      onSaved(result.data.data);
    } catch (error: any) {
      alert('保存失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testQuery) return;
    if (form.type === 'custom' && !form.systemPrompt) {
      alert('请先填写系统提示词');
      return;
    }

    setTesting(true);
    setTestResult('');

    // If editing an existing skill, use execute API
    if (isEditing && editSkill) {
      try {
        await agentAPI.execute(
          { skillSlug: editSkill.slug, query: testQuery },
          {
            onChunk: (chunk) => setTestResult(prev => prev + chunk),
            onEnd: () => setTesting(false),
            onError: (err) => {
              setTestResult(prev => prev + `\n[Error: ${err}]`);
              setTesting(false);
            },
            onNodeChange: () => {},
          }
        );
      } catch (error: any) {
        setTestResult(`测试失败: ${error.message}`);
        setTesting(false);
      }
    } else {
      // For new skills, show preview of what the prompt would look like
      setTestResult(`[预览模式]\n\n系统提示词:\n${form.systemPrompt}\n\n用户输入:\n${testQuery}\n\n注：保存技能后可进行真实测试`);
      setTesting(false);
    }
  };

  const addParameter = () => {
    setParameters(prev => [...prev, {
      name: `param_${prev.length + 1}`,
      label: `参数${prev.length + 1}`,
      type: 'string',
      required: false,
      placeholder: '',
      description: '',
    }]);
  };

  const updateParameter = (index: number, updates: Partial<SkillParameter>) => {
    setParameters(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const removeParameter = (index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {isEditing ? '编辑技能' : '创建新技能'}
              </h1>
              <p className="text-sm text-slate-500">
                {isEditing ? '修改技能配置和提示词' : '配置提示词和参数，创建你的专属AI技能'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {saving ? '保存中...' : isEditing ? '更新技能' : '创建技能'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-slate-100 rounded-lg p-1">
          {[
            { id: 'basic', label: '基本信息' },
            { id: 'prompt', label: '提示词配置' },
            { id: 'params', label: '参数定义' },
            { id: 'test', label: '测试运行' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h3 className="font-semibold text-slate-700">基本信息</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">技能名称 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例如：合同审查助手"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">技能描述 *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="描述这个技能的功能和适用场景..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">分类</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as SkillCategory }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">可见性</label>
                    <select
                      value={form.visibility}
                      onChange={(e) => setForm(prev => ({ ...prev, visibility: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="private">仅自己可见</option>
                      <option value="shared">团队共享</option>
                      <option value="public">公开</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">技能类型</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={isEditing}
                    >
                      <option value="custom">自定义 (LLM提示词)</option>
                      <option value="api">API调用</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">主题色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                        className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                      />
                      <span className="text-sm text-slate-500">{form.color}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Config Tab */}
          {activeTab === 'prompt' && (
            <div className="space-y-6">
              {form.type === 'custom' ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <h3 className="font-semibold text-slate-700">LLM 配置</h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">系统提示词 *</label>
                    <textarea
                      value={form.systemPrompt}
                      onChange={(e) => setForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      rows={12}
                      placeholder={`你是一个专业的采购助手。你的任务是帮助用户完成...

可用变量（与参数定义对应）:
{{param_name}} - 在执行时会被替换为实际参数值`}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      提示: 使用 {'{{param_name}}'} 插入参数变量
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">模型</label>
                      <select
                        value={form.model}
                        onChange={(e) => setForm(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {MODEL_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        温度: {form.temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={form.temperature}
                        onChange={(e) => setForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        className="w-full mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">最大Token数</label>
                      <input
                        type="number"
                        value={form.maxTokens}
                        onChange={(e) => setForm(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <h3 className="font-semibold text-slate-700">API 配置</h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">API 端点 *</label>
                    <input
                      type="text"
                      value={form.apiEndpoint}
                      onChange={(e) => setForm(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://api.example.com/v1/process"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">请求方法</label>
                    <select
                      value={form.apiMethod}
                      onChange={(e) => setForm(prev => ({ ...prev, apiMethod: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">请求体模板</label>
                    <textarea
                      value={form.apiBodyTemplate}
                      onChange={(e) => setForm(prev => ({ ...prev, apiBodyTemplate: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      rows={6}
                      placeholder='{"query": "{{query}}", "param1": "{{param1}}"}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">响应路径</label>
                    <input
                      type="text"
                      value={form.responseMapping}
                      onChange={(e) => setForm(prev => ({ ...prev, responseMapping: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="data.result (用点分路径提取响应中的特定字段)"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Parameters Tab */}
          {activeTab === 'params' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700">输入参数</h3>
                  <button
                    onClick={addParameter}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" /> 添加参数
                  </button>
                </div>

                {parameters.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">
                    还没有参数。用户输入的文本会作为默认 query 参数传入。<br />
                    如需额外参数，点击"添加参数"。
                  </p>
                ) : (
                  <div className="space-y-4">
                    {parameters.map((param, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-600">参数 #{index + 1}</span>
                          <button
                            onClick={() => removeParameter(index)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">变量名</label>
                            <input
                              type="text"
                              value={param.name}
                              onChange={(e) => updateParameter(index, { name: e.target.value })}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                              placeholder="variable_name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">显示名称</label>
                            <input
                              type="text"
                              value={param.label}
                              onChange={(e) => updateParameter(index, { label: e.target.value })}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                              placeholder="参数显示名称"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">类型</label>
                            <select
                              value={param.type}
                              onChange={(e) => updateParameter(index, { type: e.target.value as any })}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                            >
                              {PARAM_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                checked={param.required}
                                onChange={(e) => updateParameter(index, { required: e.target.checked })}
                                className="rounded border-slate-300"
                              />
                              必填
                            </label>
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs text-slate-500 mb-1">描述 / 占位符</label>
                          <input
                            type="text"
                            value={param.placeholder || ''}
                            onChange={(e) => updateParameter(index, { placeholder: e.target.value })}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                            placeholder="输入提示文字..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Tab */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-700 mb-4">测试运行</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1">测试输入</label>
                  <textarea
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="输入测试内容..."
                  />
                </div>

                <button
                  onClick={handleTest}
                  disabled={testing || !testQuery}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {testing ? '运行中...' : '运行测试'}
                </button>

                {testResult && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-600 mb-2">输出结果</h4>
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{testResult}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillStudio;
