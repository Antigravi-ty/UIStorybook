import React, { useEffect, Suspense, lazy } from 'react';
import { Sidebar, ShowcaseTab } from './showcase/Sidebar';
import { OverviewPage } from './showcase/pages/OverviewPage';
import { ViewportControls } from './showcase/ViewportControls';

const BadgesPage = lazy(() => import('./showcase/pages/BadgesPage').then((m) => ({ default: m.BadgesPage })));
const TabsPage = lazy(() => import('./showcase/pages/TabsPage').then((m) => ({ default: m.TabsPage })));
const StacksPage = lazy(() => import('./showcase/pages/StacksPage').then((m) => ({ default: m.StacksPage })));
const CardsPage = lazy(() => import('./showcase/pages/CardsPage').then((m) => ({ default: m.CardsPage })));
const PlayCardPage = lazy(() => import('./showcase/pages/PlayCardPage').then((m) => ({ default: m.PlayCardPage })));
const PanelsPage = lazy(() => import('./showcase/pages/PanelsPage').then((m) => ({ default: m.PanelsPage })));
const DialoguePage = lazy(() => import('./showcase/pages/DialoguePage').then((m) => ({ default: m.DialoguePage })));
const QuickNotificationPage = lazy(() => import('./showcase/pages/QuickNotificationPage').then((m) => ({ default: m.QuickNotificationPage })));
const NotificationIntegrationPage = lazy(() => import('./showcase/pages/NotificationIntegrationPage').then((m) => ({ default: m.NotificationIntegrationPage })));
const HudElementsPage = lazy(() => import('./showcase/pages/HudElementsPage').then((m) => ({ default: m.HudElementsPage })));
const CenterUpperInfoPage = lazy(() => import('./showcase/pages/CenterUpperInfoPage').then((m) => ({ default: m.CenterUpperInfoPage })));
const StatsEventFeedPage = lazy(() => import('./showcase/pages/StatsEventFeedPage').then((m) => ({ default: m.StatsEventFeedPage })));
const TemporalOverlayPage = lazy(() => import('./showcase/pages/TemporalOverlayPage').then((m) => ({ default: m.TemporalOverlayPage })));
const MenusPage = lazy(() => import('./showcase/pages/MenusPage').then((m) => ({ default: m.MenusPage })));
const MenuLayerPreviewPage = lazy(() => import('./showcase/pages/MenuLayerPreviewPage').then((m) => ({ default: m.MenuLayerPreviewPage })));
const LoadingScreenPreviewPage = lazy(() => import('./showcase/pages/LoadingScreenPreviewPage').then((m) => ({ default: m.LoadingScreenPreviewPage })));
const NavigationPage = lazy(() => import('./showcase/pages/NavigationPage').then((m) => ({ default: m.NavigationPage })));
const AnimationPage = lazy(() => import('./showcase/pages/AnimationPage').then((m) => ({ default: m.AnimationPage })));
const RecipesPage = lazy(() => import('./showcase/pages/RecipesPage').then((m) => ({ default: m.RecipesPage })));
const LivePreviewSimulationPage = lazy(() => import('./showcase/pages/LivePreviewSimulationPage').then((m) => ({ default: m.LivePreviewSimulationPage })));
const EdgeInspectorSimulationPage = lazy(() => import('./showcase/pages/EdgeInspectorSimulationPage').then((m) => ({ default: m.EdgeInspectorSimulationPage })));
const FloatingWindowsSimulationPage = lazy(() => import('./showcase/pages/FloatingWindowsSimulationPage').then((m) => ({ default: m.FloatingWindowsSimulationPage })));
const FloatingWindowVariationPage = lazy(() => import('./showcase/pages/FloatingWindowVariationPage').then((m) => ({ default: m.FloatingWindowVariationPage })));
const ChartsAndCurvesPage = lazy(() => import('./showcase/pages/ChartsAndCurvesPage').then((m) => ({ default: m.ChartsAndCurvesPage })));
const ComposableNestingPage = lazy(() => import('./showcase/pages/ComposableNestingPage').then((m) => ({ default: m.ComposableNestingPage })));
const FoundationsPage = lazy(() => import('./showcase/pages/FoundationsPage').then((m) => ({ default: m.FoundationsPage })));
const ViewportSafeAreaPage = lazy(() => import('./showcase/pages/ViewportSafeAreaPage').then((m) => ({ default: m.ViewportSafeAreaPage })));
import { SafeAreaHud, useViewportStore, viewportStore } from './viewport';
import { DialogueStackContainer } from './primitives/Dialogue';
import { SectionErrorBoundary } from './primitives/SectionErrorBoundary';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAccentStore, readUrlParams, updateUrlParams, useSyncedState } from './showcase/stores';

