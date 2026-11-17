# ArtistRank: motor puro

**Status:** em-desenvolvimento
**Responsabilidade:** ranking
**Branch:** feature/api-01/artistrank-motor-puro
**Autor:** BugRed · **Data:** 2026-11-17

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica, motor sem banco (persistência é T5.5, depois da O3)
- [ ] service — `src/server/ranking/`: elegibilidade, oito fatores, teto, confiança (funções puras)
- [x] controller — não se aplica, nada o chama ainda
- [x] route — não se aplica
- [x] ui — não se aplica; o ADR 0019 já consome `fatores[]` e a troca do motor do protótipo é outra feature
- [ ] teste — casos da spec §27.5 e os 14 editais de `docs/search/` como fixtures
- [ ] doc — spec §28/§29 só se o código divergir; ADR se surgir decisão de arquitetura
<!-- /kit:camadas -->

**Próximo passo:** rodar a skill `grill-regra-negocio` sobre os pontos abertos abaixo, antes de escrever qualquer
`*.service.ts`; depois T5.1 (elegibilidade), com teste primeiro.

## Problema / motivação
O motor do protótipo (`src/shared/lib/artistrank.ts`) tem sete fatores, renormaliza fator ausente e descarta as notas
por fator. A spec (§9, §28) pede oito fatores, nota neutra 0,5 sem renormalizar, teto de 45 e confiança separada. O
benchmark real (spec §29) já dá dados para travar o comportamento antes de qualquer banco ou UI.

## Escopo
**Entra** (plano W5, T5.1 a T5.4 e T5.6):
- T5.1 elegibilidade `PASS/FAIL/UNKNOWN/NOT_APPLICABLE`, pura.
- T5.2 oito fatores e pesos versionados em configuração; nulo = 0,5; cobertura calculada.
- T5.3 combinação artista/portfólio, teto de 45 depois da combinação, CORE/SUPPORT.
- T5.4 confiança C separada, sem efeito no score.
- T5.6 regressão: casos da §27.5 e os 14 editais reais como fixtures, rodando no CI.
- Saída com `fatores[]` (id, grupo, rótulo, peso, nota ou `null`), como pede o ADR 0019.

**Não entra:**
- Persistência das recomendações (T5.5), taxonomia, perfil profundo (O3).
- Embeddings, LLM, projeção sobre a banca, poder discriminante por edital.
- Trocar o motor do protótipo na UI.
- Calibrar pesos, `alpha` ou limiares (spec §29.3: sem variância nos dados).

## Comportamento / fluxos
Entrada: perfil do artista, obras e edital estruturado. Saída: elegibilidade; se não for `FAIL`, score bruto, teto
aplicado (com requisito, evidência e nota antes do teto), `fatores[]`, cobertura e confiança C. Inelegível não recebe
score. Mesma entrada, mesma saída.

## Impacto técnico
- **Banco:** nenhum.
- **API:** nenhuma rota; módulo `src/server/ranking/` (schema zod das entradas, service puro).
- **UI:** nenhuma.

## Regras de negócio relacionadas
Spec do ArtistRank, [§28](../../ops/ArtistRank_decisoes_e_especificacao_completa_v1.2_conferencia.md) (ordem de
precedência), §9.3.1, §9.3.2, §27.5 e §29.5. Não reescrevo a regra aqui.

## Critérios de aceite

<!-- kit:criterios -->
- [ ] `FAIL` em eliminatório bloqueia, e nota artística alta não compensa
- [ ] Fator sem dado vale 0,5, sem renormalizar, e a cobertura sai à parte
- [ ] Teto de 45 incide no score combinado; `UNKNOWN` não o ativa; o motivo sai no resultado
- [ ] Fotografia × Festival de Dança dá 45,0 (CORE/SUPPORT + teto); o caso v0 = 67,0 reprova
- [ ] Renormalizar nulos (v0) reprova no Multilinguagens PNAB 2026 (ganhador 4º na v0, 1º na v4)
- [ ] Nos 14 editais de `docs/search/`: ganhador no top 3 em 14/14 e no topo em 13/14; o Virado em 2º é o esperado
- [ ] Alterar a confiança C não altera a ordem do ranking
- [ ] Pesos e versão do algoritmo vêm de configuração versionada, não de literais no cálculo
<!-- /kit:criterios -->

## Dívida / não exercitado
- Os números da spec (§27.5, §29) são do relatório; só aqui serão reproduzidos pela primeira vez.
- Os perfis reais são mínimos e circulares (§29.3): o teste dos 14 editais protege contra regressão, não prova qualidade.

## Decisões em aberto
Para a `grill-regra-negocio`, antes do código:
- Como o edital estruturado e o perfil entram no motor sem a taxonomia da O3 (formato de entrada provisório)?
- Valor de `alpha` do portfólio: usar 0,6, o único exercitado?
- Escala das notas por fator: só os cinco degraus 0/0,25/0,5/0,75/1?
- Onde fica a fronteira de "requisito artístico obrigatório" frente ao `UNKNOWN`?
