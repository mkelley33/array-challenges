import { describe, expect, it } from 'vitest';

import {
  solutionMustPass,
  starterMustNotPass,
  starterTranspileIssues,
  structuralIssues,
} from '@/data/catalog-invariants';
import { installPolyfills } from '@/lib/polyfills';

import { sortingAndOrdering } from './sorting-and-ordering';

installPolyfills();

describe('sorting-and-ordering category', () => {
  it('satisfies the structural invariants', () => {
    expect(structuralIssues(sortingAndOrdering)).toEqual([]);
  });

  it.each(sortingAndOrdering.challenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: starter transpiles, exports solve, and does not already pass',
    async (_id, challenge) => {
      expect(starterTranspileIssues(challenge)).toEqual([]);
      expect(await starterMustNotPass(challenge)).toBeNull();
    },
  );

  it.each(sortingAndOrdering.challenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: reference solution passes its own tests',
    async (_id, challenge) => {
      expect(await solutionMustPass(challenge)).toBeNull();
    },
  );
});
