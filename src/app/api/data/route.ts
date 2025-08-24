// src/app/api/data/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Esta função assíncrona lida com requisições HTTP do tipo GET
export async function GET() {
  try {
    // Busca dados da tabela 'user_data'
    const { data: userData, error: userError } = await supabase.from('user_data').select('*');
    if (userError) {
      console.error('Erro ao buscar dados de usuários:', userError);
      throw userError;
    }

    // Busca dados da tabela 'artists'
    const { data: artists, error: artistError } = await supabase.from('artist_data').select('*');
    if (artistError) {
      console.error('Erro ao buscar dados de artistas:', artistError);
      throw artistError;
    }
    
    // Busca dados da tabela 'proposers'
    const { data: proposers, error: proposerError } = await supabase.from('proposer_data').select('*');
    if (proposerError) {
      console.error('Erro ao buscar dados de proponentes:', proposerError);
      throw proposerError;
    }

    // Busca dados da tabela 'editals'
    const { data: editals, error: editalError } = await supabase.from('editals_data').select('*');
    if (editalError) {
      console.error('Erro ao buscar dados de editais:', editalError);
      throw editalError;
    }

    // Busca dados da tabela 'tags'
    const { data: tags, error: tagError } = await supabase.from('tags_data').select('*');
    if (tagError) {
      console.error('Erro ao buscar dados de tags:', tagError);
      throw tagError;
    }

    const { data: comments, error: commentsError } = await supabase.from('comments_data').select('*');
    if (tagError) {
      console.error('Erro ao buscar dados de comments:', tagError);
      throw tagError;
    }

    // Combina os dados em um único objeto para a resposta
    const allData = {
      userData,
      artists,
      proposers,
      editals,
      tags,
      comments,
    };

    // Retorna a resposta JSON com os dados e o status 200 (OK)
    return NextResponse.json(allData, { status: 200 });
  } catch (error: any) {
    // Em caso de erro, retorna uma resposta de erro genérica com status 500
    return NextResponse.json(
      { error: 'Falha ao carregar dados. Verifique a conexão com o Supabase ou o nome das tabelas.' },
      { status: 500 }
    );
  }
}
