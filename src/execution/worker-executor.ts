import type { ExecutionRequest, ExecutionResult, SolutionExecutor } from './executor';

/**
 * Browser-side executor that runs each submission in a fresh dedicated Web Worker
 * and hard-terminates it on timeout — the only reliable defense against
 * `while (true) {}` in user code. The worker factory is injected so tests can
 * substitute a fake; the default factory is only touched in a real browser.
 */

export interface WorkerLike {
  onerror: ((event: { message?: string }) => void) | null;
  onmessage: ((event: { data: ExecutionResult }) => void) | null;
  postMessage(request: ExecutionRequest): void;
  terminate(): void;
}

export type WorkerFactory = () => WorkerLike;

const TERMINATION_GRACE_MS = 500;

export function createSolutionWorker(): WorkerLike {
  const worker = new Worker(new URL('./solution-worker.ts', import.meta.url), { type: 'module' });
  const adapter: WorkerLike = {
    onerror: null,
    onmessage: null,
    postMessage: (request) => worker.postMessage(request),
    terminate: () => worker.terminate(),
  };
  worker.onmessage = (event: MessageEvent<ExecutionResult>) => adapter.onmessage?.(event);
  worker.onerror = (event) => adapter.onerror?.(event);
  return adapter;
}

export class WorkerExecutor implements SolutionExecutor {
  constructor(private readonly createWorker: WorkerFactory = createSolutionWorker) {}

  execute(request: ExecutionRequest): Promise<ExecutionResult> {
    return new Promise<ExecutionResult>((resolve) => {
      const worker = this.createWorker();
      let settled = false;

      const finish = (result: ExecutionResult): void => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        resolve(result);
      };

      const timer = setTimeout(() => {
        finish({
          cases: [],
          error: `Solution timed out after ${request.timeoutMs} ms — possible infinite loop.`,
          status: 'timeout',
        });
      }, request.timeoutMs + TERMINATION_GRACE_MS);

      worker.onmessage = (event) => finish(event.data);
      worker.onerror = (event) => {
        finish({ cases: [], error: event.message ?? 'Worker crashed.', status: 'code-error' });
      };
      worker.postMessage(request);
    });
  }
}
