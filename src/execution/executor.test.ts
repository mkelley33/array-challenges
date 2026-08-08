import { describe, expect, it } from 'vitest';

import { encode } from '@/lib/codec';

import type { ExecutionRequest, TestCaseInput } from './executor';

import { DirectExecutor } from './executor';

function makeCase(name: string, args: unknown[], expected: unknown): TestCaseInput {
  return { args: args.map((arg) => encode(arg)), expected: encode(expected), name };
}

function makeRequest(code: string, tests: TestCaseInput[], overrides?: Partial<ExecutionRequest>): ExecutionRequest {
  return { code, fnName: 'solve', tests, timeoutMs: 2000, ...overrides };
}

describe('DirectExecutor', () => {
  it('passes when the solution returns deep-equal values', async () => {
    const executor = new DirectExecutor();
    const result = await executor.execute(
      makeRequest('exports.solve = (xs) => xs.map((x) => x * 2);', [
        makeCase('doubles', [[1, 2, 3]], [2, 4, 6]),
        makeCase('empty', [[]], []),
      ]),
    );
    expect(result.status).toBe('ok');
    expect(result.cases.map((c) => c.status)).toEqual(['pass', 'pass']);
  });

  it('captures the actual value on failure', async () => {
    const executor = new DirectExecutor();
    const result = await executor.execute(
      makeRequest('exports.solve = (xs) => xs;', [makeCase('should double', [[1]], [2])]),
    );
    expect(result.status).toBe('ok');
    expect(result.cases[0]?.status).toBe('fail');
    expect(result.cases[0]?.actual).toEqual(encode([1]));
  });

  it('reports a case-level error when the solution throws', async () => {
    const executor = new DirectExecutor();
    const result = await executor.execute(
      makeRequest('exports.solve = () => { throw new Error("boom"); };', [makeCase('throws', [[]], [])]),
    );
    expect(result.status).toBe('ok');
    expect(result.cases[0]?.status).toBe('error');
    expect(result.cases[0]?.error).toContain('boom');
  });

  it('reports code-error when the expected export is missing', async () => {
    const executor = new DirectExecutor();
    const result = await executor.execute(makeRequest('exports.other = 1;', [makeCase('noop', [[]], [])]));
    expect(result.status).toBe('code-error');
    expect(result.error).toContain('solve');
  });

  it('reports code-error when module evaluation throws', async () => {
    const executor = new DirectExecutor();
    const result = await executor.execute(makeRequest('throw new Error("bad module");', [makeCase('x', [[]], [])]));
    expect(result.status).toBe('code-error');
    expect(result.error).toContain('bad module');
  });

  it('supports async solutions', async () => {
    const executor = new DirectExecutor();
    const result = await executor.execute(
      makeRequest('exports.solve = async (xs) => xs.length;', [makeCase('len', [[1, 2]], 2)]),
    );
    expect(result.cases[0]?.status).toBe('pass');
  });

  it('captures console output per test case', async () => {
    const executor = new DirectExecutor();
    const result = await executor.execute(
      makeRequest('exports.solve = (xs) => { console.log("seen", xs.length); return xs; };', [
        makeCase('first', [[1]], [1]),
        makeCase('second', [[1, 2]], [1, 2]),
      ]),
    );
    expect(result.cases[0]?.logs).toEqual(['seen 1']);
    expect(result.cases[1]?.logs).toEqual(['seen 2']);
  });

  it('isolates argument mutation between cases', async () => {
    const shared = [3, 1, 2];
    const sortCase = makeCase('first sort', [shared], [1, 2, 3]);
    const secondCase = { ...makeCase('same fixture again', [shared], [1, 2, 3]), args: sortCase.args };
    const executor = new DirectExecutor();
    const result = await executor.execute(
      makeRequest('exports.solve = (xs) => { xs.sort((a, b) => a - b); return xs; };', [sortCase, secondCase]),
    );
    expect(result.cases.map((c) => c.status)).toEqual(['pass', 'pass']);
    expect(sortCase.args).toEqual([encode([3, 1, 2])]);
  });

  it('times out a hung async solution', async () => {
    const executor = new DirectExecutor();
    const result = await executor.execute(
      makeRequest('exports.solve = () => new Promise(() => {});', [makeCase('hangs', [[]], [])], { timeoutMs: 50 }),
    );
    expect(result.status).toBe('timeout');
  });

  it('encodes Map results from grouping solutions', async () => {
    const executor = new DirectExecutor();
    const expected = new Map<string, number[]>([
      ['odd', [1, 3]],
      ['even', [2]],
    ]);
    const result = await executor.execute(
      makeRequest('exports.solve = (xs) => Map.groupBy(xs, (x) => (x % 2 ? "odd" : "even"));', [
        makeCase('groups', [[1, 2, 3]], expected),
      ]),
    );
    expect(result.cases[0]?.status).toBe('pass');
  });
});
