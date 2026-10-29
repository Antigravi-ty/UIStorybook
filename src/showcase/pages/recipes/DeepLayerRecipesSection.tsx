import React, { Suspense, lazy } from 'react';
import { LocalPanelSizingTuner } from './LocalPanelSizingTuner';
import type { MenuPanelId } from '../../../tokens/menuLayoutStore';

const Layer2RoomHostControlRecipe = lazy(() =>
  import('../../../recipes/Layer2RoomHostControlRecipe').then((m) => ({
    default: m.Layer2RoomHostControlRecipe,
  }))
);
const Layer3ExhibitionRecipe = lazy(() =>
  import('../../../recipes/Layer3ExhibitionRecipe').then((m) => ({
    default: m.Layer3ExhibitionRecipe,
  }))
);
const Layer3SelfTrainingRecipe = lazy(() =>
  import('../../../recipes/Layer3SelfTrainingRecipe').then((m) => ({
    default: m.Layer3SelfTrainingRecipe,
  }))
);
const Layer3KickoffTrainingRecipe = lazy(() =>
  import('../../../recipes/Layer3KickoffTrainingRecipe').then((m) => ({
    default: m.Layer3KickoffTrainingRecipe,
  }))
);
const Layer3TrainingRecipe = lazy(() =>
  import('../../../recipes/Layer3TrainingRecipe').then((m) => ({
    default: m.Layer3TrainingRecipe,
  }))
);
const Layer3CameraRecipe = lazy(() =>
  import('../../../recipes/Layer3CameraRecipe').then((m) => ({
    default: m.Layer3CameraRecipe,
  }))
);
const CameraSettingsStyleTuner = lazy(() =>
  import('./CameraSettingsStyleTuner').then((m) => ({
    default: m.CameraSettingsStyleTuner,
  }))
);
const Layer3KeybindingsRecipe = lazy(() =>
  import('../../../recipes/Layer3KeybindingsRecipe').then((m) => ({
    default: m.Layer3KeybindingsRecipe,
  }))
);
const Layer3BallTrajectoryRecipe = lazy(() =>
  import('../../../recipes/Layer3BallTrajectoryRecipe').then((m) => ({
    default: m.Layer3BallTrajectoryRecipe,
  }))
);
const Layer3ExpMultiBotsRecipe = lazy(() =>
  import('../../../recipes/Layer3ExpMultiBotsRecipe').then((m) => ({
    default: m.Layer3ExpMultiBotsRecipe,
  }))
);
const Layer3DevSubsystemIsolationRecipe = lazy(() =>
  import('../../../recipes/Layer3DevSubsystemIsolationRecipe').then((m) => ({
    default: m.Layer3DevSubsystemIsolationRecipe,
  }))
);
const Layer3DevActiveTunersRecipe = lazy(() =>
  import('../../../recipes/Layer3DevActiveTunersRecipe').then((m) => ({
    default: m.Layer3DevActiveTunersRecipe,
  }))
);
const Layer3DevCalibratedPresetsRecipe = lazy(() =>
  import('../../../recipes/Layer3DevCalibratedPresetsRecipe').then((m) => ({
    default: m.Layer3DevCalibratedPresetsRecipe,
  }))
);
const Layer3DevUnderDevelopmentRecipe = lazy(() =>
  import('../../../recipes/Layer3DevUnderDevelopmentRecipe').then((m) => ({
    default: m.Layer3DevUnderDevelopmentRecipe,
  }))
);
const Layer4StaticTrainingPackBrowseRecipe = lazy(() =>
  import('../../../recipes/Layer4StaticTrainingPackBrowseRecipe').then((m) => ({
    default: m.Layer4StaticTrainingPackBrowseRecipe,
  }))
);
const Layer4AdvancedAudioRecipe = lazy(() =>
  import('../../../recipes/Layer4AdvancedAudioRecipe').then((m) => ({
    default: m.Layer4AdvancedAudioRecipe,
  }))
);
const Layer4ControllerSettingsRecipe = lazy(() =>
  import('../../../recipes/Layer4ControllerSettingsRecipe').then((m) => ({
    default: m.Layer4ControllerSettingsRecipe,
  }))
);
const Layer4EventTriggerRulesRecipe = lazy(() =>
  import('../../../recipes/Layer4EventTriggerRulesRecipe').then((m) => ({
    default: m.Layer4EventTriggerRulesRecipe,
  }))
);

