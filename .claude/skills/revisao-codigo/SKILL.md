---
name: revisao-codigo
description: Revisão em dois eixos do diff desde um ponto fixo (branch, commit ou "main") — Padrões (CLAUDE.md, ADRs, skills de camada) e Spec (a spec da feature em docs/features/, docs/negocio/, ou o briefing do /feature). Roda as duas revisões em sub-agentes paralelos para não misturar os dois tipos de achado. Use quando o usuário pedir para revisar uma branch, uma PR, ou as mudanças em andamento, ou antes de fechar via /fechar.
---

Revisão em dois eixos do diff entre `HEAD` e um ponto fixo:

- **Padrões**: o código segue as convenções documentadas deste repo?
- **Spec**: o código entrega fielmente o que foi pedido?

Os dois eixos rodam como **sub-agentes paralelos** (`subagent_type: "revisor"`), para não
poluir o contexto um do outro nem o seu. Esta skill só agrega os achados — **não leia o diff**
você mesmo: o que entra no seu contexto é recobrado em toda requisição seguinte da sessão.

## 1. Fixe o ponto de comparação

Use o que o usuário indicou (branch, SHA, tag). Se não indicou, use `main` — é a base de
comparação padrão deste projeto (`CONTRIBUTING.md`: "Branch a partir de `main`").

Confirme que o ponto resolve (`git rev-parse <ponto>`) e que o diff não é vazio
(`git diff <ponto>...HEAD` — three-dot, compara contra o merge-base) antes de despachar
qualquer sub-agente. Pegue também `git log <ponto>..HEAD --oneline` para a lista de commits.

## 2. Identifique a fonte da spec

Nesta ordem:
1. Um caminho que o usuário passou como argumento.
2. Um arquivo em `docs/features/<responsabilidade>/` cujo nome bate com o escopo da branch
   (o `<escopo>` do nome `<tipo>/<escopo>-<ID>/<slug>`).
3. A regra relacionada em `docs/negocio/`, se a mudança é em `*.service.ts`.
4. A spec da feature em `docs/features/` apontada pelo hook de estado, ou o briefing do `/feature` desta mesma conversa, se existir (seção "Objetivo" e
   "Escopo previsto").
5. Se nada for encontrado, pergunte ao usuário onde está a spec. Se ele disser que não existe,
   pule o sub-agente de Spec e registre isso no relatório final — não bloqueia o resto.

## 3. Identifique a fonte dos padrões

Sempre inclua:
- `CLAUDE.md` (padrões de código e arquitetura de diretórios — fonte única desde a fusão do `AGENTS.md`).
- A skill de camada correspondente ao que o diff tocou (`camada-ui`, `camada-db`, `next16`), quando houver.
- Os ADRs em `docs/adr/` cujo título bate com algo tocado no diff (ex.: diff mexe em import →
  ADR-0003; diff mexe em boundaries → ADR-0007).

Além do que o repo documenta, o eixo Padrões carrega um **baseline de judgement call** — um
conjunto fixo de *code smells* (Fowler, *Refactoring*, cap. 3) que vale mesmo quando o diff não
viola nada documentado explicitamente. Duas regras amarram isso:
- **O repo sempre vence.** Um padrão documentado aqui tem prioridade sobre o baseline; onde o
  repo endossa algo que o baseline marcaria como smell, suprima o smell.
- **É sempre julgamento, nunca violação dura.** Diferente de uma regra documentada (que pode
  ser citada como violação direta), um smell do baseline é sempre "possível X" — nunca um erro
  categórico.

