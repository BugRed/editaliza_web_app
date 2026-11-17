import 'server-only';
import { supabase } from '../lib/supabase/client';
import { env } from '@/shared/lib/env';
import { createSessionToken, readSessionToken } from '@/shared/lib/auth-token';
import { verifyPassword } from '@db/password.mjs';

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
  /** Só para a rota gravar no cookie httpOnly: nunca vai no corpo da resposta. */
  token?: string;
  user?: AuthUserSummary;
}

// Ordem de busca e o tipo que cada tabela implica quando a linha não traz `userType`.
const ACCOUNT_TABLES: Array<{ table: string; fallbackType?: 'ARTIST' | 'PROPOSER' }> = [
  { table: 'user_data' },
  { table: 'artist_data', fallbackType: 'ARTIST' },
  { table: 'proposer_data', fallbackType: 'PROPOSER' },
];

function toSummary(row: Record<string, unknown>, fallbackType?: 'ARTIST' | 'PROPOSER'): AuthUserSummary {
  return {
    id: Number(row.id),
    email: String(row.email),
    name: String(row.name),
    userType: fallbackType ?? String(row.userType || 'ARTIST'),
  };
}

async function findAccountByCredentials(email: string, password: string): Promise<AuthUserSummary | null> {
  for (const { table, fallbackType } of ACCOUNT_TABLES) {
    // A senha é lida só aqui, para comparar o hash; nenhuma outra rota seleciona essa coluna.
    const { data } = await supabase.from(table).select('id, email, name, userType, password').eq('email', email).single();
    if (!data) continue;
    const row = data as unknown as Record<string, unknown>;
    if (await verifyPassword(password, row.password)) return toSummary(row, fallbackType);
  }
  return null;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const account = await findAccountByCredentials(credentials.email.trim(), credentials.password);
      if (!account) return { success: false, message: 'Email ou senha incorretos' };

      const token = await createSessionToken(account.id, account.email, env.AUTH_SECRET);
      return { success: true, token, user: account };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    return (await readSessionToken(token, env.AUTH_SECRET)) !== null;
  },

  async getCurrentUser(token: string): Promise<AuthUserSummary | null> {
    try {
      const session = await readSessionToken(token, env.AUTH_SECRET);
      if (!session) return null;

      for (const { table, fallbackType } of ACCOUNT_TABLES) {
        const { data } = await supabase
          .from(table)
          .select('id, email, name, userType')
          .eq('id', Number(session.userId))
          .eq('email', session.email)
          .single();
        if (data) return toSummary(data as unknown as Record<string, unknown>, fallbackType);
      }
      return null;
    } catch {
      return null;
    }
  },
};
