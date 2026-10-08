# UIStorybook 🎮

> Standardized, Zero-Black-Box, Agent-Friendly UI Component Reference & Storybook for Game and Modern Web Applications.

UIStorybook 是针对 [RLCleanWASM](https://github.com/Antigravi-ty/RLCleanWASM)（基于 Three.js 与 RocketSim WebAssembly 的 3D 赛车足球游戏）以及现代高性能 Web 交互场景设计的**标准化 UI 设计规范与代码参考谱（Recipe Catalog）**。

---

## 💡 为什么是「参考谱 (Recipe Registry)」而非「NPM Package」？

| 维度 | NPM Package 模式 | UIStorybook 参考谱模式 (推荐) |
|---|---|---|
| **AI Agent 可见性** | ❌ 沦为黑盒代码 (`node_modules`)，Agent 无法感知内部 DOM 与样式 | ✅ **100% 透明源码**，Agent 可随时阅读、理解与精确引用 |
| **迭代摩擦** | ❌ 修改一个 padding 或样式需经过打包、发布、版本更新多重阻碍 | ✅ **即抄即用 (Copy-Paste)**，零发布摩擦，随时局部微调 |
| **样式与打包兼容** | ❌ 易发生 Tailwind CSS 打包冲突或特异性缺失 | ✅ **原生 Tailwind 工具类**，无专属 CSS-in-JS 或环境锁 |
| **游戏物理与状态解耦** | ❌ 外部组件难以适配 Three.js / WASM 的微秒级渲染回路 | ✅ **逻辑归逻辑，样式归样式**：UI 层为纯展示函数，游戏层自由接入 Zustand |
| **文件大小防溢出** | ❌ 动辄巨型 bundle | ✅ **单文件微型化**（均远小于 100KB，当前最大仅 19KB），杜绝 context 上下文溢出 |

---

## 📐 视口算法、Safe Area 与 分层架构 (对标 RLCleanWASM)

- **顶栏与侧边栏常驻固定**：
  - **Header**：固定在屏幕正上方，保持 100% 原始比例，不随内容滚动。
  - **Sidebar**：固定在左侧，保持 100% 原始比例，具备独立滚动能力。
- **Scaling 作用域仅限于 Content**：右上角 UI Scaling 仅对右侧 Content 内容区域进行等比缩放（50% ~ 200%），控制条与导航栏始终稳定可用。
- **Safe Area Margin 全局生效与负值过扫描 (-5% ~ +10%)**：
  - **正值 (+5%)**：整个 UI 外框向内安全缩进 5%，保护边缘不受屏幕硬件切角影响。
  - **负值 (-5%)**：整个 UI 外框扩展至物理视窗外 5%（`top: -5%, left: -5%, right: -5%, bottom: -5%`），侧边栏与顶栏自然超出可见视窗边界，真实模拟不关心异形屏/刘海切角的“全覆盖过扫描模式 (Display Overscan Bleed)”。
  - 物理视窗常驻 HUD 遥测条与右下角紧急重置按钮，防止操作锁死。
- **18:9 宽高比限制 (Aspect Ratio Clamp)**：最宽支持 18:9（2:1）。超过该比例时，最大宽度被限制在 `Hsafe * 2.0`，两侧留白（Pillarbox），杜绝超宽畸变。
- **1:1 纵横比底线 (Portrait Gate)**：最窄不得低于 1:1（纵向不可比横向长）。小于 1:1 时触发友好警告拦截。
- **Apple 专业级纯白浅色模式**：遵循 Apple 设计规范，以干净纯白 (`bg-white` / `#ffffff`) 为主背景，搭配磨砂玻璃顶栏与浅灰层次侧边栏。

---

## 🎬 动效规范与统一容器过渡引擎 (Animation & MorphContainer)

系统将弹窗外壳与容器过渡解耦，由统一表现层引擎 `MorphContainer`（`src/navigation/transitions.tsx`）统一调度两种过渡规范：
1. **`FluidMorphTransition` (连续流体变形)**
   - 曲线：内置 Apple HIG `[0.2, 0.8, 0.25, 1]` 物理阻尼曲线。
   - 参数：只需传入单个时间参数 `fluidDuration`（默认 `0.28s`）。
   - 特性：窗口宽高与内容通过 Apple Ease 曲线在 GPU 层同步连续平滑插值，移除阻断动画的 `mode="wait"`，适合轻量级容器变形。
2. **`SequencedStepTransition` (三段时序分步过渡)**
   - 阶段 1：`100ms` 旧内容淡出 (Fade Out，由 `stepFadeDuration` 控制，默认 `0.10s`)，Apple Ease
   - 阶段 2：`150ms` 容器尺寸变形 (Container Resize，由 `stepResizeDuration` 控制，默认 `0.15s`)，Apple Ease
   - 阶段 3：`100ms` 新内容显现淡入 (Show Up Fade In，由 `stepFadeDuration` 控制，默认 `0.10s`)，Apple Ease
   - 总时长：`350ms`
   - 特性：三阶段状态机严格解耦，杜绝复杂表单形变时的布局振颤与重排闪烁。
3. **架构统一**：
   - 全局弹窗 `MorphingShell` 纯粹专注于 Radix Dialog 模态层与壳体样式，底层容器尺寸形变直接委托给 `MorphContainer`。
   - `AnimationPage` 动效沙盒与 `NavigationPage`/`MenusPage` 全局弹窗完全共享同一套引擎，实现“指哪儿打哪儿”。
4. **触感微交互 (Tactile Micro-interactions)**
   - `active:scale-[0.98]` 物理弹簧阻尼，扁平按键毫秒级响应。

---

## 🗂️ 界面双分层体系 (Dual-Layer: Menu Layer vs HUD Layer)

系统将游戏与交互界面严格区分为两层完全解耦的架构：
1. **Menu Layer (系统/菜单/模态层)**：对局暂停、局间大厅、系统设置、车库改装与按键映射。由 `MorphContainer` 调度层级形变，在 `<MenuLayerPreviewPage>` 预览。
   - **Layer 1: 根级全局菜单** (`Layer1MainMenuRecipe`, `Layer1MatchPostRecipe`)
   - **Layer 2: 专项功能二级菜单** (`Layer2GarageRecipe`, `Layer2SettingsRecipe`, `Layer2PlayRecipe`, `Layer2MatchStatsRecipe`, `KeybindingRecipe`)
   - **Layer 3: 深度参数三级面板** (`Layer3AudioDetailRecipe`, `Layer3BallTrajectoryRecipe`)
2. **Match HUD Layer (对局平视显示层 / HUD Layer)**：比赛进行时的实时态势感知与实时仪表，在 `<MatchHudPreviewPage>` 预览。
   - `ScoreboardHUD`: 积分板与 5 分钟倒计时 / 加时赛指示
   - `KickoffCountdownHUD`: 开球 3-2-1-GO! 冲击波倒计时
   - `BoostGaugeHUD`: 环形 (Apple Activity Ring 风格) 与线性推进仪表 (0-100 & 无限模式)
   - `BallCamIndicatorHUD`: 球相机瞄准状态与出画方位角度指示器
   - `SpeedometerHUD`: 速度计与 2200 uu/s 超音速激波指示
   - `FlipTimerHUD`: 空中 1.5s 翻滚窗口倒计时与四轮触球 Flip Reset 状态指示器
   - `MatchEventsHUD`: 进球、扑救、爆破赛况横幅
   - `QuickChatHUD`: 战术快捷聊天气泡流
   - `NetworkDiagnosticsHUD`: 120Hz 物理时钟与微秒级抖动监控
   - `MatchHudContainer`: HUD 整体安全区布局编排外壳

所有组件均为低耦合纯呈现组件，支持单行直接调用，严禁注入游戏引擎单例。

---

## 🛠️ 本地运行与构建

```bash
# 1. 安装依赖
npm install

# 2. 启动开发预览服务器
npm run dev

# 3. 生产静态构建
npm run build
```

---

## 🤖 AI Agent 协作使用指南

当指示 AI Agent 在 RLCleanWASM 中构建或修改界面时，请使用标准化提示词模板：

```markdown
请使用 UIStorybook 规范在 RLCleanWASM 中实现 [功能名称]：
- 菜单层级：Layer 1 根菜单 或 Layer 2 专项子菜单
- 过渡动效：选择 FluidMorphTransition 或 SequencedStepTransition
- 布局结构：3-Stage Compound Panel (Header, Content, Footer)
- 包含控件：UnderlineTabs 分页, SliderControl 调节参数, KeycapBadge 显示快捷键
- 状态连接：订阅 Zustand useUIStore，不得污染底层 Primitives 纯展示组件
```

详细规则参见 [AGENT_GUIDE.md](./AGENT_GUIDE.md)。
