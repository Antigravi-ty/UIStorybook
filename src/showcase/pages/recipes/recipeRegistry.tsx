import React, { Suspense, lazy } from 'react';
import { Eye, AlertCircle, Sparkles } from 'lucide-react';
import { CodeBlock } from '../../CodeBlock';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { Badge } from '../../../primitives/Badge';
import { Button } from '../../../primitives/Button';
import { QuickNotificationSystem } from '../../../navigation/QuickNotificationSystem';
import { readUrlParams, type UrlParamMap } from '../../stores';
import { LocalPanelSizingTuner, RECIPES_JUMP_ITEMS } from './LocalPanelSizingTuner';
import {
  DEEP_LAYER_RECIPE_SPECS,
  SingleDeepLayerRecipeCard,
} from './DeepLayerRecipesSection';
import {
  Layer1ContextGroupedSelector,
  resolveLayer1ContextSpec,
  type Layer1ContextVariation,
} from '../../../recipes/Layer1MainMenuRecipe';
import { useMainMenuStyleStore } from '../../../tokens/mainMenuStyleStore';
import type { JumpDirectoryItem } from '../../PageJumpDirectory';

const Layer1MainMenuRecipe = lazy(() =>
  import('../../../recipes/Layer1MainMenuRecipe').then((m) => ({
    default: m.Layer1MainMenuRecipe,
  }))
);
const Layer2PlayRecipe = lazy(() =>
  import('../../../recipes/Layer2PlayRecipe').then((m) => ({
    default: m.Layer2PlayRecipe,
  }))
);
const Layer2SettingsRecipe = lazy(() =>
  import('../../../recipes/settings').then((m) => ({
    default: m.Layer2SettingsRecipe,
  }))
);
const Layer2GarageRecipe = lazy(() =>
  import('../../../recipes/Layer2GarageRecipe').then((m) => ({
    default: m.Layer2GarageRecipe,
  }))
);
const Layer3AudioEqRecipe = lazy(() =>
  import('../../../recipes/Layer3AudioEqRecipe').then((m) => ({
    default: m.Layer3AudioEqRecipe,
  }))
);
const Layer3HostMatchRecipe = lazy(() =>
  import('../../../recipes/Layer3HostMatchRecipe').then((m) => ({
    default: m.Layer3HostMatchRecipe,
  }))
);
const Layer3JoinRoomRecipe = lazy(() =>
  import('../../../recipes/Layer3JoinRoomRecipe').then((m) => ({
    default: m.Layer3JoinRoomRecipe,
  }))
);
const MainMenuStyleTuner = lazy(() =>
  import('./MainMenuStyleTuner').then((m) => ({
    default: m.MainMenuStyleTuner,
  }))
);
const PanelShellTuner = lazy(() =>
  import('./PanelShellTuner').then((m) => ({
    default: m.PanelShellTuner,
  }))
);
const SettingActionRowTuner = lazy(() =>
  import('./SettingActionRowTuner').then((m) => ({
    default: m.SettingActionRowTuner,
  }))
);
const UnderlineTabsTuner = lazy(() =>
  import('./UnderlineTabsTuner').then((m) => ({
    default: m.UnderlineTabsTuner,
  }))
);
const CameraSettingsStyleTuner = lazy(() =>
  import('./CameraSettingsStyleTuner').then((m) => ({
    default: m.CameraSettingsStyleTuner,
  }))
);

/**
 * Sub-anchors that live inside `SettingActionRowTuner` (`6A.4S`).
 * When a user jumps to one of these anchors, we mount `SettingActionRowTuner`
 * and scroll to the sub-anchor.
 */
export const SETTING_ROW_SUB_ANCHOR_TO_ITEM_ID: Record<string, string> = {
  'setting-preset-custom-tuner': 'setting-action-row-tuner',
  '6A.4S-E': 'setting-action-row-tuner',
  'setting-dev-status-tuner': 'setting-action-row-tuner',
  '6A.4S-F': 'setting-action-row-tuner',
  'setting-telemetry-summary-tuner': 'setting-telemetry-summary-tuner',
  '6A.4S-H': 'setting-telemetry-summary-tuner',
};

