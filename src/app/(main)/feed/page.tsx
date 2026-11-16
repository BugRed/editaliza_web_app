"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { mensagemDeErro } from "@/app/lib/erros";
import type { AllData } from "@/app/types/AllDatas";
import { EmptyState } from "@/shared/components/molecules/EmptyState";
import { FeedSkeleton } from "@/shared/components/organisms/FeedSkeleton";
import { FeedView } from "@/shared/components/organisms/FeedView";
import { filterEditalCards, toEditalCardData, type EditalCardData } from "@/shared/lib/edital-view";

type FeedState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; cards: EditalCardData[] };

// Dados ainda vêm de /api/data (Supabase); a O2 troca por Prisma sem mexer na UI.
function FeedContent() {
  const query = useSearchParams().get("q") ?? "";
  const [state, setState] = useState<FeedState>({ status: "loading" });

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const res = await fetch("/api/data", { cache: "no-store" });
        if (!res.ok) throw new Error(`Erro ${res.status} ao buscar editais`);
        const data = (await res.json()) as AllData;
        const now = new Date();
        setState({ status: "ready", cards: (data.editals ?? []).map((edital) => toEditalCardData(edital, now)) });
      } catch (err) {
        setState({ status: "error", message: mensagemDeErro(err) });
      }
    }
    void load();
  }, []);

  if (state.status === "loading") return <FeedSkeleton />;
  if (state.status === "error") {
    return <EmptyState title="Não foi possível carregar os editais" description="Tente novamente em instantes." />;
  }
  return <FeedView editais={filterEditalCards(state.cards, query)} query={query} searchAction="/feed" />;
}

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedContent />
    </Suspense>
  );
}
