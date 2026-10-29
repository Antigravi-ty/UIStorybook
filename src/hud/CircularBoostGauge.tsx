import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { BoostTransientListener } from './types';
import { useBoostGaugeStore } from '../tokens/boostGaugeStore';

export type BoostColorScheme = 'classic-4' | 'step-12';
export type BoostColorMode = 'standard' | 'inverted' | 'ring-only';
export type BoostThemeOverride = 'auto' | 'dark' | 'light';

export interface BoostSegmentColorInfo {
  color: string;
  segmentName:
    | 'black'
    | 'red-flash'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'lime'
    | 'green'
    | 'emerald'
    | 'sky';
  rangeLabel: string;
  isFlashing: boolean;
  tierIndex: number;
}

export interface CircularBoostGaugeHandle {
  /** Imperatively update boost amount (0~100) and unlimited state at 120Hz+ with zero React re-renders */
  setBoost: (amount: number, isUnlimited?: boolean) => void;
}

export interface CircularBoostGaugeProps {
  /** 当前推进量数值 (0 ~ 100)，支持静态/低频 Props 驱动 */
  amount?: number;
  /** 是否开启无限推进模式（显示 '--' 且圆弧保持满格 100%） */
  isUnlimited?: boolean;
  /** 可选 120Hz 瞬态订阅函数（传入后直接操作 SVG/DOM Ref，0 React VDOM 重绘） */
  subscribeBoost?: (listener: BoostTransientListener) => () => void;
  /** 表盘外圈直径尺寸 (单位 px，默认 148) */
  size?: number;
  /** 明暗主题（当 themeOverride 为 'auto' 且未设置 darkModeOverride 时生效） */
  isLight?: boolean;
  /**
   * Dark Mode Override：
   * - true: 强制使用暗色表盘底色
   * - false / undefined: 由 themeOverride 或 isLight 决定
   */
  darkModeOverride?: boolean;
  /** 主题覆盖模式：'auto' (跟随 isLight) | 'dark' (强制暗色) | 'light' (强制亮色) */
  themeOverride?: BoostThemeOverride;
  /**
   * 底部大圆的圆环起始半径百分比 (0 ~ 99，默认 72%)
   * 例如 50 表示从半径 50% 处开始，60 表示从 60% 处开始
   */
  ringInnerPct?: number;
  /**
   * 底部大圆的圆环结束半径百分比 (1 ~ 100，默认 84%)
   * 例如 55 表示到半径 55% 结束；设为 100 则外环紧贴表盘最外边沿
   */
  ringOuterPct?: number;
  /** 圆弧端点样式：'round' (圆头) | 'butt' (平齐切角，适合紧贴外沿或满圆环) */
  lineCap?: 'round' | 'butt';
  /**
   * 圆环裁切角度 (0° ~ 359°，默认 90° 即 270° 圆弧)：
   * - 0°: 完整 360° 闭合圆环
   * - 90°: 经典裁切 90° (270° 圆弧)
   * - 120°: 大圆弧 (240° 圆弧)
   * - 180°: 半圆环 (180° 圆弧)
   * 支持任意自定义角度数值
   */
  cutoutAngleDeg?: number;
  /**
   * 旋转角度 / 开口朝向角度 (单位 °，默认 0° 即开口朝正下方)：
   * - 0°: 开口朝下 (Bottom)
   * - -45° (或 315°): 开口朝右下 (Bottom-Right)
   * - -90° (或 270°): 开口朝右 (Right)
   * - 45°: 开口朝左下 (Bottom-Left)
   * - 90°: 开口朝左 (Left)
   * - 180°: 开口朝上 (Top)
   * 支持任意自定义角度数值
   */
  rotationDeg?: number;
  /**
   * 配色方案：
   * - 'classic-4': 经典四色模式 (0-24红, 25-60黄, 61-96绿, 97-100蓝)
   * - 'step-12': 每 12 Boost 一档模式 (0-11黑, 12-23红闪, 24-35红, 36-47橙, 48-59黄, 60-71黄绿, 72-83亮绿, 84-96翠绿, 97-100蓝)
   */
  colorScheme?: BoostColorScheme;
  /**
   * 颜色作用模式：
   * - 'standard': 表盘底色固定，外圈圆环与中央数字随 Boost 档位变色（默认）
   * - 'inverted': 反转模式 —— 表盘整体背景随 Boost 档位变色（含闪烁），中央数字保持固定颜色
   * - 'ring-only': 表盘底色固定，仅外圈圆环随 Boost 变色，中央数字保持固定颜色
   */
  colorMode?: BoostColorMode;
  /** 当 colorMode 为 'inverted' 或 'ring-only' 时，中央数字使用的固定颜色 (默认 '#FFFFFF') */
  fixedTextColor?: string;
  /** 自定义 className */
  className?: string;
}

