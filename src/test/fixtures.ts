import type { Category, Challenge, Submission } from '@/data/types';

import { tc } from '@/data/challenge-helpers';

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    description: 'A category used in component tests.',
    id: 'creating-arrays',
    order: 1,
    title: 'Creating Arrays',
    ...overrides,
  };
}

export function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    categoryId: 'creating-arrays',
    description: 'Return the input number multiplied by two. Signature: solve(n: number): number',
    difficulty: 'novice',
    explanation: 'map applies the callback to every element and returns a new array of the same length.',
    id: 'double-it',
    methods: ['map'],
    order: 1,
    solution: 'export function solve(n: number): number {\n  return n * 2;\n}\n',
    starterCode: 'export function solve(n: number): number {\n  return 0;\n}\n',
    tests: [tc('doubles two', [2], 4), tc('doubles zero', [0], 0), tc('doubles negatives', [-3], -6)],
    title: 'Double it',
    ...overrides,
  };
}

export function makeSubmission(overrides: Partial<Submission> = {}): Submission {
  return {
    challengeId: 'double-it',
    code: 'export function solve(n: number): number {\n  return n * 2;\n}\n',
    id: 'double-it',
    status: 'passed',
    updatedAt: '2026-08-08T12:00:00.000Z',
    ...overrides,
  };
}
