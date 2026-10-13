# PROGRESS

O que a **próxima** feature precisa saber e o git não tem como dizer. Mantenha curto: estado
de feature mora na spec (`docs/features/`), o que já foi entregue mora no `CHANGELOG.md` e no
`git log`, e a dívida mora em [`docs/divida.md`](docs/divida.md).

> Este arquivo não registra SHA, branch, baseline de teste nem cobertura — tudo isso o hook
> calcula a cada sessão (`node .claude/hooks/estado.mjs estado`). Repetir aqui só cria uma
> segunda versão da verdade, que envelhece.

## Em andamento

| Feature | Spec | Bloqueio |
|---|---|---|
| W0 — correções urgentes e higiene | [0001-w0-correcoes-urgentes](docs/features/seguranca/0001-w0-correcoes-urgentes.md) | commits feitos; falta push/PR (usuário) e conferir os selects contra o banco real com rede |

## Fila (ordem de prioridade)

1. W1 — T1.1 migrations → T1.2 Better Auth → T1.3 acesso server-side → T1.4 deploy

## Bloqueado por decisão do usuário

| # | Decisão que falta | O que ela destrava |
|---|---|---|
| _(nenhuma)_ | | |

## Decisões tomadas sem diretriz

Escolhas que uma sessão tomou sozinha por não haver regra, e que valem para as próximas.
Quando uma vira regra de verdade, ela sai daqui e entra no `CLAUDE.md`, num ADR ou no lint.

- Branch da W0 derivada de `feature/front-end` (não do `master`) e kit commitado nela —
  escolha do usuário em 2026-10-13; o PR da W0 levará também os commits de feed.
- `fh-kit-estado/` ignorado no git: é clone local do repo-fonte do kit, com `.git` próprio.
- `DATABASE_URL` e `BETTER_AUTH_*` ficam opcionais em `env.ts` até a W1 consumi-las.
- `cnpj` mantido no select de proponentes (dado público por lei); `cpf` e `password`
  fora, seguindo o precedente do `toPublicJSON`.
