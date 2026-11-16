import { WorksView } from "@/shared/components/organisms/RecordLists";
import { WORKS } from "@/shared/fixtures/prototype";

type Props = { searchParams: Promise<{ estado?: string }> };

export default async function PrototypeWorksPage({ searchParams }: Props) {
  const { estado } = await searchParams;
  return <WorksView works={estado === "vazio" ? [] : WORKS} />;
}
