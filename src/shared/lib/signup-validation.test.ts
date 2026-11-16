import { validateSignup } from "@/shared/lib/signup-validation";

const valid = { email: "ana@exemplo.com", password: "senha1234", acceptedTerms: true };

describe("validateSignup", () => {
  it("aceita dados válidos", () => {
    expect(validateSignup(valid)).toEqual({});
  });

  it.each([
    ["sem arroba", "ana.exemplo.com"],
    ["sem domínio", "ana@"],
    ["com espaço", "ana @x.com"],
  ])("rejeita e-mail %s", (_, email) => {
    expect(validateSignup({ ...valid, email })).toHaveProperty("email");
  });

  it("senha de 7 caracteres é curta; de 8 passa (limite)", () => {
    expect(validateSignup({ ...valid, password: "abcdef1" })).toHaveProperty("password");
    expect(validateSignup({ ...valid, password: "abcdefg1" })).toEqual({});
  });

  it("senha sem número é rejeitada", () => {
    expect(validateSignup({ ...valid, password: "somenteletras" })).toHaveProperty("password");
  });

  it("sem consentimento não cria conta", () => {
    expect(validateSignup({ ...valid, acceptedTerms: false })).toHaveProperty("acceptedTerms");
  });
});
