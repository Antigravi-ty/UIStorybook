import React from 'react';
import {
  Palette,
  Maximize2,
  Ruler,
  Activity,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import {
  UI_THEME,
  ACCENT_THEMES,
  AccentColor,
} from '../../tokens/colors';
import { UI_RADIUS } from '../../tokens/radius';
import { UI_SPACING } from '../../tokens/spacing';
import { UI_EASING } from '../../tokens/easing';
import { useAccentStore } from '../../tokens/themeStore';
import { CodeBlock } from '../CodeBlock';

export const FoundationsPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const { accent, setAccent, tokens } = useAccentStore();

  const accentList: { key: AccentColor; name: string; desc: string; previewBg: string }[] = [
    {
      key: 'amber',
      name: 'Amber (暖橙 · 默认推荐)',
      desc: '柔和不刺眼的电竞高对比主色调，替代高频刺眼蓝，兼顾暗黑球场与纯白浅色模式。',
      previewBg: 'bg-amber-500',
    },
    {
      key: 'neutral',
      name: 'Neutral (极简黑白 · 零饱和度)',
      desc: '对标 Apple / Linear 纯粹无彩色系统，将色彩注意力 100% 留给 3D 视口与遥测状态。',
      previewBg: 'bg-neutral-900 dark:bg-neutral-100',
    },
    {
      key: 'sky',
      name: 'Sky (经典科学蓝)',
      desc: '适合传统工程遥测、网络诊断与需要冷色辅助标记的场景。',
      previewBg: 'bg-sky-500',
    },
  ];

  const radiusEntries = [
    { key: 'window', value: UI_RADIUS.window, desc: '主菜单与模态窗口外框 (16px)' },
    { key: 'panel', value: UI_RADIUS.panel, desc: '3-Stage Compound 标准面板 (16px)' },
    { key: 'card', value: UI_RADIUS.card, desc: '通用内容卡片与选择器 (12px)' },
    { key: 'menuItem', value: UI_RADIUS.menuItem, desc: '52px 触控菜单项与大按钮 (12px)' },
    { key: 'button', value: UI_RADIUS.button, desc: '常规按钮、分段切换外框 (8px)' },
    { key: 'badge', value: UI_RADIUS.badge, desc: '状态胶囊徽章与内联标签 (6px)' },
    { key: 'keycap', value: UI_RADIUS.keycap, desc: '键盘/手柄扁平键位徽章 (6px)' },
  ];

  const spacingScale = [
    { name: 'space1', rem: UI_SPACING.space1, px: '4px' },
    { name: 'space1_5', rem: UI_SPACING.space1_5, px: '6px' },
    { name: 'space2', rem: UI_SPACING.space2, px: '8px (Menu Container Cushion)' },
    { name: 'space2_5', rem: UI_SPACING.space2_5, px: '10px (Menu Item Gap)' },
    { name: 'space3', rem: UI_SPACING.space3, px: '12px' },
    { name: 'space4', rem: UI_SPACING.space4, px: '16px (Footer Vertical)' },
    { name: 'space5', rem: UI_SPACING.space5, px: '20px (Body Vertical / Header Top)' },
    { name: 'space6', rem: UI_SPACING.space6, px: '24px (3-Stage Horizontal Baseline)' },
    { name: 'space8', rem: UI_SPACING.space8, px: '32px' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Layer 0 · Foundations (基石与变量)</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          L0. Foundations 基石与设计变量
        </h1>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          金字塔最底层的纯静态常量、几何尺寸 Token 与轻量主题 Store（<code className="font-mono">src/tokens/</code>）。
          <strong>准入铁律</strong>：零业务 JSX 组件、零上层（L1~L7）反向依赖。修改任意 Token 即可精准调控全局视觉基调，绝不引发跨层循环耦合。
        </p>

        {/* Zero-dependency verification strip */}
        <div
          className={`mt-1 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
            isLight
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-emerald-950/30 border-emerald-800/70 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              <strong>L0 Dependency Audit:</strong> 0 JSX Components · 0 Imports from L1–L7 · Pure Unidirectional Root
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
            PASS · 100% Decoupled
          </span>
        </div>
      </div>

      {/* 1. Colors & Theme Store */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Palette className="h-4 w-4 text-amber-500" />
            <span>1. 色彩基调与主题 Store (colors.ts & themeStore.ts)</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            Active Accent: <strong className={tokens.text}>{accent.toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {accentList.map((item) => {
            const isSelected = accent === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setAccent(item.key)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-500/20'
                      : 'bg-neutral-800/90 border-amber-500/70 ring-2 ring-amber-500/20'
                    : isLight
                    ? 'bg-neutral-50/80 hover:bg-neutral-100/80 border-neutral-200'
                    : 'bg-neutral-900 hover:bg-neutral-800/60 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-3.5 w-3.5 rounded-full ${item.previewBg}`} />
                    <span className="font-bold text-xs">{item.name}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />}
                </div>
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {item.desc}
                </p>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
                  <span>Token:</span>
                  <code className="px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    ACCENT_THEMES.{item.key}
                  </code>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Radius Tokens */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Maximize2 className="h-4 w-4 text-amber-500" />
          <span>2. 语义化圆角系统 (radius.ts · UI_RADIUS)</span>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          弃用胶囊形（Pill）菜单与无序圆角，按容器层级从外到内严格递减（Window 16px → Card/MenuItem 12px → Button 8px → Keycap/Badge 6px）：
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {radiusEntries.map((r) => (
            <div
              key={r.key}
              className={`p-3.5 border flex items-center gap-3 ${r.value} ${
                isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <div
                className={`h-10 w-10 border-2 shrink-0 flex items-center justify-center font-mono text-[10px] font-bold ${r.value} ${
                  isLight
                    ? 'border-neutral-800 bg-white text-neutral-900'
                    : 'border-amber-400 bg-neutral-950 text-amber-400'
                }`}
              >
                R
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs">UI_RADIUS.{r.key}</span>
                </div>
                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                  {r.value}
                </span>
                <span className={`text-[11px] truncate ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {r.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Spacing & Optical Cushioning Standards */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Ruler className="h-4 w-4 text-emerald-500" />
          <span>3. 间距阶梯与 3-Stage 光学衬距 (spacing.ts · UI_SPACING)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 4px Grid */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
            }`}
          >
            <span className="font-bold text-xs">4px 物理网格阶梯 (Base Grid)</span>
            <div className="flex flex-col gap-1.5">
              {spacingScale.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500">UI_SPACING.{s.name}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 bg-amber-500/80 rounded-xs"
                      style={{ width: s.rem }}
                    />
                    <span className="text-[11px]">{s.px}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Stage Panel & Stack Percentage Spec */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
            }`}
          >
            <div className="flex flex-col gap-2">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>3-Stage Compound 面板与菜单物理衬距</span>
              </span>
              <ul className={`text-xs space-y-1.5 font-mono ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                <li>
                  • <strong>panel.header</strong>: <code>{UI_SPACING.panel.header}</code> (光学垂直居中)
                </li>
                <li>
                  • <strong>panel.body</strong>: <code>{UI_SPACING.panel.body}</code> (24px 严守水平基线)
                </li>
                <li>
                  • <strong>panel.footer</strong>: <code>{UI_SPACING.panel.footer}</code> (底部快捷键提示栏)
                </li>
                <li>
                  • <strong>menu.container</strong>: <code>{UI_SPACING.menu.container}</code> (防聚焦环裁切缓冲)
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-1">
              <span className="font-bold text-xs">Active Canvas 百分比栅格间距 (Stack Gaps)</span>
              <div className="flex items-center gap-3 text-xs font-mono text-amber-600 dark:text-amber-400">
                <span>sm: {UI_SPACING.stackPercentage.sm}</span>
                <span>•</span>
                <span>md: {UI_SPACING.stackPercentage.md}</span>
                <span>•</span>
                <span>lg: {UI_SPACING.stackPercentage.lg}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Easing & Motion Curves */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Activity className="h-4 w-4 text-sky-500" />
          <span>4. Apple HIG 缓动与物理弹簧预设 (easing.ts · UI_EASING)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
            <div className="font-bold text-amber-500 mb-1">UI_EASING.apple</div>
            <div className="text-[11px]">[{UI_EASING.apple.join(', ')}]</div>
            <div className="text-[10px] text-neutral-400 mt-1">Fluid & Sequenced 标准曲线</div>
          </div>
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
            <div className="font-bold text-emerald-500 mb-1">spring.tactile</div>
            <div className="text-[11px]">stiffness: {UI_EASING.spring.tactile.stiffness}, damping: {UI_EASING.spring.tactile.damping}</div>
            <div className="text-[10px] text-neutral-400 mt-1">按钮与开关微触觉反馈</div>
          </div>
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
            <div className="font-bold text-sky-500 mb-1">spring.smooth</div>
            <div className="text-[11px]">stiffness: {UI_EASING.spring.smooth.stiffness}, damping: {UI_EASING.spring.smooth.damping}</div>
            <div className="text-[10px] text-neutral-400 mt-1">容器与指示条平滑过渡</div>
          </div>
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
            <div className="font-bold text-rose-500 mb-1">spring.bouncy</div>
            <div className="text-[11px]">stiffness: {UI_EASING.spring.bouncy.stiffness}, damping: {UI_EASING.spring.bouncy.damping}</div>
            <div className="text-[10px] text-neutral-400 mt-1">开球倒计时与高光弹性动画</div>
          </div>
        </div>
      </div>

      <CodeBlock
        isLight={isLight}
        title="L0 Foundations 标准按需引用示例 (零上层依赖)"
        code={`import { UI_SPACING, UI_RADIUS, UI_EASING, useAccentStore } from '@/tokens';

// 1. 直接读取语义化圆角与 3-Stage 衬距标准
const headerClass = \`\${UI_SPACING.panel.header} \${UI_RADIUS.panel}\`;

// 2. 订阅轻量级主题基调 (Amber / Neutral / Sky)
const { accent, tokens, setAccent } = useAccentStore();`}
      />
    </div>
  );
};
