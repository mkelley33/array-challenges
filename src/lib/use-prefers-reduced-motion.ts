import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** `matchMedia` is missing in jsdom and some embedded webviews; without it, assume motion is acceptable. */
function getMediaQuery(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : null;
}

function subscribe(onChange: () => void): () => void {
  const media = getMediaQuery();
  media?.addEventListener('change', onChange);
  return () => {
    media?.removeEventListener('change', onChange);
  };
}

function getSnapshot(): boolean {
  return getMediaQuery()?.matches ?? false;
}

/** Live `prefers-reduced-motion`, so toggling the OS setting takes effect without a reload. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}
