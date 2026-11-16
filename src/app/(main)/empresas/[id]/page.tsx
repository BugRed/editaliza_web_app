"use client";

import { use } from "react";
import Link from "next/link";
import AppShell from "@/app/components/shell/AppShell";
import ProposerProfileView from "@/app/components/profile/ProposerProfileView";
import { useEditals } from "@/app/hooks/useEditals";
import { useSocialStore } from "@/app/hooks/useSocialStore";

export default function EmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { proposers, currentProposer, openEditalModal, profilesLoading } = useSocialStore();
  const { editais, loading } = useEditals();
  const proposer = proposers.find((item) => item.id === Number(id));

  if (!proposer) {
    return (
      <AppShell title="Empresa">
        <div className="space-y-3 p-8 text-center">
          <p className="text-base font-bold text-[#102A30]">{profilesLoading ? "Carregando..." : "Empresa não encontrada"}</p>
          {!profilesLoading && (
            <>
              <p className="text-sm text-[#4A656B]">Este proponente não existe ou ainda não publicou no Editaliza.</p>
              <Link href="/" className="inline-flex rounded-xl bg-[#0E7C86] px-4 py-2 text-sm font-semibold text-white">
                Voltar ao início
              </Link>
            </>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={proposer.name}>
      <ProposerProfileView
        proposer={proposer}
        editais={editais}
        editaisLoading={loading}
        isOwnProfile={currentProposer?.id === proposer.id}
        onOpenEdital={(edital) => openEditalModal(edital, proposer.name)}
      />
    </AppShell>
  );
}
