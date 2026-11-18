"use client";

import { useParams } from "next/navigation";
import AppShell from "@/shared/components/organisms/AppShell";
import CandidatesPanel from "@/shared/components/organisms/CandidatesPanel";
import { useEditals } from "@/app/hooks/useEditals";
import { CANDIDATES_FIXTURE } from "@/app/lib/candidates-fixture";

export default function CandidatosPage() {
  const params = useParams<{ id: string }>();
  const { editais, loading } = useEditals();
  const edital = editais.find((item) => String(item.id) === params.id);

  return (
    <AppShell title="Candidatos">
      {loading ? (
        <p role="status" className="p-12 text-center text-sm text-(--text-muted)">
          Carregando edital...
        </p>
      ) : (
        <CandidatesPanel editalTitle={edital?.title ?? "Edital não encontrado"} candidates={CANDIDATES_FIXTURE} />
      )}
    </AppShell>
  );
}
