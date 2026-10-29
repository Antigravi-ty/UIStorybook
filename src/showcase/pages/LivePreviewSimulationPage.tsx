import React, { useState as useLocalState, useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:live-preview');
import { Eye, X } from 'lucide-react';
import { Button } from '../../primitives/Button';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { CodeBlock } from '../CodeBlock';
import { useLivePreviewStore } from '../../tokens/livePreviewStore';
import { MorphingStageShell } from '../../navigation/MorphingShell';
import { Layer3BallTrajectoryRecipe } from '../../recipes/Layer3BallTrajectoryRecipe';

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
  const [isPillHovered, setIsPillHovered] = useLocalState(false);
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
  const [stageSize, setStageSize] = useLocalState({ width: 900, height: 620 });

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
            <span className={`text-5xl ${animPhase === 'collapsed' ? 'animate-bounce' : ''}`}>⚽</span>
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

        <MorphingStageShell
          isLight={isLight}
          targetX={isDockState ? xDock : xExpanded}
          targetY={isDockState ? yDock : yExpanded}
          targetW={isDockState ? dockW : expandedW}
          targetH={isDockState ? dockH : expandedH}
          targetRadius={isDockState ? 12 : 16}
          isDockState={isDockState}
          isPillHovered={isPillHovered}
          onPillHoverChange={setIsPillHovered}
          isPillContentVisible={isPillContentVisible}
          isContentVisible={isContentVisible}
          onExpandFromDock={handleTriggerExpand}
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
        </MorphingStageShell>

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
