import React from 'react';
import { VStack } from '../../../layout/VStack';
import { SettingToggleRow } from '../components/SettingToggleRow';

export interface ChatTabProps {
  quickChatEnabled: boolean;
  onChangeQuickChatEnabled: (val: boolean) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  quickChatEnabled,
  onChangeQuickChatEnabled,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      <SettingToggleRow
        label="Quick Chat Presets"
        checked={quickChatEnabled}
        onChange={onChangeQuickChatEnabled}
        onHover={() => onHover('Enables D-pad quick chat tactical communication during matches.')}
        onLeave={onLeave}
        isLight={isLight}
      />
      <div
        onMouseEnter={() => onHover('Preset phrase slots reserved for future customization.')}
        onMouseLeave={onLeave}
        className={`p-4 rounded-xl border text-xs text-neutral-400 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
        }`}
      >
        Quick chat binds and customizable team macros will be configurable here.
      </div>
    </VStack>
  );
};
