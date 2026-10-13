#!/usr/bin/env node
// Seed dos mocks: lê mock/*.csv e popula as tabelas de forma idempotente
// (ON CONFLICT ("id") DO NOTHING — rodar 2× não duplica).
import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL não definida — copie .env.example para .env e aponte para o banco.');
  process.exit(1);
}

const sql = postgres(url, { prepare: false, onnotice: () => {} });

// Colunas jsonb: o CSV guarda texto JSON, mas o driver só serializa objeto —
// string crua viraria jsonb escalar do tipo "string" (dupla codificação)
const COLUNAS_JSON = new Set(['listComment', 'listTags', 'listEdital']);

// Ordem das inserções segue a leitura lógica dos dados (as referências entre
// tabelas não são FK — ver baseline —, mas a ordem mantém o seed previsível)
const FONTES = [
  ['mock/user_data.csv', 'user_data'],
  ['mock/proposer_data.csv', 'proposer_data'],
  ['mock/tags_data.csv', 'tags_data'],
  ['mock/editals.csv', 'editals_data'],
  ['mock/artist_data.csv', 'artist_data'],
  ['mock/comments.csv', 'comments_data'],
];

// Nomes de tabela/coluna vêm deste arquivo e dos cabeçalhos dos CSVs (dado do
// repo, não de usuário), mas o saneamento garante que um cabeçalho torto não
// vire SQL — valores seguem sempre parameterizados via sql(obj, colunas).
const identificador = (nome) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(nome)) {
    throw new Error(`Nome de tabela/coluna inválido no seed: ${nome}`);
  }
  return `"${nome}"`;
};

try {
  for (const [arquivo, tabela] of FONTES) {
    const rows = parse(await readFile(arquivo, 'utf8'), { columns: true });
    let inseridas = 0;

    for (const row of rows) {
      const colunas = Object.keys(row);
      // Campo vazio no CSV vira NULL, não string vazia
      const valores = Object.fromEntries(
        colunas.map((coluna) => {
          const bruto = row[coluna] === '' ? null : row[coluna];
          const valor = bruto !== null && COLUNAS_JSON.has(coluna)
            ? JSON.parse(bruto)
            : bruto;
          return [coluna, valor];
        })
      );

      const resultado = await sql`
        insert into ${sql.unsafe(identificador(tabela))} ${sql(valores, colunas)}
        on conflict ("id") do nothing
        returning "id"
      `;
      inseridas += resultado.length;
    }
    console.log(`${tabela}: ${inseridas} inserida(s), ${rows.length - inseridas} já existia(m)`);
  }
} finally {
  await sql.end();
}
