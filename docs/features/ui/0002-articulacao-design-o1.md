# Articulação de design (O1)

**Status:** em-desenvolvimento
**Responsabilidade:** ui
**Branch:** feature/ui-02/articulacao-design-o1
**Autor:** BugRed · **Data:** 2026-11-16

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica, onda de design sem banco
- [x] service — não se aplica, sem regra de negócio
- [x] controller — não se aplica
- [x] route — não se aplica: nenhuma rota nova (o endpoint `/prototipo` foi removido)
- [x] ui — atoms e molecules em `src/shared/components/`, tokens em `globals.css`
- [x] teste — comportamento dos atoms e molecules; qualquer teste roda interno, em Docker
- [x] doc — mapa de telas e fluxo em `docs/`
<!-- /kit:camadas -->

**Próximo passo:** usuário sobe o banco local (`docs/ops/ambiente.md`), loga e confere feed e login no navegador; definir como aprovar as telas 4–15, já que o `/prototipo` foi removido; depois `/fechar` de novo.

## Problema / motivação
A O1 do roadmap (`plano.md` §6.0) é a primeira onda: design fechado antes de qualquer tela entrar
no ar. Hoje há tokens Sol & Mar (cherry-pick de `feature/ui-01`) e um protótipo (`editaliza_prot`)
com UX útil e código que não pode ser portado por cópia (§11.3). Falta o mapa de todas as telas, o
protótipo navegável aprovado e os atoms/molecules sobre os tokens.

## Escopo
**Entra:**
- Design system fechado: tokens claro e escuro, atoms e molecules (`primary-soft`, `accent-soft`,
  `border-subtle`, foco visível acrescentados dos do protótipo).
- Mapa e fluxo de todas as telas (§10) com a ordem de portagem.
- Protótipo navegável para o usuário aprovar.
- `/feed` e login usando só tokens; nenhuma cor ou raio literal fora de `globals.css`.

**Não entra (fora de escopo):**
- Organismos de tela completos, Prisma, Better Auth, deploy (O2).
- Motor do protótipo (`artistrank.ts`) e qualquer score na UI (§6.0: sem porcentagem até a O4).

## Restrição de ambiente
Qualquer teste ou verificação desta onda roda **interno, em Docker**: nada de serviço externo
(Supabase, APIs) nem banco instalado no host. `npm run test:docker` constrói `Dockerfile.test` e
roda o Vitest com `network_mode: none`. A config (Vitest 4, jsdom, Testing Library, `globals`)
espelha a do `editaliza_true`. `npm test` também funciona no host, para iterar rápido.

## Comportamento / fluxos
A definir no mapa de telas (entregável 1).

## Impacto técnico
- **Banco:** nenhum.
- **API:** nenhuma.
- **UI:** `src/app/globals.css`, `src/shared/components/{atoms,molecules}`, `/feed` e login.

## Regras de negócio relacionadas
Nenhuma regra nova. Match e score ficam na O4 ([`plano.md`](../../../plano.md) §6.0).

## Critérios de aceite

<!-- kit:criterios -->
- [x] Mapa de telas e fluxo aprovado pelo usuário
- [ ] Protótipo navegável aprovado pelo usuário
- [x] `/feed` e login usam só tokens; nenhuma cor/raio literal fora de `globals.css`
- [x] Atoms e molecules testados (comportamento) e `yarn lint` passando
<!-- /kit:criterios -->

## Dívida / não exercitado
- `Dockerfile.test` usa `npm install`, não `npm ci`: o lock gerado no host omite `@emnapi/*`
  (wasm opcional) e o `npm ci` o rejeita, mesmo com o mesmo npm. Não é reprodutível por lock.
- Tema escuro definido nos tokens, mas sem verificação visual (só claro foi visto).
- `Avatar` usa `<img>` e não `next/image` (origem arbitrária); regra do ESLint desligada na linha.

- **Cadastro não grava nada:** a UI valida (e-mail, senha de 8+ com número, consentimento) e segue
  para `/login`; a conta só é criada com o Better Auth (O2). O cadastro antigo fazia o mesmo e
  ainda dava `console.log` da senha, removido.
- Senha mínima passou de 6 (regex antiga) para 8 + 1 número, que era o `minLength` do campo.
- Logo `/logoLogin.png` não existe mais no repo: o card usa o nome em texto.
- `AuthForm` e `loginForm.tsx` antigos, sem uso, foram removidos.

- **Endpoint `/prototipo` removido (2026-11-16, a pedido do usuário):** dados fixos em rota do app são risco de ir a produção. Ficam os organismos das telas 4–15 em `src/shared/components/organisms/`, testados e **sem rota** (código ainda sem uso, até a onda de cada tela), e os dados de exemplo em `src/shared/fixtures/`. O `middleware.ts` voltou ao que era.
- **Correção de rumo (2026-11-16):** a primeira versão partiu dos tokens da `ui-01` e de componentes
  inventados, sem ler o visual do `editaliza_prot`. Refeita sobre o protótipo: paleta e Roboto
  copiadas dele (`--color-primary-ink`, `accent-ink`, `surface-subtle`, `line-strong`…), shell em
  três colunas (menu, feed de 640px com cabeçalho fixo, coluna de busca de artistas), card de feed
  estilo post (cabeçalho com iniciais, capa 16:9 ou fallback em degradê, selo, "Continuar lendo",
  curtir/salvar/compartilhar, "Inscrever-se"), login com barra em degradê e marca de sol. Isto
  **supera** a decisão do plano §11.1 de manter os tokens da `ui-01`.
- Tema escuro automático removido (o protótipo é só claro); `data-theme="dark"` ficou como opção
  manual, sem tela de teste nem seletor.
- Capas e avatares do protótipo copiados para `public/images/` (redimensionados: 784 KB no total).
- Curtir e salvar do card mudam só estado local (o protótipo usava um store social no cliente,
  descartado no plano §11.3).

- **Banco local em Docker** (`docker-compose.dev.yml`): o Supabase do `.env` não existe mais (tenant
  não encontrado no pooler). O gateway nginx remove `Authorization` porque o PostgREST sem segredo
  JWT recusa o token do `supabase-js`. Sem RLS. O `.env.local` criado aqui sobrepõe o `.env`.
- Login exercitado contra o stack local: 200 para as duas contas do seed, 401 para senha errada,
  `/api/data` com 3 editais. **Não** testado contra o Supabase real.

## Decisões em aberto
- Nenhuma. (Protótipo como páginas Next com dados fixos: decidido e aprovado.)
