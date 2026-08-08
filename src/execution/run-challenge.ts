import { transpileTs } from '@/lib/transpile';

import type { CaseResult, SolutionExecutor, TestCaseInput } from './executor';

/**
 * Orchestrates a full solution run: transpile once, execute every test case,
 * and fold the executor status plus per-case verdicts into a single report.
 */

export type RunOverall = 'code-error' | 'failed' | 'passed' | 'timeout' | 'transpile-error';

export interface RunReport {
  cases: CaseResult[];
  executionError?: string;
  overall: RunOverall;
  transpileError?: string;
}

export const DEFAULT_TIMEOUT_MS = 3000;

export async function runChallenge(
  executor: SolutionExecutor,
  userSource: string,
  fnName: string,
  tests: TestCaseInput[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<RunReport> {
  const transpiled = transpileTs(userSource);
  if (!transpiled.ok) {
    const location = transpiled.line === undefined ? '' : ` (line ${transpiled.line})`;
    return { cases: [], overall: 'transpile-error', transpileError: `${transpiled.message}${location}` };
  }

  const result = await executor.execute({ code: transpiled.code, fnName, tests, timeoutMs });
  if (result.status === 'code-error') {
    return { cases: result.cases, executionError: result.error, overall: 'code-error' };
  }
  if (result.status === 'timeout') {
    return { cases: result.cases, executionError: result.error, overall: 'timeout' };
  }
  const allPassed = result.cases.length > 0 && result.cases.every((caseResult) => caseResult.status === 'pass');
  return { cases: result.cases, overall: allPassed ? 'passed' : 'failed' };
}
