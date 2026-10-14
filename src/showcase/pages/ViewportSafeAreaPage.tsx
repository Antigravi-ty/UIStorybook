import React, { useState } from 'react';
import {
  Monitor,
  ShieldAlert,
  Sparkles,
  Maximize2,
  Sliders,
  RotateCcw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { GameViewport, SafeAreaHud, useViewportStore, viewportStore } from '../../viewport';
import { SliderControl } from '../../primitives/SliderControl';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { CodeBlock } from '../CodeBlock';

interface AspectPreset {
  id: string;
  label: string;
  ratioLabel: string;
  width: number;
  height: number;
  desc: string;
}

const ASPECT_PRESETS: AspectPreset[] = [
  {
    id: '32-9',
    label: '32:9 Super Ultrawide',
    ratioLabel: '3.55 : 1 (> 18:9)',
    width: 760,
    height: 214,
    desc: '超宽带鱼屏：自动触发 18:9 Pillarbox 钳制，两侧生成暗色安全留白，防止 HUD 散落到视野边缘之外。',
  },
  {
    id: '21-9',
    label: '21:9 Ultrawide',
    ratioLabel: '2.33 : 1 (> 18:9)',
    width: 720,
    height: 308,
    desc: '影院超宽屏：渲染宽度钳制在 Hsafe × 2.0，左右自动计算对称 Pillarbox 边条。',
  },
  {
    id: '18-9',
    label: '18:9 Max Clamp Boundary',
    ratioLabel: '2.00 : 1 (临界上限)',
    width: 680,
    height: 340,
    desc: '最大原生支持宽高比上限：100% 充满安全区，0px Pillarbox。',
  },
  {
    id: '16-9',
    label: '16:9 Esports Standard',
    ratioLabel: '1.78 : 1 (标准横屏)',
    width: 640,
    height: 360,
    desc: '主流电竞显示器比例：完整渲染活动画布，无裁切无黑边。',
  },
  {
    id: '1-1',
    label: '1:1 Square Floor',
    ratioLabel: '1.00 : 1 (最窄底线)',
    width: 400,
    height: 400,
    desc: '允许的最窄纵横比底线：正常工作，未触发竖屏拦截。',
  },
  {
    id: '9-16',
    label: '3:4 / 9:16 Portrait',
    ratioLabel: '0.75 : 1 (< 1:1 拦截)',
    width: 320,
    height: 420,
    desc: '窄于 1:1 比例：自动触发 Portrait Gate 竖屏拦截警告遮罩，保护复杂横屏遥测面板不发生挤压崩坏。',
  },
];

export const ViewportSafeAreaPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const { safeAreaMargin, renderScale, showSafeAreaGuides } = useViewportStore();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('21-9');

  const activePreset = ASPECT_PRESETS.find((p) => p.id === selectedPresetId) ?? ASPECT_PRESETS[1];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Layer 5 · 5C Viewport & Safe Area (视口与安全区专属单元)</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          5C. Viewport & Safe Area 视口钳制与安全区引擎
        </h1>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          对标 <code className="font-mono">RLCleanWASM</code> 视口几何规范（<code className="font-mono">src/viewport/</code>）：
          提供 <strong>18:9 超宽屏 Pillarbox 钳制</strong>、<strong>1:1 Portrait Gate 竖屏底线拦截</strong>、以及 <strong>-5% ~ +10% Safe Area Margin（含负值过扫描 Overscan Bleed）</strong>。
          作为 L5C 独立子系统，与 5A (Match HUD)、5B (Charts)、5D (Loading) 完全正交解耦。
        </p>
      </div>

      {/* 1. Interactive Global Safe Area & Scaling Telemetry Control */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Sliders className="h-4 w-4 text-amber-500" />
            <span>1. 全局 Safe Area Margin (-5% ~ +10%) 与 Content Scaling 实时控制器</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showSafeAreaGuides ? 'primary' : 'secondary'}
              isLight={isLight}
              icon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => viewportStore.toggleSafeAreaGuides()}
            >
              {showSafeAreaGuides ? '隐藏安全区标线 (HUD On)' : '显示安全区标线 (HUD Off)'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isLight={isLight}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => {
                viewportStore.setSafeAreaMargin(0);
                viewportStore.setRenderScale(100);
              }}
            >
              重置 (0% / 100%)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <SliderControl
              label="Safe Area Margin (外框安全边距 / 过扫描)"
              value={safeAreaMargin}
              min={-5}
              max={10}
              step={1}
              origin={0}
              variation="centered"
              showSign
              unit="%"
              colorScheme="amber"
              negativeColorScheme="rose"
              onChange={(v) => viewportStore.setSafeAreaMargin(v)}
              isLight={isLight}
            />
            <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              • 正值 (0% ~ +10%)：四边向内安全缩进，避开曲面屏/电视切角。<br />
              • 负值 (-5% ~ 0%)：向物理视窗外扩展过扫描 (Overscan Bleed)。
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <SliderControl
              label="Content Render Scale (内容区等比缩放)"
              value={renderScale}
              min={50}
              max={150}
              step={5}
              origin={100}
              variation="centered"
              unit="%"
              colorScheme="emerald"
              onChange={(v) => viewportStore.setRenderScale(v)}
              isLight={isLight}
            />
            <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              • 仅作用于右侧主内容工作区，Header 与 Sidebar 严格固定 100% 原始尺寸。
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Aspect Ratio Clamp & Portrait Gate Simulator */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Monitor className="h-4 w-4 text-emerald-500" />
            <span>2. 18:9 Pillarbox 钳制与 1:1 Portrait Gate 交互式仿真沙盒</span>
          </div>
          <Badge variant="amber" size="sm" isLight={isLight}>
            {activePreset.ratioLabel}
          </Badge>
        </div>

        {/* Preset selector pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ASPECT_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPresetId(preset.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                }`}
              >
                <span className="text-xs font-bold truncate">{preset.label.split(' ')[0]}</span>
                <span className={`text-[10px] font-mono truncate ${isSelected ? 'text-amber-100' : 'text-neutral-400'}`}>
                  {preset.ratioLabel.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          <strong>当前模拟视窗 ({activePreset.width} × {activePreset.height}px)：</strong>
          {activePreset.desc}
        </p>

        {/* Simulated Viewport Frame */}
        <div
          className={`p-6 rounded-2xl border flex items-center justify-center overflow-x-auto ${
            isLight ? 'bg-neutral-100/80 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
          }`}
        >
          <div
            className="rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-xl transition-all duration-300 shrink-0"
            style={{
              width: `${activePreset.width}px`,
              height: `${activePreset.height}px`,
            }}
          >
            <GameViewport isLight={isLight} showTelemetry={true}>
              <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ACTIVE RENDER CANVAS (≤ 18:9)
                  </span>
                  <span className="text-neutral-400">
                    Container: {activePreset.width}×{activePreset.height}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center gap-1 text-center my-auto">
                  <CheckCircle2 className="h-6 w-6 text-amber-400" />
                  <span className="text-sm font-bold tracking-tight">
                    18:9 Clamped Safe Canvas
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 max-w-md">
                    HUD 锚点始终固定在此安全活性画布四角，超宽屏两侧自动生成 Pillarbox 护栏
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>BL Anchor: BallCam</span>
                  <span>BC Anchor: Speedometer</span>
                  <span>BR Anchor: BoostGauge</span>
                </div>
              </div>
            </GameViewport>
          </div>
        </div>
      </div>

      <CodeBlock
        isLight={isLight}
        title="5C. GameViewport & SafeAreaHud 标准调用示例"
        code={`import { GameViewport, SafeAreaHud, useViewportStore } from '@/viewport';

export const MatchStage = ({ isLight }: { isLight: boolean }) => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 物理屏幕级安全区辅助标线 */}
      <SafeAreaHud isLight={isLight} />

      {/* 自动执行 18:9 Pillarbox 钳制与 1:1 Portrait Gate 竖屏保护 */}
      <GameViewport isLight={isLight} showTelemetry>
        <MatchHudContainer ... />
      </GameViewport>
    </div>
  );
};`}
      />
    </div>
  );
};
