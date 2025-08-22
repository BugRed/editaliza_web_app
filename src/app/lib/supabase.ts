// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Verifique se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente para o Supabase não foram definidas.');
}

// Crie uma única instância do cliente Supabase para ser reutilizada
// por toda a sua aplicação. Isso garante eficiência de recursos.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);