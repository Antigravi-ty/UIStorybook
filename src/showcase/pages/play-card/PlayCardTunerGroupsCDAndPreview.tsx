import React from 'react';
import { ArrowUpRight, Type, Image as ImageIcon } from 'lucide-react';
import { Layer2PlayRecipe } from '../../../recipes/Layer2PlayRecipe';
import { Badge } from '../../../primitives/Badge';
import { Button } from '../../../primitives/Button';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { LocalPanelSizingTuner } from '../recipes/LocalPanelSizingTuner';
import {
  usePlayCardStyleStore,
  JETBRAINS_MONO_WEIGHT_OPTIONS,
  type PlayCardStyleVariant,
  type MonoTitleAnchor,
  type WatermarkAnchor,
  type WatermarkColorMode,
  type InlineHeaderLayoutMode,
} from '../../../tokens/playCardStyleStore';

export interface PlayCardVariantMetaItem {
  id: PlayCardStyleVariant;
  code: string;
  title: string;
  formula: string;
  desc: string;
}

export interface PlayCardTunerGroupsCDProps {
  isLight: boolean;
}

export const PlayCardTunerGroupsCD: React.FC<PlayCardTunerGroupsCDProps> = ({
  isLight,
}) => {
  const store = usePlayCardStyleStore();
  const { variant, setVariant, setParam } = store;

  return (
    <>
      {/* Group C: Style 3 Specific — JetBrains Mono + 30% Giant Watermark Icon */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-4 ${
          variant === 'mono-giant-watermark'
            ? isLight
              ? 'bg-amber-50/40 border-amber-400/80'
              : 'bg-amber-500/5 border-amber-500/40'
            : isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <ImageIcon className="h-4 w-4" />
            <span>
              C. 风格三专属参数：JetBrains Mono 大字抬头 + 背景超大水印 Icon (默认 30% Opacity)
            </span>
          </div>
          {variant !== 'mono-giant-watermark' && (
            <button
              type="button"
              onClick={() => setVariant('mono-giant-watermark')}
              className="text-[11px] font-mono font-bold text-amber-500 hover:underline cursor-pointer"
            >
              切换至风格三以在下方主面板预览 &rarr;
            </button>
          )}
        </div>

        {/* C1: JetBrains Mono Title Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SliderControl
            label="Mono 抬头字号 (monoTitleSize)"
            value={store.monoTitleSizePx}
            min={13}
            max={38}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('monoTitleSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Mono 字间距 (letterSpacing)"
            value={store.monoLetterSpacingEm}
            min={-0.08}
            max={0.15}
            step={0.01}
            unit="em"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('monoLetterSpacingEm', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Mono 行高 (lineHeight)"
            value={store.monoLineHeight}
            min={0.95}
            max={1.6}
            step={0.05}
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('monoLineHeight', v)}
            isLight={isLight}
          />
        </div>

        {/* Official 8 JetBrains Mono Font Weights */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
            JetBrains Mono 官方字重 (Font Weight):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {JETBRAINS_MONO_WEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.weight}
                type="button"
                onClick={() => setParam('monoTitleWeight', opt.weight)}
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontWeight: opt.weight,
                }}
                className={`py-1.5 px-2 rounded-lg text-xs border cursor-pointer transition-all ${
                  store.monoTitleWeight === opt.weight
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* C2: Title Anchor & Optional Overlays */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              大字空间对齐锚点 (monoTitleAnchor):
            </span>
            {(
              [
                { id: 'center-left', label: '左中 (Center-Left)' },
                { id: 'center', label: '正中 (Center)' },
                { id: 'bottom-left', label: '左下 (Bottom-Left)' },
                { id: 'top-left', label: '左上 (Top-Left)' },
                { id: 'bottom-right', label: '右下 (Bottom-Right)' },
              ] as { id: MonoTitleAnchor; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParam('monoTitleAnchor', opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.monoTitleAnchor === opt.id
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

          <div className="flex items-center gap-4 flex-wrap">
            <ToggleSwitch
              checked={store.monoUppercase}
              onCheckedChange={(v) => setParam('monoUppercase', v)}
              label="大写抬头 (UPPERCASE)"
              isLight={isLight}
            />
            <ToggleSwitch
              checked={store.monoShowDescription}
              onCheckedChange={(v) => setParam('monoShowDescription', v)}
              label="附带显示 Description"
              isLight={isLight}
            />
            <ToggleSwitch
              checked={store.monoShowBadge}
              onCheckedChange={(v) => setParam('monoShowBadge', v)}
              label="附带显示右上角 Badge"
              isLight={isLight}
            />
          </div>
        </div>

        {/* C3: Giant Watermark Icon Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <SliderControl
            label="超大背景 Icon 透明度 (默认 30%)"
            value={store.watermarkOpacityPct}
            min={0}
            max={100}
            step={1}
            unit="%"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('watermarkOpacityPct', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Hover 悬停时 Icon 透明度"
            value={store.watermarkHoverOpacityPct}
            min={0}
            max={100}
            step={1}
            unit="%"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('watermarkHoverOpacityPct', v)}
            isLight={isLight}
          />
          <SliderControl
            label="超大背景 Icon 尺寸 (watermarkSize)"
            value={store.watermarkSizePx}
            min={32}
            max={200}
            step={2}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('watermarkSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="超大背景 Icon 线宽 (strokeWidth)"
            value={store.watermarkStrokeWidth}
            min={0.5}
            max={3.0}
            step={0.1}
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('watermarkStrokeWidth', v)}
            isLight={isLight}
          />
          <SliderControl
            label="背景 Icon 水平偏移 (offsetX)"
            value={store.watermarkOffsetXPx}
            min={-60}
            max={60}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('watermarkOffsetXPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="背景 Icon 垂直偏移 (offsetY)"
            value={store.watermarkOffsetYPx}
            min={-60}
            max={60}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('watermarkOffsetYPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="背景 Icon 旋转角 (rotateDeg)"
            value={store.watermarkRotateDeg}
            min={-45}
            max={45}
            step={1}
            unit="°"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('watermarkRotateDeg', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Hover 悬停缩放倍率 (hoverScale)"
            value={store.watermarkHoverScale}
            min={1.0}
            max={1.25}
            step={0.01}
            unit="x"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('watermarkHoverScale', v)}
            isLight={isLight}
          />
        </div>

        {/* C4: Watermark Anchor & Color Mode */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              超大背景 Icon 方位 (watermarkAnchor):
            </span>
            {(
              [
                { id: 'bottom-right', label: '右下角 (Bottom-Right)' },
                { id: 'right-center', label: '右侧居中 (Right-Center)' },
                { id: 'center', label: '正中叠印 (Center)' },
                { id: 'top-right', label: '右上角 (Top-Right)' },
                { id: 'bottom-left', label: '左下角 (Bottom-Left)' },
              ] as { id: WatermarkAnchor; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParam('watermarkAnchor', opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.watermarkAnchor === opt.id
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

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              全局水印着色模式:
            </span>
            {(
              [
                { id: 'mode-accent', label: '跟随各卡片独立配色 (Per-Card)' },
                { id: 'amber', label: '全局统一暖橙' },
                { id: 'neutral', label: '全局单色暗灰' },
              ] as { id: WatermarkColorMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParam('watermarkColorMode', opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.watermarkColorMode === opt.id
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
        </div>
      </div>

      {/* Group D: Style 1 & Style 2 Specific Controls */}
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
            <span>
              D. 风格一 &amp; 风格二专属参数：前景 Icon 容器、内联 Title 间距与 Description 排版
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <ToggleSwitch
              checked={store.showIconBox}
              onCheckedChange={(v) => setParam('showIconBox', v)}
              label="显示前景 Icon 边框方盒 (showIconBox)"
              isLight={isLight}
            />
            <ToggleSwitch
              checked={store.titleUseMonoFont}
              onCheckedChange={(v) => setParam('titleUseMonoFont', v)}
              label="Title 使用 JetBrains Mono 字体"
              isLight={isLight}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SliderControl
            label="前景 Icon 尺寸 (iconSize)"
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
            label="前景 Icon 框内衬 (boxPad)"
            value={store.iconBoxPaddingPx}
            min={0}
            max={16}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('iconBoxPaddingPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Title 标题字号 (titleSize)"
            value={store.titleFontSizePx}
            min={11}
            max={24}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('titleFontSizePx', v)}
            isLight={isLight}
          />
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
            label="[风格二] Icon 与 Title 水平间距"
            value={store.inlineIconTitleGapPx}
            min={4}
            max={24}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('inlineIconTitleGapPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="[风格二] 顶行与 Description 间距"
            value={store.inlineHeaderMarginBottomPx}
            min={0}
            max={24}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('inlineHeaderMarginBottomPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="[风格一] 顶行与 Title 间距"
            value={store.style1TopRowMarginBottomPx}
            min={0}
            max={24}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('style1TopRowMarginBottomPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="[风格一] Title 与 Description 间距"
            value={store.style1TitleMarginBottomPx}
            min={0}
            max={16}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('style1TitleMarginBottomPx', v)}
            isLight={isLight}
          />
        </div>

        {/* Style 1 & 2 Official Font Weights */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
            [风格一 &amp; 二] Title 标题字重 (Font Weight):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {JETBRAINS_MONO_WEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.weight}
                type="button"
                onClick={() => setParam('titleFontWeight', opt.weight)}
                style={{ fontWeight: opt.weight }}
                className={`py-1.5 px-2 rounded-lg text-xs border cursor-pointer transition-all ${
                  store.titleFontWeight === opt.weight
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              [风格二] 第一行 [Icon + Title] 对齐方式:
            </span>
            {(
              [
                { id: 'left-pack', label: '左对齐紧邻 (Left-Pack)' },
                { id: 'space-between', label: '左右两端对齐 (Space-Between)' },
              ] as { id: InlineHeaderLayoutMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParam('inlineHeaderLayout', opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.inlineHeaderLayout === opt.id
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              Description 最大行数 (lineClamp):
            </span>
            {([1, 2, 3, 0] as const).map((lines) => (
              <button
                key={lines}
                type="button"
                onClick={() => setParam('descLineClamp', lines)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.descLineClamp === lines
                    ? 'bg-amber-500 text-white border-amber-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                }`}
              >
                {lines === 0 ? '不限行' : `${lines} 行`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export interface PlayCardLivePreviewAndMatrixProps {
  isLight: boolean;
  variant: PlayCardStyleVariant;
  setVariant: (v: PlayCardStyleVariant) => void;
  variantMeta: PlayCardVariantMetaItem[];
  onNavigateToSandboxPlay?: () => void;
}

export const PlayCardLivePreviewAndMatrix: React.FC<PlayCardLivePreviewAndMatrixProps> = ({
  isLight,
  variant,
  setVariant,
  variantMeta,
  onNavigateToSandboxPlay,
}) => {
  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────────
          Section 3 (2B.3): Live L2 Play Panel Preview (Synced with 7A)
         ────────────────────────────────────────────────────────────────────── */}
      <section id="play-card-2b-3-panel" className="scroll-mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-sky-500/15 text-sky-500 border border-sky-500/30">
              2B.3
            </span>
            <h2 className="text-base font-bold">
              L2 Play 菜单完整 2×3 面板实时预览 (当前激活风格: {variant})
            </h2>
          </div>

          {onNavigateToSandboxPlay && (
            <button
              type="button"
              onClick={onNavigateToSandboxPlay}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-500 hover:text-amber-400 cursor-pointer"
            >
              <span>在 7A 全链路沙盒中打开此 Play 菜单</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <LocalPanelSizingTuner
          panelId="layer2-play"
          label="Layer 2 Play 模式选择面板外框尺寸"
          recommendation="推荐 Auto-Fit：切换三种卡片风格或调整卡片最小高度时，Play 面板高度自动平滑贴合"
          isLight={isLight}
        />

        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight
              ? 'bg-neutral-100/70 border-neutral-200/80 shadow-inner'
              : 'border-neutral-800 bg-neutral-950/70 shadow-inner'
          }`}
        >
          <Layer2PlayRecipe isLight={isLight} onBack={() => {}} />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          Section 4 (2B.4): Full 2x3 Panel 3-Way Shootout Matrix
         ────────────────────────────────────────────────────────────────────── */}
      <section
        id="play-card-2b-4-matrix"
        className="scroll-mt-6 flex flex-col gap-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-rose-500/15 text-rose-500 border border-rose-500/30">
              2B.4
            </span>
            <h2 className="text-base font-bold">
              三种风格完整 2×3 菜单面板同屏对照矩阵 (Full 2×3 Panel 3-Way Shootout)
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            以下三个完整 Play 面板共享上方 2B.2 调优参数，方便直接直观对比整体视觉呼吸感
          </span>
        </div>

        <div className="flex flex-col gap-6">
          {variantMeta.map((v) => {
            const isCurrent = variant === v.id;
            return (
              <div
                key={v.id}
                className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all ${
                  isCurrent
                    ? isLight
                      ? 'bg-amber-50/25 border-amber-500/80 shadow-xs'
                      : 'bg-amber-500/5 border-amber-500/60'
                    : isLight
                    ? 'bg-white border-neutral-200/90'
                    : 'bg-neutral-900/50 border-neutral-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Badge
                      variant={isCurrent ? 'amber' : 'neutral'}
                      size="sm"
                      isLight={isLight}
                    >
                      {v.code}
                    </Badge>
                    <span className="font-bold text-sm">{v.title}</span>
                    <code className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                      ({v.formula})
                    </code>
                  </div>

                  <Button
                    size="sm"
                    variant={isCurrent ? 'primary' : 'secondary'}
                    isLight={isLight}
                    onClick={() => setVariant(v.id)}
                  >
                    {isCurrent ? '✓ 已应用于 7A Play 菜单' : '应用此风格至 7A Play 菜单'}
                  </Button>
                </div>

                <div
                  className={`flex justify-center p-5 rounded-xl border ${
                    isLight
                      ? 'bg-neutral-100/60 border-neutral-200/70'
                      : 'bg-neutral-950/60 border-neutral-800/80'
                  }`}
                >
                  <Layer2PlayRecipe
                    isLight={isLight}
                    cardVariant={v.id}
                    onBack={() => {}}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};
