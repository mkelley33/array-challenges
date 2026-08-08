/**
 * Structural equality over the codec value domain (JSON + undefined, NaN, ±Infinity,
 * -0, Date, Map, Set). Used to judge challenge solutions, so semantics are strict:
 * no cross-type coercion, `NaN` equals `NaN` (a solution that returns `NaN` where
 * `NaN` is expected is correct), and `-0` differs from `+0` (methods like `findLast`
 * can legitimately surface the difference).
 *
 * Map and Set comparison is order-insensitive with deep member equality, tracking
 * already-matched members so duplicates cannot double-match.
 */

function isPlainObject(value: object): boolean {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

type Pending = Map<object, Set<object>>;

function rememberPair(pending: Pending, a: object, b: object): boolean {
  let partners = pending.get(a);
  if (partners === undefined) {
    partners = new Set();
    pending.set(a, partners);
  }
  if (partners.has(b)) {
    return true;
  }
  partners.add(b);
  return false;
}

function arraysEqual(a: readonly unknown[], b: readonly unknown[], pending: Pending): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index += 1) {
    if (!equals(a[index], b[index], pending)) {
      return false;
    }
  }
  return true;
}

function plainObjectsEqual(a: Record<string, unknown>, b: Record<string, unknown>, pending: Pending): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (!Object.hasOwn(b, key) || !equals(a[key], b[key], pending)) {
      return false;
    }
  }
  return true;
}

function mapsEqual(a: ReadonlyMap<unknown, unknown>, b: ReadonlyMap<unknown, unknown>, pending: Pending): boolean {
  if (a.size !== b.size) {
    return false;
  }
  const unmatched = [...b.entries()];
  for (const [aKey, aValue] of a.entries()) {
    const matchIndex = unmatched.findIndex(
      ([bKey, bValue]) => equals(aKey, bKey, pending) && equals(aValue, bValue, pending),
    );
    if (matchIndex === -1) {
      return false;
    }
    unmatched.splice(matchIndex, 1);
  }
  return true;
}

function setsEqual(a: ReadonlySet<unknown>, b: ReadonlySet<unknown>, pending: Pending): boolean {
  if (a.size !== b.size) {
    return false;
  }
  const unmatched = [...b];
  for (const aItem of a) {
    const matchIndex = unmatched.findIndex((bItem) => equals(aItem, bItem, pending));
    if (matchIndex === -1) {
      return false;
    }
    unmatched.splice(matchIndex, 1);
  }
  return true;
}

function equals(a: unknown, b: unknown, pending: Pending): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return Object.is(a, b);
  }
  if (a === b) {
    return true;
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (rememberPair(pending, a, b)) {
    return true;
  }

  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray || bIsArray) {
    return aIsArray && bIsArray && arraysEqual(a, b, pending);
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (a instanceof Map || b instanceof Map) {
    return a instanceof Map && b instanceof Map && mapsEqual(a, b, pending);
  }
  if (a instanceof Set || b instanceof Set) {
    return a instanceof Set && b instanceof Set && setsEqual(a, b, pending);
  }
  if (!isPlainObject(a) || !isPlainObject(b)) {
    return false;
  }
  return plainObjectsEqual(a as Record<string, unknown>, b as Record<string, unknown>, pending);
}

export function deepEqual(a: unknown, b: unknown): boolean {
  return equals(a, b, new Map());
}
