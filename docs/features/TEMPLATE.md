# <Nome da feature>

**Status:** rascunho | aprovada | em-desenvolvimento | entregue
**Responsabilidade:** api | ui | seguranca | integracoes | dados | ...
**Branch:** <tipo>/<escopo>-<ID>/<slug>
**Autor:** <nome> · **Data:** AAAA-MM-DD

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [ ] prisma — schema / migration
- [ ] service — regra de negócio
- [ ] controller — orquestração
- [ ] route — fronteira HTTP
- [ ] ui — componentes e página
- [ ] teste — cobertura das camadas tocadas
- [ ] doc — negócio / ADR / db / ops atualizados
<!-- /kit:camadas -->

**Próximo passo:** <uma linha: o que falta fazer agora. É a primeira coisa que a próxima sessão lê.>

> Camada que não se aplica a esta feature: marque e escreva o motivo ao lado
> (ex.: `- [x] ui — não se aplica, feature só de API`). O contrato cobra as
> camadas tocadas no código, não as sete sempre.

## Problema / motivação
Que dor ou objetivo esta feature resolve. (1–2 parágrafos.)

## Escopo
**Entra:**
- ...

**Não entra (fora de escopo):**
- ...

## Comportamento / fluxos
Como funciona do ponto de vista do usuário e do sistema (passos, estados, telas).

## Impacto técnico
- **Banco:** tabelas/colunas novas ou alteradas (link para [`db/modelo-de-dados.md`](../../db/modelo-de-dados.md)).
- **API:** route handlers / controllers / services / contratos.
- **UI:** rotas e componentes tocados.

## Regras de negócio relacionadas
Links para [`../negocio/`](../../negocio/) — não reescreva a regra aqui, referencie.

## Critérios de aceite

<!-- kit:criterios -->
- [ ] ...
<!-- /kit:criterios -->

## Dívida / não exercitado
O que ficou duplicado, o que não foi testado contra o sistema real, o que foi decidido
na hora sem estar na spec. Ao fechar a feature, o que sobreviver vai para
[`docs/divida.md`](../../divida.md).

## Decisões em aberto
- ...
