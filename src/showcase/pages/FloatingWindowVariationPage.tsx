import React, { useRef, useEffect } from 'react';
import {
  Sparkles, AppWindow, LayoutTemplate, RotateCcw,
  Copy, Check, Code2, Eye,
  Layers, CheckCircle2, Terminal, User,
} from 'lucide-react';
import { useFloatingStore } from '../../tokens/floatingStore';
import { USER_PRESET_WINDOWS, DEV_PRESET_WINDOWS, PRESET_WINDOWS, type PresetConfig } from '../../tokens/floatingPresets';
import { createScopedSyncedState } from '../stores/crossClientSync';
import {
  floatingThreeStageSandboxStore, useFloatingThreeStageStore, FLOATING_THREE_STAGE_PRESETS,
} from '../stores/floatingThreeStageStore';
import { FloatingThreeStageWindowManager } from '../components/FloatingThreeStageWindow';
import { FloatingStackIcon } from '../../navigation/FloatingStackIcon';
import { FloatingWindowIcon } from '../../navigation/FloatingWindowIcon';
import { renderFloatingWindowPanel } from '../../panels';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { CodeBlock } from '../CodeBlock';
import { PageJumpDirectory, type JumpDirectoryItem } from '../PageJumpDirectory';
import {
  PROBE_WINDOW_ID, ThreeStageCapabilityProbeContent,
} from './floating-window-variation/ThreeStageCapabilityProbeContent';
import {
  FloatingWindowCornerDraggerStrip, FloatingWindowCapabilityMatrixSection, FloatingWindowShootoutSection,
} from './floating-window-variation/FloatingWindowCapabilityMatrixAndShootout';
import { FloatingWindowParameterTunerSection } from './floating-window-variation/FloatingWindowParameterTunerSection';

const useState = createScopedSyncedState('page:floating-window-3stage-v1');

export interface FloatingWindowVariationPageProps {
  isLight?: boolean;
}

const JUMP_ITEMS: JumpDirectoryItem[] = [
  {
    code: '6D+.1',
    componentName: 'FloatingThreeStageCanvasStage',
    label: '3-Stage 悬浮窗实时交互画布 (支持 Footer 悬停联动、多种 Resize 热区与 25 个真实浮窗切换)',
    targetId: 'fw-3stage-6d-1-stage',
    tag: 'L4/L6 · Live Stage',
  },
  {
    code: '6D+.2',
    componentName: 'FloatingThreeStageCompatibilityMatrix',
    label: '支持度与适配验证矩阵 (Footer / Resize 冲突消解 / Left Back / Sizing 逐项实测)',
    targetId: 'fw-3stage-6d-2-matrix',
    tag: 'Capability Audit',
  },
  {
    code: '6D+.3',
    componentName: 'FloatingThreeStageParameterTuner',
    label: '3-Stage 悬浮窗全参数调优台 (Stage 1 顶栏 / Stage 2 内容 / Stage 3 底栏 / Resize 物理)',
    targetId: 'fw-3stage-6d-3-tuner',
    tag: 'L0–L6 · Tuner',
  },
  {
    code: '6D+.4',
    componentName: 'FloatingThreeStageTriadShootout',
    label: '三种悬浮窗壳体结构同屏对照 (现行 6D Baseline vs 2-Stage L2 Header vs 3-Stage Full Combiner)',
    targetId: 'fw-3stage-6d-4-shootout',
    tag: 'Anatomy Shootout',
  },
];

