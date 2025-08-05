// src/components/common/Skeleton.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  count?: number;
  spacing?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  count = 1,
  spacing = 8,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const getSize = () => {
    switch (variant) {
      case 'text':
        return {
          width: width || '100%',
          height: height || '1.2em',
        };
      case 'circular':
        return {
          width: width || '40px',
          height: height || width || '40px',
        };
      case 'rectangular':
      case 'rounded':
        return {
          width: width || '100%',
          height: height || '120px',
        };
      default:
        return {
          width: width || '100%',
          height: height || '20px',
        };
    }
  };

  const size = getSize();

  const skeletonElement = (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={{
        width: typeof size.width === 'number' ? `${size.width}px` : size.width,
        height: typeof size.height === 'number' ? `${size.height}px` : size.height,
      }}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{ marginBottom: index < count - 1 ? spacing : 0 }}
        >
          {skeletonElement}
        </div>
      ))}
    </div>
  );
};

// Specialized skeleton components for common use cases
export const SkeletonText: React.FC<{
  lines?: number;
  spacing?: number;
  className?: string;
}> = ({ lines = 3, spacing = 8, className }) => (
  <Skeleton
    variant="text"
    count={lines}
    spacing={spacing}
    className={className}
  />
);

export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  return (
    <Skeleton
      variant="circular"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  );
};

export const SkeletonButton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}> = ({ size = 'md', fullWidth = false, className }) => {
  const sizes = {
    sm: { width: 80, height: 32 },
    md: { width: 100, height: 40 },
    lg: { width: 120, height: 48 },
  };

  return (
    <Skeleton
      variant="rounded"
      width={fullWidth ? '100%' : sizes[size].width}
      height={sizes[size].height}
      className={className}
    />
  );
};

export const SkeletonCard: React.FC<{
  showMedia?: boolean;
  showActions?: boolean;
  className?: string;
}> = ({ showMedia = true, showActions = true, className }) => {
  return (
    <div className={`rounded-lg ${className}`}>
      {showMedia && (
        <Skeleton variant="rectangular" height={200} className="rounded-t-lg" />
      )}
      <div className="p-4">
        <Skeleton variant="text" width="60%" className="mb-2" />
        <Skeleton variant="text" count={3} spacing={8} />
        {showActions && (
          <div className="flex gap-2 mt-4">
            <SkeletonButton size="sm" />
            <SkeletonButton size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export const SkeletonListItem: React.FC<{
  showAvatar?: boolean;
  showSecondaryText?: boolean;
  showAction?: boolean;
  className?: string;
}> = ({
  showAvatar = true,
  showSecondaryText = true,
  showAction = false,
  className,
}) => {
  return (
    <div className={`flex items-center gap-3 p-4 ${className}`}>
      {showAvatar && <SkeletonAvatar />}
      <div className="flex-1">
        <Skeleton variant="text" width="40%" className="mb-1" />
        {showSecondaryText && (
          <Skeleton variant="text" width="60%" height="0.875em" />
        )}
      </div>
      {showAction && <Skeleton variant="circular" width={24} height={24} />}
    </div>
  );
};

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}> = ({ rows = 5, columns = 4, showHeader = true, className }) => {
  return (
    <div className={`w-full ${className}`}>
      {showHeader && (
        <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={`${100 / columns}%`}
              height="1em"
            />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              width={`${100 / columns}%`}
              height="1em"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Chat-specific skeleton components
export const SkeletonMessage: React.FC<{
  isOwn?: boolean;
  showAvatar?: boolean;
  className?: string;
}> = ({ isOwn = false, showAvatar = true, className }) => {
  return (
    <div
      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} ${className}`}
    >
      {showAvatar && <SkeletonAvatar size="sm" />}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <Skeleton
          variant="rounded"
          width={200}
          height={60}
          className="mb-1"
        />
        <Skeleton variant="text" width={80} height="0.75em" />
      </div>
    </div>
  );
};

export const SkeletonConversation: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={`flex items-center gap-3 p-4 ${className}`}>
      <SkeletonAvatar size="lg" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60px" height="0.875em" />
        </div>
        <Skeleton variant="text" width="80%" height="0.875em" />
      </div>
    </div>
  );
};

// Animated gradient skeleton
export const SkeletonGradient: React.FC<SkeletonProps> = (props) => {
  return (
    <div className="relative overflow-hidden">
      <Skeleton {...props} animation="none" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['0%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          transform: 'translateX(-100%)',
        }}
      />
    </div>
  );
};

// Add wave animation styles
const waveStyles = `
  @keyframes skeleton-wave {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .skeleton-wave {
    background: linear-gradient(
      90deg,
      rgba(156, 163, 175, 0.1) 0%,
      rgba(156, 163, 175, 0.3) 50%,
      rgba(156, 163, 175, 0.1) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-wave 1.5s ease-in-out infinite;
  }

  .dark .skeleton-wave {
    background: linear-gradient(
      90deg,
      rgba(55, 65, 81, 0.3) 0%,
      rgba(55, 65, 81, 0.5) 50%,
      rgba(55, 65, 81, 0.3) 100%
    );
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = waveStyles;
  document.head.appendChild(styleSheet);
}