import { NextResponse } from 'next/server';
import { authService } from '@/app/services/auth-service';

// Porta de entrada da sessão: listada em publicApiRoutes no middleware —
// é a única rota de API que responde sem token.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; password?: unknown }
    | null;

  if (
    !body ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string' ||
    body.email === '' ||
    body.password === ''
  ) {
    return NextResponse.json(
      { success: false, message: 'Email e senha são obrigatórios.' },
      { status: 400 }
    );
  }

  const result = await authService.login({
    email: body.email,
    password: body.password,
  });

  return NextResponse.json(result, { status: result.success ? 200 : 401 });
}
