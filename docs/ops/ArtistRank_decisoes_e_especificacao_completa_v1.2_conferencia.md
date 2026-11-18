# ArtistRank --- Registro mestre de decisões e especificação do projeto

> **Versão 1.2 — revisão empírica conferida (16/11/2026).** Esta edição incorpora o relatório *ArtistRank: Avaliação Empírica das Decisões*, baseado em 12 editais estruturados, 12 perfis hipotéticos e 144 pares artista–edital. As decisões originais continuam registradas, mas regras corrigidas por experimento passam a prevalecer. Hipóteses ainda não testadas estão identificadas como pendências. O benchmark não representa resultados de editais reais nem probabilidade de aprovação. **Atualização de 17/11/2026:** a §29 registra um segundo benchmark, com ganhadores reais de 14 editais de Recife, e os limites do que ele prova.

> **Documento de consolidação:** reúne as decisões tomadas, propostas
> técnicas discutidas, parâmetros iniciais, alternativas consideradas,
> ressalvas e pontos ainda não definidos para o ArtistRank.
>
> **Objetivo:** manter um registro abrangente para orientar
> implementação, documentação, desenvolvimento e futuras revisões.
>
> **Importante:** este documento diferencia decisões confirmadas de
> propostas/recomendações e hipóteses iniciais. Uma sugestão discutida
> não deve ser interpretada automaticamente como decisão final se isso
> não foi explicitamente confirmado.

------------------------------------------------------------------------

## 1. Visão geral do produto

O **ArtistRank** será um sistema de recomendação que associa editais,
chamadas públicas e oportunidades culturais/artísticas a artistas e às
suas obras.

A ideia é ir além de uma busca por palavras-chave. O sistema deverá
avaliar a compatibilidade entre:

-   O perfil e o posicionamento artístico do artista.
-   A trajetória e as experiências do artista.
-   As obras individuais que compõem seu portfólio.
-   As técnicas, suportes, materiais, formatos e necessidades técnicas
    das obras.
-   Os conceitos, temas, pesquisas e intenções artísticas.
-   Os requisitos, objetivos, critérios e condições do edital.
-   A viabilidade prática de participação, produção, montagem,
    circulação ou execução.

O resultado será uma recomendação explicável, com pontuação de
compatibilidade, confiança dos dados, situação de elegibilidade e
evidências que sustentam a indicação.

O algoritmo foi inspirado conceitualmente em sistemas de
ranking/recomendação como o EdgeRank, mas não será uma cópia do
EdgeRank. O ArtistRank terá um motor próprio, orientado ao domínio
artístico e cultural.

### 1.1 Objetos de recomendação --- decisão confirmada

**Decisão: `both` --- recomendar artistas e obras.**

O sistema deverá produzir:

1.  Recomendações de artistas para editais.
2.  Recomendações de obras específicas para editais.
3.  Relações entre artista, obra e oportunidade.
4.  No futuro, sugestões de projetos futuros que poderiam ser
    desenvolvidos para determinada oportunidade, sem distorcer a
    identidade artística do artista.

O perfil do artista e cada obra serão avaliados separadamente. A
recomendação de uma obra não deve ser confundida com a recomendação
geral do artista.

### 1.2 Funcionamento do motor --- decisão confirmada

**Decisão: `hybrid` --- funcionamento híbrido.**

Combinar:

-   Regras determinísticas.
-   Taxonomia controlada.
-   Correspondência exata e hierárquica.
-   Similaridade semântica por embeddings.
-   Pesos configuráveis.
-   Evidências documentais.
-   Revisão humana em casos ambíguos.

O sistema não dependerá exclusivamente de palavras-chave nem
exclusivamente de IA generativa.

### 1.3 Profundidade do perfil --- decisão confirmada

**Decisão: `deep` --- perfil profundo.**

O cadastro deverá permitir informações detalhadas sobre identidade,
posicionamento, trajetória, formação, experiências, obras, técnicas,
materiais, suportes, conceitos, documentação, disponibilidade e
necessidades práticas.

O perfil profundo não significa obrigar todos os artistas a preencher
todos os campos. Campos ausentes deverão ser tratados como
desconhecidos, não como incompatibilidade.

------------------------------------------------------------------------

## 2. Princípios fundamentais

1.  **Compatibilidade não é probabilidade de vitória.** Uma pontuação
    alta significa afinidade com o edital, não chance percentual de ser
    selecionado.
2.  **Elegibilidade é diferente de compatibilidade.** Requisitos
    eliminatórios devem ser avaliados antes do ranking.
3.  **Ausência de informação não é incompatibilidade.** Um dado não
    informado deve ser marcado como desconhecido.
4.  **Toda exigência importante precisa de evidência.** O sistema deve
    guardar documento, página, trecho ou referência que sustente o
    requisito.
5.  **O resultado deve ser explicável.** O usuário precisa entender por
    que um artista ou obra foi recomendado.
6.  **A obra deve ser avaliada individualmente.** O perfil do artista
    não substitui a análise de cada obra.
7.  **A trajetória deve ser contextualizada.** Não basta contar
    experiências; é preciso considerar sua natureza e relação com a
    oportunidade.
8.  **Não inventar requisitos.** Um LLM pode sugerir interpretações, mas
    o sistema deve validar a origem documental.
9.  **Não inferir identidade social indevidamente.** Categorias como
    arte periférica, popular ou comunitária devem ser autodeclaradas ou
    sustentadas por evidências do trabalho; não inferidas apenas por
    endereço ou origem social.
10. **Ranking reproduzível.** Cada resultado deverá registrar versão do
    algoritmo, pesos, dados utilizados e data de cálculo.
11. **Taxonomia extensível.** Novas linguagens, técnicas, materiais e
    conceitos poderão ser adicionados sem quebrar dados anteriores.
12. **IA não substitui regras de negócio.** Cálculos, elegibilidade e
    ranking devem ser implementados em código determinístico.
13. **O sistema deve diferenciar declaração, inferência e comprovação.**
14. **O feedback do usuário deve ser registrado com motivo.** Uma
    rejeição pode ocorrer por falta de interesse, disponibilidade,
    orçamento ou preferência, e não necessariamente por
    incompatibilidade artística.

------------------------------------------------------------------------

## 3. Perfil profundo do artista

### 3.1 Identidade e posicionamento

O perfil deve conter, quando disponíveis:

-   Nome artístico.
-   Nome civil, se necessário e com tratamento adequado de privacidade.
-   Biografia.
-   Declaração artística / artist statement.
-   Descrição da pesquisa artística.
-   Linguagens principais.
-   Linguagens secundárias.
-   Posicionamento artístico principal.
-   Posicionamentos secundários.
-   Nichos e campos de atuação.
-   Território de atuação declarado.
-   Públicos com os quais trabalha.
-   Temas recorrentes.
-   Interesses de pesquisa.
-   Idiomas de apresentação do portfólio.
-   Links para site, portfólio, redes e publicações.
-   Preferências e objetivos profissionais/artísticos.

O posicionamento artístico é diferente da linguagem. Dois artistas podem
trabalhar com fotografia e ocupar campos artísticos bastante diferentes.

### 3.2 Linguagens artísticas

Taxonomia inicial proposta:

``` text
artistic_language
├── artes_visuais
│   ├── pintura
│   ├── desenho
│   ├── gravura
│   ├── fotografia
│   ├── escultura
│   ├── instalacao
│   ├── performance  # ocorrência em artes_visuais; classificação pendente de governança
│   ├── arte_digital
│   ├── videoarte
│   └── arte_urbana
├── audiovisual
│   ├── cinema
│   ├── documentario
│   ├── video
│   └── animacao
├── artes_cenicas
│   ├── teatro
│   ├── danca
│   ├── circo
│   └── performance
├── musica
├── literatura
├── artesanato
├── cultura_popular
└── multilinguagens
```

Essa taxonomia é inicial, extensível e não pretende ser uma
classificação universal ou fechada.

**Pendência de governança:** `performance` aparece em dois ramos
(`artes_visuais` e `artes_cenicas`). Não consolidar nem remover uma das
ocorrências automaticamente: definir se representam conceitos distintos
ou uma linguagem transversal. Até essa decisão, a implementação deve
usar identificadores estáveis por conceito/ramo e evitar deduplicação
apenas pelo rótulo textual.

### 3.3 Técnicas, suportes, materiais, tecnologias e formatos

Essas dimensões não devem ser misturadas.

  Dimensão     Exemplos
  ------------ ------------------------------------------------------------
  Técnica      Aquarela, óleo, colagem, xilogravura, fotografia analógica
  Suporte      Papel, tela, madeira, tecido, parede, meio digital
  Material     Tinta, madeira, metal, argila, tecido, material reciclado
  Tecnologia   Projeção, realidade aumentada, sensores, software
  Formato      Série, objeto, instalação, obra interativa, publicação
  Escala       Pequeno, médio, grande, monumental
  Montagem     Parede, piso, teto, suspensão, ambiente externo

Uma obra poderá ter várias técnicas, materiais, suportes e formatos.

### 3.4 Temas e conceitos

Taxonomia inicial proposta:

``` text
concept
├── memoria
├── identidade
├── territorio
├── ancestralidade
├── pertencimento
├── patrimonio
├── religiosidade
├── natureza
├── meio_ambiente
├── genero
├── sexualidade
├── politica
├── cultura_popular
├── tecnologia
├── corpo
├── cidade
├── trabalho
├── violencia
├── afetividade
└── contemporaneidade
```

Os conceitos serão múltiplos, não exclusivos. Para cada conceito,
registrar:

-   Relação com a obra: central, secundária ou contextual.
-   Origem: autodeclaração, descrição da obra, texto curatorial, LLM ou
    revisão humana.
-   Evidência.
-   Confiança da classificação.

Uma menção incidental a um tema não deve ter o mesmo peso que uma
pesquisa central do artista.

### 3.5 Posicionamentos artísticos

Taxonomia inicial proposta:

-   Arte contemporânea.
-   Arte experimental.
-   Arte documental.
-   Arte conceitual.
-   Arte política.
-   Arte comunitária.
-   Arte periférica.
-   Arte urbana.
-   Arte popular.
-   Arte-educação.
-   Pesquisa artística.
-   Práticas interdisciplinares.

O artista poderá indicar um posicionamento principal e vários
secundários.

Categorias identitárias ou territoriais não devem ser atribuídas
automaticamente com base em localização, aparência ou origem social.

------------------------------------------------------------------------

## 4. Trajetória artística e profissional

### 4.1 Decisão confirmada: estágios também contam

**A trajetória deve contar estágios.**

Estágio será registrado como experiência, mas não será automaticamente
equiparado a exposição, prêmio, residência ou outra experiência
artística. Sua relevância depende do tipo de edital e das atividades
desempenhadas.

### 4.2 Categorias de experiência

  -----------------------------------------------------------------------
  Categoria                           Exemplos
  ----------------------------------- -----------------------------------
  Formação                            Graduação, curso técnico,
                                      especialização, formação livre

  Experiência profissional            Estágio, assistência artística,
                                      trabalho em ateliê, produção
                                      cultural

  Exposição                           Individual, coletiva, mostra, salão

  Pesquisa e criação                  Pesquisa artística, laboratório,
                                      grupo de pesquisa

  Residência                          Residência artística, intercâmbio,
                                      programa de criação

  Reconhecimento                      Prêmio, menção honrosa, seleção

  Circulação                          Festival, feira, bienal, mostra
                                      itinerante

  Produção e mediação                 Curadoria, assistência curatorial,
                                      mediação, produção

  Publicação                          Catálogo, artigo, livro,
                                      entrevista, registro crítico

  Docência e formação                 Oficinas ministradas, aulas,
                                      orientação
  -----------------------------------------------------------------------

### 4.3 Campos de cada experiência

Cada experiência deve armazenar:

-   Tipo.
-   Título.
-   Instituição.
-   Área.
-   Função / papel desempenhado.
-   Descrição das atividades.
-   Data de início.
-   Data de término.
-   Duração calculável.
-   Local/território.
-   Relação com a área artística.
-   Nível de responsabilidade.
-   Evidência documental.
-   URL da evidência, quando houver.
-   Estado de comprovação: declarado, parcialmente comprovado ou
    verificado.
-   Origem do dado: artista, importação, LLM ou revisão humana.

Exemplo:

``` json
{
  "type": "internship",
  "title": "Estágio em produção cultural",
  "institution": "Instituição cultural",
  "field": "producao_cultural",
  "role": "assistente",
  "start_date": "2024-03-01",
  "end_date": "2024-12-01",
  "description": "Apoio à produção e organização de exposições",
  "evidence_status": "verified",
  "evidence_url": null
}
```

