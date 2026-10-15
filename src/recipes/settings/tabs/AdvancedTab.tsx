import React from 'react';
import { VStack } from '../../../layout/VStack';
import { Badge } from '../../../primitives/Badge';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { FloatingWindowCard, type DiagnosticWindowPayload } from '../components/FloatingWindowCard';

export interface AdvancedTabProps {
  developerUnlocked: boolean;
  onChangeDeveloperUnlocked: (val: boolean) => void;
  onSpawnDiagnosticWindow?: (window: DiagnosticWindowPayload) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({
  developerUnlocked,
  onChangeDeveloperUnlocked,
  onSpawnDiagnosticWindow,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      <div
        onMouseEnter={() => onHover('Unlocks Developer tab for physics wireframe and SIMD profiler.')}
        onMouseLeave={onLeave}
        className={`p-4 rounded-xl border flex items-center justify-between ${
          developerUnlocked
            ? isLight
              ? 'bg-red-50/70 border-red-200'
              : 'bg-red-950/20 border-red-800/60'
            : isLight
            ? 'bg-neutral-50 border-neutral-200'
            : 'bg-neutral-850 border-neutral-700/80'
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-red-500">
              Enable Developer Settings
            </span>
            <Badge variant="danger" size="sm" isLight={isLight}>
              Diagnostics
            </Badge>
          </div>
          <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            Unlocks Developer tab for internal physics pipeline and WASM telemetry.
          </span>
        </div>

        <ToggleSwitch
          checked={developerUnlocked}
          onCheckedChange={onChangeDeveloperUnlocked}
          variant="neutral"
          isLight={isLight}
        />
      </div>

      {/* Diagnostic Floating Window (F10) Spawner */}
      <FloatingWindowCard
        onSpawnDiagnosticWindow={onSpawnDiagnosticWindow}
        onHover={onHover}
        onLeave={onLeave}
        isLight={isLight}
      />
    </VStack>
  );
};
