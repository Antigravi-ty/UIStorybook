import React from 'react';
import { Play, Gamepad2, Wrench, Settings, ArrowUpRight, PauseCircle, PlayCircle } from 'lucide-react';
import { PanelContainer, PanelContent } from '../layout/Panel';
import { MenuContainer, MenuItem, MenuDivider } from '../navigation';
import { Badge } from '../primitives/Badge';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { UI_RADIUS } from '../tokens';

export interface Layer1MainMenuRecipeProps {
  isLight?: boolean;
  onResume?: () => void;
  onNavigatePlay?: () => void;
  onNavigateGarage?: () => void;
  onNavigateSettings?: (targetTab?: string) => void;
  /** Background render pause indicator status */
  backgroundRenderPaused?: boolean;
  className?: string;
}

/**
 * [Recipe] Layer 1 Main Menu (Root / Width: 420px)
 * Designed for instant in-game ESC menu overlay.
 * Structure:
 * - Top: Centered big bold "MENU", clean and minimal.
 * - Center:
 *     1. Resume Match (Primary highlight)
 *     2. Play (Secondary)
 *     3. Garage (Secondary)
 *     4. Settings (Secondary)
 * - Bottom (Footer):
 *     - Left: Background render pause indicator badge
 *     - Right: "Click to change settings ↗" directly navigating into Settings Video tab.
 */
export const Layer1MainMenuRecipe: React.FC<Layer1MainMenuRecipeProps> = ({
  isLight = false,
  onResume,
  onNavigatePlay,
  onNavigateGarage,
  onNavigateSettings,
  backgroundRenderPaused = true,
  className = '',
}) => {
  return (
    <PanelContainer
      isLight={isLight}
      className={`w-full max-w-[420px] ${
        isLight
          ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
          : 'shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
      } ${className}`}
    >
      {/* 1. TOP HEADER: Large Centered "MENU" */}
      <div
        className={`px-6 py-5 border-b select-none text-center transition-colors ${
          isLight
            ? 'border-neutral-200/90 bg-neutral-50/70 text-neutral-900'
            : 'border-neutral-800/80 bg-neutral-900/60 text-white'
        }`}
      >
        <h1 className="text-xl font-black tracking-widest uppercase">
          MENU
        </h1>
      </div>

      {/* 2. CENTER CONTENT: Resume, Play, Garage, Settings */}
      <PanelContent scrollable={false} className="p-5">
        <MenuContainer ariaLabel="Main Game Menu">
          {/* Resume */}
          <MenuItem
            icon={<Play className="h-5 w-5" />}
            title="Resume Match"
            subtitle="Return to active arena gameplay"
            shortcut="ESC"
            variant="primary"
            autoFocus
            onClick={onResume}
            isLight={isLight}
          />

          <MenuDivider isLight={isLight} />

          {/* Play */}
          <MenuItem
            icon={<Gamepad2 className="h-5 w-5" />}
            title="Play"
            subtitle="Single player bot & multiplayer matches"
            hasArrow
            onClick={onNavigatePlay}
            isLight={isLight}
          />

          {/* Garage */}
          <MenuItem
            icon={<Wrench className="h-5 w-5" />}
            title="Garage"
            subtitle="Vehicle models, colours & player anthem"
            hasArrow
            onClick={onNavigateGarage}
            isLight={isLight}
          />

          {/* Settings */}
          <MenuItem
            icon={<Settings className="h-5 w-5" />}
            title="Settings"
            subtitle="Gameplay, controls, video & sound"
            hasArrow
            onClick={() => onNavigateSettings?.()}
            isLight={isLight}
          />
        </MenuContainer>
      </PanelContent>

      {/* 3. BOTTOM FOOTER: Render Pause Indicator + Settings Shortcut Link */}
      <div
        className={`px-5 py-3.5 border-t text-xs select-none flex items-center justify-between transition-colors ${
          isLight
            ? 'border-neutral-200/90 text-neutral-600 bg-neutral-50/90'
            : 'border-neutral-800/80 text-neutral-400 bg-neutral-900/90'
        }`}
      >
        {/* Left: Background render pause indicator */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              backgroundRenderPaused ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span className="font-mono text-[11px] truncate">
            {backgroundRenderPaused ? 'Background render paused' : 'Background rendering active'}
          </span>
        </div>

        {/* Right: Click to change settings navigation shortcut */}
        <button
          type="button"
          onClick={() => onNavigateSettings?.('video')}
          className={`flex items-center gap-1 font-mono text-[11px] shrink-0 font-medium transition-colors cursor-pointer outline-none ${
            isLight
              ? 'text-neutral-500 hover:text-amber-600'
              : 'text-neutral-400 hover:text-amber-400'
          }`}
          title="Jump directly to Settings -> Video"
        >
          <span>Click to change settings</span>
          <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
        </button>
      </div>
    </PanelContainer>
  );
};
