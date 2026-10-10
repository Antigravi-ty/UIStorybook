import React from 'react';
import { KeycapBadge } from '../primitives/KeycapBadge';

export interface BallCameraIndicatorProps {
  /** 是否启用球视角 (Ball Cam Active) */
  active?: boolean;
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
 * 纯正 Rocket League 风格的球视角 HUD 指示器：
 * - 左侧：红点指示灯 (Active 时呈现高亮深红光晕，Inactive 时暗化中性灰)
 * - 右侧：BALL CAM 主状态标题
 * - 下方：PRESS [KEY] TO TOGGLE 操作指引
 * 采用 UIStorybook 统一的毛玻璃半透明容器与 KeycapBadge 键位设计语言。
 */
export const BallCameraIndicator: React.FC<BallCameraIndicatorProps> = ({
  active = true,
  shortcut = 'SPACE',
  label = 'BALL CAM',
  actionText = 'TO TOGGLE',
  isLight = false,
  onToggle,
  className = '',
}) => {
  return (
    <div
      data-ui-element="hud-ball-camera-indicator"
      onClick={onToggle}
      className={`select-none transition-all flex flex-col items-center gap-1 cursor-pointer group active:scale-95 ${className}`}
      title="点击或按键切换球视角 (Toggle Ball Camera)"
    >
      <div
        className={`px-3.5 py-2 rounded-2xl border transition-all duration-150 flex flex-col items-center gap-1 shadow-lg ${
          isLight
            ? active
              ? 'bg-white/95 border-neutral-300/90 text-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
              : 'bg-white/70 border-neutral-200 text-neutral-500 shadow-sm opacity-60'
            : active
            ? 'bg-neutral-950/90 border-neutral-800 text-white shadow-[0_4px_25px_rgba(0,0,0,0.7)]'
            : 'bg-neutral-900/60 border-neutral-800/60 text-neutral-400 shadow-none opacity-50'
        } backdrop-blur-md`}
      >
        {/* 上半部分：红点 + BALL CAM 标题 */}
        <div className="flex items-center gap-2">
          {/* 左侧红点指示灯 */}
          <div className="relative flex items-center justify-center">
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all duration-150 ${
                active
                  ? 'bg-red-500 shadow-[0_0_10px_#ef4444,0_0_2px_#ffffff]'
                  : isLight
                  ? 'bg-neutral-300'
                  : 'bg-neutral-700'
              }`}
            />
            {active && (
              <div className="absolute h-4 w-4 rounded-full bg-red-500/20 animate-ping pointer-events-none" />
            )}
          </div>

          {/* 右侧 BALL CAM 标题 */}
          <span
            className={`text-xs font-black tracking-widest font-mono uppercase transition-colors ${
              active
                ? isLight
                  ? 'text-neutral-900'
                  : 'text-white'
                : isLight
                ? 'text-neutral-500'
                : 'text-neutral-400'
            }`}
          >
            {label}
          </span>
        </div>

        {/* 下半部分：PRESS [KEY] TO TOGGLE 操作指引 */}
        {shortcut && (
          <div
            className={`flex items-center gap-1.5 text-[9px] font-mono tracking-tight transition-opacity ${
              active ? 'opacity-80' : 'opacity-50'
            } ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}
          >
            <span>PRESS</span>
            <KeycapBadge shortcut={shortcut} size="sm" isLight={isLight} />
            <span>{actionText}</span>
          </div>
        )}
      </div>
    </div>
  );
};
