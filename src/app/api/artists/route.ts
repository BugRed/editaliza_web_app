import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';
import { ARTIST_PUBLIC_COLUMNS } from '@/shared/lib/artist-columns';
import { normalizeArtistRow, SEEDED_PROFILES } from '@/app/lib/user-profiles';

// Este endpoint lida com requisições GET para a tabela 'artist_data'
// Sem `password` e sem `cpf` no select — espelha o toPublicJSON do tipo Artist
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('artist_data')
      .select(ARTIST_PUBLIC_COLUMNS);

    if (error) {
      console.error('Erro ao buscar dados de artistas:', error);
      throw error;
    }

    const rows = Array.isArray(data) ? data : [];
    const normalized = rows.map((row) => {
      const record = row as unknown as Record<string, unknown>;
      const seedFallback = SEEDED_PROFILES.find(
        (s) => s.id === Number(record.id)
      );
      return normalizeArtistRow(record, seedFallback);
    });

    return NextResponse.json(normalized, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao carregar dados de artistas.' },
      { status: 500 }
    );
  }
}
