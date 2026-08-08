import { describe, expect, it } from 'vitest';

import type { CategoryModule, Submission } from '@/data/types';

import { buildDb } from '@/data/build-db';
import { code, tc } from '@/data/challenge-helpers';
import { decode } from '@/lib/codec';

function doubleModule(): CategoryModule {
  return {
    category: {
      description: 'A synthetic category used only by the buildDb unit tests.',
      id: 'test-doubling',
      order: 1,
      title: 'Doubling',
    },
    challenges: [
      {
        categoryId: 'test-doubling',
        description: 'Return the input number multiplied by two. Signature: solve(n: number): number',
        difficulty: 'novice',
        explanation:
          'Multiplying by two is the simplest possible pure function; this challenge exists so the map test fixture stays tiny.',
        id: 'double-it',
        methods: ['map'],
        order: 1,
        solution: code(`
export function solve(n: number): number {
  return n * 2;
}
`),
        starterCode: code(`
export function solve(n: number): number {
  return 0;
}
`),
        tests: [tc('doubles two', [2], 4), tc('doubles zero', [0], 0), tc('doubles negatives', [-3], -6)],
        title: 'Double it',
      },
    ],
  };
}

describe('buildDb', () => {
  it('collects categories and challenges from the modules', async () => {
    const db = await buildDb([doubleModule()], []);
    expect(db.categories.map((category) => category.id)).toEqual(['test-doubling']);
    expect(db.challenges.map((challenge) => challenge.id)).toEqual(['double-it']);
    expect(db.submissions).toEqual([]);
  });

  it('appends extra cases with the expected value computed by the reference solution', async () => {
    const db = await buildDb([doubleModule()], [{ args: [21], challengeId: 'double-it', name: 'faker: doubles 21' }]);
    const challenge = db.challenges[0];
    expect(challenge).toBeDefined();
    const appended = challenge?.tests.at(-1);
    expect(appended?.name).toBe('faker: doubles 21');
    expect(decode(appended?.expected ?? { $t: 'undef' })).toBe(42);
  });

  it('does not mutate the tests array of the input module', async () => {
    const module = doubleModule();
    const originalTestCount = module.challenges[0]?.tests.length;
    await buildDb([module], [{ args: [5], challengeId: 'double-it', name: 'faker: doubles 5' }]);
    expect(module.challenges[0]?.tests.length).toBe(originalTestCount);
  });

  it('rejects extra cases that reference an unknown challenge', async () => {
    await expect(buildDb([doubleModule()], [{ args: [1], challengeId: 'nope', name: 'faker: nope' }])).rejects.toThrow(
      /unknown challenge/i,
    );
  });

  it('rejects extra cases whose reference solution throws', async () => {
    const module = doubleModule();
    const challenge = module.challenges[0];
    if (!challenge) {
      throw new Error('fixture is missing its challenge');
    }
    challenge.solution = code(`
export function solve(n: number): number {
  throw new Error('boom');
}
`);
    await expect(buildDb([module], [{ args: [1], challengeId: 'double-it', name: 'faker: boom' }])).rejects.toThrow(
      /boom/,
    );
  });

  it('carries provided submissions through unchanged', async () => {
    const submissions: Submission[] = [
      {
        challengeId: 'double-it',
        code: 'export function solve(n: number): number { return n * 2; }',
        id: 'double-it',
        status: 'passed',
        updatedAt: '2026-08-08T00:00:00.000Z',
      },
    ];
    const db = await buildDb([doubleModule()], [], submissions);
    expect(db.submissions).toEqual(submissions);
  });
});