### 4.4 Como pontuar trajetória

Não pontuar somente quantidade de experiências. Considerar:

-   Relação da experiência com o edital.
-   Duração.
-   Responsabilidade desempenhada.
-   Contexto.
-   Relevância para a oportunidade.
-   Comprovação.
-   Atualidade, quando fizer sentido.

Estágio em produção cultural pode ser muito relevante para um edital de
formação em produção, mas menos relevante para um edital que exija
experiência comprovada em exposições individuais.

Não penalizar automaticamente artistas em início de carreira. Editais
diferentes podem valorizar níveis diferentes de trajetória.

------------------------------------------------------------------------

## 5. Cadastro de obras

Cada obra deverá ser uma entidade própria, vinculada ao artista.

Campos possíveis:

-   Título.
-   Ano.
-   Descrição.
-   Texto curatorial.
-   Linguagem.
-   Técnicas.
-   Suportes.
-   Materiais.
-   Tecnologias.
-   Formato.
-   Dimensões.
-   Peso, quando relevante.
-   Escala.
-   Duração, quando aplicável.
-   Local de exposição.
-   Requisitos de montagem.
-   Necessidades elétricas, audiovisuais ou de rede.
-   Necessidade de equipe.
-   Condições de transporte.
-   Disponibilidade atual.
-   Estado de conservação.
-   Fotografias, vídeos e documentação.
-   Temas e conceitos.
-   Relação com pesquisa artística.
-   Histórico de exposição.
-   Evidências e documentos.

A recomendação deve conseguir explicar por que uma obra específica é
adequada, mesmo quando outras obras do mesmo artista não são.

------------------------------------------------------------------------

## 6. Perfil de intenção e disponibilidade

O perfil pode registrar intenções e condições práticas:

-   Interesse em exposição.
-   Interesse em residência.
-   Interesse em circulação.
-   Interesse em formação.
-   Interesse em premiação.
-   Interesse em desenvolver obra nova.
-   Disponibilidade para viajar.
-   Disponibilidade de obras existentes.
-   Disponibilidade para instalações de grande porte.
-   Disponibilidade de equipe.
-   Disponibilidade de documentação.
-   Restrições de agenda.
-   Capacidade de produção.
-   Necessidades de orçamento ou infraestrutura.

Essas informações ajudam a evitar recomendações artisticamente
compatíveis, mas impraticáveis.

------------------------------------------------------------------------

## 7. Estruturação dos editais

O edital deve ser interpretado em cinco grupos.

### 7.1 Elegibilidade

Condições eliminatórias:

-   Residência.
-   Faixa etária.
-   Pessoa física ou jurídica.
-   CNPJ/MEI, quando exigido.
-   Tempo de atuação, quando exigido.
-   Documentação.
-   Linguagem ou categoria permitida.
-   Prazo de inscrição.
-   Outras condições expressas.

### 7.2 Compatibilidade artística

-   Linguagens.
-   Técnicas.
-   Suportes.
-   Materiais.
-   Conceitos.
-   Temas.
-   Nichos.
-   Contextos artísticos.
-   Público.
-   Território.

### 7.3 Compatibilidade da proposta

-   Obra existente ou projeto inédito.
-   Formato.
-   Escala.
-   Montagem.
-   Equipe.
-   Cronograma.
-   Recursos.
-   Viabilidade técnica.
-   Documentação exigida.

### 7.4 Condições da oportunidade

-   Prêmio ou remuneração.
-   Bolsa.
-   Residência.
-   Ocupação.
-   Aquisição.
-   Exposição.
-   Formação.
-   Circulação.
-   Datas.
-   Local.
-   Duração.
-   Obrigações do selecionado.

### 7.5 Critérios de avaliação

-   Critérios de mérito.
-   Pesos.
-   Pontuação máxima.
-   Desempate.
-   Critérios de diversidade ou distribuição.
-   Regras de avaliação.
-   Requisitos de acessibilidade.

### 7.6 Regra para campos vazios

Arrays vazios significam **não informado/não cadastrado**, não proibição
nem incompatibilidade.

Exemplo:

``` json
{
  "artistic_requirements": {
    "languages": ["artes_visuais"],
    "techniques": [],
    "concepts": ["memoria", "territorio"],
    "supports": []
  }
}
```

`techniques: []` não significa que o edital não aceita técnicas
específicas. Significa que nenhuma exigência de técnica foi cadastrada.

### 7.7 Evidências documentais

Cada requisito ou critério deve guardar:

-   Documento de origem.
-   Página.
-   Trecho literal.
-   URL.
-   Versão do documento.
-   Data de coleta.
-   Tipo de evidência.
-   Interpretação estruturada.
-   Estado de validação.
-   Responsável pela validação, quando humana.

Anexos, erratas, retificações, resultados e documentos complementares
devem ser considerados. Uma retificação pode alterar o entendimento
anterior.

------------------------------------------------------------------------

## 8. Caso de referência: OBSERVA 4 / Torre Malakoff

Foi discutido o edital anexado identificado na conversa como edital da
Torre Malakoff / OBSERVA 4.

Pontos extraídos na discussão anterior:

-   Oportunidade de ocupação/exposição.
-   SECULT-PE/FUNDARPE.
-   Cinco propostas selecionadas.
-   Sete critérios de avaliação.
-   Total informado de 26 pontos.
-   Seis critérios com máximo de 4 pontos cada.
-   Acessibilidade com máximo de 2 pontos.
-   Critérios mencionados: trajetória artística; qualidade conceitual;
    viabilidade técnica e adequação ao espaço; originalidade/ineditismo;
    clareza da apresentação; diversidade/acesso; acessibilidade.

A lição de modelagem foi que a recomendação não pode depender apenas de
linguagem, técnica ou suporte. Para uma ocupação expositiva, importam
também proposta, pesquisa, originalidade, trajetória, apresentação e
viabilidade no espaço.

**Ressalva:** para implementação, os critérios e pontuações devem ser
novamente conferidos no PDF oficial, incluindo anexos e retificações. Os
números acima são o registro da análise feita na conversa, não uma
validação independente atualizada neste documento.

------------------------------------------------------------------------

## 9. Modelo de pontuação

### 9.1 Pesos iniciais propostos

  -------------------------------------------------------------------------
  Fator                                  Peso inicial O que compara
  ---------------------- ---------------------------- ---------------------
  Linguagem artística                             15% Fotografia, pintura,
                                                      performance,
                                                      instalação etc.

  Afinidade conceitual                            20% Temas, questões e
                                                      pesquisas artísticas

  Técnica e suporte                               10% Materiais, processos
                                                      e suportes

  Posicionamento/nicho                            15% Campo de atuação,
                                                      contexto e abordagem

  Trajetória                                      10% Experiências,
                                                      formação e
                                                      reconhecimento

  Obra/projeto                                    15% Adequação da obra ou
                                                      proposta ao edital

  Território e público                             5% Localidade,
                                                      comunidade e
                                                      público-alvo

  Viabilidade                                     10% Escala, montagem,
                                                      documentação e
                                                      recursos

  **Total**                                  **100%** 
  -------------------------------------------------------------------------

Esses pesos são uma hipótese inicial de engenharia. Não são pesos
oficiais de editais e não devem ser tratados como universais.

Quando o edital tiver critérios e pesos explícitos, eles devem ser
preservados e considerados no modelo de avaliação correspondente. O
ArtistRank também poderá ter pesos de compatibilidade próprios,
distintos da pontuação oficial do edital.

### 9.2 Notas por fator

Cada fator produz nota entre 0 e 1:

-   `1.0`: correspondência muito forte, sustentada por evidências.
-   `0.75`: correspondência relevante, mas não completa.
-   `0.5`: correspondência parcial ou indireta.
-   `0.25`: pouca correspondência.
-   `0.0`: incompatibilidade ou ausência de correspondência demonstrada,
    quando houver evidência suficiente.

Ausência de informação deve ser `null`/desconhecida, não zero.

### 9.3 Fórmula geral

\[ R(a,e)= `\frac{\sum_{i=1}^{n}w_i s_i(a,e)}`{=tex}
{`\sum`{=tex}\_{i=1}\^{n}w_i} `\times100`{=tex} \]

Onde:

-   (a): artista ou obra.
-   (e): edital.
-   (w_i): peso do fator.
-   (s_i): nota de compatibilidade entre 0 e 1.

**Regra atualizada pelo benchmark v4:** fatores sem informação recebem nota neutra `0.5`; não renormalizar os pesos para redistribuir o peso dos fatores desconhecidos. A cobertura deve ser calculada e exibida separadamente. Essa regra evita que um perfil incompleto obtenha nota artificialmente alta apenas porque seus fatores desconhecidos foram removidos do denominador.

A nota `0.5` não significa que o artista atende ao requisito: significa apenas que o motor não dispõe de evidência para favorecer ou desfavorecer aquele fator. A interface deve deixar essa distinção explícita e indicar quais informações faltam.

### 9.3.1 Regra de teto para requisito artístico obrigatório — validada no benchmark v2/v3

Depois de calcular os scores do artista e do portfólio e combiná-los,
aplicar um teto de **45/100 ao score final combinado** quando houver
pelo menos um requisito artístico explicitamente marcado como
obrigatório e comprovadamente não atendido. No benchmark, isso foi
aplicado a linguagem núcleo, posicionamento e nicho obrigatórios. O teto
não deve ser aplicado isoladamente ao score do artista ou da obra.

```text
score_bruto_combinado = 0.35 * R_artista + 0.65 * R_portfolio
se existe requisito_artistico_obrigatorio com estado FAIL:
    score_final = min(score_bruto_combinado, 45)
senão:
    score_final = score_bruto_combinado
```

A combinação `0,35` artista + `0,65` portfólio é a configuração
exercitada no benchmark, mas permanece provisória e configurável por
modalidade de edital; o teto, quando ativado, incide depois dessa
combinação. Exemplo de regressão: Ana × Festival de Dança, com
`R_artista = 45,0` e `R_portfolio = 46,7`, produz score combinado de
`46,1`; com requisito obrigatório não atendido, o score final correto
é `45,0`. Aplicar o teto apenas a `R_artista` deixaria o resultado em
`46,1`, divergindo do motor testado.

- O teto não substitui a elegibilidade formal. Requisitos eliminatórios jurídicos/administrativos continuam sendo avaliados no filtro de elegibilidade.
- `UNKNOWN` não ativa o teto. Falta de informação não pode ser tratada como incompatibilidade confirmada.
- O resultado deve mostrar qual requisito ativou o teto, a evidência, o estado e a nota bruta antes do teto.
- O valor 45 foi o parâmetro testado neste benchmark; deve permanecer versionado e configurável, mas não ser alterado sem regressão contra o benchmark.

### 9.3.2 Requisitos de linguagem: núcleo e suporte — validado na v3

Cada linguagem associada a um edital deve ter papel explícito:

- `CORE` / núcleo: linguagem que define o objeto central da oportunidade ou da proposta.
- `SUPPORT` / suporte: linguagem complementar, técnica, meio de registro, documentação ou recurso auxiliar.

A simples presença de uma linguagem na lista de aceitas não basta para atribuir compatibilidade plena. A relação entre a linguagem da obra e a função que ela exerce deve ser considerada. Exemplo do benchmark: fotografia de memória urbana não se torna dança apenas porque fotografia aparece como linguagem de suporte em um festival de dança. Videodança ou fotografia de dança podem ser suporte ligado à linguagem núcleo dança.

O papel deve ser extraído do edital e validado com evidência; se ambíguo, fica pendente de revisão humana. Não inferir `CORE` apenas por frequência de palavras.

### 9.4 Exemplo numérico ilustrativo

  Fator              Nota       Peso      Parcela
  ---------------- ------ ---------- ------------
  Linguagem          0,95       0,15       0,1425
  Conceito           0,92       0,20       0,1840
  Técnica            0,90       0,10       0,0900
  Posicionamento     0,85       0,15       0,1275
  Trajetória         0,65       0,10       0,0650
  Obra/projeto       0,95       0,15       0,1425
  Território         0,90       0,05       0,0450
  Viabilidade        0,80       0,10       0,0800
  **Total**                 **1,00**   **0,8765**

Resultado ilustrativo: 87,65/100 de compatibilidade. Não é probabilidade
de aprovação.

### 9.5 Elegibilidade como etapa anterior

Estados:

