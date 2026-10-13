# Plano — Editaliza

> Plano vivo de evolução da plataforma: fonte única até virar código e ADR.
> Atualizado em 2026-10-13 · branch `feature/front-end` · corpus de editais reais em
> `docs/editais-exemplo/`.

## 1. Visão

Unir em um só lugar os editais culturais de Recife e de Pernambuco publicados em domínio
público, extrair deles requisitos estruturados (tags, cotas, critérios pontuados) e
entregar a cada usuário um **score de match explicável** entre seu perfil/projetos e cada
edital. O Editaliza caminhará para ser rede social (curtir, compartilhar, comentar), mas
**sinais sociais nunca entram no cálculo do match**. Na V2: editor de IA para criar e
corrigir propostas, para usuários premium.

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
| D3 | Motor de match | **Híbrido**: regras duras (elegibilidade) + afinidade semântica (embeddings, cosseno, pgvector). Fórmula versionada, determinística, explicável |
| D4 | Dados do usuário | Perfil rico (autodeclarações LGPD-sensíveis, território, área, PF/MEI/PJ, tempo de atuação, formação) + projetos enviados (PDF/texto/links) |
| D5 | IA de propostas e premium | **V2** — pagamentos, assinaturas e editor de propostas fora deste ciclo |
| D6 | Provedor de IA | Plugável (`EmbeddingProvider`, `LLMProvider`), escolha por env; modelo de embedding definido na W6 com avaliação no golden set |
| D7 | Coleta | Cron diário; dedup por (fonte, id da fonte, hash do conteúdo) |
| D8 | Domínio | `Artist`/`Proposer` → **Agente Cultural** (PF/MEI) e **Organização**; executa na refactoração final (W7), tabelas novas já nascem no nome certo |
| D9 | Arquitetura | Código novo nasce em `src/server` (`api → controller → service`); legado só migra na W7 |
| D10 | Sinais sociais fora do match | Curtir/compartilhar/comentar são UI; score é função apenas de perfil + projeto + edital; social também não calibra |
| D11 | Trabalho pesado fora da request | Parse de PDF/OCR, extração LLM e embeddings rodam em job agendado (worker), nunca no ciclo da requisição |

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
| T2.5 | Cron diário: GitHub Actions agendado chamando endpoint admin protegido por secret; alerta quando coleta volta vazia (fonte mudou) | Coleta roda 7 dias seguidos sem intervenção; coleta vazia notifica |
| T2.6 | UI consome dado real: feed e página de detalhe do edital lendo o banco (fonte, datas, status, link oficial, PDF) | Mocks saem do fluxo de leitura (ficam só como seed) |

### W3 — Taxonomia e extração de requisitos (dep: W2)

| T | O quê | Pronto quando |
|---|---|---|
| T3.1 | **Vocabulário controlado versionado** (`db/vocabulario/`): áreas/linguagens (mapear `terms.area` do Mapas Culturais ↔ linguagens do PNAB Recife), cotas, tipos de proponente, tipos de requisito | Mapeamento cobre 100% das linguagens vistas no corpus (12) e das áreas da API |
| T3.2 | Tabelas `requisito` e `criterio_avaliacao` (§5.6) com migração | Migration aplicada |
| T3.3 | **Extrator LLM plugável**: pipeline texto do edital → requisitos + critérios/pesos + cotas + faixas, cada item com evidência citável e confiança; validação zod do output com retry/repair | Extração da FRTN bate com a leitura manual (golden extraction) |
| T3.4 | Backfill do corpus: rodar extração sobre editais ingeridos + `docs/editais-exemplo/` | Todo edital ativo tem requisitos com evidência |
| T3.5 | Revisão humana mínima: rota admin listando requisitos por edital com approve/edit para confiança baixa | Itens abaixo do limiar de confiança ficam invisíveis ao match até revisados |

### W4 — Perfil e projetos do usuário (dep: T1.2 + T3.1; paralela à W3)

