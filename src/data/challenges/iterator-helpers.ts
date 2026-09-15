import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

/**
 * Safety rule for this module: the executor cannot interrupt a synchronous
 * infinite loop, so no starter, trap, or reference may ever call `toArray`,
 * `reduce`, `forEach`, `every`, `some`, `find`, or spread on an endless
 * generator without a `take(n)` (or an equivalent bound) in front of it. The
 * endless-counter challenges keep their starters as bounded literals.
 */
export const iteratorHelpers: CategoryModule = {
  category: {
    description:
      'Run array pipelines lazily — the ES2025 Iterator Helpers pull one element at a time through map, filter, ' +
      'take, and drop, so nothing is allocated, nothing runs until asked, and an endless source is no problem.',
    id: 'iterator-helpers',
    order: 14,
    title: 'Iterator Helpers',
  },
  challenges: [
    {
      categoryId: 'iterator-helpers',
      description:
        'Convert each Celsius reading to Fahrenheit, rounded to the nearest whole degree, in the original order — ' +
        'but do the mapping on the ITERATOR (`celsius.values()`), not on the array, and only materialise at the ' +
        'end.\n\n' +
        'Signature: `solve(celsius: number[]): number[]`',
      difficulty: 'novice',
      explanation:
        'Every array has a `values()` method that returns an iterator, and since ES2025 that iterator carries ' +
        'its own `map`. `celsius.values().map(c => Math.round(c * 9 / 5 + 32))` looks like the array version but ' +
        'behaves differently: nothing is computed yet. The helper returns another iterator that converts one ' +
        'reading each time something asks for the next value. `toArray()` is that something — it pulls until ' +
        'the source is exhausted and collects the results into a real array. For four readings the two styles ' +
        'are indistinguishable, which is exactly why this first challenge is small: the shape ' +
        '`values().map(...).toArray()` is the one every later pipeline builds on, and the difference — no ' +
        'intermediate array, work done on demand — becomes visible once the source is large, expensive, or ' +
        'endless.',
      id: 'lazy-map-to-array',
      methods: ['values', 'map', 'toArray'],
      order: 1,
      solution: code(`
export function solve(celsius: number[]): number[] {
  return celsius
    .values()
    .map((c) => Math.round((c * 9) / 5 + 32))
    .toArray();
}
`),
      starterCode: code(`
export function solve(celsius: number[]): number[] {
  // Start from celsius.values(), map on the iterator, and finish with toArray().
  return [];
}
`),
      tests: [
        tc('freezing, boiling, and the crossover point', [[0, 100, -40]], [32, 212, -40]),
        tc('rounds to the nearest degree', [[36.6, 20.5]], [98, 69]),
        tc('single reading', [[37]], [99]),
        tc('empty input', [[]], []),
      ],
      title: 'map on the iterator, not the array',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Return the tags that start with `prefix`, in the Set’s insertion order, without first spreading the Set ' +
        'into an array. A `Set` has no `filter` of its own — but the iterator its `values()` returns does.\n\n' +
        'Signature: `solve(tags: Set<string>, prefix: string): string[]`',
      difficulty: 'novice',
      explanation:
        'The reflex is `[...tags].filter(...)`: spread the Set into an array so the array methods become ' +
        'available. That works, but it allocates a full copy just to throw most of it away. ' +
        '`tags.values()` hands back an iterator over the same elements in insertion order, and the Iterator ' +
        'Helpers give that iterator a `filter` of its own: `tags.values().filter(t => t.startsWith(prefix))` ' +
        'walks the Set once, keeping only matches, and `toArray()` collects them. The only array ever built ' +
        'is the answer. The same trick applies to any built-in that exposes an iterator — `Map.prototype.keys`, ' +
        '`Map.prototype.values`, `Map.prototype.entries`, and a Set’s `values` — which is why the rest of this ' +
        'category treats `values()` as the doorway into the pipeline rather than as an implementation detail.',
      id: 'filter-a-set-directly',
      methods: ['filter', 'toArray', 'values'],
      order: 2,
      solution: code(`
export function solve(tags: Set<string>, prefix: string): string[] {
  return tags
    .values()
    .filter((tag) => tag.startsWith(prefix))
    .toArray();
}
`),
      starterCode: code(`
export function solve(tags: Set<string>, prefix: string): string[] {
  // tags.values() is an iterator — it has filter() even though the Set does not.
  return [];
}
`),
      tests: [
        tc(
          'keeps only the prefixed tags in insertion order',
          [new Set(['feat:editor', 'fix:worker', 'feat:catalog']), 'feat:'],
          ['feat:editor', 'feat:catalog'],
        ),
        tc('no tag matches', [new Set(['alpha', 'beta']), 'z'], []),
        tc('empty prefix keeps everything', [new Set(['b', 'a']), ''], ['b', 'a']),
        tc('empty set', [new Set<string>(), 'x'], []),
      ],
      title: 'Filter a Set without spreading it',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Return the total quantity across every entry of `stock`, reducing over `stock.values()` directly. An ' +
        'empty Map must return `0`.\n\n' +
        'Signature: `solve(stock: Map<string, number>): number`',
      difficulty: 'intermediate',
      explanation:
        'Iterator `reduce` mirrors the array method: `stock.values().reduce((sum, qty) => sum + qty, 0)` folds ' +
        'every quantity into one number without building an intermediate array. The seed matters even more ' +
        'here than on arrays. Without an initial value, `reduce` takes the first element as the starting ' +
        'accumulator — and an iterator that yields nothing has no first element, so an empty Map throws ' +
        '`TypeError: Reduce of a done iterator with no initial value`, the iterator cousin of the empty-array ' +
        'error. Passing `0` as the seed makes the empty case return `0` and, as a bonus, keeps the callback ' +
        'honest: the accumulator is always a number, never a quantity that happened to come first. A ' +
        'Map’s `values()` iterates in insertion order, though for a sum the order is irrelevant.',
      id: 'total-map-values-with-reduce',
      methods: ['reduce', 'values'],
      order: 3,
      solution: code(`
export function solve(stock: Map<string, number>): number {
  return stock.values().reduce((sum, quantity) => sum + quantity, 0);
}
`),
      starterCode: code(`
export function solve(stock: Map<string, number>): number {
  // stock.values().reduce(...) — and think about what an empty Map should return.
  return 0;
}
`),
      tests: [
        tc(
          'sums every quantity',
          [
            new Map([
              ['bolts', 2],
              ['nuts', 5],
            ]),
          ],
          7,
        ),
        tc('empty Map totals zero', [new Map<string, number>()], 0),
        tc('single entry', [new Map([['washers', 12]])], 12),
        tc(
          'zero quantities do not disturb the total',
          [
            new Map([
              ['a', 0],
              ['b', 3],
              ['c', 0],
            ]),
          ],
          3,
        ),
      ],
      title: 'reduce needs a seed here too',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Return the first `[name, price]` pair (in insertion order) whose price is at or below `budget`, or ' +
        '`null` when nothing is affordable. Search the Map’s entries iterator directly.\n\n' +
        'Signature: `solve(prices: Map<string, number>, budget: number): [string, number] | null`',
      difficulty: 'intermediate',
      explanation:
        'A Map has no `find`, but `prices.entries()` returns an iterator of `[key, value]` pairs and iterators ' +
        'do: `prices.entries().find(([, price]) => price <= budget)`. Destructuring in the predicate skips the ' +
        'name (the leading comma leaves the key unnamed) and tests the price. Like its array cousin, iterator ' +
        '`find` stops at the first match — the pairs after it are never pulled — and it yields `undefined` ' +
        'when nothing matches. Because the signature promises `null`, the last step is `?? null`, which turns ' +
        'that `undefined` into the documented sentinel. The entries iterator is live and ordered, so “first” ' +
        'means first inserted. Note the value returned is the entry array the iterator produced — a fresh ' +
        '`[name, price]` tuple, not a reference into the Map.',
      id: 'first-affordable-in-map',
      methods: ['find', 'entries'],
      order: 4,
      solution: code(`
export function solve(prices: Map<string, number>, budget: number): [string, number] | null {
  return prices.entries().find(([, price]) => price <= budget) ?? null;
}
`),
      starterCode: code(`
export function solve(prices: Map<string, number>, budget: number): [string, number] | null {
  // prices.entries().find(...) yields undefined when nothing matches — the signature wants null.
  return null;
}
`),
      tests: [
        tc(
          'first affordable pair in insertion order',
          [
            new Map([
              ['latte', 5],
              ['tea', 3],
              ['water', 1],
            ]),
            4,
          ],
          ['tea', 3],
        ),
        tc(
          'nothing affordable returns null',
          [
            new Map([
              ['latte', 5],
              ['tea', 3],
            ]),
            2,
          ],
          null,
        ),
        tc('price equal to the budget is affordable', [new Map([['tea', 3]]), 3], ['tea', 3]),
        tc('empty Map returns null', [new Map<string, number>(), 100], null),
        tc(
          'earlier entry wins even when a later one is cheaper',
          [
            new Map([
              ['a', 2],
              ['b', 1],
            ]),
            10,
          ],
          ['a', 2],
        ),
      ],
      title: 'find on Map entries',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Return every alias as one flat list, in user order: a user’s `nicknames`, or their `name` alone when ' +
        'they have no nicknames. Build the list with iterator `flatMap`.\n\n' +
        'Signature: `solve(users: { name: string; nicknames: string[] }[]): string[]`\n\n' +
        'Trap: array `flatMap` happily accepts a bare string from the callback; iterator `flatMap` throws a ' +
        '`TypeError` instead.',
      difficulty: 'advanced',
      explanation:
        'Array `flatMap` is lenient: a callback that returns a non-array value is treated as a single element, ' +
        'so `u.nicknames.length ? u.nicknames : u.name` works on arrays. Iterator `flatMap` is stricter by ' +
        'design. It requires every callback result to be an iterable *object* — an array, a Set, another ' +
        'iterator — and a primitive string is not one, even though strings are iterable: the spec rejects ' +
        'them explicitly so a name is not silently exploded into characters. The helper throws ' +
        '`TypeError: Iterator.prototype.flatMap called on non-object` the moment it reaches the user with no ' +
        'nicknames. The fix is to wrap the fallback: `[u.name]`. Wrapping also documents intent — one alias, ' +
        'not one character per letter — which is the ambiguity the strict rule exists to prevent.',
      id: 'flatmap-rejects-bare-strings',
      methods: ['flatMap'],
      order: 5,
      solution: code(`
interface User {
  name: string;
  nicknames: string[];
}

export function solve(users: User[]): string[] {
  return users
    .values()
    .flatMap((user) => (user.nicknames.length > 0 ? user.nicknames : [user.name]))
    .toArray();
}
`),
      starterCode: code(`
interface User {
  name: string;
  nicknames: string[];
}

export function solve(users: User[]): string[] {
  // users.values().flatMap(...) — every callback result must be an iterable OBJECT.
  return [];
}
`),
      tests: [
        tc(
          'nicknames are flattened in user order',
          [
            [
              { name: 'Ada', nicknames: ['ada', 'countess'] },
              { name: 'Bob', nicknames: ['bobby'] },
            ],
          ],
          ['ada', 'countess', 'bobby'],
        ),
        tc(
          'a user with no nicknames contributes their name (trap)',
          [
            [
              { name: 'Ada', nicknames: ['ada'] },
              { name: 'Bob', nicknames: [] },
            ],
          ],
          ['ada', 'Bob'],
        ),
        tc('nobody has nicknames (trap)', [[{ name: 'Cy', nicknames: [] }]], ['Cy']),
        tc('no users', [[]], []),
      ],
      title: 'Iterator flatMap refuses a bare string',
      trap: code(`
interface User {
  name: string;
  nicknames: string[];
}

export function solve(users: User[]): string[] {
  return users
    .values()
    .flatMap((user) => (user.nicknames.length > 0 ? user.nicknames : user.name))
    .toArray();
}
`),
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Return the first `n` readings that are at or below `limit`, in their original order — fewer if there are ' +
        'not enough, and `[]` when `n` is `0`.\n\n' +
        'Signature: `solve(readings: number[], limit: number, n: number): number[]`\n\n' +
        'Trap: `take(n)` before `filter` cuts the source to `n` readings and only then discards the bad ones.',
      difficulty: 'advanced',
      explanation:
        '`take(n)` is a cap on whatever sits *before* it in the chain. Written ' +
        '`readings.values().take(n).filter(r => r <= limit)`, the cap applies to the raw readings: the ' +
        'first `n` are let through, the rest are never examined, and `filter` then removes the ones over the ' +
        'limit — so `[9, 1, 8, 2, 3]` with `n = 2` yields `[1]`. Swap the order, ' +
        '`filter(r => r <= limit).take(n)`, and the cap counts *matches*: `take` keeps pulling from `filter` ' +
        'until `n` readings have passed, then stops. That still stops early — once `n` matches are in hand, ' +
        'the remaining readings are never touched — which is the laziness win over `filter().slice(0, n)` on ' +
        'an array. `toArray()` finishes the chain. The rule generalises: order the stages so each one sees ' +
        'exactly what it should count.',
      id: 'first-n-under-limit-filter-then-take',
      methods: ['filter', 'take', 'toArray'],
      order: 6,
      solution: code(`
export function solve(readings: number[], limit: number, n: number): number[] {
  return readings
    .values()
    .filter((reading) => reading <= limit)
    .take(n)
    .toArray();
}
`),
      starterCode: code(`
export function solve(readings: number[], limit: number, n: number): number[] {
  // Which stage should take(n) count — raw readings, or readings that passed the filter?
  return [];
}
`),
      tests: [
        tc('takes the first n matches, not the first n readings (trap)', [[9, 1, 8, 2, 3], 5, 2], [1, 2]),
        tc('every reading qualifies', [[1, 2, 3], 10, 2], [1, 2]),
        tc('fewer matches than n', [[9, 1, 8], 5, 3], [1]),
        tc('n of zero yields nothing', [[1, 2], 5, 0], []),
        tc('no reading qualifies', [[7, 8], 5, 2], []),
      ],
      title: 'filter first, take second',
      trap: code(`
export function solve(readings: number[], limit: number, n: number): number[] {
  return readings
    .values()
    .take(n)
    .filter((reading) => reading <= limit)
    .toArray();
}
`),
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Split `xs` into `head` (the first `n` elements) and `tail` (everything after) using a SINGLE ' +
        '`xs.values()` iterator: take the head from it, then collect the tail from the same iterator. `n = 0` ' +
        'and `n ≥ xs.length` are valid.\n\n' +
        'Signature: `solve(xs: number[], n: number): { head: number[]; tail: number[] }`\n\n' +
        'Trap: after `take(n)` the cursor has already moved past `n` elements — a `drop(n)` for the tail skips ' +
        '`n` more.',
      difficulty: 'advanced',
      explanation:
        'An iterator is a cursor, and the helpers move it. `const it = xs.values()` creates one cursor; ' +
        '`it.take(n).toArray()` pulls `n` elements through it, leaving it positioned at element `n`. A second ' +
        'call, `it.toArray()`, simply continues from there — so the head and the tail come from one pass with ' +
        'no index arithmetic. The trap is thinking in array terms: `head = xs.slice(0, n)` and ' +
        '`tail = xs.slice(n)` each start from the beginning, so `drop(n)` looks like the natural tail. On a ' +
        'shared cursor it skips `n` *more*: `[1, 2, 3, 4, 5]` with `n = 2` gives a tail of `[5]`. One subtlety ' +
        'makes this work at all: array iterators are not closed when `take` finishes, so the cursor stays ' +
        'usable. A generator in the same position would be closed, and the tail would be `[]`.',
      id: 'split-at-with-one-iterator',
      methods: ['take', 'toArray', 'values'],
      order: 7,
      solution: code(`
export function solve(xs: number[], n: number): { head: number[]; tail: number[] } {
  const it = xs.values();
  const head = it.take(n).toArray();
  const tail = it.toArray();
  return { head, tail };
}
`),
      starterCode: code(`
export function solve(xs: number[], n: number): { head: number[]; tail: number[] } {
  const it = xs.values();
  // Pull the head through it, then keep pulling from the SAME cursor for the tail.
  return { head: [], tail: [] };
}
`),
      tests: [
        tc('tail continues from where the head stopped (trap)', [[1, 2, 3, 4, 5], 2], {
          head: [1, 2],
          tail: [3, 4, 5],
        }),
        tc('n of one (trap)', [[7, 8, 9], 1], { head: [7], tail: [8, 9] }),
        tc('n of zero puts everything in the tail', [[1, 2, 3], 0], { head: [], tail: [1, 2, 3] }),
        tc('n beyond the length puts everything in the head', [[1, 2], 5], { head: [1, 2], tail: [] }),
        tc('empty input', [[], 3], { head: [], tail: [] }),
      ],
      title: 'One cursor, two halves',
      trap: code(`
export function solve(xs: number[], n: number): { head: number[]; tail: number[] } {
  const it = xs.values();
  const head = it.take(n).toArray();
  const tail = it.drop(n).toArray();
  return { head, tail };
}
`),
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Skip the first `skip` header lines and label each remaining line with its ORIGINAL index in `lines`, ' +
        'as `"<index>: <line>"` — so with one header, the first kept line is `"1: ..."`.\n\n' +
        'Signature: `solve(lines: string[], skip: number): string[]`\n\n' +
        'Trap: the index that `map` passes to its callback counts from `0` at that helper, not at the source.',
      difficulty: 'advanced',
      explanation:
        'Iterator `map` does pass a counter as its second argument, but the counter belongs to the helper, not ' +
        'to the array: it starts at `0` for the first value *that helper* receives. After `drop(skip)`, the ' +
        'first value `map` sees is line number `skip`, yet its counter says `0` — so ' +
        '`lines.values().drop(1).map((line, i) => ...)` labels `a` as `0: a`. When the original position ' +
        'matters, carry it in the data instead of the counter: `lines.entries()` yields `[index, line]` pairs, ' +
        '`drop(skip)` discards whole pairs, and the index inside each surviving pair is the one from the ' +
        'source. `entries().drop(skip).map(([i, line]) => \\`${i}: ${line}\\`).toArray()` is the whole pipeline. ' +
        'Every helper counts from zero at its own doorstep — `entries()` is how you smuggle the real index ' +
        'past `drop`, `filter`, or anything else that changes what flows downstream.',
      id: 'line-numbers-survive-drop',
      methods: ['entries', 'drop', 'map', 'toArray'],
      order: 8,
      solution: code(`
export function solve(lines: string[], skip: number): string[] {
  return lines
    .entries()
    .drop(skip)
    .map(([index, line]) => \`\${index}: \${line}\`)
    .toArray();
}
`),
      starterCode: code(`
export function solve(lines: string[], skip: number): string[] {
  // The index must be the one from lines — where in the chain can you still get it?
  return [];
}
`),
      tests: [
        tc('labels keep the original index after one header (trap)', [['header', 'a', 'b'], 1], ['1: a', '2: b']),
        tc('two headers (trap)', [['h1', 'h2', 'x', 'y'], 2], ['2: x', '3: y']),
        tc('no headers to skip', [['a', 'b'], 0], ['0: a', '1: b']),
        tc('skip beyond the length', [['a'], 3], []),
        tc('empty input', [[], 1], []),
      ],
      title: 'The helper’s counter restarts',
      trap: code(`
export function solve(lines: string[], skip: number): string[] {
  return lines
    .values()
    .drop(skip)
    .map((line, index) => \`\${index}: \${line}\`)
    .toArray();
}
`),
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Return the total quantity and the largest single quantity in `stock` — both `0` for an empty Map. ' +
        'Quantities are never negative.\n\n' +
        'Signature: `solve(stock: Map<string, number>): { largest: number; total: number }`\n\n' +
        'Trap: an iterator is single-use — the second `reduce` over the same `values()` sees nothing.',
      difficulty: 'advanced',
      explanation:
        'Arrays can be reduced twice; iterators cannot. `const q = stock.values()` is a cursor, and ' +
        '`q.reduce(sum, 0)` walks it to the end. The second call, `q.reduce(Math.max, 0)`, starts on an ' +
        'exhausted cursor: it sees zero elements, returns the seed, and reports `largest: 0` — while the ' +
        'total is correct, which is what makes the bug easy to miss. Two fixes exist. Call `stock.values()` ' +
        'twice, once per `reduce`, so each walk gets a fresh cursor; or, better, walk once and fold both ' +
        'answers in a single accumulator: ' +
        '`reduce((acc, q) => ({ largest: Math.max(acc.largest, q), total: acc.total + q }), { largest: 0, total: 0 })`. ' +
        'The single-pass version is also the honest one for a lazy source: a real stream cannot be rewound, ' +
        'so anything that needs two facts from it must gather both on the way through.',
      id: 'iterator-consumed-twice',
      methods: ['reduce', 'values'],
      order: 9,
      solution: code(`
export function solve(stock: Map<string, number>): { largest: number; total: number } {
  return stock.values().reduce(
    (acc, quantity) => ({ largest: Math.max(acc.largest, quantity), total: acc.total + quantity }),
    { largest: 0, total: 0 },
  );
}
`),
      starterCode: code(`
export function solve(stock: Map<string, number>): { largest: number; total: number } {
  // One values() iterator can be walked once. Gather both numbers in that one walk.
  return { largest: 0, total: 0 };
}
`),
      tests: [
        tc(
          'largest survives the second pass (trap)',
          [
            new Map([
              ['a', 2],
              ['b', 5],
            ]),
          ],
          { largest: 5, total: 7 },
        ),
        tc(
          'largest first (trap)',
          [
            new Map([
              ['x', 9],
              ['y', 1],
              ['z', 4],
            ]),
          ],
          { largest: 9, total: 14 },
        ),
        tc('single entry (trap)', [new Map([['only', 3]])], { largest: 3, total: 3 }),
        tc('empty Map', [new Map<string, number>()], { largest: 0, total: 0 }),
      ],
      title: 'An iterator is single-use',
      trap: code(`
export function solve(stock: Map<string, number>): { largest: number; total: number } {
  const quantities = stock.values();
  const total = quantities.reduce((sum, quantity) => sum + quantity, 0);
  const largest = quantities.reduce((max, quantity) => Math.max(max, quantity), 0);
  return { largest, total };
}
`),
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Count how many times each event kind occurs, returning a `Map` from kind to count. Drive the tally ' +
        'with a side-effecting callback over `events.values()`.\n\n' +
        'Signature: `solve(events: string[]): Map<string, number>`\n\n' +
        'Trap: iterator `map` is lazy — a `map` nobody pulls from never runs its callback.',
      difficulty: 'advanced',
      explanation:
        'Array `map` runs its callback immediately, once per element, so people reach for it as a loop. ' +
        'Iterator `map` does no such thing: it returns a new iterator and waits. ' +
        '`events.values().map(e => tally.set(...))` builds that iterator, nobody calls `next()` on it, and the ' +
        'function returns an empty Map — the callback never ran even once. Laziness is the whole point of the ' +
        'helpers, and it means a side effect placed inside `map` (or `filter`, or `flatMap`) only happens if ' +
        'something downstream pulls. When the side effect *is* the goal, use `forEach`: it is a terminal ' +
        'operation that drains the iterator on the spot, calling the callback for every element and returning ' +
        '`undefined`. Rule of thumb: `map` describes a transformation, `forEach` performs one; only the latter ' +
        'guarantees the code inside it executes.',
      id: 'tally-with-foreach-not-map',
      methods: ['forEach', 'map'],
      order: 10,
      solution: code(`
export function solve(events: string[]): Map<string, number> {
  const tally = new Map<string, number>();
  events.values().forEach((event) => {
    tally.set(event, (tally.get(event) ?? 0) + 1);
  });
  return tally;
}
`),
      starterCode: code(`
export function solve(events: string[]): Map<string, number> {
  const tally = new Map<string, number>();
  // Which helper actually RUNS a callback for every element, right now?
  return tally;
}
`),
      tests: [
        tc(
          'counts each kind (trap)',
          [['login', 'logout', 'login']],
          new Map([
            ['login', 2],
            ['logout', 1],
          ]),
        ),
        tc('single event (trap)', [['ping']], new Map([['ping', 1]])),
        tc('all the same kind (trap)', [['a', 'a', 'a']], new Map([['a', 3]])),
        tc('no events', [[]], new Map<string, number>()),
      ],
      title: 'map does nothing until pulled',
      trap: code(`
export function solve(events: string[]): Map<string, number> {
  const tally = new Map<string, number>();
  events.values().map((event) => tally.set(event, (tally.get(event) ?? 0) + 1));
  return tally;
}
`),
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Push `xs` through `map(x => x * 2)` and then `filter(y => y > 2)`, recording `"m:<x>"` when the map ' +
        'stage sees a value and `"f:<y>"` when the filter stage sees one. Return the trace, in the order the ' +
        'stages ran — NOT the pipeline’s output.\n\n' +
        'Signature: `solve(xs: number[]): string[]`\n\n' +
        'Trap: on arrays, every `m:` happens before any `f:` — each stage runs to completion before the next ' +
        'starts.',
      difficulty: 'advanced',
      explanation:
        'Array methods are stage-by-stage: `xs.map(...)` produces a whole array, and only then does ' +
        '`filter(...)` start, so the trace for `[1, 2]` is `m:1, m:2, f:2, f:4`. Iterator helpers are ' +
        'element-by-element. `toArray()` asks the `filter` iterator for a value; `filter` asks `map`; `map` ' +
        'asks the source — and `1` travels the whole pipeline before `2` is ever looked at, giving ' +
        '`m:1, f:2, m:2, f:4`. Nothing is buffered between stages; there is no intermediate array of doubled ' +
        'values. This is what makes `take` able to stop everything upstream and what lets an endless source ' +
        'flow through a pipeline at all. The two traces agree for a single element, so a one-element test ' +
        'cannot tell the styles apart — the interleaving only shows with two or more.',
      id: 'element-at-a-time-trace',
      methods: ['map', 'filter', 'toArray'],
      order: 11,
      solution: code(`
export function solve(xs: number[]): string[] {
  const trace: string[] = [];
  xs.values()
    .map((x) => {
      trace.push(\`m:\${x}\`);
      return x * 2;
    })
    .filter((y) => {
      trace.push(\`f:\${y}\`);
      return y > 2;
    })
    .toArray();
  return trace;
}
`),
      starterCode: code(`
export function solve(xs: number[]): string[] {
  const trace: string[] = [];
  // Build the map → filter chain on xs.values(), pull it to the end, and return the trace.
  return trace;
}
`),
      tests: [
        tc('stages interleave per element (trap)', [[1, 2]], ['m:1', 'f:2', 'm:2', 'f:4']),
        tc('three elements (trap)', [[1, 2, 3]], ['m:1', 'f:2', 'm:2', 'f:4', 'm:3', 'f:6']),
        tc('a single element cannot tell the styles apart', [[3]], ['m:3', 'f:6']),
        tc('empty input leaves an empty trace', [[]], []),
      ],
      title: 'One element through the whole pipeline',
      trap: code(`
export function solve(xs: number[]): string[] {
  const trace: string[] = [];
  xs.map((x) => {
    trace.push(\`m:\${x}\`);
    return x * 2;
  }).filter((y) => {
    trace.push(\`f:\${y}\`);
    return y > 2;
  });
  return trace;
}
`),
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Build an ENDLESS counter generator that yields `start, start + 1, start + 2, …` and counts every value it ' +
        'yields in `examined`. Return the first `n` multiples of `k` from it (in order) together with how many ' +
        'values were examined to find them — `(1, 3, 2)` → `{ examined: 6, results: [3, 6] }`; `n = 0` → ' +
        '`{ examined: 0, results: [] }`. `k` is always at least `1`.\n\n' +
        'Signature: `solve(start: number, k: number, n: number): { examined: number; results: number[] }`\n\n' +
        'Never call `toArray()` on the bare counter — it never ends.',
      difficulty: 'expert',
      explanation:
        'A `function*` with `for (let i = start; ; i += 1) yield i;` never finishes, and an array could never ' +
        'hold it. The iterator helpers do not care: `counter().filter(v => v % k === 0).take(n).toArray()` ' +
        'terminates because `take(n)` stops asking after `n` values, and an upstream stage that is never ' +
        'asked never runs. The `examined` count is the proof. Starting at `1` with `k = 3`, the counter yields ' +
        '`1` through `6` before the second multiple appears, and after `take` has its second value it does not ' +
        'pull a seventh — `examined` is exactly `6`. With `n = 0` the pipeline pulls nothing and `examined` ' +
        'stays `0`. The arrangement of stages is load-bearing: `take` must sit downstream of the endless ' +
        'source and upstream of `toArray`; move `toArray` before it and the loop never returns.',
      id: 'first-n-multiples-from-an-endless-counter',
      methods: ['filter', 'take', 'toArray'],
      order: 12,
      solution: code(`
export function solve(start: number, k: number, n: number): { examined: number; results: number[] } {
  let examined = 0;
  function* counter(): Generator<number> {
    for (let i = start; ; i += 1) {
      examined += 1;
      yield i;
    }
  }
  const results = counter()
    .filter((value) => value % k === 0)
    .take(n)
    .toArray();
  return { examined, results };
}
`),
      starterCode: code(`
export function solve(start: number, k: number, n: number): { examined: number; results: number[] } {
  let examined = 0;
  function* counter(): Generator<number> {
    for (let i = start; ; i += 1) {
      examined += 1;
      yield i;
    }
  }
  // Chain filter → take(n) → toArray on counter(). take(n) is what makes this terminate.
  return { examined, results: [] };
}
`),
      tests: [
        tc('first two multiples of three from one', [1, 3, 2], { examined: 6, results: [3, 6] }),
        tc('n of zero examines nothing', [1, 3, 0], { examined: 0, results: [] }),
        tc('multiples of five from ten', [10, 5, 3], { examined: 11, results: [10, 15, 20] }),
        tc('k of one takes consecutive values', [7, 1, 3], { examined: 3, results: [7, 8, 9] }),
      ],
      title: 'take from a stream that never ends',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Skip the LEADING readings below `threshold` — later dips are kept — then return the next `n` readings ' +
        'in order (fewer if the input runs out). Iterators have no `dropWhile`, so write one as a generator ' +
        'over `readings.values()` and chain the native `take` onto its result. `([1, 2, 8, 3, 9, 1], 5, 2)` → ' +
        '`[8, 3]`.\n\n' +
        'Signature: `solve(readings: number[], threshold: number, n: number): number[]`',
      difficulty: 'expert',
      explanation:
        'The helper family ships `drop(n)` and `take(n)` but neither `dropWhile` nor `takeWhile`. The gap is ' +
        'easy to fill because a generator is itself an iterator with all the helpers attached. ' +
        '`function* dropWhile(source, pred) { let dropping = true; for (const v of source) { if (dropping && ' +
        'pred(v)) continue; dropping = false; yield v; } }` consumes the source lazily, discards while the ' +
        'predicate holds, and once it fails, passes everything through — including later values below the ' +
        'threshold. Because the generator object inherits from `Iterator.prototype`, ' +
        '`dropWhile(readings.values(), r => r < threshold).take(n).toArray()` chains as if `dropWhile` were ' +
        'built in. The `for...of` inside pulls one value at a time, so the hand-written stage is just as lazy ' +
        'as the native ones: `take(n)` still stops it, and nothing past the `n`th kept reading is examined.',
      id: 'drop-while-as-a-generator',
      methods: ['take', 'toArray'],
      order: 13,
      solution: code(`
function* dropWhile<T>(source: IterableIterator<T>, predicate: (value: T) => boolean): Generator<T> {
  let dropping = true;
  for (const value of source) {
    if (dropping && predicate(value)) {
      continue;
    }
    dropping = false;
    yield value;
  }
}

export function solve(readings: number[], threshold: number, n: number): number[] {
  return dropWhile(readings.values(), (reading) => reading < threshold)
    .take(n)
    .toArray();
}
`),
      starterCode: code(`
function* dropWhile<T>(source: IterableIterator<T>, predicate: (value: T) => boolean): Generator<T> {
  // Yield nothing while predicate holds; once it fails, yield everything that follows.
}

export function solve(readings: number[], threshold: number, n: number): number[] {
  // dropWhile(...) returns a generator — a real iterator — so native take() chains onto it.
  return [];
}
`),
      tests: [
        tc('drops the leading dip only', [[1, 2, 8, 3, 9, 1], 5, 2], [8, 3]),
        tc('nothing to drop', [[6, 7, 8], 5, 2], [6, 7]),
        tc('everything is below the threshold', [[1, 2, 3], 5, 2], []),
        tc('n larger than what remains', [[1, 9, 2], 5, 5], [9, 2]),
        tc('n of zero', [[9, 9], 5, 0], []),
      ],
      title: 'Build the helper that is missing',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Return every `[group, member]` pair from a Map of Sets as a flat array — groups in Map order, members in ' +
        'each Set’s insertion order — by flat-mapping over `groups.entries()` and mapping each Set’s own ' +
        'iterator.\n\n' +
        'Signature: `solve(groups: Map<string, Set<number>>): [string, number][]`',
      difficulty: 'expert',
      explanation:
        'Iterator `flatMap` accepts any iterable *object* from its callback, and an iterator is one — so the ' +
        'inner pipeline can itself be lazy. `groups.entries()` yields `[group, members]`; for each, ' +
        '`members.values().map(m => [group, m])` produces an iterator of pairs without spreading the Set; ' +
        '`flatMap` splices those inner iterators into one stream; `toArray()` collects. No intermediate ' +
        'array exists per group, unlike `[...groups].flatMap(([g, s]) => [...s].map(...))`, which copies ' +
        'each Set before mapping it. Order is preserved end to end: Map entries iterate in insertion order, ' +
        'each Set iterates in insertion order, and `flatMap` finishes one inner iterator before pulling the ' +
        'next entry. An empty Set contributes nothing — its inner iterator is done immediately and `flatMap` ' +
        'moves on. This nested shape, outer `entries` with an inner `map`, is the lazy form of a nested loop.',
      id: 'pairs-from-a-map-of-sets',
      methods: ['entries', 'flatMap', 'map', 'toArray'],
      order: 14,
      solution: code(`
export function solve(groups: Map<string, Set<number>>): [string, number][] {
  return groups
    .entries()
    .flatMap(([group, members]) => members.values().map((member) => [group, member] as [string, number]))
    .toArray();
}
`),
      starterCode: code(`
export function solve(groups: Map<string, Set<number>>): [string, number][] {
  // groups.entries().flatMap(...) — the callback may return an iterator, not just an array.
  return [];
}
`),
      tests: [
        tc(
          'pairs in Map order then Set order',
          [
            new Map([
              ['a', new Set([1, 2])],
              ['b', new Set([3])],
            ]),
          ],
          [
            ['a', 1],
            ['a', 2],
            ['b', 3],
          ],
        ),
        tc(
          'an empty group contributes nothing',
          [
            new Map([
              ['x', new Set<number>()],
              ['y', new Set([7])],
            ]),
          ],
          [['y', 7]],
        ),
        tc(
          'single group',
          [new Map([['solo', new Set([4, 5, 6])]])],
          [
            ['solo', 4],
            ['solo', 5],
            ['solo', 6],
          ],
        ),
        tc('no groups', [new Map<string, Set<number>>()], []),
      ],
      title: 'flatMap over nested iterables',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Return the first `n` DISTINCT characters of `text`, by code point (an emoji stays one character), in ' +
        'order of first appearance — and stop reading as soon as `n` have been found. Strings have no `values()`; ' +
        'start the chain with `Iterator.from(text)`. `("a👍a👍bc", 3)` → `["a", "👍", "b"]`.\n\n' +
        'Signature: `solve(text: string, n: number): string[]`',
      difficulty: 'expert',
      explanation:
        '`Iterator.from` turns any iterable into an iterator that has the helpers. Strings are iterable by ' +
        'code point, so `Iterator.from(text)` yields `"👍"` as one item where `text[i]` would hand back half ' +
        'a surrogate pair. From there the chain is ordinary: a closed-over `Set` inside `filter` admits a ' +
        'character the first time it appears and rejects it afterwards; `take(n)` caps the result and stops ' +
        'the scan — for a long text, only the prefix needed to find `n` distinct characters is ever read; ' +
        '`toArray()` collects. Two cautions. The `Set` must be created inside `solve`, or it leaks across ' +
        'calls. And `Iterator.from` accepts *iterables* only — an array-like such as `{ length: 2, 0: "a" }` is ' +
        'wrapped without complaint, then throws `TypeError` on the first `next()`; `Array.from` is the tool ' +
        'for array-likes.',
      id: 'first-distinct-characters-lazily',
      methods: ['Iterator.from', 'filter', 'take', 'toArray'],
      order: 15,
      solution: code(`
export function solve(text: string, n: number): string[] {
  const seen = new Set<string>();
  return Iterator.from(text)
    .filter((character) => {
      if (seen.has(character)) {
        return false;
      }
      seen.add(character);
      return true;
    })
    .take(n)
    .toArray();
}
`),
      starterCode: code(`
export function solve(text: string, n: number): string[] {
  // Iterator.from(text) iterates by code point. A Set you close over decides what filter keeps.
  return [];
}
`),
      tests: [
        tc('emoji count as one character', ['a👍a👍bc', 3], ['a', '👍', 'b']),
        tc('fewer distinct characters than n', ['aaaa', 2], ['a']),
        tc('n larger than the whole text', ['hello', 10], ['h', 'e', 'l', 'o']),
        tc('n of zero', ['abc', 0], []),
        tc('empty text', ['', 3], []),
      ],
      title: 'Iterator.from bridges a string',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'From an ENDLESS counter generator starting at `start`, skip `skip` values and then keep `count` — but ' +
        'write `drop` and `take` yourself as generators; do not use the native `drop`/`take`. Materialise the ' +
        'result with `toArray()`. `(10, 2, 3)` → `[12, 13, 14]`; `count = 0` → `[]`.\n\n' +
        'Signature: `solve(start: number, skip: number, count: number): number[]`\n\n' +
        'A `take` that forgets to stop pulling hangs on the endless source.',
      difficulty: 'expert',
      explanation:
        'Rebuilding the two helpers shows what they actually do. `drop(source, n)` loops `for...of` over the ' +
        'source, swallowing the first `n` values and yielding the rest — it is lazy because `for...of` pulls ' +
        'one value per iteration and the generator pauses at each `yield`. `take(source, n)` is the one that ' +
        'must know when to *stop*: it returns before pulling when `n` is `0`, and after yielding the `n`th ' +
        'value it `return`s instead of looping again. That `return` is doing two jobs. It ends the take ' +
        'generator, and — because leaving a `for...of` early calls `return()` on the iterator it was reading — ' +
        'it closes `drop`, which in turn closes the counter. A `take` written as ' +
        '`for (const v of source) { if (taken < n) yield v; }` never leaves the loop and spins forever on an ' +
        'endless source. Since generators inherit the helpers, `take(drop(counter(), skip), count).toArray()` ' +
        'finishes the job.',
      id: 'build-your-own-drop-and-take',
      methods: ['toArray', 'drop', 'take'],
      order: 16,
      solution: code(`
function* counter(start: number): Generator<number> {
  for (let i = start; ; i += 1) {
    yield i;
  }
}

function* drop<T>(source: Iterable<T>, n: number): Generator<T> {
  let remaining = n;
  for (const value of source) {
    if (remaining > 0) {
      remaining -= 1;
      continue;
    }
    yield value;
  }
}

function* take<T>(source: Iterable<T>, n: number): Generator<T> {
  if (n <= 0) {
    return;
  }
  let remaining = n;
  for (const value of source) {
    yield value;
    remaining -= 1;
    if (remaining === 0) {
      return;
    }
  }
}

export function solve(start: number, skip: number, count: number): number[] {
  return take(drop(counter(start), skip), count).toArray();
}
`),
      starterCode: code(`
function* counter(start: number): Generator<number> {
  for (let i = start; ; i += 1) {
    yield i;
  }
}

function* drop<T>(source: Iterable<T>, n: number): Generator<T> {
  // Swallow the first n values, then yield the rest.
}

function* take<T>(source: Iterable<T>, n: number): Generator<T> {
  // Yield at most n values — and RETURN once you have, or the counter never ends.
}

export function solve(start: number, skip: number, count: number): number[] {
  // take(drop(counter(start), skip), count).toArray() — never toArray() the bare counter.
  return [];
}
`),
      tests: [
        tc('skip two, keep three', [10, 2, 3], [12, 13, 14]),
        tc('skip nothing', [0, 0, 4], [0, 1, 2, 3]),
        tc('count of zero pulls nothing', [5, 3, 0], []),
        tc('keep a single value', [1, 0, 1], [1]),
        tc('negative start', [-3, 1, 2], [-2, -1]),
      ],
      title: 'Rebuild drop and take',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Yield the running total of `amounts` one step at a time from a generator over `amounts.values()`, and ' +
        'the moment the total goes NEGATIVE, `return` from the generator instead of yielding. Materialise with ' +
        '`toArray()` — `[5, -2, -4, 10]` → `[5, 3]`. A total of exactly `0` is not negative.\n\n' +
        'Signature: `solve(amounts: number[]): number[]`',
      difficulty: 'expert',
      explanation:
        'A generator has two ways to hand a value out: `yield` produces an element of the sequence, and ' +
        '`return` ends the sequence. The protocol marks them differently — `yield` shows up as ' +
        '`{ value, done: false }`, `return` as `{ value, done: true }` — and every consumer that follows the ' +
        'protocol, `toArray()` included, keeps only the `done: false` values. So `return total` when the ' +
        'balance dips below zero terminates the sequence without adding the overdrawn total to it: ' +
        '`[5, -2, -4, 10]` yields `5`, then `3`, then computes `-1` and returns, and the trailing `10` is never ' +
        'read from `amounts.values()`. Had the generator used `yield` for that step, `-1` would be an element. ' +
        'This is the same distinction that makes `take` work: the helpers stop at `done: true` and discard ' +
        'whatever value rode along with it.',
      id: 'running-totals-until-overdrawn',
      methods: ['toArray', 'values'],
      order: 17,
      solution: code(`
function* runningTotals(amounts: IterableIterator<number>): Generator<number, number> {
  let total = 0;
  for (const amount of amounts) {
    total += amount;
    if (total < 0) {
      return total;
    }
    yield total;
  }
  return total;
}

export function solve(amounts: number[]): number[] {
  return runningTotals(amounts.values()).toArray();
}
`),
      starterCode: code(`
function* runningTotals(amounts: IterableIterator<number>): Generator<number, number> {
  let total = 0;
  // Add each amount; yield the total while it is >= 0, and RETURN the moment it goes negative.
  return total;
}

export function solve(amounts: number[]): number[] {
  return [];
}
`),
      tests: [
        tc('stops before the overdrawn total', [[5, -2, -4, 10]], [5, 3]),
        tc('never overdrawn yields every total', [[1, 2, 3]], [1, 3, 6]),
        tc('overdrawn on the first amount yields nothing', [[-1, 5]], []),
        tc('a total of zero is still yielded', [[4, -4, 1]], [4, 0, 1]),
        tc('no amounts', [[]], []),
      ],
      title: 'A generator’s return is not an element',
    },
    {
      categoryId: 'iterator-helpers',
      description:
        'Normalise each reading by rounding it through a lazy `map` that counts how many readings it has processed, ' +
        'then check with `every` that no normalised reading exceeds `max`. Return the count and the verdict — ' +
        '`([1, 9, 2, 3], 5)` → `{ checked: 2, valid: false }`; empty → `{ checked: 0, valid: true }`.\n\n' +
        'Signature: `solve(readings: number[], max: number): { checked: number; valid: boolean }`',
      difficulty: 'expert',
      explanation:
        'Array `every` short-circuits, but only over work that is already done: `readings.map(round).every(...)` ' +
        'rounds all four readings first and stops checking at the second, reporting `checked: 4`. Iterator ' +
        '`every` short-circuits the *whole pipeline*. `readings.values().map(...)` has not rounded anything ' +
        'when `every` starts; it pulls a value, `map` rounds one reading, `every` tests it, and the moment a ' +
        'test fails `every` returns `false` and stops pulling. The `9` is the second reading, so `checked` is ' +
        '`2` — the `2` and the `3` were never rounded. On an empty source `every` returns `true` vacuously ' +
        'with `checked` still `0`. The pattern matters whenever the mapping stage is expensive — parsing, ' +
        'validating, fetching from cache — because the lazy chain does only as much of it as the verdict ' +
        'needs. `some`, `find`, and `take` cut the pipeline short in exactly the same way.',
      id: 'validate-lazily-count-the-checks',
      methods: ['values', 'map', 'every'],
      order: 18,
      solution: code(`
export function solve(readings: number[], max: number): { checked: number; valid: boolean } {
  let checked = 0;
  const valid = readings
    .values()
    .map((reading) => {
      checked += 1;
      return Math.round(reading);
    })
    .every((normalised) => normalised <= max);
  return { checked, valid };
}
`),
      starterCode: code(`
export function solve(readings: number[], max: number): { checked: number; valid: boolean } {
  let checked = 0;
  // Count inside the lazy map; every() decides how many readings the map ever sees.
  return { checked, valid: true };
}
`),
      tests: [
        tc('stops at the first invalid reading', [[1, 9, 2, 3], 5], { checked: 2, valid: false }),
        tc('all valid checks everything', [[1, 2], 5], { checked: 2, valid: true }),
        tc('rounding decides validity', [[5.4, 5.6], 5], { checked: 2, valid: false }),
        tc('first reading already invalid', [[6, 1, 1], 5], { checked: 1, valid: false }),
        tc('empty input is vacuously valid', [[], 5], { checked: 0, valid: true }),
      ],
      title: 'every stops the map too',
    },
  ],
};
