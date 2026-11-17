import 'server-only';
import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import seedColumns from '@db/seed-columns.json';
import { hashPassword } from '@db/password.mjs';

export type Row = Record<string, unknown>;
export type MockDb = Record<string, Row[]>;

// Mesma fonte do seed do Docker (mock/*.csv): um dado só para dev local e para o mock de produção.
const SEED_FILES: Record<string, string> = {
  user_data: 'user_data.csv',
  proposer_data: 'proposer_data.csv',
  tags_data: 'tags_data.csv',
  editals_data: 'editals.csv',
  artist_data: 'artist_data.csv',
  comments_data: 'comments.csv',
};

const JSON_COLUMNS = new Set<string>(seedColumns.json);
const NUMBER_COLUMNS = new Set<string>(seedColumns.number);
const BOOLEAN_COLUMNS = new Set<string>(seedColumns.boolean);

export const TABLES_WITH_UNIQUE_EMAIL = new Set(['user_data', 'artist_data', 'proposer_data']);

/** Colunas jsonb NOT NULL por tabela: sem valor, nascem como lista vazia (o default do Postgres). */
export const EMPTY_LIST_COLUMNS: Record<string, string[]> = {
  user_data: ['listComment'],
  artist_data: ['listComment', 'listTags', 'coreLanguages', 'supportLanguages', 'badges', 'works', 'savedEditalIds', 'likedEditalIds'],
  proposer_data: ['listComment', 'listEdital'],
  editals_data: ['listTags', 'listComment', 'requiredLanguages', 'acceptedLanguages', 'targetProfileLevels'],
};

export function coerceValue(column: string, raw: string): unknown {
  if (raw === '') return null;
  if (JSON_COLUMNS.has(column)) return JSON.parse(raw);
  if (NUMBER_COLUMNS.has(column)) return Number(raw);
  if (BOOLEAN_COLUMNS.has(column)) return raw === 'true' || raw === 't';
  return raw;
}

export function coerceRow(record: Record<string, string>): Row {
  return Object.fromEntries(Object.entries(record).map(([column, raw]) => [column, coerceValue(column, raw)]));
}

async function loadTable(table: string, file: string): Promise<Row[]> {
  const text = await readFile(path.join(process.cwd(), 'mock', file), 'utf8');
  const records = parse(text, { columns: true }) as Array<Record<string, string>>;
  const rows = records.map(coerceRow);
  // O CSV tem a senha de exemplo legível; em memória ela já é hash, como no banco depois do seed.
  for (const row of rows) {
    const plain = row[seedColumns.password];
    if (typeof plain === 'string') row[seedColumns.password] = await hashPassword(plain);
  }
  return rows;
}

async function loadDb(): Promise<MockDb> {
  const entries = await Promise.all(Object.entries(SEED_FILES).map(async ([table, file]) => [table, await loadTable(table, file)] as const));
  return Object.fromEntries(entries);
}

// globalThis: sobrevive ao hot reload do `next dev`. Em produção (Vercel) vive enquanto a instância
// da função viver: escritas NÃO persistem entre instâncias nem entre cold starts.
const globalForMock = globalThis as typeof globalThis & { __editalizaMockDb?: Promise<MockDb> };

export function getMockDb(): Promise<MockDb> {
  return (globalForMock.__editalizaMockDb ??= loadDb());
}

export function resetMockDb(): void {
  globalForMock.__editalizaMockDb = undefined;
}
