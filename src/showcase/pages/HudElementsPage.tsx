import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../stores';

const useState = createScopedSyncedState('page:hud-elements');
import {
  Crosshair,
  Sparkles,
  Zap,
  Play,
  Pause,
} from 'lucide-react';
import {
  StepperScoreboardHUD,
  EdgePlayerHudStrip,
  createHudTransientChannel,
} from '../../hud';
import { Badge } from '../../primitives/Badge';
import { SectionErrorBoundary } from '../../primitives/SectionErrorBoundary';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import { HudSpatialChoreographySandbox } from './hud-elements/HudSpatialChoreographySandbox';
import { EdgeDemoInspectorSection } from './hud-elements/EdgeDemoInspectorSection';
import { HudCoreTriadInspectorSection } from './hud-elements/HudCoreTriadInspectorSection';
import { HudStageAndFollowupSection, type SlotLayoutPreset } from './hud-elements/HudStageAndFollowupSection';

export { type SlotLayoutPreset };

const HUD_5A_DIRECTORY_ITEMS: JumpDirectoryItem[] = [
  {
    id: 'hud-5a-sandbox',
    code: '5A.S',
    name: 'HudSpatialChoreographySandbox',
    label: '寸土寸金全屏排布与瞬态动画沙盒 (顶贴边 + 防穿帮双下巴)',
  },
  {
    id: 'hud-5a-1-scoreboard',
    code: '5A.1',
    name: 'StepperScoreboardHUD',
    label: '上方紧贴直角·下方圆角计分牌 + 防穿帮单/双下巴',
  },
  {
    id: 'hud-5a-2-edge-strip',
    code: '5A.2',
    name: 'EdgePlayerHudStrip',
    label: '3v3 左右严格轴对称单侧圆角条 (Live/Replay/Spectator)',
  },
  {
    id: 'hud-5a-2-demo-inspector',
    code: '5A.2+',
    name: 'EdgeDemoInspectorSection',
    label: '爆炸状态常驻预览与 Bomb SVG 尺寸/粗细/外发光独立工作台',
  },
  {
    id: 'hud-5a-3-ball-cam',
    code: '5A.3',
    name: 'BallCameraIndicator',
    label: '低频离散球视角指示器 (React.memo + subscribeBallCam)',
  },
  {
    id: 'hud-5a-4-velocity-bar',
    code: '5A.4',
    name: 'VelocityProgressBar',
    label: '120Hz 零圆角超音速进度条 (subscribeSpeed DOM Ref)',
  },
  {
    id: 'hud-5a-5-boost-gauge',
    code: '5A.5',
    name: 'CircularBoostGauge',
    label: '120Hz 全参数化圆形推进量表盘 (subscribeBoost SVG Ref)',
  },
  {
    id: 'hud-5a-5s-triad-stage',
    code: '5A.5S',
    name: 'Decoupled 3-Widget Stage',
    label: '高频 Speed/Boost + 低频 BallCam 零耦合插槽排布实验台',
  },
  {
    id: 'hud-5a-6-telemetry-flip',
    code: '5A.6 & 5A.7',
    name: 'CompactTelemetryBarHUD & FlipIndicatorPillHUD',
    label: '左上角 4 指标微胶囊 + 二段跳倒计时状态灯',
  },
  {
    id: 'hud-5a-8-replay-banner',
    code: '5A.8',
    name: 'ReplayControlBannerHUD',
    label: '进球回放顶栏 + 120Hz 进度条 Scrubber Ref',
  },
  {
    id: 'hud-5a-9-kickoff-rhythm',
    code: '5A.9',
    name: 'KickoffRhythmOverlayHUD',
    label: '120Hz 零分配 Canvas 开球音游轨道 + 9键受击行',
  },
];

