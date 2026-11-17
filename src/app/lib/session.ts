import 'server-only';
import { cookies } from 'next/headers';
import { authService, type AuthUserSummary } from '@/app/services/auth-service';
import { SESSION_COOKIE } from '@/server/auth/session-cookie';

/**
 * Usuário da sessão atual, lido do cookie httpOnly. O middleware já barra requisição sem sessão
 * válida em /api, mas o handler precisa saber QUEM é para decidir se pode agir sobre aquele recurso.
 */
export async function getSessionUser(): Promise<AuthUserSummary | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return authService.getCurrentUser(token);
}
