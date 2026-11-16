import { CandidatesList } from "@/shared/components/organisms/CandidatesList";
import { CANDIDATES, EDITAL_DETAILS } from "@/shared/fixtures/prototype";

type Props = { searchParams: Promise<{ estado?: string }> };

export default async function PrototypeCandidatesPage({ searchParams }: Props) {
  const { estado } = await searchParams;
  return <CandidatesList editalTitle={EDITAL_DETAILS[0].title} candidates={estado === "vazio" ? [] : CANDIDATES} />;
}
