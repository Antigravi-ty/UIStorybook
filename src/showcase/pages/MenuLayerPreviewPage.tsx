import React, { useState as useLocalState, useEffect, useRef } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { ContainerTransitionMode } from '../../navigation/transitions';
import type { MenuPanelWidthAdaptiveMode } from '../../navigation/menuPanelAdaptive';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { readUrlParams, updateUrlParams } from '../stores/urlSync';
import { useViewportStore } from '../../viewport/viewportStore';
const useState = createScopedSyncedState('page:menu-layer-v2');
import { floatingStore, useFloatingStore } from '../../tokens/floatingStore';
import { type PresetConfig } from '../../tokens/floatingPresets';
import { resolveLayer1ContextSpec, type Layer1MenuContextMode, } from '../../recipes/Layer1MainMenuRecipe';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import {
  type ActiveMenuRoute, type LayerRouteConfig, type LivePreviewAnimPhase, type MenuVisibilityTier,
  ROUTE_TO_PANEL_ID, MENU_SANDBOX_JUMP_ITEMS, MENU_ROUTE_CONFIG, SETTINGS_QUICK_TABS,
  isLayer3RouteAvailable,
} from './menu-layer/menuLayerRouteConfig';
import { MenuLayerRouteSelectorBar } from './menu-layer/MenuLayerRouteSelectorBar';
import { MenuLayerTopHeaderBar, MenuLayerAdaptiveControlDeck, } from './menu-layer/MenuLayerAdaptiveControlDeck';
import { MenuLayerStageCanvas } from './menu-layer/MenuLayerStageCanvas';
import { useMenuLayerAdaptiveMetrics } from './menu-layer/useMenuLayerAdaptiveMetrics';
import type { ShowcaseTab } from '../Sidebar';
export {
  type ActiveMenuRoute,
  type LayerRouteConfig,
  type LivePreviewAnimPhase,
  type MenuVisibilityTier,
  ROUTE_TO_PANEL_ID,
  MENU_SANDBOX_JUMP_ITEMS,
  MENU_ROUTE_CONFIG,
  SETTINGS_QUICK_TABS,
  isLayer3RouteAvailable,
};

export interface MenuLayerPreviewPageProps {
  isLight?: boolean;
  onNavigateToReserved?: () => void;
  onNavigateToPlayCards?: () => void;
  /** 跨页面带锚点跳转回调：从 7A 直接跳转到当前激活节点对应的独立调优页 (6A / L1 / L2 等) 并滚动定位 */
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  /** 背景阴影/遮罩过渡时长 (单位: ms)，默认 250ms，允许修改 */
  backdropDuration?: number;
}

