import React, { useState } from 'react';
import { Sliders, RotateCcw, Copy, Check, Code2, Link2, Unlink2, Sparkles, } from 'lucide-react';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../../primitives/SegmentedSwitch';
import { Badge } from '../../../primitives/Badge';
import { Button } from '../../../primitives/Button';
import { CodeBlock } from '../../CodeBlock';
import { useMenuLayoutStore, resolvePanelHeaderBackBtnGeometry, type PanelHeaderBackBtnIdleTone, type PanelHeaderBackBtnRadiusMode, type PanelHeaderBackBtnStyle, type PanelHeaderRightBtnTransform } from '../../../tokens/menuLayoutStore';
import { PanelShellStagesTwoThree } from './PanelShellStagesTwoThree';

export interface PanelShellTunerProps {
  isLight?: boolean;
  title?: string;
  codeBadge?: string;
}

/**
 * 3-Stage Compound Panel Shell Tuner (Layer 2+ Standard Container)
 * Allows real-time customization of Header (font-size, decoupled back button width/height,
 * 4-mode corner radius strategy, visual surface style, right action button with Minimize-2 transform, gap, padding X/Y),
 * Content Container (padding X/Y), and Footer (font-size, padding X/Y, split right slot).
 * Persists directly to `localStorage` via `useMenuLayoutStore` so changes in L2 (PanelsPage)
 * and L6 (RecipesPage) immediately propagate across all Layer 2–4 recipes and L7 sandboxes.
 */
