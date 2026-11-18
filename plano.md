# Plano — Editaliza

> Plano vivo de evolução da plataforma: fonte única até virar código e ADR.
> Atualizado em 2026-11-16 · corpus de editais reais em `docs/editais-exemplo/`.
>
> **Replanejamento de 2026-11-16:** o motor de recomendação passa a ser o **ArtistRank**, especificado em
> [`docs/ops/ArtistRank_decisoes_e_especificacao_completa_v1.2_conferencia.md`](docs/ops/ArtistRank_decisoes_e_especificacao_completa_v1.2_conferencia.md)
> (daqui em diante "spec ArtistRank").
>
> **Protótipo de frontend:** [`github.com/BugRed/editaliza_prot`](https://github.com/BugRed/editaliza_prot) (`git@github.com:BugRed/editaliza_prot.git`), branch `main`. Inventário e estratégia de aproveitamento em §11. Onde este plano e a spec divergem sobre o motor, vale a spec,
> exceto nas decisões D2 e D12–D16 abaixo, que são do usuário. Ver §7 e §10.

## 1. Visão

Unir em um só lugar os editais culturais de Recife e de Pernambuco publicados em domínio
público, extrair deles requisitos estruturados (tags, cotas, critérios pontuados) e
entregar a cada usuário um **score de match explicável** entre seu perfil/projetos e cada
edital. O Editaliza caminhará para ser rede social (curtir, compartilhar, comentar), mas
**sinais sociais nunca entram no cálculo do match**. **V1:** feed ordenado por compatibilidade (ArtistRank) + resumo do edital em linguagem simples por IA.
Pós-V1: revisão do projeto do artista por IA e premium.

## 2. Estado atual (ponto de partida)

O que existe e funciona hoje:

- Next.js 15 (App Router) + Supabase (Postgres), deploy não configurado.
- 7 rotas de API **somente GET**, lendo direto as tabelas com o cliente anon.
- Login e-mail/senha com **token base64 sem assinatura**; `jsonwebtoken` instalado mas
  não usado; `/cadastro` não persiste (só `console.log`); `/login/google` e
  `/login/microsoft` são páginas falsas (mesmo formulário de e-mail/senha).
- Feed com cards (`BodyCardFeed` + `PercentCardFeed`) com "% Match" **fixado em 30**;
  três cópias da mesma `FeedPage` (`(main)/page.tsx`, `feed/page.tsx`, `teste/page.tsx`).
- Modelo de dados portado de TypeORM (classes `Artist`/`Proposer`/`Edital`/`TagData`),
  tabelas `*_data` no Supabase sem migration no repo, mocks em `mock/*.csv` carregados na
  mão.
- Testes: só dois scripts Selenium em Python; nenhum teste de unidade/API.

Problemas graves conhecidos (estado após a W0, branch `bugfix/auth-01`):

1. ~~`GET /api/users` devolve `select('*')` com a coluna `password` em texto puro~~
   **Fechado na W0**: selects explícitos sem `password`/`cpf` em todas as rotas que leem
   `user_data`/`artist_data`/`proposer_data`; `/api` exige sessão (401 sem cookie,
   exceto `/api/health`). Detalhe descoberto na W0: o `middleware.ts` na raiz **nunca
   rodou** (Next 15 com app em `src/` só lê `src/middleware.ts`) — movido, e as páginas
   passaram a exigir sessão de verdade.
2. Senhas armazenadas em texto puro; sessão falsificável — **exposição fechada na W0**;
   hash e token assinado só com Better Auth (T1.2).
3. Env sem validação; cliente Supabase anon exposto no browser lendo tabelas inteiras —
   **env validada com zod na W0** (`src/shared/lib/env.ts`, falha no boot); anon no
   browser segue até a T1.3.
4. Sem CI do app, sem migrations, sem deploy — **CI criado na W0** (lint+typecheck+build
   em PR e push); migrations T1.1, deploy T1.4.

## 3. Decisões fechadas

| # | Decisão | Detalhe |
|---|---|---|
| D1 | Escopo da coleta | Cultura: Mapa Cultural PE (API pública) + culturarecife.com.br + Funcultura/SECULT-PE + Diário Oficial do Recife |
| D2 | Autenticação | **Better Auth** sobre o Postgres do Supabase (sem lock-in de vendor). E-mail/senha + OAuth Google e Microsoft reais |
| D3 | Motor de match | **ArtistRank**, híbrido (`hybrid`): elegibilidade formal (`PASS/FAIL/UNKNOWN/NOT_APPLICABLE`) como etapa anterior + 8 fatores ponderados + embeddings. Ranking determinístico em TypeScript, versionado, explicável; **IA nunca decide ranking nem elegibilidade**. Detalhe em §7 e na spec ArtistRank |
| D4 | Dados do usuário | Perfil rico (autodeclarações LGPD-sensíveis, território, área, PF/MEI/PJ, tempo de atuação, formação) + projetos enviados (PDF/texto/links) |
| D5 | IA e premium | **V1:** resumo de edital em linguagem simples. **Pós-V1:** revisão do projeto do artista, pagamentos e assinaturas |
| D6 | Provedor de IA | Plugável (`EmbeddingProvider`, `LLMProvider`), escolha por env. **LLM: DeepSeek** (Flash na rotina, Pro nos casos ambíguos; nomes e preços a conferir na API). **Embeddings: Voyage** (`voyage-4-lite` inicial), sujeito ao A/B TF-IDF × Voyage da spec §27.9 |
| D7 | Coleta | Cron diário; dedup por (fonte, id da fonte, hash do conteúdo) |
| D8 | Domínio | `Artist`/`Proposer` → **Agente Cultural** (PF/MEI) e **Organização**; executa na refactoração final (W7), tabelas novas já nascem no nome certo. **Decidido em 2026-11-16:** schema e código em **inglês**, como a spec ArtistRank (`artists`, `artworks`, `opportunities`, `recommendations`); UI e docs em português |
| D9 | Arquitetura | Código novo nasce em `src/server` (`api → controller → service`); legado só migra na W7 |
| D10 | Sinais sociais fora do match | Curtir/compartilhar/comentar são UI; score é função apenas de perfil + projeto + edital; social também não calibra |
| D11 | Trabalho pesado fora da request | Parse de PDF/OCR, extração LLM e embeddings rodam em job agendado (worker), nunca no ciclo da requisição |
| D12 | Stack de dados | **Prisma** sobre o Postgres do Supabase (substitui o runner SQL puro `db/migrate.mjs`); pgvector via `Unsupported(\"vector\")` + SQL cru onde o Prisma não alcança |
| D13 | Auth (reafirma D2) | **Better Auth**, não Supabase Auth, mesmo a spec ArtistRank listando Supabase Auth: o usuário quer ficar livre para migrar de provedor |
| D14 | Objeto de recomendação | `both`: artistas e obras, calculados separadamente e combinados (`0,35·artista + 0,65·portfólio`, configurável por modalidade) |
| D15 | Imagens | WebP/AVIF com `sharp` no upload; JXL descartado (suporte de navegador). Arquivos no Supabase Storage |
| D16 | Design system | **Sol & Mar**, tokens em `globals.css` (branch `feature/ui-01`); só tema claro por ora |
| D17 | Escopo da V1 (ciclo O1–O5, ver §6.0) | Fases 1+2+3 da spec ArtistRank (cadastro profundo e taxonomia, motor determinístico, embeddings Voyage + busca semântica) **+ resumo do edital por IA**. Pipeline LLM completo com revisão humana (fase 4) entra só no que o resumo e o admin exigirem; calibração (fase 5) é pós-V1. O A/B TF-IDF × Voyage (spec §27.9) vira tarefa antes de fixar o modelo |
| D18 | Onboarding | **Mínimo + enriquecimento progressivo**: cadastro curto (linguagens, cidade, interesses) já gera feed; trajetória, obras e o resto vêm depois. Campo ausente é desconhecido (nota 0,5); cobertura aparece no card |
| D19 | Quem usa | **Artistas e organizações.** Artista vê editais e obras ranqueados; organização publica editais e vê artistas compatíveis. Papéis: `artist`, `organization`, `admin`. Visibilidade do perfil do artista para organizações exige regra de privacidade (aberta) |
| D20 | Edital publicado por organização | Pipeline da spec §12.6: PDF → texto → DeepSeek (JSON) → Zod → verificação de evidência → **confirmação humana** (organização no edital dela; admin no edital importado) → banco. Cada requisito guarda documento, página, trecho, versão e estado de validação (spec §7.7); array vazio = "não informado", nunca proibição (§7.6) |
| D21 | Visibilidade do artista para a organização | **Só quando o artista se candidata** ao edital dela. Sem busca ativa de artistas, sem acesso a autodeclarações ou documentos fora da candidatura. Implica **inscrição dentro do app** (a definir) |
| D22 | Infra da V1 | **Tudo TypeScript, sem LangGraph nem worker Python.** Jobs agendados chamando endpoints protegidos, fila no Postgres. **Lançamento gratuito**, sem monetização: Vercel Hobby serve; migrar para Pro **antes** de qualquer cobrança ou divulgação comercial |
| D23 | Candidatura | **Inscrição dentro do app**: o artista escolhe obra(s), anexa documentos e envia; a organização vê o dossiê (score, fatores, evidências) só dos candidatos dela. Exige estados de inscrição, armazenamento de documentos e retenção definida |
| D24 | Taxonomia | Vocabulário inicial **derivado pela IA da spec (§3.2–§3.5) e do corpus**, entregue como planilha para revisão do usuário antes de virar seed. **"performance" aparece em dois ramos (artes visuais e artes cênicas) e a spec v1.2 manda NÃO resolver sozinho:** cada ocorrência recebe identificador estável próprio, sem deduplicar pelo rótulo, e a decisão (conceito transversal × termos distintos) fica pendente do usuário. Governança (sinônimos, hierarquia, versionamento) em ADR |
| D25 | Validação do motor | Golden set **montado depois**. Desde 2026-11-17 o repo tem o benchmark real de 14 editais em `docs/search/` (spec §29, só dados e gerador: **sem o motor**). O pacote do benchmark sintético da spec (`verify_v11.py`, datasets) **continua fora do repo e não foi anexado**; a spec mesma não afirma que esteja disponível, e a conferência de 38 verificações é só relato do responsável. O benchmark usa TF-IDF, não Voyage, e dados em sua maioria hipotéticos. Até lá, os casos de §27.5 da spec (Ana × Dança = 45,0; Beto × Malakoff = 77,1; Bituca × FIC bloqueado) viram testes de regressão reconstruídos |

## 4. Arquitetura alvo (resumo)

```
Fontes (API/scraper) → Coletor (cron/worker) → Normalizador → Edital (Postgres + PDF bruto)
                                             ↓
                          Extrator (LLM plugável) → Requisitos + Critérios + Tags
                                             ↓
Perfil (Better Auth) + Projetos (upload) → Motor de Match → match_result → Feed/API
```

- Banco: Postgres do Supabase com **pgvector**; auth nas mãos do Better Auth (tabelas
  próprias, conexão direta via pooler).
- Migrations **SQL versionadas no repo** (baseline = schema atual do Supabase exportado).
- Env validada com zod em `src/shared/lib/env.ts` (falha no boot).
- Fluxo obrigatório: `app/api → controller → service`; UI nunca chama service direto.

## 5. Trabalho detalhado (WBS)

Ordenado **do mais simples e independente para o mais complexo e dependente**. Cada onda
só depende de ondas anteriores; dentro da onda, tarefas são paralelizáveis entre si.

### W0 — Correções urgentes e higiene (independente, dias)

| T | O quê | Pronto quando |
|---|---|---|
| T0.1 | `src/shared/lib/env.ts` com zod: validar todas as env no boot (`NEXT_PUBLIC_SUPABASE_*`, `DATABASE_URL`, `BETTER_AUTH_*`) | App falha no boot com env faltando; `.env.example` commitado |
| T0.2 | Fechar o vazamento de senizes: `/api/*` para de selecionar `password` (todas as rotas), corrige bug `tagError`/`commentsError` em `/api/data`, e matcher do middleware passa a exigir sessão em `/api` (exceto health) | `curl /api/users` sem sessão → 401; nenhuma resposta contém `password` |
| T0.3 | CI do app: GitHub Actions com `lint` + `typecheck` (tsc --noEmit) + `build` em PR e push | PR quebra o build → check vermelho |

### W1 — Fundação: schema, auth, deploy (dep: W0)

| T | O quê | Pronto quando |
|---|---|---|
| T1.1 | Migrations versionadas: pasta `db/migrations/*.sql` + runner (`db/migrate.mjs`); baseline exportado do schema atual do Supabase; seed dos mocks vira seed script | `npm run db:migrate` recria o schema do zero; schema não vive mais só no console |
| T1.2 | **Better Auth**: adapter Postgres (pooler do Supabase em modo transação), e-mail/senha com hash, OAuth Google e Microsoft reais, sessão em cookie httpOnly, papel `admin`. Reescrever `useAuth`/`ProtectedRoute`/middleware; conectar cadastro ao endpoint real; **remover as páginas falsas** `/login/google` e `/login/microsoft` | Criar conta → logar → OAuth Google → ver feed, ponta a ponta; token base64 destruído |
| T1.3 | Acesso a dados server-side: rotas passam a ler via service role (só servidor), RLS/anon perde leitura das tabelas de domínio; `supabase-js` anon sai do bundle cliente | Browser não consegue ler tabelas direto; todas as respostas passam pelas rotas autenticadas |
| T1.4 | Deploy inicial (Vercel): envs de produção, OAuth redirect URIs, domínio de preview estável para testes de OAuth e cron | App rodando em URL pública com login funcionando |

### W2 — Ingestão de editais (dep: T1.1; paralela à W1 depois disso)

| T | O quê | Pronto quando |
|---|---|---|
| T2.1 | Conector **Mapa Cultural PE**: `/api/opportunity/find` com paginação, upsert dedup por `(source, external_id)`, guardar JSON bruto + linha normalizada; backfill do histórico (editais encerrados inclusos) | ≥100 editais reais no banco, idempotente (rodar 2× não duplica) |
| T2.2 | Anexos: baixar PDFs das oportunidades para o Storage; extração de texto com parser JS (ex. `pdf-parse`); PDF sem texto marcado `precisa_ocr` (OCR é fallback futuro) | Todo edital ativo tem texto extraído ou flag `precisa_ocr` |
| T2.3 | Normalização com testes: datas em TZ **America/Recife**, derivação de status (aberto/encerrado por `registrationFrom/To`), parse de moeda ("R$ 20.000,00") e faixas de valor | Suite Vitest cobre os formatos reais vistos nas duas fontes |
| T2.4 | Conector **Culturarecife** (spike primeiro): site ASP legado com redirect JS → Playwright headless mapeando `/public/documentos/edital_home_*`; alternativa estruturada: Diário Oficial do Recife. Decidir por ADR após o spike | ADR escolhendo a rota municipal; editais municipais entrando no mesmo pipeline |
| T2.5 | (monitoramento semanal de novos editais do Recife, spec §24: só itens verificados em fonte oficial; coleta incompleta nunca vira "nada de novo") Cron diário: GitHub Actions agendado chamando endpoint admin protegido por secret; alerta quando coleta volta vazia (fonte mudou) | Coleta roda 7 dias seguidos sem intervenção; coleta vazia notifica |
| T2.6 | UI consome dado real: feed e página de detalhe do edital lendo o banco (fonte, datas, status, link oficial, PDF) | Mocks saem do fluxo de leitura (ficam só como seed) |

### W1b — Migração para Prisma e papéis (dep: T1.1; antes de qualquer tabela do ArtistRank)

| T | O quê | Pronto quando |
|---|---|---|
| T1.5 | Prisma sobre o Postgres do Supabase: schema modular em `prisma/schema/`, migration baseline equivalente ao `db/migrations/0001_baseline.sql`, seed por domínio; `db/migrate.mjs` aposentado | `prisma migrate` recria o schema do zero; mocks viram seeder |
| T1.6 | Papéis `artist`, `organization`, `admin` no Better Auth e guardas no `proxy.ts` | Cada rota exige o papel certo; teste de acesso negado |

### W3 — Taxonomia e estruturação de editais (dep: W1b, W2)

| T | O quê | Pronto quando |
|---|---|---|
| T3.1 | `taxonomy_terms` + relações (hierarquia, sinônimos, versão); vocabulário inicial (D24) revisado pelo usuário e carregado como seed | Planilha aprovada; 100% das linguagens do corpus mapeadas; "performance" com um id por ramo e a decisão de governança registrada como pendente |
| T3.2 | Tabelas do edital (inclui enum de tipo de oportunidade): `opportunities`, `opportunity_requirements` (com `mandatory`, papel CORE/SUPPORT), `opportunity_criteria`, `opportunity_evidence` (documento, página, trecho, versão, estado de validação) | Migration aplicada; array vazio = "não informado" |
| T3.3 | Pipeline de extração (D20): `LLMProvider` DeepSeek, saída JSON, validação Zod com repair, verificação de evidência, estados `pendente/confirmado` | Extração do FRTN bate com a leitura manual |
| T3.4 | Confirmação humana: organização confirma o edital dela; admin confirma o importado; item não confirmado é invisível ao ranking | Itens `UNKNOWN`/ambíguos listados com evidência |
| T3.5 | Resumo do edital em linguagem simples (V1), gerado pós-confirmação, com link para o trecho oficial | Todo edital confirmado tem resumo; aviso de "interpretação por IA" |

### W4 — Perfil, obras e trajetória (dep: T1.6 + T3.1; paralela à W3)

| T | O quê | Pronto quando |
|---|---|---|
| T4.1 | Onboarding mínimo (D18): linguagens, cidade, interesses; gera feed com cobertura baixa visível | Artista novo vê feed em poucos minutos |
| T4.2 | `artists`, `artist_terms`: identidade, linguagens, técnicas, temas, posicionamento (spec §3); autodeclaração só por declaração ou evidência, nunca inferida | Campo ausente = desconhecido |
| T4.3 | `experiences`: trajetória com categorias, estágios incluídos, estado de comprovação (spec §4) | Pontuação de trajetória contextual, não contagem |
| T4.4 | `artworks` + `artwork_terms` + mídia (WebP/AVIF com `sharp`, D15) + necessidades de montagem (spec §5) | Obra avaliada individualmente |
| T4.5 | Intenção e disponibilidade (spec §6) | Alimenta viabilidade |
| T4.6 | LGPD: consentimento, exportar e excluir conta (inclui vetores derivados) | Exclusão remove dados sensíveis e embeddings |

### W5 — ArtistRank v1: motor determinístico (dep: W3 + W4)

| T | O quê | Pronto quando |
|---|---|---|
| T5.1 | Elegibilidade `PASS/FAIL/UNKNOWN/NOT_APPLICABLE` como função pura | Casos eliminatórios cobertos; arte alta não compensa `FAIL` |
| T5.2 | Oito fatores e pesos versionados em configuração; nota neutra 0,5 sem renormalizar; cobertura calculada (motor v4) | Mesma entrada, mesma nota |
| T5.3 | Teto de 45 aplicado **depois** de combinar artista e portfólio (nunca só no score do artista); `FAIL` de requisito artístico obrigatório explícito ativa, `UNKNOWN` não; CORE/SUPPORT; combinação por modalidade, α configurável | Ana × Dança: `R_artista` 45,0 e `R_portfólio` 46,7 combinam em 46,1 e o final é 45,0 |
| T5.4 | Confiança C separada, sem efeito no score | Teste prova que C não altera ranking |
| T5.5 | `recommendations` + `recommendation_factors` persistindo versão, pesos, entradas, evidências | Recalcular não duplica; mudança de entrada invalida |
| T5.6 | Testes de regressão dos casos §27.5 reconstruídos (D25) e dos 14 editais reais de `docs/search/` (spec §29.5) | Rodam no CI |

### W6 — Embeddings e feed (dep: W5)

| T | O quê | Pronto quando |
|---|---|---|
| T6.1 | pgvector no Prisma (`Unsupported("vector")` + SQL cru) e tabela `embeddings` com `content_hash`; `EmbeddingProvider` | Texto igual não regera vetor |
| T6.2 | A/B TF-IDF × Voyage (`voyage-4-lite`) com os mesmos casos; mede ranking, latência e custo | Decisão registrada em ADR antes de fixar o modelo |
| T6.3 | Afinidade semântica por dimensão (conceito, posicionamento, obra) combinada à taxonomia | Fatores 2 e 4 usam a similaridade; golden set não piora |
| T6.4 | Pré-computo do feed por artista; recomputa quando perfil, obra ou edital mudam | Feed abre sem calcular na request |
| T6.5 | Poder discriminante por edital e estado "poucas oportunidades compatíveis" (spec §9.7, §9.9) | Aviso exibido; limiar marcado como não calibrado |

### W6b — Candidatura e organizações (dep: W5, T1.6)

| T | O quê | Pronto quando |
|---|---|---|
| T6b.1 | Inscrição: artista escolhe obra(s) e anexa documentos; estados da inscrição | Inscrição criada, editável até o prazo |
| T6b.2 | Área da organização: publicar edital (D20), ver só candidatos dela, dossiê com score, fatores e evidências | Organização não enxerga artista que não se candidatou (teste) |
| T6b.3 | Feedback com motivo (spec §20) e "por quê" da nota | Rejeição registra motivo; nota exibe nota antes do teto |
| T6b.4 | Projeção sobre critérios oficiais (spec §9.8), só quando mapeável | Rotulada como projeção; "indisponível" se faltar critério |

### W-UI — Redesign de todas as telas (dep: design system Sol & Mar; ordem a definir)

Telas e dependências em §10. **A ordem do redesign está em espera por decisão do usuário** e não será
fixada aqui. Cada tela nasce como organismo em `src/shared/components/` (atoms → molecules → organisms).

### Pós-V1 — Recomendação de projeto futuro e revisão do projeto (dep: W5, W6b)

| T | O quê | Pronto quando |
|---|---|---|
| TP.1 | Nível 3 do chat: para o par artista × edital, indicar a série mais aderente, critérios atendidos, o que desenvolver, documentos faltantes e critérios a cuidar, sem descaracterizar o artista | Sugestão cita evidência do edital e do perfil |
| TP.2 | Revisão do texto do projeto contra o edital: o que faltou e o que errou (visão original do produto) | Cada apontamento aponta o trecho do edital |
| TP.3 | Fase 5 da spec: calibração com resultados reais e avaliação por especialistas | Só com dados homologados |

### W7 — Endurecimento (dep: todas)

| T | O quê | Pronto quando |
|---|---|---|
| T7.1 | Unificar as três `FeedPage`; remover código morto | Uma só página de feed |
| T7.2 | Lint do kit no CI e cobertura mínima nos services críticos (auth, normalizadores, motor) | `yarn lint` passa |
| T7.3 | Revisão de segurança final: headers, rate limit, URLs assinadas, OWASP básico | Checklist aprovado |
| T7.4 | Antes de monetizar: Vercel Pro, termos de uso, política de privacidade e retenção | Documentos publicados |

## 6. Roadmap

### 6.0 Roadmap vigente — ondas de entrega (decidido em 2026-11-16, opção A)

Princípio: **disponibilidade primeiro**. Tudo que é preciso para o app ficar no ar, seguro e bonito vem antes;
ArtistRank e IA ficam nas últimas ondas. As ondas O1–O5 abaixo **ordenam** as ondas técnicas W0–W7 e W-UI
da §5, que continuam sendo o detalhamento das tarefas.

| Onda | Nome | Entrega | Tarefas (§5) | Pronto quando |
|---|---|---|---|---|
| **O1** | **Articulação de design** (entregue em 2026-11-16) | Design system fechado (tokens, atoms, molecules, claro e escuro), **mapa e fluxo de todas as telas**, protótipo navegável aprovado pelo usuário; código só de atoms e molecules em `src/shared/components/` | W-UI (parte), D16, §10, §11 | Usuário aprova o protótipo; `/feed` e login usam só os tokens; nenhuma cor/raio literal fora de `globals.css` |
| **O2** | **No ar** | Merge das 4 branches empilhadas, Prisma, Better Auth com papéis, env validada, deploy Vercel + Supabase, CI, headers, rate limit, LGPD mínima (consentimento, exportar e excluir); **marco final: alinhar o cadastro com o usuário** (hoje tudo numa tela só; decidir etapas, campos obrigatórios e o que vira opcional, já com o banco e o Better Auth reais) | W0, W1, W1b, T4.6, T7.2–T7.3 | URL pública com cadastro, login e feed funcionando; sem senha em texto puro; checklist de segurança aprovado; **cadastro alinhado com o usuário** (marco que fecha a O2, depois de o cadastro rodar no banco real) |
| **O3** | **Editais reais** | Admin cadastra edital (PDF + formulário), conector Mapa Cultural PE, feed por data, filtro e tags, detalhe do edital e **resumo IA em linguagem simples** | W2, T3.2–T3.5 (sem ranking) | ≥100 editais reais; resumo com link ao trecho oficial; coleta idempotente |
| **O4** | **ArtistRank v1** (motor puro em paralelo à O2) | **Em paralelo à O2:** motor determinístico como funções puras, sem banco (elegibilidade, oito fatores e pesos versionados, teto de 45, confiança C separada, casos de regressão da §27.5). **Depois da O3:** taxonomia, perfil profundo, obras, trajetória, persistência das recomendações e o "por quê" | W5 (T5.1–T5.4, T5.6) em paralelo à O2; W3 (T3.1), W4 e T5.5 depois | Casos de regressão da spec §27.5 passam no CI (parte pura); feed passa a ordenar por compatibilidade (parte completa) |
| **O5** | **Semântica e organizações** | Embeddings Voyage (após A/B), candidatura dentro do app, área da organização, feedback com motivo, projeção da banca; depois nível 3 e revisão do projeto | W6, W6b, Pós-V1 | Organização só vê quem se candidatou (teste); A/B registrado em ADR |

Consequências:

- **"V1 publicável" = O1 a O3.** O D17 (escopo da V1 com fases 1–3 do ArtistRank) passa a valer para **o ciclo completo O1–O5**; o primeiro lançamento (gratuito, D22) acontece ao fim da O3, com o feed ordenado por data e filtros, **sem score de compatibilidade**. A UI não exibe porcentagem enquanto o motor não existe.
- O protótipo `editaliza_prot` (§11) alimenta a O1; o motor dele não entra no ar (§11.2).
- As 4 branches empilhadas (W0, T1.1, dep-01, infra-01) são o **primeiro bloqueio da O2** e dependem do usuário (PR e merge).
- **O1 fechada em 2026-11-16** (protótipo aprovado, código no ar, modo escuro conferido, ADR 0019 aceito). Segue a O2.
- **O4 se divide em duas partes (decidido em 2026-11-16).** A parte **pura** do motor (T5.1–T5.4 e T5.6) não depende de
  banco e corre **em paralelo à O2**, em branch própria (`src/shared/lib/` e `src/server/artistrank/`), sem tocar
  `prisma/`, auth, borda ou env. Começa pela entrevista de regra de negócio. A parte **dependente de banco** (T3.1,
  W4, T5.5, feed ordenado) espera a W1b e a O3, na ordem original.
- **A UI continua sem porcentagem** até o motor existir de ponta a ponta, mesmo com a parte pura pronta.
- Ordem das telas dentro da O1: definida no mapa de telas, aprovado pelo usuário antes de portar qualquer uma.

### 6.1 Grafo técnico original (histórico)

```
W0 ─► W1 ─┬─► W2 ─► W3 ─┐
          │             ├─► W5 ─► W6 ─► W7
          └─► W4 ───────┘
              (W4 depende de T1.2 + T3.1, então começa no meio da W3)
```

| Onda | Conteúdo | Depende de | Paralelizável com |
|---|---|---|---|
| W0 | Vazamento de senhas, env, CI | — | tudo |
| W1 | Migrations, Better Auth, acesso server-side, deploy | W0 | — |
| W2 | Ingestão (Mapa Cultural PE → PDFs → cron → feed real) | T1.1 | W1 (após T1.1) |
| W1b | Prisma + papéis | T1.1 | W2 |
| W3 | Taxonomia + estruturação de editais + resumo IA | W1b, W2 | W4 |
| W4 | Perfil LGPD + projetos | T1.2, T3.1 | W3 (após T3.1) |
| W5 | Match v1 regras + golden set + UI do score | W3, W4 | — |
| W6 | Match v2 embeddings + pré-computo | W5 | — |
| W7 | Refactoração, rename de domínio, segurança final | todas | — |

Marcos de produto ao fim de cada onda:

- **Fim W1:** plataforma segura com auth real — dá pra colocar usuário de verdade.
- **Fim W2:** o Editaliza cumpre a primeira promessa: **todos os editais num lugar só**.
- **Fim W3/W4:** cada edital "entendido" (requisitos) e cada usuário "conhecido" (perfil).
- **Fim W5:** a promessa central: **nota de match explicável** no feed.
- **Fim W6:** match semântico, feed pré-computado, escala.
- **Fim W7:** código enxuto, seguro, pronto para o V2 (premium/IA).

## 7. O motor de match — spec central

> **Substituído em grande parte pela spec ArtistRank.** §7.0 resume o que vale; §7.1–7.9 abaixo
> ficam como histórico e como insumo (taxonomia de perfil §7.7 e corpus §7.9 seguem úteis), mas
> **a fórmula de §7.2 não é mais a de referência**.

### 7.0 O que vale (ArtistRank, estado normativo — spec §28)

Ordem de precedência, da mais forte para a mais fraca:

1. **Elegibilidade formal** (`PASS`/`FAIL`/`UNKNOWN`/`NOT_APPLICABLE`): `FAIL` em eliminatório bloqueia;
   `UNKNOWN` mostra "pendente"; arte alta nunca compensa eliminatório.
2. **Oito fatores** com pesos baseline: linguagem 15 · conceito 20 · técnica/suporte 10 ·
   posicionamento 15 · trajetória 10 · obra/projeto 15 · território/público 5 · viabilidade 10.
   Nota por fator em 0–1 (1; 0,75; 0,5; 0,25; 0). Pesos são hipótese de engenharia, versionados.
3. **Dado ausente = nota neutra 0,5**, sem renormalizar pesos; **cobertura** exibida à parte (motor v4).
4. **Teto de 45** no score final combinado quando um requisito artístico obrigatório está em `FAIL`
   (nunca por `UNKNOWN`); a UI mostra qual requisito, evidência e a nota antes do teto.
5. Linguagens do edital marcadas **CORE** ou **SUPPORT**, com evidência; ambíguo vai a revisão humana.
6. Score de artista, de obra e de portfólio calculados separadamente; `R_portfólio = α·melhor + (1−α)·média das melhores`
   (α não calibrado; só 0,6 foi exercitado).
7. **Confiança C** = `100·(0,35·cobertura + 0,30·evidências + 0,15·atualidade + 0,20·extração)`,
   **separada e sem efeito no score**; C baixa pede documento/revisão, nunca rebaixa nem ordena.
8. **Poder discriminante** por edital (média, desvio, amplitude); aviso de edital pouco diferenciador.
   Limiar não calibrado.
9. **Projeção sobre critérios oficiais da banca**: só quando o edital publica critérios mapeáveis;
   sempre rotulada como projeção, nunca probabilidade.
10. Persistir versão do algoritmo, pesos, entradas, evidências, cobertura e proveniência (auditoria).

Princípios que a UI e o schema herdam (spec §2): compatibilidade ≠ probabilidade; ausência ≠
incompatibilidade; toda exigência tem evidência (documento, página, trecho); distinguir declaração,
inferência e comprovação; arte periférica/popular/comunitária só por autodeclaração ou evidência do
trabalho, nunca inferida de endereço; feedback registra o **motivo**.

Sem oportunidade relevante, o feed mostra "poucas ou nenhuma oportunidade compatível" e separa as
marginais (spec §9.9). Sinais sociais seguem fora do score (D10).

**Do chat de origem do ArtistRank** (colado pelo usuário em 2026-11-16; a spec já consolida quase tudo, o que
segue é o que ela não tem ou tem só de passagem):

- **Tipos de oportunidade** viram enum em `opportunities` (a spec não os define): multilinguagem · nicho
  (hip-hop, dança, teatro, circo) · ocupação/exposição · formação · financiamento (MIC, FIC) · programação
  (carnaval, São João) · aquisição de obras · representação (conselhos). Cada tipo pesa os fatores de modo
  diferente (ocupação → viabilidade e montagem; formação → capacidade de transmitir; financiamento →
  orçamento e proponente) e muda os requisitos que o formulário da organização pede.
- **Três níveis de recomendação:** artista, obra e **projeto futuro**. O terceiro (sugerir como desenvolver
  uma proposta para o edital sem descaracterizar o artista: série mais aderente, critérios atendidos, o que
  desenvolver, documentos faltantes, critérios que merecem atenção) é **pós-V1** e é a mesma frente da
  revisão do projeto por IA da visão do produto.
- **Afinidade explícita × contextual:** explícita = o edital pede fotografia e o artista faz fotografia;
  contextual = o tema (memória, território) casa mesmo sem a técnica ser citada. A contextual é o que os
  embeddings (W6) acrescentam; a explícita sai só da taxonomia (W5).
- **Os 30 editais de Recife** (spec §22) são **base de benchmarking**, não 30 documentos analisados:
  servem de fila de coleta (W2), casos de teste e extração. Falta baixar edital completo, anexos,
  retificações e critérios de cada um.
- **O stack sugerido no chat** (NestJS, Redis + BullMQ, Python para PDFs, busca textual) **não vale**:
  prevalecem D12 (Prisma), D22 (TS, fila no Postgres, jobs agendados) e a busca do próprio Postgres.
- Para o edital OBSERVA 4 / Torre Malakoff, o exemplo de JSON do chat é o molde do formulário de edital:
  elegibilidade, requisitos artísticos (listas vazias = não informado), proposta, critérios com pontuação
  máxima (7 critérios, 26 pontos, corte 13), premiação e status.

**Dados** (spec §16): `artists`, `artworks`, `experiences`, `taxonomy_terms`, `artist_terms`,
`artwork_terms`, `opportunities`, `opportunity_requirements`, `opportunity_criteria`,
`opportunity_evidence`, `embeddings` (entidade, tipo, modelo, `content_hash`, `vector(1024)`),
`recommendations`, `recommendation_factors`, `feedback`. HNSW só quando o volume pedir.

**Pipeline de edital** (spec §12.6, §19): PDF → texto → DeepSeek (JSON) → validação Zod → verificação
de evidência → revisão humana quando preciso → banco. O LLM nunca grava requisito definitivo direto.

**Mapa spec → ondas deste plano:** Fase 1 (estrutura e taxonomia) → W3/W4 · Fase 2 (motor
determinístico) → W5 · Fase 3 (semântica) → W6 · Fase 4 (pipeline inteligente) → W3 e W2 ·
Fase 5 (feedback e calibração) → pós-V1. **LangGraph** (spec §13) fica fora da V1: pipeline em TS em
job agendado; reavaliar se a revisão humana pedir orquestração (pergunta aberta).


### 7.1 O que ele precisa ter (dependências)

1. **Requisitos estruturados do edital** — tipo (residência, tipo de proponente, cota,
   tempo de atuação, área, faixa de valor...), valor esperado, obrigatoriedade
   (`ELIMINATORIO`/`PONTUAVEL`), peso, **evidência** (trecho do edital) e confiança da
   extração. A qualidade do match é limitada pela qualidade disso.
2. **Critérios de avaliação do próprio edital** — quando o edital publica critérios com
   pesos (FRTN: 4 critérios 0–10, +4 de autodeclaração contando só uma, corte 30/44,
   desempate Recife→PE→Nordeste), o motor **espelha esses pesos** em vez dos genéricos.
3. **Perfil do usuário na mesma taxonomia** — campo a campo comparável; cada campo sabe se
   está preenchido ou ausente (ausente ≠ reprovado).
4. **Texto do projeto** — extraído do upload (texto + links de vídeo/foto), insumo da
   afinidade temática.
5. **Infra de embeddings** — pgvector; tabela versionada por modelo; chunking por seção;
   backfill ao trocar de modelo.
6. **Fórmula versionada** — função pura, determinística; pesos configuráveis; toda nota
   registra a versão que a produziu.
7. **Persistência** — `match_result` com `inputs_hash` e invalidação.
8. **Golden set** — regressão a cada mudança de fórmula.

### 7.2 Como calcula (pipeline)

```
Camada A — Elegibilidade (gates):
  para cada requisito ELIMINATORIO: ATENDIDO | FALHA | SEM_DADO
  FALHA em qualquer eliminatório → score 0, status "inelegível" + motivo + evidência
  SEM_DADO não reprova; reduz e vira pendência

Camada B — Aderência (0 a 1):
  requisitos_pontuaveis = Σ(peso_i × resultado_i) / Σ(peso_i)
      SEM_DADO conta 0 (conservador) e entra na lista de pendências
  afinidade = cosseno(emb_projeto, emb_edital) normalizado p/ [0,1]      [v2]
  aderencia = 0.6 × afinidade + 0.4 × requisitos_pontuaveis              [v2]
            | requisitos_pontuaveis                                      [v1]
  Quando o edital publica pesos próprios (criterio_avaliacao), eles substituem os genéricos.

  fator_completude = fração do perfil relevante ao edital preenchida
  score = round(100 × aderencia × (0.5 + 0.5 × fator_completude))
```

- Pesos e a razão 60/40 são configuração versionada, não constante mágica.
- Prazo não entra no score: edital encerrando em <7 dias vira badge de urgência.
- **Sinais sociais não entram** (D10): score é função de perfil + projeto + edital.

### 7.3 O que ele entrega

1. Nota 0–100 no card, com cor por faixa, e feed ordenado "para você".
2. **"Por quê" da nota** — cada critério com resultado, peso, contribuição e o trecho do
   edital que fundamenta.
3. **Pendências** — campos do perfil que aquele edital avalia e estão faltando.
4. **Inelegibilidade explícita** — "conforme nossa leitura do item X" + link oficial.
5. **Match por projeto** — cada projeto com seus top editais.
6. **Filtro no feed** — por área, cota compatível, status, prazo.
7. Insumos agregados (V2): requisitos que mais rejeitam, editais mais aderidos.

### 7.4 O que ele NÃO entrega (limites honestos)

- **Não é probabilidade de aprovação** até haver calibração com histórico (V2). É
  aderência a requisitos + afinidade temática; qualidade artística (jurados) fica fora.
- **Extração pode errar** — toda afirmação vem com evidência e caminho de correção.
- **Dado ausente nunca é assumido** — o motor não infere minoria, renda ou território.
- **Viés de modelo** — embeddings podem render pior em PT-BR periférico; avaliar no
  golden set antes de fechar o provedor (D6).

### 7.5 Avaliação contínua

- Agora: golden set v0 (30+ casos) como regressão no CI.
- Já há dados reais: 14 editais e 26 ganhadores em `docs/search/`; o que provam e o que não provam está na
  spec §29 (circularidade da linguagem, pool sintético). Não use o MRR como meta de produto.
- V2: calibração sobre aprovados (dataset `multi_result` é o molde: características →
  média/situação), convertendo aderência em probabilidade.
- Sempre: feedback próprio declarado ("vou me inscrever" / "fui aprovado(a)") — nunca
  interações sociais (D10).

### 7.6 Tabelas novas (esqueleto)

```
requisito          (edital_id, tipo, valor_esperado jsonb, obrigatoriedade, peso,
                    evidencia_texto, confianca, revisado_por)
criterio_avaliacao (edital_id, nome, escala_max, bonus, nota_corte, ordem_desempate)
perfil             (user_id, territorio, tipo_proponente, tempo_atuacao, areas[],
                    formacao, autodeclaracoes[] — criptografada, consentimento_em)
projeto            (id, user_id, titulo, texto_extraido, pdf_url, hash, campos jsonb)
embedding          (ref_tipo, ref_id, provider, modelo, versao, vetor vector(N), texto_hash)
match_result       (user_id, projeto_id?, edital_id, score, elegibilidade, breakdown jsonb,
                    formula_versao, inputs_hash, calculado_em)
```

### 7.7 Perfil taxonômico v1 (derivado de editais reais — 2026-10-13)

Fontes: API do Mapa Cultural PE e leitura integral dos PDFs da Convocatória 25º Festival
Recife de Teatro Nacional e do Resultado Preliminar do PNAB Multilinguagens Recife
(corpus em `docs/editais-exemplo/`).

1. **Tipo de proponente** — PF · MEI · PJ sem fins · PJ com fins · coletivo sem CNPJ
   (representado por PF/MEI com Declaração de Grupo) · Ponto/Pontão de Cultura · entidade
   familiar. Para PJ, a autodeclaração que pontua é a do **representante legal**.
2. **Território** — município/sede + UF; tempo de domicílio/sede (6 meses no PNAB Recife;
   24 é comum na família Aldir Blanc); bairro; flag **residente em área periférica** (cota
   própria no PNAB Recife); mesorregião derivada do município (PNAB estadual seleciona por
   RM/Agreste/Sertão/Zona da Mata). Comprovante de endereço envelhece (≤3 meses na FRTN) →
   guardar data de coleta.
3. **Autodeclarações (LGPD sensível)** — pretos/pardos · pessoa trans · indígenas (com
   povo) · quilombolas · ciganos · ribeirinhos · povos/comunidades de terreiro e matriz
   africana · LGBTQIAPN+ · mulheres · pessoa com deficiência · baixa renda (CadÚnico).
   *Evidência: FRTN dá +4 pontos (apenas UMA conta); PNAB Recife usa negra, PCD, indígena
   e residente em área periférica como flags de cota.*
4. **Atuação cultural** — áreas (taxonomia `terms.area` do Mapas Culturais ↔ linguagens do
   PNAB — vocabulário controlado só nosso); tempo de atuação; trajetória/formação; vínculo
   com cultura viva/comunitária.
5. **Capacidade formal** — CNPJ/MEI ativo e tempo de abertura; regularidade fiscal;
   conta bancária; contrato de exclusividade quando empresário/a.
6. **Histórico** — fomento público recebido (editais limitam); **participações em edições
   anteriores** (FRTN veda obras das 3 últimas); nº de propostas por edital (quase sempre 1).
7. **Portfólio com comprovação** — currículo com vídeo ≥3 min, fotos, clipagem, declarações
   → upload aceita texto + links.
8. **Lado projeto** — área/linguagem; valor (vs. faixa do edital); território de execução;
   público-alvo; duração; formato (espetáculo, intervenção, oficina, palestra — cachês por
   formato na FRTN); obra inédita (muda documentos); acessibilidade (Libras/audiodescrição
   pontuam); nº de integrantes e ficha técnica.

Regra de ouro: **todo campo do perfil existe porque um requisito de edital o avalia** —
taxonomia dos dois lados é uma só, versionada.

### 7.8 Escada de técnicas (o que é "recomendação" aqui)

O motor é recomendação **content-based com restrições duras** — mais próximo de *job
matching* (candidato↔vaga) que de feed social: sem interações no início, e similaridade
sozinha não decide elegibilidade.

| Técnica | Papel | Quando |
|---|---|---|
| Regras + pesos (modelo linear manual) | Gates + score estruturado v1 | W5 — dia 1 |
| TF-IDF/BM25 + cosseno | Baseline lexical projeto↔edital; termos exatos ("Libras", "grafite") | W5/W6 |
| Embeddings densos + cosseno (pgvector) | Afinidade semântica (a parte "estilo rede social") | W6 |
| Fusão lexical+densa (RRF) | Combina os dois recuperadores | W6 |
| Cross-encoder / LLM re-rank | Reavalia top-K on demand ("por quê?" detalhado) | W6+ |
| Learning-to-rank | Aprende os pesos manuais a partir de sinais próprios declarados | Quando houver sinais |
| Filtragem colaborativa / two-tower | "Quem se parece com você se inscreveu em quê" | V2 |
| Calibração (logística/isotônica) sobre aprovados | Aderência → **probabilidade real** | V2 |

Decisão de projeto: determinístico e explicável primeiro, denso depois, pesos aprendidos
só quando existir dado — nunca o contrário.

### 7.9 Corpus semente e golden set v0

`docs/editais-exemplo/` (PDF + texto extraído, 2026-10-13):

- `frtn.*` — Convocatória 25º Festival Recife de Teatro Nacional: regras completas
  (proponentes, impedimentos, documentos por tipo de pessoa, critérios pontuados,
  valores por formato).
- `multi_result.*` — Resultado Preliminar PNAB Multilinguagens Recife: **834 inscrições
  rotuladas** — 150 selecionadas, 641 suplentes, 44 desclassificadas — com linguagem,
  faixa de valor, tipo de proponente, flags de cota (negra, PCD, indígena, área
  periférica), média final e situação.

Papéis: golden set v0 (regressão da fórmula), molde de calibração (V2) e validação da
taxonomia (as colunas da tabela são as features mínimas do motor).

## 8. Riscos

| # | Risco | Prob. | Impacto | Mitigação | Contingência |
|---|---|---|---|---|---|
| R1 | LGPD: autodeclarações são dado sensível | Alta se ignorado | Alto (jurídico) | Consentimento explícito, criptografia em repouso, minimização, export/exclusão (T4.1/T4.2) | Advogado antes do lançamento público; dado sensível é opcional e o motor trata ausência sem penalizar a elegibilidade |
| R2 | Vazamento atual de senhas (pré-W0) | Certa enquanto existir | Alto | T0.2 na primeira semana | — |
| R3 | Extração de requisitos errada (LLM/PDF) | Média | Alto (nota errada) | Evidência citável, confiança + revisão humana, "conforme nossa leitura" na UI | Canal de correção pelo usuário; limiar de confiança esconde requisito não revisado |
| R4 | PDF escaneado sem texto | Média | Médio | Flag `precisa_ocr` desde T2.2 | OCR (tesseract) no worker; edital fica com requisitos incompletos até lá |
| R5 | Culturarecife muda/bloqueia scraper | Média | Médio (fonte municipal) | Spike + ADR (T2.4); respeitar robots/rate limit | Diário Oficial do Recife como fonte municipal estruturada |
| R6 | Mapa Cultural PE muda API sem aviso | Baixa | Médio | Contrato validado com zod + smoke test diário; JSON bruto guardado | Revisar conector a partir do JSON bruto salvo |
| R7 | Parse pesado estoura serverless (memória/tempo) | Média | Médio | D11: tudo em worker agendado, não na request | Quebrar PDF por páginas; fila |
| R8 | Better Auth × pooler do Supabase (prepared statements) | Média | Alto (auth fora) | Testar no T1.2 com string do pooler em modo transação; ADR | Fallback: Postgres dedicado (Neon/Supabase direto) — auth não fica preso ao Supabase |
| R9 | Dimensão/custo do embedding escolhido não cabe no pgvector ou no orçamento | Baixa | Médio | Avaliação no golden set antes de fechar (T6.1); tabela versionada por modelo | Redução de dimensionalidade ou troca de modelo via backfill |
| R10 | Viés de modelo em PT-BR periférico | Média | Alto (produto justo) | Golden set com casos reais do corpus; métrica de disparidade por cota | Modelo alternativo no vocabulário plugável (D6) |
| R11 | Expectativa: usuário ler "90%" como garantia | Média | Alto (reputação) | Limites de §7.4 na UI desde o dia 1; nota é "aderência" | V2: calibração com aprovados muda a linguagem para probabilidade |
| R12 | Golden set viciar a fórmula (overfit) | Média | Médio | Casos diversos (12 linguagens, cotas presentes e ausentes); validação cruzada | Ampliar golden set a cada edital novo revisado |
| R13 | Fuso America/Recife corromper prazos | Média | Alto (edital fechado como aberto) | T2.3 com testes de TZ; datas sempre em UTC + offset | Monitor de consistência: status derivado × página oficial |
| R14 | Escopo de rede social crescer antes do match pronto | Média | Alto (foco) | D10: social é UI, não entra no motor; roadmap trava UI social para depois de W5 | — |
| R15 | Custo de LLM na extração crescer com o catálogo | Média | Baixo/médio | Extração só na ingestão e reextração versionada; cache por hash | Modelo menor para triagem + LLM só em casos ambíguos |
| R16 | Só uma pessoa mantendo (ônibus factor) | Alta | Médio | Plano + ADRs + migrations no repo; decisões documentadas | — |

## 9. Fora de escopo deste ciclo (V2)

Pagamentos e premium · revisão do projeto do artista por IA (RAG sobre o edital) · probabilidade
calibrada de aprovação · alertas push/e-mail de novo edital · expansão nacional ·
multi-idioma · app mobile · feed social com curtir/compartilhar persistidos (a UI já
prevê os botões; a implementação social fica para depois do match entregue).

## 10. Telas e redesign (rascunho — fecha com as respostas da spec do replanejamento)

Sol & Mar já tem tokens. Telas a redesenhar, em ordem de dependência, com o que cada uma pede da
spec ArtistRank:

| Tela | Pede do ArtistRank |
|---|---|
| Login / cadastro | Better Auth; consentimento LGPD |
| Onboarding do artista (multi-etapas) | Identidade, linguagens, técnicas, temas, posicionamento, intenção e disponibilidade (§3, §6); campo ausente = desconhecido, nunca obrigatório por padrão |
| Trajetória (inclui estágios) | Experiências com categoria, estado de comprovação (§4) |
| Cadastro de obras | Obra como entidade própria, com técnica, suporte, montagem, mídia (§5) |
| Feed | Card com compatibilidade, confiança, estado de elegibilidade, motivos e lacunas (§14.4); "poucas oportunidades" (§9.9) |
| Detalhe do edital | Resumo IA em linguagem simples, requisitos com evidência, aviso de baixo poder discriminante, projeção da banca quando houver |
| "Por quê" da nota | Fatores, evidências, nota antes do teto, o que falta informar |
| Salvos / feedback | Interesse, rejeição **com motivo** (§20) |
| Organização: publicar edital e ver artistas compatíveis | Papel `organization`, requisitos estruturados, artistas elegíveis só com consentimento |
| Admin: edital | Upload de PDF, revisão de requisitos extraídos, CORE/SUPPORT, status de processamento |
| Perfil / privacidade | Exportar e excluir dados, visibilidade do portfólio |

## 11. Protótipo de frontend — `editaliza_prot`

Repositório: [github.com/BugRed/editaliza_prot](https://github.com/BugRed/editaliza_prot)
(`git@github.com:BugRed/editaliza_prot.git`), `main`, 2 commits. Foi lido em 2026-11-16 a partir de um
clone local em `./editaliza_prot/` (ignorado no git). **O protótipo é a referência de UX e de
fluxos**; o backend dele não é.

### 11.1 O que ele tem (e este repo não)

| Item | Onde | Para o plano |
|---|---|---|
| Design Sol & Mar já aplicado (paleta, Roboto) | `src/app/globals.css` | Convive com a branch `feature/ui-01` (Inter, tokens `--color-*`). **Escolher uma**: tokens da `ui-01` ficam; copiar do protótipo só o que ele acrescenta (`primary-soft`, `accent-soft`, `border-subtle`, foco visível) |
| Shell de navegação responsivo (Início, Publicar edital, Salvos, Perfil, Configurações, busca de artistas) | `components/shell/AppShell.tsx` | Base do organismo de navegação (W-UI) |
| Feed ranqueado com score, confiança, teto, aviso de escassez | `(main)/page.tsx`, `api/ranking` | Referência da UI do feed (W6/W-UI) |
| Modal de resumo do edital em linguagem simples (o que é, quem pode, benefícios, tags) | `components/modal/EditalSummaryModal.tsx` | Molde da T3.5. Hoje o resumo é um **gerador fixo** (`getPlainEditalSummary`), não IA |
| Publicar edital por proponente | `(main)/publicar-edital` (545 linhas) | Molde do formulário de organização (T6b.2, D20) |
| Perfil público do artista, obras, badges de editais vencidos | `perfil`, `perfil/[id]`, `components/profile` | Molde de W4 (perfil, obras, trajetória) |
| Configurações (editar perfil, obras, badges) | `configuracoes` (854 linhas) | Idem; precisa quebrar em organismos |
| Salvos | `salvos` | Feedback `salvo` (spec §20) |
| Cadastro real (`api/auth/register`) com Zod | `api/auth/register` | Só o schema de entrada; ver §11.3 |
| Motor `artistrank.ts` (335 linhas) | `src/shared/lib/artistrank.ts` | **Protótipo do motor, não a implementação da W5**; ver §11.2 |
| Store social do cliente | `hooks/useSocialStore.tsx` (542 linhas) | Descartar; vira server state (D10: sinal social fora do score) |

### 11.2 O motor do protótipo vs. a spec ArtistRank

O `artistrank.ts` acerta a forma (combina `0,35·artista + 0,65·portfólio`, teto de 45 no score combinado,
CORE 1,0 × SUPPORT 0,65, rótulo e aviso de escassez), mas **não é fiel à spec**, e a W5 o reescreve:

- Notas por fator são **constantes soltas** (82, 92, 96, 58…) e só seis critérios, não os oito fatores com pesos 15/20/10/15/10/15/5/10.
- Fator sem dado é **removido do denominador** (renormaliza): é exatamente a inflação que a spec v4 proíbe. Spec: nota neutra 0,5 sem renormalizar.
- Não há estado `UNKNOWN`: elegibilidade é só território e CNPJ. Falta `PASS/FAIL/UNKNOWN/NOT_APPLICABLE`.
- O teto de 45 dispara por **formação técnica ausente** e por **portfólio vazio**, que são requisitos de elegibilidade, não "requisito artístico obrigatório explícito em `FAIL`" (spec §9.3.1). Só o caso de linguagem obrigatória se aproxima.
- Confiança C é `53,5 + cobertura·31,1 + obras·2,2`, **calibrada para cair na faixa observada** (53,5–91,2), não a fórmula `100·(0,35K + 0,30E + 0,15A + 0,20X)` da spec.
- Sem evidências, sem versão de algoritmo, sem pesos persistidos, sem poder discriminante, sem projeção da banca.
- Níveis `INICIANTE…MESTRE` e `profileLevel` não existem na spec; trajetória vem de `experiences` com estado de comprovação.

Uso permitido: **fixture de UI** (formato do resultado: `rArtista`, `rPortfolio`, `scoreBruto`, `scoreFinal`, `confiancaC`, `cobertura`, `tetoAplicado`, `motivoTeto`, `bloqueado`) e semente dos testes de regressão.

### 11.3 Problemas do protótipo que **não** podem ser portados

- `api/auth/register` grava `password: data.password` **em texto puro** em `user_data`, `artist_data` e `proposer_data` (três tabelas). É o vazamento que a W0 fechou; Better Auth (T1.2) substitui, e hash nunca é opcional.
- `api/ranking` aceita `?artistId=` de qualquer chamador e, sem sessão, **cai no artista 1**: qualquer um ranqueia por qualquer artista. Na nova versão o artista vem da sessão, nunca da query.
- Usa o client Supabase anon direto nas rotas e `select('*')` em editais; a infra-01 deste repo já tirou isso.
- `console.error` nas rotas e componentes de 500 a 850 linhas (lint do kit barra).
- É um snapshot **anterior** à W0/T1.1/dep-01/infra-01 deste repo: portar por cópia reverteria correções.

### 11.4 Estratégia de aproveitamento

1. **Não substituir este repo pelo protótipo.** Portar **por tela**, reescrevendo para `src/shared/components/` (atoms → organisms), dados por prop e Server Components, sobre os tokens da `feature/ui-01`.
2. Ordem do redesign continua **em espera** (decisão do usuário); o protótipo vira o insumo de cada tela quando ela for escolhida.
3. Cada tela portada traz a UI dele **e** o contrato real (ArtistRank, Better Auth, Prisma), nunca o mock.
4. O resumo "em linguagem simples" do modal define o **formato do JSON** da T3.5 (`whatIsIt`, `whoCanApply[]`, `benefits[]`, `extraTags[]`); a IA passa a preencher.
5. O formulário de publicar edital do protótipo cobre território, linguagens exigidas/aceitas, CNPJ, formação, experiência e nível-alvo. Faltam vs. spec: critérios com pesos, CORE/SUPPORT explícito, evidência por requisito, tipo de oportunidade e anexo do PDF.
