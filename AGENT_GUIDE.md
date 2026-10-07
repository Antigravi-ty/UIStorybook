# Agent Guide — UIStorybook 规范与 RLCleanWASM 集成指南

本文档定义了 AI Agent 在理解、复用、生成以及向 `RLCleanWASM` 项目注入 UI 时的核心设计原则、菜单分级与动效标准。

---

## 1. 核心架构设计思想

### 1.1 纯表现层 (Presentational) vs 业务连接层 (Container/Glue)
- **UIStorybook 内部的代码均为纯表现层**：
  - 组件只接收 `props`，只通过明确回调（如 `onClick`, `onChange`, `onSelect`, `onBack`）触发事件。
  - **严禁**直接在原子组件内注入游戏引擎单例、WebAssembly 实例或持久化 Store。
  - 单个源码文件体积必须严格控制在小尺寸（远小于 100KB，当前最大仅 19KB），实现“指哪儿打哪儿”，防止 Agent 上下文 context 溢出。
- **RLCleanWASM 内的代码为业务连接层**：
  - 当 Agent 需要在游戏中添加新面板（如 `panels/MatchPostPanel.tsx`）时，从 UIStorybook 拷贝对应的表现组件，然后在外层通过 `useUIStore((s) => s.matchStats)` 提取状态并传给组件。

### 1.2 为什么禁止黑盒 NPM Package？
- AI Agent 的上下文窗口依赖于清晰、可见的源码。
- 如果将 UI 打包成编译后的 NPM 包，Agent 在排查布局、覆盖样式、绑定微观 DOM 事件或处理可访问性焦点时将彻底失明。
- 采用 **Recipe Registry（参考代码谱）** 模式，AI Agent 既能拥有 100% 的参考标准，又能在特定业务场景下获得 100% 的灵活性。

---

## 2. 屏幕视口算法与 Safe Area 标准 (对标 RLCleanWASM)

所有游戏 UI 组件单位均以宽度百分比为基准，支持动态自适应缩放与安全区限制：

### 2.1 18:9 宽高比限制与两侧 Pillarbox
- **最宽屏幕比限制**：18:9（2:1）。
- 当屏幕比宽于 18:9 时，最大渲染宽度被钳制：`maxRenderW = Hsafe * 2.0`。
- 多余宽度在两侧作为留白区域（`pillarboxWidth = (Wsafe - Wrender) / 2`），防止超宽屏畸变。

### 2.2 1:1 纵横比底线 (Portrait Gate)
- **屏幕最窄不得低于 1:1**（即横向宽度不得小于纵向高度）。
- 若触发横向比小于 1:1，弹出 `Portrait Gate` 警告遮罩，提示该界面专为 1:1 至 18:9 横屏交互优化。

### 2.3 Safe Area Margin 范围 (-5% ~ +10%) 与负值过扫描 (Overscan)
- 安全区支持在 `-5%` 到 `+10%` 之间调节（`safeAreaMargin`）。
- **正值模式 (+5%)**：外框整体缩进 5%，Header、Sidebar 与 Content 四周同步处于安全内凹保护区内。
- **负值模式 (-5%)**：外框整体扩展至物理视窗外 5%（`top: -5%, left: -5%, right: -5%, bottom: -5%`）。
  - 侧边栏与顶栏自然超出可见视窗边界，真实模拟不关心异形屏/刘海屏切角的“全覆盖过扫描模式 (Display Overscan Bleed)”。
  - 物理视窗常驻显示 `SafeAreaHud` 遥测条与右下角紧急重置按钮，防止操作锁死。
- 基础缩放系数公式：
  ```ts
  baseScale = Wrender / 1280;
  scaleFactor = Number((baseScale * (renderScale / 100)).toFixed(3));
  ```

### 2.4 视窗分层与 Scaling 作用域
- **顶栏 Header 固定在屏幕正上方**：不随页面或内容滚动，尺寸固定为 100% 原始比例。
- **侧边栏 Sidebar 固定在屏幕左侧**：不随内容滚动，尺寸固定为 100% 原始比例，自身具备独立滚动能力。
- **Scaling 缩放仅应用于 Content 内容工作区**：无论 Scaling 滑块如何调整（50% ~ 200%），Header 和 Sidebar 绝不受缩放影响，确保控制条与导航始终可用。

---

## 3. 标准容器过渡动效与统一执行引擎 (Animation & MorphContainer Engine)

