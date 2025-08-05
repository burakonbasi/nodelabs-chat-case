import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface QuickReactionsProps {
  onReact: (emoji: string) => void;
  position?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
  defaultEmojis?: string[];
  recentEmojis?: string[];
  maxRecent?: number;
  className?: string;
}

const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const QuickReactions: React.FC<QuickReactionsProps> = ({
  onReact,
  position = 'top',
  align = 'center',
  defaultEmojis = DEFAULT_EMOJIS,
  recentEmojis = [],
  maxRecent = 3,
  className = '',
}) => {
  const [showMore, setShowMore] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  // Combine recent and default emojis, removing duplicates
  const quickEmojis = [
    ...recentEmojis.slice(0, maxRecent),
    ...defaultEmojis.filter(emoji => !recentEmojis.includes(emoji)),
  ].slice(0, 6);

  const handleReact = (emoji: string) => {
    onReact(emoji);
    setShowMore(false);
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };

  const alignClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Quick Reactions Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`
          absolute z-10
          ${positionClasses[position]}
          ${alignClasses[align]}
          flex items-center gap-1 p-1
          bg-white dark:bg-gray-800
          rounded-full shadow-lg
          border border-gray-200 dark:border-gray-700
        `}
      >
        {/* Quick Emoji Buttons */}
        {quickEmojis.map((emoji, index) => (
          <motion.button
            key={emoji}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleReact(emoji)}
            onMouseEnter={() => setHoveredEmoji(emoji)}
            onMouseLeave={() => setHoveredEmoji(null)}
            className={`
              relative p-2 rounded-full
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-all duration-200
              ${hoveredEmoji === emoji ? 'scale-125' : ''}
            `}
          >
            <span className="text-xl">{emoji}</span>
            
            {/* Tooltip */}
            <AnimatePresence>
              {hoveredEmoji === emoji && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className={`
                    absolute ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
                    left-1/2 -translate-x-1/2
                    px-2 py-1 bg-gray-900 text-white text-xs rounded
                    whitespace-nowrap pointer-events-none
                  `}
                >
                  {getEmojiName(emoji)}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}

        {/* More Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: quickEmojis.length * 0.05 }}
          onClick={() => setShowMore(!showMore)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </motion.div>

      {/* Extended Emoji Picker */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
              absolute z-20
              ${position === 'top' ? 'bottom-full mb-16' : 'top-full mt-16'}
              ${alignClasses[align]}
              p-3 bg-white dark:bg-gray-800
              rounded-lg shadow-xl
              border border-gray-200 dark:border-gray-700
            `}
          >
            <EmojiGrid onSelect={handleReact} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Emoji Grid Component
interface EmojiGridProps {
  onSelect: (emoji: string) => void;
}

const EmojiGrid: React.FC<EmojiGridProps> = ({ onSelect }) => {
  const categories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌', '👐', '🤲', '🙏', '✋', '🖐', '👋', '🤚', '💪'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'],
    'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍅', '🥑', '🍔', '🍕', '🌭', '🍿', '🍩', '🍪'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🎮', '🎯', '🎲', '🎻', '🎸', '🎺'],
  };

  return (
    <div className="w-80 max-h-96 overflow-y-auto">
      {Object.entries(categories).map(([category, emojis]) => (
        <div key={category} className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {category}
          </h3>
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-xl">{emoji}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to get emoji names
function getEmojiName(emoji: string): string {
  const emojiNames: Record<string, string> = {
    '👍': 'Thumbs up',
    '❤️': 'Heart',
    '😂': 'Laughing',
    '😮': 'Surprised',
    '😢': 'Sad',
    '🙏': 'Pray',
    '😀': 'Happy',
    '😡': 'Angry',
    '🥰': 'Love',
    '🎉': 'Celebrate',
    '🔥': 'Fire',
    '💯': 'Perfect',
  };
  
  return emojiNames[emoji] || 'Emoji';
}

// Reaction Animation Component
interface ReactionAnimationProps {
  emoji: string;
  onComplete?: () => void;
}

export const ReactionAnimation: React.FC<ReactionAnimationProps> = ({
  emoji,
  onComplete,
}) => {
  return (
    <motion.div
      initial={{ scale: 0, y: 0, opacity: 1 }}
      animate={{ 
        scale: [0, 1.5, 1],
        y: [0, -20, -40],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 1 }}
      onAnimationComplete={onComplete}
      className="absolute z-50 pointer-events-none"
    >
      <span className="text-3xl">{emoji}</span>
    </motion.div>
  );
};