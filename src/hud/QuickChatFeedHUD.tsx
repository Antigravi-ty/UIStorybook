import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { QuickChatMessage } from './types';
import { UI_EASING } from '../tokens/easing';

export interface QuickChatFeedHUDProps {
  messages: QuickChatMessage[];
  isLight?: boolean;
  className?: string;
}

export const QuickChatFeedHUD: React.FC<QuickChatFeedHUDProps> = ({
  messages,
  isLight = false,
  className = '',
}) => {
  return (
    <div
      data-ui-element="hud-quickchat-feed"
      data-hud-component="quick-chat"
      className={`pointer-events-none select-none flex flex-col gap-1.5 max-w-xs ${className}`}
    >
      <AnimatePresence initial={false}>
        {messages.slice(-5).map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            transition={UI_EASING.spring.snappy}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-md shadow-md text-xs font-mono transition-colors ${
              msg.team === 'orange'
                ? isLight
                  ? 'bg-orange-500/15 border-orange-500/50 text-orange-950 shadow-orange-500/10'
                  : 'bg-orange-950/75 border-orange-500/40 text-orange-200 shadow-orange-900/30'
                : isLight
                ? 'bg-blue-500/15 border-blue-500/50 text-blue-950 shadow-blue-500/10'
                : 'bg-blue-950/75 border-blue-500/40 text-blue-200 shadow-blue-900/30'
            }`}
          >
            <span
              className={`font-black shrink-0 ${
                msg.team === 'orange'
                  ? isLight
                    ? 'text-orange-700'
                    : 'text-orange-300'
                  : isLight
                  ? 'text-blue-700'
                  : 'text-blue-300'
              }`}
            >
              {msg.sender}:
            </span>
            <span
              className={`font-semibold ${
                isLight ? 'text-neutral-900' : 'text-white'
              }`}
            >
              {msg.text}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