### 3.1 核心架构：统一容器过渡引擎 (`MorphContainer`)
系统将所有弹窗与容器尺寸形变、内容切换逻辑收拢于纯表现层引擎 `MorphContainer`（`src/navigation/transitions.tsx`）：
- **模态外壳解耦**：`MorphingShell` 纯粹专注于 Radix Dialog 模态层、焦点陷阱与视觉壳体，容器形变与内容切换直接委托给 `MorphContainer`。
- **沙盒与全局弹窗统一**：无论是 `AnimationPage` 动效沙盒还是全局 `MorphingShell`，底层 100% 共享同一状态机与 GPU layout 调度，根除动效割裂与重复实现。

### 3.2 两种标准过渡规范与参数支持

1. **`FluidMorphTransition` (流体连续形变)**
   - **核心机制**：Framer Motion `layout` FLIP 连续形变，内容轻量 cross-fade，彻底移除旧版阻断动画的 `<AnimatePresence mode="wait">`。
   - **参数规格**：
     - **极简单时间参数**：`fluidDuration?: number`（默认 `0.28s`）。
     - **缓动曲线**：内置 Apple HIG 物理阻尼曲线 `UI_EASING.apple` (`[0.2, 0.8, 0.25, 1]`)，调用方无需手写。
   - **适用场景**：全局大厅根菜单至简单面板切换，丝滑无卡顿。

2. **`SequencedStepTransition` (三段时序分步过渡)**
   - **核心机制**：严格的容器外壳与内容解耦状态机：
     - **Phase 1: Fade Out**（仅内部 Content 透明度从 100% 平滑淡出至 0%，Container 容器底板背景与边框全程常驻稳定，绝不改变透明度） $\rightarrow$ 耗时由 `stepFadeDuration`（默认 `0.10s` / 100ms）决定。
     - **Phase 2: Resize**（切换底层内容并严格保持隐藏 `opacity: 0`，外层容器带着底板背景平滑执行尺寸形变） $\rightarrow$ 耗时由 `stepResizeDuration`（默认 `0.15s` / 150ms）决定。杜绝容器背景消失、半透明残留或“整体变灰”瑕疵。
     - **Phase 3: Fade In**（新内容透明度从 0% 平滑显现淡入至 100%，容器背景常驻保持） $\rightarrow$ 耗时由 `stepFadeDuration`（默认 `0.10s` / 100ms）决定。
   - **参数规格**：
     - `stepFadeDuration?: number`（淡入淡出时长，默认 `0.10s`）。
     - `stepResizeDuration?: number`（尺寸变形时长，默认 `0.15s`）。
   - **适用场景**：重型表单、车库复杂多卡片装配等可能引发排版重绘的跨层级深度页面，防止变形中的重排振颤。

### 3.3 触觉微交互 (Tactile Micro-interactions)
- 按钮与交互项保留毫秒级触觉反馈：
  - `active:scale-[0.98]`
  - Framer Motion `transition={UI_EASING.spring.tactile}` (`stiffness: 450, damping: 32`)
  - 扁平无重阴影风格，快速响应无拖泥带水感。

---

## 4. 菜单分级架构与直接调用系统 (Menu Hierarchy)

为大型游戏与应用建立清晰的分级菜单树，每个菜单层级均可单行直接调用：

