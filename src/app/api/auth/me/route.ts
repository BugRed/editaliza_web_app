import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/app/services/auth-service';

// Sessão corrente para o AuthProvider montar o usuário na primeira carga.
// Protegida pelo middleware como todo /api/* — o handler re-valida o token
// e devolve o perfil.
export async function GET() {
  const token = (await cookies()).get('auth-token')?.value;

  if (!token || !(await authService.verifyToken(token))) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const user = await authService.getCurrentUser(token);

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
