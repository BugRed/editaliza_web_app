import { TrajectoryView } from "@/shared/components/organisms/RecordLists";
import { EXPERIENCES } from "@/shared/fixtures/prototype";

type Props = { searchParams: Promise<{ estado?: string }> };

export default async function PrototypeTrajectoryPage({ searchParams }: Props) {
  const { estado } = await searchParams;
  return <TrajectoryView experiences={estado === "vazio" ? [] : EXPERIENCES} />;
}
