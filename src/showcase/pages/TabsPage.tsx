import React, { useState } from 'react';
import { Volume2, Monitor, Gamepad2, Shield, Wrench, Sparkles, Check } from 'lucide-react';
import { UnderlineTabs, TabItem } from '../../primitives/UnderlineTabs';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { ToggleSwitch, ToggleVariant } from '../../primitives/ToggleSwitch';
import { SliderControl } from '../../primitives/SliderControl';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';

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
        <h1 className="text-2xl font-bold tracking-tight">Tabs & Controls 原子控件</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          轻量高阶原子交互控件：暖橙底色下划线、圆角矩形分段控制器（多实例独立隔离/多种宽度分配）、中性无饱和度滑动条、苹果标准设计物理开关。
        </p>
      </div>

      {/* 1. Underline Tabs */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">1. Apple/Linear 风格滑动下划线标签 (UnderlineTabs)</span>
          <Badge size="sm" variant="amber" isLight={isLight}>橙色底线 / 避免蓝色</Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          下划线底色默认采用温暖柔和的暖橙色 (Amber)，并支持通过 React <code className="font-mono text-amber-500">useId()</code> 自动隔离多个并存实例的 layoutId，互不抢占指示器。
        </p>

        {/* Instance A */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-400">实例 A (主设置导航):</span>
          <UnderlineTabs
            items={tabs1}
            activeId={activeTab1}
            onChange={setActiveTab1}
            isLight={isLight}
          />
          <p className="text-xs font-mono text-neutral-400">
            选中项: <span className="text-amber-500 font-bold">{activeTab1}</span>
          </p>
        </div>

        {/* Instance B (Simultaneous coexistence proof) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <span className="text-xs font-semibold text-neutral-400">实例 B (并存子分类，验证多实例互不干扰):</span>
          <UnderlineTabs
            items={tabs2}
            activeId={activeTab2}
            onChange={setActiveTab2}
            isLight={isLight}
          />
          <p className="text-xs font-mono text-neutral-400">
            选中项: <span className="text-amber-500 font-bold">{activeTab2}</span>
          </p>
        </div>
      </div>

      {/* 2. Segmented Switch */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-6 ${
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
          <span className="text-xs font-bold text-neutral-300">特性二：三种宽度分布模式 (Width Distribution Modes)</span>

          {/* Mode A: Left-aligned Auto Content Width */}
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

          {/* Mode B: Equal Distribution (Full Width) */}
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

          {/* Mode C: Proportional Fill Distribution */}
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

          {/* Mode D: Justify (Equal Spacing) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">
                D. 等距分布 / 均匀间距 (<code className="font-mono text-amber-500">distribution="justify"</code>):
              </span>
              <span className="text-[11px] text-neutral-400">无论内容长短，选项之间保持相等的间隔排列</span>
            </div>
            <SegmentedSwitch
              value={switch3}
              onValueChange={setSwitch3}
              isLight={isLight}
              distribution="justify"
              options={[
                { value: 'short', label: '短' },
                { value: 'medium-label', label: '中等长度标签' },
                { value: 'long-label', label: '较长选项 (等距排布)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 3. Slider Control */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">3. 步进滑动微调控制器 (SliderControl)</span>
          <Badge size="sm" variant="neutral" isLight={isLight}>黑白中性 / 无饱和度</Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          全面移除刺眼的蓝色高亮。默认推荐黑白无饱和度（Neutral Mono）方案，中性耐看；亦支持暖橙色调微调。
        </p>

        {/* Neutral Monochrome Default */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-400">默认中性黑白方案 (Neutral Mono Scheme):</span>
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
          <span className="text-xs font-semibold text-neutral-400">可选暖橙色调方案 (Warm Amber Scheme):</span>
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
      </div>

      {/* 4. Toggle Switch */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">4. 触觉物理开关 (ToggleSwitch)</span>
          <Badge size="sm" variant="success" isLight={isLight}>Apple 绿 / 苹果黑</Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          仿照 Apple HIG 物理开关规范，推荐使用经典的 Apple Green 以及极简高对比度的 Apple Black，彻底避免刺眼的蓝色。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Apple Green */}
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

          {/* Apple Black / Neutral */}
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

          {/* Warm Orange */}
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

      {/* Code Snippet for AI Agents */}
      <CodeBlock
        isLight={isLight}
        title="Agent 代码配方 (Tabs & Controls Recipe)"
        code={`import { UnderlineTabs, SegmentedSwitch, SliderControl, ToggleSwitch } from '@/primitives';

// 1. 下划线标签 (默认暖橙色，自动通过 useId 隔离多实例)
<UnderlineTabs
  items={[
    { id: 'video', label: 'Graphics' },
    { id: 'audio', label: 'Audio' }
  ]}
  activeId={activeTab}
  onChange={setActiveTab}
  indicatorColor="bg-amber-500"
  isLight={isLight}
/>

// 2. 分段控制器 (圆角矩形，支持多实例独立共存、等距均分 / 比例自适应)
<SegmentedSwitch
  value={mode}
  onValueChange={setMode}
  distribution="equal" // 'auto' | 'equal' | 'proportional'
  radius="md" // 圆角矩形，绝非胶囊形状
  options={[{ value: 'quality', label: 'Quality' }, { value: 'perf', label: 'Performance' }]}
  isLight={isLight}
/>

// 3. 滑动条 (默认推荐 neutral 中性黑白无饱和度方案，避免蓝色)
<SliderControl
  label="Camera FOV"
  value={fov} min={60} max={120} unit="°"
  colorScheme="neutral" // 'neutral' | 'amber' | 'orange'
  onChange={setFov}
  isLight={isLight}
/>

// 4. 触觉物理开关 (仿 Apple 设计：绿色或黑色，避免蓝色)
<ToggleSwitch
  label="Particle Effects"
  checked={enabled}
  variant="green" // 'green' | 'black' | 'orange' | 'amber'
  onCheckedChange={setEnabled}
  isLight={isLight}
/>`}
      />
    </div>
  );
};
