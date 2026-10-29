import { create } from 'zustand';
import { syncBridge as crossClientSync } from './syncBridge';

export type CameraSettingsPresetId =
  | 'spine-aligned-default'
  | 'spine-hug-readout'
  | 'spine-centered-checkbox-cluster'
  | 'spine-detached-checkbox-card'
  | 'classic-settings-rows';

export type CameraReadoutContainerMode = 'uniform-longest' | 'hug-content' | 'plain-text';
export type CameraReadoutTextAlign = 'left' | 'center' | 'right';
export type CameraLabelTextAlign = 'right' | 'left';
export type CameraBooleanControlType = 'checkbox' | 'toggle-switch';
export type CameraCheckboxPlacement =
  | 'spine-left'
  | 'spine-center'
  | 'centered-cluster'
  | 'detached-card';
export type CameraCheckboxColorVariant = 'neutral' | 'amber' | 'orange' | 'sky' | 'emerald' | 'rose';
export type CameraCheckboxIconStyle = 'check' | 'bold-check' | 'dot' | 'minus';
export type CameraCheckboxAnimStyle = 'spring-scale' | 'crisp-fade' | 'bounce';
export type CameraSliderColorScheme = 'neutral' | 'amber' | 'orange' | 'sky' | 'emerald' | 'rose';

export type CameraResetButtonMode = 'big-button' | 'compact-row';
export type CameraResetButtonStyle =
  | 'danger-subtle'
  | 'danger-solid'
  | 'danger-outline'
  | 'neutral-hover-danger';
export type CameraResetButtonWidthMode = 'spine-width' | 'full-width' | 'centered-auto';
export type CameraResetConfirmMode = 'dialogue' | 'inline-two-step';

export interface CameraSettingsStyleConfig {
  /** Active preset identifier */
  preset: CameraSettingsPresetId;

  // ── 1. Spine Alignment & Form Centering ──
  /** Whether the entire [Label | Slider/Checkbox | Readout] spine block is horizontally centered in the panel */
  centerFormBlock: boolean;
  /** Manual horizontal fine-tuning offset in px when centering (default: 0) */
  formOffsetXPx: number;
  /** Vertical gap between rows in px (default: 2) */
  rowGapPx: number;
  /** Row vertical padding (top & bottom) in px (default: 6) */
  rowPaddingYPx: number;
  /** Row horizontal padding (left & right) in px (default: 10) */
  rowPaddingXPx: number;
  /** Row hover highlight border radius in px (default: 8) */
  rowBorderRadiusPx: number;
  /** Whether to show subtle row hover highlight background (default: true) */
  showRowHoverBg: boolean;
  /** Whether to render a vertical guide line along the left edge of the Slider spine for inspection (default: false) */
  showSpineGuideLine: boolean;

  // ── 2. Left Label Column (Right-Aligned to Slider Left Edge, Zero Leading Icon) ──
  /** Whether to show leading SVG icon before label text (default: false — no icon in front of text) */
  showRowIcon: boolean;
  /** Label text alignment relative to the Slider left edge ('right' = right-to-left against slider spine, 'left' = classic left edge) */
  labelTextAlign: CameraLabelTextAlign;
  /** Fixed width of the label column in px so all labels align cleanly on the spine (default: 152) */
  labelColumnWidthPx: number;
  /** Horizontal gap between right-aligned label text and the left edge of the Slider/Checkbox spine in px (default: 14) */
  labelToControlGapPx: number;
  /** Label font size in px (default: 13) */
  labelFontSizePx: number;
  /** Label font weight (default: 600) */
  labelFontWeight: number;

  // ── 3. Center Slider Spine (Equal Track Length) ──
  /** Exact equal width of all Slider progress tracks in px (default: 184) */
  sliderTrackWidthPx: number;
  /** Thickness of the Slider track bar in px (default: 6) */
  sliderTrackHeightPx: number;
  /** Diameter of the Slider thumb handle in px (default: 14) */
  sliderThumbSizePx: number;
  /** Active fill color scheme for Sliders (default: 'neutral') */
  sliderColorScheme: CameraSliderColorScheme;
  /** Whether to show - / + stepper buttons beside sliders (default: false) */
  sliderShowStepper: boolean;

