// Cliente mínimo do Supabase Storage (API REST). Sem env e sem import de servidor: recebe a configuração e o
// `fetch`, para poder ser testado sem rede. A cola que lê a env fica em avatar-storage.ts.

export interface SupabaseStorageConfig {
  baseUrl: string;
  serviceKey: string;
  bucket: string;
}

export class StorageUploadError extends Error {}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Endereço público do arquivo (o bucket precisa ser público). */
export function publicObjectUrl(config: Pick<SupabaseStorageConfig, "baseUrl" | "bucket">, objectPath: string): string {
  return `${trimSlash(config.baseUrl)}/storage/v1/object/public/${config.bucket}/${objectPath}`;
}

/** Caminho do arquivo: único por envio (o sufixo aleatório evita cache da foto antiga quando ela for trocada). */
export function avatarObjectPath(ownerId: number | string, extension: string, nonce: string): string {
  return `u${ownerId}-${nonce}.${extension}`;
}

export async function uploadObject(
  config: SupabaseStorageConfig,
  objectPath: string,
  body: Uint8Array,
  contentType: string,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  const response = await fetchImpl(`${trimSlash(config.baseUrl)}/storage/v1/object/${config.bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.serviceKey}`,
      apikey: config.serviceKey,
      "Content-Type": contentType,
      "Cache-Control": "max-age=31536000",
      "x-upsert": "true",
    },
    body: body as unknown as BodyInit,
  });
  if (!response.ok) {
    throw new StorageUploadError(`Supabase Storage respondeu ${response.status} ao gravar a foto.`);
  }
}
