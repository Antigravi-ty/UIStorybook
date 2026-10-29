import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Type,
  Box,
  Palette,
  Layers,
  LayoutTemplate,
  Sparkles,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { Badge } from '../../../primitives/Badge';
import { Button } from '../../../primitives/Button';
import { CodeBlock } from '../../CodeBlock';
import {
  Layer1MainMenuRecipe,
  Layer1ContextGroupedSelector,
  resolveLayer1ContextSpec,
  type Layer1ContextVariation,
} from '../../../recipes/Layer1MainMenuRecipe';
import {
  useMainMenuStyleStore,
  MAIN_MENU_STYLE_PRESETS,
  MAIN_MENU_ITEM_SLOTS,
  MAIN_MENU_ICON_COLOR_OPTIONS,
  JETBRAINS_MONO_WEIGHT_OPTIONS,
  isCustomMainMenuColor,
  resolveMainMenuIconHex,
  resolveMainMenuTitleTypography,
  detectIsAppleDevice,
  hexToRgbTuple,
  rgbTupleToHex,
  type MainMenuStyleVariant,
  type MainMenuFontFamilyMode,
  type MainMenuRowAlignMode,
  type MainMenuResumeHighlightStyle,
  type MainMenuItemSlotId,
  type MainMenuPlatformPreviewMode,
} from '../../../tokens/mainMenuStyleStore';

export interface MainMenuStyleTunerProps {
  isLight?: boolean;
  codeBadge?: string;
  title?: string;
  /** Compact mode when embedded inside 7A inline tuner drawer */
  compact?: boolean;
  /** Whether to render the dedicated 1:1 full-scale active preview inside the tuner (default: !compact) */
  showLivePreview?: boolean;
  /** Active Layer 1 context mode for preview (defaults to synced store.previewContextMode) */
  contextMode?: Layer1ContextVariation;
  onChangeContextMode?: (ctx: Layer1ContextVariation) => void;
}

