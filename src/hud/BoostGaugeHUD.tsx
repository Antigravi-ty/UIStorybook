import React from 'react';
import { motion } from 'framer-motion';
import { BoostState, HudThemeStyle } from './types';
import { Flame, Infinity as InfinityIcon } from 'lucide-react';

export interface BoostGaugeHUDProps extends BoostState {
  themeStyle?: HudThemeStyle;
  variant?: 'circular' | 'linear';
  isLight?: boolean;
  className?: string;
}

export const BoostGaugeHUD: React.FC<BoostGaugeHUDProps> = ({
  amount = 100,
  isInfinite = false,
  isFiring = false,
  themeStyle = 'glass',
  variant = 'circular',
  isLight = false,
  className = '',
}) => {
  const clampedAmount = Math.max(0, Math.min(100, Math.round(amount)));

  // Color dynamics
  const getBoostColor = () => {
    if (isInfinite) return '#0284c7'; // sky
    if (clampedAmount <= 20) return '#ef4444'; // red
    if (clampedAmount <= 50) return '#f59e0b'; // amber
    return isLight ? '#059669' : '#10b981'; // emerald
  };

  const color = getBoostColor();
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Arc angle: 270 degrees sweep
  const sweepAngle = 270;
  const arcTotal = (sweepAngle / 360) * circumference;
  const progressOffset = arcTotal - (clampedAmount / 100) * arcTotal;

  return (
    <div
      data-ui-element="hud-boost-gauge"
      className={`relative select-none pointer-events-auto transition-transform duration-150 ${
        isFiring ? 'scale-105' : 'scale-100'
      } ${className}`}
    >
      {variant === 'circular' ? (
        <div
          className={`relative flex flex-col items-center justify-center p-3 rounded-full border transition-all duration-200 ${
            isLight
              ? themeStyle === 'tactile'
                ? 'bg-white border-neutral-300 shadow-2xl'
                : themeStyle === 'minimal'
                ? 'bg-white/85 border-neutral-300 shadow-md backdrop-blur-xs'
                : 'bg-white/85 border-neutral-300/80 shadow-2xl backdrop-blur-md'
              : themeStyle === 'tactile'
              ? 'bg-neutral-900/95 border-neutral-700 shadow-2xl'
              : themeStyle === 'minimal'
              ? 'bg-black/60 border-neutral-800 shadow-md backdrop-blur-xs'
              : 'bg-neutral-950/80 border-neutral-800/80 shadow-2xl backdrop-blur-md'
          }`}
          style={{ width: '148px', height: '148px' }}
        >
          {/* Firing Plasma Glow */}
          {isFiring && (
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.4], scale: [0.95, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.15 }}
              className="absolute inset-0 rounded-full blur-xl pointer-events-none"
              style={{ backgroundColor: color }}
            />
          )}

          {/* SVG Circular Progress Track */}
          <svg className="w-full h-full transform -rotate-[225deg]" viewBox="0 0 136 136">
            {/* Background Track */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${arcTotal} ${circumference}`}
              strokeLinecap="round"
              className={isLight ? 'text-neutral-200/90' : 'text-neutral-800/80 dark:text-neutral-800/90'}
            />

            {/* Foreground Active Arc */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${arcTotal} ${circumference}`}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-75"
              style={{
                filter: isFiring ? `drop-shadow(0 0 8px ${color})` : undefined,
              }}
            />
          </svg>

          {/* Center Digital Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1">
              {isFiring && (
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                >
                  <Flame className="h-4 w-4" style={{ color }} />
                </motion.div>
              )}
              {isInfinite ? (
                <InfinityIcon className={`h-10 w-10 ${isLight ? 'text-sky-600' : 'text-sky-400'} stroke-[3]`} />
              ) : (
                <span
                  className="text-4xl font-black font-mono tracking-tighter tabular-nums drop-shadow-md"
                  style={{ color: isFiring ? (isLight ? '#0f172a' : '#ffffff') : color }}
                >
                  {clampedAmount}
                </span>
              )}
            </div>

            <span className={`text-[10px] font-mono font-bold tracking-widest uppercase -mt-1 ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              BOOST
            </span>

            {/* Micro Ticks indicators */}
            <div className="flex items-center gap-1 mt-1 opacity-75">
              {[25, 50, 75, 100].map((tick) => (
                <div
                  key={tick}
                  className={`h-1 w-2 rounded-full transition-colors ${
                    clampedAmount >= tick
                      ? isLight ? 'bg-neutral-800' : 'bg-white'
                      : isLight ? 'bg-neutral-300' : 'bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Linear Variant */
        <div
          className={`flex flex-col gap-1.5 p-3 rounded-2xl border min-w-[200px] transition-colors ${
            isLight
              ? themeStyle === 'tactile'
                ? 'bg-white border-neutral-300 shadow-xl'
                : 'bg-white/85 border-neutral-300/80 shadow-xl backdrop-blur-md'
              : themeStyle === 'tactile'
              ? 'bg-neutral-900/95 border-neutral-700 shadow-xl'
              : 'bg-neutral-950/80 border-neutral-800 shadow-xl backdrop-blur-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <div className={`flex items-center gap-1.5 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              <Flame className="h-3.5 w-3.5" style={{ color }} />
              <span>BOOST</span>
            </div>
            <span className="text-base font-black tabular-nums" style={{ color }}>
              {isInfinite ? '∞' : clampedAmount}
            </span>
          </div>

          <div className={`relative w-full h-3 rounded-full overflow-hidden ${
            isLight ? 'bg-neutral-200' : 'bg-neutral-800'
          }`}>
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: isInfinite ? '100%' : `${clampedAmount}%`,
                backgroundColor: color,
                boxShadow: isFiring ? `0 0 12px ${color}` : undefined,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
