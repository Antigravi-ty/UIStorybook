import React from 'react';
import {
  Palette,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import {
  useMainMenuStyleStore,
  MAIN_MENU_ITEM_SLOTS,
  MAIN_MENU_ICON_COLOR_OPTIONS,
  isCustomMainMenuColor,
  resolveMainMenuIconHex,
  hexToRgbTuple,
  type MainMenuFontFamilyMode,
  type MainMenuRowAlignMode,
  type MainMenuResumeHighlightStyle,
  type MainMenuItemSlotId,
} from '../../../tokens/mainMenuStyleStore';

export interface MainMenuStyleGroupsCDEProps {
  isLight: boolean;
}

export const MainMenuStyleGroupsCDE: React.FC<MainMenuStyleGroupsCDEProps> = ({
  isLight,
}) => {
  const store = useMainMenuStyleStore();
  const { variant, setParam, setItemIconColor } = store;

  return (
    <>
      {/* Group C: Icon, Icon Box, Alignment & Resume Highlight Mode */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
          <Sparkles className="h-4 w-4" />
          <span>C. 图标尺寸、图标内框、对齐方式与首行 Resume 视觉模式</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SliderControl
            label="左侧图标尺寸 (iconSize)"
            value={store.iconSizePx}
            min={12}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('iconSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标 SVG 线宽 (strokeWidth)"
            value={store.iconStrokeWidth}
            min={1.0}
            max={3.0}
            step={0.1}
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('iconStrokeWidth', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标与标题水平间距 (iconTitleGap)"
            value={store.iconTitleGapPx}
            min={4}
            max={28}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('iconTitleGapPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标内框方盒尺寸 (iconBoxSize)"
            value={store.iconBoxSizePx}
            min={24}
            max={56}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('iconBoxSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="图标内框圆角 (iconBoxRadius)"
            value={store.iconBoxRadiusPx}
            min={0}
            max={20}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('iconBoxRadiusPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="右侧导航箭头尺寸 (arrowSize)"
            value={store.rightArrowSizePx}
            min={12}
            max={24}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('rightArrowSizePx', v)}
            isLight={isLight}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              首行 Resume 视觉模式 (resumeHighlightStyle):
            </span>
            {(
              [
                { id: 'solid-primary', label: '反色实心主按钮 (Solid Primary)' },
                { id: 'surface-card', label: '同色系外框卡片 (Unified Surface)' },
                { id: 'amber-accent', label: '暖橙高亮外框 (Amber Accent)' },
              ] as { id: MainMenuResumeHighlightStyle; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParam('resumeHighlightStyle', opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.resumeHighlightStyle === opt.id
                    ? 'bg-amber-500 text-white border-amber-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              行内容对齐 (rowContentAlign):
            </span>
            {(
              [
                { id: 'left', label: '左对齐 (Left)' },
                { id: 'center', label: '居中 (Center)' },
                { id: 'space-between', label: '两端分布 (Space-Between)' },
              ] as { id: MainMenuRowAlignMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParam('rowContentAlign', opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                  store.rowContentAlign === opt.id
                    ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Group D: 3-Stage Panel Shell (Header / Content / Footer) */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <LayoutTemplate className="h-4 w-4" />
            <span>
              D. MENU 三段式面板壳体参数 (Header 标题与内衬 · Content 内衬 · Footer 状态栏)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                Header 字体:
              </span>
              {(
                [
                  { id: 'sans', label: 'Apple Sans' },
                  { id: 'mono', label: 'JetBrains Mono' },
                ] as { id: MainMenuFontFamilyMode; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setParam('headerFontFamily', f.id)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    store.headerFontFamily === f.id
                      ? 'bg-amber-500 text-white border-amber-500 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-700'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ToggleSwitch
              checked={store.showFooter}
              onCheckedChange={(v) => setParam('showFooter', v)}
              label="显示底部 Footer (Power Saving 状态栏)"
              isLight={isLight}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SliderControl
            label="Header 字号 (headerSize)"
            value={store.headerFontSizePx}
            min={13}
            max={32}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('headerFontSizePx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Header 字间距 (letterSpacing)"
            value={store.headerLetterSpacingEm}
            min={-0.04}
            max={0.3}
            step={0.01}
            unit="em"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('headerLetterSpacingEm', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Header 左右内衬 (headerPadX)"
            value={store.headerPaddingXPx}
            min={8}
            max={40}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('headerPaddingXPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Header 顶部内衬 (headerPadTop)"
            value={store.headerPaddingTopPx}
            min={6}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('headerPaddingTopPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Header 底部内衬 (headerPadBottom)"
            value={store.headerPaddingBottomPx}
            min={6}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('headerPaddingBottomPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Content 左右内衬 (contentPadX)"
            value={store.contentPaddingXPx}
            min={8}
            max={40}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('contentPaddingXPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Content 上下内衬 (contentPadY)"
            value={store.contentPaddingYPx}
            min={4}
            max={36}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="emerald"
            onChange={(v) => setParam('contentPaddingYPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Footer 左右内衬 (footerPadX)"
            value={store.footerPaddingXPx}
            min={8}
            max={40}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('footerPaddingXPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Footer 上下内衬 (footerPadY)"
            value={store.footerPaddingYPx}
            min={4}
            max={28}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="sky"
            onChange={(v) => setParam('footerPaddingYPx', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Footer 字号 (footerFontSize)"
            value={store.footerFontSizePx}
            min={9}
            max={15}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => setParam('footerFontSizePx', v)}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Group E: Per-Item Independent Icon Colors & Style 2 Watermark */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-3.5 ${
          isLight
            ? 'bg-neutral-50/70 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Palette className="h-4 w-4" />
            <span>
              E. 各菜单项独立 Icon 配色与风格二水印参数 (Per-Item Icon Colors &amp; Watermark)
            </span>
          </div>

          <ToggleSwitch
            checked={store.usePerItemIconColors}
            onCheckedChange={(v) => setParam('usePerItemIconColors', v)}
            label="启用各菜单项独立彩色 Icon (关闭则保持默认单色图标)"
            isLight={isLight}
          />
        </div>

        {store.usePerItemIconColors && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAIN_MENU_ITEM_SLOTS.map((slot) => {
              const slotId = slot.id as MainMenuItemSlotId;
              const currentColor = store.itemIconColors?.[slotId] || 'neutral';
              const isCustom = isCustomMainMenuColor(currentColor);
              const resolvedHex = resolveMainMenuIconHex(currentColor, isLight);
              const rgb = hexToRgbTuple(resolvedHex);
              const presetLabel = MAIN_MENU_ICON_COLOR_OPTIONS.find(
                (c) => c.id === currentColor
              )?.label;

              return (
                <div
                  key={slot.id}
                  className={`p-3 rounded-xl border flex flex-col gap-2 ${
                    isLight
                      ? 'bg-white border-neutral-200/90'
                      : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono">{slot.label}</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {presetLabel || `RGB(${rgb.r},${rgb.g},${rgb.b})`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {MAIN_MENU_ICON_COLOR_OPTIONS.map((opt) => {
                      const isSelected = currentColor === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setItemIconColor(slotId, opt.id)}
                          title={opt.label}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                                : 'bg-white text-neutral-950 border-white font-bold'
                              : isLight
                              ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                              : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/80 text-neutral-300'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dotClass}`} />
                          <span>{opt.shortLabel}</span>
                        </button>
                      );
                    })}

                    <label
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border cursor-pointer text-[10px] font-mono ${
                        isCustom
                          ? 'border-amber-500 text-amber-500 font-bold'
                          : isLight
                          ? 'bg-neutral-50 border-neutral-200 text-neutral-600'
                          : 'bg-neutral-850 border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <input
                        type="color"
                        value={resolvedHex}
                        onChange={(e) => setItemIconColor(slotId, e.target.value)}
                        className="h-3 w-3 rounded border-0 p-0 bg-transparent cursor-pointer"
                      />
                      <span>自选色</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Style 2 Watermark Sliders */}
        {variant === 'mono-watermark-row' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/70">
            <SliderControl
              label="水印 Icon 尺寸 (watermarkSize)"
              value={store.watermarkSizePx}
              min={32}
              max={120}
              step={2}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) => setParam('watermarkSizePx', v)}
              isLight={isLight}
            />
            <SliderControl
              label="水印默认透明度 (opacity)"
              value={store.watermarkOpacityPct}
              min={5}
              max={80}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              colorScheme="emerald"
              onChange={(v) => setParam('watermarkOpacityPct', v)}
              isLight={isLight}
            />
            <SliderControl
              label="水印 Hover 透明度"
              value={store.watermarkHoverOpacityPct}
              min={10}
              max={95}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              colorScheme="emerald"
              onChange={(v) => setParam('watermarkHoverOpacityPct', v)}
              isLight={isLight}
            />
            <SliderControl
              label="水印旋转角 (rotateDeg)"
              value={store.watermarkRotateDeg}
              min={-40}
              max={40}
              step={1}
              unit="°"
              editable
              allowOutOfBoundsInput
              colorScheme="sky"
              onChange={(v) => setParam('watermarkRotateDeg', v)}
              isLight={isLight}
            />
          </div>
        )}
      </div>
    </>
  );
};
