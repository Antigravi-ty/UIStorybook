import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  Bell,
  Flame,
  Terminal,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import {
  Dialogue,
  DialogueModal,
  type DialogueTone,
  type DialogueButtonConfig,
} from '../../primitives/Dialogue';
import { Button, type ButtonVariant } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { CodeBlock } from '../CodeBlock';

type IconKey = 'auto' | 'alert-circle' | 'alert-triangle' | 'info' | 'check-circle' | 'shield-alert' | 'flame' | 'bell' | 'terminal' | 'help-circle';

export const DialoguePage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // ──────────────────────────────────────────────────────────────────────────
  // State: Dialogue Parameters
  // ──────────────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState<string>('重置游戏控制设置');
  const [content, setContent] = useState<string>(
    '此操作将把所有按键映射与手柄死区参数恢复为出厂默认值。\n当前未导出的自定义偏好方案将被永久覆盖，请确认是否继续？'
  );
  const [tone, setTone] = useState<DialogueTone>('warning');
  const [iconKey, setIconKey] = useState<IconKey>('auto');
  const [minHeight, setMinHeight] = useState<number>(210);
  const [maxWidth, setMaxWidth] = useState<number>(460);

  // Dynamic buttons list
  const [buttons, setButtons] = useState<DialogueButtonConfig[]>([
    { key: 'btn-1', label: '确认重置', variant: 'primary' },
    { key: 'btn-2', label: '稍后提醒', variant: 'secondary' },
    { key: 'btn-3', label: '取消', variant: 'outline' },
  ]);

  // Input for adding a new button
  const [newButtonLabel, setNewButtonLabel] = useState<string>('了解详情');
  const [newButtonVariant, setNewButtonVariant] = useState<ButtonVariant>('secondary');

  // Modal open state for live centered popup
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Helper to resolve custom icon
  const renderSelectedIcon = () => {
    switch (iconKey) {
      case 'alert-circle':
        return <AlertCircle className="h-5 w-5" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'check-circle':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'shield-alert':
        return <ShieldAlert className="h-5 w-5" />;
      case 'flame':
        return <Flame className="h-5 w-5" />;
      case 'bell':
        return <Bell className="h-5 w-5" />;
      case 'terminal':
        return <Terminal className="h-5 w-5" />;
      case 'help-circle':
        return <HelpCircle className="h-5 w-5" />;
      case 'auto':
      default:
        return undefined; // 让组件内部根据 tone 自动匹配默认图标
    }
  };

  // Add button handler
  const handleAddButton = () => {
    const trimmed = newButtonLabel.trim();
    if (!trimmed) return;
    const newBtn: DialogueButtonConfig = {
      key: `btn-${Date.now()}`,
      label: trimmed,
      variant: newButtonVariant,
    };
    setButtons((prev) => [...prev, newBtn]);
    setNewButtonLabel('');
  };

  // Remove button handler
  const handleRemoveButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  };

  // Update button label
  const handleUpdateButtonLabel = (index: number, newLabel: string) => {
    setButtons((prev) =>
      prev.map((btn, i) => (i === index ? { ...btn, label: newLabel } : btn))
    );
  };

  // Update button variant
  const handleUpdateButtonVariant = (index: number, newVariant: ButtonVariant) => {
    setButtons((prev) =>
      prev.map((btn, i) => (i === index ? { ...btn, variant: newVariant } : btn))
    );
  };

  // Scenario presets
  const applyPreset = (preset: 'error' | 'warning' | 'info' | 'success') => {
    switch (preset) {
      case 'error':
        setTitle('网络连接中断 (ERR_CONN_TIMEOUT)');
        setContent('未能与欧服调度网关保持握手，正在尝试重新协商物理帧。\n若 30 秒内未响应，当前排位积分结算可能受影响。');
        setTone('error');
        setIconKey('auto');
        setButtons([
          { key: 'err-1', label: '立即重试', variant: 'danger' },
          { key: 'err-2', label: '离线模式', variant: 'secondary' },
        ]);
        break;
      case 'warning':
        setTitle('重置游戏控制设置');
        setContent('此操作将把所有按键映射与手柄死区参数恢复为出厂默认值。\n当前未导出的自定义偏好方案将被永久覆盖，请确认是否继续？');
        setTone('warning');
        setIconKey('auto');
        setButtons([
          { key: 'warn-1', label: '确认重置', variant: 'primary' },
          { key: 'warn-2', label: '稍后提醒', variant: 'secondary' },
          { key: 'warn-3', label: '取消', variant: 'outline' },
        ]);
        break;
      case 'info':
        setTitle('着色器管线预热完毕');
        setContent('已完成 64 组 WebGPU 动态材质管线预编译与纹理就绪检测。\n所有竞技场加载延迟已降至 sub-5ms 瞬时切换标准。');
        setTone('info');
        setIconKey('auto');
        setButtons([
          { key: 'info-1', label: '知道了', variant: 'primary' },
        ]);
        break;
      case 'success':
        setTitle('赛季段位排位认证成功');
        setContent('恭喜！你在 2v2 竞技赛制中已达成「Grand Champion I」段位标定。\n专属赛季轮毂与喷漆奖励已同步解锁至车库装配库。');
        setTone('success');
        setIconKey('auto');
        setButtons([
          { key: 'succ-1', label: '前往车库装配', variant: 'primary' },
          { key: 'succ-2', label: '稍后再看', variant: 'secondary' },
        ]);
        break;
    }
  };

  // Generate code snippet
  const generatedCode = `import { Dialogue, DialogueModal } from '@/components/primitives';

// 1. 静态嵌入展示 (支持 isLight 亮暗模式)
<Dialogue
  title="${title}"
  content="${content.replace(/\n/g, '\\n')}"
  tone="${tone}"
  minHeight={${minHeight}}
  maxWidth={${maxWidth}}
  isLight={${isLight}}
  buttons={[
${buttons.map((b) => `    { label: '${b.label}', variant: '${b.variant ?? 'secondary'}' }`).join(',\n')}
  ]}
/>

// 2. 居中全屏模态弹窗调用 (固定居中不可调整位置)
<DialogueModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="${title}"
  content="${content.replace(/\n/g, '\\n')}"
  tone="${tone}"
  isLight={${isLight}}
  buttons={[
${buttons.map((b) => `    { label: '${b.label}', variant: '${b.variant ?? 'secondary'}', onClick: () => setIsOpen(false) }`).join(',\n')}
  ]}
/>`;

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full pb-16">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 顶部标题区与模态弹窗测试入口 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Dialogue 弹窗对话框</h1>
              <Badge variant="primary" size="sm" isLight={isLight}>
                3-Part Seamless
              </Badge>
            </div>
            <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              浑然一体的三段式对话框规范：上边大标题居中，中间左侧图标与右侧多行正文，下边居中紧凑等长按键组。
              严格去除显式分割线，具备最低高度保底，支持深红、黄色、信息蓝与中性等不同等级调性。
            </p>
          </div>

          {/* 唤起居中模态弹窗的按钮 */}
          <div className="shrink-0 flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              isLight={isLight}
              icon={<ExternalLink className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
              className="shadow-md"
            >
              在当前视口弹出 Dialogue (居中模态)
            </Button>
          </div>
        </div>

        {/* 快速预设药丸栏 */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <span className={`text-xs font-mono shrink-0 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            快速情境预设:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('error')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              tone === 'error'
                ? 'bg-red-500/15 border-red-500/40 text-red-500 font-semibold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
            }`}
          >
            致命异常 (Error · 2键)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('warning')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              tone === 'warning'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-semibold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
            }`}
          >
            重要警告 (Warning · 3键)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('info')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              tone === 'info'
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-500 font-semibold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
            }`}
          >
            系统提示 (Info · 1键)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('success')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              tone === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500 font-semibold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
            }`}
          >
            段位晋升 (Success · 2键)
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 控制面板 (Control Panel) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-6 shadow-sm ${
          isLight
            ? 'bg-neutral-50/90 border-neutral-200/90 text-neutral-900'
            : 'bg-neutral-900/60 border-neutral-800 text-neutral-100'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-neutral-200/70 dark:border-neutral-800/70">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm tracking-tight">Dialogue 控制面板 (Control Panel)</span>
          </div>
          <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            动态参数热重载
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左列：基础文本与等级调性 */}
          <div className="flex flex-col gap-4">
            {/* 大标题输入 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>大标题 (Title)</span>
                <span className={`text-[10px] font-normal ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  居中展示
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入对话框标题..."
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />
            </div>

            {/* 中段信息文本 (多行) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>信息内容 (Content / Message)</span>
                <span className={`text-[10px] font-normal ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  支持多行展示
                </span>
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入对话框正文描述内容..."
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors resize-none ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />
            </div>

            {/* 整体颜色调性 (Tone) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">整体颜色调性 (Severity / Tone)</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(
                  [
                    { key: 'error', label: '深红 (Error)', color: 'bg-red-500' },
                    { key: 'warning', label: '黄色 (Warning)', color: 'bg-amber-500' },
                    { key: 'info', label: '正常 (Info)', color: 'bg-sky-500' },
                    { key: 'success', label: '绿色 (Success)', color: 'bg-emerald-500' },
                    { key: 'neutral', label: '中性 (Neutral)', color: 'bg-neutral-400' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTone(t.key)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                      tone === t.key
                        ? isLight
                          ? 'bg-white border-neutral-900 shadow-xs text-neutral-900 font-bold'
                          : 'bg-neutral-800 border-white shadow-xs text-white font-bold'
                        : isLight
                        ? 'bg-white/70 hover:bg-white border-neutral-200 text-neutral-600'
                        : 'bg-neutral-950/70 hover:bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
                    <span className="text-[10px] truncate">{t.key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 图标选择 (Icon) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>左侧图标 (Icon Selection)</span>
                <span className={`text-[10px] font-normal ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  左半侧左对齐
                </span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(
                  [
                    { key: 'auto', label: '根据调性', icon: <Sparkles className="h-3.5 w-3.5" /> },
                    { key: 'alert-triangle', label: 'Warning', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
                    { key: 'alert-circle', label: 'Error', icon: <AlertCircle className="h-3.5 w-3.5" /> },
                    { key: 'info', label: 'Info', icon: <Info className="h-3.5 w-3.5" /> },
                    { key: 'check-circle', label: 'Success', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                    { key: 'shield-alert', label: 'Shield', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
                    { key: 'flame', label: 'Flame', icon: <Flame className="h-3.5 w-3.5" /> },
                    { key: 'bell', label: 'Bell', icon: <Bell className="h-3.5 w-3.5" /> },
                    { key: 'terminal', label: 'Terminal', icon: <Terminal className="h-3.5 w-3.5" /> },
                    { key: 'help-circle', label: 'Help', icon: <HelpCircle className="h-3.5 w-3.5" /> },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIconKey(item.key)}
                    className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                      iconKey === item.key
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-900 border-white'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右列：几何尺寸与按键配置 */}
          <div className="flex flex-col gap-4">
            {/* 几何尺寸微调 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <SliderControl
                  label="最低高度 (Min Height)"
                  value={minHeight}
                  min={170}
                  max={320}
                  step={5}
                  unit="px"
                  isLight={isLight}
                  onChange={setMinHeight}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <SliderControl
                  label="最大宽度 (Max Width)"
                  value={maxWidth}
                  min={360}
                  max={600}
                  step={10}
                  unit="px"
                  isLight={isLight}
                  onChange={setMaxWidth}
                />
              </div>
            </div>

            {/* 按键动态管理 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">
                  底部按键列表 (Buttons · 居中紧凑 · 等长对齐)
                </label>
                <span className={`text-[10px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  当前共 {buttons.length} 个按键
                </span>
              </div>

              {/* 现有按键列表 */}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {buttons.map((btn, index) => (
                  <div
                    key={btn.key ?? index}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-colors ${
                      isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      #{index + 1}
                    </span>

                    {/* 按键文案输入 */}
                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => handleUpdateButtonLabel(index, e.target.value)}
                      placeholder="按键文本"
                      className={`flex-1 min-w-0 px-2 py-1 rounded-lg border text-xs outline-none ${
                        isLight ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                      }`}
                    />

                    {/* 样式变体选择 */}
                    <select
                      value={btn.variant ?? 'secondary'}
                      onChange={(e) => handleUpdateButtonVariant(index, e.target.value as ButtonVariant)}
                      className={`px-2 py-1 rounded-lg border text-[11px] outline-none cursor-pointer shrink-0 ${
                        isLight ? 'bg-neutral-50 border-neutral-300 text-neutral-800' : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                      }`}
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="outline">Outline</option>
                      <option value="danger">Danger</option>
                    </select>

                    {/* 删除按键 */}
                    <button
                      type="button"
                      onClick={() => handleRemoveButton(index)}
                      className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                      title="删除此按键"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {buttons.length === 0 && (
                  <div className={`p-4 rounded-xl border border-dashed text-xs text-center ${
                    isLight ? 'border-neutral-300 text-neutral-500' : 'border-neutral-700 text-neutral-400'
                  }`}>
                    暂无按键，请在下方添加按键。
                  </div>
                )}
              </div>

              {/* 添加新按键输入区 */}
              <div
                className={`flex items-center gap-2 p-2 rounded-xl border border-dashed mt-1 ${
                  isLight ? 'bg-neutral-100/60 border-neutral-300' : 'bg-neutral-950/60 border-neutral-700'
                }`}
              >
                <input
                  type="text"
                  value={newButtonLabel}
                  onChange={(e) => setNewButtonLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddButton();
                    }
                  }}
                  placeholder="新按键文案 (例如: 立即执行)"
                  className={`flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                    isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                  }`}
                />

                <select
                  value={newButtonVariant}
                  onChange={(e) => setNewButtonVariant(e.target.value as ButtonVariant)}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] outline-none cursor-pointer shrink-0 ${
                    isLight ? 'bg-white border-neutral-300 text-neutral-800' : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                  <option value="danger">Danger</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  isLight={isLight}
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={handleAddButton}
                  className="shrink-0"
                >
                  添加按键
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 下方实时双预览区 (亮色模式白底 + 暗色模式黑底) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold tracking-tight">
              双色调实时预览 (Dual Real-time Previews)
            </h2>
          </div>
          <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Light Canvas (White) & Dark Canvas (Black)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. 亮色模式实时预览 (白底) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold">亮色模式预览 (Light Mode · 白底)</span>
              </div>
              <Badge variant="neutral" size="sm" isLight={true}>
                bg-white
              </Badge>
            </div>

            <div
              className="w-full min-h-[360px] p-6 sm:p-8 rounded-2xl border border-neutral-200/90 bg-[#f6f7f9] flex items-center justify-center relative overflow-hidden shadow-inner"
              style={{
                backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <Dialogue
                title={title}
                content={content}
                icon={renderSelectedIcon()}
                tone={tone}
                buttons={buttons}
                isLight={true}
                minHeight={minHeight}
                maxWidth={maxWidth}
              />
            </div>
          </div>

          {/* 2. 暗色模式实时预览 (黑底) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-neutral-400" />
                <span className="text-xs font-semibold">暗色模式预览 (Dark Mode · 黑底)</span>
              </div>
              <Badge variant="neutral" size="sm" isLight={false}>
                bg-black
              </Badge>
            </div>

            <div
              className="w-full min-h-[360px] p-6 sm:p-8 rounded-2xl border border-neutral-800 bg-[#08080a] flex items-center justify-center relative overflow-hidden shadow-inner"
              style={{
                backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <Dialogue
                title={title}
                content={content}
                icon={renderSelectedIcon()}
                tone={tone}
                buttons={buttons}
                isLight={false}
                minHeight={minHeight}
                maxWidth={maxWidth}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Agent 引用代码配方 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold tracking-tight">Agent 代码集成参考 (Recipe Reference)</h3>
        <CodeBlock
          isLight={isLight}
          title="Dialogue / DialogueModal 调用规范"
          code={generatedCode}
        />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 全屏居中模态弹窗 (由顶部按钮触发，严格居中，不可拖动) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DialogueModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        content={content}
        icon={renderSelectedIcon()}
        tone={tone}
        isLight={isLight}
        minHeight={minHeight}
        maxWidth={maxWidth}
        buttons={buttons.map((b) => ({
          ...b,
          onClick: () => {
            if (b.onClick) b.onClick();
            setIsModalOpen(false);
          },
        }))}
      />
    </div>
  );
};
