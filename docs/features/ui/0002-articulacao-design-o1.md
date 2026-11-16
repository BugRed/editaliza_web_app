# Front do editaliza_prot e galeria rica (O1)

**Status:** em-desenvolvimento
**Responsabilidade:** ui
**Branch:** feature/ui-02/articulacao-design-o1
**Autor:** BugRed · **Data:** 2026-11-16

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica: sem Prisma; o schema é SQL (`db/migrations/0002_colunas_do_front.sql`, ver Impacto técnico)
- [x] service — `src/app/services/auth-service.ts` veio do protótipo; nenhuma regra de negócio nova nesta feature
- [x] controller — não se aplica
- [x] route — rotas de API do protótipo e `PATCH /api/artists/[id]` ampliado; `middleware.ts` é o do protótipo
- [x] ui — front do `editaliza_prot` e as telas e componentes acrescentados
- [x] teste — 78 testes de comportamento (Vitest + Testing Library); rodam também em Docker, sem rede
- [x] doc — CHANGELOG, ADR 0019, `docs/db`, `docs/ops`, `docs/ui`, dívida
<!-- /kit:camadas -->

**Próximo passo:** usuário confere no navegador (`yarn dev:db`, `yarn dev:db:setup`, `yarn dev`) o celular e os
fluxos que não foram exercitados, e aceita ou revisa o [ADR 0019](../../adr/0019-artistrank-mostra-barras-por-fator-e-confianca-a-parte.md);
depois push e PR (do usuário). A O2 começa por restaurar as correções de segurança que o backend do protótipo reverteu.

## Problema / motivação
A O1 do roadmap (`plano.md` §6.0) fecha o design antes de qualquer tela ir ao ar. O protótipo `editaliza_prot`
é o guia: a primeira tentativa aqui o **adaptou** (tokens e componentes próprios) em vez de copiá-lo, e foi
descartada. O `src` do protótipo foi trazido inteiro e é o front vigente; o banco precisou acompanhá-lo, e o
usuário pediu melhorias de galeria, mídia, selos, anúncios e do ranking sobre ele.

## Escopo
**Entra:**
- Front do `editaliza_prot` exato (login, cadastro, feed, salvos, perfil, configurações, publicar edital).
- Banco compatível com o front: migration `0002`, seed a partir das tabelas do protótipo, banco local em Docker.
- Obras expressivas (tipo, técnica, dimensões, texto, temas), vídeo e áudio tocáveis, reordenação na galeria.
- Perfil do proponente com os editais publicados e página pública da empresa (`/empresas/[id]`), alcançada pelo post.
- Selos que levam ao edital e à empresa (`/perfil/[id]/selos/[badgeId]`).
- Publicidade (menu lateral, direita fixa ao rolar, timeline) e coluna da direita com lista recursiva de 4 em 4.
- Barras do ranking no resumo do edital, com dropdown por grupo (ADR 0019).
- yarn como único gerenciador.

**Não entra (fora de escopo):**
- Better Auth, Prisma, deploy, RLS (O2); upload de arquivos e rede de anúncios real (O3).
- Telas ainda inexistentes do plano de ondas (admin, onboarding multi-etapas, trajetória, candidatos).
- O motor ArtistRank de oito fatores (W5): as barras seguem o que o motor do protótipo devolve.

## Restrição de ambiente
Qualquer teste ou verificação roda **interno, em Docker**: nada de serviço externo nem banco no host. `yarn test:docker`
constrói `Dockerfile.test` e roda o Vitest com `network_mode: none`; `yarn test` roda no host só para iterar. O
banco de desenvolvimento é o Postgres local de `docker-compose.dev.yml` (`docs/ops/ambiente.md`); o Supabase do
`.env` não existe mais (tenant não encontrado no pooler), e o `.env.local` criado aqui o sobrepõe.

## Comportamento / fluxos
- **Feed:** o post abre o resumo do edital pela imagem, pelo título ou por "Inscrever-se"; o card inteiro não é
  link. O nome e o avatar da empresa levam à página dela.
- **Galeria do artista:** abas Todas, Imagens, Vídeos e Áudios; cada obra mostra técnica, dimensões, texto e temas;
  vídeo e áudio tocam no diálogo. A ordem é a do perfil e se altera em Configurações (subir e descer).
- **Resumo do edital:** barras por fator em dois grupos, cada um com dropdown fechado por padrão.
- **Selo:** abre uma página com o edital e a empresa que o concedeu.

## Impacto técnico
- **Banco:** `db/migrations/0002_colunas_do_front.sql` ([modelo](../../db/modelo-de-dados.md)); `artist_data.password`
  deixa de ser `NOT NULL`; o seed carrega as colunas jsonb novas.
- **API:** `PATCH /api/artists/[id]` valida tipo, técnica, dimensões, temas e `mediaUrl` das obras e os campos de selo.
- **UI:** `src/app/**` (front do protótipo e `components/{profile,ads,rank,shell}`), `src/shared/lib/{media,works,reorder,rank-view,edital-owner}.ts`.

## Regras de negócio relacionadas
Nenhuma regra nova. O ranking segue o motor do protótipo; a apresentação é decidida no
[ADR 0019](../../adr/0019-artistrank-mostra-barras-por-fator-e-confianca-a-parte.md) (proposto).

## Critérios de aceite

<!-- kit:criterios -->
- [x] Front do `editaliza_prot` no repo e rodando contra o banco local (login, feed, perfil, configurações, salvos e publicar edital respondem sem erro)
- [x] Obras com tipo, técnica, dimensões, texto e temas; vídeo e áudio; reordenação refletida na galeria
- [x] Perfil do proponente lista os editais publicados; empresa e selo acessíveis a partir do post e do perfil
- [x] Publicidade nas três posições pedidas e barras do ranking com dropdowns fechados por padrão
- [x] `yarn typecheck`, `yarn lint` e `yarn test` passando (78 testes), também em Docker
- [ ] Usuário confere no navegador, inclusive celular, e aceita o ADR 0019
<!-- /kit:criterios -->

## Dívida / não exercitado
Resumo; a lista viva está em [`docs/divida.md`](../../divida.md).
- **Segurança herdada do protótipo** (senha em texto puro no cadastro, senhas fixas no `client.ts`, `?artistId=` do
  ranking): o `src` trazido reverte parte das correções da W0 e da infra-01.
- **Não exercitado:** celular, vídeo e áudio no navegador real, embed de YouTube e Vimeo, `yarn build`, Supabase real.
- **Decidido na hora:** limites de cor 40 e 70; dropdowns fechados; 4 perfis por página na direita; um anúncio a cada
  3 posts; anúncio do menu lateral ocupa a altura livre; "Tipo de mídia" como campo novo; imagens originais (7,3 MB)
  em `public/images`; `yarn.lock` resolvido de novo.
- **Front sem tokens:** hex literal nas classes, como no protótipo.

## Decisões em aberto
- Aceitar o ADR 0019 (barras, faixas de cor e dropdowns) ou revisá-lo.
- Restaurar as correções de segurança antes da O2 ou deixá-las para o Better Auth.
