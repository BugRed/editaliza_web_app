import type { RankFactor, RankFactorGroup } from "@/shared/lib/artistrank";

export type ScoreBand = "pouco" | "medio" | "alto";

// Faixas de cor das barras: até 40 pouco (vermelho), até 70 médio (amarelo), acima disso alto (verde).
// São independentes dos cortes do rótulo de aderência do motor (50 e 68): a barra descreve cada nota,
// o rótulo descreve o score final.
export const BAND_LIMITS = { pouco: 40, medio: 70 } as const;

export const BAND_LABELS: Record<ScoreBand, string> = { pouco: "Pouco", medio: "Médio", alto: "Alto" };

export function getScoreBand(score: number): ScoreBand {
  if (score <= BAND_LIMITS.pouco) return "pouco";
  if (score <= BAND_LIMITS.medio) return "medio";
  return "alto";
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export const GROUP_TITLES: Record<RankFactorGroup, string> = {
  ARTISTA: "Perfil do artista",
  PORTFOLIO: "Portfólio e obras",
};

/** Peso do grupo no score combinado (0,35 · artista + 0,65 · portfólio). */
export const GROUP_SHARE: Record<RankFactorGroup, number> = { ARTISTA: 35, PORTFOLIO: 65 };

export function splitFactorsByGroup(factors: readonly RankFactor[]): Record<RankFactorGroup, RankFactor[]> {
  return {
    ARTISTA: factors.filter((factor) => factor.grupo === "ARTISTA"),
    PORTFOLIO: factors.filter((factor) => factor.grupo === "PORTFOLIO"),
  };
}

/** Fatores que o motor não conseguiu avaliar: viram pedido de preenchimento, não nota. */
export function getMissingFactors(factors: readonly RankFactor[]): RankFactor[] {
  return factors.filter((factor) => factor.nota === null);
}
