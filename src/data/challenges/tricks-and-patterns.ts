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
          'keeps the first occurrence (trap)',
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
          'multiple duplicate groups (trap)',
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
        tc(
          'ids interleaved across the list (trap)',
          [
            [
              { id: 1, name: 'a' },
              { id: 2, name: 'b' },
              { id: 3, name: 'c' },
              { id: 2, name: 'd' },
              { id: 1, name: 'e' },
            ],
          ],
          [
            { id: 1, name: 'a' },
            { id: 2, name: 'b' },
            { id: 3, name: 'c' },
          ],
        ),
        tc('empty list', [[]], []),
      ],
      title: 'Unique by key, first wins',
      trap: code(`
interface User {
  id: number;
  name: string;
}

export function solve(users: User[]): User[] {
  return users.filter((user, index) => users.indexOf(user) === index);
}
`),
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
          'pairs overlap by one (trap)',
          [[1, 2, 3, 4], 2],
          [
            [1, 2],
            [2, 3],
            [3, 4],
          ],
        ),
        tc(
          'triples overlap by two (trap)',
          [[1, 2, 3, 4, 5], 3],
          [
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5],
          ],
        ),
        tc('window equal to the whole array (trap)', [[1, 2], 2], [[1, 2]]),
        tc('k larger than the array', [[1, 2], 3], []),
        tc('empty array', [[], 2], []),
      ],
      title: 'Sliding windows',
      trap: code(`
export function solve(xs: number[], k: number): number[][] {
  return Array.from({ length: Math.max(0, xs.length - k) }, (_, index) => xs.slice(index, index + k));
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Transpose a rectangular matrix: rows become columns, so `solve([[1, 2, 3], [4, 5, 6]])` → ' +
        '`[[1, 4], [2, 5], [3, 6]]`. An empty matrix transposes to `[]`.\n\n' +
        'Signature: `solve(matrix: number[][]): number[][]`\n\n' +
        'Trap: the naive `matrix[0].map(...)` explodes on an empty matrix — guard it.',
      difficulty: 'advanced',
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
        tc('empty matrix (trap)', [[]], []),
      ],
      title: 'Transpose a matrix',
      trap: code(`
export function solve(matrix: number[][]): number[][] {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Rotate `xs` to the left by `k` positions: the first `k` elements move to the end, so ' +
        '`solve([1, 2, 3, 4, 5], 2)` → `[3, 4, 5, 1, 2]`. `k` may exceed the length, and a negative `k` rotates ' +
        'to the right. Do not mutate `xs`.\n\n' +
        'Signature: `solve(xs: number[], k: number): number[]`\n\n' +
        'Trap: `slice(k)` glued to `slice(0, k)` is only a rotation while `0 <= k < xs.length`.',
      difficulty: 'advanced',
      explanation:
        'A left rotation is two slices glued back together: `xs.slice(k)` is everything from position `k` onward, ' +
        '`xs.slice(0, k)` is the head that wraps around, and `concat` joins them into a new array without touching ' +
        '`xs`. That one-liner is only right for `0 <= k < xs.length`. Rotating five elements by `7` should land ' +
        'where rotating by `2` does, but `slice(7)` is empty and `slice(0, 7)` is the whole array, so the tempting ' +
        'version hands the input back unrotated. Reducing `k` modulo the length fixes the overflow; the extra ' +
        '`+ n) % n` fixes the sign, because `%` in JavaScript keeps the sign of its left operand and `-4 % 3` is ' +
        '`-1`, not `2`. Normalising first means `slice` and `concat` only ever see a shift that lies inside the ' +
        'array. The empty guard exists because `k % 0` is `NaN`.',
      id: 'rotate-by-k',
      methods: ['slice', 'concat'],
      order: 6,
      solution: code(`
export function solve(xs: number[], k: number): number[] {
  if (xs.length === 0) {
    return [];
  }
  const shift = ((k % xs.length) + xs.length) % xs.length;
  return xs.slice(shift).concat(xs.slice(0, shift));
}
`),
      starterCode: code(`
export function solve(xs: number[], k: number): number[] {
  // Normalise k into 0..length-1 first, then glue slice(k) and slice(0, k) together.
  return xs;
}
`),
      tests: [
        tc('rotate left by two', [[1, 2, 3, 4, 5], 2], [3, 4, 5, 1, 2]),
        tc('k larger than the length wraps around (trap)', [[1, 2, 3, 4, 5], 7], [3, 4, 5, 1, 2]),
        tc('negative k rotates right', [[1, 2, 3, 4, 5], -1], [5, 1, 2, 3, 4]),
        tc('negative k beyond the length (trap)', [[1, 2, 3], -4], [3, 1, 2]),
        tc('k equal to the length is the identity', [[1, 2, 3], 3], [1, 2, 3]),
        tc('empty array', [[], 4], []),
      ],
      title: 'Rotate by k',
      trap: code(`
export function solve(xs: number[], k: number): number[] {
  return xs.slice(k).concat(xs.slice(0, k));
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Deal `xs` into `n` buckets round-robin: element `i` lands in bucket `i % n`, so `solve([1, 2, 3, 4, 5], 2)` ' +
        '→ `[[1, 3, 5], [2, 4]]`. Every bucket is present even when it receives nothing.\n\n' +
        'Signature: `solve(xs: number[], n: number): number[][]`\n\n' +
        'Trap: `Array(n).fill([])` looks like `n` empty buckets. It is one empty bucket, `n` times.',
      difficulty: 'advanced',
      explanation:
        '`Array.from({ length: n }, () => [])` calls the mapper once per slot, so every bucket is a distinct ' +
        'array. `Array(n).fill([])` reads the same but evaluates `[]` once and stores that one reference in every ' +
        'slot — `fill` copies a value, it does not re-run an expression. Dealing then goes wrong silently: ' +
        '`buckets[index % n].push(value)` pushes onto the shared array through whichever slot was chosen, and ' +
        'every bucket ends up holding every element. Nothing throws, and with a single bucket the answer is even ' +
        'right, which is why the bug survives small examples. The dealing itself is a `forEach` with the index: ' +
        '`index % n` cycles through the buckets in order and returns to bucket `0` after every `n` elements. The ' +
        'same rule applies to `fill({})` or `fill(new Set())` — any object handed to `fill` is shared by every slot.',
      id: 'round-robin-buckets',
      methods: ['Array.from', 'push', 'forEach'],
      order: 7,
      solution: code(`
export function solve(xs: number[], n: number): number[][] {
  const buckets = Array.from({ length: n }, (): number[] => []);
  xs.forEach((value, index) => {
    buckets[index % n].push(value);
  });
  return buckets;
}
`),
      starterCode: code(`
export function solve(xs: number[], n: number): number[][] {
  // Build n DISTINCT empty arrays first, then push element i onto bucket i % n.
  return [];
}
`),
      tests: [
        tc(
          'deal five into two buckets (trap)',
          [[1, 2, 3, 4, 5], 2],
          [
            [1, 3, 5],
            [2, 4],
          ],
        ),
        tc(
          'deal seven into three buckets (trap)',
          [[1, 2, 3, 4, 5, 6, 7], 3],
          [
            [1, 4, 7],
            [2, 5],
            [3, 6],
          ],
        ),
        tc('more buckets than elements leaves some empty (trap)', [[1, 2], 4], [[1], [2], [], []]),
        tc('one bucket takes everything', [[1, 2, 3], 1], [[1, 2, 3]]),
        tc('no elements yields empty buckets', [[], 3], [[], [], []]),
      ],
      title: 'Deal into buckets',
      trap: code(`
export function solve(xs: number[], n: number): number[][] {
  const buckets: number[][] = Array(n).fill([]);
  xs.forEach((value, index) => {
    buckets[index % n].push(value);
  });
  return buckets;
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Build the numbers from `start` up to but excluding `end`, advancing by `step`: `solve(0, 10, 3)` → ' +
        '`[0, 3, 6, 9]`. A negative `step` counts down: `solve(5, 0, -2)` → `[5, 3, 1]`. When `step` points away ' +
        'from `end` there is nothing to produce, so return `[]`. `step` is never `0`.\n\n' +
        'Signature: `solve(start: number, end: number, step: number): number[]`\n\n' +
        'Trap: the element count is `(end - start) / step` only when that division comes out whole.',
      difficulty: 'advanced',
      explanation:
        'Every element of the range is `start + index * step`, so the only real question is how many there are. ' +
        '`(end - start) / step` measures the distance in steps, but `end` is excluded and the division rarely ' +
        'comes out whole: from `0` to `10` by `3` it is `3.33…`, and `Array.from` truncates a fractional `length` ' +
        'down to `3`, dropping the `9` that belongs in the result. `Math.ceil` is the fix — a partial step still ' +
        'needs a whole slot — and it holds for negative steps too, because the difference and the divisor flip ' +
        'sign together and the quotient stays positive. When `step` points away from `end` the quotient is ' +
        'negative; `Math.max(0, …)` clamps it to zero and `Array.from` produces `[]`. `Array.from` would also treat ' +
        'a negative length as zero on its own, but the explicit clamp states the intent instead of leaning on ' +
        'that quirk.',
      id: 'stepped-range',
      methods: ['Array.from'],
      order: 8,
      solution: code(`
export function solve(start: number, end: number, step: number): number[] {
  const count = Math.max(0, Math.ceil((end - start) / step));
  return Array.from({ length: count }, (_, index) => start + index * step);
}
`),
      starterCode: code(`
export function solve(start: number, end: number, step: number): number[] {
  // Element i is start + i * step — the work is computing how many there are, partial steps included.
  return [];
}
`),
      tests: [
        tc('step that does not divide evenly (trap)', [0, 10, 3], [0, 3, 6, 9]),
        tc('step that divides evenly', [0, 10, 5], [0, 5]),
        tc('negative step counts down (trap)', [5, 0, -2], [5, 3, 1]),
        tc('step pointing away from end yields nothing', [0, 10, -1], []),
        tc('start equal to end yields nothing', [4, 4, 1], []),
        tc('negative bounds', [-3, 3, 2], [-3, -1, 1]),
      ],
      title: 'Range with a step',
      trap: code(`
export function solve(start: number, end: number, step: number): number[] {
  return Array.from({ length: Math.max(0, (end - start) / step) }, (_, index) => start + index * step);
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Run-length encode a list of characters: each maximal stretch of equal *adjacent* characters becomes one ' +
        '`{ ch, n }` entry, in order. `solve(["a", "a", "b", "a"])` → ' +
        '`[{ ch: "a", n: 2 }, { ch: "b", n: 1 }, { ch: "a", n: 1 }]`.\n\n' +
        'Signature: `solve(chars: string[]): { ch: string; n: number }[]`\n\n' +
        'Trap: a count per character is not a count per run — `"a"` above must come out as two separate runs.',
      difficulty: 'advanced',
      explanation:
        'Run-length encoding compresses *adjacent* repeats, and adjacency is exactly what a frequency map throws ' +
        'away: tallying into an object keyed by character reports that `a` appears three times in `a a b a`, when ' +
        'the answer is two runs of `a` separated by a `b`. The fold has to look at the run in progress instead. ' +
        '`reduce` carries the list of runs built so far and `at(-1)` reads the most recent one; if its `ch` matches ' +
        'the current character that run grows by one, otherwise a fresh `{ ch, n: 1 }` is appended. Growing a run ' +
        'is done immutably — `slice(0, -1)` drops the old last entry and a new object with `n + 1` takes its ' +
        'place — so no run object is ever mutated after it is created. An empty input never invokes the callback, ' +
        'and the seed `[]` is returned as is.',
      id: 'run-length-encode',
      methods: ['reduce', 'at', 'slice'],
      order: 9,
      solution: code(`
interface Run {
  ch: string;
  n: number;
}

export function solve(chars: string[]): Run[] {
  return chars.reduce<Run[]>((runs, ch) => {
    const last = runs.at(-1);
    if (last !== undefined && last.ch === ch) {
      return [...runs.slice(0, -1), { ch, n: last.n + 1 }];
    }
    return [...runs, { ch, n: 1 }];
  }, []);
}
`),
      starterCode: code(`
interface Run {
  ch: string;
  n: number;
}

export function solve(chars: string[]): Run[] {
  // Compare each character with the run in progress (at(-1)) — extend it or start a new one.
  return [];
}
`),
      tests: [
        tc(
          'a character that returns later starts a new run (trap)',
          [['a', 'a', 'b', 'a']],
          [
            { ch: 'a', n: 2 },
            { ch: 'b', n: 1 },
            { ch: 'a', n: 1 },
          ],
        ),
        tc('adjacent repeats collapse', [['x', 'x', 'x']], [{ ch: 'x', n: 3 }]),
        tc(
          'alternating characters never merge (trap)',
          [['a', 'b', 'a', 'b']],
          [
            { ch: 'a', n: 1 },
            { ch: 'b', n: 1 },
            { ch: 'a', n: 1 },
            { ch: 'b', n: 1 },
          ],
        ),
        tc(
          'no repeats at all',
          [['a', 'b', 'c']],
          [
            { ch: 'a', n: 1 },
            { ch: 'b', n: 1 },
            { ch: 'c', n: 1 },
          ],
        ),
        tc('single character', [['z']], [{ ch: 'z', n: 1 }]),
        tc('empty input', [[]], []),
      ],
      title: 'Run-length encode',
      trap: code(`
interface Run {
  ch: string;
  n: number;
}

export function solve(chars: string[]): Run[] {
  const counts = chars.reduce<Record<string, number>>((tally, ch) => {
    tally[ch] = (tally[ch] ?? 0) + 1;
    return tally;
  }, {});
  return Object.entries(counts).map(([ch, n]) => ({ ch, n }));
}
`),
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
      order: 10,
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
    {
      categoryId: 'tricks-and-patterns',
      description:
        'A fixed-size buffer keeps its newest reading at index `0`. Make room for `k` new readings by moving every ' +
        'element `k` slots to the right — the oldest `k` fall off the end — then zero the freed slots at the ' +
        'front. Mutate `buffer` in place and return it: `solve([1, 2, 3, 4, 5], 2)` → `[0, 0, 1, 2, 3]`. A `k` of ' +
        '`0` changes nothing; a `k` at or beyond the length zeroes everything.\n\n' +
        'Signature: `solve(buffer: number[], k: number): number[]`\n\n' +
        '`copyWithin` exists for exactly this: moving a block to a destination that overlaps its source.',
      difficulty: 'expert',
      explanation:
        '`copyWithin(target, start)` moves a block of the array to another position *inside the same array*, and ' +
        'its one job is handling overlap correctly: when the destination lies beyond the source, the specification ' +
        'copies from the end backwards, so no slot is read after it has already been overwritten. The hand-written ' +
        'forward loop `buffer[i] = buffer[i - k]` reads slots it has just clobbered — shifting `[1, 2, 3, 4, 5]` ' +
        'by `2` yields `[1, 2, 1, 2, 1]` — and it only appears to work when `k` is large enough that source and ' +
        'destination do not overlap. Two things it will not do: it never changes the length, and ' +
        'it leaves the vacated slots holding their old values, which is why `fill(0, 0, k)` follows to zero the ' +
        'freed head. Both methods mutate in place and return the same array, so the chain hands back the ' +
        "caller's buffer.",
      id: 'ring-buffer-shift',
      methods: ['copyWithin', 'fill'],
      order: 11,
      solution: code(`
export function solve(buffer: number[], k: number): number[] {
  return buffer.copyWithin(k, 0).fill(0, 0, k);
}
`),
      starterCode: code(`
export function solve(buffer: number[], k: number): number[] {
  // copyWithin(target, start) moves a block even when it overlaps itself; then fill the freed slots with 0.
  return buffer;
}
`),
      tests: [
        tc('shift right by two (trap)', [[1, 2, 3, 4, 5], 2], [0, 0, 1, 2, 3]),
        tc('shift right by one (trap)', [[1, 2, 3, 4], 1], [0, 1, 2, 3]),
        tc('shift by more than half has no overlap', [[1, 2, 3, 4, 5], 3], [0, 0, 0, 1, 2]),
        tc('k of zero is a no-op', [[7, 8, 9], 0], [7, 8, 9]),
        tc('k equal to the length zeroes everything', [[1, 2, 3], 3], [0, 0, 0]),
        tc('k beyond the length zeroes everything', [[1, 2], 5], [0, 0]),
        tc('empty buffer', [[], 2], []),
      ],
      title: 'Shift a buffer in place',
      trap: code(`
export function solve(buffer: number[], k: number): number[] {
  for (let index = k; index < buffer.length; index += 1) {
    buffer[index] = buffer[index - k];
  }
  return buffer.fill(0, 0, k);
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Evaluate an expression written in Reverse Polish Notation: `tokens` holds numbers and the operators `+`, ' +
        '`-`, `*`, `/`, and each operator applies to the two values pushed most recently. ' +
        '`solve(["3", "4", "+", "2", "*"])` → `14`. The input is always well-formed and never divides by zero.\n\n' +
        'Signature: `solve(tokens: string[]): number`\n\n' +
        'Keep a stack: `push` numbers, and let each operator `pop` its operands — mind which one comes off first.',
      difficulty: 'expert',
      explanation:
        'Reverse Polish Notation is a stack machine: numbers are pushed, and an operator consumes the two most ' +
        'recent values and pushes its result. `push` and `pop` make an ordinary array behave as that stack, and ' +
        '`reduce` threads it through the tokens — the accumulator is the stack itself, mutated in place and ' +
        'returned from every step. The subtle part is operand order. `pop` returns the *most recently* pushed ' +
        'value, which for `5 3 -` is the `3`, and that value is the right-hand operand: the expression means ' +
        '`5 - 3`, not `3 - 5`. Popping into `right` first and `left` second keeps `-` and `/` honest; `+` and `*` ' +
        'are commutative and would hide the mistake. The `?? 0` fallbacks satisfy the type checker, since `pop` ' +
        'may return `undefined`; well-formed input never reaches them. Once every token is ' +
        'consumed exactly one value remains, and a final `pop` retrieves it.',
      id: 'rpn-calculator',
      methods: ['push', 'pop', 'reduce'],
      order: 12,
      solution: code(`
const OPERATORS = new Set(['+', '-', '*', '/']);

function apply(operator: string, left: number, right: number): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    default:
      return left / right;
  }
}

export function solve(tokens: string[]): number {
  const stack = tokens.reduce<number[]>((values, token) => {
    if (!OPERATORS.has(token)) {
      values.push(Number(token));
      return values;
    }
    const right = values.pop() ?? 0;
    const left = values.pop() ?? 0;
    values.push(apply(token, left, right));
    return values;
  }, []);
  return stack.pop() ?? 0;
}
`),
      starterCode: code(`
export function solve(tokens: string[]): number {
  // Push numbers; an operator pops two values — the FIRST one popped is the right-hand operand.
  return 0;
}
`),
      tests: [
        tc('add then multiply', [['3', '4', '+', '2', '*']], 14),
        tc('subtraction takes the earlier operand first (trap)', [['5', '3', '-']], 2),
        tc('division order matters (trap)', [['8', '2', '/']], 4),
        tc('chained subtraction (trap)', [['10', '2', '3', '-', '-']], 11),
        tc('nested operators', [['2', '3', '4', '*', '+']], 14),
        tc('negative literals are numbers, not operators', [['-3', '2', '*']], -6),
        tc('single number', [['42']], 42),
      ],
      title: 'RPN calculator',
      trap: code(`
const OPERATORS = new Set(['+', '-', '*', '/']);

function apply(operator: string, left: number, right: number): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    default:
      return left / right;
  }
}

export function solve(tokens: string[]): number {
  const stack = tokens.reduce<number[]>((values, token) => {
    if (!OPERATORS.has(token)) {
      values.push(Number(token));
      return values;
    }
    const left = values.pop() ?? 0;
    const right = values.pop() ?? 0;
    values.push(apply(token, left, right));
    return values;
  }, []);
  return stack.pop() ?? 0;
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Return the values of a tree in breadth-first order: the root, then every node at depth `1` from left to ' +
        'right, then depth `2`, and so on. Nodes are `{ children, value }`. For a root `1` with children `2` and ' +
        '`3`, where `2` has a child `4`, the answer is `[1, 2, 3, 4]` — the grandchild waits for every child.\n\n' +
        'Signature: `solve(root: { children: TreeNode[]; value: number }): number[]`\n\n' +
        'A queue is the whole trick: `shift` takes the oldest entry, `push` appends behind everything waiting.',
      difficulty: 'expert',
      explanation:
        'Breadth-first order is a queue discipline: whoever has waited longest is served next. `shift` removes the ' +
        'front of an array and `push` appends to the back, so the pair turns an array into a first-in, first-out ' +
        'queue. Seed it with the root; each turn `shift`s one node, records its value, and `push`es its children ' +
        'behind everything already waiting — which is exactly why a grandchild cannot appear before an uncle: the ' +
        'uncle was queued earlier. The natural recursive version `[value, ...children.flatMap(solve)]` walks ' +
        'depth-first and produces pre-order, diving into the first child’s subtree before its sibling is visited — ' +
        '`[1, 2, 4, 3]` instead of `[1, 2, 3, 4]`. Swapping `shift` for `pop` turns the queue into a stack and ' +
        'gives a depth-first order too. One cost to know: `shift` re-indexes the array, so on very large trees a ' +
        'head pointer into the array beats repeated shifting.',
      id: 'level-order-traversal',
      methods: ['shift', 'push'],
      order: 13,
      solution: code(`
interface TreeNode {
  children: TreeNode[];
  value: number;
}

export function solve(root: TreeNode): number[] {
  const queue: TreeNode[] = [root];
  const values: number[] = [];
  let node = queue.shift();
  while (node !== undefined) {
    values.push(node.value);
    queue.push(...node.children);
    node = queue.shift();
  }
  return values;
}
`),
      starterCode: code(`
interface TreeNode {
  children: TreeNode[];
  value: number;
}

export function solve(root: TreeNode): number[] {
  // Seed a queue with the root; shift a node, record it, push its children — repeat until the queue is empty.
  return [];
}
`),
      tests: [
        tc(
          'grandchild waits for every child (trap)',
          [
            {
              children: [
                { children: [{ children: [], value: 4 }], value: 2 },
                { children: [], value: 3 },
              ],
              value: 1,
            },
          ],
          [1, 2, 3, 4],
        ),
        tc(
          'three levels (trap)',
          [
            {
              children: [
                {
                  children: [
                    { children: [], value: 5 },
                    { children: [], value: 6 },
                  ],
                  value: 2,
                },
                { children: [], value: 3 },
                { children: [{ children: [], value: 7 }], value: 4 },
              ],
              value: 1,
            },
          ],
          [1, 2, 3, 4, 5, 6, 7],
        ),
        tc(
          'siblings stay left to right (trap)',
          [
            {
              children: [
                { children: [{ children: [], value: 4 }], value: 2 },
                { children: [{ children: [], value: 5 }], value: 3 },
              ],
              value: 1,
            },
          ],
          [1, 2, 3, 4, 5],
        ),
        tc(
          'a chain reads the same in either order',
          [{ children: [{ children: [{ children: [], value: 3 }], value: 2 }], value: 1 }],
          [1, 2, 3],
        ),
        tc(
          'wide and flat',
          [
            {
              children: [
                { children: [], value: 2 },
                { children: [], value: 3 },
                { children: [], value: 4 },
              ],
              value: 1,
            },
          ],
          [1, 2, 3, 4],
        ),
        tc('a single node', [{ children: [], value: 9 }], [9]),
      ],
      title: 'Level order with a queue',
      trap: code(`
interface TreeNode {
  children: TreeNode[];
  value: number;
}

export function solve(root: TreeNode): number[] {
  return [root.value, ...root.children.flatMap((child) => solve(child))];
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Shuffle `xs` with the Fisher–Yates algorithm, taking the randomness as data so the result is ' +
        'reproducible. Walk `i` from the last index down to `1`; at step `s` pick `j = Math.floor(rolls[s] * (i + 1))` ' +
        'and swap positions `i` and `j`. `rolls` holds `xs.length - 1` numbers in `[0, 1)`. Return a new array and ' +
        'leave `xs` untouched.\n\n' +
        'Signature: `solve(xs: number[], rolls: number[]): number[]`\n\n' +
        'Trap: drawing `j` from the whole array instead of `0..i` is the classic biased shuffle.',
      difficulty: 'expert',
      explanation:
        'Fisher–Yates walks `i` from the last index down to `1`, chooses a partner `j` uniformly from `0..i` — the ' +
        'still-unshuffled prefix plus `i` itself — and swaps. Because `j` never reaches into the already-placed ' +
        'tail, every one of the `n!` orderings is equally likely. The tempting shortcut draws `j` from the whole ' +
        'array, `Math.floor(roll * xs.length)`; that is not uniform, and here it simply produces a different array ' +
        'from the same rolls. Taking the rolls as data is what makes the algorithm testable. `Array.from` lays out ' +
        'the descending sequence of `i` values, `reduce` carries the partially shuffled array, and `with` performs ' +
        'each swap without mutating: `shuffled.with(i, shuffled[j]).with(j, shuffled[i])` reads both original ' +
        'values before either is replaced, so the input array is never touched. Every `with` copies the array, ' +
        'which makes this O(n²) — the price of immutability for an algorithm designed to swap in place.',
      id: 'seeded-shuffle',
      methods: ['with', 'Array.from', 'reduce'],
      order: 14,
      solution: code(`
export function solve(xs: number[], rolls: number[]): number[] {
  const positions = Array.from({ length: Math.max(0, xs.length - 1) }, (_, step) => xs.length - 1 - step);
  return positions.reduce((shuffled, i, step) => {
    const j = Math.floor(rolls[step] * (i + 1));
    return shuffled.with(i, shuffled[j]).with(j, shuffled[i]);
  }, xs);
}
`),
      starterCode: code(`
export function solve(xs: number[], rolls: number[]): number[] {
  // For i = last..1: j = floor(rolls[step] * (i + 1)); swap i and j with two with() calls.
  return xs;
}
`),
      tests: [
        tc(
          'mid rolls',
          [
            [1, 2, 3, 4],
            [0.5, 0.5, 0.5],
          ],
          [1, 4, 2, 3],
        ),
        tc(
          'rolls near one leave everything in place (trap)',
          [
            [1, 2, 3, 4],
            [0.9, 0.9, 0.9],
          ],
          [1, 2, 3, 4],
        ),
        tc(
          'seven-tenths (trap)',
          [
            [1, 2, 3, 4],
            [0.7, 0.7, 0.7],
          ],
          [1, 2, 4, 3],
        ),
        tc(
          'rolls of zero always swap with the front',
          [
            [1, 2, 3, 4],
            [0, 0, 0],
          ],
          [2, 3, 4, 1],
        ),
        tc('two elements swap on a low roll', [[1, 2], [0.2]], [2, 1]),
        tc('single element needs no rolls', [[5], []], [5]),
        tc('empty array', [[], []], []),
      ],
      title: 'Seeded Fisher–Yates',
      trap: code(`
export function solve(xs: number[], rolls: number[]): number[] {
  const positions = Array.from({ length: Math.max(0, xs.length - 1) }, (_, step) => xs.length - 1 - step);
  return positions.reduce((shuffled, i, step) => {
    const j = Math.floor(rolls[step] * xs.length);
    return shuffled.with(i, shuffled[j]).with(j, shuffled[i]);
  }, xs);
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Rank the values of `xs` by how often they appear, most frequent first, as `[value, count]` pairs. Ties ' +
        'keep the order in which the values first appeared: `solve([10, 2, 2, 10, 5])` → ' +
        '`[[10, 2], [2, 2], [5, 1]]`.\n\n' +
        'Signature: `solve(xs: number[]): [number, number][]`\n\n' +
        'Trap: counting into a plain object reorders your keys behind your back.',
      difficulty: 'expert',
      explanation:
        '`Map.groupBy(xs, (x) => x)` buckets the values in a single pass, and a `Map` remembers the order in which ' +
        'keys were first inserted, so the groups already sit in first-appearance order. Spreading the map yields ' +
        '`[value, group]` pairs, `map` swaps each group for its length, and `toSorted` orders by count descending. ' +
        'That last step leans on a guarantee: `toSorted` is stable, so pairs with equal counts keep their relative ' +
        'order — the first-appearance order the map preserved. Counting into a plain object breaks this before ' +
        'sorting even starts. Keys that look like array indices are enumerated in ascending numeric order ahead ' +
        'of every other key, so `Object.entries` on `{ 10: 2, 2: 2, 5: 1 }` yields `2` before `10` and the tie ' +
        'resolves the wrong way. It also turns every key into a string. `Map` keeps keys as they are, in the ' +
        'order they arrived.',
      id: 'frequency-ranking',
      methods: ['Map.groupBy', 'map', 'toSorted'],
      order: 15,
      solution: code(`
export function solve(xs: number[]): [number, number][] {
  return [...Map.groupBy(xs, (x) => x)]
    .map(([value, group]): [number, number] => [value, group.length])
    .toSorted((a, b) => b[1] - a[1]);
}
`),
      starterCode: code(`
export function solve(xs: number[]): [number, number][] {
  // Group with Map.groupBy (insertion order preserved), map groups to counts, then a STABLE sort by count.
  return [];
}
`),
      tests: [
        tc(
          'ties keep first-appearance order (trap)',
          [[10, 2, 2, 10, 5]],
          [
            [10, 2],
            [2, 2],
            [5, 1],
          ],
        ),
        tc(
          'all ties preserve input order (trap)',
          [[7, 3, 9]],
          [
            [7, 1],
            [3, 1],
            [9, 1],
          ],
        ),
        tc(
          'clear winner',
          [[1, 3, 3, 3, 2, 2]],
          [
            [3, 3],
            [2, 2],
            [1, 1],
          ],
        ),
        tc(
          'negative and zero values',
          [[-1, 0, -1]],
          [
            [-1, 2],
            [0, 1],
          ],
        ),
        tc('single value', [[4, 4]], [[4, 2]]),
        tc('empty input', [[]], []),
      ],
      title: 'Frequency ranking',
      trap: code(`
export function solve(xs: number[]): [number, number][] {
  const counts = xs.reduce<Record<number, number>>((tally, value) => {
    tally[value] = (tally[value] ?? 0) + 1;
    return tally;
  }, {});
  return Object.entries(counts)
    .map(([value, count]): [number, number] => [Number(value), count])
    .toSorted((a, b) => b[1] - a[1]);
}
`),
    },
    {
      categoryId: 'tricks-and-patterns',
      description:
        'Rebuild `toSpliced` from `slice` and `concat`: return a copy of `xs` with `deleteCount` elements removed ' +
        'at `start` and `items` inserted in their place, leaving `xs` untouched. A negative `start` counts from ' +
        'the end, like the real method; a `deleteCount` past the end removes to the end. Calling `splice` or ' +
        '`toSpliced` is forbidden.\n\n' +
        'Signature: `solve(xs: number[], start: number, deleteCount: number, items: number[]): number[]`\n\n' +
        'Trap: `slice(0, start)` understands a negative `start`; `slice(start + deleteCount)` does not.',
      difficulty: 'expert',
      explanation:
        '`toSpliced(start, deleteCount, ...items)` is three pieces concatenated: the part before `start`, the ' +
        'inserted `items`, and the part after the deleted stretch. `slice(0, from)` and `slice(from + deleteCount)` ' +
        'produce the outer two and `concat` joins them into a fresh array, so the input is never mutated. What ' +
        'the one-liner misses is that the real method normalises its arguments first. A negative `start` counts ' +
        'from the end, and while `slice(0, -1)` happens to understand that, `slice(-1 + 1)` is `slice(0)` — the ' +
        'whole array — so deleting the last element duplicates everything. Resolving `start` into a real index ' +
        'up front (`length + start` clamped at `0`; a positive value clamped at `length`) makes both slices agree. ' +
        '`deleteCount` is clamped at `0` too, because a negative count deletes nothing and would otherwise drag ' +
        'the second slice backwards. Once normalised, `slice` absorbs over-long counts on its own.',
      id: 'build-your-own-tospliced',
      methods: ['slice', 'concat'],
      order: 16,
      solution: code(`
export function solve(xs: number[], start: number, deleteCount: number, items: number[]): number[] {
  const from = start < 0 ? Math.max(0, xs.length + start) : Math.min(start, xs.length);
  return xs.slice(0, from).concat(items, xs.slice(from + Math.max(0, deleteCount)));
}
`),
      starterCode: code(`
export function solve(xs: number[], start: number, deleteCount: number, items: number[]): number[] {
  // Resolve start into a real index first (negative counts from the end), then slice / concat / slice.
  return xs;
}
`),
      tests: [
        tc('replace in the middle', [[1, 2, 3, 4], 1, 2, [9, 8]], [1, 9, 8, 4]),
        tc('insert without deleting', [[1, 2, 3], 1, 0, [9]], [1, 9, 2, 3]),
        tc('negative start counts from the end (trap)', [[1, 2, 3, 4], -1, 1, [9]], [1, 2, 3, 9]),
        tc('negative delete count deletes nothing (trap)', [[1, 2, 3], 1, -1, [9]], [1, 9, 2, 3]),
        tc('delete count past the end removes to the end', [[1, 2, 3, 4], 2, 10, []], [1, 2]),
        tc('start past the end appends', [[1, 2], 5, 0, [3]], [1, 2, 3]),
        tc('empty array', [[], 0, 0, [1]], [1]),
      ],
      title: 'Build your own toSpliced',
      trap: code(`
export function solve(xs: number[], start: number, deleteCount: number, items: number[]): number[] {
  return xs.slice(0, start).concat(items, xs.slice(start + deleteCount));
}
`),
    },
  ],
};
