-- Colunas que o front (editaliza_prot) lê e o baseline não tinha: perfil público do artista e do
-- proponente, e os critérios estruturados do edital usados pelo ranking e pelo resumo.
-- ADD COLUMN IF NOT EXISTS: seguro rodar sobre um banco que já tenha alguma delas.

ALTER TABLE "artist_data"
  ADD COLUMN IF NOT EXISTS "handle" text,
  ADD COLUMN IF NOT EXISTS "avatarUrl" text,
  ADD COLUMN IF NOT EXISTS "bio" text,
  ADD COLUMN IF NOT EXISTS "city" text,
  ADD COLUMN IF NOT EXISTS "state" text,
  ADD COLUMN IF NOT EXISTS "territoryScope" text,
  ADD COLUMN IF NOT EXISTS "coreLanguages" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "supportLanguages" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "experienceYears" integer,
  ADD COLUMN IF NOT EXISTS "profileLevel" text,
  ADD COLUMN IF NOT EXISTS "hasCnpjOrMei" boolean,
  ADD COLUMN IF NOT EXISTS "hasTechnicalFormation" boolean,
  ADD COLUMN IF NOT EXISTS "portfolioCompleteness" integer,
  ADD COLUMN IF NOT EXISTS "badges" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "works" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "savedEditalIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "likedEditalIds" jsonb NOT NULL DEFAULT '[]'::jsonb;

-- O front grava o perfil do artista sem senha (a credencial mora em user_data).
ALTER TABLE "artist_data" ALTER COLUMN "password" DROP NOT NULL;

ALTER TABLE "proposer_data"
  ADD COLUMN IF NOT EXISTS "handle" text,
  ADD COLUMN IF NOT EXISTS "bio" text,
  ADD COLUMN IF NOT EXISTS "city" text,
  ADD COLUMN IF NOT EXISTS "state" text;

ALTER TABLE "editals_data"
  ADD COLUMN IF NOT EXISTS "territoryScope" text,
  ADD COLUMN IF NOT EXISTS "city" text,
  ADD COLUMN IF NOT EXISTS "state" text,
  ADD COLUMN IF NOT EXISTS "requiredLanguages" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "acceptedLanguages" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "requiresPortfolio" boolean,
  ADD COLUMN IF NOT EXISTS "requiresCnpj" boolean,
  ADD COLUMN IF NOT EXISTS "requiresTechnicalFormation" boolean,
  ADD COLUMN IF NOT EXISTS "minExperienceYears" integer,
  ADD COLUMN IF NOT EXISTS "targetProfileLevels" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "plainSummary" jsonb;
