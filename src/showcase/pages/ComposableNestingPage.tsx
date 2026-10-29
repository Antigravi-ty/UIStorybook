import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../stores';

const useState = createScopedSyncedState('page:composable-nesting');
import {
  Button,
  Badge,
  KeycapBadge,
  SliderControl,
  DualGrabberSlider,
  PrecisionDigitPicker,
  TunerPrecisionContext,
  DropdownMenu,
  ToggleSwitch,
  SegmentedSwitch,
  ColorSwatchInput,
  UVTransformControl,
  UVTransformState,
  PriorityQueueList,
  PriorityQueueItem,
  EventFilterMatrix,
  EventCatalogEntry,
} from '../../primitives';
import {
  TeamRosterCard,
  PeerRosterCard,
  PhaseVariationMatrix,
  TelemetryConfigCard,
  TelemetryConfigState,
  CameraSwivelSimulatorCard,
  KickoffDuelMatrixCard,
} from '../../compounds';
import {
  TelemetryRingBuffer,
  TelemetrySparklineChart,
  CubicBezierCurveEditor,
  CubicBezierValue,
} from '../../charts';
import { VStack, HStack, GridStack } from '../../layout';
import { Layers, Sparkles, Sliders, Palette, Filter, MousePointerClick } from 'lucide-react';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';

export interface ComposableNestingPageProps {
  isLight: boolean;
}

const L3_DIRECTORY_ITEMS: JumpDirectoryItem[] = [
  {
    id: 'l3-1-composable-dropdown',
    code: 'L3.1',
    name: 'DropdownMenu (Composable)',
    label: '下拉菜单内嵌双向滑块 + 120Hz TelemetrySparklineChart',
  },
  {
    id: 'l3-2-composable-button',
    code: 'L3.2',
    name: 'Button (composable)',
    label: '巨型可嵌套按钮容器 (内嵌死区滑块 + 贝塞尔曲线编辑器)',
  },
  {
    id: 'l3-3-uv-color-tuner',
    code: 'L3.3 & L3.4',
    name: 'UVTransformControl & ColorSwatchInput',
    label: '贴花 UV 缩放偏移矩阵 + 着色器 Hex 色板输入行',
  },
  {
    id: 'l3-5-priority-event-matrix',
    code: 'L3.5 & L3.6',
    name: 'PriorityQueueList & EventFilterMatrix',
    label: '车库涂装优先级队列 + 0x01..0x08 十六进制事件过滤矩阵',
  },
  {
    id: 'l3-7-phase-telemetry',
    code: 'L3.7 & L3.8',
    name: 'PhaseVariationMatrix & TelemetryConfigCard',
    label: '音频 3 阶段混音矩阵 + 5 指标遥测策略卡',
  },
  {
    id: 'l3-9-roster-cards',
    code: 'L3.9 & L3.10',
    name: 'TeamRosterCard & PeerRosterCard',
    label: '多 Bot 队伍花名册 (`compounds/TeamRosterCard`) + 房间联机花名册 (`compounds/PeerRosterCard`)',
  },
  {
    id: 'l3-11-swivel-kickoff-duel',
    code: 'L3.11 & L3.12',
    name: 'CameraSwivelSimulatorCard & KickoffDuelMatrixCard',
    label: '视角旋转模拟器 + 开球 AI 对决 5 出生点基准矩阵',
  },
];

const DEFAULT_EVENT_CATALOG: EventCatalogEntry[] = [
  { hex: '0x01', id: 'CAR_WORLD_COLLISION', name: 'Chassis / Bumper World Impact' },
  { hex: '0x02', id: 'BALL_WORLD_BOUNCE', name: 'Ball Bounce on Arena Geometry' },
  { hex: '0x03', id: 'CAR_BALL_STRIKE', name: 'Direct Kinetic Car-Ball Strike' },
  { hex: '0x04', id: 'WHEEL_LANDING', name: 'Suspension 4-Wheel Touchdown' },
  { hex: '0x05', id: 'SUSPENSION_BOTTOM_OUT', name: 'Hard Chassis Bottom-Out' },
  { hex: '0x06', id: 'BOOST_IGNITION', name: 'Rocket Thruster Ignition Burst' },
  { hex: '0x07', id: 'SUPERSONIC_BOOM', name: '2200 uu/s Supersonic Transition' },
  { hex: '0x08', id: 'GOAL_HORN_BLAST', name: 'Goal Explosion & Stadium Horn' },
];

