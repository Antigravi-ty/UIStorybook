import React, { useState } from 'react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { SliderControl } from '../primitives/SliderControl';
import { ToggleSwitch } from '../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../primitives/SegmentedSwitch';
import { Badge } from '../primitives/Badge';
import { Card } from '../layout/Card';
import { Volume2, Sliders, Waves, Sparkles, Info } from 'lucide-react';

export interface Layer3AudioDetailRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
}

/**
 * [Recipe] Layer 3 Audio Equalizer & Detailed Acoustics
 * Layer 3 Sub-Menu: 3-Band Parametric Equalizer & DSP Acoustics Console (Width: 480px).
 */
export const Layer3AudioDetailRecipe: React.FC<Layer3AudioDetailRecipeProps> = ({
  isLight = false,
  onBack,
}) => {
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [compressionMode, setCompressionMode] = useState('dynamic');
  const [lows, setLows] = useState(65);
  const [mids, setMids] = useState(50);
  const [highs, setHighs] = useState(58);

  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  return (
    <PanelContainer isLight={isLight} className="w-full max-w-[480px]">
      <PanelHeader
        title="ACOUSTICS & EQUALIZER"
        subtitle="Layer 3 Sub-Menu • 32-bit DSP Engine"
        onBack={onBack}
        badge={
          <Badge variant="primary" size="sm" isLight={isLight}>
            DSP ACTIVE
          </Badge>
        }
        isLight={isLight}
      />

      <PanelContent scrollable={true} className="flex flex-col gap-4">
        {/* Dynamic Range Switcher */}
        <div
          className="flex flex-col gap-1.5"
          onMouseEnter={() => setHoveredDesc('Dynamic range compression profile for headphone and speaker acoustics.')}
          onMouseLeave={() => setHoveredDesc(null)}
        >
          <label className={`text-xs font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
            Dynamic Range Profile
          </label>
          <SegmentedSwitch
            options={[
              { value: 'compressed', label: 'Night (Compressed)' },
              { value: 'dynamic', label: 'Dynamic (Full)' },
              { value: 'monitor', label: 'Studio Monitor' },
            ]}
            value={compressionMode}
            onValueChange={setCompressionMode}
            isLight={isLight}
          />
        </div>

        {/* 3-Band Equalizer Sliders */}
        <Card isLight={isLight} variant="outlined" className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold tracking-tight text-neutral-300">3-Band Acoustic EQ</span>
          </div>

          <div
            onMouseEnter={() => setHoveredDesc('Low-frequency bass shelf (100Hz) for engine roar and stadium sub-bass.')}
            onMouseLeave={() => setHoveredDesc(null)}
          >
            <SliderControl
              label="Bass (100Hz)"
              value={lows}
              onChange={setLows}
              min={0}
              max={100}
              unit="%"
              isLight={isLight}
            />
          </div>

          <div
            onMouseEnter={() => setHoveredDesc('Midrange band (1kHz) for ball impact snap and announcer clarity.')}
            onMouseLeave={() => setHoveredDesc(null)}
          >
            <SliderControl
              label="Midrange (1kHz)"
              value={mids}
              onChange={setMids}
              min={0}
              max={100}
              unit="%"
              isLight={isLight}
            />
          </div>

          <div
            onMouseEnter={() => setHoveredDesc('High-frequency presence (10kHz) for tire skids and boost hiss.')}
            onMouseLeave={() => setHoveredDesc(null)}
          >
            <SliderControl
              label="Treble (10kHz)"
              value={highs}
              onChange={setHighs}
              min={0}
              max={100}
              unit="%"
              isLight={isLight}
            />
          </div>
        </Card>

        {/* Spatial Audio Toggle */}
        <Card
          isLight={isLight}
          variant="flat"
          className="p-3"
          onMouseEnter={() => setHoveredDesc('Simulates HRTF 3D binaural spatialization for pin-point audio localization.')}
          onMouseLeave={() => setHoveredDesc(null)}
        >
          <ToggleSwitch
            checked={spatialAudio}
            onCheckedChange={setSpatialAudio}
            label="HRTF 3D Spatial Audio"
            variant="neutral"
            isLight={isLight}
          />
        </Card>
      </PanelContent>

      <PanelFooter isLight={isLight}>
        <div className="flex items-center gap-2 w-full text-xs truncate">
          <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className={`truncate transition-colors duration-150 ${
            hoveredDesc
              ? (isLight ? 'text-neutral-900' : 'text-neutral-100')
              : (isLight ? 'text-neutral-400' : 'text-neutral-500')
          }`}>
            {hoveredDesc || '7.1 Virtual Surround & 32-bit DSP Enabled'}
          </span>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
};
