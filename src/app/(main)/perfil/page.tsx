"use client";

import Link from "next/link";
import AppShell from "@/shared/components/organisms/AppShell";
import ProfileView from "@/shared/components/organisms/ProfileView";
import ProposerProfileView from "@/shared/components/organisms/ProposerProfileView";
import { useEditals } from "@/app/hooks/useEditals";
import { useSocialStore } from "@/app/hooks/useSocialStore";

const PROFILE_LINKS = [
  { href: "/onboarding", label: "Completar perfil" },
  { href: "/perfil/trajetoria", label: "Trajetória" },
  { href: "/perfil/obras", label: "Obras" },
  { href: "/perfil/privacidade", label: "Privacidade e meus dados" },
];

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
      <nav aria-label="Mais do seu perfil" className="flex flex-wrap gap-x-5 gap-y-2 px-5 py-4 sm:px-6 text-sm border-t border-(--border-subtle)">
        {PROFILE_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="font-semibold text-(--primary-fg) hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </AppShell>
  );
}
