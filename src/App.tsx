import React, { useState, useEffect } from 'react';
import { Sidebar, ShowcaseTab } from './showcase/Sidebar';
import { OverviewPage } from './showcase/pages/OverviewPage';
import { BadgesPage } from './showcase/pages/BadgesPage';
import { TabsPage } from './showcase/pages/TabsPage';
import { StacksPage } from './showcase/pages/StacksPage';
import { CardsPage } from './showcase/pages/CardsPage';
import { PanelsPage } from './showcase/pages/PanelsPage';
import { DialoguePage } from './showcase/pages/DialoguePage';
import { HudElementsPage } from './showcase/pages/HudElementsPage';
import { MenusPage } from './showcase/pages/MenusPage';
import { MenuLayerPreviewPage } from './showcase/pages/MenuLayerPreviewPage';
import { MatchHudPreviewPage } from './showcase/pages/MatchHudPreviewPage';
import { LoadingScreenPreviewPage } from './showcase/pages/LoadingScreenPreviewPage';
import { NavigationPage } from './showcase/pages/NavigationPage';
import { AnimationPage } from './showcase/pages/AnimationPage';
import { RecipesPage } from './showcase/pages/RecipesPage';
import { LivePreviewSimulationPage } from './showcase/pages/LivePreviewSimulationPage';
import { FloatingWindowsSimulationPage } from './showcase/pages/FloatingWindowsSimulationPage';
import { ViewportControls } from './showcase/ViewportControls';
import { SafeAreaHud, useViewportStore, viewportStore } from './viewport';
import { ExternalLink, Code2, ShieldAlert } from 'lucide-react';
import { useAccentStore } from './tokens';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('overview');
  // Default to light mode as requested
  const [isLight, setIsLight] = useState(true);
  const { safeAreaMargin, renderScale } = useViewportStore();
  const { tokens } = useAccentStore();

  const contentScale = renderScale / 100;

  // Sync theme with document element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
      document.documentElement.classList.toggle('light', isLight);
      document.documentElement.classList.toggle('dark', !isLight);
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
              ? 'bg-white/90 border-neutral-200/90 shadow-2xs backdrop-blur'
              : 'bg-neutral-950/90 border-neutral-800 backdrop-blur'
          }`}
        >
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold tracking-tight">RLCleanWASM</span>
            <span className="text-neutral-400">/</span>
            <span className={`font-mono font-medium ${tokens.text}`}>UIStorybook Architecture</span>
          </div>

          {/* Right Toolbar: UI Scaling Slider + Safe Area Margin Button + HUD Toggle + Links */}
          <div className="flex items-center gap-4">
            <ViewportControls isLight={isLight} />

            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />

            <a
              href="https://github.com/Antigravi-ty/RLCleanWASM"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Reference Repo</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </header>

        {/* Lower Workspace: 包含固定在左侧的 Sidebar 与右侧可滚动的 Content */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Navigation Sidebar: 始终固定在左侧，尺寸固定 100%，内部独立滚动 */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isLight={isLight}
            onToggleTheme={() => setIsLight((prev) => !prev)}
          />

          {/* Main Content Viewport: 独立滚动区域，Scaling 仅作用于此！ */}
          <main className="flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0 relative bg-white dark:bg-neutral-950">
            <div
              className="p-6 md:p-10 lg:p-12 transition-transform duration-100 origin-top-left"
              style={{
                transform: `scale(${contentScale})`,
                transformOrigin: 'top left',
                width: contentScale !== 1 ? `${100 / contentScale}%` : '100%',
              }}
            >
              {activeTab === 'overview' && <OverviewPage isLight={isLight} />}
              {activeTab === 'badges' && <BadgesPage isLight={isLight} />}
              {activeTab === 'tabs' && <TabsPage isLight={isLight} />}
              {activeTab === 'hud-elements' && <HudElementsPage isLight={isLight} />}
              {activeTab === 'stacks' && <StacksPage isLight={isLight} />}
              {activeTab === 'cards' && <CardsPage isLight={isLight} />}
              {activeTab === 'panels' && <PanelsPage isLight={isLight} />}
              {activeTab === 'dialogue' && <DialoguePage isLight={isLight} />}
              {activeTab === 'layer-preview' && (
                <MenuLayerPreviewPage 
                  isLight={isLight} 
                  onNavigateToReserved={() => setActiveTab('menus')} 
                />
              )}
              {activeTab === 'hud-preview' && (
                <MatchHudPreviewPage isLight={isLight} />
              )}
              {activeTab === 'loading-preview' && (
                <LoadingScreenPreviewPage isLight={isLight} />
              )}
              {activeTab === 'menus' && (
                <MenusPage 
                  isLight={isLight} 
                  onNavigateToLayers={() => setActiveTab('layer-preview')} 
                />
              )}
              {activeTab === 'navigation' && <NavigationPage isLight={isLight} />}
              {activeTab === 'live-preview' && <LivePreviewSimulationPage isLight={isLight} />}
              {activeTab === 'floating-windows' && <FloatingWindowsSimulationPage isLight={isLight} />}
              {activeTab === 'animation' && <AnimationPage isLight={isLight} />}
              {activeTab === 'recipes' && <RecipesPage isLight={isLight} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
