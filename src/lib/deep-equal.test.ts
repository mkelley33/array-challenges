import { describe, expect, it } from 'vitest';

import { deepEqual } from './deep-equal';

describe('primitives', () => {
  it('compares primitives with Object.is semantics, except NaN equals NaN', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it('distinguishes +0 from -0', () => {
    expect(deepEqual(0, -0)).toBe(false);
    expect(deepEqual(-0, -0)).toBe(true);
  });

  it('never coerces across types', () => {
    expect(deepEqual(1, '1')).toBe(false);
    expect(deepEqual(0, false)).toBe(false);
    expect(deepEqual([], '')).toBe(false);
  });
});

describe('arrays and objects', () => {
  it('compares arrays elementwise including length', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(deepEqual([1, [2, [3]]], [1, [2, [3]]])).toBe(true);
    expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
  });

  it('compares plain objects by key set and values', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(deepEqual({ a: { b: [1] } }, { a: { b: [1] } })).toBe(true);
  });

  it('treats a hole and an explicit undefined element as equal', () => {
    const sparse = new Array<number | undefined>(3);
    expect(deepEqual(sparse, [undefined, undefined, undefined])).toBe(true);
  });

  it('is cycle-safe', () => {
    interface Node {
      next?: Node;
    }
    const a: Node = {};
    a.next = a;
    const b: Node = {};
    b.next = b;
    expect(deepEqual(a, b)).toBe(true);
  });
});

describe('Map, Set, Date', () => {
  it('compares Maps order-insensitively with deep keys', () => {
    const a = new Map<unknown, unknown>([
      [{ id: 1 }, ['x']],
      ['k', 2],
    ]);
    const b = new Map<unknown, unknown>([
      ['k', 2],
      [{ id: 1 }, ['x']],
    ]);
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, new Map([['k', 2]]))).toBe(false);
    expect(deepEqual(new Map([['k', 1]]), new Map([['k', 2]]))).toBe(false);
  });

  it('compares Sets order-insensitively with deep membership', () => {
    expect(deepEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(deepEqual(new Set([{ a: 1 }]), new Set([{ a: 1 }]))).toBe(true);
    expect(deepEqual(new Set([1]), new Set([1, 2]))).toBe(false);
  });

  it('does not double-match Map/Set members', () => {
    expect(deepEqual(new Set([{ a: 1 }, { a: 2 }]), new Set([{ a: 1 }, { a: 1 }]))).toBe(false);
  });

  it('compares Dates by epoch and not to other types', () => {
    expect(deepEqual(new Date(1000), new Date(1000))).toBe(true);
    expect(deepEqual(new Date(1000), new Date(2000))).toBe(false);
    expect(deepEqual(new Date(1000), 1000)).toBe(false);
  });

  it('distinguishes Map from plain object and Set from array', () => {
    expect(deepEqual(new Map(), {})).toBe(false);
    expect(deepEqual(new Set(), [])).toBe(false);
  });
});
