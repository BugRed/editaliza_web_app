# Tema claro e escuro

Feature: [`0004-modo-escuro`](../features/ui/0004-modo-escuro.md) · decisão: [ADR 0023](../adr/0023-tema-segue-o-sistema-e-a-escolha-fica-em-cookie.md).

## Como funciona
Sem cookie, vale o sistema. O botão (menu lateral, cabeçalho de celular, login e cadastro) alterna sistema, claro e
escuro. A escolha vive no cookie `theme`, lido no servidor, e vira `<html data-theme="light|dark">`.

## Regra para quem escreve tela
**Nenhuma cor literal fora de `src/app/globals.css`.** Use o token: `text-(--foreground)`, `bg-(--bg-card)`,
`border-(--border-subtle)`. Os valores dos dois temas estão em `globals.css`; o bloco escuro aparece duas vezes
(`@media` e `[data-theme="dark"]`) e os dois mudam juntos.

- `--primary` é **preenchimento** com texto branco por cima e não clareia no escuro. Para texto, borda e anel use
  `--primary-fg`, que clareia.
- Texto sobre amarelo (`--accent`) usa `--on-accent`, que é escuro nos dois temas.
- Fundo de modal e de vídeo usa `--scrim`.
- Estados: `--danger`, `--warning`, `--success` e os `-soft`/`-border` do perigo.
- Imagens que mudam com o tema (logo): duas `<Image>` com as classes `only-light` e `only-dark`.

## Contraste (escuro)
Texto sobre fundo ≥ 4,5:1 em todos os pares: texto 15,9, muted 8,5, subtle 5,6, `--primary-fg` 8,1, danger 6,2.
