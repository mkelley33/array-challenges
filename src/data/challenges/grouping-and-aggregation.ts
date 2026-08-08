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
      order: 4,
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
          'input order does not dictate output order',
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
    },
    {
      categoryId: 'grouping-and-aggregation',
      description:
        'Index an array of items by their unique `id`: build a `Map` from each id to the item itself, so lookups ' +
        'become `O(1)`. If two items share an id, the *later* one wins.\n\n' +
        'Signature: `solve(items: { id: number; name: string }[]): Map<number, { id: number; name: string }>`\n\n' +
        'This is keyBy (one value per key), not groupBy (an array per key).',
      difficulty: 'advanced',
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
      order: 5,
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
      order: 6,
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
  ],
};
