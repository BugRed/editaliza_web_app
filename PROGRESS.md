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
| W0 — correções urgentes e higiene | [0001-w0-correcoes-urgentes](docs/features/seguranca/0001-w0-correcoes-urgentes.md) | commits feitos e push ok; falta PR/merge (usuário) e conferir os selects contra o banco real com rede |
| W1/T1.1 — migrations versionadas | [0001-migrations-versionadas](docs/features/dados/0001-migrations-versionadas.md) | commits feitos; falta push/PR (usuário); fidelidade ao schema real do Supabase pendente de rede |
| dep-01 — deploy bloqueado por Next vulnerável | [0002-deploy-bloqueado-next](docs/features/seguranca/0002-deploy-bloqueado-next.md) | commits e push ok; falta PR/merge (usuário) e deploy Vercel com cache limpo |
| infra-01 — envs server-only | [0001-envs-server-side](docs/features/infra/0001-envs-server-side.md) | commits feitos; falta login ponta-a-ponta com rede + push/PR (usuário); empilhada em `fix/dep-01` |

## Fila (ordem de prioridade)

1. W1 — T1.2 Better Auth (precisa de banco acessível p/ teste real) → T1.3 acesso server-side → T1.4 deploy

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
- infra-01 nasceu **empilhada em `fix/dep-01`** (mesmos arquivos de UI tocados
  lá); os PRs mergeiam em sequência — dep-01 primeiro.
- `SUPABASE_URL` derivada do ref do `DATABASE_URL` no `.env` (supabase-js 2.56
  exige URL mesmo com a publishable key nova).
