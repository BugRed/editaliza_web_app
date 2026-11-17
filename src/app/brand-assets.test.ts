// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import manifest from "@/app/manifest";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file));

function pngSize(file: string): { width: number; height: number } {
  const buffer = read(file);
  expect(buffer.subarray(1, 4).toString()).toBe("PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

describe("arquivos da marca", () => {
  it("og-image e twitter-image têm 1200×630 e texto alternativo", () => {
    expect(pngSize("src/app/opengraph-image.png")).toEqual({ width: 1200, height: 630 });
    expect(pngSize("src/app/twitter-image.png")).toEqual({ width: 1200, height: 630 });
    expect(read("src/app/opengraph-image.alt.txt").toString().trim().length).toBeGreaterThan(10);
  });

  it("ícone Apple tem 180×180 e os ícones do app têm 192 e 512", () => {
    expect(pngSize("src/app/apple-icon.png")).toEqual({ width: 180, height: 180 });
    expect(pngSize("public/icons/icon-192.png")).toEqual({ width: 192, height: 192 });
    expect(pngSize("public/icons/icon-512.png")).toEqual({ width: 512, height: 512 });
    expect(pngSize("public/icons/maskable-512.png")).toEqual({ width: 512, height: 512 });
  });

  it("favicon.ico traz as três resoluções (16, 32 e 48)", () => {
    const ico = read("src/app/favicon.ico");
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    expect([0, 1, 2].map((i) => ico.readUInt8(6 + i * 16))).toEqual([16, 32, 48]);
  });

  it.each(["src/app/icon.svg", "public/brand/mark.svg", "public/brand/mark-dark.svg", "public/brand/logo.svg", "public/brand/logo-dark.svg"])(
    "%s está em curvas: sem <text>, então não depende de fonte instalada",
    (file) => {
      const svg = read(file).toString();
      expect(svg).toContain("<svg");
      expect(svg).not.toMatch(/<text[\s>]/);
      expect(svg).not.toMatch(/font-family/);
    }
  );

  it("o ícone do navegador troca de cor no tema escuro do sistema", () => {
    expect(read("src/app/icon.svg").toString()).toContain("prefers-color-scheme:dark");
  });
});

describe("manifest", () => {
  const data = manifest();

  it("identifica o app e usa as cores da marca", () => {
    expect(data.name).toBe("Editaliza");
    expect(data.theme_color).toBe("#0E7C86");
    expect(data.lang).toBe("pt-BR");
  });

  it("todo ícone declarado existe em public/", () => {
    expect(data.icons?.length).toBeGreaterThanOrEqual(3);
    for (const icon of data.icons ?? []) expect(existsSync(path.join(root, "public", icon.src))).toBe(true);
  });

  it("tem ícone mascarável, para o Android recortar sem cortar o símbolo", () => {
    expect((data.icons ?? []).some((icon) => icon.purpose === "maskable")).toBe(true);
  });
});
