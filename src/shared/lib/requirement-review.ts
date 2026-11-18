export type ReviewRole = "CORE" | "SUPPORT" | null;
export type ReviewStrength = "explicit_mandatory" | "preference";
export type RequirementKind = "language" | "territory" | "technique" | "concept" | "document";

export interface ExtractedRequirement {
  id: string;
  kind: RequirementKind;
  label: string;
  value: string;
  strength: ReviewStrength;
  /** Só linguagens têm papel (spec ArtistRank §9.3.2). */
  role: ReviewRole;
  /** Trecho literal do edital que sustenta o requisito. */
  evidence: string | null;
  confidence: number;
  /** Verdadeiro quando uma pessoa conferiu o requisito. */
  reviewed: boolean;
}

export const LOW_CONFIDENCE = 0.7;

/** Motivos pelos quais o requisito ainda não pode ir ao ar sem revisão humana; vazio quando está resolvido. */
export function pendingReasons(req: ExtractedRequirement): string[] {
  const reasons: string[] = [];
  if (req.kind === "language" && req.role === null) reasons.push("Falta definir se a linguagem é núcleo ou suporte.");
  if (req.strength === "explicit_mandatory" && !req.evidence) reasons.push("Requisito obrigatório sem trecho do edital que o sustente.");
  if (req.confidence < LOW_CONFIDENCE && !req.reviewed) reasons.push("Extração com baixa confiança: confira com o documento.");
  return reasons;
}

export function listPendingReasons(requirements: ExtractedRequirement[]): string[] {
  return requirements.flatMap((req) => pendingReasons(req).map((reason) => `${req.label}: ${reason}`));
}

export function canPublish(requirements: ExtractedRequirement[]): boolean {
  return requirements.length > 0 && listPendingReasons(requirements).length === 0;
}
