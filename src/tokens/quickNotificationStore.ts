import React from 'react';
import { create } from 'zustand';
import type {
  QuickNotificationGlowLevel,
  QuickNotificationType,
  QuickNotificationButtonConfig,
} from '../primitives/QuickNotification';
import {
  type QuickNotificationItem,
  type QuickNotificationPushOptions,
  type QuickNotificationOngoingPushOptions,
  type OngoingConflictPolicy,
  type QuickNotificationStoreState,
  validateNotificationOptions,
  resolveActiveOngoing,
  notificationScheduler,
} from './notificationScheduler';

export type {
  QuickNotificationItem,
  QuickNotificationPushOptions,
  QuickNotificationOngoingPushOptions,
  OngoingConflictPolicy,
  QuickNotificationStoreState,
};

export interface QuickNotificationActions {
  // Ongoing Tasks (Lazy Loading, Preloading, Background Sync)
  pushOngoingNotification: (config: QuickNotificationOngoingPushOptions) => string;
  pushBackgroundNotification: (config: QuickNotificationOngoingPushOptions) => string;
  updateOngoingNotification: (
    idOrUpdates: string | Partial<QuickNotificationOngoingPushOptions>,
    updates?: Partial<QuickNotificationOngoingPushOptions>
  ) => void;
  updateBackgroundNotification: (
    idOrUpdates: string | Partial<QuickNotificationOngoingPushOptions>,
    updates?: Partial<QuickNotificationOngoingPushOptions>
  ) => void;
  dismissOngoingNotification: (id?: string) => void;
  dismissBackgroundNotification: (id?: string) => void;
  completeOngoingNotification: (
    id?: string,
    options?: {
      content?: React.ReactNode;
      autoDismissMs?: number;
      icon?: string;
      tone?: QuickNotificationGlowLevel;
    }
  ) => void;
  completeBackgroundNotification: (
    id?: string,
    options?: {
      content?: React.ReactNode;
      autoDismissMs?: number;
      icon?: string;
      tone?: QuickNotificationGlowLevel;
    }
  ) => void;
  setOngoingConflictPolicy: (policy: OngoingConflictPolicy) => void;

  // Interactive Notifications (Temporary & Persistent Alerts)
  pushNotification: (config: QuickNotificationPushOptions) => string;
  updateNotification: (
    id: string,
    patch: Partial<QuickNotificationPushOptions>
  ) => void;
  dismissNotification: (id: string) => void;
  resolveNotification: (id: string) => void;

  // Active notification actions
  collapseActive: () => void;
  resolveActive: () => void;
  ignoreActive: () => void;

  // Unread stack tray
  toggleStack: () => void;
  setStackOpen: (open: boolean) => void;
  expandNotificationCenter: () => void;
  resolveFromStack: (id: string) => void;
  dismissFromStack: (id: string) => void;

  // Global reset
  clearAll: () => void;
}

export type QuickNotificationStore = QuickNotificationStoreState & QuickNotificationActions;

let activeTimer: ReturnType<typeof setTimeout> | null = null;
let activeProgressInterval: ReturnType<typeof setInterval> | null = null;

const clearActiveTimers = () => {
  if (activeTimer) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }
  if (activeProgressInterval) {
    clearInterval(activeProgressInterval);
    activeProgressInterval = null;
  }
};

const startTimerForActive = (
  item: QuickNotificationItem,
  set: (fn: (state: QuickNotificationStore) => Partial<QuickNotificationStore>) => void,
  get: () => QuickNotificationStore
) => {
  clearActiveTimers();
  if (item.type !== 'temporary') return;

  const totalMs = Math.max(800, item.duration || 3000);
  const startTime = Date.now();

  activeProgressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remainingFraction = Math.max(0, 1 - elapsed / totalMs);

    const active = get().activeNotification;
    if (active && active.id === item.id) {
      set((s) => ({
        activeNotification: {
          ...active,
          remainingProgress: remainingFraction,
        },
      }));
    }
  }, 40);

  activeTimer = setTimeout(() => {
    clearActiveTimers();
    // Temporary notification timed out: auto-collapse into unread stack and restore any preempted persistent alert
    const { nextState, restoredItem } = notificationScheduler.scheduleTimeoutAutoCollapse(get());
    set(() => nextState);

    if (restoredItem && restoredItem.type === 'temporary') {
      startTimerForActive(restoredItem, set, get);
    }
  }, totalMs);
};

