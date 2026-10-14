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

### 2.5 菜单内衬与呼吸间距标准 (Padding & Cushioning Standards — 对标 RLCleanWASM)
为确保组件从 UIStorybook 拷贝至游戏端（如 `RLCleanWASM`）时实现**零适配直接生效**，所有原子与配方组件严格恪守以下间距与属性标准：
- **容器物理内衬规则 (`menu.container: 'p-2'`)**：
  - 严禁空内衬 (`p-0`) 裸菜单。`MenuItem` 具备 `focus-visible:ring-2` 聚焦环与 `active:scale-[0.985]` 点击缩放，在外层面板拥有 `overflow-hidden` 时，0 内衬会导致边缘按钮光晕被截断贴边。必须保持 `p-2`（8px）内衬缓冲。
- **3-Stage Compound 面板垂直基线与光学居中**：
  - **Header Padding**: `px-6 pt-5 pb-4`（左右 24px 对齐；上下 20px/16px 修正大写标题在 `border-b` 分割线之上的光学垂直居中）。
  - **Content Padding**: `px-6 py-5`（左右严格统一 24px，杜绝与 Header 产生 4px 错位锯齿）。
  - **Footer Padding**: `px-6 py-4`（左右 24px 严格对齐基准线，上下 16px 容纳状态与按键徽章）。
- **样式回退层兼容双重属性选择器**：
  - 所有核心面板与容器同时携带 `data-ui-element` 与 `data-panel-section` / `data-menu-container` 双重属性（如 `data-ui-element="panel-header" data-panel-section="header"`）。
  - 在 CSS 基础层提供硬编码样式回退（`ui-next.css` / `index.css`），防止在宿主复杂层叠或多系统共存环境下边距坍缩贴边。

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
  - **Layer 0: 零级实时对局 (Active Match / No Menu)** (`0px`):
    - **定义**：对局进行中无任何菜单显示的纯净视图，背景画面 100% 恢复渲染，无变暗遮罩与黑屏。
    - **流转行为**：在 Layer 1 主菜单点击“Resume Match”或按键盘 `ESC` 键平滑退回到 Layer 0。
    - **唤起行为**：在 Layer 0 状态下按下 `ESC` 键或点击屏幕下方快捷药丸，即时呼出 Layer 1 主菜单。
  - **Layer 1: 根级主暂停菜单**：`Layer1MainMenuRecipe` (`420px`)：恢复对局 (Resume Match 退回 Layer 0)、车库装配、游戏设置、Additional Previews 预览沙盒、离开对局。
    - **启动动效规范**：**零动画瞬时展现 (Instant Appear)**，关闭亦为瞬时消失，杜绝入场/退场动画延迟。
    - **视觉突出规范**：容器四周黑色外阴影 (`shadow-[0_0_50px_rgba(0,0,0,0.85)]`)，在千奇百怪的复杂或动态背景下均能清晰隔离并突出显示，边框保持统一精致轻量，杜绝厚重黑边。
    - **背景规范**：**绝对无模糊 (No Blur)**，一级根菜单背景保持透明不额外变暗 (`bg-transparent`)，杜绝 120Hz 动态背景下的 GPU 合成开销。
  - **Layer 2: 专项功能二级菜单**：
    - `Layer2GarageRecipe` (车库改装与涂装, `680px`)
    - `Layer2SettingsRecipe` (音画系统设置, `680px`，含 Video/Audio/Camera/Gameplay 分标签与进入三级音频均衡器入口)
    - `Layer2PlayRecipe` (对局玩法与单机网格模式选择, `680px`)
    - `Layer2AdditionalPreviewRecipe` (实时预览与悬浮窗沙盒, `680px`，包含 Live Preview 与 Floating Window 两大核心选项卡)
    - `KeybindingRecipe` (按键与手柄映射, `560px`)
    - **背景过渡规范**：背景进入变暗状态 (`bg-black/65` 或 `rgba(0,0,0,0.55)`)，采用渐变过渡动画（默认 250ms 左右，支持外部灵活配置），**依然严禁使用模糊效果 (`backdrop-blur-none`)**，以节约高频动态 3D 场景性能。
  - **Layer 3: 深度参数三级面板**：
    - `Layer3AudioDetailRecipe` (音频高级均衡器与声场, `480px`，支持 3-Band EQ、HRTF 3D 空间环绕声，父级：Settings)
    - `Layer3BallTrajectoryRecipe` (弹道预测器与实时预览, `480px`，父级：Settings 或 Additional Preview)
    - **父子归属与逻辑约束**：三级独立面板严格从属于其二级父级菜单。在非关联菜单下**锁定不可选**，防止跨菜单错误关联。

