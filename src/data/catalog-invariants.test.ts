import { describe, expect, it } from 'vitest';

import type { CategoryModule } from '@/data/types';

import { structuralIssues, trapMustNotPass } from '@/data/catalog-invariants';
import { makeCategory, makeChallenge } from '@/test/fixtures';

const FAILING_TRAP = 'export function solve(n: number): number {\n  return n + n + 1;\n}\n';
const PASSING_TRAP = 'export function solve(n: number): number {\n  return n + n;\n}\n';
const BROKEN_TRAP = 'export function solve(n: number): number {\n  return n +;\n}\n';

function moduleWith(overrides: Parameters<typeof makeChallenge>[0]): CategoryModule {
  return { category: makeCategory(), challenges: [makeChallenge(overrides)] };
}

describe('structuralIssues: trap requirement', () => {
  it('flags an advanced challenge that has no trap', () => {
    const issues = structuralIssues(moduleWith({ difficulty: 'advanced' }));
    expect(issues).toEqual(['double-it: advanced challenge needs a trap']);
  });

  it('accepts an advanced challenge that carries a trap', () => {
    const issues = structuralIssues(moduleWith({ difficulty: 'advanced', trap: FAILING_TRAP }));
    expect(issues).toEqual([]);
  });

  it('does not require a trap on other tiers', () => {
    expect(structuralIssues(moduleWith({ difficulty: 'expert' }))).toEqual([]);
    expect(structuralIssues(moduleWith({ difficulty: 'intermediate' }))).toEqual([]);
    expect(structuralIssues(moduleWith({ difficulty: 'novice' }))).toEqual([]);
  });
});

describe('trapMustNotPass', () => {
  it('is satisfied when the challenge has no trap', async () => {
    expect(await trapMustNotPass(makeChallenge())).toBeNull();
  });

  it('is satisfied when the trap fails at least one test', async () => {
    expect(await trapMustNotPass(makeChallenge({ trap: FAILING_TRAP }))).toBeNull();
  });

  it('rejects a trap that passes every test', async () => {
    const issue = await trapMustNotPass(makeChallenge({ trap: PASSING_TRAP }));
    expect(issue).toBe('double-it: trap passes every test — it is not a trap');
  });

  it('rejects a trap that does not transpile', async () => {
    const issue = await trapMustNotPass(makeChallenge({ trap: BROKEN_TRAP }));
    expect(issue).toMatch(/^double-it: trap does not transpile — /);
  });
});
