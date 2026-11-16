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
- [ ] ui — atoms e molecules em `src/shared/components/`, tokens em `globals.css`
- [ ] teste — comportamento dos atoms e molecules; qualquer teste roda interno, em Docker
- [ ] doc — mapa de telas e fluxo em `docs/`
<!-- /kit:camadas -->

**Próximo passo:** produzir o **mapa de telas e fluxo** (`docs/ui/mapa-de-telas.md`) a partir de
`plano.md` §10 e do inventário do `editaliza_prot` (§11.1), com a ordem proposta das telas, para o
usuário aprovar **antes** de portar qualquer uma.

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
(Supabase, APIs) nem banco instalado no host. Hoje o repo não tem Dockerfile nem compose — só
será criado quando um teste precisar de um (ex.: Postgres na O2), nunca como arquivo vazio.

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
- [ ] Mapa de telas e fluxo aprovado pelo usuário
- [ ] Protótipo navegável aprovado pelo usuário
- [ ] `/feed` e login usam só tokens; nenhuma cor/raio literal fora de `globals.css`
- [ ] Atoms e molecules testados (comportamento) e `yarn lint` passando
<!-- /kit:criterios -->

## Dívida / não exercitado
Nada ainda.

## Decisões em aberto
- Forma do "protótipo navegável": páginas Next com dados fixos, ou Storybook. Padrão sugerido:
  páginas Next com fixtures, sem dependência nova.
