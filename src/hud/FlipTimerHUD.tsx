import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, CheckCircle2, AlertCircle, Sparkles, Feather } from 'lucide-react';
import { FlipTimerPhase } from './types';
import { UI_EASING } from '../tokens/easing';

export interface FlipTimerHUDProps {
  phase: FlipTimerPhase;
  remainingMs: number; // e.g. 1250ms down to 0ms
  maxMs?: number; // 1250ms
  resetCount?: number;
  onTriggerJump?: () => void;
  onTriggerReset?: () => void;
  onTriggerLand?: () => void;
  isLight?: boolean;
  className?: string;
}

/**
 * [HUD Primitive] FlipTimerHUD
 * Aerial flip / dodge countdown timer & flip reset indicator.
 * Essential competitive mechanic:
 * - When vehicle leaves the ground via jump, a 1.25s window allows a second jump/dodge.
 * - When all 4 wheels contact the ball or ceiling, a "Flip Reset" is awarded.
 * - Displays circular ring depletion, milliseconds readout, and status badges.
 */
export const FlipTimerHUD: React.FC<FlipTimerHUDProps> = ({
  phase,
  remainingMs,
  maxMs = 1250,
  resetCount = 0,
  onTriggerJump,
  onTriggerReset,
  onTriggerLand,
  isLight = false,
  className = '',
}) => {
  const fraction = Math.max(0, Math.min(1, remainingMs / maxMs));
  const secondsLeft = (Math.max(0, remainingMs) / 1000).toFixed(2);

  // Radial geometry
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - fraction * circumference;

  return (
    <div
      data-ui-element="hud-flip-timer"
      data-hud-component="flip-timer"
      className={`relative select-none pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${
        phase === 'reset'
          ? isLight
            ? 'bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-emerald-950'
            : 'bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_24px_rgba(16,185,129,0.4)] text-white'
          : phase === 'airborne'
          ? fraction > 0.3
            ? isLight
              ? 'bg-amber-500/15 border-amber-500/50 shadow-amber-500/15 text-amber-950'
              : 'bg-amber-500/15 border-amber-500/50 shadow-amber-500/20 text-white'
            : isLight
            ? 'bg-red-500/15 border-red-500/50 shadow-red-500/15 text-red-950'
            : 'bg-red-500/15 border-red-500/50 shadow-red-500/20 text-white'
          : phase === 'expired'
          ? isLight
            ? 'bg-neutral-200/70 border-neutral-300/80 text-neutral-500'
            : 'bg-neutral-900/60 border-neutral-700/60 text-neutral-400 opacity-75'
          : isLight
          ? 'bg-white/85 border-neutral-300/80 text-neutral-800 shadow-neutral-300/20'
          : 'bg-neutral-950/85 border-white/15 text-neutral-200 shadow-black/60'
      } ${className}`}
    >
      {/* Mini Circular Countdown Ring */}
      <div className="relative flex items-center justify-center h-10 w-10 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}
            strokeWidth="3.5"
          />
          {phase === 'airborne' && (
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke={fraction > 0.3 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          )}
        </svg>

        {/* Center Icon according to Phase */}
        <div className="absolute inset-0 flex items-center justify-center">
          {phase === 'grounded' && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          {phase === 'airborne' && (
            <RotateCw className="h-4 w-4 text-amber-500 animate-spin" />
          )}
          {phase === 'reset' && (
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          )}
          {phase === 'expired' && (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
        </div>
      </div>

      {/* Numerical & Phase Description */}
      <div className="flex flex-col leading-tight pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70">
            DODGE / FLIP
          </span>
          {resetCount > 0 && (
            <span className="text-[9px] font-mono font-black px-1 rounded bg-emerald-500/30 text-emerald-300">
              x{resetCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {phase === 'airborne' ? (
            <span className="text-sm font-black font-mono tracking-tight tabular-nums text-amber-400">
              {secondsLeft}s
            </span>
          ) : (
            <span
              className={`text-xs font-black tracking-wide uppercase font-mono ${
                phase === 'reset'
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : phase === 'grounded'
                  ? 'text-emerald-500'
                  : 'text-neutral-400'
              }`}
            >
              {phase === 'grounded'
                ? 'READY'
                : phase === 'reset'
                ? 'FLIP RESET!'
                : 'EXPIRED'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
