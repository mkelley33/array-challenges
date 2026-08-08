// @vitest-environment jsdom
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Submission } from '@/data/types';

import { useChallenges, useSaveSubmission, useSubmissions } from '@/api/hooks';

const submission: Submission = {
  challengeId: 'range-of-numbers',
  code: 'export function solve(): number[] { return []; }',
  id: 'range-of-numbers',
  status: 'passed',
  updatedAt: '2026-08-08T12:00:00.000Z',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status });
}

function createWrapper(): { queryClient: QueryClient; wrapper: (props: { children: ReactNode }) => ReactNode } {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function wrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, wrapper };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('query hooks', () => {
  it('useChallenges loads challenges from the api', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse([{ id: 'range-of-numbers' }]))),
    );
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useChallenges(), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual([{ id: 'range-of-numbers' }]);
  });

  it('useSaveSubmission invalidates the submissions query on success', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        return Promise.resolve(jsonResponse(submission));
      }
      expect(String(input)).toBe('/api/submissions');
      return Promise.resolve(jsonResponse([submission]));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { queryClient, wrapper } = createWrapper();

    const submissionsHook = renderHook(() => useSubmissions(), { wrapper });
    await waitFor(() => {
      expect(submissionsHook.result.current.isSuccess).toBe(true);
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const saveHook = renderHook(() => useSaveSubmission(), { wrapper });
    saveHook.result.current.mutate(submission);
    await waitFor(() => {
      expect(saveHook.result.current.isSuccess).toBe(true);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['submissions'] });
  });
});