export interface DeepLayerRecipeSpec {
  id: string;
  code: string;
  badgeColor: 'emerald' | 'amber' | 'sky';
  title: string;
  panelId: MenuPanelId;
  tunerLabel: string;
  recommendation: string;
  renderPreview: (isLight: boolean) => React.ReactNode;
}

const noop = () => {};

/**
 * Decoupled declarative specifications for 6A.8 – 6A.23 recipes.
 * Each recipe is code-split via React.lazy and isolated so adding, modifying, or
 * resolving merge conflicts on any single panel never couples with other panels.
 */
export const DEEP_LAYER_RECIPE_SPECS: DeepLayerRecipeSpec[] = [
  {
    id: 'recipe-6a-8-host-ctrl',
    code: '6A.8',
    badgeColor: 'emerald',
    title: 'Layer 2 Online Room Control Hub (6 态联机房间控制台 · Match Lobby / During Match / Online Warmup · Host & Client)',
    panelId: 'layer2-room-host-control',
    tunerLabel: 'Layer 2 Online Room Control Hub (联机房间控制台)',
    recommendation: '支持 Match Lobby / During Match / Online Warmup 的 Host 与 Client 六态独立切换与交互',
    renderPreview: (isLight) => (
      <Layer2RoomHostControlRecipe isLight={isLight} showContextSwitcher={true} onBack={noop} />
    ),
  },
  {
    id: 'recipe-6a-9-bot-diff',
    code: '6A.9',
    badgeColor: 'emerald',
    title: 'Layer 3 Exhibition Match Setup (离线表演赛与 Nexto/Necto 难度配置)',
    panelId: 'layer3-exhibition',
    tunerLabel: 'Layer 3 Exhibition Match Setup',
    recommendation: '配置离线赛制、Nexto/Necto 难度与对局时长',
    renderPreview: (isLight) => <Layer3ExhibitionRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-10-self-train',
    code: '6A.10',
    badgeColor: 'emerald',
    title: 'Layer 3 Self-Training Hub (单人自由训练四宫格入口)',
    panelId: 'layer3-self-training',
    tunerLabel: 'Layer 3 Self-Training Hub',
    recommendation: '单人训练四宫格入口',
    renderPreview: (isLight) => <Layer3SelfTrainingRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-11-kickoff',
    code: '6A.11',
    badgeColor: 'emerald',
    title: 'Layer 3 Kickoff Training Setup (开球训练子模式与 120Hz 音游轨道配置)',
    panelId: 'layer3-kickoff-training',
    tunerLabel: 'Layer 3 Kickoff Training Setup',
    recommendation: '开球训练子模式、AI 镜像站位与 120Hz 音游轨道开关',
    renderPreview: (isLight) => <Layer3KickoffTrainingRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-12-camera',
    code: '6A.12',
    badgeColor: 'emerald',
    title: 'Layer 3 Camera Settings (相机几何参数与 Hold Live Preview [TAB])',
    panelId: 'layer3-camera',
    tunerLabel: 'Layer 3 Camera Settings',
    recommendation: '相机几何参数与 Hold Live Preview [TAB]',
    renderPreview: (isLight) => <Layer3CameraRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-12b-keybindings',
    code: '6A.12B',
    badgeColor: 'emerald',
    title: 'Layer 3 Key Bindings & Controls (三栏键位与手柄映射表 + 高级手柄入口)',
    panelId: 'layer3-keybindings',
    tunerLabel: 'Layer 3 Key Bindings & Controls',
    recommendation: '三栏键位与手柄映射表 + 高级手柄入口',
    renderPreview: (isLight) => <Layer3KeybindingsRecipe isLight={isLight} standalone={true} onBack={noop} />,
  },
  {
    id: 'recipe-6a-12c-trajectory',
    code: '6A.12C',
    badgeColor: 'emerald',
    title: 'Layer 3 Ball Trajectory Predictor (弹道预测时域、虚线间隔与颜色配置)',
    panelId: 'layer3-ball-trajectory',
    tunerLabel: 'Layer 3 Ball Trajectory Predictor (Live Preview)',
    recommendation: '弹道预测时域、虚线间隔与颜色配置',
    renderPreview: (isLight) => <Layer3BallTrajectoryRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-13-multibots',
    code: '6A.13',
    badgeColor: 'amber',
    title: 'Layer 3 Experimental Multi-Bots 3v3 (双队 6 槽位独立 ONNX Bot 编排与 POV 选择)',
    panelId: 'layer3-exp-multi-bots',
    tunerLabel: 'Layer 3 Experimental Multi-Bots (3v3)',
    recommendation: '双队 6 槽位独立 ONNX Bot 编排与 POV 选择',
    renderPreview: (isLight) => <Layer3ExpMultiBotsRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-14-rcspack',
    code: '6A.14',
    badgeColor: 'sky',
    title: 'Layer 4 Static Training Pack Browser (.RCSPack 双栏训练包浏览器与元数据检视器)',
    panelId: 'layer4-static-training-pack',
    tunerLabel: 'Layer 4 Static Training Pack Browser (.RCSPack)',
    recommendation: '双栏训练包浏览器与元数据检视器',
    renderPreview: (isLight) => <Layer4StaticTrainingPackBrowseRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-15-adv-audio',
    code: '6A.15',
    badgeColor: 'sky',
    title: 'Layer 4 Advanced Audio Synthesis Pool (Boost 与 Rumble 阶段样本矩阵调优)',
    panelId: 'layer4-advanced-audio',
    tunerLabel: 'Layer 4 Advanced Audio Synthesis Pool',
    recommendation: 'Boost 与 Rumble 阶段样本矩阵调优',
    renderPreview: (isLight) => <Layer4AdvancedAudioRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-16-adv-ctrl',
    code: '6A.16',
    badgeColor: 'sky',
    title: 'Layer 4 Controller Settings (手柄轴映射与 Turning / Dodging 死区可视化)',
    panelId: 'layer4-controller-settings',
    tunerLabel: 'Layer 4 Controller Settings',
    recommendation: '手柄输入设备检测、四轴映射、Deadzone / Dodge Deadzone 与高性能双图死区可视化',
    renderPreview: (isLight) => <Layer4ControllerSettingsRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-17-triggers',
    code: '6A.17',
    badgeColor: 'sky',
    title: 'Layer 4 Event & Trigger Rules Engine (双游标阈值条件与自动训练动作触发引擎)',
    panelId: 'layer4-event-trigger-rules',
    tunerLabel: 'Layer 4 Event & Trigger Rules Engine',
    recommendation: '双游标阈值条件与自动训练动作触发引擎',
    renderPreview: (isLight) => <Layer4EventTriggerRulesRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-18-training',
    code: '6A.18',
    badgeColor: 'emerald',
    title: 'Layer 3 Training Configuration (弹道预测开关、Goal Barrier 与 TAS Rewinder 时间轴入口)',
    panelId: 'layer3-training',
    tunerLabel: 'Layer 3 Training Configuration',
    recommendation: '弹道预测开关、Goal Barrier 与 TAS Rewinder 时间轴入口',
    renderPreview: (isLight) => <Layer3TrainingRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-20-dev-isolation',
    code: '6A.20',
    badgeColor: 'amber',
    title: 'Layer 3 Subsystem Isolation Lab (6 大物理与 AI 独立子系统验证沙盒)',
    panelId: 'layer3-dev-subsystem-isolation',
    tunerLabel: 'Layer 3 Subsystem Isolation Lab (6-Tab Launcher)',
    recommendation: '6 大物理与 AI 独立子系统验证沙盒',
    renderPreview: (isLight) => <Layer3DevSubsystemIsolationRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-21-dev-tuners',
    code: '6A.21',
    badgeColor: 'amber',
    title: 'Layer 3 Active Tuners & Phase Matrix (活跃调参悬浮窗启动器与相位矩阵)',
    panelId: 'layer3-dev-active-tuners',
    tunerLabel: 'Layer 3 Active Tuners & Phase Matrix',
    recommendation: '活跃调参悬浮窗启动器与 L3 PhaseVariationMatrix 相位矩阵',
    renderPreview: (isLight) => <Layer3DevActiveTunersRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-22-dev-presets',
    code: '6A.22',
    badgeColor: 'amber',
    title: 'Layer 3 Calibrated Presets & Tuners (10 个已固化基线的物理/镜头/着色器调参悬浮窗汇总)',
    panelId: 'layer3-dev-calibrated-presets',
    tunerLabel: 'Layer 3 Calibrated Presets & Tuners',
    recommendation: '10 个已固化基线的物理/镜头/着色器调参悬浮窗汇总',
    renderPreview: (isLight) => <Layer3DevCalibratedPresetsRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-23-dev-under-dev',
    code: '6A.23',
    badgeColor: 'amber',
    title: 'Layer 3 Under Development (Three-Wheeler · Throwback Stadium · Per-Car Boost · Camera Shake)',
    panelId: 'layer3-dev-under-development',
    tunerLabel: 'Layer 3 Under Development (开发中功能实验室)',
    recommendation: '三轮模式、复古球场、单车 Boost 微调与碰撞镜头震动调参面板',
    renderPreview: (isLight) => <Layer3DevUnderDevelopmentRecipe isLight={isLight} onBack={noop} />,
  },
];

