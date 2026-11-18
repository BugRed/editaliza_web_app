export const DELETE_CONFIRMATION_WORD = "EXCLUIR";

export type PortfolioVisibility = "PUBLIC" | "ORGANIZATIONS" | "PRIVATE";

export const VISIBILITY_OPTIONS: { value: PortfolioVisibility; label: string; hint: string }[] = [
  { value: "PUBLIC", label: "Público", hint: "Qualquer pessoa logada vê seu perfil e suas obras." },
  { value: "ORGANIZATIONS", label: "Só organizações", hint: "Apenas quem publica editais vê seu portfólio, e só dos editais em que você se inscreve." },
  { value: "PRIVATE", label: "Privado", hint: "Só você vê. O perfil continua alimentando suas recomendações." },
];

/** A exclusão exige digitar a palavra, sem diferenciar maiúsculas nem espaços nas pontas. */
export function isDeleteConfirmed(typed: string): boolean {
  return typed.trim().toUpperCase() === DELETE_CONFIRMATION_WORD;
}

/** Cópia legível por máquina dos dados do perfil (LGPD, art. 18), com a data em que foi gerada. */
export function buildDataExport(profile: object, generatedAt: Date): string {
  return JSON.stringify({ generatedAt: generatedAt.toISOString(), profile }, null, 2);
}

export function exportFileName(generatedAt: Date): string {
  return `editaliza-meus-dados-${generatedAt.toISOString().slice(0, 10)}.json`;
}
