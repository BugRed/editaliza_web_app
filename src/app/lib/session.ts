import 'server-only';
import { cookies, headers } from 'next/headers';
import { authService, type AuthUserSummary } from '@/app/services/auth-service';

/**
 * Usuário da sessão atual, lido do cookie ou do Bearer. O middleware já barra requisição sem token
 * válido em /api, mas o handler precisa saber QUEM é para decidir se pode agir sobre aquele recurso.
 */
export async function getSessionUser(): Promise<AuthUserSummary | null> {
  const cookieToken = (await cookies()).get('auth-token')?.value;
  const authHeader = (await headers()).get('authorization');
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : undefined;
  const token = cookieToken || bearerToken;
  if (!token) return null;
  return authService.getCurrentUser(token);
}
