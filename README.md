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

## 🗂️ 菜单分级架构与直接调用系统 (Menu Hierarchy)

- **Layer 1: 根级全局菜单 (Root Game Menus)**
  - `Layer1MatchPostRecipe` (比赛暂停/赛后战报根菜单, `420px`)：再来一局、战报统计入口、车库改装与设置。
  - `Layer1MainMenuRecipe` (经典暂停大厅根菜单, `420px`)：恢复游戏、车库装配、按键设置。
- **Layer 2: 专项功能二级菜单 (Category Sub-Menus)**
  - `Layer2MatchStatsRecipe` (赛后数据与战术遥测, `580px`)：蓝橙对局看板、进球/助攻/扑救指标网格。
  - `Layer2GarageRecipe` (车库改装与涂装, `660px`)：UnderlineTabs 车型/轮毂/尾气选择器。
  - `Layer2SettingsRecipe` (音画与系统设置, `520px`)：音量滑块、画质分段选择、视野 FOV 调节。
  - `KeybindingRecipe` (按键与手柄映射, `560px`)：键盘/手柄键位重映射。
- **Layer 3: 深度参数三级面板 (Granular Detail Sub-Menus)**
  - `Layer3AudioDetailRecipe` (音频高级均衡器与声场, `480px`)：3-Band EQ、动态范围、HRTF 3D 空间环绕声。
  - `Layer3BallTrajectoryRecipe` (弹道预测器面板, `480px`)：飞行时域、自旋向量与落点环。

---

## 🎯 HUD Layer: 对局平视显示层 (In-Game HUD Overlay)

与模态交互的 **Menu Layer (菜单交互层)** 清晰解耦，**HUD Layer (对局平视显示层)** 专为高速 120Hz 3D 赛车足球场景设计，融合 Nintendo 竞技感知与 Apple 极简工业质感：
- `<MatchScoreboardHUD>`：顶栏对局比分板、5 分钟时钟、加时赛脉冲与开球 3-2-1 倒计时。
- `<BoostGaugeHUD>`：右下角推进器仪表（支持现代化 Apple Arc Ring 弧环与 RLCleanWASM Linear 刻度双模），含喷气发光与无限氮气（∞）。
- `<BallCamIndicatorHUD>`：左下角球相机视角指示胶囊，带瞄准环光晕与按键快捷键徽章。
- `<SpeedometerHUD>`：底端中置 0~2300 uu/s 非线性速度计，2200 刻度线触发紫光超音速突破拖尾。
- `<FlipTimerHUD>`：空翻二段跳 1.25s 倒计时与 4 轮触球 `FLIP RESET!` 刷新提示，解决高阶微操盲区。
- `<MatchAccoladeBannerHUD>`：正中进球高光庆祝横幅、开球 3-2-1 与史诗扑救播报。
- `<QuickChatFeedHUD>`：左上角快捷战术短语流与队伍颜色条。
- `<MatchHudRecipe>`：全景自适应平视组合配方，单行直接嵌入游戏视口。

所有 HUD 组件均为纯表现层无引擎依赖设计，支持单行独立引入或在 `<HudLayerPreviewPage>` 中实时调测交互。

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
