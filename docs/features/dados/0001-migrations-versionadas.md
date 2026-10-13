# Migrations versionadas (W1 · T1.1)

**Status:** em-desenvolvimento
**Responsabilidade:** dados
**Branch:** chore/db-01/migrations-versionadas
**Autor:** BugRed · **Data:** 2026-10-13

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — baseline `0001_baseline.sql` (6 tabelas) + runner `db/migrate.mjs` (`_migrations`, transações, idempotente) + seed `db/seed.mjs` dos mocks
- [x] service — não se aplica: sem regra de negócio nova
- [x] controller — não se aplica: sem fronteira HTTP
- [x] route — não se aplica: idem
- [x] ui — não se aplica: ferramenta de banco
- [x] teste — não se aplica como suite (repo sem runner); validação por execução real num Postgres 17/Alpine em Docker: recriação do zero, migrate 2×, seed 2×, jsonb tipado, falha sem DATABASE_URL
- [x] doc — `docs/db/modelo-de-dados.md` com schema, derivação e roadmap
<!-- /kit:camadas -->

**Próximo passo:** Push + PR são do usuário (commits feitos). Com rede até o Supabase: aplicar `db:migrate`/`db:seed` no banco real e conferir o baseline (ver Dívida). Depois, T1.2 (Better Auth).

## Problema / motivação

O schema vive só no console do Supabase — nada no repo recria o banco, e os mocks de
`mock/*.csv` foram carregados à mão (plano §2). Sem migration versionada, qualquer
mudança no Supabase é invisível ao git e o setup de um dev novo depende de cópia
manual. É a T1.1 do plano (W1), que destrava T1.2 (Better Auth cria tabelas próprias
via migration) e W2 (ingestão versiona o schema de editais).

## Escopo

**Entra:**
- `db/migrations/*.sql` com baseline das 6 tabelas atuais (`user_data`, `artist_data`,
  `proposer_data`, `editals_data`, `tags_data`, `comments_data`).
- Runner `db/migrate.mjs`: aplica pendentes em ordem, dentro de transação, registrando
  em `_migrations`; rodar de novo não faz nada (idempotente).
- Seed `db/seed.mjs`: lê `mock/*.csv` e popula; idempotente (`ON CONFLICT DO NOTHING`).
- Scripts `npm run db:migrate` e `npm run db:seed`.
- `docs/db/modelo-de-dados.md` com o schema e a regra de derivação do baseline.

**Não entra (fora de escopo):**
- Fidelidade total com o schema real do Supabase (export do console exige rede/ação do
  usuário) — baseline v1 derivado dos CSVs + tipos; conferência registrada como dívida.
- Better Auth e suas tabelas (T1.2 — nasce como migration nova em cima desta).
- RLS/travas no anon (T1.3), deploy (T1.4), renames de domínio (W7/D8).
- Trocar as rotas para service role (T1.3).

## Comportamento / fluxos

- `DATABASE_URL` apontando para um Postgres vazio → `npm run db:migrate` cria as 6
  tabelas + `_migrations`; rodar de novo não aplica nada.
- `npm run db:seed` popular com os mocks; rodar 2× não duplica.
- Sem `DATABASE_URL`, migrate/seed falham com mensagem clara apontando a variável.

## Impacto técnico

- **Banco:** cria o versionamento — nenhuma tabela nova de domínio (baseline espelha o
  que já existe no Supabase); `_migrations` é infra do runner.
- **API:** nenhuma rota muda.
- **UI:** nenhuma.

## Regras de negócio relacionadas

Nenhuma — schema espelha o estado atual, sem decisão de domínio nova (renames são W7/D8).

## Critérios de aceite

<!-- kit:criterios -->
- [x] `npm run db:migrate` recria o schema do zero num Postgres vazio — provado 2× em container Postgres 17/Alpine limpo (baseline aplicada, `_migrations` com 1 registro)
- [x] Migrate idempotente — segunda execução não aplica nem erroa; hash registrado protege migration editada
- [x] `npm run db:seed` popula os mocks (4+3+5+3+3+3 linhas); segunda execução insere 0
- [x] Sem `DATABASE_URL`: falha com mensagem que nomeia a variável (exit 1)
- [x] Baseline e modelo documentados em `docs/db/modelo-de-dados.md` (inclui decisões: sem FK, camelCase, jsonb, bigserial)
<!-- /kit:criterios -->

## Dívida / não exercitado

- Baseline derivado dos cabeçalhos dos CSVs + interfaces de `src/app/types` — **não
  conferido contra o schema real do Supabase** (ambiente sem rede). Primeiro acesso com
  rede (ou export do console) deve conferir tipos, defaults e constraints; divergência
  vira migration de correção.
- Exercitado em Postgres 17 local; o Supabase roda 15 — diferenças de versão são
  improváveis neste DDL simples, mas a primeira aplicação real confirma.
- `mock/artist_data.csv` e `mock/editals.csv` foram **normalizados para RFC-4180**
  (aspas internas escapadas como `""`; removida coluna vazia extra das linhas 201 e
  303) — o valor parseado é idêntico ao anterior; os arquivos originais não parseavam
  em nenhum leitor de CSV.

## Decisões em aberto

- (nenhuma — derivações anotadas acima)
