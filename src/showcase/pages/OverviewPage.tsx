import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Box,
  Cpu,
  ShieldCheck,
  ArrowUpRight,
  GitBranch,
} from 'lucide-react';
import { CodeBlock } from '../CodeBlock';
import type { ShowcaseTab } from '../Sidebar';

export interface OverviewPageProps {
  isLight?: boolean;
  onSelectTab?: (tab: ShowcaseTab) => void;
}

interface PyramidRow {
  code: string;
  name: string;
  rule: string;
  importPath: string;
  badgeColor: string;
  modules: {
    label: string;
    tab: ShowcaseTab;
    items: string;
  }[];
}

const PYRAMID_SPEC: PyramidRow[] = [
  {
    code: 'L0. Foundation',
    name: 'Foundations (基石与变量)',
    rule: '纯静态常量、类型契约与主题 Store，无任何业务 JSX，无任何上层（L1~L7）依赖。',
    importPath: 'src/tokens/*',
    badgeColor: 'bg-neutral-500/15 text-neutral-700 dark:text-neutral-300 border-neutral-400/40',
    modules: [
      {
        label: 'Tokens & Theme Store',
        tab: 'foundations',
        items: 'colors, radius, spacing, easing, themeStore, morphContext, syncBridge',
      },
    ],
  },
  {
    code: 'L1. Primitives',
    name: 'Primitives (原子基础原语)',
    rule: '最小粒度纯表现组件。不含业务上下文，纯 Props 驱动，彼此零横向强耦合，仅依赖 L0。',
    importPath: 'src/primitives/*',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40',
    modules: [
      {
        label: 'Badge / Keycap / Button',
        tab: 'badges',
        items: 'Badge, KeycapBadge, Button (含 composable 万物嵌套模式)',
      },
      {
        label: 'Tabs / Switch / Slider 步进',
        tab: 'tabs',
        items: 'UnderlineTabs, SegmentedSwitch, ToggleSwitch, SliderControl (含 centered 双向), DualGrabberSlider, PrecisionDigitPicker',
      },
    ],
  },
  {
    code: 'L2. Layout',
    name: 'Layout & Shells (布局与骨架)',
    rule: '纯结构空间容器，负责栅格排布、卡片封装与 3-Stage 光学衬距 (px-6 pt-5 pb-4)，不含复杂业务状态，仅依赖 L0~L1。',
    importPath: 'src/layout/*',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/40',
    modules: [
      {
        label: 'Stacks 栅格流',
        tab: 'stacks',
        items: 'VStack, HStack, GridStack (彼此零耦合，共享 L0 StackGap 契约)',
      },
      {
        label: 'Card 卡片容器',
        tab: 'cards',
        items: 'Card, CardHeader, CardBody, CardFooter, SelectableCard',
      },
      {
        label: '2B · PlayCard 模式卡片三风格',
        tab: 'play-cards',
        items: 'PlayModeCard, MainMenuRow (Style 1 Icon+Badge+Title+Desc · Style 2 Icon+Title+Desc · Style 3 JetBrains Mono + Giant Watermark)',
      },
      {
        label: 'Panel & MenuContainer',
        tab: 'panels',
        items: 'PanelContainer, PanelHeader, PanelContent, PanelFooter (3-Stage Compound), MenuContainer (p-2 缓冲)',
      },
    ],
  },
  {
    code: 'L3. Compounds',
    name: 'Compound Controls (复合交互控件)',
    rule: '由多个原语与布局拼装而成的自洽通用交互控件。具备内部微状态，但无特定游戏业务锁定，仅依赖 L0~L2。',
    importPath: 'src/compounds/*',
    badgeColor: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/40',
    modules: [
      {
        label: 'Dropdown & Tuner 复合控件',
        tab: 'composable-tuner',
        items: 'DropdownMenu, TunerControls, UVTransformControl, ColorSwatchInput, PriorityQueueList, EventFilterMatrix, CollapsibleNumberedRailList, SettingActionRow, MenuItem',
      },
      {
        label: 'Dialogue 零遮罩弹窗',
        tab: 'dialogue',
        items: 'Dialogue, DialogueModal, DialogueStackContainer, dialogue.show',
      },
      {
        label: 'Quick Notification 抽屉通知',
        tab: 'quick-notification',
        items: 'QuickNotificationDrawer (Temporary / Persistent / Ongoing 三态渲染)',
      },
    ],
  },
  {
    code: 'L4. Navigation',
    name: 'Navigation & Transitions (导航与动效引擎)',
    rule: '专注容器几何形变、三段时序状态机与模态焦点壳体。任意面板皆可委托形变，仅依赖 L0~L3。',
    importPath: 'src/navigation/*',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/40',
    modules: [
      {
        label: 'MorphContainer & HIG 动效',
        tab: 'animation',
        items: 'MorphContainer, FluidMorphTransition (0.28s), SequencedStepTransition (100+150+100ms), UI_EASING',
      },
      {
        label: 'MorphingShell & 侧边收纳壳体',
        tab: 'navigation',
        items: 'MorphingShell, MorphingStageShell, LivePreviewDock, EdgeInspectorDrawer (TAB 零遮罩侧边抽屉)',
      },
    ],
  },
  {
    code: 'L5. Specials',
    name: 'Game Specials (游戏与遥测专属)',
    rule: '强领域语义的专业可视化/遥测单元。5A/5B/5C/5D/5E/5F 六大子域完全正交平行、互不依赖，全部保持纯 Props 驱动。',
    importPath: 'src/hud/* | src/charts/* | src/viewport/* | src/loading/*',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
    modules: [
      {
        label: '5A · Match HUD 独立仪表',
        tab: 'hud-elements',
        items: 'StepperScoreboardHUD, EdgePlayerHudStrip, BallCameraIndicator, VelocityProgressBar, CircularBoostGauge, CompactTelemetryBarHUD, FlipIndicatorPillHUD, ReplayControlBannerHUD, KickoffRhythmOverlayHUD, StaticTrainingPackHUD',
      },
      {
        label: '5B · High-Clarity 遥测图表',
        tab: 'charts-curves',
        items: 'TelemetrySparklineChart, EventImpulseScatterChart, ParametricTrajectoryChart, CubicBezierCurveEditor (0 外部依赖)',
      },
      {
        label: '5C · Viewport & Safe Area',
        tab: 'viewport-safe-area',
        items: 'GameViewport (18:9 Pillarbox & 1:1 Portrait Gate), SafeAreaHud (-5%~+10% Overscan), viewportStore',
      },
      {
        label: '5D · Loading 双层进度管线',
        tab: 'loading-preview',
        items: 'DualProgressBar (全局步骤 + 微步骤 MB/s / Shimmer Wave + 异常熔断红警), LoadingScreen',
      },
      {
        label: '5E · Center-Upper 强提醒信息',
        tab: 'center-upper-info',
        items: 'CenterUpperInfoHUD (HudAnchorStage upper-center · JetBrains Mono Thin 3-2-1-GO 750ms · Regular+Thin Winner · Out Glow)',
      },
      {
        label: '5F · Stats Event 状态事件流',
        tab: 'stats-event-feed',
        items: 'StatsEventFeedHUD (Icon + Text + Capsule + Footnote · Crossbar / Bounce 单线实心 / High-Five 2³=8 / Tactics 1:1 / Strategy 2²=4)',
      },
    ],
  },
  {
    code: 'L6. Patterns',
    name: 'Patterns & Recipes (场景模板与参考配方)',
    rule: '由 L0~L5 组装而成的完整可复用业务面板配方 (Recipes) 与窗口/通知编排系统 (Orchestrators)，即拷即用。',
    importPath: 'src/recipes/* | src/panels/*',
    badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/40',
    modules: [
      {
        label: '6A · Layer 1-2-3 菜单代码谱',
        tab: 'recipes',
        items: 'Layer1MainMenuRecipe, Layer2PlayRecipe, Layer2GarageRecipe, Layer2SettingsRecipe, Layer3KeybindingsRecipe, Layer3AudioEqRecipe',
      },
      {
        label: '6B · Post-Match 赛后候选谱',
        tab: 'menus',
        items: 'Layer1MatchPostRecipe (420px), Layer2MatchStatsRecipe (580px)',
      },
      {
        label: '6C · Live Preview 侧边收纳',
        tab: 'live-preview',
        items: 'LivePreviewDock, MorphingStageShell, Layer3BallTrajectoryRecipe, livePreviewStore',
      },
      {
        label: '6D · Floating Window 多窗编排',
        tab: 'floating-windows',
        items: 'FloatingWindowManager, FloatingStackIcon, floatingStore, QuickNotificationSystem',
      },
      {
        label: '6D+ · Floating 3-Stage 变体实验',
        tab: 'floating-window-3stage',
        items: 'FloatingThreeStageWindowManager (L2 PanelHeader + PanelContent + PanelFooter + Carved Footer Resize Grip / Edge Resize)',
      },
      {
        label: '6E · Edge Inspector 侧边悬停检视',
        tab: 'edge-inspector',
        items: 'EdgeInspectorDrawer (Right/Left + Top/Bottom Offset + 0% Backdrop), Layer5StaticTrainingPackEditRecipe, StaticTrainingShotInspectorView',
      },
    ],
  },
  {
    code: 'L7. Sandboxes',
    name: 'Sandboxes & Demos (综合演练与集成沙盒)',
    rule: '金字塔顶层宿主仿真与压力测试场。将 L0~L6 进行高阶排列组合以供全景预览与自动化回归验证，严禁任何下层组件反向引用 L7。',
    importPath: 'src/showcase/pages/*',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/40',
    modules: [
      {
        label: '7A · Menu Layer 全链路沙盒',
        tab: 'layer-preview',
        items: 'MenuLayerPreviewPage (Layer 0 对局 ⇄ Layer 1-2-3 菜单树 + 双动效 + 侧边药丸折叠 + 悬浮窗托盘联动)',
      },
      {
        label: '7C · Notification 并发集成测试',
        tab: 'notification-integration',
        items: 'NotificationIntegrationPage (持久通知抢占恢复 + Ongoing 让位 + 多叠层 Dialogue 6 大自动化回归套件)',
      },
    ],
  },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({ isLight = true, onSelectTab }) => {
  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Hero header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>RLCleanWASM & UIStorybook · L0–L7 精准金字塔架构</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          设计理念与 L0–L7 单向依赖金字塔
        </h1>
        <p className={`text-base font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
          严守「单向依赖，指哪儿打哪儿」· 非此即彼，绝无歧义
        </p>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          为 RocketSim WASM / Three.js 游戏与现代 Web 应用量身定制的标准化组件参考库。
          全仓库收敛并升级为严格遵循单向依赖流（<code className="font-mono">L0 ← L1 ← L2 ← L3 ← L4 ← L5 ← L6 ← L7</code>）、每个模块定位唯一确定的八层金字塔体系。
        </p>
      </div>

      {/* Section 1: L0–L7 Pyramid Matrix */}
      <div
        className={`flex flex-col gap-5 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" />
            <span>精准 8 层金字塔体系全景图 (L0 Foundations → L7 Sandboxes)</span>
          </h2>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            0 Circular Dependencies · 100% Unidirectional
          </span>
        </div>

        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          <strong>L0 ~ L6 负责「定义标准与可复用配方」</strong>，<strong>L7 负责「高阶排列组合仿真与压力测试」</strong>。
          点击下方任意模块卡片即可直接跳转到对应层级的规范或演练页面：
        </p>

        <div className="flex flex-col gap-3">
          {PYRAMID_SPEC.map((row) => (
            <div
              key={row.code}
              className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                isLight
                  ? 'bg-neutral-50/80 border-neutral-200/90 hover:border-neutral-300'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-mono font-extrabold border ${row.badgeColor}`}
                  >
                    {row.code}
                  </span>
                  <span className="font-bold text-sm">{row.name}</span>
                </div>
                <code
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    isLight ? 'bg-neutral-200/70 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {row.importPath}
                </code>
              </div>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                <strong>定位与准入规则：</strong>
                {row.rule}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {row.modules.map((mod) => (
                  <button
                    key={mod.tab + mod.label}
                    type="button"
                    onClick={() => onSelectTab?.(mod.tab)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer group ${
                      isLight
                        ? 'bg-white hover:bg-amber-50/40 border-neutral-200/90 hover:border-amber-400/70'
                        : 'bg-neutral-950/70 hover:bg-neutral-800/80 border-neutral-800 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs group-hover:text-amber-500 transition-colors">
                        {mod.label}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-amber-500 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <span className={`text-[11px] font-mono leading-snug ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {mod.items}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Decoupling Audit ("指哪儿打哪儿" 架构保障) */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <span>解耦审计：如何真正做到「指哪儿打哪儿，改一处绝不牵连全局」？</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>1. 零 Barrel 转发与直接模块寻址</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              全仓消除冗余 <code className="font-mono">index.ts</code> Barrel 转发文件，所有导入直指具体物理文件（如 <code className="font-mono">src/tokens/spacing</code>、<code className="font-mono">src/compounds/Dialogue</code>），彻底杜绝隐式循环依赖与全量重编译。
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>2. 同层原语与布局零横向耦合</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              L1 的 <code className="font-mono">DualGrabberSlider</code> 与 <code className="font-mono">SliderControl</code> 完全独立；L2 的 <code className="font-mono">VStack</code>、<code className="font-mono">HStack</code>、<code className="font-mono">GridStack</code> 各自直接消费 L0 <code className="font-mono">spacing.ts</code>，互不交叉引用。
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>3. L5 四大专业子域 100% 正交隔离</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              5A (<code className="font-mono">src/hud</code>)、5B (<code className="font-mono">src/charts</code>)、5C (<code className="font-mono">src/viewport</code>)、5D (<code className="font-mono">src/loading</code>) 之间没有任何一行跨模块 import；其中 5B 图表库甚至对 L1~L4 也是零依赖，单文件即拷即用。
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/40 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>4. L6 Recipes 与 L5 零反向类型耦合</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              <code className="font-mono">src/recipes/*</code> 下全部 26 个顶层菜单面板集中于根目录，并通过可选回调 Props 与外层通信，确保每个 Recipe 均可独立移植。
            </p>
          </div>
        </div>
      </div>

      {/* Core Question 1: Package vs Recipe Registry */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Box className="h-5 w-5 text-amber-500" />
          <span>核心决策：为什么推荐「代码参考谱 (Recipe Registry)」而非「NPM Package」？</span>
        </h2>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          在游戏前端与 AI Agent 协作场景中，传统 NPM Package 机制存在严重的致命痛点。我们强烈推荐采用类 <strong>shadcn/ui</strong> 的「代码规范参考库 + 即抄即用」模型：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Why NOT NPM package */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-red-50/70 border-red-200' : 'bg-red-950/40 border-red-800/80'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-red-500">
              <XCircle className="h-4 w-4" />
              <span>NPM Package 模式的弊端</span>
            </div>
            <ul className={`text-xs space-y-2 list-disc list-inside ${isLight ? 'text-neutral-700' : 'text-neutral-200'}`}>
              <li><strong>Agent 变成黑盒瞎子</strong>：组件打包后位于 <code className="font-mono">node_modules</code> 中，AI Agent 无法直接阅读其源码与 DOM 结构，难以进行微调。</li>
              <li><strong>发布周期沉重</strong>：修改一个 padding 或加一个插槽，需要经过打包、发布、版本递增、依赖安装的多重摩擦。</li>
              <li><strong>Tailwind 与打包器样式冲突</strong>：跨包样式打包极其容易导致 CSS 冲突或特异性缺失。</li>
              <li><strong>游戏绑定阻隔</strong>：游戏 UI 常需绑定 Three.js 动画与 WASM 数据流，外部黑盒库很难做紧密的硬件层调试。</li>
            </ul>
          </div>

          {/* Why Recipe Registry */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/40 border-emerald-800/80'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>UIStorybook 代码参考库模式的绝对优势</span>
            </div>
            <ul className={`text-xs space-y-2 list-disc list-inside ${isLight ? 'text-neutral-700' : 'text-neutral-200'}`}>
              <li><strong>零黑盒透明性 (Zero Black-Box)</strong>：每个组件代码纯净明了，AI Agent 可以直接理解、精确拷贝并即时嵌入项目。</li>
              <li><strong>100% Tailwind 原生</strong>：全部采用语义清晰的 utility classes，无任何动态 CSS-in-JS 或专有样式锁。</li>
              <li><strong>Prompt 指令标准化</strong>：给 Agent 发指令时，只需声明「使用 L1 UnderlineTabs + L2 3-Stage Panel 构建面板」，Agent 即可直接查阅标准实现。</li>
              <li><strong>L7 交互式验证沙盒</strong>：提供全功能场景演练与自动化回归矩阵，确保改一处只动一处。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Core Question 2: Decoupling Logic & Presentation */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-500" />
          <span>解耦架构：「逻辑归逻辑，样式归样式」</span>
        </h2>

        <CodeBlock
          isLight={isLight}
          title="示例：按物理层级精准导入，纯表现层组件通过 Props 驱动"
          code={`// src/recipes/Layer3AudioEqRecipe.tsx
import React, { useState } from 'react';
// L2 Layout: 导入 3-Stage 面板容器
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
// L1 Primitives: 导入所需的原子滑块与标签
import { UnderlineTabs } from '../primitives/UnderlineTabs';
import { SliderControl } from '../primitives/SliderControl';

export const AudioSettingsPanel: React.FC<{ isLight?: boolean; onBack?: () => void }> = ({
  isLight = false,
  onBack,
}) => {
  const [soundVolume, setSoundVolume] = useState(80);
  const [activeTab, setActiveTab] = useState('master');

  return (
    <PanelContainer isLight={isLight}>
      <PanelHeader title="AUDIO SETTINGS" onBack={onBack} isLight={isLight} />
      <UnderlineTabs
        tabs={[
          { id: 'master', label: 'Master' },
          { id: 'eq', label: 'Equalizer' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLight={isLight}
      />
      <PanelContent>
        <SliderControl
          label="Sound Volume"
          value={soundVolume}
          min={0}
          max={100}
          unit="%"
          onChange={setSoundVolume}
          isLight={isLight}
        />
      </PanelContent>
      <PanelFooter defaultDescription="Adjust master audio gain" isLight={isLight} />
    </PanelContainer>
  );
};`}
        />
      </div>
    </div>
  );
};
