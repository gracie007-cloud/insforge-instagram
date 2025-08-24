import api from './api';
import { User, UserProfile } from '../types';

interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  async getGoogleAuthUrl() {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const redirectUrl = `${appUrl}/auth/callback`;
    const response = await api.get(`/auth/oauth/google?redirectUrl=${encodeURIComponent(redirectUrl)}`);
    return response.data.authUrl;
  },

  async handleOAuthCallback() {
    // Parse OAuth tokens from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const userId = urlParams.get('user_id');
    const email = urlParams.get('email');
    const name = urlParams.get('name');

    if (accessToken && userId) {
      // Store auth data
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_id', userId);
      
      // Check if user profile exists
      const profile = await this.getUserProfile(userId);
      
      if (!profile) {
        // Create user profile for OAuth user
        const username = email?.split('@')[0] || `user${Date.now()}`;
        await api.post('/database/records/user_profiles', [{
          user_id: userId,
          username: username,
          display_name: name || username
        }], {
          headers: { 'Prefer': 'return=representation' }
        });
      }
      
      return { success: true, userId, email, name };
    }
    
    return { success: false };
  },
  async register(email: string, password: string, username: string, name?: string) {
    const response = await api.post<AuthResponse>('/auth/users', {
      email,
      password,
      name
    });
    
    const { accessToken, user } = response.data;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user_id', user.id);
    
    // Create user profile
    await api.post('/database/records/user_profiles', [{
      user_id: user.id,
      username,
      display_name: name || username
    }], {
      headers: { 'Prefer': 'return=representation' }
    });
    
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/sessions', {
      email,
      password
    });
    
    const { accessToken, user } = response.data;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user_id', user.id);
    
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get<{ user: User }>('/auth/sessions/current');
    return response.data.user;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const response = await api.get<UserProfile[]>(
      `/database/records/user_profiles?user_id=eq.${userId}`
    );
    return response.data[0] || null;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    window.location.href = '/login';
  }
};