import React, { useState, useEffect, useRef } from 'react';
import {
  Gauge,
  Trophy,
  Flame,
  Zap,
  Eye,
  RefreshCw,
  Sparkles,
  MessageSquare,
  Ruler,
  Check,
  Play,
  RotateCcw,
  Sliders,
  Settings2,
  Clock,
  Layers,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';
import {
  MatchHudContainer,
  HudThemeStyle,
  MatchScoreState,
  BoostState,
  BallCamState,
  SpeedState,
  FlipTimerState,
  AccoladeEvent,
  QuickChatMessage,
  MatchHudVisibilityConfig
} from '../../hud';
import { GameViewport } from '../../viewport/GameViewport';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';

export interface MatchHudPreviewPageProps {
  isLight?: boolean;
}

export type ArenaLightingPreset = 'daylight' | 'twilight' | 'night';

export const MatchHudPreviewPage: React.FC<MatchHudPreviewPageProps> = ({
  isLight = false,
}) => {
  // Theme and presentation style
  const [themeStyle, setThemeStyle] = useState<HudThemeStyle>('glass');
  const [boostVariant, setBoostVariant] = useState<'circular' | 'linear'>('circular');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Arena backdrop controls (亮色/暗色球场环境控制器)
  const [arenaLighting, setArenaLighting] = useState<ArenaLightingPreset>('night');
  const [arenaBrightness, setArenaBrightness] = useState<number>(30);
  const [hudColorway, setHudColorway] = useState<'auto' | 'light' | 'dark'>('auto');

  // Match Score state
  const [score, setScore] = useState<MatchScoreState>({
    blueScore: 3,
    orangeScore: 2,
    timeRemainingSec: 184, // 03:04
    isOvertime: false,
    gameMode: '3v3 SOCCAR',
    blueTeamName: 'BLUE',
    orangeTeamName: 'ORANGE',
  });

  // Kickoff Countdown (-1 = none, 3, 2, 1, 0)
  const [kickoffCount, setKickoffCount] = useState<number>(-1);

  // Boost State
  const [boost, setBoost] = useState<BoostState>({
    amount: 72,
    isInfinite: false,
    isFiring: false,
  });

  // Ball Cam State
  const [ballCam, setBallCam] = useState<BallCamState>({
    isBallCam: true,
    ballAngleDeg: 65,
    distanceToBallMeters: 28.4,
  });

  // Speed State
  const [speed, setSpeed] = useState<SpeedState>({
    speed: 1650,
    maxSpeed: 2300,
    unit: 'uu/s',
    isSupersonic: false,
  });

  // Flip Timer State
  const [flipTimer, setFlipTimer] = useState<FlipTimerState>({
    status: 'grounded',
    timerRemainingSec: 1.5,
    maxTimerSec: 1.5,
    wheelContacts: [true, true, true, true],
  });

  // Accolade Events
  const [events, setEvents] = useState<AccoladeEvent[]>([]);

  // Quick Chat Messages
  const [chatMessages, setChatMessages] = useState<QuickChatMessage[]>([
    { id: '1', team: 'blue', sender: 'Octane_99', text: 'I got it!', timestamp: Date.now() - 4000 },
    { id: '2', team: 'orange', sender: 'Fennec_Pro', text: 'Defending...', timestamp: Date.now() - 2000 },
  ]);

  // Visibility Config
  const [visibility, setVisibility] = useState<MatchHudVisibilityConfig>({
    showScoreboard: true,
    showKickoffCountdown: true,
    showBoostGauge: true,
    showBallCamIndicator: true,
    showSpeedometer: true,
    showFlipTimer: true,
    showMatchEvents: true,
    showQuickChat: true,
    showNetworkDiagnostics: true,
  });

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2400);
  };

  // Effective HUD light mode
  const effectiveHudIsLight =
    hudColorway === 'auto'
      ? arenaLighting === 'daylight' || arenaBrightness >= 60
      : hudColorway === 'light';

  // Flip Timer Tick interval
  const flipTimerRef = useRef<number | null>(null);
  const startFlipCooldown = () => {
    if (flipTimerRef.current) clearInterval(flipTimerRef.current);
    setFlipTimer({
      status: 'timer',
      timerRemainingSec: 1.5,
      maxTimerSec: 1.5,
      wheelContacts: [false, false, false, false],
    });

    const startTime = Date.now();
    const duration = 1500;

    flipTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);

      if (remaining <= 0) {
        if (flipTimerRef.current) clearInterval(flipTimerRef.current);
        setFlipTimer((prev) => ({
          ...prev,
          status: 'expired',
          timerRemainingSec: 0,
        }));
      } else {
        setFlipTimer((prev) => ({
          ...prev,
          status: 'timer',
          timerRemainingSec: remaining,
        }));
      }
    }, 30);
  };

  // Trigger Flip Reset
  const triggerFlipReset = () => {
    if (flipTimerRef.current) clearInterval(flipTimerRef.current);
    setFlipTimer({
      status: 'reset-ready',
      timerRemainingSec: 1.5,
      maxTimerSec: 1.5,
      wheelContacts: [true, true, true, true],
    });
    showToast('✓ 触发四轮触球重置 (Flip Reset Active!)');
  };

  // Reset to Grounded
  const resetToGrounded = () => {
    if (flipTimerRef.current) clearInterval(flipTimerRef.current);
    setFlipTimer({
      status: 'grounded',
      timerRemainingSec: 1.5,
      maxTimerSec: 1.5,
      wheelContacts: [true, true, true, true],
    });
  };

  // Trigger Kickoff Countdown
  const triggerKickoffSequence = () => {
    setKickoffCount(3);
    const timers = [
      setTimeout(() => setKickoffCount(2), 1000),
      setTimeout(() => setKickoffCount(1), 2000),
      setTimeout(() => setKickoffCount(0), 3000),
      setTimeout(() => setKickoffCount(-1), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  };

  // Trigger Accolade Event
  const triggerAccolade = (type: AccoladeEvent['type'], title: string, subtitle?: string) => {
    const newEvent: AccoladeEvent = {
      id: String(Date.now()),
      type,
      title,
      subtitle,
      player: 'Octane_99',
      team: 'blue',
      speedKmh: Math.round(speed.speed * 0.036),
      timestamp: Date.now(),
    };
    setEvents([newEvent]);
    setTimeout(() => {
      setEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
    }, 2800);
  };

  // Trigger Quick Chat Message
  const triggerChatMessage = (text: string, team: 'blue' | 'orange' = 'blue') => {
    const newMsg: QuickChatMessage = {
      id: String(Date.now()),
      sender: team === 'blue' ? 'Octane_99' : 'Dominus_RL',
      team,
      text,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev.slice(-3), newMsg]);
  };

  // Preset Scenario loader
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'kickoff':
        setScore((s) => ({ ...s, blueScore: 0, orangeScore: 0, timeRemainingSec: 300, isOvertime: false }));
        setBoost({ amount: 33, isInfinite: false, isFiring: false });
        setSpeed({ speed: 0, maxSpeed: 2300, unit: 'uu/s', isSupersonic: false });
        resetToGrounded();
        triggerKickoffSequence();
        showToast('已加载预设: 开球准备 (Kickoff Setup)');
        break;
      case 'fast-break':
        setScore((s) => ({ ...s, blueScore: 2, orangeScore: 1, timeRemainingSec: 215, isOvertime: false }));
        setBoost({ amount: 65, isInfinite: false, isFiring: false });
        setSpeed({ speed: 1850, maxSpeed: 2300, unit: 'uu/s', isSupersonic: false });
        setBallCam({ isBallCam: true, ballAngleDeg: 45, distanceToBallMeters: 22 });
        resetToGrounded();
        showToast('已加载预设: 高速进攻 (Fast Break)');
        break;
      case 'supersonic':
        setScore((s) => ({ ...s, blueScore: 3, orangeScore: 2, timeRemainingSec: 140, isOvertime: false }));
        setBoost({ amount: 95, isInfinite: false, isFiring: true });
        setSpeed({ speed: 2280, maxSpeed: 2300, unit: 'uu/s', isSupersonic: true });
        showToast('已加载预设: 超音速等离子激波 (Supersonic Surge)');
        break;
      case 'aerial-flip':
        setBoost({ amount: 45, isInfinite: false, isFiring: false });
        setSpeed({ speed: 1550, maxSpeed: 2300, unit: 'uu/s', isSupersonic: false });
        startFlipCooldown();
        showToast('已加载预设: 空中机动 (Aerial & 1.5s Flip Cooldown)');
        break;
      case 'flip-reset':
        setBoost({ amount: 20, isInfinite: false, isFiring: false });
        setSpeed({ speed: 1200, maxSpeed: 2300, unit: 'uu/s', isSupersonic: false });
        triggerFlipReset();
        triggerChatMessage('Great pass!', 'blue');
        break;
      case 'goal-event':
        setScore((s) => ({ ...s, blueScore: s.blueScore + 1 }));
        triggerAccolade('goal', 'GOAL!', 'OCTANE_99 SCORED');
        triggerChatMessage('Nice shot!', 'orange');
        showToast('已加载预设: 破门得分 (Goal Scored)');
        break;
      case 'overtime':
        setScore((s) => ({ ...s, blueScore: 2, orangeScore: 2, timeRemainingSec: 72, isOvertime: true }));
        showToast('已加载预设: 加时赛决胜 (Overtime Match)');
        break;
    }
  };

  // Compute stage style based on arena lighting and brightness
  const getStageStyles = (): React.CSSProperties => {
    const norm = arenaBrightness / 100;
    if (arenaLighting === 'daylight') {
      return {
        backgroundImage: `
          radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.8) 0%, transparent 60%),
          radial-gradient(circle at 20% 85%, rgba(34, 197, 94, 0.35) 0%, transparent 50%),
          radial-gradient(circle at 80% 85%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
          linear-gradient(to bottom, #7dd3fc 0%, #bae6fd 30%, #bbf7d0 65%, #22c55e 100%)
        `,
        filter: `brightness(${0.75 + norm * 0.45})`,
      };
    }
    if (arenaLighting === 'twilight') {
      return {
        backgroundImage: `
          radial-gradient(circle at 50% 25%, rgba(251, 146, 60, 0.35) 0%, transparent 60%),
          radial-gradient(circle at 80% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 20% 90%, rgba(16, 185, 129, 0.25) 0%, transparent 50%),
          linear-gradient(to bottom, #1e1b4b 0%, #4c1d95 35%, #831843 65%, #064e3b 100%)
        `,
        filter: `brightness(${0.65 + norm * 0.5})`,
      };
    }
    // night
    return {
      backgroundImage: `
        radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
        radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.12) 0%, transparent 50%),
        linear-gradient(to bottom, #09090b 0%, #111827 50%, #030712 100%)
      `,
      filter: `brightness(${0.5 + norm * 0.8})`,
    };
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Gauge className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Match HUD 实时预览</h1>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              对局平视显示层 (HUD Layer) · 与菜单系统层 (Menu Layer) 严格解耦
            </span>
          </div>
        </div>

        {/* Right Controls: Theme Style & Layout Data Export */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {/* Export Layout Snapshot */}
          <button
            type="button"
            onClick={async () => {
              const stage = document.getElementById('match-hud-viewport-stage');
              if (!stage) return;
              const winW = window.innerWidth;
              const winH = window.innerHeight;
              const hudLayer = stage.querySelector<HTMLElement>('[data-ui-layer="match-hud"]');
              const scoreboard = stage.querySelector<HTMLElement>('[data-ui-element="hud-scoreboard"]');
              const boostGauge = stage.querySelector<HTMLElement>('[data-ui-element="hud-boost-gauge"]');
              const ballCamEl = stage.querySelector<HTMLElement>('[data-ui-element="hud-ballcam-indicator"]');
              const speedEl = stage.querySelector<HTMLElement>('[data-ui-element="hud-speedometer"]');
              const flipEl = stage.querySelector<HTMLElement>('[data-ui-element="hud-flip-timer"]');
              const netEl = stage.querySelector<HTMLElement>('[data-ui-element="hud-network-diagnostics"]');

              const getRectStr = (r: DOMRect) =>
                `${Math.round(r.width * 10) / 10}px × ${Math.round(r.height * 10) / 10}px (x: ${Math.round(r.x)}, y: ${Math.round(r.y)})`;

              const lines: string[] = [];
              lines.push('========================================================================');
              lines.push(' [MATCH HUD LAYER TELEMETRY SNAPSHOT]');
              lines.push('========================================================================');
              lines.push(`• Window Viewport:   ${winW}px × ${winH}px`);
              if (hudLayer) lines.push(`• HUD Root Layer:    ${getRectStr(hudLayer.getBoundingClientRect())}`);
              if (scoreboard) lines.push(`• Scoreboard:        ${getRectStr(scoreboard.getBoundingClientRect())}`);
              if (boostGauge) lines.push(`• Boost Gauge:       ${getRectStr(boostGauge.getBoundingClientRect())}`);
              if (ballCamEl) lines.push(`• Ball Cam Pill:     ${getRectStr(ballCamEl.getBoundingClientRect())}`);
              if (speedEl) lines.push(`• Speedometer:       ${getRectStr(speedEl.getBoundingClientRect())}`);
              if (flipEl) lines.push(`• Flip Timer:        ${getRectStr(flipEl.getBoundingClientRect())}`);
              if (netEl) lines.push(`• Network Diagnostics: ${getRectStr(netEl.getBoundingClientRect())}`);
              lines.push('========================================================================\n');

              const report = lines.join('\n');
              console.log(report);
              if (navigator.clipboard?.writeText) {
                try {
                  await navigator.clipboard.writeText(report);
                  showToast('✓ HUD 布局尺寸已输出至控制台并复制到剪贴板');
                } catch (_) {
                  showToast('✓ HUD 布局尺寸已输出至控制台');
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-medium transition-all active:scale-95 cursor-pointer bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 shadow-2xs"
            title="打印并复制当前 Match HUD 各控件的实际位置与尺寸数据"
          >
            <Ruler className="h-3.5 w-3.5 text-emerald-500" />
            <span>导出当前 HUD 布局数据</span>
          </button>

          {/* Theme Style Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setThemeStyle('glass')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                themeStyle === 'glass'
                  ? 'bg-emerald-500 text-white font-bold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Apple Glass (晶莹磨砂)
            </button>
            <button
              type="button"
              onClick={() => setThemeStyle('tactile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                themeStyle === 'tactile'
                  ? 'bg-emerald-500 text-white font-bold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Nintendo Arcade (高对比电竞)
            </button>
            <button
              type="button"
              onClick={() => setThemeStyle('minimal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                themeStyle === 'minimal'
                  ? 'bg-emerald-500 text-white font-bold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Minimal Pro (极简)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Preset Scenarios Quick Loader */}
      <div
        className={`p-4 rounded-2xl border flex flex-col gap-3 transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>快速情境预设 (Quick Scenarios)</span>
          </div>
          {feedbackToast && (
            <span className="text-emerald-500 font-mono font-bold flex items-center gap-1">
              <Check className="h-3 w-3" />
              {feedbackToast}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('kickoff')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 shadow-xs"
          >
            <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>开球准备 (Kickoff 3-2-1)</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('fast-break')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 shadow-xs"
          >
            <Gauge className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
            <span>高速进攻 (Fast Attack)</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('supersonic')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700/60 shadow-xs"
          >
            <Zap className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
            <span>超音速激波 (Supersonic Surge)</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('aerial-flip')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>空中 1.5s 翻滚倒计时 (Dodge Window)</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('flip-reset')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 dark:border-amber-600/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>四轮触球重置 (Flip Reset Active!)</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('goal-event')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-700/60 shadow-xs"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>进球结算横幅 (Goal Celebration)</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('overtime')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-300 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700/60 shadow-xs"
          >
            <Flame className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>加时赛决胜 (Overtime Thriller)</span>
          </button>
        </div>
      </div>

      {/* 2.5 Arena Backdrop Lighting Controller (场景背景亮度与亮色调控制器) */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Sun className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              场景背景亮度与球场环境 (Arena Backdrop & Lighting)
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              测试 HUD 在亮色日间球场与暗色夜场之间的双模适应度
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          {/* Lighting Presets */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => {
                setArenaLighting('daylight');
                setArenaBrightness(85);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                arenaLighting === 'daylight'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sun className="h-3 w-3" />
              <span>日光球场 (Daylight)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setArenaLighting('twilight');
                setArenaBrightness(55);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                arenaLighting === 'twilight'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sunset className="h-3 w-3" />
              <span>黄昏晚霞 (Twilight)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setArenaLighting('night');
                setArenaBrightness(25);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                arenaLighting === 'night'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Moon className="h-3 w-3" />
              <span>夜间电竞 (Night)</span>
            </button>
          </div>

          {/* Brightness Slider */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl border bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 min-w-[170px]">
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 whitespace-nowrap">亮度:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={arenaBrightness}
              onChange={(e) => setArenaBrightness(Number(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-[11px] font-bold text-neutral-700 dark:text-neutral-300 w-8 text-right">
              {arenaBrightness}%
            </span>
          </div>

          {/* HUD Colorway Mode */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700">
            <span className="text-[11px] px-1 text-neutral-500 dark:text-neutral-400">HUD:</span>
            {(['auto', 'light', 'dark'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setHudColorway(m)}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  hudColorway === m
                    ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Live 18:9 Canvas Simulation Stage */}
      <div
        id="match-hud-viewport-stage"
        className="relative w-full h-[540px] md:h-[620px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300"
        style={getStageStyles()}
      >
        {/* Synthetic pitch markings */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          arenaLighting === 'daylight' ? 'opacity-40' : 'opacity-25'
        }`}>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white shadow-xs -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full border-2 border-white shadow-xs -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-white -translate-x-1/2 -translate-y-1/2 shadow-xs" />
        </div>

        {/* Dynamic Supersonic Speed Lines Ripple effect */}
        {(speed.speed >= 2200 || speed.isSupersonic) && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-60">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(168,85,247,0.3)_100%)] animate-pulse" />
          </div>
        )}

        {/* Game Viewport wrapping HUD Container */}
        <GameViewport isLight={effectiveHudIsLight} className="w-full h-full">
          <MatchHudContainer
            score={score}
            kickoffCountdown={kickoffCount}
            boost={boost}
            ballCam={ballCam}
            speed={speed}
            flipTimer={flipTimer}
            events={events}
            chatMessages={chatMessages}
            visibility={visibility}
            themeStyle={themeStyle}
            boostVariant={boostVariant}
            isLight={effectiveHudIsLight}
            onToggleBallCam={() =>
              setBallCam((prev) => ({ ...prev, isBallCam: !prev.isBallCam }))
            }
            onSpeedUnitChange={(unit) =>
              setSpeed((prev) => ({ ...prev, unit }))
            }
          />
        </GameViewport>
      </div>

      {/* 4. Telemetry & Parameter Tweakers (外部控制面板 - 全面适配亮色模式) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Panel A: 推进量与喷射 (Boost Controls) */}
        <div
          className={`p-4 rounded-2xl border transition-colors flex flex-col gap-3 shadow-2xs ${
            isLight
              ? 'bg-white border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Flame className="h-4 w-4" />
              <span>推进量控制 (Boost Gauge)</span>
            </div>
            <span className="font-mono text-neutral-500 dark:text-neutral-400">{boost.amount}%</span>
          </div>

          <SliderControl
            label="当前推进量 (Boost Amount)"
            value={boost.amount}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={(val) => setBoost((b) => ({ ...b, amount: val }))}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">仪表形态 (Variant)</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBoostVariant('circular')}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium cursor-pointer transition-colors ${
                  boostVariant === 'circular'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
              >
                环形
              </button>
              <button
                type="button"
                onClick={() => setBoostVariant('linear')}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium cursor-pointer transition-colors ${
                  boostVariant === 'linear'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
              >
                线性
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">无限推进 (Infinite Boost)</span>
            <ToggleSwitch
              checked={!!boost.isInfinite}
              onCheckedChange={(c) => setBoost((b) => ({ ...b, isInfinite: c }))}
              variant="neutral"
            />
          </div>

          <button
            type="button"
            onMouseDown={() => setBoost((b) => ({ ...b, isFiring: true }))}
            onMouseUp={() => setBoost((b) => ({ ...b, isFiring: false }))}
            onTouchStart={() => setBoost((b) => ({ ...b, isFiring: true }))}
            onTouchEnd={() => setBoost((b) => ({ ...b, isFiring: false }))}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md select-none ${
              boost.isFiring
                ? 'bg-amber-500 text-black scale-98 shadow-[0_0_15px_#f59e0b]'
                : isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
          >
            {boost.isFiring ? '🔥 正在喷射推进中 (FIRING)...' : '按住模拟推进消耗 (Hold to Burn Boost)'}
          </button>
        </div>

        {/* Panel B: 速度与超音速 (Speed & Velocity Controls) */}
        <div
          className={`p-4 rounded-2xl border transition-colors flex flex-col gap-3 shadow-2xs ${
            isLight
              ? 'bg-white border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-sky-500 dark:text-sky-400">
              <Gauge className="h-4 w-4" />
              <span>速度与超音速 (Speedometer)</span>
            </div>
            <span className="font-mono text-neutral-500 dark:text-neutral-400">{speed.speed} uu/s</span>
          </div>

          <SliderControl
            label="车速调节 (Car Speed)"
            value={speed.speed}
            min={0}
            max={2300}
            step={25}
            unit="uu"
            onChange={(val) =>
              setSpeed((s) => ({
                ...s,
                speed: val,
                isSupersonic: val >= 2200,
              }))
            }
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">强制超音速 (Supersonic Mode)</span>
            <ToggleSwitch
              checked={speed.speed >= 2200 || !!speed.isSupersonic}
              onCheckedChange={(c) =>
                setSpeed((s) => ({
                  ...s,
                  isSupersonic: c,
                  speed: c ? Math.max(2200, s.speed) : s.speed,
                }))
              }
              variant="neutral"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">显示单位 (Unit)</span>
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['uu/s', 'km/h', 'mph'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setSpeed((s) => ({ ...s, unit: u }))}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    speed.unit === u
                      ? 'bg-sky-500 text-white font-bold'
                      : isLight
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel C: 空翻倒计时与翻滚重置 (Flip Timer & Reset Controls) */}
        <div
          className={`p-4 rounded-2xl border transition-colors flex flex-col gap-3 shadow-2xs ${
            isLight
              ? 'bg-white border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <RefreshCw className="h-4 w-4" />
              <span>翻滚与重置 (Flip Timer & Reset)</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-500 uppercase">
              {flipTimer.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={startFlipCooldown}
              className={`px-3 py-2 rounded-xl text-xs font-bold border active:scale-95 transition-all cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
              }`}
            >
              模拟空中跳跃 (1.5s 倒计时)
            </button>

            <button
              type="button"
              onClick={triggerFlipReset}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black active:scale-95 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            >
              ✨ 四轮触球 Flip Reset
            </button>
          </div>

          <button
            type="button"
            onClick={resetToGrounded}
            className={`w-full py-1.5 rounded-xl text-xs font-medium border active:scale-95 transition-all cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
            }`}
          >
            着地重置 (Reset Grounded)
          </button>
        </div>

        {/* Panel D: 摄像机与对局事件 (Camera & Match Events) */}
        <div
          className={`p-4 rounded-2xl border transition-colors flex flex-col gap-3 shadow-2xs ${
            isLight
              ? 'bg-white border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
              <Eye className="h-4 w-4" />
              <span>球相机与事件 (Camera & Events)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Ball Cam (球心追踪)</span>
            <ToggleSwitch
              checked={ballCam.isBallCam}
              onCheckedChange={(c) => setBallCam((b) => ({ ...b, isBallCam: c }))}
              variant="neutral"
            />
          </div>

          {!ballCam.isBallCam && (
            <SliderControl
              label="来球相对朝向角 (Ball Angle)"
              value={ballCam.ballAngleDeg || 0}
              min={0}
              max={360}
              step={5}
              unit="°"
              onChange={(v) => setBallCam((b) => ({ ...b, ballAngleDeg: v }))}
            />
          )}

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => triggerAccolade('goal', 'GOAL!', 'SCORE!')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              进球 (Goal)
            </button>
            <button
              type="button"
              onClick={() => triggerAccolade('epic-save', 'EPIC SAVE!', 'DEFENSE!')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                isLight
                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
              }`}
            >
              救球 (Save)
            </button>
            <button
              type="button"
              onClick={() => triggerAccolade('demo', 'DEMOLITION!', 'BOOM!')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                isLight
                  ? 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300'
                  : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
              }`}
            >
              爆破 (Demo)
            </button>
          </div>
        </div>

        {/* Panel E: 战术聊天与开球 (Chat & Kickoff) */}
        <div
          className={`p-4 rounded-2xl border transition-colors flex flex-col gap-3 shadow-2xs ${
            isLight
              ? 'bg-white border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400">
              <MessageSquare className="h-4 w-4" />
              <span>快捷聊天 (Tactical Quick Chat)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => triggerChatMessage('I got it!', 'blue')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer text-left truncate transition-colors ${
                isLight
                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-sky-300 border-neutral-700'
              }`}
            >
              [Team] I got it!
            </button>
            <button
              type="button"
              onClick={() => triggerChatMessage('Defending...', 'blue')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer text-left truncate transition-colors ${
                isLight
                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-sky-300 border-neutral-700'
              }`}
            >
              [Team] Defending...
            </button>
            <button
              type="button"
              onClick={() => triggerChatMessage('Nice shot!', 'orange')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer text-left truncate transition-colors ${
                isLight
                  ? 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-orange-300 border-neutral-700'
              }`}
            >
              [All] Nice shot!
            </button>
            <button
              type="button"
              onClick={() => triggerChatMessage('What a save!', 'orange')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer text-left truncate transition-colors ${
                isLight
                  ? 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-orange-300 border-neutral-700'
              }`}
            >
              [All] What a save!
            </button>
          </div>

          <button
            type="button"
            onClick={triggerKickoffSequence}
            className={`w-full mt-1 py-1.5 rounded-xl text-xs font-bold border active:scale-95 transition-all cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-amber-700 border-neutral-300'
                : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border-neutral-700'
            }`}
          >
            触发开球倒计时 (3-2-1-GO!)
          </button>
        </div>

        {/* Panel F: 组件独立显示开关 (HUD Module Visibility) */}
        <div
          className={`p-4 rounded-2xl border transition-colors flex flex-col gap-2 shadow-2xs ${
            isLight
              ? 'bg-white border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <Layers className="h-4 w-4" />
              <span>HUD 组件可见性 (Module Visibility)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={visibility.showScoreboard}
                onChange={(e) => setVisibility((v) => ({ ...v, showScoreboard: e.target.checked }))}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-neutral-700 dark:text-neutral-300">积分板 (Score)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={visibility.showBoostGauge}
                onChange={(e) => setVisibility((v) => ({ ...v, showBoostGauge: e.target.checked }))}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-neutral-700 dark:text-neutral-300">推进仪表 (Boost)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={visibility.showBallCamIndicator}
                onChange={(e) => setVisibility((v) => ({ ...v, showBallCamIndicator: e.target.checked }))}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-neutral-700 dark:text-neutral-300">球相机 (Ball Cam)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={visibility.showSpeedometer}
                onChange={(e) => setVisibility((v) => ({ ...v, showSpeedometer: e.target.checked }))}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-neutral-700 dark:text-neutral-300">速度表 (Speed)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={visibility.showFlipTimer}
                onChange={(e) => setVisibility((v) => ({ ...v, showFlipTimer: e.target.checked }))}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-neutral-700 dark:text-neutral-300">翻滚倒计时 (Flip)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={visibility.showQuickChat}
                onChange={(e) => setVisibility((v) => ({ ...v, showQuickChat: e.target.checked }))}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-neutral-700 dark:text-neutral-300">战术聊天 (Chat)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={visibility.showNetworkDiagnostics}
                onChange={(e) => setVisibility((v) => ({ ...v, showNetworkDiagnostics: e.target.checked }))}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-neutral-700 dark:text-neutral-300">遥测状态 (FPS/Ping)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
