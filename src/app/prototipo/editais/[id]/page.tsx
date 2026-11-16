import { notFound } from "next/navigation";

import { EditalDetail } from "@/shared/components/organisms/EditalDetail";
import { EDITAL_DETAILS } from "@/shared/fixtures/prototype";

type Props = { params: Promise<{ id: string }> };

export default async function PrototypeEditalPage({ params }: Props) {
  const { id } = await params;
  const edital = EDITAL_DETAILS.find((item) => String(item.id) === id);
  if (!edital) notFound();
  return <EditalDetail edital={edital} whyHref={`/prototipo/editais/${edital.id}/porque`} />;
}
