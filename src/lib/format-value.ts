/**
 * Renders a decoded runtime value as a compact, REPL-style string for the
 * results panel. Unlike JSON.stringify it distinguishes undefined, NaN,
 * ±Infinity, and -0, and spells out Map/Set/Date contents.
 */
export function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return Object.is(value, -0) ? '-0' : String(value);
  }
  if (typeof value === 'string') {
    return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
  }
  if (value === undefined || value === null || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => formatValue(item)).join(', ')}]`;
  }
  if (value instanceof Date) {
    return `Date(${value.toISOString()})`;
  }
  if (value instanceof Map) {
    if (value.size === 0) {
      return 'Map {}';
    }
    const entries = [...value.entries()].map(([key, entry]) => `${formatValue(key)} => ${formatValue(entry)}`);
    return `Map { ${entries.join(', ')} }`;
  }
  if (value instanceof Set) {
    if (value.size === 0) {
      return 'Set {}';
    }
    return `Set { ${[...value.values()].map((item) => formatValue(item)).join(', ')} }`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value).map(([key, entry]) => `${key}: ${formatValue(entry)}`);
    return entries.length === 0 ? '{}' : `{ ${entries.join(', ')} }`;
  }
  return String(value);
}
