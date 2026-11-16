import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './shared/lib/auth-token';

// Rotas públicas que NÃO requerem autenticação
const publicRoutes = [
  '/login',
  '/cadastro',
];

// Rotas de API abertas
const publicApiRoutes = ['/api/health', '/api/auth/login', '/api/auth/register'];

function extractToken(request: NextRequest): string | undefined {
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return undefined;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = extractToken(request);

  // API responde 401 em JSON se não houver token válido (cookie ou Bearer)
  if (pathname.startsWith('/api')) {
    if (publicApiRoutes.some((route) => pathname === route)) {
      return NextResponse.next();
    }
    const isAuthenticated = token ? verifyToken(token) !== null : false;
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Rotas estáticas - permitir acesso
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    if (token && verifyToken(token) !== null) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Toda página que não é pública exige sessão válida: sem token vai para o login (guardando o
  // destino) e token inválido é limpo. A API já responde 401 acima; isto fecha a casca das páginas.
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (verifyToken(token) === null) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};