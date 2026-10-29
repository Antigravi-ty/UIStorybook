import React from 'react';
import {
  Check,
  Gamepad2,
  Wrench,
  Settings,
  Play,
  Server,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Terminal,
  Smartphone,
  Sliders,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import { Badge } from '../../../primitives/Badge';
import { UnderlineTabs } from '../../../primitives/UnderlineTabs';
import { useMenuLayoutStore, DEFAULT_PANEL_SIZING, type MenuPanelId } from '../../../tokens';
import {
  usePlayCardStyleStore,
  type PlayCardStyleVariant,
} from '../../../tokens/playCardStyleStore';
import {
  useMainMenuStyleStore,
  MAIN_MENU_STYLE_PRESETS,
} from '../../../tokens/mainMenuStyleStore';
import {
  useCameraSettingsStyleStore,
  CAMERA_SETTINGS_STYLE_PRESETS,
  type CameraSettingsPresetId,
} from '../../../tokens/cameraSettingsStyleStore';
import { useQuickNotificationStore } from '../../../tokens/quickNotificationStore';
import {
  dispatchOnlineRoomErrorNotification,
  Layer1ContextGroupedSelector,
  ONLINE_SESSION_CONTEXT_SPECS,
  resolveLayer1ContextSpec,
  resolveOnlineSessionContextId,
  type Layer1MenuContextMode,
} from '../../../recipes';
import type { ShowcaseTab } from '../../Sidebar';
import {
  type ActiveMenuRoute,
  type MenuVisibilityTier,
  MENU_ROUTE_CONFIG,
  USER_SETTINGS_QUICK_TABS,
  DEV_SETTINGS_QUICK_TABS,
  GARAGE_QUICK_TABS,
  USER_LINEAR_PLAYLIST,
  DEV_LINEAR_PLAYLIST,
} from './menuLayerRouteConfig';
import { resolveNodePathInspectorLinks } from './menuLayerInspectorLinks';

export interface MenuLayerRouteSelectorBarProps {
  isLight: boolean;
  visibilityTier: MenuVisibilityTier;
  onChangeVisibilityTier: (tier: MenuVisibilityTier) => void;
  layer1ContextMode: Layer1MenuContextMode;
  onChangeLayer1ContextMode: (mode: Layer1MenuContextMode) => void;
  touchMode: boolean;
  onToggleTouchMode: (enabled: boolean) => void;
  currentRoute: ActiveMenuRoute;
  handleSelectRoute: (route: ActiveMenuRoute) => void;
  settingsTab: string;
  setSettingsTab: (tab: string) => void;
  garageTab: string;
  setGarageTab: (tab: string) => void;
  showToast: (msg: string) => void;
  isDockState: boolean;
  activeRouteSizeModeLabel: string;
  feedbackToast: string | null;
  onNavigateToPlayCards?: () => void;
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  showInlineTuner?: boolean;
  onToggleInlineTuner?: () => void;
}

export const MenuLayerRouteSelectorBar = React.memo<MenuLayerRouteSelectorBarProps>(({
  isLight,
  visibilityTier,
  onChangeVisibilityTier,
  layer1ContextMode,
  onChangeLayer1ContextMode,
  touchMode,
  onToggleTouchMode,
  currentRoute,
  handleSelectRoute,
  settingsTab,
  setSettingsTab,
  garageTab,
  setGarageTab,
  showToast,
  isDockState,
  activeRouteSizeModeLabel,
  feedbackToast,
  onNavigateToPlayCards,
  onNavigateShowcase,
  showInlineTuner = false,
  onToggleInlineTuner,
}) => {
  const { panels, simulateLayer3Error, setToken } = useMenuLayoutStore();
  const { variant: playCardVariant, setVariant: setPlayCardVariant } = usePlayCardStyleStore();
  const mainMenuStyle = useMainMenuStyleStore();
  const cameraStyle = useCameraSettingsStyleStore();
  const getPanelWidth = (panelId: MenuPanelId) =>
    (panels?.[panelId] ?? DEFAULT_PANEL_SIZING[panelId])?.width ?? 480;

  const activePlaylist = visibilityTier === 'user' ? USER_LINEAR_PLAYLIST : DEV_LINEAR_PLAYLIST;

  const normalizedLayer1Ctx = resolveLayer1ContextSpec(layer1ContextMode).id;

  // Locate current index in linear playlist
  const currentPlaylistIndex = Math.max(
    0,
    activePlaylist.findIndex((step) => {
      if (step.route !== currentRoute) return false;
      if (currentRoute === 'main-menu' && step.contextMode) {
        return step.contextMode === normalizedLayer1Ctx;
      }
      if (currentRoute === 'settings' && step.subtab) {
        return step.subtab === settingsTab;
      }
      if (currentRoute === 'garage' && step.subtab) {
        return step.subtab === garageTab;
      }
      return true;
    })
  );

  const currentStep = activePlaylist[currentPlaylistIndex] || activePlaylist[0];

  const applyPlaylistStep = (idx: number) => {
    const wrapped = (idx + activePlaylist.length) % activePlaylist.length;
    const step = activePlaylist[wrapped];
    if (!step) return;
    if (step.contextMode) {
      onChangeLayer1ContextMode(step.contextMode);
    }
    if (step.route === 'settings' && step.subtab) {
      setSettingsTab(step.subtab);
    }
    if (step.route === 'garage' && step.subtab) {
      setGarageTab(step.subtab);
    }
    handleSelectRoute(step.route);
    showToast(`[${wrapped + 1}/${activePlaylist.length}] ${step.label}`);
  };

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-colors ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
      }`}
    >
      {/* Top Bar: Strict User Only vs Developer Only Split + < Prev Page | Next Page > Linear Scanner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        {/* Strict Tier Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            视图隔离 (Strict Tier):
          </span>
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100/80 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => onChangeVisibilityTier('user')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                visibilityTier === 'user'
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>User Only ({USER_LINEAR_PLAYLIST.length} Pages)</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeVisibilityTier('developer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                visibilityTier === 'developer'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Developer Only ({DEV_LINEAR_PLAYLIST.length} Pages)</span>
            </button>
          </div>

          {visibilityTier === 'developer' && (
            <button
              type="button"
              onClick={() => onToggleTouchMode(!touchMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold cursor-pointer transition-colors ${
                touchMode
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                  : isLight
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-600'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title="Simulate ?touch=1 Touch Controls Agent Switcher in Layer 1 Main Menu"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>?touch={touchMode ? '1' : '0'}</span>
            </button>
          )}
        </div>

        {/* Linear Playlist Scanner (< Prev Page | [N/M] | Next Page >) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => applyPlaylistStep(currentPlaylistIndex - 1)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev Page</span>
          </button>

          <div
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-2 ${
              isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
                : 'bg-neutral-950 border-neutral-800 text-neutral-200'
            }`}
          >
            <span className="font-bold text-amber-500">
              [{currentPlaylistIndex + 1} / {activePlaylist.length}]
            </span>
            <span className="truncate max-w-[230px] font-semibold">{currentStep?.label}</span>
          </div>

          <button
            type="button"
            onClick={() => applyPlaylistStep(currentPlaylistIndex + 1)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
            }`}
          >
            <span>Next Page</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Layer 0: Active Match (Shown in User Mode) */}
      {visibilityTier === 'user' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
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
      )}

      {/* Layer 1: Main Menu + Dynamic Context Variations */}
      <div className="flex flex-col gap-2 text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="primary" size="sm" isLight={isLight}>
              Layer 1
            </Badge>
            <span>一级根菜单变体</span>
          </div>

          <Layer1ContextGroupedSelector
            activeContext={normalizedLayer1Ctx}
            onSelectContext={(ctx) => {
              onChangeLayer1ContextMode(ctx);
              handleSelectRoute('main-menu');
            }}
            tierFilter={visibilityTier}
            isRouteActive={currentRoute === 'main-menu'}
            isLight={isLight}
          />
        </div>

        {/* Sub-bar when Layer 1 Main Menu is active: Quick Style Presets + Toggles + Jump to 6A.1M */}
        {currentRoute === 'main-menu' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>
                L1 MENU 选单极简大字方案切换 (当前: {mainMenuStyle.titleFontSizePx}px{' '}
                {mainMenuStyle.titleFontFamily === 'mono' ? 'JetBrains Mono' : 'Apple Sans'} ·{' '}
                {mainMenuStyle.showDescription ? '含 Description' : '无 Description'} ·{' '}
                {mainMenuStyle.conciseResumeLabel ? 'Resume 短标题' : 'Resume Match'}):
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {onToggleInlineTuner && (
                  <button
                    type="button"
                    onClick={onToggleInlineTuner}
                    className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-bold cursor-pointer"
                  >
                    <Sliders className="h-3 w-3" />
                    <span>{showInlineTuner ? '收起就地全参数调优台 ▲' : '展开就地全参数调优台 ▼'}</span>
                  </button>
                )}
                {onNavigateShowcase && (
                  <button
                    type="button"
                    onClick={() => onNavigateShowcase('recipes', 'main-menu-style-tuner')}
                    className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                  >
                    <span>打开 6A.1M MENU 全参数工作台与三方案同屏对比</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {MAIN_MENU_STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    mainMenuStyle.applyPreset(preset.params);
                    showToast(`已切换 L1 MENU 样式至: ${preset.label}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    isLight
                      ? 'bg-neutral-50 hover:bg-amber-50/70 border-neutral-200 hover:border-amber-400 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 hover:border-amber-500/60 text-neutral-200'
                  }`}
                  title={preset.subtitle}
                >
                  {preset.label.split(' · ')[0]} · {preset.label.split(' · ')[1] || ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Layer 2: Secondary Menus (Strictly separated by User vs Developer) */}
      <div className="flex flex-col gap-2 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="warning" size="sm" isLight={isLight}>
              Layer 2
            </Badge>
            <span>二级功能菜单</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visibilityTier === 'user' ? (
              <>
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
                  <span>Play (6 种玩法网格)</span>
                  <span className="font-mono text-[10px] opacity-75">
                    {getPanelWidth('layer2-play')}px
                  </span>
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
                  <span>Garage (5 Tabs 含 Materials)</span>
                  <span className="font-mono text-[10px] opacity-75">
                    {getPanelWidth('layer2-garage')}px
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (settingsTab === 'developer') setSettingsTab('gameplay');
                    handleSelectRoute('settings');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    currentRoute === 'settings'
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Settings (User 4 Tabs · 图标+文本)</span>
                  <span className="font-mono text-[10px] opacity-75">
                    {getPanelWidth('layer2-settings')}px
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoute('room-host-control')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    currentRoute === 'room-host-control'
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Server className="h-3.5 w-3.5" />
                  <span>Room Host Control (房主控制台)</span>
                  <span className="font-mono text-[10px] opacity-75">
                    {getPanelWidth('layer2-room-host-control')}px
                  </span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSettingsTab('developer');
                  handleSelectRoute('settings');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  currentRoute === 'settings'
                    ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Settings → Developer Tab (5 大开发者中心入口)</span>
                <span className="font-mono text-[10px] opacity-75">
                  {getPanelWidth('layer2-settings')}px
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-bar when Play is active: 3 Card Styles Quick Switcher + Jump to L2 PlayCardPage */}
        {currentRoute === 'play' && visibilityTier === 'user' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>L2 Play 菜单卡片风格切换 (PlayModeCard 3 Archetypes):</span>
              {onNavigateToPlayCards && (
                <button
                  type="button"
                  onClick={onNavigateToPlayCards}
                  className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                >
                  <span>打开 L2 · 2B PlayCard 三风格参数调优专页</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  {
                    id: 'icon-badge-top',
                    label: '风格一: [Icon + Badge] / Title / Desc',
                  },
                  {
                    id: 'icon-title-inline',
                    label: '风格二: [Icon + Title] (无 Badge) / Desc',
                  },
                  {
                    id: 'mono-giant-watermark',
                    label: '风格三 (默认): JetBrains Mono 大字 + 30% 超大背景 Icon',
                  },
                ] as { id: PlayCardStyleVariant; label: string }[]
              ).map((item) => {
                const active = playCardVariant === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPlayCardVariant(item.id);
                      showToast(`已切换 L2 Play 卡片至: ${item.label}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                        : isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-tab bar when Garage is active */}
        {currentRoute === 'garage' && visibilityTier === 'user' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>Garage 5-Tab 级联切换 (Car / Colour / Materials / Anthem / Sync):</span>
              <span className="text-amber-500 font-semibold">当前: {garageTab.toUpperCase()}</span>
            </div>
            <UnderlineTabs
              items={GARAGE_QUICK_TABS}
              activeId={garageTab}
              onChange={(tabId) => {
                setGarageTab(tabId);
                showToast(`已切换至 Garage -> ${tabId}`);
              }}
              isLight={isLight}
              size="sm"
              fullWidth={false}
            />
          </div>
        )}

        {/* Sub-tab bar when Settings is active */}
        {currentRoute === 'settings' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>
                {visibilityTier === 'user'
                  ? 'Settings User 选项卡联动 (Gameplay / Audio / Display / Advanced):'
                  : 'Settings Developer 专属选项卡 (仅显示 Developer Hub):'}
              </span>
              <span className="text-amber-500 font-semibold">当前: {settingsTab.toUpperCase()}</span>
            </div>
            <UnderlineTabs
              items={visibilityTier === 'user' ? USER_SETTINGS_QUICK_TABS : DEV_SETTINGS_QUICK_TABS}
              activeId={settingsTab}
              onChange={(tabId) => {
                setSettingsTab(tabId);
                showToast(`已切换至 Settings -> ${tabId}`);
              }}
              isLight={isLight}
              size="sm"
              fullWidth={false}
            />
          </div>
        )}

        {/* Sub-tab bar when Room Host Control is active */}
        {currentRoute === 'room-host-control' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>
                Online Room Control 6 态上下文联动 (Match Lobby / During Match / Online Warmup · Host & Client):
              </span>
              <span className="text-amber-500 font-semibold">
                当前: {resolveOnlineSessionContextId(layer1ContextMode).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {ONLINE_SESSION_CONTEXT_SPECS.map((spec) => {
                const active = resolveOnlineSessionContextId(layer1ContextMode) === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => {
                      onChangeLayer1ContextMode(spec.id);
                      showToast(`已切换房间控制面板至: ${spec.shortLabel} (${spec.role.toUpperCase()})`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                        : isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {spec.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Layer 3: Tertiary Sub-Menus (Strictly filtered by User vs Developer) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
          <Badge variant="success" size="sm" isLight={isLight}>
            Layer 3
          </Badge>
          <span>三级独立子菜单</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(visibilityTier === 'user'
            ? ([
                { route: 'host-match' as const, label: 'Host Match (创建房间)', panel: 'layer3-host-match' as const },
                { route: 'host-training' as const, label: 'Host Training (联机训练)', panel: 'layer3-host-training' as const },
                { route: 'custom-play' as const, label: 'Custom (开发中)', panel: 'layer3-custom-play' as const },
                { route: 'join-room' as const, label: 'Join Room (加入房间)', panel: 'layer3-join-room' as const },
                { route: 'exhibition' as const, label: 'Exhibition Setup (离线 AI)', panel: 'layer3-exhibition' as const },
                { route: 'self-training' as const, label: 'Self-Training Hub (单人训练)', panel: 'layer3-self-training' as const },
                { route: 'kickoff-training' as const, label: 'Kickoff Training (开球音游)', panel: 'layer3-kickoff-training' as const },
                { route: 'training' as const, label: 'Training Config (训练与回溯)', panel: 'layer3-training' as const },
                { route: 'camera' as const, label: 'Camera Settings (相机几何)', panel: 'layer3-camera' as const },
                { route: 'keybindings' as const, label: 'Key Bindings (键位与手柄映射)', panel: 'layer3-keybindings' as const },
                { route: 'trajectory' as const, label: 'Ball Trajectory (Live Preview)', panel: 'layer3-ball-trajectory' as const },
              ])
            : ([
                { route: 'dev-subsystem-isolation' as const, label: 'Sandboxes & Isolation (6-Tab 隔离室)', panel: 'layer3-dev-subsystem-isolation' as const },
                { route: 'exp-multi-bots' as const, label: 'Multi-Bots (3v3 编排)', panel: 'layer3-exp-multi-bots' as const },
                { route: 'dev-active-tuners' as const, label: 'Active Tuners (相位矩阵与音频)', panel: 'layer3-dev-active-tuners' as const },
                { route: 'dev-calibrated-presets' as const, label: 'Calibrated Presets (已校准调参器)', panel: 'layer3-dev-calibrated-presets' as const },
                { route: 'dev-under-development' as const, label: 'Under Development (开发中功能)', panel: 'layer3-dev-under-development' as const },
                { route: 'audio-eq' as const, label: 'Acoustics & EQ (声学均衡)', panel: 'layer3-audio-eq' as const },
              ])
          ).map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleSelectRoute(item.route)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-2xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 shadow-2xs'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {getPanelWidth(item.panel)}px
                </span>
              </button>
            );
          })}

          {visibilityTier === 'user' && (
            <button
              type="button"
              onClick={() => {
                const next = !simulateLayer3Error;
                setToken('simulateLayer3Error', next);
                if (next) {
                  dispatchOnlineRoomErrorNotification();
                  const st = useQuickNotificationStore.getState();
                  if (st.activeNotification) {
                    st.collapseActive();
                  }
                  st.setStackOpen(false);
                  showToast('已触发三级菜单单行报错 (点击 Check notification ↗ 可展开右上角通知)');
                } else {
                  showToast('已清除三级菜单单行报错');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                simulateLayer3Error
                  ? 'bg-rose-500 text-white border-rose-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                  : 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800/70 text-rose-300'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{simulateLayer3Error ? '内联报错: 开启中' : '模拟三级内联报错'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar when Camera Settings is active: 5 Spine & Checkbox Presets + Inline Tuner Toggle */}
      {currentRoute === 'camera' && (
        <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
            <span>
              7A.12 Camera Settings 新设计排布切换 (Slider 中轴对齐 · 右对齐无 Icon 文本 · 左对齐数值框 · Checkbox · 红色二次确认大按钮):
            </span>
            <div className="flex items-center gap-3">
              {onToggleInlineTuner && (
                <button
                  type="button"
                  onClick={onToggleInlineTuner}
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  <span>{showInlineTuner ? '收起 7A 就地细调抽屉 ▲' : '展开 7A 就地细调抽屉 (调整居中/间距/Checkbox) ▼'}</span>
                </button>
              )}
              {onNavigateShowcase && (
                <button
                  type="button"
                  onClick={() => onNavigateShowcase('recipes', 'camera-settings-style-tuner')}
                  className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                >
                  <span>打开 6A.12M 专项调优台</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(CAMERA_SETTINGS_STYLE_PRESETS) as CameraSettingsPresetId[]).map((presetKey) => {
              const p = CAMERA_SETTINGS_STYLE_PRESETS[presetKey];
              const active = cameraStyle.preset === presetKey;
              return (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => {
                    cameraStyle.applyPreset(presetKey);
                    showToast(`已切换 Camera Settings 排布: ${p.shortLabel}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    active
                      ? 'bg-emerald-500 text-white border-emerald-500 font-bold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {p.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Layer 4: Deep Sub-Menus (Strictly filtered by User vs Developer) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
          <Badge variant="primary" size="sm" isLight={isLight}>
            Layer 4
          </Badge>
          <span>四级深度专页</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(visibilityTier === 'user'
            ? ([
                { route: 'static-training-pack' as const, label: '.RCSPack Browser (训练包浏览器)', panel: 'layer4-static-training-pack' as const },
                { route: 'controller-settings' as const, label: 'Controller Settings (高级手柄曲线)', panel: 'layer4-controller-settings' as const },
              ])
            : ([
                { route: 'advanced-audio' as const, label: 'Advanced Audio Pool (音频阶段池)', panel: 'layer4-advanced-audio' as const },
                { route: 'event-trigger-rules' as const, label: 'Event & Trigger Rules (触发器规则引擎)', panel: 'layer4-event-trigger-rules' as const },
              ])
          ).map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleSelectRoute(item.route)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-2xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 shadow-2xs'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {getPanelWidth(item.panel)}px
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status & Cascade Breadcrumb Footer + Node-Path Aware Quick Jump & Element Inspector */}
      {(() => {
        const inspectorLinks = resolveNodePathInspectorLinks(currentRoute, settingsTab, garageTab);
        const { pageRecipeTarget, elementTargets } = inspectorLinks;
        return (
          <div
            className={`flex flex-col gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
              isLight
                ? 'bg-neutral-50/90 border-neutral-200/80 text-neutral-600'
                : 'bg-neutral-950/50 border-neutral-800/80 text-neutral-400'
            }`}
          >
            {/* Row 1: Detected Cascade Node Path + Primary Page Jump + Inline Quick Modify Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Compass className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-neutral-400">当前检测节点路径:</span>
                <span className="font-bold text-amber-500">
                  {currentStep?.breadcrumb || MENU_ROUTE_CONFIG[currentRoute]?.label || currentRoute} ({activeRouteSizeModeLabel})
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {feedbackToast && (
                  <div className="text-amber-500 font-semibold flex items-center gap-1.5 animate-pulse mr-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>{feedbackToast}</span>
                  </div>
                )}

                {onToggleInlineTuner && (
                  <button
                    type="button"
                    onClick={onToggleInlineTuner}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer active:scale-95 ${
                      showInlineTuner
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-2xs'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800 shadow-2xs'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200 shadow-2xs'
                    }`}
                    title="无需离开 7A 沙盒，直接在当前页展开/收起针对该节点面板及 SettingActionRow 内部行的实时调优器"
                  >
                    <Sliders className="h-3 w-3" />
                    <span>{showInlineTuner ? '收起就地快调' : '就地快调当前节点'}</span>
                  </button>
                )}

                {onNavigateShowcase && (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateShowcase(pageRecipeTarget.tab, pageRecipeTarget.targetId)
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer active:scale-95 bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 shadow-2xs"
                    title={`一键跳转至独立调优页面: [${pageRecipeTarget.code}] ${pageRecipeTarget.componentName}`}
                  >
                    <span>跳转当前页面设置 [{pageRecipeTarget.code}]</span>
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Detected Internal Elements / Underlying Components Direct Jump Bar */}
            {onNavigateShowcase && elementTargets.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-neutral-200/70 dark:border-neutral-800/70">
                <span className="text-[11px] text-neutral-400 shrink-0">
                  当前页面内部元素调优跳转:
                </span>
                {elementTargets.map((target) => (
                  <button
                    key={`${target.code}-${target.componentName}`}
                    type="button"
                    onClick={() => onNavigateShowcase(target.tab, target.targetId)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer active:scale-95 ${
                      isLight
                        ? 'bg-white hover:bg-amber-50 border-neutral-200/90 hover:border-amber-400 text-neutral-700 hover:text-amber-700 shadow-2xs'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-amber-500/60 text-neutral-300 hover:text-amber-300'
                    }`}
                    title={`跳转至独立底层组件页面调优: [${target.code}] ${target.componentName}`}
                  >
                    <span className="px-1 py-0.2 rounded text-[9.5px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {target.code}
                    </span>
                    <span>{target.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-70" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
});

MenuLayerRouteSelectorBar.displayName = 'MenuLayerRouteSelectorBar';
