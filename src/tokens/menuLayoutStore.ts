import { create } from 'zustand';

export type PanelSizingMode = 'auto' | 'fixed';

export type MenuPanelId =
  | 'layer1-main'
  | 'layer2-play'
  | 'layer2-garage'
  | 'layer2-settings'
  | 'layer2-previews'
  | 'layer3-audio-detail'
  | 'layer3-ball-trajectory'
  | 'layer3-online-warmup';

export interface PanelSizingConfig {
  /**
   * 'auto': Height automatically fits content, clamped to [minHeight, min(maxHeight, availH)].
   *         Ideal for single-view menus without internal tab switching (e.g., Layer 1 Main Menu, Layer 2 Play).
   * 'fixed': Height is locked to min(targetHeight, availH).
   *          Ideal for multi-tab menus (Garage, Settings) and Layer 3 panels with inline error notices so container never jumps.
   */
  mode: PanelSizingMode;
  /** Target container width in px */
  width: number;
  /** Locked target height in px when mode === 'fixed' */
  targetHeight: number;
  /** Minimum height in px when mode === 'auto' */
  minHeight: number;
  /** Maximum allowed height in px when mode === 'auto' (overflows into internal scrolling beyond this) */
  maxHeight: number;
}

export interface MenuLayoutTokens {
  /** Per-panel independent sizing contracts */
  panels: Record<MenuPanelId, PanelSizingConfig>;
  /** Vertical margin (top & bottom in px) for MenuDivider (default: 2px) */
  dividerMarginY: number;
  /** Vertical flex gap (in px) between items inside MenuContainer (default: 4px) */
  menuItemGap: number;
  /** Vertical padding (top & bottom in px) inside each MenuItem (default: 10px) */
  menuItemPaddingY: number;
  /** Uniform inner padding (in px) of MenuContainer (default: 4px) */
  menuContainerPadding: number;
  /** Vertical padding (top & bottom in px) of Layer 1 PanelContent (default: 14px) */
  panelContentPaddingY: number;
  /** Whether to display the 5th button ("Additional Previews") in Layer 1 Main Menu */
  showAdditionalPreviews: boolean;
  /** Whether Layer 3 recipes display the inline single-line error notice */
  simulateLayer3Error: boolean;

  // Legacy convenience aliases synced with panels
  layer1Width: number;
  layer1Height: number;
  layer2Width: number;
  layer2Height: number;
  layer3Width: number;
  layer3Height: number;
}

export const DEFAULT_PANEL_SIZING: Record<MenuPanelId, PanelSizingConfig> = {
  'layer1-main': {
    mode: 'auto',
    width: 420,
    targetHeight: 450,
    minHeight: 240,
    maxHeight: 540,
  },
  'layer2-play': {
    mode: 'auto',
    width: 600,
    targetHeight: 420,
    minHeight: 260,
    maxHeight: 520,
  },
  'layer2-garage': {
    mode: 'fixed',
    width: 640,
    targetHeight: 520,
    minHeight: 320,
    maxHeight: 640,
  },
  'layer2-settings': {
    mode: 'fixed',
    width: 680,
    targetHeight: 580,
    minHeight: 360,
    maxHeight: 680,
  },
  'layer2-previews': {
    mode: 'auto',
    width: 600,
    targetHeight: 440,
    minHeight: 260,
    maxHeight: 520,
  },
  'layer3-audio-detail': {
    mode: 'fixed',
    width: 480,
    targetHeight: 540,
    minHeight: 320,
    maxHeight: 620,
  },
  'layer3-ball-trajectory': {
    mode: 'fixed',
    width: 480,
    targetHeight: 540,
    minHeight: 320,
    maxHeight: 620,
  },
  'layer3-online-warmup': {
    mode: 'fixed',
    width: 480,
    targetHeight: 540,
    minHeight: 320,
    maxHeight: 620,
  },
};

