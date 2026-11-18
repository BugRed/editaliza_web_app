import { buildRequirementRows, collectEditalTags, resolveEditalSummary, resolveExternalUrl } from "@/app/lib/edital-detail";
import type { IEdital } from "@/app/types/Edital";

const base = { id: 9999, title: "Chamada", description: "Descrição longa o bastante.", listTags: [] } as unknown as IEdital;

describe("resolveEditalSummary", () => {
  it("usa o resumo próprio do edital e não o marca como provisório", () => {
    const own = { whatIsIt: "Próprio", whoCanApply: [], benefits: [], extraTags: [] };
    expect(resolveEditalSummary({ ...base, plainSummary: own })).toEqual({ summary: own, provisional: false });
  });

  it("aceita o resumo guardado como texto JSON", () => {
    const text = JSON.stringify({ whatIsIt: "Do banco", whoCanApply: [], benefits: [], extraTags: [] });
    expect(resolveEditalSummary({ ...base, plainSummary: text as never }).summary.whatIsIt).toBe("Do banco");
  });

  it("sem resumo ou com JSON quebrado, cai no gerador e marca como provisório", () => {
    expect(resolveEditalSummary(base).provisional).toBe(true);
    expect(resolveEditalSummary({ ...base, plainSummary: "{quebrado" as never }).provisional).toBe(true);
  });
});

describe("collectEditalTags", () => {
  it("junta as tags do edital e as do resumo sem repetir", () => {
    const edital = { ...base, listTags: [{ name: "Pintura" }, { name: "Bolsa" }] } as unknown as IEdital;
    const summary = { whatIsIt: "x", whoCanApply: [], benefits: [], extraTags: ["Bolsa", "Nacional"] };
    expect(collectEditalTags(edital, summary)).toEqual(["Pintura", "Bolsa", "Nacional"]);
  });
});

describe("resolveExternalUrl", () => {
  it("prefere o link de inscrição, depois o edital completo, e por fim #", () => {
    expect(resolveExternalUrl({ ...base, inscriptionLink: " https://a ", completeEditalLink: "https://b" })).toBe("https://a");
    expect(resolveExternalUrl({ ...base, completeEditalLink: "https://b" })).toBe("https://b");
    expect(resolveExternalUrl(base)).toBe("#");
  });
});

describe("buildRequirementRows", () => {
  it("lista só o que o edital traz e separa obrigatório de aceito", () => {
    const rows = buildRequirementRows({
      ...base,
      territoryScope: "MUNICIPAL",
      city: "Recife",
      state: "PE",
      requiredLanguages: ["Pintura"],
      acceptedLanguages: ["Pintura", "Artes Visuais"],
      requiresCnpj: true,
      minExperienceYears: 2,
    });
    expect(rows.map((r) => r.label)).toEqual(["Abrangência", "Linguagens obrigatórias", "Linguagens aceitas", "CNPJ ou MEI", "Experiência mínima"]);
    expect(rows.find((r) => r.label === "Linguagens aceitas")).toMatchObject({ value: "Artes Visuais", strength: "aceito" });
    expect(rows[0].value).toBe("Municipal · Recife, PE");
  });

  it("edital sem nenhum requisito estruturado devolve lista vazia", () => {
    expect(buildRequirementRows(base)).toEqual([]);
  });
});
