import 'server-only';
import { MockQuery } from './query';

/** Cliente com a forma do `supabase` que o app usa (`from(tabela)`), alimentado pelo seed em memória. */
export function createMockClient() {
  return { from: (table: string) => new MockQuery(table) };
}
