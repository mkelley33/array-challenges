import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Submission } from '../src/data/types';

import { readSubmissionsToPreserve } from './existing-submissions';

const submission: Submission = {
  challengeId: 'range-of-numbers',
  code: 'export function solve(): number[] {\n  return [];\n}\n',
  id: 'srv-1',
  status: 'failed',
  updatedAt: '2026-08-09T02:32:59.865Z',
};

let directory: string;
let dbPath: string;

function writeDb(contents: unknown): void {
  writeFileSync(dbPath, JSON.stringify(contents, null, 2));
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'array-challenges-db-'));
  dbPath = join(directory, 'db.json');
});

afterEach(() => {
  rmSync(directory, { force: true, recursive: true });
});

describe('readSubmissionsToPreserve', () => {
  it('carries stored submissions through a regeneration', () => {
    writeDb({ categories: [], challenges: [], submissions: [submission] });
    expect(readSubmissionsToPreserve(dbPath, { reset: false })).toEqual([submission]);
  });

  it('drops every stored submission when resetting', () => {
    writeDb({ categories: [], challenges: [], submissions: [submission] });
    expect(readSubmissionsToPreserve(dbPath, { reset: true })).toEqual([]);
  });

  it('returns no submissions when the database file does not exist yet', () => {
    expect(readSubmissionsToPreserve(join(directory, 'missing.json'), { reset: false })).toEqual([]);
  });

  it('returns no submissions when the file has no submissions collection', () => {
    writeDb({ categories: [], challenges: [] });
    expect(readSubmissionsToPreserve(dbPath, { reset: false })).toEqual([]);
  });

  it('returns no submissions when the submissions value is not a list', () => {
    writeDb({ submissions: { nope: true } });
    expect(readSubmissionsToPreserve(dbPath, { reset: false })).toEqual([]);
  });

  it('does not read the file at all when resetting, so a corrupt file still resets', () => {
    writeFileSync(dbPath, 'not json at all');
    expect(readSubmissionsToPreserve(dbPath, { reset: true })).toEqual([]);
  });
});
