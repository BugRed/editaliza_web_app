import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabase/client';
import { generateToken } from '@/shared/lib/auth-token';
import { calculatePortfolioCompleteness } from '@/app/lib/user-profiles';

const registerBaseSchema = z.object({
  userType: z.enum(['ARTIST', 'PROPOSER']),
  name: z.string().trim().min(2, 'Informe o nome completo ou da instituição.'),
  email: z.string().trim().email('Digite um e-mail válido.'),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres.')
    .regex(/\d/, 'A senha deve incluir pelo menos 1 número.'),
  handle: z.string().trim().optional(),
  bio: z.string().trim().max(600).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(10).optional(),
  // Campos de Artista
  cpf: z.string().trim().optional(),
  territoryScope: z
    .enum(['MUNICIPAL', 'METROPOLITANO', 'ESTADUAL', 'NACIONAL'])
    .optional(),
  coreLanguages: z.array(z.string()).optional(),
  supportLanguages: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).max(80).optional(),
  profileLevel: z
    .enum(['INICIANTE', 'EMERGENTE', 'CONSOLIDADO', 'MESTRE'])
    .optional(),
  hasCnpjOrMei: z.boolean().optional(),
  hasTechnicalFormation: z.boolean().optional(),
  // Campos de Propositor
  cnpj: z.string().trim().optional(),
});

function cleanDigits(value?: string): string {
  return (value ?? '').replace(/\D/g, '');
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = registerBaseSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || 'Dados inválidos.';
      return NextResponse.json(
        { success: false, message: firstIssue, issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedEmail = data.email.toLowerCase();

    if (data.userType === 'ARTIST') {
      const cpfDigits = cleanDigits(data.cpf);
      if (cpfDigits && cpfDigits.length !== 11) {
        return NextResponse.json(
          { success: false, message: 'CPF inválido. Informe 11 dígitos.' },
          { status: 400 }
        );
      }
      if (!data.coreLanguages || data.coreLanguages.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Selecione pelo menos uma linguagem artística principal.',
          },
          { status: 400 }
        );
      }
    }

    if (data.userType === 'PROPOSER') {
      const cnpjDigits = cleanDigits(data.cnpj);
      if (cnpjDigits.length !== 14) {
        return NextResponse.json(
          {
            success: false,
            message: 'CNPJ inválido. Informe os 14 dígitos da instituição propositora.',
          },
          { status: 400 }
        );
      }
    }

    // Verifica duplicidade de e-mail nas tabelas do banco
    const [existingUsers, existingArtists, existingProposers] = await Promise.all([
      supabase.from('user_data').select('id').eq('email', normalizedEmail),
      supabase.from('artist_data').select('id').eq('email', normalizedEmail),
      supabase.from('proposer_data').select('id').eq('email', normalizedEmail),
    ]);

    const alreadyExists =
      (Array.isArray(existingUsers.data) && existingUsers.data.length > 0) ||
      (Array.isArray(existingArtists.data) && existingArtists.data.length > 0) ||
      (Array.isArray(existingProposers.data) && existingProposers.data.length > 0);

    if (alreadyExists) {
      return NextResponse.json(
        { success: false, message: 'Este e-mail já está cadastrado.' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newId = Math.floor(1000 + (Date.now() % 900000));
    const slugHandle =
      data.handle && data.handle.length > 0
        ? data.handle.startsWith('@')
          ? data.handle
          : `@${data.handle}`
        : `@${data.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 20) || 'perfil'}`;

    const defaultAvatar =
      data.userType === 'PROPOSER'
        ? '/images/edital_ocupacao_1794791581648.jpg'
        : '/images/avatar_joao_1794791579584.jpg';

    const { error: userErr } = await supabase.from('user_data').insert({
      id: newId,
      name: data.name,
      email: normalizedEmail,
      password: data.password,
      imgUrl: defaultAvatar,
      userType: data.userType,
      listComment: [],
      createdAt: now,
      updatedAt: now,
    });

    if (userErr) {
      console.error('Erro ao inserir em user_data:', userErr);
      return NextResponse.json(
        { success: false, message: 'Erro ao criar usuário no banco.' },
        { status: 500 }
      );
    }

    if (data.userType === 'ARTIST') {
      const coreLanguages = data.coreLanguages ?? [];
      const supportLanguages = (data.supportLanguages ?? []).filter(
        (t) => !coreLanguages.includes(t)
      );
      const mergedTags = Array.from(
        new Set([...coreLanguages, ...supportLanguages])
      );
      const portfolioCompleteness = calculatePortfolioCompleteness({
        bio: data.bio ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        coreLanguages,
        supportLanguages,
        works: [],
        badges: [],
      });

      const { error: artistErr } = await supabase.from('artist_data').insert({
        id: newId,
        name: data.name,
        handle: slugHandle,
        email: normalizedEmail,
        password: data.password,
        cpf: cleanDigits(data.cpf) || null,
        imgUrl: defaultAvatar,
        avatarUrl: defaultAvatar,
        bio: data.bio || 'Artista cadastrado na rede Editaliza.',
        city: data.city || '',
        state: data.state || '',
        territoryScope: data.territoryScope || 'ESTADUAL',
        userType: 'ARTIST',
        listComment: [],
        listTags: mergedTags.map((name, idx) => ({ id: idx + 1, name })),
        coreLanguages,
        supportLanguages,
        experienceYears: data.experienceYears ?? 1,
        profileLevel: data.profileLevel || 'INICIANTE',
        hasCnpjOrMei: Boolean(data.hasCnpjOrMei),
        hasTechnicalFormation: Boolean(data.hasTechnicalFormation),
        portfolioCompleteness,
        badges: [],
        works: [],
        savedEditalIds: [],
        likedEditalIds: [],
        createdAt: now,
        updatedAt: now,
      });

      if (artistErr) {
        console.error('Erro ao inserir em artist_data:', artistErr);
        return NextResponse.json(
          { success: false, message: 'Erro ao registrar perfil de artista.' },
          { status: 500 }
        );
      }
    } else {
      const { error: proposerErr } = await supabase
        .from('proposer_data')
        .insert({
          id: newId,
          name: data.name,
          handle: slugHandle,
          email: normalizedEmail,
          password: data.password,
          imgUrl: defaultAvatar,
          bio:
            data.bio ||
            'Instituição propositora cadastrada para divulgar editais e chamadas culturais.',
          city: data.city || '',
          state: data.state || '',
          cnpj: cleanDigits(data.cnpj),
          userType: 'PROPOSER',
          listComment: [],
          listEdital: [],
          createdAt: now,
          updatedAt: now,
        });

      if (proposerErr) {
        console.error('Erro ao inserir em proposer_data:', proposerErr);
        return NextResponse.json(
          { success: false, message: 'Erro ao registrar propositor.' },
          { status: 500 }
        );
      }
    }

    const token = generateToken(newId, normalizedEmail);
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: newId,
          email: normalizedEmail,
          name: data.name,
          userType: data.userType,
        },
      },
      { status: 201 }
    );

    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isHttps =
      forwardedProto === 'https' || request.url.startsWith('https://');

    response.cookies.set('auth-token', token, {
      path: '/',
      maxAge: 60 * 60,
      sameSite: 'lax',
      secure: isHttps,
      httpOnly: false,
    });

    return response;
  } catch (err) {
    console.error('Erro no POST /api/auth/register:', err);
    return NextResponse.json(
      { success: false, message: 'Erro interno ao processar cadastro.' },
      { status: 500 }
    );
  }
}
