import React from 'react';
import { Sliders, Gauge } from 'lucide-react';
import { BallCameraIndicator } from '../../../hud/BallCameraIndicator';
import { VelocityProgressBar, getVelocityBarColor } from '../../../hud/VelocityProgressBar';
import { type HudSpeedListener, type HudBoostListener, type HudBallCamListener } from '../../../hud/types';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { Badge } from '../../../primitives/Badge';
import { SectionErrorBoundary } from '../../../primitives/SectionErrorBoundary';
import { HudBoostGaugeTunerSection } from './HudBoostGaugeTunerSection';

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
  const velocityStatus = getVelocityBarColor(speed);

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
      <HudBoostGaugeTunerSection
        isLight={isLight}
        is120HzLive={is120HzLive}
        setIs120HzLive={setIs120HzLive}
        boostAmount={boostAmount}
        setBoostAmount={setBoostAmount}
        isUnlimitedBoost={isUnlimitedBoost}
        setIsUnlimitedBoost={setIsUnlimitedBoost}
        setGaugeSize={setGaugeSize}
        subscribeBoostFn={subscribeBoostFn}
      />
    </>
  );
});

HudCoreTriadInspectorSection.displayName = 'HudCoreTriadInspectorSection';
