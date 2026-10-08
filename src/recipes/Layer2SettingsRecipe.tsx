import React, { useState } from 'react';
import { 
  Gamepad2, 
  Video, 
  Volume2, 
  Sliders, 
  Monitor, 
  MessageSquare, 
  Sparkles, 
  SlidersHorizontal, 
  Code2, 
  ArrowRight,
  Shield,
  Layers,
  Check,
  PauseCircle,
  PlayCircle,
  Plus,
  Activity,
  Target,
  Info
} from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { UnderlineTabs, TabItem } from '../primitives/UnderlineTabs';
import { SliderControl } from '../primitives/SliderControl';
import { SegmentedSwitch } from '../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../primitives/ToggleSwitch';
import { VStack } from '../layout/VStack';
import { Badge } from '../primitives/Badge';
import { KeybindingRecipe } from './KeybindingRecipe';
import { useFloatingStore } from '../tokens/floatingStore';

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
 * - Gameplay
 * - Camera
 * - Controls (Embeds keybinding and gamepad mappings directly)
 * - Interface
 * - Video (Includes Render Disable / Background Pause tuning)
 * - Audio (Includes 3-Band quick levels + Layer 3 DSP Audio Equalizer entrance)
 * - Chat
 * - Extra
 * - Advanced (Contains 'Enable Developer Settings' switch)
 * - Developer (Dynamic tab unlocked via Advanced)
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
}) => {
  const [internalTab, setInternalTab] = useState<SettingsTabId>(initialTab as SettingsTabId);
  const currentTab = (controlledTab as SettingsTabId) ?? internalTab;

  // Hover description state for dynamic footer
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

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
      <div className="px-6 pt-2 overflow-x-auto no-scrollbar" data-ui-element="tabs-wrapper">
        <UnderlineTabs
          items={tabs}
          activeId={currentTab}
          onChange={handleTabChange}
          isLight={isLight}
          size="sm"
          fullWidth={false}
        />
      </div>

      <PanelContent scrollable className="p-6 h-[400px] overflow-y-auto" data-ui-element="panel-content">
        {/* 1. GAMEPLAY */}
        {currentTab === 'gameplay' && (
          <VStack gap="lg" isLight={isLight}>
            <div
              onMouseEnter={() => setHoveredDesc('Displays a directional indicator on screen tracking the ball position.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="Ball Cam Indicator"
                checked={ballCamIndicator}
                onCheckedChange={setBallCamIndicator}
                isLight={isLight}
                variant="neutral"
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Enables 120Hz sub-tick physics simulation with SIMD acceleration.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="120Hz Sub-Tick Simulation"
                checked={highTickrate}
                onCheckedChange={setHighTickrate}
                isLight={isLight}
                variant="neutral"
              />
            </div>

            {/* Layer 3 Trajectory Predictor Entrance */}
            <div
              onMouseEnter={() => setHoveredDesc('Configure trajectory prediction duration, bounce rings and Magnus spin vector.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`mt-2 p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                isLight ? 'bg-amber-50/60 border-amber-200/90' : 'bg-amber-950/20 border-amber-900/50'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                    Ball Trajectory Predictor
                  </span>
                  <Badge variant="warning" size="sm" isLight={isLight}>
                    Layer 3 · Live Preview
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Predictive flight path duration, bounce rings and aerodynamics.
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTrajectoryDetail?.()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-xs cursor-pointer transition-colors shrink-0 ml-3"
              >
                <span>Configure</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </VStack>
        )}

        {/* 2. CAMERA */}
        {currentTab === 'camera' && (
          <VStack gap="lg" isLight={isLight}>
            <div
              onMouseEnter={() => setHoveredDesc('Adjusts horizontal field of view angle in degrees.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Field of View"
                value={fov}
                min={60}
                max={120}
                step={1}
                unit="°"
                onChange={setFov}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Sets the distance between the tracking camera and vehicle body.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Distance"
                value={cameraDistance}
                min={200}
                max={400}
                step={10}
                unit="uu"
                onChange={setCameraDistance}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Controls the vertical height of the camera above vehicle.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Height"
                value={cameraHeight}
                min={60}
                max={180}
                step={5}
                unit="uu"
                onChange={setCameraHeight}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Downward pitch angle pointing toward vehicle.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Angle"
                value={cameraAngle}
                min={-15}
                max={0}
                step={1}
                unit="°"
                onChange={setCameraAngle}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Rigidity with which the camera follows vehicle orientation.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Stiffness"
                value={cameraStiffness}
                min={0}
                max={1}
                step={0.05}
                onChange={setCameraStiffness}
                isLight={isLight}
              />
            </div>
          </VStack>
        )}

        {/* 3. CONTROLS: Embedded Key Controls table */}
        {currentTab === 'controls' && (
          <div className="flex flex-col gap-3">
            <div
              className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200 dark:border-neutral-800"
              onMouseEnter={() => setHoveredDesc('Configure key bindings for keyboard and gamepad inputs.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <span className={`font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                Keyboard & Controller Remapping
              </span>
              <span className="text-[11px] font-mono opacity-70">Unified Controls Layer</span>
            </div>
            <KeybindingRecipe isLight={isLight} />
          </div>
        )}

        {/* 4. INTERFACE */}
        {currentTab === 'interface' && (
          <VStack gap="lg" isLight={isLight}>
            <div
              onMouseEnter={() => setHoveredDesc('Adjusts overall scaling of the HUD match scoreboard, boost gauge and speedometer.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="HUD Scale"
                value={hudScale}
                min={70}
                max={130}
                step={5}
                unit="%"
                onChange={setHudScale}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Scales overhead player nametags and distance markers in the 3D viewport.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Nameplate Scale"
                value={nameplateScale}
                min={70}
                max={130}
                step={5}
                unit="%"
                onChange={setNameplateScale}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Safe Area margin compensates for display bezel cutouts (-5% to +10%).')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}
            >
              <span className="font-bold block mb-1">Safe Area Margin Configuration:</span>
              <span className="opacity-80">
                Supports global -5% to +10% viewport adaptation, configurable via the top telemetry controls.
              </span>
            </div>
          </VStack>
        )}

        {/* 5. VIDEO */}
        {currentTab === 'video' && (
          <VStack gap="lg" isLight={isLight}>
            <div
              onMouseEnter={() => setHoveredDesc('Pauses 3D scene rendering when menus are open to save GPU power and reduce heat.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-500">
                      Background Render Pause
                    </span>
                    <Badge variant="amber" size="sm" isLight={isLight}>
                      Instant FPS Saver
                    </Badge>
                  </div>
                  <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
                    Suspends Three.js canvas tick during active menu overlays.
                  </span>
                </div>
                <ToggleSwitch
                  checked={bgRenderDisabled}
                  onCheckedChange={(val) => {
                    setBgRenderDisabled(val);
                    onToggleBackgroundRender?.(val);
                  }}
                  variant="neutral"
                  isLight={isLight}
                />
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Adjusts internal 3D canvas physical pixel sampling scale (50% - 150%).')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Render Scale"
                value={renderScale}
                min={50}
                max={150}
                step={5}
                unit="%"
                onChange={setRenderScale}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Limits maximum frame update rate of the render loop.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className="flex items-center justify-between text-xs"
            >
              <span className={`font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                Max Framerate Limit
              </span>
              <SegmentedSwitch
                value={fpsLimit}
                onValueChange={setFpsLimit}
                isLight={isLight}
                options={[
                  { value: '60', label: '60' },
                  { value: '120', label: '120' },
                  { value: '144', label: '144' },
                  { value: 'max', label: 'MAX' },
                ]}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Synchronizes frame rate with monitor physical scan line to prevent tearing.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="Vertical Sync (VSync)"
                checked={vsync}
                onCheckedChange={setVsync}
                isLight={isLight}
                variant="neutral"
              />
            </div>
          </VStack>
        )}

        {/* 6. AUDIO */}
        {currentTab === 'audio' && (
          <VStack gap="lg" isLight={isLight}>
            <div
              onMouseEnter={() => setHoveredDesc('Controls master output level across all game audio channels.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Master Volume"
                value={masterVol}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={setMasterVol}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Adjusts vehicle combustion, tire skid and supersonic shockwave audio.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="SFX & Engine Audio"
                value={sfxVol}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={setSFXVol}
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Controls stadium crowd reverberation and arena ambient acoustics.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <SliderControl
                label="Ambient & Crowd Reverb"
                value={ambientVol}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={setAmbientVol}
                isLight={isLight}
              />
            </div>

            {/* Layer 3 Sub-Menu Entrance */}
            <div
              onMouseEnter={() => setHoveredDesc('Opens dedicated 480px 3-band parametric equalizer and HRTF spatial audio console.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                isLight ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                    Acoustics & Equalizer
                  </span>
                  <Badge variant="primary" size="sm" isLight={isLight}>
                    Layer 3
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Advanced 3-Band Parametric EQ & HRTF Spatial Audio Console.
                </span>
              </div>

              {onNavigateAudioDetail && (
                <button
                  type="button"
                  onClick={onNavigateAudioDetail}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs border border-amber-500 transition-all cursor-pointer"
                >
                  <span>Open EQ</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </VStack>
        )}

        {/* 7. CHAT */}
        {currentTab === 'chat' && (
          <VStack gap="lg" isLight={isLight}>
            <div
              onMouseEnter={() => setHoveredDesc('Enables D-pad quick chat tactical communication during matches.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="Quick Chat Presets"
                checked={quickChatEnabled}
                onCheckedChange={setQuickChatEnabled}
                isLight={isLight}
                variant="neutral"
              />
            </div>
            <div
              onMouseEnter={() => setHoveredDesc('Preset phrase slots reserved for future customization.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-4 rounded-xl border text-xs text-neutral-400 ${
                isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}
            >
              Quick chat binds and customizable team macros will be configurable here.
            </div>
          </VStack>
        )}

        {/* 8. EXTRA */}
        {currentTab === 'extra' && (
          <div
            onMouseEnter={() => setHoveredDesc('Contains match replay auto-saving and extended telemetry logging.')}
            onMouseLeave={() => setHoveredDesc(null)}
            className="flex flex-col gap-3"
          >
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
            }`}>
              <span className="font-bold block mb-1">Extra Features:</span>
              <span className="text-neutral-400">Match replay auto-saving and extended telemetry logging placeholder.</span>
            </div>
          </div>
        )}

        {/* 9. ADVANCED */}
        {currentTab === 'advanced' && (
          <VStack gap="lg" isLight={isLight}>
            <div
              onMouseEnter={() => setHoveredDesc('Unlocks Developer tab for physics wireframe and SIMD profiler.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-4 rounded-xl border flex items-center justify-between ${
                developerUnlocked
                  ? isLight
                    ? 'bg-red-50/70 border-red-200'
                    : 'bg-red-950/20 border-red-800/60'
                  : isLight
                  ? 'bg-neutral-50 border-neutral-200'
                  : 'bg-neutral-850 border-neutral-700/80'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-red-500">
                    Enable Developer Settings
                  </span>
                  <Badge variant="danger" size="sm" isLight={isLight}>
                    Diagnostics
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Unlocks Developer tab for internal physics pipeline and WASM telemetry.
                </span>
              </div>

              <ToggleSwitch
                checked={developerUnlocked}
                onCheckedChange={(val) => {
                  setDeveloperUnlocked(val);
                  if (val) {
                    setInternalTab('developer');
                    onTabChange?.('developer');
                  }
                }}
                variant="neutral"
                isLight={isLight}
              />
            </div>

            {/* Diagnostic Floating Window (F10) Spawner */}
            <div
              onMouseEnter={() => setHoveredDesc('Spawns an independent floating diagnostic window docked in the top-right tray.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-4 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-sky-50/60 border-sky-200' : 'bg-sky-950/20 border-sky-800/60'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-sky-500" />
                  <span className="font-bold text-xs text-sky-600 dark:text-sky-400">
                    F10 Diagnostic Floating Window
                  </span>
                  <Badge variant="primary" size="sm" isLight={isLight}>
                    Floating Window
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Spawns standalone telemetry overlay. Minimize folds into top-right Stack tray.
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const titles = [
                    'Network Ping & WASM Sub-Tick Diagnostics',
                    'Physics Vector & Collision Mesh Profiler',
                    'GPU Frame Pacing & Memory Footprint',
                    'Ball Angular Velocity & Magnus Vector',
                  ];
                  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
                  useFloatingStore.getState().spawnWindow(randomTitle);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-xs cursor-pointer transition-colors shrink-0 ml-3"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Spawn Window</span>
              </button>
            </div>
          </VStack>
        )}

        {/* 10. DEVELOPER */}
        {currentTab === 'developer' && (
          <VStack gap="lg" isLight={isLight}>
            <div className={`p-3 rounded-lg border text-xs ${
              isLight ? 'bg-red-50 text-red-900 border-red-200' : 'bg-red-950/30 text-red-300 border-red-800/80'
            }`}>
              Developer Mode Active: options below are intended for kernel tuning.
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Renders vehicle OBB and sphere collision bounding meshes.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="Physics Wireframe Overlay"
                checked={showWireframe}
                onCheckedChange={setShowWireframe}
                isLight={isLight}
                variant="neutral"
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Displays real-time sub-tick execution latency and WASM SIMD performance on HUD.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="WASM SIMD Profiler"
                checked={wasmProfiling}
                onCheckedChange={setWasmProfiling}
                isLight={isLight}
                variant="neutral"
              />
            </div>
          </VStack>
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
