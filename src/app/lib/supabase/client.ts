import { createClient } from '@supabase/supabase-js';
import { env } from '@/shared/lib/env';

// Crie uma única instância do cliente Supabase para ser reutilizada
// por toda a sua aplicação. Isso garante eficiência de recursos.
// A validação das variáveis mora em @/shared/lib/env — este arquivo só consome.
export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
