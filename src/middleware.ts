import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './shared/lib/auth-token';

// Rotas públicas que NÃO requerem autenticação
const publicRoutes = [
  '/login',
  '/cadastro',
];

// Rotas de API abertas: liveness para deploy/cron e login (porta de entrada
// da sessão — não há token a apresentar antes de existir sessão)
const publicApiRoutes = ['/api/health', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // API responde 401 em JSON, nunca redirect: cliente de API não deve
  // seguir para /login e receber HTML de status 200
  if (pathname.startsWith('/api')) {
    if (publicApiRoutes.some((route) => pathname === route)) {
      return NextResponse.next();
    }
    const isAuthenticated = token
      ? verifyToken(token) !== null
      : false;
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Rotas estáticas - permitir acesso
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // arquivos com extensão
  ) {
    return NextResponse.next();
  }

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Se for rota pública
  if (isPublicRoute) {
    if (token) {
      try {
        const isValid = verifyToken(token) !== null;
        if (isValid) {
          // Se já estiver autenticado, redirecionar para home
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch {
        // Token inválido, permitir acesso à rota pública
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // PARA TODAS AS OUTRAS ROTAS (incluindo '/') - VERIFICAR AUTENTICAÇÃO
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const isValid = verifyToken(token) !== null;
    if (!isValid) {
      throw new Error('Token inválido');
    }
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};