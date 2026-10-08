import React, { useState, useEffect } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
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
  Info,
  RotateCcw
} from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { UnderlineTabs, TabItem } from '../primitives/UnderlineTabs';
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

interface SettingSliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  onHover: () => void;
  onLeave: () => void;
  isLight?: boolean;
}

const SettingSliderRow: React.FC<SettingSliderRowProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <div
      className="flex items-center gap-4 w-full py-1.5 px-2 rounded-lg transition-colors hover:bg-neutral-500/10 select-none cursor-pointer"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <span className={`w-36 sm:w-44 shrink-0 text-xs font-semibold truncate ${
        isLight ? 'text-neutral-800' : 'text-neutral-200'
      }`}>
        {label}
      </span>

      <SliderPrimitive.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
        className="relative flex items-center select-none touch-none grow h-5 cursor-pointer"
      >
        <SliderPrimitive.Track className={`relative grow rounded-full h-1.5 overflow-hidden ${
          isLight ? 'bg-neutral-200' : 'bg-neutral-800'
        }`}>
          <SliderPrimitive.Range className={`absolute h-full rounded-full ${
            isLight ? 'bg-neutral-900' : 'bg-white'
          }`} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className={`block h-3.5 w-3.5 rounded-full border shadow-sm transition-transform hover:scale-110 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
          isLight ? 'bg-white border-neutral-300' : 'bg-neutral-100 border-neutral-400'
        }`} />
      </SliderPrimitive.Root>

      <span className={`font-mono text-[11px] w-14 shrink-0 text-center py-0.5 rounded border select-none ${
        isLight
          ? 'bg-neutral-100 text-neutral-700 border-neutral-300'
          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
      }`}>
        {value}{unit}
      </span>
    </div>
  );
};

interface SettingToggleRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onHover: () => void;
  onLeave: () => void;
  isLight?: boolean;
}

const SettingToggleRow: React.FC<SettingToggleRowProps> = ({
  label,
  checked,
  onCheckedChange,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <div
      className="flex items-center justify-between w-full py-1.5 px-2 rounded-lg transition-colors hover:bg-neutral-500/10 cursor-pointer select-none"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className={`text-xs font-semibold truncate ${
        isLight ? 'text-neutral-800' : 'text-neutral-200'
      }`}>
        {label}
      </span>
      <ToggleSwitch
        checked={checked}
        onCheckedChange={onCheckedChange}
        isLight={isLight}
        variant="neutral"
      />
    </div>
  );
};

/**
 * [Recipe] Layer 2 Settings Menu (Width: 680px)
 * Complete Settings system featuring 9+1 UnderlineTabs:
 * - Minimalist single header title without badge clutter
 * - Clean single-row layout for sliders and switches
 * - Dynamic English description in panel footer responsive to hovered items
 * - Zero Chinese text residue inside menu items
 */
