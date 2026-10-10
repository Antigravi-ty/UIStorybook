import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Info,
  Flame,
  Check,
  Copy,
  Layers,
  Sliders,
  Type,
  Box,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import {
  Dialogue,
  DialogueModal,
  type DialogueTone,
  type DialogueButtonConfig,
  type DialogueButtonVariant,
} from '../../primitives/Dialogue';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { CodeBlock } from '../CodeBlock';

type IconKey = 'auto' | 'info' | 'alert-triangle' | 'flame' | 'alert-circle';

export const DialoguePage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // ──────────────────────────────────────────────────────────────────────────
  // Solidified Baseline Parameters (固化参数)
  // ──────────────────────────────────────────────────────────────────────────
  const titleFontSize = 32;
  const titleLetterSpacing = 10;
  const paddingY = 16;
  const paddingX = 32;
  const innerGlowBlur = 36;
  const outerShadowBlur = 20;
  const minHeight = 165;
  const maxWidth = 560;

  // ──────────────────────────────────────────────────────────────────────────
  // Active Configurable State
  // ──────────────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState<string>('ALERT');
  // Weight options: 400 (细 · 当前默认), 600 (默认中), 800 (粗)
  const [titleFontWeight, setTitleFontWeight] = useState<number>(400);
  const [titleColorMode, setTitleColorMode] = useState<'muted' | 'content' | 'primary' | 'tone'>('content');

  // Spacing parameters brought back for fine tuning
  const [titleMarginTop, setTitleMarginTop] = useState<number>(0);
  const [titleMarginBottom, setTitleMarginBottom] = useState<number>(2);
  const [contentMarginBottom, setContentMarginBottom] = useState<number>(16);

  const [content, setContent] = useState<string>(
    'Failed to establish signaling server through WebSocket.'
  );

  const [tone, setTone] = useState<DialogueTone>('error');
  const [iconKey, setIconKey] = useState<IconKey>('auto');

  // Dynamic Buttons
  const [buttons, setButtons] = useState<DialogueButtonConfig[]>([
    { key: 'btn-1', label: 'Primary', variant: 'primary' },
    { key: 'btn-2', label: 'Outline', variant: 'outline' },
    { key: 'btn-3', label: 'Danger', variant: 'danger' },
  ]);

  const [newButtonLabel, setNewButtonLabel] = useState<string>('Primary');
  const [newButtonVariant, setNewButtonVariant] = useState<DialogueButtonVariant>('outline');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copiedParams, setCopiedParams] = useState<boolean>(false);

  const renderSelectedIcon = () => {
    switch (iconKey) {
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5" />;
      case 'flame':
        return <Flame className="h-5 w-5" />;
      case 'alert-circle':
        return <AlertCircle className="h-5 w-5" />;
      case 'auto':
      default:
        return undefined;
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

  // Presets
  const applyPreset = (preset: 'info' | 'warning' | 'orange' | 'error') => {
    switch (preset) {
      case 'error':
        setTitle('ALERT');
        setContent('Failed to establish signaling server through WebSocket.');
        setTone('error');
        setIconKey('auto');
        setButtons([
          { key: 'err-1', label: 'Primary', variant: 'primary' },
          { key: 'err-2', label: 'Outline', variant: 'outline' },
          { key: 'err-3', label: 'Danger', variant: 'danger' },
        ]);
        break;
      case 'warning':
        setTitle('WARNING');
        setContent('This action will reset all vehicle dynamics and recalibrate physical sub-ticks to 120Hz.\nAll uncommitted telemetry changes will be permanently discarded.');
        setTone('warning');
        setIconKey('auto');
        setButtons([
          { key: 'warn-1', label: 'Primary', variant: 'primary' },
          { key: 'warn-2', label: 'Outline', variant: 'outline' },
          { key: 'warn-3', label: 'Danger', variant: 'danger' },
        ]);
        break;
      case 'orange':
        setTitle('CAUTION');
        setContent('An existing custom livery preset already exists in slot #04.\nContinuing will overwrite your aero balance and friction curve parameters.');
        setTone('orange');
        setIconKey('auto');
        setButtons([
          { key: 'ora-1', label: 'Primary', variant: 'primary' },
          { key: 'ora-2', label: 'Outline', variant: 'outline' },
        ]);
        break;
      case 'info':
        setTitle('INFORMATION');
        setContent('WebGPU pipeline cache warming complete (64/64 variants compiled).\nPhysics sub-tick dispatch latency stable at sub-5ms.');
        setTone('info');
        setIconKey('auto');
        setButtons([
          { key: 'info-1', label: 'Primary', variant: 'primary' },
        ]);
        break;
    }
  };

  // Structured export object
  const currentParamsObject = {
    title,
    titleFontSize,
    titleLetterSpacing,
    titleFontWeight,
    titleMarginTop,
    titleMarginBottom,
    titleColorMode,
    content,
    contentMarginBottom,
    tone,
    paddingY,
    paddingX,
    innerGlowBlur,
    outerShadowBlur,
    minHeight,
    maxWidth,
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
  titleFontWeight={${titleFontWeight}}
  titleMarginTop={${titleMarginTop}}
  titleMarginBottom={${titleMarginBottom}}
  titleColorMode="${titleColorMode}"
  content="${content.replace(/\n/g, '\\n')}"
  contentMarginBottom={${contentMarginBottom}}
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
                Solidified Layout · SF Mono
              </Badge>
            </div>
            <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              已完成核心布局固化（32px 字号、10px 字间距、16×32px 内衬与双重阴影浮雕质感）。支持在细字重 (400)、标准中字重 (600) 与极粗字重 (800) 间即时对比大字号字重美感。
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              isLight={isLight}
              icon={copiedParams ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              onClick={handleCopyParams}
              className="font-mono text-xs cursor-pointer"
            >
              {copiedParams ? 'Parameters Copied!' : 'Copy Parameters (复制参数)'}
            </Button>

            <Button
              variant="primary"
              size="md"
              isLight={isLight}
              icon={<ExternalLink className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
              className="shadow-md cursor-pointer"
            >
              Launch Modal (居中模态)
            </Button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 font-mono text-xs">
          <span className={`shrink-0 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('error')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              tone === 'error'
                ? 'bg-red-500/15 border-red-500 text-red-600 dark:text-red-400 font-bold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Error (红 · 当前ALERT固化)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('warning')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              tone === 'warning'
                ? 'bg-yellow-500/15 border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span>Warning (黄)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('orange')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              tone === 'orange'
                ? 'bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span>Orange (橙)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('info')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              tone === 'info'
                ? 'bg-neutral-500/15 border-neutral-400 text-neutral-800 dark:text-neutral-200 font-bold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-neutral-400" />
            <span>Info (灰)</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Control Panel (精简收敛版) */}
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
            <span className="font-bold text-sm tracking-tight">Dialogue 控制面板 (精简收敛)</span>
          </div>
          <button
            type="button"
            onClick={handleCopyParams}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
              copiedParams
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                : isLight
                ? 'bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            {copiedParams ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copiedParams ? 'Copied' : 'Copy All Params'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Title Typography & Font Weight Options (400, 600, 800) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Type className="h-3.5 w-3.5" />
              <span>Title & Content Typography</span>
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

            {/* Title Font Weight: 400 (细), 600 (默认标准中), 800 (粗 · 当前默认) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Title Font Weight (粗细对比)</span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {titleFontWeight === 400 ? '400 (细 · 当前默认)' : titleFontWeight === 600 ? '600 (中)' : '800 (粗)'}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setTitleFontWeight(400)}
                  className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                    titleFontWeight === 400
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="font-normal block">400</span>
                  <span className="text-[10px] opacity-75">细 Regular</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTitleFontWeight(600)}
                  className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                    titleFontWeight === 600
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="font-semibold block">600</span>
                  <span className="text-[10px] opacity-75">中 Semibold</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTitleFontWeight(800)}
                  className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                    titleFontWeight === 800
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="font-extrabold block">800</span>
                  <span className="text-[10px] opacity-75">粗 ExtraBold</span>
                </button>
              </div>
            </div>

            {/* Title Color Mode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Title Color (标题色调抽取)</span>
                <span className={`text-[10px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {titleColorMode === 'content' ? 'Content (正文色)' : titleColorMode}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setTitleColorMode('muted')}
                  className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    titleColorMode === 'muted'
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-neutral-400 shrink-0" />
                  <span className="truncate">Muted (暗灰)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTitleColorMode('content')}
                  className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    titleColorMode === 'content'
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-neutral-500 shrink-0" />
                  <span className="truncate">Content (同正文色)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTitleColorMode('primary')}
                  className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    titleColorMode === 'primary'
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100 shrink-0" />
                  <span className="truncate">Contrast (纯黑白)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTitleColorMode('tone')}
                  className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    titleColorMode === 'tone'
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-600'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <span className="truncate">Tone (跟随调性)</span>
                </button>
              </div>
            </div>

            {/* Title Margins (标题上下两端间距调节) */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <SliderControl
                label="Title Margin Top (标题上间距 / 顶边距)"
                value={titleMarginTop}
                min={0}
                max={40}
                step={1}
                unit="px"
                isLight={isLight}
                onChange={setTitleMarginTop}
              />

              <SliderControl
                label="Title Margin Bottom (标题下间距 / 与内容间距)"
                value={titleMarginBottom}
                min={0}
                max={40}
                step={1}
                unit="px"
                isLight={isLight}
                onChange={setTitleMarginBottom}
              />

              <SliderControl
                label="Content Margin Bottom (内容下间距 / 与按钮间距)"
                value={contentMarginBottom}
                min={0}
                max={40}
                step={1}
                unit="px"
                isLight={isLight}
                onChange={setContentMarginBottom}
              />
            </div>

            {/* Content Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Content (英文信息正文)</label>
              <textarea
                rows={3}
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

          {/* Column 2: Tone & Solidified Metrics */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Palette className="h-3.5 w-3.5" />
              <span>Color Level & Solidified Layout</span>
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

            {/* Left Icon Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Left Icon (左侧垂直居中图标)</label>
              <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
                {(
                  [
                    { key: 'auto', label: 'Auto' },
                    { key: 'alert-circle', label: 'Error' },
                    { key: 'alert-triangle', label: 'Warn' },
                    { key: 'flame', label: 'Flame' },
                    { key: 'info', label: 'Info' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIconKey(item.key)}
                    className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      iconKey === item.key
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-900 border-white font-bold'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Solidified Metrics Card */}
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex flex-col gap-2 ${
                isLight ? 'bg-white border-neutral-200 text-neutral-700' : 'bg-neutral-950 border-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-neutral-200 dark:border-neutral-800">
                <span className="font-bold flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Solidified Metrics (已固化参数)</span>
                </span>
                <span className="text-[10px] text-neutral-400">Locked</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                <div>• Font Size: <span className="font-bold">32px</span></div>
                <div>• Letter Spacing: <span className="font-bold">10px</span></div>
                <div>• Padding: <span className="font-bold">16px × 32px</span></div>
                <div>• Title Margin: <span className="font-bold">2px</span></div>
                <div>• Content Margin: <span className="font-bold">16px</span></div>
                <div>• Inner Glow: <span className="font-bold">36px</span></div>
                <div>• Outer 360°: <span className="font-bold">20px</span></div>
                <div>• Min Height: <span className="font-bold">165px</span></div>
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
            32px Font · 10px Spacing · Muted Title · 36/20px Dual Elevation
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
                titleFontSize={titleFontSize}
                titleLetterSpacing={titleLetterSpacing}
                titleFontWeight={titleFontWeight}
                titleMarginTop={titleMarginTop}
                titleMarginBottom={titleMarginBottom}
                titleColorMode={titleColorMode}
                content={content}
                contentMarginBottom={contentMarginBottom}
                icon={renderSelectedIcon()}
                tone={tone}
                buttons={buttons}
                isLight={true}
                paddingY={paddingY}
                paddingX={paddingX}
                innerGlowBlur={innerGlowBlur}
                outerShadowBlur={outerShadowBlur}
                minHeight={minHeight}
                maxWidth={maxWidth}
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
                titleFontSize={titleFontSize}
                titleLetterSpacing={titleLetterSpacing}
                titleFontWeight={titleFontWeight}
                titleMarginTop={titleMarginTop}
                titleMarginBottom={titleMarginBottom}
                titleColorMode={titleColorMode}
                content={content}
                contentMarginBottom={contentMarginBottom}
                icon={renderSelectedIcon()}
                tone={tone}
                buttons={buttons}
                isLight={false}
                paddingY={paddingY}
                paddingX={paddingX}
                innerGlowBlur={innerGlowBlur}
                outerShadowBlur={outerShadowBlur}
                minHeight={minHeight}
                maxWidth={maxWidth}
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
      {/* Centered Modal Overlay */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DialogueModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        titleFontSize={titleFontSize}
        titleLetterSpacing={titleLetterSpacing}
        titleFontWeight={titleFontWeight}
        titleMarginTop={titleMarginTop}
        titleMarginBottom={titleMarginBottom}
        titleColorMode={titleColorMode}
        content={content}
        contentMarginBottom={contentMarginBottom}
        icon={renderSelectedIcon()}
        tone={tone}
        isLight={isLight}
        paddingY={paddingY}
        paddingX={paddingX}
        innerGlowBlur={innerGlowBlur}
        outerShadowBlur={outerShadowBlur}
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
