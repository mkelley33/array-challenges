import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const tricksAndPatterns: CategoryModule = {
  category: {
    description:
      'The classic array idioms — chunking, deduping, windowing, transposing, and flattening — built from first principles.',
    id: 'tricks-and-patterns',
    order: 11,
    title: 'Tricks & Patterns',
  },
  challenges: [
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Split an array into consecutive chunks of `size` elements; the last chunk may be shorter when the length ' +
        'does not divide evenly. A `size` larger than the array yields one chunk containing everything.\n\n' +
        'Signature: `solve(xs: number[], size: number): number[][]`\n\n' +
        'Constraint: build the result declaratively — no `push` inside a loop.',
      difficulty: 'intermediate',
      explanation:
        'The chunk count is `Math.ceil(xs.length / size)` — the ceiling is what grants the final partial chunk its ' +
        'slot — so `Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i * size, i * size + size))` ' +
        'materializes every chunk in one expression: chunk `i` starts at index `i * size`, and `slice` clamps an ' +
        'end index past the array to the actual length instead of throwing or padding, which is exactly why the ' +
        'last chunk comes out short and an oversized `size` returns the whole array as a single chunk. An empty ' +
        'array produces a length of `0`, so no chunks are created at all.',
      id: 'chunk-into-groups',
      methods: ['Array.from', 'slice'],
      order: 1,
      solution: code(`
export function solve(xs: number[], size: number): number[][] {
  return Array.from({ length: Math.ceil(xs.length / size) }, (_, index) =>
    xs.slice(index * size, index * size + size),
  );
}
`),
      starterCode: code(`
export function solve(xs: number[], size: number): number[][] {
  // How many chunks? Math.ceil(xs.length / size). Chunk i is xs.slice(i * size, i * size + size).
  return [];
}
`),
      tests: [
        tc(
          'even split',
          [[1, 2, 3, 4], 2],
          [
            [1, 2],
            [3, 4],
          ],
        ),
        tc('short last chunk', [[1, 2, 3, 4, 5], 2], [[1, 2], [3, 4], [5]]),
        tc('size larger than the array', [[1, 2], 5], [[1, 2]]),
        tc('size one wraps every element', [[1, 2, 3], 1], [[1], [2], [3]]),
        tc('empty array has no chunks', [[], 3], []),
      ],
      title: 'Chunk into groups',
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Remove duplicate primitives from an array while preserving first-seen order: keep each value the first ' +
        'time it appears and drop every later repeat.\n\n' +
        'Signature: `solve(xs: (number | string)[]): (number | string)[]`\n\n' +
        'There are two classic idioms for this — know both, and know which one scales.',
      difficulty: 'intermediate',
      explanation:
        'Idiom one: `xs.filter((x, i) => xs.indexOf(x) === i)` keeps an element only when its index equals the ' +
        'index of its *first* occurrence — `indexOf` always finds the earliest match, so every later duplicate ' +
        'fails the test and first-seen order is preserved automatically. Idiom two: `[...new Set(xs)]`, because a ' +
        '`Set` refuses repeats and remembers insertion order, so spreading it back out yields the same answer. ' +
        'The difference is cost: the `Set` version is O(n) — one hash lookup per element — while `filter` plus ' +
        '`indexOf` rescans the array from the front for every element, making it O(n²). Fine for a dozen items, ' +
        'painful for a hundred thousand.',
      id: 'unique-in-order',
      methods: ['filter', 'indexOf'],
      order: 2,
      solution: code(`
export function solve(xs: (number | string)[]): (number | string)[] {
  return xs.filter((value, index) => xs.indexOf(value) === index);
}
`),
      starterCode: code(`
export function solve(xs: (number | string)[]): (number | string)[] {
  // A value is a KEEPER when its index equals the index of its first occurrence.
  return xs;
}
`),
      tests: [
        tc('removes later duplicates', [[3, 1, 3, 2, 1]], [3, 1, 2]),
        tc('already unique stays intact', [[1, 2, 3]], [1, 2, 3]),
        tc('strings keep first-seen order', [['b', 'a', 'b', 'c', 'a']], ['b', 'a', 'c']),
        tc('all duplicates collapse to one', [[7, 7, 7]], [7]),
        tc('empty array', [[]], []),
      ],
      title: 'Unique, in order',
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Deduplicate an array of user objects by their `id` property, keeping the *first* occurrence of each id ' +
        'and preserving the original order.\n\n' +
        'Signature: `solve(users: { id: number; name: string }[]): { id: number; name: string }[]`\n\n' +
        'Trap: `indexOf` cannot help here — objects with equal contents are still different references.',
      difficulty: 'advanced',
      explanation:
        'Reference equality makes the primitive idioms useless for objects — `indexOf` and `Set` both compare ' +
        'identities, and two `{ id: 1 }` literals are different identities. The fix is to track *keys you have ' +
        'already accepted* in a `Set` that lives outside the callback: inside `filter`, reject the element when ' +
        '`seen.has(user.id)`, otherwise `seen.add(user.id)` and keep it. Because `filter` visits elements left to ' +
        'right, the first holder of each id is the one that survives. The tempting one-liner ' +
        '`new Map(xs.map((x) => [x.id, x]))` dedupes too, but backwards: `Map.prototype.set` overwrites on repeat ' +
        'keys, so it keeps the *last* occurrence — a silently different answer whenever duplicates disagree.',
      id: 'unique-by-key',
      methods: ['filter'],
      order: 3,
      solution: code(`
interface User {
  id: number;
  name: string;
}

export function solve(users: User[]): User[] {
  const seen = new Set<number>();
  return users.filter((user) => {
    if (seen.has(user.id)) {
      return false;
    }
    seen.add(user.id);
    return true;
  });
}
`),
      starterCode: code(`
interface User {
  id: number;
  name: string;
}

export function solve(users: User[]): User[] {
  // Keep a Set of ids you have already accepted; filter rejects any id the Set has seen.
  return users;
}
`),
      tests: [
        tc(
          'keeps the first occurrence',
          [
            [
              { id: 1, name: 'first' },
              { id: 2, name: 'other' },
              { id: 1, name: 'second' },
            ],
          ],
          [
            { id: 1, name: 'first' },
            { id: 2, name: 'other' },
          ],
        ),
        tc(
          'multiple duplicate groups',
          [
            [
              { id: 1, name: 'a' },
              { id: 1, name: 'b' },
              { id: 2, name: 'c' },
              { id: 2, name: 'd' },
            ],
          ],
          [
            { id: 1, name: 'a' },
            { id: 2, name: 'c' },
          ],
        ),
        tc('no duplicates passes through', [[{ id: 5, name: 'solo' }]], [{ id: 5, name: 'solo' }]),
        tc('empty list', [[]], []),
      ],
      title: 'Unique by key, first wins',
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Return every contiguous window of `k` elements: `solve([1, 2, 3, 4], 2)` → `[[1, 2], [2, 3], [3, 4]]`. ' +
        'When `k` is larger than the array there are no complete windows, so return `[]`.\n\n' +
        'Signature: `solve(xs: number[], k: number): number[][]`\n\n' +
        'Windows overlap; chunks do not. Do not confuse the two.',
      difficulty: 'advanced',
      explanation:
        'Chunks partition — each element belongs to exactly one chunk and starts jump by `size` — while windows ' +
        'overlap: each window starts just one index after the previous, so consecutive windows share `k - 1` ' +
        'elements. That means there are `xs.length - k + 1` complete windows, and window `i` is simply ' +
        '`xs.slice(i, i + k)`. Feeding that count to `Array.from` as `{ length: Math.max(0, xs.length - k + 1) }` ' +
        'with a map function per index generates them all declaratively, and the `Math.max(0, ...)` clamp is what ' +
        'handles the degenerate case: when `k` exceeds the length the count goes negative, and clamping it to zero ' +
        'yields `[]` instead of a negative-length crash.',
      id: 'sliding-windows',
      methods: ['Array.from', 'slice', 'map'],
      order: 4,
      solution: code(`
export function solve(xs: number[], k: number): number[][] {
  return Array.from({ length: Math.max(0, xs.length - k + 1) }, (_, index) => xs.slice(index, index + k));
}
`),
      starterCode: code(`
export function solve(xs: number[], k: number): number[][] {
  // There are xs.length - k + 1 windows (clamp at zero); window i is xs.slice(i, i + k).
  return [];
}
`),
      tests: [
        tc(
          'pairs overlap by one',
          [[1, 2, 3, 4], 2],
          [
            [1, 2],
            [2, 3],
            [3, 4],
          ],
        ),
        tc(
          'triples overlap by two',
          [[1, 2, 3, 4, 5], 3],
          [
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5],
          ],
        ),
        tc('window equal to the whole array', [[1, 2], 2], [[1, 2]]),
        tc('k larger than the array', [[1, 2], 3], []),
        tc('empty array', [[], 2], []),
      ],
      title: 'Sliding windows',
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Transpose a rectangular matrix: rows become columns, so `solve([[1, 2, 3], [4, 5, 6]])` → ' +
        '`[[1, 4], [2, 5], [3, 6]]`. An empty matrix transposes to `[]`.\n\n' +
        'Signature: `solve(matrix: number[][]): number[][]`\n\n' +
        'Trap: the naive `matrix[0].map(...)` explodes on an empty matrix — guard it.',
      difficulty: 'expert',
      explanation:
        'The transpose has one row per *column* of the input, so iterate the first row to drive the output: ' +
        '`matrix[0].map((_, col) => matrix.map((row) => row[col]))`. The outer map runs once per column index and ' +
        'ignores the element itself — only the index matters — while the inner map walks every row plucking the ' +
        'value at that column, assembling the new row. This index-driven double map is the general recipe for any ' +
        '“regroup by position” transform. The empty-matrix guard is mandatory: with no rows there is no ' +
        '`matrix[0]`, and calling `.map` on `undefined` throws — an early `return []` handles the case where there ' +
        'are no rows, and therefore no columns either.',
      id: 'transpose-matrix',
      methods: ['map'],
      order: 5,
      solution: code(`
export function solve(matrix: number[][]): number[][] {
  if (matrix.length === 0) {
    return [];
  }
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}
`),
      starterCode: code(`
export function solve(matrix: number[][]): number[][] {
  // Output row c collects matrix[r][c] for every r — drive both loops with map over indices.
  return matrix;
}
`),
      tests: [
        tc(
          '2x3 becomes 3x2',
          [
            [
              [1, 2, 3],
              [4, 5, 6],
            ],
          ],
          [
            [1, 4],
            [2, 5],
            [3, 6],
          ],
        ),
        tc(
          'square matrix flips across the diagonal',
          [
            [
              [1, 2],
              [3, 4],
            ],
          ],
          [
            [1, 3],
            [2, 4],
          ],
        ),
        tc('single row becomes a column', [[[1, 2, 3]]], [[1], [2], [3]]),
        tc('single column becomes a row', [[[1], [2], [3]]], [[1, 2, 3]]),
        tc('empty matrix', [[]], []),
      ],
      title: 'Transpose a matrix',
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Rebuild `Array.prototype.flat` from scratch: flatten `xs` by exactly `depth` levels using recursion — ' +
        'calling the native `flat` or `flatMap` is forbidden. A `depth` of `0` returns the array unchanged.\n\n' +
        'Signature: `solve(xs: unknown[], depth: number): unknown[]`\n\n' +
        'Hint: `concat` splices array arguments in one level — that is your single level of flattening.',
      difficulty: 'expert',
      explanation:
        'The whole trick rests on one behavior of `concat`: given an array argument it splices the *elements* in ' +
        'rather than nesting the array — exactly one level of flattening. So `reduce` walks the input, and for ' +
        'each element `Array.isArray` decides the branch: non-arrays are appended untouched (wrapped in `[item]` ' +
        'so `concat` cannot misread them), while nested arrays are first flattened `depth - 1` levels by the ' +
        'recursive call, after which `concat` removes the final level. The recursion bottoms out when `depth` ' +
        'reaches `0`, returning a shallow copy — which is also why `flat(0)` leaves the array unchanged. This is ' +
        'precisely how the native method is specified: recurse with a decremented depth, splice one level per ' +
        'call.',
      id: 'build-your-own-flat',
      methods: ['reduce', 'concat'],
      order: 6,
      solution: code(`
export function solve(xs: unknown[], depth: number): unknown[] {
  if (depth <= 0) {
    return xs.slice();
  }
  return xs.reduce<unknown[]>(
    (acc, item) => acc.concat(Array.isArray(item) ? solve(item, depth - 1) : [item]),
    [],
  );
}
`),
      starterCode: code(`
export function solve(xs: unknown[], depth: number): unknown[] {
  // concat splices arrays in one level; recurse with depth - 1 on nested arrays, stop at depth 0.
  return xs;
}
`),
      tests: [
        tc('depth one flattens a single level', [[1, [2, 3], [4, [5]]], 1], [1, 2, 3, 4, [5]]),
        tc('depth zero returns the array unchanged', [[1, [2, [3]]], 0], [1, [2, [3]]]),
        tc('depth two reaches nested nesting', [[1, [2, [3, [4]]]], 2], [1, 2, 3, [4]]),
        tc('already flat is unaffected by big depths', [[1, 2, 3], 5], [1, 2, 3]),
        tc('empty array', [[], 1], []),
      ],
      title: 'Build your own flat',
    },
  ],
};
