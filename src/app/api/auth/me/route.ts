import { NextResponse } from 'next/server';
import { getSessionUser } from '@/app/lib/session';

// Protegida pelo middleware como todo /api/*; o handler devolve o perfil da sessão (cookie httpOnly).
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
  }
  return NextResponse.json({ user });
}
