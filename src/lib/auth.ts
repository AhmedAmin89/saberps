import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

interface AuthState {
  token: string | null;
  user: {
    id: number;
    username: string;
    role: 'admin' | 'user';
  } | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ redirectTo: string }>;
  logout: () => void;
  getRedirectPath: () => string;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password });
        const { token, user, redirectTo } = response.data;
        
        set({
          token,
          user,
          isAuthenticated: true,
        });

        localStorage.setItem('token', token);
        
        return { redirectTo };
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      getRedirectPath: () => {
        const { user } = get();
        if (!user) return '/login';
        return user.role === 'admin' ? '/admin' : '/dashboard';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);