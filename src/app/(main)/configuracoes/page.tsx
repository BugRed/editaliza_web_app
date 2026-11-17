"use client";

import AppShell from "@/shared/components/organisms/AppShell";
import ArtistSettingsForm from "@/shared/components/organisms/ArtistSettingsForm";
import ProposerSettingsForm from "@/shared/components/organisms/ProposerSettingsForm";
import { useSocialStore } from "@/app/hooks/useSocialStore";

export default function ConfiguracoesPage() {
  const { currentProfile, currentProposer, isProposer, profilesLoading } = useSocialStore();

  return (
    <AppShell title="Configurações do perfil">
      {profilesLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--border-subtle) border-t-(--primary-fg)" />
          <p className="text-sm text-(--text-muted)">Carregando dados do perfil...</p>
        </div>
      ) : isProposer && currentProposer ? (
        <ProposerSettingsForm key={currentProposer.id} proposer={currentProposer} />
      ) : (
        <ArtistSettingsForm
          key={`${currentProfile.id}-${currentProfile.portfolioCompleteness}`}
          currentProfile={currentProfile}
        />
      )}
    </AppShell>
  );
}
