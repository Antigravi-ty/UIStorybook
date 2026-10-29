import React from 'react';
import { createScopedSyncedState } from '../stores';
import { Layers, Columns, Rows, Crosshair } from 'lucide-react';

const useState = createScopedSyncedState('page:stacks');
import { VStack, StackGap } from '../../layout/VStack';
import { HStack } from '../../layout/HStack';
import { GridStack } from '../../layout/GridStack';
import {
  HudAnchorStage,
  HudTopSplitBand,
  HudZone,
  HudSlot,
  HudRelativeAnchor,
  HudSlotMode,
} from '../../layout/HudAnchorStage';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { CodeBlock } from '../CodeBlock';

export const StacksPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [vGap, setVGap] = useState<StackGap>('md');
  const [hGap, setHGap] = useState<StackGap>('md');
  const [showDivider, setShowDivider] = useState(true);
  const [cols, setCols] = useState<2 | 3 | 4>(3);

  // Interactive L2 HudAnchorStage sandbox state
  const [slotMode, setSlotMode] = useState<HudSlotMode>('reserve');
  const [showTopBand, setShowTopBand] = useState(true);
  const [showBoostSlot, setShowBoostSlot] = useState(true);
  const [showTopBandGuide, setShowTopBandGuide] = useState(true);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          L2 空间布局容器 (HStack / VStack / GridStack / HudAnchorStage)
        </h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          纯结构空间骨骼层（零 L3–L7 业务依赖）。涵盖常规流式栈（VStack/HStack/GridStack）与专用于竞技 HUD 的九宫格等高切分舞台（HudAnchorStage / HudTopSplitBand / HudZone / HudSlot / HudRelativeAnchor）。
        </p>
      </div>

      {/* 1. VStack */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm flex items-center gap-2">
            <Rows className="h-4 w-4 text-amber-500" />
            <span>1. 垂直栈流 (VStack)</span>
          </span>
          <div className="flex items-center gap-3">
            <ToggleSwitch
              label="分割线"
              checked={showDivider}
              onCheckedChange={setShowDivider}
              isLight={isLight}
            />
            <SegmentedSwitch
              size="sm"
              value={vGap}
              onValueChange={(v) => setVGap(v as StackGap)}
              isLight={isLight}
              options={[
                { value: 'sm', label: '小 (sm / 1.0%)' },
                { value: 'md', label: '中 (md / 1.8%)' },
                { value: 'lg', label: '大 (lg / 2.8%)' },
              ]}
            />
          </div>
        </div>

        <VStack
          gap={vGap}
          divider={showDivider}
          isLight={isLight}
          className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <div
            className={`p-3 rounded-lg text-xs font-medium border transition-colors ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}
          >
            VStack Element A (Top Section)
          </div>
          <div
            className={`p-3 rounded-lg text-xs font-medium border transition-colors ${
              isLight
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
            }`}
          >
            VStack Element B (Middle Section)
          </div>
          <div
            className={`p-3 rounded-lg text-xs font-medium border transition-colors ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}
          >
            VStack Element C (Bottom Section)
          </div>
        </VStack>
      </div>

      {/* 2. HStack */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm flex items-center gap-2">
            <Columns className="h-4 w-4 text-emerald-500" />
            <span>2. 水平栈流 (HStack)</span>
          </span>
          <SegmentedSwitch
            size="sm"
            value={hGap}
            onValueChange={(v) => setHGap(v as StackGap)}
            isLight={isLight}
            options={[
              { value: 'sm', label: '小 (sm / 1.0%)' },
              { value: 'md', label: '中 (md / 1.8%)' },
              { value: 'lg', label: '大 (lg / 2.8%)' },
            ]}
          />
        </div>

        <HStack
          gap={hGap}
          isLight={isLight}
          className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <div
            className={`flex-1 p-3 rounded-lg text-xs font-medium text-center border transition-colors ${
              isLight ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs' : 'bg-neutral-800 border-neutral-700 text-neutral-200'
            }`}
          >
            Item 1
          </div>
          <div
            className={`flex-1 p-3 rounded-lg text-xs font-medium text-center border transition-colors ${
              isLight ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs' : 'bg-neutral-800 border-neutral-700 text-neutral-200'
            }`}
          >
            Item 2
          </div>
          <div
            className={`flex-1 p-3 rounded-lg text-xs font-medium text-center border transition-colors ${
              isLight ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs' : 'bg-neutral-800 border-neutral-700 text-neutral-200'
            }`}
          >
            Item 3
          </div>
        </HStack>
      </div>

      {/* 3. GridStack */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <span>3. 响应式网格阵列 (GridStack)</span>
          </span>
          <SegmentedSwitch
            size="sm"
            value={String(cols)}
            onValueChange={(v) => setCols(Number(v) as 2 | 3 | 4)}
            isLight={isLight}
            options={[
              { value: '2', label: '2 Cols' },
              { value: '3', label: '3 Cols' },
              { value: '4', label: '4 Cols' },
            ]}
          />
        </div>

        <GridStack cols={cols} gap="md">
          {Array.from({ length: cols * 2 }).map((_, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border text-center text-xs font-mono transition-colors ${
                isLight
                  ? 'bg-white border-neutral-200 text-neutral-700 shadow-2xs'
                  : 'bg-neutral-950/40 border-neutral-800 text-neutral-300'
              }`}
            >
              Grid Item #{i + 1}
            </div>
          ))}
        </GridStack>
      </div>

      {/* 4. HudAnchorStage + HudTopSplitBand + HudZone + HudSlot + HudRelativeAnchor */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-indigo-500" />
              <span>
                4. 九宫格锚点与顶栏等高三切分空间 (HudAnchorStage / HudTopSplitBand / HudZone / HudSlot / HudRelativeAnchor)
              </span>
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              纯 L2 几何骨架：顶栏 56px 共享高度（左 Telemetry 与右 40×40 Stack Icon + Bubble 垂直居中对齐，中 Scorebug 贴顶 top-0），消除魔法坐标耦合
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <SegmentedSwitch
              size="sm"
              value={slotMode}
              onValueChange={(v) => setSlotMode(v as HudSlotMode)}
              isLight={isLight}
              options={[
                { value: 'reserve', label: 'reserve (固定占坑)' },
                { value: 'collapse', label: 'collapse (流式补位)' },
              ]}
            />
            <ToggleSwitch
              label="显示 56px 顶栏参考线"
              checked={showTopBandGuide}
              onCheckedChange={setShowTopBandGuide}
              isLight={isLight}
            />
            <ToggleSwitch
              label="顶栏显隐"
              checked={showTopBand}
              onCheckedChange={setShowTopBand}
              isLight={isLight}
            />
            <ToggleSwitch
              label="Boost表盘显隐"
              checked={showBoostSlot}
              onCheckedChange={setShowBoostSlot}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Interactive Wireframe Stage */}
        <div
          className={`relative w-full h-[340px] rounded-2xl border overflow-hidden font-mono text-xs ${
            isLight
              ? 'bg-neutral-100/90 border-neutral-300 text-neutral-800'
              : 'bg-neutral-950 border-neutral-800 text-neutral-200'
          }`}
        >
          {/* Optional 56px Shared Top Split Band Visual Reference Guide */}
          {showTopBandGuide && (
            <div className="absolute top-0 inset-x-0 h-[56px] border-b border-dashed border-indigo-500/40 bg-indigo-500/5 pointer-events-none z-10 flex items-end justify-center pb-0.5">
              <span className="text-[9px] text-indigo-500 font-bold tracking-widest uppercase">
                HudTopSplitBand (56px Shared Vertical Space · items-center)
              </span>
            </div>
          )}

          <HudAnchorStage strategy={slotMode === 'reserve' ? 'reserve' : 'collapse-symmetric'}>
            {/* Top-Left Zone: 56px Telemetry Band + Left [1-3] Landmark */}
            <HudZone anchor="top-left" flush>
              <HudSlot
                visible={showTopBand}
                mode={slotMode}
                reservedHeight={56}
                innerClassName="h-[56px] flex items-center pl-3"
              >
                <div className="h-[26px] px-2.5 rounded-md border border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center text-[10px] font-bold">
                  [Left Container] Telemetry (26px · Centered in 56px)
                </div>
              </HudSlot>

              <div className="px-3 py-3 rounded-r-lg border-y border-r border-blue-500/50 bg-blue-500/15 text-blue-600 dark:text-blue-300 text-[10px] font-bold">
                [Left Landmark] Team 1-3 Strip (Starts at y=56px)
              </div>
            </HudZone>

            {/* Top-Center Zone: Flush top-0 Scorebug + Tiered Sub-Banners */}
            <HudZone anchor="top-center" flush>
              <div className="px-4 py-1.5 rounded-b-md border-x border-b border-neutral-400 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[10px] font-bold shadow-xs">
                [Center Container · top-0] Scorebug
              </div>
              <div className="-mt-[4px] pt-[6px] pb-1 px-3 rounded-b-md border-x border-b border-neutral-400 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 text-[9px]">
                Series Pips Banner (Tier 1)
              </div>
              <div className="-mt-[4px] pt-[6px] pb-1 px-3 rounded-b-md bg-red-600 text-white text-[9px] font-bold">
                Phase Drop-Banner (Tier 2 · OVERTIME)
              </div>
            </HudZone>

            {/* Top-Right Zone: 56px Stack Icon + Bubble + Right [4-6] Landmark */}
            <HudZone anchor="top-right" flush>
              <HudSlot
                visible={showTopBand}
                mode={slotMode}
                reservedHeight={56}
                innerClassName="h-[56px] flex items-center justify-end pr-3"
              >
                <div className="relative w-10 h-10 rounded-xl border border-amber-500/60 bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center text-[10px] font-bold">
                  Stack
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[9px] flex items-center justify-center font-extrabold">
                    4
                  </span>
                </div>
              </HudSlot>

              <div className="px-3 py-3 rounded-l-lg border-y border-l border-orange-500/50 bg-orange-500/15 text-orange-600 dark:text-orange-300 text-[10px] font-bold">
                [Right Landmark] Team 4-6 Strip (Starts at y=56px)
              </div>
            </HudZone>

            {/* Bottom-Left Zone */}
            <HudZone anchor="bottom-left">
              <div className="px-3 py-1.5 rounded-lg border border-neutral-400/50 bg-neutral-500/10 text-[10px] font-bold">
                [Bottom-Left] BallCam
              </div>
            </HudZone>

            {/* Bottom-Center Zone: Velocity Bar + Top-Left Aligned Full-Container Flip Pill */}
            <HudZone anchor="bottom-center">
              <HudRelativeAnchor
                placement="top"
                align="start"
                gap={8}
                floating
                attachment={
                  <div className="relative overflow-hidden px-2.5 py-1 rounded-md border border-emerald-500/60 bg-neutral-900/80 text-white text-[10px] font-bold">
                    <div className="absolute inset-y-0 left-0 w-[72%] bg-emerald-500/40" />
                    <span className="relative z-10">FlipPill (top + align=start · 160-step fill)</span>
                  </div>
                }
              >
                <div className="w-[260px] py-1.5 px-3 rounded-md border border-sky-500/50 bg-sky-500/15 text-sky-600 dark:text-sky-300 text-center text-[10px] font-bold">
                  [Bottom-Center] VelocityProgressBar
                </div>
              </HudRelativeAnchor>
            </HudZone>

            {/* Bottom-Right Zone: Notification anchored above Reserved Boost Slot */}
            <HudZone anchor="bottom-right" flush className="pb-3">
              <div className="mb-2 px-3 py-1.5 rounded-l-md border-y border-l border-sky-500/50 bg-sky-500/15 text-sky-600 dark:text-sky-300 text-[10px] font-bold">
                [Notification] Above Reserved Boost Slot
              </div>
              <HudSlot visible={showBoostSlot} mode="reserve" innerClassName="pr-4">
                <div className="w-20 h-20 rounded-full border-2 border-amber-500/60 bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center text-center text-[10px] font-bold p-2">
                  Boost Slot (reserve)
                </div>
              </HudSlot>
            </HudZone>
          </HudAnchorStage>
        </div>
      </div>

      {/* Code Snippet */}
      <CodeBlock
        isLight={isLight}
        title="Agent 代码配方 (Stack & HudAnchorStage Layout Recipe)"
        code={`import {
  VStack,
  HStack,
  GridStack,
  HudAnchorStage,
  HudZone,
  HudSlot,
  HudRelativeAnchor,
} from '@/layout';

// 1. 顶栏 56px 共享垂直空间 (左 Telemetry 与右 40x40 Stack Icon + Bubble 垂直居中对齐)
<HudAnchorStage strategy="reserve">
  <HudZone anchor="top-left" flush>
    <HudSlot visible={showTelemetry} mode="reserve" reservedHeight={56} innerClassName="h-[56px] flex items-center pl-3">
      <CompactTelemetryBarHUD />
    </HudSlot>
    <EdgePlayerHudStrip side="left" />
  </HudZone>

  {/* 2. Second Flip 全容器进度条默认位于速度表正上方且左边缘对齐 */}
  <HudZone anchor="bottom-center">
    <HudRelativeAnchor
      placement="top"
      align="start"
      gap={8}
      floating
      attachment={<FlipIndicatorPillHUD />}
    >
      <VelocityProgressBar />
    </HudRelativeAnchor>
  </HudZone>
</HudAnchorStage>`}
      />
    </div>
  );
};
