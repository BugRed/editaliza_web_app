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

**Próximo passo:** **começar pela entrevista** (skill `grill-regra-negocio`): a rodada 1, abaixo, já está escrita. Nenhuma
linha de `*.service.ts` antes de o usuário responder e de a regra ser registrada em `docs/negocio/`. Depois, T5.1
(elegibilidade) com teste primeiro. Antes de abrir a sessão, ler a spec do ArtistRank §28, §29 e §30.

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
- [ ] Os 9 casos de `docs/search/v3/data_v3/casos_elegibilidade_teto.json` passam (território FAIL e UNKNOWN, linguagem UNKNOWN sem teto, core FAIL e suporte que não casa core com teto 45, preferência sem teto)
- [ ] Fotografia × Festival de Dança dá 45,0; o caso v0 = 67,0 reprova
- [ ] Lista de linguagens é "qualquer uma": o ganhador do Multilinguagens PNAB 2026 não cai (na v2 ficava em 92º de 623), e a média das alternativas reprova
- [ ] Rank 1 por empate é lido como empate: o teste afirma que a âncora **não fica abaixo de ninguém** e não promete destaque (AUC da v3 é 0,52)
- [ ] Alterar a confiança C não altera a ordem do ranking
- [ ] Pesos, alpha e versão do algoritmo vêm de configuração versionada, não de literais no cálculo
- [ ] Portfólio e artista são calculados separados, sem contar o mesmo fator duas vezes (ver P7)
<!-- /kit:criterios -->

## Dívida / não exercitado
- O motor de referência (`docs/search/v3/engine_v3.py`) é Python; este motor é TypeScript. A equivalência só se prova
  rodando o mesmo corpus nos dois, e isso ainda não existe.
- O benchmark não valida trajetória, viabilidade, conceito, técnica nem posicionamento: as notas empatam (AUC 0,52).
  Os pesos e as heurísticas desses fatores são provisórios (P11).
- O alpha não foi exercitado (3 de 52 artistas têm 3 ou mais obras).

## Decisões da entrevista (2026-11-17)
Respondidas pelo usuário na `grill-regra-negocio`. Falta a confirmação final do resumo e o registro em `docs/negocio/`.
- **Entrada (B2):** o motor novo nasce em `src/server/ranking/` com o contrato rico (`strength`, `role`, obras,
  estados de elegibilidade). O protótipo (`shared/lib/artistrank.ts`) fica como está até uma feature de UI trocar um
  pelo outro. O plano §6.0 cita `src/server/artistrank/`: alinhar o nome ao registrar a regra.
- **Alpha:** parâmetro configurável, padrão 0,6; varredura em 0,0 · 0,4 · 0,6 · 0,8 · 1,0 sobre o corpus multi-obra
  do benchmark v3 (`docs/search/prompt_benchmark_v3.md`). Até lá, só casos sintéticos.
- **Escala:** nota interna contínua de 0 a 1 (100 = 1); fator sem dado é `null` em `fatores[]` e vale 0,5 no cálculo.
- **Teto de 45:** só com requisito artístico `explicit_mandatory` em `FAIL`; campo vazio é `UNKNOWN` e não ativa;
  linguagem `core` obrigatória só casa com `core`; o resultado diz qual requisito, a evidência e a nota antes do teto.
- **Fatores textuais:** fração dos itens exigidos que o perfil cobre, por igualdade normalizada, com a similaridade
  injetada como função. O adaptador do Voyage e o A/B ficam para a feature seguinte. **Reaberto pela v3:** o motor de
  referência usa correspondência graduada (ver P8).
- **Benchmark v3:** pronto e reproduzido (`docs/search/v3/`, spec do ArtistRank §30). O resultado forte é de empate (AUC 0,52): serve de proteção contra regressão, não de prova de separação.

## Entrevista de regra de negócio, rodada 1 (a fazer, primeiro)

Contexto: a v3 do benchmark (spec do ArtistRank §30) trouxe um motor de referência em Python
(`docs/search/v3/engine_v3.py`) e três achados que mudam o que já estava decidido. As perguntas abaixo são a **fronteira**:
não dependem umas das outras. As que dependem de respostas daqui ficam na rodada 2 (no fim). Cada uma traz a minha
recomendação; as decisões são do usuário.

❓ **P6** — **Lista de linguagens do edital é "qualquer uma"**: um edital que aceita várias linguagens na mesma exigência
(ex.: o Multilinguagens, com 14) deve pontuar pela **melhor** correspondência, não pela média. Com a média, um artista
de circo caía para o 92º de 623 numa lista de 14 linguagens. O teto de 45 só dispara se **nenhuma** das alternativas
casa. E se o edital exige linguagens diferentes em **exigências separadas** (uma de dança e outra de música)? Aí cada
exigência conta como obrigatória por si.

➡️ Sim: dentro de uma mesma exigência vale o máximo; exigências distintas valem todas. Sai da referência da v3 e da
correção que ela fez no Multilinguagens.

---

❓ **P7** — **Como separar artista e portfólio sem contar um fator duas vezes**: o motor de referência calcula
`artist_score` com os **oito** fatores, incluindo o fator de obra (O), e depois soma `0,65·O`. A spec (§9.6) manda calcular
`R_artista` e `R_obra` separados e combinar 0,35/0,65. Duas leituras:
- (a) `R_artista` usa os fatores do perfil (L, C, T, P, H, G, V) e `R_portfólio` usa só os fatores da obra (L, C, T e
  viabilidade, avaliados na **obra**); o fator O deixa de existir como fator à parte.
- (b) Os dois usam os oito pesos 15/20/10/15/10/15/5/10, cada lado avaliando o que tem dado e deixando o resto nulo (0,5).

