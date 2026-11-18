export const REJECTION_REASONS = [
  { value: "LANGUAGE", label: "Não é a minha linguagem" },
  { value: "VALUE", label: "O valor não compensa" },
  { value: "REQUIREMENT", label: "Exige algo que não tenho (CNPJ, formação…)" },
  { value: "DEADLINE", label: "O prazo é curto demais" },
  { value: "DONE", label: "Já participei" },
  { value: "OTHER", label: "Outro motivo" },
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number]["value"];

export interface RejectionInput {
  reason: RejectionReason | "";
  otherText: string;
}

/** Rejeitar pede o motivo (spec §20); "outro motivo" pede também uma frase. */
export function checkRejection(input: RejectionInput): string | null {
  if (!input.reason) return "Escolha o motivo.";
  if (input.reason === "OTHER" && input.otherText.trim().length < 3) return "Conte em poucas palavras o motivo.";
  return null;
}

export function rejectionLabel(reason: RejectionReason): string {
  return REJECTION_REASONS.find((item) => item.value === reason)?.label ?? reason;
}
