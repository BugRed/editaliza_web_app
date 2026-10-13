---
description: Abre uma feature nova ou retoma a que está em andamento — decide qual pelo estado calculado pelo hook
argument-hint: "[descrição da mudança] | confirmar"
---

Abertura **ou** retomada — você decide qual, sem perguntar ao usuário.

O hook de SessionStart já injetou no contexto o bloco que começa com
`Estado do trabalho, calculado agora pelo git`. **Use-o.** Se ele não aparecer (hooks
desligados, `node` ausente), gere: `node .claude/hooks/estado.mjs estado`.

## 1. Decida o modo

- **Retomar** — o relatório aponta uma spec para a branch atual, ou há commits/alterações
  numa branch no padrão `<tipo>/<escopo>-<ID>/<slug>`.
- **Abrir** — a branch é `main`/`dev`, ou não há spec e o usuário descreveu uma mudança nova.

Argumento recebido: `$ARGUMENTS` (vazio = modo padrão; `confirmar` = sempre pare e pergunte
antes de escrever qualquer arquivo).

## 2. Retomar

1. Leia **só a spec** apontada no relatório. Não abra ADR, `contexto.md`, `negocio/` nem código
   ainda — o relatório e a spec já dizem onde parou.
2. Se o relatório listar camadas tocadas no código e não marcadas na spec, marque-as agora
   (bloco `kit:camadas`) — é fato do git, não decisão.
3. Resuma em 3 a 5 linhas: feature · status · camadas feitas e faltando · próximo passo ·
   CI. Se houver checkpoint da sessão anterior, cite o que ele diz.
4. Siga pelo **Próximo passo** da spec, na mesma resposta. Se a spec não tiver um e o
   checkpoint também não, aí sim pergunte por onde continuar.

## 3. Abrir

Só pare para perguntar duas coisas, e só quando o usuário não as tiver dito:
**o que a mudança entrega** e, se for `release`/`feature`, **o peso SemVer** (`major`/`minor`).
Todo o resto você deduz e lista na abertura como escolha tomada:

- **tipo** — pelo que a mudança faz: nova capacidade → `feature`; corrige bug funcional →
  `bugfix`; urgente em produção → `hotfix`; correção pontual sem criticidade → `fix`;
  reorganiza sem mudar comportamento → `refactor`; só doc → `docs`; dependência/config/CI →
  `chore`; corte de entrega versionada → `release`.
- **escopo** — `auth` · `api` · `ui` · `db` · `infra` · `jobs` · `docs` (ou nome descritivo,
  ex.: `plataforma`, em `release` que atravessa tudo).
- **ID** — sequencial por escopo, calculado de `git branch -a`: pegue o maior número com a
  abreviação do escopo (`AUTH`, `API`, `UI`, `DB`, `INFRA`, `JOBS`, `DOC`, `REL`) e some 1,
  com dois dígitos. Nenhuma branch com a abreviação → comece em `01`.

Se o tipo que você deduziu divergir do que o usuário disse, diga o porquê em uma linha e
respeite a escolha final dele.

Depois:

1. `git status` — havendo mudança não commitada, pare e avise antes de trocar de branch.
2. `git checkout main && git pull origin main && git checkout -b <tipo>/<escopo>-<ID>/<slug>`.
3. Crie a spec a partir de `docs/features/TEMPLATE.md` em
   `docs/features/<responsabilidade>/<NNNN>-<slug>.md` (`NNNN` sequencial **dentro da pasta**),
   preencha **Branch:**, **Status:** `em-desenvolvimento`, Problema, Escopo e os critérios de
   aceite, e marque com motivo as camadas que não se aplicam.
4. Briefing curto (não repita o que a spec diz): objetivo · branch · tipo e peso · camadas
   previstas · **escolhas que você tomou sem perguntar** · como vai validar.

## 4. Durante o trabalho

- Vai tocar `*.service.ts` ou algo já descrito em `docs/negocio/`? A skill
  `grill-regra-negocio` manda parar e entrevistar **antes** de escrever. É a única classe de
  decisão que se pergunta por padrão.
- Vai tocar UI, Prisma ou API do Next 16? Carregue a skill de camada correspondente
  (`camada-ui`, `camada-db`, `next16`) em vez de supor.
- Mudou comportamento? A doc muda no mesmo commit.
- Ao terminar: `/fechar`.
