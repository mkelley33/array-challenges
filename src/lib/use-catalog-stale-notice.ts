import { useEffect } from 'react';
import { toast } from 'sonner';

import { subscribeToCatalogStale } from '@/lib/catalog-stale';

/**
 * Warns, in development only, that an edited challenge is not in the API yet.
 * The toast never auto-dismisses and reuses one id, so repeated edits keep a
 * single standing notice until the dev server is restarted.
 */
export function useCatalogStaleNotice(): void {
  useEffect(() => {
    subscribeToCatalogStale(import.meta.hot, (file) => {
      toast.warning('Challenge catalog changed', {
        description: `${file} was edited. Restart pnpm dev to rebuild db.json — the API is still serving the old tests.`,
        duration: Infinity,
        id: 'catalog-stale',
      });
    });
  }, []);
}
