import React from 'react';
import { useBoostGaugeStore } from '../../../tokens';
import { createScopedSyncedState } from '../../stores';
import { Sliders, Gauge, Flame, RotateCcw, Moon, Sun, Copy, Check, Code2 } from 'lucide-react';
import {
  BallCameraIndicator,
  VelocityProgressBar,
  CircularBoostGauge,
  getVelocityBarColor,
  getBoostSegmentColor,
  STEP_12_TIER_PRESETS,
  type BoostColorScheme,
  type BoostColorMode,
  type BoostThemeOverride,
  type HudSpeedListener,
  type HudBoostListener,
  type HudBallCamListener,
} from '../../../hud';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { Badge } from '../../../primitives/Badge';
import { SectionErrorBoundary } from '../../../primitives/SectionErrorBoundary';
import { CodeBlock } from '../../CodeBlock';

const useState = createScopedSyncedState('hud-5a-5-boost-config');

export interface HudCoreTriadInspectorSectionProps {
  isLight: boolean;
  is120HzLive: boolean;
  setIs120HzLive: (val: boolean) => void;
  ballCamActive: boolean;
  setBallCamActive: (val: boolean) => void;
  ballCamShortcut: string | null;
  setBallCamShortcut: (val: string | null) => void;
  ballCamLabel: string;
  setBallCamLabel: (val: string) => void;
  handleToggleBallCam: () => void;
  subscribeBallCamFn?: (listener: HudBallCamListener) => () => void;
  speed: number;
  setSpeed: (val: number) => void;
  barWidth: string;
  setBarWidth: (val: string) => void;
  barHeight: number;
  setBarHeight: (val: number) => void;
  subscribeSpeedFn?: (listener: HudSpeedListener) => () => void;
  boostAmount: number;
  setBoostAmount: (val: number) => void;
  isUnlimitedBoost: boolean;
  setIsUnlimitedBoost: (val: boolean) => void;
  gaugeSize: number;
  setGaugeSize: (val: number) => void;
  subscribeBoostFn?: (listener: HudBoostListener) => () => void;
}

