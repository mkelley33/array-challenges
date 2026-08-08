import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const creatingArrays: CategoryModule = {
  category: {
    description:
      'Build arrays from scratch, from other values, and from async sources — without falling into the holes.',
    id: 'creating-arrays',
    order: 1,
    title: 'Creating Arrays',
  },
  challenges: [
    {
      categoryId: 'creating-arrays',
      description:
        'Return an array containing every integer from `start` up to and including `end`. ' +
        'If `start` is greater than `end`, return an empty array.\n\n' +
        'Signature: `solve(start: number, end: number): number[]`\n\n' +
        'Constraint: build the array declaratively — no `push` inside a loop.',
      difficulty: 'novice',
      explanation:
        '`Array.from` accepts any array-like — an object with a `length` property counts — and an optional map ' +
        'function receiving `(element, index)`. Passing `{ length: n }` with a map function of `(_, i) => start + i` ' +
        'materializes the range in one expression. `Math.max(0, end - start + 1)` clamps the length so an inverted ' +
        'range yields `[]` instead of throwing on a negative array length. This “counting range” is the canonical ' +
        '`Array.from` trick and replaces manual `for` loops for sequence generation.',
      id: 'range-of-numbers',
      methods: ['Array.from'],
      order: 1,
      solution: code(`
export function solve(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}
`),
      starterCode: code(`
export function solve(start: number, end: number): number[] {
  // Build [start, start + 1, ..., end] without push-in-a-loop.
  return [];
}
`),
      tests: [
        tc('ascending range', [1, 5], [1, 2, 3, 4, 5]),
        tc('single element when start equals end', [3, 3], [3]),
        tc('empty when start exceeds end', [5, 1], []),
        tc('negative bounds', [-2, 1], [-2, -1, 0, 1]),
      ],
      title: 'Range of numbers',
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Return an array containing `count` copies of `value`. A `count` of zero yields an empty array.\n\n' +
        'Signature: `solve(value: string, count: number): string[]`',
      difficulty: 'novice',
      explanation:
        '`new Array(count)` allocates a sparse array of holes — no indices exist yet, so `map` would skip every slot. ' +
        '`fill(value)` writes the value into every position, converting holes into real elements. ' +
        '`Array(count).fill(value)` is the idiomatic “repeat” one-liner. Beware the shared-reference trap: filling ' +
        'with an object puts the *same* object in every slot, which is why this challenge uses a string.',
      id: 'repeat-value',
      methods: ['fill'],
      order: 2,
      solution: code(`
export function solve(value: string, count: number): string[] {
  return new Array<string>(count).fill(value);
}
`),
      starterCode: code(`
export function solve(value: string, count: number): string[] {
  // new Array(count) alone gives you holes, not values...
  return [];
}
`),
      tests: [
        tc('three copies', ['ha', 3], ['ha', 'ha', 'ha']),
        tc('zero copies', ['nope', 0], []),
        tc('one copy', ['solo', 1], ['solo']),
      ],
      title: 'Repeat a value',
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Return the `n × n` identity matrix: a two-dimensional array with `1` on the main diagonal and `0` everywhere else.\n\n' +
        'Signature: `solve(n: number): number[][]`\n\n' +
        'Example: `solve(2)` → `[[1, 0], [0, 1]]`',
      difficulty: 'intermediate',
      explanation:
        'Nesting two `Array.from` calls builds a matrix declaratively: the outer call produces each row, the inner ' +
        'call produces each cell, and the two indices meet in `row === column ? 1 : 0`. Because each inner ' +
        '`Array.from` allocates a fresh row array, the rows are independent — unlike the classic ' +
        '`Array(n).fill(Array(n).fill(0))` mistake, which fills every row slot with the *same* inner array, so ' +
        'writing to one row mutates them all.',
      id: 'identity-matrix',
      methods: ['Array.from'],
      order: 3,
      solution: code(`
export function solve(n: number): number[][] {
  return Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, column) => (row === column ? 1 : 0)));
}
`),
      starterCode: code(`
export function solve(n: number): number[][] {
  // Each row must be its own array — beware fill() sharing one row object.
  return [];
}
`),
      tests: [
        tc(
          '2x2',
          [2],
          [
            [1, 0],
            [0, 1],
          ],
        ),
        tc(
          '3x3',
          [3],
          [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
          ],
        ),
        tc('1x1', [1], [[1]]),
        tc('0x0', [0], []),
      ],
      title: 'Identity matrix',
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Return the first `n` perfect squares: `[0, 1, 4, 9, ...]`.\n\n' +
        'Signature: `solve(n: number): number[]`\n\n' +
        'Trap to understand before you start: `new Array(n).map((_, i) => i * i)` returns `n` holes, not squares. ' +
        'Why? Fix it.',
      difficulty: 'advanced',
      explanation:
        '`new Array(n)` creates a sparse array: `length` is `n` but no index properties exist. Iteration methods like ' +
        '`map`, `forEach`, and `filter` *skip holes entirely*, so mapping over holes produces more holes. Two idiomatic ' +
        'escapes: `Array.from({ length: n }, (_, i) => i * i)` (the map function runs for every position because ' +
        '`Array.from` never produces holes) or `new Array(n).fill(0).map((_, i) => i * i)` (fill densifies first). ' +
        'Knowing that holes are skipped explains a whole family of “why is my map not running” bugs.',
      id: 'squares-without-holes',
      methods: ['Array.from', 'fill', 'map'],
      order: 4,
      solution: code(`
export function solve(n: number): number[] {
  return Array.from({ length: n }, (_, index) => index * index);
}
`),
      starterCode: code(`
export function solve(n: number): number[] {
  // Why does new Array(n).map((_, i) => i * i) NOT work here?
  return new Array<number>(n);
}
`),
      tests: [
        tc('first five squares', [5], [0, 1, 4, 9, 16]),
        tc('single square', [1], [0]),
        tc('empty', [0], []),
        tc('first three squares', [3], [0, 1, 4]),
      ],
      title: 'Squares, no holes',
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Return the Unicode code point of every character in `text`, handling characters outside the Basic ' +
        'Multilingual Plane (like emoji) correctly.\n\n' +
        'Signature: `solve(text: string): number[]`\n\n' +
        'Hint: `"👍".split("")` gives you two broken halves. Something iterates strings better.',
      difficulty: 'intermediate',
      explanation:
        '`Array.from(text)` iterates the string with its `Symbol.iterator`, which walks *code points*, so an emoji ' +
        'stays one element — unlike `split("")`, which slices by UTF-16 code units and tears surrogate pairs apart. ' +
        'Combined with the map-function argument, `Array.from(text, (char) => char.codePointAt(0) ?? 0)` converts in ' +
        'a single pass. Reach for `Array.from` (or spread `[...text]`) whenever strings may contain astral characters.',
      id: 'code-points',
      methods: ['Array.from', 'codePointAt'],
      order: 5,
      solution: code(`
export function solve(text: string): number[] {
  return Array.from(text, (char) => char.codePointAt(0) ?? 0);
}
`),
      starterCode: code(`
export function solve(text: string): number[] {
  // split('') breaks emoji into surrogate halves — find the iterator-aware way.
  return [];
}
`),
      tests: [
        tc('ascii', ['abc'], [97, 98, 99]),
        tc('emoji stays whole', ['a👍'], [97, 128077]),
        tc('empty string', [''], []),
        tc('accented characters', ['é'], [233]),
      ],
      title: 'Code points, not code units',
    },
    {
      categoryId: 'creating-arrays',
      description:
        'You receive an array of order totals. Simulate fetching each total asynchronously, then return a promise of ' +
        'the totals with 10% tax applied, in the original order.\n\n' +
        'Signature: `solve(totals: number[]): Promise<number[]>`\n\n' +
        'Requirement: use `Array.fromAsync` with an async map function (round each result with `Math.round`).',
      difficulty: 'expert',
      explanation:
        '`Array.fromAsync` (ES2024) is the async twin of `Array.from`: it accepts sync iterables, async iterables, ' +
        "and array-likes, awaits each element, and awaits the map function's result before collecting it. " +
        '`Array.fromAsync(totals, async (total) => Math.round(total * 1.1))` therefore yields the taxed totals in ' +
        'input order — unlike racing promises manually, sequencing is built in. Compare with ' +
        '`Promise.all(totals.map(async ...))`, which runs mappers concurrently; `fromAsync` awaits one element at a ' +
        "time, which matters when each step must observe the previous one's side effects.",
      id: 'async-tax',
      methods: ['Array.fromAsync'],
      order: 6,
      solution: code(`
export function solve(totals: number[]): Promise<number[]> {
  return Array.fromAsync(totals, async (total) => Math.round(total * 1.1));
}
`),
      starterCode: code(`
export function solve(totals: number[]): Promise<number[]> {
  // Array.from cannot await — its ES2024 twin can.
  return Promise.resolve([]);
}
`),
      tests: [
        tc('applies 10% tax', [[100, 200]], [110, 220]),
        tc('rounds to nearest integer', [[99]], [109]),
        tc('empty order list', [[]], []),
        tc('single order', [[50]], [55]),
      ],
      title: 'Async tax collector',
    },
  ],
};
