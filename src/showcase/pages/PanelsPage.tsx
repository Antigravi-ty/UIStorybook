import React from 'react';
import { LayoutTemplate, ShieldAlert, Sparkles } from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../../layout/Panel';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { CodeBlock } from '../CodeBlock';

export const PanelsPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">3-Stage Compound 面板</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          从 SimpleUI 完整吸收的标准面板规范。包含明确的头部区 (px-6 py-4)、内容缓冲躯干 (p-6) 与次级表面底部 (px-6 py-3.5)。
        </p>
      </div>

      {/* Anatomy Diagram */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <span className="font-bold text-sm">面板结构解剖与尺寸标注 (Panel Anatomy)</span>

        <PanelContainer isLight={isLight} className="max-w-[480px] self-center my-2">
          {/* Header */}
          <div className="relative">
            <PanelHeader
              title="STAGE 1: HEADER"
              subtitle="px-6 py-4 (24px 水平 / 16px 垂直)"
              badge={<Badge size="sm" variant="primary" isLight={isLight}>Standard</Badge>}
              onBack={() => {}}
              isLight={isLight}
            />
          </div>

          {/* Body */}
          <div className="relative border-b border-dashed border-amber-500/40">
            <PanelContent scrollable={false} className="bg-amber-500/5">
              <div className="p-4 rounded-xl border border-amber-500/30 text-xs text-center flex flex-col gap-1">
                <span className="font-bold text-amber-400">STAGE 2: CONTENT BODY (p-6 / 24px Uniform Padding)</span>
                <span className="text-[11px] opacity-75">
                  所有内部控件与卡片均在此内呼吸，保证任何滚动条或边缘都不会与面板边框贴死。
                </span>
              </div>
            </PanelContent>
          </div>

          {/* Footer */}
          <PanelFooter hint="ESC to Back" isLight={isLight}>
            <span className="font-mono text-[11px]">STAGE 3: FOOTER (px-6 py-3.5)</span>
          </PanelFooter>
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
    subtitle="Subtitle explanation"
    badge={<Badge variant="primary" size="sm">Tag</Badge>}
    onBack={handleBack}
    isLight={isLight}
  />
  <PanelContent scrollable>
    {/* 内部业务控件，自动享受 p-6 内边距 */}
  </PanelContent>
  <PanelFooter hint="ESC to Back" isLight={isLight}>
    <span>Status / Action slot</span>
  </PanelFooter>
</PanelContainer>`}
      />
    </div>
  );
};
