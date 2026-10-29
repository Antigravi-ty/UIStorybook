import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Code2,
  ArrowUpRight,
  Type,
  Image as ImageIcon,
  Box,
  CheckCircle2,
  Palette,
} from 'lucide-react';
import { PlayModeCard } from '../../compounds/PlayModeCard';
import { Layer2PlayRecipe, PLAY_MODES } from '../../recipes/Layer2PlayRecipe';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { SliderControl } from '../../primitives/SliderControl';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { CodeBlock } from '../CodeBlock';
import { PageJumpDirectory, type JumpDirectoryItem } from '../PageJumpDirectory';
import { LocalPanelSizingTuner } from './recipes/LocalPanelSizingTuner';
import {
  usePlayCardStyleStore,
  PLAY_CARD_STYLE_PRESETS,
  JETBRAINS_MONO_WEIGHT_OPTIONS,
  PLAY_CARD_ICON_COLOR_OPTIONS,
  isCustomPlayCardColor,
  resolvePlayCardIconHex,
  hexToRgbTuple,
  rgbTupleToHex,
  type PlayCardStyleVariant,
  type MonoTitleAnchor,
  type WatermarkAnchor,
  type WatermarkColorMode,
  type InlineHeaderLayoutMode,
  type PlayModeCardId,
} from '../../tokens/playCardStyleStore';

export interface PlayCardPageProps {
  isLight?: boolean;
  onNavigateToSandboxPlay?: () => void;
}

const PLAY_CARD_JUMP_ITEMS: JumpDirectoryItem[] = [
  {
    code: '2B.1',
    componentName: 'PlayModeCardSingleComparison',
    label: '单卡片三风格并排检视与预设切换 (Style 1 vs Style 2 vs Style 3)',
    targetId: 'play-card-2b-1-single',
    tag: 'L2 · Single Card',
  },
  {
    code: '2B.2',
    componentName: 'PlayModeCardParameterTuner',
    label: '全参数精细调优工作台 (8 级官方字重 + 30% 超大水印 Icon + 6 卡片独立图标调色)',
    targetId: 'play-card-2b-2-tuner',
    tag: 'L0–L2 · Parameters',
  },
  {
    code: '2B.3',
    componentName: 'Layer2PlayRecipeLivePreview',
    label: 'L2 Play 菜单 2×3 完整面板实时预览 (与 7A 沙盒 100% 实时同步)',
    targetId: 'play-card-2b-3-panel',
    tag: 'L6/L7 · Live Panel',
  },
  {
    code: '2B.4',
    componentName: 'PlayModeCardTriadMatrix',
    label: '三种风格完整 2×3 菜单面板同屏对照矩阵 (Full Panel 3-Way Shootout)',
    targetId: 'play-card-2b-4-matrix',
    tag: 'Shootout Matrix',
  },
];

const VARIANT_META: {
  id: PlayCardStyleVariant;
  code: string;
  title: string;
  formula: string;
  desc: string;
}[] = [
  {
    id: 'icon-badge-top',
    code: 'Style 1',
    title: '风格一 · 经典四段式 (左 Icon + 右 Badge → Title → Desc)',
    formula: 'Row 1: [Icon | Badge] → Row 2: Title → Row 3: Description',
    desc: '四段结构：第一行左侧放置带框/无框 Icon，右侧放置胶囊 Badge；下方为 Title，最下方为多行 Description。',
  },
  {
    id: 'icon-title-inline',
    code: 'Style 2',
    title: '风格二 · 紧凑内联无 Badge 式 (左 Icon + 右 Title → Desc)',
    formula: 'Row 1: [Icon + Title] (No Badge) → Row 2: Description',
    desc: '去除了右上角 Badge 视觉噪音：第一行左侧为 Icon，右侧紧邻（或两端对齐）Title，下方直接展示 Description，纵向更紧凑干净。',
  },
  {
    id: 'mono-giant-watermark',
    code: 'Style 3',
    title: '风格三 (当前默认) · JetBrains Mono 大字抬头 + 30% 超大背景 Icon',
    formula: 'FG: JetBrains Mono Giant Title + BG: 30% Opacity Oversized Icon',
    desc: '工业遥测海报感：前景直接采用大号 JetBrains Mono 抬头文字（支持 Thin ~ Extra Bold 全 8 级官方字重），背景叠印默认 30% 不透明度的超大矢量 Icon 水印。',
  },
];

