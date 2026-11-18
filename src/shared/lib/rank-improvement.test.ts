import { improvementLinksFor } from "@/shared/lib/rank-improvement";
import type { RankFactor } from "@/shared/lib/artistrank";

const factor = (id: string): RankFactor => ({ id, grupo: "ARTISTA", label: id, peso: 0.1, nota: null });

describe("improvementLinksFor", () => {
  it("fatores da mesma tela geram um link só", () => {
    expect(improvementLinksFor([factor("experiencia"), factor("trajetoria")])).toEqual([
      { href: "/perfil/trajetoria", label: "Registrar sua trajetória" },
    ]);
  });

  it("fator desconhecido cai no convite para completar o perfil", () => {
    expect(improvementLinksFor([factor("novo-fator")])[0].href).toBe("/onboarding");
  });

  it("sem fator faltando não há link", () => {
    expect(improvementLinksFor([])).toEqual([]);
  });
});