  // ── 4. Right Value Readout Container (Left-Aligned Container & Left-to-Right Text) ──
  /** Horizontal gap between Slider right edge and Value Readout container left edge in px (default: 12) */
  controlToReadoutGapPx: number;
  /**
   * Readout container sizing & alignment mode:
   * - 'uniform-longest': All readout containers align their left edges AND stretch to match the longest readout container width; text inside is left-aligned.
   * - 'hug-content': All readout containers align their left edges right after the slider; each container hugs its own text width so longer numbers extend further right.
   * - 'plain-text': No container border/background box; numbers render directly left-aligned from left to right.
   */
  readoutContainerMode: CameraReadoutContainerMode;
  /** Text alignment inside the readout container ('left' = left-to-right display, 'center', 'right') */
  readoutTextAlign: CameraReadoutTextAlign;
  /** Minimum width of the readout column/container in px when 'uniform-longest' is active (default: 64) */
  readoutMinWidthPx: number;
  /** Readout font size in px (default: 12) */
  readoutFontSizePx: number;
  /** Readout horizontal padding in px (default: 8) */
  readoutPaddingXPx: number;
  /** Readout vertical padding in px (default: 2) */
  readoutPaddingYPx: number;
  /** Readout container border radius in px (default: 6) */
  readoutBorderRadiusPx: number;

  // ── 5. Checkbox Controls (Invert Swivel & Camera Shake) ──
  /** Control primitive used for Invert Swivel & Camera Shake ('checkbox' | 'toggle-switch', default: 'checkbox') */
  booleanControlType: CameraBooleanControlType;
  /**
   * How Checkbox items are positioned:
   * - 'spine-left': Label is right-aligned in the left column, Checkbox is left-aligned with the Slider's left edge in the middle spine.
   * - 'spine-center': Label is right-aligned in the left column, Checkbox is centered under the Slider track column.
   * - 'centered-cluster': Extracted as a special centered horizontal pair below the Sliders.
   * - 'detached-card': Extracted into a separate subtle card/group below the Sliders.
   */
  checkboxPlacement: CameraCheckboxPlacement;
  /** Extra top spacing above the Checkbox section in px (default: 4) */
  checkboxSectionTopGapPx: number;
  /** Checkbox square/squircle dimension in px (default: 18) */
  checkboxSizePx: number;
  /** Checkbox border radius in px (default: 5) */
  checkboxRadiusPx: number;
  /** Checkbox active color variant (default: 'amber') */
  checkboxVariant: CameraCheckboxColorVariant;
  /** Checkbox checkmark stroke width (default: 2.75) */
  checkboxStrokeWidth: number;
  /** Checkbox inner indicator style ('check' | 'bold-check' | 'dot' | 'minus') */
  checkboxIconStyle: CameraCheckboxIconStyle;
  /** Checkbox toggle animation style ('spring-scale' | 'crisp-fade' | 'bounce') */
  checkboxAnimationStyle: CameraCheckboxAnimStyle;
  /** High-contrast border when unchecked (default: false) */
  checkboxHighContrastUnchecked: boolean;
  /** Whether to show optional status text (e.g. "Enabled" / "Off") to the right of the checkbox (default: false) */
  checkboxShowStatusText: boolean;

  // ── 6. Big Reset Camera Defaults Button & Red Double-Check Dialogue ──
  /** Reset control presentation ('big-button' | 'compact-row', default: 'big-button') */
  resetButtonMode: CameraResetButtonMode;
  /** Visual color treatment for the big Reset button (default: 'danger-subtle') */
  resetButtonStyle: CameraResetButtonStyle;
  /** Horizontal width mode of the big Reset button ('spine-width' | 'full-width' | 'centered-auto', default: 'spine-width') */
  resetButtonWidthMode: CameraResetButtonWidthMode;
  /** Label text inside the big Reset button (default: 'Reset Camera Defaults') */
  resetButtonLabel: string;
  /** Whether to show the RotateCcw icon inside the big Reset button (default: true) */
  resetButtonShowIcon: boolean;
  /** Height of the big Reset button in px (default: 38) */
  resetButtonHeightPx: number;
  /** Font size of the big Reset button in px (default: 13) */
  resetButtonFontSizePx: number;
  /** Border radius of the big Reset button in px (default: 10) */
  resetButtonRadiusPx: number;
  /** Icon size inside the big Reset button in px (default: 15) */
  resetButtonIconSizePx: number;
  /** Top margin above the big Reset button in px (default: 10) */
  resetButtonTopMarginPx: number;
  /** Confirmation mechanism when clicking Reset ('dialogue' = red double-check Dialogue modal, 'inline-two-step' = inline button text change) */
  resetConfirmMode: CameraResetConfirmMode;
  /** Title of the double-check Dialogue modal (default: 'RESET CAMERA DEFAULTS') */
  resetDialogueTitle: string;
}

