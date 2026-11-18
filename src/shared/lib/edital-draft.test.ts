import { buildEditalPayload, checkEditalDraft, type EditalDraft } from "@/shared/lib/edital-draft";

const draft: EditalDraft = {
  title: "  Chamada de Artes  ",
  description: "Apoio a projetos de artes visuais.",
  whatIsIt: "",
  whoCanApplyText: "Artistas locais\n\n  Com portfólio  ",
  benefitsText: "Cachê",
  territoryScope: "ESTADUAL",
  city: " ",
  stateUf: "PE",
  requiredLanguages: ["Pintura"],
  acceptedLanguages: [],
  requiresPortfolio: true,
  requiresCnpj: false,
  requiresTechnicalFormation: false,
  minExperienceYears: -2,
  targetProfileLevels: [],
  endDate: "",
  inscriptionLink: " ",
  imgCoverUrl: "/c.jpg",
};

describe("checkEditalDraft", () => {
  it("aceita um rascunho completo e recusa título curto, descrição curta e edital sem linguagem", () => {
    expect(checkEditalDraft(draft)).toBeNull();
    expect(checkEditalDraft({ ...draft, title: "ab" })).toMatch(/título/);
    expect(checkEditalDraft({ ...draft, description: "curta" })).toMatch(/descrição/);
    expect(checkEditalDraft({ ...draft, requiredLanguages: [] })).toMatch(/linguagem/);
  });
});

describe("buildEditalPayload", () => {
  const payload = buildEditalPayload(draft);

  it("limpa os textos, divide as linhas e descarta as vazias", () => {
    expect(payload.title).toBe("Chamada de Artes");
    expect(payload.plainSummary.whoCanApply).toEqual(["Artistas locais", "Com portfólio"]);
    expect(payload.city).toBeNull();
  });

  it("sem linguagem aceita, as obrigatórias valem como aceitas", () => {
    expect(payload.acceptedLanguages).toEqual(["Pintura"]);
  });

  it("sem momento de carreira escolhido, contempla todos; anos negativos viram zero", () => {
    expect(payload.targetProfileLevels).toEqual(["INICIANTE", "EMERGENTE", "CONSOLIDADO"]);
    expect(payload.minExperienceYears).toBe(0);
  });

  it("sem resumo próprio, o 'o que é' repete a descrição; sem prazo, endDate é nulo", () => {
    expect(payload.plainSummary.whatIsIt).toBe("Apoio a projetos de artes visuais.");
    expect(payload.endDate).toBeNull();
  });

  it("prazo informado vira o fim do dia em UTC", () => {
    expect(buildEditalPayload({ ...draft, endDate: "2026-12-30" }).endDate).toBe("2026-12-30T23:59:59.000Z");
  });
});
