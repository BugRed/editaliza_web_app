# Changelog

Impacto externo por entrega; app não versiona build. Novo no topo.

## 2026-10-18 — chore/infra-01: envs server-only, fim do NEXT_PUBLIC_

- **Contrato de env sem `NEXT_PUBLIC_`** — `SUPABASE_URL` + `SUPABASE_API_KEY` (publishable key `sb_publishable_…`, sucessora da anon, mesmas RLS) obrigatórias; `DATABASE_URL`/`DIRECT_URL`/`BETTER_AUTH_*` opcionais até a W1. Boot segue validando com zod no mesmo ponto. CI e `.env.example` no contrato novo; migrations passam a ler a `DIRECT_URL` (pooler sessão). Contrato vivo em [`docs/ops/ambiente.md`](docs/ops/ambiente.md).
- **Vazamento fechado no login** — o `AuthProvider` importava `auth-service` → client Supabase dentro da página `/login`: URL + chave iam para o bundle e a consulta de credenciais rodava no navegador (senha em texto plano como filtro de PostgREST). Auth passa pela borda HTTP: `POST /api/auth/login` (pública no middleware) e `GET /api/auth/me` (protegida); `useAuth` só fala HTTP. Middleware verifica o token com módulo puro (`shared/lib/auth-token`) — o bundle do middleware cai de 90.5 kB para 34.5 kB.
- **Guarda `server-only`** — `env.ts`, client Supabase e `auth-service` importam o pacote: import a partir de código de cliente vira erro de build, não `undefined` silencioso. Foi ela que revelou o vazamento do login. Grep no `.next/static`: zero traços de Supabase.
- **`/`, `/feed` e `/teste` buscam a própria origem** — `NEXT_PUBLIC_BASE_URL` era configuração morta (os fallbacks já resolviam same-origin em dev e prod); fetch relativo, sem env.
- Corrigido no caminho: `verifyToken` do W0 rejeita timestamp ausente/inválido (NaN passava) e lê email com hífen (parse a partir do fim).

## 2026-10-13 — fix/dep-01: deploy na Vercel desbloqueado

- **Next.js 15.4.6 → 15.5.27** — a Vercel bloqueou o build por versão vulnerável. A linha 15.4.x não recebe patch desde jan/2026; 15.5 é o backport mantido do v15 (cobre React2Shell + releases de segurança de mai e ago/2026). `eslint-config-next` na mesma versão. Aviso: 15.5 deprecia `next lint` (removido no 16 — codemod `next-lint-to-eslint-cli` quando do upgrade).
- **`allowScripts` no `package.json`** — npm ≥ 12 só executa install script de pacote aprovado; os três da toolchain (`@tailwindcss/oxide`, `sharp`, `unrs-resolver`) aprovados pinados por versão, sumindo os warnings de install-scripts do build.
- **`npm audit` de 25 para 7 advisories** — bumps de lockfile (`tar` crítica, `ws`, `brace-expansion`, `picomatch`, `postcss`). Os 7 que restam são só-dev ou aninhados ao próprio `next` (dívida registrada).
- **Lint zerado** (43 warnings em 12 arquivos): imports mortos de ícones/tipos, `SafeImage` duplicado e nunca usado em `/` e `/teste`, tipos `HeaderProps`/`FooterProps` órfãos, estados mortos (`hasSaveInteracted`, `setIsMoreOpen`), `catch (error)` sem uso, `checkAuth` movido para dentro do `useEffect` (mesma semântica, cala o `exhaustive-deps`). ESLint ganha `ignoreRestSiblings` para o padrão omit-via-rest. Build local: ✓ compilado sem warnings.

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
