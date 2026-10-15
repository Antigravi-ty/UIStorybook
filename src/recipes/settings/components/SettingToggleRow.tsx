import React from 'react';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';

export interface SettingToggleRowProps {
  label: string;
  subtitle?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onHover?: () => void;
  onLeave?: () => void;
  isLight?: boolean;
}

export const SettingToggleRow: React.FC<SettingToggleRowProps> = ({
  label,
  subtitle,
  checked,
  onChange,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <div onMouseEnter={onHover} onMouseLeave={onLeave}>
      <ToggleSwitch
        label={label}
        description={subtitle}
        checked={checked}
        onCheckedChange={onChange}
        isLight={isLight}
        variant="neutral"
      />
    </div>
  );
};