export const HudCoreTriadInspectorSection = React.memo<HudCoreTriadInspectorSectionProps>(({
  isLight,
  is120HzLive,
  setIs120HzLive,
  ballCamActive,
  setBallCamActive,
  ballCamShortcut,
  setBallCamShortcut,
  ballCamLabel,
  setBallCamLabel,
  handleToggleBallCam,
  subscribeBallCamFn,
  speed,
  setSpeed,
  barWidth,
  setBarWidth,
  barHeight,
  setBarHeight,
  subscribeSpeedFn,
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

  const velocityStatus = getVelocityBarColor(speed);
  const boostSegment = getBoostSegmentColor(boostAmount, colorScheme);

  const inputCls = isLight
    ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
    : 'bg-neutral-950 border-neutral-700 text-white';


  return (
    <>
      {/* ELEMENT 1: BALL CAMERA INDICATOR (LOW-FREQUENCY DISCRETE) */}
      <SectionErrorBoundary title="5A.3 BallCameraIndicator" isLight={isLight}>
        <section id="hud-5a-3-ball-cam" className="flex flex-col gap-4 scroll-mt-24">
          <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800 flex-wrap">
            <div className="h-6 w-6 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs font-mono">
              5A.3
            </div>
          <h2 className="text-base font-bold tracking-tight">
            BallCameraIndicator (低频离散 · 球视角指示器)
          </h2>
          <Badge variant="neutral" size="sm" isLight={isLight}>
            Low-Frequency · React.memo Isolated
          </Badge>
          <span className="text-xs font-mono text-neutral-500">
            左侧两行大红标 · 右侧上下分栏左对齐
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div
            className={`lg:col-span-5 p-8 rounded-3xl border flex items-center justify-center transition-all ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <BallCameraIndicator
              active={ballCamActive}
              subscribeBallCam={subscribeBallCamFn}
              shortcut={ballCamShortcut}
              label={ballCamLabel}
              actionText="TO TOGGLE"
              isLight={isLight}
              onToggle={handleToggleBallCam}
            />
          </div>

          <div
            className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between gap-5 transition-colors shadow-2xs ${
              isLight
                ? 'bg-white border-neutral-200/90 text-neutral-800'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2.5 border-neutral-100 dark:border-neutral-800/70">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold font-mono tracking-wide">
                    CONFIGURATION PANEL: BALL CAMERA (LOW-FREQ)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-neutral-500">
                    {ballCamActive ? '● BALL CAM' : '○ CAR CAM'}
                  </span>
                  <Badge
                    variant={ballCamActive ? 'danger' : 'neutral'}
                    size="sm"
                    isLight={isLight}
                  >
                    {ballCamActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">主状态开关 (Active Toggle)</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    仅在按键切换事件触发时重渲染 1 次，与 120Hz 速度/推进量更新完全解耦
                  </span>
                </div>
                <ToggleSwitch
                  checked={ballCamActive}
                  onCheckedChange={setBallCamActive}
                  isLight={isLight}
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">按键绑定提示 (Keycap Shortcut)</span>
                  <span className="text-xs font-mono text-amber-500 font-bold">
                    [{ballCamShortcut || '已隐藏'}]
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {['SPACE', 'Y', '△', 'B', 'SHIFT', 'C'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setBallCamShortcut(k)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium border cursor-pointer transition-all ${
                        ballCamShortcut === k
                          ? 'bg-red-500 text-white border-red-500 font-bold shadow-xs'
                          : isLight
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBallCamShortcut(null)}
                    className={`px-2 py-1 rounded-xl text-xs font-mono cursor-pointer ${
                      ballCamShortcut === null
                        ? 'bg-neutral-500 text-white font-bold'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    隐藏按键
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <span className="text-xs font-semibold">主标题文本 (Label Text)</span>
                <div className="flex items-center gap-1.5">
                  {['BALL CAM', 'BALL CAMERA'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBallCamLabel(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        ballCamLabel === t
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                          : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl text-[11px] font-mono flex items-start gap-2 border ${
                isLight
                  ? 'bg-red-50/70 border-red-200/80 text-red-950'
                  : 'bg-red-950/20 border-red-900/40 text-red-300'
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-red-500 mt-1 shrink-0" />
              <span>
                结构说明：容器左右分列。左侧为约占两行高度的发光红标；右侧文本上下分两行且左对齐，上层粗体大字，下层按键操作说明。
              </span>
            </div>
          </div>
        </div>
      </section>
      </SectionErrorBoundary>

      {/* ELEMENT 2: VELOCITY PROGRESS BAR (120HZ HIGH-FREQUENCY TRANSIENT) */}
      <SectionErrorBoundary title="5A.4 · VelocityProgressBar" isLight={isLight}>
      <section id="hud-5a-4-velocity-bar" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800 flex-wrap">
          <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs font-mono">
            5A.4
          </div>
          <h2 className="text-base font-bold tracking-tight">
            VelocityProgressBar (高频 120Hz · 纯粹方角速度进度条)
          </h2>
          <Badge variant="amber" size="sm" isLight={isLight}>
            120Hz Transient DOM Ref (0 React Re-render)
          </Badge>
          <span className="text-xs font-mono text-neutral-500">
            零圆角 · 背景透明 · 高饱和金绿紫动态演进 · 85% 竖线
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div
            className={`lg:col-span-5 p-8 rounded-3xl border flex items-center justify-center transition-all ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <div className="w-full flex items-center justify-center">
              <VelocityProgressBar
                speed={speed}
                subscribeSpeed={subscribeSpeedFn}
                width={barWidth}
                height={barHeight}
              />
            </div>
          </div>

          <div
            className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between gap-5 transition-colors shadow-2xs ${
              isLight
                ? 'bg-white border-neutral-200/90 text-neutral-800'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2.5 border-neutral-100 dark:border-neutral-800/70 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold font-mono tracking-wide">
                    CONFIGURATION PANEL: VELOCITY PROGRESS BAR
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {is120HzLive ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/40">
                      ⚡ 120Hz 瞬态通道直驱中 (0 React Re-render)
                    </span>
                  ) : (
                    <>
                      <div
                        className="h-2.5 w-2.5 shadow-xs"
                        style={{ backgroundColor: velocityStatus.color }}
                      />
                      <span
                        className="font-mono text-xs font-black tabular-nums"
                        style={{ color: velocityStatus.color }}
                      >
                        {speed} uu/s ({velocityStatus.percent.toFixed(1)}%)
                      </span>
                      {velocityStatus.isSupersonic && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-bold border border-purple-500/40 animate-pulse">
                          SUPERSONIC
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <SliderControl
                label="实时速度模拟 (拖动滑块将暂停 120Hz 流并切至手动检视)"
                value={speed}
                min={0}
                max={2300}
                step={10}
                unit=" uu/s"
                colorScheme="emerald"
                isLight={isLight}
                onChange={(v) => {
                  setIs120HzLive(false);
                  setSpeed(v);
                }}
              />

              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <span className="text-xs font-semibold">三段动力学关键节点快捷跳转</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 0, label: '0 (静止 0%)', activeCls: 'bg-amber-500 text-black border-amber-500 font-bold' },
                    { val: 1410, label: '1410 (巡航 40%)', activeCls: 'bg-amber-500 text-black border-amber-500 font-bold' },
                    { val: 2200, label: '2200 (竖线 85%)', activeCls: 'bg-purple-600 text-white border-purple-600 font-bold' },
                    { val: 2300, label: '2300 (极速 100%)', activeCls: 'bg-purple-600 text-white border-purple-600 font-bold' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setIs120HzLive(false);
                        setSpeed(item.val);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                        !is120HzLive && speed === item.val
                          ? item.activeCls
                          : isLight
                          ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                          : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">外框宽度 (Width)</span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {['100%', '360px', '280px'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setBarWidth(w)}
                        className={`px-2 py-0.5 rounded transition-all ${
                          barWidth === w
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                            : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">高度 (Height)</span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {[12, 16, 20, 24].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setBarHeight(h)}
                        className={`px-2 py-0.5 rounded transition-all ${
                          barHeight === h
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                            : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {h}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded-2xl text-[11px] font-mono flex items-start gap-2 border transition-colors"
              style={{
                backgroundColor: `${velocityStatus.color}15`,
                borderColor: `${velocityStatus.color}40`,
                color: isLight ? '#0f172a' : '#f8fafc',
              }}
            >
              <div
                className="h-2 w-2 mt-1 shrink-0"
                style={{ backgroundColor: velocityStatus.color }}
              />
              <span>
                色彩算法规范：0~1410 纯金黄 (#d4af37)；1410~2200 由中速暗绿 (#77ca7a) 线性过渡至亮绿 (#59f168)；&gt;=2200 瞬转纯紫 (#a020f0) 并启动超音速心跳呼吸特效。通过 Ref 直改 DOM style，120Hz 零重绘。
              </span>
            </div>
          </div>
        </div>
      </section>
      </SectionErrorBoundary>

      {/* ELEMENT 3: CIRCULAR BOOST GAUGE (120HZ HIGH-FREQUENCY TRANSIENT) */}
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
                    定点 35% 检视 (对比 65% 透明裁切 & 圆头/平切)
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

              {/* 4. Outer Ring Thickness: Start % (ringInnerPct) & End % (ringOuterPct) */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold">
                    外框粗细 · 底部大圆起始百分比 (`{ringInnerPct}%`) 与结束百分比 (`{ringOuterPct}%`):
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[11px] flex-wrap">
                    {[
                      { label: '60%~98% (校准默认·圆头推荐)', inner: 60, outer: 98 },
                      { label: '50%~55% (细内环)', inner: 50, outer: 55 },
                      { label: '72%~84% (经典中等)', inner: 72, outer: 84 },
                      { label: '60%~100% (粗环贴外沿)', inner: 60, outer: 100 },
                      { label: '76%~100% (中环贴外沿)', inner: 76, outer: 100 },
                      { label: '0%~100% (实心扇形饼图)', inner: 0, outer: 100 },
                    ].map((p) => {
                      const active = ringInnerPct === p.inner && ringOuterPct === p.outer;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            updateTokens({
                              ringInnerPct: p.inner,
                              ringOuterPct: p.outer,
                            });
                          }}
                          className={`px-2 py-0.5 rounded border cursor-pointer transition-all ${
                            active
                              ? 'bg-sky-600 text-white border-sky-600 font-bold'
                              : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] opacity-80">起始半径百分比 (Start %):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={98}
                          step={1}
                          value={ringInnerPct}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (!Number.isNaN(v)) {
                              const nextInner = Math.max(0, Math.min(98, v));
                              setRingInnerPct(nextInner);
                              if (ringOuterPct <= nextInner) {
                                setRingOuterPct(Math.min(100, nextInner + 2));
                              }
                            }
                          }}
                          className={`w-14 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${inputCls}`}
                        />
                        <span className="text-[11px] opacity-70">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={96}
                      step={1}
                      value={ringInnerPct}
                      onChange={(e) => {
                        const nextInner = Number(e.target.value);
                        setRingInnerPct(nextInner);
                        if (ringOuterPct <= nextInner) {
                          setRingOuterPct(Math.min(100, nextInner + 2));
                        }
                      }}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] opacity-80">结束半径百分比 (End % · 100%贴边):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={2}
                          max={100}
                          step={1}
                          value={ringOuterPct}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (!Number.isNaN(v)) {
                              const nextOuter = Math.max(2, Math.min(100, v));
                              setRingOuterPct(nextOuter);
                              if (ringInnerPct >= nextOuter) {
                                setRingInnerPct(Math.max(0, nextOuter - 2));
                              }
                            }
                          }}
                          className={`w-14 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${inputCls}`}
                        />
                        <span className="text-[11px] opacity-70">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={100}
                      step={1}
                      value={ringOuterPct}
                      onChange={(e) => {
                        const nextOuter = Number(e.target.value);
                        setRingOuterPct(nextOuter);
                        if (ringInnerPct >= nextOuter) {
                          setRingInnerPct(Math.max(0, nextOuter - 2));
                        }
                      }}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Cutout Angle (0°~359°) & Rotation Angle (Any Number Text Input + Presets) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                {/* Cutout Angle */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">裁切角度 (`cutoutAngleDeg`)</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="text"
                        value={cutoutInputText}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setCutoutInputText(raw);
                          const parsed = parseFloat(raw);
                          if (!Number.isNaN(parsed)) {
                            setCutoutAngleDeg(Math.max(0, Math.min(359.5, parsed)));
                          }
                        }}
                        placeholder="任意度数"
                        className={`w-16 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${inputCls}`}
                      />
                      <span className="text-xs opacity-70">°</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={300}
                    step={1}
                    value={Math.min(300, cutoutAngleDeg)}
                    onChange={(e) => handleSetCutoutDeg(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                    {[
                      { deg: 0, label: '0° 完整圆环' },
                      { deg: 60, label: '60° 微裁' },
                      { deg: 90, label: '90° 默认' },
                      { deg: 120, label: '120° 大圆弧' },
                      { deg: 180, label: '180° 半圆' },
                    ].map((preset) => (
                      <button
                        key={preset.deg}
                        type="button"
                        onClick={() => handleSetCutoutDeg(preset.deg)}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer transition-all ${
                          Math.abs(cutoutAngleDeg - preset.deg) < 0.1
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                            : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotation Angle / Opening Direction */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">旋转角度 / 开口方向 (`rotationDeg`)</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="text"
                        value={rotationInputText}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setRotationInputText(raw);
                          const parsed = parseFloat(raw);
                          if (!Number.isNaN(parsed)) {
                            setRotationDeg(parsed);
                          }
                        }}
                        placeholder="任意度数"
                        className={`w-16 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${inputCls}`}
                      />
                      <span className="text-xs opacity-70">°</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={Math.max(-180, Math.min(180, rotationDeg))}
                    onChange={(e) => handleSetRotationDeg(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                    {[
                      { deg: 0, label: '开口朝下(0°)' },
                      { deg: -45, label: '开口朝右下(-45°)' },
                      { deg: -90, label: '开口朝右(-90°)' },
                      { deg: 45, label: '开口朝左下(+45°)' },
                      { deg: 90, label: '开口朝左(+90°)' },
                      { deg: 180, label: '开口朝上(180°)' },
                    ].map((preset) => (
                      <button
                        key={preset.deg}
                        type="button"
                        onClick={() => handleSetRotationDeg(preset.deg)}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer transition-all ${
                          Math.abs(rotationDeg - preset.deg) < 0.1
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                            : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. Size & LineCap */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-xs font-semibold mr-1">表盘外径 (Size):</span>
                  {[128, 148, 168, 188].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSetGaugeSize(s)}
                      className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        gaugeSize === s
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                          : isLight
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {s}px
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-xs font-semibold">端点样式 (LineCap):</span>
                  {(['round', 'butt'] as const).map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setLineCap(cap)}
                      className={`px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                        lineCap === cap
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                          : 'border-neutral-400/40 opacity-75'
                      }`}
                    >
                      {cap === 'round' ? 'Round (圆头)' : 'Butt (平切)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </SectionErrorBoundary>
    </>
  );
});

HudCoreTriadInspectorSection.displayName = 'HudCoreTriadInspectorSection';
