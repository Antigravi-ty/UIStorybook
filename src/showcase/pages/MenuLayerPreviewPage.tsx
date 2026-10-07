import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  Volume2, 
  Check, 
  Info,
  Gamepad2,
  Wrench,
  Settings,
  Ruler
} from 'lucide-react';
import { MorphContainer, ContainerTransitionMode } from '../../navigation/transitions';
import { Badge } from '../../primitives/Badge';
import { 
  Layer1MainMenuRecipe,
  Layer2PlayRecipe,
  Layer2GarageRecipe,
  Layer2SettingsRecipe,
  Layer3AudioDetailRecipe,
  Layer3BallTrajectoryRecipe,
} from '../../recipes';

export type ActiveMenuRoute = 'main-menu' | 'play' | 'garage' | 'settings' | 'audio-eq' | 'trajectory';

export interface MenuLayerPreviewPageProps {
  isLight?: boolean;
  onNavigateToReserved?: () => void;
  /** 背景阴影/遮罩过渡时长 (单位: ms)，默认 250ms，允许修改 */
  backdropDuration?: number;
}

// 菜单层级配置与逻辑映射 (纯逻辑层，完全解耦样式)
export interface LayerRouteConfig {
  id: ActiveMenuRoute;
  label: string;
  layer: 1 | 2 | 3;
  width: number;
  parentRoute?: ActiveMenuRoute; // 所属二级父级菜单（Layer 3 专用）
}

export const MENU_ROUTE_CONFIG: Record<ActiveMenuRoute, LayerRouteConfig> = {
  'main-menu': { id: 'main-menu', label: 'Main Menu', layer: 1, width: 420 },
  'play': { id: 'play', label: 'Play Modes', layer: 2, width: 680, parentRoute: 'main-menu' },
  'garage': { id: 'garage', label: 'Garage Loadout', layer: 2, width: 680, parentRoute: 'main-menu' },
  'settings': { id: 'settings', label: 'Game Settings', layer: 2, width: 680, parentRoute: 'main-menu' },
  'audio-eq': { id: 'audio-eq', label: 'Acoustics & EQ', layer: 3, width: 480, parentRoute: 'settings' },
  'trajectory': { id: 'trajectory', label: 'Ball Trajectory Predictor', layer: 3, width: 480, parentRoute: 'settings' },
};

/**
 * 校验指定三级面板在当前路由上下文下是否允许切换
 * 纯逻辑函数：只有当处于对应二级父级菜单，或已经在该三级菜单内时，才可激活/切换。
 */
export const isLayer3RouteAvailable = (
  panelRoute: ActiveMenuRoute,
  currentRoute: ActiveMenuRoute
): boolean => {
  const cfg = MENU_ROUTE_CONFIG[panelRoute];
  if (!cfg || cfg.layer !== 3) return false;
  return currentRoute === cfg.parentRoute || currentRoute === panelRoute;
};

