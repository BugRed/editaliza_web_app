import { NextRequest, NextResponse } from 'next/server';
import { canEditProfile } from '@/shared/lib/authorization';
import { getSessionUser } from '@/app/lib/session';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabase/client';

const PROPOSER_PUBLIC_COLUMNS =
  'id,name,handle,email,imgUrl,bio,city,state,createdAt,updatedAt,userType,listComment,cnpj,listEdital';

const updateProposerSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  handle: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(600).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(10).optional(),
  cnpj: z.string().trim().optional(),
  imgUrl: z.string().trim().min(1).optional(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const proposerId = Number(id);
    if (!Number.isFinite(proposerId)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('proposer_data')
      .select(PROPOSER_PUBLIC_COLUMNS)
      .eq('id', proposerId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Propositor não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao carregar dados do propositor.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const proposerId = Number(id);
    if (!Number.isFinite(proposerId)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    // Autenticado não basta: só o próprio proponente altera o próprio perfil.
    const sessionUser = await getSessionUser();
    if (!canEditProfile(sessionUser, proposerId, 'PROPOSER')) {
      return NextResponse.json({ error: 'Sem permissão para alterar este perfil.' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = updateProposerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const dbUpdate: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (payload.name !== undefined) dbUpdate.name = payload.name;
    if (payload.handle !== undefined) dbUpdate.handle = payload.handle;
    if (payload.bio !== undefined) dbUpdate.bio = payload.bio;
    if (payload.city !== undefined) dbUpdate.city = payload.city;
    if (payload.state !== undefined) dbUpdate.state = payload.state;
    if (payload.cnpj !== undefined)
      dbUpdate.cnpj = payload.cnpj.replace(/\D/g, '');
    if (payload.imgUrl !== undefined) dbUpdate.imgUrl = payload.imgUrl;

    const { data, error } = await supabase
      .from('proposer_data')
      .update(dbUpdate)
      .eq('id', proposerId)
      .select(PROPOSER_PUBLIC_COLUMNS)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Propositor não encontrado ou erro ao atualizar.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao atualizar dados do propositor.' },
      { status: 500 }
    );
  }
}
