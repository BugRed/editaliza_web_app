import { supabase } from '@/app/lib/supabase';
import Artist from '@/app/types/Artist';
import Edital from '@/app/types/Edital';
import Proposer from '@/app/types/Proposer';
import TagData from '@/app/types/TagData';
import UserData from '@/app/types/Userdata';
import { GetStaticProps, NextPage } from 'next';


interface SupabaseTestPageProps {
  userData: UserData[];
  artists: Artist[];
  proposers: Proposer[];
  editals: Edital[];
  tags: TagData[];
  error: string | null;
}

const SupabaseTestPage: NextPage<SupabaseTestPageProps> = ({ userData, artists, proposers, editals, tags, error }) => {
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Teste de Conexão Supabase</h1>
        <p className="text-red-500">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Dados Carregados do Supabase</h1>

      {/* Seção 1: user_data */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dados de Usuários (user_data)</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>

      {/* Seção 2: artist_data */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dados de Artistas (artists)</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(artists, null, 2)}
        </pre>
      </div>
      
      {/* Seção 3: proposer_data */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dados de Proponentes (proposers)</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(proposers, null, 2)}
        </pre>
      </div>
      
      {/* Seção 4: editals_data */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dados de Editais (editals)</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(editals, null, 2)}
        </pre>
      </div>

      {/* Seção 5: tags_data */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dados de Tags (tags)</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(tags, null, 2)}
        </pre>
      </div>
      
    </div>
  );
};

export default SupabaseTestPage;