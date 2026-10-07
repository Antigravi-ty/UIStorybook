import React, { useState } from 'react';
import { 
  FolderTree, 
  Play, 
  Trophy, 
  Sparkles, 
  ExternalLink,
  Layers,
  ArrowRight,
  Maximize2,
  BookmarkCheck
} from 'lucide-react';
import { MorphingShell } from '../../navigation/MorphingShell';
import { ContainerTransitionMode } from '../../tokens/easing';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { CodeBlock } from '../CodeBlock';
import { 
  Layer1MatchPostRecipe, 
  Layer2MatchStatsRecipe
} from '../../recipes';

export type ReservedMenuRouteId = 'match-post' | 'match-stats';

interface ReservedMenuCardDef {
  id: ReservedMenuRouteId;
  title: string;
  level: 'Layer 1 (Root Reserved)' | 'Layer 2 (Telemetry Reserved)';
  layerNum: 1 | 2;
  width: number;
  description: string;
  tags: string[];
  renderComponent: (isLight: boolean, onNavigate: (r: ReservedMenuRouteId) => void, onBack?: () => void) => React.ReactNode;
}

export interface MenusPageProps {
  isLight?: boolean;
  onNavigateToLayers?: () => void;
}

export const MenusPage: React.FC<MenusPageProps> = ({ 
  isLight = true,
  onNavigateToLayers
}) => {
  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<ReservedMenuRouteId>('match-post');
  const [routeHistory, setRouteHistory] = useState<ReservedMenuRouteId[]>(['match-post']);

  const routeWidthMap: Record<ReservedMenuRouteId, number> = {
    'match-post': 420,
    'match-stats': 580,
  };

  const navigateTo = (route: ReservedMenuRouteId) => {
    setRouteHistory((prev) => [...prev, route]);
    setCurrentRoute(route);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentRoute('match-post');
    setRouteHistory(['match-post']);
  };

  const goBack = () => {
    if (routeHistory.length > 1) {
      const next = routeHistory.slice(0, -1);
      setRouteHistory(next);
      setCurrentRoute(next[next.length - 1]);
    } else {
      closeModal();
    }
  };

  const openModalAt = (route: ReservedMenuRouteId) => {
    setCurrentRoute(route);
    setRouteHistory([route]);
    setModalOpen(true);
  };

  const menuDefinitions: ReservedMenuCardDef[] = [
    {
      id: 'match-post',
      title: 'Layer 1: Match Post / 赛后结算战报根菜单 (预留)',
      level: 'Layer 1 (Root Reserved)',
      layerNum: 1,
      width: 420,
      description: '比赛结束或中场暂停全局根菜单。展示比赛胜负状态徽章、再来一局、赛后统计入口、车库改装与系统设置导航。暂未纳入主循环，作为候选架构完整保留。',
      tags: ['Layer 1', 'Reserved Root', 'Match Post', 'Width: 420px'],
      renderComponent: (light, onNav) => (
        <Layer1MatchPostRecipe
          isLight={light}
          onRematch={() => alert('触发 Next Match 快速匹配')}
          onNavigateStats={() => onNav('match-stats')}
          onNavigateGarage={() => alert('活跃车库请查看【Menu Layer 实时预览】')}
          onNavigateSettings={() => alert('活跃设置请查看【Menu Layer 实时预览】')}
          onNavigateKeybindings={() => alert('活跃按键请查看【Menu Layer 实时预览】')}
          onExitLobby={() => alert('返回大厅')}
        />
      ),
    },
    {
      id: 'match-stats',
      title: 'Layer 2: Match Stats / 赛后数据与战术遥测 (预留)',
      level: 'Layer 2 (Telemetry Reserved)',
      layerNum: 2,
      width: 580,
      description: '二级专项数据页面。展示蓝橙双方比分看板、进球/助攻/扑救/命中率等遥测指标网格与段位升级经验条。',
      tags: ['Layer 2', 'Reserved Sub-Menu', 'Telemetry', 'Width: 580px'],
      renderComponent: (light, _onNav, onBack) => (
        <Layer2MatchStatsRecipe
          isLight={light}
          onBack={onBack}
          onRematch={() => alert('Next Match')}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">Menu 预留战报与候选规范</h1>
        </div>
        <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          本页面专门保留此前设计的<strong>暂未使用之菜单模板</strong>（如对局结束结算战报 <code>Match Post</code> 与赛后遥测指标看板 <code>Match Stats</code>）。
          所有活跃使用的一级暂停、二级车库/设置/键位、以及三级音频均衡器，均已全部迁移至全新的 <strong>【Menu Layer 实时预览】</strong> 引擎。
        </p>
      </div>

      {/* Migration Notice Banner */}
      {onNavigateToLayers && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
            isLight ? 'bg-amber-50/80 border-amber-200/90 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs">活跃层级已迁移至全新【Menu Layer 实时预览】页面</span>
              <span className={`text-[11px] ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                支持顶部无干扰层级直选、单个 Container 替换、三级音频均衡器切换与 Apple Ease 动效。
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={onNavigateToLayers}
            isLight={isLight}
            icon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            前往 Menu Layer 实时预览
          </Button>
        </div>
      )}

      {/* Global Interactive Playground & Control Bar */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm block">预留战报弹窗 Morphing 动效演练场</span>
            <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              测试 Match Post (420px) 到 Match Stats (580px) 之间的平滑形变
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => openModalAt('match-post')}
              isLight={isLight}
              icon={<Play className="h-4 w-4" />}
            >
              打开战报弹窗演练
            </Button>
          </div>
        </div>

        {/* Transition Mode Switcher */}
        <div
          className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-semibold shrink-0 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              切换动效模式:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTransitionMode('fluid-morph')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  transitionMode === 'fluid-morph'
                    ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
                title="Apple Ease 0.28s 连续流体形变"
              >
                FluidMorph (连续流体)
              </button>
              <button
                type="button"
                onClick={() => setTransitionMode('sequenced-step')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  transitionMode === 'sequenced-step'
                    ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
                title="100ms 淡出 -> 150ms 容器形变 -> 100ms 淡入显现"
              >
                SequencedStep (三段分步)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Cards Display Grid */}
      <div className="flex flex-col gap-8">
        {menuDefinitions.map((card) => (
          <div
            key={card.id}
            className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
              isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
            }`}
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base tracking-tight">{card.title}</span>
                  <Badge
                    size="sm"
                    variant={card.layerNum === 1 ? 'primary' : 'warning'}
                    isLight={isLight}
                  >
                    {card.level}
                  </Badge>
                </div>
                <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {card.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openModalAt(card.id)}
                  isLight={isLight}
                  icon={<Maximize2 className="h-3.5 w-3.5" />}
                >
                  在弹窗中测试
                </Button>
              </div>
            </div>

            {/* Embedded Live Preview Container */}
            <div
              className={`p-6 rounded-xl border flex items-center justify-center overflow-x-auto transition-colors ${
                isLight ? 'bg-neutral-100/60 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
              }`}
            >
              <div style={{ width: `${card.width}px` }} className="max-w-full">
                {card.renderComponent(isLight, openModalAt, () => alert('返回上一级菜单'))}
              </div>
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {card.tags.map((t) => (
                <Badge key={t} size="sm" variant="default" isLight={isLight}>
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Developer Integration Code Recipe */}
      <CodeBlock
        isLight={isLight}
        title="预留战报组件调用规范 (Reserved Match Recipe Invocation)"
        code={`// 独立调用预留赛后结算与遥测面板：
import { Layer1MatchPostRecipe, Layer2MatchStatsRecipe } from '@/recipes';

<Layer1MatchPostRecipe
  isLight={isLight}
  onRematch={() => startNextMatch()}
  onNavigateStats={() => navigateToStats()}
  onExitLobby={() => returnToLobby()}
/>

<Layer2MatchStatsRecipe
  isLight={isLight}
  onBack={() => navigateBack()}
  onRematch={() => startNextMatch()}
/>`}
      />

      {/* Interactive Morphing Shell Modal for Reserved Items */}
      <MorphingShell
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          } else {
            setModalOpen(true);
          }
        }}
        width={routeWidthMap[currentRoute]}
        currentKey={currentRoute}
        isLight={isLight}
        isLayer1={currentRoute === 'match-post'}
        onBack={goBack}
        transitionMode={transitionMode}
        enableDiagnostics={true}
      >
        {currentRoute === 'match-post' && (
          <Layer1MatchPostRecipe
            isLight={isLight}
            onRematch={() => setModalOpen(false)}
            onNavigateStats={() => navigateTo('match-stats')}
            onExitLobby={() => setModalOpen(false)}
          />
        )}

        {currentRoute === 'match-stats' && (
          <Layer2MatchStatsRecipe
            isLight={isLight}
            onBack={goBack}
            onRematch={() => setModalOpen(false)}
          />
        )}
      </MorphingShell>
    </div>
  );
};
