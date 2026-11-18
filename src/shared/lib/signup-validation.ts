import { isValidCpf, onlyDigits } from "@/shared/lib/documents";
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from "@/shared/lib/password-policy";

export type SignupUserType = "ARTIST" | "PROPOSER";

export interface SignupCheckInput {
  userType: SignupUserType;
  name: string;
  email: string;
  password: string;
  cpf: string;
  cnpj: string;
  coreLanguages: string[];
  avatarDataUrl: string;
}

export interface SignupCheckResult {
  message: string;
  /** Quando o problema é a foto, o seletor de foto mostra o erro junto ao campo. */
  avatarMessage?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CNPJ_DIGITS = 14;

function checkRoleFields(input: SignupCheckInput): string | null {
  if (input.userType === "PROPOSER") {
    return input.cnpj.replace(/\D/g, "").length === CNPJ_DIGITS
      ? null
      : "Informe um CNPJ válido com 14 dígitos.";
  }
  if (onlyDigits(input.cpf) && !isValidCpf(input.cpf)) return "CPF inválido. Confira os números.";
  if (input.coreLanguages.length === 0) return "Selecione pelo menos uma linguagem artística principal.";
  return null;
}

/** Devolve o primeiro problema do cadastro, na ordem em que a tela mostra os campos, ou null se estiver tudo certo. */
export function checkSignup(input: SignupCheckInput): SignupCheckResult | null {
  if (input.name.trim().length < 2) {
    return {
      message:
        input.userType === "ARTIST"
          ? "Informe seu nome completo."
          : "Informe o nome da instituição ou organização propositora.",
    };
  }
  if (!EMAIL_PATTERN.test(input.email.trim())) return { message: "Digite um e-mail válido." };
  if (!isStrongPassword(input.password)) return { message: PASSWORD_POLICY_MESSAGE };

  const roleProblem = checkRoleFields(input);
  if (roleProblem) return { message: roleProblem };

  // Foto só é obrigatória para artista; a empresa pode cadastrar sem logo e mandar depois.
  if (input.userType === "ARTIST" && !input.avatarDataUrl) {
    return { message: "Falta a foto do perfil.", avatarMessage: "Escolha uma foto sua para continuar." };
  }
  return null;
}
