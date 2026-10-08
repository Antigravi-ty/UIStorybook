import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shield, Flame, Skull, Target, Zap, Sparkles } from 'lucide-react';
import { AccoladeEvent } from './types';
import { UI_EASING } from '../tokens/easing';

export interface MatchAccoladeBannerHUDProps {
  currentAccolade?: AccoladeEvent | null;
  countdownNumber?: number | null; // 3, 2, 1, 0 (GO!)
  isLight?: boolean;
  className?: string;
}

export const MatchAccoladeBannerHUD: React.FC<MatchAccoladeBannerHUDProps> = ({
  currentAccolade = null,
  countdownNumber = null,
  isLight = false,
  className = '',
}) => {
  return (
    <div
      data-ui-element="hud-accolade-banner"
      data-hud-component="accolade-banner"
      className={`pointer-events-none select-none flex flex-col items-center justify-center ${className}`}
    >
      {/* 1. KICKOFF COUNTDOWN (3 -> 2 -> 1 -> GO!) */}
      <AnimatePresence mode="popLayout">
        {countdownNumber !== null && countdownNumber !== undefined && (
          <motion.div
            key={`countdown-${countdownNumber}`}
            initial={{ scale: 2.2, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: 20 }}
            transition={UI_EASING.spring.snappy}
            className="flex flex-col items-center justify-center text-center my-4"
          >
            {countdownNumber > 0 ? (
              <div className="relative">
                <span className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_35px_rgba(245,158,11,0.9)] stroke-black">
                  {countdownNumber}
                </span>
                <span className="block text-xs font-mono font-bold tracking-widest uppercase text-amber-400 mt-1">
                  GET READY
                </span>
              </div>
            ) : (
              <div className="relative">
                <span className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-wider text-emerald-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.9)] animate-pulse">
                  GO!
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MATCH ACCOLADE BANNER OR GOAL CELEBRATION */}
      <AnimatePresence mode="wait">
        {currentAccolade && (
          <motion.div
            key={`accolade-${currentAccolade.id}`}
            initial={{ opacity: 0, scale: 0.85, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -20 }}
            transition={UI_EASING.spring.snappy}
            className="my-3 flex flex-col items-center justify-center text-center"
          >
            {currentAccolade.type === 'goal' ? (
              /* High-impact Goal Celebration Ribbon */
              <div
                className={`relative px-8 py-4 rounded-3xl border backdrop-blur-xl shadow-2xl flex flex-col items-center gap-1 ${
                  currentAccolade.team === 'orange'
                    ? 'bg-gradient-to-r from-orange-600/90 via-amber-600/90 to-orange-600/90 border-orange-400 text-white shadow-orange-600/50'
                    : 'bg-gradient-to-r from-blue-600/90 via-sky-600/90 to-blue-600/90 border-blue-400 text-white shadow-blue-600/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 animate-bounce" />
                  <span className="text-3xl sm:text-4xl font-black tracking-widest uppercase font-mono drop-shadow-md">
                    GOAL!
                  </span>
                  <Flame className="h-6 w-6 animate-bounce" />
                </div>

                <div className="flex items-center gap-2 text-sm font-bold font-mono">
                  <span>{currentAccolade.title}</span>
                  {currentAccolade.speedKmh && (
                    <span className="px-2 py-0.5 rounded-full bg-black/40 text-xs border border-white/20">
                      {currentAccolade.speedKmh} KM/H
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Crisp Accolade Card (Epic Save, Shot, Demo) */
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border backdrop-blur-md shadow-xl bg-neutral-950/85 border-white/20 text-white">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  {currentAccolade.type === 'epic-save' || currentAccolade.type === 'save' ? (
                    <Shield className="h-5 w-5" />
                  ) : currentAccolade.type === 'demo' ? (
                    <Skull className="h-5 w-5 text-red-400" />
                  ) : (
                    <Target className="h-5 w-5" />
                  )}
                </div>

                <div className="flex flex-col items-start leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-mono tracking-wider uppercase">
                      {currentAccolade.title}
                    </span>
                    {currentAccolade.points && (
                      <span className="text-xs font-mono font-bold text-amber-400">
                        +{currentAccolade.points}
                      </span>
                    )}
                  </div>
                  {currentAccolade.subtitle && (
                    <span className="text-[10px] opacity-70">
                      {currentAccolade.subtitle}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
