# Ambiente e envs

Contrato de variáveis do app — validadas no boot por
[`src/shared/lib/env.ts`](../../src/shared/lib/env.ts) (zod; falta ou formato
errado derruba o boot, nunca quebra em runtime). Fontes: `.env` local
(gitignored) e `.env.example` versionado como referência.

**Regra central: nenhuma env é `NEXT_PUBLIC_`.** Consumidor de env é sempre
server-side (rotas de API, middleware, scripts). A garantia não é convenção:
`env.ts`, o client Supabase e o `auth-service` importam o pacote `server-only` —
import a partir de código de cliente vira **erro de build**, não valor
`undefined` em produção.

| Variável | Obrigatória | Consumidor | Notas |
|---|---|---|---|
| `SUPABASE_URL` | app | client PostgREST (`src/app/lib/supabase/client.ts`) | ref do projeto |
| `SUPABASE_API_KEY` | app | idem | publishable key nova (`sb_publishable_…`), sucessora da anon key; roda sob as mesmas RLS |
| `DATABASE_URL` | scripts hoje, app na W1 | `db/seed.mjs` | pooler **transação** (`?pgbouncer=true`; driver com `prepare: false`) |
| `DIRECT_URL` | `db:migrate` | `db/migrate.mjs` | pooler **sessão** — DDL; fallback para `DATABASE_URL` se ausente |
| `BETTER_AUTH_URL` / `BETTER_AUTH_SECRET` | a partir de T1.2 | Better Auth | secret com `openssl rand -base64 32` |

## Onde rodar

- **Local:** `.env` preenchido (`.env.example` como molde) → `yarn dev`.
  Migrations: `yarn db:migrate` (lê `DIRECT_URL`); seed: `yarn db:seed`.
- **CI (`.github/workflows/pr.yml`):** placeholders — o build valida o boot,
  não conecta em nada.
- **Vercel/produção:** as quatro variáveis reais como project env. Nenhuma
  precisa ser "exposed to client" — todo consumo é server-side.

## Variáveis obrigatórias

O app **não sobe** sem `SUPABASE_URL` e `SUPABASE_API_KEY` (validadas em `src/shared/lib/env.ts`, falham no boot).
O protótipo tinha um modo sem banco, com tabelas em memória; ele foi removido porque carregava senhas no código.
Para desenvolver sem a nuvem, use o banco local abaixo.

## Banco local em Docker

Alternativa ao Supabase da nuvem, sem rede: Postgres 17 + PostgREST + um nginx que expõe
`/rest/v1` (o caminho do `supabase-js`). Só para desenvolvimento.

```bash
cp .env.docker.example .env.local   # o Next carrega .env.local por cima do .env
yarn dev:db                      # sobe db, postgrest e gateway (aguarda ficarem saudáveis)
yarn dev:db:setup                # migrations + seed + recarrega o schema do PostgREST
yarn dev                         # reinicie se já estava rodando
```

Login de teste (vem de `mock/user_data.csv`): `maria.oliveira@email.com` / `senha_segura_2` e
`joao.silva@email.com` / `senha_segura_1` (ambos `ARTIST`). `yarn dev:db:down` para; `dev:db:reset`
apaga os dados. Para voltar ao Supabase da nuvem, apague `.env.local`.

Portas: 54321 (gateway REST) e 54322 (Postgres), só em `127.0.0.1`. O gateway tira o header
`Authorization` porque o PostgREST sem segredo JWT recusa qualquer token; tudo roda como `anon`.
Não há RLS aqui: não serve para validar políticas do Supabase.

## Testes

Rodam **em Docker, sem rede** (`network_mode: none`): `yarn test:docker` constrói
`Dockerfile.test` e executa o Vitest (jsdom + Testing Library). `yarn test` roda no host, só para
iterar. Nenhum teste toca Supabase ou serviço externo.

## Rotas de API abertas no middleware

Apenas `/api/health` (liveness) e `/api/auth/login` (porta de entrada da
sessão). Todo o resto de `/api/*` responde 401 em JSON sem token válido.
