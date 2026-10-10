import React from 'react';
import { FlipTimerState, HudThemeStyle } from './types';
import { RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export interface FlipTimerHUDProps extends FlipTimerState {
  themeStyle?: HudThemeStyle;
  isLight?: boolean;
  className?: string;
  onTriggerJump?: () => void;
  onTriggerReset?: () => void;
}

export const FlipTimerHUD: React.FC<FlipTimerHUDProps> = ({
  status = 'grounded',
  timerRemainingSec = 1.5,
  maxTimerSec = 1.5,
  wheelContacts = [true, true, true, true],
  themeStyle = 'glass',
  isLight = false,
  className = '',
  onTriggerJump,
  onTriggerReset,
}) => {
  const percent = Math.max(0, Math.min(100, (timerRemainingSec / maxTimerSec) * 100));
  const isResetReady = status === 'reset-ready';
  const isCountingDown = status === 'timer';
  const isExpired = status === 'expired';
  const isGrounded = status === 'grounded';

  // Status colors
  const getColor = () => {
    if (isResetReady) return isLight ? '#d97706' : '#fbbf24'; // amber
    if (isGrounded) return isLight ? '#059669' : '#34d399'; // emerald
    if (isCountingDown) {
      if (timerRemainingSec > 0.8) return isLight ? '#0284c7' : '#38bdf8'; // sky
      if (timerRemainingSec > 0.3) return isLight ? '#d97706' : '#f59e0b'; // amber
      return isLight ? '#dc2626' : '#ef4444'; // red warning
    }
    return isLight ? '#a3a3a3' : '#737373'; // neutral
  };

  const statusColor = getColor();

  return (
    <div
      data-ui-element="hud-flip-timer"
      className={`relative select-none pointer-events-auto flex flex-col items-center gap-1.5 ${className}`}
    >
      <div
        className={`flex items-center gap-3 px-3.5 py-1.5 rounded-2xl border ${
          isLight
            ? isResetReady
              ? 'bg-amber-50/95 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : isCountingDown
              ? 'bg-white/90 border-neutral-300 shadow-xl backdrop-blur-md'
              : 'bg-white/80 border-neutral-300 shadow-md backdrop-blur-sm'
            : isResetReady
            ? 'bg-amber-950/80 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            : isCountingDown
            ? 'bg-neutral-950/85 border-neutral-700 shadow-xl backdrop-blur-md'
            : 'bg-neutral-900/75 border-neutral-800 shadow-md backdrop-blur-sm'
        }`}
      >
        {/* Status Icon (Real-time static display) */}
        <div className="flex items-center justify-center">
          {isResetReady ? (
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
          ) : isCountingDown ? (
            <RefreshCw
              className="h-3.5 w-3.5"
              style={{ color: statusColor }}
            />
          ) : isGrounded ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-neutral-400" />
          )}
        </div>

        {/* State Label & Timer Progress */}
        <div className="flex flex-col min-w-[120px]">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase">
            <span style={{ color: statusColor }}>
              {isResetReady
                ? 'FLIP RESET (∞)'
                : isCountingDown
                ? 'DODGE WINDOW'
                : isGrounded
                ? 'FLIP READY'
                : 'FLIP EXPIRED'}
            </span>

            <span className="tabular-nums font-mono text-xs font-black" style={{ color: statusColor }}>
              {isResetReady
                ? '∞'
                : isCountingDown
                ? `${timerRemainingSec.toFixed(2)}s`
                : isGrounded
                ? '2/2'
                : '0/2'}
            </span>
          </div>

          {/* Mini progress bar (Real-time instantaneous render) */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden mt-1 ${isLight ? 'bg-neutral-200' : 'bg-neutral-800'}`}>
            <div
              className="h-full rounded-full"
              style={{
                width: isResetReady ? '100%' : isGrounded ? '100%' : `${percent}%`,
                backgroundColor: statusColor,
                boxShadow: isResetReady || (isCountingDown && timerRemainingSec > 0.8) ? `0 0 8px ${statusColor}` : undefined,
              }}
            />
          </div>
        </div>

        {/* 4-Wheel Contact Telemetry Dots (FL, FR, RL, RR) */}
        <div
          className={`flex flex-col gap-0.5 pl-2 border-l ${isLight ? 'border-neutral-300' : 'border-neutral-700/60'}`}
          title="4-Wheel Contact Sensor (4轮触地/触球感知)"
        >
          <div className="flex items-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                wheelContacts[0] ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]' : isLight ? 'bg-neutral-300' : 'bg-neutral-700'
              }`}
              title="Front Left"
            />
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                wheelContacts[1] ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]' : isLight ? 'bg-neutral-300' : 'bg-neutral-700'
              }`}
              title="Front Right"
            />
          </div>
          <div className="flex items-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                wheelContacts[2] ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]' : isLight ? 'bg-neutral-300' : 'bg-neutral-700'
              }`}
              title="Rear Left"
            />
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                wheelContacts[3] ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]' : isLight ? 'bg-neutral-300' : 'bg-neutral-700'
              }`}
              title="Rear Right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
