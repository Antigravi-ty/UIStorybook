import React, { useState, useRef, useEffect } from 'react';
import { useViewportStore, viewportStore } from '../viewport';
import { Sliders, Shield, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Badge } from '../primitives/Badge';

export interface ViewportControlsProps {
  isLight?: boolean;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({ isLight = true }) => {
  const { renderScale, safeAreaMargin, showSafeAreaHud, metrics } = useViewportStore();
  const [showMarginPopover, setShowMarginPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close margin popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowMarginPopover(false);
      }
    };
    if (showMarginPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMarginPopover]);

  const presetMargins = [-5, -2.5, 0, 2.5, 5, 7.5, 10];

  return (
    <div className="flex items-center gap-3">
      {/* 1. UI Scaling Slider Control */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${
          isLight
            ? 'bg-neutral-50/90 border-neutral-200 shadow-2xs'
            : 'bg-neutral-900/80 border-neutral-800'
        }`}
      >
        <Sliders className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`} />
        <span className={`text-[11px] font-mono shrink-0 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Scaling
        </span>
        <input
          type="range"
          min={50}
          max={200}
          step={5}
          value={renderScale}
          onChange={(e) => viewportStore.setRenderScale(Number(e.target.value))}
          className="w-20 md:w-28 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-800 dark:accent-neutral-200"
          title={`当前 UI 缩放: ${renderScale}% (实际系数: ${(metrics.scaleFactor * 100).toFixed(0)}%)`}
        />
        <button
          type="button"
          onClick={() => viewportStore.setRenderScale(100)}
          className={`font-mono text-[11px] px-1.5 py-0.5 rounded transition-colors cursor-pointer font-bold ${
            isLight
              ? 'bg-neutral-200/70 hover:bg-neutral-300/80 text-neutral-800'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
          }`}
          title="点击重置为 100%"
        >
          {renderScale}%
        </button>
      </div>

      {/* 2. Safe Area Margin Button with Popover (-5% to +10%) */}
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setShowMarginPopover((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
            showMarginPopover
              ? isLight
                ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                : 'bg-amber-950/50 border-amber-600 text-amber-300'
              : isLight
              ? 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800 shadow-2xs'
              : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
          }`}
          title="调整屏幕安全区边缘 Safe Area Margin (-5% ~ +10%)"
        >
          <Shield className={`h-3.5 w-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <span>Safe Area:</span>
          <span className="font-mono font-bold text-amber-500">
            {safeAreaMargin > 0 ? `+${safeAreaMargin}` : safeAreaMargin}%
          </span>
        </button>

        {/* Dropdown Stepper Popover */}
        {showMarginPopover && (
          <div
            className={`absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl border shadow-xl z-50 flex flex-col gap-3 transition-colors ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-800'
                : 'bg-neutral-900 border-neutral-800 text-neutral-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-tight">Safe Area Margin</span>
              <Badge size="sm" variant="primary" isLight={isLight}>
                -5% ~ +10%
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min={-5}
                max={10}
                step={0.5}
                value={safeAreaMargin}
                onChange={(e) => viewportStore.setSafeAreaMargin(Number(e.target.value))}
                className="flex-1 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="font-mono text-xs font-bold text-emerald-500 w-9 text-right">
                {safeAreaMargin > 0 ? `+${safeAreaMargin}` : safeAreaMargin}%
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {presetMargins.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => viewportStore.setSafeAreaMargin(p)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer border ${
                    safeAreaMargin === p
                      ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                      : isLight
                      ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {p > 0 ? `+${p}` : p}%
                </button>
              ))}
            </div>

            <p className={`text-[10px] leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              基于宽度的百分比偏移，对标 RLCleanWASM 游戏全屏安全区算法。
            </p>
          </div>
        )}
      </div>

      {/* 3. Safe Area HUD Overlay Toggle */}
      <button
        type="button"
        onClick={() => viewportStore.setShowSafeAreaHud(!showSafeAreaHud)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
          showSafeAreaHud
            ? isLight
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
              : 'bg-emerald-950/50 border-emerald-600 text-emerald-300'
            : isLight
            ? 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700 shadow-2xs'
            : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
        }`}
        title="开启/关闭 Safe Area & 18:9 视口辅助线与遥测条"
      >
        {showSafeAreaHud ? (
          <Eye className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 text-neutral-400" />
        )}
        <span className="hidden sm:inline">HUD</span>
      </button>
    </div>
  );
};
