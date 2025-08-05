import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FiLoader } from 'react-icons/fi';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  motionProps?: HTMLMotionProps<'button'>;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      motionProps,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl',
      secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-900 dark:text-white',
      outline: 'border border-gray-300 dark:border-dark-300 hover:bg-gray-50 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-200',
      ghost: 'hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-200',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-dark-400',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
        {...motionProps}
        {...props}
      >
        {isLoading ? (
          <>
            <FiLoader className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';