/**
 * 推进量双配色方案分段映射算法：
 * 1. `'classic-4'` (四色模式):
 *    - 0  ~ 24  ：红色 (#ef4444)
 *    - 25 ~ 60  ：黄色 (#f59e0b)
 *    - 61 ~ 96  ：绿色 (#10b981)
 *    - 97 ~ 100 ：浅蓝 (#0ea5e9)
 * 2. `'step-12'` (每 12 Boost 一档 · 对应 T5A.4 DualLayerBoostPie 扩展 9 档位):
 *    - 0  ~ 11  (<12)  ：黑色 (#18181b)
 *    - 12 ~ 23  (<24)  ：红色闪烁 (#ef4444, isFlashing: true)
 *    - 24 ~ 35  (<36)  ：红色 (#ef4444)
 *    - 36 ~ 47  (<48)  ：橙色 (#f97316)
 *    - 48 ~ 59  (<60)  ：黄色 (#eab308)
 *    - 60 ~ 71  (<72)  ：黄绿 (#84cc16)
 *    - 72 ~ 83  (<84)  ：亮绿 (#22c55e)
 *    - 84 ~ 96  (<=96) ：翠绿 (#10b981)
 *    - 97 ~ 100 (>96)  ：浅蓝 (#0ea5e9)
 */
export const getBoostSegmentColor = (
  amount: number,
  colorScheme: BoostColorScheme = 'classic-4'
): BoostSegmentColorInfo => {
  const val = Math.max(0, Math.min(100, Math.round(amount)));

  if (colorScheme === 'step-12') {
    if (val < 12) {
      return {
        color: '#18181b',
        segmentName: 'black',
        rangeLabel: '0-11 (空置·黑)',
        isFlashing: false,
        tierIndex: 0,
      };
    }
    if (val < 24) {
      return {
        color: '#ef4444',
        segmentName: 'red-flash',
        rangeLabel: '12-23 (危急·红闪)',
        isFlashing: true,
        tierIndex: 1,
      };
    }
    if (val < 36) {
      return {
        color: '#ef4444',
        segmentName: 'red',
        rangeLabel: '24-35 (低量·红)',
        isFlashing: false,
        tierIndex: 2,
      };
    }
    if (val < 48) {
      return {
        color: '#f97316',
        segmentName: 'orange',
        rangeLabel: '36-47 (偏低·橙)',
        isFlashing: false,
        tierIndex: 3,
      };
    }
    if (val < 60) {
      return {
        color: '#eab308',
        segmentName: 'yellow',
        rangeLabel: '48-59 (中等·黄)',
        isFlashing: false,
        tierIndex: 4,
      };
    }
    if (val < 72) {
      return {
        color: '#84cc16',
        segmentName: 'lime',
        rangeLabel: '60-71 (良好·黄绿)',
        isFlashing: false,
        tierIndex: 5,
      };
    }
    if (val < 84) {
      return {
        color: '#22c55e',
        segmentName: 'green',
        rangeLabel: '72-83 (充沛·亮绿)',
        isFlashing: false,
        tierIndex: 6,
      };
    }
    if (val <= 96) {
      return {
        color: '#10b981',
        segmentName: 'emerald',
        rangeLabel: '84-96 (高能·翠绿)',
        isFlashing: false,
        tierIndex: 7,
      };
    }
    return {
      color: '#0ea5e9',
      segmentName: 'sky',
      rangeLabel: '97-100 (满载·浅蓝)',
      isFlashing: false,
      tierIndex: 8,
    };
  }

  // Default: 'classic-4'
  if (val <= 24) {
    return {
      color: '#ef4444',
      segmentName: 'red',
      rangeLabel: '0-24 (危急·红)',
      isFlashing: false,
      tierIndex: 0,
    };
  }
  if (val <= 60) {
    return {
      color: '#f59e0b',
      segmentName: 'yellow',
      rangeLabel: '25-60 (警戒·黄)',
      isFlashing: false,
      tierIndex: 1,
    };
  }
  if (val <= 96) {
    return {
      color: '#10b981',
      segmentName: 'green',
      rangeLabel: '61-96 (充足·绿)',
      isFlashing: false,
      tierIndex: 2,
    };
  }
  return {
    color: '#0ea5e9',
    segmentName: 'sky',
    rangeLabel: '97-100 (充盈·浅蓝)',
    isFlashing: false,
    tierIndex: 3,
  };
};