-   `PASS`: requisito comprovadamente atendido.
-   `FAIL`: requisito comprovadamente não atendido.
-   `UNKNOWN`: informação ausente ou não verificada.
-   `NOT_APPLICABLE`: requisito não se aplica.

Regras:

-   `FAIL` em requisito eliminatório confirmado bloqueia a recomendação
    como elegível.
-   `UNKNOWN` impede afirmar elegibilidade confirmada, mas permite
    exibir recomendação pendente.
-   Requisito não obrigatório não elimina candidato.
-   Compatibilidade artística alta não pode compensar requisito
    eliminatório descumprido.

### 9.6 Compatibilidade de artista e obra --- decisão `both`

Calcular separadamente:

\[ R\_{`\text{artista}`{=tex}}(a,e) \]

e

\[ R\_{`\text{obra}`{=tex}}(o,e) \]

Combinação inicial proposta:

\[ R\_{`\text{combined}`{=tex}}= 0.35R\_{`\text{artista}`{=tex}}+
0.65R\_{`\text{melhor obra}`{=tex}} \]

Esse peso maior para obra faz sentido em editais de exposição ou
aquisição. Para residências, formação ou oportunidades voltadas ao
desenvolvimento profissional, a participação da trajetória e do perfil
pode aumentar.

A combinação deve ser configurável por modalidade de edital.

Também foi proposta uma pontuação de portfólio:

\[ R\_{`\text{portfolio}`{=tex}} =
`\alpha `{=tex}R\_{`\text{melhor obra}`{=tex}}+
(1-`\alpha`{=tex})R\_{`\text{média das melhores obras}`{=tex}} \]

O objetivo é evitar que uma única obra muito compatível esconda o fato
de que o restante do portfólio não apresenta a mesma relação com o
edital. O valor de (`\alpha`{=tex}) ainda precisa ser definido e
testado.

------------------------------------------------------------------------

### 9.7 Poder discriminante do edital — nova dimensão de produto

Compatibilidade absoluta não informa se um edital realmente diferencia os artistas. Para cada edital, calcular a distribuição dos scores entre os artistas elegíveis considerados:

- média dos scores;
- desvio-padrão dos scores;
- amplitude (máximo menos mínimo);
- quantidade de artistas avaliados;
- percentual acima de faixas de score, apenas como estatística descritiva.

Quando o desvio-padrão indicar variação muito baixa, classificar o edital como de **baixo poder discriminante** e exibir aviso semelhante a: “Edital aberto: os requisitos publicados diferenciam pouco os perfis; a qualidade e a adequação da proposta terão papel decisivo”. O benchmark observou esse comportamento no FIC 2025 (v0: média 64,7, desvio 5,6; v4: média 62,3, desvio 3,7) e, em menor grau, na formação técnica (v0: desvio 8,1; v4: 6,1).

**Limite ainda aberto:** o limiar numérico que define “variação muito baixa” não foi calibrado. Não fixar um threshold definitivo com base apenas nesses 12 editais; validar por modalidade e por volume de candidatos. O indicador é calculado sobre a população/amostra comparável do edital e não altera automaticamente o score individual.

### 9.8 Projeção sobre critérios oficiais da banca — indicador separado

Quando o edital publica critérios, pesos e pontuações, criar uma projeção transparente que mapeie os fatores do ArtistRank aos critérios oficiais. Exibir:

- pontuação projetada por critério e total máximo do edital;
- fatores usados no mapeamento;
- lacunas e evidências utilizadas;
- critérios sem correspondência confiável;
- indicação de que se trata de projeção algorítmica, não nota da banca.

Não converter essa projeção em probabilidade de aprovação. Se critérios oficiais não estiverem disponíveis ou o mapeamento for insuficiente, mostrar “indisponível — critérios oficiais insuficientes”, sem estimar um número.

No exemplo OBSERVA 4/Malakoff do benchmark, a compatibilidade v4 colocava Beto em 77,1, acima de Ana (70,5) e Marina (69,9), mas a projeção sobre os critérios oficiais resultou em Ana 21,0/26, Marina 21,6/26 e Beto 16,4/26. Isso demonstra que compatibilidade de perfil/obra e aderência à rubrica de avaliação são dimensões diferentes. O mapeamento usado é ilustrativo e precisa ser validado por especialista antes de uso operacional.

### 9.9 Sem oportunidades relevantes para o perfil

Se o artista não tiver nenhum edital elegível com rótulo/score que indique aderência relevante no universo analisado, não preencher o topo com recomendações marginais como se fossem boas oportunidades. Exibir estado de “poucas ou nenhuma oportunidade compatível encontrada” e, se útil, apresentar oportunidades marginais em uma seção separada, claramente identificada. O benchmark encontrou um artista sem oportunidade relevante elegível; suas três primeiras opções eram marginais.

## 10. Como calcular os fatores

Cada fator deve ser implementado como avaliador independente, com
resultado, confiança, evidências e explicação.

### 10.1 Linguagem artística

Combinar:

-   Correspondência exata de taxonomia.
-   Relação entre categorias pai e filha.
-   Similaridade semântica, quando houver descrições.

Fotografia e fotografia documental têm relação direta. Fotografia e
instalação podem ter relação dependendo da obra, mas não são sinônimos
automáticos.

### 10.2 Afinidade conceitual

Combinar:

-   Termos em comum.
-   Relações hierárquicas.
-   Embeddings de descrições conceituais.
-   Relevância do tema na obra.

Um conceito central deve valer mais que uma menção incidental.

### 10.3 Técnica e suporte

Combinar:

-   Compatibilidade de materiais.
-   Compatibilidade de suporte.
-   Necessidades técnicas.
-   Restrições físicas ou tecnológicas.

Regras explícitas devem ter prioridade. Similaridade semântica não
substitui uma exigência técnica obrigatória.

### 10.4 Trajetória

Combinar:

-   Experiências relacionadas à área.
-   Tempo e duração.
-   Responsabilidade desempenhada.
-   Relevância para o edital.
-   Comprovação.

Estágios entram como experiências, mas seu peso varia conforme o edital
e o trabalho realizado.

### 10.5 Posicionamento

Combinar:

-   Autodeclaração artística.
-   Texto curatorial.
-   Descrição de práticas.
-   Relação entre linguagem, contexto e pesquisa.

### 10.6 Território e público

Comparar território, público-alvo e vínculos exigidos ou valorizados
pelo edital. Distinguir residência obrigatória de afinidade territorial
desejável.

### 10.7 Viabilidade

Combinar:

-   Dimensões.
-   Montagem.
-   Equipamentos.
-   Transporte.
-   Necessidade de equipe.
-   Recursos disponíveis.
-   Condições do espaço.

Uma obra pode ter alta afinidade artística e ser inviável para
determinado espaço. Isso deve aparecer separadamente.

------------------------------------------------------------------------

## 11. Similaridade semântica e embeddings

### 11.1 Conceito

Um embedding transforma um texto em um vetor numérico que representa
características semânticas. Textos com significados próximos tendem a
ficar próximos no espaço vetorial.

Exemplo:

-   Artista: "Investigo as memórias afetivas das comunidades periféricas
    por meio da fotografia."
-   Edital: "Propostas que abordem memória social, identidade
    territorial e patrimônio imaterial."
-   Outro artista: "Meu trabalho documenta as relações entre
    pertencimento, cidade e lembranças coletivas."

Uma busca por palavras literais pode não encontrar todas essas relações.

### 11.2 Similaridade de cosseno

\[ `\operatorname{sim}`{=tex}(A,B)= `\frac{A\cdot B}{\|A\|\|B\|}`{=tex}
\]

A similaridade é uma medida de proximidade entre vetores. Não é
probabilidade de adequação nem substitui interpretação dos critérios.

### 11.3 Embeddings multilíngues

Modelos multilíngues representam textos de diferentes idiomas em espaços
semânticos compatíveis. Isso permite comparar, por exemplo, um texto em
português com outro em inglês ou espanhol.

Usos:

-   Editais em português, espanhol ou inglês.
-   Portfólios em mais de um idioma.
-   Vocabulários curatoriais diferentes.
-   Termos técnicos e conceituais que não aparecem literalmente nos dois
    textos.

### 11.4 Embeddings separados por dimensão

Não gerar um único embedding para todo o artista. Criar vetores
separados:

  -----------------------------------------------------------------------
  Vetor                               Conteúdo
  ----------------------------------- -----------------------------------
  `positioning_embedding`             Declaração artística, identidade e
                                      nicho

  `concept_embedding`                 Temas, questões e pesquisas

  `technique_embedding`               Técnicas, materiais e suportes

  `trajectory_embedding`              Experiências e percurso
                                      profissional

  `artwork_embedding`                 Descrição individual de cada obra

  `project_embedding`                 Proposta específica desenvolvida
                                      para um edital
  -----------------------------------------------------------------------

Não misturar textos muito longos e heterogêneos em um único vetor, pois
isso dilui sinais e dificulta a explicação.

### 11.5 Modelo de embedding escolhido

**Decisão de stack mais recente: Voyage AI.**

Modelo inicial recomendado na conversa: `voyage-4-lite`.

Modelos discutidos:

-   `voyage-4-lite`: baixo custo e latência.
-   `voyage-4`: equilíbrio entre qualidade e desempenho.
-   `voyage-4-large`: maior qualidade geral.
-   `voyage-4-nano`: pesos abertos para hospedagem própria.

Dimensão padrão citada para `voyage-4-lite`, `voyage-4` e
`voyage-4-large`: 1.024. `voyage-4-nano` foi citado com 512 dimensões.

Foi mencionado que a família Voyage 4 é multilíngue e compatível entre
os modelos da família. Os detalhes e preços devem ser reconferidos na
documentação antes de contratação ou lançamento.

### 11.6 Custo de embeddings discutido

Na consulta de preços feita durante a conversa, foi mencionado:

-   `voyage-4-lite`: US\$ 0,02 por milhão de tokens após franquia
    gratuita.
-   Franquia citada: 200 milhões de tokens para modelos Voyage 4 Lite, 4
    e 4 Large.

Esses valores são registro da consulta anterior e podem mudar. Confirmar
preços, limites, elegibilidade e condições na página oficial da Voyage
antes de estimar orçamento definitivo.

### 11.7 Alternativas de embeddings discutidas

-   Voyage 4 Lite via API.
-   Voyage 4 Nano com hospedagem própria.
-   BGE-M3.
-   multilingual-e5-large.

Pesos abertos não significam processamento gratuito: há custo de
máquina, RAM, CPU/GPU, operação e manutenção.

Não misturar vetores de modelos diferentes na mesma coleção. Registrar
provedor, modelo, versão e dimensão. Ao trocar de modelo, gerar
novamente os vetores correspondentes.

### 11.8 Interface para abstrair o provedor

``` typescript
export interface EmbeddingProvider {
  embed(
    texts: string[],
    inputType: "query" | "document"
  ): Promise<number[][]>;

  readonly model: string;
  readonly dimensions: number;
}
```

Essa abstração permite substituir Voyage por modelo local ou outro
fornecedor sem reescrever o motor de ranking.

------------------------------------------------------------------------

## 12. LLM e DeepSeek

### 12.1 Decisão de stack mais recente

**DeepSeek será o provedor de IA generativa principal.**

O LLM não será responsável pelo cálculo do ranking nem pela decisão
final de elegibilidade.

### 12.2 Quando usar LLM

  -----------------------------------------------------------------------
  Atividade               Precisa de LLM?         Abordagem
  ----------------------- ----------------------- -----------------------
  Cadastro de artista     Não                     Formulário estruturado

  Cadastro de obras       Não                     Formulário + taxonomia

  Elegibilidade           Não                     Regras determinísticas

  Pontuação               Não                     Código TypeScript

  Similaridade semântica  Não necessariamente     Embeddings

  Extração de editais em  Ajuda muito             LLM com saída
  PDF                                             estruturada

  Classificação de        Ajuda                   LLM como assistente
  conceitos ambíguos                              

  Explicação da           Opcional                Templates inicialmente
  recomendação                                    

  Revisão de requisitos   Pode ajudar             LLM + aprovação humana
  duvidosos                                       
  -----------------------------------------------------------------------

Conclusão discutida: não é necessário um LLM em cada recomendação. O
maior benefício inicial está em transformar editais desorganizados em
dados estruturados.

### 12.3 Modelos DeepSeek discutidos

Na consulta anterior foram citados:

-   `deepseek-flash`: modelo padrão para tarefas rotineiras.
-   `deepseek-v4-pro`: casos mais complexos e ambíguos.

