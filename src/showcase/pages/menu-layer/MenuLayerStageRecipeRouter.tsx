import React from 'react';
import {
  Layer1MainMenuRecipe,
  type Layer1MenuContextMode,
  Layer2PlayRecipe,
  Layer2GarageRecipe,
  Layer2SettingsRecipe,
  Layer2RoomHostControlRecipe,
  resolveOnlineSessionContextId,
  Layer3AudioEqRecipe,
  Layer3BallTrajectoryRecipe,
  Layer3OnlineWarmupRecipe,
  Layer3HostMatchRecipe,
  Layer3HostTrainingRecipe,
  Layer3CustomPlayRecipe,
  Layer3JoinRoomRecipe,
  Layer3ExhibitionRecipe,
  Layer3SelfTrainingRecipe,
  Layer3KickoffTrainingRecipe,
  Layer3TrainingRecipe,
  Layer3CameraRecipe,
  Layer3KeybindingsRecipe,
  Layer3ExpMultiBotsRecipe,
  Layer3DevSubsystemIsolationRecipe,
  Layer3DevActiveTunersRecipe,
  Layer3DevCalibratedPresetsRecipe,
  Layer3DevUnderDevelopmentRecipe,
  Layer4StaticTrainingPackBrowseRecipe,
  Layer4AdvancedAudioRecipe,
  Layer4ControllerSettingsRecipe,
  Layer4EventTriggerRulesRecipe,
} from '../../../recipes';
import { floatingStore, type FloatingWindowItem } from '../../../tokens/floatingStore';
import { PRESET_WINDOWS, type PresetConfig } from '../../../tokens/floatingPresets';
import {
  MENU_ROUTE_CONFIG,
  type ActiveMenuRoute,
  type LivePreviewAnimPhase,
  type MenuVisibilityTier,
} from './menuLayerRouteConfig';

