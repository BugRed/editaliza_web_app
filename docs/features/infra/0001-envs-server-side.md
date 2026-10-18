# infra-01 — Envs server-only: fim do NEXT_PUBLIC_

**Status:** em-desenvolvimento
**Responsabilidade:** infra
**Branch:** chore/infra-01/envs-server-side
**Autor:** BugRed · **Data:** 2026-10-18

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é
> o que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica: nenhum schema/migration; só o runner `db/migrate.mjs` troca a conexão (DIRECT_URL, modo sessão)
- [x] service — `auth-service` reescrito server-only, delegando o token a `shared/lib/auth-token`
- [x] controller — não se aplica: `/api/auth/*` delega direto ao service, como as rotas existentes
- [x] route — `/api/auth/login` (pública no middleware) e `/api/auth/me` (protegida) novas
- [x] ui — `useAuth` fala HTTP com `/api/auth/*`; `/`, `/feed` e `/teste` buscam a própria origem (fetch relativo)
- [x] teste — não se aplica como suite (sem runner no repo); gate = lint + typecheck + build + smoke HTTP local (health/login/me/401s)
- [x] doc — `docs/ops/ambiente.md` (novo), CHANGELOG, dívida e progresso no mesmo corte
<!-- /kit:camadas -->

**Próximo passo:** Usuário valida o login ponta-a-ponta com rede (`npm run dev` → logar → `/feed` carrega) e faz push/PR. A `SUPABASE_URL` do `.env` foi derivada do ref do `DATABASE_URL` — conferir na primeira execução.

## Problema / motivação

A env de Supabase vivia em `NEXT_PUBLIC_*` — nome que publica: qualquer módulo
client na cadeia de import embute URL e chave no bundle. E a cadeia existia de
fato: `/login` (client) → `useAuth` → `auth-service` → client Supabase, e o
middleware → `auth-service` → idem. A consulta de credenciais rodava no
navegador, com a senha em texto plano como filtro de PostgREST.

Com a troca para a publishable key (`sb_publishable_`), o contrato passa a ser
server-only — `createClient(url, key)` do supabase-js 2.56 segue exigindo URL,
então o contrato novo é `SUPABASE_URL` + `SUPABASE_API_KEY`. A guarda
`server-only` transformou o vazamento em erro de build e forçou a correção da
arquitetura de auth (UI → HTTP → service), que a regra do repo já pedia.

## Escopo

**Entra:**
- Contrato de env sem `NEXT_PUBLIC_`: `SUPABASE_URL` + `SUPABASE_API_KEY`
  (publishable) obrigatórias; `DATABASE_URL`/`DIRECT_URL`/`BETTER_AUTH_*`
  opcionais até a W1. Boot segue validando em `src/shared/lib/env.ts`.
- Guarda `server-only` (pacote) em `env.ts`, client Supabase e `auth-service`:
  import a partir de código de cliente vira erro de build.
- Auth pela borda HTTP: `POST /api/auth/login` (única rota de API pública além
  de `/api/health`) e `GET /api/auth/me`; `useAuth` só fala HTTP; middleware
  verifica o token com o módulo puro `shared/lib/auth-token` — o bundle do
  middleware cai de 90.5 kB para 34.5 kB (carregava supabase-js).
- `/`, `/feed`, `/teste`: fetch relativo — `NEXT_PUBLIC_BASE_URL` era
  configuração morta (os fallbacks já resolviam same-origin em dev e prod).
- `db/migrate.mjs` lê `DIRECT_URL` (pooler sessão) com fallback a
  `DATABASE_URL`; seed segue no pooler transação.
- `.env.example` e os placeholders do CI (`pr.yml`) no contrato novo.

**Não entra (fora de escopo):**
- Better Auth (T1.2) — formato do token e comparação de senha seguem as regras
  W0; só o transporte mudou (navegador → servidor).
- Migrar as rotas de dados para Postgres direto (`postgres`).
- Cookie httpOnly / logout server-side — a mecânica do cookie no cliente é
  preservada (mesma semântica W0).

## Comportamento / fluxos

- Login: browser → `POST /api/auth/login` → `authService.login` (server,
  publishable key) → token no cookie `auth-token` como antes; primeira carga
  monta o usuário via `GET /api/auth/me` (401 desloga e limpa o cookie).
- Middleware: mesmo token, mesma expiração (1h), agora verificado pelo módulo
  puro — `/api/auth/login` entra na lista pública.
- Bug de passagem corrigido: `verifyToken` rejeita timestamp ausente/inválido
  (NaN passava antes) e lê email com hífen (parse do fim, não do split simples).
- Páginas buscam `/api/*` da própria origem — sem env, sem baseUrl.

## Impacto técnico

- **Banco:** nenhum schema; runner de migrations troca a conexão de leitura.
- **API:** 2 rotas novas (`/api/auth/*`); middleware sem dependência de
  supabase/postgres; demais rotas inalteradas.
- **UI:** `useAuth`, `/login` (via AuthForm), `/`, `/feed`, `/teste` — contrato
  do hook inalterado (`user`/`login`/`logout`/`isLoading`).

## Regras de negócio relacionadas

Nenhuma em [`../negocio/`](../../negocio/) — transporte e configuração.

## Critérios de aceite

<!-- kit:criterios -->
- [x] Nenhuma env `NEXT_PUBLIC_` no código/CI — verificado: grep em `src/`, `.github/`, `next.config.ts`, `db/` (só o comentário de contexto em `env.ts`)
- [x] Build verde com a guarda `server-only` ativa — verificado: 17 rotas, middleware 34.5 kB; o erro de build login→service→client foi resolvido pela borda HTTP
- [x] Bundle estático sem traço de Supabase — verificado: grep em `.next/static/` não acha chave, ref nem "supabase"
- [x] Lint e typecheck verdes — verificado: "✔ No ESLint warnings or errors"; `tsc --noEmit` limpo
- [x] Smoke HTTP local — verificado: `/api/health` 200; `/api/auth/login` sem corpo 400; `/api/data` sem token e com token forjado 401; token válido atravessa o middleware (rota responde 500 por falta de rede até o Supabase — esperado no sandbox)
- [ ] Login ponta-a-ponta contra o Supabase real — **pendente de rede** (usuário, máquina local)
<!-- /kit:criterios -->

## Dívida / não exercitado

- Publishable key e `SUPABASE_URL` (derivada do ref do `DATABASE_URL`) não
  exercitados contra o Supabase real — ambiente de dev sem rede até lá.
- Auth legado segue até T1.2: senha comparada em texto plano (agora só no
  servidor), token base64 sem assinatura, cookie não-httpOnly.

## Decisões em aberto

- (decidida na execução) Branch empilhada em `fix/dep-01` — dep-01 limpou os
  mesmos arquivos de UI; empilhar evita conflito e PRs ficam sequenciais.
- (decidida na execução) `/api/auth/login` entra em `publicApiRoutes`;
  `/api/auth/me` fica protegida pelo middleware como todo `/api/*`.
- (decidida na execução) `verifyToken` endurecido (timestamp do fim, NaN
  rejeitado) — correção de bug de passagem no caminho, divulgada no resumo.
- (decidida na execução) Cookie segue setado pelo cliente — mexer nisso é
  decisão do Better Auth (T1.2), não desta feature.
