import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard, 
  Gamepad2, 
  Activity, 
  Plus, 
  X, 
  RotateCcw, 
  Sparkles, 
  Check, 
  AlertCircle,
  Ruler
} from 'lucide-react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../layout/Panel';
import { KeycapBadge } from '../primitives/KeycapBadge';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';

export interface ActionBinding {
  id: string;
  action: string;
  keyboard: string[];
  gamepad: string[];
}

export const INITIAL_BINDINGS: ActionBinding[] = [
  { id: 'throttle', action: 'Throttle / Accelerate', keyboard: ['W'], gamepad: ['RT'] },
  { id: 'brake', action: 'Brake / Reverse', keyboard: ['S'], gamepad: ['LT'] },
  { id: 'steer-left', action: 'Steer Left', keyboard: ['A'], gamepad: ['LS-L'] },
  { id: 'steer-right', action: 'Steer Right', keyboard: ['D'], gamepad: ['LS-R'] },
  { id: 'boost', action: 'Rocket Boost', keyboard: ['SPACE', 'L-CLICK'], gamepad: ['B'] },
  { id: 'jump', action: 'Jump / Dodge', keyboard: ['R-CLICK'], gamepad: ['A'] },
  { id: 'powerslide', action: 'Powerslide / Handbrake', keyboard: ['SHIFT'], gamepad: ['X'] },
  { id: 'air-roll-left', action: 'Air Roll Left', keyboard: ['Q'], gamepad: ['LB'] },
  { id: 'air-roll-right', action: 'Air Roll Right', keyboard: ['E'], gamepad: ['RB'] },
  { id: 'ball-cam', action: 'Toggle Ball Camera', keyboard: ['SPACE'], gamepad: ['Y'] },
  { id: 'rear-cam', action: 'Rear Camera Look', keyboard: ['C'], gamepad: ['RS'] },
  { id: 'pause', action: 'Pause / Game Menu', keyboard: ['ESC'], gamepad: ['START'] },
];

// Common gamepad buttons for quick selection fallback
const GAMEPAD_QUICK_PRESETS = [
  'A', 'B', 'X', 'Y', 
  'LB', 'RB', 'LT', 'RT', 
  'LS', 'RS', 'D-UP', 'D-DOWN', 'D-LEFT', 'D-RIGHT', 
  'START', 'BACK'
];

