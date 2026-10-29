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
import { MainMenuStyleGroupsCDE } from './MainMenuStyleGroupsCDE';
import { MainMenuStylePreviewShootout } from './MainMenuStylePreviewShootout';

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

      <MainMenuStyleGroupsCDE isLight={isLight} />

      <MainMenuStylePreviewShootout
        isLight={isLight}
        activeCtx={activeCtx}
        activeCtxMeta={activeCtxMeta}
        handleSelectCtx={handleSelectCtx}
        showLivePanel={showLivePanel}
        showShootout={showShootout}
      />
    </div>
  );
});

MainMenuStyleTuner.displayName = 'MainMenuStyleTuner';
