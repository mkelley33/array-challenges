import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

/**
 * Every starter in this category ships the same `Task` shape and a `simulate`
 * helper that turns a task into a promise: it resolves to `task.id` after
 * `task.delayMs` and rejects with `new Error(\`${id} failed\`)` when `task.fails`
 * is set. Test arguments are plain task arrays — promises are only ever created
 * inside `solve` — and rejection reasons surface as `.message` strings.
 *
 * Timing rules (the gate awaits each test with a 3000 ms budget and runs every
 * challenge twice): wherever finish order is graded the delays are 10 / 40 / 70,
 * at least 30 ms apart, so CPU contention cannot reorder them; no single test
 * runs longer than ~150 ms. No trap or reference ever drops a rejecting promise:
 * traps that return before their timers fire are only exercised with tasks that
 * do not fail, because an unhandled rejection fails the whole Vitest run.
 */

const TASK_HELPER = `
interface Task {
  delayMs: number;
  fails?: boolean;
  id: string;
}

function simulate(task: Task): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (task.fails) {
        reject(new Error(\`\${task.id} failed\`));
      } else {
        resolve(task.id);
      }
    }, task.delayMs);
  });
}
`;

const PAYLOAD_HELPER = `
interface Task {
  delayMs: number;
  id: string;
  payload: number;
}

function simulate(task: Task): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(task.payload), task.delayMs);
  });
}
`;

const RETRY_HELPER = `
interface Task {
  delayMs: number;
  failFirst: number;
  id: string;
}

interface Outcome {
  attempts: number;
  id: string;
  ok: boolean;
}

/** Rejects while \`attempt <= task.failFirst\`, so attempt \`failFirst + 1\` is the first to succeed. */
function simulate(task: Task, attempt: number): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (attempt <= task.failFirst) {
        reject(new Error(\`\${task.id} failed on attempt \${attempt}\`));
      } else {
        resolve(task.id);
      }
    }, task.delayMs);
  });
}
`;

const CALLBACK_HELPER = `
interface Task {
  delayMs: number;
  fails?: boolean;
  id: string;
}

type Callback = (error: Error | null, id?: string) => void;

/** Node-style: the callback receives either an error or the id, never a promise. */
function simulateCallback(task: Task, callback: Callback): void {
  setTimeout(() => {
    if (task.fails) {
      callback(new Error(\`\${task.id} failed\`));
    } else {
      callback(null, task.id);
    }
  }, task.delayMs);
}
`;

const LOG_HELPER = `
${TASK_HELPER}
async function run(task: Task, log: string[]): Promise<void> {
  log.push(\`start:\${task.id}\`);
  await simulate(task);
  log.push(\`end:\${task.id}\`);
}
`;

