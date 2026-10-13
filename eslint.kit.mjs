// Fragmento do kit: transforma em regra de lint o que hoje só existe como texto
// no CLAUDE.md. Enquanto uma convenção mora só em prosa, ela é carregada no
// contexto de toda sessão de IA e mesmo assim depende de alguém lembrar dela na
// revisão. Como regra, custa zero token e falha sozinha.
//
// Uso — em eslint.config.mjs:
//   import { regrasDoKit } from './eslint.kit.mjs'
//   export default defineConfig([ ...configAtual, ...regrasDoKit ])
//
// Cada bloco abaixo corresponde a uma linha que SAIU do CLAUDE.md. Mudou aqui,
// mude lá: a regra tem um dono só.

export const regrasDoKit = [
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // "Nunca use let; use sempre const."
      'prefer-const': ['error', { destructuring: 'all' }],
      // "Nunca use any nem as any" — use unknown + narrowing, ou genérico.
      '@typescript-eslint/no-explicit-any': 'error',
      // "Nunca console.log/console.error direto" — o logger/OpenTelemetry já
      // configurado (shared/lib/metrics.ts, instrumentation.ts) é o canal; log
      // solto não tem trace id nem aparece no dashboard.
      'no-console': 'error',
      // "Imports sempre com alias @/, nunca caminho relativo." O
      // simple-import-sort só ORDENA imports (ADR-0003); nada hoje impede o
      // relativo. O alias existe no tsconfig e no vitest.config, então vale
      // inclusive dentro de __tests__.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message: 'Importe por alias @/ — caminho relativo quebra ao mover o arquivo.',
            },
          ],
        },
      ],
    },
  },
  {
    // "Tipo de retorno explícito em toda função exportada de *.service.ts e
    // *.controller.ts": sem isso o tipo é inferido e uma mudança no corpo muda
    // o contrato sem avisar quem consome.
    files: ['src/server/**/*.service.ts', 'src/server/**/*.controller.ts'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
]

export default regrasDoKit