Baseline (cada um: o que é → como ajustar):
- **Nome confuso**: função/variável/tipo cujo nome não revela o que faz ou guarda → renomeie;
  se nenhum nome honesto aparecer, o design está obscuro — já viola CLAUDE.md ("nomes
  descritivos") de qualquer forma.
- **Código duplicado**: a mesma lógica aparece mais de uma vez no diff → extraia uma função
  (já é regra explícita do CLAUDE.md: "funções genéricas antes de duplicar").
- **Inveja de recurso**: um método mexe mais nos dados de outro objeto do que nos próprios →
  mova o método para perto do dado.
- **Grupo de dados (data clump)**: os mesmos campos viajam sempre juntos → agrupe num tipo.
- **Obsessão por primitivo**: uma string/primitivo representando um conceito de domínio que
  merece tipo próprio.
- **Generalidade especulativa**: abstração ou parâmetro adicionado para uma necessidade que a
  spec não pede → remova; viola também "não adicione abstração além do necessário".
- **Cirurgia a tiro de espingarda**: uma mudança lógica força edições espalhadas por muitos
  arquivos do diff → agrupe o que muda junto num módulo.
- **Mudança divergente**: um arquivo é editado por mais de uma razão não relacionada no mesmo
  diff.

## 4. Capture o diff em arquivo

Grave o diff e os commits em disco **com redirecionamento**, para que não passem pelo seu
contexto. Só o tamanho entra:

```bash
mkdir -p .claude/.cache
git diff <ponto>...HEAD > .claude/.cache/revisao.diff
git log <ponto>..HEAD --oneline > .claude/.cache/revisao.commits
wc -l .claude/.cache/revisao.diff .claude/.cache/revisao.commits
```

`.claude/.cache/` é gitignored (ADR-0009): o diff fica fora do seu contexto e fora do commit.

## 5. Despache os dois sub-agentes em paralelo

Dispare os dois `Agent` com `subagent_type: "revisor"` na **mesma mensagem** — duas chamadas
de tool independentes no mesmo turno — para rodarem concorrentes de verdade. Nunca peça para um
esperar o outro.

O `revisor` só tem ferramentas de leitura (`Read`, `Grep`, `Glob`): passe o **caminho** do
diff, nunca o diff colado. Colar aqui gastaria exatamente o contexto que o subagente existe
para poupar. Se o diff for grande, o hook de higiene vai recusar a leitura inteira e o revisor
lerá por faixa — é o comportamento certo.

**Prompt do sub-agente de Padrões** deve incluir: os caminhos de `revisao.diff` e
`revisao.commits`, as fontes de padrões do passo 3 (conteúdo relevante colado, não só o caminho — o
sub-agente não tem acesso a nada além do que você passar), e o baseline de smells do passo 3
colado por inteiro. Instrução: "Leia o diff do arquivo indicado. Reporte, por
arquivo/trecho onde fizer sentido: (a) toda violação de um padrão documentado — cite o arquivo
e a regra; (b) todo smell do baseline que você perceber — nomeie e cite o trecho. Deixe claro
que (a) pode ser violação dura e (b) é sempre julgamento, e que um padrão documentado do repo
sempre vence o baseline. Ignore o que a ferramenta já cobre (Prettier, ESLint, tsc — isso já
roda no `/quality-check`). Máximo 400 palavras, em português."

**Prompt do sub-agente de Spec** deve incluir: os caminhos de `revisao.diff` e
`revisao.commits`, o caminho ou conteúdo da spec encontrada no passo 2. Instrução: "Leia o diff do arquivo
indicado. Reporte: (a) o que a spec pediu e não está no diff, ou está parcial; (b)
comportamento no diff que não foi pedido (escopo inflado); (c) requisito que parece
implementado mas a implementação está errada. Cite a linha da spec para cada achado. Máximo 400
palavras, em português."

Se a spec faltar (passo 2, item 5), não despache este sub-agente.

## 6. Agregue

Apresente os dois relatórios sob os títulos `## Padrões` e `## Spec`, como vieram (sem
misturar ou reordenar achados entre os dois eixos — a separação existe justamente para um
eixo não mascarar o outro).

Termine com uma linha resumo: total de achados por eixo, e o pior problema *dentro de cada
eixo* (se houver). Não elege um "pior geral" cruzando os dois eixos.

## Por que dois eixos

Uma mudança pode passar num eixo e falhar no outro:
- Código que segue todo padrão mas implementa a coisa errada → **Padrões passa, Spec falha.**
- Código que faz exatamente o que a spec pediu mas quebra convenção do projeto → **Spec passa,
  Padrões falha.**

Reportar separado evita que um eixo esconda o outro.
