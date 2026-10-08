import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Eye, Video } from 'lucide-react';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { UI_EASING } from '../tokens/easing';

export interface BallCamIndicatorHUDProps {
  mode: 'ball' | 'car';
  onToggle?: () => void;
  shortcut?: string;
  gamepadShortcut?: string;
  isLight?: boolean;
  className?: string;
}

export const BallCamIndicatorHUD: React.FC<BallCamIndicatorHUDProps> = ({
  mode,
  onToggle,
  shortcut = 'SPACE',
  gamepadShortcut = 'Y',
  isLight = false,
  className = '',
}) => {
  const isBallCam = mode === 'ball';

  return (
    <motion.button
      type="button"
      data-ui-element="hud-ballcam-indicator"
      data-hud-component="ball-cam"
      onClick={onToggle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={UI_EASING.spring.tactile}
      className={`relative select-none pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border backdrop-blur-md shadow-xl transition-all cursor-pointer ${
        isBallCam
          ? isLight
            ? 'bg-amber-500/15 border-amber-500/60 text-amber-950 shadow-amber-500/20'
            : 'bg-amber-500/20 border-amber-500/50 text-white shadow-amber-500/30'
          : isLight
          ? 'bg-white/80 border-neutral-300/80 text-neutral-600 shadow-neutral-300/20'
          : 'bg-neutral-950/80 border-white/15 text-neutral-400 shadow-black/60'
      } ${className}`}
      title={`Toggle Camera Mode (${shortcut})`}
    >
      {/* Icon with Glowing Indicator Dot */}
      <div className="relative flex items-center justify-center">
        {isBallCam ? (
          <Crosshair className="h-4 w-4 text-amber-500 animate-spin-slow" />
        ) : (
          <Video className="h-4 w-4 opacity-70" />
        )}

        {isBallCam && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-ping" />
        )}
      </div>

      {/* Label Text */}
      <div className="flex flex-col items-start leading-tight">
        <span
          className={`text-xs font-black tracking-wider uppercase font-mono ${
            isBallCam
              ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
              : isLight
              ? 'text-neutral-700'
              : 'text-neutral-300'
          }`}
        >
          {isBallCam ? 'BALL CAM' : 'CAR CAM'}
        </span>
        <span className="text-[9px] font-medium opacity-60">
          {isBallCam ? 'Tracking Sphere' : 'Follow Cockpit'}
        </span>
      </div>

      {/* Keycap Badge */}
      <div className="flex items-center gap-1 ml-1">
        <KeycapBadge shortcut={shortcut} size="sm" isLight={isLight} />
        {gamepadShortcut && (
          <span className="hidden sm:inline-block text-[10px] font-mono px-1 py-0.5 rounded border border-neutral-400/40 opacity-70">
            {gamepadShortcut}
          </span>
        )}
      </div>
    </motion.button>
  );
};
