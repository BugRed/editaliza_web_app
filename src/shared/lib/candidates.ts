export type CandidateEligibility = "PASS" | "UNKNOWN";

export interface Candidate {
  id: number;
  name: string;
  handle: string;
  avatarUrl: string;
  languages: string[];
  city: string;
  eligibility: CandidateEligibility;
  /** Só quem aceitou compartilhar o perfil com organizações aparece para elas. */
  sharesProfile: boolean;
}

export interface CandidateSplit {
  visible: Candidate[];
  /** Elegíveis que não compartilharam: a organização sabe quantos são, nunca quem. */
  hiddenCount: number;
}

/** Elegibilidade confirmada antes da pendente; dentro de cada grupo, ordem alfabética. Nenhuma nota entra aqui. */
export function splitCandidates(candidates: Candidate[]): CandidateSplit {
  const visible = candidates
    .filter((candidate) => candidate.sharesProfile)
    .sort((a, b) => {
      if (a.eligibility !== b.eligibility) return a.eligibility === "PASS" ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  return { visible, hiddenCount: candidates.length - visible.length };
}