export const ComposableNestingPage: React.FC<ComposableNestingPageProps> = ({ isLight }) => {
  // 1. Universal Nesting States
  const [presetMode, setPresetMode] = useState('pro-esports');
  const [dropdownPrecision, setDropdownPrecision] = useState(0.01);
  const [dropdownBias, setDropdownBias] = useState(12.5);
  const [dropdownLiveHud, setDropdownLiveHud] = useState(true);

  // Giant Composable Button internal states
  const [buttonClicks, setButtonClicks] = useState(0);
  const [nestedPitchBias, setNestedPitchBias] = useState(-14.5);
  const [nestedDeadband, setNestedDeadband] = useState<[number, number]>([-8, 12]);
  const [nestedCurve, setNestedCurve] = useState<CubicBezierValue>({
    p1x: 0.22,
    p1y: 1.0,
    p2x: 0.36,
    p2y: 1.0,
  });
  const [nestedMode, setNestedMode] = useState('agile');

  // Mini telemetry stream for embedding inside Dropdown (Zero React re-render RingBuffer)
  const miniRingBufferRef = useRef<TelemetryRingBuffer | null>(null);
  if (!miniRingBufferRef.current) {
    const arr: number[] = [];
    for (let i = 0; i < 120; i++) {
      arr.push(Number((7.4 + Math.sin(i * 0.25) * 0.8 + (i % 19 === 0 ? 2.4 : 0)).toFixed(2)));
    }
    miniRingBufferRef.current = new TelemetryRingBuffer(120, arr);
  }

  useEffect(() => {
    let phase = 0;
    const timer = window.setInterval(() => {
      phase += 1;
      const nextMs = 7.3 + Math.sin(phase * 0.2) * 0.9 + (Math.random() > 0.94 ? 2.8 : 0);
      miniRingBufferRef.current!.push(nextMs);
    }, 33);
    return () => window.clearInterval(timer);
  }, []);

  // 2. Modularized RLCleanWASM Tuner & Garage States
  const [globalStep, setGlobalStep] = useState(0.01);
  const [uvTransform, setUvTransform] = useState<UVTransformState>({
    scaleX: 1.0,
    scaleY: 1.0,
    offsetX: 0.0,
    offsetY: 0.0,
    linkScale: true,
  });

  const [primaryPaint, setPrimaryPaint] = useState('#F59E0B');
  const [accentFinish, setAccentFinish] = useState('#10B981');
  const [emissiveGlow, setEmissiveGlow] = useState('#38BDF8');

  const [blueQueue, setBlueQueue] = useState<PriorityQueueItem[]>([
    { id: 'sky-cobalt', name: 'Cobalt Metallic', hex: '#0284c7' },
    { id: 'teal-cyber', name: 'Cyber Teal', hex: '#0d9488' },
    { id: 'indigo-deep', name: 'Deep Night Indigo', hex: '#4f46e5' },
  ]);

  const [orangeQueue, setOrangeQueue] = useState<PriorityQueueItem[]>([
    { id: 'amber-solar', name: 'Solar Amber', hex: '#f59e0b' },
    { id: 'crimson-blaze', name: 'Crimson Blaze', hex: '#e11d48' },
    { id: 'gold-anodized', name: 'Anodized Gold', hex: '#ca8a04' },
  ]);

  const handleReorder = (
    setter: React.Dispatch<React.SetStateAction<PriorityQueueItem[]>>,
    index: number,
    direction: 'up' | 'down'
  ) => {
    setter((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const [selectedEventsMap, setSelectedEventsMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of DEFAULT_EVENT_CATALOG) {
      initial[item.hex.toLowerCase()] = true;
    }
    return initial;
  });

  const handleToggleEvent = (hex: string) => {
    const key = hex.toLowerCase();
    setSelectedEventsMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllEvents = () => {
    const next: Record<string, boolean> = {};
    for (const item of DEFAULT_EVENT_CATALOG) {
      next[item.hex.toLowerCase()] = true;
    }
    setSelectedEventsMap(next);
  };

  const handleDeselectAllEvents = () => {
    setSelectedEventsMap({});
  };

  const [telemetryConfig, setTelemetryConfig] = useState<TelemetryConfigState>({
    alwaysShow: true,
    fpsMode: 'always',
    refreshRateMode: 'always',
    renderScaleMode: 'always',
    physicsRateMode: 'always',
    latencyMode: 'always',
  });
  const [swivelPreset, setSwivelPreset] = useState<'none' | 'left' | 'right' | 'up' | 'down' | 'rearView'>('none');
  const [swivelStrength, setSwivelStrength] = useState(0.95);
  const [swivelAxes, setSwivelAxes] = useState<[number, number]>([0, 0]);
  const [duelCell, setDuelCell] = useState<{ blue: string; orange: string; slot: number }>({
    blue: 'nexto',
    orange: 'necto',
    slot: 0,
  });

  return (
    <div className="max-w-5xl space-y-10 pb-16">
      {/* Top Jump Directory */}
      <PageJumpDirectory
        layerTag="Layer 3 · Domain-Agnostic Composable Compounds"
        title="L3 万物可嵌套容器与解耦复合组件目录"
        subtitle="所有 L3 复合卡片均已实现零 Store 耦合、React.memo 隔离，并完整响应 Light/Dark 模式切换。"
        items={L3_DIRECTORY_ITEMS}
        isLight={isLight}
      />

      {/* Header */}
      <div className="space-y-2 border-b pb-6 border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Badge variant="amber" dot isLight={isLight}>
            Universal Nesting & Modular Tuner
          </Badge>
          <Badge variant="neutral" isLight={isLight}>
            Zero Coupling · 指哪儿打哪儿
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          万物皆可嵌套 (Universal Composable Nesting) & RLCleanWASM 模块化调优器
        </h1>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          本页展示两大核心设计支柱：① <strong>万物皆可嵌套哲学</strong>——无论是 <code>&lt;DropdownMenu&gt;</code> 还是开启了 <code>composable</code> 的 <code>&lt;Button&gt;</code>，内部均可任意嵌套滑块、步进器、甚至实时 Canvas 遥测图表与完整子页面，且事件冒泡严格隔离、布局零截断；② <strong>RLCleanWASM &amp; RocketCompanion 业务控件的标准化解耦</strong>——全部提炼为纯表现层复合组件并支持亮暗主题切换。
        </p>
      </div>

      {/* Section 1: Universal Nesting - DropdownMenu */}
      <section id="l3-1-composable-dropdown" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              1. [L3.1] Composable DropdownMenu (下拉菜单任意嵌套控件与图表)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              既支持传统轻量级选项数组 (<code>options</code>)，也支持将任意面板、<code>SliderControl</code>、<code>PrecisionDigitPicker</code> 乃至 120Hz <code>TelemetrySparklineChart</code> 直接作为 <code>children</code> 嵌入下拉菜单中。
            </p>
          </div>
          <Badge variant="success" isLight={isLight}>
            Composable Popover
          </Badge>
        </div>

        <div
          className={`p-6 rounded-xl border ${
            isLight ? 'bg-neutral-100/70 border-neutral-200/80' : 'bg-neutral-900/40 border-neutral-800/80'
          }`}
        >
          <HStack gap="md" wrap className="items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Mode A: Standard Options Dropdown */}
              <DropdownMenu
                label="Camera Preset"
                value={presetMode}
                onChange={(val) => setPresetMode(val)}
                isLight={isLight}
                options={[
                  { value: 'pro-esports', label: 'Pro Esports (FOV 110°)', badge: 'Default', description: 'Wide field of view with minimal camera shake' },
                  { value: 'freestyle', label: 'Aerial Freestyle', badge: 'Tight', description: 'Closer distance for precise flip reset tracking' },
                  { value: 'director', label: 'Broadcast Director', badge: 'Smooth', description: 'High stiffness damping for replay observation' },
                ]}
              />

              {/* Mode B: Deeply Nested Interactive Inspector Dropdown */}
              <DropdownMenu
                trigger={
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-semibold">Nested Live Telemetry & Tuner Dropdown</span>
                    <Badge variant="amber" isLight={isLight}>
                      {dropdownBias > 0 ? `+${dropdownBias}°` : `${dropdownBias}°`}
                    </Badge>
                  </div>
                }
                menuWidthClass="w-[420px]"
                isLight={isLight}
              >
                <TunerPrecisionContext.Provider value={{ step: dropdownPrecision, setStep: setDropdownPrecision }}>
                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 border-neutral-200/70 dark:border-neutral-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Embedded Inspector inside Dropdown
                      </span>
                      <PrecisionDigitPicker
                        step={dropdownPrecision}
                        onStepChange={setDropdownPrecision}
                        compact
                        isLight={isLight}
                      />
                    </div>

                    <SliderControl
                      label="Instant Pitch Bias (Centered)"
                      value={dropdownBias}
                      min={-45}
                      max={45}
                      step={dropdownPrecision}
                      variation="centered"
                      origin={0}
                      showSign
                      editable
                      usePrecisionContext
                      unit="°"
                      colorScheme="amber"
                      negativeColorScheme="sky"
                      onChange={setDropdownBias}
                      isLight={isLight}
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium">Embed Live 120Hz Sparkline</span>
                      <ToggleSwitch
                        checked={dropdownLiveHud}
                        onCheckedChange={setDropdownLiveHud}
                        variant="orange"
                        isLight={isLight}
                      />
                    </div>

                    {dropdownLiveHud && (
                      <TelemetrySparklineChart
                        ringBuffer={miniRingBufferRef.current!}
                        height={95}
                        compact
                        title="Dropdown Embedded Frame Pacing"
                        isLight={isLight}
                      />
                    )}
                  </div>
                </TunerPrecisionContext.Provider>
              </DropdownMenu>
            </div>

            <div className="text-xs font-mono text-neutral-500">
              Active Preset: <strong className="text-amber-500">{presetMode}</strong> · Bias: <strong>{dropdownBias > 0 ? `+${dropdownBias}` : dropdownBias}°</strong>
            </div>
          </HStack>
        </div>
      </section>

      {/* Section 2: Universal Nesting - The Giant Composable Button */}
      <section id="l3-2-composable-button" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-amber-500" />
              2. [L3.2] Giant Composable Button (把整个交互页面嵌入一个大 Button 内部)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              开启 <code>&lt;Button composable&gt;</code> 后，按钮自动升级为语义化 <code>role="button"</code> 容器并解除单行 <code>truncate</code> 限制：点击空白外框触发按钮主操作，而在内部拖拽双向滑块、双游标死区、或拖拽贝塞尔曲线控制点时，事件自动隔离不误触外层按钮。
            </p>
          </div>
          <Badge variant="amber" isLight={isLight}>
            Button Outer Clicks: {buttonClicks}
          </Badge>
        </div>

        <Button
          composable
          variant="secondary"
          isLight={isLight}
          onClick={() => setButtonClicks((c) => c + 1)}
          className="w-full p-5 rounded-2xl text-left border-2 border-dashed border-amber-500/40 hover:border-amber-500/80 transition-all"
        >
          <VStack gap="md">
            {/* Top Banner inside the Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-amber-500 text-neutral-950 font-bold flex items-center justify-center text-xs shadow-xs">
                  BTN
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    <span>I Am A Single Composable &lt;Button composable&gt; Instance</span>
                    <KeycapBadge shortcut="Click Frame to Trigger" isLight={isLight} />
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    内部嵌套了双向零点滑块、中心死区双游标滑块、分段开关与可拖拽三次贝塞尔曲线编辑器
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Badge variant="success" dot isLight={isLight}>
                  Triggered {buttonClicks}x
                </Badge>
                <SegmentedSwitch
                  options={[
                    { value: 'agile', label: 'Agile' },
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'heavy', label: 'Heavy' },
                  ]}
                  value={nestedMode}
                  onValueChange={setNestedMode}
                  isLight={isLight}
                />
              </div>
            </div>

            {/* Grid of Complex Interactive Controls inside the Button */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`p-4 rounded-xl border space-y-4 ${
                  isLight ? 'bg-white/90 border-neutral-200/80' : 'bg-neutral-950/80 border-neutral-800'
                }`}
              >
                <SliderControl
                  label="Nested Bipolar Pitch Torque"
                  value={nestedPitchBias}
                  min={-50}
                  max={50}
                  step={0.5}
                  variation="centered"
                  origin={0}
                  showSign
                  editable
                  unit=" Nm"
                  colorScheme="amber"
                  negativeColorScheme="sky"
                  onChange={setNestedPitchBias}
                  isLight={isLight}
                />

                <DualGrabberSlider
                  label="Nested Dual-Grabber Steering Deadband"
                  value={nestedDeadband}
                  min={-30}
                  max={30}
                  step={0.5}
                  origin={0}
                  mode="centered-deadband"
                  unit="°"
                  colorScheme="amber"
                  onChange={setNestedDeadband}
                  isLight={isLight}
                />
              </div>

              <div>
                <CubicBezierCurveEditor
                  p1x={nestedCurve.p1x}
                  p1y={nestedCurve.p1y}
                  p2x={nestedCurve.p2x}
                  p2y={nestedCurve.p2y}
                  onChange={setNestedCurve}
                  title="Nested Cubic-Bezier Response Curve"
                  height={165}
                  isLight={isLight}
                />
              </div>
            </div>
          </VStack>
        </Button>
      </section>

      {/* Section 3: Modularized RLCleanWASM Tuner & Garage Primitives */}
      <section id="l3-3-uv-color-tuner" className="space-y-4 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-500" />
              3. [L3.3 ~ L3.6] RLCleanWASM 调优器与车库专用原语 (Decoupled Tuner & Garage Primitives)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              源自 <code>RLCleanWASM</code> 的 <code>DecalTextTunerWindow</code>、<code>SoundTunerFloatingWindow</code>、<code>GaragePanel</code> 与 <code>EventStreamOBFloatingWindow</code>，现已彻底解耦为独立可复用的标准原语。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-500">Shared Precision Context:</span>
            <PrecisionDigitPicker
              step={globalStep}
              onStepChange={setGlobalStep}
              compact
              isLight={isLight}
            />
          </div>
        </div>

        <TunerPrecisionContext.Provider value={{ step: globalStep, setStep: setGlobalStep }}>
          <GridStack cols={2} gap="md">
            {/* UVTransformControl */}
            <UVTransformControl
              title="Decal UV Scale & Offset Matrix"
              value={uvTransform}
              onChange={(patch) => setUvTransform((prev) => ({ ...prev, ...patch }))}
              isLight={isLight}
            />

            {/* ColorSwatchInput Group */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-neutral-100/70 border-neutral-200/80' : 'bg-neutral-900/50 border-neutral-800/80'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-neutral-200/70 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    ColorSwatchInput (Shader & Decal Hex Pickers)
                  </span>
                </div>
                <Badge variant="neutral" isLight={isLight}>
                  TunerColorRow
                </Badge>
              </div>

              <div className="space-y-2">
                <ColorSwatchInput
                  label="Chassis Primary Paint"
                  value={primaryPaint}
                  presets={['#F59E0B', '#EF4444', '#3B82F6', '#10B981']}
                  onChange={setPrimaryPaint}
                  isLight={isLight}
                />
                <ColorSwatchInput
                  label="Anodized Accent Trim"
                  value={accentFinish}
                  presets={['#10B981', '#8B5CF6', '#EC4899', '#F97316']}
                  onChange={setAccentFinish}
                  isLight={isLight}
                />
                <ColorSwatchInput
                  label="Boost Core Emissive"
                  value={emissiveGlow}
                  presets={['#38BDF8', '#FACC15', '#A855F7', '#F43F5E']}
                  onChange={setEmissiveGlow}
                  isLight={isLight}
                />
              </div>

              {/* Live preview strip */}
              <div className="pt-2 flex items-center gap-2">
                <div
                  className="h-6 flex-1 rounded-lg border border-black/10 shadow-inner"
                  style={{
                    background: `linear-gradient(90deg, ${primaryPaint} 0%, ${accentFinish} 55%, ${emissiveGlow} 100%)`,
                  }}
                />
                <span className="text-[10px] font-mono text-neutral-500">Live Shader Gradient</span>
              </div>
            </div>
          </GridStack>
        </TunerPrecisionContext.Provider>

        {/* PriorityQueueList for Garage Team Colors */}
        <div id="l3-5-priority-event-matrix" className="space-y-4 scroll-mt-24">
          <GridStack cols={2} gap="md">
            <PriorityQueueList
              title="Blue Team Paint Fallback Priority"
              subtitle="Primary -> Fallback 1 -> Fallback 2"
              items={blueQueue}
              accentDotColor="#0284c7"
              onReorder={(idx, dir) => handleReorder(setBlueQueue, idx, dir)}
              isLight={isLight}
            />
            <PriorityQueueList
              title="Orange Team Paint Fallback Priority"
              subtitle="Reorder preferred paint slots with zero coupling"
              items={orangeQueue}
              accentDotColor="#f59e0b"
              onReorder={(idx, dir) => handleReorder(setOrangeQueue, idx, dir)}
              isLight={isLight}
            />
          </GridStack>

          {/* EventFilterMatrix */}
          <div
            className={`p-5 rounded-xl border space-y-3 ${
              isLight ? 'bg-neutral-100/70 border-neutral-200/80' : 'bg-neutral-900/50 border-neutral-800/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  EventFilterMatrix (0x01..0x08 Hex Event Catalog Filter)
                </span>
              </div>
              <Badge variant="amber" isLight={isLight}>
                Decoupled Event Stream Filter
              </Badge>
            </div>
            <EventFilterMatrix
              items={DEFAULT_EVENT_CATALOG}
              selectedMap={selectedEventsMap}
              onToggleItem={handleToggleEvent}
              onSelectAll={handleSelectAllEvents}
              onDeselectAll={handleDeselectAllEvents}
              isLight={isLight}
            />
          </div>
        </div>
      </section>

      {/* Section 4: Newly Decoupled RocketCompanion L3 Compounds */}
      <section className="space-y-5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              4. [L3.7 ~ L3.12] RocketCompanion 专项解耦复合卡片 (L3 Domain-Agnostic Compounds · Light/Dark 完整适配)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              将原本在 <code>RocketCompanion</code> 中与全局 Store 紧耦合的音频阶段池矩阵、遥测开关策略卡、多 Bot/联机花名册、自由视角旋转模拟器及开球对决矩阵，重构为 100% 纯 Props 驱动的标准复合组件，并完整传入 <code>isLight=&#123;isLight&#125;</code>。
            </p>
          </div>
          <Badge variant="amber" isLight={isLight}>
            Zero Store Coupling · Light/Dark Ready
          </Badge>
        </div>

        <div id="l3-7-phase-telemetry" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start scroll-mt-24">
          <PhaseVariationMatrix isLight={isLight} />
          <TelemetryConfigCard
            isLight={isLight}
            telemetry={telemetryConfig}
            onUpdateTelemetry={(patch) =>
              setTelemetryConfig((prev) => ({ ...prev, ...patch }))
            }
          />
        </div>

        <div id="l3-9-roster-cards" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start scroll-mt-24">
          <TeamRosterCard team={0} isLight={isLight} />
          <PeerRosterCard isHosting={true} isLight={isLight} />
        </div>

        <div id="l3-11-swivel-kickoff-duel" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start scroll-mt-24">
          <CameraSwivelSimulatorCard
            isLight={isLight}
            preset={swivelPreset}
            strength={swivelStrength}
            lookX={swivelAxes[0]}
            lookY={swivelAxes[1]}
            onChangePreset={setSwivelPreset}
            onChangeStrength={setSwivelStrength}
            onChangeAxes={(x, y) => setSwivelAxes([x, y])}
          />
          <KickoffDuelMatrixCard
            isLight={isLight}
            selectedBlueModel={duelCell.blue}
            selectedOrangeModel={duelCell.orange}
            selectedSlotIndex={duelCell.slot}
            onSelectCell={(b, o, s) => setDuelCell({ blue: b, orange: o, slot: s })}
          />
        </div>
      </section>
    </div>
  );
};
export default ComposableNestingPage;
