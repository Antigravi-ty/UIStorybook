import React from 'react';
import { Sliders, Link2, Unlink2 } from 'lucide-react';
import {
  useFloatingThreeStageStore,
  type FloatingHeaderLeftSlotMode,
  type FloatingHeaderTitleAlign,
  type FloatingHeaderRightActionMode,
  type FloatingHeaderRightIconStyle,
  type FloatingFooterRightSlotMode,
  type FloatingResizeHandleStyle,
  type FloatingCornerArcColorMode,
  type FloatingContentOverflowMode,
} from '../../stores/floatingThreeStageStore';
import {
  resolvePanelHeaderBackBtnGeometry,
  type PanelHeaderBackBtnIdleTone,
  type PanelHeaderBackBtnRadiusMode,
  type PanelHeaderBackBtnStyle,
} from '../../../tokens/menuLayoutStore';
import { Button } from '../../../primitives/Button';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../../primitives/SegmentedSwitch';

export const FloatingWindowParameterTunerSection: React.FC<{ isLight: boolean }> = ({
  isLight,
}) => {
  const config = useFloatingThreeStageStore();
  const { setParam, updateParams, pullFromGlobalL2Shell } = config;

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
  );
};
