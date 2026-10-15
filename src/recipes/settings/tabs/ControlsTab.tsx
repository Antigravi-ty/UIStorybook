import React from 'react';
import { KeybindingRecipe } from '../../KeybindingRecipe';

export interface ControlsTabProps {
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const ControlsTab: React.FC<ControlsTabProps> = ({
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200 dark:border-neutral-800"
        onMouseEnter={() => onHover('Configure key bindings for keyboard and gamepad inputs.')}
        onMouseLeave={onLeave}
      >
        <span className={`font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
          Keyboard & Controller Remapping
        </span>
        <span className="text-[11px] font-mono opacity-70">Unified Controls Layer</span>
      </div>
      <KeybindingRecipe isLight={isLight} />
    </div>
  );
};
