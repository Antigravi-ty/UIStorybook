import React from 'react';
import { Play, Gamepad2, Wrench, Settings, Layers, ArrowUpRight } from 'lucide-react';
import { PanelContainer, PanelContent } from '../layout/Panel';
import { MenuContainer, MenuDivider } from '../navigation/MenuContainer';
import { MenuItem } from '../navigation/MenuItem';
import { useMenuLayoutStore } from '../tokens';

export interface Layer1MainMenuRecipeProps {
  isLight?: boolean;
  onResume?: () => void;
  onNavigatePlay?: () => void;
  onNavigateGarage?: () => void;
  onNavigateSettings?: (targetTab?: string) => void;
  onNavigatePreviews?: () => void;
  /** Optional override for whether to show the Additional Previews button (defaults to L0 menuLayoutStore) */
  showAdditionalPreviews?: boolean;
  /** Background render pause indicator status */
  backgroundRenderPaused?: boolean;
  className?: string;
}

/**
 * [Recipe] Layer 1 Main Menu (Root / Width: 420px, Height: 520px)
 * Designed for instant in-game ESC menu overlay.
 * Connected to L0 `useMenuLayoutStore` so spacing & container parameters tuned in L6 immediately apply in L7.
 */
export const Layer1MainMenuRecipe: React.FC<Layer1MainMenuRecipeProps> = ({
  isLight = false,
  onResume,
  onNavigatePlay,
  onNavigateGarage,
  onNavigateSettings,
  onNavigatePreviews,
  showAdditionalPreviews: propShowPreviews,
  backgroundRenderPaused = true,
  className = '',
}) => {
  const {
    panels,
    panelContentPaddingY,
    showAdditionalPreviews: storeShowPreviews,
  } = useMenuLayoutStore();

  const sizing = panels['layer1-main'];
  const shouldShowPreviews = propShowPreviews ?? storeShowPreviews;

  return (
    <PanelContainer
      isLight={isLight}
      sizing={sizing}
      className={`w-full ${
        isLight
          ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_24px_rgba(0,0,0,0.16),0_0_48px_rgba(0,0,0,0.10)]'
          : 'shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_25px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.08)]'
      } ${className}`}
    >
      {/* 1. TOP HEADER: Large Centered "MENU" */}
      <div
        data-ui-element="panel-header"
        data-panel-section="header"
        className={`px-6 pt-5 pb-4 border-b select-none text-center shrink-0 transition-colors ${
          isLight
            ? 'border-neutral-200/90 bg-neutral-50/70 text-neutral-900'
            : 'border-neutral-800/80 bg-neutral-900/60 text-white'
        }`}
      >
        <h1 className="text-xl font-black tracking-widest uppercase">
          MENU
        </h1>
      </div>

      {/* 2. CENTER CONTENT: Resume, Play, Garage, Settings, Additional Previews */}
      <PanelContent
        scrollable={true}
        style={{
          paddingTop: `${panelContentPaddingY}px`,
          paddingBottom: `${panelContentPaddingY}px`,
        }}
        className="px-6"
      >
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

          {/* Additional Previews */}
          {shouldShowPreviews && (
            <MenuItem
              icon={<Layers className="h-5 w-5" />}
              title="Additional Previews"
              subtitle="Live Preview & floating window sandbox"
              hasArrow
              onClick={onNavigatePreviews}
              isLight={isLight}
            />
          )}
        </MenuContainer>
      </PanelContent>

      {/* 3. BOTTOM FOOTER: Render Pause Indicator + Settings Shortcut Link (shrink-0 z-10 prevents overlap) */}
      <div
        data-ui-element="panel-footer"
        data-panel-section="footer"
        className={`px-6 py-4 border-t text-xs select-none shrink-0 mt-auto relative z-10 flex items-center justify-between transition-colors ${
          isLight
            ? 'border-neutral-200/90 text-neutral-600 bg-neutral-50/95'
            : 'border-neutral-800/80 text-neutral-400 bg-neutral-900/95'
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
