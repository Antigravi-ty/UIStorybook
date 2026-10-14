import React, { useState } from 'react';
import { Layers, Columns, Rows } from 'lucide-react';
import { VStack, StackGap } from '../../layout/VStack';
import { HStack } from '../../layout/HStack';
import { GridStack } from '../../layout/GridStack';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { CodeBlock } from '../CodeBlock';

export const StacksPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [vGap, setVGap] = useState<StackGap>('md');
  const [hGap, setHGap] = useState<StackGap>('md');
  const [showDivider, setShowDivider] = useState(true);
  const [cols, setCols] = useState<2 | 3 | 4>(3);

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stack 栅格布局 (H/V/Grid)</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          彻底杜绝硬编码像素 (px) 漂移。统一以 Active Canvas 宽度的百分比为基准，划分为小 (sm / 1.0%)、中 (md / 1.8%)、大 (lg / 2.8%) 三个标准化尺寸，与 Badge 规范完全对齐。
        </p>
      </div>

      {/* 1. VStack */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between">
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
        <div className="flex items-center justify-between">
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
        <div className="flex items-center justify-between">
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

      {/* Code Snippet */}
      <CodeBlock
        isLight={isLight}
        title="Agent 代码配方 (Stack Layout Recipe)"
        code={`import { VStack, HStack, GridStack } from '@/components/layout';

// 1. 垂直流（带标准分割线）
<VStack gap="lg" divider isLight={isLight}>
  <ComponentA />
  <ComponentB />
</VStack>

// 2. 水平流（对齐与间隙严格遵循 Active Canvas 宽度百分比: sm=1.0%, md=1.8%, lg=2.8%）
<HStack gap="md" align="center" justify="between" isLight={isLight}>
  <span>Left Label</span>
  <KeycapBadge shortcut="ESC" isLight={isLight} />
</HStack>

// 3. 矩阵网格（车辆仓库/道具选择）
<GridStack cols={2} gap="md">
  <SelectableCard id="1" ... />
  <SelectableCard id="2" ... />
</GridStack>`}
      />
    </div>
  );
};
