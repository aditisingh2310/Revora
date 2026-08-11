// Supabase returns jsonb columns as already-parsed objects, whereas the old
// SQLite layer stored them as JSON strings. This helper normalizes both shapes
// so the rest of the app can treat a configuration column uniformly.
export function parseJsonColumn(value: unknown): Record<string, unknown> {
  if (value == null) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return {};
}
