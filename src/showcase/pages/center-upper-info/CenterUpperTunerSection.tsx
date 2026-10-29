import React from 'react';
import { RotateCcw, Timer, Palette, Sliders, Layers, Copy, Check, Code2, } from 'lucide-react';
import {
  CenterUpperGlowConfig, CenterUpperTypographyConfig, CenterUpperTimingConfig, DEFAULT_RL_COUNTDOWN_GLOW,
  DEFAULT_CENTER_UPPER_TYPOGRAPHY, DEFAULT_CENTER_UPPER_TIMING,
} from '../../../hud/CenterUpperInfoHUD';
import { Badge } from '../../../primitives/Badge';
import { SliderControl } from '../../../primitives/SliderControl';
import { SegmentedSwitch } from '../../../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { ColorSwatchInput } from '../../../primitives/tuner/ColorSwatchInput';
import { CodeBlock } from '../../CodeBlock';
import { RL_GLOW_SWATCHES } from './CenterUpperArchetypesAndBackdrop';

export interface CenterUpperTunerSectionProps {
  isLight: boolean;
  showExported5ECode: boolean;
  setShowExported5ECode: React.Dispatch<React.SetStateAction<boolean>>;
  copied5EConfig: boolean;
  handleCopy5EConfig: () => void;
  handleReset5EDefaults: () => void;
  build5EExportCode: () => string;
  glowConfig: CenterUpperGlowConfig;
  setGlowConfig: (
    val:
      | CenterUpperGlowConfig
      | ((prev: CenterUpperGlowConfig) => CenterUpperGlowConfig)
  ) => void;
  syncGlowWithText: boolean;
  setSyncGlowWithText: (val: boolean | ((prev: boolean) => boolean)) => void;
  timingConfig: CenterUpperTimingConfig;
  setTimingConfig: (
    val:
      | CenterUpperTimingConfig
      | ((prev: CenterUpperTimingConfig) => CenterUpperTimingConfig)
  ) => void;
  typoConfig: CenterUpperTypographyConfig;
  setTypoConfig: (
    val:
      | CenterUpperTypographyConfig
      | ((prev: CenterUpperTypographyConfig) => CenterUpperTypographyConfig)
  ) => void;
  countdownIntervalMs: number;
  setCountdownIntervalMs: (val: number | ((prev: number) => number)) => void;
  upperCenterTopPct: number;
  setUpperCenterTopPct: (val: number | ((prev: number) => number)) => void;
  setIsVisibleOnStage: (val: boolean | ((prev: boolean) => boolean)) => void;
  setTriggerNonce: (val: number | ((prev: number) => number)) => void;
}

