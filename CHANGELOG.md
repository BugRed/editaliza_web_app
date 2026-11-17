# Changelog

Impacto externo por entrega; app não versiona build. Novo no topo.

## 2026-11-16 — feature/ui-03: marca "ponto final", favicon e og-image

- **Logo nova** — o nome "editaliza." em serifa (Fraunces) com o ponto final âmbar, e o símbolo "e." num quadrado teal. Substitui o sol do protótipo no menu, no cabeçalho de celular, no login e no cadastro. Guia em [`docs/ui/marca.md`](docs/ui/marca.md).
- **Favicon, ícone de celular e og-image** — `favicon.ico`, `icon.svg` (muda com o tema do sistema), ícone Apple, ícones do app instalável (`manifest`) e imagem de compartilhamento 1200×630. Todos os SVGs em curvas, sem depender de fonte.
- **Metatags** — título, descrição, Open Graph, Twitter e cor do tema; os links absolutos usam `SITE_URL` ou o domínio de produção da Vercel. A frase da og-image ("Editais culturais, em linguagem simples.") é provisória.
- **Scripts** — `scripts/brand/` regenera tudo a partir das fontes.
- **og-image alinhada ao endereço atual** — `SITE_URL=https://editaliza-five.vercel.app` define os links absolutos e vence sobre o domínio que a Vercel informa; precisa existir já no build.

## 2026-11-16 — feature/ui-02: front do editaliza_prot, galeria rica, mídia, selos, anúncios e barras do ranking

- **Front do `editaliza_prot` aqui, exato** — paleta, Roboto, shell em três colunas, feed estilo post, login, perfil, configurações, salvos e publicar edital. O `src` do protótipo foi trazido inteiro; o design anterior (atoms/molecules próprios) foi descartado.
- **Banco corrigido para o front** — migration `0002_colunas_do_front.sql` (perfil do artista e do proponente, critérios estruturados e resumo do edital) e seed regenerado a partir das tabelas do protótipo. Sem as colunas, `/api/artists` e `/api/proposers` davam 500.
- **Banco local em Docker** — `docker-compose.dev.yml` (Postgres 17 + PostgREST + gateway), `yarn dev:db` e `yarn dev:db:setup`; permite logar sem o Supabase da nuvem. Ver `docs/ops/ambiente.md`.
- **Obras expressivas** — título, ano, tipo (imagem, fotografia, vídeo, áudio, texto), linguagem, técnica, dimensões, texto curto, temas e capa; abas por tipo; vídeo e áudio tocam no app (YouTube, Vimeo ou arquivo). O formulário de nova obra coleta tudo isso.
- **Reordenar obras** — subir/descer em Configurações muda a ordem da galeria pública.
- **Perfil do proponente e da empresa** — galeria dos editais publicados; página pública em `/empresas/[id]`, alcançada pelo nome ou avatar no post e por "Organizado por" no resumo.
- **Selos levam a algum lugar** — `/perfil/[id]/selos/[badgeId]` mostra o edital (abre o resumo) e a empresa que concedeu; o formulário escolhe o edital da base. O card de badges deixou de estourar o container com o ano.
- **Publicidade** — banner com imagem no menu lateral (até a linha acima do perfil), dois na direita fixos ao rolar (estilo LinkedIn) e um a cada 3 posts na timeline; sempre "Publicidade", `rel="sponsored"`. Criativos de exemplo, sem rede de anúncios.
- **Coluna da direita** — busca e "Artistas na rede" no topo, no máximo 4 perfis e "Ver mais (n)" recursivo.
- **Clique no card do feed** — imagem e título abrem o resumo, como "Inscrever-se"; o card inteiro não é link. Saiu o balão que repetia a data.
- **Barras do ranking** — o resumo do edital mostra score final, os dois grupos e cada fator em barras (vermelho até 40, amarelo até 70, verde acima), com dropdown por grupo fechado por padrão, "sem informação" para dado ausente e a confiança fora do score ([ADR 0019](docs/adr/0019-artistrank-mostra-barras-por-fator-e-confianca-a-parte.md), proposto). Editais 306–309 de exemplo geram notas baixas.
- **API** — `PATCH /api/artists/[id]` aceita os campos novos de obra e selo e recusa link de mídia inseguro (`javascript:`, `data:`).
- **yarn como único gerenciador** — `yarn.lock` no lugar do `package-lock.json` (versões resolvidas de novo); testes em Docker por `yarn test:docker`, sem rede.
- **Fonte de dados por env (ADR 0020)** — `DATA_SOURCE=mock` em produção (seed em memória, sem Supabase por enquanto) e `supabase` no local, que é sempre o Docker; trocar para o Supabase depois é só mudar a env. O seed (`mock/*.csv`, `db/seed.mjs`, `db/seed-columns.json`) fica no repositório para todo dev e alimenta os dois.
- **Sessão sem `localStorage` (ADR 0021)** — cookie `httpOnly`, `SameSite=Lax`, assinado com HMAC (`AUTH_SECRET`, obrigatória); o token não vai no corpo da resposta nem em storage, e há `POST /api/auth/logout`. O formato antigo (base64 sem assinatura) e o `Authorization: Bearer` deixam de valer.
- **Senha com scrypt** — o cadastro e o seed gravam só o hash; senha em texto puro no banco não confere mais (banco antigo: `yarn dev:db:reset`).
- **CI** — `pr.yml` passa a yarn, ganha o passo de testes e usa `DATA_SOURCE=mock` e um `AUTH_SECRET` de placeholder.
- **Correções de segurança restauradas sobre o backend do protótipo** — só o dono altera o próprio perfil (`PATCH /api/artists/[id]` e `/api/proposers/[id]`, antes qualquer logado alterava qualquer um); só proponente publica edital; `/api/ranking` usa o usuário da sessão e ignora `?artistId=`; páginas sem sessão redirecionam ao login; cookie `SameSite=Lax`; env validada no boot e client Supabase sem tabelas em memória nem senhas no código (o modo sem banco do protótipo, com senhas no código, saiu; o mock novo lê o seed).

