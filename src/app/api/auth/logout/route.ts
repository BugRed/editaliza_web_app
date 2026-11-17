import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/server/auth/session-cookie';

// O cookie é httpOnly, então só o servidor consegue apagá-lo. Rota pública no middleware: sair precisa
// funcionar mesmo com a sessão já vencida.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
