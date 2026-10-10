import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Flame,
  X
} from 'lucide-react';
import { UI_RADIUS } from '../tokens/radius';

export type DialogueTone = 'info' | 'warning' | 'orange' | 'error';
export type DialogueButtonVariant = 'primary' | 'outline' | 'danger';

export interface DialogueButtonConfig {
  key?: string;
  label: string;
  variant?: DialogueButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
}

export interface DialogueProps {
  /** Centered title text */
  title: string;
  /** Title font size in px (default: 28) */
  titleFontSize?: number;
  /** Title letter spacing in px or string (default: 4) */
  titleLetterSpacing?: number | string;
  /** Title font weight (800+, default: 800) */
  titleFontWeight?: number | string;
  /** Title bottom margin in px (default: 2) */
  titleMarginBottom?: number;
  /** Title color mode: 'content' (matches body text), 'muted', 'primary', 'tone' (default: 'content') */
  titleColorMode?: 'content' | 'muted' | 'primary' | 'tone';
  /** Optional explicit title color string (e.g. hex or rgba) */
  titleColor?: string;
  /** Information body text / node, vertically centered with left icon */
  content: React.ReactNode;
  /** Content bottom margin (gap before buttons) in px (default: 16) */
  contentMarginBottom?: number;
  /** Left icon, vertically centered relative to content */
  icon?: React.ReactNode;
  /** Tone level: info (grey), warning (yellow), orange (orange), error (red) */
  tone?: DialogueTone;
  /** Action buttons, centered, compact, equal width */
  buttons?: DialogueButtonConfig[];
  /** Light / Dark theme */
  isLight?: boolean;
  /** Dialogue container vertical padding (上下内衬) in px (default: 16) */
  paddingY?: number;
  /** Dialogue container horizontal padding (左右内衬) in px (default: 20) */
  paddingX?: number;
  /** Legacy unified dialogue padding in px */
  dialoguePadding?: number;
  /** Legacy unified section gap in px */
  sectionGap?: number;
  /** Inner glow blur radius in px (default: 40, 0 to disable) */
  innerGlowBlur?: number;
  /** Omnidirectional outer shadow blur in px (default: 50, 0 to disable) */
  outerShadowBlur?: number;
  /** Minimum container height (default: 160) */
  minHeight?: number | string;
  /** Maximum container width (default: 560) */
  maxWidth?: number | string;
  /** Optional custom class name */
  className?: string;
  /** Optional close handler */
  onClose?: () => void;
}

/**
 * Build combined box-shadow: inner glow (inset) + omnidirectional floating outer shadow
 */
const buildCombinedShadow = (
  tone: DialogueTone,
  isLight: boolean,
  innerGlowBlur: number,
  outerShadowBlur: number
): string => {
  const parts: string[] = [];

  // 1. Inner Glow
  if (innerGlowBlur > 0) {
    switch (tone) {
      case 'error':
        parts.push(
          isLight
            ? `inset 0 0 ${innerGlowBlur}px rgba(239, 68, 68, 0.16)`
            : `inset 0 0 ${Math.round(innerGlowBlur * 1.2)}px rgba(239, 68, 68, 0.25)`
        );
        break;
      case 'orange':
        parts.push(
          isLight
            ? `inset 0 0 ${innerGlowBlur}px rgba(249, 115, 22, 0.16)`
            : `inset 0 0 ${Math.round(innerGlowBlur * 1.2)}px rgba(249, 115, 22, 0.25)`
        );
        break;
      case 'warning':
        parts.push(
          isLight
            ? `inset 0 0 ${innerGlowBlur}px rgba(234, 179, 8, 0.16)`
            : `inset 0 0 ${Math.round(innerGlowBlur * 1.2)}px rgba(234, 179, 8, 0.25)`
        );
        break;
      case 'info':
      default:
        parts.push(
          isLight
            ? `inset 0 0 ${innerGlowBlur}px rgba(0, 0, 0, 0.08)`
            : `inset 0 0 ${Math.round(innerGlowBlur * 1.2)}px rgba(255, 255, 255, 0.08)`
        );
        break;
    }
  }

  // 2. Omnidirectional 360-degree floating outer shadow (similar to Menu Layer shell elevation)
  if (outerShadowBlur > 0) {
    if (isLight) {
      parts.push(
        `0 0 0 1px rgba(0, 0, 0, 0.08)`,
        `0 0 ${outerShadowBlur}px rgba(0, 0, 0, 0.16)`,
        `0 ${Math.round(outerShadowBlur * 0.4)}px ${Math.round(outerShadowBlur * 1.2)}px rgba(0, 0, 0, 0.14)`
      );
    } else {
      parts.push(
        `0 0 0 1px rgba(255, 255, 255, 0.14)`,
        `0 0 ${outerShadowBlur}px rgba(0, 0, 0, 0.85)`,
        `0 ${Math.round(outerShadowBlur * 0.4)}px ${Math.round(outerShadowBlur * 1.2)}px rgba(0, 0, 0, 0.95)`
      );
    }
  }

  return parts.length > 0 ? parts.join(', ') : 'none';
};

