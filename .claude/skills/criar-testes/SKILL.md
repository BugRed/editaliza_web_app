---
name: criar-testes
description: Escreve ou atualiza os testes Vitest de um arquivo que acabou de ser criado ou alterado — service, controller, schema, route handler, componente ou utilitário. Dispara sempre que a sessão terminou de implementar algo testável em src/, antes do gate, e quando o usuário pede teste para um arquivo. Detecta a camada pelo caminho e escolhe a estratégia de mock; não dispara para mudança só de documentação, configuração ou formatação.
---

Você é QA, não autor do código. Seu trabalho não é escrever teste que passa — é achar o caso
que quem implementou não pensou, e deixar o comportamento especificado em código.

## 1. Alvo e camada

O alvo sai do que a sessão acabou de mexer (ou do que o usuário apontou). Leia o arquivo e os
que ele importa **uma camada de profundidade** antes de escrever qualquer teste.

| Caminho | Camada | Estratégia |
|---|---|---|
| `src/server/<domínio>/*.service.ts` | Service | Unitário, mock do Prisma |
| `src/server/<domínio>/*.controller.ts` | Controller | Unitário, mock do service inteiro |
| `src/server/<domínio>/*.schema.ts` | Schema/Zod | Função pura, sem mock |
| `src/app/api/**/route.ts` | Route handler | Integração leve, mock do controller |
| `src/shared/components/**` · `src/app/**/page.tsx` | UI | Testing Library |
| `src/shared/lib/**` | Utilitário | Função pura, sem mock |

Diga qual camada detectou e qual mock vai usar.

## 2. Mapeie os casos antes de escrever

Liste **todos**, por categoria, e só então implemente:

- **Caminho feliz** — fluxo principal, ao menos um por assinatura pública.
- **Borda** — `''`, 1 caractere, limite; `0`, `-1`, `Infinity`; `[]` e lista de um item;
  campo opcional ausente vs. presente; acento e unicode.
- **Erro** — entrada rejeitada pelo schema, erro lançado pelo service, recurso inexistente
  (`NotFoundError`), violação de regra de negócio, dependência externa falhando.
- **Invariante** — o que a função **nunca** pode retornar ou fazer (ex.: senha em DTO);
  idempotência; efeito colateral com os argumentos certos.

Apresente a lista. Pergunte **só** se houver cenário de negócio que o código não revela —
caso contrário siga e liste no relatório o que deixou de fora e por quê.

## 3. Convenções

Arquivo em `__tests__/` co-localizado (`src/server/<domínio>/__tests__/<domínio>.service.test.ts`,
`src/shared/components/atoms/<Nome>/__tests__/<Nome>.test.tsx`). Nunca fora disso.

```ts
describe('<Sujeito>', () => {
  describe('quando <contexto>', () => {
    it('deve <comportamento observável>', () => { /* Arrange · Act · Assert */ })
  })
})
```

`it` começa com "deve" e descreve comportamento, não implementação
(`it('deve lançar NotFoundError quando o usuário não existe')`, nunca `it('testa o if')`).
Máximo dois níveis de `describe`. Arrange, Act e Assert em blocos separados, sempre.

**Mocks por camada:**

```ts
// Service — mock do Prisma
vi.mock('@/server/db/prisma', () => ({ prisma: { user: { findUnique: vi.fn(), create: vi.fn() } } }))
const prismaMock = vi.mocked(prisma)
beforeEach(() => { vi.clearAllMocks() })

// Controller — mock do service inteiro
vi.mock('@/server/<domínio>/<domínio>.service')

// Schema — sem mock, função pura
expect(() => criarUsuarioSchema.parse({ nome: '' })).toThrow()
```

**Componente:** `getByRole`/`getByLabelText` (nunca `getByTestId`, salvo último recurso),
`userEvent` em vez de `fireEvent`, teste o que o usuário vê e faz — não classe CSS nem
estrutura de DOM. `screen.debug()` nunca é commitado.

**Não mocke:** função pura de `src/shared/lib/`, schema de validação. `Date`/`Math.random`
se injeta por parâmetro ou se controla com `vi.setSystemTime()`.

**Asserção específica sempre** — `toEqual`, `toHaveBeenCalledWith`, `toThrow(MeuErro)`;
nunca `toBeTruthy`/`toBeDefined` solto. Assíncrono: `await expect(fn()).rejects.toThrow(X)`.
Verifique **com o quê** o mock foi chamado, não só *se* foi:

```ts
expect(prismaMock.user.create).toHaveBeenCalledWith({ data: { nome: 'João', email: 'joao@example.com' } })
```

## 4. Revisão própria antes de rodar

- [ ] Cada `it()` tem um foco claro.
- [ ] Nenhum teste depende da ordem de execução.
- [ ] `beforeEach` com `vi.clearAllMocks()`.
- [ ] Nenhum `console.log`/`screen.debug()` sobrou.
- [ ] Nome descreve comportamento.
- [ ] Caso de erro verifica tipo ou mensagem, não só que lançou.

## 5. Rode e relate

```bash
yarn test --reporter=verbose
yarn test:cov
```

Falhou? Decida se o erro é do **teste** (asserção ou mock errado) ou do **código** (bug real)
— e diga qual dos dois, sempre. No relatório: camada e mock usados · casos cobertos · casos
deixados de fora com o motivo · e o que o código revelou enquanto você testava (função que faz
duas coisas, dependência difícil de injetar — isso vai para a dívida da spec).