export const DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG: CameraSettingsStyleConfig = {
  preset: 'spine-aligned-default',

  // 1. Spine Alignment & Form Centering
  centerFormBlock: true,
  formOffsetXPx: 0,
  rowGapPx: 2,
  rowPaddingYPx: 6,
  rowPaddingXPx: 10,
  rowBorderRadiusPx: 8,
  showRowHoverBg: true,
  showSpineGuideLine: false,

  // 2. Left Label Column
  showRowIcon: false,
  labelTextAlign: 'right',
  labelColumnWidthPx: 152,
  labelToControlGapPx: 14,
  labelFontSizePx: 13,
  labelFontWeight: 600,

  // 3. Center Slider Spine
  sliderTrackWidthPx: 184,
  sliderTrackHeightPx: 6,
  sliderThumbSizePx: 14,
  sliderColorScheme: 'neutral',
  sliderShowStepper: false,

  // 4. Right Value Readout Container
  controlToReadoutGapPx: 12,
  readoutContainerMode: 'uniform-longest',
  readoutTextAlign: 'left',
  readoutMinWidthPx: 64,
  readoutFontSizePx: 12,
  readoutPaddingXPx: 8,
  readoutPaddingYPx: 2,
  readoutBorderRadiusPx: 6,

  // 5. Checkbox Controls
  booleanControlType: 'checkbox',
  checkboxPlacement: 'spine-left',
  checkboxSectionTopGapPx: 4,
  checkboxSizePx: 18,
  checkboxRadiusPx: 5,
  checkboxVariant: 'amber',
  checkboxStrokeWidth: 2.75,
  checkboxIconStyle: 'check',
  checkboxAnimationStyle: 'spring-scale',
  checkboxHighContrastUnchecked: false,
  checkboxShowStatusText: false,

  // 6. Big Reset Button & Red Double-Check Dialogue
  resetButtonMode: 'big-button',
  resetButtonStyle: 'danger-subtle',
  resetButtonWidthMode: 'spine-width',
  resetButtonLabel: 'Reset Camera Defaults',
  resetButtonShowIcon: true,
  resetButtonHeightPx: 38,
  resetButtonFontSizePx: 13,
  resetButtonRadiusPx: 10,
  resetButtonIconSizePx: 15,
  resetButtonTopMarginPx: 10,
  resetConfirmMode: 'dialogue',
  resetDialogueTitle: 'RESET CAMERA DEFAULTS',
};

export const CAMERA_SETTINGS_STYLE_PRESETS: Record<
  CameraSettingsPresetId,
  {
    id: CameraSettingsPresetId;
    label: string;
    shortLabel: string;
    description: string;
    patch: Partial<CameraSettingsStyleConfig>;
  }
