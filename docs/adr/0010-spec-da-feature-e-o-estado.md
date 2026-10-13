# ADR 0010 — A spec da feature é o arquivo de estado

**Status:** Aceito · 2026-10-08

## Contexto

Com o estado derivado do git (ADR-0009), sobra o que o git não sabe: por que a feature existe,
o que falta fazer agora, o que ficou mal resolvido. Isso precisa de um lar versionado.

O boilerplate já tinha `docs/features/<responsabilidade>/NNNN-*.md` com `Status` e critérios
de aceite em checkbox — uma spec descritiva, escrita antes de codar e esquecida depois. Um
arquivo central de progresso, por outro lado, conflita em paralelo e cresce sem teto.

Uma lacuna aparecia nos dois formatos: nenhum registrava **onde se parou dentro da feature**.
Como a unidade de trabalho aqui é a feature vertical (migration → service → controller →
route → UI → teste → doc), parar no meio é o caso normal, não a exceção.

## Decisão

A spec da feature é também o seu estado. Ao `TEMPLATE.md` acrescentamos:

- um bloco `<!-- kit:camadas -->` com as sete camadas da arquitetura em checkbox;
- **Próximo passo:** uma linha — a primeira coisa que a próxima sessão lê;
- uma seção **Dívida / não exercitado**;
- um bloco `<!-- kit:criterios -->` delimitando os critérios de aceite.

Os delimitadores existem para que o hook leia cada bloco sem confundir um checkbox com o
outro. A spec é ligada à branch pelo campo `**Branch:**`; sem ele, o vínculo cai para o slug
e o contrato avisa.

A marcação das camadas é fato do git (o hook calcula quais foram tocadas), mas quem escreve na
spec é o `/feature` ao retomar e o `/fechar` ao encerrar — não o hook a cada parada, para não
encher o diff de ruído.

## Consequências

- ➕ Cada branch toca só a sua spec: paralelismo sem conflito.
- ➕ A spec deixa de ser documento morto — é lida e escrita em toda sessão.
- ➕ "Onde parei" passa a existir, com granularidade de camada.
- ➖ Uma feature sem spec fica sem estado; por isso o contrato (ADR-0011) reprova branch
  `feature`/`release` sem spec vinculada.
- ⚠️ As sete camadas são as deste boilerplate. Projeto que divergir da arquitetura precisa
  mudar a lista em `TEMPLATE.md` **e** em `estado.mjs` — hoje são dois lugares.
