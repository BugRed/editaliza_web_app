
import { EditalCard } from "@/shared/components/molecules/EditalCard";
import { EmptyState } from "@/shared/components/molecules/EmptyState";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import { SearchBar } from "@/shared/components/molecules/SearchBar";
import type { EditalCardData } from "@/shared/lib/edital-view";

type FeedViewProps = { editais: EditalCardData[]; query?: string; searchAction: string; detailHref?: (id: number) => string };

export function FeedView({ editais, query = "", searchAction, detailHref }: FeedViewProps) {
  const searching = query.trim().length > 0;

  return (
    <>
      <PageHeader title="Editais" description="Oportunidades abertas, das mais recentes às mais antigas." />
      <SearchBar action={searchAction} defaultValue={query} />
      {editais.length === 0 ? (
        <EmptyState
          title={searching ? "Nenhum edital para essa busca" : "Ainda não há editais"}
          description={searching ? "Tente outro termo ou limpe a busca." : "Volte em breve: novos editais aparecem aqui."}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Lista de editais">
          {editais.map((edital) => (
            <li key={edital.id}>
              <EditalCard {...edital} href={detailHref ? detailHref(edital.id) : edital.href} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

