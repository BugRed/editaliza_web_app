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
  imgUrl?: string | null;
}

export interface RegisterPayload {
  userType: 'ARTIST' | 'PROPOSER';
  name: string;
  email: string;
  password: string;
  /** Foto do perfil (data URL JPEG/PNG/WebP já recortada e reduzida). Obrigatória para artista, opcional para empresa. */
  avatarDataUrl?: string;
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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// A sessão é só o cookie httpOnly que o servidor grava: o JavaScript da página nunca vê o token e não
// há nada em localStorage/sessionStorage nem em document.cookie. O navegador envia o cookie sozinho.
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        setUser(res.ok ? ((await res.json()) as { user: User }).user : null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void checkAuth();
  }, []);

  const authenticate = async (url: string, payload: unknown, failureMessage: string) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as { success: boolean; message?: string; user?: User };

      if (result.success) {
        setUser(result.user || null);
        router.replace('/');
      }

      return result;
    } catch {
      return { success: false, message: failureMessage };
    }
  };

  const login = (email: string, password: string) =>
    authenticate('/api/auth/login', { email, password }, 'Erro interno do servidor');

  const register = (payload: RegisterPayload) =>
    authenticate('/api/auth/register', payload, 'Erro interno do servidor ao cadastrar');

  const logout = async () => {
    // O cookie é httpOnly: só o servidor o apaga. Falha de rede não deve prender o usuário na tela.
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null);
    router.replace('/login');
  };

  const contextValue: AuthContextType = { user, login, register, logout, isLoading };

  return createElement(AuthContext.Provider, { value: contextValue }, children);
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
