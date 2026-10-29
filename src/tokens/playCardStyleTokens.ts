/**
 * Three core visual archetypes for L2 Play Menu Cards:
 * 1. 'icon-badge-top': Row 1 [Left Icon + Right Badge] -> Row 2 [Title] -> Row 3 [Description]
 * 2. 'icon-title-inline': Row 1 [Left Icon + Right Title (No Badge)] -> Row 2 [Description]
 * 3. 'mono-giant-watermark': Large JetBrains Mono title + Giant background watermark icon (~30% opacity)
 */
export type PlayCardStyleVariant =
  | 'icon-badge-top'
  | 'icon-title-inline'
  | 'mono-giant-watermark';

export type InlineHeaderLayoutMode = 'left-pack' | 'space-between';

export type MonoTitleAnchor =
  | 'center-left'
  | 'bottom-left'
  | 'top-left'
  | 'center'
  | 'bottom-right';

export type WatermarkAnchor =
  | 'right-center'
  | 'bottom-right'
  | 'center'
  | 'top-right'
  | 'bottom-left';

export type WatermarkColorMode = 'mode-accent' | 'amber' | 'neutral';

/**
 * Official 8 weights supported by JetBrains Mono:
 * Thin (100), Extra Light (200), Light (300), Regular (400),
 * Medium (500), Semi Bold (600), Bold (700), Extra Bold (800)
 */
export type JetBrainsMonoFontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800;

export const JETBRAINS_MONO_WEIGHT_OPTIONS: {
  weight: JetBrainsMonoFontWeight;
  label: string;
}[] = [
  { weight: 100, label: 'Thin' },
  { weight: 200, label: 'Extra Light' },
  { weight: 300, label: 'Light' },
  { weight: 400, label: 'Regular' },
  { weight: 500, label: 'Medium' },
  { weight: 600, label: 'Semi Bold' },
  { weight: 700, label: 'Bold' },
  { weight: 800, label: 'Extra Bold' },
];

export type PlayModeCardId =
  | 'exhibition'
  | 'host-match'
  | 'join-room'
  | 'self-training'
  | 'host-training'
  | 'advanced';

export type PlayCardIconColorToken =
  | 'neutral'
  | 'slate'
  | 'amber'
  | 'emerald'
  | 'sky'
  | 'purple'
  | 'rose'
  | 'indigo'
  | 'cyan';

/**
 * Supports either a preset semantic token ('rose', 'neutral', etc.)
 * or a custom user-selected Hex / RGB color string (e.g. '#f43f5e' or 'rgb(244, 63, 94)')
 */
export type PlayCardIconColorValue = PlayCardIconColorToken | (string & {});

export const PLAY_CARD_ICON_COLOR_OPTIONS: {
  id: PlayCardIconColorToken;
  label: string;
  shortLabel: string;
  lightTextClass: string;
  darkTextClass: string;
  dotClass: string;
  hexLight: string;
  hexDark: string;
}[] = [
  {
    id: 'neutral',
    label: '灰色 (Gray)',
    shortLabel: '灰色',
    lightTextClass: 'text-neutral-500',
    darkTextClass: 'text-neutral-400',
    dotClass: 'bg-neutral-500',
    hexLight: '#737373',
    hexDark: '#a3a3a3',
  },
  {
    id: 'slate',
    label: '冷灰 (Slate)',
    shortLabel: '冷灰',
    lightTextClass: 'text-slate-500',
    darkTextClass: 'text-slate-400',
    dotClass: 'bg-slate-500',
    hexLight: '#64748b',
    hexDark: '#94a3b8',
  },
  {
    id: 'amber',
    label: '暖橙 (Amber)',
    shortLabel: '暖橙',
    lightTextClass: 'text-amber-500',
    darkTextClass: 'text-amber-500',
    dotClass: 'bg-amber-500',
    hexLight: '#f59e0b',
    hexDark: '#f59e0b',
  },
  {
    id: 'emerald',
    label: '翠绿 (Emerald)',
    shortLabel: '翠绿',
    lightTextClass: 'text-emerald-500',
    darkTextClass: 'text-emerald-500',
    dotClass: 'bg-emerald-500',
    hexLight: '#10b981',
    hexDark: '#10b981',
  },
  {
    id: 'sky',
    label: '天蓝 (Sky)',
    shortLabel: '天蓝',
    lightTextClass: 'text-sky-500',
    darkTextClass: 'text-sky-500',
    dotClass: 'bg-sky-500',
    hexLight: '#0ea5e9',
    hexDark: '#0ea5e9',
  },
  {
    id: 'purple',
    label: '紫罗兰 (Purple)',
    shortLabel: '紫罗兰',
    lightTextClass: 'text-purple-500',
    darkTextClass: 'text-purple-500',
    dotClass: 'bg-purple-500',
    hexLight: '#a855f7',
    hexDark: '#a855f7',
  },
  {
    id: 'rose',
    label: '玫红 (Rose)',
    shortLabel: '玫红',
    lightTextClass: 'text-rose-500',
    darkTextClass: 'text-rose-500',
    dotClass: 'bg-rose-500',
    hexLight: '#f43f5e',
    hexDark: '#f43f5e',
  },
  {
    id: 'indigo',
    label: '靛青 (Indigo)',
    shortLabel: '靛青',
    lightTextClass: 'text-indigo-500',
    darkTextClass: 'text-indigo-500',
    dotClass: 'bg-indigo-500',
    hexLight: '#6366f1',
    hexDark: '#6366f1',
  },
  {
    id: 'cyan',
    label: '青色 (Cyan)',
    shortLabel: '青色',
    lightTextClass: 'text-cyan-500',
    darkTextClass: 'text-cyan-500',
    dotClass: 'bg-cyan-500',
    hexLight: '#06b6d4',
    hexDark: '#06b6d4',
  },
];

