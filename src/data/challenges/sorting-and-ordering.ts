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
          'ties keep submission order (trap)',
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
          'all scores equal means order unchanged (trap)',
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
      trap: code(`
interface Submission {
  name: string;
  score: number;
}

export function solve(submissions: Submission[]): Submission[] {
  return submissions.toSorted((a, b) => a.score - b.score).reverse();
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort labels the way a file browser does: `item2` before `item10`, because the digit runs compare as ' +
        'numbers, not characters.\n\n' +
        'Signature: `solve(labels: string[]): string[]`\n\n' +
        'Plain lexicographic sorting yields `["item1", "item10", "item2"]` — fix it without parsing the strings yourself.',
      difficulty: 'advanced',
      explanation:
        'Lexicographic comparison walks character by character, so `"item10" < "item2"` — the `1` loses to `2` ' +
        'before the second digit is ever seen — and a bare `localeCompare` takes the same walk, just with locale ' +
        'rules for the letters. You could split each label into text and number chunks yourself, but ' +
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
        tc('digit runs compare as numbers (trap)', [['item10', 'item2', 'item1']], ['item1', 'item2', 'item10']),
        tc('version-ish strings (trap)', [['v1.10', 'v1.2', 'v1.9']], ['v1.2', 'v1.9', 'v1.10']),
        tc('mixed digit widths', [['file100', 'file20', 'file3']], ['file3', 'file20', 'file100']),
        tc('empty list', [[]], []),
        tc('plain words stay alphabetical', [['pear', 'apple']], ['apple', 'pear']),
      ],
      title: 'Natural sort for humans',
      trap: code(`
export function solve(labels: string[]): string[] {
  return labels.toSorted((a, b) => a.localeCompare(b, 'en'));
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Return `numbers` sorted in descending numeric order, without mutating the input.\n\n' +
        'Signature: `solve(numbers: number[]): number[]`\n\n' +
        'Trap: `numbers.sort().reverse()` looks like the obvious two-step answer — try it on `[10, 9, 2]`.',
      difficulty: 'advanced',
      explanation:
        'Reversing an ascending sort only works if the ascending sort was right, and the comparator-less `sort` is ' +
        'not: it stringifies every element, so `[10, 9, 2]` sorts to `[10, 2, 9]` (`"10"` < `"2"` < `"9"`) and ' +
        '`reverse` then hands back `[9, 2, 10]`. Single-digit inputs hide the bug completely, which is why it ships. ' +
        'A descending comparator, `(a, b) => b - a`, says what you mean in one pass — swapping the operands flips ' +
        'the sign contract, and that is all "descending" is. It also avoids two other costs of the reverse idiom: ' +
        "`sort().reverse()` mutates the caller's array twice, and for objects with equal keys, reversing an " +
        'ascending order also reverses the ties, which throws away the stability `toSorted` gives you for free. ' +
        'Reach for `reverse` when you want the input backwards, not when you want it sorted the other way.',
      id: 'descending-without-reverse',
      methods: ['toSorted', 'reverse', 'sort'],
      order: 7,
      solution: code(`
export function solve(numbers: number[]): number[] {
  return numbers.toSorted((a, b) => b - a);
}
`),
      starterCode: code(`
export function solve(numbers: number[]): number[] {
  // Say "descending" in the comparator itself — do not sort ascending and flip the result.
  return numbers;
}
`),
      tests: [
        tc('double digits expose the string sort (trap)', [[10, 9, 2]], [10, 9, 2]),
        tc('negatives expose it too (trap)', [[-1, -10, 5]], [5, -1, -10]),
        tc('single digits happen to work either way', [[3, 1, 2]], [3, 2, 1]),
        tc('duplicates keep both copies', [[2, 2, 1]], [2, 2, 1]),
        tc('already descending', [[9, 8, 7]], [9, 8, 7]),
        tc('empty array', [[]], []),
      ],
      title: 'Descending is a comparator, not a reverse',
      trap: code(`
export function solve(numbers: number[]): number[] {
  return numbers.sort().reverse();
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort `xs` ascending, but every `NaN` must land at the end — in one `toSorted` call, without mutating ' +
        'the input.\n\n' +
        'Signature: `solve(xs: number[]): number[]`\n\n' +
        'Trap: `(a, b) => a - b` is the comparator you always reach for — what does it return when one side is `NaN`?',
      difficulty: 'advanced',
      explanation:
        '`a - b` is `NaN` whenever either operand is `NaN`, and the sort coerces a `NaN` comparator result to `0` — ' +
        '"these two are equal". That makes the comparator inconsistent: `3` equals `NaN`, `NaN` equals `1`, yet ' +
        '`3 > 1`, and an inconsistent comparator gives the engine permission to return any order at all. V8 leaves ' +
        '`[3, NaN, 1]` exactly as it found it. The fix is to make `NaN` a real case: test both sides with ' +
        '`Number.isNaN`, and if either is `NaN`, return `Number(aNaN) - Number(bNaN)` — `1` when only `a` is `NaN` ' +
        '(send it right), `-1` when only `b` is, `0` when both are — and only then fall through to `a - b`. ' +
        '`toSorted` still does all the ordering; the comparator just has to answer honestly for every pair it will ' +
        'be asked about, including the pairs you would rather not think about.',
      id: 'sort-with-nan-last',
      methods: ['toSorted'],
      order: 8,
      solution: code(`
export function solve(xs: number[]): number[] {
  return xs.toSorted((a, b) => {
    const aNaN = Number.isNaN(a);
    const bNaN = Number.isNaN(b);
    if (aNaN || bNaN) {
      return Number(aNaN) - Number(bNaN);
    }
    return a - b;
  });
}
`),
      starterCode: code(`
export function solve(xs: number[]): number[] {
  // a - b is NaN when either side is NaN, and NaN means "equal" to the sort — decide that case first.
  return xs;
}
`),
      tests: [
        tc('NaN in the middle of the input (trap)', [[3, NaN, 1]], [1, 3, NaN]),
        tc('NaN first (trap)', [[NaN, 2, 1]], [1, 2, NaN]),
        tc('two NaNs both go last (trap)', [[NaN, 2, NaN, 1]], [1, 2, NaN, NaN]),
        tc('NaN already last', [[1, 2, NaN]], [1, 2, NaN]),
        tc('no NaN is a plain numeric sort', [[10, 9, 1]], [1, 9, 10]),
        tc('infinities are ordinary numbers here', [[Infinity, -Infinity, 0]], [-Infinity, 0, Infinity]),
        tc('empty array', [[]], []),
      ],
      title: 'NaN goes last',
      trap: code(`
export function solve(xs: number[]): number[] {
  return xs.toSorted((a, b) => a - b);
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort `tasks` by `priority` ascending. Tasks with the same priority must keep the order they arrived in.\n\n' +
        'Signature: `solve(tasks: { priority: number; title: string }[]): { priority: number; title: string }[]`\n\n' +
        'Trap: a comparator written as `a.priority > b.priority ? 1 : -1` orders the numbers correctly and still fails.',
      difficulty: 'advanced',
      explanation:
        'A comparator has three answers, not two: negative, positive, and `0` for "no preference". The ternary ' +
        '`a.priority > b.priority ? 1 : -1` never says `0` — it claims `a` belongs *before* `b` whenever the two ' +
        'tie — and the stability `toSorted` guarantees only covers pairs the comparator calls equal. With that lie ' +
        'in place V8 files each tied element ahead of the one that arrived before it, so `[A, B, C]` with equal ' +
        'priorities comes back `[C, B, A]`, while another engine may happen to keep the order. `a.priority - b.priority` returns ' +
        '`0` exactly when the priorities match and the right sign otherwise, so it is the whole solution. The ' +
        'boolean cousin `(a, b) => a.priority > b.priority` is worse still: `false` coerces to `0`, nothing ever ' +
        'compares as less-than, and V8 hands the input back unsorted.',
      id: 'comparator-three-answers',
      methods: ['toSorted'],
      order: 9,
      solution: code(`
interface Task {
  priority: number;
  title: string;
}

export function solve(tasks: Task[]): Task[] {
  return tasks.toSorted((a, b) => a.priority - b.priority);
}
`),
      starterCode: code(`
interface Task {
  priority: number;
  title: string;
}

export function solve(tasks: Task[]): Task[] {
  // A comparator must answer 0 for a tie — subtraction does; a > b ? 1 : -1 never does.
  return tasks;
}
`),
      tests: [
        tc(
          'ties keep arrival order (trap)',
          [
            [
              { priority: 1, title: 'A' },
              { priority: 2, title: 'B' },
              { priority: 1, title: 'C' },
            ],
          ],
          [
            { priority: 1, title: 'A' },
            { priority: 1, title: 'C' },
            { priority: 2, title: 'B' },
          ],
        ),
        tc(
          'all priorities equal means order unchanged (trap)',
          [
            [
              { priority: 1, title: 'X' },
              { priority: 1, title: 'Y' },
              { priority: 1, title: 'Z' },
            ],
          ],
          [
            { priority: 1, title: 'X' },
            { priority: 1, title: 'Y' },
            { priority: 1, title: 'Z' },
          ],
        ),
        tc(
          'distinct priorities sort ascending',
          [
            [
              { priority: 3, title: 'Low' },
              { priority: 1, title: 'Urgent' },
              { priority: 2, title: 'Normal' },
            ],
          ],
          [
            { priority: 1, title: 'Urgent' },
            { priority: 2, title: 'Normal' },
            { priority: 3, title: 'Low' },
          ],
        ),
        tc('single task', [[{ priority: 5, title: 'Solo' }]], [{ priority: 5, title: 'Solo' }]),
        tc('empty list', [[]], []),
      ],
      title: 'A comparator has three answers',
      trap: code(`
interface Task {
  priority: number;
  title: string;
}

export function solve(tasks: Task[]): Task[] {
  return tasks.toSorted((a, b) => (a.priority > b.priority ? 1 : -1));
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort `words` by length, shortest first; words of the same length go alphabetically (`en` locale). ' +
        'Do not mutate the input.\n\n' +
        'Signature: `solve(words: string[]): string[]`\n\n' +
        'Trap: sorting by length and then sorting the result alphabetically feels like it applies both rules — it applies one.',
      difficulty: 'advanced',
      explanation:
        'Each `toSorted` pass is a complete reordering, so the last pass wins: sort by length, then by alphabet, ' +
        'and the alphabet is all that survives — `["pear", "fig", "apple"]` comes back fully alphabetical with ' +
        '`fig` stranded in the middle. One comparator that chains both keys is the direct fix: ' +
        '`a.length - b.length || a.localeCompare(b, "en")`. The `||` hands control to `localeCompare` only when the ' +
        'length difference is `0`, so the alphabet decides ties and never the primary order, and the whole thing ' +
        'costs one pass. A two-pass version does exist — alphabet *first*, length *second* — but it only works ' +
        'because a stable sort keeps the earlier order among equal lengths; it reads backwards, costs twice as ' +
        'much, and breaks the moment someone tidies the passes into the intuitive order. `localeCompare` rather ' +
        'than `<` keeps `bee` ahead of `Cat`, since code-unit comparison files every capital before every ' +
        'lowercase letter.',
      id: 'shortest-then-alphabetical',
      methods: ['toSorted', 'localeCompare'],
      order: 10,
      solution: code(`
export function solve(words: string[]): string[] {
  return words.toSorted((a, b) => a.length - b.length || a.localeCompare(b, 'en'));
}
`),
      starterCode: code(`
export function solve(words: string[]): string[] {
  // One comparator, two keys: length first, and only on a tie (0) fall through to localeCompare.
  return words;
}
`),
      tests: [
        tc('length outranks the alphabet (trap)', [['pear', 'fig', 'apple']], ['fig', 'pear', 'apple']),
        tc('equal lengths fall through to the alphabet', [['dog', 'cat', 'ant']], ['ant', 'cat', 'dog']),
        tc('mixed lengths and ties (trap)', [['bb', 'a', 'ab', 'c']], ['a', 'c', 'ab', 'bb']),
        tc('case does not beat alphabetical order', [['Cat', 'bee']], ['bee', 'Cat']),
        tc('single word', [['solo']], ['solo']),
        tc('empty list', [[]], []),
      ],
      title: 'Shortest first, then alphabetical',
      trap: code(`
export function solve(words: string[]): string[] {
  return words.toSorted((a, b) => a.length - b.length).toSorted((a, b) => a.localeCompare(b, 'en'));
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort `prices` — decimal numbers held as strings, exactly as they came off a form — into ascending numeric ' +
        'order. Return the original strings, unmodified, without mutating the input.\n\n' +
        'Signature: `solve(prices: string[]): string[]`\n\n' +
        'Trap: `localeCompare` with `{ numeric: true }` is the natural-sort hammer, and it is not a number parser.',
      difficulty: 'advanced',
      explanation:
        'Numeric collation compares *runs of digits* as integers; it knows nothing about decimal points or minus ' +
        'signs. `"1.5"` versus `"1.25"` splits into `1`, `.`, `5` and `1`, `.`, `25`, so it declares `1.5` smaller ' +
        'because `5 < 25`, and `"-1.5"` lands before `"-10"` because the sign is just punctuation to the collator. ' +
        'The moment a string *is* a number, stop comparing strings: `Number(a) - Number(b)` turns each pair into ' +
        'real values, and `toSorted` orders the original strings by that key, so `"2.50"` and `"2.5"` tie (and ' +
        'stability keeps them in input order) while `"9.99"` correctly precedes `"12.50"`. Numeric collation earns ' +
        'its place for labels like `item2` / `item10`, where digits are embedded in text; for values that parse, ' +
        "parse them. The comparator is the seam where that conversion belongs — the output stays the caller's " +
        'strings.',
      id: 'decimal-strings-numeric-order',
      methods: ['toSorted', 'localeCompare'],
      order: 11,
      solution: code(`
export function solve(prices: string[]): string[] {
  return prices.toSorted((a, b) => Number(a) - Number(b));
}
`),
      starterCode: code(`
export function solve(prices: string[]): string[] {
  // These strings are numbers — compare the values, not the characters (and not the digit runs).
  return prices.toSorted();
}
`),
      tests: [
        tc('fractions defeat digit-run collation (trap)', [['1.5', '1.25']], ['1.25', '1.5']),
        tc('negative values (trap)', [['-1.5', '-10', '0']], ['-10', '-1.5', '0']),
        tc('trailing zeros tie and keep input order (trap)', [['2.50', '2.5', '1']], ['1', '2.50', '2.5']),
        tc('lexicographic order would be wrong here', [['9.99', '12.50', '100']], ['9.99', '12.50', '100']),
        tc('single price', [['4.20']], ['4.20']),
        tc('empty list', [[]], []),
      ],
      title: 'Numbers in string clothing',
      trap: code(`
export function solve(prices: string[]): string[] {
  return prices.toSorted((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort `rows` by a list of keys given as data: each entry names a column and a direction, and earlier ' +
        'entries outrank later ones. Numbers compare numerically, strings with `localeCompare` in the `en` locale. ' +
        'Do not mutate the input.\n\n' +
        "Signature: `solve(rows: Record<string, number | string>[], spec: { dir: 'asc' | 'desc'; key: string }[]): " +
        'Record<string, number | string>[]`\n\n' +
        'Example: `spec = [{ key: "team", dir: "asc" }, { key: "score", dir: "desc" }]` groups by team and ranks ' +
        'each team by score.',
      difficulty: 'expert',
      explanation:
        'A multi-key sort whose keys arrive at runtime is one comparator built by a fold. For a given pair ' +
        '`(a, b)`, `spec.reduce` walks the keys in priority order and `order || compare(...)` keeps the first ' +
        'non-zero verdict: once a higher-priority key has decided, `||` short-circuits and the lower keys are ' +
        'never consulted. Direction is a sign flip — multiply the verdict by `-1` for `desc` — and `compareCells` ' +
        'picks subtraction for two numbers and `localeCompare` otherwise, so mixed columns still obey one ' +
        'contract. The tempting alternative runs one `toSorted` per key, primary first, and is wrong: each pass ' +
        "reorders everything, so the *last* key ends up in charge and the first key's grouping is destroyed. " +
        '(Reversing the spec makes the pass-per-key version work, by stability — a fragile trick.) One `toSorted` ' +
        'with the folded comparator is a single pass and cannot get the priority backwards.',
      id: 'sort-by-key-spec',
      methods: ['toSorted', 'localeCompare', 'reduce'],
      order: 12,
      solution: code(`
type Cell = number | string;
type Row = Record<string, Cell>;

interface SortKey {
  dir: 'asc' | 'desc';
  key: string;
}

function compareCells(a: Cell, b: Cell): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'en');
}

export function solve(rows: Row[], spec: SortKey[]): Row[] {
  return rows.toSorted((a, b) =>
    spec.reduce(
      (order, { dir, key }) => order || compareCells(a[key] ?? '', b[key] ?? '') * (dir === 'asc' ? 1 : -1),
      0,
    ),
  );
}
`),
      starterCode: code(`
type Cell = number | string;
type Row = Record<string, Cell>;

interface SortKey {
  dir: 'asc' | 'desc';
  key: string;
}

export function solve(rows: Row[], spec: SortKey[]): Row[] {
  // One comparator: fold over spec, keep the first non-zero comparison, flip the sign for 'desc'.
  return rows;
}
`),
      tests: [
        tc(
          'team groups outrank score (trap)',
          [
            [
              { name: 'Ada', score: 70, team: 'Red' },
              { name: 'Bo', score: 90, team: 'Blue' },
              { name: 'Cy', score: 80, team: 'Red' },
              { name: 'Di', score: 60, team: 'Blue' },
            ],
            [
              { dir: 'asc', key: 'team' },
              { dir: 'desc', key: 'score' },
            ],
          ],
          [
            { name: 'Bo', score: 90, team: 'Blue' },
            { name: 'Di', score: 60, team: 'Blue' },
            { name: 'Cy', score: 80, team: 'Red' },
            { name: 'Ada', score: 70, team: 'Red' },
          ],
        ),
        tc(
          'three keys, each deciding only on a tie (trap)',
          [
            [
              { age: 30, city: 'Oslo', name: 'Zed' },
              { age: 30, city: 'Oslo', name: 'Amy' },
              { age: 40, city: 'Bern', name: 'Mo' },
              { age: 25, city: 'Oslo', name: 'Kim' },
            ],
            [
              { dir: 'asc', key: 'city' },
              { dir: 'desc', key: 'age' },
              { dir: 'asc', key: 'name' },
            ],
          ],
          [
            { age: 40, city: 'Bern', name: 'Mo' },
            { age: 30, city: 'Oslo', name: 'Amy' },
            { age: 30, city: 'Oslo', name: 'Zed' },
            { age: 25, city: 'Oslo', name: 'Kim' },
          ],
        ),
        tc(
          'single numeric key descending',
          [
            [
              { name: 'Ada', score: 70 },
              { name: 'Bo', score: 90 },
              { name: 'Cy', score: 80 },
            ],
            [{ dir: 'desc', key: 'score' }],
          ],
          [
            { name: 'Bo', score: 90 },
            { name: 'Cy', score: 80 },
            { name: 'Ada', score: 70 },
          ],
        ),
        tc(
          'ties on every key keep input order',
          [
            [
              { name: 'P', score: 1 },
              { name: 'Q', score: 1 },
            ],
            [{ dir: 'asc', key: 'score' }],
          ],
          [
            { name: 'P', score: 1 },
            { name: 'Q', score: 1 },
          ],
        ),
        tc(
          'empty spec leaves the order untouched',
          [
            [
              { name: 'B', score: 2 },
              { name: 'A', score: 1 },
            ],
            [],
          ],
          [
            { name: 'B', score: 2 },
            { name: 'A', score: 1 },
          ],
        ),
        tc('no rows', [[], [{ dir: 'asc', key: 'name' }]], []),
      ],
      title: 'Sort by a key spec',
      trap: code(`
type Cell = number | string;
type Row = Record<string, Cell>;

interface SortKey {
  dir: 'asc' | 'desc';
  key: string;
}

function compareCells(a: Cell, b: Cell): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'en');
}

export function solve(rows: Row[], spec: SortKey[]): Row[] {
  return spec.reduce(
    (sorted, { dir, key }) =>
      sorted.toSorted((a, b) => compareCells(a[key] ?? '', b[key] ?? '') * (dir === 'asc' ? 1 : -1)),
    rows,
  );
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Rank `entries` by `score`, highest first, using competition ranking: equal scores share a rank, and the ' +
        'next distinct score skips the ranks consumed — `1, 2, 2, 4`. Equal scores stay in arrival order.\n\n' +
        'Signature: `solve(entries: { name: string; score: number }[]): { name: string; rank: number }[]`\n\n' +
        'Trap: `rank = index + 1` after sorting hands out `1, 2, 3, 4` and pretends the tie never happened.',
      difficulty: 'expert',
      explanation:
        'Three methods, in sequence. `toSorted` with `b.score - a.score` puts the highest score first and, being ' +
        'stable, keeps tied entries in arrival order — nothing later in the pipeline could recover that order once ' +
        'lost. `map` then labels each sorted entry, and the rank is *not* its position: it is the position of the ' +
        'first entry with the same score, which `findIndex` locates, plus one. Every entry in a tie finds the same ' +
        'first occurrence, so they share a rank, and the entry after a tie inherits its true position — ' +
        '`1, 2, 2, 4`, the way medal tables count. `index + 1` gives `1, 2, 3, 4`; a "dense" `1, 2, 2, 3` is a ' +
        'different scheme and fails the same tests. `findIndex` inside `map` is O(n²) in the worst case — a `Map` ' +
        'from score to first index brings it back to O(n) once leaderboards get long.',
      id: 'competition-ranking',
      methods: ['toSorted', 'map', 'findIndex'],
      order: 13,
      solution: code(`
interface Entry {
  name: string;
  score: number;
}

interface Ranked {
  name: string;
  rank: number;
}

export function solve(entries: Entry[]): Ranked[] {
  const sorted = entries.toSorted((a, b) => b.score - a.score);
  return sorted.map(({ name, score }) => ({
    name,
    rank: sorted.findIndex((entry) => entry.score === score) + 1,
  }));
}
`),
      starterCode: code(`
interface Entry {
  name: string;
  score: number;
}

interface Ranked {
  name: string;
  rank: number;
}

export function solve(entries: Entry[]): Ranked[] {
  // Sort descending, then rank each entry by where the FIRST entry with its score sits.
  return [];
}
`),
      tests: [
        tc(
          'a tie shares its rank and skips the next (trap)',
          [
            [
              { name: 'Ana', score: 80 },
              { name: 'Bo', score: 95 },
              { name: 'Cy', score: 80 },
              { name: 'Di', score: 70 },
            ],
          ],
          [
            { name: 'Bo', rank: 1 },
            { name: 'Ana', rank: 2 },
            { name: 'Cy', rank: 2 },
            { name: 'Di', rank: 4 },
          ],
        ),
        tc(
          'three-way tie for first (trap)',
          [
            [
              { name: 'A', score: 50 },
              { name: 'B', score: 50 },
              { name: 'C', score: 50 },
              { name: 'D', score: 10 },
            ],
          ],
          [
            { name: 'A', rank: 1 },
            { name: 'B', rank: 1 },
            { name: 'C', rank: 1 },
            { name: 'D', rank: 4 },
          ],
        ),
        tc(
          'no ties is a plain 1..n',
          [
            [
              { name: 'Low', score: 10 },
              { name: 'High', score: 99 },
            ],
          ],
          [
            { name: 'High', rank: 1 },
            { name: 'Low', rank: 2 },
          ],
        ),
        tc('single entry', [[{ name: 'Only', score: 42 }]], [{ name: 'Only', rank: 1 }]),
        tc('empty leaderboard', [[]], []),
      ],
      title: 'Competition ranking',
      trap: code(`
interface Entry {
  name: string;
  score: number;
}

interface Ranked {
  name: string;
  rank: number;
}

export function solve(entries: Entry[]): Ranked[] {
  return entries.toSorted((a, b) => b.score - a.score).map(({ name }, index) => ({ name, rank: index + 1 }));
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        "Order `items` by a `priority` list: anything named in `priority` comes first, in that list's order; " +
        'everything else follows, alphabetically (`en` locale). Neither input may be mutated.\n\n' +
        'Signature: `solve(items: string[], priority: string[]): string[]`\n\n' +
        'Trap: `priority.indexOf(a) - priority.indexOf(b)` almost does it — what does `indexOf` return for an ' +
        'unknown item?',
      difficulty: 'expert',
      explanation:
        'Building `new Map(priority.map((item, index) => ' +
        '[item, index]))` once turns each named item into its rank in O(1), instead of an `indexOf` scan on every ' +
        'comparison — with `toSorted` making O(n log n) comparisons, that is the difference between O(n log n) ' +
        'and O(n · p · log n). The comparator then reads both ranks with `?? Infinity` so that unknown items sort ' +
        'after every known one, and when both are unknown it falls back to `localeCompare` for a deterministic ' +
        'alphabetical tail. The `indexOf` version fails on exactly that point: an unknown item yields `-1`, which ' +
        'is *less* than every real index, so the strangers march to the front instead of the back, and two ' +
        'unknowns tie in arrival order instead of alphabetically. `toSorted` carries the whole ordering; the ' +
        '`Map` and the `Infinity` sentinel are what let one comparator answer for known and unknown items alike.',
      id: 'priority-order-unknowns-last',
      methods: ['toSorted', 'localeCompare', 'Map'],
      order: 14,
      solution: code(`
export function solve(items: string[], priority: string[]): string[] {
  const rank = new Map<string, number>(priority.map((item, index) => [item, index]));
  return items.toSorted((a, b) => {
    const rankA = rank.get(a) ?? Infinity;
    const rankB = rank.get(b) ?? Infinity;
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return rankA === Infinity ? a.localeCompare(b, 'en') : 0;
  });
}
`),
      starterCode: code(`
export function solve(items: string[], priority: string[]): string[] {
  // Look each item's rank up once (a Map), treat "not listed" as Infinity, and break unknown ties alphabetically.
  return items;
}
`),
      tests: [
        tc(
          'unknown items go last (trap)',
          [
            ['pear', 'kiwi', 'apple'],
            ['apple', 'pear'],
          ],
          ['apple', 'pear', 'kiwi'],
        ),
        tc(
          'unknowns are alphabetical among themselves (trap)',
          [['zed', 'yam', 'fig'], ['fig']],
          ['fig', 'yam', 'zed'],
        ),
        tc(
          'priority order beats alphabetical order',
          [
            ['a', 'b', 'c'],
            ['c', 'a'],
          ],
          ['c', 'a', 'b'],
        ),
        tc(
          'priority names that never appear are ignored',
          [
            ['b', 'a'],
            ['zzz', 'b'],
          ],
          ['b', 'a'],
        ),
        tc('empty priority is a plain alphabetical sort', [['b', 'c', 'a'], []], ['a', 'b', 'c']),
        tc('duplicates keep both copies', [['b', 'a', 'b'], ['b']], ['b', 'b', 'a']),
        tc('no items', [[], ['x']], []),
      ],
      title: 'Priority list, strangers last',
      trap: code(`
export function solve(items: string[], priority: string[]): string[] {
  return items.toSorted((a, b) => priority.indexOf(a) - priority.indexOf(b));
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Sort version strings ascending. Versions are `major.minor.patch` with an optional `-prerelease` suffix, ' +
        'and a pre-release comes *before* the release it precedes: `1.0.0-beta` < `1.0.0`. Pre-release tags ' +
        'compare naturally (`beta.2` < `beta.11`). Do not mutate the input.\n\n' +
        'Signature: `solve(versions: string[]): string[]`\n\n' +
        'Trap: numeric collation alone sorts `1.0.0` ahead of `1.0.0-beta`, because the shorter string wins a tie.',
      difficulty: 'expert',
      explanation:
        '`localeCompare` with `{ numeric: true }` is the right tool for the digit runs — `1.10.0` after `1.9.0`, ' +
        '`beta.11` after `beta.2` — but a collator has no idea that a hyphen means "not yet released". Left alone ' +
        'it treats `1.0.0-beta` as `1.0.0` with extra characters and files it *after* the release. So the ' +
        'comparator splits the job: `indexOf("-")` and `slice` separate the numeric core from the tag, the cores ' +
        'compare with numeric collation first, and only when they tie does the release rule apply — a version ' +
        'with a tag ranks below one without, encoded as `(preA === null ? 1 : 0) - (preB === null ? 1 : 0)`. Two ' +
        'tagged versions with the same core finally compare their tags, again numerically. `toSorted` never sees ' +
        'any of that structure; it just receives a consistent three-valued answer per pair.',
      id: 'semver-with-prerelease',
      methods: ['toSorted', 'localeCompare', 'indexOf', 'slice'],
      order: 15,
      solution: code(`
interface Version {
  core: string;
  pre: null | string;
}

function parse(version: string): Version {
  const dash = version.indexOf('-');
  if (dash === -1) {
    return { core: version, pre: null };
  }
  return { core: version.slice(0, dash), pre: version.slice(dash + 1) };
}

function compareVersions(a: string, b: string): number {
  const left = parse(a);
  const right = parse(b);
  const byCore = left.core.localeCompare(right.core, 'en', { numeric: true });
  if (byCore !== 0) {
    return byCore;
  }
  if (left.pre === null || right.pre === null) {
    return (left.pre === null ? 1 : 0) - (right.pre === null ? 1 : 0);
  }
  return left.pre.localeCompare(right.pre, 'en', { numeric: true });
}

export function solve(versions: string[]): string[] {
  return versions.toSorted(compareVersions);
}
`),
      starterCode: code(`
export function solve(versions: string[]): string[] {
  // Split core from tag at the first '-'; compare cores numerically, then "no tag beats tag", then tags.
  return versions;
}
`),
      tests: [
        tc(
          'pre-release precedes its release (trap)',
          [['1.0.0', '1.0.0-beta', '0.9.0']],
          ['0.9.0', '1.0.0-beta', '1.0.0'],
        ),
        tc(
          'release after every pre-release of the same core (trap)',
          [['2.0.0-rc.1', '2.0.0', '2.0.0-alpha']],
          ['2.0.0-alpha', '2.0.0-rc.1', '2.0.0'],
        ),
        tc(
          'pre-release tags compare numerically',
          [['1.0.0-beta.11', '1.0.0-beta.2', '1.0.0-alpha']],
          ['1.0.0-alpha', '1.0.0-beta.2', '1.0.0-beta.11'],
        ),
        tc(
          'minor and patch runs compare as numbers',
          [['1.10.0', '1.9.0', '1.9.10', '1.9.2']],
          ['1.9.0', '1.9.2', '1.9.10', '1.10.0'],
        ),
        tc('different cores ignore the tags', [['1.0.0-beta', '0.1.0']], ['0.1.0', '1.0.0-beta']),
        tc('empty list', [[]], []),
      ],
      title: 'Semver with pre-releases',
      trap: code(`
export function solve(versions: string[]): string[] {
  return versions.toSorted((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Return the *indices* of `xs` in the order that would sort `xs` ascending — an argsort. Equal values keep ' +
        'their index order, and `xs` itself must not move.\n\n' +
        'Signature: `solve(xs: number[]): number[]`\n\n' +
        'Example: `solve([30, 10, 20])` → `[1, 2, 0]`, because `xs[1] ≤ xs[2] ≤ xs[0]`.',
      difficulty: 'expert',
      explanation:
        'Sorting a proxy is the trick: `xs.map((_, index) => index)` enumerates `[0, 1, …]`, and ' +
        '`toSorted((a, b) => xs[a] - xs[b])` orders those indices by the values they point at. The comparator ' +
        'reads *through* the index into the original array, so `xs` is never touched and the output is a ' +
        'permutation you can apply to any parallel array — names, timestamps, whatever travels with the numbers — ' +
        'which is why NumPy and pandas expose this as `argsort`. The tempting version, `xs.map((x) => ' +
        'sorted.indexOf(x))`, computes something else: the *rank* of each element, `[2, 0, 1]` for `[30, 10, 20]`, ' +
        'which is the inverse permutation. Rank and argsort only agree when both are the identity. `indexOf` also ' +
        'collapses duplicates — two `5`s get the same rank and one index disappears — where the proxy sort, being ' +
        'stable, keeps their index order intact. Two steps, one pass each: enumerate with `map`, then `toSorted`.',
      id: 'argsort-indices',
      methods: ['toSorted', 'map'],
      order: 16,
      solution: code(`
export function solve(xs: number[]): number[] {
  return xs.map((_, index) => index).toSorted((a, b) => (xs[a] ?? 0) - (xs[b] ?? 0));
}
`),
      starterCode: code(`
export function solve(xs: number[]): number[] {
  // Sort the index list, not xs — the comparator can look up xs[a] and xs[b].
  return xs.map((_, index) => index);
}
`),
      tests: [
        tc('argsort is not rank (trap)', [[30, 10, 20]], [1, 2, 0]),
        tc('duplicates keep index order (trap)', [[5, 5, 1]], [2, 0, 1]),
        tc('already sorted is the identity', [[1, 2, 3]], [0, 1, 2]),
        tc('reversed input', [[3, 2, 1]], [2, 1, 0]),
        tc('double digits sort numerically', [[10, 9, 100]], [1, 0, 2]),
        tc('single element', [[7]], [0]),
        tc('empty array', [[]], []),
      ],
      title: 'Argsort',
      trap: code(`
export function solve(xs: number[]): number[] {
  const sorted = xs.toSorted((a, b) => a - b);
  return xs.map((x) => sorted.indexOf(x));
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'List `hires` so that departments appear in the order they are first seen, and within each department ' +
        'the most recently listed hire comes first. Do not mutate the input.\n\n' +
        'Signature: `solve(hires: { department: string; name: string }[]): { department: string; name: string }[]`\n\n' +
        'Trap: a two-key `toSorted` — department, then descending original position — quietly alphabetises the ' +
        'departments.',
      difficulty: 'expert',
      explanation:
        'This is grouping first and ordering second, and the two must not be collapsed into one sort. ' +
        '`Map.groupBy` (ES2024) buckets the hires by department and, because a `Map` remembers insertion order, ' +
        'its `values()` come out in first-seen order — exactly the group order the task asks for. Each bucket is ' +
        'already in arrival order, so `toReversed` flips it to newest-first without touching the input, and ' +
        '`flatMap` stitches the reversed buckets back into one list. The sort-based attempt compares departments ' +
        'with `localeCompare`, which imposes *alphabetical* order on the groups: when `Sales` is seen before ' +
        '`Eng`, the result puts `Eng` first and fails even though the within-group order is right. A comparator ' +
        'can only express orderings that are a function of the two elements; "first seen" is a property of the ' +
        'whole list, which is why grouping has to carry that part and `toReversed` handles the part that really ' +
        'is a reversal.',
      id: 'newest-first-within-group',
      methods: ['toReversed', 'Map.groupBy', 'flatMap'],
      order: 17,
      solution: code(`
interface Hire {
  department: string;
  name: string;
}

export function solve(hires: Hire[]): Hire[] {
  const byDepartment = Map.groupBy(hires, (hire) => hire.department);
  return [...byDepartment.values()].flatMap((group) => group.toReversed());
}
`),
      starterCode: code(`
interface Hire {
  department: string;
  name: string;
}

export function solve(hires: Hire[]): Hire[] {
  // Group first (Map.groupBy keeps first-seen order), reverse each group, then flatten.
  return hires;
}
`),
      tests: [
        tc(
          'departments keep first-seen order (trap)',
          [
            [
              { department: 'Sales', name: 'Uma' },
              { department: 'Eng', name: 'Ada' },
              { department: 'Sales', name: 'Rex' },
              { department: 'Eng', name: 'Lin' },
            ],
          ],
          [
            { department: 'Sales', name: 'Rex' },
            { department: 'Sales', name: 'Uma' },
            { department: 'Eng', name: 'Lin' },
            { department: 'Eng', name: 'Ada' },
          ],
        ),
        tc(
          'one hire per department keeps list order (trap)',
          [
            [
              { department: 'Zoo', name: 'Al' },
              { department: 'Art', name: 'Bea' },
            ],
          ],
          [
            { department: 'Zoo', name: 'Al' },
            { department: 'Art', name: 'Bea' },
          ],
        ),
        tc(
          'first-seen order that happens to be alphabetical',
          [
            [
              { department: 'Eng', name: 'Ada' },
              { department: 'Ops', name: 'Bo' },
              { department: 'Eng', name: 'Cy' },
            ],
          ],
          [
            { department: 'Eng', name: 'Cy' },
            { department: 'Eng', name: 'Ada' },
            { department: 'Ops', name: 'Bo' },
          ],
        ),
        tc(
          'single department is a plain reversal',
          [
            [
              { department: 'Ops', name: 'A' },
              { department: 'Ops', name: 'B' },
              { department: 'Ops', name: 'C' },
            ],
          ],
          [
            { department: 'Ops', name: 'C' },
            { department: 'Ops', name: 'B' },
            { department: 'Ops', name: 'A' },
          ],
        ),
        tc('empty roster', [[]], []),
      ],
      title: 'Newest first, within each group',
      trap: code(`
interface Hire {
  department: string;
  name: string;
}

export function solve(hires: Hire[]): Hire[] {
  return hires.toSorted(
    (a, b) => a.department.localeCompare(b.department, 'en') || hires.indexOf(b) - hires.indexOf(a),
  );
}
`),
    },
    {
      categoryId: 'sorting-and-ordering',
      description:
        'Rotate `xs` to the right by `k` positions using only reversals — the classic three-reversal rotation. ' +
        '`k` may be `0`, negative (rotate left), or larger than the array. Do not mutate the input.\n\n' +
        'Signature: `solve(xs: number[], k: number): number[]`\n\n' +
        'Example: `solve([1, 2, 3, 4, 5], 2)` → `[4, 5, 1, 2, 3]`; `solve([1, 2, 3], -1)` → `[2, 3, 1]`.',
      difficulty: 'expert',
      explanation:
        'Rotation by `k` is three reversals: reverse the whole array, then reverse the first `k` elements, then ' +
        'reverse the rest. `[1, 2, 3, 4, 5]` reversed is `[5, 4, 3, 2, 1]`; flipping the first two gives ' +
        '`[4, 5, …]` and the remaining three gives `[…, 1, 2, 3]` — the rotation, with every element moved ' +
        'exactly twice. `toReversed` on the whole and on each `slice` keeps it pure. What the tests actually ' +
        'catch is the normalisation step: `k` ' +
        'must be reduced to `((k % length) + length) % length` before slicing, so `7` on five elements means `2`, ' +
        '`-6` means `4`, and the empty array is guarded before `% 0` can yield `NaN`. The slice-and-concat ' +
        'shortcut `xs.slice(-k).concat(xs.slice(0, -k))` skips that step and returns the array unrotated as soon ' +
        'as `k` leaves the range `[-length, length]`, because `slice` clamps out-of-range bounds instead of ' +
        'wrapping them.',
      id: 'rotate-with-reversals',
      methods: ['toReversed', 'slice'],
      order: 18,
      solution: code(`
export function solve(xs: number[], k: number): number[] {
  if (xs.length === 0) {
    return [];
  }
  const shift = ((k % xs.length) + xs.length) % xs.length;
  const flipped = xs.toReversed();
  return [...flipped.slice(0, shift).toReversed(), ...flipped.slice(shift).toReversed()];
}
`),
      starterCode: code(`
export function solve(xs: number[], k: number): number[] {
  // Normalise k into [0, length), reverse everything, then reverse the first k and the rest separately.
  return xs;
}
`),
      tests: [
        tc('rotate right by two', [[1, 2, 3, 4, 5], 2], [4, 5, 1, 2, 3]),
        tc('k larger than the array wraps (trap)', [[1, 2, 3, 4, 5], 7], [4, 5, 1, 2, 3]),
        tc('negative k rotates left', [[1, 2, 3], -1], [2, 3, 1]),
        tc('negative k beyond the length wraps (trap)', [[1, 2, 3, 4, 5], -6], [2, 3, 4, 5, 1]),
        tc('k of zero is the identity', [[1, 2, 3], 0], [1, 2, 3]),
        tc('k equal to the length is the identity', [[1, 2, 3], 3], [1, 2, 3]),
        tc('empty array with any k', [[], 4], []),
      ],
      title: 'Rotate with three reversals',
      trap: code(`
export function solve(xs: number[], k: number): number[] {
  return xs.slice(-k).concat(xs.slice(0, -k));
}
`),
    },
  ],
};
