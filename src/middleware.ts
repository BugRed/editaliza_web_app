import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readSessionToken } from './shared/lib/auth-token';

const SESSION_COOKIE = 'auth-token';

// Rotas públicas que NÃO requerem autenticação
const publicRoutes = ['/login', '/cadastro'];

// Rotas de API abertas: liveness, entrada da sessão (login e cadastro) e saída (logout)
const publicApiRoutes = ['/api/health', '/api/auth/login', '/api/auth/register', '/api/auth/logout'];

// Só o cookie httpOnly conta: não há Authorization Bearer nem token em storage do navegador.
// Sem AUTH_SECRET utilizável a verificação falha fechada (ninguém autentica).
async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return (await readSessionToken(token, process.env.AUTH_SECRET)) !== null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API responde 401 em JSON, nunca redirect: cliente de API não deve seguir para /login
  if (pathname.startsWith('/api')) {
    if (publicApiRoutes.includes(pathname)) return NextResponse.next();
    if (!(await hasValidSession(request))) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Rotas estáticas - permitir acesso
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSession(request);
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  if (isPublicRoute) {
    return authenticated ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
  }

  // Toda página que não é pública exige sessão válida: sem ela vai ao login (guardando o destino) e o
  // cookie inválido é limpo. A API já responde 401 acima; isto fecha a casca das páginas.
  if (!authenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
