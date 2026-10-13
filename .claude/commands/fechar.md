---
description: Fecha a feature — gate, doc, contrato de estado, commits atômicos e mensagem de PR (sem push)
---

Fechamento. Em ordem; pare e reporte se algo falhar de forma irrecuperável.

## 1. Gate

Rode `/quality-check`. Sem ele, nada abaixo vale: **nunca escreva "verificado" sem ter
rodado**. Se não rodou alguma etapa, diga qual e por quê.

## 2. Atualize a spec da feature

É ela que carrega o estado. No arquivo apontado pelo hook:

- marque as camadas do bloco `kit:camadas` que o código já cobre;
- marque os critérios de aceite cumpridos em `kit:criterios`;
- **Status:** `entregue` só se o gate passou, teste existe e os critérios estão marcados —
  senão mantenha `em-desenvolvimento` e deixe o **Próximo passo** escrito;
- preencha **Dívida / não exercitado**: o que ficou duplicado, o que não foi exercitado
  contra o sistema real, o que você decidiu na hora sem estar na spec.

## 3. Documentação

Analise `git diff main...HEAD` e atualize no mesmo commit:

| O que mudou | Onde |
|---|---|
| Regra de negócio | `docs/negocio/` (skill `documentar-regra-negocio`) |
| Decisão de arquitetura | `docs/adr/` (`TEMPLATE.md`, numeração sequencial, ADR aceito nunca se edita) |
| Modelo de dados | `docs/db/modelo-de-dados.md` |
| Deploy, env, infra | `docs/ops/` |
| Impacto externo | `CHANGELOG.md` |
| Dívida que sobrevive à feature | `docs/divida.md` |

Uma fonte da verdade por fato: se precisa repetir, linke.

## 4. Contrato de estado

```bash
node .claude/hooks/contrato.mjs
```

Erro reprova o fechamento — corrija a causa, não a mensagem. Aviso é julgamento seu: ou
resolve, ou explica no resumo final por que não vale.

## 5. Commits (sem push)

`git status`, agrupe por contexto coeso e faça **commits atômicos** — nunca misture naturezas
(`feat` + `chore`). Conventional Commit, título no **imperativo presente** ("Adiciona",
"Corrige", "Extrai"), corpo explicando o que muda, em qual camada, por quê e o impacto —
sem lista de arquivos. Confira com `git log --oneline -10`.

**Não faça push.** Push, PR e merge são do usuário.

## 6. Mensagem de PR

Monte a partir de `.github/PULL_REQUEST_TEMPLATE.md` (se existir) e do diff: título
Conventional Commit · o que muda e por quê · como testar · riscos e decisões em aberto.
Apresente em Markdown, pronta para colar.

## 7. Resumo ao usuário

Nesta ordem, em texto: (a) o que foi entregue, com o gate antes→depois; (b) **a dívida
acumulada** — duplicado, não exercitado, decidido na hora; (c) decisões que você tomou sem
diretriz; (d) o próximo passo e o que ele precisa do usuário.

Última linha, literal: `Feature fechada. Falta o push e o PR — são seus.`