### 4.2 双向动效与解耦架构分析 (Dual-Motion Paradigm: Layer Navigation vs Spatial Docking)
当三级菜单同时承载**默认层级连续形变 (Fluid Morph)** 与 **实时预览侧边收纳 (Live Preview Docking)** 时，极易引发严重的技术坑点与动效缺陷：
1. **抽动与缩放畸变的根源 (FLIP Scale Distortion)**：
   - 若直接使用 Framer Motion `layout` 属性驱动容器，当容器从 `480×540px` 面板折叠为 `88×38px` 侧边 Dock 药丸时，Framer Motion 会计算 `scaleX` 与 `scaleY` 矩阵（`scaleY = 38/540 ≈ 0.07`）。
   - 这会导致容器边框、文字、按钮被暴力压扁成一条线（高度/宽度抽动）；反向展开时又放大 14 倍，引发严重的视觉形变与重排跳跃。
2. **坐标上下文丢失的根源 (Lost Context & Flying from 0,0)**：
   - 常规菜单居中依赖 flexbox 居中布局，而侧边 Dock 依赖绝对定位（`right-3`）。
   - 若在动效中动态切换容器定位模式（如 relative 切换到 absolute），Framer Motion 的上下文快照会瞬间丢失父级偏移量，导致容器从左上角 `(0, 0)` 莫名其妙地飞出来。
3. **架构解耦解决方案 (Decoupled Geometric Projection)**：
   - **统一绝对空间坐标投影**：Stage 容器建立统一绝对参考系，无论居中面板（`xCenter = (W-w)/2`, `yCenter = (H-h)/2`）还是侧边 Dock（`xDock = W-16-dockW`, `yDock = (H-dockH)/2`），始终在同一坐标系内动画 `x, y, width, height, borderRadius`。
   - **摒弃矩阵缩放**：不依赖 `layout` FLIP 缩放，直接插值几何尺寸与位移，彻底消除文本与组件的缩放畸变。
   - **分步时序解耦**：折叠时**内容先淡出** $\rightarrow$ **空壳几何变形平滑移动** $\rightarrow$ **药丸图标淡入**；展开时逆向执行。内容与容器尺寸彻底解耦，杜绝内容在尺寸变化过程中的振颤。
   - **双向独立过渡策略**：水平方向的层级流转（Layer 1 ⇄ 2 ⇄ 3）使用 `fluid-morph` 或 `sequenced-step`；空间维度的侧边折叠使用 Dedicated Dock State Machine，两者互不干涉。
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
| 纯净三段式弹窗对话框 | `<Dialogue>` / `<DialogueModal>` | `src/primitives/Dialogue.tsx` |
| 抽屉式快速通知与系统图标 | `<QuickNotificationDrawer>` / `<QuickNotificationSystem>` | `src/primitives/QuickNotification.tsx`, `src/navigation/QuickNotificationSystem.tsx` |
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
- **中心对称双向填充变体 (`variation="centered"`)**：
  - 支持正负数值范围（如 `-50 ~ +50`）或带偏置中点的对称调节场景。
  - 轨段填充不再局限于单一从左至右，而是以基准点 `origin`（缺省默认为 `0`）为中心，动态向左（负值）或向右（正值）双向填充。
  - 内置常驻基准点指示线 (`showOriginIndicator`，默认开启) 清晰界定零位，支持符号感知显示 (`showSign={true}`，正数显示 `+` 前缀) 与高精度浮点步进。
  - 纯表现层完全解耦设计，未开启 `variation="centered"` 时 100% 保持默认原有行为，杜绝耦合与副作用。

### 6.4 触觉物理开关 (`ToggleSwitch`)
- **对标 Apple 设计**：推荐使用 Apple 经典绿 (`variant="green"`) 以及极简无饱和度黑白 (`variant="black"`)，并提供暖橙变体 (`variant="orange"`)，彻底避免蓝色。

