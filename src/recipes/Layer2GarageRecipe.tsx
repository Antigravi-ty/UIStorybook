import React, { useState } from 'react';
import { 
  Car, 
  Palette, 
  Music, 
  User, 
  Check, 
  Shuffle, 
  Volume2
} from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { UnderlineTabs, TabItem } from '../primitives/UnderlineTabs';
import { Badge } from '../primitives/Badge';
import { UnderConstructionPlaceholder } from '../primitives/UnderConstructionPlaceholder';

export interface Layer2GarageRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  initialTab?: string;
}

// 1. Car Tab: 8 vehicles with name & hitbox badge (clean 4x2 grid, fits without scrolling)
export interface CarDef {
  id: string;
  name: string;
  hitbox: 'Octane' | 'Dominus' | 'Breakout' | 'Plank' | 'Hybrid' | 'Merc';
}

const CARS: CarDef[] = [
  { id: 'octane', name: 'Octane', hitbox: 'Octane' },
  { id: 'fennec', name: 'Fennec', hitbox: 'Octane' },
  { id: 'dominus', name: 'Dominus', hitbox: 'Dominus' },
  { id: 'breakout', name: 'Breakout', hitbox: 'Breakout' },
  { id: 'batmobile', name: 'Plank GT', hitbox: 'Plank' },
  { id: 'skyline', name: 'Skyline RS', hitbox: 'Hybrid' },
  { id: 'dingo', name: 'Dingo', hitbox: 'Octane' },
  { id: 'merc', name: 'Merc Titan', hitbox: 'Merc' },
];

// 2. Colour Tab: Blue and Orange team colour fallback preference order (6 presets each)
export interface TeamColourDef {
  id: string;
  name: string;
  hex: string;
  borderClass: string;
}

const BLUE_TEAM_COLOURS: TeamColourDef[] = [
  { id: 'cobalt', name: 'Cobalt Blue', hex: '#1d4ed8', borderClass: 'border-blue-600' },
  { id: 'sky', name: 'Sky Cyan', hex: '#0284c7', borderClass: 'border-sky-600' },
  { id: 'navy', name: 'Deep Navy', hex: '#1e1b4b', borderClass: 'border-indigo-900' },
  { id: 'teal', name: 'Teal Turquoise', hex: '#0f766e', borderClass: 'border-teal-700' },
  { id: 'purple', name: 'Royal Violet', hex: '#6b21a8', borderClass: 'border-purple-800' },
  { id: 'slate', name: 'Midnight Slate', hex: '#334155', borderClass: 'border-slate-700' },
];

const ORANGE_TEAM_COLOURS: TeamColourDef[] = [
  { id: 'flame', name: 'Flame Orange', hex: '#ea580c', borderClass: 'border-orange-600' },
  { id: 'crimson', name: 'Crimson Red', hex: '#dc2626', borderClass: 'border-red-600' },
  { id: 'amber', name: 'Sunburst Amber', hex: '#d97706', borderClass: 'border-amber-600' },
  { id: 'ruby', name: 'Ruby Wine', hex: '#9f1239', borderClass: 'border-rose-800' },
  { id: 'gold', name: 'Metallic Gold', hex: '#ca8a04', borderClass: 'border-yellow-600' },
  { id: 'coral', name: 'Sunset Coral', hex: '#f43f5e', borderClass: 'border-rose-500' },
];

// 3. Player Anthem Tab: Music presets + Random option
export interface AnthemDef {
  id: string;
  title: string;
  artist: string;
  duration: string;
  tag: string;
}

const ANTHEMS: AnthemDef[] = [
  { id: 'random', title: 'Shuffle / Random Anthem', artist: 'All Soundtracks', duration: 'VARIES', tag: 'Random' },
  { id: 'solar-wind', title: 'Solar Eruption (VIP)', artist: 'Tokyo Machine', duration: '0:15', tag: 'High BPM' },
  { id: 'champion-rush', title: 'Champion Arena Rush', artist: 'Koven', duration: '0:14', tag: 'Orchestral' },
  { id: 'neon-overdrive', title: 'Neon Overdrive', artist: 'Pegboard Nerds', duration: '0:16', tag: 'Synthwave' },
  { id: 'sub-bass-fury', title: 'Sub-Bass Drop', artist: 'Noisestorm', duration: '0:12', tag: 'Bass Heavy' },
  { id: 'cyber-victory', title: 'Victory Circuit', artist: 'Protostar', duration: '0:15', tag: 'Electronic' },
];

/**
 * [Recipe] Layer 2 Garage Loadout Menu (Width: 680px)
 * UnderlineTabs with 4 tabs:
 * 1. Car: 8 cards with name & hitbox badge (4x2 grid, no scroll)
 * 2. Colour: Blue & Orange team fallback preference order (6 presets)
 * 3. Player Anthem: Anthem selection including random
 * 4. Player Name / Profile Sync: Server-bound customization sync & login indicator
 */
