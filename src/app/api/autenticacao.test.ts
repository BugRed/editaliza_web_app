// @vitest-environment node
import { parse } from "csv-parse/sync";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";

// Tem de rodar antes dos imports (env.ts valida o ambiente ao ser carregado).
vi.hoisted(() => {
  process.env.DATA_SOURCE = "mock";
  process.env.AUTH_SECRET = "segredo-de-teste-com-mais-de-32-caracteres!!";
});

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { POST as register } from "@/app/api/auth/register/route";
import { middleware } from "@/middleware";
import { resetMockDb } from "@/server/db/mock/store";
import { createSessionToken } from "@/shared/lib/auth-token";

const SECRET = "segredo-de-teste-com-mais-de-32-caracteres!!";
const post = (url: string, body: unknown) =>
  new Request(`http://localhost${url}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

beforeEach(() => resetMockDb());

describe("login", () => {
  it("conta do seed entra: cookie httpOnly, SameSite=Lax e o token fora do corpo", async () => {
    const res = await login(post("/api/auth/login", { email: "maria.oliveira@email.com", password: "senha_segura_2" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user.email).toBe("maria.oliveira@email.com");
    expect(body).not.toHaveProperty("token");
    expect(JSON.stringify(body)).not.toContain("password");

    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^auth-token=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
    expect(cookie).toMatch(/Max-Age=3600/i);
  });

  it("senha errada, e-mail inexistente e corpo vazio não criam sessão", async () => {
    const wrong = await login(post("/api/auth/login", { email: "maria.oliveira@email.com", password: "errada" }));
    expect(wrong.status).toBe(401);
    expect(wrong.headers.get("set-cookie")).toBeNull();
    expect((await login(post("/api/auth/login", { email: "x@x.com", password: "y" }))).status).toBe(401);
    expect((await login(post("/api/auth/login", {}))).status).toBe(400);
  });

  it("proponente do seed entra, e a senha é a do CSV de seed (legível só lá)", async () => {
    const [proposer] = parse(readFileSync("mock/proposer_data.csv", "utf8"), { columns: true }) as Array<{ email: string; password: string }>;
    const res = await login(post("/api/auth/login", { email: proposer.email, password: proposer.password }));
    expect(res.status).toBe(200);
    expect((await res.json()).user.userType).toBe("PROPOSER");
  });

  it("senha em texto puro no banco não autentica: o e-mail do seed com a senha lida do hash falha", async () => {
    const res = await login(post("/api/auth/login", { email: "maria.oliveira@email.com", password: "scrypt$16384$8$1$x$y" }));
    expect(res.status).toBe(401);
  });
});

const PHOTO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("cadastro", () => {
  const payload = {
    userType: "ARTIST",
    name: "Nova Pessoa",
    email: "nova.pessoa@x.com",
    password: "Senha@Forte9",
    avatarDataUrl: PHOTO,
    coreLanguages: ["Pintura"],
  };
  const send = (overrides: Record<string, unknown> = {}) => register(post("/api/auth/register", { ...payload, ...overrides }));
  const messageOf = async (res: Response) => ((await res.json()) as { message?: string }).message ?? "";

  it("cria a conta, grava só o hash e a foto, abre sessão por cookie httpOnly e permite logar depois", async () => {
    const res = await send();
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).not.toHaveProperty("token");
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);

    const { supabase } = await import("@/app/lib/supabase/client");
    const { data } = await supabase.from("user_data").select("password,imgUrl").eq("email", payload.email).single();
    const stored = data as { password: string; imgUrl: string };
    expect(stored.password).not.toContain("Senha@Forte9");
    expect(stored.password.startsWith("scrypt$")).toBe(true);
    expect(stored.imgUrl).toBe(PHOTO);

    const again = await login(post("/api/auth/login", { email: payload.email, password: payload.password }));
    expect(again.status).toBe(200);
  });

  it("a foto vai para o perfil do artista (imgUrl e avatarUrl), não a imagem padrão de outra pessoa", async () => {
    await send({ email: "foto@x.com" });
    const { supabase } = await import("@/app/lib/supabase/client");
    const { data } = await supabase.from("artist_data").select("imgUrl,avatarUrl").eq("email", "foto@x.com").single();
    expect(data).toEqual({ imgUrl: PHOTO, avatarUrl: PHOTO });
  });

  it("o resumo da sessão traz a foto de quem entrou", async () => {
    await send({ email: "sessao@x.com" });
    const { authService } = await import("@/app/services/auth-service");
    const result = await authService.login({ email: "sessao@x.com", password: payload.password });
    expect(result.user?.imgUrl).toBe(PHOTO);
  });

  it("senha fraca é recusada, cada falta com a mesma mensagem da regra", async () => {
    for (const password of ["senha-boa-123", "SENHA@FORTE9", "senha@forte9", "Senha@Forte", "Sen@F9", "123456"]) {
      const res = await send({ password });
      expect(res.status, password).toBe(400);
      expect(await messageOf(res)).toMatch(/senha/i);
    }
    const { supabase } = await import("@/app/lib/supabase/client");
    const { data } = await supabase.from("user_data").select("id").eq("email", payload.email);
    expect(data).toEqual([]);
  });

  it("CPF inválido é recusado; CPF válido (com máscara) e CPF ausente passam", async () => {
    expect((await send({ email: "a1@x.com", cpf: "111.111.111-11" })).status).toBe(400);
    expect((await send({ email: "a2@x.com", cpf: "529.982.247-24" })).status).toBe(400);
    expect((await send({ email: "a3@x.com", cpf: "529.982.247-25" })).status).toBe(201);
    expect((await send({ email: "a4@x.com" })).status).toBe(201);
  });

  it("sem foto não cadastra", async () => {
    const { avatarDataUrl, ...withoutPhoto } = payload;
    void avatarDataUrl;
    const res = await register(post("/api/auth/register", withoutPhoto));
    expect(res.status).toBe(400);
    expect(await messageOf(res)).toMatch(/foto/i);
  });

  it.each([
    ["SVG, que pode levar script", "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="],
    ["texto disfarçado", "data:text/html;base64,PHNjcmlwdD4="],
    ["esquema perigoso", "javascript:alert(1)"],
    ["endereço remoto", "https://exemplo.com/foto.png"],
    ["vazio", ""],
  ])("foto inválida (%s) é recusada", async (_nome, avatarDataUrl) => {
    expect((await send({ avatarDataUrl })).status).toBe(400);
  });

  it("foto grande demais é recusada", async () => {
    expect((await send({ avatarDataUrl: "data:image/png;base64," + "A".repeat(200_000) })).status).toBe(400);
  });

  it("empresa cadastra sem logo e fica com a imagem padrão; com logo, guarda o logo", async () => {
    const base = { userType: "PROPOSER", name: "Instituto Novo", email: "inst@x.com", cnpj: "11.222.333/0001-44", password: "Senha@Forte9" };
    const { supabase } = await import("@/app/lib/supabase/client");

    expect((await register(post("/api/auth/register", base))).status).toBe(201);
    const without = await supabase.from("proposer_data").select("imgUrl").eq("email", "inst@x.com").single();
    expect((without.data as { imgUrl: string }).imgUrl).toMatch(/^\/images\//);

    expect((await register(post("/api/auth/register", { ...base, email: "inst2@x.com", avatarDataUrl: PHOTO }))).status).toBe(201);
    const withLogo = await supabase.from("proposer_data").select("imgUrl").eq("email", "inst2@x.com").single();
    expect((withLogo.data as { imgUrl: string }).imgUrl).toBe(PHOTO);

    expect((await register(post("/api/auth/register", { ...base, email: "inst3@x.com", avatarDataUrl: "" }))).status).toBe(201);
  });

  it("empresa também precisa de senha forte e, se enviar logo, ele precisa ser válido", async () => {
    const base = { userType: "PROPOSER", name: "Instituto Novo", email: "inst4@x.com", cnpj: "11.222.333/0001-44", password: "Senha@Forte9" };
    expect((await register(post("/api/auth/register", { ...base, password: "fraca" }))).status).toBe(400);
    expect((await register(post("/api/auth/register", { ...base, avatarDataUrl: "data:image/svg+xml;base64,PHN2Zz4=" }))).status).toBe(400);
  });

  it("e-mail já cadastrado é recusado", async () => {
    await send();
    const second = await send();
    expect(second.status).toBeGreaterThanOrEqual(400);
    expect(second.status).toBeLessThan(500);
  });

  it("linguagem própria entra, mas com limite de tamanho", async () => {
    expect((await send({ email: "l1@x.com", coreLanguages: ["Pintura", "Cordel"] })).status).toBe(201);
    expect((await send({ email: "l2@x.com", coreLanguages: ["x".repeat(41)] })).status).toBe(400);
  });
});

describe("logout", () => {
  it("apaga o cookie no servidor", async () => {
    const res = await logout();
    expect(res.headers.get("set-cookie")).toMatch(/auth-token=;.*(Max-Age=0|Expires=)/i);
  });
});

describe("middleware", () => {
  const req = (path: string, cookie?: string, headers: Record<string, string> = {}) =>
    new NextRequest(`http://localhost${path}`, { headers: { ...(cookie ? { cookie: `auth-token=${cookie}` } : {}), ...headers } });

  it("API sem sessão: 401; página sem sessão: redireciona ao login guardando o destino", async () => {
    expect((await middleware(req("/api/artists"))).status).toBe(401);
    const page = await middleware(req("/feed"));
    expect(page.status).toBe(307);
    expect(page.headers.get("location")).toContain("/login?redirect=%2Ffeed");
  });

  it("sessão assinada válida passa na API e nas páginas", async () => {
    const token = await createSessionToken(2, "maria.oliveira@email.com", SECRET);
    expect((await middleware(req("/api/artists", token))).headers.get("x-middleware-next")).toBe("1");
    expect((await middleware(req("/feed", token))).headers.get("x-middleware-next")).toBe("1");
  });

  it("token forjado no formato antigo e Bearer não autenticam", async () => {
    const legacy = btoa(`2-maria.oliveira@email.com-${Date.now()}`);
    expect((await middleware(req("/api/artists", legacy))).status).toBe(401);
    const valid = await createSessionToken(2, "maria.oliveira@email.com", SECRET);
    expect((await middleware(req("/api/artists", undefined, { authorization: `Bearer ${valid}` }))).status).toBe(401);
  });

  it("rotas públicas de API ficam abertas, inclusive o logout", async () => {
    for (const path of ["/api/health", "/api/auth/login", "/api/auth/register", "/api/auth/logout"]) {
      expect((await middleware(req(path))).headers.get("x-middleware-next")).toBe("1");
    }
  });

  it("quem já tem sessão e abre /login vai para o início", async () => {
    const token = await createSessionToken(2, "maria.oliveira@email.com", SECRET);
    expect((await middleware(req("/login", token))).status).toBe(307);
  });
});
