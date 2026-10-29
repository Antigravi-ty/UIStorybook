import React from 'react';
import { RotateCcw, Maximize2 } from 'lucide-react';
import { SliderControl } from '../../../primitives/SliderControl';
import { SegmentedSwitch } from '../../../primitives/SegmentedSwitch';
import { Badge } from '../../../primitives/Badge';
import { Button } from '../../../primitives/Button';
import {
  useMenuLayoutStore,
  DEFAULT_PANEL_SIZING,
  type MenuPanelId,
  type PanelSizingMode,
} from '../../../tokens';
import type { JumpDirectoryItem, JumpDirectoryCategory } from '../../PageJumpDirectory';

export const RECIPES_CATEGORIES: JumpDirectoryCategory[] = [
  { id: 'all', label: '全部模块 (All)' },
  { id: 'layer1-2', label: 'L1–L2 根菜单与核心面板' },
  { id: 'tuners', label: '壳体与行/标签专项调优 (Tuners)' },
  { id: 'layer3-user', label: 'L3 联机/训练/设置子页 (User)' },
  { id: 'layer3-dev', label: 'L3 开发者沙盒/调参库 (Dev)' },
  { id: 'layer4', label: 'L4 四级深层专页' },
];

export const RECIPES_JUMP_ITEMS: JumpDirectoryItem[] = [
  { id: 'recipe-6a-1-main', code: '6A.1', name: 'Layer1MainMenuRecipe', label: '主暂停根菜单', badge: 'Layer 1', category: 'layer1-2' },
  { id: 'main-menu-style-tuner', code: '6A.1M', name: 'MainMenuStyleTuner', label: 'Layer 1 MENU 极简大字选单调优工作台', badge: 'L2 ⇄ L6', category: 'tuners' },
  { id: 'panel-shell-tuner', code: '6A.2S', name: 'PanelShellTuner', label: 'Layer 2+ 三段式面板壳体调优器', badge: 'L2 ⇄ L6', category: 'tuners' },

  { id: 'recipe-6a-2-play', code: '6A.2', name: 'Layer2PlayRecipe', label: '模式选择网格', badge: 'Layer 2', category: 'layer1-2' },
  { id: 'recipe-6a-3-garage', code: '6A.3', name: 'Layer2GarageRecipe', label: '车库外观配置', badge: 'Layer 2', category: 'layer1-2' },
  { id: 'recipe-6a-4-settings', code: '6A.4', name: 'Layer2SettingsRecipe', label: 'Settings 面板尺寸调优', badge: 'Layer 2', category: 'layer1-2' },
  { id: 'underline-tabs-tuner', code: '6A.4T', name: 'UnderlineTabsTuner', label: 'Settings 顶栏滑动下划线标签调优', badge: 'L1.1 ⇄ L6', category: 'tuners' },
  { id: 'setting-action-row-tuner', code: '6A.4S', name: 'SettingActionRowTuner', label: '设置导航行与统一行原型调优', badge: 'L1.0 ⇄ L6', category: 'tuners' },
  { id: 'setting-telemetry-summary-tuner', code: '6A.4S-H', name: 'TelemetryConfigCard', label: 'Show Telemetry Summary 折叠与内嵌调优', badge: 'L3.8 ⇄ L6', category: 'tuners' },
  { id: 'recipe-6a-5-settings-preview', code: '6A.5', name: 'Layer2SettingsRecipe (Preview)', label: '9+1 Tabs 综合设置实时交互预览', badge: 'Layer 2', category: 'layer1-2' },
  { id: 'recipe-6a-6a-host', code: '6A.6A', name: 'Layer3HostMatchRecipe', label: '建房专页 (Host)', badge: 'Layer 3', category: 'layer3-user' },
  { id: 'recipe-6a-6b-join', code: '6A.6B', name: 'Layer3JoinRoomRecipe', label: '进房专页 (Join)', badge: 'Layer 3', category: 'layer3-user' },
  { id: 'recipe-6a-7-audio', code: '6A.7', name: 'Layer3AudioEqRecipe', label: '音频高级均衡器', badge: 'Layer 3', category: 'layer3-user' },
  { id: 'recipe-6a-8-host-ctrl', code: '6A.8', name: 'Layer2RoomHostControlRecipe', label: '房主在线控制台', badge: 'Layer 2', category: 'layer1-2' },
  { id: 'recipe-6a-9-bot-diff', code: '6A.9', name: 'Layer3ExhibitionRecipe', label: 'Exhibition 离线赛', badge: 'Layer 3', category: 'layer3-user' },
  { id: 'recipe-6a-10-self-train', code: '6A.10', name: 'Layer3SelfTrainingRecipe', label: '单人训练四宫格', badge: 'Layer 3', category: 'layer3-user' },
  { id: 'recipe-6a-11-kickoff', code: '6A.11', name: 'Layer3KickoffTrainingRecipe', label: '开球音游训练', badge: 'Layer 3', category: 'layer3-user' },
  { id: 'recipe-6a-12-camera', code: '6A.12', name: 'Layer3CameraRecipe', label: '相机几何设置 (中轴对齐新设计)', badge: 'Layer 3', category: 'layer3-user' },
  { id: 'camera-settings-style-tuner', code: '6A.12M', name: 'CameraSettingsStyleTuner', label: 'Camera 中轴进度条 · Checkbox · 红色大按钮调优台', badge: 'L1.7 ⇄ L6', category: 'tuners' },
  { id: 'recipe-6a-12b-keybindings', code: '6A.12B', name: 'Layer3KeybindingsRecipe', label: '键位绑定与高级手柄入口', badge: 'Layer 3 · User', category: 'layer3-user' },
  { id: 'recipe-6a-12c-trajectory', code: '6A.12C', name: 'Layer3BallTrajectoryRecipe', label: '弹道预测侧边收纳 (Live Preview)', badge: 'Layer 3 · User', category: 'layer3-user' },
  { id: 'recipe-6a-13-multibots', code: '6A.13', name: 'Layer3ExpMultiBotsRecipe', label: '3v3 多 Bot 编排', badge: 'Layer 3', category: 'layer3-user' },
  { id: 'recipe-6a-14-rcspack', code: '6A.14', name: 'Layer4StaticTrainingPackBrowseRecipe', label: '.RCSPack 浏览器', badge: 'Layer 4', category: 'layer4' },
  { id: 'recipe-6a-15-adv-audio', code: '6A.15', name: 'Layer4AdvancedAudioRecipe', label: '高级音频合成池', badge: 'Layer 4', category: 'layer4' },
  { id: 'recipe-6a-16-adv-ctrl', code: '6A.16', name: 'Layer4ControllerSettingsRecipe', label: '高级手柄曲线', badge: 'Layer 4', category: 'layer4' },
  { id: 'recipe-6a-17-triggers', code: '6A.17', name: 'Layer4EventTriggerRulesRecipe', label: '触发器规则引擎', badge: 'Layer 4', category: 'layer4' },
  { id: 'recipe-6a-18-training', code: '6A.18', name: 'Layer3TrainingRecipe', label: '训练辅助与 Rewinder', badge: 'Layer 3 · User', category: 'layer3-user' },
  { id: 'recipe-6a-20-dev-isolation', code: '6A.20', name: 'Layer3DevSubsystemIsolationRecipe', label: '6-Tab 子系统隔离室与沙盒', badge: 'Layer 3 · Dev', category: 'layer3-dev' },
  { id: 'recipe-6a-21-dev-tuners', code: '6A.21', name: 'Layer3DevActiveTunersRecipe', label: '活跃调参器与相位矩阵', badge: 'Layer 3 · Dev', category: 'layer3-dev' },
  { id: 'recipe-6a-22-dev-presets', code: '6A.22', name: 'Layer3DevCalibratedPresetsRecipe', label: '已校准调参器库', badge: 'Layer 3 · Dev', category: 'layer3-dev' },
  { id: 'recipe-6a-23-dev-under-dev', code: '6A.23', name: 'Layer3DevUnderDevelopmentRecipe', label: '开发中功能 (镜头震动)', badge: 'Layer 3 · Dev', category: 'layer3-dev' },
];

