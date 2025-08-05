// src/services/userService.ts
import api from '../lib/api';
import { User, UserStatus, UserPreferences } from '../types';

interface UpdateProfileData {
  username?: string;
  fullName?: string;
  bio?: string;
  avatar?: File;
  status?: UserStatus;
}

interface SearchUsersParams {
  query: string;
  limit?: number;
  offset?: number;
  excludeContacts?: boolean;
}

interface BlockUserData {
  userId: string;
  reason?: string;
}

interface PrivacySettings {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  profilePhoto: 'everyone' | 'contacts' | 'nobody';
  status: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  typing: boolean;
}

interface NotificationSettings {
  messages: boolean;
  mentions: boolean;
  calls: boolean;
  sound: boolean;
  vibration: boolean;
  preview: boolean;
}

class UserService {
  private readonly USER_ENDPOINTS = {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    SEARCH: '/users/search',
    GET_USER: '/users/:id',
    CONTACTS: '/users/contacts',
    ADD_CONTACT: '/users/contacts',
    REMOVE_CONTACT: '/users/contacts/:id',
    BLOCK: '/users/block',
    UNBLOCK: '/users/unblock/:id',
    BLOCKED_LIST: '/users/blocked',
    STATUS: '/users/status',
    PREFERENCES: '/users/preferences',
    PRIVACY: '/users/privacy',
    NOTIFICATIONS: '/users/notifications',
    PRESENCE: '/users/presence',
    REPORT: '/users/:id/report',
  };

  async getProfile(): Promise<User> {
    const response = await api.get<User>(this.USER_ENDPOINTS.PROFILE);
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const formData = new FormData();
    
    if (data.username) formData.append('username', data.username);
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.bio) formData.append('bio', data.bio);
    if (data.status) formData.append('status', data.status);
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await api.patch<User>(
      this.USER_ENDPOINTS.UPDATE_PROFILE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async searchUsers(params: SearchUsersParams): Promise<{ users: User[]; total: number }> {
    const response = await api.get<{ users: User[]; total: number }>(
      this.USER_ENDPOINTS.SEARCH,
      { params }
    );
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    const response = await api.get<User>(
      this.USER_ENDPOINTS.GET_USER.replace(':id', userId)
    );
    return response.data;
  }

  async getContacts(): Promise<User[]> {
    const response = await api.get<User[]>(this.USER_ENDPOINTS.CONTACTS);
    return response.data;
  }

  async addContact(userId: string): Promise<User> {
    const response = await api.post<User>(
      this.USER_ENDPOINTS.ADD_CONTACT,
      { userId }
    );
    return response.data;
  }

  async removeContact(userId: string): Promise<void> {
    await api.delete(
      this.USER_ENDPOINTS.REMOVE_CONTACT.replace(':id', userId)
    );
  }

  async blockUser(data: BlockUserData): Promise<void> {
    await api.post(this.USER_ENDPOINTS.BLOCK, data);
  }

  async unblockUser(userId: string): Promise<void> {
    await api.delete(
      this.USER_ENDPOINTS.UNBLOCK.replace(':id', userId)
    );
  }

  async getBlockedUsers(): Promise<User[]> {
    const response = await api.get<User[]>(this.USER_ENDPOINTS.BLOCKED_LIST);
    return response.data;
  }

  async updateStatus(status: UserStatus): Promise<void> {
    await api.patch(this.USER_ENDPOINTS.STATUS, { status });
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.patch<UserPreferences>(
      this.USER_ENDPOINTS.PREFERENCES,
      preferences
    );
    return response.data;
  }

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response = await api.patch<PrivacySettings>(
      this.USER_ENDPOINTS.PRIVACY,
      settings
    );
    return response.data;
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await api.patch<NotificationSettings>(
      this.USER_ENDPOINTS.NOTIFICATIONS,
      settings
    );
    return response.data;
  }

  async updatePresence(isOnline: boolean): Promise<void> {
    await api.post(this.USER_ENDPOINTS.PRESENCE, { isOnline });
  }

  async reportUser(userId: string, reason: string, description?: string): Promise<void> {
    await api.post(
      this.USER_ENDPOINTS.REPORT.replace(':id', userId),
      { reason, description }
    );
  }

  // Utility methods
  getUserInitials(user: User): string {
    if (user.fullName) {
      return user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.username.slice(0, 2).toUpperCase();
  }

  getUserDisplayName(user: User): string {
    return user.fullName || user.username;
  }

  isUserOnline(lastSeen: string | Date): boolean {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / 60000;
    return diffMinutes < 5; // Consider online if active in last 5 minutes
  }

  formatLastSeen(lastSeen: string | Date): string {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    if (diffDays === 1) return 'Active yesterday';
    if (diffDays < 7) return `Active ${diffDays} days ago`;
    
    return `Active on ${date.toLocaleDateString()}`;
  }
}

export default new UserService();