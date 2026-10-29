import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Activity, Pause, Play, Zap, RotateCcw } from 'lucide-react';
import { PACING_EVENT_FLAGS, PacingSampleInput, PacingRingBuffer } from './pacingRingBuffer';

export { PACING_EVENT_FLAGS, PacingRingBuffer };
export type { PacingSampleInput };

const DASH_3_3 = [3, 3];
const DASH_4_3 = [4, 3];
const DASH_2_2 = [2, 2];
const DASH_EMPTY: number[] = [];

interface OscilloscopeRenderCache {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  cssW: number;
  cssH: number;
  isLight: boolean;
}

export interface PacingOscilloscopeHandle {
  /** Push a single 120Hz pacing frame into the pre-allocated ring buffer with zero React re-renders */
  pushSample: (sample: PacingSampleInput) => void;
  /** Access underlying zero-allocation ring buffer */
  getRingBuffer: () => PacingRingBuffer;
}

export interface PacingOscilloscopeChartProps {
  /** Optional external pre-allocated PacingRingBuffer for 120Hz zero-React-rerender streaming */
  ringBuffer?: PacingRingBuffer;
  /** Height of the 3-pane oscilloscope canvas in px (default: 240) */
  height?: number;
  /** Deadband corridor offsets around target buffer in ticks (default: [-2, 2]) */
  deadbandOffsets?: [number, number];
  /** Optional counterfactual What-If overlay trajectory */
  whatIfOverlay?: {
    simBuffer: ArrayLike<number>;
    simRateHz: ArrayLike<number>;
    targetBuffer?: number;
  } | null;
  /** Whether to run built-in 120Hz self-simulation when no external caller pushes samples */
  autoSimulate?: boolean;
  /** Whether to show the top title & EWMA/Buf/Rate header bar (default: true) */
  showHeader?: boolean;
  /** Whether to show the developer Inject Starvation + Resync button (default: true) */
  showInjectStarvation?: boolean;
  /** Whether to draw inside-pane text labels on the left of each sub-pane (default: true) */
  showPaneLabels?: boolean;
  /** Controlled freeze state (optional) */
  isFrozen?: boolean;
  /** Default freeze state when uncontrolled (default: false) */
  defaultIsFrozen?: boolean;
  /** Callback when freeze state is toggled */
  onFreezeToggle?: (frozen: boolean) => void;
  /** Callback when buffer is cleared */
  onClear?: () => void;
  /** Layout variant: 'card' renders standalone card chrome, 'embedded' renders borderless for floating windows */
  variant?: 'card' | 'embedded';
  isLight?: boolean;
  className?: string;
}

/**
 * PacingOscilloscopeChart
 * 3-Pane Synchronized 120Hz Network Clock-Pacing & Buffer Deadband Oscilloscope:
 * - Pre-allocated `PacingRingBuffer` (`Float32Array` + `Uint8Array`) with O(1) circular indexing.
 * - Cached `CanvasRenderingContext2D`, static dash arrays, and ResizeObserver width caching.
 * - Zero React re-renders on mousemove crosshair or 120Hz sample pushes.
 */
