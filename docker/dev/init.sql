-- Papéis que o PostgREST espera. `anon` é o que o app usa (como a publishable key do Supabase).
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'authenticator';
GRANT anon TO authenticator;

GRANT USAGE ON SCHEMA public TO anon;
-- Tabelas criadas depois (pelas migrations, rodadas como `postgres`) já nascem acessíveis.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
