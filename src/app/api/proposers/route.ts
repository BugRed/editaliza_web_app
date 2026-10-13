import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

// Este endpoint lida com requisições GET para a tabela 'proposer_data'
// Coluna `password` nunca entra no select
const PROPOSER_COLUMNS = 'id,name,email,imgUrl,createdAt,updatedAt,userType,listComment,cnpj,listEdital';

export async function GET() {
  try {
    const { data, error } = await supabase.from('proposer_data').select(PROPOSER_COLUMNS);
    
    if (error) {
      console.error('Erro ao buscar dados de proponentes:', error);
      throw error;
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao carregar dados de proponentes.' },
      { status: 500 }
    );
  }
}
