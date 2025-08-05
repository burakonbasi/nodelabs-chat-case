import { useEffect, useRef, useCallback } from 'react';
import { socketManager } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onConnect, onDisconnect, onError, autoConnect = true } = options;
  const { isAuthenticated } = useAuthStore();
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!isConnectedRef.current && isAuthenticated) {
      socketManager.connect();
      isConnectedRef.current = true;
    }
  }, [isAuthenticated]);

  const disconnect = useCallback(() => {
    if (isConnectedRef.current) {
      socketManager.disconnect();
      isConnectedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      connect();
    }

    const handleConnect = () => {
      isConnectedRef.current = true;
      onConnect?.();
    };

    const handleDisconnect = () => {
      isConnectedRef.current = false;
      onDisconnect?.();
    };

    const handleError = (error: Error) => {
      onError?.(error);
    };

    socketManager.on('connect', handleConnect);
    socketManager.on('disconnect', handleDisconnect);
    socketManager.on('error', handleError);

    return () => {
      socketManager.off('connect', handleConnect);
      socketManager.off('disconnect', handleDisconnect);
      socketManager.off('error', handleError);
      
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, isAuthenticated, connect, disconnect, onConnect, onDisconnect, onError]);

  return {
    isConnected: socketManager.isConnected(),
    connect,
    disconnect,
    emit: socketManager.emit.bind(socketManager),
    on: socketManager.on.bind(socketManager),
    off: socketManager.off.bind(socketManager),
  };
}