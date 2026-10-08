import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Sparkles } from 'lucide-react';

export interface SpeedometerHUDProps {
  speed: number; // in uu/s (0 ~ 2300)
  maxSpeed?: number; // 2300 uu/s
  supersonicThreshold?: number; // 2200 uu/s (85% mark)
  showUnits?: 'uu' | 'kmh' | 'both';
  isLight?: boolean;
  className?: string;
}

export function uuToKmh(uuPerSec: number): number {
  // Rocket League conversion: 1 Unreal Unit/sec ≈ 0.06 km/h (2300 uu/s ≈ 138 km/h)
  return Math.round(uuPerSec * 0.06);
}

/**
 * [HUD Primitive] SpeedometerHUD
 * Precision nonlinear speedometer matching RocketSim / RLCleanWASM specification.
 * - Sub-1410 uu/s: Gold / amber zone (0% - 40% progress)
 * - 1410 ~ 2200 uu/s: Bright green high-velocity zone (40% - 85% progress)
 * - 2200+ uu/s: Supersonic purple trail & luminous notch (85% - 100% progress)
 */
export const SpeedometerHUD: React.FC<SpeedometerHUDProps> = ({
  speed,
  maxSpeed = 2300,
  supersonicThreshold = 2200,
  showUnits = 'both',
  isLight = false,
  className = '',
}) => {
  const clampedSpeed = Math.max(0, Math.min(maxSpeed, speed));
  const isSupersonic = clampedSpeed >= supersonicThreshold;

  // Nonlinear scale mapping identical to SpeedometerHUD.js
  let progressPct = 0;
  let barColor = '#d4af37'; // gold

  if (clampedSpeed <= 1410) {
    progressPct = (clampedSpeed / 1410) * 40;
    barColor = '#d4af37';
  } else if (clampedSpeed < supersonicThreshold) {
    const t = (clampedSpeed - 1410) / (supersonicThreshold - 1410);
    progressPct = 40 + t * 45;
    // Interpolate towards emerald
    barColor = '#59f168';
  } else {
    const t = (clampedSpeed - supersonicThreshold) / (maxSpeed - supersonicThreshold);
    progressPct = 85 + t * 15;
    barColor = '#a020f0'; // purple glow
  }

  const kmh = uuToKmh(clampedSpeed);

  return (
    <div
      data-ui-element="hud-speedometer"
      data-hud-component="speedometer"
      className={`relative select-none pointer-events-auto flex flex-col items-center gap-1.5 transition-all ${className}`}
    >
      {/* Top Readout: Speed Numbers & Supersonic Badge */}
      <div
        className={`flex items-center gap-3 px-3 py-1 rounded-xl backdrop-blur-md border shadow-lg transition-colors ${
          isLight
            ? 'bg-white/85 border-neutral-300/80 text-neutral-900 shadow-neutral-400/20'
            : 'bg-neutral-950/70 border-white/10 text-white shadow-black/60'
        }`}
      >
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-sm font-black tabular-nums tracking-tight">
            {kmh}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            KM/H
          </span>
          {showUnits === 'both' && (
            <span
              className={`text-[10px] font-normal ml-1 ${
                isLight ? 'text-neutral-500' : 'text-neutral-500'
              }`}
            >
              ({Math.round(clampedSpeed)} uu/s)
            </span>
          )}
        </div>

        {/* Supersonic State Badge */}
        <AnimatePresence>
          {isSupersonic && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black font-mono tracking-widest uppercase bg-purple-600 text-white shadow-[0_0_12px_#a020f0] animate-pulse"
            >
              <Sparkles className="h-3 w-3 stroke-[2.5]" />
              <span>SUPERSONIC</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Track Bar */}
      <div
        className={`relative w-72 sm:w-80 md:w-96 h-2.5 rounded-full overflow-hidden backdrop-blur-md border shadow-lg transition-colors ${
          isLight
            ? 'border-neutral-300/80 bg-neutral-200/80'
            : 'border-white/20 bg-neutral-900/80'
        }`}
      >
        {/* Supersonic Notch at 85% */}
        <div
          className={`absolute top-0 bottom-0 w-0.5 z-20 ${
            isLight
              ? 'bg-neutral-800 shadow-[0_0_4px_rgba(0,0,0,0.3)]'
              : 'bg-white/90 shadow-[0_0_6px_#ffffff]'
          }`}
          style={{ left: '85%' }}
          title="Supersonic Threshold (2200 uu/s)"
        />

        {/* Dynamic Speed Fill Bar */}
        <div
          className="h-full rounded-full transition-all duration-75"
          style={{
            width: `${Math.min(100, Math.max(0, progressPct))}%`,
            backgroundColor: barColor,
            boxShadow: isSupersonic
              ? '0 0 16px #a020f0, inset 0 0 4px #ffffff'
              : `0 0 8px ${barColor}`,
          }}
        />
      </div>

      {/* Track Footnote: 0 -> 2200 (Supersonic) -> Max */}
      <div
        className={`w-72 sm:w-80 md:w-96 flex items-center justify-between text-[8px] font-mono px-1 ${
          isLight ? 'text-neutral-600 opacity-80' : 'opacity-50 text-neutral-400'
        }`}
      >
        <span>0</span>
        <span
          className={`font-semibold ${
            isLight ? 'text-purple-600 font-bold' : 'text-purple-400'
          }`}
          style={{ marginLeft: '60%' }}
        >
          ▲ 2200 SUPERSONIC
        </span>
        <span>MAX</span>
      </div>
    </div>
  );
};
