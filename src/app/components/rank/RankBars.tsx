"use client";

import { AlertTriangle, ChevronDown, Info } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import type { ArtistRankResult, RankFactor, RankFactorGroup } from "@/shared/lib/artistrank";
import {
  BAND_LABELS,
  BAND_LIMITS,
  clampPercent,
  getMissingFactors,
  getScoreBand,
  GROUP_SHARE,
  GROUP_TITLES,
  splitFactorsByGroup,
  type ScoreBand,
} from "@/shared/lib/rank-view";

const MIN_BAR_PERCENT = 2;

const BAND_COLOR: Record<ScoreBand, string> = {
  pouco: "#C62828",
  medio: "#E5A500",
  alto: "#2F9E6B",
};

function ScoreBar({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  const percent = clampPercent(value);
  const band = getScoreBand(percent);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className={strong ? "text-sm font-bold text-[#102A30]" : "font-medium text-[#4A656B]"}>{label}</span>
        <span className="tabular-nums text-[#102A30]">
          <span className="font-bold">{percent.toFixed(1)}</span>
          <span className="ml-1.5 font-semibold text-[#6B8388]">{BAND_LABELS[band]}</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-valuetext={`${percent.toFixed(1)} de 100, ${BAND_LABELS[band].toLowerCase()}`}
        className={`overflow-hidden rounded-full bg-[#E6EEF0] ${strong ? "h-3" : "h-2"}`}
      >
        {/* Mínimo de 2% de largura: nota 0 ainda mostra a ponta vermelha em vez de uma trilha vazia. */}
        <div className="h-full rounded-full" style={{ width: `${Math.max(percent, MIN_BAR_PERCENT)}%`, backgroundColor: BAND_COLOR[band] }} />
      </div>
    </div>
  );
}

// Fator sem dado: trilha tracejada e texto, nunca uma barra curta que pareça nota baixa.
function UnknownBar({ label }: { label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium text-[#4A656B]">{label}</span>
        <span className="font-semibold text-[#6B8388]">Sem informação</span>
      </div>
      <div
        aria-hidden="true"
        className="h-2 rounded-full border border-dashed border-[#C2D3D7]"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, #F0F6F7 0 6px, #FFFFFF 6px 12px)" }}
      />
    </div>
  );
}

// Os fatores ficam num dropdown fechado por padrão: a barra do grupo sempre aparece, o detalhe o usuário abre quando quiser.
function FactorGroup({ group, factors, total }: { group: RankFactorGroup; factors: RankFactor[]; total: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section aria-label={GROUP_TITLES[group]} className="flex flex-col gap-3 rounded-xl border border-[#DCE6E8] bg-white p-3.5">
      <ScoreBar label={`${GROUP_TITLES[group]} · ${GROUP_SHARE[group]}% do score`} value={total} strong />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#DCE6E8] bg-[#F8FAFB] px-3 py-1.5 text-xs font-bold text-[#4A656B] transition-colors hover:bg-[#F0F6F7]"
      >
        <span>
          {open ? "Esconder" : "Mostrar"} os {factors.length} fatores
        </span>
        <ChevronDown size={15} aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={panelId} hidden={!open} className="space-y-2.5">
        {factors.map((factor) =>
          factor.nota === null ? <UnknownBar key={factor.id} label={factor.label} /> : <ScoreBar key={factor.id} label={factor.label} value={factor.nota} />
        )}
      </div>
    </section>
  );
}

function BandLegend() {
  const items: Array<{ band: ScoreBand; range: string }> = [
    { band: "pouco", range: `até ${BAND_LIMITS.pouco}` },
    { band: "medio", range: `até ${BAND_LIMITS.medio}` },
    { band: "alto", range: `acima de ${BAND_LIMITS.medio}` },
  ];
  return (
    <ul aria-label="Legenda das cores" className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#6B8388]">
      {items.map(({ band, range }) => (
        <li key={band} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAND_COLOR[band] }} />
          {BAND_LABELS[band]} ({range})
        </li>
      ))}
    </ul>
  );
}

export default function RankBars({ rank }: { rank: ArtistRankResult }) {
  const factors = rank.fatores ?? [];
  const groups = splitFactorsByGroup(factors);
  const missing = getMissingFactors(factors);

  return (
    <section aria-label="Compatibilidade com o seu perfil" className="space-y-4 rounded-xl border border-[#DCE6E8] bg-[#F8FAFB] p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#0E7C86]">Compatibilidade com o seu perfil (ArtistRank)</p>
        <p className="mt-0.5 text-sm font-bold text-[#102A30]">
          {rank.nivelAderencia}
          {!rank.bloqueado && <span className="tabular-nums"> · {rank.scoreFinal.toFixed(1)} / 100</span>}
        </p>
      </div>

      {rank.bloqueado ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {rank.motivoBloqueio ?? "Você não atende a um requisito eliminatório deste edital."}
        </p>
      ) : (
        <>
          <div className="space-y-2.5">
            <ScoreBar label="Score final" value={rank.scoreFinal} strong />
            {rank.tetoAplicado && (
              <>
                <ScoreBar label="Score antes do teto" value={rank.scoreBruto} />
                {rank.motivoTeto && (
                  <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-[#FFF8E1] px-3 py-2 text-xs font-semibold text-[#7A5400]">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{rank.motivoTeto}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {factors.length > 0 && (
            <div className="space-y-3">
              <FactorGroup group="ARTISTA" factors={groups.ARTISTA} total={rank.rArtista} />
              <FactorGroup group="PORTFOLIO" factors={groups.PORTFOLIO} total={rank.rPortfolio} />
              <BandLegend />
            </div>
          )}

          {missing.length > 0 && (
            <p className="text-xs leading-relaxed text-[#4A656B]">
              <strong className="text-[#102A30]">O que falta informar:</strong> {missing.map((factor) => factor.label).join(", ")}.{" "}
              <Link href="/configuracoes" className="font-bold text-[#0E7C86] underline">
                Completar em Configurações
              </Link>
            </p>
          )}
        </>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-[#DCE6E8] bg-white px-3 py-2.5 text-xs text-[#4A656B]">
        <Info size={14} className="mt-0.5 shrink-0 text-[#6B8388]" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="tabular-nums text-[#102A30]">
            Confiança dos dados {rank.confiancaC.toFixed(1)} · cobertura {rank.cobertura.toFixed(0)}%.
          </strong>{" "}
          Mostra o quanto o seu perfil está preenchido, não muda o score. A nota é uma compatibilidade, não a chance de ser aprovado nem uma avaliação da sua arte.
        </p>
      </div>
    </section>
  );
}
