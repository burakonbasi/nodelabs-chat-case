import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import userService from '../../services/userService';

interface OnlineIndicatorProps {
  user?: User;
  isOnline?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLabel?: boolean;
  pulse?: boolean;
  className?: string;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  user,
  isOnline: isOnlineProp,
  size = 'md',
  position = 'bottom-right',
  showLabel = false,
  pulse = true,
  className = '',
}) => {
  const isOnline = isOnlineProp ?? (user ? userService.isUserOnline(user.lastSeen) : false);

  if (!isOnline && !showLabel) return null;

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  };

  const ringSize = {
    xs: 'ring-1',
    sm: 'ring-2',
    md: 'ring-2',
    lg: 'ring-[3px]',
  };

  if (showLabel) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span
          className={`
            ${sizeClasses[size]}
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
            rounded-full
            ${pulse && isOnline ? 'animate-pulse' : ''}
          `}
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isOnline ? 'Active now' : user ? userService.formatLastSeen(user.lastSeen) : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        absolute ${positionClasses[position]}
        ${sizeClasses[size]}
        bg-green-500 rounded-full
        ${ringSize[size]} ring-white dark:ring-gray-800
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );
};

// Group online indicator showing multiple users
interface GroupOnlineIndicatorProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GroupOnlineIndicator: React.FC<GroupOnlineIndicatorProps> = ({
  users,
  max = 3,
  size = 'md',
  className = '',
}) => {
  const onlineUsers = users.filter(user => userService.isUserOnline(user.lastSeen));
  const displayUsers = onlineUsers.slice(0, max);
  const remaining = onlineUsers.length - max;

  if (onlineUsers.length === 0) return null;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const overlapClasses = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {displayUsers.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative ${sizeClasses[size]}
            rounded-full overflow-hidden
            ring-2 ring-white dark:ring-gray-800
            ${index > 0 ? overlapClasses[size] : ''}
          `}
          style={{ zIndex: displayUsers.length - index }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName || user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-medium">
              {userService.getUserInitials(user)}
            </div>
          )}
          <OnlineIndicator size="xs" position="bottom-right" />
        </motion.div>
      ))}
      
      {remaining > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: displayUsers.length * 0.1 }}
          className={`
            ${sizeClasses[size]} ${overlapClasses[size]}
            bg-gray-200 dark:bg-gray-700
            rounded-full flex items-center justify-center
            ring-2 ring-white dark:ring-gray-800
            font-medium text-gray-600 dark:text-gray-300
          `}
        >
          +{remaining}
        </motion.div>
      )}
    </div>
  );
};

// Typing indicator with online status
interface TypingWithOnlineProps {
  users: User[];
  className?: string;
}

export const TypingWithOnline: React.FC<TypingWithOnlineProps> = ({
  users,
  className = '',
}) => {
  const typingUsers = users.slice(0, 3);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        {typingUsers.map((user) => (
          <div
            key={user.id}
            className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                {userService.getUserInitials(user)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
      
      {users.length > 3 && (
        <span className="text-xs text-gray-500">
          and {users.length - 3} more
        </span>
      )}
    </div>
  );
};

// Status text component
interface OnlineStatusTextProps {
  user: User;
  showOnlineStatus?: boolean;
  className?: string;
}

export const OnlineStatusText: React.FC<OnlineStatusTextProps> = ({
  user,
  showOnlineStatus = true,
  className = '',
}) => {
  const isOnline = userService.isUserOnline(user.lastSeen);

  return (
    <span className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {showOnlineStatus && isOnline ? (
        <span className="text-green-500">Online</span>
      ) : (
        userService.formatLastSeen(user.lastSeen)
      )}
    </span>
  );
};