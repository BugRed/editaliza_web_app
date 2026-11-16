import { notFound } from "next/navigation";

import { MatchExplanation } from "@/shared/components/organisms/MatchExplanation";
import { EDITAL_DETAILS, MATCH_FACTORS } from "@/shared/fixtures/prototype";

type Props = { params: Promise<{ id: string }> };

export default async function PrototypeWhyPage({ params }: Props) {
  const { id } = await params;
  const edital = EDITAL_DETAILS.find((item) => String(item.id) === id);
  if (!edital) notFound();
  return <MatchExplanation editalTitle={edital.title} factors={MATCH_FACTORS} />;
}
