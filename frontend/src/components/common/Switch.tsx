// src/components/common/Switch.tsx
import React, { forwardRef, useId } from 'react';
import { motion } from 'framer-motion';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  labelPosition?: 'left' | 'right';
  error?: string;
  required?: boolean;
  name?: string;
  className?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      label,
      description,
      size = 'md',
      color = 'primary',
      labelPosition = 'right',
      error,
      required = false,
      name,
      className = '',
    },
    ref
  ) => {
    const switchId = useId();

    const sizeClasses = {
      sm: {
        switch: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: 'translate-x-4',
        label: 'text-sm',
      },
      md: {
        switch: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5',
        label: 'text-base',
      },
      lg: {
        switch: 'w-14 h-8',
        thumb: 'w-6 h-6',
        translate: 'translate-x-6',
        label: 'text-lg',
      },
    };

    const colorClasses = {
      primary: {
        checked: 'bg-primary-500 dark:bg-primary-600',
        unchecked: 'bg-gray-300 dark:bg-gray-600',
      },
      success: {
        checked: 'bg-green-500 dark:bg-green-600',
        unchecked: 'bg-gray-300 dark:bg-gray-600',
      },
      warning: {
        checked: 'bg-yellow-500 dark:bg-yellow-600',
        unchecked: 'bg-gray-300 dark:bg-gray-600',
      },
      danger: {
        checked: 'bg-red-500 dark:bg-red-600',
        unchecked: 'bg-gray-300 dark:bg-gray-600',
      },
    };

    const handleChange = () => {
      if (!disabled) {
        onChange?.(!checked);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleChange();
      }
    };

    const switchElement = (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${switchId}-label` : undefined}
        aria-describedby={description ? `${switchId}-description` : undefined}
        disabled={disabled}
        onClick={handleChange}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center
          ${sizeClasses[size].switch}
          rounded-full transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900
          ${checked ? colorClasses[color].checked : colorClasses[color].unchecked}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.span
          className={`
            ${sizeClasses[size].thumb}
            bg-white rounded-full shadow-sm
            ${disabled ? '' : 'group-hover:shadow-md'}
          `}
          initial={false}
          animate={{
            x: checked ? sizeClasses[size].translate.split(' ')[0].replace('translate-x-', '') : '0',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          style={{
            x: 1,
          }}
        />
      </button>
    );

    const content = label || description ? (
      <label
        className={`
          flex items-start gap-3
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        {labelPosition === 'left' && (
          <div className="flex-1">
            {label && (
              <span
                id={`${switchId}-label`}
                className={`
                  block font-medium text-gray-900 dark:text-gray-100
                  ${sizeClasses[size].label}
                  ${disabled ? 'opacity-50' : ''}
                `}
              >
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
              </span>
            )}
            {description && (
              <span
                id={`${switchId}-description`}
                className={`
                  block mt-1 text-sm text-gray-600 dark:text-gray-400
                  ${disabled ? 'opacity-50' : ''}
                `}
              >
                {description}
              </span>
            )}
            {error && (
              <span className="block mt-1 text-sm text-red-500 dark:text-red-400">
                {error}
              </span>
            )}
          </div>
        )}

        {switchElement}

        {labelPosition === 'right' && (
          <div className="flex-1">
            {label && (
              <span
                id={`${switchId}-label`}
                className={`
                  block font-medium text-gray-900 dark:text-gray-100
                  ${sizeClasses[size].label}
                  ${disabled ? 'opacity-50' : ''}
                `}
              >
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
              </span>
            )}
            {description && (
              <span
                id={`${switchId}-description`}
                className={`
                  block mt-1 text-sm text-gray-600 dark:text-gray-400
                  ${disabled ? 'opacity-50' : ''}
                `}
              >
                {description}
              </span>
            )}
            {error && (
              <span className="block mt-1 text-sm text-red-500 dark:text-red-400">
                {error}
              </span>
            )}
          </div>
        )}

        <input
          ref={ref}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          required={required}
          className="sr-only"
          aria-hidden="true"
        />
      </label>
    ) : (
      <div className={className}>
        {switchElement}
        <input
          ref={ref}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          required={required}
          className="sr-only"
          aria-hidden="true"
        />
      </div>
    );

    return content;
  }
);

