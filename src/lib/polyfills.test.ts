import { describe, expect, it } from 'vitest';

import { fromAsyncImpl, installPolyfills, mapGroupByImpl, objectGroupByImpl } from './polyfills';

describe('fromAsyncImpl', () => {
  it('collects an async iterable into an array', async () => {
    async function* generate(): AsyncGenerator<number> {
      yield 1;
      yield 2;
      yield 3;
    }
    await expect(fromAsyncImpl(generate())).resolves.toEqual([1, 2, 3]);
  });

  it('collects a sync iterable of promises, awaiting each', async () => {
    await expect(fromAsyncImpl([Promise.resolve('a'), Promise.resolve('b')])).resolves.toEqual(['a', 'b']);
  });

  it('applies the map function with index', async () => {
    await expect(fromAsyncImpl([10, 20], (value, index) => value + index)).resolves.toEqual([10, 21]);
  });

  it('collects array-like objects', async () => {
    await expect(fromAsyncImpl({ length: 2, 0: 'x', 1: 'y' })).resolves.toEqual(['x', 'y']);
  });
});

describe('objectGroupByImpl', () => {
  it('groups items by string key into a null-prototype object', () => {
    const result = objectGroupByImpl([1, 2, 3, 4], (value) => (value % 2 === 0 ? 'even' : 'odd'));
    expect(Object.getPrototypeOf(result)).toBeNull();
    expect(result['odd']).toEqual([1, 3]);
    expect(result['even']).toEqual([2, 4]);
  });

  it('coerces non-string keys via property-key rules', () => {
    const result = objectGroupByImpl([1.5, 2.5], (value) => Math.floor(value));
    expect(result[1]).toEqual([1.5]);
    expect(result[2]).toEqual([2.5]);
    expect(Object.keys(result)).toEqual(['1', '2']);
  });

  it('passes the index to the key selector', () => {
    const result = objectGroupByImpl(['a', 'b', 'c'], (_value, index) => (index < 2 ? 'head' : 'tail'));
    expect(result['head']).toEqual(['a', 'b']);
    expect(result['tail']).toEqual(['c']);
  });
});

describe('mapGroupByImpl', () => {
  it('groups by arbitrary keys without coercion', () => {
    const keyA = { team: 'a' };
    const keyB = { team: 'b' };
    const result = mapGroupByImpl([1, 2, 3], (value) => (value < 3 ? keyA : keyB));
    expect(result.get(keyA)).toEqual([1, 2]);
    expect(result.get(keyB)).toEqual([3]);
  });

  it('uses SameValueZero for keys: NaN groups together, -0 collapses with +0', () => {
    const result = mapGroupByImpl([1, 2], () => NaN);
    expect(result.size).toBe(1);
    const zeros = mapGroupByImpl([-1, 1], (value) => (value < 0 ? -0 : 0));
    expect(zeros.size).toBe(1);
  });
});

describe('installPolyfills', () => {
  it('is idempotent and leaves native ES2024 methods in place on Node 24', () => {
    const arrayCtor: { fromAsync?: unknown; isArray(value: unknown): boolean } = Array;
    const nativeFromAsync = arrayCtor.fromAsync;
    const nativeObjectGroupBy = Object.groupBy;
    const nativeMapGroupBy = Map.groupBy;
    expect(typeof nativeFromAsync).toBe('function');
    installPolyfills();
    installPolyfills();
    expect(arrayCtor.fromAsync).toBe(nativeFromAsync);
    expect(Object.groupBy).toBe(nativeObjectGroupBy);
    expect(Map.groupBy).toBe(nativeMapGroupBy);
  });
});
