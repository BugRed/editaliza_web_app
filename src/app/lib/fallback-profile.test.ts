import { buildFallbackProfile } from "@/app/lib/user-profiles";

describe("buildFallbackProfile", () => {
  it("é o perfil de QUEM entrou (id, e-mail, nome e foto dela), nunca o de outra pessoa", () => {
    const profile = buildFallbackProfile({ id: 4321, email: "clara@x.com", name: "Clara Mendes", imgUrl: "data:image/png;base64,AAAA" });
    expect(profile.id).toBe(4321);
    expect(profile.email).toBe("clara@x.com");
    expect(profile.name).toBe("Clara Mendes");
    expect(profile.avatarUrl).toBe("data:image/png;base64,AAAA");
    expect(profile.handle).toBe("@claramendes");
  });

  it("começa vazio, sem herdar obras, selos ou salvos de ninguém", () => {
    const profile = buildFallbackProfile({ id: 9, email: "a@x.com", name: "Ana" });
    expect(profile.works).toEqual([]);
    expect(profile.badges).toEqual([]);
    expect(profile.savedEditalIds).toEqual([]);
    expect(profile.coreLanguages).toEqual([]);
  });

  it("sem foto usa a imagem padrão e sem nome usa 'Artista'; acentos saem do @", () => {
    const profile = buildFallbackProfile({ id: 9, email: "a@x.com", imgUrl: null });
    expect(profile.name).toBe("Artista");
    expect(profile.avatarUrl).toMatch(/^\/images\//);
    expect(buildFallbackProfile({ id: 1, email: "e@x.com", name: "Zé da Conceição" }).handle).toBe("@zedaconceicao");
  });
});
