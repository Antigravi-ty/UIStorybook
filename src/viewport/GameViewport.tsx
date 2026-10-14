import React, { useRef } from 'react';
import { useViewportStore, viewportStore } from './viewportStore';
import { SafeAreaHud } from './SafeAreaHud';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export interface GameViewportProps {
  children: React.ReactNode;
  isLight?: boolean;
  className?: string;
}

export const GameViewport: React.FC<GameViewportProps> = ({
  children,
  isLight = false,
  className = '',
}) => {
  const { metrics, portraitDismissed } = useViewportStore();
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <div
      id="game-ui-viewport-host"
      className={`relative w-full h-full select-none overflow-hidden flex items-center justify-center transition-all ${className}`}
      style={{
        paddingLeft: metrics.isPillarboxed ? `${metrics.pillarboxWidth}px` : undefined,
        paddingRight: metrics.isPillarboxed ? `${metrics.pillarboxWidth}px` : undefined,
      }}
    >
      {/* 18:9 Clamped Active Canvas Box */}
      <div
        ref={viewportRef}
        id="game-root"
        className="relative w-full h-full max-w-[var(--ui-render-width)] max-h-[var(--ui-render-height)] flex items-center justify-center overflow-hidden"
      >
        {/* Safe Area HUD Overlay if enabled */}
        <SafeAreaHud isLight={isLight} />

        {/* Dynamic UI Content */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
          {children}
        </div>

        {/* 1:1 Portrait Gate (SimpleUI standard warning) */}
        {metrics.isPortrait && !portraitDismissed && (
          <div className="absolute inset-0 z-[999] pointer-events-auto bg-neutral-950/95 flex flex-col items-center justify-center p-8 text-center text-white backdrop-blur-md">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Display Warning (1:1 Ratio Limit)</h2>
            <p className="max-w-md text-sm text-neutral-400 leading-relaxed mb-6">
              RocketSim & SimpleUI canvas are optimized for landscape displays between 1:1 and 18:9 aspect ratios. Portrait layouts (taller than wide) may degrade layout ergonomics.
            </p>
            <button
              type="button"
              onClick={() => viewportStore.dismissPortraitGate()}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 px-5 py-2.5 text-sm font-medium text-neutral-200 border border-neutral-700 transition cursor-pointer"
            >
              <span>Proceed Anyway</span>
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
