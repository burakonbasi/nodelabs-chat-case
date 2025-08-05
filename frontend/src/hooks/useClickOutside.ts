import { useEffect, useRef, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  options?: {
    enabled?: boolean;
    events?: ('mousedown' | 'mouseup' | 'touchstart' | 'touchend')[];
    exclude?: RefObject<HTMLElement>[];
  }
): RefObject<T> {
  const ref = useRef<T>(null);
  const { enabled = true, events = ['mousedown', 'touchstart'], exclude = [] } = options || {};

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;

      // Check if click is inside the element
      if (el.contains(event.target as Node)) return;

      // Check if click is inside any excluded elements
      const isExcluded = exclude.some((excludeRef) => {
        return excludeRef.current?.contains(event.target as Node);
      });
      if (isExcluded) return;

      handler(event);
    };

    // Add event listeners
    events.forEach((eventName) => {
      document.addEventListener(eventName, listener);
    });

    // Cleanup
    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener);
      });
    };
  }, [handler, enabled, events, exclude]);

  return ref;
}

// Hook for multiple refs
export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T>[],
  handler: Handler,
  options?: {
    enabled?: boolean;
    events?: ('mousedown' | 'mouseup' | 'touchstart' | 'touchend')[];
  }
): void {
  const { enabled = true, events = ['mousedown', 'touchstart'] } = options || {};

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Check if click is inside any of the elements
      const isInside = refs.some((ref) => {
        return ref.current?.contains(event.target as Node);
      });

      if (!isInside) {
        handler(event);
      }
    };

    // Add event listeners
    events.forEach((eventName) => {
      document.addEventListener(eventName, listener);
    });

    // Cleanup
    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener);
      });
    };
  }, [refs, handler, enabled, events]);
}

// Hook with callback ref pattern
export function useClickOutsideCallback<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  options?: {
    enabled?: boolean;
    events?: ('mousedown' | 'mouseup' | 'touchstart' | 'touchend')[];
    exclude?: HTMLElement[];
  }
): (node: T | null) => void {
  const ref = useRef<T | null>(null);
  const { enabled = true, events = ['mousedown', 'touchstart'], exclude = [] } = options || {};

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current) return;

      // Check if click is inside the element
      if (ref.current.contains(event.target as Node)) return;

      // Check if click is inside any excluded elements
      const isExcluded = exclude.some((element) => {
        return element.contains(event.target as Node);
      });
      if (isExcluded) return;

      handler(event);
    };

    // Add event listeners
    events.forEach((eventName) => {
      document.addEventListener(eventName, listener);
    });

    // Cleanup
    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener);
      });
    };
  }, [handler, enabled, events, exclude]);

  // Callback ref
  const setRef = (node: T | null) => {
    ref.current = node;
  };

  return setRef;
}

// Hook for dropdown/modal management
export function useDropdown(
  onClose: () => void,
  options?: {
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
    exclude?: RefObject<HTMLElement>[];
  }
) {
  const { closeOnEscape = true, closeOnClickOutside = true, exclude = [] } = options || {};
  const dropdownRef = useClickOutside<HTMLDivElement>(
    () => {
      if (closeOnClickOutside) {
        onClose();
      }
    },
    { exclude }
  );

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, onClose]);

  return dropdownRef;
}

// Hook for context menu
export function useContextMenu<T extends HTMLElement = HTMLElement>(
  onOpen: (event: MouseEvent, target: T) => void,
  options?: {
    enabled?: boolean;
    preventDefault?: boolean;
  }
) {
  const ref = useRef<T>(null);
  const { enabled = true, preventDefault = true } = options || {};

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;

    const handleContextMenu = (e: MouseEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }
      onOpen(e, element);
    };

    element.addEventListener('contextmenu', handleContextMenu);
    return () => element.removeEventListener('contextmenu', handleContextMenu);
  }, [enabled, preventDefault, onOpen]);

  return ref;
}

// Hook for long press (mobile context menu)
export function useLongPress<T extends HTMLElement = HTMLElement>(
  onLongPress: (event: TouchEvent, target: T) => void,
  options?: {
    delay?: number;
    enabled?: boolean;
    preventDefault?: boolean;
  }
) {
  const ref = useRef<T>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { delay = 500, enabled = true, preventDefault = true } = options || {};

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    let isLongPress = false;

    const handleTouchStart = (e: TouchEvent) => {
      isLongPress = false;
      timeoutRef.current = setTimeout(() => {
        isLongPress = true;
        if (preventDefault) {
          e.preventDefault();
        }
        onLongPress(e, element);
      }, delay);
    };

    const handleTouchEnd = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const handleTouchMove = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchmove', handleTouchMove);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, delay, preventDefault, onLongPress]);

  return ref;
}