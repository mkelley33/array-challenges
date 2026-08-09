import type { Category, Challenge, Submission, UnsavedSubmission } from '@/data/types';

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

function fetchSubmissionsForChallenge(challengeId: string): Promise<Submission[]> {
  return requestJson<Submission[]>(`/submissions?challengeId=${encodeURIComponent(challengeId)}`);
}

/** Deletes one stored row by its server id; 404 means it is already gone, which satisfies the goal. */
async function deleteSubmissionRow(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/submissions/${id}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE /submissions/${id} failed with status ${response.status}`);
  }
}

/**
 * Upserts the submission for a challenge. json-server assigns row ids itself
 * (a client-supplied id on POST is ignored), so rows are found by
 * `challengeId`: an existing row is updated via PUT to its server id — also
 * deleting any duplicate rows earlier versions of this client left behind —
 * and a first save is created via POST.
 */
export async function saveSubmission(submission: UnsavedSubmission): Promise<Submission> {
  const existing = await fetchSubmissionsForChallenge(submission.challengeId);
  const headers = { 'Content-Type': 'application/json' };
  const [current, ...duplicates] = existing;
  if (current === undefined) {
    return requestJson<Submission>('/submissions', { body: JSON.stringify(submission), headers, method: 'POST' });
  }
  const updated = await requestJson<Submission>(`/submissions/${current.id}`, {
    body: JSON.stringify({ ...submission, id: current.id }),
    headers,
    method: 'PUT',
  });
  await Promise.all(duplicates.map((row) => deleteSubmissionRow(row.id)));
  return updated;
}

/** Deletes every stored submission for the challenge; having none stored already satisfies the goal. */
export async function clearSubmission(challengeId: string): Promise<void> {
  const rows = await fetchSubmissionsForChallenge(challengeId);
  await Promise.all(rows.map((row) => deleteSubmissionRow(row.id)));
}
