import React from 'react';
import { MatchScoreboardHUD } from './MatchScoreboardHUD';
import { BoostGaugeHUD } from './BoostGaugeHUD';
import { BallCamIndicatorHUD } from './BallCamIndicatorHUD';
import { SpeedometerHUD } from './SpeedometerHUD';
import { FlipTimerHUD } from './FlipTimerHUD';
import { MatchAccoladeBannerHUD } from './MatchAccoladeBannerHUD';
import { QuickChatFeedHUD } from './QuickChatFeedHUD';
import { NetworkDiagnosticsHUD } from './NetworkDiagnosticsHUD';
import {
  MatchScoreState,
  BoostState,
  SpeedState,
  FlipTimerState,
  CameraMode,
  AccoladeEvent,
  QuickChatMessage,
  NetworkTelemetry,
} from './types';

export interface MatchHudRecipeProps {
  scoreState: MatchScoreState;
  boostState: BoostState;
  speedState: SpeedState;
  flipState: FlipTimerState;
  cameraMode: CameraMode;
  onToggleCameraMode?: () => void;
  accoladeEvent?: AccoladeEvent | null;
  countdownNumber?: number | null;
  quickChatMessages?: QuickChatMessage[];
  telemetry?: Partial<NetworkTelemetry>;
  boostVariant?: 'ring' | 'linear' | 'hybrid';
  isLight?: boolean;
  className?: string;
}

/**
 * [Recipe] MatchHudRecipe
 * Complete In-Game HUD Layout recipe.
 * Positions all heads-up display components across designated screen anchors:
 * - Top-Center: MatchScoreboardHUD (Score & Timer)
 * - Bottom-Right: BoostGaugeHUD (Circular / Linear gauge)
 * - Bottom-Left: BallCamIndicatorHUD (Camera tracking mode)
 * - Bottom-Center: SpeedometerHUD (Speed & Supersonic trail)
 * - Bottom-Right Offset: FlipTimerHUD (Dodge countdown & reset)
 * - Top-Left: QuickChatFeedHUD (Team communication)
 * - Center: MatchAccoladeBannerHUD (Goal & countdown banners)
 */
export const MatchHudRecipe: React.FC<MatchHudRecipeProps> = ({
  scoreState,
  boostState,
  speedState,
  flipState,
  cameraMode,
  onToggleCameraMode,
  accoladeEvent = null,
  countdownNumber = null,
  quickChatMessages = [],
  telemetry = { pingMs: 18, fps: 120, subTickJitterMs: 0.1, packetLossPct: 0 },
  boostVariant = 'ring',
  isLight = false,
  className = '',
}) => {
  return (
    <div
      data-ui-element="match-hud-layer"
      data-layer="hud"
      className={`relative w-full h-full pointer-events-none select-none flex flex-col justify-between p-4 sm:p-6 overflow-hidden ${className}`}
    >
      {/* 1. TOP ANCHOR: Scoreboard, Quick Chat & Network Diagnostics */}
      <div className="relative flex items-start justify-between w-full z-30">
        {/* Top-Left: Quick Chat Feed */}
        <div className="flex flex-col gap-2">
          <QuickChatFeedHUD
            messages={quickChatMessages}
            isLight={isLight}
          />
        </div>

        {/* Top-Center: Scoreboard hanging */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          <MatchScoreboardHUD
            blueScore={scoreState.blueScore}
            orangeScore={scoreState.orangeScore}
            blueName={scoreState.blueName}
            orangeName={scoreState.orangeName}
            clockSeconds={scoreState.clockSeconds}
            isOvertime={scoreState.isOvertime}
            periodLabel={scoreState.periodLabel}
            countdown={scoreState.countdown}
            isLight={isLight}
          />
        </div>

        {/* Top-Right: Network Diagnostics & Telemetry */}
        <div className="flex justify-end">
          <NetworkDiagnosticsHUD
            pingMs={telemetry.pingMs}
            fps={telemetry.fps}
            subTickJitterMs={telemetry.subTickJitterMs}
            packetLossPct={telemetry.packetLossPct}
            isLight={isLight}
          />
        </div>
      </div>

      {/* 2. CENTER ANCHOR: Accolades & Kickoff Countdown */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none z-20 my-auto">
        <MatchAccoladeBannerHUD
          currentAccolade={accoladeEvent}
          countdownNumber={countdownNumber}
          isLight={isLight}
        />
      </div>

      {/* 3. BOTTOM ANCHOR: Ball Cam (Left), Speedometer (Center), Flip Timer & Boost (Right) */}
      <div className="relative flex items-end justify-between w-full z-30 pt-4">
        {/* Bottom-Left: Ball Camera Indicator */}
        <div className="flex flex-col items-start gap-3">
          <BallCamIndicatorHUD
            mode={cameraMode}
            onToggle={onToggleCameraMode}
            isLight={isLight}
          />
        </div>

        {/* Bottom-Center: Precision Speedometer */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
          <SpeedometerHUD
            speed={speedState.speedUu}
            isLight={isLight}
          />
        </div>

        {/* Bottom-Right: Flip / Dodge Reset Timer & Boost Gauge */}
        <div className="flex flex-col items-end gap-2.5">
          <FlipTimerHUD
            phase={flipState.phase}
            remainingMs={flipState.remainingMs}
            maxMs={flipState.maxMs}
            resetCount={flipState.resetCount}
            isLight={isLight}
          />

          <BoostGaugeHUD
            amount={boostState.amount}
            isSpending={boostState.isSpending}
            isUnlimited={boostState.isUnlimited}
            variant={boostVariant}
            isLight={isLight}
          />
        </div>
      </div>
    </div>
  );
};
