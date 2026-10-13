import { z } from 'zod';

// Env validada num ponto só — falha no boot, nunca em runtime (CLAUDE.md).
// Opcionais de W1: DATABASE_URL e BETTER_AUTH_* só passam a ser obrigatórias
// quando Better Auth (T1.2) e Postgres direto (T1.1) entrarem; hoje são
// validadas apenas se presentes, para não quebrar o boot com variável ainda
// não consumida.
const envSchema = z.object({
  // Supabase — em uso hoje (client anon nas rotas de API)
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Base absoluta para fetch server-side das páginas (default: localhost em dev)
  NEXT_PUBLIC_BASE_URL: z.url().optional(),

  // W1 — presentes já são validadas, ausentes ainda não derrubam o boot
  DATABASE_URL: z.url().optional(),
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