// Standard Gamepad API button index mapping
const GAMEPAD_BUTTON_INDEX_MAP: Record<number, string> = {
  0: 'A',
  1: 'B',
  2: 'X',
  3: 'Y',
  4: 'LB',
  5: 'RB',
  6: 'LT',
  7: 'RT',
  8: 'BACK',
  9: 'START',
  10: 'LS',
  11: 'RS',
  12: 'D-UP',
  13: 'D-DOWN',
  14: 'D-LEFT',
  15: 'D-RIGHT',
  16: 'HOME',
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
 * Format raw keyboard event key into standard human-readable keycap shortcut
 */
function normalizeKeyboardKey(e: KeyboardEvent): string {
  // Normalize special keys
  if (e.code === 'Space' || e.key === ' ') return 'SPACE';
  if (e.code === 'ArrowUp') return 'UP';
  if (e.code === 'ArrowDown') return 'DOWN';
  if (e.code === 'ArrowLeft') return 'LEFT';
  if (e.code === 'ArrowRight') return 'RIGHT';
  if (e.code === 'Enter') return 'ENTER';
  if (e.code === 'Backspace') return 'BKSP';
  if (e.code === 'Tab') return 'TAB';
  if (e.code.startsWith('Key')) return e.code.replace('Key', '').toUpperCase();
  if (e.code.startsWith('Digit')) return e.code.replace('Digit', '');
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') return 'SHIFT';
  if (e.code === 'ControlLeft' || e.code === 'ControlRight') return 'CTRL';
  if (e.code === 'AltLeft' || e.code === 'AltRight') return 'ALT';
  if (e.code === 'CapsLock') return 'CAPS';
  
  if (e.key.length === 1) return e.key.toUpperCase();
  return e.key.toUpperCase();
}

/**
 * RemovableKeycap:
 * Renders standard KeycapBadge with a smooth hover-reveal red cross on the right for unbinding.
 */
interface RemovableKeycapProps {
  shortcut: string;
  kind: 'keyboard' | 'gamepad';
  isLight: boolean;
  onRemove: () => void;
}

const RemovableKeycap: React.FC<RemovableKeycapProps> = ({
  shortcut,
  kind,
  isLight,
  onRemove,
}) => {
  return (
    <div 
      data-element="keycap-wrapper"
      className="group inline-flex items-center shrink-0"
      title={`按键: ${shortcut} (Hover 内部红叉可取消绑定)`}
    >
      <KeycapBadge
        shortcut={shortcut}
        kind={kind}
        size="sm"
        isLight={isLight}
        className="!p-0 !min-h-[20px] !h-5 inline-flex items-center overflow-hidden transition-all duration-200 cursor-default select-none"
      >
        {/* 
          Label container:
          - Symmetrical pl-1.5 pr-1.5 in resting state for true geometric centering.
          - On hover / expanded: right padding smoothly collapses to 0 (group-hover:pr-0 group-[.is-expanded]:pr-0)
            as the cross expands, eliminating redundant whitespace between letter and cross.
          - Optical baseline correction via -translate-y-px.
        */}
        <span 
          data-element="keycap-label"
          className="inline-flex items-center justify-center h-full pl-1.5 pr-1.5 group-hover:pr-0 group-[.is-expanded]:pr-0 text-[10px] font-mono font-semibold leading-none shrink-0 -translate-y-px select-none transition-all duration-200 ease-out"
        >
          {shortcut}
        </span>

        {/* 
          Inner deletion cross:
          - Default: w-0, opacity-0, overflow-hidden (zero footprint).
          - On hover / expanded: expands smoothly to w-[18px] (group-hover:w-[18px] group-[.is-expanded]:w-[18px]),
            perfectly housing the 14px button with balanced 2px side margins.
          - Cross icon stays red (text-red-500) permanently.
          - On hover over cross: subtle rounded-rect soft red background (hover:bg-red-500/15).
        */}
        <span 
          data-element="unbind-container"
          className="inline-flex items-center justify-center overflow-hidden w-0 opacity-0 group-hover:w-[18px] group-hover:opacity-100 group-[.is-expanded]:w-[18px] group-[.is-expanded]:opacity-100 transition-all duration-200 ease-out pointer-events-none group-hover:pointer-events-auto group-[.is-expanded]:pointer-events-auto shrink-0"
        >
          <button
            type="button"
            data-element="unbind-button"
            aria-label={`Unbind ${shortcut}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-[3px] text-red-500 dark:text-red-400 hover:bg-red-500/15 dark:hover:bg-red-500/25 cursor-pointer transition-colors shrink-0"
            title={`取消绑定: ${shortcut}`}
          >
            <X className="h-2.5 w-2.5 stroke-[2.5]" />
          </button>
        </span>
      </KeycapBadge>
    </div>
  );
};

/**
 * ListeningSlot:
 * Displays active pulsing listening indicator prompting player to press a key or gamepad button.
 */
interface ListeningSlotProps {
  kind: 'keyboard' | 'gamepad';
  isLight: boolean;
  onCancel: () => void;
  onSelectGamepadPreset?: (btn: string) => void;
}

const ListeningSlot: React.FC<ListeningSlotProps> = ({
  kind,
  isLight,
  onCancel,
  onSelectGamepadPreset,
}) => {
  return (
    <div className="relative inline-flex flex-col gap-1.5 z-20">
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium animate-pulse shadow-sm ${
          isLight
            ? 'bg-amber-500/15 border-amber-500 text-amber-700'
            : 'bg-amber-500/20 border-amber-400 text-amber-300'
        }`}
      >
        <Sparkles className="h-3 w-3 animate-spin text-amber-500 shrink-0" />
        <span>{kind === 'keyboard' ? '按下任意键...' : '请按手柄键...'}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="ml-1 inline-flex items-center justify-center h-3.5 w-3.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          title="取消 (Esc)"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Gamepad Quick Picker Panel (when listening to gamepad) */}
      {kind === 'gamepad' && onSelectGamepadPreset && (
        <div
          className={`absolute top-full left-0 mt-1 p-2 rounded-xl border shadow-xl flex flex-col gap-1.5 min-w-[200px] z-50 ${
            isLight
              ? 'bg-white border-neutral-200 shadow-neutral-200/50 text-neutral-800'
              : 'bg-neutral-900 border-neutral-700 shadow-black/80 text-neutral-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono px-0.5">
            <span>手柄实体按键 / 屏幕点选:</span>
            <span className="text-amber-500 font-bold">监听中</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {GAMEPAD_QUICK_PRESETS.map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => onSelectGamepadPreset(btn)}
                className="cursor-pointer transition-transform active:scale-95"
              >
                <KeycapBadge
                  shortcut={btn}
                  kind="gamepad"
                  size="sm"
                  isLight={isLight}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [listeningTarget, setListeningTarget] = useState<{
    actionId: string;
    kind: 'keyboard' | 'gamepad';
  } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  };

  // 1. Keyboard event listener for binding capture
  useEffect(() => {
    if (!listeningTarget || listeningTarget.kind !== 'keyboard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape cancels the active listening
      if (e.key === 'Escape') {
        setListeningTarget(null);
        showFeedback('已取消绑定');
        return;
      }

      const shortcut = normalizeKeyboardKey(e);

      setBindings((prev) =>
        prev.map((item) => {
          if (item.id === listeningTarget.actionId) {
            // Avoid duplicate key in the same action
            if (item.keyboard.includes(shortcut)) {
              return item;
            }
            return {
              ...item,
              keyboard: [...item.keyboard, shortcut],
            };
          }
          return item;
        })
      );

      showFeedback(`✓ 已绑定键盘按键 [${shortcut}]`);
      setListeningTarget(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [listeningTarget]);

  // 2. Gamepad API polling listener for physical gamepad button presses
  useEffect(() => {
    if (!listeningTarget || listeningTarget.kind !== 'gamepad') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const pollGamepads = () => {
      const gamepads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
      for (const gp of gamepads) {
        if (!gp) continue;
        for (let i = 0; i < gp.buttons.length; i++) {
          const btn = gp.buttons[i];
          if (btn && (btn.pressed || btn.value > 0.5)) {
            const mappedName = GAMEPAD_BUTTON_INDEX_MAP[i] || `BTN ${i}`;
            
            setBindings((prev) =>
              prev.map((item) => {
                if (item.id === listeningTarget.actionId) {
                  if (item.gamepad.includes(mappedName)) return item;
                  return {
                    ...item,
                    gamepad: [...item.gamepad, mappedName],
                  };
                }
                return item;
              })
            );

            showFeedback(`✓ 已捕获手柄按键 [${mappedName}]`);
            setListeningTarget(null);
            return;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(pollGamepads);
    };

    animFrameRef.current = requestAnimationFrame(pollGamepads);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [listeningTarget]);

  // Handle unbinding single key
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

  // Handle adding button from picker preset
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

  // Reset to default presets
  const handleResetDefaults = () => {
    setBindings(INITIAL_BINDINGS);
    setListeningTarget(null);
    showFeedback('✓ 已恢复默认按键配置');
  };

  const tableRef = useRef<HTMLDivElement | null>(null);

  // Export mathematical layout telemetry of the first row (Throttle / Accelerate)
  const handleExportFirstRowLayout = async () => {
    if (!tableRef.current) return;

    const firstRowEl = tableRef.current.querySelector<HTMLElement>('[data-row-id="throttle"], [data-row="binding-row"]');
    if (!firstRowEl) {
      showFeedback('未找到第一行元素');
      return;
    }

    const rowRect = firstRowEl.getBoundingClientRect();
    const actionEl = firstRowEl.querySelector<HTMLElement>('[data-col="action"]');
    const kbdWrapper = firstRowEl.querySelector<HTMLElement>('[data-element="keycap-wrapper"]');
    const firstKbd = firstRowEl.querySelector<HTMLElement>('[data-component="keycap-badge"]');
    const labelSpan = firstKbd?.querySelector<HTMLElement>('[data-element="keycap-label"]');
    const unbindSpan = firstKbd?.querySelector<HTMLElement>('[data-element="unbind-container"]');
    const unbindBtn = firstKbd?.querySelector<HTMLElement>('[data-element="unbind-button"]');

    const getRectStr = (r?: DOMRect | null) => 
      r ? `${Math.round(r.width * 10) / 10}px × ${Math.round(r.height * 10) / 10}px (left: ${Math.round(r.left * 10) / 10}, top: ${Math.round(r.top * 10) / 10})` : 'N/A';

    const lines: string[] = [];
    lines.push('========================================================================');
    lines.push(' [CONTROLS FIRST ROW LAYOUT INSPECTOR] ACTION: THROTTLE / ACCELERATE');
    lines.push('========================================================================');
    lines.push(`• Row Bounding Box: ${getRectStr(rowRect)}`);

    if (actionEl) {
      lines.push(`• Action Cell:      ${getRectStr(actionEl.getBoundingClientRect())} | Text: "${actionEl.textContent?.trim()}"`);
    }

    // Helper to capture a phase
    const capturePhase = (phaseTitle: string) => {
      lines.push('\n------------------------------------------------------------------------');
      lines.push(` ${phaseTitle}`);
      lines.push('------------------------------------------------------------------------');

      if (!firstKbd) return;
      const kRect = firstKbd.getBoundingClientRect();
      const kStyle = window.getComputedStyle(firstKbd);
      lines.push('[1. KEYCAP BADGE CONTAINER]');
      lines.push(`  • Size & Pos:     ${getRectStr(kRect)}`);
      lines.push(`  • Padding:        top=${kStyle.paddingTop}, right=${kStyle.paddingRight}, bottom=${kStyle.paddingBottom}, left=${kStyle.paddingLeft}`);
      lines.push(`  • Border:         top=${kStyle.borderTopWidth}, right=${kStyle.borderRightWidth}, bottom=${kStyle.borderBottomWidth}, left=${kStyle.borderLeftWidth}`);

      if (labelSpan) {
        const lRect = labelSpan.getBoundingClientRect();
        const lStyle = window.getComputedStyle(labelSpan);
        const topGap = lRect.top - kRect.top;
        const bottomGap = kRect.bottom - lRect.bottom;
        lines.push('\n[2. KEY LABEL (LETTER W)]');
        lines.push(`  • Size & Pos:     ${getRectStr(lRect)} | Char: "${labelSpan.textContent?.trim()}"`);
        lines.push(`  • Padding:        left=${lStyle.paddingLeft}, right=${lStyle.paddingRight}`);
        lines.push(`  • Vertical Gap:   TopGap = ${Math.round(topGap * 10) / 10}px | BottomGap = ${Math.round(bottomGap * 10) / 10}px | Delta = ${Math.round((topGap - bottomGap) * 10) / 10}px`);
      }

      if (unbindSpan) {
        const uRect = unbindSpan.getBoundingClientRect();
        const uStyle = window.getComputedStyle(unbindSpan);
        lines.push('\n[3. UNBIND CONTAINER (EXPANDING SPAN)]');
        lines.push(`  • Size & Pos:     ${getRectStr(uRect)}`);
        lines.push(`  • Overflow:       ${uStyle.overflow}`);

        if (unbindBtn) {
          const bRect = unbindBtn.getBoundingClientRect();
          const leftGap = bRect.left - uRect.left;
          const rightGap = uRect.right - bRect.right;
          const isClippedLeft = bRect.left < uRect.left;
          const isClippedRight = bRect.right > uRect.right;
          lines.push('\n[4. UNBIND BUTTON (RED CROSS CIRCLE)]');
          lines.push(`  • Size & Pos:     ${getRectStr(bRect)}`);
          lines.push(`  • Inner Gaps:     LeftGap = ${Math.round(leftGap * 10) / 10}px | RightGap = ${Math.round(rightGap * 10) / 10}px`);
          lines.push(`  • Clipping Test:  ClippedLeft = ${isClippedLeft} | ClippedRight = ${isClippedRight}`);
        }
      }
    };

    // Phase 1: Resting state (未悬浮状态 / 收起)
    capturePhase('[PHASE 1: RESTING STATE (默认收起状态 / 零占位)]');

    // Phase 2: Expanded hover state (展开悬浮态)
    if (kbdWrapper) {
      const allEls = [kbdWrapper, ...(kbdWrapper.querySelectorAll<HTMLElement>('*'))];
      allEls.forEach(el => el.style.setProperty('transition', 'none', 'important'));
      kbdWrapper.classList.add('is-expanded');
      void kbdWrapper.offsetWidth; // force synchronous layout reflow

      capturePhase('[PHASE 2: EXPANDED / HOVER STATE (展开态 / 红叉展开 & W右Padding归零)]');

      // Cleanup & restore smooth transitions
      kbdWrapper.classList.remove('is-expanded');
      allEls.forEach(el => el.style.removeProperty('transition'));
    }

    lines.push('\n========================================================================\n');
    const report = lines.join('\n');
    console.log(report);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(report);
        showFeedback('✓ 第一行布局数据已输出至控制台并复制到剪贴板');
      } catch (_) {
        showFeedback('✓ 第一行布局数据已输出至控制台');
      }
    } else {
      showFeedback('✓ 第一行布局数据已输出至控制台');
    }
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
          {/* Export Layout Metrics button */}
          <button
            type="button"
            onClick={handleExportFirstRowLayout}
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
        {/* Col 1: Action (4/12 cols) */}
        <div className="col-span-4 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-amber-500" />
          <span>ACTION (动作名称)</span>
        </div>

        {/* Col 2: Keyboard (4/12 cols) */}
        <div className="col-span-4 flex items-center gap-1.5">
          <Keyboard className="h-3.5 w-3.5 text-sky-500" />
          <span>KEYBOARD (键盘绑定)</span>
        </div>

        {/* Col 3: Controller (4/12 cols) */}
        <div className="col-span-4 flex items-center gap-1.5">
          <Gamepad2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>CONTROLLER (手柄绑定)</span>
        </div>
      </div>

      {/* 3-Column Binding Table Body */}
      <div className="flex flex-col divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
        {bindings.map((b) => {
          const isListeningKeyboard =
            listeningTarget?.actionId === b.id && listeningTarget?.kind === 'keyboard';
          const isListeningGamepad =
            listeningTarget?.actionId === b.id && listeningTarget?.kind === 'gamepad';

          return (
            <div
              key={b.id}
              data-row="binding-row"
              data-row-id={b.id}
              className={`grid grid-cols-12 items-center py-2.5 px-3 rounded-lg transition-colors duration-100 ${
                isLight ? 'hover:bg-neutral-100/80' : 'hover:bg-neutral-800/40'
              }`}
            >
              {/* Col 1: Action Name */}
              <div data-col="action" className="col-span-4 flex items-center gap-2 pr-2">
                <span className={`font-medium truncate ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                  {b.action}
                </span>
              </div>

              {/* Col 2: Keyboard Binds (Compact layout: zero space waste, hover pushes siblings) */}
              <div className="col-span-4 flex flex-wrap items-center gap-1 pr-2 transition-all">
                {b.keyboard.map((k) => (
                  <RemovableKeycap
                    key={k}
                    shortcut={k}
                    kind="keyboard"
                    isLight={isLight}
                    onRemove={() => handleRemoveKey(b.id, 'keyboard', k)}
                  />
                ))}

                {/* Keyboard listening badge or '+' trigger */}
                {isListeningKeyboard ? (
                  <ListeningSlot
                    kind="keyboard"
                    isLight={isLight}
                    onCancel={() => setListeningTarget(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setListeningTarget({ actionId: b.id, kind: 'keyboard' })}
                    title={`为 "${b.action}" 添加键盘按键绑定`}
                    className={`inline-flex items-center justify-center h-5 w-5 rounded-md border border-dashed transition-all cursor-pointer ${
                      isLight
                        ? 'border-neutral-300 hover:border-amber-500 hover:bg-amber-50 text-neutral-400 hover:text-amber-600'
                        : 'border-neutral-700 hover:border-amber-400 hover:bg-amber-500/10 text-neutral-500 hover:text-amber-400'
                    }`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Col 3: Controller / Gamepad Binds (Compact layout: zero space waste, hover pushes siblings) */}
              <div className="col-span-4 flex flex-wrap items-center gap-1 transition-all">
                {b.gamepad.map((padKey) => (
                  <RemovableKeycap
                    key={padKey}
                    shortcut={padKey}
                    kind="gamepad"
                    isLight={isLight}
                    onRemove={() => handleRemoveKey(b.id, 'gamepad', padKey)}
                  />
                ))}

                {/* Gamepad listening badge or '+' trigger */}
                {isListeningGamepad ? (
                  <ListeningSlot
                    kind="gamepad"
                    isLight={isLight}
                    onCancel={() => setListeningTarget(null)}
                    onSelectGamepadPreset={handleSelectGamepadPreset}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setListeningTarget({ actionId: b.id, kind: 'gamepad' })}
                    title={`为 "${b.action}" 添加手柄按键绑定`}
                    className={`inline-flex items-center justify-center h-5 w-5 rounded-md border border-dashed transition-all cursor-pointer ${
                      isLight
                        ? 'border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50 text-neutral-400 hover:text-emerald-600'
                        : 'border-neutral-700 hover:border-emerald-400 hover:bg-emerald-500/10 text-neutral-500 hover:text-emerald-400'
                    }`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
