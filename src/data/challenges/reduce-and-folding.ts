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
        tc('empty cart totals zero', [[]], 0),
        tc('single amount', [[42]], 42),
        tc('negative adjustments subtract', [[100, -25, -5]], 70),
      ],
      title: 'The empty-cart TypeError',
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
        'the very first step when nothing has been collected yet. Note what makes this different from `map`: each ' +
        'output element depends on *all* previous inputs, which is exactly the dependency shape `reduce` exists to ' +
        'express. (Spreading rebuilds the array each step — fine for teaching; a `push` into the accumulator is the ' +
        'O(n) variant.)',
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
        tc('single transaction is its own balance', [[25]], [25]),
        tc('overdraft goes negative', [[50, -80, 10]], [50, -30, -20]),
      ],
      title: 'Running balance (scan)',
    },
    {
      categoryId: 'reduce-and-folding',
      description:
        'Build a nested object from a key path: wrap `value` inside one object per key, innermost key last.\n\n' +
        'Signature: `solve(path: string[], value: number): unknown`\n\n' +
        'Example: `solve(["a", "b", "c"], 42)` → `{ a: { b: { c: 42 } } }`. An empty path returns `value` itself.',
      difficulty: 'expert',
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
        tc('three-level path', [['a', 'b', 'c'], 42], { a: { b: { c: 42 } } }),
        tc('single key wraps once', [['root'], 7], { root: 7 }),
        tc('empty path returns the value itself', [[], 99], 99),
        tc('two-level config path', [['server', 'port'], 8080], { server: { port: 8080 } }),
      ],
      title: 'Fold right into nesting',
    },
  ],
};
