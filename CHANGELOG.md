# Changelog

Impacto externo por entrega; app não versiona build. Novo no topo.

## 2026-10-13 — W0: correções urgentes e higiene (spec 0001, `bugfix/auth-01`)

- **`/api/*` exige sessão** — 401 em JSON sem cookie; `/api/health` (nova) é a única aberta, para liveness.
- **Vazamento de senhas fechado** — `/api/users`, `/api/data`, `/api/artists` e `/api/proposers` devolviam a coluna `password` (e `cpf`) de todos os registros para qualquer visitante; agora selecionam colunas explícitas.
- **Middleware passa a valer** — estava na raiz, onde o Next 15 com app em `src/` não o lê; movido para `src/middleware.ts`, o que também fez as páginas exigirem login de verdade.
- Env validada com zod no boot (`src/shared/lib/env.ts`); `.env.example` versionado.
- CI real: lint + typecheck + build em PR e push para `master` (o anterior era de outro template e nunca rodaria aqui).
- Corrigidos: bug de `commentsError` em `/api/data`; hooks condicionais no card "mais" do feed; removidas as páginas falsas de OAuth (voltam com Better Auth, W1).
