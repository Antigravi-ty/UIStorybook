import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  HelpCircle,
  X
} from 'lucide-react';
import { Button, type ButtonVariant } from './Button';
import { UI_RADIUS } from '../tokens/radius';

export type DialogueTone = 'error' | 'warning' | 'info' | 'success' | 'neutral';

export interface DialogueButtonConfig {
  key?: string;
  label: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
}

export interface DialogueProps {
  /** 大标题，居中显示 */
  title: string;
  /** 中间信息内容文本，位于右侧，支持多行 */
  content: React.ReactNode;
  /** 中间左侧图标，若不提供则根据整体颜色调性提供预设图标 */
  icon?: React.ReactNode;
  /** 整体颜色调性：深红 (error)、黄色 (warning)、正常/信息 (info)、成功 (success)、中性 (neutral) */
  tone?: DialogueTone;
  /** 底部操作按钮列表，居中紧凑排列，等长（以最长文本按钮为基准） */
  buttons?: DialogueButtonConfig[];
  /** 是否为亮色模式 */
  isLight?: boolean;
  /** 对话框最低高度，默认 200px */
  minHeight?: number | string;
  /** 对话框最大宽度，默认 460px */
  maxWidth?: number | string;
  /** 自定义外层样式类 */
  className?: string;
  /** 关闭回调（可选） */
  onClose?: () => void;
}

/**
 * 获取对应颜色调性的默认图标与色彩映射
 */
const getToneConfig = (tone: DialogueTone, isLight: boolean) => {
  switch (tone) {
    case 'error':
      return {
        defaultIcon: <AlertCircle className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-red-50 text-red-600 border border-red-200/80 ring-2 ring-red-500/10'
          : 'bg-red-950/70 text-red-400 border border-red-800/80 ring-2 ring-red-500/20',
        cardBorderClass: isLight
          ? 'border-red-200/70 shadow-[0_20px_50px_rgba(220,38,38,0.08)]'
          : 'border-red-900/50 shadow-[0_20px_50px_rgba(220,38,38,0.15)]',
        accentBadgeClass: isLight ? 'text-red-600' : 'text-red-400',
        defaultButtonVariant: 'danger' as ButtonVariant,
      };
    case 'warning':
      return {
        defaultIcon: <AlertTriangle className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-amber-50 text-amber-600 border border-amber-200/80 ring-2 ring-amber-500/10'
          : 'bg-amber-950/70 text-amber-400 border border-amber-800/80 ring-2 ring-amber-500/20',
        cardBorderClass: isLight
          ? 'border-amber-200/70 shadow-[0_20px_50px_rgba(217,119,6,0.08)]'
          : 'border-amber-900/50 shadow-[0_20px_50px_rgba(217,119,6,0.15)]',
        accentBadgeClass: isLight ? 'text-amber-600' : 'text-amber-400',
        defaultButtonVariant: 'primary' as ButtonVariant,
      };
    case 'success':
      return {
        defaultIcon: <CheckCircle2 className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 ring-2 ring-emerald-500/10'
          : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 ring-2 ring-emerald-500/20',
        cardBorderClass: isLight
          ? 'border-emerald-200/70 shadow-[0_20px_50px_rgba(5,150,105,0.08)]'
          : 'border-emerald-900/50 shadow-[0_20px_50px_rgba(5,150,105,0.15)]',
        accentBadgeClass: isLight ? 'text-emerald-600' : 'text-emerald-400',
        defaultButtonVariant: 'primary' as ButtonVariant,
      };
    case 'info':
      return {
        defaultIcon: <Info className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-sky-50 text-sky-600 border border-sky-200/80 ring-2 ring-sky-500/10'
          : 'bg-sky-950/70 text-sky-400 border border-sky-800/80 ring-2 ring-sky-500/20',
        cardBorderClass: isLight
          ? 'border-sky-200/60 shadow-[0_20px_50px_rgba(2,132,199,0.08)]'
          : 'border-sky-900/50 shadow-[0_20px_50px_rgba(2,132,199,0.15)]',
        accentBadgeClass: isLight ? 'text-sky-600' : 'text-sky-400',
        defaultButtonVariant: 'primary' as ButtonVariant,
      };
    case 'neutral':
    default:
      return {
        defaultIcon: <HelpCircle className="h-5 w-5" />,
        iconContainerClass: isLight
          ? 'bg-neutral-100 text-neutral-800 border border-neutral-200/90'
          : 'bg-neutral-800/80 text-neutral-200 border border-neutral-700/60',
        cardBorderClass: isLight
          ? 'border-neutral-200/90 shadow-2xl'
          : 'border-neutral-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)]',
        accentBadgeClass: isLight ? 'text-neutral-800' : 'text-neutral-200',
        defaultButtonVariant: 'primary' as ButtonVariant,
      };
  }
};

