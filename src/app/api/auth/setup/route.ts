import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Primeira tentativa: verificar se a tabela já existe
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('login')
      .limit(1);

    // Se não houve erro, a tabela já existe
    if (!checkError) {
      return NextResponse.json({
        message: 'Tabela users já existe e está configurada.'
      });
    }

    // Se houve erro ao verificar a tabela, provavelmente a tabela não existe
    console.error('Erro ao verificar a tabela users:', checkError);
    return NextResponse.json(
      {
        error: 'A tabela users não existe no Supabase. Execute o SQL para criá-la (veja database/create-users-table.sql).'
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('Erro na configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
