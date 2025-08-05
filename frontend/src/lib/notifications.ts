interface NotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
    actions?: NotificationAction[];
    vibrate?: number | number[];
    sound?: string;
    silent?: boolean;
  }
  
  interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
  }
  
  export type NotificationPermission = 'default' | 'granted' | 'denied';
  
  class NotificationManager {
    private permission: NotificationPermission = 'default';
    private soundEnabled: boolean = true;
    private notificationSound: HTMLAudioElement | null = null;
  
    constructor() {
      this.checkPermission();
      this.initializeSound();
    }
  
    private checkPermission() {
      if ('Notification' in window) {
        this.permission = Notification.permission as NotificationPermission;
      }
    }
  
    private initializeSound() {
      // Create audio element for notification sound
      this.notificationSound = new Audio('/sounds/notification.mp3');
      this.notificationSound.volume = 0.5;
    }
  
    async requestPermission(): Promise<NotificationPermission> {
      if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return 'denied';
      }
  
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.permission = permission as NotificationPermission;
      }
  
      return this.permission;
    }
  
    getPermission(): NotificationPermission {
      return this.permission;
    }
  
    async show(title: string, options?: NotificationOptions): Promise<Notification | null> {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return null;
      }
  
      // Request permission if needed
      if (this.permission === 'default') {
        await this.requestPermission();
      }
  
      // Check if permission is granted
      if (this.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }
  
      // Play sound if enabled and not silent
      if (this.soundEnabled && !options?.silent && this.notificationSound) {
        try {
          await this.notificationSound.play();
        } catch (error) {
          console.error('Failed to play notification sound:', error);
        }
      }
  
      // Create notification
      const notification = new Notification(title, {
        ...options,
        timestamp: Date.now()
      });
  
      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
  
        // Emit custom event
        window.dispatchEvent(new CustomEvent('notificationClick', {
          detail: { notification, data: options?.data }
        }));
      };
  
      // Auto close after 5 seconds if not require interaction
      if (!options?.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }
  
      return notification;
    }
  
    async showMessage(
      senderName: string,
      message: string,
      senderAvatar?: string,
      chatId?: string
    ): Promise<Notification | null> {
      return this.show(`New message from ${senderName}`, {
        body: message,
        icon: senderAvatar || '/icon-192x192.png',
        tag: `message-${chatId}`,
        data: { type: 'message', chatId },
        vibrate: [200, 100, 200],
      });
    }
  
    async showCall(
      callerName: string,
      callerAvatar?: string,
      callType: 'audio' | 'video' = 'audio'
    ): Promise<Notification | null> {
      const title = `Incoming ${callType} call`;
      
      return this.show(title, {
        body: `${callerName} is calling...`,
        icon: callerAvatar || '/icon-192x192.png',
        tag: 'incoming-call',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        actions: [
          { action: 'accept', title: 'Accept' },
          { action: 'decline', title: 'Decline' }
        ],
        data: { type: 'call', callType }
      });
    }
  
    async showGroupInvite(
      groupName: string,
      inviterName: string,
      groupAvatar?: string
    ): Promise<Notification | null> {
      return this.show('Group Invitation', {
        body: `${inviterName} invited you to join "${groupName}"`,
        icon: groupAvatar || '/icon-192x192.png',
        tag: 'group-invite',
        actions: [
          { action: 'join', title: 'Join' },
          { action: 'ignore', title: 'Ignore' }
        ],
        data: { type: 'group-invite' }
      });
    }
  
    setSoundEnabled(enabled: boolean) {
      this.soundEnabled = enabled;
    }
  
    isSoundEnabled(): boolean {
      return this.soundEnabled;
    }
  
    setVolume(volume: number) {
      if (this.notificationSound) {
        this.notificationSound.volume = Math.max(0, Math.min(1, volume));
      }
    }
  
    closeAll() {
      // Note: We can't access existing notifications in modern browsers
      // This is a placeholder for platforms that might support it
      console.log('Closing all notifications');
    }
  }
  
  // Service Worker notification handling (for PWA)
  export async function showServiceWorkerNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.ready) {
      console.warn('Service Worker not available');
      return;
    }
  
    const registration = await navigator.serviceWorker.ready;
    
    if ('showNotification' in registration) {
      await registration.showNotification(title, options);
    }
  }
  
  // Notification queue for managing multiple notifications
  export class NotificationQueue {
    private queue: Array<{ title: string; options?: NotificationOptions }> = [];
    private isProcessing: boolean = false;
    private maxConcurrent: number = 3;
    private activeNotifications: Set<Notification> = new Set();
  
    async add(title: string, options?: NotificationOptions) {
      this.queue.push({ title, options });
      if (!this.isProcessing) {
        this.process();
      }
    }
  
    private async process() {
      if (this.isProcessing || this.queue.length === 0) return;
      
      this.isProcessing = true;
  
      while (this.queue.length > 0 && this.activeNotifications.size < this.maxConcurrent) {
        const item = this.queue.shift();
        if (item) {
          const notification = await notificationManager.show(item.title, item.options);
          if (notification) {
            this.activeNotifications.add(notification);
            
            // Remove from active when closed
            notification.onclose = () => {
              this.activeNotifications.delete(notification);
            };
          }
        }
      }
  
      this.isProcessing = false;
  
      // Continue processing if there are more items
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), 1000);
      }
    }
  
    clear() {
      this.queue = [];
    }
  }
  
  // Create singleton instances
  export const notificationManager = new NotificationManager();
  export const notificationQueue = new NotificationQueue();
  
  // Helper functions
  export function canShowNotifications(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
  
  export function formatNotificationTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  }