import React from 'react';
import { 
  BookOpen, 
  Tag, 
  Sliders, 
  Layers, 
  Square, 
  LayoutTemplate, 
  Compass, 
  FileCode2, 
  FolderTree, 
  Activity, 
  Sun, 
  Moon,
  Palette,
  Eye,
  AppWindow,
  Gauge,
  Loader2,
  Crosshair
} from 'lucide-react';
import { useAccentStore } from '../tokens';
import { AccentColor } from '../tokens/colors';

export type ShowcaseTab = 
  | 'overview' 
  | 'badges' 
  | 'tabs' 
  | 'hud-elements'
  | 'stacks' 
  | 'cards' 
  | 'panels' 
  | 'layer-preview'
  | 'hud-preview'
  | 'loading-preview'
  | 'menus'
  | 'navigation' 
  | 'live-preview'
  | 'floating-windows'
  | 'animation'
  | 'recipes';

export interface SidebarProps {
  activeTab: ShowcaseTab;
  onSelectTab: (tab: ShowcaseTab) => void;
  isLight: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isLight,
  onToggleTheme,
}) => {
  const { accent, tokens, setAccent } = useAccentStore();

  const navItems: { id: ShowcaseTab; label: string; icon: React.ReactNode; category: string }[] = [
    { id: 'overview', label: '设计理念与架构思路', icon: <BookOpen className="h-4 w-4" />, category: 'Core Architecture' },
    { id: 'badges', label: 'Badge & Keycap 徽章与键位', icon: <Tag className="h-4 w-4" />, category: 'Atomic Primitives' },
    { id: 'tabs', label: 'Tabs & Controls 控件', icon: <Sliders className="h-4 w-4" />, category: 'Atomic Primitives' },
    { id: 'hud-elements', label: 'HUD Elements 独立仪表', icon: <Crosshair className="h-4 w-4 text-red-500" />, category: 'Atomic Primitives' },
    { id: 'stacks', label: 'Stack 栅格布局 (H/V/Grid)', icon: <Layers className="h-4 w-4" />, category: 'Layout Primitives' },
    { id: 'cards', label: 'Card 卡片与选择器', icon: <Square className="h-4 w-4" />, category: 'Layout Primitives' },
    { id: 'panels', label: '3-Stage Compound 面板', icon: <LayoutTemplate className="h-4 w-4" />, category: 'Compound Widgets' },
    { id: 'layer-preview', label: 'Menu Layer 实时预览', icon: <Layers className="h-4 w-4" />, category: 'Navigation & Motion' },
    { id: 'hud-preview', label: 'Match HUD 实时预览', icon: <Gauge className="h-4 w-4 text-emerald-500" />, category: 'Navigation & Motion' },
    { id: 'loading-preview', label: 'Loading 加载与双层进度条', icon: <Loader2 className="h-4 w-4 text-sky-500" />, category: 'Navigation & Motion' },
    { id: 'menus', label: 'Menu 预留战报与候选规范', icon: <FolderTree className="h-4 w-4" />, category: 'Navigation & Motion' },
    { id: 'navigation', label: 'Navigation 导航与弹窗系统', icon: <Compass className="h-4 w-4" />, category: 'Navigation & Motion' },
    { id: 'live-preview', label: 'Live Preview 实时预览', icon: <Eye className="h-4 w-4 text-amber-500" />, category: 'Navigation & Motion' },
    { id: 'floating-windows', label: 'Floating Window 悬浮窗口', icon: <AppWindow className="h-4 w-4 text-amber-500" />, category: 'Navigation & Motion' },
    { id: 'animation', label: 'Animation & Motion 动效规范', icon: <Activity className="h-4 w-4" />, category: 'Navigation & Motion' },
    { id: 'recipes', label: 'Agent 复制参考菜谱', icon: <FileCode2 className="h-4 w-4" />, category: 'Agent Recipes' },
  ];

  const categories = Array.from(new Set(navItems.map((item) => item.category)));

  const accentOptions: { key: AccentColor; label: string; dotClass: string }[] = [
    { key: 'amber', label: '暖橙 (推荐)', dotClass: 'bg-amber-500' },
    { key: 'neutral', label: '中性黑白', dotClass: 'bg-neutral-900 dark:bg-neutral-100' },
    { key: 'sky', label: '经典蓝', dotClass: 'bg-sky-500' },
  ];

  return (
    <aside
      className={`w-64 shrink-0 flex flex-col justify-between border-r select-none transition-colors duration-150 ${
        isLight
          ? 'bg-[#fbfbfd] border-neutral-200/80 text-neutral-800'
          : 'bg-neutral-950/80 border-neutral-800 text-neutral-200'
      }`}
    >
      <div className="flex flex-col p-4 overflow-y-auto">
        {/* Brand header */}
        <div
          className={`flex items-center gap-2.5 pb-4 mb-4 border-b transition-colors ${
            isLight ? 'border-neutral-200/80' : 'border-neutral-800/60'
          }`}
        >
          <div className={`h-8 w-8 rounded-lg ${tokens.badge} flex items-center justify-center font-bold text-base shadow-sm transition-colors`}>
            UI
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight">UIStorybook</span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Agent-Friendly v1.2
            </span>
          </div>
        </div>

        {/* Global Accent Theme Selector */}
        <div className="mb-4 pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <Palette className="h-3 w-3" />
            <span>视觉基调 (Accent Theme)</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-neutral-200/50 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-300/40 dark:border-neutral-800">
            {accentOptions.map((opt) => {
              const isSelected = accent === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAccent(opt.key)}
                  className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-white text-neutral-900 font-bold shadow-xs'
                        : 'bg-neutral-800 text-white font-bold shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                  title={opt.label}
                >
                  <span className={`h-2 w-2 rounded-full ${opt.dotClass} shrink-0`} />
                  <span className="truncate">{opt.key === 'amber' ? '暖橙' : opt.key === 'neutral' ? '中性' : '经典'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex flex-col gap-4">
          {categories.map((cat) => (
            <div key={cat} className="flex flex-col gap-1">
              <span className={`px-2 text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                isLight ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                {cat}
              </span>
              {navItems
                .filter((item) => item.category === cat)
                .map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer outline-none ${
                        isActive
                          ? isLight
                            ? tokens.activeItemLight
                            : tokens.activeItemDark
                          : isLight
                          ? 'text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900'
                          : 'text-neutral-400 hover:bg-neutral-900/80 hover:text-neutral-200'
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Theme Switcher Bottom Bar */}
      <div
        className={`p-4 border-t flex items-center justify-between transition-colors ${
          isLight ? 'border-neutral-200/80 bg-neutral-100/40' : 'border-neutral-800/60'
        }`}
      >
        <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Dark / Light
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800 shadow-2xs'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
          }`}
        >
          {isLight ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-neutral-300" />}
          <span>{isLight ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </aside>
  );
};