| T | O quê | Pronto quando |
|---|---|---|
| T4.1 | Formulário de perfil multi-etapas (§5.7): tipo de proponente, território + flag área periférica, autodeclarações com **consentimento LGPD explícito e criptografia em repouso**, atuação, capacidade formal, histórico de participações | Perfil salva completo; autodeclarações não aparecem em nenhuma resposta sem escopo |
| T4.2 | Direitos LGPD: exportar meus dados e excluir conta (dados sensíveis first) | Exclusão remove autodeclarações e vetores derivados |
| T4.3 | Upload de projeto: PDF/texto + links de vídeo/foto (portfólio com comprovação), extração de texto (mesma pipeline da W2), campos estruturados (área, valor, formato, inédita, território) | Projeto enviado aparece com texto extraído e campos preenchidos |
| T4.4 | Completude do perfil por edital: função que diz quais campos avaliados por aquele edital estão faltando | Alimenta a UI "complete seu perfil" da W5 |

### W5 — Match v1: regras (dep: W3 + W4)

| T | O quê | Pronto quando |
|---|---|---|
| T5.1 | **Golden set v0**: 30+ casos derivados do dataset rotulado (`multi_result`) + casos sintéticos com nota esperada | Arquivo versionado + teste de regressão roda no CI |
| T5.2 | Fórmula v1 (§5.2): gates eliminatórios + requisitos pontuáveis + **espelhamento dos pesos que o próprio edital publica** quando existem | Golden set passa; mesma entrada → mesma nota (determinismo testado) |
| T5.3 | `match_result` + invalidação por `inputs_hash` (perfil/projeto/edital mudaram → recalcula) | Recalcular não duplica; mudança de perfil invalida cache |
| T5.4 | UI: score real no `PercentCardFeed`, feed ordenado por match, página "por quê" com breakdown + evidência + link oficial, bloco de pendências | O "30%" fixo morre; toda nota é clicável e explicada |

### W6 — Match v2: embeddings (dep: W5)

| T | O quê | Pronto quando |
|---|---|---|
| T6.1 | pgvector + tabela `embedding` (modelo+versão+dimensão+hash); interface `EmbeddingProvider`; **escolha do modelo** por avaliação no golden set (PT-BR, custo, dimensão suportada) | Troca de modelo tem backfill versionado |
| T6.2 | Chunking por seção do edital (objeto, público-alvo, categorias) + embeddings de projeto; lexical TF-IDF/BM25 como baseline e feature | Baseline e denso comparados no golden set |
| T6.3 | Fórmula v2 híbrida (§5.8): regras + lexical + denso com RRF, pesos espelhados do edital quando publicados | v2 ≥ v1 no golden set sem perder explicabilidade |
| T6.4 | Pré-computo do feed: top-N por usuário quando entra edital novo; recomputação quando perfil/projeto muda | Feed abre com scores prontos (<100ms), sem computar na request |

### W7 — Refactoração e endurecimento (dep: todas; o "deixa pro final")

| T | O quê | Pronto quando |
|---|---|---|
| T7.1 | Unificar as três `FeedPage` em uma; remover código morto e comentários de código; classes tipo TypeORM → interfaces puras | Uma só página de feed; `src/app/types` sem classes com estado |
| T7.2 | Rename de domínio (D8): `artist_data`/`proposer_data` → agente cultural/organização, migrations + seed | Nenhuma referência a Artist/Proposer no código |
| T7.3 | Lint do kit ligado no CI (`eslint.kit.mjs` somado ao `eslint.config.mjs`) + cobertura mínima nos services críticos (auth, normalizadores, fórmula) | `yarn lint` passa; services críticos com teste de comportamento |
| T7.4 | Revisão de segurança final: headers, rate limit no login, URLs de storage assinadas, checagem OWASP básica | Checklist de segurança documentado e aprovado |

## 6. Roadmap

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
| W3 | Taxonomia + extração de requisitos | W2 | W4 |
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

Pagamentos e premium · editor de propostas com IA (RAG sobre o edital) · probabilidade
calibrada de aprovação · alertas push/e-mail de novo edital · expansão nacional ·
multi-idioma · app mobile · feed social com curtir/compartilhar persistidos (a UI já
prevê os botões; a implementação social fica para depois do match entregue).
