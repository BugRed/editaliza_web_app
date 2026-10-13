# W0 — Correções urgentes e higiene

**Status:** em-desenvolvimento
**Responsabilidade:** seguranca
**Branch:** bugfix/auth-01/w0-correcoes-urgentes
**Autor:** BugRed · **Data:** 2026-10-13

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica: W0 não toca schema (migrations são T1.1)
- [x] service — não se aplica: sem regra nova; código novo em `src/server` é W7 (D9)
- [x] controller — não se aplica: idem
- [x] route — todas as `/api/*` com select explícito sem `password`/`cpf`; `commentsError` corrigido; `/api/health` criada
- [x] ui — tocada: botões fake de OAuth removidos do `/login`, hooks condicionais do `more.tsx` corrigidos, `catch (err: any)` dos feeds tipado
- [x] teste — não se aplica como suite (sem runner no repo); validação comportamental via curl: 401 sem sessão, health público, token passa o gate, páginas redirecionam para /login
- [x] doc — `.env.example`, §2 do plano e PROGRESS.md atualizados no mesmo corte
<!-- /kit:camadas -->

**Próximo passo:** Push + PR são do usuário (commits feitos). Com rede até o Supabase, conferir os selects das quatro rotas contra o banco real (ver Dívida). Depois, W1: T1.1 (migrations) → T1.2 (Better Auth).

## Problema / motivação

`GET /api/users` devolve `select('*')` com a coluna `password` em texto puro e o matcher
do middleware exclui `/api` — qualquer pessoa lista usuários e senhas. O plano classifica
isso como risco R2 ("certa enquanto existir", impacto alto). Somam-se env sem validação
nenhuma (boot silencioso com config faltando) e ausência de CI do app — nada quebra
verde antes de um revisor ver. É a onda W0 do [`plano.md`](../../../plano.md) §5.

## Escopo

**Entra:**
- **T0.1** — `src/shared/lib/env.ts` com zod validando no boot: `NEXT_PUBLIC_SUPABASE_*`,
  `DATABASE_URL`, `BETTER_AUTH_*`; `.env.example` commitado; script `typecheck`.
- **T0.2** — fechar o vazamento: nenhuma rota `/api/*` seleciona `password` (nem `cpf`,
  espelhando o `toPublicJSON` já existente); correção do bug `tagError`/`commentsError`
  em `/api/data`; sessão exigida em `/api` (exceto `/api/health`, criada como liveness).
- **T0.3** — CI do app: GitHub Actions com `lint` + `typecheck` (`tsc --noEmit`) + `build`
  em pull request e push (npm; branches deste repo, `master`).
- **Entrou durante a execução** (motivo: CI nascer verde e gate real):
  - O `middleware.ts` na raiz **nunca rodou** (com app em `src/app`, o Next 15 só lê
    `src/middleware.ts`) — movido. Bônus: páginas passaram a exigir sessão de verdade.
  - 23 erros de lint pré-existentes corrigidos (o CI roda lint e nasceria vermelho),
    incluindo remoção antecipada das páginas falsas `/login/google` e `/login/microsoft`
    (era T1.2; importavam um módulo inexistente e já estavam quebradas) e a correção de
    hooks condicionais em `more.tsx` (bug real de render).

**Não entra (fora de escopo):**
- Hash de senha, Better Auth, destruição do token base64 (T1.2) — **W0 fecha a exposição;
  a senha segue em texto puro no banco até a T1.2.**
- Leitura via service role, RLS, `supabase-js` anon fora do bundle cliente (T1.3).
- Migrations (T1.1), deploy (T1.4), suite de testes (T2.3), renames de domínio (W7).

## Comportamento / fluxos

- Boot com env obrigatória faltando → falha imediata com mensagem apontando a variável.
- Requisição a `/api/*` sem sessão → 401; `/api/health` permanece aberto.
- Nenhuma resposta de API contém o campo `password`.
- `/api/data` responde tags e comments sem os campos de erro `tagError`/`commentsError`.
- Pull request e push disparam lint + typecheck + build; PR que quebra o build fica
  vermelho antes da revisão (ADR-0012).

## Impacto técnico

- **Banco:** nenhum.
- **API:** todas as rotas GET existentes (7) + `/api/health` nova, `src/middleware.ts`
  (movido da raiz, onde o Next 15 não o lia), novo `src/shared/lib/env.ts`,
  `package.json` (dependência zod + script `typecheck`).
- **UI:** possivelmente o cliente de fetch das páginas que leem `/api` (enviar sessão) —
  a confirmar na implementação.

## Regras de negócio relacionadas

Nenhuma em [`../negocio/`](../../negocio/) — referência: [`plano.md`](../../../plano.md)
§2 (problemas graves) e §5 (W0).

## Critérios de aceite

<!-- kit:criterios -->
- [x] App falha no boot com env faltando (mensagem nomeia a variável); `.env.example` commitado — verificado: build com env vazia falha citando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `curl /api/users` sem sessão → 401 — verificado (JSON `{"error":"Não autenticado."}`)
- [x] Nenhuma resposta de `/api` contém `password` — selects explícitos nas 4 rotas que leem tabelas com coluna sensível; verificado por código e gate; **execução contra o banco real pendente** (ambiente de desenvolvimento desta sessão sem rede até o Supabase)
- [x] `/api/data` não retorna `tagError`/`commentsError` — bug corrigido (checava `tagError` duas vezes)
- [x] CI roda lint + typecheck + build em PR e push — workflow reescrito; lint/typecheck/build verdes localmente com os mesmos passos; check vermelho em PR depende de push (do usuário)
<!-- /kit:criterios -->

## Dívida / não exercitado

- O `pr.yml` preexistente era resíduo de outro template (yarn, Sonar, `format:check`,
  branches `main`/`dev` — nada disso existe neste repo) e foi reescrito, não reaproveitado.
- **Selects sem `password` não rodaram contra o banco real** (sandbox sem rede até o
  Supabase). Colunas derivadas dos CSVs que foram carregados à mão nas tabelas + tipos;
  primeiro acesso real pode precisar de ajuste fino de coluna.
- Senha continua em texto puro no banco e o token base64 segue falsificável até a T1.2 —
  W0 fecha a exposição, não o armazenamento nem a assinatura.
- Browser ainda lê `user_data` direto via client anon no login (`useAuth` →
  `authService.login` roda no cliente) — fechado na T1.3 (service role).
- CI sem passo de teste: repo não tem suite; o passo entra quando a T2.3 criar o runner.
- Repo roda Next **15.4.6**: `src/middleware.ts` é o nome certo aqui; quando houver
  upgrade para 16, vira `src/proxy.ts` (skill `next16` já descreve o pós-upgrade).

## Decisões em aberto

- (resolvida na execução) UI não precisou mudar para enviar sessão: fetch same-origin
  envia cookie por padrão, e as páginas agora exigem sessão de verdade.
- `DATABASE_URL` e `BETTER_AUTH_*` ficaram **opcionais** no schema até a W1 consumi-las
  — viram obrigatórias em T1.1/T1.2 (anotado no `.env.example` e em `env.ts`).
