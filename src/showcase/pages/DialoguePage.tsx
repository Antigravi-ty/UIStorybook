import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Copy,
  Layers,
  Sliders,
  Type,
  Box,
  Palette,
  CheckCircle2,
  Sparkles,
  Layers3,
  Ban,
} from 'lucide-react';
import {
  Dialogue,
  DialogueModal,
  dialogue,
  DialogueStackContainer,
  useDialogueStack,
  type DialogueTone,
  type DialogueButtonConfig,
  type DialogueButtonVariant,
} from '../../primitives/Dialogue';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';

const PRESET_ICONS = [
  'octagon-alert',
  'triangle-alert',
  'flame',
  'info',
  'bell',
  'shield-alert',
  'check-circle',
];

export const DialoguePage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // ──────────────────────────────────────────────────────────────────────────
  // Configurable Standardized Slots
  // ──────────────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState<string>('ALERT');
  const [tone, setTone] = useState<DialogueTone>('error');
  const [iconName, setIconName] = useState<string>('octagon-alert');
  const [content, setContent] = useState<string>(
    'Failed to establish signaling server through WebSocket.'
  );

  // Dynamic Action Buttons (Primary / Outline / Danger with disabled support)
  const [buttons, setButtons] = useState<DialogueButtonConfig[]>([
    { key: 'btn-1', label: 'Primary', variant: 'primary', disabled: false },
    { key: 'btn-2', label: 'Outline', variant: 'outline', disabled: false },
    { key: 'btn-3', label: 'Danger', variant: 'danger', disabled: false },
  ]);

  const [newButtonLabel, setNewButtonLabel] = useState<string>('Primary');
  const [newButtonVariant, setNewButtonVariant] = useState<DialogueButtonVariant>('outline');
  const [newButtonDisabled, setNewButtonDisabled] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copiedParams, setCopiedParams] = useState<boolean>(false);

  const { stack } = useDialogueStack();

  const handleAddButton = () => {
    const trimmed = newButtonLabel.trim();
    if (!trimmed) return;
    const newBtn: DialogueButtonConfig = {
      key: `btn-${Date.now()}`,
      label: trimmed,
      variant: newButtonVariant,
      disabled: newButtonDisabled,
    };
    setButtons((prev) => [...prev, newBtn]);
    setNewButtonLabel('Primary');
    setNewButtonDisabled(false);
  };

  const handleRemoveButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateButtonLabel = (index: number, newLabel: string) => {
    setButtons((prev) =>
      prev.map((btn, i) => (i === index ? { ...btn, label: newLabel } : btn))
    );
  };

  const handleUpdateButtonVariant = (index: number, newVariant: DialogueButtonVariant) => {
    setButtons((prev) =>
      prev.map((btn, i) => (i === index ? { ...btn, variant: newVariant } : btn))
    );
  };

  const handleToggleButtonDisabled = (index: number) => {
    setButtons((prev) =>
      prev.map((btn, i) => (i === index ? { ...btn, disabled: !btn.disabled } : btn))
    );
  };

  // Spawn a stacked dialogue with current configuration
  const handleSpawnStackedDialogue = () => {
    const stackIndex = dialogue.getCount() + 1;
    dialogue.show({
      title: stackIndex === 1 ? title : `${title} #${stackIndex}`,
      icon: iconName,
      iconVariant: 'plain',
      iconSize: 46,
      content: stackIndex === 1 ? content : `[Stack #${stackIndex}] ${content}`,
      tone,
      isLight,
      buttons: buttons.map((b) => ({
        ...b,
        onClick: () => {
          if (b.onClick) b.onClick();
        },
      })),
    });
  };

  // Structured export object matching standardized spec
  const currentParamsObject = {
    title,
    icon: iconName,
    iconVariant: 'plain',
    iconSize: 46,
    content,
    tone,
    buttons: buttons.map((b) => ({
      label: b.label,
      variant: b.variant ?? 'outline',
      ...(b.disabled ? { disabled: true } : {}),
    })),
  };

  const handleCopyParams = () => {
    navigator.clipboard.writeText(JSON.stringify(currentParamsObject, null, 2));
    setCopiedParams(true);
    setTimeout(() => setCopiedParams(false), 2200);
  };

  // Generated Recipe
  const generatedCode = `import { Dialogue, dialogue, DialogueStackContainer } from '@/components/primitives';

// 1. Direct Component Usage (声明式使用)
<Dialogue
  title="${title}"
  icon="${iconName}"
  iconVariant="plain"
  iconSize={46}
  content="${content.replace(/\n/g, '\\n')}"
  tone="${tone}"
  buttons={[
${buttons.map((b) => `    { label: '${b.label}', variant: '${b.variant ?? 'outline'}'${b.disabled ? ', disabled: true' : ''} }`).join(',\n')}
  ]}
  isLight={${isLight}}
/>

// 2. Programmatic Stacking (函数式多层叠加，无背景遮罩，最顶层渲染)
dialogue.show({
  title: "${title}",
  icon: "${iconName}",
  content: "${content.replace(/\n/g, '\\n')}",
  tone: "${tone}",
  buttons: [
    { label: 'Primary', variant: 'primary', onClick: () => console.log('Confirmed') },
    { label: 'Outline', variant: 'outline' },
    { label: 'Danger', variant: 'danger', disabled: true }
  ]
});`;

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full pb-16 font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Header & Modal Trigger */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Dialogue 对话框规范</h1>
              <Badge variant="primary" size="sm" isLight={isLight}>
                Standardized Component · Plain 46px · Stackable
              </Badge>
            </div>
            <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              标准独立组件。支持正文、Lucide 图标名、标题、4色调性与按钮变体/禁用态（disabled）。自带全方向浮雕阴影与内发光，弹窗模式无背景变暗遮罩（Zero Mask），支持多层叠加并在最顶层生成。
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="md"
              isLight={isLight}
              icon={copiedParams ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              onClick={handleCopyParams}
            >
              {copiedParams ? 'Copied JSON' : 'Export JSON'}
            </Button>

            <Button
              variant="primary"
              size="md"
              isLight={isLight}
              icon={<Layers3 className="h-4 w-4" />}
              onClick={handleSpawnStackedDialogue}
            >
              Spawn Stacked (+1 叠加弹窗)
            </Button>

            <Button
              variant="outline"
              size="md"
              isLight={isLight}
              icon={<ExternalLink className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Single Modal (单弹窗)
            </Button>
          </div>
        </div>

        {/* Stack Status Banner if dialogues are active */}
        {stack.length > 0 && (
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-800 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>当前已堆叠 <strong>{stack.length}</strong> 个对话框（最顶层优先渲染，无暗色背景遮罩）</span>
            </div>
            <button
              type="button"
              onClick={() => dialogue.clear()}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold cursor-pointer transition-colors"
            >
              全部关闭 (Clear All)
            </button>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Standardized Slot Control Panel */}
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
            <span className="font-bold text-sm tracking-tight">Dialogue 标准 Slots 参数输入</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm" isLight={isLight}>
              Plain 46px · Zero Mask · Stackable
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Title & Tone */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Type className="h-3.5 w-3.5" />
              <span>Title & Tone</span>
            </div>

            {/* Title Text Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Title (大标题文案)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ALERT"
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />
            </div>

            {/* Tone Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Color Level (4级调性: 灰黄橙红)</label>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                {(
                  [
                    { key: 'error', label: 'Error (红)', dot: 'bg-red-500' },
                    { key: 'warning', label: 'Warn (黄)', dot: 'bg-yellow-400' },
                    { key: 'orange', label: 'Alert (橙)', dot: 'bg-orange-500' },
                    { key: 'info', label: 'Info (灰)', dot: 'bg-neutral-400' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTone(item.key)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[10px] font-medium transition-all cursor-pointer ${
                      tone === item.key
                        ? isLight
                          ? 'bg-white border-neutral-900 shadow-xs text-neutral-900 font-bold'
                          : 'bg-neutral-800 border-white shadow-xs text-white font-bold'
                        : isLight
                        ? 'bg-white/70 hover:bg-white border-neutral-200 text-neutral-600'
                        : 'bg-neutral-950/70 hover:bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Solidified Specification Badge Card */}
            <div
              className={`p-3 rounded-xl border text-[11px] font-mono flex flex-col gap-1.5 ${
                isLight ? 'bg-white border-neutral-200 text-neutral-600' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Standardized Specs (已固化标准)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] leading-relaxed">
                <div>• Icon Variation: <strong>Plain</strong></div>
                <div>• Icon Size: <strong>46px</strong></div>
                <div>• Title Size: <strong>32px</strong></div>
                <div>• Letter Spacing: <strong>10px</strong></div>
                <div>• Title Weight: <strong>Regular 400</strong></div>
                <div>• Title Color: <strong>Content Sync</strong></div>
                <div>• Padding: <strong>10×16×32px</strong></div>
                <div>• Background Mask: <strong>None (0% Dim)</strong></div>
              </div>
            </div>
          </div>

          {/* Column 2: Icon Name & Content */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Icon (46px Plain) & Content</span>
            </div>

            {/* Icon Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Lucide Icon Name (直接传图标名)</span>
                <span className="text-[10px] font-mono text-neutral-400">{iconName} (46px)</span>
              </label>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="octagon-alert"
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />

              {/* Quick Pick Icon Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_ICONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setIconName(preset)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                      iconName === preset
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-900 border-white font-bold'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Content (正文内容)</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type informative English content..."
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors resize-none leading-relaxed ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />
            </div>
          </div>

          {/* Column 3: Button Manager with Disabled Support */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Box className="h-3.5 w-3.5" />
              <span>Button Manager (with disabled support)</span>
            </div>

            {/* Active Buttons List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Active Buttons (等长紧凑居中)</span>
                <span className="text-[10px] font-mono text-neutral-400">{buttons.length} items</span>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {buttons.map((btn, index) => (
                  <div
                    key={btn.key ?? index}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-colors ${
                      btn.disabled ? 'opacity-65' : ''
                    } ${
                      isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      #{index + 1}
                    </span>

                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => handleUpdateButtonLabel(index, e.target.value)}
                      placeholder="Button text"
                      style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                      className={`flex-1 min-w-0 px-2 py-1 rounded-lg border text-xs outline-none ${
                        isLight ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                      }`}
                    />

                    <select
                      value={btn.variant ?? 'outline'}
                      onChange={(e) => handleUpdateButtonVariant(index, e.target.value as DialogueButtonVariant)}
                      className={`px-1.5 py-1 rounded-lg border text-[11px] font-mono outline-none cursor-pointer shrink-0 ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-800'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                      }`}
                    >
                      <option value="primary">primary</option>
                      <option value="outline">outline</option>
                      <option value="danger">danger</option>
                    </select>

                    {/* Disabled Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleButtonDisabled(index)}
                      className={`px-1.5 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer shrink-0 ${
                        btn.disabled
                          ? 'bg-rose-500/15 border-rose-500 text-rose-500 font-bold'
                          : isLight
                          ? 'bg-neutral-100 border-neutral-300 text-neutral-500'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                      }`}
                      title={btn.disabled ? 'Button is disabled' : 'Click to disable button'}
                    >
                      {btn.disabled ? 'Disabled' : 'Enabled'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveButton(index)}
                      className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                      title="Remove button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {buttons.length === 0 && (
                  <div className={`p-4 rounded-xl border border-dashed text-xs text-center ${
                    isLight ? 'border-neutral-300 text-neutral-500' : 'border-neutral-700 text-neutral-400'
                  }`}>
                    No buttons. Add one below.
                  </div>
                )}
              </div>

              {/* Add Button Input */}
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
                  placeholder="Primary"
                  style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                  className={`flex-1 min-w-0 px-2 py-1 rounded-lg border text-xs outline-none ${
                    isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                  }`}
                />

                <select
                  value={newButtonVariant}
                  onChange={(e) => setNewButtonVariant(e.target.value as DialogueButtonVariant)}
                  className={`px-1.5 py-1 rounded-lg border text-[11px] font-mono outline-none cursor-pointer shrink-0 ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-800'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <option value="primary">primary</option>
                  <option value="outline">outline</option>
                  <option value="danger">danger</option>
                </select>

                <label className="flex items-center gap-1 text-[10px] font-mono cursor-pointer shrink-0 select-none">
                  <input
                    type="checkbox"
                    checked={newButtonDisabled}
                    onChange={(e) => setNewButtonDisabled(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span>Disabled</span>
                </label>

                <Button
                  variant="primary"
                  size="sm"
                  isLight={isLight}
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={handleAddButton}
                  className="shrink-0 cursor-pointer"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Dual Real-Time Previews (White Canvas vs Black Canvas) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold tracking-tight">
              Dual Previews · 实时双预览画布
            </h2>
          </div>
          <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Plain 46px · Zero Mask · Solidified Dual Elevation
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Light Mode Canvas */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold">Light Mode Canvas (白底视口)</span>
              </div>
              <Badge variant="neutral" size="sm" isLight={true}>
                bg-white
              </Badge>
            </div>

            <div
              className="w-full min-h-[400px] p-6 sm:p-10 rounded-2xl border border-neutral-200/90 bg-[#f8f9fb] flex items-center justify-center relative overflow-hidden shadow-inner"
              style={{
                backgroundImage: 'radial-gradient(#e2e4e8 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <Dialogue
                title={title}
                content={content}
                icon={iconName}
                tone={tone}
                buttons={buttons}
                isLight={true}
              />
            </div>
          </div>

          {/* Dark Mode Canvas */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-neutral-400" />
                <span className="text-xs font-semibold">Dark Mode Canvas (黑底视口)</span>
              </div>
              <Badge variant="neutral" size="sm" isLight={false}>
                bg-black
              </Badge>
            </div>

            <div
              className="w-full min-h-[400px] p-6 sm:p-10 rounded-2xl border border-neutral-800 bg-[#08080a] flex items-center justify-center relative overflow-hidden shadow-inner"
              style={{
                backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <Dialogue
                title={title}
                content={content}
                icon={iconName}
                tone={tone}
                buttons={buttons}
                isLight={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Parameters Export Box (一键复制固化参数) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-tight font-mono uppercase text-neutral-400">
            Exported Parameters JSON (符合要求的标准化参数对象)
          </h3>
          <button
            type="button"
            onClick={handleCopyParams}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              copiedParams
                ? 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs'
                : isLight
                ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 shadow-xs'
                : 'bg-white text-neutral-900 border-white hover:bg-neutral-100 shadow-xs'
            }`}
          >
            {copiedParams ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedParams ? 'Copied to Clipboard!' : 'Copy Configuration'}</span>
          </button>
        </div>

        <pre
          className={`p-4 rounded-xl border text-[11px] font-mono leading-relaxed overflow-x-auto ${
            isLight
              ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs'
              : 'bg-neutral-950 border-neutral-800 text-neutral-200 shadow-2xs'
          }`}
        >
          <code>{JSON.stringify(currentParamsObject, null, 2)}</code>
        </pre>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Recipe Code Block */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold tracking-tight">Agent Code Recipe (代码引用范例)</h3>
        <CodeBlock
          isLight={isLight}
          title="Dialogue / dialogue.show Recipe"
          code={generatedCode}
        />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Centered Modal Overlay (无暗色背景遮罩，透明层，强制选按键) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DialogueModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        content={content}
        icon={iconName}
        tone={tone}
        isLight={isLight}
        buttons={buttons.map((b) => ({
          ...b,
          onClick: () => {
            if (b.disabled) return;
            if (b.onClick) b.onClick();
            setIsModalOpen(false);
          },
        }))}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Dialogue Stack Container (支持任意多次调用并多层叠加，无背景遮罩) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DialogueStackContainer isLight={isLight} />
    </div>
  );
};
