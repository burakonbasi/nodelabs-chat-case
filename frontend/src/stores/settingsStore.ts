import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  enabled: boolean;
  messageNotifications: boolean;
  mentionNotifications: boolean;
  groupNotifications: boolean;
  callNotifications: boolean;
  sound: boolean;
  vibration: boolean;
  preview: boolean;
  desktopNotifications: boolean;
}

export interface PrivacySettings {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  profilePhoto: 'everyone' | 'contacts' | 'nobody';
  about: 'everyone' | 'contacts' | 'nobody';
  status: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  typingIndicators: boolean;
  onlineStatus: boolean;
}

export interface ChatSettings {
  enterToSend: boolean;
  mediaAutoDownload: {
    photos: boolean;
    videos: boolean;
    files: boolean;
  };
  autoplayVideos: boolean;
  autoplayGifs: boolean;
  linkPreviews: boolean;
  messageTextSize: 'small' | 'medium' | 'large';
  chatBackground: string | null;
  soundEffects: boolean;
  showMessageTimestamps: boolean;
  compactMode: boolean;
}

export interface MediaSettings {
  imageQuality: 'auto' | 'high' | 'medium' | 'low';
  videoQuality: 'auto' | '1080p' | '720p' | '480p';
  autoSaveMedia: boolean;
  saveToGallery: boolean;
  reducedDataUsage: boolean;
  uploadSizeLimit: number; // in MB
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  biometricAuth: boolean;
  screenLock: boolean;
  screenLockTimeout: number; // in minutes
  blockedUsers: string[];
  showSecurityNotifications: boolean;
  encryptBackups: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardShortcuts: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: '12h' | '24h';
  startOfWeek: 'sunday' | 'monday';
  autoNightMode: boolean;
  autoNightModeStart: string; // HH:MM
  autoNightModeEnd: string; // HH:MM
}

interface SettingsState {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  chat: ChatSettings;
  media: MediaSettings;
  security: SecuritySettings;
  accessibility: AccessibilitySettings;
  general: GeneralSettings;
  
  // Actions
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
  updateMediaSettings: (settings: Partial<MediaSettings>) => void;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  
  // Security actions
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;
  
  // Utility actions
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (data: string) => boolean;
}

const defaultSettings = {
  notifications: {
    enabled: true,
    messageNotifications: true,
    mentionNotifications: true,
    groupNotifications: true,
    callNotifications: true,
    sound: true,
    vibration: true,
    preview: true,
    desktopNotifications: true,
  },
  privacy: {
    lastSeen: 'everyone' as const,
    profilePhoto: 'everyone' as const,
    about: 'everyone' as const,
    status: 'everyone' as const,
    readReceipts: true,
    typingIndicators: true,
    onlineStatus: true,
  },
  chat: {
    enterToSend: true,
    mediaAutoDownload: {
      photos: true,
      videos: false,
      files: false,
    },
    autoplayVideos: true,
    autoplayGifs: true,
    linkPreviews: true,
    messageTextSize: 'medium' as const,
    chatBackground: null,
    soundEffects: true,
    showMessageTimestamps: true,
    compactMode: false,
  },
  media: {
    imageQuality: 'auto' as const,
    videoQuality: 'auto' as const,
    autoSaveMedia: false,
    saveToGallery: false,
    reducedDataUsage: false,
    uploadSizeLimit: 100, // 100MB
  },
  security: {
    twoFactorAuth: false,
    biometricAuth: false,
    screenLock: false,
    screenLockTimeout: 5,
    blockedUsers: [],
    showSecurityNotifications: true,
    encryptBackups: true,
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium' as const,
    keyboardShortcuts: true,
    screenReaderOptimized: false,
    colorBlindMode: 'none' as const,
  },
  general: {
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: '12h' as const,
    startOfWeek: 'sunday' as const,
    autoNightMode: false,
    autoNightModeStart: '20:00',
    autoNightModeEnd: '06:00',
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updatePrivacySettings: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      updateChatSettings: (settings) =>
        set((state) => ({
          chat: { ...state.chat, ...settings },
        })),

      updateMediaSettings: (settings) =>
        set((state) => ({
          media: { ...state.media, ...settings },
        })),

      updateSecuritySettings: (settings) =>
        set((state) => ({
          security: { ...state.security, ...settings },
        })),

      updateAccessibilitySettings: (settings) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings },
        })),

      updateGeneralSettings: (settings) =>
        set((state) => ({
          general: { ...state.general, ...settings },
        })),

      blockUser: (userId) =>
        set((state) => ({
          security: {
            ...state.security,
            blockedUsers: [...new Set([...state.security.blockedUsers, userId])],
          },
        })),

      unblockUser: (userId) =>
        set((state) => ({
          security: {
            ...state.security,
            blockedUsers: state.security.blockedUsers.filter((id) => id !== userId),
          },
        })),

      isUserBlocked: (userId) => {
        const state = get();
        return state.security.blockedUsers.includes(userId);
      },

      resetSettings: () => set(defaultSettings),

      exportSettings: () => {
        const state = get();
        const exportData = {
          notifications: state.notifications,
          privacy: state.privacy,
          chat: state.chat,
          media: state.media,
          security: {
            ...state.security,
            blockedUsers: [], // Don't export blocked users for privacy
          },
          accessibility: state.accessibility,
          general: state.general,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importSettings: (data) => {
        try {
          const importedSettings = JSON.parse(data);
          
          // Validate the imported data structure
          if (
            importedSettings.notifications &&
            importedSettings.privacy &&
            importedSettings.chat &&
            importedSettings.media &&
            importedSettings.security &&
            importedSettings.accessibility &&
            importedSettings.general
          ) {
            set({
              notifications: { ...defaultSettings.notifications, ...importedSettings.notifications },
              privacy: { ...defaultSettings.privacy, ...importedSettings.privacy },
              chat: { ...defaultSettings.chat, ...importedSettings.chat },
              media: { ...defaultSettings.media, ...importedSettings.media },
              security: { ...defaultSettings.security, ...importedSettings.security },
              accessibility: { ...defaultSettings.accessibility, ...importedSettings.accessibility },
              general: { ...defaultSettings.general, ...importedSettings.general },
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to import settings:', error);
          return false;
        }
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        privacy: state.privacy,
        chat: state.chat,
        media: state.media,
        security: state.security,
        accessibility: state.accessibility,
        general: state.general,
      }),
    }
  )
);