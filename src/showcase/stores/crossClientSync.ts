import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { attachSyncBridge } from '../../tokens/syncBridge';
import {
  cloneSerializable,
  sanitizeSyncedValue,
  isSyncSerializable,
  encodeEntriesForWire,
  decodeEntriesFromWire,
  buildValueSignature,
} from './crossClientSyncCodec';

export { sanitizeSyncedValue, isSyncSerializable };

export interface CrossClientSyncStatus {
  /** Whether the Vite WebSocket (or fallback channel) is active */
  connected: boolean;
  /** Transport mode currently active */
  transport: 'vite-ws' | 'broadcast-channel' | 'none';
  /** Whether this window has temporarily paused cross-client synchronization */
  paused: boolean;
  /** Unique client identifier for this window/tab */
  clientId: string;
  /** Timestamp of the last sent or received sync payload */
  lastSyncAt: number | null;
}

type KeyListener = (value: any) => void;
type ResetListener = (scopePrefix?: string) => void;

interface SyncBusSingleton {
  clientId: string;
  mirror: Map<string, unknown>;
  defaults: Map<string, unknown>;
  keyListeners: Map<string, Set<KeyListener>>;
  resetListeners: Set<ResetListener>;
  statusListeners: Set<() => void>;
  status: CrossClientSyncStatus;
  applyingRemoteCount: number;
  pendingOutgoing: Record<string, unknown>;
  pendingSeeds: Record<string, unknown>;
  flushScheduled: boolean;
  flushTimer: ReturnType<typeof setTimeout> | null;
  seedTimer: ReturnType<typeof setTimeout> | null;
  lastFlushTime: number;
  initialized: boolean;
  bc: BroadcastChannel | null;
}

const GLOBAL_BUS_KEY = '__UI_STORYBOOK_CROSS_CLIENT_SYNC_BUS_V3__';
const FLUSH_INTERVAL_MS = 16;

function getOrCreateBus(): SyncBusSingleton {
  const g = globalThis as Record<string, any>;
  if (g[GLOBAL_BUS_KEY]) {
    const existing = g[GLOBAL_BUS_KEY] as SyncBusSingleton;
    if (!existing.defaults) existing.defaults = new Map<string, unknown>();
    if (!existing.resetListeners) existing.resetListeners = new Set<ResetListener>();
    return existing;
  }

  const clientId =
    Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36).slice(-4);

  const hasViteHot = typeof import.meta !== 'undefined' && Boolean((import.meta as any).hot);
  const hasBC = !hasViteHot && typeof BroadcastChannel !== 'undefined';
  const syncEnabledByHost = Boolean(g.__UI_STORYBOOK_ENABLE_SYNC__);

  const bus: SyncBusSingleton = {
    clientId,
    mirror: new Map<string, unknown>(),
    defaults: new Map<string, unknown>(),
    keyListeners: new Map<string, Set<KeyListener>>(),
    resetListeners: new Set<ResetListener>(),
    statusListeners: new Set<() => void>(),
    status: {
      connected: syncEnabledByHost && (hasViteHot || hasBC),
      transport: syncEnabledByHost ? (hasViteHot ? 'vite-ws' : hasBC ? 'broadcast-channel' : 'none') : 'none',
      paused: !syncEnabledByHost,
      clientId,
      lastSyncAt: null,
    },
    applyingRemoteCount: 0,
    pendingOutgoing: {},
    pendingSeeds: {},
    flushScheduled: false,
    flushTimer: null,
    seedTimer: null,
    lastFlushTime: 0,
    initialized: false,
    bc: null,
  };

  g[GLOBAL_BUS_KEY] = bus;
  return bus;
}

const bus = getOrCreateBus();

function notifyStatusListeners() {
  bus.statusListeners.forEach((fn) => fn());
}

function updateStatus(patch: Partial<CrossClientSyncStatus>) {
  bus.status = { ...bus.status, ...patch };
  notifyStatusListeners();
}

function notifyKeyListeners(key: string, value: unknown) {
  const set = bus.keyListeners.get(key);
  if (!set || set.size === 0) return;
  set.forEach((fn) => fn(value));
}

