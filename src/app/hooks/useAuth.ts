'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  createElement,
} from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name?: string;
  userType?: 'ARTIST' | 'PROPOSER' | string;
}

export interface RegisterPayload {
  userType: 'ARTIST' | 'PROPOSER';
  name: string;
  email: string;
  password: string;
  handle?: string;
  bio?: string;
  city?: string;
  state?: string;
  cpf?: string;
  cnpj?: string;
  territoryScope?: 'MUNICIPAL' | 'METROPOLITANO' | 'ESTADUAL' | 'NACIONAL';
  coreLanguages?: string[];
  supportLanguages?: string[];
  experienceYears?: number;
  profileLevel?: 'INICIANTE' | 'EMERGENTE' | 'CONSOLIDADO' | 'MESTRE';
  hasCnpjOrMei?: boolean;
  hasTechnicalFormation?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_TOKEN_KEY = 'editaliza-auth-token';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const sameSite = isHttps ? 'SameSite=Lax;Secure' : 'SameSite=Lax';
    document.cookie = `${name}=${value};${expires};path=/;${sameSite}`;
  };

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const sameSite = isHttps ? ';SameSite=Lax;Secure' : '';
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${sameSite}`;
  };

  const saveLocalToken = (value: string | null) => {
    try {
      if (value) {
        localStorage.setItem(STORAGE_TOKEN_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
      }
    } catch {
      // Ignora se localStorage estiver bloqueado
    }
  };

  const readLocalToken = (): string | null => {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = getCookie('auth-token') || readLocalToken();

        if (storedToken) {
          const res = await fetch('/api/auth/me', {
            cache: 'no-store',
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            deleteCookie('auth-token');
            saveLocalToken(null);
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        deleteCookie('auth-token');
        saveLocalToken(null);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();

      if (result.success && result.token) {
        setCookie('auth-token', result.token, 1);
        saveLocalToken(result.token);
        setToken(result.token);
        setUser(result.user || null);
        router.replace('/');
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success && result.token) {
        setCookie('auth-token', result.token, 1);
        saveLocalToken(result.token);
        setToken(result.token);
        setUser(result.user || null);
        router.replace('/');
      }

      return result;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Erro interno do servidor ao cadastrar',
      };
    }
  };

  const logout = () => {
    deleteCookie('auth-token');
    saveLocalToken(null);
    setToken(null);
    setUser(null);
    router.replace('/login');
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};