# ADR 0012 — Verificação automática em pull request

**Status:** Proposto · 2026-10-08

## Contexto

Os workflows existentes cobrem o depois: `sonar.yml` roda no push para `dev`, `deploy.yml` no
push para `main`. **Nenhum roda em `pull_request`.** Na prática, um PR de feature chega ao
revisor sem nenhuma verificação automática: formatação, tipos, lint e testes só rodam quando o
código já foi mesclado — exatamente quando corrigir custa mais caro.

O `deploy.yml` já tem um job `quality` com os quatro passos certos; o que falta é dispará-los
antes do merge, não depois.

## Decisão

Acrescentaremos `.github/workflows/pr.yml`, disparado em `pull_request` para `main` e `dev`,
rodando `format:check`, `typecheck`, `lint` e `test:cov` — os mesmos passos do job `quality`
do deploy, nas mesmas versões de Node e com o mesmo cache.

O contrato de estado (ADR-0011) **não** entra neste workflow por ora: ele já roda no `pre-push`
e no `/fechar`, e duplicá-lo aqui acopla duas decisões que mudam por motivos diferentes.

Fica `Proposto` até rodar no primeiro PR real: o workflow é novo e nunca foi exercitado.

## Consequências

- ➕ Tapa o furo: PR passa a ter verificação antes do merge, não depois.
- ➕ Reaproveita passos já exercitados em `deploy.yml`.
- ➖ Consome minutos de Actions em todo PR, inclusive de rascunho.
- ⚠️ `test:cov` reescreve `vitest.config.ts` quando a cobertura sobe (ratchet, ADR-0006). No CI
  essa escrita é descartada — se algum dia o ratchet precisar subir sozinho no CI, isso exige
  um commit de volta e um ADR próprio.
