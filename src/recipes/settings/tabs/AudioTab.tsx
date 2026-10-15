import React from 'react';
import { ArrowRight } from 'lucide-react';
import { VStack } from '../../../layout/VStack';
import { Badge } from '../../../primitives/Badge';
import { SettingSliderRow } from '../components/SettingSliderRow';

export interface AudioTabProps {
  masterVol: number;
  onChangeMasterVol: (val: number) => void;
  sfxVol: number;
  onChangeSfxVol: (val: number) => void;
  ambientVol: number;
  onChangeAmbientVol: (val: number) => void;
  onNavigateAudioDetail?: () => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const AudioTab: React.FC<AudioTabProps> = ({
  masterVol,
  onChangeMasterVol,
  sfxVol,
  onChangeSfxVol,
  ambientVol,
  onChangeAmbientVol,
  onNavigateAudioDetail,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      <SettingSliderRow
        label="Master Volume"
        value={masterVol}
        min={0}
        max={100}
        step={5}
        unit="%"
        onChange={onChangeMasterVol}
        onHover={() => onHover('Controls master output level across all game audio channels.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingSliderRow
        label="SFX & Engine Audio"
        value={sfxVol}
        min={0}
        max={100}
        step={5}
        unit="%"
        onChange={onChangeSfxVol}
        onHover={() => onHover('Adjusts vehicle combustion, tire skid and supersonic shockwave audio.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingSliderRow
        label="Ambient & Crowd Reverb"
        value={ambientVol}
        min={0}
        max={100}
        step={5}
        unit="%"
        onChange={onChangeAmbientVol}
        onHover={() => onHover('Controls stadium crowd reverberation and arena ambient acoustics.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      {/* Layer 3 Sub-Menu Entrance */}
      <div
        onMouseEnter={() => onHover('Opens dedicated 480px 3-band parametric equalizer and HRTF spatial audio console.')}
        onMouseLeave={onLeave}
        className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
          isLight ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
              Acoustics & Equalizer
            </span>
            <Badge variant="primary" size="sm" isLight={isLight}>
              Layer 3
            </Badge>
          </div>
          <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Advanced 3-Band Parametric EQ & HRTF Spatial Audio Console.
          </span>
        </div>

        {onNavigateAudioDetail && (
          <button
            type="button"
            onClick={onNavigateAudioDetail}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs border border-amber-500 transition-all cursor-pointer"
          >
            <span>Open EQ</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </VStack>
  );
};
