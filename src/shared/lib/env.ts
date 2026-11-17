import 'server-only';
import { z } from 'zod';

// Env validada num ponto só — falha no boot, nunca em runtime (CLAUDE.md).
// Nenhuma variável daqui é NEXT_PUBLIC_: consumidor de env é sempre server-side, então nada vira bundle
// de cliente. O 'server-only' acima transforma import acidental desse módulo em código-cliente em erro de
// build, não em undefined silencioso em runtime.
const envSchema = z
  .object({
    // Fonte dos dados. `mock` = seed em memória (produção na Vercel, por enquanto); `supabase` = qualquer
    // backend PostgREST compatível: o Postgres + PostgREST do Docker local, e depois o Supabase de verdade.
    // Sem a variável: produção usa o mock e todo o resto usa o Docker. Trocar de fonte é só mudar isto.
    DATA_SOURCE: z.enum(['mock', 'supabase']).optional(),
    SUPABASE_URL: z.url().optional(),
    SUPABASE_API_KEY: z.string().min(1).optional(),

    // Endereço público (links absolutos de og-image e ícones). Sem ela vale o domínio de produção da Vercel.
    SITE_URL: z.url().optional(),

    // Assina o cookie de sessão (HMAC-SHA256). Sem valor padrão, de propósito: um segredo conhecido
    // permitiria forjar sessão de qualquer usuário.
    AUTH_SECRET: z.string().min(32, 'AUTH_SECRET precisa de 32 caracteres ou mais (gere com: openssl rand -base64 32)'),

    // Postgres direto (T1.1): DIRECT_URL é o pooler em modo sessão (migrations);
    // DATABASE_URL, o pooler em modo transação (app/seed)
    DATABASE_URL: z.url().optional(),
    DIRECT_URL: z.url().optional(),

    // W1 — presentes já são validadas, ausentes ainda não derrubam o boot
    BETTER_AUTH_URL: z.url().optional(),
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    const source = value.DATA_SOURCE ?? (process.env.NODE_ENV === 'production' ? 'mock' : 'supabase');
    if (source === 'supabase' && (!value.SUPABASE_URL || !value.SUPABASE_API_KEY)) {
      ctx.addIssue({
        code: 'custom',
        message: 'DATA_SOURCE=supabase exige SUPABASE_URL e SUPABASE_API_KEY (local: suba o Docker com `yarn dev:db` e copie .env.docker.example para .env.local)',
        path: ['SUPABASE_URL'],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problemas = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Variáveis de ambiente inválidas ou ausentes:\n${problemas}\nVeja .env.example.`);
}

export const env = {
  ...parsed.data,
  DATA_SOURCE: parsed.data.DATA_SOURCE ?? (process.env.NODE_ENV === 'production' ? 'mock' : 'supabase'),
} as typeof parsed.data & { DATA_SOURCE: 'mock' | 'supabase' };
