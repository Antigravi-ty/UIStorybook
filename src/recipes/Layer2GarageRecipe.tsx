import React, { useState } from 'react';
import {
  Car,
  Palette,
  Music,
  User,
} from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { UnderlineTabs, TabItem } from '../primitives/UnderlineTabs';
import { Badge } from '../primitives/Badge';
import { UnderConstructionPlaceholder } from '../primitives/UnderConstructionPlaceholder';
import { useMenuLayoutStore } from '../tokens';
import { GarageCarTab } from './garage/GarageCarTab';
import { GarageColorTab } from './garage/GarageColorTab';
import { GarageAnthemTab } from './garage/GarageAnthemTab';

export * from './garage/garageConstants';
export * from './garage/GarageCarTab';
export * from './garage/GarageColorTab';
export * from './garage/GarageAnthemTab';

export interface Layer2GarageRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  initialTab?: string;
}

/**
 * [Recipe] Layer 2 Garage Loadout Menu (Width: 680px, Height: 540px)
 * Modular nested architecture maintaining low coupling:
 * 1. Car (`GarageCarTab`): 8 cards with name & hitbox badge (4x2 grid, no scroll)
 * 2. Colour (`GarageColorTab`): Blue & Orange team fallback preference order (6 presets)
 * 3. Player Anthem (`GarageAnthemTab`): Anthem selection including random
 * 4. Player Name / Profile Sync: Server-bound customization sync & login indicator
 */
export const Layer2GarageRecipe: React.FC<Layer2GarageRecipeProps> = ({
  isLight = false,
  onBack,
  initialTab = 'car',
}) => {
  const { panels } = useMenuLayoutStore();
  const sizing = panels['layer2-garage'];
  const [activeTab, setActiveTab] = useState(initialTab);

  // Car State
  const [selectedCar, setSelectedCar] = useState('octane');

  // Colour State: Fallback preference order
  const [blueOrder] = useState<string[]>(['cobalt', 'sky', 'navy', 'teal', 'purple', 'slate']);
  const [orangeOrder] = useState<string[]>(['flame', 'crimson', 'amber', 'ruby', 'gold', 'coral']);

  // Anthem State
  const [selectedAnthem, setSelectedAnthem] = useState('random');

  const tabs: TabItem[] = [
    { id: 'car', label: 'Car', icon: <Car className="h-4 w-4" /> },
    { id: 'colour', label: 'Colour', icon: <Palette className="h-4 w-4" /> },
    { id: 'anthem', label: 'Player Anthem', icon: <Music className="h-4 w-4" /> },
    { id: 'player-name', label: 'Player Name', icon: <User className="h-4 w-4" /> },
  ];

  return (
    <PanelContainer isLight={isLight} sizing={sizing} className="w-full">
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
      <div className="px-6 pt-2 shrink-0">
        <UnderlineTabs
          items={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          isLight={isLight}
        />
      </div>

      <PanelContent scrollable className="p-6">
        {activeTab === 'car' && (
          <GarageCarTab
            selectedCar={selectedCar}
            onSelectCar={setSelectedCar}
            isLight={isLight}
          />
        )}

        {activeTab === 'colour' && (
          <GarageColorTab
            blueOrder={blueOrder}
            orangeOrder={orangeOrder}
            isLight={isLight}
          />
        )}

        {activeTab === 'anthem' && (
          <GarageAnthemTab
            selectedAnthem={selectedAnthem}
            onSelectAnthem={setSelectedAnthem}
            isLight={isLight}
          />
        )}

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
