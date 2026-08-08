import { describe, expect, it } from 'vitest';

import {
  solutionMustPass,
  starterMustNotPass,
  starterTranspileIssues,
  structuralIssues,
} from '@/data/catalog-invariants';
import { installPolyfills } from '@/lib/polyfills';

import { mappingAndTransforming } from './mapping-and-transforming';

installPolyfills();

describe('mapping-and-transforming category', () => {
  it('satisfies the structural invariants', () => {
    expect(structuralIssues(mappingAndTransforming)).toEqual([]);
  });

  it.each(mappingAndTransforming.challenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: starter transpiles, exports solve, and does not already pass',
    async (_id, challenge) => {
      expect(starterTranspileIssues(challenge)).toEqual([]);
      expect(await starterMustNotPass(challenge)).toBeNull();
    },
  );

  it.each(mappingAndTransforming.challenges.map((challenge) => [challenge.id, challenge] as const))(
    '%s: reference solution passes its own tests',
    async (_id, challenge) => {
      expect(await solutionMustPass(challenge)).toBeNull();
    },
  );
});
