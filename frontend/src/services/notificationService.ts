import api from '../lib/api';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationPreferences {
  messages: boolean;
  mentions: boolean;
  calls: boolean;
  groupInvites: boolean;
  sound: boolean;
  vibration: boolean;
  preview: boolean;
  desktopNotifications: boolean;
}

class NotificationService {
  private readonly NOTIFICATION_ENDPOINTS = {
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe',
    PREFERENCES: '/notifications/preferences',
    TEST: '/notifications/test',
    HISTORY: '/notifications/history',
    MARK_READ: '/notifications/:id/read',
    CLEAR_ALL: '/notifications/clear',
  };

  private swRegistration: ServiceWorkerRegistration | null = null;
  private notificationSound: HTMLAudioElement | null = null;

  constructor() {
    this.initializeNotificationSound();
  }

  private initializeNotificationSound(): void {
    this.notificationSound = new Audio('/sounds/notification.mp3');
    this.notificationSound.volume = 0.5;
  }

  async initialize(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.ready;
      
      // Request notification permission
      await this.requestPermission();
      
      // Subscribe to push notifications if permission granted
      if (Notification.permission === 'granted') {
        await this.subscribeToPush();
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return Notification.permission;
  }

  private async subscribeToPush(): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service worker not registered');
    }

    try {
      // Check if already subscribed
      let subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);
        
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    await api.post(this.NOTIFICATION_ENDPOINTS.SUBSCRIBE, subscriptionData);
  }

  async unsubscribe(): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await api.post(this.NOTIFICATION_ENDPOINTS.UNSUBSCRIBE, {
          endpoint: subscription.endpoint,
        });
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Play notification sound if enabled
    const preferences = await this.getPreferences();
    if (preferences.sound && this.notificationSound) {
      this.notificationSound.play().catch(console.error);
    }

    if (this.swRegistration) {
      // Use service worker for rich notifications
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/pwa-192x192.png',
        badge: payload.badge || '/pwa-192x192.png',
        image: payload.image,
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
        timestamp: payload.timestamp || Date.now(),
      });
    } else {
      // Fallback to basic notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/pwa-192x192.png',
      });
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get<NotificationPreferences>(
        this.NOTIFICATION_ENDPOINTS.PREFERENCES
      );
      return response.data;
    } catch (error) {
      // Return default preferences if request fails
      return {
        messages: true,
        mentions: true,
        calls: true,
        groupInvites: true,
        sound: true,
        vibration: true,
        preview: true,
        desktopNotifications: true,
      };
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    await api.patch(this.NOTIFICATION_ENDPOINTS.PREFERENCES, preferences);
  }

  async testNotification(): Promise<void> {
    await api.post(this.NOTIFICATION_ENDPOINTS.TEST);
  }

  async getNotificationHistory(limit = 50): Promise<NotificationPayload[]> {
    const response = await api.get<NotificationPayload[]>(
      this.NOTIFICATION_ENDPOINTS.HISTORY,
      { params: { limit } }
    );
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await api.post(
      this.NOTIFICATION_ENDPOINTS.MARK_READ.replace(':id', notificationId)
    );
  }

  async clearAllNotifications(): Promise<void> {
    await api.post(this.NOTIFICATION_ENDPOINTS.CLEAR_ALL);
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Handle notification events
  async handleNotificationClick(event: NotificationEvent): Promise<void> {
    const notification = event.notification;
    const action = event.action;
    const data = notification.data;

    // Close the notification
    notification.close();

    // Handle different actions
    switch (action) {
      case 'reply':
        // Handle quick reply
        if (data?.conversationId) {
          // Navigate to conversation
          window.location.href = `/chat/${data.conversationId}`;
        }
        break;
      case 'mark-read':
        // Mark message as read
        if (data?.messageId) {
          await api.post(`/messages/${data.messageId}/read`);
        }
        break;
      default:
        // Default action - open the app
        if (data?.conversationId) {
          window.location.href = `/chat/${data.conversationId}`;
        } else {
          window.location.href = '/';
        }
    }
  }

  // Create notification for different types
  createMessageNotification(data: {
    sender: string;
    message: string;
    avatar?: string;
    conversationId: string;
    messageId: string;
  }): NotificationPayload {
    return {
      title: data.sender,
      body: data.message,
      icon: data.avatar,
      tag: `message-${data.conversationId}`,
      data: {
        type: 'message',
        conversationId: data.conversationId,
        messageId: data.messageId,
      },
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'mark-read', title: 'Mark as Read' },
      ],
    };
  }

  createCallNotification(data: {
    caller: string;
    type: 'voice' | 'video';
    avatar?: string;
    callId: string;
  }): NotificationPayload {
    return {
      title: `${data.type === 'video' ? 'Video' : 'Voice'} Call`,
      body: `${data.caller} is calling...`,
      icon: data.avatar,
      tag: `call-${data.callId}`,
      requireInteraction: true,
      data: {
        type: 'call',
        callId: data.callId,
      },
      actions: [
        { action: 'answer', title: 'Answer' },
        { action: 'decline', title: 'Decline' },
      ],
    };
  }

  createMentionNotification(data: {
    sender: string;
    group: string;
    message: string;
    avatar?: string;
    conversationId: string;
    messageId: string;
  }): NotificationPayload {
    return {
      title: `${data.sender} mentioned you in ${data.group}`,
      body: data.message,
      icon: data.avatar,
      tag: `mention-${data.conversationId}`,
      data: {
        type: 'mention',
        conversationId: data.conversationId,
        messageId: data.messageId,
      },
    };
  }
}

export default new NotificationService();