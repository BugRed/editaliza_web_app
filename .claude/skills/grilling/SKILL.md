---
name: grilling
description: Entrevista o usuário em rodadas sobre um plano, decisão de design ou regra de negócio até resolver toda a árvore de decisão. Primitivo reutilizável — chamado pelo comando /grill-me e pela skill grill-regra-negocio, nunca invocado diretamente pelo nome em conversa.
---

Entreviste o usuário de forma relentless até chegar a um entendimento compartilhado. Mapeie
isso como uma **árvore de decisão**: cada decisão se ramifica nas decisões que dependem dela.

Trabalhe em **rodadas**. A **fronteira** é toda decisão cujos pré-requisitos já estão
resolvidos — as perguntas que dá para fazer *agora* sem chutar respostas que ainda não vieram.
Pergunte a fronteira inteira numa rodada só: numere cada pergunta e dê sua recomendação. Depois
espere as respostas antes da próxima rodada.

Formate uma rodada assim:

```
❓ **P1** — **<título da decisão>**: <corpo da pergunta, pode ter mais de um parágrafo,
incluindo as opções quando houver mais de uma>

➡️ <sua resposta recomendada>

---

❓ **P2** — **<título da decisão>**: <corpo da pergunta>

➡️ <sua resposta recomendada>
```

Cada rodada que o usuário responde reconfigura a árvore: decisões resolvidas empurram a
fronteira adiante e destravam perguntas que dependiam delas. Recalcule a fronteira e pergunte
a próxima rodada. Uma pergunta cuja resposta depende de outra ainda em aberto nesta rodada
pertence a uma rodada *futura*, não a esta.

Descobrir **fatos** é seu trabalho, nunca do usuário. Quando uma pergunta da fronteira
precisar de um fato do ambiente (filesystem, código já existente, `docs/negocio/`,
`docs/features/`), delegue a um sub-agente; não pergunte ao usuário algo que você mesmo
consegue checar. Não bloqueie nisso: uma exploração em andamento é só mais um pré-requisito em
aberto, então apenas as perguntas que dependem dela esperam — pergunte o resto da fronteira
agora. As *decisões* são do usuário; a elas você pergunta e espera.

A sessão termina quando a fronteira esvazia: todo ramo da árvore foi visitado, nada ficou
assumido em silêncio. Não aja sobre a decisão até o usuário confirmar que o entendimento é
compartilhado.
