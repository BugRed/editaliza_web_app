# ADR 0014 — Higiene de contexto: recusar leitura sem recorte, em `Read` e em `Bash`

**Status:** Aceito · 2026-10-08

## Contexto

Pela medição que originou o ADR-0013, **75% do conteúdo das sessões é resultado de
ferramenta**. O custo não é pagá-lo uma vez: um resultado de N tokens que entra na requisição
*k* é recobrado em todas as seguintes. Em 32 sessões reais, oito leituras de arquivo inteiro
somaram ~690 mil tokens, a maior despejando ~165 mil numa chamada só. `Read` teve média de
3.142 tokens por chamada contra 290 do `Agent` — a diferença entre trazer o arquivo e trazer
a resposta.

Regra escrita em `.md` é o mecanismo mais fraco disponível: é justamente assim que um memory
bank apodrece — o texto continua lá e para de ser seguido, sem erro nenhum. O boilerplate já
reconhece isso em outro eixo ("não repita aqui o que o lint já barra"). Faltava o equivalente
para contexto.

Há ainda uma porta lateral: guardar só o `Read` não resolve, porque `cat arquivo` é a mesma
leitura com outro nome — e algumas configurações de sessão instruem o agente a **preferir**
`cat` a `Read`.

## Decisão

`.claude/hooks/higiene.mjs`, em `PreToolUse` com matcher `Read|Bash`, recusa
(`permissionDecision: "deny"`) a leitura de arquivo maior que **40 KB** quando não há recorte,
e o motivo explica o que fazer no lugar. O limite é configurável por `KIT_LIMITE_LEITURA`.

Não é trava de segurança, é **redirecionamento**: `permissionDecisionReason` chega ao modelo
como texto, e ele refaz sozinho com `grep` + `offset/limit`. A recusa custa ~100 tokens e
evita ~10 mil.

Passa em silêncio quando: há `offset` ou `limit`; a extensão é imagem, PDF ou notebook (o
custo não se mede em bytes); a saída já vai ser cortada adiante (`| head`, `| grep`, `| wc`…);
o comando é **escrita** (`cat > arquivo`, heredoc) e não leitura; ou o arquivo não existe.
Qualquer erro interno sai com exit 0 sem decisão — um hook de higiene não pode derrubar a
sessão que protege.

O limite veio da distribuição real de um projeto Next grande (p50 = 4 KB, p90 = 56 KB,
máximo 2,5 MB): 40 KB ≈ 10 mil tokens, 5% do orçamento de contexto do ADR-0013 numa chamada
só, e pega a cauda sem atrapalhar o caso comum.

No `CLAUDE.md` fica **apenas o que o hook não consegue julgar**: cortar saída de comando na
origem, mandar saída grande para arquivo, e screenshot só quando o visual é o objetivo
(~78 mil tokens cada — mais que todos os `.md` do repo somados).

## Consequências

- ➕ A regra passa a valer por construção, não por boa vontade: é a diferença entre o lint e
  o comentário pedindo cuidado.
- ➕ Cobre a porta lateral do `cat`, que uma guarda só no `Read` deixaria aberta.
- ➕ O agente se corrige sozinho: a recusa é instrução acionável, sem humano no circuito.
- ➖ O `CLAUDE.md` cresceu ~14 linhas (~200 tokens por sessão). É custo real, pago para
  recuperar muito mais — mas é custo, e entra na conta honestamente.
- ➖ 40 KB é um número calibrado em **um** projeto. Se recusar leitura legítima com
  frequência, sobe-se por `KIT_LIMITE_LEITURA` e recalibra-se com o `custo.mjs`.
- ➖ Saída de `Bash` não é previsível antes de rodar: `yarn test` sem corte continua passando.
  Essa parte segue como regra de texto, e o `custo.mjs` a detecta depois do fato.
- ⚠️ A detecção de escrita (`cat > arquivo`, heredoc) é por regex. Erra para o lado seguro:
  na dúvida, não decide e deixa passar. Um falso positivo aqui quebraria a escrita de
  arquivos, que é pior que deixar passar uma leitura grande.
