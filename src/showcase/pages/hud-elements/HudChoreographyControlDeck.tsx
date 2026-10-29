import React from 'react';
import {
  Sparkles,
  RotateCcw,
  Radio,
} from 'lucide-react';
import type {
  EdgeDemoIndicatorConfig,
  HudRosterViewMode,
  MatchHudChoreographySignal,
} from '../../../hud/types';
import { DEFAULT_DEMO_INDICATOR_CONFIG, resolveDemoIndicatorConfig } from '../../../hud/hudTransientChannel';
import type { HudLayoutStrategy } from '../../../layout/HudAnchorStage';
import {
  HudChoreographySlotAndTopBandColumns,
  type FlipSimMode,
  type JumpPlacementOption,
} from './HudChoreographySlotAndTopBandColumns';

export type { FlipSimMode, JumpPlacementOption };

export interface HudChoreographyControlDeckProps {
  isLight: boolean;
  hudThemeLight: boolean;
  setHudThemeLight: React.Dispatch<React.SetStateAction<boolean>>;
  scorePreset: '1digit' | '2digit' | '3digit';
  handleScorePresetChange: (preset: '1digit' | '2digit' | '3digit') => void;
  overtimeChinOpen: boolean;
  handleTriggerOvertimeKickoff: () => void;
  handleToggleOvertimeChin: () => void;
  handleResetRegulation: () => void;
  bestOf: 0 | 3 | 5 | 7;
  handleBestOfChange: (bo: 0 | 3 | 5 | 7) => void;
  leftWins: number;
  rightWins: number;
  winsNeededForBo: number;
  handleAddSeriesWin: (side: 'left' | 'right') => void;
  viewMode: HudRosterViewMode;
  handleModeChange: (mode: HudRosterViewMode) => void;
  activeSignal: MatchHudChoreographySignal;
  handleDispatchSignal: (signal: MatchHudChoreographySignal) => void;
  myTeamSide: 'blue' | 'orange';
  handleToggleTeamSide: () => void;
  slotExists: Record<1 | 2 | 3 | 4 | 5 | 6, boolean>;
  handleToggleSlotExists: (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => void;
  handleApplyTeamSizePreset: (leftCount: 1 | 2 | 3, rightCount: 1 | 2 | 3) => void;
  opponentDemoCompact: boolean;
  handleToggleOpponentDemoCompact: () => void;
  persistentDemo?: boolean;
  onTogglePersistentDemo?: () => void;
  demoIndicatorConfig?: Partial<EdgeDemoIndicatorConfig>;
  onUpdateDemoIndicatorConfig?: (patch: Partial<EdgeDemoIndicatorConfig>) => void;
  focusedSlot: 1 | 2 | 3 | 4 | 5 | 6 | null;
  handleSelectPov: (slot: 1 | 2 | 3 | 4 | 5 | 6 | null) => void;
  handleTriggerDemo: (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => void;
  layoutStrategy: HudLayoutStrategy;
  setLayoutStrategy: React.Dispatch<React.SetStateAction<HudLayoutStrategy>>;
  showTelemetryTopLeft: boolean;
  setShowTelemetryTopLeft: React.Dispatch<React.SetStateAction<boolean>>;
  showStackTopRight: boolean;
  setShowStackTopRight: React.Dispatch<React.SetStateAction<boolean>>;
  stackTrayOpen: boolean;
  setStackTrayOpen: React.Dispatch<React.SetStateAction<boolean>>;
  flipSimMode: FlipSimMode;
  onFlipSimModeChange: (mode: FlipSimMode) => void;
  jumpPlacement: JumpPlacementOption;
  setJumpPlacement: React.Dispatch<React.SetStateAction<JumpPlacementOption>>;
  showBallCam: boolean;
  setShowBallCam: React.Dispatch<React.SetStateAction<boolean>>;
  notifSlideOpen: boolean;
  setNotifSlideOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SIGNAL_ITEMS: {
  signal: MatchHudChoreographySignal;
  shortLabel: string;
  desc: string;
}[] = [
  {
    signal: 'goal-replay-will-start',
    shortLabel: '1. Goal Replay Will Start',
    desc: '速度表+Flip向下滑出 · Boost向右滑出 · BallCam向左滑出',
  },
  {
    signal: 'goal-replay-started',
    shortLabel: '2. Goal Replay Started',
    desc: '底部 T5A.1 Replay Footer 向上展开 · 左右 1-3 & 4-6 球员条完整滑入',
  },
  {
    signal: 'goal-replay-will-end',
    shortLabel: '3. Goal Replay Will End',
    desc: '底部 T5A.1 Replay Footer 向下推走收起',
  },
  {
    signal: 'kickoff-will-start',
    shortLabel: '4. Kickoff Will Start',
    desc: '速度表+Flip+Boost+BallCam推回 · 我方1-3收起按键标 · 对方4-6整体退回屏幕外',
  },
];

const DEFAULT_SLOT_EXISTS: Record<1 | 2 | 3 | 4 | 5 | 6, boolean> = {
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
};

export const HudChoreographyControlDeck: React.FC<HudChoreographyControlDeckProps> = React.memo(({
  isLight,
  hudThemeLight,
  setHudThemeLight,
  scorePreset,
  handleScorePresetChange,
  overtimeChinOpen,
  handleTriggerOvertimeKickoff,
  handleToggleOvertimeChin,
  handleResetRegulation,
  bestOf,
  handleBestOfChange,
  leftWins,
  rightWins,
  winsNeededForBo,
  handleAddSeriesWin,
  viewMode,
  handleModeChange,
  activeSignal,
  handleDispatchSignal,
  myTeamSide,
  handleToggleTeamSide,
  slotExists: rawSlotExists,
  handleToggleSlotExists,
  handleApplyTeamSizePreset,
  opponentDemoCompact,
  handleToggleOpponentDemoCompact,
  persistentDemo = false,
  onTogglePersistentDemo,
  demoIndicatorConfig: rawDemoIndicatorConfig = DEFAULT_DEMO_INDICATOR_CONFIG,
  onUpdateDemoIndicatorConfig,
  focusedSlot,
  handleSelectPov,
  handleTriggerDemo,
  layoutStrategy,
  setLayoutStrategy,
  showTelemetryTopLeft,
  setShowTelemetryTopLeft,
  showStackTopRight,
  setShowStackTopRight,
  stackTrayOpen,
  setStackTrayOpen,
  flipSimMode,
  onFlipSimModeChange,
  jumpPlacement,
  setJumpPlacement,
  showBallCam,
  setShowBallCam,
  notifSlideOpen,
  setNotifSlideOpen,
}) => {
  const demoIndicatorConfig = resolveDemoIndicatorConfig(rawDemoIndicatorConfig);
  const slotExists: Record<1 | 2 | 3 | 4 | 5 | 6, boolean> =
    rawSlotExists && typeof rawSlotExists === 'object'
      ? { ...DEFAULT_SLOT_EXISTS, ...rawSlotExists }
      : DEFAULT_SLOT_EXISTS;
  const isMyTeamOrange = myTeamSide === 'orange';
  const myTeamBadgeClass = isMyTeamOrange
    ? 'bg-orange-600 text-white'
    : 'bg-blue-600 text-white';
  const oppTeamBadgeClass = isMyTeamOrange
    ? 'bg-blue-600 text-white'
    : 'bg-orange-600 text-white';

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${
        isLight
          ? 'bg-neutral-50/90 border-neutral-200 text-neutral-800'
          : 'bg-neutral-900/70 border-neutral-800 text-neutral-200'
      }`}
    >
      {/* Top Signal Choreography Bar: 4 Event Signals */}
      <div
        className={`p-2.5 rounded-xl border flex flex-col gap-2 ${
          isLight
            ? 'bg-white/90 border-neutral-200/90'
            : 'bg-neutral-950/70 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold font-mono flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-rose-500" />
            <span>Match HUD Signal Bus · 四阶段事件信号编排 (GPU `translate3d` · 常驻 DOM 零 GC)</span>
          </span>
          <span className="text-[11px] font-mono opacity-75">
            当前信号:{' '}
            <strong className="text-amber-500">
              {SIGNAL_ITEMS.find((s) => s.signal === activeSignal)?.shortLabel}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SIGNAL_ITEMS.map((item) => {
            const isSelected = activeSignal === item.signal;
            return (
              <button
                key={item.signal}
                type="button"
                onClick={() => handleDispatchSignal(item.signal)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-300 shadow-xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                }`}
              >
                <span className="text-[11px] font-mono font-bold flex items-center justify-between">
                  <span>{item.shortLabel}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </span>
                <span className="text-[10px] opacity-75 leading-snug">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3-Column Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Scorebug + Tiered Sub-Banners (Series Pips Banner & Phase Drop-Banner) */}
        <div className="flex flex-col gap-2.5 pr-0 lg:pr-3 lg:border-r border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>1. Scorebug 计分板 (`top-0`) &amp; 层叠副横幅</span>
            </span>
            <button
              type="button"
              onClick={() => setHudThemeLight((v) => !v)}
              className="px-2 py-0.5 rounded text-[11px] font-mono border border-neutral-400/40 cursor-pointer hover:bg-neutral-500/10"
            >
              HUD底色: {hudThemeLight ? 'Light (白底黑字)' : 'Dark (黑底白字)'}
            </button>
          </div>

          {/* 1-Digit / 2-Digit / 3-Digit Score Slot Preset Selector */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <span className="text-[11px] opacity-75">比分位数选项:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScorePresetChange('1digit')}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  scorePreset === '1digit'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'border border-neutral-400/40 opacity-80'
                }`}
              >
                常规 (2 : 2)
              </button>
              <button
                type="button"
                onClick={() => handleScorePresetChange('2digit')}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  scorePreset === '2digit'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'border border-neutral-400/40 opacity-80'
                }`}
              >
                两位数 (12 : 8)
              </button>
              <button
                type="button"
                onClick={() => handleScorePresetChange('3digit')}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  scorePreset === '3digit'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'border border-neutral-400/40 opacity-80'
                }`}
              >
                三位数 (104 : 99)
              </button>
            </div>
          </div>

          {/* Tier 2 Sub-Banner: Phase Drop-Banner (OVERTIME) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleTriggerOvertimeKickoff}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-600 text-white cursor-pointer hover:bg-red-500 transition-colors"
            >
              ⚡ 触发 OVERTIME (Phase Drop-Banner)
            </button>
            <button
              type="button"
              onClick={handleToggleOvertimeChin}
              className="px-2.5 py-1 rounded-lg text-xs font-mono border border-red-500/40 text-red-500 cursor-pointer hover:bg-red-500/10"
            >
              {overtimeChinOpen ? '收起 Phase Banner' : '弹出 Phase Banner'}
            </button>
            <button
              type="button"
              onClick={handleResetRegulation}
              className="px-2 py-1 rounded-lg text-xs font-mono border border-neutral-400/40 cursor-pointer hover:bg-neutral-500/10"
            >
              <RotateCcw className="h-3 w-3 inline mr-1" />
              常规时间
            </button>
          </div>

          {/* Tier 1 Sub-Banner: Series Pips Banner (BO3 / BO5 / BO7) */}
          <div className="flex items-center justify-between gap-2 pt-0.5 text-xs font-mono flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[11px] opacity-75">Series Pips (赛制挂条):</span>
              {([0, 3, 5, 7] as const).map((bo) => (
                <button
                  key={bo}
                  type="button"
                  onClick={() => handleBestOfChange(bo)}
                  className={`px-1.5 py-0.5 rounded text-[11px] cursor-pointer ${
                    bestOf === bo
                      ? 'bg-amber-500 text-black font-bold'
                      : 'border border-neutral-400/30 opacity-75'
                  }`}
                >
                  {bo === 0 ? '无' : `BO${bo}`}
                </button>
              ))}
            </div>

            {bestOf > 0 && (
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleAddSeriesWin('left')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${myTeamBadgeClass}`}
                  title="左侧我方赢一局，从左往中间点亮一个 Pip"
                >
                  左赢 ({leftWins}/{winsNeededForBo}) →
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSeriesWin('right')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${oppTeamBadgeClass}`}
                  title="右侧对方赢一局，从右往中间点亮一个 Pip"
                >
                  ← 右赢 ({rightWins}/{winsNeededForBo})
                </button>
              </div>
            )}
          </div>
        </div>

        <HudChoreographySlotAndTopBandColumns
          isMyTeamOrange={isMyTeamOrange}
          handleToggleTeamSide={handleToggleTeamSide}
          viewMode={viewMode}
          handleModeChange={handleModeChange}
          slotExists={slotExists}
          handleToggleSlotExists={handleToggleSlotExists}
          handleApplyTeamSizePreset={handleApplyTeamSizePreset}
          focusedSlot={focusedSlot}
          handleSelectPov={handleSelectPov}
          handleTriggerDemo={handleTriggerDemo}
          opponentDemoCompact={opponentDemoCompact}
          handleToggleOpponentDemoCompact={handleToggleOpponentDemoCompact}
          persistentDemo={persistentDemo}
          onTogglePersistentDemo={onTogglePersistentDemo}
          demoIndicatorConfig={demoIndicatorConfig}
          onUpdateDemoIndicatorConfig={onUpdateDemoIndicatorConfig}
          layoutStrategy={layoutStrategy}
          setLayoutStrategy={setLayoutStrategy}
          showTelemetryTopLeft={showTelemetryTopLeft}
          setShowTelemetryTopLeft={setShowTelemetryTopLeft}
          showStackTopRight={showStackTopRight}
          setShowStackTopRight={setShowStackTopRight}
          stackTrayOpen={stackTrayOpen}
          setStackTrayOpen={setStackTrayOpen}
          flipSimMode={flipSimMode}
          onFlipSimModeChange={onFlipSimModeChange}
          jumpPlacement={jumpPlacement}
          setJumpPlacement={setJumpPlacement}
          showBallCam={showBallCam}
          setShowBallCam={setShowBallCam}
          notifSlideOpen={notifSlideOpen}
          setNotifSlideOpen={setNotifSlideOpen}
        />
      </div>
    </div>
  );
});

HudChoreographyControlDeck.displayName = 'HudChoreographyControlDeck';
