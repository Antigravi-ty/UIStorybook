import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { SpeedTransientListener } from './types';

export interface VelocityProgressBarHandle {
  /** Imperatively update velocity (0 ~ 2300 uu/s) at 120Hz+ with zero React re-renders */
  setSpeed: (speed: number) => void;
}

export interface VelocityProgressBarProps {
  /** 当前速度值 (0 ~ 2300 Unreal Units/s)，支持静态/低频 Props 驱动 */
  speed?: number;
  /** 可选 120Hz 瞬态订阅函数（传入后直接操作 DOM Ref，0 React VDOM 重绘） */
  subscribeSpeed?: (listener: SpeedTransientListener) => () => void;
  /** 自定义外层宽度 (CSS 字符串或像素，默认 100%) */
  width?: string | number;
  /** 自定义高度 (默认 20px) */
  height?: string | number;
  /** 附加 className */
  className?: string;
}

// 辅助函数：将 HEX 颜色 (#ffffff) 转为 RGB 数组
const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

/**
 * 计算整体颜色与超音速状态（严格照搬用户提供的算法规范）：
 * - 低速区 (<= 1410)：纯色 #d4af37 (金黄)
 * - 中速区 (1410 ~ 2200)：从 #77ca7a 线性平滑过渡到 #59f168 (鲜绿)
 * - 超音速区 (>= 2200)：#a020f0 (纯紫 + 呼吸状态)
 */
export const getVelocityBarColor = (v: number): {
  color: string;
  isSupersonic: boolean;
  percent: number;
} => {
  const speed = Math.max(0, Math.min(2300, Math.round(v)));

  // 1. 非线性三段式进度百分比映射
  let percent = 0;
  if (speed <= 1410) {
    percent = (speed / 1410) * 40;
  } else if (speed <= 2200) {
    percent = 40 + ((speed - 1410) / (2200 - 1410)) * 45;
  } else {
    percent = 85 + ((speed - 2200) / (2300 - 2200)) * 15;
  }
  percent = Math.min(100, Math.max(0, percent));

  // 2. 动态变色逻辑
  if (speed >= 2200) {
    return { color: '#a020f0', isSupersonic: true, percent };
  }

  if (speed <= 1410) {
    return { color: '#d4af37', isSupersonic: false, percent };
  }

  // 1410 ~ 2200 线性插值
  const ratio = (speed - 1410) / (2200 - 1410);
  const rgbStart = hexToRgb('#77ca7a');
  const rgbEnd = hexToRgb('#59f168');
  const r = Math.round(rgbStart[0] + (rgbEnd[0] - rgbStart[0]) * ratio);
  const g = Math.round(rgbStart[1] + (rgbEnd[1] - rgbStart[1]) * ratio);
  const b = Math.round(rgbStart[2] + (rgbEnd[2] - rgbStart[2]) * ratio);
  return { color: `rgb(${r}, ${g}, ${b})`, isSupersonic: false, percent };
};

/**
 * VelocityProgressBar
 * 纯粹的方形无延迟速度进度条（支持 120Hz 瞬态零重绘与常规 Props 双模驱动）：
 * 1. 结构极简：仅包含中间条与 85% 超音速小竖线，无任何多余文字或外壳修饰。
 * 2. 零圆角 (纯方框)，背景透明，支持任意容器宽高自适应，内部绝对不写死屏幕坐标。
 * 3. 严格遵循非线性算法与动态色彩演进规范 (金黄 -> 鲜绿 -> 超音速纯紫呼吸)。
 */
export const VelocityProgressBar = React.memo(
  forwardRef<VelocityProgressBarHandle, VelocityProgressBarProps>(
    ({ speed = 0, subscribeSpeed, width = '100%', height = 20, className = '' }, ref) => {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const initial = getVelocityBarColor(speed);

  const applySpeedToDom = useCallback((rawSpeed: number) => {
    const el = fillRef.current;
    if (!el) return;
    const { color, isSupersonic, percent } = getVelocityBarColor(rawSpeed);
    el.style.width = `${percent}%`;
    el.style.backgroundColor = color;
    el.classList.toggle('supersonic-heartbeat', isSupersonic);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setSpeed: applySpeedToDom,
    }),
    [applySpeedToDom]
  );

  // Sync when declarative `speed` prop changes
  useEffect(() => {
    applySpeedToDom(speed);
  }, [speed, applySpeedToDom]);

  // Subscribe to 120Hz transient channel if provided (0 React re-renders)
  useEffect(() => {
    if (!subscribeSpeed) return;
    return subscribeSpeed(applySpeedToDom);
  }, [subscribeSpeed, applySpeedToDom]);

  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      data-ui-element="hud-velocity-progress-bar"
      className={`relative select-none pointer-events-auto overflow-hidden bg-[#333333]/80 ${className}`}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: 0, // 坚决不要圆角，纯方矩形
      }}
    >
      {/* 85% 超音速分割小竖线 (方角) */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-10"
        style={{
          left: '85%',
          width: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
        }}
        title="Supersonic Threshold (2200 uu/s)"
      />

      {/* 填充进度条：无 CSS 宽度过渡延迟，实时 0ms 响应 */}
      <div
        ref={fillRef}
        className={`h-full ${initial.isSupersonic ? 'supersonic-heartbeat' : ''}`}
        style={{
          width: `${initial.percent}%`,
          backgroundColor: initial.color,
          borderRadius: 0,
          transition: 'none',
        }}
      />

      {/* 常驻超音速呼吸动效定义（纯 opacity 合成器动画，0 filter/box-shadow 重绘开销） */}
      <style>{`
        @keyframes supersonicHeartbeat {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.72; }
        }
        .supersonic-heartbeat {
          animation: supersonicHeartbeat 1.2s infinite ease-in-out;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
        }
      `}</style>
      </div>
    );
  })
);

VelocityProgressBar.displayName = 'VelocityProgressBar';
