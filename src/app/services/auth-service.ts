import 'server-only';
import { supabase } from '../lib/supabase/client';
import { generateToken, verifyToken } from '@/shared/lib/auth-token';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: { id: number; email: string; name: string };
}

// Sessão W0: credencial contra user_data + token base64 (shared/lib/auth-token).
// Server-only: consulta o Supabase com a publishable key — a UI passa pelas
// rotas /api/auth/*, nunca por este service. Better Auth (T1.2) substitui tudo.
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data: user, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('email', credentials.email)
        .eq('password', credentials.password)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'Email ou senha incorretos'
        };
      }

      const token = generateToken(user.id, user.email);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    return verifyToken(token) !== null;
  },

  async getCurrentUser(token: string) {
    try {
      const decoded = verifyToken(token);

      if (!decoded) {
        return null;
      }

      const { data: user } = await supabase
        .from('user_data')
        .select('id, email, name')
        .eq('id', decoded.userId)
        .single();

      return user;
    } catch {
      return null;
    }
  }
};