/**
 * Fallback mapping from 7A `route` query param to 6A recipe ID when `?recipe=` and `#hash` are absent.
 */
const ROUTE_PARAM_TO_RECIPE_ID: Record<string, string> = {
  'main-menu': 'recipe-6a-1-main',
  play: 'recipe-6a-2-play',
  garage: 'recipe-6a-3-garage',
  settings: 'recipe-6a-4-settings',
  'additional-preview': 'recipe-6a-5-settings-preview',
  'room-host-control': 'recipe-6a-8-host-ctrl',
  'audio-eq': 'recipe-6a-7-audio',
  trajectory: 'recipe-6a-12c-trajectory',
  'online-warmup': 'recipe-6a-6a-host',
  'host-match': 'recipe-6a-6a-host',
  'join-room': 'recipe-6a-6b-join',
  'exhibition': 'recipe-6a-9-bot-diff',
  'self-training': 'recipe-6a-10-self-train',
  'kickoff-training': 'recipe-6a-11-kickoff',
  training: 'recipe-6a-18-training',
  'camera': 'recipe-6a-12-camera',
  keybindings: 'recipe-6a-12b-keybindings',
  'exp-multi-bots': 'recipe-6a-13-multibots',
  'dev-subsystem-isolation': 'recipe-6a-20-dev-isolation',
  'dev-active-tuners': 'recipe-6a-21-dev-tuners',
  'dev-calibrated-presets': 'recipe-6a-22-dev-presets',
  'dev-under-development': 'recipe-6a-23-dev-under-dev',
  'static-training-pack': 'recipe-6a-14-rcspack',
  'advanced-audio': 'recipe-6a-15-adv-audio',
  'controller-settings': 'recipe-6a-16-adv-ctrl',
  'event-trigger-rules': 'recipe-6a-17-triggers',
};

export interface ResolvedRecipeTarget {
  /** Canonical item `id` in `RECIPES_JUMP_ITEMS` */
  itemId: string;
  /** Optional sub-anchor DOM ID inside the mounted module (e.g. `setting-preset-custom-tuner`) */
  subAnchorId?: string;
}

/**
 * Resolves a raw token (DOM id, code like `6A.12`, or sub-anchor id) to a valid `RECIPES_JUMP_ITEMS` entry.
 */
export function matchRecipeToken(rawToken?: string | null): ResolvedRecipeTarget | null {
  if (!rawToken) return null;
  const clean = rawToken.startsWith('#') ? rawToken.slice(1).trim() : rawToken.trim();
  if (!clean) return null;

  // 1. Direct match by `id` or `code` (case-insensitive for code)
  const upper = clean.toUpperCase();
  const direct = RECIPES_JUMP_ITEMS.find(
    (it) => (it.id || it.targetId) === clean || it.code.toUpperCase() === upper
  );
  if (direct) {
    const id = direct.id || direct.targetId || 'recipe-6a-1-main';
    return {
      itemId: id,
      subAnchorId:
        id === 'setting-telemetry-summary-tuner'
          ? 'setting-telemetry-summary-tuner'
          : undefined,
    };
  }

  // 2. Match sub-anchors inside `SettingActionRowTuner` (e.g. `setting-preset-custom-tuner`, `6A.4S-E`)
  const mappedSub =
    SETTING_ROW_SUB_ANCHOR_TO_ITEM_ID[clean] ||
    SETTING_ROW_SUB_ANCHOR_TO_ITEM_ID[upper];
  if (mappedSub) {
    const subDomId =
      upper === '6A.4S-E'
        ? 'setting-preset-custom-tuner'
        : upper === '6A.4S-F'
        ? 'setting-dev-status-tuner'
        : upper === '6A.4S-H'
        ? 'setting-telemetry-summary-tuner'
        : clean;
    return {
      itemId: mappedSub,
      subAnchorId: subDomId,
    };
  }

  return null;
}

