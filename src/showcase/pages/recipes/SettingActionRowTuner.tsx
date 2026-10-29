import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Sparkles,
  NotebookPen,
  Video,
  Crosshair,
  Volume2,
  SmilePlus,
  Palette,
} from 'lucide-react';
import { BounceSolidSvg } from '../../../primitives/packagedSvgIcons';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { Badge } from '../../../primitives/Badge';
import { Button } from '../../../primitives/Button';
import { SettingActionRow } from '../../../primitives/SettingActionRow';
import { SettingToggleRow } from '../../../primitives/SettingToggleRow';
import { SettingSliderRow } from '../../../primitives/SettingSliderRow';
import { SettingSegmentedRow } from '../../../primitives/SettingSegmentedRow';
import { SettingPresetCustomRow } from '../../../primitives/SettingPresetCustomRow';
import { SettingDeveloperStatusRow } from '../../../primitives/SettingDeveloperStatusRow';
import { TelemetryConfigCard } from '../../../compounds/TelemetryConfigCard';
import { CodeBlock } from '../../CodeBlock';
import { useSettingActionRowStore } from '../../../tokens';

export interface SettingActionRowTunerProps {
  isLight?: boolean;
  title?: string;
  codeBadge?: string;
  /** Whether to render the standalone interactive preview inside the tuner card (default: false when co-located above Settings recipe) */
  showStandalonePreview?: boolean;
}

const ICON_COLOR_SWATCHES: { value: string; label: string; dotClass: string }[] = [
  { value: '', label: '默认中性灰 (Neutral Gray)', dotClass: 'bg-neutral-400' },
  { value: 'text-amber-500', label: '暖橙 (Amber)', dotClass: 'bg-amber-500' },
  { value: 'text-emerald-500', label: '翠绿 (Emerald)', dotClass: 'bg-emerald-500' },
  { value: 'text-sky-400', label: '天蓝 (Sky)', dotClass: 'bg-sky-400' },
  { value: 'text-rose-400', label: '玫红 (Rose)', dotClass: 'bg-rose-400' },
];

/**
 * [Decoupled Tuner] SettingActionRowTuner
 * Unified visual inspector for all Settings row archetypes across Gameplay, Audio, Display, and Advanced:
 * 1. `SettingActionRow` (Icon + Title + Configure Button)
 * 2. `SettingToggleRow` (Icon + Title + ToggleSwitch — including `Ball Cam Indicator` Crosshair & `Ball Trajectory Predictor` composite row)
 * 3. `SettingSliderRow` (Icon + Title + Inline/Stacked Progress Bar + Drag-Only Readout)
 * 4. `SettingSegmentedRow` (Icon + Title + SegmentedSwitch or DropdownMenu)
 * 5. `SettingPresetCustomRow` (UI Scaling & Render Scale shared preset + custom slide-reveal component)
 * 6. `SettingDeveloperStatusRow` (Developer Settings Disabled/Active status badge row)
 * Syncs across L1 (`TabsPage`), L6 (`RecipesPage` #recipe-6a-4-settings), and L7 (`7A Menu Layer Sandbox`).
 */
