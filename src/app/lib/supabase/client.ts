import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/shared/lib/env';

// Crie uma única instância do cliente Supabase para ser reutilizada
// por toda a sua aplicação. Isso garante eficiência de recursos.
// A validação das variáveis mora em @/shared/lib/env — este arquivo só consome.
// Server-only: este cliente nunca pode chegar ao bundle de cliente; a
// publishable key não é embutida em página nenhuma.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_API_KEY);