## 2026-11-16 — docs/docs-01: replanejamento da V1 (ArtistRank, protótipo, ondas)

- **Plano reescrito** — `plano.md` passa a seguir a spec ArtistRank v1.2 ([`docs/ops/`](docs/ops/ArtistRank_decisoes_e_especificacao_completa_v1.2_conferencia.md)): decisões D3 e D12–D25 (Prisma, Better Auth mantido, DeepSeek, Voyage, schema em inglês, onboarding mínimo, artistas e organizações, candidatura no app, tudo em TS e lançamento gratuito).
- **Roadmap por ondas O1–O5** — design → no ar → editais reais + resumo IA → ArtistRank → semântica e organizações; "V1 publicável" = O1 a O3, sem score até o motor existir.
- **Protótipo `BugRed/editaliza_prot` mapeado** — §11 lista o que aproveitar e o que não pode ser portado (senha em texto puro no cadastro, `?artistId=` aberto no ranking, motor fora da spec).
- Sem mudança de código nesta entrega.

## 2026-10-18 — chore/infra-01: envs server-only, fim do NEXT_PUBLIC_

- **Contrato de env sem `NEXT_PUBLIC_`** — `SUPABASE_URL` + `SUPABASE_API_KEY` (publishable key `sb_publishable_…`, sucessora da anon, mesmas RLS) obrigatórias; `DATABASE_URL`/`DIRECT_URL`/`BETTER_AUTH_*` opcionais até a W1. Boot segue validando com zod no mesmo ponto. CI e `.env.example` no contrato novo; migrations passam a ler a `DIRECT_URL` (pooler sessão). Contrato vivo em [`docs/ops/ambiente.md`](docs/ops/ambiente.md).
- **Vazamento fechado no login** — o `AuthProvider` importava `auth-service` → client Supabase dentro da página `/login`: URL + chave iam para o bundle e a consulta de credenciais rodava no navegador (senha em texto plano como filtro de PostgREST). Auth passa pela borda HTTP: `POST /api/auth/login` (pública no middleware) e `GET /api/auth/me` (protegida); `useAuth` só fala HTTP. Middleware verifica o token com módulo puro (`shared/lib/auth-token`) — o bundle do middleware cai de 90.5 kB para 34.5 kB.
- **Guarda `server-only`** — `env.ts`, client Supabase e `auth-service` importam o pacote: import a partir de código de cliente vira erro de build, não `undefined` silencioso. Foi ela que revelou o vazamento do login. Grep no `.next/static`: zero traços de Supabase.
- **`/`, `/feed` e `/teste` buscam a própria origem** — `NEXT_PUBLIC_BASE_URL` era configuração morta (os fallbacks já resolviam same-origin em dev e prod); fetch relativo, sem env.
- Corrigido no caminho: `verifyToken` do W0 rejeita timestamp ausente/inválido (NaN passava) e lê email com hífen (parse a partir do fim).