> = {
  'spine-aligned-default': {
    id: 'spine-aligned-default',
    label: '方案 A (默认): 中轴对齐进度条 + 右对齐文本 + 等宽左对齐数值框 + 中轴 Checkbox + 底部红色弹窗大按钮',
    shortLabel: '中轴对齐 + 等宽左对齐数值 (默认)',
    description:
      '去除文本前方 Icon，文字从 Slider 左端往右对齐；所有 Slider 等长形成中轴分界线；右侧数值框左对齐且短框对齐长框宽度，框内数字从左往右显示；Invert Swivel / Camera Shake 采用 Checkbox 排在中轴；Reset 采用带 Icon 的红色大按钮并弹出 Dialogue 二次确认。',
    patch: {
      ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG,
      preset: 'spine-aligned-default',
    },
  },
  'spine-hug-readout': {
    id: 'spine-hug-readout',
    label: '方案 B: 中轴对齐进度条 + 自适应长短数值框 (长数字自然伸出) + 中轴 Checkbox',
    shortLabel: '中轴对齐 + 自适应长短数值框',
    description:
      '右侧数值框紧贴 Slider 右侧左对齐，但每个数值框宽度随自身字符长短自然伸缩（长的长出来、短的紧凑），文字依然从左往右左对齐。',
    patch: {
      ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG,
      preset: 'spine-hug-readout',
      readoutContainerMode: 'hug-content',
    },
  },
  'spine-centered-checkbox-cluster': {
    id: 'spine-centered-checkbox-cluster',
    label: '方案 C: 中轴对齐进度条 + 独立抽离居中双列 Checkbox 组合',
    shortLabel: '独立居中双列 Checkbox',
    description:
      '上方 7 条 Slider 保持严格中轴分界线，下方将 Invert Swivel 与 Camera Shake 单独抽离为居中并排的特殊 Checkbox 组合行。',
    patch: {
      ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG,
      preset: 'spine-centered-checkbox-cluster',
      checkboxPlacement: 'centered-cluster',
      checkboxSectionTopGapPx: 8,
    },
  },
  'spine-detached-checkbox-card': {
    id: 'spine-detached-checkbox-card',
    label: '方案 D: 中轴对齐进度条 + 独立分组卡片 Checkbox + 通栏红色 Reset 大按钮',
    shortLabel: '独立分组框 Checkbox + 通栏按钮',
    description:
      '将两个 Checkbox 抽离到带柔和边框的独立卡片区内，底部 Reset Camera Defaults 采用 100% 通栏红色大按钮。',
    patch: {
      ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG,
      preset: 'spine-detached-checkbox-card',
      checkboxPlacement: 'detached-card',
      checkboxSectionTopGapPx: 8,
      resetButtonWidthMode: 'full-width',
    },
  },
  'classic-settings-rows': {
    id: 'classic-settings-rows',
    label: '方案 E (传统对比): 传统左对齐带 Icon 行 + 右侧 ToggleSwitch',
    shortLabel: '传统左对齐带 Icon (对比)',
    description:
      '保留传统左对齐 Icon + 标题与右侧滑块/ToggleSwitch 布局，便于与新中轴对齐设计实时切换对比。',
    patch: {
      ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG,
      preset: 'classic-settings-rows',
      showRowIcon: true,
      labelTextAlign: 'left',
      labelColumnWidthPx: 185,
      readoutContainerMode: 'uniform-longest',
      readoutTextAlign: 'right',
      booleanControlType: 'toggle-switch',
      checkboxPlacement: 'spine-left',
      resetButtonMode: 'compact-row',
    },
  },
};

const STORAGE_KEY = 'ui-storybook-camera-settings-style-v1';
const SYNC_KEY = 'store:cameraSettingsStyle:v1';

const normalizeConfig = (
  raw?: Partial<CameraSettingsStyleConfig>
): CameraSettingsStyleConfig => ({
  ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG,
  ...(raw && typeof raw === 'object' ? raw : {}),
});

const loadSavedConfig = (): CameraSettingsStyleConfig => {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG };
    return normalizeConfig(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG };
  }
};

const saveConfig = (cfg: CameraSettingsStyleConfig) => {
  if (!crossClientSync.isApplyingRemote()) {
    crossClientSync.set(SYNC_KEY, cfg);
  }
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore storage errors
  }
};

