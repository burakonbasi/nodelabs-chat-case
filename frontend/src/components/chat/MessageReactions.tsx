import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';

interface Reaction {
  emoji: string;
  users: string[];
}

interface MessageReactionsProps {
  reactions: Reaction[];
  messageId: string;
  isOwn: boolean;
}

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function MessageReactions({ reactions, messageId, isOwn }: MessageReactionsProps) {
  const user = useAuthStore((state) => state.user);
  const { addReaction, removeReaction } = useChatStore();

  const handleReaction = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    const hasReacted = existingReaction?.users.includes(user?._id || '');

    if (hasReacted) {
      removeReaction?.(messageId, emoji);
    } else {
      addReaction?.(messageId, emoji);
    }
  };

  return (
    <div className={cn(
      'absolute -bottom-6 flex items-center gap-1',
      isOwn ? 'right-0' : 'left-0'
    )}>
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg px-1 py-0.5">
        {reactions.map((reaction) => {
          const hasReacted = reaction.users.includes(user?._id || '');
          
          return (
            <motion.button
              key={reaction.emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReaction(reaction.emoji)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors',
                hasReacted 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <span>{reaction.emoji}</span>
              {reaction.users.length > 1 && (
                <span className={cn(
                  'text-xs font-medium',
                  hasReacted 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400'
                )}>
                  {reaction.users.length}
                </span>
              )}
            </motion.button>
          );
        })}
        
        {/* Add reaction button */}
        <div className="group relative">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <span className="text-gray-400 dark:text-gray-500">+</span>
          </button>
          
          {/* Quick reactions popup */}
          <div className="absolute bottom-full left-0 mb-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-1">
              {quickReactions.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(emoji)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <span className="text-lg">{emoji}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 