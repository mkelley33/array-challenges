import { describe, expect, it } from 'vitest';

import { installPolyfills } from '@/lib/polyfills';

import { solutionMustPass, starterMustNotPass, starterTranspileIssues, structuralIssues } from './catalog-invariants';
import { allCategories, allChallenges, allModules } from './challenges';

installPolyfills();

/**
 * Catalog gate: every challenge in the catalog must satisfy these invariants.
 * Content that fails here is not shippable, no matter who authored it.
 * Per-category test files run the same invariants during authoring; this file
 * additionally enforces cross-category rules.
 */

describe('catalog integrity', () => {
  it('has globally unique challenge ids', () => {
    const ids = allChallenges.map((challenge) => challenge.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has globally unique category ids and orders', () => {
    const ids = allCategories.map((category) => category.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = allCategories.map((category) => category.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('every module satisfies the structural invariants', () => {
    const issues = allModules.flatMap((module) => structuralIssues(module));
    expect(issues).toEqual([]);
  });
});

describe('starter code contract', () => {
  it.each(allChallenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: starter transpiles and exports solve',
    (_id, challenge) => {
      expect(starterTranspileIssues(challenge)).toEqual([]);
    },
  );

  it.each(allChallenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: starter code does not already pass',
    async (_id, challenge) => {
      expect(await starterMustNotPass(challenge)).toBeNull();
    },
  );
});

describe('reference solutions', () => {
  it.each(allChallenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: reference solution passes its own tests',
    async (_id, challenge) => {
      expect(await solutionMustPass(challenge)).toBeNull();
    },
  );
});