export const STEP_12_TIER_PRESETS: {
  val: number;
  range: string;
  label: string;
  hex: string;
  isFlashing?: boolean;
}[] = [
  { val: 6, range: '0~11', label: '黑 (0档)', hex: '#18181b' },
  { val: 18, range: '12~23', label: '红闪 (1档)', hex: '#ef4444', isFlashing: true },
  { val: 30, range: '24~35', label: '红 (2档)', hex: '#ef4444' },
  { val: 42, range: '36~47', label: '橙 (3档)', hex: '#f97316' },
  { val: 54, range: '48~59', label: '黄 (4档)', hex: '#eab308' },
  { val: 66, range: '60~71', label: '黄绿 (5档)', hex: '#84cc16' },
  { val: 78, range: '72~83', label: '亮绿 (6档)', hex: '#22c55e' },
  { val: 90, range: '84~96', label: '翠绿 (7档)', hex: '#10b981' },
  { val: 100, range: '97~100', label: '浅蓝 (满)', hex: '#0ea5e9' },
];

/**
 * 等宽字体族配置：优先 SF Mono，其次 JetBrains Mono
 */
const MONO_FONT_FAMILY =
  "'SF Mono', 'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace";

// SVG 坐标系常量：viewBox="0 0 136 136"，圆心 (68, 68)，最大外半径 R_DISC = 68 (对应 100% 表盘边沿)
const DISC_CENTER = 68;
const DISC_MAX_RADIUS = 68;

/**
 * CircularBoostGauge (`5A.5`)
 * 极简轻量级圆形推进量表盘（支持 120Hz 瞬态零重绘与常规 Props 双模驱动）：
 * - 支持外圈起始百分比 (`ringInnerPct`) 与结束百分比 (`ringOuterPct`) 自由调节（如 60%~100% 紧贴外边沿）
 * - 支持反转颜色模式 (`colorMode = 'inverted'`)：表盘整体随 Boost 档位变色，中央数字保持固定颜色
 * - 支持 Dark Mode Override (`darkModeOverride` / `themeOverride`)
 * - 支持任意裁切角度 (`cutoutAngleDeg`: 0°~359°) 与任意旋转角度 (`rotationDeg`: 开口朝下/右下/右等)
 * - 支持双配色方案：经典四色 (`classic-4`) 与每 12 一档九段七色+红闪 (`step-12`)
 */
