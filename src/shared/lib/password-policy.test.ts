import { getPasswordIssues, isStrongPassword, PASSWORD_MAX_LENGTH, PASSWORD_RULES } from "@/shared/lib/password-policy";

describe("política de senha forte", () => {
  it.each(["Abcdef1!", "Senha@Forte9", "x9#Yzzzzzzzz", "Pássaro#2026"])("aceita %j", (password) => {
    expect(isStrongPassword(password)).toBe(true);
  });

  it.each([
    ["abcdefg1!", "upper"],
    ["ABCDEFG1!", "lower"],
    ["Abcdefgh!", "digit"],
    ["Abcdefg12", "symbol"],
    ["Ab1!", "length"],
  ])("recusa %j por faltar a regra %s", (password, missing) => {
    expect(getPasswordIssues(password).map((rule) => rule.id)).toContain(missing);
  });

  it("espaço não conta como símbolo", () => {
    expect(isStrongPassword("Abcdefg1 ")).toBe(false);
  });

  it("senha vazia não cumpre nenhuma regra", () => {
    expect(getPasswordIssues("")).toHaveLength(PASSWORD_RULES.length);
  });

  it("limita o tamanho máximo (evita senha gigante no hash)", () => {
    expect(isStrongPassword("Aa1!" + "x".repeat(PASSWORD_MAX_LENGTH))).toBe(false);
    expect(isStrongPassword("Aa1!" + "x".repeat(PASSWORD_MAX_LENGTH - 4))).toBe(true);
  });

  it("as regras antigas do protótipo (6 caracteres e 1 número) não bastam", () => {
    expect(isStrongPassword("senha1")).toBe(false);
  });
});
