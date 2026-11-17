# Prompt para refazer o benchmark do ArtistRank (v3)

> Cole o texto abaixo na IA que fez o benchmark v2. **Anexe junto:** `artistas_reais.json`, `editais_reais.json`,
> `ground_truth.json`, `dataset_real.py`, `benchmark_real.json`, `calibracao_real.json`,
> `relatorio_benchmark_real_v2.pdf`, `registro_editais_ganhadores_reais.xlsx` e, de `docs/editais-exemplo/`,
> o `multi_result.*` (834 inscrições rotuladas).

---

Você vai REFAZER, por inteiro, o benchmark do ArtistRank, um motor que recomenda editais culturais a artistas. A v2
(anexada) usou 14 editais de Recife e 26 ganhadores. A v3 corrige as limitações que o relatório e a revisão dela
apontaram. Leia os anexos antes de começar. Reaproveite o motor e os scripts da v2 (as configurações v0, v2 e v4, a
busca por coordenadas e o leave-one-out). Se não tiver o motor, reconstrua-o pelas regras da seção 6 e diga isso.

## 1. Objetivo

Medir, com ganhadores reais travados, se o motor coloca quem foi premiado no topo, **e se ele separa candidatos
dentro de uma mesma linguagem**, que é o que a v2 não provou. Travar edital e ganhador, e depois reajustar os pesos
com mais chance de acerto.

## 2. Regras inegociáveis

1. **Não invente nenhum dado.** Todo ganhador, projeto, valor e requisito tem fonte (URL ou nome do documento) no
   próprio registro. Dado sem fonte não entra.
2. Se um portal não abrir no seu ambiente, registre o edital como `pendente`, com a URL, e siga. Não preencha de
   memória e não deduza nomes.
3. **Só dado público e minimizado:** resultado oficial, edital, imprensa. Nada de redes sociais pessoais, documento
   pessoal ou dado sensível inferido. Para pessoa física, use só o nome que o resultado oficial publica.
4. **Cada afirmação do relatório precisa bater com o JSON.** Na v2 o texto disse que a v0 "perde dois editais"
   quando os dados mostram um. Confira cada frase do relatório contra `benchmark_*.json` antes de entregar.
5. Separe sempre o que foi **verificado em fonte**, o que foi **derivado** e o que é **hipotético**.

## 3. Corpus: editais e ganhadores travados

- **Pelo menos 20 editais municipais** de **Recife, Olinda e Caruaru**, todos com **resultado oficial publicado**.
  Os 14 de Recife da v2 continuam. Fechar os 6 que ficaram pendentes (as URLs estão em `ground_truth.json`,
  chave `pendentes`) e completar até 20 ou mais, priorizando linguagens e municípios variados.
- Para cada edital: **no máximo 2 âncoras** (ganhadores). Em fomento com vários aprovados, as 2 de maior valor. Os
  demais aprovados entram como `aprovados_adicionais`, excluídos da disputa do próprio edital.
- Por âncora: nome do proponente como no resultado, **título do projeto/obra**, valor, posição, URL da fonte.
- Trave o par: `edital_id` + `ganhador_id`, com ids estáveis. Nenhum ganhador sem projeto e nenhum projeto sem
  ganhador.
- Verificar a regra de residência de cada edital (território elegível) e registrar o texto da fonte.

## 4. O que a v3 acrescenta (todos obrigatórios)

### 4.1 Concorrentes que NÃO ganharam
O pool da v2 só tinha ganhadores, então não media "ganhou × não ganhou". Na v3 cada edital tem, além das âncoras,
candidatos **reais que não ganharam**: habilitados, suplentes, desclassificados, listas de inscritos, quando o
resultado os publica. Use também o `multi_result` (834 inscrições rotuladas: 150 selecionadas, 641 suplentes, 44
desclassificadas). Cada candidato leva `situacao` (`ganhador`, `suplente`, `habilitado`, `desclassificado`) e a
fonte. Quando não houver lista de não ganhadores, diga, e não complete com sintéticos sem marcar.

### 4.2 Quebrar a circularidade da linguagem
Na v2 a linguagem de cada ganhador foi **herdada do segmento do edital** em que ele ganhou, então o fator linguagem
quase garantia o topo. Na v3:
- A linguagem do perfil vem da **evidência própria do artista/obra** (título e descrição do projeto, portfólio
  público citado no resultado), nunca do nome do segmento do edital. Registre `linguagem_origem`:
  `evidencia_propria` ou `edital` (este último só como último recurso, e marcado).
