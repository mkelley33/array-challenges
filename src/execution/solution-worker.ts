import { installPolyfills } from '@/lib/polyfills';

import type { ExecutionRequest } from './executor';

import { DirectExecutor } from './executor';

/**
 * Dedicated worker entry: evaluates one submission per worker instance.
 * Polyfills are installed so user solutions can rely on the same array APIs
 * available in the main thread and in Vitest.
 */

installPolyfills();

const executor = new DirectExecutor();

self.onmessage = (event: MessageEvent<ExecutionRequest>): void => {
  void executor.execute(event.data).then((result) => {
    self.postMessage(result);
  });
};
