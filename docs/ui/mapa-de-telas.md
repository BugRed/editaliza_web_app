# Mapa de telas e fluxo (O1)

**Status:** vigente como plano de ondas · front do `editaliza_prot` já no repo (ver abaixo) · **Spec:** [`0002-articulacao-design-o1`](../features/ui/0002-articulacao-design-o1.md)
**Fontes:** [`plano.md`](../../plano.md) §10 (telas) e §11 (protótipo `editaliza_prot`).

Este documento fixa **quais telas existem, quem as vê, como se ligam e em que ordem entram**.
Nenhuma tela é portada antes da aprovação. Onde o plano ou o protótipo divergem, vale o plano.

> **Estado real (2026-11-16):** o front do `editaliza_prot` foi trazido inteiro e é o design vigente. Já existem
> como telas reais: `/login`, `/cadastro`, `/` (feed), `/salvos`, `/perfil`, `/perfil/[id]`, `/configuracoes`,
> `/publicar-edital`, e, acrescentadas aqui, `/empresas/[id]` e `/perfil/[id]/selos/[badgeId]`. O resumo do
> edital (com as barras do ranking) é um modal, não uma rota. A tabela da §2 segue como **plano de ondas**: o
> que ainda não existe (admin, onboarding multi-etapas, trajetória, candidatos da organização, rejeição com
> motivo) entra na onda indicada. Não há página de protótipo no app.

## 1. Papéis

| Papel | Quem é | Telas |
|---|---|---|
| `artist` | Artista que busca editais | Feed, detalhe, salvos, perfil, onboarding, trajetória, obras, privacidade |
| `organization` | Quem publica edital (D20) | Publicar edital, artistas candidatos |
| `admin` | Equipe Editaliza | Admin de edital |
| visitante | Sem sessão | Login, cadastro |

Papel vem da sessão (Better Auth, O2). Rota fora do papel redireciona em `src/proxy.ts`.

## 2. Inventário

"Onda" é quando a tela vai **ao ar**; na O1 todas existem como protótipo navegável com dados fixos.
Coluna "Protótipo" aponta o molde em `editaliza_prot` (referência de UX, nunca cópia).

| # | Tela | Rota proposta | Papel | Onda | Molde no protótipo | Estados obrigatórios |
|---|---|---|---|---|---|---|
| 1 | Login | `/login` | visitante | O2 | `(auth)/login` | erro de credencial, carregando |
| 2 | Cadastro + consentimento LGPD | `/cadastro` | visitante | O2 | `(auth)/cadastro` | erro de campo, consentimento não marcado |
| 3 | Feed | `/feed` | artist | O3 | `(main)/feed` | vazio, carregando, poucos resultados |
| 4 | Detalhe do edital + resumo em linguagem simples | `/editais/[id]` (prévia pronta; o modal segue e leva a ela) | artist | O3 | `EditalSummaryModal` (vira página) | resumo indisponível, edital encerrado |
| 5 | Salvos | `/salvos` | artist | O3 | `(main)/salvos` | vazio |
| 6 | Perfil e privacidade (exportar, excluir, visibilidade) | `/perfil` e `/perfil/privacidade` (prévia pronta, dados fixos) | artist | O2 | `(main)/perfil` | confirmação de exclusão |
| 7 | Admin: edital (PDF, revisão, status) | `/admin/editais` (prévia pronta, dados fixos, sem checar papel ainda) | admin | O3 | sem molde | processando, falha de extração |
| 8 | Onboarding do artista (multi-etapas) | `/onboarding` | artist | O4 | `configuracoes` (parte) | etapa pulada, campo "desconhecido" |
| 9 | Trajetória | `/perfil/trajetoria` | artist | O4 | `configuracoes` (parte) | sem comprovação |
| 10 | Obras | `/perfil/obras` | artist | O4 | `configuracoes` (parte) | sem obras |
| 11 | "Por quê" da nota | `/editais/[id]/porque` | artist | O4 | sem molde | dado faltante |
| 12 | Perfil público do artista | `/artistas/[id]` | todos autenticados | O4 | `perfil/[id]` | portfólio oculto |
| 13 | Organização: publicar edital | `/organizacao/editais/novo` | organization | O5 | `publicar-edital` | rascunho, erro de requisito |
| 14 | Organização: candidatos | `/organizacao/editais/[id]/candidatos` | organization | O5 | sem molde | sem candidatos |
| 15 | Rejeição com motivo | modal no feed e no detalhe | artist | O5 | sem molde | — |

