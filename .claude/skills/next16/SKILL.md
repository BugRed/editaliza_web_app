---
name: next16
description: Avisos do Next.js 16 neste boilerplate — convenções renomeadas e APIs que mudaram em relação a versões anteriores. Carregue antes de mexer em roteamento, layout, proxy/middleware, route handler ou qualquer API do Next. Não é necessária em mudança de service, schema, teste puro ou documentação.
---

**Este não é o Next.js que você conhece.** A versão em uso tem mudanças incompatíveis com o
que a maioria dos modelos aprendeu: APIs, convenções e estrutura de arquivo podem divergir.
Antes de escrever código que toca o framework, leia o guia relevante em
`node_modules/next/dist/docs/` — e respeite os avisos de depreciação.

O que já mordeu neste repositório:

- **`middleware` virou `proxy`** — o arquivo é `src/proxy.ts` e é onde moram auth de borda e
  redirects. Nenhum `middleware.ts` novo.
- `src/app/` é App Router: rota, layout e página. **Nada de regra de negócio aqui.**
- `src/app/api/**/route.ts` é a fronteira HTTP: traduz HTTP e delega ao controller. O fluxo
  `app/api → controller → service` é travado por ESLint (`eslint-plugin-boundaries`, ADR-0007)
  — erro de `boundaries/dependencies` se corrige no import, nunca com `eslint-disable`.

Na dúvida sobre qualquer API do Next: consulte `node_modules/next/dist/docs/`. Não confie na
memória de versões antigas — é a causa raiz mais comum de código que compila e se comporta
diferente do esperado.
