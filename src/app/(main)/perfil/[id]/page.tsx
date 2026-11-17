"use client";

import { use } from "react";
import Link from "next/link";
import AppShell from "@/app/components/shell/AppShell";
import ProfileView from "@/app/components/profile/ProfileView";
import { useSocialStore } from "@/app/hooks/useSocialStore";

export default function OutroPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getProfileById, currentProfile } = useSocialStore();
  const profile = getProfileById(Number(id));

  if (!profile) {
    return (
      <AppShell title="Perfil">
        <div className="p-8 text-center space-y-3">
          <p className="text-base font-bold text-[#102A30]">
            Artista não encontrado
          </p>
          <p className="text-sm text-[#4A656B]">
            O perfil solicitado não existe na base de teste.
          </p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 rounded-xl bg-[#0E7C86] text-white text-sm font-semibold"
          >
            Voltar ao início
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={profile.name}>
      <ProfileView
        profile={profile}
        isOwnProfile={profile.id === currentProfile.id}
      />
    </AppShell>
  );
}
