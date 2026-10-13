# ADR 0015 — Índice de decisões derivado dos arquivos, com teto

**Status:** Aceito · 2026-10-08

## Contexto

Um registro de decisões só vale se for lido. A literatura de memória de agente converge num
mesmo relato de fracasso: arquivos de contexto em markdown crescem até milhares de linhas
contraditórias, com entradas sem data e sem supersessão, e o agente **para de segui-las sem
emitir erro nenhum** — chamam isso de "prompt debt". O sintoma é silencioso, que é o que o
torna caro.

Some-se o *context rot*: carregar mais texto piora a resposta antes mesmo de a janela encher.
Um índice que cresce sem limite custa duas vezes — em token e em acerto.

O boilerplate já tinha a metade difícil: ADR imutável, supersessão explícita
(`Substituído por ADR-NNNN`) e numeração sequencial. Faltavam três coisas: a **data** (sem
ela a supersessão não ordena — não dá para saber qual decisão veio depois), a **alternativa
rejeitada** (o diff mostra o que foi feito, nunca o que foi descartado nem por quê) e um
**teto**.

Faltava também fechar a porta do índice escrito à mão: o `README.md` da pasta trazia uma
tabela mantida manualmente, que diverge dos arquivos no primeiro ADR que alguém esquecer de
listar — e um índice que mente é pior que nenhum.

## Decisão

**O índice é derivado, nunca escrito.** `lerDecisoes()` em `estado.mjs` lê título, status e
data de cada `docs/adr/NNNN-*.md` e monta o índice das decisões **vigentes**; as superadas
saem da lista sem sair do repositório. O hook de `SessionStart` injeta esse índice. O corpo de
cada ADR se lê sob demanda — é a disclosure em três níveis das Skills aplicada ao histórico
(~16 tokens por decisão: o título É o índice).

**O índice tem teto de 1.200 tokens** — medido, de 60 a 75 decisões vigentes conforme o
tamanho dos títulos (~16 tokens por título curto, ~19 por longo). Acima dele o hook manda só o
ponteiro e o `contrato.mjs` avisa para podar, marcando como superado o que já não vale.

O `contrato.mjs` passa a verificar a saúde do registro: supersessão apontando para um ADR
inexistente é **erro** (referência zumbi); ADR sem data e índice acima do teto são **aviso**.

O `TEMPLATE.md` ganha **Alternativas rejeitadas** como seção obrigatória. E `docs/divida.md`
ganha a seção **Becos sem saída** — o que se tentou e não funcionou, que não é dívida (nada
ficou pela metade) nem ADR (nada foi decidido), e é justamente o que se repete quando não
está escrito.

## Alternativas rejeitadas

- **Criar um `docs/decisoes.md` paralelo ao `docs/adr/`:** era o desenho inicial da
  consolidação. Duplicaria imutabilidade, supersessão, índice e status, que o ADR já tem —
  contra a regra "uma fonte da verdade por fato" do próprio `CLAUDE.md`. Dois registros de
  decisão divergem, e aí nenhum é confiável.
- **Manter o índice escrito à mão no `README.md`:** mais simples de ler no GitHub, mas é a
  forma mais comum de o registro apodrecer. Derivar custa ~40 linhas e remove a classe inteira
  de bug.
- **Grafo temporal (Zep/Graphiti) com `invalid_at` por aresta:** resolve supersessão melhor e
  mede +18,5% de acurácia contra contexto cheio. É um serviço para manter, e a medição não
  aponta memória de longo prazo como o gargalo deste kit. A ideia sobrevive como a data no
  Status.
- **Injetar o índice inteiro sem teto:** é o que os memory banks fazem, e é por isso que
  morrem.

## Consequências

- ➕ O índice não pode divergir dos arquivos: não existe lista para esquecer de atualizar.
- ➕ Decisão superada some do contexto da sessão sem sumir da história.
- ➕ O teto dá função à poda: não é higiene opcional, é o que mantém o índice injetado.
- ➖ O índice entra no prefixo de **toda** sessão: ~96 tokens hoje (6 decisões), até 1.200 no
  teto. É custo real, pago para não re-decidir o que já foi decidido — e re-explorar custa
  milhares.
- ➖ O título do ADR vira interface: mal escrito, o índice fica inútil. O `TEMPLATE.md` avisa,
  nada verifica.
- ⚠️ 1.200 tokens é escolha, não medida. Se projetos reais passarem dos ~65 ADRs vigentes com
  frequência, o certo passa a ser filtrar por camada tocada em vez de cortar no total.