function applyIncomingEntries(rawEntries: Record<string, unknown>) {
  if (bus.status.paused) return;
  const entries = decodeEntriesFromWire(rawEntries);
  bus.applyingRemoteCount += 1;
  try {
    let changed = false;
    for (const [key, value] of Object.entries(entries)) {
      const prev = bus.mirror.get(key);
      bus.mirror.set(key, value);
      if (!Object.is(prev, value)) {
        changed = true;
        notifyKeyListeners(key, value);
      }
    }
    if (changed) {
      updateStatus({ lastSyncAt: Date.now() });
    }
  } finally {
    bus.applyingRemoteCount -= 1;
  }
}

function applyResetInternal(scopePrefix?: string, preserveKeys: string[] = ['app:activeTab']) {
  const preserveSet = new Set(preserveKeys);
  if (!scopePrefix) {
    bus.pendingOutgoing = {};
    bus.pendingSeeds = {};
  } else {
    for (const k of Object.keys(bus.pendingOutgoing)) {
      if (k.startsWith(scopePrefix)) delete bus.pendingOutgoing[k];
    }
    for (const k of Object.keys(bus.pendingSeeds)) {
      if (k.startsWith(scopePrefix)) delete bus.pendingSeeds[k];
    }
  }

  bus.applyingRemoteCount += 1;
  try {
    const allKeys = new Set<string>([
      ...Array.from(bus.mirror.keys()),
      ...Array.from(bus.defaults.keys()),
      ...Array.from(bus.keyListeners.keys()),
    ]);

    for (const key of allKeys) {
      if (preserveSet.has(key)) continue;
      if (scopePrefix && !key.startsWith(scopePrefix)) continue;

      if (bus.defaults.has(key)) {
        const defaultVal = cloneSerializable(bus.defaults.get(key));
        bus.mirror.set(key, defaultVal);
        notifyKeyListeners(key, defaultVal);
      } else {
        bus.mirror.delete(key);
      }
    }

    bus.resetListeners.forEach((fn) => {
      try {
        fn(scopePrefix);
      } catch {
        // ignore listener errors
      }
    });

    updateStatus({ lastSyncAt: Date.now() });
  } finally {
    bus.applyingRemoteCount -= 1;
  }
}

function sendViaTransport(event: string, payload: Record<string, unknown>) {
  const hot = typeof import.meta !== 'undefined' ? (import.meta as any).hot : undefined;
  if (hot && typeof hot.send === 'function') {
    hot.send(event, payload);
    return;
  }
  if (bus.bc) {
    try {
      bus.bc.postMessage({ event, payload });
    } catch {
      // ignore serialization errors on fallback channel
    }
  }
}

function executeFlush() {
  bus.flushScheduled = false;
  if (bus.flushTimer !== null) {
    clearTimeout(bus.flushTimer);
    bus.flushTimer = null;
  }
  const keys = Object.keys(bus.pendingOutgoing);
  if (keys.length === 0 || bus.status.paused) {
    bus.pendingOutgoing = {};
    return;
  }
  const entries = encodeEntriesForWire(bus.pendingOutgoing);
  bus.pendingOutgoing = {};
  bus.lastFlushTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  updateStatus({ lastSyncAt: Date.now() });

  sendViaTransport('ui-storybook:sync-patch', {
    senderId: bus.clientId,
    entries,
    ts: Date.now(),
  });
}

function scheduleFlush() {
  if (bus.status.paused || bus.flushScheduled) return;
  bus.flushScheduled = true;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const elapsed = now - bus.lastFlushTime;
  if (elapsed >= FLUSH_INTERVAL_MS) {
    queueMicrotask(executeFlush);
  } else {
    bus.flushTimer = setTimeout(executeFlush, Math.max(1, FLUSH_INTERVAL_MS - elapsed));
  }
}

function scheduleSeedFlush() {
  if (bus.status.paused || bus.seedTimer !== null) return;
  bus.seedTimer = setTimeout(() => {
    bus.seedTimer = null;
    const keys = Object.keys(bus.pendingSeeds);
    if (keys.length === 0 || bus.status.paused) {
      bus.pendingSeeds = {};
      return;
    }
    const entries = encodeEntriesForWire(bus.pendingSeeds);
    bus.pendingSeeds = {};
    sendViaTransport('ui-storybook:sync-seed', {
      senderId: bus.clientId,
      entries,
    });
  }, 20);
}

