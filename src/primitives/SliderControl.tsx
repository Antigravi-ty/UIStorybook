import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Minus, Plus } from 'lucide-react';

export type SliderColorScheme = 'neutral' | 'amber' | 'orange' | 'sky' | 'emerald';
export type SliderVariation = 'default' | 'centered';

export interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  description?: string;
  showStepper?: boolean;
  isLight?: boolean;
  disabled?: boolean;
  /**
   * Color scheme for the slider active range track.
   * Defaults to 'neutral' (monochrome black/white, zero saturation), avoiding harsh blue.
   */
  colorScheme?: SliderColorScheme;
  /**
   * Slider variation mode:
   * - 'default': fills continuously from the minimum left edge to the current value.
   * - 'centered': fills bi-directionally (leftward or rightward) from a reference origin point (e.g. 0 for positive/negative values).
   */
  variation?: SliderVariation;
  /**
   * Alias for `variation`.
   */
  variant?: SliderVariation;
  /**
   * Reference origin point for the 'centered' variation.
   * Defaults to 0 (or `(min + max) / 2` if 0 is out of bounds).
   */
  origin?: number;
  /**
   * Whether to render a subtle vertical tick/notch at the origin position.
   * Defaults to true in 'centered' mode.
   */
  showOriginIndicator?: boolean;
  /**
   * Custom formatter for displaying the current value badge.
   */
  formatValue?: (val: number) => string;
  /**
   * Whether to prefix positive values with a '+' sign in the readout badge (e.g. +20).
   */
  showSign?: boolean;
  className?: string;
}

/**
 * SliderControl
 * Radix Slider primitive wrapped with SimpleUI tactile ergonomics:
 * - Direct value readout badge (supports sign prefix and custom formatters)
 * - Stepper buttons (- / +)
 * - Highly neutral zero-saturation black & white track theme by default (avoiding blue)
 * - Bi-directional origin-based filling for centered / bipolar positive & negative values
 * - Accessible keyboard navigation & focus states
 */
export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description,
  showStepper = true,
  isLight,
  disabled = false,
  colorScheme = 'neutral',
  variation,
  variant,
  origin,
  showOriginIndicator,
  formatValue,
  showSign = false,
  className = '',
}) => {
  // Automatically resolve light mode from prop or document element
  const resolvedIsLight =
    isLight !== undefined
      ? isLight
      : typeof document !== 'undefined'
      ? document.documentElement.classList.contains('light') || document.documentElement.dataset.theme === 'light'
      : false;

  // Resolve effective variation mode and reference origin
  const resolvedVariation: SliderVariation =
    variation ?? variant ?? (origin !== undefined ? 'centered' : 'default');

  const resolvedOrigin =
    origin !== undefined
      ? origin
      : min <= 0 && max >= 0
      ? 0
      : (min + max) / 2;

  const clampedOrigin = Math.max(min, Math.min(max, resolvedOrigin));
  const clampedValue = Math.max(min, Math.min(max, value));
  const totalRange = max - min;
  const originPct = totalRange > 0 ? ((clampedOrigin - min) / totalRange) * 100 : 50;
  const valuePct = totalRange > 0 ? ((clampedValue - min) / totalRange) * 100 : 50;

  const fillLeft = Math.min(originPct, valuePct);
  const fillWidth = Math.abs(valuePct - originPct);
  const shouldShowOrigin = showOriginIndicator ?? (resolvedVariation === 'centered');

  const stepDecimals = step.toString().split('.')[1]?.length || 0;
  const precisionFactor = Math.pow(10, Math.max(2, stepDecimals));

  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * precisionFactor) / precisionFactor);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * precisionFactor) / precisionFactor);
    onChange(next);
  };

  // Format readout badge value
  const displayValue = () => {
    if (formatValue) return formatValue(value);
    if (showSign && value > 0) return `+${value}`;
    return `${value}`;
  };

  // Resolve track active range color
  const getRangeColorClass = () => {
    if (colorScheme === 'amber') return 'bg-amber-500';
    if (colorScheme === 'orange') return 'bg-orange-500';
    if (colorScheme === 'sky') return 'bg-sky-500';
    if (colorScheme === 'emerald') return 'bg-emerald-500';
    // 'neutral' (default monochrome black-and-white scheme)
    return resolvedIsLight ? 'bg-neutral-900' : 'bg-white';
  };

  return (
    <div
      data-component="slider-control"
      className={`flex flex-col gap-2 w-full select-none ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${resolvedIsLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
          {label}
        </span>
        <span
          className={`font-mono text-[11px] px-2 py-0.5 rounded border transition-colors ${
            resolvedIsLight
              ? 'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-2xs'
              : 'bg-neutral-900 text-neutral-300 border-neutral-700'
          }`}
        >
          {displayValue()}
          {unit}
        </span>
      </div>

      {description && (
        <span className={`text-[11px] ${resolvedIsLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          {description}
        </span>
      )}

      <div className="flex items-center gap-3">
        {showStepper && (
          <button
            type="button"
            aria-label="Decrement"
            onClick={handleDecrement}
            className={`inline-flex items-center justify-center h-7 w-7 rounded-lg border transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 ${
              resolvedIsLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
            }`}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        )}

        <SliderPrimitive.Root
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onChange(vals[0])}
          className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
        >
          <SliderPrimitive.Track
            className={`relative grow rounded-full h-2 overflow-hidden transition-colors ${
              resolvedIsLight ? 'bg-neutral-200' : 'bg-neutral-800'
            }`}
          >
            {resolvedVariation === 'centered' ? (
              <>
                {shouldShowOrigin && (
                  <div
                    className={`absolute top-0 bottom-0 w-0.5 -translate-x-1/2 z-1 pointer-events-none transition-colors ${
                      resolvedIsLight ? 'bg-neutral-400' : 'bg-neutral-600'
                    }`}
                    style={{ left: `${originPct}%` }}
                  />
                )}
                <div
                  className={`absolute h-full rounded-full transition-colors ${getRangeColorClass()}`}
                  style={{
                    left: `${fillLeft}%`,
                    width: `${fillWidth}%`,
                  }}
                />
              </>
            ) : (
              <SliderPrimitive.Range className={`absolute h-full rounded-full transition-colors ${getRangeColorClass()}`} />
            )}
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={`block h-4 w-4 rounded-full border shadow-sm transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 ${
              resolvedIsLight ? 'bg-white border-neutral-400 shadow-xs' : 'bg-neutral-100 border-neutral-300'
            }`}
          />
        </SliderPrimitive.Root>

        {showStepper && (
          <button
            type="button"
            aria-label="Increment"
            onClick={handleIncrement}
            className={`inline-flex items-center justify-center h-7 w-7 rounded-lg border transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 ${
              resolvedIsLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