export const HudElementsPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  // ──────────────────────────────────────────────────────────────────────────
  // Element 1: Ball Camera Indicator State (Low-Frequency Discrete State)
  // ──────────────────────────────────────────────────────────────────────────
  const [ballCamActive, setBallCamActive] = useState<boolean>(true, 'ballCamActive');
  const [ballCamShortcut, setBallCamShortcut] = useState<string | null>('SPACE', 'ballCamShortcut');
  const [ballCamLabel, setBallCamLabel] = useState<string>('BALL CAM', 'ballCamLabel');

  // ──────────────────────────────────────────────────────────────────────────
  // Element 2: Velocity Progress Bar State (Manual Props + 120Hz Transient Channel)
  // ──────────────────────────────────────────────────────────────────────────
  const [speed, setSpeed] = useState<number>(1410, 'speed');
  const [barWidth, setBarWidth] = useState<string>('100%', 'barWidth');
  const [barHeight, setBarHeight] = useState<number>(20, 'barHeight');

  // ──────────────────────────────────────────────────────────────────────────
  // Element 3: Circular Boost Gauge State (Manual Props + 120Hz Transient Channel)
  // ──────────────────────────────────────────────────────────────────────────
  const [boostAmount, setBoostAmount] = useState<number>(35, 'boostAmount');
  const [isUnlimitedBoost, setIsUnlimitedBoost] = useState<boolean>(false, 'isUnlimitedBoost');
  const [gaugeSize, setGaugeSize] = useState<number>(148, 'gaugeSize');

  // ──────────────────────────────────────────────────────────────────────────
  // 120Hz Zero-React-Rerender Transient Channel & Sandbox Controls
  // ──────────────────────────────────────────────────────────────────────────
  const [is120HzLive, setIs120HzLive] = useState<boolean>(true, 'is120HzLive');
  const [slotPreset, setSlotPreset] = useState<SlotLayoutPreset>('classic-triad', 'slotPreset');

  const transientChannelRef = useRef(
    createHudTransientChannel({
      speed: 1410,
      boostAmount: 85,
      isUnlimitedBoost: false,
    })
  );

  // Track React render count to prove 120Hz updates cause 0 React re-renders
  const reactRenderCountRef = useRef<number>(0);
  reactRenderCountRef.current += 1;
  const liveSpeedReadoutRef = useRef<HTMLSpanElement | null>(null);
  const liveBoostReadoutRef = useRef<HTMLSpanElement | null>(null);
  const liveHzReadoutRef = useRef<HTMLSpanElement | null>(null);
  const liveRenderRateRef = useRef<HTMLSpanElement | null>(null);

  // Keep unlimited flag synced to transient channel when toggled manually
  useEffect(() => {
    const ch = transientChannelRef.current;
    ch.setBoost(ch.getBoost().amount, isUnlimitedBoost);
  }, [isUnlimitedBoost]);

  // 120Hz Physics Telemetry Stream Simulator (VSync rAF with clamped dt — Zero React setState!)
  useEffect(() => {
    if (!is120HzLive) return;

    const channel = transientChannelRef.current;
    let rafId = 0;
    let tickCount = 0;
    let ticksThisWindow = 0;
    let lastTime = performance.now();
    let lastWindowMark = lastTime;
    let accumulatorMs = 0;
    let lastRenderSnap = reactRenderCountRef.current;
    let scrollCooldownUntil = 0;
    const stepMs = 1000 / 120;

    const onScrollCapture = () => {
      scrollCooldownUntil = performance.now() + 90;
    };
    window.addEventListener('scroll', onScrollCapture, { capture: true, passive: true });

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      if (now < scrollCooldownUntil || document.hidden) {
        lastTime = now;
        return;
      }

      const dt = Math.min(34, Math.max(0, now - lastTime));
      lastTime = now;
      accumulatorMs += dt;

      let steps = 0;
      let latestSpeed = channel.getSpeed();
      let latestBoost = channel.getBoost().amount;

      while (accumulatorMs >= stepMs && steps < 4) {
        accumulatorMs -= stepMs;
        steps++;
        tickCount += 1;
        ticksThisWindow += 1;

        // Simulate realistic Rocket League acceleration -> supersonic surge -> braking cycle (6s period at 120Hz)
        const t = (tickCount % 720) / 720;
        let simSpeed = 1410;
        let simBoost = 85;

        if (t < 0.25) {
          const p = t / 0.25;
          simSpeed = p * 1410;
          simBoost = Math.max(12, 55 - p * 35);
        } else if (t < 0.6) {
          const p = (t - 0.25) / 0.35;
          simSpeed = 1410 + Math.min(1, p * 1.25) * 885;
          simBoost = p < 0.45 ? 100 - p * 90 : Math.max(4, 60 - (p - 0.45) * 100);
        } else if (t < 0.8) {
          const p = (t - 0.6) / 0.2;
          simSpeed = 2240 + Math.sin(p * Math.PI * 4) * 45;
          simBoost = p > 0.3 ? 100 : 12;
        } else {
          const p = (t - 0.8) / 0.2;
          simSpeed = 2240 - p * 1620;
          simBoost = 100 - p * 45;
        }

        latestSpeed = simSpeed;
        latestBoost = simBoost;
        channel.setSpeed(simSpeed);
        channel.setBoost(simBoost, isUnlimitedBoost);
        channel.setFlipState({
          hasFlip: t < 0.72,
          status: t < 0.15 ? 'grounded' : t < 0.72 ? 'countdown' : 'expired',
          remainingSeconds: t < 0.72 ? Math.max(0, 1.25 * (1 - t / 0.72)) : 0,
        });
        channel.setTelemetrySnapshot({
          fps: 120,
          refreshHz: 120,
          renderScalePct: 100,
          physicsRateHz: 120.0,
          baseLatencyMs: 18 + Math.round(Math.sin(tickCount * 0.05) * 3),
          extraLatencyMs: 0,
        });
        channel.setKickoffFrame({
          episodeTick: tickCount % 240,
        });
      }

      if (steps > 0 && tickCount % 6 === 0) {
        if (liveSpeedReadoutRef.current) {
          liveSpeedReadoutRef.current.textContent = `${Math.round(latestSpeed)} uu/s`;
        }
        if (liveBoostReadoutRef.current) {
          liveBoostReadoutRef.current.textContent = isUnlimitedBoost
            ? '-- (∞)'
            : `${Math.round(latestBoost)}%`;
        }
      }

      if (now - lastWindowMark >= 600) {
        const elapsedSec = (now - lastWindowMark) / 1000;
        const hz = Math.round(ticksThisWindow / elapsedSec);
        const renderDelta = reactRenderCountRef.current - lastRenderSnap;
        const rendersPerSec = Math.round(renderDelta / elapsedSec);

        if (liveHzReadoutRef.current) {
          liveHzReadoutRef.current.textContent = `${hz} Hz`;
        }
        if (liveRenderRateRef.current) {
          liveRenderRateRef.current.textContent = `${rendersPerSec} / sec`;
        }
        ticksThisWindow = 0;
        lastWindowMark = now;
        lastRenderSnap = reactRenderCountRef.current;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollCapture, { capture: true });
    };
  }, [is120HzLive, isUnlimitedBoost]);

  // Toast / Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null, 'toastMsg');
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // 快速情境联动预设
  const applyScenarioPreset = (preset: 'kickoff' | 'defense' | 'supersonic-rush' | 'empty-clutch') => {
    setIs120HzLive(false);
    switch (preset) {
      case 'kickoff':
        setBallCamActive(true);
        setSpeed(1410);
        setBoostAmount(33);
        showToast('已加载预设: 开球冲刺 (Kickoff Rush · 手动模式)');
        break;
      case 'defense':
        setBallCamActive(true);
        setSpeed(750);
        setBoostAmount(12);
        showToast('已加载预设: 门线防守 (Goal Line Defense · 手动模式)');
        break;
      case 'supersonic-rush':
        setBallCamActive(true);
        setSpeed(2280);
        setBoostAmount(99);
        showToast('已加载预设: 超音速突进 (Supersonic Surge · 手动模式)');
        break;
      case 'empty-clutch':
        setBallCamActive(false);
        setSpeed(2300);
        setBoostAmount(0);
        showToast('已加载预设: 零气极速 (Empty Boost Max Speed · 手动模式)');
        break;
    }
  };

  const subscribeSpeedFn = is120HzLive ? transientChannelRef.current.subscribeSpeed : undefined;
  const subscribeBoostFn = is120HzLive ? transientChannelRef.current.subscribeBoost : undefined;
  const subscribeBallCamFn = is120HzLive ? transientChannelRef.current.subscribeBallCam : undefined;
  const handleToggleBallCam = () => {
    if (is120HzLive) {
      transientChannelRef.current.toggleBallCam();
    } else {
      setBallCamActive((prev) => !prev);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      {/* Top Jump Directory */}
      <PageJumpDirectory
        layerTag="Layer 5A · High-Frequency Match HUD Elements"
        title="HUD Elements 独立仪表与空间排布目录"
        subtitle="所有 5A 组件均统一接入 hudTransientChannel 120Hz 瞬态通道（0 React Re-render）并完整支持 Light/Dark 模式切换。"
        items={HUD_5A_DIRECTORY_ITEMS}
        isLight={isLight}
      />

      {/* 顶部标题区 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Crosshair className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">HUD Elements 独立仪表组件</h1>
          <Badge variant="primary" size="sm" isLight={isLight}>
            Standalone · Zero Position Coupling
          </Badge>
          <Badge variant="amber" size="sm" isLight={isLight}>
            120Hz Transient Ref + Low-Freq Memo
          </Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          每个组件均为 100% 布局无关的纯表现块（内部绝不写死 <code className="font-mono">position: absolute</code>）。低频离散组件（<code className="font-mono text-red-500">BallCameraIndicator</code>）采用 <code className="font-mono">React.memo</code> 隔离；高频连续组件（<code className="font-mono text-emerald-500">VelocityProgressBar</code> 与 <code className="font-mono text-sky-500">CircularBoostGauge</code>）支持通过 <code className="font-mono">subscribeSpeed / subscribeBoost</code> 或 <code className="font-mono">ref</code> 瞬态通道直驱 DOM/SVG，在 <strong>120Hz 下实现每秒 0 次 React 重渲染</strong>。
        </p>

        {/* 顶部 120Hz 瞬态引擎开关 + 情境联动测试栏 */}
        <div
          className={`mt-2 p-3.5 rounded-2xl border flex flex-col gap-3 ${
            isLight
              ? 'bg-neutral-50/90 border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/70 border-neutral-800 text-neutral-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIs120HzLive((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                  is120HzLive
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
              >
                {is120HzLive ? (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>⚡ 120Hz 瞬态物理流运行中 (点击切回手动滑块)</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>启动 120Hz 零重绘瞬态物理流 (Start 120Hz Stream)</span>
                  </>
                )}
              </button>

              {is120HzLive && (
                <div
                  className={`flex items-center gap-3 px-3 py-1 rounded-xl border font-mono text-[11px] ${
                    isLight
                      ? 'bg-white border-neutral-200 text-neutral-700'
                      : 'bg-neutral-950/80 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <span>
                    Stream: <strong ref={liveHzReadoutRef} className="text-sky-500">120 Hz</strong>
                  </span>
                  <span className="opacity-30">|</span>
                  <span>
                    React Re-renders:{' '}
                    <strong ref={liveRenderRateRef} className="text-emerald-500">0 / sec</strong>
                  </span>
                  <span className="opacity-30">|</span>
                  <span>
                    Speed: <strong ref={liveSpeedReadoutRef} className="text-amber-500">1410 uu/s</strong>
                  </span>
                  <span className="opacity-30">|</span>
                  <span>
                    Boost: <strong ref={liveBoostReadoutRef} className="text-sky-500">85%</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1 mr-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>静态预设:</span>
              </span>
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
      {/* 5A.S: HUD v2 FULL-VIEWPORT SPATIAL LAYOUT & CHOREOGRAPHY SANDBOX */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="hud-5a-sandbox" className="scroll-mt-24">
        <SectionErrorBoundary
          title="5A.S HudSpatialChoreographySandbox"
          scopePrefix="hud-spatial-sandbox"
          isLight={isLight}
        >
          <HudSpatialChoreographySandbox isLight={isLight} />
        </SectionErrorBoundary>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5A.1 & 5A.2: STEPPER SCOREBOARD HUD & EDGE PLAYER HUD STRIP */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionErrorBoundary title="5A.1 StepperScoreboardHUD" isLight={isLight}>
          <section
            id="hud-5a-1-scoreboard"
            className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="amber" size="sm" isLight={isLight}>
                  5A.1
                </Badge>
                <h2 className="text-sm font-bold font-mono">
                  StepperScoreboardHUD (`top-0` 紧贴上方 · 上直角下圆角)
                </h2>
              </div>
              <Badge variant="primary" size="sm" isLight={isLight}>
                双下巴 `-mt-[6px] pt-[9px]` 防穿帮
              </Badge>
            </div>
            <p className="text-xs opacity-75">
              主计分牌与比分块采用上方紧贴顶边 (<code className="font-mono">rounded-t-none border-t-0</code>)、下方圆角 (<code className="font-mono">rounded-b-[6px]</code>)；单下巴 (<code className="font-mono">z-20</code>) 与 OVERTIME 双下巴 (<code className="font-mono">z-10</code>) 在顶部预留额外隐藏空间以贴合上方圆角，彻底消除圆角接缝穿帮。
            </p>
            <div
              className={`relative h-[156px] rounded-2xl border overflow-hidden flex flex-col items-center justify-start ${
                isLight ? 'bg-slate-200/80 border-neutral-300' : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <StepperScoreboardHUD
                isLight={isLight}
                leftScore={2}
                rightScore={2}
                seconds={0}
                isOvertime={true}
                overtimeChinOpen={true}
                bestOf={5}
                leftSeriesWins={2}
                rightSeriesWins={1}
              />
            </div>
          </section>
        </SectionErrorBoundary>

        <SectionErrorBoundary title="5A.2 EdgePlayerHudStrip" isLight={isLight}>
          <section
            id="hud-5a-2-edge-strip"
            className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="amber" size="sm" isLight={isLight}>
                  5A.2
                </Badge>
                <h2 className="text-sm font-bold font-mono">
                  EdgePlayerHudStrip (左右轴对称单侧圆角条)
                </h2>
              </div>
              <Badge variant="primary" size="sm" isLight={isLight}>
                subscribeRoster · 120Hz Ref
              </Badge>
            </div>
            <p className="text-xs opacity-75">
              左侧贴边右圆角 (<code className="font-mono">rounded-r-[6px]</code>)、右侧贴边左圆角 (<code className="font-mono">rounded-l-[6px]</code>)，支持 Live / Goal Replay / Spectator 三模式滑入滑出与 3.0s 被炸读条。
            </p>
            <div
              className={`relative h-[156px] rounded-2xl border overflow-hidden flex items-center justify-between ${
                isLight ? 'bg-slate-200/80 border-neutral-300' : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <EdgePlayerHudStrip
                side="left"
                teamColor="#2563EB"
                barColor="#3B82F6"
                isLight={isLight}
                viewMode="spectator"
                players={transientChannelRef.current.getRoster().leftPlayers}
                subscribeRoster={transientChannelRef.current.subscribeRoster}
              />
              <EdgePlayerHudStrip
                side="right"
                teamColor="#EA580C"
                barColor="#F97316"
                isLight={isLight}
                viewMode="spectator"
                players={transientChannelRef.current.getRoster().rightPlayers}
                subscribeRoster={transientChannelRef.current.subscribeRoster}
              />
            </div>
          </section>
        </SectionErrorBoundary>
      </div>

      {/* 5A.2+: Dedicated Persistent Demolished Slot & Bomb SVG Size/Style Inspector */}
      <SectionErrorBoundary
        title="5A.2+ EdgeDemoInspectorSection"
        scopePrefix="hud-5a-2-demo-inspector"
        isLight={isLight}
      >
        <EdgeDemoInspectorSection isLight={isLight} />
      </SectionErrorBoundary>

      <SectionErrorBoundary
        title="5A.3 ~ 5A.5 HudCoreTriadInspectorSection"
        scopePrefix="hud-5a-5-boost-config"
        isLight={isLight}
      >
        <HudCoreTriadInspectorSection
          isLight={isLight}
          is120HzLive={is120HzLive}
          setIs120HzLive={setIs120HzLive}
          ballCamActive={ballCamActive}
          setBallCamActive={setBallCamActive}
          ballCamShortcut={ballCamShortcut}
          setBallCamShortcut={setBallCamShortcut}
          ballCamLabel={ballCamLabel}
          setBallCamLabel={setBallCamLabel}
          handleToggleBallCam={handleToggleBallCam}
          subscribeBallCamFn={subscribeBallCamFn}
          speed={speed}
          setSpeed={setSpeed}
          barWidth={barWidth}
          setBarWidth={setBarWidth}
          barHeight={barHeight}
          setBarHeight={setBarHeight}
          subscribeSpeedFn={subscribeSpeedFn}
          boostAmount={boostAmount}
          setBoostAmount={setBoostAmount}
          isUnlimitedBoost={isUnlimitedBoost}
          setIsUnlimitedBoost={setIsUnlimitedBoost}
          gaugeSize={gaugeSize}
          setGaugeSize={setGaugeSize}
          subscribeBoostFn={subscribeBoostFn}
        />
      </SectionErrorBoundary>

      <SectionErrorBoundary
        title="5A.6 ~ 5A.9 HudStageAndFollowupSection"
        isLight={isLight}
      >
        <HudStageAndFollowupSection
          isLight={isLight}
          is120HzLive={is120HzLive}
          slotPreset={slotPreset}
          setSlotPreset={setSlotPreset}
          ballCamActive={ballCamActive}
          subscribeBallCamFn={subscribeBallCamFn}
          ballCamShortcut={ballCamShortcut}
          ballCamLabel={ballCamLabel}
          handleToggleBallCam={handleToggleBallCam}
          speed={speed}
          subscribeSpeedFn={subscribeSpeedFn}
          boostAmount={boostAmount}
          isUnlimitedBoost={isUnlimitedBoost}
          subscribeBoostFn={subscribeBoostFn}
          transientChannel={transientChannelRef.current}
        />
      </SectionErrorBoundary>
    </div>
  );
};
