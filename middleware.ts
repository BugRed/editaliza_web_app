import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authService } from './src/app/services/auth-service';

// Rotas públicas que NÃO requerem autenticação
const publicRoutes = [
  '/login',
  '/cadastro',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

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
        const isValid = await authService.verifyToken(token);
        if (isValid) {
          // Se já estiver autenticado, redirecionar para home
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error) {
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
    const isValid = await authService.verifyToken(token);
    if (!isValid) {
      throw new Error('Token inválido');
    }
    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};