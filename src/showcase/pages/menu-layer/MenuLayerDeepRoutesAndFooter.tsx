import React from 'react';
import {
  Check,
  AlertCircle,
  Sliders,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import { Badge } from '../../../primitives/Badge';
import { type MenuPanelId } from '../../../tokens/menuLayoutStore';
import {
  useCameraSettingsStyleStore,
  CAMERA_SETTINGS_STYLE_PRESETS,
  type CameraSettingsPresetId,
} from '../../../tokens/cameraSettingsStyleStore';
import { useQuickNotificationStore } from '../../../tokens/quickNotificationStore';
import { dispatchOnlineRoomErrorNotification } from '../../../recipes/Layer3OnlineWarmupRecipe';
import type { ShowcaseTab } from '../../Sidebar';
import {
  type ActiveMenuRoute,
  type MenuVisibilityTier,
  MENU_ROUTE_CONFIG,
} from './menuLayerRouteConfig';
import { resolveNodePathInspectorLinks } from './menuLayerInspectorLinks';

export interface MenuLayerDeepRoutesAndFooterProps {
  isLight: boolean;
  visibilityTier: MenuVisibilityTier;
  currentRoute: ActiveMenuRoute;
  handleSelectRoute: (route: ActiveMenuRoute) => void;
  getPanelWidth: (panelId: MenuPanelId) => number;
  simulateLayer3Error: boolean;
  setSimulateLayer3Error: (enabled: boolean) => void;
  showToast: (msg: string) => void;
  showInlineTuner: boolean;
  onToggleInlineTuner?: () => void;
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  settingsTab: string;
  garageTab: string;
  currentStepBreadcrumb?: string;
  activeRouteSizeModeLabel: string;
  feedbackToast: string | null;
}

export const MenuLayerDeepRoutesAndFooter: React.FC<
  MenuLayerDeepRoutesAndFooterProps
> = ({
  isLight,
  visibilityTier,
  currentRoute,
  handleSelectRoute,
  getPanelWidth,
  simulateLayer3Error,
  setSimulateLayer3Error,
  showToast,
  showInlineTuner,
  onToggleInlineTuner,
  onNavigateShowcase,
  settingsTab,
  garageTab,
  currentStepBreadcrumb,
  activeRouteSizeModeLabel,
  feedbackToast,
}) => {
  const cameraStyle = useCameraSettingsStyleStore();
  const inspectorLinks = resolveNodePathInspectorLinks(
    currentRoute,
    settingsTab,
    garageTab
  );
  const { pageRecipeTarget, elementTargets } = inspectorLinks;

  return (
    <>
      {/* Layer 3: Tertiary Sub-Menus (Strictly filtered by User vs Developer) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
          <Badge variant="success" size="sm" isLight={isLight}>
            Layer 3
          </Badge>
          <span>三级独立子菜单</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(visibilityTier === 'user'
            ? [
                {
                  route: 'host-match' as const,
                  label: 'Host Match (创建房间)',
                  panel: 'layer3-host-match' as const,
                },
                {
                  route: 'host-training' as const,
                  label: 'Host Training (联机训练)',
                  panel: 'layer3-host-training' as const,
                },
                {
                  route: 'custom-play' as const,
                  label: 'Custom (开发中)',
                  panel: 'layer3-custom-play' as const,
                },
                {
                  route: 'join-room' as const,
                  label: 'Join Room (加入房间)',
                  panel: 'layer3-join-room' as const,
                },
                {
                  route: 'exhibition' as const,
                  label: 'Exhibition Setup (离线 AI)',
                  panel: 'layer3-exhibition' as const,
                },
                {
                  route: 'self-training' as const,
                  label: 'Self-Training Hub (单人训练)',
                  panel: 'layer3-self-training' as const,
                },
                {
                  route: 'kickoff-training' as const,
                  label: 'Kickoff Training (开球音游)',
                  panel: 'layer3-kickoff-training' as const,
                },
                {
                  route: 'training' as const,
                  label: 'Training Config (训练与回溯)',
                  panel: 'layer3-training' as const,
                },
                {
                  route: 'camera' as const,
                  label: 'Camera Settings (相机几何)',
                  panel: 'layer3-camera' as const,
                },
                {
                  route: 'keybindings' as const,
                  label: 'Key Bindings (键位与手柄映射)',
                  panel: 'layer3-keybindings' as const,
                },
                {
                  route: 'trajectory' as const,
                  label: 'Ball Trajectory (Live Preview)',
                  panel: 'layer3-ball-trajectory' as const,
                },
              ]
            : [
                {
                  route: 'dev-subsystem-isolation' as const,
                  label: 'Sandboxes & Isolation (6-Tab 隔离室)',
                  panel: 'layer3-dev-subsystem-isolation' as const,
                },
                {
                  route: 'exp-multi-bots' as const,
                  label: 'Multi-Bots (3v3 编排)',
                  panel: 'layer3-exp-multi-bots' as const,
                },
                {
                  route: 'dev-active-tuners' as const,
                  label: 'Active Tuners (相位矩阵与音频)',
                  panel: 'layer3-dev-active-tuners' as const,
                },
                {
                  route: 'dev-calibrated-presets' as const,
                  label: 'Calibrated Presets (已校准调参器)',
                  panel: 'layer3-dev-calibrated-presets' as const,
                },
                {
                  route: 'dev-under-development' as const,
                  label: 'Under Development (开发中功能)',
                  panel: 'layer3-dev-under-development' as const,
                },
                {
                  route: 'audio-eq' as const,
                  label: 'Acoustics & EQ (声学均衡)',
                  panel: 'layer3-audio-eq' as const,
                },
              ]
          ).map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleSelectRoute(item.route)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-2xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 shadow-2xs'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {getPanelWidth(item.panel)}px
                </span>
              </button>
            );
          })}

          {visibilityTier === 'user' && (
            <button
              type="button"
              onClick={() => {
                const next = !simulateLayer3Error;
                setSimulateLayer3Error(next);
                if (next) {
                  dispatchOnlineRoomErrorNotification();
                  const st = useQuickNotificationStore.getState();
                  if (st.activeNotification) {
                    st.collapseActive();
                  }
                  st.setStackOpen(false);
                  showToast(
                    '已触发三级菜单单行报错 (点击 Check notification ↗ 可展开右上角通知)'
                  );
                } else {
                  showToast('已清除三级菜单单行报错');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                simulateLayer3Error
                  ? 'bg-rose-500 text-white border-rose-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                  : 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800/70 text-rose-300'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                {simulateLayer3Error ? '内联报错: 开启中' : '模拟三级内联报错'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar when Camera Settings is active: 5 Spine & Checkbox Presets + Inline Tuner Toggle */}
      {currentRoute === 'camera' && (
        <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
            <span>
              7A.12 Camera Settings 新设计排布切换 (Slider 中轴对齐 · 右对齐无 Icon 文本 · 左对齐数值框 · Checkbox · 红色二次确认大按钮):
            </span>
            <div className="flex items-center gap-3">
              {onToggleInlineTuner && (
                <button
                  type="button"
                  onClick={onToggleInlineTuner}
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  <span>
                    {showInlineTuner
                      ? '收起 7A 就地细调抽屉 ▲'
                      : '展开 7A 就地细调抽屉 (调整居中/间距/Checkbox) ▼'}
                  </span>
                </button>
              )}
              {onNavigateShowcase && (
                <button
                  type="button"
                  onClick={() =>
                    onNavigateShowcase('recipes', 'camera-settings-style-tuner')
                  }
                  className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                >
                  <span>打开 6A.12M 专项调优台</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              Object.keys(
                CAMERA_SETTINGS_STYLE_PRESETS
              ) as CameraSettingsPresetId[]
            ).map((presetKey) => {
              const p = CAMERA_SETTINGS_STYLE_PRESETS[presetKey];
              const active = cameraStyle.preset === presetKey;
              return (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => {
                    cameraStyle.applyPreset(presetKey);
                    showToast(`已切换 Camera Settings 排布: ${p.shortLabel}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    active
                      ? 'bg-emerald-500 text-white border-emerald-500 font-bold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {p.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Layer 4: Deep Sub-Menus (Strictly filtered by User vs Developer) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
          <Badge variant="primary" size="sm" isLight={isLight}>
            Layer 4
          </Badge>
          <span>四级深度专页</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(visibilityTier === 'user'
            ? [
                {
                  route: 'static-training-pack' as const,
                  label: '.RCSPack Browser (训练包浏览器)',
                  panel: 'layer4-static-training-pack' as const,
                },
                {
                  route: 'controller-settings' as const,
                  label: 'Controller Settings (高级手柄曲线)',
                  panel: 'layer4-controller-settings' as const,
                },
              ]
            : [
                {
                  route: 'advanced-audio' as const,
                  label: 'Advanced Audio Pool (音频阶段池)',
                  panel: 'layer4-advanced-audio' as const,
                },
                {
                  route: 'event-trigger-rules' as const,
                  label: 'Event & Trigger Rules (触发器规则引擎)',
                  panel: 'layer4-event-trigger-rules' as const,
                },
              ]
          ).map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleSelectRoute(item.route)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-2xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 shadow-2xs'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {getPanelWidth(item.panel)}px
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status & Cascade Breadcrumb Footer + Node-Path Aware Quick Jump & Element Inspector */}
      <div
        className={`flex flex-col gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
          isLight
            ? 'bg-neutral-50/90 border-neutral-200/80 text-neutral-600'
            : 'bg-neutral-950/50 border-neutral-800/80 text-neutral-400'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Compass className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-neutral-400">当前检测节点路径:</span>
            <span className="font-bold text-amber-500">
              {currentStepBreadcrumb ||
                MENU_ROUTE_CONFIG[currentRoute]?.label ||
                currentRoute}{' '}
              ({activeRouteSizeModeLabel})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {feedbackToast && (
              <div className="text-amber-500 font-semibold flex items-center gap-1.5 animate-pulse mr-1">
                <Check className="h-3.5 w-3.5" />
                <span>{feedbackToast}</span>
              </div>
            )}

            {onToggleInlineTuner && (
              <button
                type="button"
                onClick={onToggleInlineTuner}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer active:scale-95 ${
                  showInlineTuner
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-2xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800 shadow-2xs'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200 shadow-2xs'
                }`}
                title="无需离开 7A 沙盒，直接在当前页展开/收起针对该节点面板及 SettingActionRow 内部行的实时调优器"
              >
                <Sliders className="h-3 w-3" />
                <span>
                  {showInlineTuner ? '收起就地快调' : '就地快调当前节点'}
                </span>
              </button>
            )}

            {onNavigateShowcase && (
              <button
                type="button"
                onClick={() =>
                  onNavigateShowcase(
                    pageRecipeTarget.tab,
                    pageRecipeTarget.targetId
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer active:scale-95 bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 shadow-2xs"
                title={`一键跳转至独立调优页面: [${pageRecipeTarget.code}] ${pageRecipeTarget.componentName}`}
              >
                <span>跳转当前页面设置 [{pageRecipeTarget.code}]</span>
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {onNavigateShowcase && elementTargets.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-neutral-200/70 dark:border-neutral-800/70">
            <span className="text-[11px] text-neutral-400 shrink-0">
              当前页面内部元素调优跳转:
            </span>
            {elementTargets.map((target) => (
              <button
                key={`${target.code}-${target.componentName}`}
                type="button"
                onClick={() => onNavigateShowcase(target.tab, target.targetId)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer active:scale-95 ${
                  isLight
                    ? 'bg-white hover:bg-amber-50 border-neutral-200/90 hover:border-amber-400 text-neutral-700 hover:text-amber-700 shadow-2xs'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-amber-500/60 text-neutral-300 hover:text-amber-300'
                }`}
                title={`跳转至独立底层组件页面调优: [${target.code}] ${target.componentName}`}
              >
                <span className="px-1 py-0.2 rounded text-[9.5px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  {target.code}
                </span>
                <span>{target.label}</span>
                <ArrowUpRight className="h-3 w-3 opacity-70" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