export const DEFAULT_MENU_LAYOUT_TOKENS: MenuLayoutTokens = {
  panels: DEFAULT_PANEL_SIZING,
  dividerMarginY: 2,
  menuItemGap: 4,
  menuItemPaddingY: 10,
  menuContainerPadding: 4,
  panelContentPaddingY: 14,
  showAdditionalPreviews: true,
  simulateLayer3Error: false,
  layer1Width: DEFAULT_PANEL_SIZING['layer1-main'].width,
  layer1Height: DEFAULT_PANEL_SIZING['layer1-main'].targetHeight,
  layer2Width: DEFAULT_PANEL_SIZING['layer2-settings'].width,
  layer2Height: DEFAULT_PANEL_SIZING['layer2-settings'].targetHeight,
  layer3Width: DEFAULT_PANEL_SIZING['layer3-online-warmup'].width,
  layer3Height: DEFAULT_PANEL_SIZING['layer3-online-warmup'].targetHeight,
};

const STORAGE_KEY = 'ui-storybook-menu-layout-tokens-v2';

const syncLegacyFields = (tokens: MenuLayoutTokens): MenuLayoutTokens => ({
  ...tokens,
  layer1Width: tokens.panels['layer1-main'].width,
  layer1Height: tokens.panels['layer1-main'].targetHeight,
  layer2Width: tokens.panels['layer2-settings'].width,
  layer2Height: tokens.panels['layer2-settings'].targetHeight,
  layer3Width: tokens.panels['layer3-online-warmup'].width,
  layer3Height: tokens.panels['layer3-online-warmup'].targetHeight,
});

const cloneDefaultTokens = (): MenuLayoutTokens =>
  syncLegacyFields({
    ...DEFAULT_MENU_LAYOUT_TOKENS,
    panels: {
      'layer1-main': { ...DEFAULT_PANEL_SIZING['layer1-main'] },
      'layer2-play': { ...DEFAULT_PANEL_SIZING['layer2-play'] },
      'layer2-garage': { ...DEFAULT_PANEL_SIZING['layer2-garage'] },
      'layer2-settings': { ...DEFAULT_PANEL_SIZING['layer2-settings'] },
      'layer2-previews': { ...DEFAULT_PANEL_SIZING['layer2-previews'] },
      'layer3-audio-detail': { ...DEFAULT_PANEL_SIZING['layer3-audio-detail'] },
      'layer3-ball-trajectory': { ...DEFAULT_PANEL_SIZING['layer3-ball-trajectory'] },
      'layer3-online-warmup': { ...DEFAULT_PANEL_SIZING['layer3-online-warmup'] },
    },
  });

const loadSavedTokens = (): MenuLayoutTokens => {
  const base = cloneDefaultTokens();
  if (typeof localStorage === 'undefined') return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    const mergedPanels: Record<MenuPanelId, PanelSizingConfig> = { ...base.panels };
    if (parsed.panels && typeof parsed.panels === 'object') {
      (Object.keys(base.panels) as MenuPanelId[]).forEach((id) => {
        if (parsed.panels[id]) {
          mergedPanels[id] = {
            ...base.panels[id],
            ...parsed.panels[id],
          };
        }
      });
    }
    return syncLegacyFields({
      ...base,
      ...parsed,
      panels: mergedPanels,
    });
  } catch {
    return base;
  }
};

const extractTokens = (state: MenuLayoutTokens): MenuLayoutTokens =>
  syncLegacyFields({
    panels: state.panels,
    dividerMarginY: state.dividerMarginY,
    menuItemGap: state.menuItemGap,
    menuItemPaddingY: state.menuItemPaddingY,
    menuContainerPadding: state.menuContainerPadding,
    panelContentPaddingY: state.panelContentPaddingY,
    showAdditionalPreviews: state.showAdditionalPreviews,
    simulateLayer3Error: state.simulateLayer3Error,
    layer1Width: state.layer1Width,
    layer1Height: state.layer1Height,
    layer2Width: state.layer2Width,
    layer2Height: state.layer2Height,
    layer3Width: state.layer3Width,
    layer3Height: state.layer3Height,
  });

