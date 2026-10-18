import 'server-only';
import { z } from 'zod';

// Env validada num ponto só — falha no boot, nunca em runtime (CLAUDE.md).
// Nenhuma variável daqui é NEXT_PUBLIC_: consumidor de env é sempre server-side
// (rotas de API e scripts), então nada vira bundle de cliente. O 'server-only'
// acima transforma import acidental desse módulo em código-cliente em erro de
// build, não em undefined silencioso em runtime.
// Opcionais de W1: só passam a ser obrigatórias quando Better Auth (T1.2) e
// Postgres direto (T1.1) entrarem; hoje são validadas apenas se presentes.
const envSchema = z.object({
  // Supabase — client PostgREST server-side nas rotas de API.
  // SUPABASE_API_KEY é a publishable key nova (sb_publishable_...), sucessora
  // da anon key; roda sob as mesmas RLS.
  SUPABASE_URL: z.url(),
  SUPABASE_API_KEY: z.string().min(1),

  // Postgres direto (T1.1): DIRECT_URL é o pooler em modo sessão (migrations);
  // DATABASE_URL, o pooler em modo transação (app/seed)
  DATABASE_URL: z.url().optional(),
  DIRECT_URL: z.url().optional(),

  // W1 — presentes já são validadas, ausentes ainda não derrubam o boot
  BETTER_AUTH_URL: z.url().optional(),
  BETTER_AUTH_SECRET: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problemas = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Variáveis de ambiente inválidas ou ausentes:\n${problemas}\nVeja .env.example.`);
}

export const env = parsed.data;