export const Layer2GarageRecipe: React.FC<Layer2GarageRecipeProps> = ({
  isLight = false,
  onBack,
  initialTab = 'car',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Car State
  const [selectedCar, setSelectedCar] = useState('octane');

  // Colour State: Fallback preference order
  const [blueOrder, setBlueOrder] = useState<string[]>(['cobalt', 'sky', 'navy', 'teal', 'purple', 'slate']);
  const [orangeOrder, setOrangeOrder] = useState<string[]>(['flame', 'crimson', 'amber', 'ruby', 'gold', 'coral']);

  // Anthem State
  const [selectedAnthem, setSelectedAnthem] = useState('random');



  const tabs: TabItem[] = [
    { id: 'car', label: 'Car', icon: <Car className="h-4 w-4" /> },
    { id: 'colour', label: 'Colour', icon: <Palette className="h-4 w-4" /> },
    { id: 'anthem', label: 'Player Anthem', icon: <Music className="h-4 w-4" /> },
    { id: 'player-name', label: 'Player Name', icon: <User className="h-4 w-4" /> },
  ];

  return (
    <PanelContainer isLight={isLight} className="w-full max-w-[680px]">
      <PanelHeader
        title="GARAGE LOADOUT"
        subtitle="Customization loadout, team colour preference & player identity"
        badge={
          <Badge variant="primary" size="sm" isLight={isLight}>
            Customization
          </Badge>
        }
        onBack={onBack}
        isLight={isLight}
      />

      {/* Underline Tabs */}
      <div className="px-6 pt-2">
        <UnderlineTabs
          items={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          isLight={isLight}
        />
      </div>

      <PanelContent scrollable className="p-6 h-[400px] overflow-y-auto">
        {/* 1. CAR TAB: 8 Cards (4 columns x 2 rows), fits completely without scroll */}
        {activeTab === 'car' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                Active Chassis Preset: <strong className="text-amber-500 font-bold uppercase">{selectedCar}</strong>
              </span>
              <span className="text-[11px] font-mono opacity-70">
                8 Standard Models • Click to Equip
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {CARS.map((car) => {
                const isSelected = selectedCar === car.id;
                return (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => setSelectedCar(car.id)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer relative min-h-[76px] gap-1.5 ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/40 text-neutral-900 shadow-xs'
                          : 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/50 text-white shadow-md'
                        : isLight
                        ? 'bg-neutral-50 hover:bg-white border-neutral-200/90 text-neutral-800'
                        : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/80 text-neutral-200'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                    <span className="font-bold text-xs truncate max-w-full">
                      {car.name}
                    </span>
                    <Badge
                      variant={isSelected ? 'amber' : 'neutral'}
                      size="sm"
                      isLight={isLight}
                    >
                      {car.hitbox}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. COLOUR TAB: Fallback preference order for Blue & Orange teams */}
        {activeTab === 'colour' && (
          <div className="flex flex-col gap-4">
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              isLight ? 'bg-amber-50/70 border-amber-200/80 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              <strong>Colour Preference Order:</strong>
              In matches up to 3v3, team car palettes follow ranked priorities (1st → 2nd → 3rd). If your primary color is chosen by a teammate, the system automatically falls back to your next preset rank.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blue Team Order */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-500 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Blue Team Palette Ranks
                  </span>
                  <span className="text-[10px] font-mono opacity-70">Top 1 Priority</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {blueOrder.map((cId, idx) => {
                    const c = BLUE_TEAM_COLOURS.find((item) => item.id === cId)!;
                    return (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${
                          isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-700/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-neutral-400">#{idx + 1}</span>
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0 shadow-2xs"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="font-medium">{c.name}</span>
                        </div>
                        <Badge size="sm" variant={idx === 0 ? 'primary' : 'neutral'} isLight={isLight}>
                          {idx === 0 ? 'Primary' : `Fallback ${idx}`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Orange Team Order */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-orange-500 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Orange Team Palette Ranks
                  </span>
                  <span className="text-[10px] font-mono opacity-70">Top 1 Priority</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {orangeOrder.map((cId, idx) => {
                    const c = ORANGE_TEAM_COLOURS.find((item) => item.id === cId)!;
                    return (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${
                          isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-700/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-neutral-400">#{idx + 1}</span>
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0 shadow-2xs"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="font-medium">{c.name}</span>
                        </div>
                        <Badge size="sm" variant={idx === 0 ? 'warning' : 'neutral'} isLight={isLight}>
                          {idx === 0 ? 'Primary' : `Fallback ${idx}`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PLAYER ANTHEM TAB: Music anthem presets + random shuffle */}
        {activeTab === 'anthem' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                Goal & MVP Celebration Anthem
              </span>
              <Badge variant="primary" size="sm" isLight={isLight}>
                Audio Preview Ready
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              {ANTHEMS.map((item) => {
                const isSelected = selectedAnthem === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAnthem(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/40 text-neutral-900 shadow-xs'
                          : 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/50 text-white shadow-md'
                        : isLight
                        ? 'bg-neutral-50 hover:bg-white border-neutral-200 text-neutral-800'
                        : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/80 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${
                        isSelected ? 'bg-amber-500 text-white border-amber-500' : isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-700'
                      }`}>
                        {item.id === 'random' ? <Shuffle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{item.title}</span>
                        <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          {item.artist}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge size="sm" variant={isSelected ? 'amber' : 'neutral'} isLight={isLight}>
                        {item.tag}
                      </Badge>
                      <span className="font-mono text-[11px] opacity-70">{item.duration}</span>
                      {isSelected && <Check className="h-4 w-4 text-amber-500 ml-1 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. PLAYER NAME / PROFILE TAB: Under Construction Placeholder */}
        {activeTab === 'player-name' && (
          <UnderConstructionPlaceholder
            title="Player Name Configuration Under Construction"
            description="Player identity customization, unique gamer tag binding and cloud synchronization modules are currently under construction."
            badge="IN DEVELOPMENT"
            isLight={isLight}
          />
        )}
      </PanelContent>

      <PanelFooter hint="ESC to Back" isLight={isLight}>
        <span>Chassis: {selectedCar.toUpperCase()}</span>
      </PanelFooter>
    </PanelContainer>
  );
};
