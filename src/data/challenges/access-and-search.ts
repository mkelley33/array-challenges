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
        '— two O(n) passes, no reversing, no manual loops. The subtle case is “fewer than two occurrences”: when the ' +
        'sentinel appears exactly once, both searches land on the *same* index, so `last === first` detects it ' +
        '(and `first === -1` covers zero occurrences). With the bounds in hand, `slice(first + 1, last)` does the ' +
        'exclusive extraction in one call, because `slice` already excludes its end index — and when the sentinels ' +
        'sit adjacent, `first + 1` equals `last`, an empty range, so `slice` naturally returns `[]` with no special ' +
        'case.',
      id: 'between-the-sentinels',
      methods: ['findIndex', 'findLastIndex', 'slice'],
      order: 6,
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
        tc('sentinel never appears', [[1, 2, 3], 0], []),
      ],
      title: 'Between the sentinels',
    },
  ],
};