Distribuição proposta:

  Atividade                                 Modelo
  ----------------------------------------- -----------------------
  Extrair requisitos de editais             `deepseek-flash`
  Identificar temas e linguagens            `deepseek-flash`
  Classificar experiências da trajetória    `deepseek-flash`
  Interpretar edital ambíguo                `deepseek-v4-pro`
  Revisar conflitos entre edital e anexos   `deepseek-v4-pro`
  Calcular ranking                          Nenhum LLM
  Calcular elegibilidade                    Código determinístico

A nomenclatura dos modelos, disponibilidade e preços devem ser
conferidos na documentação oficial da DeepSeek antes de implementação.

### 12.4 Preço mencionado na conversa

Foi citado para `deepseek-flash`, em período fora de pico:

-   Entrada sem cache: US\$ 0,15 por milhão de tokens.
-   Saída: US\$ 0,60 por milhão de tokens.
-   Valores citados como sujeitos a variação por período de pico.

Não tratar esses valores como cotação permanente. Consultar a tabela
oficial no momento da contratação.

### 12.5 Interface de provedor

Não acoplar o domínio do ArtistRank diretamente a um modelo específico.
Criar uma interface `LLMProvider` para permitir troca de modelo/provedor
sem reescrever o pipeline.

### 12.6 Proteção contra alucinação

O DeepSeek não deve gravar diretamente requisitos definitivos no banco.

Fluxo proposto:

``` text
PDF do edital
     |
     v
Extração de texto
     |
     v
DeepSeek
     |
     v
JSON estruturado
     |
     v
Validação com Zod
     |
     v
Verificação das evidências
     |
     v
Revisão humana (quando necessário)
     |
     v
Supabase
```

Cada campo extraído deve manter documento, página e trecho de origem. O
modelo pode interpretar, mas a aplicação valida.

------------------------------------------------------------------------

## 13. LangGraph

### 13.1 Decisão arquitetural proposta

LangGraph é útil, mas não deve ser o núcleo do cálculo de recomendação.

Usar LangGraph para orquestrar processos com IA, documentos, estado,
persistência e intervenção humana.

### 13.2 Onde usar LangGraph

Fluxo de ingestão:

1.  Receber PDF, URL, anexos e retificações.
2.  Extrair texto, tabelas, páginas e metadados.
3.  Interpretar com LLM os requisitos, critérios, pesos, prazos e
    restrições.
4.  Validar se cada requisito possui evidência no documento.
5.  Encaminhar ambiguidades para revisão humana.
6.  Publicar edital estruturado no banco.
7.  Gerar embeddings.

### 13.3 Onde não usar LangGraph

O fluxo de recomendação deve ser preferencialmente convencional:

1.  Verificar elegibilidade com regras.
2.  Recuperar candidatos por filtros e busca semântica.
3.  Calcular fatores de pontuação.
4.  Ordenar resultados.
5.  Gerar explicações.

Não criar vários agentes autônomos no MVP. Um grafo com etapas definidas
é suficiente.

### 13.4 Separação tecnológica proposta

-   LangGraph: ingestão, enriquecimento, validação e revisão assistida.
-   TypeScript: serviço de ranking e regras.
-   Python: pipeline de documentos/IA, se necessário.

------------------------------------------------------------------------

## 14. Confiança da recomendação

Compatibilidade e confiança são diferentes.

-   **Compatibilidade:** quanto o artista ou a obra combina com o
    edital.
-   **Confiança:** quanto os dados disponíveis sustentam a avaliação.

### 14.1 Componentes e pesos iniciais

  ------------------------------------------------------------------------
  Componente                            Peso inicial O que avalia
  --------------------- ---------------------------- ---------------------
  Cobertura                                      35% Quantidade de
                                                     informações
                                                     disponíveis

  Qualidade das                                  30% Documentos,
  evidências                                         portfólio,
                                                     declarações e
                                                     comprovações

  Atualidade                                     15% Se as informações
                                                     ainda são válidas

  Segurança da extração                          20% Se os dados foram
                                                     interpretados
                                                     corretamente
  ------------------------------------------------------------------------

### 14.2 Fórmula proposta

\[ C=100(0.35K+0.30E+0.15A+0.20X) \]

Onde:

-   (K): cobertura dos dados.
-   (E): qualidade das evidências.
-   (A): atualidade.
-   (X): confiança da extração e classificação.

### 14.3 Exemplo

  Componente     Nota
  ------------ ------
  Cobertura      0,90
  Evidências     0,85
  Atualidade     0,95
  Extração       0,90

Resultado ilustrativo: 89,25/100 de confiança.

### 14.4 Apresentação ao usuário

Exibir separadamente:

-   Pontuação de compatibilidade.
-   Confiança dos dados.
-   Estado de elegibilidade.
-   Principais motivos.
-   Lacunas ou dados que precisam de confirmação.
-   Evidências que sustentam a indicação.

Não apresentar a pontuação de compatibilidade como probabilidade de ganhar. A confiança C não contém sinal de afinidade artística e jamais pode ser usada como ranking ou incorporada silenciosamente ao score. No benchmark, C como compatibilidade teve Spearman 0,027, AUC 0,577 e P@3 0,303; como qualidade dos dados, variou de 53,5 a 91,2 e foi útil para indicar completude/evidência.

**Regra operacional:** confiança baixa deve acionar pedido de complementação documental, revisão ou aviso de baixa sustentação da análise; não deve reduzir silenciosamente a compatibilidade. Também não deve ser interpretada como qualidade artística ou mérito do artista. O benchmark observou correlação 0,385 entre confiança e compatibilidade média por artista, possível viés de perfis mais estruturados/completos; monitorar esse efeito.

------------------------------------------------------------------------

## 15. Pseudocódigo do ranking

``` typescript
async function recommend(
  artistId: string,
  opportunityId: string
) {
  const artist = await loadArtistWithWorks(artistId);
  const opportunity = await loadOpportunity(opportunityId);

  // 1. Elegibilidade
  const eligibility = evaluateEligibility(
    artist,
    opportunity.requirements
  );

  if (eligibility.status === "INELIGIBLE") {
    return {
      status: "INELIGIBLE",
      eligibility,
      recommendations: []
    };
  }

  // 2. Perfil geral do artista
  const artistFactors = [
    scoreLanguage(artist, opportunity),
    scoreConcepts(artist, opportunity),
    scoreTechniques(artist, opportunity),
    scorePositioning(artist, opportunity),
    scoreTrajectory(artist, opportunity),
    scoreTerritory(artist, opportunity),
    scoreFeasibility(artist, opportunity)
  ];

  const artistScore = weightedScore(
    artistFactors,
    opportunity.weights
  );

  // 3. Avaliação individual das obras
  const artworkResults = await Promise.all(
    artist.artworks.map(async artwork => {
      const factors = [
        scoreArtworkLanguage(artwork, opportunity),
        scoreArtworkConcepts(artwork, opportunity),
        scoreArtworkTechnique(artwork, opportunity),
        scoreArtworkSupport(artwork, opportunity),
        scoreArtworkFeasibility(artwork, opportunity)
      ];

      return {
        artworkId: artwork.id,
        score: weightedScore(
          factors,
          opportunity.artworkWeights
        ),
        factors,
        confidence: calculateConfidence(
          artwork,
          factors
        )
      };
    })
  );

  // 4. Ordenar obras por compatibilidade
  artworkResults.sort(
    (a, b) => b.score - a.score
  );

  // 5. Combinar artista e portfólio
  const portfolioScore = calculatePortfolioScore(
    artworkResults
  );

  const combinedScore =
    opportunity.artistWeight * artistScore +
    opportunity.portfolioWeight * portfolioScore;

  // O teto é aplicado ao score combinado, nunca apenas ao artistScore.
  const hasUnmetMandatoryArtisticRequirement =
    hasExplicitMandatoryArtisticRequirementInFail(eligibility, opportunity);

  const finalScore = hasUnmetMandatoryArtisticRequirement
    ? Math.min(combinedScore, 45)
    : combinedScore;

  // 6. Confiança dos dados
  const confidence = calculateConfidence(
    artist,
    artistFactors,
    artworkResults,
    eligibility
  );

  // 7. Explicações rastreáveis
  const explanation = generateExplanation(
    artistFactors,
    artworkResults,
    eligibility
  );

  // 8. Persistir resultado e versão
  return saveRecommendation({
    artistId,
    opportunityId,
    status: eligibility.status,
    artistScore,
    portfolioScore,
    finalScore,
    confidence,
    artworkResults,
    explanation,
    algorithmVersion: "1.1.0-empirical-v4"
  });
}
```

### 15.1 Requisitos de implementação do pseudocódigo

-   `weightedScore` deve atribuir nota neutra `0.5` aos fatores sem informação; não renormalizar os pesos em função dos fatores desconhecidos.
-   Retornar também a cobertura dos fatores e discriminar valores observados de valores neutros imputados.
-   Calcular primeiro `score_bruto_combinado = 0.35 * artistScore + 0.65 * portfolioScore`; quando requisito artístico obrigatório explícito estiver em `FAIL`, aplicar `finalScore = min(score_bruto_combinado, 45)`. O teto incide no score final combinado, não apenas em `artistScore`.
-   Tratar linguagem `CORE` e `SUPPORT` separadamente.
-   Não converter dados ausentes em zero; na versão empírica v4, usar `0.5` neutro e sinalizar a imputação.
-   `FAIL` eliminatório não pode ser compensado por nota alta em outro
    fator.
-   Salvar os fatores individuais, suas evidências e explicações.
-   Salvar versão do algoritmo e pesos usados.
-   A combinação artista/portfólio deve ser configurável por modalidade
    de edital.
-   O cálculo deve ser reproduzível.

### 15.2 Estrutura de resultado por fator

``` typescript
interface FactorResult {
  factor: string;
  score: number | null;
  weight: number;
  confidence: number;
  evidenceIds: string[];
  explanation: string;
}
```

------------------------------------------------------------------------

## 16. Modelo de dados e banco

### 16.1 Decisão de stack mais recente

**Supabase como banco principal e backend gerenciado.**

Usar:

-   PostgreSQL.
-   pgvector.
-   Supabase Auth.
-   Supabase Storage.
-   Row Level Security (RLS).

Não contratar banco vetorial separado no MVP.

### 16.2 Entidades centrais

-   `artists`
-   `artworks`
-   `experiences`
-   `taxonomy_terms`
-   `artist_terms`
-   `artwork_terms`
-   `opportunities`
-   `opportunity_requirements`
-   `opportunity_criteria`
-   `opportunity_evidence`
-   `embeddings`
-   `recommendations`
-   `recommendation_factors`
-   `feedback`

### 16.3 Responsabilidade das tabelas

  -----------------------------------------------------------------------
  Tabela                              Responsabilidade
  ----------------------------------- -----------------------------------
  `artists`                           Perfil principal do artista

  `artworks`                          Obras individuais

  `experiences`                       Formação e trajetória

  `taxonomy_terms`                    Vocabulário controlado

  `artist_terms`                      Relação entre artistas e termos

  `artwork_terms`                     Relação entre obras e termos

  `opportunities`                     Editais

  `opportunity_requirements`          Requisitos e condições

  `opportunity_criteria`              Critérios e pesos

  `opportunity_evidence`              Trechos, páginas e anexos que
                                      fundamentam os dados

  `embeddings`                        Vetores por entidade e dimensão

  `recommendations`                   Resultado do ranking

  `recommendation_factors`            Notas individuais e justificativas

  `feedback`                          Interações e correções dos usuários
  -----------------------------------------------------------------------

### 16.4 JSON de exemplo para edital

``` json
{
  "id": "opp_001",
  "title": "Ocupação de espaço expositivo",
  "status": "open",
  "location": {
    "city": "Recife",
    "state": "PE"
  },
  "eligibility": [
    {
      "type": "residency",
      "operator": "equals",
      "value": "Pernambuco",
      "mandatory": true,
      "evidence_id": "evidence_001"
    }
  ],
  "artistic_requirements": {
    "languages": ["artes_visuais"],
    "techniques": [],
    "concepts": ["memoria", "territorio"],
    "supports": []
  },
  "criteria": [
    {
      "name": "conceptual_quality",
      "weight": 0.25,
      "max_score": 4
    }
  ]
}
```

É um exemplo de estrutura, não a transcrição de um edital real.

### 16.5 Tabela de embeddings

A proposta discutida:

