import React from 'react';
import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white' | 'current';
  variant?: 'circle' | 'dots' | 'bars' | 'pulse' | 'wave';
  className?: string;
  label?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'circle',
  className = '',
  label,
  fullScreen = false,
  overlay = false,
}) => {
  const sizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    white: 'text-white',
    current: 'text-current',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'circle':
        return <CircleSpinner size={sizes[size]} />;
      case 'dots':
        return <DotsSpinner size={sizes[size]} />;
      case 'bars':
        return <BarsSpinner size={sizes[size]} />;
      case 'pulse':
        return <PulseSpinner size={sizes[size]} />;
      case 'wave':
        return <WaveSpinner size={sizes[size]} />;
      default:
        return <CircleSpinner size={sizes[size]} />;
    }
  };

  const spinnerContent = (
    <div
      className={`inline-flex flex-col items-center justify-center gap-3 ${colorClasses[color]} ${className}`}
    >
      {renderSpinner()}
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
        {spinnerContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Circle Spinner (default)
const CircleSpinner: React.FC<{ size: number }> = ({ size }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Dots Spinner
const DotsSpinner: React.FC<{ size: number }> = ({ size }) => {
  const dotSize = size / 6;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute bg-current rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            left: `${index * (size / 3)}px`,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Bars Spinner
const BarsSpinner: React.FC<{ size: number }> = ({ size }) => {
  const barWidth = size / 8;
  const barHeight = size / 2;
  
  return (
    <div className="flex items-center justify-center gap-1" style={{ height: size }}>
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="bg-current"
          style={{
            width: barWidth,
            height: barHeight,
          }}
          animate={{
            scaleY: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Pulse Spinner
const PulseSpinner: React.FC<{ size: number }> = ({ size }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <motion.div
      className="absolute inset-0 bg-current rounded-full"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.8, 0.4, 0.8],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute inset-0 bg-current rounded-full"
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.6, 0.2, 0.6],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.2,
      }}
    />
  </div>
);

// Wave Spinner
const WaveSpinner: React.FC<{ size: number }> = ({ size }) => {
  const dotSize = size / 8;
  const radius = size / 2 - dotSize;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index * 360) / 8;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        
        return (
          <motion.div
            key={index}
            className="absolute bg-current rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              left: '50%',
              top: '50%',
              transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.15,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};

// Loading states for different contexts
export const ButtonSpinner: React.FC<{
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}> = ({ size = 'sm', className }) => (
  <Spinner size={size} color="current" className={className} />
);

export const PageSpinner: React.FC<{
  message?: string;
}> = ({ message = 'Loading...' }) => (
  <div className="flex h-screen items-center justify-center">
    <Spinner size="lg" label={message} />
  </div>
);

export const CardSpinner: React.FC<{
  message?: string;
}> = ({ message }) => (
  <div className="flex items-center justify-center p-8">
    <Spinner size="md" label={message} />
  </div>
);

export const InlineSpinner: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = 'Loading', className }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <Spinner size="xs" color="current" />
    <span>{text}</span>
  </span>
);

// Chat-specific spinners
export const MessageSpinner: React.FC = () => (
  <div className="flex items-center gap-2 px-4 py-2">
    <Spinner size="xs" variant="dots" />
    <span className="text-sm text-gray-500 dark:text-gray-400">
      Sending message...
    </span>
  </div>
);

export const TypingSpinner: React.FC = () => (
  <div className="flex items-center gap-1">
    <motion.div
      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        delay: 0,
      }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        delay: 0.2,
      }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        delay: 0.4,
      }}
    />
  </div>
);

// Skeleton loader alternative
export const ContentSpinner: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className }) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 last:mb-0"
        style={{
          width: `${Math.random() * 40 + 60}%`,
        }}
      />
    ))}
  </div>
);