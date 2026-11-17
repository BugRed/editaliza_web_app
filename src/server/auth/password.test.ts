// @vitest-environment node
import { hashPassword, isPasswordHash, verifyPassword } from "@db/password.mjs";

describe("hash de senha (scrypt)", () => {
  it("confere a senha certa e recusa a errada", async () => {
    const hash = await hashPassword("senha-forte-123");
    expect(await verifyPassword("senha-forte-123", hash)).toBe(true);
    expect(await verifyPassword("senha-forte-124", hash)).toBe(false);
  });

  it("o hash não contém a senha e muda a cada chamada (salt)", async () => {
    const a = await hashPassword("segredo");
    const b = await hashPassword("segredo");
    expect(a).not.toContain("segredo");
    expect(a).not.toBe(b);
    expect(isPasswordHash(a)).toBe(true);
  });

  it("texto puro guardado no banco NUNCA confere, nem com a senha igual", async () => {
    expect(await verifyPassword("abc", "abc")).toBe(false);
    expect(await verifyPassword("", "")).toBe(false);
    expect(isPasswordHash("abc")).toBe(false);
  });

  it.each([null, undefined, 42, "scrypt$", "scrypt$1$2$3", "scrypt$x$y$z$@@@$###"])("valor guardado inválido %j não lança e não confere", async (stored) => {
    expect(await verifyPassword("abc", stored)).toBe(false);
  });

  it("hash adulterado não confere", async () => {
    const hash = await hashPassword("abc");
    const tampered = hash.slice(0, -4) + "AAAA";
    expect(await verifyPassword("abc", tampered)).toBe(false);
  });
});
