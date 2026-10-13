import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

// Este endpoint lida com requisições GET para a tabela 'artist_data'
// Sem `password` e sem `cpf` no select — espelha o toPublicJSON do tipo Artist
const ARTIST_COLUMNS = 'id,name,email,imgUrl,createdAt,updatedAt,userType,listComment,listTags';

export async function GET() {
  try {
    const { data, error } = await supabase.from('artist_data').select(ARTIST_COLUMNS);
    
    if (error) {
      console.error('Erro ao buscar dados de artistas:', error);
      throw error;
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao carregar dados de artistas.' },
      { status: 500 }
    );
  }
}
