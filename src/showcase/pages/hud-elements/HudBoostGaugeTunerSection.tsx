import React from 'react';
import { useBoostGaugeStore } from '../../../tokens';
import { createScopedSyncedState } from '../../stores';
import { Flame, RotateCcw, Moon, Sun, Copy, Check, Code2 } from 'lucide-react';
import {
  CircularBoostGauge,
  getBoostSegmentColor,
  STEP_12_TIER_PRESETS,
  type BoostColorScheme,
  type BoostColorMode,
  type BoostThemeOverride,
  type HudBoostListener,
} from '../../../hud';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { Badge } from '../../../primitives/Badge';
import { SectionErrorBoundary } from '../../../primitives/SectionErrorBoundary';
import { CodeBlock } from '../../CodeBlock';
import { HudBoostGaugeGeometryControls } from './HudBoostGaugeGeometryControls';

const useState = createScopedSyncedState('hud-5a-5-boost-config');

export interface HudBoostGaugeTunerSectionProps {
  isLight: boolean;
  is120HzLive: boolean;
  setIs120HzLive: (val: boolean) => void;
  boostAmount: number;
  setBoostAmount: (val: number) => void;
  isUnlimitedBoost: boolean;
  setIsUnlimitedBoost: (val: boolean) => void;
  setGaugeSize: (val: number) => void;
  subscribeBoostFn?: (listener: HudBoostListener) => () => void;
}