/**
 * Dialogue 弹窗对话框核心表现组件
 *
 * 视觉特征：
 * - 纯净三段式：上（大标题居中）、中（左侧图标 + 右侧多行正文）、下（居中紧凑等长按钮组）
 * - 无显式分割线：绝不渲染 border-b / border-t 分割线条，浑然一体
 * - 最低高度保障：具备 min-height 保证稳重平衡
 * - 智能等宽按钮：自动测算最长文本按键尺寸，使所有按键等宽紧凑居中
 */
export const Dialogue: React.FC<DialogueProps> = ({
  title,
  content,
  icon,
  tone = 'info',
  buttons = [{ label: '确定', variant: 'primary' }],
  isLight = false,
  minHeight = 210,
  maxWidth = 460,
  className = '',
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [equalButtonWidth, setEqualButtonWidth] = useState<number | null>(null);

  const toneConfig = getToneConfig(tone, isLight);

  // 动态测量最长按钮宽度并强制等宽对齐
  useLayoutEffect(() => {
    if (!containerRef.current || buttons.length === 0) return;

    const btnElements = containerRef.current.querySelectorAll<HTMLButtonElement>('button[data-dialogue-btn="true"]');
    if (btnElements.length === 0) return;

    // 先重置为 auto 测量各按键自然宽度
    btnElements.forEach((btn) => {
      btn.style.width = 'auto';
    });

    let maxW = 0;
    btnElements.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      if (rect.width > maxW) {
        maxW = rect.width;
      }
    });

    if (maxW > 0) {
      // 至少保证 92px 的舒适按键点击区
      const targetWidth = Math.ceil(Math.max(maxW, 92));
      setEqualButtonWidth(targetWidth);
    }
  }, [buttons, isLight, title, content, maxWidth]);

  // 监听窗口尺寸变化以保持等长计算精确
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

  return (
    <div
      ref={containerRef}
      data-component="dialogue"
      data-tone={tone}
      style={{
        minHeight: minHeightStyle,
        maxWidth: maxWidthStyle,
      }}
      className={`relative w-full flex flex-col justify-between p-6 sm:p-7 ${UI_RADIUS.xl} border transition-all duration-150 select-none ${
        isLight
          ? `bg-white text-neutral-900 ${toneConfig.cardBorderClass}`
          : `bg-neutral-900 text-neutral-100 ${toneConfig.cardBorderClass}`
      } ${className}`}
    >
      {/* 可选右上角轻量快速关闭小叉（不形成分割线） */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 ${
            isLight
              ? 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
              : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. 上段：大标题居中 (无任何分割线) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="w-full shrink-0 flex items-center justify-center text-center px-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-center truncate">
          {title}
        </h2>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. 中段：左右两半布局 (左侧左对齐图标，右侧多行正文信息，无任何分割线) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex items-start gap-4 sm:gap-4.5 my-4 sm:my-5 px-1">
        {/* 左侧：左对齐图标容器 */}
        <div
          className={`shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center transition-transform ${toneConfig.iconContainerClass}`}
        >
          {icon ?? toneConfig.defaultIcon}
        </div>

        {/* 右侧：多行文本信息内容 */}
        <div className="flex-1 min-w-0 text-left">
          {typeof content === 'string' ? (
            <p
              className={`text-sm leading-relaxed whitespace-pre-line font-normal ${
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
      {/* 3. 下段：按钮组 (居中紧凑，等长，以最长按键为准，无任何分割线) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {buttons.length > 0 && (
        <div className="shrink-0 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-auto pt-1 w-full">
          {buttons.map((btn, index) => {
            const variant: ButtonVariant =
              btn.variant ??
              (index === 0 ? toneConfig.defaultButtonVariant : 'secondary');

            return (
              <Button
                key={btn.key ?? `${btn.label}-${index}`}
                data-dialogue-btn="true"
                variant={variant}
                size="md"
                isLight={isLight}
                disabled={btn.disabled}
                onClick={btn.onClick}
                style={{
                  width: equalButtonWidth ? `${equalButtonWidth}px` : undefined,
                }}
                className="justify-center truncate text-center font-medium"
              >
                {btn.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface DialogueModalProps extends DialogueProps {
  /** 模态弹窗是否打开 */
  open: boolean;
  /** 关闭模态弹窗的回调 */
  onClose: () => void;
  /** 点击遮罩层是否允许关闭，默认 true */
  closeOnClickOutside?: boolean;
}

/**
 * DialogueModal 居中全屏模态弹窗包装器
 *
 * 规范：
 * - 强制居中，不能调整位置 (fixed inset-0 flex items-center justify-center)
 * - 包含平滑变暗遮罩 (bg-black/65)
 * - 支持 ESC 键与点击背景退出
 */
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
