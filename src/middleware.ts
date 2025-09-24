import { NextRequest, NextResponse } from 'next/server';

// Middleware disabled for test mode — allow all requests through
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
