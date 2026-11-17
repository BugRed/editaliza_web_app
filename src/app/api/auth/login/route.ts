import { NextResponse } from 'next/server';
import { authService } from '@/app/services/auth-service';
import { isHttpsRequest, SESSION_COOKIE, sessionCookieOptions } from '@/server/auth/session-cookie';

// Porta de entrada da sessão: listada em publicApiRoutes no middleware.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;

  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || body.email === '' || body.password === '') {
    return NextResponse.json({ success: false, message: 'Email e senha são obrigatórios.' }, { status: 400 });
  }

  const { token, ...publicResult } = await authService.login({ email: body.email, password: body.password });

  // O token só existe no cookie httpOnly: o corpo da resposta não o carrega, então o JavaScript da
  // página nunca o vê nem tem onde guardá-lo.
  const response = NextResponse.json(publicResult, { status: publicResult.success ? 200 : 401 });
  if (publicResult.success && token) {
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isHttpsRequest(request)));
  }
  return response;
}
