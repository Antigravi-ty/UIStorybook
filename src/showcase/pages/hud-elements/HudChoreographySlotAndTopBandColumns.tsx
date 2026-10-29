import React from 'react';
import {
  Tv,
  UserCheck,
  Play,
  Video,
  EyeOff,
  ShieldAlert,
  LayoutGrid,
  ArrowLeftRight,
  CheckSquare,
  Square,
} from 'lucide-react';
import type {
  EdgeDemoIndicatorConfig,
  HudRosterViewMode,
} from '../../../hud/types';
import { BombEmojiSvg } from '../../../primitives/packagedSvgIcons';
import type { HudLayoutStrategy } from '../../../layout/HudAnchorStage';
import type { FlipSimMode, JumpPlacementOption } from './HudChoreographyControlDeck';

export interface HudChoreographySlotAndTopBandColumnsProps {
  isMyTeamOrange: boolean;
  handleToggleTeamSide: () => void;
  viewMode: HudRosterViewMode;
  handleModeChange: (mode: HudRosterViewMode) => void;
  slotExists: Record<1 | 2 | 3 | 4 | 5 | 6, boolean>;
  handleToggleSlotExists: (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => void;
  handleApplyTeamSizePreset: (leftCount: 1 | 2 | 3, rightCount: 1 | 2 | 3) => void;
  focusedSlot: 1 | 2 | 3 | 4 | 5 | 6 | null;
  handleSelectPov: (slot: 1 | 2 | 3 | 4 | 5 | 6 | null) => void;
  handleTriggerDemo: (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => void;
  opponentDemoCompact: boolean;
  handleToggleOpponentDemoCompact: () => void;
  persistentDemo: boolean;
  onTogglePersistentDemo?: () => void;
  demoIndicatorConfig: EdgeDemoIndicatorConfig;
  onUpdateDemoIndicatorConfig?: (patch: Partial<EdgeDemoIndicatorConfig>) => void;
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

export const HudChoreographySlotAndTopBandColumns: React.FC<
  HudChoreographySlotAndTopBandColumnsProps
> = ({
  isMyTeamOrange,
  handleToggleTeamSide,
  viewMode,
  handleModeChange,
  slotExists,
  handleToggleSlotExists,
  handleApplyTeamSizePreset,
  focusedSlot,
  handleSelectPov,
  handleTriggerDemo,
  opponentDemoCompact,
  handleToggleOpponentDemoCompact,
  persistentDemo,
  onTogglePersistentDemo,
  demoIndicatorConfig,
  onUpdateDemoIndicatorConfig,
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
  return (
    <>
      {/* Column 2: 3v3 Edge Strips, Switch Side, 6 Player Exist Checkboxes & Demo Controls */}
      <div className="flex flex-col gap-2 pr-0 lg:pr-3 lg:border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="text-xs font-bold font-mono flex items-center gap-1.5">
            <Tv className="h-3.5 w-3.5 text-sky-500" />
            <span>2. 球员条 (我方1-3 / 对方4-6) &amp; 阵营/人数</span>
          </span>

          {/* Switch Side Button */}
          <button
            type="button"
            onClick={handleToggleTeamSide}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold cursor-pointer flex items-center gap-1 transition-all shadow-2xs ${
              isMyTeamOrange
                ? 'bg-orange-500 text-white'
                : 'bg-blue-600 text-white'
            }`}
            title="切换我方队伍颜色 (Switch Side): 我方始终在左侧使用 1-2-3，对方始终在右侧使用 4-5-6"
          >
            <ArrowLeftRight className="h-3 w-3" />
            <span>
              Switch Side: 我方{isMyTeamOrange ? '橙队(1-3)' : '蓝队(1-3)'}
            </span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleModeChange('player-live')}
            className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
              viewMode === 'player-live'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'border border-neutral-400/40 hover:bg-neutral-500/10'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 inline mr-1" />
            Player Live (隐1-3键标 &amp; 4-6)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('goal-replay')}
            className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
              viewMode === 'goal-replay'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'border border-neutral-400/40 hover:bg-neutral-500/10'
            }`}
          >
            <Play className="h-3.5 w-3.5 inline mr-1" />
            Goal Replay (露1-6)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('spectator')}
            className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
              viewMode === 'spectator'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'border border-neutral-400/40 hover:bg-neutral-500/10'
            }`}
          >
            <Video className="h-3.5 w-3.5 inline mr-1" />
            Spectator (观战1-6)
          </button>
        </div>

        {/* 6 Checkboxes for Player Exist (My Team 1-2-3 & Opponent Team 4-5-6) + Quick Format Presets */}
        <div className="flex flex-col gap-1.5 p-2 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/40 text-xs font-mono">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="text-[10px] opacity-75">
              Player Exist (我方左 1-3 · 对方右 4-6):
            </span>
            <div className="flex items-center gap-1">
              {(
                [
                  { label: '1v1', l: 1, r: 1 },
                  { label: '2v2', l: 2, r: 2 },
                  { label: '1v3', l: 1, r: 3 },
                  { label: '2v1', l: 2, r: 1 },
                  { label: '3v3', l: 3, r: 3 },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyTeamSizePreset(preset.l, preset.r)}
                  className="px-1.5 py-0.2 rounded text-[10px] border border-neutral-400/40 hover:bg-neutral-500/15 cursor-pointer"
                  title={`快速设置对局人数 ${preset.label}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* My Team 1-3 Checkboxes */}
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] font-bold px-1 rounded ${
                  isMyTeamOrange ? 'text-orange-500' : 'text-blue-500'
                }`}
              >
                我方:
              </span>
              {([1, 2, 3] as const).map((k) => {
                const checked = slotExists[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleToggleSlotExists(k)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer border transition-all ${
                      checked
                        ? isMyTeamOrange
                          ? 'bg-orange-500/15 border-orange-500/60 text-orange-600 dark:text-orange-400'
                          : 'bg-blue-500/15 border-blue-500/60 text-blue-600 dark:text-blue-400'
                        : 'border-neutral-400/30 opacity-45'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="h-3 w-3" />
                    ) : (
                      <Square className="h-3 w-3" />
                    )}
                    <span>#{k}</span>
                  </button>
                );
              })}
            </div>

            {/* Opponent Team 4-6 Checkboxes */}
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] font-bold px-1 rounded ${
                  isMyTeamOrange ? 'text-blue-500' : 'text-orange-500'
                }`}
              >
                对方:
              </span>
              {([4, 5, 6] as const).map((k) => {
                const checked = slotExists[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleToggleSlotExists(k)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer border transition-all ${
                      checked
                        ? isMyTeamOrange
                          ? 'bg-blue-500/15 border-blue-500/60 text-blue-600 dark:text-blue-400'
                          : 'bg-orange-500/15 border-orange-500/60 text-orange-600 dark:text-orange-400'
                        : 'border-neutral-400/30 opacity-45'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="h-3 w-3" />
                    ) : (
                      <Square className="h-3 w-3" />
                    )}
                    <span>#{k}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* POV & All 1-6 Demolish Triggers + Opponent Demo Auto-Reorder */}
        <div className="flex items-center justify-between gap-1 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="text-[11px] opacity-70">POV:</span>
            {([1, 2, 3, 4, 5, 6] as const).map((k) => {
              if (!slotExists[k]) return null;
              const isSelected = focusedSlot === k;
              const activeColor =
                k <= 3
                  ? isMyTeamOrange
                    ? 'bg-orange-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isMyTeamOrange
                  ? 'bg-blue-600 text-white'
                  : 'bg-orange-600 text-white';
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleSelectPov(k)}
                  className={`w-5 h-5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    isSelected
                      ? activeColor
                      : 'border border-neutral-400/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  {k}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleSelectPov(null)}
              title="空 POV (Free Cam): 在 Spectator 下立即(0ms)隐藏底部仪表盘，选回球员时立即(0ms)恢复"
              className={`px-1.5 h-5 rounded text-[11px] font-bold cursor-pointer transition-all flex items-center gap-0.5 ${
                focusedSlot === null
                  ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-950'
                  : 'border border-neutral-400/40 opacity-75 hover:opacity-100'
              }`}
            >
              <EyeOff className="h-3 w-3" />
              <span>空(0ms隐)</span>
            </button>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-red-500 font-semibold flex items-center gap-0.5">
              <ShieldAlert className="h-3 w-3" />
              炸:
            </span>
            {([1, 2, 3, 4, 5, 6] as const).map((k) => {
              if (!slotExists[k]) return null;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleTriggerDemo(k)}
                  className="px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer text-[10px]"
                  title={`触发 #${k} 被炸 (3.0s 读条)`}
                >
                  #{k}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleToggleOpponentDemoCompact}
              className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer border transition-colors ${
                opponentDemoCompact
                  ? 'bg-red-500 text-white border-red-500 font-bold'
                  : 'border-neutral-400/40 opacity-75'
              }`}
              title="Player Live 下对方(4-6)被炸时自动从右侧第1行依次向下紧凑排列 (FIFO Auto-Reorder)"
            >
              敌炸置顶:{opponentDemoCompact ? '开' : '原位'}
            </button>
            {onTogglePersistentDemo && (
              <button
                type="button"
                onClick={onTogglePersistentDemo}
                className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer border transition-colors ${
                  persistentDemo
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow-2xs'
                    : 'border-neutral-400/40 opacity-75 hover:opacity-100'
                }`}
                title="开启爆炸持久化（常驻被炸状态）：被炸槽位不会在 3.0s 后自动消失，方便持续观察与调参（再次点击 #1~#6 可单独开关）"
              >
                常驻爆炸:{persistentDemo ? '开(持久)' : '关(3s)'}
              </button>
            )}
          </div>
        </div>

        {/* Demolish Effect / Icon Selector */}
        {onUpdateDemoIndicatorConfig && (
          <div className="flex flex-col gap-1.5 p-2 rounded-xl border border-red-500/25 bg-red-500/5 text-xs font-mono">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold flex items-center gap-1 text-red-500">
                <BombEmojiSvg
                  size={Math.min(18, Math.max(11, demoIndicatorConfig.sizePx || 16))}
                  color={demoIndicatorConfig.color}
                  strokeWidth={demoIndicatorConfig.strokeWidth}
                  glowColor={demoIndicatorConfig.glowColor}
                  glowBlurPx={demoIndicatorConfig.glowBlurPx}
                  glowIntensityPct={demoIndicatorConfig.glowIntensityPct}
                />
                <span>被炸变灰指示器 (`#3F3F46`):</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateDemoIndicatorConfig({ variant: 'bomb-svg' })}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer flex items-center gap-1 transition-all ${
                    demoIndicatorConfig.variant === 'bomb-svg'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'border border-neutral-400/40 opacity-80'
                  }`}
                >
                  <BombEmojiSvg size={11} color="currentColor" strokeWidth={2} />
                  <span>Bomb SVG</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateDemoIndicatorConfig({ variant: 'cross' })}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-all ${
                    demoIndicatorConfig.variant === 'cross'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'border border-neutral-400/40 opacity-80'
                  }`}
                >
                  ✕ 经典红叉
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
              <label className="flex items-center gap-1" title="调整爆炸 SVG / 红叉的像素尺寸 (10px ~ 28px)">
                <span className="opacity-75">尺寸:</span>
                <input
                  type="range"
                  min={10}
                  max={28}
                  step={1}
                  value={demoIndicatorConfig.sizePx || 16}
                  onChange={(e) =>
                    onUpdateDemoIndicatorConfig({ sizePx: Number(e.target.value) })
                  }
                  className="w-14 accent-red-500 cursor-pointer"
                />
                <input
                  type="number"
                  min={8}
                  max={32}
                  step={1}
                  value={demoIndicatorConfig.sizePx || 16}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v) && v >= 8 && v <= 36) {
                      onUpdateDemoIndicatorConfig({ sizePx: v });
                    }
                  }}
                  className="w-10 px-1 py-0.2 rounded border border-red-500/30 bg-transparent text-center font-bold tabular-nums"
                />
                <span className="opacity-70">px</span>
              </label>

              <label className="flex items-center gap-1">
                <span className="opacity-75">粗细:</span>
                <input
                  type="range"
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  value={demoIndicatorConfig.strokeWidth}
                  onChange={(e) =>
                    onUpdateDemoIndicatorConfig({ strokeWidth: Number(e.target.value) })
                  }
                  className="w-12 accent-red-500 cursor-pointer"
                />
                <span className="tabular-nums font-bold">{demoIndicatorConfig.strokeWidth.toFixed(1)}</span>
              </label>

              <label className="flex items-center gap-1">
                <span className="opacity-75">发光:</span>
                <input
                  type="range"
                  min={0}
                  max={14}
                  step={1}
                  value={demoIndicatorConfig.glowBlurPx}
                  onChange={(e) =>
                    onUpdateDemoIndicatorConfig({ glowBlurPx: Number(e.target.value) })
                  }
                  className="w-12 accent-red-500 cursor-pointer"
                />
                <span className="tabular-nums font-bold">{demoIndicatorConfig.glowBlurPx}px</span>
              </label>

              <div className="flex items-center gap-1">
                {(
                  [
                    { hex: '#EF4444', label: '红' },
                    { hex: '#F97316', label: '橙' },
                    { hex: '#FACC15', label: '黄' },
                    { hex: '#38BDF8', label: '青' },
                    { hex: '#FFFFFF', label: '白' },
                  ] as const
                ).map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() =>
                      onUpdateDemoIndicatorConfig({ color: sw.hex, glowColor: sw.hex })
                    }
                    title={`颜色 & 发光: ${sw.label} (${sw.hex})`}
                    className={`w-3.5 h-3.5 rounded-full cursor-pointer border transition-transform ${
                      demoIndicatorConfig.color.toUpperCase() === sw.hex
                        ? 'scale-125 border-white ring-1 ring-red-500'
                        : 'border-black/30 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: sw.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column 3: Top Split Band (Telemetry + Stack Icon), Second Flip & Slot Reflow Strategy */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold font-mono flex items-center gap-1.5">
          <LayoutGrid className="h-3.5 w-3.5 text-emerald-500" />
          <span>3. 顶栏等高三切分 (`HudTopSplitBand`) &amp; 底部仪表</span>
        </span>

        {/* Layout Strategy Switcher */}
        <div className="flex items-center justify-between gap-1 flex-wrap text-xs font-mono">
          <span className="text-[11px] opacity-75">顶栏隐藏补位策略:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setLayoutStrategy('reserve')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                layoutStrategy === 'reserve'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40 opacity-85 hover:opacity-100'
              }`}
              title="固定占坑 (Reserved): 顶栏 56px 永远保留，1-3 与 4-6 位置锁死不动"
            >
              固定占坑 (推荐)
            </button>
            <button
              type="button"
              onClick={() => setLayoutStrategy('collapse-local')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                layoutStrategy === 'collapse-local'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40 opacity-85 hover:opacity-100'
              }`}
              title="局部流式: 左上角隐藏 Telemetry 时仅左列 1-3 自动上移"
            >
              局部流式
            </button>
            <button
              type="button"
              onClick={() => setLayoutStrategy('collapse-symmetric')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                layoutStrategy === 'collapse-symmetric'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40 opacity-85 hover:opacity-100'
              }`}
              title="对称流式: 当左上 Telemetry 与右上 Stack 同时隐藏时，1-3 与 4-6 同步上移"
            >
              对称流式
            </button>
          </div>
        </div>

        {/* Top Split Band Controls: Telemetry (Left) & 6D Stack Icon + Bubble (Right) */}
        <div className="flex items-center justify-between text-xs font-mono gap-1 flex-wrap">
          <span className="text-[11px] opacity-75">顶栏 56px 诊断区:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setShowTelemetryTopLeft((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                showTelemetryTopLeft
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40'
              }`}
            >
              左上Telemetry:{showTelemetryTopLeft ? '显' : '隐'}
            </button>
            <button
              type="button"
              onClick={() => setShowStackTopRight((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                showStackTopRight
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40'
              }`}
            >
              右上Stack图标:{showStackTopRight ? '显' : '隐'}
            </button>
            {showStackTopRight && (
              <button
                type="button"
                onClick={() => setStackTrayOpen((v) => !v)}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                  stackTrayOpen
                    ? 'bg-sky-500 text-neutral-950 font-bold'
                    : 'border border-neutral-400/40'
                }`}
                title="点击展开右上角 6D 诊断悬浮窗列表（z-50 直接覆盖下方 4-6 球员条）"
              >
                Stack列表:{stackTrayOpen ? '已展开' : '收起'}
              </button>
            )}
          </div>
        </div>

        {/* Second Flip Indicator 150-Step (120Hz) State Controls */}
        <div className="flex items-center justify-between gap-1 flex-wrap text-xs font-mono">
          <span className="text-[11px] opacity-75">Second Flip (1.25s/150步):</span>
          <div className="flex items-center gap-1 flex-wrap">
            {(
              [
                { key: 'auto-drain', label: '150步递减' },
                { key: 'grounded', label: '地面满' },
                { key: 'multi-flip', label: 'Multi(×2)' },
                { key: 'unlimited', label: 'Unlimited(∞)' },
                { key: 'expired', label: 'No Flip(0)' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onFlipSimModeChange(item.key)}
                className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                  flipSimMode === item.key
                    ? 'bg-emerald-500 text-neutral-950 font-bold'
                    : 'border border-neutral-400/40 opacity-80 hover:opacity-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flip Placement & Bottom Notification */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[11px] opacity-75">Flip对齐 / 通知:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() =>
                setJumpPlacement((p) =>
                  p === 'top-left'
                    ? 'center-bottom-right'
                    : p === 'center-bottom-right'
                    ? 'center-bottom-left'
                    : 'top-left'
                )
              }
              className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer"
              title="切换 FlipIndicator 相对于底部速度表的挂靠方位（默认：速度表正上方左对齐）"
            >
              Flip:{jumpPlacement === 'top-left' ? '上方左对齐' : jumpPlacement === 'center-bottom-right' ? '右侧' : '左侧'}
            </button>
            <button
              type="button"
              onClick={() => setShowBallCam((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                showBallCam ? 'bg-red-500 text-white font-bold' : 'border border-neutral-400/40'
              }`}
            >
              BallCam:{showBallCam ? '显' : '隐'}
            </button>
            <button
              type="button"
              onClick={() => setNotifSlideOpen((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                notifSlideOpen
                  ? 'bg-sky-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40'
              }`}
            >
              右下通知:{notifSlideOpen ? '弹出' : '收起'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
