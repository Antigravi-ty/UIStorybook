import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Play,
  Square,
  RotateCcw,
  Trophy,
  Timer,
  Megaphone,
  Palette,
  Sliders,
  Repeat,
  Crosshair,
  Layers,
  Copy,
  Check,
  Code2,
} from 'lucide-react';
import {
  CenterUpperInfoHUD,
  CenterUpperInfoPayload,
  CenterUpperGlowConfig,
  CenterUpperTypographyConfig,
  CenterUpperTimingConfig,
  CenterUpperInfoVariant,
  WinnerTeamPreset,
  DEFAULT_RL_COUNTDOWN_GLOW,
  DEFAULT_CENTER_UPPER_TYPOGRAPHY,
  DEFAULT_CENTER_UPPER_TIMING,
  buildOuterGlowTextShadow,
} from '../../hud/CenterUpperInfoHUD';
import { StepperScoreboardHUD } from '../../hud/StepperScoreboardHUD';
import { EdgePlayerHudStrip } from '../../hud/EdgePlayerHudStrip';
import { VelocityProgressBar } from '../../hud/VelocityProgressBar';
import { CircularBoostGauge } from '../../hud/CircularBoostGauge';
import { BallCameraIndicator } from '../../hud/BallCameraIndicator';
import { ArenaBackdrop, ArenaLightingPreset } from '../../hud/ArenaBackdrop';
import { DEFAULT_INITIAL_ROSTER } from '../../hud/hudTransientChannel';
import { HudAnchorStage, HudZone, HudSlot } from '../../layout/HudAnchorStage';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { ColorSwatchInput } from '../../primitives/tuner/ColorSwatchInput';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import { CodeBlock } from '../CodeBlock';
import { useSyncedState, crossClientSync } from '../stores';

const DIRECTORY_ITEMS: JumpDirectoryItem[] = [
  {
    id: 'center-upper-stage',
    code: '5E-1',
    name: 'HudAnchorStage (upper-center)',
    label: '中心偏上强提醒实时舞台 + 可调背景颜色 + 3-2-1-GO / Winner / Custom 触发器',
  },
  {
    id: 'center-upper-tuner',
    code: '5E-2',
    name: 'OutGlow & Duration Tuner',
    label: 'Rocket League 黄色外发光 (Out Glow)、400ms 1.5x 入场冲击、2000ms 持续与 400ms 尾段淡出调参台',
  },
  {
    id: 'center-upper-archetypes',
    code: '5E-3',
    name: 'Archetype Gallery & Recipe',
    label: '三类强提醒固定对照卡 (Countdown / Winner Blue & Orange / Custom Announcement) 与代码配方',
  },
];

export type StageBgMode = 'solid' | 'gradient' | 'arena';

interface CustomAnnouncementPreset {
  id: string;
  label: string;
  topText: string;
  mainText: string;
}

const CUSTOM_ANNOUNCEMENT_PRESETS: CustomAnnouncementPreset[] = [
  {
    id: 'match-paused',
    label: 'MATCH PAUSED (比赛暂停)',
    topText: 'MATCH STATUS',
    mainText: 'MATCH PAUSED',
  },
  {
    id: 'match-post',
    label: 'MATCH POST (赛况强提醒)',
    topText: 'OFFICIAL SIGNAL',
    mainText: 'MATCH POST',
  },
  {
    id: 'overtime',
    label: 'OVERTIME (加时赛)',
    topText: 'SUDDEN DEATH',
    mainText: 'OVERTIME',
  },
  {
    id: 'goal-scored',
    label: 'GOAL SCORED (进球播报)',
    topText: 'SCORED BY',
    mainText: 'ZEN_MASTER_RL',
  },
  {
    id: 'match-point',
    label: 'MATCH POINT (赛点局)',
    topText: 'SERIES ALERT',
    mainText: 'MATCH POINT',
  },
  {
    id: 'single-line-info',
    label: 'WAITING FOR PLAYERS (纯 Thin 单行)',
    topText: '',
    mainText: 'WAITING FOR PLAYERS',
  },
];

const BG_COLOR_SWATCHES = [
  '#090D16',
  '#000000',
  '#0F172A',
  '#1E293B',
  '#18181B',
  '#0E2218',
  '#23121B',
  '#334155',
  '#CBD5E1',
  '#F8FAFC',
];

const RL_GLOW_SWATCHES = [
  '#FFE600',
  '#FACC15',
  '#F59E0B',
  '#FB923C',
  '#38BDF8',
  '#22C55E',
  '#EF4444',
  '#A855F7',
  '#FFFFFF',
];

