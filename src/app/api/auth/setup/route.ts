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

    // Se chegou aqui, a tabela precisa ser criada
    // Vamos tentar criar o usuário admin diretamente
    // (assumindo que a tabela será criada automaticamente pelo Supabase)
    
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          login: 'admin',
          password: hashedPassword,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao criar usuário admin:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao configurar usuário admin. Verifique se a tabela users existe no Supabase.',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Usuário admin criado com sucesso!',
      user: data 
    });

  } catch (error) {
    console.error('Erro na configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