export const Layer2SettingsRecipe: React.FC<Layer2SettingsRecipeProps> = ({
  isLight = false,
  onBack,
  onNavigateAudioDetail,
  onNavigateTrajectoryDetail,
  initialTab = 'gameplay',
  activeTab: controlledTab,
  onTabChange,
  backgroundRenderPaused = true,
  onToggleBackgroundRender,
}) => {
  const [internalTab, setInternalTab] = useState<SettingsTabId>(initialTab as SettingsTabId);
  const currentTab = (controlledTab as SettingsTabId) ?? internalTab;

  const handleTabChange = (t: string) => {
    const valid = t as SettingsTabId;
    setInternalTab(valid);
    onTabChange?.(valid);
  };

  // Hover description state for footer
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  // Advanced: Enable Developer Settings switch
  const [developerUnlocked, setDeveloperUnlocked] = useState(false);

  // Video / Render states
  const [bgRenderDisabled, setBgRenderDisabled] = useState(backgroundRenderPaused);
  const [renderScale, setRenderScale] = useState(100);
  const [fpsLimit, setFpsLimit] = useState('144');
  const [vsync, setVsync] = useState(true);

  // Audio states
  const [masterVol, setMasterVol] = useState(80);
  const [sfxVol, setSFXVol] = useState(90);
  const [ambientVol, setAmbientVol] = useState(65);

  // Camera states
  const [fov, setFov] = useState(110);
  const [cameraDistance, setCameraDistance] = useState(280);
  const [cameraHeight, setCameraHeight] = useState(110);
  const [cameraAngle, setCameraAngle] = useState(-3);
  const [cameraStiffness, setCameraStiffness] = useState(0.45);
  const [cameraSwivelSpeed, setCameraSwivelSpeed] = useState(2.5);
  const [cameraTransitionSpeed, setCameraTransitionSpeed] = useState(1.2);
  const [cameraShake, setCameraShake] = useState(false);
  const [invertSwivel, setInvertSwivel] = useState(false);
  const [isConfirmingResetCamera, setIsConfirmingResetCamera] = useState(false);

  // Auto reset camera confirmation timeout
  useEffect(() => {
    if (isConfirmingResetCamera) {
      const timer = setTimeout(() => setIsConfirmingResetCamera(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingResetCamera]);

  // Gameplay states
  const [ballCamIndicator, setBallCamIndicator] = useState(true);
  const [highTickrate, setHighTickrate] = useState(true);

  // Chat & Interface
  const [quickChatEnabled, setQuickChatEnabled] = useState(true);
  const [hudScale, setHudScale] = useState(100);

  // Extra states
  const [autoSaveReplay, setAutoSaveReplay] = useState(true);
  const [telemetryRecord, setTelemetryRecord] = useState(false);

  // Developer states
  const [showWireframe, setShowWireframe] = useState(false);
  const [wasmProfiling, setWasmProfiling] = useState(true);

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
        onBack={onBack}
        isLight={isLight}
      />

      {/* Underline Tabs */}
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

      <PanelContent scrollable className="p-6 h-[400px] overflow-y-auto">
        {/* 1. GAMEPLAY */}
        {currentTab === 'gameplay' && (
          <VStack gap="md" isLight={isLight}>
            <SettingToggleRow
              label="Ball Cam Indicator"
              checked={ballCamIndicator}
              onCheckedChange={setBallCamIndicator}
              onHover={() => setHoveredDesc('Displays on-screen directional arrow pointing toward the ball.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingToggleRow
              label="120Hz Sub-Tick Simulation"
              checked={highTickrate}
              onCheckedChange={setHighTickrate}
              onHover={() => setHoveredDesc('Enables SIMD hardware-accelerated 120Hz high-precision physics loop.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            {/* Layer 3 Entrance */}
            <div
              className={`mt-2 p-3.5 rounded-xl border flex items-center justify-between transition-colors select-none ${
                isLight ? 'bg-amber-50/60 border-amber-200/90' : 'bg-amber-950/20 border-amber-900/50'
              }`}
              onMouseEnter={() => setHoveredDesc('Configure flight lookahead horizon, impact wave halos and Magnus aerodynamic spin in Layer 3.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                    Ball Trajectory Predictor Configuration
                  </span>
                  <Badge variant="warning" size="sm" isLight={isLight}>
                    Layer 3
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Advanced real-time ballistic curve simulation and impact predictions.
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
          <VStack gap="md" isLight={isLight}>
            <SettingSliderRow
              label="Field of View"
              value={fov}
              min={60}
              max={120}
              step={1}
              unit="°"
              onChange={setFov}
              onHover={() => setHoveredDesc('Adjusts horizontal field of view angle in degrees.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="Distance"
              value={cameraDistance}
              min={100}
              max={400}
              step={10}
              unit="uu"
              onChange={setCameraDistance}
              onHover={() => setHoveredDesc('Sets tracking camera follow distance behind your vehicle.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="Height"
              value={cameraHeight}
              min={40}
              max={200}
              step={10}
              unit="uu"
              onChange={setCameraHeight}
              onHover={() => setHoveredDesc('Controls vertical elevation of camera above car chassis.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="Angle"
              value={cameraAngle}
              min={-15}
              max={0}
              step={1}
              unit="°"
              onChange={setCameraAngle}
              onHover={() => setHoveredDesc('Adjusts downward pitch angle pointing toward your vehicle.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="Stiffness"
              value={cameraStiffness}
              min={0}
              max={1}
              step={0.05}
              onChange={setCameraStiffness}
              onHover={() => setHoveredDesc('Controls how rigidly camera follows vehicle orientation (0 = loose, 1 = locked).')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="Swivel Speed"
              value={cameraSwivelSpeed}
              min={1}
              max={10}
              step={0.1}
              onChange={setCameraSwivelSpeed}
              onHover={() => setHoveredDesc('Rotation speed when orbiting view with right stick or keys.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="Transition Speed"
              value={cameraTransitionSpeed}
              min={1}
              max={2}
              step={0.1}
              onChange={setCameraTransitionSpeed}
              onHover={() => setHoveredDesc('Determines how quickly the view blends between Ball Cam and Car Cam.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingToggleRow
              label="Camera Shake"
              checked={cameraShake}
              onCheckedChange={setCameraShake}
              onHover={() => setHoveredDesc('Toggles impact vibrations on ball hits, demolitions and landings.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingToggleRow
              label="Invert Swivel"
              checked={invertSwivel}
              onCheckedChange={setInvertSwivel}
              onHover={() => setHoveredDesc('Inverts vertical swivel pitch axis when looking around.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            {/* Reset Camera Action */}
            <div
              className="pt-3 mt-1 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between px-2 select-none"
              onMouseEnter={() => setHoveredDesc('Resets all camera parameters back to factory standard presets.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <span className={`text-xs font-semibold ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                Reset Camera Parameters
              </span>

              {isConfirmingResetCamera ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFov(110);
                      setCameraDistance(280);
                      setCameraHeight(110);
                      setCameraAngle(-3);
                      setCameraStiffness(0.45);
                      setCameraSwivelSpeed(2.5);
                      setCameraTransitionSpeed(1.2);
                      setCameraShake(false);
                      setInvertSwivel(false);
                      setIsConfirmingResetCamera(false);
                    }}
                    className="px-3 py-1 text-xs font-bold rounded-lg border border-red-600 bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all cursor-pointer shadow-sm animate-pulse"
                  >
                    Confirm Reset?
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingResetCamera(false)}
                    className={`px-2.5 py-1 text-xs rounded-lg border active:scale-95 transition-all cursor-pointer ${
                      isLight
                        ? 'border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700'
                        : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingResetCamera(true)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all cursor-pointer"
                >
                  Reset Camera
                </button>
              )}
            </div>
          </VStack>
        )}

        {/* 3. CONTROLS */}
        {currentTab === 'controls' && (
          <div
            className="flex flex-col gap-3"
            onMouseEnter={() => setHoveredDesc('Rebind keycaps and controller gamepad inputs directly.')}
            onMouseLeave={() => setHoveredDesc(null)}
          >
            <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200 dark:border-neutral-800">
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
          <VStack gap="md" isLight={isLight}>
            <SettingSliderRow
              label="HUD Interface Scale"
              value={hudScale}
              min={70}
              max={130}
              step={5}
              unit="%"
              onChange={setHudScale}
              onHover={() => setHoveredDesc('Scales main screen scoreboard, boost meter and speedometer dimensions.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed select-none ${
                isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}
              onMouseEnter={() => setHoveredDesc('Safe area supports -5% to +10% viewport insets via the top-right toolbar.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <span className="font-bold block mb-1">Safe Area Margin Buffer:</span>
              <span className="opacity-80">
                Supports global -5% tight overscan to +10% protective buffer for curved or notched displays.
              </span>
            </div>
          </VStack>
        )}

        {/* 5. VIDEO */}
        {currentTab === 'video' && (
          <VStack gap="md" isLight={isLight}>
            <SettingToggleRow
              label="Pause Rendering on Menu"
              checked={bgRenderDisabled}
              onCheckedChange={(val) => {
                setBgRenderDisabled(val);
                onToggleBackgroundRender?.(val);
              }}
              onHover={() => setHoveredDesc('Suspends WebGL canvas redraws while pause menu is open to conserve battery and GPU resources.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="Render Scale"
              value={renderScale}
              min={50}
              max={150}
              step={5}
              unit="%"
              onChange={setRenderScale}
              onHover={() => setHoveredDesc('Adjusts 3D canvas buffer physical pixel sampling scale dynamically.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <div
              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-neutral-500/10 transition-colors select-none cursor-pointer"
              onMouseEnter={() => setHoveredDesc('Limits maximum refresh rate of the 3D render loop.')}
              onMouseLeave={() => setHoveredDesc(null)}
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

            <SettingToggleRow
              label="Vertical Sync (VSync)"
              checked={vsync}
              onCheckedChange={setVsync}
              onHover={() => setHoveredDesc('Locks frame presentation to monitor vertical refresh, eliminating tearing.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />
          </VStack>
        )}

        {/* 6. AUDIO */}
        {currentTab === 'audio' && (
          <VStack gap="md" isLight={isLight}>
            <SettingSliderRow
              label="Master Volume"
              value={masterVol}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={setMasterVol}
              onHover={() => setHoveredDesc('Controls overall mixed master audio output gain.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="SFX & Engine Audio"
              value={sfxVol}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={setSFXVol}
              onHover={() => setHoveredDesc('Acoustics for tire screech, supersonic boom, rocket boost and ball impact.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingSliderRow
              label="Ambient & Crowd Reverb"
              value={ambientVol}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={setAmbientVol}
              onHover={() => setHoveredDesc('Arena spectator cheers, stadium horns and environmental acoustic reflections.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            {/* Layer 3 Sub-Menu Entrance */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between transition-colors select-none ${
                isLight ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}
              onMouseEnter={() => setHoveredDesc('Open dedicated 480px 3-band parametric equalizer and HRTF spatial acoustics panel.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                    Acoustics & Equalizer (DSP)
                  </span>
                  <Badge variant="primary" size="sm" isLight={isLight}>
                    Layer 3
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  3-Band frequency equalizer, dynamic range compression and 3D spatial field.
                </span>
              </div>

              {onNavigateAudioDetail && (
                <button
                  type="button"
                  onClick={onNavigateAudioDetail}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all"
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
          <VStack gap="md" isLight={isLight}>
            <SettingToggleRow
              label="Quick Chat Phrases"
              checked={quickChatEnabled}
              onCheckedChange={setQuickChatEnabled}
              onHover={() => setHoveredDesc('Enables D-pad / number key tactical phrase transmission during matches.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />
            <div
              className={`p-4 rounded-xl border text-xs text-neutral-400 select-none ${
                isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}
            >
              Custom preset slots and quick chat binding tables are preserved for next engine release.
            </div>
          </VStack>
        )}

        {/* 8. EXTRA */}
        {currentTab === 'extra' && (
          <VStack gap="md" isLight={isLight}>
            <SettingToggleRow
              label="Auto-Save Match Replay"
              checked={autoSaveReplay}
              onCheckedChange={setAutoSaveReplay}
              onHover={() => setHoveredDesc('Automatically exports high-tickrate replay binary upon match conclusion.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingToggleRow
              label="Telemetry State Recording"
              checked={telemetryRecord}
              onCheckedChange={setTelemetryRecord}
              onHover={() => setHoveredDesc('Logs sub-tick vehicle transform matrices to local debug buffer.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />
          </VStack>
        )}

        {/* 9. ADVANCED */}
        {currentTab === 'advanced' && (
          <VStack gap="md" isLight={isLight}>
            <div
              className={`p-4 rounded-xl border flex items-center justify-between select-none ${
                developerUnlocked
                  ? isLight
                    ? 'bg-red-50/70 border-red-200'
                    : 'bg-red-950/20 border-red-800/60'
                  : isLight
                  ? 'bg-neutral-50 border-neutral-200'
                  : 'bg-neutral-850 border-neutral-700/80'
              }`}
              onMouseEnter={() => setHoveredDesc('Unlocks top-level Developer tab for physics wireframes and WASM runtime profilers.')}
              onMouseLeave={() => setHoveredDesc(null)}
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
                  Reveals experimental physics sub-tick monitors and collision wireframe views.
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
                variant="orange"
                isLight={isLight}
              />
            </div>

            {/* Diagnostic Floating Window Spawner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between select-none ${
                isLight ? 'bg-sky-50/60 border-sky-200' : 'bg-sky-950/20 border-sky-800/60'
              }`}
              onMouseEnter={() => setHoveredDesc('Spawns independent diagnostic windows dockable into the top-right tray.')}
              onMouseLeave={() => setHoveredDesc(null)}
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
                  Independent floating overlay window with minimize-to-stack tray dock.
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
                <span>New Window</span>
              </button>
            </div>
          </VStack>
        )}

        {/* 10. DEVELOPER */}
        {currentTab === 'developer' && (
          <VStack gap="md" isLight={isLight}>
            <SettingToggleRow
              label="Three.js Physics Wireframe"
              checked={showWireframe}
              onCheckedChange={setShowWireframe}
              onHover={() => setHoveredDesc('Overlays 3D collision bounding boxes and OBB vehicle chassis geometry.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />

            <SettingToggleRow
              label="WASM SIMD Profiler"
              checked={wasmProfiling}
              onCheckedChange={setWasmProfiling}
              onHover={() => setHoveredDesc('Prints microsecond bytecode execution times in real-time HUD telemetry.')}
              onLeave={() => setHoveredDesc(null)}
              isLight={isLight}
            />
          </VStack>
        )}
      </PanelContent>

      {/* Dynamic Inspector Footer displaying English description of hovered item */}
      <PanelFooter isLight={isLight}>
        <div className="flex items-center gap-2 w-full text-xs truncate">
          <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className={`truncate transition-all duration-150 ${
            hoveredDesc
              ? (isLight ? 'text-neutral-900 font-medium' : 'text-neutral-100 font-medium')
              : 'text-neutral-500 italic'
          }`}>
            {hoveredDesc || 'Hover over any item to view more details.'}
          </span>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
};