- Inclua **pelo menos 6 artistas multilinguagem** e **pelo menos 8 quase-acertos**: candidatos da mesma linguagem do
  edital que **não** ganharam, para testar a separação **dentro** da linguagem.
- Inclua pares artista × edital de **linguagem diferente** com rótulo 0, para provar que o motor não aprova por
  engano.

### 4.3 Variância nos fatores que hoje ficam neutros
A calibração da v2 ficou plana porque conceito, técnica, posicionamento, trajetória e viabilidade eram neutros (0,5)
para todos. Na v3:
- Extraia **requisitos explícitos** do texto dos editais (conceitos, técnicas, suportes, posicionamento, formato,
  escala), com `strength` e trecho citado. Pelo menos 8 editais com requisito além da linguagem.
- Preencha trajetória, posicionamento, conceitos e técnicas dos perfis **a partir de fonte pública** quando existir.
  Cobertura **variada de verdade** (de 25% a 90%), nunca igual para todos. O que não tiver fonte fica **vazio**, não
  chute.

### 4.4 Casos de elegibilidade e do teto de 45
Pelo menos 8 casos construídos sobre editais reais, cada um com o resultado esperado, para virarem teste:
requisito eliminatório em `FAIL` (território, CNPJ/MEI, formação), em `UNKNOWN` (campo vazio no perfil), linguagem
`core` × `support` (fotografia num festival de dança dá 45), `UNKNOWN` que **não** ativa o teto, e preferência
(`strength: preference`) que nunca ativa o teto.

### 4.5 Texto livre para a camada semântica
Campo `descricao` em cada **obra** (sinopse literal do resultado/imprensa) e em cada **edital** (objeto do edital,
trecho literal). Servirá para comparar TF-IDF × embeddings (Voyage) depois. Cite a fonte de cada texto.

### 4.6 Várias obras por artista (para o alpha)
Na v2 os 30 artistas tinham **uma obra**, então o alpha não alterava nada. Na v3:
- **Pelo menos 12 artistas com 3 a 6 obras**, de fonte pública (projetos anteriores citados em resultados,
  portfólio oficial do proponente, imprensa).
- Dois tipos de portfólio: **pico isolado** (uma obra muito aderente, as outras fracas) e **homogêneo** (várias
  medianamente aderentes).
- **Pelo menos 8 editais** em que "melhor obra" e "média das 3 melhores" discordam sobre quem fica na frente. Sem
  esse conflito a varredura do alpha sai plana. Inclua uma tabela dizendo, por edital, por que discordam.

### 4.7 Contexto de trajetória (experimental, fora do score)
Registre, **só quando o resultado ou o edital publicar**, sinais de ponto de partida e alcance, como `area_periferica`,
cotas declaradas no resultado oficial, edição anterior da mesma pessoa, primeira vez contemplada. Campo
`contexto_trajetoria` por artista, com fonte. **Não use no cálculo do score.** Entregue apenas a análise
descritiva: esse sinal se associa a ganhar mais ou menos, e a trajetória (anos de atuação, obras anteriores)
mostra "partiu de menos e chegou longe"? Não infira renda ou raça de quem não declarou, e não colete dado
sensível sem publicação oficial.

## 5. Rótulos

Para cada par artista × edital elegível: rubrica 0 (sem aderência ou inelegível), 1 (marginal), 2 (boa), 3 (forte).
O ganhador âncora tem rótulo 3 e entra travado. Os demais pares são rotulados por **dois avaliadores
independentes** (dois passes seus, sem ver o outro, se não houver pessoas), com o desacordo registrado e uma
medida de concordância (kappa ponderado). Marque quais rótulos são do ganhador real e quais são de avaliação.

## 6. O motor e as configurações a rodar

Regras do estado atual da spec (v4), a implementar igual:
1. Elegibilidade antes de tudo: `PASS`/`FAIL`/`UNKNOWN`/`NOT_APPLICABLE`. `FAIL` em eliminatório bloqueia e nota
   artística alta nunca compensa. `UNKNOWN` mostra "pendente".
2. Oito fatores e pesos baseline: linguagem 15, conceito 20, técnica 10, posicionamento 15, trajetória 10, obra 15,
   território 5, viabilidade 10. Nota contínua de 0 a 1 por fator.
