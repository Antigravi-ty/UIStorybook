import React from 'react';
import { VStack } from '../../../layout/VStack';
import { Badge } from '../../../primitives/Badge';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { SettingSliderRow } from '../components/SettingSliderRow';
import { SettingSegmentedRow } from '../components/SettingSegmentedRow';
import { SettingToggleRow } from '../components/SettingToggleRow';

export interface VideoTabProps {
  bgRenderDisabled: boolean;
  onChangeBgRenderDisabled: (val: boolean) => void;
  renderScale: number;
  onChangeRenderScale: (val: number) => void;
  fpsLimit: string;
  onChangeFpsLimit: (val: string) => void;
  vsync: boolean;
  onChangeVsync: (val: boolean) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const VideoTab: React.FC<VideoTabProps> = ({
  bgRenderDisabled,
  onChangeBgRenderDisabled,
  renderScale,
  onChangeRenderScale,
  fpsLimit,
  onChangeFpsLimit,
  vsync,
  onChangeVsync,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      <div
        onMouseEnter={() => onHover('Pauses 3D scene rendering when menus are open to save GPU power and reduce heat.')}
        onMouseLeave={onLeave}
        className={`p-4 rounded-xl border flex flex-col gap-3 ${
          isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-amber-500">
                Background Render Pause
              </span>
              <Badge variant="amber" size="sm" isLight={isLight}>
                Instant FPS Saver
              </Badge>
            </div>
            <span className={`text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              Suspends Three.js canvas tick during active menu overlays.
            </span>
          </div>
          <ToggleSwitch
            checked={bgRenderDisabled}
            onCheckedChange={onChangeBgRenderDisabled}
            variant="neutral"
            isLight={isLight}
          />
        </div>
      </div>

      <SettingSliderRow
        label="Render Scale"
        value={renderScale}
        min={50}
        max={150}
        step={5}
        unit="%"
        onChange={onChangeRenderScale}
        onHover={() => onHover('Adjusts internal 3D canvas physical pixel sampling scale (50% - 150%).')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingSegmentedRow
        label="Max Framerate Limit"
        value={fpsLimit}
        onChange={onChangeFpsLimit}
        options={[
          { value: '60', label: '60' },
          { value: '120', label: '120' },
          { value: '144', label: '144' },
          { value: 'max', label: 'MAX' },
        ]}
        onHover={() => onHover('Limits maximum frame update rate of the render loop.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingToggleRow
        label="Vertical Sync (VSync)"
        checked={vsync}
        onChange={onChangeVsync}
        onHover={() => onHover('Synchronizes frame rate with monitor physical scan line to prevent tearing.')}
        onLeave={onLeave}
        isLight={isLight}
      />
    </VStack>
  );
};
