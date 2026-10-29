import {
  JETBRAINS_MONO_WEIGHT_OPTIONS,
  PLAY_CARD_ICON_COLOR_OPTIONS,
  isCustomPlayCardColor,
  resolvePlayCardIconColorClass,
  resolvePlayCardIconHex,
  hexToRgbTuple,
  rgbTupleToHex,
  type JetBrainsMonoFontWeight,
  type PlayCardIconColorToken,
  type PlayCardIconColorValue,
} from './playCardStyleTokens';

export type MainMenuIconColorToken = PlayCardIconColorToken;
export type MainMenuIconColorValue = PlayCardIconColorValue;

export {
  JETBRAINS_MONO_WEIGHT_OPTIONS,
  PLAY_CARD_ICON_COLOR_OPTIONS as MAIN_MENU_ICON_COLOR_OPTIONS,
  isCustomPlayCardColor as isCustomMainMenuColor,
  resolvePlayCardIconColorClass as resolveMainMenuIconColorClass,
  resolvePlayCardIconHex as resolveMainMenuIconHex,
  hexToRgbTuple,
  rgbTupleToHex,
  type JetBrainsMonoFontWeight,
};

/**
 * Three core visual archetypes for Layer 1 Main Menu (`MENU`) rows:
 * 1. 'large-clean-row' (Default): Clean single-line row [Icon + Large Title] inside outer frame, no description
 * 2. 'mono-watermark-row': Large JetBrains Mono title + Right oversized background watermark icon (~25-30% opacity), no description
 * 3. 'classic-descriptive-row': Classic two-line row [Icon Box + Title + Bottom Description]
 */
export type MainMenuStyleVariant =
  | 'large-clean-row'
  | 'mono-watermark-row'
  | 'classic-descriptive-row';

export type MainMenuFontFamilyMode = 'sans' | 'mono';

export type MainMenuRowAlignMode = 'left' | 'center' | 'space-between';

export type MainMenuResumeHighlightStyle =
  | 'solid-primary'
  | 'surface-card'
  | 'amber-accent';

export type MainMenuItemSlotId =
  | 'resume'
  | 'play'
  | 'garage'
  | 'settings'
  | 'configure'
  | 'restart'
  | 'leave';

export const MAIN_MENU_ITEM_SLOTS: {
  id: MainMenuItemSlotId;
  label: string;
  shortTitle: string;
}[] = [
  { id: 'resume', label: 'Resume (返回对局)', shortTitle: 'Resume' },
  { id: 'play', label: 'Play (玩法选择)', shortTitle: 'Play' },
  { id: 'garage', label: 'Garage (车库改装)', shortTitle: 'Garage' },
  { id: 'settings', label: 'Settings (系统设置)', shortTitle: 'Settings' },
  { id: 'configure', label: 'Configure (房间/训练配置)', shortTitle: 'Configure' },
  { id: 'restart', label: 'Restart (重开对局)', shortTitle: 'Restart Match' },
  { id: 'leave', label: 'Leave / Exit (退出房间/训练)', shortTitle: 'Exit / Leave' },
];

export const DEFAULT_MAIN_MENU_ITEM_COLORS: Record<MainMenuItemSlotId, MainMenuIconColorValue> = {
  resume: 'neutral',
  play: 'amber',
  garage: 'sky',
  settings: 'emerald',
  configure: 'amber',
  restart: 'purple',
  leave: 'rose',
};

