import React from 'react';
import { ArrowRight, Target } from 'lucide-react';
import { VStack } from '../../../layout/VStack';
import { Badge } from '../../../primitives/Badge';
import { SettingToggleRow } from '../components/SettingToggleRow';

export interface GameplayTabProps {
  ballCamIndicator: boolean;
  onChangeBallCamIndicator: (val: boolean) => void;
  highTickrate: boolean;
  onChangeHighTickrate: (val: boolean) => void;
  onNavigateTrajectoryDetail?: () => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const GameplayTab: React.FC<GameplayTabProps> = ({
  ballCamIndicator,
  onChangeBallCamIndicator,
  highTickrate,
  onChangeHighTickrate,
  onNavigateTrajectoryDetail,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      <SettingToggleRow
        label="Ball Cam Indicator"
        checked={ballCamIndicator}
        onChange={onChangeBallCamIndicator}
        onHover={() => onHover('Displays a directional indicator on screen tracking the ball position.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingToggleRow
        label="120Hz Sub-Tick Simulation"
        checked={highTickrate}
        onChange={onChangeHighTickrate}
        onHover={() => onHover('Enables 120Hz sub-tick physics simulation with SIMD acceleration.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      {/* Layer 3 Trajectory Predictor Entrance */}
      <div
        onMouseEnter={() => onHover('Configure trajectory prediction duration, bounce rings and Magnus spin vector.')}
        onMouseLeave={onLeave}
        className={`mt-2 p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
          isLight ? 'bg-amber-50/60 border-amber-200/90' : 'bg-amber-950/20 border-amber-900/50'
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
              Ball Trajectory Predictor
            </span>
            <Badge variant="warning" size="sm" isLight={isLight}>
              Layer 3 · Live Preview
            </Badge>
          </div>
          <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            Predictive flight path duration, bounce rings and aerodynamics.
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTrajectoryDetail?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-xs cursor-pointer transition-colors shrink-0 ml-3"
        >
          <span>Configure</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </VStack>
  );
};
