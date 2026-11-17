// @vitest-environment node
import { createMockClient } from "@/server/db/mock/client";
import { resetMockDb } from "@/server/db/mock/store";
import { isPasswordHash, verifyPassword } from "@db/password.mjs";

const db = () => createMockClient();

beforeEach(() => resetMockDb());

describe("mock em memória: seed", () => {
  it("carrega as seis tabelas do mesmo seed dos CSVs", async () => {
    const counts: Record<string, number> = {};
    for (const table of ["user_data", "artist_data", "proposer_data", "editals_data", "tags_data", "comments_data"]) {
      const { data } = await db().from(table).select("id");
      counts[table] = (data as unknown[]).length;
    }
    expect(counts.user_data).toBeGreaterThanOrEqual(3);
    expect(counts.editals_data).toBeGreaterThanOrEqual(5);
    expect(Object.values(counts).every((n) => n > 0)).toBe(true);
  });

  it("converte tipos: id numérico, jsonb como estrutura, boolean como boolean", async () => {
    const { data } = await db().from("artist_data").select("id,works,coreLanguages,hasCnpjOrMei").eq("id", 2).single();
    const row = data as Record<string, unknown>;
    expect(row.id).toBe(2);
    expect(Array.isArray(row.works)).toBe(true);
    expect(Array.isArray(row.coreLanguages)).toBe(true);
    expect(typeof row.hasCnpjOrMei).toBe("boolean");
  });

  it("as senhas do seed ficam como hash em memória, nunca em texto puro", async () => {
    const { data } = await db().from("user_data").select("email,password").eq("email", "maria.oliveira@email.com").single();
    const stored = (data as { password: string }).password;
    expect(isPasswordHash(stored)).toBe(true);
    expect(await verifyPassword("senha_segura_2", stored)).toBe(true);
  });
});

describe("mock em memória: consultas", () => {
  it("select com colunas devolve só elas; coluna que não pediu (password) não vaza", async () => {
    const { data } = await db().from("user_data").select("id,email").eq("id", 2).single();
    expect(Object.keys(data as object).sort()).toEqual(["email", "id"]);
  });

  it("single sem resultado devolve data null e erro PGRST116, como o PostgREST", async () => {
    const { data, error } = await db().from("user_data").select("id").eq("email", "ninguem@x.com").single();
    expect(data).toBeNull();
    expect(error?.code).toBe("PGRST116");
  });

  it("eq empilhado filtra pelos dois critérios", async () => {
    const hit = await db().from("user_data").select("id").eq("id", 2).eq("email", "maria.oliveira@email.com").single();
    const miss = await db().from("user_data").select("id").eq("id", 2).eq("email", "outro@x.com").single();
    expect(hit.data).not.toBeNull();
    expect(miss.data).toBeNull();
  });

  it("select sem single devolve lista", async () => {
    const { data } = await db().from("editals_data").select("id,title");
    expect(Array.isArray(data) && data.length > 0).toBe(true);
  });
});

describe("mock em memória: escrita", () => {
  it("insert cria com id sequencial, datas e listas vazias, e devolve com select().single()", async () => {
    const { data, error } = await db().from("proposer_data").insert({ name: "Nova", email: "nova@x.com", password: "h", cnpj: "1" }).select("id,listEdital,createdAt").single();
    expect(error).toBeNull();
    const row = data as Record<string, unknown>;
    expect(typeof row.id).toBe("number");
    expect(row.listEdital).toEqual([]);
    expect(typeof row.createdAt).toBe("string");
  });

  it("e-mail repetido na mesma tabela falha com 23505 e não cria linha", async () => {
    const first = await db().from("user_data").insert({ name: "A", email: "dup@x.com", password: "h" });
    const second = await db().from("user_data").insert({ name: "B", email: "dup@x.com", password: "h" });
    expect(first.error).toBeNull();
    expect(second.error?.code).toBe("23505");
    const { data } = await db().from("user_data").select("id").eq("email", "dup@x.com");
    expect((data as unknown[]).length).toBe(1);
  });

  it("update altera só as linhas filtradas e devolve o resultado com select", async () => {
    const { data } = await db().from("artist_data").update({ bio: "nova bio" }).eq("id", 2).select("id,bio").single();
    expect(data).toEqual({ id: 2, bio: "nova bio" });
    const other = await db().from("artist_data").select("bio").eq("id", 1).single();
    expect((other.data as { bio: string }).bio).not.toBe("nova bio");
  });

  it("update sem select devolve data null (como o supabase-js) mas aplica a mudança", async () => {
    const result = await db().from("artist_data").update({ city: "Olinda" }).eq("id", 2);
    expect(result.data).toBeNull();
    const { data } = await db().from("artist_data").select("city").eq("id", 2).single();
    expect((data as { city: string }).city).toBe("Olinda");
  });
});