### 4.1 层级划分与实时预览引擎 (Menu Layer 是唯一产品标准参考)
- **活跃菜单链 (统一作为所有页面与模态弹窗的唯一实现基准)**:
  - **Layer 1: 根级主暂停菜单**：`Layer1MainMenuRecipe` (`420px`)：恢复对局、车库装配、游戏设置、按键映射、离开对局。
    - **启动动效规范**：**零动画瞬时展现 (Instant Appear)**，关闭亦为瞬时消失，杜绝入场/退场动画延迟。
    - **视觉突出规范**：容器四周黑色外阴影 (`shadow-[0_0_50px_rgba(0,0,0,0.85)]`)，在千奇百怪的复杂或动态背景下均能清晰隔离并突出显示，边框保持统一精致轻量，杜绝厚重黑边。
    - **背景规范**：**绝对无模糊 (No Blur)**，一级根菜单背景保持透明不额外变暗 (`bg-transparent`)，杜绝 120Hz 动态背景下的 GPU 合成开销。
  - **Layer 2: 专项功能二级菜单**：
    - `Layer2GarageRecipe` (车库改装与涂装, `660px`)
    - `Layer2SettingsRecipe` (音画系统设置, `520px`，含 Video/Audio/Camera/Gameplay 分标签与进入三级音频均衡器入口)
    - `KeybindingRecipe` (按键与手柄映射, `560px`)
    - **背景过渡规范**：背景进入变暗状态 (`bg-black/65` 或 `rgba(0,0,0,0.45)`)，采用渐变过渡动画（默认 250ms 左右，支持外部灵活配置），**依然严禁使用模糊效果 (`backdrop-blur-none`)**，以节约高频动态 3D 场景性能。
  - **Layer 3: 深度参数三级面板**：
    - `Layer3AudioDetailRecipe` (音频高级均衡器与声场, `480px`，支持 3-Band EQ、HRTF 3D 空间环绕声)
    - **父子归属与逻辑约束**：三级独立面板严格从属于其二级父级菜单（如 `audio-eq` 隶属于 `settings`）。在非关联菜单（如 `garage`、`keybindings`）下**锁定不可选**，防止跨菜单错误关联。
- **容器内容 (Container Content) 与窗口层级 (Window Layer) 的界定**：
  - 二级菜单内部的 Tabs（例如 `Layer2SettingsRecipe` 中的 Video/Audio/Camera/Gameplay，或 `Layer2GarageRecipe` 中的 Car Bodies/Decals/Wheels/Boost FX）属于**同级容器内的内容切换**，不属于独立窗口层级。
  - 同一二级菜单在内部切换 Tab 时，容器保持固定/默认尺寸（固定内容高度），**绝不发生容器尺寸 Resize，也不需要过渡动效**，确保即时响应。
  - 只有在跨越窗口层级切换时（例如 Layer 1 -> Layer 2 -> Layer 3），才触发 `MorphContainer` 的窗口尺寸形变与过渡动画（FluidMorph 或 SequencedStep）。
- **预留/候选菜单链 (保留在 `MenusPage` 供未来扩展)**:
  - `Layer1MatchPostRecipe` (赛后结算战报根菜单, `420px`)
  - `Layer2MatchStatsRecipe` (赛后遥测数据看板, `580px`)

### 4.2 单行直接调用示例 (Direct Invocation)
```tsx
import { Layer1MainMenuRecipe, Layer2SettingsRecipe, Layer3AudioDetailRecipe } from '@/recipes';

// 1. 独立单行直接调用
<Layer2SettingsRecipe
  isLight={isLight}
  onBack={() => setRoute('main')}
  onNavigateAudioDetail={() => setRoute('audio-eq')}
/>

// 2. 在 MorphContainer 单一容器中配合两种动效自由调用
<MorphContainer
  currentKey={currentRoute}
  width={routeWidthMap[currentRoute]} // 自动适配 420px ~ 660px
  mode="fluid-morph" // 或 'sequenced-step'
  isLight={isLight}
>
  {currentRoute === 'main-menu' && <Layer1MainMenuRecipe ... />}
  {currentRoute === 'settings' && <Layer2SettingsRecipe ... />}
  {currentRoute === 'audio-eq' && <Layer3AudioDetailRecipe ... />}
</MorphContainer>
```

---

## 5. 标准化组件对照表 (Component Lookup)

