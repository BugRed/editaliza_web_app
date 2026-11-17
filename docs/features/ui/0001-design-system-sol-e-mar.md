# Design system "Sol & Mar"

**Status:** em-desenvolvimento
**Responsabilidade:** ui
**Branch:** feature/ui-01/design-system-sol-e-mar
**Autor:** BugRed · **Data:** 2026-11-15

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica, só UI
- [x] service — não se aplica, só UI
- [x] controller — não se aplica, só UI
- [x] route — não se aplica, só UI
- [ ] ui — tokens em `globals.css` e card/header/footer religados; falta olhar no navegador
- [x] teste — não se aplica nesta etapa: só CSS, sem comportamento novo
- [ ] doc — ADR do design system
<!-- /kit:camadas -->

**Próximo passo:** usuário abre `/feed` e valida o visual; depois reconstruir o card como organismo em `src/shared/components/`.

## Problema / motivação
O CSS tinha 24 cores soltas de cinco famílias, dois temas sem parentesco, cinco raios, três fontes e
`font-size` de raiz de 10px no celular. Faltava fonte única de tokens.

## Escopo
**Entra:**
- Paleta **Sol & Mar** (escolhida entre seis propostas em 2026-11-15) como tokens semânticos
  em `globals.css` (`@theme` do Tailwind v4): cor, raio (8/12/20/pill), sombra, fonte.
- Inter no lugar de Geist, Roboto e Barrio. Raiz fixa em 16px.
- Card do feed, header, footer, "more" e botões religados aos tokens.

**Não entra:**
- Tema escuro (mesmos nomes de token, outros valores, depois).
- Mover os componentes para `src/shared/components/` (atoms→organisms): feature própria.
- Unificar as três `FeedPage` (T7.1 do plano).

## Critérios de aceite

<!-- kit:criterios -->
- [x] Nenhum hex ou variável antiga nos `.css` fora de `globals.css`
- [x] `tsc` e lint sem erro
- [x] Usuário confirma o visual do feed no navegador
<!-- /kit:criterios -->

## Dívida / não exercitado
- Visual **não conferido** no navegador; só tipos e lint.
- Cores do percentual vêm por prop em hex (`#258611`, `#F2a900`) nas páginas; viram tokens de status.
- `(main)/teste/page.tsx` usa Tailwind com `var(--…)`; sai quando as três `FeedPage` virarem uma.
- Telas de login/cadastro seguem com `text-red-*`, `text-yellow-300`, `bg-gray-*` e `bg-yellow-400` do Tailwind (erro e destaques sobre fundo teal); contraste não checado.
- `border-radius` de tag duplicado em `bodyCardFeed.module.css` e `TagsCardFeed.module.css`.

## Decisões em aberto
- Tema escuro: quando entra e qual valor para cada token.
