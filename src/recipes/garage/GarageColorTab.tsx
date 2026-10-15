import React from 'react';
import { Badge } from '../../primitives/Badge';
import { BLUE_TEAM_COLOURS, ORANGE_TEAM_COLOURS } from './garageConstants';

export interface GarageColorTabProps {
  blueOrder: string[];
  orangeOrder: string[];
  isLight?: boolean;
}

export const GarageColorTab: React.FC<GarageColorTabProps> = ({
  blueOrder,
  orangeOrder,
  isLight = false,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
        isLight ? 'bg-amber-50/70 border-amber-200/80 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
      }`}>
        <strong>Colour Preference Order: </strong>
        Each team (up to 3v3) maintains an ordered preference ranking (1st → 2nd → 3rd). If your primary color is already selected by a teammate, the engine automatically falls back to your next preset.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blue Team Order */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-blue-500 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Blue Team Order
            </span>
            <span className="text-[10px] font-mono opacity-70">Primary #1</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {blueOrder.map((cId, idx) => {
              const c = BLUE_TEAM_COLOURS.find((item) => item.id === cId)!;
              return (
                <div
                  key={c.id}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${
                    isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-neutral-400">#{idx + 1}</span>
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <Badge size="sm" variant={idx === 0 ? 'primary' : 'neutral'} isLight={isLight}>
                    {idx === 0 ? 'Primary' : `Fallback ${idx}`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orange Team Order */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-orange-500 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Orange Team Order
            </span>
            <span className="text-[10px] font-mono opacity-70">Primary #1</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {orangeOrder.map((cId, idx) => {
              const c = ORANGE_TEAM_COLOURS.find((item) => item.id === cId)!;
              return (
                <div
                  key={c.id}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${
                    isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-neutral-400">#{idx + 1}</span>
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <Badge size="sm" variant={idx === 0 ? 'warning' : 'neutral'} isLight={isLight}>
                    {idx === 0 ? 'Primary' : `Fallback ${idx}`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
