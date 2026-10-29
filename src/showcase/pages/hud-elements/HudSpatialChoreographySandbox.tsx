import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../../stores';
import { Layers, Zap, Cpu, Target, Activity, Sliders, X } from 'lucide-react';

const useState = createScopedSyncedState('hud-spatial-sandbox');
import {
  createHudTransientChannel,
  DEFAULT_DEMO_INDICATOR_CONFIG,
  DEFAULT_INITIAL_ROSTER,
  EdgeDemoIndicatorConfig,
  HudRosterViewMode,
  MatchHudChoreographySignal,
} from '../../../hud/hudTransientChannel';
import { StepperScoreboardHUD } from '../../../hud/StepperScoreboardHUD';
import { EdgePlayerHudStrip } from '../../../hud/EdgePlayerHudStrip';
import { BallCameraIndicator } from '../../../hud/BallCameraIndicator';
import { VelocityProgressBar } from '../../../hud/VelocityProgressBar';
import { CircularBoostGauge } from '../../../hud/CircularBoostGauge';
import { CompactTelemetryBarHUD } from '../../../hud/CompactTelemetryBarHUD';
import { FlipIndicatorPillHUD, FLIP_WINDOW_SECONDS } from '../../../hud/FlipIndicatorPillHUD';
import { TemporalReplayFooterHUD } from '../../../hud/TemporalReplayFooterHUD';
import { DemolishHourglassTimerHUD } from '../../../hud/DemolishHourglassTimerHUD';
import { ArenaBackdrop } from '../../../hud/ArenaBackdrop';
import {
  HudChoreographyControlDeck,
  FlipSimMode,
  JumpPlacementOption,
} from './HudChoreographyControlDeck';
import { Badge } from '../../../primitives/Badge';
import {
  HudAnchorStage,
  HudZone,
  HudSlot,
  HudRelativeAnchor,
  HudLayoutStrategy,
  HudSlotMode,
} from '../../../layout/HudAnchorStage';

export type { JumpPlacementOption, FlipSimMode };
export type ScorePresetKey = '1digit' | '2digit' | '3digit';

const DIAGNOSTIC_STACK_ITEMS = [
  { id: 'simd', title: 'Kernel Physics SIMD', tag: '120Hz', icon: Cpu },
  { id: 'hitbox', title: 'Octane Hitbox Wireframe', tag: 'AABB', icon: Target },
  { id: 'pacing', title: 'Sub-Tick Frame Pacing', tag: '0.1ms', icon: Activity },
  { id: 'audio', title: 'Engine Audio DSP EQ', tag: '8-Band', icon: Sliders },
] as const;

