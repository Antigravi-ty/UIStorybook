import React, { useState } from 'react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { SliderControl } from '../primitives/SliderControl';
import { ToggleSwitch } from '../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../primitives/SegmentedSwitch';
import { Badge } from '../primitives/Badge';
import { InlineErrorNotice } from '../primitives/InlineErrorNotice';
import { Card } from '../layout/Card';
import { useMenuLayoutStore } from '../tokens';
import { Sliders, Info } from 'lucide-react';

export interface Layer3AudioDetailRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  /** Optional explicit inline error visibility override (defaults to L0 menuLayoutStore.simulateLayer3Error) */
  hasError?: boolean;
  onCheckNotification?: () => void;
}

/**
 * [Recipe] Layer 3 Audio Equalizer & Detailed Acoustics
 * Layer 3 Sub-Menu: 3-Band Parametric Equalizer & DSP Acoustics Console (Width: 480px, Height: 540px).
 * Supports Apple HIG adaptive vertical spacing when a single-line InlineErrorNotice appears,
 * keeping the outer container 100% fixed without leaving blank bottom space in normal mode.
 */
export const Layer3AudioDetailRecipe: React.FC<Layer3AudioDetailRecipeProps> = ({
  isLight = false,
  onBack,
  hasError: propHasError,
  onCheckNotification,
}) => {
  const { layer3Width, layer3Height, simulateLayer3Error } = useMenuLayoutStore();
  const showError = propHasError ?? simulateLayer3Error;

  const [spatialAudio, setSpatialAudio] = useState(true);
  const [compressionMode, setCompressionMode] = useState('dynamic');
  const [lows, setLows] = useState(65);
  const [mids, setMids] = useState(50);
  const [highs, setHighs] = useState(58);

  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  return (
    <PanelContainer isLight={isLight} width={layer3Width} height={layer3Height} className="w-full">
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

      {/* Apple HIG Adaptive Density:
          - Normal state (!showError): generous py-5 gap-4, zero blank hole at bottom.
          - Error state (showError): compresses to py-3 gap-2.5 to absorb the 32px single-line InlineErrorNotice without resizing container or forcing scrollbar, with scrollable={true} as safety fallback.
      */}
      <PanelContent
        scrollable={true}
        className={`flex flex-col px-6 transition-all duration-150 ${
          showError ? 'py-3 gap-2.5' : 'py-5 gap-4'
        }`}
      >
        <InlineErrorNotice
          visible={showError}
          isLight={isLight}
          onCheckNotification={onCheckNotification}
        />

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
        <Card
          isLight={isLight}
          variant="outlined"
          className={`flex flex-col transition-all duration-150 ${
            showError ? 'p-3 gap-2' : 'p-4 gap-3'
          }`}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <Sliders className="h-4 w-4 text-amber-500" />
            <span className={`text-xs font-bold tracking-tight ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              3-Band Acoustic EQ
            </span>
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
          className={showError ? 'p-2.5' : 'p-3'}
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
