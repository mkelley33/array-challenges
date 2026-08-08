import type { Encoded } from '@/lib/codec';

import { decode, encode } from '@/lib/codec';
import { deepEqual } from '@/lib/deep-equal';

/**
 * Executes transpiled (CommonJS) solution code against encoded test cases.
 *
 * `DirectExecutor` runs in the current realm: inside the solution worker in the
 * browser (where the worker's hard `terminate()` handles runaway sync loops) and
 * directly in Vitest. Its own timeout only covers solutions that return promises
 * which never settle — a synchronous infinite loop cannot be interrupted in-process.
 */

export interface TestCaseInput {
  args: Encoded[];
  expected: Encoded;
  name: string;
}

export interface ExecutionRequest {
  code: string;
  fnName: string;
  tests: TestCaseInput[];
  timeoutMs: number;
}

export interface CaseResult {
  actual?: Encoded;
  error?: string;
  expected: Encoded;
  logs: string[];
  name: string;
  status: 'error' | 'fail' | 'pass';
}

export interface ExecutionResult {
  cases: CaseResult[];
  error?: string;
  status: 'code-error' | 'ok' | 'timeout';
}

export interface SolutionExecutor {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
}

type SolutionFn = (...args: unknown[]) => unknown;

interface CapturingConsole {
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
}

function formatLogArgument(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    const encoded = JSON.stringify(value);
    if (encoded !== undefined) {
      return encoded;
    }
  } catch {
    // fall through to String()
  }
  return String(value);
}

function toMessage(thrown: unknown): string {
  if (thrown instanceof Error) {
    return `${thrown.name}: ${thrown.message}`;
  }
  return String(thrown);
}

type RaceOutcome<T> = { timedOut: false; value: T } | { timedOut: true };

async function raceWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<RaceOutcome<T>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<RaceOutcome<T>>((resolve) => {
    timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
  });
  try {
    return await Promise.race([promise.then((value): RaceOutcome<T> => ({ timedOut: false, value })), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export class DirectExecutor implements SolutionExecutor {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    let currentLogs: string[] = [];
    const capture = (...args: unknown[]): void => {
      currentLogs.push(args.map((arg) => formatLogArgument(arg)).join(' '));
    };
    const sandboxConsole: CapturingConsole = { error: capture, info: capture, log: capture, warn: capture };
    const requireStub = (): never => {
      throw new Error('Imports are not available inside challenge solutions.');
    };

    const moduleObject: { exports: Record<string, unknown> } = { exports: {} };
    try {
      const factory = new Function('module', 'exports', 'console', 'require', request.code) as (
        moduleArg: typeof moduleObject,
        exportsArg: Record<string, unknown>,
        consoleArg: CapturingConsole,
        requireArg: () => never,
      ) => void;
      factory(moduleObject, moduleObject.exports, sandboxConsole, requireStub);
    } catch (thrown) {
      return { cases: [], error: toMessage(thrown), status: 'code-error' };
    }

    const candidate = moduleObject.exports[request.fnName];
    if (typeof candidate !== 'function') {
      return {
        cases: [],
        error: `Solution must export a function named "${request.fnName}".`,
        status: 'code-error',
      };
    }
    const solution = candidate as SolutionFn;

    const cases: CaseResult[] = [];
    for (const test of request.tests) {
      currentLogs = [];
      const logs = currentLogs;
      try {
        const args = test.args.map((arg) => decode(arg));
        const outcome = await raceWithTimeout(Promise.resolve(solution(...args)), request.timeoutMs);
        if (outcome.timedOut) {
          return {
            cases,
            error: `Test "${test.name}" timed out after ${request.timeoutMs} ms.`,
            status: 'timeout',
          };
        }
        const actual = encode(outcome.value);
        cases.push({
          actual,
          expected: test.expected,
          logs,
          name: test.name,
          status: deepEqual(outcome.value, decode(test.expected)) ? 'pass' : 'fail',
        });
      } catch (thrown) {
        cases.push({
          error: toMessage(thrown),
          expected: test.expected,
          logs,
          name: test.name,
          status: 'error',
        });
      }
    }
    return { cases, status: 'ok' };
  }
}
