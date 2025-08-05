import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UnreadBadgeProps {
  count: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  pulse?: boolean;
  muted?: boolean;
  className?: string;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({
  count,
  max = 99,
  size = 'md',
  variant = 'primary',
  pulse = false,
  muted = false,
  className = '',
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const sizeClasses = {
    xs: 'min-w-[16px] h-4 text-xs px-1',
    sm: 'min-w-[20px] h-5 text-xs px-1.5',
    md: 'min-w-[24px] h-6 text-sm px-2',
    lg: 'min-w-[28px] h-7 text-base px-2.5',
  };

  const variantClasses = {
    primary: muted 
      ? 'bg-gray-400 text-white' 
      : 'bg-primary-500 text-white',
    secondary: muted 
      ? 'bg-gray-400 text-white' 
      : 'bg-gray-500 text-white',
    success: muted 
      ? 'bg-gray-400 text-white' 
      : 'bg-green-500 text-white',
    warning: muted 
      ? 'bg-gray-400 text-white' 
      : 'bg-yellow-500 text-white',
    danger: muted 
      ? 'bg-gray-400 text-white' 
      : 'bg-red-500 text-white',
  };

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 30 
        }}
        className={`
          inline-flex items-center justify-center
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-full font-medium
          ${pulse && !muted ? 'animate-pulse' : ''}
          ${className}
        `}
      >
        {displayCount}
      </motion.span>
    </AnimatePresence>
  );
};

// Chat-specific unread indicator with message preview
interface ChatUnreadIndicatorProps {
  count: number;
  lastMessage?: string;
  showPreview?: boolean;
  className?: string;
}

export const ChatUnreadIndicator: React.FC<ChatUnreadIndicatorProps> = ({
  count,
  lastMessage,
  showPreview = false,
  className = '',
}) => {
  if (count <= 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showPreview && lastMessage && (
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]"
        >
          {lastMessage}
        </motion.span>
      )}
      <UnreadBadge count={count} variant="primary" size="sm" />
    </div>
  );
};

// Unread separator line
interface UnreadSeparatorProps {
  count?: number;
  className?: string;
}

export const UnreadSeparator: React.FC<UnreadSeparatorProps> = ({
  count,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0, scaleX: 0 }}
      className={`relative flex items-center my-4 ${className}`}
    >
      <div className="flex-1 h-px bg-red-300 dark:bg-red-700" />
      <span className="px-3 text-sm font-medium text-red-500 dark:text-red-400 bg-white dark:bg-gray-900">
        {count ? `${count} unread messages` : 'Unread messages'}
      </span>
      <div className="flex-1 h-px bg-red-300 dark:bg-red-700" />
    </motion.div>
  );
};

// Floating unread button (scroll to unread)
interface FloatingUnreadButtonProps {
  count: number;
  onClick: () => void;
  position?: 'top' | 'bottom';
  className?: string;
}

export const FloatingUnreadButton: React.FC<FloatingUnreadButtonProps> = ({
  count,
  onClick,
  position = 'top',
  className = '',
}) => {
  if (count <= 0) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        absolute ${position === 'top' ? 'top-4' : 'bottom-4'} right-4
        flex items-center gap-2 px-4 py-2
        bg-white dark:bg-gray-800 rounded-full
        shadow-lg border border-gray-200 dark:border-gray-700
        hover:shadow-xl transition-all
        ${className}
      `}
    >
      <span className="text-sm font-medium">
        {count} new {count === 1 ? 'message' : 'messages'}
      </span>
      <svg
        className={`w-4 h-4 ${position === 'top' ? '' : 'rotate-180'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </motion.button>
  );
};

// Mention badge (for @mentions)
interface MentionBadgeProps {
  count: number;
  className?: string;
}

export const MentionBadge: React.FC<MentionBadgeProps> = ({
  count,
  className = '',
}) => {
  if (count <= 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300
        rounded-full text-xs font-medium
        ${className}
      `}
    >
      <span>@</span>
      <span>{count}</span>
    </motion.div>
  );
};