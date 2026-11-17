import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabase/client';
import { env } from '@/shared/lib/env';
import { createSessionToken } from '@/shared/lib/auth-token';
import { isHttpsRequest, SESSION_COOKIE, sessionCookieOptions } from '@/server/auth/session-cookie';
import { hashPassword } from '@db/password.mjs';
import { isValidAvatarDataUrl } from '@/shared/lib/avatar-image';
import { storeAvatar } from '@/server/storage/avatar-storage';
import { isValidCpf } from '@/shared/lib/documents';
import { isStrongPassword, PASSWORD_MAX_LENGTH, PASSWORD_POLICY_MESSAGE } from '@/shared/lib/password-policy';
import { calculatePortfolioCompleteness } from '@/app/lib/user-profiles';

const registerBaseSchema = z.object({
  userType: z.enum(['ARTIST', 'PROPOSER']),
  name: z.string().trim().min(2, 'Informe o nome completo ou da instituição.'),
  email: z.string().trim().email('Digite um e-mail válido.'),
  password: z
    .string()
    .max(PASSWORD_MAX_LENGTH, 'A senha é longa demais.')
    .refine(isStrongPassword, PASSWORD_POLICY_MESSAGE),
  // Foto: obrigatória para artista (conferido abaixo), opcional para empresa. Vai como data URL pequena (JPEG/PNG/WebP,
  // nunca SVG) e é guardada por storeAvatar (no registro ou no Supabase Storage, conforme PHOTO_STORAGE).
  avatarDataUrl: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().refine(isValidAvatarDataUrl, 'A foto enviada não é válida. Use JPG, PNG ou WebP.').optional()
  ),
  handle: z.string().trim().optional(),
  bio: z.string().trim().max(600).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(10).optional(),
  // Campos de Artista
  cpf: z.string().trim().optional(),
  territoryScope: z
    .enum(['MUNICIPAL', 'METROPOLITANO', 'ESTADUAL', 'NACIONAL'])
    .optional(),
  coreLanguages: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  supportLanguages: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  experienceYears: z.number().min(0).max(80).optional(),
  profileLevel: z
    .enum(['INICIANTE', 'EMERGENTE', 'CONSOLIDADO', 'MESTRE'])
    .optional(),
  hasCnpjOrMei: z.boolean().optional(),
  hasTechnicalFormation: z.boolean().optional(),
  // Campos de Propositor
  cnpj: z.string().trim().optional(),
});

const DEFAULT_PROPOSER_AVATAR = '/images/edital_ocupacao_1794791581648.jpg';

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
      if (!data.avatarDataUrl) {
        return NextResponse.json(
          { success: false, message: 'Envie uma foto para o perfil.' },
          { status: 400 }
        );
      }
      const cpfDigits = cleanDigits(data.cpf);
      if (cpfDigits && !isValidCpf(cpfDigits)) {
        return NextResponse.json(
          { success: false, message: 'CPF inválido. Confira os números.' },
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
    // Só o hash vai ao banco: a senha em texto puro nunca é gravada.
    const passwordHash = await hashPassword(data.password);
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

    // Empresa sem logo usa a imagem padrão; artista sempre tem foto (garantido acima). O envio ao armazenamento
    // vem ANTES de criar a conta: se falhar, nada foi gravado.
    let avatar = DEFAULT_PROPOSER_AVATAR;
    if (data.avatarDataUrl) {
      try {
        avatar = await storeAvatar(newId, data.avatarDataUrl);
      } catch (error) {
        console.error('Erro ao guardar a foto do perfil:', error);
        return NextResponse.json(
          { success: false, message: 'Não foi possível salvar a foto agora. Tente novamente em instantes.' },
          { status: 502 }
        );
      }
    }

    const { error: userErr } = await supabase.from('user_data').insert({
      id: newId,
      name: data.name,
      email: normalizedEmail,
      password: passwordHash,
      imgUrl: avatar,
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
        password: passwordHash,
        cpf: cleanDigits(data.cpf) || null,
        imgUrl: avatar,
        avatarUrl: avatar,
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
          password: passwordHash,
          imgUrl: avatar,
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

    const token = await createSessionToken(newId, normalizedEmail, env.AUTH_SECRET);
    // O token só existe no cookie httpOnly; o corpo da resposta não o carrega.
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newId,
          email: normalizedEmail,
          name: data.name,
          userType: data.userType,
        },
      },
      { status: 201 }
    );
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isHttpsRequest(request)));

    return response;
  } catch (err) {
    console.error('Erro no POST /api/auth/register:', err);
    return NextResponse.json(
      { success: false, message: 'Erro interno ao processar cadastro.' },
      { status: 500 }
    );
  }
}