export const HudSpatialChoreographySandbox: React.FC<{ isLight?: boolean }> = React.memo(
  ({ isLight = true }) => {
    const channelRef = useRef(
      createHudTransientChannel({
        speed: 1680,
        boostAmount: 85,
        ballCamActive: true,
        scoreboard: {
          leftScore: 2,
          rightScore: 2,
          scoreDigits: 2,
          seconds: 164,
          isOvertime: false,
          overtimeChinOpen: false,
          overtimeChinText: 'OVERTIME',
          bestOf: 5,
          leftSeriesWins: 2,
          rightSeriesWins: 1,
          seriesResults: ['left', 'right', 'left', 'none', 'none'],
        },
        roster: DEFAULT_INITIAL_ROSTER,
        replayFooter: {
          visible: false,
          scorerName: 'Zen_Master_RL',
          goalSpeed: '118KPH',
          assisterName: 'You (Octane_99)',
          teamAccentColor: '#3B82F6',
        },
        respawnTimer: {
          remainingSeconds: 0,
          totalSeconds: 3.0,
          active: false,
        },
      })
    );

    // Low-frequency UI control mirrors (for control panel buttons only; HUD itself updates via transient refs)
    const [viewMode, setViewMode] = useState<HudRosterViewMode>('player-live');
    const [activeSignal, setActiveSignal] = useState<MatchHudChoreographySignal>('kickoff-will-start');
    const [bottomHudRetracted, setBottomHudRetracted] = useState<boolean>(false);
    const [instantCockpitTransition, setInstantCockpitTransition] = useState<boolean>(false);

    // Team Side (`blue`: My Team [1-3] is Blue, Opponent [4-6] is Orange; `orange`: My Team [1-3] is Orange, Opponent [4-6] is Blue)
    const [myTeamSide, setMyTeamSide] = useState<'blue' | 'orange'>('blue');
    const [slotExists, setSlotExists] = useState<Record<1 | 2 | 3 | 4 | 5 | 6, boolean>>({
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
    });
    const [opponentDemoCompact, setOpponentDemoCompact] = useState<boolean>(true);
    const [persistentDemo, setPersistentDemo] = useState<boolean>(false);
    const persistentDemoRef = useRef<boolean>(false);
    persistentDemoRef.current = persistentDemo;
    const [demoIndicatorConfig, setDemoIndicatorConfig] = useState<EdgeDemoIndicatorConfig>({
      ...DEFAULT_DEMO_INDICATOR_CONFIG,
    });

    const [focusedSlot, setFocusedSlot] = useState<1 | 2 | 3 | 4 | 5 | 6 | null>(1);
    const [scorePreset, setScorePreset] = useState<ScorePresetKey>('1digit');
    const [overtimeChinOpen, setOvertimeChinOpen] = useState<boolean>(false);
    const [bestOf, setBestOf] = useState<0 | 3 | 5 | 7>(5);
    const [leftWins, setLeftWins] = useState<number>(2);
    const [rightWins, setRightWins] = useState<number>(1);
    const [hudThemeLight, setHudThemeLight] = useState<boolean>(isLight);

    // Sync HUD theme default when parent page switches Light/Dark mode
    useEffect(() => {
      setHudThemeLight(isLight);
    }, [isLight]);

    // Spatial layout solver toggles
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

    // Track active 3.0s demolish countdowns per slot (in transient rAF loop, 0 React re-renders!)
    const demoEndTimestampsRef = useRef<Record<number, number>>({});

    // 120Hz Transient Simulation Loop (updates speed, boost, telemetry, 160-step flip drain, 3s demo respawn bars, and 1Hz timer without React re-renders)
    useEffect(() => {
      const ch = channelRef.current;
      let rafId = 0;
      let lastSecTick = performance.now();
      let isStageVisible = true;
      let scrollCooldownUntil = 0;

      const sectionEl = sandboxSectionRef.current;
      let io: IntersectionObserver | null = null;
      if (sectionEl && typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver(
          (entries) => {
            if (entries[0]) {
              isStageVisible = entries[0].isIntersecting;
            }
          },
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

        // Yield 100% of frame budget when sandbox is scrolled off-screen or while user is actively scrolling
        if (!isStageVisible || now < scrollCooldownUntil || document.hidden) {
          return;
        }

        // 1. Update any active 3.0s Demolished respawn countdowns at 120Hz (0 React re-renders!)
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
              slotKey <= 3
                ? currentRoster.leftPlayers[slotKey - 1]
                : currentRoster.rightPlayers[slotKey - 4];
            if (
              !existingSlot?.isDemolished ||
              Math.abs((existingSlot?.demoRespawnRemainingSec ?? 0) - pinnedRem) > 0.01
            ) {
              ch.updatePlayerSlot(slotKey, {
                isDemolished: true,
                demoRespawnRemainingSec: pinnedRem,
              });
              if (slotKey === 1) {
                ch.setRespawnTimer({
                  remainingSeconds: pinnedRem,
                  totalSeconds: 3.0,
                  active: true,
                });
                if (selfDemoPillTextRef.current) {
                  selfDemoPillTextRef.current.textContent = `PERSISTENT DEMO (${pinnedRem.toFixed(1)}S)`;
                }
              }
            }
            continue;
          }
          const remainingSec = Math.max(0, (endAt - now) / 1000);
          if (remainingSec <= 0) {
            delete demoMap[slotKey];
            ch.updatePlayerSlot(slotKey, {
              isDemolished: false,
              demoRespawnRemainingSec: 0,
              demolishedAtMs: 0,
              boostAmount: 33, // Respawn with 33 boost as in Rocket League
            });
            if (slotKey === 1) {
              ch.setRespawnTimer({ remainingSeconds: 0, totalSeconds: 3.0, active: false });
              setSelfDemoActive(false);
            }
          } else {
            ch.updatePlayerSlot(slotKey, {
              isDemolished: true,
              demoRespawnRemainingSec: remainingSec,
            });
            if (slotKey === 1) {
              ch.setRespawnTimer({
                remainingSeconds: remainingSec,
                totalSeconds: 3.0,
                active: true,
              });
              if (selfDemoPillTextRef.current) {
                const nextPillText = `RESPAWN IN ${remainingSec.toFixed(1)}S`;
                if (selfDemoPillTextRef.current.textContent !== nextPillText) {
                  selfDemoPillTextRef.current.textContent = nextPillText;
                }
              }
            }
          }
        }

        // 2. Smoothly oscillate player boost, speed, and telemetry in transient channel
        const phase = now * 0.0012;
        const simSpeed = 1410 + Math.sin(phase) * 780;
        const selfBoost = Math.round(55 + Math.sin(phase * 0.9) * 44);
        ch.setSpeed(Math.max(200, Math.min(2300, simSpeed)));
        ch.setBoost(selfBoost, false);

        const slot1 = currentRoster.leftPlayers[0];
        if (slot1 && !slot1.isDemolished && slot1.boostAmount !== selfBoost) {
          ch.updatePlayerSlot(1, { boostAmount: selfBoost });
        }

        // Live top-left telemetry oscillation (0 React re-renders)
        ch.setTelemetry({
          fps: Math.round(119 + Math.sin(phase * 2.1)),
          refreshHz: 120,
          renderScalePct: 100,
          physicsRateHz: 120.0,
          baseLatencyMs: Math.round(16 + Math.sin(phase * 0.7) * 3),
          extraLatencyMs: 0,
        });

        // 3. Second Flip 1.25s (160 Quantized Steps) Countdown Simulation
        const mode = flipSimModeRef.current;
        if (mode === 'auto-drain') {
          // 2.40s cycle: 0.45s Grounded (100% / 1.25s) -> 1.25s Countdown (160 steps draining to 0) -> 0.70s Expired (NO FLIP)
          const cycleSec = (now / 1000) % 2.4;
          if (cycleSec < 0.45) {
            ch.setFlip({
              hasFlip: true,
              status: 'grounded',
              remainingSeconds: FLIP_WINDOW_SECONDS,
              maxSeconds: FLIP_WINDOW_SECONDS,
            });
          } else if (cycleSec < 0.45 + FLIP_WINDOW_SECONDS) {
            const elapsedAir = cycleSec - 0.45;
            const remFlip = Math.max(0, FLIP_WINDOW_SECONDS - elapsedAir);
            ch.setFlip({
              hasFlip: true,
              status: 'countdown',
              remainingSeconds: remFlip,
              maxSeconds: FLIP_WINDOW_SECONDS,
            });
          } else {
            ch.setFlip({
              hasFlip: false,
              status: 'expired',
              remainingSeconds: 0,
              maxSeconds: FLIP_WINDOW_SECONDS,
            });
          }
        }

        // 4. Tick scoreboard timer once per second
        if (now - lastSecTick >= 1000) {
          lastSecTick = now;
          const sb = ch.getScoreboard();
          const nextSec = sb.isOvertime ? sb.seconds + 1 : Math.max(0, sb.seconds - 1);
          ch.setScoreboard({ seconds: nextSec });
        }
      };

      rafId = requestAnimationFrame(loop);
      return () => {
        cancelAnimationFrame(rafId);
        io?.disconnect();
        window.removeEventListener('scroll', onScrollCapture, { capture: true });
      };
    }, []);

    // Helper for current team accent colors (Left = My Team 1-3, Right = Opponent Team 4-6)
    const leftTeamColor = myTeamSide === 'blue' ? '#2563EB' : '#EA580C';
    const leftBarColor = myTeamSide === 'blue' ? '#3B82F6' : '#F97316';
    const rightTeamColor = myTeamSide === 'blue' ? '#EA580C' : '#2563EB';
    const rightBarColor = myTeamSide === 'blue' ? '#F97316' : '#3B82F6';

    // 4-Stage Choreography Signal Dispatcher (Decoupled State Machine)
    const handleDispatchSignal = (signal: MatchHudChoreographySignal) => {
      setActiveSignal(signal);
      setInstantCockpitTransition(false); // Signals always use smooth GPU transitions

      if (signal === 'goal-replay-will-start') {
        // Phase 1: Velocity + Flip slide down off-screen; Boost slides right; BallCam slides left.
        // Footer stays hidden; Roster stays in live state until `goal-replay-started`.
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({ visible: false });
      } else if (signal === 'goal-replay-started') {
        // Phase 2: TemporalReplayFooterHUD slides up; Left [1-3] & Right [4-6] slide in fully.
        setBottomHudRetracted(true);
        setViewMode('goal-replay');
        channelRef.current.setRoster({ viewMode: 'goal-replay' });
        channelRef.current.setReplayFooter({
          visible: true,
          teamAccentColor: focusedSlot && focusedSlot >= 4 ? rightBarColor : leftBarColor,
        });
      } else if (signal === 'goal-replay-will-end') {
        // Phase 3: TemporalReplayFooterHUD slides down off-screen.
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({ visible: false });
      } else if (signal === 'kickoff-will-start') {
        // Phase 4: Velocity + Flip + Boost + BallCam slide back in;
        // My Team [1-3] retracts key badges; Opponent [4-6] slides back off-screen to the right.
        setBottomHudRetracted(false);
        setViewMode('player-live');
        if (focusedSlot === null) {
          setFocusedSlot(1);
          channelRef.current.setRoster({ viewMode: 'player-live', focusedSlotKey: 1 });
        } else {
          channelRef.current.setRoster({ viewMode: 'player-live' });
        }
        channelRef.current.setReplayFooter({ visible: false });
      }
    };

    // Direct View Mode Switcher (Player Live / Goal Replay / Spectator)
    const handleModeChange = (mode: HudRosterViewMode) => {
      setInstantCockpitTransition(false);
      setViewMode(mode);
      channelRef.current.setRoster({ viewMode: mode });

      if (mode === 'goal-replay') {
        setActiveSignal('goal-replay-started');
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({
          visible: true,
          teamAccentColor: focusedSlot && focusedSlot >= 4 ? rightBarColor : leftBarColor,
        });
      } else {
        setActiveSignal('kickoff-will-start');
        setBottomHudRetracted(false);
        channelRef.current.setReplayFooter({ visible: false });
      }
    };

    // POV Selection (`null` = Free Cam / No POV selected)
    // In `spectator` mode, switching to/from `null` hides/shows bottom cockpit widgets IMMEDIATELY (0ms, no animation)
    const handleSelectPov = (slotKey: 1 | 2 | 3 | 4 | 5 | 6 | null) => {
      const isTransitioningNullInSpec =
        viewMode === 'spectator' && (slotKey === null || focusedSlot === null);
      setInstantCockpitTransition(isTransitioningNullInSpec);
      setFocusedSlot(slotKey);
      channelRef.current.setRoster({ focusedSlotKey: slotKey });
      channelRef.current.setReplayFooter({
        teamAccentColor: slotKey && slotKey >= 4 ? rightBarColor : leftBarColor,
      });
    };

    // Toggle My Team Side (Blue vs Orange) while keeping My Team on Left [1-3] and Opponent on Right [4-6]
    const handleToggleTeamSide = () => {
      setMyTeamSide((prev) => {
        const next = prev === 'blue' ? 'orange' : 'blue';
        const nextLeftBar = next === 'blue' ? '#3B82F6' : '#F97316';
        const nextRightBar = next === 'blue' ? '#F97316' : '#3B82F6';
        channelRef.current.setReplayFooter({
          teamAccentColor: focusedSlot && focusedSlot >= 4 ? nextRightBar : nextLeftBar,
        });
        return next;
      });
    };

    // Toggle individual player existence (1-6 checkboxes)
    const handleToggleSlotExists = (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => {
      setSlotExists((prev) => {
        const nextVal = !prev[slotKey];
        const nextMap = { ...prev, [slotKey]: nextVal };
        channelRef.current.updatePlayerSlot(slotKey, { exists: nextVal });
        return nextMap;
      });
    };

    // Quick preset for 1v1, 2v2, 1v3, 2v1, 3v3
    const handleApplyTeamSizePreset = (leftCount: 1 | 2 | 3, rightCount: 1 | 2 | 3) => {
      const nextMap: Record<1 | 2 | 3 | 4 | 5 | 6, boolean> = {
        1: leftCount >= 1,
        2: leftCount >= 2,
        3: leftCount >= 3,
        4: rightCount >= 1,
        5: rightCount >= 2,
        6: rightCount >= 3,
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
      // In persistent mode, clicking an already-demolished slot toggles it back to alive!
      if (persistentDemoRef.current && wasAlreadyDemo) {
        delete demoEndTimestampsRef.current[slotKey];
        channelRef.current.updatePlayerSlot(slotKey, {
          isDemolished: false,
          demoRespawnRemainingSec: 0,
          demolishedAtMs: 0,
          boostAmount: 33,
        });
        if (slotKey === 1) {
          setSelfDemoActive(false);
          channelRef.current.setRespawnTimer({ remainingSeconds: 0, totalSeconds: 3.0, active: false });
        }
        return;
      }
      demoEndTimestampsRef.current[slotKey] = now + 3000;
      if (slotKey === 1) {
        setSelfDemoActive(true);
        channelRef.current.setRespawnTimer({
          remainingSeconds: 3.0,
          totalSeconds: 3.0,
          active: true,
        });
      }
      channelRef.current.updatePlayerSlot(slotKey, {
        isDemolished: true,
        demoRespawnRemainingSec: persistentDemoRef.current ? 1.8 : 3.0,
        ...(wasAlreadyDemo ? {} : { demolishedAtMs: now }),
      });
    };

    const handleTogglePersistentDemo = () => {
      setPersistentDemo((prev) => {
        const next = !prev;
        persistentDemoRef.current = next;
        const now = performance.now();
        if (next) {
          // If no slot is currently demolished when enabling persistent demo, automatically demolish #2 and #4
          // so both left (my team) and right (opponent team) show the demolished Bomb SVG immediately!
          const activeKeys = Object.keys(demoEndTimestampsRef.current);
          if (activeKeys.length === 0) {
            ([2, 4] as const).forEach((k, idx) => {
              if (slotExists[k]) {
                demoEndTimestampsRef.current[k] = now + 3000;
                channelRef.current.updatePlayerSlot(k, {
                  isDemolished: true,
                  demoRespawnRemainingSec: 1.8,
                  demolishedAtMs: now + idx * 10,
                });
              }
            });
          }
        } else {
          // Clear persistent demo slots back to alive
          for (const keyStr of Object.keys(demoEndTimestampsRef.current)) {
            const k = Number(keyStr) as 1 | 2 | 3 | 4 | 5 | 6;
            delete demoEndTimestampsRef.current[k];
            channelRef.current.updatePlayerSlot(k, {
              isDemolished: false,
              demoRespawnRemainingSec: 0,
              demolishedAtMs: 0,
              boostAmount: 33,
            });
          }
          setSelfDemoActive(false);
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
      }
    };

    const handleTriggerOvertimeKickoff = () => {
      setOvertimeChinOpen(true);
      channelRef.current.setScoreboard({
        seconds: 0,
        isOvertime: true,
        overtimeChinOpen: true,
        overtimeChinText: 'OVERTIME',
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
        seconds: 164,
        isOvertime: false,
        overtimeChinOpen: false,
      });
    };

    const handleBestOfChange = (nextBo: 0 | 3 | 5 | 7) => {
      setBestOf(nextBo);
      const maxWins = nextBo > 0 ? Math.ceil(nextBo / 2) : 0;
      const clampedL = Math.min(leftWins, maxWins);
      const clampedR = Math.min(rightWins, maxWins);
      setLeftWins(clampedL);
      setRightWins(clampedR);
      channelRef.current.setScoreboard({
        bestOf: nextBo,
        leftSeriesWins: clampedL,
        rightSeriesWins: clampedR,
      });
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
      }
    };

    const handleFlipSimModeChange = (nextMode: FlipSimMode) => {
      setFlipSimMode(nextMode);
      flipSimModeRef.current = nextMode;
      if (nextMode === 'grounded') {
        channelRef.current.setFlip({
          hasFlip: true,
          status: 'grounded',
          remainingSeconds: FLIP_WINDOW_SECONDS,
          maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 1,
        });
      } else if (nextMode === 'multi-flip') {
        channelRef.current.setFlip({
          hasFlip: true,
          status: 'grounded',
          remainingSeconds: FLIP_WINDOW_SECONDS,
          maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 2,
        });
      } else if (nextMode === 'unlimited') {
        channelRef.current.setFlip({
          hasFlip: true,
          status: 'unlimited',
          remainingSeconds: FLIP_WINDOW_SECONDS,
          maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 1,
        });
      } else if (nextMode === 'expired') {
        channelRef.current.setFlip({
          hasFlip: false,
          status: 'expired',
          remainingSeconds: 0,
          maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 0,
        });
      } else {
        channelRef.current.setFlip({
          flipsRemaining: 1,
        });
      }
    };

    const handleCycleFlipSimMode = () => {
      const order: FlipSimMode[] = ['auto-drain', 'grounded', 'multi-flip', 'unlimited', 'expired'];
      const next = order[(order.indexOf(flipSimMode) + 1) % order.length];
      handleFlipSimModeChange(next);
    };

    const winsNeededForBo = bestOf > 0 ? Math.ceil(bestOf / 2) : 0;

    // Top 56px Split Band Slot Modes
    const leftTopBandVisible =
      layoutStrategy === 'collapse-symmetric'
        ? showTelemetryTopLeft && showStackTopRight
        : showTelemetryTopLeft;
    const rightTopBandVisible =
      layoutStrategy === 'collapse-symmetric'
        ? showTelemetryTopLeft && showStackTopRight
        : showStackTopRight;
    const topBandSlotMode: HudSlotMode = layoutStrategy === 'reserve' ? 'reserve' : 'collapse';

    // When Spectator has no selected POV (`focusedSlot === null`), immediately hide bottom cockpit HUD
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
        <HudChoreographyControlDeck
          isLight={isLight}
          hudThemeLight={hudThemeLight}
          setHudThemeLight={setHudThemeLight}
          scorePreset={scorePreset}
          handleScorePresetChange={handleScorePresetChange}
          overtimeChinOpen={overtimeChinOpen}
          handleTriggerOvertimeKickoff={handleTriggerOvertimeKickoff}
          handleToggleOvertimeChin={handleToggleOvertimeChin}
          handleResetRegulation={handleResetRegulation}
          bestOf={bestOf}
          handleBestOfChange={handleBestOfChange}
          leftWins={leftWins}
          rightWins={rightWins}
          winsNeededForBo={winsNeededForBo}
          handleAddSeriesWin={handleAddSeriesWin}
          viewMode={viewMode}
          handleModeChange={handleModeChange}
          activeSignal={activeSignal}
          handleDispatchSignal={handleDispatchSignal}
          myTeamSide={myTeamSide}
          handleToggleTeamSide={handleToggleTeamSide}
          slotExists={slotExists}
          handleToggleSlotExists={handleToggleSlotExists}
          handleApplyTeamSizePreset={handleApplyTeamSizePreset}
          opponentDemoCompact={opponentDemoCompact}
          handleToggleOpponentDemoCompact={handleToggleOpponentDemoCompact}
          persistentDemo={persistentDemo}
          onTogglePersistentDemo={handleTogglePersistentDemo}
          demoIndicatorConfig={demoIndicatorConfig}
          onUpdateDemoIndicatorConfig={handleUpdateDemoIndicatorConfig}
          focusedSlot={focusedSlot}
          handleSelectPov={handleSelectPov}
          handleTriggerDemo={handleTriggerDemo}
          layoutStrategy={layoutStrategy}
          setLayoutStrategy={setLayoutStrategy}
          showTelemetryTopLeft={showTelemetryTopLeft}
          setShowTelemetryTopLeft={setShowTelemetryTopLeft}
          showStackTopRight={showStackTopRight}
          setShowStackTopRight={setShowStackTopRight}
          stackTrayOpen={stackTrayOpen}
          setStackTrayOpen={setStackTrayOpen}
          flipSimMode={flipSimMode}
          onFlipSimModeChange={handleFlipSimModeChange}
          jumpPlacement={jumpPlacement}
          setJumpPlacement={setJumpPlacement}
          showBallCam={showBallCam}
          setShowBallCam={setShowBallCam}
          notifSlideOpen={notifSlideOpen}
          setNotifSlideOpen={setNotifSlideOpen}
        />

        {/* FULL-VIEWPORT 16:9 HUD SPATIAL STAGE */}
        <div className="relative w-full h-[540px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl bg-black">
          <ArenaBackdrop
            preset={hudThemeLight ? 'daylight' : 'night'}
            brightness={hudThemeLight ? 75 : 32}
          />

          {/* Pure L2 HUD Anchor Stage Shell */}
          <HudAnchorStage
            strategy={layoutStrategy}
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            {/* 1. TOP-LEFT ZONE:
                   - Top Container (`56px` shared vertical space with Top-Right Stack Icon + Bubble)
                   - Below (`y = 56px`): My Team `[1, 2, 3]` `EdgePlayerHudStrip` */}
            <HudZone anchor="top-left" flush>
              <HudSlot
                visible={leftTopBandVisible}
                mode={topBandSlotMode}
                reservedHeight={56}
                innerClassName="h-[56px] flex items-center pl-3"
              >
                {showTelemetryTopLeft && (
                  <CompactTelemetryBarHUD
                    isLight={hudThemeLight}
                    subscribeTelemetry={channelRef.current.subscribeTelemetry}
                  />
                )}
              </HudSlot>

              {/* My Team [1, 2, 3] Strip (Always on Left, colored Blue or Orange via Switch Side) */}
              <div className={!leftTopBandVisible && topBandSlotMode === 'collapse' ? 'pt-2.5' : ''}>
                <EdgePlayerHudStrip
                  side="left"
                  teamColor={leftTeamColor}
                  barColor={leftBarColor}
                  isLight={hudThemeLight}
                  demoIndicatorConfig={demoIndicatorConfig}
                  onSelectSlot={handleSelectPov}
                  subscribeRoster={channelRef.current.subscribeRoster}
                />
              </div>
            </HudZone>

            {/* 2. TOP-CENTER ZONE (Flush to `top-0`):
                   - `5A.1 StepperScoreboardHUD` (Scorebug + Series Pips Banner + Phase Drop-Banner)
                   - `T5A.2 DemolishHourglassTimerHUD` flowing naturally 12px below active sub-banners */}
            <HudZone anchor="top-center" flush gap={12} zIndexClassName="z-40">
              <StepperScoreboardHUD
                isLight={hudThemeLight}
                leftTeamColor={leftTeamColor}
                rightTeamColor={rightTeamColor}
                subscribeScoreboard={channelRef.current.subscribeScoreboard}
              />

              <HudSlot visible={selfDemoActive} mode="collapse">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`px-3 py-1.5 rounded-xl border ${
                      hudThemeLight
                        ? 'bg-white/95 border-neutral-300 shadow-md'
                        : 'bg-neutral-950/95 border-white/15 shadow-md'
                    }`}
                  >
                    <DemolishHourglassTimerHUD
                      subscribeRespawnTimer={channelRef.current.subscribeRespawnTimer}
                      totalSeconds={3.0}
                      alwaysVisible={false}
                      isLight={hudThemeLight}
                      width={210}
                      height={28}
                    />
                  </div>
                  <span
                    ref={selfDemoPillTextRef}
                    className="text-[10px] tracking-widest uppercase text-red-400 bg-black/85 px-2 py-0.5 rounded font-bold tabular-nums"
                  >
                    RESPAWN IN 3.0S
                  </span>
                </div>
              </HudSlot>
            </HudZone>

            {/* 3. TOP-RIGHT ZONE:
                   - Top Container (`56px` shared vertical space with Top-Left Telemetry)
                   - Below (`y = 56px`): Opponent Team `[4, 5, 6]` `EdgePlayerHudStrip` */}
            <HudZone anchor="top-right" flush zIndexClassName="z-50">
              <HudSlot
                visible={rightTopBandVisible}
                mode={topBandSlotMode}
                reservedHeight={56}
                innerClassName="h-[56px] flex items-center justify-end pr-3 relative z-50"
              >
                {showStackTopRight && (
                  <div className="relative pointer-events-auto">
                    {/* 6D Diagnostic Stack 40x40 Icon + Counter Bubble */}
                    <button
                      type="button"
                      onClick={() => setStackTrayOpen((v) => !v)}
                      title="6D Diagnostic Floating Window Stack (点击展开/收起调参窗口栈，展开时直接覆盖下方 4-6 区域)"
                      className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md ${
                        hudThemeLight
                          ? 'bg-white/95 border-neutral-300 text-neutral-900 hover:bg-neutral-100'
                          : 'bg-neutral-900/95 border-neutral-700 text-neutral-100 hover:bg-neutral-800'
                      } ${stackTrayOpen ? 'ring-2 ring-amber-500/70' : ''}`}
                    >
                      <Layers className="h-4 w-4 text-amber-500" />
                      {/* Counter Bubble */}
                      <span
                        className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-extrabold flex items-center justify-center border shadow-xs ${
                          hudThemeLight
                            ? 'bg-neutral-900 text-white border-white'
                            : 'bg-amber-500 text-neutral-950 border-neutral-900'
                        }`}
                      >
                        4
                      </span>
                    </button>

                    {/* Expandable Diagnostic Window Stack Tray (`z-50` overlays Right [4-6] strip when opened) */}
                    {stackTrayOpen && (
                      <div
                        className={`absolute top-[46px] right-0 z-50 w-[236px] rounded-xl border p-2 shadow-lg flex flex-col gap-1.5 ${
                          hudThemeLight
                            ? 'bg-white/96 border-neutral-300 text-neutral-900'
                            : 'bg-neutral-950/96 border-neutral-800 text-neutral-100'
                        }`}
                      >
                        <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-neutral-200 dark:border-neutral-800">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                            6D · Diagnostic Windows (4)
                          </span>
                          <button
                            type="button"
                            onClick={() => setStackTrayOpen(false)}
                            className="p-0.5 rounded hover:bg-neutral-500/15 cursor-pointer"
                          >
                            <X className="h-3 w-3 opacity-70" />
                          </button>
                        </div>
                        {DIAGNOSTIC_STACK_ITEMS.map((item) => {
                          const IconComp = item.icon;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setStackTrayOpen(false)}
                              className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer transition-colors ${
                                hudThemeLight
                                  ? 'hover:bg-neutral-100 text-neutral-800'
                                  : 'hover:bg-neutral-900 text-neutral-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <IconComp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span className="truncate">{item.title}</span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold shrink-0">
                                {item.tag}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </HudSlot>

              {/* Opponent Team [4, 5, 6] Strip (Hidden in Player Live unless demolished, visible in Replay/Spectator) */}
              <div
                className={`relative z-30 ${
                  !rightTopBandVisible && topBandSlotMode === 'collapse' ? 'pt-2.5' : ''
                }`}
              >
                <EdgePlayerHudStrip
                  side="right"
                  teamColor={rightTeamColor}
                  barColor={rightBarColor}
                  isLight={hudThemeLight}
                  demoIndicatorConfig={demoIndicatorConfig}
                  onSelectSlot={handleSelectPov}
                  subscribeRoster={channelRef.current.subscribeRoster}
                />
              </div>
            </HudZone>

            {/* 4. BOTTOM-LEFT ZONE (Fixed Landmark): `5A.3 BallCameraIndicator`
                   - On `goal-replay-will-start`: slides left off-screen (`translate3d(-140%, 0, 0)`).
                   - On `spectator` with `focusedSlot === null`: immediately disappears (`instant={true}`). */}
            <HudZone anchor="bottom-left">
              <HudSlot
                visible={showBallCam && isCockpitVisible}
                mode="reserve"
                exitOffset="translate3d(-140%, 0, 0)"
                instant={instantCockpitTransition}
              >
                <BallCameraIndicator
                  subscribeBallCam={channelRef.current.subscribeBallCam}
                  shortcut="SPACE"
                  label="BALL CAM"
                  actionText="TO TOGGLE"
                  isLight={hudThemeLight}
                  onToggle={() => channelRef.current.toggleBallCam()}
                />
              </HudSlot>
            </HudZone>

            {/* 5. BOTTOM-CENTER ZONE (Fixed Landmark):
                   `5A.4 VelocityProgressBar` + `5A.7 FlipIndicatorPillHUD`
                   - On `goal-replay-will-start`: slides down off-screen (`translate3d(0, 220%, 0)`).
                   - On `spectator` with `focusedSlot === null`: immediately disappears (`instant={true}`). */}
            <HudZone anchor="bottom-center">
              <HudSlot
                visible={isCockpitVisible}
                mode="reserve"
                exitOffset="translate3d(0, 220%, 0)"
                instant={instantCockpitTransition}
              >
                <HudRelativeAnchor
                  placement={
                    jumpPlacement === 'top-left'
                      ? 'top'
                      : jumpPlacement === 'center-bottom-right'
                      ? 'right'
                      : 'left'
                  }
                  align={jumpPlacement === 'top-left' ? 'start' : 'center'}
                  gap={jumpPlacement === 'top-left' ? 8 : 14}
                  floating
                  attachment={
                    <div
                      onClick={handleCycleFlipSimMode}
                      title="点击轮换 Second Flip 状态: 160步倒计时 -> 地面满(1.25s) -> Unlimited(∞) -> No Flip(0)"
                      className="cursor-pointer pointer-events-auto"
                    >
                      <FlipIndicatorPillHUD
                        isLight={hudThemeLight}
                        subscribeFlip={channelRef.current.subscribeFlip}
                      />
                    </div>
                  }
                >
                  <div className="w-[360px] max-w-[42vw]">
                    <VelocityProgressBar
                      subscribeSpeed={channelRef.current.subscribeSpeed}
                      width="100%"
                      height={16}
                    />
                  </div>
                </HudRelativeAnchor>
              </HudSlot>
            </HudZone>

            {/* 6. BOTTOM-RIGHT ZONE:
                   - `CircularBoostGauge` sits in a permanently reserved slot (`mode="reserve"`).
                   - On `goal-replay-will-start`: slides right off-screen (`translate3d(140%, 0, 0)`).
                   - On `spectator` with `focusedSlot === null`: immediately disappears (`instant={true}`).
                   - `Notification` sits directly above the reserved Boost Meter slot (`mb-3`) so its height is invariant! */}
            <HudZone anchor="bottom-right" flush className="pb-4">
              <div className="mb-3 overflow-hidden pointer-events-auto">
                <div
                  className={`flex items-center gap-2.5 pl-3.5 pr-4 py-2 rounded-l-lg border-l border-y shadow-md will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    hudThemeLight
                      ? 'bg-white/96 border-sky-500/60 text-neutral-900'
                      : 'bg-[#09090B]/95 border-sky-500/50 text-white'
                  }`}
                  style={{
                    transform: notifSlideOpen ? 'translate3d(0%, 0, 0)' : 'translate3d(105%, 0, 0)',
                  }}
                >
                  <Zap className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[9px] uppercase tracking-widest text-sky-500 font-bold">
                      L3 QUICK NOTIFICATION · ABOVE BOOST SLOT
                    </span>
                    <span className="text-[11px] opacity-85">
                      锚定于 Boost 表盘固定槽位正上方（Replay 隐藏表盘时高度依然恒定）
                    </span>
                  </div>
                </div>
              </div>

              <HudSlot
                visible={isCockpitVisible}
                mode="reserve"
                exitOffset="translate3d(140%, 0, 0)"
                instant={instantCockpitTransition}
                innerClassName="pr-5"
              >
                <CircularBoostGauge
                  subscribeBoost={channelRef.current.subscribeBoost}
                  isLight={hudThemeLight}
                />
              </HudSlot>
            </HudZone>

            {/* 7. GOAL REPLAY BOTTOM FOOTER (`T5A.1 TemporalReplayFooterHUD`) */}
            <TemporalReplayFooterHUD
              isLight={hudThemeLight}
              subscribeReplayFooter={channelRef.current.subscribeReplayFooter}
            />
          </HudAnchorStage>
        </div>
      </section>
    );
  }
);

HudSpatialChoreographySandbox.displayName = 'HudSpatialChoreographySandbox';
