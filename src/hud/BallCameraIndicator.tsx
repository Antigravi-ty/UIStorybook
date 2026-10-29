import React, { memo, forwardRef, useRef, useEffect, useImperativeHandle, useCallback } from 'react';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { BallCamTransientListener } from './types';

export interface BallCameraIndicatorHandle {
  /** Imperatively toggle or set BallCam active state with zero React re-render */
  setActive: (active: boolean) => void;
}

export interface BallCameraIndicatorProps {
  /** 是否启用球视角 (Ball Cam Active) */
  active?: boolean;
  /** 可选瞬态订阅通道（传入后即使切换开关也直接修改 DOM Ref，0 React VDOM 重绘） */
  subscribeBallCam?: (listener: BallCamTransientListener) => () => void;
  /** 快捷键提示，默认 'SPACE' */
  shortcut?: string | null;
  /** 主标题文字，默认 'BALL CAM' */
  label?: string;
  /** 底部动作提示文字，默认 'TO TOGGLE' */
  actionText?: string;
  /** 主题样式：明亮/暗黑 */
  isLight?: boolean;
  /** 点击切换回调 */
  onToggle?: () => void;
  /** 附加 className */
  className?: string;
}

/**
 * BallCameraIndicator
 * 纯正 Rocket League 风格的球视角 HUD 指示器（支持 Transient Ref 零重绘与 Props 双模驱动）：
 * 1. 整体容器左右结构：左侧为跨越两行高度的动态大红标，右侧为文本块。
 * 2. 右侧文本块上下分两半并严格左对齐：
 *    - 上半：较大字体的 BALL CAM 状态标题。
 *    - 下半：PRESS [KEY] TO TOGGLE 操作指引。
 * 3. 即使作为低频组件，同样支持通过 `subscribeBallCam` 或 `ref.setActive()` 直接操作 DOM 节点类名，实现 0 React 重绘。
 */
export const BallCameraIndicator = memo(
  forwardRef<BallCameraIndicatorHandle, BallCameraIndicatorProps>(
    (
      {
        active = true,
        subscribeBallCam,
        shortcut = 'SPACE',
        label = 'BALL CAM',
        actionText = 'TO TOGGLE',
        isLight = false,
        onToggle,
        className = '',
      },
      ref
    ) => {
      const shellRef = useRef<HTMLDivElement | null>(null);
      const dotRef = useRef<HTMLDivElement | null>(null);
      const pingRef = useRef<HTMLDivElement | null>(null);
      const titleRef = useRef<HTMLSpanElement | null>(null);
      const subRowRef = useRef<HTMLDivElement | null>(null);
      const fallbackTextRef = useRef<HTMLSpanElement | null>(null);

      const getShellClass = useCallback(
        (isActive: boolean) =>
          `flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-150 ${
            isLight
              ? isActive
                ? 'bg-white/96 border-neutral-300 text-neutral-900 shadow-md'
                : 'bg-white/85 border-neutral-200 text-neutral-400 shadow-xs opacity-65'
              : isActive
              ? 'bg-neutral-950/95 border-neutral-800 text-white shadow-md'
              : 'bg-neutral-900/80 border-neutral-800/60 text-neutral-500 shadow-none opacity-55'
          }`,
        [isLight]
      );

      const getDotClass = useCallback(
        (isActive: boolean) =>
          `w-5 h-5 rounded-full transition-all duration-150 ${
            isActive
              ? 'bg-red-500 ring-2 ring-red-500/35'
              : isLight
              ? 'bg-neutral-300'
              : 'bg-neutral-700'
          }`,
        [isLight]
      );

      const getTitleClass = useCallback(
        (isActive: boolean) =>
          `text-sm font-black tracking-wider font-mono uppercase transition-colors ${
            isActive
              ? isLight
                ? 'text-neutral-900'
                : 'text-white'
              : isLight
              ? 'text-neutral-500'
              : 'text-neutral-400'
          }`,
        [isLight]
      );

      const applyActiveToDom = useCallback(
        (isActive: boolean) => {
          if (shellRef.current) {
            shellRef.current.className = getShellClass(isActive);
          }
          if (dotRef.current) {
            dotRef.current.className = getDotClass(isActive);
          }
          if (pingRef.current) {
            pingRef.current.style.display = isActive ? 'block' : 'none';
          }
          if (titleRef.current) {
            titleRef.current.className = getTitleClass(isActive);
          }
          if (subRowRef.current) {
            subRowRef.current.style.opacity = isActive ? '0.85' : '0.5';
          }
          if (fallbackTextRef.current) {
            fallbackTextRef.current.style.opacity = isActive ? '0.7' : '0.4';
            fallbackTextRef.current.textContent = isActive
              ? 'CAMERA LOCKED ON BALL'
              : 'FREE COCKPIT VIEW';
          }
        },
        [getShellClass, getDotClass, getTitleClass]
      );

      useImperativeHandle(
        ref,
        () => ({
          setActive: applyActiveToDom,
        }),
        [applyActiveToDom]
      );

      useEffect(() => {
        applyActiveToDom(active);
      }, [active, applyActiveToDom]);

      useEffect(() => {
        if (!subscribeBallCam) return;
        return subscribeBallCam(applyActiveToDom);
      }, [subscribeBallCam, applyActiveToDom]);

      return (
        <div
          data-ui-element="hud-ball-camera-indicator"
          onClick={onToggle}
          className={`select-none pointer-events-auto transition-all cursor-pointer group active:scale-95 inline-flex ${className}`}
          title="点击或按键切换球视角 (Toggle Ball Camera)"
        >
          <div ref={shellRef} className={getShellClass(active)}>
            {/* 左侧：跨越两行高度的动态发光大红标 */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div ref={dotRef} className={getDotClass(active)} />
              <div
                ref={pingRef}
                style={{ display: active ? 'block' : 'none' }}
                className="absolute w-7 h-7 rounded-full bg-red-500/25 animate-ping pointer-events-none"
              />
            </div>

            {/* 右侧：上下两半结构，严格左对齐 */}
            <div className="flex flex-col items-start text-left leading-tight">
              {/* 上半：较大字体的 BALL CAM */}
              <span ref={titleRef} className={getTitleClass(active)}>
                {label}
              </span>

              {/* 下半：PRESS [KEY] TO TOGGLE，左对齐 */}
              {shortcut ? (
                <div
                  ref={subRowRef}
                  style={{ opacity: active ? 0.85 : 0.5 }}
                  className={`flex items-center gap-1.5 text-[10px] font-mono tracking-tight mt-0.5 transition-opacity ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}
                >
                  <span>PRESS</span>
                  <KeycapBadge shortcut={shortcut} size="sm" isLight={isLight} />
                  <span>{actionText}</span>
                </div>
              ) : (
                <span
                  ref={fallbackTextRef}
                  style={{ opacity: active ? 0.7 : 0.4 }}
                  className="text-[10px] font-mono tracking-tight mt-0.5 transition-opacity text-neutral-500"
                >
                  {active ? 'CAMERA LOCKED ON BALL' : 'FREE COCKPIT VIEW'}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
  )
);

BallCameraIndicator.displayName = 'BallCameraIndicator';