export const HudBoostGaugeTunerSection: React.FC<HudBoostGaugeTunerSectionProps> = ({
  isLight,
  is120HzLive,
  setIs120HzLive,
  boostAmount,
  setBoostAmount,
  isUnlimitedBoost,
  setIsUnlimitedBoost,
  setGaugeSize,
  subscribeBoostFn,
}) => {
  const boostStore = useBoostGaugeStore();
  const {
    colorScheme,
    colorMode,
    fixedTextColor,
    themeOverride,
    ringInnerPct,
    ringOuterPct,
    lineCap,
    cutoutAngleDeg,
    rotationDeg,
    size: gaugeSize,
    setToken,
    updateTokens,
    resetTokens,
    exportConfigCode,
  } = boostStore;

  const [cutoutInputText, setCutoutInputText] = useState<string>(String(cutoutAngleDeg), 'cutoutInputText');
  const [rotationInputText, setRotationInputText] = useState<string>(String(rotationDeg), 'rotationInputText');
  const [showCode, setShowCode] = React.useState<boolean>(false);
  const [copiedConfig, setCopiedConfig] = React.useState<boolean>(false);

  const setColorScheme = (v: BoostColorScheme) => setToken('colorScheme', v);
  const setColorMode = (v: BoostColorMode) => setToken('colorMode', v);
  const setFixedTextColor = (v: string) => setToken('fixedTextColor', v);
  const setThemeOverride = (v: BoostThemeOverride) => setToken('themeOverride', v);
  const setRingInnerPct = (v: number) => setToken('ringInnerPct', v);
  const setRingOuterPct = (v: number) => setToken('ringOuterPct', v);
  const setLineCap = (v: 'round' | 'butt') => setToken('lineCap', v);
  const setCutoutAngleDeg = (v: number) => setToken('cutoutAngleDeg', v);
  const setRotationDeg = (v: number) => setToken('rotationDeg', v);

  const handleSetGaugeSize = (s: number) => {
    setToken('size', s);
    setGaugeSize(s);
  };

  const handleSetCutoutDeg = (val: number) => {
    const clamped = Math.max(0, Math.min(359, val));
    setCutoutAngleDeg(clamped);
    setCutoutInputText(String(clamped));
  };

  const handleSetRotationDeg = (val: number) => {
    setRotationDeg(val);
    setRotationInputText(String(val));
  };

  const handleResetBoostGaugeConfig = () => {
    resetTokens();
    setCutoutInputText('90');
    setRotationInputText('-45');
    setGaugeSize(148);
  };

  const handleCopyConfig = () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 1800);
  };

  const boostSegment = getBoostSegmentColor(boostAmount, colorScheme);

  const inputCls = isLight
    ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
    : 'bg-neutral-950 border-neutral-700 text-white';

  return (
    <SectionErrorBoundary title="5A.5 · CircularBoostGauge" isLight={isLight}>
      <section id="hud-5a-5-boost-gauge" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800 flex-wrap">
          <div className="h-6 w-6 rounded-md bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs font-mono">
            5A.5
          </div>
          <h2 className="text-base font-bold tracking-tight">
            CircularBoostGauge (高频 120Hz · 全参数化圆形推进量表盘)
          </h2>
          <Badge variant="amber" size="sm" isLight={isLight}>
            120Hz Transient SVG/DOM Ref
          </Badge>
          <span className="text-xs font-mono text-neutral-500">
            起始/结束半径百分比 · 反转底色模式 · Dark Override · 任意裁切角度与开口旋转 · 4色 / 每12一档(9段)双配色
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Preview Stage */}
          <div
            className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col items-center justify-between gap-4 transition-all ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <div className="w-full flex items-center justify-between text-[11px] font-mono opacity-80">
              <span>
                环半径: <strong>{ringInnerPct}%~{ringOuterPct}%</strong>
              </span>
              <span>
                裁切: <strong>{cutoutAngleDeg}°</strong> · 旋转: <strong>{rotationDeg}°</strong>
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center py-4">
              <CircularBoostGauge
                amount={boostAmount}
                isUnlimited={isUnlimitedBoost}
                subscribeBoost={subscribeBoostFn}
                size={gaugeSize}
                isLight={isLight}
                themeOverride={themeOverride}
                ringInnerPct={ringInnerPct}
                ringOuterPct={ringOuterPct}
                lineCap={lineCap}
                cutoutAngleDeg={cutoutAngleDeg}
                rotationDeg={rotationDeg}
                colorScheme={colorScheme}
                colorMode={colorMode}
                fixedTextColor={fixedTextColor}
              />
            </div>

            <div className="w-full flex items-center justify-between text-[11px] font-mono px-2 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <span>
                模式:{' '}
                <strong className="text-amber-500">
                  {colorMode === 'inverted'
                    ? '反转(表盘变色+固定字色)'
                    : colorMode === 'ring-only'
                    ? '仅环变色(固定字色)'
                    : '标准(环+字变色)'}
                </strong>
              </span>
              <span>
                配色:{' '}
                <strong className="text-sky-500">
                  {colorScheme === 'step-12' ? '每12一档(9段)' : '经典4色'}
                </strong>
              </span>
            </div>
          </div>

          {/* Right Configuration Panel */}
          <div
            className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between gap-4 transition-colors shadow-2xs ${
              isLight
                ? 'bg-white border-neutral-200/90 text-neutral-800'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
            }`}
          >
            <div className="flex flex-col gap-3.5">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-2.5 border-neutral-100 dark:border-neutral-800/70 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4" style={{ color: boostSegment.color }} />
                  <span className="text-xs font-bold font-mono tracking-wide">
                    CONFIGURATION PANEL: CIRCULAR BOOST GAUGE (实时同步 5A.S 顶层沙盒)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {is120HzLive ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/40">
                      ⚡ 120Hz SVG/Text Ref 直驱中
                    </span>
                  ) : (
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border"
                      style={{
                        color:
                          !isLight && boostSegment.segmentName === 'black'
                            ? '#e4e4e7'
                            : boostSegment.color,
                        borderColor: `${boostSegment.color}66`,
                      }}
                    >
                      {isUnlimitedBoost
                        ? '-- (UNLIMITED)'
                        : `${boostAmount}% · ${boostSegment.rangeLabel}`}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCode((v) => !v)}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono cursor-pointer transition-all flex items-center gap-1 ${
                      showCode
                        ? 'bg-sky-500 text-white border-sky-500 font-bold'
                        : 'border-neutral-400/40 hover:bg-neutral-500/10'
                    }`}
                  >
                    <Code2 className="h-3 w-3" />
                    <span>{showCode ? '收起代码' : '查看配置代码'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyConfig}
                    className="px-2.5 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] font-mono cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                  >
                    {copiedConfig ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>已复制配置 (Copied!)</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>复制配置 (Copy Config)</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetBoostGaugeConfig}
                    className="px-2 py-0.5 rounded-lg border border-neutral-400/40 text-[11px] font-mono cursor-pointer hover:bg-neutral-500/10 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>重置默认</span>
                  </button>
                </div>
              </div>

              {/* Calibrated Quick Comparison Presets */}
              <div className="flex items-center justify-between gap-2 flex-wrap px-3 py-2 rounded-xl border border-amber-500/25 bg-amber-500/5 font-mono text-[11px]">
                <span className="font-bold text-amber-500">校准预设快捷对比:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      updateTokens({
                        colorScheme: 'step-12',
                        colorMode: 'inverted',
                        fixedTextColor: '#FFFFFF',
                        ringInnerPct: 60,
                        ringOuterPct: 98,
                        lineCap: 'round',
                        cutoutAngleDeg: 90,
                        rotationDeg: -45,
                        size: 148,
                      });
                      setCutoutInputText('90');
                      setRotationInputText('-45');
                      setGaugeSize(148);
                    }}
                    className={`px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                      colorMode === 'inverted' &&
                      colorScheme === 'step-12' &&
                      ringInnerPct === 60 &&
                      ringOuterPct === 98 &&
                      rotationDeg === -45
                        ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                        : 'border-neutral-400/40 hover:bg-neutral-500/10'
                    }`}
                  >
                    方案A: 反转镂空环 (12档 · 空置100-X%透明 · 60%~98% · -45°)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateTokens({
                        colorScheme: 'step-12',
                        colorMode: 'ring-only',
                        fixedTextColor: '#FFFFFF',
                        ringInnerPct: 60,
                        ringOuterPct: 98,
                        lineCap: 'round',
                        cutoutAngleDeg: 90,
                        rotationDeg: -45,
                        size: 148,
                      });
                      setCutoutInputText('90');
                      setRotationInputText('-45');
                      setGaugeSize(148);
                    }}
                    className={`px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                      colorMode === 'ring-only' &&
                      colorScheme === 'step-12' &&
                      ringInnerPct === 60 &&
                      ringOuterPct === 98 &&
                      rotationDeg === -45
                        ? 'bg-sky-500 text-white border-sky-500 font-bold'
                        : 'border-neutral-400/40 hover:bg-neutral-500/10'
                    }`}
                  >
                    方案B: 仅环变色固定白字 (12档 · 圆头60%~98% · -45°)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIs120HzLive(false);
                      setIsUnlimitedBoost(false);
                      setBoostAmount(35);
                    }}
                    className={`px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                      !is120HzLive && boostAmount === 35
                        ? 'bg-emerald-500 text-neutral-950 border-emerald-500 font-bold'
                        : 'border-neutral-400/40 hover:bg-neutral-500/10'
                    }`}
                  >
                    定点 35% 检视 (对比 65% 透明裁切 &amp; 圆头/平切)
                  </button>
                </div>
              </div>

              {showCode && (
                <div className="pt-1">
                  <CodeBlock
                    title="src/tokens/boostGaugeStore.ts (DEFAULT_BOOST_GAUGE_TOKENS)"
                    code={exportConfigCode()}
                    isLight={isLight}
                  />
                </div>
              )}

              {/* 1. Boost Amount Slider & Unlimited Boost + Dark Mode Override */}
              <div className="flex flex-col gap-2">
                <SliderControl
                  label="推进量数值 (拖动滑块将暂停 120Hz 流并切至手动检视)"
                  value={boostAmount}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  colorScheme="sky"
                  isLight={isLight}
                  onChange={(v) => {
                    setIs120HzLive(false);
                    setBoostAmount(v);
                  }}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">无限推进 (`--`):</span>
                    <ToggleSwitch
                      checked={isUnlimitedBoost}
                      onCheckedChange={setIsUnlimitedBoost}
                      isLight={isLight}
                    />
                  </div>

                  {/* Dark Mode Override Selector */}
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-[11px] font-semibold mr-1">Dark Mode Override:</span>
                    {(
                      [
                        { id: 'auto', label: 'Auto (跟随全局)' },
                        { id: 'dark', label: 'Force Dark (暗色覆盖)', icon: Moon },
                        { id: 'light', label: 'Force Light (亮色覆盖)', icon: Sun },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setThemeOverride(opt.id)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] border cursor-pointer transition-all flex items-center gap-1 ${
                          themeOverride === opt.id
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold border-transparent'
                            : 'border-neutral-400/40 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Color Scheme (4-Color vs 12-Step 9-Tier) + Quick Tier Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold">配色方案 (Color Scheme):</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setColorScheme('step-12')}
                      className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                        colorScheme === 'step-12'
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                          : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                      }`}
                    >
                      每 12 一档 · 九段七色+红闪 (T5A.4 Pie)
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorScheme('classic-4')}
                      className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                        colorScheme === 'classic-4'
                          ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-2xs'
                          : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                      }`}
                    >
                      经典四色模式 (0-24/60/96/100)
                    </button>
                  </div>
                </div>

                {colorScheme === 'step-12' ? (
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 font-mono">
                    {STEP_12_TIER_PRESETS.map((item) => {
                      const isActive =
                        !is120HzLive &&
                        ((item.val === 6 && boostAmount < 12) ||
                          (item.val === 18 && boostAmount >= 12 && boostAmount < 24) ||
                          (item.val === 30 && boostAmount >= 24 && boostAmount < 36) ||
                          (item.val === 42 && boostAmount >= 36 && boostAmount < 48) ||
                          (item.val === 54 && boostAmount >= 48 && boostAmount < 60) ||
                          (item.val === 66 && boostAmount >= 60 && boostAmount < 72) ||
                          (item.val === 78 && boostAmount >= 72 && boostAmount < 84) ||
                          (item.val === 90 && boostAmount >= 84 && boostAmount <= 96) ||
                          (item.val === 100 && boostAmount > 96));
                      return (
                        <button
                          key={item.range}
                          type="button"
                          onClick={() => {
                            setIs120HzLive(false);
                            setIsUnlimitedBoost(false);
                            setBoostAmount(item.val);
                          }}
                          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-[10px] cursor-pointer transition-all ${
                            isActive ? 'ring-2 ring-amber-500 font-bold scale-102' : 'opacity-85 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: `${item.hex}20`,
                            borderColor: `${item.hex}80`,
                          }}
                          title={`点击测试 ${item.range} (${item.label})`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full mb-0.5 border border-white/30 ${
                              item.isFlashing ? 'animate-ping' : ''
                            }`}
                            style={{ backgroundColor: item.hex }}
                          />
                          <span className="font-bold leading-tight">{item.range}</span>
                          <span className="text-[9px] opacity-80 leading-tight">
                            {item.label.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        val: 15,
                        label: '0~24 (红)',
                        cls: 'bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500/20',
                      },
                      {
                        val: 45,
                        label: '25~60 (黄)',
                        cls: 'bg-amber-500/10 border-amber-500/40 text-amber-500 hover:bg-amber-500/20',
                      },
                      {
                        val: 80,
                        label: '61~96 (绿)',
                        cls: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/20',
                      },
                      {
                        val: 100,
                        label: '97~100 (浅蓝)',
                        cls: 'bg-sky-500/10 border-sky-500/40 text-sky-500 hover:bg-sky-500/20',
                      },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setIs120HzLive(false);
                          setIsUnlimitedBoost(false);
                          setBoostAmount(item.val);
                        }}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${item.cls}`}
                      >
                        <span>{item.val}%</span>
                        <span className="text-[10px] font-normal opacity-80">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Inverted Color Mode & Fixed Number Color */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold">
                    颜色模式 (标准 vs 反转镂空透明环 vs 仅环变色):
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs flex-wrap">
                    {(
                      [
                        { id: 'inverted', label: '反转 (表盘变色 · 空置100-X%环镂空透明)' },
                        { id: 'ring-only', label: '仅环变色 (数字固定色)' },
                        { id: 'standard', label: '标准 (圆环+数字变色)' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setColorMode(m.id)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] border cursor-pointer transition-all ${
                          colorMode === m.id
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow-2xs'
                            : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {colorMode !== 'standard' && (
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-1.5">
                    <span className="text-[11px] font-semibold">中央数字固定颜色 (`fixedTextColor`):</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { hex: '#FFFFFF', label: '纯白 #FFF' },
                        { hex: '#09090B', label: '纯黑 #09090B' },
                        { hex: '#FDE047', label: '亮金 #FDE047' },
                        { hex: '#38BDF8', label: '冰蓝 #38BDF8' },
                      ].map((sw) => (
                        <button
                          key={sw.hex}
                          type="button"
                          onClick={() => setFixedTextColor(sw.hex)}
                          className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer flex items-center gap-1 ${
                            fixedTextColor.toUpperCase() === sw.hex
                              ? 'ring-2 ring-amber-500 font-bold'
                              : 'opacity-80'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-400"
                            style={{ backgroundColor: sw.hex }}
                          />
                          <span>{sw.label}</span>
                        </button>
                      ))}
                      <input
                        type="color"
                        value={fixedTextColor}
                        onChange={(e) => setFixedTextColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        title="自定义数字固定颜色"
                      />
                    </div>
                  </div>
                )}
              </div>

              <HudBoostGaugeGeometryControls
                isLight={isLight}
                inputCls={inputCls}
                ringInnerPct={ringInnerPct}
                ringOuterPct={ringOuterPct}
                setRingInnerPct={setRingInnerPct}
                setRingOuterPct={setRingOuterPct}
                updateTokens={updateTokens}
                cutoutAngleDeg={cutoutAngleDeg}
                cutoutInputText={cutoutInputText}
                setCutoutInputText={setCutoutInputText}
                setCutoutAngleDeg={setCutoutAngleDeg}
                handleSetCutoutDeg={handleSetCutoutDeg}
                rotationDeg={rotationDeg}
                rotationInputText={rotationInputText}
                setRotationInputText={setRotationInputText}
                setRotationDeg={setRotationDeg}
                handleSetRotationDeg={handleSetRotationDeg}
                gaugeSize={gaugeSize}
                handleSetGaugeSize={handleSetGaugeSize}
                lineCap={lineCap}
                setLineCap={setLineCap}
              />
            </div>
          </div>
        </div>
      </section>
    </SectionErrorBoundary>
  );
};