export const MenuLayerPreviewPage: React.FC<MenuLayerPreviewPageProps> = ({
  isLight = true,
  onNavigateToReserved,
  backdropDuration = 250,
}) => {
  // 当前预览路由状态（对应独立窗口层级）
  const [currentRoute, setCurrentRoute] = useState<ActiveMenuRoute>('main-menu');
  // 当前过渡动效模式 (流体形变 vs 三段时序分步)
  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph');
  // 目标 Settings 选项卡
  const [settingsTab, setSettingsTab] = useState<string>('gameplay');
  // 后台渲染暂停指示
  const [bgRenderPaused, setBgRenderPaused] = useState<boolean>(true);
  // 交互反馈提示
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2200);
  };

  // 各层级菜单标准宽度映射 (对标规范)
  const routeWidthMap: Record<ActiveMenuRoute, number> = {
    'main-menu': 420,
    'play': 680,
    'garage': 680,
    'settings': 680,
    'audio-eq': 480,
    'trajectory': 480,
  };

  const handleSelectRoute = (route: ActiveMenuRoute) => {
    setCurrentRoute(route);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 顶部标题与动效切换控制条：无冗余介绍，纯净标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Layer 实时预览</h1>
        </div>

        {/* 右侧轻量控制项：动效模式切换与布局数据导出 */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <button
            type="button"
            onClick={async () => {
              const previewStage = document.getElementById('storybook-preview-stage');
              if (!previewStage) return;

              const winW = window.innerWidth;
              const winH = window.innerHeight;
              const shellEl = previewStage.querySelector<HTMLElement>('[data-morph-container="true"], [data-panel="container"]');
              const headerEl = previewStage.querySelector<HTMLElement>('[data-ui-element="panel-header"]');
              const tabsEl = previewStage.querySelector<HTMLElement>('[role="tablist"]');
              const tabButtons = Array.from(previewStage.querySelectorAll<HTMLElement>('[role="tab"]'));
              const contentEl = previewStage.querySelector<HTMLElement>('[data-ui-element="panel-content"]');
              const footerEl = previewStage.querySelector<HTMLElement>('[data-ui-element="panel-footer"]');
              const cards = Array.from(previewStage.querySelectorAll<HTMLElement>('button[data-ui-element="car-card"], .grid button'));
              const colorItems = Array.from(previewStage.querySelectorAll<HTMLElement>('[data-ui-element="color-order-item"], .grid .rounded-lg'));

              const getPadStr = (cs: CSSStyleDeclaration) => `top=${cs.paddingTop} right=${cs.paddingRight} bottom=${cs.paddingBottom} left=${cs.paddingLeft}`;
              const getMarginStr = (cs: CSSStyleDeclaration) => `top=${cs.marginTop} right=${cs.marginRight} bottom=${cs.marginBottom} left=${cs.marginLeft}`;
              const getRectStr = (r: DOMRect) => `${Math.round(r.width * 10) / 10}px × ${Math.round(r.height * 10) / 10}px (x: ${Math.round(r.x)}, y: ${Math.round(r.y)})`;

              const lines: string[] = [];
              lines.push('========================================================================');
              lines.push(` [UI STORYBOOK SNAPSHOT] ROUTE: [${currentRoute.toUpperCase()}]`);
              lines.push('========================================================================');
              lines.push(`• Window Viewport: ${winW}px × ${winH}px`);

              if (shellEl) {
                const sRect = shellEl.getBoundingClientRect();
                const sCs = window.getComputedStyle(shellEl);
                lines.push('\n[1. MENU CONTAINER (OUTER SHELL)]');
                lines.push(`  • Size:         ${getRectStr(sRect)}`);
                lines.push(`  • Inline/CSS W: ${shellEl.style.width || sCs.width} (Max-W: ${sCs.maxWidth})`);
                lines.push(`  • Padding:      ${getPadStr(sCs)}`);
                lines.push(`  • Overflow:     ${sCs.overflow}`);
              }

              if (headerEl) {
                const hRect = headerEl.getBoundingClientRect();
                const hCs = window.getComputedStyle(headerEl);
                lines.push('\n[2. PANEL HEADER]');
                lines.push(`  • Size:         ${getRectStr(hRect)}`);
                lines.push(`  • Padding:      ${getPadStr(hCs)}`);
                lines.push(`  • Title:        "${headerEl.querySelector('h2')?.textContent?.trim() || ''}"`);
              }

              if (tabsEl) {
                const tRect = tabsEl.getBoundingClientRect();
                const tCs = window.getComputedStyle(tabsEl);
                lines.push('\n[3. UNDERLINE TABS (NAVIGATION HEADER)]');
                lines.push(`  • Tablist Size: ${getRectStr(tRect)}`);
                lines.push(`  • Tablist Pad:  ${getPadStr(tCs)}`);
                lines.push(`  • Tab Count:    ${tabButtons.length} tab(s)`);
                tabButtons.forEach((btn, idx) => {
                  const bRect = btn.getBoundingClientRect();
                  const bCs = window.getComputedStyle(btn);
                  const isSelected = btn.getAttribute('aria-selected') === 'true';
                  const label = btn.textContent?.trim() || `Tab ${idx + 1}`;
                  lines.push(`    [Tab #${idx + 1}] "${label}" (Active: ${isSelected})`);
                  lines.push(`      Size: ${getRectStr(bRect)} | Padding: ${getPadStr(bCs)} | Margin: ${getMarginStr(bCs)}`);
                });
              }

              if (contentEl) {
                const cRect = contentEl.getBoundingClientRect();
                const cCs = window.getComputedStyle(contentEl);
                lines.push('\n[4. PANEL CONTENT (BODY)]');
                lines.push(`  • Size:         ${getRectStr(cRect)}`);
                lines.push(`  • Scroll Size:  scrollWidth=${contentEl.scrollWidth}px, scrollHeight=${contentEl.scrollHeight}px`);
                lines.push(`  • Padding:      ${getPadStr(cCs)}`);
                lines.push(`  • Overflow:     X=${cCs.overflowX}, Y=${cCs.overflowY}`);
                lines.push(`  • Max-Height:   ${cCs.maxHeight}`);
              }

              if (cards.length > 0) {
                lines.push(`\n[5. CAR / OPTION CARDS (${cards.length} items)]`);
                cards.slice(0, 8).forEach((card, idx) => {
                  const cdRect = card.getBoundingClientRect();
                  const cdCs = window.getComputedStyle(card);
                  const title = card.querySelector('span')?.textContent?.trim() || `Card ${idx + 1}`;
                  lines.push(`    [Card #${idx + 1}] "${title}": ${getRectStr(cdRect)} | Pad: ${getPadStr(cdCs)}`);
                });
              }

              if (colorItems.length > 0) {
                lines.push(`\n[6. COLOR PALETTE ITEMS (${colorItems.length} items)]`);
                colorItems.slice(0, 12).forEach((item, idx) => {
                  const itemRect = item.getBoundingClientRect();
                  const itemCs = window.getComputedStyle(item);
                  const text = item.textContent?.replace(/\\s+/g, ' ').trim() || `Color ${idx + 1}`;
                  lines.push(`    [Color #${idx + 1}] "${text}": ${getRectStr(itemRect)} | Pad: ${getPadStr(itemCs)}`);
                });
              }

              if (footerEl) {
                const fRect = footerEl.getBoundingClientRect();
                const fCs = window.getComputedStyle(footerEl);
                lines.push('\n[7. PANEL FOOTER]');
                lines.push(`  • Size:         ${getRectStr(fRect)}`);
                lines.push(`  • Padding:      ${getPadStr(fCs)}`);
                lines.push(`  • Content:      "${footerEl.textContent?.replace(/\\s+/g, ' ').trim() || ''}"`);
              }

              lines.push('========================================================================\\n');
              const report = lines.join('\\n');
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

      {/* 顶部多层级快捷选择器区域：严格按窗口层级划分 */}
      <div
        className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        {/* Layer 1 选项 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="primary" size="sm" isLight={isLight}>
              Layer 1
            </Badge>
            <span>一级根菜单</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectRoute('main-menu')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'main-menu'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <span>MENU (主暂停根菜单)</span>
              <span className="font-mono text-[10px] opacity-75">420px</span>
            </button>
          </div>
        </div>

        {/* Layer 2 选项：展示当前根菜单下的三个二级功能菜单 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="warning" size="sm" isLight={isLight}>
              Layer 2
            </Badge>
            <span>二级功能菜单</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectRoute('play')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'play'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Play (模式选择 / 6 种玩法网格)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoute('garage')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'garage'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Garage (车库 / Car, Colour, Anthem, Name)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoute('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'settings'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings (9+1 Tabs 综合设置)</span>
              <span className="font-mono text-[10px] opacity-75">680px</span>
            </button>
          </div>
        </div>

        {/* Layer 3 选项：音频高级均衡器 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="success" size="sm" isLight={isLight}>
              Layer 3
            </Badge>
            <span>三级独立面板</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(() => {
              const available = isLayer3RouteAvailable('audio-eq', currentRoute);
              const isActive = currentRoute === 'audio-eq';

              return (
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    if (available) {
                      handleSelectRoute('audio-eq');
                    } else {
                      showToast('逻辑限制: 该三级面板隶属于 Game Settings，当前菜单禁止错误跨层级关联');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white border-emerald-500 font-semibold shadow-2xs cursor-pointer'
                      : available
                      ? isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 cursor-pointer shadow-2xs'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 cursor-pointer shadow-2xs'
                      : 'opacity-40 cursor-not-allowed bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 border-dashed border-neutral-300 dark:border-neutral-700 select-none'
                  }`}
                  title={
                    available
                      ? '点击直接进入 Acoustics & EQ (480px)'
                      : '此三级面板隶属于 Game Settings，当前菜单不可用'
                  }
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Acoustics & EQ (音频高级均衡器)</span>
                  <span className="font-mono text-[10px] opacity-75">480px</span>
                  {!available && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 font-mono">
                      需在 Settings 唤起
                    </span>
                  )}
                </button>
              );
            })()}

            {/* Layer 3 弹道预测器 (Live Preview 支持) */}
            {(() => {
              const available = isLayer3RouteAvailable('trajectory', currentRoute);
              const isActive = currentRoute === 'trajectory';

              return (
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    if (available) {
                      handleSelectRoute('trajectory');
                    } else {
                      showToast('逻辑限制: 该三级面板隶属于 Game Settings (Gameplay)，当前菜单禁止错误跨层级关联');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs cursor-pointer'
                      : available
                      ? isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 cursor-pointer shadow-2xs'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 cursor-pointer shadow-2xs'
                      : 'opacity-40 cursor-not-allowed bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 border-dashed border-neutral-300 dark:border-neutral-700 select-none'
                  }`}
                  title={
                    available
                      ? '点击直接进入 Ball Trajectory Predictor (支持 Tab 快捷键 Live Preview)'
                      : '此三级面板隶属于 Game Settings，当前菜单不可用'
                  }
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Ball Trajectory (弹道预测器 · Live Preview)</span>
                  <span className="font-mono text-[10px] opacity-75">480px</span>
                  {!available && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 font-mono">
                      需在 Settings 唤起
                    </span>
                  )}
                </button>
              );
            })()}

            {/* 动态逻辑关联状态提示 */}
            <span className={`text-[11px] font-mono ml-1.5 ${
              currentRoute === 'settings' || currentRoute === 'audio-eq' || currentRoute === 'trajectory'
                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                : isLight
                ? 'text-neutral-500'
                : 'text-neutral-400'
            }`}>
              {currentRoute === 'settings'
                ? '(✓ 已选中 Game Settings: 三级音频与弹道面板已就绪)'
                : currentRoute === 'audio-eq'
                ? '(当前处于 Layer 3 独立音频声场面板)'
                : currentRoute === 'trajectory'
                ? '(当前处于 Layer 3 弹道预测器面板，支持 Tab 快捷键收起/展开 Live Preview)'
                : '(请先进入 Game Settings 唤起关联三级面板)'}
            </span>
          </div>
        </div>

        {/* 状态与层级指引条 */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
            isLight ? 'bg-neutral-50 text-neutral-600' : 'bg-neutral-950/40 text-neutral-400'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-400">当前活跃窗口:</span>
            <span className="font-bold text-amber-500">
              {currentRoute === 'main-menu' && 'Layer 1: MENU (420px)'}
              {currentRoute === 'play' && 'Layer 2: Play Modes (680px)'}
              {currentRoute === 'garage' && 'Layer 2: Garage Loadout (680px)'}
              {currentRoute === 'settings' && 'Layer 2: Game Settings (680px)'}
              {currentRoute === 'audio-eq' && 'Layer 3: Acoustics & EQ (480px)'}
              {currentRoute === 'trajectory' && 'Layer 3: Ball Trajectory Predictor (480px · Live Preview)'}
            </span>
          </div>

          {feedbackToast && (
            <div className="text-amber-500 font-semibold flex items-center gap-1.5 animate-pulse">
              <Check className="h-3.5 w-3.5" />
              <span>{feedbackToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* 核心单一预览引擎容器 (Single-Container Live Preview Stage) */}
      <div
        id="storybook-preview-stage"
        className={`relative min-h-[580px] rounded-2xl border p-6 md:p-10 flex items-center justify-center overflow-hidden transition-colors ${
          isLight 
            ? 'bg-neutral-100/70 border-neutral-200/90 shadow-inner' 
            : 'bg-neutral-950/80 border-neutral-800 shadow-inner'
        }`}
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#d4d4d8 1px, transparent 1px)'
            : 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* 二级/三级菜单背景变暗遮罩 */}
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-none"
          style={{
            backgroundColor: currentRoute === 'main-menu' ? 'transparent' : 'rgba(0, 0, 0, 0.55)',
            transition: `background-color ${backdropDuration}ms cubic-bezier(0.2, 0.8, 0.25, 1)`,
          }}
        />

        {/* 单一 MorphContainer */}
        <MorphContainer
          currentKey={currentRoute}
          width={routeWidthMap[currentRoute]}
          mode={transitionMode}
          isLight={isLight}
          className={`rounded-2xl ${
            isLight
              ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
              : 'shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
          }`}
        >
          {/* Layer 1 根菜单 */}
          {currentRoute === 'main-menu' && (
            <Layer1MainMenuRecipe
              isLight={isLight}
              onResume={() => showToast('触发: 继续比赛 (Resume)')}
              onNavigatePlay={() => handleSelectRoute('play')}
              onNavigateGarage={() => handleSelectRoute('garage')}
              onNavigateSettings={(tab) => {
                if (tab) setSettingsTab(tab);
                handleSelectRoute('settings');
              }}
              backgroundRenderPaused={bgRenderPaused}
            />
          )}

          {/* Layer 2: Play Modes */}
          {currentRoute === 'play' && (
            <Layer2PlayRecipe
              isLight={isLight}
              onBack={() => handleSelectRoute('main-menu')}
              onSelectMode={(m) => showToast(`选择了玩法模式: ${m}`)}
            />
          )}

          {/* Layer 2: Garage */}
          {currentRoute === 'garage' && (
            <Layer2GarageRecipe
              isLight={isLight}
              onBack={() => handleSelectRoute('main-menu')}
            />
          )}

          {/* Layer 2: Settings */}
          {currentRoute === 'settings' && (
            <Layer2SettingsRecipe
              isLight={isLight}
              onBack={() => handleSelectRoute('main-menu')}
              initialTab={settingsTab}
              backgroundRenderPaused={bgRenderPaused}
              onToggleBackgroundRender={setBgRenderPaused}
              onNavigateAudioDetail={() => handleSelectRoute('audio-eq')}
              onNavigateTrajectoryDetail={() => handleSelectRoute('trajectory')}
            />
          )}

          {/* Layer 3: Audio Detail EQ */}
          {currentRoute === 'audio-eq' && (
            <Layer3AudioDetailRecipe
              isLight={isLight}
              onBack={() => handleSelectRoute('settings')}
            />
          )}

          {/* Layer 3: Ball Trajectory Predictor Configuration (Live Preview enabled) */}
          {currentRoute === 'trajectory' && (
            <Layer3BallTrajectoryRecipe
              isLight={isLight}
              onBack={() => handleSelectRoute('settings')}
            />
          )}
        </MorphContainer>
      </div>

      {/* 底部引导栏 */}
      {onNavigateToReserved && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-500 shrink-0" />
            <span className={isLight ? 'text-neutral-600' : 'text-neutral-400'}>
              赛后结算 (Match Post) 与遥测数据 (Match Stats) 等暂未纳入主对局的候选模板已保留在候选页面。
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToReserved}
            className="flex items-center gap-1 font-semibold text-amber-500 hover:text-amber-400 cursor-pointer shrink-0 transition-colors"
          >
            <span>查看预留战报规范</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
