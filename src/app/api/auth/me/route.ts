import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { authService } from '@/app/services/auth-service';

// Sessão corrente para o AuthProvider montar o usuário na primeira carga.
export async function GET() {
  const cookieToken = (await cookies()).get('auth-token')?.value;
  const authHeader = (await headers()).get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : undefined;

  const token = cookieToken || bearerToken;

  if (!token || !(await authService.verifyToken(token))) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const user = await authService.getCurrentUser(token);

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
