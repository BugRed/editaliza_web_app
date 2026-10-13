---
name: camada-db
description: Regras de Prisma, schema modular, seed e migration deste boilerplate. Carregue antes de alterar qualquer coisa em prisma/ ou de escrever acesso a banco em src/server/. Não é necessária em mudança só de UI, documentação ou configuração.
---

O schema é **modular**: um arquivo `*.prisma` por domínio em `prisma/schema/` — nunca um
`schema.prisma` monolítico. O seed segue o mesmo corte: orquestrador em `prisma/seed/index.ts`
e um seeder por domínio.

Acesso a banco mora no **service** do domínio (`src/server/<domínio>/*.service.ts`), nunca em
controller, route handler ou componente. O client fica em `src/server/db/` e se importa por
`@/server/db` — nunca por caminho relativo.

Migration e seed rodam **dentro do container de dev**, não no host:

```bash
yarn db:migrate   # prisma migrate dev
yarn db:generate  # prisma generate
yarn db:seed
```

Instalou dependência nova? `yarn dev:reset` — o container tem volume próprio de
`node_modules` e sem rebuild não enxerga o pacote.

Mudou tabela ou coluna? **`docs/db/modelo-de-dados.md` muda no mesmo commit** — é a fonte da
verdade do modelo, e o contrato de estado cobra documentação quando o diff mexe em domínio.

Campo que guarda dado pessoal exige decisão registrada (`docs/negocio/` ou ADR) antes de
existir — a skill `grill-regra-negocio` dispara nesse caso.
