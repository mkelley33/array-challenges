import { describe, expect, it } from 'vitest';

import { formatValue } from '@/lib/format-value';

describe('formatValue', () => {
  it('formats primitives the way a REPL would', () => {
    expect(formatValue(42)).toBe('42');
    expect(formatValue('hi')).toBe("'hi'");
    expect(formatValue(true)).toBe('true');
    expect(formatValue(null)).toBe('null');
    expect(formatValue(undefined)).toBe('undefined');
  });

  it('formats the numeric oddballs JSON cannot express', () => {
    expect(formatValue(Number.NaN)).toBe('NaN');
    expect(formatValue(Infinity)).toBe('Infinity');
    expect(formatValue(-Infinity)).toBe('-Infinity');
    expect(formatValue(-0)).toBe('-0');
    expect(formatValue(0)).toBe('0');
  });

  it('formats arrays and nested arrays', () => {
    expect(formatValue([1, 2, 3])).toBe('[1, 2, 3]');
    expect(formatValue([])).toBe('[]');
    expect(
      formatValue([
        [1, 0],
        [0, 1],
      ]),
    ).toBe('[[1, 0], [0, 1]]');
    expect(formatValue([undefined, 'a'])).toBe("[undefined, 'a']");
  });

  it('formats plain objects with their keys', () => {
    expect(formatValue({ a: 1, b: 'two' })).toBe("{ a: 1, b: 'two' }");
    expect(formatValue({})).toBe('{}');
  });

  it('formats Maps, Sets, and Dates explicitly', () => {
    expect(
      formatValue(
        new Map<string, number>([
          ['a', 1],
          ['b', 2],
        ]),
      ),
    ).toBe("Map { 'a' => 1, 'b' => 2 }");
    expect(formatValue(new Set([1, 2]))).toBe('Set { 1, 2 }');
    expect(formatValue(new Map())).toBe('Map {}');
    expect(formatValue(new Set())).toBe('Set {}');
    expect(formatValue(new Date('2026-08-08T00:00:00.000Z'))).toBe('Date(2026-08-08T00:00:00.000Z)');
  });
});
