# Changelog

Impacto externo por entrega; app não versiona build. Novo no topo.

## 2026-10-13 — W1/T1.1: migrations versionadas (spec dados/0001, `chore/db-01`)

- **Schema versionado no repo** — o banco deixa de viver só no console do Supabase: `db/migrations/0001_baseline.sql` (6 tabelas) + runner `db/migrate.mjs` (idempotente, transacional, registro em `_migrations`) + seed `db/seed.mjs` dos mocks (idempotente). Scripts `npm run db:migrate` e `npm run db:seed`.
- Baseline **sem FK de propósito** (os próprios dados reais têm referências penduradas) e derivado dos CSVs + tipos; fidelidade ao schema real fica de conferência com rede (dívida registrada).
- `mock/artist_data.csv` e `mock/editals.csv` normalizados para CSV válido — nenhum parser lia os originais (aspas internas sem escape, coluna vazia extra); valor parseado idêntico.

## 2026-10-13 — W0: correções urgentes e higiene (spec 0001, `bugfix/auth-01`)

- **`/api/*` exige sessão** — 401 em JSON sem cookie; `/api/health` (nova) é a única aberta, para liveness.
- **Vazamento de senhas fechado** — `/api/users`, `/api/data`, `/api/artists` e `/api/proposers` devolviam a coluna `password` (e `cpf`) de todos os registros para qualquer visitante; agora selecionam colunas explícitas.
- **Middleware passa a valer** — estava na raiz, onde o Next 15 com app em `src/` não o lê; movido para `src/middleware.ts`, o que também fez as páginas exigirem login de verdade.
- Env validada com zod no boot (`src/shared/lib/env.ts`); `.env.example` versionado.
- CI real: lint + typecheck + build em PR e push para `master` (o anterior era de outro template e nunca rodaria aqui).
- Corrigidos: bug de `commentsError` em `/api/data`; hooks condicionais no card "mais" do feed; removidas as páginas falsas de OAuth (voltam com Better Auth, W1).
