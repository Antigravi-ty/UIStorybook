import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Info,
  Minus,
  Minimize2,
  Pin,
  X,
  MoveDiagonal2,
} from 'lucide-react';
import {
  useFloatingStore,
  type FloatingWindowItem,
  type FloatingStoreInstance,
} from '../../tokens/floatingStore';
import {
  useMenuLayoutStore,
  resolvePanelHeaderBackBtnGeometry,
} from '../../tokens/menuLayoutStore';
import {
  useFloatingThreeStageStore,
  type FloatingThreeStageConfig,
  type FloatingResizeHandleStyle,
  type FloatingCornerArcColorMode,
} from '../stores/floatingThreeStageStore';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { getFloatingWindowIcon } from '../../navigation/FloatingWindowIcon';

export interface FloatingThreeStageRenderContext {
  isLight: boolean;
  width: number;
  height: number;
  hoveredDescription: string | null;
  setHoveredDescription: (desc: string | null) => void;
  subViewDepth: number;
  pushSubView: (title: string) => void;
  popSubView: () => void;
}

import {
  CornerCurvedDragger,
  type CornerCurvedDraggerProps,
} from '../../navigation/CornerCurvedDragger';

export { CornerCurvedDragger, type CornerCurvedDraggerProps };

export interface FloatingThreeStageWindowManagerProps {
  isLight?: boolean;
  store?: FloatingStoreInstance;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  configOverride?: Partial<FloatingThreeStageConfig>;
  defaultDescriptionForWindow?: (item: FloatingWindowItem) => string;
  renderWindowContent?: (
    item: FloatingWindowItem,
    ctx: FloatingThreeStageRenderContext
  ) => React.ReactNode;
}

/**
 * [L4/L6 Variation Component] FloatingThreeStageWindowManager
 * Combines L4 Floating Window choreography (drag, 3-phase stack minimize, multi-window z-index, opacity)
 * with Stage 3 Footer hover descriptions, unrestricted max W×H resizing, and natural concentric curved corner draggers.
 */
