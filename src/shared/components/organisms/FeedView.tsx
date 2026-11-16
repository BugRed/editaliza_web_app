import { EditalCard } from "@/shared/components/molecules/EditalCard";
import { EmptyState } from "@/shared/components/molecules/EmptyState";
import { SearchBar } from "@/shared/components/molecules/SearchBar";
import type { EditalCardData } from "@/shared/lib/edital-view";

type FeedViewProps = { editais: EditalCardData[]; query?: string; searchAction: string; detailHref?: (id: number) => string };

// O título da página ("Editais") vem do cabeçalho fixo do AppShell.
export function FeedView({ editais, query = "", searchAction, detailHref }: FeedViewProps) {
  const searching = query.trim().length > 0;

  return (
    <>
      <div className="border-b border-line p-4">
        <SearchBar action={searchAction} defaultValue={query} />
      </div>
      {editais.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title={searching ? "Nenhum edital para essa busca" : "Ainda não há editais"}
            description={searching ? "Tente outro termo ou limpe a busca." : "Volte em breve: novos editais aparecem aqui."}
          />
        </div>
      ) : (
        <ul aria-label="Lista de editais">
          {editais.map((edital) => (
            <li key={edital.id}>
              <EditalCard
                title={edital.title}
                organization={edital.organization}
                dateLabel={edital.deadlineLabel}
                description={edital.description}
                coverImage={edital.coverImage}
                statusLabel={edital.statusLabel}
                tags={edital.tags}
                submitHref={edital.submitHref}
                detailHref={detailHref?.(edital.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
