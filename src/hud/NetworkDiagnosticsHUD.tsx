import React from 'react';
import { NetworkTelemetry, HudThemeStyle } from './types';
import { Wifi, Activity, Cpu } from 'lucide-react';

export interface NetworkDiagnosticsHUDProps extends Partial<NetworkTelemetry> {
  themeStyle?: HudThemeStyle;
  className?: string;
}

export const NetworkDiagnosticsHUD: React.FC<NetworkDiagnosticsHUDProps> = ({
  pingMs = 18,
  fps = 120,
  subTickJitterMs = 0.1,
  packetLossPct = 0,
  themeStyle = 'glass',
  className = '',
}) => {
  const isHighPing = pingMs > 80;
  const hasPacketLoss = packetLossPct > 0;

  return (
    <div
      data-ui-element="hud-network-diagnostics"
      className={`select-none pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono transition-colors ${
        hasPacketLoss
          ? 'bg-red-950/80 border-red-500/80 text-red-200'
          : isHighPing
          ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
          : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 backdrop-blur-md shadow-md'
      } ${className}`}
    >
      {/* FPS & Subtick indicator */}
      <div className="flex items-center gap-1">
        <Activity className="h-3 w-3 text-emerald-400" />
        <span className="font-bold text-white tabular-nums">{fps}</span>
        <span className="text-[9px] text-neutral-500">FPS</span>
      </div>

      <span className="text-neutral-600">|</span>

      {/* Ping */}
      <div className="flex items-center gap-1">
        <Wifi className={`h-3 w-3 ${isHighPing ? 'text-amber-400' : 'text-emerald-400'}`} />
        <span className="font-bold text-white tabular-nums">{pingMs}</span>
        <span className="text-[9px] text-neutral-500">MS</span>
      </div>

      <span className="text-neutral-600 hidden sm:inline">|</span>

      {/* WASM SIMD Subtick Jitter */}
      <div className="hidden sm:flex items-center gap-1">
        <Cpu className="h-3 w-3 text-sky-400" />
        <span className="text-neutral-400">JITTER:</span>
        <span className="font-bold text-neutral-200 tabular-nums">{subTickJitterMs.toFixed(1)}ms</span>
      </div>
    </div>
  );
};
