import { canPublish, listPendingReasons, type ExtractedRequirement } from "@/shared/lib/requirement-review";

const ok: ExtractedRequirement = {
  id: "r1", kind: "language", label: "Dança", value: "danca", strength: "explicit_mandatory",
  role: "CORE", evidence: "Art. 2º: proponentes de dança.", confidence: 0.95, reviewed: false,
};

describe("revisão de requisitos extraídos", () => {
  it("requisito completo e confiável pode ser publicado", () => {
    expect(canPublish([ok])).toBe(true);
  });

  it("linguagem sem papel fica pendente: não se infere núcleo", () => {
    expect(listPendingReasons([{ ...ok, role: null }])[0]).toMatch(/núcleo ou suporte/);
  });

  it("obrigatório sem trecho do edital fica pendente, mas preferência sem trecho não", () => {
    expect(canPublish([{ ...ok, evidence: null }])).toBe(false);
    expect(canPublish([{ ...ok, strength: "preference", evidence: null }])).toBe(true);
  });

  it("baixa confiança pede revisão, e a revisão humana libera", () => {
    expect(canPublish([{ ...ok, confidence: 0.5 }])).toBe(false);
    expect(canPublish([{ ...ok, confidence: 0.5, reviewed: true }])).toBe(true);
  });

  it("sem nenhum requisito extraído não publica", () => {
    expect(canPublish([])).toBe(false);
  });

  it("um requisito pendente basta para travar a publicação", () => {
    expect(canPublish([ok, { ...ok, id: "r2", role: null }])).toBe(false);
  });
});
