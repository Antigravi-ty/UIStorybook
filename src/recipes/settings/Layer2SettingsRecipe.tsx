import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../../layout/Panel';
import { UnderlineTabs, TabItem } from '../../primitives/UnderlineTabs';
import { Badge } from '../../primitives/Badge';
import { type DiagnosticWindowPayload } from './components/FloatingWindowCard';
import {
  GameplayTab,
  CameraTab,
  ControlsTab,
  InterfaceTab,
  VideoTab,
  AudioTab,
  ChatTab,
  ExtraTab,
  AdvancedTab,
  DeveloperTab,
} from './tabs';

export type { DiagnosticWindowPayload };

export interface Layer2SettingsRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  onNavigateAudioDetail?: () => void;
  onNavigateTrajectoryDetail?: () => void;
  initialTab?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  // Background render indicator state & trigger
  backgroundRenderPaused?: boolean;
  onToggleBackgroundRender?: (paused: boolean) => void;
  /** Optional callback to spawn a floating diagnostic window in the host stage */
  onSpawnDiagnosticWindow?: (window: DiagnosticWindowPayload) => void;
}

export type SettingsTabId =
  | 'gameplay'
  | 'camera'
  | 'controls'
  | 'interface'
  | 'video'
  | 'audio'
  | 'chat'
  | 'extra'
  | 'advanced'
  | 'developer';

/**
 * [Recipe] Layer 2 Settings Menu (Width: 680px)
 * Complete Settings system featuring 9+1 UnderlineTabs:
 * - Gameplay (`GameplayTab`)
 * - Camera (`CameraTab`)
 * - Controls (`ControlsTab` - Embeds keybinding and gamepad mappings directly)
 * - Interface (`InterfaceTab`)
 * - Video (`VideoTab` - Includes Render Disable / Background Pause tuning)
 * - Audio (`AudioTab` - Includes 3-Band quick levels + Layer 3 DSP Audio Equalizer entrance)
 * - Chat (`ChatTab`)
 * - Extra (`ExtraTab`)
 * - Advanced (`AdvancedTab` - Contains 'Enable Developer Settings' switch & Diagnostic window spawner)
 * - Developer (`DeveloperTab` - Dynamic tab unlocked via Advanced)
 *
 * Descriptions are seamlessly delegated to the PanelFooter on hover,
 * keeping settings rows clean, consistent and focused.
 */
