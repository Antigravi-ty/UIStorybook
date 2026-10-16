import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Eye,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import { CodeBlock } from '../CodeBlock';
import { SliderControl } from '../../primitives/SliderControl';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../primitives/SegmentedSwitch';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { QuickNotificationSystem } from '../../navigation/QuickNotificationSystem';
import {
  useMenuLayoutStore,
  type MenuPanelId,
  type PanelSizingMode,
} from '../../tokens';
import { useQuickNotificationStore } from '../../tokens/quickNotificationStore';
import { Layer1MainMenuRecipe } from '../../recipes/Layer1MainMenuRecipe';
import { Layer2PlayRecipe } from '../../recipes/Layer2PlayRecipe';
import { Layer2SettingsRecipe } from '../../recipes/Layer2SettingsRecipe';
import { Layer2GarageRecipe } from '../../recipes/Layer2GarageRecipe';
import { Layer2AdditionalPreviewRecipe } from '../../recipes/Layer2AdditionalPreviewRecipe';
import { Layer3AudioDetailRecipe } from '../../recipes/Layer3AudioDetailRecipe';
import {
  Layer3OnlineWarmupRecipe,
  dispatchOnlineRoomErrorNotification,
} from '../../recipes/Layer3OnlineWarmupRecipe';

interface LocalPanelSizingTunerProps {
  panelId: MenuPanelId;
  label: string;
  recommendation: string;
  isLight: boolean;
  extraControls?: React.ReactNode;
}

/**
 * 就近放置的单面板尺寸契约调优条 (Co-located Per-Panel Sizing Inspector)
 * 支持在每个具体面板上方独立切换 'auto' (自动贴合内容 + min/max 夹逼) 与 'fixed' (固定目标高度 + 小屏回退)。
 */
