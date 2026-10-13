# Modelo de dados

Fonte da verdade do schema: `db/migrations/*.sql`, aplicadas por `db/migrate.mjs`
(registro em `_migrations`). Este arquivo documenta o modelo e as decisões da
derivação — o SQL não se repete aqui.

## Como recriar e semear (desenvolvimento)

```bash
docker run -d --rm --name editaliza-db -e POSTGRES_PASSWORD=test -p 5432:5432 postgres:17-alpine
export DATABASE_URL=postgres://postgres:test@localhost:5432/postgres
npm run db:migrate   # cria as tabelas + _migrations (idempotente)
npm run db:seed      # popula com mock/*.csv (idempotente)
```

## Tabelas (baseline v1 — `0001_baseline.sql`)

| Tabela | Papel | Particularidades |
|---|---|---|
| `user_data` | usuários (login e-mail/senha) | `email` UNIQUE; `password` em texto puro até T1.2 |
| `artist_data` | artista (mesmas colunas de user) | `cpf`; `listTags` jsonb |
| `proposer_data` | proponente PJ (mesmas colunas de user) | `cnpj`; `listEdital` jsonb |
| `editals_data` | editais | `proposer` bigint sem FK (ver decisão abaixo); `listTags`/`listComment` jsonb |
| `tags_data` | tags | — |
| `comments_data` | comentários | `user`/`edital` bigint sem FK; `approved` boolean; `status` |
| `_migrations` | infra do runner | nome + hash + `applied_at` |

## Decisões da derivação do baseline

- **Derivado dos CSVs + interfaces** (`mock/*.csv`, `src/app/types`): sem rede até o
  Supabase para exportar o schema real. O primeiro acesso com rede confere tipos,
  defaults e constraints; divergência vira migration de correção (dívida na spec
  `0001-migrations-versionadas`).
- **Sem FK de propósito**: os próprios dados carregados no Supabase têm referências
  penduradas (`editals.listTags` cita tag 3 inexistente; `comments.user` cita 203, que
  é `artist_data`). Colunas de referência ficam bigint puro; FKs voltam no rename de
  domínio (W7/D8).
- **Nomes camelCase com aspas**: espelham o que o app espera do PostgREST (selects
  explícitos desde a W0).
- **Colunas `list*` como jsonb**: o CSV guarda texto JSON; o seed faz `JSON.parse` —
  string crua viraria jsonb escalar do tipo `"string"` (dupla codificação).
- **`bigserial`**: os ids dos CSVs são inteiros pré-determinados (101, 201, 301…);
  o seed preserva os ids (`ON CONFLICT ("id") DO NOTHING`).

## Roadmap do schema

- **W1/T1.2**: tabelas do Better Auth nascem como migration nova sobre o baseline.
- **W2**: tabelas de ingestão (editais normalizados, fontes, PDFs, dedup).
- **W7/D8**: rename `artist_data`/`proposer_data` → agente cultural/organização, com
  FKs de verdade.