export const FloatingThreeStageWindowManager: React.FC<FloatingThreeStageWindowManagerProps> = ({
  isLight = false,
  store,
  containerRef,
  configOverride,
  defaultDescriptionForWindow,
  renderWindowContent,
}) => {
  const {
    windows,
    windowOrder,
    bringToFront,
    minimizeWindow,
    closeWindow,
    updatePosition,
    updateSize,
    batchMinimizeSignal,
    opacity,
  } = useFloatingStore(store);

  const baseConfig = useFloatingThreeStageStore();
  const l2Store = useMenuLayoutStore();

  const resolvedConfig: FloatingThreeStageConfig = React.useMemo(() => {
    const merged: FloatingThreeStageConfig = {
      ...baseConfig,
      ...(configOverride || {}),
    };
    if (merged.syncWithGlobalL2Shell && !configOverride) {
      return {
        ...merged,
        headerPaddingX: l2Store.panelHeaderPaddingX,
        headerPaddingY: l2Store.panelHeaderPaddingY,
        headerTitleFontSize: l2Store.panelHeaderTitleFontSize,
        headerBtnWidth: l2Store.panelHeaderBackBtnWidth,
        headerBtnHeight: l2Store.panelHeaderBackBtnHeight,
        headerBtnRadiusMode: l2Store.panelHeaderBackBtnRadiusMode,
        headerBtnCustomRadius: l2Store.panelHeaderBackBtnRadius,
        headerBtnInnerRadius: l2Store.panelHeaderBackBtnInnerRadius,
        headerBtnRadiusTL: l2Store.panelHeaderBackBtnRadiusTL,
        headerBtnRadiusTR: l2Store.panelHeaderBackBtnRadiusTR,
        headerBtnRadiusBR: l2Store.panelHeaderBackBtnRadiusBR,
        headerBtnRadiusBL: l2Store.panelHeaderBackBtnRadiusBL,
        headerBtnIdleTone: l2Store.panelHeaderBackBtnIdleTone,
        headerBtnStyle: l2Store.panelHeaderBackBtnStyle,
        headerBtnExpandOnHover: l2Store.panelHeaderRightBtnExpandOnHover,
        outerRadius: l2Store.panelOuterRadius,
        bodyPaddingX: l2Store.panelBodyPaddingX,
        bodyPaddingY: l2Store.panelBodyPaddingY,
        footerPaddingX: l2Store.panelFooterPaddingX,
        footerPaddingY: l2Store.panelFooterPaddingY,
        footerFontSize: l2Store.panelFooterFontSize,
        footerRightDivider: l2Store.panelFooterRightDivider,
        footerRightPaddingX: l2Store.panelFooterRightPaddingX,
      };
    }
    return merged;
  }, [baseConfig, configOverride, l2Store]);

  const visibleWindows = windows.filter((w) => !w.isMinimized);
  if (visibleWindows.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      <AnimatePresence>
        {visibleWindows.map((win, idx) => {
          const zIndex = 5 + Math.max(0, windowOrder.indexOf(win.id));
          return (
            <FloatingThreeStageWindowInstance
              key={win.id}
              item={win}
              index={idx}
              config={resolvedConfig}
              batchMinimizeSignal={batchMinimizeSignal}
              opacity={opacity}
              isLight={isLight}
              zIndex={zIndex}
              containerRef={containerRef}
              defaultDescription={
                defaultDescriptionForWindow?.(win) ??
                win.subtitle ??
                'Hover any control or action button to inspect contextual help in Stage 3 Footer.'
              }
              renderWindowContent={renderWindowContent}
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

interface FloatingThreeStageWindowInstanceProps {
  item: FloatingWindowItem;
  index: number;
  config: FloatingThreeStageConfig;
  batchMinimizeSignal?: number;
  opacity?: number;
  isLight?: boolean;
  zIndex: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  defaultDescription: string;
  renderWindowContent?: (
    item: FloatingWindowItem,
    ctx: FloatingThreeStageRenderContext
  ) => React.ReactNode;
  onFocus: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onUpdatePosition: (pos: { x: number; y: number }) => void;
  onUpdateSize: (size: { width: number; height: number }) => void;
}

export const FloatingThreeStageWindowInstance: React.FC<FloatingThreeStageWindowInstanceProps> = ({
  item,
  index,
  config,
  batchMinimizeSignal,
  opacity = 85,
  isLight = false,
  zIndex,
  containerRef,
  defaultDescription,
  renderWindowContent,
  onFocus,
  onMinimize,
  onClose,
  onUpdatePosition,
  onUpdateSize,
}) => {
  const [pos, setPos] = useState({
    x: item.position?.x ?? 36,
    y: item.position?.y ?? 36,
  });
  const [size, setSize] = useState({
    width: item.width ?? 480,
    height: item.height ?? 350,
  });

  const [minimizePhase, setMinimizePhase] = useState<
    'idle' | 'fading_content' | 'resizing_to_stack'
  >('idle');
  const [interactionMode, setInteractionMode] = useState<
    'idle' | 'dragging' | 'resizing-both' | 'resizing-w' | 'resizing-h'
  >('idle');
  const [isPinned, setIsPinned] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);
  const [cornerGripHovered, setCornerGripHovered] = useState(false);
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);
  const [subViewStack, setSubViewStack] = useState<string[]>([]);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    startWidth: 0,
    startHeight: 0,
    axis: 'both' as 'both' | 'w' | 'h',
  });

  useEffect(() => {
    if (item.position) setPos(item.position);
  }, [item.position]);

  useEffect(() => {
    if (item.width && item.height) {
      const effectiveMinH = item.resizable === false ? 88 : config.minHeight;
      const clampedW = config.limitMaxSize
        ? Math.min(config.maxWidth, item.width)
        : item.width;
      const clampedH = config.limitMaxSize
        ? Math.min(config.maxHeight, item.height)
        : item.height;
      setSize({
        width: Math.max(config.minWidth, clampedW),
        height: Math.max(effectiveMinH, clampedH),
      });
    }
  }, [
    item.width,
    item.height,
    item.resizable,
    config.limitMaxSize,
    config.minWidth,
    config.minHeight,
    config.maxWidth,
    config.maxHeight,
  ]);

  // Collective collapse signal listener
  const lastSignalRef = useRef(batchMinimizeSignal);
  useEffect(() => {
    if (batchMinimizeSignal && batchMinimizeSignal !== lastSignalRef.current) {
      lastSignalRef.current = batchMinimizeSignal;
      if (minimizePhase === 'idle' && !isPinned) {
        const staggerDelay = Math.max(0, index) * 35;
        const timer = setTimeout(() => {
          handleTriggerMinimize();
        }, staggerDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [batchMinimizeSignal, minimizePhase, index, isPinned]);

  // Dragging by Stage 1 Header
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (isPinned) {
      onFocus();
      return;
    }
    e.preventDefault();
    onFocus();
    isDraggingRef.current = true;
    setInteractionMode('dragging');
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

      let newX = Math.max(8, dragStartRef.current.startX + deltaX);
      let newY = Math.max(8, dragStartRef.current.startY + deltaY);

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        newX = Math.min(newX, Math.max(16, rect.width - 120));
        newY = Math.min(newY, Math.max(16, rect.height - 60));
      }

      setPos({ x: Math.round(newX), y: Math.round(newY) });
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setInteractionMode('idle');
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

  // Resizing along 'both' (corner dragger / carved footer grip), 'w' (right edge), or 'h' (bottom edge)
  const startResize = (axis: 'both' | 'w' | 'h') => (e: React.MouseEvent) => {
    if (!config.resizable || item.resizable === false) return;
    e.stopPropagation();
    e.preventDefault();
    onFocus();
    isResizingRef.current = true;
    setInteractionMode(
      axis === 'w' ? 'resizing-w' : axis === 'h' ? 'resizing-h' : 'resizing-both'
    );
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      axis,
    };

    const handleResizeMove = (ev: MouseEvent) => {
      if (!isResizingRef.current) return;
      const deltaW = ev.clientX - resizeStartRef.current.mouseX;
      const deltaH = ev.clientY - resizeStartRef.current.mouseY;
      const currentAxis = resizeStartRef.current.axis;

      const rawNextW = Math.max(
        config.minWidth,
        resizeStartRef.current.startWidth + deltaW
      );
      const rawNextH = Math.max(
        config.minHeight,
        resizeStartRef.current.startHeight + deltaH
      );

      const nextWidth =
        currentAxis === 'h'
          ? resizeStartRef.current.startWidth
          : config.limitMaxSize
          ? Math.min(config.maxWidth, rawNextW)
          : rawNextW;

      const nextHeight =
        currentAxis === 'w'
          ? resizeStartRef.current.startHeight
          : config.limitMaxSize
          ? Math.min(config.maxHeight, rawNextH)
          : rawNextH;

      setSize({
        width: Math.round(nextWidth),
        height: Math.round(nextHeight),
      });
    };

    const handleResizeUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        setInteractionMode('idle');
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

  // 3-Phase Sequenced Step Minimization
  const handleTriggerMinimize = () => {
    if (minimizePhase !== 'idle') return;
    setMinimizePhase('fading_content');
    setTimeout(() => {
      setMinimizePhase('resizing_to_stack');
      setTimeout(() => {
        onMinimize();
      }, 240);
    }, 110);
  };

  // Resolve L2 button geometry for Stage 1 Header
  const btnGeom = resolvePanelHeaderBackBtnGeometry({
    panelHeaderPaddingX: config.headerPaddingX,
    panelHeaderPaddingY: config.headerPaddingY,
    panelHeaderBackBtnWidth: config.headerBtnWidth,
    panelHeaderBackBtnHeight: config.headerBtnHeight,
    panelHeaderBackBtnRadiusMode: config.headerBtnRadiusMode,
    panelHeaderBackBtnRadius: config.headerBtnCustomRadius,
    panelHeaderBackBtnInnerRadius: config.headerBtnInnerRadius,
    panelHeaderBackBtnRadiusTL: config.headerBtnRadiusTL,
    panelHeaderBackBtnRadiusTR: config.headerBtnRadiusTR,
    panelHeaderBackBtnRadiusBR: config.headerBtnRadiusBR,
    panelHeaderBackBtnRadiusBL: config.headerBtnRadiusBL,
    panelOuterRadius: config.outerRadius,
  });

  const isFlushDividerMode =
    config.headerPaddingX === 0 &&
    config.headerPaddingY === 0 &&
    btnGeom.innerRadius === 0;

  const leftBorderStructureClass =
    config.headerBtnStyle === 'surface'
      ? isFlushDividerMode
        ? 'border-0 border-r'
        : 'border'
      : 'border-0';

  const rightBorderStructureClass =
    config.headerBtnStyle === 'surface'
      ? isFlushDividerMode
        ? 'border-0 border-l'
        : 'border'
      : 'border-0';

  const getHeaderBtnSurfaceClasses = (activeHighlight = false) => {
    const borderColorClass = isLight
      ? 'border-neutral-200/90 hover:border-neutral-300'
      : 'border-neutral-800/80 hover:border-neutral-700';

    if (activeHighlight) {
      return isLight
        ? `bg-amber-500/15 text-amber-600 ${borderColorClass} cursor-pointer`
        : `bg-amber-500/20 text-amber-400 ${borderColorClass} cursor-pointer`;
    }

    if (config.headerBtnIdleTone === 'match-header') {
      return isLight
        ? `bg-transparent hover:bg-neutral-200/80 active:bg-neutral-300/75 ${borderColorClass} text-neutral-500 hover:text-neutral-950 cursor-pointer`
        : `bg-transparent hover:bg-neutral-800/85 active:bg-neutral-700/80 ${borderColorClass} text-neutral-400 hover:text-white cursor-pointer`;
    }

    if (config.headerBtnIdleTone === 'muted-gray') {
      if (isFlushDividerMode) {
        return isLight
          ? `bg-neutral-200/50 hover:bg-neutral-200/95 ${borderColorClass} text-neutral-500 hover:text-neutral-950 cursor-pointer`
          : `bg-neutral-900/65 hover:bg-neutral-800/90 ${borderColorClass} text-neutral-400 hover:text-white cursor-pointer`;
      }
      return isLight
        ? 'bg-neutral-200/55 hover:bg-white border-neutral-300/75 text-neutral-500 hover:text-neutral-950 cursor-pointer'
        : 'bg-neutral-800/55 hover:bg-neutral-700/90 border-neutral-700/50 text-neutral-400 hover:text-white cursor-pointer';
    }

    if (isFlushDividerMode) {
      return isLight
        ? `bg-white/90 hover:bg-neutral-200/90 ${borderColorClass} text-neutral-700 hover:text-neutral-950 cursor-pointer`
        : `bg-neutral-800/80 hover:bg-neutral-700/90 ${borderColorClass} text-neutral-200 hover:text-white cursor-pointer`;
    }
    return isLight
      ? 'bg-white hover:bg-neutral-100 border-neutral-300/80 text-neutral-700 hover:text-neutral-950 cursor-pointer'
      : 'bg-neutral-800/85 hover:bg-neutral-700/90 border-neutral-700/60 text-neutral-200 hover:text-white cursor-pointer';
  };

  const isResizingToStack = minimizePhase === 'resizing_to_stack';
  const isContentHidden = minimizePhase !== 'idle';
  const isInteracting = interactionMode !== 'idle';
  const isResizingNow =
    interactionMode === 'resizing-both' ||
    interactionMode === 'resizing-w' ||
    interactionMode === 'resizing-h';
  const isAutoFitHeight = config.contentOverflowMode === 'auto-fit-height';
  const isClassicBaseline = config.variant === 'classic-6d-baseline';
  const effectiveShowFooter =
    !isClassicBaseline &&
    config.variant !== 'two-stage-l2-header' &&
    config.showFooter;

  const stackX = containerRef?.current ? containerRef.current.clientWidth - 56 : 600;
  const effectiveOpacity = Math.max(0.01, Math.min(1, (opacity ?? 85) / 100));

  const activeTitle =
    subViewStack.length > 0
      ? `${item.title} / ${subViewStack[subViewStack.length - 1]}`
      : item.title;

  const renderCtx: FloatingThreeStageRenderContext = {
    isLight,
    width: size.width,
    height: size.height,
    hoveredDescription: hoveredDesc,
    setHoveredDescription: (desc) => {
      if (config.footerHoverLinkage) {
        setHoveredDesc(desc);
      }
    },
    subViewDepth: subViewStack.length,
    pushSubView: (subTitle: string) => setSubViewStack((prev) => [...prev, subTitle]),
    popSubView: () => setSubViewStack((prev) => prev.slice(0, -1)),
  };

  const customContent = renderWindowContent?.(item, renderCtx);

  const minHeaderHeight = btnGeom.height + config.headerPaddingY * 2;
  const labelFontSize = Math.max(10, Math.min(12, Math.round(btnGeom.height * 0.35)));
  const isRightExpanded = rightHovered && config.headerBtnExpandOnHover;

  const isCornerDraggerStyle =
    config.resizeHandleStyle === 'corner-arc' ||
    config.resizeHandleStyle === 'corner-arc-dots' ||
    config.resizeHandleStyle === 'corner-double-arc' ||
    config.resizeHandleStyle === 'corner-pill-arc' ||
    config.resizeHandleStyle === 'corner-dots';

  const showCornerDragger =
    config.resizable &&
    item.resizable !== false &&
    !isContentHidden &&
    (isCornerDraggerStyle ||
      (!effectiveShowFooter && config.resizeHandleStyle === 'footer-carved-slot'));

  const showInvisibleEdges =
    config.resizable &&
    item.resizable !== false &&
    !isContentHidden &&
    (config.resizeHandleStyle === 'invisible-edges-and-corner' ||
      config.resizeHandleStyle === 'both-slot-and-edges' ||
      config.enableRightEdgeResize ||
      config.enableBottomEdgeResize);

  const showCarvedFooterGrip =
    effectiveShowFooter &&
    config.resizable &&
    item.resizable !== false &&
    (config.footerRightSlotMode === 'carved-resize-grip' ||
      config.resizeHandleStyle === 'footer-carved-slot' ||
      config.resizeHandleStyle === 'both-slot-and-edges');

  const effectiveFooterRightMode = showCarvedFooterGrip
    ? 'carved-resize-grip'
    : config.footerRightSlotMode;

  const hasFooterRightCompartment = effectiveFooterRightMode !== 'none';

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
              ...(isAutoFitHeight ? {} : { height: size.height }),
              opacity: effectiveOpacity,
              borderRadius: config.outerRadius,
            }
      }
      transition={{
        duration: isInteracting ? 0 : isResizingToStack ? 0.24 : 0,
        ease: [0.2, 0.8, 0.25, 1],
      }}
      style={{
        zIndex: isPinned ? zIndex + 50 : zIndex,
        position: 'absolute',
        top: 0,
        left: 0,
        ...(isAutoFitHeight && !isResizingToStack
          ? {
              height: 'auto',
              minHeight: `${config.minHeight}px`,
              ...(config.limitMaxSize ? { maxHeight: `${config.maxHeight}px` } : {}),
            }
          : {}),
      }}
      data-floating-window-variant={config.variant}
      className={`pointer-events-auto flex flex-col border overflow-hidden select-none outline-none shadow-2xl ${
        isLight
          ? 'bg-neutral-50/98 border-neutral-300/90 text-neutral-900'
          : 'bg-neutral-900/98 border-neutral-700/80 text-neutral-100'
      }`}
    >
      {/* Live Resize / Drag Telemetry Pill Overlay */}
      {config.showResizeHudOverlay && isInteracting && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 font-mono font-bold text-[10px] shadow-md flex items-center gap-2">
          <span>
            {interactionMode === 'dragging'
              ? `DRAG POS (${pos.x}, ${pos.y})`
              : interactionMode === 'resizing-w'
              ? `RESIZE WIDTH: ${size.width}px`
              : interactionMode === 'resizing-h'
              ? `RESIZE HEIGHT: ${size.height}px`
              : `RESIZE 2D: ${size.width} × ${size.height}px`}
          </span>
          <span className="opacity-75">
            [Min {config.minWidth}×{config.minHeight} · Max {config.limitMaxSize ? `${config.maxWidth}×${config.maxHeight}` : '∞'}]
          </span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          STAGE 1: HEADER
         ════════════════════════════════════════════════════════════════════ */}
      <div
        onMouseDown={handleTitleBarMouseDown}
        data-floating-stage="header"
        style={{
          paddingLeft: `${config.headerPaddingX}px`,
          paddingRight: `${config.headerPaddingX}px`,
          paddingTop: `${config.headerPaddingY}px`,
          paddingBottom: `${config.headerPaddingY}px`,
          minHeight: `${minHeaderHeight}px`,
        }}
        className={`relative flex items-center justify-between border-b shrink-0 transition-colors ${
          isPinned ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        } ${
          isLight
            ? 'border-neutral-200/90 bg-neutral-100/75 text-neutral-900'
            : 'border-neutral-800/90 bg-neutral-950/60 text-white'
        } ${
          config.showStageAnatomyBorders
            ? 'outline-1 -outline-offset-1 outline-dashed outline-amber-500/70'
            : ''
        }`}
      >
        {/* Centered Title Mode (L2 Standard) */}
        {config.headerTitleAlign === 'center' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden px-12">
            <span
              style={{ fontSize: `${config.headerTitleFontSize}px` }}
              className="font-bold tracking-wider uppercase whitespace-nowrap truncate leading-none text-center"
            >
              {activeTitle}
            </span>
          </div>
        )}

        {/* Left Slot: None / Category Icon / Back Button */}
        <div className="relative z-10 flex items-center gap-2 shrink-0 min-w-0">
          {config.headerLeftSlotMode === 'back-button' && (
            <button
              type="button"
              onClick={() => {
                if (subViewStack.length > 0) {
                  setSubViewStack((prev) => prev.slice(0, -1));
                }
              }}
              onMouseEnter={() =>
                config.footerHoverLinkage &&
                setHoveredDesc(
                  subViewStack.length > 0
                    ? 'Stage 1 Left Slot [Back]: Return to parent floating window view.'
                    : 'Stage 1 Left Slot [Back]: At root view of floating window (click inside content to push a sub-view).'
                )
              }
              onMouseLeave={() => config.footerHoverLinkage && setHoveredDesc(null)}
              style={{
                minWidth: `${btnGeom.width}px`,
                height: `${btnGeom.height}px`,
                borderRadius: btnGeom.borderRadiusCss,
              }}
              className={`inline-flex items-center justify-center shrink-0 ${leftBorderStructureClass} transition-all outline-none ${getHeaderBtnSurfaceClasses(
                subViewStack.length > 0
              )}`}
              title="Back to parent view in floating window"
            >
              <ArrowLeft
                style={{ width: `${btnGeom.iconSize}px`, height: `${btnGeom.iconSize}px` }}
              />
            </button>
          )}

          {config.headerLeftSlotMode === 'category-icon' && (
            <div
              onMouseEnter={() =>
                config.footerHoverLinkage &&
                setHoveredDesc(
                  `Window Category Icon (${item.category || 'telemetry'}): Drag titlebar to reposition window anywhere on canvas.`
                )
              }
              onMouseLeave={() => config.footerHoverLinkage && setHoveredDesc(null)}
              style={
                config.headerTitleAlign === 'center'
                  ? {
                      minWidth: `${btnGeom.width}px`,
                      height: `${btnGeom.height}px`,
                      borderRadius: btnGeom.borderRadiusCss,
                    }
                  : {
                      paddingLeft: config.headerPaddingX === 0 ? '12px' : '2px',
                    }
              }
              className={`inline-flex items-center justify-center shrink-0 ${
                config.headerTitleAlign === 'center'
                  ? `${leftBorderStructureClass} ${
                      isLight ? 'border-neutral-200/90' : 'border-neutral-800/80'
                    }`
                  : ''
              }`}
            >
              {getFloatingWindowIcon(item.category, item.id)}
            </div>
          )}

          {/* Left-Aligned Title Mode (Calibrated Default) */}
          {config.headerTitleAlign === 'left' && (
            <span
              style={{
                fontSize: `${config.headerTitleFontSize}px`,
                paddingLeft: config.headerLeftSlotMode === 'none' ? '10px' : '0px',
              }}
              className="font-bold tracking-tight truncate max-w-[360px] leading-none"
            >
              {activeTitle}
            </span>
          )}
        </div>

        {/* Right Slot: Minimize Button (+ Optional Pin / Close) */}
        <div className="relative z-10 flex items-center shrink-0 ml-auto">
          {config.headerRightActionMode === 'minimize-and-pin' && (
            <button
              type="button"
              onClick={() => setIsPinned((v) => !v)}
              onMouseEnter={() =>
                config.footerHoverLinkage &&
                setHoveredDesc(
                  isPinned
                    ? 'Unpin Window: Allow dragging and batch ESC minimization.'
                    : 'Pin Window: Lock window position on screen and ignore batch ESC minimize.'
                )
              }
              onMouseLeave={() => config.footerHoverLinkage && setHoveredDesc(null)}
              style={{
                minWidth: `${Math.max(22, btnGeom.width)}px`,
                height: `${btnGeom.height}px`,
              }}
              className={`inline-flex items-center justify-center shrink-0 ${rightBorderStructureClass} transition-all outline-none ${getHeaderBtnSurfaceClasses(
                isPinned
              )}`}
              title={isPinned ? 'Unpin Window' : 'Pin Window Position'}
            >
              <Pin className="h-3 w-3" />
            </button>
          )}

          {/* Minimize-to-Stack Button */}
          <button
            type="button"
            onClick={handleTriggerMinimize}
            onMouseEnter={() => {
              setRightHovered(true);
              if (config.footerHoverLinkage) {
                setHoveredDesc(
                  'Minimize to Stack [-]: Collapse window via 3-phase sequenced transition into top-right Floating Stack Icon.'
                );
              }
            }}
            onMouseLeave={() => {
              setRightHovered(false);
              if (config.footerHoverLinkage) {
                setHoveredDesc(null);
              }
            }}
            style={{
              minWidth: `${btnGeom.width}px`,
              width: isRightExpanded ? 'auto' : `${btnGeom.width}px`,
              height: `${btnGeom.height}px`,
              borderRadius:
                config.headerRightActionMode === 'minimize-and-close'
                  ? '0px'
                  : btnGeom.rightBorderRadiusCss,
              paddingLeft: isRightExpanded ? '10px' : undefined,
              paddingRight: isRightExpanded ? '10px' : undefined,
            }}
            className={`inline-flex items-center justify-center gap-1.5 shrink-0 ${rightBorderStructureClass} transition-all outline-none ${getHeaderBtnSurfaceClasses(
              false
            )}`}
            title="最小化收缩至右上角 Stack"
          >
            {isRightExpanded && (
              <span
                style={{ fontSize: `${labelFontSize}px` }}
                className="font-bold tracking-wider uppercase leading-none whitespace-nowrap select-none"
              >
                STACK
              </span>
            )}
            {config.headerRightIconStyle === 'minimize-2' ? (
              <Minimize2
                style={{ width: `${btnGeom.iconSize}px`, height: `${btnGeom.iconSize}px` }}
              />
            ) : (
              <Minus
                className="stroke-[2.5]"
                style={{ width: `${btnGeom.iconSize}px`, height: `${btnGeom.iconSize}px` }}
              />
            )}
          </button>

          {config.headerRightActionMode === 'minimize-and-close' && (
            <button
              type="button"
              onClick={onClose}
              onMouseEnter={() =>
                config.footerHoverLinkage &&
                setHoveredDesc('Close Window [×]: Permanently close and remove from Floating Stack.')
              }
              onMouseLeave={() => config.footerHoverLinkage && setHoveredDesc(null)}
              style={{
                minWidth: `${btnGeom.width}px`,
                height: `${btnGeom.height}px`,
                borderRadius: btnGeom.rightBorderRadiusCss,
              }}
              className={`inline-flex items-center justify-center shrink-0 ${rightBorderStructureClass} transition-all outline-none hover:bg-rose-500/20 hover:text-rose-500 ${getHeaderBtnSurfaceClasses(
                false
              )}`}
              title="关闭窗口"
            >
              <X
                style={{ width: `${btnGeom.iconSize}px`, height: `${btnGeom.iconSize}px` }}
              />
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          STAGE 2: CONTENT BODY
         ════════════════════════════════════════════════════════════════════ */}
      <div
        data-floating-stage="content"
        style={{
          paddingLeft: `${config.bodyPaddingX}px`,
          paddingRight: `${config.bodyPaddingX}px`,
          paddingTop: `${config.bodyPaddingY}px`,
          paddingBottom: `${config.bodyPaddingY}px`,
        }}
        className={`flex flex-col ${
          isAutoFitHeight ? 'flex-initial min-h-0' : 'flex-1 min-h-0'
        } w-full box-border overflow-y-auto text-xs transition-opacity duration-100 ${
          isContentHidden ? 'opacity-0' : 'opacity-100'
        } ${
          config.showStageAnatomyBorders
            ? 'outline-1 -outline-offset-1 outline-dashed outline-emerald-500/70 bg-emerald-500/[0.02]'
            : ''
        }`}
      >
        {customContent}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          STAGE 3: FOOTER
         ════════════════════════════════════════════════════════════════════ */}
      {effectiveShowFooter && !isContentHidden && (
        <div
          data-floating-stage="footer"
          style={{
            paddingLeft: hasFooterRightCompartment ? '0px' : `${config.footerPaddingX}px`,
            paddingRight: hasFooterRightCompartment
              ? '0px'
              : showCornerDragger
              ? `${Math.max(config.footerPaddingX, 24)}px`
              : `${config.footerPaddingX}px`,
            paddingTop: hasFooterRightCompartment ? '0px' : `${config.footerPaddingY}px`,
            paddingBottom: hasFooterRightCompartment ? '0px' : `${config.footerPaddingY}px`,
            fontSize: `${config.footerFontSize}px`,
          }}
          className={`flex items-stretch justify-between border-t select-none shrink-0 mt-auto relative z-10 transition-colors duration-150 ${
            isLight
              ? 'border-neutral-200/90 text-neutral-600 bg-neutral-100/70'
              : 'border-neutral-800/90 text-neutral-400 bg-neutral-950/60'
          } ${
            config.showStageAnatomyBorders
              ? 'outline-1 -outline-offset-1 outline-dashed outline-sky-500/70'
              : ''
          }`}
        >
          {/* Left Compartment: Info Icon + Idle Muted / Hover High-Contrast Description */}
          <div
            style={
              hasFooterRightCompartment
                ? {
                    paddingLeft: `${config.footerPaddingX}px`,
                    paddingRight: '10px',
                    paddingTop: `${config.footerPaddingY}px`,
                    paddingBottom: `${config.footerPaddingY}px`,
                  }
                : undefined
            }
            className="flex items-center gap-2 min-w-0 flex-1 truncate"
          >
            <Info
              className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                hoveredDesc
                  ? 'text-amber-500'
                  : isLight
                  ? 'text-neutral-400'
                  : 'text-neutral-500'
              }`}
            />
            <span
              className={`truncate transition-colors duration-150 ${
                hoveredDesc
                  ? isLight
                    ? 'text-neutral-950 font-semibold'
                    : 'text-white font-semibold'
                  : isLight
                  ? 'text-neutral-500'
                  : 'text-neutral-400'
              }`}
            >
              {hoveredDesc || defaultDescription}
            </span>
          </div>

          {/* Optional Right Compartment: Carved Resize Grip / Live Dimensions / Shortcut Badge */}
          {hasFooterRightCompartment && (
            <div
              onMouseDown={
                effectiveFooterRightMode === 'carved-resize-grip'
                  ? startResize('both')
                  : undefined
              }
              onClick={
                effectiveFooterRightMode === 'shortcut-badge'
                  ? handleTriggerMinimize
                  : undefined
              }
              onMouseEnter={() => {
                if (!config.footerHoverLinkage) return;
                if (effectiveFooterRightMode === 'carved-resize-grip') {
                  setHoveredDesc(
                    `Stage 3 Carved Resize Slot: Drag diagonally to resize (${size.width}×${size.height}px).`
                  );
                } else if (effectiveFooterRightMode === 'live-dimensions') {
                  setHoveredDesc(
                    `Window Geometry Readout: ${size.width}×${size.height}px at Canvas (${pos.x}, ${pos.y}).`
                  );
                } else if (effectiveFooterRightMode === 'shortcut-badge') {
                  setHoveredDesc(
                    'Stage 3 Right Action: Click or press [ESC] to fold floating window into top-right Stack.'
                  );
                }
              }}
              onMouseLeave={() => config.footerHoverLinkage && setHoveredDesc(null)}
              style={{
                paddingLeft: `${config.footerRightPaddingX}px`,
                paddingRight: `${config.footerRightPaddingX}px`,
                paddingTop: `${config.footerPaddingY}px`,
                paddingBottom: `${config.footerPaddingY}px`,
              }}
              className={`flex items-center gap-1.5 shrink-0 font-mono transition-colors ${
                config.footerRightDivider
                  ? isLight
                    ? 'border-l border-neutral-200/90'
                    : 'border-l border-neutral-800/90'
                  : ''
              } ${
                effectiveFooterRightMode === 'carved-resize-grip'
                  ? isLight
                    ? 'cursor-nwse-resize hover:bg-amber-500/15 hover:text-amber-600 text-neutral-500'
                    : 'cursor-nwse-resize hover:bg-amber-500/20 hover:text-amber-400 text-neutral-400'
                  : effectiveFooterRightMode === 'shortcut-badge'
                  ? isLight
                    ? 'cursor-pointer hover:bg-neutral-200/75 text-neutral-600 hover:text-neutral-950'
                    : 'cursor-pointer hover:bg-neutral-800/80 text-neutral-400 hover:text-white'
                  : isLight
                  ? 'text-neutral-500'
                  : 'text-neutral-400'
              }`}
              title={
                effectiveFooterRightMode === 'carved-resize-grip'
                  ? '拖拽此槽调整窗口宽高 (Carved 2D Resize Handle)'
                  : undefined
              }
            >
              {effectiveFooterRightMode === 'carved-resize-grip' && (
                <>
                  <span className="text-[10px] opacity-80">
                    {size.width}×{size.height}
                  </span>
                  <MoveDiagonal2 className="h-3 w-3 text-amber-500 shrink-0" />
                </>
              )}
              {effectiveFooterRightMode === 'live-dimensions' && (
                <span className="text-[10px]">
                  {size.width}×{size.height}px
                </span>
              )}
              {effectiveFooterRightMode === 'shortcut-badge' && (
                <>
                  <span className="font-sans font-medium whitespace-nowrap leading-none">
                    Stack
                  </span>
                  <KeycapBadge shortcut="ESC" size="sm" isLight={isLight} />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          BOTTOM-RIGHT CURVED / CORNER DRAGGER
         ════════════════════════════════════════════════════════════════════ */}
      {showCornerDragger && (
        <div
          onMouseDown={startResize('both')}
          onMouseEnter={() => {
            setCornerGripHovered(true);
            if (config.footerHoverLinkage) {
              setHoveredDesc(
                `Corner Resize Dragger (${size.width}×${size.height}px · Unrestricted Max Size): Drag diagonally to freely scale window.`
              );
            }
          }}
          onMouseLeave={() => {
            setCornerGripHovered(false);
            if (config.footerHoverLinkage) {
              setHoveredDesc(null);
            }
          }}
          title="拖拽右下角圆弧握把自由缩放窗口 (Unbounded 2D Resize Dragger)"
          className="absolute bottom-0 right-0 cursor-nwse-resize flex items-end justify-end select-none z-30"
        >
          <CornerCurvedDragger
            styleVariant={
              isCornerDraggerStyle ? config.resizeHandleStyle : 'corner-arc'
            }
            outerRadius={config.outerRadius}
            concentric={config.cornerArcConcentric}
            arcRadius={config.cornerArcRadius}
            inset={config.cornerArcInset}
            sweepDeg={config.cornerArcSweepDeg}
            strokeWidth={config.cornerArcStrokeWidth}
            idleOpacity={config.cornerArcIdleOpacity}
            colorMode={config.cornerArcColorMode}
            isLight={isLight}
            isActiveOrHovered={cornerGripHovered || isResizingNow}
          />
        </div>
      )}

      {showInvisibleEdges && (
        <>
          {/* Right Edge Horizontal Resize Hit-Zone */}
          {(config.enableRightEdgeResize ||
            config.resizeHandleStyle === 'invisible-edges-and-corner' ||
            config.resizeHandleStyle === 'both-slot-and-edges') && (
            <div
              onMouseDown={startResize('w')}
              title="拖拽右边缘调整宽度 (Resize Width)"
              className="absolute top-8 bottom-4 right-0 w-2 cursor-ew-resize z-20 hover:bg-amber-500/30 transition-colors"
            />
          )}
          {/* Bottom Edge Vertical Resize Hit-Zone */}
          {(config.enableBottomEdgeResize ||
            config.resizeHandleStyle === 'invisible-edges-and-corner' ||
            config.resizeHandleStyle === 'both-slot-and-edges') &&
            !isAutoFitHeight && (
              <div
                onMouseDown={startResize('h')}
                title="拖拽下边缘调整高度 (Resize Height)"
                className="absolute left-4 right-8 bottom-0 h-2 cursor-ns-resize z-20 hover:bg-amber-500/30 transition-colors"
              />
            )}
        </>
      )}
    </motion.div>
  );
};
