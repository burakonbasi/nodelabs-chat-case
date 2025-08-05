import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number;
  vibrationDuration?: number;
}

export function useLongPress(options: UseLongPressOptions) {
  const { onLongPress, onClick, threshold = 500, vibrationDuration = 50 } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const startPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isLongPressRef.current = false;
    
    // Store initial position
    if ('touches' in e) {
      const touch = e.touches[0];
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
    } else {
      startPosRef.current = { x: e.clientX, y: e.clientY };
    }

    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      
      // Vibration feedback if available
      if ('vibrate' in navigator && vibrationDuration > 0) {
        navigator.vibrate(vibrationDuration);
      }
      
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold, vibrationDuration]);

  const cancelPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const endPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const wasLongPress = isLongPressRef.current;
    
    // Check if the pointer moved too much (cancel if moved more than 10px)
    if (startPosRef.current) {
      let currentX: number, currentY: number;
      
      if ('changedTouches' in e) {
        const touch = e.changedTouches[0];
        currentX = touch.clientX;
        currentY = touch.clientY;
      } else {
        currentX = e.clientX;
        currentY = e.clientY;
      }
      
      const deltaX = Math.abs(currentX - startPosRef.current.x);
      const deltaY = Math.abs(currentY - startPosRef.current.y);
      
      if (deltaX > 10 || deltaY > 10) {
        cancelPress();
        return;
      }
    }
    
    cancelPress();
    
    if (!wasLongPress && onClick) {
      onClick();
    }
  }, [cancelPress, onClick]);

  return {
    onMouseDown: startPress,
    onMouseUp: endPress,
    onMouseLeave: cancelPress,
    onTouchStart: startPress,
    onTouchEnd: endPress,
    onTouchCancel: cancelPress,
  };
}