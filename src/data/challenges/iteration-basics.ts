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
        tc('ragged rows fail (trap)', [[[1, 2], [3]]], false),
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
      trap: code(`
export function solve(matrix: number[][]): boolean {
  const width = matrix.length === 0 ? 0 : matrix[0].length;
  const rectangular = matrix.some((row) => row.length === width);
  const hasSignal = matrix.some((row) => row.some((cell) => cell !== 0));
  return rectangular && hasSignal;
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Return the index at which the running total of `amounts` first becomes strictly greater than `limit`, or ' +
        '`-1` if it never does.\n\n' +
        'Signature: `solve(amounts: number[], limit: number): number`\n\n' +
        'Constraint: iterate with `some` so the walk stops at the crossing point — no `for` loop, no `findIndex` ' +
        'over precomputed sums.',
      difficulty: 'advanced',
      explanation:
        'This is the “`some` as `break`” pattern. `some` stops iterating the moment its callback returns `true`, so ' +
        'a callback that updates the running total, records the index, and returns `true` at the crossing point ' +
        'behaves exactly like a loop with `break`: elements after the crossing are never visited, and the boolean ' +
        '`some` returns is discarded because the answer left through the captured `breakIndex`. `forEach` is the ' +
        'trap. It has no protocol for stopping early — returning from its callback only skips to the next element ' +
        '— so the obvious `forEach` version keeps walking, and every later moment the total sits above the limit ' +
        'overwrites the index with a *later* one: `[40, 50, 30]` against `80` reports `2` instead of `1`. Two ' +
        'strictness details the tests pin down: reaching the limit exactly is not exceeding it, and negative ' +
        'amounts can pull the total back down before it finally crosses.',
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
        tc('crosses mid-array (trap)', [[40, 50, 30], 80], 1),
        tc('first element already exceeds', [[100, 1], 50], 0),
        tc('exactly reaching the limit does not count', [[50, 50], 100], -1),
        tc('negative amounts can delay the crossing', [[60, -30, 80], 70], 2),
        tc('a later crossing must not overwrite the first (trap)', [[60, 30, -50, 60], 80], 1),
        tc('empty list never crosses', [[], 5], -1),
      ],
      title: 'Where the total first exceeds',
      trap: code(`
export function solve(amounts: number[], limit: number): number {
  let total = 0;
  let crossing = -1;
  amounts.forEach((amount, index) => {
    total += amount;
    if (total > limit) {
      crossing = index;
    }
  });
  return crossing;
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Seats are booked by position. Build a seating array with `new Array(length)`, assign each `[index, name]` ' +
        'pair into it, and return the indices that were never assigned — the holes — in ascending order. A seat ' +
        'explicitly assigned `undefined` is taken, not a hole.\n\n' +
        'Signature: `solve(length: number, booked: [number, string | undefined][]): number[]`\n\n' +
        'Use `keys()` to walk every index the array *has*, holes included — then decide which ones are holes.',
      difficulty: 'advanced',
      explanation:
        '`new Array(length)` creates a *sparse* array: `length` slots and no elements. `forEach`, `map`, `filter`, ' +
        'and `Object.keys` all iterate own properties, so they never visit a hole — the tempting `forEach` version ' +
        'with `seat === undefined` reports nothing at all for seats `0`, `2`, and `4` booked out of five, because ' +
        'the holes at `1` and `3` are never handed to the callback. `keys()` is different: it iterates by `length`, ' +
        'yielding `0` through `length - 1` whether or not each slot exists. Spreading it gives every index, and the ' +
        '`in` operator (`index in seats`) tells a true hole apart from a slot holding an explicit `undefined`, ' +
        'which the `=== undefined` check cannot. The `forEach` that assigns the bookings is safe because the pairs ' +
        'array is dense; it is the sparse *result* that needs the index-driven walk.',
      id: 'hole-indices-via-keys',
      methods: ['keys', 'filter', 'forEach'],
      order: 7,
      solution: code(`
export function solve(length: number, booked: [number, string | undefined][]): number[] {
  const seats: (string | undefined)[] = new Array<string | undefined>(length);
  booked.forEach(([index, name]) => {
    seats[index] = name;
  });
  return [...seats.keys()].filter((index) => !(index in seats));
}
`),
      starterCode: code(`
export function solve(length: number, booked: [number, string | undefined][]): number[] {
  // new Array(length) has holes — forEach never sees them; keys() walks every index by length.
  return [];
}
`),
      tests: [
        tc(
          'holes between booked seats (trap)',
          [
            5,
            [
              [0, 'Ada'],
              [2, 'Bob'],
              [4, 'Cy'],
            ],
          ],
          [1, 3],
        ),
        tc(
          'explicit undefined is booked, not a hole (trap)',
          [
            3,
            [
              [0, 'Ada'],
              [1, undefined],
            ],
          ],
          [2],
        ),
        tc(
          'fully booked has no holes',
          [
            3,
            [
              [0, 'Ada'],
              [1, 'Bob'],
              [2, 'Cy'],
            ],
          ],
          [],
        ),
        tc('nothing booked leaves every seat a hole', [4, []], [0, 1, 2, 3]),
        tc('trailing holes', [3, [[0, 'Ada']]], [1, 2]),
        tc('zero seats', [0, []], []),
      ],
      title: 'Find the holes',
      trap: code(`
export function solve(length: number, booked: [number, string | undefined][]): number[] {
  const seats: (string | undefined)[] = new Array<string | undefined>(length);
  booked.forEach(([index, name]) => {
    seats[index] = name;
  });
  const holes: number[] = [];
  seats.forEach((seat, index) => {
    if (seat === undefined) {
      holes.push(index);
    }
  });
  return holes;
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Sort parcels into the bins listed in `bins`: return a record with one array of parcel ids per bin, in ' +
        'arrival order. Every listed bin appears even when empty; a parcel whose `bin` is not listed goes into ' +
        '`"other"`, which always appears too.\n\n' +
        'Signature: `solve(parcels: { bin: string; id: number }[], bins: string[]): Record<string, number[]>`\n\n' +
        'Build the arrays with `push` inside a `forEach` — and mind what `push` returns.',
      difficulty: 'advanced',
      explanation:
        '`push` appends in place and returns the array’s *new length*, not the array. `forEach` is the safe ' +
        'partner because it throws every callback return value away, so `(sorted[bin] ?? sorted.other).push(id)` ' +
        'inside a `forEach` does exactly one thing: mutate the right bin. The trap moves the same expression into a ' +
        '`reduce` with an arrow’s implicit return — `(sorted, { bin, id }) => (sorted[bin] ?? sorted.other).push(id)` ' +
        '— and the accumulator silently becomes the number `1` after the first parcel. The second parcel then ' +
        'reads `1[bin]`, gets `undefined`, and throws `TypeError: ... .push is not a function`; with a single ' +
        'parcel nothing throws and the function returns `1`. The bins are created up front from the `bins` list so ' +
        'empty ones survive, and the `??` fallback routes unknown bins to `"other"`. When you need the array back ' +
        'from a fold, return the accumulator explicitly — `push` will not do it for you.',
      id: 'sort-into-bins',
      methods: ['push', 'forEach'],
      order: 8,
      solution: code(`
interface Parcel {
  bin: string;
  id: number;
}

export function solve(parcels: Parcel[], bins: string[]): Record<string, number[]> {
  const sorted: Record<string, number[]> = { other: [] };
  bins.forEach((bin) => {
    sorted[bin] = [];
  });
  parcels.forEach(({ bin, id }) => {
    (sorted[bin] ?? sorted.other).push(id);
  });
  return sorted;
}
`),
      starterCode: code(`
interface Parcel {
  bin: string;
  id: number;
}

export function solve(parcels: Parcel[], bins: string[]): Record<string, number[]> {
  // Create every bin (plus other) first, then forEach the parcels and push each id into its bin.
  return { other: [] };
}
`),
      tests: [
        tc(
          'parcels land in their bins in arrival order (trap)',
          [
            [
              { bin: 'a', id: 1 },
              { bin: 'b', id: 2 },
              { bin: 'a', id: 3 },
            ],
            ['a', 'b'],
          ],
          { a: [1, 3], b: [2], other: [] },
        ),
        tc(
          'unlisted bin goes to other (trap)',
          [
            [
              { bin: 'zz', id: 7 },
              { bin: 'a', id: 8 },
            ],
            ['a'],
          ],
          { a: [8], other: [7] },
        ),
        tc('empty listed bins still appear', [[], ['a', 'b']], { a: [], b: [], other: [] }),
        tc('single parcel', [[{ bin: 'a', id: 1 }], ['a']], { a: [1], other: [] }),
        tc(
          'no bins listed sends everything to other',
          [
            [
              { bin: 'x', id: 1 },
              { bin: 'y', id: 2 },
            ],
            [],
          ],
          { other: [1, 2] },
        ),
      ],
      title: 'push returns a length',
      trap: code(`
interface Parcel {
  bin: string;
  id: number;
}

export function solve(parcels: Parcel[], bins: string[]): Record<string, number[]> {
  const empty: Record<string, number[]> = { other: [] };
  bins.forEach((bin) => {
    empty[bin] = [];
  });
  return parcels.reduce((sorted, { bin, id }) => (sorted[bin] ?? sorted.other).push(id), empty);
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Return the ids of orders whose parcels have *all* been delivered, in input order. An order with no parcels ' +
        'at all is not delivered — there is nothing to hand over yet.\n\n' +
        'Signature: `solve(orders: { id: number; parcels: { delivered: boolean }[] }[]): number[]`\n\n' +
        'Use `every` for the per-order check — and think about what it says when `parcels` is empty.',
      difficulty: 'advanced',
      explanation:
        '`every` is the universal quantifier, and universal statements about nothing are true: `[].every(p)` ' +
        'returns `true` for any predicate, because no element exists to be a counterexample. That vacuous truth is ' +
        'correct logic and the wrong business answer here — an order with zero parcels would be reported as fully ' +
        'delivered. Neither `every` nor `filter` will add the “at least one” condition for you; it has to be ' +
        'stated, and `parcels.length > 0 && parcels.every(...)` states it in the order that also short-circuits ' +
        'cheapest. `filter` keeps the qualifying orders in input order and `map` projects the ids. Whenever a spec ' +
        'says “all of them”, ask whether it also silently means “and there are some” — `every` alone answers only ' +
        'the first half, and its dual `some` returns `false` on `[]` for the same reason.',
      id: 'fully-delivered-orders',
      methods: ['every', 'filter', 'map'],
      order: 9,
      solution: code(`
interface Parcel {
  delivered: boolean;
}

interface Order {
  id: number;
  parcels: Parcel[];
}

export function solve(orders: Order[]): number[] {
  return orders
    .filter(({ parcels }) => parcels.length > 0 && parcels.every((parcel) => parcel.delivered))
    .map(({ id }) => id);
}
`),
      starterCode: code(`
interface Parcel {
  delivered: boolean;
}

interface Order {
  id: number;
  parcels: Parcel[];
}

export function solve(orders: Order[]): number[] {
  // filter the orders with every() — but every() on [] is true, so say 'at least one' yourself.
  return [];
}
`),
      tests: [
        tc(
          'order with no parcels is not delivered (trap)',
          [
            [
              { id: 1, parcels: [] },
              { id: 2, parcels: [{ delivered: true }] },
            ],
          ],
          [2],
        ),
        tc('all parcels delivered', [[{ id: 1, parcels: [{ delivered: true }, { delivered: true }] }]], [1]),
        tc(
          'one undelivered parcel blocks the order',
          [[{ id: 1, parcels: [{ delivered: true }, { delivered: false }] }]],
          [],
        ),
        tc(
          'mixed orders keep input order',
          [
            [
              { id: 5, parcels: [{ delivered: true }] },
              { id: 3, parcels: [{ delivered: false }] },
              { id: 9, parcels: [{ delivered: true }] },
            ],
          ],
          [5, 9],
        ),
        tc('no orders', [[]], []),
      ],
      title: 'All delivered — of none?',
      trap: code(`
interface Parcel {
  delivered: boolean;
}

interface Order {
  id: number;
  parcels: Parcel[];
}

export function solve(orders: Order[]): number[] {
  return orders.filter(({ parcels }) => parcels.every((parcel) => parcel.delivered)).map(({ id }) => id);
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Return the positions in `readings` whose value is strictly above `threshold`, as indices into the ' +
        '*original* array, ascending.\n\n' +
        'Signature: `solve(readings: number[], threshold: number): number[]`\n\n' +
        'Use `entries()` so each value carries its own index through the pipeline.',
      difficulty: 'advanced',
      explanation:
        '`filter` returns a new, dense array, and every index-taking method after it — `map`’s second argument ' +
        'included — counts from zero in that *new* array. The trap reads correctly and reports `[0, 1]` for ' +
        '`[1, 9, 2, 8]` above `5`: the survivors are numbered by where they landed, not where they came from. ' +
        '`entries()` fixes this by attaching the index to the value before anything is dropped: it yields ' +
        '`[index, value]` pairs, spread into an array so `filter` and `map` can run over them. The pairs pass ' +
        'through `filter` intact, so the index each one carries is the original position, and the final `map` just ' +
        'picks it out. Note the destructuring — `([, value])` skips the first tuple slot in the predicate, and ' +
        '`([index])` takes only the first in the projection. The rule generalises: capture the index *before* any ' +
        'method that changes length.',
      id: 'indices-above-threshold',
      methods: ['entries', 'filter', 'map'],
      order: 10,
      solution: code(`
export function solve(readings: number[], threshold: number): number[] {
  return [...readings.entries()].filter(([, value]) => value > threshold).map(([index]) => index);
}
`),
      starterCode: code(`
export function solve(readings: number[], threshold: number): number[] {
  // Attach the index with entries() BEFORE filtering — filter renumbers from zero.
  return [];
}
`),
      tests: [
        tc('indices refer to the original positions (trap)', [[1, 9, 2, 8], 5], [1, 3]),
        tc('nothing above threshold', [[1, 2], 5], []),
        tc('everything above threshold', [[6, 7], 5], [0, 1]),
        tc('equal to threshold is not above (trap)', [[5, 6], 5], [1]),
        tc('empty readings', [[], 0], []),
      ],
      title: 'Indices that survive a filter',
      trap: code(`
export function solve(readings: number[], threshold: number): number[] {
  return readings.filter((value) => value > threshold).map((_value, index) => index);
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Return `true` when `xs` is strictly increasing — each element larger than the one before it — and `false` ' +
        'otherwise. An empty list and a single element are both strictly increasing.\n\n' +
        'Signature: `solve(xs: number[]): boolean`\n\n' +
        'Use `every` with its index argument to compare neighbours.',
      difficulty: 'advanced',
      explanation:
        '`every` hands the callback the index as its second argument, and that is enough to compare each element ' +
        'with a neighbour without a loop. The direction of the comparison matters. Looking *ahead* — ' +
        '`x < xs[index + 1]` — runs off the end of the array on the last element, where `xs[index + 1]` is ' +
        '`undefined`; `4 < undefined` is `false`, so the trap rejects every non-empty list, including `[4]`. ' +
        'Looking *back* — `xs[index - 1] < x` — has the same edge at index `0`, which is why the callback ' +
        'short-circuits with `index === 0 ||` before the lookup happens. `every` stops at the first `false`, so a ' +
        'dip early in a long list is caught without visiting the rest, and on `[]` it returns `true`, the vacuous ' +
        'answer the spec asks for. Strict `<` is what rejects the repeated `2`; a `<=` would make this ' +
        '“non-decreasing”.',
      id: 'strictly-increasing',
      methods: ['every'],
      order: 11,
      solution: code(`
export function solve(xs: number[]): boolean {
  return xs.every((x, index) => index === 0 || xs[index - 1] < x);
}
`),
      starterCode: code(`
export function solve(xs: number[]): boolean {
  // Compare each x with a neighbour via the index — and mind which end runs off the array.
  return false;
}
`),
      tests: [
        tc('strictly increasing list (trap)', [[1, 2, 5, 9]], true),
        tc('single element is trivially increasing (trap)', [[4]], true),
        tc('a repeated value is not strictly increasing', [[1, 2, 2, 3]], false),
        tc('a dip fails', [[1, 3, 2]], false),
        tc('negative values', [[-3, -1, 0]], true),
        tc('empty list', [[]], true),
      ],
      title: 'Strictly increasing?',
      trap: code(`
export function solve(xs: number[]): boolean {
  return xs.every((x, index) => x < xs[index + 1]);
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Pair `names` with `scores` position by position into a `Map`, stopping as soon as either list runs out; a ' +
        'name that repeats keeps its later score.\n\n' +
        'Signature: `solve(names: string[], scores: number[]): Map<string, number>`\n\n' +
        'Drive it with two `values()` iterators advanced by `next()` — no index arithmetic.',
      difficulty: 'expert',
      explanation:
        '`values()` returns an iterator — an object whose `next()` yields `{ done, value }` one element at a time ' +
        'and remembers where it is. Holding two of them and calling `next()` on both in the same loop turn is ' +
        '*lockstep*: each turn consumes exactly one element from each side, and the loop condition ' +
        '`!name.done && !score.done` ends the pairing the moment either side is exhausted, with no lengths compared ' +
        'and no index in sight. That is what the index-based trap gets wrong: `names.map((name, i) => [name, ' +
        'scores[i]])` visits every name, so when names outnumber scores the tail is paired with `undefined` and the ' +
        'Map grows an entry the spec says should not exist. `Map.set` with a repeated key overwrites, which gives ' +
        'the “later wins” rule for free. The same two-iterator skeleton, with the condition flipped to `||` and a ' +
        'fill value, becomes `zipLongest`.',
      id: 'lockstep-into-map',
      methods: ['values'],
      order: 12,
      solution: code(`
export function solve(names: string[], scores: number[]): Map<string, number> {
  const paired = new Map<string, number>();
  const nameIterator = names.values();
  const scoreIterator = scores.values();
  let name = nameIterator.next();
  let score = scoreIterator.next();
  while (!name.done && !score.done) {
    paired.set(name.value, score.value);
    name = nameIterator.next();
    score = scoreIterator.next();
  }
  return paired;
}
`),
      starterCode: code(`
export function solve(names: string[], scores: number[]): Map<string, number> {
  // One values() iterator per list; call next() on both each turn and stop when either is done.
  return new Map();
}
`),
      tests: [
        tc(
          'equal lengths pair up',
          [
            ['ada', 'bob'],
            [90, 80],
          ],
          new Map([
            ['ada', 90],
            ['bob', 80],
          ]),
        ),
        tc('more names than scores stops at the shorter (trap)', [['ada', 'bob', 'cy'], [90]], new Map([['ada', 90]])),
        tc('more scores than names', [['ada'], [90, 80, 70]], new Map([['ada', 90]])),
        tc(
          'a repeated name keeps the later score',
          [
            ['ada', 'ada'],
            [1, 2],
          ],
          new Map([['ada', 2]]),
        ),
        tc('no names', [[], [1, 2]], new Map()),
        tc('both empty', [[], []], new Map()),
      ],
      title: 'Lockstep with two iterators',
      trap: code(`
export function solve(names: string[], scores: number[]): Map<string, number> {
  return new Map(names.map((name, index) => [name, scores[index]]));
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Merge two ascending number lists into one ascending list in a single pass, without sorting. Duplicates ' +
        'are kept.\n\n' +
        'Signature: `solve(left: number[], right: number[]): number[]`\n\n' +
        'Hold one `values()` iterator per side and `push` whichever head is smaller, advancing only that side.',
      difficulty: 'expert',
      explanation:
        'This is the merge step of merge sort, and it is O(n) because each side is consumed *exactly once*. Two ' +
        '`values()` iterators hold the current head of each list; the loop compares the heads, `push`es the smaller ' +
        'one, and calls `next()` only on the side it took from — the other head stays put and is compared again ' +
        'next turn. When one iterator reports `done`, the remainder of the other side is already sorted and is ' +
        'drained straight in. The `<=` keeps duplicates from both sides. The trap concatenates and sorts: ' +
        '`[...left, ...right].sort()` throws away the ordering you were given (O(n log n) instead of O(n)) and, ' +
        'worse, calls `sort` with no comparator, so `10` lands before `2` as strings. Manual `next()` is what makes ' +
        '“advance only one side” expressible; `forEach` and `map` cannot pause one list while the other catches up.',
      id: 'merge-sorted-with-iterators',
      methods: ['values', 'push'],
      order: 13,
      solution: code(`
export function solve(left: number[], right: number[]): number[] {
  const merged: number[] = [];
  const leftIterator = left.values();
  const rightIterator = right.values();
  let l = leftIterator.next();
  let r = rightIterator.next();
  while (!l.done && !r.done) {
    if (l.value <= r.value) {
      merged.push(l.value);
      l = leftIterator.next();
    } else {
      merged.push(r.value);
      r = rightIterator.next();
    }
  }
  while (!l.done) {
    merged.push(l.value);
    l = leftIterator.next();
  }
  while (!r.done) {
    merged.push(r.value);
    r = rightIterator.next();
  }
  return merged;
}
`),
      starterCode: code(`
export function solve(left: number[], right: number[]): number[] {
  // Compare the two heads, push the smaller, and call next() only on the side you took from.
  return [];
}
`),
      tests: [
        tc(
          'interleaved values (trap)',
          [
            [1, 10],
            [2, 9],
          ],
          [1, 2, 9, 10],
        ),
        tc('one side runs out first', [[1, 2, 3], [2]], [1, 2, 2, 3]),
        tc('left empty', [[], [4, 5]], [4, 5]),
        tc('right empty', [[4, 5], []], [4, 5]),
        tc(
          'all of right before left',
          [
            [7, 8],
            [1, 2],
          ],
          [1, 2, 7, 8],
        ),
        tc('negative values', [[-5, 0], [-3]], [-5, -3, 0]),
        tc('both empty', [[], []], []),
      ],
      title: 'Merge two sorted lists',
      trap: code(`
export function solve(left: number[], right: number[]): number[] {
  return [...left, ...right].sort();
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Interleave several queues fairly: take the first item from each queue in turn, then the second from each, ' +
        'and so on, skipping queues that have run out, until every queue is empty.\n\n' +
        'Signature: `solve(queues: string[][]): string[]`\n\n' +
        'Example: `solve([["a1", "a2", "a3"], ["b1"], ["c1", "c2"]])` → `["a1", "b1", "c1", "a2", "c2", "a3"]`. ' +
        'Give every queue its own `values()` iterator.',
      difficulty: 'expert',
      explanation:
        'Each queue gets its own `values()` iterator, and an iterator remembers its own position — which is exactly ' +
        'the state a round-robin needs, one cursor per queue. Every pass calls `next()` once on each live iterator; ' +
        'a `{ done: true }` result retires that iterator from the `active` list, while any other result `push`es ' +
        'its value. `map` creates the iterators, `forEach` runs a pass, and the loop repeats until `active` is ' +
        'empty, so the number of rounds is decided by the queues themselves rather than computed up front. The ' +
        'index-based trap computes the longest length and reads `queue[index]` from every queue each round, which ' +
        'yields `undefined` for queues that have already run out and pushes those into the result. Retiring ' +
        'iterators as they finish is the same idea as `zip` stopping at the shorter list — applied to *n* lists, ' +
        'and continuing rather than stopping.',
      id: 'round-robin-merge',
      methods: ['values', 'map', 'forEach', 'push'],
      order: 14,
      solution: code(`
export function solve(queues: string[][]): string[] {
  const merged: string[] = [];
  let active: Iterator<string>[] = queues.map((queue) => queue.values());
  while (active.length > 0) {
    const stillActive: Iterator<string>[] = [];
    active.forEach((iterator) => {
      const step = iterator.next();
      if (!step.done) {
        merged.push(step.value);
        stillActive.push(iterator);
      }
    });
    active = stillActive;
  }
  return merged;
}
`),
      starterCode: code(`
export function solve(queues: string[][]): string[] {
  // One iterator per queue; each round call next() on every live one and retire those that are done.
  return [];
}
`),
      tests: [
        tc(
          'queues of different lengths (trap)',
          [[['a1', 'a2', 'a3'], ['b1'], ['c1', 'c2']]],
          ['a1', 'b1', 'c1', 'a2', 'c2', 'a3'],
        ),
        tc(
          'equal lengths interleave evenly',
          [
            [
              ['a1', 'a2'],
              ['b1', 'b2'],
            ],
          ],
          ['a1', 'b1', 'a2', 'b2'],
        ),
        tc('an empty queue is skipped (trap)', [[[], ['b1', 'b2']]], ['b1', 'b2']),
        tc('single queue keeps its order', [[['a1', 'a2', 'a3']]], ['a1', 'a2', 'a3']),
        tc('all queues empty', [[[], []]], []),
        tc('no queues', [[]], []),
      ],
      title: 'Round-robin merge',
      trap: code(`
export function solve(queues: string[][]): string[] {
  const rounds = Math.max(0, ...queues.map((queue) => queue.length));
  const merged: string[] = [];
  Array.from({ length: rounds }).forEach((_round, index) => {
    queues.forEach((queue) => {
      merged.push(queue[index]);
    });
  });
  return merged;
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Find the first cell equal to `target`, scanning rows top to bottom and each row left to right, and return ' +
        'its `[row, column]` — or `null` when it is absent. Rows may have different lengths.\n\n' +
        'Signature: `solve(grid: number[][], target: number): [number, number] | null`\n\n' +
        'Use `entries()` to keep the row index attached while `some` stops the scan at the first hit.',
      difficulty: 'expert',
      explanation:
        'Three methods split the work. `entries()` turns the grid into `[row, cells]` pairs so the row number rides ' +
        'along with its cells; `some` walks those pairs and stops at the first callback that returns `true`, which ' +
        'is the early exit a scan needs; and `indexOf` does the per-row search, returning the column or `-1`. The ' +
        'answer leaves through the captured `found`, exactly as in the “`some` as `break`” pattern. The trap ' +
        'flattens the grid and converts the flat index back with `Math.floor(index / width)` and `index % width` — ' +
        'arithmetic that is only valid when every row has the same width. On the ragged grid ' +
        '`[[1, 2, 3], [4], [5, 6]]`, `5` sits at flat index `4` and comes back as `[1, 1]`, a cell that does not ' +
        'exist; the real position is `[2, 0]`. Keeping the row index attached, rather than reconstructing it, makes ' +
        'ragged input a non-event.',
      id: 'locate-in-grid',
      methods: ['entries', 'some', 'indexOf'],
      order: 15,
      solution: code(`
export function solve(grid: number[][], target: number): [number, number] | null {
  let found: [number, number] | null = null;
  [...grid.entries()].some(([row, cells]) => {
    const column = cells.indexOf(target);
    if (column === -1) {
      return false;
    }
    found = [row, column];
    return true;
  });
  return found;
}
`),
      starterCode: code(`
export function solve(grid: number[][], target: number): [number, number] | null {
  // Spread grid.entries() so each row carries its index, then some() + indexOf to stop at the first hit.
  return null;
}
`),
      tests: [
        tc('ragged rows break flat-index arithmetic (trap)', [[[1, 2, 3], [4], [5, 6]], 5], [2, 0]),
        tc(
          'rectangular grid',
          [
            [
              [1, 2],
              [3, 4],
            ],
            4,
          ],
          [1, 1],
        ),
        tc(
          'first occurrence in scan order wins',
          [
            [
              [0, 7],
              [7, 0],
            ],
            7,
          ],
          [0, 1],
        ),
        tc(
          'missing target',
          [
            [
              [1, 2],
              [3, 4],
            ],
            9,
          ],
          null,
        ),
        tc('empty rows are skipped (trap)', [[[], [8]], 8], [1, 0]),
        tc('empty grid', [[], 1], null),
      ],
      title: 'Locate a cell in a ragged grid',
      trap: code(`
export function solve(grid: number[][], target: number): [number, number] | null {
  const width = grid[0]?.length ?? 0;
  const index = grid.flat().indexOf(target);
  if (index === -1 || width === 0) {
    return null;
  }
  return [Math.floor(index / width), index % width];
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Decide whether `needle` appears in `haystack` as a subsequence: every element of `needle`, in order, can ' +
        'be matched to a later and later position of `haystack`, with gaps allowed. Each element of `haystack` may ' +
        'be used at most once.\n\n' +
        'Signature: `solve(needle: number[], haystack: number[]): boolean`\n\n' +
        'Example: `solve([1, 3], [1, 2, 3])` → `true`; `solve([3, 1], [1, 2, 3])` → `false`. Let `every` consume ' +
        'a single `values()` iterator of the haystack across all of its calls.',
      difficulty: 'expert',
      explanation:
        'The subsequence test is a two-pointer walk, and an iterator *is* a pointer that remembers where it ' +
        'stopped. Creating `haystack.values()` once, *outside* the `every` callback, means every call to the ' +
        'callback resumes scanning from wherever the previous call left off: it pulls `next()` until it meets the ' +
        'wanted value or the iterator reports `done`, and returns whether it found it. `every` supplies the early ' +
        'exit — the first needle element that cannot be found ends the search — and the iterator supplies the ' +
        '“later and later” constraint without any index bookkeeping. The trap, ' +
        '`needle.every((x) => haystack.includes(x))`, restarts from the beginning each time, so it accepts `[3, 1]` ' +
        'inside `[1, 2, 3]` and matches a single haystack `1` twice for `[1, 1]`. Creating the iterator *inside* ' +
        'the callback would be the same bug in disguise. An empty needle makes no demands, so `every` returns ' +
        '`true`.',
      id: 'is-subsequence',
      methods: ['every', 'values'],
      order: 16,
      solution: code(`
export function solve(needle: number[], haystack: number[]): boolean {
  const remaining = haystack.values();
  return needle.every((wanted) => {
    let step = remaining.next();
    while (!step.done && step.value !== wanted) {
      step = remaining.next();
    }
    return !step.done;
  });
}
`),
      starterCode: code(`
export function solve(needle: number[], haystack: number[]): boolean {
  // Create ONE haystack iterator outside every(); each callback keeps pulling next() from where the last stopped.
  return false;
}
`),
      tests: [
        tc(
          'elements in order with gaps',
          [
            [1, 3],
            [1, 2, 3],
          ],
          true,
        ),
        tc(
          'order matters (trap)',
          [
            [3, 1],
            [1, 2, 3],
          ],
          false,
        ),
        tc(
          'each haystack element matches once (trap)',
          [
            [1, 1],
            [1, 2],
          ],
          false,
        ),
        tc(
          'repeated needle values need repeated haystack values',
          [
            [1, 1],
            [1, 2, 1],
          ],
          true,
        ),
        tc(
          'needle longer than haystack',
          [
            [1, 2, 3],
            [1, 2],
          ],
          false,
        ),
        tc('empty needle is a subsequence of anything', [[], [5]], true),
        tc('empty haystack with a non-empty needle', [[4], []], false),
      ],
      title: 'Subsequence via a shared iterator',
      trap: code(`
export function solve(needle: number[], haystack: number[]): boolean {
  return needle.every((wanted) => haystack.includes(wanted));
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Group consecutive equal values into runs, preserving order: `[1, 1, 2, 1]` → `[[1, 1], [2], [1]]`. A value ' +
        'that appears again after a different value starts a new run, not a merge into the earlier one.\n\n' +
        'Signature: `solve(xs: number[]): number[][]`\n\n' +
        'Build the runs with `forEach` and `push`, checking the run in progress with `at(-1)`.',
      difficulty: 'expert',
      explanation:
        'A run is defined by adjacency, so the only state the walk needs is “the run currently being extended”, ' +
        'and `at(-1)` reads it straight off the output: `runs.at(-1)` is the last run pushed, or `undefined` before ' +
        'the first. `forEach` visits each value once; if the current run exists and its first element equals the ' +
        'value, `push` extends that inner array in place, otherwise `push` opens a new run `[x]` on the outer one. ' +
        'Nothing is copied, so the whole walk is O(n). ' +
        'The trap groups by *value* instead of by *position* — a `Map` keyed on `x` — which is the ' +
        'right tool for “how many of each” and the wrong one here: the `1` that reappears after the `2` lands in ' +
        'the first group, and `[1, 1, 2, 1]` comes back as `[[1, 1, 1], [2]]`. Adjacency is lost the moment you ' +
        'index by value.',
      id: 'consecutive-runs',
      methods: ['forEach', 'push', 'at'],
      order: 17,
      solution: code(`
export function solve(xs: number[]): number[][] {
  const runs: number[][] = [];
  xs.forEach((x) => {
    const current = runs.at(-1);
    if (current !== undefined && current[0] === x) {
      current.push(x);
    } else {
      runs.push([x]);
    }
  });
  return runs;
}
`),
      starterCode: code(`
export function solve(xs: number[]): number[][] {
  // runs.at(-1) is the run in progress — extend it when x matches its first element, else push a new [x].
  return [];
}
`),
      tests: [
        tc('a value that returns starts a new run (trap)', [[1, 1, 2, 1]], [[1, 1], [2], [1]]),
        tc('runs of varying length', [[3, 3, 3, 4, 5, 5]], [[3, 3, 3], [4], [5, 5]]),
        tc('all distinct', [[1, 2, 3]], [[1], [2], [3]]),
        tc('all equal', [[7, 7]], [[7, 7]]),
        tc('single element', [[9]], [[9]]),
        tc('empty input', [[]], []),
      ],
      title: 'Runs of equal neighbours',
      trap: code(`
export function solve(xs: number[]): number[][] {
  const groups = new Map<number, number[]>();
  xs.forEach((x) => {
    const group = groups.get(x);
    if (group === undefined) {
      groups.set(x, [x]);
    } else {
      group.push(x);
    }
  });
  return [...groups.values()];
}
`),
    },
    {
      categoryId: 'iteration-basics',
      description:
        'Decide whether `grid` is a Latin square of size `n`: it has `n` rows of `n` cells, and every row *and* ' +
        'every column contains each of the numbers `1` through `n` exactly once. `n` is `grid.length`; an empty ' +
        'grid is not a Latin square.\n\n' +
        'Signature: `solve(grid: number[][]): boolean`\n\n' +
        'Write one “is a permutation of 1..n” check and apply it with `every` to the rows and to the columns.',
      difficulty: 'expert',
      explanation:
        '`every` does the work at three levels. The innermost `line.every` checks that every value sits ' +
        'in `1..n`; combined with `line.length === n` and `new Set(line).size === n` (no duplicates), that is a ' +
        'complete “is a permutation of `1..n`” test. The same predicate then runs over the rows with ' +
        '`grid.every(isPermutation)` and over the columns — which do not exist as arrays until ' +
        '`Array.from({ length: n }, (_, c) => grid.map((row) => row[c]))` builds them. The trap checks only the ' +
        'rows: `[[1, 2, 3], [1, 2, 3], [1, 2, 3]]` has three perfect rows and three broken columns, and passes. ' +
        'Writing the predicate once and reusing it is what keeps the two directions in sync; a ragged row fails ' +
        'the length check, and a short row leaves `undefined` in a column, which the range check rejects. The ' +
        'empty grid needs its own guard, because `[].every` would happily call it a Latin square.',
      id: 'latin-square',
      methods: ['every', 'map', 'Array.from'],
      order: 18,
      solution: code(`
export function solve(grid: number[][]): boolean {
  const n = grid.length;
  if (n === 0) {
    return false;
  }
  const isPermutation = (line: number[]): boolean =>
    line.length === n &&
    new Set(line).size === n &&
    line.every((value) => Number.isInteger(value) && value >= 1 && value <= n);
  const columns = Array.from({ length: n }, (_, column) => grid.map((row) => row[column]));
  return grid.every(isPermutation) && columns.every(isPermutation);
}
`),
      starterCode: code(`
export function solve(grid: number[][]): boolean {
  // One isPermutation(line) predicate; every() it over the rows AND over columns you build with Array.from.
  return false;
}
`),
      tests: [
        tc(
          'valid 3x3 latin square',
          [
            [
              [1, 2, 3],
              [2, 3, 1],
              [3, 1, 2],
            ],
          ],
          true,
        ),
        tc(
          'rows valid but columns repeat (trap)',
          [
            [
              [1, 2, 3],
              [1, 2, 3],
              [1, 2, 3],
            ],
          ],
          false,
        ),
        tc(
          'a repeated value in a row',
          [
            [
              [1, 1],
              [2, 2],
            ],
          ],
          false,
        ),
        tc(
          'values outside 1..n',
          [
            [
              [0, 1],
              [1, 0],
            ],
          ],
          false,
        ),
        tc(
          'not square',
          [
            [
              [1, 2],
              [2, 1],
              [1, 2],
            ],
          ],
          false,
        ),
        tc('1x1 grid', [[[1]]], true),
        tc('empty grid', [[]], false),
      ],
      title: 'Latin square',
      trap: code(`
export function solve(grid: number[][]): boolean {
  const n = grid.length;
  return grid.every(
    (row) => row.length === n && new Set(row).size === n && row.every((value) => value >= 1 && value <= n),
  );
}
`),
    },
  ],
};
