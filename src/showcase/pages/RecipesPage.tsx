import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Eye,
  AlertCircle,
  BellDot,
} from 'lucide-react';
import { CodeBlock } from '../CodeBlock';
import { SliderControl } from '../../primitives/SliderControl';
import { ToggleSwitch } from '../../primitives/ToggleSwitch';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { QuickNotificationSystem } from '../../navigation/QuickNotificationSystem';
import { useMenuLayoutStore } from '../../tokens';
import { useQuickNotificationStore } from '../../tokens/quickNotificationStore';
import { Layer1MainMenuRecipe } from '../../recipes/Layer1MainMenuRecipe';
import { Layer2PlayRecipe } from '../../recipes/Layer2PlayRecipe';
import { Layer2SettingsRecipe } from '../../recipes/Layer2SettingsRecipe';
import { Layer2GarageRecipe } from '../../recipes/Layer2GarageRecipe';
import {
  Layer3OnlineWarmupRecipe,
  dispatchOnlineRoomErrorNotification,
} from '../../recipes/Layer3OnlineWarmupRecipe';

export const RecipesPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const {
    layer1Width,
    layer1Height,
    layer2Width,
    layer2Height,
    layer3Width,
    layer3Height,
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
      // Collapse active notification into unread stack so clicking "Check notification ↗" expands the top-right Bell icon
      const st = useQuickNotificationStore.getState();
      if (st.activeNotification) {
        st.collapseActive();
      }
      st.setStackOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            6A · Layer 1-2-3 菜单代码谱与全局参数调优器
          </h1>
          <Badge variant="primary" size="sm" isLight={isLight}>
            L0 → L6 → L7 联动
          </Badge>
        </div>
        <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          单向嵌套与参数联动中心：在此处调整 Layer 1 分割线间距、按钮间距、内衬及各层级固定容器高度后，下方预览与{' '}
          <strong>7A · Menu Layer 全链路沙盒</strong> 将自动同步应用同一套参数与组件。可通过右上角「导出/复制固化配置」直接复制代码固化至{' '}
          <code className="font-mono">src/tokens/menuLayoutStore.ts</code>。
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Section 0: Layer 1 Menu & Menu Layer Interactive Parameter Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                Menu Layer 全局尺寸与 Layer 1 间距调优台 (L0 Token Store)
              </h2>
              <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                实时调整 Resume 分割线距离、按钮间隙及各层级固定容器高度（同步生效于 7A 沙盒）
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={<Code2 className="h-3.5 w-3.5" />}
              onClick={() => setShowExportBlock((prev) => !prev)}
            >
              {showExportBlock ? '隐藏配置代码' : '查看固化代码'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              isLight={isLight}
              icon={copiedConfig ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={handleCopyConfig}
            >
              {copiedConfig ? '已复制配置!' : '导出 / 复制固化配置'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isLight={isLight}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={resetTokens}
            >
              重置默认
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <SliderControl
            label="Resume 分割线上下间距 (dividerMarginY)"
            value={dividerMarginY}
            min={0}
            max={16}
            step={1}
            unit="px"
            colorScheme="amber"
            onChange={(v) => setToken('dividerMarginY', v)}
            isLight={isLight}
          />

          <SliderControl
            label="菜单按钮垂直间距 (menuItemGap)"
            value={menuItemGap}
            min={4}
            max={20}
            step={1}
            unit="px"
            colorScheme="amber"
            onChange={(v) => setToken('menuItemGap', v)}
            isLight={isLight}
          />

          <SliderControl
            label="菜单按钮内部上下内衬 (menuItemPaddingY)"
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
            label="Layer 1 内容区上下内衬 (panelContentPaddingY)"
            value={panelContentPaddingY}
            min={8}
            max={28}
            step={2}
            unit="px"
            colorScheme="amber"
            onChange={(v) => setToken('panelContentPaddingY', v)}
            isLight={isLight}
          />

          <SliderControl
            label="菜单容器安全内衬 (menuContainerPadding)"
            value={menuContainerPadding}
            min={0}
            max={16}
            step={1}
            unit="px"
            colorScheme="emerald"
            onChange={(v) => setToken('menuContainerPadding', v)}
            isLight={isLight}
          />

          <SliderControl
            label="Layer 1 根菜单固定高度 (layer1Height)"
            value={layer1Height}
            min={440}
            max={620}
            step={10}
            unit="px"
            colorScheme="emerald"
            onChange={(v) => setToken('layer1Height', v)}
            isLight={isLight}
          />

          <SliderControl
            label="Layer 2 二级菜单固定高度 (layer2Height)"
            value={layer2Height}
            min={460}
            max={640}
            step={10}
            unit="px"
            colorScheme="sky"
            onChange={(v) => setToken('layer2Height', v)}
            isLight={isLight}
          />

          <SliderControl
            label="Layer 3 三级菜单固定高度 (layer3Height)"
            value={layer3Height}
            min={460}
            max={640}
            step={10}
            unit="px"
            colorScheme="sky"
            onChange={(v) => setToken('layer3Height', v)}
            isLight={isLight}
          />
        </div>

        <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToggleSwitch
            checked={showAdditionalPreviews}
            onCheckedChange={(v) => setToken('showAdditionalPreviews', v)}
            label="显示第 5 个按钮 (Additional Previews)"
            variant="neutral"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={simulateLayer3Error}
            onCheckedChange={handleToggleLayer3Error}
            label="模拟三级菜单单行报错 (Something went wrong)"
            variant="neutral"
            isLight={isLight}
          />
        </div>

        {showExportBlock && (
          <div className="pt-2">
            <CodeBlock
              isLight={isLight}
              title="src/tokens/menuLayoutStore.ts (导出参数配置)"
              code={exportConfigCode()}
            />
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 1: Layer 1 Root MENU (Read-Only Preview with Hover Effect)
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-base font-bold">
              Layer 1 根暂停菜单菜谱 (MENU / {layer1Width}×{layer1Height}px)
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
            <span>只读预览模式：保留完整 Hover 视觉反馈，已拦截点击跳转 (Prevent Default)</span>
          </span>
        </div>

        {/* Read-only click interceptor wrapper: preserves 100% CSS :hover & group-hover effects while preventing navigation */}
        <div
          onClickCapture={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer1MainMenuRecipe isLight={isLight} />
        </div>

        <CodeBlock
          isLight={isLight}
          title="Layer1MainMenuRecipe.tsx"
          code={`import React from 'react';
import { Play, Gamepad2, Wrench, Settings, Layers, ArrowUpRight } from 'lucide-react';
import { PanelContainer, PanelContent } from '@/layout/Panel';
import { MenuContainer, MenuItem, MenuDivider } from '@/navigation';
import { useMenuLayoutStore } from '@/tokens';

export const MainMenuPanel = ({ isLight, onResume, onPlay, onGarage, onSettings, onPreviews }) => {
  const { layer1Width, layer1Height, panelContentPaddingY, showAdditionalPreviews } = useMenuLayoutStore();
  return (
    <PanelContainer isLight={isLight} width={layer1Width} height={layer1Height} className="w-full">
      <div className="px-6 pt-5 pb-4 border-b text-center shrink-0">
        <h1 className="text-xl font-black tracking-widest uppercase">MENU</h1>
      </div>
      <PanelContent
        scrollable={true}
        style={{ paddingTop: \`\${panelContentPaddingY}px\`, paddingBottom: \`\${panelContentPaddingY}px\` }}
        className="px-6"
      >
        <MenuContainer>
          <MenuItem icon={<Play />} title="Resume Match" shortcut="ESC" variant="primary" onClick={onResume} isLight={isLight} />
          <MenuDivider isLight={isLight} />
          <MenuItem icon={<Gamepad2 />} title="Play" hasArrow onClick={onPlay} isLight={isLight} />
          <MenuItem icon={<Wrench />} title="Garage" hasArrow onClick={onGarage} isLight={isLight} />
          <MenuItem icon={<Settings />} title="Settings" hasArrow onClick={onSettings} isLight={isLight} />
          {showAdditionalPreviews && (
            <MenuItem icon={<Layers />} title="Additional Previews" hasArrow onClick={onPreviews} isLight={isLight} />
          )}
        </MenuContainer>
      </PanelContent>
      <div className="px-6 py-4 border-t shrink-0 mt-auto relative z-10 flex items-center justify-between">
        <span>Background render paused</span>
        <button onClick={() => onSettings('video')}>Click to change settings ↗</button>
      </div>
    </PanelContainer>
  );
};`}
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 2: Layer 2 Play Modes
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h2 className="text-base font-bold">
            Layer 2 游戏模式选择面板菜谱 (Play / {layer2Width}×{layer2Height}px 固定高度)
          </h2>
        </div>
        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2PlayRecipe isLight={isLight} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 3: Layer 2 Garage (Fixed Height across Tabs)
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
            3
          </span>
          <h2 className="text-base font-bold">
            Layer 2 车辆预设与外观配置菜谱 (Garage / {layer2Width}×{layer2Height}px · 切换 Tab 绝不改变容器高度)
          </h2>
        </div>
        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2GarageRecipe isLight={isLight} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 4: Layer 2 Settings (Fixed Height across 9+1 Tabs)
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">
            4
          </span>
          <h2 className="text-base font-bold">
            Layer 2 综合系统设置面板菜谱 (Settings / {layer2Width}×{layer2Height}px · 切换 Tab 绝不改变容器高度)
          </h2>
        </div>
        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2SettingsRecipe isLight={isLight} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Recipe 5: Layer 3 Online Warmup & Inline Error Notice Pattern
         ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xs">
              5
            </span>
            <h2 className="text-base font-bold">
              Layer 3 联机房间与单行内联报错菜谱 (Online Warmup / {layer3Width}×{layer3Height}px)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={simulateLayer3Error ? 'danger' : 'secondary'}
              isLight={isLight}
              icon={<AlertCircle className="h-3.5 w-3.5" />}
              onClick={() => handleToggleLayer3Error(!simulateLayer3Error)}
            >
              {simulateLayer3Error ? '清除报错状态 (正常模式)' : '触发单行内联报错 (Something went wrong)'}
            </Button>
          </div>
        </div>

        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          遵循 Apple HIG 固定尺寸面板规范：正常状态下不预留底部空白边；当发生错误时，顶部出现单行提示{' '}
          <code className="font-mono">Something went wrong. Check notification ↗</code>（纯下划线链接，非按钮），并通过自适应垂直间距压缩吸收这 32px 高度，使外层容器尺寸保持{' '}
          <strong>{layer3Width}×{layer3Height}px 绝对不动</strong>。点击 <code className="font-mono underline">Check notification ↗</code>{' '}
          将直接展开右上角的通知图标（若已展开则保持不变）。
        </p>

        <div
          className={`relative flex justify-center p-6 pt-16 rounded-2xl border transition-colors overflow-hidden ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          {/* In-place top-right QuickNotificationSystem so clicking "Check notification ↗" expands the notification icon right here */}
          <QuickNotificationSystem isLight={isLight} absolute={true} />

          <Layer3OnlineWarmupRecipe isLight={isLight} />
        </div>
      </div>
    </div>
  );
};
