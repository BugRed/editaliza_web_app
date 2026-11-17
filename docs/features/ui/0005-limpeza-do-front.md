# Limpeza do front e telas das ondas O2 a O5

**Status:** em-desenvolvimento
**Responsabilidade:** ui
**Branch:** feature/ui-05/limpeza-do-front
**Autor:** BugRed · **Data:** 2026-11-17

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica, só front
- [x] service — não se aplica, sem regra de negócio; as telas novas usam dados fixos
- [x] controller — não se aplica
- [x] route — não se aplica; só páginas, nenhum route handler novo
- [ ] ui — limpeza (fase 1) e telas das ondas O2 a O5 (fase 2)
- [ ] teste — componentes e telas novas
- [ ] doc — `docs/ui/mapa-de-telas.md`, CHANGELOG e dívida
<!-- /kit:camadas -->

**Próximo passo:** fase 1, item 1 (remover `/teste`), carregando antes as skills `camada-ui` e `next16`.

## Problema / motivação
O front do protótipo veio inteiro e funciona, mas deixou resíduos (página de teste, feed duplicado, cores literais,
imagens de 7 MB, arquivos de 500 linhas, componentes fora de `src/shared/components/`). E as telas das ondas O2 a O5
só existem no mapa. O usuário quer o front fechado, e as telas desenhadas, antes de implementar o motor.

## Escopo
**Fase 1 — limpeza** (itens da varredura de 2026-11-17):
1. Remover `/teste` (`SupabaseTestPage`).
2. Unificar `/` e `/feed`, e o `cardFeed` (CSS Modules ao lado de Tailwind).
3. Trocar os 5 hex literais por tokens.
4. Redimensionar `public/images/` (7,3 MB).
5. Quebrar `cadastro`, `configuracoes`, `publicar-edital` e `AppShell` em organismos; descartar a `useSocialStore`
   (plano §11.1: vira server state) sem perder comportamento visível.
6. Mover os componentes de `src/app/components/` para `src/shared/components/` em atoms → molecules → organisms.
7. Verificar o que a dívida lista como não exercitado: celular, vídeo e áudio, embed, Open Graph, `yarn build` e `yarn test`.

**Fase 2 — só as telas, com dados fixos** (mapa de telas, `docs/ui/mapa-de-telas.md`), com claro, escuro e os estados
obrigatórios de cada uma:
- **O2:** perfil e privacidade (exportar, excluir, visibilidade).
- **O3:** `/editais/[id]` (hoje modal) e `/admin/editais`.
- **O4:** `/onboarding`, `/perfil/trajetoria`, `/perfil/obras`, `/editais/[id]/porque`, `/artistas/[id]`.
- **O5:** `/organizacao/editais/novo`, `/organizacao/editais/[id]/candidatos` e a rejeição com motivo.

**Não entra:**
- Backend, banco, auth e o motor do ArtistRank: as telas usam dados fixos e dizem isso no código.
- Porcentagem de compatibilidade no feed (plano §6.0); o "por quê" segue o ADR 0019.
- Fator de "trajetória de superação" no score (decisão de negócio, fora desta feature).

## Comportamento / fluxos
Os fluxos são os do mapa de telas §3. Cada tela nova é navegável a partir do shell e tem estado vazio e de carregamento.

## Impacto técnico
- **Banco / API:** nenhum.
- **UI:** reorganiza `src/app/components/` → `src/shared/components/` e acrescenta rotas em `src/app/`.
- A fase 1 não pode mudar comportamento visível, exceto a remoção de `/teste` e do feed duplicado.

## Regras de negócio relacionadas
Nenhuma nova. Ver [`docs/ui/mapa-de-telas.md`](../../ui/mapa-de-telas.md) e o ADR 0019.

## Critérios de aceite

<!-- kit:criterios -->
- [ ] `/teste` não existe e nada o referencia
- [ ] Uma única rota de feed; o `cardFeed` só usa Tailwind
- [ ] Nenhuma cor literal fora de `globals.css`
- [ ] `public/images/` bem abaixo de 7,3 MB, sem queda visível de qualidade
- [ ] `cadastro`, `configuracoes`, `publicar-edital` e `AppShell` sem arquivo acima do limite do lint; sem `useSocialStore`
- [ ] Componentes em `src/shared/components/` por camada, e os imports `@/` atualizados
- [ ] `yarn lint`, `yarn test` e `yarn build` passam
- [ ] Cada tela da fase 2 existe, tem estado vazio e de carregamento, e funciona em claro e escuro
<!-- /kit:criterios -->

## Dívida / não exercitado
- Telas da fase 2 usam dados fixos: nenhuma foi conferida contra backend real.
- O mapa de telas diz que "sem molde" para admin, "por quê" e candidatos: o desenho é desta feature, sem protótipo.

## Decisões em aberto
- Nenhuma de regra de negócio.
