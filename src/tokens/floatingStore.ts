import { useSyncExternalStore } from 'react';

export interface FloatingWindowItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  width?: number;
  height?: number;
  isMinimized: boolean;
  position?: { x: number; y: number };
  resizable?: boolean;
}

export interface FloatingWindowState {
  /** Map of registered floating windows */
  windows: FloatingWindowItem[];
  /** Order of windows for z-index layering (last is on top) */
  windowOrder: string[];
  /** Whether the stack tray dropdown in top-right is open */
  isStackTrayOpen: boolean;
  /** Whether the stack icon itself in top-right is dismissed by user (when window count == 0) */
  isStackDismissed: boolean;
  /** Currently active (focused) restored window id */
  focusedWindowId: string | null;
}

let state: FloatingWindowState = {
  windows: [],
  windowOrder: [],
  isStackTrayOpen: false,
  isStackDismissed: false,
  focusedWindowId: null,
};

const listeners = new Set<() => void>();
const notify = () => {
  listeners.forEach((l) => l());
};

export const floatingStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Add a new floating window (default: restored or minimized depending on parameters) */
  spawnWindow: (item: Omit<FloatingWindowItem, 'isMinimized'> & { startMinimized?: boolean }) => {
    const existing = state.windows.find((w) => w.id === item.id);
    if (existing) {
      // If already exists, restore it and focus it
      const nextOrder = state.windowOrder.filter((id) => id !== item.id).concat(item.id);
      state = {
        ...state,
        windows: state.windows.map((w) => (w.id === item.id ? { ...w, isMinimized: false } : w)),
        windowOrder: nextOrder,
        isStackDismissed: false,
        focusedWindowId: item.id,
        isStackTrayOpen: false,
      };
      notify();
      return;
    }

    const defaultPos = {
      x: 40 + (state.windows.length % 5) * 32,
      y: 40 + (state.windows.length % 5) * 32,
    };

    const newItem: FloatingWindowItem = {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      category: item.category,
      width: item.width ?? 440,
      height: item.height ?? 300,
      isMinimized: item.startMinimized ?? false,
      position: item.position ?? defaultPos,
      resizable: item.resizable ?? true,
    };

    const nextOrder = newItem.isMinimized
      ? state.windowOrder
      : state.windowOrder.filter((id) => id !== newItem.id).concat(newItem.id);

    state = {
      ...state,
      windows: [...state.windows, newItem],
      windowOrder: nextOrder,
      isStackDismissed: false,
      focusedWindowId: newItem.isMinimized ? state.focusedWindowId : newItem.id,
    };
    notify();
  },
  /** Bring window to top of stacking order */
  bringToFront: (id: string) => {
    if (state.focusedWindowId === id && state.windowOrder[state.windowOrder.length - 1] === id) {
      return;
    }
    const nextOrder = state.windowOrder.filter((item) => item !== id).concat(id);
    state = {
      ...state,
      windowOrder: nextOrder,
      focusedWindowId: id,
    };
    notify();
  },
  /** Update recorded window position */
  updatePosition: (id: string, position: { x: number; y: number }) => {
    state = {
      ...state,
      windows: state.windows.map((w) => (w.id === id ? { ...w, position } : w)),
    };
    notify();
  },
  /** Update recorded window dimensions */
  updateSize: (id: string, size: { width: number; height: number }) => {
    state = {
      ...state,
      windows: state.windows.map((w) => (w.id === id ? { ...w, width: size.width, height: size.height } : w)),
    };
    notify();
  },
  /** Minimize a window to the top-right stack icon */
  minimizeWindow: (id: string) => {
    state = {
      ...state,
      windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
      windowOrder: state.windowOrder.filter((winId) => winId !== id),
      isStackDismissed: false,
      isStackTrayOpen: false,
      focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
    };
    notify();
  },
  /** Restore a window from the stack tray */
  restoreWindow: (id: string) => {
    const nextOrder = state.windowOrder.filter((winId) => winId !== id).concat(id);
    state = {
      ...state,
      windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: false } : w)),
      windowOrder: nextOrder,
      focusedWindowId: id,
      isStackTrayOpen: false,
    };
    notify();
  },
  /** Close and destroy a window permanently */
  closeWindow: (id: string) => {
    const nextWindows = state.windows.filter((w) => w.id !== id);
    const nextOrder = state.windowOrder.filter((wId) => wId !== id);
    const remainingMinimized = nextWindows.filter((w) => w.isMinimized).length;
    state = {
      ...state,
      windows: nextWindows,
      windowOrder: nextOrder,
      isStackTrayOpen: remainingMinimized > 0 ? state.isStackTrayOpen : false,
      focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
    };
    notify();
  },
  /** Toggle stack tray list dropdown */
  toggleStackTray: () => {
    const minimizedCount = state.windows.filter((w) => w.isMinimized).length;
    if (minimizedCount === 0) return;
    state = {
      ...state,
      isStackTrayOpen: !state.isStackTrayOpen,
    };
    notify();
  },
  setStackTrayOpen: (open: boolean) => {
    const minimizedCount = state.windows.filter((w) => w.isMinimized).length;
    if (open && minimizedCount === 0) return;
    state = {
      ...state,
      isStackTrayOpen: open,
    };
    notify();
  },
  /** Dismiss stack icon only when 0 minimized windows remain */
  dismissStack: () => {
    const minimizedCount = state.windows.filter((w) => w.isMinimized).length;
    if (minimizedCount === 0) {
      state = {
        ...state,
        isStackDismissed: true,
        isStackTrayOpen: false,
      };
      notify();
    }
  },
  /** Reset or clear all windows */
  clearAll: () => {
    state = {
      windows: [],
      windowOrder: [],
      isStackTrayOpen: false,
      isStackDismissed: true,
      focusedWindowId: null,
    };
    notify();
  },
};

export const useFloatingStore = () => {
  const snapshot = useSyncExternalStore(floatingStore.subscribe, floatingStore.getSnapshot);
  const minimizedCount = snapshot.windows.filter((w) => w.isMinimized).length;
  const totalCount = snapshot.windows.length;

  return {
    windows: snapshot.windows,
    windowOrder: snapshot.windowOrder,
    isStackTrayOpen: snapshot.isStackTrayOpen,
    isStackDismissed: snapshot.isStackDismissed,
    focusedWindowId: snapshot.focusedWindowId,
    minimizedCount,
    totalCount,
    spawnWindow: floatingStore.spawnWindow,
    bringToFront: floatingStore.bringToFront,
    updatePosition: floatingStore.updatePosition,
    updateSize: floatingStore.updateSize,
    minimizeWindow: floatingStore.minimizeWindow,
    restoreWindow: floatingStore.restoreWindow,
    closeWindow: floatingStore.closeWindow,
    toggleStackTray: floatingStore.toggleStackTray,
    setStackTrayOpen: floatingStore.setStackTrayOpen,
    dismissStack: floatingStore.dismissStack,
    clearAll: floatingStore.clearAll,
  };
};
