import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabase/client';
import { ARTIST_PUBLIC_COLUMNS } from '@/shared/lib/artist-columns';
import { getMediaSource, WORK_KINDS } from '@/shared/lib/media';
import {
  calculatePortfolioCompleteness,
  normalizeArtistRow,
  SEEDED_PROFILES,
} from '@/app/lib/user-profiles';

const badgeSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  editalName: z.string().min(1),
  year: z.string().min(1),
  category: z.string().min(1),
  editalId: z.number().int().positive().optional(),
  issuerId: z.number().int().positive().optional(),
  issuerName: z.string().max(160).optional(),
});

const workSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: z.string().min(1),
  year: z.string().min(1),
  description: z.string().max(600),
  imageUrl: z.string().min(1),
  kind: z.enum(WORK_KINDS).optional(),
  technique: z.string().max(160).optional(),
  dimensions: z.string().max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  // Vazio é permitido; preenchido precisa ser mídia tocável segura (http(s) ou arquivo do site).
  mediaUrl: z
    .string()
    .max(500)
    .refine((value) => value === '' || getMediaSource(value) !== null, 'Link de mídia inválido.')
    .optional(),
});

const updateArtistSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  handle: z.string().min(1).max(60).optional(),
  bio: z.string().max(600).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(10).optional(),
  territoryScope: z
    .enum(['MUNICIPAL', 'METROPOLITANO', 'ESTADUAL', 'NACIONAL'])
    .optional(),
  avatarUrl: z.string().min(1).optional(),
  coreLanguages: z.array(z.string()).optional(),
  supportLanguages: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).max(80).optional(),
  profileLevel: z
    .enum(['INICIANTE', 'EMERGENTE', 'CONSOLIDADO', 'MESTRE'])
    .optional(),
  hasCnpjOrMei: z.boolean().optional(),
  hasTechnicalFormation: z.boolean().optional(),
  badges: z.array(badgeSchema).optional(),
  works: z.array(workSchema).optional(),
  savedEditalIds: z.array(z.number()).optional(),
  likedEditalIds: z.array(z.number()).optional(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const artistId = Number(id);
    if (!Number.isFinite(artistId)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('artist_data')
      .select(ARTIST_PUBLIC_COLUMNS)
      .eq('id', artistId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Artista não encontrado.' },
        { status: 404 }
      );
    }

    const seedFallback = SEEDED_PROFILES.find((s) => s.id === artistId);
    const normalized = normalizeArtistRow(
      data as unknown as Record<string, unknown>,
      seedFallback
    );

    return NextResponse.json(normalized, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao carregar perfil do artista.' },
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
    const artistId = Number(id);
    if (!Number.isFinite(artistId)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateArtistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos para atualização.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { data: existingData, error: existingErr } = await supabase
      .from('artist_data')
      .select(ARTIST_PUBLIC_COLUMNS)
      .eq('id', artistId)
      .single();

    if (existingErr || !existingData) {
      return NextResponse.json(
        { error: 'Artista não encontrado.' },
        { status: 404 }
      );
    }

    const seedFallback = SEEDED_PROFILES.find((s) => s.id === artistId);
    const current = normalizeArtistRow(
      existingData as unknown as Record<string, unknown>,
      seedFallback
    );

    const payload = parsed.data;
    const nextCore = payload.coreLanguages ?? current.coreLanguages;
    const nextSupport = (payload.supportLanguages ?? current.supportLanguages).filter(
      (tag) => !nextCore.includes(tag)
    );
    const mergedTagNames = Array.from(
      new Set([
        ...nextCore,
        ...nextSupport,
        ...(payload.tags && !payload.coreLanguages && !payload.supportLanguages
          ? payload.tags
          : []),
      ])
    ).filter(Boolean);

    const nextProfile = {
      ...current,
      ...payload,
      coreLanguages: nextCore,
      supportLanguages: nextSupport,
      tags: mergedTagNames,
    };

    const portfolioCompleteness = calculatePortfolioCompleteness(nextProfile);

    const dbUpdate: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      portfolioCompleteness,
    };

    if (payload.name !== undefined) dbUpdate.name = payload.name;
    if (payload.handle !== undefined) dbUpdate.handle = payload.handle;
    if (payload.bio !== undefined) dbUpdate.bio = payload.bio;
    if (payload.city !== undefined) dbUpdate.city = payload.city;
    if (payload.state !== undefined) dbUpdate.state = payload.state;
    if (payload.territoryScope !== undefined)
      dbUpdate.territoryScope = payload.territoryScope;
    if (payload.avatarUrl !== undefined) {
      dbUpdate.avatarUrl = payload.avatarUrl;
      dbUpdate.imgUrl = payload.avatarUrl;
    }
    if (
      payload.coreLanguages !== undefined ||
      payload.supportLanguages !== undefined ||
      payload.tags !== undefined
    ) {
      dbUpdate.coreLanguages = nextCore;
      dbUpdate.supportLanguages = nextSupport;
      dbUpdate.listTags = mergedTagNames.map((name, idx) => ({
        id: idx + 1,
        name,
      }));
    }
    if (payload.experienceYears !== undefined)
      dbUpdate.experienceYears = payload.experienceYears;
    if (payload.profileLevel !== undefined)
      dbUpdate.profileLevel = payload.profileLevel;
    if (payload.hasCnpjOrMei !== undefined)
      dbUpdate.hasCnpjOrMei = payload.hasCnpjOrMei;
    if (payload.hasTechnicalFormation !== undefined)
      dbUpdate.hasTechnicalFormation = payload.hasTechnicalFormation;
    if (payload.badges !== undefined) dbUpdate.badges = payload.badges;
    if (payload.works !== undefined) dbUpdate.works = payload.works;
    if (payload.savedEditalIds !== undefined)
      dbUpdate.savedEditalIds = payload.savedEditalIds;
    if (payload.likedEditalIds !== undefined)
      dbUpdate.likedEditalIds = payload.likedEditalIds;

    const { data: updatedData, error: updateErr } = await supabase
      .from('artist_data')
      .update(dbUpdate)
      .eq('id', artistId)
      .select(ARTIST_PUBLIC_COLUMNS)
      .single();

    if (updateErr || !updatedData) {
      console.error('Erro ao atualizar artista:', updateErr);
      return NextResponse.json(
        { error: 'Não foi possível salvar as alterações no banco.' },
        { status: 500 }
      );
    }

    const normalized = normalizeArtistRow(
      updatedData as unknown as Record<string, unknown>,
      seedFallback
    );

    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    console.error('Erro no PATCH /api/artists/[id]:', err);
    return NextResponse.json(
      { error: 'Falha ao atualizar perfil do artista.' },
      { status: 500 }
    );
  }
}