const BADGE_COLOR_CLASS: Record<DeepLayerRecipeSpec['badgeColor'], string> = {
  emerald: 'bg-emerald-500/20 text-emerald-500',
  amber: 'bg-amber-500/20 text-amber-500',
  sky: 'bg-sky-500/20 text-sky-500',
};

export const SingleDeepLayerRecipeCard = React.memo<{
  spec: DeepLayerRecipeSpec;
  isLight: boolean;
}>(({ spec, isLight }) => {
  const cardClass = `flex justify-center p-6 rounded-2xl border transition-colors ${
    isLight
      ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
      : 'border-neutral-800 bg-neutral-950/60'
  }`;

  return (
    <div id={spec.id} className="scroll-mt-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 rounded-md ${BADGE_COLOR_CLASS[spec.badgeColor]} flex items-center justify-center font-mono font-bold text-xs`}
        >
          {spec.code}
        </span>
        <h2 className="text-base font-bold">{spec.title}</h2>
      </div>
      <LocalPanelSizingTuner
        code={spec.code}
        panelId={spec.panelId}
        label={spec.tunerLabel}
        recommendation={spec.recommendation}
        isLight={isLight}
      />
      {spec.id === 'recipe-6a-12-camera' && (
        <Suspense fallback={null}>
          <CameraSettingsStyleTuner
            isLight={isLight}
            codeBadge="6A.12M"
            showStandalonePreview={false}
          />
        </Suspense>
      )}
      <div className={cardClass}>
        <Suspense
          fallback={
            <div className="py-12 text-xs font-mono text-neutral-400">
              正在按需加载 [{spec.code}] 菜单模块...
            </div>
          }
        >
          {spec.renderPreview(isLight)}
        </Suspense>
      </div>
    </div>
  );
});

SingleDeepLayerRecipeCard.displayName = 'SingleDeepLayerRecipeCard';

export interface DeepLayerRecipesSectionProps {
  isLight: boolean;
  /** Optional target recipe ID; when provided, only that recipe is mounted on-demand */
  activeRecipeId?: string;
}

export const DeepLayerRecipesSection = React.memo<DeepLayerRecipesSectionProps>(
  ({ isLight, activeRecipeId }) => {
    const specsToRender = React.useMemo(() => {
      if (!activeRecipeId) return DEEP_LAYER_RECIPE_SPECS;
      return DEEP_LAYER_RECIPE_SPECS.filter(
        (s) => s.id === activeRecipeId || s.code === activeRecipeId
      );
    }, [activeRecipeId]);

    if (specsToRender.length === 0) return null;

    return (
      <div className="flex flex-col gap-10">
        {specsToRender.map((spec) => (
          <SingleDeepLayerRecipeCard key={spec.id} spec={spec} isLight={isLight} />
        ))}
      </div>
    );
  }
);

DeepLayerRecipesSection.displayName = 'DeepLayerRecipesSection';