### 6.5 全局视觉基调 (Global Visual & Accent Theme)
- 系统优先使用 **Neutral (无饱和度黑白)** 与 **Warm Amber (暖橙黄色)** 作为核心视觉主色调，相比原蓝色更柔和舒适，并内置视觉基调切换器供全局实时切换。

### 6.6 纯净标准化对话框 (`Dialogue` / `DialogueModal` / `dialogue.show`)
- **零暗色背景遮罩 (Zero Background Mask)**：Dialogue 凭借内发光 (`inset 0 0 36px`) 与 360° 全方向外凸阴影 (`0 0 20px`) 自带高阶浮雕悬浮感。弹窗模式下采用透明背景（`bg-transparent pointer-events-none`），**绝不使用暗色遮罩使底层变暗**，杜绝层级昏暗感。
- **叠层支持与顶层优先渲染 (Stackable Multi-Dialogue)**：支持任意多次并发调用生成多个对话框。最新生成的对话框自动具备递增的 `zIndex` 并渲染在最顶层，底层已有对话框清晰可见。
- **固化标准化规范 (Zero-Config Solidified Specs)**：
  - **字体与版式**：采用 `'SF Mono', 'JetBrains Mono'`，字号 `32px`、字间距 `10px`、字重固化为 `Regular 400`（细体视觉更轻盈）。标题颜色与正文同调 (`titleColorMode: 'content'`)。
  - **图标标准**：默认采用 `Plain` 无外框纯图标（`46px`），支持直接传递 Lucide 图标字符串名称（如 `'octagon-alert'`、`'triangle-alert'`、`'flame'`、`'bell'` 等），颜色自动跟随调性文本色。
  - **按钮规范**：支持 `primary`、`outline`、`danger` 三种变体，居中紧凑等宽对齐；原生支持 `disabled: true`（光标变 `not-allowed` 且阻断交互）。
  - **调用方式**：既支持声明式 `<Dialogue>` / `<DialogueModal>`，亦支持一行代码调用 `dialogue.show({ title, icon, content, tone, buttons })`。

### 6.7 抽屉式快速通知规范 (`QuickNotification` / `QuickNotificationSystem`)
- **与浮窗/托盘系统彻底解耦架构 (Fully Decoupled Slot Architecture & Zero Overhead)**：
  - `<QuickNotificationSystem>` 自身为纯净自闭环的独立通知系统，不强绑定任何外部浮窗或托盘。
  - 专供插槽 `slotRight?: React.ReactNode`：当未传入 `slotRight`（或为 `undefined`/`false`）时，系统彻底不渲染右侧容器或空白占位符（0 冗余布局，0px 空白留白），通知图标与抽屉自然贴合右上角；当传入组件（如 `<FloatingStackIcon />`）时，Slot 1 优雅挂载于通知图标右侧组成并排集群。
  - **Zustand 统一响应式 Store 与 Clean WASM 架构兼容**：`quickNotificationStore` 全面采用统一的 Zustand 状态流，暴露 `useQuickNotificationStore`（支持 Selector 细粒度订阅），并在非 React 环境下导出命令式独立 API（`pushQuickNotification`、`pushOngoingNotification`、`updateOngoingNotification`、`dismissNotification`、`completeOngoingNotification` 等）。同时支持受控模式（Controlled Mode）将通知流直接接入宿主状态流，实现“指哪儿打哪儿”的极低耦合度。
- **系统驱动的三段式生命周期动效**：
  - 仅在存在通知或未读堆叠时显示 Notification Icon。首次生成时严格遵循三段式：中心零尺寸底板 $\rightarrow$ 40×40 容器尺寸形变 $\rightarrow$ 铃铛图标淡入。
  - 最后一个通知处理完成退场时严格遵循时序解耦动效：
    1. **Step 1 (窗口消失)**：当前处理的通知抽屉/窗口滑入收起并关闭 (`~260ms`)，底板与铃铛图标保持常驻；
    2. **Step 2 (Bubble 消失)**：若存在未读计数 Bubble，则在窗口关闭后触发 Bubble 缩放淡出 (`~180ms`)；若无未读直接跳入下一步；
    3. **Step 3 (图标消失)**：铃铛图标向内淡出缩小 (`~140ms`) $\rightarrow$ 40×40 外壳容器平滑向中心收回至 0×0 (`~220ms`) $\rightarrow$ 彻底从 DOM 卸载，彻底消除首条且唯一通知被处理时的突兀瞬变。
