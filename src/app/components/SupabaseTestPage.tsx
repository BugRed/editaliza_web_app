import Artist from '@/app/types/Artist';
import Edital from '@/app/types/Edital';
import Proposer from '@/app/types/Proposer';
import TagData from '@/app/types/TagData';
import UserData from '@/app/types/UserData';
import { NextPage } from 'next';

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
      <div className="container mx-auto p-6 bg-(--background) text-(--foreground)">
        <h1 className="text-3xl font-bold mb-4 text-(--primary-fg)">Teste de Conexão de Dados</h1>
        <p className="text-(--danger)">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-(--background) text-(--foreground)">
      <h1 className="text-3xl font-bold mb-8 text-(--primary-fg)">Dados Carregados</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Usuários (user_data)</h2>
        <pre className="bg-(--bg-card) border border-(--border-subtle) p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Artistas (artists)</h2>
        <pre className="bg-(--bg-card) border border-(--border-subtle) p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(artists, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Proponentes (proposers)</h2>
        <pre className="bg-(--bg-card) border border-(--border-subtle) p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(proposers, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Editais (editals)</h2>
        <pre className="bg-(--bg-card) border border-(--border-subtle) p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(editals, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Tags (tags)</h2>
        <pre className="bg-(--bg-card) border border-(--border-subtle) p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(tags, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SupabaseTestPage;