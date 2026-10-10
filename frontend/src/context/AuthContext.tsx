import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  streakDays?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  refreshUser: () => Promise<void>;
  updateUserBalance: (coins: number, xp: number, level: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('flora_token');
    } catch {
      return null;
    }
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem('flora_guest_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsGuest(false);
        try {
          localStorage.removeItem('flora_guest_mode');
        } catch {}
      } else {
        // If token expired or invalid
        if (token) {
          localStorage.removeItem('flora_token');
          setToken(null);
        }
      }
    } catch (err) {
      console.warn('[AuthProvider] Failed to refresh user profile:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (identifier: string, password: string) => {
    const res = await api.login({ identifier, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      setIsGuest(false);
      try {
        localStorage.setItem('flora_token', res.data.token);
        localStorage.removeItem('flora_guest_mode');
      } catch {}
      closeAuthModal();
      return { success: true };
    }
    return {
      success: false,
      message: res.error?.message || 'Login failed. Please verify credentials.',
    };
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await api.register({ email, username, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      setIsGuest(false);
      try {
        localStorage.setItem('flora_token', res.data.token);
        localStorage.removeItem('flora_guest_mode');
      } catch {}
      closeAuthModal();
      return { success: true };
    }
    return {
      success: false,
      message: res.error?.message || 'Registration failed. Email or username may already exist.',
    };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
    setIsGuest(true);
    try {
      localStorage.removeItem('flora_token');
      localStorage.setItem('flora_guest_mode', 'true');
    } catch {}
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    try {
      localStorage.setItem('flora_guest_mode', 'true');
    } catch {}
    closeAuthModal();
  };

  const updateUserBalance = (coins: number, xp: number, level: number) => {
    if (user) {
      setUser({ ...user, coins, xp, level });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isGuest,
        loading,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        continueAsGuest,
        refreshUser,
        updateUserBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
