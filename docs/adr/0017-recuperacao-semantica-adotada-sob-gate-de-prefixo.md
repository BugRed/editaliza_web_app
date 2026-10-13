# ADR 0017 — Recuperação semântica (Serena) é adotável, sob gate de prefixo

**Status:** Aceito · 2026-10-08

## Contexto

A D21 decidiu **adotar, não construir** recuperação semântica: usar Serena (MCP sobre LSP,
`find_symbol` em vez de ler o arquivo todo) em vez de escrever um repo map à la Aider. A
decisão veio com uma condição explícita, para não repetir o erro da D11 de adotar sem medir:
*se as definições de ferramenta custarem mais de ~3 mil tokens de prefixo permanente, só
habilitar onde a exploração domina.*

A medição do prefixo mostrou por que a condição importava. O **prefixo da sessão** — system
prompt, definições de ferramenta, `CLAUDE.md` e saída dos hooks — tem mediana de **41.230
tokens** neste workspace, variando de 2 mil a 63 mil. Ele é relido em **toda** requisição,
então custa `prefixo × requisições` sem nenhuma relação com o que a sessão fez: sozinho,
responde por **10,3% de toda a releitura** medida. Serena expõe ~39 ferramentas; a 150–400
tokens por definição, seriam 6 a 15 mil tokens somados a esse piso, recobrados centenas de
vezes por sessão.

A condição, porém, não se verifica: **o tool search é o padrão do Claude Code**. As definições
de ferramenta MCP carregam sob demanda, e no prefixo fica só a lista de nomes. Ele só é
desligado em três configurações — `ANTHROPIC_BASE_URL` customizado, `ENABLE_TOOL_SEARCH=false`,
ou modelo anterior à geração 4.5 na Agent Platform do Google Cloud. Nenhuma vale nesta máquina.

## Decisão

**Serena é adotável, e o kit não a instala.**

O `kit.mjs doctor` ganha a checagem `tool search ligado` (lê `ENABLE_TOOL_SEARCH` e
`ANTHROPIC_BASE_URL`): é a condição que separa adotar barato de adotar caro. Não bloqueia — o
`doctor` informa, e a decisão de habilitar um servidor MCP é de quem conhece o projeto.

O `custo.mjs` passa a reportar o prefixo (mediana, faixa e a fração da releitura que ele
explica), o que torna o gate **repetível**: mede-se antes, habilita-se, mede-se depois. O número
deixa de depender de opinião.

Instalar continua fora do kit: é dependência externa, com setup por linguagem e por projeto, e
o kit não instala software na máquina de ninguém.

## Alternativas rejeitadas

- **Construir um repo map próprio (tree-sitter + PageRank, como o Aider):** semanas de trabalho
  para reproduzir o que já existe pronto, e com manutenção por linguagem.
- **Instalar Serena por padrão no kit:** dependência externa decidida por quem não conhece o
  projeto. Custo de setup real, benefício que varia com a linguagem e com o tipo de trabalho.
- **Recusar MCP por causa do prefixo:** era a hipótese de partida, e a medição a derrubou. Teria
  custado uma ferramenta útil por um medo não verificado — exatamente o erro simétrico ao da
  D11.
- **Medir rodando Serena de verdade antes de decidir:** exigiria instalar software e abrir
  sessões reais para comparar. Fica para quem habilitar, com o `custo.mjs` na mão.

## Consequências

- ➕ O gate é repetível, e por número: `custo.mjs` dá o prefixo antes e depois.
- ➕ O `doctor` avisa justamente na configuração em que adotar MCP sairia caro.
- ➕ A hipótese de partida foi derrubada por medição, não por argumento — que é o padrão que
  este kit existe para impor.
- ➖ **O benefício continua não medido.** Os "70% menos tokens" são número do projeto Serena,
  não deste workspace. O que está verificado é que o *custo* de adotar é baixo, não que o
  ganho seja alto.
- ➖ **Depois do ADR-0014, a margem é menor do que parece.** A higiene já força `grep` + leitura
  por faixa; o ganho marginal de Serena é sobre *isso*, não sobre ler o arquivo inteiro, que é
  a comparação que a literatura usa.
- ⚠️ Em ambiente corporativo com proxy (`ANTHROPIC_BASE_URL` customizado) o tool search desliga
  e a conta **inverte**: 39 definições entram no prefixo de toda sessão. O `doctor` detecta,
  mas ninguém é obrigado a rodá-lo.