Switch.displayName = 'Switch';

// Checkbox component with similar styling
interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  error?: string;
  indeterminate?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      label,
      description,
      size = 'md',
      color = 'primary',
      error,
      indeterminate = false,
      required = false,
      name,
      className = '',
    },
    ref
  ) => {
    const checkboxId = useId();

    const sizeClasses = {
      sm: {
        checkbox: 'w-4 h-4',
        label: 'text-sm',
      },
      md: {
        checkbox: 'w-5 h-5',
        label: 'text-base',
      },
      lg: {
        checkbox: 'w-6 h-6',
        label: 'text-lg',
      },
    };

    const colorClasses = {
      primary: 'text-primary-600 focus:ring-primary-500',
      success: 'text-green-600 focus:ring-green-500',
      warning: 'text-yellow-600 focus:ring-yellow-500',
      danger: 'text-red-600 focus:ring-red-500',
    };

    const checkboxElement = (
      <div className="relative">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          required={required}
          className={`
            ${sizeClasses[size].checkbox}
            ${colorClasses[color]}
            rounded border-gray-300 dark:border-gray-600
            focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
          aria-describedby={
            error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined
          }
        />
        {indeterminate && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-2 h-0.5 bg-current"></div>
          </div>
        )}
      </div>
    );

    if (!label && !description) {
      return <div className={className}>{checkboxElement}</div>;
    }

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        {checkboxElement}
        <div className="flex-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`
                block font-medium text-gray-900 dark:text-gray-100
                ${sizeClasses[size].label}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </label>
          )}
          {description && (
            <p
              id={`${checkboxId}-description`}
              className={`
                mt-1 text-sm text-gray-600 dark:text-gray-400
                ${disabled ? 'opacity-50' : ''}
              `}
            >
              {description}
            </p>
          )}
          {error && (
            <p
              id={`${checkboxId}-error`}
              className="mt-1 text-sm text-red-500 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio button component
interface RadioProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  error?: string;
  required?: boolean;
  name?: string;
  value?: string;
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      label,
      description,
      size = 'md',
      color = 'primary',
      error,
      required = false,
      name,
      value,
      className = '',
    },
    ref
  ) => {
    const radioId = useId();

    const sizeClasses = {
      sm: {
        radio: 'w-4 h-4',
        label: 'text-sm',
      },
      md: {
        radio: 'w-5 h-5',
        label: 'text-base',
      },
      lg: {
        radio: 'w-6 h-6',
        label: 'text-lg',
      },
    };

    const colorClasses = {
      primary: 'text-primary-600 focus:ring-primary-500',
      success: 'text-green-600 focus:ring-green-500',
      warning: 'text-yellow-600 focus:ring-yellow-500',
      danger: 'text-red-600 focus:ring-red-500',
    };

    const radioElement = (
      <input
        ref={ref}
        id={radioId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        required={required}
        className={`
          ${sizeClasses[size].radio}
          ${colorClasses[color]}
          border-gray-300 dark:border-gray-600
          focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        aria-describedby={
          error ? `${radioId}-error` : description ? `${radioId}-description` : undefined
        }
      />
    );

    if (!label && !description) {
      return <div className={className}>{radioElement}</div>;
    }

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        {radioElement}
        <div className="flex-1">
          {label && (
            <label
              htmlFor={radioId}
              className={`
                block font-medium text-gray-900 dark:text-gray-100
                ${sizeClasses[size].label}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </label>
          )}
          {description && (
            <p
              id={`${radioId}-description`}
              className={`
                mt-1 text-sm text-gray-600 dark:text-gray-400
                ${disabled ? 'opacity-50' : ''}
              `}
            >
              {description}
            </p>
          )}
          {error && (
            <p
              id={`${radioId}-error`}
              className="mt-1 text-sm text-red-500 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Radio.displayName = 'Radio';