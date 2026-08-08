import { describe, expect, it } from 'vitest';

import { transpileTs } from './transpile';

describe('transpileTs', () => {
  it('strips types from a typed function', () => {
    const result = transpileTs('export function solve(xs: number[]): number { return xs.length; }');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.code).not.toContain('number[]');
      expect(result.code).toContain('function solve');
    }
  });

  it('emits CJS so exports land on the exports object', () => {
    const result = transpileTs('export function solve(): number { return 1; }');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.code).toContain('exports.solve');
    }
  });

  it('supports interfaces, generics, and const assertions', () => {
    const source = [
      'interface Point { x: number; y: number }',
      'const origin = { x: 0, y: 0 } as const;',
      'export function solve<T extends Point>(points: T[]): number {',
      '  return points.length + origin.x;',
      '}',
    ].join('\n');
    const result = transpileTs(source);
    expect(result.ok).toBe(true);
  });

  it('reports syntax errors with a line number', () => {
    const result = transpileTs('export function solve( {');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.line).toBeGreaterThanOrEqual(1);
    }
  });

  it('does not treat type errors as failures (types are erased, not checked)', () => {
    const result = transpileTs('export function solve(): number { return "not a number" as never; }');
    expect(result.ok).toBe(true);
  });
});
