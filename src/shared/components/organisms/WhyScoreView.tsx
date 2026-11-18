import Link from "next/link";
import RankBars from "@/shared/components/organisms/RankBars";
import { getMissingFactors } from "@/shared/lib/rank-view";
import { improvementLinksFor } from "@/shared/lib/rank-improvement";
import type { ArtistRankResult } from "@/shared/lib/artistrank";

interface WhyScoreViewProps {
  editalTitle: string;
  editalId: number;
  rank: ArtistRankResult | null;
}

export default function WhyScoreView({ editalTitle, editalId, rank }: WhyScoreViewProps) {
  const links = rank ? improvementLinksFor(getMissingFactors(rank.fatores ?? [])) : [];

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-(--primary-fg)">Por que essa nota</p>
        <h2 className="text-xl font-bold text-(--foreground)">{editalTitle}</h2>
      </header>

      {!rank ? (
        <p className="rounded-xl border border-dashed border-(--border-subtle) p-6 text-sm text-(--text-muted)">
          Ainda não calculamos a compatibilidade deste edital com o seu perfil.
        </p>
      ) : rank.bloqueado ? (
        <p role="alert" className="rounded-xl border border-(--danger-border) bg-(--danger-soft) p-4 text-sm text-(--danger)">
          Você não é elegível a este edital: {rank.motivoBloqueio ?? "um requisito eliminatório não é atendido"}. Compatibilidade artística alta não compensa um requisito
          eliminatório.
        </p>
      ) : (
        <>
          <RankBars rank={rank} />
          {links.length > 0 && (
            <section aria-label="O que preencher" className="space-y-2 rounded-xl border border-(--border-subtle) bg-(--bg-card) p-4">
              <h3 className="text-sm font-bold text-(--foreground)">O que preencher para a nota ficar mais completa</h3>
              <ul className="space-y-1 text-sm">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-semibold text-(--primary-fg) hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <Link href={`/editais/${editalId}`} className="inline-flex text-sm font-semibold text-(--primary-fg) hover:underline">
        Voltar ao edital
      </Link>
    </div>
  );
}