export const isCustomPlayCardColor = (val: string | undefined): boolean => {
  if (!val) return false;
  return !PLAY_CARD_ICON_COLOR_OPTIONS.some((o) => o.id === val);
};

export const resolvePlayCardIconColorClass = (
  tokenOrColor: PlayCardIconColorValue | undefined,
  isLight: boolean
): string | undefined => {
  if (!tokenOrColor) return undefined;
  const found = PLAY_CARD_ICON_COLOR_OPTIONS.find((o) => o.id === tokenOrColor);
  if (!found) return undefined;
  return isLight ? found.lightTextClass : found.darkTextClass;
};

export const resolvePlayCardIconHex = (
  tokenOrColor: PlayCardIconColorValue | undefined,
  isLight: boolean
): string => {
  if (!tokenOrColor) return '#f59e0b';
  const found = PLAY_CARD_ICON_COLOR_OPTIONS.find((o) => o.id === tokenOrColor);
  if (found) {
    return isLight ? found.hexLight : found.hexDark;
  }
  const trimmed = tokenOrColor.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, Number(rgbMatch[1])));
    const g = Math.min(255, Math.max(0, Number(rgbMatch[2])));
    const b = Math.min(255, Math.max(0, Number(rgbMatch[3])));
    return (
      '#' +
      [r, g, b]
        .map((n) => n.toString(16).padStart(2, '0'))
        .join('')
    );
  }
  return '#f59e0b';
};

export const hexToRgbTuple = (hex: string): { r: number; g: number; b: number } => {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return { r: 245, g: 158, b: 11 };
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return { r: 245, g: 158, b: 11 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

export const rgbTupleToHex = (r: number, g: number, b: number): string => {
  const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n || 0)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
  );
};

export const DEFAULT_CARD_ICON_COLORS: Record<PlayModeCardId, PlayCardIconColorValue> = {
  'exhibition': 'rose',
  'host-match': 'neutral',
  'join-room': 'emerald',
  'self-training': 'amber',
  'host-training': 'sky',
  'advanced': 'purple',
};

export interface PlayCardStyleParams {
  /** Active card style variant applied to L2 Play Menu & Preview */
  variant: PlayCardStyleVariant;

  // ── Shared Card Container Geometry ──
  cardPaddingXPx: number;
  cardPaddingYPx: number;
  cardMinHeightPx: number;
  cardRadiusPx: number;
  gridGapPx: number;

  // ── Style 1 & Style 2 Shared Foreground Icon & Text Parameters ──
  iconSizePx: number;
  iconStrokeWidth: number;
  showIconBox: boolean;
  iconBoxPaddingPx: number;
  iconBoxRadiusPx: number;
  titleFontSizePx: number;
  titleFontWeight: JetBrainsMonoFontWeight;
  titleUseMonoFont: boolean;
  style1TopRowMarginBottomPx: number;
  style1TitleMarginBottomPx: number;
  descFontSizePx: number;
  descLineHeight: number;
  descLineClamp: 0 | 1 | 2 | 3;

