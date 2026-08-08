import type { Category, Challenge, Submission } from '@/data/types';

const API_BASE = '/api';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${path} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchCategories(): Promise<Category[]> {
  return requestJson<Category[]>('/categories');
}

export function fetchChallenges(): Promise<Challenge[]> {
  return requestJson<Challenge[]>('/challenges');
}

export function fetchSubmissions(): Promise<Submission[]> {
  return requestJson<Submission[]>('/submissions');
}

/**
 * Upserts a submission. JSON Server has no native upsert, so this PUTs to the
 * submission's id (which equals its challengeId) and falls back to POST when
 * the resource does not exist yet.
 */
export async function saveSubmission(submission: Submission): Promise<Submission> {
  const body = JSON.stringify(submission);
  const headers = { 'Content-Type': 'application/json' };
  const putResponse = await fetch(`${API_BASE}/submissions/${submission.id}`, { body, headers, method: 'PUT' });
  if (putResponse.ok) {
    return (await putResponse.json()) as Submission;
  }
  if (putResponse.status !== 404) {
    throw new Error(`PUT /submissions/${submission.id} failed with status ${putResponse.status}`);
  }
  return requestJson<Submission>('/submissions', { body, headers, method: 'POST' });
}

/** Deletes a submission; a missing submission already satisfies the goal, so 404 counts as success. */
export async function clearSubmission(challengeId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/submissions/${challengeId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE /submissions/${challengeId} failed with status ${response.status}`);
  }
}
