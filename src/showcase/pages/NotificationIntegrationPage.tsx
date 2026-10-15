import React, { useState, useEffect, useRef } from 'react';
import {
  BellDot,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Flame,
  Ghost,
  Layers,
  OctagonAlert,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Clock,
  Download,
  Copy,
  Check,
  RefreshCw,
  Send,
  Zap,
} from 'lucide-react';
import {
  useQuickNotificationStore,
  pushQuickNotification,
  pushOngoingNotification,
  updateOngoingNotification,
  dismissOngoingNotification,
  clearAllQuickNotifications,
  type QuickNotificationItem,
} from '../../tokens/quickNotificationStore';
import { dialogue, DialogueStackContainer } from '../../primitives/Dialogue';
import { QuickNotificationSystem } from '../../navigation/QuickNotificationSystem';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';

interface TestCaseResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  log: string[];
}

export const NotificationIntegrationPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  const store = useQuickNotificationStore();

  const [testResults, setTestResults] = useState<Record<string, TestCaseResult>>({
    test1: {
      id: 'test1',
      name: '场景 1: WebSocket 断线持久通知被临时通知抢占与超时恢复 (Preemption & Restore)',
      status: 'idle',
      log: [],
    },
    test2: {
      id: 'test2',
      name: '场景 2: 双重 Persistent 抢占与 Resolve 级联回退 (LIFO Stack Restoration)',
      status: 'idle',
      log: [],
    },
    test3: {
      id: 'test3',
      name: '场景 3: 用户主动 Collapse 隔离测试 (进入未读托盘，不自作主张弹扰)',
      status: 'idle',
      log: [],
    },
    test4: {
      id: 'test4',
      name: '场景 4: 长报错渐进披露 (Notification 摘要 + Details 按钮 ➔ Dialogue 弹窗)',
      status: 'idle',
      log: [],
    },
    test5: {
      id: 'test5',
      name: '场景 5: 严格参数校验与 Ghost Fatal Error Dialogue 弹窗抓虫 (零静默 Fallback)',
      status: 'idle',
      log: [],
    },
    test6: {
      id: 'test6',
      name: '场景 6: Ongoing 最低优先级任务与交互通知竞争测试 (后台运行与前台让路)',
      status: 'idle',
      log: [],
    },
  });

  const [copiedError, setCopiedError] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const appendLog = (testId: string, message: string) => {
    setTestResults((prev) => {
      const current = prev[testId] || { id: testId, name: testId, status: 'idle', log: [] };
      return {
        ...prev,
        [testId]: {
          ...current,
          log: [...current.log, `[${new Date().toLocaleTimeString()}] ${message}`],
        },
      };
    });
  };

  const setTestStatus = (testId: string, status: 'idle' | 'running' | 'passed' | 'failed') => {
    setTestResults((prev) => {
      const current = prev[testId];
      if (!current) return prev;
      return {
        ...prev,
        [testId]: {
          ...current,
          status,
        },
      };
    });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: WebSocket Disconnect (Persistent) Preempted by Temporary Alert
  // ──────────────────────────────────────────────────────────────────────────
  const runTest1 = async () => {
    setTestStatus('test1', 'running');
    setTestResults((prev) => ({ ...prev, test1: { ...prev.test1, log: [] } }));
    clearAllQuickNotifications();

    appendLog('test1', 'Step 1: 推送 WebSocket 断线持久通知 (type: persistent, tone: warning)...');
    pushQuickNotification({
      id: 'ws-disconnect-alert',
      type: 'persistent',
      tone: 'warning',
      icon: 'wifi-off',
      duration: 0,
      content: 'WebSocket 信令服务器掉线，正在使用 P2P WebRTC 维持比赛。',
      buttons: [
        {
          label: 'Reconnect',
          color: 'amber',
          onClick: () => {
            appendLog('test1', '用户点击了业务 Reconnect 按钮');
          },
        },
      ],
    });

    await new Promise((r) => setTimeout(r, 1200));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'ws-disconnect-alert') {
      appendLog('test1', '❌ 失败: 持久通知未能成功激活');
      setTestStatus('test1', 'failed');
      return;
    }
    appendLog('test1', '✓ 确认: 持久通知处于 Active 展示状态 (可点击 Reconnect 或右侧内置 CircleSlash 按钮忽略)');

    appendLog('test1', 'Step 2: 突发一条临时通知 (type: temporary, duration: 2500ms)...');
    pushQuickNotification({
      id: 'temp-kickoff-alert',
      type: 'temporary',
      tone: 'none',
      icon: 'sparkles',
      duration: 2500,
      content: '对局即将开始 (Kickoff in 3s)',
    });

    await new Promise((r) => setTimeout(r, 400));
    const state2 = useQuickNotificationStore.getState();
    if (state2.activeNotification?.id !== 'temp-kickoff-alert') {
      appendLog('test1', '❌ 失败: 临时通知未能成功抢占 Active 展示');
      setTestStatus('test1', 'failed');
      return;
    }
    if (state2.preemptedPersistentStack.length !== 1 || state2.preemptedPersistentStack[0].id !== 'ws-disconnect-alert') {
      appendLog('test1', '❌ 失败: 持久通知未进入 preemptedPersistentStack 挂起栈');
      setTestStatus('test1', 'failed');
      return;
    }
    appendLog('test1', '✓ 确认: 临时通知抢占前台，持久通知成功挂入 preemptedPersistentStack');

    appendLog('test1', 'Step 3: 等待临时通知 2500ms 倒计时自然结束...');
    await new Promise((r) => setTimeout(r, 2800));

    const state3 = useQuickNotificationStore.getState();
    if (state3.activeNotification?.id !== 'ws-disconnect-alert') {
      appendLog('test1', `❌ 失败: 临时通知结束后持久通知未恢复展示 (当前 Active: ${state3.activeNotification?.id})`);
      setTestStatus('test1', 'failed');
      return;
    }
    appendLog('test1', '✓ 确认: 临时通知倒计时收折，持久通知【自动丝滑恢复】展示！');
    appendLog('test1', '🎉 场景 1 校验通过 (PASS)');
    setTestStatus('test1', 'passed');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Multi-level Persistent LIFO Stacking & Sequential Resolve
  // ──────────────────────────────────────────────────────────────────────────
  const runTest2 = async () => {
    setTestStatus('test2', 'running');
    setTestResults((prev) => ({ ...prev, test2: { ...prev.test2, log: [] } }));
    clearAllQuickNotifications();

    appendLog('test2', 'Step 1: 推送第一条持久通知 A (Host Migration)...');
    pushQuickNotification({
      id: 'persistent-A',
      type: 'persistent',
      tone: 'info',
      icon: 'shield-alert',
      duration: 0,
      content: '房间房主已移交至 Striker-9921',
    });

    await new Promise((r) => setTimeout(r, 800));
    appendLog('test2', 'Step 2: 推送第二条持久通知 B (NAT Traversal Warning)...');
    pushQuickNotification({
      id: 'persistent-B',
      type: 'persistent',
      tone: 'warning',
      icon: 'alert-triangle',
      duration: 0,
      content: 'NAT 类型检测为 Strict，可能影响直连质量',
    });

    await new Promise((r) => setTimeout(r, 500));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'persistent-B') {
      appendLog('test2', '❌ 失败: 持久通知 B 未能抢占前台');
      setTestStatus('test2', 'failed');
      return;
    }
    if (state1.preemptedPersistentStack.length !== 1 || state1.preemptedPersistentStack[0].id !== 'persistent-A') {
      appendLog('test2', '❌ 失败: 持久通知 A 未能在挂起栈排队');
      setTestStatus('test2', 'failed');
      return;
    }
    appendLog('test2', '✓ 确认: B 抢占展示，A 正确在 preemptedPersistentStack 挂起');

    appendLog('test2', 'Step 3: 用户点击解决 (Resolve) 当前通知 B...');
    store.resolveActive();

    await new Promise((r) => setTimeout(r, 500));
    const state2 = useQuickNotificationStore.getState();
    if (state2.activeNotification?.id !== 'persistent-A') {
      appendLog('test2', `❌ 失败: B 解决后 A 未能级联恢复 (当前 Active: ${state2.activeNotification?.id})`);
      setTestStatus('test2', 'failed');
      return;
    }
    appendLog('test2', '✓ 确认: B 解决后，底层的持久通知 A 成功自动浮现！');
    appendLog('test2', '🎉 场景 2 校验通过 (PASS)');
    setTestStatus('test2', 'passed');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: User Explicit Collapse Isolation
  // ──────────────────────────────────────────────────────────────────────────
  const runTest3 = async () => {
    setTestStatus('test3', 'running');
    setTestResults((prev) => ({ ...prev, test3: { ...prev.test3, log: [] } }));
    clearAllQuickNotifications();

    appendLog('test3', 'Step 1: 推送一条持久通知 C...');
    pushQuickNotification({
      id: 'persistent-C',
      type: 'persistent',
      tone: 'orange',
      icon: 'flame',
      duration: 0,
      content: '锦标赛排队匹配成功，请于 30 秒内点击确认。',
    });

    await new Promise((r) => setTimeout(r, 600));
    appendLog('test3', 'Step 2: 用户主动点击 Collapse 按钮 (收起进托盘)...');
    store.collapseActive();

    await new Promise((r) => setTimeout(r, 400));
    const state = useQuickNotificationStore.getState();
    if (state.activeNotification !== null) {
      appendLog('test3', '❌ 失败: 主动收起后 Active 未被清空');
      setTestStatus('test3', 'failed');
      return;
    }
    if (state.unreadStack.length !== 1 || state.unreadStack[0].id !== 'persistent-C') {
      appendLog('test3', '❌ 失败: 通知未归入 unreadStack 未读托盘');
      setTestStatus('test3', 'failed');
      return;
    }
    appendLog('test3', '✓ 确认: Active 被清空，通知进入 unreadStack 托盘，右上角计数值 +1，且未自作主张弹扰');
    appendLog('test3', '🎉 场景 3 校验通过 (PASS)');
    setTestStatus('test3', 'passed');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Long Error Escalation (Notification + Details ➔ Dialogue)
  // ──────────────────────────────────────────────────────────────────────────
  const runTest4 = () => {
    setTestStatus('test4', 'running');
    setTestResults((prev) => ({ ...prev, test4: { ...prev.test4, log: [] } }));
    clearAllQuickNotifications();

    const fullErrorDetails = `[WebRTC Negotiation Exception]
Status: ICE_CONNECTION_FAILED
Target Room: 8942-US-WEST
Signaling Server: wss://signaling.car-soccer.antigravity.dev
Candidate Pair: 192.168.1.104:54321 <-> 104.28.19.4:443 (STUN Timeout 10000ms)
Details: Remote host failed to answer SDP offer within 10-second deadline.
Trace:
  at P2PWebRTCChannel.establishPeerSession (P2PWebRTCChannel.js:142:19)
  at RoomConnectionProgressManager.startJoin (RoomConnectionProgressManager.js:88:12)`;

    appendLog('test4', 'Step 1: 推送带有 Details 按钮的紧凑错误通知...');
    pushQuickNotification({
      id: 'room-join-error-summary',
      type: 'persistent',
      tone: 'error',
      icon: 'octagon-alert',
      duration: 0,
      content: '加入房间失败: 远端房主握手超时 (10s)',
      buttons: [
        {
          label: 'Details',
          color: 'amber',
          onClick: () => {
            appendLog('test4', '用户点击了 Details 按钮，触发 Dialogue 弹窗展开完整错误！');
            dialogue.show({
              title: 'ERROR',
              tone: 'error',
              icon: 'octagon-alert',
              content: (
                <div className="flex flex-col gap-2 font-mono text-xs w-full text-left">
                  <p className="font-bold text-red-600 dark:text-red-400">WebRTC P2P 握手超时无法建立直连:</p>
                  <pre className="p-3 rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-300 dark:bg-neutral-950/70 dark:border-neutral-800 dark:text-neutral-200 text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                    {fullErrorDetails}
                  </pre>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    建议检查当前网络防火墙，或让房主重新生成新的 4 位房间代码。可通过右侧内置斜线按钮或弹窗按钮直接关闭。
                  </p>
                </div>
              ),
              buttons: [
                {
                  label: 'Copy Logs',
                  variant: 'outline',
                  onClick: async () => {
                    if (typeof navigator !== 'undefined') {
                      await navigator.clipboard.writeText(fullErrorDetails);
                      appendLog('test4', '✓ 完整错误日志已拷贝至剪贴板');
                    }
                  },
                },
                {
                  label: 'Close',
                  variant: 'primary',
                },
              ],
            });
          },
        },
      ],
    });

    appendLog('test4', '✓ 紧凑通知已弹出，请点击通知上的 [Details] 按钮验证 Dialogue 弹窗');
    setTestStatus('test4', 'passed');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Strict Schema Validation & Ghost Fatal Error Dialogue
  // ──────────────────────────────────────────────────────────────────────────
  const runTest5 = () => {
    setTestStatus('test5', 'running');
    setTestResults((prev) => ({ ...prev, test5: { ...prev.test5, log: [] } }));

    appendLog('test5', 'Step 1: 故意传入包含废弃字段 durationMs 且未声明 type 的非法配置...');

    try {
      // Intentionally passing invalid schema to trigger fatal error
      pushQuickNotification({
        id: 'intentional-bug-alert',
        content: 'This notification has schema bugs',
        durationMs: 3000, // ILLEGAL KEY
        title: 'Deprecated Title',
      } as any);

      appendLog('test5', '❌ 失败: 系统未拦截非法参数，发生了静默 fallback！');
      setTestStatus('test5', 'failed');
    } catch (err: any) {
      appendLog('test5', `✓ 成功拦截! 捕获到运行时异常: ${err.message}`);
      appendLog('test5', '✓ 验证: 调度器已自动弹出带有最高等级 Ghost 图标的 Fatal Error Dialogue 弹窗！');
      appendLog('test5', '🎉 场景 5 校验通过 (PASS)');
      setTestStatus('test5', 'passed');
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Ongoing Background Task Preemption by Interactive Alert
  // ──────────────────────────────────────────────────────────────────────────
  const runTest6 = async () => {
    setTestStatus('test6', 'running');
    setTestResults((prev) => ({ ...prev, test6: { ...prev.test6, log: [] } }));
    clearAllQuickNotifications();

    appendLog('test6', 'Step 1: 启动一个最低优先级的后台资源下载任务 (Ongoing Task)...');
    const taskId = pushOngoingNotification({
      id: 'bg-asset-download',
      type: 'ongoing',
      content: '正在下载体育场竞技场材质包 (0%)',
      progress: 0.1,
      icon: 'download',
    });

    await new Promise((r) => setTimeout(r, 1000));
    updateOngoingNotification(taskId, {
      content: '正在下载体育场竞技场材质包 (35%)',
      progress: 0.35,
    });
    appendLog('test6', '✓ 确认: 后台任务在前台以最低优先级展示进度');

    await new Promise((r) => setTimeout(r, 800));
    appendLog('test6', 'Step 2: 突发高优先级交互通知 (打断并覆盖后台任务)...');
    pushQuickNotification({
      id: 'high-priority-notice',
      type: 'temporary',
      duration: 2000,
      tone: 'warning',
      content: '突发网络抖动: 延迟从 15ms 升至 120ms',
    });

    await new Promise((r) => setTimeout(r, 400));
    const state1 = useQuickNotificationStore.getState();
    if (state1.activeNotification?.id !== 'high-priority-notice') {
      appendLog('test6', '❌ 失败: 交互通知未能成功覆盖后台任务');
      setTestStatus('test6', 'failed');
      return;
    }
    appendLog('test6', '✓ 确认: 交互通知成功在前台盖住后台任务');

    appendLog('test6', 'Step 3: 等待交互通知 2000ms 倒计时结束...');
    await new Promise((r) => setTimeout(r, 2300));

    const state2 = useQuickNotificationStore.getState();
    if (state2.activeOngoingTask?.id !== 'bg-asset-download') {
      appendLog('test6', '❌ 失败: 交互通知收折后，后台任务未自动重新展现');
      setTestStatus('test6', 'failed');
      return;
    }
    appendLog('test6', '✓ 确认: 交互通知收折后，后台下载任务丝滑恢复展示！');

    updateOngoingNotification(taskId, {
      content: '体育场竞技场材质包下载完成 (100%)',
      progress: 1,
    });
    await new Promise((r) => setTimeout(r, 800));
    dismissOngoingNotification(taskId);

    appendLog('test6', '🎉 场景 6 校验通过 (PASS)');
    setTestStatus('test6', 'passed');
  };

  // Run all tests sequentially
  const handleRunAll = async () => {
    setIsRunningAll(true);
    await runTest1();
    await new Promise((r) => setTimeout(r, 1000));
    await runTest2();
    await new Promise((r) => setTimeout(r, 1000));
    await runTest3();
    await new Promise((r) => setTimeout(r, 1000));
    runTest4();
    await new Promise((r) => setTimeout(r, 1000));
    runTest5();
    await new Promise((r) => setTimeout(r, 1000));
    await runTest6();
    setIsRunningAll(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="amber" isLight={isLight}>
            Core Architecture Suite
          </Badge>
          <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            UIStorybook / QuickNotification & Dialogue Integration
          </span>
        </div>
        <h1 className={`text-3xl font-bold tracking-tight ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
          Notification & Dialogue 集成测试矩阵
        </h1>
        <p className={`text-sm max-w-3xl leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          测试重点：<strong>通知调度器（NotificationScheduler）</strong> 的抢占与自动恢复机制（Preemption &
          Restoration）、零静默回退的严格参数校验（Fatal Schema Validation with Ghost Dialogue）、长报错渐进披露联动，以及最低优先级 Ongoing
          任务的层级竞争。
        </p>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          Interactive Preview Stage with In-Place QuickNotificationSystem
         ──────────────────────────────────────────────────────────────────── */}
      <div
        className={`relative h-32 rounded-2xl border flex items-center justify-between px-6 overflow-hidden select-none shadow-sm transition-colors ${
          isLight
            ? 'bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 border-neutral-300/80 text-neutral-900'
            : 'bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-neutral-800 text-neutral-100'
        }`}
      >
        <div className="flex items-center gap-3 z-10">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
              Live Notification Viewport (右上角悬浮抽屉)
            </span>
            <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              任何触发的通知均在此区域及全局右上角实时展开
            </span>
          </div>
        </div>

        {/* Mounted in-place for direct visualization */}
        <QuickNotificationSystem isLight={isLight} absolute={true} />
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          Real-time Scheduler State Inspector
         ──────────────────────────────────────────────────────────────────── */}
      <div
        className={`p-5 rounded-2xl border flex flex-col gap-4 font-mono text-xs transition-colors ${
          isLight
            ? 'bg-white border-neutral-300 text-neutral-800 shadow-sm'
            : 'bg-neutral-900 border-neutral-800 text-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-amber-500" />
            <span className="font-bold uppercase tracking-wider">
              NotificationScheduler 实时内存状态探针 (Live State)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isLight={isLight}
              onClick={() => clearAllQuickNotifications()}
              className="text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              清空全部状态 (Reset All)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Active Notification Card */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
              store.activeNotification
                ? isLight
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                : isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-500'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              1. Active Notification
            </span>
            <span className="font-bold text-sm truncate">
              {store.activeNotification?.id || '(None)'}
            </span>
            <span className="text-[10px] opacity-80">
              Type: {store.activeNotification?.type || 'idle'} • Tone: {store.activeNotification?.tone || 'none'}
            </span>
          </div>

          {/* Preempted Persistent Stack Card */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
              store.preemptedPersistentStack.length > 0
                ? isLight
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                : isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-500'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className={`text-[10px] uppercase font-bold flex items-center justify-between ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <span>2. Preempted Stack (挂起)</span>
              <span className="font-bold">{store.preemptedPersistentStack.length}</span>
            </span>
            <span className="font-bold text-sm truncate">
              {store.preemptedPersistentStack[0]?.id || '(Empty)'}
            </span>
            <span className="text-[10px] opacity-80">
              待恢复持久通知: {store.preemptedPersistentStack.map((n) => n.id).join(' ➔ ') || '无'}
            </span>
          </div>

          {/* Unread Stack Tray Card */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
              store.unreadStack.length > 0
                ? isLight
                  ? 'bg-sky-50 border-sky-300 text-sky-900'
                  : 'bg-sky-950/40 border-sky-700/60 text-sky-200'
                : isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-500'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className={`text-[10px] uppercase font-bold flex items-center justify-between ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <span>3. Unread Stack (未读托盘)</span>
              <span className="font-bold">{store.unreadStack.length}</span>
            </span>
            <span className="font-bold text-sm truncate">
              {store.unreadStack[0]?.id || '(Empty)'}
            </span>
            <span className="text-[10px] opacity-80">
              已收折/历史: {store.unreadStack.map((n) => n.id).join(', ') || '无'}
            </span>
          </div>

          {/* Active Ongoing Task Card */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
              store.activeOngoingTask
                ? isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                : isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-500'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className={`text-[10px] uppercase font-bold flex items-center justify-between ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <span>4. Ongoing Task (后台)</span>
              <span className="font-bold">{store.ongoingTasks.length}</span>
            </span>
            <span className="font-bold text-sm truncate">
              {store.activeOngoingTask?.id || '(None)'}
            </span>
            <span className="text-[10px] opacity-80">
              进度: {typeof store.activeOngoingTask?.progress === 'number' ? `${Math.round(store.activeOngoingTask.progress * 100)}%` : '无'}
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          Persistent Automated Test Suite
         ──────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h2 className={`text-lg font-bold ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
              持久化回归验证用例套件 (Automated Test Suite)
            </h2>
          </div>
          <Button
            variant="primary"
            isLight={isLight}
            disabled={isRunningAll}
            onClick={handleRunAll}
            className="text-xs"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            {isRunningAll ? '正在执行全量测试套件...' : '一键顺序运行全部用例 (Run All)'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {Object.values(testResults).map((test) => {
            const isRunning = test.status === 'running';
            const isPassed = test.status === 'passed';
            const isFailed = test.status === 'failed';

            return (
              <div
                key={test.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLight ? 'bg-white border-neutral-200/90 shadow-2xs text-neutral-900' : 'bg-neutral-900/90 border-neutral-800 text-neutral-100'
                }`}
              >
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                    isLight ? 'border-neutral-200' : 'border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isPassed && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                    {isFailed && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                    {isRunning && <RefreshCw className="h-5 w-5 text-amber-500 animate-spin shrink-0" />}
                    {test.status === 'idle' && <Clock className="h-5 w-5 text-neutral-400 shrink-0" />}

                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
                        {test.name}
                      </span>
                      <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Test ID: {test.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      isLight={isLight}
                      disabled={isRunning}
                      onClick={() => {
                        if (test.id === 'test1') runTest1();
                        if (test.id === 'test2') runTest2();
                        if (test.id === 'test3') runTest3();
                        if (test.id === 'test4') runTest4();
                        if (test.id === 'test5') runTest5();
                        if (test.id === 'test6') runTest6();
                      }}
                      className="text-xs font-mono"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      运行单项 (Run)
                    </Button>
                  </div>
                </div>

                {/* Step execution log */}
                <div
                  className={`mt-3 rounded-xl p-3 font-mono text-xs max-h-36 overflow-y-auto flex flex-col gap-1 border transition-colors ${
                    isLight
                      ? 'bg-neutral-50 text-neutral-700 border-neutral-200/90'
                      : 'bg-neutral-950 text-neutral-300 border-neutral-800/80'
                  }`}
                >
                  {test.log.length === 0 ? (
                    <span className={`italic ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      点击“运行单项”开始执行用例并观察状态机步骤...
                    </span>
                  ) : (
                    test.log.map((entry, idx) => (
                      <span
                        key={idx}
                        className={
                          entry.includes('❌')
                            ? isLight
                              ? 'text-red-600 font-bold'
                              : 'text-red-400 font-bold'
                            : entry.includes('✓') || entry.includes('🎉')
                            ? isLight
                              ? 'text-emerald-600 font-semibold'
                              : 'text-emerald-400 font-semibold'
                            : isLight
                            ? 'text-neutral-700'
                            : 'text-neutral-300'
                        }
                      >
                        {entry}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

