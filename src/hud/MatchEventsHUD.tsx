import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccoladeEvent, HudThemeStyle } from './types';
import { Trophy, ShieldCheck, Flame, Target, Zap, Award } from 'lucide-react';

export interface MatchEventsHUDProps {
  events: AccoladeEvent[];
  themeStyle?: HudThemeStyle;
  isLight?: boolean;
  className?: string;
}

export const MatchEventsHUD: React.FC<MatchEventsHUDProps> = ({
  events = [],
  themeStyle = 'glass',
  isLight = false,
  className = '',
}) => {
  const getEventIcon = (type: AccoladeEvent['type']) => {
    switch (type) {
      case 'goal':
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case 'epic-save':
        return <ShieldCheck className="h-5 w-5 text-purple-400" />;
      case 'save':
        return <ShieldCheck className="h-5 w-5 text-sky-400" />;
      case 'demo':
        return <Flame className="h-5 w-5 text-red-400" />;
      case 'shot':
        return <Target className="h-5 w-5 text-emerald-400" />;
      case 'aerial':
        return <Zap className="h-5 w-5 text-indigo-400" />;
      default:
        return <Award className="h-5 w-5 text-white" />;
    }
  };

  const getBorderColor = (type: AccoladeEvent['type']) => {
    switch (type) {
      case 'goal':
        return 'border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.4)]';
      case 'epic-save':
        return 'border-purple-500/70 shadow-[0_0_25px_rgba(168,85,247,0.4)]';
      case 'demo':
        return 'border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.4)]';
      default:
        return 'border-neutral-700 shadow-xl';
    }
  };

  return (
    <div
      data-ui-element="hud-match-events"
      className={`fixed top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-40 select-none ${className}`}
    >
      <AnimatePresence>
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ scale: 0.7, opacity: 0, y: -25 }}
            animate={{ scale: [0.7, 1.08, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -15, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border bg-neutral-950/90 text-white backdrop-blur-md ${getBorderColor(
              event.type
            )}`}
          >
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-700/80 shrink-0">
              {getEventIcon(event.type)}
            </div>

            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider uppercase font-mono italic">
                {event.title}
              </span>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                {event.player && (
                  <span className={event.team === 'blue' ? 'text-sky-400 font-bold' : 'text-orange-400 font-bold'}>
                    {event.player}
                  </span>
                )}
                {event.speedKmh && (
                  <span className="font-mono text-[11px] text-neutral-400">
                    • {event.speedKmh} KM/H
                  </span>
                )}
                {event.subtitle && <span className="text-neutral-400">{event.subtitle}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
