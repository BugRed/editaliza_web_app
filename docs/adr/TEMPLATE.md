# ADR NNNN — <decisão em uma linha, no imperativo ou no indicativo presente>

**Status:** Proposto | Aceito | Substituído por ADR-NNNN | Revogado · AAAA-MM-DD

> A **data é obrigatória** e fica nesta linha. Supersessão sem tempo não ordena: sem data não
> dá para saber qual decisão veio depois. O `contrato.mjs` avisa quando falta.
>
> O título desta primeira linha **é o índice**: o hook de sessão o injeta e o corpo só se lê
> sob demanda. Escreva-o para ser entendido fora de contexto, em ~60 caracteres.

## Contexto

O que era verdade quando a decisão foi tomada: a pressão, a restrição, o número medido. Sem
isto, quem lê daqui a um ano não sabe se a decisão ainda se aplica.

## Decisão

O que foi decidido, em voz ativa. Se houver parâmetro (um limite, um caminho, um nome),
escreva-o aqui — é o que alguém vai procurar.

## Alternativas rejeitadas

**Obrigatório.** Uma linha por alternativa considerada e **por que não**.

É o campo que mais custa perder e o único que nenhum commit guarda: o diff mostra o que foi
feito, nunca o que foi descartado nem a razão. Sem ele, a próxima sessão — humana ou agente —
refaz o mesmo caminho até bater no mesmo muro.

- **<alternativa>:** <por que não>

## Consequências

- ➕ O que melhora.
- ➖ O que piora, ou o preço que se paga. Se não há nenhum, a decisão provavelmente não foi
  tomada de verdade.
- ⚠️ O que fica em risco, e o sinal que diria que a decisão precisa ser revista.