- **抽屉向左延展与硬边界遮挡算法 (Occlusion & Left-Sliding Drawer)**：
  - 通知容器从 Notification Icon 背后像抽屉一样向左侧拉出。
  - 抽屉几何右边界严格截断于 Notification Icon 左侧，配合容器 overflow 裁剪，确保抽屉不论内容多长，绝不向右穿帮溢出至 Stack Icon 区域。
- **四级内发光与常规无辉光底板**：
  - 支持 `error` (红)、`orange` (橙)、`warning` (黄)、`info` (灰) 4 级内发光，同时提供 `none`（常规默认容器，无内发光），满足非强制吸引眼球的日常系统反馈。
- **时效性与通知三态规范 (Notification Triad: Temporary, Persistent & Ongoing)**：
  - **按键顺序与视觉层级约束**：常规通知抽屉内部右侧按键顺序严格为：`[业务操作按钮组...] [浅灰透明忽略按键 CircleSlash] [最右侧透明深色收起按键 CollapseToRightIcon]`。两者底色均为透明 (`bg-transparent`)，不带实色底板；收起按键作为推荐操作采用深色高反差图标（亮色模式下为深黑 `text-neutral-900`），忽略键采用低对比度浅灰 (`text-neutral-400`)，符合 Apple HIG 视觉权重引导原则（引导保留/收纳，防止误丢弃）。
  - **业务按钮色卡与模式**：支持 `icon-only` (仅图标)、`icon-text` (图标+文本) 与 `text-only` (仅文本) 三种形式。内置绿色 (接受)、红色 (拒绝)、橙黄色 (重试/警告)、中性黑白、天蓝与紫色 6 档可选色卡。
  - **拒绝/反选操作图标**：严禁使用叉号 (X) 避免误认为关闭窗口，统一采用大拇指向下 (`thumbs-down` / `ThumbsDown`) 或禁行手势。
  - **1. Temporary (临时通知)**：接收原生毫秒参数 (`ms`)，提供 3000ms、5000ms 与自定义预设。超时未处理自动转为“稍后再看”，折叠收纳进右上角堆叠计数 Bubble。
  - **2. Persistent (常驻通知)**：强制包含专用的自定义收起图标组件 `<CollapseToRightIcon>`（Upload 逆时针旋转 90° 且箭头朝右进入托盘，精准表意“收起至右侧通知中心”）。点击收起进入未读计数；点击业务按钮处理后不计入未读数。
  - **3. Ongoing / Background (后台进行中任务通知)**：
    - **核心应用场景**：专用于 Lazy Loading（首屏后非必要资源后台下载）、模型/音频流式加载、WebGPU 着色器预编译等耗时异步管线。
    - **用户不可手动关闭 (Non-Dismissible)**：不渲染收起键 (`CollapseToRightIcon`) 与忽略键 (`CircleSlash`)。常驻显示但不阻塞游戏与 UI 操作，不污染未读堆栈，不产生未读计数红点。
    - **最低优先级让位与恢复 (Lowest Priority Preemption & Restore)**：当有任何高优通知（临时或常驻）产生时，后台通知自动让出抽屉并被遮挡；高优通知处理或超时折叠后，后台通知自动无缝恢复并继续展示。
    - **双模进度条与微动效**：支持确定百分比进度条（0% ~ 100%）与 Apple 风格不确定流光呼吸波（Indeterminate Shimmer Wave），并支持加载图标旋转（`isSpinningIcon`）。
    - **远程生命周期控制 API**：提供 `pushOngoingNotification`（创建）、`updateOngoingNotification`（原地静默更新进度与文案）、`dismissOngoingNotification`（立即关闭）与 `completeOngoingNotification`（闪烁就绪完成态后优雅退出）。
    - **多任务冲突调度策略**：支持配置 `ongoingConflictPolicy` 为 `'latest'`（默认，最后推送/更新优先）或 `'first'`（先占先得锁定）。
  - **强制忽略按钮**：临时与常驻通知强制携带 `<CircleSlash>` (`circle-slash`) 图标，点击直接丢弃并不计入未读数（Ongoing 通知除外）。
- **未读堆栈展开动效与零滚动条**：
  - 点击 Notification Icon 展开未读列表时，各通知容器从其最右侧基准线向左横向抽出展开（`width: 0 -> auto`），彻底杜绝向下飘动与突兀位移。
  - 容器内部隐藏展开过渡期的滚动条（`[&::-webkit-scrollbar]:hidden`），并预留充足的阴影外扩内衬，杜绝右侧阴影被容器物理边缘裁切。
