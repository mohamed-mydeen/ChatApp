import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (e: string, p: string) => Promise<any>;
  register: (u: string, e: string, p: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
  updateUser: (data: Partial<any>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Start loading for initial check
  const [error, setError] = useState<string | null>(null);

  const fetchAuth = async (endpoint: string, body?: any) => {
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: body ? 'POST' : 'GET',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await fetchAuth('/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data = await fetchAuth('/register', { username, email, password });
      // NOTE: We intentionally do NOT setUser/setToken here.
      // AuthScreen shows the "You're all set" screen first, then calls login() on "Enter Chat".
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (token) await fetchAuth('/logout', {});
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const checkAuth = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return false;
    }
    try {
      const data = await fetchAuth('/me');
      setUser(data.user);
      return true;
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const clearError = () => setError(null);

  const updateUser = (data: Partial<any>) => {
    setUser((prev: any) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, checkAuth, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
