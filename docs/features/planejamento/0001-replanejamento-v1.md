# Replanejamento da V1 — feed por afinidade e resumo de edital por IA

**Status:** entregue
**Responsabilidade:** planejamento
**Branch:** docs/docs-01/replanejamento-v1
**Autor:** BugRed · **Data:** 2026-11-15

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica, só documentação
- [x] service — não se aplica, só documentação
- [x] controller — não se aplica, só documentação
- [x] route — não se aplica, só documentação
- [x] ui — não se aplica, só documentação
- [x] teste — não se aplica, só documentação
- [x] doc — `plano.md` reescrito (decisões D2–D25, §6.0 ondas, §7.0 ArtistRank, §10 telas, §11 protótipo); PROGRESS e CHANGELOG atualizados
<!-- /kit:camadas -->

**Próximo passo:** usuário faz push/PR desta branch (e das 4 empilhadas), depois abrir a **O1 — articulação de design**:
mapa de telas e protótipo navegável para aprovar, partindo do `editaliza_prot` e dos tokens da `feature/ui-01`.

## Problema / motivação
O `plano.md` (2026-10-13) foi escrito antes de o produto ser reposicionado: a IA de resumo
de edital era V2 e o stack previa Better Auth + SQL puro. Agora a V1 entrega (1) feed ordenado
por afinidade com a arte do artista e (2) resumo do edital em linguagem simples. O plano
precisa refletir isso antes de qualquer implementação.

## Escopo
**Entra (decidido com o usuário em 2026-11-15, revisado após a primeira rodada):**
- Manter **este repo** (já tem a arquitetura do kit); trazer do `editaliza_true` só o que falta.
- Match **híbrido** do D3: regras eliminatórias + tags + afinidade semântica depois; sem EdgeRank
  (não há grafo social nem interações). Tags são um sinal, não o motor.
- V1 = **feed + resumo IA do edital**. Revisão do projeto do artista fica pós-V1.
- Stack: **Prisma + Better Auth + Supabase Storage**. Mantém o D2 (sem lock-in de vendor, livre para migrar de provedor depois); só o runner SQL puro é substituído por Prisma.
- **Algoritmo de recomendação:** ArtistRank, spec em `docs/ops/ArtistRank_decisoes_e_especificacao_completa_v1.2_conferencia.md`; resumo normativo em `plano.md` §7.0.
- **Redesign de todas as telas:** rascunho em `plano.md` §10.
- LLM: **DeepSeek** atrás da interface `LLMProvider` (D6), em job agendado.
- Ingestão V1: admin manual (upload de PDF) + conector Mapa Cultural PE.
- Imagens: **WebP/AVIF** com `sharp` desde o início (JXL descartado: suporte de navegador).
- Design system: tokens em Tailwind v4 + atoms→organisms, começando pelo card do feed.

- Escopo V1 (D17): fases 1–3 do ArtistRank + resumo IA. Nomes em inglês (D8). Onboarding mínimo (D18). Artistas e organizações (D19).

- D20–D22: edital de organização passa por extração + confirmação; organização só vê artista que se candidata; tudo em TS, lançamento gratuito.

- D23–D25: candidatura dentro do app; taxonomia derivada pela IA e revisada pelo usuário; golden set depois.
- WBS reescrito (W1b, W3–W7, W6b, W-UI) em `plano.md` §5.

- Roadmap por ondas O1–O5 (`plano.md` §6.0): design → no ar → editais reais → ArtistRank → semântica e organizações. Onda 1 = articulação de design (sistema, mapa de telas, protótipo).

**Não entra:**
- Implementação de qualquer item acima; revisão de projeto por IA; scrapers além do Mapa Cultural.

## Impacto técnico
- **Banco:** migrar migrations SQL (`db/`) para Prisma; modelo em `docs/db/`.
- **Docs:** `plano.md` D2/D5/D6, WBS W1/W2/W5; ADRs novos.

## Critérios de aceite

<!-- kit:criterios -->
- [x] `plano.md` reflete as decisões (nenhum ADR novo as contradiz: ainda não há ADR para elas)
- [x] ADRs de auth (Better Auth), dados (Prisma), LLM (DeepSeek) e imagens (WebP/AVIF) **viraram tarefa da O2/O3**, escritos junto de cada implementação; não são entregues aqui (critério reescrito de "escritos" para "listados")
- [x] Decisões em aberto abaixo resolvidas ou viradas tarefa/pendência com dono
<!-- /kit:criterios -->

## Dívida / não exercitado
- Gate parcial: só `typecheck` e `lint` existem neste repo (sem `format:check`, testes, cobertura, Sonar). `tsc` sai com erro **só** por causa do clone `./editaliza_prot/` (84 erros nele, 0 no código do repo); lint passou.
- O protótipo foi lido pelo clone local, sem checar o histórico no GitHub (SSH falhou, HTTPS recusado).
- Custo e limites do DeepSeek para PDFs longos não medidos; avaliar no golden set.
- Quota de 1 GB do Supabase Storage free não dimensionada contra o corpus de PDFs.

## Decisões em aberto
- Perguntas de 2026-11-16 sobre ArtistRank e telas: ver o resumo do `/feature` e as respostas registradas aqui.
- Ordem das telas dentro da O1: sai do mapa de telas, a aprovar.
- Limiares não calibrados da spec (pesos, α, limiar de poder discriminante): ficam configuráveis até haver dado.
- O que fazer com os 4 branches empilhados (W0, T1.1, dep-01, infra-01) que ainda esperam PR?
- Governança do termo `performance` (conceito transversal × dois termos): pendente por decisão da spec v1.2; implementação usa um id por ramo até lá.
