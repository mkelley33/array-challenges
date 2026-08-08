import { describe, expect, it } from 'vitest';

import type { ExecutionRequest, ExecutionResult } from './executor';
import type { WorkerLike } from './worker-executor';

import { WorkerExecutor } from './worker-executor';

const REQUEST: ExecutionRequest = {
  code: 'exports.solve = () => 1;',
  fnName: 'solve',
  tests: [{ args: [], expected: 1, name: 'one' }],
  timeoutMs: 40,
};

class FakeWorker implements WorkerLike {
  onmessage: ((event: { data: ExecutionResult }) => void) | null = null;
  onerror: ((event: { message?: string }) => void) | null = null;
  terminated = false;
  constructor(private readonly behavior: 'crash' | 'reply' | 'silent') {}

  postMessage(request: ExecutionRequest): void {
    if (this.behavior === 'reply') {
      queueMicrotask(() => {
        this.onmessage?.({ data: { cases: [], status: 'ok' } });
      });
    } else if (this.behavior === 'crash') {
      queueMicrotask(() => {
        this.onerror?.({ message: `worker exploded on ${request.fnName}` });
      });
    }
  }

  terminate(): void {
    this.terminated = true;
  }
}

describe('WorkerExecutor', () => {
  it('resolves with the worker reply and terminates the worker', async () => {
    const worker = new FakeWorker('reply');
    const executor = new WorkerExecutor(() => worker);
    const result = await executor.execute(REQUEST);
    expect(result.status).toBe('ok');
    expect(worker.terminated).toBe(true);
  });

  it('returns timeout and terminates when the worker never replies', async () => {
    const worker = new FakeWorker('silent');
    const executor = new WorkerExecutor(() => worker);
    const result = await executor.execute(REQUEST);
    expect(result.status).toBe('timeout');
    expect(worker.terminated).toBe(true);
  });

  it('maps worker crashes to code-error', async () => {
    const worker = new FakeWorker('crash');
    const executor = new WorkerExecutor(() => worker);
    const result = await executor.execute(REQUEST);
    expect(result.status).toBe('code-error');
    expect(result.error).toContain('worker exploded');
    expect(worker.terminated).toBe(true);
  });
});
