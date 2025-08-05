import { useState, useEffect, useCallback, useRef } from 'react';

interface KeyPressOptions {
  target?: HTMLElement | null;
  event?: 'keydown' | 'keyup' | 'keypress';
  preventDefault?: boolean;
  stopPropagation?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  enabled?: boolean;
}

export function useKeyPress(
  targetKey: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: KeyPressOptions = {}
): boolean {
  const {
    target = null,
    event = 'keydown',
    preventDefault = false,
    stopPropagation = false,
    ctrl = false,
    alt = false,
    shift = false,
    meta = false,
    enabled = true,
  } = options;

  const [keyPressed, setKeyPressed] = useState(false);
  const savedHandler = useRef(handler);

  // Update ref when handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target || window;
    const keys = Array.isArray(targetKey) ? targetKey : [targetKey];

    const downHandler = (e: KeyboardEvent) => {
      // Check modifier keys
      if (ctrl && !e.ctrlKey) return;
      if (alt && !e.altKey) return;
      if (shift && !e.shiftKey) return;
      if (meta && !e.metaKey) return;

      // Check if the pressed key matches
      if (keys.includes(e.key) || keys.includes(e.code)) {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();

        setKeyPressed(true);
        savedHandler.current(e);
      }
    };

    const upHandler = (e: KeyboardEvent) => {
      if (keys.includes(e.key) || keys.includes(e.code)) {
        setKeyPressed(false);
      }
    };

    // Add event listeners
    if (event === 'keydown' || event === 'keypress') {
      targetElement.addEventListener(event, downHandler as EventListener);
      targetElement.addEventListener('keyup', upHandler as EventListener);
    } else if (event === 'keyup') {
      targetElement.addEventListener(event, downHandler as EventListener);
    }

    // Cleanup
    return () => {
      if (event === 'keydown' || event === 'keypress') {
        targetElement.removeEventListener(event, downHandler as EventListener);
        targetElement.removeEventListener('keyup', upHandler as EventListener);
      } else if (event === 'keyup') {
        targetElement.removeEventListener(event, downHandler as EventListener);
      }
    };
  }, [targetKey, target, event, preventDefault, stopPropagation, ctrl, alt, shift, meta, enabled]);

  return keyPressed;
}

// Hook for keyboard shortcuts
interface Shortcut {
  keys: string | string[];
  handler: () => void;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
  description?: string;
}

export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  options: { enabled?: boolean; target?: HTMLElement | null } = {}
) {
  const { enabled = true, target = null } = options;

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target || window;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
        
        // Check if key matches
        if (!keys.includes(e.key) && !keys.includes(e.code)) continue;
        
        // Check modifiers
        if (shortcut.ctrl && !e.ctrlKey) continue;
        if (shortcut.alt && !e.altKey) continue;
        if (shortcut.shift && !e.shiftKey) continue;
        if (shortcut.meta && !e.metaKey) continue;
        
        // Don't trigger shortcuts when typing in input fields
        const tagName = (e.target as HTMLElement)?.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) {
          continue;
        }
        
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        
        shortcut.handler();
        break;
      }
    };

    targetElement.addEventListener('keydown', handleKeyDown as EventListener);
    return () => targetElement.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [shortcuts, enabled, target]);
}

// Common chat shortcuts
export function useChatShortcuts(handlers: {
  onNewChat?: () => void;
  onSearch?: () => void;
  onSettings?: () => void;
  onToggleSidebar?: () => void;
  onNextChat?: () => void;
  onPreviousChat?: () => void;
  onEscape?: () => void;
  onSendMessage?: () => void;
  onNewLine?: () => void;
  onEmojiPicker?: () => void;
  onAttachFile?: () => void;
}) {
  const shortcuts: Shortcut[] = [
    // New chat
    {
      keys: 'n',
      ctrl: true,
      handler: handlers.onNewChat || (() => {}),
      description: 'Start new chat',
    },
    // Search
    {
      keys: ['k', '/'],
      ctrl: true,
      handler: handlers.onSearch || (() => {}),
      description: 'Search messages',
    },
    // Settings
    {
      keys: ',',
      ctrl: true,
      handler: handlers.onSettings || (() => {}),
      description: 'Open settings',
    },
    // Toggle sidebar
    {
      keys: 'b',
      ctrl: true,
      handler: handlers.onToggleSidebar || (() => {}),
      description: 'Toggle sidebar',
    },
    // Navigate chats
    {
      keys: 'Tab',
      handler: handlers.onNextChat || (() => {}),
      description: 'Next chat',
    },
    {
      keys: 'Tab',
      shift: true,
      handler: handlers.onPreviousChat || (() => {}),
      description: 'Previous chat',
    },
    // Escape
    {
      keys: 'Escape',
      handler: handlers.onEscape || (() => {}),
      description: 'Close modal/menu',
    },
    // Send message
    {
      keys: 'Enter',
      handler: handlers.onSendMessage || (() => {}),
      description: 'Send message',
    },
    // New line
    {
      keys: 'Enter',
      shift: true,
      handler: handlers.onNewLine || (() => {}),
      description: 'New line',
      preventDefault: false,
    },
    // Emoji picker
    {
      keys: 'e',
      ctrl: true,
      handler: handlers.onEmojiPicker || (() => {}),
      description: 'Open emoji picker',
    },
    // Attach file
    {
      keys: 'u',
      ctrl: true,
      handler: handlers.onAttachFile || (() => {}),
      description: 'Attach file',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

// Hook for detecting key combinations
export function useKeyCombination(
  keys: string[],
  handler: () => void,
  options: { timeout?: number; enabled?: boolean } = {}
): string[] {
  const { timeout = 500, enabled = true } = options;
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const newKeys = [...prev, e.key];
        
        // Check if the combination matches
        if (keys.every((key, index) => newKeys[index] === key)) {
          handler();
          return [];
        }
        
        // Reset if too many keys
        if (newKeys.length >= keys.length) {
          return [e.key];
        }
        
        return newKeys;
      });

      // Reset after timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setPressedKeys([]);
      }, timeout);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [keys, handler, timeout, enabled]);

  return pressedKeys;
}

// Hook for konami code easter egg
export function useKonamiCode(handler: () => void) {
  useKeyCombination(
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    handler,
    { timeout: 1000 }
  );
}