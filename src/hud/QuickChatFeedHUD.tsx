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
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-md shadow-md text-xs font-mono ${
              msg.team === 'orange'
                ? 'bg-orange-950/75 border-orange-500/40 text-orange-200'
                : 'bg-blue-950/75 border-blue-500/40 text-blue-200'
            }`}
          >
            <span className="font-bold shrink-0">{msg.sender}:</span>
            <span className="text-white font-medium">{msg.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
