import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchScoreState, HudThemeStyle } from './types';
import { Clock, Flame, ShieldAlert } from 'lucide-react';

export interface ScoreboardHUDProps extends MatchScoreState {
  themeStyle?: HudThemeStyle;
  isLight?: boolean;
  className?: string;
}

export const ScoreboardHUD: React.FC<ScoreboardHUDProps> = ({
  blueScore = 0,
  orangeScore = 0,
  timeRemainingSec = 300,
  isOvertime = false,
  gameMode = '3v3 SOCCAR',
  blueTeamName = 'BLUE',
  orangeTeamName = 'ORANGE',
  themeStyle = 'glass',
  isLight = false,
  className = '',
}) => {
  // Format MM:SS
  const formatTime = (seconds: number) => {
    const absSec = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(absSec / 60);
    const secs = absSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = !isOvertime && timeRemainingSec > 0 && timeRemainingSec <= 10;
  const isZeroTime = !isOvertime && timeRemainingSec <= 0;

  return (
    <div
      data-ui-element="hud-scoreboard"
      className={`flex flex-col items-center select-none pointer-events-auto transition-transform duration-200 ${className}`}
    >
      {/* Game Mode Pill */}
      {gameMode && (
        <div className="mb-1">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shadow-xs backdrop-blur-md transition-colors ${
              isLight
                ? 'bg-white/85 text-neutral-700 border-neutral-300/80 shadow-xs'
                : 'bg-neutral-900/70 text-neutral-300 border-neutral-700/60'
            }`}
          >
            {gameMode}
          </span>
        </div>
      )}

      {/* Main Scoreboard Banner */}
      <div
        className={`flex items-center overflow-hidden rounded-2xl border transition-all duration-200 ${
          isLight
            ? themeStyle === 'tactile'
              ? 'bg-white border-neutral-300 shadow-xl scale-105'
              : themeStyle === 'minimal'
              ? 'bg-white/90 border-neutral-300/80 shadow-md backdrop-blur-sm'
              : 'bg-white/85 border-neutral-300/80 shadow-xl backdrop-blur-md'
            : themeStyle === 'tactile'
            ? 'bg-neutral-900/95 border-neutral-700 shadow-2xl scale-105'
            : themeStyle === 'minimal'
            ? 'bg-black/60 border-neutral-800/80 shadow-md backdrop-blur-sm'
            : 'bg-neutral-950/75 border-neutral-700/60 shadow-2xl backdrop-blur-md'
        }`}
      >
        {/* Blue Team Score Block */}
        <div className="relative flex items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-sky-600/90 to-blue-700/80 text-white min-w-[96px] border-r border-sky-400/30">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider uppercase text-sky-200">
              {blueTeamName}
            </span>
          </div>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={`blue-${blueScore}`}
              initial={{ scale: 1.4, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="text-2xl font-black font-mono tracking-tight tabular-nums"
            >
              {blueScore}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Center Timer Capsule */}
        <div
          className={`flex flex-col items-center justify-center px-4 py-1.5 min-w-[100px] transition-colors ${
            isOvertime
              ? isLight
                ? 'bg-amber-100/90 text-amber-900 font-bold'
                : 'bg-amber-950/60 text-amber-300'
              : isLowTime
              ? isLight
                ? 'bg-red-100/90 text-red-900 animate-pulse font-bold'
                : 'bg-red-950/70 text-red-300 animate-pulse'
              : isLight
              ? 'bg-neutral-100/90 text-neutral-900 font-medium'
              : 'text-neutral-100'
          }`}
        >
          <div className="flex items-center gap-1.5 font-mono text-lg font-bold tracking-wider tabular-nums">
            {isOvertime ? (
              <>
                <Flame className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
                <span className={isLight ? 'text-amber-700' : 'text-amber-400'}>+{formatTime(timeRemainingSec)}</span>
              </>
            ) : (
              <>
                {isLowTime && <ShieldAlert className="h-3.5 w-3.5 text-red-500 animate-ping" />}
                <span>{formatTime(timeRemainingSec)}</span>
              </>
            )}
          </div>

          <span className={`text-[9px] font-bold tracking-widest uppercase ${isLight ? 'text-neutral-500' : 'opacity-75'}`}>
            {isOvertime ? 'OVERTIME' : isZeroTime ? 'FINAL TOUCH' : 'MATCH TIME'}
          </span>
        </div>

        {/* Orange Team Score Block */}
        <div className="relative flex items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-orange-600/90 to-amber-600/80 text-white min-w-[96px] border-l border-orange-400/30">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={`orange-${orangeScore}`}
              initial={{ scale: 1.4, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="text-2xl font-black font-mono tracking-tight tabular-nums"
            >
              {orangeScore}
            </motion.span>
          </AnimatePresence>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold tracking-wider uppercase text-orange-200">
              {orangeTeamName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
