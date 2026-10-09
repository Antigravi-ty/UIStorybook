import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  ArrowRight, 
  Volume2, 
  Check, 
  Info,
  Gamepad2,
  Wrench,
  Settings,
  Ruler,
  Eye,
  AppWindow,
  Play,
  RotateCcw,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { ContainerTransitionMode } from '../../navigation/transitions';
import { Badge } from '../../primitives/Badge';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { MorphContainerContext } from '../../tokens/morphContext';
import { 
  Layer1MainMenuRecipe,
  Layer2PlayRecipe,
  Layer2GarageRecipe,
  Layer2SettingsRecipe,
  Layer2AdditionalPreviewRecipe,
  Layer3AudioDetailRecipe,
  Layer3BallTrajectoryRecipe,
} from '../../recipes';
import { FloatingStackIcon } from '../../navigation/FloatingStackIcon';
import { FloatingWindowManager } from '../../navigation/FloatingWindowManager';
import { floatingStore, useFloatingStore } from '../../tokens/floatingStore';
import { PRESET_WINDOWS, type PresetConfig } from '../../tokens/floatingPresets';
import { UI_EASING } from '../../tokens/easing';

export type ActiveMenuRoute = 
  | 'layer-0' 
  | 'main-menu' 
  | 'play' 
  | 'garage' 
  | 'settings' 
  | 'additional-preview' 
  | 'audio-eq' 
  | 'trajectory';

export interface MenuLayerPreviewPageProps {
  isLight?: boolean;
  onNavigateToReserved?: () => void;
  /** 背景阴影/遮罩过渡时长 (单位: ms)，默认 250ms，允许修改 */
  backdropDuration?: number;
}

// 菜单层级配置与逻辑映射 (纯逻辑层，完全解耦样式)
export interface LayerRouteConfig {
  id: ActiveMenuRoute;
  label: string;
  layer: 0 | 1 | 2 | 3;
  width: number;
  parentRoute?: ActiveMenuRoute; // 所属二级父级菜单（Layer 3 专用）
}

export const MENU_ROUTE_CONFIG: Record<ActiveMenuRoute, LayerRouteConfig> = {
  'layer-0': { id: 'layer-0', label: 'Active Match (Layer 0)', layer: 0, width: 0 },
  'main-menu': { id: 'main-menu', label: 'Main Menu', layer: 1, width: 420 },
  'play': { id: 'play', label: 'Play Modes', layer: 2, width: 680, parentRoute: 'main-menu' },
  'garage': { id: 'garage', label: 'Garage Loadout', layer: 2, width: 680, parentRoute: 'main-menu' },
  'settings': { id: 'settings', label: 'Game Settings', layer: 2, width: 680, parentRoute: 'main-menu' },
  'additional-preview': { id: 'additional-preview', label: 'Additional Preview', layer: 2, width: 680, parentRoute: 'main-menu' },
  'audio-eq': { id: 'audio-eq', label: 'Acoustics & EQ', layer: 3, width: 480, parentRoute: 'settings' },
  'trajectory': { id: 'trajectory', label: 'Ball Trajectory Predictor', layer: 3, width: 480, parentRoute: 'additional-preview' },
};

/**
 * 校验指定三级面板在当前路由上下文下是否允许切换
 * 纯逻辑函数：只有当处于对应二级父级菜单，或已经在该三级菜单内时，才可激活/切换。
 */
export const isLayer3RouteAvailable = (
  panelRoute: ActiveMenuRoute,
  currentRoute: ActiveMenuRoute
): boolean => {
  const cfg = MENU_ROUTE_CONFIG[panelRoute];
  if (!cfg || cfg.layer !== 3) return false;
  if (panelRoute === 'trajectory') {
    return (
      currentRoute === 'settings' ||
      currentRoute === 'additional-preview' ||
      currentRoute === 'trajectory'
    );
  }
  return currentRoute === cfg.parentRoute || currentRoute === panelRoute;
};

export type LivePreviewAnimPhase = 
  | 'expanded'
  | 'collapsing_content'
  | 'collapsing_resize'
  | 'collapsed'
  | 'expanding_content'
  | 'expanding_resize';

