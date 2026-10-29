import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:quick-notification');
import { BellDot, Layers, Sparkles, CircleSlash, Trash2, Loader2, Eye, Send, } from 'lucide-react';
import {
  useQuickNotificationStore, QuickNotificationItem, pushOngoingNotification, updateOngoingNotification,
  completeOngoingNotification,
} from '../../tokens/quickNotificationStore';
import {
  QuickNotificationDrawer, CollapseToRightIcon, getButtonColorClass, MONO_FONT_STACK,
  type QuickNotificationGlowLevel, type QuickNotificationType, type QuickNotificationButtonConfig,
} from '../../compounds/QuickNotification';
import { QuickNotificationSystem, type NotificationIconLifecycle, } from '../../navigation/QuickNotificationSystem';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';
import { QuickNotificationControlPanel } from './quick-notification/QuickNotificationControlPanel';
import { QuickNotificationPresetsPanel } from './quick-notification/QuickNotificationPresetsPanel';

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

  const generatedUsageCode = `import { QuickNotificationDrawer } from '@/compounds/QuickNotification';
import { QuickNotificationSystem } from '@/navigation/QuickNotificationSystem';
import {
  quickNotificationStore, pushQuickNotification, pushOngoingNotification, updateOngoingNotification,
  dismissOngoingNotification, completeOngoingNotification,
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
    <div style={{ fontFamily: MONO_FONT_STACK }} className="flex flex-col gap-5 w-full relative font-mono text-xs">
      {/* ──────────────────────────────────────────────────────────────────
          1. Page Header (顶栏标题)
         ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shrink-0">
            <BellDot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Quick Notification 快速通知系统</h1>
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
        isLight ? 'bg-neutral-100/70 border-neutral-200 shadow-inner'
        : 'bg-neutral-950/80 border-neutral-800 shadow-inner' }`} style={{ backgroundImage: isLight
        ? 'radial-gradient(#d4d4d8 1px, transparent 1px)' : 'radial-gradient(#27272a 1px, transparent 1px)',
        backgroundSize: '24px 24px', }}>
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
        <QuickNotificationSystem isLight={isLight} absolute={true} slotRight={showStackIcon}
          previewNotification={liveMode ? livePreviewDraft : null} onLifecycleChange={setIconLifecycle} />

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
        isLight ? 'bg-neutral-50/80 border-neutral-200 text-neutral-700 shadow-2xs'
        : 'bg-neutral-900/60 border-neutral-800 text-neutral-300' }`}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Icon State:</span>
            <span className={`font-bold ${ iconLifecycle === 'visible' ? 'text-emerald-500'
              : iconLifecycle === 'spawning' ? 'text-amber-500' : iconLifecycle === 'hidden' ? 'text-neutral-500'
              : 'text-red-500' }`}>
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
                <span className={`font-bold ${ activeNotification ? 'text-amber-500' : 'text-emerald-500' }`}>
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
            <strong className="text-neutral-900 dark:text-neutral-100 font-bold">{totalUnreadCount}</strong>
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
            <span className={`font-bold px-1.5 py-0.5 rounded ${ liveMode
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300' }`}>
              {liveMode ? 'LIVE' : 'PUSH'}
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          4. Lower Grid: Control Panel (Left 7 cols) & Test Presets (Right 5 cols)
         ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <QuickNotificationControlPanel isLight={isLight} showStackIcon={showStackIcon}
          setShowStackIcon={setShowStackIcon} liveMode={liveMode} setLiveMode={setLiveMode} totalChars={totalChars}
          chineseChars={chineseChars} asciiChars={asciiChars} estimatedContentWidthPx={estimatedContentWidthPx}
          temporalType={temporalType} setTemporalType={setTemporalType} effectiveDuration={effectiveDuration}
          durationPreset={durationPreset} setDurationPreset={setDurationPreset} customDurationMs={customDurationMs}
          setCustomDurationMs={setCustomDurationMs} ongoingProgressMode={ongoingProgressMode}
          setOngoingProgressMode={setOngoingProgressMode} ongoingProgressPct={ongoingProgressPct}
          setOngoingProgressPct={setOngoingProgressPct} isSpinningIcon={isSpinningIcon}
          setIsSpinningIcon={setIsSpinningIcon} tone={tone} setTone={setTone} iconName={iconName}
          setIconName={setIconName} content={content} setContent={setContent} buttons={buttons}
          setButtons={setButtons} />

        <QuickNotificationPresetsPanel isLight={isLight} handlePushCurrent={handlePushCurrent}
          handlePushPreset={handlePushPreset} handlePushBatch={handlePushBatch}
          handleRunLazyLoadingSimulation={handleRunLazyLoadingSimulation}
          handleRunPriorityPreemptionTest={handleRunPriorityPreemptionTest}
          handleRunMultiTaskTest={handleRunMultiTaskTest} ongoingConflictPolicy={ongoingConflictPolicy}
          activeOngoingTask={activeOngoingTask} />
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          5. Code Recipe & Export Block
         ────────────────────────────────────────────────────────────────── */}
      <div className="mt-2">
        <CodeBlock code={generatedUsageCode} language="tsx" title="QuickNotification Recipe (代码使用示范)" />
      </div>
    </div>
  );
};
