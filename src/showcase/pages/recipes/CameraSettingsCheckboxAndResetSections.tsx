import React, { useState } from 'react';
import { CheckSquare, RotateCcw, Eye } from 'lucide-react';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../../primitives/SegmentedSwitch';
import { Checkbox } from '../../../primitives/Checkbox';
import { Badge } from '../../../primitives/Badge';
import { CodeBlock } from '../../CodeBlock';
import { Layer3CameraRecipe } from '../../../recipes/Layer3CameraRecipe';
import {
  useCameraSettingsStyleStore,
  type CameraBooleanControlType,
  type CameraCheckboxPlacement,
  type CameraCheckboxColorVariant,
  type CameraCheckboxIconStyle,
  type CameraCheckboxAnimStyle,
  type CameraResetButtonMode,
  type CameraResetButtonStyle,
  type CameraResetButtonWidthMode,
  type CameraResetConfirmMode,
} from '../../../tokens/cameraSettingsStyleStore';

export interface CameraSettingsCheckboxAndResetSectionsProps {
  isLight: boolean;
  sectionCardClass: string;
}

export const CameraSettingsCheckboxAndResetCards: React.FC<
  CameraSettingsCheckboxAndResetSectionsProps
> = ({ isLight, sectionCardClass }) => {
  const store = useCameraSettingsStyleStore();
  const [demoCheckboxA, setDemoCheckboxA] = useState(true);
  const [demoCheckboxB, setDemoCheckboxB] = useState(false);
  const [demoCheckboxC, setDemoCheckboxC] = useState(true);

  return (
    <>
      {/* 4. Checkbox Component & Placement Variations */}
      <div className={sectionCardClass}>
        <div className="flex items-center justify-between border-b pb-2 border-neutral-200/70 dark:border-neutral-800">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
            <span>4. Checkbox 排布形式与独立效果</span>
          </span>
          <Badge variant="amber" size="sm" isLight={isLight}>
            Checkbox Primitive
          </Badge>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            布尔开关控件类型 (Invert Swivel / Camera Shake)
          </span>
          <SegmentedSwitch
            value={store.booleanControlType}
            onValueChange={(v) =>
              store.setParam('booleanControlType', v as CameraBooleanControlType)
            }
            options={[
              { value: 'checkbox', label: 'Checkbox (新复选框)' },
              { value: 'toggle-switch', label: 'ToggleSwitch (传统开关)' },
            ]}
            size="sm"
            fullWidth
            isLight={isLight}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            Checkbox 排布位置 (挤在中轴 vs 单独抽离特殊形式)
          </span>
          <SegmentedSwitch
            value={store.checkboxPlacement}
            onValueChange={(v) =>
              store.setParam('checkboxPlacement', v as CameraCheckboxPlacement)
            }
            options={[
              { value: 'spine-left', label: '中轴左对齐' },
              { value: 'spine-center', label: '滑块列居中' },
              { value: 'centered-cluster', label: '独立并排居中' },
              { value: 'detached-card', label: '独立分组框' },
            ]}
            size="sm"
            fullWidth
            isLight={isLight}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            Checkbox 激活配色 (checkboxVariant)
          </span>
          <SegmentedSwitch
            value={store.checkboxVariant}
            onValueChange={(v) =>
              store.setParam('checkboxVariant', v as CameraCheckboxColorVariant)
            }
            options={[
              { value: 'amber', label: '琥珀' },
              { value: 'neutral', label: '黑白' },
              { value: 'sky', label: '天蓝' },
              { value: 'emerald', label: '翠绿' },
              { value: 'rose', label: '玫红' },
            ]}
            size="sm"
            fullWidth
            isLight={isLight}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SliderControl
            label="Checkbox 尺寸"
            min={14}
            max={26}
            step={1}
            value={store.checkboxSizePx}
            unit="px"
            showStepper={false}
            onChange={(v) => store.setParam('checkboxSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Checkbox 圆角"
            min={0}
            max={12}
            step={1}
            value={store.checkboxRadiusPx}
            unit="px"
            showStepper={false}
            onChange={(v) => store.setParam('checkboxRadiusPx', v)}
            isLight={isLight}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            Checkbox 勾选图标样式与动效
          </span>
          <div className="grid grid-cols-2 gap-2">
            <SegmentedSwitch
              value={store.checkboxIconStyle}
              onValueChange={(v) =>
                store.setParam('checkboxIconStyle', v as CameraCheckboxIconStyle)
              }
              options={[
                { value: 'check', label: '勾号' },
                { value: 'bold-check', label: '粗勾' },
                { value: 'dot', label: '实心点' },
              ]}
              size="sm"
              fullWidth
              isLight={isLight}
            />
            <SegmentedSwitch
              value={store.checkboxAnimationStyle}
              onValueChange={(v) =>
                store.setParam('checkboxAnimationStyle', v as CameraCheckboxAnimStyle)
              }
              options={[
                { value: 'spring-scale', label: '缩放' },
                { value: 'bounce', label: '回弹' },
                { value: 'crisp-fade', label: '瞬显' },
              ]}
              size="sm"
              fullWidth
              isLight={isLight}
            />
          </div>
        </div>

        <ToggleSwitch
          checked={store.checkboxShowStatusText}
          onCheckedChange={(v) => store.setParam('checkboxShowStatusText', v)}
          label="在 Checkbox 右侧附带显示 On / Off 状态文字"
          isLight={isLight}
        />
      </div>

      {/* 5. Big Reset Camera Defaults Button & Red Double-Check Dialogue */}
      <div className={sectionCardClass}>
        <div className="flex items-center justify-between border-b pb-2 border-neutral-200/70 dark:border-neutral-800">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
            <span>5. 底部 Reset 大按钮与红色 Dialogue</span>
          </span>
          <Badge variant="danger" size="sm" isLight={isLight}>
            Double-Check Reset
          </Badge>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            Reset 按钮形态 (带 Icon 大按钮 vs 传统行内小按钮)
          </span>
          <SegmentedSwitch
            value={store.resetButtonMode}
            onValueChange={(v) => store.setParam('resetButtonMode', v as CameraResetButtonMode)}
            options={[
              { value: 'big-button', label: '带 Icon 独立大按钮' },
              { value: 'compact-row', label: '传统行内小按钮' },
            ]}
            size="sm"
            fullWidth
            isLight={isLight}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            红色警示配色风格 (resetButtonStyle)
          </span>
          <SegmentedSwitch
            value={store.resetButtonStyle}
            onValueChange={(v) =>
              store.setParam('resetButtonStyle', v as CameraResetButtonStyle)
            }
            options={[
              { value: 'danger-subtle', label: '柔和红底' },
              { value: 'danger-solid', label: '实心红底' },
              { value: 'danger-outline', label: '红框描边' },
              { value: 'neutral-hover-danger', label: '悬停变红' },
            ]}
            size="sm"
            fullWidth
            isLight={isLight}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            大按钮水平宽度模式 (resetButtonWidthMode)
          </span>
          <SegmentedSwitch
            value={store.resetButtonWidthMode}
            onValueChange={(v) =>
              store.setParam('resetButtonWidthMode', v as CameraResetButtonWidthMode)
            }
            options={[
              { value: 'spine-width', label: '对齐中轴总宽' },
              { value: 'full-width', label: '100% 通栏大按钮' },
              { value: 'centered-auto', label: '居中紧凑大按钮' },
            ]}
            size="sm"
            fullWidth
            isLight={isLight}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            Double-Check 二次确认方式 (推荐弹出红色 Dialogue)
          </span>
          <SegmentedSwitch
            value={store.resetConfirmMode}
            onValueChange={(v) =>
              store.setParam('resetConfirmMode', v as CameraResetConfirmMode)
            }
            options={[
              { value: 'dialogue', label: '弹出红色 Dialogue (推荐)' },
              { value: 'inline-two-step', label: '按钮内二次点击确认' },
            ]}
            size="sm"
            fullWidth
            isLight={isLight}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SliderControl
            label="大按钮高度"
            min={30}
            max={52}
            step={2}
            value={store.resetButtonHeightPx}
            unit="px"
            showStepper={false}
            onChange={(v) => store.setParam('resetButtonHeightPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="大按钮圆角"
            min={4}
            max={20}
            step={1}
            value={store.resetButtonRadiusPx}
            unit="px"
            showStepper={false}
            onChange={(v) => store.setParam('resetButtonRadiusPx', v)}
            isLight={isLight}
          />
        </div>
      </div>

      {/* 6. Standalone L1 Checkbox Atomic Playground */}
      <div className={sectionCardClass}>
        <div className="flex items-center justify-between border-b pb-2 border-neutral-200/70 dark:border-neutral-800">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-emerald-500" />
            <span>6. 新组件 L1 Checkbox 独立交互沙盒</span>
          </span>
          <Badge variant="neutral" size="sm" isLight={isLight}>
            src/primitives/Checkbox.tsx
          </Badge>
        </div>

        <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          下方实时展示新抽离的原子组件 <code className="font-mono">Checkbox</code> 在不同尺寸、圆角、勾线与半选状态下的独立表现：
        </p>

        <div
          className={`p-3 rounded-xl border flex flex-col gap-3 ${
            isLight
              ? 'bg-white border-neutral-200'
              : 'bg-neutral-900/90 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Checkbox
              checked={demoCheckboxA}
              onCheckedChange={setDemoCheckboxA}
              label="Invert Swivel (当前样式)"
              variant={store.checkboxVariant}
              size={store.checkboxSizePx}
              radiusPx={store.checkboxRadiusPx}
              strokeWidth={store.checkboxStrokeWidth}
              iconStyle={store.checkboxIconStyle}
              animationStyle={store.checkboxAnimationStyle}
              isLight={isLight}
            />
            <Badge variant={demoCheckboxA ? 'amber' : 'neutral'} size="sm" isLight={isLight}>
              {demoCheckboxA ? 'Checked' : 'Unchecked'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Checkbox
              checked={demoCheckboxB}
              onCheckedChange={setDemoCheckboxB}
              label="Camera Shake (右对齐标签)"
              labelPosition="left"
              variant={store.checkboxVariant}
              size={store.checkboxSizePx}
              radiusPx={store.checkboxRadiusPx}
              strokeWidth={store.checkboxStrokeWidth}
              iconStyle={store.checkboxIconStyle}
              animationStyle={store.checkboxAnimationStyle}
              isLight={isLight}
            />
            <Badge variant={demoCheckboxB ? 'amber' : 'neutral'} size="sm" isLight={isLight}>
              labelPosition="left"
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
            <Checkbox
              checked={demoCheckboxC}
              onCheckedChange={setDemoCheckboxC}
              variant="emerald"
              size="sm"
              label="16px sm"
              isLight={isLight}
            />
            <Checkbox
              checked={demoCheckboxC}
              onCheckedChange={setDemoCheckboxC}
              variant="sky"
              size="md"
              label="18px md"
              isLight={isLight}
            />
            <Checkbox
              checked={demoCheckboxC}
              onCheckedChange={setDemoCheckboxC}
              variant="rose"
              size="lg"
              label="22px lg"
              isLight={isLight}
            />
            <Checkbox
              checked={true}
              indeterminate={true}
              onCheckedChange={() => {}}
              variant="amber"
              size="md"
              label="Indeterminate"
              isLight={isLight}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const CameraSettingsFooterPreview: React.FC<{
  isLight: boolean;
  showCode: boolean;
  showStandalonePreview: boolean;
}> = ({ isLight, showCode, showStandalonePreview }) => {
  const store = useCameraSettingsStyleStore();

  return (
    <>
      {showCode && (
        <CodeBlock
          isLight={isLight}
          title="cameraSettingsStyleStore.ts · 当前 Camera Settings 调优配置快照"
          code={store.exportConfigCode()}
        />
      )}

      {showStandalonePreview && (
        <div className="flex flex-col gap-3 pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ▼ 1:1 实时联动预览 (与 7A · Menu Layer 舞台中的 Camera Settings 100% 同步)
            </span>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              点击底部红色「{store.resetButtonLabel}」大按钮可直接触发 Dialogue 二次确认弹窗
            </span>
          </div>

          <div
            className={`flex justify-center p-6 rounded-2xl border transition-colors ${
              isLight
                ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
                : 'border-neutral-800 bg-neutral-950/60'
            }`}
          >
            <Layer3CameraRecipe isLight={isLight} />
          </div>
        </div>
      )}
    </>
  );
};
