import React from 'react';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { CodeBlock } from '../../CodeBlock';
import { useMenuLayoutStore } from '../../../tokens/menuLayoutStore';

export interface PanelShellStagesTwoThreeProps {
  isLight: boolean;
  showCode: boolean;
}

export const PanelShellStagesTwoThree: React.FC<PanelShellStagesTwoThreeProps> = ({
  isLight,
  showCode,
}) => {
  const {
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
    exportPanelShellConfigCode,
  } = useMenuLayoutStore();

  return (
    <>
      {/* Stage 2: Content Body Paddings */}
      <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/80">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
          Stage 2 · Content Container 中段内容区与 Tabs 内边距
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SliderControl
            label="Content 左右内衬 (bodyPadX)"
            value={panelBodyPaddingX}
            min={0}
            max={36}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="sky"
            onChange={(v) => setToken('panelBodyPaddingX', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Content 上下内衬 (bodyPadY)"
            value={panelBodyPaddingY}
            min={0}
            max={32}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="emerald"
            onChange={(v) => setToken('panelBodyPaddingY', v)}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Stage 3: Split Footer */}
      <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500">
              Stage 3 · Footer 底栏与内容内衬 (左描述 + 右能力槽)
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  updateTokens({
                    panelFooterPaddingX: panelBodyPaddingX,
                    panelFooterPaddingY: 6,
                  })
                }
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="将 Footer 左右内衬对齐至 Content Body 边距，并使用 6px 紧凑上下内衬"
              >
                对齐 Body ({panelBodyPaddingX}×6px)
              </button>
              <button
                type="button"
                onClick={() =>
                  updateTokens({
                    panelFooterPaddingX: 12,
                    panelFooterPaddingY: 4,
                  })
                }
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="紧凑型底栏内衬 (12×4px)"
              >
                紧凑底栏 (12×4px)
              </button>
              <button
                type="button"
                onClick={() =>
                  updateTokens({
                    panelFooterPaddingX: 0,
                    panelFooterPaddingY: 0,
                  })
                }
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="完全贴边归零 (0×0px)"
              >
                贴边归零 (0×0px)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <ToggleSwitch
              checked={panelFooterSplitRight}
              onCheckedChange={(v) => setToken('panelFooterSplitRight', v)}
              label="拆分右侧槽 (Split Right)"
              variant="neutral"
              isLight={isLight}
            />
            <ToggleSwitch
              checked={panelFooterRightDivider}
              onCheckedChange={(v) => setToken('panelFooterRightDivider', v)}
              label="右侧分割线 (Divider)"
              variant="neutral"
              isLight={isLight}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SliderControl
            label="Footer 字号 (footerFontSize)"
            value={panelFooterFontSize}
            min={8}
            max={18}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setToken('panelFooterFontSize', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Footer 内容左右内衬 (footerPadX)"
            value={panelFooterPaddingX}
            min={0}
            max={36}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="sky"
            onChange={(v) => setToken('panelFooterPaddingX', v)}
            isLight={isLight}
          />
          <SliderControl
            label="Footer 底栏上下内衬 (footerPadY)"
            value={panelFooterPaddingY}
            min={0}
            max={24}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="emerald"
            onChange={(v) => setToken('panelFooterPaddingY', v)}
            isLight={isLight}
          />
          <SliderControl
            label="右槽左右内衬 (footerRightPadX)"
            value={panelFooterRightPaddingX}
            min={0}
            max={32}
            step={1}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="sky"
            onChange={(v) => setToken('panelFooterRightPaddingX', v)}
            isLight={isLight}
          />
        </div>
      </div>

      {showCode && (
        <CodeBlock
          isLight={isLight}
          title="src/tokens/menuLayoutStore.ts (DEFAULT_PANEL_SHELL_TOKENS)"
          code={exportPanelShellConfigCode()}
        />
      )}
    </>
  );
};
