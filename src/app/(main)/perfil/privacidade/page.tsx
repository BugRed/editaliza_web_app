"use client";

import Link from "next/link";
import AppShell from "@/shared/components/organisms/AppShell";
import PrivacyPanel from "@/shared/components/organisms/PrivacyPanel";
import { useSocialStore } from "@/app/hooks/useSocialStore";

export default function PrivacidadePage() {
  const { currentProfile, currentProposer, isProposer } = useSocialStore();
  const profile = isProposer && currentProposer ? currentProposer : currentProfile;

  return (
    <AppShell title="Privacidade e meus dados">
      <PrivacyPanel profile={profile} />
      <p className="px-5 pb-6 sm:px-6 text-sm">
        <Link href="/perfil" className="font-semibold text-(--primary-fg) hover:underline">
          Voltar ao perfil
        </Link>
      </p>
    </AppShell>
  );
}
