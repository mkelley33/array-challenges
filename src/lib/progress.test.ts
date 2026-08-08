import { describe, expect, it } from 'vitest';

import { deriveProgress } from '@/lib/progress';

const challenges = [
  { categoryId: 'creating-arrays', id: 'range-of-numbers' },
  { categoryId: 'creating-arrays', id: 'repeat-value' },
  { categoryId: 'sorting-and-ordering', id: 'numeric-sort-trap' },
];

describe('deriveProgress', () => {
  it('reports zero solved when there are no submissions', () => {
    const progress = deriveProgress(challenges, []);
    expect(progress.overall).toEqual({ solved: 0, total: 3 });
    expect(progress.byCategory).toEqual({
      'creating-arrays': { solved: 0, total: 2 },
      'sorting-and-ordering': { solved: 0, total: 1 },
    });
  });

  it('counts only passed submissions as solved', () => {
    const progress = deriveProgress(challenges, [
      { challengeId: 'range-of-numbers', status: 'passed' },
      { challengeId: 'repeat-value', status: 'failed' },
    ]);
    expect(progress.overall).toEqual({ solved: 1, total: 3 });
    expect(progress.byCategory['creating-arrays']).toEqual({ solved: 1, total: 2 });
  });

  it('ignores submissions that reference unknown challenges', () => {
    const progress = deriveProgress(challenges, [{ challengeId: 'ghost', status: 'passed' }]);
    expect(progress.overall).toEqual({ solved: 0, total: 3 });
  });

  it('counts a challenge at most once even with duplicate submissions', () => {
    const progress = deriveProgress(challenges, [
      { challengeId: 'numeric-sort-trap', status: 'passed' },
      { challengeId: 'numeric-sort-trap', status: 'passed' },
    ]);
    expect(progress.byCategory['sorting-and-ordering']).toEqual({ solved: 1, total: 1 });
    expect(progress.overall).toEqual({ solved: 1, total: 3 });
  });

  it('handles an empty catalog', () => {
    const progress = deriveProgress([], [{ challengeId: 'range-of-numbers', status: 'passed' }]);
    expect(progress.overall).toEqual({ solved: 0, total: 0 });
    expect(progress.byCategory).toEqual({});
  });
});
