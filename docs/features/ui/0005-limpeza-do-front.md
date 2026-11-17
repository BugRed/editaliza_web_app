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
- [ ] ui — limpeza (fase 1, feita) e telas das ondas O2 a O5 (fase 2, a fazer)
- [ ] teste — fase 1 e lotes O2 e O3 cobertos (funções puras e organismos novos); telas da fase 2 ainda não
- [ ] doc — `docs/ui/mapa-de-telas.md`, CHANGELOG e dívida
<!-- /kit:camadas -->

**Próximo passo:** fase 2, lote O4 (onboarding, trajetória, obras, "por quê", `/artistas/[id]`). Lotes O2 e O3 prontos. A fase 1 está feita, exceto a conferência em navegador real (celular, mídia, Open Graph).

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
- [x] `/teste` não existe e nada o referencia
- [x] Uma única rota de feed (`/feed` só redireciona para `/`). O `cardFeed` segue com CSS Modules, por decisão registrada abaixo
- [x] Nenhuma cor literal fora de `globals.css`, salvo as que não podem ser variável CSS (ver dívida)
- [x] `public/images/` de 7,3 MB para 0,8 MB
- [x] `cadastro` (613 → 17 linhas de página), `configuracoes` (592 → 28), `publicar-edital` (545 → 12) e `AppShell` (361 → 115) quebrados
- [ ] Sem `useSocialStore`: **não feito**, ver decisões tomadas sem diretriz
- [x] Componentes em `src/shared/components/` por camada, e os imports `@/` atualizados
- [x] `yarn lint`, `yarn test` e `yarn build` passam (280 testes)
- [ ] Cada tela da fase 2 existe, tem estado vazio e de carregamento, e funciona em claro e escuro
<!-- /kit:criterios -->

## Dívida / não exercitado
- Telas da fase 2 usam dados fixos: nenhuma foi conferida contra backend real.
- O mapa de telas diz que "sem molde" para admin, "por quê" e candidatos: o desenho é desta feature, sem protótipo.

## Decisões tomadas sem diretriz (fase 1)
- **`useSocialStore` não saiu:** 14 consumidores (sessão, perfis, salvos, publicação). Trocar por servidor é O2/O3. Está na dívida.
- **CSS Modules do `cardFeed` ficam:** usam só tokens, e converter 9 arquivos para Tailwind sem conferência visual
  arrisca regressão sem ganho de comportamento.
- **Campos de formulário unificados** (`FormControls`, `FormField`): cadastro, configurações e publicar edital passam a
  ter o mesmo raio e o rótulo em negrito; antes o cadastro usava raio menor e rótulo médio. Mudança visual pequena.
- **Validação virou função pura testada** (`signup-validation`, `edital-draft`, `user-search`) em `src/shared/lib/`.
- **Código morto removido:** cabeçalho, rodapé, `authForm.tsx` e `AllDatas`, que só a página `/teste` ou ninguém usava.
- **Conferido por teste, lint, build e um `next start` local** (`/login` e `/cadastro` renderizam). Ainda sem conferência em navegador.

## Decisões em aberto
- Nenhuma de regra de negócio.
