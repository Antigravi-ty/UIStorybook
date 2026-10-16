import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { UnderlineTabs, TabItem } from '../primitives/UnderlineTabs';
import { Badge } from '../primitives/Badge';
import { useMenuLayoutStore } from '../tokens';
import { type PresetConfig } from '../tokens/floatingPresets';
import { LivePreviewTab } from './additional-preview/LivePreviewTab';
import { FloatingWindowsTab } from './additional-preview/FloatingWindowsTab';

export * from './additional-preview/LivePreviewTab';
export * from './additional-preview/FloatingWindowsTab';

export interface Layer2AdditionalPreviewRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  onNavigateLivePreview?: () => void;
  onAddPresetWindow?: (preset: PresetConfig, event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Optional controlled list of active floating windows */
  activeWindows?: { id: string }[];
  /** Optional controlled count of minimized windows in stack tray */
  minimizedWindowCount?: number;
  /** Optional controlled count of total floating windows */
  totalWindowCount?: number;
  /** Optional callback to close/remove an existing singleton preset window */
  onClosePresetWindow?: (windowId: string) => void;
  initialTab?: 'live-preview' | 'floating-windows';
  activeTab?: 'live-preview' | 'floating-windows';
  onTabChange?: (tab: 'live-preview' | 'floating-windows') => void;
}

/**
 * [Recipe] Layer 2 Additional Preview Recipe (Width: 680px, Height: 540px)
 * Dedicated secondary menu for previewing experimental interfaces:
 * - Tab 1 (`LivePreviewTab`): Live Preview (Enter Layer 3 dedicated Live Preview container with Tab collapse/expand)
 * - Tab 2 (`FloatingWindowsTab`): Floating Window (4 varied length presets with unified '+' action button enqueuing to Stack)
 */
export const Layer2AdditionalPreviewRecipe: React.FC<Layer2AdditionalPreviewRecipeProps> = ({
  isLight = false,
  onBack,
  onNavigateLivePreview,
  onAddPresetWindow,
  activeWindows,
  minimizedWindowCount,
  totalWindowCount,
  onClosePresetWindow,
  initialTab = 'live-preview',
  activeTab: controlledTab,
  onTabChange,
}) => {
  const { panels } = useMenuLayoutStore();
  const sizing = panels['layer2-previews'];
  const [internalTab, setInternalTab] = useState<'live-preview' | 'floating-windows'>(initialTab);
  const currentTab = controlledTab ?? internalTab;

  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);
  const [localWindowIds, setLocalWindowIds] = useState<string[]>([]);

  const windows = activeWindows ?? localWindowIds.map((id) => ({ id }));
  const totalCount = totalWindowCount ?? windows.length;
  const minimizedCount = minimizedWindowCount ?? windows.length;

  const closeWindow = (id: string) => {
    if (onClosePresetWindow) {
      onClosePresetWindow(id);
    } else {
      setLocalWindowIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleTabChange = (t: string) => {
    const valid = t as 'live-preview' | 'floating-windows';
    setInternalTab(valid);
    onTabChange?.(valid);
  };

  const tabs: TabItem[] = [
    {
      id: 'live-preview',
      label: 'Live Preview',
      badge: (
        <Badge variant="amber" size="sm" isLight={isLight}>
          3D
        </Badge>
      ),
    },
    {
      id: 'floating-windows',
      label: 'Floating Window',
      badge: (
        <Badge variant="primary" size="sm" isLight={isLight}>
          {totalCount > 0 ? totalCount : '4'}
        </Badge>
      ),
    },
  ];

  return (
    <PanelContainer isLight={isLight} sizing={sizing} className="w-full">
      <PanelHeader
        title="ADDITIONAL PREVIEWS"
        subtitle="Live Preview sandbox & floating telemetry overlays"
        badge={
          <Badge variant="warning" size="sm" isLight={isLight}>
            Layer 2
          </Badge>
        }
        onBack={onBack}
        isLight={isLight}
      />

      {/* Underline Tabs */}
      <div className="px-6 pt-2 overflow-x-auto no-scrollbar" data-ui-element="tabs-wrapper">
        <UnderlineTabs
          items={tabs}
          activeId={currentTab}
          onChange={handleTabChange}
          isLight={isLight}
          size="sm"
          fullWidth={false}
        />
      </div>

      <PanelContent scrollable className="p-6" data-ui-element="panel-content">
        {currentTab === 'live-preview' && (
          <LivePreviewTab
            onNavigateLivePreview={onNavigateLivePreview}
            onHover={setHoveredDesc}
            onLeave={() => setHoveredDesc(null)}
            isLight={isLight}
          />
        )}

        {currentTab === 'floating-windows' && (
          <FloatingWindowsTab
            windows={windows}
            totalCount={totalCount}
            minimizedCount={minimizedCount}
            onAddPresetWindow={onAddPresetWindow}
            onAddLocalWindow={(presetId) => setLocalWindowIds((prev) => [...prev, presetId])}
            onCloseWindow={closeWindow}
            onHover={setHoveredDesc}
            onLeave={() => setHoveredDesc(null)}
            isLight={isLight}
          />
        )}
      </PanelContent>

      {/* Dynamic Inspector Footer */}
      <PanelFooter isLight={isLight}>
        <div className="flex items-center gap-2 w-full text-xs truncate" data-ui-element="panel-footer">
          <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span
            className={`truncate transition-colors duration-150 ${
              hoveredDesc
                ? isLight
                  ? 'text-neutral-900'
                  : 'text-neutral-100'
                : isLight
                ? 'text-neutral-400'
                : 'text-neutral-500'
            }`}
          >
            {hoveredDesc || '悬停在任意选项上以查看详细参数及说明。'}
          </span>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
};
