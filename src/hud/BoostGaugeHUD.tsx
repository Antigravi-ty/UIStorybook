import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Infinity as InfinityIcon } from 'lucide-react';

export interface BoostGaugeHUDProps {
  amount: number; // 0 to 100
  isSpending?: boolean;
  isUnlimited?: boolean;
  variant?: 'ring' | 'linear' | 'hybrid';
  isLight?: boolean;
  className?: string;
}

export const BoostGaugeHUD: React.FC<BoostGaugeHUDProps> = ({
  amount,
  isSpending = false,
  isUnlimited = false,
  variant = 'ring',
  isLight = false,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(amount)));
  const isLow = clamped < 20 && !isUnlimited;
  const isFull = clamped === 100;

  // Arc Gauge Geometry (Radius 48, Circumference ~301)
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree sweep (-225° to 45°)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  return (
    <div
      data-ui-element="hud-boost-gauge"
      data-hud-component="boost"
      className={`relative select-none pointer-events-auto flex flex-col items-center justify-center transition-all ${className}`}
    >
      {/* 1. CIRCULAR RING OR HYBRID VARIANT */}
      {(variant === 'ring' || variant === 'hybrid') && (
        <div
          className={`relative flex items-center justify-center h-32 w-32 rounded-full backdrop-blur-md border transition-all ${
            isSpending
              ? 'ring-4 ring-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.6)]'
              : 'shadow-2xl'
          } ${
            isLight
              ? 'bg-white/85 border-neutral-300/80 text-neutral-900 shadow-neutral-400/30'
              : 'bg-neutral-950/85 border-white/15 text-white shadow-black/80'
          }`}
        >
          {/* SVG Arc Gauge */}
          <svg className="absolute inset-0 h-full w-full -rotate-135" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}
              strokeWidth="7"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />

            {/* Filled Progress Arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={
                isLow
                  ? '#ef4444'
                  : isSpending
                  ? '#f59e0b'
                  : isFull
                  ? '#10b981'
                  : '#f59e0b'
              }
              strokeWidth={isSpending ? '9' : '7'}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-75"
              style={{
                filter: isSpending ? 'drop-shadow(0 0 8px #f59e0b)' : undefined,
              }}
            />
          </svg>

          {/* Center Numeric Readout & Label */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 leading-none">
              {isSpending ? (
                <Flame className="h-4 w-4 text-amber-500 animate-bounce" />
              ) : (
                <Zap className={`h-3.5 w-3.5 ${isLow ? 'text-red-500' : 'text-amber-500'}`} />
              )}

              <span
                className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                  isSpending
                    ? 'text-amber-500'
                    : isLow
                    ? 'text-red-500'
                    : isLight
                    ? 'text-neutral-500'
                    : 'text-neutral-400'
                }`}
              >
                BOOST
              </span>
            </div>

            <div className="mt-0.5">
              {isUnlimited ? (
                <div className="flex items-center justify-center text-3xl font-black text-amber-500">
                  <InfinityIcon className="h-9 w-9 stroke-[3]" />
                </div>
              ) : (
                <span
                  className={`text-4xl font-black font-mono tracking-tighter tabular-nums leading-none ${
                    isLow
                      ? 'text-red-500 animate-pulse'
                      : isSpending
                      ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                      : isLight
                      ? 'text-neutral-900'
                      : 'text-white'
                  }`}
                >
                  {clamped}
                </span>
              )}
            </div>

            {/* Graduation Ticks Label */}
            <div className="flex items-center gap-2 text-[8px] font-mono opacity-50 mt-1">
              <span>0</span>
              <span>•</span>
              <span>50</span>
              <span>•</span>
              <span>100</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. LINEAR TRACK BAR (RLCleanWASM Vector Style) */}
      {(variant === 'linear' || variant === 'hybrid') && (
        <div
          className={`flex flex-col gap-1 px-3 py-2 rounded-xl backdrop-blur-md border ${
            variant === 'hybrid' ? 'mt-2 w-32' : 'w-44'
          } ${
            isLight
              ? 'bg-white/80 border-neutral-300/80 shadow-md text-neutral-800'
              : 'bg-neutral-950/80 border-white/15 shadow-xl text-neutral-200'
          }`}
        >
          {variant === 'linear' && (
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-500">
                <Zap className="h-3 w-3" />
                BOOST
              </span>
              <span className="text-sm font-black tabular-nums">
                {isUnlimited ? '∞' : clamped}
              </span>
            </div>
          )}

          {/* SVG Vector Scale with Graduation Ticks at 0, 25, 50, 75, 100 */}
          <svg className="w-full h-3 overflow-visible" viewBox="0 0 160 12">
            <line x1="2" y1="8" x2="158" y2="8" stroke={isLight ? '#d4d4d8' : '#3f3f46'} strokeWidth="2.5" />
            {[0, 25, 50, 75, 100].map((tick) => {
              const x = 2 + (tick / 100) * 156;
              const isMajor = tick === 0 || tick === 100;
              return (
                <line
                  key={tick}
                  x1={x}
                  y1={isMajor ? 2 : 4}
                  x2={x}
                  y2={8}
                  stroke={isLight ? '#71717a' : '#a1a1aa'}
                  strokeWidth={isMajor ? '1.5' : '1'}
                />
              );
            })}
            {/* Fill Track */}
            <line
              x1="2"
              y1="8"
              x2={2 + (clamped / 100) * 156}
              y2="8"
              stroke={isSpending ? '#f59e0b' : isLow ? '#ef4444' : '#f59e0b'}
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