const extractSnapshot = (s: CameraSettingsStyleConfig): CameraSettingsStyleConfig => ({
  preset: s.preset,
  centerFormBlock: s.centerFormBlock,
  formOffsetXPx: s.formOffsetXPx,
  rowGapPx: s.rowGapPx,
  rowPaddingYPx: s.rowPaddingYPx,
  rowPaddingXPx: s.rowPaddingXPx,
  rowBorderRadiusPx: s.rowBorderRadiusPx,
  showRowHoverBg: s.showRowHoverBg,
  showSpineGuideLine: s.showSpineGuideLine,
  showRowIcon: s.showRowIcon,
  labelTextAlign: s.labelTextAlign,
  labelColumnWidthPx: s.labelColumnWidthPx,
  labelToControlGapPx: s.labelToControlGapPx,
  labelFontSizePx: s.labelFontSizePx,
  labelFontWeight: s.labelFontWeight,
  sliderTrackWidthPx: s.sliderTrackWidthPx,
  sliderTrackHeightPx: s.sliderTrackHeightPx,
  sliderThumbSizePx: s.sliderThumbSizePx,
  sliderColorScheme: s.sliderColorScheme,
  sliderShowStepper: s.sliderShowStepper,
  controlToReadoutGapPx: s.controlToReadoutGapPx,
  readoutContainerMode: s.readoutContainerMode,
  readoutTextAlign: s.readoutTextAlign,
  readoutMinWidthPx: s.readoutMinWidthPx,
  readoutFontSizePx: s.readoutFontSizePx,
  readoutPaddingXPx: s.readoutPaddingXPx,
  readoutPaddingYPx: s.readoutPaddingYPx,
  readoutBorderRadiusPx: s.readoutBorderRadiusPx,
  booleanControlType: s.booleanControlType,
  checkboxPlacement: s.checkboxPlacement,
  checkboxSectionTopGapPx: s.checkboxSectionTopGapPx,
  checkboxSizePx: s.checkboxSizePx,
  checkboxRadiusPx: s.checkboxRadiusPx,
  checkboxVariant: s.checkboxVariant,
  checkboxStrokeWidth: s.checkboxStrokeWidth,
  checkboxIconStyle: s.checkboxIconStyle,
  checkboxAnimationStyle: s.checkboxAnimationStyle,
  checkboxHighContrastUnchecked: s.checkboxHighContrastUnchecked,
  checkboxShowStatusText: s.checkboxShowStatusText,
  resetButtonMode: s.resetButtonMode,
  resetButtonStyle: s.resetButtonStyle,
  resetButtonWidthMode: s.resetButtonWidthMode,
  resetButtonLabel: s.resetButtonLabel,
  resetButtonShowIcon: s.resetButtonShowIcon,
  resetButtonHeightPx: s.resetButtonHeightPx,
  resetButtonFontSizePx: s.resetButtonFontSizePx,
  resetButtonRadiusPx: s.resetButtonRadiusPx,
  resetButtonIconSizePx: s.resetButtonIconSizePx,
  resetButtonTopMarginPx: s.resetButtonTopMarginPx,
  resetConfirmMode: s.resetConfirmMode,
  resetDialogueTitle: s.resetDialogueTitle,
});

export interface CameraSettingsStyleStore extends CameraSettingsStyleConfig {
  setParam: <K extends keyof CameraSettingsStyleConfig>(
    key: K,
    value: CameraSettingsStyleConfig[K]
  ) => void;
  updateParams: (patch: Partial<CameraSettingsStyleConfig>) => void;
  applyPreset: (presetId: CameraSettingsPresetId) => void;
  resetToDefaults: () => void;
  exportConfigCode: () => string;
}

const initialConfig = normalizeConfig(
  crossClientSync.get<CameraSettingsStyleConfig>(SYNC_KEY, loadSavedConfig())
);

export const useCameraSettingsStyleStore = create<CameraSettingsStyleStore>((set, get) => ({
  ...initialConfig,

  setParam: (key, value) => {
    set((state) => {
      const next = normalizeConfig({
        ...extractSnapshot(state),
        [key]: value,
      });
      saveConfig(next);
      return next;
    });
  },

  updateParams: (patch) => {
    set((state) => {
      const next = normalizeConfig({
        ...extractSnapshot(state),
        ...patch,
      });
      saveConfig(next);
      return next;
    });
  },

  applyPreset: (presetId) => {
    const found = CAMERA_SETTINGS_STYLE_PRESETS[presetId];
    if (!found) return;
    set((state) => {
      const next = normalizeConfig({
        ...extractSnapshot(state),
        ...found.patch,
        preset: presetId,
      });
      saveConfig(next);
      return next;
    });
  },

  resetToDefaults: () => {
    const fresh = { ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG };
    saveConfig(fresh);
    set(() => fresh);
  },

  exportConfigCode: () => {
    const snapshot = extractSnapshot(get());
    return `export const DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG: CameraSettingsStyleConfig = ${JSON.stringify(
      snapshot,
      null,
      2
    )};`;
  },
}));

crossClientSync.registerDefault(SYNC_KEY, { ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG });

crossClientSync.onReset((scopePrefix) => {
  if (scopePrefix && !SYNC_KEY.startsWith(scopePrefix)) return;
  const fresh = { ...DEFAULT_CAMERA_SETTINGS_STYLE_CONFIG };
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  useCameraSettingsStyleStore.setState(fresh);
});

crossClientSync.subscribeKey<CameraSettingsStyleConfig>(SYNC_KEY, (remote) => {
  if (!remote || typeof remote !== 'object') return;
  const merged = normalizeConfig(remote);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // ignore
    }
  }
  useCameraSettingsStyleStore.setState(merged);
});
