// Política de senha forte, a mesma no formulário (lista ao vivo) e no servidor (recusa). Pura.

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export interface PasswordRule {
  id: "length" | "lower" | "upper" | "digit" | "symbol";
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`, test: (p) => p.length >= PASSWORD_MIN_LENGTH && p.length <= PASSWORD_MAX_LENGTH },
  { id: "lower", label: "Uma letra minúscula", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "Uma letra maiúscula", test: (p) => /[A-Z]/.test(p) },
  { id: "digit", label: "Um número", test: (p) => /\d/.test(p) },
  // Símbolo = qualquer coisa que não seja letra, número nem espaço.
  { id: "symbol", label: "Um símbolo (por exemplo ! @ # $ %)", test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

/** Regras que a senha ainda não cumpre (vazio = senha forte). */
export function getPasswordIssues(password: string): PasswordRule[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}

export function isStrongPassword(password: string): boolean {
  return getPasswordIssues(password).length === 0;
}

export const PASSWORD_POLICY_MESSAGE = `A senha precisa ter ${PASSWORD_MIN_LENGTH} caracteres ou mais, com letra maiúscula, minúscula, número e símbolo.`;