- **Live 实时字符调优模式**：
  - 控制面板支持 Live 模式直接向当前抽屉实时投影字符与按键修改，并附带中英文字符数与预估像素宽度遥测，便于量化评估最佳最大字符限制。
- **字体规范**：
  - 所有通知排版与按键文本严格使用 Monospace 等宽字体（优先 `'SF Mono'`，回退 `'JetBrains Mono'`）。

---

## 7. 界面双分层架构 (Dual-Layer Architecture: Menu Layer vs HUD Layer)

为了根除沟通歧义并降低系统耦合度，项目将游戏与应用界面划分为两个生命周期与交互范式完全正交的独立顶层体系：

### 7.1 层级 A：Menu Layer (菜单系统层 / 模态系统层)
- **定位**：对局暂停、局间大厅、系统设置、车库外观改装与按键映射。
- **特征**：独占交互焦点，背景通常进入变暗遮罩 (Dim) 或暂停 3D 渲染，使用 `MorphContainer` 调度层级流体尺寸形变与三段时序过渡。
- **唯一预览基准**：`<MenuLayerPreviewPage>` (`src/showcase/pages/MenuLayerPreviewPage.tsx`)。
- **命名规范**：沟通此范畴时统一称为 **Menu Layer (菜单层)**，各子面板以 `Layer 1 / Layer 2 / Layer 3` 命名。

### 7.2 层级 B：HUD Layer / Match HUD (对局平视显示层 / 游戏实时层)
- **定位**：比赛对局进行期间直接悬浮于 3D 视口之上的实时数据、态势感知与操作反馈。
- **特征**：非模态、常驻或事件触发、无阻断交互、毫秒级响应、强依赖 18:9 安全区边缘锚定。
- **唯一预览基准**：`<MatchHudPreviewPage>` (`src/showcase/pages/MatchHudPreviewPage.tsx`)。
- **命名规范**：沟通此范畴时统一称为 **Match HUD (对局平视层 / HUD Layer)**，彻底避免与 Menu Layer 混淆。

---

## 8. Match HUD 规范与设计哲学 (Apple HIG + Nintendo 游戏哲学)

原始 Rocket League UI 具有 2015 时代厚重视效和局部遮挡过多的问题。本项目借鉴两大设计哲学进行重构：

### 8.1 设计哲学融合
1. **Apple HIG 现代克制美学**：
   - 晶莹磨砂材质 (`backdrop-blur-md bg-neutral-950/80 border-neutral-700/60`)。
   - 严格的等宽排版（`font-mono tabular-nums`），杜绝倒计时与速度数字跳动引发的微抖动。
   - 环形仪表借鉴 Apple Watch Activity Rings，圆润弧线与极简刻度。
2. **Nintendo 触感与瞬间可读性 (Game Feel in Motion)**：
   - 高速运动状态下的**瞬间形状辨识度**（如超音速 2200 uu/s 紫色脉冲、开球 3-2-1-GO! 弹性冲击波）。
   - 空翻窗口（Flip Timer 1.5s）与四轮触球（Flip Reset）的直观感知反馈（钻石星芒 + 四轮独立接触传感器点亮指示）。
3. **表现层完全解耦**：
   - 所有 HUD 组件均为**纯表现层**，接收单向 `props`，不捆绑游戏循环或 WASM 单例。
4. **预览内容无污染标准 (Footer Description Pattern)**：
   - 预览外部控制器使用清晰中文辅助配置；
   - 预览内部所有组件（Settings、HUD 标识）严格遵循标准英文电竞规范，杜绝杂乱的中文残留；
   - 采用 RLCleanWASM 沉淀的标准模式：通过 hover 动态将说明投射到面板 Footer 中，面板主体保持单行清爽极简。

### 8.2 HUD 标准组件索引对照表

