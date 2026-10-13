-- Baseline v1: espelha as tabelas *_data do Supabase, derivado dos cabeçalhos
-- de mock/*.csv e das interfaces em src/app/types (derivação documentada em
-- docs/db/modelo-de-dados.md; conferência contra o schema real pendente).
--
-- Sem FKs de propósito: os próprios dados carregados no Supabase têm referências
-- penduradas (editals.listTags cita tag 3 inexistente em tags_data; comments.user
-- cita 203, que é artist_data) — o schema real, portanto, não as exige. Colunas
-- de referência ficam bigint puro; FKs voltam quando o domínio for renomeado (W7).

CREATE TABLE "user_data" (
  "id" bigserial PRIMARY KEY,
  "password" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "imgUrl" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "userType" text,
  "listComment" jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE "proposer_data" (
  "id" bigserial PRIMARY KEY,
  "password" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "imgUrl" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "userType" text,
  "listComment" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "cnpj" text,
  "listEdital" jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE "tags_data" (
  "id" bigserial PRIMARY KEY,
  "name" text NOT NULL,
  "description" text,
  "color" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "editals_data" (
  "id" bigserial PRIMARY KEY,
  "title" text NOT NULL,
  "description" text,
  "publishDate" timestamptz,
  "endDate" timestamptz,
  "status" text NOT NULL DEFAULT 'OPEN',
  "inscriptionLink" text,
  "completeEditalLink" text,
  "imgCoverUrl" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "proposer" bigint,
  "listTags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "listComment" jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE "artist_data" (
  "id" bigserial PRIMARY KEY,
  "password" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "imgUrl" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "userType" text,
  "listComment" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "cpf" text,
  "listTags" jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE "comments_data" (
  "id" bigserial PRIMARY KEY,
  "authorName" text NOT NULL,
  "content" text NOT NULL,
  "approved" boolean NOT NULL DEFAULT false,
  "status" text NOT NULL DEFAULT 'PENDING',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "user" bigint,
  "edital" bigint
);