const LocalPanelSizingTuner: React.FC<LocalPanelSizingTunerProps> = ({
  panelId,
  label,
  recommendation,
  isLight,
  extraControls,
}) => {
  const { panels, setPanelSizing, resetPanelSizing } = useMenuLayoutStore();
  const cfg = panels[panelId];

  return (
    <div
      className={`p-4 rounded-xl border flex flex-col gap-3.5 transition-colors ${
        isLight
          ? 'bg-white border-neutral-200/90 shadow-2xs'
          : 'bg-neutral-900/70 border-neutral-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-200/70 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          <Maximize2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-xs font-bold">{label} · 面板独立尺寸控制</span>
          <Badge
            variant={cfg.mode === 'auto' ? 'success' : 'primary'}
            size="sm"
            isLight={isLight}
          >
            {cfg.mode === 'auto'
              ? `Auto-Fit (${cfg.width}px × [${cfg.minHeight}~${cfg.maxHeight}px])`
              : `Fixed (${cfg.width}×${cfg.targetHeight}px)`}
          </Badge>
          <span
            className={`text-[11px] font-mono ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            {recommendation}
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          isLight={isLight}
          icon={<RotateCcw className="h-3 w-3" />}
          onClick={() => resetPanelSizing(panelId)}
        >
          重置此面板
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Mode Switcher */}
        <div className="md:col-span-4 flex flex-col gap-1">
          <span
            className={`text-[11px] font-semibold ${
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}
          >
            高度模式 (Sizing Mode)
          </span>
          <SegmentedSwitch
            value={cfg.mode}
            onValueChange={(v) => setPanelSizing(panelId, { mode: v as PanelSizingMode })}
            isLight={isLight}
            options={[
              { value: 'auto', label: 'Auto-Fit (贴合内容)' },
              { value: 'fixed', label: 'Fixed (锁定高度)' },
            ]}
          />
        </div>

        {/* Width Slider */}
        <div className="md:col-span-4">
          <SliderControl
            label="面板宽度 (width)"
            value={cfg.width}
            min={360}
            max={820}
            step={10}
            unit="px"
            colorScheme="amber"
            onChange={(v) => setPanelSizing(panelId, { width: v })}
            isLight={isLight}
          />
        </div>

        {/* Height Sliders depending on mode */}
        {cfg.mode === 'fixed' ? (
          <div className="md:col-span-4">
            <SliderControl
              label="锁定高度 (targetHeight)"
              value={cfg.targetHeight}
              min={260}
              max={720}
              step={10}
              unit="px"
              colorScheme="emerald"
              onChange={(v) => setPanelSizing(panelId, { targetHeight: v })}
              isLight={isLight}
            />
          </div>
        ) : (
          <div className="md:col-span-4 grid grid-cols-2 gap-3">
            <SliderControl
              label="最小高度 (minH)"
              value={cfg.minHeight}
              min={180}
              max={480}
              step={10}
              unit="px"
              colorScheme="emerald"
              onChange={(v) =>
                setPanelSizing(panelId, {
                  minHeight: Math.min(v, cfg.maxHeight - 20),
                })
              }
              isLight={isLight}
            />
            <SliderControl
              label="最大高度 (maxH)"
              value={cfg.maxHeight}
              min={300}
              max={760}
              step={10}
              unit="px"
              colorScheme="sky"
              onChange={(v) =>
                setPanelSizing(panelId, {
                  maxHeight: Math.max(v, cfg.minHeight + 20),
                })
              }
              isLight={isLight}
            />
          </div>
        )}
      </div>

      {extraControls && (
        <div className="pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/80">
          {extraControls}
        </div>
      )}
    </div>
  );
};

export const RecipesPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const {
    dividerMarginY,
    menuItemGap,
    menuItemPaddingY,
    menuContainerPadding,
    panelContentPaddingY,
    showAdditionalPreviews,
    simulateLayer3Error,
    setToken,
    resetTokens,
    exportConfigCode,
  } = useMenuLayoutStore();

  const [copiedConfig, setCopiedConfig] = useState(false);
  const [showExportBlock, setShowExportBlock] = useState(false);

  const handleCopyConfig = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
  };

  const handleToggleLayer3Error = (enabled: boolean) => {
    setToken('simulateLayer3Error', enabled);
    if (enabled) {
      dispatchOnlineRoomErrorNotification();
      const st = useQuickNotificationStore.getState();
      if (st.activeNotification) {
        st.collapseActive();
      }
      st.setStackOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-4xl">
      {/* Top Header & Global Export Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                6A · Layer 1-2-3 菜单代码谱与就近参数调优器
              </h1>
              <Badge variant="primary" size="sm" isLight={isLight}>
                L0 → L6 → L7 实时联动
              </Badge>
            </div>
            <p
              className={`text-xs mt-1.5 leading-relaxed ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              采用<strong>「按面板独立配置 + Auto-Fit / Fixed 双模式」</strong>架构：每个面板的控制面板就近放置在其正上方。
              无 Tab 切换的面板（如 Layer 1 主菜单、Play）默认使用 <code className="font-mono">Auto-Fit</code> 紧贴内容高度（上限超出或小屏受压时自动转 Scrolling）；
              含多 Tab 切换或防抖面板（如 Garage、Settings、Layer 3）默认使用 <code className="font-mono">Fixed</code> 锁定专属高度。所有参数实时同步至 <strong>7A 全链路沙盒</strong>。
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={<Code2 className="h-3.5 w-3.5" />}
              onClick={() => setShowExportBlock((prev) => !prev)}
            >
              {showExportBlock ? '隐藏固化代码' : '查看固化代码'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              isLight={isLight}
              icon={copiedConfig ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={handleCopyConfig}
            >
              {copiedConfig ? '已复制配置!' : '导出 / 复制全部配置'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isLight={isLight}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={resetTokens}
            >
              重置全部默认
            </Button>
          </div>
        </div>

        {showExportBlock && (
          <CodeBlock
            isLight={isLight}
            title="src/tokens/menuLayoutStore.ts (导出全部面板尺寸与排版固化配置)"
            code={exportConfigCode()}
          />
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 1: Layer 1 Root MENU + Co-located Menu Spacing & Sizing Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-base font-bold">
              Layer 1 根暂停菜单菜谱 (MENU · 默认 Auto-Fit 贴合 4/5 按钮高度)
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
              isLight
                ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>只读预览：保留完整 Hover 动效，已拦截点击跳转 (Prevent Default)</span>
          </span>
        </div>

        {/* Co-located Tuner for Layer 1 Main Menu + Global Menu Item Spacing */}
        <LocalPanelSizingTuner
          panelId="layer1-main"
          label="Layer 1 主菜单 (MENU)"
          recommendation="推荐 Auto-Fit：切换 4/5 个按钮时容器高度自动伸缩，绝不留底部白边"
          isLight={isLight}
          extraControls={
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold">
                  Menu 列表排版参数 (按钮间距默认 4px · 分割线 · 内衬)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SliderControl
                  label="按钮垂直间距 (menuItemGap)"
                  value={menuItemGap}
                  min={0}
                  max={16}
                  step={1}
                  unit="px"
                  colorScheme="amber"
                  onChange={(v) => setToken('menuItemGap', v)}
                  isLight={isLight}
                />
                <SliderControl
                  label="分割线上下边距 (dividerMarginY)"
                  value={dividerMarginY}
                  min={0}
                  max={14}
                  step={1}
                  unit="px"
                  colorScheme="amber"
                  onChange={(v) => setToken('dividerMarginY', v)}
                  isLight={isLight}
                />
                <SliderControl
                  label="按钮内部上下内衬 (itemPadY)"
                  value={menuItemPaddingY}
                  min={6}
                  max={18}
                  step={1}
                  unit="px"
                  colorScheme="amber"
                  onChange={(v) => setToken('menuItemPaddingY', v)}
                  isLight={isLight}
                />
                <SliderControl
                  label="内容区上下内衬 (contentPadY)"
                  value={panelContentPaddingY}
                  min={6}
                  max={28}
                  step={2}
                  unit="px"
                  colorScheme="emerald"
                  onChange={(v) => setToken('panelContentPaddingY', v)}
                  isLight={isLight}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <ToggleSwitch
                  checked={showAdditionalPreviews}
                  onCheckedChange={(v) => setToken('showAdditionalPreviews', v)}
                  label="显示第 5 个按钮 (Additional Previews) — 观察 Auto-Fit 下容器高度自动贴合"
                  variant="neutral"
                  isLight={isLight}
                />
                <div className="w-48">
                  <SliderControl
                    label="菜单外框内衬 (containerPad)"
                    value={menuContainerPadding}
                    min={0}
                    max={12}
                    step={1}
                    unit="px"
                    colorScheme="sky"
                    onChange={(v) => setToken('menuContainerPadding', v)}
                    isLight={isLight}
                  />
                </div>
              </div>
            </div>
          }
        />

        {/* Read-only click interceptor wrapper: preserves 100% CSS :hover & group-hover effects while preventing navigation */}
        <div
          onClickCapture={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
              : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer1MainMenuRecipe isLight={isLight} />
        </div>

        <CodeBlock
          isLight={isLight}
          title="Layer1MainMenuRecipe.tsx"
          code={`const { panels, panelContentPaddingY, showAdditionalPreviews } = useMenuLayoutStore();
const sizing = panels['layer1-main']; // default: { mode: 'auto', width: 420, minHeight: 240, maxHeight: 540 }

return (
  <PanelContainer isLight={isLight} sizing={sizing} className="w-full">
    <PanelHeader ... />
    <PanelContent scrollable style={{ paddingTop: panelContentPaddingY, paddingBottom: panelContentPaddingY }}>
      <MenuContainer>
        <MenuItem title="Resume Match" shortcut="ESC" variant="primary" />
        <MenuDivider />
        <MenuItem title="Play" hasArrow />
        <MenuItem title="Garage" hasArrow />
        <MenuItem title="Settings" hasArrow />
        {showAdditionalPreviews && <MenuItem title="Additional Previews" hasArrow />}
      </MenuContainer>
    </PanelContent>
    <PanelFooter ... />
  </PanelContainer>
);`}
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 2: Layer 2 Play Modes + Co-located Sizing Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h2 className="text-base font-bold">
            Layer 2 游戏模式选择面板菜谱 (Play · 单视图网格推荐 Auto-Fit)
          </h2>
        </div>

        <LocalPanelSizingTuner
          panelId="layer2-play"
          label="Layer 2 Play 模式选择"
          recommendation="推荐 Auto-Fit：无内部 Tab 切换，高度自动贴合 2×3 模式卡片"
          isLight={isLight}
        />

        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
              : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2PlayRecipe isLight={isLight} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 3: Layer 2 Garage + Co-located Sizing Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
            3
          </span>
          <h2 className="text-base font-bold">
            Layer 2 车辆预设与外观配置菜谱 (Garage · 多 Tab 推荐 Fixed 锁定高度)
          </h2>
        </div>

        <LocalPanelSizingTuner
          panelId="layer2-garage"
          label="Layer 2 Garage 车库配置"
          recommendation="推荐 Fixed：含 Car / Colour / Anthem / Player Name 4 个 Tab，锁定高度防止切换 Tab 时窗口跳动"
          isLight={isLight}
        />

        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
              : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2GarageRecipe isLight={isLight} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 4: Layer 2 Settings + Co-located Sizing Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">
            4
          </span>
          <h2 className="text-base font-bold">
            Layer 2 综合系统设置面板菜谱 (Settings · 9+1 Tabs 推荐 Fixed 锁定高度)
          </h2>
        </div>

        <LocalPanelSizingTuner
          panelId="layer2-settings"
          label="Layer 2 Settings 系统设置"
          recommendation="推荐 Fixed：含 9+1 个高度各异的设置 Tab，锁定专属高度确保切 Tab 时顶部导航位置恒定"
          isLight={isLight}
        />

        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
              : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2SettingsRecipe isLight={isLight} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 5: Layer 2 Additional Previews + Co-located Sizing Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-xs">
            5
          </span>
          <h2 className="text-base font-bold">
            Layer 2 附加预览与悬浮窗沙盒菜谱 (Additional Previews)
          </h2>
        </div>

        <LocalPanelSizingTuner
          panelId="layer2-previews"
          label="Layer 2 Additional Previews"
          recommendation="可自由选择 Auto-Fit 或 Fixed"
          isLight={isLight}
        />

        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
              : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2AdditionalPreviewRecipe isLight={isLight} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 6: Layer 3 Online Warmup & Inline Error Notice + Co-located Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xs">
            6
          </span>
          <h2 className="text-base font-bold">
            Layer 3 联机房间与单行内联报错菜谱 (Online Warmup · Check notification ↗)
          </h2>
        </div>

        <LocalPanelSizingTuner
          panelId="layer3-online-warmup"
          label="Layer 3 Online Warmup 联机大厅"
          recommendation="推荐 Fixed：配合 Apple HIG 内部间距弹性压缩，报错弹出时外框尺寸纹丝不动"
          isLight={isLight}
          extraControls={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ToggleSwitch
                checked={simulateLayer3Error}
                onCheckedChange={handleToggleLayer3Error}
                label="模拟三级菜单单行内联报错 (Something went wrong. Check notification ↗)"
                variant="neutral"
                isLight={isLight}
              />
              <Button
                size="sm"
                variant={simulateLayer3Error ? 'danger' : 'secondary'}
                isLight={isLight}
                icon={<AlertCircle className="h-3.5 w-3.5" />}
                onClick={() => handleToggleLayer3Error(!simulateLayer3Error)}
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
          <Layer3OnlineWarmupRecipe isLight={isLight} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 7: Layer 3 Audio Equalizer + Co-located Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xs">
            7
          </span>
          <h2 className="text-base font-bold">
            Layer 3 音频高级均衡器菜谱 (Acoustics & EQ)
          </h2>
        </div>

        <LocalPanelSizingTuner
          panelId="layer3-audio-detail"
          label="Layer 3 Acoustics & EQ"
          recommendation="推荐 Fixed：锁定高度并在报错时自动压缩内部卡片间距"
          isLight={isLight}
        />

        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
              : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer3AudioDetailRecipe isLight={isLight} />
        </div>
      </div>
    </div>
  );
};
