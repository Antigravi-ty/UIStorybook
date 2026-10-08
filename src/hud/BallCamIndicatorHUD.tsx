import React from 'react';
import { motion } from 'framer-motion';
import { BallCamState, HudThemeStyle } from './types';
import { Crosshair, Navigation, Car, Eye } from 'lucide-react';
import { KeycapBadge } from '../primitives/KeycapBadge';

export interface BallCamIndicatorHUDProps extends BallCamState {
  themeStyle?: HudThemeStyle;
  isLight?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const BallCamIndicatorHUD: React.FC<BallCamIndicatorHUDProps> = ({
  isBallCam = true,
  ballAngleDeg = 45,
  distanceToBallMeters = 24.5,
  themeStyle = 'glass',
  isLight = false,
  onToggle,
  className = '',
}) => {
  return (
    <div
      data-ui-element="hud-ballcam-indicator"
      className={`select-none pointer-events-auto flex items-center gap-2.5 ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 ${
          isBallCam
            ? 'bg-neutral-950/85 border-amber-500/70 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)]'
            : 'bg-neutral-900/80 border-neutral-700 text-neutral-300 shadow-lg'
        } ${themeStyle === 'glass' ? 'backdrop-blur-md' : ''}`}
        title="点击或按空格键切换球相机 (Toggle Ball Cam)"
      >
        {/* Animated Icon Indicator */}
        <div
          className={`h-7 w-7 rounded-xl flex items-center justify-center transition-colors ${
            isBallCam
              ? 'bg-amber-500 text-black font-bold'
              : 'bg-neutral-800 text-neutral-400 group-hover:text-white'
          }`}
        >
          {isBallCam ? (
            <motion.div
              animate={{ rotate: [0, 90, 180, 270, 360] }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            >
              <Crosshair className="h-4 w-4 stroke-[2.5]" />
            </motion.div>
          ) : (
            <Car className="h-4 w-4" />
          )}
        </div>

        {/* Status text */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wider uppercase font-mono">
              {isBallCam ? 'BALL CAM' : 'CAR CAM'}
            </span>
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                isBallCam ? 'bg-amber-400 animate-pulse' : 'bg-neutral-500'
              }`}
            />
          </div>
          <span className="text-[9px] font-mono text-neutral-400 tracking-tight">
            {isBallCam ? 'TRACKING TARGET' : 'FIXED COCKPIT'}
          </span>
        </div>

        {/* Keycap Badge */}
        <div className="ml-1 opacity-90">
          <KeycapBadge keyLabel="SPACE" size="sm" isLight={false} />
        </div>
      </button>

      {/* Off-screen Ball Locator Arrow (Nintendo-style directional compass pill when in Car Cam) */}
      {!isBallCam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-md backdrop-blur-sm"
        >
          <motion.div
            style={{ transform: `rotate(${ballAngleDeg}deg)` }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Navigation className="h-4 w-4 fill-amber-400 text-amber-400" />
          </motion.div>
          <span className="text-[11px] tabular-nums">{distanceToBallMeters.toFixed(1)}m</span>
        </motion.div>
      )}
    </div>
  );
};
