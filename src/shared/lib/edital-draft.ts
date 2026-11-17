import type { ProfileLevel, TerritoryScope } from "@/shared/lib/artistrank";

export const ALL_PROFILE_LEVELS: ProfileLevel[] = ["INICIANTE", "EMERGENTE", "CONSOLIDADO"];
const DEFAULT_LINK = "https://link.com/inscricao";
const DEFAULT_PDF_LINK = "https://link.com/edital.pdf";
const MIN_TITLE_LENGTH = 3;
const MIN_DESCRIPTION_LENGTH = 10;

export interface EditalDraft {
  title: string;
  description: string;
  whatIsIt: string;
  whoCanApplyText: string;
  benefitsText: string;
  territoryScope: TerritoryScope;
  city: string;
  stateUf: string;
  requiredLanguages: string[];
  acceptedLanguages: string[];
  requiresPortfolio: boolean;
  requiresCnpj: boolean;
  requiresTechnicalFormation: boolean;
  minExperienceYears: number;
  targetProfileLevels: ProfileLevel[];
  endDate: string;
  inscriptionLink: string;
  imgCoverUrl: string;
}

/** Devolve o primeiro problema do rascunho, ou null se ele pode ser publicado. */
export function checkEditalDraft(draft: EditalDraft): string | null {
  if (draft.title.trim().length < MIN_TITLE_LENGTH) return "Informe o título do edital.";
  if (draft.description.trim().length < MIN_DESCRIPTION_LENGTH) {
    return "Escreva uma descrição de pelo menos 10 caracteres.";
  }
  if (draft.acceptedLanguages.length === 0 && draft.requiredLanguages.length === 0) {
    return "Selecione pelo menos uma linguagem artística para o edital.";
  }
  return null;
}

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildEditalPayload(draft: EditalDraft) {
  const link = draft.inscriptionLink.trim();
  const description = draft.description.trim();
  return {
    title: draft.title.trim(),
    description,
    endDate: draft.endDate ? new Date(`${draft.endDate}T23:59:59Z`).toISOString() : null,
    inscriptionLink: link || DEFAULT_LINK,
    completeEditalLink: link || DEFAULT_PDF_LINK,
    imgCoverUrl: draft.imgCoverUrl,
    territoryScope: draft.territoryScope,
    city: draft.city.trim() || null,
    state: draft.stateUf.trim() || null,
    requiredLanguages: draft.requiredLanguages,
    // Sem linguagem aceita explícita, as obrigatórias passam a valer como aceitas.
    acceptedLanguages: draft.acceptedLanguages.length > 0 ? draft.acceptedLanguages : draft.requiredLanguages,
    requiresPortfolio: draft.requiresPortfolio,
    requiresCnpj: draft.requiresCnpj,
    requiresTechnicalFormation: draft.requiresTechnicalFormation,
    minExperienceYears: Math.max(0, Number(draft.minExperienceYears) || 0),
    targetProfileLevels: draft.targetProfileLevels.length > 0 ? draft.targetProfileLevels : ALL_PROFILE_LEVELS,
    plainSummary: {
      whatIsIt: draft.whatIsIt.trim() || description,
      whoCanApply: splitLines(draft.whoCanApplyText),
      benefits: splitLines(draft.benefitsText),
      extraTags: Array.from(new Set([...draft.requiredLanguages, ...draft.acceptedLanguages])),
    },
  };
}
