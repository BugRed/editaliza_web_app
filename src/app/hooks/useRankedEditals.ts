"use client";

import { useEffect, useState } from "react";
import type { IEdital } from "@/app/types/Edital";
import type { ArtistRankResult } from "@/shared/lib/artistrank";

export interface RankedEdital {
  edital: IEdital;
  proposerName: string;
  rank: ArtistRankResult | null;
}

// Mesma chamada do feed, para telas que olham um edital só (o "por quê" da nota).
export function useRankedEditals(): { items: RankedEdital[]; loading: boolean } {
  const [items, setItems] = useState<RankedEdital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load(): Promise<void> {
      try {
        const res = await fetch("/api/ranking", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as { ranked?: RankedEdital[] };
        if (active) setItems(payload.ranked ?? []);
      } catch {
        // Sem o ranking a tela mostra o estado de "sem nota"; não há o que recuperar aqui.
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  return { items, loading };
}
