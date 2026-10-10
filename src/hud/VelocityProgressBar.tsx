import React from 'react';

export interface VelocityProgressBarProps {
  /** 当前速度值 (0 ~ 2300 Unreal Units/s) */
  speed: number;
  /** 最大速度标称值，默认 2300 uu/s */
  maxSpeed?: number;
  /** 超音速竖线标定阈值，默认 2200 uu/s (对应 85% 刻度位置) */
  supersonicThreshold?: number;
  /** 是否在右下角显示 '2300' 极速刻度指示，默认 true */
  showMilestone2300?: boolean;
  /** 进度条高度 (单位 px，默认 10) */
  barHeight?: number;
  /** 进度条自定义填充颜色 (默认青蓝/翡翠渐变色) */
  fillColor?: string;
  /** 明暗主题 */
  isLight?: boolean;
  /** 自定义外层样式 */
  className?: string;
}

/**
 * VelocityProgressBar
 * 独立纯粹的速度无延迟进度条组件：
 * 1. 彻底剥离顶部冗余装饰、标题与紫光变色干扰，专注于速度条本身。
 * 2. 严格按 Rocket League 动力学非线性分段映射：
 *    - 0 ~ 1410 uu/s：占进度条 40%
 *    - 1410 ~ 2200 uu/s：占进度条 45% (2200 处对应 85%)
 *    - 2200 ~ 2300 uu/s：占进度条 15% (2300 处对应 100%)
 * 3. 85% 位置常驻一条超音速阈值右侧分割小竖线。
 * 4. 底部仅保留右侧 2300 极速标尺指示，去除其它干扰刻度。
 * 5. 0ms 实时无延迟渲染，无补间延迟。
 */
export const VelocityProgressBar: React.FC<VelocityProgressBarProps> = ({
  speed = 0,
  maxSpeed = 2300,
  supersonicThreshold = 2200,
  showMilestone2300 = true,
  barHeight = 10,
  fillColor,
  isLight = false,
  className = '',
}) => {
  const clampedSpeed = Math.max(0, Math.min(maxSpeed, Math.round(speed)));

  // 非线性分段计算进度百分比 (0 ~ 100%)
  let percent = 0;
  if (clampedSpeed <= 1410) {
    percent = (clampedSpeed / 1410) * 40;
  } else if (clampedSpeed < supersonicThreshold) {
    percent = 40 + ((clampedSpeed - 1410) / (supersonicThreshold - 1410)) * 45;
  } else {
    percent = 85 + ((clampedSpeed - supersonicThreshold) / (maxSpeed - supersonicThreshold)) * 15;
  }
  percent = Math.min(100, Math.max(0, percent));

  // 默认填充色彩：采用干净沉稳的翡翠绿/天蓝色，杜绝全屏紫色爆闪扰乱
  const activeColor =
    fillColor ??
    (isLight
      ? clampedSpeed >= supersonicThreshold
        ? '#0284c7'
        : '#059669'
      : clampedSpeed >= supersonicThreshold
      ? '#38bdf8'
      : '#10b981');

  return (
    <div
      data-ui-element="hud-velocity-progress-bar"
      className={`relative select-none pointer-events-auto flex flex-col w-full min-w-[200px] max-w-[460px] ${className}`}
    >
      {/* 进度轨道主体 */}
      <div
        className={`relative w-full rounded-full overflow-hidden border transition-colors ${
          isLight
            ? 'bg-neutral-200/90 border-neutral-300 shadow-inner'
            : 'bg-neutral-900/95 border-neutral-700/80 shadow-inner'
        }`}
        style={{ height: `${barHeight}px` }}
      >
        {/* 右侧 85% 位置常驻的超音速阈值分割小竖线 (Notch line at 2200 uu/s) */}
        <div
          className={`absolute top-0 bottom-0 w-0.5 z-10 ${
            isLight ? 'bg-neutral-600' : 'bg-neutral-300/80'
          }`}
          style={{ left: '85%' }}
          title="Supersonic Threshold (2200 uu/s)"
        />

        {/* 内部实时填充条：无 CSS 过渡延迟，保证 0ms 纯物理实时反馈 */}
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: activeColor,
            transition: 'none',
          }}
        />
      </div>

      {/* 进度条下方仅显示右侧 2300 极速指示 */}
      {showMilestone2300 && (
        <div className="flex justify-end w-full px-0.5 mt-1">
          <span
            className={`text-[10px] font-mono font-bold tracking-tight ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            2300
          </span>
        </div>
      )}
    </div>
  );
};
