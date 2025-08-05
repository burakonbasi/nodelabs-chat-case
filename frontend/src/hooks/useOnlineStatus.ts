import { useState, useEffect, useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore';

interface OnlineStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  checkInterval?: number;
  url?: string;
  timeout?: number;
}

export function useOnlineStatus(options?: OnlineStatusOptions): {
  isOnline: boolean;
  lastOnline: Date | null;
  checkConnection: () => Promise<boolean>;
} {
  const {
    onOnline,
    onOffline,
    checkInterval = 30000, // 30 seconds
    url = '/api/health',
    timeout = 5000,
  } = options || {};

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastOnline, setLastOnline] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );
  const { addNotification } = useNotificationStore();

  // Check connection by making a request
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }, [url, timeout]);

  const handleOnline = useCallback(async () => {
    const isActuallyOnline = await checkConnection();
    
    if (isActuallyOnline && !isOnline) {
      setIsOnline(true);
      setLastOnline(new Date());
      
      addNotification({
        type: 'success',
        title: 'Connection Restored',
        message: 'You are back online',
      });
      
      onOnline?.();
    }
  }, [checkConnection, isOnline, onOnline, addNotification]);

  const handleOffline = useCallback(() => {
    if (isOnline) {
      setIsOnline(false);
      
      addNotification({
        type: 'warning',
        title: 'No Connection',
        message: 'You are offline. Some features may be limited.',
        duration: 0, // Don't auto-dismiss
      });
      
      onOffline?.();
    }
  }, [isOnline, onOffline, addNotification]);

  // Listen to online/offline events
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Periodic connection check
  useEffect(() => {
    if (!checkInterval) return;

    const interval = setInterval(async () => {
      const isActuallyOnline = await checkConnection();
      
      if (isActuallyOnline !== isOnline) {
        if (isActuallyOnline) {
          handleOnline();
        } else {
          handleOffline();
        }
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval, checkConnection, isOnline, handleOnline, handleOffline]);

  // Initial check
  useEffect(() => {
    checkConnection().then((isActuallyOnline) => {
      setIsOnline(isActuallyOnline);
      if (isActuallyOnline) {
        setLastOnline(new Date());
      }
    });
  }, [checkConnection]);

  return {
    isOnline,
    lastOnline,
    checkConnection,
  };
}

// Hook for monitoring network quality
export function useNetworkQuality(): {
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
} {
  const [networkInfo, setNetworkInfo] = useState(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) {
      return {
        effectiveType: null,
        downlink: null,
        rtt: null,
        saveData: false,
      };
    }

    return {
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: connection.saveData || false,
    };
  });

  useEffect(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) return;

    const updateNetworkInfo = () => {
      setNetworkInfo({
        effectiveType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
        saveData: connection.saveData || false,
      });
    };

    connection.addEventListener('change', updateNetworkInfo);

    return () => {
      connection.removeEventListener('change', updateNetworkInfo);
    };
  }, []);

  return networkInfo;
}

// Hook for auto-retry failed requests when back online
export function useOnlineRetry<T>(
  request: () => Promise<T>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
  retry: () => void;
} {
  const { isOnline } = useOnlineStatus();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const {
    maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options || {};

  const executeRequest = useCallback(async () => {
    if (!isOnline) {
      setError(new Error('No internet connection'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await request();
      setData(result);
      setRetryCount(0);
      onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          executeRequest();
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, request, retryCount, maxRetries, retryDelay, onSuccess, onError]);

  const retry = useCallback(() => {
    setRetryCount(0);
    executeRequest();
  }, [executeRequest]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (isOnline && error && retryCount < maxRetries) {
      executeRequest();
    }
  }, [isOnline, error, retryCount, maxRetries, executeRequest]);

  return { data, error, loading, retry };
}