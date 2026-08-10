/**
 * The challenge catalog is authored in TypeScript but served to the app from
 * db.json, so editing a challenge while the dev server runs leaves the API
 * serving the previous catalog. The API cannot pick the change up on its own —
 * it does not watch the file (see db:serve) — so the dev server announces the
 * edit and the app tells you to restart.
 */

/** Sent by the dev-server plugin when a challenge source file is edited. */
export interface CatalogStalePayload {
  file: string;
}

/** The slice of Vite's `import.meta.hot` this module needs; undefined in production builds. */
export interface HotLike {
  on: (event: string, callback: (payload: CatalogStalePayload) => void) => void;
}

export const CATALOG_STALE_EVENT = 'catalog:stale';

/** Calls `notify` with the edited file every time the dev server reports a catalog change. */
export function subscribeToCatalogStale(hot: HotLike | undefined, notify: (file: string) => void): void {
  hot?.on(CATALOG_STALE_EVENT, (payload) => notify(payload.file));
}
