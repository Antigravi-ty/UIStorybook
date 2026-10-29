import React, { useRef, useEffect } from 'react';
import {
  Sparkles,
  AppWindow,
  LayoutTemplate,
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Eye,
  Layers,
  CheckCircle2,
  MoveDiagonal2,
  Maximize2,
  ArrowRight,
  Link2,
  Unlink2,
  ShieldCheck,
  Terminal,
  User,
  Activity,
  Gauge,
  Compass,
  Wrench,
} from 'lucide-react';
import {
  useFloatingStore,
  USER_PRESET_WINDOWS,
  DEV_PRESET_WINDOWS,
  PRESET_WINDOWS,
  type PresetConfig,
} from '../../tokens';
import { createScopedSyncedState } from '../stores';
import {
  floatingThreeStageSandboxStore,
  useFloatingThreeStageStore,
  FLOATING_THREE_STAGE_PRESETS,
  type FloatingShellVariant,
  type FloatingHeaderLeftSlotMode,
  type FloatingHeaderTitleAlign,
  type FloatingHeaderRightActionMode,
  type FloatingHeaderRightIconStyle,
  type FloatingFooterRightSlotMode,
  type FloatingResizeHandleStyle,
  type FloatingCornerArcColorMode,
  type FloatingContentOverflowMode,
} from '../stores/floatingThreeStageStore';
import {
  resolvePanelHeaderBackBtnGeometry,
  type PanelHeaderBackBtnIdleTone,
  type PanelHeaderBackBtnRadiusMode,
  type PanelHeaderBackBtnStyle,
} from '../../tokens/menuLayoutStore';
import {
  FloatingThreeStageWindowManager,
  CornerCurvedDragger,
  type FloatingThreeStageRenderContext,
} from '../components/FloatingThreeStageWindow';
import { FloatingStackIcon } from '../../navigation/FloatingStackIcon';
import { FloatingWindowIcon } from '../../navigation/FloatingWindowIcon';
import { renderFloatingWindowPanel } from '../../panels';
import { FloatingWindowToolbar } from '../../panels/FloatingWindowToolbar';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { SliderControl } from '../../primitives/SliderControl';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { UnderlineTabs } from '../../primitives/UnderlineTabs';
import { SettingActionRow } from '../../primitives/SettingActionRow';
import { CodeBlock } from '../CodeBlock';
import { PageJumpDirectory, type JumpDirectoryItem } from '../PageJumpDirectory';

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

const PROBE_WINDOW_ID = '3stage-capability-probe';

interface ProbeContentProps {
  ctx: FloatingThreeStageRenderContext;
  showSubTabsBar: boolean;
  showFloatingToolbar: boolean;
}

/**
 * Interactive 3-Stage Capability Probe Payload
 * Designed specifically to test every interaction between Floating Window content,
 * Stage 1 Header (including sub-view Back button), Stage 2 Scroll/Auto-fit,
 * Stage 3 Hover Footer descriptions, and live 2D Resizing.
 */
