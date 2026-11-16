"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import AppShell from "@/app/components/shell/AppShell";
import BodyCardFeed from "@/app/components/cardFeed/BodyCardFeed";
import { useAuth } from "@/app/hooks/useAuth";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { IEdital } from "@/app/types/Edital";
import { TagData } from "@/app/types/TagData";
import { mensagemDeErro } from "@/app/lib/erros";
import { ArtistRankResult } from "@/shared/lib/artistrank";

interface RankedEditalItem {
  edital: IEdital;
  proposerName: string;
  rank: ArtistRankResult | null;
}

export default function SalvosPage() {
  const { user, token } = useAuth();
  const { currentProfile, rankingVersion, savedEditalIds, openEditalModal } =
    useSocialStore();
  const [rankedItems, setRankedItems] = useState<RankedEditalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetAccountId = user?.id ?? currentProfile.id;

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      try {
        const res = await fetch(
          `/api/ranking?artistId=${targetAccountId}`,
          { cache: "no-store", headers }
        );

        if (!res.ok) {
          throw new Error(`Erro ao carregar editais: ${res.status}`);
        }

        const payload = (await res.json()) as { ranked: RankedEditalItem[] };
        if (active) {
          setRankedItems(payload.ranked ?? []);
          setError(null);
        }
      } catch (err) {
        if (active) setError(mensagemDeErro(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [token, targetAccountId, rankingVersion]);

  const parseTags = (raw: unknown): TagData[] => {
    if (Array.isArray(raw)) return raw as TagData[];
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const savedItems = rankedItems.filter((item) =>
    savedEditalIds.includes(item.edital.id)
  );

  const getRankColor = (rank: ArtistRankResult | null) => {
    if (!rank) return "#0E7C86";
    if (rank.bloqueado) return "#B91C1C";
    if (rank.rotulo === 3) return "#0E7C86";
    if (rank.rotulo === 2) return "#B45309";
    return "#6B8388";
  };

  return (
    <AppShell title="Editais salvos">
      {loading ? (
        <div className="p-10 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#DCE6E8] border-t-[#0E7C86]" />
          <p className="text-sm text-[#4A656B]">Carregando seus editais salvos...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-sm text-red-700">{error}</div>
      ) : savedItems.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F6F7] text-[#0E7C86] flex items-center justify-center mx-auto">
            <Bookmark size={22} />
          </div>
          <h2 className="text-lg font-bold text-[#102A30]">
            Nenhum edital salvo ainda
          </h2>
          <p className="text-sm text-[#4A656B] max-w-sm mx-auto">
            Toque no ícone de bandeira nos editais do feed para guardar os prazos que interessam ao seu trabalho.
          </p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 rounded-xl bg-[#0E7C86] text-white text-sm font-semibold hover:bg-[#0B656D] transition-colors"
          >
            Explorar editais no Início
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {savedItems.map(({ edital, proposerName, rank }) => (
            <BodyCardFeed
              key={edital.id}
              editalId={edital.id}
              percent={rank ? String(Math.round(rank.scoreFinal)) : "Aberto"}
              colorPercent={getRankColor(rank)}
              coverImage={edital.imgCoverUrl || ""}
              title={edital.title}
              description={edital.description}
              proposer={proposerName}
              proposerLink=""
              date={edital.publishDate}
              tags={parseTags(edital.listTags)}
              buttomSubmitLink={edital.inscriptionLink}
              rank={rank ?? undefined}
              onOpenSummary={() =>
                openEditalModal(edital, proposerName, rank ?? undefined)
              }
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
