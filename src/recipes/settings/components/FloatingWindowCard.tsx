import React from 'react';
import { Plus, Activity } from 'lucide-react';
import { Badge } from '../../../primitives/Badge';

export interface DiagnosticWindowPayload {
  id: string;
  title: string;
  category: string;
  width: number;
  height: number;
}

export interface FloatingWindowCardProps {
  onSpawnDiagnosticWindow?: (window: DiagnosticWindowPayload) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const FloatingWindowCard: React.FC<FloatingWindowCardProps> = ({
  onSpawnDiagnosticWindow,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <div
      onMouseEnter={() => onHover('Spawns an independent floating diagnostic window docked in the top-right tray.')}
      onMouseLeave={onLeave}
      className={`p-4 rounded-xl border flex items-center justify-between ${
        isLight ? 'bg-sky-50/60 border-sky-200' : 'bg-sky-950/20 border-sky-800/60'
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-500" />
          <span className="font-bold text-xs text-sky-600 dark:text-sky-400">
            F10 Diagnostic Floating Window
          </span>
          <Badge variant="primary" size="sm" isLight={isLight}>
            Floating Window
          </Badge>
        </div>
        <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Spawns standalone telemetry overlay. Minimize folds into top-right Stack tray.
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          const titles = [
            'Network Ping & WASM Sub-Tick Diagnostics',
            'Physics Vector & Collision Mesh Profiler',
            'GPU Frame Pacing & Memory Footprint',
            'Ball Angular Velocity & Magnus Vector',
          ];
          const randomTitle = titles[Math.floor(Math.random() * titles.length)];
          onSpawnDiagnosticWindow?.({
            id: `diag-${Date.now()}`,
            title: randomTitle,
            category: 'Diagnostic',
            width: 440,
            height: 260,
          });
          onHover(`Spawned diagnostic window: "${randomTitle}"`);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-xs cursor-pointer transition-colors shrink-0 ml-3"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>Spawn Window</span>
      </button>
    </div>
  );
};