| 需求场景 | 标准组件 | 文件位置 |
|---|---|---|
| Menu Layer 实时预览引擎 | `<MenuLayerPreviewPage>` | `src/showcase/pages/MenuLayerPreviewPage.tsx` |
| 视口限制与 18:9 Pillarbox | `<GameViewport>` | `src/viewport/GameViewport.tsx` |
| 安全区虚线与遥测条 | `<SafeAreaHud>` | `src/viewport/SafeAreaHud.tsx` |
| 统一容器形变过渡引擎 | `<MorphContainer>` | `src/navigation/transitions.tsx` |
| 连续流体形变过渡 | `FluidMorphTransition` | `src/tokens/easing.ts`, `src/navigation/transitions.tsx` |
| 三段时序分步过渡 (100+150+100ms) | `SequencedStepTransition` | `src/tokens/easing.ts`, `src/navigation/transitions.tsx` |
| 一级主暂停菜单 | `<Layer1MainMenuRecipe>` | `src/recipes/Layer1MainMenuRecipe.tsx` |
| 二级车辆车库改装 | `<Layer2GarageRecipe>` | `src/recipes/Layer2GarageRecipe.tsx` |
| 二级游戏音画设置 | `<Layer2SettingsRecipe>` | `src/recipes/Layer2SettingsRecipe.tsx` |
| 三级音频高级均衡器 | `<Layer3AudioDetailRecipe>` | `src/recipes/Layer3AudioDetailRecipe.tsx` |
| 二级按键手柄映射 | `<KeybindingRecipe>` | `src/recipes/KeybindingRecipe.tsx` |
| 一级预留赛后战报菜单 | `<Layer1MatchPostRecipe>` | `src/recipes/Layer1MatchPostRecipe.tsx` |
| 二级预留赛后统计面板 | `<Layer2MatchStatsRecipe>` | `src/recipes/Layer2MatchStatsRecipe.tsx` |
| 扁平按键徽章 (ESC, W, RT, A) | `<KeycapBadge>` | `src/primitives/KeycapBadge.tsx` |
| 状态与指标徽章 | `<Badge>` | `src/primitives/Badge.tsx` |
| 现代滑动下划线 Tab | `<UnderlineTabs>` | `src/primitives/UnderlineTabs.tsx` |
| 弹簧滑动分段控制器 | `<SegmentedSwitch>` | `src/primitives/SegmentedSwitch.tsx` |
| 数值滑动调节 | `<SliderControl>` | `src/primitives/SliderControl.tsx` |
| 物理感开关 | `<ToggleSwitch>` | `src/primitives/ToggleSwitch.tsx` |
| 垂直流布局 | `<VStack>` | `src/layout/VStack.tsx` |
| 水平流布局 | `<HStack>` | `src/layout/HStack.tsx` |
| 网格流布局 | `<GridStack>` | `src/layout/GridStack.tsx` |
| 3-Stage Compound 面板 | `<PanelContainer>` | `src/layout/Panel.tsx` |
| 双动效弹窗外壳 | `<MorphingShell>` | `src/navigation/MorphingShell.tsx` |

---

## 6. 基础原子控件 (Atomic Primitives) 交互与视觉设计标准

### 6.1 滑动下划线标签 (`UnderlineTabs`)
- **色彩规范**：底色与激活下划线默认采用柔和暖橙色 (`bg-amber-500`)，避免使用高频刺眼的蓝色。
- **多实例隔离**：内部通过 `useId()` 自动为每个组件实例分配独立的 Framer Motion `layoutId`，支持同屏多组标签同时渲染而互不抢占指示器。

### 6.2 弹簧分段控制器 (`SegmentedSwitch`)
- **多实例独立共存**：内部采用独立的 `layoutId={\`segmented-thumb-\${instanceId}\`}`，允许多个分段控制器在同一界面独立高亮各自的激活选项。
- **圆角矩形几何形态**：弃用胶囊 (Capsule/Pill) 形状，统一采用标准圆角矩形 (`rounded-lg` 外框 + `rounded-md` 内部指示器)，符合 macOS / Linear 现代化硬朗质感。
- **三种宽度分配模式 (`distribution`)**：
  1. `auto` (默认/左对齐)：自适应内容宽度，长内容占宽更多，短内容占宽更少。
  2. `equal` (等距均分 / `fullWidth`)：充满容器并严格平分各选项宽度。
  3. `proportional` (比例均分)：充满整行宽度，同时按内容权重比例分配。

### 6.3 步进数值滑动条 (`SliderControl`)
- **零饱和度中性设计**：默认采用纯净黑白无饱和度轨段（Light 模式为 `bg-neutral-900`，Dark 模式为 `bg-white`），聚焦环采用 `neutral` 阶梯，彻底杜绝蓝色干扰；亦支持 `amber` / `orange` 暖色微调。

### 6.4 触觉物理开关 (`ToggleSwitch`)
- **对标 Apple 设计**：推荐使用 Apple 经典绿 (`variant="green"`) 以及极简无饱和度黑白 (`variant="black"`)，并提供暖橙变体 (`variant="orange"`)，彻底避免蓝色。

### 6.5 全局视觉基调 (Global Visual & Accent Theme)
- 系统优先使用 **Neutral (无饱和度黑白)** 与 **Warm Amber (暖橙黄色)** 作为核心视觉主色调，相比原蓝色更柔和舒适，并内置视觉基调切换器供全局实时切换。

