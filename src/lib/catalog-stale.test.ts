import { describe, expect, it, vi } from 'vitest';

import type { CatalogStalePayload, HotLike } from '@/lib/catalog-stale';

import { CATALOG_STALE_EVENT, subscribeToCatalogStale } from '@/lib/catalog-stale';

function fakeHot(): { emit: (payload: CatalogStalePayload) => void; hot: HotLike } {
  const handlers: ((payload: CatalogStalePayload) => void)[] = [];
  return {
    emit: (payload) => handlers.forEach((handler) => handler(payload)),
    hot: {
      on: (event, callback) => {
        if (event === CATALOG_STALE_EVENT) {
          handlers.push(callback);
        }
      },
    },
  };
}

describe('subscribeToCatalogStale', () => {
  it('reports the file that changed when the dev server signals a stale catalog', () => {
    const notify = vi.fn();
    const { emit, hot } = fakeHot();
    subscribeToCatalogStale(hot, notify);
    emit({ file: 'src/data/challenges/creating-arrays.ts' });
    expect(notify).toHaveBeenCalledExactlyOnceWith('src/data/challenges/creating-arrays.ts');
  });

  it('reports every subsequent change, not just the first', () => {
    const notify = vi.fn();
    const { emit, hot } = fakeHot();
    subscribeToCatalogStale(hot, notify);
    emit({ file: 'a.ts' });
    emit({ file: 'b.ts' });
    expect(notify.mock.calls).toEqual([['a.ts'], ['b.ts']]);
  });

  it('does nothing in a production build, where there is no dev-server channel', () => {
    const notify = vi.fn();
    expect(() => subscribeToCatalogStale(undefined, notify)).not.toThrow();
    expect(notify).not.toHaveBeenCalled();
  });

  it('ignores unrelated dev-server events', () => {
    const notify = vi.fn();
    const handlers: Record<string, (payload: CatalogStalePayload) => void> = {};
    const hot: HotLike = {
      on: (event, callback) => {
        handlers[event] = callback;
      },
    };
    subscribeToCatalogStale(hot, notify);
    handlers['vite:beforeUpdate']?.({ file: 'nope.ts' });
    expect(notify).not.toHaveBeenCalled();
  });
});
