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
} from 'lucide-react';
import {
  Dialogue,
  DialogueModal,
  type DialogueTone,
  type DialogueButtonConfig,
  type DialogueButtonVariant,
  type DialogueIconVariant,
} from '../../primitives/Dialogue';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { CodeBlock } from '../CodeBlock';

const PRESET_ICONS = [
  'alert-circle',
  'triangle-alert',
  'flame',
  'info',
  'bell',
  'shield-alert',
  'octagon-alert',
  'check-circle',
];

export const DialoguePage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // ──────────────────────────────────────────────────────────────────────────
  // Configurable Slots
  // ──────────────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState<string>('ALERT');
  const [tone, setTone] = useState<DialogueTone>('error');
  const [iconName, setIconName] = useState<string>('alert-circle');
  const [iconVariant, setIconVariant] = useState<DialogueIconVariant>('container');
  const [iconSize, setIconSize] = useState<number>(22);
  const [content, setContent] = useState<string>(
    'Failed to establish signaling server through WebSocket.'
  );

  // Dynamic Action Buttons (Primary / Outline / Danger)
  const [buttons, setButtons] = useState<DialogueButtonConfig[]>([
    { key: 'btn-1', label: 'Primary', variant: 'primary' },
    { key: 'btn-2', label: 'Outline', variant: 'outline' },
    { key: 'btn-3', label: 'Danger', variant: 'danger' },
  ]);

  const [newButtonLabel, setNewButtonLabel] = useState<string>('Primary');
  const [newButtonVariant, setNewButtonVariant] = useState<DialogueButtonVariant>('outline');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copiedParams, setCopiedParams] = useState<boolean>(false);

  const handleIconVariantChange = (nextVariant: DialogueIconVariant) => {
    setIconVariant(nextVariant);
    if (nextVariant === 'plain' && iconSize === 22) {
      setIconSize(36);
    } else if (nextVariant === 'container' && iconSize === 36) {
      setIconSize(22);
    }
  };

  const handleAddButton = () => {
    const trimmed = newButtonLabel.trim();
    if (!trimmed) return;
    const newBtn: DialogueButtonConfig = {
      key: `btn-${Date.now()}`,
      label: trimmed,
      variant: newButtonVariant,
    };
    setButtons((prev) => [...prev, newBtn]);
    setNewButtonLabel('Primary');
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

  // Structured export object containing active slots
  const currentParamsObject = {
    title,
    icon: iconName,
    iconVariant,
    iconSize,
    content,
    tone,
    buttons: buttons.map((b) => ({ label: b.label, variant: b.variant ?? 'outline' })),
  };

  const handleCopyParams = () => {
    navigator.clipboard.writeText(JSON.stringify(currentParamsObject, null, 2));
    setCopiedParams(true);
    setTimeout(() => setCopiedParams(false), 2200);
  };

  // Generated Recipe
  const generatedCode = `import { Dialogue, DialogueModal } from '@/components/primitives';

<Dialogue
  title="${title}"
  icon="${iconName}"
  iconVariant="${iconVariant}"
  iconSize={${iconSize}}
  content="${content.replace(/\n/g, '\\n')}"
  tone="${tone}"
  buttons={[
${buttons.map((b) => `    { label: '${b.label}', variant: '${b.variant ?? 'outline'}' }`).join(',\n')}
  ]}
  isLight={${isLight}}
/>`;

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
                SF Mono · Regular 400 · Solidified
              </Badge>
            </div>
            <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              标题与正文色调已同调固化（32px 字号、10px 字间距、Regular 400 字重）。支持图标名称直接传递、带框/无框双变体与尺寸自由微调。
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5">
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
              icon={<ExternalLink className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Trigger Modal (无叉号 · 强制三选一)
            </Button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Slot Control Panel */}
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
            <span className="font-bold text-sm tracking-tight">Dialogue Slots 控制面板</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm" isLight={isLight}>
              Slots Only · Fixed 400 Weight
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Title, Content & Color Level */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Type className="h-3.5 w-3.5" />
              <span>Title, Tone & Content</span>
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

            {/* Color Level (Tone) */}
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

          {/* Column 2: Icon Variation & Sizing */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Icon Variations & Sizing</span>
            </div>

            {/* Icon Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Lucide Icon Name (图标名称)</span>
                <span className="text-[10px] font-mono text-neutral-400">{iconName}</span>
              </label>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="alert-circle"
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

            {/* Icon Variation Toggle: Container vs Plain */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Icon Variation (图标外框变体)</label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleIconVariantChange('container')}
                  className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    iconVariant === 'container'
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="font-semibold">Container</span>
                  <span className="text-[10px] opacity-75">带背景框容器</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleIconVariantChange('plain')}
                  className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    iconVariant === 'plain'
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="font-semibold">Plain</span>
                  <span className="text-[10px] opacity-75">纯图标无外框</span>
                </button>
              </div>
            </div>

            {/* Icon Size Slider */}
            <div className="flex flex-col gap-2 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <SliderControl
                label={`Icon Size (${iconVariant === 'plain' ? '纯图标放大评估' : '容器内图标大小'})`}
                value={iconSize}
                min={16}
                max={64}
                step={2}
                unit="px"
                isLight={isLight}
                onChange={setIconSize}
              />
            </div>

            {/* Solidified Metrics Notice */}
            <div
              className={`p-3 rounded-xl border text-[11px] font-mono flex flex-col gap-1 ${
                isLight ? 'bg-white border-neutral-200 text-neutral-600' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Solidified Metrics (已固化规范)</span>
              </div>
              <div className="text-[10px] leading-relaxed opacity-80">
                Title 32px / Spacing 10px / Weight 400 / TitleMargin 0×10px / ContentMargin 20px / Padding 10×16×32px / Dual Elevation 36+20px
              </div>
            </div>
          </div>

          {/* Column 3: Button Manager (Primary, Outline, Danger) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Box className="h-3.5 w-3.5" />
              <span>Button Manager (Primary / Outline / Danger)</span>
            </div>

            {/* Active Buttons List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Active Buttons (等长紧凑对齐)</span>
                <span className="text-[10px] font-mono text-neutral-400">{buttons.length} items</span>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
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
                      className={`px-2 py-1 rounded-lg border text-[11px] font-mono outline-none cursor-pointer shrink-0 ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-800'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                      }`}
                    >
                      <option value="primary">primary</option>
                      <option value="outline">outline</option>
                      <option value="danger">danger</option>
                    </select>

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
                  className={`flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                    isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                  }`}
                />

                <select
                  value={newButtonVariant}
                  onChange={(e) => setNewButtonVariant(e.target.value as DialogueButtonVariant)}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono outline-none cursor-pointer shrink-0 ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-800'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <option value="primary">primary</option>
                  <option value="outline">outline</option>
                  <option value="danger">danger</option>
                </select>

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
            Variation: {iconVariant} · Size: {iconSize}px · Weight: 400
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
                iconVariant={iconVariant}
                iconSize={iconSize}
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
                iconVariant={iconVariant}
                iconSize={iconSize}
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
            Exported Parameters JSON (调整后可一键复制并粘贴回对话固化)
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
          title="Dialogue / DialogueModal Recipe"
          code={generatedCode}
        />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Centered Modal Overlay (无右上角叉号，强制三选一) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DialogueModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        content={content}
        icon={iconName}
        iconVariant={iconVariant}
        iconSize={iconSize}
        tone={tone}
        isLight={isLight}
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