interface JumpOriginRecord {
  fromTab: ShowcaseTab;
  fromHref: string;
  fromDesc: string;
  toTab: ShowcaseTab;
  targetId?: string;
}

export const App: React.FC = () => {
  const initialUrlTab = (readUrlParams().tab as ShowcaseTab | undefined) || 'overview';
  const [activeTab, setActiveTab] = useSyncedState<ShowcaseTab>('app:activeTab', initialUrlTab);
  // Default to light mode as requested, synced across connected clients
  const [isLight, setIsLight] = useSyncedState<boolean>('app:isLight', true);
  const [lastJumpOrigin, setLastJumpOrigin] = React.useState<JumpOriginRecord | null>(null);
  const { safeAreaMargin, renderScale } = useViewportStore();
  const { tokens } = useAccentStore();

  const contentScale = renderScale / 100;

  const scrollToAnchorWithRetry = React.useCallback((targetId?: string) => {
    if (!targetId || typeof document === 'undefined') return;
    const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;
    if (!cleanId) return;
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(cleanId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 18) {
        window.setTimeout(tryScroll, 80);
      }
    };
    window.setTimeout(tryScroll, 60);
  }, []);

  // Ensure initial URL query string has ?tab=... and scroll to initial hash if present
  useEffect(() => {
    updateUrlParams({ tab: activeTab });
    if (typeof window !== 'undefined' && window.location.hash) {
      scrollToAnchorWithRetry(window.location.hash);
    }
  }, []);

  // Sync activeTab into URL if changed externally (e.g., cross-client sync) without overwriting history stack
  useEffect(() => {
    const urlTab = readUrlParams().tab;
    if (urlTab !== activeTab) {
      updateUrlParams({ tab: activeTab });
    }
  }, [activeTab]);

  // Listen to browser Back / Forward (popstate) to restore previous page & anchor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = readUrlParams();
      const nextTab = (params.tab as ShowcaseTab | undefined) || 'overview';
      setActiveTab(nextTab);
      if (window.location.hash) {
        scrollToAnchorWithRetry(window.location.hash);
      }
      setLastJumpOrigin((prev) => (prev && prev.fromTab === nextTab ? null : prev));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, scrollToAnchorWithRetry]);

  // Manual sidebar / page tab selection (pushes browser history entry)
  const handleSelectTab = React.useCallback(
    (nextTab: ShowcaseTab) => {
      updateUrlParams({ tab: nextTab }, { push: true, hash: null });
      setActiveTab(nextTab);
    },
    [setActiveTab]
  );

  // Cross-page navigation helper with browser history push & automatic anchor scroll after lazy module mount
  const handleNavigateShowcase = React.useCallback(
    (tab: ShowcaseTab, targetId?: string) => {
      if (typeof window !== 'undefined') {
        const p = readUrlParams();
        const routeDesc =
          activeTab === 'layer-preview'
            ? `7A Menu Layer (${p.route || 'main-menu'}${p.subtab ? ` · ${p.subtab}` : ''})`
            : activeTab;
        setLastJumpOrigin({
          fromTab: activeTab,
          fromHref: `${window.location.pathname}${window.location.search}${window.location.hash}`,
          fromDesc: routeDesc,
          toTab: tab,
          targetId,
        });
      }
      updateUrlParams(
        { tab, ...(tab === 'recipes' && targetId ? { recipe: targetId } : {}) },
        { push: true, hash: targetId ?? null }
      );
      setActiveTab(tab);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
      scrollToAnchorWithRetry(targetId);
    },
    [activeTab, setActiveTab, scrollToAnchorWithRetry]
  );

  const handleReturnToJumpOrigin = React.useCallback(() => {
    if (!lastJumpOrigin) return;
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(window.history.state, '', lastJumpOrigin.fromHref);
      } catch {
        // ignore
      }
    }
    setActiveTab(lastJumpOrigin.fromTab);
    setLastJumpOrigin(null);
  }, [lastJumpOrigin, setActiveTab]);

  // Sync theme with document element (including explicit colorScheme so mobile browsers do not force auto-dark inversion)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
      document.documentElement.classList.toggle('light', isLight);
      document.documentElement.classList.toggle('dark', !isLight);
      document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
    }
  }, [isLight]);

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden select-none transition-colors duration-150 ${
        isLight ? 'bg-neutral-800' : 'bg-black'
      }`}
    >
      {/* Global Safe Area HUD Overlay (Fixed directly to physical display window) */}
      <SafeAreaHud isLight={isLight} />

      {/* Global Dialogue Stack Container: Handles all programmatic dialogue.show calls */}
      <DialogueStackContainer isLight={isLight} />

      {/* Emergency Safe Area Recovery Floating Pill (only shown when negative margin bleeds outer controls) */}
      {safeAreaMargin < 0 && (
        <div className="fixed bottom-3 right-3 z-[700] flex items-center gap-2.5 bg-neutral-900/95 text-neutral-200 border border-neutral-700/80 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur text-xs font-mono">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
          <span>Safe Area: <strong className="text-amber-400 font-bold">{safeAreaMargin}%</strong> (Overscan Bleed)</span>
          <button
            type="button"
            onClick={() => viewportStore.setSafeAreaMargin(0)}
            className={`px-2 py-0.5 rounded ${tokens.accent} ${tokens.accentHover} font-sans text-[11px] font-semibold cursor-pointer transition-colors`}
          >
            Reset (0%)
          </button>
        </div>
      )}

      {/* Main UI Outer Frame:
          Controlled by safeAreaMargin (-5% ~ +10%).
          - When safeAreaMargin > 0 (+5%): Outer frame contracts inward by 5% on all 4 edges.
          - When safeAreaMargin < 0 (-5%): Outer frame expands 5% OUTSIDE the physical screen bounds,
            causing the header bar and sidebar to push outside the visible window.
      */}
      <div
        className={`absolute flex flex-col transition-all duration-150 overflow-hidden ${
          isLight ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-neutral-100'
        }`}
        style={{
          top: `${safeAreaMargin}%`,
          bottom: `${safeAreaMargin}%`,
          left: `${safeAreaMargin}%`,
          right: `${safeAreaMargin}%`,
        }}
      >
        {/* Top Header Bar: 始终固定在 UI 外框正上方 */}
        <header
          className={`h-16 px-6 md:px-8 border-b flex items-center justify-between shrink-0 select-none z-20 transition-colors ${
            isLight
              ? 'bg-white border-neutral-200/90 shadow-2xs'
              : 'bg-neutral-950 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold tracking-tight">UIStorybook</span>
            <span className="text-neutral-400">/</span>
            <span className={`font-mono font-medium ${tokens.text}`}>Component Architecture</span>
          </div>

          {/* Right Toolbar: UI Scaling Slider + Safe Area Margin Button + HUD Toggle */}
          <div className="flex items-center gap-4">
            <ViewportControls isLight={isLight} />
          </div>
        </header>

        {/* Lower Workspace: 包含固定在左侧的 Sidebar 与右侧可滚动的 Content */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Navigation Sidebar: 始终固定在左侧，尺寸固定 100%，内部独立滚动 */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isLight={isLight}
            onToggleTheme={() => setIsLight((prev) => !prev)}
          />

          {/* Main Content Viewport: 独立滚动区域，Scaling 仅作用于此！ */}
          <main className="flex-1 h-full overflow-y-auto overflow-x-auto [overflow-anchor:none] min-w-0 relative bg-white dark:bg-neutral-950">
            {lastJumpOrigin && lastJumpOrigin.toTab === activeTab && (
              <div
                className={`sticky top-0 z-40 px-6 py-2 border-b flex items-center justify-between gap-3 text-xs font-mono backdrop-blur-md ${
                  isLight
                    ? 'bg-amber-50/95 border-amber-200/90 text-amber-900 shadow-2xs'
                    : 'bg-neutral-900/95 border-amber-500/30 text-amber-200 shadow-md'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.history.length > 1) {
                        window.history.back();
                      } else {
                        handleReturnToJumpOrigin();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>返回上一跳页面 ({lastJumpOrigin.fromDesc})</span>
                  </button>
                  <span className="opacity-80">
                    已将跳转写入浏览器 History 栈（支持浏览器后退键 ◀ 或点击左侧按钮一键返回）
                    {lastJumpOrigin.targetId ? ` · 当前定位锚点: #${lastJumpOrigin.targetId}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLastJumpOrigin(null)}
                  className="px-2 py-0.5 rounded opacity-60 hover:opacity-100 cursor-pointer"
                >
                  关闭提示 ✕
                </button>
              </div>
            )}
            <div
              className={contentScale > 1.25 ? 'p-4 md:p-6' : 'p-6 md:p-10 lg:p-12'}
              style={contentScale === 1 ? undefined : { zoom: contentScale }}
            >
              <SectionErrorBoundary
                title={`Page: ${activeTab}`}
                resetKey={activeTab}
                isLight={isLight}
              >
                <Suspense fallback={<div className="py-12 text-xs font-mono text-neutral-400">Loading showcase module...</div>}>
                  {activeTab === 'overview' && (
                    <OverviewPage isLight={isLight} onSelectTab={handleSelectTab} />
                  )}
                  {activeTab === 'foundations' && <FoundationsPage isLight={isLight} />}
                  {activeTab === 'badges' && <BadgesPage isLight={isLight} />}
                  {activeTab === 'tabs' && <TabsPage isLight={isLight} />}
                  {activeTab === 'composable-tuner' && <ComposableNestingPage isLight={isLight} />}
                  {activeTab === 'charts-curves' && <ChartsAndCurvesPage isLight={isLight} />}
                  {activeTab === 'hud-elements' && <HudElementsPage isLight={isLight} />}
                  {activeTab === 'center-upper-info' && <CenterUpperInfoPage isLight={isLight} />}
                  {activeTab === 'stats-event-feed' && <StatsEventFeedPage isLight={isLight} />}
                  {activeTab === 'temporal-t5a' && <TemporalOverlayPage isLight={isLight} />}
                  {activeTab === 'viewport-safe-area' && <ViewportSafeAreaPage isLight={isLight} />}
                  {activeTab === 'stacks' && <StacksPage isLight={isLight} />}
                  {activeTab === 'cards' && (
                    <CardsPage
                      isLight={isLight}
                      onNavigateToPlayCards={() => handleNavigateShowcase('play-cards')}
                    />
                  )}
                  {activeTab === 'play-cards' && (
                    <PlayCardPage
                      isLight={isLight}
                      onNavigateToSandboxPlay={() => {
                        updateUrlParams(
                          { tab: 'layer-preview', tier: 'user', route: 'play' },
                          { push: true, hash: 'storybook-preview-stage' }
                        );
                        setActiveTab('layer-preview');
                      }}
                    />
                  )}
                  {activeTab === 'panels' && <PanelsPage isLight={isLight} />}
                  {activeTab === 'dialogue' && <DialoguePage isLight={isLight} />}
                  {activeTab === 'quick-notification' && <QuickNotificationPage isLight={isLight} />}
                  {activeTab === 'notification-integration' && (
                    <NotificationIntegrationPage isLight={isLight} />
                  )}
                  {activeTab === 'layer-preview' && (
                    <MenuLayerPreviewPage 
                      isLight={isLight} 
                      onNavigateToReserved={() => handleNavigateShowcase('menus')} 
                      onNavigateToPlayCards={() => handleNavigateShowcase('play-cards')}
                      onNavigateShowcase={handleNavigateShowcase}
                    />
                  )}
                  {activeTab === 'loading-preview' && (
                    <LoadingScreenPreviewPage isLight={isLight} />
                  )}
                  {activeTab === 'menus' && (
                    <MenusPage 
                      isLight={isLight} 
                      onNavigateToLayers={() => handleNavigateShowcase('layer-preview')} 
                    />
                  )}
                  {activeTab === 'navigation' && <NavigationPage isLight={isLight} />}
                  {activeTab === 'live-preview' && <LivePreviewSimulationPage isLight={isLight} />}
                  {activeTab === 'edge-inspector' && <EdgeInspectorSimulationPage isLight={isLight} />}
                  {activeTab === 'floating-windows' && <FloatingWindowsSimulationPage isLight={isLight} />}
                  {activeTab === 'floating-window-3stage' && <FloatingWindowVariationPage isLight={isLight} />}
                  {activeTab === 'animation' && <AnimationPage isLight={isLight} />}
                  {activeTab === 'recipes' && <RecipesPage isLight={isLight} />}
                </Suspense>
              </SectionErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
