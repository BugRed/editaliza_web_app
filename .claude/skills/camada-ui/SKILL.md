---
name: camada-ui
description: Regras de componente deste boilerplate — Atomic Design e fronteira entre Server e Client Component. Carregue antes de criar ou alterar qualquer coisa em src/shared/components/ ou src/app/**/page.tsx. Não é necessária em mudança de API, service, schema ou banco.
---

Atomic Design com responsabilidade clara. A regra que mais se quebra aqui é a de **quem busca
dado**.

- **Átomo** (`src/shared/components/atoms/`) — nunca tem estado de negócio, nunca faz fetch.
  Recebe tudo por prop.
- **Molécula** (`molecules/`) — composição de átomos; estado só de interação (aberto/fechado,
  foco), nunca de domínio.
- **Organismo** (`organisms/`) — composição com significado de negócio. **Não busca dado
  direto.** Quem busca é o Server Component da página, que passa por prop. Organismo que
  busca vira mini-página acoplada a dado e deixa de ser reutilizável.
- **Página** (`src/app/**/page.tsx`) — Server Component por padrão: é aqui que o dado é
  buscado e descido como prop.

Toda função exportada tem nome descritivo e tipo explícito quando atravessa fronteira de
módulo. Sem `any`. Sem `console.log` — o logger/OpenTelemetry já configurado
(`src/shared/lib/metrics.ts`, `instrumentation.ts`) é o canal.

Teste de componente é Testing Library, por papel e por comportamento do usuário — a skill
`criar-testes` tem as regras.

Mudou tela ou componente visível? A spec da feature em `docs/features/ui/` (ou a da
responsabilidade principal) é atualizada no mesmo commit.
