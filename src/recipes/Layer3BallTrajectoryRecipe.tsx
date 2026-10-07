import React, { useState } from 'react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { SliderControl } from '../primitives/SliderControl';
import { ToggleSwitch } from '../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../primitives/SegmentedSwitch';
import { Badge } from '../primitives/Badge';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { Card } from '../layout/Card';
import { VStack } from '../layout/VStack';
import { 
  Activity, 
  Eye, 
  ChevronRight, 
  Minimize2, 
  Sparkles, 
  Sliders, 
  Check, 
  Info 
} from 'lucide-react';

export interface Layer3BallTrajectoryRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  onCollapsePreview?: () => void;
  transparent?: boolean;
}

/**
 * [Recipe] Layer 3 Ball Trajectory Predictor Configuration Panel (Width: 480px)
 * Supports Live Preview with Tab key collapse/expand.
 * Tuning parameters:
 * - Trajectory Draw Duration (0.5s - 5.0s)
 * - Trajectory Color (Warm Amber / Cyan Neon / Apple Green / Monochromatic White)
 * - Collision Bounce Point Marker
 * - Air Drag & Magnus Spin Simulation Visualizer
 * - Real-time Sub-Tick Precision
 */
export const Layer3BallTrajectoryRecipe: React.FC<Layer3BallTrajectoryRecipeProps> = ({
  isLight = false,
  onBack,
  onCollapsePreview,
  transparent = false,
}) => {
  // Trajectory Prediction Parameters
  const [trajectoryDuration, setTrajectoryDuration] = useState(2.5); // seconds
  const [renderColor, setRenderColor] = useState('amber');
  const [showBounceMarkers, setShowBounceMarkers] = useState(true);
  const [showSpinVector, setShowSpinVector] = useState(true);
  const [decayFade, setDecayFade] = useState(true);
  const [subTickPrecision, setSubTickPrecision] = useState('high');

  return (
    <PanelContainer isLight={isLight} transparent={transparent} className="w-full max-w-[480px]">
      <PanelHeader
        title="BALL TRAJECTORY PREDICTOR"
        subtitle="Live Preview Ready • Tab to Collapse/Expand"
        badge={
          <Badge variant="amber" size="sm" isLight={isLight}>
            LIVE PREVIEW
          </Badge>
        }
        onBack={onBack}
        isLight={isLight}
        rightElement={
          <button
            type="button"
            onClick={onCollapsePreview}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
            }`}
            title="Press TAB or click to collapse to side dock"
          >
            <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
            <span className="hidden sm:inline">Live Mode</span>
          </button>
        }
      />

      <PanelContent scrollable className="p-6 h-[380px] overflow-y-auto">
        <VStack gap="lg" isLight={isLight}>
          {/* Live Preview Notification Pill */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              isLight
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-500 shrink-0" />
              <span>按键盘 <strong>TAB</strong> 可将此窗口快速折叠至右侧边栏并恢复游戏背景渲染</span>
            </div>
            <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
          </div>

          {/* 1. Trajectory Draw Duration */}
          <SliderControl
            label="Trajectory Horizon (预测时长)"
            value={trajectoryDuration}
            min={0.5}
            max={5.0}
            step={0.1}
            unit="s"
            description="前瞻模拟计算绘制球体未来飞行轨迹秒数"
            onChange={setTrajectoryDuration}
            colorScheme="amber"
            isLight={isLight}
          />

          {/* 2. Color Scheme Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                Trajectory Glow Color (轨迹弧光色调)
              </span>
              <span className="text-[11px] font-mono text-neutral-400">Neutral & Soft</span>
            </div>
            <SegmentedSwitch
              value={renderColor}
              onValueChange={setRenderColor}
              isLight={isLight}
              options={[
                { value: 'amber', label: 'Warm Amber' },
                { value: 'white', label: 'Monochrome' },
                { value: 'green', label: 'Apple Green' },
                { value: 'cyan', label: 'Neon Cyan' },
              ]}
            />
          </div>

          {/* 3. Bounce Markers & Spin Simulation */}
          <Card isLight={isLight} variant="outlined" className="p-4 flex flex-col gap-3">
            <span className="text-xs font-bold tracking-tight mb-1">物理触地与微操辅助 (Physics Markers)</span>
            
            <ToggleSwitch
              label="Bounce Impact Rings (球体弹跳落点环)"
              description="在地面与球门框标出即将发生反弹的高光预测光圈"
              checked={showBounceMarkers}
              onCheckedChange={setShowBounceMarkers}
              variant="orange"
              isLight={isLight}
            />

            <ToggleSwitch
              label="Magnus Spin Vector (马格努斯旋转向量)"
              description="可视化空气阻力与自旋对弧线落点的真实偏移修正"
              checked={showSpinVector}
              onCheckedChange={setShowSpinVector}
              variant="orange"
              isLight={isLight}
            />

            <ToggleSwitch
              label="Decay Fade-Out (远端轨迹透明衰减)"
              description="避免远端轨迹遮挡前方视线"
              checked={decayFade}
              onCheckedChange={setDecayFade}
              variant="orange"
              isLight={isLight}
            />
          </Card>

          {/* 4. Sub-Tick Precision */}
          <div className="flex flex-col gap-1.5">
            <span className={`text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
              Physics Solver Steps (解算细分精度)
            </span>
            <SegmentedSwitch
              value={subTickPrecision}
              onValueChange={setSubTickPrecision}
              isLight={isLight}
              options={[
                { value: 'standard', label: '60Hz Standard' },
                { value: 'high', label: '120Hz Sub-Tick' },
                { value: 'simd', label: '240Hz WASM SIMD' },
              ]}
            />
          </div>
        </VStack>
      </PanelContent>

      <PanelFooter hint="TAB to Preview" isLight={isLight}>
        <div className="flex items-center gap-1.5 text-[11px] opacity-75 font-mono">
          <Activity className="h-3.5 w-3.5 text-amber-500" />
          <span>Calculated: {trajectoryDuration.toFixed(1)}s Horizon</span>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
};
