# ADR 0011 — Contrato de estado validado localmente, não no CI

**Status:** Aceito · 2026-10-08

## Contexto

Estado escrito à mão mente. Uma spec marcada "entregue" sem teste, uma camada tocada no código
e não marcada, uma regra de negócio nova em `*.service.ts` sem nada em `docs/negocio/`: tudo
isso passa despercebido porque nenhuma ferramenta olha a distância entre o **código** e o
**estado** — Prettier, ESLint, `tsc` e Vitest olham só o código.

Onde validar era a questão. No CI, a verificação é inburlável, mas o boilerplate não roda
nada em `pull_request` hoje (ver ADR-0012), o agente não dá push (quem dá é o usuário), e o
`gh` não está autenticado em todas as máquinas do time. Localmente, custa zero e falha cedo —
ao preço de ser burlável com `--no-verify`.

## Decisão

`.claude/hooks/contrato.mjs` valida o contrato e roda em dois pontos: no passo 4 do `/fechar`
e no `pre-push` do husky. Erro reprova (exit 1); aviso é julgamento de quem está fechando.

São erro: feature sem spec vinculada; spec "entregue" com a camada teste desmarcada; spec
"entregue" com critério de aceite em aberto; camada tocada e não marcada **quando** a spec se
diz entregue. São aviso: `*.service.ts` alterado sem `docs/negocio/` tocado, spec achada só
pelo slug, feature em andamento sem próximo passo, dívida que ficou só na spec.

Tem `--json` com objeto único em stdout, para quem quiser consumir em script.

## Consequências

- ➕ "Feature entregue sem teste" deixa de ser boa intenção e vira erro verificável.
- ➕ Não custa minuto de Actions, não depende de `gh` nem de PR aberto, falha antes do código
  sair da máquina.
- ➖ `git push --no-verify` passa por cima. É disciplina, como o resto do fluxo.
- ➖ Quem clona e não roda `node scripts/kit.mjs instalar` não tem o `pre-push`.
- ⚠️ Se o time passar a burlar na prática, a resposta é mover a mesma checagem para o
  workflow de PR (ADR-0012) — o script já é o mesmo e já fala `--json`.
