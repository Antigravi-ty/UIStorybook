import React, { useState } from 'react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { SliderControl } from '../primitives/SliderControl';
import { ToggleSwitch } from '../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../primitives/SegmentedSwitch';
import { Badge } from '../primitives/Badge';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { Card } from '../layout/Card';
import { VStack } from '../layout/VStack';
import { 
  Activity, 
  Eye, 
  Sparkles, 
  Info 
} from 'lucide-react';

export interface Layer3BallTrajectoryRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  onCollapsePreview?: () => void;
  transparent?: boolean;
}

/**
 * [Recipe] Layer 3 Ball Trajectory Predictor Configuration Panel (Width: 480px)
 * Supports Live Preview with Tab key collapse/expand.
 * Tuning parameters:
 * - Trajectory Draw Duration (0.5s - 5.0s)
 * - Trajectory Glow Color (Warm Amber / Monochrome / Apple Green / Neon Cyan)
 * - Bounce Impact Rings
 * - Magnus Spin Vector Visualizer
 * - Real-time Sub-Tick Precision
 */
export const Layer3BallTrajectoryRecipe: React.FC<Layer3BallTrajectoryRecipeProps> = ({
  isLight = false,
  onBack,
  onCollapsePreview,
  transparent = false,
}) => {
  // Trajectory Prediction Parameters
  const [trajectoryDuration, setTrajectoryDuration] = useState(2.5);
  const [renderColor, setRenderColor] = useState('amber');
  const [showBounceMarkers, setShowBounceMarkers] = useState(true);
  const [showSpinVector, setShowSpinVector] = useState(true);
  const [decayFade, setDecayFade] = useState(true);
  const [subTickPrecision, setSubTickPrecision] = useState('high');

  // Dynamic hover description for footer
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  return (
    <PanelContainer isLight={isLight} transparent={transparent} className="w-full max-w-[480px]">
      <PanelHeader
        title="BALL TRAJECTORY PREDICTOR"
        subtitle="Live Preview Ready • Tab to Collapse/Expand"
        badge={
          <Badge variant="amber" size="sm" isLight={isLight}>
            LIVE PREVIEW
          </Badge>
        }
        onBack={onBack}
        isLight={isLight}
        rightElement={
          <button
            type="button"
            onClick={onCollapsePreview}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
            }`}
            title="Press TAB or click to collapse to side dock"
          >
            <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
            <span className="hidden sm:inline">Live Mode</span>
          </button>
        }
      />

      <PanelContent scrollable className="p-6">
        <VStack gap="lg" isLight={isLight}>
          {/* Live Preview Notification Pill */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              isLight
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Press <strong>TAB</strong> to collapse panel to sidebar and resume game background</span>
            </div>
            <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
          </div>

          {/* 1. Trajectory Draw Duration */}
          <div
            onMouseEnter={() => setHoveredDesc('Forward simulation window for ball trajectory visualization in seconds.')}
            onMouseLeave={() => setHoveredDesc(null)}
          >
            <SliderControl
              label="Trajectory Horizon"
              value={trajectoryDuration}
              min={0.5}
              max={5.0}
              step={0.1}
              unit="s"
              onChange={setTrajectoryDuration}
              colorScheme="amber"
              isLight={isLight}
            />
          </div>

          {/* 2. Color Scheme Selector */}
          <div
            className="flex flex-col gap-1.5"
            onMouseEnter={() => setHoveredDesc('Selects visual theme for the predictive trajectory ribbon in 3D arena.')}
            onMouseLeave={() => setHoveredDesc(null)}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                Trajectory Glow Color
              </span>
              <span className="text-[11px] font-mono text-neutral-400">Neutral & Soft</span>
            </div>
            <SegmentedSwitch
              value={renderColor}
              onValueChange={setRenderColor}
              isLight={isLight}
              options={[
                { value: 'amber', label: 'Warm Amber' },
                { value: 'white', label: 'Monochrome' },
                { value: 'green', label: 'Apple Green' },
                { value: 'cyan', label: 'Neon Cyan' },
              ]}
            />
          </div>

          {/* 3. Bounce Markers & Spin Simulation */}
          <Card isLight={isLight} variant="outlined" className="p-4 flex flex-col gap-3">
            <span className="text-xs font-bold tracking-tight mb-1 text-neutral-300">Physics Markers & Assistance</span>
            
            <div
              onMouseEnter={() => setHoveredDesc('Renders projected ground impact and goal frame bounce prediction rings.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="Bounce Impact Rings"
                checked={showBounceMarkers}
                onCheckedChange={setShowBounceMarkers}
                variant="neutral"
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Visualizes aerodynamic Magnus spin vector and curvature offset.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="Magnus Spin Vector"
                checked={showSpinVector}
                onCheckedChange={setShowSpinVector}
                variant="neutral"
                isLight={isLight}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredDesc('Fades alpha at the far end of the flight path to prevent visual clutter.')}
              onMouseLeave={() => setHoveredDesc(null)}
            >
              <ToggleSwitch
                label="Decay Fade-Out"
                checked={decayFade}
                onCheckedChange={setDecayFade}
                variant="neutral"
                isLight={isLight}
              />
            </div>
          </Card>

          {/* 4. Sub-Tick Precision */}
          <div
            className="flex flex-col gap-1.5"
            onMouseEnter={() => setHoveredDesc('Sub-tick physics steps for high-frequency trajectory integration.')}
            onMouseLeave={() => setHoveredDesc(null)}
          >
            <span className={`text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
              Physics Solver Steps
            </span>
            <SegmentedSwitch
              value={subTickPrecision}
              onValueChange={setSubTickPrecision}
              isLight={isLight}
              options={[
                { value: 'standard', label: '60Hz Standard' },
                { value: 'high', label: '120Hz Sub-Tick' },
                { value: 'simd', label: '240Hz WASM SIMD' },
              ]}
            />
          </div>
        </VStack>
      </PanelContent>

      <PanelFooter hint="TAB to Preview" isLight={isLight}>
        <div className="flex items-center gap-2 w-full text-xs truncate">
          <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className={`truncate transition-colors duration-150 ${
            hoveredDesc
              ? (isLight ? 'text-neutral-900' : 'text-neutral-100')
              : (isLight ? 'text-neutral-400' : 'text-neutral-500')
          }`}>
            {hoveredDesc || `Calculated: ${trajectoryDuration.toFixed(1)}s Horizon`}
          </span>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
};
