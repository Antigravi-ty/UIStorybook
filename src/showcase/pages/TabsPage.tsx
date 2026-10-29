import React from 'react';
import { createScopedSyncedState } from '../stores';
import { Volume2, Monitor, Gamepad2, Check } from 'lucide-react';

const useState = createScopedSyncedState('page:tabs');
import { UnderlineTabs, TabItem } from '../../primitives/UnderlineTabs';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { Checkbox } from '../../primitives/Checkbox';
import { SliderControl } from '../../primitives/SliderControl';
import { DualGrabberSlider } from '../../primitives/DualGrabberSlider';
import { PrecisionDigitPicker, TunerPrecisionContext } from '../../primitives/PrecisionDigitPicker';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import { SettingActionRowTuner } from './recipes/SettingActionRowTuner';
import { UnderlineTabsTuner } from './recipes/UnderlineTabsTuner';

const L1_TABS_JUMP_ITEMS: JumpDirectoryItem[] = [
  {
    id: 'l1-setting-action-row',
    code: 'L1.0',
    name: 'SettingActionRow',
    label: '设置导航行 (外框 · Description · Padding · 字号 · SVG 颜色调优)',
    badge: 'L1 ⇄ L6 ⇄ L7',
  },
  {
    id: 'l1-underline-tabs',
    code: 'L1.1',
    name: 'UnderlineTabs',
    label: '滑动下划线标签栏 (字号 · Icon Size · 间距 · 字重实时调优)',
    badge: 'L1 ⇄ L6 ⇄ L7',
  },
  {
    id: 'l1-segmented-switch',
    code: 'L1.2',
    name: 'SegmentedSwitch',
    label: '圆角矩形触感分段控制器',
    badge: 'L1 Primitive',
  },
  {
    id: 'l1-slider-control',
    code: 'L1.3',
    name: 'SliderControl',
    label: '步进滑块与 Centered 中心双向填充变体',
    badge: 'L1 Primitive',
  },
  {
    id: 'l1-dual-grabber-slider',
    code: 'L1.4',
    name: 'DualGrabberSlider',
    label: '双滑块中心死区与自由区间控制器',
    badge: 'L1 Primitive',
  },
  {
    id: 'l1-precision-digit-picker',
    code: 'L1.5',
    name: 'PrecisionDigitPicker',
    label: '1.00000 小数位步进精度选择器',
    badge: 'L1 Primitive',
  },
  {
    id: 'l1-toggle-switch',
    code: 'L1.6',
    name: 'ToggleSwitch',
    label: 'Apple HIG 触觉物理开关',
    badge: 'L1 Primitive',
  },
  {
    id: 'l1-checkbox',
    code: 'L1.7',
    name: 'Checkbox',
    label: '触觉圆角复选框 (支持色板 · 圆角 · 勾线粗细 · 半选状态)',
    badge: 'L1 Primitive',
  },
];