export const PacingOscilloscopeChart = React.memo(
  forwardRef<PacingOscilloscopeHandle, PacingOscilloscopeChartProps>(
    (
      {
        ringBuffer: externalBuffer,
        height = 240,
        deadbandOffsets = [-2, 2],
        whatIfOverlay = null,
        autoSimulate = true,
        showHeader = true,
        showInjectStarvation = true,
        showPaneLabels = true,
        isFrozen: controlledIsFrozen,
        defaultIsFrozen = false,
        onFreezeToggle,
        onClear,
        variant = 'card',
        isLight = true,
        className = '',
      },
      ref
    ) => {
      const internalBufferRef = useRef<PacingRingBuffer | null>(null);
      if (!internalBufferRef.current) {
        const buf = new PacingRingBuffer(360);
        let rtt = 26;
        let eff = 3.0;
        for (let i = 0; i < 240; i++) {
          const spike = i === 110 || i === 111 ? 28 : 0;
          rtt = 26 + Math.sin(i * 0.08) * 3.5 + (Math.random() - 0.5) * 2.2 + spike;
          const tgt = 3.0;
          const srv = spike > 0 ? -0.5 : 3.0 + Math.sin(i * 0.06) * 1.1;
          eff = eff * 0.82 + srv * 0.18;
          const err = eff - tgt;
          const rate = Math.max(115, Math.min(125, 120 - err * 0.85));
          const flags =
            srv < 0
              ? PACING_EVENT_FLAGS.STARVATION
              : spike > 0
              ? PACING_EVENT_FLAGS.JITTER_SPIKE
              : 0;
          buf.push({
            rawRttMs: rtt,
            serverBuffer: srv,
            effectiveBuffer: eff,
            targetBuffer: tgt,
            physicsRateHz: rate,
            eventFlags: flags,
          });
        }
        internalBufferRef.current = buf;
      }

      const activeBuffer = externalBuffer ?? internalBufferRef.current;

      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      const renderCacheRef = useRef<OscilloscopeRenderCache>({
        canvas: null,
        ctx: null,
        cssW: 520,
        cssH: height,
        isLight: false,
      });

      const rttBadgeRef = useRef<HTMLSpanElement | null>(null);
      const bufBadgeRef = useRef<HTMLSpanElement | null>(null);
      const rateBadgeRef = useRef<HTMLSpanElement | null>(null);

      const [internalIsFrozen, setInternalIsFrozen] = useState(defaultIsFrozen);
      const isFrozen = controlledIsFrozen ?? internalIsFrozen;
      const isFrozenRef = useRef(isFrozen);
      isFrozenRef.current = isFrozen;
      const hoverIndexRef = useRef<number | null>(null);

      const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const cache = renderCacheRef.current;
        if (cache.canvas !== canvas || !cache.ctx) {
          cache.canvas = canvas;
          cache.ctx = canvas.getContext('2d');
        }
        const ctx = cache.ctx;
        if (!ctx) return;

        const cssW = cache.cssW || 520;
        const cssH = height;
        if (canvas.width !== cssW || canvas.height !== cssH) {
          canvas.width = cssW;
          canvas.height = cssH;
        }

        ctx.clearRect(0, 0, cssW, cssH);
        ctx.fillStyle = isLight ? '#f8fafc' : '#090d16';
        ctx.fillRect(0, 0, cssW, cssH);

        const count = activeBuffer.count;
        const padX = 8;
        const plotW = Math.max(20, cssW - padX * 2);
        const gapY = 4;
        const h1 = Math.floor((cssH - gapY * 2) * 0.27);
        const h2 = Math.floor((cssH - gapY * 2) * 0.45);
        const h3 = cssH - h1 - h2 - gapY * 2;
        const y1 = 0;
        const y2 = h1 + gapY;
        const y3 = y2 + h2 + gapY;

        ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.10)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y2 - gapY * 0.5);
        ctx.lineTo(cssW, y2 - gapY * 0.5);
        ctx.moveTo(0, y3 - gapY * 0.5);
        ctx.lineTo(cssW, y3 - gapY * 0.5);
        ctx.stroke();

        ctx.font = '600 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
        if (count < 2) return;

        const xAt = (i: number) => padX + (i / Math.max(1, count - 1)) * plotW;

        // ================= PANE 1: RTT & EWMA =================
        let maxRtt = 45;
        let minRtt = Infinity;
        for (let i = 0; i < count; i++) {
          const pIdx = activeBuffer.physicalIndex(i);
          const v = activeBuffer.rawRttMs[pIdx];
          if (v > maxRtt) maxRtt = v;
          if (v < minRtt) minRtt = v;
        }
        if (!Number.isFinite(minRtt)) minRtt = 0;
        const rttFloor = Math.max(0, Math.floor(minRtt * 0.8));
        const rttCeil = Math.max(rttFloor + 20, Math.ceil(maxRtt * 1.15));
        const yRtt = (v: number) =>
          y1 +
          h1 -
          4 -
          ((Math.max(rttFloor, Math.min(rttCeil, v)) - rttFloor) / (rttCeil - rttFloor)) * (h1 - 16);

        ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const pIdx = activeBuffer.physicalIndex(i);
          const x = xAt(i);
          const y = yRtt(activeBuffer.rawRttMs[pIdx]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const pIdx = activeBuffer.physicalIndex(i);
          const x = xAt(i);
          const y = yRtt(activeBuffer.smoothRttMs[pIdx]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const newestPhysIdx = activeBuffer.physicalIndex(count - 1);
        const inspectIdx =
          hoverIndexRef.current !== null && hoverIndexRef.current < count
            ? activeBuffer.physicalIndex(hoverIndexRef.current)
            : newestPhysIdx;

        const curRtt = activeBuffer.rawRttMs[inspectIdx];
        const curSmoothRtt = activeBuffer.smoothRttMs[inspectIdx];
        if (showPaneLabels) {
          ctx.fillStyle = isLight ? '#0369a1' : '#38bdf8';
          ctx.fillText(
            `PANE 1 · RTT: ${curRtt.toFixed(1)}ms (EWMA ${curSmoothRtt.toFixed(1)}ms)`,
            padX + 4,
            y1 + 11
          );
        }

        // ================= PANE 2: INPUT BUFFER DEPTH & DEADBAND =================
        const bufMin = -4;
        const bufMax = 10;
        const yBuf = (v: number) =>
          y2 +
          h2 -
          5 -
          ((Math.max(bufMin, Math.min(bufMax, v)) - bufMin) / (bufMax - bufMin)) * (h2 - 18);

        const yZero = yBuf(0);
        const yBottom2 = y2 + h2 - 2;
        if (yBottom2 > yZero) {
          ctx.fillStyle = isLight ? 'rgba(244, 63, 94, 0.10)' : 'rgba(244, 63, 94, 0.14)';
          ctx.fillRect(padX, yZero, plotW, yBottom2 - yZero);
        }
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
        ctx.setLineDash(DASH_3_3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, yZero);
        ctx.lineTo(padX + plotW, yZero);
        ctx.stroke();
        ctx.setLineDash(DASH_EMPTY);

        const activeTgt = whatIfOverlay?.targetBuffer ?? activeBuffer.targetBuffer[inspectIdx] ?? 3;
        const dbLow = activeTgt + (deadbandOffsets[0] ?? -2);
        const dbHigh = activeTgt + (deadbandOffsets[1] ?? 2);
        const yDbHigh = yBuf(dbHigh);
        const yDbLow = yBuf(dbLow);
        ctx.fillStyle = isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.11)';
        ctx.fillRect(padX, yDbHigh, plotW, Math.max(2, yDbLow - yDbHigh));

        const yTgt = yBuf(activeTgt);
        ctx.strokeStyle = isLight ? 'rgba(5, 150, 105, 0.7)' : 'rgba(16, 185, 129, 0.7)';
        ctx.setLineDash(DASH_4_3);
        ctx.beginPath();
        ctx.moveTo(padX, yTgt);
        ctx.lineTo(padX + plotW, yTgt);
        ctx.stroke();
        ctx.setLineDash(DASH_EMPTY);

        for (let i = 0; i < count; i++) {
          const pIdx = activeBuffer.physicalIndex(i);
          const f = activeBuffer.eventFlags[pIdx];
          if (!f) continue;
          const x = xAt(i);
          if (f & PACING_EVENT_FLAGS.STARVATION) {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.75)';
            ctx.fillRect(x - 1, yZero - 6, 2, 8);
          }
          if (f & PACING_EVENT_FLAGS.HARD_RESYNC) {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x - 1.5, y2 + 14, 3, h2 - 18);
          }
        }

        ctx.strokeStyle = isLight ? 'rgba(217, 119, 6, 0.8)' : 'rgba(251, 191, 36, 0.8)';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const pIdx = activeBuffer.physicalIndex(i);
          const x = xAt(i);
          const y = yBuf(activeBuffer.serverBuffer[pIdx]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = isLight ? '#059669' : '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const pIdx = activeBuffer.physicalIndex(i);
          const x = xAt(i);
          const y = yBuf(activeBuffer.effectiveBuffer[pIdx]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (whatIfOverlay && whatIfOverlay.simBuffer.length > 1) {
          const simLen = whatIfOverlay.simBuffer.length;
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          for (let i = 0; i < simLen; i++) {
            const x = padX + (i / Math.max(1, simLen - 1)) * plotW;
            const y = yBuf(whatIfOverlay.simBuffer[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        const curBuf = activeBuffer.serverBuffer[inspectIdx];
        if (showPaneLabels) {
          ctx.fillStyle = curBuf < 0 ? '#f43f5e' : isLight ? '#047857' : '#34d399';
          ctx.fillText(
            `PANE 2 · BUFFER: ${curBuf.toFixed(1)}t | Deadband [${dbLow.toFixed(0)}..${dbHigh.toFixed(
              0
            )}t]`,
            padX + 4,
            y2 + 11
          );
        }

        // ================= PANE 3: CLIENT PHYSICS RATE (HZ) =================
        const rateMin = 114;
        const rateMax = 126;
        const yRate = (v: number) =>
          y3 +
          h3 -
          4 -
          ((Math.max(rateMin, Math.min(rateMax, v)) - rateMin) / (rateMax - rateMin)) * (h3 - 15);

        const y120 = yRate(120);
        ctx.strokeStyle = isLight ? 'rgba(100, 116, 139, 0.35)' : 'rgba(148, 163, 184, 0.35)';
        ctx.setLineDash(DASH_3_3);
        ctx.beginPath();
        ctx.moveTo(padX, y120);
        ctx.lineTo(padX + plotW, y120);
        ctx.stroke();
        ctx.setLineDash(DASH_EMPTY);

        ctx.strokeStyle = isLight ? '#d97706' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const pIdx = activeBuffer.physicalIndex(i);
          const x = xAt(i);
          const y = yRate(activeBuffer.physicsRateHz[pIdx]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const curRate = activeBuffer.physicsRateHz[inspectIdx];
        if (showPaneLabels) {
          ctx.fillStyle = isLight ? '#b45309' : '#fbbf24';
          ctx.fillText(
            `PANE 3 · CLOCK PACING: ${curRate.toFixed(2)} Hz (Nominal 120.00 Hz)`,
            padX + 4,
            y3 + 11
          );
        }

        if (hoverIndexRef.current !== null && hoverIndexRef.current < count) {
          const hx = xAt(hoverIndexRef.current);
          ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1;
          ctx.setLineDash(DASH_2_2);
          ctx.beginPath();
          ctx.moveTo(hx, 0);
          ctx.lineTo(hx, cssH);
          ctx.stroke();
          ctx.setLineDash(DASH_EMPTY);
        }
      }, [activeBuffer, height, deadbandOffsets, whatIfOverlay, showPaneLabels, isLight]);

      const updateHeaderBadges = useCallback(() => {
        const count = activeBuffer.count;
        if (count === 0) return;
        const pIdx = activeBuffer.physicalIndex(count - 1);
        if (rttBadgeRef.current) {
          rttBadgeRef.current.textContent = `${activeBuffer.smoothRttMs[pIdx].toFixed(1)} ms`;
        }
        if (bufBadgeRef.current) {
          bufBadgeRef.current.textContent = `${activeBuffer.effectiveBuffer[pIdx].toFixed(1)} ticks`;
        }
        if (rateBadgeRef.current) {
          rateBadgeRef.current.textContent = `${activeBuffer.physicsRateHz[pIdx].toFixed(1)} Hz`;
        }
      }, [activeBuffer]);

      useImperativeHandle(
        ref,
        () => ({
          pushSample: (sample: PacingSampleInput) => {
            activeBuffer.push(sample);
          },
          getRingBuffer: () => activeBuffer,
        }),
        [activeBuffer]
      );

      // Observe canvas width via ResizeObserver so drawCanvas never forces synchronous layout read
      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || typeof ResizeObserver === 'undefined') return;
        renderCacheRef.current.cssW = canvas.clientWidth || 520;
        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const w = Math.max(200, Math.floor(entry.contentRect.width));
            if (renderCacheRef.current.cssW !== w) {
              renderCacheRef.current.cssW = w;
              drawCanvas();
            }
          }
        });
        ro.observe(canvas);
        return () => ro.disconnect();
      }, [drawCanvas]);

      // Subscribe to ring buffer updates with coalesced rAF (0 React re-renders)
      useEffect(() => {
        let tickCounter = 0;
        let rafId = 0;
        let scheduled = false;

        const flush = () => {
          scheduled = false;
          if (isFrozenRef.current) return;
          drawCanvas();
          tickCounter++;
          if (tickCounter % 6 === 0) {
            updateHeaderBadges();
          }
        };

        const unsub = activeBuffer.subscribe(() => {
          if (!scheduled && !isFrozenRef.current) {
            scheduled = true;
            rafId = requestAnimationFrame(flush);
          }
        });

        return () => {
          unsub();
          if (scheduled) cancelAnimationFrame(rafId);
        };
      }, [activeBuffer, drawCanvas, updateHeaderBadges]);

      useEffect(() => {
        drawCanvas();
        updateHeaderBadges();
      }, [drawCanvas, updateHeaderBadges]);

      useEffect(() => {
        if (!autoSimulate || externalBuffer) return;
        let phase = 0;
        const timer = window.setInterval(() => {
          if (isFrozenRef.current) return;
          phase += 0.12;
          const rawRtt = 25 + Math.sin(phase) * 3.8 + (Math.random() - 0.5) * 2.5;
          const tgt = 3.0;
          const srv = 3.0 + Math.cos(phase * 0.7) * 1.1 + (Math.random() - 0.5) * 0.4;
          const eff = srv * 0.9 + 0.3;
          const rate = 120 - (eff - tgt) * 0.75;
          activeBuffer.push({
            rawRttMs: rawRtt,
            serverBuffer: srv,
            effectiveBuffer: eff,
            targetBuffer: tgt,
            physicsRateHz: rate,
            eventFlags: 0,
          });
        }, 33);
        return () => window.clearInterval(timer);
      }, [autoSimulate, externalBuffer, activeBuffer]);

      const handleInjectStarvationBurst = () => {
        for (let i = 0; i < 12; i++) {
          const isResync = i === 11;
          activeBuffer.push({
            rawRttMs: 74 + Math.random() * 18,
            serverBuffer: -1.8 + i * 0.25,
            effectiveBuffer: -1.2 + i * 0.2,
            targetBuffer: 3.0,
            physicsRateHz: 124.2,
            eventFlags: isResync
              ? PACING_EVENT_FLAGS.HARD_RESYNC
              : PACING_EVENT_FLAGS.STARVATION,
          });
        }
        drawCanvas();
        updateHeaderBadges();
      };

      const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const cssW = renderCacheRef.current.cssW || 520;
        const padX = 8;
        const plotW = Math.max(20, cssW - padX * 2);
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left - padX) / plotW));
        const idx = Math.round(ratio * Math.max(0, activeBuffer.count - 1));
        if (hoverIndexRef.current !== idx) {
          hoverIndexRef.current = idx;
          drawCanvas();
        }
      };

      const handleMouseLeave = () => {
        if (hoverIndexRef.current !== null) {
          hoverIndexRef.current = null;
          drawCanvas();
        }
      };

      const handleToggleFreeze = () => {
        const next = !isFrozen;
        if (controlledIsFrozen === undefined) {
          setInternalIsFrozen(next);
        }
        onFreezeToggle?.(next);
      };

      const handleClearBuffer = () => {
        if (onClear) {
          onClear();
        } else {
          activeBuffer.clear();
        }
        drawCanvas();
        updateHeaderBadges();
      };

      const isEmbedded = variant === 'embedded';

      return (
        <div
          data-ui-element="chart-pacing-oscilloscope"
          className={`flex flex-col ${
            isEmbedded
              ? `gap-2 p-2.5 rounded-xl border ${
                  isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/75 border-neutral-800'
                }`
              : `gap-2.5 p-4 rounded-2xl border ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                    : 'bg-neutral-900/90 border-neutral-800 text-neutral-100 shadow-lg'
                }`
          } select-none ${className}`}
        >
          {showHeader && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-xs tracking-tight">
                  3-Pane Network Clock-Pacing & Buffer Deadband Oscilloscope
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  Float32 RingBuffer · 0 VDOM Diff
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-sky-500 font-semibold">
                  EWMA: <b ref={rttBadgeRef}>26.0 ms</b>
                </span>
                <span className="opacity-30">|</span>
                <span className="text-emerald-500 font-semibold">
                  Buf: <b ref={bufBadgeRef}>3.0 ticks</b>
                </span>
                <span className="opacity-30">|</span>
                <span className="text-amber-500 font-semibold">
                  Rate: <b ref={rateBadgeRef}>120.0 Hz</b>
                </span>
              </div>
            </div>
          )}

          <div
            className={`relative ${
              isEmbedded ? 'rounded-lg' : 'rounded-xl'
            } overflow-hidden border ${
              isLight ? 'border-neutral-300' : 'border-neutral-800'
            }`}
            style={{ height: `${height}px` }}
          >
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="block w-full h-full cursor-crosshair"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
            <div className="flex items-center gap-3 font-mono text-[10px] opacity-80">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />{' '}
                {isEmbedded ? 'RTT' : 'RTT / EWMA'}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />{' '}
                {isEmbedded ? 'Lead Buffer' : 'Eff. Buffer & Deadband'}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />{' '}
                {isEmbedded ? 'Physics Rate' : 'Clock Rate (Hz)'}
              </span>
              {!isEmbedded && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-rose-500/60 inline-block" /> Starvation (&lt;0t)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              {showInjectStarvation && (
                <button
                  type="button"
                  onClick={handleInjectStarvationBurst}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                    isLight
                      ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                      : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <Zap className="h-3 w-3" />
                  <span>Inject Starvation + Resync</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleFreeze}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                  isFrozen
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                    : isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                {isFrozen ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                <span>{isFrozen ? 'Resume' : 'Freeze'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearBuffer}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
                title="Clear / Reset Oscilloscope RingBuffer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  )
);

PacingOscilloscopeChart.displayName = 'PacingOscilloscopeChart';
