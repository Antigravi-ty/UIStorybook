import React from 'react';
import { Plus, Minus, X, Copy, RotateCcw } from 'lucide-react';
import { Badge } from '../../../primitives/Badge';
import { CodeBlock } from '../../CodeBlock';
import { floatingSandboxStore, type FloatingWindowItem } from '../../../tokens/floatingStore';
import {
  PRESET_WINDOWS,
  type PresetConfig,
  type FloatingWindowVisibilityTier,
} from '../../../tokens/floatingPresets';
import { FloatingStackIcon } from '../../../navigation/FloatingStackIcon';
import { FloatingWindowManager } from '../../../navigation/FloatingWindowManager';
import { FloatingWindowIcon } from '../../../navigation/FloatingWindowIcon';
import { renderFloatingWindowPanel } from '../../../panels';

export interface FloatingWindowsMinWidthCalibrationBarProps {
  isLight: boolean;
  currentPreset: PresetConfig;
  activeManualMinW: number | undefined;
  resolvedAutoMinW: number;
  resolvedEffectiveMinW: number;
  resolvedScrollbarReserve: number;
  activeWindowInstance: FloatingWindowItem | undefined;
  minWidthDraft: string;
  setMinWidthDraft: React.Dispatch<React.SetStateAction<string>>;
  setIsEditingMinWidth: React.Dispatch<React.SetStateAction<boolean>>;
  applyManualMinWidth: (nextRawPx: number) => void;
  handleSnapToMinWidth: (withVerticalScrollbar: boolean) => void;
  handleResetAutoMinWidth: () => void;
  handleCopyCalibratedParams: () => void;
}

export const FloatingWindowsMinWidthCalibrationBar: React.FC<
  FloatingWindowsMinWidthCalibrationBarProps
