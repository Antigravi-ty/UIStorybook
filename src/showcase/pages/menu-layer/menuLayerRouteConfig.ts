import type { MenuPanelId } from '../../../tokens';
import type { TabItem } from '../../../primitives/UnderlineTabs';
import type { JumpDirectoryItem } from '../../PageJumpDirectory';
import {
  LAYER1_CONTEXT_VARIATIONS,
  type Layer1MenuContextMode,
} from '../../../recipes/Layer1MainMenuRecipe';

export type MenuVisibilityTier = 'user' | 'developer';

export type ActiveMenuRoute =
  | 'layer-0'
  | 'main-menu'
  | 'play'
  | 'garage'
  | 'settings'
  | 'additional-preview'
  | 'room-host-control'
  | 'audio-eq'
  | 'trajectory'
  | 'online-warmup'
  | 'host-match'
  | 'host-training'
  | 'custom-play'
  | 'join-room'
  | 'exhibition'
  | 'self-training'
  | 'kickoff-training'
  | 'training'
  | 'camera'
  | 'keybindings'
  | 'exp-multi-bots'
  | 'dev-subsystem-isolation'
  | 'dev-active-tuners'
  | 'dev-calibrated-presets'
  | 'dev-under-development'
  | 'static-training-pack'
  | 'advanced-audio'
  | 'controller-settings'
  | 'event-trigger-rules';

export const ROUTE_TO_PANEL_ID: Record<Exclude<ActiveMenuRoute, 'layer-0'>, MenuPanelId> = {
  'main-menu': 'layer1-main',
  'play': 'layer2-play',
  'garage': 'layer2-garage',
  'settings': 'layer2-settings',
  'additional-preview': 'layer2-previews',
  'room-host-control': 'layer2-room-host-control',
  'audio-eq': 'layer3-audio-eq',
  'trajectory': 'layer3-ball-trajectory',
  'online-warmup': 'layer3-online-warmup',
  'host-match': 'layer3-host-match',
  'host-training': 'layer3-host-training',
  'custom-play': 'layer3-custom-play',
  'join-room': 'layer3-join-room',
  'exhibition': 'layer3-exhibition',
  'self-training': 'layer3-self-training',
  'kickoff-training': 'layer3-kickoff-training',
  'training': 'layer3-training',
  'camera': 'layer3-camera',
  'keybindings': 'layer3-keybindings',
  'exp-multi-bots': 'layer3-exp-multi-bots',
  'dev-subsystem-isolation': 'layer3-dev-subsystem-isolation',
  'dev-active-tuners': 'layer3-dev-active-tuners',
  'dev-calibrated-presets': 'layer3-dev-calibrated-presets',
  'dev-under-development': 'layer3-dev-under-development',
  'static-training-pack': 'layer4-static-training-pack',
  'advanced-audio': 'layer4-advanced-audio',
  'controller-settings': 'layer4-controller-settings',
  'event-trigger-rules': 'layer4-event-trigger-rules',
};

export interface SandboxJumpEntry extends JumpDirectoryItem {
  route: ActiveMenuRoute;
  tier: MenuVisibilityTier;
}

