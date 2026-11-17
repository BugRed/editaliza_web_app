export const EXPERIENCE_CATEGORIES = [
  "Formação",
  "Experiência profissional",
  "Exposição",
  "Pesquisa e criação",
  "Residência",
  "Reconhecimento",
  "Circulação",
  "Produção e mediação",
  "Publicação",
  "Docência e formação",
] as const;

export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];
export type EvidenceStatus = "declared" | "partial" | "verified";

export const EVIDENCE_LABELS: Record<EvidenceStatus, string> = {
  declared: "Declarado",
  partial: "Parcialmente comprovado",
  verified: "Verificado",
};

export interface TrajectoryEntry {
  id: string;
  category: ExperienceCategory;
  title: string;
  institution: string;
  role: string;
  /** AAAA-MM-DD */
  startDate: string;
  /** Vazio quando a experiência segue em andamento. */
  endDate: string;
  evidenceStatus: EvidenceStatus;
}

export type TrajectoryDraft = Omit<TrajectoryEntry, "id">;

const MIN_TITLE_LENGTH = 2;

/** Primeiro problema do rascunho, ou null. Estágio e início de carreira nunca são recusados por isso. */
export function checkTrajectoryDraft(draft: TrajectoryDraft): string | null {
  if (draft.title.trim().length < MIN_TITLE_LENGTH) return "Informe o título da experiência.";
  if (!draft.startDate) return "Informe quando começou.";
  if (draft.endDate && draft.endDate < draft.startDate) return "O término não pode ser antes do início.";
  return null;
}

/** Meses entre início e término (ou hoje, se em andamento), no mínimo 1. */
export function durationMonths(entry: Pick<TrajectoryEntry, "startDate" | "endDate">, now: Date): number {
  const start = new Date(entry.startDate);
  const end = entry.endDate ? new Date(entry.endDate) : now;
  // UTC nos dois lados: "AAAA-MM-DD" é lido como meia-noite UTC e, em fuso negativo, cairia no mês anterior.
  const months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
  return Math.max(1, months);
}

export interface TrajectorySummary {
  count: number;
  verified: number;
  totalMonths: number;
  categories: ExperienceCategory[];
}

export function summarizeTrajectory(entries: TrajectoryEntry[], now: Date): TrajectorySummary {
  return {
    count: entries.length,
    verified: entries.filter((entry) => entry.evidenceStatus === "verified").length,
    totalMonths: entries.reduce((sum, entry) => sum + durationMonths(entry, now), 0),
    categories: Array.from(new Set(entries.map((entry) => entry.category))),
  };
}

/** Do mais recente para o mais antigo; em andamento primeiro. */
export function sortTrajectory(entries: TrajectoryEntry[]): TrajectoryEntry[] {
  return [...entries].sort((a, b) => b.startDate.localeCompare(a.startDate));
}