export const CenterUpperTunerSection: React.FC<CenterUpperTunerSectionProps> = ({
  isLight,
  showExported5ECode,
  setShowExported5ECode,
  copied5EConfig,
  handleCopy5EConfig,
  handleReset5EDefaults,
  build5EExportCode,
  glowConfig,
  setGlowConfig,
  syncGlowWithText,
  setSyncGlowWithText,
  timingConfig,
  setTimingConfig,
  typoConfig,
  setTypoConfig,
  countdownIntervalMs,
  setCountdownIntervalMs,
  upperCenterTopPct,
  setUpperCenterTopPct,
  setIsVisibleOnStage,
  setTriggerNonce,
}) => {
  return (
    <section id="center-upper-tuner" className="grid grid-cols-1 lg:grid-cols-3 gap-5 scroll-mt-24">
      {/* Top Export & Solidify Default Parameters Bar across all 3 columns */}
      <div className={`lg:col-span-3 p-4 rounded-2xl border flex flex-col gap-3 ${ isLight
        ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-md' }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="amber" size="sm" isLight={isLight}>
              5E-2
            </Badge>
            <span className="text-sm font-bold font-mono">参数微调与固化导出 (Tuner &amp; Default Solidifier)</span>
            <span className="text-xs font-mono opacity-65">所有滑块均支持点击数值直接输入精确值；调整完可一键复制 JSON/TS 固化为默认参数</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowExported5ECode((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                showExported5ECode
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 font-bold'
                  : isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showExported5ECode ? '收起参数代码' : '查看可固化默认代码'}</span>
            </button>

            <button type="button" onClick={handleCopy5EConfig} data-ui-action="export-5e-config"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
              copied5EConfig ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400' }`}>
              {copied5EConfig ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>已复制 5E 参数配置 (Copied!)</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>导出 5E 参数配置 (Copy 5E Config)</span>
                </>
              )}
            </button>

            <button type="button" onClick={handleReset5EDefaults} title="重置 5E 全部参数回默认值"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
              isLight ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300' }`}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>重置 5E 默认参数</span>
            </button>
          </div>
        </div>

        {showExported5ECode && (
          <CodeBlock title="当前 5E 调参快照 (可直接粘贴固化为默认值)" language="typescript" isLight={isLight}
            code={build5EExportCode()} />
        )}
      </div>

      {/* Column 1: Rocket League Yellow & Outer Glow (`Out Glow`) Parameters */}
      <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${ isLight
        ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold font-mono">1. 颜色与外发光 (Out Glow Tuner)</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setGlowConfig({ ...DEFAULT_RL_COUNTDOWN_GLOW });
              setIsVisibleOnStage(true);
            }}
            title="重置为默认外发光预设 (强度 100%, 内核 0, 中层 28, 远景 0, 柔光 0)"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>RL Default</span>
          </button>
        </div>

        <ColorSwatchInput label="主文字颜色 (Main Thin Text Color)" description="Rocket League 倒计时默认亮黄 #FFE600"
          value={glowConfig.textColor} onChange={(hex) => { setGlowConfig((prev) => ({ ...prev, textColor: hex,
          ...(syncGlowWithText ? { glowColor: hex, topLabelGlowColor: hex } : {}), })); setIsVisibleOnStage(true);
          }} presets={RL_GLOW_SWATCHES} isLight={isLight} />

        <div className="flex items-center justify-between px-1">
          <ToggleSwitch label="外发光颜色跟随主文字" checked={syncGlowWithText} onCheckedChange={(sync) => {
            setSyncGlowWithText(sync); if (sync) { setGlowConfig((prev) => ({ ...prev, glowColor: prev.textColor,
            topLabelGlowColor: prev.textColor, })); } setIsVisibleOnStage(true); }} isLight={isLight} />
        </div>

        <ColorSwatchInput label="外发光颜色 (Out Glow Color)" description="多层光晕色 (默认琥珀金 #F59E0B)"
          value={glowConfig.glowColor} onChange={(hex) => { setGlowConfig((prev) => ({ ...prev, glowColor: hex,
          topLabelGlowColor: hex, })); setIsVisibleOnStage(true); }} presets={RL_GLOW_SWATCHES} isLight={isLight} />

        <ColorSwatchInput label="上方 Regular 标题颜色 (Top Label)" description="Winner / Status 上方小字颜色"
          value={glowConfig.topLabelColor ?? '#FFFFFF'} onChange={(hex) => { setGlowConfig((prev) => ({ ...prev,
          topLabelColor: hex, })); setIsVisibleOnStage(true); }}
          presets={['#FFFFFF', '#FEF08A', '#E0F2FE', '#FFEDD5', '#FFE600', '#94A3B8']} isLight={isLight} />

        <SliderControl label="Out Glow 发光总强度 (Glow Intensity)" value={glowConfig.intensityPct} min={0} max={200}
          step={1} unit="%" editable allowOutOfBoundsInput colorScheme="amber" onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, intensityPct: v })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <SliderControl label="内核紧贴光晕半径 (Inner Core Blur)" value={glowConfig.innerBlurPx} min={0} max={40} step={1}
          unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, innerBlurPx: v })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <SliderControl label="中层外发光半径 (Outer Glow Blur)" value={glowConfig.outerBlurPx} min={0} max={80} step={1}
          unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, outerBlurPx: v })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <SliderControl label="远景氛围光晕半径 (Ambient Halo Blur)" value={glowConfig.ambientBlurPx} min={0} max={120}
          step={1} unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, ambientBlurPx: v })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <SliderControl label="背景径向柔光烘托 (Backdrop Bloom)" value={glowConfig.backdropBloomPct ?? 0} min={0} max={100}
          step={1} unit="%" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, backdropBloomPct: v })); setIsVisibleOnStage(true); }}
          isLight={isLight} />

        <SliderControl label="字形描边宽度 (Text Stroke Width)" value={glowConfig.strokeWidthPx ?? 0} min={0} max={3}
          step={0.1} unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, strokeWidthPx: v })); setIsVisibleOnStage(true); }} isLight={isLight} />
      </div>

      {/* Column 2: Duration (2000ms Default) & Animation Envelope Tuner */}
      <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${ isLight
        ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold font-mono">2. 持续时间与动效包络 (Duration &amp; Motion)</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setTimingConfig((prev) => ({
                ...DEFAULT_CENTER_UPPER_TIMING,
                persistentInspect: prev.persistentInspect,
              }));
              setCountdownIntervalMs(1000);
              setUpperCenterTopPct(40);
              setIsVisibleOnStage(true);
              setTriggerNonce((n) => n + 1);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>2000ms Default</span>
          </button>
        </div>

        <SliderControl label="单次显示保持时长 (Hold Duration before Exit)"
          description="默认 2000ms (>1s)；出现满 2000ms 后进入 400ms 尾段淡出，中途新数据到来则直接覆盖" value={timingConfig.durationMs}
          min={200} max={5000} step={50} unit="ms" editable allowOutOfBoundsInput colorScheme="amber"
          onChange={(v) => { setTimingConfig((prev) => ({ ...prev, durationMs: v })); setIsVisibleOnStage(true); }}
          isLight={isLight} />

        {/* Quick Duration Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono opacity-65 mr-1">快捷保持时长:</span>
          {[1000, 1500, 2000, 2500, 3000].map((ms) => {
            const active = timingConfig.durationMs === ms;
            return (
              <button
                key={ms}
                type="button"
                onClick={() => {
                  setTimingConfig((prev) => ({ ...prev, durationMs: ms }));
                  setIsVisibleOnStage(true);
                  setTriggerNonce((n) => n + 1);
                }}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] border cursor-pointer transition-all ${
                  active
                    ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                    : isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
              >
                {ms === 2000 ? '2000ms (Default)' : `${ms}ms`}
              </button>
            );
          })}
        </div>

        <SliderControl label="入场缩放冲击倍率 (Entry Scale Pop)" description="默认 1.50x (从 1.50 倍缩回 1.00 倍)；支持直接点击数字输入任意精度"
          value={timingConfig.entryScale} min={0.5} max={2.5} step={0.01} unit="x" editable allowOutOfBoundsInput
          formatValue={(v) => v.toFixed(2)} onChange={(v) => { setTimingConfig((prev) => ({ ...prev,
          entryScale: Number(v.toFixed(2)), })); setIsVisibleOnStage(true); setTriggerNonce((n) => n + 1); }}
          isLight={isLight} />

        <SliderControl label="入场动画耗时 (Entry Pop Duration)" description="默认 400ms，从 1.50x 快速收缩凝聚到 1.00x"
          value={timingConfig.entryDurationMs} min={0} max={1000} step={10} unit="ms" editable
          allowOutOfBoundsInput onChange={(v) => { setTimingConfig((prev) => ({ ...prev, entryDurationMs: v }));
          setIsVisibleOnStage(true); setTriggerNonce((n) => n + 1); }} isLight={isLight} />

        <SliderControl label="尾段淡出耗时 (Exit Fade Duration)" description="默认 400ms；无新数据覆盖时，保持满 2000ms 后执行 400ms 尾段淡出"
          value={timingConfig.exitDurationMs} min={0} max={1000} step={10} unit="ms" editable allowOutOfBoundsInput
          onChange={(v) => { setTimingConfig((prev) => ({ ...prev, exitDurationMs: v }));
          setIsVisibleOnStage(true); setTriggerNonce((n) => n + 1); }} isLight={isLight} />

        <SliderControl label="3-2-1-GO 步进覆盖间隔 (Sequence Step Interval)"
          description="默认 1000ms；前一步尚未进入退出时间即被下一步直接覆盖重播入场动画" value={countdownIntervalMs} min={200} max={3000}
          step={50} unit="ms" editable allowOutOfBoundsInput onChange={(v) => setCountdownIntervalMs(v)}
          isLight={isLight} />

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold font-mono">HudAnchorStage 空间锚点位置 (Upper-Center)</span>
          </div>
          <SliderControl label="中心锚点位置 (Upper-Center Top %)" description="默认 40% (50% 为屏幕正中心)"
            value={upperCenterTopPct} min={15} max={60} step={1} unit="%" editable allowOutOfBoundsInput
            onChange={(v) => { setUpperCenterTopPct(v); setIsVisibleOnStage(true); }} isLight={isLight} />
        </div>
      </div>

      {/* Column 3: Typography Tuner (JetBrains Mono Thin 100 & Regular 400) */}
      <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${ isLight
        ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-bold font-mono">3. 字体层级调参 (JetBrains Mono)</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setTypoConfig({ ...DEFAULT_CENTER_UPPER_TYPOGRAPHY });
              setIsVisibleOnStage(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        <SliderControl label="主信息字号 (Main Thin Font Size)"
          description="用于 3-2-1-GO、BLUE/ORANGE TEAM、WAITING FOR PLAYERS" value={typoConfig.mainFontSizePx} min={36}
          max={136} step={1} unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setTypoConfig((prev) => ({ ...prev, mainFontSizePx: v })); setIsVisibleOnStage(true); }}
          isLight={isLight} />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">主信息字重 (Main Font Weight · 默认 Thin 100)</span>
          <SegmentedSwitch size="sm" fullWidth isLight={isLight} value={String(typoConfig.mainFontWeight)}
            onValueChange={(v) => { setTypoConfig((prev) => ({ ...prev,
            mainFontWeight: Number(v) as 100 | 200 | 300 | 400, })); setIsVisibleOnStage(true); }} options={[
            { value: '100', label: 'Thin (100)' }, { value: '200', label: 'ExtraLight (200)' },
            { value: '300', label: 'Light (300)' }, { value: '400', label: 'Regular (400)' }, ]} />
        </div>

        <SliderControl label="主信息字间距 (Main Letter Spacing · 默认 0)" value={typoConfig.mainLetterSpacingEm}
          min={-0.1} max={0.36} step={0.01} unit="em" editable allowOutOfBoundsInput
          formatValue={(v) => v.toFixed(2)} onChange={(v) => { setTypoConfig((prev) => ({ ...prev,
          mainLetterSpacingEm: Number(v.toFixed(2)), })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex flex-col gap-3">
          <SliderControl label="上方标题字号 (Top Regular Font Size)" description="用于 WINNER 或赛况分类前缀"
            value={typoConfig.topFontSizePx} min={12} max={52} step={1} unit="px" editable allowOutOfBoundsInput
            onChange={(v) => { setTypoConfig((prev) => ({ ...prev, topFontSizePx: v })); setIsVisibleOnStage(true);
            }} isLight={isLight} />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold">上方标题字重 (Top Font Weight · 默认 Regular 400)</span>
            <SegmentedSwitch size="sm" fullWidth isLight={isLight} value={String(typoConfig.topFontWeight)}
              onValueChange={(v) => { setTypoConfig((prev) => ({ ...prev,
              topFontWeight: Number(v) as 100 | 300 | 400 | 500, })); setIsVisibleOnStage(true); }} options={[
              { value: '100', label: 'Thin (100)' }, { value: '300', label: 'Light (300)' },
              { value: '400', label: 'Regular (400)' }, { value: '500', label: 'Medium (500)' }, ]} />
          </div>

          <SliderControl label="上方标题字间距 (Top Letter Spacing · 默认 0)" value={typoConfig.topLetterSpacingEm}
            min={-0.1} max={0.6} step={0.01} unit="em" editable allowOutOfBoundsInput
            formatValue={(v) => v.toFixed(2)} onChange={(v) => { setTypoConfig((prev) => ({ ...prev,
            topLetterSpacingEm: Number(v.toFixed(2)), })); setIsVisibleOnStage(true); }} isLight={isLight} />

          <SliderControl label="上下双行间距 (Line Gap)" value={typoConfig.lineGapPx} min={0} max={28} step={1} unit="px"
            editable allowOutOfBoundsInput onChange={(v) => { setTypoConfig((prev) => ({ ...prev, lineGapPx: v }));
            setIsVisibleOnStage(true); }} isLight={isLight} />

          <div className="flex items-center justify-between pt-1">
            <ToggleSwitch label="强制大写 (Uppercase)" checked={typoConfig.uppercase} onCheckedChange={(v) => {
              setTypoConfig((prev) => ({ ...prev, uppercase: v })); setIsVisibleOnStage(true); }} isLight={isLight} />
            <ToggleSwitch label="斜体动感 (Italic)" checked={typoConfig.italic ?? false} onCheckedChange={(v) => {
              setTypoConfig((prev) => ({ ...prev, italic: v })); setIsVisibleOnStage(true); }} isLight={isLight} />
          </div>
        </div>
      </div>
    </section>
  );
};
