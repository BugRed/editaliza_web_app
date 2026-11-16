import 'server-only';
import { z } from 'zod';

function isValidHttpUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const envSchema = z.object({
  SUPABASE_URL: z.string().optional(),
  SUPABASE_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

const rawEnv = parsed.success ? parsed.data : {};

export const env = {
  SUPABASE_URL: isValidHttpUrl(rawEnv.SUPABASE_URL) ? rawEnv.SUPABASE_URL : undefined,
  SUPABASE_API_KEY:
    rawEnv.SUPABASE_API_KEY && rawEnv.SUPABASE_API_KEY.trim().length > 0
      ? rawEnv.SUPABASE_API_KEY
      : undefined,
  DATABASE_URL: rawEnv.DATABASE_URL,
  DIRECT_URL: rawEnv.DIRECT_URL,
  BETTER_AUTH_URL: rawEnv.BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: rawEnv.BETTER_AUTH_SECRET,
};

export const hasSupabaseConfig = Boolean(env.SUPABASE_URL && env.SUPABASE_API_KEY);
