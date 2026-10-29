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
import { SettingActionRowArchetypeSections } from './SettingActionRowArchetypeSections';

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

      <SettingActionRowArchetypeSections
        isLight={isLight}
        showStandalonePreview={showStandalonePreview}
        showCode={showCode}
      />
    </div>
  );
});

SettingActionRowTuner.displayName = 'SettingActionRowTuner';

