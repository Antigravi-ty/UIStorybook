import React, { useRef, useEffect } from 'react';
import { quickNotification } from '../../tokens/quickNotificationStore';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { readUrlParams, updateUrlParams } from '../stores/urlSync';
import { AppWindow, X, ChevronLeft, ChevronRight, User, Terminal, Eye, Layers, } from 'lucide-react';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { floatingSandboxStore, useFloatingStore } from '../../tokens/floatingStore';
import {
  USER_PRESET_WINDOWS, DEV_PRESET_WINDOWS, PRESET_WINDOWS, type PresetConfig,
  type FloatingWindowVisibilityTier,
} from '../../tokens/floatingPresets';
import { FloatingWindowIcon } from '../../navigation/FloatingWindowIcon';
import {
  FloatingWindowsMinWidthCalibrationBar, FloatingWindowsCanvasStage,
} from './floating-window-variation/FloatingWindowsCanvasStage';

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
      { width: clampedPx, height: activeWindowInstance?.height ?? currentPreset.height },
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
      { width: Math.max(resolvedAutoMinW, currentPreset.width), height: currentPreset.height },
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
      { width: resolvedEffectiveMinW, height: targetH },
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
            <h1 className="text-2xl font-bold tracking-tight">6D · Floating Window 悬浮窗口全集 (6 User + 19 Developer)</h1>
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
            <Button variant="danger" size="sm" isLight={isLight} icon={<X className="h-4 w-4" />}
              onClick={clearAll} > 清空窗口 ({totalCount}) </Button> )} </div> </div>
              {/* Strict User vs Developer Control Bar + < Prev Window | Next Window > Scanner */} <div
              className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-colors ${
              isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800' }`} >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
              {/* Strict Tier Toggle */} <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400"> 视图隔离 (Strict Tier):
              </span>
              <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100/80 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
              <button type="button" onClick={() => handleSwitchTier('user')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              tier === 'user' ? 'bg-emerald-500 text-white shadow-2xs' : isLight
              ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-neutral-200' }`} >
              <User className="h-3.5 w-3.5" /> <span>User Only ({USER_PRESET_WINDOWS.length} Windows)</span>
              </button> <button type="button" onClick={() => handleSwitchTier('developer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              tier === 'developer' ? 'bg-amber-500 text-white shadow-2xs' : isLight
              ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-neutral-200' }`} >
              <Terminal className="h-3.5 w-3.5" />
              <span>Developer Only ({DEV_PRESET_WINDOWS.length} Windows)</span> </button> </div> </div>
              {/* Linear Prev / Next Window Scanner */} <div className="flex items-center gap-2 flex-wrap"> <button
              type="button" onClick={() => handleStepWindow(-1)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
              isLight ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
              : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100' }`} >
              <ChevronLeft className="h-3.5 w-3.5" /> <span>Prev Window</span> </button> <div
              className={`px-3 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-2 ${ isLight
              ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
              : 'bg-neutral-950 border-neutral-800 text-neutral-200' }`} >
              <span className="font-bold text-amber-500"> [{currentIndex + 1} / {activeTierWindows.length}] </span>
              <span className="font-semibold truncate max-w-[240px]"> {currentPreset?.title} </span> </div> <button
              type="button" onClick={() => handleStepWindow(1)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
              isLight ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
              : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100' }`} >
              <span>Next Window</span> <ChevronRight className="h-3.5 w-3.5" /> </button> </div> </div>
              {/* Window Pill Grid for Active Tier */} <div className="flex flex-wrap items-center gap-1.5">
              {activeTierWindows.map((preset, idx) => { const isSelected = preset.id === currentPreset?.id;
              const isOpen = windows.some((w) => w.id === preset.id || w.id.startsWith(preset.id)); return (
              <button key={preset.id} type="button" onClick={() => handleSelectPreset(preset)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              isSelected ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs' : isLight
              ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
              : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200' }`} >
              <span className="font-mono text-[10px] opacity-70">{idx + 1}.</span> <FloatingWindowIcon
              id={preset.id} category={preset.category} className="h-3.5 w-3.5 shrink-0" />
              <span>{preset.title}</span> {isOpen && !isSelected && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Currently Open" /> )} </button> );
              })} </div> {/* Selected Window Metadata & Sub-Tab Selector + Global Opacity Slider */}
              {currentPreset && ( <div className={`p-3 rounded-xl border flex flex-col gap-3 text-xs ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`} >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-col gap-1"> <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={tier === 'user' ? 'success' : 'warning'} size="sm" isLight={isLight}>
              {tier === 'user' ? 'USER VISIBLE' : 'DEVELOPER ONLY'} </Badge>
              <span className="font-bold text-sm">{currentPreset.title}</span>
              <span className="font-mono text-[11px] opacity-65">
              (Default {currentPreset.width}×{currentPreset.height}px · Effective MinW {resolvedEffectiveMinW}px [Auto {resolvedAutoMinW}px
              {resolvedScrollbarReserve > 0 ? `, incl. ${resolvedScrollbarReserve}px scrollbar reserve` : ''}] ·{' '}
              {currentPreset.resizable ? 'Auto Intrinsic MaxHeight & 4-Corner Clamped' : 'Auto-Fit Non-Resizable'})
              </span> </div> {currentPreset.summary && (
              <span className="text-[11px] opacity-75">{currentPreset.summary}</span> )}
              {currentPreset.menuEntryPath && ( <span className="text-[10px] font-mono text-amber-500">
              触发路径: {currentPreset.menuEntryPath} </span> )} </div>
              <div className="flex items-center gap-3 flex-wrap">
              {/* Container Bounds / Multi-Monitor Squeeze Simulator */} <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono opacity-65 mr-1">容器边界/跨屏挤压测试:</span> {( [
              { id: 'full', label: '1440p Full (100%×700px)' },
              { id: '1080p-compact', label: '1080p Compact (760×520px)' },
              { id: 'small-squeeze', label: 'Tight Squeeze (520×380px)' }, ] as const ).map((mode) => {
              const active = containerPreset === mode.id; return ( <button key={mode.id} type="button"
              onClick={() => setContainerPreset(mode.id)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
              active ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : isLight
              ? 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200' }`} > {mode.label}
              </button> ); })} </div> {currentPreset.tabs && currentPreset.tabs.length > 0 && (
              <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono opacity-65 mr-1">内部子页签:</span>
              {currentPreset.tabs.map((t) => { const active = (activeSubTab || currentPreset.tabs![0].id) === t.id;
              return ( <button key={t.id} type="button" onClick={() => setActiveSubTab(t.id)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
              active ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' : isLight
              ? 'bg-white border-neutral-200 text-neutral-600'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400' }`} > {t.label} </button> ); })} </div> )}
              <div className="w-48">
              <SliderControl label="Global Opacity" value={opacity} min={1} max={100} step={1}
              defaultValue={85} unit="%" onChange={setOpacity} isLight={isLight} /> </div> </div> </div>
              <FloatingWindowsMinWidthCalibrationBar isLight={isLight} currentPreset={currentPreset}
              activeManualMinW={activeManualMinW} resolvedAutoMinW={resolvedAutoMinW}
              resolvedEffectiveMinW={resolvedEffectiveMinW} resolvedScrollbarReserve={resolvedScrollbarReserve}
              activeWindowInstance={activeWindowInstance} minWidthDraft={minWidthDraft}
              setMinWidthDraft={setMinWidthDraft} setIsEditingMinWidth={setIsEditingMinWidth}
              applyManualMinWidth={applyManualMinWidth} handleSnapToMinWidth={handleSnapToMinWidth}
              handleResetAutoMinWidth={handleResetAutoMinWidth}
              handleCopyCalibratedParams={handleCopyCalibratedParams} />
          </div>
        )}
      </div>

      {/* Active Canvas Stage: Floating windows and Stack Icon run strictly inside this container */}
      <FloatingWindowsCanvasStage
        isLight={isLight}
        canvasRef={canvasRef}
        containerPreset={containerPreset}
        opacity={opacity}
        totalCount={totalCount}
        minimizedCount={minimizedCount}
        currentPreset={currentPreset}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        fwMode={fwMode}
        tier={tier}
        activeTierWindows={activeTierWindows}
        windows={windows}
        closeWindow={closeWindow}
        handleAddPresetToStack={handleAddPresetToStack}
      />
    </div>
  );
};