export const TabsPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // Tabs State (testing multiple independent instances)
  const [activeTab1, setActiveTab1] = useState('audio');
  const [activeTab2, setActiveTab2] = useState('all');

  // Segmented Switch States (testing multiple independent instances)
  const [switch1, setSwitch1] = useState('performance');
  const [switch2, setSwitch2] = useState('mid');
  const [switch3, setSwitch3] = useState('long-label');
  const [switch4, setSwitch4] = useState('proportional-2');

  // Sliders State
  const [sliderNeutral, setSliderNeutral] = useState(75);
  const [sliderAmber, setSliderAmber] = useState(50);
  const [sliderCentered, setSliderCentered] = useState(18);
  const [sliderTrim, setSliderTrim] = useState(-24);
  const [sliderUnityGain, setSliderUnityGain] = useState(180);

  // Dual-Grabber Slider States (from RLCleanWASM SettingTwoGrabberSliderRow)
  const [bufferTargetAlpha, setBufferTargetAlpha] = useState(3);
  const [deadbandOffsets, setDeadbandOffsets] = useState<[number, number]>([-2, 2]);
  const [freeBand, setFreeBand] = useState<[number, number]>([120, 340]);

  // Precision Digit Picker State (from RLCleanWASM DriftwoodsTunerControls)
  const [precisionStep, setPrecisionStep] = useState(0.001);
  const [uvScaleX, setUvScaleX] = useState(1.0425);
  const [lineSmoothness, setLineSmoothness] = useState(0.0512);

  // Toggles State
  const [toggleGreen, setToggleGreen] = useState(true);
  const [toggleBlack, setToggleBlack] = useState(true);
  const [toggleOrange, setToggleOrange] = useState(true);

  const tabs1: TabItem[] = [
    { id: 'audio', label: 'Audio', icon: <Volume2 className="h-4 w-4" /> },
    { id: 'video', label: 'Graphics', icon: <Monitor className="h-4 w-4" />, badge: <Badge size="sm" variant="amber" isLight={isLight}>NEW</Badge> },
    { id: 'gameplay', label: 'Gameplay', icon: <Gamepad2 className="h-4 w-4" /> },
  ];

  const tabs2: TabItem[] = [
    { id: 'all', label: '全部项目' },
    { id: 'installed', label: '已装配部件', badge: <Badge size="sm" variant="neutral" isLight={isLight}>8</Badge> },
    { id: 'locked', label: '待解锁', disabled: true },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tabs & Controls 原子控件与设置行原语</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          轻量高阶原子交互控件：包含解耦的设置导航行原语 (<code className="font-mono">SettingActionRow</code>)、暖橙底色下划线、圆角矩形分段控制器、支持中心零位正负双向填充的 SliderControl、双滑块死区控制器 (DualGrabberSlider)、小数位步进精度选择器 (PrecisionDigitPicker) 以及物理开关。
        </p>
      </div>

      <PageJumpDirectory
        title="L1 · Tabs / Switch / Slider / SettingActionRow 快速跳转目录"
        subtitle="点击卡片平滑定位至对应原子控件或独立调优器，支持一键复制规范化组件代号"
        items={L1_TABS_JUMP_ITEMS}
        isLight={isLight}
      />

      {/* 0. SettingActionRow Standalone Primitive & Tuner */}
      <div id="l1-setting-action-row" className="scroll-mt-6 flex flex-col gap-3">
        <SettingActionRowTuner
          isLight={isLight}
          title="0. 设置导航行原语与独立调优器 (SettingActionRow · 外框 / Description 显隐 / Padding / SVG 图标色)"
          showStandalonePreview={true}
        />
      </div>

      {/* 1. Underline Tabs Standalone Tuner & Multi-Instance Preview */}
      <div id="l1-underline-tabs" className="scroll-mt-6 flex flex-col gap-4">
        <UnderlineTabsTuner
          isLight={isLight}
          title="1. Apple/Linear 滑动下划线标签原语与独立调优器 (UnderlineTabs · 字号 / Icon Size / 间距 / 字重)"
          showStandalonePreview={true}
        />

        <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">多实例并存隔离验证 (React useId() 独立 layoutId)</span>
            <Badge size="sm" variant="amber" isLight={isLight}>橙色底线 / 多实例互不抢占指示器</Badge>
          </div>

          {/* Instance A */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-neutral-400">实例 A (带图标与 Badge):</span>
            <UnderlineTabs
              items={tabs1}
              activeId={activeTab1}
              onChange={setActiveTab1}
              isLight={isLight}
            />
          </div>

          {/* Instance B */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <span className="text-xs font-semibold text-neutral-400">实例 B (含禁用态与计数 Badge):</span>
            <UnderlineTabs
              items={tabs2}
              activeId={activeTab2}
              onChange={setActiveTab2}
              isLight={isLight}
            />
          </div>
        </div>
      </div>

      {/* 2. Segmented Switch */}
      <div id="l1-segmented-switch" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-6 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">2. 触感分段控制器 (SegmentedSwitch)</span>
          <Badge size="sm" variant="neutral" isLight={isLight}>圆角矩形 / 多实例隔离</Badge>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          解决胶囊过圆问题，采用规范圆角矩形（<code className="font-mono text-amber-500">rounded-lg / rounded-md</code>）；全面解决多实例指示器冲突；支持 <strong>左对齐/内容自适应</strong>、<strong>等距均分 (Equal)</strong>、<strong>内容比例均分 (Proportional)</strong> 三种宽度分配。
        </p>

        {/* Feature 1: Multi-instance Coexistence Demonstration */}
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>特性一：多实例同时存在（同时渲染各自的白色/高亮激活指示器）</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono text-neutral-400">控制器 1:</span>
              <SegmentedSwitch
                value={switch1}
                onValueChange={setSwitch1}
                isLight={isLight}
                options={[
                  { value: 'quality', label: 'Quality' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'performance', label: 'Performance' },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono text-neutral-400">控制器 2 (独立激活):</span>
              <SegmentedSwitch
                value={switch2}
                onValueChange={setSwitch2}
                isLight={isLight}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'mid', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Feature 2: Width Distribution Modes */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold text-neutral-400">特性二：宽度分布模式 (Width Distribution Modes)</span>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">
                A. 左对齐 / 内容长短自适应 (<code className="font-mono text-amber-500">distribution="auto"</code>):
              </span>
              <span className="text-[11px] text-neutral-400">长文本占用更多比例，短文本占用更少比例</span>
            </div>
            <SegmentedSwitch
              value={switch3}
              onValueChange={setSwitch3}
              isLight={isLight}
              distribution="auto"
              options={[
                { value: 'short', label: '短' },
                { value: 'medium-label', label: '中等长度标签' },
                { value: 'long-label', label: '较长的详细设置选项 (Longer Content)' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">
                B. 等距分布 / 平均分配 (<code className="font-mono text-amber-500">distribution="equal" / fullWidth</code>):
              </span>
              <span className="text-[11px] text-neutral-400">无论内容长短，每个分段均严格平分宽度</span>
            </div>
            <SegmentedSwitch
              value={switch3}
              onValueChange={setSwitch3}
              isLight={isLight}
              distribution="equal"
              options={[
                { value: 'short', label: '短' },
                { value: 'medium-label', label: '中等长度标签' },
                { value: 'long-label', label: '较长选项 (均分对齐)' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">
                C. 按宽度比例平均充满 (<code className="font-mono text-amber-500">distribution="proportional"</code>):
              </span>
              <span className="text-[11px] text-neutral-400">充满整行宽度，且保持内容权重间距</span>
            </div>
            <SegmentedSwitch
              value={switch4}
              onValueChange={setSwitch4}
              isLight={isLight}
              distribution="proportional"
              options={[
                { value: 'proportional-1', label: 'Compact' },
                { value: 'proportional-2', label: 'Balanced Proportion' },
                { value: 'proportional-3', label: 'Expanded High Priority Segment' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 3. Slider Control (Default + Centered Bipolar Variation + Custom Anchor) */}
      <div id="l1-slider-control" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm">3. 步进滑动微调控制器 (SliderControl — 含中心零位双向填充变体)</span>
          <Badge size="sm" variant="amber" isLight={isLight}>支持 Centered 双向填充 / 可直接输入</Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          全面移除刺眼的蓝色高亮。支持常规从左至右填充 (<code className="font-mono text-amber-500">variation="default"</code>) 以及参照中间零点或任意锚点向左/向右双向填充 (<code className="font-mono text-amber-500">variation="centered"</code>)，支持一键重置回基准点与直接内联输入 (<code className="font-mono text-amber-500">editable={'{true}'}</code>)。
        </p>

        {/* Neutral Monochrome Default */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-400">A. 默认从左至右单向填充 (Neutral Mono Scheme):</span>
          <SliderControl
            label="Field of View (FOV)"
            description="调整三维透视相机的视野广角范围（中性黑白无饱和度轨段）"
            value={sliderNeutral}
            min={60}
            max={120}
            step={1}
            unit="°"
            onChange={setSliderNeutral}
            colorScheme="neutral"
            isLight={isLight}
          />
        </div>

        {/* Warm Amber Variant */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <span className="text-xs font-semibold text-neutral-400">B. 暖橙色调方案 (Warm Amber Scheme):</span>
          <SliderControl
            label="Master Volume"
            description="主混音输出增益（柔和暖色轨段）"
            value={sliderAmber}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={setSliderAmber}
            colorScheme="amber"
            isLight={isLight}
          />
        </div>

        {/* Centered / Bipolar Variation (Positive & Negative bi-directional fill from origin) */}
        <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-amber-500">
              C. 中心对称 / 锚点双向填充变体 (Centered / Bipolar Variation):
            </span>
            <Badge size="sm" variant="amber" isLight={isLight}>variation="centered" · 正负双向填充</Badge>
          </div>
          <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            当滑块存在正负值（如 <code className="font-mono">-50 ~ +50</code> 或 <code className="font-mono">-180° ~ +180°</code>）或特定单位基准点（如 <code className="font-mono">100%</code> 标准增益）时，不再呆板地从最左端填充，而是以 <code className="font-mono">origin</code> 为中心向左（负偏移）或向右（正偏移）动态填充，双击轨段或点击零位徽章可瞬间归零：
          </p>

          <SliderControl
            label="Steering Trim (转向平衡微调 · 中心 0 点)"
            description="以中间 0% 为基准点：正值向右填充，负值向左填充，支持正负异色或同色"
            value={sliderCentered}
            min={-50}
            max={50}
            step={1}
            unit="%"
            onChange={setSliderCentered}
            variation="centered"
            origin={0}
            showSign={true}
            colorScheme="neutral"
            isLight={isLight}
          />

          <SliderControl
            label="Boost Pad Symmetry Rotation (加速垫对称旋转角 · 正负异色对比)"
            description="负角度由 0° 向左以天蓝色填充，正角度由 0° 向右以暖橙色填充，支持直接输入精确角度"
            value={sliderTrim}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={setSliderTrim}
            variation="centered"
            origin={0}
            showSign={true}
            colorScheme="amber"
            negativeColorScheme="sky"
            editable={true}
            isLight={isLight}
          />

          <SliderControl
            label="Acoustic Bus Gain (0% ~ 500% 音量矩阵 · 自定义锚点 origin=100%)"
            description="对标 RLCleanWASM Layer 4 高级音频矩阵：以 100% (Unity Gain) 为非居中基准点，低于 100% 向左衰减，高于 100% 向右放大"
            value={sliderUnityGain}
            min={0}
            max={500}
            step={5}
            unit="%"
            onChange={setSliderUnityGain}
            variation="centered"
            origin={100}
            colorScheme="emerald"
            negativeColorScheme="amber"
            editable={true}
            isLight={isLight}
          />
        </div>
      </div>

      {/* 4. Dual-Grabber Slider (Modularized from RLCleanWASM SettingTwoGrabberSliderRow) */}
      <div id="l1-dual-grabber-slider" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm">4. 双滑块中心死区与区间控制器 (DualGrabberSlider)</span>
          <Badge size="sm" variant="amber" isLight={isLight}>RLCleanWASM 模块化提取 / [-α .. +α]</Badge>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          自 <code className="font-mono text-amber-500">RLCleanWASM</code> 的网络输入缓冲死区控制器解耦提取。支持 <strong>中心分域死区模式 (<code className="font-mono">mode="centered-deadband"</code>)</strong>（左滑块限定在 <code className="font-mono">[-α .. 0]</code> 控制 Catch-up 追赶阈值，右滑块限定在 <code className="font-mono">[0 .. +α]</code> 控制 Skip 跳帧阈值，两者可在中心 0 点汇合）与 <strong>自由区间模式 (<code className="font-mono">mode="free-range"</code>)</strong>。
        </p>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-neutral-400">A. 中心死区双向双滑块 (Centered Split-Domain Deadband):</span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="text-neutral-400">Target α:</span>
            {[2, 3, 4, 6].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setBufferTargetAlpha(a);
                  setDeadbandOffsets(([l, r]) => [Math.max(-a, l), Math.min(a, r)]);
                }}
                className={`px-2 py-0.5 rounded border cursor-pointer ${
                  bufferTargetAlpha === a
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
              >
                α={a}
              </button>
            ))}
          </div>
        </div>

        <DualGrabberSlider
          label="Threshold Tolerance Deadband"
          subtitle={`Allowed server input queue jitter around target α (${bufferTargetAlpha}). Catch-up triggers below, step skip triggers above.`}
          target={bufferTargetAlpha}
          value={deadbandOffsets}
          onChange={setDeadbandOffsets}
          mode="centered-deadband"
          colorScheme="amber"
          isLight={isLight}
        />

        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-400">B. 自由双滑块范围选择 (Free-Range Interval Mode):</span>
          <DualGrabberSlider
            label="Collision Impulse Bandpass Filter"
            subtitle="仅触发处于下限与上限冲量区间内的物理碰撞音效"
            min={0}
            max={500}
            step={10}
            unit=" N·s"
            value={freeBand}
            onChange={setFreeBand}
            mode="free-range"
            leftLabel="Min Gate"
            rightLabel="Max Gate"
            colorScheme="emerald"
            isLight={isLight}
          />
        </div>
      </div>

      {/* 5. Precision Digit Picker (Modularized from RLCleanWASM DriftwoodsTunerControls) */}
      <div id="l1-precision-digit-picker" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm">5. 小数点位数步进精度选择器 (PrecisionDigitPicker)</span>
          <Badge size="sm" variant="success" isLight={isLight}>1 . 0 0 0 0 0 精度解耦上下文</Badge>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          自 <code className="font-mono text-emerald-500">RLCleanWASM</code> 的 Driftwoods 球场材质调优器解耦规范化。点击 <code className="font-mono">1 . 0 0 0 0 0</code> 上的任意数位即可切换步进粒度（从 <code className="font-mono">±1.0</code> 直至 <code className="font-mono">±0.00001</code>），配合 <code className="font-mono">TunerPrecisionContext</code> 让子级 <code className="font-mono">SliderControl</code> 支持键盘上下方向键无损小数位微调。
        </p>

        <TunerPrecisionContext.Provider value={{ step: precisionStep, setStep: setPrecisionStep }}>
          <PrecisionDigitPicker
            step={precisionStep}
            onStepChange={setPrecisionStep}
            colorScheme="emerald"
            isLight={isLight}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/50 border-neutral-800'}`}>
              <SliderControl
                label="Ground UV Scale X"
                description="聚焦输入框后按 ↑ / ↓ 键体验当前选中数位步进"
                value={uvScaleX}
                min={0.5}
                max={2.0}
                step={0.0001}
                origin={1.0}
                variation="centered"
                colorScheme="emerald"
                editable={true}
                usePrecisionContext={true}
                onChange={setUvScaleX}
                isLight={isLight}
              />
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/50 border-neutral-800'}`}>
              <SliderControl
                label="Shader Line Smoothness"
                description="支持高达 5 位小数的零截断浮点精度调节"
                value={lineSmoothness}
                min={0.001}
                max={0.15}
                step={0.0001}
                colorScheme="emerald"
                editable={true}
                usePrecisionContext={true}
                onChange={setLineSmoothness}
                isLight={isLight}
              />
            </div>
          </div>
        </TunerPrecisionContext.Provider>
      </div>

      {/* 6. Toggle Switch */}
      <div id="l1-toggle-switch" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">6. 触觉物理开关 (ToggleSwitch)</span>
          <Badge size="sm" variant="success" isLight={isLight}>Apple 绿 / 苹果黑</Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          仿照 Apple HIG 物理开关规范，推荐使用经典的 Apple Green 以及极简高对比度的 Apple Black，彻底避免刺眼的蓝色。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between gap-3">
            <ToggleSwitch
              label="Apple Green (经典绿)"
              description="iOS 标准绿色设计"
              checked={toggleGreen}
              onCheckedChange={setToggleGreen}
              variant="green"
              isLight={isLight}
            />
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between gap-3">
            <ToggleSwitch
              label="Apple Black (极简黑)"
              description="无饱和度中性设计"
              checked={toggleBlack}
              onCheckedChange={setToggleBlack}
              variant="black"
              isLight={isLight}
            />
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between gap-3">
            <ToggleSwitch
              label="Warm Orange (暖橙)"
              description="柔和暖色系变体"
              checked={toggleOrange}
              onCheckedChange={setToggleOrange}
              variant="orange"
              isLight={isLight}
            />
          </div>
        </div>
      </div>

      {/* 7. Checkbox (L1.7) */}
      <div
        id="l1-checkbox"
        className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
          isLight ? 'bg-white border-neutral-200/80 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 font-mono font-bold text-xs">
                L1.7
              </span>
              <h2 className="text-base font-bold">Checkbox (触觉圆角复选框原语)</h2>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              专用于 Camera Settings 等紧凑中轴表单的原子复选框控件，支持多色板、圆角、勾线粗细与左右双侧标签布局。
            </p>
          </div>
          <Badge variant="success" size="sm" isLight={isLight}>
            L1 Primitive
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
            <Checkbox
              label="Invert Swivel (Amber)"
              description="琥珀主色 + 5px Squircle"
              checked={toggleGreen}
              onCheckedChange={setToggleGreen}
              variant="amber"
              isLight={isLight}
            />
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
            <Checkbox
              label="Camera Shake (Neutral)"
              description="无饱和度黑白极简"
              checked={toggleBlack}
              onCheckedChange={setToggleBlack}
              variant="neutral"
              isLight={isLight}
            />
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
            <Checkbox
              label="Right-Aligned Label"
              description="左侧文字右对齐 + 右侧 Checkbox"
              labelPosition="left"
              checked={toggleOrange}
              onCheckedChange={setToggleOrange}
              variant="emerald"
              isLight={isLight}
            />
          </div>
        </div>
      </div>

      {/* Code Snippet for AI Agents */}
      <CodeBlock
        isLight={isLight}
        title="Agent 代码配方 (Tabs, Centered Sliders, Dual-Grabber & Precision Picker)"
        code={`import {
  UnderlineTabs,
  SegmentedSwitch,
  SliderControl,
  DualGrabberSlider,
  PrecisionDigitPicker,
  TunerPrecisionContext,
  ToggleSwitch,
} from '@/primitives';

// 1. 中心对称双向填充滑动条 (支持正负值或自定义 origin 锚点 + 直接输入)
<SliderControl
  label="Steering Trim"
  value={trim} min={-50} max={50} unit="%"
  variation="centered"          // 以 origin 为中心向左(负)/向右(正)双向填充
  origin={0}                    // 缺省默认为 0，也可设为 100 (如 0~500% 音量增益)
  showSign={true}               // 正数显示 '+' 前缀
  negativeColorScheme="sky"     // 可选：负半轴使用独立色彩
  editable={true}               // 可选：开启右侧直接数值输入框
  onChange={setTrim}
  isLight={isLight}
/>

// 2. 双滑块中心死区控制器 ([-α .. +α] 双向独立调节)
<DualGrabberSlider
  label="Threshold Tolerance Deadband"
  target={3}                    // 自动设定 [-3 .. +3] 与中心 0 点锚定
  value={[-2, 2]}               // [Catch-up 负偏移, Skip 正偏移]
  mode="centered-deadband"      // 或 'free-range'
  onChange={setDeadband}
  isLight={isLight}
/>

// 3. 小数点位数步进精度选择器 (1 . 0 0 0 0 0)
<TunerPrecisionContext.Provider value={{ step, setStep }}>
  <PrecisionDigitPicker step={step} onStepChange={setStep} isLight={isLight} />
  <SliderControl
    label="UV Scale X"
    value={scaleX} min={0.5} max={2.0} step={0.0001}
    editable={true} usePrecisionContext={true}
    onChange={setScaleX} isLight={isLight}
  />
</TunerPrecisionContext.Provider>`}
      />
    </div>
  );
};