export const PanelShellTuner: React.FC<PanelShellTunerProps> = React.memo(({
  isLight = false,
  title = 'Layer 2+ 通用三段式面板壳体调优器 (3-Stage Compound Shell Tuner)',
  codeBadge = '6A.2S',
}) => {
  const {
    lockPanelPaddingX,
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderTitleFontSize,
    lockPanelHeaderBackBtnAspect,
    panelHeaderBackBtnWidth,
    panelHeaderBackBtnHeight,
    panelHeaderBackBtnShowArrow,
    panelHeaderBackBtnShowLabel,
    panelHeaderBackBtnIdleTone,
    panelHeaderBackBtnStyle,
    panelHeaderBackBtnRadiusMode,
    panelHeaderBackBtnRadius,
    panelHeaderBackBtnInnerRadius,
    panelHeaderBackBtnRadiusTL,
    panelHeaderBackBtnRadiusTR,
    panelHeaderBackBtnRadiusBR,
    panelHeaderBackBtnRadiusBL,
    panelHeaderShowRightBtn,
    panelHeaderRightBtnTransform,
    panelHeaderRightBtnExpandOnHover,
    panelOuterRadius,
    panelHeaderGap,
    panelBodyPaddingX,
    panelBodyPaddingY,
    panelFooterPaddingX,
    panelFooterPaddingY,
    panelFooterFontSize,
    panelFooterSplitRight,
    panelFooterRightDivider,
    panelFooterRightPaddingX,
    setToken,
    updateTokens,
    resetPanelShellTokens,
    exportPanelShellConfigCode,
  } = useMenuLayoutStore();

  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const btnGeom = resolvePanelHeaderBackBtnGeometry({
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderBackBtnWidth,
    panelHeaderBackBtnHeight,
    panelHeaderBackBtnRadiusMode,
    panelHeaderBackBtnRadius,
    panelHeaderBackBtnInnerRadius,
    panelHeaderBackBtnRadiusTL,
    panelHeaderBackBtnRadiusTR,
    panelHeaderBackBtnRadiusBR,
    panelHeaderBackBtnRadiusBL,
    panelOuterRadius,
  });

  const handleCopy = async () => {
    const code = exportPanelShellConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyBackBtnPreset = (preset: 'flush-divider' | 'asymmetric-rect' | 'apple-compact-rect' | 'concentric-square' | 'subtle-ghost') => {
    if (preset === 'flush-divider') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: false,
        panelHeaderPaddingX: 0,
        panelHeaderPaddingY: 0,
        panelHeaderBackBtnWidth: 42,
        panelHeaderBackBtnHeight: 32,
        panelHeaderGap: 10,
        panelHeaderBackBtnRadiusMode: 'asymmetric-tl',
        panelHeaderBackBtnInnerRadius: 0,
        panelHeaderBackBtnStyle: 'surface',
      });
    } else if (preset === 'asymmetric-rect') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: false,
        panelHeaderPaddingX: 6,
        panelHeaderPaddingY: 6,
        panelHeaderBackBtnWidth: 30,
        panelHeaderBackBtnHeight: 26,
        panelHeaderGap: 6,
        panelHeaderBackBtnRadiusMode: 'asymmetric-tl',
        panelHeaderBackBtnInnerRadius: 6,
        panelHeaderBackBtnStyle: 'surface',
      });
    } else if (preset === 'apple-compact-rect') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: false,
        panelHeaderPaddingX: 6,
        panelHeaderPaddingY: 6,
        panelHeaderBackBtnWidth: 30,
        panelHeaderBackBtnHeight: 24,
        panelHeaderGap: 6,
        panelHeaderBackBtnRadiusMode: 'custom',
        panelHeaderBackBtnRadius: 7,
        panelHeaderBackBtnStyle: 'surface',
      });
    } else if (preset === 'concentric-square') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: true,
        panelHeaderPaddingX: 6,
        panelHeaderPaddingY: 6,
        panelHeaderBackBtnWidth: 26,
        panelHeaderBackBtnHeight: 26,
        panelHeaderGap: 6,
        panelHeaderBackBtnRadiusMode: 'auto',
        panelHeaderBackBtnStyle: 'surface',
      });
    } else if (preset === 'subtle-ghost') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: false,
        panelHeaderPaddingX: 6,
        panelHeaderPaddingY: 6,
        panelHeaderBackBtnWidth: 28,
        panelHeaderBackBtnHeight: 24,
        panelHeaderGap: 6,
        panelHeaderBackBtnRadiusMode: 'asymmetric-tl',
        panelHeaderBackBtnInnerRadius: 6,
        panelHeaderBackBtnStyle: 'subtle',
      });
    }
  };

  return (
    <div id="panel-shell-tuner"
      className={`scroll-mt-6 p-5 md:p-6 rounded-2xl border flex flex-col gap-5 w-full transition-colors ${ isLight
      ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800' }`}>
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/70 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          {codeBadge && (
            <span className="px-2 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold font-mono text-xs shrink-0">
              {codeBadge}
            </span>
          )}
          <Sliders className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold">{title}</span>
          <Badge variant="amber" size="sm" isLight={isLight}>
            L2 ⇄ L6 ⇄ L7 全局联动
          </Badge>
          <span className={`text-[11px] font-mono ${ isLight ? 'text-neutral-500' : 'text-neutral-400' }`}>
            Header: {panelHeaderPaddingX}×{panelHeaderPaddingY}px ({panelHeaderTitleFontSize}px · Btn {btnGeom.width}×{btnGeom.height}px · R={btnGeom.radiusSummary}) · Body: {panelBodyPaddingX}×{panelBodyPaddingY}px · Footer: {panelFooterPaddingX}×{panelFooterPaddingY}px ({panelFooterFontSize}px)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            icon={<Code2 className="h-3.5 w-3.5" />}
            onClick={() => setShowCode((v) => !v)}
          >
            {showCode ? '隐藏配置代码' : '查看配置代码'}
          </Button>
          <Button
            size="sm"
            variant="primary"
            isLight={isLight}
            icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            onClick={handleCopy}
          >
            {copied ? '已复制 Shell 配置!' : 'Copy Shell Config'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isLight={isLight}
            icon={<RotateCcw className="h-3 w-3" />}
            onClick={resetPanelShellTokens}
          >
            重置默认
          </Button>
        </div>
      </div>

      {/* Horizontal Alignment Lock Toggle */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${ isLight
        ? 'bg-neutral-50 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800/80' }`}>
        <div className="flex items-center gap-2">
          {lockPanelPaddingX ? (
            <Link2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          ) : (
            <Unlink2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          )}
          <ToggleSwitch checked={lockPanelPaddingX} onCheckedChange={(v) => setToken('lockPanelPaddingX', v)}
            label="锁定水平边距对齐 (Lock Header / Tabs / Content / Footer Padding X)" variant="neutral" isLight={isLight} />
        </div>
        <span className={`text-[11px] font-mono ${ isLight ? 'text-neutral-500' : 'text-neutral-400' }`}>
          {lockPanelPaddingX
            ? `已锁定统一左对齐基线 (${panelHeaderPaddingX}px)`
            : '已解锁：允许 Header / Content / Footer 独立设置不同水平 Padding'}
        </span>
      </div>

      {/* Stage 1: Header Typography, Back Button W×H & Paddings */}
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            Stage 1 · Header 居中标题、左侧返回键 & 右上角 Minimize-2 (Hover 变 Live Preview)
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            <ToggleSwitch checked={panelHeaderBackBtnShowArrow}
              onCheckedChange={(v) => setToken('panelHeaderBackBtnShowArrow', v)} label="显示箭头 (Show Arrow)"
              variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={panelHeaderBackBtnShowLabel}
              onCheckedChange={(v) => setToken('panelHeaderBackBtnShowLabel', v)} label="显示 BACK (Show Back)"
              variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={lockPanelHeaderBackBtnAspect}
              onCheckedChange={(v) => setToken('lockPanelHeaderBackBtnAspect', v)} label="锁定 1:1 正方形 (Lock W=H)"
              variant="neutral" isLight={isLight} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <SliderControl label="标题字号 (titleFontSize)" value={panelHeaderTitleFontSize} min={8} max={28} step={1}
            unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
            onChange={(v) => setToken('panelHeaderTitleFontSize', v)} isLight={isLight} />
          <SliderControl label="返回按钮宽度 (backBtnWidth)" value={panelHeaderBackBtnWidth} min={12} max={56} step={1}
            unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
            onChange={(v) => setToken('panelHeaderBackBtnWidth', v)} isLight={isLight} />
          <SliderControl label="返回按钮高度 (backBtnHeight)" value={panelHeaderBackBtnHeight} min={12} max={44} step={1}
            unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
            onChange={(v) => setToken('panelHeaderBackBtnHeight', v)} isLight={isLight} />
          <SliderControl label="按钮与标题间距 (headerGap)" value={panelHeaderGap} min={0} max={24} step={1} unit="px"
            editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
            onChange={(v) => setToken('panelHeaderGap', v)} isLight={isLight} />
          <SliderControl label="Header 左右内衬 (padX)" value={panelHeaderPaddingX} min={0} max={36} step={1} unit="px"
            editable={true} allowOutOfBoundsInput={true} colorScheme="sky"
            onChange={(v) => setToken('panelHeaderPaddingX', v)} isLight={isLight} />
          <SliderControl label="Header 上下内衬 (padY)" value={panelHeaderPaddingY} min={0} max={28} step={1} unit="px"
            editable={true} allowOutOfBoundsInput={true} colorScheme="emerald"
            onChange={(v) => setToken('panelHeaderPaddingY', v)} isLight={isLight} />
        </div>

        {/* Back Button & Mirrored Top-Right Action Button Lab */}
        <div className={`p-4 rounded-xl border flex flex-col gap-3.5 ${ isLight
          ? 'bg-neutral-50/80 border-neutral-200/80' : 'bg-neutral-950/40 border-neutral-800/80' }`}>
          {/* Row 1: Semantic Idle Tone + Border/Surface Style Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold">顶栏左右按钮默认底色与边框质感 (Idle Tone & Border Style)</span>
              <span className={`text-[11px] font-mono ${ isLight ? 'text-neutral-500' : 'text-neutral-400' }`}>
                L: <strong className="text-amber-500">{btnGeom.borderRadiusCss}</strong> · R: <strong className="text-sky-500">{btnGeom.rightBorderRadiusCss}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <SegmentedSwitch size="sm" isLight={isLight} value={panelHeaderBackBtnIdleTone}
                onValueChange={(val) => setToken('panelHeaderBackBtnIdleTone', val as PanelHeaderBackBtnIdleTone) }
                options={[ { value: 'match-header', label: '顶栏同色 (Match Header)' },
                { value: 'muted-gray', label: '默认暗灰 (Muted Gray)' },
                { value: 'elevated', label: '凸起亮底 (Elevated)' }, ]} />
              <SegmentedSwitch size="sm" isLight={isLight} value={panelHeaderBackBtnStyle} onValueChange={(val) =>
                setToken('panelHeaderBackBtnStyle', val as PanelHeaderBackBtnStyle) } options={[
                { value: 'surface', label: 'Surface 框线' }, { value: 'subtle', label: 'Subtle 无框' },
                { value: 'ghost', label: 'Ghost 悬浮' }, ]} />
            </div>
          </div>

          {/* Row 1.5: Top-Right Minimize-2 Action Button Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex items-center gap-3 flex-wrap">
              <ToggleSwitch checked={panelHeaderShowRightBtn}
                onCheckedChange={(v) => setToken('panelHeaderShowRightBtn', v)}
                label="启用右上角图标按钮 (Minimize-2 / Custom Icon)" variant="neutral" isLight={isLight} />
              <ToggleSwitch checked={panelHeaderRightBtnExpandOnHover}
                onCheckedChange={(v) => setToken('panelHeaderRightBtnExpandOnHover', v)}
                label="Hover 展开 Live Preview 文字" variant="neutral" isLight={isLight} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-neutral-400">右上角图标朝向:</span>
              <SegmentedSwitch size="sm" isLight={isLight} value={panelHeaderRightBtnTransform}
                onValueChange={(val) =>
                setToken('panelHeaderRightBtnTransform', val as PanelHeaderRightBtnTransform) } options={[
                { value: 'flip-x', label: '水平翻转 (Flip X)' }, { value: 'rotate-90', label: '旋转 90° (Rotate 90°)' },
                { value: 'none', label: '原始方向 (None)' }, ]} />
            </div>
          </div>

          {/* Row 2: 4-Mode Corner Strategy Switcher + Quick Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <SegmentedSwitch size="sm" isLight={isLight} value={panelHeaderBackBtnRadiusMode}
              onValueChange={(val) => setToken('panelHeaderBackBtnRadiusMode', val as PanelHeaderBackBtnRadiusMode)
              } options={[ { value: 'asymmetric-tl',
              label: `外角同心+三内角收敛 (${btnGeom.concentricRadius}/${btnGeom.innerRadius}px)`, }, { value: 'auto',
              label: `四角全同心 (${btnGeom.concentricRadius}px)`, }, { value: 'custom',
              label: `四角统一手动 (${panelHeaderBackBtnRadius}px)`, }, { value: 'per-corner',
              label: `四角完全独立 (TL/TR/BR/BL)`, }, ]} />

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> 推荐预设:
              </span>
              <button
                type="button"
                onClick={() => applyBackBtnPreset('flush-divider')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="0×0 贴边满高 + 42×32px 仅保留内侧单分割线 + 外角同心 16/0/0/0"
              >
                ① 贴边单分割线 (42×32 · Pad 0 · 16/0/0/0)
              </button>
              <button
                type="button"
                onClick={() => applyBackBtnPreset('asymmetric-rect')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="30×26px 宽扁矩形 + 外角自适应同心(10px) + 其余三内角 6px 小弧度"
              >
                ② 外角同心宽扁 (30×26 · 10/6/6/6)
              </button>
              <button
                type="button"
                onClick={() => applyBackBtnPreset('apple-compact-rect')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="Apple macOS Toolbar 风格：30×24px 紧凑宽矩 + 7px 统一收敛圆角"
              >
                ③ macOS 紧凑宽矩 (30×24 · R=7)
              </button>
              <button
                type="button"
                onClick={() => applyBackBtnPreset('subtle-ghost')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="无边框微透底板 + 外角同心内嵌，弱化静止态边框对圆角的膨胀感"
              >
                ④ 微透无框内嵌 (28×24 · Subtle)
              </button>
            </div>
          </div>

          {/* Row 3: Dynamic Radius Sliders based on active mode */}
          {panelHeaderBackBtnRadiusMode === 'per-corner' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <SliderControl label="面板外框圆角 (panelOuterRadius)" value={panelOuterRadius} min={0} max={36} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
                onChange={(v) => setToken('panelOuterRadius', v)} isLight={isLight} />
              <SliderControl label="左上圆角 (Radius TL)" value={panelHeaderBackBtnRadiusTL} min={0} max={24} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
                onChange={(v) => setToken('panelHeaderBackBtnRadiusTL', v)} isLight={isLight} />
              <SliderControl label="右上圆角 (Radius TR)" value={panelHeaderBackBtnRadiusTR} min={0} max={24} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="sky"
                onChange={(v) => setToken('panelHeaderBackBtnRadiusTR', v)} isLight={isLight} />
              <SliderControl label="右下圆角 (Radius BR)" value={panelHeaderBackBtnRadiusBR} min={0} max={24} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="sky"
                onChange={(v) => setToken('panelHeaderBackBtnRadiusBR', v)} isLight={isLight} />
              <SliderControl label="左下圆角 (Radius BL)" value={panelHeaderBackBtnRadiusBL} min={0} max={24} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="sky"
                onChange={(v) => setToken('panelHeaderBackBtnRadiusBL', v)} isLight={isLight} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <SliderControl label="面板外框圆角 (panelOuterRadius)" value={panelOuterRadius} min={0} max={36} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
                onChange={(v) => setToken('panelOuterRadius', v)} isLight={isLight} />
              <SliderControl label={ panelHeaderBackBtnRadiusMode === 'asymmetric-tl'
                ? `其余三内角弧度 (TR/BR/BL · 外角=${btnGeom.concentricRadius}px)` : '内侧三小角弧度 (backBtnInnerRadius)' }
                value={panelHeaderBackBtnInnerRadius} min={0} max={24} step={1} unit="px" editable={true}
                allowOutOfBoundsInput={true} colorScheme="sky" onChange={(v) => {
                if (panelHeaderBackBtnRadiusMode !== 'asymmetric-tl') {
                setToken('panelHeaderBackBtnRadiusMode', 'asymmetric-tl'); }
                setToken('panelHeaderBackBtnInnerRadius', v); }} isLight={isLight} />
              <SliderControl label={ panelHeaderBackBtnRadiusMode === 'custom' ? '四角统一圆角 (backBtnRadius)'
                : `切换四角统一圆角 (当前 ${btnGeom.radiusSummary})` } value={ panelHeaderBackBtnRadiusMode === 'auto'
                ? btnGeom.concentricRadius : panelHeaderBackBtnRadius } min={0} max={24} step={1} unit="px"
                editable={true} allowOutOfBoundsInput={true} colorScheme="amber" onChange={(v) => {
                setToken('panelHeaderBackBtnRadiusMode', 'custom'); setToken('panelHeaderBackBtnRadius', v); }}
                isLight={isLight} />
            </div>
          )}
        </div>
      </div>

      <PanelShellStagesTwoThree isLight={isLight} showCode={showCode} />
    </div>
  );
});

PanelShellTuner.displayName = 'PanelShellTuner';

