import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/cadastro', '/api/auth/login', '/api/auth/setup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso às rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir acesso aos assets estáticos
  if (pathname.startsWith('/_next') || pathname.startsWith('/assets')) {
    return NextResponse.next();
  }

  // Verificar token para rotas protegidas
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirecionar para login se não há token
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificar se o token é válido
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    // Token inválido, redirecionar para login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Remover cookie inválido
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that don't need protection)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
