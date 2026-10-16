import { create } from 'zustand';

export interface MenuLayoutTokens {
  /** Layer 1 (Root Main Menu) outer container width in px (default: 420) */
  layer1Width: number;
  /** Layer 1 (Root Main Menu) outer container height in px (default: 520) */
  layer1Height: number;
  /** Layer 2 (Play / Garage / Settings / Previews) outer container width in px (default: 680) */
  layer2Width: number;
  /** Layer 2 outer container height in px (default: 540) */
  layer2Height: number;
  /** Layer 3 (Audio EQ / Trajectory / Online Warmup) outer container width in px (default: 480) */
  layer3Width: number;
  /** Layer 3 outer container height in px (default: 540) */
  layer3Height: number;
  /** Vertical margin (top & bottom in px) for MenuDivider (default: 2px, tightened from 6px) */
  dividerMarginY: number;
  /** Vertical flex gap (in px) between items inside MenuContainer (default: 10px) */
  menuItemGap: number;
  /** Vertical padding (top & bottom in px) inside each MenuItem (default: 12px) */
  menuItemPaddingY: number;
  /** Uniform inner padding (in px) of MenuContainer (default: 4px) */
  menuContainerPadding: number;
  /** Vertical padding (top & bottom in px) of Layer 1 PanelContent (default: 16px) */
  panelContentPaddingY: number;
  /** Whether to display the 5th button ("Additional Previews") in Layer 1 Main Menu */
  showAdditionalPreviews: boolean;
  /** Whether Layer 3 recipes display the inline single-line error notice */
  simulateLayer3Error: boolean;
}

export const DEFAULT_MENU_LAYOUT_TOKENS: MenuLayoutTokens = {
  layer1Width: 420,
  layer1Height: 520,
  layer2Width: 680,
  layer2Height: 540,
  layer3Width: 480,
  layer3Height: 540,
  dividerMarginY: 2,
  menuItemGap: 10,
  menuItemPaddingY: 12,
  menuContainerPadding: 4,
  panelContentPaddingY: 16,
  showAdditionalPreviews: true,
  simulateLayer3Error: false,
};

const STORAGE_KEY = 'ui-storybook-menu-layout-tokens-v1';

const loadSavedTokens = (): MenuLayoutTokens => {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_MENU_LAYOUT_TOKENS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MENU_LAYOUT_TOKENS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MENU_LAYOUT_TOKENS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_MENU_LAYOUT_TOKENS };
  }
};

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
  resetTokens: () => void;
  exportConfigCode: () => string;
}

export const useMenuLayoutStore = create<MenuLayoutStore>((set, get) => ({
  ...loadSavedTokens(),

  setToken: (key, value) => {
    set((state) => {
      const next: MenuLayoutTokens = {
        layer1Width: state.layer1Width,
        layer1Height: state.layer1Height,
        layer2Width: state.layer2Width,
        layer2Height: state.layer2Height,
        layer3Width: state.layer3Width,
        layer3Height: state.layer3Height,
        dividerMarginY: state.dividerMarginY,
        menuItemGap: state.menuItemGap,
        menuItemPaddingY: state.menuItemPaddingY,
        menuContainerPadding: state.menuContainerPadding,
        panelContentPaddingY: state.panelContentPaddingY,
        showAdditionalPreviews: state.showAdditionalPreviews,
        simulateLayer3Error: state.simulateLayer3Error,
        [key]: value,
      };
      saveTokens(next);
      return next;
    });
  },

  updateTokens: (patch) => {
    set((state) => {
      const next: MenuLayoutTokens = {
        layer1Width: state.layer1Width,
        layer1Height: state.layer1Height,
        layer2Width: state.layer2Width,
        layer2Height: state.layer2Height,
        layer3Width: state.layer3Width,
        layer3Height: state.layer3Height,
        dividerMarginY: state.dividerMarginY,
        menuItemGap: state.menuItemGap,
        menuItemPaddingY: state.menuItemPaddingY,
        menuContainerPadding: state.menuContainerPadding,
        panelContentPaddingY: state.panelContentPaddingY,
        showAdditionalPreviews: state.showAdditionalPreviews,
        simulateLayer3Error: state.simulateLayer3Error,
        ...patch,
      };
      saveTokens(next);
      return next;
    });
  },

  resetTokens: () => {
    saveTokens(DEFAULT_MENU_LAYOUT_TOKENS);
    set(() => ({ ...DEFAULT_MENU_LAYOUT_TOKENS }));
  },

  exportConfigCode: () => {
    const s = get();
    return `export const DEFAULT_MENU_LAYOUT_TOKENS: MenuLayoutTokens = ${JSON.stringify(
      {
        layer1Width: s.layer1Width,
        layer1Height: s.layer1Height,
        layer2Width: s.layer2Width,
        layer2Height: s.layer2Height,
        layer3Width: s.layer3Width,
        layer3Height: s.layer3Height,
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
  resetTokens: () => useMenuLayoutStore.getState().resetTokens(),
  exportConfigCode: () => useMenuLayoutStore.getState().exportConfigCode(),
});
