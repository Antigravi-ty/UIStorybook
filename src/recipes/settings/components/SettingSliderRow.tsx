import React from 'react';
import { SliderControl } from '../../../primitives/SliderControl';

export interface SettingSliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (val: number) => void;
  onHover?: () => void;
  onLeave?: () => void;
  isLight?: boolean;
}

export const SettingSliderRow: React.FC<SettingSliderRowProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  disabled = false,
  onChange,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <div onMouseEnter={onHover} onMouseLeave={onLeave}>
      <SliderControl
        label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        unit={unit}
        disabled={disabled}
        onChange={onChange}
        isLight={isLight}
      />
    </div>
  );
};