export const CircularBoostGauge = React.memo(
  forwardRef<CircularBoostGaugeHandle, CircularBoostGaugeProps>(
    (
      {
        amount = 100,
        isUnlimited = false,
        subscribeBoost,
        size: propSize,
        isLight = false,
        darkModeOverride,
        themeOverride: propThemeOverride,
        ringInnerPct: propRingInnerPct,
        ringOuterPct: propRingOuterPct,
        lineCap: propLineCap,
        cutoutAngleDeg: propCutoutAngleDeg,
        rotationDeg: propRotationDeg,
        colorScheme: propColorScheme,
        colorMode: propColorMode,
        fixedTextColor: propFixedTextColor,
        className = '',
      },
      ref
    ) => {
      const storeTokens = useBoostGaugeStore();

      const size = propSize ?? storeTokens.size;
      const themeOverride = propThemeOverride ?? storeTokens.themeOverride;
      const ringInnerPct = propRingInnerPct ?? storeTokens.ringInnerPct;
      const ringOuterPct = propRingOuterPct ?? storeTokens.ringOuterPct;
      const lineCap = propLineCap ?? storeTokens.lineCap;
      const cutoutAngleDeg = propCutoutAngleDeg ?? storeTokens.cutoutAngleDeg;
      const rotationDeg = propRotationDeg ?? storeTokens.rotationDeg;
      const colorScheme = propColorScheme ?? storeTokens.colorScheme;
      const colorMode = propColorMode ?? storeTokens.colorMode;
      const fixedTextColor = propFixedTextColor ?? storeTokens.fixedTextColor;

      const dialPlateRef = useRef<HTMLDivElement | null>(null);
      const innerDiscRef = useRef<SVGCircleElement | null>(null);
      const trackCircleRef = useRef<SVGCircleElement | null>(null);
      const arcCircleRef = useRef<SVGCircleElement | null>(null);
      const readoutSpanRef = useRef<HTMLSpanElement | null>(null);
      const labelSpanRef = useRef<HTMLSpanElement | null>(null);
      const lastBoostRef = useRef<{ amount: number; unlimited: boolean }>({
        amount,
        unlimited: isUnlimited,
      });

      // Resolve effective light/dark mode with Dark Mode Override support
      const effectiveIsLight =
        darkModeOverride === true
          ? false
          : themeOverride === 'dark'
          ? false
          : themeOverride === 'light'
          ? true
          : isLight;

      // Compute radial geometry from [ringInnerPct, ringOuterPct] relative to DISC_MAX_RADIUS (68)
      const safeInnerPct = Math.max(0, Math.min(99, Number.isFinite(ringInnerPct) ? ringInnerPct : 60));
      const safeOuterPct = Math.max(
        safeInnerPct + 1,
        Math.min(100, Number.isFinite(ringOuterPct) ? ringOuterPct : 98)
      );
      const innerR = (safeInnerPct / 100) * DISC_MAX_RADIUS;
      const outerR = (safeOuterPct / 100) * DISC_MAX_RADIUS;
      const radius = (innerR + outerR) / 2;
      const strokeWidth = Math.max(0.5, outerR - innerR);
      const circumference = 2 * Math.PI * radius;

      // Compute arc sweep & cutout angle (0° = full circle, 90° = 270° arc, 180° = semicircle)
      const safeCutoutDeg = Math.max(
        0,
        Math.min(359.5, Number.isFinite(cutoutAngleDeg) ? cutoutAngleDeg : 90)
      );
      const sweepAngleDeg = 360 - safeCutoutDeg;
      const arcTotal = (sweepAngleDeg / 360) * circumference;

      // Center the cutout opening on `rotationDeg` (0° = Bottom 6 o'clock, -45° = Bottom-Right, -90° = Right)
      const safeRotationDeg = Number.isFinite(rotationDeg) ? rotationDeg : -45;
      const svgRotateDeg = 90 + safeRotationDeg + safeCutoutDeg / 2;

      // Respect user-selected lineCap ('round' vs 'butt') whenever cutoutAngleDeg > 1°
      const effectiveLineCap: 'round' | 'butt' =
        safeCutoutDeg <= 1 ? 'butt' : lineCap;

      const resolveVisualColors = useCallback(
        (seg: BoostSegmentColorInfo) => {
          // On a dark dial, pure #18181b black needs a readable charcoal tone so 0..11 is visible
          const tierColorForStrokeOrText =
            !effectiveIsLight && seg.segmentName === 'black' ? '#52525b' : seg.color;

          if (colorMode === 'inverted') {
            // Inverted mode:
            // - Inner dial plate (0 .. innerR) is filled with tier color
            // - Active ring portion (0 .. amount%) is filled with tier color
            // - Empty ring portion (100 - amount)% and cutout angle are 100% transparent (carved away!)
            // - Center readout stays fixedTextColor
            const isLightFixedText =
              fixedTextColor.toUpperCase() === '#FFFFFF' ||
              fixedTextColor.toUpperCase() === '#F8FAFC' ||
              fixedTextColor.toUpperCase() === '#FDE047';
            return {
              dialBg: 'transparent',
              dialBorder: 'transparent',
              innerDiscFill: seg.color,
              innerDiscStroke: isLightFixedText
                ? 'rgba(0, 0, 0, 0.28)'
                : 'rgba(255, 255, 255, 0.28)',
              trackStroke: 'transparent',
              arcStroke: seg.color,
              readoutColor: fixedTextColor,
              labelColor: isLightFixedText ? 'rgba(255, 255, 255, 0.82)' : 'rgba(9, 9, 11, 0.75)',
              flashDial: seg.isFlashing,
              flashArcAndText: seg.isFlashing,
            };
          }

          const stdDialBg = effectiveIsLight
            ? 'rgba(255, 255, 255, 0.92)'
            : 'rgba(9, 9, 11, 0.88)';
          const stdDialBorder = effectiveIsLight
            ? 'rgba(212, 212, 216, 0.85)'
            : 'rgba(39, 39, 42, 0.85)';
          const stdTrackStroke = effectiveIsLight ? '#e5e5e5' : '#262626';
          const stdLabelColor = effectiveIsLight ? '#737373' : '#a3a3a3';

          if (colorMode === 'ring-only') {
            return {
              dialBg: stdDialBg,
              dialBorder: stdDialBorder,
              innerDiscFill: 'transparent',
              innerDiscStroke: 'transparent',
              trackStroke: stdTrackStroke,
              arcStroke: tierColorForStrokeOrText,
              readoutColor:
                fixedTextColor || (effectiveIsLight ? '#09090B' : '#FFFFFF'),
              labelColor: stdLabelColor,
              flashDial: false,
              flashArcAndText: seg.isFlashing,
            };
          }

          // 'standard' mode
          return {
            dialBg: stdDialBg,
            dialBorder: stdDialBorder,
            innerDiscFill: 'transparent',
            innerDiscStroke: 'transparent',
            trackStroke: stdTrackStroke,
            arcStroke: tierColorForStrokeOrText,
            readoutColor: tierColorForStrokeOrText,
            labelColor: stdLabelColor,
            flashDial: false,
            flashArcAndText: seg.isFlashing,
          };
        },
        [colorMode, effectiveIsLight, fixedTextColor]
      );

      const applyBoostToDom = useCallback(
        (rawAmount: number, unlimited = false) => {
          lastBoostRef.current = { amount: rawAmount, unlimited };
          const clamped = Math.max(0, Math.min(100, Math.round(rawAmount)));
          const effective = unlimited ? 100 : clamped;
          const seg = getBoostSegmentColor(effective, colorScheme);
          const activeArcLen = (effective / 100) * arcTotal;
          const colors = resolveVisualColors(seg);

          if (dialPlateRef.current) {
            dialPlateRef.current.style.backgroundColor = colors.dialBg;
            dialPlateRef.current.style.borderColor = colors.dialBorder;
            dialPlateRef.current.style.animation = colors.flashDial
              ? 'hudBoostRedFlash 0.38s ease-in-out infinite alternate'
              : 'none';
          }
          if (innerDiscRef.current) {
            innerDiscRef.current.setAttribute('fill', colors.innerDiscFill);
            innerDiscRef.current.setAttribute('stroke', colors.innerDiscStroke);
          }
          if (trackCircleRef.current) {
            trackCircleRef.current.setAttribute('stroke', colors.trackStroke);
          }
          if (arcCircleRef.current) {
            arcCircleRef.current.setAttribute('stroke-dasharray', `${activeArcLen} ${circumference}`);
            arcCircleRef.current.style.strokeDashoffset = '0';
            arcCircleRef.current.style.opacity = effective <= 0 ? '0' : '1';
            arcCircleRef.current.setAttribute('stroke', colors.arcStroke);
            arcCircleRef.current.style.animation = colors.flashArcAndText
              ? 'hudBoostRedFlash 0.38s ease-in-out infinite alternate'
              : 'none';
          }
          if (readoutSpanRef.current) {
            readoutSpanRef.current.textContent = unlimited ? '--' : String(clamped);
            readoutSpanRef.current.style.color = colors.readoutColor;
            readoutSpanRef.current.style.animation =
              colorMode === 'standard' && colors.flashArcAndText
                ? 'hudBoostRedFlash 0.38s ease-in-out infinite alternate'
                : 'none';
          }
          if (labelSpanRef.current) {
            labelSpanRef.current.style.color = colors.labelColor;
          }
        },
        [arcTotal, circumference, colorMode, colorScheme, resolveVisualColors]
      );

      useImperativeHandle(
        ref,
        () => ({
          setBoost: (val: number, unlim = isUnlimited) => applyBoostToDom(val, unlim),
        }),
        [applyBoostToDom, isUnlimited]
      );

      // Sync when declarative props or geometry/color settings change
      useEffect(() => {
        applyBoostToDom(lastBoostRef.current.amount ?? amount, lastBoostRef.current.unlimited ?? isUnlimited);
      }, [amount, isUnlimited, applyBoostToDom]);

      // Also sync when amount/isUnlimited props change explicitly
      useEffect(() => {
        applyBoostToDom(amount, isUnlimited);
      }, [amount, isUnlimited, applyBoostToDom]);

      // Subscribe to 120Hz transient channel if provided (0 React re-renders)
      useEffect(() => {
        if (!subscribeBoost) return;
        return subscribeBoost(applyBoostToDom);
      }, [subscribeBoost, applyBoostToDom]);

      const clampedAmount = Math.max(0, Math.min(100, Math.round(amount)));
      const effectiveAmount = isUnlimited ? 100 : clampedAmount;
      const initialSeg = getBoostSegmentColor(effectiveAmount, colorScheme);
      const initialColors = resolveVisualColors(initialSeg);
      const initialActiveArcLen = (effectiveAmount / 100) * arcTotal;

      return (
        <div
          data-ui-element="hud-circular-boost-gauge"
          className={`relative select-none pointer-events-auto flex items-center justify-center ${className}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            fontFamily: MONO_FONT_FAMILY,
          }}
        >
          <style>{`
            @keyframes hudBoostRedFlash {
              0% { opacity: 1; }
              100% { opacity: 0.28; }
            }
          `}</style>
          <div
            ref={dialPlateRef}
            className={`relative w-full h-full flex flex-col items-center justify-center rounded-full overflow-hidden transition-colors ${
              colorMode === 'inverted' || safeOuterPct >= 99.5 ? 'border-0' : 'border'
            } ${
              colorMode === 'inverted'
                ? 'drop-shadow-md'
                : effectiveIsLight
                ? 'shadow-md'
                : 'shadow-lg'
            }`}
            style={{
              backgroundColor: initialColors.dialBg,
              borderColor: initialColors.dialBorder,
            }}
          >
            {/* SVG 环形进度条：直接映射 0..100% 表盘半径 */}
            <svg
              className="w-full h-full"
              viewBox="0 0 136 136"
              style={{
                transform: `rotate(${svgRotateDeg}deg)`,
              }}
            >
              {/* 反转模式中央实心表盘 (0 .. innerR)：使外圈空置区域 (100 - amount)% 彻底镂空为透明 */}
              <circle
                ref={innerDiscRef}
                cx={DISC_CENTER}
                cy={DISC_CENTER}
                r={Math.max(0, innerR)}
                fill={initialColors.innerDiscFill}
                stroke={initialColors.innerDiscStroke}
                strokeWidth={colorMode === 'inverted' && innerR > 0 ? 1.25 : 0}
              />

              {/* 背景底轨 (在反转模式下为 transparent，即空置部分直接裁切为透明) */}
              <circle
                ref={trackCircleRef}
                cx={DISC_CENTER}
                cy={DISC_CENTER}
                r={radius}
                stroke={initialColors.trackStroke}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${arcTotal} ${circumference}`}
                strokeLinecap={effectiveLineCap}
              />

              {/* 前景激活填充弧：0ms 瞬时响应，颜色随分段实时变化 */}
              <circle
                ref={arcCircleRef}
                cx={DISC_CENTER}
                cy={DISC_CENTER}
                r={radius}
                stroke={initialColors.arcStroke}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${initialActiveArcLen} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap={effectiveLineCap}
                style={{
                  opacity: effectiveAmount <= 0 ? 0 : 1,
                  transition: 'stroke 80ms ease',
                }}
              />
            </svg>

            {/* 表盘中央纯净数字读数与 BOOST 标签：严格等宽字体 */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ fontFamily: MONO_FONT_FAMILY }}
            >
              <span
                ref={readoutSpanRef}
                className="text-4xl font-black tracking-tighter tabular-nums transition-colors leading-none"
                style={{
                  color: initialColors.readoutColor,
                  fontFamily: MONO_FONT_FAMILY,
                  WebkitTextStroke:
                    colorMode === 'inverted' ? '1px rgba(0,0,0,0.35)' : undefined,
                }}
              >
                {isUnlimited ? '--' : clampedAmount}
              </span>

              <span
                ref={labelSpanRef}
                className="text-[10px] font-bold tracking-widest uppercase mt-1"
                style={{
                  color: initialColors.labelColor,
                  fontFamily: MONO_FONT_FAMILY,
                }}
              >
                BOOST
              </span>
            </div>
          </div>
        </div>
      );
    }
  )
);

CircularBoostGauge.displayName = 'CircularBoostGauge';

