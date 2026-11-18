"use client";

import { use } from "react";
import Link from "next/link";
import AppShell from "@/shared/components/organisms/AppShell";
import ArtistPublicView from "@/shared/components/organisms/ArtistPublicView";
import { useSocialStore } from "@/app/hooks/useSocialStore";

export default function ArtistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getProfileById } = useSocialStore();
  const profile = getProfileById(Number(id));

  return (
    <AppShell title="Artista">
      {profile ? (
        <ArtistPublicView profile={profile} />
      ) : (
        <div className="p-8 text-center space-y-3">
          <p className="text-base font-bold text-(--foreground)">Artista não encontrado</p>
          <Link href="/" className="text-sm font-semibold text-(--primary-fg) hover:underline">
            Voltar ao início
          </Link>
        </div>
      )}
    </AppShell>
  );
}
