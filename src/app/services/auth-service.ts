import 'server-only';
import { supabase } from '../lib/supabase/client';
import { generateToken, verifyToken } from '@/shared/lib/auth-token';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUserSummary {
  id: number;
  email: string;
  name: string;
  userType: 'ARTIST' | 'PROPOSER' | string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUserSummary;
}

async function findAccountByCredentials(email: string, password: string) {
  const { data: userRow } = await supabase
    .from('user_data')
    .select('id, email, name, userType')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (userRow) {
    return userRow as unknown as AuthUserSummary;
  }

  const { data: artistRow } = await supabase
    .from('artist_data')
    .select('id, email, name, userType')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (artistRow) {
    return {
      ...(artistRow as unknown as AuthUserSummary),
      userType: 'ARTIST',
    };
  }

  const { data: proposerRow } = await supabase
    .from('proposer_data')
    .select('id, email, name, userType')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (proposerRow) {
    return {
      ...(proposerRow as unknown as AuthUserSummary),
      userType: 'PROPOSER',
    };
  }

  return null;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const account = await findAccountByCredentials(
        credentials.email.trim(),
        credentials.password
      );

      if (!account) {
        return {
          success: false,
          message: 'Email ou senha incorretos',
        };
      }

      const token = generateToken(account.id, account.email);

      return {
        success: true,
        token,
        user: {
          id: Number(account.id),
          email: String(account.email),
          name: String(account.name),
          userType: String(account.userType || 'ARTIST'),
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    return verifyToken(token) !== null;
  },

  async getCurrentUser(token: string): Promise<AuthUserSummary | null> {
    try {
      const decoded = verifyToken(token);
      if (!decoded) return null;

      const userId = Number(decoded.userId);
      const email = decoded.email;

      const { data: userRow } = await supabase
        .from('user_data')
        .select('id, email, name, userType')
        .eq('id', userId)
        .eq('email', email)
        .single();

      if (userRow) {
        return userRow as unknown as AuthUserSummary;
      }

      const { data: proposerRow } = await supabase
        .from('proposer_data')
        .select('id, email, name, userType')
        .eq('id', userId)
        .eq('email', email)
        .single();

      if (proposerRow) {
        return {
          ...(proposerRow as unknown as AuthUserSummary),
          userType: 'PROPOSER',
        };
      }

      const { data: artistRow } = await supabase
        .from('artist_data')
        .select('id, email, name, userType')
        .eq('id', userId)
        .eq('email', email)
        .single();

      if (artistRow) {
        return {
          ...(artistRow as unknown as AuthUserSummary),
          userType: 'ARTIST',
        };
      }

      return null;
    } catch {
      return null;
    }
  },
};