/**
 * Tone configuration for the 4 levels (Grey, Yellow, Orange, Red)
 */
const getToneConfig = (tone: DialogueTone, isLight: boolean) => {
  switch (tone) {
    case 'error':
      return {
        defaultIcon: <AlertCircle className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-red-50 text-red-600 border border-red-200/90'
          : 'bg-red-950/70 text-red-400 border border-red-800/80',
        cardBorderClass: isLight ? 'border-red-300/80' : 'border-red-900/60',
        defaultButtonVariant: 'danger' as DialogueButtonVariant,
      };
    case 'orange':
      return {
        defaultIcon: <Flame className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-orange-50 text-orange-600 border border-orange-200/90'
          : 'bg-orange-950/70 text-orange-400 border border-orange-800/80',
        cardBorderClass: isLight ? 'border-orange-300/80' : 'border-orange-900/60',
        defaultButtonVariant: 'primary' as DialogueButtonVariant,
      };
    case 'warning':
      return {
        defaultIcon: <AlertTriangle className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-yellow-50 text-yellow-600 border border-yellow-200/90'
          : 'bg-yellow-950/70 text-yellow-400 border border-yellow-800/80',
        cardBorderClass: isLight ? 'border-yellow-300/80' : 'border-yellow-900/60',
        defaultButtonVariant: 'primary' as DialogueButtonVariant,
      };
    case 'info':
    default:
      return {
        defaultIcon: <Info className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-neutral-100 text-neutral-600 border border-neutral-300/80'
          : 'bg-neutral-800 text-neutral-300 border border-neutral-700/80',
        cardBorderClass: isLight ? 'border-neutral-300/80' : 'border-neutral-800/80',
        defaultButtonVariant: 'primary' as DialogueButtonVariant,
      };
  }
};

const MONO_FONT_STACK = "'SF Mono', 'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace";

/**
 * Dialogue Presentation Component
 */
