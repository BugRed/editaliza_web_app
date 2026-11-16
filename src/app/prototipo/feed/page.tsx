import { FeedSkeleton } from "@/shared/components/organisms/FeedSkeleton";
import { FeedView } from "@/shared/components/organisms/FeedView";
import { EDITAL_CARDS } from "@/shared/fixtures/prototype";
import { filterEditalCards } from "@/shared/lib/edital-view";

type Props = { searchParams: Promise<{ q?: string; estado?: string }> };

export default async function PrototypeFeedPage({ searchParams }: Props) {
  const { q = "", estado } = await searchParams;
  if (estado === "carregando") return <FeedSkeleton />;
  const cards = estado === "vazio" ? [] : filterEditalCards(EDITAL_CARDS, q);
  return <FeedView editais={cards} query={q} searchAction="/prototipo/feed" detailHref={(id) => `/prototipo/editais/${id}`} />;
}
