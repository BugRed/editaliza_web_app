# Benchmark com ganhadores reais no ArtistRank

**Status:** entregue
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
- [x] doc — spec do ArtistRank (§29 e §30), `plano.md` (D25, T5.6, §7.5), dívida e `docs/search/` (v2 e v3) versionados
<!-- /kit:camadas -->

**Próximo passo:** nenhum nesta feature. A entrevista de regra de negócio do motor é a primeira tarefa da feature `feature/api-01/artistrank-motor-puro` (spec `0002`), já com as perguntas escritas.

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
- [x] §29 e §30 da spec trazem as métricas por configuração e as ressalvas (circularidade na v2; empate e AUC 0,52 na v3), com links para `docs/search/`
- [x] As discrepâncias dos relatórios estão corrigidas: "v0 perde dois editais" (v2, os dados mostram um) e "1 edital de discordância melhor × média" (v3, o JSON mostra 0)
- [x] `plano.md` não diz mais que o pacote do benchmark está fora do repo: aponta `docs/search/v3/` e o motor de referência em Python
- [x] A dívida registra: empate e AUC 0,52, itens 4.5 e 4.6 incompletos, nomes reais no repo e a captura parcial dos pendentes
- [x] Os números vivem na spec do ArtistRank (§29 e §30); os demais documentos linkam
<!-- /kit:criterios -->

## Dívida / não exercitado
- **v3 reproduzida** (`verify.py` e `experiments_v3.py` em `docs/search/v3/`, idêntico ao entregue). A v2 não foi reproduzida: o repo não tem o motor dela.
- Os perfis da v2 herdavam a linguagem do edital (§29.3); a v3 corrigiu isso, mas o resultado é de empate (§30.4).
- `docs/search/` mistura arquivos da v1.1 e da v2 sem pasta; só a v3 está organizada (`docs/search/v3/`).
- Itens 4.5 (descrição dos editais) e 4.6 (várias obras por artista) da v3 seguem incompletos.

## Decisões em aberto
- Nenhuma de regra de negócio. Escolhas tomadas sem diretriz estão no resumo final da sessão.