``` sql
create extension if not exists vector
with schema extensions;

create table public.embeddings (
    id uuid primary key default gen_random_uuid(),

    entity_type text not null,
    entity_id uuid not null,

    embedding_type text not null,
    model text not null,
    dimensions integer not null default 1024,

    content_hash text not null,
    content text not null,

    embedding extensions.vector(1024),

    created_at timestamptz default now(),

    unique (
        entity_type,
        entity_id,
        embedding_type,
        model
    )
);
```

Tipos de embedding:

``` text
artist_positioning
artist_concepts
artist_trajectory
artwork_description
opportunity_description
opportunity_requirements
```

Observação: a modelagem final deve validar a extensão e o schema do tipo
`vector` na versão do Supabase utilizada. Se forem necessárias dimensões
ou modelos diferentes, considerar tabelas separadas ou estratégia
compatível com a indexação.

### 16.6 Indexação vetorial

Criar índices HNSW quando o volume justificar. Para o MVP, medir
primeiro o volume e o desempenho; não otimizar prematuramente.

### 16.7 `content_hash`

Manter hash do conteúdo que gerou cada embedding para não gerar
novamente o vetor quando o texto não mudar.

### 16.8 Armazenamento de documentos

PDFs e anexos devem ficar no Supabase Storage. No banco ficam metadados,
links, versões, páginas e evidências extraídas.

------------------------------------------------------------------------

## 17. Stack tecnológica --- decisão mais recente

### 17.1 Decisão confirmada pelo usuário

O usuário informou que deseja usar:

-   Vercel.
-   Voyage.
-   Supabase.
-   DeepSeek como IA.

A recomendação consolidada foi manter essa combinação.

### 17.2 Componentes

  Camada           Tecnologia                          Responsabilidade
  ---------------- ----------------------------------- --------------------------------
  Frontend         Next.js                             Interface
  Hospedagem web   Vercel                              Deploy e execução
  API              Next.js/Vercel Functions            Endpoints
  Banco            Supabase PostgreSQL                 Dados relacionais
  Vetores          Supabase pgvector                   Busca semântica
  Autenticação     Supabase Auth                       Login e usuários
  Arquivos         Supabase Storage                    PDFs, anexos e imagens
  Embeddings       Voyage AI                           Vetores multilíngues
  LLM              DeepSeek                            Extração e interpretação
  Ranking          TypeScript                          Cálculo determinístico
  Pipeline de IA   Python + LangGraph, se necessário   Orquestração
  Filas            PostgreSQL/Redis + worker           Processamento assíncrono
  Validação        Zod                                 Validar JSON e dados extraídos

### 17.3 Vercel

Usar Vercel para:

-   Next.js.
-   Interface.
-   APIs de usuários.
-   APIs de recomendações.
-   Ranking determinístico.
-   Endpoints leves.

Não executar processamento pesado de muitos PDFs em uma única requisição
web.

Atenção ao plano: foi discutido que Vercel Hobby é destinado a uso
pessoal e não comercial. Para um produto comercial, considerar Vercel
Pro. Preços e condições devem ser conferidos antes do lançamento.

### 17.4 Supabase

Usar como backend principal:

-   PostgreSQL.
-   pgvector.
-   Auth.
-   Storage.
-   RLS.

Não é necessário contratar PostgreSQL separado, banco vetorial separado
ou serviço de autenticação separado no MVP.

### 17.5 Voyage AI

Usar inicialmente `voyage-4-lite`, mantendo abstração de provedor.

### 17.6 DeepSeek

Usar DeepSeek Flash como padrão e o modelo Pro para casos complexos,
conforme disponibilidade e nomenclatura vigente na API.

### 17.7 Worker externo

Para importações em lote e PDFs pesados, usar worker assíncrono. No
início, pode ser um worker simples acionado por fila baseada no banco.
Se a carga aumentar, considerar Railway, Fly.io ou servidor dedicado.

Não contratar servidor adicional antes de medir a necessidade.

------------------------------------------------------------------------

## 18. Alternativas avaliadas, mas não escolhidas para o MVP

  -----------------------------------------------------------------------
  Alternativa             Papel possível          Decisão atual
  ----------------------- ----------------------- -----------------------
  Neon                    PostgreSQL serverless   Não usar inicialmente;
                                                  Supabase já atende

  Turso                   SQLite distribuído      Não escolhido para o
                                                  domínio relacional

  Qdrant                  Banco vetorial          Não necessário enquanto
                          especializado           pgvector atender

  MongoDB Atlas           Banco                   Sem vantagem clara
                          documental/vetorial     sobre PostgreSQL neste
                                                  projeto

  BGE-M3                  Embeddings open source  Alternativa futura

  multilingual-e5-large   Embeddings multilíngues Alternativa futura
                          locais                  

  Voyage 4 Nano           Embeddings com pesos    Alternativa para
                          abertos                 hospedagem própria

  Railway                 Hospedagem de worker    Possível quando
                                                  necessário

  Fly.io                  Hospedagem de worker    Possível quando
                                                  necessário

  Servidor dedicado       Worker e processamento  Não contratar no MVP
  -----------------------------------------------------------------------

### 18.1 Custos e limites mencionados

Valores e franquias foram citados durante consulta anterior e precisam
ser reconferidos antes de contratar:

-   Vercel Pro: US\$ 20/mês, valor mencionado na consulta.
-   Supabase Pro: a partir de US\$ 25/mês, valor mencionado na consulta.
-   Supabase Free: foram mencionados 500 MB de banco, 1 GB de Storage e
    5 GB de egress; projetos gratuitos podem ser pausados após uma
    semana de inatividade.
-   Voyage 4 Lite: foi mencionado preço de US\$ 0,02 por milhão de
    tokens após franquia gratuita e franquia de 200 milhões de tokens
    para modelos Voyage 4 Lite/4/4 Large.
-   DeepSeek Flash: foram mencionados US\$ 0,15 por milhão de tokens de
    entrada sem cache e US\$ 0,60 por milhão de tokens de saída fora de
    pico.

Esses valores não são garantias nem cotações permanentes. Conferir as
páginas oficiais de preços e os termos dos planos no momento de
implementação e lançamento.

### 18.2 Estimativa anterior de embeddings OpenAI

Em uma etapa anterior, antes da escolha de Voyage, foram citados como
comparação:

-   `text-embedding-3-small`: US\$ 0,02 por milhão de tokens.
-   `text-embedding-3-large`: US\$ 0,13 por milhão de tokens.

Esses modelos foram considerados como referência, mas a decisão mais
recente do usuário é utilizar Voyage.

------------------------------------------------------------------------

## 19. Processamento assíncrono de editais

Fluxo proposto:

``` text
Usuário envia edital
        |
        v
Supabase Storage
        |
        v
Supabase PostgreSQL
        |
        v
Fila de processamento
        |
        v
Worker
   |         |
   v         v
DeepSeek   Voyage
   |         |
   +----+----+
        |
        v
Validação e persistência
        |
        v
Edital disponível
```

Não deixar requisição HTTP aberta esperando o processamento de vários
editais.

Para o início, pode-se usar uma fila baseada no PostgreSQL e worker
acionado periodicamente. Se o processamento crescer, mover o worker para
Railway, Fly.io ou servidor dedicado.

------------------------------------------------------------------------

## 20. Feedback e evolução do ranking

Registrar interações:

-   Recomendado.
-   Visualizado.
-   Salvo.
-   Marcado como interessante.
-   Marcado como não interessante.
-   Considerado incompatível.
-   Inscrição realizada.
-   Selecionado.
-   Não selecionado.

Registrar também o motivo:

-   Incompatibilidade artística.
-   Requisito eliminatório.
-   Falta de disponibilidade.
-   Orçamento.
-   Preferência pessoal.
-   Prazo.
-   Falta de documentação.
-   Outro motivo.

Uma rejeição não significa automaticamente que o algoritmo errou. Pode
refletir preferência ou condição prática.

No futuro:

1.  Coletar avaliações de especialistas.
2.  Comparar recomendações com avaliações humanas.
3.  Coletar resultados reais de editais.
4.  Calibrar confiança.
5.  Ajustar pesos com dados.
6.  Avaliar precisão, recall, NDCG ou outras métricas adequadas de
    ranking.
7.  Manter explicabilidade e possibilidade de auditoria.

Não treinar modelo de ranking antes de possuir dados de avaliação
suficientes e confiáveis.

------------------------------------------------------------------------

## 21. Roadmap de implementação

### Fase 1 --- Estrutura e taxonomia

-   Criar cadastro profundo de artistas.
-   Criar cadastro de obras.
-   Implementar trajetória, incluindo estágios.
-   Criar taxonomia e relacionamentos.
-   Cadastrar editais manualmente ou com importação simples.

**Primeira entrega funcional.**

### Fase 2 --- Motor determinístico

-   Implementar elegibilidade.
-   Implementar pesos configuráveis.
-   Implementar notas por fator.
-   Gerar explicações.
-   Criar testes unitários com casos conhecidos.

### Fase 3 --- Busca semântica

-   Gerar embeddings para artistas, obras e editais.
-   Armazenar vetores no pgvector.
-   Comparar dimensões separadamente.
-   Combinar busca semântica com taxonomia.

### Fase 4 --- Pipeline inteligente

-   Adicionar extração de editais com DeepSeek.
-   Implementar LangGraph.
-   Validar evidências.
-   Criar revisão humana.

### Fase 5 --- Aprendizado e calibração

-   Registrar recomendações visualizadas.
-   Registrar interesse e rejeição.
-   Coletar motivos de incompatibilidade.
-   Avaliar resultados com especialistas.
-   Ajustar pesos com dados reais.

------------------------------------------------------------------------

## 22. Referências de editais do Recife levantadas na pesquisa anterior

Foi feita uma pesquisa de referência com 30 oportunidades/editais
relacionados ao Recife e ao ecossistema cultural pernambucano. A lista
abaixo registra os itens levantados anteriormente.

**Ressalva importante:** nem todos os 30 itens são oportunidades diretas
de inscrição para artistas. A lista inclui formação, representação
institucional, programação, festivais e oportunidades de naturezas
distintas. Nem todos os documentos completos foram analisados em
profundidade. Antes de usar cada item como dado de treinamento ou
validação, obter o documento oficial, anexos, erratas, critérios,
resultados e datas.

### 22.1 Grupo A --- 2026

1.  SPA --- Semana de Artes Visuais do Recife 2026.
2.  Multilinguagens Recife Criativo --- PNAB 2026.
3.  Recife Virado na Periferia --- PNAB 2026.
4.  Recife de Formação Técnica --- PNAB 2026.
5.  Cultura Viva --- PNAB 2026.
6.  Festival Internacional de Dança do Recife 2026.
7.  Fomento de Pesquisa em Teatro --- O Aprendiz em Cena 2026.
8.  Fomento de Pesquisa em Dança --- O Solo do Outro 2026.
9.  15ª Mostra de Circo do Recife 2026.
10. A Letra e a Voz 2026.
11. Edital São João 2026.
12. Subvenção do Ciclo Junino 2026.
13. Regulamento dos Concursos de Carnaval 2026.
14. Edital de Carnaval 2026.
15. Subvenção Carnaval 2026.
16. Bolsas Escola de Frevo.
17. Eleições para Sociedade Civil no CMPC 2026--2028.
18. Ciclo Natalino 2025.

### 22.2 Grupo B --- 2025

19. MIC 2025.
20. FIC 2025.
21. Ocupação da Frei Caneca FM 2025--2026.
22. 24º Festival Recife do Teatro Nacional 2025.

### 22.3 Grupo C --- 2024

23. MIC 2024.
24. FIC 2024.
25. Recife Criativo --- Multilinguagens PNAB 2024.
26. Recife de Formação Técnica PNAB 2024.
27. Recife Virado na Periferia PNAB 2024.
28. III Concurso Recife Virado na Periferia 2024.
29. Festival Recife do Teatro Nacional 2024.
30. Edital Joel Datz de Aquisição de Obras e Apresentações.

### 22.4 Fontes e portais que foram levantados

-   Portal de Cultura do Recife / Secretaria de Cultura do Recife.
-   Mapa Cultural de Pernambuco.
-   Cultura.PE.
-   FUNDARPE.
-   Funcultura.
-   Páginas oficiais dos equipamentos culturais e instituições
    promotoras.
-   Diário Oficial, quando aplicável.

Outros itens de referência citados na pesquisa:

-   Funcultura Geral 2025/2026.
-   Recife SIC.
-   Chamadas PNAB 2026.
-   Categorias Funcultura 2026: Audiovisual, Patrimônio, Geral, Música e
    Microprojeto.
