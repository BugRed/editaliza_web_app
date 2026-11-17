// @vitest-environment node
// Tem de rodar antes dos imports (env.ts valida o ambiente ao ser carregado).
vi.hoisted(() => {
  process.env.DATA_SOURCE = "mock";
  process.env.AUTH_SECRET = "segredo-de-teste-com-mais-de-32-caracteres!!";
  process.env.PHOTO_STORAGE = "supabase";
  process.env.SUPABASE_URL = "https://abc.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "chave-de-servico";
});

import { POST as register } from "@/app/api/auth/register/route";
import { resetMockDb } from "@/server/db/mock/store";

const PHOTO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const post = (body: unknown) =>
  new Request("http://localhost/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const payload = { userType: "ARTIST", name: "Foto Remota", email: "remota@x.com", password: "Senha@Forte9", avatarDataUrl: PHOTO, coreLanguages: ["Pintura"] };

const uploads: Array<{ url: string; body: unknown }> = [];
let uploadStatus = 200;

beforeEach(() => {
  resetMockDb();
  uploads.length = 0;
  uploadStatus = 200;
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    uploads.push({ url, body: init.body });
    return new Response("{}", { status: uploadStatus });
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("cadastro com PHOTO_STORAGE=supabase", () => {
  it("envia o arquivo ao Storage e grava no perfil só o endereço público, não a imagem", async () => {
    const res = await register(post(payload));
    expect(res.status).toBe(201);

    expect(uploads).toHaveLength(1);
    expect(uploads[0].url).toMatch(/^https:\/\/abc\.supabase\.co\/storage\/v1\/object\/avatars\/u\d+-[0-9a-f]{8}\.png$/);
    expect((uploads[0].body as Uint8Array).length).toBeGreaterThan(0);

    const { supabase } = await import("@/app/lib/supabase/client");
    const { data } = await supabase.from("artist_data").select("imgUrl,avatarUrl").eq("email", payload.email).single();
    const row = data as { imgUrl: string; avatarUrl: string };
    expect(row.imgUrl).toMatch(/^https:\/\/abc\.supabase\.co\/storage\/v1\/object\/public\/avatars\/u\d+-[0-9a-f]{8}\.png$/);
    expect(row.avatarUrl).toBe(row.imgUrl);
    expect(row.imgUrl).not.toContain("base64");
  });

  it("se o Storage falha, responde 502 e NÃO cria a conta", async () => {
    uploadStatus = 500;
    const res = await register(post(payload));
    expect(res.status).toBe(502);
    expect(((await res.json()) as { message: string }).message).toMatch(/foto/i);

    const { supabase } = await import("@/app/lib/supabase/client");
    const { data } = await supabase.from("user_data").select("id").eq("email", payload.email);
    expect(data).toEqual([]);
  });

  it("empresa sem logo não toca no Storage", async () => {
    const res = await register(post({ userType: "PROPOSER", name: "Sem Logo", email: "semlogo@x.com", cnpj: "11222333000144", password: "Senha@Forte9" }));
    expect(res.status).toBe(201);
    expect(uploads).toHaveLength(0);
  });
});
