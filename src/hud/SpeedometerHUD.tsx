import React from 'react';
import { motion } from 'framer-motion';
import { SpeedState, HudThemeStyle } from './types';
import { Zap, Gauge } from 'lucide-react';

export interface SpeedometerHUDProps extends SpeedState {
  themeStyle?: HudThemeStyle;
  isLight?: boolean;
  className?: string;
  onUnitChange?: (unit: 'uu/s' | 'km/h' | 'mph') => void;
}

export const SpeedometerHUD: React.FC<SpeedometerHUDProps> = ({
  speed = 0,
  maxSpeed = 2300,
  unit = 'uu/s',
  isSupersonic = false,
  themeStyle = 'glass',
  isLight = false,
  className = '',
  onUnitChange,
}) => {
  const clampedSpeed = Math.max(0, Math.min(maxSpeed, Math.round(speed)));
  const supersonicThreshold = 2200;
  const isCurrentlySupersonic = isSupersonic || clampedSpeed >= supersonicThreshold;

  // Calculate non-linear percentage per RLCleanWASM mechanics:
  // Segment 1: 0 <= v <= 1410 -> p = (v / 1410) * 40%
  // Segment 2: 1410 < v < 2200 -> p = 40 + ((v - 1410) / 790) * 45%
  // Segment 3: 2200 <= v <= 2300 -> p = 85 + ((v - 2200) / 100) * 15%
  let percent = 0;
  if (clampedSpeed <= 1410) {
    percent = (clampedSpeed / 1410) * 40;
  } else if (clampedSpeed < supersonicThreshold) {
    percent = 40 + ((clampedSpeed - 1410) / (supersonicThreshold - 1410)) * 45;
  } else {
    percent = 85 + ((clampedSpeed - supersonicThreshold) / (maxSpeed - supersonicThreshold)) * 15;
  }
  percent = Math.min(100, Math.max(0, percent));

  // Converted value for display
  const getDisplaySpeed = () => {
    if (unit === 'km/h') {
      // 1 uu/s ~= 0.036 km/h (Rocket League standard: 2300 uu/s = 82.8 km/h or ~83 km/h)
      return Math.round(clampedSpeed * 0.036);
    }
    if (unit === 'mph') {
      return Math.round(clampedSpeed * 0.02237);
    }
    return clampedSpeed;
  };

  // Color gradient
  const getBarColor = () => {
    if (isCurrentlySupersonic) return '#c084fc'; // purple-400
    if (clampedSpeed > 1410) return '#34d399'; // emerald-400
    return '#fbbf24'; // amber-400
  };

  const barColor = getBarColor();

  return (
    <div
      data-ui-element="hud-speedometer"
      className={`relative select-none pointer-events-auto flex flex-col items-center gap-1.5 min-w-[280px] max-w-[420px] w-full ${className}`}
    >
      {/* Top telemetry pill: Digital readout + Supersonic badge */}
      <div className="flex items-center justify-between w-full px-2 text-xs font-mono font-bold">
        <div className="flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-neutral-400 text-[10px] tracking-wider uppercase">VELOCITY</span>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentlySupersonic && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/60 text-purple-300 text-[10px] font-black tracking-widest uppercase shadow-[0_0_12px_rgba(192,132,252,0.5)]"
            >
              <Zap className="h-3 w-3 fill-purple-300 text-purple-300" />
              <span>SUPERSONIC</span>
            </motion.div>
          )}

          <div
            onClick={() => {
              if (onUnitChange) {
                const nextUnit = unit === 'uu/s' ? 'km/h' : unit === 'km/h' ? 'mph' : 'uu/s';
                onUnitChange(nextUnit);
              }
            }}
            className="flex items-baseline gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            title="点击切换速度单位 (uu/s, km/h, mph)"
          >
            <span
              className="text-base font-black tracking-tight tabular-nums transition-colors"
              style={{ color: isCurrentlySupersonic ? '#d8b4fe' : '#ffffff' }}
            >
              {getDisplaySpeed()}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase">{unit}</span>
          </div>
        </div>
      </div>

      {/* Progress Track with Notch at 85% (2200 uu/s) */}
      <div
        className={`relative w-full h-2.5 rounded-full overflow-hidden border transition-all duration-200 ${
          isCurrentlySupersonic
            ? 'bg-neutral-900 border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
            : 'bg-neutral-900/90 border-neutral-700/80 shadow-inner'
        }`}
      >
        {/* Supersonic Threshold Notch at 85% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neutral-400/70 z-10"
          style={{ left: '85%' }}
          title="Supersonic Threshold (2200 uu/s)"
        />

        {/* Filling progress */}
        <div
          className="h-full rounded-full transition-all duration-75"
          style={{
            width: `${percent}%`,
            backgroundColor: barColor,
            boxShadow: isCurrentlySupersonic ? '0 0 16px #c084fc' : undefined,
          }}
        />
      </div>

      {/* Speedometer milestones */}
      <div className="flex justify-between w-full px-1 text-[9px] font-mono text-neutral-500 font-semibold">
        <span>0</span>
        <span>1410 (CRUISE)</span>
        <span className="text-purple-400/90">2200 (SUPERSONIC)</span>
        <span>2300 MAX</span>
      </div>
    </div>
  );
};
