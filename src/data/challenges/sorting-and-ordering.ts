import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const sortingAndOrdering: CategoryModule = {
  category: {
    description:
      'Sort numbers, strings, and objects correctly — dodging the string-comparison default, mutation surprises, and locale traps.',
    id: 'sorting-and-ordering',
    order: 7,
    title: 'Sorting & Ordering',
  },
  challenges: [
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Return `numbers` sorted in ascending numeric order, without mutating the input.\n\n' +
        'Signature: `solve(numbers: number[]): number[]`\n\n' +
        'Trap: the starter code looks correct but returns `[1, 10, 9]` for `[10, 9, 1]`. Why?',
      difficulty: 'novice',
      explanation:
        'With no comparator, `sort` and `toSorted` convert every element to a *string* and compare Unicode code ' +
        'units — so `10` becomes `"10"`, which sorts before `"9"` because `"1" < "9"`. That default exists for ' +
        'historical reasons and is almost never what you want for numbers. Passing `(a, b) => a - b` fixes it: a ' +
        'comparator returns negative when `a` belongs first, positive when `b` does, and zero for ties, and ' +
        'subtraction produces exactly those signs for numbers. `toSorted` (ES2023) applies the same comparator ' +
        'contract as `sort` but returns a new array instead of mutating in place.',
      id: 'numeric-sort-trap',
      methods: ['sort', 'toSorted'],
      order: 1,
      solution: code(`
export function solve(numbers: number[]): number[] {
  return numbers.toSorted((a, b) => a - b);
}
`),
      starterCode: code(`
export function solve(numbers: number[]): number[] {
  // Looks right, sorts wrong: what does the default comparator compare?
  return numbers.toSorted();
}
`),
      tests: [
        tc('double digits expose the trap', [[10, 9, 1]], [1, 9, 10]),
        tc('already sorted stays sorted', [[1, 2, 3]], [1, 2, 3]),
        tc('empty array', [[]], []),
        tc('negatives sort numerically', [[-5, 100, -20, 3]], [-20, -5, 3, 100]),
        tc('single element', [[8]], [8]),
      ],
      title: 'Sort numbers, not strings',
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Return a tuple `[sortedCopy, original]`: the first element is `xs` sorted ascending, the second is `xs` ' +
        'itself — which must still be in its original order after your code runs.\n\n' +
        'Signature: `solve(xs: number[]): [number[], number[]]`\n\n' +
        'Example: `solve([3, 1, 2])` → `[[1, 2, 3], [3, 1, 2]]`. If you reach for in-place `sort`, the second ' +
        'element comes back reordered and the test fails.',
      difficulty: 'novice',
      explanation:
        '`sort` mutates: `xs.sort()` reorders the array you were handed *and* returns that same array, so both tuple ' +
        'elements end up pointing at one sorted array — the test sees `[[1, 2, 3], [1, 2, 3]]` and fails. `toSorted` ' +
        '(ES2023) is the copying twin: it allocates a new array, sorts the copy, and leaves the original untouched, ' +
        'which is why `[xs.toSorted((a, b) => a - b), xs]` passes. This matters beyond puzzles — mutating a prop, a ' +
        'piece of state, or a function argument with `sort` is a classic source of spooky action at a distance. The ' +
        'pre-ES2023 spelling of the same idea is `[...xs].sort(...)`.',
      id: 'sorted-copy-original-intact',
      methods: ['toSorted', 'sort'],
      order: 2,
      solution: code(`
export function solve(xs: number[]): [number[], number[]] {
  return [xs.toSorted((a, b) => a - b), xs];
}
`),
      starterCode: code(`
export function solve(xs: number[]): [number[], number[]] {
  // sort() reorders xs itself — the second tuple element must stay untouched.
  return [xs.sort((a, b) => a - b), xs];
}
`),
      tests: [
        tc(
          'copy is sorted, original untouched',
          [[3, 1, 2]],
          [
            [1, 2, 3],
            [3, 1, 2],
          ],
        ),
        tc(
          'reverse-ordered input',
          [[9, 5, 1]],
          [
            [1, 5, 9],
            [9, 5, 1],
          ],
        ),
        tc('empty array', [[]], [[], []]),
        tc(
          'double digits stay numeric',
          [[10, 2]],
          [
            [2, 10],
            [10, 2],
          ],
        ),
      ],
      title: 'Prove you did not mutate',
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort people alphabetically by `name` the way a human would file them — `Émile` belongs with the Es, ' +
        'not after `Zoe`.\n\n' +
        'Signature: `solve(people: { name: string }[]): { name: string }[]`\n\n' +
        'Use `localeCompare` with the `en` locale; do not mutate the input.',
      difficulty: 'intermediate',
      explanation:
        'Comparing strings with `<` ranks them by raw code units: `É` is U+00C9 (201), far beyond `Z` (90), so a ' +
        'plain comparator files Émile after Zoe — and every lowercase letter after every uppercase one, which is why ' +
        '`ana` would land after `Ben`. `localeCompare` consults real collation rules instead: accented letters sort ' +
        'with their base letter and case differences only break ties. It also returns exactly the negative/zero/' +
        'positive contract a comparator needs, so `(a, b) => a.name.localeCompare(b.name, "en")` drops straight into ' +
        '`toSorted`. Pinning the locale to `"en"` keeps results identical across machines instead of inheriting ' +
        "whatever the runtime's default locale happens to be.",
      id: 'sort-names-locale',
      methods: ['toSorted', 'localeCompare'],
      order: 3,
      solution: code(`
interface Person {
  name: string;
}

export function solve(people: Person[]): Person[] {
  return people.toSorted((a, b) => a.name.localeCompare(b.name, 'en'));
}
`),
      starterCode: code(`
interface Person {
  name: string;
}

export function solve(people: Person[]): Person[] {
  // 'É' < 'Z' is false in code units — humans disagree. Compare with locale rules.
  return people;
}
`),
      tests: [
        tc(
          'accented names collate with their base letter',
          [[{ name: 'Zoe' }, { name: 'Émile' }, { name: 'Adam' }]],
          [{ name: 'Adam' }, { name: 'Émile' }, { name: 'Zoe' }],
        ),
        tc(
          'plain ascii names',
          [[{ name: 'carol' }, { name: 'alice' }, { name: 'bob' }]],
          [{ name: 'alice' }, { name: 'bob' }, { name: 'carol' }],
        ),
        tc(
          'lowercase does not sort after uppercase',
          [[{ name: 'Ben' }, { name: 'ana' }]],
          [{ name: 'ana' }, { name: 'Ben' }],
        ),
        tc('empty roster', [[]], []),
        tc('single person', [[{ name: 'Ada' }]], [{ name: 'Ada' }]),
      ],
      title: 'Human-friendly name sort',
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort employees by `department` ascending, and *within* each department by `salary` descending.\n\n' +
        'Signature: `solve(employees: { department: string; name: string; salary: number }[]): ' +
        '{ department: string; name: string; salary: number }[]`\n\n' +
        'Do not mutate the input.',
      difficulty: 'intermediate',
      explanation:
        'Multi-key sorting is comparator chaining: compare by the primary key, and only when that comparison returns ' +
        '`0` fall through to the secondary key. The `||` idiom encodes the fall-through in one expression — ' +
        '`byDepartment || b.salary - a.salary` — because a non-zero primary result is truthy and short-circuits, ' +
        'while a `0` (tie) is falsy and hands control to the salary comparison. Flipping the operands to ' +
        '`b.salary - a.salary` inverts the sign contract, which is all “descending” means. `toSorted` runs the whole ' +
        'chain in a single pass over the data; sorting twice by separate keys only works if you sort by the ' +
        '*secondary* key first and rely on stability, and it costs two passes.',
      id: 'department-then-salary',
      methods: ['toSorted'],
      order: 4,
      solution: code(`
interface Employee {
  department: string;
  name: string;
  salary: number;
}

export function solve(employees: Employee[]): Employee[] {
  return employees.toSorted((a, b) => {
    const byDepartment = a.department < b.department ? -1 : a.department > b.department ? 1 : 0;
    return byDepartment || b.salary - a.salary;
  });
}
`),
      starterCode: code(`
interface Employee {
  department: string;
  name: string;
  salary: number;
}

export function solve(employees: Employee[]): Employee[] {
  // Compare departments first; only on a tie (0) fall through to salary — || does exactly that.
  return employees;
}
`),
      tests: [
        tc(
          'two departments, salaries descend within each',
          [
            [
              { department: 'Sales', name: 'Uma', salary: 90 },
              { department: 'Eng', name: 'Ada', salary: 120 },
              { department: 'Eng', name: 'Lin', salary: 150 },
              { department: 'Sales', name: 'Rex', salary: 110 },
            ],
          ],
          [
            { department: 'Eng', name: 'Lin', salary: 150 },
            { department: 'Eng', name: 'Ada', salary: 120 },
            { department: 'Sales', name: 'Rex', salary: 110 },
            { department: 'Sales', name: 'Uma', salary: 90 },
          ],
        ),
        tc(
          'single department sorts by salary only',
          [
            [
              { department: 'Ops', name: 'Al', salary: 50 },
              { department: 'Ops', name: 'Bo', salary: 75 },
            ],
          ],
          [
            { department: 'Ops', name: 'Bo', salary: 75 },
            { department: 'Ops', name: 'Al', salary: 50 },
          ],
        ),
        tc('empty team', [[]], []),
        tc(
          'salary tie keeps original order',
          [
            [
              { department: 'Eng', name: 'First', salary: 100 },
              { department: 'Eng', name: 'Second', salary: 100 },
            ],
          ],
          [
            { department: 'Eng', name: 'First', salary: 100 },
            { department: 'Eng', name: 'Second', salary: 100 },
          ],
        ),
      ],
      title: 'Department up, salary down',
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Rank submissions by `score` descending. Submissions with equal scores must keep the order they were ' +
        'submitted in — first in, first listed.\n\n' +
        'Signature: `solve(submissions: { name: string; score: number }[]): { name: string; score: number }[]`\n\n' +
        'Do not mutate the input, and do not add tiebreak keys — the sort itself must preserve submission order.',
      difficulty: 'advanced',
      explanation:
        'Since ES2019, `sort` — and therefore `toSorted` — is guaranteed *stable*: elements that compare equal keep ' +
        'their original relative order. That guarantee is what makes `(a, b) => b.score - a.score` a complete ' +
        'solution here. Look at the first test: Ana, Cy, and Ed all score 80, so the comparator returns `0` for ' +
        'every pair among them and expresses no preference — an unstable sort could legally emit them as ' +
        '`Ed, Ana, Cy` or any other permutation, and the expected output would be a coin flip. Stability removes the ' +
        'coin flip: ties resolve to input order, deterministically, with no extra tiebreak key. Before ES2019 ' +
        'engines really did differ (V8 used an unstable sort for arrays over 10 elements), which is why older code ' +
        'carries defensive index tiebreakers you no longer need.',
      id: 'stable-leaderboard',
      methods: ['toSorted'],
      order: 5,
      solution: code(`
interface Submission {
  name: string;
  score: number;
}

export function solve(submissions: Submission[]): Submission[] {
  return submissions.toSorted((a, b) => b.score - a.score);
}
`),
      starterCode: code(`
interface Submission {
  name: string;
  score: number;
}

export function solve(submissions: Submission[]): Submission[] {
  // Descending by score — and let guaranteed stability handle the ties for you.
  return submissions;
}
`),
      tests: [
        tc(
          'ties keep submission order',
          [
            [
              { name: 'Ana', score: 80 },
              { name: 'Bo', score: 95 },
              { name: 'Cy', score: 80 },
              { name: 'Di', score: 95 },
              { name: 'Ed', score: 80 },
            ],
          ],
          [
            { name: 'Bo', score: 95 },
            { name: 'Di', score: 95 },
            { name: 'Ana', score: 80 },
            { name: 'Cy', score: 80 },
            { name: 'Ed', score: 80 },
          ],
        ),
        tc(
          'all scores equal means order unchanged',
          [
            [
              { name: 'A', score: 50 },
              { name: 'B', score: 50 },
              { name: 'C', score: 50 },
            ],
          ],
          [
            { name: 'A', score: 50 },
            { name: 'B', score: 50 },
            { name: 'C', score: 50 },
          ],
        ),
        tc(
          'no ties sorts purely by score',
          [
            [
              { name: 'Low', score: 10 },
              { name: 'High', score: 99 },
            ],
          ],
          [
            { name: 'High', score: 99 },
            { name: 'Low', score: 10 },
          ],
        ),
        tc('empty leaderboard', [[]], []),
        tc('single submission', [[{ name: 'Only', score: 42 }]], [{ name: 'Only', score: 42 }]),
      ],
      title: 'Stability is a feature',
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort labels the way a file browser does: `item2` before `item10`, because the digit runs compare as ' +
        'numbers, not characters.\n\n' +
        'Signature: `solve(labels: string[]): string[]`\n\n' +
        'Plain lexicographic sorting yields `["item1", "item10", "item2"]` — fix it without parsing the strings yourself.',
      difficulty: 'expert',
      explanation:
        'Lexicographic comparison walks character by character, so `"item10" < "item2"` — the `1` loses to `2` ' +
        'before the second digit is ever seen. You could split each label into text and number chunks yourself, but ' +
        '`localeCompare` already ships that algorithm behind the `numeric` collation option: ' +
        '`a.localeCompare(b, "en", { numeric: true })` segments both strings, compares digit runs by numeric value ' +
        'and everything else by locale rules. Dropped into `toSorted`, it produces the “natural sort” every file ' +
        'browser uses, and it handles version-ish strings like `v1.9` vs `v1.10` for free. One caveat for hot paths: ' +
        'options-bearing `localeCompare` builds collation machinery per call — cache an ' +
        '`Intl.Collator("en", { numeric: true })` and pass its `compare` method when sorting huge lists.',
      id: 'natural-numeric-sort',
      methods: ['toSorted', 'localeCompare'],
      order: 6,
      solution: code(`
export function solve(labels: string[]): string[] {
  return labels.toSorted((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}
`),
      starterCode: code(`
export function solve(labels: string[]): string[] {
  // Lexicographic order ranks 'item10' before 'item2' — ask for numeric collation instead.
  return labels.toSorted();
}
`),
      tests: [
        tc('digit runs compare as numbers', [['item10', 'item2', 'item1']], ['item1', 'item2', 'item10']),
        tc('version-ish strings', [['v1.10', 'v1.2', 'v1.9']], ['v1.2', 'v1.9', 'v1.10']),
        tc('mixed digit widths', [['file100', 'file20', 'file3']], ['file3', 'file20', 'file100']),
        tc('empty list', [[]], []),
        tc('plain words stay alphabetical', [['pear', 'apple']], ['apple', 'pear']),
      ],
      title: 'Natural sort for humans',
    },
  ],
};