/**
 * Resolves the active 6A recipe from current URL query params (`?recipe=...` or `?route=...`) and `window.location.hash`.
 */
export function resolveActiveRecipeFromUrl(
  params: UrlParamMap = readUrlParams(),
  hash: string = typeof window !== 'undefined' ? window.location.hash : ''
): ResolvedRecipeTarget {
  // Priority 1: URL Hash (#recipe-6a-12-camera, #setting-preset-custom-tuner, etc.)
  const fromHash = matchRecipeToken(hash);
  if (fromHash) return fromHash;

  // Priority 2: Explicit ?recipe=... query param
  const fromRecipeParam = matchRecipeToken(params.recipe);
  if (fromRecipeParam) return fromRecipeParam;

  // Priority 3: Contextual ?route=... param carried over from 7A sandbox
  if (params.route && ROUTE_PARAM_TO_RECIPE_ID[params.route]) {
    return { itemId: ROUTE_PARAM_TO_RECIPE_ID[params.route] };
  }

  // Default: 6A.1 Layer 1 Root Main Menu
  return { itemId: 'recipe-6a-1-main' };
}

/**
 * Returns closely related sibling tuners/recipes for quick 1-click switching without returning to the full index.
 */
export function getRelatedRecipeItems(activeItemId: string): JumpDirectoryItem[] {
  const pick = (ids: string[]) =>
    ids
      .filter((id) => id !== activeItemId)
      .map((id) => RECIPES_JUMP_ITEMS.find((it) => (it.id || it.targetId) === id))
      .filter((it): it is JumpDirectoryItem => Boolean(it));

  if (activeItemId === 'recipe-6a-1-main' || activeItemId === 'main-menu-style-tuner') {
    return pick(['recipe-6a-1-main', 'main-menu-style-tuner', 'panel-shell-tuner']);
  }

  if (activeItemId === 'recipe-6a-12-camera' || activeItemId === 'camera-settings-style-tuner') {
    return pick(['recipe-6a-12-camera', 'camera-settings-style-tuner', 'panel-shell-tuner']);
  }

  if (
    activeItemId === 'recipe-6a-4-settings' ||
    activeItemId === 'underline-tabs-tuner' ||
    activeItemId === 'setting-action-row-tuner' ||
    activeItemId === 'setting-telemetry-summary-tuner' ||
    activeItemId === 'recipe-6a-5-settings-preview'
  ) {
    return pick([
      'recipe-6a-4-settings',
      'underline-tabs-tuner',
      'setting-action-row-tuner',
      'setting-telemetry-summary-tuner',
      'recipe-6a-5-settings-preview',
      'panel-shell-tuner',
    ]);
  }

  if (
    activeItemId === 'recipe-6a-6a-host' ||
    activeItemId === 'recipe-6a-6b-join' ||
    activeItemId === 'recipe-6a-8-host-ctrl'
  ) {
    return pick([
      'recipe-6a-6a-host',
      'recipe-6a-6b-join',
      'recipe-6a-8-host-ctrl',
      'panel-shell-tuner',
    ]);
  }

  if (
    activeItemId.startsWith('recipe-6a-20') ||
    activeItemId.startsWith('recipe-6a-21') ||
    activeItemId.startsWith('recipe-6a-22') ||
    activeItemId.startsWith('recipe-6a-23')
  ) {
    return pick([
      'recipe-6a-20-dev-isolation',
      'recipe-6a-21-dev-tuners',
      'recipe-6a-22-dev-presets',
      'recipe-6a-23-dev-under-dev',
      'panel-shell-tuner',
    ]);
  }

  return pick(['panel-shell-tuner', 'setting-action-row-tuner']);
}

