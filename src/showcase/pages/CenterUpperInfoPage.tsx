import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Play, Square, Trophy, Timer, Megaphone, Repeat, } from 'lucide-react';
import {
  CenterUpperInfoPayload, CenterUpperGlowConfig, CenterUpperTypographyConfig, CenterUpperTimingConfig,
  CenterUpperInfoVariant, WinnerTeamPreset, DEFAULT_RL_COUNTDOWN_GLOW, DEFAULT_CENTER_UPPER_TYPOGRAPHY,
  DEFAULT_CENTER_UPPER_TIMING,
} from '../../hud/CenterUpperInfoHUD';
import { ArenaLightingPreset } from '../ArenaBackdrop';
import { Badge } from '../../primitives/Badge';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { PageJumpDirectory } from '../PageJumpDirectory';
import { useSyncedState, crossClientSync } from '../stores/crossClientSync';
import { CenterUpperTunerSection } from './center-upper-info/CenterUpperTunerSection';
import {
  DIRECTORY_ITEMS, CenterUpperStageBackdropBar, CenterUpperArchetypesSection, CenterUpperStageCanvas,
  CenterUpperAnnouncementControls, type StageBgMode, type CustomAnnouncementPreset,
} from './center-upper-info/CenterUpperArchetypesAndBackdrop';
export type { StageBgMode };
export const CenterUpperInfoPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [stageBgMode, setStageBgMode] = useSyncedState<StageBgMode>('5e:stageBgMode', 'solid');
  const [stageBgColor, setStageBgColor] = useSyncedState<string>('5e:stageBgColor', '#090D16');
  const [stageBgSecondaryColor, setStageBgSecondaryColor] = useSyncedState<string>(
    '5e:stageBgSecondaryColor', '#1E293B'
  );
  const [arenaPreset, setArenaPreset] = useSyncedState<ArenaLightingPreset>(
    '5e:arenaPreset', 'night'
  );
  const [stageBrightness, setStageBrightness] = useSyncedState<number>('5e:stageBrightness', 85);
  const [showPitchLines, setShowPitchLines] = useSyncedState<boolean>('5e:showPitchLines', true);
  const [showAnchorGuides, setShowAnchorGuides] = useSyncedState<boolean>(
    '5e:showAnchorGuides', true
  );
  const [showSurroundingHud, setShowSurroundingHud] = useSyncedState<boolean>(
    '5e:showSurroundingHud', true
  );
  const [upperCenterTopPct, setUpperCenterTopPct] = useSyncedState<number>(
    '5e:upperCenterTopPct', 40
  );
  const [activeVariant, setActiveVariant] = useSyncedState<CenterUpperInfoVariant>(
    '5e:activeVariant', 'countdown'
  );
  const [countdownStep, setCountdownStep] = useSyncedState<'3' | '2' | '1' | 'GO'>(
    '5e:countdownStep', '3'
  );
  const [goLabelText, setGoLabelText] = useSyncedState<string>('5e:goLabelText', 'GO');
  const [countdownIntervalMs, setCountdownIntervalMs] = useSyncedState<number>(
    '5e:countdownIntervalMs', 1000
  );
  const [isSequencePlaying, setIsSequencePlaying] = useSyncedState<boolean>(
    '5e:isSequencePlaying', false
  );
  const [loopSequence, setLoopSequence] = useSyncedState<boolean>('5e:loopSequence', false);
  const sequenceTimerRef = useRef<number | null>(null);
  const [winnerTeam, setWinnerTeam] = useSyncedState<WinnerTeamPreset>('5e:winnerTeam', 'blue');
  const [winnerTopText, setWinnerTopText] = useSyncedState<string>('5e:winnerTopText', 'WINNER');
  const [winnerMainText, setWinnerMainText] = useSyncedState<string>(
    '5e:winnerMainText', 'BLUE TEAM'
  );
  const [winnerSubText, setWinnerSubText] = useSyncedState<string>('5e:winnerSubText', '');
  const [customPresetId, setCustomPresetId] = useSyncedState<string>(
    '5e:customPresetId', 'match-paused'
  );
  const [showCustomTopLine, setShowCustomTopLine] = useSyncedState<boolean>(
    '5e:showCustomTopLine', true
  );
  const [customTopText, setCustomTopText] = useSyncedState<string>(
    '5e:customTopText', 'MATCH STATUS'
  );
  const [customMainText, setCustomMainText] = useSyncedState<string>(
    '5e:customMainText', 'MATCH PAUSED'
  );
  const [customSubText, setCustomSubText] = useSyncedState<string>('5e:customSubText', '');
  const [glowConfig, setGlowConfig] = useSyncedState<CenterUpperGlowConfig>('5e:glowConfig', {
    ...DEFAULT_RL_COUNTDOWN_GLOW,
  });
  const [syncGlowWithText, setSyncGlowWithText] = useSyncedState<boolean>(
    '5e:syncGlowWithText', false
  );
  const [typoConfig, setTypoConfig] = useSyncedState<CenterUpperTypographyConfig>(
    '5e:typoConfig',
    {
      ...DEFAULT_CENTER_UPPER_TYPOGRAPHY, }
  );
  const [timingConfig, setTimingConfig] = useSyncedState<CenterUpperTimingConfig>(
    '5e:timingConfig',
    {
      ...DEFAULT_CENTER_UPPER_TIMING, }
  );
  const [triggerNonce, setTriggerNonce] = useSyncedState<number>('5e:triggerNonce', 1);
  const [isVisibleOnStage, setIsVisibleOnStage] = useSyncedState<boolean>(
    '5e:isVisibleOnStage', true
  );
  const [copied5EConfig, setCopied5EConfig] = useState<boolean>(false);
  const [showExported5ECode, setShowExported5ECode] = useState<boolean>(false);
  const build5EExportCode = useCallback(() => {
    const snapshot = {
      upperCenterTopPct, goLabelText,
      countdownIntervalMs, glowConfig,
      timingConfig, typoConfig,
      stageBackdrop: {
        stageBgMode, stageBgColor,
        stageBgSecondaryColor, arenaPreset,
        stageBrightness, },
    };
    return `// 5E Center-Upper Default Parameters Snapshot
export const DEFAULT_5E_CENTER_UPPER_CONFIG = ${JSON.stringify(snapshot, null, 2)};`;
  }, [
    upperCenterTopPct, goLabelText,
    countdownIntervalMs, glowConfig,
    timingConfig, typoConfig,
    stageBgMode, stageBgColor,
    stageBgSecondaryColor, arenaPreset,
    stageBrightness,
  ]);
  const handleCopy5EConfig = useCallback(() => {
    const code = build5EExportCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    } setCopied5EConfig(true);
    window.setTimeout(() => setCopied5EConfig(false), 1800);
  }, [build5EExportCode]);
  const handleReset5EDaults = useCallback(() => {
    crossClientSync.resetAll({ scopePrefix: '5e:' });
  }, []);
  const stopCountdownSequence = useCallback(() => {
    if (sequenceTimerRef.current !== null) {
      window.clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    } setIsSequencePlaying(false);
  }, [setIsSequencePlaying]);
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
      } };
  }, []);
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
          sequenceTimerRef.current = window.setTimeout(() => {
            if (loopSequence) {
              idx = 0;
              runStep();
            } else {
              setIsSequencePlaying(false);
              if (!timingConfig.persistentInspect) {
                setIsVisibleOnStage(false);
              } }
          }, finalHoldPlusExitMs);
        } };
      runStep();
    }, [
      stopCountdownSequence, countdownIntervalMs,
      timingConfig.entryDurationMs, timingConfig.durationMs,
      timingConfig.exitDurationMs, timingConfig.persistentInspect,
      loopSequence, setActiveVariant,
      setIsSequencePlaying, setIsVisibleOnStage,
      setCountdownStep, setTriggerNonce,
    ]
  );
  const handleSelectVariant = (variant: CenterUpperInfoVariant) => {
    stopCountdownSequence();
    setActiveVariant(variant);
    setIsVisibleOnStage(true);
    setTriggerNonce((n) => n + 1);
  };
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
    } setIsVisibleOnStage(true);
    setTriggerNonce((n) => n + 1);
  };
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
  const activePayload: CenterUpperInfoPayload | null = isVisibleOnStage
    ? activeVariant === 'countdown' ? {
          variant: 'countdown', topText: '',
          mainText: countdownStep === 'GO' ? goLabelText : countdownStep, glow: glowConfig,
          typography: typoConfig, timing: {
            ...timingConfig, persistentInspect: isSequencePlaying ? false : timingConfig.persistentInspect,
          }, triggerKey: triggerNonce,
        } : activeVariant === 'winner'
      ? {
          variant: 'winner', topText: winnerTopText,
          mainText: winnerMainText, subText: winnerSubText,
          glow: glowConfig, typography: typoConfig,
          timing: timingConfig, triggerKey: triggerNonce,
        } : {
          variant: 'announcement', topText: showCustomTopLine ? customTopText : '',
          mainText: customMainText, subText: customSubText,
          glow: glowConfig, typography: typoConfig,
          timing: timingConfig, triggerKey: triggerNonce,
        } : null;
  const getStageBackgroundStyle = (): React.CSSProperties => {
    const brightFactor = stageBrightness / 100;
    if (stageBgMode === 'solid') {
      return {
        backgroundColor: stageBgColor,
        backgroundImage: `radial-gradient(circle at 50% ${upperCenterTopPct}%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,${(
          1 - brightFactor * 0.85
        ).toFixed(2)}) 85%)`, };
    }
    if (stageBgMode === 'gradient') {
      return {
        backgroundColor: stageBgColor,
        backgroundImage: `radial-gradient(ellipse at 50% ${upperCenterTopPct}%, ${stageBgSecondaryColor} 0%, ${stageBgColor} 78%)`,
        filter: `brightness(${(0.45 + brightFactor * 0.7).toFixed(2)})`, };
    }
    return {
      backgroundColor: stageBgColor, };
  };
  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      {/* Top Jump Directory */}
      <PageJumpDirectory layerTag="Layer 5E · HUD Anchor Upper-Center Strong Reminder"
        title="Center-Upper Information 中心偏上强提醒信息系统"
        subtitle="基于 L2 HudAnchorStage (upper-center 锚点 Y=40%) 构建的零耦合强提醒层：支持 3-2-1-GO 覆盖式倒计时、Regular (400) + Thin (100) 双层 Winner 战果播报、自定义赛况公告与参数一键导出。"
        items={DIRECTORY_ITEMS} isLight={isLight} />
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: LIVE UPPER-CENTER HUD ANCHOR STAGE & QUICK TRIGGERS      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section id="center-upper-stage" className={`p-5 rounded-3xl border flex flex-col gap-5 scroll-mt-24 ${
        isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-xl' }`}>
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
            <ToggleSwitch label="周边赛场 HUD 参考" checked={showSurroundingHud} onCheckedChange={setShowSurroundingHud}
              isLight={isLight} />
            <ToggleSwitch label="锚点辅助十字线" checked={showAnchorGuides} onCheckedChange={setShowAnchorGuides}
              isLight={isLight} />
            <ToggleSwitch label="常驻调参 (不自动消失)" checked={timingConfig.persistentInspect ?? false}
              onCheckedChange={(v) => { setTimingConfig((prev) => ({ ...prev, persistentInspect: v }));
              setIsVisibleOnStage(true); setTriggerNonce((n) => n + 1); }} isLight={isLight} />
          </div>
        </div>
        {/* Mode Switcher & Instant Action Deck */}
        <div className={`p-3.5 rounded-2xl border flex flex-col gap-3.5 ${ isLight
          ? 'bg-neutral-50/90 border-neutral-200/90' : 'bg-neutral-950/70 border-neutral-800' }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Archetype Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>强提醒类型 (仅切换文本，不改底下参数):</span>
              </span>
              <SegmentedSwitch size="sm" isLight={isLight} value={activeVariant}
                onValueChange={(v) => handleSelectVariant(v as CenterUpperInfoVariant)} options={[
                { value: 'countdown', label: '① 3-2-1-GO 倒计时' }, { value: 'winner', label: '② WINNER 战果' },
                { value: 'announcement', label: '③ Custom Announcement' }, ]} />
            </div>
            {/* Replay Trigger Button */}
            <div className="flex items-center gap-2">
              <button
                type="button" onClick={() => {
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
                  type="button" onClick={() =>
                    isSequencePlaying ? stopCountdownSequence() : startCountdownSequence() }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                    isSequencePlaying ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                      : 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-sm hover:bg-emerald-400'
                  }`} >
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
                  type="button" onClick={() => setLoopSequence((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                    loopSequence ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 font-bold'
                      : isLight ? 'bg-white border-neutral-300 text-neutral-600'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400' }`}
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
                      key={step} type="button"
                      onClick={() => {
                        stopCountdownSequence();
                        setCountdownStep(step);
                        setIsVisibleOnStage(true);
                        setTriggerNonce((n) => n + 1);
                      }}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border cursor-pointer transition-all ${
                        active ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs'
                          : isLight ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                          : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200' }`}
                    >
                      {step === 'GO' ? goLabelText : step}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono opacity-75">GO 文本:</span>
                <SegmentedSwitch size="sm" isLight={isLight} value={goLabelText} onValueChange={(v) => {
                  setGoLabelText(v); setIsVisibleOnStage(true); setTriggerNonce((n) => n + 1); }} options={[
                  { value: 'GO', label: 'GO' }, { value: 'GO!', label: 'GO!' }, ]} />
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
                  type="button" onClick={() => handleSelectWinnerTeam('blue')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                    winnerTeam === 'blue' ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow-xs'
                      : isLight ? 'bg-white hover:bg-sky-50 border-neutral-300 text-sky-700'
                      : 'bg-neutral-900 hover:bg-sky-950/40 border-neutral-700 text-sky-400' }`}
                >
                  WINNER · BLUE TEAM (蓝队胜)
                </button>
                <button
                  type="button" onClick={() => handleSelectWinnerTeam('orange')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                    winnerTeam === 'orange' ? 'bg-orange-500 text-neutral-950 border-orange-400 shadow-xs'
                      : isLight ? 'bg-white hover:bg-orange-50 border-neutral-300 text-orange-700'
                      : 'bg-neutral-900 hover:bg-orange-950/40 border-neutral-700 text-orange-400' }`}
                >
                  WINNER · ORANGE TEAM (橙队胜)
                </button>
                <button
                  type="button" onClick={() => handleSelectWinnerTeam('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                    winnerTeam === 'custom' ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs'
                      : isLight ? 'bg-white hover:bg-amber-50 border-neutral-300 text-amber-700'
                      : 'bg-neutral-900 hover:bg-amber-950/40 border-neutral-700 text-amber-400' }`}
                >
                  WINNER · CHAMPIONS
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="opacity-70">上方 Regular(400):</span>
                  <input type="text" value={winnerTopText} onChange={(e) => { setWinnerTopText(e.target.value);
                    setIsVisibleOnStage(true); }} className={`w-28 px-2 py-1 rounded-lg border font-mono text-xs ${
                    isLight ? 'bg-white border-neutral-300 text-neutral-900'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-100' }`} />
                </label>
                <label className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="opacity-70">下方 Thin(100):</span>
                  <input type="text" value={winnerMainText} onChange={(e) => { setWinnerMainText(e.target.value);
                    setIsVisibleOnStage(true); }} className={`w-36 px-2 py-1 rounded-lg border font-mono text-xs ${
                    isLight ? 'bg-white border-neutral-300 text-neutral-900'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-100' }`} />
                </label>
              </div>
            </div>
          )}
          {activeVariant === 'announcement' && (
            <CenterUpperAnnouncementControls isLight={isLight} customPresetId={customPresetId}
              handleApplyCustomPreset={handleApplyCustomPreset} showCustomTopLine={showCustomTopLine}
              setShowCustomTopLine={setShowCustomTopLine} customTopText={customTopText}
              setCustomTopText={setCustomTopText} customMainText={customMainText}
              setCustomMainText={setCustomMainText} customSubText={customSubText}
              setCustomSubText={setCustomSubText} setIsVisibleOnStage={setIsVisibleOnStage} />
          )}
        </div>
        {/* FULL 16:9 HUD ANCHOR STAGE PREVIEW CANVAS */}
        <CenterUpperStageCanvas stageBgMode={stageBgMode} arenaPreset={arenaPreset}
          stageBrightness={stageBrightness} showPitchLines={showPitchLines} showAnchorGuides={showAnchorGuides}
          upperCenterTopPct={upperCenterTopPct} showSurroundingHud={showSurroundingHud}
          activePayload={activePayload} glowConfig={glowConfig} typoConfig={typoConfig} timingConfig={timingConfig}
          activeVariant={activeVariant} isSequencePlaying={isSequencePlaying}
          setIsVisibleOnStage={setIsVisibleOnStage} getStageBackgroundStyle={getStageBackgroundStyle} />
        <CenterUpperStageBackdropBar isLight={isLight} stageBgMode={stageBgMode} setStageBgMode={setStageBgMode}
          arenaPreset={arenaPreset} setArenaPreset={setArenaPreset} stageBgColor={stageBgColor}
          setStageBgColor={setStageBgColor} stageBgSecondaryColor={stageBgSecondaryColor}
          setStageBgSecondaryColor={setStageBgSecondaryColor} stageBrightness={stageBrightness}
          setStageBrightness={setStageBrightness} showPitchLines={showPitchLines}
          setShowPitchLines={setShowPitchLines} />
      </section>
      <CenterUpperTunerSection isLight={isLight} showExported5ECode={showExported5ECode}
        setShowExported5ECode={setShowExported5ECode} copied5EConfig={copied5EConfig}
        handleCopy5EConfig={handleCopy5EConfig} handleReset5EDefaults={handleReset5EDaults}
        build5EExportCode={build5EExportCode} glowConfig={glowConfig} setGlowConfig={setGlowConfig}
        syncGlowWithText={syncGlowWithText} setSyncGlowWithText={setSyncGlowWithText} timingConfig={timingConfig}
        setTimingConfig={setTimingConfig} typoConfig={typoConfig} setTypoConfig={setTypoConfig}
        countdownIntervalMs={countdownIntervalMs} setCountdownIntervalMs={setCountdownIntervalMs}
        upperCenterTopPct={upperCenterTopPct} setUpperCenterTopPct={setUpperCenterTopPct}
        setIsVisibleOnStage={setIsVisibleOnStage} setTriggerNonce={setTriggerNonce} />
      <CenterUpperArchetypesSection isLight={isLight} stageBgColor={stageBgColor} winnerTeam={winnerTeam}
        activeVariant={activeVariant} upperCenterTopPct={upperCenterTopPct} activePayload={activePayload}
        glowConfig={glowConfig} typoConfig={typoConfig} timingConfig={timingConfig}
        handleSelectVariant={handleSelectVariant} startCountdownSequence={startCountdownSequence}
        handleSelectWinnerTeam={handleSelectWinnerTeam} handleApplyCustomPreset={handleApplyCustomPreset} />
    </div>
  );
};
