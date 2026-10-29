import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../../stores/crossClientSync';
const useState = createScopedSyncedState('hud-spatial-sandbox');
import {
  createHudTransientChannel, DEFAULT_DEMO_INDICATOR_CONFIG, DEFAULT_INITIAL_ROSTER, EdgeDemoIndicatorConfig,
  HudRosterViewMode, MatchHudChoreographySignal,
} from '../../../hud/hudTransientChannel';
import { FLIP_WINDOW_SECONDS } from '../../../hud/FlipIndicatorPillHUD';
import { HudChoreographyControlDeck, FlipSimMode, JumpPlacementOption, } from './HudChoreographyControlDeck';
import { HudSpatialChoreographyStageCanvas } from './HudSpatialChoreographyStageCanvas';
import { Badge } from '../../../primitives/Badge';
import { HudLayoutStrategy, HudSlotMode, } from '../../../layout/HudAnchorStage';
export type { JumpPlacementOption, FlipSimMode };
export type ScorePresetKey = '1digit' | '2digit' | '3digit';
export const HudSpatialChoreographySandbox: React.FC<{ isLight?: boolean }> = React.memo(
  ({ isLight = true }) => {
    const channelRef = useRef(
      createHudTransientChannel({
        speed: 1680, boostAmount: 85,
        ballCamActive: true, scoreboard: {
          leftScore: 2, rightScore: 2,
          scoreDigits: 2, seconds: 164,
          isOvertime: false, overtimeChinOpen: false,
          overtimeChinText: 'OVERTIME', bestOf: 5,
          leftSeriesWins: 2, rightSeriesWins: 1,
          seriesResults: ['left', 'right', 'left', 'none', 'none'], },
        roster: DEFAULT_INITIAL_ROSTER, replayFooter: {
          visible: false, scorerName: 'Zen_Master_RL',
          goalSpeed: '118KPH', assisterName: 'You (Octane_99)',
          teamAccentColor: '#3B82F6', },
        respawnTimer: {
          remainingSeconds: 0, totalSeconds: 3.0,
          active: false, },
      }) );
    const [viewMode, setViewMode] = useState<HudRosterViewMode>('player-live');
    const [activeSignal, setActiveSignal] = useState<MatchHudChoreographySignal>('kickoff-will-start');
    const [bottomHudRetracted, setBottomHudRetracted] = useState<boolean>(false);
    const [instantCockpitTransition, setInstantCockpitTransition] = useState<boolean>(false);
    const [myTeamSide, setMyTeamSide] = useState<'blue' | 'orange'>('blue');
    const [slotExists, setSlotExists] = useState<Record<1 | 2 | 3 | 4 | 5 | 6, boolean>>({
      1: true, 2: true,
      3: true, 4: true,
      5: true, 6: true,
    });
    const [opponentDemoCompact, setOpponentDemoCompact] = useState<boolean>(true);
    const [persistentDemo, setPersistentDemo] = useState<boolean>(false);
    const persistentDemoRef = useRef<boolean>(false);
    persistentDemoRef.current = persistentDemo;
    const [demoIndicatorConfig, setDemoIndicatorConfig] = useState<EdgeDemoIndicatorConfig>({
      ...DEFAULT_DEMO_INDICATOR_CONFIG, });
    const [focusedSlot, setFocusedSlot] = useState<1 | 2 | 3 | 4 | 5 | 6 | null>(1);
    const [scorePreset, setScorePreset] = useState<ScorePresetKey>('1digit');
    const [overtimeChinOpen, setOvertimeChinOpen] = useState<boolean>(false);
    const [bestOf, setBestOf] = useState<0 | 3 | 5 | 7>(5);
    const [leftWins, setLeftWins] = useState<number>(2);
    const [rightWins, setRightWins] = useState<number>(1);
    const [hudThemeLight, setHudThemeLight] = useState<boolean>(isLight);
    useEffect(() => {
      setHudThemeLight(isLight);
    }, [isLight]);
    const [layoutStrategy, setLayoutStrategy] = useState<HudLayoutStrategy>('reserve');
    const [jumpPlacement, setJumpPlacement] = useState<JumpPlacementOption>('top-left');
    const [flipSimMode, setFlipSimMode] = useState<FlipSimMode>('auto-drain');
    const flipSimModeRef = useRef<FlipSimMode>('auto-drain');
    const [showTelemetryTopLeft, setShowTelemetryTopLeft] = useState<boolean>(true);
    const [showStackTopRight, setShowStackTopRight] = useState<boolean>(true);
    const [stackTrayOpen, setStackTrayOpen] = useState<boolean>(false);
    const [showBallCam, setShowBallCam] = useState<boolean>(true);
    const [notifSlideOpen, setNotifSlideOpen] = useState<boolean>(true);
    const [selfDemoActive, setSelfDemoActive] = useState<boolean>(false);
    const sandboxSectionRef = useRef<HTMLElement | null>(null);
    const selfDemoPillTextRef = useRef<HTMLSpanElement | null>(null);
    const demoEndTimestampsRef = useRef<Record<number, number>>({});
    useEffect(() => {
      const ch = channelRef.current;
      let rafId = 0;
      let lastSecTick = performance.now();
      let isStageVisible = true;
      let scrollCooldownUntil = 0;
      const sectionEl = sandboxSectionRef.current;
      let io: IntersectionObserver | null = null;
      if (sectionEl && typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver( (entries) => {
            if (entries[0]) {
              isStageVisible = entries[0].isIntersecting;
            } },
          { rootMargin: '150px' }
        );
        io.observe(sectionEl);
      }
      const onScrollCapture = () => {
        scrollCooldownUntil = performance.now() + 90;
      };
      window.addEventListener('scroll', onScrollCapture, { capture: true, passive: true });
      const loop = (now: number) => {
        rafId = requestAnimationFrame(loop);
        if (!isStageVisible || now < scrollCooldownUntil || document.hidden) {
          return;
        }
        const demoMap = demoEndTimestampsRef.current;
        const isPersistent = persistentDemoRef.current;
        const currentRoster = ch.getRoster();
        for (const keyStr of Object.keys(demoMap)) {
          const slotKey = Number(keyStr) as 1 | 2 | 3 | 4 | 5 | 6;
          const endAt = demoMap[slotKey];
          if (!endAt) continue;
          if (isPersistent) {
            const pinnedRem = 1.8;
            demoMap[slotKey] = now + pinnedRem * 1000;
            const existingSlot =
              slotKey <= 3 ? currentRoster.leftPlayers[slotKey - 1]
                : currentRoster.rightPlayers[slotKey - 4];
            if (
              !existingSlot?.isDemolished ||
              Math.abs((existingSlot?.demoRespawnRemainingSec ?? 0) - pinnedRem) > 0.01 ) {
              ch.updatePlayerSlot(slotKey, {
                isDemolished: true, demoRespawnRemainingSec: pinnedRem,
              });
              if (slotKey === 1) {
                ch.setRespawnTimer({
                  remainingSeconds: pinnedRem, totalSeconds: 3.0,
                  active: true, });
                if (selfDemoPillTextRef.current) {
                  selfDemoPillTextRef.current.textContent = `PERSISTENT DEMO (${pinnedRem.toFixed(1)}S)`;
                } }
            } continue;
          }
          const remainingSec = Math.max(0, (endAt - now) / 1000);
          if (remainingSec <= 0) {
            delete demoMap[slotKey];
            ch.updatePlayerSlot(slotKey, {
              isDemolished: false, demoRespawnRemainingSec: 0,
              demolishedAtMs: 0,
              boostAmount: 33, // Respawn with 33 boost as in Rocket League
            });
            if (slotKey === 1) {
              ch.setRespawnTimer({ remainingSeconds: 0, totalSeconds: 3.0, active: false });
              setSelfDemoActive(false);
            } } else {
            ch.updatePlayerSlot(slotKey, {
              isDemolished: true, demoRespawnRemainingSec: remainingSec,
            });
            if (slotKey === 1) {
              ch.setRespawnTimer({
                remainingSeconds: remainingSec, totalSeconds: 3.0,
                active: true, });
              if (selfDemoPillTextRef.current) {
                const nextPillText = `RESPAWN IN ${remainingSec.toFixed(1)}S`;
                if (selfDemoPillTextRef.current.textContent !== nextPillText) {
                  selfDemoPillTextRef.current.textContent = nextPillText;
                } }
            } }
        }
        const phase = now * 0.0012;
        const simSpeed = 1410 + Math.sin(phase) * 780;
        const selfBoost = Math.round(55 + Math.sin(phase * 0.9) * 44);
        ch.setSpeed(Math.max(200, Math.min(2300, simSpeed)));
        ch.setBoost(selfBoost, false);
        const slot1 = currentRoster.leftPlayers[0];
        if (slot1 && !slot1.isDemolished && slot1.boostAmount !== selfBoost) {
          ch.updatePlayerSlot(1, { boostAmount: selfBoost });
        }
        ch.setTelemetry({
          fps: Math.round(119 + Math.sin(phase * 2.1)), refreshHz: 120,
          renderScalePct: 100, physicsRateHz: 120.0,
          baseLatencyMs: Math.round(16 + Math.sin(phase * 0.7) * 3), extraLatencyMs: 0,
        });
        const mode = flipSimModeRef.current;
        if (mode === 'auto-drain') {
          const cycleSec = (now / 1000) % 2.4;
          if (cycleSec < 0.45) {
            ch.setFlip({
              hasFlip: true, status: 'grounded',
              remainingSeconds: FLIP_WINDOW_SECONDS, maxSeconds: FLIP_WINDOW_SECONDS,
            });
          } else if (cycleSec < 0.45 + FLIP_WINDOW_SECONDS) {
            const elapsedAir = cycleSec - 0.45;
            const remFlip = Math.max(0, FLIP_WINDOW_SECONDS - elapsedAir);
            ch.setFlip({
              hasFlip: true, status: 'countdown',
              remainingSeconds: remFlip, maxSeconds: FLIP_WINDOW_SECONDS,
            });
          } else {
            ch.setFlip({
              hasFlip: false, status: 'expired',
              remainingSeconds: 0, maxSeconds: FLIP_WINDOW_SECONDS,
            });
          } }
        if (now - lastSecTick >= 1000) {
          lastSecTick = now;
          const sb = ch.getScoreboard();
          const nextSec = sb.isOvertime ? sb.seconds + 1 : Math.max(0, sb.seconds - 1);
          ch.setScoreboard({ seconds: nextSec });
        } };
      rafId = requestAnimationFrame(loop);
      return () => {
        cancelAnimationFrame(rafId);
        io?.disconnect();
        window.removeEventListener('scroll', onScrollCapture, { capture: true });
      };
    }, []);
    const leftTeamColor = myTeamSide === 'blue' ? '#2563EB' : '#EA580C';
    const leftBarColor = myTeamSide === 'blue' ? '#3B82F6' : '#F97316';
    const rightTeamColor = myTeamSide === 'blue' ? '#EA580C' : '#2563EB';
    const rightBarColor = myTeamSide === 'blue' ? '#F97316' : '#3B82F6';
    const handleDispatchSignal = (signal: MatchHudChoreographySignal) => {
      setActiveSignal(signal);
      setInstantCockpitTransition(false); // Signals always use smooth GPU transitions
      if (signal === 'goal-replay-will-start') {
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({ visible: false });
      } else if (signal === 'goal-replay-started') {
        setBottomHudRetracted(true);
        setViewMode('goal-replay');
        channelRef.current.setRoster({ viewMode: 'goal-replay' });
        channelRef.current.setReplayFooter({
          visible: true, teamAccentColor: focusedSlot && focusedSlot >= 4 ? rightBarColor : leftBarColor,
        });
      } else if (signal === 'goal-replay-will-end') {
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({ visible: false });
      } else if (signal === 'kickoff-will-start') {
        setBottomHudRetracted(false);
        setViewMode('player-live');
        if (focusedSlot === null) {
          setFocusedSlot(1);
          channelRef.current.setRoster({ viewMode: 'player-live', focusedSlotKey: 1 });
        } else {
          channelRef.current.setRoster({ viewMode: 'player-live' });
        } channelRef.current.setReplayFooter({ visible: false });
      } };
    const handleModeChange = (mode: HudRosterViewMode) => {
      setInstantCockpitTransition(false);
      setViewMode(mode);
      channelRef.current.setRoster({ viewMode: mode });
      if (mode === 'goal-replay') {
        setActiveSignal('goal-replay-started');
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({
          visible: true, teamAccentColor: focusedSlot && focusedSlot >= 4 ? rightBarColor : leftBarColor,
        });
      } else {
        setActiveSignal('kickoff-will-start');
        setBottomHudRetracted(false);
        channelRef.current.setReplayFooter({ visible: false });
      } };
    const handleSelectPov = (slotKey: 1 | 2 | 3 | 4 | 5 | 6 | null) => {
      const isTransitioningNullInSpec =
        viewMode === 'spectator' && (slotKey === null || focusedSlot === null);
      setInstantCockpitTransition(isTransitioningNullInSpec);
      setFocusedSlot(slotKey);
      channelRef.current.setRoster({ focusedSlotKey: slotKey });
      channelRef.current.setReplayFooter({
        teamAccentColor: slotKey && slotKey >= 4 ? rightBarColor : leftBarColor, });
    };
    const handleToggleTeamSide = () => {
      setMyTeamSide((prev) => {
        const next = prev === 'blue' ? 'orange' : 'blue';
        const nextLeftBar = next === 'blue' ? '#3B82F6' : '#F97316';
        const nextRightBar = next === 'blue' ? '#F97316' : '#3B82F6';
        channelRef.current.setReplayFooter({
          teamAccentColor: focusedSlot && focusedSlot >= 4 ? nextRightBar : nextLeftBar, });
        return next;
      });
    };
    const handleToggleSlotExists = (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => {
      setSlotExists((prev) => {
        const nextVal = !prev[slotKey];
        const nextMap = { ...prev, [slotKey]: nextVal };
        channelRef.current.updatePlayerSlot(slotKey, { exists: nextVal });
        return nextMap;
      });
    };
    const handleApplyTeamSizePreset = (leftCount: 1 | 2 | 3, rightCount: 1 | 2 | 3) => {
      const nextMap: Record<1 | 2 | 3 | 4 | 5 | 6, boolean> = {
        1: leftCount >= 1, 2: leftCount >= 2,
        3: leftCount >= 3, 4: rightCount >= 1,
        5: rightCount >= 2, 6: rightCount >= 3,
      };
      setSlotExists(nextMap);
      ([1, 2, 3, 4, 5, 6] as const).forEach((k) => {
        channelRef.current.updatePlayerSlot(k, { exists: nextMap[k] });
      });
    };
    const handleToggleOpponentDemoCompact = () => {
      setOpponentDemoCompact((prev) => {
        const next = !prev;
        channelRef.current.setRoster({ opponentDemoCompact: next });
        return next;
      });
    };
    const handleUpdateDemoIndicatorConfig = (patch: Partial<EdgeDemoIndicatorConfig>) => {
      setDemoIndicatorConfig((prev) => {
        const next = { ...prev, ...patch };
        channelRef.current.setRoster({ demoIndicatorConfig: next });
        return next;
      });
    };
    const handleTriggerDemo = (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => {
      const now = performance.now();
      const wasAlreadyDemo = Boolean(demoEndTimestampsRef.current[slotKey]);
      if (persistentDemoRef.current && wasAlreadyDemo) {
        delete demoEndTimestampsRef.current[slotKey];
        channelRef.current.updatePlayerSlot(slotKey, {
          isDemolished: false, demoRespawnRemainingSec: 0,
          demolishedAtMs: 0, boostAmount: 33,
        });
        if (slotKey === 1) {
          setSelfDemoActive(false);
          channelRef.current.setRespawnTimer({ remainingSeconds: 0, totalSeconds: 3.0, active: false });
        }
        return;
      } demoEndTimestampsRef.current[slotKey] = now + 3000;
      if (slotKey === 1) {
        setSelfDemoActive(true);
        channelRef.current.setRespawnTimer({
          remainingSeconds: 3.0, totalSeconds: 3.0,
          active: true, });
      } channelRef.current.updatePlayerSlot(slotKey, {
        isDemolished: true, demoRespawnRemainingSec: persistentDemoRef.current ? 1.8 : 3.0,
        ...(wasAlreadyDemo ? {} : { demolishedAtMs: now }), });
    };
    const handleTogglePersistentDemo = () => {
      setPersistentDemo((prev) => {
        const next = !prev;
        persistentDemoRef.current = next;
        const now = performance.now();
        if (next) {
          const activeKeys = Object.keys(demoEndTimestampsRef.current);
          if (activeKeys.length === 0) {
            ([2, 4] as const).forEach((k, idx) => {
              if (slotExists[k]) {
                demoEndTimestampsRef.current[k] = now + 3000;
                channelRef.current.updatePlayerSlot(k, {
                  isDemolished: true, demoRespawnRemainingSec: 1.8,
                  demolishedAtMs: now + idx * 10, });
              } });
          } } else {
          for (const keyStr of Object.keys(demoEndTimestampsRef.current)) {
            const k = Number(keyStr) as 1 | 2 | 3 | 4 | 5 | 6;
            delete demoEndTimestampsRef.current[k];
            channelRef.current.updatePlayerSlot(k, {
              isDemolished: false, demoRespawnRemainingSec: 0,
              demolishedAtMs: 0, boostAmount: 33,
            });
          } setSelfDemoActive(false);
          channelRef.current.setRespawnTimer({ remainingSeconds: 0, totalSeconds: 3.0, active: false });
        }
        return next;
      });
    };
    const handleScorePresetChange = (preset: ScorePresetKey) => {
      setScorePreset(preset);
      if (preset === '1digit') {
        channelRef.current.setScoreboard({ leftScore: 2, rightScore: 2, scoreDigits: 2 });
      } else if (preset === '2digit') {
        channelRef.current.setScoreboard({ leftScore: 12, rightScore: 8, scoreDigits: 2 });
      } else {
        channelRef.current.setScoreboard({ leftScore: 104, rightScore: 99, scoreDigits: 3 });
      } };
    const handleTriggerOvertimeKickoff = () => {
      setOvertimeChinOpen(true);
      channelRef.current.setScoreboard({
        seconds: 0, isOvertime: true,
        overtimeChinOpen: true, overtimeChinText: 'OVERTIME',
      });
    };
    const handleToggleOvertimeChin = () => {
      const next = !overtimeChinOpen;
      setOvertimeChinOpen(next);
      channelRef.current.setScoreboard({ overtimeChinOpen: next });
    };
    const handleResetRegulation = () => {
      setOvertimeChinOpen(false);
      channelRef.current.setScoreboard({
        seconds: 164, isOvertime: false,
        overtimeChinOpen: false, });
    };
    const handleBestOfChange = (nextBo: 0 | 3 | 5 | 7) => {
      setBestOf(nextBo);
      const maxWins = nextBo > 0 ? Math.ceil(nextBo / 2) : 0;
      const clampedL = Math.min(leftWins, maxWins);
      const clampedR = Math.min(rightWins, maxWins);
      setLeftWins(clampedL);
      setRightWins(clampedR);
      channelRef.current.setScoreboard({
        bestOf: nextBo, leftSeriesWins: clampedL,
        rightSeriesWins: clampedR, });
    };
    const handleAddSeriesWin = (team: 'left' | 'right') => {
      const winsNeeded = bestOf > 0 ? Math.ceil(bestOf / 2) : 3;
      if (team === 'left') {
        const nextL = (leftWins + 1) % (winsNeeded + 1);
        setLeftWins(nextL);
        channelRef.current.setScoreboard({ leftSeriesWins: nextL });
      } else {
        const nextR = (rightWins + 1) % (winsNeeded + 1);
        setRightWins(nextR);
        channelRef.current.setScoreboard({ rightSeriesWins: nextR });
      } };
    const handleFlipSimModeChange = (nextMode: FlipSimMode) => {
      setFlipSimMode(nextMode);
      flipSimModeRef.current = nextMode;
      if (nextMode === 'grounded') {
        channelRef.current.setFlip({
          hasFlip: true, status: 'grounded',
          remainingSeconds: FLIP_WINDOW_SECONDS, maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 1, });
      } else if (nextMode === 'multi-flip') {
        channelRef.current.setFlip({
          hasFlip: true, status: 'grounded',
          remainingSeconds: FLIP_WINDOW_SECONDS, maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 2, });
      } else if (nextMode === 'unlimited') {
        channelRef.current.setFlip({
          hasFlip: true, status: 'unlimited',
          remainingSeconds: FLIP_WINDOW_SECONDS, maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 1, });
      } else if (nextMode === 'expired') {
        channelRef.current.setFlip({
          hasFlip: false, status: 'expired',
          remainingSeconds: 0, maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 0, });
      } else {
        channelRef.current.setFlip({
          flipsRemaining: 1, });
      } };
    const handleCycleFlipSimMode = () => {
      const order: FlipSimMode[] = ['auto-drain', 'grounded', 'multi-flip', 'unlimited', 'expired'];
      const next = order[(order.indexOf(flipSimMode) + 1) % order.length];
      handleFlipSimModeChange(next);
    };
    const winsNeededForBo = bestOf > 0 ? Math.ceil(bestOf / 2) : 0;
    const leftTopBandVisible =
      layoutStrategy === 'collapse-symmetric' ? showTelemetryTopLeft && showStackTopRight
        : showTelemetryTopLeft;
    const rightTopBandVisible =
      layoutStrategy === 'collapse-symmetric' ? showTelemetryTopLeft && showStackTopRight
        : showStackTopRight;
    const topBandSlotMode: HudSlotMode = layoutStrategy === 'reserve' ? 'reserve' : 'collapse';
    const isSpectatorFreeCam = viewMode === 'spectator' && focusedSlot === null;
    const isCockpitVisible = !bottomHudRetracted && !isSpectatorFreeCam;
    return (
      <section ref={sandboxSectionRef} className="flex flex-col gap-5">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-6 w-6 rounded-md bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-xs font-mono">
              5A.S
            </div>
            <h2 className="text-base font-bold tracking-tight">
              HudSpatialChoreographySandbox · 四阶段 Signal 动效总线 · 阵营互换 (`Switch Side`) · 敌方被炸置顶补位
            </h2>
            <Badge variant="primary" size="sm" isLight={isLight}>
              Goal Replay / Kickoff Signals · GPU `translate3d`
            </Badge>
            <Badge variant="amber" size="sm" isLight={isLight}>
              常驻 DOM 节点 · 0 React Re-render · 0 GC
            </Badge>
          </div>
        </div>
        {/* Interactive Control Deck */}
        <HudChoreographyControlDeck isLight={isLight} hudThemeLight={hudThemeLight}
          setHudThemeLight={setHudThemeLight} scorePreset={scorePreset}
          handleScorePresetChange={handleScorePresetChange} overtimeChinOpen={overtimeChinOpen}
          handleTriggerOvertimeKickoff={handleTriggerOvertimeKickoff}
          handleToggleOvertimeChin={handleToggleOvertimeChin} handleResetRegulation={handleResetRegulation}
          bestOf={bestOf} handleBestOfChange={handleBestOfChange} leftWins={leftWins} rightWins={rightWins}
          winsNeededForBo={winsNeededForBo} handleAddSeriesWin={handleAddSeriesWin} viewMode={viewMode}
          handleModeChange={handleModeChange} activeSignal={activeSignal}
          handleDispatchSignal={handleDispatchSignal} myTeamSide={myTeamSide}
          handleToggleTeamSide={handleToggleTeamSide} slotExists={slotExists}
          handleToggleSlotExists={handleToggleSlotExists} handleApplyTeamSizePreset={handleApplyTeamSizePreset}
          opponentDemoCompact={opponentDemoCompact}
          handleToggleOpponentDemoCompact={handleToggleOpponentDemoCompact} persistentDemo={persistentDemo}
          onTogglePersistentDemo={handleTogglePersistentDemo} demoIndicatorConfig={demoIndicatorConfig}
          onUpdateDemoIndicatorConfig={handleUpdateDemoIndicatorConfig} focusedSlot={focusedSlot}
          handleSelectPov={handleSelectPov} handleTriggerDemo={handleTriggerDemo} layoutStrategy={layoutStrategy}
          setLayoutStrategy={setLayoutStrategy} showTelemetryTopLeft={showTelemetryTopLeft}
          setShowTelemetryTopLeft={setShowTelemetryTopLeft} showStackTopRight={showStackTopRight}
          setShowStackTopRight={setShowStackTopRight} stackTrayOpen={stackTrayOpen}
          setStackTrayOpen={setStackTrayOpen} flipSimMode={flipSimMode}
          onFlipSimModeChange={handleFlipSimModeChange} jumpPlacement={jumpPlacement}
          setJumpPlacement={setJumpPlacement} showBallCam={showBallCam} setShowBallCam={setShowBallCam}
          notifSlideOpen={notifSlideOpen} setNotifSlideOpen={setNotifSlideOpen} />
        {/* FULL-VIEWPORT 16:9 HUD SPATIAL STAGE */}
        <HudSpatialChoreographyStageCanvas hudThemeLight={hudThemeLight} layoutStrategy={layoutStrategy}
          leftTopBandVisible={leftTopBandVisible} rightTopBandVisible={rightTopBandVisible}
          topBandSlotMode={topBandSlotMode} showTelemetryTopLeft={showTelemetryTopLeft}
          showStackTopRight={showStackTopRight} stackTrayOpen={stackTrayOpen} setStackTrayOpen={setStackTrayOpen}
          leftTeamColor={leftTeamColor} leftBarColor={leftBarColor} rightTeamColor={rightTeamColor}
          rightBarColor={rightBarColor} demoIndicatorConfig={demoIndicatorConfig} handleSelectPov={handleSelectPov}
          selfDemoActive={selfDemoActive} selfDemoPillTextRef={selfDemoPillTextRef} showBallCam={showBallCam}
          isCockpitVisible={isCockpitVisible} instantCockpitTransition={instantCockpitTransition}
          jumpPlacement={jumpPlacement} handleCycleFlipSimMode={handleCycleFlipSimMode}
          notifSlideOpen={notifSlideOpen} channel={channelRef.current} />
      </section>
    );
  }
);

HudSpatialChoreographySandbox.displayName = 'HudSpatialChoreographySandbox';
