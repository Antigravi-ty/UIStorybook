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
  Target
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

  // Gameplay states
  const [ballCamIndicator, setBallCamIndicator] = useState(true);
  const [highTickrate, setHighTickrate] = useState(true);

  // Chat & Interface
  const [quickChatEnabled, setQuickChatEnabled] = useState(true);
  const [hudScale, setHudScale] = useState(100);

  // Developer states
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
      <div className="px-6 pt-2 overflow-x-auto no-scrollbar">
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
          <VStack gap="lg" isLight={isLight}>
            <ToggleSwitch
              label="Ball Cam Indicator (球相机指向器)"
              description="在屏幕中心渲染箭头提示当前来球方位"
              checked={ballCamIndicator}
              onCheckedChange={setBallCamIndicator}
              isLight={isLight}
            />
            <ToggleSwitch
              label="120Hz Sub-Tick Simulation (高频物理循环)"
              description="启用 SIMD 硬件加速的超高帧率物理循环"
              checked={highTickrate}
              onCheckedChange={setHighTickrate}
              isLight={isLight}
            />

            {/* Layer 3 独立三级菜单入口: Ball Trajectory Predictor Configuration Panel */}
            <div className={`mt-2 p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
              isLight ? 'bg-amber-50/60 border-amber-200/90' : 'bg-amber-950/20 border-amber-900/50'
            }`}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                    Ball Trajectory Predictor Configuration (弹道预测器面板)
                  </span>
                  <Badge variant="warning" size="sm" isLight={isLight}>
                    Layer 3 · Live Preview
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  配置球体飞行轨线预测时长、碰撞波环与马格努斯自旋。支持 Tab 键收起至右侧中心 Live Preview。
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTrajectoryDetail?.()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-xs cursor-pointer transition-colors shrink-0 ml-3"
              >
                <span>配置参数</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </VStack>
        )}

        {/* 2. CAMERA */}
        {currentTab === 'camera' && (
          <VStack gap="lg" isLight={isLight}>
            <SliderControl
              label="Field of View (FOV)"
              value={fov}
              min={60}
              max={120}
              step={1}
              unit="°"
              description="水平视野广角范围"
              onChange={setFov}
              isLight={isLight}
            />
            <SliderControl
              label="Camera Distance (相机距车身距离)"
              value={cameraDistance}
              min={200}
              max={400}
              step={10}
              unit="uu"
              description="第三人称追踪相机距离"
              onChange={setCameraDistance}
              isLight={isLight}
            />
            <SliderControl
              label="Camera Height (相机垂直高度)"
              value={cameraHeight}
              min={60}
              max={180}
              step={5}
              unit="uu"
              description="俯视跟踪相机离地高度"
              onChange={setCameraHeight}
              isLight={isLight}
            />
          </VStack>
        )}

        {/* 3. CONTROLS: Embedded Key Controls table */}
        {currentTab === 'controls' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200 dark:border-neutral-800">
              <span className={`font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                Keyboard & Controller Remapping (按键与手柄映射)
              </span>
              <span className="text-[11px] font-mono opacity-70">Unified Controls Layer</span>
            </div>
            <KeybindingRecipe isLight={isLight} />
          </div>
        )}

        {/* 4. INTERFACE */}
        {currentTab === 'interface' && (
          <VStack gap="lg" isLight={isLight}>
            <SliderControl
              label="HUD Interface Scale"
              value={hudScale}
              min={70}
              max={130}
              step={5}
              unit="%"
              description="调整主屏幕战况与仪表盘缩放比"
              onChange={setHudScale}
              isLight={isLight}
            />
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
            }`}>
              <span className="font-bold block mb-1">Safe Area Margin / 屏幕安全区边距：</span>
              <span className="opacity-80">支持全局 -5% ~ +10% 物理显示区域适配，可通过右上方遥测工具条实时微调。</span>
            </div>
          </VStack>
        )}

        {/* 5. VIDEO: Contains Render Disable / Background Pause Settings */}
        {currentTab === 'video' && (
          <VStack gap="lg" isLight={isLight}>
            {/* Background Render Disable Option */}
            <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
              isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-500">
                      Background Render Pause (暂停时抑制背景渲染)
                    </span>
                    <Badge variant="amber" size="sm" isLight={isLight}>
                      Instant FPS Saver
                    </Badge>
                  </div>
                  <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
                    菜单处于展开状态时，暂停 Three.js 场景渲染以节省 GPU 算力并保持低发热。
                  </span>
                </div>
                <ToggleSwitch
                  checked={bgRenderDisabled}
                  onCheckedChange={(val) => {
                    setBgRenderDisabled(val);
                    onToggleBackgroundRender?.(val);
                  }}
                  variant="orange"
                  isLight={isLight}
                />
              </div>
            </div>

            <SliderControl
              label="Render Scale (渲染分辨率比例)"
              value={renderScale}
              min={50}
              max={150}
              step={5}
              unit="%"
              description="调整 3D Canvas 缓冲区物理像素采样率"
              onChange={setRenderScale}
              isLight={isLight}
            />

            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col gap-0.5">
                <span className={`font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                  Max Framerate Limit
                </span>
                <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  限制渲染循环最大刷新频率
                </span>
              </div>
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

            <ToggleSwitch
              label="Vertical Sync (VSync 垂直同步)"
              description="使刷新率与显示器物理扫描同步，消除画面撕裂"
              checked={vsync}
              onCheckedChange={setVsync}
              isLight={isLight}
            />
          </VStack>
        )}

        {/* 6. AUDIO: Quick Levels + Layer 3 DSP Entrance */}
        {currentTab === 'audio' && (
          <VStack gap="lg" isLight={isLight}>
            <SliderControl
              label="Master Volume"
              value={masterVol}
              min={0}
              max={100}
              step={5}
              unit="%"
              description="主混音总音量输出"
              onChange={setMasterVol}
              isLight={isLight}
            />

            <SliderControl
              label="SFX & Engine Audio"
              value={sfxVol}
              min={0}
              max={100}
              step={5}
              unit="%"
              description="轮胎抓地音、火箭推进与球体碰撞声"
              onChange={setSFXVol}
              isLight={isLight}
            />

            <SliderControl
              label="Ambient & Crowd Reverb"
              value={ambientVol}
              min={0}
              max={100}
              step={5}
              unit="%"
              description="球场观众欢呼声与场馆混响"
              onChange={setAmbientVol}
              isLight={isLight}
            />

            {/* Layer 3 Sub-Menu Entrance */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                isLight ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                    音频高级均衡器与声场 (Acoustics & EQ)
                  </span>
                  <Badge variant="primary" size="sm" isLight={isLight}>
                    Layer 3
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  进入独立 480px 三段频响均衡器、动态压缩比与 HRTF 空间环绕调节面板
                </span>
              </div>

              {onNavigateAudioDetail && (
                <button
                  type="button"
                  onClick={onNavigateAudioDetail}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                    isLight
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-2xs'
                      : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-2xs'
                  }`}
                >
                  <span>进入 Layer 3</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </VStack>
        )}

        {/* 7. CHAT */}
        {currentTab === 'chat' && (
          <VStack gap="lg" isLight={isLight}>
            <ToggleSwitch
              label="Quick Chat (十字键快速短语)"
              description="支持在对局中使用手柄十字键快速发送预设战术指令"
              checked={quickChatEnabled}
              onCheckedChange={setQuickChatEnabled}
              isLight={isLight}
            />
            <div className={`p-4 rounded-xl border text-xs text-neutral-400 ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
            }`}>
              预设短语与快捷输入槽位配置已预留，可在后续版本中无缝挂载。
            </div>
          </VStack>
        )}

        {/* 8. EXTRA */}
        {currentTab === 'extra' && (
          <div className="flex flex-col gap-3">
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
            }`}>
              <span className="font-bold block mb-1">Extra Features (扩展选项)：</span>
              <span>包含游戏回放自动保存、遥测指标录制等辅助功能（占位待填充）。</span>
            </div>
          </div>
        )}

        {/* 9. ADVANCED: Contains 'Enable Developer Settings' */}
        {currentTab === 'advanced' && (
          <VStack gap="lg" isLight={isLight}>
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              developerUnlocked
                ? isLight
                  ? 'bg-red-50/70 border-red-200'
                  : 'bg-red-950/20 border-red-800/60'
                : isLight
                ? 'bg-neutral-50 border-neutral-200'
                : 'bg-neutral-850 border-neutral-700/80'
            }`}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-red-500">
                    Enable Developer Settings (启用开发者设置)
                  </span>
                  <Badge variant="danger" size="sm" isLight={isLight}>
                    Diagnostics
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  解锁顶部的【Developer】专用调试选项卡，用于物理管线、线框图与 WASM 性能剖析。
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

            {/* Diagnostic Floating Window (F10) Spawner with '+' Button */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-sky-50/60 border-sky-200' : 'bg-sky-950/20 border-sky-800/60'
            }`}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-sky-500" />
                  <span className="font-bold text-xs text-sky-600 dark:text-sky-400">
                    F10 Diagnostic Floating Window (诊断悬浮窗口)
                  </span>
                  <Badge variant="primary" size="sm" isLight={isLight}>
                    Floating Window
                  </Badge>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  生成独立于主菜单层级的悬浮诊断窗口。点击最小化收缩进入右上角 Stack 托盘。
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
                title="添加诊断窗口并收缩至右上角 Stack 托盘"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>新建窗口</span>
              </button>
            </div>
          </VStack>
        )}

        {/* 10. DEVELOPER (Dynamic unlocked tab) */}
        {currentTab === 'developer' && (
          <VStack gap="lg" isLight={isLight}>
            <div className={`p-3 rounded-lg border text-xs ${
              isLight ? 'bg-red-50 text-red-900 border-red-200' : 'bg-red-950/30 text-red-300 border-red-800/80'
            }`}>
              ⚠️ 开发者模式已激活：以下选项仅供内核调优使用。
            </div>

            <ToggleSwitch
              label="Three.js Physics Wireframe (刚体线框渲染)"
              description="显示车身 OBB / 球体碰撞箱物理网格"
              checked={showWireframe}
              onCheckedChange={setShowWireframe}
              isLight={isLight}
            />

            <ToggleSwitch
              label="WASM SIMD Profiler (微秒级遥测监控)"
              description="在 HUD 顶部实时打印 Sub-tick 时延与字节码执行耗时"
              checked={wasmProfiling}
              onCheckedChange={setWasmProfiling}
              isLight={isLight}
            />
          </VStack>
        )}
      </PanelContent>

      <PanelFooter hint="ESC to Back" isLight={isLight}>
        <span>Active Tab: {currentTab.toUpperCase()}</span>
      </PanelFooter>
    </PanelContainer>
  );
};
