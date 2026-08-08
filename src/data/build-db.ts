import type { Category, CategoryModule, Challenge, DbFile, Submission } from '@/data/types';
import type { TestCaseInput } from '@/execution/executor';

import { SOLVE_FN_NAME } from '@/data/types';
import { DirectExecutor } from '@/execution/executor';
import { encode } from '@/lib/codec';
import { transpileTs } from '@/lib/transpile';

/** An additional test case whose expected value is computed by running the reference solution. */
export interface ExtraCase {
  args: unknown[];
  challengeId: string;
  name: string;
}

const EXTRA_CASE_TIMEOUT_MS = 5000;

async function computeExpected(challenge: Challenge, extra: ExtraCase): Promise<TestCaseInput> {
  const transpiled = transpileTs(challenge.solution);
  if (!transpiled.ok) {
    throw new Error(`${challenge.id}: reference solution does not transpile — ${transpiled.message}`);
  }
  const executor = new DirectExecutor();
  const encodedArgs = extra.args.map((arg) => encode(arg));
  const result = await executor.execute({
    code: transpiled.code,
    fnName: SOLVE_FN_NAME,
    tests: [{ args: encodedArgs, expected: encode(undefined), name: extra.name }],
    timeoutMs: EXTRA_CASE_TIMEOUT_MS,
  });
  if (result.status !== 'ok') {
    throw new Error(
      `${challenge.id}: could not run reference solution for "${extra.name}" — ${result.error ?? result.status}`,
    );
  }
  const caseResult = result.cases[0];
  if (!caseResult || caseResult.status === 'error' || caseResult.actual === undefined) {
    throw new Error(
      `${challenge.id}: reference solution failed on "${extra.name}" — ${caseResult?.error ?? 'no result'}`,
    );
  }
  return { args: encodedArgs, expected: caseResult.actual, name: extra.name };
}

/**
 * Assembles the JSON Server database file from the authored category modules,
 * appending generated extra cases (expected values computed by each challenge's
 * reference solution) and carrying existing submissions through unchanged.
 */
export async function buildDb(
  modules: CategoryModule[],
  extras: ExtraCase[],
  submissions: Submission[] = [],
): Promise<DbFile> {
  const sortedModules = [...modules].sort((a, b) => a.category.order - b.category.order);
  const categories: Category[] = sortedModules.map((module) => module.category);
  const challenges: Challenge[] = sortedModules.flatMap((module) =>
    [...module.challenges]
      .sort((a, b) => a.order - b.order)
      .map((challenge) => ({ ...challenge, tests: [...challenge.tests] })),
  );

  const byId = new Map(challenges.map((challenge) => [challenge.id, challenge]));
  for (const extra of extras) {
    const challenge = byId.get(extra.challengeId);
    if (!challenge) {
      throw new Error(`extra case "${extra.name}" references unknown challenge "${extra.challengeId}"`);
    }
    challenge.tests.push(await computeExpected(challenge, extra));
  }

  return { categories, challenges, submissions };
}
