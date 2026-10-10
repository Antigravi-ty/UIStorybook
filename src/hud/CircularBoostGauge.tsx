import React from 'react';
import { Flame } from 'lucide-react';

export interface CircularBoostGaugeProps {
  /** 当前推进量数值 (0 ~ 100) */
  amount: number;
  /** 是否处于点火喷射状态 (Firing) */
  isFiring?: boolean;
  /** 表盘外圈直径尺寸 (单位 px，默认 148) */
  size?: number;
  /** 明暗主题 */
  isLight?: boolean;
  /** 自定义 className */
  className?: string;
}

/**
 * 推进量四色分段映射算法：
 * - 0  ~ 24  ：红色 (Red - #ef4444)
 * - 25 ~ 60  ：黄色 (Yellow - #f59e0b)
 * - 61 ~ 96  ：绿色 (Green - #10b981)
 * - 97 ~ 100 ：浅蓝 (Sky Blue - #0ea5e9，对齐 MatchHUD 速度调节菜单的天空蓝)
 */
export const getBoostSegmentColor = (amount: number): {
  color: string;
  segmentName: 'red' | 'yellow' | 'green' | 'sky';
  rangeLabel: string;
} => {
  const val = Math.max(0, Math.min(100, Math.round(amount)));
  if (val <= 24) {
    return { color: '#ef4444', segmentName: 'red', rangeLabel: '0-24 (危急·红)' };
  }
  if (val <= 60) {
    return { color: '#f59e0b', segmentName: 'yellow', rangeLabel: '25-60 (警戒·黄)' };
  }
  if (val <= 96) {
    return { color: '#10b981', segmentName: 'green', rangeLabel: '61-96 (充足·绿)' };
  }
  return { color: '#0ea5e9', segmentName: 'sky', rangeLabel: '97-100 (充盈·浅蓝)' };
};

/**
 * CircularBoostGauge
 * 独立圆形推进量表盘组件，内置严格的四色分段色彩引擎：
 * 0~24 红色 -> 25~60 黄色 -> 61~96 绿色 -> 97~100 浅蓝。
 * 包含中央大字数值读数、270度环形弧度刻度、四分位微型指示标及点火状态反馈。
 */
export const CircularBoostGauge: React.FC<CircularBoostGaugeProps> = ({
  amount = 100,
  isFiring = false,
  size = 148,
  isLight = false,
  className = '',
}) => {
  const clampedAmount = Math.max(0, Math.min(100, Math.round(amount)));
  const { color } = getBoostSegmentColor(clampedAmount);

  // SVG 环形参数
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const sweepAngle = 270;
  const arcTotal = (sweepAngle / 360) * circumference;
  const progressOffset = arcTotal - (clampedAmount / 100) * arcTotal;

  return (
    <div
      data-ui-element="hud-circular-boost-gauge"
      className={`relative select-none pointer-events-auto flex items-center justify-center transition-transform ${
        isFiring ? 'scale-105' : 'scale-100'
      } ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center p-3 rounded-full border transition-all ${
          isLight
            ? 'bg-white/90 border-neutral-300/90 shadow-2xl backdrop-blur-md'
            : 'bg-neutral-950/85 border-neutral-800/90 shadow-2xl backdrop-blur-md'
        }`}
      >
        {/* 点火时光晕背光 */}
        {isFiring && (
          <div
            className="absolute inset-0 rounded-full blur-xl pointer-events-none opacity-40 transition-colors"
            style={{ backgroundColor: color }}
          />
        )}

        {/* SVG 环形进度条 (-225度起始旋转) */}
        <svg className="w-full h-full transform -rotate-[225deg]" viewBox="0 0 136 136">
          {/* 背景导轨 */}
          <circle
            cx="68"
            cy="68"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcTotal} ${circumference}`}
            strokeLinecap="round"
            className={isLight ? 'text-neutral-200/90' : 'text-neutral-800/80'}
          />

          {/* 前景激活填充弧：颜色随 4 分段实时变更，无延迟更新 */}
          <circle
            cx="68"
            cy="68"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcTotal} ${circumference}`}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke 150ms ease, stroke-dashoffset 0ms',
              filter: isFiring ? `drop-shadow(0 0 8px ${color})` : undefined,
            }}
          />
        </svg>

        {/* 表盘中央数字读数 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1">
            {isFiring && <Flame className="h-4 w-4" style={{ color }} />}
            <span
              className="text-4xl font-black font-mono tracking-tighter tabular-nums drop-shadow-md transition-colors"
              style={{ color }}
            >
              {clampedAmount}
            </span>
          </div>

          <span
            className={`text-[10px] font-mono font-bold tracking-widest uppercase -mt-1 ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            BOOST
          </span>

          {/* 4 档分位点指示标 (对应 24/60/96/100 阈值) */}
          <div className="flex items-center gap-1 mt-1 opacity-80">
            {[24, 60, 96, 100].map((threshold) => (
              <div
                key={threshold}
                className={`h-1 w-2 rounded-full transition-colors ${
                  clampedAmount >= threshold
                    ? isLight
                      ? 'bg-neutral-800'
                      : 'bg-white'
                    : isLight
                    ? 'bg-neutral-300'
                    : 'bg-neutral-700'
                }`}
                title={`Threshold ${threshold}%`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
