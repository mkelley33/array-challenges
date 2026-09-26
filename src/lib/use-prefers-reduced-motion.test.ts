// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

interface FakeMediaQuery {
  change: (matches: boolean) => void;
}

function stubMatchMedia(initial: boolean): FakeMediaQuery {
  const listeners = new Set<() => void>();
  const media = {
    addEventListener: (_type: string, listener: () => void): void => {
      listeners.add(listener);
    },
    matches: initial,
    removeEventListener: (_type: string, listener: () => void): void => {
      listeners.delete(listener);
    },
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  );
  return {
    change: (matches) => {
      media.matches = matches;
      listeners.forEach((listener) => listener());
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('usePrefersReducedMotion', () => {
  it('reads the user agent preference', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('follows a change to the preference mid-session', () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => {
      media.change(true);
    });
    expect(result.current).toBe(true);
  });

  it('assumes motion is fine when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});
