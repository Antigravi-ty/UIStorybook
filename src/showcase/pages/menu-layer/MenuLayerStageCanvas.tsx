import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { KeycapBadge } from '../../../primitives/KeycapBadge';
import { MorphContainerContext } from '../../../tokens/morphContext';
import { FloatingStackIcon } from '../../../navigation/FloatingStackIcon';
import { FloatingWindowManager } from '../../../navigation/FloatingWindowManager';
import { QuickNotificationSystem } from '../../../navigation/QuickNotificationSystem';
import { floatingStore, type FloatingWindowItem } from '../../../tokens/floatingStore';
import { PRESET_WINDOWS, type PresetConfig } from '../../../tokens/floatingPresets';
import { renderFloatingWindowPanel } from '../../../panels';
import type { Layer1MenuContextMode } from '../../../recipes/Layer1MainMenuRecipe';
import type {
  ActiveMenuRoute,
  LivePreviewAnimPhase,
  MenuVisibilityTier,
} from './menuLayerRouteConfig';
import { MenuLayerStageRecipeRouter } from './MenuLayerStageRecipeRouter';

export interface MenuLayerStageCanvasProps {
  isLight: boolean;
  stageRef: React.RefObject<HTMLDivElement | null>;
  contentWrapperRef: React.RefObject<HTMLDivElement | null>;
  containerPreset: 'full' | '1080p-compact' | 'small-squeeze';
  isCursorHidden: boolean;
  currentRoute: ActiveMenuRoute;
  displayedRoute: ActiveMenuRoute;
  isDockState: boolean;
  ballSimSpeed: number;
  hasStackIcon: boolean;
  backdropDuration: number;
  triggerShake: () => void;
  showToast: (msg: string) => void;
  handleSelectRoute: (
    targetRoute: ActiveMenuRoute,
    options?: { pushHistory?: boolean }
  ) => void;
  handleNavigateBack: () => void;
  isShaking: boolean;
  targetX: number;
  targetY: number;
  targetW: number;
  targetH: number;
  targetRadius: number;
  handleTriggerExpand: () => void;
  handleTriggerCollapse: () => void;
  isPillHovered: boolean;
  setIsPillHovered: (v: boolean) => void;
  isPillContentVisible: boolean;
  isContentVisible: boolean;
  visibilityTier: MenuVisibilityTier;
  handleChangeVisibilityTier: (tier: MenuVisibilityTier) => void;
  layer1ContextMode: Layer1MenuContextMode;
  setLayer1ContextMode: (mode: Layer1MenuContextMode) => void;
  touchMode: boolean;
  setTouchMode: (v: boolean) => void;
  settingsTab: string;
  setSettingsTab: (tab: string) => void;
  garageTab: string;
  setGarageTab: (tab: string) => void;
  bgRenderPaused: boolean;
  setBgRenderPaused: (v: boolean) => void;
  lastParentRoute: ActiveMenuRoute;
  setLastParentRoute: (r: ActiveMenuRoute) => void;
  handleAddPresetWindow: (
    preset: PresetConfig,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
  windows: FloatingWindowItem[];
  minimizedCount: number;
  totalCount: number;
  closeWindow: (id: string) => void;
  setLiveAnimPhase: (phase: LivePreviewAnimPhase) => void;
}

export const MenuLayerStageCanvas: React.FC<MenuLayerStageCanvasProps> = ({
  isLight,
  stageRef,
  contentWrapperRef,
  containerPreset,
  isCursorHidden,
  currentRoute,
  displayedRoute,
  isDockState,
  ballSimSpeed,
  hasStackIcon,
  backdropDuration,
  triggerShake,
  showToast,
  handleSelectRoute,
  handleNavigateBack,
  isShaking,
  targetX,
  targetY,
  targetW,
  targetH,
  targetRadius,
  handleTriggerExpand,
  handleTriggerCollapse,
  isPillHovered,
  setIsPillHovered,
  isPillContentVisible,
  isContentVisible,
  visibilityTier,
  handleChangeVisibilityTier,
  layer1ContextMode,
  setLayer1ContextMode,
  touchMode,
  setTouchMode,
  settingsTab,
  setSettingsTab,
  garageTab,
  setGarageTab,
  bgRenderPaused,
  setBgRenderPaused,
  lastParentRoute,
  setLastParentRoute,
  handleAddPresetWindow,
  windows,
  minimizedCount,
  totalCount,
  closeWindow,
  setLiveAnimPhase,
}) => {
  return (
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
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
          currentRoute === 'layer-0' || isDockState ? 'opacity-100' : 'opacity-25'
        }`}
      >
        <div className="flex flex-col items-center gap-2 select-none">
          <span
            className={`text-5xl ${
              currentRoute === 'layer-0' || isDockState ? 'animate-bounce' : ''
            }`}
          >
            ⚽
          </span>
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

      <QuickNotificationSystem
        isLight={isLight}
        absolute={true}
        className={hasStackIcon ? '!right-16' : '!right-4'}
      />

      <FloatingStackIcon
        isLight={isLight}
        absolute={true}
        containerRef={stageRef}
        isMenuOpen={currentRoute !== 'layer-0'}
        blockedTooltipText={
          currentRoute === 'settings'
            ? 'Please close settings window first'
            : 'Please close active menu first'
        }
        onBlockedClick={() => {
          triggerShake();
          showToast('⚠️ Please close active menu first (已震动提示阻碍窗口)');
        }}
      />

      {currentRoute === 'layer-0' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md select-none transition-all shadow-xl bg-neutral-900/90 text-neutral-100 border-neutral-700/80">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-bold font-mono">
              Active Match (Layer 0 · In-Game Arena)
            </span>
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

      {currentRoute !== 'layer-0' && (
        <MorphContainerContext.Provider value={true}>
          <motion.div
            key="decoupled-menu-stage-wrapper"
            animate={
              isShaking ? { x: [0, -10, 10, -7, 7, -3, 3, 0] } : { x: 0 }
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
                  <div
                    className={`h-3.5 w-px ${
                      isLight ? 'bg-neutral-200' : 'bg-neutral-700'
                    }`}
                  />
                  <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
                </div>
              ) : (
                <div
                  ref={contentWrapperRef}
                  className={`w-full h-full flex flex-col transition-opacity ${
                    isContentVisible
                      ? 'opacity-100 pointer-events-auto duration-150'
                      : 'opacity-0 pointer-events-none duration-100'
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
  );
};
