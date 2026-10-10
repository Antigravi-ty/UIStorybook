import React, { useState } from 'react';
import {
  Crosshair,
  Gauge,
  Flame,
  Zap,
  Sliders,
  Sparkles,
  Layers,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  BallCameraIndicator,
  VelocityProgressBar,
  CircularBoostGauge,
  getBoostSegmentColor,
} from '../../hud';
import { SliderControl } from '../../primitives/SliderControl';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { KeycapBadge } from '../../primitives/KeycapBadge';
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
  const [showMilestone2300, setShowMilestone2300] = useState<boolean>(true);
  const [barHeight, setBarHeight] = useState<number>(12);

  // 计算非线性百分比显示
  const computeSpeedPercent = (v: number): number => {
    const s = Math.max(0, Math.min(2300, Math.round(v)));
    if (s <= 1410) return (s / 1410) * 40;
    if (s < 2200) return 40 + ((s - 1410) / (2200 - 1410)) * 45;
    return 85 + ((s - 2200) / (2300 - 2200)) * 15;
  };
  const currentSpeedPercent = computeSpeedPercent(speed);

  // ──────────────────────────────────────────────────────────────────────────
  // Element 3: Circular Boost Gauge State
  // ──────────────────────────────────────────────────────────────────────────
  const [boostAmount, setBoostAmount] = useState<number>(85);
  const [isFiring, setIsFiring] = useState<boolean>(false);
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
        setIsFiring(false);
        showToast('已加载预设: 开球冲刺 (Kickoff Rush)');
        break;
      case 'defense':
        setBallCamActive(true);
        setSpeed(750);
        setBoostAmount(12);
        setIsFiring(false);
        showToast('已加载预设: 门线残局防守 (Goal Line Defense)');
        break;
      case 'supersonic-rush':
        setBallCamActive(true);
        setSpeed(2280);
        setBoostAmount(99);
        setIsFiring(true);
        showToast('已加载预设: 超音速进攻喷射 (Supersonic Surge)');
        break;
      case 'empty-clutch':
        setBallCamActive(false);
        setSpeed(2300);
        setBoostAmount(0);
        setIsFiring(false);
        showToast('已加载预设: 零推进极速极限 (Empty Boost Max Speed)');
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
          从复杂对局层中彻底解耦的原子级核心仪表。涵盖原版 Rocket League
          风格球视角指示器、非线性 0 延迟速度进度条与四色阶梯圆形推进量表盘。每个组件均可独立导入，指哪儿打哪儿，互不受影响。
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
            Rocket League 经典红点态 + 键位指示
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 左侧：Live Preview 画板 */}
          <div
            className={`lg:col-span-5 p-8 rounded-3xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            {/* 装饰性网格背景 */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                LIVE COMPONENT PREVIEW (点击直接测试)
              </span>

              {/* 核心 Element 1 组件实例 */}
              <BallCameraIndicator
                active={ballCamActive}
                shortcut={ballCamShortcut}
                label={ballCamLabel}
                actionText="TO TOGGLE"
                isLight={isLight}
                onToggle={() => {
                  setBallCamActive((prev) => !prev);
                  showToast(`球视角状态已变更为: ${!ballCamActive ? '启用 (BALL CAM)' : '关闭 (CAR CAM)'}`);
                }}
              />

              <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mt-2">
                <span>当前状态:</span>
                <span
                  className={`font-bold ${
                    ballCamActive ? 'text-red-500 font-black' : isLight ? 'text-neutral-500' : 'text-neutral-400'
                  }`}
                >
                  {ballCamActive ? '● BALL CAM (视角锁定球心)' : '○ CAR CAM (车身第一人称视角)'}
                </span>
              </div>
            </div>
          </div>

          {/* 右侧：Element 1 专属控制面板 (Configuration Panel) */}
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
                <Badge
                  variant={ballCamActive ? 'danger' : 'neutral'}
                  size="sm"
                  isLight={isLight}
                >
                  {ballCamActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>

              {/* 控制项 1: 启用 / 未启用 开关 */}
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">主状态开关 (Enabled / Active)</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    开启时左侧红点呈现高光发光态，关闭时暗化为非激活态
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
                    [{ballCamShortcut || '无'}]
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
                        ? 'bg-neutral-500 text-white'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    隐藏按键
                  </button>
                </div>
              </div>

              {/* 控制项 3: 自定义主文案 */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <span className="text-xs font-semibold">指示文字 (Label Text)</span>
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

            {/* 说明小贴士 */}
            <div
              className={`p-3 rounded-2xl text-[11px] font-mono flex items-start gap-2 border ${
                isLight
                  ? 'bg-red-50/70 border-red-200/80 text-red-950'
                  : 'bg-red-950/20 border-red-900/40 text-red-300'
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-red-500 mt-1 shrink-0" />
              <span>
                规范对齐：保持原版 Rocket League 经典的红点指示灯 + 大写粗体 BALL CAM + 下方按键操作指引，同时使用 UIStorybook 规范的 KeycapBadge 与圆角微毛玻璃面板。
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
          <div className="h-6 w-6 rounded-md bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs font-mono">
            02
          </div>
          <h2 className="text-base font-bold tracking-tight">
            Element 2: Velocity Progress Bar (解耦非线性速度进度条)
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            无延迟实时进度条 · 85% 超音速小竖线 · 仅保留 2300 刻度
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 左侧：Live Preview 画板 */}
          <div
            className={`lg:col-span-5 p-8 rounded-3xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center gap-5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                LIVE COMPONENT PREVIEW
              </span>

              {/* 核心 Element 2 组件实例 */}
              <div className="w-full max-w-[380px] p-4 rounded-2xl border bg-black/20 backdrop-blur-xs flex flex-col gap-2 border-neutral-800/40">
                <VelocityProgressBar
                  speed={speed}
                  maxSpeed={2300}
                  supersonicThreshold={2200}
                  showMilestone2300={showMilestone2300}
                  barHeight={barHeight}
                  isLight={isLight}
                />
              </div>

              {/* 辅助读数监控 */}
              <div className="flex items-center justify-between w-full max-w-[380px] px-2 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500">速度:</span>
                  <strong className="text-base font-black text-sky-500 tabular-nums">
                    {speed}
                  </strong>
                  <span className="text-[10px] text-neutral-400">uu/s</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500">进度:</span>
                  <strong className="font-mono text-neutral-300 tabular-nums">
                    {currentSpeedPercent.toFixed(1)}%
                  </strong>
                  {speed >= 2200 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                      SUPERSONIC
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：Element 2 专属控制面板 (Configuration Panel) */}
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
                  <Gauge className="h-4 w-4 text-sky-500" />
                  <span className="text-xs font-bold font-mono tracking-wide">
                    CONFIGURATION PANEL: VELOCITY PROGRESS BAR
                  </span>
                </div>
                <span className="font-mono text-xs text-sky-500 font-bold">
                  {speed} / 2300 uu/s
                </span>
              </div>

              {/* 滑块：速度调节 */}
              <SliderControl
                label="实时速度模拟 (Speed Velocity)"
                value={speed}
                min={0}
                max={2300}
                step={10}
                unit=" uu/s"
                colorScheme="sky"
                isLight={isLight}
                onChange={setSpeed}
              />

              {/* 关键速度预设快捷按钮 */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <span className="text-xs font-semibold">关键动力学分段快捷跳转</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpeed(0)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      speed === 0
                        ? 'bg-sky-500 text-white border-sky-500 font-bold'
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
                        ? 'bg-sky-500 text-white border-sky-500 font-bold'
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
                        ? 'bg-sky-500 text-white border-sky-500 font-bold'
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
                        ? 'bg-sky-500 text-white border-sky-500 font-bold'
                        : isLight
                        ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    2300 (极速 100%)
                  </button>
                </div>
              </div>

              {/* 细节开关 */}
              <div className="flex flex-col gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">右下角仅保留 2300 刻度指示</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      彻底去除多余的 0 / 1410 / 2200 标尺，仅保留终点 2300 极速
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={showMilestone2300}
                    onCheckedChange={setShowMilestone2300}
                    isLight={isLight}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">进度条粗细尺寸 (Height)</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {[8, 12, 16].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setBarHeight(h)}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          barHeight === h
                            ? 'bg-sky-500 text-white font-bold'
                            : isLight
                            ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        {h}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 动力学映射说明 */}
            <div
              className={`p-3 rounded-2xl text-[11px] font-mono flex items-start gap-2 border ${
                isLight
                  ? 'bg-sky-50/70 border-sky-200/80 text-sky-950'
                  : 'bg-sky-950/20 border-sky-900/40 text-sky-300'
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-sky-500 mt-1 shrink-0" />
              <span>
                非线性动力学模型：0-1410 uu/s 占 40%，1410-2200 uu/s 占 45%（2200 uu/s 处清晰标出右侧小竖线），2200-2300 uu/s 占剩余 15%。去除了全屏紫光变色干扰，纯净 0ms 无延迟。
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
          <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs font-mono">
            03
          </div>
          <h2 className="text-base font-bold tracking-tight">
            Element 3: Circular Boost Gauge (四色分段圆形推进量表盘)
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            0~24 红 · 25~60 黄 · 61~96 绿 · 97~100 浅蓝
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 左侧：Live Preview 画板 */}
          <div
            className={`lg:col-span-5 p-8 rounded-3xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
              isLight
                ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                LIVE COMPONENT PREVIEW
              </span>

              {/* 核心 Element 3 组件实例 */}
              <CircularBoostGauge
                amount={boostAmount}
                isFiring={isFiring}
                size={gaugeSize}
                isLight={isLight}
              />

              {/* 当前分段色块标牌 */}
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors shadow-xs"
                style={{
                  backgroundColor: `${boostSegment.color}15`,
                  borderColor: `${boostSegment.color}50`,
                  color: boostSegment.color,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full shadow-xs"
                  style={{ backgroundColor: boostSegment.color }}
                />
                <span>当前分段: {boostSegment.rangeLabel}</span>
              </div>
            </div>
          </div>

          {/* 右侧：Element 3 专属控制面板 (Configuration Panel) */}
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
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: boostSegment.color }}
                >
                  {boostAmount}% (Color: {boostSegment.color})
                </span>
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

              {/* 点火模拟 & 尺寸 */}
              <div className="flex flex-col gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">模拟点火喷射 (Firing State)</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      开启时表盘微缩放呈现高能量光晕背光与火焰图标
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={isFiring}
                    onCheckedChange={setIsFiring}
                    isLight={isLight}
                  />
                </div>

                <div className="flex items-center justify-between">
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
            </div>

            {/* 色彩引擎规范说明 */}
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
                四段精准色阶：<strong>0~24</strong> (危急红色 #ef4444)；<strong>25~60</strong> (警戒黄色 #f59e0b)；<strong>61~96</strong> (充足绿色 #10b981)；<strong>97~100</strong> (充盈浅蓝 #0ea5e9，对齐 Match HUD 下方速度菜单蓝)。环形弧长与中央大字色阶完全同步。
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

// 1. 球视角指示器 (原版 Rocket League 规范)
<BallCameraIndicator 
  active={isBallCamActive} 
  shortcut="SPACE" 
  onToggle={() => setBallCamActive(v => !v)} 
/>

// 2. 速度非线性无延迟进度条 (仅右下角 2300 刻度，85% 超音速小竖线)
<VelocityProgressBar 
  speed={currentSpeedUuPerSec} 
  maxSpeed={2300} 
  showMilestone2300={true} 
/>

// 3. 四色分段圆形推进量表盘 (0~24红, 25~60黄, 61~96绿, 97~100浅蓝)
<CircularBoostGauge 
  amount={boostAmount} 
  isFiring={isBurningBoost} 
  size={148} 
/>`}
        />
      </section>
    </div>
  );
};
