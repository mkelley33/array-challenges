import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const filteringAndSlicing: CategoryModule = {
  category: {
    description:
      'Keep the elements that matter and carve out the ranges you need — without mutating what you were given.',
    id: 'filtering-and-slicing',
    order: 4,
    title: 'Filtering & Slicing',
  },
  challenges: [
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Return only the products that are in stock, preserving their original order. ' +
        'The input array must come back untouched — no removing items in place.\n\n' +
        'Signature: `solve(products: { inStock: boolean; name: string }[]): { inStock: boolean; name: string }[]`',
      difficulty: 'novice',
      explanation:
        '`filter` calls its predicate once per element and collects every element whose predicate returns a truthy ' +
        'value into a *brand-new* array — the original is never modified, which is why filtering is safe on shared ' +
        'data like props or state. `products.filter((product) => product.inStock)` reads as a sentence: keep the ' +
        'products that are in stock. Contrast this with a `for` loop that `splice`s matches out: that mutates the ' +
        'source and skips elements as indices shift. When the goal is “a subset, order preserved, source intact,” ' +
        '`filter` is always the tool.',
      id: 'in-stock-products',
      methods: ['filter'],
      order: 1,
      solution: code(`
interface Product {
  inStock: boolean;
  name: string;
}

export function solve(products: Product[]): Product[] {
  return products.filter((product) => product.inStock);
}
`),
      starterCode: code(`
interface Product {
  inStock: boolean;
  name: string;
}

export function solve(products: Product[]): Product[] {
  // Keep the elements whose predicate returns true — without touching the input.
  return [];
}
`),
      tests: [
        tc(
          'keeps only in-stock products',
          [
            [
              { inStock: true, name: 'apple' },
              { inStock: false, name: 'banana' },
              { inStock: true, name: 'cherry' },
            ],
          ],
          [
            { inStock: true, name: 'apple' },
            { inStock: true, name: 'cherry' },
          ],
        ),
        tc(
          'everything in stock',
          [
            [
              { inStock: true, name: 'kiwi' },
              { inStock: true, name: 'mango' },
            ],
          ],
          [
            { inStock: true, name: 'kiwi' },
            { inStock: true, name: 'mango' },
          ],
        ),
        tc('nothing in stock', [[{ inStock: false, name: 'durian' }]], []),
        tc('empty inventory', [[]], []),
      ],
      title: 'In-stock products',
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Return the first `n` and the last `n` items of an array as `{ first, last }`, without modifying the input. ' +
        'When `n` is `0`, both slices must be empty — careful, `slice(-0)` does not do what you might hope.\n\n' +
        'Signature: `solve(items: number[], n: number): { first: number[]; last: number[] }`',
      difficulty: 'novice',
      explanation:
        '`slice(start, end)` copies the half-open range `[start, end)` into a new array and never mutates the ' +
        'source; called with no arguments at all, `slice()` is the idiomatic shallow copy. Negative indices count ' +
        'from the end, so `items.slice(-n)` means “the last n items.” The trap: when `n` is `0`, `-n` is still `0`, ' +
        'and `slice(0)` returns the *whole* array instead of the empty “last zero items.” Negative indices only kick ' +
        'in for genuinely negative numbers, so the `n === 0` case needs an explicit guard. `slice(0, n)` needs no ' +
        'guard — an `end` of `0` naturally yields `[]`.',
      id: 'first-and-last-n',
      methods: ['slice'],
      order: 2,
      solution: code(`
export function solve(items: number[], n: number): { first: number[]; last: number[] } {
  return {
    first: items.slice(0, n),
    last: n === 0 ? [] : items.slice(-n),
  };
}
`),
      starterCode: code(`
export function solve(items: number[], n: number): { first: number[]; last: number[] } {
  // slice(0, n) handles first; slice(-n) handles last... except when n is 0.
  return { first: [], last: [] };
}
`),
      tests: [
        tc('first and last two', [[1, 2, 3, 4, 5], 2], { first: [1, 2], last: [4, 5] }),
        tc('n of zero yields empty slices', [[1, 2, 3], 0], { first: [], last: [] }),
        tc('n larger than the array takes everything', [[1, 2], 5], { first: [1, 2], last: [1, 2] }),
        tc('empty array', [[], 3], { first: [], last: [] }),
      ],
      title: 'First n, last n',
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Compact an array: return a new array with every falsy value removed, keeping all truthy values in order.\n\n' +
        'Signature: `solve(values: unknown[]): unknown[]`\n\n' +
        'Aim for the one-liner — the predicate you need is a built-in function you already know.',
      difficulty: 'intermediate',
      explanation:
        '`filter(Boolean)` passes each element to the `Boolean` constructor-as-function, which returns `false` for ' +
        "exactly the falsy values — `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, and `NaN` — and `true` for " +
        "everything else. Everything else includes surprises like `[]`, `{}`, and `'0'`, which are all truthy and " +
        'survive the compaction. The pitfall runs the other way too: *legitimate* data vanishes. A price of `0` or ' +
        "an intentionally empty string `''` is falsy and gets dropped along with the junk, so reach for " +
        '`filter(Boolean)` only when every falsy value really is noise — otherwise write a precise predicate like ' +
        '`(value) => value !== null && value !== undefined`.',
      id: 'compact-falsy-values',
      methods: ['filter'],
      order: 3,
      solution: code(`
export function solve(values: unknown[]): unknown[] {
  return values.filter(Boolean);
}
`),
      starterCode: code(`
export function solve(values: unknown[]): unknown[] {
  // Eight values are falsy in JavaScript — one built-in predicate rejects them all.
  return values;
}
`),
      tests: [
        tc('removes null and undefined', [[1, null, 2, undefined, 3]], [1, 2, 3]),
        tc('removes empty strings and zeros', [['a', '', 0, 'b']], ['a', 'b']),
        tc('removes NaN and false', [[NaN, false, 'keep', 42]], ['keep', 42]),
        tc('all falsy', [[null, undefined, 0, '', false]], []),
        tc('empty array', [[]], []),
      ],
      title: 'Compact the array',
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Remove `count` items starting at index `start` and report both halves of the operation as ' +
        '`{ removed, remaining }` — but the caller’s array must not change.\n\n' +
        'Signature: `solve(items: string[], start: number, count: number): { removed: string[]; remaining: string[] }`',
      difficulty: 'intermediate',
      explanation:
        '`splice(start, count)` is the rare array method that does two things at once: it *mutates* the array it is ' +
        'called on by deleting `count` elements at `start`, and it *returns* the deleted elements as a new array. ' +
        'That double behavior is exactly what this challenge needs — after `const removed = copy.splice(start, count)`, ' +
        '`removed` holds what came out and `copy` has become the remainder. The essential move is spreading into a ' +
        'copy first (`[...items]`): calling `splice` directly on the argument would destroy the caller’s data, the ' +
        'classic splice foot-gun. `splice` is also forgiving — a `count` running past the end just deletes to the ' +
        'end, and splicing an empty array removes nothing.',
      id: 'splice-out-a-section',
      methods: ['splice'],
      order: 4,
      solution: code(`
export function solve(items: string[], start: number, count: number): { removed: string[]; remaining: string[] } {
  const remaining = [...items];
  const removed = remaining.splice(start, count);
  return { removed, remaining };
}
`),
      starterCode: code(`
export function solve(items: string[], start: number, count: number): { removed: string[]; remaining: string[] } {
  // splice both mutates its array AND returns what it deleted — use a copy.
  return { removed: [], remaining: [] };
}
`),
      tests: [
        tc('removes two from the middle', [['a', 'b', 'c', 'd', 'e'], 1, 2], {
          removed: ['b', 'c'],
          remaining: ['a', 'd', 'e'],
        }),
        tc('removes from the start', [['x', 'y', 'z'], 0, 1], { removed: ['x'], remaining: ['y', 'z'] }),
        tc('count of zero removes nothing', [['a', 'b'], 1, 0], { removed: [], remaining: ['a', 'b'] }),
        tc('count past the end stops at the end', [['a', 'b', 'c'], 2, 5], { removed: ['c'], remaining: ['a', 'b'] }),
        tc('empty array', [[], 0, 3], { removed: [], remaining: [] }),
      ],
      title: 'Surgical removal',
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Partition exam scores into `{ pass, fail }` in a **single pass**: a score passes when it is greater than ' +
        'or equal to `threshold`. Both groups keep the original order.\n\n' +
        'Signature: `solve(scores: number[], threshold: number): { fail: number[]; pass: number[] }`\n\n' +
        'Constraint: walk the array once — no double filtering.',
      difficulty: 'advanced',
      explanation:
        'The obvious solution is two `filter` calls — `scores.filter((s) => s >= threshold)` and its negation — which ' +
        'is perfectly readable but walks the array twice and evaluates the predicate twice per element. A single ' +
        '`reduce` pass does both classifications in one traversal: the accumulator starts as ' +
        '`{ fail: [], pass: [] }`, each score is pushed onto exactly one bucket, and the accumulator is returned so ' +
        'the next iteration receives it. Order is preserved within each group because elements are visited left to ' +
        'right. For small arrays, prefer the two-`filter` version for clarity; reach for the `reduce` partition when ' +
        'the array is large or the predicate is expensive — same result, half the work.',
      id: 'partition-pass-fail',
      methods: ['reduce', 'filter'],
      order: 5,
      solution: code(`
export function solve(scores: number[], threshold: number): { fail: number[]; pass: number[] } {
  return scores.reduce<{ fail: number[]; pass: number[] }>(
    (groups, score) => {
      if (score >= threshold) {
        groups.pass.push(score);
      } else {
        groups.fail.push(score);
      }
      return groups;
    },
    { fail: [], pass: [] },
  );
}
`),
      starterCode: code(`
export function solve(scores: number[], threshold: number): { fail: number[]; pass: number[] } {
  // One reduce pass, two buckets in the accumulator — remember to return it.
  return { fail: [], pass: [] };
}
`),
      tests: [
        tc('splits pass and fail', [[80, 45, 90, 60], 60], { fail: [45], pass: [80, 90, 60] }),
        tc('everyone passes', [[70, 80], 50], { fail: [], pass: [70, 80] }),
        tc('everyone fails', [[10, 20], 50], { fail: [10, 20], pass: [] }),
        tc('boundary score passes', [[50], 50], { fail: [], pass: [50] }),
        tc('empty scores', [[], 60], { fail: [], pass: [] }),
      ],
      title: 'Partition in one pass',
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Paginate a list: return `{ page, totalPages }` where `page` holds the items on the 1-based page ' +
        '`pageNumber` and `totalPages` is the number of pages needed for the whole list. Out-of-range pages ' +
        '(including page `0` and negative pages) yield `page: []`; an empty list has `totalPages: 0`.\n\n' +
        'Signature: `solve(items: string[], pageSize: number, pageNumber: number): { page: string[]; totalPages: number }`',
      difficulty: 'expert',
      explanation:
        '`slice` is forgiving at the far end: a `start` at or beyond `length` returns `[]` and an `end` past ' +
        '`length` is clamped, so `items.slice(start, start + pageSize)` handles both full pages, the final partial ' +
        'page, and pages past the end with zero special-casing. The danger sits at the *near* end: for page `0` or ' +
        'a negative page, `start` goes negative, and `slice` reinterprets negative indices as offsets from the end — ' +
        'silently serving items from the back of the list instead of nothing. That is why `pageNumber < 1` needs an ' +
        'explicit guard while overshooting does not. `totalPages` falls out of `Math.ceil(items.length / pageSize)`: ' +
        'the ceiling rounds a trailing partial page up to a full page, and an empty list gives `Math.ceil(0)`, ' +
        'which is `0` pages — no special case needed there either.',
      id: 'paginate-a-list',
      methods: ['slice'],
      order: 6,
      solution: code(`
export function solve(items: string[], pageSize: number, pageNumber: number): { page: string[]; totalPages: number } {
  const totalPages = Math.ceil(items.length / pageSize);
  const start = (pageNumber - 1) * pageSize;
  return {
    page: pageNumber < 1 ? [] : items.slice(start, start + pageSize),
    totalPages,
  };
}
`),
      starterCode: code(`
export function solve(items: string[], pageSize: number, pageNumber: number): { page: string[]; totalPages: number } {
  // slice forgives overshooting the end — but negative starts wrap around. Guard page < 1.
  return { page: [], totalPages: 0 };
}
`),
      tests: [
        tc('first page', [['a', 'b', 'c', 'd', 'e'], 2, 1], { page: ['a', 'b'], totalPages: 3 }),
        tc('last page is partial', [['a', 'b', 'c', 'd', 'e'], 2, 3], { page: ['e'], totalPages: 3 }),
        tc('page past the end', [['a', 'b', 'c', 'd', 'e'], 2, 9], { page: [], totalPages: 3 }),
        tc('page zero is out of range', [['a', 'b', 'c'], 2, 0], { page: [], totalPages: 2 }),
        tc('empty list has zero pages', [[], 10, 1], { page: [], totalPages: 0 }),
      ],
      title: 'Paginate a list',
    },
  ],
};
