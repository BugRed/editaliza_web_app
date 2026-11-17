#!/usr/bin/env node
// Rasteriza a marca (gerada por build-brand.py) nos formatos de navegador e celular.
// Uso: node scripts/brand/rasterize.mjs        (depende de `sharp`, que já vem com o Next)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const build = path.join(root, 'scripts/brand/.build');
const png = async (svgPath, size, height = size) =>
  sharp(await readFile(svgPath), { density: 384 }).resize(size, height).png({ compressionLevel: 9 }).toBuffer();

// ICO com entradas PNG (aceito por todos os navegadores atuais).
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = 6 + entries.length * 16;
  const dir = entries.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.data)]);
}

const app = path.join(root, 'src/app');
const icons = path.join(root, 'public/icons');
await mkdir(icons, { recursive: true });

const mark = path.join(root, 'public/brand/mark.svg');
await writeFile(path.join(app, 'favicon.ico'), buildIco(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(mark, size) })))));
await writeFile(path.join(app, 'apple-icon.png'), await png(path.join(build, 'apple-icon.svg'), 180));
await writeFile(path.join(icons, 'icon-192.png'), await png(mark, 192));
await writeFile(path.join(icons, 'icon-512.png'), await png(mark, 512));
await writeFile(path.join(icons, 'maskable-512.png'), await png(path.join(build, 'maskable.svg'), 512));

const og = await png(path.join(build, 'og.svg'), 1200, 630);
await writeFile(path.join(app, 'opengraph-image.png'), og);
await writeFile(path.join(app, 'twitter-image.png'), og);
await writeFile(path.join(app, 'opengraph-image.alt.txt'), 'Editaliza: editais culturais, em linguagem simples.\n');
await writeFile(path.join(app, 'twitter-image.alt.txt'), 'Editaliza: editais culturais, em linguagem simples.\n');
console.log('ok: favicon.ico, apple-icon, ícones do app e og-image');
