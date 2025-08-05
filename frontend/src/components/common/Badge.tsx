import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'square' | 'pill';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  animate?: boolean;
  pulse?: boolean;
  outline?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  dot = false,
  removable = false,
  onRemove,
  icon,
  animate = true,
  pulse = false,
  outline = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-sm',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const shapeClasses = {
    rounded: 'rounded',
    square: 'rounded-none',
    pill: 'rounded-full',
  };

  const variantClasses = {
    default: outline
      ? 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    primary: outline
      ? 'bg-transparent border border-primary-500 text-primary-600 dark:text-primary-400'
      : 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
    secondary: outline
      ? 'bg-transparent border border-gray-500 text-gray-600 dark:text-gray-400'
      : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200',
    success: outline
      ? 'bg-transparent border border-green-500 text-green-600 dark:text-green-400'
      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warning: outline
      ? 'bg-transparent border border-yellow-500 text-yellow-600 dark:text-yellow-400'
      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    danger: outline
      ? 'bg-transparent border border-red-500 text-red-600 dark:text-red-400'
      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    info: outline
      ? 'bg-transparent border border-blue-500 text-blue-600 dark:text-blue-400'
      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  };

  const content = (
    <span
      className={`
        inline-flex items-center font-medium
        ${sizeClasses[size]}
        ${shapeClasses[shape]}
        ${variantClasses[variant]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            -ml-0.5 mr-1.5 h-2 w-2 rounded-full
            ${variant === 'default' ? 'bg-gray-500' : 'bg-current'}
          `}
        />
      )}
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1.5 -mr-0.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="inline-block"
    >
      {content}
    </motion.div>
  );
};

// Notification Badge (for icons)
interface NotificationBadgeProps {
  count?: number;
  dot?: boolean;
  max?: number;
  showZero?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  offset?: { x?: number; y?: number };
  children: React.ReactNode;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  dot = false,
  max = 99,
  showZero = false,
  color = 'danger',
  position = 'top-right',
  size = 'md',
  pulse = false,
  offset = { x: 0, y: 0 },
  children,
  className = '',
}) => {
  const shouldShow = dot || count > 0 || showZero;
  const displayCount = count > max ? `${max}+` : count;

  const sizeClasses = {
    sm: dot ? 'w-2 h-2' : 'min-w-[16px] h-4 text-xs px-1',
    md: dot ? 'w-2.5 h-2.5' : 'min-w-[20px] h-5 text-xs px-1.5',
    lg: dot ? 'w-3 h-3' : 'min-w-[24px] h-6 text-sm px-2',
  };

  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  };

  const colorClasses = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <AnimatePresence>
        {shouldShow && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`
              absolute flex items-center justify-center
              ${sizeClasses[size]}
              ${positionClasses[position]}
              ${colorClasses[color]}
              rounded-full font-medium
              ${pulse ? 'animate-pulse' : ''}
              ${!dot ? 'border-2 border-white dark:border-gray-900' : ''}
              transform translate-x-1/2 -translate-y-1/2
            `}
            style={{
              right: offset.x,
              top: offset.y,
            }}
          >
            {!dot && displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

// Status Badge
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'dnd';
  size?: 'sm' | 'md' | 'lg';
  withLabel?: boolean;
  pulse?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  withLabel = false,
  pulse = false,
  position,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusConfig = {
    online: {
      color: 'bg-green-500',
      label: 'Online',
    },
    offline: {
      color: 'bg-gray-400',
      label: 'Offline',
    },
    away: {
      color: 'bg-yellow-500',
      label: 'Away',
    },
    busy: {
      color: 'bg-red-500',
      label: 'Busy',
    },
    dnd: {
      color: 'bg-red-600',
      label: 'Do Not Disturb',
    },
  };

  const config = statusConfig[status];

  if (withLabel) {
    return (
      <Badge
        variant={status === 'online' ? 'success' : status === 'offline' ? 'default' : 'warning'}
        size="sm"
        dot
        className={className}
      >
        {config.label}
      </Badge>
    );
  }

  const badge = (
    <span
      className={`
        block rounded-full
        ${sizeClasses[size]}
        ${config.color}
        ${pulse && status === 'online' ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );

  if (position) {
    const positionClasses = {
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
    };

    return (
      <span
        className={`
          absolute
          ${positionClasses[position]}
          transform translate-x-1/4 -translate-y-1/4
        `}
      >
        {badge}
      </span>
    );
  }

  return badge;
};

// Label Badge (for tags)
interface LabelBadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  icon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export const LabelBadge: React.FC<LabelBadgeProps> = ({
  label,
  color = '#e5e7eb',
  textColor = '#374151',
  icon,
  onRemove,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium
        ${className}
      `}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      {icon}
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 -mr-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

// Badge Group
interface BadgeGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  max,
  className = '',
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray;
  const hiddenCount = max ? childrenArray.length - max : 0;

  return (
    <div className={`inline-flex items-center flex-wrap gap-1.5 ${className}`}>
      {visibleChildren}
      {hiddenCount > 0 && (
        <Badge variant="default" size="sm">
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
};