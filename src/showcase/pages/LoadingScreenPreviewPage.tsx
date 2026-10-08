import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  DownloadCloud,
  Cpu,
  Layers,
  Ruler,
  Check,
  ShieldAlert,
  Sun,
  Moon,
  Sparkles,
  Sliders
} from 'lucide-react';
import {
  LoadingStep,
  LoadingError,
  DualProgressBar,
  LoadingScreen,
  calculateOverallProgress,
  formatBytes,
  formatSpeed
} from '../../loading';
import { GameViewport } from '../../viewport/GameViewport';
import { SliderControl } from '../../primitives/SliderControl';

export interface LoadingScreenPreviewPageProps {
  isLight?: boolean;
}

const INITIAL_STEPS: LoadingStep[] = [
  {
    id: 'wasm-init',
    title: 'Initializing WebAssembly SIMD Engine',
    category: 'Runtime Core',
    type: 'indeterminate',
    status: 'completed',
    indeterminateHint: 'Compiling 128-bit SIMD bytecode · Thread pool spawned (4 workers)',
  },
  {
    id: 'phys-alloc',
    title: 'Allocating Shared Physics Memory Ring',
    category: 'Physics & State',
    type: 'determinate',
    status: 'completed',
    progressPct: 100,
    bytesLoaded: 33554432, // 32 MB
    bytesTotal: 33554432,
    speedBps: 120000000,
  },
  {
    id: 'arena-download',
    title: 'Downloading Champions Field Geometry & High-Res Textures',
    category: 'Asset Pipeline',
    type: 'determinate',
    status: 'active',
    progressPct: 68,
    bytesLoaded: 149520000, // ~142.6 MB
    bytesTotal: 220200960,  // ~210 MB
    speedBps: 29800000,     // ~28.4 MB/s
    timeRemainingSec: 2.4,
  },
  {
    id: 'shader-compile',
    title: 'Compiling WebGPU PBR Uber-Shaders',
    category: 'Graphics Pipeline',
    type: 'indeterminate',
    status: 'pending',
    indeterminateHint: 'Warming graphics pipeline cache (18/64 variants) · WebGPU active, not frozen',
  },
  {
    id: 'soundbank-load',
    title: 'Decompressing Spatial Audio Soundbanks',
    category: 'Audio Engine',
    type: 'determinate',
    status: 'pending',
    progressPct: 0,
    bytesLoaded: 0,
    bytesTotal: 58720256, // ~56 MB
    speedBps: 18500000,
  },
  {
    id: 'match-handshake',
    title: 'Establishing Sub-Tick Server Handshake',
    category: 'Network Protocol',
    type: 'indeterminate',
    status: 'pending',
    indeterminateHint: 'Negotiating 120Hz sub-tick synchronizer · Session handshake verified',
  },
];

