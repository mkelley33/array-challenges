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
      order: 2,
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
      order: 3,
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
        tc('drops decimals and empty strings (trap)', [['3.5', '', '8']], [8]),
        tc('negative integers survive', [['-4', '-', '5']], [-4, 5]),
        tc('nothing valid', [['a', 'b']], []),
        tc('empty input', [[]], []),
      ],
      title: 'Parse the valid integers',
      trap: code(`
export function solve(entries: string[]): number[] {
  return entries.flatMap((entry) => (Number.isNaN(Number(entry)) ? [] : [Number(entry)]));
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Run-length decode: expand `[{ ch: "a", n: 3 }, { ch: "b", n: 1 }]` into `["a", "a", "a", "b"]`. ' +
        'A run with `n: 0` contributes nothing.\n\n' +
        'Signature: `solve(runs: { ch: string; n: number }[]): string[]`\n\n' +
        'Trap: `new Array(n)` has `n` holes, not `n` elements — and a hole is invisible to `map`.',
      difficulty: 'advanced',
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
          'decodes runs (trap)',
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
        tc('single run (trap)', [[{ ch: 'z', n: 4 }]], ['z', 'z', 'z', 'z']),
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
      trap: code(`
interface Run {
  ch: string;
  n: number;
}

export function solve(runs: Run[]): string[] {
  return runs.flatMap((run) => new Array<string>(run.n).map(() => run.ch));
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Flatten `entries` by exactly one level and record where each value came from. A real array spreads ' +
        'into one result per element with `fromGroup: true`; anything else — a string, a number, or an ' +
        'array-like record such as `{ 0: "a", 1: "b", length: 2 }` (plain data, not an array) — stays one value ' +
        'with `fromGroup: false`.\n\n' +
        'Signature: `solve(entries: unknown[]): { fromGroup: boolean; value: unknown }[]`\n\n' +
        'Use `flatMap`, and decide "is this an array?" with the one test that cannot be fooled.',
      difficulty: 'advanced',
      explanation:
        '`flatMap` lets each entry decide how many results it contributes and what they look like, which is ' +
        'exactly what a provenance-tagged flatten needs — plain `flat()` would splice the groups in but forget ' +
        'which values came from one. The decision itself is the lesson. `Array.isArray` is the only reliable ' +
        'test for "is this a real array": it inspects the object\'s internal array-ness, so a plain record with ' +
        'a `length` and numeric keys — the shape of `arguments`, a `NodeList`, or a legacy API payload — is ' +
        'correctly refused. The tempting duck-type, `typeof entry === "object" && "length" in entry`, accepts ' +
        'that record and spreads it as if it were a group, and the looser `entry.length !== undefined` also ' +
        'shreds every string into characters. `flat` uses the same `Array.isArray` rule internally, which is why ' +
        'it never spreads strings or array-likes either.',
      id: 'spread-only-real-arrays',
      methods: ['flatMap', 'Array.isArray'],
      order: 7,
      solution: code(`
interface Tagged {
  fromGroup: boolean;
  value: unknown;
}

export function solve(entries: unknown[]): Tagged[] {
  return entries.flatMap((entry): Tagged[] => {
    if (!Array.isArray(entry)) {
      return [{ fromGroup: false, value: entry }];
    }
    const group: unknown[] = entry;
    return group.map((value) => ({ fromGroup: true, value }));
  });
}
`),
      starterCode: code(`
interface Tagged {
  fromGroup: boolean;
  value: unknown;
}

export function solve(entries: unknown[]): Tagged[] {
  // Spread only real arrays — a string and a { length } record both look array-ish and are not.
  return [];
}
`),
      tests: [
        tc(
          'arrays spread, strings stay whole',
          [[['a', 'b'], 'c']],
          [
            { fromGroup: true, value: 'a' },
            { fromGroup: true, value: 'b' },
            { fromGroup: false, value: 'c' },
          ],
        ),
        tc(
          'an array-like record is one value, not a group (trap)',
          [[{ 0: 'a', 1: 'b', length: 2 }, 'c']],
          [
            { fromGroup: false, value: { 0: 'a', 1: 'b', length: 2 } },
            { fromGroup: false, value: 'c' },
          ],
        ),
        tc(
          'a string is never spread into characters',
          [['ab', ['c']]],
          [
            { fromGroup: false, value: 'ab' },
            { fromGroup: true, value: 'c' },
          ],
        ),
        tc(
          'only one level is spread',
          [[[['x'], 'y']]],
          [
            { fromGroup: true, value: ['x'] },
            { fromGroup: true, value: 'y' },
          ],
        ),
        tc('an empty group contributes nothing', [[[], 'a', []]], [{ fromGroup: false, value: 'a' }]),
        tc(
          'numbers and null are plain values',
          [[1, null, [2]]],
          [
            { fromGroup: false, value: 1 },
            { fromGroup: false, value: null },
            { fromGroup: true, value: 2 },
          ],
        ),
        tc('empty input', [[]], []),
      ],
      title: 'Only real arrays spread',
      trap: code(`
interface Tagged {
  fromGroup: boolean;
  value: unknown;
}

export function solve(entries: unknown[]): Tagged[] {
  return entries.flatMap((entry): Tagged[] => {
    if (typeof entry === 'object' && entry !== null && 'length' in entry) {
      return Array.from(entry as ArrayLike<unknown>, (value) => ({ fromGroup: true, value }));
    }
    return [{ fromGroup: false, value: entry }];
  });
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'A workbook is a list of sheets, each sheet a list of rows, each row a list of `[label, amount]` pairs. ' +
        'Return every pair in the workbook in reading order, with the pairs themselves left intact.\n\n' +
        'Signature: `solve(workbook: [string, number][][][]): [string, number][]`\n\n' +
        '`flat` takes a depth — pick it deliberately, because both "too shallow" and "all the way" are wrong here.',
      difficulty: 'advanced',
      explanation:
        '`flat` peels exactly as many layers as its depth argument says — one by default — and the right number ' +
        'is a property of the data, not a matter of taste. Sheets contain rows and rows contain pairs, so two ' +
        'layers separate the workbook from the pairs: `flat(2)`. The default `flat()` stops one layer short and ' +
        'hands back rows still wrapped in their sheets. The opposite reflex, `flat(Infinity)`, reads as "just ' +
        'flatten it" and is the more damaging mistake: it cannot tell a structural layer from a data one, so it ' +
        'keeps going through the pairs and returns `["a", 1, "b", 2]` — labels and amounts scattered into a ' +
        'single list, the association lost. Whenever the leaves are themselves arrays (tuples, coordinates, RGB ' +
        'triples), reach for a counted depth and leave `Infinity` for structures whose leaves are guaranteed to ' +
        'be scalars.',
      id: 'flatten-to-the-pairs',
      methods: ['flat'],
      order: 8,
      solution: code(`
type Pair = [string, number];

export function solve(workbook: Pair[][][]): Pair[] {
  return workbook.flat(2);
}
`),
      starterCode: code(`
type Pair = [string, number];

export function solve(workbook: Pair[][][]): Pair[] {
  // Sheets → rows → pairs is two layers of brackets to remove; the pair is a third you must keep.
  return [];
}
`),
      tests: [
        tc(
          'two sheets flatten to a pair list (trap)',
          [
            [
              [
                [
                  ['a', 1],
                  ['b', 2],
                ],
              ],
              [[['c', 3]]],
            ],
          ],
          [
            ['a', 1],
            ['b', 2],
            ['c', 3],
          ],
        ),
        tc(
          'a sheet with several rows',
          [
            [
              [
                [['a', 1]],
                [
                  ['b', 2],
                  ['c', 3],
                ],
              ],
            ],
          ],
          [
            ['a', 1],
            ['b', 2],
            ['c', 3],
          ],
        ),
        tc('empty sheets and rows vanish', [[[], [[]], [[['z', 0]]]]], [['z', 0]]),
        tc('single pair stays a pair (trap)', [[[[['only', 9]]]]], [['only', 9]]),
        tc('empty workbook', [[]], []),
      ],
      title: 'Count the layers',
      trap: code(`
type Pair = [string, number];

export function solve(workbook: Pair[][][]): Pair[] {
  return workbook.flat(Infinity) as Pair[];
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Build the `[name, email]` pair for every person who has an email — one pair per person, people ' +
        'without an email dropped — in a single `flatMap` pass.\n\n' +
        'Signature: `solve(people: { email?: string; name: string }[]): [string, string][]`\n\n' +
        'Trap: the callback must return a *list of pairs*, and a pair is itself a list.',
      difficulty: 'advanced',
      explanation:
        "`flatMap` always removes exactly one layer from whatever the callback returns, so the callback's " +
        'return value must be *a list of the things you want in the output*. When the thing you want is itself ' +
        'an array — a `[name, email]` pair — returning the pair directly is the classic mistake: `flatMap` reads ' +
        'it as the list of results and splices `name` and `email` in as two separate strings, giving ' +
        '`["Ada", "ada@x", "Cy", "cy@x"]` with the pairing destroyed. Wrapping it, `[[person.name, person.email]]`, ' +
        'says "one result, and that result is a pair". The empty `[]` for people without an email is the drop ' +
        'idiom that makes `flatMap` a filter and a map in one traversal. Rule of thumb: the outer brackets ' +
        'belong to `flatMap`; count how many the output element needs and add those inside.',
      id: 'pairs-survive-flatmap',
      methods: ['flatMap'],
      order: 9,
      solution: code(`
interface Person {
  email?: string;
  name: string;
}

export function solve(people: Person[]): [string, string][] {
  return people.flatMap((person): [string, string][] =>
    person.email === undefined ? [] : [[person.name, person.email]],
  );
}
`),
      starterCode: code(`
interface Person {
  email?: string;
  name: string;
}

export function solve(people: Person[]): [string, string][] {
  // flatMap strips one layer of brackets from what you return — a pair needs one more around it.
  return [];
}
`),
      tests: [
        tc(
          'mixed list keeps pairs as pairs (trap)',
          [[{ email: 'ada@x', name: 'Ada' }, { name: 'Bo' }, { email: 'cy@x', name: 'Cy' }]],
          [
            ['Ada', 'ada@x'],
            ['Cy', 'cy@x'],
          ],
        ),
        tc(
          'everyone has an email',
          [
            [
              { email: 'a@x', name: 'A' },
              { email: 'b@x', name: 'B' },
            ],
          ],
          [
            ['A', 'a@x'],
            ['B', 'b@x'],
          ],
        ),
        tc('nobody has an email', [[{ name: 'A' }, { name: 'B' }]], []),
        tc('single person becomes a single pair (trap)', [[{ email: 'solo@x', name: 'Solo' }]], [['Solo', 'solo@x']]),
        tc('empty list', [[]], []),
      ],
      title: 'Keep the pair a pair',
      trap: code(`
interface Person {
  email?: string;
  name: string;
}

export function solve(people: Person[]): [string, string][] {
  return people.flatMap((person) => (person.email === undefined ? [] : [person.name, person.email])) as [
    string,
    string,
  ][];
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Insert `separator` between consecutive elements of `items` — between, never after the last one: ' +
        '`solve(["a", "b", "c"], "-")` → `["a", "-", "b", "-", "c"]`.\n\n' +
        'Signature: `solve(items: string[], separator: string): string[]`\n\n' +
        'Use one `flatMap` pass; its callback receives the index as its second argument.',
      difficulty: 'advanced',
      explanation:
        'The callback of `flatMap` receives `(element, index, array)`, and the index is what turns a uniform ' +
        'expansion into a positional one. Every element except the last contributes two results, ' +
        '`[item, separator]`; the last contributes only `[item]`, so `index < items.length - 1` is the whole ' +
        'decision. Dropping the index and returning `[item, separator]` for everyone plants a trailing separator ' +
        'after the final element — `["a", "-", "b", "-", "c", "-"]`. The usual patch, `slice(0, -1)`, does work, ' +
        'but it is a second pass over the data that exists only to undo what the first pass should never have ' +
        'done. `join` cannot help either: it produces a string, not an array. Positional `flatMap` is the shape ' +
        'for any "between, not after" rule — thousands separators, breadcrumb chevrons, comma-separated JSX.',
      id: 'intersperse-separator',
      methods: ['flatMap'],
      order: 10,
      solution: code(`
export function solve(items: string[], separator: string): string[] {
  return items.flatMap((item, index) => (index < items.length - 1 ? [item, separator] : [item]));
}
`),
      starterCode: code(`
export function solve(items: string[], separator: string): string[] {
  // Every element but the last contributes two results — the callback's second argument tells you which is last.
  return [];
}
`),
      tests: [
        tc('three items, two separators (trap)', [['a', 'b', 'c'], '-'], ['a', '-', 'b', '-', 'c']),
        tc('single item gets no separator (trap)', [['solo'], ','], ['solo']),
        tc('two items', [['x', 'y'], ' '], ['x', ' ', 'y']),
        tc('separator that equals an item', [['-', 'a'], '-'], ['-', '-', 'a']),
        tc('empty list stays empty', [[], '-'], []),
      ],
      title: 'Between, not after',
      trap: code(`
export function solve(items: string[], separator: string): string[] {
  return items.flatMap((item) => [item, separator]);
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Add `newcomers` to the end of `roster`, skipping anyone already on it, and return `[extended, roster]` ' +
        '— the second element is the roster you were given, which must still be in its original state.\n\n' +
        'Signature: `solve(roster: string[], newcomers: string[]): [string[], string[]]`\n\n' +
        '`concat` builds the extended list without touching the original; `push` is the trap.',
      difficulty: 'advanced',
      explanation:
        "`concat` never writes to its receiver: it allocates a new array, copies the receiver's elements, then " +
        'appends each argument — spreading arrays one level, appending anything else as-is — and returns that ' +
        'fresh array. That is what makes `roster.concat(newcomers.filter(...))` safe to hand back next to the ' +
        'original. The trap is not `push` itself but the belief that `const extended = roster` made a copy. It ' +
        'did not; both names point at one array, so `extended.push(...)` grows the roster you were given, and ' +
        'the second tuple element comes back already extended — the test sees ' +
        '`[["ada", "bob", "cy"], ["ada", "bob", "cy"]]`. `filter` with `includes` supplies the "skip anyone ' +
        'already present" rule before `concat` ever runs; on large rosters swap `includes` for a `Set` lookup, ' +
        'but the copying discipline is the lesson here.',
      id: 'extend-roster-intact',
      methods: ['concat', 'filter'],
      order: 11,
      solution: code(`
export function solve(roster: string[], newcomers: string[]): [string[], string[]] {
  const extended = roster.concat(newcomers.filter((name) => !roster.includes(name)));
  return [extended, roster];
}
`),
      starterCode: code(`
export function solve(roster: string[], newcomers: string[]): [string[], string[]] {
  // Assigning an array to a new name does not copy it — build the extended list with concat.
  return [roster, roster];
}
`),
      tests: [
        tc(
          'new names are appended, original untouched (trap)',
          [['ada', 'bob'], ['cy']],
          [
            ['ada', 'bob', 'cy'],
            ['ada', 'bob'],
          ],
        ),
        tc(
          'names already present are skipped (trap)',
          [
            ['ada', 'bob'],
            ['bob', 'di'],
          ],
          [
            ['ada', 'bob', 'di'],
            ['ada', 'bob'],
          ],
        ),
        tc('nothing new leaves both lists equal', [['ada'], ['ada']], [['ada'], ['ada']]),
        tc('empty roster takes everyone (trap)', [[], ['x', 'y']], [['x', 'y'], []]),
        tc(
          'no newcomers',
          [['a', 'b'], []],
          [
            ['a', 'b'],
            ['a', 'b'],
          ],
        ),
      ],
      title: 'Extend, do not push',
      trap: code(`
export function solve(roster: string[], newcomers: string[]): [string[], string[]] {
  const extended = roster;
  extended.push(...newcomers.filter((name) => !roster.includes(name)));
  return [extended, roster];
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Interleave two lists — first element of `a`, first of `b`, second of `a`, second of `b`, and so on. ' +
        'When one list runs out, the rest of the other follows in order.\n\n' +
        'Signature: `solve(a: number[], b: number[]): number[]`\n\n' +
        'Example: `solve([1, 2, 3], [10])` → `[1, 10, 2, 3]`. Drive the walk by the *longer* length and let ' +
        '`flatMap` emit one or two values per step.',
      difficulty: 'expert',
      explanation:
        "Neither input can drive the walk on its own — whichever you iterate, the other one's tail is " +
        'unreachable — so the walk is driven by a synthetic index list: ' +
        '`Array.from({ length: Math.max(a.length, b.length) }, ...)` yields one step per position in the longer ' +
        'list. Each step looks up both lists with `at(index)`, which returns `undefined` past the end instead of ' +
        'throwing, and `filter` with the `value is number` guard drops those gaps while keeping legitimate `0`s ' +
        '(a `filter(Boolean)` would eat them). `flatMap` then emits one or two values per step, which is exactly ' +
        'the elastic output `map` cannot express. The tempting `a.flatMap((x, i) => [x, b[i]])` fails in both ' +
        'directions: when `a` is longer it interleaves `undefined`s, and when `b` is longer it never sees ' +
        "`b`'s tail at all.",
      id: 'interleave-uneven-lists',
      methods: ['flatMap', 'Array.from', 'filter'],
      order: 12,
      solution: code(`
export function solve(a: number[], b: number[]): number[] {
  const steps = Math.max(a.length, b.length);
  return Array.from({ length: steps }, (_, index) => [a.at(index), b.at(index)]).flatMap((pair) =>
    pair.filter((value): value is number => value !== undefined),
  );
}
`),
      starterCode: code(`
export function solve(a: number[], b: number[]): number[] {
  // Walk max(a.length, b.length) steps; each step contributes whichever of a[i], b[i] exist.
  return [];
}
`),
      tests: [
        tc(
          'equal lengths alternate strictly',
          [
            [1, 2, 3],
            [10, 20, 30],
          ],
          [1, 10, 2, 20, 3, 30],
        ),
        tc('a longer than b (trap)', [[1, 2, 3], [10]], [1, 10, 2, 3]),
        tc('b longer than a (trap)', [[1], [10, 20, 30]], [1, 10, 20, 30]),
        tc('zero is a real value, not a gap', [[0], [0, 0]], [0, 0, 0]),
        tc('empty a yields b', [[], [7, 8]], [7, 8]),
        tc('both empty', [[], []], []),
      ],
      title: 'Interleave two lists',
      trap: code(`
export function solve(a: number[], b: number[]): number[] {
  return a.flatMap((value, index) => [value, b[index]]);
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Return the cartesian product of `lists`: every combination that takes one element from each list, in ' +
        'order — the first list varies slowest. `solve([[1, 2], ["a", "b"]])` → ' +
        '`[[1, "a"], [1, "b"], [2, "a"], [2, "b"]]`.\n\n' +
        'Signature: `solve(lists: (number | string)[][]): (number | string)[][]`\n\n' +
        'No lists at all yields `[[]]` (one empty combination); any empty list yields `[]`. Fold the lists, ' +
        'extending every combination so far with `flatMap`.',
      difficulty: 'expert',
      explanation:
        'The product grows one list at a time, and `reduce` is the loop that carries the partial combinations ' +
        'forward. For each incoming list, `flatMap` visits every combination built so far and `map` extends it ' +
        'by every item of the new list; because `flatMap` splices those extensions in, the accumulator stays a ' +
        'flat list of combinations rather than nesting one level deeper per step. The seed is the whole ' +
        'subtlety: it must be `[[]]` — one combination containing nothing — because that is the identity of ' +
        '"extend every combination". Seeding with `[]` looks harmless and is fatal: there is nothing to extend, ' +
        'so every step maps over nothing and the product of any input is `[]`. The identity also explains the ' +
        'edge cases for free: no lists returns the seed itself, and any empty list produces zero extensions, ' +
        'collapsing everything after it.',
      id: 'cartesian-product',
      methods: ['reduce', 'flatMap', 'map'],
      order: 13,
      solution: code(`
type Item = number | string;

export function solve(lists: Item[][]): Item[][] {
  return lists.reduce<Item[][]>(
    (combos, list) => combos.flatMap((combo) => list.map((item) => [...combo, item])),
    [[]],
  );
}
`),
      starterCode: code(`
type Item = number | string;

export function solve(lists: Item[][]): Item[][] {
  // Fold over lists: each step extends every combination so far by every item — mind the seed.
  return [];
}
`),
      tests: [
        tc(
          'two lists (trap)',
          [
            [
              [1, 2],
              ['a', 'b'],
            ],
          ],
          [
            [1, 'a'],
            [1, 'b'],
            [2, 'a'],
            [2, 'b'],
          ],
        ),
        tc(
          'three lists, first varies slowest',
          [[[1, 2], ['x'], [7, 8]]],
          [
            [1, 'x', 7],
            [1, 'x', 8],
            [2, 'x', 7],
            [2, 'x', 8],
          ],
        ),
        tc('a single list wraps each element', [[[1, 2, 3]]], [[1], [2], [3]]),
        tc('an empty list empties the product', [[[1, 2], []]], []),
        tc('an empty list first also empties it', [[[], [1]]], []),
        tc('no lists yields one empty combination (trap)', [[]], [[]]),
      ],
      title: 'Cartesian product',
      trap: code(`
type Item = number | string;

export function solve(lists: Item[][]): Item[][] {
  return lists.reduce<Item[][]>(
    (combos, list) => combos.flatMap((combo) => list.map((item) => [...combo, item])),
    [],
  );
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Return every subset of `xs` (the power set), built so that each element either skips or joins every ' +
        'subset seen so far. For `[1, 2]` the order is `[[], [1], [2], [1, 2]]`: the subsets without the new ' +
        'element come first, then the same subsets with it appended.\n\n' +
        'Signature: `solve(xs: number[]): number[][]`\n\n' +
        'Fold over `xs`, and use `concat` to glue the "without" half to the "with" half — without mutating either.',
      difficulty: 'expert',
      explanation:
        'Each element doubles the collection: every subset built so far either stays as it is or gains the new ' +
        'element, and the two halves are joined with `concat`. Because `concat` spreads an array argument one ' +
        'level, `subsets.concat(subsets.map(...))` appends each new subset as its own element rather than nesting ' +
        'the whole batch — the one-level rule working for you. `reduce` carries the collection through, and the ' +
        "seed `[[]]` is the empty set's single subset, which is also why `solve([])` is `[[]]` and not `[]`. The " +
        '"with" half must be built from *copies*: `[...subset, x]` allocates a fresh array per subset. Writing ' +
        '`subset.push(x); return subset` instead mutates the very arrays that make up the "without" half, so both ' +
        'halves end up sharing one object and every subset silently becomes the full set. Immutability here is ' +
        'not style — it is the difference between a power set and eight references to the same array.',
      id: 'power-set-via-concat',
      methods: ['reduce', 'concat', 'map'],
      order: 14,
      solution: code(`
export function solve(xs: number[]): number[][] {
  return xs.reduce<number[][]>((subsets, x) => subsets.concat(subsets.map((subset) => [...subset, x])), [[]]);
}
`),
      starterCode: code(`
export function solve(xs: number[]): number[][] {
  // Start from [[]]; for each x, concat the subsets so far with a COPY of each one plus x.
  return [];
}
`),
      tests: [
        tc('two elements (trap)', [[1, 2]], [[], [1], [2], [1, 2]]),
        tc(
          'three elements, without-then-with ordering',
          [[1, 2, 3]],
          [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]],
        ),
        tc('single element (trap)', [[5]], [[], [5]]),
        tc('duplicates are treated positionally', [[1, 1]], [[], [1], [1], [1, 1]]),
        tc('empty set has one subset', [[]], [[]]),
      ],
      title: 'Power set, without and with',
      trap: code(`
export function solve(xs: number[]): number[][] {
  return xs.reduce<number[][]>(
    (subsets, x) =>
      subsets.concat(
        subsets.map((subset) => {
          subset.push(x);
          return subset;
        }),
      ),
    [[]],
  );
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        "Flatten a tree into slash-separated paths in pre-order: each node's own path comes first, followed by " +
        'the paths of its descendants, depth-first. ' +
        '`solve([{ children: [{ children: [], name: "b" }], name: "a" }, { children: [], name: "c" }])` → ' +
        '`["a", "a/b", "c"]`.\n\n' +
        'Signature: `solve(nodes: TreeNode[]): string[]` where `interface TreeNode { children: TreeNode[]; name: string }`\n\n' +
        'A recursive `flatMap` — each node contributes itself plus its prefixed subtree.',
      difficulty: 'expert',
      explanation:
        'A tree has no fixed depth, so no counted `flat(n)` can flatten it, and `flat(Infinity)` would destroy ' +
        'the node objects rather than read them. Recursion supplies the depth: `solve(node.children)` returns ' +
        "the subtree's paths, `map` prefixes each with the parent's name, and `flatMap` splices every node's " +
        'contribution — its own name first, then the prefixed subtree — into one list. Order falls out of ' +
        "evaluation order: because the node's name is placed before the spread of its descendants, and siblings " +
        'are visited left to right, the result is exactly a pre-order depth-first traversal, with `"c"` arriving ' +
        'only after all of `"a"`\'s descendants. Leaves recurse into an empty `children` array, which `flatMap` ' +
        'turns into no contribution at all, so the recursion bottoms out without a special case. The same shape ' +
        'flattens comment threads, menus, and file systems.',
      id: 'tree-to-paths',
      methods: ['flatMap', 'map'],
      order: 15,
      solution: code(`
interface TreeNode {
  children: TreeNode[];
  name: string;
}

export function solve(nodes: TreeNode[]): string[] {
  return nodes.flatMap((node) => [node.name, ...solve(node.children).map((path) => \`\${node.name}/\${path}\`)]);
}
`),
      starterCode: code(`
interface TreeNode {
  children: TreeNode[];
  name: string;
}

export function solve(nodes: TreeNode[]): string[] {
  // Each node contributes [its name, ...its children's paths prefixed with "name/"] — recurse for the children.
  return [];
}
`),
      tests: [
        tc(
          'a nested chain',
          [[{ children: [{ children: [{ children: [], name: 'c' }], name: 'b' }], name: 'a' }]],
          ['a', 'a/b', 'a/b/c'],
        ),
        tc(
          'siblings come after descendants (pre-order)',
          [
            [
              { children: [{ children: [], name: 'b' }], name: 'a' },
              { children: [], name: 'c' },
            ],
          ],
          ['a', 'a/b', 'c'],
        ),
        tc(
          'a wide node lists its children in order',
          [
            [
              {
                children: [
                  { children: [], name: 'x' },
                  { children: [], name: 'y' },
                ],
                name: 'r',
              },
            ],
          ],
          ['r', 'r/x', 'r/y'],
        ),
        tc(
          'mixed depths keep depth-first order',
          [
            [
              {
                children: [
                  { children: [{ children: [], name: 'd' }], name: 'b' },
                  { children: [], name: 'c' },
                ],
                name: 'a',
              },
            ],
          ],
          ['a', 'a/b', 'a/b/d', 'a/c'],
        ),
        tc(
          'leaves only',
          [
            [
              { children: [], name: 'a' },
              { children: [], name: 'b' },
            ],
          ],
          ['a', 'b'],
        ),
        tc('empty forest', [[]], []),
      ],
      title: 'Flatten a tree into paths',
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Invert an index. `index` maps each tag to the ids of the posts carrying it; return the reverse map from ' +
        'post id to its tags, tags in the order the input listed them. `solve({ js: [1, 2], ts: [2] })` → ' +
        '`{ 1: ["js"], 2: ["js", "ts"] }`.\n\n' +
        'Signature: `solve(index: Record<string, number[]>): Record<number, string[]>`\n\n' +
        'Trap: a post with two tags produces two `[id, tag]` pairs, and `Object.fromEntries` keeps only one of them.',
      difficulty: 'expert',
      explanation:
        'Inverting a one-to-many map is a three-step composition. `Object.entries` turns the record into ' +
        '`[tag, ids]` pairs; `flatMap` with an inner `map` explodes each pair into one `[id, tag]` pair per post ' +
        '— the flattening is essential, because a plain `map` would leave one nested list per tag. The last step ' +
        'is where the trap lives. `Object.fromEntries` is the reflex for "pairs back into an object", but it ' +
        'assigns keys in order and *overwrites* on repeats, so a post tagged both `js` and `ts` keeps only ' +
        'whichever tag came last. The reverse map is itself one-to-many, so the pairs must be *grouped*, not ' +
        'assigned: `reduce` appends each tag to the list already collected under its id, creating the list on ' +
        'first sight. The pairs arrive in input order, so the grouped tags preserve it. (`Object.groupBy` is the ' +
        'ES2024 shortcut for that final step.)',
      id: 'invert-tag-index',
      methods: ['flatMap', 'map', 'reduce', 'Object.entries'],
      order: 16,
      solution: code(`
export function solve(index: Record<string, number[]>): Record<number, string[]> {
  return Object.entries(index)
    .flatMap(([tag, ids]) => ids.map((id): [number, string] => [id, tag]))
    .reduce<Record<number, string[]>>((inverted, [id, tag]) => {
      inverted[id] = [...(inverted[id] ?? []), tag];
      return inverted;
    }, {});
}
`),
      starterCode: code(`
export function solve(index: Record<string, number[]>): Record<number, string[]> {
  // Explode the entries into [id, tag] pairs with flatMap, then GROUP the pairs by id — do not fromEntries them.
  return {};
}
`),
      tests: [
        tc('a post with two tags keeps both (trap)', [{ js: [1, 2], ts: [2] }], { 1: ['js'], 2: ['js', 'ts'] }),
        tc('three tags on one post (trap)', [{ x: [9], y: [9], z: [9] }], { 9: ['x', 'y', 'z'] }),
        tc('tag order follows input order, not alphabetical', [{ zeta: [1], alpha: [1] }], { 1: ['zeta', 'alpha'] }),
        tc('tags with no shared posts', [{ a: [1], b: [2] }], { 1: ['a'], 2: ['b'] }),
        tc('a tag with no posts contributes nothing', [{ a: [], b: [3] }], { 3: ['b'] }),
        tc('empty index', [{}], {}),
      ],
      title: 'Invert a tag index',
      trap: code(`
export function solve(index: Record<string, number[]>): Record<number, string[]> {
  return Object.fromEntries(Object.entries(index).flatMap(([tag, ids]) => ids.map((id) => [id, [tag]])));
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Each entry carries its tags as one comma-separated string typed by humans: stray spaces, mixed case, ' +
        'and empty slots like `"a,,b"`. Return the distinct tags across all entries — trimmed, lower-cased, ' +
        'empties dropped — in first-seen order.\n\n' +
        'Signature: `solve(entries: { tags: string }[]): string[]`\n\n' +
        'Trap: normalise *before* you deduplicate, or `"JS"` and `" js"` survive as two tags.',
      difficulty: 'expert',
      explanation:
        'Five small transformations, and the order of two of them decides correctness. `flatMap` with ' +
        '`split(",")` turns every entry\'s tag string into individual tags and merges them into one stream in one ' +
        'pass — the map-then-flatten that would otherwise need an intermediate array of arrays. `map` normalises ' +
        'each tag with `trim().toLowerCase()`, `filter` discards the empties that `"a,,b"` and trailing commas ' +
        'produce, and spreading a `Set` deduplicates while preserving first-seen order. The trap is tempting ' +
        'because it uses every one of those steps too: deduplicate first, then normalise. But a `Set` compares ' +
        'strings exactly, so `"JS"`, `" js"` and `"js"` are three members going in, and after normalisation they ' +
        'are three copies of `"js"` coming out. Any pipeline that dedupes must dedupe the *canonical* form, which ' +
        'means normalisation goes first. The same rule governs trimming emails, slugifying titles, and ' +
        'case-folding usernames.',
      id: 'normalise-tag-strings',
      methods: ['flatMap', 'split', 'map', 'filter'],
      order: 17,
      solution: code(`
interface Entry {
  tags: string;
}

export function solve(entries: Entry[]): string[] {
  const normalised = entries
    .flatMap((entry) => entry.tags.split(','))
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '');
  return [...new Set(normalised)];
}
`),
      starterCode: code(`
interface Entry {
  tags: string;
}

export function solve(entries: Entry[]): string[] {
  // flatMap the split tags into one stream, normalise each, drop empties, THEN dedupe with a Set.
  return [];
}
`),
      tests: [
        tc(
          'case and spacing variants collapse to one tag (trap)',
          [[{ tags: 'JS, ts' }, { tags: 'js' }]],
          ['js', 'ts'],
        ),
        tc('a repeated tag with a leading space (trap)', [[{ tags: 'a, a' }]], ['a']),
        tc('first-seen order is kept', [[{ tags: 'b,a' }, { tags: 'a,c' }]], ['b', 'a', 'c']),
        tc('empty slots are dropped', [[{ tags: 'a,,b,' }]], ['a', 'b']),
        tc('whitespace-only slot is dropped', [[{ tags: 'a, ,b' }]], ['a', 'b']),
        tc('empty tag string contributes nothing', [[{ tags: '' }]], []),
        tc('no entries', [[]], []),
      ],
      title: 'Normalise, then dedupe',
      trap: code(`
interface Entry {
  tags: string;
}

export function solve(entries: Entry[]): string[] {
  const unique = [...new Set(entries.flatMap((entry) => entry.tags.split(',')))];
  return unique.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag !== '');
}
`),
    },
    {
      categoryId: 'flattening-and-composing',
      description:
        'Produce one row per order, joined to its customer as `{ customer: name, total }`: rows grouped by ' +
        'customer in `customers` order and, within a customer, in `orders` order. Customers with no orders ' +
        'produce no rows; orders whose `customerId` matches nobody are dropped.\n\n' +
        'Signature: `solve(customers: { id: number; name: string }[], orders: { customerId: number; total: number }[]): ' +
        '{ customer: string; total: number }[]`\n\n' +
        'Trap: a customer can have many orders — `find` returns one.',
      difficulty: 'expert',
      explanation:
        'A one-to-many join is `flatMap` over the "one" side: each customer contributes as many rows as they ' +
        'have orders — possibly none — and `flatMap` splices those variable-length contributions into one flat ' +
        'result, which is precisely what `map` cannot do without leaving a nested array per customer. Inside, ' +
        "`filter` selects the customer's orders and `map` shapes each into a row; nesting them keeps the output " +
        'grouped by customer and ordered by the input lists. The trap is `find`: it reads naturally ("find the ' +
        'customer\'s order") and returns the *first* match, silently collapsing a customer with three orders to ' +
        "one row — no error, just missing revenue. Unmatched orders never surface because no customer's " +
        '`filter` claims them, and unmatched customers contribute `[]`. This nested scan is ' +
        'O(customers × orders); for large tables, group the orders once with ' +
        '`Map.groupBy(orders, (o) => o.customerId)` and look each customer up in O(1).',
      id: 'join-orders-to-customers',
      methods: ['flatMap', 'filter', 'map'],
      order: 18,
      solution: code(`
interface Customer {
  id: number;
  name: string;
}

interface Order {
  customerId: number;
  total: number;
}

interface Row {
  customer: string;
  total: number;
}

export function solve(customers: Customer[], orders: Order[]): Row[] {
  return customers.flatMap((customer) =>
    orders
      .filter((order) => order.customerId === customer.id)
      .map((order) => ({ customer: customer.name, total: order.total })),
  );
}
`),
      starterCode: code(`
interface Customer {
  id: number;
  name: string;
}

interface Order {
  customerId: number;
  total: number;
}

interface Row {
  customer: string;
  total: number;
}

export function solve(customers: Customer[], orders: Order[]): Row[] {
  // flatMap over customers; inside, filter that customer's orders and map each to a row.
  return [];
}
`),
      tests: [
        tc(
          'a customer with two orders yields two rows (trap)',
          [
            [
              { id: 1, name: 'Ada' },
              { id: 2, name: 'Bo' },
            ],
            [
              { customerId: 1, total: 10 },
              { customerId: 2, total: 5 },
              { customerId: 1, total: 7 },
            ],
          ],
          [
            { customer: 'Ada', total: 10 },
            { customer: 'Ada', total: 7 },
            { customer: 'Bo', total: 5 },
          ],
        ),
        tc(
          'customers without orders produce no rows',
          [
            [
              { id: 1, name: 'Ada' },
              { id: 2, name: 'Bo' },
            ],
            [{ customerId: 2, total: 3 }],
          ],
          [{ customer: 'Bo', total: 3 }],
        ),
        tc(
          'orders for unknown customers are dropped',
          [
            [{ id: 1, name: 'Ada' }],
            [
              { customerId: 9, total: 1 },
              { customerId: 1, total: 2 },
            ],
          ],
          [{ customer: 'Ada', total: 2 }],
        ),
        tc(
          'rows follow customer order, not order order',
          [
            [
              { id: 2, name: 'Bo' },
              { id: 1, name: 'Ada' },
            ],
            [
              { customerId: 1, total: 1 },
              { customerId: 2, total: 2 },
            ],
          ],
          [
            { customer: 'Bo', total: 2 },
            { customer: 'Ada', total: 1 },
          ],
        ),
        tc('no orders at all', [[{ id: 1, name: 'Ada' }], []], []),
        tc('no customers', [[], [{ customerId: 1, total: 1 }]], []),
      ],
      title: 'One-to-many join',
      trap: code(`
interface Customer {
  id: number;
  name: string;
}

interface Order {
  customerId: number;
  total: number;
}

interface Row {
  customer: string;
  total: number;
}

export function solve(customers: Customer[], orders: Order[]): Row[] {
  return customers.flatMap((customer) => {
    const order = orders.find((candidate) => candidate.customerId === customer.id);
    return order === undefined ? [] : [{ customer: customer.name, total: order.total }];
  });
}
`),
    },
  ],
};
