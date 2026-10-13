import { NextResponse } from 'next/server';

// Liveness pública (exigida pelo deploy e pelo cron de coleta) — o middleware
// mantém esta rota fora da exigência de sessão
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
