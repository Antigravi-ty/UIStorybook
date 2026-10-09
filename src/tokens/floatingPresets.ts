export interface PresetConfig {
  id: string;
  title: string;
  category: string;
  width: number;
  height: number;
  resizable: boolean;
  singleton?: boolean;
}

export const PRESET_WINDOWS: PresetConfig[] = [
  {
    id: 'simd-short',
    title: '1',
    category: 'Kernel',
    width: 320,
    height: 220,
    resizable: false,
    singleton: true,
  },
  {
    id: 'pid-short-resizable',
    title: '1 (Resizable)',
    category: 'Diagnostic',
    width: 360,
    height: 240,
    resizable: true,
    singleton: false,
  },
  {
    id: 'telemetry-long',
    title: 'Diagnostic Telemetry & Real-Time Engine Spectrogram Stream',
    category: 'Hitbox',
    width: 480,
    height: 280,
    resizable: false,
    singleton: true,
  },
  {
    id: 'aero-long-resizable',
    title: 'Advanced Aerodynamic Downforce Vector Matrix Calibration (Resizable)',
    category: 'Diagnostic',
    width: 500,
    height: 320,
    resizable: true,
    singleton: false,
  },
];
