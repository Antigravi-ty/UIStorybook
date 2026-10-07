import React, { useEffect, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { UI_RADIUS, type ContainerTransitionMode, type FluidMorphConfig, type SequencedStepConfig } from '../tokens';
import { MorphContainer, type TransitionPhase } from './transitions';

export interface MorphingShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  width?: number; // target width in px
  currentKey?: string;
  children: React.ReactNode;
  isLight?: boolean;
  onBack?: () => void;
  isLayer1?: boolean;
  enableDiagnostics?: boolean;
  className?: string;
  transitionMode?: ContainerTransitionMode;
  onPhaseChange?: (phase: TransitionPhase) => void;
  // 背景阴影/遮罩过渡时长 (单位: ms，默认 250ms，渐变过渡)
  backdropDuration?: number;
  // 允许外部传入精细时间与动效配置
  fluidDuration?: number;
  stepFadeDuration?: number;
  stepResizeDuration?: number;
  fluidConfig?: FluidMorphConfig;
  stepConfig?: SequencedStepConfig;
}

/**
 * MorphingShell
 * 专注于弹窗模态层职责（Radix Headless Dialog + 遮罩层 + 焦点 + 视觉壳体）
 * 容器尺寸形变与内容切换完全复用统一 MorphContainer 引擎：
 * 1. FluidMorphTransition (Apple HIG 连续流体形变，无阻塞 wait)
 * 2. SequencedStepTransition (100ms淡出 -> 150ms尺寸变化 -> 100ms显现淡入)
 */
export const MorphingShell: React.FC<MorphingShellProps> = ({
  open,
  onOpenChange,
  width = 460,
  currentKey,
  children,
  isLight = false,
  onBack,
  isLayer1 = false,
  enableDiagnostics = false,
  className = '',
  transitionMode = 'fluid-morph',
  onPhaseChange,
  backdropDuration = 250,
  fluidDuration,
  stepFadeDuration,
  stepResizeDuration,
  fluidConfig,
  stepConfig,
}) => {
  const shellRef = useRef<HTMLDivElement>(null);

  // Layout Diagnostics logger
  useEffect(() => {
    if (!open || !enableDiagnostics) return;

    const timer = setTimeout(() => {
      if (!shellRef.current) return;
      const comp = window.getComputedStyle(shellRef.current);
      console.log('─────────────────────────────────────────────────────────────────');
      console.log('[UI Diagnostics] Morphing Shell Metrics:');
      console.log(`• Shell Box: width=${comp.width} (target=${width}px) height=${comp.height}`);
      console.log(`• Transition Mode: ${transitionMode}`);
      console.log(`• Mode: ${isLight ? 'Light' : 'Dark'} | Layer: ${isLayer1 ? 'Layer 1 (Root)' : 'Layer 2 (Sub)'}`);
      console.log('─────────────────────────────────────────────────────────────────');
    }, 150);

    return () => clearTimeout(timer);
  }, [open, width, isLight, isLayer1, enableDiagnostics, transitionMode]);

  const handleInteractOutside = () => {
    // 点击空白处/边缘遮罩时，直接退出菜单
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop Overlay: 一级根菜单透明无变暗无模糊；二级及更深菜单背景变暗无模糊，支持渐变过渡 (默认 250ms 允许自定义修改) */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 select-none backdrop-blur-none cursor-pointer"
          style={{
            backgroundColor: isLayer1 ? 'transparent' : 'rgba(0, 0, 0, 0.65)',
            transition: `background-color ${backdropDuration}ms cubic-bezier(0.2, 0.8, 0.25, 1)`,
          }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
              handleInteractOutside();
            }
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleInteractOutside();
            }
          }}
        >
          {/* 委托给统一 MorphContainer 执行弹窗尺寸形变与切换 */}
          <DialogPrimitive.Content
            asChild
            onPointerDownOutside={(e) => {
              e.preventDefault();
              handleInteractOutside();
            }}
            onInteractOutside={(e) => {
              e.preventDefault();
              handleInteractOutside();
            }}
          >
            <MorphContainer
              ref={shellRef}
              currentKey={currentKey || (isLayer1 ? 'layer1' : 'layer2')}
              width={width}
              mode={transitionMode}
              onPhaseChange={onPhaseChange}
              fluidDuration={fluidDuration}
              stepFadeDuration={stepFadeDuration}
              stepResizeDuration={stepResizeDuration}
              fluidConfig={fluidConfig}
              stepConfig={stepConfig}
              initialModal={!isLayer1}
              isLight={isLight}
              className={`${UI_RADIUS.xl} max-w-full max-h-[90vh] flex flex-col outline-none cursor-default ${
                isLight
                  ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
                  : 'shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
              } ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </MorphContainer>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
