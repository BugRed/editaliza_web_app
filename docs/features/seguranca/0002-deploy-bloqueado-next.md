# dep-01 — Deploy bloqueado por versão vulnerável do Next.js

**Status:** em-desenvolvimento
**Responsabilidade:** seguranca
**Branch:** fix/dep-01/seguranca-next-e-lint
**Autor:** BugRed · **Data:** 2026-10-13

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica: sem toque em schema
- [x] service — não se aplica: sem regra de negócio nova
- [x] controller — não se aplica: idem
- [x] route — não se aplica: nenhuma rota `/api` tocada
- [x] ui — limpeza de código morto em `/`, `/feed`, `/teste` e componentes do card; `checkAuth` movido para dentro do `useEffect`
- [x] teste — não se aplica como suite (sem runner no repo); gate = lint + typecheck + build locais verdes após a última edição de código
- [x] doc — CHANGELOG.md e docs/divida.md no mesmo corte
<!-- /kit:camadas -->

**Próximo passo:** Push + PR são do usuário (commits feitos). No deploy da Vercel, conferir que o build passa sem o bloqueio de segurança (redeploy com cache limpo) e re-avaliar bump após o release out-of-band de 14/10/2026.

## Problema / motivação

A Vercel bloqueou o deploy com "Vulnerable version of Next.js detected, please update
immediately" e avisos de install-scripts do npm ≥ 12. O Next 15.4.6 está numa linha morta:
o último patch (15.4.11) é de jan/2026, mas os releases de segurança vieram depois —
React2Shell (dez/2025, corrigido na 15.4.8) e os de mai/2026 (13 advisories: middleware
bypass, SSRF, cache poisoning, XSS) e ago/2026, que só patchearam as linhas 15.5.x/16.x.
O log ainda mostrava 14 warnings de lint em `/feed` (43 na branch inteira) e `npm audit`
apontava 25 vulnerabilidades transitivas.

## Escopo

**Entra:**
- Next **15.4.6 → 15.5.27** (backport mantido do v15, dist-tag `backport`) +
  `eslint-config-next` na mesma versão. Upgrade para 16 fica na onda planejada (skill
  `next16`); 15.5.27 deprecia `next lint` (codemod `next-lint-to-eslint-cli` lá).
- **`allowScripts`** no `package.json` com `@tailwindcss/oxide@4.1.11`, `sharp@0.34.3` e
  `unrs-resolver@1.11.1` pinados por versão — npm ≥ 12 só roda install script de pacote
  aprovado.
- `npm audit fix` (não-destrutivo): 25 → 7 advisories (crítica era `tar@7.4.3`, transitivo
  do Tailwind; `ws`, `brace-expansion`, `picomatch`, `postcss` da toolchain bumpados no
  lockfile).
- **Lint zero**: imports mortos de ícones/tipos em 12 arquivos, `SafeImage` duplicado e
  nunca usado em `/` e `/teste`, tipos `HeaderProps`/`FooterProps` órfãos, estados mortos
  (`hasSaveInteracted`, `setIsMoreOpen`), `catch (error)` sem uso, `checkAuth` movido para
  dentro do `useEffect` (mesma semântica). ESLint ganha `ignoreRestSiblings` para o padrão
  omit-via-rest do `Artist.ts`.

**Não entra (fora de escopo):**
- Upgrade para Next 16 (já planejado; resolve os advisories restantes — ver Dívida).
- Migrar `<img>` do `CardImage` para `next/image` (auditar dimensão/fill do CSS module).
- Hash de senha/Better Auth (T1.2), suite de testes (T2.3).

## Comportamento / fluxos

- Sem mudança de comportamento em runtime: só remoção de código morto e dependências.
  Única semântica tocada: `checkAuth` roda na montagem como antes, agora definido dentro
  do `useEffect`.
- Build da Vercel: sem o bloqueio de versão vulnerável, sem warnings de install-scripts,
  sem warnings de lint.

## Impacto técnico

- **Banco:** nenhum.
- **API:** nenhum (`src/middleware.ts` só perde `catch (error)` sem uso).
- **UI:** `/` e `/teste` perdem o componente morto `SafeImage` e imports não usados;
  `more.tsx` perde setter morto; `InteractButtonsCardFeed` perde estado nunca lido;
  `CardImage` mantém `<img>` com `eslint-disable` justificado.

## Regras de negócio relacionadas

Nenhuma em [`../negocio/`](../../negocio/) — correção de infraestrutura de build/deploy.

## Critérios de aceite

<!-- kit:criterios -->
- [x] `next@15.5.27` + `eslint-config-next@15.5.27` instalados e build de produção local verde — verificado: 15 rotas geradas, middleware 90.5 kB
- [x] Warnings de install-scripts cobertos — verificado: `allowScripts` pinado por versão no `package.json` (os 3 pacotes do log da Vercel)
- [x] `npm audit` sem advisories corrigíveis sem quebra — verificado: 25 → 7; `npm audit fix` aplicado até onde não exigia `--force`
- [x] Lint sem warnings nem erros — verificado: `npm run lint` → "✔ No ESLint warnings or errors" (antes: 43 warnings em 12 arquivos)
- [x] Typecheck limpo — verificado: `tsc --noEmit` sem erro
- [ ] Deploy da Vercel verde com cache limpo — **pendente push** (do usuário); a Vercel pediu redeploy após limpar o cache de dependências
<!-- /kit:criterios -->

## Dívida / não exercitado

- 7 advisories ficam de propósito (registrados em [`docs/divida.md`](../../divida.md)):
  `postcss@8.4.31` aninhado sob o `next` (fix exige `next@16`) e cadeia `braces→@next/eslint-plugin-next`
  só-dev, cujo "fix" do npm rebaixaria o `eslint-config-next` para 14 — recusado.
- `<img>` do `CardImage` segue com `eslint-disable` justificado — migração para
  `next/image` exige auditar dimensão/fill do CSS module do card.
- Release out-of-band do Next em **14/10/2026** (2 críticos + 1 alto anunciados) pode
  exigir re-bump — conferir dist-tag `backport`.
- Deploy na Vercel não exercitado desta sessão (push é do usuário).

## Decisões em aberto

- (decidido na execução) **15.5.27 em vez de 16.4.0**: patch de segurança na linha
  mantida do v15; major upgrade é a onda planejada com a skill `next16`.
- (decidido na execução) Recusado o `npm audit fix --force`: rebaixaria
  `eslint-config-next` para 14 e/ou instaliria `next@16` fora do plano.
- (decidido na execução) `ignoreRestSiblings: true` no ESLint em vez de disable inline
  no `Artist.ts`: convenção de lint nasce no config, não na linha.