export const MenuLayerPreviewPage: React.FC<MenuLayerPreviewPageProps> = ({
  isLight = true,
  onNavigateToReserved,
  onNavigateToPlayCards,
  onNavigateShowcase,
  backdropDuration = 250,
}) => {
  const { renderScale } = useViewportStore();
  const contentScale = renderScale / 100;
  const [rawVisibilityTier, setVisibilityTier] = useState<MenuVisibilityTier>(() => {
    const p = readUrlParams();
    return p.tier === 'developer' ? 'developer' : 'user';
  }, 'visibilityTier');
  const visibilityTier: MenuVisibilityTier = rawVisibilityTier === 'developer' ? 'developer' : 'user';
  const [rawLayer1ContextMode, setLayer1ContextMode] = useState<Layer1MenuContextMode>(() => {
    const p = readUrlParams();
    return resolveLayer1ContextSpec(p.ctx).id;
  }, 'layer1ContextMode');
  const layer1ContextMode: Layer1MenuContextMode = resolveLayer1ContextSpec(rawLayer1ContextMode).id;
  const [touchMode, setTouchMode] = useState<boolean>(false, 'touchMode');
  const [rawCurrentRoute, setCurrentRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return p.route && p.route in MENU_ROUTE_CONFIG ? (p.route as ActiveMenuRoute) : 'main-menu';
  }, 'currentRoute');
  const currentRoute: ActiveMenuRoute =
    rawCurrentRoute && rawCurrentRoute in MENU_ROUTE_CONFIG ? rawCurrentRoute : 'main-menu';
  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph', 'transitionMode');
  const [settingsTab, setSettingsTab] = useState<string>(() => {
    const p = readUrlParams();
    return p.route !== 'garage' && p.subtab ? p.subtab : 'gameplay';
  }, 'settingsTab');
  const [rawGarageTab, setGarageTab] = useState<string>(() => {
    const p = readUrlParams();
    return p.route === 'garage' && p.subtab ? p.subtab : 'car';
  }, 'garageTab');
  const garageTab = rawGarageTab === 'player-name' ? 'sync' : rawGarageTab;
  const [bgRenderPaused, setBgRenderPaused] = useState<boolean>(true, 'bgRenderPaused');
  const [feedbackToast, setFeedbackToast] = useLocalState<string | null>(null);
  const [showInlineTuner, setShowInlineTuner] = useLocalState<boolean>(false);
  const [lastParentRoute, setLastParentRoute] = useState<ActiveMenuRoute>('additional-preview', 'lastParentRoute');
  const [routeHistory, setRouteHistory] = useState<ActiveMenuRoute[]>([], 'routeHistory');
  const [liveAnimPhase, setLiveAnimPhase] = useState<LivePreviewAnimPhase>('expanded', 'liveAnimPhase');
  const [isPillHovered, setIsPillHovered] = useLocalState(false);
  const [ballSimSpeed, setBallSimSpeed] = useState(128, 'ballSimSpeed');
  const { windows, isStackDismissed, minimizedCount, totalCount, closeWindow } = useFloatingStore();
  const hasStackIcon = !(isStackDismissed && minimizedCount === 0);
  const isCursorHidden = currentRoute === 'layer-0' && !hasStackIcon;
  const [stepPhase, setStepPhase] = useState<'idle' | 'fadeOut' | 'resize' | 'fadeIn'>('idle', 'stepPhase');
  const [rawDisplayedRoute, setDisplayedRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return p.route && p.route in MENU_ROUTE_CONFIG ? (p.route as ActiveMenuRoute) : 'main-menu';
  }, 'displayedRoute');
  const displayedRoute: ActiveMenuRoute =
    rawDisplayedRoute && rawDisplayedRoute in MENU_ROUTE_CONFIG ? rawDisplayedRoute : currentRoute;
  const isRestoringFromUrlRef = useRef(false);
  const hasMountedUrlSyncRef = useRef(false);
  useEffect(() => {
    const syncFromUrl = () => {
      const p = readUrlParams();
      if (!p.route && !p.tier && !p.subtab && !p.ctx) return;
      isRestoringFromUrlRef.current = true;
      if (p.tier === 'user' || p.tier === 'developer') {
        setVisibilityTier(p.tier);
      }
      if (p.route && p.route in MENU_ROUTE_CONFIG) {
        const nextRoute = p.route as ActiveMenuRoute;
        setCurrentRoute(nextRoute);
        setDisplayedRoute(nextRoute);
      }
      if (p.subtab) {
        if (p.route === 'garage') {
          setGarageTab(p.subtab);
        } else {
          setSettingsTab(p.subtab);
        } }
      if (p.ctx) {
        setLayer1ContextMode(resolveLayer1ContextSpec(p.ctx).id);
      } };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);
  useEffect(() => {
    const subtab =
      currentRoute === 'settings' ? settingsTab
        : currentRoute === 'garage' ? garageTab
        : null;
    const shouldPush = hasMountedUrlSyncRef.current && !isRestoringFromUrlRef.current;
    hasMountedUrlSyncRef.current = true;
    isRestoringFromUrlRef.current = false;
    updateUrlParams(
      { tier: visibilityTier, route: currentRoute,
        subtab, ctx: currentRoute === 'main-menu' ? layer1ContextMode : null },
      { push: shouldPush }
    );
  }, [visibilityTier, currentRoute, settingsTab, garageTab, layer1ContextMode]);
  const handleChangeVisibilityTier = (nextTier: MenuVisibilityTier) => {
    setVisibilityTier(nextTier);
    if (nextTier === 'developer') {
      if (layer1ContextMode !== 'dev-test-lab' && layer1ContextMode !== 'exp-multi-bots') {
        setLayer1ContextMode('dev-test-lab');
      } setSettingsTab('developer');
      const cfg = MENU_ROUTE_CONFIG[currentRoute];
      if (cfg && cfg.tier === 'user') {
        setCurrentRoute('settings');
        setDisplayedRoute('settings');
      } } else {
      if (layer1ContextMode === 'dev-test-lab' || layer1ContextMode === 'exp-multi-bots') {
        setLayer1ContextMode('freeplay');
      }
      if (settingsTab === 'developer') {
        setSettingsTab('gameplay');
      }
      const cfg = MENU_ROUTE_CONFIG[currentRoute];
      if (cfg && cfg.tier === 'developer') {
        setCurrentRoute('main-menu');
        setDisplayedRoute('main-menu');
      } }
  };
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useLocalState({ width: 900, height: 620 });
  const [isShaking, setIsShaking] = useLocalState(false);
  const shakeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => {
      setIsShaking(false);
    }, 360);
  };
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2400);
  };
  useEffect(() => {
    if (!stageRef.current) return;
    const update = () => {
      if (stageRef.current) {
        setStageSize({
          width: stageRef.current.clientWidth, height: stageRef.current.clientHeight,
        });
      } };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stageRef.current);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [renderScale]);
  const [containerPreset, setContainerPreset] = useState<
    'full' | '1080p-compact' | 'small-squeeze'
  >('full', 'containerPreset');
  const [widthMode, setWidthMode] = useState<MenuPanelWidthAdaptiveMode>(
    'design-auto-expand', 'widthMode'
  );
  const [manualMinWidths, setManualMinWidths] = useState<Record<string, number>>(
    {},
    'manualMinWidths'
  );
  const [minWidthDraft, setMinWidthDraft] = useLocalState<string>('');
  const [isEditingMinWidth, setIsEditingMinWidth] = useLocalState<boolean>(false);
  const {
    contentWrapperRef, panelOuterRadius,
    getRouteMetricKey, resolveRouteGeometry,
  } = useMenuLayerAdaptiveMetrics({
    currentRoute, displayedRoute,
    visibilityTier, layer1ContextMode,
    touchMode, stageSize,
    containerPreset, widthMode,
    manualMinWidths,
  });
  const handleSelectRoute = (
    targetRoute: ActiveMenuRoute, options?: { pushHistory?: boolean }
  ) => {
    if (targetRoute === currentRoute) return;
    const shouldPush = options?.pushHistory !== false;
    if (shouldPush && currentRoute !== 'layer-0' && targetRoute !== 'layer-0') {
      setRouteHistory((prev) => {
        const filtered = prev[prev.length - 1] === currentRoute ? prev : [...prev, currentRoute];
        return filtered.slice(-16);
      });
    } else if (targetRoute === 'layer-0' || targetRoute === 'main-menu') {
      setRouteHistory([]);
    }
    if (liveAnimPhase !== 'expanded') {
      setLiveAnimPhase('expanded');
    }
    if (currentRoute === 'layer-0' && targetRoute !== 'layer-0') {
      floatingStore.triggerBatchMinimize();
    }
    if (transitionMode === 'fluid-morph') {
      setCurrentRoute(targetRoute);
      setDisplayedRoute(targetRoute);
      return;
    }
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
  const handleNavigateBack = () => {
    if (currentRoute === 'layer-0') {
      floatingStore.triggerBatchMinimize();
      handleSelectRoute('main-menu', { pushHistory: false });
      showToast('ESC: 呼出主菜单 (已折叠展开的悬浮窗)');
      return;
    }
    if (currentRoute === 'main-menu') {
      handleSelectRoute('layer-0', { pushHistory: false });
      showToast('ESC: 返回对局 (Layer 0)');
      return;
    }
    if (
      (currentRoute === 'trajectory' || currentRoute === 'camera') && liveAnimPhase === 'collapsed'
    ) {
      handleTriggerExpand();
      return;
    }
    if (routeHistory.length > 0) {
      const prevRoute = routeHistory[routeHistory.length - 1];
      setRouteHistory((prev) => prev.slice(0, -1));
      handleSelectRoute(prevRoute, { pushHistory: false });
      return;
    }
    const fallbackParent =
      MENU_ROUTE_CONFIG[currentRoute]?.parentRoute ?? 'main-menu';
    handleSelectRoute(fallbackParent, { pushHistory: false });
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (currentRoute === 'trajectory' || currentRoute === 'camera') {
          e.preventDefault();
          handleToggleLivePreview();
        } } else if (e.key === 'Escape') {
        e.preventDefault();
        handleNavigateBack();
      } };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoute, liveAnimPhase, lastParentRoute, routeHistory]);
  const handleAddPresetWindow = (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!stageRef.current) return;
    floatingStore.spawnWithFlight(preset, e.currentTarget, stageRef.current);
    showToast(`✓ 已将 "${preset.title}" 收缩压入右上角 Stack`);
  };
  const isDockState = 
    (currentRoute === 'trajectory' || currentRoute === 'camera') && 
    (liveAnimPhase === 'collapsed' || liveAnimPhase === 'collapsing_resize' || liveAnimPhase === 'expanding_content');
  const dockW = 88;
  const dockH = 38;
  const activeRouteSize = resolveRouteGeometry(currentRoute);
  const expandedW = activeRouteSize.width || 480;
  const expandedH = activeRouteSize.height || 540;
  const activeMetricKey = getRouteMetricKey(currentRoute);
  const hasManualMinOverride =
    currentRoute !== 'layer-0' && typeof manualMinWidths[activeMetricKey] === 'number';
  useEffect(() => {
    if (!isEditingMinWidth && currentRoute !== 'layer-0') {
      setMinWidthDraft(String(Math.round(activeRouteSize.effectiveMinWidth)));
    }
  }, [
    currentRoute, activeMetricKey,
    activeRouteSize.effectiveMinWidth, isEditingMinWidth,
  ]);
  const applyManualMinWidth = (nextVal: number) => {
    if (currentRoute === 'layer-0' || !Number.isFinite(nextVal)) return;
    const clamped = Math.max(260, Math.min(1100, Math.round(nextVal)));
    setManualMinWidths((prev) => ({
      ...prev, [activeMetricKey]: clamped,
    }));
    setMinWidthDraft(String(clamped));
  };
  const handleResetAutoMinWidth = () => {
    if (currentRoute === 'layer-0') return;
    setManualMinWidths((prev) => {
      const next = { ...prev };
      delete next[activeMetricKey];
      return next;
    });
    showToast( `✓ 已恢复 ${activeMetricKey} 自动探测最小宽 (${activeRouteSize.autoMinWidth}px)`
    );
  };
  const effectiveStageW =
    containerPreset === '1080p-compact' ? Math.min(stageSize.width, 760)
      : containerPreset === 'small-squeeze' ? Math.min(stageSize.width, 520)
      : stageSize.width;
  const effectiveStageH =
    containerPreset === '1080p-compact' ? 520
      : containerPreset === 'small-squeeze' ? 380
      : currentRoute !== 'layer-0' && !isDockState
      ? Math.max(stageSize.height, 620, Math.min(980, expandedH + 48)) : Math.max(stageSize.height, 620);
  const xExpanded =
    currentRoute !== 'layer-0' ? activeRouteSize.x
      : Math.max(16, Math.round((effectiveStageW - expandedW) / 2));
  const yExpanded =
    currentRoute !== 'layer-0' ? activeRouteSize.y
      : Math.max(16, Math.round((effectiveStageH - expandedH) / 2));
  const xDock = Math.max(16, Math.round(effectiveStageW - 16 - dockW));
  const yDock = Math.max(16, Math.round((effectiveStageH - dockH) / 2));
  const targetX = isDockState ? xDock : xExpanded;
  const targetY = isDockState ? yDock : yExpanded;
  const targetW = isDockState ? dockW : expandedW;
  const targetH = isDockState ? dockH : expandedH;
  const targetRadius = isDockState ? 12 : panelOuterRadius;
  const isContentVisible = 
    currentRoute !== 'layer-0' && !isDockState &&
    (transitionMode === 'fluid-morph' ? liveAnimPhase === 'expanded' : stepPhase !== 'fadeOut' && stepPhase !== 'resize' && liveAnimPhase === 'expanded');
  const isPillContentVisible = liveAnimPhase === 'collapsed';
  return (
    <div className="flex flex-col gap-6 w-full">
      <MenuLayerTopHeaderBar isLight={isLight} currentRoute={currentRoute} transitionMode={transitionMode}
        setTransitionMode={setTransitionMode} showToast={showToast} />
      {/* Top Jump Directory: Click any recipe to activate it in the sandbox stage and scroll to stage */}
      <PageJumpDirectory
        title={`7A · Menu Layer 全链路沙盒快速跳转目录 (${visibilityTier === 'user' ? 'User Only 视图' : 'Developer Only 视图'})`}
        subtitle="点击任意卡片即可立即将该 L6 菜单组件加载至下方流体舞台并平滑定位 · 点击复制图标可复制标准引用名"
        items={MENU_SANDBOX_JUMP_ITEMS.filter((item) => item.tier === visibilityTier)} onSelect={(item) => {
        const r = (item as JumpDirectoryItem & { route?: ActiveMenuRoute }).route; if (r) handleSelectRoute(r); }}
        isLight={isLight} />
      {/* 顶部多层级快捷选择器区域 */}
      <MenuLayerRouteSelectorBar
        isLight={isLight} visibilityTier={visibilityTier}
        onChangeVisibilityTier={handleChangeVisibilityTier} layer1ContextMode={layer1ContextMode}
        onChangeLayer1ContextMode={setLayer1ContextMode} touchMode={touchMode}
        onToggleTouchMode={setTouchMode} currentRoute={currentRoute}
        handleSelectRoute={handleSelectRoute} settingsTab={settingsTab}
        setSettingsTab={setSettingsTab} garageTab={garageTab}
        setGarageTab={setGarageTab} showToast={showToast}
        isDockState={isDockState} activeRouteSizeModeLabel={activeRouteSize.modeLabel}
        feedbackToast={feedbackToast} onNavigateToPlayCards={onNavigateToPlayCards}
        onNavigateShowcase={onNavigateShowcase} showInlineTuner={showInlineTuner}
        onToggleInlineTuner={() => setShowInlineTuner((prev) => !prev)} />
      <MenuLayerAdaptiveControlDeck isLight={isLight} currentRoute={currentRoute} settingsTab={settingsTab}
        garageTab={garageTab} layer1ContextMode={layer1ContextMode} setLayer1ContextMode={setLayer1ContextMode}
        showInlineTuner={showInlineTuner} setShowInlineTuner={setShowInlineTuner}
        onNavigateShowcase={onNavigateShowcase} widthMode={widthMode} setWidthMode={setWidthMode}
        isDockState={isDockState} targetW={targetW} targetH={targetH} activeRouteSize={activeRouteSize}
        minWidthDraft={minWidthDraft} setMinWidthDraft={setMinWidthDraft}
        setIsEditingMinWidth={setIsEditingMinWidth} hasManualMinOverride={hasManualMinOverride}
        applyManualMinWidth={applyManualMinWidth} handleResetAutoMinWidth={handleResetAutoMinWidth}
        containerPreset={containerPreset} setContainerPreset={setContainerPreset} />
      <MenuLayerStageCanvas isLight={isLight} stageRef={stageRef} contentWrapperRef={contentWrapperRef}
        containerPreset={containerPreset} isCursorHidden={isCursorHidden} currentRoute={currentRoute}
        displayedRoute={displayedRoute} isDockState={isDockState} ballSimSpeed={ballSimSpeed}
        hasStackIcon={hasStackIcon} backdropDuration={backdropDuration} triggerShake={triggerShake}
        showToast={showToast} handleSelectRoute={handleSelectRoute} handleNavigateBack={handleNavigateBack}
        isShaking={isShaking} targetX={targetX} targetY={targetY} targetW={targetW} targetH={targetH}
        targetRadius={targetRadius} handleTriggerExpand={handleTriggerExpand}
        handleTriggerCollapse={handleTriggerCollapse} isPillHovered={isPillHovered}
        setIsPillHovered={setIsPillHovered} isPillContentVisible={isPillContentVisible}
        isContentVisible={isContentVisible} visibilityTier={visibilityTier}
        handleChangeVisibilityTier={handleChangeVisibilityTier} layer1ContextMode={layer1ContextMode}
        setLayer1ContextMode={setLayer1ContextMode} touchMode={touchMode} setTouchMode={setTouchMode}
        settingsTab={settingsTab} setSettingsTab={setSettingsTab} garageTab={garageTab} setGarageTab={setGarageTab}
        bgRenderPaused={bgRenderPaused} setBgRenderPaused={setBgRenderPaused} lastParentRoute={lastParentRoute}
        setLastParentRoute={setLastParentRoute} handleAddPresetWindow={handleAddPresetWindow} windows={windows}
        minimizedCount={minimizedCount} totalCount={totalCount} closeWindow={closeWindow}
        setLiveAnimPhase={setLiveAnimPhase} />
      {/* 底部引导栏 */}
      {onNavigateToReserved && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
          isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800' }`}>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-500 shrink-0" />
            <span className={isLight ? 'text-neutral-600' : 'text-neutral-400'}>
              赛后结算 (Match Post) 与遥测数据 (Match Stats) 等暂未纳入主对局的候选模板已保留在候选页面。
            </span>
          </div>
          <button type="button" onClick={onNavigateToReserved}
            className="flex items-center gap-1 font-semibold text-amber-500 hover:text-amber-400 cursor-pointer shrink-0 transition-colors">
            <span>查看预留战报规范</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
