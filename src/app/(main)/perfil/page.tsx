"use client";

import Link from "next/link";
import AppShell from "@/shared/components/organisms/AppShell";
import ProfileView from "@/shared/components/organisms/ProfileView";
import ProposerProfileView from "@/shared/components/organisms/ProposerProfileView";
import { useEditals } from "@/app/hooks/useEditals";
import { useSocialStore } from "@/app/hooks/useSocialStore";

export default function MeuPerfilPage() {
  const { currentProfile, currentProposer, isProposer, openEditalModal } = useSocialStore();
  const { editais, loading } = useEditals();

  return (
    <AppShell title="Perfil">
      {isProposer && currentProposer ? (
        <ProposerProfileView
          proposer={currentProposer}
          editais={editais}
          editaisLoading={loading}
          isOwnProfile
          onOpenEdital={(edital) => openEditalModal(edital, currentProposer.name)}
        />
      ) : (
        <ProfileView profile={currentProfile} isOwnProfile={true} />
      )}
      <p className="px-5 py-4 sm:px-6 text-sm border-t border-(--border-subtle)">
        <Link href="/perfil/privacidade" className="font-semibold text-(--primary-fg) hover:underline">
          Privacidade e meus dados
        </Link>
      </p>
    </AppShell>
  );
}