  // ── Style 2 ('icon-title-inline') Specific Parameters ──
  inlineHeaderLayout: InlineHeaderLayoutMode;
  inlineIconTitleGapPx: number;
  inlineHeaderMarginBottomPx: number;

  // ── Style 3 ('mono-giant-watermark') Specific Parameters ──
  monoTitleSizePx: number;
  monoTitleWeight: JetBrainsMonoFontWeight;
  monoLetterSpacingEm: number;
  monoLineHeight: number;
  monoUppercase: boolean;
  monoTitleAnchor: MonoTitleAnchor;
  monoShowDescription: boolean;
  monoShowBadge: boolean;
  watermarkSizePx: number;
  watermarkOpacityPct: number;
  watermarkHoverOpacityPct: number;
  watermarkStrokeWidth: number;
  watermarkAnchor: WatermarkAnchor;
  watermarkOffsetXPx: number;
  watermarkOffsetYPx: number;
  watermarkRotateDeg: number;
  watermarkHoverScale: number;
  watermarkColorMode: WatermarkColorMode;

  // ── Per-Option Independent Icon Colors (Preset Token or Custom RGB/Hex) ──
  cardIconColors: Record<PlayModeCardId, PlayCardIconColorValue>;
}

export const PLAY_CARD_STYLE_CONFIG: PlayCardStyleParams = {
  variant: 'mono-giant-watermark',
  cardPaddingXPx: 14,
  cardPaddingYPx: 14,
  cardMinHeightPx: 96,
  cardRadiusPx: 12,
  gridGapPx: 12,
  iconSizePx: 20,
  iconStrokeWidth: 2,
  showIconBox: false,
  iconBoxPaddingPx: 8,
  iconBoxRadiusPx: 8,
  titleFontSizePx: 15,
  titleFontWeight: 700,
  titleUseMonoFont: false,
  style1TopRowMarginBottomPx: 10,
  style1TitleMarginBottomPx: 4,
  descFontSizePx: 12,
  descLineHeight: 1.5,
  descLineClamp: 2,
  inlineHeaderLayout: 'left-pack',
  inlineIconTitleGapPx: 8,
  inlineHeaderMarginBottomPx: 6,
  monoTitleSizePx: 19,
  monoTitleWeight: 800,
  monoLetterSpacingEm: -0.02,
  monoLineHeight: 1.15,
  monoUppercase: false,
  monoTitleAnchor: 'center-left',
  monoShowDescription: false,
  monoShowBadge: false,
  watermarkSizePx: 92,
  watermarkOpacityPct: 30,
  watermarkHoverOpacityPct: 48,
  watermarkStrokeWidth: 1.5,
  watermarkAnchor: 'bottom-right',
  watermarkOffsetXPx: 2,
  watermarkOffsetYPx: 0,
  watermarkRotateDeg: -14,
  watermarkHoverScale: 1.08,
  watermarkColorMode: 'mode-accent',
  cardIconColors: {
    'exhibition': 'rose',
    'host-match': 'neutral',
    'join-room': 'emerald',
    'self-training': 'amber',
    'host-training': 'sky',
    'advanced': 'purple',
  },
};

export const DEFAULT_PLAY_CARD_STYLE_PARAMS: PlayCardStyleParams = PLAY_CARD_STYLE_CONFIG;

export interface PlayCardStylePreset {
  id: string;
  label: string;
  subtitle: string;
  params: Partial<PlayCardStyleParams>;
}

