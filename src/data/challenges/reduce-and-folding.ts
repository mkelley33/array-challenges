import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const reduceAndFolding: CategoryModule = {
  category: {
    description:
      'Fold arrays down to numbers, objects, and new arrays — and learn exactly when reduce blows up without a seed.',
    id: 'reduce-and-folding',
    order: 6,
    title: 'Reduce & Folding',
  },
  challenges: [
    {
      categoryId: 'reduce-and-folding',
      description:
        'Return the average of `numbers`. An empty array averages to `0`, not `NaN`.\n\n' +
        'Signature: `solve(numbers: number[]): number`\n\n' +
        'Use `reduce` with an explicit initial value to build the sum.',
      difficulty: 'novice',
      explanation:
        '`reduce` threads an accumulator through the array: the callback receives `(accumulator, element)` and ' +
        'whatever it returns becomes the accumulator for the next element. The second argument to `reduce` — here ' +
        '`0` — is the initial accumulator, so the very first call sees `(0, numbers[0])`. Summing with a seed of `0` ' +
        'then dividing by `length` gives the average in two clean steps. The early return guards the empty case: ' +
        'with no elements the fold never runs and `0 / 0` would otherwise produce `NaN`.',
      id: 'average-with-reduce',
      methods: ['reduce'],
      order: 1,
      solution: code(`
export function solve(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  const total = numbers.reduce((sum, value) => sum + value, 0);
  return total / numbers.length;
}
`),
      starterCode: code(`
export function solve(numbers: number[]): number {
  // Fold the array into a sum first — reduce((acc, value) => ..., initial).
  return 0;
}
`),
      tests: [
        tc('average of whole numbers', [[2, 4, 6]], 4),
        tc('single element is its own average', [[7]], 7),
        tc('empty array averages to zero', [[]], 0),
        tc('fractional average', [[1, 2]], 1.5),
        tc('negative values pull the average down', [[-2, 2, 6]], 2),
      ],
      title: 'Average via reduce',
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Count how many times each word appears in `words`, returning a plain object mapping word → count.\n\n' +
        'Signature: `solve(words: string[]): Record<string, number>`\n\n' +
        'Example: `solve(["a", "b", "a"])` → `{ a: 2, b: 1 }`',
      difficulty: 'intermediate',
      explanation:
        'The accumulator of a `reduce` does not have to be a number — seeding it with `{}` turns the fold into an ' +
        'index builder. Each step writes `counts[word] = (counts[word] ?? 0) + 1`: the `??` supplies `0` the first ' +
        'time a word appears, because reading a missing key yields `undefined`. Returning the same object from every ' +
        'step keeps the fold O(n); the classic mistake is forgetting the `return counts`, which makes the next ' +
        'iteration receive `undefined` and crash. This accumulator-object pattern is the hand-rolled ancestor of ' +
        '`Object.groupBy`.',
      id: 'count-occurrences',
      methods: ['reduce'],
      order: 2,
      solution: code(`
export function solve(words: string[]): Record<string, number> {
  return words.reduce<Record<string, number>>((counts, word) => {
    counts[word] = (counts[word] ?? 0) + 1;
    return counts;
  }, {});
}
`),
      starterCode: code(`
export function solve(words: string[]): Record<string, number> {
  // Seed reduce with an empty object and bump counts[word] each step.
  return {};
}
`),
      tests: [
        tc('counts repeated words', [['apple', 'banana', 'apple']], { apple: 2, banana: 1 }),
        tc('all unique words count once', [['a', 'b', 'c']], { a: 1, b: 1, c: 1 }),
        tc('empty array yields empty record', [[]], {}),
        tc('one word repeated many times', [['x', 'x', 'x', 'x']], { x: 4 }),
      ],
      title: 'Count occurrences',
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Return the person with the highest `wealth`. If two people tie, keep the earlier one. ' +
        'An empty list returns `null`.\n\n' +
        'Signature: `solve(people: { name: string; wealth: number }[]): { name: string; wealth: number } | null`',
      difficulty: 'intermediate',
      explanation:
        '`reduce` doubles as a max-finder that keeps the *whole element*, not just the winning number: the callback ' +
        '`(richest, person) => (person.wealth > richest.wealth ? person : richest)` carries the best candidate ' +
        'forward. Compare with `Math.max(...people.map((p) => p.wealth))`: the spread pushes every element onto the ' +
        'call stack (hundreds of thousands of elements can throw a RangeError), and even when it survives you only ' +
        'get the number back — a second pass is needed to find who owned it. The strict `>` keeps the first of any ' +
        'tie, and the length guard returns `null` before a seedless fold could throw on `[]`.',
      id: 'richest-person',
      methods: ['reduce'],
      order: 3,
      solution: code(`
interface Person {
  name: string;
  wealth: number;
}

export function solve(people: Person[]): Person | null {
  if (people.length === 0) {
    return null;
  }
  return people.reduce((richest, person) => (person.wealth > richest.wealth ? person : richest));
}
`),
      starterCode: code(`
interface Person {
  name: string;
  wealth: number;
}

export function solve(people: Person[]): Person | null {
  // Carry the best candidate object through the fold — not just its number.
  return null;
}
`),
      tests: [
        tc(
          'finds the richest person',
          [
            [
              { name: 'Ada', wealth: 300 },
              { name: 'Grace', wealth: 500 },
              { name: 'Alan', wealth: 200 },
            ],
          ],
          { name: 'Grace', wealth: 500 },
        ),
        tc('single person wins by default', [[{ name: 'Solo', wealth: 1 }]], { name: 'Solo', wealth: 1 }),
        tc('empty list yields null', [[]], null),
        tc(
          'tie keeps the earlier person',
          [
            [
              { name: 'First', wealth: 100 },
              { name: 'Second', wealth: 100 },
            ],
          ],
          { name: 'First', wealth: 100 },
        ),
      ],
      title: 'Richest person',
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Total a shopping cart: return the sum of `amounts`, and `0` when the cart is empty.\n\n' +
        'Signature: `solve(amounts: number[]): number`\n\n' +
        'The starter code works on every non-empty cart and throws a `TypeError` on `[]` — figure out why before fixing it.',
      difficulty: 'advanced',
      explanation:
        '`reduce` has two modes. With an initial value, the fold starts at your seed and visits every element. ' +
        '*Without* one, `reduce` silently promotes element 0 to be the seed and starts folding from element 1 — ' +
        'which usually works, masks the bug, and then throws `TypeError: Reduce of empty array with no initial ' +
        'value` the first time an empty array shows up, because there is no element 0 to promote. The seedless form ' +
        'also changes types subtly: the accumulator starts as an *element*, not as whatever your seed would be. ' +
        'Passing `0` as the explicit initial value fixes both behaviors at once — `[].reduce(fn, 0)` never invokes ' +
        'the callback and just returns the seed. Rule of thumb: always pass an initial value unless you have proven ' +
        'the array is non-empty.',
      id: 'safe-total',
      methods: ['reduce'],
      order: 4,
      solution: code(`
export function solve(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0);
}
`),
      starterCode: code(`
export function solve(amounts: number[]): number {
  // Works right up until amounts is [] — what does reduce use as its seed here?
  return amounts.reduce((total, amount) => total + amount);
}
`),
      tests: [
        tc('sums a full cart', [[12, 30, 8]], 50),
        tc('empty cart totals zero (trap)', [[]], 0),
        tc('single amount', [[42]], 42),
        tc('negative adjustments subtract', [[100, -25, -5]], 70),
      ],
      title: 'The empty-cart TypeError',
      trap: code(`
export function solve(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + amount);
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Turn a list of transactions into a running balance: each output element is the sum of all transactions up ' +
        'to and including that point.\n\n' +
        'Signature: `solve(transactions: number[]): number[]`\n\n' +
        'Example: `solve([100, -30, 50])` → `[100, 70, 120]`',
      difficulty: 'advanced',
      explanation:
        'This is a *scan* — a fold that keeps every intermediate accumulator instead of only the last one. Seeding ' +
        '`reduce` with an empty array, each step appends one new balance: `[...balances, (balances.at(-1) ?? 0) + ' +
        'transaction]`. The previous running total is simply the last element already collected, and `?? 0` covers ' +
        'the very first step when nothing has been collected yet — without it the first balance is ' +
        '`undefined + transaction`, which is `NaN`, and every later balance inherits the poison. Note what makes this ' +
        'different from `map`: each output element depends on *all* previous inputs, which is exactly the ' +
        'dependency shape `reduce` exists to express. (Spreading rebuilds the array each step — fine for teaching; ' +
        'a `push` into the accumulator is the O(n) variant.)',
      id: 'running-balance',
      methods: ['reduce'],
      order: 5,
      solution: code(`
export function solve(transactions: number[]): number[] {
  return transactions.reduce<number[]>(
    (balances, transaction) => [...balances, (balances.at(-1) ?? 0) + transaction],
    [],
  );
}
`),
      starterCode: code(`
export function solve(transactions: number[]): number[] {
  // A scan keeps every intermediate total — the previous balance is the last element you collected.
  return [];
}
`),
      tests: [
        tc('deposits and withdrawals', [[100, -30, 50]], [100, 70, 120]),
        tc('empty statement stays empty', [[]], []),
        tc('single transaction is its own balance (trap)', [[25]], [25]),
        tc('overdraft goes negative', [[50, -80, 10]], [50, -30, -20]),
      ],
      title: 'Running balance (scan)',
      trap: code(`
export function solve(transactions: number[]): number[] {
  return transactions.reduce<number[]>(
    (balances, transaction) => [...balances, balances[balances.length - 1] + transaction],
    [],
  );
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Build a nested object from a key path: wrap `value` inside one object per key, innermost key last.\n\n' +
        'Signature: `solve(path: string[], value: number): unknown`\n\n' +
        'Example: `solve(["a", "b", "c"], 42)` → `{ a: { b: { c: 42 } } }`. An empty path returns `value` itself.',
      difficulty: 'advanced',
      explanation:
        '`reduceRight` folds from the *last* element toward the first — same contract as `reduce`, opposite ' +
        'direction. That direction is exactly what nesting needs: the innermost layer must be built first. Seeding ' +
        'with `value`, the first step wraps it in the last key (`{ c: 42 }`), the next step wraps that in `b`, and ' +
        'so on outward: `path.reduceRight((nested, key) => ({ [key]: nested }), value)`. Running plain `reduce` with ' +
        'the same callback would produce `{ a: 42 }` wrapped in `b`, then `c` — inside-out and wrong. The computed ' +
        'property `[key]` builds each layer, the parentheses around the object literal keep it from parsing as an ' +
        'arrow-function body, and an empty path never invokes the callback, so the seed passes through untouched.',
      id: 'nested-path-object',
      methods: ['reduceRight'],
      order: 6,
      solution: code(`
export function solve(path: string[], value: number): unknown {
  return path.reduceRight<unknown>((nested, key) => ({ [key]: nested }), value);
}
`),
      starterCode: code(`
export function solve(path: string[], value: number): unknown {
  // The innermost object must exist first — which direction must the fold run?
  return {};
}
`),
      tests: [
        tc('three-level path (trap)', [['a', 'b', 'c'], 42], { a: { b: { c: 42 } } }),
        tc('single key wraps once', [['root'], 7], { root: 7 }),
        tc('empty path returns the value itself', [[], 99], 99),
        tc('two-level config path', [['server', 'port'], 8080], { server: { port: 8080 } }),
      ],
      title: 'Fold right into nesting',
      trap: code(`
export function solve(path: string[], value: number): unknown {
  return path.reduce<unknown>((nested, key) => ({ [key]: nested }), value);
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Find the smallest and largest value of `xs` in a single fold and return them as `{ max, min }`. ' +
        'An empty array returns `null`.\n\n' +
        'Signature: `solve(xs: number[]): { max: number; min: number } | null`\n\n' +
        'Trap: what do you seed the fold with? `0` is not a neutral starting point for a comparison.',
      difficulty: 'advanced',
      explanation:
        'A fold that tracks two extremes at once needs a seed that *cannot win*: `-Infinity` for the running max ' +
        'and `Infinity` for the running min, so the first real element replaces both. Seeding with ' +
        '`{ max: 0, min: 0 }` looks harmless and silently corrupts the answer whenever every value sits on one ' +
        'side of zero — for `[3, 5, 1]` the min comes back as `0`, a number that never appeared in the input. ' +
        'The alternative seed is the first element itself, `xs[0]`, which is why the length guard has to come ' +
        'first: on an empty array there is no first element and `reduce` without a seed would throw. With the ' +
        'identity-element seed, `reduce` returns a fresh `{ max, min }` object per step, so the fold never mutates ' +
        'anything it did not create.',
      id: 'min-max-one-pass',
      methods: ['reduce'],
      order: 7,
      solution: code(`
interface Extremes {
  max: number;
  min: number;
}

export function solve(xs: number[]): Extremes | null {
  if (xs.length === 0) {
    return null;
  }
  return xs.reduce<Extremes>(
    (extremes, x) => ({ max: Math.max(extremes.max, x), min: Math.min(extremes.min, x) }),
    { max: -Infinity, min: Infinity },
  );
}
`),
      starterCode: code(`
interface Extremes {
  max: number;
  min: number;
}

export function solve(xs: number[]): Extremes | null {
  // One fold, two running values — pick a seed that no real element can lose to.
  return null;
}
`),
      tests: [
        tc('all positive values (trap)', [[3, 5, 1]], { max: 5, min: 1 }),
        tc('all negative values (trap)', [[-4, -9, -2]], { max: -2, min: -9 }),
        tc('single value is both extremes', [[7]], { max: 7, min: 7 }),
        tc('values straddling zero', [[-1, 0, 1]], { max: 1, min: -1 }),
        tc('empty array yields null', [[]], null),
      ],
      title: 'Min and max, one fold',
      trap: code(`
interface Extremes {
  max: number;
  min: number;
}

export function solve(xs: number[]): Extremes | null {
  if (xs.length === 0) {
    return null;
  }
  return xs.reduce<Extremes>(
    (extremes, x) => ({ max: Math.max(extremes.max, x), min: Math.min(extremes.min, x) }),
    { max: 0, min: 0 },
  );
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Average the readings of each sensor. Return a plain object mapping sensor name → mean value.\n\n' +
        'Signature: `solve(readings: { sensor: string; value: number }[]): Record<string, number>`\n\n' +
        'Trap: an average is not something you can update one reading at a time with `(average + value) / 2`.',
      difficulty: 'advanced',
      explanation:
        'A mean needs two numbers to be maintained, not one. The tempting fold keeps a running average per sensor ' +
        'and blends each new reading in with `(average + value) / 2`, which weights the newest reading at 50% ' +
        'regardless of how many came before it: `[10, 20, 60]` averages to `30`, but the running blend produces ' +
        '`37.5`. The correct accumulator per sensor is `{ count, sum }`, which `reduce` can update exactly with ' +
        'no loss, and the division happens once at the end. `Object.fromEntries` then rebuilds the record from ' +
        '`Object.entries(totals)` mapped to `[sensor, sum / count]`. The general lesson: when a fold must produce ' +
        'a derived statistic, accumulate the *sufficient* raw quantities and derive the statistic afterwards.',
      id: 'average-by-key',
      methods: ['reduce', 'Object.fromEntries'],
      order: 8,
      solution: code(`
interface Reading {
  sensor: string;
  value: number;
}

interface Tally {
  count: number;
  sum: number;
}

export function solve(readings: Reading[]): Record<string, number> {
  const tallies = readings.reduce<Record<string, Tally>>((acc, { sensor, value }) => {
    const current = acc[sensor] ?? { count: 0, sum: 0 };
    acc[sensor] = { count: current.count + 1, sum: current.sum + value };
    return acc;
  }, {});
  return Object.fromEntries(Object.entries(tallies).map(([sensor, { count, sum }]) => [sensor, sum / count]));
}
`),
      starterCode: code(`
interface Reading {
  sensor: string;
  value: number;
}

export function solve(readings: Reading[]): Record<string, number> {
  // Accumulate { count, sum } per sensor, then divide once at the end.
  return {};
}
`),
      tests: [
        tc(
          'three readings from one sensor (trap)',
          [
            [
              { sensor: 'a', value: 10 },
              { sensor: 'a', value: 20 },
              { sensor: 'a', value: 60 },
            ],
          ],
          { a: 30 },
        ),
        tc(
          'two sensors interleaved',
          [
            [
              { sensor: 'a', value: 1 },
              { sensor: 'b', value: 10 },
              { sensor: 'a', value: 3 },
              { sensor: 'b', value: 30 },
            ],
          ],
          { a: 2, b: 20 },
        ),
        tc(
          'one reading per sensor is its own average',
          [
            [
              { sensor: 'x', value: 5 },
              { sensor: 'y', value: 7 },
            ],
          ],
          { x: 5, y: 7 },
        ),
        tc(
          'fractional average',
          [
            [
              { sensor: 'a', value: 1 },
              { sensor: 'a', value: 2 },
            ],
          ],
          { a: 1.5 },
        ),
        tc('no readings yields an empty record', [[]], {}),
      ],
      title: 'Average per sensor',
      trap: code(`
interface Reading {
  sensor: string;
  value: number;
}

export function solve(readings: Reading[]): Record<string, number> {
  return readings.reduce<Record<string, number>>((averages, { sensor, value }) => {
    averages[sensor] = sensor in averages ? (averages[sensor] + value) / 2 : value;
    return averages;
  }, {});
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Return the length of the longest run of consecutive `true` values in `flags`.\n\n' +
        'Signature: `solve(flags: boolean[]): number`\n\n' +
        'Example: `solve([true, false, true, true, false])` → `2`. No `true` at all → `0`.',
      difficulty: 'advanced',
      explanation:
        'Streak counting is a fold over a two-field accumulator: `current` (the run in progress) and `best` (the ' +
        'longest run finished so far). The trap is *when* `current` gets promoted into `best`. Doing it only when ' +
        'a `false` ends the run reads naturally and is wrong: a streak that reaches the end of the array is never ' +
        'closed by a `false`, so it is never counted — `[false, true, true]` reports `0`. The fix is to promote on ' +
        'every step: `best: Math.max(best, current)` after updating `current`, so the record is always current ' +
        'and the final accumulator needs no post-processing. `reduce` returns the whole accumulator object; the ' +
        'trailing `.best` picks out the answer.',
      id: 'longest-true-streak',
      methods: ['reduce'],
      order: 9,
      solution: code(`
interface Streaks {
  best: number;
  current: number;
}

export function solve(flags: boolean[]): number {
  return flags.reduce<Streaks>(
    (streaks, flag) => {
      const current = flag ? streaks.current + 1 : 0;
      return { best: Math.max(streaks.best, current), current };
    },
    { best: 0, current: 0 },
  ).best;
}
`),
      starterCode: code(`
export function solve(flags: boolean[]): number {
  // Track { best, current } — and decide carefully when current is allowed to become best.
  return 0;
}
`),
      tests: [
        tc('streak that runs to the end (trap)', [[false, true, true]], 2),
        tc('streak in the middle', [[true, false, true, true, false]], 2),
        tc('every flag true (trap)', [[true, true, true]], 3),
        tc('longest streak comes first', [[true, true, false, true]], 2),
        tc('no true flags', [[false, false]], 0),
        tc('empty input', [[]], 0),
      ],
      title: 'Longest streak',
      trap: code(`
interface Streaks {
  best: number;
  current: number;
}

export function solve(flags: boolean[]): number {
  return flags.reduce<Streaks>(
    (streaks, flag) =>
      flag
        ? { best: streaks.best, current: streaks.current + 1 }
        : { best: Math.max(streaks.best, streaks.current), current: 0 },
    { best: 0, current: 0 },
  ).best;
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Join names the way a person would write them: `"Ada"`, `"Ada and Bob"`, `"Ada, Bob, and Cy"`. ' +
        'An empty list produces an empty string.\n\n' +
        'Signature: `solve(names: string[]): string`\n\n' +
        'Trap: the separator depends on *where* you are in the list, and the fold must survive `[]`.',
      difficulty: 'advanced',
      explanation:
        'The callback of `reduce` receives a third argument — the current index — and that is what makes ' +
        'position-aware joining possible: index `0` contributes the bare name, the last index contributes ' +
        '`", and "` (or `" and "` when there are exactly two names), and everything in between contributes ' +
        '`", "`. Two things go wrong in the obvious version. Seedless `reduce` throws on an empty list, so the ' +
        'fold must start from `""` and special-case index `0` rather than relying on element 0 becoming the seed. ' +
        'And the two-name case has no Oxford comma — `"Ada, and Bob"` reads wrong — so the separator for the last ' +
        'position must look at `names.length`, not only at the index. `join` cannot express any of this, which is ' +
        'why this is a fold and not a join.',
      id: 'human-readable-list',
      methods: ['reduce'],
      order: 10,
      solution: code(`
export function solve(names: string[]): string {
  return names.reduce((sentence, name, index) => {
    if (index === 0) {
      return name;
    }
    const isLast = index === names.length - 1;
    const separator = isLast ? (names.length === 2 ? ' and ' : ', and ') : ', ';
    return sentence + separator + name;
  }, '');
}
`),
      starterCode: code(`
export function solve(names: string[]): string {
  // reduce's callback gets (accumulator, element, index) — use the index to pick the separator.
  return '';
}
`),
      tests: [
        tc('empty list is an empty string (trap)', [[]], ''),
        tc('one name stands alone', [['Ada']], 'Ada'),
        tc('two names use a bare and (trap)', [['Ada', 'Bob']], 'Ada and Bob'),
        tc('three names get an Oxford comma', [['Ada', 'Bob', 'Cy']], 'Ada, Bob, and Cy'),
        tc('four names, still one and', [['Ada', 'Bob', 'Cy', 'Di']], 'Ada, Bob, Cy, and Di'),
      ],
      title: 'a, b, and c',
      trap: code(`
export function solve(names: string[]): string {
  return names.reduce((sentence, name, index) => {
    const separator = index === names.length - 1 ? ', and ' : ', ';
    return sentence + separator + name;
  });
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Interpret a list of operations, applied left to right, starting from `start`. `add` and `mul` use `arg`; ' +
        '`neg` negates the value; `clamp` caps the value at `arg`.\n\n' +
        "Signature: `solve(start: number, ops: { arg?: number; op: 'add' | 'clamp' | 'mul' | 'neg' }[]): number`\n\n" +
        'Example: `solve(1, [{ op: "add", arg: 2 }, { op: "mul", arg: 3 }])` → `9`. This is `pipe` with the ' +
        'functions written as data — the fold *is* the interpreter.',
      difficulty: 'expert',
      explanation:
        '`pipe(f, g, h)(x)` is `h(g(f(x)))`, and a left fold computes exactly that: `reduce` carries the running ' +
        'value and applies each step in list order. Here the steps are data rather than functions, so a lookup ' +
        'table `Record<Op, (value, arg) => number>` turns each `op` string into its behaviour and the callback ' +
        'becomes one line: `apply[op](value, arg)`. Order is the whole point — `add 2` then `mul 3` from `1` is ' +
        '`9`, while the reverse order is `5` — and `reduce` guarantees it. `reduceRight` with the same callback ' +
        'would silently evaluate the pipeline backwards. An empty `ops` never invokes the callback, so the seed ' +
        '`start` passes through unchanged, which is the identity pipeline you would expect.',
      id: 'apply-operation-pipeline',
      methods: ['reduce'],
      order: 11,
      solution: code(`
type Op = 'add' | 'clamp' | 'mul' | 'neg';

interface Operation {
  arg?: number;
  op: Op;
}

const apply: Record<Op, (value: number, arg: number) => number> = {
  add: (value, arg) => value + arg,
  clamp: (value, arg) => Math.min(value, arg),
  mul: (value, arg) => value * arg,
  neg: (value) => -value,
};

export function solve(start: number, ops: Operation[]): number {
  return ops.reduce((value, { arg = 0, op }) => apply[op](value, arg), start);
}
`),
      starterCode: code(`
type Op = 'add' | 'clamp' | 'mul' | 'neg';

interface Operation {
  arg?: number;
  op: Op;
}

export function solve(start: number, ops: Operation[]): number {
  // Map each op name to a (value, arg) => number function, then fold the ops over start.
  return start;
}
`),
      tests: [
        tc(
          'add then multiply, in that order',
          [
            1,
            [
              { arg: 2, op: 'add' },
              { arg: 3, op: 'mul' },
            ],
          ],
          9,
        ),
        tc('negate in the middle of the pipeline', [5, [{ op: 'neg' }, { arg: 10, op: 'add' }]], 5),
        tc(
          'clamp caps a large value',
          [
            50,
            [
              { arg: 3, op: 'mul' },
              { arg: 100, op: 'clamp' },
            ],
          ],
          100,
        ),
        tc(
          'clamp below the cap is a no-op',
          [
            3,
            [
              { arg: 10, op: 'clamp' },
              { arg: 2, op: 'mul' },
            ],
          ],
          6,
        ),
        tc('three operations chain', [2, [{ arg: 3, op: 'add' }, { op: 'neg' }, { arg: 4, op: 'mul' }]], -20),
        tc('empty pipeline returns the start', [7, []], 7),
      ],
      title: 'Interpret a pipeline',
      trap: code(`
type Op = 'add' | 'clamp' | 'mul' | 'neg';

interface Operation {
  arg?: number;
  op: Op;
}

const apply: Record<Op, (value: number, arg: number) => number> = {
  add: (value, arg) => value + arg,
  clamp: (value, arg) => Math.min(value, arg),
  mul: (value, arg) => value * arg,
  neg: (value) => -value,
};

export function solve(start: number, ops: Operation[]): number {
  return ops.reduceRight((value, { arg = 0, op }) => apply[op](value, arg), start);
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Apply a list of steps written *outermost first*, the way mathematicians write `f(g(h(x)))`: the first ' +
        'step in `ops` is the last one applied.\n\n' +
        "Signature: `solve(ops: { arg: number; op: 'add' | 'mul' }[], x: number): number`\n\n" +
        'Example: `solve([{ op: "mul", arg: 2 }, { op: "add", arg: 3 }], 1)` is `mul2(add3(1))` → `8`.',
      difficulty: 'expert',
      explanation:
        '`compose(f, g, h)(x)` is `f(g(h(x)))`: the *last* function listed runs first. That is a right fold, and ' +
        '`reduceRight` is the array method that performs one — it walks from the final element toward the first, ' +
        'threading the accumulator the same way `reduce` does. Seeded with `x`, the first step applies `h`, the ' +
        'next applies `g` to that result, and so on outward. Using plain `reduce` with an identical callback ' +
        'quietly turns compose into pipe: for `[mul 2, add 3]` and `x = 1` it computes `(1 * 2) + 3 = 5` instead ' +
        'of `(1 + 3) * 2 = 8`, and nothing throws to tell you. Whenever a spec says "innermost first" or ' +
        '"applied in reverse", reach for `reduceRight` before reaching for `reverse` — it expresses the intent ' +
        'without allocating a reversed copy.',
      id: 'compose-outermost-first',
      methods: ['reduceRight'],
      order: 12,
      solution: code(`
interface Step {
  arg: number;
  op: 'add' | 'mul';
}

export function solve(ops: Step[], x: number): number {
  return ops.reduceRight((value, { arg, op }) => (op === 'add' ? value + arg : value * arg), x);
}
`),
      starterCode: code(`
interface Step {
  arg: number;
  op: 'add' | 'mul';
}

export function solve(ops: Step[], x: number): number {
  // The last step listed must run first — which fold direction gives you that for free?
  return x;
}
`),
      tests: [
        tc(
          'multiply outside, add inside (trap)',
          [
            [
              { arg: 2, op: 'mul' },
              { arg: 3, op: 'add' },
            ],
            1,
          ],
          8,
        ),
        tc(
          'three nested steps',
          [
            [
              { arg: 1, op: 'add' },
              { arg: 10, op: 'mul' },
              { arg: 2, op: 'add' },
            ],
            3,
          ],
          51,
        ),
        tc('single step', [[{ arg: 4, op: 'mul' }], 2], 8),
        tc('no steps is the identity', [[], 9], 9),
        tc(
          'negative input',
          [
            [
              { arg: 5, op: 'add' },
              { arg: 2, op: 'mul' },
            ],
            -3,
          ],
          -1,
        ),
      ],
      title: 'Compose, not pipe',
      trap: code(`
interface Step {
  arg: number;
  op: 'add' | 'mul';
}

export function solve(ops: Step[], x: number): number {
  return ops.reduce((value, { arg, op }) => (op === 'add' ? value + arg : value * arg), x);
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Return the top `n` customers by total spend, highest first. Each customer may appear in many orders; ' +
        'ties are broken by customer name ascending.\n\n' +
        'Signature: `solve(orders: { customer: string; total: number }[], n: number): { customer: string; total: number }[]`\n\n' +
        'Example: Ada spends 60 then 30 and Cy spends 70 once — Ada (90) outranks Cy (70).',
      difficulty: 'expert',
      explanation:
        'This is three transformations composed, and the order matters. First `reduce` folds the orders into a ' +
        'totals record keyed by customer, adding each `total` onto whatever that customer already has. Sorting ' +
        'the raw orders instead — the tempting shortcut — ranks single orders, so a customer with many small ' +
        'orders never surfaces. Second, `Object.entries` turns the record back into `[customer, total]` pairs and ' +
        '`map` reshapes them into result objects. Third, `toSorted` orders them with a two-key comparator: ' +
        '`b.total - a.total` for descending spend, and `||` falls through to `a.customer.localeCompare(b.customer)` ' +
        'only when that difference is `0`. `slice(0, n)` takes the leaders; it clamps quietly when `n` exceeds ' +
        'the customer count and returns `[]` for `n = 0`.',
      id: 'top-customers',
      methods: ['reduce', 'Object.entries', 'toSorted', 'slice'],
      order: 13,
      solution: code(`
interface Order {
  customer: string;
  total: number;
}

export function solve(orders: Order[], n: number): Order[] {
  const totals = orders.reduce<Record<string, number>>((acc, { customer, total }) => {
    acc[customer] = (acc[customer] ?? 0) + total;
    return acc;
  }, {});
  return Object.entries(totals)
    .map(([customer, total]) => ({ customer, total }))
    .toSorted((a, b) => b.total - a.total || a.customer.localeCompare(b.customer))
    .slice(0, n);
}
`),
      starterCode: code(`
interface Order {
  customer: string;
  total: number;
}

export function solve(orders: Order[], n: number): Order[] {
  // Fold totals per customer, turn the record back into objects, sort, then slice.
  return [];
}
`),
      tests: [
        tc(
          'a customer who only wins when summed (trap)',
          [
            [
              { customer: 'Ada', total: 60 },
              { customer: 'Bob', total: 50 },
              { customer: 'Ada', total: 30 },
              { customer: 'Cy', total: 70 },
            ],
            2,
          ],
          [
            { customer: 'Ada', total: 90 },
            { customer: 'Cy', total: 70 },
          ],
        ),
        tc(
          'ties break alphabetically',
          [
            [
              { customer: 'Zed', total: 10 },
              { customer: 'Amy', total: 10 },
              { customer: 'Bo', total: 5 },
            ],
            2,
          ],
          [
            { customer: 'Amy', total: 10 },
            { customer: 'Zed', total: 10 },
          ],
        ),
        tc(
          'n larger than the customer count',
          [
            [
              { customer: 'Ada', total: 1 },
              { customer: 'Bob', total: 2 },
            ],
            5,
          ],
          [
            { customer: 'Bob', total: 2 },
            { customer: 'Ada', total: 1 },
          ],
        ),
        tc('n of zero returns nothing', [[{ customer: 'Ada', total: 1 }], 0], []),
        tc('no orders', [[], 3], []),
      ],
      title: 'Top n spenders',
      trap: code(`
interface Order {
  customer: string;
  total: number;
}

export function solve(orders: Order[], n: number): Order[] {
  return orders.toSorted((a, b) => b.total - a.total || a.customer.localeCompare(b.customer)).slice(0, n);
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Decide whether the brackets in `s` are balanced: every `(`, `[`, `{` is closed by its matching partner ' +
        'in the right order. Characters that are not brackets are ignored.\n\n' +
        'Signature: `solve(s: string): boolean`\n\n' +
        'Trap: counting depth is not enough — `"([)]"` has depth zero at the end and is still wrong.',
      difficulty: 'expert',
      explanation:
        'Balanced brackets need a *stack*, and a fold can carry one: the accumulator is the list of currently ' +
        'open brackets, or `null` once a mismatch has made the answer irrecoverable. Each opener appends itself ' +
        '(`[...open, char]`); each closer checks `open.at(-1)` against the matching opener and either pops it ' +
        'with `slice(0, -1)` or collapses the accumulator to `null`. The string is balanced only if the fold ' +
        'ends with a non-null, empty stack — `"(("` ends non-empty, `")("` collapses on the first character. ' +
        'A single depth counter cannot see this: `"([)]"` increments twice and decrements twice, landing on ' +
        'zero and reporting balanced, because a counter forgets *which* bracket is open. `reduce` here is a ' +
        'small state machine, and `null` as a poison value lets it short-circuit without a `for` loop and ' +
        'without throwing.',
      id: 'balanced-brackets',
      methods: ['reduce', 'at', 'slice'],
      order: 14,
      solution: code(`
const OPENERS = new Set(['(', '[', '{']);
const PARTNER: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

export function solve(s: string): boolean {
  const stack = [...s].reduce<null | string[]>((open, char) => {
    if (open === null) {
      return null;
    }
    if (OPENERS.has(char)) {
      return [...open, char];
    }
    if (!(char in PARTNER)) {
      return open;
    }
    return open.at(-1) === PARTNER[char] ? open.slice(0, -1) : null;
  }, []);
  return stack !== null && stack.length === 0;
}
`),
      starterCode: code(`
export function solve(s: string): boolean {
  // The accumulator is a stack of open brackets — or null once a mismatch makes the answer final.
  return false;
}
`),
      tests: [
        tc('interleaved pairs are not balanced (trap)', ['([)]'], false),
        tc('properly nested pairs', ['{[()]}'], true),
        tc('closer before opener (trap)', [')('], false),
        tc('unclosed openers', ['(('], false),
        tc('letters between brackets are ignored', ['(a[b]c)'], true),
        tc('empty string is balanced', [''], true),
      ],
      title: 'Balanced brackets via a stack fold',
      trap: code(`
export function solve(s: string): boolean {
  const depth = [...s].reduce((count, char) => {
    if ('([{'.includes(char)) {
      return count + 1;
    }
    if (')]}'.includes(char)) {
      return count - 1;
    }
    return count;
  }, 0);
  return depth === 0;
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Count how many `values` fall into each bucket defined by ascending `edges`: bucket `i` covers ' +
        '`[edges[i], edges[i + 1])` — closed on the left, open on the right. Values outside every bucket are ' +
        'dropped.\n\n' +
        'Signature: `solve(values: number[], edges: number[]): number[]`\n\n' +
        'Example: `solve([1, 5, 12], [0, 5, 10, 15])` → `[1, 1, 1]`. Do it without mutating the counts array.',
      difficulty: 'expert',
      explanation:
        'Three methods share the work. `Array.from({ length: edges.length - 1 }, () => 0)` builds the zeroed ' +
        'counts — one fewer bucket than there are edges, clamped so a single edge yields no buckets at all. For ' +
        'each value, `findIndex` over the edges locates the bucket: the first `i` where `value >= edges[i]` *and* ' +
        '`value < edges[i + 1]`, with the guard `i < edges.length - 1` so the last edge is never treated as a ' +
        'bucket start. `-1` means the value sits outside every bucket and is skipped. `reduce` then threads the ' +
        'counts through, and `with(bucket, counts[bucket] + 1)` returns a fresh array each step rather than ' +
        'mutating. The half-open interval is the subtle part: writing `<=` on the upper bound double-counts a ' +
        'value that lands exactly on an inner edge and wrongly admits a value equal to the final edge.',
      id: 'histogram-buckets',
      methods: ['reduce', 'findIndex', 'Array.from', 'with'],
      order: 15,
      solution: code(`
export function solve(values: number[], edges: number[]): number[] {
  const empty = Array.from({ length: Math.max(0, edges.length - 1) }, () => 0);
  return values.reduce((counts, value) => {
    const bucket = edges.findIndex(
      (edge, index) => index < edges.length - 1 && value >= edge && value < edges[index + 1],
    );
    return bucket === -1 ? counts : counts.with(bucket, counts[bucket] + 1);
  }, empty);
}
`),
      starterCode: code(`
export function solve(values: number[], edges: number[]): number[] {
  // Zeroed counts via Array.from, findIndex the bucket for each value, with() to bump it immutably.
  return [];
}
`),
      tests: [
        tc(
          'values spread across three buckets',
          [
            [1, 5, 12, 7, 3],
            [0, 5, 10, 15],
          ],
          [2, 2, 1],
        ),
        tc('value on an inner edge goes to the upper bucket (trap)', [[5], [0, 5, 10]], [0, 1]),
        tc(
          'value below the first edge is dropped',
          [
            [-1, 2],
            [0, 10],
          ],
          [1],
        ),
        tc('value equal to the last edge is dropped (trap)', [[10], [0, 10]], [0]),
        tc('no values leaves every bucket at zero', [[], [0, 1, 2]], [0, 0]),
        tc('a single edge defines no buckets', [[3], [3]], []),
      ],
      title: 'Bucket the readings',
      trap: code(`
export function solve(values: number[], edges: number[]): number[] {
  const empty = Array.from({ length: Math.max(0, edges.length - 1) }, () => 0);
  return values.reduce((counts, value) => {
    const bucket = edges.findIndex(
      (edge, index) => index < edges.length - 1 && value >= edge && value <= edges[index + 1],
    );
    return bucket === -1 ? counts : counts.with(bucket, counts[bucket] + 1);
  }, empty);
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Replay an account log and return the final balance. `deposit` adds `amount`, `withdraw` subtracts it, ' +
        'and `undo` reverses the most recent event that has not itself been undone. An `undo` with nothing ' +
        'left to undo does nothing.\n\n' +
        "Signature: `solve(events: { amount?: number; type: 'deposit' | 'undo' | 'withdraw' }[]): number`\n\n" +
        'Trap: two `undo`s in a row must reverse two different events.',
      difficulty: 'expert',
      explanation:
        'The balance alone is not enough state to replay this log — an `undo` needs to know what it is undoing, ' +
        'and a second `undo` needs to know that the first one already consumed the latest event. So the ' +
        'accumulator carries history: `{ applied, balance }`, where `applied` is the list of signed deltas still ' +
        'in effect. A deposit or withdrawal appends its delta and adjusts the balance; an `undo` reads the last ' +
        'delta with `at(-1)`, removes it with `slice(0, -1)`, and subtracts it back out. The naive reading — ' +
        '"undo reverses the previous event in the list" — breaks on `deposit, deposit, undo, undo`: the second ' +
        '`undo` sees an `undo` as its predecessor and has nothing to reverse, leaving `10` instead of `0`. ' +
        '`reduce` with a history-carrying accumulator is the general shape of every replay, event-sourcing, and ' +
        'undo-stack problem; `at` and `slice` keep the history immutable at each step.',
      id: 'event-log-with-undo',
      methods: ['reduce', 'slice', 'at'],
      order: 16,
      solution: code(`
interface AccountEvent {
  amount?: number;
  type: 'deposit' | 'undo' | 'withdraw';
}

interface Replay {
  applied: number[];
  balance: number;
}

export function solve(events: AccountEvent[]): number {
  const { balance } = events.reduce<Replay>(
    (state, { amount = 0, type }) => {
      if (type === 'undo') {
        const last = state.applied.at(-1);
        if (last === undefined) {
          return state;
        }
        return { applied: state.applied.slice(0, -1), balance: state.balance - last };
      }
      const delta = type === 'deposit' ? amount : -amount;
      return { applied: [...state.applied, delta], balance: state.balance + delta };
    },
    { applied: [], balance: 0 },
  );
  return balance;
}
`),
      starterCode: code(`
interface AccountEvent {
  amount?: number;
  type: 'deposit' | 'undo' | 'withdraw';
}

export function solve(events: AccountEvent[]): number {
  // The accumulator needs history, not just a balance — keep the deltas still in effect.
  return 0;
}
`),
      tests: [
        tc(
          'undo reverses the latest event',
          [[{ amount: 10, type: 'deposit' }, { amount: 3, type: 'withdraw' }, { type: 'undo' }]],
          10,
        ),
        tc(
          'two undos reverse two events (trap)',
          [[{ amount: 10, type: 'deposit' }, { amount: 5, type: 'deposit' }, { type: 'undo' }, { type: 'undo' }]],
          0,
        ),
        tc('undo with nothing to undo is ignored', [[{ type: 'undo' }, { amount: 4, type: 'deposit' }]], 4),
        tc(
          'no undos at all',
          [
            [
              { amount: 10, type: 'deposit' },
              { amount: 4, type: 'withdraw' },
            ],
          ],
          6,
        ),
        tc(
          'new event after an undo becomes the next undo target',
          [
            [
              { amount: 10, type: 'deposit' },
              { amount: 4, type: 'withdraw' },
              { type: 'undo' },
              { amount: 1, type: 'deposit' },
              { type: 'undo' },
            ],
          ],
          10,
        ),
        tc('empty log', [[]], 0),
      ],
      title: 'Replay an event log',
      trap: code(`
interface AccountEvent {
  amount?: number;
  type: 'deposit' | 'undo' | 'withdraw';
}

export function solve(events: AccountEvent[]): number {
  return events.reduce((balance, event, index) => {
    if (event.type === 'undo') {
      const previous = events[index - 1];
      if (previous === undefined || previous.type === 'undo') {
        return balance;
      }
      const amount = previous.amount ?? 0;
      return previous.type === 'deposit' ? balance - amount : balance + amount;
    }
    const amount = event.amount ?? 0;
    return event.type === 'deposit' ? balance + amount : balance - amount;
  }, 0);
}
`),
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Given files with slash-separated paths, return the total size under every directory, keyed by the ' +
        "directory's full path. A file counts toward *each* of its ancestors; a file with no directory counts " +
        'toward nothing.\n\n' +
        'Signature: `solve(files: { path: string; size: number }[]): Record<string, number>`\n\n' +
        'Example: `solve([{ path: "a/b/c.txt", size: 5 }])` → `{ a: 5, "a/b": 5 }`.',
      difficulty: 'expert',
      explanation:
        'Two folds nest here. The outer `reduce` walks the files and threads one totals record through all of ' +
        'them. For each file, `split("/")` breaks the path into segments and `slice(0, -1)` drops the filename, ' +
        'leaving only directory segments. The inner `reduce` walks those segments and, at each index, rebuilds ' +
        'the ancestor path with `segments.slice(0, index + 1).join("/")` — `"a"`, then `"a/b"`, then `"a/b/c"` — ' +
        'adding the file size to each. Seeding the inner fold with the *outer* accumulator is what lets one ' +
        'expression update the shared record without a temporary. The tempting version credits only the ' +
        'immediate parent — `"a/b"` but not `"a"` — which makes every top-level directory report nothing but ' +
        'its direct children. A root-level file has no directory segments, so its inner fold never runs.',
      id: 'directory-totals',
      methods: ['reduce', 'split', 'slice', 'join'],
      order: 17,
      solution: code(`
interface FileEntry {
  path: string;
  size: number;
}

export function solve(files: FileEntry[]): Record<string, number> {
  return files.reduce<Record<string, number>>((totals, { path, size }) => {
    const segments = path.split('/');
    return segments.slice(0, -1).reduce((acc, _segment, index) => {
      const directory = segments.slice(0, index + 1).join('/');
      acc[directory] = (acc[directory] ?? 0) + size;
      return acc;
    }, totals);
  }, {});
}
`),
      starterCode: code(`
interface FileEntry {
  path: string;
  size: number;
}

export function solve(files: FileEntry[]): Record<string, number> {
  // Outer fold over files; inner fold over each path's directory prefixes, seeded with the outer accumulator.
  return {};
}
`),
      tests: [
        tc(
          'two files in one directory sum',
          [
            [
              { path: 'a/x.txt', size: 3 },
              { path: 'a/y.txt', size: 4 },
            ],
          ],
          { a: 7 },
        ),
        tc('nested paths credit every ancestor (trap)', [[{ path: 'a/b/c.txt', size: 5 }]], { a: 5, 'a/b': 5 }),
        tc('root-level file has no directory', [[{ path: 'readme.md', size: 9 }]], {}),
        tc(
          'sibling directories stay separate',
          [
            [
              { path: 'a/x', size: 1 },
              { path: 'b/y', size: 2 },
            ],
          ],
          { a: 1, b: 2 },
        ),
        tc(
          'mixed depths accumulate upward',
          [
            [
              { path: 'a/b/x', size: 1 },
              { path: 'a/y', size: 2 },
              { path: 'a/b/c/z', size: 4 },
            ],
          ],
          { a: 7, 'a/b': 5, 'a/b/c': 4 },
        ),
        tc('no files', [[]], {}),
      ],
      title: 'Cumulative directory sizes',
      trap: code(`
interface FileEntry {
  path: string;
  size: number;
}

export function solve(files: FileEntry[]): Record<string, number> {
  return files.reduce<Record<string, number>>((totals, { path, size }) => {
    const parent = path.split('/').slice(0, -1).join('/');
    if (parent !== '') {
      totals[parent] = (totals[parent] ?? 0) + size;
    }
    return totals;
  }, {});
}
`),
    },
  ],
};
