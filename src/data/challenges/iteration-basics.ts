import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const iterationBasics: CategoryModule = {
  category: {
    description:
      'Walk arrays with the core iteration tools — forEach for side effects, some and every for yes/no questions, and entries for index-value pairs.',
    id: 'iteration-basics',
    order: 3,
    title: 'Iteration Basics',
  },
  challenges: [
    {
      categoryId: 'iteration-basics',
      description:
        'Sum only the valid amounts in a ledger — an amount is valid when it is zero or greater; negative entries ' +
        'are data errors and must be skipped.\n\n' +
        'Signature: `solve(amounts: number[]): number`\n\n' +
        'Constraint: iterate with `forEach` and an accumulator variable — no `reduce`, no `for` loop.',
      difficulty: 'novice',
      explanation:
        '`forEach` runs the callback once per element and always returns `undefined` — it exists purely for side ' +
        'effects, so the running total must live in a variable *outside* the callback that each call mutates. ' +
        'Returning a value from the callback does nothing; `amounts.forEach((a) => total + a)` computes sums and ' +
        'throws every one away. Contrast with `reduce`, which threads the accumulator *through* the iteration as an ' +
        'argument and hands the final value back — no outer variable needed. `forEach` plus a captured accumulator ' +
        'is the imperative half of that trade: easier to step through, but the state lives in your scope, not the ' +
        'method’s.',
      id: 'sum-valid-amounts',
      methods: ['forEach'],
      order: 1,
      solution: code(`
export function solve(amounts: number[]): number {
  let total = 0;
  amounts.forEach((amount) => {
    if (amount >= 0) {
      total += amount;
    }
  });
  return total;
}
`),
      starterCode: code(`
export function solve(amounts: number[]): number {
  // forEach returns undefined — accumulate into a variable it can close over.
  let total = 0;
  return total;
}
`),
      tests: [
        tc('sums the non-negative amounts', [[10, -5, 20, -1, 5]], 35),
        tc('all amounts valid', [[1, 2, 3]], 6),
        tc('all amounts negative', [[-4, -2]], 0),
        tc('zero counts as valid', [[0, 5]], 5),
        tc('empty ledger', [[]], 0),
      ],
      title: 'Sum the valid amounts',
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Return `true` when at least one product in the catalog is out of stock — that is, its `quantity` is exactly ' +
        '`0` — and `false` otherwise.\n\n' +
        'Signature: `solve(products: { name: string; quantity: number }[]): boolean`',
      difficulty: 'novice',
      explanation:
        '`some` asks “does at least one element satisfy this predicate?” and answers with a boolean. It stops at the ' +
        'first `true` — once one out-of-stock product is found, the remaining products are never examined — which ' +
        'makes it both the clearest and the cheapest way to write an existence check. The habit to build: whenever ' +
        'you catch yourself writing `filter(...).length > 0` or a `find(...) !== undefined` comparison just to get a ' +
        'boolean, `some` says the same thing directly and short-circuits instead of building a throwaway array. On ' +
        'an empty catalog `some` returns `false`: no elements, so no element can match.',
      id: 'any-product-out-of-stock',
      methods: ['some'],
      order: 2,
      solution: code(`
interface Product {
  name: string;
  quantity: number;
}

export function solve(products: Product[]): boolean {
  return products.some((product) => product.quantity === 0);
}
`),
      starterCode: code(`
interface Product {
  name: string;
  quantity: number;
}

export function solve(products: Product[]): boolean {
  // 'At least one matches' is a single method call, not a filter-and-count.
  return false;
}
`),
      tests: [
        tc(
          'one product is out of stock',
          [
            [
              { name: 'tea', quantity: 4 },
              { name: 'mug', quantity: 0 },
            ],
          ],
          true,
        ),
        tc(
          'everything is stocked',
          [
            [
              { name: 'tea', quantity: 4 },
              { name: 'mug', quantity: 2 },
            ],
          ],
          false,
        ),
        tc(
          'first product already answers',
          [
            [
              { name: 'pen', quantity: 0 },
              { name: 'ink', quantity: 9 },
            ],
          ],
          true,
        ),
        tc('empty catalog has nothing out of stock', [[]], false),
      ],
      title: 'Anything out of stock?',
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Return `true` when every score in the list is valid — between `0` and `100` inclusive — and `false` as soon ' +
        'as any score falls outside that range.\n\n' +
        'Signature: `solve(scores: number[]): boolean`\n\n' +
        'Think first: what should an *empty* list of scores return, and why?',
      difficulty: 'intermediate',
      explanation:
        '`every` is the universal quantifier: it returns `true` only if the predicate holds for *all* elements, and ' +
        'it short-circuits to `false` at the first counterexample. The edge case worth internalizing is the empty ' +
        'array: `[].every(...)` is `true` for any predicate. That is vacuous truth — “all elements are valid” cannot ' +
        'be falsified when there are no elements to falsify it with — and it mirrors `some` returning `false` on ' +
        '`[]`; the two are De Morgan duals (`every(p)` equals `!some(not p)`). Code that treats an empty list as ' +
        'invalid must check `length` explicitly, because `every` will not do it for you.',
      id: 'all-scores-in-range',
      methods: ['every'],
      order: 3,
      solution: code(`
export function solve(scores: number[]): boolean {
  return scores.every((score) => score >= 0 && score <= 100);
}
`),
      starterCode: code(`
export function solve(scores: number[]): boolean {
  // 'All elements pass' is one call — and mind what it says about [].
  return false;
}
`),
      tests: [
        tc('all scores in range', [[0, 55, 100]], true),
        tc('one score too high', [[10, 101]], false),
        tc('negative score fails', [[-1, 50]], false),
        tc('boundaries are inclusive', [[0, 100]], true),
        tc('empty list is vacuously valid', [[]], true),
      ],
      title: 'All scores in range',
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Produce a numbered label for each item: `"0: apple"`, `"1: banana"`, and so on, using the position within ' +
        'the array.\n\n' +
        'Signature: `solve(items: string[]): string[]`\n\n' +
        'Constraint: get the index from `entries()` (spread it into an array first), not from `map`’s second callback ' +
        'argument.',
      difficulty: 'intermediate',
      explanation:
        '`entries` returns an *iterator* of `[index, value]` pairs — `[0, "apple"]`, `[1, "banana"]` — the same shape ' +
        'you destructure in `for (const [i, item] of items.entries())`. An iterator has no `map` of its own, so ' +
        '`[...items.entries()]` materializes the pairs into a real array first; then `map` with a destructuring ' +
        'parameter `([index, item]) => ...` unpacks each pair by position. Here `map`’s second callback argument ' +
        'would admittedly do the same job, but the `entries` form is the one that generalizes: it survives being ' +
        'passed through `filter` or `slice` (which reindex from zero) because each pair *carries* its original index ' +
        'instead of asking for it.',
      id: 'numbered-labels',
      methods: ['entries', 'map'],
      order: 4,
      solution: code(`
export function solve(items: string[]): string[] {
  return [...items.entries()].map(([index, item]) => index + ': ' + item);
}
`),
      starterCode: code(`
export function solve(items: string[]): string[] {
  // items.entries() yields [index, value] pairs — spread them, then map.
  return items;
}
`),
      tests: [
        tc('numbers each fruit', [['apple', 'banana']], ['0: apple', '1: banana']),
        tc('single item', [['solo']], ['0: solo']),
        tc('duplicate values get distinct indices', [['x', 'x']], ['0: x', '1: x']),
        tc('empty list', [[]], []),
      ],
      title: 'Numbered labels',
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Validate a matrix: return `true` only when every row has the same length AND at least one cell anywhere is ' +
        'non-zero.\n\n' +
        'Signature: `solve(matrix: number[][]): boolean`\n\n' +
        'Edge case to reason through: an empty matrix has consistent rows — but does it have a non-zero cell?',
      difficulty: 'advanced',
      explanation:
        'The two rules quantify in opposite directions, so each maps to its own method: “all rows share one length” ' +
        'is `every` (comparing each row against the first row’s length), and “a non-zero cell exists somewhere” is ' +
        '`some` nested inside `some` — the outer asks “does some row...”, the inner “...contain some non-zero ' +
        'cell?”. Both short-circuit: `every` bails at the first ragged row, `some` at the first signal. The empty ' +
        'matrix shows why the two checks are independent — `every` on `[]` is vacuously `true` (no row can ' +
        'disagree), while `some` on `[]` is `false` (no cell exists to be non-zero) — so the combined validation ' +
        'correctly rejects it on the second rule alone.',
      id: 'validate-matrix-shape',
      methods: ['some', 'every'],
      order: 5,
      solution: code(`
export function solve(matrix: number[][]): boolean {
  const width = matrix.length === 0 ? 0 : matrix[0].length;
  const rectangular = matrix.every((row) => row.length === width);
  const hasSignal = matrix.some((row) => row.some((cell) => cell !== 0));
  return rectangular && hasSignal;
}
`),
      starterCode: code(`
export function solve(matrix: number[][]): boolean {
  // Same length for ALL rows (every) + a non-zero cell in SOME row (some in some).
  return false;
}
`),
      tests: [
        tc(
          'rectangular with a non-zero cell',
          [
            [
              [0, 0],
              [0, 3],
            ],
          ],
          true,
        ),
        tc('ragged rows fail', [[[1, 2], [3]]], false),
        tc(
          'all zeros fail',
          [
            [
              [0, 0],
              [0, 0],
            ],
          ],
          false,
        ),
        tc('single cell matrix', [[[7]]], true),
        tc('empty matrix has no signal', [[]], false),
      ],
      title: 'Validate the matrix',
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Return the index at which the running total of `amounts` first becomes strictly greater than `limit`, or ' +
        '`-1` if it never does.\n\n' +
        'Signature: `solve(amounts: number[], limit: number): number`\n\n' +
        'Constraint: iterate with `some` so the walk stops at the crossing point — no `for` loop, no `findIndex` ' +
        'over precomputed sums.',
      difficulty: 'expert',
      explanation:
        'This is the “`some` as `break`” pattern. `some` stops iterating the moment its callback returns `true`, so ' +
        'a callback that updates the running total, records the index, and returns `true` at the crossing point ' +
        'behaves exactly like a loop with `break` — elements after the crossing are never visited, and the boolean ' +
        '`some` itself returns gets discarded because the answer was smuggled out through the captured `breakIndex` ' +
        'variable. `forEach` cannot do this: it offers no protocol to stop early (short of throwing an exception), ' +
        'and returning from its callback merely skips to the next element. Note the strictness details the tests ' +
        'pin down: hitting the limit exactly is not “exceeds”, and a running total can dip on negative amounts ' +
        'before finally crossing.',
      id: 'running-total-crossing',
      methods: ['some'],
      order: 6,
      solution: code(`
export function solve(amounts: number[], limit: number): number {
  let total = 0;
  let breakIndex = -1;
  amounts.some((amount, index) => {
    total += amount;
    if (total > limit) {
      breakIndex = index;
      return true;
    }
    return false;
  });
  return breakIndex;
}
`),
      starterCode: code(`
export function solve(amounts: number[], limit: number): number {
  // Returning true from some() is your break statement — capture the index first.
  return -1;
}
`),
      tests: [
        tc('crosses mid-array', [[40, 50, 30], 80], 1),
        tc('first element already exceeds', [[100, 1], 50], 0),
        tc('exactly reaching the limit does not count', [[50, 50], 100], -1),
        tc('negative amounts can delay the crossing', [[60, -30, 80], 70], 2),
        tc('empty list never crosses', [[], 5], -1),
      ],
      title: 'Where the total first exceeds',
    },
  ],
};