export const CenterUpperInfoPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Preview Stage Background Parameters (Synced via Vite WebSocket)
  // ──────────────────────────────────────────────────────────────────────────
  const [stageBgMode, setStageBgMode] = useSyncedState<StageBgMode>('5e:stageBgMode', 'solid');
  const [stageBgColor, setStageBgColor] = useSyncedState<string>('5e:stageBgColor', '#090D16');
  const [stageBgSecondaryColor, setStageBgSecondaryColor] = useSyncedState<string>(
    '5e:stageBgSecondaryColor',
    '#1E293B'
  );
  const [arenaPreset, setArenaPreset] = useSyncedState<ArenaLightingPreset>(
    '5e:arenaPreset',
    'night'
  );
  const [stageBrightness, setStageBrightness] = useSyncedState<number>('5e:stageBrightness', 85);
  const [showPitchLines, setShowPitchLines] = useSyncedState<boolean>('5e:showPitchLines', true);
  const [showAnchorGuides, setShowAnchorGuides] = useSyncedState<boolean>(
    '5e:showAnchorGuides',
    true
  );
  const [showSurroundingHud, setShowSurroundingHud] = useSyncedState<boolean>(
    '5e:showSurroundingHud',
    true
  );
  const [upperCenterTopPct, setUpperCenterTopPct] = useSyncedState<number>(
    '5e:upperCenterTopPct',
    40
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Active Information Mode & Content State (Synced via Vite WebSocket)
  // ──────────────────────────────────────────────────────────────────────────
  const [activeVariant, setActiveVariant] = useSyncedState<CenterUpperInfoVariant>(
    '5e:activeVariant',
    'countdown'
  );

  // Countdown (`3 -> 2 -> 1 -> GO`) state
  const [countdownStep, setCountdownStep] = useSyncedState<'3' | '2' | '1' | 'GO'>(
    '5e:countdownStep',
    '3'
  );
  const [goLabelText, setGoLabelText] = useSyncedState<string>('5e:goLabelText', 'GO');
  const [countdownIntervalMs, setCountdownIntervalMs] = useSyncedState<number>(
    '5e:countdownIntervalMs',
    1000
  );
  const [isSequencePlaying, setIsSequencePlaying] = useSyncedState<boolean>(
    '5e:isSequencePlaying',
    false
  );
  const [loopSequence, setLoopSequence] = useSyncedState<boolean>('5e:loopSequence', false);
  const sequenceTimerRef = useRef<number | null>(null);

  // Winner (`WINNER` Regular + `BLUE TEAM` / `ORANGE TEAM` Thin) state
  const [winnerTeam, setWinnerTeam] = useSyncedState<WinnerTeamPreset>('5e:winnerTeam', 'blue');
  const [winnerTopText, setWinnerTopText] = useSyncedState<string>('5e:winnerTopText', 'WINNER');
  const [winnerMainText, setWinnerMainText] = useSyncedState<string>(
    '5e:winnerMainText',
    'BLUE TEAM'
  );
  const [winnerSubText, setWinnerSubText] = useSyncedState<string>('5e:winnerSubText', '');

  // Custom Announcement state (no bottom capsule footnote by default)
  const [customPresetId, setCustomPresetId] = useSyncedState<string>(
    '5e:customPresetId',
    'match-paused'
  );
  const [showCustomTopLine, setShowCustomTopLine] = useSyncedState<boolean>(
    '5e:showCustomTopLine',
    true
  );
  const [customTopText, setCustomTopText] = useSyncedState<string>(
    '5e:customTopText',
    'MATCH STATUS'
  );
  const [customMainText, setCustomMainText] = useSyncedState<string>(
    '5e:customMainText',
    'MATCH PAUSED'
  );
  const [customSubText, setCustomSubText] = useSyncedState<string>('5e:customSubText', '');

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Outer Glow (`Out Glow`), Typography & Timing Parameters
  // ──────────────────────────────────────────────────────────────────────────
  const [glowConfig, setGlowConfig] = useSyncedState<CenterUpperGlowConfig>('5e:glowConfig', {
    ...DEFAULT_RL_COUNTDOWN_GLOW,
  });
  const [syncGlowWithText, setSyncGlowWithText] = useSyncedState<boolean>(
    '5e:syncGlowWithText',
    false
  );

  const [typoConfig, setTypoConfig] = useSyncedState<CenterUpperTypographyConfig>(
    '5e:typoConfig',
    {
      ...DEFAULT_CENTER_UPPER_TYPOGRAPHY,
    }
  );

  const [timingConfig, setTimingConfig] = useSyncedState<CenterUpperTimingConfig>(
    '5e:timingConfig',
    {
      ...DEFAULT_CENTER_UPPER_TIMING,
    }
  );

  const [triggerNonce, setTriggerNonce] = useSyncedState<number>('5e:triggerNonce', 1);
  const [isVisibleOnStage, setIsVisibleOnStage] = useSyncedState<boolean>(
    '5e:isVisibleOnStage',
    true
  );

  const [copied5EConfig, setCopied5EConfig] = useState<boolean>(false);
  const [showExported5ECode, setShowExported5ECode] = useState<boolean>(false);

  const build5EExportCode = useCallback(() => {
    const snapshot = {
      upperCenterTopPct,
      goLabelText,
      countdownIntervalMs,
      glowConfig,
      timingConfig,
      typoConfig,
      stageBackdrop: {
        stageBgMode,
        stageBgColor,
        stageBgSecondaryColor,
        arenaPreset,
        stageBrightness,
      },
    };
    return `// 5E Center-Upper Default Parameters Snapshot
export const DEFAULT_5E_CENTER_UPPER_CONFIG = ${JSON.stringify(snapshot, null, 2)};`;
  }, [
    upperCenterTopPct,
    goLabelText,
    countdownIntervalMs,
    glowConfig,
    timingConfig,
    typoConfig,
    stageBgMode,
    stageBgColor,
    stageBgSecondaryColor,
    arenaPreset,
    stageBrightness,
  ]);

  const handleCopy5EConfig = useCallback(() => {
    const code = build5EExportCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied5EConfig(true);
    window.setTimeout(() => setCopied5EConfig(false), 1800);
  }, [build5EExportCode]);

  const handleReset5EDefaults = useCallback(() => {
    crossClientSync.resetAll({ scopePrefix: '5e:' });
  }, []);

  // Clear countdown sequence timer helper
  const stopCountdownSequence = useCallback(() => {
    if (sequenceTimerRef.current !== null) {
      window.clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
    setIsSequencePlaying(false);
  }, [setIsSequencePlaying]);

  // If sequence is stopped from another screen/tab, clear any local sequence timer
  useEffect(() => {
    if (!isSequencePlaying && sequenceTimerRef.current !== null) {
      window.clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  }, [isSequencePlaying]);

  useEffect(() => {
    return () => {
      if (sequenceTimerRef.current !== null) {
        window.clearTimeout(sequenceTimerRef.current);
        sequenceTimerRef.current = null;
      }
    };
  }, []);

  // Run `3 -> 2 -> 1 -> GO` sequence:
  // Each step (`3`, `2`, `1`) has `durationMs` (default 2000ms) + `exitDurationMs` (default 400ms),
  // and is directly overwritten when the next step arrives after `countdownIntervalMs` (default 1000ms).
  // Once `GO` arrives, no new data comes, so `GO` holds for `durationMs` (2000ms) and then enters the 400ms fade-out!
  const startCountdownSequence = useCallback(
    (stepIntervalOverride?: number) => {
      stopCountdownSequence();
      const stepMs = Math.max(200, stepIntervalOverride ?? countdownIntervalMs);
      const finalHoldPlusExitMs =
        Math.max(timingConfig.entryDurationMs, timingConfig.durationMs) +
        Math.max(0, timingConfig.exitDurationMs);
      const steps: ('3' | '2' | '1' | 'GO')[] = ['3', '2', '1', 'GO'];

      setActiveVariant('countdown');
      setIsSequencePlaying(true);
      setIsVisibleOnStage(true);

      let idx = 0;
      const runStep = () => {
        const current = steps[idx];
        setCountdownStep(current);
        setIsVisibleOnStage(true);
        setTriggerNonce((n) => n + 1);

        idx += 1;
        if (idx < steps.length) {
          sequenceTimerRef.current = window.setTimeout(runStep, stepMs);
        } else {
          // After `GO` is pushed, wait for its full `durationMs` (2000ms) + `exitDurationMs` (400ms) fade-out!
          sequenceTimerRef.current = window.setTimeout(() => {
            if (loopSequence) {
              idx = 0;
              runStep();
            } else {
              setIsSequencePlaying(false);
              if (!timingConfig.persistentInspect) {
                setIsVisibleOnStage(false);
              }
            }
          }, finalHoldPlusExitMs);
        }
      };

      runStep();
    },
    [
      stopCountdownSequence,
      countdownIntervalMs,
      timingConfig.entryDurationMs,
      timingConfig.durationMs,
      timingConfig.exitDurationMs,
      timingConfig.persistentInspect,
      loopSequence,
      setActiveVariant,
      setIsSequencePlaying,
      setIsVisibleOnStage,
      setCountdownStep,
      setTriggerNonce,
    ]
  );

  // Switch between the 3 primary archetypes — ONLY changes active variant text, NEVER alters glow/typo/timing parameters!
  const handleSelectVariant = (variant: CenterUpperInfoVariant) => {
    stopCountdownSequence();
    setActiveVariant(variant);
    setIsVisibleOnStage(true);
    setTriggerNonce((n) => n + 1);
  };

  // Switch Winner Team preset — ONLY changes text, NEVER alters glow/typo/timing parameters!
  const handleSelectWinnerTeam = (team: WinnerTeamPreset) => {
    stopCountdownSequence();
    setActiveVariant('winner');
    setWinnerTeam(team);
    setWinnerTopText('WINNER');
    if (team === 'blue') {
      setWinnerMainText('BLUE TEAM');
    } else if (team === 'orange') {
      setWinnerMainText('ORANGE TEAM');
    } else {
      setWinnerMainText('CHAMPION SQUAD');
    }
    setIsVisibleOnStage(true);
    setTriggerNonce((n) => n + 1);
  };

  // Apply a Custom Announcement preset — ONLY changes text, NEVER alters glow/typo/timing parameters!
  const handleApplyCustomPreset = (preset: CustomAnnouncementPreset) => {
    stopCountdownSequence();
    setActiveVariant('announcement');
    setCustomPresetId(preset.id);
    setShowCustomTopLine(Boolean(preset.topText));
    setCustomTopText(preset.topText);
    setCustomMainText(preset.mainText);
    setCustomSubText('');
    setIsVisibleOnStage(true);
    setTriggerNonce((n) => n + 1);
  };

  // Build active payload for `<CenterUpperInfoHUD>`
  const activePayload: CenterUpperInfoPayload | null = isVisibleOnStage
    ? activeVariant === 'countdown'
      ? {
          variant: 'countdown',
          topText: '',
          mainText: countdownStep === 'GO' ? goLabelText : countdownStep,
          glow: glowConfig,
          typography: typoConfig,
          timing: {
            ...timingConfig,
            persistentInspect: isSequencePlaying ? false : timingConfig.persistentInspect,
          },
          triggerKey: triggerNonce,
        }
      : activeVariant === 'winner'
      ? {
          variant: 'winner',
          topText: winnerTopText,
          mainText: winnerMainText,
          subText: winnerSubText,
          glow: glowConfig,
          typography: typoConfig,
          timing: timingConfig,
          triggerKey: triggerNonce,
        }
      : {
          variant: 'announcement',
          topText: showCustomTopLine ? customTopText : '',
          mainText: customMainText,
          subText: customSubText,
          glow: glowConfig,
          typography: typoConfig,
          timing: timingConfig,
          triggerKey: triggerNonce,
        }
    : null;

  // Compute preview stage background CSS
  const getStageBackgroundStyle = (): React.CSSProperties => {
    const brightFactor = stageBrightness / 100;
    if (stageBgMode === 'solid') {
      return {
        backgroundColor: stageBgColor,
        backgroundImage: `radial-gradient(circle at 50% ${upperCenterTopPct}%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,${(
          1 -
          brightFactor * 0.85
        ).toFixed(2)}) 85%)`,
      };
    }
    if (stageBgMode === 'gradient') {
      return {
        backgroundColor: stageBgColor,
        backgroundImage: `radial-gradient(ellipse at 50% ${upperCenterTopPct}%, ${stageBgSecondaryColor} 0%, ${stageBgColor} 78%)`,
        filter: `brightness(${(0.45 + brightFactor * 0.7).toFixed(2)})`,
      };
    }
    return {
      backgroundColor: stageBgColor,
    };
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      {/* Top Jump Directory */}
      <PageJumpDirectory
        layerTag="Layer 5E · HUD Anchor Upper-Center Strong Reminder"
        title="Center-Upper Information 中心偏上强提醒信息系统"
        subtitle="基于 L2 HudAnchorStage (upper-center 锚点 Y=40%) 构建的零耦合强提醒层：支持 3-2-1-GO 覆盖式倒计时、Regular (400) + Thin (100) 双层 Winner 战果播报、自定义赛况公告与参数一键导出。"
        items={DIRECTORY_ITEMS}
        isLight={isLight}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: LIVE UPPER-CENTER HUD ANCHOR STAGE & QUICK TRIGGERS      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section
        id="center-upper-stage"
        className={`p-5 rounded-3xl border flex flex-col gap-5 scroll-mt-24 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-xl'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="amber" size="sm" isLight={isLight}>
              5E-1
            </Badge>
            <h2 className="text-base font-bold tracking-tight">
              HudAnchorStage (`anchor=&quot;upper-center&quot;`) · 中心偏上强提醒实时预览舞台
            </h2>
            <Badge variant="primary" size="sm" isLight={isLight}>
              JetBrains Mono Thin (100) + Regular (400)
            </Badge>
            <Badge variant="success" size="sm" isLight={isLight}>
              Zero Coupling · 独立组件
            </Badge>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ToggleSwitch
              label="周边赛场 HUD 参考"
              checked={showSurroundingHud}
              onCheckedChange={setShowSurroundingHud}
              isLight={isLight}
            />
            <ToggleSwitch
              label="锚点辅助十字线"
              checked={showAnchorGuides}
              onCheckedChange={setShowAnchorGuides}
              isLight={isLight}
            />
            <ToggleSwitch
              label="常驻调参 (不自动消失)"
              checked={timingConfig.persistentInspect ?? false}
              onCheckedChange={(v) => {
                setTimingConfig((prev) => ({ ...prev, persistentInspect: v }));
                setIsVisibleOnStage(true);
                setTriggerNonce((n) => n + 1);
              }}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Mode Switcher & Instant Action Deck */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col gap-3.5 ${
            isLight
              ? 'bg-neutral-50/90 border-neutral-200/90'
              : 'bg-neutral-950/70 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Archetype Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>强提醒类型 (仅切换文本，不改底下参数):</span>
              </span>
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={activeVariant}
                onValueChange={(v) => handleSelectVariant(v as CenterUpperInfoVariant)}
                options={[
                  { value: 'countdown', label: '① 3-2-1-GO 倒计时' },
                  { value: 'winner', label: '② WINNER 战果' },
                  { value: 'announcement', label: '③ Custom Announcement' },
                ]}
              />
            </div>

            {/* Replay Trigger Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsVisibleOnStage(true);
                  setTriggerNonce((n) => n + 1);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer transition-all shadow-xs active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>
                  触发入场冲击 ({timingConfig.entryScale.toFixed(2)}x · {timingConfig.entryDurationMs}ms 入场 · {timingConfig.durationMs}ms 后 {timingConfig.exitDurationMs}ms 淡出)
                </span>
              </button>
            </div>
          </div>

          {/* Context-Sensitive Sub-Controls per Archetype */}
          {activeVariant === 'countdown' && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    isSequencePlaying ? stopCountdownSequence() : startCountdownSequence()
                  }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                    isSequencePlaying
                      ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                      : 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-sm hover:bg-emerald-400'
                  }`}
                >
                  {isSequencePlaying ? (
                    <>
                      <Square className="h-3.5 w-3.5 fill-current" />
                      <span>停止倒计时序列 (Stop)</span>
                    </>
                  ) : (
                    <>
                      <Timer className="h-3.5 w-3.5" />
                      <span>
                        ▶ 播放完整 3 → 2 → 1 → {goLabelText} ({countdownIntervalMs}ms 覆盖 · 末步 {timingConfig.durationMs}ms 后淡出)
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setLoopSequence((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                    loopSequence
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-300 text-neutral-600'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  <span>循环: {loopSequence ? 'ON' : 'OFF'}</span>
                </button>

                <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-800 mx-1" />

                <span className="text-[11px] font-mono opacity-70">单步触发覆盖:</span>
                {(['3', '2', '1', 'GO'] as const).map((step) => {
                  const active = countdownStep === step;
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => {
                        stopCountdownSequence();
                        setCountdownStep(step);
                        setIsVisibleOnStage(true);
                        setTriggerNonce((n) => n + 1);
                      }}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border cursor-pointer transition-all ${
                        active
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs'
                          : isLight
                          ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                          : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                      }`}
                    >
                      {step === 'GO' ? goLabelText : step}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono opacity-75">GO 文本:</span>
                <SegmentedSwitch
                  size="sm"
                  isLight={isLight}
                  value={goLabelText}
                  onValueChange={(v) => {
                    setGoLabelText(v);
                    setIsVisibleOnStage(true);
                    setTriggerNonce((n) => n + 1);
                  }}
                  options={[
                    { value: 'GO', label: 'GO' },
                    { value: 'GO!', label: 'GO!' },
                  ]}
                />
              </div>
            </div>
          )}

          {activeVariant === 'winner' && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold flex items-center gap-1 text-sky-500">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>获胜队伍文本预设 (仅改文本):</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectWinnerTeam('blue')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                    winnerTeam === 'blue'
                      ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-sky-50 border-neutral-300 text-sky-700'
                      : 'bg-neutral-900 hover:bg-sky-950/40 border-neutral-700 text-sky-400'
                  }`}
                >
                  WINNER · BLUE TEAM (蓝队胜)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectWinnerTeam('orange')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                    winnerTeam === 'orange'
                      ? 'bg-orange-500 text-neutral-950 border-orange-400 shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-orange-50 border-neutral-300 text-orange-700'
                      : 'bg-neutral-900 hover:bg-orange-950/40 border-neutral-700 text-orange-400'
                  }`}
                >
                  WINNER · ORANGE TEAM (橙队胜)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectWinnerTeam('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                    winnerTeam === 'custom'
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-amber-50 border-neutral-300 text-amber-700'
                      : 'bg-neutral-900 hover:bg-amber-950/40 border-neutral-700 text-amber-400'
                  }`}
                >
                  WINNER · CHAMPIONS
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="opacity-70">上方 Regular(400):</span>
                  <input
                    type="text"
                    value={winnerTopText}
                    onChange={(e) => {
                      setWinnerTopText(e.target.value);
                      setIsVisibleOnStage(true);
                    }}
                    className={`w-28 px-2 py-1 rounded-lg border font-mono text-xs ${
                      isLight
                        ? 'bg-white border-neutral-300 text-neutral-900'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                    }`}
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="opacity-70">下方 Thin(100):</span>
                  <input
                    type="text"
                    value={winnerMainText}
                    onChange={(e) => {
                      setWinnerMainText(e.target.value);
                      setIsVisibleOnStage(true);
                    }}
                    className={`w-36 px-2 py-1 rounded-lg border font-mono text-xs ${
                      isLight
                        ? 'bg-white border-neutral-300 text-neutral-900'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                    }`}
                  />
                </label>
              </div>
            </div>
          )}

          {activeVariant === 'announcement' && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono font-bold flex items-center gap-1 text-emerald-500 mr-1">
                  <Megaphone className="h-3.5 w-3.5" />
                  <span>赛况强提醒预设 (仅改文本):</span>
                </span>
                {CUSTOM_ANNOUNCEMENT_PRESETS.map((preset) => {
                  const isSelected = customPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyCustomPreset(preset)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs'
                          : isLight
                          ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                          : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ToggleSwitch
                  label="显示上方 Regular 副标题"
                  checked={showCustomTopLine}
                  onCheckedChange={(v) => {
                    setShowCustomTopLine(v);
                    setIsVisibleOnStage(true);
                  }}
                  isLight={isLight}
                />
                {showCustomTopLine && (
                  <label className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="opacity-70">上方 Regular(400):</span>
                    <input
                      type="text"
                      value={customTopText}
                      onChange={(e) => {
                        setCustomTopText(e.target.value);
                        setIsVisibleOnStage(true);
                      }}
                      className={`w-36 px-2 py-1 rounded-lg border font-mono text-xs ${
                        isLight
                          ? 'bg-white border-neutral-300 text-neutral-900'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                      }`}
                    />
                  </label>
                )}
                <label className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="opacity-70">主行 Thin(100):</span>
                  <input
                    type="text"
                    value={customMainText}
                    onChange={(e) => {
                      setCustomMainText(e.target.value);
                      setIsVisibleOnStage(true);
                    }}
                    className={`w-56 px-2 py-1 rounded-lg border font-mono text-xs ${
                      isLight
                        ? 'bg-white border-neutral-300 text-neutral-900'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                    }`}
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="opacity-70">底部胶囊注脚 (默认留空不用):</span>
                  <input
                    type="text"
                    value={customSubText}
                    placeholder="默认留空不显示"
                    onChange={(e) => {
                      setCustomSubText(e.target.value);
                      setIsVisibleOnStage(true);
                    }}
                    className={`w-44 px-2 py-1 rounded-lg border font-mono text-xs ${
                      isLight
                        ? 'bg-white border-neutral-300 text-neutral-900'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                    }`}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* FULL 16:9 HUD ANCHOR STAGE PREVIEW CANVAS                        */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <div
          className="relative w-full h-[500px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl transition-colors duration-200"
          style={getStageBackgroundStyle()}
        >
          {/* Optional Arena Preset Backdrop */}
          {stageBgMode === 'arena' && (
            <ArenaBackdrop
              preset={arenaPreset}
              brightness={stageBrightness}
              showPitchMarkings={showPitchLines}
            />
          )}

          {/* Optional Pitch Markings when in Solid / Gradient custom background color mode */}
          {stageBgMode !== 'arena' && showPitchLines && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/70 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-44 h-44 rounded-full border border-white/70 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-white/80 -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Optional Upper-Center vs. Center Optical Guide Overlay */}
          {showAnchorGuides && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Vertical centerline */}
              <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-amber-400/25 -translate-x-1/2" />
              {/* Upper-Center horizontal axis */}
              <div
                className="absolute inset-x-0 h-px border-t border-dashed border-amber-400/45 transition-all duration-150"
                style={{ top: `${upperCenterTopPct}%` }}
              >
                <span className="absolute right-3 -top-5 px-1.5 py-0.5 rounded bg-black/65 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                  HudZone anchor=&quot;upper-center&quot; (Y = {upperCenterTopPct}%)
                </span>
              </div>
              {/* Screen Center (50% car reticle reference) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40">
                <Crosshair className="h-4 w-4 text-white" />
                <span className="text-[9px] font-mono text-white bg-black/50 px-1.5 py-0.5 rounded">
                  50% Center (Car Reticle Zone)
                </span>
              </div>
            </div>
          )}

          {/* L2 HudAnchorStage Shell */}
          <HudAnchorStage strategy="reserve" style={{ fontFamily: 'var(--font-jetbrains)' }}>
            {/* Reference Surrounding HUD (Optional toggle to inspect coexistence with 5A widgets) */}
            {showSurroundingHud && (
              <>
                <HudZone anchor="top-center" flush zIndexClassName="z-30">
                  <StepperScoreboardHUD
                    isLight={false}
                    leftScore={2}
                    rightScore={1}
                    seconds={134}
                    bestOf={5}
                    leftSeriesWins={2}
                    rightSeriesWins={1}
                  />
                </HudZone>

                <HudZone anchor="top-left" flush className="pt-[56px]">
                  <EdgePlayerHudStrip
                    side="left"
                    teamColor="#2563EB"
                    barColor="#3B82F6"
                    isLight={false}
                    viewMode="player-live"
                    players={DEFAULT_INITIAL_ROSTER.leftPlayers}
                  />
                </HudZone>

                <HudZone anchor="bottom-left">
                  <BallCameraIndicator
                    active={true}
                    shortcut="SPACE"
                    label="BALL CAM"
                    actionText="TO TOGGLE"
                    isLight={false}
                  />
                </HudZone>

                <HudZone anchor="bottom-center">
                  <div className="w-[320px] max-w-[40vw]">
                    <VelocityProgressBar speed={1640} width="100%" height={14} />
                  </div>
                </HudZone>

                <HudZone anchor="bottom-right">
                  <CircularBoostGauge amount={85} size={118} isLight={false} />
                </HudZone>
              </>
            )}

            {/* ★ TARGET UPPER-CENTER STRONG REMINDER ZONE (`anchor="upper-center"`) ★ */}
            <HudZone
              anchor="upper-center"
              zIndexClassName="z-40"
              style={{ top: `${upperCenterTopPct}%` }}
            >
              <HudSlot visible={true} mode="reserve">
                <CenterUpperInfoHUD
                  info={activePayload}
                  glowConfig={glowConfig}
                  typographyConfig={typoConfig}
                  timingConfig={timingConfig}
                  onExpire={() => {
                    if (!isSequencePlaying && !timingConfig.persistentInspect) {
                      setIsVisibleOnStage(false);
                    }
                  }}
                />
              </HudSlot>
            </HudZone>
          </HudAnchorStage>

          {/* Top-Right Live Telemetry Status Bar inside Stage */}
          <div className="absolute top-3 right-3 z-40 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md text-[11px] font-mono text-neutral-200 pointer-events-none">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              Mode: <strong className="text-amber-400 uppercase">{activeVariant}</strong>
            </span>
            <span className="opacity-30">|</span>
            <span>
              Scale: <strong className="text-emerald-400">{timingConfig.entryScale.toFixed(2)}x</strong>
            </span>
            <span className="opacity-30">|</span>
            <span>
              Hold: <strong className="text-sky-400">{timingConfig.durationMs}ms</strong>
            </span>
            <span className="opacity-30">|</span>
            <span>
              FadeOut: <strong className="text-rose-400">{timingConfig.exitDurationMs}ms</strong>
            </span>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* STAGE BACKGROUND COLOR & ENVIRONMENT BAR                         */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <div
          className={`p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-4 ${
            isLight
              ? 'bg-neutral-50/80 border-neutral-200'
              : 'bg-neutral-950/60 border-neutral-800'
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-amber-500" />
                <span>预览背景模式 (Stage Backdrop)</span>
              </span>
            </div>
            <SegmentedSwitch
              size="sm"
              fullWidth
              isLight={isLight}
              value={stageBgMode}
              onValueChange={(v) => setStageBgMode(v as StageBgMode)}
              options={[
                { value: 'solid', label: '纯色背景 (Solid)' },
                { value: 'gradient', label: '双色渐变 (Gradient)' },
                { value: 'arena', label: '球场预设 (Arena)' },
              ]}
            />
            {stageBgMode === 'arena' && (
              <SegmentedSwitch
                size="sm"
                fullWidth
                isLight={isLight}
                value={arenaPreset}
                onValueChange={(v) => setArenaPreset(v as ArenaLightingPreset)}
                options={[
                  { value: 'night', label: 'Night' },
                  { value: 'twilight', label: 'Twilight' },
                  { value: 'daylight', label: 'Daylight' },
                ]}
              />
            )}
          </div>

          <div>
            <ColorSwatchInput
              label="预览背景主色 (Background Color)"
              description="随时切换深色/浅色/球场色检验 Out Glow 对比度"
              value={stageBgColor}
              onChange={setStageBgColor}
              presets={BG_COLOR_SWATCHES}
              isLight={isLight}
            />
          </div>

          <div className="flex flex-col justify-between gap-2">
            {stageBgMode === 'gradient' ? (
              <ColorSwatchInput
                label="渐变中心辅色 (Radial Core Color)"
                value={stageBgSecondaryColor}
                onChange={setStageBgSecondaryColor}
                presets={['#1E293B', '#0F172A', '#31102F', '#064E3B', '#3B2F13']}
                isLight={isLight}
              />
            ) : (
              <SliderControl
                label="背景环境明度 (Backdrop Brightness)"
                value={stageBrightness}
                min={10}
                max={100}
                step={1}
                unit="%"
                onChange={setStageBrightness}
                isLight={isLight}
              />
            )}
            <div className="flex items-center justify-between pt-1">
              <ToggleSwitch
                label="球场中线/中圈暗纹"
                checked={showPitchLines}
                onCheckedChange={setShowPitchLines}
                isLight={isLight}
              />
              <span className="text-[11px] font-mono opacity-60">16:9 Safe Stage</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 2: ROCKET LEAGUE OUT GLOW, DURATION & TYPOGRAPHY TUNERS     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section
        id="center-upper-tuner"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 scroll-mt-24"
      >
        {/* Top Export & Solidify Default Parameters Bar across all 3 columns */}
        <div
          className={`lg:col-span-3 p-4 rounded-2xl border flex flex-col gap-3 ${
            isLight
              ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-md'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="amber" size="sm" isLight={isLight}>
                5E-2
              </Badge>
              <span className="text-sm font-bold font-mono">
                参数微调与固化导出 (Tuner &amp; Default Solidifier)
              </span>
              <span className="text-xs font-mono opacity-65">
                所有滑块均支持点击数值直接输入精确值；调整完可一键复制 JSON/TS 固化为默认参数
              </span>
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

              <button
                type="button"
                onClick={handleCopy5EConfig}
                data-ui-action="export-5e-config"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                  copied5EConfig
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400'
                }`}
              >
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

              <button
                type="button"
                onClick={handleReset5EDefaults}
                title="重置 5E 全部参数回默认值"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>重置 5E 默认参数</span>
              </button>
            </div>
          </div>

          {showExported5ECode && (
            <CodeBlock
              title="当前 5E 调参快照 (可直接粘贴固化为默认值)"
              language="typescript"
              isLight={isLight}
              code={build5EExportCode()}
            />
          )}
        </div>

        {/* Column 1: Rocket League Yellow & Outer Glow (`Out Glow`) Parameters */}
        <div
          className={`p-5 rounded-3xl border flex flex-col gap-4 ${
            isLight
              ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold font-mono">
                1. 颜色与外发光 (Out Glow Tuner)
              </h3>
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

          <ColorSwatchInput
            label="主文字颜色 (Main Thin Text Color)"
            description="Rocket League 倒计时默认亮黄 #FFE600"
            value={glowConfig.textColor}
            onChange={(hex) => {
              setGlowConfig((prev) => ({
                ...prev,
                textColor: hex,
                ...(syncGlowWithText ? { glowColor: hex, topLabelGlowColor: hex } : {}),
              }));
              setIsVisibleOnStage(true);
            }}
            presets={RL_GLOW_SWATCHES}
            isLight={isLight}
          />

          <div className="flex items-center justify-between px-1">
            <ToggleSwitch
              label="外发光颜色跟随主文字"
              checked={syncGlowWithText}
              onCheckedChange={(sync) => {
                setSyncGlowWithText(sync);
                if (sync) {
                  setGlowConfig((prev) => ({
                    ...prev,
                    glowColor: prev.textColor,
                    topLabelGlowColor: prev.textColor,
                  }));
                }
                setIsVisibleOnStage(true);
              }}
              isLight={isLight}
            />
          </div>

          <ColorSwatchInput
            label="外发光颜色 (Out Glow Color)"
            description="多层光晕色 (默认琥珀金 #F59E0B)"
            value={glowConfig.glowColor}
            onChange={(hex) => {
              setGlowConfig((prev) => ({
                ...prev,
                glowColor: hex,
                topLabelGlowColor: hex,
              }));
              setIsVisibleOnStage(true);
            }}
            presets={RL_GLOW_SWATCHES}
            isLight={isLight}
          />

          <ColorSwatchInput
            label="上方 Regular 标题颜色 (Top Label)"
            description="Winner / Status 上方小字颜色"
            value={glowConfig.topLabelColor ?? '#FFFFFF'}
            onChange={(hex) => {
              setGlowConfig((prev) => ({
                ...prev,
                topLabelColor: hex,
              }));
              setIsVisibleOnStage(true);
            }}
            presets={['#FFFFFF', '#FEF08A', '#E0F2FE', '#FFEDD5', '#FFE600', '#94A3B8']}
            isLight={isLight}
          />

          <SliderControl
            label="Out Glow 发光总强度 (Glow Intensity)"
            value={glowConfig.intensityPct}
            min={0}
            max={200}
            step={1}
            unit="%"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, intensityPct: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />

          <SliderControl
            label="内核紧贴光晕半径 (Inner Core Blur)"
            value={glowConfig.innerBlurPx}
            min={0}
            max={40}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, innerBlurPx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />

          <SliderControl
            label="中层外发光半径 (Outer Glow Blur)"
            value={glowConfig.outerBlurPx}
            min={0}
            max={80}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, outerBlurPx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />

          <SliderControl
            label="远景氛围光晕半径 (Ambient Halo Blur)"
            value={glowConfig.ambientBlurPx}
            min={0}
            max={120}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, ambientBlurPx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />

          <SliderControl
            label="背景径向柔光烘托 (Backdrop Bloom)"
            value={glowConfig.backdropBloomPct ?? 0}
            min={0}
            max={100}
            step={1}
            unit="%"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, backdropBloomPct: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />

          <SliderControl
            label="字形描边宽度 (Text Stroke Width)"
            value={glowConfig.strokeWidthPx ?? 0}
            min={0}
            max={3}
            step={0.1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, strokeWidthPx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
        </div>

        {/* Column 2: Duration (2000ms Default) & Animation Envelope Tuner */}
        <div
          className={`p-5 rounded-3xl border flex flex-col gap-4 ${
            isLight
              ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-sky-500" />
              <h3 className="text-sm font-bold font-mono">
                2. 持续时间与动效包络 (Duration &amp; Motion)
              </h3>
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

          <SliderControl
            label="单次显示保持时长 (Hold Duration before Exit)"
            description="默认 2000ms (>1s)；出现满 2000ms 后进入 400ms 尾段淡出，中途新数据到来则直接覆盖"
            value={timingConfig.durationMs}
            min={200}
            max={5000}
            step={50}
            unit="ms"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => {
              setTimingConfig((prev) => ({ ...prev, durationMs: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />

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

          <SliderControl
            label="入场缩放冲击倍率 (Entry Scale Pop)"
            description="默认 1.50x (从 1.50 倍缩回 1.00 倍)；支持直接点击数字输入任意精度"
            value={timingConfig.entryScale}
            min={0.5}
            max={2.5}
            step={0.01}
            unit="x"
            editable
            allowOutOfBoundsInput
            formatValue={(v) => v.toFixed(2)}
            onChange={(v) => {
              setTimingConfig((prev) => ({
                ...prev,
                entryScale: Number(v.toFixed(2)),
              }));
              setIsVisibleOnStage(true);
              setTriggerNonce((n) => n + 1);
            }}
            isLight={isLight}
          />

          <SliderControl
            label="入场动画耗时 (Entry Pop Duration)"
            description="默认 400ms，从 1.50x 快速收缩凝聚到 1.00x"
            value={timingConfig.entryDurationMs}
            min={0}
            max={1000}
            step={10}
            unit="ms"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setTimingConfig((prev) => ({ ...prev, entryDurationMs: v }));
              setIsVisibleOnStage(true);
              setTriggerNonce((n) => n + 1);
            }}
            isLight={isLight}
          />

          <SliderControl
            label="尾段淡出耗时 (Exit Fade Duration)"
            description="默认 400ms；无新数据覆盖时，保持满 2000ms 后执行 400ms 尾段淡出"
            value={timingConfig.exitDurationMs}
            min={0}
            max={1000}
            step={10}
            unit="ms"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setTimingConfig((prev) => ({ ...prev, exitDurationMs: v }));
              setIsVisibleOnStage(true);
              setTriggerNonce((n) => n + 1);
            }}
            isLight={isLight}
          />

          <SliderControl
            label="3-2-1-GO 步进覆盖间隔 (Sequence Step Interval)"
            description="默认 1000ms；前一步尚未进入退出时间即被下一步直接覆盖重播入场动画"
            value={countdownIntervalMs}
            min={200}
            max={3000}
            step={50}
            unit="ms"
            editable
            allowOutOfBoundsInput
            onChange={(v) => setCountdownIntervalMs(v)}
            isLight={isLight}
          />

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold font-mono">
                HudAnchorStage 空间锚点位置 (Upper-Center)
              </span>
            </div>
            <SliderControl
              label="中心锚点位置 (Upper-Center Top %)"
              description="默认 40% (50% 为屏幕正中心)"
              value={upperCenterTopPct}
              min={15}
              max={60}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              onChange={(v) => {
                setUpperCenterTopPct(v);
                setIsVisibleOnStage(true);
              }}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Column 3: Typography Tuner (JetBrains Mono Thin 100 & Regular 400) */}
        <div
          className={`p-5 rounded-3xl border flex flex-col gap-4 ${
            isLight
              ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-bold font-mono">
                3. 字体层级调参 (JetBrains Mono)
              </h3>
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

          <SliderControl
            label="主信息字号 (Main Thin Font Size)"
            description="用于 3-2-1-GO、BLUE/ORANGE TEAM、WAITING FOR PLAYERS"
            value={typoConfig.mainFontSizePx}
            min={36}
            max={136}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setTypoConfig((prev) => ({ ...prev, mainFontSizePx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold">
              主信息字重 (Main Font Weight · 默认 Thin 100)
            </span>
            <SegmentedSwitch
              size="sm"
              fullWidth
              isLight={isLight}
              value={String(typoConfig.mainFontWeight)}
              onValueChange={(v) => {
                setTypoConfig((prev) => ({
                  ...prev,
                  mainFontWeight: Number(v) as 100 | 200 | 300 | 400,
                }));
                setIsVisibleOnStage(true);
              }}
              options={[
                { value: '100', label: 'Thin (100)' },
                { value: '200', label: 'ExtraLight (200)' },
                { value: '300', label: 'Light (300)' },
                { value: '400', label: 'Regular (400)' },
              ]}
            />
          </div>

          <SliderControl
            label="主信息字间距 (Main Letter Spacing · 默认 0)"
            value={typoConfig.mainLetterSpacingEm}
            min={-0.1}
            max={0.36}
            step={0.01}
            unit="em"
            editable
            allowOutOfBoundsInput
            formatValue={(v) => v.toFixed(2)}
            onChange={(v) => {
              setTypoConfig((prev) => ({
                ...prev,
                mainLetterSpacingEm: Number(v.toFixed(2)),
              }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex flex-col gap-3">
            <SliderControl
              label="上方标题字号 (Top Regular Font Size)"
              description="用于 WINNER 或赛况分类前缀"
              value={typoConfig.topFontSizePx}
              min={12}
              max={52}
              step={1}
              unit="px"
              editable
              allowOutOfBoundsInput
              onChange={(v) => {
                setTypoConfig((prev) => ({ ...prev, topFontSizePx: v }));
                setIsVisibleOnStage(true);
              }}
              isLight={isLight}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold">
                上方标题字重 (Top Font Weight · 默认 Regular 400)
              </span>
              <SegmentedSwitch
                size="sm"
                fullWidth
                isLight={isLight}
                value={String(typoConfig.topFontWeight)}
                onValueChange={(v) => {
                  setTypoConfig((prev) => ({
                    ...prev,
                    topFontWeight: Number(v) as 100 | 300 | 400 | 500,
                  }));
                  setIsVisibleOnStage(true);
                }}
                options={[
                  { value: '100', label: 'Thin (100)' },
                  { value: '300', label: 'Light (300)' },
                  { value: '400', label: 'Regular (400)' },
                  { value: '500', label: 'Medium (500)' },
                ]}
              />
            </div>

            <SliderControl
              label="上方标题字间距 (Top Letter Spacing · 默认 0)"
              value={typoConfig.topLetterSpacingEm}
              min={-0.1}
              max={0.6}
              step={0.01}
              unit="em"
              editable
              allowOutOfBoundsInput
              formatValue={(v) => v.toFixed(2)}
              onChange={(v) => {
                setTypoConfig((prev) => ({
                  ...prev,
                  topLetterSpacingEm: Number(v.toFixed(2)),
                }));
                setIsVisibleOnStage(true);
              }}
              isLight={isLight}
            />

            <SliderControl
              label="上下双行间距 (Line Gap)"
              value={typoConfig.lineGapPx}
              min={0}
              max={28}
              step={1}
              unit="px"
              editable
              allowOutOfBoundsInput
              onChange={(v) => {
                setTypoConfig((prev) => ({ ...prev, lineGapPx: v }));
                setIsVisibleOnStage(true);
              }}
              isLight={isLight}
            />

            <div className="flex items-center justify-between pt-1">
              <ToggleSwitch
                label="强制大写 (Uppercase)"
                checked={typoConfig.uppercase}
                onCheckedChange={(v) => {
                  setTypoConfig((prev) => ({ ...prev, uppercase: v }));
                  setIsVisibleOnStage(true);
                }}
                isLight={isLight}
              />
              <ToggleSwitch
                label="斜体动感 (Italic)"
                checked={typoConfig.italic ?? false}
                onCheckedChange={(v) => {
                  setTypoConfig((prev) => ({ ...prev, italic: v }));
                  setIsVisibleOnStage(true);
                }}
                isLight={isLight}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 3: STATIC ARCHETYPE COMPARISON GALLERY & AGENT CODE RECIPE  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section
        id="center-upper-archetypes"
        className={`p-5 rounded-3xl border flex flex-col gap-5 scroll-mt-24 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="amber" size="sm" isLight={isLight}>
              5E-3
            </Badge>
            <h2 className="text-sm font-bold font-mono">
              三类中心偏上强提醒视觉规范对照 (Countdown / Winner / Custom Announcement)
            </h2>
          </div>
          <span className="text-xs font-mono opacity-65">
            点击任意卡片仅切换文本并触发动画，绝不改动下方调参台参数
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 3-2-1-GO Countdown */}
          <div
            onClick={() => {
              handleSelectVariant('countdown');
              startCountdownSequence();
            }}
            className="group relative h-44 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: stageBgColor }}
          >
            <span className="absolute top-2.5 left-3 text-[10px] font-mono uppercase tracking-wider text-amber-400/90 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
              ① Countdown · 3-2-1-GO · 1.50x Pop
            </span>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontWeight: 100,
                fontSize: '68px',
                letterSpacing: '0em',
                color: '#FFE600',
                WebkitTextStroke: '1.2px #F59E0B',
              }}
              className="leading-none select-none"
            >
              3 · 2 · 1 · GO
            </div>
            <span className="absolute bottom-2.5 text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">
              点击在主舞台播放 3 → 2 → 1 → GO 序列 →
            </span>
          </div>

          {/* Card 2: Winner (Regular 400 + Thin 100) */}
          <div
            onClick={() => handleSelectWinnerTeam(winnerTeam === 'blue' ? 'orange' : 'blue')}
            className="group relative h-44 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: stageBgColor }}
          >
            <span className="absolute top-2.5 left-3 text-[10px] font-mono uppercase tracking-wider text-sky-400/90 bg-black/60 px-2 py-0.5 rounded border border-sky-500/30">
              ② Winner · Regular (400) + Thin (100)
            </span>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontWeight: 400,
                fontSize: '20px',
                letterSpacing: '0em',
                color: '#FFFFFF',
                WebkitTextStroke: '0.7px #F59E0B',
              }}
              className="leading-none select-none"
            >
              WINNER
            </div>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontWeight: 100,
                fontSize: '42px',
                letterSpacing: '0em',
                color: '#FFE600',
                WebkitTextStroke: '1.2px #F59E0B',
              }}
              className="leading-none select-none"
            >
              BLUE / ORANGE
            </div>
            <span className="absolute bottom-2.5 text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">
              点击切换 Blue Team / Orange Team 文本 →
            </span>
          </div>

          {/* Card 3: Custom Announcement (Match Paused / Waiting for Players) */}
          <div
            onClick={() =>
              handleApplyCustomPreset(
                CUSTOM_ANNOUNCEMENT_PRESETS.find((p) => p.id === 'waiting-players') ??
                  CUSTOM_ANNOUNCEMENT_PRESETS[0]
              )
            }
            className="group relative h-44 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: stageBgColor }}
          >
            <span className="absolute top-2.5 left-3 text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">
              ③ Custom · Unconstrained Center Container
            </span>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontWeight: 400,
                fontSize: '15px',
                letterSpacing: '0em',
                color: '#FFFFFF',
                WebkitTextStroke: '0.7px #F59E0B',
              }}
              className="leading-none select-none"
            >
              PRE-MATCH LOBBY
            </div>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontWeight: 100,
                fontSize: '32px',
                letterSpacing: '0em',
                color: '#FFE600',
                WebkitTextStroke: '1.2px #F59E0B',
              }}
              className="leading-none select-none whitespace-nowrap"
            >
              WAITING FOR PLAYERS
            </div>
            <span className="absolute bottom-2.5 text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">
              点击载入 WAITING FOR PLAYERS 超宽居中测试 →
            </span>
          </div>
        </div>

        {/* Decoupled Integration Recipe */}
        <CodeBlock
          title="零耦合 HudAnchorStage (upper-center, top=40%) + CenterUpperInfoHUD 集成代码配方"
          language="tsx"
          isLight={isLight}
          code={`import { HudAnchorStage, HudZone, HudSlot } from '@/layout/HudAnchorStage';
import { CenterUpperInfoHUD } from '@/hud/CenterUpperInfoHUD';

export function MatchUpperCenterOverlay() {
  return (
    <HudAnchorStage strategy="reserve">
      {/* 中心偏上强提醒区域 (默认 Top 40%，无宽度限制居中容器，与顶部计分牌和正中心准星解耦) */}
      <HudZone anchor="upper-center" style={{ top: '${upperCenterTopPct}%' }}>
        <HudSlot visible={true} mode="reserve">
          <CenterUpperInfoHUD
            info={{
              variant: '${activeVariant}',
              topText: '${activePayload?.topText ?? ''}', // JetBrains Mono Regular (400)
              mainText: '${activePayload?.mainText ?? '3'}', // JetBrains Mono Thin (100)
            }}
            glowConfig={{
              textColor: '${glowConfig.textColor}',
              glowColor: '${glowConfig.glowColor}',
              innerBlurPx: ${glowConfig.innerBlurPx},
              outerBlurPx: ${glowConfig.outerBlurPx},
              ambientBlurPx: ${glowConfig.ambientBlurPx},
              intensityPct: ${glowConfig.intensityPct},
              backdropBloomPct: ${glowConfig.backdropBloomPct ?? 0},
              strokeWidthPx: ${glowConfig.strokeWidthPx ?? 0},
            }}
            typographyConfig={{
              mainFontSizePx: ${typoConfig.mainFontSizePx},
              mainFontWeight: ${typoConfig.mainFontWeight},
              mainLetterSpacingEm: ${typoConfig.mainLetterSpacingEm},
              topFontSizePx: ${typoConfig.topFontSizePx},
              topFontWeight: ${typoConfig.topFontWeight},
              topLetterSpacingEm: ${typoConfig.topLetterSpacingEm},
              lineGapPx: ${typoConfig.lineGapPx},
              uppercase: ${typoConfig.uppercase},
              italic: ${typoConfig.italic ?? false},
            }}
            timingConfig={{
              durationMs: ${timingConfig.durationMs}, // 默认 2000ms 后进入 400ms 尾段淡出
              entryScale: ${timingConfig.entryScale}, // 默认 1.50x
              entryDurationMs: ${timingConfig.entryDurationMs}, // 默认 400ms
              exitDurationMs: ${timingConfig.exitDurationMs}, // 默认 400ms
            }}
          />
        </HudSlot>
      </HudZone>
    </HudAnchorStage>
  );
}`}
        />
      </section>
    </div>
  );
};
