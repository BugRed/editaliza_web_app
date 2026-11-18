import { getPlainEditalSummary } from "@/app/lib/user-profiles";
import type { IEdital, PlainEditalSummaryData } from "@/app/types/Edital";
import type { TagData } from "@/app/types/TagData";

export interface ResolvedSummary {
  summary: PlainEditalSummaryData;
  /** Verdadeiro quando o edital não traz resumo próprio e o texto vem do gerador fixo (a IA entra na O3). */
  provisional: boolean;
}

function parsePlainSummary(raw: IEdital["plainSummary"] | string): PlainEditalSummaryData | null {
  if (!raw) return null;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw) as PlainEditalSummaryData;
  } catch {
    return null;
  }
}

export function resolveEditalSummary(edital: IEdital): ResolvedSummary {
  const own = parsePlainSummary(edital.plainSummary);
  if (own && own.whatIsIt) return { summary: own, provisional: false };
  return { summary: getPlainEditalSummary(edital.id, edital.title, edital.description), provisional: true };
}

export function collectEditalTags(edital: IEdital, summary: PlainEditalSummaryData): string[] {
  const rawTags: TagData[] = Array.isArray(edital.listTags)
    ? edital.listTags
    : (parseTagList(edital.listTags as unknown) ?? []);
  const extra = Array.isArray(summary.extraTags) ? summary.extraTags : [];
  return Array.from(new Set([...rawTags.map((tag) => tag.name).filter(Boolean), ...extra]));
}

function parseTagList(value: unknown): TagData[] | null {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value) as TagData[];
  } catch {
    return null;
  }
}

export function resolveExternalUrl(edital: IEdital): string {
  return edital.inscriptionLink?.trim() || edital.completeEditalLink?.trim() || "#";
}

export type RequirementStrength = "obrigatorio" | "aceito" | "preferencia";

export interface RequirementRow {
  label: string;
  value: string;
  strength: RequirementStrength;
}

const SCOPE_LABELS: Record<string, string> = {
  MUNICIPAL: "Municipal",
  METROPOLITANO: "Metropolitano",
  ESTADUAL: "Estadual",
  NACIONAL: "Nacional",
};

/** Requisitos que o edital já traz estruturados, para a página de detalhe listar sem inventar nada. */
export function buildRequirementRows(edital: IEdital): RequirementRow[] {
  const rows: RequirementRow[] = [];
  if (edital.territoryScope) {
    const place = [edital.city, edital.state].filter(Boolean).join(", ");
    const scope = SCOPE_LABELS[edital.territoryScope] ?? edital.territoryScope;
    rows.push({ label: "Abrangência", value: place ? `${scope} · ${place}` : scope, strength: "obrigatorio" });
  }
  if (edital.requiredLanguages?.length) {
    rows.push({ label: "Linguagens obrigatórias", value: edital.requiredLanguages.join(", "), strength: "obrigatorio" });
  }
  const optional = (edital.acceptedLanguages ?? []).filter((lang) => !edital.requiredLanguages?.includes(lang));
  if (optional.length) rows.push({ label: "Linguagens aceitas", value: optional.join(", "), strength: "aceito" });
  if (edital.requiresPortfolio) rows.push({ label: "Portfólio", value: "Exigido", strength: "obrigatorio" });
  if (edital.requiresCnpj) rows.push({ label: "CNPJ ou MEI", value: "Exigido", strength: "obrigatorio" });
  if (edital.requiresTechnicalFormation) rows.push({ label: "Formação técnica", value: "Exigida", strength: "obrigatorio" });
  if (edital.minExperienceYears) {
    rows.push({ label: "Experiência mínima", value: `${edital.minExperienceYears} anos`, strength: "obrigatorio" });
  }
  if (edital.targetProfileLevels?.length) {
    rows.push({ label: "Momentos de carreira", value: edital.targetProfileLevels.join(", "), strength: "preferencia" });
  }
  return rows;
}