3. Fator sem dado vale **0,5**, sem renormalizar os pesos. A cobertura sai à parte.
4. Score do artista e do portfólio separados; combinar 0,35 artista + 0,65 portfólio.
5. Teto de **45 no score combinado** só quando há requisito artístico **explícito obrigatório** em `FAIL`
   (campo do perfil preenchido e sem correspondência). Campo vazio é `UNKNOWN` e não ativa o teto. Linguagem
   `core` obrigatória só casa com `core`; casar só com `support` é `FAIL`.
6. `R_portfólio = α · melhor obra + (1 − α) · média das 3 melhores obras`.
7. Confiança C separada (`100·(0,35·cobertura + 0,30·evidências + 0,15·atualidade + 0,20·extração)`), sem efeito
   no score nem na ordem.

Rode: **v0** (nulo = 0, renormalizando, sem teto), **v2** (teto), **v4** (nulo 0,5 + teto + papéis) e **v4 com
pesos iguais**. Faça a **varredura do alpha em {0,0 · 0,4 · 0,6 · 0,8 · 1,0}** sobre o subconjunto multi-obra
(4.6) e diga se algum alpha melhora o MRR e a separação melhor-obra × média.

## 7. Métricas e calibração

- Por configuração: MRR, Hit@1, Hit@3, rank médio do ganhador. Com o pool real (4.1), acrescente **AUC e NDCG@5
  contra os rótulos** e a separação **dentro da linguagem** (4.2).
- **Intervalo de confiança por bootstrap** (por edital) em cada métrica principal.
- **Divisão fixa treino/teste**: escolha, antes de olhar os resultados, cerca de 30% dos editais como teste
  (estratificando por município e linguagem), e liste quais são. Calibre os pesos só no treino.
- Calibração dos 8 pesos por busca por coordenadas (multiplicadores 0,4 a 2,0, três varreduras), com o
  leave-one-out. Informe se **agora** algum peso se move e se o resultado vale no teste. Se continuar plano, explique
  qual fator ainda está neutro.

## 8. Formato dos dados

Mantenha o formato dos anexos (`artistas_*.json`, `editais_*.json`, `ground_truth.json`) e acrescente apenas:
- artista: `linguagem_origem`, `contexto_trajetoria`, e por obra `descricao`; `artworks` com 1 a 6 itens;
- candidato: `situacao` (`ganhador|suplente|habilitado|desclassificado`) e `fonte`;
- edital: `descricao`, `requisitos_explicitos[]` com `trecho` e `strength`, `aprovados_adicionais[]`;
- `ground_truth.json`: âncoras travadas, `excluded`, `pendentes`, rótulos 0 a 3 com `avaliadores` e a marca de
  quais são do ganhador real;
- `casos_elegibilidade_teto.json`: os casos de 4.4 com entrada e saída esperada.

## 9. Entregáveis

1. Todos os JSON acima, **com ids estáveis**, e a planilha `registro_editais_ganhadores_reais.xlsx` atualizada.
2. O código **inteiro**: gerador do dataset, o **motor**, a calibração e um `verify.py` que reproduz cada número do
   relatório a partir dos dados. A v2 não trouxe o motor no pacote; desta vez ele é obrigatório.
3. `verify.py` precisa checar e falhar se: houver mais de 2 âncoras num edital; âncora sem fonte, projeto ou URL;
   id duplicado; edital sem resultado marcado como verificado; candidato sem `situacao`; número do relatório
   diferente do recalculado.
4. Relatório em PDF no estilo do v2, com: sumário executivo; metodologia; registro dos editais; pares travados;
   resultados (por configuração, com IC); alpha; calibração e teste; análise de 4.7; limitações; próximos passos.
   Na primeira página, diga **o que mudou da v2 para a v3 e o que continua não provado**.

## 10. Honestidade e limites

- Se um objetivo não puder ser cumprido (portal fora do ar, lista de habilitados inexistente, poucas obras
  públicas), **entregue o que tem e liste o que faltou**, com a URL ou a causa. Não complete com dados inventados.
- Diga explicitamente o **tamanho final de cada parte** (editais, âncoras, candidatos não ganhadores, artistas
  multi-obra, casos de teto) e compare com o mínimo pedido.
- Não afirme que o motor "acerta" ou "prevê aprovação". O score mede compatibilidade, não probabilidade de ganhar.
