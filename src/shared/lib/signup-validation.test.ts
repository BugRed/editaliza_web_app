import { checkSignup, type SignupCheckInput } from "@/shared/lib/signup-validation";

const valid: SignupCheckInput = {
  userType: "ARTIST",
  name: "Clara Mendes",
  email: "clara@exemplo.com",
  password: "Senha#Forte1",
  cpf: "",
  cnpj: "",
  coreLanguages: ["Pintura"],
  avatarDataUrl: "data:image/jpeg;base64,xx",
};

describe("checkSignup", () => {
  it("aceita um artista completo", () => {
    expect(checkSignup(valid)).toBeNull();
  });

  it("CPF é opcional, mas se vier tem que ser válido", () => {
    expect(checkSignup({ ...valid, cpf: "" })).toBeNull();
    expect(checkSignup({ ...valid, cpf: "111.111.111-11" })?.message).toBe("CPF inválido. Confira os números.");
  });

  it("artista sem linguagem principal é recusado", () => {
    expect(checkSignup({ ...valid, coreLanguages: [] })?.message).toMatch(/linguagem artística/);
  });

  it("artista sem foto é recusado, com a mensagem também no campo da foto", () => {
    const result = checkSignup({ ...valid, avatarDataUrl: "" });
    expect(result?.message).toBe("Falta a foto do perfil.");
    expect(result?.avatarMessage).toBeDefined();
  });

  it("propositor pode cadastrar sem logo, mas precisa de CNPJ com 14 dígitos", () => {
    const proposer: SignupCheckInput = { ...valid, userType: "PROPOSER", avatarDataUrl: "", coreLanguages: [], cnpj: "11.222.333/0001-81" };
    expect(checkSignup(proposer)).toBeNull();
    expect(checkSignup({ ...proposer, cnpj: "11.222" })?.message).toMatch(/14 dígitos/);
  });

  it("não deixa a foto faltante esconder um erro anterior", () => {
    expect(checkSignup({ ...valid, avatarDataUrl: "", email: "invalido" })?.message).toBe("Digite um e-mail válido.");
  });

  it("recusa senha fraca", () => {
    expect(checkSignup({ ...valid, password: "abc" })).not.toBeNull();
  });
});
