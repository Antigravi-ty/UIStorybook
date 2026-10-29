import React, { useRef, useEffect } from 'react';
import {
  quickNotification,
} from '../../tokens';
import { createScopedSyncedState, readUrlParams, updateUrlParams } from '../stores';
import {
  AppWindow,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Terminal,
  Eye,
  Layers,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { CodeBlock } from '../CodeBlock';
import { floatingSandboxStore, useFloatingStore } from '../../tokens/floatingStore';
import {
  USER_PRESET_WINDOWS,
  DEV_PRESET_WINDOWS,
  PRESET_WINDOWS,
  type PresetConfig,
  type FloatingWindowVisibilityTier,
} from '../../tokens/floatingPresets';
import { FloatingStackIcon } from '../../navigation/FloatingStackIcon';
import { FloatingWindowManager } from '../../navigation/FloatingWindowManager';
import { FloatingWindowIcon } from '../../navigation/FloatingWindowIcon';
import { renderFloatingWindowPanel } from '../../panels';

const useState = createScopedSyncedState('page:floating-windows-v2');

export interface FloatingWindowsSimulationPageProps {
  isLight?: boolean;
}

export const FloatingWindowsSimulationPage: React.FC<FloatingWindowsSimulationPageProps> = ({
  isLight = false,
}) => {
  const {
    windows,
    minimizedCount,
    totalCount,
    opacity,
    setOpacity,
    spawnWithFlight,
    updateSize,
    updateMinWidth,
    closeWindow,
    clearAll,
  } = useFloatingStore(floatingSandboxStore);

  const [rawTier, setTier] = useState<FloatingWindowVisibilityTier>(() => {
    const params = readUrlParams();
    if (params.fw) {
      const match = PRESET_WINDOWS.find((p) => p.id === params.fw);
      if (match?.tier) return match.tier;
    }
    return params.tier === 'developer' ? 'developer' : 'user';
  }, 'tier');
  const tier: FloatingWindowVisibilityTier = rawTier === 'developer' ? 'developer' : 'user';
  const [rawFwMode, setFwMode] = useState<'inspector' | 'stack'>(() => {
    const params = readUrlParams();
    return params.fwMode === 'stack' ? 'stack' : 'inspector';
  }, 'fwMode');
  const fwMode: 'inspector' | 'stack' = rawFwMode === 'stack' ? 'stack' : 'inspector';
  const [selectedWindowId, setSelectedWindowId] = useState<string>(() => {
    const params = readUrlParams();
    if (params.fw && PRESET_WINDOWS.some((p) => p.id === params.fw)) {
      return params.fw;
    }
    return USER_PRESET_WINDOWS[0].id;
  }, 'selectedWindowId');
  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    const params = readUrlParams();
    if (params.fwTab) return params.fwTab;
    if (params.fw) {
      const match = PRESET_WINDOWS.find((p) => p.id === params.fw);
      if (match?.tabs && match.tabs.length > 0) return match.tabs[0].id;
    }
    return '';
  }, 'activeSubTab');

  const [containerPreset, setContainerPreset] = useState<'full' | '1080p-compact' | 'small-squeeze'>(
    'full',
    'containerPreset'
  );

  // Manual minWidth calibration map (strictly 1px integer standard units)
  const [manualMinWidths, setManualMinWidths] = useState<Record<string, number>>(
    {},
    'manualMinWidths'
  );
  const [minWidthDraft, setMinWidthDraft] = React.useState<string>('');
  const [isEditingMinWidth, setIsEditingMinWidth] = React.useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const activeTierWindows = tier === 'user' ? USER_PRESET_WINDOWS : DEV_PRESET_WINDOWS;
  const currentIndex = Math.max(
    0,
    activeTierWindows.findIndex((w) => w.id === selectedWindowId)
  );
  const currentPreset = activeTierWindows[currentIndex] || activeTierWindows[0];

  const activeWindowInstance = windows.find(
    (w) => w.id === currentPreset?.id || (currentPreset && w.id.startsWith(currentPreset.id))
  );
  const resolvedAutoMinW = Math.round(
    activeWindowInstance?.autoMinWidth ?? currentPreset?.minWidth ?? 340
  );
  const resolvedScrollbarReserve = Math.round(
    activeWindowInstance?.scrollbarReservePx ?? (currentPreset?.resizable ? 16 : 0)
  );
  const activeManualMinW =
    currentPreset && typeof manualMinWidths[currentPreset.id] === 'number'
      ? Math.round(manualMinWidths[currentPreset.id])
      : activeWindowInstance?.manualMinWidth;
  const resolvedEffectiveMinW = Math.round(activeManualMinW ?? resolvedAutoMinW);

  useEffect(() => {
    if (!isEditingMinWidth) {
      setMinWidthDraft(String(resolvedEffectiveMinW));
    }
  }, [resolvedEffectiveMinW, isEditingMinWidth, currentPreset?.id]);

  // 2) Continuously synchronize active floating window state to URL address bar
  useEffect(() => {
    updateUrlParams({
      tier,
      fw: currentPreset?.id || null,
      fwTab: currentPreset?.tabs && currentPreset.tabs.length > 0 ? activeSubTab || currentPreset.tabs[0].id : null,
      fwMode,
    });
  }, [tier, currentPreset, activeSubTab, fwMode]);

  // 3) In 'inspector' mode, automatically keep the currently selected preset window open in the isolated 6D canvas stage
  useEffect(() => {
    if (fwMode !== 'inspector' || !currentPreset) return;
    const savedManualMinW =
      typeof manualMinWidths[currentPreset.id] === 'number'
        ? Math.round(manualMinWidths[currentPreset.id])
        : undefined;
    floatingSandboxStore.clearAll();
    floatingSandboxStore.spawnWindow({
      id: currentPreset.id,
      title: currentPreset.title,
      subtitle: currentPreset.summary,
      category: currentPreset.category,
      width:
        savedManualMinW !== undefined
          ? Math.max(savedManualMinW, currentPreset.width)
          : currentPreset.width,
      height: currentPreset.height,
      minWidth: currentPreset.minWidth,
      manualMinWidth: savedManualMinW,
      minHeight: currentPreset.minHeight,
      maxWidth: currentPreset.maxWidth,
      maxHeight: currentPreset.maxHeight,
      autoFitHeight: currentPreset.autoFitHeight,
      resizable: currentPreset.resizable,
      singleton: true,
      startMinimized: false,
    });
  }, [fwMode, currentPreset?.id]);

  const applyManualMinWidth = (nextRawPx: number) => {
    if (!currentPreset) return;
    // Strictly enforce standard 1px integer unit (never fractional 0.1px)
    const clampedPx = Math.max(240, Math.min(960, Math.round(nextRawPx)));
    setManualMinWidths((prev) => ({
      ...(prev && typeof prev === 'object' ? prev : {}),
      [currentPreset.id]: clampedPx,
    }));
    setMinWidthDraft(String(clampedPx));
    updateMinWidth(currentPreset.id, clampedPx);
    updateSize(
      currentPreset.id,
      {
        width: clampedPx,
        height: activeWindowInstance?.height ?? currentPreset.height,
      },
      true
    );
  };

  const handleResetAutoMinWidth = () => {
    if (!currentPreset) return;
    setManualMinWidths((prev) => {
      const next = { ...(prev && typeof prev === 'object' ? prev : {}) };
      delete next[currentPreset.id];
      return next;
    });
    updateMinWidth(currentPreset.id, undefined);
    updateSize(
      currentPreset.id,
      {
        width: Math.max(resolvedAutoMinW, currentPreset.width),
        height: currentPreset.height,
      },
      false
    );
    quickNotification.info(
      `Reset ${currentPreset.title} minWidth to Auto-Detected ${resolvedAutoMinW}px (incl. ${resolvedScrollbarReserve}px scrollbar reserve).`
    );
  };

  const handleSnapToMinWidth = (withVerticalScrollbar: boolean) => {
    if (!currentPreset) return;
    const targetH = withVerticalScrollbar
      ? Math.round(currentPreset.minHeight ?? 240)
      : Math.round(currentPreset.height);
    updateSize(
      currentPreset.id,
      {
        width: resolvedEffectiveMinW,
        height: targetH,
      },
      withVerticalScrollbar
    );
  };

  const handleCopyCalibratedParams = () => {
    if (!currentPreset) return;
    const payload = {
      id: currentPreset.id,
      title: currentPreset.title,
      minWidth: resolvedEffectiveMinW,
      autoMinWidth: resolvedAutoMinW,
      scrollbarReservePx: resolvedScrollbarReserve,
      mode: activeManualMinW !== undefined ? 'manual-calibrated' : 'auto-detected',
      defaultWidth: Math.max(resolvedEffectiveMinW, currentPreset.width),
      defaultHeight: currentPreset.height,
      minHeight: currentPreset.minHeight ?? 220,
      ...(Object.keys(manualMinWidths || {}).length > 0
        ? { allManualMinWidths: manualMinWidths }
        : {}),
    };
    const jsonText = JSON.stringify(payload, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonText).catch(() => {});
    }
    quickNotification.success(
      `Copied calibrated params for ${currentPreset.title}: minWidth=${resolvedEffectiveMinW}px (Auto=${resolvedAutoMinW}px, Scrollbar=${resolvedScrollbarReserve}px).`
    );
  };

  const handleSwitchTier = (nextTier: FloatingWindowVisibilityTier) => {
    setTier(nextTier);
    const list = nextTier === 'user' ? USER_PRESET_WINDOWS : DEV_PRESET_WINDOWS;
    const first = list[0];
    if (first) {
      setSelectedWindowId(first.id);
      setActiveSubTab(first.tabs?.[0]?.id || '');
    }
  };

  const handleSelectPreset = (preset: PresetConfig) => {
    setSelectedWindowId(preset.id);
    setActiveSubTab(preset.tabs?.[0]?.id || '');
    if (fwMode === 'stack') {
      const savedManualMinW =
        typeof manualMinWidths[preset.id] === 'number'
          ? Math.round(manualMinWidths[preset.id])
          : undefined;
      floatingSandboxStore.spawnWindow({
        id: preset.id,
        title: preset.title,
        subtitle: preset.summary,
        category: preset.category,
        width:
          savedManualMinW !== undefined
            ? Math.max(savedManualMinW, preset.width)
            : preset.width,
        height: preset.height,
        minWidth: preset.minWidth,
        manualMinWidth: savedManualMinW,
        minHeight: preset.minHeight,
        maxWidth: preset.maxWidth,
        maxHeight: preset.maxHeight,
        autoFitHeight: preset.autoFitHeight,
        resizable: preset.resizable,
        singleton: preset.singleton,
        startMinimized: false,
      });
    }
  };

  const handleStepWindow = (delta: number) => {
    const nextIdx = (currentIndex + delta + activeTierWindows.length) % activeTierWindows.length;
    const nextPreset = activeTierWindows[nextIdx];
    if (nextPreset) {
      handleSelectPreset(nextPreset);
    }
  };

  const handleAddPresetToStack = (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canvasRef.current) return;
    spawnWithFlight(preset, e.currentTarget, canvasRef.current);
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <AppWindow className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              6D · Floating Window 悬浮窗口全集 (6 User + 19 Developer)
            </h1>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              严格分离 <strong>User Only (6 个普通玩家悬浮窗)</strong> 与 <strong>Developer Only (19 个开发者调参器/实验室)</strong>。支持单窗快速扫描与多窗 Stack 堆叠编排，路径实时同步至地址栏。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Inspector vs Multi-Window Stack Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setFwMode('inspector')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                fwMode === 'inspector'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Direct Inspector (逐个检视)</span>
            </button>
            <button
              type="button"
              onClick={() => setFwMode('stack')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                fwMode === 'stack'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Multi-Window Stack (多窗编排)</span>
            </button>
          </div>

          {totalCount > 0 && (
            <Button
              variant="danger"
              size="sm"
              isLight={isLight}
              icon={<X className="h-4 w-4" />}
              onClick={clearAll}
            >
              清空窗口 ({totalCount})
            </Button>
          )}
        </div>
      </div>

      {/* Strict User vs Developer Control Bar + < Prev Window | Next Window > Scanner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          {/* Strict Tier Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              视图隔离 (Strict Tier):
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100/80 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => handleSwitchTier('user')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  tier === 'user'
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>User Only ({USER_PRESET_WINDOWS.length} Windows)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTier('developer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  tier === 'developer'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Developer Only ({DEV_PRESET_WINDOWS.length} Windows)</span>
              </button>
            </div>
          </div>

          {/* Linear Prev / Next Window Scanner */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleStepWindow(-1)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
              }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev Window</span>
            </button>

            <div
              className={`px-3 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-2 ${
                isLight
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-200'
              }`}
            >
              <span className="font-bold text-amber-500">
                [{currentIndex + 1} / {activeTierWindows.length}]
              </span>
              <span className="font-semibold truncate max-w-[240px]">
                {currentPreset?.title}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStepWindow(1)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
              }`}
            >
              <span>Next Window</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Window Pill Grid for Active Tier */}
        <div className="flex flex-wrap items-center gap-1.5">
          {activeTierWindows.map((preset, idx) => {
            const isSelected = preset.id === currentPreset?.id;
            const isOpen = windows.some((w) => w.id === preset.id || w.id.startsWith(preset.id));
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                <span className="font-mono text-[10px] opacity-70">{idx + 1}.</span>
                <FloatingWindowIcon
                  id={preset.id}
                  category={preset.category}
                  className="h-3.5 w-3.5 shrink-0"
                />
                <span>{preset.title}</span>
                {isOpen && !isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Currently Open" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Window Metadata & Sub-Tab Selector + Global Opacity Slider */}
        {currentPreset && (
          <div
            className={`p-3 rounded-xl border flex flex-col gap-3 text-xs ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={tier === 'user' ? 'success' : 'warning'} size="sm" isLight={isLight}>
                    {tier === 'user' ? 'USER VISIBLE' : 'DEVELOPER ONLY'}
                  </Badge>
                  <span className="font-bold text-sm">{currentPreset.title}</span>
                  <span className="font-mono text-[11px] opacity-65">
                    (Default {currentPreset.width}×{currentPreset.height}px · Effective MinW {resolvedEffectiveMinW}px [Auto {resolvedAutoMinW}px
                    {resolvedScrollbarReserve > 0 ? `, incl. ${resolvedScrollbarReserve}px scrollbar reserve` : ''}] ·{' '}
                    {currentPreset.resizable
                      ? 'Auto Intrinsic MaxHeight & 4-Corner Clamped'
                      : 'Auto-Fit Non-Resizable'})
                  </span>
                </div>
                {currentPreset.summary && (
                  <span className="text-[11px] opacity-75">{currentPreset.summary}</span>
                )}
                {currentPreset.menuEntryPath && (
                  <span className="text-[10px] font-mono text-amber-500">
                    触发路径: {currentPreset.menuEntryPath}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Container Bounds / Multi-Monitor Squeeze Simulator */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono opacity-65 mr-1">容器边界/跨屏挤压测试:</span>
                  {(
                    [
                      { id: 'full', label: '1440p Full (100%×700px)' },
                      { id: '1080p-compact', label: '1080p Compact (760×520px)' },
                      { id: 'small-squeeze', label: 'Tight Squeeze (520×380px)' },
                    ] as const
                  ).map((mode) => {
                    const active = containerPreset === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setContainerPreset(mode.id)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
                          active
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                            : isLight
                            ? 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                {currentPreset.tabs && currentPreset.tabs.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono opacity-65 mr-1">内部子页签:</span>
                    {currentPreset.tabs.map((t) => {
                      const active = (activeSubTab || currentPreset.tabs![0].id) === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveSubTab(t.id)}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
                            active
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                              : isLight
                              ? 'bg-white border-neutral-200 text-neutral-600'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="w-48">
                  <SliderControl
                    label="Global Opacity"
                    value={opacity}
                    min={1}
                    max={100}
                    step={1}
                    defaultValue={85}
                    unit="%"
                    onChange={setOpacity}
                    isLight={isLight}
                  />
                </div>
              </div>
            </div>

            {/* MinWidth Auto-Detection & Standard 1px Manual Calibration Bar */}
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
                    当前窗口尺寸: {Math.round(activeWindowInstance.width ?? 0)}×{Math.round(activeWindowInstance.height ?? 0)}px
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
          </div>
        )}
      </div>

      {/* Active Canvas Stage: Floating windows and Stack Icon run strictly inside this container */}
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
        code={`import { FloatingWindowManager } from '@/navigation';
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
    </div>
  );
};
