import React from 'react';
import { NetworkTelemetry, HudThemeStyle } from './types';
import { Wifi, Activity, Cpu } from 'lucide-react';

export interface NetworkDiagnosticsHUDProps extends Partial<NetworkTelemetry> {
  themeStyle?: HudThemeStyle;
  isLight?: boolean;
  className?: string;
}

export const NetworkDiagnosticsHUD: React.FC<NetworkDiagnosticsHUDProps> = ({
  pingMs = 18,
  fps = 120,
  subTickJitterMs = 0.1,
  packetLossPct = 0,
  themeStyle = 'glass',
  isLight = false,
  className = '',
}) => {
  const isHighPing = pingMs > 80;
  const hasPacketLoss = packetLossPct > 0;

  const bgBorderClass = hasPacketLoss
    ? isLight
      ? 'bg-red-50/90 border-red-300 text-red-700 shadow-md backdrop-blur-md'
      : 'bg-red-950/80 border-red-500/80 text-red-200 shadow-md'
    : isHighPing
    ? isLight
      ? 'bg-amber-50/90 border-amber-300 text-amber-800 shadow-md backdrop-blur-md'
      : 'bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-md'
    : isLight
    ? 'bg-white/85 border-neutral-300/80 text-neutral-800 backdrop-blur-md shadow-md'
    : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 backdrop-blur-md shadow-md';

  return (
    <div
      data-ui-element="hud-network-diagnostics"
      className={`select-none pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono transition-colors ${bgBorderClass} ${className}`}
    >
      {/* FPS & Subtick indicator */}
      <div className="flex items-center gap-1">
        <Activity className={`h-3 w-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
        <span className={`font-bold tabular-nums ${isLight ? 'text-neutral-900' : 'text-white'}`}>{fps}</span>
        <span className={`text-[9px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>FPS</span>
      </div>

      <span className={isLight ? 'text-neutral-300' : 'text-neutral-600'}>|</span>

      {/* Ping */}
      <div className="flex items-center gap-1">
        <Wifi className={`h-3 w-3 ${isHighPing ? (isLight ? 'text-amber-600' : 'text-amber-400') : (isLight ? 'text-emerald-600' : 'text-emerald-400')}`} />
        <span className={`font-bold tabular-nums ${isLight ? 'text-neutral-900' : 'text-white'}`}>{pingMs}</span>
        <span className={`text-[9px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>MS</span>
      </div>

      <span className={`hidden sm:inline ${isLight ? 'text-neutral-300' : 'text-neutral-600'}`}>|</span>

      {/* WASM SIMD Subtick Jitter */}
      <div className="hidden sm:flex items-center gap-1">
        <Cpu className={`h-3 w-3 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
        <span className={isLight ? 'text-neutral-500' : 'text-neutral-400'}>JITTER:</span>
        <span className={`font-bold tabular-nums ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>{subTickJitterMs.toFixed(1)}ms</span>
      </div>
    </div>
  );
};
