---
description: Gate de qualidade — formatação, tipos, lint e testes com cobertura (Sonar sob demanda)
argument-hint: "[sonar]"
---

Pipeline de qualidade, do mais barato ao mais caro. Pare e reporte se algo falhar de forma
irrecuperável.

## 1. Formatação e tipos

```bash
yarn format:check
yarn typecheck
```

- `format:check` falhando: `yarn format` e revise o diff (deve ser só estilo).
- `typecheck` falhando: corrija antes de seguir — nem lint nem teste pegam erro de tipo.

## 2. Lint (inclui boundaries de arquitetura)

```bash
yarn lint
```

Erro de `boundaries/dependencies` é import fora do fluxo `app/api → controller → service`
(ADR-0007). Ajuste o import; **não** desative a regra.

## 3. Testes com cobertura

```bash
yarn test:cov
```

O piso de cobertura é um **ratchet** (ADR-0006): `vitest.config.ts` se reescreve sozinho
quando a cobertura sobe. Se ele mudou, o arquivo entra no commit — e é por isso que não
existe "baseline de testes" escrito em nenhum `.md` deste repositório.

## 4. SonarQube — sob demanda

```bash
yarn sonar && yarn sonar:scan
```

Rode quando o argumento for `sonar` (`$ARGUMENTS`), quando o diff mexer em algo que o Sonar
costuma pegar (duplicação, complexidade) ou quando o usuário pedir. Fora disso, **pule**: o
`sonar.yml` já roda no push para `dev`, e subir o container em toda sessão custa minutos sem
achado novo. Diga no relatório que pulou.

Para cada issue: avalie, corrija no código. Falso positivo justificável vira
`// NOSONAR: <razão>` inline.

## 5. Relatório

Testes que passaram/falharam · cobertura final · o que o Sonar apontou (ou que ele não rodou)
· o que você corrigiu no caminho.
