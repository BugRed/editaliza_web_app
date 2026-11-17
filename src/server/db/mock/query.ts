import 'server-only';
import { EMPTY_LIST_COLUMNS, getMockDb, TABLES_WITH_UNIQUE_EMAIL, type Row } from './store';

interface QueryError {
  message: string;
  code: string;
  details: string;
  hint: string;
}

interface QueryResult {
  data: Row | Row[] | null;
  error: QueryError | null;
}

const NOT_ONE_ROW: QueryError = {
  message: 'JSON object requested, multiple (or no) rows returned',
  code: 'PGRST116',
  details: '',
  hint: '',
};

function failure(message: string, code: string): QueryResult {
  return { data: null, error: { message, code, details: '', hint: '' } };
}

function project(row: Row, columns: string): Row {
  if (!columns || columns.trim() === '*') return { ...row };
  const names = columns.split(',').map((column) => column.trim()).filter(Boolean);
  // Coluna que o banco real teria mas o seed não traz vira null, como num SELECT de coluna vazia.
  return Object.fromEntries(names.map((name) => [name, row[name] ?? null]));
}

/**
 * Imita só o trecho do query-builder do supabase-js que o app usa: select, insert, update, eq e single.
 * Método fora disso não existe aqui de propósito: falha alto em vez de devolver dado errado.
 */
export class MockQuery implements PromiseLike<QueryResult> {
  private operation: 'select' | 'insert' | 'update' = 'select';
  private columns = '*';
  private payload: Row | Row[] | null = null;
  private filters: Array<[string, unknown]> = [];
  private wantsOne = false;

  constructor(private readonly table: string) {}

  select(columns = '*'): this {
    this.columns = columns;
    return this;
  }

  insert(values: Row | Row[]): this {
    this.operation = 'insert';
    this.payload = values;
    this.columns = '';
    return this;
  }

  update(values: Row): this {
    this.operation = 'update';
    this.payload = values;
    this.columns = '';
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push([column, value]);
    return this;
  }

  single(): this {
    this.wantsOne = true;
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }

  private matches(row: Row): boolean {
    return this.filters.every(([column, value]) => String(row[column]) === String(value));
  }

  private respond(rows: Row[]): QueryResult {
    const projected = rows.map((row) => project(row, this.columns));
    if (!this.wantsOne) return { data: projected, error: null };
    return projected.length === 1 ? { data: projected[0], error: null } : { data: null, error: NOT_ONE_ROW };
  }

  private async run(): Promise<QueryResult> {
    const db = await getMockDb();
    const rows = (db[this.table] ??= []);

    if (this.operation === 'select') return this.respond(rows.filter((row) => this.matches(row)));

    if (this.operation === 'update') {
      const changed = rows.filter((row) => this.matches(row));
      for (const row of changed) Object.assign(row, this.payload);
      // Sem .select() o supabase-js devolve data null; com ele, as linhas alteradas.
      return this.columns ? this.respond(changed) : { data: null, error: null };
    }

    const incoming = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
    const created: Row[] = [];
    for (const values of incoming) {
      const email = values.email;
      if (TABLES_WITH_UNIQUE_EMAIL.has(this.table) && rows.some((row) => row.email === email)) {
        return failure(`duplicate key value violates unique constraint "${this.table}_email_key"`, '23505');
      }
      const now = new Date().toISOString();
      const nextId = rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
      const row: Row = { id: nextId, createdAt: now, updatedAt: now, ...values };
      for (const column of EMPTY_LIST_COLUMNS[this.table] ?? []) {
        if (row[column] === undefined) row[column] = [];
      }
      rows.push(row);
      created.push(row);
    }
    return this.columns ? this.respond(created) : { data: null, error: null };
  }
}
