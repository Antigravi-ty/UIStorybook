import React, { useState, useEffect, useRef } from 'react';
import {
  BellDot,
  Layers,
  Sparkles,
  CircleSlash,
  Type,
  Trash2,
  Check,
  ThumbsDown,
  RotateCcw,
  MinusCircle,
  Ban,
  Hand,
  Sliders,
  Send,
  Eye,
  Plus,
  X,
  Palette,
  ExternalLink,
  Loader2,
  Download,
  Play,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  useQuickNotificationStore,
  QuickNotificationItem,
  pushOngoingNotification,
  updateOngoingNotification,
  dismissOngoingNotification,
  completeOngoingNotification,
} from '../../tokens/quickNotificationStore';
import {
  QuickNotificationDrawer,
  CollapseToRightIcon,
  getButtonColorClass,
  MONO_FONT_STACK,
  type QuickNotificationGlowLevel,
  type QuickNotificationType,
  type QuickNotificationButtonConfig,
  type QuickNotificationButtonVariant,
  type QuickNotificationButtonFormat,
} from '../../primitives/QuickNotification';
import {
  QuickNotificationSystem,
  type NotificationIconLifecycle,
} from '../../navigation/QuickNotificationSystem';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';

const PRESET_ICONS = [
  'bell',
  'loader-2',
  'download',
  'octagon-alert',
  'triangle-alert',
  'info',
  'flame',
  'sparkles',
  'check-circle',
  'shield-alert',
  'activity',
];

const PRESET_TONES: { key: QuickNotificationGlowLevel; label: string; dotClass: string }[] = [
  { key: 'none', label: 'none (无发光)', dotClass: 'bg-neutral-400' },
  { key: 'info', label: 'info (灰色)', dotClass: 'bg-neutral-300' },
  { key: 'warning', label: 'warning (黄色)', dotClass: 'bg-yellow-500' },
  { key: 'orange', label: 'orange (橙色)', dotClass: 'bg-orange-500' },
  { key: 'error', label: 'error (红色)', dotClass: 'bg-red-500' },
];

const BUTTON_COLOR_SWATCHES: {
  key: QuickNotificationButtonVariant;
  label: string;
  dotClass: string;
}[] = [
  { key: 'green', label: '绿 (接受)', dotClass: 'bg-emerald-500' },
  { key: 'red', label: '红 (拒绝)', dotClass: 'bg-red-500' },
  { key: 'amber', label: '橙黄 (重试)', dotClass: 'bg-amber-500' },
  { key: 'neutral', label: '中性黑白', dotClass: 'bg-neutral-900 dark:bg-neutral-100' },
  { key: 'sky', label: '经典蓝', dotClass: 'bg-sky-500' },
  { key: 'purple', label: '特殊紫', dotClass: 'bg-purple-500' },
];

const REJECT_ICON_OPTIONS = [
  { key: 'thumbs-down', label: 'Thumbs Down (推荐)', icon: <ThumbsDown className="h-3 w-3" /> },
  { key: 'minus-circle', label: 'Minus Circle', icon: <MinusCircle className="h-3 w-3" /> },
  { key: 'ban', label: 'Ban Circle', icon: <Ban className="h-3 w-3" /> },
  { key: 'hand', label: 'Hand Stop', icon: <Hand className="h-3 w-3" /> },
];

