import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, X, Activity, Cpu, Target, Sliders, Maximize2 } from 'lucide-react';
import { useFloatingStore, FloatingWindowItem } from '../tokens/floatingStore';
import { UI_EASING } from '../tokens/easing';
import { Badge } from '../primitives/Badge';

export interface FloatingWindowManagerProps {
  isLight?: boolean;
  /** Canvas bounds container ref for clamping and relative positioning */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const FloatingWindowManager: React.FC<FloatingWindowManagerProps> = ({
  isLight = false,
  containerRef,
}) => {
  const { windows, windowOrder, bringToFront, minimizeWindow, closeWindow, updatePosition, updateSize } =
    useFloatingStore();
  const visibleWindows = windows.filter((w) => !w.isMinimized);

  if (visibleWindows.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {visibleWindows.map((win) => {
          const zIndex = 10 + Math.max(0, windowOrder.indexOf(win.id));
          return (
            <FloatingWindowInstance
              key={win.id}
              item={win}
              isLight={isLight}
              zIndex={zIndex}
              containerRef={containerRef}
              onFocus={() => bringToFront(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              onUpdatePosition={(pos) => updatePosition(win.id, pos)}
              onUpdateSize={(size) => updateSize(win.id, size)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface FloatingWindowInstanceProps {
  item: FloatingWindowItem;
  isLight?: boolean;
  zIndex: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onFocus: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onUpdatePosition: (pos: { x: number; y: number }) => void;
  onUpdateSize: (size: { width: number; height: number }) => void;
}

const FloatingWindowInstance: React.FC<FloatingWindowInstanceProps> = ({
  item,
  isLight = false,
  zIndex,
  containerRef,
  onFocus,
  onMinimize,
  onClose,
  onUpdatePosition,
  onUpdateSize,
}) => {
  // Current local position and dimensions
  const [pos, setPos] = useState({
    x: item.position?.x ?? 40,
    y: item.position?.y ?? 40,
  });
  const [size, setSize] = useState({
    width: item.width ?? 440,
    height: item.height ?? 300,
  });

  // Minimization sequenced state machine
  // 'idle' -> 'fading_content' -> 'resizing_to_stack' -> calls onMinimize()
  const [minimizePhase, setMinimizePhase] = useState<'idle' | 'fading_content' | 'resizing_to_stack'>('idle');

  // Direct follow mouse state (zero animation duration when actively dragging or resizing)
  const [isInteracting, setIsInteracting] = useState(false);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  // Resizing state
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, startWidth: 0, startHeight: 0 });

  // Sync external props if updated
  useEffect(() => {
    if (item.position) {
      setPos(item.position);
    }
  }, [item.position]);

  useEffect(() => {
    if (item.width && item.height) {
      setSize({ width: item.width, height: item.height });
    }
  }, [item.width, item.height]);

  // Handle Dragging by Titlebar
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    onFocus();
    isDraggingRef.current = true;
    setIsInteracting(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = ev.clientX - dragStartRef.current.mouseX;
      const deltaY = ev.clientY - dragStartRef.current.mouseY;

      let newX = Math.max(10, dragStartRef.current.startX + deltaX);
      let newY = Math.max(10, dragStartRef.current.startY + deltaY);

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        newX = Math.min(newX, Math.max(20, rect.width - 120));
        newY = Math.min(newY, Math.max(20, rect.height - 60));
      }

      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsInteracting(false);
        setPos((latestPos) => {
          onUpdatePosition(latestPos);
          return latestPos;
        });
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Resizing by Bottom-Right Corner Handle (Strictly zero latency)
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus();
    isResizingRef.current = true;
    setIsInteracting(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };

    const handleResizeMove = (ev: MouseEvent) => {
      if (!isResizingRef.current) return;
      const deltaW = ev.clientX - resizeStartRef.current.mouseX;
      const deltaH = ev.clientY - resizeStartRef.current.mouseY;

      let nextWidth = Math.max(280, resizeStartRef.current.startWidth + deltaW);
      let nextHeight = Math.max(160, resizeStartRef.current.startHeight + deltaH);

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        nextWidth = Math.min(nextWidth, rect.width - pos.x - 10);
        nextHeight = Math.min(nextHeight, rect.height - pos.y - 10);
      }

      setSize({ width: nextWidth, height: nextHeight });
    };

    const handleResizeUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        setIsInteracting(false);
        setSize((latestSize) => {
          onUpdateSize(latestSize);
          return latestSize;
        });
      }
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeUp);
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeUp);
  };

  // Trigger Sequenced Step Minimization
  const handleTriggerMinimize = () => {
    if (minimizePhase !== 'idle') return;
    // Step 1: Content vanishes (100ms)
    setMinimizePhase('fading_content');
    setTimeout(() => {
      // Step 2: Container resizes & travels to stack icon (240ms)
      setMinimizePhase('resizing_to_stack');
      setTimeout(() => {
        // Step 3: Minimization complete, pop bubble in stack
        onMinimize();
      }, 240);
    }, 110);
  };

  // Pick suitable telemetry icon
  const getHeaderIcon = () => {
    if (item.id.includes('hitbox')) return <Target className="h-4 w-4 text-emerald-500 shrink-0" />;
    if (item.id.includes('kernel') || item.id.includes('simd')) return <Cpu className="h-4 w-4 text-sky-500 shrink-0" />;
    return <Activity className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  };

  const isResizingToStack = minimizePhase === 'resizing_to_stack';
  const isContentHidden = minimizePhase !== 'idle';

  const stackX = containerRef?.current ? containerRef.current.clientWidth - 56 : 600;

  return (
    <motion.div
      onMouseDown={onFocus}
      initial={{ opacity: 0 }}
      animate={
        isResizingToStack
          ? {
              x: stackX,
              y: 16,
              width: 40,
              height: 40,
              opacity: 0,
              borderRadius: 12,
            }
          : {
              x: pos.x,
              y: pos.y,
              width: size.width,
              height: size.height,
              opacity: 1,
              borderRadius: 16,
            }
      }
      transition={{
        duration: isInteracting ? 0 : isResizingToStack ? 0.24 : 0,
        ease: [0.2, 0.8, 0.25, 1],
      }}
      style={{
        zIndex,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      className={`pointer-events-auto flex flex-col border backdrop-blur-md overflow-hidden select-none outline-none ${
        isLight
          ? 'bg-white/95 border-neutral-300 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
          : 'bg-neutral-900/95 border-neutral-700 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
      }`}
    >
      {/* Window Header: Titlebar with ONLY minimize (-) button; no F10, no close button */}
      <div
        onMouseDown={handleTitleBarMouseDown}
        className={`flex items-center justify-between px-3.5 py-2 border-b cursor-grab active:cursor-grabbing transition-colors ${
          isLight ? 'bg-neutral-100/80 border-neutral-200' : 'bg-neutral-850/80 border-neutral-700/80'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {getHeaderIcon()}
          <span className="font-bold text-xs truncate max-w-[280px]">{item.title}</span>
        </div>

        {/* Action Controls: Minimize (-) only (Close is strictly inside stack) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleTriggerMinimize}
            title="最小化收缩至右上角 Stack"
            className={`h-5 w-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
              isLight
                ? 'bg-white hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-neutral-200'
            }`}
          >
            <Minus className="h-3 w-3 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Window Content: Fades out in Phase 1 of Sequenced Step Transition */}
      <div
        className={`p-3.5 flex-1 overflow-y-auto flex flex-col gap-2.5 text-xs transition-opacity duration-100 ${
          isContentHidden ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`p-2 rounded-xl border ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-800/60 border-neutral-700/60'
            }`}
          >
            <span className="text-[10px] text-neutral-400 block font-mono">Loop Frequency</span>
            <span className="text-sm font-mono font-bold text-amber-500">120.0 Hz</span>
          </div>

          <div
            className={`p-2 rounded-xl border ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-800/60 border-neutral-700/60'
            }`}
          >
            <span className="text-[10px] text-neutral-400 block font-mono">Step Latency</span>
            <span className="text-sm font-mono font-bold text-emerald-500">0.32 ms</span>
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border font-mono text-[10px] leading-relaxed flex-1 ${
            isLight
              ? 'bg-neutral-100/60 border-neutral-200 text-neutral-700'
              : 'bg-neutral-950/40 border-neutral-800 text-neutral-300'
          }`}
        >
          <div>• Body: Car[0] Active (SimTick #8192)</div>
          <div>• Ball: Pos [12.4, -180.2, 17.0] Vel [28.5m/s]</div>
          <div>• Hitbox: OBB Contact Normal [0.0, 1.0, 0.0]</div>
          <div>• Telemetry Channel: WASM SharedMemory</div>
        </div>

        <div className="flex items-center justify-between text-[10px] opacity-65 border-t border-neutral-200/60 dark:border-neutral-800 pt-1.5 font-mono">
          <span>Pos: ({pos.x}, {pos.y})</span>
          <span>Size: {size.width}×{size.height}</span>
        </div>
      </div>

      {/* Resize Handle at Bottom-Right */}
      {item.resizable !== false && !isContentHidden && (
        <div
          onMouseDown={handleResizeMouseDown}
          title="拖动调整窗口尺寸"
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-neutral-400 hover:text-amber-500 select-none z-10"
        >
          <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 6 6" fill="currentColor">
            <circle cx="5" cy="5" r="1" />
            <circle cx="5" cy="2" r="1" />
            <circle cx="2" cy="5" r="1" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};
