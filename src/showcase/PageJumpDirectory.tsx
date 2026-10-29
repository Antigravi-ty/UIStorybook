import React, { useState, useMemo } from 'react';
import {
  Compass,
  ArrowDownRight,
  Check,
  Copy,
  Code2,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { crossClientSync } from './stores';

export interface JumpDirectoryCategory {
  id: string;
  label: string;
  badge?: string;
}

export interface JumpDirectoryItem {
  /** Short reference code for quick communication, e.g. `5A.1`, `T5A.3`, `5B.5`, `6A.6` */
  code: string;
  /** Canonical exported component or module name, e.g. `StepperScoreboardHUD` */
  componentName?: string;
  /** Alias for componentName */
  name?: string;
  /** Human-readable section title */
  label: string;
  /** DOM element ID to scroll to when clicked */
  targetId?: string;
  /** Alias for targetId */
  id?: string;
  /** Optional layer or architecture tag, e.g. `120Hz Ref`, `L5A`, `L3` */
  tag?: string;
  /** Alias for tag */
  badge?: string;
  /** Optional grouping category ID for directory filtering */
  category?: string;
}

export interface PageJumpDirectoryProps {
  layerTag?: string;
  title?: string;
  subtitle?: string;
  items: JumpDirectoryItem[];
  onSelect?: (item: JumpDirectoryItem) => void;
  /** Optional currently active item ID or code (used for on-demand single-module rendering mode) */
  activeId?: string;
  /** When true, clicking an item triggers `onSelect(item)` without forcing default hash scroll */
  preventDefaultJump?: boolean;
  /** Optional category filter tabs */
  categories?: JumpDirectoryCategory[];
  /** Optional initial category ID */
  defaultCategory?: string;
  /** When true, displays a quick search/filter input for large directories */
  searchable?: boolean;
  /** When true, allows collapsing the card grid into a compact bar */
  collapsible?: boolean;
  /** Initial collapsed state when collapsible is true */
  defaultCollapsed?: boolean;
  /** Optional extra control node rendered in the header toolbar */
  headerExtra?: React.ReactNode;
  isLight?: boolean;
  className?: string;
}

/**
 * PageJumpDirectory
 * Decoupled top-of-page quick jump table of contents & on-demand module selector
 * for fast component lookup and unambiguous reference codes (`[Code] ComponentName · Label`).
 */
export const PageJumpDirectory: React.FC<PageJumpDirectoryProps> = React.memo(({
  title = '本页组件快速跳转目录 (Quick Jump & Reference Index)',
  subtitle = '点击卡片即可平滑滚动至对应组件区块 · 点击右侧复制按钮可复制标准组件引用名，方便沟通定位',
  items,
  onSelect,
  activeId,
  preventDefaultJump = false,
  categories,
  defaultCategory = 'all',
  searchable = false,
  collapsible = false,
  defaultCollapsed = false,
  headerExtra,
  isLight = true,
  className = '',
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedPageParams, setCopiedPageParams] = useState<boolean>(false);
  const [exportedPreviewJson, setExportedPreviewJson] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);

  const handleExportPageParams = () => {
    const exported = crossClientSync.exportParameters();
    const json = JSON.stringify(exported, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).catch(() => {});
    }
    setCopiedPageParams(true);
    window.setTimeout(() => setCopiedPageParams(false), 1800);
    if (exportedPreviewJson !== null) {
      setExportedPreviewJson(json);
    }
  };

  const handleTogglePreviewParams = () => {
    if (exportedPreviewJson !== null) {
      setExportedPreviewJson(null);
    } else {
      const exported = crossClientSync.exportParameters();
      setExportedPreviewJson(JSON.stringify(exported, null, 2));
    }
  };

  const handleJump = (item: JumpDirectoryItem) => {
    onSelect?.(item);
    if (preventDefaultJump) return;
    const domId = item.targetId || item.id;
    if (domId) {
      if (typeof window !== 'undefined' && window.history?.pushState) {
        try {
          const url = new URL(window.location.href);
          url.hash = `#${domId}`;
          const nextHref = `${url.pathname}${url.search}${url.hash}`;
          const currHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
          if (nextHref !== currHref) {
            window.history.pushState(window.history.state, '', nextHref);
          }
        } catch {
          // ignore
        }
      }
      const el = document.getElementById(domId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleCopyRef = (e: React.MouseEvent, item: JumpDirectoryItem) => {
    e.stopPropagation();
    const compName = item.componentName || item.name || item.label;
    const refText = `[${item.code}] ${compName}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(refText).catch(() => {});
    }
    setCopiedCode(item.code);
    window.setTimeout(() => {
      setCopiedCode((prev) => (prev === item.code ? null : prev));
    }, 1500);
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (categories && selectedCategory !== 'all' && item.category && item.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      const compName = (item.componentName || item.name || '').toLowerCase();
      const code = item.code.toLowerCase();
      const label = item.label.toLowerCase();
      const tag = (item.tag || item.badge || '').toLowerCase();
      return (
        code.includes(q) ||
        compName.includes(q) ||
        label.includes(q) ||
        tag.includes(q)
      );
    });
  }, [items, categories, selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    if (!categories) return {};
    const counts: Record<string, number> = { all: items.length };
    for (const cat of categories) {
      if (cat.id !== 'all') counts[cat.id] = 0;
    }
    for (const item of items) {
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    }
    return counts;
  }, [items, categories]);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return items.find(
      (it) => (it.targetId || it.id) === activeId || it.code === activeId
    ) ?? null;
  }, [items, activeId]);

  return (
    <nav
      aria-label={title}
      data-ui-element="page-jump-directory"
      className={`p-4 rounded-2xl border select-none transition-colors ${
        isLight
          ? 'bg-neutral-50/90 border-neutral-200/90 text-neutral-800 shadow-2xs'
          : 'bg-neutral-900/70 border-neutral-800 text-neutral-200 shadow-md'
      } ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-6 w-6 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <Compass className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight">{title}</span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-600'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            {filteredItems.length === items.length
              ? `共 ${items.length} 个独立模块`
              : `已筛选 ${filteredItems.length} / ${items.length} 个模块`}
          </span>
          {activeItem && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Sparkles className="h-3 w-3" />
              <span>当前挂载: [{activeItem.code}] {activeItem.componentName || activeItem.name}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] hidden xl:inline ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            {subtitle}
          </span>
          {headerExtra}
          <button
            type="button"
            onClick={handleTogglePreviewParams}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
              exportedPreviewJson !== null
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 font-bold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
            title="展开/收起本页当前所有可调参数的实时 JSON 快照"
          >
            <Code2 className="h-3 w-3" />
            <span>{exportedPreviewJson !== null ? '收起参数 JSON' : '查看本页参数'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportPageParams}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
              copiedPageParams
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400'
            }`}
            title="一键复制本页当前所有可调参数与状态，方便固化为默认值"
          >
            {copiedPageParams ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copiedPageParams ? '已复制本页参数!' : '导出本页参数 (Copy Params)'}</span>
          </button>
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
              }`}
              title={isCollapsed ? '展开全部菜单目录网格' : '收起目录网格，仅保留当前正在调优的面板'}
            >
              {isCollapsed ? (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>展开目录 ({items.length})</span>
                </>
              ) : (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>精简收起目录</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {exportedPreviewJson !== null && (
        <div
          className={`mt-3 p-3 rounded-xl border font-mono text-[11px] overflow-x-auto max-h-64 overflow-y-auto select-text ${
            isLight
              ? 'bg-neutral-900 text-emerald-300 border-neutral-800'
              : 'bg-black/80 text-emerald-300 border-neutral-800'
          }`}
        >
          <pre className="whitespace-pre-wrap break-all">{exportedPreviewJson}</pre>
        </div>
      )}

      {!isCollapsed && (
        <>
          {(categories || searchable) && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3">
              {categories && categories.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const count = categoryCounts[cat.id] ?? 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-2xs'
                            : isLight
                            ? 'bg-white hover:bg-neutral-100 border-neutral-200/90 text-neutral-600'
                            : 'bg-neutral-950/80 hover:bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded ${
                            isSelected
                              ? 'bg-neutral-950/15 text-neutral-950 font-extrabold'
                              : isLight
                              ? 'bg-neutral-100 text-neutral-500'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {searchable && (
                <div className="relative flex items-center min-w-[220px] sm:min-w-[260px]">
                  <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索代号 (如 6A.12) / 组件名 / 中文名..."
                    className={`w-full pl-8 pr-7 py-1 rounded-lg text-xs font-mono border outline-none transition-colors ${
                      isLight
                        ? 'bg-white border-neutral-200 focus:border-amber-400 text-neutral-800 placeholder:text-neutral-400'
                        : 'bg-neutral-950 border-neutral-800 focus:border-amber-500/60 text-neutral-200 placeholder:text-neutral-500'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                      title="清空搜索"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-3">
            {filteredItems.map((item) => {
              const isCopied = copiedCode === item.code;
              const compName = item.componentName || item.name || item.label;
              const tagText = item.tag || item.badge;
              const domId = item.targetId || item.id;
              const isActive =
                Boolean(activeId) && (domId === activeId || item.code === activeId);

              return (
                <div
                  key={item.code}
                  onClick={() => handleJump(item)}
                  role="button"
                  tabIndex={0}
                  aria-current={isActive ? 'true' : undefined}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleJump(item);
                    }
                  }}
                  className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-amber-50/95 border-amber-500 ring-1 ring-amber-400/70 text-neutral-900 shadow-xs'
                        : 'bg-amber-500/15 border-amber-500/80 ring-1 ring-amber-500/40 text-neutral-100 shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-amber-50/60 border-neutral-200/90 hover:border-amber-400/80 text-neutral-800 shadow-2xs'
                      : 'bg-neutral-950/75 hover:bg-neutral-900 border-neutral-800/90 hover:border-amber-500/60 text-neutral-200'
                  }`}
                >
                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-extrabold border shrink-0 ${
                          isActive
                            ? 'bg-amber-500 text-neutral-950 border-amber-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {item.code}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold truncate transition-colors ${
                          isActive
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'group-hover:text-amber-500'
                        }`}
                      >
                        {compName}
                      </span>
                      {tagText && (
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded shrink-0 ${
                            isLight
                              ? 'bg-neutral-100 text-neutral-500'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {tagText}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] truncate ${
                        isActive
                          ? isLight
                            ? 'text-amber-900/80 font-medium'
                            : 'text-amber-200/90 font-medium'
                          : isLight
                          ? 'text-neutral-500'
                          : 'text-neutral-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopyRef(e, item)}
                      title={`复制引用编号: [${item.code}] ${compName}`}
                      className={`p-1 rounded-md border transition-colors cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500'
                          : isLight
                          ? 'bg-neutral-50 hover:bg-neutral-200/70 border-neutral-200 text-neutral-400 hover:text-neutral-700'
                          : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-500 hover:text-neutral-200'
                      }`}
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <ArrowDownRight
                      className={`h-3.5 w-3.5 transition-all ${
                        isActive
                          ? 'opacity-100 text-amber-500'
                          : 'opacity-40 group-hover:opacity-100 group-hover:text-amber-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </nav>
  );
});

PageJumpDirectory.displayName = 'PageJumpDirectory';

