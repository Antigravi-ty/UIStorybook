import { create } from 'zustand';
import { syncBridge } from './syncBridge';
import {
  DEFAULT_CARD_ICON_COLORS,
  DEFAULT_PLAY_CARD_STYLE_PARAMS,
  type PlayCardIconColorValue,
  type PlayCardStyleParams,
  type PlayCardStyleVariant,
  type PlayModeCardId,
} from './playCardStyleTokens';

export * from './playCardStyleTokens';

interface PlayCardStyleStore extends PlayCardStyleParams {
  setParam: <K extends keyof PlayCardStyleParams>(key: K, value: PlayCardStyleParams[K]) => void;
  setVariant: (variant: PlayCardStyleVariant) => void;
  setCardIconColor: (cardId: PlayModeCardId, color: PlayCardIconColorValue) => void;
  applyPreset: (params: Partial<PlayCardStyleParams>) => void;
  resetParams: () => void;
  exportConfigCode: () => string;
}

const SYNC_KEY = 'store:playCardStyle:v3';

let isApplyingRemote = false;

export const usePlayCardStyleStore = create<PlayCardStyleStore>((set, get) => {
  const initialSnapshot = syncBridge.get<Partial<PlayCardStyleParams>>(
    SYNC_KEY,
    DEFAULT_PLAY_CARD_STYLE_PARAMS
  );
  const mergedInitial: PlayCardStyleParams = {
    ...DEFAULT_PLAY_CARD_STYLE_PARAMS,
    ...(initialSnapshot || {}),
    cardIconColors: {
      ...DEFAULT_CARD_ICON_COLORS,
      ...(initialSnapshot?.cardIconColors || {}),
    },
  };

  const broadcastState = (state: PlayCardStyleStore) => {
    if (isApplyingRemote) return;
    const payload: Partial<PlayCardStyleParams> = {};
    (Object.keys(DEFAULT_PLAY_CARD_STYLE_PARAMS) as (keyof PlayCardStyleParams)[]).forEach((k) => {
      (payload as Record<string, unknown>)[k] = state[k];
    });
    syncBridge.set(SYNC_KEY, payload);
  };

  return {
    ...mergedInitial,
    setParam: (key, value) => {
      set({ [key]: value } as Partial<PlayCardStyleStore>);
      broadcastState(get());
    },
    setVariant: (variant) => {
      set({ variant });
      broadcastState(get());
    },
    setCardIconColor: (cardId, color) => {
      set((prev) => ({
        cardIconColors: {
          ...prev.cardIconColors,
          [cardId]: color,
        },
      }));
      broadcastState(get());
    },
    applyPreset: (params) => {
      set((prev) => ({
        ...prev,
        ...params,
        cardIconColors: {
          ...prev.cardIconColors,
          ...(params.cardIconColors || {}),
        },
      }));
      broadcastState(get());
    },
    resetParams: () => {
      set({
        ...DEFAULT_PLAY_CARD_STYLE_PARAMS,
        cardIconColors: { ...DEFAULT_CARD_ICON_COLORS },
      });
      broadcastState(get());
    },
    exportConfigCode: () => {
      const s = get();
      const exported: Record<string, unknown> = {};
      (Object.keys(DEFAULT_PLAY_CARD_STYLE_PARAMS) as (keyof PlayCardStyleParams)[]).forEach((k) => {
        exported[k] = s[k];
      });
      return `// L2 PlayModeCard Style Configuration (src/tokens/playCardStyleStore.ts)\nexport const PLAY_CARD_STYLE_CONFIG: PlayCardStyleParams = ${JSON.stringify(
        exported,
        null,
        2
      )};`;
    },
  };
});

syncBridge.registerDefault(SYNC_KEY, DEFAULT_PLAY_CARD_STYLE_PARAMS);

syncBridge.subscribeKey<Partial<PlayCardStyleParams>>(SYNC_KEY, (remote) => {
  if (!remote || typeof remote !== 'object') return;
  isApplyingRemote = true;
  try {
    usePlayCardStyleStore.setState((prev) => ({
      ...prev,
      ...remote,
      cardIconColors: {
        ...prev.cardIconColors,
        ...(remote.cardIconColors || {}),
      },
    }));
  } finally {
    isApplyingRemote = false;
  }
});
