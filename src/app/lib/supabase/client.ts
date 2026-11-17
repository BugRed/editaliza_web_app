import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/shared/lib/env';
import { createMockClient } from '@/server/db/mock/client';

// Único ponto de acesso a dados do app. A fonte vem de DATA_SOURCE (ver env.ts): as rotas só importam
// `supabase` e não sabem se atrás dele há o mock em memória, o PostgREST do Docker ou o Supabase.
// Server-only: este cliente nunca pode chegar ao bundle de cliente.
export const supabase: SupabaseClient =
  env.DATA_SOURCE === 'mock'
    ? (createMockClient() as unknown as SupabaseClient)
    : createClient(env.SUPABASE_URL as string, env.SUPABASE_API_KEY as string);