export const useQuickNotificationStore = create<QuickNotificationStore>((set, get) => ({
  activeNotification: null,
  preemptedPersistentStack: [],
  unreadStack: [],
  totalUnreadCount: 0,
  isStackOpen: false,
  ongoingTasks: [],
  activeOngoingTask: null,
  ongoingConflictPolicy: 'latest',

  setOngoingConflictPolicy: (policy: OngoingConflictPolicy) => {
    const activeOngoing = resolveActiveOngoing(get().ongoingTasks, policy);
    set(() => ({
      ongoingConflictPolicy: policy,
      activeOngoingTask: activeOngoing,
    }));
  },

  pushOngoingNotification: (config: QuickNotificationOngoingPushOptions) => {
    validateNotificationOptions({ ...config, type: config.type || 'ongoing', duration: 0 });

    const taskId = config.id || `ongoing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const currentTasks = get().ongoingTasks;
    const existingIndex = currentTasks.findIndex((t) => t.id === taskId);

    const isSpinning =
      config.isSpinningIcon ??
      (typeof config.icon === 'string' &&
        (config.icon.includes('loader') || config.icon.includes('refresh') || config.icon.includes('spin')));

    const taskItem: QuickNotificationItem = {
      id: taskId,
      content: config.content,
      tone: config.tone || 'none',
      icon: config.icon || 'loader-2',
      type: 'ongoing',
      duration: 0,
      progress: config.progress,
      isSpinningIcon: isSpinning,
      timestamp: Date.now(),
    };

    let nextTasks = [...currentTasks];
    if (existingIndex >= 0) {
      nextTasks[existingIndex] = { ...nextTasks[existingIndex], ...taskItem };
    } else {
      nextTasks.push(taskItem);
    }

    const activeOngoing = resolveActiveOngoing(nextTasks, get().ongoingConflictPolicy);

    set(() => ({
      ongoingTasks: nextTasks,
      activeOngoingTask: activeOngoing,
    }));

    return taskId;
  },

  pushBackgroundNotification: (config) => get().pushOngoingNotification(config),

  updateOngoingNotification: (idOrUpdates, updates) => {
    let targetId: string | undefined;
    let patch: Partial<QuickNotificationPushOptions>;

    if (typeof idOrUpdates === 'string') {
      targetId = idOrUpdates;
      patch = updates || {};
    } else {
      targetId = get().activeOngoingTask?.id || get().ongoingTasks[get().ongoingTasks.length - 1]?.id;
      patch = idOrUpdates;
    }

    if (!targetId) return;

    const currentTasks = get().ongoingTasks;
    const targetIndex = currentTasks.findIndex((t) => t.id === targetId);
    if (targetIndex < 0) return;

    const current = currentTasks[targetIndex];
    const isSpinning =
      patch.isSpinningIcon !== undefined
        ? patch.isSpinningIcon
        : patch.icon && typeof patch.icon === 'string'
        ? patch.icon.includes('loader') || patch.icon.includes('refresh')
        : current.isSpinningIcon;

    const updatedItem: QuickNotificationItem = {
      ...current,
      content: patch.content !== undefined ? patch.content : current.content,
      tone: patch.tone !== undefined ? patch.tone : current.tone,
      icon: patch.icon !== undefined ? patch.icon : current.icon,
      progress: patch.progress !== undefined ? patch.progress : current.progress,
      isSpinningIcon: isSpinning,
      timestamp: Date.now(),
    };

    const nextTasks = [...currentTasks];
    nextTasks[targetIndex] = updatedItem;
    const activeOngoing = resolveActiveOngoing(nextTasks, get().ongoingConflictPolicy);

    set(() => ({
      ongoingTasks: nextTasks,
      activeOngoingTask: activeOngoing,
    }));
  },

  updateBackgroundNotification: (idOrUpdates, updates) =>
    get().updateOngoingNotification(idOrUpdates, updates),

  dismissOngoingNotification: (id?: string) => {
    const targetId = id || get().activeOngoingTask?.id || get().ongoingTasks[get().ongoingTasks.length - 1]?.id;
    if (!targetId) return;

    const nextTasks = get().ongoingTasks.filter((t) => t.id !== targetId);
    const activeOngoing = resolveActiveOngoing(nextTasks, get().ongoingConflictPolicy);

    set(() => ({
      ongoingTasks: nextTasks,
      activeOngoingTask: activeOngoing,
    }));
  },

  dismissBackgroundNotification: (id) => get().dismissOngoingNotification(id),

  completeOngoingNotification: (id, options) => {
    const targetId = id || get().activeOngoingTask?.id;
    if (!targetId) return;

    get().updateOngoingNotification(targetId, {
      content: options?.content || 'Completed',
      progress: 1,
      icon: options?.icon || 'check',
      isSpinningIcon: false,
      tone: options?.tone || 'none',
    });

    const dismissMs = options?.autoDismissMs ?? 1200;
    setTimeout(() => {
      get().dismissOngoingNotification(targetId);
    }, dismissMs);
  },

  completeBackgroundNotification: (id, options) =>
    get().completeOngoingNotification(id, options),

  pushNotification: (config: QuickNotificationPushOptions) => {
    // 1. Strict Runtime Validation: Prohibits silent fallback or missing/deprecated keys
    validateNotificationOptions(config);

    if (config.type === 'ongoing' || config.type === 'background') {
      return get().pushOngoingNotification(config);
    }

    clearActiveTimers();

    const newItem: QuickNotificationItem = {
      id: config.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content: config.content,
      tone: config.tone || 'none',
      icon: config.icon || 'bell',
      type: config.type,
      duration: config.duration ?? (config.type === 'temporary' ? 3000 : 0),
      buttons: config.buttons,
      actionButton: config.actionButton,
      timestamp: Date.now(),
      remainingProgress: 1,
    };

    // 2. Delegate to scheduler: handles preemption of active persistent notifications
    const nextState = notificationScheduler.schedulePush(get(), newItem);
    set(() => nextState);

    // 3. Start timer if the new notification is temporary
    startTimerForActive(newItem, set, get);
    return newItem.id;
  },

  updateNotification: (id: string, patch: Partial<QuickNotificationPushOptions>) => {
    const current = get();

    // Check active notification
    if (current.activeNotification && current.activeNotification.id === id) {
      set(() => ({
        activeNotification: {
          ...current.activeNotification!,
          ...patch,
        },
      }));
    }

    // Check preempted stack
    const preemptedIndex = current.preemptedPersistentStack.findIndex((item) => item.id === id);
    if (preemptedIndex >= 0) {
      const nextPreempted = [...current.preemptedPersistentStack];
      nextPreempted[preemptedIndex] = { ...nextPreempted[preemptedIndex], ...patch };
      set(() => ({ preemptedPersistentStack: nextPreempted }));
    }

    // Check unread stack
    const unreadIndex = current.unreadStack.findIndex((item) => item.id === id);
    if (unreadIndex >= 0) {
      const nextUnread = [...current.unreadStack];
      nextUnread[unreadIndex] = { ...nextUnread[unreadIndex], ...patch };
      set(() => ({
        unreadStack: nextUnread,
        totalUnreadCount: nextUnread.length + current.preemptedPersistentStack.length,
      }));
    }

    // Check ongoing tasks
    const ongoingIndex = current.ongoingTasks.findIndex((item) => item.id === id);
    if (ongoingIndex >= 0) {
      get().updateOngoingNotification(id, patch);
    }
  },

  dismissNotification: (id: string) => {
    clearActiveTimers();
    const { nextState, restoredItem } = notificationScheduler.scheduleDismissById(get(), id);
    set(() => nextState);

    if (restoredItem && restoredItem.type === 'temporary') {
      startTimerForActive(restoredItem, set, get);
    }
  },

  resolveNotification: (id: string) => {
    const current = get();
    const target =
      (current.activeNotification?.id === id ? current.activeNotification : null) ||
      current.preemptedPersistentStack.find((item) => item.id === id) ||
      current.unreadStack.find((item) => item.id === id);

    if (target?.actionButton?.onClick) {
      target.actionButton.onClick();
    } else if (target?.buttons?.[0]?.onClick) {
      target.buttons[0].onClick();
    }

    get().dismissNotification(id);
  },

  collapseActive: () => {
    clearActiveTimers();
    const nextState = notificationScheduler.scheduleUserCollapseActive(get());
    set(() => nextState);
  },

  resolveActive: () => {
    clearActiveTimers();
    const active = get().activeNotification;
    if (active) {
      if (active.actionButton?.onClick) {
        active.actionButton.onClick();
      } else if (active.buttons?.[0]?.onClick) {
        active.buttons[0].onClick();
      }
    }

    const { nextState, restoredItem } = notificationScheduler.scheduleResolveOrDismissActive(get());
    set(() => nextState);

    if (restoredItem && restoredItem.type === 'temporary') {
      startTimerForActive(restoredItem, set, get);
    }
  },

  ignoreActive: () => {
    clearActiveTimers();
    const { nextState, restoredItem } = notificationScheduler.scheduleResolveOrDismissActive(get());
    set(() => nextState);

    if (restoredItem && restoredItem.type === 'temporary') {
      startTimerForActive(restoredItem, set, get);
    }
  },

  toggleStack: () => {
    const totalTrayItems = get().unreadStack.length + get().preemptedPersistentStack.length;
    if (totalTrayItems === 0) return;
    set((s) => ({
      isStackOpen: !s.isStackOpen,
    }));
  },

  setStackOpen: (open: boolean) => {
    set(() => ({ isStackOpen: open }));
  },

  expandNotificationCenter: () => {
    const current = get();
    const totalTrayItems = current.unreadStack.length + current.preemptedPersistentStack.length;
    if (totalTrayItems > 0 && !current.isStackOpen) {
      set(() => ({ isStackOpen: true }));
    }
  },

  resolveFromStack: (id: string) => {
    get().resolveNotification(id);
  },

  dismissFromStack: (id: string) => {
    get().dismissNotification(id);
  },

  clearAll: () => {
    clearActiveTimers();
    set(() => ({
      activeNotification: null,
      preemptedPersistentStack: [],
      unreadStack: [],
      totalUnreadCount: 0,
      ongoingTasks: [],
      activeOngoingTask: null,
      isStackOpen: false,
    }));
  },
}));

/**
 * Universal Store instance with direct method access
 */
export const quickNotificationStore = Object.assign(useQuickNotificationStore, {
  pushNotification: (config: QuickNotificationPushOptions) =>
    useQuickNotificationStore.getState().pushNotification(config),
  pushOngoingNotification: (config: QuickNotificationOngoingPushOptions) =>
    useQuickNotificationStore.getState().pushOngoingNotification(config),
  pushBackgroundNotification: (config: QuickNotificationOngoingPushOptions) =>
    useQuickNotificationStore.getState().pushBackgroundNotification(config),
  updateOngoingNotification: (
    idOrUpdates: string | Partial<QuickNotificationOngoingPushOptions>,
    updates?: Partial<QuickNotificationOngoingPushOptions>
  ) => useQuickNotificationStore.getState().updateOngoingNotification(idOrUpdates, updates),
  updateBackgroundNotification: (
    idOrUpdates: string | Partial<QuickNotificationOngoingPushOptions>,
    updates?: Partial<QuickNotificationOngoingPushOptions>
  ) => useQuickNotificationStore.getState().updateBackgroundNotification(idOrUpdates, updates),
  dismissOngoingNotification: (id?: string) =>
    useQuickNotificationStore.getState().dismissOngoingNotification(id),
  dismissBackgroundNotification: (id?: string) =>
    useQuickNotificationStore.getState().dismissBackgroundNotification(id),
  completeOngoingNotification: (
    id?: string,
    options?: {
      content?: React.ReactNode;
      autoDismissMs?: number;
      icon?: string;
      tone?: QuickNotificationGlowLevel;
    }
  ) => useQuickNotificationStore.getState().completeOngoingNotification(id, options),
  completeBackgroundNotification: (
    id?: string,
    options?: {
      content?: React.ReactNode;
      autoDismissMs?: number;
      icon?: string;
      tone?: QuickNotificationGlowLevel;
    }
  ) => useQuickNotificationStore.getState().completeBackgroundNotification(id, options),
  updateNotification: (id: string, patch: Partial<QuickNotificationPushOptions>) =>
    useQuickNotificationStore.getState().updateNotification(id, patch),
  dismissNotification: (id: string) =>
    useQuickNotificationStore.getState().dismissNotification(id),
  resolveNotification: (id: string) =>
    useQuickNotificationStore.getState().resolveNotification(id),
  collapseActive: () => useQuickNotificationStore.getState().collapseActive(),
  resolveActive: () => useQuickNotificationStore.getState().resolveActive(),
  ignoreActive: () => useQuickNotificationStore.getState().ignoreActive(),
  toggleStack: () => useQuickNotificationStore.getState().toggleStack(),
  setStackOpen: (open: boolean) => useQuickNotificationStore.getState().setStackOpen(open),
  expandNotificationCenter: () => useQuickNotificationStore.getState().expandNotificationCenter(),
  resolveFromStack: (id: string) => useQuickNotificationStore.getState().resolveFromStack(id),
  dismissFromStack: (id: string) => useQuickNotificationStore.getState().dismissFromStack(id),
  clearAll: () => useQuickNotificationStore.getState().clearAll(),
});

/**
 * Convenient standalone sender & manager functions
 */
export const pushQuickNotification = (config: QuickNotificationPushOptions) =>
  useQuickNotificationStore.getState().pushNotification(config);

export const pushOngoingNotification = (config: QuickNotificationOngoingPushOptions) =>
  useQuickNotificationStore.getState().pushOngoingNotification(config);
export const pushBackgroundNotification = pushOngoingNotification;

export const updateOngoingNotification = (
  idOrUpdates: string | Partial<QuickNotificationOngoingPushOptions>,
  updates?: Partial<QuickNotificationOngoingPushOptions>
) => useQuickNotificationStore.getState().updateOngoingNotification(idOrUpdates, updates);
export const updateBackgroundNotification = updateOngoingNotification;

export const dismissOngoingNotification = (id?: string) =>
  useQuickNotificationStore.getState().dismissOngoingNotification(id);
export const dismissBackgroundNotification = dismissOngoingNotification;

export const completeOngoingNotification = (
  id?: string,
  options?: {
    content?: React.ReactNode;
    autoDismissMs?: number;
    icon?: string;
    tone?: QuickNotificationGlowLevel;
  }
) => useQuickNotificationStore.getState().completeOngoingNotification(id, options);
export const completeBackgroundNotification = completeOngoingNotification;

export const updateQuickNotification = (id: string, patch: Partial<QuickNotificationPushOptions>) =>
  useQuickNotificationStore.getState().updateNotification(id, patch);

export const dismissQuickNotification = (id: string) =>
  useQuickNotificationStore.getState().dismissNotification(id);

export const resolveQuickNotification = (id: string) =>
  useQuickNotificationStore.getState().resolveNotification(id);

export const expandQuickNotificationCenter = () =>
  useQuickNotificationStore.getState().expandNotificationCenter();

export const clearAllQuickNotifications = () =>
  useQuickNotificationStore.getState().clearAll();
