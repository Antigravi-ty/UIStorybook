import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Sparkles, MoveRight, RefreshCw, Layers, Clock, Zap } from 'lucide-react';
import { UI_EASING, ContainerTransitionMode } from '../../tokens/easing';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { HStack } from '../../layout/HStack';
import { SequencedContainer, TransitionPhase } from '../../navigation/transitions';
import { CodeBlock } from '../CodeBlock';

export const AnimationPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [motionPreset, setMotionPreset] = useState<'tactile' | 'bouncy' | 'smooth'>('tactile');
  const [expanded, setExpanded] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  // Container Transition Playground States
  const [containerMode, setContainerMode] = useState<ContainerTransitionMode>('fluid-morph');
  const [containerView, setContainerView] = useState<'compact' | 'expanded'>('compact');
  const [activePhase, setActivePhase] = useState<TransitionPhase>('idle');
  const [fluidDuration, setFluidDuration] = useState<number>(0.28);
  const [stepFadeDuration, setStepFadeDuration] = useState<number>(0.10);
  const [stepResizeDuration, setStepResizeDuration] = useState<number>(0.15);

  const springs = {
    tactile: UI_EASING.spring.tactile,
    bouncy: UI_EASING.spring.bouncy,
    smooth: UI_EASING.spring.smooth,
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Animation & Motion 动效规范</h1>
        <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          基于 Apple Human Interface Guidelines 与 Framer Motion 物理系统。规范化弹窗容器过渡（<strong>FluidMorphTransition</strong> 与 <strong>SequencedStepTransition</strong>）及触觉微交互（Tactile Micro-interactions）。底层已彻底统一为解耦的 <strong>MorphContainer</strong> 引擎，实现全局“指哪儿打哪儿”。
        </p>
      </div>

      {/* 1. Container Transition Standards Comparison (New Feature) */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Layers className="h-4 w-4 text-amber-500" />
            <span>1. 统一容器过渡引擎对比 (Unified MorphContainer Standards)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContainerMode('fluid-morph')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                containerMode === 'fluid-morph'
                  ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
              }`}
            >
              FluidMorphTransition
            </button>
            <button
              type="button"
              onClick={() => setContainerMode('sequenced-step')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                containerMode === 'sequenced-step'
                  ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
              }`}
            >
              SequencedStepTransition
            </button>
          </div>
        </div>

        {/* Transition Mode Specification Pill */}
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
            isLight ? 'bg-neutral-50/90 border-neutral-200 text-neutral-700' : 'bg-neutral-950/40 border-neutral-800 text-neutral-300'
          }`}
        >
          <div>
            <span className="font-bold text-amber-500">
              {containerMode === 'fluid-morph' ? 'FluidMorphTransition' : 'SequencedStepTransition'}
            </span>
            <span className="ml-2 text-neutral-500">
              {containerMode === 'fluid-morph'
                ? `Apple Ease ${fluidDuration}s 流体连续形变 (单时间参数驱动)`
                : `${Math.round(stepFadeDuration * 1000)}ms Fade-out → ${Math.round(stepResizeDuration * 1000)}ms Container Resize → ${Math.round(stepFadeDuration * 1000)}ms Reveal Fade-in (Apple Ease)`}
            </span>
          </div>

          <Badge variant="primary" size="sm" isLight={isLight}>
            Curve: Apple HIG [0.2, 0.8, 0.25, 1]
          </Badge>
        </div>

        {/* Realtime Parameter Tuning Strip */}
        <div
          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isLight ? 'bg-neutral-100/60 border-neutral-200' : 'bg-neutral-950/20 border-neutral-800'
          }`}
        >
          {containerMode === 'fluid-morph' ? (
            <div className="flex items-center gap-3 w-full justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Fluid Duration (单时间参数):</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0.18, 0.28, 0.45].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFluidDuration(d)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer border transition-colors ${
                      fluidDuration === d
                        ? 'bg-amber-500 text-white border-amber-500 font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {d}s {d === 0.28 && '(Default)'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-neutral-500">Fade Duration:</span>
                {[0.08, 0.10, 0.15].map((fd) => (
                  <button
                    key={fd}
                    type="button"
                    onClick={() => setStepFadeDuration(fd)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer border transition-colors ${
                      stepFadeDuration === fd
                        ? 'bg-amber-500 text-white border-amber-500 font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {Math.round(fd * 1000)}ms
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-neutral-500">Resize Duration:</span>
                {[0.10, 0.15, 0.25].map((rd) => (
                  <button
                    key={rd}
                    type="button"
                    onClick={() => setStepResizeDuration(rd)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer border transition-colors ${
                      stepResizeDuration === rd
                        ? 'bg-amber-500 text-white border-amber-500 font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {Math.round(rd * 1000)}ms
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3-Stage Timeline Indicator for SequencedStepTransition */}
        {containerMode === 'sequenced-step' && (
          <div className="flex flex-col gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              时序阶段监测条 (Live Stage Telemetry):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`p-2 rounded-lg border text-center transition-all ${
                  activePhase === 'fadeOut'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md font-bold scale-[1.02]'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-[10px] font-mono opacity-80">PHASE 1 ({Math.round(stepFadeDuration * 1000)}ms)</div>
                <div className="text-xs font-semibold">Fade Out (透明度 100% → 0%)</div>
              </div>

              <div
                className={`p-2 rounded-lg border text-center transition-all ${
                  activePhase === 'resize'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md font-bold scale-[1.02]'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-[10px] font-mono opacity-80">PHASE 2 ({Math.round(stepResizeDuration * 1000)}ms)</div>
                <div className="text-xs font-semibold">Resize (内容隐藏，容器平滑形变)</div>
              </div>

              <div
                className={`p-2 rounded-lg border text-center transition-all ${
                  activePhase === 'fadeIn'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md font-bold scale-[1.02]'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-[10px] font-mono opacity-80">PHASE 3 ({Math.round(stepFadeDuration * 1000)}ms)</div>
                <div className="text-xs font-semibold">Fade In (透明度 0% → 100%)</div>
              </div>
            </div>
          </div>
        )}

        {/* Live Container Trigger */}
        <div
          className={`p-8 rounded-xl border flex flex-col items-center justify-center min-h-[220px] transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <SequencedContainer
            currentKey={containerView}
            width={containerView === 'compact' ? 320 : 520}
            mode={containerMode}
            fluidDuration={fluidDuration}
            stepFadeDuration={stepFadeDuration}
            stepResizeDuration={stepResizeDuration}
            onPhaseChange={setActivePhase}
            className="p-5 rounded-2xl border shadow-lg overflow-hidden bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
          >
            {containerView === 'compact' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Compact Panel (320px)</span>
                  <Badge variant="primary" size="sm" isLight={isLight}>
                    Stage A
                  </Badge>
                </div>
                <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  紧凑状态：用于一级快捷菜单或摘要卡片。
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setContainerView('expanded')}
                  isLight={isLight}
                  icon={<MoveRight className="h-3.5 w-3.5" />}
                >
                  触发切换至展开面板
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Expanded Panel (520px)</span>
                  <Badge variant="success" size="sm" isLight={isLight}>
                    Stage B
                  </Badge>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  展开状态：用于二级车库/设置复杂表单。在 SequencedStepTransition 模式下经历 100ms 淡出 → 150ms 容器宽度过渡 → 100ms 显现淡入。
                </p>
                <HStack gap="sm">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setContainerView('compact')}
                    isLight={isLight}
                  >
                    返回紧凑面板
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setContainerView('compact');
                      setTimeout(() => setContainerView('expanded'), 400);
                    }}
                    isLight={isLight}
                    icon={<RefreshCw className="h-3.5 w-3.5" />}
                  >
                    重播过渡
                  </Button>
                </HStack>
              </div>
            )}
          </SequencedContainer>
        </div>
      </div>

      {/* 2. Tactile Touch Feedback (Preserved and Refined) */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span>2. 触感微交互 (Tactile Micro-interactions)</span>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          点击下方按钮或触发键位体验毫秒级触觉反馈（active:scale-[0.98] 与无阴影扁平高亮，物理弹簧阻尼）：
        </p>

        <HStack gap="md" wrap>
          <Button
            variant="primary"
            shortcut="ENTER"
            isLight={isLight}
            onClick={() => setPulseCount((c) => c + 1)}
          >
            Tactile Press ({pulseCount})
          </Button>

          <Button
            variant="secondary"
            shortcut="SPACE"
            isLight={isLight}
            onClick={() => setPulseCount(0)}
          >
            Reset
          </Button>
        </HStack>
      </div>

      {/* 3. Interactive Spring Physics Playground */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Activity className="h-4 w-4 text-amber-500" />
            <span>3. 物理弹簧参数实验场 (Spring Physics)</span>
          </div>

          <div className="flex items-center gap-2">
            {(['tactile', 'bouncy', 'smooth'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setMotionPreset(p)}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer border ${
                  motionPreset === p
                    ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          当前弹簧配置：
          <span className="font-mono text-amber-500 font-semibold ml-1">
            stiffness: {springs[motionPreset].stiffness}, damping: {springs[motionPreset].damping}
          </span>
        </p>

        {/* Live Morphing Box */}
        <div
          className={`p-8 rounded-xl border flex flex-col items-center justify-center min-h-[200px] transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <motion.div
            layout
            transition={springs[motionPreset]}
            onClick={() => setExpanded((prev) => !prev)}
            className={`p-5 rounded-2xl border cursor-pointer select-none flex flex-col justify-between shadow-lg overflow-hidden ${
              expanded
                ? isLight
                  ? 'w-full max-w-[480px] bg-amber-500 text-white border-amber-400'
                  : 'w-full max-w-[480px] bg-amber-600 text-white border-amber-500'
                : isLight
                ? 'w-64 bg-white text-neutral-900 border-neutral-300 shadow-md'
                : 'w-64 bg-neutral-900 text-neutral-100 border-neutral-700 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm tracking-tight">
                {expanded ? 'Expanded Surface' : 'Compact Surface'}
              </span>
              <Badge
                size="sm"
                variant={expanded ? 'default' : 'primary'}
                isLight={!expanded && isLight}
              >
                {motionPreset.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs opacity-90 leading-relaxed mb-3">
              {expanded
                ? '尺寸自适应平滑插值（FLIP Layout Morphing）。无强制重排振颤，自然流畅契合物理阻尼。'
                : '点击展开查看流体形变'}
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
              <span>Width: {expanded ? '480px' : '256px'}</span>
              <span>Click to toggle</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Code Snippet */}
      <CodeBlock
        isLight={isLight}
        title="Agent 动效与容器过渡统一调用配方 (MorphContainer Architecture)"
        code={`import { MorphContainer, MorphingShell } from '@/navigation';
import { UI_EASING } from '@/tokens/easing';

// 1. 标准流体连续形变 (FluidMorphTransition)
// 单时间参数驱动 (fluidDuration=0.28s)，Apple HIG 阻尼曲线内置，无阻塞 exit wait
<MorphContainer
  currentKey={route}
  width={targetWidth}
  mode="fluid-morph"
  fluidDuration={0.28}
>
  <RouteContent />
</MorphContainer>

// 2. 标准三段时序分步过渡 (SequencedStepTransition)
// 传入淡出淡入时间 (fadeDuration) 与尺寸变化时间 (resizeDuration)
<MorphContainer
  currentKey={route}
  width={targetWidth}
  mode="sequenced-step"
  stepFadeDuration={0.10}    // 100ms fadeOut & fadeIn
  stepResizeDuration={0.15}  // 150ms container resize
>
  <RouteContent />
</MorphContainer>

// 3. 模态外壳统一调用 (MorphingShell 纯净模态层，底层复用同一容器引擎)
<MorphingShell
  open={isOpen}
  onOpenChange={setIsOpen}
  currentKey={currentRoute}
  width={routeWidthMap[currentRoute]}
  transitionMode="fluid-morph" // 或 'sequenced-step'
>
  {currentRoute === 'main' ? <Layer1MainMenuRecipe /> : <Layer2GarageRecipe />}
</MorphingShell>`}
      />
    </div>
  );
};
