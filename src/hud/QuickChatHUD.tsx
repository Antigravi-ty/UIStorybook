import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickChatMessage } from './types';

export interface QuickChatHUDProps {
  messages: QuickChatMessage[];
  isLight?: boolean;
  className?: string;
}

export const QuickChatHUD: React.FC<QuickChatHUDProps> = ({
  messages = [],
  isLight = false,
  className = '',
}) => {
  return (
    <div
      data-ui-element="hud-quick-chat"
      className={`select-none pointer-events-none flex flex-col gap-1.5 max-w-[280px] ${className}`}
    >
      <AnimatePresence>
        {messages.slice(-4).map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-lg backdrop-blur-md text-xs ${
              isLight
                ? 'bg-white/85 border-neutral-300/80 text-neutral-900'
                : 'bg-neutral-950/75 border-neutral-800/80 text-white'
            }`}
          >
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-wider px-1 rounded ${
                msg.team === 'blue'
                  ? isLight
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : isLight
                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              }`}
            >
              {msg.team === 'blue' ? 'TEAM' : 'ALL'}
            </span>

            <span className={`font-semibold truncate max-w-[90px] ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
              {msg.sender}:
            </span>

            <span className={`font-bold truncate ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
              {msg.text}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
