import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { UI_EASING } from '../tokens/easing';

export interface MatchScoreboardHUDProps {
  blueScore: number;
  orangeScore: number;
  blueName?: string;
  orangeName?: string;
  clockSeconds: number;
  isOvertime?: boolean;
  periodLabel?: string;
  countdown?: number | null;
  isLight?: boolean;
  className?: string;
}

export function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * [HUD Primitive] MatchScoreboardHUD
 * Nintendo & Apple inspired in-game scoreboard.
 * - Top-center hanging pill with glassmorphic backdrop
 * - Blue vs Orange team colorways with tabular animated score increments
 * - Center match clock with Overtime pulsing indicator
 * - Decoupled presentational component (0 WASM / 0 engine dependencies)
 */
export const MatchScoreboardHUD: React.FC<MatchScoreboardHUDProps> = ({
  blueScore,
  orangeScore,
  blueName = 'BLUE',
  orangeName = 'ORANGE',
  clockSeconds,
  isOvertime = false,
  periodLabel = '1v1 DUEL',
  countdown = null,
  isLight = false,
  className = '',
}) => {
  return (
    <div
      data-ui-element="hud-scoreboard"
      data-hud-component="scoreboard"
      className={`relative select-none pointer-events-auto flex items-center shadow-2xl transition-all ${className}`}
    >
      <div
        className={`flex items-stretch rounded-2xl border backdrop-blur-md overflow-hidden transition-colors ${
          isLight
            ? 'bg-white/90 border-neutral-300/80 shadow-neutral-400/30 text-neutral-900'
            : 'bg-neutral-950/85 border-white/15 shadow-black/80 text-white'
        }`}
      >
        {/* Blue Team Block */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-blue-600/25 to-blue-500/10 border-r border-neutral-200/40 dark:border-white/10">
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400">
              {blueName}
            </span>
            <span className="text-[9px] font-mono opacity-60">TEAM</span>
          </div>

          <motion.div
            key={`blue-score-${blueScore}`}
            initial={{ scale: 1.4, y: -2 }}
            animate={{ scale: 1, y: 0 }}
            transition={UI_EASING.spring.tactile}
            className="min-w-[28px] text-center text-xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400"
          >
            {blueScore}
          </motion.div>
        </div>

        {/* Center Clock & Period Block */}
        <div className="flex flex-col items-center justify-center px-4 py-1.5 min-w-[96px] bg-neutral-500/5">
          <div className="flex items-center gap-1.5 leading-none">
            {isOvertime ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider text-amber-500 animate-pulse">
                <Flame className="h-3 w-3" />
                <span>+</span>
              </span>
            ) : null}

            <span
              className={`font-mono text-base font-black tracking-tight tabular-nums ${
                clockSeconds <= 10 && !isOvertime
                  ? 'text-red-500 animate-pulse'
                  : isLight
                  ? 'text-neutral-900'
                  : 'text-neutral-100'
              }`}
            >
              {formatClock(clockSeconds)}
            </span>
          </div>

          <span className="text-[9px] font-semibold tracking-widest uppercase opacity-60 mt-0.5">
            {isOvertime ? 'OVERTIME' : periodLabel}
          </span>
        </div>

        {/* Orange Team Block */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-l from-orange-600/25 to-orange-500/10 border-l border-neutral-200/40 dark:border-white/10">
          <motion.div
            key={`orange-score-${orangeScore}`}
            initial={{ scale: 1.4, y: -2 }}
            animate={{ scale: 1, y: 0 }}
            transition={UI_EASING.spring.tactile}
            className="min-w-[28px] text-center text-xl font-black font-mono tracking-tight text-orange-600 dark:text-orange-400"
          >
            {orangeScore}
          </motion.div>

          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 dark:text-orange-400">
              {orangeName}
            </span>
            <span className="text-[9px] font-mono opacity-60">TEAM</span>
          </div>
        </div>
      </div>

      {/* Kickoff Countdown Badge Pill (Floating below clock when active) */}
      <AnimatePresence>
        {countdown !== null && countdown !== undefined && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -4 }}
            transition={UI_EASING.spring.snappy}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500 text-white shadow-lg shadow-amber-500/30 flex items-center gap-1 whitespace-nowrap"
          >
            <Clock className="h-3 w-3" />
            <span>KICKOFF IN {countdown}s</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
