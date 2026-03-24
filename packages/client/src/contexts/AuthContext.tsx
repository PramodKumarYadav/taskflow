import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('tf_token');
    const storedUser = localStorage.getItem('tf_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const persist = (tok: string, u: AuthUser) => {
    localStorage.setItem('tf_token', tok);
    localStorage.setItem('tf_user', JSON.stringify(u));
    setToken(tok);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    persist(res.token, res.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.auth.register({ email, password, name });
    persist(res.token, res.user);
  };

  const logout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
