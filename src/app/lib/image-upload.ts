import {
  AVATAR_SIZE_PX,
  computeSquareCrop,
  isAcceptedImageType,
  isValidAvatarDataUrl,
  MAX_AVATAR_BYTES_INPUT,
} from "@/shared/lib/avatar-image";

export class ImageUploadError extends Error {}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageUploadError("Não foi possível abrir essa imagem. Tente outra foto."));
    };
    image.src = url;
  });
}

/**
 * Valida, recorta em quadrado e reduz a foto para 320×320 JPEG, devolvendo um data URL pequeno.
 * Só roda no navegador (usa canvas). O servidor revalida o resultado.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!isAcceptedImageType(file.type)) {
    throw new ImageUploadError("Use uma foto JPG, PNG ou WebP.");
  }
  if (file.size > MAX_AVATAR_BYTES_INPUT) {
    throw new ImageUploadError("A foto passa de 8 MB. Escolha uma menor.");
  }

  const image = await loadImage(file);
  const { sx, sy, size } = computeSquareCrop(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE_PX;
  canvas.height = AVATAR_SIZE_PX;
  const context = canvas.getContext("2d");
  if (!context) throw new ImageUploadError("Seu navegador não conseguiu preparar a foto.");

  context.fillStyle = "#FFFFFF"; // PNG com transparência vira JPEG sobre fundo branco, não preto
  context.fillRect(0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);
  context.drawImage(image, sx, sy, size, size, 0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  if (!isValidAvatarDataUrl(dataUrl)) throw new ImageUploadError("A foto ficou grande demais. Escolha outra.");
  return dataUrl;
}
