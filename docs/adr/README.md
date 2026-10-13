# ADR — registro de decisões

O *porquê* das escolhas que constrangem o código futuro. Cada ADR é **imutável**: aceito, não
se edita. Se a decisão muda, escreve-se um ADR novo e o antigo recebe
`Status: Substituído por ADR-NNNN` — nada é apagado.

Formato (Michael Nygard) em [`TEMPLATE.md`](./TEMPLATE.md): **Contexto → Decisão →
Alternativas rejeitadas → Consequências**, com **Status e data** na segunda linha. Numeração
sequencial, na ordem em que as decisões são tomadas.

Status: `Proposto` · `Aceito` · `Substituído por ADR-NNNN` · `Revogado`.

## Não há índice escrito aqui

De propósito. Índice mantido à mão diverge dos arquivos e passa a mentir sem que ninguém
perceba — é a forma mais comum de um registro de decisões apodrecer.

O índice vivo é **derivado** pelo hook de sessão (`.claude/hooks/estado.mjs`), que lê o título
e o status de cada arquivo e injeta a lista das decisões **vigentes** no começo da sessão. As
superadas saem da lista sem sair do repositório. O corpo de cada ADR se lê sob demanda.

O índice tem **teto** (1.200 tokens — de 60 a 75 decisões vigentes, conforme o tamanho dos
títulos; medido: ~16 tokens por título curto, ~19 por título longo). Acima dele o hook passa a mandar
só o ponteiro, e o `contrato.mjs` avisa para podar — marcar como superado o que já não vale.
Um registro sem teto cresce até ninguém ler.

## O que é ADR e o que não é

| Vai para | Quando |
|---|---|
| **ADR** | A decisão constrange o código futuro: alguém que fizer diferente está errado |
| [`../divida.md`](../divida.md), tabela | Ficou incompleto, duplicado ou não exercitado |
| [`../divida.md`](../divida.md), **Becos sem saída** | Tentou-se um caminho e ele não funcionou |
| `CHANGELOG.md` | Impacto visível para quem usa |
