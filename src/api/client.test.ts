import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Submission } from '@/data/types';

import { clearSubmission, fetchCategories, fetchChallenges, fetchSubmissions, saveSubmission } from '@/api/client';

interface RecordedCall {
  body: unknown;
  method: string;
  url: string;
}

function stubFetch(responder: (url: string, init?: RequestInit) => { body?: unknown; status: number }): RecordedCall[] {
  const calls: RecordedCall[] = [];
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      method: init?.method ?? 'GET',
      url,
    });
    const { body, status } = responder(url, init);
    return Promise.resolve(
      new Response(body === undefined ? null : JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
        status,
      }),
    );
  });
  return calls;
}

const submission: Submission = {
  challengeId: 'range-of-numbers',
  code: 'export function solve(): number[] { return []; }',
  id: 'range-of-numbers',
  status: 'failed',
  updatedAt: '2026-08-08T12:00:00.000Z',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetch helpers', () => {
  it('fetches categories, challenges, and submissions from /api', async () => {
    const calls = stubFetch(() => ({ body: [], status: 200 }));
    await fetchCategories();
    await fetchChallenges();
    await fetchSubmissions();
    expect(calls.map((call) => call.url)).toEqual(['/api/categories', '/api/challenges', '/api/submissions']);
    expect(calls.every((call) => call.method === 'GET')).toBe(true);
  });

  it('throws a descriptive error on a non-ok response', async () => {
    stubFetch(() => ({ status: 500 }));
    await expect(fetchChallenges()).rejects.toThrow(/500/);
  });
});

describe('saveSubmission upsert', () => {
  it('updates via PUT when the submission already exists', async () => {
    const calls = stubFetch(() => ({ body: submission, status: 200 }));
    const saved = await saveSubmission(submission);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ method: 'PUT', url: '/api/submissions/range-of-numbers' });
    expect(saved).toEqual(submission);
  });

  it('falls back to POST when the PUT target does not exist', async () => {
    const calls = stubFetch((_url, init) =>
      init?.method === 'PUT' ? { status: 404 } : { body: submission, status: 201 },
    );
    const saved = await saveSubmission(submission);
    expect(calls.map((call) => [call.method, call.url])).toEqual([
      ['PUT', '/api/submissions/range-of-numbers'],
      ['POST', '/api/submissions'],
    ]);
    expect(calls[1]?.body).toEqual(submission);
    expect(saved).toEqual(submission);
  });
});

describe('clearSubmission', () => {
  it('deletes the submission by challenge id', async () => {
    const calls = stubFetch(() => ({ status: 200 }));
    await clearSubmission('range-of-numbers');
    expect(calls[0]).toMatchObject({ method: 'DELETE', url: '/api/submissions/range-of-numbers' });
  });

  it('treats deleting a missing submission as success', async () => {
    stubFetch(() => ({ status: 404 }));
    await expect(clearSubmission('ghost')).resolves.toBeUndefined();
  });
});
