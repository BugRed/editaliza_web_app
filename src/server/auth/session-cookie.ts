import { SESSION_TTL_SECONDS } from '@/shared/lib/auth-token';

export const SESSION_COOKIE = 'auth-token';

// httpOnly: o JavaScript da página nunca lê o token (nem localStorage, nem document.cookie), então XSS
// não rouba a sessão. SameSite=Lax barra o envio em requisição cross-site que muda estado.
export function sessionCookieOptions(isHttps: boolean) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isHttps,
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function isHttpsRequest(request: Request): boolean {
  return request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://');
}
