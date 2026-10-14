import React from 'react';
import { AccoladeEvent, HudThemeStyle } from './types';
import { Trophy, ShieldCheck, Flame, Target, Zap, Award } from 'lucide-react';

export interface MatchEventsHUDProps {
  events: AccoladeEvent[];
  themeStyle?: HudThemeStyle;
  isLight?: boolean;
  positioning?: 'absolute' | 'fixed';
  className?: string;
}

export const MatchEventsHUD: React.FC<MatchEventsHUDProps> = ({
  events = [],
  themeStyle = 'glass',
  isLight = false,
  positioning = 'absolute',
  className = '',
}) => {
  const getEventIcon = (type: AccoladeEvent['type']) => {
    switch (type) {
      case 'goal':
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 'epic-save':
        return <ShieldCheck className="h-5 w-5 text-purple-500" />;
      case 'save':
        return <ShieldCheck className="h-5 w-5 text-sky-500" />;
      case 'demo':
        return <Flame className="h-5 w-5 text-red-500" />;
      case 'shot':
        return <Target className="h-5 w-5 text-emerald-500" />;
      case 'aerial':
        return <Zap className="h-5 w-5 text-indigo-500" />;
      default:
        return <Award className={`h-5 w-5 ${isLight ? 'text-neutral-800' : 'text-white'}`} />;
    }
  };

  const getBorderColor = (type: AccoladeEvent['type']) => {
    switch (type) {
      case 'goal':
        return isLight
          ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
          : 'border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.4)]';
      case 'epic-save':
        return isLight
          ? 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
          : 'border-purple-500/70 shadow-[0_0_25px_rgba(168,85,247,0.4)]';
      case 'demo':
        return isLight
          ? 'border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
          : 'border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.4)]';
      default:
        return isLight ? 'border-neutral-300 shadow-xl' : 'border-neutral-700 shadow-xl';
    }
  };

  const positionClass =
    positioning === 'fixed'
      ? 'fixed top-20 left-1/2 -translate-x-1/2'
      : 'absolute top-16 sm:top-20 left-1/2 -translate-x-1/2';

  return (
    <div
      data-ui-element="hud-match-events"
      className={`${positionClass} flex flex-col items-center gap-2 pointer-events-none z-40 select-none ${className}`}
    >
      {events.map((event) => (
        <div
          key={event.id}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border backdrop-blur-md ${
            isLight ? 'bg-white/95 text-neutral-900 shadow-2xl' : 'bg-neutral-950/90 text-white'
          } ${getBorderColor(event.type)}`}
        >
          <div
            className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-700/80'
            }`}
          >
            {getEventIcon(event.type)}
          </div>

          <div className="flex flex-col">
            <span className="text-base font-black tracking-wider uppercase font-mono italic">
              {event.title}
            </span>
            <div
              className={`flex items-center gap-2 text-xs font-medium ${
                isLight ? 'text-neutral-600' : 'text-neutral-300'
              }`}
            >
              {event.player && (
                <span
                  className={
                    event.team === 'blue'
                      ? isLight ? 'text-sky-600 font-bold' : 'text-sky-400 font-bold'
                      : isLight ? 'text-orange-600 font-bold' : 'text-orange-400 font-bold'
                  }
                >
                  {event.player}
                </span>
              )}
              {event.speedKmh && (
                <span className={`font-mono text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  • {event.speedKmh} KM/H
                </span>
              )}
              {event.subtitle && <span className={isLight ? 'text-neutral-500' : 'text-neutral-400'}>{event.subtitle}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
