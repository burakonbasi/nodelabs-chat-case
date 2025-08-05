import React from 'react';
import { Clock, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/date';
import type { UserStatus as UserStatusType } from '../../types';

interface UserStatusProps {
  status?: UserStatusType;
  lastSeen?: Date;
  isTyping?: boolean;
  showLabel?: boolean;
  showLastSeen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  online: {
    label: 'Online',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    icon: Circle
  },
  away: {
    label: 'Away',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    icon: Clock
  },
  busy: {
    label: 'Busy',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    icon: Circle
  },
  offline: {
    label: 'Offline',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
    icon: Circle
  }
};

const sizeClasses = {
  sm: {
    dot: 'w-2 h-2',
    icon: 'w-3 h-3',
    text: 'text-xs',
    gap: 'gap-1.5'
  },
  md: {
    dot: 'w-2.5 h-2.5',
    icon: 'w-4 h-4',
    text: 'text-sm',
    gap: 'gap-2'
  },
  lg: {
    dot: 'w-3 h-3',
    icon: 'w-5 h-5',
    text: 'text-base',
    gap: 'gap-2.5'
  }
};

export const UserStatus: React.FC<UserStatusProps> = ({
  status = 'offline',
  lastSeen,
  isTyping,
  showLabel = false,
  showLastSeen = false,
  size = 'md',
  className
}) => {
  const config = statusConfig[status];
  const sizes = sizeClasses[size];

  if (isTyping) {
    return (
      <div className={cn('flex items-center', sizes.gap, className)}>
        <div className="flex items-center gap-0.5">
          <div className={cn('rounded-full bg-primary-500', sizes.dot, 'animate-bounce')} 
               style={{ animationDelay: '0ms' }} />
          <div className={cn('rounded-full bg-primary-500', sizes.dot, 'animate-bounce')} 
               style={{ animationDelay: '150ms' }} />
          <div className={cn('rounded-full bg-primary-500', sizes.dot, 'animate-bounce')} 
               style={{ animationDelay: '300ms' }} />
        </div>
        {showLabel && (
          <span className={cn('text-primary-500 font-medium', sizes.text)}>
            Typing...
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', sizes.gap, className)}>
      <div className={cn('rounded-full', config.bgColor, sizes.dot)} />
      
      {showLabel && (
        <span className={cn(config.color, sizes.text)}>
          {status === 'offline' && showLastSeen && lastSeen
            ? `Last seen ${formatRelativeTime(lastSeen)}`
            : config.label}
        </span>
      )}
    </div>
  );
};

// User Presence Component (combines avatar with status)
interface UserPresenceProps {
  user: {
    name: string;
    avatar?: string;
    status?: UserStatusType;
    lastSeen?: Date;
    isTyping?: boolean;
  };
  showName?: boolean;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserPresence: React.FC<UserPresenceProps> = ({
  user,
  showName = true,
  showStatus = true,
  size = 'md',
  className
}) => {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const subtextSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div>
        {showName && (
          <p className={cn('font-medium', textSizes[size])}>
            {user.name}
          </p>
        )}
        {showStatus && (
          <UserStatus
            status={user.status}
            lastSeen={user.lastSeen}
            isTyping={user.isTyping}
            showLabel
            showLastSeen
            size="sm"
            className={cn('mt-0.5', subtextSizes[size])}
          />
        )}
      </div>
    </div>
  );
};

// Status Selector Component
interface StatusSelectorProps {
  currentStatus: UserStatusType;
  onStatusChange: (status: UserStatusType) => void;
  className?: string;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  className
}) => {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2', className)}>
      {(Object.keys(statusConfig) as UserStatusType[]).map((status) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const isSelected = currentStatus === status;

        return (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isSelected
                ? 'bg-gray-100 dark:bg-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            )}
          >
            <Icon className={cn('w-4 h-4', config.color)} />
            <span className="font-medium">{config.label}</span>
            {isSelected && (
              <Circle className="w-2 h-2 ml-auto fill-current text-primary-500" />
            )}
          </button>
        );
      })}
    </div>
  );
};

// Custom Status Component
interface CustomStatusProps {
  emoji?: string;
  text?: string;
  duration?: string;
  onClear?: () => void;
  className?: string;
}

export const CustomStatus: React.FC<CustomStatusProps> = ({
  emoji,
  text,
  duration,
  onClear,
  className
}) => {
  if (!emoji && !text) return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full',
      className
    )}>
      {emoji && <span className="text-lg">{emoji}</span>}
      {text && <span className="text-sm">{text}</span>}
      {duration && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          • {duration}
        </span>
      )}
      {onClear && (
        <button
          onClick={onClear}
          className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};