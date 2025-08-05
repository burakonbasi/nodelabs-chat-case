import { useEffect, useState, useCallback, useRef } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import notificationService from '../services/notificationService';

interface UseNotificationsOptions {
  autoRequest?: boolean;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  playSound?: boolean;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const {
    autoRequest = true,
    onPermissionGranted,
    onPermissionDenied,
    playSound = true,
  } = options || {};

  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermissionStatus()
  );
  const [isSupported] = useState(notificationService.isSupported());
  const { notifications, unreadCount } = useNotificationStore();
  
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    if (playSound) {
      notificationSound.current = new Audio('/sounds/notification.mp3');
      notificationSound.current.volume = 0.5;
    }
  }, [playSound]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return;
    }

    const result = await notificationService.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      onPermissionGranted?.();
      // Initialize push notifications
      await notificationService.initialize();
    } else if (result === 'denied') {
      onPermissionDenied?.();
    }

    return result;
  }, [isSupported, onPermissionGranted, onPermissionDenied]);

  // Auto request permission on mount
  useEffect(() => {
    if (autoRequest && permission === 'default') {
      requestPermission();
    }
  }, [autoRequest, permission, requestPermission]);

  // Show notification
  const showNotification = useCallback(
    async (
      title: string,
      options?: {
        body?: string;
        icon?: string;
        badge?: string;
        image?: string;
        tag?: string;
        data?: any;
        requireInteraction?: boolean;
        silent?: boolean;
        actions?: Array<{ action: string; title: string; icon?: string }>;
      }
    ) => {
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      // Play sound if enabled and not silent
      if (playSound && !options?.silent && notificationSound.current) {
        try {
          await notificationSound.current.play();
        } catch (error) {
          console.error('Failed to play notification sound:', error);
        }
      }

      await notificationService.showNotification({
        title,
        body: options?.body || '',
        icon: options?.icon,
        badge: options?.badge,
        image: options?.image,
        tag: options?.tag,
        data: options?.data,
        requireInteraction: options?.requireInteraction,
        silent: options?.silent,
        actions: options?.actions,
      });
    },
    [permission, playSound]
  );

  // Show message notification
  const showMessageNotification = useCallback(
    (data: {
      sender: string;
      message: string;
      avatar?: string;
      conversationId: string;
      messageId: string;
    }) => {
      const notification = notificationService.createMessageNotification(data);
      return showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        tag: notification.tag,
        data: notification.data,
        actions: notification.actions,
      });
    },
    [showNotification]
  );

  // Show call notification
  const showCallNotification = useCallback(
    (data: {
      caller: string;
      type: 'voice' | 'video';
      avatar?: string;
      callId: string;
    }) => {
      const notification = notificationService.createCallNotification(data);
      return showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        tag: notification.tag,
        data: notification.data,
        actions: notification.actions,
        requireInteraction: notification.requireInteraction,
      });
    },
    [showNotification]
  );

  // Show mention notification
  const showMentionNotification = useCallback(
    (data: {
      sender: string;
      group: string;
      message: string;
      avatar?: string;
      conversationId: string;
      messageId: string;
    }) => {
      const notification = notificationService.createMentionNotification(data);
      return showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        tag: notification.tag,
        data: notification.data,
      });
    },
    [showNotification]
  );

  // Test notification
  const testNotification = useCallback(async () => {
    if (permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') return;
    }

    await showNotification('Test Notification', {
      body: 'This is a test notification from your chat app!',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'test',
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  }, [permission, requestPermission, showNotification]);

  return {
    permission,
    isSupported,
    notifications,
    unreadCount,
    requestPermission,
    showNotification,
    showMessageNotification,
    showCallNotification,
    showMentionNotification,
    testNotification,
  };
}

// Hook for managing notification preferences
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<{
    messages: boolean;
    mentions: boolean;
    calls: boolean;
    groupInvites: boolean;
    sound: boolean;
    vibration: boolean;
    preview: boolean;
    desktopNotifications: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load preferences
  useEffect(() => {
    notificationService
      .getPreferences()
      .then(setPreferences)
      .finally(() => setLoading(false));
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<typeof preferences>) => {
      if (!preferences) return;

      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      try {
        await notificationService.updatePreferences(updates);
      } catch (error) {
        // Revert on error
        setPreferences(preferences);
        throw error;
      }
    },
    [preferences]
  );

  return {
    preferences,
    loading,
    updatePreferences,
  };
}

// Hook for notification history
export function useNotificationHistory(limit = 50) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotificationHistory(limit);
      setHistory(data);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await notificationService.markAsRead(notificationId);
      setHistory((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    },
    []
  );

  const clearAll = useCallback(async () => {
    await notificationService.clearAllNotifications();
    setHistory([]);
  }, []);

  return {
    history,
    loading,
    markAsRead,
    clearAll,
    refresh: loadHistory,
  };
}