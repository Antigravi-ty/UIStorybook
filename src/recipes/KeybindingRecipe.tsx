import React from 'react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { VStack } from '../layout/VStack';
import { HStack } from '../layout/HStack';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';

export interface KeybindingRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
}

const BINDINGS = [
  { action: 'Throttle / Accelerate', keyboard: 'W', gamepad: 'RT' },
  { action: 'Brake / Reverse', keyboard: 'S', gamepad: 'LT' },
  { action: 'Steer Left / Right', keyboard: 'A / D', gamepad: 'LS' },
  { action: 'Rocket Boost', keyboard: 'SPACE', gamepad: 'B' },
  { action: 'Jump / Dodge', keyboard: 'RIGHT CLICK', gamepad: 'A' },
  { action: 'Powerslide / Handbrake', keyboard: 'SHIFT', gamepad: 'X' },
  { action: 'Air Roll Left / Right', keyboard: 'Q / E', gamepad: 'LB / RB' },
  { action: 'Toggle Ball Camera', keyboard: 'SPACE', gamepad: 'Y' },
  { action: 'Pause / Game Menu', keyboard: 'ESC', gamepad: 'START' },
];

/**
 * [Recipe] Keybinding & Controls Remapping Panel
 * Demonstrates standardized KeycapBadge integration with dual Keyboard + Gamepad telemetry.
 */
export const KeybindingRecipe: React.FC<KeybindingRecipeProps> = ({
  isLight = false,
  onBack,
}) => {
  return (
    <PanelContainer isLight={isLight} className="w-full max-w-[560px]">
      <PanelHeader
        title="CONTROL MAPPINGS"
        subtitle="Keyboard & XInput Gamepad controller binds"
        badge={
          <Badge variant="primary" size="sm" isLight={isLight}>
            Input Map
          </Badge>
        }
        onBack={onBack}
        isLight={isLight}
      />

      <PanelContent scrollable className="h-[360px] overflow-y-auto">
        <VStack gap="sm" divider isLight={isLight}>
          {BINDINGS.map((b) => (
            <div
              key={b.action}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className={`text-sm font-medium ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                  {b.action}
                </span>
              </div>

              <HStack gap="md" align="center">
                <HStack gap="sm" align="center">
                  <span className={`text-[10px] uppercase font-mono ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    KB:
                  </span>
                  <KeycapBadge shortcut={b.keyboard} size="sm" isLight={isLight} />
                </HStack>

                <HStack gap="sm" align="center">
                  <span className={`text-[10px] uppercase font-mono ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    PAD:
                  </span>
                  <KeycapBadge
                    shortcut={b.gamepad}
                    kind="gamepad"
                    size="sm"
                    isLight={isLight}
                  />
                </HStack>
              </HStack>
            </div>
          ))}
        </VStack>
      </PanelContent>

      <PanelFooter hint="ESC to Back" isLight={isLight}>
        <Button variant="ghost" size="sm" isLight={isLight}>
          Reset Defaults
        </Button>
      </PanelFooter>
    </PanelContainer>
  );
};
