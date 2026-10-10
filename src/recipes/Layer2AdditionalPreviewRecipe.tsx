import React, { useState } from 'react';
import { 
  Eye, 
  AppWindow, 
  ArrowRight, 
  Plus, 
  X,
  Sparkles, 
  Cpu, 
  Target, 
  Activity, 
  Info,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { UnderlineTabs, TabItem } from '../primitives/UnderlineTabs';
import { Badge } from '../primitives/Badge';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { VStack } from '../layout/VStack';
import { Card } from '../layout/Card';
import { PRESET_WINDOWS, type PresetConfig } from '../tokens/floatingPresets';
import { useFloatingStore } from '../tokens/floatingStore';

export interface Layer2AdditionalPreviewRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  onNavigateLivePreview?: () => void;
  onAddPresetWindow?: (preset: PresetConfig, event: React.MouseEvent<HTMLButtonElement>) => void;
  initialTab?: 'live-preview' | 'floating-windows';
  activeTab?: 'live-preview' | 'floating-windows';
  onTabChange?: (tab: 'live-preview' | 'floating-windows') => void;
}

/** Helper to render preset category icon */
const getPresetIcon = (category: string) => {
  if (category === 'Kernel') {
    return <Cpu className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  }
  if (category === 'Hitbox') {
    return <Target className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  }
  return <Activity className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
};

/**
 * [Recipe] Layer 2 Additional Preview Recipe (Width: 680px)
 * Dedicated secondary menu for previewing experimental interfaces:
 * - Tab 1: Live Preview (Enter Layer 3 dedicated Live Preview container with Tab collapse/expand)
 * - Tab 2: Floating Window (4 varied length presets with unified '+' action button enqueuing to Stack)
 */
