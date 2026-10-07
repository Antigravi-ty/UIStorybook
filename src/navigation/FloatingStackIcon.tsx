import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, X, Activity, Cpu, Monitor, Target, Sparkles, Sliders } from 'lucide-react';
import { useFloatingStore, FloatingWindowItem } from '../tokens/floatingStore';
import { UI_EASING } from '../tokens/easing';

export interface FloatingStackIconProps {
  isLight?: boolean;
  className?: string;
  /** Whether positioning is absolute inside active canvas (default: true) or fixed */
  absolute?: boolean;
  /** Ref to the active canvas container for computing relative coordinates */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

/** Helper to pick a distinct colored icon without any background pill */
const getWindowIcon = (category?: string, id?: string) => {
  if (category === 'Diagnostic' || id?.includes('telemetry')) {
    return <Activity className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  }
  if (category === 'Kernel' || id?.includes('kernel') || id?.includes('simd')) {
    return <Cpu className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  }
  if (category === 'Hitbox' || id?.includes('hitbox')) {
    return <Target className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  }
  if (id?.includes('eq') || id?.includes('dsp')) {
    return <Sliders className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  }
  return <Sparkles className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
};

/**
 * FloatingStackIcon
 * Renders the top-right rounded-square stack icon and dropdown tray for minimized diagnostic windows.
 */
export const FloatingStackIcon: React.FC<FloatingStackIconProps> = ({
  isLight = false,
  className = '',
  absolute = true,
  containerRef,
}) => {
  const {
    windows,
    isStackTrayOpen,
    isStackDismissed,
    minimizedCount,
    toggleStackTray,
    setStackTrayOpen,
    restoreWindow,
    closeWindow,
    dismissStack,
  } = useFloatingStore();

  const [isStackHovered, setIsStackHovered] = useState(false);
  const [hoveredWindowId, setHoveredWindowId] = useState<string | null>(null);

  // Restoring state: tracks clicked item start rect in canvas space and destination window rect
  const [restoringWindow, setRestoringWindow] = useState<{
    id: string;
    startRect: { x: number; y: number; width: number; height: number };
    targetRect: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // If stack is dismissed and has no minimized windows, do not show
  if (isStackDismissed && minimizedCount === 0) {
    return null;
  }

  // If no windows exist at all and stack is dismissed, hide
  if (windows.length === 0 && isStackDismissed) {
    return null;
  }

  const minimizedWindows = windows.filter((w) => w.isMinimized);

  // Handle clicking a minimized item in the stack list to trigger 4-corner expand transition
  const handleRestoreClick = (win: FloatingWindowItem, e: React.MouseEvent<HTMLButtonElement>) => {
    const btnEl = e.currentTarget;
    const containerEl = containerRef?.current;
    if (!containerEl) {
      restoreWindow(win.id);
      return;
    }

    const bRect = btnEl.getBoundingClientRect();
    const cRect = containerEl.getBoundingClientRect();

    const startX = Math.round(bRect.left - cRect.left);
    const startY = Math.round(bRect.top - cRect.top);
    const startW = Math.round(bRect.width);
    const startH = Math.round(bRect.height);

    const targetX = win.position?.x ?? 40;
    const targetY = win.position?.y ?? 40;
    const targetW = win.width ?? 440;
    const targetH = win.height ?? 300;

    // Step 1: Set restoring state - all other items immediately disappear, this item's content disappears
    setRestoringWindow({
      id: win.id,
      startRect: { x: startX, y: startY, width: startW, height: startH },
      targetRect: { x: targetX, y: targetY, width: targetW, height: targetH },
    });

    // Step 2 & 3: After 240ms 4-corner resize completes, restore window and close tray
    setTimeout(() => {
      restoreWindow(win.id);
      setRestoringWindow(null);
    }, 240);
  };

  return (
    <>
      <div
        className={`${
          absolute ? 'absolute top-4 right-4' : 'fixed top-4 right-6'
        } z-40 select-none flex flex-col items-end ${className}`}
      >
        {/* 1. Main Stack Square Button (Neutral Monochrome) */}
        <div
          className="relative"
          onMouseEnter={() => setIsStackHovered(true)}
          onMouseLeave={() => setIsStackHovered(false)}
        >
          <button
            type="button"
            onClick={toggleStackTray}
            aria-label="Floating Diagnostic Window Stack"
            className={`relative h-10 w-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 active:scale-95 ${
              isLight
                ? 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_0_16px_rgba(0,0,0,0.12)]'
                : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-700 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_0_20px_rgba(0,0,0,0.7),0_0_28px_rgba(255,255,255,0.06)]'
            }`}
          >
            <Layers className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
          </button>

          {/* 2. Top-Right Bubble Counter (Strictly Neutral Monochrome: White/Black) */}
          <AnimatePresence>
            {minimizedCount > 0 && (
              <motion.div
                key={`stack-bubble-${minimizedCount}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.25, 1], opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full border flex items-center justify-center font-mono font-bold text-[11px] pointer-events-none select-none ${
                  isLight
                    ? 'bg-white text-black border-black shadow-xs'
                    : 'bg-black text-white border-white shadow-xs'
                }`}
              >
                {minimizedCount}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Dismiss button 'X': exact same spring animation and dimensions as counter bubble */}
          <AnimatePresence>
            {minimizedCount === 0 && isStackHovered && (
              <motion.button
                key="dismiss-stack-btn"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.25, 1], opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissStack();
                }}
                title="Close Stack Icon"
                className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full border border-red-600 bg-red-500 text-white flex items-center justify-center shadow-xs cursor-pointer z-10 outline-none select-none"
              >
                <X className="h-3 w-3 stroke-[3]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Minimized List Tray (Right-aligned under Stack Icon, ample left space to prevent cutoff) */}
        <AnimatePresence>
          {isStackTrayOpen && (
            <motion.div
              key="stack-tray-list"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={UI_EASING.spring.tactile}
              className="mt-2 flex flex-col items-end gap-1.5 z-50 max-h-80 overflow-y-auto pl-12 pr-1 py-1"
            >
              {minimizedWindows.length === 0 ? null : (
                minimizedWindows.map((win) => {
                  // If restoring, all other items disappear immediately
                  if (restoringWindow && win.id !== restoringWindow.id) {
                    return null;
                  }

                  const isThisItemRestoring = restoringWindow?.id === win.id;
                  const isHovered = hoveredWindowId === win.id && !restoringWindow;

                  return (
                    <div
                      key={win.id}
                      onMouseEnter={() => !restoringWindow && setHoveredWindowId(win.id)}
                      onMouseLeave={() => setHoveredWindowId(null)}
                      className={`relative flex items-center justify-end w-full pl-10 ${
                        isThisItemRestoring ? 'opacity-0 pointer-events-none' : ''
                      }`}
                      style={{ minHeight: '34px' }}
                    >
                      {/* Main Pill: shifts left by 34px on hover, equal-width 4-sided shadow */}
                      <motion.button
                        type="button"
                        onClick={(e) => handleRestoreClick(win, e)}
                        animate={{ x: isHovered ? -34 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer select-none backdrop-blur-md transition-colors ${
                          isLight
                            ? 'bg-white/95 hover:bg-neutral-50 border-neutral-300 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_0_16px_rgba(0,0,0,0.12)]'
                            : 'bg-neutral-900/95 hover:bg-neutral-850 border-neutral-700 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_0_18px_rgba(0,0,0,0.7),0_0_24px_rgba(255,255,255,0.06)]'
                        }`}
                        title="点击展开还原窗口"
                      >
                        {/* Left: category icon */}
                        {getWindowIcon(win.category, win.id)}

                        {/* Right: pure title */}
                        <span className="text-xs font-semibold whitespace-nowrap">
                          {win.title}
                        </span>
                      </motion.button>

                      {/* 
                        Independent Red Close 'X' Button on Right:
                        - Clean fade-in ONLY (no scale up / no circle)
                        - Rounded rectangle with light-red background on hover
                        - Red X icon with transparent background when idle
                        - Rendered ONLY when row is hovered
                      */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              closeWindow(win.id);
                            }}
                            title="关闭并销毁窗口"
                            className="absolute right-0 h-6 w-6 rounded-md bg-transparent hover:bg-red-500/15 text-red-500 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                          >
                            <X className="h-3.5 w-3.5 stroke-[2.5]" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
        Clicked Container 4-Corner Morphing Expansion:
        Morphs smoothly from the clicked tag's position & size to target window position & size!
      */}
      {restoringWindow && containerRef?.current && createPortal(
        <motion.div
          key={`restoring-ghost-${restoringWindow.id}`}
          initial={{
            x: restoringWindow.startRect.x,
            y: restoringWindow.startRect.y,
            width: restoringWindow.startRect.width,
            height: restoringWindow.startRect.height,
            borderRadius: 12,
            opacity: 1,
          }}
          animate={{
            x: restoringWindow.targetRect.x,
            y: restoringWindow.targetRect.y,
            width: restoringWindow.targetRect.width,
            height: restoringWindow.targetRect.height,
            borderRadius: 16,
            opacity: 1,
          }}
          transition={{
            duration: 0.24,
            ease: [0.2, 0.8, 0.25, 1],
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 45,
            pointerEvents: 'none',
          }}
          className={`border backdrop-blur-md overflow-hidden select-none ${
            isLight
              ? 'bg-white/95 border-neutral-300 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
              : 'bg-neutral-900/95 border-neutral-700 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
          }`}
        />,
        containerRef.current
      )}
    </>
  );
};