export interface MainMenuStyleParams {
  variant: MainMenuStyleVariant;
  conciseResumeLabel: boolean;
  showDescription: boolean;
  itemPaddingXPx: number;
  itemPaddingYPx: number;
  itemMinHeightPx: number;
  itemRadiusPx: number;
  itemBorderWidthPx: number;
  itemGapPx: number;
  showDividers: boolean;
  dividerMarginYPx: number;
  menuContainerPaddingPx: number;
  titleFontFamily: MainMenuFontFamilyMode;
  titleFontSizePx: number;
  titleFontWeight: JetBrainsMonoFontWeight;
  titleLetterSpacingEm: number;
  titleLineHeight: number;
  titleUppercase: boolean;
  descFontSizePx: number;
  descLineHeight: number;
  titleDescGapPx: number;
  showIcon: boolean;
  iconSizePx: number;
  iconStrokeWidth: number;
  showIconBox: boolean;
  iconBoxSizePx: number;
  iconBoxRadiusPx: number;
  iconTitleGapPx: number;
  rowContentAlign: MainMenuRowAlignMode;
  resumeHighlightStyle: MainMenuResumeHighlightStyle;
  showShortcutBadge: boolean;
  showRightArrow: boolean;
  rightArrowSizePx: number;
  headerFontFamily: MainMenuFontFamilyMode;
  headerFontSizePx: number;
  headerFontWeight: JetBrainsMonoFontWeight;
  headerLetterSpacingEm: number;
  headerPaddingXPx: number;
  headerPaddingTopPx: number;
  headerPaddingBottomPx: number;
  contentPaddingXPx: number;
  contentPaddingYPx: number;
  showFooter: boolean;
  footerPaddingXPx: number;
  footerPaddingYPx: number;
  footerFontSizePx: number;
  watermarkSizePx: number;
  watermarkOpacityPct: number;
  watermarkHoverOpacityPct: number;
  watermarkStrokeWidth: number;
  watermarkRotateDeg: number;
  watermarkOffsetXPx: number;
  watermarkOffsetYPx: number;
  usePerItemIconColors: boolean;
  itemIconColors: Record<MainMenuItemSlotId, MainMenuIconColorValue>;
}

export const MAIN_MENU_APPLE_SANS_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "JetBrains Mono", "SF Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

export const MAIN_MENU_JETBRAINS_MONO_STACK =
  '"JetBrains Mono", "SF Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

export const DEFAULT_MAIN_MENU_MONO_FALLBACK_WEIGHT: JetBrainsMonoFontWeight = 400;

export type MainMenuPlatformPreviewMode = 'auto' | 'apple' | 'non-apple-fallback';

export type MainMenuPreviewContextMode =
  | 'freeplay'
  | 'exhibition'
  | 'match-lobby-host'
  | 'match-lobby-client'
  | 'online-match-host'
  | 'online-match-client'
  | 'online-warmup-host'
  | 'online-warmup-client'
  | 'kickoff-training'
  | 'static-training-play'
  | 'static-training-edit'
  | 'dev-test-lab'
  | 'exp-multi-bots'
  | 'match'
  | 'custom-match-host'
  | 'custom-match-client';

export const normalizeMainMenuContextMode = (
  raw?: string | null
): Exclude<MainMenuPreviewContextMode, 'match' | 'custom-match-host' | 'custom-match-client'> => {
  if (!raw) return 'freeplay';
  if (raw === 'match') return 'exhibition';
  if (raw === 'custom-match-host') return 'online-match-host';
  if (raw === 'custom-match-client') return 'online-match-client';
  if (raw === 'online-warmup') return 'online-warmup-host';
  if (raw === 'static-training-pack') return 'static-training-play';
  const valid: Exclude<
    MainMenuPreviewContextMode,
    'match' | 'custom-match-host' | 'custom-match-client'
  >[] = [
    'freeplay',
    'exhibition',
    'match-lobby-host',
    'match-lobby-client',
    'online-match-host',
    'online-match-client',
    'online-warmup-host',
    'online-warmup-client',
    'kickoff-training',
    'static-training-play',
    'static-training-edit',
    'dev-test-lab',
    'exp-multi-bots',
  ];
  return valid.includes(raw as any) ? (raw as any) : 'freeplay';
};

export const detectIsAppleDevice = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  const navWithUAData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = navWithUAData.userAgentData?.platform || navigator.platform || '';
  const ua = navigator.userAgent || '';
  if (/(Mac|iPhone|iPod|iPad)/i.test(platform)) return true;
  if (/(Macintosh|Mac OS X|iPhone|iPad|iPod)/i.test(ua)) return true;
  return false;
};

export interface ResolvedMainMenuTypography {
  fontFamily: string;
  fontWeight: JetBrainsMonoFontWeight;
  isUsingMonoFallback: boolean;
}

