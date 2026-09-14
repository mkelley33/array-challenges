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
        tc('splits pass and fail (trap)', [[80, 45, 90, 60], 60], { fail: [45], pass: [80, 90, 60] }),
        tc('everyone passes', [[70, 80], 50], { fail: [], pass: [70, 80] }),
        tc('everyone fails', [[10, 20], 50], { fail: [10, 20], pass: [] }),
        tc('boundary score passes', [[50], 50], { fail: [], pass: [50] }),
        tc('empty scores', [[], 60], { fail: [], pass: [] }),
      ],
      title: 'Partition in one pass',
      trap: code(`
export function solve(scores: number[], threshold: number): { fail: number[]; pass: number[] } {
  return scores.reduce<{ fail: number[]; pass: number[] }>(
    (groups, score) => {
      if (score >= threshold) {
        groups.pass.push(score);
      } else {
        groups.fail.push(score);
      }
    },
    { fail: [], pass: [] },
  );
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Paginate a list: return `{ page, totalPages }` where `page` holds the items on the 1-based page ' +
        '`pageNumber` and `totalPages` is the number of pages needed for the whole list. Out-of-range pages ' +
        '(including page `0` and negative pages) yield `page: []`; an empty list has `totalPages: 0`.\n\n' +
        'Signature: `solve(items: string[], pageSize: number, pageNumber: number): { page: string[]; totalPages: number }`\n\n' +
        '`slice` forgives a page past the end on its own — the pages before the start are the ones to think about.',
      difficulty: 'advanced',
      explanation:
        '`slice` is forgiving at the far end: a `start` at or beyond `length` returns `[]` and an `end` past ' +
        '`length` is clamped, so `items.slice(start, start + pageSize)` handles full pages, the final partial page, ' +
        'and pages past the end with no special-casing. The danger sits at the *near* end: for a page below `1`, ' +
        '`start` goes negative, and `slice` reinterprets negative indices as offsets from the end — page `-1` of ' +
        'five items silently serves `["b", "c"]`. Page `0` hides the bug, because its `end` of `0` happens to yield ' +
        '`[]`, which is exactly why the guard `pageNumber < 1` has to be explicit rather than discovered by trying ' +
        'one bad page. `totalPages` falls out of `Math.ceil(items.length / pageSize)`: the ceiling rounds a trailing ' +
        'partial page up to a full page, and an empty list gives `Math.ceil(0)`, which is `0` pages — no special ' +
        'case needed there either.',
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
        tc('negative page is out of range (trap)', [['a', 'b', 'c', 'd', 'e'], 2, -1], { page: [], totalPages: 3 }),
        tc('empty list has zero pages', [[], 10, 1], { page: [], totalPages: 0 }),
      ],
      title: 'Paginate a list',
      trap: code(`
export function solve(items: string[], pageSize: number, pageNumber: number): { page: string[]; totalPages: number } {
  const totalPages = Math.ceil(items.length / pageSize);
  const start = (pageNumber - 1) * pageSize;
  return { page: items.slice(start, start + pageSize), totalPages };
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Remove the first occurrence of `target` from `items` and return the result as a new array. When `target` ' +
        'is absent, return an unchanged copy. The input must not be mutated.\n\n' +
        'Signature: `solve(items: string[], target: string): string[]`\n\n' +
        '`indexOf` finds the element and `splice` on a copy removes it — think about what `indexOf` hands you when ' +
        'there is nothing to find.',
      difficulty: 'advanced',
      explanation:
        '`indexOf` reports a miss with `-1`, and `-1` is a perfectly valid argument to `splice`: negative starts ' +
        'count from the end, so `copy.splice(-1, 1)` deletes the *last* element. The tempting one-liner ' +
        '`copy.splice(copy.indexOf(target), 1)` therefore works on every hit and quietly destroys data on every ' +
        'miss — `["a", "b", "c"]` minus a `"z"` that is not there comes back as `["a", "b"]`. The fix is to keep ' +
        'the index in a variable and only `splice` when it is not `-1`. Two other details matter: spreading into ' +
        '`[...items]` first keeps the caller’s array intact, since `splice` mutates in place, and a `deleteCount` ' +
        'of exactly `1` removes only that occurrence — leaving the count off would remove everything from the ' +
        'index to the end. `filter` cannot do this job, because it would remove every occurrence, not just the ' +
        'first.',
      id: 'remove-first-occurrence',
      methods: ['splice', 'indexOf'],
      order: 7,
      solution: code(`
export function solve(items: string[], target: string): string[] {
  const copy = [...items];
  const index = copy.indexOf(target);
  if (index !== -1) {
    copy.splice(index, 1);
  }
  return copy;
}
`),
      starterCode: code(`
export function solve(items: string[], target: string): string[] {
  // Find the index, then splice(index, 1) on a copy — but only when there is a hit.
  return [];
}
`),
      tests: [
        tc('removes only the first match', [['a', 'b', 'a'], 'a'], ['b', 'a']),
        tc('absent target leaves everything in place (trap)', [['a', 'b', 'c'], 'z'], ['a', 'b', 'c']),
        tc('removes the last element when it is the only match', [['x', 'y'], 'y'], ['x']),
        tc('single matching element leaves an empty array', [['only'], 'only'], []),
        tc('empty input stays empty', [[], 'a'], []),
      ],
      title: 'Remove the first occurrence',
      trap: code(`
export function solve(items: string[], target: string): string[] {
  const copy = [...items];
  copy.splice(copy.indexOf(target), 1);
  return copy;
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Sensor readings arrive with gaps: a missing reading is `null` or `undefined`. Return only the readings that ' +
        'are present, in order — a reading of `0` is real data and must be kept.\n\n' +
        'Signature: `solve(readings: (null | number | undefined)[]): number[]`\n\n' +
        'Write the `filter` predicate precisely; the one-word predicate you may reach for is too greedy.',
      difficulty: 'advanced',
      explanation:
        '`filter(Boolean)` is the reflex for “drop the missing values”, and it is wrong here because `Boolean` ' +
        'rejects every falsy value, not just the absent ones: `0` is falsy, so a genuine zero reading vanishes ' +
        'along with the gaps, and `NaN` would go the same way. The predicate has to say what *absent* means — ' +
        '`reading !== null && reading !== undefined` (or the loose `reading != null`, which is the one place `!=` ' +
        'earns its keep) — so that `filter` keeps every number, zero included. Writing it as a type predicate, ' +
        '`(reading): reading is number => …`, lets TypeScript narrow the result to `number[]` without a cast. The ' +
        'rule: `filter(Boolean)` is for compacting junk; the moment a falsy value can be legitimate data, spell the ' +
        'predicate out.',
      id: 'keep-the-zeros',
      methods: ['filter'],
      order: 8,
      solution: code(`
export function solve(readings: (null | number | undefined)[]): number[] {
  return readings.filter((reading): reading is number => reading !== null && reading !== undefined);
}
`),
      starterCode: code(`
export function solve(readings: (null | number | undefined)[]): number[] {
  // Drop null and undefined only — zero is a reading, not a gap.
  return [];
}
`),
      tests: [
        tc('drops nulls and undefineds', [[1, null, 2, undefined, 3]], [1, 2, 3]),
        tc('zero is a real reading (trap)', [[0, null, 5]], [0, 5]),
        tc('negative and zero readings both stay (trap)', [[-3, 0, undefined]], [-3, 0]),
        tc('all readings missing', [[null, undefined]], []),
        tc('no gaps at all', [[4, 5]], [4, 5]),
        tc('empty input', [[]], []),
      ],
      title: 'Keep the zeros',
      trap: code(`
export function solve(readings: (null | number | undefined)[]): number[] {
  return readings.filter(Boolean) as number[];
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Return the items from index `start` up to but not including `end`. The range may be open-ended: an `end` ' +
        'of `null` means “to the end of the array” — exactly the shape a JSON API hands you.\n\n' +
        'Signature: `solve(items: string[], start: number, end: null | number): string[]`\n\n' +
        '`slice` does the copying — but check what it makes of a `null` end before passing it straight through.',
      difficulty: 'advanced',
      explanation:
        '`slice` treats a missing `end` as “to the end”, but missing means `undefined`, not `null`. Both arguments ' +
        'go through the same integer conversion as every index: `undefined` becomes the array length, while `null` ' +
        'converts to `0`. So `items.slice(2, null)` is `items.slice(2, 0)` — an end before the start — and returns ' +
        '`[]` without a hint that anything went wrong. The reference solution branches: `end === null ? ' +
        'items.slice(start) : items.slice(start, end)`; the one-liner `items.slice(start, end ?? undefined)` is the ' +
        'same idea, because `??` swaps the `null` for the value `slice` actually understands. The other edges ' +
        'behave: an `end` past the length is clamped and a `start` past the length yields `[]`. Whenever an index ' +
        'comes from JSON, remember that its “absent” value is `null`, and `null` is a number to `slice`.',
      id: 'open-ended-range',
      methods: ['slice'],
      order: 9,
      solution: code(`
export function solve(items: string[], start: number, end: null | number): string[] {
  return end === null ? items.slice(start) : items.slice(start, end);
}
`),
      starterCode: code(`
export function solve(items: string[], start: number, end: null | number): string[] {
  // slice(start, undefined) runs to the end — slice(start, null) does something else entirely.
  return [];
}
`),
      tests: [
        tc('closed range', [['a', 'b', 'c', 'd'], 1, 3], ['b', 'c']),
        tc('null end runs to the end (trap)', [['a', 'b', 'c', 'd'], 2, null], ['c', 'd']),
        tc('null end from zero copies everything (trap)', [['a', 'b'], 0, null], ['a', 'b']),
        tc('end past the length is clamped', [['a', 'b', 'c'], 1, 10], ['b', 'c']),
        tc('start past the length yields nothing', [['a', 'b'], 5, null], []),
        tc('start equal to end is empty', [['a', 'b', 'c'], 1, 1], []),
      ],
      title: 'Open-ended range',
      trap: code(`
export function solve(items: string[], start: number, end: null | number): string[] {
  return items.slice(start, end as number);
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Collapse consecutive repeats: keep the first element of every run of equal neighbours, so `[1, 1, 2, 1]` ' +
        'becomes `[1, 2, 1]`. This is not deduplication — a value that comes back after a different value is kept ' +
        'again.\n\n' +
        'Signature: `solve(values: number[]): number[]`\n\n' +
        '`filter` hands its predicate more than the value — the index and the array itself are what you need.',
      difficulty: 'advanced',
      explanation:
        'The predicate of `filter` receives three arguments — `(value, index, array)` — and the third one is what ' +
        'makes a neighbour comparison possible without a loop: keep `value` when `index === 0` or when it differs ' +
        'from `array[index - 1]`. The tempting shortcut is the well-known dedupe idiom ' +
        '`filter((value, index) => values.indexOf(value) === index)`, which keeps only the *first* occurrence ' +
        'anywhere in the array. That answers a different question: `[1, 1, 2, 1]` collapses to `[1, 2, 1]` but ' +
        'dedupes to `[1, 2]`, so the trailing `1` — a legitimate new run — is lost. (`indexOf` inside `filter` is ' +
        'also quadratic, a second reason to avoid it on long inputs.) Runs are a *local* property, so the ' +
        'predicate only ever needs to look one element back.',
      id: 'collapse-runs',
      methods: ['filter'],
      order: 10,
      solution: code(`
export function solve(values: number[]): number[] {
  return values.filter((value, index, array) => index === 0 || value !== array[index - 1]);
}
`),
      starterCode: code(`
export function solve(values: number[]): number[] {
  // Keep an element when it differs from the one before it — the predicate's third argument is the array.
  return [];
}
`),
      tests: [
        tc('collapses adjacent repeats', [[1, 1, 2, 2, 2, 3]], [1, 2, 3]),
        tc('a value that returns later is kept again (trap)', [[1, 1, 2, 1]], [1, 2, 1]),
        tc('alternating values never collapse (trap)', [[1, 2, 1, 2]], [1, 2, 1, 2]),
        tc('no repeats at all', [[1, 2, 3]], [1, 2, 3]),
        tc('one long run', [[7, 7, 7, 7]], [7]),
        tc('empty input', [[]], []),
      ],
      title: 'Collapse runs, not duplicates',
      trap: code(`
export function solve(values: number[]): number[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Remove every occurrence of `target` from `items` **in place** — other code holds a reference to this array ' +
        'and must see the change — and return that same array.\n\n' +
        'Signature: `solve(items: number[], target: number): number[]`\n\n' +
        '`splice` is the tool that shrinks an array in place; the question is which direction to walk while calling it.',
      difficulty: 'advanced',
      explanation:
        '`splice(index, 1)` shifts every later element one slot to the left, so in a forward loop the element that ' +
        'moves into `index` is never examined — the loop increments past it. Two matches side by side expose this: ' +
        'in `[1, 2, 2, 3]` the first `2` is removed, the second `2` slides into its slot, and the loop moves on to ' +
        '`3`. A `forEach` with `splice` inside has exactly the same flaw, because `forEach` also advances one index ' +
        'per call. Walking backwards fixes it for free: removing at `index` only shifts elements the loop has ' +
        'already visited, and the running `length` shrinks behind you rather than in front of you. When in-place ' +
        'is not a requirement, `filter` is the better answer; when it is, backwards `splice` is the pattern — the ' +
        'other option is `items.length = 0` followed by pushing the filtered copy back in.',
      id: 'remove-in-place-backwards',
      methods: ['splice'],
      order: 11,
      solution: code(`
export function solve(items: number[], target: number): number[] {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items[index] === target) {
      items.splice(index, 1);
    }
  }
  return items;
}
`),
      starterCode: code(`
export function solve(items: number[], target: number): number[] {
  // Every splice shifts what follows — pick a walking direction that never skips a neighbour.
  return items;
}
`),
      tests: [
        tc('removes scattered matches', [[1, 2, 3, 2, 4], 2], [1, 3, 4]),
        tc('adjacent matches are both removed (trap)', [[1, 2, 2, 3], 2], [1, 3]),
        tc('a run of three at the end (trap)', [[5, 9, 9, 9], 9], [5]),
        tc('no matches leaves everything', [[1, 2, 3], 7], [1, 2, 3]),
        tc('every element matches (trap)', [[4, 4, 4], 4], []),
        tc('empty input', [[], 1], []),
      ],
      title: 'Remove in place without skipping',
      trap: code(`
export function solve(items: number[], target: number): number[] {
  for (let index = 0; index < items.length; index += 1) {
    if (items[index] === target) {
      items.splice(index, 1);
    }
  }
  return items;
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Split a list of readings at the first value that reaches `limit`: `taken` holds every reading before it ' +
        '(all below `limit`) and `rest` holds that reading and everything after it, even values that dip back under ' +
        '`limit`. This is take-while and drop-while in one call.\n\n' +
        'Signature: `solve(readings: number[], limit: number): { rest: number[]; taken: number[] }`\n\n' +
        'One `findIndex` gives the cut point and two `slice`s do the rest — decide what the cut point is when ' +
        'nothing reaches the limit.',
      difficulty: 'expert',
      explanation:
        'Take-while is positional, not a property of each value, which is why `filter` cannot express it: ' +
        '`filter((r) => r < limit)` would keep the small values *after* the cut too. `findIndex` finds the first ' +
        'reading at or above `limit`, and that index is both the end of `taken` (`slice(0, cut)`) and the start of ' +
        '`rest` (`slice(cut)`). The subtle part is the miss: `findIndex` returns `-1` when every reading is below ' +
        'the limit, and `-1` is a legal `slice` index meaning “the last element”. Feeding it straight in silently ' +
        'moves the cut to just before the final reading — `taken` loses its last value and `rest` gains it. Mapping ' +
        '`-1` to `readings.length` puts the cut past the end, so `taken` is everything and `rest` is `[]`. The ' +
        'sentinel has to be translated before it meets a method that gives negatives a meaning.',
      id: 'take-while-below',
      methods: ['findIndex', 'slice'],
      order: 12,
      solution: code(`
export function solve(readings: number[], limit: number): { rest: number[]; taken: number[] } {
  const found = readings.findIndex((reading) => reading >= limit);
  const cut = found === -1 ? readings.length : found;
  return { rest: readings.slice(cut), taken: readings.slice(0, cut) };
}
`),
      starterCode: code(`
export function solve(readings: number[], limit: number): { rest: number[]; taken: number[] } {
  // findIndex the first reading >= limit, then slice both sides — and translate a miss before slicing.
  return { rest: [], taken: [] };
}
`),
      tests: [
        tc('cuts at the first reading at or above the limit', [[1, 4, 9, 2, 3], 5], { rest: [9, 2, 3], taken: [1, 4] }),
        tc('later small values are not taken', [[2, 8, 1], 5], { rest: [8, 1], taken: [2] }),
        tc('nothing reaches the limit (trap)', [[1, 2, 3], 10], { rest: [], taken: [1, 2, 3] }),
        tc('single reading below the limit (trap)', [[2], 5], { rest: [], taken: [2] }),
        tc('first reading already at the limit', [[5, 1], 5], { rest: [5, 1], taken: [] }),
        tc('empty input', [[], 3], { rest: [], taken: [] }),
      ],
      title: 'Take while, drop while',
      trap: code(`
export function solve(readings: number[], limit: number): { rest: number[]; taken: number[] } {
  const cut = readings.findIndex((reading) => reading >= limit);
  return { rest: readings.slice(cut), taken: readings.slice(0, cut) };
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Trim a series: drop the missing readings (`null`) from the start and from the end, but keep every interior ' +
        'gap exactly where it is, because positions in the middle still carry meaning. A series with no readings at ' +
        'all trims to `[]`.\n\n' +
        'Signature: `solve(series: (null | number)[]): (null | number)[]`\n\n' +
        '`findIndex` and `findLastIndex` bracket the real data; one `slice` lifts it out.',
      difficulty: 'expert',
      explanation:
        'Trimming is a range operation, so the answer is a single `slice` whose bounds come from two searches: ' +
        '`findIndex` locates the first present reading and `findLastIndex` (ES2023) the last, scanning from the ' +
        'other end so neither search walks the whole array. `slice(first, last + 1)` then lifts out everything ' +
        'between them, interior gaps included — the `+ 1` is there because `slice` excludes its end index. `filter` ' +
        'is the tempting wrong tool: it judges each element on its own and would strip the interior `null`s too, ' +
        'turning `[null, 1, null, 2, null]` into `[1, 2]` and shifting every position. The one guard is the empty ' +
        'case: when `findIndex` returns `-1` there is nothing to bracket, and returning `[]` early avoids feeding ' +
        '`-1` to `slice`, where it would mean “from the last element”. Test the predicate against `null`, not ' +
        'truthiness — a leading `0` is a real reading.',
      id: 'trim-missing-ends',
      methods: ['slice', 'findIndex', 'findLastIndex'],
      order: 13,
      solution: code(`
export function solve(series: (null | number)[]): (null | number)[] {
  const first = series.findIndex((reading) => reading !== null);
  if (first === -1) {
    return [];
  }
  const last = series.findLastIndex((reading) => reading !== null);
  return series.slice(first, last + 1);
}
`),
      starterCode: code(`
export function solve(series: (null | number)[]): (null | number)[] {
  // Find the first and last present readings, then slice between them — interior gaps stay.
  return [];
}
`),
      tests: [
        tc('trims both ends', [[null, null, 3, 4, null]], [3, 4]),
        tc('interior gap is preserved (trap)', [[null, 1, null, 2, null]], [1, null, 2]),
        tc('nothing to trim', [[1, 2]], [1, 2]),
        tc('a zero reading surrounded by gaps', [[null, 0, null]], [0]),
        tc('all missing trims to nothing', [[null, null]], []),
        tc('empty series', [[]], []),
      ],
      title: 'Trim the missing ends',
      trap: code(`
export function solve(series: (null | number)[]): (null | number)[] {
  return series.filter((reading) => reading !== null);
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Return the `size` items that begin at index `start`, wrapping around to the front when the window runs past ' +
        'the end — a carousel showing `size` slides from the current one. `start` is always a valid index and `size` ' +
        'never exceeds the length.\n\n' +
        'Signature: `solve(items: string[], start: number, size: number): string[]`\n\n' +
        'Rotate with two `slice`s joined by `concat`, then take the window with a third — no modular arithmetic on ' +
        'the end index.',
      difficulty: 'expert',
      explanation:
        'The tempting version computes a wrapped end, `items.slice(start, (start + size) % items.length)`, and it ' +
        'fails whenever the window touches the end of the array: `slice` takes a *range*, so an `end` that has ' +
        'wrapped to sit at or before `start` yields `[]`. Even a window that ends exactly at the last element ' +
        'breaks, because `length % length` is `0`. The clean approach separates the two concerns. First rotate: ' +
        '`items.slice(start).concat(items.slice(0, start))` is the array re-read from `start`, wrapped back around ' +
        'to `start - 1`. Then take: `slice(0, size)` on the rotation is an ordinary prefix — no wrapping left, ' +
        'and a `size` of `0` works too. Three `slice`s and a `concat` cost one extra copy; the ' +
        'index-arithmetic alternative, `Array.from({ length: size }, (_, i) => items[(start + i) % items.length])`, ' +
        'avoids that copy but hides the same modulo in a place that is easier to get right.',
      id: 'circular-window',
      methods: ['slice', 'concat'],
      order: 14,
      solution: code(`
export function solve(items: string[], start: number, size: number): string[] {
  return items.slice(start).concat(items.slice(0, start)).slice(0, size);
}
`),
      starterCode: code(`
export function solve(items: string[], start: number, size: number): string[] {
  // Rotate the array to begin at start (two slices + concat), then take the first size items.
  return [];
}
`),
      tests: [
        tc('window fits without wrapping', [['a', 'b', 'c', 'd', 'e'], 1, 3], ['b', 'c', 'd']),
        tc('window wraps around the end (trap)', [['a', 'b', 'c', 'd', 'e'], 3, 4], ['d', 'e', 'a', 'b']),
        tc('window ends exactly at the end (trap)', [['a', 'b', 'c', 'd', 'e'], 2, 3], ['c', 'd', 'e']),
        tc('full rotation from the middle (trap)', [['a', 'b', 'c', 'd', 'e'], 2, 5], ['c', 'd', 'e', 'a', 'b']),
        tc('window of one from the last slot (trap)', [['a', 'b', 'c', 'd', 'e'], 4, 1], ['e']),
        tc('size of zero', [['a', 'b', 'c', 'd', 'e'], 4, 0], []),
      ],
      title: 'Circular window',
      trap: code(`
export function solve(items: string[], start: number, size: number): string[] {
  return items.slice(start, (start + size) % items.length);
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Remove a single occurrence of the `k`-th largest value from `values` (`k` is 1-based, so `k = 1` removes ' +
        'one copy of the maximum) and return the remaining values in their original order. Duplicates count ' +
        'separately: in `[5, 5, 3]` the 2nd largest is `5`. When `k` is out of range, return an unchanged copy.\n\n' +
        'Signature: `solve(values: number[], k: number): number[]`\n\n' +
        'Sort a copy to find the value, locate one occurrence in the original, and `filter` by index — not by value.',
      difficulty: 'expert',
      explanation:
        'Three methods, each doing one job. `toSorted((a, b) => b - a)` ranks a *copy* descending, so `[k - 1]` is ' +
        'the k-th largest; sorting in place with `sort` would reorder `values` and the result would come back in ' +
        'sorted order instead of the original. `indexOf` then finds one position holding that value in the ' +
        'untouched original. Finally `filter((_, index) => index !== position)` removes exactly that slot — the ' +
        'predicate ignores the value and uses the index, which is the whole trick. The tempting ' +
        '`filter((value) => value !== target)` removes *every* copy of the k-th largest, so `[5, 5, 3]` loses both ' +
        'fives. Out-of-range `k` needs no guard: `[k - 1]` reads `undefined`, the early return hands back a copy, ' +
        'and even without it `indexOf(undefined)` would be `-1`, which matches no index.',
      id: 'remove-kth-largest',
      methods: ['toSorted', 'indexOf', 'filter'],
      order: 15,
      solution: code(`
export function solve(values: number[], k: number): number[] {
  const target: number | undefined = values.toSorted((a, b) => b - a)[k - 1];
  if (target === undefined) {
    return [...values];
  }
  const position = values.indexOf(target);
  return values.filter((_, index) => index !== position);
}
`),
      starterCode: code(`
export function solve(values: number[], k: number): number[] {
  // Rank a sorted copy, indexOf the k-th largest in the original, then filter that index out.
  return [];
}
`),
      tests: [
        tc('removes one copy of the maximum, order kept', [[1, 9, 3], 1], [1, 3]),
        tc('duplicates of the removed value survive (trap)', [[5, 5, 3], 1], [5, 3]),
        tc('second largest counts duplicates separately (trap)', [[4, 7, 7, 1], 2], [4, 7, 1]),
        tc('k-th largest from the middle of the ranking', [[2, 8, 4, 6], 3], [2, 8, 6]),
        tc('k beyond the length returns a copy', [[1, 2], 5], [1, 2]),
        tc('k of zero returns a copy', [[1, 2], 0], [1, 2]),
        tc('empty input', [[], 1], []),
      ],
      title: 'Remove the k-th largest',
      trap: code(`
export function solve(values: number[], k: number): number[] {
  const target = values.toSorted((a, b) => b - a)[k - 1];
  return values.filter((value) => value !== target);
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Rebuild `toSpliced` from `slice`: return a new array with `deleteCount` items removed at `start` and ' +
        '`insert` placed there instead, leaving `items` untouched. Follow the real contract — a negative `start` ' +
        'counts from the end, and both `start` and `deleteCount` clamp to the array bounds — without calling ' +
        '`splice` or `toSpliced`.\n\n' +
        'Signature: `solve(items: string[], start: number, deleteCount: number, insert: string[]): string[]`\n\n' +
        'Three pieces — the head `slice`, the inserted items, the tail `slice` — once `start` is an actual index.',
      difficulty: 'expert',
      explanation:
        'A splice is a head, a middle, and a tail: `[...items.slice(0, from), ...insert, ...items.slice(to)]`. The ' +
        'work is in computing `from` and `to` the way the real method does. A negative `start` means ' +
        '`length + start`, floored at `0`; a positive one is capped at `length`; and `to` is `from` plus a ' +
        'non-negative `deleteCount` — `slice` clamps anything past the end for free. The tempting version passes ' +
        '`start` straight to both `slice`s and gets the head right by accident, because `slice` also understands ' +
        'negatives, but the tail `slice(start + deleteCount)` is then measured from the end as well: for ' +
        '`start = -1, deleteCount = 1` it becomes `slice(0)`, the whole array, and the result doubles up. Normalise ' +
        'once, then every `slice` speaks the same coordinate system. Because the two `slice`s never overlap, ' +
        'nothing is copied twice and `items` is never touched.',
      id: 'splice-from-slices',
      methods: ['slice'],
      order: 16,
      solution: code(`
export function solve(items: string[], start: number, deleteCount: number, insert: string[]): string[] {
  const from = start < 0 ? Math.max(0, items.length + start) : Math.min(start, items.length);
  const to = from + Math.max(0, deleteCount);
  return [...items.slice(0, from), ...insert, ...items.slice(to)];
}
`),
      starterCode: code(`
export function solve(items: string[], start: number, deleteCount: number, insert: string[]): string[] {
  // Normalise start to a real index first, then head slice + insert + tail slice.
  return [];
}
`),
      tests: [
        tc('replaces a middle section', [['a', 'b', 'c', 'd'], 1, 2, ['x']], ['a', 'x', 'd']),
        tc('negative start counts from the end (trap)', [['a', 'b', 'c'], -1, 1, ['z']], ['a', 'b', 'z']),
        tc('negative start beyond the length clamps to zero (trap)', [['a', 'b'], -5, 1, ['z']], ['z', 'b']),
        tc('pure insertion with no deletion', [['a', 'b'], 1, 0, ['x', 'y']], ['a', 'x', 'y', 'b']),
        tc('delete count past the end clamps', [['a', 'b', 'c'], 1, 10, []], ['a']),
        tc('start past the end appends', [['a'], 5, 1, ['b']], ['a', 'b']),
        tc('empty items', [[], 0, 0, ['x']], ['x']),
      ],
      title: 'toSpliced from slices',
      trap: code(`
export function solve(items: string[], start: number, deleteCount: number, insert: string[]): string[] {
  return [...items.slice(0, start), ...insert, ...items.slice(start + deleteCount)];
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        'Compute the trimmed mean: sort a copy of `values`, discard the `k` smallest and the `k` largest, and ' +
        'average what is left. Return `null` when nothing is left. `values` itself must not be mutated.\n\n' +
        'Signature: `solve(values: number[], k: number): null | number`\n\n' +
        '`toSorted`, one `slice` to cut both ends, and `reduce` for the sum — check what your `slice` does when ' +
        '`k` is `0`.',
      difficulty: 'expert',
      explanation:
        'The pipeline is three steps: `toSorted((a, b) => a - b)` ranks a copy without touching `values`, `slice` ' +
        'cuts `k` from each end, and `reduce` with a seed of `0` sums the survivors before one division. The ' +
        'trap is the natural spelling of “cut both ends”, `slice(k, -k)`: when `k` is `0`, `-k` is `-0`, which is ' +
        'just `0`, and `slice(0, 0)` is empty — a trimmed mean with no trimming returns `null` instead of the plain ' +
        'mean. Writing the end as `values.length - k` avoids negative indices altogether, and it degrades ' +
        'correctly: when `k` is more than half the length the end drops below the start and `slice` returns `[]`, ' +
        'so the `null` case falls out of one length check. Seeding `reduce` with `0` matters for the same reason ' +
        'as always — the survivors can be empty, and a seedless fold would throw.',
      id: 'trimmed-mean',
      methods: ['toSorted', 'slice', 'reduce'],
      order: 17,
      solution: code(`
export function solve(values: number[], k: number): null | number {
  const kept = values.toSorted((a, b) => a - b).slice(k, values.length - k);
  if (kept.length === 0) {
    return null;
  }
  return kept.reduce((sum, value) => sum + value, 0) / kept.length;
}
`),
      starterCode: code(`
export function solve(values: number[], k: number): null | number {
  // Sort a copy, slice k off each end (mind k = 0), then average the survivors.
  return null;
}
`),
      tests: [
        tc('trims one from each end', [[10, 1, 5, 3, 100], 1], 6),
        tc('k of zero is a plain mean (trap)', [[1, 2, 3, 4], 0], 2.5),
        tc('unsorted input with duplicates', [[5, 1, 5, 1, 3, 9], 2], 4),
        tc('a single survivor is its own mean', [[9, 4, 7], 1], 7),
        tc('trimming everything yields null', [[1, 2, 3, 4], 2], null),
        tc('k larger than half the length yields null', [[1, 2, 3], 5], null),
        tc('empty input yields null', [[], 0], null),
      ],
      title: 'Trimmed mean',
      trap: code(`
export function solve(values: number[], k: number): null | number {
  const kept = values.toSorted((a, b) => a - b).slice(k, -k);
  if (kept.length === 0) {
    return null;
  }
  return kept.reduce((sum, value) => sum + value, 0) / kept.length;
}
`),
    },
    {
      categoryId: 'filtering-and-slicing',
      description:
        '`n` players stand in a circle numbered `1` to `n`. Counting starts at player `1`: every `k`-th player is ' +
        'removed, and the count resumes from the next player still standing, wrapping around the circle. Return the ' +
        'players in the order they were removed.\n\n' +
        'Signature: `solve(n: number, k: number): number[]`\n\n' +
        'Example: `solve(5, 2)` → `[2, 4, 1, 5, 3]`. Build the circle, then `splice` one player out per round — the ' +
        'index arithmetic after each removal is the whole puzzle.',
      difficulty: 'expert',
      explanation:
        'This is the Josephus problem, and `splice` is the natural engine: `circle.splice(index, 1)` both removes ' +
        'the player and returns them in a one-element array, so `removed.push(...circle.splice(index, 1))` records ' +
        'the elimination while the circle shrinks. The arithmetic is where it goes wrong. After a removal the ' +
        'element that slid into `index` is the *next* player, so the count for the following round already stands ' +
        'at `1` — advancing `k - 1` more and taking the result modulo the *current* `length` lands on the right ' +
        'player. Advancing by `k` is the tempting off-by-one: with `k = 1` it removes player `2` first instead of ' +
        'player `1`. `Array.from({ length: n }, (_, i) => i + 1)` builds the circle, and the loop ends when ' +
        '`splice` has emptied it. Each `splice` is O(n), so the whole run is O(n²) — fine for a circle.',
      id: 'josephus-elimination',
      methods: ['splice', 'Array.from'],
      order: 18,
      solution: code(`
export function solve(n: number, k: number): number[] {
  const circle = Array.from({ length: n }, (_, index) => index + 1);
  const removed: number[] = [];
  let index = 0;
  while (circle.length > 0) {
    index = (index + k - 1) % circle.length;
    removed.push(...circle.splice(index, 1));
  }
  return removed;
}
`),
      starterCode: code(`
export function solve(n: number, k: number): number[] {
  // Build the circle, then loop: advance the index, splice out one player, record them. Mind the modulo.
  return [];
}
`),
      tests: [
        tc('classic five players, count of two (trap)', [5, 2], [2, 4, 1, 5, 3]),
        tc('seven players, count of three (trap)', [7, 3], [3, 6, 2, 7, 5, 1, 4]),
        tc('a count of one removes players in order (trap)', [4, 1], [1, 2, 3, 4]),
        tc('count larger than the circle wraps (trap)', [3, 5], [2, 3, 1]),
        tc('single player', [1, 3], [1]),
        tc('no players', [0, 2], []),
      ],
      title: 'Josephus elimination order',
      trap: code(`
export function solve(n: number, k: number): number[] {
  const circle = Array.from({ length: n }, (_, index) => index + 1);
  const removed: number[] = [];
  let index = 0;
  while (circle.length > 0) {
    index = (index + k) % circle.length;
    removed.push(...circle.splice(index, 1));
  }
  return removed;
}
`),
    },
  ],
};