function initTransportOnce() {
  if (bus.initialized) return;
  bus.initialized = true;

  const hot = typeof import.meta !== 'undefined' ? (import.meta as any).hot : undefined;
  if (hot && typeof hot.on === 'function') {
    hot.on(
      'ui-storybook:sync-patch',
      (data: { senderId?: string; entries?: Record<string, unknown> }) => {
        if (!data || data.senderId === bus.clientId || !data.entries) return;
        applyIncomingEntries(data.entries);
      }
    );

    hot.on(
      'ui-storybook:sync-snapshot',
      (data: { targetId?: string; entries?: Record<string, unknown> }) => {
        if (!data || !data.entries) return;
        if (data.targetId && data.targetId !== bus.clientId) return;
        applyIncomingEntries(data.entries);
      }
    );

    hot.on(
      'ui-storybook:sync-reset',
      (data: { senderId?: string; scopePrefix?: string }) => {
        if (!data || data.senderId === bus.clientId) return;
        if (bus.status.paused) return;
        applyResetInternal(data.scopePrefix);
      }
    );

    hot.on('vite:ws:connect', () => {
      updateStatus({ connected: true, transport: 'vite-ws' });
      if (!bus.status.paused) {
        if (bus.mirror.size > 0) {
          for (const [k, v] of bus.mirror.entries()) {
            bus.pendingSeeds[k] = v;
          }
          scheduleSeedFlush();
        }
        sendViaTransport('ui-storybook:sync-request', { senderId: bus.clientId });
      }
    });

    hot.on('vite:ws:disconnect', () => {
      updateStatus({ connected: false });
    });

    sendViaTransport('ui-storybook:sync-request', { senderId: bus.clientId });
    return;
  }

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel('ui-storybook-ws-fallback');
      bus.bc = bc;
      bc.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || !msg.payload) return;
        const { event, payload } = msg;
        if (payload.senderId === bus.clientId) return;
        if (event === 'ui-storybook:sync-patch' && payload.entries) {
          applyIncomingEntries(payload.entries);
        } else if (event === 'ui-storybook:sync-reset') {
          if (!bus.status.paused) {
            applyResetInternal(payload.scopePrefix);
          }
        } else if (event === 'ui-storybook:sync-seed' && payload.entries) {
          const filtered: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(payload.entries)) {
            if (!bus.mirror.has(k)) filtered[k] = v;
          }
          if (Object.keys(filtered).length > 0) applyIncomingEntries(filtered);
        } else if (event === 'ui-storybook:sync-request') {
          if (bus.mirror.size > 0) {
            bc.postMessage({
              event: 'ui-storybook:sync-snapshot',
              payload: {
                targetId: payload.senderId,
                senderId: bus.clientId,
                entries: encodeEntriesForWire(Object.fromEntries(bus.mirror.entries())),
              },
            });
          }
        } else if (
          event === 'ui-storybook:sync-snapshot' &&
          payload.targetId === bus.clientId &&
          payload.entries
        ) {
          applyIncomingEntries(payload.entries);
        }
      };
      sendViaTransport('ui-storybook:sync-request', { senderId: bus.clientId });
    } catch {
      // ignore
    }
  }
}

export function setCrossClientSyncEnabled(enabled = true): void {
  const g = globalThis as Record<string, any>;
  g.__UI_STORYBOOK_ENABLE_SYNC__ = enabled;
  if (enabled) {
    const hasViteHot = typeof import.meta !== 'undefined' && Boolean((import.meta as any).hot);
    const hasBC = !hasViteHot && typeof BroadcastChannel !== 'undefined';
    updateStatus({
      paused: false,
      connected: hasViteHot || hasBC,
      transport: hasViteHot ? 'vite-ws' : hasBC ? 'broadcast-channel' : 'none',
    });
    initTransportOnce();
  } else {
    updateStatus({ paused: true, connected: false, transport: 'none' });
  }
}

if (Boolean((globalThis as Record<string, any>).__UI_STORYBOOK_ENABLE_SYNC__)) {
  initTransportOnce();
}

export interface ExportedLayerParameters {
  activeTab: string;
  exportedAt: string;
  controls: Record<string, string | number | boolean>;
  syncedState: Record<string, unknown>;
}

