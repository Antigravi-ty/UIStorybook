import React from 'react';
import { User, Bot, Users, Shuffle, Target, Sparkles, BookOpen } from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { GridStack } from '../layout/GridStack';
import { Badge } from '../primitives/Badge';
import { UI_RADIUS } from '../tokens';

export interface Layer2PlayRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  onSelectMode?: (modeId: string) => void;
}

export interface PlayModeDef {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: 'Match' | 'Training';
  badge: string;
}

const PLAY_MODES: PlayModeDef[] = [
  // Row 1: Competitive / Casual Matches
  {
    id: 'single-bot',
    title: 'Single Player with Bot',
    subtitle: '1v1 / 2v2 scrimmage with local WASM bots',
    icon: <Bot className="h-6 w-6 text-amber-500" />,
    category: 'Match',
    badge: 'Offline Practice',
  },
  {
    id: 'multiplayer-match',
    title: 'Multiplayer Match',
    subtitle: 'Standard quick match matchmaking',
    icon: <Users className="h-6 w-6 text-emerald-500" />,
    category: 'Match',
    badge: 'Ranked & Casual',
  },
  {
    id: 'multiplayer-custom',
    title: 'Multiplayer Custom Match',
    subtitle: 'Private lobby with custom mutators & rules',
    icon: <Shuffle className="h-6 w-6 text-sky-500" />,
    category: 'Match',
    badge: 'Custom Lobby',
  },
  // Row 2: Training Disciplines
  {
    id: 'freeplay-training',
    title: 'Free Play Training',
    subtitle: 'Unlimited boost physics sandbox & ball control',
    icon: <Sparkles className="h-6 w-6 text-amber-500" />,
    category: 'Training',
    badge: 'Unlimited Boost',
  },
  {
    id: 'training-packs',
    title: 'Training Packs',
    subtitle: 'Aerial, saves and redirect skill drills',
    icon: <Target className="h-6 w-6 text-indigo-500" />,
    category: 'Training',
    badge: 'Drills & Packs',
  },
  {
    id: 'multiplayer-training',
    title: 'Multiplayer Training',
    subtitle: 'Shared warmup arena with party members',
    icon: <BookOpen className="h-6 w-6 text-purple-500" />,
    category: 'Training',
    badge: 'Party Warmup',
  },
];

/**
 * [Recipe] Layer 2 Play / Mode Selection Menu
 * 2x3 Grid with Lucide Icons and clean placeholders (Width: 680px).
 * Row 1: Single Player with Bot | Multiplayer Match | Multiplayer Custom Match
 * Row 2: Free Play Training | Training Packs | Multiplayer Training
 */
export const Layer2PlayRecipe: React.FC<Layer2PlayRecipeProps> = ({
  isLight = false,
  onBack,
  onSelectMode,
}) => {
  return (
    <PanelContainer isLight={isLight} className="w-full max-w-[680px]">
      <PanelHeader
        title="PLAY"
        subtitle="Select game mode, custom match or training discipline"
        badge={
          <Badge variant="primary" size="sm" isLight={isLight}>
            6 Modes
          </Badge>
        }
        onBack={onBack}
        isLight={isLight}
      />

      <PanelContent scrollable className="p-6">
        <GridStack cols={3} gap="md">
          {PLAY_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode?.(mode.id)}
              className={`group flex flex-col items-start p-4 text-left transition-all duration-150 border cursor-pointer ${UI_RADIUS.lg} ${
                isLight
                  ? 'bg-neutral-50/80 hover:bg-white hover:border-amber-400 hover:shadow-xs border-neutral-200/90 text-neutral-900'
                  : 'bg-neutral-850/80 hover:bg-neutral-800 hover:border-amber-500/70 hover:shadow-md border-neutral-700/80 text-neutral-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isLight
                      ? 'bg-white border-neutral-200 group-hover:border-amber-300'
                      : 'bg-neutral-900 border-neutral-700/80 group-hover:border-amber-500/50'
                  }`}
                >
                  {mode.icon}
                </div>
                <Badge
                  variant={mode.category === 'Match' ? 'primary' : 'warning'}
                  size="sm"
                  isLight={isLight}
                >
                  {mode.badge}
                </Badge>
              </div>

              <span className="font-bold text-sm tracking-tight mb-1 group-hover:text-amber-500 transition-colors">
                {mode.title}
              </span>
              <span
                className={`text-xs line-clamp-2 leading-relaxed ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                {mode.subtitle}
              </span>
            </button>
          ))}
        </GridStack>
      </PanelContent>

      <PanelFooter hint="ESC to Back" isLight={isLight}>
        <span className="text-[11px] font-mono opacity-80">Ready for Arena Matchmaking</span>
      </PanelFooter>
    </PanelContainer>
  );
};
