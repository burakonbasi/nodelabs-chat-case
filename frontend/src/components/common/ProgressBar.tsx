import { useEffect, useState } from 'react';

interface ProgressBarProps {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  className?: string;
  rounded?: boolean;
}

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  indeterminate = false,
  className = '',
  rounded = true,
}: ProgressBarProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = indeterminate ? 100 : Math.min(Math.max((displayValue / max) * 100, 0), 100);

  // Animate value changes
  useEffect(() => {
    if (animated && !indeterminate) {
      const duration = 500; // Animation duration in ms
      const steps = 30;
      const stepValue = (value - displayValue) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue((prev) => {
          const newValue = prev + stepValue;
          return currentStep === steps ? value : newValue;
        });

        if (currentStep === steps) {
          clearInterval(interval);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated, indeterminate]);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };

  const variantClasses = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const stripedClass = striped
    ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-[shimmer_1s_linear_infinite]'
    : '';

  const getLabel = () => {
    if (label) return label;
    if (indeterminate) return 'Loading...';
    return `${Math.round(percentage)}%`;
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getLabel()}
          </span>
          {!indeterminate && !label && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {displayValue} / {max}
            </span>
          )}
        </div>
      )}
      
      <div
        className={`
          w-full bg-gray-200 dark:bg-gray-700 overflow-hidden
          ${sizeClasses[size]}
          ${rounded ? 'rounded-full' : ''}
        `}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : displayValue}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`
            h-full transition-all duration-300 ease-out relative overflow-hidden
            ${variantClasses[variant]}
            ${rounded ? 'rounded-full' : ''}
            ${indeterminate ? 'progress-bar-indeterminate' : ''}
          `}
          style={!indeterminate ? { width: `${percentage}%` } : undefined}
        >
          {striped && !indeterminate && (
            <div className={`absolute inset-0 ${stripedClass}`} />
          )}
        </div>
      </div>
    </div>
  );
};

// Circular Progress Bar
interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
  label,
  animated = true,
  indeterminate = false,
  className = '',
}: CircularProgressProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = indeterminate ? 25 : Math.min(Math.max((displayValue / max) * 100, 0), 100);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = indeterminate ? circumference * 0.75 : circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (animated && !indeterminate) {
      const duration = 500;
      const steps = 30;
      const stepValue = (value - displayValue) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue((prev) => {
          const newValue = prev + stepValue;
          return currentStep === steps ? value : newValue;
        });

        if (currentStep === steps) {
          clearInterval(interval);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated, indeterminate]);

  const variantColors = {
    primary: 'text-primary-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  const getLabel = () => {
    if (label) return label;
    if (indeterminate) return '';
    return `${Math.round(percentage)}%`;
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${indeterminate ? 'animate-spin' : ''}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${variantColors[variant]} transition-all duration-300 ease-out`}
        />
      </svg>
      
      {showLabel && !indeterminate && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getLabel()}
          </span>
        </div>
      )}
    </div>
  );
};

// Multi-step Progress Bar
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const StepProgress = ({
  steps,
  currentStep,
  variant = 'primary',
  size = 'md',
  showLabels = true,
  className = '',
}: StepProgressProps) => {
  const variantClasses = {
    primary: 'bg-primary-500 text-primary-500',
    success: 'bg-green-500 text-green-500',
    warning: 'bg-yellow-500 text-yellow-500',
    error: 'bg-red-500 text-red-500',
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full ${variantClasses[variant].split(' ')[0]} transition-all duration-300`}
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`
                    ${sizeClasses[size]} rounded-full flex items-center justify-center
                    transition-all duration-300 font-medium
                    ${
                      isCompleted
                        ? `${variantClasses[variant].split(' ')[0]} text-white`
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }
                    ${isCurrent ? 'ring-4 ring-opacity-30 ' + variantClasses[variant].split(' ')[1] : ''}
                  `}
                >
                  {index + 1}
                </div>
                {showLabels && (
                  <span
                    className={`
                      mt-2 text-xs font-medium whitespace-nowrap
                      ${
                        isCompleted
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    `}
                  >
                    {step}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;