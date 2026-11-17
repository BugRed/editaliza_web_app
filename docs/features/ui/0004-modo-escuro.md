# Modo escuro

**Status:** em-desenvolvimento
**Responsabilidade:** ui
**Branch:** feature/ui-04/modo-escuro
**Autor:** BugRed · **Data:** 2026-11-16

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica, o tema não vai para o banco
- [x] service — não se aplica, sem regra de negócio
- [x] controller — não se aplica
- [ ] route — não se aplica, a menos que o cookie peça uma rota (previsto: só `document.cookie`)
- [ ] ui — tokens escuros, troca de cor literal por token, botão de tema, logo `-dark`
- [ ] teste — resolução do tema (cookie → atributo) e o botão
- [ ] doc — `docs/ui/`, ADR do cookie de tema, CHANGELOG e fecho da O1 no PROGRESS
<!-- /kit:camadas -->

**Próximo passo:** carregar `camada-ui`, mapear as cores literais (hoje ~945 em 45 arquivos) e criar os tokens
escuros em `globals.css` antes de trocar qualquer arquivo.

## Problema / motivação
O tema escuro estava previsto desde a spec 0001 (mesmos nomes de token, outros valores) e a marca já tem as versões
`-dark`. O app só tem o claro. Fechar o modo escuro fecha a O1.

## Escopo
**Entra:**
- Tema padrão **segue o sistema** (`prefers-color-scheme`); botão no menu e no cabeçalho de celular alterna
  sistema / claro / escuro.
- A escolha explícita fica em **cookie**, lido no servidor, para a primeira pintura já sair no tema certo (sem flash).
- Valores escuros para todos os tokens de `globals.css`; cores literais dos componentes passam a usar token.
- Logo `-dark`, `theme-color` e `icon.svg` coerentes com o tema.

**Não entra (fora de escopo):**
- Tema guardado na conta do usuário (vem com a O2, banco real).
- og-image em versão escura.
- Alto contraste e outros temas.

## Comportamento / fluxos
Sem cookie: o CSS segue o sistema. Com cookie `theme=light|dark`: `<html data-theme>` sobrepõe o sistema. Botão
grava o cookie e atualiza o atributo na hora. Escolher "sistema" apaga o cookie.

## Impacto técnico
- **Banco:** nenhum.
- **API:** nenhuma.
- **UI:** `globals.css`, `layout.tsx`, `AppShell`, componente de botão de tema, e os ~45 arquivos com cor literal.

## Regras de negócio relacionadas
Nenhuma. Guia visual em [`docs/ui/`](../../ui/).

## Critérios de aceite

<!-- kit:criterios -->
- [ ] Sem cookie, o app acompanha o tema do sistema (claro e escuro)
- [ ] O botão alterna sistema / claro / escuro e a escolha sobrevive a recarregar
- [ ] A primeira pintura já vem no tema escolhido (sem flash), pelo cookie lido no servidor
- [ ] Nenhuma tela fica com texto ilegível ou fundo claro solto no escuro (login, cadastro, feed, perfil, configurações, publicar, modal)
- [ ] Logo e `theme-color` trocam com o tema
- [ ] Contraste mínimo AA nos pares texto/fundo dos tokens
<!-- /kit:criterios -->

## Dívida / não exercitado
(preencher ao fechar)

## Decisões em aberto
- Nenhuma. Tomadas sem diretriz: ver o briefing de abertura.
