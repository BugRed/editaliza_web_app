export type SignupInput = { email: string; password: string; acceptedTerms: boolean };

export type SignupErrors = Partial<Record<keyof SignupInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateSignup(input: SignupInput): SignupErrors {
  const errors: SignupErrors = {};
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "Digite um e-mail válido.";
  }
  if (input.password.length < MIN_PASSWORD_LENGTH || !/\d/.test(input.password)) {
    errors.password = `A senha precisa de ${MIN_PASSWORD_LENGTH} caracteres ou mais e ao menos 1 número.`;
  }
  if (!input.acceptedTerms) {
    errors.acceptedTerms = "Para criar a conta, aceite o tratamento dos seus dados.";
  }
  return errors;
}
