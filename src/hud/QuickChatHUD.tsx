import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickChatMessage } from './types';
import { MessageSquare } from 'lucide-react';

export interface QuickChatHUDProps {
  messages: QuickChatMessage[];
  className?: string;
}

export const QuickChatHUD: React.FC<QuickChatHUDProps> = ({
  messages = [],
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950/75 border border-neutral-800/80 text-white shadow-lg backdrop-blur-md text-xs"
          >
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-wider px-1 rounded ${
                msg.team === 'blue'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              }`}
            >
              {msg.team === 'blue' ? 'TEAM' : 'ALL'}
            </span>

            <span className="font-semibold text-neutral-300 truncate max-w-[90px]">
              {msg.sender}:
            </span>

            <span className="font-bold text-neutral-100 truncate">
              {msg.text}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
