// src/services/authService.ts
import api from '../lib/api';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface TwoFactorData {
  userId: string;
  code: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

class AuthService {
  private readonly AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    TWO_FACTOR: '/auth/2fa',
    VERIFY_2FA: '/auth/verify-2fa',
    ME: '/auth/me',
  };

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      this.AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      this.AUTH_ENDPOINTS.REGISTER,
      data
    );
    
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    try {
      await api.post(this.AUTH_ENDPOINTS.LOGOUT, { refreshToken });
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ accessToken: string }>(
      this.AUTH_ENDPOINTS.REFRESH,
      { refreshToken }
    );

    const { accessToken } = response.data;
    this.setAccessToken(accessToken);
    
    return accessToken;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(this.AUTH_ENDPOINTS.ME);
    return response.data;
  }

  async verifyEmail(token: string): Promise<void> {
    await api.post(this.AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post(this.AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await api.post(this.AUTH_ENDPOINTS.RESET_PASSWORD, data);
  }

  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await api.post<{ qrCode: string; secret: string }>(
      this.AUTH_ENDPOINTS.TWO_FACTOR
    );
    return response.data;
  }

  async verify2FA(data: TwoFactorData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      this.AUTH_ENDPOINTS.VERIFY_2FA,
      data
    );
    
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  // Token management
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private setAccessToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // OAuth methods
  async loginWithGoogle(): Promise<void> {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }

  async loginWithGithub(): Promise<void> {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  }

  async handleOAuthCallback(): Promise<AuthResponse> {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      throw new Error('OAuth callback missing tokens');
    }

    this.setTokens(accessToken, refreshToken);
    
    const user = await this.getCurrentUser();
    return { user, accessToken, refreshToken };
  }
}

export default new AuthService();