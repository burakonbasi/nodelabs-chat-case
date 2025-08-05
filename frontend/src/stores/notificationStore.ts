import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  showPreview: boolean;
  vibrate: boolean;
}

interface NotificationState {
  settings: NotificationSettings;
  permission: NotificationPermission | 'default';
  unreadCount: number;
  
  // Actions
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  requestPermission: () => Promise<void>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
  playSound: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      settings: {
        enabled: true,
        sound: true,
        desktop: true,
        showPreview: true,
        vibrate: true,
      },
      permission: 'default',
      unreadCount: 0,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      requestPermission: async () => {
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          return;
        }

        try {
          const permission = await Notification.requestPermission();
          set({ permission });
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      },

      showNotification: (title, options) => {
        const { settings, permission } = get();
        
        if (!settings.enabled || !settings.desktop) return;
        if (permission !== 'granted') return;
        if (document.hasFocus()) return; // Don't show if app is focused

        try {
          const notification = new Notification(title, {
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            vibrate: settings.vibrate ? [200, 100, 200] : undefined,
            ...options,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Auto close after 5 seconds
          setTimeout(() => notification.close(), 5000);
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      },

      incrementUnread: () => {
        set((state) => ({ unreadCount: state.unreadCount + 1 }));
        
        // Update badge if supported
        if ('setAppBadge' in navigator) {
          const { unreadCount } = get();
          (navigator as any).setAppBadge(unreadCount + 1);
        }
      },

      resetUnread: () => {
        set({ unreadCount: 0 });
        
        // Clear badge
        if ('clearAppBadge' in navigator) {
          (navigator as any).clearAppBadge();
        }
      },

      playSound: () => {
        const { settings } = get();
        if (!settings.sound) return;

        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(console.error);
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Initialize notification permission on load
if (typeof window !== 'undefined' && 'Notification' in window) {
  useNotificationStore.setState({ permission: Notification.permission });
}