export interface LocalPanelSizingTunerProps {
  panelId: MenuPanelId;
  code?: string;
  label: string;
  recommendation: string;
  isLight: boolean;
  extraControls?: React.ReactNode;
}

/**
 * 就近放置的单面板尺寸契约调优条 (Co-located Per-Panel Sizing Inspector)
 * 支持在每个具体面板上方独立切换 'auto' (自动贴合内容 + min/max 夹逼) 与 'fixed' (固定目标高度 + 小屏回退)。
 */
export const LocalPanelSizingTuner = React.memo<LocalPanelSizingTunerProps>(({
  panelId,
  code,
  label,
  recommendation,
  isLight,
  extraControls,
}) => {
  const { panels, setPanelSizing, resetPanelSizing } = useMenuLayoutStore();
  const cfg = panels?.[panelId] ?? DEFAULT_PANEL_SIZING[panelId];

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
          {code && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 font-mono font-bold text-xs shrink-0">
              {code}
            </span>
          )}
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

      <div
        className={`grid grid-cols-1 gap-4 items-center ${
          cfg.mode === 'fixed' ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {/* Mode Switcher */}
        <div className="flex flex-col gap-1">
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
        <div>
          <SliderControl
            label="面板宽度 (width)"
            value={cfg.width}
            min={240}
            max={960}
            step={10}
            unit="px"
            editable={true}
            allowOutOfBoundsInput={true}
            colorScheme="amber"
            onChange={(v) => setPanelSizing(panelId, { width: v })}
            isLight={isLight}
          />
        </div>

        {/* Height Sliders depending on mode */}
        {cfg.mode === 'fixed' ? (
          <div>
            <SliderControl
              label="锁定高度 (targetHeight)"
              value={cfg.targetHeight}
              min={200}
              max={840}
              step={10}
              unit="px"
              editable={true}
              allowOutOfBoundsInput={true}
              colorScheme="emerald"
              onChange={(v) => setPanelSizing(panelId, { targetHeight: v })}
              isLight={isLight}
            />
          </div>
        ) : (
          <>
            <SliderControl
              label="最小高度 (minH)"
              value={cfg.minHeight}
              min={120}
              max={600}
              step={10}
              unit="px"
              editable={true}
              allowOutOfBoundsInput={true}
              colorScheme="emerald"
              onChange={(v) =>
                setPanelSizing(panelId, {
                  minHeight: v,
                })
              }
              isLight={isLight}
            />
            <SliderControl
              label="最大高度 (maxH)"
              value={cfg.maxHeight}
              min={240}
              max={900}
              step={10}
              unit="px"
              editable={true}
              allowOutOfBoundsInput={true}
              colorScheme="sky"
              onChange={(v) =>
                setPanelSizing(panelId, {
                  maxHeight: v,
                })
              }
              isLight={isLight}
            />
          </>
        )}
      </div>

      {extraControls && (
        <div className="pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/80">
          {extraControls}
        </div>
      )}
    </div>
  );
});

LocalPanelSizingTuner.displayName = 'LocalPanelSizingTuner';