-   Chamadas de equipamentos culturais, incluindo Torre Malakoff, Teatro
    Arraial, Theatro Cinema Guarany e Casa de Câmara e Cadeia.
-   Categorias de artes visuais em editais pernambucanos.
-   Edital de formação cultural 001/2026.
-   Pernambuco Meu País 2026/27.
-   Recife de Formação Técnica PNAB 2024.
-   Erratas e calendários do SIC 2025.

### 22.5 Como usar essa base

A lista serve para:

-   Construir conjunto inicial de editais.
-   Identificar linguagens e categorias recorrentes.
-   Identificar requisitos territoriais.
-   Identificar modalidades de oportunidade.
-   Construir exemplos positivos e negativos.
-   Testar extração de critérios.
-   Criar casos de teste para o ranking.

Não assumir que todos os itens são comparáveis ou que todos aceitam os
mesmos perfis de proponentes.

------------------------------------------------------------------------

## 23. Fontes e documentação técnica

Links oficiais úteis para a stack escolhida:

-   Vercel Docs: https://vercel.com/docs
-   Supabase Docs: https://supabase.com/docs
-   Supabase pgvector: https://supabase.com/docs/guides/ai
-   Voyage AI Docs: https://docs.voyageai.com/
-   DeepSeek API Docs: https://api-docs.deepseek.com/
-   LangGraph Docs: https://langchain-ai.github.io/langgraph/
-   pgvector: https://github.com/pgvector/pgvector
-   Zod: https://zod.dev/

Preços, nomes de modelos, franquias e limites devem ser confirmados nas
páginas oficiais, pois mudam com o tempo.

------------------------------------------------------------------------

## 24. Monitoramento de novos editais

Foi solicitado também monitoramento recorrente de novos editais do
Recife.

O monitoramento criado tem como escopo:

-   Monitorar semanalmente novos editais, chamadas públicas, seleções,
    prêmios, ocupações, residências, bolsas e oportunidades
    culturais/artísticas relevantes para artistas e agentes culturais no
    Recife, Pernambuco.
-   Pesquisar prioritariamente fontes oficiais: Portal de Cultura do
    Recife/Secretaria de Cultura do Recife, Diário Oficial do Recife
    quando aplicável, Mapa Cultural de Pernambuco, Cultura.PE, FUNDARPE
    e páginas oficiais de equipamentos culturais e instituições
    promotoras.
-   Verificar página ou documento original, anexos, retificações,
    período de inscrição, público elegível, linguagens artísticas,
    território, critérios e links.
-   Distinguir oportunidades sediadas no Recife de oportunidades
    estaduais que também aceitam proponentes do Recife.
-   Entregar somente itens recém-publicados desde a execução anterior.
-   Comparar resultados anteriores e não repetir editais inalterados.
-   Para cada novo item, apresentar título, órgão, data de publicação,
    prazo de inscrição, perfil elegível, linguagens/áreas, resumo do
    objeto e link oficial.
-   Não tratar snippets ou páginas antigas como confirmação de edital
    novo.
-   Se não houver novos editais verificados, não enviar alerta.
-   Se a verificação estiver incompleta, não afirmar que não houve
    novidades.

Esse monitoramento é uma atividade operacional relacionada ao projeto,
mas não faz parte do algoritmo de ranking em si.

------------------------------------------------------------------------

## 25. Decisões confirmadas x hipóteses x pendências

### 25.1 Decisões confirmadas pelo usuário

-   Nome do projeto: ArtistRank.
-   Objeto de recomendação: `both` --- artistas e obras.
-   Funcionamento: `hybrid`.
-   Profundidade do perfil: `deep`.
-   Estágios devem contar na trajetória.
-   Stack desejada: Vercel.
-   Provedor de embeddings desejado: Voyage.
-   Backend/banco desejado: Supabase.
-   Provedor de IA generativa: DeepSeek.

### 25.2 Recomendações técnicas consolidadas, ainda sujeitas a validação de implementação

-   Usar Next.js e TypeScript na Vercel.
-   Supabase PostgreSQL como fonte principal.
-   Supabase pgvector para vetores.
-   Supabase Auth e Storage.
-   Voyage 4 Lite como modelo inicial de embeddings.
-   DeepSeek Flash como LLM padrão e Pro para exceções, conforme
    disponibilidade.
-   LangGraph no pipeline de ingestão e revisão, não no cálculo central
    do ranking.
-   Ranking determinístico em TypeScript.
-   Worker assíncrono para processamento pesado.
-   Zod para validação de dados estruturados.
-   Evidência documental para cada requisito.
-   Versão do algoritmo e pesos registrados em cada recomendação.

### 25.3 Parâmetros iniciais ainda não calibrados

-   Pesos dos fatores de compatibilidade.
-   Pesos da combinação artista/portfólio.
-   Valor de (`\alpha`{=tex}) para melhor obra versus média das melhores
    obras.
-   Pesos da confiança.
-   Limiares de recomendação.
-   Limiares para revisão humana.
-   Regras de decaimento por atualidade da trajetória.
-   Critérios de qualidade e suficiência das evidências.
-   Estratégia de busca vetorial e tamanho dos conjuntos de candidatos.

### 25.4 Pendências de produto e engenharia

-   Definir modalidade e categorias oficiais da taxonomia.
-   Definir sinônimos, relações hierárquicas e governança da taxonomia.
-   Definir quais campos do perfil serão obrigatórios e quais opcionais.
-   Definir regras de privacidade e consentimento para dados pessoais e
    portfólios.
-   Definir política de acesso público/privado dos portfólios.
-   Definir esquema definitivo de versões dos editais.
-   Definir como tratar erratas e substituição de documentos.
-   Definir estratégia de OCR para PDFs escaneados.
-   Definir fila e worker de produção.
-   Definir autenticação, papéis e RLS.
-   Definir estratégia de backup e recuperação.
-   Definir métricas offline para avaliar o ranking.
-   Criar conjunto de dados de validação com artistas, obras e editais
    revisados por especialistas.
-   Confirmar preços, franquias e limites atuais de Vercel, Supabase,
    Voyage e DeepSeek.
-   Definir se o produto será comercial desde o lançamento, pois isso
    afeta a escolha do plano Vercel.
-   Definir política de retenção e exclusão de documentos e dados de
    artistas.
-   Definir política de transparência sobre classificações
    automatizadas.

------------------------------------------------------------------------

## 26. Resumo executivo

O ArtistRank será uma plataforma de recomendação artística baseada em
perfis profundos de artistas, obras individuais, trajetórias e editais
estruturados.

A recomendação será híbrida: regras determinísticas e taxonomia
controlada combinadas com embeddings multilíngues. A elegibilidade será
uma etapa separada do ranking. Cada recomendação exibirá
compatibilidade, confiança, estado de elegibilidade e evidências.

A trajetória contará estágios, formação, experiências profissionais,
exposições, pesquisas, residências, prêmios, circulação, produção,
mediação, publicações e docência, com pesos contextuais e estados de
comprovação.

A stack desejada é Vercel + Supabase + Voyage + DeepSeek. O Supabase
será o banco principal e armazenará também vetores com pgvector. Voyage
será utilizado para embeddings. DeepSeek auxiliará na extração e
interpretação de editais. LangGraph poderá orquestrar o pipeline de
ingestão e revisão humana, mas o ranking permanecerá determinístico em
TypeScript.

O desenvolvimento seguirá por etapas: taxonomia e perfis; motor
determinístico; busca semântica; pipeline inteligente; feedback e
calibração.

O objetivo não é apenas dizer que um artista combina com um edital, mas
explicar **por que combina, com qual obra, com base em quais evidências
e quais informações ainda precisam ser confirmadas**.


------------------------------------------------------------------------

## 27. Avaliação empírica e decisões atualizadas — base v1.1, conferência v1.2

**Fonte:** *ArtistRank: Avaliação Empírica das Decisões — Julgamento da especificação com testes reais: 12 editais estruturados, 12 perfis de artista e oito experimentos*, Recife/Pernambuco, 16/11/2026. Foram fornecidos PDF e DOCX equivalentes. Esta seção passa a ser a referência de validação empírica do registro mestre.

### 27.1 Escopo e qualidade do benchmark

- 12 editais estruturados × 12 perfis hipotéticos = 144 pares artista–edital.
- 24 pares (16,7%) foram bloqueados por inelegibilidade; 120 pares foram usados nas métricas de ranking.
- Rótulos de referência: 83 irrelevantes, 25 marginais, 20 bons e 16 fortes. Há 36 pares com rótulo relevante (≥ 2) no conjunto bruto; três pares da artista Rosa foram bloqueados pelo requisito territorial. Portanto, **33 pares relevantes eram elegíveis** e 3 relevantes foram bloqueados por inelegibilidade.
- Rubrica: 3 = aderência forte; 2 = boa/plausível; 1 = marginal; 0 = sem aderência ou inelegível.
- Um edital (OBSERVA 4/Torre Malakoff) foi tratado como caso documentado; SPA 2026, 29º Festival Internacional de Dança do Recife e Recife Virado na Periferia PNAB 2026 tiveram existência e dados básicos confirmados publicamente; os demais registros estruturados são reconstruções representativas para testar a mecânica, não transcrições oficiais.
- Os 12 artistas são perfis hipotéticos que cobrem diferentes linguagens e estágios de trajetória.
- A rubrica foi aplicada por um único avaliador. Portanto, existe risco de viés e não há medida de concordância entre avaliadores.
- A camada semântica do benchmark utilizou TF-IDF e cosseno em português, não embeddings Voyage. O teste valida a arquitetura substituível e o motor determinístico, mas **não valida ainda a qualidade ou o custo de Voyage**.

O benchmark é uma primeira referência de regressão, não prova de desempenho em produção. Não usar os números como taxa de aprovação real nem como garantia para novos editais.

### 27.2 Métricas observadas

| Modelo | Spearman | AUC | P@3 | Top-1 | NDCG@5 |
|---|---:|---:|---:|---:|---:|
| Aleatório | 0,032 | 0,474 | 0,242 | 0,182 | 0,495 |
| Só palavras-chave (TF-IDF) | 0,407 | 0,731 | 0,515 | 0,818 | 0,743 |
| Só linguagem artística | 0,761 | 0,851 | 0,636 | 0,636 | 0,845 |
| Fórmula C usada como compatibilidade | 0,027 | 0,577 | 0,303 | 0,364 | 0,475 |
| v0 — especificação literal | 0,747 | 0,946 | 0,788 | 1,000 | 0,935 |
| v2 — teto por requisito explícito | 0,758 | 0,941 | 0,788 | 1,000 | 0,937 |
| v3 — v2 + linguagem núcleo/suporte | **0,769** | **0,949** | **0,818** | **1,000** | **0,959** |
| v4 — v3 + nulos neutros | 0,769 | 0,947 | 0,818 | 1,000 | 0,959 |
| v4 com pesos iguais | 0,763 | 0,945 | 0,818 | 1,000 | 0,965 |

**Interpretação correta:** o motor estruturado apresenta sinal forte contra a rubrica deste benchmark. A linguagem artística é o sinal dominante para ordenação geral; conceitos, posicionamento, obras e viabilidade elevam a precisão no topo. A AUC da v4 (0,947) é 0,002 inferior à v3 (0,949), diferença pequena neste benchmark e sem evidência de regressão relevante; a v4 foi mantida por tratar dados ausentes de forma neutra. O Top-1 = 1,000 refere-se aos 11 artistas com pelo menos uma opção relevante. Na conferência corrigida, **11 dos 12 artistas tiveram como primeira recomendação um edital de aderência forte (rótulo 3)**; Beto foi o único sem opção relevante. Não generalizar esses resultados para todos os perfis ou para o mundo real.

### 27.3 Veredito por decisão

