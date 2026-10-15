import React from 'react';
import { Eye, ArrowRight, Target, Layers } from 'lucide-react';
import { Badge } from '../../primitives/Badge';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { VStack } from '../../layout/VStack';
import { Card } from '../../layout/Card';

export interface LivePreviewTabProps {
  onNavigateLivePreview?: () => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const LivePreviewTab: React.FC<LivePreviewTabProps> = ({
  onNavigateLivePreview,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      {/* Informational Banner */}
      <div
        onMouseEnter={() => onHover('Live Preview allows configuring parameters while viewing live 3D arena background.')}
        onMouseLeave={onLeave}
        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
          isLight
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            三级深度参数调节模式。进入三级菜单后，按键盘 <strong className="font-mono">TAB</strong> 键可在居中配置面板与右侧 Dock 药丸之间平滑变形。
          </span>
        </div>
        <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
      </div>

      {/* Entrance Card: Ball Trajectory Predictor */}
      <div
        onMouseEnter={() => onHover('Enter Layer 3 Ball Trajectory Predictor configuration with interactive Live Preview.')}
        onMouseLeave={onLeave}
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
          isLight
            ? 'bg-neutral-50/90 hover:bg-neutral-100/90 border-neutral-200 shadow-2xs'
            : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/80'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
            <Target className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-sm ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
                Ball Trajectory Predictor
              </span>
              <Badge variant="warning" size="sm" isLight={isLight}>
                Layer 3
              </Badge>
              <Badge variant="amber" size="sm" isLight={isLight}>
                Live Preview Ready
              </Badge>
            </div>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              预测飞行轨迹时长、弹跳落点光环与马格努斯自旋偏转力。支持 TAB 键一键折叠至侧边药丸，恢复 100% 对局视野。
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateLivePreview}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <span>进入三级实时预览</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Architecture Highlights */}
      <Card isLight={isLight} variant="outlined" className="p-4 flex flex-col gap-2.5">
        <span className={`text-xs font-bold tracking-tight ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
          交互与动效架构规范 (Dual-Motion Paradigm)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className={`p-3 rounded-xl border ${
            isLight ? 'bg-white border-neutral-200/80' : 'bg-neutral-900/60 border-neutral-800'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Layers className="h-3.5 w-3.5 text-amber-500" />
              <span>水平层级流转</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Layer 2 (680px) ⇄ Layer 3 (480px) 采用居中流体连续形变 (0.28s) 或三段分步淡入淡出，严格保持视口中心锚定。
            </p>
          </div>

          <div className={`p-3 rounded-xl border ${
            isLight ? 'bg-white border-neutral-200/80' : 'bg-neutral-900/60 border-neutral-800'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Eye className="h-3.5 w-3.5 text-amber-500" />
              <span>侧边空间折叠</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              TAB 快捷键将 480×540px 面板收折为 88×38px 侧边 Dock 药丸。背景遮罩降为 0%，无矩阵缩放形变抽动。
            </p>
          </div>
        </div>
      </Card>
    </VStack>
  );
};
