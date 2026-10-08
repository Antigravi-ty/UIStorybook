import React from 'react';
import {
  HudThemeStyle,
  MatchScoreState,
  BoostState,
  BallCamState,
  SpeedState,
  FlipTimerState,
  AccoladeEvent,
  QuickChatMessage,
  NetworkTelemetry,
} from './types';
import { ScoreboardHUD } from './ScoreboardHUD';
import { KickoffCountdownHUD } from './KickoffCountdownHUD';
import { BoostGaugeHUD } from './BoostGaugeHUD';
import { BallCamIndicatorHUD } from './BallCamIndicatorHUD';
import { SpeedometerHUD } from './SpeedometerHUD';
import { FlipTimerHUD } from './FlipTimerHUD';
import { MatchEventsHUD } from './MatchEventsHUD';
import { QuickChatHUD } from './QuickChatHUD';
import { NetworkDiagnosticsHUD } from './NetworkDiagnosticsHUD';

export interface MatchHudVisibilityConfig {
  showScoreboard?: boolean;
  showKickoffCountdown?: boolean;
  showBoostGauge?: boolean;
  showBallCamIndicator?: boolean;
  showSpeedometer?: boolean;
  showFlipTimer?: boolean;
  showMatchEvents?: boolean;
  showQuickChat?: boolean;
  showNetworkDiagnostics?: boolean;
}

export interface MatchHudContainerProps {
  score: MatchScoreState;
  kickoffCountdown?: number; // 3, 2, 1, 0, or -1 (hidden)
  boost: BoostState;
  ballCam: BallCamState;
  speed: SpeedState;
  flipTimer: FlipTimerState;
  events?: AccoladeEvent[];
  chatMessages?: QuickChatMessage[];
  telemetry?: NetworkTelemetry;
  visibility?: MatchHudVisibilityConfig;
  themeStyle?: HudThemeStyle;
  boostVariant?: 'circular' | 'linear';
  isLight?: boolean;
  onToggleBallCam?: () => void;
  onSpeedUnitChange?: (unit: 'uu/s' | 'km/h' | 'mph') => void;
  className?: string;
}

export const MatchHudContainer: React.FC<MatchHudContainerProps> = ({
  score,
  kickoffCountdown = -1,
  boost,
  ballCam,
  speed,
  flipTimer,
  events = [],
  chatMessages = [],
  telemetry = { pingMs: 18, fps: 120, subTickJitterMs: 0.1, packetLossPct: 0 },
  visibility = {},
  themeStyle = 'glass',
  boostVariant = 'circular',
  isLight = false,
  onToggleBallCam,
  onSpeedUnitChange,
  className = '',
}) => {
  const {
    showScoreboard = true,
    showKickoffCountdown = true,
    showBoostGauge = true,
    showBallCamIndicator = true,
    showSpeedometer = true,
    showFlipTimer = true,
    showMatchEvents = true,
    showQuickChat = true,
    showNetworkDiagnostics = true,
  } = visibility;

  return (
    <div
      data-ui-layer="match-hud"
      className={`relative w-full h-full pointer-events-none select-none overflow-hidden flex flex-col justify-between p-4 sm:p-6 ${className}`}
    >
      {/* 1. TOP ANCHOR: Left (Quick Chat), Center (Scoreboard & Kickoff), Right (Network Telemetry) */}
      <div className="relative w-full flex items-start justify-between z-30">
        {/* Top-Left: Quick Chat */}
        <div className="w-1/4 flex justify-start">
          {showQuickChat && <QuickChatHUD messages={chatMessages} />}
        </div>

        {/* Top-Center: Scoreboard */}
        <div className="flex flex-col items-center">
          {showScoreboard && (
            <ScoreboardHUD
              {...score}
              themeStyle={themeStyle}
              isLight={isLight}
            />
          )}
        </div>

        {/* Top-Right: Network Telemetry */}
        <div className="w-1/4 flex justify-end">
          {showNetworkDiagnostics && (
            <NetworkDiagnosticsHUD
              {...telemetry}
              themeStyle={themeStyle}
            />
          )}
        </div>
      </div>

      {/* 2. CENTER OVERLAYS: Kickoff Countdown & Accolade Events */}
      {showKickoffCountdown && kickoffCountdown >= 0 && (
        <KickoffCountdownHUD countdown={kickoffCountdown} active={true} />
      )}

      {showMatchEvents && events.length > 0 && (
        <MatchEventsHUD events={events} themeStyle={themeStyle} isLight={isLight} />
      )}

      {/* 3. BOTTOM ANCHOR: Left (Ball Cam), Center (Flip Timer + Speedometer), Right (Boost Gauge) */}
      <div className="relative w-full flex items-end justify-between z-30 pb-1 sm:pb-2">
        {/* Bottom-Left: Ball Cam Indicator */}
        <div className="w-1/4 flex justify-start">
          {showBallCamIndicator && (
            <BallCamIndicatorHUD
              {...ballCam}
              themeStyle={themeStyle}
              isLight={isLight}
              onToggle={onToggleBallCam}
            />
          )}
        </div>

        {/* Bottom-Center: Flip Timer & Speedometer Stack */}
        <div className="flex flex-col items-center gap-2 max-w-[420px] w-full px-2">
          {showFlipTimer && (
            <FlipTimerHUD
              {...flipTimer}
              themeStyle={themeStyle}
              isLight={isLight}
            />
          )}

          {showSpeedometer && (
            <SpeedometerHUD
              {...speed}
              themeStyle={themeStyle}
              isLight={isLight}
              onUnitChange={onSpeedUnitChange}
            />
          )}
        </div>

        {/* Bottom-Right: Boost Gauge */}
        <div className="w-1/4 flex justify-end">
          {showBoostGauge && (
            <BoostGaugeHUD
              {...boost}
              variant={boostVariant}
              themeStyle={themeStyle}
              isLight={isLight}
            />
          )}
        </div>
      </div>
    </div>
  );
};