export const SettingActionRowTuner: React.FC<SettingActionRowTunerProps> = React.memo(({
  isLight = false,
  title = 'Settings 统一设置行调优器 (Action · Toggle · Slider 只读拖动 · Preset+Custom · Dev Status · Telemetry)',
  codeBadge = '6A.4S',
  showStandalonePreview = false,
}) => {
  const {
    bordered,
    showDescription,
    paddingX,
    paddingY,
    rowGap,
    borderRadius,
    iconSize,
    iconGap,
    titleFontSize,
    descriptionFontSize,
    buttonFontSize,
    buttonPaddingX,
    buttonPaddingY,
    buttonRadius,
    showButtonArrow,
    defaultIconColor,
    trajectoryRowLayout,
    sliderLayout,
    sliderTrackWidth,
    sliderShowStepper,
    sliderEditableInUserMode,
    sliderEditableInDevMode,
    sliderValueFontSize,
    segmentedLayout,
    pacingPriorityControl,
    advancedBordered,
    advancedShowBadges,
    presetCustomVariation,
    presetCustomSliderWidth,
    presetCustomAnimDuration,
    devStatusAccentColor,
    devStatusInteractiveToggle,
    telemetryVariation,
    telemetryTriggerPosition,
    telemetryDefaultCollapsed,
    floatingOpacityOrder,
    underDevelopmentTopMargin,
    setToken,
    updateTokens,
    resetTokens,
    exportConfigCode,
  } = useSettingActionRowStore();

  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [perRowColorDemo, setPerRowColorDemo] = useState<string>('');
  const [demoBallCam, setDemoBallCam] = useState(true);
  const [demoTrajectory, setDemoTrajectory] = useState(true);
  const [demoVolume, setDemoVolume] = useState(80);
  const [demoPacing, setDemoPacing] = useState<'competitive' | 'balanced' | 'motion' | 'input-consistency'>('balanced');
  const [demoUiScaleVal, setDemoUiScaleVal] = useState(115);
  const [demoDevMode, setDemoDevMode] = useState(false);

  const handleCopy = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyPreset = (
    preset: 'apple-inline' | 'ultra-tight' | 'standard-card' | 'borderless-desc'
  ) => {
    if (preset === 'apple-inline') {
      updateTokens({
        bordered: false,
        showDescription: false,
        paddingX: 10,
        paddingY: 6,
        rowGap: 0,
        borderRadius: 8,
        iconSize: 22,
        iconGap: 14,
        titleFontSize: 14,
        buttonFontSize: 12,
        buttonPaddingX: 10,
        buttonPaddingY: 5,
        buttonRadius: 6,
        trajectoryRowLayout: 'inline',
        sliderLayout: 'inline',
        sliderTrackWidth: 200,
        sliderEditableInUserMode: false,
        sliderEditableInDevMode: false,
        segmentedLayout: 'inline',
        pacingPriorityControl: 'segmented-inline',
        advancedBordered: false,
        advancedShowBadges: false,
      });
    } else if (preset === 'ultra-tight') {
      updateTokens({
        bordered: false,
        showDescription: false,
        paddingX: 8,
        paddingY: 3,
        rowGap: 0,
        borderRadius: 7,
        iconSize: 20,
        iconGap: 12,
        titleFontSize: 13,
        buttonFontSize: 11,
        buttonPaddingX: 9,
        buttonPaddingY: 3,
        buttonRadius: 5,
        trajectoryRowLayout: 'inline',
        sliderLayout: 'inline',
        sliderTrackWidth: 180,
        sliderEditableInUserMode: false,
        sliderEditableInDevMode: false,
        segmentedLayout: 'inline',
        pacingPriorityControl: 'segmented-inline',
        advancedBordered: false,
        advancedShowBadges: false,
      });
    } else if (preset === 'standard-card') {
      updateTokens({
        bordered: true,
        showDescription: true,
        paddingX: 12,
        paddingY: 8,
        rowGap: 6,
        borderRadius: 10,
        iconSize: 20,
        iconGap: 12,
        titleFontSize: 13,
        descriptionFontSize: 11,
        buttonFontSize: 12,
        buttonPaddingX: 10,
        buttonPaddingY: 5,
        buttonRadius: 7,
        trajectoryRowLayout: 'stacked',
        sliderLayout: 'stacked',
        segmentedLayout: 'stacked',
        pacingPriorityControl: 'segmented-stacked',
        advancedBordered: true,
        advancedShowBadges: true,
      });
    } else if (preset === 'borderless-desc') {
      updateTokens({
        bordered: false,
        showDescription: true,
        paddingX: 10,
        paddingY: 6,
        rowGap: 0,
        borderRadius: 8,
        iconSize: 22,
        iconGap: 14,
        titleFontSize: 14,
        descriptionFontSize: 11,
        buttonFontSize: 12,
        buttonPaddingX: 10,
        buttonPaddingY: 5,
        buttonRadius: 6,
      });
    }
  };

  return (
    <div
      id="setting-action-row-tuner"
      className={`scroll-mt-6 p-5 md:p-6 rounded-2xl border flex flex-col gap-5 w-full transition-colors ${
        isLight
          ? 'bg-white border-neutral-200/90 shadow-2xs'
          : 'bg-neutral-900/70 border-neutral-800'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/70 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          {codeBadge && (
            <span className="px-2 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold font-mono text-xs shrink-0">
              {codeBadge}
            </span>
          )}
          <Sliders className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold">{title}</span>
          <Badge variant="amber" size="sm" isLight={isLight}>
            4 子页面全局统一 · L1 ⇄ L6 ⇄ L7 实时联动
          </Badge>
          <span
            className={`text-[11px] font-mono ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            {bordered ? '有外框' : '无外框(Apple Hover)'} · {showDescription ? '含副标题' : '隐藏行内Description(Hover底栏提示)'} · Title {titleFontSize}px · Slider {sliderLayout}({sliderTrackWidth}px) · Pad {paddingX}×{paddingY}px
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            icon={<Code2 className="h-3.5 w-3.5" />}
            onClick={() => setShowCode((v) => !v)}
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
            {copied ? '已复制配置!' : '复制行配置'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isLight={isLight}
            icon={<RotateCcw className="h-3 w-3" />}
            onClick={() => {
              resetTokens();
              setPerRowColorDemo('');
            }}
          >
            重置默认
          </Button>
        </div>
      </div>

      {/* Quick Presets + Structural Toggles */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
          isLight
            ? 'bg-neutral-50/80 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800/80'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-semibold">
              <Sparkles className="h-3 w-3 text-amber-500" /> 一键形态预设:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('apple-inline')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                !bordered && !showDescription && paddingY >= 5 && sliderLayout === 'inline'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title="Apple System Settings 风格：无外框 + 无行内Description + 单行滑块 + 单行复合弹道开关 + Dropdown 长选项"
            >
              ① Apple 无框单行统一预设 (默认推荐 · 4页字号14px对齐 · 单行Slider)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('ultra-tight')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                !bordered && !showDescription && paddingY < 5
                  ? 'bg-amber-500 text-white border-amber-500'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title="超紧凑无框单行：padY=3px, btnPadY=3px, rowGap=0px"
            >
              ② 超紧凑高密度单行 (padY=3px · 0死区)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('borderless-desc')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                !bordered && showDescription
                  ? 'bg-amber-500 text-white border-amber-500'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title="移除外框底板，保留下方 Description，Hover 整体包裹"
            >
              ③ Apple 无框含副标题 (无外框 + 显示行内 Description)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('standard-card')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                bordered && showDescription
                  ? 'bg-amber-500 text-white border-amber-500'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title="传统独立带框分格卡片 + 双行滑块 + 下方 Description 副标题"
            >
              ④ 传统带框分格卡片 (有外框 + 双行堆叠 + 含 Badge)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center gap-5 flex-wrap">
            <ToggleSwitch
              checked={bordered}
              onCheckedChange={(v) => setToken('bordered', v)}
              label="显示常驻外框与底板 (bordered)"
              variant="neutral"
              isLight={isLight}
            />
            <ToggleSwitch
              checked={showDescription}
              onCheckedChange={(v) => setToken('showDescription', v)}
              label="显示行内 Description (默认关: 悬停在底部 Footer 显示)"
              variant="neutral"
              isLight={isLight}
            />
            <ToggleSwitch
              checked={showButtonArrow}
              onCheckedChange={(v) => setToken('showButtonArrow', v)}
              label="显示按钮右侧箭头 (showButtonArrow)"
              variant="neutral"
              isLight={isLight}
            />
          </div>

          {/* Global Default Icon Color Swatch Picker */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
              <Palette className="h-3 w-3" /> 全局默认图标色:
            </span>
            {ICON_COLOR_SWATCHES.map((sw) => {
              const active = defaultIconColor === sw.value;
              return (
                <button
                  key={sw.label}
                  type="button"
                  onClick={() => setToken('defaultIconColor', sw.value)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                    active
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                        : 'bg-neutral-100 text-neutral-950 border-neutral-100 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                  }`}
                  title={`设置全局默认 SVG 图标颜色: ${sw.label} (单行仍可通过 iconColor 属性独立覆盖)`}
                >
                  <span className={`h-2 w-2 rounded-full ${sw.dotClass}`} />
                  <span>{sw.value === '' ? '默认灰' : sw.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Group 1: Typography & Icon Geometry */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
          1 · 四页统一字号与图标尺寸 (Gameplay / Audio / Display / Advanced 全局统一 Title 字号)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SliderControl
            label="主标题统一字号 (titleFontSize)"
            value={titleFontSize}
            min={11}
            max={22}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setToken('titleFontSize', v)}
            isLight={isLight}
          />
          <SliderControl
            label="右侧按钮字号 (buttonFontSize)"
            value={buttonFontSize}
            min={10}
            max={18}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setToken('buttonFontSize', v)}
            isLight={isLight}
          />
          <SliderControl
            label="副标题字号 (descriptionFontSize)"
            value={descriptionFontSize}
            min={9}
            max={16}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setToken('descriptionFontSize', v)}
            isLight={isLight}
          />
          <SliderControl
            label="左侧 SVG 图标尺寸 (iconSize)"
            value={iconSize}
            min={12}
            max={36}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setToken('iconSize', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标与标题水平间距 (iconGap)"
            value={iconGap}
            min={4}
            max={28}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setToken('iconGap', v)}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Group 2: Row & Hover Box Spacing + Concentric Radii */}
      <div className="flex flex-col gap-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500">
            2 · 行本身内边距、Hover 同心圆角与右侧控件对齐边界 (paddingX 决定所有右侧开关对齐线)
          </span>
          <span className="text-[11px] font-mono text-neutral-400">
            提示: UI Safe Area 与 Developer Settings 共享同一 paddingX ({paddingX}px)，右侧开关严丝合缝对齐
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SliderControl
            label="行左右内边距 (paddingX · 决定右侧开关对齐)"
            value={paddingX}
            min={0}
            max={28}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="sky"
            onChange={(v) => setToken('paddingX', v)}
            isLight={isLight}
          />
          <SliderControl
            label="行上下内边距 (paddingY · 元素自身间距)"
            value={paddingY}
            min={-4}
            max={20}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="emerald"
            onChange={(v) => setToken('paddingY', v)}
            isLight={isLight}
          />
          <SliderControl
            label="行与行外部间距 (rowGap · 0=无死区)"
            value={rowGap}
            min={0}
            max={16}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="emerald"
            onChange={(v) => setToken('rowGap', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Hover 背景/外框圆角 (borderRadius)"
            value={borderRadius}
            min={0}
            max={20}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setToken('borderRadius', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Configure 按钮圆角 (buttonRadius)"
            value={buttonRadius}
            min={0}
            max={16}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setToken('buttonRadius', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Configure 按钮左右内衬 (buttonPaddingX)"
            value={buttonPaddingX}
            min={4}
            max={24}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="sky"
            onChange={(v) => setToken('buttonPaddingX', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Configure 按钮上下内衬 (buttonPaddingY)"
            value={buttonPaddingY}
            min={1}
            max={14}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="emerald"
            onChange={(v) => setToken('buttonPaddingY', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Under Development 顶部额外间距 (underDevelopmentTopMargin)"
            value={underDevelopmentTopMargin}
            min={0}
            max={24}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="rose"
            onChange={(v) => setToken('underDevelopmentTopMargin', v)}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Group 3: Archetype-Specific Decoupled Controls (Slider / Composite / Segmented / Advanced) */}
      <div className="flex flex-col gap-3.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
            3 · 各类型设置行解耦布局与交互策略 (Slider 同行进度条 · User/Dev 数值输入 · 弹道复合行 · Advanced 降噪)
          </span>
        </div>

        {/* 3A: Slider Row Controls */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80'
              : 'bg-neutral-950/40 border-neutral-800/80'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold">A. 滑动条行 (`SettingSliderRow`):</span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'inline', label: '单行同行 (Title + 进度条 + 数值同处一行)' },
                    { id: 'stacked', label: '双行上下 (顶行 Title+数值 / 底行全宽进度条)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('sliderLayout', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      sliderLayout === opt.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <ToggleSwitch
                checked={sliderEditableInUserMode}
                onCheckedChange={(v) => setToken('sliderEditableInUserMode', v)}
                label="User Mode 允许文本输入数值"
                variant="neutral"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={sliderEditableInDevMode}
                onCheckedChange={(v) => setToken('sliderEditableInDevMode', v)}
                label="Developer Mode 允许文本输入数值"
                variant="amber"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={sliderShowStepper}
                onCheckedChange={(v) => setToken('sliderShowStepper', v)}
                label="显示 -/+ 步进按钮"
                variant="neutral"
                isLight={isLight}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <SliderControl
              label="单行进度条轨道宽度 (sliderTrackWidth)"
              value={sliderTrackWidth}
              min={100}
              max={320}
              step={4}
              unit="px"
              editable={true}
              allowOutOfBoundsInput={true}
              colorScheme="emerald"
              onChange={(v) => setToken('sliderTrackWidth', v)}
              isLight={isLight}
            />
            <SliderControl
              label="滑块数值字号 (sliderValueFontSize)"
              value={sliderValueFontSize}
              min={10}
              max={16}
              step={1}
              unit="px"
              editable={true}
              allowOutOfBoundsInput={true}
              colorScheme="emerald"
              onChange={(v) => setToken('sliderValueFontSize', v)}
              isLight={isLight}
            />
          </div>
        </div>

        {/* 3B: Composite Row + Segmented / Dropdown + Advanced Cleanup */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80'
              : 'bg-neutral-950/40 border-neutral-800/80'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Ball Trajectory Predictor Layout */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-300">
                B. Ball Trajectory Predictor (开关 + Configure):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'inline', label: '同行紧凑 ([Configure] + [开关])' },
                    { id: 'stacked', label: '拆成两行 (上开关 / 下Configure)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('trajectoryRowLayout', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      trajectoryRowLayout === opt.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Segmented Control Default Layout */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-300">
                C. 普通分段切换行 (`SettingSegmentedRow`):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'inline', label: '同行右侧 (Title ... Segmented)' },
                    { id: 'stacked', label: '上下两行 (上Title / 下Segmented)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('segmentedLayout', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      segmentedLayout === opt.id
                        ? 'bg-sky-500 text-white border-sky-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Priority Control */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-300">
                D. Experience Priority (Gameplay · 5档体验偏好含 Custom):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'segmented-inline', label: '同行右侧分段 (默认)' },
                    { id: 'segmented-stacked', label: '下方单独一行分段' },
                    { id: 'dropdown', label: 'Dropdown 下拉菜单' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('pacingPriorityControl', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      pacingPriorityControl === opt.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Bordered & Badge Toggles */}
          <div className="flex items-center gap-6 flex-wrap pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <ToggleSwitch
              checked={advancedBordered}
              onCheckedChange={(v) => setToken('advancedBordered', v)}
              label="Advanced 复杂块独立描边 (默认关: 消除分格杂乱，保证右侧开关对齐)"
              variant="neutral"
              isLight={isLight}
            />
            <ToggleSwitch
              checked={advancedShowBadges}
              onCheckedChange={(v) => setToken('advancedShowBadges', v)}
              label="Advanced 标题旁显示彩色状态 Badge (默认关: 降低视觉噪音)"
              variant="neutral"
              isLight={isLight}
            />
          </div>
        </div>

        {/* 3C: New Decoupled Component Variations (UI Scaling/Render Scale + Developer Status Badge + Show Telemetry Summary + Order) */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-3.5 ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80'
              : 'bg-neutral-950/40 border-neutral-800/80'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            4 · 专项解耦组件变体实验室 (UI Scaling / Render Scale 同组件联动 · Developer Status Badge · Show Telemetry Summary)
          </span>

          {/* Sub-section 1: SettingPresetCustomRow (UI Scaling & Render Scale) */}
          <div id="setting-preset-custom-tuner" className="scroll-mt-24 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-mono font-bold text-[11px]">
                  6A.4S-E
                </span>
                <span className="text-xs font-bold">
                  E. `SettingPresetCustomRow` (UI Scaling &amp; Render Scale 共享预设+Custom滑块变体):
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    {
                      id: 'slide-reveal',
                      label: '① Slide-Reveal (点击Custom整体左移+背景滑出融为一体 · 0高度增加)',
                    },
                    {
                      id: 'morph-pill',
                      label: '② Morph-Pill (Custom胶囊自身延展内嵌滑块)',
                    },
                    {
                      id: 'popover-scrub',
                      label: '③ Apple Popover (悬浮微调浮层 · 不挤占下方行)',
                    },
                    {
                      id: 'below-row',
                      label: '④ Below-Row (传统展开第二行 Custom Slider)',
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('presetCustomVariation', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      presetCustomVariation === opt.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <SliderControl
                label="Custom 滑出轨道宽度 (presetCustomSliderWidth)"
                value={presetCustomSliderWidth}
                min={96}
                max={280}
                step={4}
                unit="px"
                editable={true}
                allowOutOfBoundsInput={true}
                colorScheme="amber"
                onChange={(v) => setToken('presetCustomSliderWidth', v)}
                isLight={isLight}
              />
              <SliderControl
                label="左移与融合过渡时长 (presetCustomAnimDuration)"
                value={presetCustomAnimDuration}
                min={120}
                max={600}
                step={20}
                unit="ms"
                editable={true}
                allowOutOfBoundsInput={true}
                colorScheme="amber"
                onChange={(v) => setToken('presetCustomAnimDuration', v)}
                isLight={isLight}
              />
            </div>
          </div>

          {/* Sub-section 2: SettingDeveloperStatusRow & Floating Window Opacity Order */}
          <div
            id="setting-dev-status-tuner"
            className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-mono font-bold text-[11px]">
                  6A.4S-F
                </span>
                <span className="text-xs font-bold">
                  F. `SettingDeveloperStatusRow` (Advanced 首位 · Disabled / Active 颜色定制):
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    { id: 'emerald', label: '翠绿 Active Badge + 绿图标 (Emerald)' },
                    { id: 'amber', label: '暖橙 Active Badge + 橙图标 (Amber)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('devStatusAccentColor', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      devStatusAccentColor === opt.id
                        ? opt.id === 'emerald'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-amber-500 text-white border-amber-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <ToggleSwitch
                  checked={devStatusInteractiveToggle}
                  onCheckedChange={(v) => setToken('devStatusInteractiveToggle', v)}
                  label="允许点击 Badge 切换 Active/Disabled"
                  variant="neutral"
                  isLight={isLight}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold">
                G. Advanced · Floating Window Opacity 排序位置 (`floatingOpacityOrder`):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'last', label: '固定最后一位 (Last · 默认)' },
                    { id: 'first-when-inactive', label: '未激活时靠前 / 激活后沉底' },
                    { id: 'first', label: '固定靠前 (紧随 Developer Settings)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('floatingOpacityOrder', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      floatingOpacityOrder === opt.id
                        ? 'bg-sky-500 text-white border-sky-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-section 3: Show Telemetry Summary (TelemetryConfigCard) Variations */}
          <div
            id="setting-telemetry-summary-tuner"
            className="scroll-mt-24 flex flex-col gap-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 font-mono font-bold text-xs">
                  6A.4S-H
                </span>
                <Badge variant="primary" size="sm" isLight={isLight}>
                  L3.8 TelemetryConfigCard
                </Badge>
                <span className="text-xs font-bold">
                  H. `Show Telemetry Summary` (`TelemetryConfigCard` 折叠与内嵌对齐变体 + 实时预览):
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    {
                      id: 'underline-disclosure',
                      label: '① 带下划线 Show ▾ + 展开轻框包裹 (默认收起)',
                    },
                    {
                      id: 'apple-grouped-inset',
                      label: '② Apple System Settings 整体内嵌分组框 (Grouped Inset)',
                    },
                    {
                      id: 'flush-aligned',
                      label: '③ 左右完全平齐 + 左侧竖线导轨 (解决左右不对齐感)',
                    },
                    {
                      id: 'tree-guide',
                      label: '④ 树状缩进导引线 (Tree Guide)',
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('telemetryVariation', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      telemetryVariation === opt.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-neutral-400">
                  带下划线 `Show ▾` 位置:
                </span>
                {(
                  [
                    { id: 'left', label: 'Toggle 左侧 (Left)' },
                    { id: 'right', label: 'Toggle 右侧 (Right)' },
                  ] as const
                ).map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setToken('telemetryTriggerPosition', pos.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                      telemetryTriggerPosition === pos.id
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                        : isLight
                        ? 'bg-white border-neutral-200 text-neutral-600'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              <ToggleSwitch
                checked={telemetryDefaultCollapsed}
                onCheckedChange={(v) => setToken('telemetryDefaultCollapsed', v)}
                label="默认收起下方 5 项子指标 (点击 Show ▾ 展开)"
                variant="neutral"
                isLight={isLight}
              />
            </div>

            {/* Live Co-located Preview of TelemetryConfigCard right inside 6A.4S-H */}
            <div
              className={`p-3.5 rounded-xl border ${
                isLight
                  ? 'bg-white border-emerald-200/80 shadow-2xs'
                  : 'bg-neutral-950/90 border-emerald-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-emerald-500">
                  [6A.4S-H / L3.8] Show Telemetry Summary 实时交互预览 (点击 Show ▾ / Hide ▴ 测试展开)
                </span>
                <span className="text-[10px] font-mono opacity-60">
                  当前变体: {telemetryVariation} · 触发器: {telemetryTriggerPosition}
                </span>
              </div>
              <TelemetryConfigCard isLight={isLight} />
            </div>
          </div>
        </div>
      </div>

      {/* Optional Standalone Live Preview (shown on L1 TabsPage) */}
      {showStandalonePreview && (
        <div
          className={`p-4 rounded-xl border flex flex-col ${
            isLight
              ? 'bg-neutral-100/60 border-neutral-200/80'
              : 'bg-neutral-950/70 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <span className="text-[11px] font-mono font-bold text-amber-500">
              实时预览 (涵盖全部 5 种统一设置行原型 · Title 统一 {titleFontSize}px · 右侧边缘统一 {paddingX}px)
            </span>
            <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono">
              <ToggleSwitch
                checked={demoDevMode}
                onCheckedChange={setDemoDevMode}
                label={demoDevMode ? '预览模式: Developer Mode' : '预览模式: User Mode'}
                variant="amber"
                isLight={isLight}
              />
              <span className="text-neutral-400">第1行 iconColor:</span>
              {[
                { val: '', label: '默认灰' },
                { val: 'text-amber-500', label: 'amber' },
                { val: '#10b981', label: '#10b981' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setPerRowColorDemo(opt.val)}
                  className={`px-2 py-0.5 rounded border cursor-pointer ${
                    perRowColorDemo === opt.val
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-600'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full" style={{ gap: `${rowGap}px` }}>
            {/* 1. Standard Action Row */}
            <SettingActionRow
              icon={NotebookPen}
              iconColor={perRowColorDemo || undefined}
              title="Training Mode Configuration"
              description="Boost mode, goal barrier & car hitbox collision overlay"
              isLight={isLight}
            />
            {/* 2. Standard Action Row */}
            <SettingActionRow
              icon={Video}
              title="Camera Settings"
              description="Field of view, distance, height, angle & tracking stiffness"
              isLight={isLight}
            />
            {/* 3. Toggle Row with new Crosshair icon */}
            <SettingToggleRow
              icon={Crosshair}
              title="Ball Cam Indicator"
              description="Show directional indicator arrow when the ball is off-screen"
              checked={demoBallCam}
              onCheckedChange={setDemoBallCam}
              isLight={isLight}
            />
            {/* 4. Composite Row: Ball Trajectory Predictor */}
            <SettingActionRow
              icon={BounceSolidSvg}
              title="Ball Trajectory Predictor"
              description="Real-time physics path & bounce arc visualization in training"
              isLight={isLight}
              rightSlot={
                <div className="flex items-center gap-2.5">
                  {trajectoryRowLayout === 'inline' && (
                    <button
                      type="button"
                      disabled={!demoTrajectory}
                      style={{
                        fontSize: `${buttonFontSize}px`,
                        paddingLeft: `${buttonPaddingX}px`,
                        paddingRight: `${buttonPaddingX}px`,
                        paddingTop: `${buttonPaddingY}px`,
                        paddingBottom: `${buttonPaddingY}px`,
                        borderRadius: `${buttonRadius}px`,
                      }}
                      className={`inline-flex items-center font-semibold border transition-all ${
                        demoTrajectory
                          ? isLight
                            ? 'bg-white border-neutral-200/90 text-neutral-700 shadow-2xs cursor-pointer'
                            : 'bg-neutral-900 border-neutral-700/80 text-neutral-200 cursor-pointer'
                          : 'opacity-40 cursor-not-allowed border-transparent'
                      }`}
                    >
                      Configure
                    </button>
                  )}
                  <ToggleSwitch
                    checked={demoTrajectory}
                    onCheckedChange={setDemoTrajectory}
                    variant="amber"
                    isLight={isLight}
                  />
                </div>
              }
            />
            {/* 5. Slider Row (Single-Row or Stacked, User vs Dev Mode) */}
            <SettingSliderRow
              icon={Volume2}
              label="Master Volume"
              description="Overall game sound output level across all audio buses."
              value={demoVolume}
              min={0}
              max={100}
              step={1}
              unit="%"
              developerMode={demoDevMode}
              onChange={setDemoVolume}
              isLight={isLight}
            />
            {/* 6. Segmented / Dropdown Row (Experience Priority) */}
            <SettingSegmentedRow
              icon={SmilePlus}
              label="Experience Priority"
              description="Balance competitive responsiveness, frame motion, and input consistency."
              value={demoPacing}
              onChange={setDemoPacing}
              controlType={pacingPriorityControl === 'dropdown' ? 'dropdown' : 'segmented'}
              layout={pacingPriorityControl === 'segmented-stacked' ? 'stacked' : 'inline'}
              options={[
                { value: 'competitive', label: 'Competitive' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'motion', label: 'Motion' },
                { value: 'input-consistency', label: 'Input Consistency' },
                { value: 'custom', label: 'Custom' },
              ]}
              isLight={isLight}
            />
            {/* 7. Preset + Custom Slide-Reveal Row (UI Scaling / Render Scale) */}
            <SettingPresetCustomRow
              icon={Palette}
              label="UI Scaling"
              description="Preset scales or smooth slide-reveal custom scale factor."
              value={demoUiScaleVal}
              presets={[
                { value: 100, label: '100%' },
                { value: 125, label: '125%' },
                { value: 150, label: '150%' },
              ]}
              defaultCustomValue={115}
              min={75}
              max={150}
              step={1}
              unit="%"
              onChange={setDemoUiScaleVal}
              isLight={isLight}
            />
            {/* 8. Developer Status Row (Disabled / Active Badge) */}
            <SettingDeveloperStatusRow
              developerMode={demoDevMode}
              onDeveloperModeChange={setDemoDevMode}
              isLight={isLight}
            />
          </div>
        </div>
      )}

      {showCode && (
        <CodeBlock
          isLight={isLight}
          title="src/tokens/settingRowStore.ts & 六类解耦设置行原语用法"
          code={`${exportConfigCode()}

// 1. 导航按钮行 (SettingActionRow)
<SettingActionRow
  icon={NotebookPen}
  title="Training Mode Configuration"
  onAction={onNavigateTrainingDetail}
  isLight={isLight}
/>

// 2. 开关行 (SettingToggleRow — 自动对齐右侧 paddingX)
<SettingToggleRow
  icon={Crosshair}
  title="Ball Cam Indicator"
  checked={ballCamIndicator}
  onCheckedChange={setBallCamIndicator}
  isLight={isLight}
/>

// 3. 滑动条行 (SettingSliderRow — 统一只读拖动数值，User/Dev 均禁手输，Dev 交由 Developer Menu 覆盖)
<SettingSliderRow
  icon={Volume2}
  label="Master Volume"
  value={masterVol}
  min={0}
  max={100}
  unit="%"
  developerMode={developerMode}
  onChange={setMasterVol}
  isLight={isLight}
/>

// 4. 分段/下拉选择行 (SettingSegmentedRow — Experience Priority)
<SettingSegmentedRow
  icon={SmilePlus}
  label="Experience Priority"
  value={experiencePriority}
  onChange={setExperiencePriority}
  options={EXPERIENCE_PRIORITY_OPTIONS}
  isLight={isLight}
/>

// 5. 预设+Custom滑出融合行 (SettingPresetCustomRow — UI Scaling & Render Scale 共享)
<SettingPresetCustomRow
  icon={Maximize2}
  label="UI Scaling"
  mode={scaleMode}
  onModeChange={setScaleMode}
  options={UI_SCALE_OPTIONS}
  customValue={customScale}
  onCustomValueChange={setCustomScale}
  min={0.75}
  max={1.35}
  step={0.01}
  isLight={isLight}
/>

// 6. 开发者模式状态徽章行 (SettingDeveloperStatusRow — Disabled 灰 / Active 绿或橙)
<SettingDeveloperStatusRow
  active={developerMode}
  onToggle={onDeveloperModeChange}
  isLight={isLight}
/>`}
        />
      )}
    </div>
  );
});

SettingActionRowTuner.displayName = 'SettingActionRowTuner';
