// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';

import { tc } from '@/data/challenge-helpers';
import { DirectExecutor } from '@/execution/executor';
import { useRunSolution } from '@/execution/use-run-solution';

const tests = [tc('doubles', [2], 4)];

const passingSource = 'export function solve(n: number): number { return n * 2; }\n';
const failingSource = 'export function solve(n: number): number { return 0; }\n';

describe('useRunSolution', () => {
  it('starts idle with no report', () => {
    const { result } = renderHook(() => useRunSolution(new DirectExecutor()));
    expect(result.current.report).toBeNull();
    expect(result.current.running).toBe(false);
  });

  it('produces a passing report and reports it to the caller', async () => {
    const { result } = renderHook(() => useRunSolution(new DirectExecutor()));
    let returned: unknown;
    await act(async () => {
      returned = await result.current.run(passingSource, 'solve', tests);
    });
    await waitFor(() => {
      expect(result.current.running).toBe(false);
    });
    expect(result.current.report?.overall).toBe('passed');
    expect(returned).toBe(result.current.report);
  });

  it('produces a failing report for a wrong solution', async () => {
    const { result } = renderHook(() => useRunSolution(new DirectExecutor()));
    await act(async () => {
      await result.current.run(failingSource, 'solve', tests);
    });
    expect(result.current.report?.overall).toBe('failed');
    expect(result.current.report?.cases[0]?.status).toBe('fail');
  });

  it('clears the report on reset', async () => {
    const { result } = renderHook(() => useRunSolution(new DirectExecutor()));
    await act(async () => {
      await result.current.run(passingSource, 'solve', tests);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.report).toBeNull();
  });
});
