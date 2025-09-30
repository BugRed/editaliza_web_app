import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

// Este endpoint lida com requisições GET para a tabela 'editals_data'
export async function GET() {
  try {
    const { data, error } = await supabase.from('editals_data').select('*');
    
    if (error) {
      console.error('Erro ao buscar dados de editais:', error);
      throw error;
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Falha ao carregar dados de editais.' },
      { status: 500 }
    );
  }
}
