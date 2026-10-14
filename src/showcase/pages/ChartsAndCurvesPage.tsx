import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Spline,
  MoveVertical,
  CheckCircle2,
  XCircle,
  Plus,
  Flame,
} from 'lucide-react';
import {
  TelemetrySparklineChart,
  EventImpulseScatterChart,
  CubicBezierCurveEditor,
  ParametricTrajectoryChart,
  CollisionImpulseEvent,
  CubicBezierValue,
} from '../../charts';
import { SliderControl } from '../../primitives/SliderControl';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { CodeBlock } from '../CodeBlock';

export const ChartsAndCurvesPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // 1. Live 120Hz Telemetry Stream State
  const [frameHistory, setFrameHistory] = useState<number[]>(() => {
    const arr: number[] = [];
    for (let i = 0; i < 160; i++) {
      const spike = i % 53 === 0 ? 11.8 : i % 37 === 0 ? 9.4 : 0;
      arr.push(spike || Number((5.2 + Math.sin(i * 0.18) * 1.1 + (i % 7) * 0.15).toFixed(2)));
    }
    return arr;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameHistory((prev) => {
        const next = prev.slice(1);
        const jitter = (Math.random() - 0.48) * 1.4;
        const occasionalSpike = Math.random() < 0.06 ? 9.2 + Math.random() * 5.5 : 0;
        const val = occasionalSpike || Math.max(3.2, Math.min(8.1, 5.4 + jitter));
        next.push(Number(val.toFixed(2)));
        return next;
      });
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const injectFrameSpike = () => {
    setFrameHistory((prev) => [...prev.slice(3), 14.8, 18.4, 11.9]);
  };

  // 2. Collision Impulse Scatter Events State
  const [threshold, setThreshold] = useState<number>(650);
  const [events, setEvents] = useState<CollisionImpulseEvent[]>([
    { id: 'ev-1', ageSec: 4.4, value: 420, type: 'car-world' },
    { id: 'ev-2', ageSec: 3.9, value: 1180, type: 'car-ball' },
    { id: 'ev-3', ageSec: 3.4, value: 290, type: 'car-ball' },
    { id: 'ev-4', ageSec: 2.8, value: 1940, type: 'goalpost' },
    { id: 'ev-5', ageSec: 2.3, value: 810, type: 'car-ball' },
    { id: 'ev-6', ageSec: 1.8, value: 520, type: 'car-world' },
    { id: 'ev-7', ageSec: 1.2, value: 1560, type: 'car-ball' },
    { id: 'ev-8', ageSec: 0.6, value: 2210, type: 'goalpost' },
    { id: 'ev-9', ageSec: 0.2, value: 930, type: 'car-ball' },
  ]);

  const emitCollisionBurst = () => {
    const types: Array<'car-ball' | 'car-world' | 'goalpost'> = ['car-ball', 'car-world', 'goalpost'];
    setEvents((prev) => {
      const aged = prev
        .map((e) => ({ ...e, ageSec: Number((e.ageSec + 0.45).toFixed(2)) }))
        .filter((e) => e.ageSec <= 5.0);
      const newEvent: CollisionImpulseEvent = {
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ageSec: 0.08,
        value: Math.round(250 + Math.random() * 2150),
        type: types[Math.floor(Math.random() * types.length)],
      };
      return [...aged, newEvent];
    });
  };

  // 3. Cubic Bezier & Parametric Orb Trajectory State
  const [orbBezier, setOrbBezier] = useState<CubicBezierValue>({
    p1x: 0.0,
    p1y: -1.15,
    p2x: 0.0,
    p2y: 1.0,
  });
  const [orbDurationMs, setOrbDurationMs] = useState<number>(200);
  const [orbDropDistance, setOrbDropDistance] = useState<number>(175);

  const [glowBezier, setGlowBezier] = useState<CubicBezierValue>({
    p1x: 0.2,
    p1y: 0.8,
    p2x: 0.25,
    p2y: 1.0,
  });

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge size="sm" variant="amber" isLight={isLight}>
            Clarity #1 · Performance #2 · Aesthetics #3
          </Badge>
          <Badge size="sm" variant="neutral" isLight={isLight}>
            DPR Canvas + Isolated SVG
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Charts & Curves 高性能清晰图表与曲线系统
        </h1>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          针对 <code className="font-mono text-amber-500">RLCleanWASM</code> 中现有的四类图表（帧耗时历史图、物理碰撞散点流、三次贝塞尔缓动图、加速球垂直轨迹极值图）进行彻底的规范化重构。遵循<strong>「第一保证清晰度与精准数据追踪，第二保证 120Hz 零卡顿高性能，第三兼顾现代克制美学」</strong>的准则。
        </p>
      </div>

      {/* Diagnostic Comparison: Why RLCleanWASM's raw charts needed standardization */}
      <div
        className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-4 text-xs ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 ${
            isLight ? 'bg-red-50/60 border-red-200' : 'bg-red-950/30 border-red-800/60'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-red-500">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>原 RLCleanWASM 图表实现的痛点</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-[11px] opacity-90">
            <li>
              <strong>SVG 非等比拉伸畸变 (<code className="font-mono">preserveAspectRatio="none"</code>)</strong>：导致折线横向与纵向粗细严重不均，散点 <code className="font-mono">&lt;circle&gt;</code> 被压扁成模糊椭圆。
            </li>
            <li>
              <strong>120Hz React State 整树重渲染</strong>：<code className="font-mono">EventStreamOB</code> 每帧调用 <code className="font-mono">setNow(performance.now())</code> 对数百个 SVG DOM 节点做 diff。
            </li>
            <li>
              <strong>无法追踪具体数据 (Zero Data Tracking)</strong>：既无 Y 轴明确刻度，也无十字准星 (Crosshair) 悬停读数和暂停快照 (Freeze)，闪过的峰值根本抓不到。
            </li>
            <li>
              <strong>静态渐变 ID 冲突</strong>：多个 <code className="font-mono">CubicBezierGraph</code> 同屏时 <code className="font-mono">id="curveGradient"</code> 互相覆盖。
            </li>
          </ul>
        </div>

        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 ${
            isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/30 border-emerald-800/60'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-emerald-500">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>UIStorybook 标准化图表最佳实践</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-[11px] opacity-90">
            <li>
              <strong>1:1 物理像素对齐 DPR Canvas</strong>：高频遥测与散点流全部采用 <code className="font-mono">devicePixelRatio</code> 高清 Canvas 绘制，圆点绝对正圆、线条锐利无畸变。
            </li>
            <li>
              <strong>交互式十字准星与最近点吸附 (Reticle Lock)</strong>：悬停自动锁定采样点或碰撞事件，实时读出精确毫秒、冲量差值与触发状态。
            </li>
            <li>
              <strong>一键冻结快照 (Freeze Snapshot)</strong>：随时定格 120Hz 高速数据流，从容排查偶发掉帧或物理碰撞异常。
            </li>
            <li>
              <strong>可拖拽控制手柄 + 解析导数极值求解</strong>：贝塞尔曲线支持画布直接拖拽 <code className="font-mono">P1/P2</code>，轨迹图通过二次方程精确解出跃升极值点。
            </li>
          </ul>
        </div>
      </div>

      {/* Chart 1: TelemetrySparklineChart */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">
              1. 120Hz 帧耗时与预算监控图 (TelemetrySparklineChart)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={<Flame className="h-3.5 w-3.5 text-rose-500" />}
              onClick={injectFrameSpike}
            >
              注入掉帧尖峰 (Inject Spike)
            </Button>
          </div>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          将鼠标悬停在图表上即可移动十字准星逐帧检视耗时与预算差值；点击右上角 <strong>Freeze</strong> 可随时定格波形：
        </p>

        <TelemetrySparklineChart
          history={frameHistory}
          budgetMs={8.33}
          refreshHz={120}
          isLight={isLight}
          phases={[
            { phase: 'sim', avgMs: 1.42, share: 0.26 },
            { phase: 'scene', avgMs: 1.68, share: 0.31 },
            { phase: 'camera', avgMs: 0.34, share: 0.06 },
            { phase: 'prep', avgMs: 0.58, share: 0.11 },
            { phase: 'bloom', avgMs: 0.89, share: 0.16 },
            { phase: 'final', avgMs: 0.52, share: 0.10 },
          ]}
        />
      </div>

      {/* Chart 2: EventImpulseScatterChart */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">
              2. 物理碰撞冲量散点与音频阈值追踪图 (EventImpulseScatterChart)
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            icon={<Plus className="h-3.5 w-3.5 text-amber-500" />}
            onClick={emitCollisionBurst}
          >
            触发随机物理碰撞 (Emit Collision)
          </Button>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          采用垂线脉冲杆 (Lollipop Stem) + 正圆散点，清晰区分高于音频门限（高亮描边）与低于门限被静音（半透明灰）的碰撞事件。鼠标靠近任意散点自动吸附锁定：
        </p>

        <EventImpulseScatterChart
          events={events}
          threshold={threshold}
          onThresholdChange={setThreshold}
          onClear={() => setEvents([])}
          isLight={isLight}
        />
      </div>

      {/* Chart 3 & 4: CubicBezierCurveEditor + ParametricTrajectoryChart */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Spline className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm">
              3 & 4. 交互式三次贝塞尔曲线与参数化物理轨迹极值分析 (CubicBezierCurveEditor & ParametricTrajectoryChart)
            </span>
          </div>
          <Badge size="sm" variant="amber" isLight={isLight}>
            画布直接拖拽控制点 + 中心正负双向滑块联动
          </Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          左图支持直接在 SVG 画布上拖拽 <code className="font-mono text-amber-500">P1</code> 与 <code className="font-mono text-pink-500">P2</code> 手柄（或点击预设按钮），右图实时通过解析导数 <code className="font-mono">dy/du = 0</code> 计算大加速球拾取时的向上跃升峰值 (<code className="font-mono">Peak Lift +uu</code>) 与触顶时刻。下方控制条使用中心双向填充 <code className="font-mono">variation="centered"</code> 调节正负控制点坐标：
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CubicBezierCurveEditor
            title="Orb Collect Easing (Drag P1 / P2)"
            p1x={orbBezier.p1x}
            p1y={orbBezier.p1y}
            p2x={orbBezier.p2x}
            p2y={orbBezier.p2y}
            onChange={setOrbBezier}
            isLight={isLight}
          />

          <ParametricTrajectoryChart
            title="Big Boost Orb Vertical Trajectory"
            p1x={orbBezier.p1x}
            p1y={orbBezier.p1y}
            p2x={orbBezier.p2x}
            p2y={orbBezier.p2y}
            durationMs={orbDurationMs}
            dropDistance={orbDropDistance}
            isLight={isLight}
          />
        </div>

        {/* Centered Bipolar Sliders controlling P1.Y, P2.Y, Duration, Drop Distance */}
        <div
          className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
          }`}
        >
          <SliderControl
            label="Orb P1.Y (Negative = Upward Leap)"
            value={orbBezier.p1y}
            min={-4.0}
            max={3.0}
            step={0.05}
            origin={0}
            variation="centered"
            showSign={true}
            colorScheme="amber"
            negativeColorScheme="sky"
            editable={true}
            onChange={(val) => setOrbBezier((prev) => ({ ...prev, p1y: val }))}
            isLight={isLight}
          />

          <SliderControl
            label="Orb P2.Y (Terminal Plunge Tangent)"
            value={orbBezier.p2y}
            min={-4.0}
            max={3.0}
            step={0.05}
            origin={0}
            variation="centered"
            showSign={true}
            colorScheme="amber"
            negativeColorScheme="sky"
            editable={true}
            onChange={(val) => setOrbBezier((prev) => ({ ...prev, p2y: val }))}
            isLight={isLight}
          />

          <SliderControl
            label="Collect Duration"
            value={orbDurationMs}
            min={50}
            max={800}
            step={10}
            unit="ms"
            colorScheme="neutral"
            editable={true}
            onChange={setOrbDurationMs}
            isLight={isLight}
          />

          <SliderControl
            label="Drop Distance"
            value={orbDropDistance}
            min={20}
            max={300}
            step={5}
            unit="uu"
            colorScheme="neutral"
            editable={true}
            onChange={setOrbDropDistance}
            isLight={isLight}
          />
        </div>

        {/* Second Simultaneous Instance Proof (No SVG Gradient ID Collision) */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
              <MoveVertical className="h-3.5 w-3.5 text-emerald-500" />
              <span>同屏多实例并存验证（通过 <code className="font-mono text-emerald-500">useId()</code> 隔离 SVG 渐变 ID，互不串色）：</span>
            </span>
          </div>
          <CubicBezierCurveEditor
            title="Second Coexisting Curve Instance (Hologram Glow Dissolve)"
            p1x={glowBezier.p1x}
            p1y={glowBezier.p1y}
            p2x={glowBezier.p2x}
            p2y={glowBezier.p2y}
            onChange={setGlowBezier}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Agent Code Recipe */}
      <CodeBlock
        isLight={isLight}
        title="Agent 高性能清晰图表调用配方 (Charts & Curves Recipe)"
        code={`import {
  TelemetrySparklineChart,
  EventImpulseScatterChart,
  CubicBezierCurveEditor,
  ParametricTrajectoryChart,
} from '@/charts';

// 1. 120Hz 高性能帧耗时图表 (DPR Canvas + Crosshair 追踪 + Freeze 快照)
<TelemetrySparklineChart
  history={frameHistoryMs}
  budgetMs={8.33}
  refreshHz={120}
  phases={cpuPhases}
  isLight={isLight}
/>

// 2. 物理碰撞冲量散点与音频门限追踪图 (支持最近点吸附锁定)
<EventImpulseScatterChart
  events={collisionEvents}
  threshold={audioThreshold}
  onThresholdChange={setAudioThreshold}
  isLight={isLight}
/>

// 3. 交互式三次贝塞尔曲线编辑器 + 参数化物理轨迹极值分析图
<CubicBezierCurveEditor
  p1x={p1x} p1y={p1y} p2x={p2x} p2y={p2y}
  onChange={setBezier}
  isLight={isLight}
/>
<ParametricTrajectoryChart
  p1x={p1x} p1y={p1y} p2x={p2x} p2y={p2y}
  durationMs={200} dropDistance={175}
  isLight={isLight}
/>`}
      />
    </div>
  );
};
