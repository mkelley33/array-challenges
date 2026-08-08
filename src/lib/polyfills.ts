/**
 * Guarded polyfills for array-adjacent APIs newer than the app's ES2024 baseline
 * assumes everywhere: `Array.fromAsync`, `Object.groupBy`, and `Map.groupBy`.
 *
 * Node 24 and evergreen browsers ship all three natively, so `installPolyfills`
 * is a no-op there — the fallback implementations exist for older browsers and
 * are unit-tested directly. The module is imported for its side effect by the
 * app entry, the solution worker, and the db generator so user solutions can
 * rely on these APIs in every execution environment.
 */

export async function fromAsyncImpl<T>(
  source: ArrayLike<T> | AsyncIterable<T> | Iterable<T>,
): Promise<Awaited<T>[]>;
export async function fromAsyncImpl<T, U>(
  source: ArrayLike<T> | AsyncIterable<T> | Iterable<T>,
  mapFn: (value: Awaited<T>, index: number) => PromiseLike<U> | U,
): Promise<Awaited<U>[]>;
export async function fromAsyncImpl<T, U>(
  source: ArrayLike<T> | AsyncIterable<T> | Iterable<T>,
  mapFn?: (value: Awaited<T>, index: number) => PromiseLike<U> | U,
): Promise<(Awaited<T> | Awaited<U>)[]> {
  const result: (Awaited<T> | Awaited<U>)[] = [];
  let index = 0;

  const append = async (item: T): Promise<void> => {
    const awaited = await item;
    if (mapFn === undefined) {
      result.push(awaited);
    } else {
      result.push(await mapFn(awaited, index));
    }
    index += 1;
  };

  if (Symbol.asyncIterator in Object(source)) {
    for await (const item of source as AsyncIterable<T>) {
      await append(item);
    }
  } else if (Symbol.iterator in Object(source)) {
    for (const item of source as Iterable<T>) {
      await append(item);
    }
  } else {
    const arrayLike = source as ArrayLike<T>;
    const length = Math.trunc(arrayLike.length);
    for (let position = 0; position < length; position += 1) {
      await append(arrayLike[position] as T);
    }
  }
  return result;
}

export function objectGroupByImpl<T, K extends PropertyKey>(
  items: Iterable<T>,
  keySelector: (item: T, index: number) => K,
): Partial<Record<K, T[]>> {
  const result: Partial<Record<K, T[]>> = Object.create(null) as Partial<Record<K, T[]>>;
  let index = 0;
  for (const item of items) {
    const key = keySelector(item, index);
    index += 1;
    (result[key] ??= []).push(item);
  }
  return result;
}

export function mapGroupByImpl<T, K>(items: Iterable<T>, keySelector: (item: T, index: number) => K): Map<K, T[]> {
  const result = new Map<K, T[]>();
  let index = 0;
  for (const item of items) {
    const key = keySelector(item, index);
    index += 1;
    const group = result.get(key);
    if (group === undefined) {
      result.set(key, [item]);
    } else {
      group.push(item);
    }
  }
  return result;
}

interface ArrayCtorMaybeFromAsync {
  fromAsync?: typeof fromAsyncImpl;
  isArray(value: unknown): boolean;
}

interface ObjectCtorMaybeGroupBy {
  groupBy?: typeof objectGroupByImpl;
  keys(value: object): string[];
}

interface MapCtorMaybeGroupBy {
  groupBy?: typeof mapGroupByImpl;
  prototype: unknown;
}

export function installPolyfills(): void {
  const arrayCtor: ArrayCtorMaybeFromAsync = Array;
  if (typeof arrayCtor.fromAsync !== 'function') {
    arrayCtor.fromAsync = fromAsyncImpl;
  }
  const objectCtor: ObjectCtorMaybeGroupBy = Object;
  if (typeof objectCtor.groupBy !== 'function') {
    objectCtor.groupBy = objectGroupByImpl;
  }
  const mapCtor: MapCtorMaybeGroupBy = Map;
  if (typeof mapCtor.groupBy !== 'function') {
    mapCtor.groupBy = mapGroupByImpl;
  }
}
