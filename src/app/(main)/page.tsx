"use client";

import { getEditalProposerHref } from "@/shared/lib/edital-owner";
import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, PlusCircle } from "lucide-react";
import { IEdital } from "@/app/types/Edital";
import { TagData } from "@/app/types/TagData";
import { mensagemDeErro } from "@/app/lib/erros";
import BodyCardFeed from "@/app/components/cardFeed/BodyCardFeed";
import AppShell from "@/app/components/shell/AppShell";
import AdSlot from "@/app/components/ads/AdSlot";
import { adPositions } from "@/app/lib/ads";
import { useAuth } from "@/app/hooks/useAuth";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { ArtistRankResult } from "@/shared/lib/artistrank";

interface RankedEditalItem {
  edital: IEdital;
  proposerName: string;
  rank: ArtistRankResult | null;
}

const AD_EVERY = 3;

export default function FeedPage() {
  const { user } = useAuth();
  const { currentProfile, isProposer, rankingVersion, openEditalModal } =
    useSocialStore();
  const [rankedItems, setRankedItems] = useState<RankedEditalItem[]>([]);
  const [avisoEscassez, setAvisoEscassez] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const targetAccountId = user?.id ?? currentProfile.id;

  useEffect(() => {
    let active = true;
    const fetchRanked = async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      try {
        const res = await fetch(
          "/api/ranking",
          {
            cache: "no-store",
            headers,
          }
        );

        if (!res.ok) {
          throw new Error(
            `Erro no ranqueamento de editais: ${res.status} ${res.statusText}`
          );
        }

        const payload = (await res.json()) as {
          avisoEscassez: boolean;
          ranked: RankedEditalItem[];
        };

        if (active) {
          setRankedItems(payload.ranked ?? []);
          setAvisoEscassez(Boolean(payload.avisoEscassez));
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(mensagemDeErro(err));
        }
        console.error("Falha ao buscar ranking da API:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRanked();
    return () => {
      active = false;
    };
  }, [targetAccountId, rankingVersion]);

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

  // Um anúncio a cada AD_EVERY posts, como numa timeline: o post nunca fica sem o seu card.
  const adIndexes = adPositions(rankedItems.length, AD_EVERY);

  const getRankColor = (rank: ArtistRankResult | null) => {
    if (!rank) return "#0E7C86";
    if (rank.bloqueado) return "#B91C1C";
    if (rank.rotulo === 3) return "#0E7C86";
    if (rank.rotulo === 2) return "#B45309";
    return "#6B8388";
  };

  return (
    <AppShell title="Início">
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#DCE6E8] border-t-[#0E7C86]" />
          <p className="text-sm text-[#4A656B]">
            {isProposer ? "Carregando editais..." : "Calculando recomendações..."}
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-sm text-red-700">
            {error || "Erro ao carregar dados. Tente novamente mais tarde."}
          </p>
        </div>
      ) : rankedItems.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-[#4A656B]">
            Nenhum edital disponível no momento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {isProposer && (
            <div className="mx-4 mt-4 rounded-xl border border-[#CBE5E8] bg-[#E6F4F5] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-[#09585F]">
                <p className="font-bold">Conta Propositor ativa</p>
                <p>Publique um novo edital para alcançar artistas compatíveis na rede.</p>
              </div>
              <Link
                href="/publicar-edital"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E7C86] text-white text-xs sm:text-sm font-bold hover:bg-[#0B656D] transition-colors shrink-0"
              >
                <PlusCircle size={16} />
                <span>Publicar edital</span>
              </Link>
            </div>
          )}

          {!isProposer && avisoEscassez && (
            <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-[#FFF8E1] p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-[#B45309] mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm text-[#7A5400] space-y-1">
                <p className="font-bold">
                  Poucas opções aderentes ao seu perfil atual
                </p>
                <p>
                  Nenhum edital elegível atingiu aderência moderada ou forte para as suas linguagens atuais. Complete seu portfólio ou revise suas linguagens em{" "}
                  <Link href="/configuracoes" className="font-bold underline text-[#0E7C86]">
                    Configurações
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {rankedItems.map(({ edital, proposerName, rank }, index) => (
            <Fragment key={edital.id}>
            <BodyCardFeed
              editalId={edital.id}
              percent={rank ? String(Math.round(rank.scoreFinal)) : "Aberto"}
              colorPercent={getRankColor(rank)}
              coverImage={edital.imgCoverUrl || ""}
              title={edital.title}
              description={edital.description}
              proposer={proposerName}
              proposerLink={getEditalProposerHref(edital)}
              date={edital.publishDate}
              tags={parseTags(edital.listTags)}
              buttomSubmitLink={edital.inscriptionLink}
              rank={rank ?? undefined}
              onOpenSummary={() =>
                openEditalModal(edital, proposerName, rank ?? undefined)
              }
            />
            {adIndexes.includes(index) && <AdSlot variant="feed" slot={index} />}
            </Fragment>
          ))}
        </div>
      )}
    </AppShell>
  );
}