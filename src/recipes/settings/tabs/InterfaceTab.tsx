import React from 'react';
import { VStack } from '../../../layout/VStack';
import { SettingSliderRow } from '../components/SettingSliderRow';

export interface InterfaceTabProps {
  hudScale: number;
  onChangeHudScale: (val: number) => void;
  nameplateScale: number;
  onChangeNameplateScale: (val: number) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const InterfaceTab: React.FC<InterfaceTabProps> = ({
  hudScale,
  onChangeHudScale,
  nameplateScale,
  onChangeNameplateScale,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      <SettingSliderRow
        label="HUD Scale"
        value={hudScale}
        min={70}
        max={130}
        step={5}
        unit="%"
        onChange={onChangeHudScale}
        onHover={() => onHover('Adjusts overall scaling of the HUD match scoreboard, boost gauge and speedometer.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingSliderRow
        label="Nameplate Scale"
        value={nameplateScale}
        min={70}
        max={130}
        step={5}
        unit="%"
        onChange={onChangeNameplateScale}
        onHover={() => onHover('Scales overhead player nametags and distance markers in the 3D viewport.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <div
        onMouseEnter={() => onHover('Safe Area margin compensates for display bezel cutouts (-5% to +10%).')}
        onMouseLeave={onLeave}
        className={`p-4 rounded-xl border text-xs leading-relaxed ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
        }`}
      >
        <span className="font-bold block mb-1">Safe Area Margin Configuration:</span>
        <span className="opacity-80">
          Supports global -5% to +10% viewport adaptation, configurable via the top telemetry controls.
        </span>
      </div>
    </VStack>
  );
};
