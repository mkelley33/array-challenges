import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const flatteningAndComposing: CategoryModule = {
  category: {
    description:
      'Collapse nested arrays and compose new ones — flat, flatMap, and concat turn map-then-flatten chores into single passes.',
    id: 'flattening-and-composing',
    order: 8,
    title: 'Flattening & Composing',
  },
  challenges: [
    {
      categoryId: 'flattening-and-composing',
      description:
        'Flatten a nested array by exactly one level: `[[1, 2], [3]]` becomes `[1, 2, 3]`. ' +
        'Non-array elements pass through untouched.\n\n' +
        'Signature: `solve(values: (number | number[])[]): number[]`',
      difficulty: 'novice',
      explanation:
        '`flat()` with no argument flattens exactly one level — the depth parameter defaults to `1`, not ' +
        '`Infinity`, which surprises people expecting a full collapse. Array elements are spread into the result, ' +
        'non-array elements are copied over as-is, and empty inner arrays contribute nothing. Two bonus behaviors ' +
        'worth knowing: `flat` always returns a *new* array (the input is never mutated), and it drops holes from ' +
        'sparse arrays, so `arr.flat()` doubles as a densifier.',
      id: 'flatten-one-level',
      methods: ['flat'],
      order: 1,
      solution: code(`
export function solve(values: (number | number[])[]): number[] {
  return values.flat();
}
`),
      starterCode: code(`
export function solve(values: (number | number[])[]): number[] {
  // One method call removes exactly one layer of brackets — no loop needed.
  return [];
}
`),
      tests: [
        tc('flattens one level', [[[1, 2], [3]]], [1, 2, 3]),
        tc('non-array elements pass through', [[1, [2, 3], 4]], [1, 2, 3, 4]),
        tc('empty inner arrays vanish', [[[], [1], []]], [1]),
        tc('empty outer array', [[]], []),
      ],
      title: 'Flatten one level',
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Fully flatten an arbitrarily nested array of numbers — any depth, one flat list out.\n\n' +
        'Signature: `solve(values: Nested): number[]` where `type Nested = (Nested | number)[]`\n\n' +
        'Constraint: a single method call — no recursion, no loops.',
      difficulty: 'intermediate',
      explanation:
        'The depth argument of `flat` caps how many levels collapse per call: `flat(1)` peels one layer, `flat(2)` ' +
        'two, and `flat(Infinity)` keeps going until no arrays remain — the idiom for nesting whose depth you do ' +
        'not know in advance. Before ES2019 this took hand-written recursion or repeated `concat` passes; now the ' +
        'engine walks the structure for you. Each call still returns a fresh array, so even a full deep flatten ' +
        'never touches the input. The one thing `flat(Infinity)` cannot express is *conditional* flattening — for ' +
        'that you graduate to `flatMap`.',
      id: 'deep-flatten',
      methods: ['flat'],
      order: 2,
      solution: code(`
type Nested = (Nested | number)[];

export function solve(values: Nested): number[] {
  return values.flat(Infinity) as number[];
}
`),
      starterCode: code(`
type Nested = (Nested | number)[];

export function solve(values: Nested): number[] {
  // flat() only peels one layer by default — how do you tell it to keep going?
  return [];
}
`),
      tests: [
        tc('two levels deep', [[[1, [2]], [3]]], [1, 2, 3]),
        tc('five levels deep', [[[1], [2, [3, [4, [5]]]]]], [1, 2, 3, 4, 5]),
        tc('already flat', [[1, 2, 3]], [1, 2, 3]),
        tc('nothing but empty arrays', [[[], [[]], [[[]]]]], []),
      ],
      title: 'Deep flatten',
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Merge three arrays into one new array, in order, without mutating any of the inputs.\n\n' +
        'Signature: `solve(first: number[], second: number[], third: number[]): number[]`',
      difficulty: 'novice',
      explanation:
        '`concat` builds a brand-new array from the receiver plus every argument — none of the inputs are ' +
        'touched, which is what separates it from `push(...items)`. Its spreading rule is worth memorizing: an ' +
        'ARRAY argument is spread one level deep (its elements are appended, not the array itself), while a ' +
        'non-array argument is appended as-is — `[1].concat([2, 3], 4)` yields `[1, 2, 3, 4]`. One level only, ' +
        'though: nested arrays inside an argument stay nested. Modern spread syntax `[...a, ...b, ...c]` is ' +
        'equivalent here, but `concat` predates it and reads better in method chains.',
      id: 'merge-three-arrays',
      methods: ['concat'],
      order: 3,
      solution: code(`
export function solve(first: number[], second: number[], third: number[]): number[] {
  return first.concat(second, third);
}
`),
      starterCode: code(`
export function solve(first: number[], second: number[], third: number[]): number[] {
  // push() would mutate the first array — find the method that copies instead.
  return [];
}
`),
      tests: [
        tc('merges three arrays', [[1, 2], [3], [4, 5]], [1, 2, 3, 4, 5]),
        tc('empty middle array', [[1], [], [2]], [1, 2]),
        tc('all empty', [[], [], []], []),
        tc('preserves order and duplicates', [[1, 1], [1], [2, 1]], [1, 1, 1, 2, 1]),
      ],
      title: 'Merge three arrays',
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Each sentence is a space-separated string. Split every sentence into its words and return one flat ' +
        'list of words, in order.\n\n' +
        'Signature: `solve(sentences: string[]): string[]`\n\n' +
        'Constraint: one pass — no separate `map` step followed by a flatten.',
      difficulty: 'intermediate',
      explanation:
        '`flatMap` is `map` followed by `flat(1)` fused into a single pass: the callback returns an array per ' +
        'element, and those arrays are stitched together without ever materializing the intermediate ' +
        "array-of-arrays. `sentences.map((s) => s.split(' ')).flat()` walks the data twice and allocates the " +
        "nested structure just to throw it away; `sentences.flatMap((s) => s.split(' '))` does the same job in " +
        'one traversal. Note the depth is fixed at exactly one — a callback returning `[[1]]` contributes `[1]`, ' +
        'still wrapped. There is no `flatMap(Infinity)`.',
      id: 'sentences-to-words',
      methods: ['flatMap'],
      order: 4,
      solution: code(`
export function solve(sentences: string[]): string[] {
  return sentences.flatMap((sentence) => sentence.split(' '));
}
`),
      starterCode: code(`
export function solve(sentences: string[]): string[] {
  // split(' ') gives an array per sentence — which method flattens while it maps?
  return [];
}
`),
      tests: [
        tc('splits two sentences', [['a b', 'c']], ['a', 'b', 'c']),
        tc('multi-word sentences', [['the quick fox', 'jumps high']], ['the', 'quick', 'fox', 'jumps', 'high']),
        tc('single-word sentences pass through', [['solo']], ['solo']),
        tc('keeps duplicate words', [['a b', 'b a']], ['a', 'b', 'b', 'a']),
        tc('empty sentence list', [[]], []),
      ],
      title: 'Sentences to words',
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Parse a list of strings, keeping only the entries that are valid integers (an optional minus sign ' +
        'followed by digits only) — converted to numbers. Entries like `"3.5"`, `""`, or `"x"` are dropped.\n\n' +
        'Signature: `solve(entries: string[]): number[]`\n\n' +
        'Constraint: a single `flatMap` pass — return `[]` from the callback to drop an entry.',
      difficulty: 'advanced',
      explanation:
        'The callback of `flatMap` decides how many elements each input contributes: return `[]` and the entry ' +
        'contributes nothing (a filter), return `[value]` and it contributes one transformed element (a map), ' +
        'return a longer array and it expands. That asymmetry is why `flatMap` can express filter-and-map in one ' +
        'traversal where `filter(...).map(...)` needs two — and unlike `map`, the dropped entries never appear in ' +
        'the output as `undefined` placeholders. The validity test matters too: `Number("")` is `0` and ' +
        '`Number("3.5")` is a perfectly fine number, so the solution anchors a regex (`/^-?[0-9]+$/`) around the ' +
        'whole string instead of trusting coercion.',
      id: 'parse-valid-integers',
      methods: ['flatMap'],
      order: 5,
      solution: code(`
export function solve(entries: string[]): number[] {
  return entries.flatMap((entry) => (/^-?[0-9]+$/.test(entry) ? [Number(entry)] : []));
}
`),
      starterCode: code(`
export function solve(entries: string[]): number[] {
  // Return [entry as number] to keep, [] to drop — one method does both at once.
  return [];
}
`),
      tests: [
        tc('keeps integers, drops junk', [['12', 'x', '7']], [12, 7]),
        tc('drops decimals and empty strings', [['3.5', '', '8']], [8]),
        tc('negative integers survive', [['-4', '-', '5']], [-4, 5]),
        tc('nothing valid', [['a', 'b']], []),
        tc('empty input', [[]], []),
      ],
      title: 'Parse the valid integers',
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Run-length decode: expand `[{ ch: "a", n: 3 }, { ch: "b", n: 1 }]` into `["a", "a", "a", "b"]`. ' +
        'A run with `n: 0` contributes nothing.\n\n' +
        'Signature: `solve(runs: { ch: string; n: number }[]): string[]`',
      difficulty: 'expert',
      explanation:
        'Each run expands independently — `new Array(run.n)` allocates `n` slots and `fill(run.ch)` writes the ' +
        'character into every one, converting the holes into real elements (`map` would skip them, `fill` does ' +
        'not). `flatMap` then splices each expansion into the result in order. The `n: 0` case falls out for ' +
        'free: `Array(0).fill(x)` is `[]`, and a callback returning an empty array contributes zero elements — ' +
        'the same drop idiom used for filtering, now emerging naturally from the data. This expand-by-count shape ' +
        'is the mirror image of run-length *encoding*, which compresses with `reduce`.',
      id: 'run-length-decode',
      methods: ['flatMap', 'fill'],
      order: 6,
      solution: code(`
interface Run {
  ch: string;
  n: number;
}

export function solve(runs: Run[]): string[] {
  return runs.flatMap((run) => new Array<string>(run.n).fill(run.ch));
}
`),
      starterCode: code(`
interface Run {
  ch: string;
  n: number;
}

export function solve(runs: Run[]): string[] {
  // Expand each run to n copies (Array(n) alone gives holes!), then flatten the expansions.
  return [];
}
`),
      tests: [
        tc(
          'decodes runs',
          [
            [
              { ch: 'a', n: 3 },
              { ch: 'b', n: 1 },
            ],
          ],
          ['a', 'a', 'a', 'b'],
        ),
        tc(
          'zero-length run vanishes',
          [
            [
              { ch: 'a', n: 2 },
              { ch: 'x', n: 0 },
              { ch: 'b', n: 1 },
            ],
          ],
          ['a', 'a', 'b'],
        ),
        tc('single run', [[{ ch: 'z', n: 4 }]], ['z', 'z', 'z', 'z']),
        tc('empty run list', [[]], []),
        tc(
          'all runs empty',
          [
            [
              { ch: 'a', n: 0 },
              { ch: 'b', n: 0 },
            ],
          ],
          [],
        ),
      ],
      title: 'Run-length decode',
    },
  ],
};