Em (b) os fatores sem dado de cada lado empurram os dois para o meio e achatam o score; em (a) os pesos de cada grupo
precisam ser redefinidos (somam menos de 100 por grupo) e isso é uma decisão nova.

➡️ (a), com os pesos de cada grupo **escalados para somar 100 dentro do grupo sem renormalizar por dado ausente**
(a escala é fixa, vem da configuração; dado ausente continua valendo 0,5). Mantém o 0,35/0,65 e o ADR 0019 (barras por
grupo).

---

❓ **P8** — **Correspondência graduada ou igualdade**: a referência dá nota 1,0 à linguagem igual, 0,6 a pai/filho
(fotografia × artes visuais) e 0,3 a irmãs; para conceito dá 1,0 ao central, 0,6 ao secundário e 0,4 a um sinônimo
parcial. Essas tabelas são da referência, **não** da taxonomia da O3. Na entrevista anterior (P5) decidimos igualdade
normalizada. Mantém igualdade ou adota a graduada como configuração provisória, versionada, que a taxonomia da O3
substitui?

➡️ Graduada **só para linguagem** (pai/filho 0,6, irmãs 0,3), em tabela versionada e trocável, porque sem ela uma
fotografia contra "artes visuais" daria zero e o teto de 45 dispararia por engano. Conceito, técnica e posicionamento
ficam por igualdade normalizada até a O3 (sem tabela de sinônimos inventada).

---

❓ **P9** — **O que pode ativar o teto de 45**: a spec (§9.3.1) cita linguagem núcleo, posicionamento e nicho
obrigatórios. A referência também aplica o teto a **conceito** obrigatório. Quais tipos de requisito artístico
obrigatório (`explicit_mandatory`) valem? Lembrando: campo vazio do artista é `UNKNOWN` e nunca ativa.

➡️ Linguagem núcleo, posicionamento e nicho (como a spec). Conceito obrigatório **não** ativa o teto enquanto não houver
taxonomia: igualdade de texto livre erraria demais e daria teto injusto. Entra na rodada da O3.

---

❓ **P10** — **Território além do Recife**: a referência só conhece `city_recife`, `metro_recife` e `state_pe`. O produto
tem `MUNICIPAL`, `METROPOLITANO`, `ESTADUAL` e `NACIONAL`. Território exigido pelo edital é **eliminatório** (FAIL) quando o
artista está num nível menor que o exigido, e vazio é `UNKNOWN`. O nível `NACIONAL` do edital aceita qualquer artista?
E "metropolitano" precisa saber a cidade (Olinda está na região metropolitana do Recife) ou basta o nível declarado?

➡️ Hierarquia `MUNICIPAL < METROPOLITANO < ESTADUAL < NACIONAL` comparando o **nível declarado** com o exigido; `NACIONAL`
no edital aceita todos. Cidade e UF só entram no motivo mostrado ao usuário, não na decisão. A decisão fina por cidade
fica para a taxonomia geográfica da O3.

---

❓ **P11** — **Trajetória e viabilidade: heurísticas da referência**: trajetória = `0,5·relevância + 0,3·fração
verificada + 0,2·tempo (teto de 15 anos)`; viabilidade perde `0,25` por violação (sem equipe, documentação incompleta,
sem obra pronta). São números **sem validação** (o benchmark empata nesses fatores). Entram como padrão provisório?

➡️ Sim, como configuração versionada **marcada "provisória, sem validação"** no código e na doc, com teste só de
comportamento (mais trajetória verificada não pode diminuir a nota; violação nunca aumenta). Não calibrar antes de haver
variância nos dados (spec §30.4).

---

❓ **P12** — **Como testar sem ter AUC**: a v3 prova que o ganhador **nunca fica abaixo de ninguém**, mas por empate. Os
10 editais com não-ganhadores empatam as notas. Que testes valem como regressão?
- (i) os 9 casos de teto/elegibilidade (valores exatos);
- (ii) o caso Multilinguagens (qualquer uma);
- (iii) "âncora não fica abaixo de nenhum concorrente" nos 10 editais, lido como **empate permitido**;
- (iv) nenhuma meta de MRR, AUC ou Hit@1.

➡️ (i), (ii) e (iii), sem (iv). O teste (iii) escreve no nome que rank 1 por empate **não** é prova de separação.

---

❓ **P13** — **Quanto do corpus vira fixture**: o dataset completo (`dataset_v3_full.json`) tem cerca de 1,8 MB e 1.038
candidatos. Rodar tudo em todo `yarn test` pesa. Opções: (a) fixtures pequenas versionadas (casos de teto, o
Multilinguagens e dois editais pequenos); (b) o corpus inteiro em um script opcional fora do CI; (c) as duas.

➡️ (c): fixtures pequenas no CI e o corpus inteiro por `yarn rank:corpus`, rodado antes de mexer em pesos ou regras.

---

### Rodada 2 (depende das respostas acima; não perguntar antes)

- **P14** (depende de P7): pesos de cada grupo (artista e portfólio) e como o ADR 0019 mostra os fatores quando o fator O
  deixa de existir (as barras dependem de `fatores[]`).
- **P15** (depende de P7 e P8): nota da obra: a referência usa `0,35·linguagem + 0,35·conceito + 0,20·viabilidade + 0,10·0,8`
  (a constante 0,8 não tem origem). Adotar, trocar ou remover a constante?
- **P16** (depende de P12 e P13): formato de saída do motor para o teste do corpus (entrada e resultado como JSON versionado).
- **P17**: confirmar o resumo final da entrevista e registrar a regra em `docs/negocio/` com a skill
  `documentar-regra-negocio`.

## Decisões em aberto
- As perguntas P6 a P17 acima. As decisões da primeira entrevista (P1 a P5) seguem valendo, exceto onde a P8 reabre a P5.
