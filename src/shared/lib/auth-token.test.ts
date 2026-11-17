// @vitest-environment node
import { createSessionToken, readSessionToken, SESSION_TTL_SECONDS } from "@/shared/lib/auth-token";

const SECRET = "segredo-de-teste-com-mais-de-32-caracteres!!";
const OTHER = "outro-segredo-de-teste-com-32-caracteres+";
const NOW = 1_800_000_000_000;

describe("sessão assinada", () => {
  it("ida e volta devolve quem logou", async () => {
    const token = await createSessionToken(7, "ana@x.com", SECRET, NOW);
    expect(await readSessionToken(token, SECRET, NOW + 1000)).toEqual({ userId: "7", email: "ana@x.com" });
  });

  it("aceita e-mail com hífen e ponto sem truncar", async () => {
    const token = await createSessionToken(1, "ana-maria.silva@x-y.com", SECRET, NOW);
    expect((await readSessionToken(token, SECRET, NOW))?.email).toBe("ana-maria.silva@x-y.com");
  });

  it("expira: válido no limite, inválido depois", async () => {
    const token = await createSessionToken(1, "a@b.c", SECRET, NOW);
    expect(await readSessionToken(token, SECRET, NOW + (SESSION_TTL_SECONDS - 1) * 1000)).not.toBeNull();
    expect(await readSessionToken(token, SECRET, NOW + SESSION_TTL_SECONDS * 1000)).toBeNull();
  });

  it("segredo diferente não valida", async () => {
    const token = await createSessionToken(1, "a@b.c", SECRET, NOW);
    expect(await readSessionToken(token, OTHER, NOW)).toBeNull();
  });

  it("corpo adulterado com a assinatura antiga é recusado (forjar outro usuário não funciona)", async () => {
    const token = await createSessionToken(1, "a@b.c", SECRET, NOW);
    const [, signature] = token.split(".");
    const forgedBody = btoa(JSON.stringify({ sub: "2", email: "admin@b.c", exp: NOW / 1000 + 3600 }))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(await readSessionToken(`${forgedBody}.${signature}`, SECRET, NOW)).toBeNull();
  });

  it("o formato antigo (base64 de id-email-timestamp, sem assinatura) não vale mais", async () => {
    const legacy = btoa(`1-a@b.c-${NOW}`);
    expect(await readSessionToken(legacy, SECRET, NOW)).toBeNull();
  });

  it.each(["", "sem-ponto", "a.b.c", ".", "a.", ".b", "!!!.@@@"])("lixo %j vira null, sem lançar", async (junk) => {
    expect(await readSessionToken(junk, SECRET, NOW)).toBeNull();
  });

  it("ausente ou vazio vira null", async () => {
    expect(await readSessionToken(undefined, SECRET)).toBeNull();
    expect(await readSessionToken(null, SECRET)).toBeNull();
  });

  it("sem segredo utilizável falha fechado: não assina e não valida", async () => {
    await expect(createSessionToken(1, "a@b.c", undefined)).rejects.toThrow();
    await expect(createSessionToken(1, "a@b.c", "curto")).rejects.toThrow();
    const token = await createSessionToken(1, "a@b.c", SECRET, NOW);
    expect(await readSessionToken(token, undefined, NOW)).toBeNull();
    expect(await readSessionToken(token, "curto", NOW)).toBeNull();
  });
});
