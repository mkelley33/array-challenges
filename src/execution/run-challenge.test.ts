import { describe, expect, it } from 'vitest';

import { encode } from '@/lib/codec';

import type { TestCaseInput } from './executor';

import { DirectExecutor } from './executor';
import { runChallenge } from './run-challenge';

const DOUBLE_TESTS: TestCaseInput[] = [
  { args: [encode([1, 2])], expected: encode([2, 4]), name: 'doubles' },
  { args: [encode([])], expected: encode([]), name: 'empty' },
];

describe('runChallenge', () => {
  it('runs TypeScript source end to end and passes', async () => {
    const report = await runChallenge(
      new DirectExecutor(),
      'export function solve(xs: number[]): number[] { return xs.map((x) => x * 2); }',
      'solve',
      DOUBLE_TESTS,
    );
    expect(report.overall).toBe('passed');
    expect(report.cases).toHaveLength(2);
  });

  it('reports transpile-error with a message on syntax errors', async () => {
    const report = await runChallenge(new DirectExecutor(), 'export function solve( {', 'solve', DOUBLE_TESTS);
    expect(report.overall).toBe('transpile-error');
    expect(report.transpileError).toBeTruthy();
    expect(report.cases).toEqual([]);
  });

  it('reports failed when any case fails', async () => {
    const report = await runChallenge(
      new DirectExecutor(),
      'export function solve(xs: number[]): number[] { return xs.length === 0 ? [1] : xs.map((x) => x * 2); }',
      'solve',
      DOUBLE_TESTS,
    );
    expect(report.overall).toBe('failed');
  });

  it('propagates code-error status and message', async () => {
    const report = await runChallenge(new DirectExecutor(), 'export const wrongName = 1;', 'solve', DOUBLE_TESTS);
    expect(report.overall).toBe('code-error');
    expect(report.executionError).toContain('solve');
  });
});
