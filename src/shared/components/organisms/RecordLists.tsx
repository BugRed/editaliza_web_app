import { Badge } from "@/shared/components/atoms/Badge";
import { EmptyState } from "@/shared/components/molecules/EmptyState";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import type { Experience, ProofState, Work } from "@/shared/lib/profile-view";

const PROOF_LABEL: Record<ProofState, string> = {
  comprovada: "Comprovada",
  declarada: "Declarada",
  "sem-comprovacao": "Sem comprovação",
};

export function TrajectoryView({ experiences }: { experiences: Experience[] }) {
  return (
    <>
      <PageHeader title="Trajetória" description="Exposições, residências, prêmios e estágios." />
      {experiences.length === 0 ? (
        <EmptyState title="Nenhuma experiência registrada" description="Adicione o que você já fez, mesmo sem comprovante." />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Experiências">
          {experiences.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface p-4 shadow-card">
              <div>
                <p className="font-medium text-ink">{item.title}</p>
                <p className="text-sm text-ink-muted">
                  {item.category} · {item.year}
                </p>
              </div>
              <Badge tone={item.proof === "comprovada" ? "primary" : "neutral"}>{PROOF_LABEL[item.proof]}</Badge>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function WorksView({ works }: { works: Work[] }) {
  return (
    <>
      <PageHeader title="Obras" description="Cada obra conta separadamente para os editais." />
      {works.length === 0 ? (
        <EmptyState title="Nenhuma obra cadastrada" description="Cadastre ao menos uma obra para aparecer em editais de portfólio." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2" aria-label="Obras">
          {works.map((work) => (
            <li key={work.id} className="rounded-lg bg-surface p-4 shadow-card">
              <p className="font-medium text-ink">{work.title}</p>
              <p className="text-sm text-ink-muted">
                {work.technique} · {work.support} · {work.year}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
