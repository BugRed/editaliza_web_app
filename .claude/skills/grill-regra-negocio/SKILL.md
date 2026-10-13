---
name: grill-regra-negocio
description: Entrevista o desenvolvedor antes de escrever ou alterar qualquer *.service.ts em src/server/<domínio>/ — a camada que carrega regra de negócio neste projeto. Dispara sempre que a mudança decide, altera ou deixa ambíguo um comportamento de negócio (cálculo, validação com efeito de domínio, condição de elegibilidade, estado permitido/proibido, efeito colateral como cobrança/notificação/auditoria), ou quando a mudança toca algo já documentado em docs/negocio/. Não dispara para mudança puramente técnica sem efeito de comportamento (refactor, troca de lib, tipagem, formatação).
---

Antes de escrever a primeira linha da mudança, pare e entrevista. O objetivo não é validar uma
decisão que você já tomou sozinho — é garantir que a decisão existe e é do usuário.

## Quando parar

Pare e abra a entrevista quando a mudança:
- Introduz ou altera uma regra dentro de `*.service.ts` — cálculo, validação com efeito de
  domínio, condição de elegibilidade, estado permitido/proibido, ou efeito colateral.
- Toca um comportamento já descrito em `docs/negocio/` — a regra existente pode estar errada,
  incompleta, ou esta mudança pode contradizê-la.
- Tem mais de uma forma razoável de implementar e a escolha muda o resultado para quem usa o
  sistema, não só a forma do código.

Não pare para: refactor sem mudança de comportamento, troca de biblioteca, ajuste de tipo,
formatação, escrita de teste (`*.test.ts`) para uma regra já decidida, ou qualquer coisa já
coberta por uma regra existente e inequívoca em `docs/negocio/` que esta mudança apenas
implementa ao pé da letra.

Não repita uma entrevista já feita. Se a decisão de negócio desta mudança já foi resolvida
nesta mesma conversa — no briefing do `/feature`, num `/grill-me` anterior, ou numa
rodada anterior desta própria skill — não pergunte de novo só porque um novo `*.service.ts`
foi tocado. Entreviste de novo apenas a parte genuinamente nova que sobrou sem decisão.

## Como conduzir

1. Antes da primeira rodada, leia por conta própria: o `*.service.ts` atual (se existir), o
   schema Prisma do domínio em `prisma/schema/`, a regra relevante em `docs/negocio/` e a spec
   relevante em `docs/features/<responsabilidade>/`. Não pergunte ao usuário nada que esses
   arquivos já respondem.
2. Chame a skill `grilling` para conduzir a entrevista nas decisões de negócio que sobraram —
   use exatamente o formato de rodada/fronteira dela.
3. Ao final, resuma a decisão em 2–3 frases e peça confirmação antes de codar.
4. Chame a skill `documentar-regra-negocio` para registrar o que foi decidido. A entrevista só
   está completa quando a regra existe em `docs/negocio/` (ou como ADR, se for decisão de
   arquitetura), não apenas na conversa.