export const resolveMainMenuTitleTypography = (
  fontFamilyMode: MainMenuFontFamilyMode,
  configuredWeight: JetBrainsMonoFontWeight,
  platformPreviewMode: MainMenuPlatformPreviewMode = 'auto',
  fallbackMonoWeight: JetBrainsMonoFontWeight = DEFAULT_MAIN_MENU_MONO_FALLBACK_WEIGHT
): ResolvedMainMenuTypography => {
  if (fontFamilyMode === 'mono') {
    return {
      fontFamily: MAIN_MENU_JETBRAINS_MONO_STACK,
      fontWeight: configuredWeight,
      isUsingMonoFallback: false,
    };
  }

  const isApple =
    platformPreviewMode === 'apple'
      ? true
      : platformPreviewMode === 'non-apple-fallback'
      ? false
      : detectIsAppleDevice();

  if (!isApple) {
    return {
      fontFamily: MAIN_MENU_JETBRAINS_MONO_STACK,
      fontWeight: fallbackMonoWeight,
      isUsingMonoFallback: true,
    };
  }

  return {
    fontFamily: MAIN_MENU_APPLE_SANS_STACK,
    fontWeight: configuredWeight,
    isUsingMonoFallback: false,
  };
};

export const MAIN_MENU_STYLE_CONFIG: MainMenuStyleParams = {
  variant: 'large-clean-row',
  conciseResumeLabel: true,
  showDescription: false,
  itemPaddingXPx: 18,
  itemPaddingYPx: 12,
  itemMinHeightPx: 50,
  itemRadiusPx: 12,
  itemBorderWidthPx: 1,
  itemGapPx: 12,
  showDividers: true,
  dividerMarginYPx: -5,
  menuContainerPaddingPx: 0,
  titleFontFamily: 'sans',
  titleFontSizePx: 24,
  titleFontWeight: 800,
  titleLetterSpacingEm: 0,
  titleLineHeight: 1,
  titleUppercase: false,
  descFontSizePx: 12,
  descLineHeight: 1.4,
  titleDescGapPx: 2,
  showIcon: true,
  iconSizePx: 20,
  iconStrokeWidth: 2,
  showIconBox: false,
  iconBoxSizePx: 36,
  iconBoxRadiusPx: 9,
  iconTitleGapPx: 12,
  rowContentAlign: 'left',
  resumeHighlightStyle: 'solid-primary',
  showShortcutBadge: true,
  showRightArrow: true,
  rightArrowSizePx: 16,
  headerFontFamily: 'sans',
  headerFontSizePx: 20,
  headerFontWeight: 800,
  headerLetterSpacingEm: 0.1,
  headerPaddingXPx: 24,
  headerPaddingTopPx: 20,
  headerPaddingBottomPx: 16,
  contentPaddingXPx: 24,
  contentPaddingYPx: 14,
  showFooter: true,
  footerPaddingXPx: 24,
  footerPaddingYPx: 14,
  footerFontSizePx: 11,
  watermarkSizePx: 68,
  watermarkOpacityPct: 26,
  watermarkHoverOpacityPct: 45,
  watermarkStrokeWidth: 1.6,
  watermarkRotateDeg: -12,
  watermarkOffsetXPx: 8,
  watermarkOffsetYPx: 0,
  usePerItemIconColors: false,
  itemIconColors: {
    resume: 'neutral',
    play: 'amber',
    garage: 'sky',
    settings: 'emerald',
    configure: 'amber',
    restart: 'purple',
    leave: 'rose',
  },
};

export const DEFAULT_MAIN_MENU_STYLE_PARAMS: MainMenuStyleParams = MAIN_MENU_STYLE_CONFIG;

export interface MainMenuStylePreset {
  id: string;
  label: string;
  subtitle: string;
  params: Partial<MainMenuStyleParams>;
}

