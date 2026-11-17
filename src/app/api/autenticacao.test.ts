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

describe("cadastro", () => {
  const payload = { userType: "ARTIST", name: "Nova Pessoa", email: "nova.pessoa@x.com", password: "senha-boa-123", coreLanguages: ["Pintura"] };

  it("cria a conta, grava só o hash, abre sessão por cookie httpOnly e permite logar depois", async () => {
    const res = await register(post("/api/auth/register", payload));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).not.toHaveProperty("token");
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);

    const { supabase } = await import("@/app/lib/supabase/client");
    const { data } = await supabase.from("user_data").select("password").eq("email", payload.email).single();
    const stored = (data as { password: string }).password;
    expect(stored).not.toContain("senha-boa-123");
    expect(stored.startsWith("scrypt$")).toBe(true);

    const again = await login(post("/api/auth/login", { email: payload.email, password: payload.password }));
    expect(again.status).toBe(200);
  });

  it("e-mail já cadastrado é recusado", async () => {
    await register(post("/api/auth/register", payload));
    const second = await register(post("/api/auth/register", payload));
    expect(second.status).toBeGreaterThanOrEqual(400);
    expect(second.status).toBeLessThan(500);
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
