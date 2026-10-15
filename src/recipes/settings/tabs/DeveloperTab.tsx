import React from 'react';
import { VStack } from '../../../layout/VStack';
import { SettingToggleRow } from '../components/SettingToggleRow';

export interface DeveloperTabProps {
  showWireframe: boolean;
  onChangeShowWireframe: (val: boolean) => void;
  wasmProfiling: boolean;
  onChangeWasmProfiling: (val: boolean) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const DeveloperTab: React.FC<DeveloperTabProps> = ({
  showWireframe,
  onChangeShowWireframe,
  wasmProfiling,
  onChangeWasmProfiling,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      <div className={`p-3 rounded-lg border text-xs ${
        isLight ? 'bg-red-50 text-red-900 border-red-200' : 'bg-red-950/30 text-red-300 border-red-800/80'
      }`}>
        Developer Mode Active: options below are intended for kernel tuning.
      </div>

      <SettingToggleRow
        label="Physics Wireframe Overlay"
        checked={showWireframe}
        onChange={onChangeShowWireframe}
        onHover={() => onHover('Renders vehicle OBB and sphere collision bounding meshes.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingToggleRow
        label="WASM SIMD Profiler"
        checked={wasmProfiling}
        onChange={onChangeWasmProfiling}
        onHover={() => onHover('Displays real-time sub-tick execution latency and WASM SIMD performance on HUD.')}
        onLeave={onLeave}
        isLight={isLight}
      />
    </VStack>
  );
};