export const MAIN_MENU_STYLE_PRESETS: MainMenuStylePreset[] = [
  {
    id: 'preset-clean-large-bare-icon',
    label: '预设一 (当前默认) · 极简大字 + 纯净图标 + 单层行外框 (无 Description)',
    subtitle: 'Resume 短标题 · 24px Apple Sans Extra Bold (非 Apple 设备自动 Fallback 至 JetBrains Mono Regular) · 无图标内框',
    params: {
      ...MAIN_MENU_STYLE_CONFIG,
    },
  },
  {
    id: 'preset-clean-large-boxed-icon',
    label: '预设二 · 极简大字 + 独立图标方盒 (Large Title + Icon Box · 无 Description)',
    subtitle: 'Resume 短标题 · 18px Bold 大字 · 左侧 36×36 图标内框 · 无下方 Description',
    params: {
      variant: 'large-clean-row',
      conciseResumeLabel: true,
      showDescription: false,
      showIconBox: true,
      iconBoxSizePx: 36,
      iconBoxRadiusPx: 9,
      titleFontFamily: 'sans',
      titleFontSizePx: 18,
      titleFontWeight: 700,
      iconSizePx: 20,
      iconTitleGapPx: 12,
      itemMinHeightPx: 56,
      itemPaddingXPx: 16,
      itemPaddingYPx: 10,
      resumeHighlightStyle: 'solid-primary',
    },
  },
  {
    id: 'preset-clean-mono-bold',
    label: '预设三 · JetBrains Mono 工业大字极简行 (Mono 19px Extra Bold · 无 Description)',
    subtitle: '对标 Play 菜单工业字体：JetBrains Mono 19px Extra Bold + 纯净图标 + 彩色图标点缀',
    params: {
      variant: 'large-clean-row',
      conciseResumeLabel: true,
      showDescription: false,
      showIconBox: false,
      titleFontFamily: 'mono',
      titleFontSizePx: 19,
      titleFontWeight: 800,
      titleLetterSpacingEm: -0.02,
      iconSizePx: 21,
      iconTitleGapPx: 14,
      itemMinHeightPx: 56,
      itemPaddingXPx: 18,
      itemPaddingYPx: 14,
      usePerItemIconColors: true,
      resumeHighlightStyle: 'solid-primary',
    },
  },
  {
    id: 'preset-clean-unified-surface',
    label: '预设四 · 同色系外框卡片行 (Resume 统一外框不反色 · 20px 大字)',
    subtitle: '所有行统一采用卡片外框底色 (Surface Card)，20px 大字 + 彩色图标，视觉整体感更温和',
    params: {
      variant: 'large-clean-row',
      conciseResumeLabel: true,
      showDescription: false,
      showIconBox: false,
      titleFontFamily: 'sans',
      titleFontSizePx: 20,
      titleFontWeight: 700,
      iconSizePx: 22,
      iconTitleGapPx: 14,
      itemMinHeightPx: 56,
      itemPaddingXPx: 18,
      itemPaddingYPx: 14,
      resumeHighlightStyle: 'surface-card',
      usePerItemIconColors: true,
    },
  },
  {
    id: 'preset-mono-watermark-row',
    label: '预设五 · 风格二：JetBrains Mono 大字 + 右侧 26% 超大背景水印 Icon',
    subtitle: '将 Play 卡片风格三延展至横向行：前景左对齐 Mono 大字，右侧叠印 68px 倾斜矢量水印',
    params: {
      variant: 'mono-watermark-row',
      conciseResumeLabel: true,
      showDescription: false,
      titleFontFamily: 'mono',
      titleFontSizePx: 19,
      titleFontWeight: 800,
      titleLetterSpacingEm: -0.02,
      itemMinHeightPx: 58,
      itemPaddingXPx: 20,
      itemPaddingYPx: 14,
      watermarkSizePx: 68,
      watermarkOpacityPct: 26,
      watermarkHoverOpacityPct: 45,
      watermarkRotateDeg: -12,
      usePerItemIconColors: true,
      resumeHighlightStyle: 'surface-card',
    },
  },
  {
    id: 'preset-classic-with-description',
    label: '预设六 · 风格三 (旧版对照)：含下方 Description 副标题 + Resume Match',
    subtitle: '保留此前带 Description 与图标内框的双行排版，方便一键切换对比删繁就简前后的差异',
    params: {
      variant: 'classic-descriptive-row',
      conciseResumeLabel: false,
      showDescription: true,
      showIconBox: true,
      iconBoxSizePx: 36,
      iconBoxRadiusPx: 8,
      titleFontFamily: 'sans',
      titleFontSizePx: 14,
      titleFontWeight: 600,
      descFontSizePx: 12,
      iconSizePx: 20,
      iconTitleGapPx: 12,
      itemMinHeightPx: 52,
      itemPaddingXPx: 16,
      itemPaddingYPx: 10,
      itemGapPx: 4,
      dividerMarginYPx: 2,
      usePerItemIconColors: false,
      resumeHighlightStyle: 'solid-primary',
    },
  },
];
