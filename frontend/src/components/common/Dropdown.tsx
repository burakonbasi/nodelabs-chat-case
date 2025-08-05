// src/components/common/Dropdown.tsx
import React, { useState, useRef, useId, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyPress } from '../../hooks/useKeyPress';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  group?: string;
}

interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  maxHeight?: number;
  renderOption?: (option: DropdownOption<T>, isSelected: boolean) => React.ReactNode;
  renderValue?: (value: T | T[]) => React.ReactNode;
  className?: string;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  <T extends string | number = string>(
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      label,
      error,
      helperText,
      multiple = false,
      searchable = false,
      clearable = false,
      disabled = false,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      maxHeight = 300,
      renderOption,
      renderValue,
      className = '',
    }: DropdownProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownId = useId();
    const errorId = useId();
    const helperId = useId();

    const hasError = !!error;
    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

    // Filter options based on search
    const filteredOptions = searchable
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Group options
    const groupedOptions = filteredOptions.reduce((acc, option) => {
      const group = option.group || '';
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {} as Record<string, DropdownOption<T>[]>);

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5',
      lg: 'px-5 py-3 text-lg',
    };

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

    const handleSelect = (option: DropdownOption<T>) => {
      if (option.disabled) return;

      if (multiple) {
        const newValue = selectedValues.includes(option.value)
          ? selectedValues.filter((v) => v !== option.value)
          : [...selectedValues, option.value];
        onChange?.(newValue as T[]);
      } else {
        onChange?.(option.value);
        setIsOpen(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(multiple ? [] : ('' as T));
    };

    const getDisplayValue = () => {
      if (renderValue) {
        return renderValue(multiple ? selectedValues : selectedValues[0]);
      }

      if (selectedValues.length === 0) {
        return <span className="text-gray-500">{placeholder}</span>;
      }

      const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));
      
      if (multiple) {
        return (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((opt) => (
              <span
                key={String(opt.value)}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
              >
                {opt.label}
              </span>
            ))}
          </div>
        );
      }

      return selectedOptions[0]?.label || placeholder;
    };

    // Keyboard navigation
    useKeyPress('Escape', () => setIsOpen(false), { enabled: isOpen });
    useKeyPress('Enter', () => setIsOpen(!isOpen), { enabled: !isOpen && !disabled });

    React.useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    return (
      <div
        ref={ref}
        className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {label && (
          <label
            htmlFor={dropdownId}
            className={`
              block mb-2 text-sm font-medium
              ${hasError ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}
              ${disabled ? 'opacity-50' : ''}
            `}
          >
            {label}
          </label>
        )}

        <div ref={dropdownRef} className="relative">
          <button
            id={dropdownId}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full flex items-center justify-between
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              bg-transparent text-gray-900 dark:text-gray-100
              transition-all duration-200 cursor-pointer
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              outline-none
            `}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-invalid={hasError}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
          >
            <div className="flex-1 text-left">{getDisplayValue()}</div>
            <div className="flex items-center gap-2 ml-2">
              {clearable && selectedValues.length > 0 && !disabled && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Clear selection"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <ChevronDown
                className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {searchable && (
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                      />
                    </div>
                  </div>
                )}

                <div
                  className="overflow-y-auto"
                  style={{ maxHeight }}
                  role="listbox"
                  aria-multiselectable={multiple}
                >
                  {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                    <div key={group}>
                      {group && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {group}
                        </div>
                      )}
                      {groupOptions.map((option) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                          <button
                            key={String(option.value)}
                            onClick={() => handleSelect(option)}
                            disabled={option.disabled}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2 text-left
                              transition-colors duration-150
                              ${
                                option.disabled
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                              }
                              ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                            `}
                            role="option"
                            aria-selected={isSelected}
                          >
                            {renderOption ? (
                              renderOption(option, isSelected)
                            ) : (
                              <>
                                {option.icon && (
                                  <div className="flex-shrink-0">{option.icon}</div>
                                )}
                                <div className="flex-1">
                                  <div className={`${isSelected ? 'font-medium' : ''}`}>
                                    {option.label}
                                  </div>
                                  {option.description && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {option.description}
                                    </div>
                                  )}
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                )}
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  {filteredOptions.length === 0 && (
                    <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No options found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(error || helperText) && (
          <div className="mt-2">
            {error && (
              <div
                id={errorId}
                className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {!error && helperText && (
              <div
                id={helperId}
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                {helperText}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
) as <T = string>(props: DropdownProps<T> & React.RefAttributes<HTMLDivElement>) => React.ReactElement;

Dropdown.displayName = 'Dropdown';