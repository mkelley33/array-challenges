import { DirectExecutor } from '@/execution/executor';
import { runChallenge } from '@/execution/run-challenge';
import { transpileTs } from '@/lib/transpile';

import type { CategoryModule, Challenge } from './types';

import { SOLVE_FN_NAME } from './types';

/**
 * Shared catalog invariants. Category modules are authored independently
 * (one test file per category plus the global catalog gate), so the rules
 * live here once and every test consumes the same definitions.
 */

export function structuralIssues(module: CategoryModule): string[] {
  const issues: string[] = [];
  const { category, challenges } = module;
  if (challenges.length === 0) {
    issues.push(`category ${category.id} has no challenges`);
  }
  const orders = new Set(challenges.map((challenge) => challenge.order));
  if (orders.size !== challenges.length) {
    issues.push(`duplicate challenge orders in ${category.id}`);
  }
  const ids = new Set(challenges.map((challenge) => challenge.id));
  if (ids.size !== challenges.length) {
    issues.push(`duplicate challenge ids in ${category.id}`);
  }
  for (const challenge of challenges) {
    if (challenge.categoryId !== category.id) {
      issues.push(`${challenge.id}: categoryId "${challenge.categoryId}" does not match "${category.id}"`);
    }
    if (challenge.tests.length < 3) {
      issues.push(`${challenge.id}: needs at least 3 test cases`);
    }
    const testNames = new Set(challenge.tests.map((test) => test.name));
    if (testNames.size !== challenge.tests.length) {
      issues.push(`${challenge.id}: duplicate test case names`);
    }
    if (challenge.title.trim().length === 0) {
      issues.push(`${challenge.id}: empty title`);
    }
    if (challenge.description.trim().length <= 40) {
      issues.push(`${challenge.id}: description too short (needs the task and the solve signature)`);
    }
    if (challenge.methods.length === 0) {
      issues.push(`${challenge.id}: methods list is empty`);
    }
    if (challenge.explanation.trim().length <= 80) {
      issues.push(`${challenge.id}: explanation too short to teach anything`);
    }
    if (!challenge.methods.some((method) => challenge.explanation.includes(method))) {
      issues.push(`${challenge.id}: explanation must mention one of: ${challenge.methods.join(', ')}`);
    }
    if (challenge.difficulty === 'advanced' && challenge.trap === undefined) {
      issues.push(`${challenge.id}: advanced challenge needs a trap`);
    }
  }
  return issues;
}

/**
 * A trap must transpile (an uncompilable trap teaches nothing) and must fail at
 * least one test — otherwise the challenge advertises a pitfall that does not exist.
 */
export async function trapMustNotPass(challenge: Challenge): Promise<null | string> {
  if (challenge.trap === undefined) {
    return null;
  }
  const transpiled = transpileTs(challenge.trap);
  if (!transpiled.ok) {
    return `${challenge.id}: trap does not transpile — ${transpiled.message}`;
  }
  const report = await runChallenge(new DirectExecutor(), challenge.trap, SOLVE_FN_NAME, challenge.tests);
  if (report.overall === 'passed') {
    return `${challenge.id}: trap passes every test — it is not a trap`;
  }
  return null;
}

export function starterTranspileIssues(challenge: Challenge): string[] {
  const result = transpileTs(challenge.starterCode);
  if (!result.ok) {
    return [`${challenge.id}: starter code does not transpile — ${result.message}`];
  }
  if (!result.code.includes(`exports.${SOLVE_FN_NAME}`)) {
    return [`${challenge.id}: starter code must export a function named "${SOLVE_FN_NAME}"`];
  }
  return [];
}

export async function starterMustNotPass(challenge: Challenge): Promise<null | string> {
  const report = await runChallenge(new DirectExecutor(), challenge.starterCode, SOLVE_FN_NAME, challenge.tests);
  if (report.overall === 'passed') {
    return `${challenge.id}: starter code already passes — it gives the answer away`;
  }
  return null;
}

export async function solutionMustPass(challenge: Challenge): Promise<null | string> {
  const report = await runChallenge(new DirectExecutor(), challenge.solution, SOLVE_FN_NAME, challenge.tests);
  if (report.overall === 'passed') {
    return null;
  }
  const failing = report.cases
    .filter((caseResult) => caseResult.status !== 'pass')
    .map((caseResult) =>
      JSON.stringify({
        actual: caseResult.actual,
        error: caseResult.error,
        expected: caseResult.expected,
        name: caseResult.name,
      }),
    );
  return [
    `${challenge.id}: reference solution did not pass (overall: ${report.overall})`,
    report.transpileError ?? '',
    report.executionError ?? '',
    ...failing,
  ]
    .filter((line) => line.length > 0)
    .join('\n');
}