export const LoadingScreenPreviewPage: React.FC<LoadingScreenPreviewPageProps> = ({
  isLight = false,
}) => {
  const [steps, setSteps] = useState<LoadingStep[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(2); // Start on downloading arena
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [error, setError] = useState<LoadingError | null>(null);
  const [stageIsLight, setStageIsLight] = useState<boolean>(isLight);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync stage theme when global isLight changes
  useEffect(() => {
    setStageIsLight(isLight);
  }, [isLight]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2400);
  };

  // Compute overall progress percentage cleanly using decoupled loading engine helper
  const overallProgressPct = calculateOverallProgress(steps, currentStepIndex);
  const currentStep = steps[currentStepIndex] || steps[0];

  // Adjust a specific determinate step's progress percentage (0 - 100) via slider
  const handleStepProgressChange = (stepIdx: number, newPct: number) => {
    // If running, pause auto-timer so user has full slider control
    if (isRunning) setIsRunning(false);

    setSteps((prev) =>
      prev.map((s, idx) => {
        if (idx !== stepIdx) return s;
        const total = s.bytesTotal || 100;
        const loaded = (newPct / 100) * total;
        const isDone = newPct >= 100;
        return {
          ...s,
          progressPct: newPct,
          bytesLoaded: loaded,
          status: isDone ? 'completed' : idx === currentStepIndex ? 'active' : s.status,
          timeRemainingSec: isDone ? 0 : Math.max(0.5, ((total - loaded) / (s.speedBps || 25000000))),
        };
      })
    );
  };

  // Simulation tick loop
  useEffect(() => {
    if (!isRunning || error) return;

    const interval = window.setInterval(() => {
      setSteps((prevSteps) => {
        const nextSteps = [...prevSteps];
        const step = nextSteps[currentStepIndex];
        if (!step) return prevSteps;

        if (step.type === 'determinate') {
          const total = step.bytesTotal || 100;
          const loaded = (step.bytesLoaded || 0) + (total * 0.03 * simSpeed);
          const newPct = Math.min(100, (loaded / total) * 100);
          const remainingSec = Math.max(0, ((total - loaded) / (step.speedBps || 25000000)));

          if (newPct >= 100) {
            // Step complete!
            nextSteps[currentStepIndex] = {
              ...step,
              status: 'completed',
              progressPct: 100,
              bytesLoaded: total,
              timeRemainingSec: 0,
            };

            // Advance to next step
            if (currentStepIndex < nextSteps.length - 1) {
              const nextIdx = currentStepIndex + 1;
              setCurrentStepIndex(nextIdx);
              nextSteps[nextIdx] = {
                ...nextSteps[nextIdx],
                status: 'active',
              };
            } else {
              setIsRunning(false);
              showToast('✓ 加载管线全部完成 (All Steps Complete!)');
            }
          } else {
            nextSteps[currentStepIndex] = {
              ...step,
              status: 'active',
              progressPct: newPct,
              bytesLoaded: loaded,
              timeRemainingSec: remainingSec,
            };
          }
        } else {
          // Indeterminate step: simulate active wait time without erratic jumping
          const waitCounter = (step as any)._waitCount || 0;
          if (waitCounter > 25 / simSpeed) {
            // Complete indeterminate step
            nextSteps[currentStepIndex] = {
              ...step,
              status: 'completed',
            };
            if (currentStepIndex < nextSteps.length - 1) {
              const nextIdx = currentStepIndex + 1;
              setCurrentStepIndex(nextIdx);
              nextSteps[nextIdx] = {
                ...nextSteps[nextIdx],
                status: 'active',
              };
            } else {
              setIsRunning(false);
              showToast('✓ 加载管线全部完成 (All Steps Complete!)');
            }
          } else {
            (nextSteps[currentStepIndex] as any)._waitCount = waitCounter + 1;
          }
        }

        return nextSteps;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, error, currentStepIndex, simSpeed, steps.length]);

  // Trigger error simulation
  const triggerSimulatedError = () => {
    setIsRunning(false);
    const activeStep = steps[currentStepIndex] || steps[0];
    const newError: LoadingError = {
      code: 'ERR_SHADER_COMPILATION',
      title: 'Failed to Compile WebGPU PBR Uber-Shaders',
      message:
        'ShaderCompilationError: Syntax error parsing shader module "arena_turf.wgsl" at line 42, col 15: unexpected token "vec3_unorm". Pipeline creation aborted.',
      stepId: activeStep.id,
      technicalDetails: `Error 0x80041002 (WGSL_PARSE_ERROR)\n  --> arena_turf.wgsl:42:15\n   |\n42 | let ambient: vec3_unorm = compute_sky_irradiance();\n   |              ^^^^^^^^^ unknown type\n   at WebGpuBackend.compileModule (wasm_glue.js:148)`,
      retryable: true,
      timestamp: Date.now(),
    };
    setError(newError);

    // Set active step to error
    setSteps((prev) =>
      prev.map((s, idx) => (idx === currentStepIndex ? { ...s, status: 'error' } : s))
    );
    showToast('🚨 已模拟触发错误 (Throw Error Active)');
  };

  // Recover from error
  const handleRecoverError = () => {
    setError(null);
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === currentStepIndex
          ? {
              ...s,
              status: 'active',
              errorDetails: undefined,
            }
          : s
      )
    );
    setIsRunning(true);
    showToast('✓ 已清除错误并恢复加载管线');
  };

  // Reset to beginning
  const handleReset = () => {
    setIsRunning(false);
    setError(null);
    setCurrentStepIndex(0);
    setSteps(
      INITIAL_STEPS.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'active' : 'pending',
        progressPct: 0,
        bytesLoaded: 0,
      }))
    );
    showToast('已重置加载流程 (Pipeline Reset)');
  };

  // Jump to specific step
  const jumpToStep = (index: number) => {
    setError(null);
    setCurrentStepIndex(index);
    setSteps((prev) =>
      prev.map((s, idx) => ({
        ...s,
        status: idx < index ? 'completed' : idx === index ? 'active' : 'pending',
        progressPct: idx < index ? 100 : idx === index ? s.progressPct || 40 : 0,
        bytesLoaded: idx < index ? s.bytesTotal : idx === index ? (s.bytesTotal ? s.bytesTotal * 0.4 : 0) : 0,
      }))
    );
    showToast(`跳转至步骤 ${index + 1}: ${steps[index]?.title}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Loader2 className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Loading 加载界面与双层进度条</h1>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              双层分步推进 · 确定态下载与不确定态编译 (Apple 极简设计) · 异常熔断响应
            </span>
          </div>
        </div>

        {/* Right Controls: Telemetry Export */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <button
            type="button"
            onClick={async () => {
              const stage = document.getElementById('loading-viewport-stage');
              if (!stage) return;
              const winW = window.innerWidth;
              const winH = window.innerHeight;
              const progressBar = stage.querySelector<HTMLElement>('[data-ui-element="dual-progress-bar"]');

              const getRectStr = (r: DOMRect) =>
                `${Math.round(r.width * 10) / 10}px × ${Math.round(r.height * 10) / 10}px (x: ${Math.round(r.x)}, y: ${Math.round(r.y)})`;

              const lines: string[] = [];
              lines.push('========================================================================');
              lines.push(' [LOADING SCREEN DUAL PROGRESS TELEMETRY SNAPSHOT]');
              lines.push('========================================================================');
              lines.push(`• Window Viewport:      ${winW}px × ${winH}px`);
              if (progressBar) lines.push(`• Dual Progress Bar:    ${getRectStr(progressBar.getBoundingClientRect())}`);
              lines.push(`• Active Step Index:    ${currentStepIndex + 1} of ${steps.length}`);
              lines.push(`• Active Step Title:    ${steps[currentStepIndex]?.title}`);
              lines.push(`• Active Step Type:     ${steps[currentStepIndex]?.type}`);
              lines.push(`• Overall Progress:     ${Math.round(overallProgressPct)}%`);
              lines.push(`• Pipeline Has Error:   ${!!error}`);
              lines.push('========================================================================\n');

              const report = lines.join('\n');
              console.log(report);
              if (navigator.clipboard?.writeText) {
                try {
                  await navigator.clipboard.writeText(report);
                  showToast('✓ 加载层遥测数据已输出至控制台并复制到剪贴板');
                } catch (_) {
                  showToast('✓ 加载层遥测数据已输出至控制台');
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-medium transition-all active:scale-95 cursor-pointer bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 shadow-2xs"
            title="打印并复制当前 Loading 界面的布局与状态数据"
          >
            <Ruler className="h-3.5 w-3.5 text-sky-500" />
            <span>导出加载层遥测数据</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Pipeline Control Simulator (外部模拟控制器) */}
      <div
        className={`p-4 rounded-2xl border flex flex-col gap-3 transition-colors shadow-2xs ${
          isLight ? 'bg-white border-neutral-200/90 text-neutral-800' : 'bg-neutral-900/70 border-neutral-800 text-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Sparkles className="h-4 w-4 text-sky-500" />
            <span>加载管线交互控制器 (Pipeline Simulation Controls)</span>
          </div>

          {feedbackToast && (
            <span className="text-sky-500 font-mono font-bold flex items-center gap-1">
              <Check className="h-3 w-3" />
              {feedbackToast}
            </span>
          )}
        </div>

        {/* Primary action buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-xs ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>暂停模拟 (Pause)</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>启动自动模拟 (Start Pipeline)</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-colors cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>重置流程 (Reset)</span>
          </button>

          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

          {/* Simulate Throw Error Button */}
          <button
            type="button"
            onClick={triggerSimulatedError}
            disabled={!!error}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-xs ${
              error
                ? 'bg-red-950/40 text-red-400 border border-red-800/40 opacity-50 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white active:scale-95 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>🚨 抛出异常 (Throw Error)</span>
          </button>

          {/* Clear & Recover Error Button */}
          {error && (
            <button
              type="button"
              onClick={handleRecoverError}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>恢复并继续 (Recover & Resume)</span>
            </button>
          )}

          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

          {/* Speed Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 font-mono">
            <span className="text-[11px] px-1 text-neutral-500">倍速:</span>
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSimSpeed(s)}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  simSpeed === s
                    ? 'bg-sky-500 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Stage theme override */}
          <button
            type="button"
            onClick={() => setStageIsLight(!stageIsLight)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-colors cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 ml-auto"
            title="独立切换加载舞台的亮暗色调"
          >
            {stageIsLight ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-sky-400" />}
            <span>舞台主题: {stageIsLight ? '亮色 (Light)' : '暗色 (Dark)'}</span>
          </button>
        </div>

        {/* Dedicated Active Step Determinate Progress Slider (用户可直接滑动 0% ~ 100%) */}
        {currentStep.type === 'determinate' && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5" />
                <span>当前确定性步骤实时预览滑动条 (Adjust 0% ~ 100%)</span>
              </span>
              <span className="font-bold tabular-nums text-neutral-700 dark:text-neutral-300">
                {Math.round(currentStep.progressPct || 0)}%
              </span>
            </div>
            <SliderControl
              label={`当前步骤: ${currentStep.title}`}
              value={Math.round(currentStep.progressPct || 0)}
              min={0}
              max={100}
              step={1}
              unit="%"
              colorScheme="amber"
              isLight={isLight}
              onChange={(val) => handleStepProgressChange(currentStepIndex, val)}
            />
          </div>
        )}

        {/* Step Jumpers (快速跳转步骤) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/80 dark:border-neutral-800 text-xs">
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mr-1">跳转步骤:</span>
          {steps.map((st, idx) => (
            <button
              key={st.id}
              type="button"
              onClick={() => jumpToStep(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all cursor-pointer ${
                currentStepIndex === idx
                  ? 'bg-sky-500 text-white font-bold border-sky-400 shadow-xs'
                  : st.status === 'completed'
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                  : isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
                  : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
              }`}
            >
              <span>{idx + 1}.</span>
              <span className="truncate max-w-[120px]">{st.title.split(' ')[0]}</span>
              {st.type === 'determinate' ? (
                <span className="text-[9px] opacity-75 font-sans">(确定)</span>
              ) : (
                <span className="text-[9px] opacity-75 font-sans">(不确定)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Live 18:9 Canvas Simulation Stage (加载视口舞台) */}
      <div
        id="loading-viewport-stage"
        className="relative w-full h-[520px] md:h-[580px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300"
      >
        <GameViewport isLight={stageIsLight} className="w-full h-full">
          <LoadingScreen
            steps={steps}
            currentStepIndex={currentStepIndex}
            overallProgressPct={overallProgressPct}
            error={error}
            isLight={stageIsLight}
            appTitle="RLCleanWASM"
            appSubtitle="UIStorybook Simulation Environment"
            onRetry={handleRecoverError}
            onReset={handleReset}
          />
        </GameViewport>
      </div>

      {/* 4. Deep Pipeline Step Inspector (步骤指标与每个确定性步骤的滑动条) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400 px-1">
          <span>每个确定性阶段微调滑动条与详细指标 (Determinate Steps Sliders & Diagnostics)</span>
          <span>共 {steps.length} 阶段</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((st, idx) => {
            const isActive = idx === currentStepIndex;
            const isDone = st.status === 'completed';
            const isErr = st.status === 'error';

            return (
              <div
                key={st.id}
                className={`p-4 rounded-2xl border transition-all shadow-2xs flex flex-col justify-between gap-3 ${
                  isErr
                    ? 'bg-red-500/10 border-red-500/50 text-red-400'
                    : isActive
                    ? isLight
                      ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20'
                      : 'bg-sky-950/30 border-sky-500/60 ring-2 ring-sky-500/20'
                    : isLight
                    ? 'bg-white border-neutral-200/90 hover:border-neutral-300'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-neutral-500 dark:text-neutral-400">
                      STAGE 0{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => jumpToStep(idx)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isErr
                          ? 'bg-red-500 text-white'
                          : isActive
                          ? 'bg-sky-500 text-white'
                          : isDone
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      {isActive ? 'Active' : isDone ? 'Done · Jump' : 'Pending'}
                    </button>
                  </div>

                  <h4 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                    {st.title}
                  </h4>

                  <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    {st.category}
                  </span>
                </div>

                {/* Step Slider for Determinate steps */}
                {st.type === 'determinate' ? (
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex flex-col gap-1">
                    <SliderControl
                      label={`进度调节 (0% ~ 100%)`}
                      value={Math.round(st.progressPct || 0)}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      colorScheme="amber"
                      isLight={isLight}
                      onChange={(val) => handleStepProgressChange(idx, val)}
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-0.5">
                      <span>已下载: {formatBytes(st.bytesLoaded)}</span>
                      <span>总量: {formatBytes(st.bytesTotal)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs font-mono flex items-center justify-between text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-purple-400" />
                      <span>不确定态 (Indeterminate)</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-500">Shimmer Wave</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