export interface SingleRecipeRenderContext {
  isLight: boolean;
  simulateLayer3Error: boolean;
  onToggleLayer3Error: (enabled: boolean) => void;
  onSelectRecipeId: (itemId: string) => void;
}

const noop = () => {};

/**
 * Isolated Stage for `6A.1` (`recipe-6a-1-main`) so subscribing to `useMainMenuStyleStore`
 * only happens when `6A.1` is mounted, keeping all other 6A recipes 100% decoupled.
 */
const Layer1MainMenuSyncedStage: React.FC<{
  isLight: boolean;
  previewWrapClass: string;
  suspenseFallback: React.ReactNode;
  onSelectRecipeId: (itemId: string) => void;
}> = React.memo(({ isLight, previewWrapClass, suspenseFallback, onSelectRecipeId }) => {
  const {
    previewContextMode,
    setPreviewContextMode,
    variant,
    titleFontSizePx,
    titleFontFamily,
    showDescription,
    showIconBox,
  } = useMainMenuStyleStore();

  const [showInlineStyleTuner, setShowInlineStyleTuner] = React.useState(false);

  const activeCtxMeta = resolveLayer1ContextSpec(previewContextMode);
  const activeCtx = activeCtxMeta.id;

  return (
    <div id="recipe-6a-1-main" className="scroll-mt-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
            6A.1
          </span>
          <h2 className="text-base font-bold">
            Layer 1 根暂停菜单完整预览 (MENU · 与 [6A.1M] 调优台及多屏对局模式 100% 实时同步)
          </h2>
          <Badge variant="success" size="sm" isLight={isLight}>
            {activeCtxMeta.shortLabel} [{activeCtxMeta.headerTitle}] · {titleFontSizePx}px
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowInlineStyleTuner((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
              showInlineStyleTuner
                ? 'bg-amber-500 text-neutral-950 border-amber-500'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {showInlineStyleTuner
                ? '收起同屏内联 [6A.1M] 细调面板 ▲'
                : '在当前页同屏展开 [6A.1M] 细调面板 ▼'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectRecipeId('main-menu-style-tuner')}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 cursor-pointer transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>切换至独立 [6A.1M] 调优工作台 →</span>
          </button>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
              isLight
                ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>只读预览：保留完整 Hover 动效，已拦截点击跳转</span>
          </span>
        </div>
      </div>

      {/* Synchronized Context Mode Selector Bar (Mirrored with 6A.1M) */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
          isLight
            ? 'bg-amber-50/40 border-amber-200/80'
            : 'bg-amber-500/5 border-amber-500/25'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Eye className="h-4 w-4" />
            <span>
              对局模式分类切换 (Free Play / Exhibition / Match Lobby / Online Match / Online Warmup / Training · 与 [6A.1M] 双向实时同步)
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            当前样式: {variant} · {titleFontFamily === 'mono' ? 'JetBrains Mono' : 'Apple Sans'}{' '}
            {titleFontSizePx}px · {showIconBox ? '带图标内框' : '无图标内框'} ·{' '}
            {showDescription ? '含 Description' : '无 Description'}
          </span>
        </div>

        <Layer1ContextGroupedSelector
          activeContext={activeCtx}
          onSelectContext={(ctx) => setPreviewContextMode(ctx)}
          tierFilter="all"
          isLight={isLight}
        />
      </div>

      <LocalPanelSizingTuner
        code="6A.1"
        panelId="layer1-main"
        label="Layer 1 主菜单容器尺寸契约 (MENU Outer Shell)"
        recommendation="推荐 Auto-Fit：切换极简大字 / 显示 Description / 不同模式按钮数量时容器高度自动伸缩，绝不留底部白边"
        isLight={isLight}
      />

      {showInlineStyleTuner && (
        <Suspense fallback={suspenseFallback}>
          <MainMenuStyleTuner
            isLight={isLight}
            codeBadge="6A.1M"
            showLivePreview={false}
            contextMode={activeCtx}
            onChangeContextMode={setPreviewContextMode}
          />
        </Suspense>
      )}

      <div
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={previewWrapClass}
      >
        <Suspense fallback={suspenseFallback}>
          <Layer1MainMenuRecipe isLight={isLight} contextMode={activeCtx} />
        </Suspense>
      </div>

      <CodeBlock
        isLight={isLight}
        title="Layer1MainMenuRecipe.tsx (Decoupled MainMenuRow + useMainMenuStyleStore)"
        code={`const { panels } = useMenuLayoutStore();
const sizing = panels['layer1-main']; // default: { mode: 'auto', width: 420, minHeight: 240, maxHeight: 540 }
const menuStyle = useMainMenuStyleStore();

return (
  <PanelContainer isLight={isLight} sizing={sizing} className="w-full">
    <PanelHeader ... />
    <PanelContent scrollable>
      <MenuContainer gapPx={menuStyle.itemGapPx} paddingPx={menuStyle.menuContainerPaddingPx}>
        <MainMenuRow slotId="resume" title={menuStyle.conciseResumeLabel ? 'Resume' : 'Resume Match'} shortcut="ESC" variant="primary" styleParams={menuStyle} />
        <MenuDivider marginYPx={menuStyle.dividerMarginYPx} />
        <MainMenuRow slotId="play" title="Play" hasArrow styleParams={menuStyle} />
        <MainMenuRow slotId="garage" title="Garage" hasArrow styleParams={menuStyle} />
        <MainMenuRow slotId="settings" title="Settings" hasArrow styleParams={menuStyle} />
      </MenuContainer>
    </PanelContent>
    <PanelFooter ... />
  </PanelContainer>
);`}
      />
    </div>
  );
});
Layer1MainMenuSyncedStage.displayName = 'Layer1MainMenuSyncedStage';

/**
 * Renders ONLY the requested 6A module (`itemId`) on demand.
 * Each case is isolated and code-split via React.lazy so modifying any single recipe never couples with others.
 */
export const OnDemandRecipeStage: React.FC<
  SingleRecipeRenderContext & { itemId: string }
> = React.memo(({ itemId, isLight, simulateLayer3Error, onToggleLayer3Error, onSelectRecipeId }) => {
  const previewWrapClass = `flex justify-center p-6 rounded-2xl border transition-colors ${
    isLight
      ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
      : 'border-neutral-800 bg-neutral-950/60'
  }`;

  const suspenseFallback = (
    <div className="py-12 text-xs font-mono text-neutral-400 text-center">
      正在按需加载 6A 模块...
    </div>
  );

  // 1. Check if it's one of the 6A.8 – 6A.23 Deep Layer Recipes
  const deepSpec = DEEP_LAYER_RECIPE_SPECS.find((s) => s.id === itemId);
  if (deepSpec) {
    return <SingleDeepLayerRecipeCard spec={deepSpec} isLight={isLight} />;
  }

  // 2. Handle 6A.1 – 6A.7 and Tuners (6A.1M, 6A.2S, 6A.4T, 6A.4S, 6A.4S-H)
  switch (itemId) {
    case 'recipe-6a-1-main':
      return (
        <Layer1MainMenuSyncedStage
          isLight={isLight}
          previewWrapClass={previewWrapClass}
          suspenseFallback={suspenseFallback}
          onSelectRecipeId={onSelectRecipeId}
        />
      );

    case 'main-menu-style-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <MainMenuStyleTuner isLight={isLight} codeBadge="6A.1M" />
        </Suspense>
      );

    case 'camera-settings-style-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <CameraSettingsStyleTuner isLight={isLight} codeBadge="6A.12M" />
        </Suspense>
      );

    case 'panel-shell-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <PanelShellTuner
            isLight={isLight}
            codeBadge="6A.2S"
            title="Layer 2+ 通用三段式面板壳体调优器 (Header 字号/返回按钮/内衬 · Content 内衬 · Footer 内衬)"
          />
        </Suspense>
      );

    case 'recipe-6a-2-play':
      return (
        <div id="recipe-6a-2-play" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.2
            </span>
            <h2 className="text-base font-bold">
              Layer 2 游戏模式选择面板菜谱 (Play · 单视图网格推荐 Auto-Fit)
            </h2>
          </div>

          <LocalPanelSizingTuner
            code="6A.2"
            panelId="layer2-play"
            label="Layer 2 Play 模式选择"
            recommendation="推荐 Auto-Fit：无内部 Tab 切换，高度自动贴合 2×3 模式卡片"
            isLight={isLight}
          />

          <div className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <Layer2PlayRecipe isLight={isLight} onBack={noop} />
            </Suspense>
          </div>
        </div>
      );

    case 'recipe-6a-3-garage':
      return (
        <div id="recipe-6a-3-garage" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.3
            </span>
            <h2 className="text-base font-bold">
              Layer 2 车辆预设与外观配置菜谱 (Garage · 多 Tab 推荐 Fixed 锁定高度)
            </h2>
          </div>

          <LocalPanelSizingTuner
            code="6A.3"
            panelId="layer2-garage"
            label="Layer 2 Garage 车库配置"
            recommendation="推荐 Fixed：含 Car / Colour / Anthem / Player Name 4 个 Tab，锁定高度防止切换 Tab 时窗口跳动"
            isLight={isLight}
          />

          <div className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <Layer2GarageRecipe isLight={isLight} onBack={noop} />
            </Suspense>
          </div>
        </div>
      );

    case 'recipe-6a-4-settings':
    case 'recipe-6a-5-settings-preview':
      return (
        <div id={itemId} className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-mono font-bold text-xs">
                {itemId === 'recipe-6a-5-settings-preview' ? '6A.5' : '6A.4'}
              </span>
              <h2 className="text-base font-bold">
                Layer 2 综合系统设置面板菜谱 (Settings · 9+1 Tabs 尺寸调优与实时交互预览)
              </h2>
            </div>
            <Badge variant="neutral" size="sm" isLight={isLight}>
              9+1 Tabs · Live Interactive Preview
            </Badge>
          </div>

          <LocalPanelSizingTuner
            code="6A.4"
            panelId="layer2-settings"
            label="Layer 2 Settings 系统设置"
            recommendation="推荐 Fixed：含 9+1 个高度各异的设置 Tab，锁定专属高度确保切 Tab 时顶部导航位置恒定"
            isLight={isLight}
          />

          <div id="recipe-6a-5-settings-preview" className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <Layer2SettingsRecipe
                isLight={isLight}
                initialTab={readUrlParams().subtab || 'gameplay'}
                onBack={noop}
              />
            </Suspense>
          </div>
        </div>
      );

    case 'underline-tabs-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <UnderlineTabsTuner
            isLight={isLight}
            codeBadge="6A.4T"
            showStandalonePreview={true}
            title="Layer 2 Settings · UnderlineTabs 顶栏标签调优器 (字号 · Icon Size · 间距 · 字重)"
          />
        </Suspense>
      );

    case 'setting-action-row-tuner':
    case 'setting-telemetry-summary-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <SettingActionRowTuner
            isLight={isLight}
            codeBadge={itemId === 'setting-telemetry-summary-tuner' ? '6A.4S-H' : '6A.4S'}
            showStandalonePreview={true}
            title="Layer 2 Settings · SettingActionRow 内部导航行调优器 (外框 · Description 显隐 · Padding · SVG 图标色 · Telemetry 折叠)"
          />
        </Suspense>
      );

    case 'recipe-6a-6a-host':
      return (
        <div id="recipe-6a-6a-host" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.6A
            </span>
            <h2 className="text-base font-bold">
              Layer 3 创建联机房间独立专页 (Host Match · 房主权威规则与单行内联报错 Check notification ↗)
            </h2>
            <Badge variant="amber" size="sm" isLight={isLight}>
              独立页面 1/2 · 仅含 Host 专属参数
            </Badge>
          </div>

          <LocalPanelSizingTuner
            code="6A.6A"
            panelId="layer3-host-match"
            label="Layer 3 Host Match (创建房间专页)"
            recommendation="推荐 Fixed：承载房主初始模式、密码、Bot 填充策略、时长及内联报错弹性压缩"
            isLight={isLight}
            extraControls={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ToggleSwitch
                  checked={simulateLayer3Error}
                  onCheckedChange={onToggleLayer3Error}
                  label="模拟三级菜单单行内联报错 (Something went wrong. Check notification ↗)"
                  variant="neutral"
                  isLight={isLight}
                />
                <Button
                  size="sm"
                  variant={simulateLayer3Error ? 'danger' : 'secondary'}
                  isLight={isLight}
                  icon={<AlertCircle className="h-3.5 w-3.5" />}
                  onClick={() => onToggleLayer3Error(!simulateLayer3Error)}
                >
                  {simulateLayer3Error ? '清除报错状态' : '触发内联报错并压入通知栈'}
                </Button>
              </div>
            }
          />

          <div
            className={`relative flex justify-center p-6 pt-16 rounded-2xl border transition-colors overflow-hidden ${
              isLight
                ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
                : 'border-neutral-800 bg-neutral-950/60'
            }`}
          >
            <QuickNotificationSystem isLight={isLight} absolute={true} />
            <Suspense fallback={suspenseFallback}>
              <Layer3HostMatchRecipe isLight={isLight} onBack={noop} />
            </Suspense>
          </div>
        </div>
      );

    case 'recipe-6a-6b-join':
      return (
        <div id="recipe-6a-6b-join" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.6B
            </span>
            <h2 className="text-base font-bold">
              Layer 3 加入联机房间独立专页 (Join Room · 客户端席位与 Sub-Tick 缓冲深度)
            </h2>
            <Badge variant="primary" size="sm" isLight={isLight}>
              独立页面 2/2 · 仅含 Client 专属参数
            </Badge>
          </div>

          <LocalPanelSizingTuner
            code="6A.6B"
            panelId="layer3-join-room"
            label="Layer 3 Join Room (加入房间专页)"
            recommendation="推荐 Fixed：独立承载目标房间号、初始队伍/观战席位选择与客户端 Sub-Tick 输入缓冲"
            isLight={isLight}
          />

          <div
            className={`relative flex justify-center p-6 pt-16 rounded-2xl border transition-colors overflow-hidden ${
              isLight
                ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
                : 'border-neutral-800 bg-neutral-950/60'
            }`}
          >
            <QuickNotificationSystem isLight={isLight} absolute={true} />
            <Suspense fallback={suspenseFallback}>
              <Layer3JoinRoomRecipe isLight={isLight} onBack={noop} />
            </Suspense>
          </div>
        </div>
      );

    case 'recipe-6a-7-audio':
      return (
        <div id="recipe-6a-7-audio" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.7
            </span>
            <h2 className="text-base font-bold">
              Layer 3 音频高级均衡器菜谱 (Acoustics & EQ)
            </h2>
          </div>

          <LocalPanelSizingTuner
            code="6A.7"
            panelId="layer3-audio-eq"
            label="Layer 3 Acoustics & EQ"
            recommendation="推荐 Fixed：锁定高度并在报错时自动压缩内部卡片间距"
            isLight={isLight}
          />

          <div className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <Layer3AudioEqRecipe isLight={isLight} onBack={noop} />
            </Suspense>
          </div>
        </div>
      );

    default:
      return null;
  }
});

OnDemandRecipeStage.displayName = 'OnDemandRecipeStage';
