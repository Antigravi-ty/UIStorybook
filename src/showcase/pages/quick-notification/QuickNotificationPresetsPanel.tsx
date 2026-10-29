import React from 'react';
import {
  Sparkles,
  Send,
  Check,
  Loader2,
  Play,
  Clock,
  Layers,
  CheckCircle2,
  ThumbsDown,
} from 'lucide-react';
import {
  CollapseToRightIcon,
  type QuickNotificationGlowLevel,
  type QuickNotificationType,
  type QuickNotificationButtonConfig,
} from '../../../compounds/QuickNotification';
import {
  dismissOngoingNotification,
  completeOngoingNotification,
  type QuickNotificationItem,
  type OngoingConflictPolicy,
} from '../../../tokens/quickNotificationStore';

export interface QuickNotificationPresetsPanelProps {
  isLight: boolean;
  handlePushCurrent: () => void;
  handlePushPreset: (
    presetTone: QuickNotificationGlowLevel,
    presetType: QuickNotificationType,
    presetDuration: number,
    presetIcon: string,
    presetContent: string,
    presetButtons?: QuickNotificationButtonConfig[]
  ) => void;
  handlePushBatch: () => void;
  handleRunLazyLoadingSimulation: () => void;
  handleRunPriorityPreemptionTest: () => void;
  handleRunMultiTaskTest: () => void;
  ongoingConflictPolicy: OngoingConflictPolicy;
  activeOngoingTask: QuickNotificationItem | null;
}

export const QuickNotificationPresetsPanel: React.FC<QuickNotificationPresetsPanelProps> = React.memo(
  ({
    isLight,
    handlePushCurrent,
    handlePushPreset,
    handlePushBatch,
    handleRunLazyLoadingSimulation,
    handleRunPriorityPreemptionTest,
    handleRunMultiTaskTest,
    ongoingConflictPolicy,
    activeOngoingTask,
  }) => {
    return (
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Quick Test Presets */}
        <div
          className={`p-5 rounded-2xl border flex flex-col gap-3 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold tracking-tight">快捷测试套件 (Test Presets)</h3>
          </div>

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
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-normal ${
                  isLight ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-500/20 text-amber-700'
                }`}
              >
                读取面板参数
              </span>
            </button>

            <div className="flex items-center gap-2 my-0.5 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
              <span>快速预设样例测试 (Preset Samples)</span>
            </div>

            {/* Preset 1: Accept + Reject */}
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

            {/* Preset 4: Persistent Error */}
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

        {/* Architectural Notes Box */}
        <div
          className={`p-5 rounded-2xl border flex flex-col gap-3 text-xs leading-relaxed ${
            isLight
              ? 'bg-neutral-50/80 border-neutral-200 text-neutral-700'
              : 'bg-neutral-900/40 border-neutral-800 text-neutral-300'
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
            Collapse 与 Ignore 均采用纯净透明底色 (
            <strong className="text-neutral-900 dark:text-neutral-100">bg-transparent</strong>)
            不带实色底板。Collapse 作为引导保留的核心动作采用深黑/纯白高对比度图标，居于最右端；Ignore
            采用轻量低对比度浅灰，降低误操作丢弃概率，契合 Apple HIG 视觉权重引导逻辑。
          </p>

          <div className="font-bold flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
            <span>Reject 图标与业务色卡体系</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            拒绝/反选操作弃用易被误认为“关闭”的叉号 (X)，采用大拇指向下 (Thumbs Down)
            或禁行图标；系统内置绿色、红色、橙黄、中性黑白、天蓝与紫色 6 档可选色卡。
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
    );
  }
);
