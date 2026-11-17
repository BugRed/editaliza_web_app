# ADR 0023 — O tema segue o sistema e a escolha explícita fica em cookie

**Status:** Aceito · 2026-11-16

## Contexto

O app só tinha o tema claro. O usuário pediu que o escuro siga o sistema, tenha botão e que a escolha seja lembrada
em cookie. O projeto não usa `localStorage` (decisão registrada nas memórias do projeto), e a primeira pintura não pode
piscar no tema errado.

## Decisão

- Sem cookie, o CSS acompanha `prefers-color-scheme`: nenhum JavaScript é necessário para o caso comum.
- O botão alterna **sistema → claro → escuro**. Claro e escuro gravam o cookie `theme` (1 ano, `SameSite=Lax`, sem
  `httpOnly`, porque o cliente o escreve). "Sistema" expira o cookie.
- O `RootLayout` lê o cookie no servidor e escreve `<html data-theme>`; o `:root[data-theme]` vence o sistema.
- Tema é preferência do navegador, não dado da conta. Fica fora do banco.

## Alternativas rejeitadas

- **localStorage:** o servidor não o lê, então a primeira pintura sairia no tema errado e piscaria.
- **Script inline no `<head>` que lê o cookie:** resolve o flash, mas é JavaScript a mais e exige `nonce` se a CSP apertar.
- **Guardar o tema na conta:** não vale sem login (a tela de login também tem tema) e depende da O2 (banco real).
- **Só sistema, sem botão:** foi descartado pelo usuário.
