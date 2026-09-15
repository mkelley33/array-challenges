import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const groupingAndAggregation: CategoryModule = {
  category: {
    description:
      'Turn flat lists into keyed structures — objects, Maps, and nested Maps — with the ES2024 groupBy family.',
    id: 'grouping-and-aggregation',
    order: 10,
    title: 'Grouping & Aggregation',
  },
  challenges: [
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Group an array of expense objects by their `category` property, returning an object whose keys are ' +
        'category names and whose values are arrays of the matching expenses (in input order).\n\n' +
        'Signature: `solve(expenses: { category: string; amount: number }[]): Record<string, { category: string; amount: number }[]>`\n\n' +
        'Trap: `Object.groupBy` is a *static* method — `Object.groupBy(items, keyFn)`, not `items.groupBy(...)`.',
      difficulty: 'novice',
      explanation:
        '`Object.groupBy` (ES2024) lives on the `Object` constructor, not on `Array.prototype` — you call ' +
        '`Object.groupBy(expenses, (expense) => expense.category)`, never `expenses.groupBy(...)`. It walks the ' +
        'array once, calls the key function on each element, and pushes the element onto the array stored under ' +
        'that key, so items keep their input order inside each group. The result is a null-prototype object ' +
        '(no inherited `toString` or `hasOwnProperty`), which is why the polyfill uses `Object.create(null)`; ' +
        'structurally it still compares equal to a plain object literal with the same keys.',
      id: 'group-expenses-by-category',
      methods: ['Object.groupBy'],
      order: 1,
      solution: code(`
interface Expense {
  amount: number;
  category: string;
}

export function solve(expenses: Expense[]): Record<string, Expense[]> {
  return Object.groupBy(expenses, (expense) => expense.category) as Record<string, Expense[]>;
}
`),
      starterCode: code(`
interface Expense {
  amount: number;
  category: string;
}

export function solve(expenses: Expense[]): Record<string, Expense[]> {
  // Object.groupBy is a STATIC method: Object.groupBy(items, keyFn) — not expenses.groupBy(...).
  return {};
}
`),
      tests: [
        tc(
          'groups two categories',
          [
            [
              { amount: 12, category: 'food' },
              { amount: 50, category: 'travel' },
              { amount: 8, category: 'food' },
            ],
          ],
          {
            food: [
              { amount: 12, category: 'food' },
              { amount: 8, category: 'food' },
            ],
            travel: [{ amount: 50, category: 'travel' }],
          },
        ),
        tc(
          'single category keeps input order',
          [
            [
              { amount: 3, category: 'coffee' },
              { amount: 4, category: 'coffee' },
            ],
          ],
          {
            coffee: [
              { amount: 3, category: 'coffee' },
              { amount: 4, category: 'coffee' },
            ],
          },
        ),
        tc('empty expense list', [[]], {}),
        tc(
          'three categories with one expense each',
          [
            [
              { amount: 1, category: 'a' },
              { amount: 2, category: 'b' },
              { amount: 3, category: 'c' },
            ],
          ],
          {
            a: [{ amount: 1, category: 'a' }],
            b: [{ amount: 2, category: 'b' }],
            c: [{ amount: 3, category: 'c' }],
          },
        ),
      ],
      title: 'Group expenses by category',
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Group prices into bands: `budget` for prices below 20, `mid` for 20 up to 99.99, and `premium` for 100 and ' +
        'above. Bands with no prices must not appear as keys at all.\n\n' +
        'Signature: `solve(prices: number[]): Record<string, number[]>`\n\n' +
        'The key does not have to exist on the items — the callback can *compute* it.',
      difficulty: 'intermediate',
      explanation:
        'The key function passed to `Object.groupBy` is not limited to reading a property — it can derive any ' +
        'string from the element, so a chain of comparisons like `price < 20 ? "budget" : ...` turns a continuous ' +
        'range of numbers into a handful of named buckets. A group key only comes into existence when some element ' +
        'produces it, which is why an all-budget input yields `{ budget: [...] }` with no empty `mid` or `premium` ' +
        'keys — check with `key in result` or `?? []` before consuming a band that might be absent.',
      id: 'price-bands',
      methods: ['Object.groupBy'],
      order: 2,
      solution: code(`
export function solve(prices: number[]): Record<string, number[]> {
  return Object.groupBy(prices, (price) => {
    if (price < 20) {
      return 'budget';
    }
    return price >= 100 ? 'premium' : 'mid';
  }) as Record<string, number[]>;
}
`),
      starterCode: code(`
export function solve(prices: number[]): Record<string, number[]> {
  // The groupBy callback can RETURN any string — compute 'budget' | 'mid' | 'premium' from the number.
  return {};
}
`),
      tests: [
        tc('all three bands', [[5, 20, 100, 19.99, 99.99, 150]], {
          budget: [5, 19.99],
          mid: [20, 99.99],
          premium: [100, 150],
        }),
        tc('boundary values land in the right band', [[19.99, 20, 99.99, 100]], {
          budget: [19.99],
          mid: [20, 99.99],
          premium: [100],
        }),
        tc('missing bands are absent, not empty', [[1, 2]], { budget: [1, 2] }),
        tc('empty price list', [[]], {}),
      ],
      title: 'Price bands with computed keys',
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Split exam results into two groups keyed by their boolean `passed` property, returning a `Map` whose keys ' +
        'are the actual booleans `true` and `false` — not the strings `"true"` and `"false"`.\n\n' +
        'Signature: `solve(results: { name: string; passed: boolean }[]): Map<boolean, { name: string; passed: boolean }[]>`\n\n' +
        'A group only exists if at least one result produced its key.',
      difficulty: 'intermediate',
      explanation:
        'Object keys can only be strings or symbols, so `Object.groupBy` would coerce the boolean `true` into the ' +
        'property name `"true"` — and once coerced, `true` and `"true"` collide and the original type is gone. ' +
        '`Map.groupBy` performs the same single-pass bucketing but stores keys in a `Map` using SameValueZero ' +
        'equality, so booleans, numbers, dates, and even object references survive as keys unchanged. Reach for ' +
        '`Map.groupBy` whenever the grouping key is not naturally a string; the lookup afterwards is ' +
        '`result.get(true)` rather than `result["true"]`.',
      id: 'pass-fail-roster',
      methods: ['Map.groupBy'],
      order: 3,
      solution: code(`
interface ExamResult {
  name: string;
  passed: boolean;
}

export function solve(results: ExamResult[]): Map<boolean, ExamResult[]> {
  return Map.groupBy(results, (result) => result.passed);
}
`),
      starterCode: code(`
interface ExamResult {
  name: string;
  passed: boolean;
}

export function solve(results: ExamResult[]): Map<boolean, ExamResult[]> {
  // Object.groupBy would turn true into the string 'true' — which groupBy keeps booleans intact?
  return new Map();
}
`),
      tests: [
        tc(
          'mixed pass and fail',
          [
            [
              { name: 'Ada', passed: true },
              { name: 'Grace', passed: false },
              { name: 'Alan', passed: true },
            ],
          ],
          new Map([
            [
              true,
              [
                { name: 'Ada', passed: true },
                { name: 'Alan', passed: true },
              ],
            ],
            [false, [{ name: 'Grace', passed: false }]],
          ]),
        ),
        tc(
          'everyone passed — no false key',
          [
            [
              { name: 'Ada', passed: true },
              { name: 'Alan', passed: true },
            ],
          ],
          new Map([
            [
              true,
              [
                { name: 'Ada', passed: true },
                { name: 'Alan', passed: true },
              ],
            ],
          ]),
        ),
        tc(
          'everyone failed — no true key',
          [[{ name: 'Grace', passed: false }]],
          new Map([[false, [{ name: 'Grace', passed: false }]]]),
        ),
        tc('empty roster', [[]], new Map()),
      ],
      title: 'Pass/fail roster as a Map',
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Index an array of items by their unique `id`: build a `Map` from each id to the item itself, so lookups ' +
        'become `O(1)`. If two items share an id, the *later* one wins.\n\n' +
        'Signature: `solve(items: { id: number; name: string }[]): Map<number, { id: number; name: string }>`\n\n' +
        'This is keyBy (one value per key), not groupBy (an array per key).',
      difficulty: 'intermediate',
      explanation:
        'The `Map` constructor accepts any iterable of `[key, value]` pairs, so `items.map((item) => [item.id, item])` ' +
        'followed by `new Map(...)` builds the whole index in one expression. Contrast the two shapes: groupBy is ' +
        '1:many — every key holds an *array* of members — while keyBy is 1:1, each key holding a single item, which ' +
        'is what you want when ids are unique and you need constant-time lookup instead of a linear `find` per ' +
        'access. Because `Map.prototype.set` overwrites existing keys, feeding duplicate ids means the last pair ' +
        'processed silently replaces the earlier one — later-duplicate-wins — so keyBy also doubles as ' +
        '“latest record per id” when applied to an append-only log.',
      id: 'index-items-by-id',
      methods: ['map'],
      order: 4,
      solution: code(`
interface Item {
  id: number;
  name: string;
}

export function solve(items: Item[]): Map<number, Item> {
  return new Map(items.map((item): [number, Item] => [item.id, item]));
}
`),
      starterCode: code(`
interface Item {
  id: number;
  name: string;
}

export function solve(items: Item[]): Map<number, Item> {
  // new Map(...) accepts an iterable of [key, value] pairs — map each item into one.
  return new Map();
}
`),
      tests: [
        tc(
          'indexes each item by id',
          [
            [
              { id: 1, name: 'alpha' },
              { id: 2, name: 'beta' },
            ],
          ],
          new Map([
            [1, { id: 1, name: 'alpha' }],
            [2, { id: 2, name: 'beta' }],
          ]),
        ),
        tc(
          'later duplicate wins',
          [
            [
              { id: 1, name: 'old' },
              { id: 1, name: 'new' },
            ],
          ],
          new Map([[1, { id: 1, name: 'new' }]]),
        ),
        tc('single item', [[{ id: 7, name: 'solo' }]], new Map([[7, { id: 7, name: 'solo' }]])),
        tc('empty list', [[]], new Map()),
      ],
      title: 'Index by unique id',
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Total the `amount` spent per `category` and return one `{ category, total }` object per category, sorted ' +
        'ascending by category name so the output is deterministic.\n\n' +
        'Signature: `solve(expenses: { category: string; amount: number }[]): { category: string; total: number }[]`\n\n' +
        'This is the group-then-aggregate pipeline: bucket first, then fold each bucket down to one number.',
      difficulty: 'advanced',
      explanation:
        'Grouping and aggregating are separate steps, and keeping them separate keeps each trivial: ' +
        '`Object.groupBy` buckets the expenses by category, `Object.entries` turns the resulting object back into ' +
        'an iterable of `[category, items]` pairs, and `map` collapses each bucket into `{ category, total }` with ' +
        'a `reduce` over the amounts. The final `sort` matters because object key order follows insertion order of ' +
        'the input, which is an accident of the data — sorting by name makes the output stable no matter how the ' +
        'expenses arrived. This groupBy → entries → map pipeline is the idiomatic replacement for a hand-rolled ' +
        'accumulator object.',
      id: 'total-per-category',
      methods: ['Object.groupBy', 'map'],
      order: 5,
      solution: code(`
interface Expense {
  amount: number;
  category: string;
}

interface CategoryTotal {
  category: string;
  total: number;
}

export function solve(expenses: Expense[]): CategoryTotal[] {
  const groups = Object.groupBy(expenses, (expense) => expense.category) as Record<string, Expense[]>;
  return Object.entries(groups)
    .map(([category, items]) => ({
      category,
      total: items.reduce((sum, item) => sum + item.amount, 0),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}
`),
      starterCode: code(`
interface Expense {
  amount: number;
  category: string;
}

interface CategoryTotal {
  category: string;
  total: number;
}

export function solve(expenses: Expense[]): CategoryTotal[] {
  // Pipeline: Object.groupBy → Object.entries → map each [category, items] pair → sort by name.
  return [];
}
`),
      tests: [
        tc(
          'totals per category, sorted by name',
          [
            [
              { amount: 12, category: 'food' },
              { amount: 50, category: 'travel' },
              { amount: 8, category: 'food' },
              { amount: 5, category: 'office' },
            ],
          ],
          [
            { category: 'food', total: 20 },
            { category: 'office', total: 5 },
            { category: 'travel', total: 50 },
          ],
        ),
        tc(
          'single category sums all amounts',
          [
            [
              { amount: 1, category: 'food' },
              { amount: 2, category: 'food' },
              { amount: 3, category: 'food' },
            ],
          ],
          [{ category: 'food', total: 6 }],
        ),
        tc(
          'input order does not dictate output order (trap)',
          [
            [
              { amount: 1, category: 'zoo' },
              { amount: 2, category: 'apple' },
            ],
          ],
          [
            { category: 'apple', total: 2 },
            { category: 'zoo', total: 1 },
          ],
        ),
        tc('empty expense list', [[]], []),
      ],
      title: 'Total per category',
      trap: code(`
interface Expense {
  amount: number;
  category: string;
}

interface CategoryTotal {
  category: string;
  total: number;
}

export function solve(expenses: Expense[]): CategoryTotal[] {
  const groups = Object.groupBy(expenses, (expense) => expense.category) as Record<string, Expense[]>;
  return Object.entries(groups).map(([category, items]) => ({
    category,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  }));
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Lay out a ticket board: group `tickets` by `status`, but the board needs a column for every status in ' +
        '`columns` — including the empty ones — and nothing else: a ticket whose status is not a listed column is ' +
        'dropped.\n\n' +
        'Signature: `solve(tickets: { id: number; status: string }[], columns: string[]): Record<string, { id: number; status: string }[]>`\n\n' +
        'Trap: `Object.groupBy` only creates the keys it meets — a column no ticket mentions never appears.',
      difficulty: 'advanced',
      explanation:
        '`Object.groupBy` is driven entirely by the data: a key exists in the result only because some element ' +
        'produced it, and every key an element produces is kept. A board driven by a list of columns has the ' +
        'opposite contract — the *columns* decide which keys exist, and the data merely fills them. So the ' +
        'grouping is only half the job. The reference solution still lets `Object.groupBy` do the bucketing, then ' +
        'walks `columns` with `map` and reads each bucket with `groups[column] ?? []`, so an unmentioned status ' +
        'becomes an empty array instead of a missing key, and a status outside the list is never read at all. ' +
        '`Object.fromEntries` turns those `[column, tickets]` pairs back into the record. Returning the raw ' +
        'groupBy result fails both ways: the empty `done` column vanishes, and an `archived` ticket sneaks in.',
      id: 'every-column-present',
      methods: ['Object.groupBy', 'Object.fromEntries', 'map'],
      order: 6,
      solution: code(`
interface Ticket {
  id: number;
  status: string;
}

export function solve(tickets: Ticket[], columns: string[]): Record<string, Ticket[]> {
  const groups = Object.groupBy(tickets, (ticket) => ticket.status);
  return Object.fromEntries(columns.map((column): [string, Ticket[]] => [column, groups[column] ?? []]));
}
`),
      starterCode: code(`
interface Ticket {
  id: number;
  status: string;
}

export function solve(tickets: Ticket[], columns: string[]): Record<string, Ticket[]> {
  // groupBy only creates the keys it sees — walk columns yourself and fill the gaps with ?? [].
  return {};
}
`),
      tests: [
        tc(
          'every column has tickets',
          [
            [
              { id: 1, status: 'open' },
              { id: 2, status: 'done' },
              { id: 3, status: 'open' },
            ],
            ['open', 'done'],
          ],
          {
            done: [{ id: 2, status: 'done' }],
            open: [
              { id: 1, status: 'open' },
              { id: 3, status: 'open' },
            ],
          },
        ),
        tc('column with no tickets is still present (trap)', [[{ id: 1, status: 'open' }], ['open', 'done']], {
          done: [],
          open: [{ id: 1, status: 'open' }],
        }),
        tc(
          'ticket with an unlisted status is dropped (trap)',
          [
            [
              { id: 1, status: 'open' },
              { id: 2, status: 'archived' },
            ],
            ['open'],
          ],
          { open: [{ id: 1, status: 'open' }] },
        ),
        tc('no tickets yields every column empty', [[], ['todo', 'doing']], { doing: [], todo: [] }),
        tc(
          'order inside a column follows input',
          [
            [
              { id: 5, status: 'done' },
              { id: 2, status: 'done' },
            ],
            ['done'],
          ],
          {
            done: [
              { id: 5, status: 'done' },
              { id: 2, status: 'done' },
            ],
          },
        ),
      ],
      title: 'Every column on the board',
      trap: code(`
interface Ticket {
  id: number;
  status: string;
}

export function solve(tickets: Ticket[], columns: string[]): Record<string, Ticket[]> {
  return Object.groupBy(tickets, (ticket) => ticket.status) as Record<string, Ticket[]>;
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Count how many times each word appears in `words`, returning a plain object mapping word → count. The ' +
        'words come from user input, so any string is possible — including `"constructor"` and `"toString"`.\n\n' +
        'Signature: `solve(words: string[]): Record<string, number>`\n\n' +
        'Trap: a `{}` accumulator inherits from `Object.prototype`, so `counts["constructor"]` is already defined ' +
        'before you have counted anything.',
      difficulty: 'advanced',
      explanation:
        'The classic `reduce` into `{}` has a hole: a plain object literal inherits from `Object.prototype`, so ' +
        '`counts["constructor"]` is the `Object` function before the first word is counted. `?? 0` does not help — ' +
        'a function is not nullish — and `Object + 1` produces a string, not a count. `Object.groupBy` sidesteps ' +
        'this because its result is a *null-prototype* object: there is nothing to inherit, so every key you read ' +
        'is either your own group or `undefined`. Grouping each word under itself gives one array per distinct ' +
        'word, `Object.entries` walks those `[word, occurrences]` pairs, and `Object.fromEntries` rebuilds the ' +
        'record with each array replaced by its `length`. The output is an ordinary object — its `constructor` ' +
        'key is now an own property holding `2` — which is exactly what the caller asked for.',
      id: 'word-counts-without-prototype-leaks',
      methods: ['Object.groupBy', 'Object.entries', 'Object.fromEntries'],
      order: 7,
      solution: code(`
export function solve(words: string[]): Record<string, number> {
  const groups = Object.groupBy(words, (word) => word) as Record<string, string[]>;
  return Object.fromEntries(Object.entries(groups).map(([word, occurrences]) => [word, occurrences.length]));
}
`),
      starterCode: code(`
export function solve(words: string[]): Record<string, number> {
  // Object.groupBy hands back a null-prototype object — nothing inherited can collide with a word.
  return {};
}
`),
      tests: [
        tc('ordinary words count cleanly', [['a', 'b', 'a']], { a: 2, b: 1 }),
        tc('a word that names an inherited method (trap)', [['constructor', 'apple', 'constructor']], {
          apple: 1,
          constructor: 2,
        }),
        tc('toString as a word (trap)', [['toString']], { toString: 1 }),
        tc('every word unique', [['x', 'y']], { x: 1, y: 1 }),
        tc('no words', [[]], {}),
      ],
      title: 'Count words named constructor',
      trap: code(`
export function solve(words: string[]): Record<string, number> {
  return words.reduce<Record<string, number>>((counts, word) => {
    counts[word] = (counts[word] ?? 0) + 1;
    return counts;
  }, {});
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Bucket `scores` by decade (`90` for 90–99, `40` for 40–49, and so on) and return the buckets as ' +
        '`[decade, scores]` pairs in the order each decade was *first seen* in the input.\n\n' +
        'Signature: `solve(scores: number[]): [number, number[]][]`\n\n' +
        'Trap: an object cannot remember the order of integer-like keys — `Object.entries` hands them back sorted.',
      difficulty: 'advanced',
      explanation:
        'JavaScript objects enumerate integer-like keys — `"40"`, `"90"` — in ascending numeric order *before* ' +
        'every other key, regardless of when they were inserted. So `Object.groupBy` with a numeric decade key ' +
        'silently reorders the groups: for `[95, 42, 91]` the `90` bucket is created first, but `Object.entries` ' +
        'lists `40` before it, and the first-seen order is gone. (It also hands the keys back as strings, which is ' +
        'why the trap needs a `Number()` call.) `Map.groupBy` has neither problem: a `Map` keeps its keys as real ' +
        'numbers and iterates them in insertion order, so spreading the result with `[...Map.groupBy(...)]` yields ' +
        '`[decade, scores]` tuples in exactly the order the decades appeared. Rule of thumb: when the key is a ' +
        'number, or when the order of the groups matters, group into a `Map`.',
      id: 'decades-in-first-seen-order',
      methods: ['Map.groupBy', 'Object.groupBy'],
      order: 8,
      solution: code(`
export function solve(scores: number[]): [number, number[]][] {
  return [...Map.groupBy(scores, (score) => Math.floor(score / 10) * 10)];
}
`),
      starterCode: code(`
export function solve(scores: number[]): [number, number[]][] {
  // Which groupBy remembers the order its keys were created in — and keeps them as numbers?
  return [];
}
`),
      tests: [
        tc(
          'decades in ascending first-seen order',
          [[12, 15, 27]],
          [
            [10, [12, 15]],
            [20, [27]],
          ],
        ),
        tc(
          'a higher decade seen first stays first (trap)',
          [[95, 42, 91]],
          [
            [90, [95, 91]],
            [40, [42]],
          ],
        ),
        tc(
          'zero decade seen after others (trap)',
          [[33, 7, 30]],
          [
            [30, [33, 30]],
            [0, [7]],
          ],
        ),
        tc('single score', [[50]], [[50, [50]]]),
        tc('no scores', [[]], []),
      ],
      title: 'Decades in first-seen order',
      trap: code(`
export function solve(scores: number[]): [number, number[]][] {
  const groups = Object.groupBy(scores, (score) => Math.floor(score / 10) * 10) as Record<string, number[]>;
  return Object.entries(groups).map(([decade, group]): [number, number[]] => [Number(decade), group]);
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Every file carries its `owner` as an embedded `{ id, name }` object. Build one section per owner — ' +
        '`{ files, owner }`, with the files in input order — in the order owners first appear. Two files with the ' +
        'same owner id belong in the same section.\n\n' +
        'Signature: `solve(files: { owner: { id: number; name: string }; path: string }[]): { files: { owner: { id: number; name: string }; path: string }[]; owner: { id: number; name: string } }[]`\n\n' +
        'Trap: `Map` keys are compared by identity — two owner objects that *look* the same are two different keys.',
      difficulty: 'advanced',
      explanation:
        '`Map.groupBy` compares keys with SameValueZero, which for objects means reference identity: `{ id: 1 }` ' +
        'and another `{ id: 1 }` are as different as `1` and `2`. Every file here carries its *own* owner object, ' +
        'so grouping on `file.owner` produces one group per file — the sections for Ada are split in two, and the ' +
        'test that puts two of her files together fails. The fix is to group on a primitive that captures the ' +
        'identity you mean: `file.owner.id`. `Map.groupBy` then gives one array per owner id, in first-seen order, ' +
        'and `map` over `.values()` reshapes each group into a section, borrowing the owner object from the ' +
        'group’s first file. The general rule: when the thing you want to group by is an object, pick the field ' +
        'that *is* its identity and group by that, because no `Map` will ever treat two separate objects as equal.',
      id: 'sections-per-owner',
      methods: ['Map.groupBy', 'map'],
      order: 9,
      solution: code(`
interface Owner {
  id: number;
  name: string;
}

interface FileRecord {
  owner: Owner;
  path: string;
}

interface Section {
  files: FileRecord[];
  owner: Owner;
}

export function solve(files: FileRecord[]): Section[] {
  const byOwnerId = Map.groupBy(files, (file) => file.owner.id);
  return [...byOwnerId.values()].map((group): Section => ({ files: group, owner: group[0].owner }));
}
`),
      starterCode: code(`
interface Owner {
  id: number;
  name: string;
}

interface FileRecord {
  owner: Owner;
  path: string;
}

interface Section {
  files: FileRecord[];
  owner: Owner;
}

export function solve(files: FileRecord[]): Section[] {
  // Two owner objects with the same id are still two Map keys — group by something primitive.
  return [];
}
`),
      tests: [
        tc(
          'one file per owner',
          [
            [
              { owner: { id: 1, name: 'Ada' }, path: 'a.txt' },
              { owner: { id: 2, name: 'Bob' }, path: 'b.txt' },
            ],
          ],
          [
            { files: [{ owner: { id: 1, name: 'Ada' }, path: 'a.txt' }], owner: { id: 1, name: 'Ada' } },
            { files: [{ owner: { id: 2, name: 'Bob' }, path: 'b.txt' }], owner: { id: 2, name: 'Bob' } },
          ],
        ),
        tc(
          'two files from the same owner share one section (trap)',
          [
            [
              { owner: { id: 1, name: 'Ada' }, path: 'a.txt' },
              { owner: { id: 2, name: 'Bob' }, path: 'b.txt' },
              { owner: { id: 1, name: 'Ada' }, path: 'c.txt' },
            ],
          ],
          [
            {
              files: [
                { owner: { id: 1, name: 'Ada' }, path: 'a.txt' },
                { owner: { id: 1, name: 'Ada' }, path: 'c.txt' },
              ],
              owner: { id: 1, name: 'Ada' },
            },
            { files: [{ owner: { id: 2, name: 'Bob' }, path: 'b.txt' }], owner: { id: 2, name: 'Bob' } },
          ],
        ),
        tc(
          'every file belongs to one owner (trap)',
          [
            [
              { owner: { id: 1, name: 'Ada' }, path: 'x' },
              { owner: { id: 1, name: 'Ada' }, path: 'y' },
            ],
          ],
          [
            {
              files: [
                { owner: { id: 1, name: 'Ada' }, path: 'x' },
                { owner: { id: 1, name: 'Ada' }, path: 'y' },
              ],
              owner: { id: 1, name: 'Ada' },
            },
          ],
        ),
        tc(
          'sections follow first-seen owner order',
          [
            [
              { owner: { id: 2, name: 'Bob' }, path: 'b' },
              { owner: { id: 1, name: 'Ada' }, path: 'a' },
            ],
          ],
          [
            { files: [{ owner: { id: 2, name: 'Bob' }, path: 'b' }], owner: { id: 2, name: 'Bob' } },
            { files: [{ owner: { id: 1, name: 'Ada' }, path: 'a' }], owner: { id: 1, name: 'Ada' } },
          ],
        ),
        tc('no files', [[]], []),
      ],
      title: 'Sections per owner',
      trap: code(`
interface Owner {
  id: number;
  name: string;
}

interface FileRecord {
  owner: Owner;
  path: string;
}

interface Section {
  files: FileRecord[];
  owner: Owner;
}

export function solve(files: FileRecord[]): Section[] {
  return [...Map.groupBy(files, (file) => file.owner)].map(([owner, group]): Section => ({ files: group, owner }));
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Split `lines` into pages of `size` lines each, in order; the last page may be shorter. Lines can repeat ' +
        'anywhere in the input.\n\n' +
        'Signature: `solve(lines: string[], size: number): string[][]`\n\n' +
        'Trap: the page a line belongs on depends on its *position*, and `indexOf` only ever finds the first copy.',
      difficulty: 'advanced',
      explanation:
        'The key selector of `Map.groupBy` receives two arguments — the element *and its index* — and the index ' +
        'is what a positional key needs: `Math.floor(index / size)` sends lines 0 and 1 to page `0`, lines 2 and ' +
        '3 to page `1`, and so on. Reaching for `lines.indexOf(line)` instead looks equivalent and is wrong the ' +
        'moment a line repeats: `indexOf` returns the position of the *first* copy, so every duplicate is filed on ' +
        'the first copy’s page and later pages come up short (it is also O(n) per element, turning the pagination ' +
        'quadratic). Because the page numbers are created in ascending order, `Map.groupBy` yields the pages in ' +
        'sequence and `[...pages.values()]` drops the keys to leave the array of pages. Any time a grouping key ' +
        'is about *where* an element sits rather than *what* it is, the second callback argument is the tool.',
      id: 'pages-by-index',
      methods: ['Map.groupBy'],
      order: 10,
      solution: code(`
export function solve(lines: string[], size: number): string[][] {
  return [...Map.groupBy(lines, (_line, index) => Math.floor(index / size)).values()];
}
`),
      starterCode: code(`
export function solve(lines: string[], size: number): string[][] {
  // The groupBy callback gets (element, index) — the page number comes from the index, not the line.
  return [];
}
`),
      tests: [
        tc('three pages of two', [['a', 'b', 'c', 'd', 'e'], 2], [['a', 'b'], ['c', 'd'], ['e']]),
        tc(
          'repeated lines stay on their own pages (trap)',
          [['a', 'b', 'a', 'c'], 2],
          [
            ['a', 'b'],
            ['a', 'c'],
          ],
        ),
        tc('a page larger than the input', [['x', 'y'], 5], [['x', 'y']]),
        tc('size of one puts every line on its own page (trap)', [['a', 'a', 'b'], 1], [['a'], ['a'], ['b']]),
        tc('no lines yields no pages', [[], 3], []),
      ],
      title: 'Pages by position',
      trap: code(`
export function solve(lines: string[], size: number): string[][] {
  return [...Map.groupBy(lines, (line) => Math.floor(lines.indexOf(line) / size)).values()];
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Group `products` by `category` in the order categories first appear, with the products *inside* each ' +
        'group sorted by ascending `price` (equal prices keep their input order). Return `[category, products]` ' +
        'pairs.\n\n' +
        'Signature: `solve(products: { category: string; name: string; price: number }[]): [string, { category: string; name: string; price: number }[]][]`\n\n' +
        'Trap: sorting the whole list *before* grouping also reorders which category is seen first.',
      difficulty: 'advanced',
      explanation:
        'Sort-then-group reads like a shortcut — one `toSorted` up front and the groups come out ordered — but ' +
        '`Map.groupBy` creates each key the first time it meets it, and after a global sort the first element is ' +
        'the cheapest product, not the first product. In `[fruit apple 3, veg kale 1]` the sort moves kale to the ' +
        'front, so `veg` becomes the first group and the category order the task asked for is lost. Group first, ' +
        'then sort: `Map.groupBy` on the *original* array fixes the category order from the input, and a `map` ' +
        'over the entries applies `toSorted((a, b) => a.price - b.price)` to each group independently. `toSorted` ' +
        'is stable, so equal prices keep their relative input order, and it copies rather than mutates, so the ' +
        'groups the `Map` holds are never reordered underneath you. Fix the order first; reorder as narrowly as ' +
        'possible afterwards.',
      id: 'sort-within-groups',
      methods: ['Map.groupBy', 'toSorted'],
      order: 11,
      solution: code(`
interface Product {
  category: string;
  name: string;
  price: number;
}

export function solve(products: Product[]): [string, Product[]][] {
  return [...Map.groupBy(products, (product) => product.category)].map(([category, group]): [string, Product[]] => [
    category,
    group.toSorted((a, b) => a.price - b.price),
  ]);
}
`),
      starterCode: code(`
interface Product {
  category: string;
  name: string;
  price: number;
}

export function solve(products: Product[]): [string, Product[]][] {
  // Group on the ORIGINAL order first; sort each group afterwards, not the whole list before.
  return [];
}
`),
      tests: [
        tc(
          'cheapest product is already in the first category',
          [
            [
              { category: 'fruit', name: 'apple', price: 3 },
              { category: 'veg', name: 'kale', price: 5 },
              { category: 'fruit', name: 'fig', price: 1 },
            ],
          ],
          [
            [
              'fruit',
              [
                { category: 'fruit', name: 'fig', price: 1 },
                { category: 'fruit', name: 'apple', price: 3 },
              ],
            ],
            ['veg', [{ category: 'veg', name: 'kale', price: 5 }]],
          ],
        ),
        tc(
          'sorting first would reorder the categories (trap)',
          [
            [
              { category: 'fruit', name: 'apple', price: 3 },
              { category: 'veg', name: 'kale', price: 1 },
            ],
          ],
          [
            ['fruit', [{ category: 'fruit', name: 'apple', price: 3 }]],
            ['veg', [{ category: 'veg', name: 'kale', price: 1 }]],
          ],
        ),
        tc(
          'equal prices keep input order',
          [
            [
              { category: 'a', name: 'x', price: 2 },
              { category: 'a', name: 'y', price: 2 },
            ],
          ],
          [
            [
              'a',
              [
                { category: 'a', name: 'x', price: 2 },
                { category: 'a', name: 'y', price: 2 },
              ],
            ],
          ],
        ),
        tc(
          'three categories interleaved (trap)',
          [
            [
              { category: 'c', name: 'z', price: 9 },
              { category: 'a', name: 'p', price: 5 },
              { category: 'c', name: 'w', price: 1 },
              { category: 'b', name: 'q', price: 3 },
            ],
          ],
          [
            [
              'c',
              [
                { category: 'c', name: 'w', price: 1 },
                { category: 'c', name: 'z', price: 9 },
              ],
            ],
            ['a', [{ category: 'a', name: 'p', price: 5 }]],
            ['b', [{ category: 'b', name: 'q', price: 3 }]],
          ],
        ),
        tc('no products', [[]], []),
      ],
      title: 'Sort inside the groups, not before',
      trap: code(`
interface Product {
  category: string;
  name: string;
  price: number;
}

export function solve(products: Product[]): [string, Product[]][] {
  return [...Map.groupBy(products.toSorted((a, b) => a.price - b.price), (product) => product.category)];
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Count orders per region *and* per status: return a `Map` keyed by region whose values are inner `Map`s ' +
        'from status to how many orders have that status in that region.\n\n' +
        'Signature: `solve(orders: { region: string; status: string }[]): Map<string, Map<string, number>>`\n\n' +
        'One groupBy gives you the outer level; the inner level is a second fold over each group.',
      difficulty: 'expert',
      explanation:
        'A single `Map.groupBy` call only buckets one level deep, so the two-level shape comes from composing it ' +
        'with a second fold: group the orders by region, then `reduce` each region group into a `Map` of status ' +
        'counts, using `counts.get(status) ?? 0` as the running tally (`get` returns `undefined` for missing keys, ' +
        'and `??` turns that into the zero base case). Spreading the outer groups through ' +
        '`new Map([...byRegion].map(...))` rebuilds the outer `Map` with each group replaced by its aggregate. ' +
        'The pattern generalizes: level one is `Map.groupBy`, and every deeper level is either another groupBy ' +
        '(to keep the raw items) or a fold (to aggregate them away).',
      id: 'orders-by-region-and-status',
      methods: ['Map.groupBy', 'reduce'],
      order: 12,
      solution: code(`
interface Order {
  region: string;
  status: string;
}

export function solve(orders: Order[]): Map<string, Map<string, number>> {
  const byRegion = Map.groupBy(orders, (order) => order.region);
  return new Map(
    [...byRegion].map(([region, group]): [string, Map<string, number>] => [
      region,
      group.reduce(
        (counts, order) => counts.set(order.status, (counts.get(order.status) ?? 0) + 1),
        new Map<string, number>(),
      ),
    ]),
  );
}
`),
      starterCode: code(`
interface Order {
  region: string;
  status: string;
}

export function solve(orders: Order[]): Map<string, Map<string, number>> {
  // Map.groupBy by region first, then reduce each group into a Map of status → count.
  return new Map();
}
`),
      tests: [
        tc(
          'counts per region and status',
          [
            [
              { region: 'east', status: 'shipped' },
              { region: 'east', status: 'pending' },
              { region: 'west', status: 'shipped' },
              { region: 'east', status: 'shipped' },
            ],
          ],
          new Map([
            [
              'east',
              new Map([
                ['shipped', 2],
                ['pending', 1],
              ]),
            ],
            ['west', new Map([['shipped', 1]])],
          ]),
        ),
        tc(
          'single region accumulates counts',
          [
            [
              { region: 'north', status: 'pending' },
              { region: 'north', status: 'pending' },
            ],
          ],
          new Map([['north', new Map([['pending', 2]])]]),
        ),
        tc(
          'one order per bucket',
          [
            [
              { region: 'a', status: 'x' },
              { region: 'b', status: 'y' },
            ],
          ],
          new Map([
            ['a', new Map([['x', 1]])],
            ['b', new Map([['y', 1]])],
          ]),
        ),
        tc('no orders', [[]], new Map()),
      ],
      title: 'Orders by region, then status',
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'For each department, find the employee with the highest `salary`; when two tie, keep the one that ' +
        'appears first. Return `{ department, name }` objects sorted by department name.\n\n' +
        'Signature: `solve(employees: { department: string; name: string; salary: number }[]): { department: string; name: string }[]`\n\n' +
        'Group, then reduce each group to one winner, then order the winners.',
      difficulty: 'expert',
      explanation:
        'Three stages compose here, and each one is a method you already know. `Object.groupBy` buckets the ' +
        'employees by department, so the “per department” part of the question is settled before any comparison ' +
        'happens. `Object.entries` turns those buckets into `[department, group]` pairs, and inside the `map` a ' +
        'seedless `reduce` carries the best candidate forward with a strict `>` — strict so that a later employee ' +
        'on the same salary never displaces the earlier one, and seedless safely because a group produced by ' +
        'groupBy is never empty. Finally `toSorted` orders the winners by department, since object key order is an ' +
        'accident of which department appeared first in the input. The shape — bucket, reduce each bucket to one ' +
        'value, then sort the results — is the general “top item per group” pipeline; only the comparator and ' +
        'the projection change from problem to problem.',
      id: 'top-earner-per-department',
      methods: ['Object.groupBy', 'Object.entries', 'reduce', 'toSorted'],
      order: 13,
      solution: code(`
interface Employee {
  department: string;
  name: string;
  salary: number;
}

interface TopEarner {
  department: string;
  name: string;
}

export function solve(employees: Employee[]): TopEarner[] {
  const groups = Object.groupBy(employees, (employee) => employee.department) as Record<string, Employee[]>;
  return Object.entries(groups)
    .map(([department, group]): TopEarner => ({
      department,
      name: group.reduce((best, employee) => (employee.salary > best.salary ? employee : best)).name,
    }))
    .toSorted((a, b) => a.department.localeCompare(b.department));
}
`),
      starterCode: code(`
interface Employee {
  department: string;
  name: string;
  salary: number;
}

interface TopEarner {
  department: string;
  name: string;
}

export function solve(employees: Employee[]): TopEarner[] {
  // Object.groupBy → Object.entries → reduce each group to its top earner → toSorted by department.
  return [];
}
`),
      tests: [
        tc(
          'top earner in each of two departments',
          [
            [
              { department: 'eng', name: 'Ada', salary: 120 },
              { department: 'ops', name: 'Bob', salary: 90 },
              { department: 'eng', name: 'Cy', salary: 150 },
              { department: 'ops', name: 'Di', salary: 80 },
            ],
          ],
          [
            { department: 'eng', name: 'Cy' },
            { department: 'ops', name: 'Bob' },
          ],
        ),
        tc(
          'tie keeps the earlier employee',
          [
            [
              { department: 'eng', name: 'Ada', salary: 100 },
              { department: 'eng', name: 'Bo', salary: 100 },
            ],
          ],
          [{ department: 'eng', name: 'Ada' }],
        ),
        tc(
          'departments come out sorted by name',
          [
            [
              { department: 'zoo', name: 'Zed', salary: 1 },
              { department: 'art', name: 'Amy', salary: 2 },
            ],
          ],
          [
            { department: 'art', name: 'Amy' },
            { department: 'zoo', name: 'Zed' },
          ],
        ),
        tc(
          'single employee tops their department',
          [[{ department: 'hr', name: 'Solo', salary: 5 }]],
          [{ department: 'hr', name: 'Solo' }],
        ),
        tc('no employees', [[]], []),
      ],
      title: 'Top earner per department',
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Return each category’s share of the total `amount` as a whole-number percentage, and make the shares sum ' +
        'to exactly `100`: floor every share, then hand the leftover points out one at a time to the categories ' +
        'with the largest fractional remainders (ties go to the category whose name sorts first). No expenses ' +
        'returns `{}`.\n\n' +
        'Signature: `solve(expenses: { amount: number; category: string }[]): Record<string, number>`\n\n' +
        'Trap: rounding each share on its own produces percentages that add up to 99 or 104.',
      difficulty: 'expert',
      explanation:
        'Percentages rounded independently do not sum to 100: three equal categories round to `33 + 33 + 33`, ' +
        'eight equal ones to `13 × 8 = 104`. The largest-remainder method fixes this in two passes over the ' +
        'grouped totals. `Object.groupBy` buckets the expenses and a `reduce` per bucket produces each ' +
        'category’s total; dividing by the grand total gives the exact share. Every share is floored, the ' +
        'floors are summed, and `100 - sum` is how many points are still owed. `toSorted` then orders the ' +
        'categories by fractional remainder descending (`share % 1`), falling through to `localeCompare` on the ' +
        'name for ties, and `slice(0, leftover)` picks the categories that receive one extra point. ' +
        '`Object.fromEntries` assembles the result. Computing `(total * 100) / grandTotal` rather than ' +
        '`total / grandTotal * 100` keeps exact shares exact in floating point, so a true `25` never floors to ' +
        '`24`.',
      id: 'share-per-category',
      methods: ['Object.groupBy', 'Object.entries', 'reduce', 'toSorted', 'Object.fromEntries'],
      order: 14,
      solution: code(`
interface Expense {
  amount: number;
  category: string;
}

interface Share {
  category: string;
  share: number;
}

export function solve(expenses: Expense[]): Record<string, number> {
  const groups = Object.groupBy(expenses, (expense) => expense.category) as Record<string, Expense[]>;
  const totals = Object.entries(groups).map(([category, group]) => ({
    category,
    total: group.reduce((sum, expense) => sum + expense.amount, 0),
  }));
  const grandTotal = totals.reduce((sum, { total }) => sum + total, 0);
  const shares = totals.map(({ category, total }): Share => ({ category, share: (total * 100) / grandTotal }));
  const leftover = 100 - shares.reduce((sum, { share }) => sum + Math.floor(share), 0);
  const bonus = new Set(
    shares
      .toSorted((a, b) => (b.share % 1) - (a.share % 1) || a.category.localeCompare(b.category))
      .slice(0, leftover)
      .map(({ category }) => category),
  );
  return Object.fromEntries(
    shares.map(({ category, share }) => [category, Math.floor(share) + (bonus.has(category) ? 1 : 0)]),
  );
}
`),
      starterCode: code(`
interface Expense {
  amount: number;
  category: string;
}

export function solve(expenses: Expense[]): Record<string, number> {
  // Group, total, floor each share, then give the leftover points to the largest remainders.
  return {};
}
`),
      tests: [
        tc(
          'two categories split cleanly',
          [
            [
              { amount: 25, category: 'a' },
              { amount: 75, category: 'b' },
            ],
          ],
          { a: 25, b: 75 },
        ),
        tc(
          'three equal categories still sum to 100 (trap)',
          [
            [
              { amount: 1, category: 'a' },
              { amount: 1, category: 'b' },
              { amount: 1, category: 'c' },
            ],
          ],
          { a: 34, b: 33, c: 33 },
        ),
        tc(
          'leftover point goes to the largest remainder',
          [
            [
              { amount: 1, category: 'a' },
              { amount: 2, category: 'b' },
            ],
          ],
          { a: 33, b: 67 },
        ),
        tc(
          'ties on the remainder resolve by name (trap)',
          [
            [
              { amount: 1, category: 'z' },
              { amount: 1, category: 'y' },
              { amount: 1, category: 'x' },
            ],
          ],
          { x: 34, y: 33, z: 33 },
        ),
        tc(
          'rounding everything up would overshoot (trap)',
          [
            [
              { amount: 1, category: 'a' },
              { amount: 1, category: 'b' },
              { amount: 1, category: 'c' },
              { amount: 1, category: 'd' },
              { amount: 1, category: 'e' },
              { amount: 1, category: 'f' },
              { amount: 1, category: 'g' },
              { amount: 1, category: 'h' },
            ],
          ],
          { a: 13, b: 13, c: 13, d: 13, e: 12, f: 12, g: 12, h: 12 },
        ),
        tc(
          'a category with several expenses is totalled first',
          [
            [
              { amount: 10, category: 'a' },
              { amount: 30, category: 'b' },
              { amount: 10, category: 'a' },
            ],
          ],
          { a: 40, b: 60 },
        ),
        tc('no expenses', [[]], {}),
      ],
      title: 'Shares that sum to 100',
      trap: code(`
interface Expense {
  amount: number;
  category: string;
}

export function solve(expenses: Expense[]): Record<string, number> {
  const groups = Object.groupBy(expenses, (expense) => expense.category) as Record<string, Expense[]>;
  const totals = Object.entries(groups).map(([category, group]) => ({
    category,
    total: group.reduce((sum, expense) => sum + expense.amount, 0),
  }));
  const grandTotal = totals.reduce((sum, { total }) => sum + total, 0);
  return Object.fromEntries(totals.map(({ category, total }) => [category, Math.round((total * 100) / grandTotal)]));
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Pivot flat `rows` into one line per `region`: `values` holds the summed `revenue` for each quarter in ' +
        '`quarters`, in that order, with `0` wherever a region has no rows for a quarter. Lines are sorted by ' +
        'region name.\n\n' +
        'Signature: `solve(rows: { quarter: string; region: string; revenue: number }[], quarters: string[]): { region: string; values: number[] }[]`\n\n' +
        'Trap: the columns must follow `quarters`, not whichever order the rows happened to arrive in.',
      difficulty: 'expert',
      explanation:
        'A pivot is a two-level grouping where the second level is turned into *positions* rather than keys. ' +
        '`Map.groupBy` on `region` produces the rows of the matrix in first-seen order — a `Map` because the ' +
        'outer level is iterated, not looked up. Inside each region, `Object.groupBy` on `quarter` produces the ' +
        'inner buckets, and this is where the columns come from: `quarters.map(...)` walks the *requested* column ' +
        'list and reads `byQuarter[quarter] ?? []`, so a quarter with no rows contributes a `0` from an empty ' +
        '`reduce` rather than a missing cell. Taking `Object.values(byQuarter)` instead looks shorter and breaks ' +
        'twice: a missing quarter shifts every later column left, and rows that arrive out of order swap columns ' +
        'silently. `toSorted` by region finishes the table. When output positions are dictated by a list, walk ' +
        'the list and look the groups up — never walk the groups.',
      id: 'pivot-revenue-by-quarter',
      methods: ['Map.groupBy', 'Object.groupBy', 'map', 'toSorted'],
      order: 15,
      solution: code(`
interface Row {
  quarter: string;
  region: string;
  revenue: number;
}

interface PivotLine {
  region: string;
  values: number[];
}

export function solve(rows: Row[], quarters: string[]): PivotLine[] {
  return [...Map.groupBy(rows, (row) => row.region)]
    .map(([region, group]): PivotLine => {
      const byQuarter = Object.groupBy(group, (row) => row.quarter);
      return {
        region,
        values: quarters.map((quarter) => (byQuarter[quarter] ?? []).reduce((sum, row) => sum + row.revenue, 0)),
      };
    })
    .toSorted((a, b) => a.region.localeCompare(b.region));
}
`),
      starterCode: code(`
interface Row {
  quarter: string;
  region: string;
  revenue: number;
}

interface PivotLine {
  region: string;
  values: number[];
}

export function solve(rows: Row[], quarters: string[]): PivotLine[] {
  // Group by region, then by quarter inside each region — and build values by walking quarters, not the groups.
  return [];
}
`),
      tests: [
        tc(
          'every region has every quarter',
          [
            [
              { quarter: 'Q1', region: 'east', revenue: 10 },
              { quarter: 'Q2', region: 'east', revenue: 20 },
              { quarter: 'Q1', region: 'west', revenue: 5 },
              { quarter: 'Q2', region: 'west', revenue: 7 },
            ],
            ['Q1', 'Q2'],
          ],
          [
            { region: 'east', values: [10, 20] },
            { region: 'west', values: [5, 7] },
          ],
        ),
        tc(
          'missing quarter becomes a zero column (trap)',
          [
            [
              { quarter: 'Q1', region: 'east', revenue: 10 },
              { quarter: 'Q2', region: 'west', revenue: 7 },
            ],
            ['Q1', 'Q2'],
          ],
          [
            { region: 'east', values: [10, 0] },
            { region: 'west', values: [0, 7] },
          ],
        ),
        tc(
          'rows arriving out of quarter order (trap)',
          [
            [
              { quarter: 'Q2', region: 'east', revenue: 20 },
              { quarter: 'Q1', region: 'east', revenue: 10 },
            ],
            ['Q1', 'Q2'],
          ],
          [{ region: 'east', values: [10, 20] }],
        ),
        tc(
          'repeated quarter rows are summed',
          [
            [
              { quarter: 'Q1', region: 'east', revenue: 1 },
              { quarter: 'Q1', region: 'east', revenue: 2 },
            ],
            ['Q1', 'Q2'],
          ],
          [{ region: 'east', values: [3, 0] }],
        ),
        tc(
          'regions sorted by name',
          [
            [
              { quarter: 'Q1', region: 'west', revenue: 1 },
              { quarter: 'Q1', region: 'east', revenue: 2 },
            ],
            ['Q1'],
          ],
          [
            { region: 'east', values: [2] },
            { region: 'west', values: [1] },
          ],
        ),
        tc('no rows', [[], ['Q1']], []),
      ],
      title: 'Pivot revenue by quarter',
      trap: code(`
interface Row {
  quarter: string;
  region: string;
  revenue: number;
}

interface PivotLine {
  region: string;
  values: number[];
}

export function solve(rows: Row[], quarters: string[]): PivotLine[] {
  return [...Map.groupBy(rows, (row) => row.region)]
    .map(([region, group]): PivotLine => {
      const byQuarter = Object.groupBy(group, (row) => row.quarter) as Record<string, Row[]>;
      return {
        region,
        values: Object.values(byQuarter).map((quarterRows) => quarterRows.reduce((sum, row) => sum + row.revenue, 0)),
      };
    })
    .toSorted((a, b) => a.region.localeCompare(b.region));
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Return the median `value` per `group`: sort each group’s values numerically and take the middle one, or ' +
        'the mean of the two middle ones when the count is even.\n\n' +
        'Signature: `solve(readings: { group: string; value: number }[]): Record<string, number>`\n\n' +
        'Trap: `toSorted()` with no comparator sorts numbers as strings, so `10` lands before `9`.',
      difficulty: 'expert',
      explanation:
        'A median cannot be folded incrementally — it needs the whole sorted group — so the pipeline is: ' +
        'bucket, then sort each bucket, then index into it. `Object.groupBy` builds ' +
        'the buckets, `Object.entries` exposes them as `[group, members]` pairs, and inside the `map` the values ' +
        'are pulled out and ordered with `toSorted((a, b) => a - b)`. That comparator is the load-bearing detail ' +
        'of the sort step: without it `toSorted` compares the values as strings, so `[9, 10, 11]` becomes ' +
        '`[10, 11, 9]` and the “median” is `11`. With the sorted values in hand, `Math.floor(length / 2)` is the ' +
        'middle index for an odd count, and for an even count the two elements straddling it are averaged. ' +
        '`Object.fromEntries` turns the `[group, median]` pairs back into the record. Every group produced by ' +
        'groupBy has at least one member, so neither the index nor the average ever meets an empty array.',
      id: 'median-per-group',
      methods: ['Object.groupBy', 'Object.entries', 'toSorted', 'Object.fromEntries'],
      order: 16,
      solution: code(`
interface Reading {
  group: string;
  value: number;
}

export function solve(readings: Reading[]): Record<string, number> {
  const groups = Object.groupBy(readings, (reading) => reading.group) as Record<string, Reading[]>;
  return Object.fromEntries(
    Object.entries(groups).map(([group, members]): [string, number] => {
      const sorted = members.map((reading) => reading.value).toSorted((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
      return [group, median];
    }),
  );
}
`),
      starterCode: code(`
interface Reading {
  group: string;
  value: number;
}

export function solve(readings: Reading[]): Record<string, number> {
  // Object.groupBy → per group: pull the values, toSorted NUMERICALLY, take the middle (or average the two).
  return {};
}
`),
      tests: [
        tc(
          'odd count picks the middle value',
          [
            [
              { group: 'a', value: 3 },
              { group: 'a', value: 1 },
              { group: 'a', value: 2 },
            ],
          ],
          { a: 2 },
        ),
        tc(
          'double-digit values must sort numerically (trap)',
          [
            [
              { group: 'a', value: 9 },
              { group: 'a', value: 10 },
              { group: 'a', value: 11 },
            ],
          ],
          { a: 10 },
        ),
        tc(
          'even count averages the two middle values',
          [
            [
              { group: 'a', value: 1 },
              { group: 'a', value: 4 },
              { group: 'a', value: 2 },
              { group: 'a', value: 3 },
            ],
          ],
          { a: 2.5 },
        ),
        tc(
          'groups are independent (trap)',
          [
            [
              { group: 'a', value: 5 },
              { group: 'b', value: 100 },
              { group: 'a', value: 7 },
              { group: 'b', value: 20 },
              { group: 'b', value: 30 },
            ],
          ],
          { a: 6, b: 30 },
        ),
        tc('single reading is its own median', [[{ group: 'x', value: 42 }]], { x: 42 }),
        tc('no readings', [[]], {}),
      ],
      title: 'Median per group',
      trap: code(`
interface Reading {
  group: string;
  value: number;
}

export function solve(readings: Reading[]): Record<string, number> {
  const groups = Object.groupBy(readings, (reading) => reading.group) as Record<string, Reading[]>;
  return Object.fromEntries(
    Object.entries(groups).map(([group, members]): [string, number] => {
      const sorted = members.map((reading) => reading.value).toSorted();
      const middle = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
      return [group, median];
    }),
  );
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'For each `poll`, return the `choice` with the most votes; when choices tie, the one that sorts first ' +
        'alphabetically wins. Return a plain object mapping poll → winning choice.\n\n' +
        'Signature: `solve(votes: { choice: string; poll: string }[]): Record<string, string>`\n\n' +
        'Trap: sorting by count alone leaves ties in first-seen order, which is not the rule.',
      difficulty: 'expert',
      explanation:
        'Two levels of `Object.groupBy` do the counting without a single accumulator: the outer call buckets the ' +
        'votes by poll, and inside each poll a second call buckets them by choice, so the size of each inner ' +
        'array *is* that choice’s tally. `Object.entries` turns the inner buckets into `[choice, supporters]` ' +
        'pairs, `map` reshapes them into `{ choice, count }`, and `toSorted` ranks them. The comparator is where ' +
        'the tie rule lives: `b.count - a.count || a.choice.localeCompare(b.choice)` orders by count descending ' +
        'and, *only when the difference is zero*, falls through to name ascending. Dropping the second clause ' +
        'does not crash — `toSorted` is stable, so tied choices simply stay in the order they were first seen, ' +
        'and `zeta` beats `alpha` because it was voted for first. The first ranked entry is the winner, and ' +
        '`Object.fromEntries` collects one per poll.',
      id: 'winner-per-poll',
      methods: ['Object.groupBy', 'Object.entries', 'map', 'toSorted'],
      order: 17,
      solution: code(`
interface Vote {
  choice: string;
  poll: string;
}

interface Tally {
  choice: string;
  count: number;
}

export function solve(votes: Vote[]): Record<string, string> {
  const polls = Object.groupBy(votes, (vote) => vote.poll) as Record<string, Vote[]>;
  return Object.fromEntries(
    Object.entries(polls).map(([poll, ballots]): [string, string] => {
      const choices = Object.groupBy(ballots, (vote) => vote.choice) as Record<string, Vote[]>;
      const ranked = Object.entries(choices)
        .map(([choice, supporters]): Tally => ({ choice, count: supporters.length }))
        .toSorted((a, b) => b.count - a.count || a.choice.localeCompare(b.choice));
      return [poll, ranked[0].choice];
    }),
  );
}
`),
      starterCode: code(`
interface Vote {
  choice: string;
  poll: string;
}

export function solve(votes: Vote[]): Record<string, string> {
  // groupBy poll, groupBy choice inside each poll, rank by count DESC then name ASC, take the first.
  return {};
}
`),
      tests: [
        tc(
          'clear majority',
          [
            [
              { choice: 'cat', poll: 'x' },
              { choice: 'dog', poll: 'x' },
              { choice: 'cat', poll: 'x' },
            ],
          ],
          { x: 'cat' },
        ),
        tc(
          'tie goes to the alphabetically first choice (trap)',
          [
            [
              { choice: 'zeta', poll: 'x' },
              { choice: 'zeta', poll: 'x' },
              { choice: 'alpha', poll: 'x' },
              { choice: 'alpha', poll: 'x' },
            ],
          ],
          { x: 'alpha' },
        ),
        tc(
          'two polls are tallied separately',
          [
            [
              { choice: 'a', poll: 'p1' },
              { choice: 'b', poll: 'p2' },
              { choice: 'a', poll: 'p1' },
              { choice: 'b', poll: 'p2' },
              { choice: 'c', poll: 'p2' },
            ],
          ],
          { p1: 'a', p2: 'b' },
        ),
        tc(
          'every choice with one vote (trap)',
          [
            [
              { choice: 'm', poll: 'x' },
              { choice: 'b', poll: 'x' },
              { choice: 'k', poll: 'x' },
            ],
          ],
          { x: 'b' },
        ),
        tc('no votes', [[]], {}),
      ],
      title: 'Winner per poll',
      trap: code(`
interface Vote {
  choice: string;
  poll: string;
}

interface Tally {
  choice: string;
  count: number;
}

export function solve(votes: Vote[]): Record<string, string> {
  const polls = Object.groupBy(votes, (vote) => vote.poll) as Record<string, Vote[]>;
  return Object.fromEntries(
    Object.entries(polls).map(([poll, ballots]): [string, string] => {
      const choices = Object.groupBy(ballots, (vote) => vote.choice) as Record<string, Vote[]>;
      const ranked = Object.entries(choices)
        .map(([choice, supporters]): Tally => ({ choice, count: supporters.length }))
        .toSorted((a, b) => b.count - a.count);
      return [poll, ranked[0].choice];
    }),
  );
}
`),
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Split `values` into runs of consecutive equal elements, preserving order: `["a", "a", "b", "a"]` → ' +
        '`[["a", "a"], ["b"], ["a"]]`. A value that reappears later starts a *new* run — it must not be merged ' +
        'into the earlier one.\n\n' +
        'Signature: `solve(values: string[]): string[][]`\n\n' +
        'Trap: grouping by the value itself merges every copy of `"a"` into one group, wherever it sits.',
      difficulty: 'expert',
      explanation:
        'groupBy keys are global: every element with the same key lands in the same group wherever it ' +
        'appears, so `Object.groupBy(values, (value) => value)` flattens `a a b a` into two groups and loses the ' +
        'adjacency the task is about. The fix is to make the *key* position-aware. A `reduce` assigns each ' +
        'element a run id: the id stays the same while the element equals its predecessor and increments when it ' +
        'changes, so `a a b a` becomes `0 0 1 2`. `Map.groupBy` then groups by that id, using the index argument ' +
        'of its callback to look it up — `(_value, index) => runIds[index]` — and because the ids are created in ' +
        'ascending order the `Map` iterates the runs in sequence; spreading `.values()` discards the ids. Any ' +
        '“group consecutive” problem works the same way: compute a key that changes exactly at the boundaries ' +
        'you care about, then let groupBy bucket.',
      id: 'group-consecutive-runs',
      methods: ['Map.groupBy', 'reduce'],
      order: 18,
      solution: code(`
export function solve(values: string[]): string[][] {
  const runIds = values.reduce<number[]>((ids, value, index) => {
    const previous = ids.at(-1) ?? 0;
    return [...ids, index > 0 && value !== values[index - 1] ? previous + 1 : previous];
  }, []);
  return [...Map.groupBy(values, (_value, index) => runIds[index]).values()];
}
`),
      starterCode: code(`
export function solve(values: string[]): string[][] {
  // Build a run id per index (bump it whenever the value changes), then Map.groupBy on that id.
  return [];
}
`),
      tests: [
        tc('each value forms one run', [['a', 'a', 'b']], [['a', 'a'], ['b']]),
        tc('a value that returns later starts a new run (trap)', [['a', 'a', 'b', 'a']], [['a', 'a'], ['b'], ['a']]),
        tc('alternating values are all singleton runs (trap)', [['x', 'y', 'x', 'y']], [['x'], ['y'], ['x'], ['y']]),
        tc('one long run', [['z', 'z', 'z']], [['z', 'z', 'z']]),
        tc('empty input', [[]], []),
      ],
      title: 'Runs of consecutive values',
      trap: code(`
export function solve(values: string[]): string[][] {
  return Object.values(Object.groupBy(values, (value) => value) as Record<string, string[]>);
}
`),
    },
  ],
};