export const FloatingWindowVariationPage: React.FC<FloatingWindowVariationPageProps> = ({
  isLight = true,
}) => {
  const config = useFloatingThreeStageStore();
  const { setParam, applyPreset, resetConfig, exportConfigCode } = config;

  const {
    windows,
    minimizedCount,
    totalCount,
    opacity,
    setOpacity,
    clearAll,
    updateSize,
  } = useFloatingStore(floatingThreeStageSandboxStore);

  const [payloadSource, setPayloadSource] = useState<'probe' | 'user' | 'developer'>(
    'probe',
    'payloadSource'
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    USER_PRESET_WINDOWS[0].id,
    'selectedPresetId'
  );
  const [stageMode, setStageMode] = useState<'single' | 'stack'>('single', 'stageMode');
  const [copiedCode, setCopiedCode] = useState(false, 'copiedCode');
  const [showCodeBlock, setShowCodeBlock] = useState(false, 'showCodeBlock');

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const activePresetList =
    payloadSource === 'user' ? USER_PRESET_WINDOWS : DEV_PRESET_WINDOWS;
  const activeRealPreset: PresetConfig =
    activePresetList.find((p) => p.id === selectedPresetId) || activePresetList[0];

  // Keep the active test window spawned in 'single' mode
  useEffect(() => {
    if (stageMode !== 'single') return;
    floatingThreeStageSandboxStore.clearAll();
    if (payloadSource === 'probe') {
      floatingThreeStageSandboxStore.spawnWindow({
        id: PROBE_WINDOW_ID,
        title: '3-STAGE FLOATING PROBE',
        subtitle:
          'Stage 3 Footer: Idle muted gray · Hover any control or header button for high-contrast help.',
        category: 'tuning',
        width: 500,
        height: 370,
        position: { x: 48, y: 44 },
        resizable: true,
        singleton: true,
        startMinimized: false,
      });
    } else if (activeRealPreset) {
      floatingThreeStageSandboxStore.spawnWindow({
        id: activeRealPreset.id,
        title: activeRealPreset.title,
        subtitle:
          activeRealPreset.summary ||
          `Triggered via ${activeRealPreset.menuEntryPath || 'Floating Window Registry'}`,
        category: activeRealPreset.category,
        width: activeRealPreset.width,
        height: activeRealPreset.height,
        position: { x: 48, y: 44 },
        resizable: activeRealPreset.resizable,
        singleton: true,
        startMinimized: false,
      });
    }
  }, [stageMode, payloadSource, activeRealPreset?.id]);

  const handleCopyCode = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResizeActiveWindow = (w: number, h: number) => {
    const firstVisible = windows.find((win) => !win.isMinimized) || windows[0];
    if (!firstVisible) return;
    updateSize(firstVisible.id, { width: w, height: h });
  };

  const handleSpawnExtraStackWindow = (preset: PresetConfig) => {
    floatingThreeStageSandboxStore.spawnWindow({
      id: preset.id,
      title: preset.title,
      subtitle: preset.summary,
      category: preset.category,
      width: preset.width,
      height: preset.height,
      resizable: preset.resizable,
      singleton: true,
      startMinimized: false,
    });
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      {/* ════════════════════════════════════════════════════════════════════
          Hero Header & Quick Actions
         ════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-500 font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>L6 Patterns Variation Lab · Decoupled from 6D Baseline</span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                6D+ · Floating Window (L2 3-Stage Panel Combiner 变体实验台)
              </h1>
              <Badge variant="info" size="sm" isLight={isLight}>
                零改动 6D 原页 · 独立沙盒与 Store
              </Badge>
            </div>
            <p className={`text-xs leading-relaxed max-w-3xl ${ isLight ? 'text-neutral-600' : 'text-neutral-400' }`}>
              在完全保留 <strong>6D · Floating Window 编排</strong> 现有实现不动的前提下，本专页专门验证将{' '}
              <strong>L2 Panel 3-Stage Combiner (`Header + Content + Footer`)</strong> 引入{' '}
              <strong>Floating Window</strong> 的各类变体：包括{' '}
              <strong>Stage 3 Footer 悬停说明联动</strong>、<strong>Footer 与右下角/边缘 Resize 手柄的三种无冲突共存方案</strong>、<strong>顶栏同心/贴边分割按钮</strong>以及{' '}
              <strong>固定可拉 vs 内容自适应高度</strong>。
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={<Code2 className="h-3.5 w-3.5" />}
              onClick={() => setShowCodeBlock((prev) => !prev)}
            >
              {showCodeBlock ? '隐藏配置代码' : '查看配置代码'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              isLight={isLight}
              icon={copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={handleCopyCode}
            >
              {copiedCode ? '已复制变体配置!' : '复制变体配置'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isLight={isLight}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={resetConfig}
            >
              重置默认
            </Button>
          </div>
        </div>

        {showCodeBlock && (
          <CodeBlock isLight={isLight}
            title="当前 6D+ 3-Stage Floating Window 变体配置快照 (src/tokens/floatingThreeStageStore.ts)"
            code={exportConfigCode()} />
        )}

        <PageJumpDirectory title="6D+ · 3-Stage 悬浮窗变体实验台快速跳转目录 (Quick Jump Index)"
          subtitle="点击卡片定位至实时交互画布、Footer/Resize 支持度验证矩阵、全量参数调优台或三壳体同屏对照" items={JUMP_ITEMS} isLight={isLight} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 (6D+.1): Interactive 3-Stage Floating Window Canvas Stage
         ════════════════════════════════════════════════════════════════════ */}
      <section id="fw-3stage-6d-1-stage" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              6D+.1
            </span>
            <AppWindow className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold">3-Stage 悬浮窗实时交互画布 (Interactive 3-Stage Floating Window Stage)</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Single vs Stack Mode */}
            <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100/80 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setStageMode('single')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                  stageMode === 'single'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>单窗深度检视 (Single Probe)</span>
              </button>
              <button
                type="button"
                onClick={() => setStageMode('stack')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                  stageMode === 'stack'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>多窗堆叠测试 (Multi-Stack)</span>
              </button>
            </div>

            <ToggleSwitch checked={config.showStageAnatomyBorders}
              onCheckedChange={(v) => setParam('showStageAnatomyBorders', v)}
              label="显示三段式解剖虚线框 (Stage 1/2/3 Borders)" variant="neutral" isLight={isLight} />
          </div>
        </div>

        {/* 6 Curated Variation Presets Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FLOATING_THREE_STAGE_PRESETS.map((preset) => {
            const isCurrent =
              config.variant === preset.patch.variant &&
              config.showFooter === preset.patch.showFooter &&
              config.resizeHandleStyle === preset.patch.resizeHandleStyle &&
              config.headerTitleAlign === preset.patch.headerTitleAlign;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                  isCurrent
                    ? isLight
                      ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/25'
                    : isLight
                    ? 'bg-neutral-50/70 hover:bg-neutral-100/80 border-neutral-200/90'
                    : 'bg-neutral-950/60 hover:bg-neutral-900 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    {preset.code}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" /> 当前激活
                    </span>
                  )}
                </div>
                <span className="font-bold text-xs">{preset.label}</span>
                <span className={`text-[11px] leading-snug ${ isLight ? 'text-neutral-600' : 'text-neutral-400' }`}>
                  {preset.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom-Right Curved Corner Dragger Micro-Comparison Strip */}
        <FloatingWindowCornerDraggerStrip isLight={isLight} />

        {/* Payload Source Switcher + Quick Size / Resize Stress Bar */}
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Payload Source */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-400 mr-1">窗口内部载荷 (Window Payload):</span>
              <button
                type="button"
                onClick={() => setPayloadSource('probe')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                  payloadSource === 'probe'
                    ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                <span>3-Stage 专项能力探针 (含 Hover/Sub-View/长列表)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayloadSource('user');
                  setSelectedPresetId(USER_PRESET_WINDOWS[0].id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                  payloadSource === 'user'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>6 个真实 User 悬浮窗</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayloadSource('developer');
                  setSelectedPresetId(DEV_PRESET_WINDOWS[0].id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                  payloadSource === 'developer'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>19 个真实 Developer 悬浮窗</span>
              </button>
            </div>

            {/* Quick Resize Dimension Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-neutral-400">一键尺寸压力测试 (Resize Stress):</span>
              {[
                { label: '最小钳制 (300×190)', w: 300, h: 190 },
                { label: '紧凑 (380×260)', w: 380, h: 260 },
                { label: '标准 (500×370)', w: 500, h: 370 },
                { label: '宽屏 (680×420)', w: 680, h: 420 },
                { label: '超宽无上限 (860×540)', w: 860, h: 540 },
              ].map((sz) => (
                <button
                  key={sz.label}
                  type="button"
                  onClick={() => handleResizeActiveWindow(sz.w, sz.h)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-colors ${
                    isLight
                      ? 'bg-white hover:bg-amber-50 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real Preset Picker Pills when User or Developer is selected */}
          {payloadSource !== 'probe' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/70 dark:border-neutral-800">
              {activePresetList.map((preset, idx) => {
                const isSelected = preset.id === activeRealPreset?.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      if (stageMode === 'stack') {
                        handleSpawnExtraStackWindow(preset);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 font-bold'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-70">{idx + 1}.</span>
                    <FloatingWindowIcon
                      id={preset.id}
                      category={preset.category}
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    <span>{preset.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active 3D Arena Canvas Stage */}
        <div ref={canvasRef}
          className={`relative w-full min-h-[620px] rounded-2xl border p-6 overflow-hidden select-none transition-colors ${
          isLight ? 'bg-neutral-100/70 border-neutral-200 shadow-inner'
          : 'bg-neutral-950/85 border-neutral-800 shadow-inner' }`} style={{ backgroundImage: isLight
          ? 'radial-gradient(#d4d4d8 1px, transparent 1px)' : 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px', }}>
          {/* Ambient Canvas Guide */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-25 select-none">
            <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
              [6D+ Isolated 3-Stage Floating Arena · Variant: {config.variant} · Opacity {opacity}% · Open: {totalCount - minimizedCount} · Stack: {minimizedCount}]
            </span>
            <span className="text-[11px] text-neutral-500 max-w-lg text-center mt-1">
              试试：1) 鼠标悬停窗内控件或右上角按钮观察 Stage 3 Footer 变亮；2) 拖拽 Footer 右下角雕刻槽、右边缘或下边缘体验零迟滞 Resize；3) 点击右上角按钮体验三段式收起至右上角 Stack。
            </span>
          </div>

          {/* Top-Right Stack Icon (bound to isolated floatingThreeStageSandboxStore) */}
          <FloatingStackIcon
            isLight={isLight}
            store={floatingThreeStageSandboxStore}
            absolute={true}
            containerRef={canvasRef}
          />

          {/* 3-Stage Floating Window Manager */}
          <FloatingThreeStageWindowManager
            isLight={isLight}
            store={floatingThreeStageSandboxStore}
            containerRef={canvasRef}
            defaultDescriptionForWindow={(win) => {
              if (win.id === PROBE_WINDOW_ID) {
                return 'Stage 3 Footer (Idle): Hover any slider, row, tab, or header button to preview high-contrast contextual description.';
              }
              const found = PRESET_WINDOWS.find((p) => p.id === win.id);
              return (
                found?.summary ||
                win.subtitle ||
                'L2 3-Stage PanelFooter inside Floating Window · Drag right/bottom edge or footer grip to resize.'
              );
            }}
            renderWindowContent={(item, ctx) => {
              if (item.id === PROBE_WINDOW_ID) {
                return (
                  <ThreeStageCapabilityProbeContent
                    ctx={ctx}
                    showSubTabsBar={config.showSubTabsBar}
                    showFloatingToolbar={config.showFloatingToolbar}
                  />
                );
              }
              return (
                <div
                  onMouseEnter={() =>
                    ctx.setHoveredDescription(
                      `Inspecting [${item.title}] (${ctx.width}×${ctx.height}px): Wrapped inside L2 3-Stage Panel Combiner shell.`
                    )
                  }
                  onMouseLeave={() => ctx.setHoveredDescription(null)}
                >
                  {renderFloatingWindowPanel(item.id, { isLight: ctx.isLight })}
                </div>
              );
            }}
          />

          {/* Bottom-Right Quick Re-Spawn / Opacity Dock inside Canvas */}
          <div
            className={`absolute bottom-4 right-4 z-30 flex items-center gap-3 px-3.5 py-2 rounded-xl border text-xs ${
            isLight ? 'bg-white/95 border-neutral-300 text-neutral-800 shadow-md'
            : 'bg-neutral-900/95 border-neutral-700 text-neutral-200 shadow-md' }`}>
            <div className="w-40">
              <SliderControl label="Opacity" value={opacity} min={15} max={100} step={1} unit="%"
                onChange={setOpacity} isLight={isLight} />
            </div>
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              onClick={() => {
                if (payloadSource === 'probe') {
                  floatingThreeStageSandboxStore.spawnWindow({
                    id: PROBE_WINDOW_ID,
                    title: '3-STAGE FLOATING PROBE',
                    category: 'tuning',
                    width: 500,
                    height: 370,
                    position: { x: 48, y: 44 },
                    resizable: true,
                    singleton: true,
                    startMinimized: false,
                  });
                } else if (activeRealPreset) {
                  handleSpawnExtraStackWindow(activeRealPreset);
                }
              }}
            >
              恢复/唤醒当前窗口
            </Button>
            {totalCount > 1 && (
              <Button size="sm" variant="danger" isLight={isLight} onClick={clearAll}>
                清空 ({totalCount})
              </Button>
            )}
          </div>
        </div>
      </section>

      <FloatingWindowCapabilityMatrixSection isLight={isLight} />
      <FloatingWindowParameterTunerSection isLight={isLight} />
      <FloatingWindowShootoutSection isLight={isLight} />
    </div>
  );
};
