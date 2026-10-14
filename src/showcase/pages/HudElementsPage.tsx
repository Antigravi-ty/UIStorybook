import React, { useState } from 'react';
import {
  Crosshair,
  Gauge,
  Flame,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  BallCameraIndicator,
  VelocityProgressBar,
  CircularBoostGauge,
  getBoostSegmentColor,
  getVelocityBarColor,
} from '../../hud';
import { SliderControl } from '../../primitives/SliderControl';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';

export const HudElementsPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // ──────────────────────────────────────────────────────────────────────────
  // Element 1: Ball Camera Indicator State
  // ──────────────────────────────────────────────────────────────────────────
  const [ballCamActive, setBallCamActive] = useState<boolean>(true);
  const [ballCamShortcut, setBallCamShortcut] = useState<string | null>('SPACE');
  const [ballCamLabel, setBallCamLabel] = useState<string>('BALL CAM');

  // ──────────────────────────────────────────────────────────────────────────
  // Element 2: Velocity Progress Bar State
  // ──────────────────────────────────────────────────────────────────────────
  const [speed, setSpeed] = useState<number>(1410);
  const [barWidth, setBarWidth] = useState<string>('100%');
  const [barHeight, setBarHeight] = useState<number>(20);

  const velocityStatus = getVelocityBarColor(speed);

  // ──────────────────────────────────────────────────────────────────────────
  // Element 3: Circular Boost Gauge State
  // ──────────────────────────────────────────────────────────────────────────
  const [boostAmount, setBoostAmount] = useState<number>(85);
  const [gaugeSize, setGaugeSize] = useState<number>(148);

  const boostSegment = getBoostSegmentColor(boostAmount);

  // Toast / Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // 快速情境联动预设
  const applyScenarioPreset = (preset: 'kickoff' | 'defense' | 'supersonic-rush' | 'empty-clutch') => {
    switch (preset) {
      case 'kickoff':
        setBallCamActive(true);
        setSpeed(1410);
        setBoostAmount(33);
        showToast('已加载预设: 开球冲刺 (Kickoff Rush)');
        break;
      case 'defense':
        setBallCamActive(true);
        setSpeed(750);
        setBoostAmount(12);
        showToast('已加载预设: 门线防守 (Goal Line Defense)');
        break;
      case 'supersonic-rush':
        setBallCamActive(true);
        setSpeed(2280);
        setBoostAmount(99);
        showToast('已加载预设: 超音速突进 (Supersonic Surge)');
        break;
      case 'empty-clutch':
        setBallCamActive(false);
        setSpeed(2300);
        setBoostAmount(0);
        showToast('已加载预设: 零气极速 (Empty Boost Max Speed)');
        break;
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      {/* 顶部标题区 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Crosshair className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">HUD Elements 独立仪表组件</h1>
          <Badge variant="primary" size="sm" isLight={isLight}>
            Standalone
          </Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          为方便业务端直接引用并植入游戏，左侧展示区仅呈现 Component 本身，不添加任何额外指示杂物；所有状态监控、参数滑块与控制项均收敛于右侧控制面板。
        </p>

        {/* 顶部一键情境联动测试栏 */}
        <div
          className={`mt-2 p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
            isLight
              ? 'bg-neutral-50/80 border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-mono font-medium">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>情境联动快速测试 (Global Presets):</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => applyScenarioPreset('kickoff')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              开球冲刺 (Kickoff)
            </button>
            <button
              type="button"
              onClick={() => applyScenarioPreset('defense')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              门线防守 (Defense)
            </button>
            <button
              type="button"
              onClick={() => applyScenarioPreset('supersonic-rush')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                isLight
                  ? 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-900'
                  : 'bg-sky-950/40 hover:bg-sky-900/50 border-sky-700/60 text-sky-300'
              }`}
            >
              超音速突进 (Supersonic)
            </button>
            <button
              type="button"
              onClick={() => applyScenarioPreset('empty-clutch')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              零气极速 (Empty Boost)
            </button>
          </div>
        </div>

        {/* Toast 提示浮条 */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 text-white font-mono text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ELEMENT 1: BALL CAMERA INDICATOR */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
          <div className="h-6 w-6 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs font-mono">
            01
          </div>
          <h2 className="text-base font-bold tracking-tight">
            Element 1: Ball Camera Indicator (球视角指示器)
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            左侧两行大红标 · 右侧上下分栏左对齐
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 左侧：纯净展示区 (仅包含组件本身，零任何指示杂物) */}
          <div
            className={`lg:col-span-5 p-8 rounded-3xl border flex items-center justify-center transition-all ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <BallCameraIndicator
              active={ballCamActive}
              shortcut={ballCamShortcut}
              label={ballCamLabel}
              actionText="TO TOGGLE"
              isLight={isLight}
              onToggle={() => setBallCamActive((prev) => !prev)}
            />
          </div>

          {/* 右侧：Element 1 专属控制面板 (所有杂物、状态指示与控制项均在此) */}
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
                    CONFIGURATION PANEL: BALL CAMERA
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

              {/* 控制项 1: 启用 / 未启用 开关 */}
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">主状态开关 (Active Toggle)</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    开启时左侧红标高亮并发光，关闭时暗化为非激活态
                  </span>
                </div>
                <ToggleSwitch
                  checked={ballCamActive}
                  onCheckedChange={setBallCamActive}
                  isLight={isLight}
                />
              </div>

              {/* 控制项 2: 快捷键位设定 */}
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

              {/* 控制项 3: 自定义主文案 */}
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

            {/* 说明贴士 */}
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ELEMENT 2: VELOCITY PROGRESS BAR */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
          <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs font-mono">
            02
          </div>
          <h2 className="text-base font-bold tracking-tight">
            Element 2: Velocity Progress Bar (纯粹方角速度进度条)
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            零圆角 · 背景透明 · 高饱和金绿紫动态演进 · 85% 竖线
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 左侧：纯净展示区 (仅包含组件本身，零任何指示杂物) */}
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
                width={barWidth}
                height={barHeight}
              />
            </div>
          </div>

          {/* 右侧：Element 2 专属控制面板 (所有杂物、状态指示与控制项均在此) */}
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
                  <Gauge className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold font-mono tracking-wide">
                    CONFIGURATION PANEL: VELOCITY PROGRESS BAR
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
                </div>
              </div>

              {/* 滑块：速度调节 */}
              <SliderControl
                label="实时速度模拟 (Speed Velocity)"
                value={speed}
                min={0}
                max={2300}
                step={10}
                unit=" uu/s"
                colorScheme="emerald"
                isLight={isLight}
                onChange={setSpeed}
              />

              {/* 关键速度预设快捷按钮 */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <span className="text-xs font-semibold">三段动力学关键节点快捷跳转</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpeed(0)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      speed === 0
                        ? 'bg-amber-500 text-black border-amber-500 font-bold'
                        : isLight
                        ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    0 (静止 0%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeed(1410)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      speed === 1410
                        ? 'bg-amber-500 text-black border-amber-500 font-bold'
                        : isLight
                        ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    1410 (巡航 40%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeed(2200)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      speed === 2200
                        ? 'bg-purple-600 text-white border-purple-600 font-bold'
                        : isLight
                        ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    2200 (竖线 85%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeed(2300)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      speed === 2300
                        ? 'bg-purple-600 text-white border-purple-600 font-bold'
                        : isLight
                        ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    2300 (极速 100%)
                  </button>
                </div>
              </div>

              {/* 尺寸调节：宽度与高度 */}
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

            {/* 色彩引擎规范说明 */}
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
                色彩算法规范：0~1410 纯金黄 (#d4af37)；1410~2200 由中速暗绿 (#77ca7a) 线性过渡至亮绿 (#59f168)；&gt;=2200 瞬转纯紫 (#a020f0) 并启动超音速心跳呼吸特效。无圆角方框，0ms 无延迟。
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ELEMENT 3: CIRCULAR BOOST GAUGE (FOUR-TIER COLOR ENGINE) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
          <div className="h-6 w-6 rounded-md bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs font-mono">
            03
          </div>
          <h2 className="text-base font-bold tracking-tight">
            Element 3: Circular Boost Gauge (轻量等宽字体推进量表盘)
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            无点火特效 · SF Mono / JetBrains Mono · 4 阶梯精准色相
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 左侧：纯净展示区 (仅包含组件本身，零任何指示杂物) */}
          <div
            className={`lg:col-span-5 p-8 rounded-3xl border flex items-center justify-center transition-all ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <CircularBoostGauge
              amount={boostAmount}
              size={gaugeSize}
              isLight={isLight}
            />
          </div>

          {/* 右侧：Element 3 专属控制面板 (所有杂物、状态指示与控制项均在此) */}
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
                  <Flame className="h-4 w-4" style={{ color: boostSegment.color }} />
                  <span className="text-xs font-bold font-mono tracking-wide">
                    CONFIGURATION PANEL: CIRCULAR BOOST GAUGE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: boostSegment.color }}
                  />
                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: boostSegment.color }}
                  >
                    {boostAmount}% ({boostSegment.rangeLabel})
                  </span>
                </div>
              </div>

              {/* 滑块：推进量调节 */}
              <SliderControl
                label="推进量数值 (Boost Amount)"
                value={boostAmount}
                min={0}
                max={100}
                step={1}
                unit="%"
                colorScheme={
                  boostSegment.segmentName === 'sky'
                    ? 'sky'
                    : boostSegment.segmentName === 'yellow'
                    ? 'amber'
                    : boostSegment.segmentName === 'green'
                    ? 'emerald'
                    : 'orange'
                }
                isLight={isLight}
                onChange={setBoostAmount}
              />

              {/* 四个颜色区间的精准跳转 */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <span className="text-xs font-semibold">四阶梯色彩阈值快捷测试</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setBoostAmount(15)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500/20"
                  >
                    <span>15%</span>
                    <span className="text-[10px] font-normal opacity-80">0~24 (红)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoostAmount(45)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all bg-amber-500/10 border-amber-500/40 text-amber-500 hover:bg-amber-500/20"
                  >
                    <span>45%</span>
                    <span className="text-[10px] font-normal opacity-80">25~60 (黄)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoostAmount(80)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all bg-emerald-500/10 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/20"
                  >
                    <span>80%</span>
                    <span className="text-[10px] font-normal opacity-80">61~96 (绿)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoostAmount(100)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all bg-sky-500/10 border-sky-500/40 text-sky-500 hover:bg-sky-500/20"
                  >
                    <span>100%</span>
                    <span className="text-[10px] font-normal opacity-80">97~100 (浅蓝)</span>
                  </button>
                </div>
              </div>

              {/* 表盘尺寸调节 */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <span className="text-xs font-semibold">表盘外径尺寸 (Size)</span>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {[128, 148, 168].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setGaugeSize(s)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
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
              </div>
            </div>

            {/* 色彩引擎与字体规范说明 */}
            <div
              className="p-3 rounded-2xl text-[11px] font-mono flex items-start gap-2 border transition-colors"
              style={{
                backgroundColor: `${boostSegment.color}10`,
                borderColor: `${boostSegment.color}40`,
                color: isLight ? '#0f172a' : '#f8fafc',
              }}
            >
              <div
                className="h-2 w-2 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: boostSegment.color }}
              />
              <span>
                高频更新精简规范：完全移除点火/喷射及多余光晕特效；表盘数值与标签严格锁定等宽字体（优先 SF Mono，其次 JetBrains Mono）；四色分段严格受控（0-24 红 #ef4444 / 25-60 黄 #f59e0b / 61-96 绿 #10b981 / 97-100 浅蓝 #0ea5e9）。
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Agent Code Recipe Snippet */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold">Agent 复制调用配方 (Code Recipe)</h3>
        </div>
        <CodeBlock
          isLight={isLight}
          title="独立 HUD 仪表组件使用示例"
          code={`import { BallCameraIndicator, VelocityProgressBar, CircularBoostGauge } from '@/hud';

// 1. 球视角指示器 (左侧两行大红点，右侧上下两半分栏左对齐)
<BallCameraIndicator 
  active={isBallCamActive} 
  shortcut="SPACE" 
  onToggle={() => setBallCamActive(v => !v)} 
/>

// 2. 纯粹方角无延迟速度进度条 (高饱和金绿紫动态演进，85% 超音速小竖线，透明背景)
<VelocityProgressBar 
  speed={currentSpeedUuPerSec} 
  width="100%" 
  height={20} 
/>

// 3. 极简轻量圆形推进量表盘 (等宽字体 SF Mono / JetBrains Mono，四色精准分段)
<CircularBoostGauge 
  amount={boostAmount} 
  size={148} 
/>`}
        />
      </section>
    </div>
  );
};
