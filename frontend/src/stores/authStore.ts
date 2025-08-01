import { create } from 'zustand';
import { User } from '@/types';
import api, { tokenManager } from '@/lib/api';
import { socketManager } from '@/lib/socket';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;
    
    tokenManager.setTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true });
    
    // Connect socket after login
    socketManager.connect();
  },

  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    const { user, accessToken, refreshToken } = response.data.data;
    
    tokenManager.setTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true });
    
    // Connect socket after register
    socketManager.connect();
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      socketManager.disconnect();
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        throw new Error('No token');
      }

      const response = await api.get('/auth/me');
      const { user } = response.data.data;
      
      set({ user, isAuthenticated: true });
      socketManager.connect();
    } catch (error) {
      tokenManager.clearTokens();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (user) => set({ user }),
}));