import { describe, expect, it } from 'vitest';

import {
  solutionMustPass,
  starterMustNotPass,
  starterTranspileIssues,
  structuralIssues,
} from '@/data/catalog-invariants';
import { installPolyfills } from '@/lib/polyfills';

import { iterationBasics } from './iteration-basics';

installPolyfills();

describe('iteration-basics category', () => {
  it('satisfies the structural invariants', () => {
    expect(structuralIssues(iterationBasics)).toEqual([]);
  });

  it.each(iterationBasics.challenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: starter transpiles, exports solve, and does not already pass',
    async (_id, challenge) => {
      expect(starterTranspileIssues(challenge)).toEqual([]);
      expect(await starterMustNotPass(challenge)).toBeNull();
    },
  );

  it.each(iterationBasics.challenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: reference solution passes its own tests',
    async (_id, challenge) => {
      expect(await solutionMustPass(challenge)).toBeNull();
    },
  );
});
