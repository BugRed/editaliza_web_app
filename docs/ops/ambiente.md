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

## Fonte de dados e variáveis

A fonte vem de `DATA_SOURCE` ([ADR 0020](../adr/0020-fonte-de-dados-por-env-mock-em-producao-docker-no-local.md)):

| Onde | `DATA_SOURCE` | Dados |
|---|---|---|
| Local | `supabase` (padrão fora de produção) | Postgres + PostgREST do Docker, **sempre** |
| Produção (Vercel), por enquanto | `mock` (padrão em produção) | seed em memória (`mock/*.csv`) |
| Produção, depois | `supabase` | Supabase: **remover `DATA_SOURCE=mock` da Vercel**, definir `DATA_SOURCE=supabase` e as duas variáveis dele, sem tocar em rota (ver a dívida: o padrão de produção ainda é `mock`) |

`AUTH_SECRET` (32 caracteres ou mais) é **obrigatória em qualquer ambiente**, sem padrão; sem ela o app não sobe
([ADR 0021](../adr/0021-sessao-em-cookie-httponly-assinado-e-senha-com-scrypt.md)). `SUPABASE_URL` e
`SUPABASE_API_KEY` só valem com `DATA_SOURCE=supabase`. Exemplos: `.env.example` e `.env.docker.example`.

### Publicar na Vercel (mock)

0. `SITE_URL` = `https://editaliza-five.vercel.app` (o endereço público atual). Define a base dos links absolutos da og-image e dos ícones; sem ela vale o domínio de produção que a Vercel informa (`VERCEL_PROJECT_PRODUCTION_URL`), que pode ser o de um nome antigo do projeto. **Precisa existir também no Preview e já no build**, porque o `/login` é gerado estático. Depois de mudar, force um novo deploy e confira no Sharing Debugger do Facebook (raspar de novo) e no LinkedIn Post Inspector, que guardam a imagem antiga em cache.
1. Project → Settings → Environment Variables: `AUTH_SECRET` = saída de `openssl rand -base64 32`, nos
   ambientes Production e Preview. `DATA_SOURCE` é opcional (em produção o padrão já é `mock`).
2. Deploy. As contas de exemplo estão em `mock/user_data.csv` e `mock/proposer_data.csv`.
3. **Limite do mock:** escrita não persiste. Cada instância da função tem a sua memória e ela some no cold
   start, então um cadastro pode não valer na próxima requisição. É demonstração, não produção real.

### Fotos de perfil no Supabase Storage (opcional)

Por padrão (`PHOTO_STORAGE=inline`) a foto vai no próprio registro. Para guardá-la no Supabase Storage
([ADR 0022](../adr/0022-fotos-de-perfil-no-supabase-storage-com-fallback-no-registro.md)):

1. No painel do Supabase: **Storage → New bucket**, nome `avatars`, marcado como **Public**. Em *Restrict file size* use 200 KB
   e em *Allowed MIME types*, `image/jpeg, image/png, image/webp`.
2. Na Vercel, nos ambientes Production e Preview: `PHOTO_STORAGE=supabase`, `SUPABASE_URL`, e `SUPABASE_SERVICE_ROLE_KEY`
   (Project Settings → API → *service_role*, marcada **Sensitive**). `SUPABASE_STORAGE_BUCKET` só se o bucket tiver outro nome.
3. Redeploy. Sem as variáveis, o app **não sobe** (o contrato falha no boot), então o erro aparece no deploy, não no cadastro.

A chave de serviço dá acesso total ao projeto: nunca vai em `NEXT_PUBLIC_`, em arquivo versionado nem no navegador.
Local e mock seguem em `inline`: nem o Docker nem o mock têm Storage.

## Banco local em Docker

Local é **sempre** Docker: Postgres 17 + PostgREST + um nginx que expõe `/rest/v1` (o caminho do `supabase-js`).

```bash
command cp -f .env.docker.example .env.local   # .env.local sobrepõe o .env; já traz DATA_SOURCE e AUTH_SECRET de dev
yarn dev:db                                    # sobe db, postgrest e gateway (aguarda ficarem saudáveis)
yarn dev:db:setup                              # migrations + seed (senhas gravadas como hash) + recarrega o schema
yarn dev                                       # reinicie se já estava rodando
```

**O seed fica no repositório para todo dev usar:** `mock/*.csv` (dados) + `db/seed.mjs` (carga) +
`db/seed-columns.json` (tipos das colunas, lido também pelo mock). Rodar de novo não duplica.

Contas de exemplo (as senhas legíveis só existem nos CSVs; no banco ficam como hash):
`maria.oliveira@email.com` / `senha_segura_2` e `joao.silva@email.com` / `senha_segura_1` (artistas);
os proponentes estão em `mock/proposer_data.csv`.

`yarn dev:db:down` para; `yarn dev:db:reset` apaga os dados. **Banco criado antes do ADR 0021 tem senha em
texto puro, que o app não aceita mais: rode `yarn dev:db:reset`, `yarn dev:db` e `yarn dev:db:setup`.**
Para sair do Docker, apague o `.env.local` e configure o ambiente como na tabela acima.

Portas: 54321 (gateway REST) e 54322 (Postgres), só em `127.0.0.1`. O gateway tira o header `Authorization`
porque o PostgREST sem segredo JWT recusa qualquer token; tudo roda como `anon`. Não há RLS aqui.

## Testes

Rodam **em Docker, sem rede** (`network_mode: none`): `yarn test:docker` constrói
`Dockerfile.test` e executa o Vitest (jsdom + Testing Library). `yarn test` roda no host, só para
iterar. Nenhum teste toca Supabase ou serviço externo.

## Rotas de API abertas no middleware

Apenas `/api/health` (liveness) e `/api/auth/login` (porta de entrada da
sessão). Todo o resto de `/api/*` responde 401 em JSON sem token válido.
