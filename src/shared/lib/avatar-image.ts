// Foto de perfil enviada no cadastro. Sem armazenamento de arquivos ainda, a imagem vai como data URL
// pequena (recortada e reduzida no navegador). Estas regras valem nos dois lados; o servidor é quem manda.

export const AVATAR_SIZE_PX = 320;
export const MAX_AVATAR_BYTES_INPUT = 8 * 1024 * 1024;
// ~110 KB de imagem em base64: uma foto 320×320 em JPEG fica muito abaixo disso.
export const MAX_AVATAR_DATA_URL_LENGTH = 150_000;

// SVG fica de fora de propósito: é o único formato de imagem que pode carregar script.
const AVATAR_DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export function isValidAvatarDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_AVATAR_DATA_URL_LENGTH && AVATAR_DATA_URL.test(value);
}

/** Recorte quadrado centralizado: o maior quadrado que cabe na imagem. */
export function computeSquareCrop(width: number, height: number): { sx: number; sy: number; size: number } {
  const size = Math.min(width, height);
  return { sx: Math.floor((width - size) / 2), sy: Math.floor((height - size) / 2), size };
}

export function isAcceptedImageType(type: string): boolean {
  return type === "image/jpeg" || type === "image/png" || type === "image/webp";
}

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export interface DecodedAvatar {
  contentType: string;
  extension: string;
  bytes: Uint8Array;
}

/** Decodifica um data URL já validado em bytes, para enviar a um armazenamento de arquivos. */
export function decodeAvatarDataUrl(dataUrl: string): DecodedAvatar {
  if (!isValidAvatarDataUrl(dataUrl)) throw new Error("Foto inválida.");
  const [header, base64] = dataUrl.split(",", 2);
  const contentType = header.slice("data:".length, header.indexOf(";"));
  return { contentType, extension: EXTENSIONS[contentType], bytes: Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)) };
}