export const Layer2AdditionalPreviewRecipe: React.FC<Layer2AdditionalPreviewRecipeProps> = ({
  isLight = false,
  onBack,
  onNavigateLivePreview,
  onAddPresetWindow,
  initialTab = 'live-preview',
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'live-preview' | 'floating-windows'>(initialTab);
  const currentTab = controlledTab ?? internalTab;

  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  const { windows, closeWindow, minimizedCount, totalCount } = useFloatingStore();

  const handleTabChange = (t: string) => {
    const valid = t as 'live-preview' | 'floating-windows';
    setInternalTab(valid);
    onTabChange?.(valid);
  };

  const tabs: TabItem[] = [
    {
      id: 'live-preview',
      label: 'Live Preview',
      badge: (
        <Badge variant="amber" size="sm" isLight={isLight}>
          3D
        </Badge>
      ),
    },
    {
      id: 'floating-windows',
      label: 'Floating Window',
      badge: (
        <Badge variant="primary" size="sm" isLight={isLight}>
          {totalCount > 0 ? totalCount : '4'}
        </Badge>
      ),
    },
  ];

  return (
    <PanelContainer isLight={isLight} className="w-full max-w-[680px]">
      <PanelHeader
        title="ADDITIONAL PREVIEWS"
        subtitle="Live Preview sandbox & floating telemetry overlays"
        badge={
          <Badge variant="warning" size="sm" isLight={isLight}>
            Layer 2
          </Badge>
        }
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

      <PanelContent scrollable className="p-6" data-ui-element="panel-content">
        {/* 1. LIVE PREVIEW TAB */}
        {currentTab === 'live-preview' && (
          <VStack gap="lg" isLight={isLight}>
            {/* Informational Banner */}
            <div
              onMouseEnter={() => setHoveredDesc('Live Preview allows configuring parameters while viewing live 3D arena background.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                isLight
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-500 shrink-0" />
                <span>
                  三级深度参数调节模式。进入三级菜单后，按键盘 <strong className="font-mono">TAB</strong> 键可在居中配置面板与右侧 Dock 药丸之间平滑变形。
                </span>
              </div>
              <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
            </div>

            {/* Entrance Card: Ball Trajectory Predictor */}
            <div
              onMouseEnter={() => setHoveredDesc('Enter Layer 3 Ball Trajectory Predictor configuration with interactive Live Preview.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isLight
                  ? 'bg-neutral-50/90 hover:bg-neutral-100/90 border-neutral-200 shadow-2xs'
                  : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/80'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
                      Ball Trajectory Predictor
                    </span>
                    <Badge variant="warning" size="sm" isLight={isLight}>
                      Layer 3
                    </Badge>
                    <Badge variant="amber" size="sm" isLight={isLight}>
                      Live Preview Ready
                    </Badge>
                  </div>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    预测飞行轨迹时长、弹跳落点光环与马格努斯自旋偏转力。支持 TAB 键一键折叠至侧边药丸，恢复 100% 对局视野。
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateLivePreview}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <span>进入三级实时预览</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Architecture Highlights */}
            <Card isLight={isLight} variant="outlined" className="p-4 flex flex-col gap-2.5">
              <span className={`text-xs font-bold tracking-tight ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                交互与动效架构规范 (Dual-Motion Paradigm)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className={`p-3 rounded-xl border ${
                  isLight ? 'bg-white border-neutral-200/80' : 'bg-neutral-900/60 border-neutral-800'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Layers className="h-3.5 w-3.5 text-amber-500" />
                    <span>水平层级流转</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Layer 2 (680px) ⇄ Layer 3 (480px) 采用居中流体连续形变 (0.28s) 或三段分步淡入淡出，严格保持视口中心锚定。
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${
                  isLight ? 'bg-white border-neutral-200/80' : 'bg-neutral-900/60 border-neutral-800'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Eye className="h-3.5 w-3.5 text-amber-500" />
                    <span>侧边空间折叠</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    TAB 快捷键将 480×540px 面板收折为 88×38px 侧边 Dock 药丸。背景遮罩降为 0%，无矩阵缩放形变抽动。
                  </p>
                </div>
              </div>
            </Card>
          </VStack>
        )}

        {/* 2. FLOATING WINDOWS TAB */}
        {currentTab === 'floating-windows' && (
          <VStack gap="lg" isLight={isLight}>
            {/* Top Instruction Banner */}
            <div
              onMouseEnter={() => setHoveredDesc('Click "+" on any preset window to enqueue it into the top-right Stack tray.')}
              onMouseLeave={() => setHoveredDesc(null)}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                isLight
                  ? 'bg-sky-50/80 border-sky-200 text-sky-950'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <AppWindow className="h-4 w-4 text-sky-500 shrink-0" />
                <span>
                  提供 4 组长短不一的预设窗口（涵盖 1 字符极短标题至超长诊断标题）。点击右侧加号触发飞入右上角 Stack。
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
                4 PRESETS
              </span>
            </div>

            {/* 4 Preset Options */}
            <div className="flex flex-col gap-2">
              {PRESET_WINDOWS.map((preset) => (
                <div
                  key={preset.id}
                  onMouseEnter={() =>
                    setHoveredDesc(
                      `Preset: "${preset.title}" (${preset.resizable ? 'Resizable' : 'Fixed'}, ${preset.width}×${preset.height}px, ${preset.category})`
                    )
                  }
                  onMouseLeave={() => setHoveredDesc(null)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs transition-all ${
                    isLight
                      ? 'bg-neutral-50/90 hover:bg-neutral-100/90 border-neutral-200 shadow-2xs'
                      : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-neutral-200/60 dark:bg-neutral-750 flex items-center justify-center shrink-0">
                      {getPresetIcon(preset.category)}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold truncate text-xs" title={preset.title}>
                        {preset.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 mt-0.5">
                        <span>{preset.category}</span>
                        <span>•</span>
                        <span>{preset.width} × {preset.height}px</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Singleton vs Multi-Instance badge */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                      preset.singleton 
                        ? 'border-indigo-400/40 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' 
                        : 'border-emerald-400/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                    }`}>
                      {preset.singleton ? 'Singleton (1×)' : 'Multi (∞)'}
                    </span>

                    {preset.resizable ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-neutral-400/40 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400">
                        Resizable
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono opacity-50 text-neutral-500">
                        Fixed
                      </span>
                    )}

                    {(() => {
                      const isSingleton = preset.singleton ?? false;
                      const existingWindow = isSingleton
                        ? windows.find((w) => w.id === preset.id || w.id.startsWith(preset.id))
                        : null;

                      if (existingWindow) {
                        return (
                          <button
                            type="button"
                            onClick={() => closeWindow(existingWindow.id)}
                            title={`Remove "${preset.title}" from stack`}
                            className="h-7 w-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 outline-none bg-red-500/15 hover:bg-red-500/25 border-red-400/40 text-red-500 shrink-0"
                          >
                            <X className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>
                        );
                      }

                      return (
                        <button
                          type="button"
                          onClick={(e) => onAddPresetWindow?.(preset, e)}
                          title={`Spawn "${preset.title}" into top-right Stack`}
                          className={`h-7 w-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 shrink-0 ${
                            isLight
                              ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-white shadow-2xs'
                              : 'bg-neutral-100 hover:bg-white border-neutral-200 text-neutral-950 font-bold shadow-2xs'
                          }`}
                        >
                          <Plus className="h-4 w-4 stroke-[2.5]" />
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Floating Stack Status */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-colors ${
                isLight ? 'bg-neutral-100/70 border-neutral-200 text-neutral-600' : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>Active: <strong className="text-neutral-900 dark:text-neutral-100">{totalCount}</strong></span>
                <span>•</span>
                <span>In Stack Tray: <strong className="text-neutral-900 dark:text-neutral-100">{minimizedCount}</strong></span>
              </div>
              <span className="text-[11px] text-neutral-400">
                右上角 Stack 托盘可展开或展开任意已收起窗口
              </span>
            </div>
          </VStack>
        )}
      </PanelContent>

      {/* Dynamic Inspector Footer */}
      <PanelFooter isLight={isLight}>
        <div className="flex items-center gap-2 w-full text-xs truncate" data-ui-element="panel-footer">
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
            {hoveredDesc || '悬停在任意选项上以查看详细参数及说明。'}
          </span>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
};
