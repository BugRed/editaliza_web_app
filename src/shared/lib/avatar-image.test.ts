import { computeSquareCrop, isAcceptedImageType, isValidAvatarDataUrl, MAX_AVATAR_DATA_URL_LENGTH } from "@/shared/lib/avatar-image";

const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("isValidAvatarDataUrl", () => {
  it("aceita JPEG, PNG e WebP em base64", () => {
    expect(isValidAvatarDataUrl(png)).toBe(true);
    expect(isValidAvatarDataUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
    expect(isValidAvatarDataUrl("data:image/webp;base64,UklGRg==")).toBe(true);
  });

  it("recusa SVG (pode levar script), outros tipos, esquemas perigosos e lixo", () => {
    expect(isValidAvatarDataUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isValidAvatarDataUrl("data:text/html;base64,PHNjcmlwdD4=")).toBe(false);
    expect(isValidAvatarDataUrl("javascript:alert(1)")).toBe(false);
    expect(isValidAvatarDataUrl("https://x.com/a.png")).toBe(false);
    expect(isValidAvatarDataUrl("data:image/png;base64,")).toBe(false);
    expect(isValidAvatarDataUrl("data:image/png;base64,@@@")).toBe(false);
    expect(isValidAvatarDataUrl("")).toBe(false);
    expect(isValidAvatarDataUrl(null)).toBe(false);
    expect(isValidAvatarDataUrl(42)).toBe(false);
  });

  it("recusa imagem grande demais, no limite exato passa", () => {
    const prefix = "data:image/png;base64,";
    expect(isValidAvatarDataUrl(prefix + "A".repeat(MAX_AVATAR_DATA_URL_LENGTH - prefix.length))).toBe(true);
    expect(isValidAvatarDataUrl(prefix + "A".repeat(MAX_AVATAR_DATA_URL_LENGTH - prefix.length + 1))).toBe(false);
  });
});

describe("computeSquareCrop", () => {
  it("foto horizontal corta os lados, vertical corta em cima e embaixo, quadrada fica inteira", () => {
    expect(computeSquareCrop(400, 200)).toEqual({ sx: 100, sy: 0, size: 200 });
    expect(computeSquareCrop(200, 500)).toEqual({ sx: 0, sy: 150, size: 200 });
    expect(computeSquareCrop(300, 300)).toEqual({ sx: 0, sy: 0, size: 300 });
  });
});

it("isAcceptedImageType só aceita jpeg, png e webp", () => {
  expect(isAcceptedImageType("image/png")).toBe(true);
  expect(isAcceptedImageType("image/gif")).toBe(false);
  expect(isAcceptedImageType("image/svg+xml")).toBe(false);
  expect(isAcceptedImageType("application/pdf")).toBe(false);
});
