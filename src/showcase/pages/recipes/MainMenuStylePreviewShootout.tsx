import React from 'react';
import { Image as ImageIcon, Eye } from 'lucide-react';
import { Badge } from '../../../primitives/Badge';
import { Button } from '../../../primitives/Button';
import {
  Layer1MainMenuRecipe,
  Layer1ContextGroupedSelector,
  type Layer1ContextVariation,
  type Layer1ContextMeta,
} from '../../../recipes/Layer1MainMenuRecipe';
import { useMainMenuStyleStore } from '../../../tokens/mainMenuStyleStore';

export interface MainMenuStylePreviewShootoutProps {
  isLight: boolean;
  activeCtx: Layer1ContextVariation;
  activeCtxMeta: Layer1ContextMeta;
  handleSelectCtx: (ctx: Layer1ContextVariation) => void;
  showLivePanel: boolean;
  showShootout: boolean;
}

export const MainMenuStylePreviewShootout: React.FC<
  MainMenuStylePreviewShootoutProps
> = ({
  isLight,
  activeCtx,
  activeCtxMeta,
  handleSelectCtx,
  showLivePanel,
  showShootout,
}) => {
  const store = useMainMenuStyleStore();
  const { variant, applyPreset } = store;

  return (
    <>
      {/* Synchronized Layer 1 Context Variation Bar (Synced across 6A.1, 6A.1M & 7A) */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
          isLight
            ? 'bg-amber-50/35 border-amber-200/80'
            : 'bg-amber-500/5 border-amber-500/25'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Eye className="h-4 w-4" />
            <span>
              预览对局模式实时联动 (Layer 1 Context Variations · 与 [6A.1] 完整菜单预览屏 100% 同步)
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            当前激活:{' '}
            <strong className="text-amber-500">
              {activeCtxMeta.label} [{activeCtxMeta.headerTitle}]
            </strong>
          </span>
        </div>

        <Layer1ContextGroupedSelector
          activeContext={activeCtx}
          onSelectContext={(ctx) => handleSelectCtx(ctx)}
          tierFilter="all"
          isLight={isLight}
        />
      </div>

      {/* Dedicated 1:1 Full-Scale Current Parameters Live Menu Preview (Exact Mirror of 6A.1) */}
      {showLivePanel && (
        <div
          id="main-menu-live-1to1-preview"
          className={`p-5 rounded-xl border flex flex-col gap-4 ${
            isLight
              ? 'bg-neutral-50/80 border-neutral-200/90 shadow-inner'
              : 'bg-neutral-950/70 border-neutral-800 shadow-inner'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                1:1 LIVE
              </span>
              <span className="text-xs font-bold">
                当前参数下的完整 MENU 1:1 实时预览 (420px 标准宽度 · 与另一屏幕 [6A.1] 画面 100% 一致)
              </span>
              <Badge variant="success" size="sm" isLight={isLight}>
                {activeCtxMeta.shortLabel} · {store.variant} · {store.titleFontSizePx}px
              </Badge>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              上方任意滑块、预设、字体或对局模式改动均在此处与 [6A.1] 同步呈现（不被三方案对比列宽压缩）
            </span>
          </div>

          <div
            onClickCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex justify-center py-2"
          >
            <Layer1MainMenuRecipe isLight={isLight} contextMode={activeCtx} />
          </div>
        </div>
      )}

      {/* 3-Way Side-by-Side Full Panel Comparison (Shootout Matrix) */}
      {showShootout && (
        <div
          className={`p-4 rounded-xl border flex flex-col gap-4 ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80'
              : 'bg-neutral-950/60 border-neutral-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <ImageIcon className="h-4 w-4" />
              <span>
                三方案同屏直观对比：极简大字无图标框 vs 极简大字带图标框 vs 旧版含 Description (用于直观对比本质结构差异)
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              注：三列同屏对比固定锁定各自的【图标框/副标题】结构特征；查看完整宽度与当前参数真实效果请看上方「1:1 LIVE」或 [6A.1]
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
            {/* Column 1: Clean Large Title + Bare Icon (No Description) */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                !store.showDescription && !store.showIconBox && variant === 'large-clean-row'
                  ? isLight
                    ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/25'
                  : isLight
                  ? 'bg-white border-neutral-200'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold block">
                    方案 A (当前主推) · 极简大字 + 纯净图标
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Resume 短标题 · 无 Description · 无图标内框
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={
                    !store.showDescription && !store.showIconBox && variant === 'large-clean-row'
                      ? 'primary'
                      : 'secondary'
                  }
                  isLight={isLight}
                  onClick={() =>
                    applyPreset({
                      variant: 'large-clean-row',
                      conciseResumeLabel: true,
                      showDescription: false,
                      showIconBox: false,
                    })
                  }
                >
                  应用方案 A
                </Button>
              </div>
              <div
                onClickCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex justify-center"
              >
                <Layer1MainMenuRecipe
                  isLight={isLight}
                  contextMode={activeCtx}
                  styleVariant="large-clean-row"
                  styleParams={{
                    ...store,
                    variant: 'large-clean-row',
                    conciseResumeLabel: true,
                    showDescription: false,
                    showIconBox: false,
                  }}
                />
              </div>
            </div>

            {/* Column 2: Clean Large Title + Boxed Icon (No Description) */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                !store.showDescription && store.showIconBox && variant === 'large-clean-row'
                  ? isLight
                    ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/25'
                  : isLight
                  ? 'bg-white border-neutral-200'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold block">
                    方案 B · 极简大字 + 独立图标方盒
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Resume 短标题 · 无 Description · 保留 36×36 图标内框
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={
                    !store.showDescription && store.showIconBox && variant === 'large-clean-row'
                      ? 'primary'
                      : 'secondary'
                  }
                  isLight={isLight}
                  onClick={() =>
                    applyPreset({
                      variant: 'large-clean-row',
                      conciseResumeLabel: true,
                      showDescription: false,
                      showIconBox: true,
                    })
                  }
                >
                  应用方案 B
                </Button>
              </div>
              <div
                onClickCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex justify-center"
              >
                <Layer1MainMenuRecipe
                  isLight={isLight}
                  contextMode={activeCtx}
                  styleVariant="large-clean-row"
                  styleParams={{
                    ...store,
                    variant: 'large-clean-row',
                    conciseResumeLabel: true,
                    showDescription: false,
                    showIconBox: true,
                  }}
                />
              </div>
            </div>

            {/* Column 3: Previous Descriptive Two-Line Reference */}
            <div
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                store.showDescription
                  ? isLight
                    ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/25'
                  : isLight
                  ? 'bg-white border-neutral-200'
                  : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold block">
                    方案 C (旧版对照) · 含下方 Description
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Resume Match + 双行副标题说明
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={store.showDescription ? 'primary' : 'secondary'}
                  isLight={isLight}
                  onClick={() =>
                    applyPreset({
                      variant: 'classic-descriptive-row',
                      conciseResumeLabel: false,
                      showDescription: true,
                      showIconBox: true,
                      titleFontSizePx: 14,
                    })
                  }
                >
                  切换至旧版
                </Button>
              </div>
              <div
                onClickCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex justify-center"
              >
                <Layer1MainMenuRecipe
                  isLight={isLight}
                  contextMode={activeCtx}
                  styleVariant="classic-descriptive-row"
                  styleParams={{
                    ...store,
                    variant: 'classic-descriptive-row',
                    conciseResumeLabel: false,
                    showDescription: true,
                    showIconBox: true,
                    titleFontSizePx: 14,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