export const MainMenuStyleTuner: React.FC<MainMenuStyleTunerProps> = React.memo(({
  isLight = false,
  codeBadge = '6A.1M',
  title = 'Layer 1 MENU 极简大字选单全参数调优工作台 (行外框 · 图标 · 字体字号 · 8 级字重 · Header/Content/Footer 内衬)',
  compact = false,
  showLivePreview: propShowLivePreview,
  contextMode: propContextMode,
  onChangeContextMode,
}) => {
  const store = useMainMenuStyleStore();
  const {
    variant,
    previewContextMode,
    setPreviewContextMode,
    setVariant,
    setParam,
    setItemIconColor,
    applyPreset,
    resetParams,
    exportConfigCode,
  } = store;

  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showLivePanel, setShowLivePanel] = useState(propShowLivePreview ?? !compact);
  const [showShootout, setShowShootout] = useState(!compact);

  const activeCtxMeta = resolveLayer1ContextSpec(
    propContextMode ?? (previewContextMode as Layer1ContextVariation) ?? 'freeplay'
  );
  const activeCtx = activeCtxMeta.id;

  const handleSelectCtx = (ctx: Layer1ContextVariation) => {
    setPreviewContextMode(ctx);
    onChangeContextMode?.(ctx);
  };

  const handleCopy = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="main-menu-style-tuner"
      className={`scroll-mt-6 p-5 rounded-2xl border flex flex-col gap-5 transition-colors ${
        isLight
          ? 'bg-white border-neutral-200/90 shadow-2xs'
          : 'bg-neutral-900/60 border-neutral-800'
      }`}
    >
      {/* Top Header & Copy / Export / Reset Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            {codeBadge}
          </span>
          <Sliders className="h-4 w-4 text-amber-500 shrink-0" />
          <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          <Badge variant="primary" size="sm" isLight={isLight}>
            6A.1 ⇄ 6A.1M ⇄ 7A 多屏实时同步
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {!compact && (
            <>
              <Button
                size="sm"
                variant={showLivePanel ? 'primary' : 'secondary'}
                isLight={isLight}
                icon={<Eye className="h-3.5 w-3.5" />}
                onClick={() => setShowLivePanel((prev) => !prev)}
              >
                {showLivePanel ? '收起 1:1 完整菜单预览' : '展开 1:1 完整菜单预览'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                isLight={isLight}
                icon={<Layers className="h-3.5 w-3.5" />}
                onClick={() => setShowShootout((prev) => !prev)}
              >
                {showShootout ? '收起三方案同屏对比' : '展开三方案同屏对比'}
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            icon={<Code2 className="h-3.5 w-3.5" />}
            onClick={() => setShowCode((prev) => !prev)}
          >
            {showCode ? '隐藏配置代码' : '查看配置代码'}
          </Button>
          <Button
            size="sm"
            variant="primary"
            isLight={isLight}
            icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            onClick={handleCopy}
          >
            {copied ? '已复制参数!' : '复制参数配置'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isLight={isLight}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={resetParams}
          >
            重置默认
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeBlock
          isLight={isLight}
          title="当前 Layer 1 Main Menu 完整导出参数配置 (可直接复制或固化至 src/tokens/mainMenuStyleStore.ts)"
          code={exportConfigCode()}
        />
      )}

      {/* Quick Core Hypothesis Bar: Concise "Resume", No Description, Bare/Boxed Icon, Font Family */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
          isLight
            ? 'bg-amber-50/40 border-amber-200/80'
            : 'bg-amber-500/5 border-amber-500/30'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Sparkles className="h-4 w-4" />
            <span>核心极简视觉开关 (优先实验：仅保留 [外框 + 图标 + 大字标题]，去除下方 Description)</span>
          </div>

          {/* 3 Style Archetype Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'large-clean-row', label: '风格一 (默认): 极简大字单行' },
                { id: 'mono-watermark-row', label: '风格二: Mono 大字 + 背景水印 Icon' },
                { id: 'classic-descriptive-row', label: '风格三: 含下方 Description' },
              ] as { id: MainMenuStyleVariant; label: string }[]
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  variant === v.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-1">
          <ToggleSwitch
            checked={store.conciseResumeLabel}
            onCheckedChange={(v) => setParam('conciseResumeLabel', v)}
            label="极简 Resume 标题 (Resume 代替 Resume Match)"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={store.showDescription}
            onCheckedChange={(v) => setParam('showDescription', v)}
            label="显示下方 Description 副标题"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={store.showIconBox}
            onCheckedChange={(v) => setParam('showIconBox', v)}
            label="显示图标独立内框 (Icon Box)"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={store.showIcon}
            onCheckedChange={(v) => setParam('showIcon', v)}
            label="显示左侧图标 (Icon)"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={store.showShortcutBadge}
            onCheckedChange={(v) => setParam('showShortcutBadge', v)}
            label="显示 ESC 键帽"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={store.showRightArrow}
            onCheckedChange={(v) => setParam('showRightArrow', v)}
            label="显示右侧箭头 (>)"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={store.showDividers}
            onCheckedChange={(v) => setParam('showDividers', v)}
            label="显示分组分割线"
            isLight={isLight}
          />
        </div>
      </div>

      {/* 6 Curated Quick Presets Bar */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
          isLight
            ? 'bg-neutral-50/80 border-neutral-200/80'
            : 'bg-neutral-950/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-amber-500" />
            <span>6 组精选 MENU 视觉方案一键加载 (Curated Menu Style Presets)</span>
          </span>
          <span className="text-[11px] font-mono text-neutral-400">
            点击任意预设后可在下方 A–E 参数组继续自由微调并一键复制配置
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {MAIN_MENU_STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.params)}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-amber-50/50 border-neutral-200 hover:border-amber-400'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-amber-500/60'
              }`}
            >
              <span className="text-xs font-bold text-amber-500">{preset.label}</span>
              <span
                className={`text-[11px] leading-snug ${
                  isLight ? 'text-neutral-600' : 'text-neutral-400'
                }`}
              >
                {preset.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Group A: Row Outer Box & List Spacing Geometry */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-3.5 ${
          isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
          <Box className="h-4 w-4" />
          <span>A. 每一行外框几何、内衬与列表间距 (Row Outer Frame &amp; List Spacing)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SliderControl
            label="行左右内衬 (itemPadX)"
            value={store.itemPaddingXPx}
            min={6}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('itemPaddingXPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="行上下内衬 (itemPadY)"
            value={store.itemPaddingYPx}
            min={4}
            max={32}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('itemPaddingYPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="行最小高度 (itemMinH)"
            value={store.itemMinHeightPx}
            min={36}
            max={100}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('itemMinHeightPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="行外框圆角 (itemRadius)"
            value={store.itemRadiusPx}
            min={0}
            max={28}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('itemRadiusPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="行与行垂直间距 (itemGap)"
            value={store.itemGapPx}
            min={0}
            max={24}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('itemGapPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="分割线上下边距 (dividerMarginY)"
            value={store.dividerMarginYPx}
            min={-12}
            max={16}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('dividerMarginYPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="菜单外框缓冲内衬 (containerPad)"
            value={store.menuContainerPaddingPx}
            min={0}
            max={16}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('menuContainerPaddingPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="行外框线宽 (borderWidth)"
            value={store.itemBorderWidthPx}
            min={0}
            max={3}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('itemBorderWidthPx', v)}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Group B: Title Typography & 8 Official Font Weights */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Type className="h-4 w-4" />
            <span>B. 标题大字字体、字号、字距与官方 8 级字重 (Title Typography &amp; Font Weight)</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                标题字体 (Font Family):
              </span>
              {(
                [
                  { id: 'sans', label: 'Apple Sans (非 Apple 自动 Fallback 至 JetBrains Mono)' },
                  { id: 'mono', label: 'JetBrains Mono (全平台强制等宽)' },
                ] as { id: MainMenuFontFamilyMode; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setParam('titleFontFamily', f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    store.titleFontFamily === f.id
                      ? 'bg-amber-500 text-white border-amber-500 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-700'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ToggleSwitch
              checked={store.titleUppercase}
              onCheckedChange={(v) => setParam('titleUppercase', v)}
              label="标题全大写 (UPPERCASE)"
              isLight={isLight}
            />
          </div>
        </div>

        {/* Cross-Platform Font & Weight Fallback Bar (Apple Sans 800 -> Non-Apple JetBrains Mono Regular 400) */}
        {store.titleFontFamily === 'sans' && (
          <div
            className={`px-3 py-2 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
              isLight
                ? 'bg-amber-50/50 border-amber-200/80 text-neutral-700'
                : 'bg-amber-500/5 border-amber-500/25 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-500">跨平台字体与字重自动 Fallback 策略:</span>
              <span>
                Apple 设备使用 <strong className="text-amber-500">Apple Sans ({store.titleFontWeight})</strong>
                {' · '}非 Apple 设备自动 Fallback 至{' '}
                <strong className="text-emerald-500">JetBrains Mono Regular (400)</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">预览环境模拟:</span>
              {(
                [
                  {
                    id: 'auto',
                    label: `自动检测 (${detectIsAppleDevice() ? '当前 Apple' : '当前非 Apple'})`,
                  },
                  { id: 'apple', label: `Apple Sans (${store.titleFontWeight})` },
                  { id: 'non-apple-fallback', label: '非 Apple Fallback (Mono Regular 400)' },
                ] as { id: MainMenuPlatformPreviewMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => store.setPlatformPreviewMode(m.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-all ${
                    store.platformPreviewMode === m.id
                      ? 'bg-amber-500 text-white border-amber-500 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SliderControl
            label="标题大字字号 (titleFontSize)"
            value={store.titleFontSizePx}
            min={12}
            max={34}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('titleFontSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="标题字间距 (letterSpacing)"
            value={store.titleLetterSpacingEm}
            min={-0.08}
            max={0.18}
            step={0.01}
            unit="em"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('titleLetterSpacingEm', v)}
            isLight={isLight}
          />
          <SliderControl
            label="标题行高 (lineHeight · 下伸部不裁切)"
            value={store.titleLineHeight}
            min={0.95}
            max={1.6}
            step={0.05}
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('titleLineHeight', v)}
            isLight={isLight}
          />
          <SliderControl
            label="标题垂直视觉微调 (titleOffsetY)"
            value={store.titleOffsetYPx}
            min={-6}
            max={6}
            step={0.5}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => store.setTitleOffsetYPx(v)}
            isLight={isLight}
          />
        </div>

        {/* 8 Font Weights */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              标题字重选择 (100 Thin ~ 800 Extra Bold · 非 Apple 设备 Fallback 至 JetBrains Mono 时自动回退为 400 Regular):
            </span>
            {resolveMainMenuTitleTypography(
              store.titleFontFamily,
              store.titleFontWeight,
              store.platformPreviewMode
            ).isUsingMonoFallback && (
              <span className="text-[11px] font-mono text-emerald-500 font-bold">
                当前生效: JetBrains Mono Regular (400) Fallback
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {JETBRAINS_MONO_WEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.weight}
                type="button"
                onClick={() => setParam('titleFontWeight', opt.weight)}
                style={{
                  fontFamily:
                    store.titleFontFamily === 'mono'
                      ? 'var(--font-jetbrains)'
                      : 'var(--font-apple)',
                  fontWeight: opt.weight,
                }}
                className={`py-1.5 px-2 rounded-lg text-xs border cursor-pointer transition-all ${
                  store.titleFontWeight === opt.weight
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {opt.label} ({opt.weight})
              </button>
            ))}
          </div>
        </div>

        {/* Optional Description Sliders when showDescription is enabled */}
        {store.showDescription && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
            <SliderControl
              label="Description 字号 (descSize)"
              value={store.descFontSizePx}
              min={10}
              max={16}
              step={1}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="sky"
              onChange={(v) => setParam('descFontSizePx', v)}
              isLight={isLight}
            />
            <SliderControl
              label="Description 行高 (descLineHeight)"
              value={store.descLineHeight}
              min={1.0}
              max={1.8}
              step={0.05}
              editable
              allowOutOfBoundsInput
              colorScheme="sky"
              onChange={(v) => setParam('descLineHeight', v)}
              isLight={isLight}
            />
            <SliderControl
              label="Title 与 Description 间距"
              value={store.titleDescGapPx}
              min={0}
              max={12}
              step={1}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="sky"
              onChange={(v) => setParam('titleDescGapPx', v)}
              isLight={isLight}
            />
          </div>
        )}
      </div>

      {/* Group C: Icon, Icon Box, Alignment & Resume Highlight Mode */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
          <Sparkles className="h-4 w-4" />
          <span>C. 图标尺寸、图标内框、对齐方式与首行 Resume 视觉模式</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SliderControl
            label="左侧图标尺寸 (iconSize)"
            value={store.iconSizePx}
            min={12}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('iconSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标 SVG 线宽 (strokeWidth)"
            value={store.iconStrokeWidth}
            min={1.0}
            max={3.0}
            step={0.1}
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('iconStrokeWidth', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标与标题水平间距 (iconTitleGap)"
            value={store.iconTitleGapPx}
            min={4}
            max={28}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('iconTitleGapPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标内框方盒尺寸 (iconBoxSize)"
            value={store.iconBoxSizePx}
            min={24}
            max={56}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('iconBoxSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标内框圆角 (iconBoxRadius)"
            value={store.iconBoxRadiusPx}
            min={0}
            max={20}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('iconBoxRadiusPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="右侧导航箭头尺寸 (arrowSize)"
            value={store.rightArrowSizePx}
            min={12}
            max={24}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('rightArrowSizePx', v)}
            isLight={isLight}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              首行 Resume 视觉模式 (resumeHighlightStyle):
            </span>
            {(
              [
                { id: 'solid-primary', label: '反色实心主按钮 (Solid Primary)' },
                { id: 'surface-card', label: '同色系外框卡片 (Unified Surface)' },
                { id: 'amber-accent', label: '暖橙高亮外框 (Amber Accent)' },
              ] as { id: MainMenuResumeHighlightStyle; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParam('resumeHighlightStyle', opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.resumeHighlightStyle === opt.id
                    ? 'bg-amber-500 text-white border-amber-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              行内容对齐 (rowContentAlign):
            </span>
            {(
              [
                { id: 'left', label: '左对齐 (Left)' },
                { id: 'center', label: '居中 (Center)' },
                { id: 'space-between', label: '两端分布 (Space-Between)' },
              ] as { id: MainMenuRowAlignMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParam('rowContentAlign', opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.rowContentAlign === opt.id
                    ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Group D: 3-Stage Panel Shell (Header / Content / Footer) */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <LayoutTemplate className="h-4 w-4" />
            <span>D. MENU 三段式面板壳体参数 (Header 标题与内衬 · Content 内衬 · Footer 状态栏)</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                Header 字体:
              </span>
              {(
                [
                  { id: 'sans', label: 'Apple Sans' },
                  { id: 'mono', label: 'JetBrains Mono' },
                ] as { id: MainMenuFontFamilyMode; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setParam('headerFontFamily', f.id)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    store.headerFontFamily === f.id
                      ? 'bg-amber-500 text-white border-amber-500 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-700'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ToggleSwitch
              checked={store.showFooter}
              onCheckedChange={(v) => setParam('showFooter', v)}
              label="显示底部 Footer (Power Saving 状态栏)"
              isLight={isLight}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SliderControl
            label="Header 字号 (headerSize)"
            value={store.headerFontSizePx}
            min={13}
            max={32}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('headerFontSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Header 字间距 (letterSpacing)"
            value={store.headerLetterSpacingEm}
            min={-0.04}
            max={0.3}
            step={0.01}
            unit="em"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('headerLetterSpacingEm', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Header 左右内衬 (headerPadX)"
            value={store.headerPaddingXPx}
            min={8}
            max={40}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('headerPaddingXPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Header 顶部内衬 (headerPadTop)"
            value={store.headerPaddingTopPx}
            min={6}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('headerPaddingTopPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Header 底部内衬 (headerPadBottom)"
            value={store.headerPaddingBottomPx}
            min={6}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('headerPaddingBottomPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Content 左右内衬 (contentPadX)"
            value={store.contentPaddingXPx}
            min={8}
            max={40}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('contentPaddingXPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Content 上下内衬 (contentPadY)"
            value={store.contentPaddingYPx}
            min={4}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('contentPaddingYPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Footer 左右内衬 (footerPadX)"
            value={store.footerPaddingXPx}
            min={8}
            max={40}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('footerPaddingXPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Footer 上下内衬 (footerPadY)"
            value={store.footerPaddingYPx}
            min={4}
            max={28}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('footerPaddingYPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Footer 字号 (footerFontSize)"
            value={store.footerFontSizePx}
            min={9}
            max={15}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('footerFontSizePx', v)}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Group E: Per-Item Independent Icon Colors & Style 2 Watermark */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-3.5 ${
          isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Palette className="h-4 w-4" />
            <span>E. 各菜单项独立 Icon 配色与风格二水印参数 (Per-Item Icon Colors &amp; Watermark)</span>
          </div>

          <ToggleSwitch
            checked={store.usePerItemIconColors}
            onCheckedChange={(v) => setParam('usePerItemIconColors', v)}
            label="启用各菜单项独立彩色 Icon (关闭则保持默认单色图标)"
            isLight={isLight}
          />
        </div>

        {store.usePerItemIconColors && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAIN_MENU_ITEM_SLOTS.map((slot) => {
              const slotId = slot.id as MainMenuItemSlotId;
              const currentColor = store.itemIconColors?.[slotId] || 'neutral';
              const isCustom = isCustomMainMenuColor(currentColor);
              const resolvedHex = resolveMainMenuIconHex(currentColor, isLight);
              const rgb = hexToRgbTuple(resolvedHex);
              const presetLabel = MAIN_MENU_ICON_COLOR_OPTIONS.find(
                (c) => c.id === currentColor
              )?.label;

              return (
                <div
                  key={slot.id}
                  className={`p-3 rounded-xl border flex flex-col gap-2 ${
                    isLight
                      ? 'bg-white border-neutral-200/90'
                      : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono">{slot.label}</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {presetLabel || `RGB(${rgb.r},${rgb.g},${rgb.b})`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {MAIN_MENU_ICON_COLOR_OPTIONS.map((opt) => {
                      const isSelected = currentColor === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setItemIconColor(slotId, opt.id)}
                          title={opt.label}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                                : 'bg-white text-neutral-950 border-white font-bold'
                              : isLight
                              ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                              : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/80 text-neutral-300'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dotClass}`} />
                          <span>{opt.shortLabel}</span>
                        </button>
                      );
                    })}

                    <label
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border cursor-pointer text-[10px] font-mono ${
                        isCustom
                          ? 'border-amber-500 text-amber-500 font-bold'
                          : isLight
                          ? 'bg-neutral-50 border-neutral-200 text-neutral-600'
                          : 'bg-neutral-850 border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <input
                        type="color"
                        value={resolvedHex}
                        onChange={(e) => setItemIconColor(slotId, e.target.value)}
                        className="h-3 w-3 rounded border-0 p-0 bg-transparent cursor-pointer"
                      />
                      <span>自选色</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Style 2 Watermark Sliders */}
        {variant === 'mono-watermark-row' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/70">
            <SliderControl
              label="水印 Icon 尺寸 (watermarkSize)"
              value={store.watermarkSizePx}
              min={32}
              max={120}
              step={2}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) => setParam('watermarkSizePx', v)}
              isLight={isLight}
            />
            <SliderControl
              label="水印默认透明度 (opacity)"
              value={store.watermarkOpacityPct}
              min={5}
              max={80}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              colorScheme="emerald"
              onChange={(v) => setParam('watermarkOpacityPct', v)}
              isLight={isLight}
            />
            <SliderControl
              label="水印 Hover 透明度"
              value={store.watermarkHoverOpacityPct}
              min={10}
              max={95}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              colorScheme="emerald"
              onChange={(v) => setParam('watermarkHoverOpacityPct', v)}
              isLight={isLight}
            />
            <SliderControl
              label="水印旋转角 (rotateDeg)"
              value={store.watermarkRotateDeg}
              min={-40}
              max={40}
              step={1}
              unit="°"
              editable
              allowOutOfBoundsInput
              colorScheme="sky"
              onChange={(v) => setParam('watermarkRotateDeg', v)}
              isLight={isLight}
            />
          </div>
        )}
      </div>

      {/* Synchronized Layer 1 Context Variation Bar (Synced across 6A.1, 6A.1M & 7A) */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
          isLight
            ? 'bg-amber-50/35 border-amber-200/80'
            : 'bg-amber-500/5 border-amber-500/25'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Eye className="h-4 w-4" />
            <span>
              预览对局模式实时联动 (Layer 1 Context Variations · 与 [6A.1] 完整菜单预览屏 100% 同步)
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            当前激活:{' '}
            <strong className="text-amber-500">
              {activeCtxMeta.label} [{activeCtxMeta.headerTitle}]
            </strong>
          </span>
        </div>

        <Layer1ContextGroupedSelector
          activeContext={activeCtx}
          onSelectContext={(ctx) => handleSelectCtx(ctx)}
          tierFilter="all"
          isLight={isLight}
        />
      </div>

      {/* Dedicated 1:1 Full-Scale Current Parameters Live Menu Preview (Exact Mirror of 6A.1) */}
      {showLivePanel && (
        <div
          id="main-menu-live-1to1-preview"
          className={`p-5 rounded-xl border flex flex-col gap-4 ${
            isLight
              ? 'bg-neutral-50/80 border-neutral-200/90 shadow-inner'
              : 'bg-neutral-950/70 border-neutral-800 shadow-inner'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                1:1 LIVE
              </span>
              <span className="text-xs font-bold">
                当前参数下的完整 MENU 1:1 实时预览 (420px 标准宽度 · 与另一屏幕 [6A.1] 画面 100% 一致)
              </span>
              <Badge variant="success" size="sm" isLight={isLight}>
                {activeCtxMeta.shortLabel} · {store.variant} · {store.titleFontSizePx}px
              </Badge>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              上方任意滑块、预设、字体或对局模式改动均在此处与 [6A.1] 同步呈现（不被三方案对比列宽压缩）
            </span>
          </div>

          <div
            onClickCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex justify-center py-2"
          >
            <Layer1MainMenuRecipe isLight={isLight} contextMode={activeCtx} />
          </div>
        </div>
      )}

      {/* 3-Way Side-by-Side Full Panel Comparison (Shootout Matrix) */}
      {showShootout && (
        <div
          className={`p-4 rounded-xl border flex flex-col gap-4 ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80'
              : 'bg-neutral-950/60 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <ImageIcon className="h-4 w-4" />
              <span>
                三方案同屏直观对比：极简大字无图标框 vs 极简大字带图标框 vs 旧版含 Description (用于直观对比本质结构差异)
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              注：三列同屏对比固定锁定各自的【图标框/副标题】结构特征；查看完整宽度与当前参数真实效果请看上方「1:1 LIVE」或 [6A.1]
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
            {/* Column 1: Clean Large Title + Bare Icon (No Description) */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                !store.showDescription && !store.showIconBox && variant === 'large-clean-row'
                  ? isLight
                    ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/25'
                  : isLight
                  ? 'bg-white border-neutral-200'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold block">
                    方案 A (当前主推) · 极简大字 + 纯净图标
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Resume 短标题 · 无 Description · 无图标内框
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={
                    !store.showDescription && !store.showIconBox && variant === 'large-clean-row'
                      ? 'primary'
                      : 'secondary'
                  }
                  isLight={isLight}
                  onClick={() =>
                    applyPreset({
                      variant: 'large-clean-row',
                      conciseResumeLabel: true,
                      showDescription: false,
                      showIconBox: false,
                    })
                  }
                >
                  应用方案 A
                </Button>
              </div>
              <div
                onClickCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex justify-center"
              >
                <Layer1MainMenuRecipe
                  isLight={isLight}
                  contextMode={activeCtx}
                  styleVariant="large-clean-row"
                  styleParams={{
                    ...store,
                    variant: 'large-clean-row',
                    conciseResumeLabel: true,
                    showDescription: false,
                    showIconBox: false,
                  }}
                />
              </div>
            </div>

            {/* Column 2: Clean Large Title + Boxed Icon (No Description) */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                !store.showDescription && store.showIconBox && variant === 'large-clean-row'
                  ? isLight
                    ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/25'
                  : isLight
                  ? 'bg-white border-neutral-200'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold block">
                    方案 B · 极简大字 + 独立图标方盒
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Resume 短标题 · 无 Description · 保留 36×36 图标内框
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={
                    !store.showDescription && store.showIconBox && variant === 'large-clean-row'
                      ? 'primary'
                      : 'secondary'
                  }
                  isLight={isLight}
                  onClick={() =>
                    applyPreset({
                      variant: 'large-clean-row',
                      conciseResumeLabel: true,
                      showDescription: false,
                      showIconBox: true,
                    })
                  }
                >
                  应用方案 B
                </Button>
              </div>
              <div
                onClickCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex justify-center"
              >
                <Layer1MainMenuRecipe
                  isLight={isLight}
                  contextMode={activeCtx}
                  styleVariant="large-clean-row"
                  styleParams={{
                    ...store,
                    variant: 'large-clean-row',
                    conciseResumeLabel: true,
                    showDescription: false,
                    showIconBox: true,
                  }}
                />
              </div>
            </div>

            {/* Column 3: Previous Descriptive Two-Line Reference */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                store.showDescription
                  ? isLight
                    ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/25'
                  : isLight
                  ? 'bg-white border-neutral-200'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold block">
                    方案 C (旧版对照) · 含下方 Description
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Resume Match + 双行副标题说明
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={store.showDescription ? 'primary' : 'secondary'}
                  isLight={isLight}
                  onClick={() =>
                    applyPreset({
                      variant: 'classic-descriptive-row',
                      conciseResumeLabel: false,
                      showDescription: true,
                      showIconBox: true,
                      titleFontSizePx: 14,
                    })
                  }
                >
                  切换至旧版
                </Button>
              </div>
              <div
                onClickCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex justify-center"
              >
                <Layer1MainMenuRecipe
                  isLight={isLight}
                  contextMode={activeCtx}
                  styleVariant="classic-descriptive-row"
                  styleParams={{
                    ...store,
                    variant: 'classic-descriptive-row',
                    conciseResumeLabel: false,
                    showDescription: true,
                    showIconBox: true,
                    titleFontSizePx: 14,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MainMenuStyleTuner.displayName = 'MainMenuStyleTuner';