| ID | Decisão avaliada | Veredito empírico | Regra para a especificação |
|---|---|---|---|
| D1 | Fórmula C como núcleo da pontuação | Refutada como compatibilidade; válida como confiança separada | Manter C apenas como qualidade dos dados. |
| D2 | Pesos 15/20/10/15/10/15/5/10 | Válidos, mas ajuste fino tem efeito pequeno | Manter como padrão configurável; congelar calibração fina até haver dados reais. Reforçado pela §29.2: com ganhadores reais, nenhuma variação melhora. |
| D3 | Elegibilidade antes do ranking | Confirmada e essencial | Preservar filtro eliminatório. |
| D4 | Compatibilidade não é probabilidade de vitória | Confirmada | Separar score de compatibilidade e projeção nos critérios oficiais. |
| D5 | Campo vazio não é proibição | Confirmada; renormalização inflaciona score | Dados desconhecidos recebem 0,5 neutro na v4; exibir cobertura. |
| D6 | Requisitos explícitos distintos de preferências | Confirmada e subutilizada | Requisito artístico obrigatório não atendido aciona teto de 45. |
| D7 | Taxonomia de linguagens sem papéis | Incompleta | Edital deve marcar linguagem como núcleo ou suporte. |
| D8 | Combinação 0,35 artista + 0,65 obra; alfa 0,6 | Plausível, não testada em profundidade | Manter provisória; testar alfas e pesos com dados reais. |
| D9 | Supabase/Voyage/DeepSeek + interface de provedor | Arquitetura coerente; abstração demonstrada | TF-IDF substituiu embeddings sem reescrever ranking; ainda falta teste A/B de Voyage. |
| D10 | Sistema se reduz à fórmula C | Refutada | Ranking é o motor multi-fator, não C. |
| D11 | Não há sinal de resultados | Refutada no benchmark | Continuar a validação com dados reais e múltiplos avaliadores. |
| D12 | 30 editais como base de referência | Útil para benchmark inicial, insuficiente para treino | Obter documentos oficiais, anexos, erratas, critérios e resultados. |

### 27.4 Pesos: manter, mas não supervalorizar

Cada peso foi perturbado em ±0,05 com renormalização dos demais; tau de Kendall permaneceu entre 0,953 e 0,973. Com pesos iguais, tau foi 0,883 e as métricas agregadas permaneceram próximas (Spearman 0,763 contra 0,769 na v3). Decisão: conservar os pesos iniciais como baseline configurável e não investir em microajustes antes de obter dados reais de inscrições, avaliações e resultados homologados.

### 27.5 Casos que devem virar testes automatizados

1. **Fotografia de memória urbana × Festival de Dança:** v0 = 67,0; v3/v4 = 45,0. O edital aceita fotografia como suporte, mas a linguagem núcleo é dança/performance. Testa `CORE`/`SUPPORT` e teto.
2. **Perfil iniciante com documentação incompleta × Malakoff:** v0 = 80,2; v4 = 77,1, com cobertura de 75%. Testa nota neutra 0,5 sem renormalização.
3. **Mestre Bituca (território metropolitano) × FIC Recife:** afinidade artística 59,3, mas bloqueio por requisito territorial obrigatório. Testa elegibilidade antes do ranking.
4. **Cia Duo Cênico × Aprendiz em Cena:** score v4 = 84,3; positivo que deve permanecer estável.
5. **Théo × Mostra de Circo:** score v4 = 82,5; positivo que deve permanecer estável.
6. **Artista sem oportunidade relevante elegível:** não apresentar opções marginais como se fossem boas recomendações; mostrar aviso de escassez.

Os scores são os valores reportados no benchmark, não resultados de artistas reais.

### 27.6 Editais genéricos e baixo poder discriminante

O score médio global v0 foi 50,3, desvio 16,6; apenas 14,2% dos pares elegíveis superaram 70. Não há saturação geral no topo. O problema é localizado em editais pouco específicos: FIC 2025 v0 = 64,7 ± 5,6 e v4 = 62,3 ± 3,7; formação técnica v0 = 60,7 ± 8,1 e v4 = 60,3 ± 6,1. A interface deve distinguir “score alto” de “edital que diferencia candidatos”. O indicador de desvio por edital e o aviso de edital aberto são decisões de produto; limiar de baixo poder discriminante ainda precisa ser calibrado.

### 27.7 Projeção competitiva não é probabilidade

Para editais com critérios oficiais documentados, projetar a pontuação do perfil/obra na rubrica publicada, mantendo o mapeamento fator→critério auditável. Exemplo Malakoff: Marina 21,6/26; Ana 21,0/26; Beto 16,4/26, embora Beto tivesse maior compatibilidade (77,1). A projeção depende da correspondência entre fatores e critérios e não substitui a banca. Para editais sem critérios públicos, não exibir projeção.

### 27.8 Confiança C: uso permitido e proibido

Fórmula mantida: `C = 100 × (0,35K + 0,30E + 0,15A + 0,20X)`.

- Uso permitido: sinalizar cobertura, qualidade das evidências, atualidade e segurança da extração/classificação.
- Uso proibido: ordenar artistas, substituir compatibilidade, reduzir score artístico ou representar chance de seleção.
- Baixa C deve solicitar documentação/revisão e explicar a lacuna.
- Monitorar o viés observado: perfis mais completos podem ser também perfis de artistas mais estruturados; confiança alta não significa maior mérito artístico.

### 27.9 Pendências que continuam abertas

- Varredura de `alpha` da combinação entre melhor obra e média das melhores obras; no benchmark, apenas `alpha = 0,6` foi exercitado.
- Calibrar pesos artista/portfólio por modalidade de edital.
- Definir limiares de recomendação por modalidade.
- Definir threshold de baixo poder discriminante por edital.
- Validar projeção competitiva com especialistas e mapeamentos reproduzíveis.
- Repetir rubrica com pelo menos dois avaliadores e medir concordância/desacordo.
- Substituir perfis hipotéticos por artistas reais com consentimento e dados minimizados.
- Estruturar documentos oficiais completos dos 30 editais; não usar reconstruções representativas como cláusulas oficiais.
- Coletar inscrições e resultados homologados para calibração posterior.
- Fazer experimento A/B TF-IDF versus embeddings Voyage, medindo ranking, latência e custo.

### 27.10 Próximos passos por ordem

1. Empacotar dados, scripts, rótulos e resultados do benchmark em repositório versionado; criar teste de regressão automatizado.
2. Fixar v4 como baseline do motor para os casos cobertos, com versão de algoritmo, pesos e proveniência.
3. Obter editais oficiais completos e revisar os requisitos, papéis de linguagem, critérios e erratas.
4. Ampliar os perfis reais com consentimento e revisão humana; rotular pares com pelo menos dois avaliadores.
5. Rodar comparação TF-IDF × Voyage usando a mesma base e os mesmos rótulos.
6. Só então calibrar `alpha`, pesos por modalidade, thresholds e projeções competitivas.
7. Coletar resultados reais e homologados antes de qualquer tentativa de estimar probabilidade de aprovação.

### 27.11 Artefatos de reprodução mencionados no relatório

O pacote do benchmark descrito no relatório contém, segundo a Tabela 9. Na conferência complementar de 16/11/2026, os artefatos foram localizados e reexecutados pelo script `verify_v11.py`; as 38 verificações numéricas reportadas fecharam sem divergências. O pacote deve ser versionado no repositório do projeto, junto com os hashes/versões dos dados e scripts, para permitir reprodução futura. A existência e a reexecução são registradas com base na conferência apresentada pelo responsável pelo benchmark.

- `artistrank/data/editais_estruturados.json` — 12 editais estruturados com proveniência e força de requisitos.
- `artistrank/data/artistas.json` — 12 perfis com posicionamento, conceitos, trajetória, obras e cobertura.
- `artistrank/data/ground_truth.json` — rubrica e rótulos dos 144 pares.
- `artistrank/data/editais_metadata_30.json` — corpus de 30 editais.
- `artistrank/results/*.csv` — matrizes de scores.
- `artistrank/results/*.json` — métricas, sensibilidade, saturação, casos e projeção competitiva.
- `artistrank/results/figs/*.png` — seis figuras.
- `scripts/artistrank/*.py` — motor, datasets, experimentos e gráficos reprodutíveis.

Esses artefatos foram mencionados como entregues junto ao relatório, mas não foram anexados nesta conversa; portanto, este registro não afirma que os arquivos estejam disponíveis localmente.

### 27.12 Ressalvas e inconsistências resolvidas na conferência

- **Top-1 e contagem por artista:** Top-1 = 1,000 está correto para os 11 artistas com pelo menos uma opção relevante. A frase antiga “10 dos 12” estava desatualizada e correspondia à rodada anterior à correção do teto. Após a correção, **11/12 artistas** têm primeira recomendação em edital de aderência forte (rótulo 3); Beto é o único sem opção relevante. Não manter a contagem antiga de 10/12.
- O benchmark usa TF-IDF, não Voyage; a camada de embeddings continua sem validação empírica.
- Os dados são hipotéticos/reconstruídos em sua maioria e a rubrica tem um avaliador; as métricas podem superestimar generalização.
- A projeção competitiva Malakoff é ilustrativa e depende de mapeamento fator→critério; não é nota oficial nem probabilidade.
- O limiar de baixo poder discriminante, os limiares de recomendação e a combinação artista/portfólio não foram calibrados.

------------------------------------------------------------------------

## 28. Estado normativo da especificação após o benchmark

Para implementação, adotar esta ordem de precedência:

1. Elegibilidade formal e eliminatória (`PASS` / `FAIL` / `UNKNOWN` / `NOT_APPLICABLE`).
2. Compatibilidade artística/proposta pelos oito fatores e pesos baseline.
3. Dados ausentes com nota neutra 0,5 e cobertura explicitada (v4).
4. Requisitos artísticos explícitos obrigatórios: teto máximo 45 quando comprovadamente não atendidos.
5. Linguagens do edital classificadas como núcleo ou suporte.
6. Calcular separadamente score do artista e score do portfólio; combiná-los (baseline testada: 0,35/0,65) e aplicar, somente depois, o teto de 45 ao score combinado quando houver requisito artístico obrigatório explicitamente não atendido. A combinação continua provisória e configurável.
7. Confiança C separada e sem efeito punitivo no score.
8. Poder discriminante por edital e aviso quando a oportunidade pouco diferencia os perfis.
9. Projeção competitiva apenas quando critérios oficiais estiverem documentados e mapeáveis.
10. Explicações, evidências, cobertura, proveniência e versão do algoritmo persistidas para auditoria.

**Baseline recomendado:** motor v4 para regras de ausência de dados, com correção de linguagem e teto já introduzidas em v2/v3. A AUC da v4 (0,947) fica 0,002 abaixo da v3 (0,949), diferença pequena neste benchmark e sem evidência de regressão relevante. A v4 não melhora as métricas agregadas sobre v3, mas elimina a inflação por dados ausentes e mantém as demais métricas de ranking; por isso é a versão de referência mais completa para implementação. O teto de 45 deve ser aplicado ao score combinado artista/portfólio, conforme §9.3.1 e §15.

------------------------------------------------------------------------

## 29. Benchmark com ganhadores reais — v2.0 do relatório (2026-11-16)

**Fonte:** `docs/search/` — `relatorio_benchmark_real_v2.pdf`, `benchmark_real.json`, `calibracao_real.json`,
`ground_truth.json`, `editais_reais.json`, `artistas_reais.json`, `dataset_real.py` e a planilha
`registro_editais_ganhadores_reais.xlsx`. Esta seção **substitui o aviso da v1.2** de que o benchmark não tinha
resultados reais, mas só nos limites de §29.3. Ela não altera nenhuma regra da §28.

> **Atualização de 17/11/2026 (v3, §30).** Dois pontos desta seção foram superados. (1) A v2 tratava a lista de
> linguagens aceitas de um edital como todas-obrigatórias; a causa de o Multilinguagens cair na v0 não era só a
> renormalização, e a semântica correta é "qualquer uma" (§30.2). (2) A v2 pôs os projetos Guerreiros e Pioneiros
> (R$ 500 mil) na seção FIC; eles são do MIC, e a v3 reatribuiu essas âncoras. Os números de §29.1 valem como
> histórico da v2, não como referência de regressão: a referência é a §30.

### 29.1 O que foi medido

- 20 editais catalogados (Recife, Olinda, Caruaru). **14 de Recife** têm ganhadores verificados em PDF oficial ou
  imprensa e ancoram **26 pares** vencedor–edital (no máximo dois por edital; no fomento, os dois de maior valor).
  Os 6 de Olinda e Caruaru têm só a URL do resultado: **pendentes**, nenhum nome inventado.
- Aprovados além das âncoras ficam fora da disputa do próprio edital (4 casos em `ground_truth.json`), para não
  gerar falso negativo.
- Métrica: posição do melhor ganhador âncora entre 27 e 30 candidatos elegíveis, para cada um dos 14 editais.

| Configuração | MRR | Hit@1 | Hit@3 | Rank médio |
|---|---:|---:|---:|---:|
| v0 — especificação literal (nulo = 0, renormalizando) | 0,911 | 85,7% (12/14) | 92,9% (13/14) | 1,29 |
| v2 — teto por requisito explícito | 0,964 | 92,9% (13/14) | 100% | 1,07 |
| v4 — nulos 0,5 + teto + papéis | 0,964 | 92,9% (13/14) | 100% | 1,07 |
| v4 com pesos iguais | 0,964 | 92,9% (13/14) | 100% | 1,07 |

