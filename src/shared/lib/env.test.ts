// @vitest-environment node
const SECRET = "segredo-de-teste-com-mais-de-32-caracteres!!";
const KEYS = ["DATA_SOURCE", "AUTH_SECRET", "SUPABASE_URL", "SUPABASE_API_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_STORAGE_BUCKET", "PHOTO_STORAGE", "SITE_URL", "NODE_ENV"] as const;
// NODE_ENV é somente leitura no tipo de process.env; o teste precisa trocá-lo e restaurá-lo.
const processEnv = process.env as Record<string, string | undefined>;
const original = Object.fromEntries(KEYS.map((key) => [key, processEnv[key]]));

async function loadEnv(vars: Partial<Record<(typeof KEYS)[number], string>>) {
  vi.resetModules();
  for (const key of KEYS) delete processEnv[key];
  Object.assign(processEnv, { NODE_ENV: "test", ...vars });
  return (await import("@/shared/lib/env")).env;
}

afterAll(() => {
  for (const key of KEYS) {
    if (original[key] === undefined) delete processEnv[key];
    else processEnv[key] = original[key];
  }
});

describe("contrato de env", () => {
  it("AUTH_SECRET é obrigatória e precisa de 32 caracteres", async () => {
    await expect(loadEnv({ DATA_SOURCE: "mock" })).rejects.toThrow(/AUTH_SECRET/);
    await expect(loadEnv({ DATA_SOURCE: "mock", AUTH_SECRET: "curto" })).rejects.toThrow(/AUTH_SECRET/);
  });

  it("fora de produção a fonte padrão é supabase (Docker) e exige as variáveis dele", async () => {
    await expect(loadEnv({ AUTH_SECRET: SECRET })).rejects.toThrow(/DATA_SOURCE=supabase exige/);
    const env = await loadEnv({ AUTH_SECRET: SECRET, SUPABASE_URL: "http://localhost:54321", SUPABASE_API_KEY: "k" });
    expect(env.DATA_SOURCE).toBe("supabase");
  });

  it("em produção a fonte padrão é mock e não pede Supabase", async () => {
    const env = await loadEnv({ AUTH_SECRET: SECRET, NODE_ENV: "production" });
    expect(env.DATA_SOURCE).toBe("mock");
  });
});

describe("armazenamento de fotos", () => {
  it("o padrão é inline (no registro) e o bucket padrão é 'avatars'", async () => {
    const env = await loadEnv({ AUTH_SECRET: SECRET, DATA_SOURCE: "mock" });
    expect(env.PHOTO_STORAGE).toBe("inline");
    expect(env.SUPABASE_STORAGE_BUCKET).toBe("avatars");
  });

  it("PHOTO_STORAGE=supabase exige a URL e a chave de serviço, e o app não sobe sem elas", async () => {
    await expect(loadEnv({ AUTH_SECRET: SECRET, DATA_SOURCE: "mock", PHOTO_STORAGE: "supabase" })).rejects.toThrow(/PHOTO_STORAGE=supabase exige/);
    await expect(
      loadEnv({ AUTH_SECRET: SECRET, DATA_SOURCE: "mock", PHOTO_STORAGE: "supabase", SUPABASE_URL: "https://abc.supabase.co" })
    ).rejects.toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("com tudo configurado sobe, e a fonte de dados continua independente (mock com fotos no Storage)", async () => {
    const env = await loadEnv({
      AUTH_SECRET: SECRET,
      DATA_SOURCE: "mock",
      PHOTO_STORAGE: "supabase",
      SUPABASE_URL: "https://abc.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "chave",
      SUPABASE_STORAGE_BUCKET: "fotos",
    });
    expect(env.PHOTO_STORAGE).toBe("supabase");
    expect(env.DATA_SOURCE).toBe("mock");
    expect(env.SUPABASE_STORAGE_BUCKET).toBe("fotos");
  });

  it("valor desconhecido em PHOTO_STORAGE é recusado", async () => {
    await expect(loadEnv({ AUTH_SECRET: SECRET, DATA_SOURCE: "mock", PHOTO_STORAGE: "s3" })).rejects.toThrow(/PHOTO_STORAGE/);
  });
});