| 组件名称 | 表现职责 | 锚定位置 | 文件路径 |
|---|---|---|---|
| `<ScoreboardHUD>` | 队伍比分、5分钟倒计时、加时赛指示与模式徽章 | 顶部中心 | `src/hud/ScoreboardHUD.tsx` |
| `<KickoffCountdownHUD>` | 开球 3-2-1-GO! 弹性冲击波倒计时 | 屏幕中央 | `src/hud/KickoffCountdownHUD.tsx` |
| `<BoostGaugeHUD>` | 推进量环形/线性仪表、无限模式、喷火粒子高亮 | 右下角 | `src/hud/BoostGaugeHUD.tsx` |
| `<BallCamIndicatorHUD>` | 球相机瞄准状态指示、出画来球方向与距离箭头 | 左下角 | `src/hud/BallCamIndicatorHUD.tsx` |
| `<SpeedometerHUD>` | 车辆速度表、2200 uu/s 超音速刻度线与激波光效 | 底部中心 | `src/hud/SpeedometerHUD.tsx` |
| `<FlipTimerHUD>` | 空中 1.5s 翻滚窗口倒计时与四轮触球 Flip Reset 提示 | 底部中心 (速度表上方) | `src/hud/FlipTimerHUD.tsx` |
| `<MatchEventsHUD>` | 进球 (GOAL)、扑救 (SAVE)、爆破 (DEMO) 赛况横幅 | 中上部 | `src/hud/MatchEventsHUD.tsx` |
| `<QuickChatHUD>` | 战术快捷短语聊天气泡流 (Team/All) | 左上角 | `src/hud/QuickChatHUD.tsx` |
| `<NetworkDiagnosticsHUD>` | 120Hz 物理时钟、Ping、Sub-tick 时延抖动遥测 | 右上角 | `src/hud/NetworkDiagnosticsHUD.tsx` |
| `<MatchHudContainer>` | HUD 全局编排容器 (支持 Safe Area 与独立开关) | 全屏视口 | `src/hud/MatchHudContainer.tsx` |

### 8.3 HUD 亮暗色调与球场光照自适应 (Daylight & Ambient Adaptation)
- **球场光照控制器**：`<MatchHudPreviewPage>` 提供「日光球场 (Daylight · 亮色调)」、「黄昏晚霞 (Twilight)」与「夜间电竞 (Night · 暗色调)」三档预设及平滑亮度滑块，用于模拟高动态范围游戏场景。
- **高对比描边与玻璃材质**：所有 HUD 控件均自带微描边与柔和投影，确保在亮色日光球场草皮与深色夜空背景下均保持极佳的辨识度。
- **右上角遥测 HUD 亮色模式**：`<NetworkDiagnosticsHUD>` 支持 `isLight` 玻璃拟态，呈现晶莹白底、高对比文字与动态状态着色。

---

## 9. 加载界面与双层进度条规范 (Loading Pipeline Architecture)

为了呈现符合 Apple 极简美学 (Simple Simplicity) 的资源初始化体验，系统引入解耦的加载子系统：

### 9.1 双层进度推进模式 (Dual-Layer Progress Architecture)
1. **全局步骤条 (Overall Pipeline Progress)**：
   - 追踪宏观流程的推进阶段（如 `Step 3 of 6: Downloading Champions Field Geometry`）。
   - 采用标准细扁圆角条（`h-1.5`）与柔和弹簧缓动。
2. **微步骤进度条 (Micro-Step Progress)**：
   - **确定态 (Determinate - 如资产/纹理下载)**：实时显示传输统计（已加载大小、文件总量、瞬时传输速率 `MB/s`、预估剩余秒数）。
   - **不确定态 (Indeterminate - 如编译着色器 Compiling Shaders)**：采用 Apple 风格流光呼吸波（Shimmer Wave），并附带明确的状态文案（如 `Warming graphics pipeline cache (18/64 variants) · WebGPU active, not frozen`），消除假死焦虑。

### 9.2 异常熔断与红色告警 (Throw Error & Failure Recovery)
- 当异步管线抛出致命异常 (`Throw Error`) 时：
  - 双层进度条即时熔断变为警告红色 (`bg-red-500` 与红色辉光)；
  - 动态弹出手风琴式错误详情卡（包含错误代码、技术诊断堆栈与重试/重置操作按钮）；
  - 允许点击「恢复并继续」重新回到就绪推进流。

### 9.3 组件索引与预览
- **组件路径**：`<DualProgressBar>` 与 `<LoadingScreen>` (`src/loading/`)
- **唯一预览基准**：`<LoadingScreenPreviewPage>` (`src/showcase/pages/LoadingScreenPreviewPage.tsx`)，注册于主导航栏。


