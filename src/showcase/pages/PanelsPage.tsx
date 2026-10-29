import React from 'react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../../layout/Panel';
import { useMenuLayoutStore } from '../../tokens';
import { createScopedSyncedState } from '../stores';
import { CodeBlock } from '../CodeBlock';
import { PanelShellTuner } from './recipes/PanelShellTuner';

const useState = createScopedSyncedState('page:panels');

export const PanelsPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  const {
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderTitleFontSize,
    panelBodyPaddingX,
    panelBodyPaddingY,
    panelFooterPaddingX,
    panelFooterPaddingY,
    panelFooterFontSize,
  } = useMenuLayoutStore();

  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">3-Stage Compound 面板</h1>
        <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          标准三段式弹性面板规范：顶栏 (Header · shrink-0) 从上往下取高，底栏 (Footer · shrink-0 mt-auto) 从下往上锚定底边，中段内容 (Content · flex-1 min-h-0) 弹性吃满所有剩余垂直空间并独立滚动。
          在此处调节的<strong>标题字号、返回按钮尺寸及三段 Padding 参数</strong>自动存入 <code className="font-mono">localStorage</code>，并实时同步至 <strong>6A 所有 Layer 2–4 菜单配方</strong> 与 <strong>7A 全链路沙盒</strong>。
        </p>
      </div>

      {/* Live 3-Stage Compound Shell Tuner */}
      <PanelShellTuner isLight={isLight} />

      {/* Anatomy Diagram */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <span className="font-bold text-sm">面板结构解剖与实时尺寸预览 (Live Panel Anatomy)</span>

        <PanelContainer isLight={isLight} className="max-w-[520px] self-center my-2">
          {/* Header */}
          <div className="relative">
            <PanelHeader
              title="TITLE"
              onBack={() => {}}
              onRightAction={() => {}}
              rightActionLabel="Live Preview"
              onRightActionHoverChange={(hovered) =>
                setHoveredDesc(
                  hovered
                    ? 'Live Preview [TAB]: Collapse panel to side dock and inspect live 3D arena.'
                    : null
                )
              }
              isLight={isLight}
            />
          </div>

          {/* Body */}
          <div className="relative border-b border-dashed border-amber-500/40">
            <PanelContent scrollable={false} className="bg-amber-500/5">
              <div
                onMouseEnter={() =>
                  setHoveredDesc('Hovering content item: Footer switches to high-contrast description.')
                }
                onMouseLeave={() => setHoveredDesc(null)}
                className="p-4 rounded-xl border border-amber-500/30 text-xs text-center flex flex-col gap-1 cursor-pointer transition-colors hover:border-amber-500"
              >
                <span className="font-bold text-amber-500">
                  STAGE 2: CONTENT BODY (Padding: {panelBodyPaddingX}px × {panelBodyPaddingY}px)
                </span>
                <span className="text-[11px] opacity-75">
                  所有内部控件与卡片均在此内呼吸（鼠标悬停此处或右上角 Minimize-2 按钮可预览 Live Preview 与 Footer 联动）。
                </span>
              </div>
            </PanelContent>
          </div>

          {/* Footer */}
          <PanelFooter
            isLight={isLight}
            defaultDescription={`STAGE 3: FOOTER (${panelFooterFontSize}px · Padding: ${panelFooterPaddingX}×${panelFooterPaddingY}px · Idle Gray / Hover High-Contrast)`}
            hoveredDescription={hoveredDesc}
            rightLabel="Live Preview"
            rightShortcut="TAB"
            onRightClick={() => {}}
          />
        </PanelContainer>
      </div>

      {/* Code Snippet */}
      <CodeBlock
        isLight={isLight}
        title="Agent 代码配方 (Compound Panel Recipe)"
        code={`import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '@/components/layout';

<PanelContainer isLight={isLight} className="w-full max-w-[520px]">
  <PanelHeader
    title="PANEL TITLE"
    onBack={handleBack}
    isLight={isLight}
  />
  <PanelContent scrollable>
    {/* 内部业务控件自动继承全局可调的 panelBodyPaddingX (${panelBodyPaddingX}px) × panelBodyPaddingY (${panelBodyPaddingY}px) */}
  </PanelContent>
  <PanelFooter
    isLight={isLight}
    defaultDescription="Default page description when nothing is hovered."
    hoveredDescription={hoveredDesc}
  />
</PanelContainer>`}
      />
    </div>
  );
};
