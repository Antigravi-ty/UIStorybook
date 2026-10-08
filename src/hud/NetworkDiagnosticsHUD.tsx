import React from 'react';
import { Wifi, Activity, Cpu, AlertTriangle } from 'lucide-react';

export interface NetworkDiagnosticsHUDProps {
  pingMs?: number;
  fps?: number;
  subTickJitterMs?: number;
  packetLossPct?: number;
  isLight?: boolean;
  className?: string;
}

/**
 * [HUD Primitive] NetworkDiagnosticsHUD
 * Top-right heads-up network telemetry pill.
 * Real-time indicators for WASM sub-tick jitter, simulation FPS, ping latency, and packet loss.
 * Adapts seamlessly across Light and Dark surfaces with high-legibility strokes.
 */
export const NetworkDiagnosticsHUD: React.FC<NetworkDiagnosticsHUDProps> = ({
  pingMs = 18,
  fps = 120,
  subTickJitterMs = 0.1,
  packetLossPct = 0,
  isLight = false,
  className = '',
}) => {
  const isHighPing = pingMs > 80;
  const hasPacketLoss = packetLossPct > 0;

  return (
    <div
      data-ui-element="hud-network-diagnostics"
      data-hud-component="network-diagnostics"
      className={`select-none pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border text-[11px] font-mono transition-all backdrop-blur-md shadow-lg ${
        hasPacketLoss
          ? isLight
            ? 'bg-red-500/15 border-red-500/50 text-red-950 shadow-red-500/20'
            : 'bg-red-950/80 border-red-500/80 text-red-200 shadow-red-900/40'
          : isHighPing
          ? isLight
            ? 'bg-amber-500/15 border-amber-500/50 text-amber-950 shadow-amber-500/20'
            : 'bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-amber-900/40'
          : isLight
          ? 'bg-white/85 border-neutral-300/80 text-neutral-800 shadow-neutral-300/20'
          : 'bg-neutral-950/80 border-white/15 text-neutral-200 shadow-black/60'
      } ${className}`}
      title={`Network Telemetry: ${fps} FPS | ${pingMs}ms Ping | Jitter ${subTickJitterMs.toFixed(1)}ms`}
    >
      {/* FPS & Simulation Loop */}
      <div className="flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-emerald-500" />
        <span
          className={`font-black tabular-nums ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}
        >
          {fps}
        </span>
        <span className="text-[9px] font-semibold opacity-60">FPS</span>
      </div>

      <span className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>|</span>

      {/* Ping Latency */}
      <div className="flex items-center gap-1.5">
        {hasPacketLoss ? (
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 animate-pulse" />
        ) : (
          <Wifi
            className={`h-3.5 w-3.5 ${
              isHighPing ? 'text-amber-500' : 'text-emerald-500'
            }`}
          />
        )}
        <span
          className={`font-black tabular-nums ${
            hasPacketLoss
              ? 'text-red-500'
              : isHighPing
              ? 'text-amber-500'
              : isLight
              ? 'text-neutral-900'
              : 'text-white'
          }`}
        >
          {pingMs}
        </span>
        <span className="text-[9px] font-semibold opacity-60">MS</span>
      </div>

      <span className={`hidden sm:inline ${isLight ? 'text-neutral-300' : 'text-neutral-700'}`}>
        |
      </span>

      {/* WASM SIMD Subtick Jitter */}
      <div className="hidden sm:flex items-center gap-1.5">
        <Cpu className="h-3.5 w-3.5 text-sky-500" />
        <span className="text-[9px] opacity-60">JITTER</span>
        <span
          className={`font-black tabular-nums ${
            isLight ? 'text-neutral-900' : 'text-neutral-200'
          }`}
        >
          {subTickJitterMs.toFixed(1)}ms
        </span>
      </div>
    </div>
  );
};
