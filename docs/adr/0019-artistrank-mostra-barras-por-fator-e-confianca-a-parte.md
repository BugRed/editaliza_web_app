# ADR 0019 — O ranking mostra barras por fator e a confiança fora do score

**Status:** Proposto · 2026-11-16

## Contexto

O modal do edital mostrava o ArtistRank como três números soltos (artista, portfólio, combinado).
O usuário pediu barras para expor "as soluções do rank" e deixou a forma em aberto. A spec
([`ops/ArtistRank_…v1.2`](../ops/ArtistRank_decisoes_e_especificacao_completa_v1.2_conferencia.md))
impõe restrições à apresentação:

- §14.4: exibir **separadamente** pontuação, confiança, elegibilidade, motivos e lacunas; não
  apresentar a nota como probabilidade de ganhar; a confiança C nunca entra no score nem vira ranking.
- §9.2/§9.3: dado ausente é **desconhecido**, não zero (nota neutra 0,5, sem renormalizar), e a
  interface deve deixar explícito o que falta informar.
- §9.3.1: o teto de 45 incide no score final combinado, e o motivo precisa aparecer.
- §9.8: a projeção sobre a banca é um indicador **separado**, ainda não existente.

O motor do protótipo (`shared/lib/artistrank.ts`) calcula sete fatores em dois grupos (artista 35%,
portfólio 65%) e descartava as notas por fator; ele **não** é o motor de oito fatores da §9.1 (a W5 o
reescreve) e renormaliza fator ausente, o que a spec proíbe.

## Decisão

1. O `ArtistRankResult` passa a devolver `fatores[]` (id, grupo, rótulo, peso no grupo, nota 0–100
   ou `null`). As barras desenham **o que o motor devolver**; quando a W5 trocar o motor pelos
   oito fatores, a interface não muda.
2. **Uma barra por fator**, agrupadas em "Perfil do artista · 35% do score" e "Portfólio e obras ·
   65% do score", cada grupo com a sua barra-total, mais a barra **Score final**. Com teto aplicado,
   entra também **Score antes do teto** e o motivo.
3. **Fator sem dado não vira barra curta**: mostra trilha tracejada e "Sem informação", e entra na
   frase "O que falta informar" com link para Configurações.
4. **Confiança e cobertura ficam fora das barras**, num aviso próprio que diz que não alteram o
   score e que a nota não é chance de aprovação nem avaliação artística.
5. **Inelegível não mostra barras**: só o motivo (§15: sem recomendação para inelegível).
6. **Cor por faixa da nota de cada barra:** até 40 **pouco** (vermelho), até 70 **médio** (amarelo),
   acima de 70 **alto** (verde), com limites inclusivos. A faixa aparece também **em texto** ao lado
   do valor e numa legenda (cor nunca é o único sinal). Cada barra é um `role="meter"` com valor e
   `aria-valuetext`. Os limites são decisão de produto e vivem em `BAND_LIMITS`
   (`shared/lib/rank-view.ts`); os cortes do rótulo de aderência do motor (50 e 68) são outros e
   continuam descrevendo só o score final.
7. **Cada grupo tem um dropdown** ("Esconder/Mostrar os N fatores") que esconde o detalhe sem
   esconder a barra do grupo; começa aberto, e o estado é por grupo e por abertura do modal.
8. Lugar: o modal de resumo do edital. O card do feed continua só com o selo curto, e abre o modal
   ao clicar na imagem, no título ou em "Inscrever-se" (nunca no card inteiro).

## Alternativas rejeitadas

- **Uma barra só (o score final):** esconde de onde o número vem e não deixa ver o que melhorar.
- **Radar/aranha:** pior para ler no celular e para fator ausente, que não tem como ficar "vazio".
- **Barra de confiança ao lado do score:** convida a ler C como parte da nota, o que a §14.4 proíbe.
- **Mostrar fator ausente como 50%:** é a nota neutra do cálculo, mas na tela pareceria avaliação
  média; a spec pede deixar explícito que é falta de evidência.
- **Cortes em 20/…:** o motor dá nota mínima de 20 a 25 em vários fatores; com "vermelho até 20" quase nunca apareceria vermelho. 40 e 70 deixam as três faixas visíveis nos dados atuais.
- **Porcentagem grande no card do feed:** sugere probabilidade; fica o selo "Aderência" e o score no detalhe.

## Consequências

- ➕ O usuário vê o que puxou a nota para cima ou para baixo e o que preencher para melhorá-la.
- ➕ A interface sobrevive à troca do motor (W5), porque depende de `fatores[]`, não de fórmula.
- ➖ Os pesos exibidos hoje são os do protótipo, não os 15/20/10/15/10/15/5/10 da spec; a tela os
  mostra como "35% / 65%" do grupo. Revisar quando a W5 chegar.
- ⚠️ O motor atual ainda **renormaliza** fator ausente: a barra diz "sem informação" mas o score já
  foi calculado sem ele. Esse descompasso some só com a W5.
