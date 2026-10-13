import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

// Este endpoint lida com requisições GET para a tabela 'user_data'
// Coluna `password` nunca entra no select — sem ela não há o que vazar
const USER_COLUMNS = 'id,name,email,imgUrl,createdAt,updatedAt,userType,listComment';

export async function GET() {
  try {
    const { data, error } = await supabase.from('user_data').select(USER_COLUMNS);
    
    if (error) {
      console.error('Erro ao buscar dados de usuários:', error);
      throw error;
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao carregar dados de usuários.' },
      { status: 500 }
    );
  }
}
