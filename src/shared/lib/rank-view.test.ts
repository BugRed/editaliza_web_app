import type { RankFactor } from "@/shared/lib/artistrank";
import { clampPercent, getMissingFactors, getScoreBand, splitFactorsByGroup } from "@/shared/lib/rank-view";

const factors: RankFactor[] = [
  { id: "a", grupo: "ARTISTA", label: "A", peso: 0.5, nota: 80 },
  { id: "b", grupo: "ARTISTA", label: "B", peso: 0.5, nota: null },
  { id: "c", grupo: "PORTFOLIO", label: "C", peso: 1, nota: 40 },
];

describe("getScoreBand", () => {
  it("até 40 é pouco, até 70 é médio, acima é alto (limites inclusivos)", () => {
    expect(getScoreBand(0)).toBe("pouco");
    expect(getScoreBand(40)).toBe("pouco");
    expect(getScoreBand(40.01)).toBe("medio");
    expect(getScoreBand(70)).toBe("medio");
    expect(getScoreBand(70.01)).toBe("alto");
    expect(getScoreBand(100)).toBe("alto");
  });
});

describe("clampPercent", () => {
  it("limita a 0–100 e trata valor inválido como 0", () => {
    expect(clampPercent(120)).toBe(100);
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(NaN)).toBe(0);
    expect(clampPercent(42.5)).toBe(42.5);
  });
});

describe("fatores", () => {
  it("separa por grupo e lista os sem informação", () => {
    const groups = splitFactorsByGroup(factors);
    expect(groups.ARTISTA.map((f) => f.id)).toEqual(["a", "b"]);
    expect(groups.PORTFOLIO.map((f) => f.id)).toEqual(["c"]);
    expect(getMissingFactors(factors).map((f) => f.id)).toEqual(["b"]);
  });
});