const ThreeStageCapabilityProbeContent: React.FC<ProbeContentProps> = ({
  ctx,
  showSubTabsBar,
  showFloatingToolbar,
}) => {
  const [probeTab, setProbeTab] = React.useState<'telemetry' | 'rows' | 'overflow'>('telemetry');
  const [step, setStep] = React.useState(0.01);
  const [simHz, setSimHz] = React.useState(120);
  const [springStiffness, setSpringStiffness] = React.useState(0.65);
  const [deterministicLock, setDeterministicLock] = React.useState(true);
  const [overflowRowCount, setOverflowRowCount] = React.useState<3 | 6 | 14>(6);

  const { isLight, setHoveredDescription, subViewDepth, pushSubView, popSubView } = ctx;

  if (subViewDepth > 0) {
    return (
      <div className="flex flex-col gap-3">
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
            isLight
              ? 'bg-amber-50/70 border-amber-300 text-amber-900'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
          }`}
          onMouseEnter={() =>
            setHoveredDescription(
              'Sub-View Active: Click the top-left Back button in Stage 1 Header (or the button below) to pop back to the root view.'
            )
          }
          onMouseLeave={() => setHoveredDescription(null)}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-xs">
              二级子视图演练 (Sub-View Depth #{subViewDepth})
            </span>
            <span className="text-[11px] opacity-80">
              验证当 Floating Window 包含多级子页面时，Stage 1 顶栏左侧的 L2 标准 Back 按钮可直接返回上一级。
            </span>
          </div>
          <Button size="sm" variant="primary" isLight={isLight} onClick={popSubView}>
            返回上一级
          </Button>
        </div>

        <SettingActionRow
          icon={<Gauge className="h-4 w-4" />}
          title="Sub-Step Solver Iterations"
          description="Configure Bullet3 constraint solver iterations per 120Hz physics tick."
          actionLabel="Push Level +1"
          onAction={() => pushSubView(`Solver L${subViewDepth + 1}`)}
          hoverDescription="Hovering Sub-Step Solver row: Click [Push Level +1] to test deeper breadcrumb stack in Stage 1 Header."
          onHover={(desc) => setHoveredDescription(desc)}
          onLeave={() => setHoveredDescription(null)}
          isLight={isLight}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {showFloatingToolbar && (
        <div
          onMouseEnter={() =>
            setHoveredDescription(
              'FloatingWindowToolbar: Precision step selector + Copy/Export/Reset JSON bar nested inside Stage 2 Content.'
            )
          }
          onMouseLeave={() => setHoveredDescription(null)}
        >
          <FloatingWindowToolbar
            title="3-Stage Probe Telemetry"
            subtitle="Hover any control below to see Stage 3 Footer switch to high-contrast help"
            step={step}
            onStepChange={setStep}
            presets={['120Hz Lock', '240Hz OC']}
            activePreset="120Hz Lock"
            onReset={() => {
              setSimHz(120);
              setSpringStiffness(0.65);
              setDeterministicLock(true);
            }}
            isLight={isLight}
          />
        </div>
      )}

      {showSubTabsBar && (
        <div
          onMouseEnter={() =>
            setHoveredDescription(
              'Stage 2 Sub-Navigation (L1 UnderlineTabs): Switch internal tabs inside the 3-Stage Floating Window.'
            )
          }
          onMouseLeave={() => setHoveredDescription(null)}
        >
          <UnderlineTabs
            tabs={[
              {
                id: 'telemetry',
                label: 'Controls & Hover',
                icon: <Sliders className="h-3.5 w-3.5" />,
              },
              {
                id: 'rows',
                label: 'Action Rows & Sub-View',
                icon: <Compass className="h-3.5 w-3.5" />,
              },
              {
                id: 'overflow',
                label: `Scroll & Resize (${overflowRowCount})`,
                icon: <Maximize2 className="h-3.5 w-3.5" />,
              },
            ]}
            activeId={probeTab}
            onChange={(id: string) => setProbeTab(id as typeof probeTab)}
            isLight={isLight}
          />
        </div>
      )}

      {probeTab === 'telemetry' && (
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div
              onMouseEnter={() =>
                setHoveredDescription(
                  `Window Canvas Footprint: Currently ${ctx.width}×${ctx.height}px. Drag right/bottom edges or bottom-right grip to test live flex layout.`
                )
              }
              onMouseLeave={() => setHoveredDescription(null)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-white border-neutral-200/90 hover:border-amber-400'
                  : 'bg-neutral-950/60 border-neutral-800 hover:border-amber-500/50'
              }`}
            >
              <span className="text-[10px] font-mono text-neutral-400 block">
                Live Window Size
              </span>
              <span className="text-sm font-mono font-bold text-amber-500">
                {ctx.width} × {ctx.height} px
              </span>
            </div>

            <div
              onMouseEnter={() =>
                setHoveredDescription(
                  'Stage 3 Footer Linkage Active: Hovering any card, slider, or header button updates the bottom bar in real time.'
                )
              }
              onMouseLeave={() => setHoveredDescription(null)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-white border-neutral-200/90 hover:border-emerald-400'
                  : 'bg-neutral-950/60 border-neutral-800 hover:border-emerald-500/50'
              }`}
            >
              <span className="text-[10px] font-mono text-neutral-400 block">
                3-Stage Contract
              </span>
              <span className="text-sm font-mono font-bold text-emerald-500">
                Header · Body · Footer
              </span>
            </div>
          </div>

          <div
            onMouseEnter={() =>
              setHoveredDescription(
                'Simulation Tick Frequency (Hz): Adjusts WASM physics step rate between 30Hz and 240Hz.'
              )
            }
            onMouseLeave={() => setHoveredDescription(null)}
          >
            <SliderControl
              label="Physics Tick Rate (simHz)"
              value={simHz}
              min={30}
              max={240}
              step={10}
              unit="Hz"
              colorScheme="amber"
              onChange={setSimHz}
              isLight={isLight}
            />
          </div>

          <div
            onMouseEnter={() =>
              setHoveredDescription(
                'Camera Spring-Arm Stiffness (0.00 - 1.00): Controls velocity damping on supersonic boost.'
              )
            }
            onMouseLeave={() => setHoveredDescription(null)}
          >
            <SliderControl
              label="Spring-Arm Stiffness"
              value={springStiffness}
              min={0}
              max={1}
              step={step}
              colorScheme="sky"
              onChange={setSpringStiffness}
              isLight={isLight}
            />
          </div>

          <div
            onMouseEnter={() =>
              setHoveredDescription(
                'Deterministic Float32 Lock: Enforces IEEE-754 cross-client bit-identical replay simulation.'
              )
            }
            onMouseLeave={() => setHoveredDescription(null)}
            className={`px-3 py-2 rounded-xl border ${
              isLight ? 'bg-white border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800'
            }`}
          >
            <ToggleSwitch
              checked={deterministicLock}
              onCheckedChange={setDeterministicLock}
              label="Deterministic IEEE-754 Replay Lock"
              isLight={isLight}
            />
          </div>
        </div>
      )}

      {probeTab === 'rows' && (
        <div className="flex flex-col">
          <SettingActionRow
            icon={<Compass className="h-4 w-4" />}
            iconColor="text-amber-500"
            title="Sub-View Drilldown Test"
            description="Test Stage 1 Header left Back button by pushing a child view."
            actionLabel="Open Sub-View"
            onAction={() => pushSubView('Drilldown')}
            hoverDescription="Click [Open Sub-View] to test multi-stage navigation inside a Floating Window (activates Back button when leftSlotMode='back-button')."
            onHover={(desc) => setHoveredDescription(desc)}
            onLeave={() => setHoveredDescription(null)}
            isLight={isLight}
          />
          <SettingActionRow
            icon={<Activity className="h-4 w-4" />}
            iconColor="text-emerald-500"
            title="120Hz Frame-Time Telemetry"
            description="Inspect CPU/GPU phase breakdown with quantile markers."
            actionLabel="Inspect"
            onAction={() => setProbeTab('telemetry')}
            hoverDescription="SettingActionRow inside Floating Window: Full-row concentric hover box synced with Stage 3 Footer description."
            onHover={(desc) => setHoveredDescription(desc)}
            onLeave={() => setHoveredDescription(null)}
            isLight={isLight}
          />
          <SettingActionRow
            icon={<Wrench className="h-4 w-4" />}
            iconColor="text-sky-500"
            title="Overflow & Resize Stress Test"
            description="Switch to Scroll & Resize tab to test vertical scrollbar vs Footer."
            actionLabel="Test Scroll"
            onAction={() => setProbeTab('overflow')}
            hoverDescription="Verify that Stage 2 Content scrolls independently without pushing Stage 3 Footer off the bottom edge."
            onHover={(desc) => setHoveredDescription(desc)}
            onLeave={() => setHoveredDescription(null)}
            isLight={isLight}
          />
        </div>
      )}

      {probeTab === 'overflow' && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold opacity-80">
              生成测试条目数 (验证纵向滚动与 Auto-Fit 高度钳制):
            </span>
            <SegmentedSwitch
              size="sm"
              isLight={isLight}
              value={String(overflowRowCount)}
              onValueChange={(v) => setOverflowRowCount(Number(v) as 3 | 6 | 14)}
              options={[
                { value: '3', label: '3 项 (紧凑)' },
                { value: '6', label: '6 项 (适中)' },
                { value: '14', label: '14 项 (长列表滚动)' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            {Array.from({ length: overflowRowCount }).map((_, i) => (
              <div
                key={i}
                onMouseEnter={() =>
                  setHoveredDescription(
                    `Scroll Item #${i + 1} of ${overflowRowCount}: Notice how Stage 1 Header and Stage 3 Footer remain strictly anchored while Stage 2 scrolls.`
                  )
                }
                onMouseLeave={() => setHoveredDescription(null)}
                className={`px-3 py-2 rounded-lg border flex items-center justify-between text-xs font-mono transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-amber-50/60 border-neutral-200/90 text-neutral-700'
                    : 'bg-neutral-950/60 hover:bg-neutral-800/80 border-neutral-800 text-neutral-300'
                }`}
              >
                <span>
                  #{String(i + 1).padStart(2, '0')} · SimChannel_Tick_{8192 + i * 16}
                </span>
                <span className="text-amber-500 font-bold">{(0.28 + i * 0.03).toFixed(2)} ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const FloatingWindowVariationPage: React.FC<FloatingWindowVariationPageProps> = ({
  isLight = true,
}) => {
  const config = useFloatingThreeStageStore();
  const {
    setParam,
    updateParams,
    applyPreset,
    pullFromGlobalL2Shell,
    resetConfig,
    exportConfigCode,
  } = config;

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

  const btnGeom = resolvePanelHeaderBackBtnGeometry({
    panelHeaderPaddingX: config.headerPaddingX,
    panelHeaderPaddingY: config.headerPaddingY,
    panelHeaderBackBtnWidth: config.headerBtnWidth,
    panelHeaderBackBtnHeight: config.headerBtnHeight,
    panelHeaderBackBtnRadiusMode: config.headerBtnRadiusMode,
    panelHeaderBackBtnRadius: config.headerBtnCustomRadius,
    panelHeaderBackBtnInnerRadius: config.headerBtnInnerRadius,
    panelHeaderBackBtnRadiusTL: config.headerBtnRadiusTL,
    panelHeaderBackBtnRadiusTR: config.headerBtnRadiusTR,
    panelHeaderBackBtnRadiusBR: config.headerBtnRadiusBR,
    panelHeaderBackBtnRadiusBL: config.headerBtnRadiusBL,
    panelOuterRadius: config.outerRadius,
  });

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
            <p
              className={`text-xs leading-relaxed max-w-3xl ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
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
          <CodeBlock
            isLight={isLight}
            title="当前 6D+ 3-Stage Floating Window 变体配置快照 (src/tokens/floatingThreeStageStore.ts)"
            code={exportConfigCode()}
          />
        )}

        <PageJumpDirectory
          title="6D+ · 3-Stage 悬浮窗变体实验台快速跳转目录 (Quick Jump Index)"
          subtitle="点击卡片定位至实时交互画布、Footer/Resize 支持度验证矩阵、全量参数调优台或三壳体同屏对照"
          items={JUMP_ITEMS}
          isLight={isLight}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 (6D+.1): Interactive 3-Stage Floating Window Canvas Stage
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="fw-3stage-6d-1-stage"
        className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-2xs'
            : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              6D+.1
            </span>
            <AppWindow className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold">
              3-Stage 悬浮窗实时交互画布 (Interactive 3-Stage Floating Window Stage)
            </h2>
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

            <ToggleSwitch
              checked={config.showStageAnatomyBorders}
              onCheckedChange={(v) => setParam('showStageAnatomyBorders', v)}
              label="显示三段式解剖虚线框 (Stage 1/2/3 Borders)"
              variant="neutral"
              isLight={isLight}
            />
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
                <span
                  className={`text-[11px] leading-snug ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}
                >
                  {preset.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom-Right Curved Corner Dragger Micro-Comparison Strip */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
            isLight
              ? 'bg-amber-50/35 border-amber-200/80'
              : 'bg-amber-500/5 border-amber-500/20'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MoveDiagonal2 className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold">
                右下角圆弧缩放握把变体微距对比 (Bottom-Right Curved Corner Dragger Variations)
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                R_outer={config.outerRadius}px · R_arc=
                {config.cornerArcConcentric
                  ? Math.max(3, config.outerRadius - config.cornerArcInset)
                  : config.cornerArcRadius}
                px · 张角={config.cornerArcSweepDeg}°
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ToggleSwitch
                checked={config.limitMaxSize}
                onCheckedChange={(v) => setParam('limitMaxSize', v)}
                label={
                  config.limitMaxSize
                    ? `限制最大宽高 (${config.maxWidth}×${config.maxHeight}px)`
                    : '最大宽高不限制 (已开启无限自由缩放)'
                }
                variant="neutral"
                isLight={isLight}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {(
              [
                {
                  id: 'corner-arc' as FloatingResizeHandleStyle,
                  title: '同心单圆弧 (Corner Arc)',
                  badge: '默认推荐',
                  desc: '沿右下角 16px 圆角内侧同心绘制一段平滑圆弧握把，自然贴合圆角边界',
                },
                {
                  id: 'corner-arc-dots' as FloatingResizeHandleStyle,
                  title: '圆弧三点 (Arc 3-Dots)',
                  badge: '三点弧化',
                  desc: '将原本生硬的直角三点改为沿着右下角同心圆弧等角度排列的三颗圆点',
                },
                {
                  id: 'corner-double-arc' as FloatingResizeHandleStyle,
                  title: '双重同心弧 (Double Arc)',
                  badge: '双轨刻度',
                  desc: '外弧 + 内弧双层同心圆弧握把，强化可拖拽缩放的精密仪器操控感',
                },
                {
                  id: 'corner-pill-arc' as FloatingResizeHandleStyle,
                  title: '胶囊圆弧轨 (Pill Arc)',
                  badge: '高显著度',
                  desc: '带柔和胶囊底轨衬托的同心圆弧握把，深浅主题下均具备极高辨识度',
                },
                {
                  id: 'corner-dots' as FloatingResizeHandleStyle,
                  title: '直角三点 (Right-Angle)',
                  badge: '原版对照',
                  desc: '此前版本的右下角 L 型直角三点阵列，可与左侧 4 款圆弧握把直接对比',
                },
              ] as const
            ).map((item) => {
              const isSelected = config.resizeHandleStyle === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    updateParams({
                      resizable: true,
                      resizeHandleStyle: item.id,
                      showFooter: true,
                      footerRightSlotMode: 'none',
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-2xs'
                        : 'bg-neutral-900 border-amber-500 ring-2 ring-amber-500/25'
                      : isLight
                      ? 'bg-white/80 hover:bg-white border-neutral-200/90'
                      : 'bg-neutral-950/70 hover:bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs">{item.title}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                          isSelected
                            ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                            : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] leading-snug ${
                        isLight ? 'text-neutral-600' : 'text-neutral-400'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>

                  {/* 1:1 & 1.6x Magnified Corner Preview */}
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800/80">
                    <span className="text-[10px] font-mono text-neutral-400">
                      1:1 &amp; 1.6× 预览
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        title="1:1 原尺寸右下角圆角预览"
                        className={`relative w-11 h-7 border-b border-r overflow-hidden flex items-end justify-end ${
                          isSelected
                            ? 'border-amber-500'
                            : isLight
                            ? 'border-neutral-300 bg-neutral-50'
                            : 'border-neutral-700 bg-neutral-900'
                        }`}
                        style={{
                          borderBottomRightRadius: `${config.outerRadius}px`,
                        }}
                      >
                        <CornerCurvedDragger
                          styleVariant={item.id}
                          outerRadius={config.outerRadius}
                          concentric={config.cornerArcConcentric}
                          arcRadius={config.cornerArcRadius}
                          inset={config.cornerArcInset}
                          sweepDeg={config.cornerArcSweepDeg}
                          strokeWidth={config.cornerArcStrokeWidth}
                          idleOpacity={Math.max(config.cornerArcIdleOpacity, 75)}
                          colorMode={isSelected ? 'amber' : config.cornerArcColorMode}
                          isLight={isLight}
                          isActiveOrHovered={isSelected}
                        />
                      </div>

                      <div
                        title="1.6× 微距放大右下角圆角预览"
                        className={`relative w-12 h-8 border-b-2 border-r-2 overflow-hidden flex items-end justify-end ${
                          isSelected
                            ? 'border-amber-500'
                            : isLight
                            ? 'border-neutral-300 bg-neutral-50'
                            : 'border-neutral-700 bg-neutral-900'
                        }`}
                        style={{
                          borderBottomRightRadius: `${Math.round(config.outerRadius * 1.5)}px`,
                        }}
                      >
                        <div
                          style={{
                            transform: 'scale(1.5)',
                            transformOrigin: 'bottom right',
                          }}
                          className="w-6 h-6 flex items-end justify-end"
                        >
                          <CornerCurvedDragger
                            styleVariant={item.id}
                            outerRadius={config.outerRadius}
                            concentric={config.cornerArcConcentric}
                            arcRadius={config.cornerArcRadius}
                            inset={config.cornerArcInset}
                            sweepDeg={config.cornerArcSweepDeg}
                            strokeWidth={config.cornerArcStrokeWidth}
                            idleOpacity={90}
                            colorMode={isSelected ? 'amber' : config.cornerArcColorMode}
                            isLight={isLight}
                            isActiveOrHovered={isSelected}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payload Source Switcher + Quick Size / Resize Stress Bar */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
            isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Payload Source */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-400 mr-1">
                窗口内部载荷 (Window Payload):
              </span>
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
              <span className="text-[11px] font-mono text-neutral-400">
                一键尺寸压力测试 (Resize Stress):
              </span>
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
        <div
          ref={canvasRef}
          className={`relative w-full min-h-[620px] rounded-2xl border p-6 overflow-hidden select-none transition-colors ${
            isLight
              ? 'bg-neutral-100/70 border-neutral-200 shadow-inner'
              : 'bg-neutral-950/85 border-neutral-800 shadow-inner'
          }`}
          style={{
            backgroundImage: isLight
              ? 'radial-gradient(#d4d4d8 1px, transparent 1px)'
              : 'radial-gradient(#27272a 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
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
              isLight
                ? 'bg-white/95 border-neutral-300 text-neutral-800 shadow-md'
                : 'bg-neutral-900/95 border-neutral-700 text-neutral-200 shadow-md'
            }`}
          >
            <div className="w-40">
              <SliderControl
                label="Opacity"
                value={opacity}
                min={15}
                max={100}
                step={1}
                unit="%"
                onChange={setOpacity}
                isLight={isLight}
              />
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

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 (6D+.2): Capability & Adaptation Matrix ("什么支持？什么不支持？Resize 怎么配合？")
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="fw-3stage-6d-2-matrix"
        className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-2xs'
            : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              6D+.2
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <h2 className="text-base font-bold">
              L2 3-Stage Combiner 引入 Floating Window 的支持度与适配矩阵 (Capability &amp; Resize Coexistence Audit)
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            点击任意卡片右下角按钮即可在上方 6D+.1 画布中直接体验该机制
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Stage 3 Footer + Hover Description */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm" isLight={isLight}>
                  100% 原生支持 · Stage 3 Footer
                </Badge>
                <span className="text-[11px] font-mono text-emerald-500 font-bold">
                  Idle Gray ⇄ Hover High-Contrast
                </span>
              </div>
              <h3 className="font-bold text-xs mt-1">
                1. 底部说明栏与悬停联动 (PanelFooter Hover Linkage)
              </h3>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                静止时显示灰色默认窗口说明（<code>defaultDescription</code>）；鼠标悬停到浮窗内任意滑块、行或顶栏按钮时，底栏立刻高亮显示该控件的详细参数解释（<code>hoveredDescription</code>），解决浮窗空间紧凑放不下长说明的痛点。
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              onClick={() =>
                updateParams({
                  variant: 'three-stage-split-footer-grip',
                  showFooter: true,
                  footerHoverLinkage: true,
                })
              }
            >
              激活 Footer 悬停联动 <ArrowRight className="h-3 w-3 ml-1 inline" />
            </Button>
          </div>

          {/* Card 2: Resize + Footer Coexistence (3 Solutions) */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isLight ? 'bg-amber-50/40 border-amber-300/80' : 'bg-amber-500/5 border-amber-500/30'
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="warning" size="sm" isLight={isLight}>
                  核心突破 · Resize × Footer 共存
                </Badge>
                <MoveDiagonal2 className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <h3 className="font-bold text-xs mt-1">
                2. Footer 与右下角 Resize 手柄如何不打架？
              </h3>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                传统右下角 16×16 悬浮角标容易遮挡 Footer 右侧文字。我们验证了三种零冲突方案：
                <br />• <strong>方案 A (推荐)</strong>：利用 <code>PanelFooter</code> 的右侧独立分割槽 (<code>border-l</code>) 雕刻专属 <code>W×H + ◢</code> 拖拽手柄；
                <br />• <strong>方案 B</strong>：右边缘拉宽 (<code>ew-resize</code>) + 下边缘拉高 (<code>ns-resize</code>) + 右下角拉对角；
                <br />• <strong>方案 C</strong>：经典右下角点阵角标 + Footer 自动右侧避让内衬。
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    showFooter: true,
                    footerRightSlotMode: 'carved-resize-grip',
                    resizeHandleStyle: 'both-slot-and-edges',
                  })
                }
                className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500 text-neutral-950 cursor-pointer"
              >
                试方案 A (雕刻槽)
              </button>
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    showFooter: true,
                    footerRightSlotMode: 'live-dimensions',
                    resizeHandleStyle: 'invisible-edges-and-corner',
                  })
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                  isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                试方案 B (隐形边缘)
              </button>
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    showFooter: true,
                    footerRightSlotMode: 'none',
                    resizeHandleStyle: 'corner-dots',
                  })
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                  isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                试方案 C (经典角标)
              </button>
            </div>
          </div>

          {/* Card 3: Stage 1 Header Carved Buttons & Dragging */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm" isLight={isLight}>
                  100% 兼容 · Stage 1 Header
                </Badge>
                <span className="text-[11px] font-mono text-sky-500 font-bold">
                  R={btnGeom.radiusSummary}
                </span>
              </div>
              <h3 className="font-bold text-xs mt-1">
                3. L2 顶栏几何 (贴边单分割线 / 外角同心) + 拖拽移动
              </h3>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                直接复用 L2 <code>resolvePanelHeaderBackBtnGeometry</code>：右上角 Minimize 按钮完美支持 <code>0×0 贴边单分割线 (42×32)</code> 或 <code>外角同心内嵌 (30×26)</code>，且除按钮外的整个顶栏均保持零迟滞鼠标拖拽移动。
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    headerPaddingX: 0,
                    headerPaddingY: 0,
                    headerBtnWidth: 42,
                    headerBtnHeight: 32,
                    headerBtnRadiusMode: 'asymmetric-tl',
                    headerBtnInnerRadius: 0,
                  })
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                  isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                贴边分割 (42×32)
              </button>
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    headerPaddingX: 6,
                    headerPaddingY: 6,
                    headerBtnWidth: 30,
                    headerBtnHeight: 26,
                    headerBtnRadiusMode: 'asymmetric-tl',
                    headerBtnInnerRadius: 6,
                  })
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                  isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                内嵌同心 (30×26)
              </button>
            </div>
          </div>

          {/* Card 4: Left Back Button vs Category Icon */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="info" size="sm" isLight={isLight}>
                  按需裁剪 · Left Slot 策略
                </Badge>
                <span className="text-[11px] font-mono text-neutral-400">
                  Icon / Back / None
                </span>
              </div>
              <h3 className="font-bold text-xs mt-1">
                4. 什么不需要强行照搬？—— 左侧返回键 (Left Back Button)
              </h3>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                L2 模态菜单必须有左侧 <code>Back</code> 键返回上级菜单；而大多数平铺式 Floating Window 没有“上一级菜单”，因此左侧槽位默认改为<strong>窗口分类图标 (`category-icon`)</strong>或<strong>留空 (`none`)</strong>，仅在含二级子页面的复杂浮窗中开启 <code>back-button</code>。
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['category-icon', 'back-button', 'none'] as FloatingHeaderLeftSlotMode[]).map(
                (m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setParam('headerLeftSlotMode', m)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                      config.headerLeftSlotMode === m
                        ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300'
                        : 'bg-neutral-900 border-neutral-700'
                    }`}
                  >
                    {m}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Card 5: Stage 2 Scrollable vs Auto-Fit Height */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm" isLight={isLight}>
                  双模切换 · Stage 2 Sizing
                </Badge>
                <span className="text-[11px] font-mono text-emerald-500 font-bold">
                  Scroll-Y vs Auto-Fit
                </span>
              </div>
              <h3 className="font-bold text-xs mt-1">
                5. 自由拉高滚动 (`scroll-y`) vs 高度贴合内容 (`auto-fit-height`)
              </h3>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                • <code>scroll-y</code>：宽高均可自由拖拽，当窗口缩小时 Stage 2 内容区自动出现独立滚动条，Footer 稳固铆钉在底边；
                <br />• <code>auto-fit-height</code>：宽度可拉，高度随内部 Tab 切换自动贴合内容高度（受 <code>minHeight/maxHeight</code> 保护）。
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setParam('contentOverflowMode', 'scroll-y')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                  config.contentOverflowMode === 'scroll-y'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-300'
                    : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                scroll-y (2D 自由拉宽高)
              </button>
              <button
                type="button"
                onClick={() => setParam('contentOverflowMode', 'auto-fit-height')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                  config.contentOverflowMode === 'auto-fit-height'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-300'
                    : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                auto-fit-height (高度自适应)
              </button>
            </div>
          </div>

          {/* Card 6: Top-Right Action Adaptation (Live Preview -> Stack Minimize) */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="info" size="sm" isLight={isLight}>
                  语义映射 · Top-Right Action
                </Badge>
                <span className="text-[11px] font-mono text-sky-500 font-bold">
                  Minimize to Stack
                </span>
              </div>
              <h3 className="font-bold text-xs mt-1">
                6. 右上角按钮语义映射：从 Live Preview 到 Stack 收纳
              </h3>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                L2 菜单的右上角按钮是将模态面板折叠到侧边的 <code>Live Preview [TAB]</code>；而在 Floating Window 中，同一个右上角同心分割槽位自然映射为<strong>三段式收缩至右上角 Floating Stack Icon</strong>，并可选附加 <code>Pin (置顶锁定)</code>。
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    headerRightActionMode: 'minimize-only',
                    headerBtnExpandOnHover: true,
                  })
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                  config.headerRightActionMode === 'minimize-only' && config.headerBtnExpandOnHover
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-300'
                    : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                试 Hover 展开 STACK
              </button>
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    headerRightActionMode: 'minimize-and-pin',
                  })
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                  config.headerRightActionMode === 'minimize-and-pin'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-300'
                    : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                试 Pin + Minimize 双键
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 (6D+.3): Full Parameter Tuner
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="fw-3stage-6d-3-tuner"
        className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-6 ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-2xs'
            : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-sky-500/15 text-sky-500 border border-sky-500/30">
              6D+.3
            </span>
            <Sliders className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold">
              3-Stage 悬浮窗全量参数调优工作台 (Decoupled 3-Stage Floating Shell Tuner)
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {config.syncWithGlobalL2Shell ? (
                <Link2 className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <Unlink2 className="h-3.5 w-3.5 text-neutral-400" />
              )}
              <ToggleSwitch
                checked={config.syncWithGlobalL2Shell}
                onCheckedChange={(v) => setParam('syncWithGlobalL2Shell', v)}
                label="实时联动全局 L2 PanelShell Store"
                variant="neutral"
                isLight={isLight}
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              onClick={pullFromGlobalL2Shell}
            >
              单次拉取当前 L2 Shell 参数
            </Button>
          </div>
        </div>

        {/* Group 1: Stage 1 Header & Carved Buttons */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-4 ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Stage 1 · Header 顶栏几何、左右槽位与同心圆角 (Header &amp; Carved Action Slots)
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={config.headerTitleAlign}
                onValueChange={(v) => setParam('headerTitleAlign', v as FloatingHeaderTitleAlign)}
                options={[
                  { value: 'center', label: '标题居中 (L2 Standard)' },
                  { value: 'left', label: '标题左对齐 (Classic 6D)' },
                ]}
              />
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={config.headerLeftSlotMode}
                onValueChange={(v) =>
                  setParam('headerLeftSlotMode', v as FloatingHeaderLeftSlotMode)
                }
                options={[
                  { value: 'category-icon', label: '左侧: 分类图标' },
                  { value: 'back-button', label: '左侧: Back 返回键' },
                  { value: 'none', label: '左侧: 无' },
                ]}
              />
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={config.headerRightActionMode}
                onValueChange={(v) =>
                  setParam('headerRightActionMode', v as FloatingHeaderRightActionMode)
                }
                options={[
                  { value: 'minimize-only', label: '右侧: 仅 Minimize' },
                  { value: 'minimize-and-pin', label: '右侧: Pin + Minimize' },
                  { value: 'minimize-and-close', label: '右侧: Minimize + Close' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SliderControl
              label="标题字号 (headerTitleFontSize)"
              value={config.headerTitleFontSize}
              min={10}
              max={22}
              step={1}
              unit="px"
              editable
              colorScheme="amber"
              onChange={(v) => setParam('headerTitleFontSize', v)}
              isLight={isLight}
            />
            <SliderControl
              label="顶栏按钮宽度 (headerBtnWidth)"
              value={config.headerBtnWidth}
              min={18}
              max={56}
              step={1}
              unit="px"
              editable
              colorScheme="amber"
              onChange={(v) => setParam('headerBtnWidth', v)}
              isLight={isLight}
            />
            <SliderControl
              label="顶栏按钮高度 (headerBtnHeight)"
              value={config.headerBtnHeight}
              min={18}
              max={44}
              step={1}
              unit="px"
              editable
              colorScheme="amber"
              onChange={(v) => setParam('headerBtnHeight', v)}
              isLight={isLight}
            />
            <SliderControl
              label="Header 左右内衬 (headerPaddingX)"
              value={config.headerPaddingX}
              min={0}
              max={24}
              step={1}
              unit="px"
              editable
              colorScheme="sky"
              onChange={(v) => setParam('headerPaddingX', v)}
              isLight={isLight}
            />
            <SliderControl
              label="Header 上下内衬 (headerPaddingY)"
              value={config.headerPaddingY}
              min={0}
              max={20}
              step={1}
              unit="px"
              editable
              colorScheme="emerald"
              onChange={(v) => setParam('headerPaddingY', v)}
              isLight={isLight}
            />
            <SliderControl
              label="浮窗外框圆角 (outerRadius)"
              value={config.outerRadius}
              min={0}
              max={28}
              step={1}
              unit="px"
              editable
              colorScheme="amber"
              onChange={(v) => setParam('outerRadius', v)}
              isLight={isLight}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
            <div className="flex items-center gap-2 flex-wrap">
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={config.headerBtnRadiusMode}
                onValueChange={(v) =>
                  setParam('headerBtnRadiusMode', v as PanelHeaderBackBtnRadiusMode)
                }
                options={[
                  {
                    value: 'asymmetric-tl',
                    label: `外角同心+内角收敛 (${btnGeom.concentricRadius}/${btnGeom.innerRadius}px)`,
                  },
                  { value: 'auto', label: `四角同心 (${btnGeom.concentricRadius}px)` },
                  { value: 'custom', label: `四角手动 (${config.headerBtnCustomRadius}px)` },
                ]}
              />
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={config.headerBtnIdleTone}
                onValueChange={(v) =>
                  setParam('headerBtnIdleTone', v as PanelHeaderBackBtnIdleTone)
                }
                options={[
                  { value: 'match-header', label: '顶栏同色' },
                  { value: 'muted-gray', label: '默认暗灰' },
                  { value: 'elevated', label: '凸起亮底' },
                ]}
              />
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={config.headerBtnStyle}
                onValueChange={(v) => setParam('headerBtnStyle', v as PanelHeaderBackBtnStyle)}
                options={[
                  { value: 'surface', label: 'Surface 框线' },
                  { value: 'subtle', label: 'Subtle 无框' },
                ]}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={config.headerRightIconStyle}
                onValueChange={(v) =>
                  setParam('headerRightIconStyle', v as FloatingHeaderRightIconStyle)
                }
                options={[
                  { value: 'minus', label: '图标: Minus (-)' },
                  { value: 'minimize-2', label: '图标: Minimize2' },
                ]}
              />
              <ToggleSwitch
                checked={config.headerBtnExpandOnHover}
                onCheckedChange={(v) => setParam('headerBtnExpandOnHover', v)}
                label="Hover 展开 STACK 文字"
                variant="neutral"
                isLight={isLight}
              />
            </div>
          </div>
        </div>

        {/* Group 2: Stage 2 Content Body & Overflow */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-4 ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Stage 2 · Content Body 内衬、内部子页签与高度溢出策略
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <ToggleSwitch
                checked={config.showSubTabsBar}
                onCheckedChange={(v) => setParam('showSubTabsBar', v)}
                label="显示 Stage 2 UnderlineTabs 子页签栏"
                variant="neutral"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={config.showFloatingToolbar}
                onCheckedChange={(v) => setParam('showFloatingToolbar', v)}
                label="显示 FloatingWindowToolbar 精度条"
                variant="neutral"
                isLight={isLight}
              />
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={config.contentOverflowMode}
                onValueChange={(v) =>
                  setParam('contentOverflowMode', v as FloatingContentOverflowMode)
                }
                options={[
                  { value: 'scroll-y', label: '固定/可拉高度 + 纵向滚动 (scroll-y)' },
                  { value: 'auto-fit-height', label: '内容自适应高度 (auto-fit-height)' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SliderControl
              label="Content 左右内衬 (bodyPaddingX)"
              value={config.bodyPaddingX}
              min={0}
              max={32}
              step={1}
              unit="px"
              editable
              colorScheme="sky"
              onChange={(v) => setParam('bodyPaddingX', v)}
              isLight={isLight}
            />
            <SliderControl
              label="Content 上下内衬 (bodyPaddingY)"
              value={config.bodyPaddingY}
              min={0}
              max={32}
              step={1}
              unit="px"
              editable
              colorScheme="emerald"
              onChange={(v) => setParam('bodyPaddingY', v)}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Group 3: Stage 3 Footer & Split Right Slot */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-4 ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500">
              Stage 3 · Footer 底栏开关、Hover 说明联动与右侧分割槽 (Footer &amp; Split Right Slot)
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <ToggleSwitch
                checked={config.showFooter}
                onCheckedChange={(v) => {
                  updateParams({
                    showFooter: v,
                    variant: v ? 'three-stage-split-footer-grip' : 'two-stage-l2-header',
                  });
                }}
                label="启用 Stage 3 Footer 底栏"
                variant="neutral"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={config.footerHoverLinkage}
                onCheckedChange={(v) => setParam('footerHoverLinkage', v)}
                label="启用控件 Hover 高亮说明联动"
                variant="neutral"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={config.footerRightDivider}
                onCheckedChange={(v) => setParam('footerRightDivider', v)}
                label="右侧槽分割线 (border-l)"
                variant="neutral"
                isLight={isLight}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-neutral-400">
              Footer 右侧独立槽模式 (footerRightSlotMode):
            </span>
            <SegmentedSwitch
              size="sm"
              isLight={isLight}
              value={config.footerRightSlotMode}
              onValueChange={(v) =>
                setParam('footerRightSlotMode', v as FloatingFooterRightSlotMode)
              }
              options={[
                { value: 'carved-resize-grip', label: '雕刻 Resize 拖拽槽 (W×H + ◢)' },
                { value: 'live-dimensions', label: '纯尺寸遥测读数 (W×Hpx)' },
                { value: 'shortcut-badge', label: '快捷键槽 (Stack [ESC])' },
                { value: 'none', label: '无右侧槽 (通栏说明)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SliderControl
              label="Footer 字号 (footerFontSize)"
              value={config.footerFontSize}
              min={9}
              max={16}
              step={1}
              unit="px"
              editable
              colorScheme="amber"
              onChange={(v) => setParam('footerFontSize', v)}
              isLight={isLight}
            />
            <SliderControl
              label="Footer 左右内衬 (footerPaddingX)"
              value={config.footerPaddingX}
              min={0}
              max={28}
              step={1}
              unit="px"
              editable
              colorScheme="sky"
              onChange={(v) => setParam('footerPaddingX', v)}
              isLight={isLight}
            />
            <SliderControl
              label="Footer 上下内衬 (footerPaddingY)"
              value={config.footerPaddingY}
              min={0}
              max={18}
              step={1}
              unit="px"
              editable
              colorScheme="emerald"
              onChange={(v) => setParam('footerPaddingY', v)}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Group 4: Resize Physics, Curved Corner Dragger & Min/Max Bounds */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-4 ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Stage 4 · 右下角圆弧缩放握把几何与尺寸边界物理 (Curved Corner Dragger &amp; Bounds Physics)
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <ToggleSwitch
                checked={config.resizable}
                onCheckedChange={(v) => setParam('resizable', v)}
                label="允许调整窗口尺寸 (Resizable)"
                variant="neutral"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={config.limitMaxSize}
                onCheckedChange={(v) => setParam('limitMaxSize', v)}
                label="限制最大宽高 (Limit Max W×H)"
                variant="neutral"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={config.enableRightEdgeResize}
                onCheckedChange={(v) => setParam('enableRightEdgeResize', v)}
                label="右边缘单向拉宽 (ew-resize)"
                variant="neutral"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={config.enableBottomEdgeResize}
                onCheckedChange={(v) => setParam('enableBottomEdgeResize', v)}
                label="下边缘单向拉高 (ns-resize)"
                variant="neutral"
                isLight={isLight}
              />
              <ToggleSwitch
                checked={config.showResizeHudOverlay}
                onCheckedChange={(v) => setParam('showResizeHudOverlay', v)}
                label="拖拽时显示顶部实时尺寸 HUD"
                variant="neutral"
                isLight={isLight}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-neutral-400">
              右下角缩放握把与热区策略 (resizeHandleStyle):
            </span>
            <SegmentedSwitch
              size="sm"
              isLight={isLight}
              value={config.resizeHandleStyle}
              onValueChange={(v) =>
                setParam('resizeHandleStyle', v as FloatingResizeHandleStyle)
              }
              options={[
                { value: 'corner-arc', label: '同心单圆弧 (corner-arc · 默认)' },
                { value: 'corner-arc-dots', label: '同心圆弧三点 (corner-arc-dots)' },
                { value: 'corner-double-arc', label: '双重同心弧 (corner-double-arc)' },
                { value: 'corner-pill-arc', label: '胶囊圆弧轨 (corner-pill-arc)' },
                { value: 'corner-dots', label: '直角三点 (corner-dots)' },
                { value: 'footer-carved-slot', label: '底栏右端雕刻槽' },
              ]}
            />
          </div>

          {/* Curved Corner Dragger Fine-Tuning Controls */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
              isLight
                ? 'bg-amber-50/40 border-amber-200/80'
                : 'bg-amber-500/5 border-amber-500/20'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-500">
                右下角同心圆弧 Dragger 几何精调 (Concentric Corner Arc Geometry)
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <ToggleSwitch
                  checked={config.cornerArcConcentric}
                  onCheckedChange={(v) => setParam('cornerArcConcentric', v)}
                  label={`自动与外圆角同心 (R = ${config.outerRadius} - ${config.cornerArcInset} = ${Math.max(3, config.outerRadius - config.cornerArcInset)}px)`}
                  variant="neutral"
                  isLight={isLight}
                />
                <SegmentedSwitch
                  size="sm"
                  isLight={isLight}
                  value={config.cornerArcColorMode}
                  onValueChange={(v) =>
                    setParam('cornerArcColorMode', v as FloatingCornerArcColorMode)
                  }
                  options={[
                    { value: 'neutral', label: '静置中性灰 (Hover 亮起)' },
                    { value: 'amber', label: '琥珀金 (Amber)' },
                    { value: 'sky', label: '天际蓝 (Sky)' },
                    { value: 'emerald', label: '翡翠绿 (Emerald)' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SliderControl
                label="右下角内缩边距 (cornerArcInset)"
                value={config.cornerArcInset}
                min={1.5}
                max={10}
                step={0.5}
                unit="px"
                editable
                colorScheme="amber"
                onChange={(v) => setParam('cornerArcInset', v)}
                isLight={isLight}
              />
              <SliderControl
                label="圆弧张角跨度 (cornerArcSweepDeg)"
                value={config.cornerArcSweepDeg}
                min={32}
                max={88}
                step={2}
                unit="°"
                editable
                colorScheme="sky"
                onChange={(v) => setParam('cornerArcSweepDeg', v)}
                isLight={isLight}
              />
              <SliderControl
                label="圆弧线宽/点径 (cornerArcStrokeWidth)"
                value={config.cornerArcStrokeWidth}
                min={1.4}
                max={4.2}
                step={0.1}
                unit="px"
                editable
                colorScheme="emerald"
                onChange={(v) => setParam('cornerArcStrokeWidth', v)}
                isLight={isLight}
              />
              <SliderControl
                label="静置不透明度 (cornerArcIdleOpacity)"
                value={config.cornerArcIdleOpacity}
                min={20}
                max={100}
                step={5}
                unit="%"
                editable
                colorScheme="amber"
                onChange={(v) => setParam('cornerArcIdleOpacity', v)}
                isLight={isLight}
              />
            </div>

            {!config.cornerArcConcentric && (
              <div className="max-w-xs">
                <SliderControl
                  label="手动圆弧半径 (cornerArcRadius)"
                  value={config.cornerArcRadius}
                  min={4}
                  max={24}
                  step={1}
                  unit="px"
                  editable
                  colorScheme="amber"
                  onChange={(v) => setParam('cornerArcRadius', v)}
                  isLight={isLight}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SliderControl
              label="最小宽度 (minWidth)"
              value={config.minWidth}
              min={220}
              max={480}
              step={10}
              unit="px"
              editable
              colorScheme="amber"
              onChange={(v) => setParam('minWidth', v)}
              isLight={isLight}
            />
            <SliderControl
              label="最小高度 (minHeight)"
              value={config.minHeight}
              min={140}
              max={360}
              step={10}
              unit="px"
              editable
              colorScheme="amber"
              onChange={(v) => setParam('minHeight', v)}
              isLight={isLight}
            />
            {config.limitMaxSize ? (
              <>
                <SliderControl
                  label="最大宽度 (maxWidth)"
                  value={config.maxWidth}
                  min={520}
                  max={1400}
                  step={20}
                  unit="px"
                  editable
                  colorScheme="sky"
                  onChange={(v) => setParam('maxWidth', v)}
                  isLight={isLight}
                />
                <SliderControl
                  label="最大高度 (maxHeight)"
                  value={config.maxHeight}
                  min={360}
                  max={1000}
                  step={20}
                  unit="px"
                  editable
                  colorScheme="emerald"
                  onChange={(v) => setParam('maxHeight', v)}
                  isLight={isLight}
                />
              </>
            ) : (
              <div
                className={`sm:col-span-2 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  isLight
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                }`}
              >
                <div>
                  <div className="font-bold">最大宽高限制已解除 (Unrestricted Max W×H)</div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    当前拖拽右下角圆弧握把时仅受最小尺寸 ({config.minWidth}×{config.minHeight}px) 保护，不再钳制最大宽高。
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  isLight={isLight}
                  onClick={() => setParam('limitMaxSize', true)}
                >
                  开启上限钳制
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 (6D+.4): Side-by-Side Anatomy Shootout
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="fw-3stage-6d-4-shootout"
        className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-2xs'
            : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-rose-500/15 text-rose-500 border border-rose-500/30">
              6D+.4
            </span>
            <Layers className="h-4 w-4 text-rose-500" />
            <h2 className="text-base font-bold">
              三种悬浮窗壳体结构同屏对照 (Classic 6D vs 2-Stage L2 Header vs 3-Stage Full Combiner)
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            直观对比为什么 3-Stage Combiner + Footer 雕刻槽能消除右上角与右下角的视觉割裂
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {(
            [
              {
                code: 'A · Classic 6D Baseline',
                title: '现行 6D 悬浮窗壳体',
                variant: 'classic-6d-baseline' as FloatingShellVariant,
                points: [
                  'Header：左对齐图标+标题，右侧 20×20 小减号按钮',
                  'Content：直接包裹内容，无统一 Stage 2 光学衬距契约',
                  'Footer：无底栏，控件缺少悬停上下文说明区',
                  'Resize：右下角悬浮三点角标，偶发与底部内容重叠',
                ],
                presetId: 'var-classic-6d-baseline',
              },
              {
                code: 'B · 2-Stage L2 Header',
                title: 'L2 顶栏 + 弹性内容 (无 Footer)',
                variant: 'two-stage-l2-header' as FloatingShellVariant,
                points: [
                  'Header：升级为 L2 居中大写标题 + 42×32 贴边单分割线按钮',
                  'Content：继承 L2 bodyPaddingX/Y，支持内部滚动',
                  'Footer：省去底栏，把全部垂直高度留给高频遥测图表',
                  'Resize：右/下隐形边缘 + 右下角点阵手柄',
                ],
                presetId: 'var-two-stage-l2-header',
              },
              {
                code: 'C · 3-Stage Full Combiner (推荐)',
                title: '完整三段式 + Footer 雕刻 Resize 槽',
                variant: 'three-stage-split-footer-grip' as FloatingShellVariant,
                points: [
                  'Header：L2 标准居中标题 + 左侧分类图标/Back + 右侧同心 Minimize',
                  'Content：flex-1 min-h-0 独立滚动，绝不撑破或挤压底栏',
                  'Footer：左侧 Idle 灰字 / Hover 高亮说明，与 L2–L4 菜单 100% 统一',
                  'Resize：右侧分割槽专属承载 W×H + ◢ 手柄，彻底根除角标遮挡！',
                ],
                presetId: 'var-b-split-footer-grip',
              },
            ] as const
          ).map((col) => {
            const isSelected = config.variant === col.variant;
            return (
              <div
                key={col.code}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-4 ${
                  isSelected
                    ? isLight
                      ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/25'
                    : isLight
                    ? 'bg-neutral-50/70 border-neutral-200'
                    : 'bg-neutral-950/60 border-neutral-800'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      {col.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => applyPreset(col.presetId)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950'
                          : isLight
                          ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                          : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {isSelected ? '当前画布正在使用' : '在上方画布加载'}
                    </button>
                  </div>
                  <h3 className="font-bold text-sm">{col.title}</h3>
                  <ul
                    className={`text-xs space-y-1.5 list-disc list-inside ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}
                  >
                    {col.points.map((pt) => (
                      <li key={pt} className="leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
