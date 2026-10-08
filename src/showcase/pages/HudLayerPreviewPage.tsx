import React, { useState, useEffect, useRef } from 'react';
import {
  Crosshair,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Gauge,
  Flame,
  Check,
  Ruler,
  MessageSquare,
  Sparkles,
  Trophy,
  Shield,
  Clock,
  ArrowUpRight,
  Eye,
  Sliders,
  Volume2,
} from 'lucide-react';
import {
  MatchScoreState,
  BoostState,
  SpeedState,
  FlipTimerState,
  CameraMode,
  AccoladeEvent,
  QuickChatMessage,
  MatchScoreboardHUD,
  BoostGaugeHUD,
  BallCamIndicatorHUD,
  SpeedometerHUD,
  FlipTimerHUD,
  MatchAccoladeBannerHUD,
  QuickChatFeedHUD,
  MatchHudRecipe,
} from '../../hud';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { CodeBlock } from '../CodeBlock';

export interface HudLayerPreviewPageProps {
  isLight?: boolean;
}

export const HudLayerPreviewPage: React.FC<HudLayerPreviewPageProps> = ({
  isLight = true,
}) => {
  // 1. MATCH SCORE STATE
  const [blueScore, setBlueScore] = useState(2);
  const [orangeScore, setOrangeScore] = useState(1);
  const [clockSeconds, setClockSeconds] = useState(240); // 4:00
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [isOvertime, setIsOvertime] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 2. BOOST GAUGE STATE
  const [boostAmount, setBoostAmount] = useState(65);
  const [isSpendingBoost, setIsSpendingBoost] = useState(false);
  const [isUnlimitedBoost, setIsUnlimitedBoost] = useState(false);
  const [boostVariant, setBoostVariant] = useState<'ring' | 'linear' | 'hybrid'>('ring');

  // 3. SPEEDOMETER STATE
  const [speedUu, setSpeedUu] = useState(1650);

  // 4. FLIP / DODGE TIMER STATE
  const [flipPhase, setFlipPhase] = useState<'grounded' | 'airborne' | 'expired' | 'reset'>('grounded');
  const [flipRemainingMs, setFlipRemainingMs] = useState(1250);
  const [flipResetCount, setFlipResetCount] = useState(0);

  // 5. CAMERA MODE
  const [cameraMode, setCameraMode] = useState<CameraMode>('ball');

  // 6. ACCOLADES & GOAL BANNERS
  const [activeAccolade, setActiveAccolade] = useState<AccoladeEvent | null>(null);

  // 7. QUICK CHAT FEED
  const [chatMessages, setChatMessages] = useState<QuickChatMessage[]>([
    { id: '1', sender: 'OctanePrime', text: 'Defending...', team: 'blue', timestamp: Date.now() - 6000 },
    { id: '2', sender: 'ViperStrike', text: 'Take the shot!', team: 'orange', timestamp: Date.now() - 3000 },
    { id: '3', sender: 'You', text: 'I got it!', team: 'blue', timestamp: Date.now() - 1000 },
  ]);

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Clock tick timer
  useEffect(() => {
    if (!isClockRunning) return;
    const interval = setInterval(() => {
      setClockSeconds((prev) => {
        if (isOvertime) return prev + 1;
        if (prev <= 1) {
          setIsClockRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockRunning, isOvertime]);

  // Flip timer airborne depletion loop
  useEffect(() => {
    if (flipPhase !== 'airborne') return;
    const step = 50; // 50ms interval
    const interval = setInterval(() => {
      setFlipRemainingMs((prev) => {
        const next = prev - step;
        if (next <= 0) {
          setFlipPhase('expired');
          return 0;
        }
        return next;
      });
    }, step);
    return () => clearInterval(interval);
  }, [flipPhase]);

  // Active boost consumption loop when burning
  useEffect(() => {
    if (!isSpendingBoost || isUnlimitedBoost) return;
    const interval = setInterval(() => {
      setBoostAmount((prev) => Math.max(0, prev - 2));
    }, 60);
    return () => clearInterval(interval);
  }, [isSpendingBoost, isUnlimitedBoost]);

  // Actions for Simulator
  const handleTriggerKickoff = () => {
    setCountdown(3);
    const c3 = setTimeout(() => setCountdown(2), 1000);
    const c2 = setTimeout(() => setCountdown(1), 2000);
    const c1 = setTimeout(() => setCountdown(0), 3000);
    const c0 = setTimeout(() => setCountdown(null), 3800);
    return () => {
      clearTimeout(c3);
      clearTimeout(c2);
      clearTimeout(c1);
      clearTimeout(c0);
    };
  };

  const handleTriggerGoal = (team: 'blue' | 'orange') => {
    const scorer = team === 'blue' ? 'Striker_07' : 'Apex_Hunter';
    const speed = Math.floor(95 + Math.random() * 35);
    setActiveAccolade({
      id: String(Date.now()),
      type: 'goal',
      title: `${scorer} SCORED!`,
      subtitle: 'Explosive top-corner strike',
      points: 100,
      team,
      speedKmh: speed,
    });
    if (team === 'blue') setBlueScore((s) => s + 1);
    else setOrangeScore((s) => s + 1);

    setTimeout(() => setActiveAccolade(null), 3500);
  };

  const handleTriggerAccolade = (type: 'epic-save' | 'shot' | 'demo') => {
    const titles = {
      'epic-save': 'EPIC SAVE!',
      'shot': 'SHOT ON GOAL',
      'demo': 'DEMOLITION!',
    };
    const points = {
      'epic-save': 75,
      'shot': 20,
      'demo': 20,
    };
    setActiveAccolade({
      id: String(Date.now()),
      type,
      title: titles[type],
      subtitle: type === 'epic-save' ? 'Goal-line recovery save' : undefined,
      points: points[type],
    });
    setTimeout(() => setActiveAccolade(null), 2500);
  };

  const handleSendChat = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'You',
        text,
        team: 'blue',
        timestamp: Date.now(),
      },
    ]);
  };

  const handleJump = () => {
    setFlipPhase('airborne');
    setFlipRemainingMs(1250);
  };

  const handleFlipReset = () => {
    setFlipPhase('reset');
    setFlipRemainingMs(1250);
    setFlipResetCount((c) => c + 1);
  };

  const handleLand = () => {
    setFlipPhase('grounded');
    setFlipRemainingMs(1250);
    setFlipResetCount(0);
  };

  // Layout Inspector Export Handler
  const handleExportHudLayout = async () => {
    const stage = document.getElementById('hud-preview-stage');
    if (!stage) return;

    const lines: string[] = [];
    lines.push('========================================================================');
    lines.push('HUD LAYER INSPECTOR SNAPSHOT — RLCleanWASM & UIStorybook');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Viewport Size: ${stage.clientWidth}px × ${stage.clientHeight}px`);
    lines.push('========================================================================\n');

    const elements = [
      { id: 'hud-scoreboard', name: 'TOP SCOREBOARD & CLOCK' },
      { id: 'hud-boost-gauge', name: 'BOTTOM-RIGHT BOOST GAUGE' },
      { id: 'hud-ballcam-indicator', name: 'BOTTOM-LEFT BALL CAM PILL' },
      { id: 'hud-speedometer', name: 'BOTTOM-CENTER SPEEDOMETER' },
      { id: 'hud-flip-timer', name: 'FLIP / DODGE RESET TIMER' },
      { id: 'hud-quickchat-feed', name: 'TOP-LEFT QUICK CHAT FEED' },
      { id: 'hud-accolade-banner', name: 'CENTER ACCOLADE BANNER' },
    ];

    elements.forEach((item, idx) => {
      const el = stage.querySelector(`[data-ui-element="${item.id}"]`) as HTMLElement;
      if (el) {
        const rect = el.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const relX = Math.round(rect.left - stageRect.left);
        const relY = Math.round(rect.top - stageRect.top);
        lines.push(`[${idx + 1}. ${item.name}]`);
        lines.push(`  • Anchor Rect:   W=${Math.round(rect.width)}px, H=${Math.round(rect.height)}px`);
        lines.push(`  • Stage Offset:  X=${relX}px, Y=${relY}px`);
      }
    });

    lines.push('\n========================================================================');
    const report = lines.join('\n');
    console.log(report);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(report);
        showToast('✓ HUD 布局坐标与尺寸已复制至剪贴板');
      } catch (_) {
        showToast('✓ HUD 布局数据已输出至控制台');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 顶部标题与导出控制条 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HUD Layer 实时预览</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Heads-Up Display 战局平视显示层规范 (对局比分板、推进器规表、球相机视角、速度表与翻滚倒计时)
            </p>
          </div>
        </div>

        {/* 右侧工具操作区 */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <button
            type="button"
            onClick={handleExportHudLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-medium transition-all active:scale-95 cursor-pointer bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 shadow-2xs"
            title="测量并导出当前 HUD 各个平视锚点组件的尺寸与位置数据"
          >
            <Ruler className="h-3.5 w-3.5 text-emerald-500" />
            <span>导出 HUD 布局数据</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`font-medium ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              推进器形态:
            </span>
            <SegmentedSwitch
              value={boostVariant}
              onValueChange={(v) => setBoostVariant(v as any)}
              isLight={isLight}
              options={[
                { value: 'ring', label: 'Ring (环状)' },
                { value: 'linear', label: 'Linear (线形)' },
                { value: 'hybrid', label: 'Hybrid (双模)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 外部实时遥控调测盘 (External Simulator Dock) */}
      <div
        className={`p-4 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 font-bold">
            <Sliders className="h-4 w-4 text-emerald-500" />
            <span>对局遥控控制台 (Live Match Telemetry Simulator)</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            调节各控制项，实时观测下方 HUD 各平视组件的动画与微交互
          </span>
        </div>

        {/* 控制条第一行：比分、时钟与开球倒计时 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 比分调节 */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex flex-col">
              <span className="font-semibold">对局比分</span>
              <span className="text-[10px] text-neutral-400">蓝队 vs 橙队</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBlueScore((s) => Math.max(0, s - 1))}
                  className="h-6 w-6 rounded bg-blue-500/20 text-blue-500 font-bold hover:bg-blue-500/30 active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold text-blue-500">{blueScore}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerGoal('blue')}
                  className="h-6 w-6 rounded bg-blue-500 text-white font-bold hover:bg-blue-600 active:scale-95 cursor-pointer"
                  title="蓝队得分并触发进球横幅"
                >
                  +
                </button>
              </div>

              <span className="text-neutral-400">:</span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setOrangeScore((s) => Math.max(0, s - 1))}
                  className="h-6 w-6 rounded bg-orange-500/20 text-orange-500 font-bold hover:bg-orange-500/30 active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold text-orange-500">{orangeScore}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerGoal('orange')}
                  className="h-6 w-6 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 active:scale-95 cursor-pointer"
                  title="橙队得分并触发进球横幅"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 时钟控制 */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex flex-col">
              <span className="font-semibold">比赛时钟</span>
              <span className="text-[10px] text-neutral-400">
                {isOvertime ? '加时赛阶段' : '常规 5 分钟'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsClockRunning((r) => !r)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isClockRunning
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
                }`}
                title={isClockRunning ? '暂停时钟' : '继续时钟'}
              >
                {isClockRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setClockSeconds(300);
                  setIsOvertime(false);
                }}
                className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 cursor-pointer"
                title="重置为 5:00"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOvertime((o) => !o);
                  setClockSeconds(0);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                  isOvertime
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
                }`}
              >
                加时赛
              </button>
            </div>
          </div>

          {/* 开球 3-2-1 倒计时 */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex flex-col">
              <span className="font-semibold">开球倒计时</span>
              <span className="text-[10px] text-neutral-400">Kickoff 3-2-1-GO! 弹簧动效</span>
            </div>
            <button
              type="button"
              onClick={handleTriggerKickoff}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>启动 3-2-1</span>
            </button>
          </div>
        </div>

        {/* 控制条第二行：推进器、车速与翻滚倒计时 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          {/* 推进器量与喷气测试 */}
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                推进器 (Boost): {isUnlimitedBoost ? '∞' : `${boostAmount}%`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => setIsSpendingBoost(true)}
                  onMouseUp={() => setIsSpendingBoost(false)}
                  onTouchStart={() => setIsSpendingBoost(true)}
                  onTouchEnd={() => setIsSpendingBoost(false)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer select-none ${
                    isSpendingBoost
                      ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                      : 'bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  按住喷气
                </button>
                <label className="flex items-center gap-1 cursor-pointer select-none text-[10px]">
                  <input
                    type="checkbox"
                    checked={isUnlimitedBoost}
                    onChange={(e) => setIsUnlimitedBoost(e.target.checked)}
                    className="rounded accent-amber-500 cursor-pointer"
                  />
                  <span>无限模式</span>
                </label>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={boostAmount}
              disabled={isUnlimitedBoost}
              onChange={(e) => setBoostAmount(Number(e.target.value))}
              className="accent-amber-500 cursor-pointer w-full"
            />
          </div>

          {/* 车速与超音速冲刺 */}
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-emerald-500" />
                速度: {Math.round(speedUu)} uu/s ({Math.round(speedUu * 0.06)} km/h)
              </span>
              <button
                type="button"
                onClick={() => setSpeedUu(2250)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-700 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                超音速爆发 🚀
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={2300}
              value={speedUu}
              onChange={(e) => setSpeedUu(Number(e.target.value))}
              className="accent-emerald-500 cursor-pointer w-full"
            />
          </div>

          {/* 空翻 / 二段跳倒计时调测 (核心新功能) */}
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                空翻状态: <strong className="uppercase font-mono">{flipPhase}</strong>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                1.25s 倒计时机制
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleJump}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500 text-white hover:bg-amber-600 active:scale-95 cursor-pointer shadow-2xs"
                title="模拟车辆跳起，启动 1.25 秒空翻倒计时"
              >
                起跳 (Jump)
              </button>
              <button
                type="button"
                onClick={handleFlipReset}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 cursor-pointer shadow-2xs"
                title="模拟4轮触球或触顶，获得无时限 Flip Reset"
              >
                触球 (Flip Reset!)
              </button>
              <button
                type="button"
                onClick={handleLand}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 active:scale-95 cursor-pointer"
                title="重置回地面"
              >
                落地 (Grounded)
              </button>
            </div>
          </div>
        </div>

        {/* 控制条第三行：对局事件横幅与快捷聊天播报 */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">模拟通告播报:</span>
            <button
              type="button"
              onClick={() => handleTriggerAccolade('epic-save')}
              className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 cursor-pointer"
            >
              🛡️ Epic Save (+75)
            </button>
            <button
              type="button"
              onClick={() => handleTriggerAccolade('shot')}
              className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 cursor-pointer"
            >
              🎯 Shot on Goal (+20)
            </button>
            <button
              type="button"
              onClick={() => handleTriggerAccolade('demo')}
              className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 cursor-pointer"
            >
              💥 Demolition!
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">发送快捷短语:</span>
            <button
              type="button"
              onClick={() => handleSendChat('Nice shot!')}
              className="px-2 py-0.5 rounded text-[11px] bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 cursor-pointer"
            >
              "Nice shot!"
            </button>
            <button
              type="button"
              onClick={() => handleSendChat('Great pass!')}
              className="px-2 py-0.5 rounded text-[11px] bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 cursor-pointer"
            >
              "Great pass!"
            </button>
            <button
              type="button"
              onClick={() => handleSendChat('What a save!')}
              className="px-2 py-0.5 rounded text-[11px] bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 cursor-pointer"
            >
              "What a save!"
            </button>
          </div>
        </div>
      </div>

      {/* 2. 真实对局视口舞台 (Viewport Stage with 3D Stadium Backdrop) */}
      <div
        id="hud-preview-stage"
        className="relative w-full aspect-[18/9] max-h-[640px] rounded-3xl overflow-hidden border border-neutral-300 dark:border-neutral-800 shadow-2xl select-none"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at 50% 120%, #1a365d 0%, #0f172a 60%, #020617 100%)'
            : 'radial-gradient(ellipse at 50% 120%, #0c1c38 0%, #030712 60%, #000000 100%)',
        }}
      >
        {/* Simulated 3D Arena Ground Grid & Goal Arch Lighting */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {/* Pitch center ring & boundary lines */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-t-full border-t-2 border-dashed border-cyan-400/40" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent" />
          {/* Pitch perspective grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              perspective: '600px',
              transform: 'rotateX(60deg) translateY(20%)',
            }}
          />
        </div>

        {/* Simulated Car Silhouette & Ball Trajectory indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center">
            {/* Pulsing Target Ball */}
            <div className="h-10 w-10 rounded-full border-2 border-amber-400/80 bg-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.5)] flex items-center justify-center animate-pulse">
              <span className="text-[9px] font-mono font-bold text-amber-300">BALL</span>
            </div>
            {/* Trajectory Guide Beam */}
            <div className="w-0.5 h-20 bg-gradient-to-b from-amber-400/60 to-transparent my-1" />
            {/* Vehicle Octane Silhouette Box */}
            <div className="px-4 py-1.5 rounded-lg border border-white/30 bg-black/50 text-white/80 font-mono text-[10px] tracking-wider shadow-lg">
              OCTANE VEHICLE [YOU]
            </div>
          </div>
        </div>

        {/* FULL IN-GAME HUD LAYER (Pure MatchHudRecipe) */}
        <MatchHudRecipe
          scoreState={{
            blueScore,
            orangeScore,
            blueName: 'BLUE',
            orangeName: 'ORANGE',
            clockSeconds,
            isOvertime,
            periodLabel: '1v1 DUEL',
            countdown,
          }}
          boostState={{
            amount: boostAmount,
            isSpending: isSpendingBoost,
            isUnlimited: isUnlimitedBoost,
          }}
          speedState={{
            speedUu,
            isSupersonic: speedUu >= 2200,
          }}
          flipState={{
            phase: flipPhase,
            remainingMs: flipRemainingMs,
            maxMs: 1250,
            resetCount: flipResetCount,
          }}
          cameraMode={cameraMode}
          onToggleCameraMode={() => setCameraMode((m) => (m === 'ball' ? 'car' : 'ball'))}
          accoladeEvent={activeAccolade}
          countdownNumber={countdown}
          quickChatMessages={chatMessages}
          boostVariant={boostVariant}
          isLight={false} // Match HUD is high-contrast dark overlay inside game
        />
      </div>

      {/* 3. 独立原子组件参考谱与代码直接调用说明 (Component Catalog) */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold tracking-tight">HUD 组件独立参考谱 (Recipe Registry)</h2>
          <Badge variant="primary" size="sm">
            Zero Coupling Primitives
          </Badge>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          UIStorybook 遵循“纯表现层”设计思想：以下每个 HUD 组件均具备完全解耦的 Props 接口，单文件体积微型化，可在 <code>RLCleanWASM</code> 中按需独立调用或自由组合。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {/* Card 1: Scoreboard */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">MatchScoreboardHUD</span>
                <Badge size="sm" variant="neutral">Top Anchor</Badge>
              </div>
              <span className="text-[11px] text-neutral-400">
                双队比分板与对局时钟，加时赛状态与开球 3-2-1 整合。
              </span>
            </div>
            <div className="flex items-center justify-center p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 overflow-x-auto">
              <MatchScoreboardHUD
                blueScore={blueScore}
                orangeScore={orangeScore}
                clockSeconds={clockSeconds}
                isOvertime={isOvertime}
                countdown={countdown}
              />
            </div>
            <CodeBlock
              language="tsx"
              code={`<MatchScoreboardHUD\n  blueScore={${blueScore}}\n  orangeScore={${orangeScore}}\n  clockSeconds={${clockSeconds}}\n  isOvertime={${isOvertime}}\n/>`}
            />
          </div>

          {/* Card 2: Boost Gauge */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">BoostGaugeHUD</span>
                <Badge size="sm" variant="neutral">Bottom-Right</Badge>
              </div>
              <span className="text-[11px] text-neutral-400">
                推进器量规表，支持现代化 Arc Ring 弧环与 Linear 刻度规条。
              </span>
            </div>
            <div className="flex items-center justify-center p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <BoostGaugeHUD
                amount={boostAmount}
                isSpending={isSpendingBoost}
                isUnlimited={isUnlimitedBoost}
                variant={boostVariant}
              />
            </div>
            <CodeBlock
              language="tsx"
              code={`<BoostGaugeHUD\n  amount={${boostAmount}}\n  isSpending={${isSpendingBoost}}\n  isUnlimited={${isUnlimitedBoost}}\n  variant="${boostVariant}"\n/>`}
            />
          </div>

          {/* Card 3: Flip / Dodge Timer */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">FlipTimerHUD</span>
                <Badge size="sm" variant="success">New Mechanic</Badge>
              </div>
              <span className="text-[11px] text-neutral-400">
                起跳后 1.25 秒二段跳倒计时与 4 轮触球 Flip Reset 刷新提示。
              </span>
            </div>
            <div className="flex items-center justify-center p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <FlipTimerHUD
                phase={flipPhase}
                remainingMs={flipRemainingMs}
                resetCount={flipResetCount}
              />
            </div>
            <CodeBlock
              language="tsx"
              code={`<FlipTimerHUD\n  phase="${flipPhase}"\n  remainingMs={${flipRemainingMs}}\n  resetCount={${flipResetCount}}\n/>`}
            />
          </div>

          {/* Card 4: Speedometer */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">SpeedometerHUD</span>
                <Badge size="sm" variant="neutral">Bottom-Center</Badge>
              </div>
              <span className="text-[11px] text-neutral-400">
                0-2300 非线性车速表，2200 刻度线触发超音速紫光拖尾。
              </span>
            </div>
            <div className="flex items-center justify-center p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <SpeedometerHUD speed={speedUu} />
            </div>
            <CodeBlock
              language="tsx"
              code={`<SpeedometerHUD\n  speed={${Math.round(speedUu)}}\n  showUnits="both"\n/>`}
            />
          </div>

          {/* Card 5: Ball Cam Indicator */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">BallCamIndicatorHUD</span>
                <Badge size="sm" variant="neutral">Bottom-Left</Badge>
              </div>
              <span className="text-[11px] text-neutral-400">
                球相机/车头相机视角切换指示胶囊，带按键提示与触觉回弹。
              </span>
            </div>
            <div className="flex items-center justify-center p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <BallCamIndicatorHUD
                mode={cameraMode}
                onToggle={() => setCameraMode((m) => (m === 'ball' ? 'car' : 'ball'))}
              />
            </div>
            <CodeBlock
              language="tsx"
              code={`<BallCamIndicatorHUD\n  mode="${cameraMode}"\n  shortcut="SPACE"\n  onToggle={toggleCam}\n/>`}
            />
          </div>

          {/* Card 6: Accolade Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">MatchAccoladeBannerHUD</span>
                <Badge size="sm" variant="neutral">Center Overlay</Badge>
              </div>
              <span className="text-[11px] text-neutral-400">
                进球高光庆祝横幅、开球倒计时与扑救/爆燃得分徽章。
              </span>
            </div>
            <div className="flex items-center justify-center p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <MatchAccoladeBannerHUD
                currentAccolade={{
                  id: 'demo',
                  type: 'goal',
                  title: 'Striker_07 SCORED!',
                  points: 100,
                  speedKmh: 112,
                  team: 'blue',
                }}
              />
            </div>
            <CodeBlock
              language="tsx"
              code={`<MatchAccoladeBannerHUD\n  currentAccolade={event}\n  countdownNumber={count}\n/>`}
            />
          </div>
        </div>
      </div>

      {/* Floating feedback toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-[9999] px-4 py-2 rounded-xl bg-neutral-900 text-white border border-neutral-700 shadow-2xl text-xs font-mono font-medium flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}
    </div>
  );
};