export const asyncArraysAndPromises: CategoryModule = {
  category: {
    description:
      'Fan async work out over arrays and gather it back with the Promise combinators — in the order the array says, not the order the timers do.',
    id: 'async-arrays-and-promises',
    order: 15,
    title: 'Async Arrays & Promises',
  },
  challenges: [
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Simulate every task and resolve to their ids in INPUT order, e.g. tasks `a`, `b`, `c` → `["a", "b", "c"]`. ' +
        'An empty list resolves to `[]`. No task fails.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<string[]>`',
      difficulty: 'novice',
      explanation:
        '`map` turns the array of tasks into an array of promises — every timer starts immediately, so the ' +
        'work runs concurrently — and `Promise.all` folds that array of promises back into one promise of an ' +
        'array. The two are made for each other: `Promise.all(tasks.map(simulate))` is the whole solution. ' +
        'The part worth remembering is that `Promise.all` preserves INPUT positions, not completion order: ' +
        'each value lands at the index of the promise that produced it, however the timers happen to fire. ' +
        'That is what makes the result predictable and why this category keeps returning to the same shape. ' +
        'An empty array resolves straight away to `[]`, with no timers involved, because there is nothing to ' +
        'wait for.',
      id: 'gather-with-promise-all',
      methods: ['Promise.all', 'map'],
      order: 1,
      solution: code(`
${TASK_HELPER}
export function solve(tasks: Task[]): Promise<string[]> {
  return Promise.all(tasks.map(simulate));
}
`),
      starterCode: code(`
${TASK_HELPER}
export function solve(tasks: Task[]): Promise<string[]> {
  // map each task to a promise, then fold the promises back into one promise of an array.
  return Promise.resolve([]);
}
`),
      tests: [
        tc(
          'three tasks in ascending delay order',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          ['a', 'b', 'c'],
        ),
        tc(
          'two tasks',
          [
            [
              { delayMs: 10, id: 'x' },
              { delayMs: 40, id: 'y' },
            ],
          ],
          ['x', 'y'],
        ),
        tc('a single task', [[{ delayMs: 10, id: 'solo' }]], ['solo']),
        tc('no tasks resolves to an empty array', [[]], []),
      ],
      title: 'Gather with Promise.all',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Resolve to the id of whichever task finishes FIRST — the one with the smallest `delayMs`, wherever it ' +
        'sits in the array. `tasks` is never empty and no task fails.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<string>`',
      difficulty: 'novice',
      explanation:
        '`Promise.race` settles as soon as the first of its promises settles, with that value — the others keep ' +
        'running but their results are ignored. `Promise.race(tasks.map(simulate))` therefore resolves to the ' +
        'id of the fastest task, regardless of where it sits in the array. Two things to notice. First, the ' +
        'array position no longer matters at all: this is the one combinator whose answer is decided by the ' +
        'timers, not the input order. Second, "first to settle" includes rejections — if the fastest promise ' +
        'rejects, the race rejects too, which is why this challenge promises nothing fails. And never race an ' +
        'empty array: `Promise.race([])` stays pending forever, because there is no first promise to win it.',
      id: 'fastest-task-wins',
      methods: ['Promise.race', 'map'],
      order: 2,
      solution: code(`
${TASK_HELPER}
export function solve(tasks: Task[]): Promise<string> {
  return Promise.race(tasks.map(simulate));
}
`),
      starterCode: code(`
${TASK_HELPER}
export function solve(tasks: Task[]): Promise<string> {
  // One combinator settles with whichever promise settles first.
  return Promise.resolve('');
}
`),
      tests: [
        tc(
          'the fastest task is last in the array',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 40, id: 'b' },
              { delayMs: 10, id: 'c' },
            ],
          ],
          'c',
        ),
        tc(
          'the fastest task is in the middle',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          'b',
        ),
        tc('a single task wins by default', [[{ delayMs: 10, id: 'only' }]], 'only'),
      ],
      title: 'Fastest task wins',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Report every task, in INPUT order, as `{ status: "fulfilled", value: id }` or ' +
        '`{ status: "rejected", reason: message }` — where `reason` is the error MESSAGE string, not the ' +
        '`Error` object the promise rejected with.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<Settled[]>`',
      difficulty: 'intermediate',
      explanation:
        '`Promise.allSettled` never rejects: it waits for every promise and resolves to one result object per ' +
        'input, in input order, each tagged `status: "fulfilled"` with a `value` or `status: "rejected"` with ' +
        'a `reason`. The catch is the shape of `reason` — it is whatever the promise rejected with, here an ' +
        '`Error` instance, and an `Error` is not plain data: it does not serialise, and two errors with the ' +
        'same message are not equal. So the answer is a second `map` over the settled results that keeps ' +
        'fulfilled entries as they are and rewrites rejected ones to `{ status, reason: reason.message }`. ' +
        'Narrow on `status` first; only the rejected branch has a `reason` to read, and only the fulfilled ' +
        'branch has a `value`.',
      id: 'settled-report-shape',
      methods: ['Promise.allSettled', 'map'],
      order: 3,
      solution: code(`
${TASK_HELPER}
type Settled = { status: 'fulfilled'; value: string } | { reason: string; status: 'rejected' };

export async function solve(tasks: Task[]): Promise<Settled[]> {
  const results = await Promise.allSettled(tasks.map(simulate));
  return results.map((result) =>
    result.status === 'fulfilled'
      ? { status: 'fulfilled', value: result.value }
      : { reason: (result.reason as Error).message, status: 'rejected' },
  );
}
`),
      starterCode: code(`
${TASK_HELPER}
type Settled = { status: 'fulfilled'; value: string } | { reason: string; status: 'rejected' };

export async function solve(tasks: Task[]): Promise<Settled[]> {
  // One combinator waits for everything without rejecting — then reshape reason into its message.
  return [];
}
`),
      tests: [
        tc(
          'mixed success and failure in input order',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, fails: true, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          [
            { status: 'fulfilled', value: 'a' },
            { reason: 'b failed', status: 'rejected' },
            { status: 'fulfilled', value: 'c' },
          ],
        ),
        tc(
          'every task fails',
          [
            [
              { delayMs: 40, fails: true, id: 'a' },
              { delayMs: 10, fails: true, id: 'b' },
            ],
          ],
          [
            { reason: 'a failed', status: 'rejected' },
            { reason: 'b failed', status: 'rejected' },
          ],
        ),
        tc(
          'every task succeeds, slowest first',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
            ],
          ],
          [
            { status: 'fulfilled', value: 'a' },
            { status: 'fulfilled', value: 'b' },
          ],
        ),
        tc('no tasks', [[]], []),
      ],
      title: 'The shape of a settled result',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Resolve to `{ failures, winner }` where `winner` is the id of the first task to SUCCEED (not the first ' +
        'to settle) and `failures` is `[]`. When every task fails — or `tasks` is empty — `winner` is `null` and ' +
        '`failures` lists each failure message in INPUT order.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<{ failures: string[]; winner: string | null }>`',
      difficulty: 'intermediate',
      explanation:
        '`Promise.any` is `Promise.race` for optimists: it resolves with the first promise to FULFIL and ' +
        'ignores rejections along the way, so a fast failure does not steal the win from a slower success. It ' +
        'only rejects when nothing fulfils, and then the reason is an `AggregateError` whose `errors` array ' +
        'holds every rejection reason in input order — the spec stores each reason at the index of its ' +
        'promise, so the array order matches the input, not the order the timers fired. An empty list is the ' +
        'degenerate all-failed case: `Promise.any([])` rejects immediately with an empty `errors` array. So ' +
        '`try { winner: await Promise.any(...) } catch (error) { failures: error.errors.map(e => e.message) }` ' +
        'covers all three shapes with one combinator.',
      id: 'first-success-or-every-failure',
      methods: ['Promise.any', 'AggregateError', 'map'],
      order: 4,
      solution: code(`
${TASK_HELPER}
interface Report {
  failures: string[];
  winner: string | null;
}

export async function solve(tasks: Task[]): Promise<Report> {
  try {
    const winner = await Promise.any(tasks.map(simulate));
    return { failures: [], winner };
  } catch (error) {
    const failures = (error as AggregateError).errors.map((reason: Error) => reason.message);
    return { failures, winner: null };
  }
}
`),
      starterCode: code(`
${TASK_HELPER}
interface Report {
  failures: string[];
  winner: string | null;
}

export async function solve(tasks: Task[]): Promise<Report> {
  // The combinator that ignores rejections until there is nothing left to wait for.
  return { failures: [], winner: null };
}
`),
      tests: [
        tc(
          'a fast failure does not beat a slower success',
          [
            [
              { delayMs: 10, fails: true, id: 'a' },
              { delayMs: 40, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          { failures: [], winner: 'b' },
        ),
        tc(
          'the fastest success wins even when it is last',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 40, fails: true, id: 'b' },
              { delayMs: 10, id: 'c' },
            ],
          ],
          { failures: [], winner: 'c' },
        ),
        tc(
          'every task fails: messages in input order',
          [
            [
              { delayMs: 40, fails: true, id: 'a' },
              { delayMs: 10, fails: true, id: 'b' },
              { delayMs: 70, fails: true, id: 'c' },
            ],
          ],
          { failures: ['a failed', 'b failed', 'c failed'], winner: null },
        ),
        tc('no tasks means no winner and no failures', [[]], { failures: [], winner: null }),
      ],
      title: 'First success, or every failure',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Resolve to each task id upper-cased, in INPUT order: tasks `a`, `b`, `c` → `["A", "B", "C"]`. ' +
        'No task fails.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<string[]>`\n\n' +
        'Trap: `forEach` with an `async` callback returns before a single timer has fired.',
      difficulty: 'advanced',
      explanation:
        '`forEach` discards whatever its callback returns. Hand it an `async` callback and each call returns ' +
        'a promise that is thrown away, so the loop finishes synchronously and `solve` resolves to the ' +
        'still-empty `results` array — every `await` inside the callback happens later, pushing into an array ' +
        'nobody is looking at any more. The fix is to keep the promises: `map` returns them, ' +
        '`Promise.all` waits for all of them, and its resolved array already holds each value at the index ' +
        'of its task, so there is no shared `results` array to push into and no ordering to repair. ' +
        '`Promise.all(tasks.map(async (task) => (await simulate(task)).toUpperCase()))` is the whole ' +
        'solution. The rule generalises: `forEach` is for side effects with nothing to wait for; when the ' +
        'callback is `async`, reach for `map` plus `Promise.all`.',
      id: 'foreach-forgets-to-wait',
      methods: ['Promise.all', 'map'],
      order: 5,
      solution: code(`
${TASK_HELPER}
export function solve(tasks: Task[]): Promise<string[]> {
  return Promise.all(tasks.map(async (task) => (await simulate(task)).toUpperCase()));
}
`),
      starterCode: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<string[]> {
  // forEach(async …) looks right and returns before any timer fires — keep the promises instead.
  return [];
}
`),
      tests: [
        tc(
          'three tasks come back upper-cased (trap)',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          ['A', 'B', 'C'],
        ),
        tc('a single task (trap)', [[{ delayMs: 10, id: 'solo' }]], ['SOLO']),
        tc(
          'input order is kept when delays are out of order (trap)',
          [
            [
              { delayMs: 40, id: 'x' },
              { delayMs: 10, id: 'y' },
            ],
          ],
          ['X', 'Y'],
        ),
        tc('no tasks', [[]], []),
      ],
      title: 'forEach forgets to wait',
      trap: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<string[]> {
  const results: string[] = [];
  tasks.forEach(async (task) => {
    results.push((await simulate(task)).toUpperCase());
  });
  return results;
}
`),
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Each task carries a numeric `payload` and `simulate` resolves to it. Resolve to the SUM of every ' +
        'payload: payloads `2`, `3`, `5` → `10`; no tasks → `0`. No task fails.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<number>`\n\n' +
        'Trap: `reduce` over the array that `map(async …)` returns adds promises, not numbers.',
      difficulty: 'advanced',
      explanation:
        'An `async` callback always returns a promise, so `tasks.map(async (task) => await simulate(task))` ' +
        'is an array of promises — the `await` inside unwraps the value for the callback body, but the ' +
        'caller still receives a promise. Chaining `reduce((sum, p) => sum + p, 0)` onto that array adds a ' +
        'number to a promise, and `+` coerces the promise to the string `"[object Promise]"`; the result is ' +
        '`"0[object Promise][object Promise][object Promise]"`, not `10`. The promises have to be settled ' +
        'BEFORE the fold: `await Promise.all(tasks.map(simulate))` produces a real `number[]`, and only then ' +
        'does `reduce` see numbers. The order of operations is the lesson — fan out with `map`, gather with ' +
        '`Promise.all`, and only fold once the values are plain data. `reduce` cannot await; it must be fed ' +
        'resolved values.',
      id: 'sum-after-awaiting-each',
      methods: ['Promise.all', 'map', 'reduce'],
      order: 6,
      solution: code(`
${PAYLOAD_HELPER}
export async function solve(tasks: Task[]): Promise<number> {
  const payloads = await Promise.all(tasks.map(simulate));
  return payloads.reduce((sum, payload) => sum + payload, 0);
}
`),
      starterCode: code(`
${PAYLOAD_HELPER}
export async function solve(tasks: Task[]): Promise<number> {
  // map(async …) yields promises — settle them all before reduce ever sees them.
  return -1;
}
`),
      tests: [
        tc(
          'sums three payloads (trap)',
          [
            [
              { delayMs: 10, id: 'a', payload: 2 },
              { delayMs: 40, id: 'b', payload: 3 },
              { delayMs: 70, id: 'c', payload: 5 },
            ],
          ],
          10,
        ),
        tc('a single payload (trap)', [[{ delayMs: 10, id: 'a', payload: 7 }]], 7),
        tc(
          'negative payloads cancel out (trap)',
          [
            [
              { delayMs: 40, id: 'a', payload: 4 },
              { delayMs: 10, id: 'b', payload: -4 },
            ],
          ],
          0,
        ),
        tc('no tasks sums to zero', [[]], 0),
      ],
      title: 'Sum after awaiting each',
      trap: code(`
${PAYLOAD_HELPER}
export async function solve(tasks: Task[]): Promise<number> {
  return tasks.map(async (task) => await simulate(task)).reduce((sum, payload) => sum + payload, 0);
}
`),
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Resolve to `{ fulfilled, rejected }`: the ids of the tasks that succeeded and the failure messages ' +
        'of the tasks that did not, each list in INPUT order. A failing task must not hide its successful ' +
        'siblings.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<{ fulfilled: string[]; rejected: string[] }>`\n\n' +
        'Trap: `Promise.all` in a `try`/`catch` rejects on the first failure and loses every fulfilled value.',
      difficulty: 'advanced',
      explanation:
        '`Promise.all` fails fast: the moment one promise rejects it rejects with that reason, and the values ' +
        'of the promises that already fulfilled — or fulfil later — are simply gone. Wrapping it in ' +
        '`try`/`catch` catches the one error but cannot recover the siblings, so the trap reports ' +
        '`{ fulfilled: [], rejected: ["b failed"] }` for an input where `a` and `c` succeeded. ' +
        '`Promise.allSettled` is the combinator that never gives up on the rest: it waits for every promise ' +
        'and hands back one `{ status, value | reason }` record per input, in input order. From there it is ' +
        'two `filter` + `map` passes: `status === "fulfilled"` gives the ids, `status === "rejected"` gives ' +
        '`reason.message`. The order rule falls out for free, because the settled array is indexed like the ' +
        'input, not like the timers.',
      id: 'one-rejection-does-not-sink-the-rest',
      methods: ['Promise.allSettled', 'filter', 'map'],
      order: 7,
      solution: code(`
${TASK_HELPER}
interface Outcome {
  fulfilled: string[];
  rejected: string[];
}

export async function solve(tasks: Task[]): Promise<Outcome> {
  const settled = await Promise.allSettled(tasks.map(simulate));
  const fulfilled = settled
    .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
    .map((result) => result.value);
  const rejected = settled
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => (result.reason as Error).message);
  return { fulfilled, rejected };
}
`),
      starterCode: code(`
${TASK_HELPER}
interface Outcome {
  fulfilled: string[];
  rejected: string[];
}

export async function solve(tasks: Task[]): Promise<Outcome> {
  // Promise.all throws away every sibling on the first rejection — pick the combinator that keeps them.
  return { fulfilled: [], rejected: [] };
}
`),
      tests: [
        tc(
          'one failure among successes (trap)',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, fails: true, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          { fulfilled: ['a', 'c'], rejected: ['b failed'] },
        ),
        tc(
          'two failures are both reported (trap)',
          [
            [
              { delayMs: 40, fails: true, id: 'a' },
              { delayMs: 10, fails: true, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          { fulfilled: ['c'], rejected: ['a failed', 'b failed'] },
        ),
        tc(
          'no failures at all',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
            ],
          ],
          { fulfilled: ['a', 'b'], rejected: [] },
        ),
        tc('no tasks', [[]], { fulfilled: [], rejected: [] }),
      ],
      title: 'One rejection does not sink the rest',
      trap: code(`
${TASK_HELPER}
interface Outcome {
  fulfilled: string[];
  rejected: string[];
}

export async function solve(tasks: Task[]): Promise<Outcome> {
  try {
    const ids = await Promise.all(tasks.map(simulate));
    return { fulfilled: ids, rejected: [] };
  } catch (error) {
    return { fulfilled: [], rejected: [(error as Error).message] };
  }
}
`),
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Resolve to the task ids in the order they FINISH (fastest first), not the order they were given: ' +
        'delays `a: 70`, `b: 10`, `c: 40` → `["b", "c", "a"]`. No task fails.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<string[]>`\n\n' +
        'Trap: `for await` over an array of promises yields them by index, not by completion.',
      difficulty: 'advanced',
      explanation:
        '`for await (const id of promises)` reads like "give me each result as it arrives", but it does not. ' +
        'The loop takes the array’s ordinary iterator and awaits each element in turn: it waits for ' +
        'promise 0, then promise 1, then promise 2. The promises all started when `map` created them, so ' +
        'they run concurrently — but the loop can only observe them in index order, and the log ends up ' +
        'as the input order. To record finish order you must react to each promise individually: attach a ' +
        '`then` to every promise that pushes its id when IT settles, and use `Promise.all` only to know ' +
        'when the last one has fired. `await Promise.all(tasks.map((task) => simulate(task).then((id) => ' +
        'order.push(id))))` produces `["b", "c", "a"]`. Sequential consumption and concurrent execution are ' +
        'different questions; `for await` answers the first.',
      id: 'for-await-consumes-in-input-order',
      methods: ['Promise.all', 'then', 'map'],
      order: 8,
      solution: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<string[]> {
  const order: string[] = [];
  await Promise.all(
    tasks.map((task) =>
      simulate(task).then((id) => {
        order.push(id);
      }),
    ),
  );
  return order;
}
`),
      starterCode: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<string[]> {
  // for await walks promises by index — react to each promise as it settles instead.
  return [];
}
`),
      tests: [
        tc(
          'slowest task listed first finishes last (trap)',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 40, id: 'c' },
            ],
          ],
          ['b', 'c', 'a'],
        ),
        tc(
          'two tasks in reverse (trap)',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
            ],
          ],
          ['b', 'a'],
        ),
        tc(
          'already in finish order',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, id: 'b' },
            ],
          ],
          ['a', 'b'],
        ),
        tc('no tasks', [[]], []),
      ],
      title: 'for await consumes in input order',
      trap: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<string[]> {
  const order: string[] = [];
  for await (const id of tasks.map(simulate)) {
    order.push(id);
  }
  return order;
}
`),
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Run every task CONCURRENTLY and resolve to the event log: push `start:<id>` when a task begins and ' +
        '`end:<id>` when it finishes. Delays `a: 40`, `b: 10` → `["start:a", "start:b", "end:b", "end:a"]`. ' +
        'No task fails.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<string[]>`\n\n' +
        'Trap: `await` inside a `for` loop starts the next task only after the previous one has ended.',
      difficulty: 'advanced',
      explanation:
        'An `await` pauses the function it sits in, and a `for` loop is inside that function — so ' +
        '`for (const task of tasks) { await simulate(task) }` runs the tasks one after another, and the log ' +
        'reads `start:a, end:a, start:b, end:b` no matter how short `b` is. The loop is correct when you WANT ' +
        'a sequence, but here it is the trap. Concurrency needs every timer started before any of them is ' +
        'awaited: `map` with an `async` callback does exactly that, because each callback runs synchronously ' +
        'up to its first `await`, pushing `start:` and kicking off `simulate` before `map` moves to the next ' +
        'task. `Promise.all` then waits for all the callbacks, whose `end:` entries land in finish order. The ' +
        'shape `Promise.all(tasks.map(async …))` versus `for … await` is the single most important ' +
        'distinction in async array code.',
      id: 'awaiting-in-a-loop-serialises',
      methods: ['Promise.all', 'map'],
      order: 9,
      solution: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<string[]> {
  const log: string[] = [];
  await Promise.all(
    tasks.map(async (task) => {
      log.push(\`start:\${task.id}\`);
      await simulate(task);
      log.push(\`end:\${task.id}\`);
    }),
  );
  return log;
}
`),
      starterCode: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<string[]> {
  // Every start: entry must be logged before the first end: — a loop that awaits cannot do that.
  return [];
}
`),
      tests: [
        tc(
          'the slow task starts first and ends last (trap)',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
            ],
          ],
          ['start:a', 'start:b', 'end:b', 'end:a'],
        ),
        tc(
          'all starts precede all ends (trap)',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, id: 'b' },
            ],
          ],
          ['start:a', 'start:b', 'end:a', 'end:b'],
        ),
        tc(
          'three tasks end in delay order (trap)',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 40, id: 'c' },
            ],
          ],
          ['start:a', 'start:b', 'start:c', 'end:b', 'end:c', 'end:a'],
        ),
        tc('a single task', [[{ delayMs: 10, id: 'a' }]], ['start:a', 'end:a']),
      ],
      title: 'Awaiting in a loop serialises',
      trap: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<string[]> {
  const log: string[] = [];
  for (const task of tasks) {
    log.push(\`start:\${task.id}\`);
    await simulate(task);
    log.push(\`end:\${task.id}\`);
  }
  return log;
}
`),
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Run the tasks ONE AT A TIME by folding them into a single `then` chain with `reduce`, and resolve to ' +
        'the event log (`start:<id>` / `end:<id>`). Delays `a: 40`, `b: 10` → ' +
        '`["start:a", "end:a", "start:b", "end:b"]`; no tasks → `[]`. No task fails.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<string[]>`\n\n' +
        'Trap: a `reduce` with no initial value uses the first task as the accumulator — and a task has no `then`.',
      difficulty: 'advanced',
      explanation:
        'Folding tasks into a promise chain is a classic `reduce`: the accumulator is the promise for ' +
        '"everything so far", and each step returns `chain.then(() => run(task))`, so the next task starts ' +
        'only when the previous one has finished. The subtlety is the seed. Leave it out and `reduce` takes ' +
        '`tasks[0]` — a plain object — as the initial accumulator: with one task the callback never runs and ' +
        '`solve` resolves to the task itself; with two, `tasks[0].then` is not a function and it throws; with ' +
        'none, `reduce` throws "Reduce of empty array with no initial value". `Promise.resolve()` as the seed ' +
        'fixes all three shapes at once — the chain starts from an already-settled promise, so the first ' +
        '`then` fires straight away and an empty list yields an empty log. Whenever the accumulator has a ' +
        'different type from the elements, `reduce` needs an initial value.',
      id: 'chain-needs-a-promise-seed',
      methods: ['reduce', 'then', 'Promise.resolve'],
      order: 10,
      solution: code(`
${LOG_HELPER}
export function solve(tasks: Task[]): Promise<string[]> {
  const log: string[] = [];
  return tasks
    .reduce((chain, task) => chain.then(() => run(task, log)), Promise.resolve())
    .then(() => log);
}
`),
      starterCode: code(`
${LOG_HELPER}
export function solve(tasks: Task[]): Promise<string[]> {
  // Fold every task onto one then-chain — and think about what the chain starts from.
  return Promise.resolve([]);
}
`),
      tests: [
        tc('a single task (trap)', [[{ delayMs: 10, id: 'a' }]], ['start:a', 'end:a']),
        tc(
          'two tasks run one after the other (trap)',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
            ],
          ],
          ['start:a', 'end:a', 'start:b', 'end:b'],
        ),
        tc(
          'three tasks keep input order regardless of delay (trap)',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 10, id: 'c' },
            ],
          ],
          ['start:a', 'end:a', 'start:b', 'end:b', 'start:c', 'end:c'],
        ),
        tc('no tasks resolves to an empty log (trap)', [[]], []),
      ],
      title: 'A chain needs a promise seed',
      trap: code(`
${LOG_HELPER}
export function solve(tasks: Task[]): Promise<string[]> {
  const log: string[] = [];
  return tasks.reduce((chain, task) => chain.then(() => run(task, log))).then(() => log);
}
`),
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'For each task, at its INPUT position, resolve to the rank at which it finished — `1` for the first to ' +
        'finish, `2` for the next, and so on. Delays `a: 70`, `b: 10`, `c: 40` → `[3, 1, 2]`. No task ' +
        'fails.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<number[]>`\n\n' +
        'Trap: pushing the rank as each task completes records the ranks in finish order, not input order.',
      difficulty: 'advanced',
      explanation:
        'Two orders are in play: the order tasks finish, which decides the RANK, and the order they were ' +
        'given, which decides the POSITION. The trap gets the ranks right and the positions wrong: a shared ' +
        'counter incremented inside `then` hands out `1, 2, 3` correctly, but `ranks.push(++rank)` writes ' +
        'them in finish order, so the array is always `[1, 2, 3]`. The fix is to stop pushing. `map` gives ' +
        'every task its own promise, `then` on that promise returns the counter value as that promise’s ' +
        'resolved value, and `Promise.all` places each resolved value at the index of the promise that ' +
        'produced it — position handled by the combinator, rank handled by the counter. ' +
        '`Promise.all(tasks.map((task) => simulate(task).then(() => ++rank)))` is complete. Let `Promise.all` ' +
        'keep positions; it already does that for you.',
      id: 'finish-rank-per-position',
      methods: ['Promise.all', 'map', 'then'],
      order: 11,
      solution: code(`
${TASK_HELPER}
export function solve(tasks: Task[]): Promise<number[]> {
  let rank = 0;
  return Promise.all(tasks.map((task) => simulate(task).then(() => ++rank)));
}
`),
      starterCode: code(`
${TASK_HELPER}
export function solve(tasks: Task[]): Promise<number[]> {
  // A counter in then() gives the rank — but where does each rank get stored?
  return Promise.resolve([]);
}
`),
      tests: [
        tc(
          'slowest first, fastest second (trap)',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 40, id: 'c' },
            ],
          ],
          [3, 1, 2],
        ),
        tc(
          'two tasks in reverse (trap)',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
            ],
          ],
          [2, 1],
        ),
        tc(
          'already in finish order',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          [1, 2, 3],
        ),
        tc('no tasks', [[]], []),
      ],
      title: 'Finish rank, kept at its position',
      trap: code(`
${TASK_HELPER}
export async function solve(tasks: Task[]): Promise<number[]> {
  const ranks: number[] = [];
  let rank = 0;
  await Promise.all(tasks.map((task) => simulate(task).then(() => ranks.push(++rank))));
  return ranks;
}
`),
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Reimplement `Promise.all` from `new Promise` and `then` — no `Promise.all`, `allSettled`, `any`, or ' +
        '`race`. Resolve to `{ ok: true, values }` with every id in INPUT order, or `{ ok: false, reason }` ' +
        'with the FIRST failure message the moment it happens. An empty list resolves `{ ok: true, values: [] }`.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<{ ok: true; values: string[] } | { ok: false; reason: string }>`',
      difficulty: 'expert',
      explanation:
        '`Promise.all` is a counter and an array. Inside `new Promise((resolve, reject) => …)` allocate ' +
        '`values` with one slot per input and a `remaining` counter at `length`; `forEach` over the promises ' +
        'attaches a two-handler `then`: on fulfilment store the value at THAT promise’s index — this is ' +
        'what keeps input order — decrement `remaining`, and call `resolve(values)` when it hits zero; on ' +
        'rejection call `reject` directly, and because a promise can settle only once the first rejection ' +
        'wins and later outcomes are ignored. The edge case is the empty list: the counter starts at zero ' +
        'and nothing will ever decrement it, so `resolve([])` must be called immediately or the promise ' +
        'stays pending forever. The outer `then(onOk, onFail)` turns the result into plain data. Every ' +
        'input promise gets a handler, so nothing rejects unobserved.',
      id: 'rebuild-promise-all',
      methods: ['new Promise', 'then', 'forEach'],
      order: 12,
      solution: code(`
${TASK_HELPER}
type Outcome = { ok: false; reason: string } | { ok: true; values: string[] };

function all(promises: Promise<string>[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const values: string[] = new Array(promises.length);
    let remaining = promises.length;
    if (remaining === 0) {
      resolve(values);
      return;
    }
    promises.forEach((promise, index) => {
      promise.then((value) => {
        values[index] = value;
        remaining -= 1;
        if (remaining === 0) {
          resolve(values);
        }
      }, reject);
    });
  });
}

export function solve(tasks: Task[]): Promise<Outcome> {
  return all(tasks.map(simulate)).then(
    (values): Outcome => ({ ok: true, values }),
    (error: Error): Outcome => ({ ok: false, reason: error.message }),
  );
}
`),
      starterCode: code(`
${TASK_HELPER}
type Outcome = { ok: false; reason: string } | { ok: true; values: string[] };

function all(promises: Promise<string>[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Store each value at its index, count down to zero, reject on the first failure.
    // What should happen when there are no promises at all?
    reject(new Error('not implemented'));
  });
}

export function solve(tasks: Task[]): Promise<Outcome> {
  // Once all() works, feed it tasks.map(simulate) and map the outcome with a two-handler then().
  // Until then no task promise is created, so nothing can reject without a handler.
  return Promise.resolve({ ok: false, reason: 'not implemented' });
}
`),
      tests: [
        tc(
          'values land at their input index',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 40, id: 'c' },
            ],
          ],
          { ok: true, values: ['a', 'b', 'c'] },
        ),
        tc(
          'the first failure to happen wins',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 70, fails: true, id: 'b' },
              { delayMs: 40, fails: true, id: 'c' },
            ],
          ],
          { ok: false, reason: 'c failed' },
        ),
        tc(
          'a failure after every success has arrived',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, fails: true, id: 'b' },
            ],
          ],
          { ok: false, reason: 'b failed' },
        ),
        tc('no tasks resolves immediately', [[]], { ok: true, values: [] }),
        tc('a single task', [[{ delayMs: 10, id: 'only' }]], { ok: true, values: ['only'] }),
      ],
      title: 'Rebuild Promise.all',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Produce the same report as "The shape of a settled result" — `{ status: "fulfilled", value }` or ' +
        '`{ status: "rejected", reason: message }` per task in INPUT order — WITHOUT `Promise.allSettled`. ' +
        'Wrap each promise so it can never reject, then gather with `Promise.all`.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<Settled[]>`',
      difficulty: 'expert',
      explanation:
        '`Promise.all` fails fast only because its inputs can reject. Feed it promises that cannot, and it ' +
        'becomes `allSettled`. The tool is the two-argument form of `then`: `promise.then(onFulfilled, ' +
        'onRejected)` returns a NEW promise that resolves with whatever the handler that ran returned — so ' +
        'if both handlers return a plain record, the wrapped promise always fulfils. `map` each task to ' +
        '`simulate(task).then((value) => ({ status: "fulfilled", value }), (error) => ({ status: "rejected", ' +
        'reason: error.message }))`, and `Promise.all` over those can only ever resolve, in input order. ' +
        'Note that `then(f, g)` is not the same as `then(f).catch(g)`: the second form would also catch an ' +
        'error thrown inside `f`. Here that difference is harmless, but the two-argument form states the ' +
        'intent — one handler per outcome of the ORIGINAL promise, nothing else.',
      id: 'rebuild-allsettled-from-then',
      methods: ['Promise.all', 'then', 'map'],
      order: 13,
      solution: code(`
${TASK_HELPER}
type Settled = { status: 'fulfilled'; value: string } | { reason: string; status: 'rejected' };

export function solve(tasks: Task[]): Promise<Settled[]> {
  return Promise.all(
    tasks.map((task) =>
      simulate(task).then(
        (value): Settled => ({ status: 'fulfilled', value }),
        (error: Error): Settled => ({ reason: error.message, status: 'rejected' }),
      ),
    ),
  );
}
`),
      starterCode: code(`
${TASK_HELPER}
type Settled = { status: 'fulfilled'; value: string } | { reason: string; status: 'rejected' };

export function solve(tasks: Task[]): Promise<Settled[]> {
  // then() takes TWO handlers — make each promise resolve to a record whichever way it settles.
  return Promise.resolve([]);
}
`),
      tests: [
        tc(
          'mixed success and failure in input order',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 40, fails: true, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
          ],
          [
            { status: 'fulfilled', value: 'a' },
            { reason: 'b failed', status: 'rejected' },
            { status: 'fulfilled', value: 'c' },
          ],
        ),
        tc(
          'a fast failure does not end the gather early',
          [
            [
              { delayMs: 10, fails: true, id: 'a' },
              { delayMs: 40, id: 'b' },
            ],
          ],
          [
            { reason: 'a failed', status: 'rejected' },
            { status: 'fulfilled', value: 'b' },
          ],
        ),
        tc(
          'every task fails',
          [
            [
              { delayMs: 40, fails: true, id: 'a' },
              { delayMs: 10, fails: true, id: 'b' },
            ],
          ],
          [
            { reason: 'a failed', status: 'rejected' },
            { reason: 'b failed', status: 'rejected' },
          ],
        ),
        tc('no tasks', [[]], []),
      ],
      title: 'Rebuild allSettled from then',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Run the tasks with at most `limit` in flight at once and resolve to the event log (`start:<id>` / ' +
        '`end:<id>`). A slot that frees up immediately starts the next task in INPUT order. `limit >= ' +
        'tasks.length` is fully concurrent; `limit === 1` is sequential; no tasks → `[]`. No task fails.\n\n' +
        'Signature: `solve(tasks: Task[], limit: number): Promise<string[]>`',
      difficulty: 'expert',
      explanation:
        'A pool is `limit` workers sharing one cursor. `Array.from({ length: Math.min(limit, tasks.length) }, ' +
        'worker)` starts that many `async` workers at once, and each worker loops: read `tasks[cursor++]`, ' +
        'log `start:`, `await simulate`, log `end:`, and go round again until the cursor has passed the end. ' +
        'Because the cursor is shared and JavaScript is single-threaded, two workers can never claim the ' +
        'same task, and whichever worker frees up first takes the next index — so the log shows a slot ' +
        'being reused, not a fixed batch. `Promise.all` over the workers resolves when every worker has run ' +
        'out of tasks. The loop bound matters: a worker that checks `cursor < tasks.length` before each ' +
        'claim exits cleanly, while an off-by-one leaves it awaiting `simulate(undefined)` and the pool never ' +
        'settles. With `limit` equal to the length this degenerates into plain `map` + `Promise.all`.',
      id: 'bounded-concurrency-pool',
      methods: ['Array.from', 'Promise.all'],
      order: 14,
      solution: code(`
${TASK_HELPER}
export async function solve(tasks: Task[], limit: number): Promise<string[]> {
  const log: string[] = [];
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (cursor < tasks.length) {
      const task = tasks[cursor];
      cursor += 1;
      log.push(\`start:\${task.id}\`);
      await simulate(task);
      log.push(\`end:\${task.id}\`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return log;
}
`),
      starterCode: code(`
${TASK_HELPER}
export async function solve(tasks: Task[], limit: number): Promise<string[]> {
  // Start limit workers that each pull the next index from a shared cursor until it runs out.
  return [];
}
`),
      tests: [
        // Schedule, limit 2: t0 start a (ends 120) + start b (ends 10); t10 end b, start c (ends 50);
        // t50 end c, start d (ends 90); t90 end d, worker 2 exits; t120 end a. Gaps: 10/50/90/120.
        tc(
          'a freed slot starts the next task',
          [
            [
              { delayMs: 120, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 40, id: 'c' },
              { delayMs: 40, id: 'd' },
            ],
            2,
          ],
          ['start:a', 'start:b', 'end:b', 'start:c', 'end:c', 'start:d', 'end:d', 'end:a'],
        ),
        // Schedule, limit 2: t0 start a (ends 10) + start b (ends 100); t10 end a, start c (ends 50);
        // t50 end c, worker 1 exits; t100 end b. Gaps: 10/50/100.
        tc(
          'the slot that frees first takes the next task',
          [
            [
              { delayMs: 10, id: 'a' },
              { delayMs: 100, id: 'b' },
              { delayMs: 40, id: 'c' },
            ],
            2,
          ],
          ['start:a', 'start:b', 'end:a', 'start:c', 'end:c', 'end:b'],
        ),
        // Schedule, limit 1: a runs alone (ends 40), then b (ends 50).
        tc(
          'limit 1 is sequential',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
            ],
            1,
          ],
          ['start:a', 'end:a', 'start:b', 'end:b'],
        ),
        // Schedule, limit 3 (≥ length): all start at t0; ends at 10 (b), 40 (a), 70 (c).
        tc(
          'a limit at or above the length is fully concurrent',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
            3,
          ],
          ['start:a', 'start:b', 'start:c', 'end:b', 'end:a', 'end:c'],
        ),
        tc('no tasks', [[], 2], []),
      ],
      title: 'A pool with at most N in flight',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Each task carries `failFirst`: `simulate(task, attempt)` rejects while `attempt <= failFirst`. Retry ' +
        'each task sequentially — attempt 1, then 2, … — up to `maxAttempts`, while running ALL tasks ' +
        'concurrently. Resolve to `{ attempts, id, ok }` per task in INPUT order, where `attempts` counts every ' +
        'attempt made and `ok` is whether one succeeded within the budget.\n\n' +
        'Signature: `solve(tasks: Task[], maxAttempts: number): Promise<Outcome[]>`',
      difficulty: 'expert',
      explanation:
        'Two shapes nest here. Across tasks the work is concurrent — `map` to an `async` callback per task ' +
        'and `Promise.all` to gather in input order — but WITHIN a task the attempts are sequential, because ' +
        'attempt 2 only makes sense after attempt 1 has failed. That inner sequence is a `for` loop with ' +
        '`try`/`catch` around `await simulate(task, attempt)`: a success returns `{ attempts, id, ok: true }` ' +
        'from inside the loop, a rejection is swallowed by the `catch` and the loop goes round again. The ' +
        'loop bound is the budget: iterate `attempt` from `1` to `maxAttempts` and, if the loop falls off the ' +
        'end, report `ok: false` with `attempts` at the budget. Looping "until success" instead would never ' +
        'return for a task whose `failFirst` exceeds the budget. Every promise is awaited inside the ' +
        '`try`, so a rejection can never escape as unhandled.',
      id: 'retry-with-attempt-budget',
      methods: ['Promise.all', 'map'],
      order: 15,
      solution: code(`
${RETRY_HELPER}
export function solve(tasks: Task[], maxAttempts: number): Promise<Outcome[]> {
  return Promise.all(
    tasks.map(async (task): Promise<Outcome> => {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          await simulate(task, attempt);
          return { attempts: attempt, id: task.id, ok: true };
        } catch {
          // Retry until the budget runs out.
        }
      }
      return { attempts: maxAttempts, id: task.id, ok: false };
    }),
  );
}
`),
      starterCode: code(`
${RETRY_HELPER}
export function solve(tasks: Task[], maxAttempts: number): Promise<Outcome[]> {
  // Concurrent across tasks, sequential within a task — and bounded by the budget, not by success.
  return Promise.resolve([]);
}
`),
      tests: [
        tc(
          'each task uses as many attempts as it needs',
          [
            [
              { delayMs: 10, failFirst: 0, id: 'a' },
              { delayMs: 10, failFirst: 2, id: 'b' },
              { delayMs: 10, failFirst: 1, id: 'c' },
            ],
            3,
          ],
          [
            { attempts: 1, id: 'a', ok: true },
            { attempts: 3, id: 'b', ok: true },
            { attempts: 2, id: 'c', ok: true },
          ],
        ),
        tc(
          'a task that outlasts the budget is reported as failed',
          [
            [
              { delayMs: 10, failFirst: 5, id: 'a' },
              { delayMs: 10, failFirst: 0, id: 'b' },
            ],
            3,
          ],
          [
            { attempts: 3, id: 'a', ok: false },
            { attempts: 1, id: 'b', ok: true },
          ],
        ),
        tc(
          'a budget of one means no retries',
          [
            [
              { delayMs: 10, failFirst: 1, id: 'a' },
              { delayMs: 10, failFirst: 0, id: 'b' },
            ],
            1,
          ],
          [
            { attempts: 1, id: 'a', ok: false },
            { attempts: 1, id: 'b', ok: true },
          ],
        ),
        tc('no tasks', [[], 3], []),
      ],
      title: 'Retry with an attempt budget',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'The starter provides a callback-style `simulateCallback(task, (error, id) => …)`. Turn each call into ' +
        'a promise with `Promise.withResolvers` and resolve to the ids in INPUT order (delays are out of ' +
        'order). No task fails, but route an `error` argument to `reject` anyway.\n\n' +
        'Signature: `solve(tasks: Task[]): Promise<string[]>`',
      difficulty: 'expert',
      explanation:
        'Bridging a callback API to promises used to mean the `new Promise((resolve, reject) => …)` closure ' +
        'dance: everything that needs `resolve` has to be written inside the executor. ' +
        '`Promise.withResolvers()` (ES2024) hands back `{ promise, resolve, reject }` as plain values, so the ' +
        'code reads top to bottom — create the deferred, call `simulateCallback` with a callback that ' +
        'forwards `error` to `reject` and `id` to `resolve`, return `promise`. The deferred is the whole ' +
        'point: the promise exists before the work that settles it, and the settling functions can be passed ' +
        'anywhere, which is what a Node-style callback needs. `map` that helper over the tasks and ' +
        '`Promise.all` gathers the ids in input order, however the timers fire. Note that every rejection has ' +
        'a home — `Promise.all` observes each promise — so nothing rejects unhandled.',
      id: 'deferred-with-withresolvers',
      methods: ['Promise.withResolvers', 'Promise.all', 'map'],
      order: 16,
      solution: code(`
${CALLBACK_HELPER}
function promisify(task: Task): Promise<string> {
  const { promise, reject, resolve } = Promise.withResolvers<string>();
  simulateCallback(task, (error, id) => {
    if (error) {
      reject(error);
    } else {
      resolve(id as string);
    }
  });
  return promise;
}

export function solve(tasks: Task[]): Promise<string[]> {
  return Promise.all(tasks.map(promisify));
}
`),
      starterCode: code(`
${CALLBACK_HELPER}
export function solve(tasks: Task[]): Promise<string[]> {
  // Promise.withResolvers gives you { promise, resolve, reject } up front — hand them to the callback.
  return Promise.resolve([]);
}
`),
      tests: [
        tc(
          'ids come back in input order despite out-of-order delays',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 40, id: 'c' },
            ],
          ],
          ['a', 'b', 'c'],
        ),
        tc(
          'two tasks in reverse',
          [
            [
              { delayMs: 40, id: 'x' },
              { delayMs: 10, id: 'y' },
            ],
          ],
          ['x', 'y'],
        ),
        tc('a single task', [[{ delayMs: 10, id: 'solo' }]], ['solo']),
        tc('no tasks', [[]], []),
      ],
      title: 'Callbacks to promises with withResolvers',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Resolve to the id of the fastest task, or to `"timed out"` if none finishes within `budgetMs`. An ' +
        'empty list resolves `"timed out"` once the budget elapses. No task fails.\n\n' +
        'Signature: `solve(tasks: Task[], budgetMs: number): Promise<string>`',
      difficulty: 'expert',
      explanation:
        'A deadline is just one more contestant. Build a sentinel promise that resolves to `"timed out"` ' +
        'after `budgetMs`, and `Promise.race` the task promises against it: whichever settles first — a ' +
        'task or the timer — is the answer. `map` produces the task promises and a spread appends the ' +
        'sentinel, `Promise.race([...tasks.map(simulate), deadline])`. The sentinel also fixes the empty ' +
        'case for free. `Promise.race([])` never settles, because there is no promise to win — a real hazard ' +
        'when the list comes from a filter that may match nothing — but with the sentinel always present the ' +
        'race has at least one runner, so an empty input resolves to `"timed out"` after the budget rather ' +
        'than hanging. The losing timers keep running; in production you would clear them, but the race ' +
        'result is already decided.',
      id: 'race-against-a-deadline',
      methods: ['Promise.race', 'map'],
      order: 17,
      solution: code(`
${TASK_HELPER}
export function solve(tasks: Task[], budgetMs: number): Promise<string> {
  const deadline = new Promise<string>((resolve) => {
    setTimeout(() => resolve('timed out'), budgetMs);
  });
  return Promise.race([...tasks.map(simulate), deadline]);
}
`),
      starterCode: code(`
${TASK_HELPER}
export function solve(tasks: Task[], budgetMs: number): Promise<string> {
  // Put a timer in the race — and remember that Promise.race([]) never settles.
  return Promise.resolve('');
}
`),
      tests: [
        tc(
          'the fastest task beats the deadline',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 70, id: 'c' },
            ],
            60,
          ],
          'b',
        ),
        tc(
          'no task finishes in time',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 100, id: 'b' },
            ],
            30,
          ],
          'timed out',
        ),
        tc('a single task within budget', [[{ delayMs: 10, id: 'a' }], 50], 'a'),
        tc('no tasks times out after the budget', [[], 20], 'timed out'),
      ],
      title: 'Race against a deadline',
    },
    {
      categoryId: 'async-arrays-and-promises',
      description:
        'Resolve to the ids of the first `k` tasks to FINISH, in finish order, as soon as the k-th one ' +
        'arrives — do not wait for the rest. `k >= tasks.length` waits for all of them; `k === 0` resolves ' +
        '`[]` immediately. Delays `a: 70`, `b: 10`, `c: 40` with `k = 2` → `["b", "c"]`. No task fails.\n\n' +
        'Signature: `solve(tasks: Task[], k: number): Promise<string[]>`',
      difficulty: 'expert',
      explanation:
        'The obvious approach — `Promise.race` in a loop, removing the winner each round — needs to know ' +
        'WHICH promise won, which `Promise.race` does not tell you, so it ends up tagging every promise and ' +
        'racing the rest again, O(n·k) with identity bookkeeping. The direct approach is one deferred. ' +
        '`Promise.withResolvers()` gives a promise and its `resolve`; `forEach` attaches a `then` to every ' +
        'task promise that pushes the id onto `finished` and, when `finished.length` reaches the target, ' +
        'calls `resolve` with a copy. Late arrivals still run their `then`, but the guard ignores them. The ' +
        'target is `Math.min(k, tasks.length)`, so `k` beyond the length waits for everyone instead of ' +
        'waiting forever, and a target of zero must `resolve([])` up front because no `then` will ever ' +
        'fire. One promise, one counter, no re-racing — the `then` handlers report in the order the timers ' +
        'actually fire.',
      id: 'first-k-to-finish',
      methods: ['Promise.withResolvers', 'then', 'forEach'],
      order: 18,
      solution: code(`
${TASK_HELPER}
export function solve(tasks: Task[], k: number): Promise<string[]> {
  const { promise, resolve } = Promise.withResolvers<string[]>();
  const target = Math.min(k, tasks.length);
  const finished: string[] = [];
  if (target === 0) {
    resolve([]);
  }
  tasks.forEach((task) => {
    simulate(task).then((id) => {
      if (finished.length < target) {
        finished.push(id);
        if (finished.length === target) {
          resolve([...finished]);
        }
      }
    });
  });
  return promise;
}
`),
      starterCode: code(`
${TASK_HELPER}
export function solve(tasks: Task[], k: number): Promise<string[]> {
  // One deferred, one counter: resolve the moment the k-th then() fires — and handle k of 0 and k > length.
  return Promise.resolve([]);
}
`),
      tests: [
        tc(
          'the first two of three',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 40, id: 'c' },
            ],
            2,
          ],
          ['b', 'c'],
        ),
        tc(
          'k beyond the length waits for everyone',
          [
            [
              { delayMs: 40, id: 'a' },
              { delayMs: 10, id: 'b' },
            ],
            5,
          ],
          ['b', 'a'],
        ),
        tc(
          'k of one is the fastest task',
          [
            [
              { delayMs: 70, id: 'a' },
              { delayMs: 10, id: 'b' },
              { delayMs: 40, id: 'c' },
            ],
            1,
          ],
          ['b'],
        ),
        tc('k of zero resolves to nothing', [[{ delayMs: 10, id: 'a' }], 0], []),
        tc('no tasks resolves to nothing', [[], 2], []),
      ],
      title: 'First k to finish',
    },
  ],
};
