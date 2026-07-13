import { create } from 'zustand';
import { apiRequest } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signin: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('auth_token'),
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  clearError: () => set({ error: null }),
  
  signin: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      localStorage.setItem('auth_token', data.access_token);
      set({ token: data.access_token, isAuthenticated: true });
      // Fetch user info
      const user = await apiRequest('/auth/me');
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Signin failed', isLoading: false });
      throw err;
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      localStorage.setItem('auth_token', data.access_token);
      set({ token: data.access_token, isAuthenticated: true });
      // Fetch user info
      const user = await apiRequest('/auth/me');
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Signup failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await apiRequest('/auth/me');
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (_) {
      // Token is invalid/expired
      localStorage.removeItem('auth_token');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
