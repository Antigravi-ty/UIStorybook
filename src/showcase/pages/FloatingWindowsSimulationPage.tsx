import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AppWindow, 
  Layers, 
  Plus, 
  X, 
  Activity, 
  Cpu, 
  Target, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';
import { useFloatingStore } from '../../tokens/floatingStore';
import { PRESET_WINDOWS, type PresetConfig } from '../../tokens/floatingPresets';
import { FloatingStackIcon } from '../../navigation/FloatingStackIcon';
import { FloatingWindowManager } from '../../navigation/FloatingWindowManager';

export interface FloatingWindowsSimulationPageProps {
  isLight?: boolean;
}

interface FlyingGhost {
  id: string;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  destX: number;
  destY: number;
}

export const FloatingWindowsSimulationPage: React.FC<FloatingWindowsSimulationPageProps> = ({
  isLight = false,
}) => {
  const {
    windows,
    minimizedCount,
    totalCount,
    spawnWindow,
    clearAll,
  } = useFloatingStore();

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Flying ghost container state for '+' click animation directly into top-right Stack Icon
  const [flyingGhost, setFlyingGhost] = useState<FlyingGhost | null>(null);

  // Handle clicking '+' on a preset item in bottom-left
  const handleAddPreset = (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canvasRef.current) return;
    const btnRect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const startX = Math.round(btnRect.left - canvasRect.left);
    const startY = Math.round(btnRect.top - canvasRect.top);
    const startW = Math.round(btnRect.width);
    const startH = Math.round(btnRect.height);

    const destX = Math.round(canvasRect.width - 56);
    const destY = 16;

    const ghostId = `${preset.id}-${Date.now()}`;
    setFlyingGhost({
      id: ghostId,
      startX,
      startY,
      startW,
      startH,
      destX,
      destY,
    });

    // After 280ms sequenced transition completes, register minimized window in store
    setTimeout(() => {
      spawnWindow({
        id: `${preset.id}-${Date.now().toString().slice(-4)}`,
        title: preset.title,
        category: preset.category,
        width: preset.width,
        height: preset.height,
        resizable: preset.resizable,
        startMinimized: true,
      });
      setFlyingGhost(null);
    }, 280);
  };

  const getPresetIcon = (category: string) => {
    if (category === 'Kernel') return <Cpu className="h-3.5 w-3.5 text-neutral-800 dark:text-neutral-200 shrink-0" />;
    if (category === 'Hitbox') return <Target className="h-3.5 w-3.5 text-neutral-800 dark:text-neutral-200 shrink-0" />;
    return <Activity className="h-3.5 w-3.5 text-neutral-800 dark:text-neutral-200 shrink-0" />;
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center">
            <AppWindow className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Floating Window 悬浮窗口系统</h1>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              解耦悬浮窗口系统。支持无延迟跟手拉伸、置顶抬升与最后位置尺寸记忆，通过时序变形收缩收纳至右上角 Stack。
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <Button
            variant="danger"
            size="sm"
            isLight={isLight}
            icon={<X className="h-4 w-4" />}
            onClick={clearAll}
          >
            清空所有窗口 ({totalCount})
          </Button>
        )}
      </div>

      {/* External Telemetry Status Bar (Placed outside canvas stage as requested) */}
      <div
        className={`px-4 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-colors ${
          isLight
            ? 'bg-neutral-50/80 border-neutral-200 text-neutral-700 shadow-2xs'
            : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Active Windows:</span>
            <strong className="text-neutral-900 dark:text-neutral-100 font-bold">{totalCount}</strong>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Minimized in Stack:</span>
            <strong className="text-neutral-900 dark:text-neutral-100 font-bold">{minimizedCount}</strong>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Stack Status:</span>
            <strong className={minimizedCount > 0 ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-neutral-500 font-normal'}>
              {minimizedCount > 0 ? 'LOCKED (Holds Items)' : 'DISMISSIBLE (0 items)'}
            </strong>
          </div>
        </div>

        <span className="text-[11px] text-neutral-400">
          点击左下角预设窗口的 <strong>+</strong> 按钮将窗口收缩飞入右上角 Stack
        </span>
      </div>

      {/* Active Canvas Stage: Floating windows and Stack Icon run strictly inside this container */}
      <div
        ref={canvasRef}
        className={`relative w-full min-h-[620px] rounded-2xl border p-6 overflow-hidden select-none transition-colors ${
          isLight 
            ? 'bg-neutral-100/70 border-neutral-200 shadow-inner' 
            : 'bg-neutral-950/80 border-neutral-800 shadow-inner'
        }`}
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#d4d4d8 1px, transparent 1px)'
            : 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Background Canvas Ambient Notice */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30 select-none">
          <span className="text-3xl mb-1">🎮</span>
          <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
            [Active Canvas: Safe Area Clamped & Focus Elevation]
          </span>
          <span className="text-[11px] text-neutral-400 max-w-sm text-center mt-1">
            窗口活动限定在当前画布区域内，支持自由拖动与右下角零迟滞拉伸。
          </span>
        </div>

        {/* 
          Spawning Ghost Container executing Sequenced Step Transition:
          Button rect -> flies & resizes 4 corners to top-right Stack Icon rect (40x40)
        */}
        <AnimatePresence>
          {flyingGhost && (
            <motion.div
              key={flyingGhost.id}
              initial={{
                x: flyingGhost.startX,
                y: flyingGhost.startY,
                width: flyingGhost.startW,
                height: flyingGhost.startH,
                borderRadius: 8,
                opacity: 0.9,
              }}
              animate={{
                x: flyingGhost.destX,
                y: flyingGhost.destY,
                width: 40,
                height: 40,
                borderRadius: 12,
                opacity: 0,
              }}
              transition={{
                duration: 0.28,
                ease: [0.2, 0.8, 0.25, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              className={`z-50 pointer-events-none border backdrop-blur-md ${
                isLight
                  ? 'bg-neutral-900 border-neutral-800 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_0_16px_rgba(0,0,0,0.2)]'
                  : 'bg-neutral-100 border-neutral-300 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_16px_rgba(255,255,255,0.1)]'
              }`}
            />
          )}
        </AnimatePresence>

        {/* Floating Stack Icon positioned strictly in top-right of active canvas */}
        <FloatingStackIcon isLight={isLight} absolute={true} containerRef={canvasRef} />

        {/* Floating Windows Manager positioned strictly inside active canvas */}
        <FloatingWindowManager isLight={isLight} containerRef={canvasRef} />

        {/* 
          Preset Windows Dock in Bottom-Left Area:
          - 4 variations: short, short (resizable), long, long (resizable)
          - Neutral monochrome palette
          - Equal-width 4-sided shadow
          - '+' button to launch sequenced transition into stack
        */}
        <div
          className={`absolute bottom-4 left-4 z-30 max-w-[340px] w-full p-3 rounded-2xl border backdrop-blur-md select-none transition-colors ${
            isLight
              ? 'bg-white/95 border-neutral-300 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_0_16px_rgba(0,0,0,0.12)]'
              : 'bg-neutral-900/95 border-neutral-700 text-neutral-100 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_0_20px_rgba(0,0,0,0.7),0_0_28px_rgba(255,255,255,0.06)]'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 dark:border-neutral-800 mb-2">
            <span className="text-xs font-bold tracking-tight">PRESET WINDOWS</span>
            <span className="text-[10px] font-mono text-neutral-400">Enqueues to Stack</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {PRESET_WINDOWS.map((preset) => (
              <div
                key={preset.id}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
                  isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                    : 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getPresetIcon(preset.category)}
                  <span className="font-medium truncate text-xs" title={preset.title}>
                    {preset.title}
                  </span>
                  {preset.resizable ? (
                    <span className="px-1 py-0.5 rounded text-[9px] font-mono shrink-0 border border-neutral-400/40 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400">
                      Resize
                    </span>
                  ) : (
                    <span className="px-1 py-0.5 rounded text-[9px] font-mono shrink-0 opacity-40 text-neutral-500">
                      Fixed
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleAddPreset(preset, e)}
                  title={`Enqueue ${preset.title} into top-right Stack`}
                  className={`h-6 w-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 shrink-0 ${
                    isLight
                      ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-white'
                      : 'bg-neutral-100 hover:bg-white border-neutral-200 text-neutral-950 font-bold'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Specification Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div
          className={`p-4 rounded-xl border ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
          }`}
        >
          <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
            纯中性黑白色调规范与四周等宽阴影
          </span>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            Stack Icon 与计数气泡均采用 0 饱和度的纯黑白配色；全局阴影消除上下偏移，统一采用四周等宽居中多层扩散阴影。
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
          }`}
        >
          <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
            左侧避障留白与圆角矩形淡入红叉
          </span>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            托盘左侧预留足够位移缓冲区，彻底解决文字左偏截断 Bug。独立红叉为圆角矩形、纯淡入动效，且仅在当前行 Hover 时显现。
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
          }`}
        >
          <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
            完全跟手零迟滞 Resize 与纯最小化控制
          </span>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            拖拽拉伸过程禁用任何过渡补间动画，实现绝对指针跟手。抬头移除 F10 标识与关闭叉，关闭操作严格统一在 Stack 中执行。
          </p>
        </div>
      </div>

      {/* Code Snippet for Floating Window */}
      <CodeBlock
        isLight={isLight}
        title="Floating Window 解耦使用规范 (Floating Window Recipe)"
        code={`import { useFloatingStore, FloatingStackIcon, FloatingWindowManager } from '@/navigation';

const { spawnWindow, minimizeWindow, restoreWindow, bringToFront } = useFloatingStore();

// 1. 生成新遥测窗口并收纳至 Stack (支持四个角时序过渡动画与零迟滞跟手缩放)
spawnWindow({
  id: 'preset-telemetry',
  title: 'Diagnostic Telemetry & Real-Time Engine Spectrogram Stream',
  category: 'Diagnostic',
  width: 480,
  height: 280,
  resizable: true,
  startMinimized: true,
});`}
      />
    </div>
  );
};
