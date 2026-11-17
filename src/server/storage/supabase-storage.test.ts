// @vitest-environment node
import { decodeAvatarDataUrl } from "@/shared/lib/avatar-image";
import { avatarObjectPath, publicObjectUrl, StorageUploadError, uploadObject } from "@/server/storage/supabase-storage";

const config = { baseUrl: "https://abc.supabase.co/", serviceKey: "chave-de-servico", bucket: "avatars" };
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("endereços e caminhos", () => {
  it("o endereço público não duplica a barra e usa o bucket", () => {
    expect(publicObjectUrl(config, "u7-ab12cd34.jpg")).toBe("https://abc.supabase.co/storage/v1/object/public/avatars/u7-ab12cd34.jpg");
  });

  it("o caminho é único por envio, para a foto trocada não ficar presa em cache", () => {
    expect(avatarObjectPath(7, "jpg", "ab12cd34")).toBe("u7-ab12cd34.jpg");
    expect(avatarObjectPath(7, "jpg", "ffffffff")).not.toBe(avatarObjectPath(7, "jpg", "ab12cd34"));
  });
});

describe("uploadObject", () => {
  it("envia os bytes ao Storage com a chave de serviço, o tipo certo e upsert", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response('{"Key":"avatars/x"}', { status: 200 });
    }) as unknown as typeof fetch;
    const bytes = new Uint8Array([1, 2, 3]);

    await uploadObject(config, "u7-ab12cd34.jpg", bytes, "image/jpeg", fetchImpl);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://abc.supabase.co/storage/v1/object/avatars/u7-ab12cd34.jpg");
    expect(calls[0].init.method).toBe("POST");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer chave-de-servico");
    expect(headers.apikey).toBe("chave-de-servico");
    expect(headers["Content-Type"]).toBe("image/jpeg");
    expect(headers["x-upsert"]).toBe("true");
    expect(calls[0].init.body).toBe(bytes);
  });

  it.each([400, 401, 403, 404, 413, 500])("resposta %s vira StorageUploadError, sem expor a chave", async (status) => {
    const fetchImpl = (async () => new Response("erro", { status })) as unknown as typeof fetch;
    const failure = await uploadObject(config, "a.jpg", new Uint8Array(1), "image/jpeg", fetchImpl).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(StorageUploadError);
    expect((failure as Error).message).toContain(String(status));
    expect((failure as Error).message).not.toContain("chave-de-servico");
  });

  it("falha de rede propaga o erro em vez de fingir sucesso", async () => {
    const fetchImpl = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    await expect(uploadObject(config, "a.jpg", new Uint8Array(1), "image/jpeg", fetchImpl)).rejects.toThrow("fetch failed");
  });
});

describe("decodeAvatarDataUrl", () => {
  it("devolve o tipo, a extensão e os bytes reais da imagem", () => {
    const photo = decodeAvatarDataUrl(PNG);
    expect(photo.contentType).toBe("image/png");
    expect(photo.extension).toBe("png");
    expect(Array.from(photo.bytes.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("recusa o que não é imagem permitida", () => {
    expect(() => decodeAvatarDataUrl("data:image/svg+xml;base64,PHN2Zz4=")).toThrow();
    expect(() => decodeAvatarDataUrl("javascript:alert(1)")).toThrow();
  });
});