const saveTokens = (tokens: MenuLayoutTokens) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // ignore storage errors
  }
};

export interface MenuLayoutStore extends MenuLayoutTokens {
  setToken: <K extends keyof MenuLayoutTokens>(key: K, value: MenuLayoutTokens[K]) => void;
  updateTokens: (patch: Partial<MenuLayoutTokens>) => void;
  setPanelSizing: (panelId: MenuPanelId, patch: Partial<PanelSizingConfig>) => void;
  resetPanelSizing: (panelId: MenuPanelId) => void;
  resetTokens: () => void;
  exportConfigCode: () => string;
}

export const useMenuLayoutStore = create<MenuLayoutStore>((set, get) => ({
  ...loadSavedTokens(),

  setToken: (key, value) => {
    set((state) => {
      const next = syncLegacyFields({
        ...extractTokens(state),
        [key]: value,
      });
      saveTokens(next);
      return next;
    });
  },

  updateTokens: (patch) => {
    set((state) => {
      const next = syncLegacyFields({
        ...extractTokens(state),
        ...patch,
      });
      saveTokens(next);
      return next;
    });
  },

  setPanelSizing: (panelId, patch) => {
    set((state) => {
      const nextPanels: Record<MenuPanelId, PanelSizingConfig> = {
        ...state.panels,
        [panelId]: {
          ...state.panels[panelId],
          ...patch,
        },
      };
      const next = syncLegacyFields({
        ...extractTokens(state),
        panels: nextPanels,
      });
      saveTokens(next);
      return next;
    });
  },

  resetPanelSizing: (panelId) => {
    set((state) => {
      const nextPanels: Record<MenuPanelId, PanelSizingConfig> = {
        ...state.panels,
        [panelId]: { ...DEFAULT_PANEL_SIZING[panelId] },
      };
      const next = syncLegacyFields({
        ...extractTokens(state),
        panels: nextPanels,
      });
      saveTokens(next);
      return next;
    });
  },

  resetTokens: () => {
    const fresh = cloneDefaultTokens();
    saveTokens(fresh);
    set(() => fresh);
  },

  exportConfigCode: () => {
    const s = get();
    return `export const DEFAULT_PANEL_SIZING: Record<MenuPanelId, PanelSizingConfig> = ${JSON.stringify(
      s.panels,
      null,
      2
    )};

export const DEFAULT_MENU_LAYOUT_TOKENS = ${JSON.stringify(
      {
        dividerMarginY: s.dividerMarginY,
        menuItemGap: s.menuItemGap,
        menuItemPaddingY: s.menuItemPaddingY,
        menuContainerPadding: s.menuContainerPadding,
        panelContentPaddingY: s.panelContentPaddingY,
        showAdditionalPreviews: s.showAdditionalPreviews,
      },
      null,
      2
    )};`;
  },
}));

export const menuLayoutStore = Object.assign(useMenuLayoutStore, {
  setToken: <K extends keyof MenuLayoutTokens>(key: K, value: MenuLayoutTokens[K]) =>
    useMenuLayoutStore.getState().setToken(key, value),
  updateTokens: (patch: Partial<MenuLayoutTokens>) =>
    useMenuLayoutStore.getState().updateTokens(patch),
  setPanelSizing: (panelId: MenuPanelId, patch: Partial<PanelSizingConfig>) =>
    useMenuLayoutStore.getState().setPanelSizing(panelId, patch),
  resetPanelSizing: (panelId: MenuPanelId) =>
    useMenuLayoutStore.getState().resetPanelSizing(panelId),
  resetTokens: () => useMenuLayoutStore.getState().resetTokens(),
  exportConfigCode: () => useMenuLayoutStore.getState().exportConfigCode(),
});