export const PlayCardPage: React.FC<PlayCardPageProps> = ({
  isLight = true,
  onNavigateToSandboxPlay,
}) => {
  const store = usePlayCardStyleStore();
  const {
    variant,
    setVariant,
    setParam,
    setCardIconColor,
    applyPreset,
    resetParams,
    exportConfigCode,
  } = store;

  const [specimenId, setSpecimenId] = useState<string>('exhibition');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeBlock, setShowCodeBlock] = useState(false);

  const specimenMode =
    PLAY_MODES.find((m) => m.id === specimenId) || PLAY_MODES[0];

  const handleCopyCode = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      {/* Top Hero & Layer Location Notice */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>L2 Layout & Shells · Decoupled PlayModeCard Preview & Tuner</span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                2B · PlayCard 模式卡片三风格预览与参数调优台
              </h1>
              <Badge variant="primary" size="sm" isLight={isLight}>
                L2 原生解耦 · 实时同步 7A Play 菜单
              </Badge>
            </div>
            <p
              className={`text-xs leading-relaxed max-w-3xl ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              专为 <strong>L2 Play 菜单 (`Layer2PlayRecipe`)</strong> 抽离的零耦合独立卡片组件{' '}
              <code className="font-mono">PlayModeCard</code>（位于金字塔{' '}
              <strong>L2. Layout &amp; Shells 层级</strong>）。
              支持三种视觉结构一键切换、JetBrains Mono 官方 8 级字重选择、每张卡片 Icon 颜色独立调节（Host Match 默认灰色），所有参数实时同步至{' '}
              <strong>7A · Menu Layer 全链路沙盒</strong> 的 <code className="font-mono">Play</code> 菜单中。
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onNavigateToSandboxPlay && (
              <Button
                size="sm"
                variant="primary"
                isLight={isLight}
                icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                onClick={onNavigateToSandboxPlay}
              >
                去 7A 沙盒查看 Play 菜单
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={<Code2 className="h-3.5 w-3.5" />}
              onClick={() => setShowCodeBlock((prev) => !prev)}
            >
              {showCodeBlock ? '隐藏配置代码' : '查看配置代码'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={handleCopyCode}
            >
              {copiedCode ? '已复制参数!' : '复制参数配置'}
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

        {showCodeBlock && (
          <CodeBlock
            isLight={isLight}
            title="当前 PlayModeCard 完整导出参数配置 (含每张卡片独立 Icon 颜色 · 可直接固化至 src/tokens/playCardStyleStore.ts)"
            code={exportConfigCode()}
          />
        )}

        <PageJumpDirectory
          title="2B · Play 菜单卡片三风格专页快速跳转目录 (PlayModeCard Jump Index)"
          subtitle="点击条目快速定位至单卡三风格对比、参数调优工作台、2×3 实时面板或三风格全尺寸对照矩阵"
          items={PLAY_CARD_JUMP_ITEMS}
          isLight={isLight}
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Section 1 (2B.1): Single Card 3-Style Side-by-Side Inspector + Presets
         ────────────────────────────────────────────────────────────────────── */}
      <section
        id="play-card-2b-1-single"
        className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-2xs'
            : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              2B.1
            </span>
            <h2 className="text-base font-bold">
              单张卡片三风格并排对比与一键激活 (Single Card 3-Style Inspector)
            </h2>
          </div>

          {/* Specimen Mode Picker */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-neutral-400 mr-1">检视样本卡片:</span>
            {PLAY_MODES.map((m) => {
              const active = m.id === specimenId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSpecimenId(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {m.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Side-by-Side Single Card Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {VARIANT_META.map((v) => {
            const isSelected = variant === v.id;
            return (
              <div
                key={v.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                  isSelected
                    ? isLight
                      ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/25'
                      : 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                    : isLight
                    ? 'bg-neutral-50/60 border-neutral-200/80'
                    : 'bg-neutral-950/60 border-neutral-800'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      {v.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVariant(v.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : isLight
                          ? 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>当前激活风格</span>
                        </>
                      ) : (
                        <span>设为当前风格</span>
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-xs mt-1">{v.title}</h3>
                  <code
                    className={`text-[10px] font-mono px-2 py-1 rounded border ${
                      isLight
                        ? 'bg-white border-neutral-200 text-neutral-600'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {v.formula}
                  </code>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}
                  >
                    {v.desc}
                  </p>
                </div>

                {/* Live Rendered Specimen Card */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-center ${
                    isLight
                      ? 'bg-neutral-100/80 border-neutral-200/80'
                      : 'bg-neutral-900/90 border-neutral-800'
                  }`}
                >
                  <div className="w-full max-w-[240px]">
                    <PlayModeCard
                      id={specimenMode.id}
                      title={specimenMode.title}
                      subtitle={specimenMode.subtitle}
                      badge={specimenMode.badge}
                      badgeVariant={specimenMode.category === 'Match' ? 'primary' : 'warning'}
                      icon={specimenMode.icon}
                      isLight={isLight}
                      variant={v.id}
                      styleParams={store}
                      onClick={() => setVariant(v.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Curated Quick Presets Bar */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
            isLight
              ? 'bg-neutral-50/80 border-neutral-200/80'
              : 'bg-neutral-950/60 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-500" />
              <span>6 组精选预设方案一键加载 (Curated Style Presets)</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              点击任意预设后可在下方 2B.2 继续微调任意滑块
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {PLAY_CARD_STYLE_PRESETS.map((preset) => (
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
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          Section 2 (2B.2): Comprehensive Parameter Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <section
        id="play-card-2b-2-tuner"
        className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-6 ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-2xs'
            : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              2B.2
            </span>
            <Sliders className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold">
              全量参数精细调优工作台 (All-In Parameter Inspector)
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {(['icon-badge-top', 'icon-title-inline', 'mono-giant-watermark'] as const).map(
              (v, idx) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    variant === v
                      ? 'bg-amber-500 text-white border-amber-500'
                      : isLight
                      ? 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  Style {idx + 1}: {v}
                </button>
              )
            )}
          </div>
        </div>

        {/* Group A: Shared Card Container Geometry */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-3.5 ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80'
              : 'bg-neutral-950/50 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Box className="h-4 w-4" />
            <span>A. 卡片容器几何与网格间距 (Card Container &amp; Grid Geometry)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SliderControl
              label="卡片左右内衬 (padX)"
              value={store.cardPaddingXPx}
              min={6}
              max={32}
              step={1}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) => setParam('cardPaddingXPx', v)}
              isLight={isLight}
            />
            <SliderControl
              label="卡片上下内衬 (padY)"
              value={store.cardPaddingYPx}
              min={6}
              max={32}
              step={1}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) => setParam('cardPaddingYPx', v)}
              isLight={isLight}
            />
            <SliderControl
              label="卡片最小高度 (minH)"
              value={store.cardMinHeightPx}
              min={64}
              max={200}
              step={2}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) => setParam('cardMinHeightPx', v)}
              isLight={isLight}
            />
            <SliderControl
              label="卡片圆角 (radius)"
              value={store.cardRadiusPx}
              min={0}
              max={28}
              step={1}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="sky"
              onChange={(v) => setParam('cardRadiusPx', v)}
              isLight={isLight}
            />
            <SliderControl
              label="2×3 网格间距 (gridGap)"
              value={store.gridGapPx}
              min={4}
              max={28}
              step={1}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="emerald"
              onChange={(v) => setParam('gridGapPx', v)}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Group B: Per-Option Independent Icon Colors */}
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
              <span>
                B. 6 个选项独立 Icon 颜色配置 (Per-Card Independent Icon Color · Host Match 默认灰色)
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              每个选项的 Icon 颜色可单独调节，同时作用于三种卡片风格并随配置一并导出
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLAY_MODES.map((mode) => {
              const cardId = mode.id as PlayModeCardId;
              const currentColor = store.cardIconColors?.[cardId] || 'amber';
              const isCustom = isCustomPlayCardColor(currentColor);
              const resolvedHex = resolvePlayCardIconHex(currentColor, isLight);
              const rgb = hexToRgbTuple(resolvedHex);
              const presetLabel = PLAY_CARD_ICON_COLOR_OPTIONS.find(
                (c) => c.id === currentColor
              )?.label;

              return (
                <div
                  key={mode.id}
                  className={`p-3 rounded-xl border flex flex-col gap-2.5 ${
                    isLight
                      ? 'bg-white border-neutral-200/90'
                      : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono">{mode.title}</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {presetLabel || `自定义 RGB (${rgb.r}, ${rgb.g}, ${rgb.b})`}
                    </span>
                  </div>

                  {/* Preset Color Swatches */}
                  <div className="flex flex-wrap items-center gap-1">
                    {PLAY_CARD_ICON_COLOR_OPTIONS.map((opt) => {
                      const isSelected = currentColor === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCardIconColor(cardId, opt.id)}
                          title={opt.label}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-2xs'
                                : 'bg-white text-neutral-950 border-white font-bold shadow-2xs'
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
                  </div>

                  {/* Custom RGB / Color Picker Row */}
                  <div
                    className={`pt-2 border-t flex items-center justify-between gap-1.5 text-[10px] font-mono ${
                      isLight ? 'border-neutral-100' : 'border-neutral-800/80'
                    }`}
                  >
                    <label
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer transition-all shrink-0 ${
                        isCustom
                          ? isLight
                            ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                            : 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                          : isLight
                          ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                          : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                      }`}
                      title="点击打开自由取色器 (Custom RGB Picker)"
                    >
                      <input
                        type="color"
                        value={resolvedHex}
                        onChange={(e) => setCardIconColor(cardId, e.target.value)}
                        className="h-3.5 w-3.5 rounded border-0 p-0 bg-transparent cursor-pointer"
                      />
                      <span>自选 RGB</span>
                    </label>

                    <div className="flex items-center gap-1">
                      {(['r', 'g', 'b'] as const).map((ch) => (
                        <label
                          key={ch}
                          className="flex items-center gap-0.5"
                          title={`${ch.toUpperCase()} (0-255)`}
                        >
                          <span className="text-neutral-400 uppercase">{ch}</span>
                          <input
                            type="number"
                            min={0}
                            max={255}
                            value={rgb[ch]}
                            onChange={(e) => {
                              const nextVal = Number(e.target.value);
                              const nextRgb = { ...rgb, [ch]: nextVal };
                              setCardIconColor(
                                cardId,
                                rgbTupleToHex(nextRgb.r, nextRgb.g, nextRgb.b)
                              );
                            }}
                            className={`w-10 px-1 py-0.5 rounded border text-center text-[10px] font-mono outline-none ${
                              isLight
                                ? 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-amber-500'
                                : 'bg-neutral-950 border-neutral-700 text-neutral-200 focus:border-amber-500'
                            }`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
      </section>

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
          {VARIANT_META.map((v) => {
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
    </div>
  );
};
