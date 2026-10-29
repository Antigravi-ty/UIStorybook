import React, { useState as useLocalState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  ArrowRight, 
  Info,
  Ruler,
  ChevronLeft,
  Minus,
  Plus,
  RotateCcw,
  Copy,
} from 'lucide-react';
import { ContainerTransitionMode } from '../../navigation/transitions';
import {
  measureMenuPanelIntrinsicDimensions,
  resolveClampedMenuPanelGeometry,
  type MenuPanelIntrinsicMetrics,
  type MenuPanelWidthAdaptiveMode,
} from '../../navigation/menuPanelAdaptive';
import { Badge } from '../../primitives/Badge';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { MorphContainerContext } from '../../tokens/morphContext';
import {
  useMenuLayoutStore,
  DEFAULT_PANEL_SIZING,
} from '../../tokens';
import { createScopedSyncedState, readUrlParams, updateUrlParams } from '../stores';
import { useViewportStore } from '../../viewport';

const useState = createScopedSyncedState('page:menu-layer-v2');
import { FloatingStackIcon } from '../../navigation/FloatingStackIcon';
import { FloatingWindowManager } from '../../navigation/FloatingWindowManager';
import { QuickNotificationSystem } from '../../navigation/QuickNotificationSystem';
import { floatingStore, useFloatingStore } from '../../tokens/floatingStore';
import { PRESET_WINDOWS, type PresetConfig } from '../../tokens/floatingPresets';
import { renderFloatingWindowPanel } from '../../panels';
import {
  resolveLayer1ContextSpec,
  type Layer1MenuContextMode,
} from '../../recipes/Layer1MainMenuRecipe';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import {
  type ActiveMenuRoute,
  type LayerRouteConfig,
  type LivePreviewAnimPhase,
  type MenuVisibilityTier,
  ROUTE_TO_PANEL_ID,
  MENU_SANDBOX_JUMP_ITEMS,
  MENU_ROUTE_CONFIG,
  SETTINGS_QUICK_TABS,
  isLayer3RouteAvailable,
} from './menu-layer/menuLayerRouteConfig';
import { MenuLayerRouteSelectorBar } from './menu-layer/MenuLayerRouteSelectorBar';
import { MenuLayerStageRecipeRouter } from './menu-layer/MenuLayerStageRecipeRouter';
import { resolveNodePathInspectorLinks } from './menu-layer/menuLayerInspectorLinks';
import { LocalPanelSizingTuner } from './recipes/LocalPanelSizingTuner';
import { MainMenuStyleTuner } from './recipes/MainMenuStyleTuner';
import { SettingActionRowTuner } from './recipes/SettingActionRowTuner';
import { UnderlineTabsTuner } from './recipes/UnderlineTabsTuner';
import { CameraSettingsStyleTuner } from './recipes/CameraSettingsStyleTuner';
import { useMainMenuStyleStore } from '../../tokens/mainMenuStyleStore';
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

  // 严格视图隔离：User Only vs Developer Only (支持 URL 初始参数种入，不覆盖已有活跃多端会话)
  const [rawVisibilityTier, setVisibilityTier] = useState<MenuVisibilityTier>(() => {
    const p = readUrlParams();
    return p.tier === 'developer' ? 'developer' : 'user';
  }, 'visibilityTier');
  const visibilityTier: MenuVisibilityTier = rawVisibilityTier === 'developer' ? 'developer' : 'user';
  // Layer 1 主菜单上下文模式 (11 User 变体 + 2 Developer 变体)
  const [rawLayer1ContextMode, setLayer1ContextMode] = useState<Layer1MenuContextMode>(() => {
    const p = readUrlParams();
    return resolveLayer1ContextSpec(p.ctx).id;
  }, 'layer1ContextMode');
  const layer1ContextMode: Layer1MenuContextMode = resolveLayer1ContextSpec(rawLayer1ContextMode).id;
  // ?touch=1 触屏 Agent 切换开关
  const [touchMode, setTouchMode] = useState<boolean>(false, 'touchMode');
  // 当前预览路由状态（对应独立窗口层级）
  const [rawCurrentRoute, setCurrentRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return p.route && p.route in MENU_ROUTE_CONFIG ? (p.route as ActiveMenuRoute) : 'main-menu';
  }, 'currentRoute');
  const currentRoute: ActiveMenuRoute =
    rawCurrentRoute && rawCurrentRoute in MENU_ROUTE_CONFIG ? rawCurrentRoute : 'main-menu';
  // 当前过渡动效模式 (流体形变 vs 三段时序分步)
  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph', 'transitionMode');
  // 目标 Settings 选项卡
  const [settingsTab, setSettingsTab] = useState<string>(() => {
    const p = readUrlParams();
    return p.route !== 'garage' && p.subtab ? p.subtab : 'gameplay';
  }, 'settingsTab');
  // 目标 Garage 选项卡
  const [rawGarageTab, setGarageTab] = useState<string>(() => {
    const p = readUrlParams();
    return p.route === 'garage' && p.subtab ? p.subtab : 'car';
  }, 'garageTab');
  const garageTab = rawGarageTab === 'player-name' ? 'sync' : rawGarageTab;
  // 后台渲染暂停指示
  const [bgRenderPaused, setBgRenderPaused] = useState<boolean>(true, 'bgRenderPaused');
  // 交互反馈提示 (仅当前设备/窗口本地展示)
  const [feedbackToast, setFeedbackToast] = useLocalState<string | null>(null);
  // 7A 内联就地快调抽屉开关 (仅当前窗口本地展开，避免干扰多端观察屏)
  const [showInlineTuner, setShowInlineTuner] = useLocalState<boolean>(false);

  // 记录三级菜单的触发父路由与完整导航历史栈（确保左上角 Back 按钮与键盘 ESC 100% 行为一致）
  const [lastParentRoute, setLastParentRoute] = useState<ActiveMenuRoute>('additional-preview', 'lastParentRoute');
  const [routeHistory, setRouteHistory] = useState<ActiveMenuRoute[]>([], 'routeHistory');

  // Live Preview 专有时序状态机
  const [liveAnimPhase, setLiveAnimPhase] = useState<LivePreviewAnimPhase>('expanded', 'liveAnimPhase');
  const [isPillHovered, setIsPillHovered] = useLocalState(false);
  const [ballSimSpeed, setBallSimSpeed] = useState(128, 'ballSimSpeed');

  // Floating Window 状态获取：用于光标显隐判断与批量折叠
  const { windows, isStackDismissed, minimizedCount, totalCount, closeWindow } = useFloatingStore();
  const hasStackIcon = !(isStackDismissed && minimizedCount === 0);
  // 光标隐藏条件：仅当处于对局 Layer 0 状态且右上角无 Stack Icon 时隐藏光标
  const isCursorHidden = currentRoute === 'layer-0' && !hasStackIcon;

  // SequencedStep 模式下的三段时序状态 (仅在 sequenced-step 模式下使用)
  const [stepPhase, setStepPhase] = useState<'idle' | 'fadeOut' | 'resize' | 'fadeIn'>('idle', 'stepPhase');
  const [rawDisplayedRoute, setDisplayedRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return p.route && p.route in MENU_ROUTE_CONFIG ? (p.route as ActiveMenuRoute) : 'main-menu';
  }, 'displayedRoute');
  const displayedRoute: ActiveMenuRoute =
    rawDisplayedRoute && rawDisplayedRoute in MENU_ROUTE_CONFIG ? rawDisplayedRoute : currentRoute;

  const isRestoringFromUrlRef = useRef(false);
  const hasMountedUrlSyncRef = useRef(false);

  // Sync from URL on mount and whenever browser Back / Forward (popstate) occurs
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
        }
      }
      if (p.ctx) {
        setLayer1ContextMode(resolveLayer1ContextSpec(p.ctx).id);
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // Continuously synchronize active menu route, tier, subtab, and Layer 1 context mode to URL address bar
  useEffect(() => {
    const subtab =
      currentRoute === 'settings'
        ? settingsTab
        : currentRoute === 'garage'
        ? garageTab
        : null;
    const shouldPush = hasMountedUrlSyncRef.current && !isRestoringFromUrlRef.current;
    hasMountedUrlSyncRef.current = true;
    isRestoringFromUrlRef.current = false;
    updateUrlParams(
      {
        tier: visibilityTier,
        route: currentRoute,
        subtab,
        ctx: currentRoute === 'main-menu' ? layer1ContextMode : null,
      },
      { push: shouldPush }
    );
  }, [visibilityTier, currentRoute, settingsTab, garageTab, layer1ContextMode]);

  const handleChangeVisibilityTier = (nextTier: MenuVisibilityTier) => {
    setVisibilityTier(nextTier);
    if (nextTier === 'developer') {
      if (layer1ContextMode !== 'dev-test-lab' && layer1ContextMode !== 'exp-multi-bots') {
        setLayer1ContextMode('dev-test-lab');
      }
      setSettingsTab('developer');
      const cfg = MENU_ROUTE_CONFIG[currentRoute];
      if (cfg && cfg.tier === 'user') {
        setCurrentRoute('settings');
        setDisplayedRoute('settings');
      }
    } else {
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
      }
    }
  };

  // Stage 尺寸引用 (严格本地窗口独立测量，禁止跨端同步导致手机竖屏与电脑横屏互相篡改居中坐标)
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useLocalState({ width: 900, height: 620 });
  
  // 中间菜单窗口震动反馈状态（仅当前窗口本地触发 Apple Sheet Shake）
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

  // 动态监听 Stage 尺寸 (包含 renderScale 变化时的重测)
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
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [renderScale]);

  const {
    panels,
    dividerMarginY,
    menuItemGap,
    menuItemPaddingY,
    menuContainerPadding,
    panelContentPaddingY,
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderTitleFontSize,
    panelHeaderBackBtnWidth,
    panelHeaderBackBtnHeight,
    panelHeaderBackBtnSize,
    panelOuterRadius,
    panelHeaderGap,
    panelBodyPaddingX,
    panelBodyPaddingY,
    panelFooterPaddingX,
    panelFooterPaddingY,
    panelFooterFontSize,
    simulateLayer3Error,
  } = useMenuLayoutStore();
  const mainMenuStyle = useMainMenuStyleStore();

  // ── 6D 迁移自适应引擎状态：画布边界预设 + 宽度自适应模式 + 1px 整数最小宽手动标定 ──
  const [containerPreset, setContainerPreset] = useState<
    'full' | '1080p-compact' | 'small-squeeze'
  >('full', 'containerPreset');
  const [widthMode, setWidthMode] = useState<MenuPanelWidthAdaptiveMode>(
    'design-auto-expand',
    'widthMode'
  );
  const [manualMinWidths, setManualMinWidths] = useState<Record<string, number>>(
    {},
    'manualMinWidths'
  );
  const [minWidthDraft, setMinWidthDraft] = useLocalState<string>('');
  const [isEditingMinWidth, setIsEditingMinWidth] = useLocalState<boolean>(false);

  const getRouteMetricKey = (route: ActiveMenuRoute) => {
    if (route === 'main-menu') return `main-menu:${layer1ContextMode}`;
    if (route === 'settings') return `settings:${settingsTab}`;
    if (route === 'garage') return `garage:${garageTab}`;
    if (route === 'room-host-control') return `room-host-control:${layer1ContextMode}`;
    return route;
  };

  // 记录各路由面板在 Auto-Fit 模式下的真实自然高度与自动探测最小不截断宽度 (严格本地 DOM 测量)
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const isProbingRef = useRef<boolean>(false);
  const lastWidthProbeSigRef = useRef<string>('');
  const [metricsByRouteKey, setMetricsByRouteKey] = useLocalState<
    Record<string, MenuPanelIntrinsicMetrics>
  >({});

  useEffect(() => {
    const wrapper = contentWrapperRef.current;
    if (!wrapper || currentRoute === 'layer-0' || displayedRoute === 'layer-0') return;
    const panelEl = wrapper.querySelector<HTMLElement>('[data-panel="container"]');
    if (!panelEl) return;

    const metricKey = getRouteMetricKey(displayedRoute);
    const panelId = ROUTE_TO_PANEL_ID[displayedRoute] ?? 'layer1-main';
    const cfg =
      panels?.[panelId] ??
      DEFAULT_PANEL_SIZING[panelId] ??
      DEFAULT_PANEL_SIZING['layer1-main'];

    const measure = () => {
      if (isProbingRef.current) return;
      isProbingRef.current = true;
      try {
        const contentEl = panelEl.querySelector<HTMLElement>(
          '[data-panel-section="content"]'
        );
        const childCount = contentEl?.firstElementChild?.children.length ?? contentEl?.children.length ?? 0;
        const widthSig = `${metricKey}:${childCount}:${simulateLayer3Error}:${touchMode}:${panelHeaderTitleFontSize}:${panelBodyPaddingX}`;
        const shouldProbeWidth = lastWidthProbeSigRef.current !== widthSig;

        const measured = measureMenuPanelIntrinsicDimensions(panelEl, {
          fallbackMinWidth: Math.min(cfg.width, 360),
          tier: visibilityTier,
          measureWidth: shouldProbeWidth,
        });

        if (shouldProbeWidth && contentEl && contentEl.clientWidth > 0) {
          lastWidthProbeSigRef.current = widthSig;
        }

        if (measured.intrinsicHeight > 40) {
          setMetricsByRouteKey((prev) => {
            const existing = prev[metricKey];
            const nextAutoMinW = shouldProbeWidth
              ? measured.autoMinWidth
              : existing?.autoMinWidth ?? measured.autoMinWidth;
            const nextContentMinW = shouldProbeWidth
              ? measured.contentMinWidth
              : existing?.contentMinWidth ?? measured.contentMinWidth;

            if (
              existing &&
              Math.abs(existing.intrinsicHeight - measured.intrinsicHeight) <= 1 &&
              existing.autoMinWidth === nextAutoMinW
            ) {
              return prev;
            }
            return {
              ...prev,
              [metricKey]: {
                intrinsicHeight: measured.intrinsicHeight,
                autoMinWidth: nextAutoMinW,
                contentMinWidth: nextContentMinW,
                chromeMinWidth: measured.chromeMinWidth,
                scrollbarReservePx: measured.scrollbarReservePx,
              },
            };
          });
        }
      } finally {
        isProbingRef.current = false;
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(panelEl);
    Array.from(panelEl.children).forEach((child) => {
      ro.observe(child);
      if (
        (child as HTMLElement).getAttribute('data-panel-section') === 'content'
      ) {
        Array.from(child.children).forEach((grandChild) => ro.observe(grandChild));
      }
    });

    return () => ro.disconnect();
  }, [
    displayedRoute,
    currentRoute,
    visibilityTier,
    layer1ContextMode,
    settingsTab,
    garageTab,
    touchMode,
    mainMenuStyle,
    panels,
    dividerMarginY,
    menuItemGap,
    menuItemPaddingY,
    menuContainerPadding,
    panelContentPaddingY,
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderTitleFontSize,
    panelHeaderBackBtnWidth,
    panelHeaderBackBtnHeight,
    panelHeaderBackBtnSize,
    panelHeaderGap,
    panelBodyPaddingX,
    panelBodyPaddingY,
    panelFooterPaddingX,
    panelFooterPaddingY,
    panelFooterFontSize,
    simulateLayer3Error,
    stageSize.width,
    stageSize.height,
  ]);

  const resolveRouteGeometry = (route: ActiveMenuRoute) => {
    if (route === 'layer-0') {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        desiredWidth: 0,
        desiredHeight: 0,
        effectiveMinWidth: 0,
        autoMinWidth: 0,
        intrinsicHeight: 0,
        scrollbarReservePx: 16,
        isWidthSqueezed: false,
        isHeightSqueezed: false,
        modeLabel: '0px',
      };
    }
    const metricKey = getRouteMetricKey(route);
    const panelId = ROUTE_TO_PANEL_ID[route] ?? 'layer1-main';
    const cfg =
      panels?.[panelId] ??
      DEFAULT_PANEL_SIZING[panelId] ??
      DEFAULT_PANEL_SIZING['layer1-main'];
    const measured = metricsByRouteKey[metricKey];
    const fallbackIntrinsic = route === 'main-menu' ? 382 : cfg.targetHeight;
    const naturalH = measured?.intrinsicHeight ?? fallbackIntrinsic;
    const autoMinW = measured?.autoMinWidth ?? Math.min(cfg.width, 400);
    const manualMinW =
      typeof manualMinWidths[metricKey] === 'number'
        ? Math.round(manualMinWidths[metricKey])
        : undefined;

    // In 'full' canvas preset, the stage expands vertically to accommodate the panel's desired height;
    // in '1080p-compact' (760×520) or 'small-squeeze' (520×380), the stage is fixed and squeezes the panel!
    const effectiveBoundsH =
      containerPreset === '1080p-compact'
        ? 520
        : containerPreset === 'small-squeeze'
        ? 380
        : Math.max(stageSize.height, 620, Math.min(980, naturalH + 48));
    const effectiveBoundsW =
      containerPreset === '1080p-compact'
        ? Math.min(stageSize.width, 760)
        : containerPreset === 'small-squeeze'
        ? Math.min(stageSize.width, 520)
        : stageSize.width;

    return resolveClampedMenuPanelGeometry({
      sizing: cfg,
      intrinsicHeight: naturalH,
      autoMinWidth: autoMinW,
      manualMinWidth: manualMinW,
      widthMode,
      stageBounds: {
        width: Math.max(300, effectiveBoundsW),
        height: Math.max(240, effectiveBoundsH),
      },
      margin: 16,
    });
  };

  // 路由切换统一入口（支持 SequencedStep 分步与 FluidMorph 连续流体，并自动压入导航历史栈）
  const handleSelectRoute = (
    targetRoute: ActiveMenuRoute,
    options?: { pushHistory?: boolean }
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

    // 如果当前处于 Live Preview 收折状态，切出前重置为 expanded
    if (liveAnimPhase !== 'expanded') {
      setLiveAnimPhase('expanded');
    }

    // 从 Layer 0 呼出菜单时，自动将所有展开的浮动窗口收纳折叠回 Stack Icon（触发集体收缩飞跃动画）
    if (currentRoute === 'layer-0' && targetRoute !== 'layer-0') {
      floatingStore.triggerBatchMinimize();
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

  // 统一返回导航入口：供面板左上角 Back 按钮与键盘 ESC 键共同调用，彻底消除双套状态分叉
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
      (currentRoute === 'trajectory' || currentRoute === 'camera') &&
      liveAnimPhase === 'collapsed'
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

  // 键盘快捷键监听器：
  // 1. TAB 键：在 Layer 3 Live Preview 面板 (trajectory / camera-settings) 中折叠/展开
  // 2. ESC 键：统一调用 handleNavigateBack()，与左上角 Back 按钮保持 100% 栈路径一致
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (currentRoute === 'trajectory' || currentRoute === 'camera') {
          e.preventDefault();
          handleToggleLivePreview();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleNavigateBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoute, liveAnimPhase, lastParentRoute, routeHistory]);

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
    (currentRoute === 'trajectory' || currentRoute === 'camera') && 
    (liveAnimPhase === 'collapsed' || liveAnimPhase === 'collapsing_resize' || liveAnimPhase === 'expanding_content');

  const dockW = 88;
  const dockH = 38;
  const activeRouteSize = resolveRouteGeometry(currentRoute);
  const expandedW = activeRouteSize.width || 480;
  const expandedH = activeRouteSize.height || 540;

  const activeMetricKey = getRouteMetricKey(currentRoute);
  const hasManualMinOverride =
    currentRoute !== 'layer-0' &&
    typeof manualMinWidths[activeMetricKey] === 'number';

  useEffect(() => {
    if (!isEditingMinWidth && currentRoute !== 'layer-0') {
      setMinWidthDraft(String(Math.round(activeRouteSize.effectiveMinWidth)));
    }
  }, [
    currentRoute,
    activeMetricKey,
    activeRouteSize.effectiveMinWidth,
    isEditingMinWidth,
  ]);

  const applyManualMinWidth = (nextVal: number) => {
    if (currentRoute === 'layer-0' || !Number.isFinite(nextVal)) return;
    const clamped = Math.max(260, Math.min(1100, Math.round(nextVal)));
    setManualMinWidths((prev) => ({
      ...prev,
      [activeMetricKey]: clamped,
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
    showToast(
      `✓ 已恢复 ${activeMetricKey} 自动探测最小宽 (${activeRouteSize.autoMinWidth}px)`
    );
  };

  const effectiveStageW =
    containerPreset === '1080p-compact'
      ? Math.min(stageSize.width, 760)
      : containerPreset === 'small-squeeze'
      ? Math.min(stageSize.width, 520)
      : stageSize.width;
  const effectiveStageH =
    containerPreset === '1080p-compact'
      ? 520
      : containerPreset === 'small-squeeze'
      ? 380
      : currentRoute !== 'layer-0' && !isDockState
      ? Math.max(stageSize.height, 620, Math.min(980, expandedH + 48))
      : Math.max(stageSize.height, 620);

  const xExpanded =
    currentRoute !== 'layer-0'
      ? activeRouteSize.x
      : Math.max(16, Math.round((effectiveStageW - expandedW) / 2));
  const yExpanded =
    currentRoute !== 'layer-0'
      ? activeRouteSize.y
      : Math.max(16, Math.round((effectiveStageH - expandedH) / 2));

  const xDock = Math.max(16, Math.round(effectiveStageW - 16 - dockW));
  const yDock = Math.max(16, Math.round((effectiveStageH - dockH) / 2));

  const targetX = isDockState ? xDock : xExpanded;
  const targetY = isDockState ? yDock : yExpanded;
  const targetW = isDockState ? dockW : expandedW;
  const targetH = isDockState ? dockH : expandedH;
  const targetRadius = isDockState ? 12 : panelOuterRadius;

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

      {/* Top Jump Directory: Click any recipe to activate it in the sandbox stage and scroll to stage */}
      <PageJumpDirectory
        title={`7A · Menu Layer 全链路沙盒快速跳转目录 (${visibilityTier === 'user' ? 'User Only 视图' : 'Developer Only 视图'})`}
        subtitle="点击任意卡片即可立即将该 L6 菜单组件加载至下方流体舞台并平滑定位 · 点击复制图标可复制标准引用名"
        items={MENU_SANDBOX_JUMP_ITEMS.filter((item) => item.tier === visibilityTier)}
        onSelect={(item) => {
          const r = (item as JumpDirectoryItem & { route?: ActiveMenuRoute }).route;
          if (r) handleSelectRoute(r);
        }}
        isLight={isLight}
      />

      {/* 顶部多层级快捷选择器区域 */}
      <MenuLayerRouteSelectorBar
        isLight={isLight}
        visibilityTier={visibilityTier}
        onChangeVisibilityTier={handleChangeVisibilityTier}
        layer1ContextMode={layer1ContextMode}
        onChangeLayer1ContextMode={setLayer1ContextMode}
        touchMode={touchMode}
        onToggleTouchMode={setTouchMode}
        currentRoute={currentRoute}
        handleSelectRoute={handleSelectRoute}
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        garageTab={garageTab}
        setGarageTab={setGarageTab}
        showToast={showToast}
        isDockState={isDockState}
        activeRouteSizeModeLabel={activeRouteSize.modeLabel}
        feedbackToast={feedbackToast}
        onNavigateToPlayCards={onNavigateToPlayCards}
        onNavigateShowcase={onNavigateShowcase}
        showInlineTuner={showInlineTuner}
        onToggleInlineTuner={() => setShowInlineTuner((prev) => !prev)}
      />

      {/* 7A 就地快调抽屉：无需离开 7A 舞台即可直接修改当前检测节点的容器尺寸与内部 SettingActionRow 样式 */}
      {showInlineTuner && (() => {
        const inspectorInfo = resolveNodePathInspectorLinks(currentRoute, settingsTab, garageTab);
        const activePanelId = currentRoute !== 'layer-0' ? ROUTE_TO_PANEL_ID[currentRoute] : undefined;
        return (
          <div
            className={`rounded-2xl border p-4 space-y-4 transition-colors ${
              isLight
                ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                : 'bg-neutral-900/80 border-amber-500/30 shadow-inner'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  ⚡ 7A 就地快调当前节点:
                </span>
                <span className={isLight ? 'text-neutral-700 font-semibold' : 'text-neutral-200 font-semibold'}>
                  {inspectorInfo.pageRecipeTarget.componentName} ({inspectorInfo.pageRecipeTarget.label})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onNavigateShowcase && (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateShowcase(
                        inspectorInfo.pageRecipeTarget.tab,
                        inspectorInfo.pageRecipeTarget.targetId
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-white border-neutral-200 text-neutral-700 hover:border-amber-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-amber-500/50'
                    }`}
                  >
                    打开完整独立页 [{inspectorInfo.pageRecipeTarget.code}] ↗
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowInlineTuner(false)}
                  className="px-2 py-1 rounded-lg text-[11px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  收起 ▲
                </button>
              </div>
            </div>

            {activePanelId && (
              <LocalPanelSizingTuner
                panelId={activePanelId}
                label={`${inspectorInfo.pageRecipeTarget.code} · ${inspectorInfo.pageRecipeTarget.componentName} 容器尺寸契约`}
                recommendation="实时联动下方 7A 舞台容器与 6A 独立页面"
                isLight={isLight}
              />
            )}

            {currentRoute === 'main-menu' && (
              <MainMenuStyleTuner
                isLight={isLight}
                compact
                contextMode={layer1ContextMode}
                onChangeContextMode={setLayer1ContextMode}
              />
            )}

            {(currentRoute === 'settings' || currentRoute === 'garage') && (
              <UnderlineTabsTuner
                isLight={isLight}
                showStandalonePreview={false}
              />
            )}

            {currentRoute === 'camera' && (
              <CameraSettingsStyleTuner
                isLight={isLight}
                showStandalonePreview={false}
                compact
              />
            )}

            {inspectorInfo.usesSettingActionRow && currentRoute !== 'camera' && (
              <SettingActionRowTuner
                isLight={isLight}
                showStandalonePreview={false}
              />
            )}
          </div>
        );
      })()}

      {/* ── 6D 迁移自适应引擎控制台：画布边界挤压测试 + 宽度自适应策略 + 1px 整数最小宽手动标定 ── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border text-xs transition-colors ${
          isLight
            ? 'bg-white/90 border-neutral-200/90 text-neutral-700 shadow-2xs'
            : 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-amber-500">
              6D→7A 自适应引擎:
            </span>
            <div
              className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isLight
                  ? 'bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setWidthMode('design-auto-expand')}
                className={`px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-colors ${
                  widthMode === 'design-auto-expand'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="以设计宽度为舒适基线，若内容更宽则自动撑大，若屏幕偏小则自动压缩"
              >
                设计基线+自动撑缩
              </button>
              <button
                type="button"
                onClick={() => setWidthMode('intrinsic-min')}
                className={`px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-colors ${
                  widthMode === 'intrinsic-min'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="如同 6D Floating Window：宽度完全贴合 DOM 探测出的不截断最小宽 (+16px 滚动条预留)"
              >
                6D 纯内容紧凑自适应
              </button>
            </div>
          </div>

          {currentRoute !== 'layer-0' && !isDockState && (
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className="text-neutral-400">面板实际:</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                {targetW}×{targetH}px
              </span>
              <span className="text-neutral-400">内容总高:</span>
              <span className="font-semibold">
                {activeRouteSize.intrinsicHeight}px
              </span>
              <span className="text-neutral-400 ml-1">MinW:</span>
              <button
                type="button"
                onClick={() =>
                  applyManualMinWidth(activeRouteSize.effectiveMinWidth - 1)
                }
                className={`px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
                title="最小宽 -1px"
              >
                -1
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={minWidthDraft}
                onFocus={() => setIsEditingMinWidth(true)}
                onChange={(e) => setMinWidthDraft(e.target.value)}
                onBlur={() => {
                  setIsEditingMinWidth(false);
                  const parsed = parseInt(minWidthDraft, 10);
                  if (Number.isFinite(parsed)) {
                    applyManualMinWidth(parsed);
                  } else {
                    setMinWidthDraft(
                      String(Math.round(activeRouteSize.effectiveMinWidth))
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    applyManualMinWidth(
                      activeRouteSize.effectiveMinWidth + (e.shiftKey ? 10 : 1)
                    );
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    applyManualMinWidth(
                      activeRouteSize.effectiveMinWidth - (e.shiftKey ? 10 : 1)
                    );
                  }
                }}
                className={`w-14 px-1.5 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                  hasManualMinOverride
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : isLight
                    ? 'border-neutral-300 bg-white text-neutral-800'
                    : 'border-neutral-700 bg-neutral-950 text-neutral-100'
                }`}
                title="直接输入整数最小宽 (Enter 确认，上下方向键 ±1px，Shift+方向键 ±10px)"
              />
              <button
                type="button"
                onClick={() =>
                  applyManualMinWidth(activeRouteSize.effectiveMinWidth + 1)
                }
                className={`px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
                title="最小宽 +1px"
              >
                +1
              </button>
              <span
                className="text-[10px] text-emerald-600 dark:text-emerald-400"
                title="已自动预留 16px 纵向滚动条安全槽位，防止小屏触发纵向滚动条时挤压横向文字"
              >
                [+{activeRouteSize.scrollbarReservePx}px Scrollbar]
              </span>
              {hasManualMinOverride && (
                <button
                  type="button"
                  onClick={handleResetAutoMinWidth}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-200/80 dark:bg-neutral-800 hover:text-amber-500 cursor-pointer"
                  title={`恢复 DOM 自动探测值 (${activeRouteSize.autoMinWidth}px)`}
                >
                  重置Auto({activeRouteSize.autoMinWidth})
                </button>
              )}
              {(activeRouteSize.isWidthSqueezed ||
                activeRouteSize.isHeightSqueezed) && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 font-bold">
                  画布挤压自动压缩中 (理想 {activeRouteSize.desiredWidth}×
                  {activeRouteSize.desiredHeight}px)
                </span>
              )}
            </div>
          )}
        </div>

        {/* 右侧：与 6D 完全同构的屏幕画布边界挤压模拟器 */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-neutral-400">画布边界检测:</span>
          {(
            [
              { id: 'full', label: '全宽画布 (自动撑大)' },
              { id: '1080p-compact', label: '1080p 紧凑 (760×520)' },
              { id: 'small-squeeze', label: '小屏挤压 (520×380)' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setContainerPreset(preset.id)}
              className={`px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                containerPreset === preset.id
                  ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          核心单一预览引擎舞台 (Unified Live Preview & Floating Windows Stage)
          建立统一绝对几何投影坐标系，彻底消除 FLIP scale 缩放引起的形变抽动与上下文丢失
         ────────────────────────────────────────────────────────────────────────── */}
      <div
        id="storybook-preview-stage"
        ref={stageRef}
        className={`scroll-mt-6 relative mx-auto w-full rounded-2xl border p-6 md:p-10 flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isCursorHidden ? 'cursor-none' : 'cursor-default'
        } ${
          isLight 
            ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner' 
            : 'bg-neutral-950/80 border-neutral-800 shadow-inner'
        }`}
        style={{
          minHeight:
            containerPreset === '1080p-compact'
              ? '520px'
              : containerPreset === 'small-squeeze'
              ? '380px'
              : `${Math.max(620, Math.min(980, targetH + 48))}px`,
          height:
            containerPreset === '1080p-compact'
              ? '520px'
              : containerPreset === 'small-squeeze'
              ? '380px'
              : undefined,
          maxWidth:
            containerPreset === '1080p-compact'
              ? '760px'
              : containerPreset === 'small-squeeze'
              ? '520px'
              : undefined,
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
            <span className={`text-5xl ${currentRoute === 'layer-0' || isDockState ? 'animate-bounce' : ''}`}>⚽</span>
            <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
              [Three.js Simulation Active: Ball Speed {ballSimSpeed} km/h]
            </span>
            <span className="text-xs text-neutral-400 max-w-md text-center leading-relaxed">
              {currentRoute === 'layer-0'
                ? hasStackIcon
                  ? '✨ Layer 0 状态：右上角保留 Stack 栈图标，允许拖拽观测窗口（鼠标保持显示）。点击右上角 X 可关闭图标并隐藏鼠标。'
                  : '✨ Layer 0 状态：无 Stack 图标，对局鼠标默认隐藏。按 ESC 呼出主菜单并恢复鼠标。'
                : isDockState
                ? '✨ Live Preview 已收缩至右侧 Dock 药丸：背景画面 100% 恢复渲染，无黑屏遮挡！'
                : '中央面板展开状态：背景渲染自动变暗降噪，以聚焦精细参数控制器。'}
            </span>
          </div>
        </div>

        {/* 
          1. 舞台内悬浮窗口管理器 (严格处于底层 z-[5]，在背景仿真之上、菜单变暗遮罩之下)
          当用户按 ESC 呼出主菜单时，所有展开的浮动窗口会自动被收纳折叠回到右上角的 Stack Icon 中
        */}
        <FloatingWindowManager
          isLight={isLight}
          containerRef={stageRef}
          defaultDescriptionForWindow={(win) => {
            const found = PRESET_WINDOWS.find(
              (p) => p.id === win.id || win.id.startsWith(p.id)
            );
            return (
              found?.summary ||
              win.subtitle ||
              `${win.title} · Hover controls for details · Drag bottom-right corner arc to resize.`
            );
          }}
          renderWindowContent={(item, ctx) =>
            renderFloatingWindowPanel(item.id, { isLight: ctx.isLight })
          }
        />

        {/* 2. 二级/三级菜单背景变暗遮罩 (Layer 0 与 Dock 状态完全透明，处于中层 z-10) */}
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

        {/* 2.5 舞台右上角通知中心 (QuickNotificationSystem，响应三级菜单内联报错 Check notification ↗ 点击展开) */}
        <QuickNotificationSystem
          isLight={isLight}
          absolute={true}
          className={hasStackIcon ? '!right-16' : '!right-4'}
        />

        {/* 
          3. 舞台右上角常驻 Floating Stack Icon 栈托盘 (处于顶层 z-50)
          当菜单处于打开状态时，禁止展开 Stack Tray，Hover 显示提示条，点击触发中央阻碍窗口的 Apple Sheet Shake 震动
        */}
        <FloatingStackIcon 
          isLight={isLight} 
          absolute={true} 
          containerRef={stageRef} 
          isMenuOpen={currentRoute !== 'layer-0'}
          blockedTooltipText={currentRoute === 'settings' ? 'Please close settings window first' : 'Please close active menu first'}
          onBlockedClick={() => {
            triggerShake();
            showToast('⚠️ Please close active menu first (已震动提示阻碍窗口)');
          }}
        />

        {/* 
          Layer 0 零级对局快捷呼出提示条 (仅在 Layer 0 时呈现)
        */}
        {currentRoute === 'layer-0' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md select-none transition-all shadow-xl bg-neutral-900/90 text-neutral-100 border-neutral-700/80">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-bold font-mono">Active Match (Layer 0 · In-Game Arena)</span>
              <span className="text-[11px] text-neutral-400">
                {hasStackIcon
                  ? '右上角保留 Stack 栈图标：允许自由拖拽与调节参数（鼠标保持显示）。如需沉浸隐藏鼠标，可点击右上角图标将其关闭。'
                  : '当前处于无菜单对局状态且无 Stack 图标（鼠标已隐藏）。按键盘 ESC 键呼出菜单'}
              </span>
            </div>
            <div className="h-4 w-px bg-neutral-700" />
            <button
              type="button"
              onClick={() => {
                floatingStore.triggerBatchMinimize();
                handleSelectRoute('main-menu');
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <KeycapBadge shortcut="ESC" size="sm" isLight={false} />
              <span>呼出主菜单</span>
            </button>
          </div>
        )}

        {/* 
          统一形态解耦容器 (Decoupled Stage Container)
          采用 left / top 布局坐标动画而非 CSS transform translate，并消除后台 Overlap 合成层，
          确保在任意 UI Scaling (zoom) 下始终直接走矢量文档光栅化，杜绝位图纹理拉伸发虚
        */}
        {currentRoute !== 'layer-0' && (
          <MorphContainerContext.Provider value={true}>
            <motion.div
              key="decoupled-menu-stage-wrapper"
              animate={
                isShaking
                  ? { x: [0, -10, 10, -7, 7, -3, 3, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ transform: isShaking ? undefined : 'none' }}
              className="absolute inset-0 pointer-events-none z-30"
            >
              <motion.div
                key="decoupled-menu-stage-container"
                data-morph-container="true"
                data-panel="container"
                initial={false}
                animate={{
                  left: targetX,
                  top: targetY,
                  width: targetW,
                  height: targetH,
                  borderRadius: targetRadius,
                  opacity: 1,
                }}
                transition={{
                  left: { duration: 0.28, ease: [0.2, 0.8, 0.25, 1] },
                  top: { duration: 0.28, ease: [0.2, 0.8, 0.25, 1] },
                  width: { duration: 0.28, ease: [0.2, 0.8, 0.25, 1] },
                  height: { duration: 0.28, ease: [0.2, 0.8, 0.25, 1] },
                  borderRadius: { duration: 0.28, ease: [0.2, 0.8, 0.25, 1] },
                }}
                style={{
                  position: 'absolute',
                  transform: 'none',
                }}
                className={`pointer-events-auto select-none transition-shadow overflow-hidden flex flex-col ${
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
                <div
                  ref={contentWrapperRef}
                  className={`w-full h-full flex flex-col transition-opacity ${
                    isContentVisible ? 'opacity-100 pointer-events-auto duration-150' : 'opacity-0 pointer-events-none duration-100'
                  }`}
                >
                  <MenuLayerStageRecipeRouter
                    isLight={isLight}
                    visibilityTier={visibilityTier}
                    onSwitchTier={handleChangeVisibilityTier}
                    layer1ContextMode={layer1ContextMode}
                    onChangeLayer1ContextMode={setLayer1ContextMode}
                    touchMode={touchMode}
                    onToggleTouchMode={setTouchMode}
                    displayedRoute={displayedRoute}
                    handleSelectRoute={handleSelectRoute}
                    handleNavigateBack={handleNavigateBack}
                    showToast={showToast}
                    settingsTab={settingsTab}
                    setSettingsTab={setSettingsTab}
                    garageTab={garageTab}
                    setGarageTab={setGarageTab}
                    bgRenderPaused={bgRenderPaused}
                    setBgRenderPaused={setBgRenderPaused}
                    lastParentRoute={lastParentRoute}
                    setLastParentRoute={setLastParentRoute}
                    handleAddPresetWindow={handleAddPresetWindow}
                    windows={windows}
                    minimizedCount={minimizedCount}
                    totalCount={totalCount}
                    closeWindow={closeWindow}
                    setLiveAnimPhase={setLiveAnimPhase}
                    handleTriggerCollapse={handleTriggerCollapse}
                  />
                </div>
              )}
            </motion.div>
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
