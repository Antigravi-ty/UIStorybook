import React from 'react';

export interface KickoffCountdownHUDProps {
  countdown: number; // 3, 2, 1, 0 (0 = GO!), or negative when hidden
  active?: boolean;
  positioning?: 'absolute' | 'fixed';
  className?: string;
}

export const KickoffCountdownHUD: React.FC<KickoffCountdownHUDProps> = ({
  countdown,
  active = true,
  positioning = 'absolute',
  className = '',
}) => {
  if (!active || countdown < 0 || countdown > 3) return null;

  const isGo = countdown === 0;
  const positionClass = positioning === 'fixed' ? 'fixed inset-0' : 'absolute inset-0';

  return (
    <div
      data-ui-element="hud-kickoff-countdown"
      className={`${positionClass} pointer-events-none flex items-center justify-center select-none z-50 ${className}`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Shockwave halo */}
        <div
          className={`absolute -inset-10 rounded-full blur-2xl opacity-40 ${
            isGo ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />

        {isGo ? (
          <div className="relative flex flex-col items-center">
            <span className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 via-green-400 to-emerald-600 drop-shadow-[0_10px_35px_rgba(16,185,129,0.85)]">
              GO!
            </span>
            <span className="mt-2 text-xs md:text-sm font-mono font-bold uppercase tracking-widest text-emerald-200 bg-emerald-950/80 px-4 py-1 rounded-full border border-emerald-500/40 shadow-lg">
              KICKOFF COMMENCED
            </span>
          </div>
        ) : (
          <div className="relative flex flex-col items-center">
            <span className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_10px_35px_rgba(245,158,11,0.7)] font-mono">
              {countdown}
            </span>
            <span className="mt-2 text-xs md:text-sm font-mono font-bold uppercase tracking-widest text-neutral-200 bg-neutral-900/80 px-4 py-1 rounded-full border border-neutral-700 shadow-lg">
              GET READY
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
