import { create } from 'zustand';
import { User, UserRole } from '../types.js';
import { authAPI } from '../services/api.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  activeAuthView: 'login' | 'register' | null;
  setActiveAuthView: (view: 'login' | 'register' | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const roleCredentials: Record<UserRole, { email: string; pass: string }> = {
  PLATFORM_ADMIN: { email: 'admin@eventforge.com', pass: 'password123' },
  EVENT_ORGANIZER: { email: 'organizer@eventforge.com', pass: 'password123' },
  EVENT_STAFF: { email: 'staff@eventforge.com', pass: 'password123' },
  SPEAKER: { email: 'speaker@eventforge.com', pass: 'password123' },
  ATTENDEE: { email: 'attendee@eventforge.com', pass: 'password123' },
  SPONSOR: { email: 'sponsor@eventforge.com', pass: 'password123' },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('eventforge_token'),
  isLoading: false,
  error: null,
  activeAuthView: null,

  setActiveAuthView: (view) => set({ activeAuthView: view, error: null }),
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.login(email, password);
      const { token, user } = res.data.data;
      localStorage.setItem('eventforge_token', token);
      set({ user, token, isLoading: false, activeAuthView: null });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  quickLogin: async (role: UserRole) => {
    const creds = roleCredentials[role];
    if (!creds) return false;
    return await get().login(creds.email, creds.pass);
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.register(userData);
      const { token, user } = res.data.data;
      localStorage.setItem('eventforge_token', token);
      set({ user, token, isLoading: false, activeAuthView: null });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('eventforge_token');
    authAPI.logout().catch(() => {});
    set({ user: null, token: null, activeAuthView: 'login' });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('eventforge_token');
    if (!token) {
      // If no token exists, let user choose to login, register, or browse
      set({ user: null, activeAuthView: null });
      return;
    }

    try {
      const res = await authAPI.getMe();
      if (res.data.success && res.data.data) {
        set({ user: res.data.data, token, activeAuthView: null });
      } else {
        localStorage.removeItem('eventforge_token');
        set({ user: null, token: null });
      }
    } catch (err) {
      localStorage.removeItem('eventforge_token');
      set({ user: null, token: null });
    }
  },
}));
