import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const accessAndSearch: CategoryModule = {
  category: {
    description:
      'Read elements by position and hunt for values — from either end of the array, past the NaN trap, and across every occurrence.',
    id: 'access-and-search',
    order: 2,
    title: 'Access & Search',
  },
  challenges: [
    {
      categoryId: 'access-and-search',
      description:
        'Return a two-element array holding the last element of `values` and the `k`-th element counting from the end ' +
        '(`k` of 1 is the last element). Out-of-range positions yield `undefined`.\n\n' +
        'Signature: `solve(values: number[], k: number): (number | undefined)[]`\n\n' +
        'Hint: `values[-1]` is NOT the last element — why?',
      difficulty: 'novice',
      explanation:
        '`at` accepts negative indices and counts backwards from the end, so `values.at(-1)` is the last element and ' +
        '`values.at(-k)` is the k-th from the end. Bracket indexing cannot do this: `values[-1]` looks up a property ' +
        'literally named `"-1"`, which arrays never define, so it silently yields `undefined`. Before `at`, the idiom ' +
        'was `values[values.length - 1]` — correct, but it repeats the array expression and breaks on chained calls ' +
        'that have no variable to reference. `at` also returns `undefined` (rather than throwing) when the position ' +
        'is out of range, which is why the empty-array case needs no special handling.',
      id: 'last-and-kth-from-end',
      methods: ['at'],
      order: 1,
      solution: code(`
export function solve(values: number[], k: number): (number | undefined)[] {
  return [values.at(-1), values.at(-k)];
}
`),
      starterCode: code(`
export function solve(values: number[], k: number): (number | undefined)[] {
  // values[-1] reads a property named '-1' — one method counts from the end for real.
  return [];
}
`),
      tests: [
        tc('last and second from end', [[10, 20, 30, 40], 2], [40, 30]),
        tc('k of one duplicates the last element', [[5, 6, 7], 1], [7, 7]),
        tc('k beyond the length yields undefined', [[1, 2], 5], [2, undefined]),
        tc('empty array yields two undefined', [[], 1], [undefined, undefined]),
      ],
      title: 'Counting from the end',
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return the first user whose `role` matches the requested role, or `null` when nobody matches.\n\n' +
        'Signature: `solve(users: { name: string; role: string }[], role: string): { name: string; role: string } | null`\n\n' +
        'Trap: the search method reports a miss with `undefined`, but this challenge wants `null`.',
      difficulty: 'novice',
      explanation:
        '`find` walks the array in order, runs the predicate on each element, and returns the *first element* that ' +
        'satisfies it — stopping immediately, so later users are never inspected. Its sibling `findIndex` returns the ' +
        'first matching *position* instead (`-1` on a miss); reach for it when you need to splice or replace rather ' +
        'than read. On a miss `find` returns `undefined`, and `?? null` converts exactly that into the `null` this ' +
        'challenge asks for — nullish coalescing only fires on `null`/`undefined`, so a legitimately found user is ' +
        'never replaced.',
      id: 'first-user-with-role',
      methods: ['find', 'findIndex'],
      order: 2,
      solution: code(`
interface User {
  name: string;
  role: string;
}

export function solve(users: User[], role: string): User | null {
  return users.find((user) => user.role === role) ?? null;
}
`),
      starterCode: code(`
interface User {
  name: string;
  role: string;
}

export function solve(users: User[], role: string): User | null {
  // find() hands back undefined on a miss — the signature promises null.
  return null;
}
`),
      tests: [
        tc(
          'finds the first admin',
          [
            [
              { name: 'Ada', role: 'admin' },
              { name: 'Linus', role: 'user' },
              { name: 'Grace', role: 'admin' },
            ],
            'admin',
          ],
          { name: 'Ada', role: 'admin' },
        ),
        tc(
          'finds a match in the middle',
          [
            [
              { name: 'Sam', role: 'user' },
              { name: 'Kim', role: 'editor' },
            ],
            'editor',
          ],
          { name: 'Kim', role: 'editor' },
        ),
        tc('returns null when no role matches', [[{ name: 'Sam', role: 'user' }], 'admin'], null),
        tc('empty user list', [[], 'admin'], null),
      ],
      title: 'First user with a role',
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return `true` when `needle` occurs anywhere in `values`, `false` otherwise — and the needle may be `NaN`.\n\n' +
        'Signature: `solve(values: number[], needle: number): boolean`\n\n' +
        'Trap: the starter code looks reasonable and passes four of the five tests. Which one does it miss, and why?',
      difficulty: 'intermediate',
      explanation:
        '`includes` compares with the SameValueZero algorithm, under which `NaN` equals `NaN` (and `+0` equals `-0`), ' +
        'so `values.includes(NaN)` genuinely finds a stored `NaN`. `indexOf` compares with strict equality (`===`), ' +
        'and `NaN === NaN` is famously `false` — so `values.indexOf(NaN)` returns `-1` no matter what the array ' +
        'holds. That single difference is why `includes(x)` is the correct membership test while ' +
        '`indexOf(x) !== -1` is a subtle bug whenever `NaN` can appear: parsed user input, failed `Math` operations, ' +
        'and holes in numeric data all produce it.',
      id: 'membership-despite-nan',
      methods: ['includes', 'indexOf'],
      order: 3,
      solution: code(`
export function solve(values: number[], needle: number): boolean {
  return values.includes(needle);
}
`),
      starterCode: code(`
export function solve(values: number[], needle: number): boolean {
  // Four tests pass... but NaN === NaN is false, and indexOf uses ===.
  return values.indexOf(needle) !== -1;
}
`),
      tests: [
        tc('finds an ordinary number', [[1, 2, 3], 2], true),
        tc('missing number', [[1, 2, 3], 9], false),
        tc('finds NaN', [[1, NaN, 3], NaN], true),
        tc('no NaN hiding in the values', [[1, 2], NaN], false),
        tc('empty array holds nothing', [[], 7], false),
      ],
      title: 'Membership despite NaN',
    },
    {
      categoryId: 'access-and-search',
      description:
        'Sensor readings arrive oldest-first. Return the most recent reading strictly below `threshold`, or `null` ' +
        'when no reading qualifies.\n\n' +
        'Signature: `solve(readings: number[], threshold: number): number | null`\n\n' +
        'Constraint: search from the end — do not reverse the array.',
      difficulty: 'intermediate',
      explanation:
        '`findLast` (ES2023) is `find` mirrored: it walks from the last index towards `0` and returns the first ' +
        'element the predicate accepts — which, read in array order, is the *last* match. That makes “most recent ' +
        'entry satisfying X” a one-liner with no `reverse()` (which mutates and copies) and no manual backwards ' +
        '`for` loop. On a miss it returns `undefined`, so `?? null` adapts it to this signature. Note the ' +
        'zero-reading test: `??` leaves a found `0` alone because `0` is not nullish — using `||` there would be ' +
        'a bug.',
      id: 'latest-reading-below-threshold',
      methods: ['findLast'],
      order: 4,
      solution: code(`
export function solve(readings: number[], threshold: number): number | null {
  return readings.findLast((reading) => reading < threshold) ?? null;
}
`),
      starterCode: code(`
export function solve(readings: number[], threshold: number): number | null {
  // find() returns the OLDEST match — a 2023 sibling searches from the end.
  return null;
}
`),
      tests: [
        tc('latest reading below the limit', [[80, 42, 95, 37, 99], 50], 37),
        tc('single match early in the list', [[10, 90, 91], 50], 10),
        tc('no reading qualifies', [[70, 80], 50], null),
        tc('zero is a real reading, not a miss', [[5, 0, 88], 50], 0),
        tc('empty readings', [[], 50], null),
      ],
      title: 'Latest reading below threshold',
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return the index of every occurrence of `target` in `values`, in ascending order.\n\n' +
        'Signature: `solve(values: number[], target: number): number[]`\n\n' +
        'Constraint: use `indexOf` with its second parameter (`fromIndex`) to resume each search where the previous ' +
        'one left off — no per-element scanning with `filter` or `forEach`.',
      difficulty: 'advanced',
      explanation:
        '`indexOf` takes a second argument, `fromIndex`, that tells it where to start looking — everything before it ' +
        'is ignored. That turns a single-hit method into a cursor: find the first occurrence, record it, then call ' +
        '`indexOf(target, position + 1)` to hunt strictly *after* the previous hit. The `+ 1` is the load-bearing ' +
        'part — resuming at `position` itself would rediscover the same element forever, an infinite loop. When ' +
        '`indexOf` finally returns `-1` the cursor has walked off the end and the loop stops. The same fromIndex ' +
        'pattern powers `lastIndexOf` (scanning backwards) and `String.prototype.indexOf`.',
      id: 'all-indices-of-target',
      methods: ['indexOf'],
      order: 5,
      solution: code(`
export function solve(values: number[], target: number): number[] {
  const indices: number[] = [];
  let position = values.indexOf(target);
  while (position !== -1) {
    indices.push(position);
    position = values.indexOf(target, position + 1);
  }
  return indices;
}
`),
      starterCode: code(`
export function solve(values: number[], target: number): number[] {
  // indexOf(target, fromIndex) resumes the hunt — restart just past each hit.
  return [];
}
`),
      tests: [
        tc('several occurrences', [[7, 1, 7, 3, 7], 7], [0, 2, 4]),
        tc('single occurrence', [[1, 2, 3], 2], [1]),
        tc('absent value', [[1, 2, 3], 9], []),
        tc('adjacent duplicates', [[4, 4, 4], 4], [0, 1, 2]),
        tc('empty array', [[], 1], []),
      ],
      title: 'Every index of a value',
      trap: code(`
export function solve(values: number[], target: number): number[] {
  const position = values.indexOf(target);
  return position === -1 ? [] : [position];
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return the index of the last occurrence of `target` that sits strictly before position `cutoff` in ' +
        '`values`, or `-1` when there is none. `cutoff` is a position counted from the front, so a `cutoff` of `0` ' +
        'means nothing qualifies.\n\n' +
        'Signature: `solve(values: number[], target: number, cutoff: number): number`\n\n' +
        '`lastIndexOf` takes a `fromIndex` — read the fine print on what a negative one means.',
      difficulty: 'advanced',
      explanation:
        '`lastIndexOf` scans backwards, and its second argument, `fromIndex`, is the position the scan *starts* ' +
        'from — inclusive. To find the last occurrence strictly before `cutoff`, start the scan at `cutoff - 1`; ' +
        'every element from there down to `0` is a candidate. The trap is what that arithmetic produces when ' +
        '`cutoff` is `0`: `fromIndex` becomes `-1`, and a negative `fromIndex` does not mean "before the start" — ' +
        'it counts from the *end*, so `-1` means "start at the last element" and the search silently covers the ' +
        'whole array. The reference solution guards `cutoff <= 0` and returns `-1` before `lastIndexOf` ever sees ' +
        'a negative number. A `fromIndex` past the end is harmless — `lastIndexOf` clamps it to the last index. ' +
        '`indexOf` and `includes` share the negative-counts-from-the-end rule, so the guard applies whenever a ' +
        'computed `fromIndex` can dip below zero.',
      id: 'last-occurrence-before-cutoff',
      methods: ['lastIndexOf'],
      order: 6,
      solution: code(`
export function solve(values: number[], target: number, cutoff: number): number {
  if (cutoff <= 0) {
    return -1;
  }
  return values.lastIndexOf(target, cutoff - 1);
}
`),
      starterCode: code(`
export function solve(values: number[], target: number, cutoff: number): number {
  // lastIndexOf(target, fromIndex) scans backwards from fromIndex — mind what cutoff - 1 becomes at zero.
  return -1;
}
`),
      tests: [
        tc('last occurrence before the cutoff', [[2, 7, 2, 9, 2], 2, 4], 2),
        tc('occurrence at the cutoff itself is excluded', [[1, 5, 1], 1, 2], 0),
        tc('cutoff of zero finds nothing (trap)', [[3, 1, 3], 3, 0], -1),
        tc('cutoff beyond the end searches the whole array', [[4, 4], 4, 10], 1),
        tc('target only appears after the cutoff', [[1, 2, 3, 2], 2, 1], -1),
        tc('empty array', [[], 1, 3], -1),
      ],
      title: 'Last occurrence before a cutoff',
      trap: code(`
export function solve(values: number[], target: number, cutoff: number): number {
  return values.lastIndexOf(target, cutoff - 1);
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'A car park is an array of bays: each holds a licence plate, or `undefined` when the bay is empty. Return ' +
        '`true` when the car with plate `plate` can park at bay `from` or later — because a bay there is empty, or ' +
        'because that car is already parked there — and `false` otherwise.\n\n' +
        'Signature: `solve(bays: (string | undefined)[], plate: string, from: number): boolean`\n\n' +
        'Trap: `find` reports "nothing matched" with `undefined` — the very value an empty bay holds.',
      difficulty: 'advanced',
      explanation:
        '`find` has one return channel: it hands back the matching element and signals a miss with `undefined`. ' +
        'When the element you are looking for can itself *be* `undefined` — an empty bay here — the two outcomes ' +
        'are indistinguishable, so `find(...) !== undefined` reports `false` for a car park full of empty bays. ' +
        '`findIndex` runs the same predicate but answers with a position, and a position has a miss value (`-1`) ' +
        'that no real element can collide with; `!== -1` is the honest membership test whenever the sought element ' +
        "may be nullish. The predicate also uses the callback's second argument, the index, to enforce " +
        '`index >= from` without slicing a copy first. The same collision bites `findLast` versus `findLastIndex`, ' +
        'and it is why `includes` exists alongside `indexOf`: methods that return an index or a boolean never ' +
        'confuse a found `undefined` with nothing found.',
      id: 'found-but-undefined',
      methods: ['findIndex', 'find'],
      order: 7,
      solution: code(`
export function solve(bays: (string | undefined)[], plate: string, from: number): boolean {
  return bays.findIndex((bay, index) => index >= from && (bay === undefined || bay === plate)) !== -1;
}
`),
      starterCode: code(`
export function solve(bays: (string | undefined)[], plate: string, from: number): boolean {
  // find() cannot tell "found an empty bay" from "found nothing" — a sibling answers with a position.
  return false;
}
`),
      tests: [
        tc('an empty bay after from (trap)', [['AB1', undefined, 'CD2'], 'ZZ9', 1], true),
        tc('the car is already parked', [['AB1', 'CD2'], 'CD2', 0], true),
        tc('every bay from there on is taken', [[undefined, 'AB1', 'CD2'], 'ZZ9', 1], false),
        tc('an empty bay before from does not count', [[undefined, 'AB1'], 'ZZ9', 1], false),
        tc('from beyond the last bay', [['AB1'], 'AB1', 5], false),
        tc('no bays at all', [[], 'AB1', 0], false),
      ],
      title: 'Found, but undefined',
      trap: code(`
export function solve(bays: (string | undefined)[], plate: string, from: number): boolean {
  return bays.find((bay, index) => index >= from && (bay === undefined || bay === plate)) !== undefined;
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Sensor readings that failed to parse are stored as `NaN`. Return the index of the LAST failed reading in ' +
        '`readings`, or `-1` when every reading is a real number.\n\n' +
        'Signature: `solve(readings: number[]): number`\n\n' +
        'Trap: `lastIndexOf(NaN)` is `-1` for every array ever created — work out why before reaching for it.',
      difficulty: 'advanced',
      explanation:
        '`lastIndexOf` compares with strict equality, and `NaN === NaN` is `false` — the one value in JavaScript ' +
        'that is not equal to itself. So `readings.lastIndexOf(NaN)` compares every element against a value ' +
        'nothing can match and returns `-1` regardless of the data; `indexOf` is blind in the same way. `includes` ' +
        'fixed membership by switching to SameValueZero, but it only answers yes or no. To get the *position* of a ' +
        '`NaN` you need a predicate, and `findLastIndex` (ES2023) is the backwards-scanning method that takes one: ' +
        'it returns the last index the predicate accepts, or `-1`. `Number.isNaN` is the right test rather than the ' +
        'global `isNaN`, which coerces first and would call a string "not a number" too. Rule of thumb: ' +
        'equality-based searches (`indexOf`, `lastIndexOf`) cannot see `NaN`; reach for the predicate-based siblings ' +
        '(`findIndex`, `findLastIndex`) whenever it can appear.',
      id: 'last-nan-position',
      methods: ['findLastIndex', 'lastIndexOf'],
      order: 8,
      solution: code(`
export function solve(readings: number[]): number {
  return readings.findLastIndex((reading) => Number.isNaN(reading));
}
`),
      starterCode: code(`
export function solve(readings: number[]): number {
  // NaN !== NaN, and lastIndexOf compares with === — a predicate-based sibling can see it.
  return readings.lastIndexOf(NaN);
}
`),
      tests: [
        tc('last of several failed readings (trap)', [[NaN, 4, NaN, 7]], 2),
        tc('single failed reading (trap)', [[1, NaN, 3]], 1),
        tc('failed reading at the very end', [[5, NaN]], 1),
        tc('all readings valid', [[1, 2, 3]], -1),
        tc('infinity is a number, not a failure', [[Infinity, 2]], -1),
        tc('empty readings', [[]], -1),
      ],
      title: 'The NaN that lastIndexOf cannot see',
      trap: code(`
export function solve(readings: number[]): number {
  return readings.lastIndexOf(NaN);
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return the element `offset` positions before the end of `values`: an `offset` of `0` is the last element, ' +
        '`1` is the one before it, and so on. Offsets that reach past the front yield `undefined`.\n\n' +
        'Signature: `solve(values: number[], offset: number): number | undefined`\n\n' +
        'Trap: `-offset` looks like the right index for `at` — until `offset` is `0`.',
      difficulty: 'advanced',
      explanation:
        '`at` counts backwards from `-1`, not from `0`: `at(-1)` is the last element and `at(-2)` the one before, ' +
        'so "`offset` before the end" is `at(-1 - offset)`. The tempting `at(-offset)` is off by one everywhere, ' +
        'and at `offset = 0` it fails in a way that is easy to miss: `-0` is a real value in JavaScript, but `at` ' +
        'converts its argument to an integer and `-0` becomes `0`, so `values.at(-0)` returns the *first* element ' +
        'with no error at all. Every other offset lands one slot too close to the end, which is why the trap is ' +
        'wrong on every input except an empty one. The `-1 - offset` form also handles the out-of-range case for ' +
        'free: once the index drops below `-values.length`, `at` returns `undefined` rather than throwing or ' +
        'wrapping around, so no length guard is needed.',
      id: 'offset-from-the-end',
      methods: ['at'],
      order: 9,
      solution: code(`
export function solve(values: number[], offset: number): number | undefined {
  return values.at(-1 - offset);
}
`),
      starterCode: code(`
export function solve(values: number[], offset: number): number | undefined {
  // at() counts backwards from -1, not from -0 — what index is "zero before the end"?
  return undefined;
}
`),
      tests: [
        tc('offset zero is the last element (trap)', [[1, 2, 3], 0], 3),
        tc('offset one is the second-last', [[1, 2, 3], 1], 2),
        tc('offset reaching the first element', [[4, 5, 6], 2], 4),
        tc('offset past the front yields undefined', [[4, 5], 2], undefined),
        tc('single element at offset zero', [[9], 0], 9),
        tc('empty array yields undefined', [[], 0], undefined),
      ],
      title: 'Minus zero is zero',
      trap: code(`
export function solve(values: number[], offset: number): number | undefined {
  return values.at(-offset);
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return the index of the first element in `values` that has already appeared earlier in the array — the ' +
        'first *repeat*, not the first element that will be repeated later. Return `-1` when every value is ' +
        'unique.\n\n' +
        'Signature: `solve(values: number[]): number`\n\n' +
        'Example: `solve([3, 1, 3, 1])` → `2`. Compose `findIndex` with `indexOf`.',
      difficulty: 'advanced',
      explanation:
        '`indexOf(value)` returns the *first* index that holds `value`, so for an element at position `index`, ' +
        '`values.indexOf(value) !== index` is true exactly when an earlier copy exists — the first occurrence claims ' +
        'its own index, and every later copy sees a smaller one. Feeding that test to `findIndex` walks left to ' +
        'right and stops at the first element that fails to be its own first occurrence: the first repeat. The ' +
        'tempting inversion, `indexOf(value, index + 1) !== -1`, asks "does this value show up again later?" and ' +
        'returns the first element that has a twin *ahead* of it — the first repeater. For `[5, 8, 8, 5]` that is ' +
        'index `0`, while the first repeat is index `2`. Both are searches, but they answer different questions. ' +
        'This nested scan is O(n²); a `Set` of seen values makes it linear, at the cost of the one-liner.',
      id: 'first-repeated-value',
      methods: ['findIndex', 'indexOf'],
      order: 10,
      solution: code(`
export function solve(values: number[]): number {
  return values.findIndex((value, index) => values.indexOf(value) !== index);
}
`),
      starterCode: code(`
export function solve(values: number[]): number {
  // indexOf finds the FIRST home of a value — compare it with the index findIndex hands you.
  return -1;
}
`),
      tests: [
        tc('first repeat, not first repeater (trap)', [[3, 1, 3, 1]], 2),
        tc('a later pair can still hold the first repeat (trap)', [[5, 8, 8, 5]], 2),
        tc('adjacent duplicates', [[1, 1, 2]], 1),
        tc('all values unique', [[1, 2, 3]], -1),
        tc('repeat at the very end', [[1, 2, 3, 1]], 3),
        tc('empty array', [[]], -1),
      ],
      title: 'First repeat, not first repeater',
      trap: code(`
export function solve(values: number[]): number {
  return values.findIndex((value, index) => values.indexOf(value, index + 1) !== -1);
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        '`values` is sorted ascending. Return the index at which `target` should be inserted to keep that order: ' +
        'the first index whose value is greater than or equal to `target`. When `target` is larger than every ' +
        'element, that index is `values.length`.\n\n' +
        'Signature: `solve(values: number[], target: number): number`\n\n' +
        '`findIndex` gets you most of the way — watch what it returns when nothing qualifies.',
      difficulty: 'advanced',
      explanation:
        '`findIndex` scans left to right and returns the first index whose element passes the predicate, so ' +
        '`findIndex((value) => value >= target)` is precisely "the first slot that is not smaller than `target`" — ' +
        'the insertion point that keeps ascending order and, because `>=` stops at the first equal element, lands ' +
        'new values *before* existing duplicates. The trap is the miss. When every element is smaller than ' +
        '`target`, no index qualifies and `findIndex` reports that with `-1`; but `-1` is not an insertion point, ' +
        'and the correct answer is `values.length` (append). Mapping `-1` to `length` is the whole fix, and it also ' +
        'covers the empty array, where `length` is `0`. This linear scan is the readable form of a *lower bound*; ' +
        'on large sorted arrays the same contract is met with a binary search, which the rotated-array challenge ' +
        'in the expert tier rebuilds from primitives.',
      id: 'sorted-insertion-point',
      methods: ['findIndex'],
      order: 11,
      solution: code(`
export function solve(values: number[], target: number): number {
  const index = values.findIndex((value) => value >= target);
  return index === -1 ? values.length : index;
}
`),
      starterCode: code(`
export function solve(values: number[], target: number): number {
  // findIndex returns -1 on a miss — but a miss here means "after everything".
  return 0;
}
`),
      tests: [
        tc('target sits between two values', [[1, 3, 5], 4], 2),
        tc('target equal to an element inserts before it', [[1, 3, 3, 5], 3], 1),
        tc('target larger than every value goes at the end (trap)', [[1, 3, 5], 9], 3),
        tc('target smaller than every value goes first', [[2, 4], 1], 0),
        tc('single element below the target (trap)', [[1], 2], 1),
        tc('empty array inserts at zero (trap)', [[], 7], 0),
      ],
      title: 'Where does it go?',
      trap: code(`
export function solve(values: number[], target: number): number {
  return values.findIndex((value) => value >= target);
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return the sub-array strictly between the FIRST and LAST occurrence of `sentinel` in `values` — excluding ' +
        'both sentinels themselves. If `sentinel` appears fewer than two times, return `[]`.\n\n' +
        'Signature: `solve(values: number[], sentinel: number): number[]`\n\n' +
        'Careful: occurrences of the sentinel *between* the outer two stay in the result.',
      difficulty: 'expert',
      explanation:
        '`findIndex` locates the first occurrence and `findLastIndex` (ES2023) the last, scanning from opposite ends ' +
        '— two O(n) passes, no reversing, no manual loops. The subtle case is "fewer than two occurrences": when the ' +
        'sentinel appears exactly once, both searches land on the *same* index, so `last === first` detects it ' +
        '(and `first === -1` covers zero occurrences). With the bounds in hand, `slice(first + 1, last)` does the ' +
        'exclusive extraction in one call, because `slice` already excludes its end index — and when the sentinels ' +
        'sit adjacent, `first + 1` equals `last`, an empty range, so `slice` naturally returns `[]`. The unguarded ' +
        'one-liner `slice(indexOf + 1, lastIndexOf)` looks equivalent, but when the sentinel is absent both searches ' +
        'return `-1` and `slice(0, -1)` drops only the last element instead of everything.',
      id: 'between-the-sentinels',
      methods: ['findIndex', 'findLastIndex', 'slice'],
      order: 12,
      solution: code(`
export function solve(values: number[], sentinel: number): number[] {
  const first = values.findIndex((value) => value === sentinel);
  const last = values.findLastIndex((value) => value === sentinel);
  if (first === -1 || last === first) {
    return [];
  }
  return values.slice(first + 1, last);
}
`),
      starterCode: code(`
export function solve(values: number[], sentinel: number): number[] {
  // Locate the first and last sentinel, then slice out what sits between them.
  return values;
}
`),
      tests: [
        tc('slice between the outer sentinels', [[1, 0, 5, 6, 0, 9], 0], [5, 6]),
        tc('inner sentinels are kept', [[3, 2, 3, 3, 2, 3, 1], 3], [2, 3, 3, 2]),
        tc('adjacent sentinels leave nothing between', [[4, 0, 0, 4], 0], []),
        tc('single occurrence is not enough', [[1, 0, 2], 0], []),
        tc('sentinel never appears (trap)', [[1, 2, 3], 0], []),
      ],
      title: 'Between the sentinels',
      trap: code(`
export function solve(values: number[], sentinel: number): number[] {
  return values.slice(values.indexOf(sentinel) + 1, values.lastIndexOf(sentinel));
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return the element of `values` nearest to `target`. When two elements are equally near, return the smaller ' +
        'one. `values` is unsorted and may hold duplicates; an empty array returns `null`.\n\n' +
        'Signature: `solve(values: number[], target: number): number | null`\n\n' +
        'Example: `solve([9, 1], 5)` → `1`. Sort a copy, locate the first value at or above the target, and look one ' +
        'slot back.',
      difficulty: 'expert',
      explanation:
        "Three methods share the work. `toSorted` (ES2023) orders a *copy* ascending, leaving the caller's array " +
        'intact where `sort` would have reordered it in place. `findIndex((value) => value >= target)` then locates ' +
        'the first element at or above the target; because the copy is sorted, the only other candidate is the ' +
        'element immediately before it, so the whole search collapses to comparing two distances, with `<=` handing ' +
        'ties to the lower value. The trap is reading that neighbour with `at(above - 1)`. When `above` is `0` the ' +
        'index becomes `-1`, and `at(-1)` does not mean "nothing before this" — it means the *last* element, so a ' +
        'target below the whole range is answered with the largest value in the array. The reference solution ' +
        'treats `above === 0` explicitly and reserves `at(-1)` for the case it is right for: `findIndex` returning ' +
        '`-1` because every value is below the target.',
      id: 'nearest-value-smaller-wins',
      methods: ['findIndex', 'at', 'toSorted'],
      order: 13,
      solution: code(`
export function solve(values: number[], target: number): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = values.toSorted((a, b) => a - b);
  const above = sorted.findIndex((value) => value >= target);
  if (above === -1) {
    return sorted.at(-1) ?? null;
  }
  const higher = sorted[above];
  if (above === 0) {
    return higher;
  }
  const lower = sorted[above - 1];
  return target - lower <= higher - target ? lower : higher;
}
`),
      starterCode: code(`
export function solve(values: number[], target: number): number | null {
  // toSorted a copy, findIndex the first value >= target, then compare it with the value just below.
  return null;
}
`),
      tests: [
        tc('nearest value in the middle of the range', [[10, 3, 7], 6], 7),
        tc('tie goes to the smaller value', [[9, 1], 5], 1),
        tc('target below every value (trap)', [[4, 8], 1], 4),
        tc('target above every value', [[4, 8], 20], 8),
        tc('exact match wins', [[2, 5, 9], 5], 5),
        tc('duplicates do not matter', [[3, 3, 7], 6], 7),
        tc('empty array yields null', [[], 1], null),
      ],
      title: 'Nearest value, smaller wins ties',
      trap: code(`
export function solve(values: number[], target: number): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = values.toSorted((a, b) => a - b);
  const above = sorted.findIndex((value) => value >= target);
  if (above === -1) {
    return sorted.at(-1) ?? null;
  }
  const higher = sorted[above];
  const lower = sorted.at(above - 1) ?? higher;
  return target - lower <= higher - target ? lower : higher;
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return `[start, end]`, the inclusive bounds of the run of equal adjacent values that contains index ' +
        '`position` in `values`. A value that reappears elsewhere in the array is not part of this run.\n\n' +
        'Signature: `solve(values: number[], position: number): [number, number]`\n\n' +
        'Example: `solve([1, 1, 2, 1, 1], 3)` → `[3, 4]`. Search outward from `position` in both directions.',
      difficulty: 'expert',
      explanation:
        'A run is a *local* property, and the two occurrence methods are global: `indexOf(current)` and ' +
        '`lastIndexOf(current)` return the first and last time the value appears anywhere, so for `[1, 1, 2, 1, 1]` ' +
        'they report `[0, 4]` and swallow the `2` in the middle. The run has to be found by expanding from ' +
        '`position` until the value changes. `findLastIndex` with an index-aware predicate — ' +
        '`index < position && value !== current` — scans backwards for the nearest different element on the left, ' +
        'and `findIndex` with the mirrored predicate scans forwards for the nearest different one on the right; the ' +
        'run is everything strictly between those two positions, hence `before + 1` and `after - 1`. Each miss has ' +
        'a natural meaning: `-1` on the left makes the start `0`, and `-1` on the right makes the end ' +
        '`values.length - 1`.',
      id: 'run-around-position',
      methods: ['findIndex', 'findLastIndex', 'indexOf', 'lastIndexOf'],
      order: 14,
      solution: code(`
export function solve(values: number[], position: number): [number, number] {
  const current = values[position];
  const before = values.findLastIndex((value, index) => index < position && value !== current);
  const after = values.findIndex((value, index) => index > position && value !== current);
  return [before + 1, after === -1 ? values.length - 1 : after - 1];
}
`),
      starterCode: code(`
export function solve(values: number[], position: number): [number, number] {
  // Scan backwards with findLastIndex and forwards with findIndex for the nearest value that differs.
  return [position, position];
}
`),
      tests: [
        tc('a value that reappears elsewhere is not part of the run (trap)', [[1, 1, 2, 1, 1], 3], [3, 4]),
        tc('run in the middle', [[5, 7, 7, 7, 9], 2], [1, 3]),
        tc('run of one', [[1, 2, 3], 1], [1, 1]),
        tc('run spanning the whole array', [[4, 4, 4], 1], [0, 2]),
        tc('position at the start of a later run (trap)', [[2, 3, 2, 2], 2], [2, 3]),
        tc('position at the very end', [[8, 9, 9], 2], [1, 2]),
      ],
      title: 'The run around a position',
      trap: code(`
export function solve(values: number[], position: number): [number, number] {
  const current = values[position];
  return [values.indexOf(current), values.lastIndexOf(current)];
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        "`grid` is a list of rows. Every row is sorted ascending and each row starts above the previous row's last " +
        'value, so reading the rows in order gives one ascending sequence. Rows may differ in length and are never ' +
        'empty. Return `[row, column]` of `target`, or `null` when it is absent.\n\n' +
        'Signature: `solve(grid: number[][], target: number): [number, number] | null`\n\n' +
        'Locate the row first — with the right search direction — then search inside that row alone.',
      difficulty: 'expert',
      explanation:
        'Two searches compose here, and the direction of the first is the whole problem. The row that can hold ' +
        '`target` is the *last* row whose first value is at or below it — every earlier row also starts below ' +
        '`target`, so `findIndex((values) => values[0] <= target)` stops at row `0` for any target that is not ' +
        'below the entire grid and then hunts inside the wrong row. `findLastIndex` (ES2023) runs the same ' +
        'predicate from the bottom up and lands on the one row whose range can contain the target; `-1` means the ' +
        'target is below everything. `indexOf` then answers inside that single row, and its `-1` means the target ' +
        'falls in the gap between two rows. Because rows may be ragged, flattening and dividing an index by a row ' +
        'width does not recover coordinates — the row must be found as a row.',
      id: 'sorted-grid-coordinates',
      methods: ['findLastIndex', 'indexOf', 'findIndex'],
      order: 15,
      solution: code(`
export function solve(grid: number[][], target: number): [number, number] | null {
  const row = grid.findLastIndex((values) => values[0] <= target);
  if (row === -1) {
    return null;
  }
  const column = grid[row].indexOf(target);
  return column === -1 ? null : [row, column];
}
`),
      starterCode: code(`
export function solve(grid: number[][], target: number): [number, number] | null {
  // Many rows start at or below target, but only one can hold it — find that row, then search inside it.
  return null;
}
`),
      tests: [
        tc('target in a later row (trap)', [[[1, 4], [7, 9, 12], [15]], 12], [1, 2]),
        tc(
          'target in the first row',
          [
            [
              [1, 4],
              [7, 9],
            ],
            4,
          ],
          [0, 1],
        ),
        tc('target at the start of a row (trap)', [[[1], [5, 6]], 5], [1, 0]),
        tc(
          'target in the gap between rows is absent',
          [
            [
              [1, 2],
              [8, 9],
            ],
            5,
          ],
          null,
        ),
        tc('target below every value', [[[3, 4]], 1], null),
        tc('ragged rows: the last row is the longest', [[[1], [2, 3, 4, 5]], 5], [1, 3]),
        tc('empty grid', [[], 5], null),
      ],
      title: 'Coordinates in a sorted grid',
      trap: code(`
export function solve(grid: number[][], target: number): [number, number] | null {
  const row = grid.findIndex((values) => values[0] <= target);
  if (row === -1) {
    return null;
  }
  const column = grid[row].indexOf(target);
  return column === -1 ? null : [row, column];
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        '`values` was sorted ascending and then rotated: some prefix was moved to the end, so `[4, 5, 6, 1, 2, 3]` ' +
        'is a rotation of `[1, 2, 3, 4, 5, 6]`. Values are distinct. Return the index of `target`, or `-1`, in ' +
        'O(log n) time — a linear `indexOf` gives the right answer but is not the exercise.\n\n' +
        'Signature: `solve(values: number[], target: number): number`\n\n' +
        'Compare the middle element with the LAST element to learn which part of the rotation it sits in.',
      difficulty: 'expert',
      explanation:
        '`indexOf` would answer this correctly in one call by scanning every element; the exercise is to rebuild ' +
        'that search so it halves the range each step, which a rotation seems to forbid — plain binary search ' +
        'assumes the whole array is ordered, and on `[4, 5, 6, 1, 2, 3]` it discards the half that holds `2`. The ' +
        'fix is one extra comparison. `values.at(-1)` is the last element, the largest value of the rotated-down ' +
        'tail: any element *greater* than it belongs to the first part, any element at or below it to the second. ' +
        'Classify the middle element and the target the same way. When both fall in the same part, the range ' +
        'between them is ordered and the ordinary `<` comparison steers the search; when they fall in different ' +
        'parts, a middle in the first part means the target lies to its right, and vice versa.',
      id: 'rotated-sorted-search',
      methods: ['at', 'indexOf'],
      order: 16,
      solution: code(`
export function solve(values: number[], target: number): number {
  const last = values.at(-1);
  if (last === undefined) {
    return -1;
  }
  const targetInFirstPart = target > last;
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const current = values[middle];
    if (current === target) {
      return middle;
    }
    const middleInFirstPart = current > last;
    if (middleInFirstPart === targetInFirstPart) {
      if (current < target) {
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    } else if (middleInFirstPart) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return -1;
}
`),
      starterCode: code(`
export function solve(values: number[], target: number): number {
  // Halve the range each step; values.at(-1) tells you which part of the rotation any element sits in.
  return -1;
}
`),
      tests: [
        tc('target in the rotated tail (trap)', [[4, 5, 6, 1, 2, 3], 2], 4),
        tc('target in the head', [[4, 5, 6, 1, 2, 3], 5], 1),
        tc('not rotated at all', [[1, 2, 3, 4], 3], 2),
        tc('target absent', [[4, 5, 6, 1, 2, 3], 7], -1),
        tc('rotation by one (trap)', [[2, 3, 1], 1], 2),
        tc('single element', [[9], 9], 0),
        tc('empty array', [[], 1], -1),
      ],
      title: 'Search a rotated sorted array',
      trap: code(`
export function solve(values: number[], target: number): number {
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (values[middle] === target) {
      return middle;
    }
    if (values[middle] < target) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return -1;
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Remove the zeros at the END of `values` — but not zeros in the middle — and return a pair: the trimmed ' +
        'array and the original array, which must be left exactly as it was.\n\n' +
        'Signature: `solve(values: number[]): [number[], number[]]`\n\n' +
        'Example: `solve([0, 3, 0, 0])` → `[[0, 3], [0, 3, 0, 0]]`. The obvious `pop` loop trims the original in ' +
        'place.',
      difficulty: 'expert',
      explanation:
        '`findLastIndex` (ES2023) scans backwards for the last element that is not `0`, and its answer is exactly ' +
        'where the kept region ends; `slice(0, lastKept + 1)` copies everything up to and including it, because ' +
        '`slice` excludes its end index. The `+ 1` also makes the all-zeros case fall out naturally: a miss returns ' +
        '`-1`, `slice(0, 0)` is `[]`, and no guard is needed. The tempting version is the loop ' +
        "`while (values.at(-1) === 0) values.pop()` — reads well, and destroys the caller's array, which is why " +
        'this challenge returns the original alongside the result: the test can see that `pop` trimmed both. ' +
        '`slice` never mutates, so the second element of the pair is the untouched input. Prefer a boundary search ' +
        'plus one copy over repeated `pop` whenever the input might be shared; it is also one allocation instead ' +
        'of a mutation per trailing zero.',
      id: 'trim-trailing-zeros-intact',
      methods: ['findLastIndex', 'slice', 'at'],
      order: 17,
      solution: code(`
export function solve(values: number[]): [number[], number[]] {
  const lastKept = values.findLastIndex((value) => value !== 0);
  return [values.slice(0, lastKept + 1), values];
}
`),
      starterCode: code(`
export function solve(values: number[]): [number[], number[]] {
  // findLastIndex the last non-zero, then slice up to and including it — the input must survive untouched.
  return [values, values];
}
`),
      tests: [
        tc(
          'trailing zeros trimmed, original intact (trap)',
          [[0, 3, 0, 0]],
          [
            [0, 3],
            [0, 3, 0, 0],
          ],
        ),
        tc(
          'no trailing zeros',
          [[1, 2]],
          [
            [1, 2],
            [1, 2],
          ],
        ),
        tc('all zeros trims to nothing (trap)', [[0, 0]], [[], [0, 0]]),
        tc(
          'zeros in the middle survive',
          [[1, 0, 2, 0]],
          [
            [1, 0, 2],
            [1, 0, 2, 0],
          ],
        ),
        tc('single non-zero value', [[7]], [[7], [7]]),
        tc('empty array', [[]], [[], []]),
      ],
      title: 'Trim trailing zeros, input intact',
      trap: code(`
export function solve(values: number[]): [number[], number[]] {
  while (values.at(-1) === 0) {
    values.pop();
  }
  return [values, values];
}
`),
    },
    {
      categoryId: 'access-and-search',
      description:
        'Return every index at which `pattern` occurs as a contiguous run inside `values`, in ascending order. ' +
        'Occurrences may overlap. An empty pattern matches nowhere.\n\n' +
        'Signature: `solve(values: number[], pattern: number[]): number[]`\n\n' +
        'Example: `solve([1, 1, 1], [1, 1])` → `[0, 1]`. Use `indexOf` with `fromIndex` to jump between candidate ' +
        'starts.',
      difficulty: 'expert',
      explanation:
        'This rebuilds the substring search of `String.prototype.indexOf` for arrays, and two methods carry it. ' +
        '`indexOf(first, fromIndex)` is the cursor: it jumps straight to the next place the pattern *could* begin ' +
        'instead of testing every index, and `fromIndex` resumes it after each candidate. ' +
        '`every` verifies a candidate by comparing `values[candidate + offset]` with each pattern element — an ' +
        'index past the end reads as `undefined`, which never equals a number, so a pattern running off the end ' +
        'fails without a length check. The trap is where to resume after a *successful* match. Skipping ahead by ' +
        '`pattern.length` feels efficient and is what `replaceAll` does, but this problem wants overlapping ' +
        'occurrences: in `[1, 1, 1]` the pattern `[1, 1]` starts at both `0` and `1`, and jumping to `2` loses the ' +
        'second. Resuming at `candidate + 1` after every candidate finds them all; an empty pattern is rejected up ' +
        'front.',
      id: 'pattern-occurrences',
      methods: ['indexOf', 'every'],
      order: 18,
      solution: code(`
export function solve(values: number[], pattern: number[]): number[] {
  const starts: number[] = [];
  const first = pattern[0];
  if (first === undefined) {
    return starts;
  }
  let candidate = values.indexOf(first);
  while (candidate !== -1) {
    const start = candidate;
    if (pattern.every((value, offset) => values[start + offset] === value)) {
      starts.push(start);
    }
    candidate = values.indexOf(first, start + 1);
  }
  return starts;
}
`),
      starterCode: code(`
export function solve(values: number[], pattern: number[]): number[] {
  // indexOf(pattern[0], from) finds each candidate start; every() checks the rest — then resume just past it.
  return [];
}
`),
      tests: [
        tc(
          'overlapping occurrences (trap)',
          [
            [1, 1, 1],
            [1, 1],
          ],
          [0, 1],
        ),
        tc(
          'two separate occurrences',
          [
            [2, 5, 9, 2, 5],
            [2, 5],
          ],
          [0, 3],
        ),
        tc(
          'false start, then a real match',
          [
            [2, 9, 2, 5],
            [2, 5],
          ],
          [2],
        ),
        tc(
          'overlap of a longer pattern (trap)',
          [
            [1, 2, 1, 2, 1],
            [1, 2, 1],
          ],
          [0, 2],
        ),
        tc(
          'pattern longer than the values',
          [
            [1, 2],
            [1, 2, 3],
          ],
          [],
        ),
        tc('single-element pattern is every index of that value', [[4, 1, 4], [4]], [0, 2]),
        tc('empty pattern matches nowhere', [[1, 2], []], []),
      ],
      title: 'Every occurrence of a pattern',
      trap: code(`
export function solve(values: number[], pattern: number[]): number[] {
  const starts: number[] = [];
  const first = pattern[0];
  if (first === undefined) {
    return starts;
  }
  let candidate = values.indexOf(first);
  while (candidate !== -1) {
    const start = candidate;
    if (pattern.every((value, offset) => values[start + offset] === value)) {
      starts.push(start);
      candidate = values.indexOf(first, start + pattern.length);
    } else {
      candidate = values.indexOf(first, start + 1);
    }
  }
  return starts;
}
`),
    },
  ],
};
