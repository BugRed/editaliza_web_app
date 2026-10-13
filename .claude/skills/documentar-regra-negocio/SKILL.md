---
name: documentar-regra-negocio
description: Registra em docs/negocio/ (ou como ADR em docs/adr/, se for decisão de arquitetura) uma regra de negócio que acabou de ser decidida ou alterada. Use ao final de uma entrevista da skill grill-regra-negocio ou do comando /grill-me, ou sempre que, lendo código, você perceber uma regra de negócio em *.service.ts que não está documentada em docs/negocio/.
---

Feche o loop "decide → documenta". Uma regra de negócio que só existe na conversa ou só no
código não sobrevive à próxima sessão.

## 1. Classifique a decisão

- **Regra de negócio** (o que o sistema deve fazer e por quê, independente de como está
  implementado) → vai para `docs/negocio/`.
- **Decisão de arquitetura** (uma escolha estrutural ou de ferramenta — como algo é
  implementado, não o que ele faz) → vai para `docs/adr/`, a partir de
  `docs/adr/TEMPLATE.md`, numerado sequencialmente (confira o maior `NNNN` já usado no índice
  de `docs/adr/README.md` e some 1). ADRs são imutáveis: se isto substitui uma decisão
  anterior, marque o ADR antigo como `Substituído por ADR-NNNN` em vez de editá-lo.

Na dúvida, prefira `docs/negocio/` — é o lar padrão de qualquer regra de comportamento.

## 2. Para regra de negócio

1. Abra `docs/negocio/README.md` e confira o índice: já existe um arquivo cobrindo este
   comportamento?
   - **Existe** → atualize o arquivo existente no lugar (enunciado, casos de borda, status).
     Nunca duplique a regra em dois arquivos.
   - **Não existe** → crie `docs/negocio/<slug-dominio>-<slug-regra>.md` seguindo exatamente o
     formato descrito em `docs/negocio/README.md`:

     ```markdown
     # <Nome da regra>

     **Status:** vigente | proposta | revogada
     **Domínio:** <domínio>

     ## Enunciado
     ## Racional
     ## Casos de borda
     ## Onde é aplicada
     ## Decisões em aberto
     ```

     Preencha "Onde é aplicada" com o caminho real do `*.service.ts` (link relativo).
2. Atualize a tabela de índice em `docs/negocio/README.md`, removendo a linha placeholder
   `_(nenhuma ainda...)_` se for a primeira regra.
3. Se existir uma spec correspondente em `docs/features/<responsabilidade>/`, adicione ou
   atualize o link para esta regra na seção "Regras de negócio relacionadas" dela — nunca
   reescreva o enunciado lá, só linke (regra de ouro de `docs/README.md`: uma fonte da verdade
   por fato).

## 3. Para decisão de arquitetura

1. Copie `docs/adr/TEMPLATE.md` para `docs/adr/<NNNN>-<slug>.md` com o próximo número.
2. Preencha Contexto → Decisão → Consequências, com `Status: Proposto` até o usuário confirmar
   aceite (depois vira `Aceito`).
3. Atualize a tabela de índice em `docs/adr/README.md`.

## 4. Relate

Diga ao usuário, em uma frase, onde a decisão ficou registrada (caminho do arquivo) — para que
ele saiba que não precisa guardar isso de memória.
