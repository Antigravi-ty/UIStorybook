import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  ChevronLeft, 
  X, 
  Sparkles, 
  Layers, 
  RotateCcw,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { CodeBlock } from '../CodeBlock';
import { useLivePreviewStore } from '../../tokens/livePreviewStore';
import { Layer3BallTrajectoryRecipe } from '../../recipes/Layer3BallTrajectoryRecipe';
import { UI_EASING } from '../../tokens/easing';

export interface LivePreviewSimulationPageProps {
  isLight?: boolean;
}

export type LivePreviewAnimPhase = 
  | 'expanded'
  | 'collapsing_content'
  | 'collapsing_resize'
  | 'collapsed'
  | 'expanding_content'
  | 'expanding_resize';

/**
 * LivePreviewSimulationPage
 * Dedicated SPA page for the Live Preview interaction paradigm:
 * 1. Sequenced Step Transition: Content fades out -> Container resizes & docks to right-middle -> Pill content shows up.
 * 2. Dock pill: positioned relative to container right-middle edge with 4-sided uniform out-glow, no title, only '<' | TAB.
 * 3. Full-width container (no max-w-5xl clamping or artificial right margin).
 */
export const LivePreviewSimulationPage: React.FC<LivePreviewSimulationPageProps> = ({
  isLight = false,
}) => {
  const {
    activePreviewId,
    isCollapsed,
    enterPreview,
    setCollapsed,
    exitPreview,
  } = useLivePreviewStore();

  const [animPhase, setAnimPhase] = useState<LivePreviewAnimPhase>(
    isCollapsed ? 'collapsed' : 'expanded'
  );
  const [isPillHovered, setIsPillHovered] = useState(false);
  const [ballSimSpeed, setBallSimSpeed] = useState(128);

  // Sync external isCollapsed changes into anim phase
  useEffect(() => {
    if (isCollapsed && animPhase === 'expanded') {
      handleTriggerCollapse();
    } else if (!isCollapsed && animPhase === 'collapsed') {
      handleTriggerExpand();
    }
  }, [isCollapsed]);

  // Sequenced collapse handler
  const handleTriggerCollapse = () => {
    if (animPhase !== 'expanded') return;
    // Step 1: Content vanishes
    setAnimPhase('collapsing_content');
    setTimeout(() => {
      // Step 2: Container resizes to right-middle
      setAnimPhase('collapsing_resize');
      setTimeout(() => {
        // Step 3: Pill content shows up
        setAnimPhase('collapsed');
        setCollapsed(true);
      }, 260);
    }, 110);
  };

  // Sequenced expand handler
  const handleTriggerExpand = () => {
    if (animPhase !== 'collapsed') return;
    // Step 1: Pill content vanishes
    setAnimPhase('expanding_content');
    setTimeout(() => {
      // Step 2: Container resizes from right-middle back to center
      setAnimPhase('expanding_resize');
      setTimeout(() => {
        // Step 3: Recipe content shows up
        setAnimPhase('expanded');
        setCollapsed(false);
      }, 260);
    }, 90);
  };

  // Toggle collapse state via TAB
  const handleToggle = () => {
    if (animPhase === 'expanded') {
      handleTriggerCollapse();
    } else if (animPhase === 'collapsed') {
      handleTriggerExpand();
    }
  };

  // Keyboard shortcut listener (TAB)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animPhase]);

  const handleLaunch = () => {
    enterPreview('ball-trajectory-predictor', 'Ball Trajectory Predictor');
    setAnimPhase('expanded');
    setCollapsed(false);
  };

  const isDockState = animPhase === 'collapsed' || animPhase === 'collapsing_resize' || animPhase === 'expanding_content';
  const isContentVisible = animPhase === 'expanded';
  const isPillContentVisible = animPhase === 'collapsed';

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 900, height: 620 });

  useEffect(() => {
    if (!stageRef.current) return;
    const update = () => {
      if (stageRef.current) {
        setStageSize({
          width: stageRef.current.clientWidth,
          height: stageRef.current.clientHeight,
        });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  const expandedW = 480;
  const expandedH = 540;
  const dockW = 88;
  const dockH = 38;

  const xExpanded = Math.max(16, Math.round((stageSize.width - expandedW) / 2));
  const yExpanded = Math.max(16, Math.round((stageSize.height - expandedH) / 2));

  const xDock = Math.max(16, Math.round(stageSize.width - 16 - dockW));
  const yDock = Math.max(16, Math.round((stageSize.height - dockH) / 2));

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Live Preview 实时预览规范</h1>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              三级深度参数调节专用模式。按下键盘 <code className="font-mono text-neutral-900 dark:text-neutral-100 font-bold">TAB</code> 键在中央配置面板与右侧 Dock 之间平滑时序变形。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!activePreviewId ? (
            <Button
              variant="primary"
              size="sm"
              isLight={isLight}
              icon={<Eye className="h-4 w-4" />}
              onClick={handleLaunch}
            >
              唤起 Live Preview 会话
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              isLight={isLight}
              icon={<X className="h-4 w-4" />}
              onClick={() => {
                exitPreview();
                setAnimPhase('expanded');
              }}
            >
              退出 Live Preview
            </Button>
          )}
        </div>
      </div>

      {/* Stage Container (Dotted Background Stage) */}
      <div
        ref={stageRef}
        className={`relative w-full min-h-[620px] rounded-2xl border p-6 flex items-center justify-center overflow-hidden transition-colors ${
          isLight 
            ? 'bg-neutral-100/70 border-neutral-200 shadow-inner' 
            : 'bg-neutral-950/80 border-neutral-800 shadow-inner'
        }`}
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#d4d4d8 1px, transparent 1px)'
            : 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Background Field Simulation (Undims when collapsed to right-middle dock) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
            animPhase === 'collapsed' ? 'opacity-100' : 'opacity-25'
          }`}
        >
          <div className="flex flex-col items-center gap-2 select-none">
            <span className="text-5xl animate-bounce">⚽</span>
            <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
              [Three.js Simulation Active: Ball Speed {ballSimSpeed} km/h]
            </span>
            <span className="text-xs text-neutral-400 max-w-md text-center leading-relaxed">
              {animPhase === 'collapsed'
                ? '✨ Live Preview 已收缩至右侧 Dock：背景游戏画面 100% 恢复渲染，无任何黑屏遮挡！'
                : '中央面板展开状态：背景渲染自动变暗降噪，以聚焦精细参数控制器。'}
            </span>
          </div>
        </div>

        {/* 
          Single Morphing Container executing Sequenced Step Transition:
          Four corners smoothly interpolate between expanded center rect and right-middle dock rect.
          Equal-width 4-sided ambient shadow on all borders (offsets: 0, 0).
        */}
        <motion.div
          animate={
            isDockState
              ? {
                  x: xDock,
                  y: yDock,
                  width: dockW,
                  height: dockH,
                  borderRadius: 12,
                }
              : {
                  x: xExpanded,
                  y: yExpanded,
                  width: expandedW,
                  height: expandedH,
                  borderRadius: 16,
                }
          }
          transition={{
            duration: 0.28,
            ease: [0.2, 0.8, 0.25, 1],
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          className={`select-none z-30 transition-shadow overflow-hidden ${
            isDockState
              ? isLight
                ? 'border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_0_16px_rgba(0,0,0,0.15)] cursor-pointer'
                : 'border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_18px_rgba(255,255,255,0.08)] cursor-pointer'
              : isLight
              ? 'border border-neutral-300 bg-white text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
              : 'border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
          }`}
          onClick={isDockState ? handleTriggerExpand : undefined}
          onMouseEnter={() => isDockState && setIsPillHovered(true)}
          onMouseLeave={() => setIsPillHovered(false)}
        >
          {/* Phase 1 & 3: Content inside Expanded Container (Unmounted when in dock state to fully decouple container & content) */}
          {!isDockState && (
            <div
              className={`transition-opacity duration-110 w-full h-full overflow-hidden ${
                isContentVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {isContentVisible && (
                <Layer3BallTrajectoryRecipe
                  isLight={isLight}
                  transparent={true}
                  onBack={() => {
                    exitPreview();
                    setAnimPhase('expanded');
                  }}
                  onCollapsePreview={handleTriggerCollapse}
                />
              )}
            </div>
          )}

          {/* Collapsed Pill Content: '<' | TAB (Strictly centered inside container, decoupled from expanded content) */}
          {isDockState && (
            <div
              className={`absolute inset-0 w-full h-full flex items-center justify-center gap-2 px-2.5 transition-opacity duration-110 ${
                isPillContentVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <motion.div
                animate={{ x: isPillHovered ? -2.5 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={`flex items-center justify-center shrink-0 ${
                  isLight ? 'text-neutral-900' : 'text-neutral-100'
                }`}
              >
                <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
              </motion.div>

              <div className={`h-3.5 w-px ${isLight ? 'bg-neutral-200' : 'bg-neutral-700'}`} />

              <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
            </div>
          )}
        </motion.div>

        {/* State Indicator pill in bottom-left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl border bg-black/50 text-neutral-200 backdrop-blur border-white/10 select-none">
          <span>Live Session:</span>
          <strong className={activePreviewId ? 'text-emerald-400' : 'text-neutral-400'}>
            {activePreviewId ? 'ACTIVE' : 'IDLE'}
          </strong>
          <span>|</span>
          <span>State:</span>
          <strong className="text-neutral-100">
            {animPhase === 'collapsed' ? 'COLLAPSED (Right Dock)' : animPhase === 'expanded' ? 'EXPANDED (Center)' : animPhase.toUpperCase()}
          </strong>
          <span>|</span>
          <span className="flex items-center gap-1">
            切换快捷键: <KeycapBadge shortcut="TAB" size="sm" isLight={false} />
          </span>
        </div>
      </div>

      {/* Code Snippet for Live Preview */}
      <CodeBlock
        isLight={isLight}
        title="Live Preview 连续形变时序实现 (Sequenced Step Transition Recipe)"
        code={`// Live Preview 核心时序引擎规范
// Step 1: Content Fade-Out (110ms)
setAnimPhase('collapsing_content');

// Step 2: Container Resize & Translate to Container Right-Middle (260ms)
setAnimPhase('collapsing_resize');

// Step 3: Dock Pill Show-Up ('<' | TAB, Ambient Out-Glow)
setAnimPhase('collapsed');`}
      />
    </div>
  );
};