export interface MenuLayerStageRecipeRouterProps {
  isLight: boolean;
  visibilityTier: MenuVisibilityTier;
  onSwitchTier?: (tier: MenuVisibilityTier) => void;
  layer1ContextMode: Layer1MenuContextMode;
  onChangeLayer1ContextMode?: (mode: Layer1MenuContextMode) => void;
  touchMode: boolean;
  onToggleTouchMode?: (enabled: boolean) => void;
  displayedRoute: ActiveMenuRoute;
  handleSelectRoute: (route: ActiveMenuRoute, options?: { pushHistory?: boolean }) => void;
  handleNavigateBack?: () => void;
  showToast: (msg: string) => void;
  settingsTab: string;
  setSettingsTab: (tab: string) => void;
  garageTab: string;
  setGarageTab: (tab: string) => void;
  bgRenderPaused: boolean;
  setBgRenderPaused: (val: boolean) => void;
  lastParentRoute: ActiveMenuRoute;
  setLastParentRoute: (route: ActiveMenuRoute) => void;
  handleAddPresetWindow: (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => void;
  windows: FloatingWindowItem[];
  minimizedCount: number;
  totalCount: number;
  closeWindow: (id: string) => void;
  setLiveAnimPhase: (phase: LivePreviewAnimPhase) => void;
  handleTriggerCollapse: () => void;
}

export const MenuLayerStageRecipeRouter = React.memo<MenuLayerStageRecipeRouterProps>(({
  isLight,
  visibilityTier,
  onSwitchTier,
  layer1ContextMode,
  onChangeLayer1ContextMode,
  touchMode,
  onToggleTouchMode,
  displayedRoute,
  handleSelectRoute,
  handleNavigateBack,
  showToast,
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
  handleTriggerCollapse,
}) => {
  const [touchInputAgent, setTouchInputAgent] = React.useState<'none' | 'necto' | 'nexto'>('none');

  const goBack = () => {
    if (handleNavigateBack) {
      handleNavigateBack();
      return;
    }
    const fallbackParent = MENU_ROUTE_CONFIG[displayedRoute]?.parentRoute ?? 'main-menu';
    handleSelectRoute(fallbackParent, { pushHistory: false });
  };

  const navigateToGarageSync = () => {
    setLastParentRoute(displayedRoute);
    setGarageTab('sync');
    handleSelectRoute('garage');
    showToast('已跳转至 Garage -> Sync');
  };

  const spawnPresetById = (windowId: string, activeTab?: string) => {
    const preset = PRESET_WINDOWS.find((p) => p.id === windowId);
    if (preset) {
      floatingStore.spawnWindow({
        id: preset.id,
        title: preset.title,
        category: preset.category,
        width: preset.width,
        height: preset.height,
        minWidth: preset.minWidth,
        minHeight: preset.minHeight,
        maxWidth: preset.maxWidth,
        maxHeight: preset.maxHeight,
        autoFitHeight: preset.autoFitHeight,
        resizable: preset.resizable,
        singleton: preset.singleton,
        startMinimized: false,
      });
      handleSelectRoute('layer-0');
      showToast(`✓ 已打开浮动窗口: ${preset.title}${activeTab ? ` (${activeTab})` : ''}`);
    } else {
      showToast(`打开浮动窗口: ${windowId}`);
    }
  };

  return (
    <>
      {displayedRoute === 'main-menu' && (
        <Layer1MainMenuRecipe
          isLight={isLight}
          contextMode={layer1ContextMode}
          touchMode={touchMode}
          touchInputAgent={touchInputAgent}
          onTouchInputAgentChange={setTouchInputAgent}
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
          onNavigateRoomControl={() => handleSelectRoute('room-host-control')}
          onNavigateTrainingConfig={() => handleSelectRoute('training')}
          onNavigateKickoffConfig={() => handleSelectRoute('kickoff-training')}
          onNavigateStaticTrainingPack={() => handleSelectRoute('static-training-pack')}
          onNavigateExpMultiBots={() => handleSelectRoute('exp-multi-bots')}
          onReturnToFreeplay={() => {
            onChangeLayer1ContextMode?.('freeplay');
            showToast('已退回 Free Play 基座菜单 (MENU)');
          }}
          onLeaveRoom={() => {
            onChangeLayer1ContextMode?.('freeplay');
            showToast('已离开房间/对局并返回 Free Play (MENU)');
          }}
          onExitEditMode={() => {
            handleSelectRoute('static-training-pack');
            showToast('已退出 Edit Training Pack 返回训练包浏览器');
          }}
          onOpenFloatingWindow={(id) => spawnPresetById(id)}
          backgroundRenderPaused={bgRenderPaused}
        />
      )}

      {displayedRoute === 'play' && (
        <Layer2PlayRecipe
          isLight={isLight}
          onBack={goBack}
          onSelectMode={(m) => {
            setLastParentRoute('play');
            if (m === 'exhibition') {
              handleSelectRoute('exhibition');
            } else if (m === 'host-match' || m === 'multiplayer-match') {
              handleSelectRoute('host-match');
            } else if (m === 'join-room' || m === 'multiplayer-custom') {
              handleSelectRoute('join-room');
            } else if (m === 'self-training') {
              handleSelectRoute('self-training');
            } else if (m === 'host-training' || m === 'multiplayer-training' || m === 'online-training') {
              handleSelectRoute('host-training');
            } else if (m === 'advanced') {
              handleSelectRoute('custom-play');
            } else {
              onChangeLayer1ContextMode?.('freeplay');
              handleSelectRoute('main-menu');
              showToast(`已切换对局上下文至: ${m}`);
            }
          }}
        />
      )}

      {displayedRoute === 'garage' && (
        <Layer2GarageRecipe
          isLight={isLight}
          initialTab={garageTab}
          activeTab={garageTab}
          onTabChange={setGarageTab}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'settings' && (
        <Layer2SettingsRecipe
          isLight={isLight}
          onBack={goBack}
          initialTab={settingsTab}
          activeTab={settingsTab}
          onTabChange={(tab) => setSettingsTab(tab)}
          developerModeEnabled={visibilityTier === 'developer'}
          onToggleDeveloperMode={(enabled) => {
            onSwitchTier?.(enabled ? 'developer' : 'user');
            if (enabled) {
              setSettingsTab('developer');
              showToast('已开启 Developer Mode，切换至 Developer 专属视图');
            } else {
              setSettingsTab('advanced');
              showToast('已关闭 Developer Mode，返回 User 专属视图');
            }
          }}
          touchControlsEnabled={touchMode}
          onToggleTouchControls={onToggleTouchMode}
          backgroundRenderPaused={bgRenderPaused}
          onToggleBackgroundRender={setBgRenderPaused}
          onSpawnDiagnosticWindow={(win) => floatingStore.spawnWindow(win)}
          onAddPresetWindow={handleAddPresetWindow}
          activeWindows={windows}
          onClosePresetWindow={closeWindow}
          onNavigateTrainingDetail={() => {
            setLastParentRoute('settings');
            handleSelectRoute('training');
          }}
          onNavigateCameraSettings={() => {
            setLastParentRoute('settings');
            handleSelectRoute('camera');
          }}
          onNavigateCameraDetail={() => {
            setLastParentRoute('settings');
            handleSelectRoute('camera');
          }}
          onNavigateKeybindingsDetail={() => {
            setLastParentRoute('settings');
            handleSelectRoute('keybindings');
          }}
          onNavigateAdvancedController={() => {
            setLastParentRoute('settings');
            handleSelectRoute('controller-settings');
          }}
          onNavigateAudioDetail={() => {
            setLastParentRoute('settings');
            handleSelectRoute('audio-eq');
          }}
          onNavigateTrajectoryDetail={() => {
            setLastParentRoute('settings');
            setLiveAnimPhase('expanded');
            handleSelectRoute('trajectory');
            showToast('进入三级菜单: Ball Trajectory Predictor (支持 TAB 侧边折叠实时预览)');
          }}
          onNavigateTrajectory={() => {
            setLastParentRoute('settings');
            setLiveAnimPhase('expanded');
            handleSelectRoute('trajectory');
            showToast('进入三级菜单: Ball Trajectory Predictor (支持 TAB 侧边折叠实时预览)');
          }}
          onNavigateDevSandboxes={() => {
            setLastParentRoute('settings');
            handleSelectRoute('dev-subsystem-isolation');
          }}
          onNavigateDevSubsystemIsolation={() => {
            setLastParentRoute('settings');
            handleSelectRoute('dev-subsystem-isolation');
          }}
          onNavigateExpMultiBots={() => {
            setLastParentRoute('settings');
            handleSelectRoute('exp-multi-bots');
          }}
          onNavigateDevActiveTuners={() => {
            setLastParentRoute('settings');
            handleSelectRoute('dev-active-tuners');
          }}
          onNavigateDevCalibratedPresets={() => {
            setLastParentRoute('settings');
            handleSelectRoute('dev-calibrated-presets');
          }}
          onNavigateDevUnderDevelopment={() => {
            setLastParentRoute('settings');
            handleSelectRoute('dev-under-development');
          }}
          onNavigateAdvancedAudio={() => {
            setLastParentRoute('settings');
            handleSelectRoute('advanced-audio');
          }}
          onNavigateEventAndTriggerer={() => {
            setLastParentRoute('settings');
            handleSelectRoute('event-trigger-rules');
          }}
        />
      )}

      {displayedRoute === 'room-host-control' && (
        <Layer2RoomHostControlRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          sessionContext={resolveOnlineSessionContextId(layer1ContextMode)}
          onSessionContextChange={(ctx) => {
            onChangeLayer1ContextMode?.(ctx);
            showToast(`已切换房间状态视图: ${ctx}`);
          }}
          showContextSwitcher={true}
          onOpenNetHud={() => spawnPresetById('network-monitor')}
          onNavigateAdvancedSettings={() => {
            setLastParentRoute('room-host-control');
            handleSelectRoute('exp-multi-bots');
          }}
          onCloseRoom={() => {
            onChangeLayer1ContextMode?.('freeplay');
            handleSelectRoute('main-menu');
            showToast('已关闭/离开房间并返回 Free Play');
          }}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'audio-eq' && (
        <Layer3AudioEqRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'online-warmup' && (
        <Layer3OnlineWarmupRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'host-match' && (
        <Layer3HostMatchRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          onNavigateGarageSync={navigateToGarageSync}
          onNavigateAdvancedSettings={() => {
            setLastParentRoute('host-match');
            handleSelectRoute('exp-multi-bots');
          }}
          onStartHost={() => {
            onChangeLayer1ContextMode?.('match-lobby-host');
            setLastParentRoute('main-menu');
            handleSelectRoute('room-host-control');
            showToast('✓ 已完成 5 步建房并进入 Configure Room (Match Lobby · Host)');
          }}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'host-training' && (
        <Layer3HostTrainingRecipe
          isLight={isLight}
          onNavigateGarageSync={navigateToGarageSync}
          onStartTraining={() => {
            onChangeLayer1ContextMode?.('online-warmup-host');
            setLastParentRoute('main-menu');
            handleSelectRoute('room-host-control');
            showToast('✓ 已创建 Online Warmup 房间并进入 Configure Room (Warmup · Host)');
          }}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'custom-play' && (
        <Layer3CustomPlayRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'join-room' && (
        <Layer3JoinRoomRecipe
          isLight={isLight}
          onNavigateGarageSync={navigateToGarageSync}
          onJoinRoom={() => {
            onChangeLayer1ContextMode?.('match-lobby-client');
            setLastParentRoute('main-menu');
            handleSelectRoute('room-host-control');
            showToast('✓ 已加入房间并进入 Room Info (Match Lobby · Client)');
          }}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'exhibition' && (
        <Layer3ExhibitionRecipe
          isLight={isLight}
          onBack={goBack}
          onNavigateAdvancedMutators={() => {
            setLastParentRoute('exhibition');
            handleSelectRoute('exp-multi-bots');
          }}
        />
      )}

      {displayedRoute === 'self-training' && (
        <Layer3SelfTrainingRecipe
          isLight={isLight}
          onBack={goBack}
          onSelectMode={(mode) => {
            setLastParentRoute('self-training');
            if (mode === 'static-training-pack') {
              handleSelectRoute('static-training-pack');
            } else if (mode === 'dynamic-training-pack') {
              handleSelectRoute('custom-play');
            } else if (mode === 'kickoff-training') {
              handleSelectRoute('kickoff-training');
            } else if (mode === 'replay-viewer') {
              spawnPresetById('replay-viewer');
            } else if (mode === 'free-play') {
              onChangeLayer1ContextMode?.('freeplay');
              handleSelectRoute('main-menu');
              showToast('已进入 Free Play 自由训练上下文');
            } else {
              handleSelectRoute('training');
            }
          }}
        />
      )}

      {displayedRoute === 'kickoff-training' && (
        <Layer3KickoffTrainingRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'training' && (
        <Layer3TrainingRecipe
          isLight={isLight}
          onBack={goBack}
          onNavigateTrajectory={() => {
            setLastParentRoute('training');
            handleSelectRoute('trajectory');
          }}
          onAddPresetWindow={handleAddPresetWindow}
          activeWindows={windows}
          onClosePresetWindow={closeWindow}
        />
      )}

      {displayedRoute === 'camera' && (
        <Layer3CameraRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          onBack={() => {
            setLiveAnimPhase('expanded');
            goBack();
          }}
          onCollapsePreview={handleTriggerCollapse}
        />
      )}

      {displayedRoute === 'keybindings' && (
        <Layer3KeybindingsRecipe
          standalone
          isLight={isLight}
          onBack={goBack}
          onNavigateAdvancedController={() => {
            setLastParentRoute('keybindings');
            handleSelectRoute('controller-settings');
          }}
        />
      )}

      {displayedRoute === 'exp-multi-bots' && (
        <Layer3ExpMultiBotsRecipe
          isLight={isLight}
          onLaunchFloatingControl={() => spawnPresetById('experimental-multi-bots')}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-subsystem-isolation' && (
        <Layer3DevSubsystemIsolationRecipe
          isLight={isLight}
          onBack={goBack}
          onNavigateExpMultiBots={() => {
            setLastParentRoute('dev-subsystem-isolation');
            handleSelectRoute('exp-multi-bots');
          }}
          onEnterBench={(tabId) =>
            tabId === 'exp-multi-bots'
              ? handleSelectRoute('exp-multi-bots')
              : spawnPresetById('subsystem-isolation-lab', tabId)
          }
          onLaunchIsolationTab={(tabId) =>
            tabId === 'exp-multi-bots'
              ? handleSelectRoute('exp-multi-bots')
              : spawnPresetById('subsystem-isolation-lab', tabId)
          }
        />
      )}

      {displayedRoute === 'dev-active-tuners' && (
        <Layer3DevActiveTunersRecipe
          isLight={isLight}
          onBack={goBack}
          onNavigateAdvancedAudio={() => handleSelectRoute('advanced-audio')}
          onNavigateEventAndTriggerer={() => handleSelectRoute('event-trigger-rules')}
          onNavigateEventTriggerer={() => handleSelectRoute('event-trigger-rules')}
          onAddPresetWindow={handleAddPresetWindow}
          activeWindows={windows}
          onClosePresetWindow={closeWindow}
        />
      )}

      {displayedRoute === 'dev-calibrated-presets' && (
        <Layer3DevCalibratedPresetsRecipe
          isLight={isLight}
          onBack={goBack}
          onAddPresetWindow={handleAddPresetWindow}
          activeWindows={windows}
          onClosePresetWindow={closeWindow}
        />
      )}

      {displayedRoute === 'dev-under-development' && (
        <Layer3DevUnderDevelopmentRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'static-training-pack' && (
        <Layer4StaticTrainingPackBrowseRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'advanced-audio' && (
        <Layer4AdvancedAudioRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'controller-settings' && (
        <Layer4ControllerSettingsRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'event-trigger-rules' && (
        <Layer4EventTriggerRulesRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'trajectory' && (
        <Layer3BallTrajectoryRecipe
          isLight={isLight}
          transparent={true}
          developerMode={visibilityTier === 'developer'}
          onBack={() => {
            setLiveAnimPhase('expanded');
            goBack();
          }}
          onCollapsePreview={handleTriggerCollapse}
        />
      )}
    </>
  );
});

MenuLayerStageRecipeRouter.displayName = 'MenuLayerStageRecipeRouter';
