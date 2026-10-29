import { create } from 'zustand';
import { syncBridge } from './syncBridge';
import {
  DEFAULT_MAIN_MENU_ITEM_COLORS,
  DEFAULT_MAIN_MENU_MONO_FALLBACK_WEIGHT,
  DEFAULT_MAIN_MENU_STYLE_PARAMS,
  normalizeMainMenuContextMode,
  type MainMenuIconColorValue,
  type MainMenuItemSlotId,
  type MainMenuPlatformPreviewMode,
  type MainMenuPreviewContextMode,
  type MainMenuStyleParams,
  type MainMenuStyleVariant,
} from './mainMenuStyleTokens';

export * from './mainMenuStyleTokens';

interface SyncedMainMenuStorePayload extends MainMenuStyleParams {
  platformPreviewMode: MainMenuPlatformPreviewMode;
  titleOffsetYPx: number;
  previewContextMode: MainMenuPreviewContextMode;
}

const DEFAULT_SYNCED_MAIN_MENU_PAYLOAD: SyncedMainMenuStorePayload = {
  ...DEFAULT_MAIN_MENU_STYLE_PARAMS,
  platformPreviewMode: 'auto',
  titleOffsetYPx: 0,
  previewContextMode: 'freeplay',
};

interface MainMenuStyleStore extends SyncedMainMenuStorePayload {
  setPlatformPreviewMode: (mode: MainMenuPlatformPreviewMode) => void;
  setTitleOffsetYPx: (offsetPx: number) => void;
  setPreviewContextMode: (ctx: MainMenuPreviewContextMode) => void;
  setParam: <K extends keyof MainMenuStyleParams>(key: K, value: MainMenuStyleParams[K]) => void;
  setVariant: (variant: MainMenuStyleVariant) => void;
  setItemIconColor: (slotId: MainMenuItemSlotId, color: MainMenuIconColorValue) => void;
  applyPreset: (params: Partial<MainMenuStyleParams>) => void;
  resetParams: () => void;
  exportConfigCode: () => string;
}

const SYNC_KEY = 'store:mainMenuStyle:v2';

let isApplyingRemote = false;

export const useMainMenuStyleStore = create<MainMenuStyleStore>((set, get) => {
  const initialSnapshot = syncBridge.get<Partial<SyncedMainMenuStorePayload>>(
    SYNC_KEY,
    DEFAULT_SYNCED_MAIN_MENU_PAYLOAD
  );
  const mergedInitial: SyncedMainMenuStorePayload = {
    ...DEFAULT_SYNCED_MAIN_MENU_PAYLOAD,
    ...(initialSnapshot || {}),
    previewContextMode: normalizeMainMenuContextMode(initialSnapshot?.previewContextMode),
    itemIconColors: {
      ...DEFAULT_MAIN_MENU_ITEM_COLORS,
      ...(initialSnapshot?.itemIconColors || {}),
    },
  };

  const broadcastState = (state: MainMenuStyleStore) => {
    if (isApplyingRemote) return;
    const payload: Partial<SyncedMainMenuStorePayload> = {};
    (
      Object.keys(DEFAULT_SYNCED_MAIN_MENU_PAYLOAD) as (keyof SyncedMainMenuStorePayload)[]
    ).forEach((k) => {
      (payload as Record<string, unknown>)[k] = state[k];
    });
    syncBridge.set(SYNC_KEY, payload);
  };

  return {
    ...mergedInitial,
    setPlatformPreviewMode: (mode) => {
      set({ platformPreviewMode: mode });
      broadcastState(get());
    },
    setTitleOffsetYPx: (offsetPx) => {
      set({ titleOffsetYPx: offsetPx });
      broadcastState(get());
    },
    setPreviewContextMode: (ctx) => {
      set({ previewContextMode: normalizeMainMenuContextMode(ctx) });
      broadcastState(get());
    },
    setParam: (key, value) => {
      set((prev) => {
        const patch: Partial<MainMenuStyleParams> = { [key]: value };
        if (key === 'showDescription' && value === true && prev.variant === 'large-clean-row') {
          patch.variant = 'classic-descriptive-row';
        } else if (
          key === 'showDescription' &&
          value === false &&
          prev.variant === 'classic-descriptive-row'
        ) {
          patch.variant = 'large-clean-row';
        }
        if (key === 'titleFontFamily' && value === 'mono' && prev.titleFontWeight === 800) {
          patch.titleFontWeight = DEFAULT_MAIN_MENU_MONO_FALLBACK_WEIGHT;
        } else if (
          key === 'titleFontFamily' &&
          value === 'sans' &&
          prev.titleFontWeight === DEFAULT_MAIN_MENU_MONO_FALLBACK_WEIGHT
        ) {
          patch.titleFontWeight = 800;
        }
        return patch as Partial<MainMenuStyleStore>;
      });
      broadcastState(get());
    },
    setVariant: (variant) => {
      set(() => {
        if (variant === 'classic-descriptive-row') {
          return {
            variant,
            showDescription: true,
          };
        }
        return {
          variant,
          showDescription: false,
        };
      });
      broadcastState(get());
    },
    setItemIconColor: (slotId, color) => {
      set((prev) => ({
        usePerItemIconColors: true,
        itemIconColors: {
          ...prev.itemIconColors,
          [slotId]: color,
        },
      }));
      broadcastState(get());
    },
    applyPreset: (params) => {
      set((prev) => ({
        ...prev,
        ...params,
        itemIconColors: {
          ...prev.itemIconColors,
          ...(params.itemIconColors || {}),
        },
      }));
      broadcastState(get());
    },
    resetParams: () => {
      set((prev) => ({
        ...DEFAULT_MAIN_MENU_STYLE_PARAMS,
        itemIconColors: { ...DEFAULT_MAIN_MENU_ITEM_COLORS },
        platformPreviewMode: 'auto',
        titleOffsetYPx: 0,
        previewContextMode: prev.previewContextMode || 'freeplay',
      }));
      broadcastState(get());
    },
    exportConfigCode: () => {
      const s = get();
      const exported: Record<string, unknown> = {};
      (Object.keys(DEFAULT_MAIN_MENU_STYLE_PARAMS) as (keyof MainMenuStyleParams)[]).forEach(
        (k) => {
          exported[k] = s[k];
        }
      );
      return `// Layer 1 Main Menu Style Configuration (src/tokens/mainMenuStyleStore.ts)\nexport const MAIN_MENU_STYLE_CONFIG: MainMenuStyleParams = ${JSON.stringify(
        exported,
        null,
        2
      )};`;
    },
  };
});

syncBridge.registerDefault(SYNC_KEY, DEFAULT_SYNCED_MAIN_MENU_PAYLOAD);

syncBridge.subscribeKey<Partial<SyncedMainMenuStorePayload>>(SYNC_KEY, (remote) => {
  if (!remote || typeof remote !== 'object') return;
  isApplyingRemote = true;
  try {
    useMainMenuStyleStore.setState((prev) => ({
      ...prev,
      ...remote,
      previewContextMode: normalizeMainMenuContextMode(
        remote.previewContextMode ?? prev.previewContextMode
      ),
      itemIconColors: {
        ...prev.itemIconColors,
        ...(remote.itemIconColors || {}),
      },
    }));
  } finally {
    isApplyingRemote = false;
  }
});
