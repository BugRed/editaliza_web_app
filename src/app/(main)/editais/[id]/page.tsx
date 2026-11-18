"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/shared/components/organisms/AppShell";
import EditalDetailView from "@/shared/components/organisms/EditalDetailView";
import { useEditals } from "@/app/hooks/useEditals";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { getEditalProposerHref, getEditalProposerId } from "@/shared/lib/edital-owner";

export default function EditalPage() {
  const params = useParams<{ id: string }>();
  const { editais, loading } = useEditals();
  const { proposers, isEditalSaved, toggleSaveEdital } = useSocialStore();

  const edital = editais.find((item) => String(item.id) === params.id);
  const proposerId = edital ? getEditalProposerId(edital) : null;
  const proposerName = proposers.find((p) => p.id === proposerId)?.name ?? "Organização não identificada";

  return (
    <AppShell title="Edital">
      {loading ? (
        <p role="status" className="p-12 text-center text-sm text-(--text-muted)">
          Carregando edital...
        </p>
      ) : !edital ? (
        <div className="p-12 text-center space-y-3">
          <p className="text-sm text-(--text-muted)">Não encontramos este edital. Ele pode ter sido removido.</p>
          <Link href="/" className="text-sm font-semibold text-(--primary-fg) hover:underline">
            Voltar ao início
          </Link>
        </div>
      ) : (
        <EditalDetailView
          edital={edital}
          proposerName={proposerName}
          proposerHref={getEditalProposerHref(edital)}
          saved={isEditalSaved(edital.id)}
          onToggleSave={() => toggleSaveEdital(edital.id)}
        />
      )}
    </AppShell>
  );
}