export const crossClientSync = {
  setEnabled: setCrossClientSyncEnabled,
  has: (key: string): boolean => bus.mirror.has(key),

  registerDefault: <T>(key: string, defaultValue: T): void => {
    if (isSyncSerializable(defaultValue)) {
      bus.defaults.set(key, cloneSerializable(defaultValue));
    }
  },

  get: <T>(key: string, fallback: T): T => {
    if (!bus.defaults.has(key) && isSyncSerializable(fallback)) {
      bus.defaults.set(key, cloneSerializable(fallback));
    }
    if (bus.mirror.has(key)) {
      const canonical = (bus.defaults.has(key) ? bus.defaults.get(key) : fallback) as T;
      return sanitizeSyncedValue(bus.mirror.get(key), canonical);
    }
    if (isSyncSerializable(fallback)) {
      bus.mirror.set(key, fallback);
      bus.pendingSeeds[key] = fallback;
      scheduleSeedFlush();
    }
    return fallback;
  },

  seed: <T>(key: string, value: T): void => {
    if (!bus.defaults.has(key) && isSyncSerializable(value)) {
      bus.defaults.set(key, cloneSerializable(value));
    }
    if (!bus.mirror.has(key) && isSyncSerializable(value)) {
      bus.mirror.set(key, value);
      bus.pendingSeeds[key] = value;
      scheduleSeedFlush();
    }
  },

  set: <T>(key: string, value: T): void => {
    if (!isSyncSerializable(value)) return;
    const prev = bus.mirror.get(key);
    bus.mirror.set(key, value);
    if (!Object.is(prev, value)) {
      notifyKeyListeners(key, value);
    }
    if (bus.applyingRemoteCount > 0 || bus.status.paused) {
      return;
    }
    bus.pendingOutgoing[key] = value;
    scheduleFlush();
  },

  subscribeKey: <T>(key: string, listener: (value: T) => void): (() => void) => {
    let set = bus.keyListeners.get(key);
    if (!set) {
      set = new Set<KeyListener>();
      bus.keyListeners.set(key, set);
    }
    set.add(listener);
    return () => {
      set?.delete(listener);
      if (set && set.size === 0) {
        bus.keyListeners.delete(key);
      }
    };
  },

  onReset: (listener: ResetListener): (() => void) => {
    bus.resetListeners.add(listener);
    return () => {
      bus.resetListeners.delete(listener);
    };
  },

  resetAll: (options?: { scopePrefix?: string; preserveKeys?: string[] }): void => {
    const scopePrefix = options?.scopePrefix;
    const preserveKeys = options?.preserveKeys ?? ['app:activeTab'];
    applyResetInternal(scopePrefix, preserveKeys);
    if (!bus.status.paused) {
      sendViaTransport('ui-storybook:sync-reset', {
        senderId: bus.clientId,
        scopePrefix,
        ts: Date.now(),
      });
    }
  },

  exportParameters: (options?: {
    scopePrefix?: string;
    includeDomControls?: boolean;
  }): ExportedLayerParameters => {
    const activeTab = String(bus.mirror.get('app:activeTab') ?? 'overview');
    const includeDom = options?.includeDomControls ?? true;
    const controls: Record<string, string | number | boolean> = {};

    if (includeDom && typeof document !== 'undefined') {
      const root = document.querySelector('main') ?? document.body;
      const nodes = root.querySelectorAll('[data-tuner-label]');
      nodes.forEach((el) => {
        const label = el.getAttribute('data-tuner-label');
        const rawVal = el.getAttribute('data-tuner-value');
        if (!label || rawVal === null) return;
        let parsed: string | number | boolean = rawVal;
        if (rawVal === 'true') parsed = true;
        else if (rawVal === 'false') parsed = false;
        else if (/^-?\d+(\.\d+)?$/.test(rawVal)) parsed = Number(rawVal);
        const key = label in controls ? `${label} (${Object.keys(controls).length + 1})` : label;
        controls[key] = parsed;
      });
    }

    const syncedState: Record<string, unknown> = {};
    const prefix = options?.scopePrefix;
    for (const [k, v] of bus.mirror.entries()) {
      if (k === 'app:activeTab') continue;
      if (prefix) {
        if (k.startsWith(prefix)) {
          syncedState[k] = v;
        }
      } else {
        syncedState[k] = v;
      }
    }

    return {
      activeTab,
      exportedAt: new Date().toISOString(),
      controls,
      syncedState,
    };
  },

  isApplyingRemote: (): boolean => bus.applyingRemoteCount > 0,
  getStatus: (): CrossClientSyncStatus => bus.status,

  subscribeStatus: (listener: () => void): (() => void) => {
    bus.statusListeners.add(listener);
    return () => bus.statusListeners.delete(listener);
  },

  setPaused: (paused: boolean): void => {
    if (bus.status.paused === paused) return;
    updateStatus({ paused });
    if (!paused) {
      sendViaTransport('ui-storybook:sync-request', { senderId: bus.clientId });
    }
  },

  togglePaused: (): void => {
    crossClientSync.setPaused(!bus.status.paused);
  },

  requestSnapshot: (): void => {
    if (!bus.status.paused) {
      sendViaTransport('ui-storybook:sync-request', { senderId: bus.clientId });
    }
  },
};

