import { buildDataExport, exportFileName, isDeleteConfirmed } from "@/shared/lib/privacy";

const at = new Date("2026-11-17T12:00:00Z");

describe("isDeleteConfirmed", () => {
  it("aceita a palavra sem diferenciar maiúsculas nem espaços nas pontas", () => {
    expect(isDeleteConfirmed("excluir")).toBe(true);
    expect(isDeleteConfirmed("  EXCLUIR ")).toBe(true);
  });

  it("recusa vazio, parte da palavra e outra palavra", () => {
    expect(isDeleteConfirmed("")).toBe(false);
    expect(isDeleteConfirmed("EXCLU")).toBe(false);
    expect(isDeleteConfirmed("apagar")).toBe(false);
  });
});

describe("exportação de dados", () => {
  it("devolve JSON válido com o perfil e a data de geração", () => {
    const parsed = JSON.parse(buildDataExport({ name: "Ana", city: "Recife" }, at));
    expect(parsed).toEqual({ generatedAt: "2026-11-17T12:00:00.000Z", profile: { name: "Ana", city: "Recife" } });
  });

  it("o nome do arquivo leva a data", () => {
    expect(exportFileName(at)).toBe("editaliza-meus-dados-2026-11-17.json");
  });
});
