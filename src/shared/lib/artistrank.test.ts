import { evaluateArtistRank } from "@/shared/lib/artistrank";

const artist = {
  id: 1, city: "Recife", state: "PE", coreLanguages: ["Pintura"], supportLanguages: [], experienceYears: 5,
  profileLevel: "EMERGENTE", worksCount: 2, workCategories: ["Pintura"], badgeCategories: [], portfolioCompleteness: 70,
};
const edital = { id: 1, title: "E", requiredLanguages: ["Pintura"], acceptedLanguages: [] };

describe("fatores do ranking", () => {
  it("devolve os sete fatores, em dois grupos, com pesos que somam 1 por grupo", () => {
    const { fatores } = evaluateArtistRank(artist, edital);
    expect(fatores).toHaveLength(7);
    for (const grupo of ["ARTISTA", "PORTFOLIO"] as const) {
      const soma = fatores.filter((f) => f.grupo === grupo).reduce((acc, f) => acc + f.peso, 0);
      expect(soma).toBeCloseTo(1, 5);
    }
  });

  it("dado ausente vira nota null (desconhecido), nunca zero", () => {
    const { fatores } = evaluateArtistRank({ ...artist, experienceYears: null, worksCount: 0, portfolioCompleteness: null }, edital);
    const byId = Object.fromEntries(fatores.map((f) => [f.id, f.nota]));
    expect(byId.experiencia).toBeNull();
    expect(byId.obras).toBeNull();
    expect(byId.completude).toBeNull();
    expect(byId.linguagem).not.toBeNull();
  });

  it("notas observadas ficam entre 0 e 100", () => {
    const { fatores } = evaluateArtistRank(artist, edital);
    for (const f of fatores) if (f.nota !== null) expect(f.nota >= 0 && f.nota <= 100).toBe(true);
  });
});
