import { describe, expect, it } from 'vitest';

import { CodecError, decode, encode } from './codec';

function roundTrip(value: unknown): unknown {
  return decode(JSON.parse(JSON.stringify(encode(value))) as ReturnType<typeof encode>);
}

describe('encode/decode round-trips', () => {
  it('preserves JSON primitives', () => {
    expect(roundTrip(null)).toBeNull();
    expect(roundTrip(true)).toBe(true);
    expect(roundTrip(42)).toBe(42);
    expect(roundTrip('hello')).toBe('hello');
    expect(roundTrip(0)).toBe(0);
  });

  it('preserves nested arrays and plain objects', () => {
    const value = { a: [1, 2, [3, { b: 'c' }]], d: { e: [true, null] } };
    expect(roundTrip(value)).toEqual(value);
  });

  it('preserves undefined at top level, in arrays, and as object values', () => {
    expect(roundTrip(undefined)).toBeUndefined();
    expect(roundTrip([1, undefined, 3])).toEqual([1, undefined, 3]);
    const result = roundTrip({ a: undefined }) as Record<string, unknown>;
    expect('a' in result).toBe(true);
    expect(result['a']).toBeUndefined();
  });

  it('preserves NaN, Infinity, -Infinity, and -0', () => {
    expect(roundTrip(NaN)).toBeNaN();
    expect(roundTrip(Infinity)).toBe(Infinity);
    expect(roundTrip(-Infinity)).toBe(-Infinity);
    expect(Object.is(roundTrip(-0), -0)).toBe(true);
    expect(Object.is(roundTrip(0), 0)).toBe(true);
  });

  it('preserves Dates by epoch', () => {
    const date = new Date('2026-08-08T12:34:56.789Z');
    const result = roundTrip(date);
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getTime()).toBe(date.getTime());
  });

  it('preserves Maps, including non-string and structured keys', () => {
    const map = new Map<unknown, unknown>([
      [1, 'one'],
      ['two', 2],
      [{ k: 'obj' }, [3]],
    ]);
    const result = roundTrip(map) as Map<unknown, unknown>;
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(3);
    expect(result.get(1)).toBe('one');
    expect(result.get('two')).toBe(2);
    expect([...result.keys()].some((key) => typeof key === 'object')).toBe(true);
  });

  it('preserves Sets', () => {
    const set = new Set([1, 'a', null]);
    const result = roundTrip(set) as Set<unknown>;
    expect(result).toBeInstanceOf(Set);
    expect([...result]).toEqual([1, 'a', null]);
  });

  it('escapes plain objects that contain a literal $t key', () => {
    const tricky = { $t: 'map', v: 'not really' };
    expect(roundTrip(tricky)).toEqual(tricky);
  });

  it('acts as a deep clone: decoded structures are fresh objects', () => {
    const original = { list: [1, 2, 3] };
    const clone = decode(encode(original)) as typeof original;
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.list).not.toBe(original.list);
  });
});

describe('unsupported values', () => {
  it('throws CodecError on functions', () => {
    expect(() => encode(() => 1)).toThrow(CodecError);
  });

  it('throws CodecError on symbols and bigints', () => {
    expect(() => encode(Symbol('nope'))).toThrow(CodecError);
    expect(() => encode(10n)).toThrow(CodecError);
  });

  it('throws CodecError on class instances', () => {
    class Widget {
      size = 1;
    }
    expect(() => encode(new Widget())).toThrow(CodecError);
  });
});