export const PLAY_CARD_STYLE_PRESETS: PlayCardStylePreset[] = [
  {
    id: 'preset-style3-calibrated-default',
    label: '风格三 (当前默认) · JetBrains Mono Extra Bold + 右下 30% 超大背景 Icon',
    subtitle: '96px 高度 · 19px Extra Bold 左中对齐 · 右下 -14° 92px 水印 Icon (Exhibition 玫红 / Host Match 灰)',
    params: {
      ...PLAY_CARD_STYLE_CONFIG,
      cardIconColors: { ...DEFAULT_CARD_ICON_COLORS },
    },
  },
  {
    id: 'preset-style3-mono-regular',
    label: '风格三 B · JetBrains Mono Regular 大字 + 右侧居中 30% 超大背景 Icon',
    subtitle: 'JetBrains Mono Regular 字重，右侧居中 30% Opacity 超大倾斜背景 Icon',
    params: {
      variant: 'mono-giant-watermark',
      cardPaddingXPx: 16,
      cardPaddingYPx: 16,
      cardMinHeightPx: 108,
      monoTitleSizePx: 20,
      monoTitleWeight: 400,
      monoLetterSpacingEm: -0.02,
      monoLineHeight: 1.2,
      monoUppercase: false,
      monoTitleAnchor: 'center-left',
      monoShowDescription: false,
      monoShowBadge: false,
      watermarkSizePx: 92,
      watermarkOpacityPct: 30,
      watermarkHoverOpacityPct: 48,
      watermarkStrokeWidth: 1.5,
      watermarkAnchor: 'right-center',
      watermarkOffsetXPx: 8,
      watermarkOffsetYPx: 0,
      watermarkRotateDeg: -10,
      watermarkHoverScale: 1.08,
      watermarkColorMode: 'mode-accent',
    },
  },
  {
    id: 'preset-style3-mono-centered',
    label: '风格三 C · 居中大字抬头 + 正中 30% 巨型水印 Icon',
    subtitle: '标题与 30% 透明度超大 Icon 同轴居中叠印，纯粹几何张力',
    params: {
      variant: 'mono-giant-watermark',
      cardPaddingXPx: 16,
      cardPaddingYPx: 16,
      cardMinHeightPx: 112,
      monoTitleSizePx: 20,
      monoTitleWeight: 600,
      monoLetterSpacingEm: 0,
      monoLineHeight: 1.15,
      monoUppercase: true,
      monoTitleAnchor: 'center',
      monoShowDescription: false,
      monoShowBadge: false,
      watermarkSizePx: 96,
      watermarkOpacityPct: 30,
      watermarkHoverOpacityPct: 45,
      watermarkStrokeWidth: 1.4,
      watermarkAnchor: 'center',
      watermarkOffsetXPx: 0,
      watermarkOffsetYPx: 0,
      watermarkRotateDeg: 0,
      watermarkHoverScale: 1.1,
      watermarkColorMode: 'mode-accent',
    },
  },
  {
    id: 'preset-style2-inline-clean',
    label: '风格二 A · 顶行裸 Icon + 右 Title 极简内联 (无 Badge)',
    subtitle: '无图标外框、无 Badge，第一行紧凑左 Icon 右 Title，下方 Description',
    params: {
      variant: 'icon-title-inline',
      cardPaddingXPx: 14,
      cardPaddingYPx: 14,
      cardMinHeightPx: 96,
      showIconBox: false,
      iconSizePx: 20,
      inlineHeaderLayout: 'left-pack',
      inlineIconTitleGapPx: 8,
      inlineHeaderMarginBottomPx: 6,
      titleFontSizePx: 15,
      titleFontWeight: 700,
      titleUseMonoFont: false,
      descFontSizePx: 12,
      descLineClamp: 2,
    },
  },
  {
    id: 'preset-style2-inline-boxed',
    label: '风格二 B · 顶行左框 Icon + 右 Title (无 Badge)',
    subtitle: '第一行左侧带框 Icon + 右侧 Title，移除 Badge，下方 Description',
    params: {
      variant: 'icon-title-inline',
      cardPaddingXPx: 14,
      cardPaddingYPx: 14,
      cardMinHeightPx: 104,
      showIconBox: true,
      iconSizePx: 18,
      iconBoxPaddingPx: 7,
      inlineHeaderLayout: 'left-pack',
      inlineIconTitleGapPx: 10,
      inlineHeaderMarginBottomPx: 8,
      titleFontSizePx: 14,
      titleFontWeight: 700,
      titleUseMonoFont: false,
      descFontSizePx: 12,
      descLineClamp: 2,
    },
  },
  {
    id: 'preset-style1-classic',
    label: '风格一 · 经典四段式 (Icon+Badge / Title / Desc)',
    subtitle: '第一行左 Icon 右 Badge，下方 Title，再下方 Description',
    params: {
      variant: 'icon-badge-top',
      cardPaddingXPx: 14,
      cardPaddingYPx: 14,
      cardMinHeightPx: 112,
      showIconBox: true,
      iconSizePx: 20,
      titleFontSizePx: 14,
      titleFontWeight: 700,
      titleUseMonoFont: false,
      descFontSizePx: 12,
      descLineClamp: 2,
    },
  },
];
