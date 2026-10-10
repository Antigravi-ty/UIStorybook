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
  Maximize2,
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
  // Default Parameters (Solidified to user's specified configuration)
  // ──────────────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState<string>('ALERT');
  const [titleFontSize, setTitleFontSize] = useState<number>(32);
  const [titleLetterSpacing, setTitleLetterSpacing] = useState<number>(10);
  const [titleFontWeight, setTitleFontWeight] = useState<number>(800);
  const [titleMarginBottom, setTitleMarginBottom] = useState<number>(2);
  const [titleColorMode, setTitleColorMode] = useState<'content' | 'muted' | 'primary' | 'tone'>('content');
  const [titleColor, setTitleColor] = useState<string>('');

  const [content, setContent] = useState<string>(
    'Failed to establish signaling server through WebSocket.'
  );
  const [contentMarginBottom, setContentMarginBottom] = useState<number>(16);

  const [tone, setTone] = useState<DialogueTone>('error');
  const [iconKey, setIconKey] = useState<IconKey>('auto');

  // Separated Paddings & Shadows
  const [paddingY, setPaddingY] = useState<number>(16);
  const [paddingX, setPaddingX] = useState<number>(32);
  const [innerGlowBlur, setInnerGlowBlur] = useState<number>(36);
  const [outerShadowBlur, setOuterShadowBlur] = useState<number>(20);
  const [minHeight, setMinHeight] = useState<number>(165);
  const [maxWidth, setMaxWidth] = useState<number>(560);

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
      case 'info':
        setTitle('INFORMATION');
        setTitleFontSize(28);
        setTitleLetterSpacing(4);
        setTitleFontWeight(800);
        setTitleMarginBottom(10);
        setContent('WebGPU pipeline cache warming complete (64/64 variants compiled).\nPhysics sub-tick dispatch latency stable at sub-5ms.');
        setContentMarginBottom(10);
        setTone('info');
        setIconKey('auto');
        setButtons([
          { key: 'info-1', label: 'Primary', variant: 'primary' },
        ]);
        break;
      case 'warning':
        setTitle('WARNING');
        setTitleFontSize(28);
        setTitleLetterSpacing(4);
        setTitleFontWeight(800);
        setTitleMarginBottom(10);
        setContent('This action will reset all vehicle dynamics and recalibrate physical sub-ticks to 120Hz.\nAll uncommitted telemetry changes will be permanently discarded.');
        setContentMarginBottom(10);
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
        setTitleFontSize(28);
        setTitleLetterSpacing(4);
        setTitleFontWeight(800);
        setTitleMarginBottom(10);
        setContent('An existing custom livery preset already exists in slot #04.\nContinuing will overwrite your aero balance and friction curve parameters.');
        setContentMarginBottom(10);
        setTone('orange');
        setIconKey('auto');
        setButtons([
          { key: 'ora-1', label: 'Primary', variant: 'primary' },
          { key: 'ora-2', label: 'Outline', variant: 'outline' },
        ]);
        break;
      case 'error':
        setTitle('CRITICAL ERROR');
        setTitleFontSize(28);
        setTitleLetterSpacing(4);
        setTitleFontWeight(800);
        setTitleMarginBottom(10);
        setContent('Fatal packet drop detected during physical state synchronization.\nCompetitive matchmaking session terminated to prevent desync penalty.');
        setContentMarginBottom(10);
        setTone('error');
        setIconKey('auto');
        setButtons([
          { key: 'err-1', label: 'Danger', variant: 'danger' },
          { key: 'err-2', label: 'Outline', variant: 'outline' },
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
  titleFontSize={${titleFontSize}}
  titleLetterSpacing={${titleLetterSpacing}}
  titleFontWeight={${titleFontWeight}}
  titleMarginBottom={${titleMarginBottom}}
  titleColorMode="${titleColorMode}"
  content="${content.replace(/\n/g, '\\n')}"
  contentMarginBottom={${contentMarginBottom}}
  tone="${tone}"
  paddingY={${paddingY}}
  paddingX={${paddingX}}
  innerGlowBlur={${innerGlowBlur}}
  outerShadowBlur={${outerShadowBlur}}
  minHeight={${minHeight}}
  maxWidth={${maxWidth}}
  isLight={${isLight}}
  buttons={[
${buttons.map((b) => `    { label: '${b.label}', variant: '${b.variant ?? 'outline'}' }`).join(',\n')}
  ]}
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
                Elevated 3D Pop · SF Mono
              </Badge>
            </div>
            <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              全英文排版与 SF Mono 字体规范。支持内外双阴影叠加（内发光 + 360° 全方向外凸起阴影），分离上下/左右 Padding 与 Title/Content 间距调节，粗体权重 800+，提供 Primary / Outline / Danger 等长按键组。
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
            <span>Warning (黄 · 当前固化)</span>
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
            <span>Error (红)</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Control Panel */}
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
            <span className="font-bold text-sm tracking-tight">Dialogue 细节调节控制台 (Fine-grained Controller)</span>
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
          {/* Column 1: Title Typography & Weight (800+) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Type className="h-3.5 w-3.5" />
              <span>Title Typography (800+ Weight & Spacing)</span>
            </div>

            {/* Title Text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Title (大标题文案)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="WARNING"
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />
            </div>

            {/* Title Font Size (20px - 56px) */}
            <SliderControl
              label="Title Font Size (字号)"
              value={titleFontSize}
              min={20}
              max={56}
              step={1}
              unit="px"
              isLight={isLight}
              onChange={setTitleFontSize}
            />

            {/* Title Letter Spacing (0px - 16px) */}
            <SliderControl
              label="Title Letter Spacing (字间距)"
              value={titleLetterSpacing}
              min={0}
              max={16}
              step={0.5}
              unit="px"
              isLight={isLight}
              onChange={setTitleLetterSpacing}
            />

            {/* Title Font Weight: 800+ Options */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Title Font Weight (粗细 · 800+)</span>
                <span className="text-[10px] font-mono text-neutral-400">{titleFontWeight}</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                {[800, 850, 900, 950].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTitleFontWeight(w)}
                    className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                      titleFontWeight === w
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                          : 'bg-white text-neutral-900 border-white font-bold shadow-xs'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-600'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Color Mode (标题颜色与正文同色抽色) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Title Color (标题色调 · 和正文抽色)</span>
                <span className={`text-[10px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {titleColorMode === 'content' ? '和正文同色' : titleColorMode}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => { setTitleColorMode('content'); setTitleColor(''); }}
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
                  onClick={() => { setTitleColorMode('muted'); setTitleColor(''); }}
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
                  <span className="truncate">Muted (次级暗灰)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setTitleColorMode('primary'); setTitleColor(''); }}
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
                  onClick={() => { setTitleColorMode('tone'); setTitleColor(''); }}
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

            {/* Title Bottom Margin */}
            <SliderControl
              label="Title Margin Bottom (标题下外边距)"
              value={titleMarginBottom}
              min={0}
              max={40}
              step={2}
              unit="px"
              isLight={isLight}
              onChange={setTitleMarginBottom}
            />

            {/* Content Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Content (英文多行正文)</label>
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

            {/* Content Bottom Margin */}
            <SliderControl
              label="Content Margin Bottom (内容下外边距 / 按钮上间距)"
              value={contentMarginBottom}
              min={0}
              max={40}
              step={2}
              unit="px"
              isLight={isLight}
              onChange={setContentMarginBottom}
            />
          </div>

          {/* Column 2: Separated Paddings, Dual Shadows & Tone */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Separated Paddings & Dual Elevation</span>
            </div>

            {/* Separated Paddings: Y and X */}
            <div className="grid grid-cols-2 gap-3">
              <SliderControl
                label="上下 Padding (Y)"
                value={paddingY}
                min={4}
                max={48}
                step={2}
                unit="px"
                isLight={isLight}
                onChange={setPaddingY}
              />
              <SliderControl
                label="左右 Padding (X)"
                value={paddingX}
                min={8}
                max={60}
                step={2}
                unit="px"
                isLight={isLight}
                onChange={setPaddingX}
              />
            </div>

            {/* Dual Shadows: Inner Glow Blur & Outer Omnidirectional Shadow Blur */}
            <SliderControl
              label="Inner Glow Blur (内发光强度)"
              value={innerGlowBlur}
              min={0}
              max={60}
              step={2}
              unit="px"
              isLight={isLight}
              onChange={setInnerGlowBlur}
            />

            <SliderControl
              label="Outer 360° Shadow Blur (全方向外凸阴影)"
              value={outerShadowBlur}
              min={0}
              max={80}
              step={5}
              unit="px"
              isLight={isLight}
              onChange={setOuterShadowBlur}
            />

            {/* Tone Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Color Level (4级调性: 灰黄橙红)</label>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                {(
                  [
                    { key: 'info', label: 'Info (灰)', dot: 'bg-neutral-400' },
                    { key: 'warning', label: 'Warn (黄)', dot: 'bg-yellow-400' },
                    { key: 'orange', label: 'Alert (橙)', dot: 'bg-orange-500' },
                    { key: 'error', label: 'Error (红)', dot: 'bg-red-500' },
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

            {/* Container Geometry */}
            <div className="grid grid-cols-2 gap-3">
              <SliderControl
                label="Min Height"
                value={typeof minHeight === 'number' ? minHeight : 160}
                min={120}
                max={320}
                step={5}
                unit="px"
                isLight={isLight}
                onChange={setMinHeight}
              />
              <SliderControl
                label="Max Width"
                value={typeof maxWidth === 'number' ? maxWidth : 560}
                min={360}
                max={720}
                step={10}
                unit="px"
                isLight={isLight}
                onChange={setMaxWidth}
              />
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
            Inner Glow + 360° Omnidirectional Elevation
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
                titleMarginBottom={titleMarginBottom}
                titleColorMode={titleColorMode}
                titleColor={titleColor}
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
                titleMarginBottom={titleMarginBottom}
                titleColorMode={titleColorMode}
                titleColor={titleColor}
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
        titleMarginBottom={titleMarginBottom}
        titleColorMode={titleColorMode}
        titleColor={titleColor}
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
