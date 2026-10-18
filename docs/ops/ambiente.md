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

- **Local:** `.env` preenchido (`.env.example` como molde) → `npm run dev`.
  Migrations: `npm run db:migrate` (lê `DIRECT_URL`); seed: `npm run db:seed`.
- **CI (`.github/workflows/pr.yml`):** placeholders — o build valida o boot,
  não conecta em nada.
- **Vercel/produção:** as quatro variáveis reais como project env. Nenhuma
  precisa ser "exposed to client" — todo consumo é server-side.

## Rotas de API abertas no middleware

Apenas `/api/health` (liveness) e `/api/auth/login` (porta de entrada da
sessão). Todo o resto de `/api/*` responde 401 em JSON sem token válido.
