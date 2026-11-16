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
- [ ] prisma — não se aplica, onda de design sem banco
- [ ] service — não se aplica, sem regra de negócio
- [ ] controller — não se aplica
- [ ] route — não se aplica
- [x] ui — atoms e molecules em `src/shared/components/`, tokens em `globals.css`
- [x] teste — comportamento dos atoms e molecules; qualquer teste roda interno, em Docker
- [x] doc — mapa de telas e fluxo em `docs/`
<!-- /kit:camadas -->

**Próximo passo:** usuário navega o protótipo em `/prototipo` e aprova (ou pede ajustes); depois, `/quality-check` e `/fechar`.

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

- **Protótipo em `/prototipo/*`:** 12 telas com dados fixos e inventados; o layout responde 404 em
  produção e o `middleware.ts` só o libera fora de produção. Esse 404 em produção **não foi
  exercitado** (sem `next build` nesta sessão).
- **Rotas do mapa só existem como `/prototipo/<rota>`** até a tela ir ao ar; a nav real (`/feed`)
  lista só o que existe.
- `/feed` real ainda lê `/api/data` (Supabase) no cliente; a O2 troca por Prisma. Os cards não
  têm mais a porcentagem de compatibilidade fixa (30%), que era falsa.
- A página `/` (`(main)/page.tsx`) e `components/cardFeed/*` seguem como o feed duplicado da T7.1,
  fora do shell novo.
- Handlers de salvar, dispensar, exportar, excluir, concluir onboarding e salvar rascunho só
  mudam estado local; ligam a serviços nas ondas O2–O5.
- Tema escuro e shell responsivo (barra inferior no celular) sem verificação visual.

## Decisões em aberto
- Nenhuma. (Protótipo como páginas Next com dados fixos: decidido e aprovado.)