## 2026-10-13 — fix/dep-01: deploy na Vercel desbloqueado

- **Next.js 15.4.6 → 15.5.27** — a Vercel bloqueou o build por versão vulnerável. A linha 15.4.x não recebe patch desde jan/2026; 15.5 é o backport mantido do v15 (cobre React2Shell + releases de segurança de mai e ago/2026). `eslint-config-next` na mesma versão. Aviso: 15.5 deprecia `next lint` (removido no 16 — codemod `next-lint-to-eslint-cli` quando do upgrade).
- **`allowScripts` no `package.json`** — npm ≥ 12 só executa install script de pacote aprovado; os três da toolchain (`@tailwindcss/oxide`, `sharp`, `unrs-resolver`) aprovados pinados por versão, sumindo os warnings de install-scripts do build.
- **`npm audit` de 25 para 7 advisories** — bumps de lockfile (`tar` crítica, `ws`, `brace-expansion`, `picomatch`, `postcss`). Os 7 que restam são só-dev ou aninhados ao próprio `next` (dívida registrada).
- **Lint zerado** (43 warnings em 12 arquivos): imports mortos de ícones/tipos, `SafeImage` duplicado e nunca usado em `/` e `/teste`, tipos `HeaderProps`/`FooterProps` órfãos, estados mortos (`hasSaveInteracted`, `setIsMoreOpen`), `catch (error)` sem uso, `checkAuth` movido para dentro do `useEffect` (mesma semântica, cala o `exhaustive-deps`). ESLint ganha `ignoreRestSiblings` para o padrão omit-via-rest. Build local: ✓ compilado sem warnings.

## 2026-10-13 — W1/T1.1: migrations versionadas (spec dados/0001, `chore/db-01`)

- **Schema versionado no repo** — o banco deixa de viver só no console do Supabase: `db/migrations/0001_baseline.sql` (6 tabelas) + runner `db/migrate.mjs` (idempotente, transacional, registro em `_migrations`) + seed `db/seed.mjs` dos mocks (idempotente). Scripts `npm run db:migrate` e `npm run db:seed`.
- Baseline **sem FK de propósito** (os próprios dados reais têm referências penduradas) e derivado dos CSVs + tipos; fidelidade ao schema real fica de conferência com rede (dívida registrada).
- `mock/artist_data.csv` e `mock/editals.csv` normalizados para CSV válido — nenhum parser lia os originais (aspas internas sem escape, coluna vazia extra); valor parseado idêntico.

## 2026-10-13 — W0: correções urgentes e higiene (spec 0001, `bugfix/auth-01`)

- **`/api/*` exige sessão** — 401 em JSON sem cookie; `/api/health` (nova) é a única aberta, para liveness.
- **Vazamento de senhas fechado** — `/api/users`, `/api/data`, `/api/artists` e `/api/proposers` devolviam a coluna `password` (e `cpf`) de todos os registros para qualquer visitante; agora selecionam colunas explícitas.
- **Middleware passa a valer** — estava na raiz, onde o Next 15 com app em `src/` não o lê; movido para `src/middleware.ts`, o que também fez as páginas exigirem login de verdade.
- Env validada com zod no boot (`src/shared/lib/env.ts`); `.env.example` versionado.
- CI real: lint + typecheck + build em PR e push para `master` (o anterior era de outro template e nunca rodaria aqui).
- Corrigidos: bug de `commentsError` em `/api/data`; hooks condicionais no card "mais" do feed; removidas as páginas falsas de OAuth (voltam com Better Auth, W1).
