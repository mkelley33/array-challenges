import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

interface Record {
  id: number;
  name: string;
}

/**
 * Fixture for `drop-blocked-ids-at-scale`, generated in-module (not by faker) so
 * db.json stays byte-identical across regenerations. Sized at ~2k × ~2k: large
 * enough that `blocked.includes` inside `filter` visibly does O(n·m) work, small
 * enough not to bloat db.json.
 */
const SCALE_RECORD_COUNT = 2000;
const SCALE_BLOCKED_START = 1001;
const SCALE_BLOCKED_COUNT = 2000;

const scaleRecords: Record[] = Array.from({ length: SCALE_RECORD_COUNT }, (_, index) => ({
  id: index + 1,
  name: `u${index + 1}`,
}));

const scaleBlocked: number[] = Array.from({ length: SCALE_BLOCKED_COUNT }, (_, index) => SCALE_BLOCKED_START + index);

const scaleSurvivors: Record[] = scaleRecords.filter((record) => record.id < SCALE_BLOCKED_START);

export const setsAndSetAlgebra: CategoryModule = {
  category: {
    description:
      "Set as the array's partner — convert in both directions, test membership in O(1), and combine collections with the ES2025 union, intersection, and difference family.",
    id: 'sets-and-set-algebra',
    order: 13,
    title: 'Sets & Set Algebra',
  },
  challenges: [
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return a new Set holding every member of `a` together with every member of `b`. Neither input may be ' +
        'changed.\n\n' +
        'Signature: `solve(a: Set<number>, b: Set<number>): Set<number>`',
      difficulty: 'novice',
      explanation:
        '`union` is the first of the ES2025 Set methods: `a.union(b)` returns a brand-new Set containing every ' +
        'member of `a` followed by every member of `b` that was not already present, and it leaves both ' +
        'receivers exactly as they were. Before ES2025 the idiom was `new Set([...a, ...b])` — spread both ' +
        'into one array, then let the Set constructor drop the repeats. That still works, but it allocates an ' +
        'intermediate array as long as both inputs combined; `union` walks `b` once and adds straight into the ' +
        'result. The method takes any set-like argument (something with `size`, `has`, and `keys`), which is ' +
        'why a `Map` works as the right-hand operand but a plain array does not. Membership uses SameValueZero, ' +
        'the same rule as `has`, so `NaN` counts as one member.',
      id: 'union-of-two-sets',
      methods: ['union'],
      order: 1,
      solution: code(`
export function solve(a: Set<number>, b: Set<number>): Set<number> {
  return a.union(b);
}
`),
      starterCode: code(`
export function solve(a: Set<number>, b: Set<number>): Set<number> {
  // One ES2025 method returns a fresh Set with the members of both.
  return new Set();
}
`),
      tests: [
        tc('overlapping members appear once', [new Set([1, 2, 3]), new Set([3, 4])], new Set([1, 2, 3, 4])),
        tc('disjoint sets combine', [new Set([1, 2]), new Set([3, 4])], new Set([1, 2, 3, 4])),
        tc('empty second operand', [new Set([5, 6]), new Set()], new Set([5, 6])),
        tc('both empty', [new Set(), new Set()], new Set()),
        tc('identical sets', [new Set([7, 8]), new Set([8, 7])], new Set([7, 8])),
      ],
      title: 'Union of two sets',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return `true` when every permission in `required` is present in `granted`, and `false` otherwise. An ' +
        'empty `required` is always covered.\n\n' +
        'Signature: `solve(granted: Set<string>, required: Set<string>): boolean`',
      difficulty: 'novice',
      explanation:
        '`granted.isSupersetOf(required)` asks exactly the question posed: does the receiver contain every member ' +
        'of the argument? It walks `required` and calls `granted.has` on each member, returning `false` at the ' +
        'first miss, so the cost is proportional to the smaller side and never to the product of both. The ' +
        'empty case falls out for free — with nothing to check, the loop never finds a missing member and the ' +
        'answer is `true`, which is the mathematical definition of a subset relation as well. Its mirror image ' +
        '`required.isSubsetOf(granted)` gives the same answer; pick whichever reads naturally for the sentence ' +
        'you are writing. The array spelling, `[...required].every((p) => granted.has(p))`, works too but ' +
        'allocates a copy just to iterate.',
      id: 'covers-every-required',
      methods: ['isSupersetOf'],
      order: 2,
      solution: code(`
export function solve(granted: Set<string>, required: Set<string>): boolean {
  return granted.isSupersetOf(required);
}
`),
      starterCode: code(`
export function solve(granted: Set<string>, required: Set<string>): boolean {
  // Is granted a superset of required? One ES2025 method says so.
  return false;
}
`),
      tests: [
        tc('all required are granted', [new Set(['read', 'write', 'admin']), new Set(['read', 'write'])], true),
        tc('one required permission is missing', [new Set(['read']), new Set(['read', 'write'])], false),
        tc('empty required is always covered', [new Set(['read']), new Set()], true),
        tc('equal sets cover each other', [new Set(['a', 'b']), new Set(['b', 'a'])], true),
        tc('nothing granted, something required', [new Set(), new Set(['read'])], false),
      ],
      title: 'Granted covers required',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return a Set of the user ids in `users`. Two users sharing an id contribute one member.\n\n' +
        'Signature: `solve(users: { id: number; name: string }[]): Set<number>`',
      difficulty: 'intermediate',
      explanation:
        'The Set constructor accepts any iterable, so `new Set(users)` is legal — and useless: every user object ' +
        'is a distinct reference, so all of them become members and no id is ever compared. Project to the ' +
        'primitive first: `users.map((user) => user.id)` produces the numbers, and `new Set(...)` of that array ' +
        'collapses the repeats, because numbers compare by value under SameValueZero. The rule generalises: ' +
        'when you want set semantics over records, feed the Set the key, not the record. That is also why ' +
        'this challenge returns the id Set rather than deduplicated users — the Set is the reusable artefact, ' +
        'ready for `has` checks against other collections. The `Array.from(users, (user) => user.id)` spelling ' +
        'does the same projection without the intermediate `map` array.',
      id: 'ids-as-a-set',
      methods: ['new Set', 'map'],
      order: 3,
      solution: code(`
interface User {
  id: number;
  name: string;
}

export function solve(users: User[]): Set<number> {
  return new Set(users.map((user) => user.id));
}
`),
      starterCode: code(`
interface User {
  id: number;
  name: string;
}

export function solve(users: User[]): Set<number> {
  // new Set(users) keeps every object — project to the id first.
  return new Set();
}
`),
      tests: [
        tc(
          'three distinct ids',
          [
            [
              { id: 1, name: 'Ada' },
              { id: 2, name: 'Grace' },
              { id: 3, name: 'Linus' },
            ],
          ],
          new Set([1, 2, 3]),
        ),
        tc(
          'a repeated id contributes one member',
          [
            [
              { id: 1, name: 'Ada' },
              { id: 1, name: 'Ada (dup)' },
              { id: 2, name: 'Grace' },
            ],
          ],
          new Set([1, 2]),
        ),
        tc('no users', [[]], new Set()),
        tc('single user', [[{ id: 42, name: 'Solo' }]], new Set([42])),
      ],
      title: 'Ids as a Set',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return an array of `"#<id>"` labels, one per member of `ids`, in the Set’s insertion order — ' +
        '`solve(new Set([3, 1]))` → `["#3", "#1"]`.\n\n' +
        'Signature: `solve(ids: Set<number>): string[]`',
      difficulty: 'intermediate',
      explanation:
        '`Array.from` takes an optional second argument, a mapping function, and applies it while it copies: ' +
        '`Array.from(ids, (id) => `#${id}`)` walks the Set once and writes each label straight into the new ' +
        'array. The two-step spelling `[...ids].map(...)` reaches the same result but materialises the numbers ' +
        'as an intermediate array first, so it does two passes and two allocations. Insertion order is ' +
        'guaranteed: a Set iterates its members in the order they were added, and `Array.from` preserves ' +
        'whatever order the iterable yields. The mapping function also receives the running index as its ' +
        'second parameter, so `Array.from(set, (value, index) => ...)` can number members without a counter. ' +
        'Any iterable works here — a `Map`, a generator, a string — which makes `Array.from` with a mapper the ' +
        'general tool for “collect and transform in one go”.',
      id: 'labels-from-a-set',
      methods: ['Array.from'],
      order: 4,
      solution: code(`
export function solve(ids: Set<number>): string[] {
  return Array.from(ids, (id) => \`#\${id}\`);
}
`),
      starterCode: code(`
export function solve(ids: Set<number>): string[] {
  // [...ids].map(...) is two passes — Array.from has a mapping argument.
  return [];
}
`),
      tests: [
        tc('labels in insertion order', [new Set([3, 1, 2])], ['#3', '#1', '#2']),
        tc('single member', [new Set([7])], ['#7']),
        tc('empty Set', [new Set()], []),
        tc('zero is a valid id', [new Set([0, 10])], ['#0', '#10']),
      ],
      title: 'Labels straight from a Set',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the SKUs that are in `stock` but were never `ordered`. SKUs that were ordered without being in ' +
        'stock must not appear.\n\n' +
        'Signature: `solve(stock: Set<string>, ordered: Set<string>): Set<string>`\n\n' +
        'Trap: “the things that differ” is not the same question — the difference has a direction.',
      difficulty: 'advanced',
      explanation:
        '`stock.difference(ordered)` is directional: it keeps the members of the receiver that the argument does ' +
        'not have, and nothing else. The trap reaches for `symmetricDifference`, which answers a different ' +
        'question — members in exactly one of the two Sets — so an ordered SKU that never existed in stock ' +
        'sneaks into the result. As long as every order was in stock the two methods agree, which is exactly ' +
        'why the trap survives casual testing; the witness is one SKU on the ordered side only. Read the ' +
        'method name as subtraction, `stock − ordered`: the left operand is what you keep from, the right is ' +
        'what you remove. The pre-ES2025 spelling makes the direction explicit, ' +
        '`new Set([...stock].filter((sku) => !ordered.has(sku)))`, and is worth knowing for older runtimes.',
      id: 'only-in-stock-not-ordered',
      methods: ['difference'],
      order: 5,
      solution: code(`
export function solve(stock: Set<string>, ordered: Set<string>): Set<string> {
  return stock.difference(ordered);
}
`),
      starterCode: code(`
export function solve(stock: Set<string>, ordered: Set<string>): Set<string> {
  // stock minus ordered — which Set method subtracts in one direction only?
  return new Set();
}
`),
      tests: [
        tc(
          'an ordered SKU that was never in stock must not appear (trap)',
          [new Set(['a', 'b', 'c']), new Set(['b', 'c', 'd'])],
          new Set(['a']),
        ),
        tc('every order was in stock', [new Set(['a', 'b', 'c']), new Set(['b'])], new Set(['a', 'c'])),
        tc('nothing ordered', [new Set(['a', 'b']), new Set()], new Set(['a', 'b'])),
        tc('everything ordered', [new Set(['a', 'b']), new Set(['a', 'b'])], new Set()),
        tc('empty stock, orders pending (trap)', [new Set(), new Set(['z'])], new Set()),
      ],
      title: 'In stock, never ordered',
      trap: code(`
export function solve(stock: Set<string>, ordered: Set<string>): Set<string> {
  return stock.symmetricDifference(ordered);
}
`),
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the members of `tags` that also appear in the `wanted` array. Repeats in `wanted` do not ' +
        'matter.\n\n' +
        'Signature: `solve(tags: Set<string>, wanted: string[]): Set<string>`\n\n' +
        'Trap: the Set methods accept set-likes, not arrays — an array passed straight in throws.',
      difficulty: 'advanced',
      explanation:
        'The ES2025 Set methods require a *set-like* argument: an object with a numeric `size`, a `has` method, ' +
        'and a `keys` method. An array has none of the three — its `size` is `undefined` — so ' +
        '`tags.intersection(wanted)` throws `TypeError: The .size property is NaN` before comparing a single ' +
        'member. The fix is one conversion: `tags.intersection(new Set(wanted))`. Wrapping the array also ' +
        'collapses any duplicates in `wanted`, which is harmless here because a Set result can hold each tag ' +
        'once anyway. The rule is easy to remember once you know it exists: `Map` qualifies (it has ' +
        '`size`/`has`/`keys`), arrays and plain objects do not. Prefer converting the array once at the ' +
        'boundary rather than falling back to `[...tags].filter((tag) => wanted.includes(tag))`, which is ' +
        'quadratic in the size of `wanted`.',
      id: 'intersect-set-with-array',
      methods: ['intersection', 'new Set'],
      order: 6,
      solution: code(`
export function solve(tags: Set<string>, wanted: string[]): Set<string> {
  return tags.intersection(new Set(wanted));
}
`),
      starterCode: code(`
export function solve(tags: Set<string>, wanted: string[]): Set<string> {
  // intersection() wants a set-like operand — an array is not one.
  return new Set();
}
`),
      tests: [
        tc('shared tag survives (trap)', [new Set(['a', 'b']), ['b', 'c']], new Set(['b'])),
        tc('repeats in wanted are harmless (trap)', [new Set(['x', 'y', 'z']), ['y', 'y', 'z']], new Set(['y', 'z'])),
        tc('no overlap (trap)', [new Set(['a']), ['b']], new Set()),
        tc('empty wanted array (trap)', [new Set(['a', 'b']), []], new Set()),
      ],
      title: 'Intersect a Set with an array',
      trap: code(`
export function solve(tags: Set<string>, wanted: string[]): Set<string> {
  return tags.intersection(wanted as unknown as Set<string>);
}
`),
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the records of `a` whose `id` also appears in `b`, in `a`’s order. Matching is by id, not by ' +
        'object identity, and the returned records are the ones from `a`.\n\n' +
        'Signature: `solve(a: { id: number; name: string }[], b: { id: number; name: string }[]): { id: number; name: string }[]`\n\n' +
        'Trap: a Set of objects only knows the objects it was given — a record that merely *looks* the same is a miss.',
      difficulty: 'advanced',
      explanation:
        'A Set compares its members with SameValueZero, which for objects means reference identity: ' +
        '`new Set(b).has(record)` is `true` only for the very object that went in, so records from `a` that ' +
        'match a record in `b` field-for-field still come back as misses and the trap returns nothing. The ' +
        'fix is to put the *key* in the Set: `const ids = new Set(b.map((record) => record.id))`, then ' +
        '`a.filter((record) => ids.has(record.id))`. Now `has` compares numbers by value, each lookup is ' +
        'constant time, and `filter` keeps `a`’s order — which is why the description can promise it. This ' +
        'is the general shape for joining two collections on a field: index the smaller side by key once, ' +
        'then stream the other side through `has`. Compare `a.filter((r) => b.some((s) => s.id === r.id))`, ' +
        'which is correct but rescans `b` for every record.',
      id: 'overlap-of-records-by-id',
      methods: ['has', 'filter', 'new Set'],
      order: 7,
      solution: code(`
interface Record {
  id: number;
  name: string;
}

export function solve(a: Record[], b: Record[]): Record[] {
  const ids = new Set(b.map((record) => record.id));
  return a.filter((record) => ids.has(record.id));
}
`),
      starterCode: code(`
interface Record {
  id: number;
  name: string;
}

export function solve(a: Record[], b: Record[]): Record[] {
  // Build a Set of ids from b, then filter a with has().
  return [];
}
`),
      tests: [
        tc(
          'equal-looking records match by id (trap)',
          [[{ id: 1, name: 'Ada' }], [{ id: 1, name: 'Ada' }]],
          [{ id: 1, name: 'Ada' }],
        ),
        tc(
          'keeps a’s order and a’s records (trap)',
          [
            [
              { id: 3, name: 'Linus' },
              { id: 1, name: 'Ada' },
              { id: 2, name: 'Grace' },
            ],
            [
              { id: 1, name: 'Ada H.' },
              { id: 3, name: 'Linus T.' },
            ],
          ],
          [
            { id: 3, name: 'Linus' },
            { id: 1, name: 'Ada' },
          ],
        ),
        tc('no shared ids', [[{ id: 1, name: 'Ada' }], [{ id: 2, name: 'Grace' }]], []),
        tc('empty first list', [[], [{ id: 1, name: 'Ada' }]], []),
      ],
      title: 'Records in both lists, by id',
      trap: code(`
interface Record {
  id: number;
  name: string;
}

export function solve(a: Record[], b: Record[]): Record[] {
  const seen = new Set(b);
  return a.filter((record) => seen.has(record));
}
`),
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the registry with every name in `incoming` added. Either mutate `registry` with `add` and return ' +
        'it, or return the union — but the result must contain the newcomers.\n\n' +
        'Signature: `solve(registry: Set<string>, incoming: string[]): Set<string>`\n\n' +
        'Trap: `union` returns a new Set; called for its side effect, it has none.',
      difficulty: 'advanced',
      explanation:
        'Every ES2025 Set method — `union`, `intersection`, `difference`, and the rest — is pure: it returns a ' +
        'new Set and leaves the receiver untouched, exactly like `toSorted` next to `sort`. The trap calls ' +
        '`registry.union(...)`, throws the result away, and returns the unchanged registry; it passes whenever ' +
        'the incoming names were already registered, so the witness is a genuinely new name. Two correct ' +
        'shapes exist. The functional one keeps the result: `return registry.union(new Set(incoming))`. The ' +
        'mutating one uses the only Set methods that change their receiver — `add`, `delete`, and `clear` — ' +
        'as in `incoming.forEach((name) => registry.add(name)); return registry`. Both are fine; what is not ' +
        'fine is mixing the mental models and expecting `union` to behave like `add`. When a Set method ' +
        'name is a noun (`union`), expect a value back; when it is a verb (`add`), expect a side effect.',
      id: 'union-does-not-mutate',
      methods: ['union', 'add', 'forEach'],
      order: 8,
      solution: code(`
export function solve(registry: Set<string>, incoming: string[]): Set<string> {
  return registry.union(new Set(incoming));
}
`),
      starterCode: code(`
export function solve(registry: Set<string>, incoming: string[]): Set<string> {
  // union() hands back a NEW Set — keep it, or add() each name to registry instead.
  return new Set();
}
`),
      tests: [
        tc('an unregistered name is added (trap)', [new Set(['ada']), ['grace']], new Set(['ada', 'grace'])),
        tc('already registered names change nothing', [new Set(['ada']), ['ada']], new Set(['ada'])),
        tc('nothing incoming', [new Set(['ada', 'grace']), []], new Set(['ada', 'grace'])),
        tc(
          'repeats in incoming register once (trap)',
          [new Set(), ['linus', 'linus', 'ada']],
          new Set(['linus', 'ada']),
        ),
      ],
      title: 'Union returns a new Set',
      trap: code(`
export function solve(registry: Set<string>, incoming: string[]): Set<string> {
  registry.union(new Set(incoming));
  return registry;
}
`),
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return `true` when `a` and `b` hold exactly the same members, regardless of insertion order, and ' +
        '`false` otherwise.\n\n' +
        'Signature: `solve(a: Set<number>, b: Set<number>): boolean`\n\n' +
        'Trap: a subset check is only half of equality.',
      difficulty: 'advanced',
      explanation:
        'Two Sets are equal when each is a subset of the other. `a.isSubsetOf(b)` alone checks only one ' +
        'direction: `{1}` is a subset of `{1, 2}`, and the empty Set is a subset of everything, so the trap ' +
        'reports `true` for any proper subset. The cheap way to close the gap is to compare sizes first — ' +
        '`a.size === b.size && a.isSubsetOf(b)` — because when the sizes match, one containment implies the ' +
        'other, and `size` is a constant-time property read. The symmetric spelling ' +
        '`a.isSubsetOf(b) && b.isSubsetOf(a)` is also correct but walks both Sets. There is no `Set.prototype.equals`; ' +
        'this two-part check is the idiom. Note that `isSubsetOf` short-circuits at the first missing member, ' +
        'so the size guard also stops the comparison from doing any work at all when the counts differ.',
      id: 'sets-are-equal',
      methods: ['isSubsetOf', 'size'],
      order: 9,
      solution: code(`
export function solve(a: Set<number>, b: Set<number>): boolean {
  return a.size === b.size && a.isSubsetOf(b);
}
`),
      starterCode: code(`
export function solve(a: Set<number>, b: Set<number>): boolean {
  // Same members means subset in BOTH directions — or one direction plus equal sizes.
  return false;
}
`),
      tests: [
        tc('a proper subset is not equal (trap)', [new Set([1]), new Set([1, 2])], false),
        tc('empty is a subset of everything but equal to nothing non-empty (trap)', [new Set(), new Set([1])], false),
        tc('same members in a different order', [new Set([1, 2, 3]), new Set([3, 1, 2])], true),
        tc('two empty sets are equal', [new Set(), new Set()], true),
        tc('a superset is not equal', [new Set([1, 2]), new Set([1])], false),
        tc('same size, different members', [new Set([1, 2]), new Set([2, 3])], false),
      ],
      title: 'Same members, either order',
      trap: code(`
export function solve(a: Set<number>, b: Set<number>): boolean {
  return a.isSubsetOf(b);
}
`),
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the values of `a` that also occur in `b`, keeping each value min(count in `a`, count in `b`) ' +
        'times, in `a`’s order — `solve([1, 1, 2], [1, 1, 3])` → `[1, 1]`.\n\n' +
        'Signature: `solve(a: number[], b: number[]): number[]`\n\n' +
        'Trap: a Set remembers *whether* a value is present, never *how many times*.',
      difficulty: 'advanced',
      explanation:
        'Converting both arrays to Sets and intersecting them answers the wrong question: a Set stores each ' +
        'value once, so the multiplicity is gone before the intersection runs and `[1, 1]` collapses to `[1]`. ' +
        'When counts matter, the right structure is a `Map` from value to remaining count — a multiset. Build ' +
        'it from `b` with `counts.set(value, (counts.get(value) ?? 0) + 1)`, then `filter` over `a`: a value ' +
        'passes when `counts.get(value)` is positive, and each pass decrements the count with `set` so the ' +
        'next repeat draws from what is left. Filtering `a` rather than iterating the `Map` is what preserves ' +
        '`a`’s order, which the description promises. The lesson is a boundary rule: reach for `Set` when the ' +
        'question is membership, and for `Map` the moment the question becomes “how many”.',
      id: 'shared-values-with-multiplicity',
      methods: ['Map', 'get', 'set', 'filter'],
      order: 10,
      solution: code(`
export function solve(a: number[], b: number[]): number[] {
  const counts = new Map<number, number>();
  for (const value of b) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return a.filter((value) => {
    const remaining = counts.get(value) ?? 0;
    if (remaining === 0) {
      return false;
    }
    counts.set(value, remaining - 1);
    return true;
  });
}
`),
      starterCode: code(`
export function solve(a: number[], b: number[]): number[] {
  // A Set forgets counts — tally b into a Map, then filter a while decrementing.
  return [];
}
`),
      tests: [
        tc(
          'repeated value kept twice (trap)',
          [
            [1, 1, 2],
            [1, 1, 3],
          ],
          [1, 1],
        ),
        tc('capped by the smaller count (trap)', [[1, 1, 1], [1]], [1]),
        tc(
          'no shared values',
          [
            [1, 2],
            [3, 4],
          ],
          [],
        ),
        tc(
          'a’s order is preserved',
          [
            [3, 2, 1],
            [1, 2, 3],
          ],
          [3, 2, 1],
        ),
        tc(
          'interleaved repeats (trap)',
          [
            [2, 1, 2],
            [2, 2, 1],
          ],
          [2, 1, 2],
        ),
        tc('empty a', [[], [1, 2]], []),
      ],
      title: 'Shared values, counted',
      trap: code(`
export function solve(a: number[], b: number[]): number[] {
  return [...new Set(a).intersection(new Set(b))];
}
`),
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the members shared by `a` and `b` as an array in `a`’s insertion order — ' +
        '`solve(new Set([1, 2, 3, 4]), new Set([4, 1]))` → `[1, 4]`.\n\n' +
        'Signature: `solve(a: Set<number>, b: Set<number>): number[]`\n\n' +
        'Trap: `intersection` iterates whichever operand is smaller, so its order is not always `a`’s.',
      difficulty: 'advanced',
      explanation:
        '`a.intersection(b)` is correct as a Set, but its *iteration order* is an implementation detail the ' +
        'specification pins down in a surprising way: to do the least work it walks the smaller operand and ' +
        'probes the larger one with `has`, so when `b` is smaller the result comes out in `b`’s order. Spread ' +
        'that into an array and the order promise is broken whenever `a.size > b.size` and the two orders ' +
        'disagree. When the order of the result matters, own the loop: `[...a].filter((x) => b.has(x))` walks ' +
        '`a` in insertion order and keeps `filter`’s guarantee that survivors stay in sequence. The `has` ' +
        'probe is still constant time, so nothing is lost. The general rule — a Set is a membership structure, ' +
        'not an ordered one — applies to every ES2025 method; use `intersection` when you want a Set back, ' +
        'and `filter` with `has` when you want a specific order.',
      id: 'intersection-in-first-operand-order',
      methods: ['intersection', 'has', 'filter'],
      order: 11,
      solution: code(`
export function solve(a: Set<number>, b: Set<number>): number[] {
  return [...a].filter((value) => b.has(value));
}
`),
      starterCode: code(`
export function solve(a: Set<number>, b: Set<number>): number[] {
  // Which operand does intersection() walk? Filter a yourself to control the order.
  return [];
}
`),
      tests: [
        tc('a larger than b, orders differ (trap)', [new Set([1, 2, 3, 4]), new Set([4, 1])], [1, 4]),
        tc('a smaller than b', [new Set([4, 1]), new Set([1, 2, 3, 4])], [4, 1]),
        tc('no shared members', [new Set([1, 2]), new Set([3])], []),
        tc('empty first operand', [new Set(), new Set([1])], []),
        tc('a much larger, one shared member (trap)', [new Set([9, 8, 7, 6, 5]), new Set([5, 0])], [5]),
      ],
      title: 'Intersection in the first operand’s order',
      trap: code(`
export function solve(a: Set<number>, b: Set<number>): number[] {
  return [...a.intersection(b)];
}
`),
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Rebuild `symmetricDifference` from primitives: return a new Set of the members that are in exactly one ' +
        'of `a` and `b`, using only `has`, `add`, and `delete` — the ES2025 algebra methods are off limits. ' +
        'Neither input may change.\n\n' +
        'Signature: `solve(a: Set<number>, b: Set<number>): Set<number>`',
      difficulty: 'expert',
      explanation:
        'Start from a copy — `new Set(a)` — and walk `b` once: for each member, `has` decides whether it is ' +
        'shared, `delete` removes a shared member (it is in both, so it belongs in neither side of the ' +
        'answer), and `add` inserts an unshared one. One pass, no intermediate arrays, and the inputs survive ' +
        'because every mutation lands on the copy. The interesting cases are the ones a hand-rolled `===` loop ' +
        'gets wrong: Set membership uses SameValueZero, so `has(NaN)` is `true` when `NaN` is a member and the ' +
        'two `NaN`s cancel correctly, and `-0` is stored as `0` the moment it is added, so `{0}` and `{-0}` ' +
        'are the same Set. The pre-ES2025 catalog idiom, `new Set([...a].filter((x) => !b.has(x)).concat(...))`, ' +
        'needs two filters and a concat; the copy-then-toggle loop is shorter and does half the work.',
      id: 'build-your-own-symmetric-difference',
      methods: ['has', 'add', 'delete'],
      order: 12,
      solution: code(`
export function solve(a: Set<number>, b: Set<number>): Set<number> {
  const result = new Set(a);
  for (const value of b) {
    if (result.has(value)) {
      result.delete(value);
    } else {
      result.add(value);
    }
  }
  return result;
}
`),
      starterCode: code(`
export function solve(a: Set<number>, b: Set<number>): Set<number> {
  // Copy a, then for each member of b: delete it if present, add it otherwise.
  return new Set();
}
`),
      tests: [
        tc('members in exactly one Set', [new Set([1, 2, 3]), new Set([2, 3, 4])], new Set([1, 4])),
        tc('NaN cancels against NaN', [new Set([NaN, 1]), new Set([NaN, 2])], new Set([1, 2])),
        tc('a Set stores -0 as 0, so {0} and {-0} cancel', [new Set([0]), new Set([-0])], new Set()),
        tc('disjoint sets give their union', [new Set([1]), new Set([2])], new Set([1, 2])),
        tc('identical sets give nothing', [new Set([5, 6]), new Set([6, 5])], new Set()),
        tc('empty second operand', [new Set([1, 2]), new Set()], new Set([1, 2])),
      ],
      title: 'Build your own symmetricDifference',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Partition two Sets into the three regions of a Venn diagram: return `{ both, onlyA, onlyB }`, three ' +
        'Sets that are pairwise disjoint and whose union is `a ∪ b`.\n\n' +
        'Signature: `solve(a: Set<string>, b: Set<string>): { both: Set<string>; onlyA: Set<string>; onlyB: Set<string> }`',
      difficulty: 'expert',
      explanation:
        'Three ES2025 calls name the three regions directly: `a.intersection(b)` is the overlap, ' +
        '`a.difference(b)` is what only `a` has, and `b.difference(a)` is what only `b` has. Each call returns ' +
        'a fresh Set and leaves the inputs alone, so the three results can be assembled into one object ' +
        'without any defensive copying. The two `difference` calls read in opposite directions on purpose — ' +
        'the method subtracts its argument from its receiver, so swapping the operands swaps the region. The ' +
        'partition invariants follow from the definitions: `both ∪ onlyA = a`, `both ∪ onlyB = b`, and no ' +
        'member can be in two regions at once. A single hand-rolled loop could fill all three Sets in one pass, ' +
        'and for very large inputs that saves two traversals; for readability, three named `intersection` ' +
        'and `difference` calls are hard to beat.',
      id: 'venn-partition',
      methods: ['intersection', 'difference'],
      order: 13,
      solution: code(`
interface Partition {
  both: Set<string>;
  onlyA: Set<string>;
  onlyB: Set<string>;
}

export function solve(a: Set<string>, b: Set<string>): Partition {
  return {
    both: a.intersection(b),
    onlyA: a.difference(b),
    onlyB: b.difference(a),
  };
}
`),
      starterCode: code(`
interface Partition {
  both: Set<string>;
  onlyA: Set<string>;
  onlyB: Set<string>;
}

export function solve(a: Set<string>, b: Set<string>): Partition {
  // intersection for both; difference in each direction for the exclusive regions.
  return { both: new Set(), onlyA: new Set(), onlyB: new Set() };
}
`),
      tests: [
        tc('overlapping sets fill all three regions', [new Set(['a', 'b', 'c']), new Set(['b', 'c', 'd'])], {
          both: new Set(['b', 'c']),
          onlyA: new Set(['a']),
          onlyB: new Set(['d']),
        }),
        tc('disjoint sets have an empty overlap', [new Set(['a']), new Set(['b'])], {
          both: new Set(),
          onlyA: new Set(['a']),
          onlyB: new Set(['b']),
        }),
        tc('identical sets are all overlap', [new Set(['x', 'y']), new Set(['y', 'x'])], {
          both: new Set(['x', 'y']),
          onlyA: new Set(),
          onlyB: new Set(),
        }),
        tc('both empty', [new Set(), new Set()], { both: new Set(), onlyA: new Set(), onlyB: new Set() }),
        tc('one empty operand', [new Set(['a', 'b']), new Set()], {
          both: new Set(),
          onlyA: new Set(['a', 'b']),
          onlyB: new Set(),
        }),
      ],
      title: 'Venn partition',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the Set of values that appear in every list of `lists`. With no lists the answer is an empty ' +
        'Set; with one list it is that list’s distinct values.\n\n' +
        'Signature: `solve(lists: number[][]): Set<number>`',
      difficulty: 'expert',
      explanation:
        'Convert each list once — `lists.map((list) => new Set(list))` — so membership tests are constant ' +
        'time, then fold: `reduce` threads a running Set through the rest, replacing it with ' +
        '`acc.intersection(next)` at each step. Because `intersection` walks the smaller operand, the running ' +
        'Set can only shrink, so later steps get cheaper, not dearer. The seed is the first Set itself, which ' +
        'is exactly what makes the one-list case correct — the fold never runs and the distinct values come ' +
        'back unchanged. The zero-list case needs a guard: a seedless `reduce` over an empty array throws, ' +
        'and mathematically the intersection of nothing is undefined, so the description picks the empty Set. ' +
        'The array-only spelling, `lists[0].filter((v) => lists.every((l) => l.includes(v)))`, is quadratic ' +
        'in list length and still has to dedupe afterwards.',
      id: 'common-to-every-list',
      methods: ['new Set', 'map', 'reduce', 'intersection'],
      order: 14,
      solution: code(`
export function solve(lists: number[][]): Set<number> {
  if (lists.length === 0) {
    return new Set();
  }
  const [first, ...rest] = lists.map((list) => new Set(list));
  return rest.reduce((acc, next) => acc.intersection(next), first);
}
`),
      starterCode: code(`
export function solve(lists: number[][]): Set<number> {
  // Map each list to a Set, then reduce with intersection — mind the empty input.
  return new Set();
}
`),
      tests: [
        tc(
          'shared by three lists',
          [
            [
              [1, 2, 3, 4],
              [2, 3, 5],
              [3, 2, 9],
            ],
          ],
          new Set([2, 3]),
        ),
        tc('no lists', [[]], new Set()),
        tc('one list gives its distinct values', [[[4, 4, 5]]], new Set([4, 5])),
        tc(
          'nothing in common',
          [
            [
              [1, 2],
              [3, 4],
            ],
          ],
          new Set(),
        ),
        tc('an empty list empties the result', [[[1, 2], [], [1]]], new Set()),
      ],
      title: 'Common to every list',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the values that appear in exactly one list of `lists`, in first-seen order. A value repeated ' +
        'within a single list still counts as appearing in one list.\n\n' +
        'Signature: `solve(lists: string[][]): string[]`',
      difficulty: 'expert',
      explanation:
        'Two structures, one each for the two questions. First, `new Set(list)` per list answers “which ' +
        'distinct values does this list contain?” — repeats inside a list vanish, so `["a", "a"]` contributes ' +
        '`a` once. Second, a `Map` from value to list-count answers “how many lists?”: for each member of each ' +
        'per-list Set, `counts.set(value, (counts.get(value) ?? 0) + 1)`. A `Map` iterates in insertion ' +
        'order, and a value is inserted the first time any list mentions it, so `[...counts.keys()]` is already ' +
        'in first-seen order; a final `filter` keeps the keys whose count is `1`. Skipping the per-list Set is ' +
        'the tempting shortcut — counting raw occurrences would report `["a", "a"]` as two lists. The Set ' +
        'dedupes within a list, the Map counts across lists, and `filter` reads the answer off.',
      id: 'in-exactly-one-list',
      methods: ['new Set', 'Map', 'filter'],
      order: 15,
      solution: code(`
export function solve(lists: string[][]): string[] {
  const counts = new Map<string, number>();
  for (const list of lists) {
    for (const value of new Set(list)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.keys()].filter((value) => counts.get(value) === 1);
}
`),
      starterCode: code(`
export function solve(lists: string[][]): string[] {
  // Per-list Set (dedupe within), Map of counts (across lists), keep count 1.
  return [];
}
`),
      tests: [
        tc(
          'values unique to one list',
          [
            [
              ['a', 'b'],
              ['b', 'c'],
            ],
          ],
          ['a', 'c'],
        ),
        tc('repeats within a list count once', [[['a', 'a'], ['b']]], ['a', 'b']),
        tc('a value in every list is dropped', [[['x'], ['x'], ['x']]], []),
        tc('no lists', [[]], []),
        tc('first-seen order across lists', [[['x', 'y'], ['z', 'y'], ['w']]], ['x', 'z', 'w']),
      ],
      title: 'In exactly one list',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the records whose `id` is not in `blocked`, in input order. One test case has about 2,000 ' +
        'records and 2,000 blocked ids — write the solution so the blocklist is scanned once, not once per ' +
        'record.\n\n' +
        'Signature: `solve(records: { id: number; name: string }[], blocked: number[]): { id: number; name: string }[]`',
      difficulty: 'expert',
      explanation:
        'The obvious `records.filter((record) => !blocked.includes(record.id))` is correct and passes every ' +
        'test — the gate cannot measure time — but it is O(n·m): `includes` scans the blocklist from the front ' +
        'for every record, so 2,000 records against 2,000 ids is up to four million comparisons, and the cost ' +
        'grows with the product of both inputs. Building the Set once, `const blockedIds = new Set(blocked)`, ' +
        'costs O(m) up front and then makes each `has` lookup constant time, so the `filter` pass is O(n) and ' +
        'the total is O(n + m). The shape to internalise: whenever a membership test sits inside a loop, hoist ' +
        'the collection being searched into a Set *outside* the loop. Do not build the Set inside the callback ' +
        '— that reintroduces the O(m) cost per record and is slower than `includes`. Order needs no extra ' +
        'work; `filter` preserves it.',
      id: 'drop-blocked-ids-at-scale',
      methods: ['new Set', 'has', 'filter'],
      order: 16,
      solution: code(`
interface Record {
  id: number;
  name: string;
}

export function solve(records: Record[], blocked: number[]): Record[] {
  const blockedIds = new Set(blocked);
  return records.filter((record) => !blockedIds.has(record.id));
}
`),
      starterCode: code(`
interface Record {
  id: number;
  name: string;
}

export function solve(records: Record[], blocked: number[]): Record[] {
  // blocked.includes inside filter is O(n·m) — build a Set ONCE, then has() in the filter.
  return [];
}
`),
      tests: [
        tc(
          'one of three is blocked',
          [
            [
              { id: 1, name: 'Ada' },
              { id: 2, name: 'Grace' },
              { id: 3, name: 'Linus' },
            ],
            [2],
          ],
          [
            { id: 1, name: 'Ada' },
            { id: 3, name: 'Linus' },
          ],
        ),
        tc('nothing blocked', [[{ id: 1, name: 'Ada' }], []], [{ id: 1, name: 'Ada' }]),
        tc('everything blocked', [[{ id: 1, name: 'Ada' }], [1, 1, 2]], []),
        tc('no records', [[], [1, 2, 3]], []),
        tc('2,000 records against 2,000 blocked ids', [scaleRecords, scaleBlocked], scaleSurvivors),
      ],
      title: 'Drop blocked ids at scale',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the names of the rooms whose `booked` slots share nothing with `request`, ordered by fewest ' +
        'bookings first and then by name for ties.\n\n' +
        'Signature: `solve(rooms: { booked: Set<number>; name: string }[], request: Set<number>): string[]`',
      difficulty: 'expert',
      explanation:
        '`room.booked.isDisjointFrom(request)` is the availability test in one call: it returns `true` when ' +
        'the two Sets share no member, walking the smaller of the two and probing the other with `has`, and ' +
        'it stops at the first clash. An empty `request` is disjoint from everything, so every room is free ' +
        'for it. From there the pipeline is three array methods: `filter` keeps the free rooms, `toSorted` ' +
        'orders them by `booked.size` and breaks ties with `localeCompare` on the name, and `map` projects the ' +
        'names. `toSorted` rather than `sort` matters because the filtered array is fresh anyway but the ' +
        'comparator habit should be copy-first; `size` is a property, not a method, so there is no call to ' +
        'make. The pre-ES2025 spelling `![...room.booked].some((slot) => request.has(slot))` works on older ' +
        'runtimes, at the cost of spreading each Set.',
      id: 'rooms-free-for-every-slot',
      methods: ['isDisjointFrom', 'filter', 'toSorted', 'map'],
      order: 17,
      solution: code(`
interface Room {
  booked: Set<number>;
  name: string;
}

export function solve(rooms: Room[], request: Set<number>): string[] {
  return rooms
    .filter((room) => room.booked.isDisjointFrom(request))
    .toSorted((x, y) => x.booked.size - y.booked.size || x.name.localeCompare(y.name))
    .map((room) => room.name);
}
`),
      starterCode: code(`
interface Room {
  booked: Set<number>;
  name: string;
}

export function solve(rooms: Room[], request: Set<number>): string[] {
  // filter by isDisjointFrom, toSorted by booked.size then name, map to names.
  return [];
}
`),
      tests: [
        tc(
          'free rooms, fewest bookings first',
          [
            [
              { booked: new Set([1, 2, 3]), name: 'Atlas' },
              { booked: new Set([9]), name: 'Birch' },
              { booked: new Set([4, 5]), name: 'Cedar' },
              { booked: new Set([7, 8]), name: 'Delta' },
            ],
            new Set([4, 6]),
          ],
          ['Birch', 'Delta', 'Atlas'],
        ),
        tc(
          'ties broken by name',
          [
            [
              { booked: new Set([1]), name: 'Zed' },
              { booked: new Set([2]), name: 'Amber' },
            ],
            new Set([3]),
          ],
          ['Amber', 'Zed'],
        ),
        tc(
          'every room clashes',
          [
            [
              { booked: new Set([1]), name: 'Atlas' },
              { booked: new Set([1, 2]), name: 'Birch' },
            ],
            new Set([1]),
          ],
          [],
        ),
        tc('no rooms', [[], new Set([1])], []),
        tc(
          'empty request is disjoint from everything',
          [
            [
              { booked: new Set([1, 2]), name: 'Birch' },
              { booked: new Set(), name: 'Atlas' },
            ],
            new Set(),
          ],
          ['Atlas', 'Birch'],
        ),
      ],
      title: 'Rooms free for every slot',
    },
    {
      categoryId: 'sets-and-set-algebra',
      description:
        'Return the Jaccard similarity of `a` and `b`: the size of their intersection divided by the size of ' +
        'their union. Two empty Sets have similarity `0`, never `NaN`.\n\n' +
        'Signature: `solve(a: Set<string>, b: Set<string>): number`',
      difficulty: 'expert',
      explanation:
        'Jaccard similarity is set algebra by definition, |a ∩ b| / |a ∪ b|, and the ES2025 methods let the ' +
        'code read like the formula: `a.intersection(b).size / a.union(b).size`. Both calls return fresh Sets, ' +
        'so the inputs survive, and `size` is a constant-time property read on each. The one hazard is the ' +
        'denominator: when both inputs are empty the `union` is empty too, and `0 / 0` is `NaN` — a value ' +
        'that fails every comparison and poisons any average built on top of it. Compute the `union` first, ' +
        'guard `union.size === 0`, and return `0` for that case; the description fixes that convention so ' +
        'callers can rely on it. Identical Sets score `1` because the intersection and union coincide; ' +
        'disjoint Sets score `0` because the intersection is empty. Inclusion–exclusion gives a cheaper ' +
        'denominator, `a.size + b.size − intersection.size`, which avoids building the union at all.',
      id: 'jaccard-similarity',
      methods: ['intersection', 'union', 'size'],
      order: 18,
      solution: code(`
export function solve(a: Set<string>, b: Set<string>): number {
  const union = a.union(b);
  if (union.size === 0) {
    return 0;
  }
  return a.intersection(b).size / union.size;
}
`),
      starterCode: code(`
export function solve(a: Set<string>, b: Set<string>): number {
  // |a ∩ b| / |a ∪ b| — but guard the empty union so 0/0 never becomes NaN.
  return 0;
}
`),
      tests: [
        tc('half the union is shared', [new Set(['a', 'b', 'c']), new Set(['b', 'c', 'd'])], 0.5),
        tc('identical sets score 1', [new Set(['x', 'y']), new Set(['y', 'x'])], 1),
        tc('disjoint sets score 0', [new Set(['a']), new Set(['b'])], 0),
        tc('two empty sets score 0, not NaN', [new Set(), new Set()], 0),
        tc('one empty set scores 0', [new Set(['a']), new Set()], 0),
        tc('one of four shared', [new Set(['a']), new Set(['a', 'b', 'c', 'd'])], 0.25),
      ],
      title: 'Jaccard similarity',
    },
  ],
};
