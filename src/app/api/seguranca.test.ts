// @vitest-environment node
import { NextRequest } from "next/server";

const session = vi.hoisted(() => ({ user: null as null | { id: number; userType: string } }));
const calls = vi.hoisted(() => ({ eq: [] as Array<[string, unknown]>, from: [] as string[] }));

vi.mock("@/app/lib/session", () => ({ getSessionUser: async () => session.user }));

// Cadeia fluente que registra o que foi consultado e resolve vazio.
vi.mock("@/app/lib/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  const record = new Proxy(chain, {
    get(_t, prop) {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve({ data: null, error: null });
      if (prop === "eq") return (col: string, val: unknown) => (calls.eq.push([col, val]), record);
      return () => record;
    },
  });
  return { supabase: { from: (table: string) => (calls.from.push(table), record) } };
});

import { POST as publishEdital } from "@/app/api/editals/route";
import { PATCH as patchArtist } from "@/app/api/artists/[id]/route";
import { PATCH as patchProposer } from "@/app/api/proposers/[id]/route";
import { GET as getRanking } from "@/app/api/ranking/route";

const req = (url: string, method = "PATCH", body: unknown = { bio: "x" }) =>
  new NextRequest(`http://localhost${url}`, { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  session.user = null;
  calls.eq.length = 0;
  calls.from.length = 0;
});

describe("PATCH /api/artists/[id]", () => {
  it("sem sessão responde 403 e não toca no banco", async () => {
    const res = await patchArtist(req("/api/artists/2"), params("2"));
    expect(res.status).toBe(403);
    expect(calls.from).toEqual([]);
  });

  it("outro artista não altera o perfil alheio", async () => {
    session.user = { id: 1, userType: "ARTIST" };
    const res = await patchArtist(req("/api/artists/2"), params("2"));
    expect(res.status).toBe(403);
    expect(calls.from).toEqual([]);
  });

  it("proponente com o mesmo id não altera artista", async () => {
    session.user = { id: 2, userType: "PROPOSER" };
    expect((await patchArtist(req("/api/artists/2"), params("2"))).status).toBe(403);
  });

  it("o dono passa da autorização e chega ao banco", async () => {
    session.user = { id: 2, userType: "ARTIST" };
    await patchArtist(req("/api/artists/2"), params("2"));
    expect(calls.from).toContain("artist_data");
  });
});

describe("PATCH /api/proposers/[id]", () => {
  it("artista e outro proponente recebem 403; o dono chega ao banco", async () => {
    session.user = { id: 101, userType: "ARTIST" };
    expect((await patchProposer(req("/api/proposers/101"), params("101"))).status).toBe(403);
    session.user = { id: 102, userType: "PROPOSER" };
    expect((await patchProposer(req("/api/proposers/101"), params("101"))).status).toBe(403);
    expect(calls.from).toEqual([]);

    session.user = { id: 101, userType: "PROPOSER" };
    await patchProposer(req("/api/proposers/101"), params("101"));
    expect(calls.from).toContain("proposer_data");
  });
});

describe("POST /api/editals", () => {
  it("sem sessão 401; artista 403; proponente passa da autorização", async () => {
    expect((await publishEdital(req("/api/editals", "POST", {}))).status).toBe(401);
    session.user = { id: 2, userType: "ARTIST" };
    expect((await publishEdital(req("/api/editals", "POST", {}))).status).toBe(403);

    session.user = { id: 101, userType: "PROPOSER" };
    expect((await publishEdital(req("/api/editals", "POST", {}))).status).toBe(400);
  });
});

describe("GET /api/ranking", () => {
  it("sem sessão responde 401", async () => {
    expect((await getRanking()).status).toBe(401);
  });

  it("consulta o artista da sessão, nunca um id vindo da query", async () => {
    session.user = { id: 2, userType: "ARTIST" };
    await getRanking();
    expect(calls.eq).toContainEqual(["id", 2]);
    expect(calls.eq).not.toContainEqual(["id", 1]);
  });
});
