import React from 'react';
import { Layers, Ruler } from 'lucide-react';
import type { ContainerTransitionMode } from '../../../navigation/transitions';
import type {
  ClampedMenuPanelGeometry,
  MenuPanelWidthAdaptiveMode,
} from '../../../navigation/menuPanelAdaptive';
import type { Layer1MenuContextMode } from '../../../recipes/Layer1MainMenuRecipe';
import type { ShowcaseTab } from '../../Sidebar';
import {
  type ActiveMenuRoute,
  ROUTE_TO_PANEL_ID,
} from './menuLayerRouteConfig';
import { resolveNodePathInspectorLinks } from './menuLayerInspectorLinks';
import { LocalPanelSizingTuner } from '../recipes/LocalPanelSizingTuner';
import { MainMenuStyleTuner } from '../recipes/MainMenuStyleTuner';
import { SettingActionRowTuner } from '../recipes/SettingActionRowTuner';
import { UnderlineTabsTuner } from '../recipes/UnderlineTabsTuner';
import { CameraSettingsStyleTuner } from '../recipes/CameraSettingsStyleTuner';

export interface MenuLayerTopHeaderBarProps {
  isLight: boolean;
  currentRoute: ActiveMenuRoute;
  transitionMode: ContainerTransitionMode;
  setTransitionMode: (mode: ContainerTransitionMode) => void;
  showToast: (msg: string) => void;
}

