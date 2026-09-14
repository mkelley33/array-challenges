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
      order: 4,
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
      order: 5,
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
      trap: code(`
export function solve(n: number): number[] {
  return new Array<number>(n).map((_, index) => index * index);
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Return a brand-new, dense array holding exactly the given `cells`, in order. This helper was historically ' +
        'written as `new Array(...cells)`, which is right for every input shape except one.\n\n' +
        'Signature: `solve(cells: number[]): number[]`\n\n' +
        '`Array.of` exists precisely because the constructor gives a lone number a different meaning.',
      difficulty: 'advanced',
      explanation:
        '`new Array(...cells)` forwards the cells as constructor arguments, and the constructor has two behaviours ' +
        'depending on how many it gets. Two or more arguments — or a single non-number — become the elements. A ' +
        '*single number* is read as a length: `new Array(3)` is three holes, `new Array(0)` is empty, and ' +
        '`new Array(2.5)` or `new Array(-1)` throws `RangeError: Invalid array length`. So the spread form silently ' +
        'changes meaning the moment the input shrinks to one numeric cell. `Array.of(...cells)` never interprets its ' +
        'arguments as a length: `Array.of(3)` is `[3]`, `Array.of(2.5)` is `[2.5]`, and `Array.of()` is `[]`. The ' +
        'result is always a fresh dense array with no holes. Reach for `Array.of` — or an array literal — whenever ' +
        'the argument count is not fixed at the call site; `Array.of` is the pick when you are calling the ' +
        'constructor generically, such as through an `Array` subclass.',
      id: 'array-of-not-array-length',
      methods: ['Array.of'],
      order: 6,
      solution: code(`
export function solve(cells: number[]): number[] {
  return Array.of(...cells);
}
`),
      starterCode: code(`
export function solve(cells: number[]): number[] {
  // new Array(...cells) misbehaves for exactly one shape of input — which, and what replaces it?
  return [];
}
`),
      tests: [
        tc('a single positive cell stays a cell (trap)', [[3]], [3]),
        tc('a single zero cell (trap)', [[0]], [0]),
        tc('a single fractional cell (trap)', [[2.5]], [2.5]),
        tc('a single negative cell (trap)', [[-1]], [-1]),
        tc('two cells', [[1, 2]], [1, 2]),
        tc('no cells', [[]], []),
      ],
      title: 'Array.of, not Array(length)',
      trap: code(`
export function solve(cells: number[]): number[] {
  return new Array<number>(...cells);
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Build a `rows × cols` grid of zeros, then set every cell listed in `marks` to `1`. Each mark is a ' +
        '`[row, column]` pair; the same cell may be marked more than once.\n\n' +
        'Signature: `solve(rows: number, cols: number, marks: [number, number][]): number[][]`\n\n' +
        '`fill` is the right tool for a row of zeros — and the wrong tool for a column of rows.',
      difficulty: 'advanced',
      explanation:
        '`fill` writes the *same value* into every slot. For primitives that is exactly what you want: ' +
        '`new Array(cols).fill(0)` is a dense row of zeros. For objects it is a trap, because the value is a ' +
        'reference: `new Array(rows).fill(row)` puts one row array into every slot, so `grid[0][1] = 1` shows up in ' +
        '`grid[1][1]`, `grid[2][1]`, and every other row — they are all the same array. The fix separates the two ' +
        'jobs. `Array.from({ length: rows }, () => new Array(cols).fill(0))` runs its map function once per row, ' +
        'allocating a fresh array each time, while `fill` still does the honest work of densifying each row with ' +
        'zeros. The tell-tale symptom of the shared-row bug is a single mark that appears as a full column; a test ' +
        'with one mark and two rows catches it immediately.',
      id: 'grid-with-independent-rows',
      methods: ['fill', 'Array.from'],
      order: 7,
      solution: code(`
export function solve(rows: number, cols: number, marks: [number, number][]): number[][] {
  const grid = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (const [row, column] of marks) {
    grid[row][column] = 1;
  }
  return grid;
}
`),
      starterCode: code(`
export function solve(rows: number, cols: number, marks: [number, number][]): number[][] {
  // fill(0) is perfect for one row of zeros — but what happens if you fill() the outer array with that row?
  return [];
}
`),
      tests: [
        tc(
          'one mark lights only its own row (trap)',
          [2, 3, [[0, 1]]],
          [
            [0, 1, 0],
            [0, 0, 0],
          ],
        ),
        tc(
          'marks in different rows stay separate (trap)',
          [
            3,
            2,
            [
              [0, 0],
              [2, 1],
            ],
          ],
          [
            [1, 0],
            [0, 0],
            [0, 1],
          ],
        ),
        tc(
          'no marks is all zeros',
          [2, 2, []],
          [
            [0, 0],
            [0, 0],
          ],
        ),
        tc(
          'same cell marked twice',
          [
            1,
            3,
            [
              [0, 2],
              [0, 2],
            ],
          ],
          [[0, 0, 1]],
        ),
        tc(
          'every row marked in the same column',
          [
            2,
            2,
            [
              [0, 0],
              [1, 0],
            ],
          ],
          [
            [1, 0],
            [1, 0],
          ],
        ),
        tc('zero rows', [0, 4, []], []),
      ],
      title: 'Rows that share nothing',
      trap: code(`
export function solve(rows: number, cols: number, marks: [number, number][]): number[][] {
  const grid = new Array<number[]>(rows).fill(new Array<number>(cols).fill(0));
  for (const [row, column] of marks) {
    grid[row][column] = 1;
  }
  return grid;
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Convert an array-like object — anything with a numeric `length` and integer keys, like the objects old DOM ' +
        'APIs and `arguments` used to hand out — into a real array. Indices below `length` that are missing become ' +
        '`undefined`; keys at or beyond `length` are ignored.\n\n' +
        'Signature: `solve(arrayLike: { length: number; [index: number]: string }): (string | undefined)[]`\n\n' +
        '`Array.from` accepts array-likes as well as iterables; the object-key helpers do not know what `length` means.',
      difficulty: 'advanced',
      explanation:
        '`Array.from` has two input modes. If the source is iterable it walks the iterator; otherwise it treats the ' +
        'source as an *array-like*: it reads `length`, then reads index `0` up to `length - 1` in order, storing ' +
        'whatever it finds — including `undefined` for a missing index — so the result is dense and exactly `length` ' +
        'long. `Object.values` knows nothing of that contract. It returns every own enumerable value, so the `length` ' +
        'number itself lands in the output, a missing index simply vanishes instead of becoming `undefined`, and a ' +
        'stale key beyond `length` is included. Spread (`[...arrayLike]`) is not an option either: it requires ' +
        '`Symbol.iterator` and throws `TypeError: arrayLike is not iterable` on a plain object. The pre-ES2015 ' +
        'spelling was `Array.prototype.slice.call(arrayLike)`; `Array.from` is the readable replacement and the ' +
        'only one of these that honours `length`.',
      id: 'array-like-to-real-array',
      methods: ['Array.from'],
      order: 8,
      solution: code(`
interface ArrayLikeOfStrings {
  [index: number]: string;
  length: number;
}

export function solve(arrayLike: ArrayLikeOfStrings): (string | undefined)[] {
  return Array.from(arrayLike);
}
`),
      starterCode: code(`
interface ArrayLikeOfStrings {
  [index: number]: string;
  length: number;
}

export function solve(arrayLike: ArrayLikeOfStrings): (string | undefined)[] {
  // Something honours length and reads 0..length - 1 — spread and Object.values do not.
  return [];
}
`),
      tests: [
        tc('every index present (trap)', [{ 0: 'a', 1: 'b', length: 2 }], ['a', 'b']),
        tc('missing index becomes undefined (trap)', [{ 0: 'a', 2: 'c', length: 3 }], ['a', undefined, 'c']),
        tc('keys beyond length are ignored (trap)', [{ 0: 'a', 1: 'stale', length: 1 }], ['a']),
        tc('length of zero', [{ length: 0 }], []),
        tc('length only, nothing populated', [{ length: 2 }], [undefined, undefined]),
      ],
      title: 'Array-like to real array',
      trap: code(`
interface ArrayLikeOfStrings {
  [index: number]: string;
  length: number;
}

export function solve(arrayLike: ArrayLikeOfStrings): (string | undefined)[] {
  return Object.values(arrayLike);
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Return `text` reversed, character by character. Characters outside the Basic Multilingual Plane — emoji, ' +
        'many CJK ideographs — must survive intact.\n\n' +
        'Signature: `solve(text: string): string`\n\n' +
        'The classic `split("").reverse().join("")` is the trap; the string iterator, via `Array.from`, is the fix.',
      difficulty: 'advanced',
      explanation:
        '`split("")` cuts a string into UTF-16 *code units*. An emoji such as `👍` is one code point stored as two ' +
        'units (a surrogate pair), so `split("")` yields two half-characters; reversing swaps their order, and `join` ' +
        'glues them back into an invalid sequence that renders as garbage. `Array.from(text)` consumes the string ' +
        'through its `Symbol.iterator`, which steps by *code point*, so the surrogate pair stays one element. ' +
        '`reverse` then reorders whole characters and `join("")` reassembles them. `[...text]` is the same iteration ' +
        'in spread form. Because `Array.from` returns a fresh array, calling the mutating `reverse` on it is harmless ' +
        '— nothing else holds a reference. One honest caveat: code points are still not what a reader sees. ' +
        'Combining accents, flag pairs, and ZWJ family emoji span several code points; reversing those needs ' +
        '`Intl.Segmenter` and grapheme clusters, which is a separate lesson.',
      id: 'reverse-string-keep-emoji',
      methods: ['Array.from', 'reverse', 'join'],
      order: 9,
      solution: code(`
export function solve(text: string): string {
  return Array.from(text).reverse().join('');
}
`),
      starterCode: code(`
export function solve(text: string): string {
  // split('') tears surrogate pairs apart — iterate the string by code point instead.
  return text;
}
`),
      tests: [
        tc('emoji survives reversal (trap)', ['ab👍'], '👍ba'),
        tc('two emoji swap places (trap)', ['🙂🚀'], '🚀🙂'),
        tc('emoji in the middle of a palindrome (trap)', ['a👍a'], 'a👍a'),
        tc('ascii reverses normally', ['abc'], 'cba'),
        tc('single character', ['x'], 'x'),
        tc('empty string', [''], ''),
      ],
      title: 'Reverse a string, emoji intact',
      trap: code(`
export function solve(text: string): string {
  return text.split('').reverse().join('');
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        '`counts` maps each word to how often it appeared. Return the `[word, count]` pairs whose count is at least ' +
        '`min`, in the order the words were inserted into the map.\n\n' +
        'Signature: `solve(counts: Map<string, number>, min: number): [string, number][]`\n\n' +
        '`Array.from` on a `Map` yields its entries; `Object.entries` on a `Map` yields nothing at all.',
      difficulty: 'advanced',
      explanation:
        'A `Map` stores its entries in internal slots, not as own properties, so every object-key helper draws a ' +
        'blank: `Object.entries(counts)`, `Object.keys(counts)`, and `counts["apple"]` all see an object with no ' +
        'properties and return `[]` or `undefined`. Nothing throws, which is what makes this bug so quiet — the ' +
        'pipeline runs and simply produces nothing. `Map` is *iterable*, and its default iterator is `entries()`, ' +
        'yielding `[key, value]` pairs in insertion order. `Array.from(counts)` — or `[...counts]` — consumes that ' +
        'iterator into a real array of pairs, and the `filter` callback destructures each pair with ' +
        '`([, count]) => count >= min`. Insertion order is part of the `Map` contract, so the result needs no sorting ' +
        'step. Reach for `Array.from(map.keys())` or `Array.from(map.values())` when only one side is needed; reach ' +
        'for `Object.entries` only when the thing in your hand is a plain object.',
      id: 'filter-a-map-of-counts',
      methods: ['Array.from', 'filter'],
      order: 10,
      solution: code(`
export function solve(counts: Map<string, number>, min: number): [string, number][] {
  return Array.from(counts).filter(([, count]) => count >= min);
}
`),
      starterCode: code(`
export function solve(counts: Map<string, number>, min: number): [string, number][] {
  // Object.entries sees nothing inside a Map — what does iterating the Map itself give you?
  return [];
}
`),
      tests: [
        tc(
          'keeps the words at or above the threshold (trap)',
          [
            new Map([
              ['apple', 3],
              ['pear', 1],
              ['fig', 2],
            ]),
            2,
          ],
          [
            ['apple', 3],
            ['fig', 2],
          ],
        ),
        tc(
          'insertion order is preserved (trap)',
          [
            new Map([
              ['zebra', 5],
              ['ant', 5],
            ]),
            1,
          ],
          [
            ['zebra', 5],
            ['ant', 5],
          ],
        ),
        tc('threshold of zero keeps everything (trap)', [new Map([['a', 0]]), 0], [['a', 0]]),
        tc('nothing qualifies', [new Map([['a', 1]]), 2], []),
        tc('empty map', [new Map(), 0], []),
      ],
      title: 'Entries of a Map',
      trap: code(`
export function solve(counts: Map<string, number>, min: number): [string, number][] {
  return Object.entries(counts).filter(([, count]) => count >= min);
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Return every number from `start` up to and including `end`, advancing by `step` each time (`step` is ' +
        'always positive). If `start` is greater than `end`, return an empty array.\n\n' +
        'Signature: `solve(start: number, end: number, step: number): number[]`\n\n' +
        'Computing a length from arithmetic is fine for `Array.from`; it is a `RangeError` waiting to happen for ' +
        '`new Array`.',
      difficulty: 'advanced',
      explanation:
        'The element count is `Math.floor((end - start) / step) + 1`, and how the two array factories treat that ' +
        'number is the whole lesson. `new Array(n)` demands a non-negative integer and throws `RangeError: Invalid ' +
        'array length` for anything else — so `new Array((end - start) / step + 1)` explodes on `3.5` when the span ' +
        'is not a multiple of the step, and on `-1` when `end` sits below `start`. `Array.from({ length: n })` never ' +
        'throws for a finite `n`: it coerces `length` with the same rule arrays use internally, truncating fractions ' +
        'toward zero and clamping negatives to `0`, and then runs the map function `(_, index) => start + index * ' +
        'step` once per slot. Flooring in the reference solution keeps the intent explicit rather than leaning on ' +
        'the coercion, while the inverted-range case falls out of the clamp for free.',
      id: 'stepped-range-no-range-error',
      methods: ['Array.from', 'Array'],
      order: 11,
      solution: code(`
export function solve(start: number, end: number, step: number): number[] {
  const length = Math.floor((end - start) / step) + 1;
  return Array.from({ length }, (_, index) => start + index * step);
}
`),
      starterCode: code(`
export function solve(start: number, end: number, step: number): number[] {
  // The count is floor((end - start) / step) + 1 — which factory survives a fraction or a negative?
  return [];
}
`),
      tests: [
        tc('span not divisible by step (trap)', [0, 10, 4], [0, 4, 8]),
        tc('end before start yields nothing (trap)', [5, 1, 2], []),
        tc('exact multiples include the end', [0, 10, 5], [0, 5, 10]),
        tc('single element when start equals end', [3, 3, 7], [3]),
        tc('fractional step', [0, 1, 0.5], [0, 0.5, 1]),
        tc('negative start', [-3, 3, 3], [-3, 0, 3]),
      ],
      title: 'Stepped range without a RangeError',
      trap: code(`
export function solve(start: number, end: number, step: number): number[] {
  return new Array<number>((end - start) / step + 1).fill(0).map((_, index) => start + index * step);
}
`),
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
      order: 12,
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
    {
      categoryId: 'creating-arrays',
      description:
        '`range` describes a number sequence as plain data: it begins at `start`, advances by `step` (which may be ' +
        'negative but is never `0`), and stops *before* reaching `end`. Inside `solve`, turn it into an iterable ' +
        'object by implementing `[Symbol.iterator]`, then materialize it.\n\n' +
        'Signature: `solve(range: { end: number; start: number; step: number }): number[]`\n\n' +
        '`Array.from` consumes any iterable — the protocol is the lesson, and `Array.from` is how the protocol ' +
        'becomes an array.',
      difficulty: 'expert',
      explanation:
        'Iterability is a protocol, not a type: any object whose `[Symbol.iterator]` method returns an iterator can ' +
        'be spread, looped with `for…of`, and handed to `Array.from`. A generator method — ' +
        '`*[Symbol.iterator]() { … }` — is the shortest way to satisfy it, because a generator object *is* an ' +
        'iterator and its `yield` statements become the elements. Here the loop yields `value` while ' +
        '`step > 0 ? value < end : value > end` holds, so one body handles ascending and descending ranges. ' +
        '`Array.from` then drives the iterator to completion and collects every value into a dense array. Compare ' +
        '`Array.from(range)` on the plain object: it has no `[Symbol.iterator]` and no `length`, so `Array.from` ' +
        'treats it as an array-like of length `0` and returns `[]` — silently. That empty array is the trap. The ' +
        'lazy iterable is worth having beyond this exercise: a `for…of` can stop early without ever materializing ' +
        'the tail.',
      id: 'iterable-range-object',
      methods: ['Array.from', 'Symbol.iterator'],
      order: 13,
      solution: code(`
interface Range {
  end: number;
  start: number;
  step: number;
}

function toIterable({ end, start, step }: Range): Iterable<number> {
  return {
    *[Symbol.iterator](): Generator<number> {
      for (let value = start; step > 0 ? value < end : value > end; value += step) {
        yield value;
      }
    },
  };
}

export function solve(range: Range): number[] {
  return Array.from(toIterable(range));
}
`),
      starterCode: code(`
interface Range {
  end: number;
  start: number;
  step: number;
}

export function solve(range: Range): number[] {
  // Build an object with a *[Symbol.iterator]() generator method, then let Array.from drain it.
  return [];
}
`),
      tests: [
        tc('ascending range stops before end (trap)', [{ end: 10, start: 0, step: 3 }], [0, 3, 6, 9]),
        tc('descending with a negative step (trap)', [{ end: 0, start: 5, step: -2 }], [5, 3, 1]),
        tc('fractional step', [{ end: 1, start: 0, step: 0.25 }], [0, 0.25, 0.5, 0.75]),
        tc('step larger than the span yields only the start', [{ end: 5, start: 1, step: 10 }], [1]),
        tc('start already past end is empty', [{ end: 0, start: 3, step: 1 }], []),
        tc('start equal to end is empty', [{ end: 2, start: 2, step: 1 }], []),
      ],
      title: 'Make a range iterable',
      trap: code(`
interface Range {
  end: number;
  start: number;
  step: number;
}

export function solve(range: Range): number[] {
  return Array.from(range);
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        "Return the first `rows` rows of Pascal's triangle. Each row starts and ends with `1`, and every inner " +
        'entry is the sum of the two entries above it.\n\n' +
        'Signature: `solve(rows: number): number[][]`\n\n' +
        'Example: `solve(4)` → `[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]]`. Build each row with `Array.from` from the ' +
        'row before it.',
      difficulty: 'expert',
      explanation:
        'Each row depends on the previous one, so this is a fold that *builds* arrays rather than a map over ' +
        'independent slots. `Array.from({ length: rows })` provides one iteration per row; `reduce` carries the ' +
        'triangle so far, and `triangle.at(-1)` reads the row above. The new row is ' +
        '`Array.from({ length: index + 1 }, (_, position) => (previous[position - 1] ?? 0) + (previous[position] ?? 0))`: ' +
        'reading one slot past either edge yields `undefined`, and `?? 0` turns that into the implicit zero outside ' +
        'the triangle, which is exactly why the ends come out as `1`. The very first step has no row above, so ' +
        '`?? [1]` supplies a phantom apex and the same formula produces `[1]` without a special case. Returning ' +
        '`[...triangle, row]` keeps each step immutable. Nesting `Array.from` inside a fold is the general pattern ' +
        'whenever row `n` is a function of row `n − 1`.',
      id: 'pascals-triangle-rows',
      methods: ['Array.from', 'reduce', 'at'],
      order: 14,
      solution: code(`
export function solve(rows: number): number[][] {
  return Array.from({ length: rows }).reduce<number[][]>((triangle, _, index) => {
    const previous = triangle.at(-1) ?? [1];
    const row = Array.from(
      { length: index + 1 },
      (_, position) => (previous[position - 1] ?? 0) + (previous[position] ?? 0),
    );
    return [...triangle, row];
  }, []);
}
`),
      starterCode: code(`
export function solve(rows: number): number[][] {
  // Fold over Array.from({ length: rows }); each new row is an Array.from over the row at(-1).
  return [];
}
`),
      tests: [
        tc('five rows', [5], [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]),
        tc('single row is the apex', [1], [[1]]),
        tc('two rows', [2], [[1], [1, 1]]),
        tc(
          'seven rows',
          [7],
          [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1]],
        ),
        tc('zero rows', [0], []),
      ],
      title: "Pascal's triangle",
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Collapse `records` so that each `id` appears once. Keep the *latest* value seen for that `id`, but place ' +
        'it where the `id` *first* appeared.\n\n' +
        'Signature: `solve(records: { id: number; value: string }[]): { id: number; value: string }[]`\n\n' +
        'Example: `[{1, a}, {2, b}, {1, c}]` → `[{1, c}, {2, b}]`. A `Map` remembers first position; `Array.from` ' +
        'gets the values back out.',
      difficulty: 'expert',
      explanation:
        '`Map` has a guarantee that solves both halves of this problem at once: `set` on a key that already exists ' +
        '*replaces the value but keeps the original insertion position*. Feeding `new Map` the records mapped to ' +
        '`[id, record]` pairs therefore performs the whole collapse in one pass — later records overwrite earlier ' +
        'ones under the same `id`, and iteration order still reflects first appearance. `Array.from(map.values())` ' +
        'then materializes the surviving records as a dense array; the `values()` iterator is consumed by ' +
        '`Array.from` exactly as a spread would consume it. The tempting alternative filters on ' +
        "`findLastIndex(...) === index`, which keeps the latest *occurrence* at the latest occurrence's position — " +
        '`[{2, b}, {1, c}]` for the example — and costs O(n²) because every element rescans the array. The `Map` ' +
        'version is O(n) and is the idiomatic "upsert, then list" pattern.',
      id: 'latest-value-first-position',
      methods: ['Array.from', 'map', 'Map'],
      order: 15,
      solution: code(`
interface Entry {
  id: number;
  value: string;
}

export function solve(records: Entry[]): Entry[] {
  const latest = new Map(records.map((record) => [record.id, record] as const));
  return Array.from(latest.values());
}
`),
      starterCode: code(`
interface Entry {
  id: number;
  value: string;
}

export function solve(records: Entry[]): Entry[] {
  // Map.set overwrites the value but keeps the key's original position — build one, then Array.from its values.
  return [];
}
`),
      tests: [
        tc(
          'later value wins but keeps the first position (trap)',
          [
            [
              { id: 1, value: 'a' },
              { id: 2, value: 'b' },
              { id: 1, value: 'c' },
            ],
          ],
          [
            { id: 1, value: 'c' },
            { id: 2, value: 'b' },
          ],
        ),
        tc(
          'several ids interleaved (trap)',
          [
            [
              { id: 1, value: 'a' },
              { id: 2, value: 'b' },
              { id: 2, value: 'c' },
              { id: 1, value: 'd' },
              { id: 3, value: 'e' },
            ],
          ],
          [
            { id: 1, value: 'd' },
            { id: 2, value: 'c' },
            { id: 3, value: 'e' },
          ],
        ),
        tc(
          'no duplicates pass through unchanged',
          [
            [
              { id: 1, value: 'a' },
              { id: 2, value: 'b' },
            ],
          ],
          [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ],
        ),
        tc(
          'three versions of one id',
          [
            [
              { id: 7, value: 'v1' },
              { id: 7, value: 'v2' },
              { id: 7, value: 'v3' },
            ],
          ],
          [{ id: 7, value: 'v3' }],
        ),
        tc('empty input', [[]], []),
      ],
      title: 'Latest value, first position',
      trap: code(`
interface Entry {
  id: number;
  value: string;
}

export function solve(records: Entry[]): Entry[] {
  return records.filter((record, index) => records.findLastIndex((other) => other.id === record.id) === index);
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        '`pages` is the data a paginated API would return. Inside `solve`, wrap it in an async iterable — an ' +
        '`async function*` that awaits each page before yielding its items — and drain that stream into a single ' +
        'array, in order.\n\n' +
        'Signature: `solve(pages: number[][]): Promise<number[]>`\n\n' +
        '`Array.fromAsync` is the only array factory that can consume an async iterable; `Array.from` returns `[]` ' +
        'without complaint.',
      difficulty: 'expert',
      explanation:
        'An async generator produces an object that implements `Symbol.asyncIterator`, not `Symbol.iterator`: each ' +
        '`next()` returns a promise, and `yield*` inside it fans a whole page out as individual items. `Array.from` ' +
        'cannot drive that — it only checks for the sync iterator and a `length`, finds neither, and quietly returns ' +
        '`[]`. `Array.fromAsync` (ES2024) understands all three sources: async iterables, sync iterables, and ' +
        'array-likes. It awaits each `next()`, pushes the resolved value, and resolves to the completed array once ' +
        'the stream ends, which is why the result preserves page order and item order without any manual `Promise` ' +
        'juggling. The `await Promise.resolve(page)` in the generator stands in for a real fetch; it also proves ' +
        'that the consumer never sees a pending promise. `for await (const item of stream)` with a `push` is the ' +
        'manual equivalent — `Array.fromAsync` is that loop with the bookkeeping removed.',
      id: 'drain-an-async-stream',
      methods: ['Array.fromAsync', 'Symbol.asyncIterator'],
      order: 16,
      solution: code(`
async function* stream(pages: number[][]): AsyncGenerator<number> {
  for (const page of pages) {
    const items = await Promise.resolve(page);
    yield* items;
  }
}

export function solve(pages: number[][]): Promise<number[]> {
  return Array.fromAsync(stream(pages));
}
`),
      starterCode: code(`
export function solve(pages: number[][]): Promise<number[]> {
  // Write an async function* over pages, then hand its async iterable to the factory that can await it.
  return Promise.resolve([]);
}
`),
      tests: [
        tc('items from every page in order (trap)', [[[1, 2], [3]]], [1, 2, 3]),
        tc('many single-item pages (trap)', [[[1], [2], [3], [4]]], [1, 2, 3, 4]),
        tc('an empty page contributes nothing', [[[1], [], [2]]], [1, 2]),
        tc('single page', [[[9, 8, 7]]], [9, 8, 7]),
        tc('no pages', [[]], []),
      ],
      title: 'Drain an async stream',
      trap: code(`
async function* stream(pages: number[][]): AsyncGenerator<number> {
  for (const page of pages) {
    const items = await Promise.resolve(page);
    yield* items;
  }
}

export function solve(pages: number[][]): Promise<number[]> {
  return Promise.resolve(Array.from(stream(pages)));
}
`),
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Lay out a month as rows of seven cells, Sunday first. `firstWeekday` is the index (`0` = Sunday … ' +
        '`6` = Saturday) of the weekday the 1st falls on. Cells before the 1st and after the last day are `null`, ' +
        'and the final row is always padded out to seven.\n\n' +
        'Signature: `solve(daysInMonth: number, firstWeekday: number): (number | null)[][]`\n\n' +
        'Three array factories share the work: `Array.from` for the days, `fill` for the padding, and `slice` to ' +
        'cut weeks.',
      difficulty: 'expert',
      explanation:
        'The grid is a flat list of cells first and a matrix second. ' +
        '`Array.from({ length: daysInMonth }, (_, index) => index + 1)` numbers the days; ' +
        '`new Array(firstWeekday).fill(null)` builds the leading padding; and the trailing padding is ' +
        '`(7 - (firstWeekday + daysInMonth) % 7) % 7` nulls — the outer `% 7` turns a "row already full" result of ' +
        '`7` into `0`. Spreading the three pieces together gives a flat array whose length is a multiple of seven, ' +
        'so cutting it into weeks is ' +
        '`Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7))`. Computing the ' +
        'week count from the padded cell count is the important step: deriving it from `daysInMonth` alone — ' +
        '`Math.ceil(31 / 7)` is `5` — misses the sixth row a 31-day month needs when it starts late in the week. ' +
        '`fill(null)` is safe here because `null` is a primitive.',
      id: 'calendar-month-grid',
      methods: ['Array.from', 'fill', 'slice'],
      order: 17,
      solution: code(`
const DAYS_PER_WEEK = 7;

export function solve(daysInMonth: number, firstWeekday: number): (number | null)[][] {
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const leading = new Array<null>(firstWeekday).fill(null);
  const trailing = new Array<null>((DAYS_PER_WEEK - ((firstWeekday + daysInMonth) % DAYS_PER_WEEK)) % DAYS_PER_WEEK).fill(null);
  const cells: (number | null)[] = [...leading, ...days, ...trailing];
  return Array.from({ length: cells.length / DAYS_PER_WEEK }, (_, week) =>
    cells.slice(week * DAYS_PER_WEEK, week * DAYS_PER_WEEK + DAYS_PER_WEEK),
  );
}
`),
      starterCode: code(`
export function solve(daysInMonth: number, firstWeekday: number): (number | null)[][] {
  // Flat cells first: null padding + numbered days + null padding — then slice the flat list into weeks.
  return [];
}
`),
      tests: [
        tc(
          'thirty days starting on a wednesday',
          [30, 3],
          [
            [null, null, null, 1, 2, 3, 4],
            [5, 6, 7, 8, 9, 10, 11],
            [12, 13, 14, 15, 16, 17, 18],
            [19, 20, 21, 22, 23, 24, 25],
            [26, 27, 28, 29, 30, null, null],
          ],
        ),
        tc(
          'twenty-eight days from a sunday fill exactly four weeks',
          [28, 0],
          [
            [1, 2, 3, 4, 5, 6, 7],
            [8, 9, 10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19, 20, 21],
            [22, 23, 24, 25, 26, 27, 28],
          ],
        ),
        tc(
          'thirty-one days from a saturday need six weeks',
          [31, 6],
          [
            [null, null, null, null, null, null, 1],
            [2, 3, 4, 5, 6, 7, 8],
            [9, 10, 11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20, 21, 22],
            [23, 24, 25, 26, 27, 28, 29],
            [30, 31, null, null, null, null, null],
          ],
        ),
        tc(
          'seven days from a monday spill into a second week',
          [7, 1],
          [
            [null, 1, 2, 3, 4, 5, 6],
            [7, null, null, null, null, null, null],
          ],
        ),
        tc('a single day on a sunday', [1, 0], [[1, null, null, null, null, null, null]]),
      ],
      title: 'Calendar month grid',
    },
    {
      categoryId: 'creating-arrays',
      description:
        'Return every coordinate of an n-dimensional grid whose axis lengths are `sizes`, as `[i0, i1, …]` tuples ' +
        'with the *last* axis varying fastest (odometer order).\n\n' +
        'Signature: `solve(sizes: number[]): number[][]`\n\n' +
        'Example: `solve([2, 3])` → `[[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]`; `solve([])` → `[[]]`. Each ' +
        'axis is an `Array.from` range extended onto every tuple built so far.',
      difficulty: 'expert',
      explanation:
        'A cartesian product grows one axis at a time. `reduce` carries the tuples built so far; for each axis, ' +
        '`flatMap` visits every existing tuple and `Array.from({ length: size }, (_, index) => [...prefix, index])` ' +
        'extends it with each index of the new axis, so the newest axis always varies fastest. The seed is the ' +
        'crucial detail: `[[]]` — a list containing one empty tuple — because the product of zero axes has exactly ' +
        'one coordinate, the empty one. Seeding with `[]` instead means the first `flatMap` has nothing to extend, ' +
        'and every later axis inherits that emptiness, so the function returns `[]` for every input. A zero-length ' +
        'axis legitimately empties the product, and the same mechanism handles it: `Array.from({ length: 0 })` ' +
        'contributes nothing to extend. Output size is the product of the sizes, so this is exponential in the ' +
        'number of axes — expected, but worth saying out loud.',
      id: 'grid-coordinates',
      methods: ['Array.from', 'reduce', 'flatMap'],
      order: 18,
      solution: code(`
export function solve(sizes: number[]): number[][] {
  return sizes.reduce<number[][]>(
    (tuples, size) => tuples.flatMap((prefix) => Array.from({ length: size }, (_, index) => [...prefix, index])),
    [[]],
  );
}
`),
      starterCode: code(`
export function solve(sizes: number[]): number[][] {
  // Fold over the axes: flatMap every tuple so far with an Array.from range of the next axis. Mind the seed.
  return [];
}
`),
      tests: [
        tc(
          'two by three grid, last axis fastest (trap)',
          [[2, 3]],
          [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 0],
            [1, 1],
            [1, 2],
          ],
        ),
        tc('single axis', [[3]], [[0], [1], [2]]),
        tc('no axes yields the single empty coordinate (trap)', [[]], [[]]),
        tc('a zero-length axis empties the product', [[2, 0, 3]], []),
        tc(
          'three binary axes',
          [[2, 2, 2]],
          [
            [0, 0, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 1, 1],
            [1, 0, 0],
            [1, 0, 1],
            [1, 1, 0],
            [1, 1, 1],
          ],
        ),
        tc('one by one', [[1, 1]], [[0, 0]]),
      ],
      title: 'Every coordinate of a grid',
      trap: code(`
export function solve(sizes: number[]): number[][] {
  return sizes.reduce<number[][]>(
    (tuples, size) => tuples.flatMap((prefix) => Array.from({ length: size }, (_, index) => [...prefix, index])),
    [],
  );
}
`),
    },
  ],
};
