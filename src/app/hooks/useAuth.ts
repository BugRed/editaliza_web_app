'use client';

import { 
  useState, 
  useEffect, 
  createContext, 
  useContext, 
  ReactNode,
  createElement 
} from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth-service';

// Interfaces
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para o AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Funções auxiliares para cookies
  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  };

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  };

  // Verificar autenticação ao carregar
  const checkAuth = async () => {
    try {
      const token = getCookie('auth-token');
      
      if (token && await authService.verifyToken(token)) {
        const userData = await authService.getCurrentUser(token);
        setUser(userData);
      } else {
        deleteCookie('auth-token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      deleteCookie('auth-token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password });
      
      if (result.success && result.token) {
        setCookie('auth-token', result.token, 1); // 1 dia
        setUser(result.user || null);
        router.push('/');
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  };

  // Função de logout
  const logout = () => {
    deleteCookie('auth-token');
    setUser(null);
    router.push('/login');
  };

  // Valor do contexto
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

// Hook personalizado
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};