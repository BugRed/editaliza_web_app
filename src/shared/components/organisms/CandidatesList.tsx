import { Avatar } from "@/shared/components/atoms/Avatar";
import { Badge } from "@/shared/components/atoms/Badge";
import { EmptyState } from "@/shared/components/molecules/EmptyState";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import type { Candidate, EligibilityState } from "@/shared/lib/profile-view";

const ELIGIBILITY_LABEL: Record<EligibilityState, string> = {
  elegivel: "Elegível",
  inelegivel: "Não elegível",
  desconhecido: "A confirmar",
};

const ELIGIBILITY_TONE: Record<EligibilityState, "primary" | "danger" | "neutral"> = {
  elegivel: "primary",
  inelegivel: "danger",
  desconhecido: "neutral",
};

// Só quem se candidatou aparece aqui: a organização não vê o resto da base.
export function CandidatesList({ editalTitle, candidates }: { editalTitle: string; candidates: Candidate[] }) {
  return (
    <>
      <PageHeader title="Candidatos" description={editalTitle} />
      {candidates.length === 0 ? (
        <EmptyState title="Ainda não há candidaturas" description="Quando um artista se candidatar, ele aparece aqui." />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Candidatos">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <Avatar name={candidate.name} />
                <div>
                  <p className="font-medium text-ink">{candidate.name}</p>
                  <p className="text-sm text-ink-muted">
                    {candidate.city} · {candidate.languages.join(", ")}
                  </p>
                </div>
              </div>
              <Badge tone={ELIGIBILITY_TONE[candidate.eligibility]}>{ELIGIBILITY_LABEL[candidate.eligibility]}</Badge>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