export const Layer2SettingsRecipe: React.FC<Layer2SettingsRecipeProps> = ({
  isLight = false,
  onBack,
  onNavigateAudioDetail,
  onNavigateTrajectoryDetail,
  initialTab = 'gameplay',
  activeTab: controlledTab,
  onTabChange,
  backgroundRenderPaused = false,
  onToggleBackgroundRender,
  onSpawnDiagnosticWindow,
}) => {
  const [internalTab, setInternalTab] = useState<SettingsTabId>(initialTab as SettingsTabId);
  const currentTab = (controlledTab as SettingsTabId) ?? internalTab;

  // Synchronize internal tab when initialTab prop updates externally
  React.useEffect(() => {
    if (initialTab) {
      setInternalTab(initialTab as SettingsTabId);
    }
  }, [initialTab]);

  // Hover description state for dynamic footer
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);
  const clearHover = () => setHoveredDesc(null);

  const handleTabChange = (t: string) => {
    const valid = t as SettingsTabId;
    setInternalTab(valid);
    onTabChange?.(valid);
  };

  // State slices
  const [ballCamIndicator, setBallCamIndicator] = useState(true);
  const [highTickrate, setHighTickrate] = useState(true);

  const [fov, setFov] = useState(90);
  const [cameraDistance, setCameraDistance] = useState(270);
  const [cameraHeight, setCameraHeight] = useState(110);
  const [cameraAngle, setCameraAngle] = useState(-3);
  const [cameraStiffness, setCameraStiffness] = useState(0.5);

  const [hudScale, setHudScale] = useState(100);
  const [nameplateScale, setNameplateScale] = useState(100);

  const [bgRenderDisabled, setBgRenderDisabled] = useState(backgroundRenderPaused);
  const [renderScale, setRenderScale] = useState(100);
  const [fpsLimit, setFpsLimit] = useState('120');
  const [vsync, setVsync] = useState(false);

  const [masterVol, setMasterVol] = useState(80);
  const [sfxVol, setSFXVol] = useState(85);
  const [ambientVol, setAmbientVol] = useState(60);

  const [quickChatEnabled, setQuickChatEnabled] = useState(true);

  // Advanced unlock
  const [developerUnlocked, setDeveloperUnlocked] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [wasmProfiling, setWasmProfiling] = useState(true);

  // Build tabs dynamically: append 'developer' when unlocked
  const baseTabs: TabItem[] = [
    { id: 'gameplay', label: 'Gameplay' },
    { id: 'camera', label: 'Camera' },
    { id: 'controls', label: 'Controls' },
    { id: 'interface', label: 'Interface' },
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio' },
    { id: 'chat', label: 'Chat' },
    { id: 'extra', label: 'Extra' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const tabs: TabItem[] = developerUnlocked
    ? [
        ...baseTabs,
        {
          id: 'developer',
          label: 'Developer',
          badge: <Badge size="sm" variant="danger" isLight={isLight}>DEV</Badge>,
        },
      ]
    : baseTabs;

  return (
    <PanelContainer isLight={isLight} className="w-full max-w-[680px]">
      <PanelHeader
        title="SETTINGS"
        subtitle="Game preferences, controls, acoustics & engine diagnostics"
        badge={
          <Badge variant="primary" size="sm" isLight={isLight}>
            Preferences
          </Badge>
        }
        onBack={onBack}
        isLight={isLight}
      />

      {/* Underline Tabs: Horizontal scrolling enabled for extensive tabs */}
      <div className="px-6 pt-2 overflow-x-auto no-scrollbar shrink-0" data-ui-element="tabs-wrapper">
        <UnderlineTabs
          items={tabs}
          activeId={currentTab}
          onChange={handleTabChange}
          isLight={isLight}
          size="sm"
          fullWidth={false}
        />
      </div>

      <PanelContent scrollable className="p-6" data-ui-element="panel-content">
        {currentTab === 'gameplay' && (
          <GameplayTab
            ballCamIndicator={ballCamIndicator}
            onChangeBallCamIndicator={setBallCamIndicator}
            highTickrate={highTickrate}
            onChangeHighTickrate={setHighTickrate}
            onNavigateTrajectoryDetail={onNavigateTrajectoryDetail}
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'camera' && (
          <CameraTab
            fov={fov}
            onChangeFov={setFov}
            cameraDistance={cameraDistance}
            onChangeCameraDistance={setCameraDistance}
            cameraHeight={cameraHeight}
            onChangeCameraHeight={setCameraHeight}
            cameraAngle={cameraAngle}
            onChangeCameraAngle={setCameraAngle}
            cameraStiffness={cameraStiffness}
            onChangeCameraStiffness={setCameraStiffness}
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'controls' && (
          <ControlsTab
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'interface' && (
          <InterfaceTab
            hudScale={hudScale}
            onChangeHudScale={setHudScale}
            nameplateScale={nameplateScale}
            onChangeNameplateScale={setNameplateScale}
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'video' && (
          <VideoTab
            bgRenderDisabled={bgRenderDisabled}
            onChangeBgRenderDisabled={(val) => {
              setBgRenderDisabled(val);
              onToggleBackgroundRender?.(val);
            }}
            renderScale={renderScale}
            onChangeRenderScale={setRenderScale}
            fpsLimit={fpsLimit}
            onChangeFpsLimit={setFpsLimit}
            vsync={vsync}
            onChangeVsync={setVsync}
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'audio' && (
          <AudioTab
            masterVol={masterVol}
            onChangeMasterVol={setMasterVol}
            sfxVol={sfxVol}
            onChangeSfxVol={setSFXVol}
            ambientVol={ambientVol}
            onChangeAmbientVol={setAmbientVol}
            onNavigateAudioDetail={onNavigateAudioDetail}
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'chat' && (
          <ChatTab
            quickChatEnabled={quickChatEnabled}
            onChangeQuickChatEnabled={setQuickChatEnabled}
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'extra' && (
          <ExtraTab
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'advanced' && (
          <AdvancedTab
            developerUnlocked={developerUnlocked}
            onChangeDeveloperUnlocked={(val) => {
              setDeveloperUnlocked(val);
              if (val) {
                setInternalTab('developer');
                onTabChange?.('developer');
              }
            }}
            onSpawnDiagnosticWindow={onSpawnDiagnosticWindow}
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}

        {currentTab === 'developer' && (
          <DeveloperTab
            showWireframe={showWireframe}
            onChangeShowWireframe={setShowWireframe}
            wasmProfiling={wasmProfiling}
            onChangeWasmProfiling={setWasmProfiling}
            onHover={setHoveredDesc}
            onLeave={clearHover}
            isLight={isLight}
          />
        )}
      </PanelContent>

      {/* Dynamic Inspector Footer displaying English description of hovered item */}
      <PanelFooter isLight={isLight}>
        <div className="flex items-center gap-2 w-full text-xs truncate" data-ui-element="panel-footer">
          <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className={`truncate transition-colors duration-150 ${
            hoveredDesc
              ? (isLight ? 'text-neutral-900' : 'text-neutral-100')
              : (isLight ? 'text-neutral-400' : 'text-neutral-500')
          }`}>
            {hoveredDesc || 'Hover over any setting to view details.'}
          </span>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
};