export const MENU_SANDBOX_JUMP_ITEMS: SandboxJumpEntry[] = [
  // --- User Tier ---
  { code: '7A.0', componentName: 'Layer0ActiveMatch', label: '零级无菜单对局态 (0px)', targetId: 'storybook-preview-stage', tag: 'Layer 0 · User', route: 'layer-0', tier: 'user' },
  { code: '7A.1', componentName: 'Layer1MainMenuRecipe', label: '主暂停根菜单 (11 User Contexts)', targetId: 'storybook-preview-stage', tag: 'Layer 1 · User', route: 'main-menu', tier: 'user' },
  { code: '7A.2', componentName: 'Layer2PlayRecipe', label: '模式选择 2×3 网格 (Play)', targetId: 'storybook-preview-stage', tag: 'Layer 2 · User', route: 'play', tier: 'user' },
  { code: '7A.3', componentName: 'Layer2GarageRecipe', label: '车库预设配置 (5 Tabs 含 Materials)', targetId: 'storybook-preview-stage', tag: 'Layer 2 · User', route: 'garage', tier: 'user' },
  { code: '7A.4', componentName: 'Layer2SettingsRecipe', label: '5-Tab 图标+文本设置 (User 4 Tabs)', targetId: 'storybook-preview-stage', tag: 'Layer 2 · User', route: 'settings', tier: 'user' },
  { code: '7A.5', componentName: 'Layer2RoomHostControlRecipe', label: '房主在线控制台 (Room Host)', targetId: 'storybook-preview-stage', tag: 'Layer 2 · User', route: 'room-host-control', tier: 'user' },
  { code: '7A.6', componentName: 'Layer3HostMatchRecipe', label: '创建联机房间专页 (Host Match)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'host-match', tier: 'user' },
  { code: '7A.6T', componentName: 'Layer3HostTrainingRecipe', label: '创建联机训练房间 (Host Training)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'host-training', tier: 'user' },
  { code: '7A.6C', componentName: 'Layer3CustomPlayRecipe', label: '自定义模式开发中 (Custom · In Development)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'custom-play', tier: 'user' },
  { code: '7A.7', componentName: 'Layer3JoinRoomRecipe', label: '加入联机房间专页 (Join Room)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'join-room', tier: 'user' },
  { code: '7A.8', componentName: 'Layer3ExhibitionRecipe', label: 'Exhibition 离线赛配置', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'exhibition', tier: 'user' },
  { code: '7A.9', componentName: 'Layer3SelfTrainingRecipe', label: '单人训练纵向五项入口 (Self-Training)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'self-training', tier: 'user' },
  { code: '7A.10', componentName: 'Layer3KickoffTrainingRecipe', label: '开球音游训练配置 (Kickoff)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'kickoff-training', tier: 'user' },
  { code: '7A.11', componentName: 'Layer3TrainingRecipe', label: '训练辅助与 Rewinder 配置 (Training)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'training', tier: 'user' },
  { code: '7A.12', componentName: 'Layer3CameraRecipe', label: '相机几何设置 (Camera)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'camera', tier: 'user' },
  { code: '7A.13', componentName: 'Layer3KeybindingsRecipe', label: '键位绑定与高级手柄入口 (Keybindings)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'keybindings', tier: 'user' },
  { code: '7A.14', componentName: 'Layer3BallTrajectoryRecipe', label: '弹道预测侧边收纳 (Live Preview)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · User', route: 'trajectory', tier: 'user' },
  { code: '7A.15', componentName: 'Layer4StaticTrainingPackBrowseRecipe', label: '.RCSPack 静态训练包浏览器', targetId: 'storybook-preview-stage', tag: 'Layer 4 · User', route: 'static-training-pack', tier: 'user' },
  { code: '7A.16', componentName: 'Layer4ControllerSettingsRecipe', label: '高级手柄曲线与死区 (Controller)', targetId: 'storybook-preview-stage', tag: 'Layer 4 · User', route: 'controller-settings', tier: 'user' },

  // --- Developer Tier ---
  { code: '7A.D1', componentName: 'Layer1MainMenuRecipe (Dev)', label: '主根菜单 (Dev Test Lab / Multi-Bots Context)', targetId: 'storybook-preview-stage', tag: 'Layer 1 · Dev', route: 'main-menu', tier: 'developer' },
  { code: '7A.D2', componentName: 'Layer2SettingsRecipe (Dev)', label: 'Settings -> Developer Tab 开发者中心', targetId: 'storybook-preview-stage', tag: 'Layer 2 · Dev', route: 'settings', tier: 'developer' },
  { code: '7A.D4', componentName: 'Layer3DevSubsystemIsolationRecipe', label: '6-Tab Subsystem Isolation Lab & Sandboxes', targetId: 'storybook-preview-stage', tag: 'Layer 3 · Dev', route: 'dev-subsystem-isolation', tier: 'developer' },
  { code: '7A.D5', componentName: 'Layer3ExpMultiBotsRecipe', label: 'Experimental Multi-Bots (3v3 ONNX)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · Dev', route: 'exp-multi-bots', tier: 'developer' },
  { code: '7A.D6', componentName: 'Layer3DevActiveTunersRecipe', label: 'Active Tuners & Phase Matrix', targetId: 'storybook-preview-stage', tag: 'Layer 3 · Dev', route: 'dev-active-tuners', tier: 'developer' },
  { code: '7A.D7', componentName: 'Layer3DevCalibratedPresetsRecipe', label: 'Calibrated Presets & Tuners', targetId: 'storybook-preview-stage', tag: 'Layer 3 · Dev', route: 'dev-calibrated-presets', tier: 'developer' },
  { code: '7A.D8', componentName: 'Layer3DevUnderDevelopmentRecipe', label: 'Under Development (Staging)', targetId: 'storybook-preview-stage', tag: 'Layer 3 · Dev', route: 'dev-under-development', tier: 'developer' },
  { code: '7A.D9', componentName: 'Layer3AudioEqRecipe', label: 'Acoustics & EQ Detail', targetId: 'storybook-preview-stage', tag: 'Layer 3 · Dev', route: 'audio-eq', tier: 'developer' },
  { code: '7A.D10', componentName: 'Layer4AdvancedAudioRecipe', label: 'Advanced Audio Synthesis Pool', targetId: 'storybook-preview-stage', tag: 'Layer 4 · Dev', route: 'advanced-audio', tier: 'developer' },
  { code: '7A.D11', componentName: 'Layer4EventTriggerRulesRecipe', label: 'Event & Trigger Rules Engine', targetId: 'storybook-preview-stage', tag: 'Layer 4 · Dev', route: 'event-trigger-rules', tier: 'developer' },
];

export interface LayerRouteConfig {
  id: ActiveMenuRoute;
  label: string;
  layer: 0 | 1 | 2 | 3 | 4;
  width: number;
  tier: MenuVisibilityTier | 'both';
  parentRoute?: ActiveMenuRoute;
}

export const MENU_ROUTE_CONFIG: Record<ActiveMenuRoute, LayerRouteConfig> = {
  'layer-0': { id: 'layer-0', label: 'Active Match (Layer 0)', layer: 0, width: 0, tier: 'both' },
  'main-menu': { id: 'main-menu', label: 'Main Menu', layer: 1, width: 420, tier: 'both' },
  'play': { id: 'play', label: 'Play Modes', layer: 2, width: 600, tier: 'user', parentRoute: 'main-menu' },
  'garage': { id: 'garage', label: 'Garage Loadout', layer: 2, width: 640, tier: 'user', parentRoute: 'main-menu' },
  'settings': { id: 'settings', label: 'Game Settings', layer: 2, width: 680, tier: 'both', parentRoute: 'main-menu' },
  'additional-preview': { id: 'additional-preview', label: 'Additional Preview', layer: 2, width: 600, tier: 'developer', parentRoute: 'main-menu' },
  'room-host-control': { id: 'room-host-control', label: 'Room Host Control', layer: 2, width: 520, tier: 'user', parentRoute: 'play' },
  'audio-eq': { id: 'audio-eq', label: 'Acoustics & EQ', layer: 3, width: 480, tier: 'developer', parentRoute: 'settings' },
  'trajectory': { id: 'trajectory', label: 'Ball Trajectory Predictor', layer: 3, width: 560, tier: 'both', parentRoute: 'settings' },
  'online-warmup': { id: 'online-warmup', label: 'Online Warmup & Match', layer: 3, width: 480, tier: 'user', parentRoute: 'play' },
  'host-match': { id: 'host-match', label: 'Host Match Room', layer: 3, width: 520, tier: 'user', parentRoute: 'play' },
  'host-training': { id: 'host-training', label: 'Host Training Room', layer: 3, width: 500, tier: 'user', parentRoute: 'play' },
  'custom-play': { id: 'custom-play', label: 'Custom Mode (In Development)', layer: 3, width: 500, tier: 'user', parentRoute: 'play' },
  'join-room': { id: 'join-room', label: 'Join Online Room', layer: 3, width: 500, tier: 'user', parentRoute: 'play' },
  'exhibition': { id: 'exhibition', label: 'Exhibition Match Setup', layer: 3, width: 480, tier: 'user', parentRoute: 'play' },
  'self-training': { id: 'self-training', label: 'Self-Training Hub', layer: 3, width: 560, tier: 'user', parentRoute: 'play' },
  'kickoff-training': { id: 'kickoff-training', label: 'Kickoff Training Setup', layer: 3, width: 500, tier: 'user', parentRoute: 'self-training' },
  'training': { id: 'training', label: 'Training Configuration', layer: 3, width: 600, tier: 'user', parentRoute: 'self-training' },
  'camera': { id: 'camera', label: 'Camera Settings', layer: 3, width: 560, tier: 'user', parentRoute: 'settings' },
  'keybindings': { id: 'keybindings', label: 'Key Bindings & Controls', layer: 3, width: 560, tier: 'user', parentRoute: 'settings' },
  'exp-multi-bots': { id: 'exp-multi-bots', label: 'Experimental Multi-Bots (3v3)', layer: 3, width: 720, tier: 'developer', parentRoute: 'settings' },
  'dev-subsystem-isolation': { id: 'dev-subsystem-isolation', label: 'Sandboxes', layer: 3, width: 560, tier: 'developer', parentRoute: 'settings' },
  'dev-active-tuners': { id: 'dev-active-tuners', label: 'Active Tuners', layer: 3, width: 600, tier: 'developer', parentRoute: 'settings' },
  'dev-calibrated-presets': { id: 'dev-calibrated-presets', label: 'Calibrated Presets', layer: 3, width: 560, tier: 'developer', parentRoute: 'settings' },
  'dev-under-development': { id: 'dev-under-development', label: 'Under Development', layer: 3, width: 600, tier: 'developer', parentRoute: 'settings' },
  'static-training-pack': { id: 'static-training-pack', label: 'Static Training Pack (.RCSPack)', layer: 4, width: 700, tier: 'user', parentRoute: 'self-training' },
  'advanced-audio': { id: 'advanced-audio', label: 'Advanced Audio Synthesis Pool', layer: 4, width: 720, tier: 'developer', parentRoute: 'dev-active-tuners' },
  'controller-settings': { id: 'controller-settings', label: 'Controller Settings', layer: 4, width: 640, tier: 'user', parentRoute: 'keybindings' },
  'event-trigger-rules': { id: 'event-trigger-rules', label: 'Event & Trigger Rules Engine', layer: 4, width: 640, tier: 'developer', parentRoute: 'dev-active-tuners' },
};

export const USER_SETTINGS_QUICK_TABS: TabItem[] = [
  { id: 'gameplay', label: 'Gameplay' },
  { id: 'audio', label: 'Audio' },
  { id: 'display', label: 'Display' },
  { id: 'advanced', label: 'Advanced' },
];

export const DEV_SETTINGS_QUICK_TABS: TabItem[] = [
  { id: 'developer', label: 'Developer' },
];

export const SETTINGS_QUICK_TABS: TabItem[] = [
  ...USER_SETTINGS_QUICK_TABS,
  ...DEV_SETTINGS_QUICK_TABS,
];

export const GARAGE_QUICK_TABS: TabItem[] = [
  { id: 'car', label: 'Car' },
  { id: 'colour', label: 'Paint' },
  { id: 'materials', label: 'Loadout' },
  { id: 'anthem', label: 'Anthem' },
  { id: 'sync', label: 'Sync' },
];

export interface LinearPlaylistStep {
  id: string;
  tier: MenuVisibilityTier;
  route: ActiveMenuRoute;
  subtab?: string;
  contextMode?: Layer1MenuContextMode;
  layer: 0 | 1 | 2 | 3 | 4;
  label: string;
  breadcrumb: string;
}

/**
 * Complete Linear Playlist of all User-Only vs Developer-Only pages/variations/tabs
 * for the `< Prev Page | Next Page >` rapid visual scanner.
 */
export const USER_LINEAR_PLAYLIST: LinearPlaylistStep[] = [
  {
    id: 'user-l0',
    tier: 'user',
    route: 'layer-0',
    layer: 0,
    label: 'Active Match (0px)',
    breadcrumb: 'Layer 0 · Active Match',
  },
  // All 10 User Layer 1 Context Variations
  ...LAYER1_CONTEXT_VARIATIONS.filter((v) => v.tier === 'user').map((v) => ({
    id: `user-l1-${v.id}`,
    tier: 'user' as const,
    route: 'main-menu' as const,
    contextMode: v.id,
    layer: 1 as const,
    label: `L1 Main Menu · ${v.label}`,
    breadcrumb: `Layer 1 · ${v.headerTitle} (${v.label})`,
  })),
  // Layer 2 Play
  {
    id: 'user-l2-play',
    tier: 'user',
    route: 'play',
    layer: 2,
    label: 'L2 Play Modes (6-Mode Grid)',
    breadcrumb: 'Layer 1 → Play',
  },
  // Layer 2 Garage (5 Tabs including Materials)
  ...GARAGE_QUICK_TABS.map((t) => ({
    id: `user-l2-garage-${t.id}`,
    tier: 'user' as const,
    route: 'garage' as const,
    subtab: t.id,
    layer: 2 as const,
    label: `L2 Garage · ${t.label} Tab`,
    breadcrumb: `Layer 1 → Garage → ${t.label}`,
  })),
  // Layer 2 Settings (4 User Tabs: Gameplay, Audio, Display, Advanced)
  ...USER_SETTINGS_QUICK_TABS.map((t) => ({
    id: `user-l2-settings-${t.id}`,
    tier: 'user' as const,
    route: 'settings' as const,
    subtab: t.id,
    layer: 2 as const,
    label: `L2 Settings · ${t.label} Tab`,
    breadcrumb: `Layer 1 → Settings → ${t.label}`,
  })),
  // Layer 2 Room Host Control
  {
    id: 'user-l2-room-host',
    tier: 'user',
    route: 'room-host-control',
    layer: 2,
    label: 'L2 Room Host Control',
    breadcrumb: 'Layer 1 → Room Control',
  },
  // Layer 3 User Sub-Menus
  {
    id: 'user-l3-host-match',
    tier: 'user',
    route: 'host-match',
    layer: 3,
    label: 'L3 Host Match Room',
    breadcrumb: 'Play → Host Match',
  },
  {
    id: 'user-l3-host-training',
    tier: 'user',
    route: 'host-training',
    layer: 3,
    label: 'L3 Host Training Room',
    breadcrumb: 'Play → Host Training',
  },
  {
    id: 'user-l3-custom-play',
    tier: 'user',
    route: 'custom-play',
    layer: 3,
    label: 'L3 Custom Mode (In Development)',
    breadcrumb: 'Play → Custom',
  },
  {
    id: 'user-l3-join-room',
    tier: 'user',
    route: 'join-room',
    layer: 3,
    label: 'L3 Join Online Room',
    breadcrumb: 'Play → Join Room',
  },
  {
    id: 'user-l3-exhibition',
    tier: 'user',
    route: 'exhibition',
    layer: 3,
    label: 'L3 Exhibition Bot Setup',
    breadcrumb: 'Play → Exhibition Setup',
  },
  {
    id: 'user-l3-self-training',
    tier: 'user',
    route: 'self-training',
    layer: 3,
    label: 'L3 Self-Training Hub',
    breadcrumb: 'Play → Self-Training',
  },
  {
    id: 'user-l3-kickoff',
    tier: 'user',
    route: 'kickoff-training',
    layer: 3,
    label: 'L3 Kickoff Training Setup',
    breadcrumb: 'Self-Training → Kickoff Training',
  },
  {
    id: 'user-l3-training',
    tier: 'user',
    route: 'training',
    layer: 3,
    label: 'L3 Training Configuration',
    breadcrumb: 'Main Menu → Training Configuration',
  },
  {
    id: 'user-l3-camera',
    tier: 'user',
    route: 'camera',
    layer: 3,
    label: 'L3 Camera Geometry Settings',
    breadcrumb: 'Settings → Gameplay → Camera Settings',
  },
  {
    id: 'user-l3-keybindings',
    tier: 'user',
    route: 'keybindings',
    layer: 3,
    label: 'L3 Key Bindings & Controls',
    breadcrumb: 'Settings → Gameplay → Key Bindings',
  },
  {
    id: 'user-l3-trajectory',
    tier: 'user',
    route: 'trajectory',
    layer: 3,
    label: 'L3 Ball Trajectory Live Preview',
    breadcrumb: 'Settings → Gameplay → Trajectory Live Preview',
  },
  // Layer 4 User Deep Pages
  {
    id: 'user-l4-rcspack',
    tier: 'user',
    route: 'static-training-pack',
    layer: 4,
    label: 'L4 Static Training Pack (.RCSPack)',
    breadcrumb: 'Self-Training → .RCSPack Browser',
  },
  {
    id: 'user-l4-controller',
    tier: 'user',
    route: 'controller-settings',
    layer: 4,
    label: 'L4 Controller Settings',
    breadcrumb: 'Settings → Key Bindings → Controller Settings',
  },
];

export const DEV_LINEAR_PLAYLIST: LinearPlaylistStep[] = [
  // Developer Layer 1 Context Variations (2 items)
  ...LAYER1_CONTEXT_VARIATIONS.filter((v) => v.tier === 'developer').map((v) => ({
    id: `dev-l1-${v.id}`,
    tier: 'developer' as const,
    route: 'main-menu' as const,
    contextMode: v.id,
    layer: 1 as const,
    label: `L1 Dev Menu · ${v.label}`,
    breadcrumb: `Layer 1 (Dev) · ${v.headerTitle} (${v.label})`,
  })),
  // Developer Tab in Layer 2 Settings
  {
    id: 'dev-l2-settings-developer',
    tier: 'developer',
    route: 'settings',
    subtab: 'developer',
    layer: 2,
    label: 'L2 Settings · Developer Tab',
    breadcrumb: 'Settings → Developer Tab (5 Hub Cards)',
  },
  // Developer Layer 3 Sub-Menus + Multi-Bots + Audio EQ
  {
    id: 'dev-l3-isolation',
    tier: 'developer',
    route: 'dev-subsystem-isolation',
    layer: 3,
    label: 'L3 Subsystem Isolation Lab (6 Tabs)',
    breadcrumb: 'Developer → Sandboxes & Isolation Labs',
  },
  {
    id: 'dev-l3-multibots',
    tier: 'developer',
    route: 'exp-multi-bots',
    layer: 3,
    label: 'L3 Experimental Multi-Bots (3v3)',
    breadcrumb: 'Developer → Experimental Multi-Bots',
  },
  {
    id: 'dev-l3-active-tuners',
    tier: 'developer',
    route: 'dev-active-tuners',
    layer: 3,
    label: 'L3 Active Tuners & Phase Matrix',
    breadcrumb: 'Developer → Active Tuners',
  },
  {
    id: 'dev-l3-calibrated-presets',
    tier: 'developer',
    route: 'dev-calibrated-presets',
    layer: 3,
    label: 'L3 Calibrated Presets & Tuners',
    breadcrumb: 'Developer → Calibrated Presets',
  },
  {
    id: 'dev-l3-under-dev',
    tier: 'developer',
    route: 'dev-under-development',
    layer: 3,
    label: 'L3 Under Development',
    breadcrumb: 'Developer → Under Development',
  },
  {
    id: 'dev-l3-audio-eq',
    tier: 'developer',
    route: 'audio-eq',
    layer: 3,
    label: 'L3 Acoustics & Parametric EQ',
    breadcrumb: 'Developer → Acoustics & EQ',
  },
  // Developer Layer 4 Deep Sub-Menus
  {
    id: 'dev-l4-adv-audio',
    tier: 'developer',
    route: 'advanced-audio',
    layer: 4,
    label: 'L4 Advanced Audio Synthesis Pool',
    breadcrumb: 'Developer → Active Tuners → Advanced Audio',
  },
  {
    id: 'dev-l4-event-triggerer',
    tier: 'developer',
    route: 'event-trigger-rules',
    layer: 4,
    label: 'L4 Event & Trigger Rules Engine',
    breadcrumb: 'Developer → Active Tuners → Event & Trigger Rules',
  },
];

export const isLayer3RouteAvailable = (
  panelRoute: ActiveMenuRoute,
  currentRoute: ActiveMenuRoute
): boolean => {
  const cfg = MENU_ROUTE_CONFIG[panelRoute];
  if (!cfg || (cfg.layer !== 3 && cfg.layer !== 4)) return false;
  if (panelRoute === 'trajectory') {
    return (
      currentRoute === 'settings' ||
      currentRoute === 'training' ||
      currentRoute === 'trajectory'
    );
  }
  return true;
};

export type LivePreviewAnimPhase =
  | 'expanded'
  | 'collapsing_content'
  | 'collapsing_resize'
  | 'collapsed'
  | 'expanding_content'
  | 'expanding_resize';
