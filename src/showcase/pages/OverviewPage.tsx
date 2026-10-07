import React from 'react';
import { CheckCircle2, XCircle, Sparkles, Layers, Box, Cpu } from 'lucide-react';
import { CodeBlock } from '../CodeBlock';

export const OverviewPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Hero header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>RLCleanWASM & UIStorybook 统一架构方案</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          设计理念与架构思路
        </h1>
        <p className={`text-base font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
          标准化、零黑盒、Agent-Friendly 的现代化 UI 体系
        </p>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          为 RocketSim WASM / Three.js 游戏与现代 Web 应用量身定制的标准化组件参考库。
          核心目标：彻底解耦「游戏逻辑」与「视觉样式」，为 AI Agent 提供准确、可复现、无冲突的代码蓝图。
        </p>
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
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>UIStorybook 代码参考库模式的绝对优势</span>
            </div>
            <ul className={`text-xs space-y-2 list-disc list-inside ${isLight ? 'text-neutral-700' : 'text-neutral-200'}`}>
              <li><strong>零黑盒透明性 (Zero Black-Box)</strong>：每个组件代码纯净明了，AI Agent 可以直接理解、精确拷贝并即时嵌入项目。</li>
              <li><strong>100% Tailwind 原生</strong>：全部采用语义清晰的 utility classes，无任何动态 CSS-in-JS 或专有样式锁。</li>
              <li><strong>Prompt 指令标准化</strong>：给 Agent 发指令时，只需声明「使用 UnderlineTabs + 3-Stage Compound Panel 构建面板」，Agent 即可直接查阅标准实现。</li>
              <li><strong>交互式验证沙盒</strong>：UIStorybook 作为活文档 (Living Documentation)，提供全功能展示与实时布局观测。</li>
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
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          为了确保多次迭代间不产生冲突，我们确立两层职责分离原则：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-xl border transition-colors ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800' : 'bg-neutral-900 border-neutral-700/80 text-neutral-100'
            }`}
          >
            <span className={`font-bold text-sm block mb-2 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
              1. 表现层 (UIStorybook Primitives)
            </span>
            <p className={`text-xs mb-3 ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              所有的 Primitive 与 Layout 组件必须保持 <strong>100% 纯展示 (Pure Presentational)</strong>：
            </p>
            <ul className={`text-xs space-y-1.5 list-disc list-inside ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              <li>严禁导入 Zustand、GameRuntime 或 WASM 对象</li>
              <li>数据完全通过 <code className={`font-mono ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>props</code> 传入</li>
              <li>交互完全通过 <code className={`font-mono ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>callbacks (onClick, onChange)</code> 抛出</li>
              <li>支持通用主题模式 (<code className={`font-mono ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>isLight</code>)</li>
            </ul>
          </div>

          <div
            className={`p-4 rounded-xl border transition-colors ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800' : 'bg-neutral-900 border-neutral-700/80 text-neutral-100'
            }`}
          >
            <span className={`font-bold text-sm block mb-2 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
              2. 业务连接层 (RLCleanWASM Panels)
            </span>
            <p className={`text-xs mb-3 ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              业务 Panel 组件只做 <strong>状态订阅与装配胶水 (Wiring Glue)</strong>：
            </p>
            <ul className={`text-xs space-y-1.5 list-disc list-inside ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              <li>使用 Zustand Store 订阅游戏状态 (<code className={`font-mono ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>useUIStore</code>)</li>
              <li>监听按键或 GameRuntime 事件</li>
              <li>将状态传递给 UIStorybook 的纯展示组件</li>
              <li>不侵入修改底层 Primitive 的内部实现</li>
            </ul>
          </div>
        </div>

        <CodeBlock
          isLight={isLight}
          title="示例：业务连接层如何无缝调用表现层组件"
          code={`// RLCleanWASM/src/ui-system/panels/SettingsPanel.tsx
import React from 'react';
import { useUIStore } from '../core/store';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../primitives/Panel';
import { UnderlineTabs } from '../primitives/UnderlineTabs';
import { SliderControl } from '../primitives/SliderControl';

export const SettingsPanel = () => {
  // 1. 逻辑层：从 Zustand 提取状态与动作
  const { theme, soundVolume, setSoundVolume, goBack } = useUIStore();
  const isLight = theme === 'light';

  // 2. 表现层：纯组件组装，无额外样式黑盒
  return (
    <PanelContainer isLight={isLight}>
      <PanelHeader title="SETTINGS" onBack={goBack} isLight={isLight} />
      <PanelContent>
        <SliderControl
          label="Sound Volume"
          value={soundVolume}
          min={0} max={100} unit="%"
          onChange={setSoundVolume}
          isLight={isLight}
        />
      </PanelContent>
      <PanelFooter hint="ESC to Back" isLight={isLight} />
    </PanelContainer>
  );
};`}
        />
      </div>

      {/* Component Taxonomy */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-500" />
          <span>标准化组件全景图 (Component Taxonomy)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div
            className={`p-4 rounded-xl border transition-colors ${
              isLight
                ? 'bg-neutral-50/90 border-neutral-200 text-neutral-800'
                : 'border-neutral-700/80 bg-neutral-900 text-neutral-100'
            }`}
          >
            <span className={`font-bold block mb-2 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
              原子控件 (Primitives)
            </span>
            <ul className={`space-y-1 font-mono text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              <li>• Badge (状态徽章 / Rounded & Pill)</li>
              <li>• KeycapBadge (键盘/手柄按键徽章 / Flat)</li>
              <li>• Button (交互按钮与按键槽)</li>
              <li>• UnderlineTabs (滑动下划线标签)</li>
              <li>• SegmentedSwitch (苹果触感分段切换)</li>
              <li>• SliderControl (步进滑动条)</li>
              <li>• ToggleSwitch (触感开关)</li>
            </ul>
          </div>

          <div
            className={`p-4 rounded-xl border transition-colors ${
              isLight
                ? 'bg-neutral-50/90 border-neutral-200 text-neutral-800'
                : 'border-neutral-700/80 bg-neutral-900 text-neutral-100'
            }`}
          >
            <span className={`font-bold block mb-2 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
              布局栈 (Layout & Stacks)
            </span>
            <ul className={`space-y-1 font-mono text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              <li>• VStack (垂直流布局 / Tokenized Gaps)</li>
              <li>• HStack (水平流布局 / 栅格对齐)</li>
              <li>• GridStack (矩阵网格阵列)</li>
              <li>• Card (通用卡片容器)</li>
              <li>• SelectableCard (车辆/道具选择器)</li>
              <li>• Panel (3-Stage 复合面板规范)</li>
              <li>• GameViewport (18:9 & 1:1 视口边界控制)</li>
            </ul>
          </div>

          <div
            className={`p-4 rounded-xl border transition-colors ${
              isLight
                ? 'bg-neutral-50/90 border-neutral-200 text-neutral-800'
                : 'border-neutral-700/80 bg-neutral-900 text-neutral-100'
            }`}
          >
            <span className={`font-bold block mb-2 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
              导航与动效 (Navigation & Motion)
            </span>
            <ul className={`space-y-1 font-mono text-[11px] ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              <li>• MenuItem (52px 触控标准菜单项)</li>
              <li>• MenuContainer (键盘循环焦点)</li>
              <li>• MenuStack (1级/2级状态机与路由)</li>
              <li>• BreadcrumbNav (面包屑导航)</li>
              <li>• MorphingShell (自适应变形窗口)</li>
              <li>• SafeAreaHud (屏幕安全区标线与遥测条)</li>
              <li>• UI_EASING (Apple HIG 动效预设)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
