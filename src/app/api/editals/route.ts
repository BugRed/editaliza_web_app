import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabase/client';
import { authService } from '@/app/services/auth-service';

function parseJson<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return raw as T;
}

function normalizeEditalRow(row: Record<string, unknown>) {
  return {
    ...row,
    listTags: parseJson(row.listTags, []),
    listComment: parseJson(row.listComment, []),
    requiredLanguages: parseJson<string[]>(row.requiredLanguages, []),
    acceptedLanguages: parseJson<string[]>(row.acceptedLanguages, []),
    targetProfileLevels: parseJson<string[]>(row.targetProfileLevels, []),
    plainSummary: parseJson(row.plainSummary, null),
  };
}

const createEditalSchema = z.object({
  title: z.string().trim().min(3, 'Informe o título do edital.'),
  description: z.string().trim().min(10, 'Informe uma descrição do edital.'),
  endDate: z.string().optional().nullable(),
  inscriptionLink: z.string().trim().optional(),
  completeEditalLink: z.string().trim().optional(),
  imgCoverUrl: z.string().trim().optional(),
  territoryScope: z
    .enum(['MUNICIPAL', 'METROPOLITANO', 'ESTADUAL', 'NACIONAL'])
    .default('NACIONAL'),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  requiredLanguages: z.array(z.string()).default([]),
  acceptedLanguages: z.array(z.string()).default([]),
  requiresPortfolio: z.boolean().default(true),
  requiresCnpj: z.boolean().default(false),
  requiresTechnicalFormation: z.boolean().default(false),
  minExperienceYears: z.number().min(0).max(50).default(0),
  targetProfileLevels: z
    .array(z.enum(['INICIANTE', 'EMERGENTE', 'CONSOLIDADO', 'MESTRE']))
    .default(['INICIANTE', 'EMERGENTE', 'CONSOLIDADO']),
  plainSummary: z
    .object({
      whatIsIt: z.string().trim().min(5),
      whoCanApply: z.array(z.string()),
      benefits: z.array(z.string()),
      extraTags: z.array(z.string()),
    })
    .optional(),
});

// Este endpoint lida com requisições GET e POST para a tabela 'editals_data'
export async function GET() {
  try {
    const { data, error } = await supabase.from('editals_data').select('*');

    if (error) {
      console.error('Erro ao buscar dados de editais:', error);
      throw error;
    }

    const rows = Array.isArray(data) ? data : [];
    const normalized = rows.map((row) =>
      normalizeEditalRow(row as unknown as Record<string, unknown>)
    );

    return NextResponse.json(normalized, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao carregar dados de editais.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieToken = (await cookies()).get('auth-token')?.value;
    const authHeader = (await headers()).get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;
    const token = cookieToken || bearerToken;

    const currentUser = token ? await authService.getCurrentUser(token) : null;
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = createEditalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Dados inválidos.',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();
    const newId = Math.floor(400 + (Date.now() % 900000));

    const allTagNames = Array.from(
      new Set([...data.requiredLanguages, ...data.acceptedLanguages])
    ).filter(Boolean);

    const listTags = allTagNames.map((name, idx) => ({ id: idx + 1, name }));
    const plainSummary = data.plainSummary ?? {
      whatIsIt: data.description,
      whoCanApply: [
        data.requiresCnpj
          ? 'Necessário possuir CNPJ ou MEI cultural ativo.'
          : 'Aberto para artistas pessoa física ou jurídica.',
        data.territoryScope === 'MUNICIPAL' && data.city
          ? `Exclusivo para moradores de ${data.city}${data.state ? ` (${data.state})` : ''}.`
          : data.territoryScope === 'ESTADUAL' && data.state
          ? `Exclusivo para residentes no estado ${data.state}.`
          : 'Aberto conforme abrangência territorial do edital.',
      ],
      benefits: [
        'Apoio ou fomento conforme regras descritas na chamada oficial.',
      ],
      extraTags: allTagNames,
    };

    const insertRow = {
      id: newId,
      title: data.title,
      description: data.description,
      publishDate: now,
      endDate: data.endDate || null,
      status: 'OPEN',
      inscriptionLink: data.inscriptionLink || 'https://link.com/inscricao',
      completeEditalLink: data.completeEditalLink || 'https://link.com/edital.pdf',
      imgCoverUrl:
        data.imgCoverUrl || '/images/edital_ocupacao_1794791581648.jpg',
      createdAt: now,
      updatedAt: now,
      proposer: currentUser.id,
      listTags,
      listComment: [],
      territoryScope: data.territoryScope,
      city: data.city || '',
      state: data.state || '',
      requiredLanguages: data.requiredLanguages,
      acceptedLanguages:
        data.acceptedLanguages.length > 0
          ? data.acceptedLanguages
          : data.requiredLanguages,
      requiresPortfolio: data.requiresPortfolio,
      requiresCnpj: data.requiresCnpj,
      requiresTechnicalFormation: data.requiresTechnicalFormation,
      minExperienceYears: data.minExperienceYears,
      targetProfileLevels: data.targetProfileLevels,
      plainSummary,
    };

    const { data: created, error } = await supabase
      .from('editals_data')
      .insert(insertRow)
      .select('*')
      .single();

    if (error || !created) {
      throw error || new Error('Falha ao criar edital');
    }

    // Atualiza listEdital do propositor se existir na tabela proposer_data
    const { data: proposerRow } = await supabase
      .from('proposer_data')
      .select('id, listEdital')
      .eq('id', currentUser.id)
      .single();

    if (proposerRow) {
      const existingList = parseJson<number[]>(
        (proposerRow as { listEdital?: unknown }).listEdital,
        []
      );
      await supabase
        .from('proposer_data')
        .update({ listEdital: [...existingList, newId] })
        .eq('id', currentUser.id);
    }

    return NextResponse.json(
      normalizeEditalRow(created as unknown as Record<string, unknown>),
      { status: 201 }
    );
  } catch (err) {
    console.error('Erro ao publicar edital:', err);
    return NextResponse.json(
      { error: 'Falha ao publicar edital no banco.' },
      { status: 500 }
    );
  }
}
