import { faker } from '@faker-js/faker';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { ExtraCase } from '../src/data/build-db';
import type { Submission } from '../src/data/types';

import { buildDb } from '../src/data/build-db';
import { allModules } from '../src/data/challenges';
import { installPolyfills } from '../src/lib/polyfills';

/**
 * Regenerates db.json from the authored catalog. Deterministic: faker is
 * seeded, so the same catalog always produces the same file. Existing
 * submissions in db.json are preserved across regenerations.
 */

const DB_PATH = resolve(import.meta.dirname, '..', 'db.json');
const FAKER_SEED = 20260808;

/**
 * Per-challenge generators for extra randomized test cases. Each generator
 * returns a list of argument tuples; the expected value for each tuple is
 * computed by running the challenge's reference solution. Challenges without
 * an entry simply ship with their hand-written cases only.
 */
const extraArgGenerators: Record<string, () => unknown[][]> = {
  'async-tax': () => [
    [Array.from({ length: faker.number.int({ max: 5, min: 1 }) }, () => faker.number.int({ max: 500, min: 1 }))],
  ],
  'code-points': () => [[faker.lorem.word()]],
  'identity-matrix': () => [[faker.number.int({ max: 5, min: 0 })]],
  'range-of-numbers': () => {
    const start = faker.number.int({ max: 20, min: -20 });
    return [[start, start + faker.number.int({ max: 10, min: 0 })]];
  },
  'repeat-value': () => [[faker.lorem.word(), faker.number.int({ max: 6, min: 0 })]],
  'squares-without-holes': () => [[faker.number.int({ max: 8, min: 0 })]],
};

function readExistingSubmissions(): Submission[] {
  if (!existsSync(DB_PATH)) {
    return [];
  }
  const parsed: unknown = JSON.parse(readFileSync(DB_PATH, 'utf8'));
  if (typeof parsed !== 'object' || parsed === null || !('submissions' in parsed)) {
    return [];
  }
  const { submissions } = parsed as { submissions: unknown };
  return Array.isArray(submissions) ? (submissions as Submission[]) : [];
}

function generateExtras(): ExtraCase[] {
  const knownIds = new Set(allModules.flatMap((module) => module.challenges.map((challenge) => challenge.id)));
  const extras: ExtraCase[] = [];
  for (const [challengeId, generate] of Object.entries(extraArgGenerators)) {
    if (!knownIds.has(challengeId)) {
      continue;
    }
    generate().forEach((args, index) => {
      extras.push({ args, challengeId, name: `faker: generated case ${index + 1}` });
    });
  }
  return extras;
}

async function main(): Promise<void> {
  installPolyfills();
  faker.seed(FAKER_SEED);
  const submissions = readExistingSubmissions();
  const db = await buildDb(allModules, generateExtras(), submissions);
  writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`);
  console.log(
    `db.json written: ${db.categories.length} categories, ${db.challenges.length} challenges, ${db.submissions.length} submissions preserved`,
  );
}

await main();
