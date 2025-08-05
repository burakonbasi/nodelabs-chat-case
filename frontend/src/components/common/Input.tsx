import React, { forwardRef, useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, X } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  showPasswordToggle?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  animate?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onClear,
      showPasswordToggle,
      variant = 'default',
      fullWidth = false,
      animate = true,
      type = 'text',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputId = useId();
    const errorId = useId();
    const helperId = useId();

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasError = !!error;

    const baseClasses = `
      relative px-4 py-3 w-full
      bg-transparent
      text-gray-900 dark:text-gray-100
      placeholder-gray-500 dark:placeholder-gray-400
      transition-all duration-200
      ${leftIcon ? 'pl-11' : ''}
      ${rightIcon || onClear || showPasswordToggle ? 'pr-11' : ''}
      ${disabled ? 'cursor-not-allowed opacity-50' : ''}
    `;

    const variantClasses = {
      default: `
        border-b-2 border-gray-300 dark:border-gray-600
        focus:border-primary-500 dark:focus:border-primary-400
        ${hasError ? 'border-red-500 dark:border-red-400' : ''}
      `,
      filled: `
        bg-gray-100 dark:bg-gray-800
        border-b-2 border-transparent
        focus:border-primary-500 dark:focus:border-primary-400
        rounded-t-lg
        ${hasError ? 'border-red-500 dark:border-red-400' : ''}
      `,
      outlined: `
        border-2 border-gray-300 dark:border-gray-600
        focus:border-primary-500 dark:focus:border-primary-400
        rounded-lg
        ${hasError ? 'border-red-500 dark:border-red-400' : ''}
      `,
    };

    const wrapperClasses = `
      relative
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `;

    const renderRightElements = () => {
      const elements = [];

      if (onClear && props.value) {
        elements.push(
          <button
            key="clear"
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Clear input"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        );
      }

      if (showPasswordToggle && type === 'password') {
        elements.push(
          <button
            key="toggle"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
        );
      }

      if (rightIcon && !onClear && !showPasswordToggle) {
        elements.push(
          <div key="icon" className="pointer-events-none">
            {rightIcon}
          </div>
        );
      }

      return elements;
    };

    const inputElement = (
      <div className={wrapperClasses}>
        {label && (
          <motion.label
            htmlFor={inputId}
            className={`
              block mb-2 text-sm font-medium
              ${hasError ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}
              ${disabled ? 'opacity-50' : ''}
            `}
            initial={animate ? { opacity: 0, y: -10 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <motion.input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`${baseClasses} ${variantClasses[variant]} outline-none`}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={hasError}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.2, delay: 0.1 }}
            {...props}
          />

          {(rightIcon || onClear || showPasswordToggle) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {renderRightElements()}
            </div>
          )}

          {/* Focus indicator for outlined variant */}
          {variant === 'outlined' && isFocused && !hasError && (
            <motion.div
              className="absolute inset-0 border-2 border-primary-500 dark:border-primary-400 rounded-lg pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              id={errorId}
              className="mt-2 flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {!error && helperText && (
            <motion.div
              id={helperId}
              className="mt-2 text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {helperText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

    return inputElement;
  }
);

Input.displayName = 'Input';

// Textarea component with similar styling
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  animate?: boolean;
  maxLength?: number;
  showCount?: boolean;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      fullWidth = false,
      animate = true,
      maxLength,
      showCount = false,
      autoResize = false,
      className = '',
      disabled,
      value = '',
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = useId();
    const errorId = useId();
    const helperId = useId();
    const hasError = !!error;
    const [charCount, setCharCount] = useState(String(value).length);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      
      onChange?.(e);
    };

    const baseClasses = `
      relative px-4 py-3 w-full
      bg-transparent
      text-gray-900 dark:text-gray-100
      placeholder-gray-500 dark:placeholder-gray-400
      transition-all duration-200
      resize-none
      ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      ${autoResize ? 'overflow-hidden' : ''}
    `;

    const variantClasses = {
      default: `
        border-b-2 border-gray-300 dark:border-gray-600
        focus:border-primary-500 dark:focus:border-primary-400
        ${hasError ? 'border-red-500 dark:border-red-400' : ''}
      `,
      filled: `
        bg-gray-100 dark:bg-gray-800
        border-b-2 border-transparent
        focus:border-primary-500 dark:focus:border-primary-400
        rounded-t-lg
        ${hasError ? 'border-red-500 dark:border-red-400' : ''}
      `,
      outlined: `
        border-2 border-gray-300 dark:border-gray-600
        focus:border-primary-500 dark:focus:border-primary-400
        rounded-lg
        ${hasError ? 'border-red-500 dark:border-red-400' : ''}
      `,
    };

    const wrapperClasses = `
      relative
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `;

    return (
      <div className={wrapperClasses}>
        {label && (
          <motion.label
            htmlFor={textareaId}
            className={`
              block mb-2 text-sm font-medium
              ${hasError ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}
              ${disabled ? 'opacity-50' : ''}
            `}
            initial={animate ? { opacity: 0, y: -10 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          <motion.textarea
            ref={ref}
            id={textareaId}
            className={`${baseClasses} ${variantClasses[variant]} outline-none`}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            aria-invalid={hasError}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.2, delay: 0.1 }}
            {...props}
          />

          {showCount && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 pointer-events-none">
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              id={errorId}
              className="mt-2 flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {!error && helperText && (
            <motion.div
              id={helperId}
              className="mt-2 text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {helperText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';