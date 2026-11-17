# ADR 0020 — A fonte de dados é uma env: mock em produção, Docker no local

**Status:** Aceito · 2026-11-16

## Contexto

O Supabase do `.env` não existe mais (tenant não encontrado no pooler) e o usuário decidiu **adiar o
Supabase**: por enquanto a produção (Vercel) roda sem banco, e o desenvolvimento local é **sempre** o
Postgres + PostgREST do Docker. Trocar para o Supabase depois tem de ser barato ("é só mudar o caminho").
O protótipo tinha um modo sem banco, mas com tabelas escritas à mão em código e **senhas em texto puro**
dentro do client; ele foi removido por isso e não serve de base.

## Decisão

1. Toda leitura e escrita de dados passa por `supabase` em `src/app/lib/supabase/client.ts`. As rotas
   não sabem o que há atrás.
2. A env `DATA_SOURCE` escolhe o que há atrás: `mock` ou `supabase` (qualquer backend PostgREST
   compatível: o Docker local hoje, o Supabase depois). Sem a variável: **produção usa `mock`, o resto
   usa `supabase`** (Docker). Trocar de fonte é mudar a env, sem tocar em rota.
3. O **mock** (`src/server/db/mock/`) é um query-builder em memória que imita só o que o app usa
   (`select`, `insert`, `update`, `eq`, `single`) e falha alto em qualquer outro método.
4. O **seed é um só**: `mock/*.csv`. O Docker o carrega por `db/seed.mjs` (`yarn dev:db:setup`); o mock o
   lê em runtime. A tipagem das colunas mora em `db/seed-columns.json`, lida pelos dois. As senhas do
   CSV são de exemplo e legíveis para o dev; o banco e o mock só guardam o hash.
5. `next.config.ts` declara `outputFileTracingIncludes` para os CSVs, senão a função da Vercel não os leva.
6. `SUPABASE_URL` e `SUPABASE_API_KEY` só são exigidas com `DATA_SOURCE=supabase`; `AUTH_SECRET` é
   exigida sempre. Tudo validado no boot (`src/shared/lib/env.ts`).

## Alternativas rejeitadas

- **Mock só por ausência das envs do Supabase (como o protótipo):** vira produção em mock sem ninguém
  ter decidido, por um deploy com variável esquecida.
- **Mock também no local:** o usuário quer o local sempre em Docker, igual ao que será o banco real.
- **Banco de arquivo ou KV na Vercel agora:** é o "caminho" que o usuário quer adiar; seria trabalho
  descartado quando entrar o Supabase.
- **Dado do mock em TypeScript:** duplicaria o seed e o Docker passaria a divergir do mock.

## Consequências

- ➕ Produção sobe sem banco e sem custo; a troca para o Supabase é só uma env.
- ➕ Dev e produção partem do mesmo seed.
- ➖ **Escrita no mock não persiste:** cada instância da função tem a sua memória, e ela some no cold
  start. Cadastro, edição de perfil e publicação de edital funcionam na instância que os recebeu e
  podem sumir ou não aparecer em outra. Só as contas do seed são estáveis. Serve para demonstração.
- ➖ O query-builder do mock é uma segunda implementação a manter; o teste `mock.test.ts` fixa o contrato.
- ⚠️ Sinal para rever: usar a produção para algo além de demonstração, ou começar a perder cadastros.
