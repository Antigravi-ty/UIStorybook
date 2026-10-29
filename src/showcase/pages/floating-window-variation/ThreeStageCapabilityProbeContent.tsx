import React from 'react';
import {
  Sliders,
  Maximize2,
  Activity,
  Gauge,
  Compass,
  Wrench,
} from 'lucide-react';
import { type FloatingThreeStageRenderContext } from '../../components/FloatingThreeStageWindow';
import { FloatingWindowToolbar } from '../../../panels/FloatingWindowToolbar';
import { Button } from '../../../primitives/Button';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../../primitives/SegmentedSwitch';
import { UnderlineTabs } from '../../../primitives/UnderlineTabs';
import { SettingActionRow } from '../../../primitives/SettingActionRow';

export const PROBE_WINDOW_ID = '3stage-capability-probe';

export interface ProbeContentProps {
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
export const ThreeStageCapabilityProbeContent: React.FC<ProbeContentProps> = ({
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