attachSyncBridge(crossClientSync);

export function useSyncedState<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const defaultRef = useRef<{ initialized: boolean; value: T }>({
    initialized: false,
    value: undefined as unknown as T,
  });
  if (!defaultRef.current.initialized) {
    defaultRef.current.value =
      typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    defaultRef.current.initialized = true;
    crossClientSync.registerDefault(key, defaultRef.current.value);
  }

  const [state, setLocalState] = useState<T>(() => {
    const resolved = defaultRef.current.value;
    if (crossClientSync.has(key)) {
      return sanitizeSyncedValue(crossClientSync.get<T>(key, resolved), resolved);
    }
    crossClientSync.seed(key, resolved);
    return resolved;
  });

  const normalizedState = sanitizeSyncedValue(state, defaultRef.current.value);
  const latestRef = useRef<T>(normalizedState);
  latestRef.current = normalizedState;

  useEffect(() => {
    const canonicalDefault = defaultRef.current.value;
    crossClientSync.registerDefault(key, canonicalDefault);
    if (crossClientSync.has(key)) {
      const currentMirrorVal = sanitizeSyncedValue(
        crossClientSync.get<T>(key, latestRef.current),
        canonicalDefault
      );
      if (!Object.is(currentMirrorVal, latestRef.current)) {
        latestRef.current = currentMirrorVal;
        setLocalState(currentMirrorVal);
      }
    }
    return crossClientSync.subscribeKey<T>(key, (rawNextVal) => {
      const nextVal = sanitizeSyncedValue(rawNextVal, canonicalDefault);
      if (!Object.is(nextVal, latestRef.current)) {
        latestRef.current = nextVal;
        setLocalState(nextVal);
      }
    });
  }, [key]);

  const setSyncedState: Dispatch<SetStateAction<T>> = useCallback(
    (action: SetStateAction<T>) => {
      const canonicalDefault = defaultRef.current.value;
      const rawBase = crossClientSync.has(key)
        ? crossClientSync.get<T>(key, latestRef.current)
        : latestRef.current;
      const base = sanitizeSyncedValue(rawBase, canonicalDefault);
      const rawNext =
        typeof action === 'function' ? (action as (prev: T) => T)(base) : action;
      const next = sanitizeSyncedValue(rawNext, canonicalDefault);
      latestRef.current = next;
      setLocalState(next);
      crossClientSync.set(key, next);
    },
    [key]
  );

  return [normalizedState, setSyncedState];
}

export function createScopedSyncedState(scope: string) {
  let sigCounters = new Map<string, number>();
  let resetScheduled = false;

  const scheduleCounterReset = () => {
    if (resetScheduled) return;
    resetScheduled = true;
    queueMicrotask(() => {
      resetScheduled = false;
      sigCounters = new Map<string, number>();
    });
  };

  return function useScopedState<T>(
    initialValue?: T | (() => T),
    explicitSubKey?: string
  ): [T, Dispatch<SetStateAction<T>>] {
    const [scopedInit] = useState<{ key: string; value: T }>(() => {
      const resolvedValue =
        typeof initialValue === 'function'
          ? (initialValue as () => T)()
          : (initialValue as T);
      if (explicitSubKey) {
        return { key: `${scope}:${explicitSubKey}`, value: resolvedValue };
      }
      const sig = buildValueSignature(resolvedValue);
      const idx = sigCounters.get(sig) ?? 0;
      sigCounters.set(sig, idx + 1);
      scheduleCounterReset();
      return { key: `${scope}:${sig}#${idx}`, value: resolvedValue };
    });
    return useSyncedState<T>(scopedInit.key, scopedInit.value);
  };
}

export function useCrossClientSyncStatus() {
  const status = useSyncExternalStore(
    crossClientSync.subscribeStatus,
    crossClientSync.getStatus
  );
  return {
    ...status,
    setPaused: crossClientSync.setPaused,
    togglePaused: crossClientSync.togglePaused,
    requestSnapshot: crossClientSync.requestSnapshot,
    resetAll: crossClientSync.resetAll,
    exportParameters: crossClientSync.exportParameters,
  };
}
