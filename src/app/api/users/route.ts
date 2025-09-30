import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

// Este endpoint lida com requisições GET para a tabela 'user_data'
export async function GET() {
  try {
    const { data, error } = await supabase.from('user_data').select('*');
    
    if (error) {
      console.error('Erro ao buscar dados de usuários:', error);
      throw error;
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Falha ao carregar dados de usuários.' },
      { status: 500 }
    );
  }
}
