"use client";

import AppShell from "@/shared/components/organisms/AppShell";
import WorkManager from "@/shared/components/organisms/WorkManager";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { ALL_ART_TAGS } from "@/app/lib/user-profiles";

export default function ObrasPage() {
  const { currentProfile, isProposer } = useSocialStore();

  return (
    <AppShell title="Minhas obras">
      {isProposer ? (
        <p className="p-8 text-center text-sm text-(--text-muted)">Obras são do perfil de artista. Organizações publicam editais.</p>
      ) : (
        <WorkManager profile={currentProfile} availableCategories={ALL_ART_TAGS} />
      )}
    </AppShell>
  );
}
