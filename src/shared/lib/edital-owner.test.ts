import { filterEditaisByProposer, getEditalProposerHref, getEditalProposerId, isEditalClosed } from "@/shared/lib/edital-owner";

describe("getEditalProposerId", () => {
  it("aceita id numérico, objeto com id e ausência", () => {
    expect(getEditalProposerId({ proposer: 7 })).toBe(7);
    expect(getEditalProposerId({ proposer: { id: 9 } })).toBe(9);
    expect(getEditalProposerId({ proposer: null })).toBeNull();
    expect(getEditalProposerId({})).toBeNull();
  });
});

describe("filterEditaisByProposer", () => {
  const editais = [
    { id: 1, proposer: 101 },
    { id: 2, proposer: { id: 102 } },
    { id: 3, proposer: 101 },
    { id: 4, proposer: null },
  ];

  it("pega os do dono e os da lista do proponente, sem duplicar", () => {
    expect(filterEditaisByProposer(editais, 101).map((e) => e.id)).toEqual([1, 3]);
    expect(filterEditaisByProposer(editais, 101, [3, 4]).map((e) => e.id)).toEqual([1, 3, 4]);
  });

  it("proponente sem edital recebe lista vazia", () => {
    expect(filterEditaisByProposer(editais, 999)).toEqual([]);
  });
});

describe("isEditalClosed", () => {
  const now = new Date("2026-11-16T12:00:00Z");
  it("prazo passado encerra; futuro, ausente ou inválido não", () => {
    expect(isEditalClosed({ endDate: "2026-11-01T00:00:00Z" }, now)).toBe(true);
    expect(isEditalClosed({ endDate: "2026-12-30T00:00:00Z" }, now)).toBe(false);
    expect(isEditalClosed({ endDate: null }, now)).toBe(false);
    expect(isEditalClosed({ endDate: "lixo" }, now)).toBe(false);
  });
});

describe("getEditalProposerHref", () => {
  it("aponta para a página da empresa; sem dono, devolve vazio", () => {
    expect(getEditalProposerHref({ proposer: 101 })).toBe("/empresas/101");
    expect(getEditalProposerHref({ proposer: { id: 102 } })).toBe("/empresas/102");
    expect(getEditalProposerHref({ proposer: null })).toBe("");
  });
});
