# ADR 0016 — Subagente lê, nunca escreve — por definição, não por instrução

**Status:** Aceito · 2026-10-08

## Contexto

Delegar leitura é o segundo maior lever de contexto depois do tamanho da sessão. Medido neste
workspace: um `Agent` devolve **~290 tokens** em média, um `Read` na thread principal devolve
**~3.142**. A diferença não é ler menos — é ler tudo na janela do subagente e devolver só a
conclusão. O material bruto morre lá; só a resposta é recobrada nas requisições seguintes.

Mas delegar tem limite conhecido. A Cognition ("Don't Build Multi-Agents") mostra que
subagente que **escreve** quebra: ele recebeu um recorte da tarefa e não viu as decisões
tomadas acima dele, então suas ações carregam premissas incompatíveis com o resto do trabalho.
A Anthropic, defendendo arquitetura multi-agente, usa subagentes para **pesquisa** — janela
limpa, resumo de volta. Os dois concordam mais do que parece: o que isola bem é leitura, o que
quebra é escrita descoordenada.

A conclusão prática já estava escrita como D27. O problema é que "subagente não escreve" como
frase num `.md` é o mecanismo mais fraco disponível — a mesma crítica que motivou o ADR-0014.

## Decisão

A restrição passa a ser **estrutural**: o campo `tools` de um arquivo em `.claude/agents/` é
uma allowlist, e um subagente sem `Edit`, `Write` ou `Bash` não escreve porque **não tem como**.

Dois agentes no kit, ambos com `tools: Read, Grep, Glob`:

- **`explorador`** — busca ampla ("onde está X", "como este padrão é usado"). Devolve a
  resposta e referências `arquivo:linha`, nunca transcrição.
- **`revisor`** — revisa um eixo do diff. Despachado em par pela skill `revisao-codigo`.

Para o `revisor` funcionar sem `Bash`, a skill mudou: em vez de cada subagente rodar
`git diff` por conta, a thread principal grava o diff em `.claude/.cache/revisao.diff` **com
redirecionamento** e passa o caminho. Dois ganhos num movimento — o subagente fica sem shell, e
o diff deixa de passar pelo contexto da thread principal, que é quem mais paga por ele.

## Alternativas rejeitadas

- **Dar `Bash` ao `revisor` e proibir escrita no prompt:** é o desenho que o ADR-0014 já
  rejeitou em outro eixo. `Bash` escreve (`cat > arquivo`), então a garantia viraria promessa.
  Capturar o diff em arquivo custou três linhas na skill e tornou o `Bash` desnecessário.
- **Um hook `PreToolUse` que inspecionasse o prompt do `Agent` procurando intenção de escrita:**
  heurística sobre texto livre, da mesma família que foi descartada na E2 por prever mal.
- **Deixar o subagente escrever e revisar depois:** é exatamente o modo de falha que a
  Cognition descreve, e o custo aparece tarde, no merge.
- **Não ter definição de agente e seguir com `subagent_type` genérico:** é o que havia. Herda
  todas as ferramentas, incluindo escrita.

## Consequências

- ➕ "Subagente não escreve" deixa de depender de o modelo lembrar da regra.
- ➕ O diff sai do contexto da thread principal de graça, como efeito da mudança.
- ➕ Prompts dos dois agentes carregam o *porquê* com o número: a instrução se sustenta sozinha
  se for lida fora deste repo.
- ➖ O `explorador` não tem `Bash`, logo não explora **histórico** (`git log`, `git blame`).
  Isso fica na thread principal. Se virar incômodo, o caminho é um terceiro agente com `Bash`
  e sem `Edit`/`Write` — restrição menor, mas ainda estrutural.
- ➖ Mais um arquivo para o `kit:sync` manter alinhado entre projetos.
- ⚠️ Um diff grande faz o `higiene.mjs` recusar a leitura inteira dentro do subagente, que
  então lê por faixa. É o comportamento desejado, mas é interação entre dois mecanismos do kit
  e **não foi exercitada numa revisão real**.