### 29.2 O que isso confirma

- **v4 (ou v2) acima de v0**, de novo com dados reais. A diferença vem de **um** edital: no Multilinguagens
  (PNAB 2026) o ganhador cai para a 4ª posição na v0, por causa da renormalização, e volta à 1ª com o teto. Confirma
  D5 e D6 (§27.3).
- **Pesos 15/20/10/15/10/15/5/10 mantidos** (D2). A busca por coordenadas (multiplicadores 0,4 a 2,0, três
  varreduras) não achou combinação melhor; o leave-one-out devolve os mesmos pesos em todas as 14 dobras, com MRR 1,0
  em 13 delas. Nenhuma ação sobre os pesos.
- **Único rank 2 residual:** Virado na Periferia (Hip-Hop). Um artista do pool com as duas linguagens do edital
  (música e artes visuais) supera os ganhadores. É efeito da composição do pool, não dos pesos.

> **Correção ao relatório.** O texto do PDF diz que a v0 "perde dois editais" para a v4. Em `benchmark_real.json`
> só o Multilinguagens muda de posição (4 → 1); o Virado fica em 2 nas quatro configurações. O que vale é um edital.

### 29.3 O que isso **não** prova

1. **Circularidade da linguagem.** A linguagem de cada ganhador foi herdada do segmento do edital em que ele
   ganhou, e o pool de concorrentes são os ganhadores dos outros editais. O fator linguagem (15%), a obra e o
   território quase garantem o topo por construção. O resultado mostra que o motor **não estraga** um casamento
   que já vem pronto; não mostra que ele separa bons de maus candidatos dentro de uma mesma linguagem.
2. **Calibração sem informação.** MRR igual em baseline, calibrado e pesos iguais não diz que os pesos estão certos:
   conceito, técnica, posicionamento, trajetória e viabilidade ficam neutros (0,5) para todos, então seu peso não
   move a ordem. Vale a §27.4: **congelar o ajuste fino** até haver variância nesses fatores.
3. **Pool sintético** (só ganhadores). Não há inscritos reprovados, então o benchmark não mede "ganhou" contra
   "não ganhou". O corpus `multi_result` (834 inscrições rotuladas, `plano.md` §7.9) é o que mede isso.
4. **Amostra pequena:** 14 editais, MRR com um edital valendo 7 pontos percentuais de Hit@1. Sem intervalo de confiança.
5. **Resultados não reproduzidos no repo:** o motor e o script de calibração não vieram no pacote (§29.5).
6. OBSERVA 3 é edital estadual (Fundarpe) sediado no Recife, mantido por ser o caso-documento da §8.

### 29.4 Efeito nas pendências da §27

- **D11** ("não há sinal de resultados"): continua refutada, agora com ganhadores reais, **porém** só para linguagem,
  obra e território (§29.3).
- **D12 / §27.9:** a pendência "substituir perfis hipotéticos por reais" avança só em parte: os perfis reais são
  mínimos (título do projeto) e sem trajetória. Continuam abertas a rubrica com dois avaliadores, o A/B TF-IDF × Voyage
  e a varredura de `alpha`.
- **§27.10:** o item 1 (empacotar dados) está **cumprido para os dados** em `docs/search/`, e **aberto para o motor**.

### 29.5 Uso na implementação (O4, motor puro)

- Os 14 editais e 30 artistas de `docs/search/` viram **fixtures de regressão** do motor, ao lado dos casos da §27.5.
  Critério sugerido: ganhador âncora no top 3 em 14/14 e no topo em 13/14 na v4; **o Virado em 2 é o valor esperado**.
- Teste de comportamento a incluir: renormalizar nulos (v0) **tem** que reprovar no Multilinguagens.
- Não codificar o MRR como meta de produto: ele mede a circularidade de §29.3.
- Prioridade de dado para dar variância aos fatores neutros: **trajetória e posicionamento dos perfis** e
  **estruturas de requisito dos editais**, antes de qualquer nova calibração.

### 29.6 Próximos passos, em ordem de valor

1. Capturar os 6 resultados de Olinda e Caruaru nas URLs de `ground_truth.json` (`pendentes`).
2. Capturar as listas de habilitados para trocar o pool sintético pelos concorrentes reais.
3. Enriquecer os perfis (trajetória, posicionamento) e as exigências estruturadas dos editais.
4. Só então repetir a calibração, com leave-one-out (já implementado), e rever os pesos.
5. Congelar a v4 como baseline de regressão, com `registro_editais_ganhadores_reais.xlsx` como fonte dos pares.

------------------------------------------------------------------------

## 30. Benchmark v3 — concorrentes reais que não ganharam (2026-11-16)

**Fonte:** `docs/search/v3/` — `relatorio_benchmark_v3.pdf`, `engine_v3.py` (motor de referência em Python),
`dataset_v3.py`, `experiments_v3.py`, `calibrate_v3.py`, `verify.py`, `data_v3/` (artistas, candidatos, editais, rótulos,
casos de elegibilidade e teto) e `results/`. Substitui a §29 como referência.

**Reproduzido em 2026-11-17** com `cd docs/search/v3 && python3 -I verify.py` e `python3 -I experiments_v3.py`:
`verify.py` passa (44 pares, 23 editais verificados e 6 pendentes, 1.038 candidatos, MRR 1,0 e Hit@1 1,0 em 10 editais) e
`experiments_v3.py` regrava `results/benchmark_v3.json` **idêntico** ao entregue (AUC 0,510 em v0 e v2, 0,520 em v4).
**Divergência:** o relatório diz que a discordância "melhor obra × média das 3 melhores" apareceu em 1 edital
(Multilinguagens); o `benchmark_v3.json` traz `discordancia_melhor_media: []`, ou seja, **0**. Vale o dado, e o relatório
está errado nesse ponto. A varredura do alpha cobre 3 editais (`alpha_editais`), mas as métricas reportam n = 2.

### 30.1 O que mudou da v2

- **Corpus:** 29 editais catalogados (23 com resultado verificado, 6 de Olinda e Caruaru ainda pendentes), 44 âncoras
  (no máximo 2 por edital) e **759 candidatos reais que não ganharam** (suplentes, desclassificados, habilitados), cada
  um com situação e fonte. O Multilinguagens PNAB 2026 traz 836 inscrições rotuladas (155 selecionadas, 639 suplentes,
  42 desclassificadas).
- **Linguagem com origem declarada** (`evidencia_propria`, `evidencia_resultado` ou edital, este último só como último
  recurso): fim da circularidade da §29.3, ponto 1. Há 10 artistas multilinguagem e 110 pares fora da linguagem com rótulo 0.
- **9 casos de elegibilidade e teto** executados, todos passando (`casos_elegibilidade_teto.json`); os de pessoa
  jurídica, formação e tempo mínimo são **regras de teste** para provar a mecânica, não requisitos reais dos editais.
- **Split treino/teste registrado antes das métricas** (15 editais de treino, 8 de teste, por hash do id).

### 30.2 Regra nova, achada pelo benchmark: lista de linguagens é "qualquer uma"

Dentro de uma mesma exigência, as linguagens listadas são **alternativas aceitas**: a nota é a **melhor** correspondência
(máximo), não a média. Com a média, um circo numa lista de 14 linguagens aceitas derrubou o ganhador do Multilinguagens
para a posição 92 de 623. A mesma lógica vale para o teto: só dispara se **nenhuma** das alternativas casa.

> **Pendente de confirmação.** Esta regra altera a interpretação do edital e vai para a entrevista de regra de negócio
> do motor (`docs/features/ranking/0002-artistrank-motor-puro.md`) antes de entrar no código.

### 30.3 Resultados (10 editais com não-ganhadores publicados)

| Configuração | MRR | Hit@1 | Hit@3 | AUC | NDCG@5 |
|---|---:|---:|---:|---:|---:|
| v0 (nulo = 0, sem teto) | 1,000 | 10/10 | 10/10 | 0,510 | 0,962 |
| v2 (teto) | 1,000 | 10/10 | 10/10 | 0,510 | 0,962 |
| v4 (nulo 0,5 + teto + papéis) | 1,000 | 10/10 | 10/10 | 0,520 | 0,962 |
| v4 com pesos iguais | 1,000 | 10/10 | 10/10 | 0,520 | 0,962 |

### 30.4 Leitura correta: o resultado forte é de empate

- **Rank 1 é por empate.** A âncora fica empatada com centenas de candidatos e conta como primeira; por isso o MRR é 1,0
  e o intervalo de confiança degenera em [1,0; 1,0]. O motor **não coloca o ganhador abaixo de ninguém**, mas também
  **não o destaca**: a AUC contra os rótulos é **0,52**, equivalente ao acaso.
- **Causa:** os resultados oficiais publicam nome, título, valor e situação, não portfólio, trajetória nem a resposta de
  cada candidato aos requisitos. Com esses perfis qualquer pontuação razoável empata.
- **Os pesos continuam sem se mover** (trace vazio; no teste o MRR calibrado é igual ao baseline), agora por empate, não por
  fator neutro. Vale a §27.4: **não calibrar pesos** até haver variância nos dados.
- **O alpha não foi exercitado de verdade:** a varredura em {0,0 · 0,4 · 0,6 · 0,8 · 1,0} saiu plana (MRR 1,0 nos cinco),
  porque só 3 artistas têm 3 a 6 obras (o mínimo pedido era 12) e a discordância "melhor obra × média das 3 melhores"
  apareceu em **0** editais pelo próprio `benchmark_v3.json` (o relatório diz 1; o mínimo era 8). **Continua pendente.**
- **Rubrica com pouca concordância:** o kappa ponderado entre os dois avaliadores é **0,20**. Os rótulos 0 a 3 ainda não
  servem de verdade de campo (§27.9: avaliadores independentes de verdade, não dois passes do mesmo modelo).
- **Camada semântica:** TF-IDF sobre títulos separa em pools pequenos (AUC 1,0 no Solo do Outro e no Aprendiz em Cena) e
  não nos grandes (0,52 no Multilinguagens). É a pista de que o próximo ganho vem de **descrições completas e embeddings**,
  não de ajuste de pesos.
- **Contexto de trajetória (4.7, descritivo, fora do score):** no Multilinguagens, 48% dos selecionados e 39% dos
  suplentes se declaram pessoas negras; no Virado, 74% e 68%; PcD, 5% e 0%. Só o que os resultados publicam, sem inferir.

### 30.5 Ressalvas sobre o motor de referência (`engine_v3.py`)

- **O portfólio entra duas vezes.** `rank_artist_edital` calcula `artist_score` ponderando os oito fatores, **incluindo o
  fator O**, e depois soma `0,65 · O`. A spec (§9.6) separa `R_artista` (fatores do artista) de `R_portfólio` (obras). O
  motor novo não deve copiar isso sem decisão.
- **O fator de obra tem pesos próprios fixos** (`0,35·linguagem + 0,35·conceito + 0,20·viabilidade + 0,10·0,8`) que não
  estão na spec.
- **Correspondência graduada de linguagem** (exata 1,0; pai ou filho 0,6; irmãs 0,3) e de conceito (central 1,0, secundário
  0,6, sinônimo parcial 0,4) usam tabelas que não são a taxonomia da O3.
- **Viabilidade e trajetória usam heurísticas** (penalidade de 0,25 por violação; mistura 0,5/0,3/0,2).

Estas escolhas não são regra de negócio decidida. Entram na entrevista do motor, uma a uma.

### 30.6 Limitações e próximos passos

1. 6 resultados de Olinda e Caruaru pendentes. **Tentados em 2026-11-17** (`docs/search/v3/captura_2026-11-17/LEIAME.md`):
   só o Caruaru PNAB 001/2026 publica contemplados (47, capturados, sem candidatos que não ganharam); os outros cinco
   trazem apenas habilitados ou análise documental, têm o resultado em pastas do Google Drive ou ainda não o publicaram.
2. Corpus multi-obra e 6 editais com requisito além de linguagem (os PDFs do SIC e do Aprendiz estavam fora do ar): 3 de 12
   e 6 de 8 atingidos.
3. Descrições completas de projetos e editais para a comparação TF-IDF × Voyage (§27.9).
4. Avaliadores humanos independentes e kappa decente.
5. Só depois disso, calibrar pesos, `alpha` e limiares.
