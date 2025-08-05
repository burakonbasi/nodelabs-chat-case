import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  offset?: number;
  arrow?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  trigger = 'hover',
  delay = 0,
  offset = 8,
  arrow = true,
  interactive = false,
  disabled = false,
  className = '',
  contentClassName = '',
  open: controlledOpen,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actualPlacement, setActualPlacement] = useState(placement);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : isOpen;

  const handleOpen = () => {
    if (disabled) return;
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (isControlled) {
          onOpenChange?.(true);
        } else {
          setIsOpen(true);
        }
      }, delay);
    } else {
      if (isControlled) {
        onOpenChange?.(true);
      } else {
        setIsOpen(true);
      }
    }
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setIsOpen(false);
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;
    let finalPlacement = placement;

    // Auto placement logic
    if (placement === 'auto') {
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      if (spaceBottom >= tooltipRect.height + offset) {
        finalPlacement = 'bottom';
      } else if (spaceTop >= tooltipRect.height + offset) {
        finalPlacement = 'top';
      } else if (spaceRight >= tooltipRect.width + offset) {
        finalPlacement = 'right';
      } else if (spaceLeft >= tooltipRect.width + offset) {
        finalPlacement = 'left';
      } else {
        finalPlacement = 'bottom';
      }
    }

    // Calculate position based on placement
    switch (finalPlacement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset + scrollY;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + scrollX;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset + scrollY;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + scrollX;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + scrollY;
        left = triggerRect.left - tooltipRect.width - offset + scrollX;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + scrollY;
        left = triggerRect.right + offset + scrollX;
        break;
    }

    // Boundary checks
    if (left < offset) left = offset;
    if (left + tooltipRect.width > viewportWidth - offset) {
      left = viewportWidth - tooltipRect.width - offset;
    }
    if (top < offset) top = offset;
    if (top + tooltipRect.height > viewportHeight - offset) {
      top = viewportHeight - tooltipRect.height - offset;
    }

    setPosition({ top, left });
    setActualPlacement(finalPlacement);
  };

  useEffect(() => {
    if (open) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [open]);

  // Trigger handlers
  const triggerProps: React.HTMLAttributes<HTMLDivElement> = {
    ref: triggerRef,
  };

  if (trigger === 'hover') {
    triggerProps.onMouseEnter = handleOpen;
    triggerProps.onMouseLeave = handleClose;
    if (interactive) {
      triggerProps.onMouseMove = handleOpen;
    }
  } else if (trigger === 'click') {
    triggerProps.onClick = () => {
      if (open) {
        handleClose();
      } else {
        handleOpen();
      }
    };
  } else if (trigger === 'focus') {
    triggerProps.onFocus = handleOpen;
    triggerProps.onBlur = handleClose;
  }

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700 border-x-transparent border-b-transparent',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700 border-x-transparent border-t-transparent',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-y-transparent border-r-transparent',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-y-transparent border-l-transparent',
    auto: 'hidden',
  };

  const tooltipContent = (
    <AnimatePresence>
      {open && content && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`
            fixed z-50 px-3 py-2 text-sm font-medium text-white
            bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg
            pointer-events-none
            ${interactive ? 'pointer-events-auto' : ''}
            ${contentClassName}
          `}
          style={{
            top: position.top,
            left: position.left,
          }}
          onMouseEnter={interactive && trigger === 'hover' ? handleOpen : undefined}
          onMouseLeave={interactive && trigger === 'hover' ? handleClose : undefined}
        >
          {content}
          {arrow && (
            <div
              className={`
                absolute w-0 h-0 border-4
                ${arrowClasses[actualPlacement]}
              `}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div {...triggerProps} className={className}>
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};

// Simple Tooltip for quick use
interface SimpleTooltipProps {
  children: React.ReactNode;
  text: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  children,
  text,
  placement = 'top',
  className,
}) => (
  <Tooltip content={text} placement={placement} className={className}>
    {children}
  </Tooltip>
);

// Icon Tooltip
interface IconTooltipProps {
  icon: React.ReactNode;
  text: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const IconTooltip: React.FC<IconTooltipProps> = ({
  icon,
  text,
  placement = 'top',
  className,
}) => (
  <Tooltip content={text} placement={placement}>
    <span className={`inline-flex items-center justify-center ${className}`}>
      {icon}
    </span>
  </Tooltip>
);

// Help Tooltip
interface HelpTooltipProps {
  content: React.ReactNode;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  className = '',
}) => (
  <Tooltip content={content} placement="top">
    <button
      type="button"
      className={`
        inline-flex items-center justify-center w-4 h-4 ml-1
        text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
        rounded-full transition-colors
        ${className}
      `}
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  </Tooltip>
);

// Tooltip Provider for grouped tooltips
interface TooltipProviderProps {
  children: React.ReactNode;
  delay?: number;
  skipDelay?: boolean;
}

const TooltipContext = React.createContext<{
  delay: number;
  skipDelay: boolean;
}>({
  delay: 0,
  skipDelay: false,
});

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delay = 700,
  skipDelay = true,
}) => {
  return (
    <TooltipContext.Provider value={{ delay, skipDelay }}>
      {children}
    </TooltipContext.Provider>
  );
};

// Copy to clipboard tooltip
interface CopyTooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export const CopyTooltip: React.FC<CopyTooltipProps> = ({
  text,
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Tooltip
      content={copied ? 'Copied!' : 'Click to copy'}
      placement="top"
      trigger="hover"
    >
      <button
        type="button"
        onClick={handleCopy}
        className={`cursor-pointer ${className}`}
      >
        {children}
      </button>
    </Tooltip>
  );
};