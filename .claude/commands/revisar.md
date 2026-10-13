---
description: Revisa o diff em dois eixos independentes — Padrões e Spec — em subagentes paralelos
argument-hint: "[branch, SHA ou tag de comparação]"
---

Chame a skill `revisao-codigo` com o ponto de comparação `$ARGUMENTS` (vazio = `main`).

A skill despacha dois subagentes em paralelo, um por eixo, e agrega os achados sem misturá-los:
código pode seguir todo padrão e implementar a coisa errada, ou acertar a spec e quebrar
convenção. Reportar junto deixa um eixo esconder o outro.

Use antes do `/fechar` quando a mudança for grande, tocar mais de uma camada ou mexer em
regra de negócio.
