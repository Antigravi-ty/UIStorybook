import React, { useState, useRef, useCallback } from 'react';
import {
  Keyboard,
  Gamepad2,
  Activity,
  RotateCcw,
  Check,
  Ruler,
} from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { Badge } from '../primitives/Badge';
import {
  ActionBinding,
  INITIAL_BINDINGS,
  GAMEPAD_QUICK_PRESETS,
  ListeningTarget,
  RemovableKeycap,
  ListeningSlot,
  KeybindingActionRow,
} from './keybinding/KeybindingSlots';
import {
  GAMEPAD_BUTTON_INDEX_MAP,
  normalizeKeyboardKey,
  useKeybindingCapture,
  exportFirstRowLayoutTelemetry,
} from './keybinding/useKeybindingCapture';

export {
  type ActionBinding,
  INITIAL_BINDINGS,
  GAMEPAD_QUICK_PRESETS,
  type ListeningTarget,
  RemovableKeycap,
  ListeningSlot,
  KeybindingActionRow,
  GAMEPAD_BUTTON_INDEX_MAP,
  normalizeKeyboardKey,
  useKeybindingCapture,
};

export interface KeybindingRecipeProps {
  isLight?: boolean;
  onBack?: () => void;
  /**
   * If true, renders the full standalone PanelContainer shell with header and footer.
   * If false or omitted, renders the modular 3-column binding table suitable for embedding directly inside Settings.
   */
  standalone?: boolean;
  className?: string;
}

/**
 * [Recipe] ControlsBindingTable
 * Fully decoupled 3-Column Controls Mapping Table:
 * - Col 1: Action (with Lucide Activity/Command icon)
 * - Col 2: Keyboard binds (with Lucide Keyboard icon, unlimited binds, hover delete cross, '+' key capture)
 * - Col 3: Controller binds (with Lucide Gamepad2 icon, unlimited binds, hover delete cross, '+' button capture)
 */
export const ControlsBindingTable: React.FC<{ isLight?: boolean; className?: string }> = ({
  isLight = false,
  className = '',
}) => {
  const [bindings, setBindings] = useState<ActionBinding[]>(INITIAL_BINDINGS);
  const [listeningTarget, setListeningTarget] = useState<ListeningTarget | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  }, []);

  useKeybindingCapture(listeningTarget, setBindings, setListeningTarget, showFeedback);

  const handleRemoveKey = (actionId: string, kind: 'keyboard' | 'gamepad', keyToRemove: string) => {
    setBindings((prev) =>
      prev.map((item) => {
        if (item.id === actionId) {
          return {
            ...item,
            [kind]: item[kind].filter((k) => k !== keyToRemove),
          };
        }
        return item;
      })
    );
    showFeedback(`已解除 ${kind === 'keyboard' ? '键盘' : '手柄'} 按键 [${keyToRemove}]`);
  };

  const handleSelectGamepadPreset = (buttonName: string) => {
    if (!listeningTarget || listeningTarget.kind !== 'gamepad') return;

    setBindings((prev) =>
      prev.map((item) => {
        if (item.id === listeningTarget.actionId) {
          if (item.gamepad.includes(buttonName)) return item;
          return {
            ...item,
            gamepad: [...item.gamepad, buttonName],
          };
        }
        return item;
      })
    );

    showFeedback(`✓ 已绑定手柄按键 [${buttonName}]`);
    setListeningTarget(null);
  };

  const handleResetDefaults = () => {
    setBindings(INITIAL_BINDINGS);
    setListeningTarget(null);
    showFeedback('✓ 已恢复默认按键配置');
  };

  return (
    <div ref={tableRef} className={`flex flex-col w-full text-xs select-none ${className}`}>
      {/* Table Subheader Toolbar: Status feedback + Export & Reset actions */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            无限制绑定 · 悬浮按键可点击红叉删除 · 点击 [+] 监听录入
          </span>
          {feedback && (
            <span className="text-amber-500 font-semibold text-[11px] flex items-center gap-1 animate-pulse">
              <Check className="h-3 w-3" />
              {feedback}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportFirstRowLayoutTelemetry(tableRef.current, showFeedback)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            }`}
            title="检查并导出第一行 (Throttle) 按键与红叉的绝对坐标、Padding 及盒模型数据"
          >
            <Ruler className="h-3 w-3 text-amber-500" />
            <span>导出第一行布局数据</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            }`}
            title="重置所有按键为默认配置"
          >
            <RotateCcw className="h-3 w-3" />
            <span>恢复默认</span>
          </button>
        </div>
      </div>

      {/* 3-Column Binding Table Header */}
      <div
        className={`grid grid-cols-12 items-center py-2 px-3 rounded-lg font-mono font-semibold text-[11px] tracking-wider uppercase border mb-1.5 transition-colors ${
          isLight
            ? 'bg-neutral-100/90 border-neutral-200 text-neutral-700'
            : 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
        }`}
      >
        <div className="col-span-4 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-amber-500" />
          <span>ACTION (动作名称)</span>
        </div>

        <div className="col-span-4 flex items-center gap-1.5">
          <Keyboard className="h-3.5 w-3.5 text-sky-500" />
          <span>KEYBOARD (键盘绑定)</span>
        </div>

        <div className="col-span-4 flex items-center gap-1.5">
          <Gamepad2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>CONTROLLER (手柄绑定)</span>
        </div>
      </div>

      {/* 3-Column Binding Table Body */}
      <div className="flex flex-col divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
        {bindings.map((b) => (
          <KeybindingActionRow
            key={b.id}
            binding={b}
            isLight={isLight}
            listeningTarget={listeningTarget}
            onStartListening={setListeningTarget}
            onRemoveKey={handleRemoveKey}
            onSelectGamepadPreset={handleSelectGamepadPreset}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * [Recipe] KeybindingRecipe
 * Full-featured Keybinding Panel:
 * - If standalone: wraps the 3-column table inside PanelContainer with standard Header and Footer.
 * - If embedded inside Layer2SettingsRecipe: renders the ControlsBindingTable seamlessly without redundant wrapper.
 */
export const KeybindingRecipe: React.FC<KeybindingRecipeProps> = ({
  isLight = false,
  onBack,
  standalone = false,
  className = '',
}) => {
  if (!standalone) {
    return <ControlsBindingTable isLight={isLight} className={className} />;
  }

  return (
    <PanelContainer isLight={isLight} className={`w-full max-w-[680px] ${className}`}>
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

      <PanelContent scrollable className="p-6">
        <ControlsBindingTable isLight={isLight} />
      </PanelContent>

      <PanelFooter hint="ESC to Back" isLight={isLight}>
        <span className="text-[11px] font-mono opacity-70">
          Rocket League Unified Controls Layer
        </span>
      </PanelFooter>
    </PanelContainer>
  );
};