export const MenuLayerTopHeaderBar: React.FC<MenuLayerTopHeaderBarProps> = ({
  isLight,
  currentRoute,
  transitionMode,
  setTransitionMode,
  showToast,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Layers className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Menu Layer 实时预览</h1>
      </div>

      <div className="flex items-center gap-3 text-xs flex-wrap">
        <button
          type="button"
          onClick={async () => {
            const previewStage = document.getElementById('storybook-preview-stage');
            if (!previewStage) return;

            const winW = window.innerWidth;
            const winH = window.innerHeight;
            const shellEl = previewStage.querySelector<HTMLElement>(
              '[data-morph-container="true"], [data-panel="container"]'
            );
            const headerEl = previewStage.querySelector<HTMLElement>(
              '[data-ui-element="panel-header"]'
            );
            const tabsEl = previewStage.querySelector<HTMLElement>('[role="tablist"]');
            const tabButtons = Array.from(
              previewStage.querySelectorAll<HTMLElement>('[role="tab"]')
            );
            const contentEl = previewStage.querySelector<HTMLElement>(
              '[data-ui-element="panel-content"]'
            );
            const footerEl = previewStage.querySelector<HTMLElement>(
              '[data-ui-element="panel-footer"]'
            );

            const getPadStr = (cs: CSSStyleDeclaration) =>
              `top=${cs.paddingTop} right=${cs.paddingRight} bottom=${cs.paddingBottom} left=${cs.paddingLeft}`;
            const getRectStr = (r: DOMRect) =>
              `${Math.round(r.width * 10) / 10}px × ${Math.round(r.height * 10) / 10}px (x: ${Math.round(r.x)}, y: ${Math.round(r.y)})`;

            const lines: string[] = [];
            lines.push(
              '========================================================================'
            );
            lines.push(
              ` [UI STORYBOOK SNAPSHOT] ROUTE: [${currentRoute.toUpperCase()}]`
            );
            lines.push(
              '========================================================================'
            );
            lines.push(`• Window Viewport: ${winW}px × ${winH}px`);

            if (shellEl) {
              const sRect = shellEl.getBoundingClientRect();
              const sCs = window.getComputedStyle(shellEl);
              lines.push('\n[1. MENU CONTAINER (OUTER SHELL)]');
              lines.push(`  • Size:         ${getRectStr(sRect)}`);
              lines.push(`  • Padding:      ${getPadStr(sCs)}`);
            }

            if (headerEl) {
              const hRect = headerEl.getBoundingClientRect();
              lines.push(
                `\n[2. PANEL HEADER] Size: ${getRectStr(hRect)} | Title: "${headerEl.querySelector('h1, h2')?.textContent?.trim() || ''}"`
              );
            }

            if (tabsEl) {
              lines.push(`\n[3. TABS] Total ${tabButtons.length} tab(s)`);
            }

            if (contentEl) {
              const cRect = contentEl.getBoundingClientRect();
              lines.push(
                `\n[4. PANEL CONTENT] Size: ${getRectStr(cRect)} | ScrollH: ${contentEl.scrollHeight}px`
              );
            }

            if (footerEl) {
              lines.push(
                `\n[5. PANEL FOOTER] Content: "${footerEl.textContent?.replace(/\s+/g, ' ').trim() || ''}"`
              );
            }

            lines.push(
              '========================================================================\n'
            );
            const report = lines.join('\n');
            console.log(report);
            if (navigator.clipboard?.writeText) {
              try {
                await navigator.clipboard.writeText(report);
                showToast('✓ 预览布局数据已输出至控制台并复制到剪贴板');
              } catch (_) {
                showToast('✓ 预览布局数据已输出至控制台');
              }
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-medium transition-all active:scale-95 cursor-pointer bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 shadow-2xs"
          title="打印并复制当前 Storybook 实时预览中元素的尺寸、外边距、内边距数据"
        >
          <Ruler className="h-3.5 w-3.5 text-amber-500" />
          <span>导出当前预览布局数据</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`font-medium ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            过渡动效:
          </span>
          <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-neutral-100/70 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setTransitionMode('fluid-morph')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                transitionMode === 'fluid-morph'
                  ? 'bg-amber-500 text-white font-bold shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Apple HIG 0.28s 连续流体形变"
            >
              FluidMorph (连续流体)
            </button>
            <button
              type="button"
              onClick={() => setTransitionMode('sequenced-step')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                transitionMode === 'sequenced-step'
                  ? 'bg-amber-500 text-white font-bold shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="100ms 淡出 -> 150ms 尺寸形变 -> 100ms 淡入"
            >
              SequencedStep (三段分步)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface MenuLayerAdaptiveControlDeckProps {
  isLight: boolean;
  currentRoute: ActiveMenuRoute;
  settingsTab: string;
  garageTab: string;
  layer1ContextMode: Layer1MenuContextMode;
  setLayer1ContextMode: (mode: Layer1MenuContextMode) => void;
  showInlineTuner: boolean;
  setShowInlineTuner: (show: boolean) => void;
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  widthMode: MenuPanelWidthAdaptiveMode;
  setWidthMode: (mode: MenuPanelWidthAdaptiveMode) => void;
  isDockState: boolean;
  targetW: number;
  targetH: number;
  activeRouteSize: ClampedMenuPanelGeometry;
  minWidthDraft: string;
  setMinWidthDraft: (v: string) => void;
  setIsEditingMinWidth: (v: boolean) => void;
  hasManualMinOverride: boolean;
  applyManualMinWidth: (nextVal: number) => void;
  handleResetAutoMinWidth: () => void;
  containerPreset: 'full' | '1080p-compact' | 'small-squeeze';
  setContainerPreset: (preset: 'full' | '1080p-compact' | 'small-squeeze') => void;
}

export const MenuLayerAdaptiveControlDeck: React.FC<
  MenuLayerAdaptiveControlDeckProps
> = ({
  isLight,
  currentRoute,
  settingsTab,
  garageTab,
  layer1ContextMode,
  setLayer1ContextMode,
  showInlineTuner,
  setShowInlineTuner,
  onNavigateShowcase,
  widthMode,
  setWidthMode,
  isDockState,
  targetW,
  targetH,
  activeRouteSize,
  minWidthDraft,
  setMinWidthDraft,
  setIsEditingMinWidth,
  hasManualMinOverride,
  applyManualMinWidth,
  handleResetAutoMinWidth,
  containerPreset,
  setContainerPreset,
}) => {
  return (
    <>
      {showInlineTuner &&
        (() => {
          const inspectorInfo = resolveNodePathInspectorLinks(
            currentRoute,
            settingsTab,
            garageTab
          );
          const activePanelId =
            currentRoute !== 'layer-0' ? ROUTE_TO_PANEL_ID[currentRoute] : undefined;
          return (
            <div
              className={`rounded-2xl border p-4 space-y-4 transition-colors ${
                isLight
                  ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                  : 'bg-neutral-900/80 border-amber-500/30 shadow-inner'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    ⚡ 7A 就地快调当前节点:
                  </span>
                  <span
                    className={
                      isLight
                        ? 'text-neutral-700 font-semibold'
                        : 'text-neutral-200 font-semibold'
                    }
                  >
                    {inspectorInfo.pageRecipeTarget.componentName} (
                    {inspectorInfo.pageRecipeTarget.label})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onNavigateShowcase && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateShowcase(
                          inspectorInfo.pageRecipeTarget.tab,
                          inspectorInfo.pageRecipeTarget.targetId
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer transition-colors ${
                        isLight
                          ? 'bg-white border-neutral-200 text-neutral-700 hover:border-amber-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-amber-500/50'
                      }`}
                    >
                      打开完整独立页 [{inspectorInfo.pageRecipeTarget.code}] ↗
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowInlineTuner(false)}
                    className="px-2 py-1 rounded-lg text-[11px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    收起 ▲
                  </button>
                </div>
              </div>

              {activePanelId && (
                <LocalPanelSizingTuner
                  panelId={activePanelId}
                  label={`${inspectorInfo.pageRecipeTarget.code} · ${inspectorInfo.pageRecipeTarget.componentName} 容器尺寸契约`}
                  recommendation="实时联动下方 7A 舞台容器与 6A 独立页面"
                  isLight={isLight}
                />
              )}

              {currentRoute === 'main-menu' && (
                <MainMenuStyleTuner
                  isLight={isLight}
                  compact
                  contextMode={layer1ContextMode}
                  onChangeContextMode={setLayer1ContextMode}
                />
              )}

              {(currentRoute === 'settings' || currentRoute === 'garage') && (
                <UnderlineTabsTuner isLight={isLight} showStandalonePreview={false} />
              )}

              {currentRoute === 'camera' && (
                <CameraSettingsStyleTuner
                  isLight={isLight}
                  showStandalonePreview={false}
                  compact
                />
              )}

              {inspectorInfo.usesSettingActionRow && currentRoute !== 'camera' && (
                <SettingActionRowTuner
                  isLight={isLight}
                  showStandalonePreview={false}
                />
              )}
            </div>
          );
        })()}

      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border text-xs transition-colors ${
          isLight
            ? 'bg-white/90 border-neutral-200/90 text-neutral-700 shadow-2xs'
            : 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-amber-500">
              6D→7A 自适应引擎:
            </span>
            <div
              className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isLight
                  ? 'bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setWidthMode('design-auto-expand')}
                className={`px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-colors ${
                  widthMode === 'design-auto-expand'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="以设计宽度为舒适基线，若内容更宽则自动撑大，若屏幕偏小则自动压缩"
              >
                设计基线+自动撑缩
              </button>
              <button
                type="button"
                onClick={() => setWidthMode('intrinsic-min')}
                className={`px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-colors ${
                  widthMode === 'intrinsic-min'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="如同 6D Floating Window：宽度完全贴合 DOM 探测出的不截断最小宽 (+16px 滚动条预留)"
              >
                6D 纯内容紧凑自适应
              </button>
            </div>
          </div>

          {currentRoute !== 'layer-0' && !isDockState && (
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className="text-neutral-400">面板实际:</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                {targetW}×{targetH}px
              </span>
              <span className="text-neutral-400">内容总高:</span>
              <span className="font-semibold">{activeRouteSize.intrinsicHeight}px</span>
              <span className="text-neutral-400 ml-1">MinW:</span>
              <button
                type="button"
                onClick={() =>
                  applyManualMinWidth(activeRouteSize.effectiveMinWidth - 1)
                }
                className={`px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
                title="最小宽 -1px"
              >
                -1
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={minWidthDraft}
                onFocus={() => setIsEditingMinWidth(true)}
                onChange={(e) => setMinWidthDraft(e.target.value)}
                onBlur={() => {
                  setIsEditingMinWidth(false);
                  const parsed = parseInt(minWidthDraft, 10);
                  if (Number.isFinite(parsed)) {
                    applyManualMinWidth(parsed);
                  } else {
                    setMinWidthDraft(
                      String(Math.round(activeRouteSize.effectiveMinWidth))
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    applyManualMinWidth(
                      activeRouteSize.effectiveMinWidth + (e.shiftKey ? 10 : 1)
                    );
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    applyManualMinWidth(
                      activeRouteSize.effectiveMinWidth - (e.shiftKey ? 10 : 1)
                    );
                  }
                }}
                className={`w-14 px-1.5 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                  hasManualMinOverride
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : isLight
                    ? 'border-neutral-300 bg-white text-neutral-800'
                    : 'border-neutral-700 bg-neutral-950 text-neutral-100'
                }`}
                title="直接输入整数最小宽 (Enter 确认，上下方向键 ±1px，Shift+方向键 ±10px)"
              />
              <button
                type="button"
                onClick={() =>
                  applyManualMinWidth(activeRouteSize.effectiveMinWidth + 1)
                }
                className={`px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
                title="最小宽 +1px"
              >
                +1
              </button>
              <span
                className="text-[10px] text-emerald-600 dark:text-emerald-400"
                title="已自动预留 16px 纵向滚动条安全槽位，防止小屏触发纵向滚动条时挤压横向文字"
              >
                [+{activeRouteSize.scrollbarReservePx}px Scrollbar]
              </span>
              {hasManualMinOverride && (
                <button
                  type="button"
                  onClick={handleResetAutoMinWidth}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-200/80 dark:bg-neutral-800 hover:text-amber-500 cursor-pointer"
                  title={`恢复 DOM 自动探测值 (${activeRouteSize.autoMinWidth}px)`}
                >
                  重置Auto({activeRouteSize.autoMinWidth})
                </button>
              )}
              {(activeRouteSize.isWidthSqueezed ||
                activeRouteSize.isHeightSqueezed) && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 font-bold">
                  画布挤压自动压缩中 (理想 {activeRouteSize.desiredWidth}×
                  {activeRouteSize.desiredHeight}px)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-neutral-400">画布边界检测:</span>
          {(
            [
              { id: 'full', label: '全宽画布 (自动撑大)' },
              { id: '1080p-compact', label: '1080p 紧凑 (760×520)' },
              { id: 'small-squeeze', label: '小屏挤压 (520×380)' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setContainerPreset(preset.id)}
              className={`px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                containerPreset === preset.id
                  ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
