import { useSyncExternalStore } from 'react';

export interface ViewportMetrics {
  scaleFactor: number;
  renderWidth: number;
  renderHeight: number;
  isPortrait: boolean;
  isPillarboxed: boolean;
  pillarboxWidth: number;
  safeMarginPct: number;
}

export interface ViewportState {
  renderScale: number; // 50 to 200 (%)
  safeAreaMargin: number; // -5 to +10 (%)
  showSafeAreaHud: boolean;
  portraitDismissed: boolean;
  metrics: ViewportMetrics;
}

const safeStorage = {
  get: (k: string, fallback: string | null = null): string | null => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(k) ?? fallback : fallback;
    } catch {
      return fallback;
    }
  },
  set: (k: string, v: unknown): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(k, String(v));
    } catch {
      // ignore
    }
  },
};

const getInitialMargin = (): number => {
  const val = safeStorage.get('ui-storybook-safe-area-margin');
  if (val !== null) {
    const num = parseInt(val, 10);
    if (!Number.isNaN(num)) return Math.min(10, Math.max(-5, num));
  }
  return 0;
};

const getInitialScale = (): number => {
  const val = safeStorage.get('ui-storybook-render-scale');
  if (val !== null) {
    const num = parseInt(val, 10);
    if (!Number.isNaN(num)) return Math.min(200, Math.max(50, num));
  }
  return 100;
};

const getInitialHud = (): boolean => {
  return safeStorage.get('ui-storybook-safe-area-hud') === 'true';
};

const calculateMetrics = (marginPct: number, scalePct: number): ViewportMetrics => {
  if (typeof window === 'undefined') {
    return {
      scaleFactor: 1,
      renderWidth: 1280,
      renderHeight: 720,
      isPortrait: false,
      isPillarboxed: false,
      pillarboxWidth: 0,
      safeMarginPct: marginPct,
    };
  }

  const Wwin = window.innerWidth;
  const Hwin = window.innerHeight;

  // 1. Safe Area Margin (-5% to +10%)
  const marginW = Wwin * (marginPct / 100);
  const marginH = Hwin * (marginPct / 100);
  const Wsafe = Math.max(100, Wwin - marginW * 2);
  const Hsafe = Math.max(100, Hwin - marginH * 2);

  // 2. 18:9 aspect ratio clamp (max width is Hsafe * 2.0)
  const maxRenderW = Hsafe * 2.0;
  const Wrender = Math.min(Wsafe, maxRenderW);
  const Hrender = Hsafe;

  const isPillarboxed = Wsafe > maxRenderW;
  const pillarboxWidth = isPillarboxed ? (Wsafe - Wrender) / 2 : 0;
  // 3. Portrait gate: width < height (cannot be taller than wide)
  const isPortrait = Wsafe < Hsafe;

  // SimpleUI standard: baseScale = Wrender / 1280
  const baseScale = Wrender / 1280;
  const scaleFactor = Number((baseScale * (scalePct / 100)).toFixed(3));

  return {
    scaleFactor,
    renderWidth: Wrender,
    renderHeight: Hrender,
    isPortrait,
    isPillarboxed,
    pillarboxWidth,
    safeMarginPct: marginPct,
  };
};

const applyCssVariables = (metrics: ViewportMetrics, scalePct: number, marginPct: number) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--ui-scale', String(metrics.scaleFactor));
  root.style.setProperty('--ui-user-scale', `${scalePct}%`);
  root.style.setProperty('--ui-render-width', `${Math.round(metrics.renderWidth)}px`);
  root.style.setProperty('--ui-render-height', `${Math.round(metrics.renderHeight)}px`);
  root.style.setProperty('--ui-pillarbox-width', `${Math.round(metrics.pillarboxWidth)}px`);
  root.style.setProperty('--ui-safe-margin', `${marginPct}%`);
  root.style.setProperty('--ui-font-scale', String(metrics.scaleFactor));
};

let state: ViewportState = {
  renderScale: getInitialScale(),
  safeAreaMargin: getInitialMargin(),
  showSafeAreaHud: getInitialHud(),
  portraitDismissed: false,
  metrics: calculateMetrics(getInitialMargin(), getInitialScale()),
};

const listeners = new Set<() => void>();

const notify = () => {
  state.metrics = calculateMetrics(state.safeAreaMargin, state.renderScale);
  applyCssVariables(state.metrics, state.renderScale, state.safeAreaMargin);
  listeners.forEach((listener) => listener());
};

if (typeof window !== 'undefined') {
  window.addEventListener('resize', notify);
  // initial apply
  applyCssVariables(state.metrics, state.renderScale, state.safeAreaMargin);
}

export const viewportStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setRenderScale: (scale: number) => {
    const clamped = Math.min(200, Math.max(50, Math.round(scale)));
    state = { ...state, renderScale: clamped };
    safeStorage.set('ui-storybook-render-scale', clamped);
    notify();
  },
  setSafeAreaMargin: (margin: number) => {
    const clamped = Math.min(10, Math.max(-5, Math.round(margin * 10) / 10));
    state = { ...state, safeAreaMargin: clamped };
    safeStorage.set('ui-storybook-safe-area-margin', clamped);
    notify();
  },
  setShowSafeAreaHud: (show: boolean) => {
    state = { ...state, showSafeAreaHud: show };
    safeStorage.set('ui-storybook-safe-area-hud', show);
    notify();
  },
  dismissPortraitGate: () => {
    state = { ...state, portraitDismissed: true };
    notify();
  },
};

export const useViewportStore = () => {
  return useSyncExternalStore(viewportStore.subscribe, viewportStore.getSnapshot);
};
