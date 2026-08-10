import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Submission, UnsavedSubmission } from '@/data/types';

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

/**
 * Stateful stub mirroring json-server 1.0.0-beta semantics, verified against
 * the real server: POST ignores any client id and assigns its own, PUT and
 * DELETE address rows only by that server id (404 otherwise), and GET
 * supports `?challengeId=` filtering.
 */
function stubJsonServer(rows: Submission[]): RecordedCall[] {
  let nextId = 1;
  const calls: RecordedCall[] = [];
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : undefined;
    calls.push({ body, method, url });

    const respond = (status: number, payload?: unknown): Promise<Response> =>
      Promise.resolve(
        new Response(payload === undefined ? null : JSON.stringify(payload), {
          headers: { 'Content-Type': 'application/json' },
          status,
        }),
      );

    if (method === 'GET') {
      const challengeId = new URLSearchParams(url.split('?')[1] ?? '').get('challengeId');
      return respond(200, challengeId === null ? rows : rows.filter((row) => row.challengeId === challengeId));
    }
    if (method === 'POST') {
      const created = { ...body, id: `srv-${nextId}` } as Submission;
      nextId += 1;
      rows.push(created);
      return respond(201, created);
    }
    const rowId = url.slice(url.lastIndexOf('/') + 1);
    const index = rows.findIndex((row) => row.id === rowId);
    if (index === -1) {
      return respond(404);
    }
    if (method === 'PUT') {
      const updated = { ...body, id: rowId } as Submission;
      rows[index] = updated;
      return respond(200, updated);
    }
    const [removed] = rows.splice(index, 1);
    return respond(200, removed);
  });
  return calls;
}

function makeRow(id: string, overrides: Partial<Submission> = {}): Submission {
  return {
    challengeId: 'range-of-numbers',
    code: 'export function solve(): number[] { return []; }',
    id,
    status: 'failed',
    updatedAt: '2026-08-08T12:00:00.000Z',
    ...overrides,
  };
}

const draft: UnsavedSubmission = {
  challengeId: 'range-of-numbers',
  code: 'export function solve(): number[] { return [1]; }',
  status: 'failed',
  updatedAt: '2026-08-08T13:00:00.000Z',
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
  it('creates via POST when no submission exists for the challenge', async () => {
    const rows: Submission[] = [];
    const calls = stubJsonServer(rows);
    const saved = await saveSubmission(draft);
    expect(calls.map((call) => [call.method, call.url])).toEqual([
      ['GET', '/api/submissions?challengeId=range-of-numbers'],
      ['POST', '/api/submissions'],
    ]);
    expect(saved).toEqual({ ...draft, id: 'srv-1' });
    expect(rows).toHaveLength(1);
  });

  it('updates the existing row via PUT to its server-assigned id', async () => {
    const rows = [makeRow('srv-9')];
    const calls = stubJsonServer(rows);
    const saved = await saveSubmission(draft);
    expect(calls.map((call) => [call.method, call.url])).toEqual([
      ['GET', '/api/submissions?challengeId=range-of-numbers'],
      ['PUT', '/api/submissions/srv-9'],
    ]);
    expect(saved).toEqual({ ...draft, id: 'srv-9' });
    expect(rows).toEqual([{ ...draft, id: 'srv-9' }]);
  });

  it('removes duplicate rows left for the challenge by earlier saves', async () => {
    const rows = [makeRow('srv-1'), makeRow('srv-2'), makeRow('srv-3', { challengeId: 'other-challenge' })];
    stubJsonServer(rows);
    await saveSubmission(draft);
    expect(rows).toEqual([{ ...draft, id: 'srv-1' }, makeRow('srv-3', { challengeId: 'other-challenge' })]);
  });

  it('propagates a failed lookup instead of saving blind', async () => {
    stubFetch(() => ({ status: 500 }));
    await expect(saveSubmission(draft)).rejects.toThrow(/500/);
  });
});

describe('clearSubmission', () => {
  it('deletes every row stored for the challenge', async () => {
    const rows = [makeRow('srv-1'), makeRow('srv-2'), makeRow('srv-3', { challengeId: 'other-challenge' })];
    const calls = stubJsonServer(rows);
    await clearSubmission('range-of-numbers');
    expect(calls.filter((call) => call.method === 'DELETE').map((call) => call.url)).toEqual([
      '/api/submissions/srv-1',
      '/api/submissions/srv-2',
    ]);
    expect(rows).toEqual([makeRow('srv-3', { challengeId: 'other-challenge' })]);
  });

  it('is a no-op when the challenge has no submission', async () => {
    const rows: Submission[] = [];
    const calls = stubJsonServer(rows);
    await expect(clearSubmission('ghost')).resolves.toBeUndefined();
    expect(calls.filter((call) => call.method === 'DELETE')).toHaveLength(0);
  });
});
