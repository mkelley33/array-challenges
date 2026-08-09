import { existsSync, readFileSync } from 'node:fs';

import type { Submission } from '../src/data/types';

export interface ReadSubmissionsOptions {
  /** Discard stored submissions instead of carrying them into the new file. */
  reset: boolean;
}

/**
 * Reads the submissions that a regeneration should carry forward. Anything
 * unreadable — a missing file, a file without a submissions collection, a
 * collection that is not a list — yields none rather than failing the
 * regeneration, and `reset` skips the file entirely so a corrupt database can
 * always be rebuilt.
 */
export function readSubmissionsToPreserve(dbPath: string, { reset }: ReadSubmissionsOptions): Submission[] {
  if (reset || !existsSync(dbPath)) {
    return [];
  }
  const parsed: unknown = JSON.parse(readFileSync(dbPath, 'utf8'));
  if (typeof parsed !== 'object' || parsed === null || !('submissions' in parsed)) {
    return [];
  }
  const { submissions } = parsed as { submissions: unknown };
  return Array.isArray(submissions) ? (submissions as Submission[]) : [];
}