export const Dialogue: React.FC<DialogueProps> = ({
  title = 'ALERT',
  titleFontSize = 32,
  titleLetterSpacing = 10,
  titleFontWeight = 800,
  titleMarginBottom = 2,
  titleColorMode = 'muted',
  titleColor,
  content = 'Failed to establish signaling server through WebSocket.',
  contentMarginBottom = 16,
  icon,
  tone = 'error',
  buttons = [
    { label: 'Primary', variant: 'primary' },
    { label: 'Outline', variant: 'outline' },
    { label: 'Danger', variant: 'danger' },
  ],
  isLight = false,
  paddingY = 16,
  paddingX = 32,
  dialoguePadding,
  sectionGap,
  innerGlowBlur = 36,
  outerShadowBlur = 20,
  minHeight = 165,
  maxWidth = 560,
  className = '',
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [equalButtonWidth, setEqualButtonWidth] = useState<number | null>(null);

  const effectivePaddingY = paddingY ?? dialoguePadding ?? 16;
  const effectivePaddingX = paddingX ?? (dialoguePadding ? Math.round(dialoguePadding * 1.25) : 32);
  const effectiveTitleMarginBottom = titleMarginBottom ?? sectionGap ?? 2;
  const effectiveContentMarginBottom = contentMarginBottom ?? sectionGap ?? 16;

  const toneConfig = getToneConfig(tone, isLight);
  const combinedShadow = buildCombinedShadow(tone, isLight, innerGlowBlur, outerShadowBlur);

  const getTitleColorClass = () => {
    if (titleColor) return '';
    switch (titleColorMode) {
      case 'muted':
        return isLight ? 'text-neutral-500' : 'text-neutral-400';
      case 'primary':
        return isLight ? 'text-neutral-900' : 'text-neutral-100';
      case 'tone':
        if (tone === 'error') return isLight ? 'text-red-600' : 'text-red-400';
        if (tone === 'orange') return isLight ? 'text-orange-600' : 'text-orange-400';
        if (tone === 'warning') return isLight ? 'text-yellow-600' : 'text-yellow-400';
        return isLight ? 'text-neutral-600' : 'text-neutral-300';
      case 'content':
      default:
        // Harmonizes with body content text (text-neutral-600 in light, text-neutral-300 in dark)
        return isLight ? 'text-neutral-600' : 'text-neutral-300';
    }
  };

  // Measure widest button to enforce equal width
  useLayoutEffect(() => {
    if (!containerRef.current || buttons.length === 0) return;

    const btnElements = containerRef.current.querySelectorAll<HTMLButtonElement>('button[data-dialogue-btn="true"]');
    if (btnElements.length === 0) return;

    btnElements.forEach((btn) => {
      btn.style.width = 'auto';
    });

    let maxW = 0;
    btnElements.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      if (rect.width > maxW) maxW = rect.width;
    });

    if (maxW > 0) {
      setEqualButtonWidth(Math.ceil(Math.max(maxW, 92)));
    }
  }, [buttons, isLight, title, content, maxWidth, effectivePaddingX]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const btnElements = containerRef.current.querySelectorAll<HTMLButtonElement>('button[data-dialogue-btn="true"]');
      if (btnElements.length === 0) return;

      btnElements.forEach((btn) => {
        btn.style.width = 'auto';
      });

      let maxW = 0;
      btnElements.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        if (rect.width > maxW) maxW = rect.width;
      });

      if (maxW > 0) {
        setEqualButtonWidth(Math.ceil(Math.max(maxW, 92)));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [buttons]);

  const minHeightStyle = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
  const maxWidthStyle = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  const letterSpacingStyle = typeof titleLetterSpacing === 'number' ? `${titleLetterSpacing}px` : titleLetterSpacing;

  const renderButton = (btn: DialogueButtonConfig, index: number) => {
    const variant: DialogueButtonVariant =
      btn.variant ?? (index === 0 ? toneConfig.defaultButtonVariant : 'outline');

    let variantClasses = '';
    if (variant === 'primary') {
      variantClasses = isLight
        ? 'bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900 shadow-xs'
        : 'bg-white text-neutral-950 hover:bg-neutral-100 border-white shadow-xs';
    } else if (variant === 'danger') {
      variantClasses = isLight
        ? 'bg-red-600 text-white hover:bg-red-700 border-red-600 shadow-xs'
        : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/40 shadow-xs';
    } else {
      // outline
      variantClasses = isLight
        ? 'bg-transparent text-neutral-800 hover:bg-neutral-100/90 border-neutral-300'
        : 'bg-transparent text-neutral-200 hover:bg-white/10 border-neutral-700';
    }

    return (
      <button
        key={btn.key ?? `${btn.label}-${index}`}
        data-dialogue-btn="true"
        type="button"
        disabled={btn.disabled}
        onClick={btn.onClick}
        style={{
          width: equalButtonWidth ? `${equalButtonWidth}px` : undefined,
          fontFamily: MONO_FONT_STACK,
        }}
        className={`inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg border select-none transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:pointer-events-none truncate text-center ${variantClasses}`}
      >
        {btn.label}
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      data-component="dialogue"
      data-tone={tone}
      style={{
        minHeight: minHeightStyle,
        maxWidth: maxWidthStyle,
        paddingTop: `${effectivePaddingY}px`,
        paddingBottom: `${effectivePaddingY}px`,
        paddingLeft: `${effectivePaddingX}px`,
        paddingRight: `${effectivePaddingX}px`,
        boxShadow: combinedShadow,
        fontFamily: MONO_FONT_STACK,
      }}
      className={`relative w-full flex flex-col justify-between ${UI_RADIUS.xl} border transition-all duration-150 select-none ${
        isLight
          ? `bg-white text-neutral-900 ${toneConfig.cardBorderClass}`
          : `bg-neutral-900 text-neutral-100 ${toneConfig.cardBorderClass}`
      } ${className}`}
    >
      {/* Optional Top Right Close Icon */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-3.5 right-3.5 p-1 rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 ${
            isLight
              ? 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
              : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP: Centered Large Title with Separated Margin Bottom */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div 
        className="w-full shrink-0 flex items-center justify-center text-center px-2"
        style={{ marginBottom: `${effectiveTitleMarginBottom}px` }}
      >
        <h2
          style={{
            fontSize: `${titleFontSize}px`,
            letterSpacing: letterSpacingStyle,
            fontWeight: Number(titleFontWeight) || 800,
            color: titleColor || undefined,
          }}
          className={`text-center tracking-tight truncate leading-tight transition-colors ${getTitleColorClass()}`}
        >
          {title}
        </h2>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MIDDLE: Left Icon Vertically Centered with Right Multi-line Text */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div 
        className="flex-1 min-h-0 flex items-center gap-4 sm:gap-4.5 px-1"
        style={{ marginBottom: `${effectiveContentMarginBottom}px` }}
      >
        {/* Left Side: Icon Vertically Centered */}
        <div
          className={`shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center transition-transform ${toneConfig.iconContainerClass}`}
        >
          {icon ?? toneConfig.defaultIcon}
        </div>

        {/* Right Side: Multi-line Content */}
        <div className="flex-1 min-w-0 text-left">
          {typeof content === 'string' ? (
            <p
              className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal ${
                isLight ? 'text-neutral-600' : 'text-neutral-300'
              }`}
            >
              {content}
            </p>
          ) : (
            content
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. BOTTOM: Compact, Centered, Equal-length Buttons */}
      {/* ───────────────────────────────────────────────────────────── */}
      {buttons.length > 0 && (
        <div className="shrink-0 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-auto w-full">
          {buttons.map((btn, index) => renderButton(btn, index))}
        </div>
      )}
    </div>
  );
};

export interface DialogueModalProps extends DialogueProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Whether clicking overlay closes modal */
  closeOnClickOutside?: boolean;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  open,
  onClose,
  closeOnClickOutside = true,
  isLight = false,
  ...dialogueProps
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[800] flex items-center justify-center p-4 sm:p-6 select-none bg-black/65 backdrop-blur-[2px] transition-opacity duration-200"
      onClick={(e) => {
        if (closeOnClickOutside && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full flex items-center justify-center cursor-default animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Dialogue
          {...dialogueProps}
          isLight={isLight}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
