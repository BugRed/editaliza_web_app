import { adPositions, pickAd, type AdCreative } from "@/app/lib/ads";

const ad = (id: string): AdCreative => ({ id, brand: "b", headline: "h", text: "t", cta: "c", href: "https://x", imageUrl: "/i.jpg" });

describe("pickAd", () => {
  it("é determinístico, circular e aceita slot negativo", () => {
    const ads = [ad("a"), ad("b"), ad("c")];
    expect(pickAd(0, ads)?.id).toBe("a");
    expect(pickAd(4, ads)?.id).toBe("b");
    expect(pickAd(-1, ads)?.id).toBe("c");
  });

  it("sem anúncios não devolve nada", () => {
    expect(pickAd(0, [])).toBeNull();
  });
});

describe("adPositions", () => {
  it("coloca um anúncio a cada N posts e nunca depois do último", () => {
    expect(adPositions(10, 3)).toEqual([2, 5, 8]);
    expect(adPositions(3, 3)).toEqual([]);
    expect(adPositions(4, 3)).toEqual([2]);
  });

  it("intervalo inválido ou feed vazio não gera anúncio", () => {
    expect(adPositions(10, 0)).toEqual([]);
    expect(adPositions(0, 3)).toEqual([]);
  });
});
