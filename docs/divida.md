# Dívida

O que nenhum commit registra: o que ficou duplicado, o que **não foi exercitado** contra o
sistema real, o que foi decidido na hora sem estar na spec. Não é backlog de produto (isso é
o `ROADMAP.md`) nem bug reportado — é o que a própria sessão sabe que deixou mal resolvido.

> Por que existe um arquivo só para isso: o histórico narrativo de sessão duplica o
> `git log` e envelhece. Dívida, não. Dívida que fica só na cabeça de quem escreveu — ou na
> spec de uma feature já fechada — some de vista.

Formato: uma linha por item, mais novo embaixo. Ao resolver, **apague a linha** e deixe o
commit contar a história.

Duas seções, porque são coisas diferentes: **Dívida** é o que ficou incompleto; **Becos sem
saída** é o que foi tentado e não funcionou. Decisão que constrange o código futuro não é nem
uma nem outra — é ADR.

| Data | Feature / spec | Dívida | Como se resolve |
|---|---|---|---|
| 2026-10-08 | kit de estado | `eslint.kit.mjs` **não exercitado** — `node_modules` não estava instalado, então as quatro regras novas (`prefer-const`, `no-explicit-any`, `no-console`, `no-restricted-imports`) nunca rodaram contra código real | `yarn install && yarn lint` depois de somar o fragmento ao `eslint.config.mjs`; ver se há falso positivo em teste co-localizado |
| 2026-10-08 | kit de estado | A lista das sete camadas vive em **dois lugares**: `docs/features/TEMPLATE.md` e `estado.mjs` (const `CAMADAS`). Projeto que mude a arquitetura precisa lembrar dos dois | Derivar o template da constante, ou um teste que compare os dois |
| 2026-10-08 | kit de estado | O checkpoint (`Stop`/`PreCompact`) lê a última mensagem do assistente da transcrição. Formato interno do Claude Code — pode mudar sem aviso | O código já degrada em silêncio; se parar de funcionar, o relatório dirá "sem resumo da transcrição" |
| 2026-10-08 | kit de estado | `estado.mjs` e `contrato.mjs` não têm **suíte automatizada** — foram exercitados à mão em repositório sintético (branch com e sem spec, spec entregue sem teste, arquivo novo não rastreado, fora de repo git), e nada impede uma regressão silenciosa | Teste Vitest montando um repo git temporário por caso, como o teste manual fez |
| 2026-10-08 | kit de estado | `pr.yml` não foi validado por parser de YAML (pyyaml ausente na máquina) | O GitHub valida no primeiro push; ou `yamllint` local |
| 2026-10-13 | W0 0001 | Selects sem `password`/`cpf` **não exercitados contra o banco real** — ambiente de dev sem rede até o Supabase; colunas derivadas dos CSVs carregados à mão + tipos | Com rede: logar, abrir `/api/users`, `/api/data`, `/api/artists`, `/api/proposers` e conferir 200 sem os campos |
| 2026-10-13 | W0 0001 | CI novo (pr.yml reescrito na W0) **nunca rodou num PR real**; ADR-0012 segue `Proposto` | Primeiro push + PR; conferir o check verde e aceitar o ADR |
| 2026-10-13 | T1.1 dados/0001 | Baseline v1 **derivido** (CSVs + tipos), não conferido contra o schema real do Supabase (sem rede no ambiente de dev) | Primeiro acesso com rede (ou export do console) confere tipos, defaults e constraints; divergência vira migration |
| 2026-10-13 | T1.1 dados/0001 | Runner e seed exercitados só em Postgres 17 local — `prepare:false` para o pooler do Supabase (R8) nunca rodou contra o pooler real | Primeira `db:migrate`/`db:seed` no Supabase confirma; ADR do pooler fecha na T1.2 |
| 2026-10-13 | dep-01 ([spec](features/seguranca/0002-deploy-bloqueado-next.md)) | 7 advisories do `npm audit` ficam: `postcss@8.4.31` aninhado sob o `next` (fix exige `next@16`) e cadeia `braces→@next/eslint-plugin-next` só-dev, cujo "fix" do npm rebaixaria o `eslint-config-next` para 14 — recusado | Upgrade para Next 16 (já planejado) resolve os dois; re-avaliar após o release out-of-band de 14/10/2026 |
| 2026-10-13 | dep-01 ([spec](features/seguranca/0002-deploy-bloqueado-next.md)) | `CardImage` segue com `<img>` cru (`eslint-disable` justificado no local) | Migrar para `next/image` auditando dimensão/fill do CSS module do card |
| 2026-10-18 | infra-01 ([spec](features/infra/0001-envs-server-side.md)) | Publishable key e `SUPABASE_URL` (derivada do ref do `DATABASE_URL`) **não exercitadas contra o Supabase real** — sandbox sem rede até lá; login ponta-a-pendente | `npm run dev` local → logar → `/feed` carrega; URL divergente corrige o `.env` |
| 2026-10-18 | infra-01 ([spec](features/infra/0001-envs-server-side.md)) | Auth legado segue até T1.2: senha comparada em texto plano (agora só no servidor), token base64 sem assinatura, cookie não-httpOnly | Better Auth (T1.2) substitui o serviço de auth inteiro |


## Becos sem saída

O caminho que se tentou e não deu certo, com o motivo. Não é dívida (não ficou nada pela
metade) nem ADR (nada foi decidido) — e é o que mais se repete quando não está escrito: o
`git log` só guarda o que entrou, nunca o que foi tentado e descartado. Sem isto, a próxima
sessão refaz o mesmo caminho até bater no mesmo muro.

Ao contrário da dívida, **não se apaga ao resolver**: um beco continua sendo beco. Apaga-se
quando deixa de ser verdade — e aí o motivo vira ADR.

| Data | O que se tentou | Por que não funcionou | O que mudaria isso |
|---|---|---|---|
| 2026-10-08 | Prever o tamanho da saída de um comando `Bash` no `PreToolUse` para exigir corte (`\| tail`) | Não é previsível antes de rodar: `yarn test` pode devolver 20 linhas ou 20 mil, e recusar por heurística erraria contra comando legítimo com frequência alta demais | Um modo "dry-run" que devolvesse o tamanho esperado, ou um `PostToolUse` que truncasse a saída antes de ela entrar no contexto |
