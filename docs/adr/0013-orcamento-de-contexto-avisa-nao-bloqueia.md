# ADR 0013 — Orçamento de contexto avisa em tempo real, não bloqueia o fechamento

**Status:** Aceito · 2026-10-08

## Contexto

A premissa do kit era que estado entre sessões poupa token por deixar os `.md` menores.
Medindo 32 sessões reais (`~/.claude/projects/*.jsonl`, que gravam o `usage` cobrado por
requisição, 17.7 mil requisições), a premissa não se sustenta: encolher
`CLAUDE.md` + `AGENTS.md` de 12.653 para 5.075 bytes vale ~1.620 tokens por sessão — **0,3%**
de uma sessão que custa o equivalente a US$ 491.

O custo real está em outro lugar: **61,4%** é releitura de contexto (cache read), com média de
**363 mil tokens relidos por requisição**. O custo de uma sessão não é o tamanho do contexto,
é a soma dele em cada requisição: um resultado de N tokens que entra na requisição *k* é
recobrado em todas as seguintes. Cresce com o quadrado do tamanho da sessão. A sessão mais
cara medida teve 4.025 requisições e pico de 995 mil tokens de contexto.

Some-se o *context rot* (Chroma, 18 modelos, 194.480 chamadas): a acurácia cai conforme o
input cresce, bem antes de a janela encher. Sessão longa não é só cara — responde pior.

Isto reposiciona o kit. D4, D5 e D12 (estado derivado, spec-é-estado, checkpoint) não valem
por encolher markdown: valem por **tornar o `/clear` barato**. Hoje se mantém uma sessão de
4.000 requisições viva porque recomeçar custaria reconstruir o contexto. Estado entre sessões
é o que compra o direito de fechar cedo, e fechar cedo é o único lever de ordem de grandeza.

## Decisão

Orçamento de **200.000 tokens de contexto por requisição**, verificado no hook
`Stop`/`PreCompact` (`estado.mjs`, modo `checkpoint`), que já recebe `transcript_path` por
stdin. Ao cruzar o limite, emite um `systemMessage` com o número, a contagem de requisições e
o próximo passo (`/fechar` e `/clear`). `.claude/hooks/custo.mjs` é a visão retrospectiva, de
chamada manual, que aponta onde o token foi.

Três escolhas dentro dessa decisão:

1. **Avisa, não bloqueia.** A primeira versão era `exit 1` no `/fechar`. Está errada: quando
   o `/fechar` roda, o token já foi gasto — reprovar o commit pune sem economizar. O alarme
   precisa chegar enquanto ainda dá para fechar e recomeçar.
2. **Sai por `systemMessage`, não por `additionalContext`.** `additionalContext` injetaria o
   texto no contexto do modelo: um alarme de economia que gasta contexto. `systemMessage` vai
   só para o usuário — e é ele quem decide fechar.
3. **Avisa uma vez por sessão** (`orcamento.sessao` no cache). Alarme a cada parada vira
   ruído e para de ser lido: é como um memory bank de markdown morre.

O limite não é técnico — a janela comporta muito mais. É o ponto em que continuar passa a
custar mais que recomeçar.

## Consequências

- ➕ Ataca o fator de ~7x (número de requisições por sessão), não o de 0,3% (tamanho do `.md`).
- ➕ Custo marginal zero: o hook já lia a transcrição para o resumo do checkpoint; agora lê
  uma vez e serve os dois usos.
- ➕ O alarme não gasta um token do contexto que pretende proteger.
- ➖ É conselho, não trava: o usuário pode ignorar e seguir. Proposital — só ele sabe se vale
  terminar o raciocínio em curso.
- ➖ 200k é um número escolhido, não derivado. Se na prática o alarme disparar sempre no meio
  de trabalho legítimo, o número está errado e se ajusta com os dados do `custo.mjs`.
- ⚠️ Eventos de `usage` com todos os campos zerados existem na transcrição (12 em 4.037 numa
  sessão real) e são marcadores, não requisições. Contá-los fazia o aviso reportar
  "0 tokens na última requisição". Ambos os scripts os descartam.
