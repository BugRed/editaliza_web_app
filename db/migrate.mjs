#!/usr/bin/env node
// Runner de migrations: aplica db/migrations/*.sql em ordem, cada uma dentro de
// uma transação, registrando nome+hash em _migrations. Rodar de novo não aplica
// nem erroa; migration já registrada que mudou de conteúdo reprova o comando.
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

// Migração roda no pooler em modo sessão (DIRECT_URL): o modo transação do
// pgBouncer (DATABASE_URL) não dá as garantias de sessão que DDL espera.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error('DIRECT_URL (ou DATABASE_URL) não definida — copie .env.example para .env e aponte para o banco.');
  process.exit(1);
}

// R8: pooler do Supabase em modo transação não aceita prepared statements.
// onnotice silenciado: o "IF NOT EXISTS already exists" da _migrations em
// segunda execução é ruído, não informação.
const sql = postgres(url, { prepare: false, onnotice: () => {} });
const dir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

try {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  await sql`CREATE TABLE IF NOT EXISTS "_migrations" (
    "name" text PRIMARY KEY,
    "hash" text NOT NULL,
    "applied_at" timestamptz NOT NULL DEFAULT now()
  )`;

  for (const file of files) {
    const content = await readFile(join(dir, file), 'utf8');
    const hash = createHash('sha256').update(content).digest('hex');
    const applied = await sql`SELECT "hash" FROM "_migrations" WHERE "name" = ${file}`;

    if (applied.length > 0) {
      if (applied[0].hash !== hash) {
        console.error(`${file}: conteúdo diverge do registrado em _migrations — migration aplicada não se edita; crie uma nova.`);
        process.exit(1);
      }
      continue;
    }

    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`INSERT INTO "_migrations" ("name", "hash") VALUES (${file}, ${hash})`;
    });
    console.log(`aplicada: ${file}`);
  }
  console.log('migrations em dia.');
} finally {
  await sql.end();
}
