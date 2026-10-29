import React from 'react';
import {
  ShieldCheck,
  MoveDiagonal2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  useFloatingThreeStageStore,
  type FloatingShellVariant,
  type FloatingHeaderLeftSlotMode,
  type FloatingResizeHandleStyle,
} from '../../stores/floatingThreeStageStore';
import { CornerCurvedDragger } from '../../components/FloatingThreeStageWindow';
import { resolvePanelHeaderBackBtnGeometry } from '../../../tokens/menuLayoutStore';
import { Button } from '../../../primitives/Button';
import { Badge } from '../../../primitives/Badge';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';

export const FloatingWindowCornerDraggerStrip: React.FC<{ isLight: boolean }> = ({
  isLight,
}) => {
  const config = useFloatingThreeStageStore();
  const { setParam, updateParams } = config;

  return (
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
  );
};

export const FloatingWindowCapabilityMatrixSection: React.FC<{ isLight: boolean }> = ({
  isLight,
}) => {
  const config = useFloatingThreeStageStore();
  const { setParam, updateParams } = config;

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
  );
};

export const FloatingWindowShootoutSection: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const config = useFloatingThreeStageStore();
  const { applyPreset } = config;

  return (
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
  );
};
