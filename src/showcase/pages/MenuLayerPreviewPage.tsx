import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ChevronLeft,
  X,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MorphContainer, ContainerTransitionMode } from '../../navigation/transitions';
import { Badge } from '../../primitives/Badge';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { 
  Layer1MainMenuRecipe,
  Layer2PlayRecipe,
  Layer2GarageRecipe,
  Layer2SettingsRecipe,
  Layer2AdditionalPreviewRecipe,
  Layer3AudioDetailRecipe,
  Layer3BallTrajectoryRecipe,
  PresetConfig,
} from '../../recipes';
import { FloatingStackIcon } from '../../navigation/FloatingStackIcon';
import { FloatingWindowManager } from '../../navigation/FloatingWindowManager';
import { floatingStore } from '../../tokens/floatingStore';

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
  'layer-0': { id: 'layer-0', label: 'Layer 0 (In-Game / No Menu)', layer: 0, width: 0 },
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
    return currentRoute === 'additional-preview' || currentRoute === 'settings' || currentRoute === 'trajectory';
  }
  return currentRoute === cfg.parentRoute || currentRoute === panelRoute;
};

export type LivePreviewPhase = 
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
  // 当前预览路由状态（对应独立窗口层级，支持 Layer 0 对局态）
  const [currentRoute, setCurrentRoute] = useState<ActiveMenuRoute>('main-menu');
  // 记录从哪个二级菜单跳转进入三级面板（以便 onBack 返回正确父级）
  const previousParentRouteRef = useRef<ActiveMenuRoute>('additional-preview');

  // 当前过渡动效模式 (流体形变 vs 三段时序分步)
  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph');
  // 目标 Settings 选项卡
  const [settingsTab, setSettingsTab] = useState<string>('gameplay');
  // 后台渲染暂停指示 (在 Layer 0 时自动恢复渲染)
  const [bgRenderPaused, setBgRenderPaused] = useState<boolean>(true);
  // 交互反馈提示
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // 舞台容器引用与尺寸追踪
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 900, height: 620 });

  // Layer 3 Live Preview 时序与停靠状态
  const [livePreviewPhase, setLivePreviewPhase] = useState<LivePreviewPhase>('expanded');
  const [isDockHovered, setIsDockHovered] = useState(false);

  // Floating Window '+' 点击飞入右上角 Stack 的 Ghost 动画状态
  const [flyingGhost, setFlyingGhost] = useState<{
    id: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    destX: number;
    destY: number;
  } | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2200);
  };

  // 舞台尺寸监听
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

  const handleSelectRoute = (route: ActiveMenuRoute) => {
    if (route === 'trajectory') {
      if (currentRoute === 'settings') {
        previousParentRouteRef.current = 'settings';
      } else if (currentRoute === 'additional-preview') {
        previousParentRouteRef.current = 'additional-preview';
      }
      // 切换至 trajectory 时确保初始处于 expanded 状态
      setLivePreviewPhase('expanded');
    } else {
      // 离开 trajectory 时重置 live preview 状态
      setLivePreviewPhase('expanded');
    }

    if (route === 'layer-0') {
      setBgRenderPaused(false);
      showToast('进入 Layer 0: 对局实时渲染中 (按 ESC 键恢复菜单)');
    } else if (currentRoute === 'layer-0') {
      setBgRenderPaused(true);
    }

    setCurrentRoute(route);
  };

  // Live Preview 时序折叠调度
  const handleCollapseLivePreview = () => {
    if (livePreviewPhase !== 'expanded') return;
    setLivePreviewPhase('collapsing_content');
    setTimeout(() => {
      setLivePreviewPhase('collapsing_resize');
      setTimeout(() => {
        setLivePreviewPhase('collapsed');
      }, 260);
    }, 110);
  };

  // Live Preview 时序展开调度
  const handleExpandLivePreview = () => {
    if (livePreviewPhase !== 'collapsed') return;
    setLivePreviewPhase('expanding_content');
    setTimeout(() => {
      setLivePreviewPhase('expanding_resize');
      setTimeout(() => {
        setLivePreviewPhase('expanded');
      }, 260);
    }, 90);
  };

  const handleToggleLivePreview = () => {
    if (livePreviewPhase === 'expanded') {
      handleCollapseLivePreview();
    } else if (livePreviewPhase === 'collapsed') {
      handleExpandLivePreview();
    }
  };

  // 键盘快捷键监听：TAB 响应 Live Preview 收起/展开，ESC 响应逐级返回与 Layer 0 切换
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Tab') {
        if (currentRoute === 'trajectory') {
          e.preventDefault();
          handleToggleLivePreview();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (currentRoute === 'trajectory') {
          if (livePreviewPhase === 'collapsed') {
            handleExpandLivePreview();
          } else {
            handleSelectRoute(previousParentRouteRef.current || 'additional-preview');
          }
        } else if (
          currentRoute === 'play' || 
          currentRoute === 'garage' || 
          currentRoute === 'settings' || 
          currentRoute === 'additional-preview'
        ) {
          handleSelectRoute('main-menu');
        } else if (currentRoute === 'audio-eq') {
          handleSelectRoute('settings');
        } else if (currentRoute === 'main-menu') {
          handleSelectRoute('layer-0');
        } else if (currentRoute === 'layer-0') {
          handleSelectRoute('main-menu');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoute, livePreviewPhase]);

  // Floating Window '+' 点击生成动画并入栈
  const handleSpawnPresetWindow = (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!stageRef.current) {
      floatingStore.spawnWindow({
        id: `${preset.id}-${Date.now().toString().slice(-4)}`,
        title: preset.title,
        category: preset.category,
        width: preset.width,
        height: preset.height,
        resizable: preset.resizable,
        startMinimized: true,
      });
      showToast(`✓ 已将 "${preset.title}" 窗口收纳至右上角 Stack`);
      return;
    }

    const btnRect = e.currentTarget.getBoundingClientRect();
    const stageRect = stageRef.current.getBoundingClientRect();

    const startX = Math.round(btnRect.left - stageRect.left);
    const startY = Math.round(btnRect.top - stageRect.top);
    const startW = Math.round(btnRect.width);
    const startH = Math.round(btnRect.height);

    const destX = Math.round(stageRect.width - 56);
    const destY = 16;

    const ghostId = `${preset.id}-${Date.now()}`;
    setFlyingGhost({
      id: ghostId,
      startX,
      startY,
      startW,
      startH,
      destX,
      destY,
    });

    setTimeout(() => {
      floatingStore.spawnWindow({
        id: `${preset.id}-${Date.now().toString().slice(-4)}`,
        title: preset.title,
        category: preset.category,
        width: preset.width,
        height: preset.height,
        resizable: preset.resizable,
        startMinimized: true,
      });
      setFlyingGhost(null);
      showToast(`✓ 已将 "${preset.title}" 窗口收纳至右上角 Stack`);
    }, 280);
  };

  // Live Preview 停靠尺寸与坐标计算
  const isDockState = livePreviewPhase === 'collapsed' || livePreviewPhase === 'collapsing_resize' || livePreviewPhase === 'expanding_content';
  const dockW = 88;
  const dockH = 38;
  const expandedW = 480;
  const expandedH = 540;

  const xExpanded = Math.max(16, Math.round((stageSize.width - expandedW) / 2));
  const yExpanded = Math.max(16, Math.round((stageSize.height - expandedH) / 2));
  const xDock = Math.max(16, Math.round(stageSize.width - 16 - dockW));
  const yDock = Math.max(16, Math.round((stageSize.height - dockH) / 2));

  // 背景遮罩颜色计算：Layer 0 无遮罩；Layer 1 透明不压暗；Live Preview 折叠时透明
  const getBackdropBg = () => {
    if (currentRoute === 'layer-0') return 'transparent';
    if (currentRoute === 'main-menu') return 'transparent';
    if (currentRoute === 'trajectory' && isDockState) return 'transparent';
    return 'rgba(0, 0, 0, 0.55)';
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 顶部标题与动效切换控制条：无冗余介绍，纯净标题 */}
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
              const cards = Array.from(previewStage.querySelectorAll<HTMLElement>('button[data-ui-element="car-card"], .grid button'));

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
                lines.push(`  • Inline/CSS W: ${shellEl.style.width || sCs.width} (Max-W: ${sCs.maxWidth})`);
                lines.push(`  • Padding:      ${getPadStr(sCs)}`);
              }

              if (headerEl) {
                const hRect = headerEl.getBoundingClientRect();
                const hCs = window.getComputedStyle(headerEl);
                lines.push('\n[2. PANEL HEADER]');
                lines.push(`  • Size:         ${getRectStr(hRect)}`);
                lines.push(`  • Title:        "${headerEl.querySelector('h2, h1')?.textContent?.trim() || ''}"`);
              }

              if (tabsEl) {
                const tRect = tabsEl.getBoundingClientRect();
                lines.push('\n[3. UNDERLINE TABS]');
                lines.push(`  • Tablist Size: ${getRectStr(tRect)}`);
                lines.push(`  • Tab Count:    ${tabButtons.length} tab(s)`);
              }

              if (contentEl) {
                const cRect = contentEl.getBoundingClientRect();
                lines.push('\n[4. PANEL CONTENT (BODY)]');
                lines.push(`  • Size:         ${getRectStr(cRect)}`);
              }

              if (footerEl) {
                const fRect = footerEl.getBoundingClientRect();
                lines.push('\n[5. PANEL FOOTER]');
                lines.push(`  • Size:         ${getRectStr(fRect)}`);
                lines.push(`  • Content:      "${footerEl.textContent?.replace(/\s+/g, ' ').trim() || ''}"`);
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

      {/* 顶部多层级快捷选择器区域：严格按窗口层级划分 (0, 1, 2, 3) */}
      <div
        className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        {/* Layer 0 选项：对局层 / 隐匿 (无菜单) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="neutral" size="sm" isLight={isLight}>
              Layer 0
            </Badge>
            <span>对局层 (无菜单)</span>
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
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>IN-GAME ARENA (恢复对局 · 隐匿菜单)</span>
              <span className="font-mono text-[10px] opacity-75">Layer 0</span>
            </button>
          </div>
        </div>

        {/* Layer 1 选项 */}
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

        {/* Layer 2 选项：展示根菜单下的二级功能菜单 */}
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
              <span>Play (模式选择)</span>
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
              <span>Garage (车库)</span>
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
              <span>Settings (综合设置)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>

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
              <Sparkles className="h-3.5 w-3.5" />
              <span>Additional Preview (Live Preview & Floating Window)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>
          </div>
        </div>

        {/* Layer 3 选项：深度独立面板 */}
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
                      handleSelectRoute('trajectory');
                    } else {
                      showToast('逻辑限制: 该三级面板隶属于 Additional Preview / Settings，请先进入对应二级菜单');
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
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ball Trajectory (弹道预测器 · Live Preview)</span>
                  <span className="font-mono text-[10px] opacity-75">480px</span>
                  {!available && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 font-mono">
                      需在 Preview/Settings 唤起
                    </span>
                  )}
                </button>
              );
            })()}

            {/* 动态逻辑关联状态提示 */}
            <span className={`text-[11px] font-mono ml-1.5 ${
              currentRoute === 'settings' || currentRoute === 'additional-preview' || currentRoute === 'audio-eq' || currentRoute === 'trajectory'
                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                : isLight
                ? 'text-neutral-500'
                : 'text-neutral-400'
            }`}>
              {currentRoute === 'layer-0'
                ? '(当前处于 Layer 0 对局态 · 菜单已隐藏)'
                : currentRoute === 'additional-preview'
                ? '(✓ 已选中 Additional Preview: 三级 Live Preview 已就绪)'
                : currentRoute === 'settings'
                ? '(✓ 已选中 Game Settings: 三级音频与弹道面板已就绪)'
                : currentRoute === 'audio-eq'
                ? '(当前处于 Layer 3 独立音频声场面板)'
                : currentRoute === 'trajectory'
                ? '(当前处于 Layer 3 弹道面板 · 按 TAB 键可折叠至右侧 Dock)'
                : '(请先进入二级菜单以唤起关联三级面板)'}
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
            <span className="text-neutral-400">当前活跃状态:</span>
            <span className="font-bold text-amber-500">
              {currentRoute === 'layer-0' && 'Layer 0: In-Game Arena Active (无菜单 · 实时对局)'}
              {currentRoute === 'main-menu' && 'Layer 1: MENU (420px)'}
              {currentRoute === 'play' && 'Layer 2: Play Modes (680px)'}
              {currentRoute === 'garage' && 'Layer 2: Garage Loadout (680px)'}
              {currentRoute === 'settings' && 'Layer 2: Game Settings (680px)'}
              {currentRoute === 'additional-preview' && 'Layer 2: Additional Preview (680px)'}
              {currentRoute === 'audio-eq' && 'Layer 3: Acoustics & EQ (480px)'}
              {currentRoute === 'trajectory' && (
                isDockState
                  ? 'Layer 3: Ball Trajectory (88px · Collapsed to Right Dock · TAB to expand)'
                  : 'Layer 3: Ball Trajectory Predictor (480px · Live Preview · TAB to collapse)'
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

      {/* 核心单一预览引擎容器 (Single-Container Live Preview Stage) */}
      <div
        id="storybook-preview-stage"
        ref={stageRef}
        className={`relative min-h-[580px] rounded-2xl border p-6 md:p-10 flex items-center justify-center overflow-hidden transition-colors ${
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
        {/* 背景球场物理模拟指示 (在 Layer 0 或 Live Preview 折叠时 100% 显现) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
            currentRoute === 'layer-0' || (currentRoute === 'trajectory' && isDockState)
              ? 'opacity-100'
              : 'opacity-20'
          }`}
        >
          <div className="flex flex-col items-center gap-2 select-none">
            <span className="text-5xl animate-bounce">⚽</span>
            <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
              [Arena 3D Physics Simulation · 120Hz Active]
            </span>
            <span className="text-xs text-neutral-400 max-w-md text-center leading-relaxed">
              {currentRoute === 'layer-0'
                ? '⚽ 对局实时运行中：背景画面 100% 渲染，无菜单遮挡。按 ESC 或点击画面呼出主菜单。'
                : currentRoute === 'trajectory' && isDockState
                ? '✨ Live Preview 已收缩至右侧 Dock：背景游戏画面完全呈现，可实时观测 3D 轨迹！'
                : '中央菜单展开状态：背景渲染变暗以聚焦参数配置。'}
            </span>
          </div>
        </div>

        {/* 二级/三级菜单背景变暗遮罩 */}
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-none"
          style={{
            backgroundColor: getBackdropBg(),
            transition: `background-color ${backdropDuration}ms cubic-bezier(0.2, 0.8, 0.25, 1)`,
          }}
        />

        {/* Layer 0 对局态：无菜单时的可点击全屏遮罩 */}
        {currentRoute === 'layer-0' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-end pb-8 cursor-pointer select-none z-10"
            onClick={() => handleSelectRoute('main-menu')}
            title="点击唤起主暂停菜单 (Layer 1: MENU)"
          >
            <div
              className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border backdrop-blur-md transition-all active:scale-95 ${
                isLight
                  ? 'bg-white/90 border-neutral-300 text-neutral-900 shadow-lg'
                  : 'bg-neutral-900/90 border-neutral-700 text-neutral-100 shadow-2xl'
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-semibold">
                Layer 0 对局进行中 · 点击画面或按下
              </span>
              <KeycapBadge shortcut="ESC" size="sm" isLight={isLight} />
              <span className="font-mono text-xs font-semibold">呼出菜单</span>
            </div>
          </div>
        )}

        {/* 
          常驻悬浮窗口管理器与右上角 Stack 图标：
          在当前舞台内独立运行，支持在 Layer 0、Layer 1、Layer 2 下随时打开与拖动
        */}
        <FloatingStackIcon isLight={isLight} absolute={true} containerRef={stageRef} />
        <FloatingWindowManager isLight={isLight} containerRef={stageRef} />

        {/* Floating Window '+' 点击飞入动画 Ghost 容器 */}
        <AnimatePresence>
          {flyingGhost && (
            <motion.div
              key={flyingGhost.id}
              initial={{
                x: flyingGhost.startX,
                y: flyingGhost.startY,
                width: flyingGhost.startW,
                height: flyingGhost.startH,
                borderRadius: 8,
                opacity: 0.9,
              }}
              animate={{
                x: flyingGhost.destX,
                y: flyingGhost.destY,
                width: 40,
                height: 40,
                borderRadius: 12,
                opacity: 0,
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
              className={`z-50 pointer-events-none border backdrop-blur-md ${
                isLight
                  ? 'bg-neutral-900 border-neutral-800 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_0_16px_rgba(0,0,0,0.2)]'
                  : 'bg-neutral-100 border-neutral-300 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_16px_rgba(255,255,255,0.1)]'
              }`}
            />
          )}
        </AnimatePresence>

        {/* 
          Layer 3 Live Preview 停靠容器 (当 currentRoute === 'trajectory' 且处于折叠过渡/已折叠态时激活):
          使用 2D 绝对坐标进行解耦平滑过渡，杜绝与 MorphContainer 的 1D 宽度流体形变产生布局抽动冲突！
        */}
        {currentRoute === 'trajectory' && isDockState && (
          <motion.div
            initial={{
              x: xExpanded,
              y: yExpanded,
              width: expandedW,
              height: expandedH,
              borderRadius: 16,
            }}
            animate={{
              x: xDock,
              y: yDock,
              width: dockW,
              height: dockH,
              borderRadius: 12,
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
            className={`select-none z-30 transition-shadow overflow-hidden ${
              isLight
                ? 'border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_0_16px_rgba(0,0,0,0.15)] cursor-pointer'
                : 'border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_18px_rgba(255,255,255,0.08)] cursor-pointer'
            }`}
            onClick={handleExpandLivePreview}
            onMouseEnter={() => setIsDockHovered(true)}
            onMouseLeave={() => setIsDockHovered(false)}
            title="点击或按下 TAB 展开 Live Preview 面板"
          >
            <div
              className={`absolute inset-0 w-full h-full flex items-center justify-center gap-2 px-2.5 transition-opacity duration-110 ${
                livePreviewPhase === 'collapsed' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <motion.div
                animate={{ x: isDockHovered ? -2.5 : 0 }}
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
          </motion.div>
        )}

        {/* 
          核心单一 MorphContainer (负责 Layer 1, Layer 2, Layer 3 展开态的层级流体尺寸形变):
          在 Layer 0 或 Layer 3 折叠态时保持隐藏，避免多控制器冲突
        */}
        {currentRoute !== 'layer-0' && !(currentRoute === 'trajectory' && isDockState) && (
          <MorphContainer
            currentKey={currentRoute}
            width={routeWidthMap[currentRoute]}
            mode={transitionMode}
            isLight={isLight}
            className={`rounded-2xl ${
              isLight
                ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
                : 'shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
            }`}
          >
            {/* Layer 1 根菜单 */}
            {currentRoute === 'main-menu' && (
              <Layer1MainMenuRecipe
                isLight={isLight}
                onResume={() => handleSelectRoute('layer-0')}
                onNavigatePlay={() => handleSelectRoute('play')}
                onNavigateGarage={() => handleSelectRoute('garage')}
                onNavigateSettings={(tab) => {
                  if (tab) setSettingsTab(tab);
                  handleSelectRoute('settings');
                }}
                onNavigateAdditionalPreview={() => handleSelectRoute('additional-preview')}
                backgroundRenderPaused={bgRenderPaused}
              />
            )}

            {/* Layer 2: Play Modes */}
            {currentRoute === 'play' && (
              <Layer2PlayRecipe
                isLight={isLight}
                onBack={() => handleSelectRoute('main-menu')}
                onSelectMode={(m) => showToast(`选择了玩法模式: ${m}`)}
              />
            )}

            {/* Layer 2: Garage */}
            {currentRoute === 'garage' && (
              <Layer2GarageRecipe
                isLight={isLight}
                onBack={() => handleSelectRoute('main-menu')}
              />
            )}

            {/* Layer 2: Settings */}
            {currentRoute === 'settings' && (
              <Layer2SettingsRecipe
                isLight={isLight}
                onBack={() => handleSelectRoute('main-menu')}
                initialTab={settingsTab}
                backgroundRenderPaused={bgRenderPaused}
                onToggleBackgroundRender={setBgRenderPaused}
                onNavigateAudioDetail={() => handleSelectRoute('audio-eq')}
                onNavigateTrajectoryDetail={() => handleSelectRoute('trajectory')}
              />
            )}

            {/* Layer 2: Additional Preview */}
            {currentRoute === 'additional-preview' && (
              <Layer2AdditionalPreviewRecipe
                isLight={isLight}
                onBack={() => handleSelectRoute('main-menu')}
                onNavigateLivePreview={() => handleSelectRoute('trajectory')}
                onSpawnPresetWindow={handleSpawnPresetWindow}
              />
            )}

            {/* Layer 3: Audio Detail EQ */}
            {currentRoute === 'audio-eq' && (
              <Layer3AudioDetailRecipe
                isLight={isLight}
                onBack={() => handleSelectRoute('settings')}
              />
            )}

            {/* Layer 3: Ball Trajectory Predictor Configuration (Live Preview enabled) */}
            {currentRoute === 'trajectory' && (
              <div
                className={`transition-opacity duration-110 w-full flex flex-col ${
                  livePreviewPhase === 'collapsing_content' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <Layer3BallTrajectoryRecipe
                  isLight={isLight}
                  onBack={() => handleSelectRoute(previousParentRouteRef.current || 'additional-preview')}
                  onCollapsePreview={handleCollapseLivePreview}
                />
              </div>
            )}
          </MorphContainer>
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
