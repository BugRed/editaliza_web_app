import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Este endpoint lida com requisições GET para a tabela 'comments_data'
export async function GET() {
  try {
    const { data, error } = await supabase.from('comments_data').select('*');
    
    if (error) {
      console.error('Erro ao buscar dados de comentários:', error);
      throw error;
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Falha ao carregar dados de comentários.' },
      { status: 500 }
    );
  }
}
