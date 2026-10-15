import React from 'react';
import { AppWindow, Plus, X, Cpu, Target, Activity } from 'lucide-react';
import { VStack } from '../../layout/VStack';
import { PRESET_WINDOWS, type PresetConfig } from '../../tokens/floatingPresets';

export interface FloatingWindowsTabProps {
  windows: { id: string }[];
  totalCount: number;
  minimizedCount: number;
  onAddPresetWindow?: (preset: PresetConfig, event: React.MouseEvent<HTMLButtonElement>) => void;
  onAddLocalWindow: (presetId: string) => void;
  onCloseWindow: (windowId: string) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

const getPresetIcon = (category: string) => {
  if (category === 'Kernel') {
    return <Cpu className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  }
  if (category === 'Hitbox') {
    return <Target className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  }
  return <Activity className="h-4 w-4 text-neutral-800 dark:text-neutral-200 shrink-0" />;
};

export const FloatingWindowsTab: React.FC<FloatingWindowsTabProps> = ({
  windows,
  totalCount,
  minimizedCount,
  onAddPresetWindow,
  onAddLocalWindow,
  onCloseWindow,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      {/* Top Instruction Banner */}
      <div
        onMouseEnter={() => onHover('Click "+" on any preset window to enqueue it into the top-right Stack tray.')}
        onMouseLeave={onLeave}
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
              onHover(
                `Preset: "${preset.title}" (${preset.resizable ? 'Resizable' : 'Fixed'}, ${preset.width}×${preset.height}px, ${preset.category})`
              )
            }
            onMouseLeave={onLeave}
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
                      onClick={() => onCloseWindow(existingWindow.id)}
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
                    onClick={(e) => {
                      if (onAddPresetWindow) {
                        onAddPresetWindow(preset, e);
                      } else {
                        onAddLocalWindow(preset.id);
                      }
                    }}
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
  );
};
