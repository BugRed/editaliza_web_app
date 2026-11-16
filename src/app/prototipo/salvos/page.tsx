import { EmptyState } from "@/shared/components/molecules/EmptyState";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import { FeedView } from "@/shared/components/organisms/FeedView";
import { EDITAL_CARDS } from "@/shared/fixtures/prototype";

type Props = { searchParams: Promise<{ estado?: string }> };

export default async function PrototypeSavedPage({ searchParams }: Props) {
  const { estado } = await searchParams;
  if (estado === "vazio") {
    return (
      <>
        <PageHeader title="Salvos" />
        <EmptyState title="Você ainda não salvou nenhum edital" description="Salve editais para decidir com calma depois." />
      </>
    );
  }
  return <FeedView editais={EDITAL_CARDS.slice(0, 1)} searchAction="/prototipo/salvos" detailHref={(id) => `/prototipo/editais/${id}`} />;
}