export const MenuLayerPreviewPage: React.FC<MenuLayerPreviewPageProps> = ({
  isLight = true,
  onNavigateToReserved,
  backdropDuration = 250,
}) => {
  // 当前预览路由状态（对应独立窗口层级）
  const [currentRoute, setCurrentRoute] = useState<ActiveMenuRoute>('main-menu');
  // 当前过渡动效模式 (流体形变 vs 三段时序分步)
  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph');
  // 目标 Settings 选项卡
  const [settingsTab, setSettingsTab] = useState<string>('gameplay');
  // 后台渲染暂停指示
  const [bgRenderPaused, setBgRenderPaused] = useState<boolean>(true);
  // 交互反馈提示
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // 记录三级菜单的触发父路由（支持从 Settings 或 Additional Preview 返回）
  const [lastParentRoute, setLastParentRoute] = useState<ActiveMenuRoute>('additional-preview');

  // Live Preview 专有时序状态机
  const [liveAnimPhase, setLiveAnimPhase] = useState<LivePreviewAnimPhase>('expanded');
  const [isPillHovered, setIsPillHovered] = useState(false);
  const [ballSimSpeed, setBallSimSpeed] = useState(128);

  // SequencedStep 模式下的三段时序状态 (仅在 sequenced-step 模式下使用)
  const [stepPhase, setStepPhase] = useState<'idle' | 'fadeOut' | 'resize' | 'fadeIn'>('idle');
  const [displayedRoute, setDisplayedRoute] = useState<ActiveMenuRoute>('main-menu');

  // Stage 尺寸引用
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 900, height: 620 });

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2400);
  };

  // 动态监听 Stage 尺寸
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

  // 各层级菜单标准宽度映射 (对标规范)
  const routeWidthMap: Record<ActiveMenuRoute, number> = {
    'layer-0': 0,
    'main-menu': 420,
    'play': 680,
    'garage': 680,
    'settings': 680,
    'additional-preview': 680,
    'audio-eq': 480,
    'trajectory': 480,
  };

  // 路由切换统一入口（支持 SequencedStep 分步与 FluidMorph 连续流体）
  const handleSelectRoute = (targetRoute: ActiveMenuRoute) => {
    if (targetRoute === currentRoute) return;

    // 如果当前处于 Live Preview 收折状态，切出前重置为 expanded
    if (liveAnimPhase !== 'expanded') {
      setLiveAnimPhase('expanded');
    }

    if (transitionMode === 'fluid-morph') {
      setCurrentRoute(targetRoute);
      setDisplayedRoute(targetRoute);
      return;
    }

    // Sequenced-Step 严格三段时序：FadeOut (100ms) -> Resize (150ms) -> FadeIn (100ms)
    setStepPhase('fadeOut');
    setTimeout(() => {
      setCurrentRoute(targetRoute);
      setDisplayedRoute(targetRoute);
      setStepPhase('resize');
      setTimeout(() => {
        setStepPhase('fadeIn');
        setTimeout(() => {
          setStepPhase('idle');
        }, 100);
      }, 150);
    }, 100);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Live Preview 专用时序折叠/展开调度器
  // 核心解耦：内容先淡出 -> 容器绝对几何坐标缩放移动 -> 药丸内容显现，杜绝 FLIP 缩放抽动
  // ──────────────────────────────────────────────────────────────────────────
  const handleTriggerCollapse = () => {
    if (liveAnimPhase !== 'expanded') return;
    setLiveAnimPhase('collapsing_content');
    setTimeout(() => {
      setLiveAnimPhase('collapsing_resize');
      setTimeout(() => {
        setLiveAnimPhase('collapsed');
      }, 260);
    }, 100);
  };

  const handleTriggerExpand = () => {
    if (liveAnimPhase !== 'collapsed') return;
    setLiveAnimPhase('expanding_content');
    setTimeout(() => {
      setLiveAnimPhase('expanding_resize');
      setTimeout(() => {
        setLiveAnimPhase('expanded');
      }, 260);
    }, 80);
  };

  const handleToggleLivePreview = () => {
    if (liveAnimPhase === 'expanded') {
      handleTriggerCollapse();
    } else if (liveAnimPhase === 'collapsed') {
      handleTriggerExpand();
    }
  };

  // 键盘快捷键监听器：
  // 1. TAB 键：在 Layer 3 Live Preview 面板中折叠/展开
  // 2. ESC 键：Layer 0 呼出 Layer 1；Layer 1 退回到 Layer 0；Layer 2 退回到 Layer 1；Layer 3 退回到父级 Layer 2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (currentRoute === 'trajectory') {
          e.preventDefault();
          handleToggleLivePreview();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (currentRoute === 'layer-0') {
          handleSelectRoute('main-menu');
          showToast('ESC: 呼出主菜单 (Layer 1)');
        } else if (currentRoute === 'main-menu') {
          handleSelectRoute('layer-0');
          showToast('ESC: 继续比赛 (返回 Layer 0)');
        } else if (
          currentRoute === 'play' ||
          currentRoute === 'garage' ||
          currentRoute === 'settings' ||
          currentRoute === 'additional-preview'
        ) {
          handleSelectRoute('main-menu');
        } else if (currentRoute === 'audio-eq') {
          handleSelectRoute('settings');
        } else if (currentRoute === 'trajectory') {
          if (liveAnimPhase === 'collapsed') {
            handleTriggerExpand();
          } else {
            handleSelectRoute(lastParentRoute);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoute, liveAnimPhase, lastParentRoute]);

  // 处理在 Additional Preview -> Floating Window 选项卡中点击 '+' 飞入 Stack 动画（委托给统一解耦的 floatingStore 与 FloatingStackIcon）
  const handleAddPresetWindow = (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!stageRef.current) return;
    floatingStore.spawnWithFlight(preset, e.currentTarget, stageRef.current);
    showToast(`✓ 已将 "${preset.title}" 收缩压入右上角 Stack`);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 几何尺寸与坐标计算（绝对坐标空间投影，彻底解决两种动效冲突）
  // ──────────────────────────────────────────────────────────────────────────
  const isDockState = 
    currentRoute === 'trajectory' && 
    (liveAnimPhase === 'collapsed' || liveAnimPhase === 'collapsing_resize' || liveAnimPhase === 'expanding_content');

  const dockW = 88;
  const dockH = 38;
  const expandedW = routeWidthMap[currentRoute] || 480;
  // 针对根菜单拉长高度至 510px（容纳新增的 Additional Previews 选项卡与内衬，避免内容挤压），二级与三级统一 540px
  const expandedH = currentRoute === 'main-menu' ? 510 : 540;

  const xExpanded = Math.max(16, Math.round((stageSize.width - expandedW) / 2));
  const yExpanded = Math.max(16, Math.round((stageSize.height - expandedH) / 2));

  const xDock = Math.max(16, Math.round(stageSize.width - 16 - dockW));
  const yDock = Math.max(16, Math.round((stageSize.height - dockH) / 2));

  const targetX = isDockState ? xDock : xExpanded;
  const targetY = isDockState ? yDock : yExpanded;
  const targetW = isDockState ? dockW : expandedW;
  const targetH = isDockState ? dockH : expandedH;
  const targetRadius = isDockState ? 12 : 16;

  const isContentVisible = 
    currentRoute !== 'layer-0' && 
    !isDockState && 
    (transitionMode === 'fluid-morph' ? liveAnimPhase === 'expanded' : stepPhase !== 'fadeOut' && stepPhase !== 'resize' && liveAnimPhase === 'expanded');

  const isPillContentVisible = liveAnimPhase === 'collapsed';

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 顶部标题与动效切换控制条 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Layer 实时预览</h1>
        </div>

        {/* 右侧轻量控制项：动效模式切换与布局数据导出 */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <button
            type="button"
            onClick={async () => {
              const previewStage = document.getElementById('storybook-preview-stage');
              if (!previewStage) return;

              const winW = window.innerWidth;
              const winH = window.innerHeight;
              const shellEl = previewStage.querySelector<HTMLElement>('[data-morph-container="true"], [data-panel="container"]');
              const headerEl = previewStage.querySelector<HTMLElement>('[data-ui-element="panel-header"]');
              const tabsEl = previewStage.querySelector<HTMLElement>('[role="tablist"]');
              const tabButtons = Array.from(previewStage.querySelectorAll<HTMLElement>('[role="tab"]'));
              const contentEl = previewStage.querySelector<HTMLElement>('[data-ui-element="panel-content"]');
              const footerEl = previewStage.querySelector<HTMLElement>('[data-ui-element="panel-footer"]');

              const getPadStr = (cs: CSSStyleDeclaration) => `top=${cs.paddingTop} right=${cs.paddingRight} bottom=${cs.paddingBottom} left=${cs.paddingLeft}`;
              const getRectStr = (r: DOMRect) => `${Math.round(r.width * 10) / 10}px × ${Math.round(r.height * 10) / 10}px (x: ${Math.round(r.x)}, y: ${Math.round(r.y)})`;

              const lines: string[] = [];
              lines.push('========================================================================');
              lines.push(` [UI STORYBOOK SNAPSHOT] ROUTE: [${currentRoute.toUpperCase()}]`);
              lines.push('========================================================================');
              lines.push(`• Window Viewport: ${winW}px × ${winH}px`);

              if (shellEl) {
                const sRect = shellEl.getBoundingClientRect();
                const sCs = window.getComputedStyle(shellEl);
                lines.push('\n[1. MENU CONTAINER (OUTER SHELL)]');
                lines.push(`  • Size:         ${getRectStr(sRect)}`);
                lines.push(`  • Padding:      ${getPadStr(sCs)}`);
              }

              if (headerEl) {
                const hRect = headerEl.getBoundingClientRect();
                lines.push(`\n[2. PANEL HEADER] Size: ${getRectStr(hRect)} | Title: "${headerEl.querySelector('h1, h2')?.textContent?.trim() || ''}"`);
              }

              if (tabsEl) {
                lines.push(`\n[3. TABS] Total ${tabButtons.length} tab(s)`);
              }

              if (contentEl) {
                const cRect = contentEl.getBoundingClientRect();
                lines.push(`\n[4. PANEL CONTENT] Size: ${getRectStr(cRect)} | ScrollH: ${contentEl.scrollHeight}px`);
              }

              if (footerEl) {
                lines.push(`\n[5. PANEL FOOTER] Content: "${footerEl.textContent?.replace(/\s+/g, ' ').trim() || ''}"`);
              }

              lines.push('========================================================================\n');
              const report = lines.join('\n');
              console.log(report);
              if (navigator.clipboard?.writeText) {
                try {
                  await navigator.clipboard.writeText(report);
                  showToast('✓ 预览布局数据已输出至控制台并复制到剪贴板');
                } catch (_) {
                  showToast('✓ 预览布局数据已输出至控制台');
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-medium transition-all active:scale-95 cursor-pointer bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 shadow-2xs"
            title="打印并复制当前 Storybook 实时预览中元素的尺寸、外边距、内边距数据"
          >
            <Ruler className="h-3.5 w-3.5 text-amber-500" />
            <span>导出当前预览布局数据</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`font-medium ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              过渡动效:
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-neutral-100/70 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setTransitionMode('fluid-morph')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  transitionMode === 'fluid-morph'
                    ? 'bg-amber-500 text-white font-bold shadow-2xs'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Apple HIG 0.28s 连续流体形变"
              >
                FluidMorph (连续流体)
              </button>
              <button
                type="button"
                onClick={() => setTransitionMode('sequenced-step')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  transitionMode === 'sequenced-step'
                    ? 'bg-amber-500 text-white font-bold shadow-2xs'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="100ms 淡出 -> 150ms 尺寸形变 -> 100ms 淡入"
              >
                SequencedStep (三段分步)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 顶部多层级快捷选择器区域：严格按窗口层级划分 (Layer 0, Layer 1, Layer 2, Layer 3) */}
      <div
        className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        {/* Layer 0 选项：零级对局 (无菜单状态) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="neutral" size="sm" isLight={isLight}>
              Layer 0
            </Badge>
            <span>零级对局 (无菜单)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectRoute('layer-0')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'layer-0'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Active Match (零级实时对局 · 无菜单状态)</span>
              <span className="font-mono text-[10px] opacity-75">0px</span>
            </button>
          </div>
        </div>

        {/* Layer 1 选项：一级根菜单 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="primary" size="sm" isLight={isLight}>
              Layer 1
            </Badge>
            <span>一级根菜单</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectRoute('main-menu')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'main-menu'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <span>MENU (主暂停根菜单)</span>
              <span className="font-mono text-[10px] opacity-75">420px</span>
            </button>
          </div>
        </div>

        {/* Layer 2 选项：二级功能菜单 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="warning" size="sm" isLight={isLight}>
              Layer 2
            </Badge>
            <span>二级功能菜单</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectRoute('play')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'play'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Play (模式选择 / 6 种玩法网格)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoute('garage')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'garage'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Garage (车库 / Car, Colour, Anthem, Name)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoute('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'settings'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings (9+1 Tabs 综合设置)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>

            {/* 新增: Additional Preview 二级菜单 */}
            <button
              type="button"
              onClick={() => handleSelectRoute('additional-preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'additional-preview'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Additional Preview (实时预览与悬浮窗沙盒)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>
          </div>
        </div>

        {/* Layer 3 选项：三级独立面板 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="success" size="sm" isLight={isLight}>
              Layer 3
            </Badge>
            <span>三级独立面板</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Layer 3 音频高级均衡器 */}
            {(() => {
              const available = isLayer3RouteAvailable('audio-eq', currentRoute);
              const isActive = currentRoute === 'audio-eq';

              return (
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    if (available) {
                      setLastParentRoute('settings');
                      handleSelectRoute('audio-eq');
                    } else {
                      showToast('逻辑限制: 该三级面板隶属于 Game Settings，当前菜单禁止错误跨层级关联');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white border-emerald-500 font-semibold shadow-2xs cursor-pointer'
                      : available
                      ? isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 cursor-pointer shadow-2xs'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 cursor-pointer shadow-2xs'
                      : 'opacity-40 cursor-not-allowed bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 border-dashed border-neutral-300 dark:border-neutral-700 select-none'
                  }`}
                  title={
                    available
                      ? '点击直接进入 Acoustics & EQ (480px)'
                      : '此三级面板隶属于 Game Settings，当前菜单不可用'
                  }
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Acoustics & EQ (音频高级均衡器)</span>
                  <span className="font-mono text-[10px] opacity-75">480px</span>
                  {!available && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 font-mono">
                      需在 Settings 唤起
                    </span>
                  )}
                </button>
              );
            })()}

            {/* Layer 3 弹道预测器 (Live Preview 支持) */}
            {(() => {
              const available = isLayer3RouteAvailable('trajectory', currentRoute);
              const isActive = currentRoute === 'trajectory';

              return (
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    if (available) {
                      if (currentRoute === 'settings') {
                        setLastParentRoute('settings');
                      } else if (currentRoute === 'additional-preview') {
                        setLastParentRoute('additional-preview');
                      }
                      handleSelectRoute('trajectory');
                    } else {
                      showToast('逻辑限制: 该三级面板隶属于 Settings 或 Additional Preview，当前菜单不可用');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs cursor-pointer'
                      : available
                      ? isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 cursor-pointer shadow-2xs'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 cursor-pointer shadow-2xs'
                      : 'opacity-40 cursor-not-allowed bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 border-dashed border-neutral-300 dark:border-neutral-700 select-none'
                  }`}
                  title={
                    available
                      ? '点击直接进入 Ball Trajectory Predictor (支持 Tab 快捷键 Live Preview)'
                      : '此三级面板隶属于 Settings 或 Additional Preview，当前菜单不可用'
                  }
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ball Trajectory (弹道预测器 · Live Preview)</span>
                  <span className="font-mono text-[10px] opacity-75">480px</span>
                  {!available && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 font-mono">
                      需在 Settings 或 Previews 唤起
                    </span>
                  )}
                </button>
              );
            })()}

            {/* 动态逻辑关联状态提示 */}
            <span className={`text-[11px] font-mono ml-1.5 ${
              currentRoute === 'additional-preview' || currentRoute === 'settings' || currentRoute === 'audio-eq' || currentRoute === 'trajectory'
                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                : isLight
                ? 'text-neutral-500'
                : 'text-neutral-400'
            }`}>
              {currentRoute === 'additional-preview'
                ? '(✓ 已选中 Additional Preview: 三级实时预览面板已就绪)'
                : currentRoute === 'settings'
                ? '(✓ 已选中 Game Settings: 三级音频与弹道面板已就绪)'
                : currentRoute === 'audio-eq'
                ? '(当前处于 Layer 3 独立音频声场面板)'
                : currentRoute === 'trajectory'
                ? `(当前处于 Layer 3 弹道预测器面板，支持 Tab 快捷键收起/展开 Live Preview，返回到 ${lastParentRoute})`
                : '(请先进入 Game Settings 或 Additional Preview 唤起关联三级面板)'}
            </span>
          </div>
        </div>

        {/* 状态与层级指引条 */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
            isLight ? 'bg-neutral-50 text-neutral-600' : 'bg-neutral-950/40 text-neutral-400'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-400">当前活跃窗口:</span>
            <span className="font-bold text-amber-500">
              {currentRoute === 'layer-0' && 'Layer 0: Active Match Gameplay (0px · 零级无菜单状态)'}
              {currentRoute === 'main-menu' && 'Layer 1: MENU (420px)'}
              {currentRoute === 'play' && 'Layer 2: Play Modes (680px)'}
              {currentRoute === 'garage' && 'Layer 2: Garage Loadout (680px)'}
              {currentRoute === 'settings' && 'Layer 2: Game Settings (680px)'}
              {currentRoute === 'additional-preview' && 'Layer 2: Additional Preview (680px · 实时预览与悬浮窗)'}
              {currentRoute === 'audio-eq' && 'Layer 3: Acoustics & EQ (480px)'}
              {currentRoute === 'trajectory' && (
                isDockState
                  ? 'Layer 3: Live Preview Dock Pill (88×38px · 已折叠至侧边)'
                  : 'Layer 3: Ball Trajectory Predictor (480px · Live Preview 展开)'
              )}
            </span>
          </div>

          {feedbackToast && (
            <div className="text-amber-500 font-semibold flex items-center gap-1.5 animate-pulse">
              <Check className="h-3.5 w-3.5" />
              <span>{feedbackToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          核心单一预览引擎舞台 (Unified Live Preview & Floating Windows Stage)
          建立统一绝对几何投影坐标系，彻底消除 FLIP scale 缩放引起的形变抽动与上下文丢失
         ────────────────────────────────────────────────────────────────────────── */}
      <div
        id="storybook-preview-stage"
        ref={stageRef}
        className={`relative min-h-[620px] rounded-2xl border p-6 md:p-10 flex items-center justify-center overflow-hidden transition-colors ${
          isLight 
            ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner' 
            : 'bg-neutral-950/80 border-neutral-800 shadow-inner'
        }`}
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#d4d4d8 1px, transparent 1px)'
            : 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* 背景对局/球场模拟仿真环境 (当处于 Layer 0 或 Live Preview 折叠药丸状态时，100% 恢复渲染) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
            currentRoute === 'layer-0' || isDockState ? 'opacity-100' : 'opacity-25'
          }`}
        >
          <div className="flex flex-col items-center gap-2 select-none">
            <span className="text-5xl animate-bounce">⚽</span>
            <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
              [Three.js Simulation Active: Ball Speed {ballSimSpeed} km/h]
            </span>
            <span className="text-xs text-neutral-400 max-w-md text-center leading-relaxed">
              {currentRoute === 'layer-0'
                ? '✨ Layer 0 状态：对局中无任何菜单遮挡，背景画面 100% 实时渲染。按 ESC 或点击下方按钮呼出主菜单。'
                : isDockState
                ? '✨ Live Preview 已收缩至右侧 Dock 药丸：背景画面 100% 恢复渲染，无黑屏遮挡！'
                : '中央面板展开状态：背景渲染自动变暗降噪，以聚焦精细参数控制器。'}
            </span>
          </div>
        </div>

        {/* 二级/三级菜单背景变暗遮罩 (Layer 0 与 Dock 状态完全透明，处于底层 z-10) */}
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-none z-10"
          style={{
            backgroundColor:
              currentRoute === 'layer-0' || isDockState || currentRoute === 'main-menu'
                ? 'transparent'
                : 'rgba(0, 0, 0, 0.55)',
            transition: `background-color ${backdropDuration}ms cubic-bezier(0.2, 0.8, 0.25, 1)`,
          }}
        />



        {/* 舞台右上角常驻 Floating Stack Icon 栈托盘 */}
        <FloatingStackIcon isLight={isLight} absolute={true} containerRef={stageRef} />

        {/* 舞台内悬浮窗口管理器 */}
        <FloatingWindowManager isLight={isLight} containerRef={stageRef} />

        {/* 
          Layer 0 零级对局快捷呼出提示条 (仅在 Layer 0 时呈现)
        */}
        {currentRoute === 'layer-0' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md select-none transition-all shadow-xl bg-neutral-900/90 text-neutral-100 border-neutral-700/80">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-bold font-mono">Active Match (Layer 0 · In-Game Arena)</span>
              <span className="text-[11px] text-neutral-400">当前处于无菜单对局状态，按键盘 ESC 键或点击右侧呼出菜单</span>
            </div>
            <div className="h-4 w-px bg-neutral-700" />
            <button
              type="button"
              onClick={() => handleSelectRoute('main-menu')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <KeycapBadge shortcut="ESC" size="sm" isLight={false} />
              <span>呼出主菜单</span>
            </button>
          </div>
        )}

        {/* 
          统一形态解耦容器 (Decoupled Stage Container)
          - 采用绝对几何投影坐标 (x, y, width, height, borderRadius)
          - 不依赖 Framer Motion layout FLIP，杜绝缩放矩阵破坏子元素
          - 水平层级流转与空间折叠共用同一个平滑物理插值管道
        */}
        {currentRoute !== 'layer-0' && (
          <MorphContainerContext.Provider value={true}>
            <motion.div
              data-morph-container="true"
              data-panel="container"
              initial={false}
              animate={{
                x: targetX,
                y: targetY,
                width: targetW,
                height: targetH,
                borderRadius: targetRadius,
                opacity: 1,
              }}
              transition={{
                duration: 0.28,
                ease: [0.2, 0.8, 0.25, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              className={`select-none z-30 transition-shadow overflow-hidden flex flex-col ${
                isDockState
                  ? isLight
                    ? 'border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_0_16px_rgba(0,0,0,0.15)] cursor-pointer'
                    : 'border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_18px_rgba(255,255,255,0.08)] cursor-pointer'
                  : isLight
                  ? 'border border-neutral-300/80 bg-neutral-50/98 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
                  : 'border border-neutral-700/60 bg-neutral-900/98 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
              }`}
              onClick={isDockState ? handleTriggerExpand : undefined}
              onMouseEnter={() => isDockState && setIsPillHovered(true)}
              onMouseLeave={() => setIsPillHovered(false)}
            >
              {/* 
                状态 1: 折叠收纳药丸状态 (Dock Pill Content)
                仅在 isDockState 下渲染，包含 '<' 与 TAB 键位徽章
              */}
              {isDockState ? (
                <div
                  className={`w-full h-full flex items-center justify-between px-3 cursor-pointer select-none transition-opacity duration-150 ${
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
              ) : (
                /* 
                  状态 2: 展开菜单内容区域 (Expanded Menu Recipes)
                  通过时序透明度完全与容器尺寸解耦，防止尺寸过渡期间内容抽动
                */
                <div
                  className={`w-full h-full flex flex-col transition-opacity ${
                    isContentVisible ? 'opacity-100 pointer-events-auto duration-150' : 'opacity-0 pointer-events-none duration-100'
                  }`}
                >
                  {/* Layer 1 根菜单 */}
                  {displayedRoute === 'main-menu' && (
                    <Layer1MainMenuRecipe
                      isLight={isLight}
                      onResume={() => {
                        handleSelectRoute('layer-0');
                        showToast('进入零级对局 (Layer 0 · 无菜单状态)');
                      }}
                      onNavigatePlay={() => handleSelectRoute('play')}
                      onNavigateGarage={() => handleSelectRoute('garage')}
                      onNavigateSettings={(tab) => {
                        if (tab) setSettingsTab(tab);
                        handleSelectRoute('settings');
                      }}
                      onNavigatePreviews={() => handleSelectRoute('additional-preview')}
                      backgroundRenderPaused={bgRenderPaused}
                    />
                  )}

                  {/* Layer 2: Play Modes */}
                  {displayedRoute === 'play' && (
                    <Layer2PlayRecipe
                      isLight={isLight}
                      onBack={() => handleSelectRoute('main-menu')}
                      onSelectMode={(m) => showToast(`选择了玩法模式: ${m}`)}
                    />
                  )}

                  {/* Layer 2: Garage */}
                  {displayedRoute === 'garage' && (
                    <Layer2GarageRecipe
                      isLight={isLight}
                      onBack={() => handleSelectRoute('main-menu')}
                    />
                  )}

                  {/* Layer 2: Settings */}
                  {displayedRoute === 'settings' && (
                    <Layer2SettingsRecipe
                      isLight={isLight}
                      onBack={() => handleSelectRoute('main-menu')}
                      initialTab={settingsTab}
                      backgroundRenderPaused={bgRenderPaused}
                      onToggleBackgroundRender={setBgRenderPaused}
                      onNavigateAudioDetail={() => {
                        setLastParentRoute('settings');
                        handleSelectRoute('audio-eq');
                      }}
                      onNavigateTrajectoryDetail={() => {
                        setLastParentRoute('settings');
                        handleSelectRoute('trajectory');
                      }}
                    />
                  )}

                  {/* Layer 2: Additional Preview (Live Preview & Floating Window 沙盒) */}
                  {displayedRoute === 'additional-preview' && (
                    <Layer2AdditionalPreviewRecipe
                      isLight={isLight}
                      onBack={() => handleSelectRoute('main-menu')}
                      onNavigateLivePreview={() => {
                        setLastParentRoute('additional-preview');
                        handleSelectRoute('trajectory');
                      }}
                      onAddPresetWindow={handleAddPresetWindow}
                    />
                  )}

                  {/* Layer 3: Audio Detail EQ */}
                  {displayedRoute === 'audio-eq' && (
                    <Layer3AudioDetailRecipe
                      isLight={isLight}
                      onBack={() => handleSelectRoute('settings')}
                    />
                  )}

                  {/* Layer 3: Ball Trajectory Predictor (Live Preview enabled) */}
                  {displayedRoute === 'trajectory' && (
                    <Layer3BallTrajectoryRecipe
                      isLight={isLight}
                      transparent={true}
                      onBack={() => {
                        setLiveAnimPhase('expanded');
                        handleSelectRoute(lastParentRoute);
                      }}
                      onCollapsePreview={handleTriggerCollapse}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </MorphContainerContext.Provider>
        )}
      </div>

      {/* 底部引导栏 */}
      {onNavigateToReserved && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-500 shrink-0" />
            <span className={isLight ? 'text-neutral-600' : 'text-neutral-400'}>
              赛后结算 (Match Post) 与遥测数据 (Match Stats) 等暂未纳入主对局的候选模板已保留在候选页面。
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToReserved}
            className="flex items-center gap-1 font-semibold text-amber-500 hover:text-amber-400 cursor-pointer shrink-0 transition-colors"
          >
            <span>查看预留战报规范</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