> = ({
  isLight,
  currentPreset,
  activeManualMinW,
  resolvedAutoMinW,
  resolvedEffectiveMinW,
  resolvedScrollbarReserve,
  activeWindowInstance,
  minWidthDraft,
  setMinWidthDraft,
  setIsEditingMinWidth,
  applyManualMinWidth,
  handleSnapToMinWidth,
  handleResetAutoMinWidth,
  handleCopyCalibratedParams,
}) => {
  return (
    <div
      className={`pt-2.5 border-t flex flex-wrap items-center justify-between gap-2.5 ${
        isLight ? 'border-neutral-200/80' : 'border-neutral-800/80'
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold">
          最小宽度标定 (MinWidth Calibration · 标准 1px 整数步进):
        </span>
        <Badge
          variant={activeManualMinW !== undefined ? 'warning' : 'info'}
          size="sm"
          isLight={isLight}
        >
          {activeManualMinW !== undefined
            ? `MANUAL ${activeManualMinW}px`
            : `AUTO-DETECT ${resolvedAutoMinW}px`}
        </Badge>
        {resolvedScrollbarReserve > 0 && (
          <span className="text-[10px] font-mono opacity-70">
            [已默认预留右侧滚动条 +{resolvedScrollbarReserve}px]
          </span>
        )}
        {activeWindowInstance && (
          <span className="text-[10px] font-mono text-sky-400">
            当前窗口尺寸: {Math.round(activeWindowInstance.width ?? 0)}×
            {Math.round(activeWindowInstance.height ?? 0)}px
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* -1px button */}
        <button
          type="button"
          title="减少 1px (标准最小单位 -1px)"
          onClick={() => applyManualMinWidth(resolvedEffectiveMinW - 1)}
          className={`flex items-center gap-0.5 px-2 py-1 rounded-lg border text-[11px] font-mono font-bold cursor-pointer transition-colors active:scale-95 ${
            isLight
              ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-100'
          }`}
        >
          <Minus className="h-3 w-3" />
          <span>1px</span>
        </button>

        {/* Standard 1px integer input */}
        <div
          className={`flex items-center rounded-lg border px-2 py-0.5 ${
            isLight
              ? 'bg-white border-neutral-300 text-neutral-900'
              : 'bg-neutral-900 border-neutral-700 text-neutral-100'
          }`}
        >
          <input
            type="number"
            step={1}
            min={240}
            max={960}
            aria-label="Manual MinWidth in standard 1px integers"
            value={minWidthDraft}
            onFocus={() => setIsEditingMinWidth(true)}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              setMinWidthDraft(raw);
            }}
            onBlur={() => {
              setIsEditingMinWidth(false);
              const parsed = parseInt(minWidthDraft, 10);
              if (!Number.isNaN(parsed)) {
                applyManualMinWidth(parsed);
              } else {
                setMinWidthDraft(String(resolvedEffectiveMinW));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const parsed = parseInt(minWidthDraft, 10);
                if (!Number.isNaN(parsed)) {
                  applyManualMinWidth(parsed);
                }
                (e.target as HTMLInputElement).blur();
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                applyManualMinWidth(resolvedEffectiveMinW + 1);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                applyManualMinWidth(resolvedEffectiveMinW - 1);
              }
            }}
            className="w-14 bg-transparent text-center font-mono text-xs font-bold focus:outline-none"
          />
          <span className="text-[10px] font-mono opacity-60 select-none">px</span>
        </div>

        {/* +1px button */}
        <button
          type="button"
          title="增加 1px (标准最小单位 +1px)"
          onClick={() => applyManualMinWidth(resolvedEffectiveMinW + 1)}
          className={`flex items-center gap-0.5 px-2 py-1 rounded-lg border text-[11px] font-mono font-bold cursor-pointer transition-colors active:scale-95 ${
            isLight
              ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-100'
          }`}
        >
          <Plus className="h-3 w-3" />
          <span>1px</span>
        </button>

        {/* Quick verify buttons: Snap to MinW & Snap to MinW + Vertical Scrollbar */}
        <button
          type="button"
          onClick={() => handleSnapToMinWidth(false)}
          className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
            isLight
              ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
          }`}
        >
          缩至最小宽度 ({resolvedEffectiveMinW}px)
        </button>

        {currentPreset.resizable && (
          <button
            type="button"
            onClick={() => handleSnapToMinWidth(true)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
              isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
          >
            最小宽+压窄高度测滚动条
          </button>
        )}

        {activeManualMinW !== undefined && (
          <button
            type="button"
            onClick={handleResetAutoMinWidth}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-700/60 text-amber-300'
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            <span>恢复 Auto ({resolvedAutoMinW}px)</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCopyCalibratedParams}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold cursor-pointer transition-colors ${
            isLight
              ? 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-800'
              : 'bg-sky-950/50 hover:bg-sky-900/60 border-sky-700/60 text-sky-300'
          }`}
        >
          <Copy className="h-3 w-3" />
          <span>Copy 标定参数</span>
        </button>
      </div>
    </div>
  );
};

export interface FloatingWindowsCanvasStageProps {
  isLight: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  containerPreset: 'full' | '1080p-compact' | 'small-squeeze';
  opacity: number;
  totalCount: number;
  minimizedCount: number;
  currentPreset: PresetConfig | undefined;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  fwMode: 'inspector' | 'stack';
  tier: FloatingWindowVisibilityTier;
  activeTierWindows: PresetConfig[];
  windows: FloatingWindowItem[];
  closeWindow: (id: string) => void;
  handleAddPresetToStack: (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const FloatingWindowsCanvasStage: React.FC<FloatingWindowsCanvasStageProps> = ({
  isLight,
  canvasRef,
  containerPreset,
  opacity,
  totalCount,
  minimizedCount,
  currentPreset,
  activeSubTab,
  setActiveSubTab,
  fwMode,
  tier,
  activeTierWindows,
  windows,
  closeWindow,
  handleAddPresetToStack,
}) => {
  return (
    <>
      <div
        ref={canvasRef}
        className={`relative mx-auto rounded-2xl border p-6 overflow-hidden select-none transition-all duration-300 ${
          isLight
            ? 'bg-neutral-100/70 border-neutral-200 shadow-inner'
            : 'bg-neutral-950/80 border-neutral-800 shadow-inner'
        }`}
        style={{
          width:
            containerPreset === 'full'
              ? '100%'
              : containerPreset === '1080p-compact'
              ? '760px'
              : '520px',
          maxWidth: '100%',
          height:
            containerPreset === 'full'
              ? '700px'
              : containerPreset === '1080p-compact'
              ? '520px'
              : '380px',
          backgroundImage: isLight
            ? 'radial-gradient(#d4d4d8 1px, transparent 1px)'
            : 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Background Canvas Ambient Notice */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-25 select-none">
          <span className="text-3xl mb-1">🎮</span>
          <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
            [Active 3D Arena Canvas · Opacity {opacity}% · Active Windows: {totalCount} · Minimized: {minimizedCount}]
          </span>
          <span className="text-[11px] text-neutral-400 max-w-md text-center mt-1">
            所有浮动窗口均运行在统一解耦的 FloatingWindowManager 容器内，含底部悬停说明 Footer、右下角同心圆弧 Corner Arc 缩放握把与无上限自由宽高缩放。
          </span>
        </div>

        {/* Floating Stack Icon positioned strictly in top-right of active canvas */}
        <FloatingStackIcon
          isLight={isLight}
          store={floatingSandboxStore}
          absolute={true}
          containerRef={canvasRef}
        />

        {/* Floating Windows Manager rendering real L6 normalized panels */}
        <FloatingWindowManager
          isLight={isLight}
          store={floatingSandboxStore}
          containerRef={canvasRef}
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
            renderFloatingWindowPanel(item.id, {
              isLight: ctx.isLight,
              activeTab: item.id === currentPreset?.id ? activeSubTab || undefined : undefined,
              onTabChange: item.id === currentPreset?.id ? setActiveSubTab : undefined,
            })
          }
        />

        {/* In Multi-Window Stack Mode, show Bottom-Left Preset Launcher Dock filtered by active Tier */}
        {fwMode === 'stack' && (
          <div
            className={`absolute bottom-4 left-4 z-30 max-w-[360px] max-h-[340px] overflow-y-auto w-full p-3 rounded-2xl border backdrop-blur-md select-none transition-colors ${
              isLight
                ? 'bg-white/95 border-neutral-300 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_0_16px_rgba(0,0,0,0.12)]'
                : 'bg-neutral-900/95 border-neutral-700 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_0_20px_rgba(0,0,0,0.7),0_0_28px_rgba(255,255,255,0.06)]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 dark:border-neutral-800 mb-2">
              <span className="text-xs font-bold tracking-tight">
                {tier === 'user' ? 'USER PRESET WINDOWS (6)' : 'DEV PRESET WINDOWS (19)'}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">Enqueues to Stack</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {activeTierWindows.map((preset) => {
                const isSingleton = preset.singleton ?? true;
                const existingWindow = isSingleton
                  ? windows.find((w) => w.id === preset.id || w.id.startsWith(preset.id))
                  : null;

                return (
                  <div
                    key={preset.id}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
                      isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                        : 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FloatingWindowIcon
                        id={preset.id}
                        category={preset.category}
                        className="h-3.5 w-3.5 text-neutral-800 dark:text-neutral-200 shrink-0"
                      />
                      <span className="font-medium truncate text-xs" title={preset.title}>
                        {preset.title}
                      </span>
                    </div>

                    {existingWindow ? (
                      <button
                        type="button"
                        onClick={() => closeWindow(existingWindow.id)}
                        title={`Remove ${preset.title} from stack`}
                        className="h-6 w-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 outline-none bg-red-500/15 hover:bg-red-500/25 border-red-400/40 text-red-500 shrink-0"
                      >
                        <X className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleAddPresetToStack(preset, e)}
                        title={`Enqueue ${preset.title} into top-right Stack`}
                        className={`h-6 w-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 outline-none shrink-0 ${
                          isLight
                            ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-white'
                            : 'bg-neutral-100 hover:bg-white border-neutral-200 text-neutral-950 font-bold'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Code Snippet for Floating Window */}
      <CodeBlock
        isLight={isLight}
        title="Floating Window 解耦注册表与调用规范 (L4 Shell + L6 Panel Registry)"
        code={`import { FloatingWindowManager } from '@/navigation/FloatingWindowManager';
import { renderFloatingWindowPanel } from '@/panels';

// L4 FloatingWindowManager 保持 100% 纯净外壳，通过 renderWindowContent 注入 L6 规范化业务面板：
<FloatingWindowManager
  isLight={isLight}
  containerRef={stageRef}
  renderWindowContent={(item, ctx) =>
    renderFloatingWindowPanel(item.id, { isLight: ctx.isLight })
  }
/>`}
      />
    </>
  );
};
