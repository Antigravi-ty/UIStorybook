import React, { useState } from 'react';
import { 
  Eye, 
  AppWindow, 
  Sparkles, 
  Activity, 
  Cpu, 
  Target, 
  Plus, 
  ArrowRight, 
  Layers, 
  Info,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { UnderlineTabs, TabItem } from '../primitives/UnderlineTabs';
import { Badge } from '../primitives/Badge';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { Card } from '../layout/Card';
import { VStack } from '../layout/VStack';
import { HStack } from '../layout/HStack';
import { floatingStore, FloatingWindowItem } from '../tokens/floatingStore';

export interface PresetConfig {
  id: string;
  title: string;
  category: string;
  width: number;
  height: number;
  resizable: boolean;
}

export const ADDITIONAL_PREVIEW_PRESETS: PresetConfig[] = [
  {
    id: 'simd-short',
    title: '1',
    category: 'Kernel',
    width: 320,
    height: 220,
    resizable: false,
  },
  {
    id: 'pid-short-resizable',
    title: '1 (Resizable)',
    category: 'Diagnostic',
    width: 360,
    height: 240,
    resizable: true,
  },
  {
    id: 'telemetry-long',
    title: 'Diagnostic Telemetry & Real-Time Engine Spectrogram Stream',
    category: 'Hitbox',
    width: 480,
    height: 280,
    resizable: false,
  },
  {
    id: 'aero-long-resizable',
    title: 'Advanced Aerodynamic Downforce Vector Matrix Calibration (Resizable)',
    category: 'Diagnostic',
    width: 500,
    height: 320,
    resizable: true,
  },
];

export interface Layer2AdditionalPreviewRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  initialTab?: 'live-preview' | 'floating-window';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onNavigateLivePreview?: () => void;
  onSpawnPresetWindow?: (preset: PresetConfig, event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

/**
 * [Recipe] Layer 2 Additional Preview Menu (Width: 680px)
 * Dedicated preview hub featuring 2 UnderlineTabs:
 * - Live Preview: Interactive entrance to Layer 3 Ball Trajectory live preview with Tab shortcut dock collapse.
 * - Floating Window: 4 diagnostic preset windows (varying title lengths, fixed vs resizable) enqueued into top-right Stack.
 *
 * Conforms to RLCleanWASM standards: dynamic hover descriptions delegated to PanelFooter.
 */
export const Layer2AdditionalPreviewRecipe: React.FC<Layer2AdditionalPreviewRecipeProps> = ({
  isLight = false,
  onBack,
  initialTab = 'live-preview',
  activeTab: controlledTab,
  onTabChange,
  onNavigateLivePreview,
  onSpawnPresetWindow,
  className = '',
}) => {
  const [internalTab, setInternalTab] = useState<'live-preview' | 'floating-window'>(initialTab);
  const currentTab = (controlledTab as 'live-preview' | 'floating-window') ?? internalTab;

  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  const handleTabChange = (t: string) => {
    const valid = t as 'live-preview' | 'floating-window';
    setInternalTab(valid);
    onTabChange?.(valid);
  };

  const getPresetIcon = (category: string) => {
    if (category === 'Kernel') return <Cpu className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
    if (category === 'Hitbox') return <Target className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
    return <Activity className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  };

  const handleAddPreset = (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSpawnPresetWindow) {
      onSpawnPresetWindow(preset, e);
    } else {
      floatingStore.spawnWindow({
        id: `${preset.id}-${Date.now().toString().slice(-4)}`,
        title: preset.title,
        category: preset.category,
        width: preset.width,
        height: preset.height,
        resizable: preset.resizable,
        startMinimized: true,
      });
    }
  };

  const tabs: TabItem[] = [
    { id: 'live-preview', label: 'Live Preview' },
    { id: 'floating-window', label: 'Floating Window' },
  ];

  return (
    <PanelContainer
      isLight={isLight}
      className={`w-full max-w-[680px] ${
        isLight
          ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
          : 'shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
      } ${className}`}
    >
      <PanelHeader
        title="ADDITIONAL PREVIEWS"
        subtitle="Live Preview Dock • Floating Diagnostic Windows"
        badge={
          <Badge variant="amber" size="sm" isLight={isLight}>
            LAYER 2
          </Badge>
        }
        onBack={onBack}
        isLight={isLight}
      />

      <div
        className={`px-6 border-b transition-colors ${
          isLight ? 'border-neutral-200/90 bg-neutral-50/50' : 'border-neutral-800/80 bg-neutral-900/40'
        }`}
      >
        <UnderlineTabs
          items={tabs}
          activeId={currentTab}
          onChange={handleTabChange}
          isLight={isLight}
        />
      </div>

      <PanelContent scrollable className="p-6 h-[400px] overflow-y-auto">
        {/* TAB 1: LIVE PREVIEW */}
        {currentTab === 'live-preview' && (
          <VStack gap="lg" isLight={isLight}>
            {/* Context Notice Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2 transition-colors ${
                isLight
                  ? 'bg-amber-50/60 border-amber-200/80 text-amber-950'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
              onMouseEnter={() => setHoveredDesc('Live Preview Mode allows in-situ parameter tuning while retaining unblocked arena view via TAB shortcut.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wider">Live Preview Architecture</span>
                </div>
                <Badge variant="amber" size="sm" isLight={isLight}>
                  TAB ENABLED
                </Badge>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                Entering a Live Preview container enables responsive side docking. Pressing <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} className="inline-flex mx-1" /> collapses the full parameter panel to a right-middle tactile dock pill, restoring 100% background arena rendering without darkening.
              </p>
            </div>

            {/* Clickable Card entering Layer 3 Ball Trajectory Live Preview */}
            <div
              onMouseEnter={() => setHoveredDesc('Launch Layer 3 Ball Trajectory Predictor. Supports live 3D arc adjustments and TAB side dock collapse.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <button
                type="button"
                onClick={onNavigateLivePreview}
                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between gap-4 transition-all cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.99] ${
                  isLight
                    ? 'bg-white hover:bg-neutral-50/90 border-neutral-200 shadow-2xs hover:border-amber-400'
                    : 'bg-neutral-900/90 hover:bg-neutral-850 border-neutral-700/80 shadow-2xs hover:border-amber-500/60'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isLight
                        ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-200'
                        : 'bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30'
                    }`}
                  >
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                        Ball Trajectory Predictor
                      </span>
                      <Badge variant="success" size="sm" isLight={isLight}>
                        Layer 3
                      </Badge>
                      <Badge variant="amber" size="sm" isLight={isLight}>
                        Live Preview Ready
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                      Predictive physics ribbon, Magnus spin visualizer, bounce rings and sub-tick solver.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 group-hover:underline hidden sm:inline">
                    Enter Preview
                  </span>
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:translate-x-1 ${
                      isLight ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            </div>

            {/* Specifications preview table */}
            <Card isLight={isLight} variant="outlined" className="p-4 flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-tight text-neutral-500 dark:text-neutral-400 uppercase font-mono">
                Live Preview Transition Specs
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40">
                  <span className="text-neutral-500">Expanded Dimensions</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">480px × 540px</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40">
                  <span className="text-neutral-500">Collapsed Dock Pill</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">88px × 38px (Right)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40">
                  <span className="text-neutral-500">Collapse Step 1 (Fade)</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">110ms Apple Ease</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40">
                  <span className="text-neutral-500">Collapse Step 2 (Resize)</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">260ms Apple Ease</span>
                </div>
              </div>
            </Card>
          </VStack>
        )}

        {/* TAB 2: FLOATING WINDOW */}
        {currentTab === 'floating-window' && (
          <VStack gap="lg" isLight={isLight}>
            {/* Context Notice Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2 transition-colors ${
                isLight
                  ? 'bg-neutral-100/70 border-neutral-300/80 text-neutral-900'
                  : 'bg-neutral-900/70 border-neutral-800 text-neutral-100'
              }`}
              onMouseEnter={() => setHoveredDesc('Spawn non-modal diagnostic telemetry windows. Items fly to the top-right Stack and can be dragged or resized freely.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AppWindow className="h-4 w-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wider">Floating Diagnostic Windows</span>
                </div>
                <Badge variant="neutral" size="sm" isLight={isLight}>
                  4 PRESETS
                </Badge>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                Click the <strong className="font-mono font-bold text-neutral-900 dark:text-neutral-100">+</strong> button on any preset below to launch the sequenced transition into the top-right Stack. Minimized windows can be restored, moved across the arena canvas, or resized without blocking gameplay.
              </p>
            </div>

            {/* 4 Preset Options */}
            <div className="flex flex-col gap-2">
              {ADDITIONAL_PREVIEW_PRESETS.map((preset, idx) => (
                <div
                  key={preset.id}
                  onMouseEnter={() => setHoveredDesc(`Preset #${idx + 1}: [${preset.title}] • ${preset.category} • ${preset.width}x${preset.height}px (${preset.resizable ? 'Resizable' : 'Fixed'})`)}
                  onMouseLeave={() => setHoveredDesc(null)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                    isLight
                      ? 'bg-white hover:bg-neutral-50/90 border-neutral-200 shadow-2xs'
                      : 'bg-neutral-900/90 hover:bg-neutral-850 border-neutral-700/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isLight ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {getPresetIcon(preset.category)}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate"
                          title={preset.title}
                        >
                          {preset.title}
                        </span>
                        {preset.resizable ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 border border-neutral-400/40 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800">
                            Resizable
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 opacity-50 text-neutral-500 bg-neutral-100 dark:bg-neutral-800">
                            Fixed
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {preset.category} • {preset.width}px × {preset.height}px
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddPreset(preset, e)}
                    title={`Enqueue "${preset.title}" into top-right Stack`}
                    className={`h-8 w-8 rounded-xl border flex items-center justify-center cursor-pointer transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 shrink-0 ${
                      isLight
                        ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-white shadow-2xs'
                        : 'bg-neutral-100 hover:bg-white border-neutral-200 text-neutral-950 font-bold shadow-2xs'
                    }`}
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              ))}
            </div>
          </VStack>
        )}
      </PanelContent>

      <PanelFooter hint="ESC to Back" isLight={isLight}>
        <div className="flex items-center gap-2 w-full text-xs truncate">
          <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span
            className={`truncate transition-colors duration-150 ${
              hoveredDesc
                ? isLight
                  ? 'text-neutral-900'
                  : 'text-neutral-100'
                : isLight
                ? 'text-neutral-400'
                : 'text-neutral-500'
            }`}
          >
            {hoveredDesc || (currentTab === 'live-preview' ? 'Click Ball Trajectory to launch Live Preview container' : 'Click + to enqueue preset diagnostic windows into top-right Stack')}
          </span>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
};