Regras que valem em todas:

- **Sem porcentagem de compatibilidade** na UI até a O4 (plano §6.0). Os cards do feed da O1–O3 ordenam por data.
- Campo ausente do artista é "desconhecido", nunca obrigatório por padrão.
- Claro e escuro em toda tela; só tokens, nenhuma cor ou raio literal fora de `globals.css`.
- Toda lista tem estado vazio e de carregamento desenhados.

## 3. Fluxos

```
visitante ─► /cadastro ─► (consentimento) ─► /onboarding* ─► /feed
          └► /login ────────────────────────────────────► /feed

/feed ─► /editais/[id] ─┬─► salvar ─► /salvos
                        ├─► rejeitar (motivo)*** ─► /feed
                        └─► "por quê"** ─► /editais/[id]

/perfil ─► trajetória* · obras* · exportar · excluir conta

organization ─► /organizacao/editais/novo*** ─► candidatos***
admin ─► /admin/editais ─► revisar requisitos ─► publicar no feed

*  entra na O4   ** O4   *** O5   (sem asterisco: O2–O3)
```

Redirecionamentos: sem sessão em rota autenticada → `/login`; com sessão em `/login` → `/feed`;
artista sem onboarding **não é bloqueado** (campo ausente é desconhecido), só vê o convite no feed.

## 4. Navegação (shell)

- **Artista:** Início (feed), Salvos, Perfil. Busca de artistas só na O4.
- **Organização:** Meus editais, Publicar, Perfil.
- **Admin:** Editais, Perfil.
- Mobile: barra inferior; desktop: lateral. Molde: `AppShell` do protótipo, reescrito como organismo.

## 5. Componentes por camada (o que a O1 constrói)

Só atoms e molecules entram em código na O1; organismos nascem tela a tela depois.

| Camada | Itens | Usado em |
|---|---|---|
| Atoms | Button, Input, Textarea, Select, Checkbox, Badge/Tag, Avatar, Spinner, Skeleton, Icon | todas |
| Molecules | FormField (label + input + erro), SearchBar, EditalCard (data, órgão, tags, ação), EmptyState, ConfirmDialog, StepIndicator, NavItem | 1–6, 8, 15 |
| Tokens a acrescentar | `primary-soft`, `accent-soft`, `border-subtle`, anel de foco visível | todas |

`EditalCard` e `FormField` cobrem as telas 1–5; `StepIndicator` só as 8 e 13.

## 6. Ordem proposta de portagem

Critério: o que bloqueia o lançamento (O3) primeiro; dentro disso, o que mais reaproveita componente.

1. **Login e cadastro** (1, 2): prova `FormField`, `Button`, `Input`. Obrigatórias pelo aceite da O1.
2. **Feed** (3): prova `EditalCard`, `SearchBar`, `EmptyState`. Obrigatória pelo aceite da O1.
3. **Detalhe do edital** (4): resumo em linguagem simples define o formato visual do JSON da T3.5.
4. **Salvos** (5) e **Perfil/privacidade** (6): reaproveitam o que já existe; LGPD é pré-requisito da O2.
5. **Admin de edital** (7): sem molde, só desenho.
6. **O4:** onboarding, trajetória, obras, "por quê", perfil público (8–12).
7. **O5:** organização e rejeição com motivo (13–15).

Na O1 só 1–3 viram código real (atoms, molecules e as duas telas do aceite); 4–15 ficam como
protótipo navegável com dados fixos.

## 7. Decisões que dependem do usuário

- [x] Aprova o inventário e as rotas da §2?
- [x] Aprova a ordem da §6?
- [x] Detalhe do edital como **página** (`/editais/[id]`) em vez do modal do protótipo — recomendado: página tem URL compartilhável e serve ao resumo IA.
- [x] Protótipo navegável como páginas Next com dados fixos (padrão sugerido), em vez de Storybook.
