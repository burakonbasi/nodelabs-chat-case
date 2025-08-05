import React, { useState, useCallback } from 'react';
import { User as UserIcon, Camera, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { User } from '../../types';

interface UserAvatarProps {
  user: Partial<User> & { name: string };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showStatus?: boolean;
  showPresence?: boolean;
  editable?: boolean;
  onAvatarChange?: (file: File) => Promise<void>;
  className?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-32 h-32 text-3xl'
};

const statusSizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
  '2xl': 'w-6 h-6'
};

const statusPositionClasses = {
  xs: '-bottom-0.5 -right-0.5 border',
  sm: '-bottom-0.5 -right-0.5 border',
  md: '-bottom-1 -right-1 border-2',
  lg: '-bottom-1 -right-1 border-2',
  xl: '-bottom-1.5 -right-1.5 border-2',
  '2xl': '-bottom-2 -right-2 border-4'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showStatus = false,
  showPresence = false,
  editable = false,
  onAvatarChange,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAvatarChange) return;

    setIsLoading(true);
    try {
      await onAvatarChange(file);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onAvatarChange]);

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get background color based on name
  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const statusColor = user.status === 'online' ? 'bg-green-500' :
                      user.status === 'away' ? 'bg-yellow-500' :
                      user.status === 'busy' ? 'bg-red-500' :
                      'bg-gray-400';

  const showAvatar = user.avatar && !imageError;
  const backgroundColor = getBackgroundColor(user.name);
  const initials = getInitials(user.name);

  return (
    <div className={cn('relative inline-block', className)}>
      {editable && onAvatarChange ? (
        <label className="cursor-pointer group">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            disabled={isLoading}
          />
          <div className={cn(
            'relative rounded-full overflow-hidden',
            sizeClasses[size]
          )}>
            {showAvatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={cn(
                'w-full h-full flex items-center justify-center text-white font-medium',
                backgroundColor
              )}>
                {initials}
              </div>
            )}
            
            {/* Edit Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              {isLoading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </label>
      ) : (
        <div className={cn(
          'rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          {showAvatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={cn(
              'w-full h-full flex items-center justify-center text-white font-medium',
              backgroundColor
            )}>
              {initials}
            </div>
          )}
        </div>
      )}

      {/* Status Indicator */}
      {showStatus && user.status && (
        <div className={cn(
          'absolute rounded-full border-white dark:border-gray-800',
          statusColor,
          statusSizeClasses[size],
          statusPositionClasses[size]
        )} />
      )}

      {/* Presence Indicator (for typing, recording, etc.) */}
      {showPresence && user.isTyping && (
        <div className={cn(
          'absolute flex items-center justify-center bg-primary-500 rounded-full',
          statusSizeClasses[size],
          statusPositionClasses[size]
        )}>
          <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Group Avatar Component
interface GroupAvatarProps {
  users: Array<Partial<User> & { name: string }>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  max?: number;
  className?: string;
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  users,
  size = 'md',
  max = 4,
  className
}) => {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const containerSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const avatarSizeMap = {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
    xl: 'lg'
  } as const;

  if (users.length === 0) {
    return (
      <div className={cn(
        'rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center',
        containerSizeClasses[size],
        className
      )}>
        <UserIcon className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  if (users.length === 1) {
    return <UserAvatar user={users[0]} size={size} className={className} />;
  }

  return (
    <div className={cn(
      'relative rounded-full bg-gray-100 dark:bg-gray-800',
      containerSizeClasses[size],
      className
    )}>
      <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-1">
        {displayUsers.slice(0, 4).map((user, index) => (
          <div
            key={user.id || index}
            className={cn(
              'relative',
              users.length === 2 && 'first:col-span-2 last:col-span-2',
              users.length === 3 && index === 0 && 'col-span-2'
            )}
          >
            <UserAvatar
              user={user}
              size={avatarSizeMap[size]}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
      
      {remainingCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <span className="text-white font-medium text-sm">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};