# Benchmark com ganhadores reais no ArtistRank

**Status:** em-desenvolvimento
**Responsabilidade:** ranking
**Branch:** docs/doc-01/benchmark-real-artistrank
**Autor:** BugRed · **Data:** 2026-11-17

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica, só documentação
- [x] service — não se aplica, nenhuma regra implementada nesta branch
- [x] controller — não se aplica
- [x] route — não se aplica
- [x] ui — não se aplica
- [x] teste — não se aplica; os casos viram testes na O4 (T5.6), esta branch só os especifica
- [ ] doc — spec do ArtistRank (§29), `plano.md` (D25, T5.6, §7.5, §7.9) e `docs/search/` versionado
<!-- /kit:camadas -->

**Próximo passo:** commitar a doc; depois abrir a feature do motor puro da O4 (T5.1–T5.4, T5.6) já com os
casos reais de `docs/search/` como fixtures de regressão.

## Problema / motivação
A spec do ArtistRank (§27) foi validada só com perfis hipotéticos e rótulos de um avaliador. O usuário montou
um benchmark com 14 editais reais de Recife e 26 ganhadores homologados (`docs/search/`). Antes de implementar o
motor, a spec precisa registrar o que esse benchmark confirma, o que ele **não** prova e o que muda no plano.

## Escopo
**Entra:**
- Nova §29 na spec do ArtistRank com resultados, leitura correta e limites do benchmark real.
- Pontos de remissão em §27.3 (D2, D11, D12), §27.9 e §27.10, sem repetir números.
- `plano.md`: D25 (o pacote agora existe em parte), T5.6, §7.5 e §7.9.
- Versionar `docs/search/` (dados, rótulos, relatório), sem as cópias idênticas `(1)`.

**Não entra (fora de escopo):**
- Escrever o motor ou os testes (O4).
- Capturar os 6 editais de Olinda e Caruaru nem as listas de habilitados.
- Mexer no ADR 0019 (aceito não se edita).

## Comportamento / fluxos
Não se aplica; feature só de documentação.

## Impacto técnico
- **Banco / API / UI:** nenhum.
- **Docs:** `docs/ops/ArtistRank_…_conferencia.md`, `plano.md`, `docs/divida.md`, `docs/search/`.

## Regras de negócio relacionadas
Nenhuma regra nova. As regras vigentes seguem a §28 da spec; esta branch só confirma D2, D5 e D6 contra dados reais.

## Critérios de aceite

<!-- kit:criterios -->
- [ ] §29 da spec traz as métricas por configuração e a ressalva de circularidade, com links para `docs/search/`
- [ ] A discrepância "v0 perde dois editais" do relatório está corrigida na §29 (os dados mostram um)
- [ ] `plano.md` não diz mais que o pacote do benchmark está fora do repo e aponta o que ainda falta (o motor)
- [ ] A dívida registra: circularidade, pool sintético, motor ausente do pacote, dados pessoais e o MRR sem poder de calibração
- [ ] Nenhum número é repetido em dois lugares: os demais documentos linkam a §29
<!-- /kit:criterios -->

## Dívida / não exercitado
- Os resultados **não foram reproduzidos aqui**: o repo tem os dados e o gerador (`dataset_real.py`), mas não o motor
  nem o script de calibração. Os números são os do relatório e do `benchmark_real.json`.
- Os perfis herdam a linguagem do próprio edital em que o artista ganhou; ver §29.3 da spec.

## Decisões em aberto
- Nenhuma de regra de negócio. Escolhas tomadas sem diretriz estão no resumo final da sessão.
