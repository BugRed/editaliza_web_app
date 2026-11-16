import { Badge } from "@/shared/components/atoms/Badge";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import type { FactorLevel, MatchFactor } from "@/shared/lib/profile-view";

const LEVEL_LABEL: Record<FactorLevel, string> = {
  alto: "Alta aderência",
  medio: "Aderência média",
  baixo: "Baixa aderência",
  desconhecido: "Sem informação",
};

const LEVEL_TONE: Record<FactorLevel, "primary" | "accent" | "danger" | "neutral"> = {
  alto: "primary",
  medio: "accent",
  baixo: "danger",
  desconhecido: "neutral",
};

type MatchExplanationProps = { editalTitle: string; factors: MatchFactor[] };

// Fator sem dado nunca vira nota boa: aparece como "sem informação" e como pedido de preenchimento.
export function MatchExplanation({ editalTitle, factors }: MatchExplanationProps) {
  const missing = factors.filter((factor) => factor.level === "desconhecido");

  return (
    <>
      <PageHeader title="Por que este edital?" description={editalTitle} />
      <ul className="flex flex-col gap-3" aria-label="Fatores">
        {factors.map((factor) => (
          <li key={factor.label} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface p-4 shadow-card">
            <div>
              <p className="font-medium text-ink">{factor.label}</p>
              <p className="text-sm text-ink-muted">{factor.note}</p>
            </div>
            <Badge tone={LEVEL_TONE[factor.level]}>{LEVEL_LABEL[factor.level]}</Badge>
          </li>
        ))}
      </ul>
      {missing.length > 0 && (
        <section aria-label="O que falta informar" className="rounded-lg bg-accent-soft p-4">
          <h2 className="font-semibold text-ink">O que falta informar</h2>
          <ul className="mt-1 list-disc pl-5 text-ink">
            {missing.map((factor) => (
              <li key={factor.label}>{factor.label}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