export const QuickNotificationPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  const {
    activeNotification,
    unreadStack,
    totalUnreadCount,
    ongoingTasks,
    activeOngoingTask,
    ongoingConflictPolicy,
    pushNotification,
    setOngoingConflictPolicy,
    clearAll,
  } = useQuickNotificationStore();

  // Decoupled local presentation & debugging states
  const [showStackIcon, setShowStackIcon] = useState<boolean>(true);
  const [liveMode, setLiveMode] = useState<boolean>(false);
  const [iconLifecycle, setIconLifecycle] = useState<NotificationIconLifecycle>('hidden');

  // Local configuration states
  const [temporalType, setTemporalType] = useState<QuickNotificationType>('temporary');
  const [durationPreset, setDurationPreset] = useState<'3000' | '5000' | 'custom'>('3000');
  const [customDurationMs, setCustomDurationMs] = useState<number>(4000);
  const [tone, setTone] = useState<QuickNotificationGlowLevel>('warning');
  const [iconName, setIconName] = useState<string>('triangle-alert');
  const [content, setContent] = useState<string>(
    'Telemetry pipeline latency exceeded threshold (148ms > 80ms).'
  );

  // Ongoing task specific states
  const [ongoingProgressMode, setOngoingProgressMode] = useState<'determinate' | 'indeterminate' | 'none'>('determinate');
  const [ongoingProgressPct, setOngoingProgressPct] = useState<number>(45);
  const [isSpinningIcon, setIsSpinningIcon] = useState<boolean>(true);

  // Simulation timer refs for clean lifecycle teardown
  const simTimersRef = useRef<any[]>([]);
  const clearSimTimers = () => {
    simTimersRef.current.forEach((t) => clearTimeout(t));
    simTimersRef.current = [];
  };

  useEffect(() => {
    return () => clearSimTimers();
  }, []);

  // Dynamic business action buttons
  const [buttons, setButtons] = useState<QuickNotificationButtonConfig[]>([
    { key: 'btn-accept', label: 'Accept', icon: 'check', format: 'icon-text', color: 'green' },
    { key: 'btn-reject', label: 'Reject', icon: 'thumbs-down', format: 'icon-only', color: 'red' },
  ]);

  // New button form state
  const [newBtnLabel, setNewBtnLabel] = useState<string>('Retry');
  const [newBtnIcon, setNewBtnIcon] = useState<string>('rotate-ccw');
  const [newBtnFormat, setNewBtnFormat] = useState<QuickNotificationButtonFormat>('icon-text');
  const [newBtnColor, setNewBtnColor] = useState<QuickNotificationButtonVariant>('amber');

  // Compute effective duration in ms
  const effectiveDuration =
    temporalType === 'temporary'
      ? durationPreset === 'custom'
        ? Math.max(500, customDurationMs || 3000)
        : Number(durationPreset)
      : 0;

  // Character count statistics for Live Mode analysis
  const totalChars = content.length;
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const asciiChars = totalChars - chineseChars;
  const estimatedContentWidthPx = Math.round(chineseChars * 14 + asciiChars * 8.5);

  // Live Mode Preview Draft (pure local presentation, completely decoupled from store)
  const livePreviewDraft: QuickNotificationItem = {
    id: 'live-draft-preview',
    content,
    tone,
    icon: iconName,
    type: temporalType,
    duration: effectiveDuration,
    buttons: temporalType === 'ongoing' ? undefined : buttons,
    progress:
      temporalType === 'ongoing'
        ? ongoingProgressMode === 'indeterminate'
          ? 'indeterminate'
          : ongoingProgressMode === 'determinate'
          ? ongoingProgressPct / 100
          : undefined
        : undefined,
    isSpinningIcon: temporalType === 'ongoing' ? isSpinningIcon : false,
    timestamp: Date.now(),
    remainingProgress: 1,
  };

  const handleAddButton = () => {
    const trimmed = newBtnLabel.trim();
    const btn: QuickNotificationButtonConfig = {
      key: `btn-${Date.now()}`,
      label: trimmed || undefined,
      icon: newBtnIcon.trim() || undefined,
      format: newBtnFormat,
      color: newBtnColor,
    };
    setButtons((prev) => [...prev, btn]);
  };

  const handleRemoveButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePushCurrent = () => {
    if (temporalType === 'ongoing') {
      pushOngoingNotification({
        content,
        tone,
        icon: iconName,
        progress:
          ongoingProgressMode === 'indeterminate'
            ? 'indeterminate'
            : ongoingProgressMode === 'determinate'
            ? ongoingProgressPct / 100
            : undefined,
        isSpinningIcon,
      });
      return;
    }

    pushNotification({
      content,
      tone,
      icon: iconName,
      type: temporalType,
      duration: effectiveDuration,
      buttons,
    });
  };

  const handlePushPreset = (
    presetTone: QuickNotificationGlowLevel,
    presetType: QuickNotificationType,
    presetDuration: number,
    presetIcon: string,
    presetText: string,
    presetButtons?: QuickNotificationButtonConfig[]
  ) => {
    pushNotification({
      tone: presetTone,
      type: presetType,
      duration: presetDuration,
      icon: presetIcon,
      content: presetText,
      buttons: presetButtons,
    });
  };

  const handlePushBatch = () => {
    handlePushPreset(
      'error',
      'persistent',
      0,
      'octagon-alert',
      'Critical: Main game loop frame drop detected',
      [
        { key: 'reconnect', label: 'Reconnect', icon: 'rotate-ccw', format: 'icon-text', color: 'amber' },
      ]
    );
    setTimeout(() => {
      handlePushPreset(
        'warning',
        'temporary',
        3000,
        'flame',
        'GPU temperature reached 84°C',
        [
          { key: 'cool', label: 'Cool', icon: 'check', format: 'icon-only', color: 'green' },
          { key: 'ignore', label: 'Mute', icon: 'thumbs-down', format: 'icon-only', color: 'red' },
        ]
      );
    }, 450);
    setTimeout(() => {
      handlePushPreset(
        'info',
        'temporary',
        5000,
        'bell',
        'Notice: Sync token refreshed successfully'
      );
    }, 900);
  };

  /**
   * Simulation 1: Real-world Lazy Loading pipeline simulation (5 steps)
   */
  const handleRunLazyLoadingSimulation = () => {
    clearSimTimers();
    const taskId = 'lazy-load-sim';

    // Step 1: 0ms - Indeterminate manifest verification
    pushOngoingNotification({
      id: taskId,
      content: 'Step 1/5: Verifying optional asset manifests...',
      icon: 'loader-2',
      progress: 'indeterminate',
      isSpinningIcon: true,
      tone: 'none',
    });

    // Step 2: 1200ms - Audio pack download (25%)
    simTimersRef.current.push(
      setTimeout(() => {
        updateOngoingNotification(taskId, {
          content: 'Step 2/5: Audio sound packs 25% (2.4MB / 9.6MB)',
          icon: 'download',
          progress: 0.25,
          isSpinningIcon: false,
          tone: 'none',
        });
      }, 1200)
    );

    // Step 3: 2500ms - Stadium high-res textures (60%)
    simTimersRef.current.push(
      setTimeout(() => {
        updateOngoingNotification(taskId, {
          content: 'Step 3/5: Stadium textures 60% (14.4MB / 24.0MB)',
          icon: 'download',
          progress: 0.6,
          isSpinningIcon: false,
          tone: 'none',
        });
      }, 2500)
    );

    // Step 4: 3800ms - WebGPU Shaders Warmup (85%)
    simTimersRef.current.push(
      setTimeout(() => {
        updateOngoingNotification(taskId, {
          content: 'Step 4/5: Compiling WebGPU shaders (34/40 variants)',
          icon: 'loader-2',
          progress: 0.85,
          isSpinningIcon: true,
          tone: 'none',
        });
      }, 3800)
    );

    // Step 5: 5000ms - Finalizing (100%)
    simTimersRef.current.push(
      setTimeout(() => {
        updateOngoingNotification(taskId, {
          content: 'Step 5/5: Finalizing non-essential assets 100%',
          icon: 'loader-2',
          progress: 1.0,
          isSpinningIcon: true,
          tone: 'none',
        });
      }, 5000)
    );

    // Step 6: 6200ms - Remote Complete & Smooth Auto-dismiss
    simTimersRef.current.push(
      setTimeout(() => {
        completeOngoingNotification(taskId, {
          content: 'All lazy-loaded assets ready!',
          icon: 'check',
          autoDismissMs: 1400,
          tone: 'none',
        });
      }, 6200)
    );
  };

  /**
   * Simulation 2: Priority Preemption & Restore Test (Cover & Restore)
   * 1. Starts a background download task.
   * 2. After 700ms, a high-priority 3s temporary warning notification is pushed.
   * 3. The warning takes over the drawer immediately (ongoing yields/covered).
   * 4. When 3s finishes and warning collapses to unread bubble [1], ongoing automatically restores!
   */
  const handleRunPriorityPreemptionTest = () => {
    clearSimTimers();
    const taskId = 'bg-stream-task';

    // Start background streaming
    pushOngoingNotification({
      id: taskId,
      content: 'Lazy Loading: Streaming Champions Field textures (32%)...',
      icon: 'download',
      progress: 0.32,
      isSpinningIcon: false,
      tone: 'none',
    });

    // Inject high-priority temporary notification after 700ms
    simTimersRef.current.push(
      setTimeout(() => {
        pushNotification({
          content: 'Telemetry spike: 154ms > 80ms threshold',
          tone: 'warning',
          icon: 'triangle-alert',
          type: 'temporary',
          duration: 3000,
          buttons: [
            { key: 'inspect', label: 'Inspect', icon: 'rotate-ccw', format: 'icon-text', color: 'amber' },
          ],
        });
      }, 700)
    );
  };

  /**
   * Simulation 3: Multi-task Conflict & Stack Test
   */
  const handleRunMultiTaskTest = () => {
    clearSimTimers();
    pushOngoingNotification({
      id: 'task-audio',
      content: 'Task A: Downloading audio pack (40%)',
      progress: 0.4,
      icon: 'download',
      isSpinningIcon: false,
    });

    simTimersRef.current.push(
      setTimeout(() => {
        pushOngoingNotification({
          id: 'task-decals',
          content: 'Task B: Caching custom decals (80%)',
          progress: 0.8,
          icon: 'sparkles',
          isSpinningIcon: false,
        });
      }, 600)
    );
  };

  const generatedUsageCode = `import { QuickNotificationDrawer } from '@/primitives/QuickNotification';
import { QuickNotificationSystem } from '@/navigation/QuickNotificationSystem';
import {
  quickNotificationStore,
  pushQuickNotification,
  pushOngoingNotification,
  updateOngoingNotification,
  dismissOngoingNotification,
  completeOngoingNotification,
} from '@/tokens/quickNotificationStore';

// ── 场景 A: 后台任务 / Lazy Loading 通知 (最低优先级、用户不可关闭、自动覆盖与恢复) ──
// 1. 启动后台异步任务 (如 Lazy Loading 非必要资源)
const taskId = pushOngoingNotification({
  id: 'lazy-pack-downloader', // 可选指定 ID，用于后续精准更新与关闭
  content: 'Lazy Loading: Downloading optional textures (45%)...',
  icon: 'download',           // Lucide 图标名
  progress: 0.45,             // 0~1 确定百分比，或 'indeterminate' 不确定流光呼吸波
  isSpinningIcon: false,      // 图标是否旋转
  tone: 'none',               // 常规底板无内发光
});

// 2. 原地平滑更新进度 (不触发重绘与入场离场闪烁)
updateOngoingNotification(taskId, {
  content: 'Lazy Loading: Compiling shaders (85%)...',
  progress: 0.85,
  icon: 'loader-2',
  isSpinningIcon: true,
});

// 3. 异步任务完成时，远程通知完成并自动优雅退出
completeOngoingNotification(taskId, {
  content: 'All background assets ready!',
  autoDismissMs: 1400, // 停留 1.4s 闪烁就绪态后自动收起卸载
});

// ── 场景 B: 常规交互通知 (Temporary / Persistent - 拥有高优先级，会自动覆盖后台任务) ──
pushQuickNotification({
  content: ${JSON.stringify(content)},
  tone: '${tone}',
  icon: '${iconName}',
  type: '${temporalType}',
  duration: ${effectiveDuration},
  buttons: ${JSON.stringify(buttons, null, 2)},
});

// ── 场景 C: 接收容器 (现成即用，自动编排优先级与让位流转) ──
<QuickNotificationSystem
  slotRight={/* 自定义 Slot 1 节点或布尔值 */}
/>`;

  return (
    <div
      style={{ fontFamily: MONO_FONT_STACK }}
      className="flex flex-col gap-5 w-full relative font-mono text-xs"
    >
      {/* ──────────────────────────────────────────────────────────────────
          1. Page Header (顶栏标题)
         ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shrink-0">
            <BellDot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Quick Notification 快速通知系统
            </h1>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              轻量级抽屉式通知。4 级内发光及无发光常规底板、最右侧收起黑键、多业务按钮色卡与横向抽屉展开动效。
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          2. Active Canvas Stage (直接置于顶部，视野更开阔)
         ────────────────────────────────────────────────────────────────── */}
      <div
        className={`relative w-full min-h-[520px] rounded-2xl border p-6 overflow-hidden select-none transition-colors ${
          isLight
            ? 'bg-neutral-100/70 border-neutral-200 shadow-inner'
            : 'bg-neutral-950/80 border-neutral-800 shadow-inner'
        }`}
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#d4d4d8 1px, transparent 1px)'
            : 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Background Canvas Ambient Notice */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30 select-none">
          <span className="text-3xl mb-1">🔔</span>
          <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
            [Quick Notification Simulation Canvas]
          </span>
          <span className="text-[11px] text-neutral-400 max-w-md text-center mt-1">
            右上角双顺位槽位：Slot 1 (Stack Icon / 空档) 与 Slot 2 (Notification Icon)。未读堆栈展开时每个抽屉从最右向左拉出。
          </span>
        </div>

        {/* 
          Quick Notification Visual System (Hosts the top-right cluster, drawer, and unread dropdown)
          Decoupled: supports controlled previewNotification, custom slotRight, and autonomous animation lifecycle.
        */}
        <QuickNotificationSystem
          isLight={isLight}
          absolute={true}
          slotRight={showStackIcon}
          previewNotification={liveMode ? livePreviewDraft : null}
          onLifecycleChange={setIconLifecycle}
        />

        {/* Floating live mode watermark overlay on canvas */}
        {liveMode && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-500 text-[11px] font-mono pointer-events-none">
            <Eye className="h-3.5 w-3.5 animate-pulse" />
            <span>LIVE 实时调试模式开启 · 字符与按钮实时投影</span>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          3. State Active & Telemetry Status Bar (挪到 Simulation Canvas 下方)
             包含清空通知按钮、Active状态、未读统计与快捷推送
         ────────────────────────────────────────────────────────────────── */}
      <div
        className={`px-4 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-colors ${
          isLight
            ? 'bg-neutral-50/80 border-neutral-200 text-neutral-700 shadow-2xs'
            : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
        }`}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Icon State:</span>
            <span
              className={`font-bold ${
                iconLifecycle === 'visible'
                  ? 'text-emerald-500'
                  : iconLifecycle === 'spawning'
                  ? 'text-amber-500'
                  : iconLifecycle === 'hidden'
                  ? 'text-neutral-500'
                  : 'text-red-500'
              }`}
            >
              {iconLifecycle.toUpperCase()}
            </span>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Active Drawer:</span>
            <strong className="text-neutral-900 dark:text-neutral-100 font-bold">
              {activeNotification
                ? `[${activeNotification.type.toUpperCase()}] ${typeof activeNotification.content === 'string' ? activeNotification.content.slice(0, 24) : 'User Active'}...`
                : activeOngoingTask
                ? `[ONGOING] ${typeof activeOngoingTask.content === 'string' ? activeOngoingTask.content.slice(0, 24) : activeOngoingTask.id}...`
                : 'NONE (IDLE)'}
            </strong>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Ongoing Task:</span>
            {activeOngoingTask ? (
              <span className="flex items-center gap-1">
                <span
                  className={`font-bold ${
                    activeNotification ? 'text-amber-500' : 'text-emerald-500'
                  }`}
                >
                  {activeNotification ? '[YIELDED / COVERED]' : '[ACTIVE]'}
                </span>
                <span className="text-neutral-900 dark:text-neutral-100 font-bold max-w-[130px] truncate">
                  {typeof activeOngoingTask.content === 'string'
                    ? activeOngoingTask.content
                    : activeOngoingTask.id}
                </span>
                {typeof activeOngoingTask.progress === 'number' && (
                  <span className="text-neutral-400 font-normal">
                    ({Math.round(activeOngoingTask.progress > 1 ? activeOngoingTask.progress : activeOngoingTask.progress * 100)}%)
                  </span>
                )}
              </span>
            ) : (
              <strong className="text-neutral-400">NONE</strong>
            )}
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Policy:</span>
            <button
              type="button"
              onClick={() =>
                setOngoingConflictPolicy(
                  ongoingConflictPolicy === 'latest' ? 'first' : 'latest'
                )
              }
              className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700"
              title="点击切换多任务策略 (latest / first)"
            >
              {ongoingConflictPolicy.toUpperCase()}
            </button>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Unread in Stack:</span>
            <strong className="text-neutral-900 dark:text-neutral-100 font-bold">
              {totalUnreadCount}
            </strong>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Slot 1 (Right):</span>
            <strong className={showStackIcon ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}>
              {showStackIcon ? 'SLOT 1 (40px)' : 'DECOUPLED (0px 无占位)'}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Push button right in the telemetry bar */}
          <Button
            variant="primary"
            size="sm"
            isLight={isLight}
            icon={<Send className="h-3.5 w-3.5" />}
            onClick={handlePushCurrent}
            className="font-mono text-xs"
          >
            推送当前通知
          </Button>

          {/* Clear all button in telemetry area */}
          {(activeNotification || totalUnreadCount > 0 || ongoingTasks.length > 0) && (
            <Button
              variant="danger"
              size="sm"
              isLight={isLight}
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={clearAll}
            >
              清空通知 ({totalUnreadCount + (activeNotification ? 1 : 0) + ongoingTasks.length})
            </Button>
          )}

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>Mode:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded ${
                liveMode
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {liveMode ? 'LIVE' : 'PUSH'}
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          4. Lower Grid: Control Panel (Left 7 cols) & Test Presets (Right 5 cols)
         ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Core Controls (7 cols) */}
        <div
          className={`lg:col-span-7 flex flex-col gap-5 p-5 rounded-2xl border ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold tracking-tight">参数控制面板 (Control Panel)</h2>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-neutral-500">Slot 1 (Right):</span>
              <input
                type="checkbox"
                checked={showStackIcon}
                onChange={(e) => setShowStackIcon(e.target.checked)}
                className="rounded cursor-pointer accent-neutral-900 dark:accent-neutral-100"
              />
            </div>
          </div>

          {/* Mode Switch: Live Mode Toggle */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              liveMode
                ? isLight
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                : isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
                : 'bg-neutral-850 border-neutral-800 text-neutral-300'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Eye className="h-3.5 w-3.5 text-amber-500" />
                <span>Live 实时调试模式 (Live Mode)</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                实时将文本、图标、样式与按钮更改投影至右上角抽屉，方便测试排版与字符极限。
              </p>
            </div>

            <ToggleSwitch
              checked={liveMode}
              onCheckedChange={setLiveMode}
              variant="amber"
              isLight={isLight}
            />
          </div>

          {/* Real-time Character Counter */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-850/60 border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" />
                <span>实时字符长度统计 (Live Character Telemetry)</span>
              </span>
              <span className="text-[11px] text-neutral-500">单位: 字符 / 预估宽度</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400">总字符数</div>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{totalChars}</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400">中文字符</div>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{chineseChars}</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400">英文/数字/符号</div>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{asciiChars}</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400">预估文字宽</div>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">~{estimatedContentWidthPx}px</div>
              </div>
            </div>
          </div>

          {/* Temporal Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <span>1. 时效与通知类型 (Temporal & Task Spec)</span>
              <span className="text-[11px] lowercase text-neutral-400 font-normal">
                {temporalType === 'temporary'
                  ? '超时自动收起并计数'
                  : temporalType === 'persistent'
                  ? '常驻通知 (最右侧强制收起黑键)'
                  : '后台伴随/任务 (最低优先级 · 无法手动关闭 · 自动让位与恢复)'}
              </span>
            </div>

            <SegmentedSwitch
              value={temporalType}
              onValueChange={(val) => setTemporalType(val as QuickNotificationType)}
              options={[
                { value: 'temporary', label: 'Temporary (临时)' },
                { value: 'persistent', label: 'Persistent (常驻)' },
                { value: 'ongoing', label: 'Ongoing (后台任务)' },
              ]}
              isLight={isLight}
              distribution="equal"
            />

            {/* Temporary Duration Controls */}
            {temporalType === 'temporary' && (
              <div className="flex flex-col gap-2 mt-1 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40">
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>时间参数 (原生毫秒 ms)</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    当前: {effectiveDuration}ms ({((effectiveDuration) / 1000).toFixed(1)}s)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationPreset('3000')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      durationPreset === '3000'
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    3000ms (3秒)
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationPreset('5000')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      durationPreset === '5000'
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    5000ms (5秒)
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationPreset('custom')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      durationPreset === 'custom'
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    自定义 (Custom)
                  </button>
                </div>

                {durationPreset === 'custom' && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-neutral-400">毫秒值:</span>
                    <input
                      type="number"
                      step={500}
                      min={500}
                      max={60000}
                      value={customDurationMs}
                      onChange={(e) => setCustomDurationMs(Number(e.target.value))}
                      className="w-32 px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono"
                    />
                    <span className="text-[11px] text-neutral-400">ms</span>
                  </div>
                )}
              </div>
            )}

            {/* Ongoing Task Controls (Lazy Loading, Downloads, Shaders) */}
            {temporalType === 'ongoing' && (
              <div className="flex flex-col gap-2.5 mt-1 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40">
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    进度条参数 (Progress Spec)
                  </span>
                  <span className="text-[10px] text-amber-500 font-bold">
                    最低优先级 · 用户不可关闭 · 远程驱动
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOngoingProgressMode('determinate')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      ongoingProgressMode === 'determinate'
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    确定进度 ({ongoingProgressPct}%)
                  </button>

                  <button
                    type="button"
                    onClick={() => setOngoingProgressMode('indeterminate')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      ongoingProgressMode === 'indeterminate'
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    流光呼吸波 (Shimmer)
                  </button>

                  <button
                    type="button"
                    onClick={() => setOngoingProgressMode('none')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      ongoingProgressMode === 'none'
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    无进度条 (仅文本)
                  </button>
                </div>

                {ongoingProgressMode === 'determinate' && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-neutral-400 w-16">进度调节:</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={ongoingProgressPct}
                      onChange={(e) => setOngoingProgressPct(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold w-12 text-right">
                      {ongoingProgressPct}%
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60 text-[11px]">
                  <span className="text-neutral-400">图标旋转动效 (animate-spin):</span>
                  <ToggleSwitch
                    checked={isSpinningIcon}
                    onCheckedChange={setIsSpinningIcon}
                    variant="amber"
                    isLight={isLight}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tone / Inner Glow Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <span>2. 视觉样式与内发光 (Tone & Inner Glow Level)</span>
              <span className="text-[11px] text-neutral-500 lowercase font-normal">4 级辉光 + 1 级无发光常规底板</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {PRESET_TONES.map((t) => {
                const isSelected = tone === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTone(t.key)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-2xs'
                          : 'bg-white text-neutral-950 border-white font-bold shadow-2xs'
                        : isLight
                        ? 'bg-neutral-100/60 hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                        : 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${t.dotClass} shrink-0`} />
                    <span className="truncate">{t.key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leading Icon Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <span>3. 最前置图标 (Leading Lucide Icon)</span>
              <span className="text-[11px] text-neutral-500 lowercase font-normal">对标 Dialogue 规范</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_ICONS.map((icon) => {
                const isSelected = iconName === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setIconName(icon)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-neutral-100/60 border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span>{icon}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-neutral-400">自定义图标名:</span>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="e.g. bell, flame, activity"
                className="flex-1 px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono"
              />
            </div>
          </div>

          {/* Content Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <span>4. 通知正文内容 (Notification Content)</span>
              <span className="text-[11px] text-neutral-400 font-normal">{totalChars} 字符</span>
            </div>

            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="输入通知提示文字..."
            />
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              5. Dynamic Business Action Buttons (业务按钮定制器)
             ────────────────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <span>5. 业务操作按钮 (Business Buttons Slot)</span>
              <span className="text-[11px] text-neutral-400 lowercase font-normal">
                {buttons.length} 个配置 · 触发后不计入未读数
              </span>
            </div>

            {/* Quick button preset templates */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-500">快捷预设模板:</span>
              <button
                type="button"
                onClick={() =>
                  setButtons([
                    { key: 'accept', label: 'Accept', icon: 'check', format: 'icon-text', color: 'green' },
                    { key: 'reject', label: 'Reject', icon: 'thumbs-down', format: 'icon-only', color: 'red' },
                  ])
                }
                className="px-2 py-0.5 rounded text-[11px] bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
              >
                接受(绿) + 拒绝(红 ThumbsDown)
              </button>
              <button
                type="button"
                onClick={() =>
                  setButtons([
                    { key: 'accept', label: 'Accept', icon: 'check', format: 'icon-text', color: 'green' },
                  ])
                }
                className="px-2 py-0.5 rounded text-[11px] bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
              >
                单按钮：接受
              </button>
              <button
                type="button"
                onClick={() =>
                  setButtons([
                    { key: 'retry', label: 'Retry', icon: 'rotate-ccw', format: 'icon-text', color: 'amber' },
                  ])
                }
                className="px-2 py-0.5 rounded text-[11px] bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
              >
                重试(橙 RotateCcw)
              </button>
              <button
                type="button"
                onClick={() => setButtons([])}
                className="px-2 py-0.5 rounded text-[11px] text-red-500 bg-red-100/40 dark:bg-red-950/40 hover:bg-red-100 cursor-pointer"
              >
                清空按钮
              </button>
            </div>

            {/* Existing buttons list */}
            {buttons.length > 0 && (
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
                {buttons.map((b, idx) => (
                  <div
                    key={b.key || idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-850"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${BUTTON_COLOR_SWATCHES.find(c => c.key === b.color)?.dotClass || 'bg-neutral-400'}`} />
                      <span className="font-bold text-xs">{b.label || '(无文本)'}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">[{b.format}]</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{b.icon}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveButton(idx)}
                      title="删除按钮"
                      className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new button form */}
            <div className="p-3 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col gap-2.5 bg-neutral-50/30 dark:bg-neutral-900/20">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
                <span>添加新业务按钮</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400 w-12">文本:</span>
                  <input
                    type="text"
                    value={newBtnLabel}
                    onChange={(e) => setNewBtnLabel(e.target.value)}
                    placeholder="按钮标签"
                    className="flex-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400 w-12">图标名:</span>
                  <input
                    type="text"
                    value={newBtnIcon}
                    onChange={(e) => setNewBtnIcon(e.target.value)}
                    placeholder="check, thumbs-down..."
                    className="flex-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Format selection */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 w-12">呈现模式:</span>
                <div className="flex items-center gap-1.5 flex-1">
                  {(['icon-text', 'icon-only', 'text-only'] as QuickNotificationButtonFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setNewBtnFormat(fmt)}
                      className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                        newBtnFormat === fmt
                          ? isLight
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-950 border-white'
                          : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {fmt === 'icon-text' ? '图标+文本' : fmt === 'icon-only' ? '仅图标' : '仅文本'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatch palette selection */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 w-12">颜色色卡:</span>
                <div className="flex items-center gap-1.5 flex-wrap flex-1">
                  {BUTTON_COLOR_SWATCHES.map((sw) => (
                    <button
                      key={sw.key}
                      type="button"
                      onClick={() => setNewBtnColor(sw.key)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border cursor-pointer transition-all ${
                        newBtnColor === sw.key
                          ? 'border-neutral-900 dark:border-white font-bold ring-1 ring-neutral-400'
                          : 'border-neutral-300 dark:border-neutral-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${sw.dotClass}`} />
                      <span>{sw.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reject icon alternate recommendations */}
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-neutral-400">
                <span>推荐拒绝图标:</span>
                {REJECT_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setNewBtnIcon(opt.key);
                      setNewBtnLabel('Reject');
                      setNewBtnColor('red');
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-800 hover:bg-neutral-300 cursor-pointer"
                  >
                    {opt.icon}
                    <span>{opt.key}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddButton}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>添加至通知</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Presets & Code Block (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* ──────────────────────────────────────────────────────────────────
              Quick Test Presets (快捷测试套件)
              User requested: 将“推送当前配置通知”丢到快捷测试套件的最顶端！
             ────────────────────────────────────────────────────────────────── */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-3 ${
              isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold tracking-tight">快捷测试套件 (Test Presets)</h3>
            </div>

            {/* TOPMOST: Prominent Push Current Notification Button */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handlePushCurrent}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between shadow-2xs active:scale-[0.98] ${
                  isLight
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900 shadow-neutral-900/10'
                    : 'bg-white hover:bg-neutral-100 text-neutral-950 border-white shadow-black/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>推送当前配置通知 (Push Notification)</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-normal ${
                  isLight ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-500/20 text-amber-700'
                }`}>
                  读取面板参数
                </span>
              </button>

              <div className="flex items-center gap-2 my-0.5 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                <span>快速预设样例测试 (Preset Samples)</span>
              </div>

              {/* Preset 1: Accept + Reject (Check + ThumbsDown) */}
              <button
                type="button"
                onClick={() =>
                  handlePushPreset(
                    'info',
                    'persistent',
                    0,
                    'bell',
                    'Join cross-region match lobby #US-East-8?',
                    [
                      { key: 'accept', label: 'Accept', icon: 'check', format: 'icon-text', color: 'green' },
                      { key: 'reject', label: 'Reject', icon: 'thumbs-down', format: 'icon-only', color: 'red' },
                    ]
                  )
                }
                className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>接受 + 拒绝通知 (ThumbsDown 拒斥)</span>
                </div>
                <span className="text-[10px] text-emerald-500 font-bold">常驻 · 双按键</span>
              </button>

              {/* Preset 2: 3s Warning */}
              <button
                type="button"
                onClick={() =>
                  handlePushPreset(
                    'warning',
                    'temporary',
                    3000,
                    'triangle-alert',
                    'Telemetry latency spike: 142ms > 80ms threshold',
                    [
                      { key: 'inspect', label: 'Inspect', icon: 'rotate-ccw', format: 'icon-text', color: 'amber' },
                    ]
                  )
                }
                className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-200'
                }`}
              >
                <span>3秒 临时告警通知 (Warning 3s)</span>
                <span className="text-[10px] text-amber-500 font-bold">3000ms</span>
              </button>

              {/* Preset 3: 5s Info */}
              <button
                type="button"
                onClick={() =>
                  handlePushPreset(
                    'info',
                    'temporary',
                    5000,
                    'info',
                    'WASM game state synced with WebSocket gateway'
                  )
                }
                className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-200'
                }`}
              >
                <span>5秒 临时信息通知 (Info 5s)</span>
                <span className="text-[10px] text-sky-500 font-bold">5000ms</span>
              </button>

              {/* Preset 4: Persistent Error with Collapse Button */}
              <button
                type="button"
                onClick={() =>
                  handlePushPreset(
                    'error',
                    'persistent',
                    0,
                    'octagon-alert',
                    'Critical error: Failed to initialize WebGPU context',
                    [
                      { key: 'retry', label: 'Retry', icon: 'rotate-ccw', format: 'icon-text', color: 'neutral' },
                    ]
                  )
                }
                className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-200'
                }`}
              >
                <span>常驻错误通知 (深色收起键在最右)</span>
                <span className="text-[10px] text-red-500 font-bold">常驻</span>
              </button>

              {/* Preset 5: Batch Stack Test */}
              <button
                type="button"
                onClick={handlePushBatch}
                className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                    : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-800 text-amber-200'
                }`}
              >
                <span>连续发送 3 条通知 (压测未读堆叠横向抽屉流)</span>
                <span className="text-[10px] text-amber-500 font-bold">Stack ×3</span>
              </button>

              <div className="flex items-center gap-2 my-0.5 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[10px] text-amber-500 uppercase tracking-wider font-bold">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>【全新】后台任务 / Lazy Loading 仿真与优先级对撞</span>
              </div>

              {/* Simulation 1: Lazy Loading Pipeline */}
              <button
                type="button"
                onClick={handleRunLazyLoadingSimulation}
                className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-700/80 text-amber-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Play className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold">启动完整 Lazy Loading 异步模拟管线</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal">
                      Step 1/5 校验清单 → 2/5 音频 → 3/5 材质 → 4/5 着色器 → 完成自动退出
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-500 font-bold shrink-0">5-Step 流</span>
              </button>

              {/* Simulation 2: Priority Preemption & Restore */}
              <button
                type="button"
                onClick={handleRunPriorityPreemptionTest}
                className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold">优先级对撞测试 (Preempt & Auto-Restore)</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal">
                      后台流式下载中 → 突然插入高优警告覆盖 → 警告折叠后自动恢复后台下载
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-sky-500 font-bold shrink-0">对撞恢复</span>
              </button>

              {/* Simulation 3: Multi-task Conflict */}
              <button
                type="button"
                onClick={handleRunMultiTaskTest}
                className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold">并发多任务推流 (Task A 音频 + Task B 涂装)</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal">
                      测试 policy (当前: {ongoingConflictPolicy.toUpperCase()}) 调度规则
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-purple-500 font-bold shrink-0">多任务</span>
              </button>

              {/* Simulation 4: Remote dismiss / complete */}
              {activeOngoingTask && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      completeOngoingNotification(undefined, {
                        content: 'All background downloads finished!',
                        autoDismissMs: 1200,
                      })
                    }
                    className="flex-1 py-1.5 px-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>远程完成任务 (Complete)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => dismissOngoingNotification()}
                    className="py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer text-neutral-600 dark:text-neutral-300"
                  >
                    立即关闭
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Architectural Notes Box: Custom Icon, Button Hierarchy & Occlusion */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-3 text-xs leading-relaxed ${
              isLight ? 'bg-neutral-50/80 border-neutral-200 text-neutral-700' : 'bg-neutral-900/40 border-neutral-800 text-neutral-300'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
              <Loader2 className="h-3.5 w-3.5 text-amber-500" />
              <span>后台进行中任务通知 (Ongoing / Background Task Notification)</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              专为 Lazy Loading、非必要异步资源加载或编译着色器打造。用户无法手动关闭（无忽略与收起键，不污染未读堆栈与计数红点）；优先级最低，遇任何用户通知时平滑让位遮挡，用户通知解决后毫秒级原地恢复；支持原地静默更新进度与远程调用完成优雅退场。
            </p>

            <div className="font-bold flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <CollapseToRightIcon size={15} className="text-amber-500" />
              <span>收起与忽略按键的透明底色与对比度规范</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Collapse 与 Ignore 均采用纯净透明底色 (<strong className="text-neutral-900 dark:text-neutral-100">bg-transparent</strong>) 不带实色底板。Collapse 作为引导保留的核心动作采用深黑/纯白高对比度图标，居于最右端；Ignore 采用轻量低对比度浅灰，降低误操作丢弃概率，契合 Apple HIG 视觉权重引导逻辑。
            </p>

            <div className="font-bold flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
              <span>Reject 图标与业务色卡体系</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              拒绝/反选操作弃用易被误认为“关闭”的叉号 (X)，采用大拇指向下 (Thumbs Down) 或禁行图标；系统内置绿色、红色、橙黄、中性黑白、天蓝与紫色 6 档可选色卡。
            </p>

            <div className="font-bold flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <Layers className="h-3.5 w-3.5 text-neutral-400" />
              <span>堆栈横向抽屉展开动效与零滚动条</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              未读堆叠展开时各通知容器从右向左横向抽出展开，彻底移除向下飘动；隐藏过渡期的滚动条并外扩阴影边界，杜绝右侧阴影被截断。
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          5. Code Recipe & Export Block
         ────────────────────────────────────────────────────────────────── */}
      <div className="mt-2">
        <CodeBlock
          code={generatedUsageCode}
          language="tsx"
          title="QuickNotification Recipe (代码使用示范)"
        />
      </div>
    </div>
  );
};
