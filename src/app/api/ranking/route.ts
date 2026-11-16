import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { supabase } from '@/app/lib/supabase/client';
import { authService } from '@/app/services/auth-service';
import { ARTIST_PUBLIC_COLUMNS } from '@/shared/lib/artist-columns';
import {
  normalizeArtistRow,
  SEEDED_PROFILES,
  toRankArtistInput,
} from '@/app/lib/user-profiles';
import {
  rankEditalsForArtist,
  RankEditalInput,
} from '@/shared/lib/artistrank';

function parseStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) =>
        typeof item === 'string'
          ? item
          : typeof item === 'object' && item && 'name' in item
          ? String((item as { name?: unknown }).name ?? '')
          : ''
      )
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseStringArray(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const artistIdParam = req.nextUrl.searchParams.get('artistId');
    let artistId = artistIdParam ? Number(artistIdParam) : NaN;

    if (!Number.isFinite(artistId)) {
      const cookieToken = (await cookies()).get('auth-token')?.value;
      const authHeader = (await headers()).get('authorization');
      const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : undefined;
      const token = cookieToken || bearerToken;

      if (token && (await authService.verifyToken(token))) {
        const user = await authService.getCurrentUser(token);
        if (user?.id) artistId = Number(user.id);
      }
    }

    if (!Number.isFinite(artistId)) {
      artistId = 1;
    }

    const [artistRes, proposerSelfRes, editalsRes, proposersRes] = await Promise.all([
      supabase
        .from('artist_data')
        .select(ARTIST_PUBLIC_COLUMNS)
        .eq('id', artistId)
        .single(),
      supabase
        .from('proposer_data')
        .select('id,name,handle,email,imgUrl,bio,city,state,cnpj,userType,listEdital')
        .eq('id', artistId)
        .single(),
      supabase.from('editals_data').select('*'),
      supabase.from('proposer_data').select('id,name,imgUrl'),
    ]);

    if (editalsRes.error) {
      throw editalsRes.error;
    }

    const editalRows = (editalsRes.data ?? []) as Array<Record<string, unknown>>;
    const proposerRows = (proposersRes.data ?? []) as Array<
      Record<string, unknown>
    >;

    const normalizeEdital = (edital: Record<string, unknown>) => ({
      ...edital,
      listTags:
        typeof edital.listTags === 'string'
          ? (() => {
              try {
                return JSON.parse(edital.listTags);
              } catch {
                return [];
              }
            })()
          : edital.listTags ?? [],
      plainSummary:
        typeof edital.plainSummary === 'string'
          ? (() => {
              try {
                return JSON.parse(edital.plainSummary);
              } catch {
                return null;
              }
            })()
          : edital.plainSummary ?? null,
    });

    const getProposerName = (edital: Record<string, unknown>) => {
      const proposerId =
        typeof edital.proposer === 'object' && edital.proposer !== null
          ? Number((edital.proposer as { id?: unknown }).id)
          : Number(edital.proposer);
      const proposer = proposerRows.find((p) => Number(p.id) === proposerId);
      return (
        (proposer?.name && String(proposer.name)) ||
        (typeof edital.proposer === 'object' &&
        edital.proposer !== null &&
        'name' in edital.proposer
          ? String((edital.proposer as { name?: unknown }).name)
          : 'Proponente')
      );
    };

    // Se a conta logada é Propositor (não está em artist_data), retorna os editais em ordem cronológica
    if ((artistRes.error || !artistRes.data) && proposerSelfRes.data) {
      const sortedEditals = [...editalRows].sort((a, b) => {
        const da = new Date(String(a.publishDate || a.createdAt || 0)).getTime();
        const db = new Date(String(b.publishDate || b.createdAt || 0)).getTime();
        return db - da;
      });

      return NextResponse.json(
        {
          artistId,
          userType: 'PROPOSER',
          artistName: String((proposerSelfRes.data as { name?: unknown }).name ?? 'Propositor'),
          avisoEscassez: false,
          ranked: sortedEditals.map((edital) => ({
            edital: normalizeEdital(edital),
            proposerName: getProposerName(edital),
            rank: null,
          })),
        },
        { status: 200 }
      );
    }

    if (artistRes.error || !artistRes.data) {
      return NextResponse.json(
        { error: 'Artista não encontrado para ranqueamento.' },
        { status: 404 }
      );
    }

    const seedFallback = SEEDED_PROFILES.find((s) => s.id === artistId);
    const artistProfile = normalizeArtistRow(
      artistRes.data as unknown as Record<string, unknown>,
      seedFallback
    );
    const artistInput = toRankArtistInput(artistProfile);

    const editalInputs: RankEditalInput[] = editalRows.map((row) => {
      const tagNames = parseStringArray(row.listTags);
      const requiredLanguages = parseStringArray(row.requiredLanguages);
      const acceptedLanguages = parseStringArray(row.acceptedLanguages);

      return {
        id: Number(row.id),
        title: String(row.title ?? ''),
        territoryScope: row.territoryScope
          ? String(row.territoryScope)
          : 'NACIONAL',
        city: row.city ? String(row.city) : null,
        state: row.state ? String(row.state) : null,
        requiredLanguages,
        acceptedLanguages:
          acceptedLanguages.length > 0 ? acceptedLanguages : tagNames,
        requiresPortfolio:
          typeof row.requiresPortfolio === 'boolean'
            ? row.requiresPortfolio
            : true,
        requiresCnpj:
          typeof row.requiresCnpj === 'boolean' ? row.requiresCnpj : false,
        requiresTechnicalFormation:
          typeof row.requiresTechnicalFormation === 'boolean'
            ? row.requiresTechnicalFormation
            : false,
        minExperienceYears:
          typeof row.minExperienceYears === 'number'
            ? row.minExperienceYears
            : 0,
        targetProfileLevels: parseStringArray(row.targetProfileLevels),
      };
    });

    const { results, avisoEscassez } = rankEditalsForArtist(
      artistInput,
      editalInputs
    );

    const ranked = results
      .map((rank) => {
        const edital = editalRows.find((e) => Number(e.id) === rank.editalId);
        if (!edital) return null;
        return {
          edital: normalizeEdital(edital),
          proposerName: getProposerName(edital),
          rank,
        };
      })
      .filter(Boolean);

    return NextResponse.json(
      {
        artistId,
        userType: 'ARTIST',
        artistName: artistProfile.name,
        avisoEscassez,
        ranked,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Erro ao calcular ArtistRank:', err);
    return NextResponse.json(
      { error: 'Falha ao executar motor de ranqueamento ArtistRank.' },
      { status: 500 }
    );
  }
}
