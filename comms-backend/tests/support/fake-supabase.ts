import { randomUUID } from 'node:crypto';

// A tiny in-memory stand-in for @supabase/supabase-js that implements exactly
// the query surface our repositories use. It enforces the unique constraints
// declared in the migration so idempotency can be tested without a live
// database. Used as a drop-in for `SupabaseClient` in unit/integration tests.

type Row = Record<string, any>;

interface Table {
  rows: Row[];
  // Column combinations that must stay unique (mirrors migration constraints).
  uniques: string[][];
}

interface QueryResult<T = any> {
  data: T | null;
  error: { code: string; message: string } | null;
}

function newStore(): Record<string, Table> {
  return {
    shops: { rows: [], uniques: [['id']] },
    channel_connections: { rows: [], uniques: [['id']] },
    contacts: { rows: [], uniques: [['id'], ['shop_id', 'channel_connection_id', 'external_id']] },
    messages: { rows: [], uniques: [['id'], ['channel_connection_id', 'external_message_id']] },
  };
}

function matches(row: Row, filters: [string, any][]): boolean {
  return filters.every(([key, value]) => row[key] === value);
}

export interface FakeSupabaseOptions {
  // Pre-seed rows, keyed by table name.
  seed?: Record<string, Row[]>;
}

export function createFakeSupabaseClient(options: FakeSupabaseOptions = {}): any {
  const store: Record<string, Table> = newStore();
  for (const [table, rows] of Object.entries(options.seed ?? {})) {
    store[table] = store[table] ?? { rows: [], uniques: [['id']] };
    store[table].rows.push(...rows);
  }

  function getTable(name: string): Table {
    if (!store[name]) store[name] = { rows: [], uniques: [['id']] };
    return store[name];
  }

  function doInsert(tableName: string, payload: Row | Row[]): QueryResult {
    const table = getTable(tableName);
    const list = Array.isArray(payload) ? payload : [payload];
    const inserted: Row[] = [];
    for (const item of list) {
      const row: Row = { ...item };
      if (row.id == null) row.id = randomUUID();
      if (row.created_at == null) row.created_at = new Date().toISOString();
      if (row.updated_at == null) row.updated_at = new Date().toISOString();
      for (const combo of table.uniques) {
        const conflict = table.rows.find((r) => combo.every((c) => r[c] === row[c]));
        if (conflict) {
          return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
        }
      }
      table.rows.push(row);
      inserted.push(row);
    }
    return { data: inserted, error: null };
  }

  function builder(tableName: string): any {
    const filters: [string, any][] = [];
    let insertPayload: Row | Row[] | null = null;
    let updatePayload: Row | null = null;
    let selectCalled = false;

    const b: any = {};
    b.select = () => {
      selectCalled = true;
      return b;
    };
    b.insert = (p: Row | Row[]) => {
      insertPayload = p;
      return b;
    };
    b.update = (p: Row) => {
      updatePayload = p;
      return b;
    };
    b.eq = (key: string, value: any) => {
      filters.push([key, value]);
      return b;
    };
    b.order = () => b;
    b.limit = () => b;

    b.maybeSingle = () => finish(true);
    b.single = () => finish(false);

    function finish(maybe: boolean): QueryResult {
      const table = getTable(tableName);

      if (insertPayload !== null) {
        const res = doInsert(tableName, insertPayload);
        if (res.error) return res;
        const rows = res.data as Row[];
        if (maybe) return { data: rows[0] ?? null, error: null };
        if (rows.length === 1) return { data: rows[0], error: null };
        return { data: rows, error: null };
      }

      if (updatePayload !== null) {
        const targets = table.rows.filter((r) => matches(r, filters));
        for (const t of targets) Object.assign(t, updatePayload);
        return { data: targets.length ? targets : null, error: null };
      }

      // select
      const found = table.rows.filter((r) => matches(r, filters));
      if (maybe) return { data: found[0] ?? null, error: null };
      if (found.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'not found' } };
      }
      if (found.length > 1) {
        return { data: found, error: { code: 'PGRST200', message: 'multiple rows' } };
      }
      return { data: found[0], error: null };
    }

    return b;
  }

  return {
    from: (name: string) => builder(name),
    // Exposed for test assertions / truncation.
    _store: store,
  };
}
