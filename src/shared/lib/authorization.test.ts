import { canEditProfile, canPublishEdital } from "@/shared/lib/authorization";

describe("canEditProfile", () => {
  it("o dono edita o próprio perfil", () => {
    expect(canEditProfile({ id: 2, userType: "ARTIST" }, 2, "ARTIST")).toBe(true);
    expect(canEditProfile({ id: "101", userType: "PROPOSER" }, 101, "PROPOSER")).toBe(true);
  });

  it("outro usuário não edita perfil alheio", () => {
    expect(canEditProfile({ id: 2, userType: "ARTIST" }, 1, "ARTIST")).toBe(false);
  });

  it("sem sessão não edita nada", () => {
    expect(canEditProfile(null, 1, "ARTIST")).toBe(false);
  });

  it("o tipo precisa bater: artista com o mesmo id não edita o proponente", () => {
    expect(canEditProfile({ id: 101, userType: "ARTIST" }, 101, "PROPOSER")).toBe(false);
    expect(canEditProfile({ id: 101, userType: "PROPOSER" }, 101, "ARTIST")).toBe(false);
  });

  it("tipo ausente vale artista e a comparação ignora maiúsculas", () => {
    expect(canEditProfile({ id: 3 }, 3, "ARTIST")).toBe(true);
    expect(canEditProfile({ id: 3, userType: "artist" }, 3, "ARTIST")).toBe(true);
  });
});

describe("canPublishEdital", () => {
  it("só proponente publica", () => {
    expect(canPublishEdital({ id: 1, userType: "PROPOSER" })).toBe(true);
    expect(canPublishEdital({ id: 1, userType: "ARTIST" })).toBe(false);
    expect(canPublishEdital({ id: 1 })).toBe(false);
    expect(canPublishEdital(null)).toBe(false);
  });
});
