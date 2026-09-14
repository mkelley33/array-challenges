import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const immutableUpdates: CategoryModule = {
  category: {
    description:
      'Change array contents without mutating the source — the ES2023 change-by-copy methods with, toReversed, and toSpliced return fresh arrays every time.',
    id: 'immutable-updates',
    order: 9,
    title: 'Immutable Updates',
  },
  challenges: [
    {
      categoryId: 'immutable-updates',
      description:
        'Return a copy of `values` with the element at `index` replaced by `replacement`, leaving the input ' +
        'untouched. Negative indices count back from the end: `-1` targets the last element.\n\n' +
        'Signature: `solve(values: number[], index: number, replacement: number): number[]`',
      difficulty: 'novice',
      explanation:
        '`with(index, value)` is the immutable cousin of `values[index] = value`: it returns a brand-new array ' +
        'with exactly one slot changed and never touches the original. It improves on bracket assignment in two ' +
        'ways. First, it understands negative indices — `with(-1, v)` replaces the last element, mirroring ' +
        '`at(-1)`, where `values[-1] = v` would silently create a string-keyed property instead. Second, an ' +
        'out-of-range index throws a `RangeError`, whereas an out-of-range bracket write silently grows the ' +
        'array with holes. One expression, one changed slot, no side effects.',
      id: 'replace-at-index',
      methods: ['with'],
      order: 1,
      solution: code(`
export function solve(values: number[], index: number, replacement: number): number[] {
  return values.with(index, replacement);
}
`),
      starterCode: code(`
export function solve(values: number[], index: number, replacement: number): number[] {
  // values[index] = replacement mutates — one ES2023 method copies instead.
  return [];
}
`),
      tests: [
        tc('replaces in the middle', [[1, 2, 3], 1, 9], [1, 9, 3]),
        tc('negative index replaces the last element', [[1, 2, 3], -1, 7], [1, 2, 7]),
        tc('replaces the first element', [[5, 6], 0, 0], [0, 6]),
        tc('single-element array', [[4], 0, 8], [8]),
      ],
      title: 'Replace at an index',
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Return a two-element tuple: the reversed copy first, then the ORIGINAL array — ' +
        '`solve([1, 2, 3])` → `[[3, 2, 1], [1, 2, 3]]`.\n\n' +
        'Signature: `solve(values: number[]): [number[], number[]]`\n\n' +
        'Trap: `reverse()` reverses in place, so `[values.reverse(), values]` returns the same reversed array twice.',
      difficulty: 'novice',
      explanation:
        '`reverse()` mutates: it flips the array in place and returns *the same array*, so ' +
        '`[values.reverse(), values]` is two references to one reversed object — the original ordering is gone. ' +
        '`toReversed()` is its change-by-copy twin: the receiver keeps its order and a new reversed array comes ' +
        'back. The tuple in this challenge is the proof — the tests can see both the copy and the untouched ' +
        'source at once, so an in-place `reverse` fails every non-palindrome case. ES2023 added a copying twin ' +
        'for each mutating pair: `toReversed`/`reverse`, `toSorted`/`sort`, `toSpliced`/`splice`.',
      id: 'reverse-keep-original',
      methods: ['toReversed'],
      order: 2,
      solution: code(`
export function solve(values: number[]): [number[], number[]] {
  return [values.toReversed(), values];
}
`),
      starterCode: code(`
export function solve(values: number[]): [number[], number[]] {
  // Careful: reverse() flips values itself — the 'original' would come back reversed too.
  return [[], []];
}
`),
      tests: [
        tc(
          'reverses a copy and keeps the original',
          [[1, 2, 3]],
          [
            [3, 2, 1],
            [1, 2, 3],
          ],
        ),
        tc(
          'two elements',
          [[1, 2]],
          [
            [2, 1],
            [1, 2],
          ],
        ),
        tc(
          'palindrome still yields two arrays',
          [[1, 2, 1]],
          [
            [1, 2, 1],
            [1, 2, 1],
          ],
        ),
        tc('empty array', [[]], [[], []]),
        tc('single element', [[7]], [[7], [7]]),
      ],
      title: 'Reverse, keep the original',
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Two edits, zero mutations: first remove `removeCount` elements starting at index `removeFrom`, then ' +
        'insert `value` at position `insertAt` in the shortened result.\n\n' +
        'Signature: `solve(values: number[], insertAt: number, value: number, removeFrom: number, removeCount: number): number[]`',
      difficulty: 'intermediate',
      explanation:
        '`toSpliced(start, deleteCount, ...items)` mirrors `splice` argument-for-argument but returns a new ' +
        'array instead of mutating the receiver and returning the removed elements. That difference makes it ' +
        'chainable: `values.toSpliced(removeFrom, removeCount).toSpliced(insertAt, 0, value)` performs the ' +
        'removal, then inserts into the *result* — each call produces a fresh array, so the input survives both ' +
        'steps. A `deleteCount` of `0` turns `toSpliced` into pure insertion, and omitting items turns it into ' +
        'pure deletion — one method covers the whole insert/remove/replace family.',
      id: 'insert-and-remove',
      methods: ['toSpliced'],
      order: 3,
      solution: code(`
export function solve(
  values: number[],
  insertAt: number,
  value: number,
  removeFrom: number,
  removeCount: number,
): number[] {
  return values.toSpliced(removeFrom, removeCount).toSpliced(insertAt, 0, value);
}
`),
      starterCode: code(`
export function solve(
  values: number[],
  insertAt: number,
  value: number,
  removeFrom: number,
  removeCount: number,
): number[] {
  // splice() mutates and returns the REMOVED items — its to-prefixed twin chains cleanly.
  return [];
}
`),
      tests: [
        tc('removes a range then inserts', [[1, 2, 3, 4], 0, 9, 1, 2], [9, 1, 4]),
        tc('inserts into the middle', [[10, 20, 30], 1, 15, 2, 1], [10, 15, 20]),
        tc('pure insert when removeCount is zero', [[1, 2], 2, 3, 0, 0], [1, 2, 3]),
        tc('remove everything then insert', [[5, 6, 7], 0, 1, 0, 3], [1]),
        tc('empty input', [[], 0, 42, 0, 0], [42]),
      ],
      title: 'Insert and remove, immutably',
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Move the element at index `from` so it ends up at index `to` of the returned array — both directions, ' +
        'no mutation. Example: `solve([1, 2, 3, 4], 0, 2)` → `[2, 3, 1, 4]`.\n\n' +
        'Signature: `solve(values: number[], from: number, to: number): number[]`\n\n' +
        'Trap: the order of the two edits decides whether your indices still mean what you think they mean.',
      difficulty: 'intermediate',
      explanation:
        'Two `toSpliced` calls: `toSpliced(from, 1)` deletes the element, then `toSpliced(to, 0, moved)` inserts ' +
        'it back. The trick is the index shift — removing first slides every later element one slot left, and ' +
        'that is exactly what makes the raw `to` correct: the shortened array *is* the final array minus the ' +
        'moved element, so inserting at position `to` lands it at index `to` of the result, forward and backward ' +
        'alike. Try the opposite order and the shift works against you: inserting first moves the original ' +
        'occupant of `from` when `to <= from`, so the follow-up removal deletes the wrong element. Remove first, ' +
        'insert second — and grab `values[from]` before either call.',
      id: 'move-item',
      methods: ['toSpliced'],
      order: 4,
      solution: code(`
export function solve(values: number[], from: number, to: number): number[] {
  const moved = values[from];
  return values.toSpliced(from, 1).toSpliced(to, 0, moved);
}
`),
      starterCode: code(`
export function solve(values: number[], from: number, to: number): number[] {
  // Remove at from, insert at to — but in which order do the indices stay honest?
  return [];
}
`),
      tests: [
        tc('moves forward', [[1, 2, 3, 4], 0, 2], [2, 3, 1, 4]),
        tc('moves backward', [[1, 2, 3, 4], 3, 1], [1, 4, 2, 3]),
        tc('same index is a no-op', [[7, 8, 9], 1, 1], [7, 8, 9]),
        tc('first to last', [[1, 2, 3], 0, 2], [2, 3, 1]),
        tc('swaps a pair', [[1, 2], 1, 0], [2, 1]),
      ],
      title: 'Move an item',
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Return a new todo list where the todo at `index` is marked `done: true` — without mutating the ' +
        'original array OR the original todo object.\n\n' +
        'Signature: `solve(todos: { done: boolean; id: number }[], index: number): { done: boolean; id: number }[]`\n\n' +
        'Trap: `with` copies the array, not the objects inside it — replacing a slot with a *mutated original* ' +
        'still corrupts the input.',
      difficulty: 'advanced',
      explanation:
        '`with(index, ...)` copies the array — and only the array. Every slot of the copy points at the exact ' +
        'same objects as the source, because all the change-by-copy methods are shallow. That sharing is fine, ' +
        'even desirable, for the todos you are not changing: they are identical, so copying them would be pure ' +
        'waste. The one slot being REPLACED is different — mutating `todos[index].done` would reach through the ' +
        'shared reference into the caller’s data, so that slot needs a fresh object: ' +
        '`todos.with(index, { ...todos[index], done: true })` spreads the old todo into a new literal. The same ' +
        'shape works with `map` — `todos.map((todo, i) => (i === index ? { ...todo, done: true } : todo))` — ' +
        'which makes the rule visible: untouched elements returned by reference, the changed one built fresh.',
      id: 'complete-todo',
      methods: ['with', 'map'],
      order: 5,
      solution: code(`
interface Todo {
  done: boolean;
  id: number;
}

export function solve(todos: Todo[], index: number): Todo[] {
  return todos.with(index, { ...todos[index], done: true });
}
`),
      starterCode: code(`
interface Todo {
  done: boolean;
  id: number;
}

export function solve(todos: Todo[], index: number): Todo[] {
  // with() swaps the SLOT — but the replacement must be a fresh object, not a mutated original.
  return [];
}
`),
      tests: [
        tc(
          'marks the middle todo done',
          [
            [
              { done: false, id: 1 },
              { done: false, id: 2 },
              { done: false, id: 3 },
            ],
            1,
          ],
          [
            { done: false, id: 1 },
            { done: true, id: 2 },
            { done: false, id: 3 },
          ],
        ),
        tc(
          'marks the first todo',
          [
            [
              { done: false, id: 1 },
              { done: true, id: 2 },
            ],
            0,
          ],
          [
            { done: true, id: 1 },
            { done: true, id: 2 },
          ],
        ),
        tc('already done stays done', [[{ done: true, id: 1 }], 0], [{ done: true, id: 1 }]),
        tc(
          'marks the last todo',
          [
            [
              { done: false, id: 1 },
              { done: false, id: 2 },
            ],
            1,
          ],
          [
            { done: false, id: 1 },
            { done: true, id: 2 },
          ],
        ),
      ],
      title: 'Complete a todo, shallowly',
      trap: code(`
interface Todo {
  done: boolean;
  id: number;
}

export function solve(todos: Todo[], index: number): Todo[] {
  return todos.with(index, { done: true } as Todo);
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Prepend `items`, in order, to the front of `values` and return a tuple `[prepended, original]` — the new ' +
        'array first, then `values` itself, which must still hold its original contents.\n\n' +
        'Signature: `solve(values: number[], items: number[]): [number[], number[]]`\n\n' +
        '`unshift` is the mutating way to prepend; the change-by-copy family spells the same edit with `toSpliced`.',
      difficulty: 'advanced',
      explanation:
        '`unshift` prepends in place and returns the new *length*, so the trap’s `prepended` and `values` are one ' +
        'array — the tuple comes back as the same prepended list twice and the “original” is gone. ' +
        '`toSpliced(0, 0, ...items)` is the copying spelling of the same edit: start at index `0`, delete nothing, ' +
        'insert the items — and hand back a fresh array while the receiver keeps its contents. That is what makes ' +
        'the tuple provable: the copy carries the prepended items, the original is untouched, and the tests can see ' +
        'both at once. Spreading `items` matters too; passing the array itself would insert one nested element. ' +
        'Every ES2023 change-by-copy method returns a new array and leaves the receiver alone, which is exactly the ' +
        'guarantee `unshift`, `push`, `shift`, and `pop` do not give you.',
      id: 'prepend-keep-original',
      methods: ['toSpliced'],
      order: 6,
      solution: code(`
export function solve(values: number[], items: number[]): [number[], number[]] {
  return [values.toSpliced(0, 0, ...items), values];
}
`),
      starterCode: code(`
export function solve(values: number[], items: number[]): [number[], number[]] {
  // unshift() prepends in place and returns the new LENGTH — which copying method inserts at index 0?
  return [[], []];
}
`),
      tests: [
        tc(
          'prepends two items, original intact (trap)',
          [
            [3, 4],
            [1, 2],
          ],
          [
            [1, 2, 3, 4],
            [3, 4],
          ],
        ),
        tc(
          'single item (trap)',
          [[2, 3], [1]],
          [
            [1, 2, 3],
            [2, 3],
          ],
        ),
        tc(
          'nothing to prepend',
          [[1, 2], []],
          [
            [1, 2],
            [1, 2],
          ],
        ),
        tc('prepend onto an empty array (trap)', [[], [9]], [[9], []]),
        tc('items keep their order', [[10], [7, 8, 9]], [[7, 8, 9, 10], [10]]),
      ],
      title: 'Prepend, keep the original',
      trap: code(`
export function solve(values: number[], items: number[]): [number[], number[]] {
  const prepended = values;
  prepended.unshift(...items);
  return [prepended, values];
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Return a copy of `values` with the element at `index` replaced by `replacement`. Negative indices count ' +
        'from the end. When `index` is out of range in either direction, return `null` instead of a grown or ' +
        'unchanged array.\n\n' +
        'Signature: `solve(values: number[], index: number, replacement: number): number[] | null`\n\n' +
        'Trap: a bracket write on a spread copy never complains — `copy[-1] = x` and `copy[99] = x` both “succeed”.',
      difficulty: 'advanced',
      explanation:
        '`with` validates its index the way `at` reads one: negative values count back from the end, and anything ' +
        'outside `[-length, length)` throws a `RangeError` rather than doing something quietly. Catching that ' +
        '`RangeError` is the whole solution — the method performs the bounds check, and the `catch` turns the ' +
        'exception into `null`. The bracket write is the naive spelling and it never fails: `copy[-1] = x` creates ' +
        'a string-keyed property named `"-1"` that no index ever sees, so the last element is not replaced; ' +
        '`copy[10] = x` grows the array to eleven slots with holes in between. Neither outcome is an error to ' +
        'JavaScript, which is why the tests have to look for them by value. Reach for `with` when a bad index ' +
        'should be a bug you hear about, not a silent shape change.',
      id: 'with-bounds-check',
      methods: ['with'],
      order: 7,
      solution: code(`
export function solve(values: number[], index: number, replacement: number): number[] | null {
  try {
    return values.with(index, replacement);
  } catch (error) {
    if (error instanceof RangeError) {
      return null;
    }
    throw error;
  }
}
`),
      starterCode: code(`
export function solve(values: number[], index: number, replacement: number): number[] | null {
  // with() already knows which indices are legal — what does it do when one is not?
  return null;
}
`),
      tests: [
        tc('replaces in range', [[1, 2, 3], 1, 9], [1, 9, 3]),
        tc('negative index counts from the end (trap)', [[1, 2, 3], -1, 7], [1, 2, 7]),
        tc('index past the end is out of range (trap)', [[1, 2, 3], 3, 0], null),
        tc('index far past the end (trap)', [[1, 2], 10, 0], null),
        tc('negative index past the start is out of range', [[1, 2, 3], -4, 0], null),
        tc('index of exactly minus length hits the first element', [[1, 2, 3], -3, 5], [5, 2, 3]),
        tc('empty array has no valid index', [[], 0, 1], null),
      ],
      title: 'Let with() check the bounds',
      trap: code(`
export function solve(values: number[], index: number, replacement: number): number[] | null {
  const copy = [...values];
  copy[index] = replacement;
  return copy;
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Return a copy of `values` with the elements at indices `i` and `j` exchanged; the input is not modified. ' +
        'Swapping an index with itself returns an equal array.\n\n' +
        'Signature: `solve(values: number[], i: number, j: number): number[]`\n\n' +
        'Trap: after the first `with`, the array you are holding is no longer the one you read `values[i]` from.',
      difficulty: 'advanced',
      explanation:
        '`with` is chainable because every call returns a fresh array, so a swap is two edits back to back: ' +
        '`values.with(i, values[j]).with(j, values[i])`. The part that matters is where the two replacement values ' +
        'are *read from*. Both reads go to `values`, the untouched input, which still holds the original occupant ' +
        'of `i` after the first `with` has replaced it in the copy. The trap reads the second value from the ' +
        'intermediate array instead — `halfway[i]` — but by then slot `i` already holds `values[j]`, so the swap ' +
        'writes the same element into both positions: `[1, 2, 3]` swapped at `0` and `2` becomes `[3, 2, 3]`. This ' +
        'is the immutable version of the classic temp-variable bug, with the twist that the “temp” is the source ' +
        'array itself, which nothing ever overwrote. A same-index swap writes each slot back with its own value, ' +
        'so it needs no special case.',
      id: 'swap-two-slots',
      methods: ['with'],
      order: 8,
      solution: code(`
export function solve(values: number[], i: number, j: number): number[] {
  return values.with(i, values[j]).with(j, values[i]);
}
`),
      starterCode: code(`
export function solve(values: number[], i: number, j: number): number[] {
  // Two chained with() calls — but read both replacement values from the same untouched array.
  return [];
}
`),
      tests: [
        tc('swaps first and last (trap)', [[1, 2, 3], 0, 2], [3, 2, 1]),
        tc('swaps adjacent elements (trap)', [[1, 2, 3, 4], 1, 2], [1, 3, 2, 4]),
        tc('same index is a no-op', [[5, 6, 7], 1, 1], [5, 6, 7]),
        tc('order of the indices does not matter', [[1, 2, 3], 2, 0], [3, 2, 1]),
        tc('two-element swap', [[1, 2], 0, 1], [2, 1]),
      ],
      title: 'Swap two slots with chained with()',
      trap: code(`
export function solve(values: number[], i: number, j: number): number[] {
  const halfway = values.with(i, values[j]);
  return halfway.with(j, halfway[i]);
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Return a copy of `values` where the `deleteCount` elements starting at `start` are replaced by the ' +
        'elements of `items` — which may be shorter or longer than what they replace. The input is not modified.\n\n' +
        'Signature: `solve(values: number[], start: number, deleteCount: number, items: number[]): number[]`\n\n' +
        'Example: `solve([1, 2, 3, 4], 1, 2, [8, 9, 10])` → `[1, 8, 9, 10, 4]`. Trap: `toSpliced` takes the ' +
        'replacements as rest arguments — think about what happens when you hand it `items` directly.',
      difficulty: 'advanced',
      explanation:
        '`toSpliced(start, deleteCount, ...items)` is `splice` with the two things that make `splice` awkward ' +
        'removed: it returns the *edited array* instead of the deleted elements, and it leaves the receiver alone. ' +
        'The deleted range and the inserted items are independent, so the result can grow (`[1, 2, 3, 4]` with two ' +
        'replaced by three) or shrink (three replaced by one) freely — the method rebuilds the array around the ' +
        'edit. The replacements are rest parameters, and that is where the trap lives: passing `items` without ' +
        'spreading inserts the whole array as a single nested element, giving `[1, [8, 9, 10], 4]`, and an empty ' +
        '`items` inserts `[]` rather than nothing. `...items` unpacks them into the argument list. Reaching for ' +
        '`splice` here would return `[2, 3]` — the removed elements — and mutate `values` on top of it.',
      id: 'replace-a-range',
      methods: ['toSpliced'],
      order: 9,
      solution: code(`
export function solve(values: number[], start: number, deleteCount: number, items: number[]): number[] {
  return values.toSpliced(start, deleteCount, ...items);
}
`),
      starterCode: code(`
export function solve(values: number[], start: number, deleteCount: number, items: number[]): number[] {
  // One toSpliced call does it — mind how the replacement items are passed in.
  return [];
}
`),
      tests: [
        tc('replaces two with three (trap)', [[1, 2, 3, 4], 1, 2, [8, 9, 10]], [1, 8, 9, 10, 4]),
        tc('replaces three with one (trap)', [[1, 2, 3, 4, 5], 1, 3, [0]], [1, 0, 5]),
        tc('pure deletion when items is empty (trap)', [[1, 2, 3], 0, 2, []], [3]),
        tc('pure insertion when deleteCount is zero', [[1, 4], 1, 0, [2, 3]], [1, 2, 3, 4]),
        tc('replace at the end', [[1, 2, 3], 2, 1, [7, 8]], [1, 2, 7, 8]),
        tc('deleteCount past the end clamps', [[1, 2, 3], 1, 10, [9]], [1, 9]),
      ],
      title: 'Replace a range, any length',
      trap: code(`
export function solve(values: number[], start: number, deleteCount: number, items: number[]): number[] {
  return values.toSpliced(start, deleteCount, items);
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Return a tuple `[sorted, original]`: `sorted` is a new list where every player’s `scores` are in ascending ' +
        'order, and `original` is `players` itself — every one of its score lists must still be in its original ' +
        'order.\n\n' +
        'Signature: `solve(players: Player[]): [Player[], Player[]]` where `Player` is ' +
        '`{ name: string; scores: number[] }`.\n\n' +
        'Trap: `map` gives you a new outer array, but the `scores` arrays inside it are the caller’s.',
      difficulty: 'advanced',
      explanation:
        'The change-by-copy methods are shallow, and so is `map`: the new outer array holds the *same* player ' +
        'objects, whose `scores` arrays are the caller’s. Calling `sort` on those inside the callback reorders the ' +
        'caller’s data — `map` faithfully returns each mutated player, the tuple’s “original” is sorted too, and ' +
        'the test that compares both halves fails. `toSorted` on each `scores` allocates a sorted copy and leaves ' +
        'the source list alone, and spreading the player into a fresh object (`{ ...player, scores }`) means the ' +
        'sorted list is attached to a new player rather than written back into the old one. The rule generalises: ' +
        'copying the container you are iterating is not enough when the edit reaches into an element — every level ' +
        'you change needs its own copy, and every level you do not change can be shared. The comparator `a - b` ' +
        'keeps the sort numeric.',
      id: 'sort-nested-scores',
      methods: ['toSorted', 'map'],
      order: 10,
      solution: code(`
interface Player {
  name: string;
  scores: number[];
}

export function solve(players: Player[]): [Player[], Player[]] {
  const sorted = players.map((player) => ({ ...player, scores: player.scores.toSorted((a, b) => a - b) }));
  return [sorted, players];
}
`),
      starterCode: code(`
interface Player {
  name: string;
  scores: number[];
}

export function solve(players: Player[]): [Player[], Player[]] {
  // map() copies the outer array only — each player's scores need their own copy before sorting.
  return [[], []];
}
`),
      tests: [
        tc(
          'sorts each player, originals intact (trap)',
          [
            [
              { name: 'Ada', scores: [30, 10, 20] },
              { name: 'Bo', scores: [5, 1] },
            ],
          ],
          [
            [
              { name: 'Ada', scores: [10, 20, 30] },
              { name: 'Bo', scores: [1, 5] },
            ],
            [
              { name: 'Ada', scores: [30, 10, 20] },
              { name: 'Bo', scores: [5, 1] },
            ],
          ],
        ),
        tc(
          'already sorted scores are unchanged',
          [[{ name: 'Cy', scores: [1, 2, 3] }]],
          [[{ name: 'Cy', scores: [1, 2, 3] }], [{ name: 'Cy', scores: [1, 2, 3] }]],
        ),
        tc('empty roster', [[]], [[], []]),
        tc(
          'double-digit scores sort numerically (trap)',
          [[{ name: 'Di', scores: [10, 9, 100] }]],
          [[{ name: 'Di', scores: [9, 10, 100] }], [{ name: 'Di', scores: [10, 9, 100] }]],
        ),
        tc(
          'player with no scores',
          [[{ name: 'Ed', scores: [] }]],
          [[{ name: 'Ed', scores: [] }], [{ name: 'Ed', scores: [] }]],
        ),
        tc(
          'negative scores (trap)',
          [[{ name: 'Fi', scores: [0, -5, 3] }]],
          [[{ name: 'Fi', scores: [-5, 0, 3] }], [{ name: 'Fi', scores: [0, -5, 3] }]],
        ),
      ],
      title: 'Sort inside, copy outside',
      trap: code(`
interface Player {
  name: string;
  scores: number[];
}

export function solve(players: Player[]): [Player[], Player[]] {
  const sorted = players.map((player) => {
    player.scores.sort((a, b) => a - b);
    return player;
  });
  return [sorted, players];
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Return a copy of `values` where every index listed in `indices` has been set to `0`. Indices may repeat; ' +
        'the input is not modified.\n\n' +
        'Signature: `solve(values: number[], indices: number[]): number[]`\n\n' +
        'Trap: calling `with` in a loop and ignoring what it returns changes nothing.',
      difficulty: 'advanced',
      explanation:
        '`with` never touches its receiver: the replacement lives only in the array it *returns*. Written as a ' +
        '`forEach` that discards that return value, the loop allocates one copy per index, drops each on the ' +
        'floor, and hands back `values` untouched — nothing throws, the code reads like an update, and every test ' +
        'with a real index fails. Because each `with` produces the next array to edit, a sequence of edits is a ' +
        'fold: `indices.reduce((current, index) => current.with(index, 0), values)` seeds the accumulator with the ' +
        'input and threads the latest copy through, so each step edits the previous step’s result rather than the ' +
        'original. Repeated indices simply rewrite a slot that is already `0`, and negative indices count from the ' +
        'end as `with` always does. The habit this builds carries to every copying method: `toSorted`, ' +
        '`toReversed`, and `toSpliced` are all useless until you keep what they return.',
      id: 'zero-out-indices',
      methods: ['with', 'reduce'],
      order: 11,
      solution: code(`
export function solve(values: number[], indices: number[]): number[] {
  return indices.reduce((current, index) => current.with(index, 0), values);
}
`),
      starterCode: code(`
export function solve(values: number[], indices: number[]): number[] {
  // with() hands back a new array each time — thread it through the indices instead of dropping it.
  return values;
}
`),
      tests: [
        tc(
          'zeroes two positions (trap)',
          [
            [1, 2, 3, 4],
            [0, 2],
          ],
          [0, 2, 0, 4],
        ),
        tc(
          'repeated index zeroes once (trap)',
          [
            [5, 6],
            [1, 1],
          ],
          [5, 0],
        ),
        tc('no indices returns an equal array', [[1, 2], []], [1, 2]),
        tc('negative index counts from the end (trap)', [[1, 2, 3], [-1]], [1, 2, 0]),
        tc('already zero stays zero', [[0, 7], [0]], [0, 7]),
        tc(
          'every index',
          [
            [1, 2, 3],
            [0, 1, 2],
          ],
          [0, 0, 0],
        ),
      ],
      title: 'with() returns, it does not write',
      trap: code(`
export function solve(values: number[], indices: number[]): number[] {
  indices.forEach((index) => {
    values.with(index, 0);
  });
  return values;
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Apply a script of edits to `values`, in order, immutably: `set` replaces the element at `index` with ' +
        '`value`, `insert` places `value` at `index`, and `remove` deletes the element at `index`. Each op sees ' +
        'the result of the previous one; an empty script returns the input unchanged.\n\n' +
        'Signature: `solve(values: number[], ops: EditOp[]): number[]` where `EditOp` is ' +
        '`{ index: number; type: "set" | "insert"; value: number }` or `{ index: number; type: "remove" }`.',
      difficulty: 'expert',
      explanation:
        '`reduce` threads the evolving array through the script: the accumulator starts as the input and each ' +
        'op maps it to a new array — `with(op.index, op.value)` for a `set`, `toSpliced(op.index, 0, op.value)` ' +
        'for an `insert`, `toSpliced(op.index, 1)` for a `remove`. Because every step returns a fresh array, no ' +
        'intermediate state is ever mutated, yet each op naturally sees the indices of the world the previous op ' +
        'produced — which is why the sample script’s `remove` at index 2 deletes the `9` it just set at ' +
        'index 1 and then shifted by inserting at 0. The empty-script case costs nothing: with no ops the ' +
        'callback never runs and `reduce` hands back the initial value directly. This fold-over-operations shape ' +
        'is event sourcing in miniature: state as a pure function of an initial value plus a list of events.',
      id: 'apply-edit-script',
      methods: ['reduce', 'with', 'toSpliced'],
      order: 12,
      solution: code(`
type EditOp =
  | { index: number; type: 'insert'; value: number }
  | { index: number; type: 'remove' }
  | { index: number; type: 'set'; value: number };

export function solve(values: number[], ops: EditOp[]): number[] {
  return ops.reduce((current, op) => {
    if (op.type === 'set') {
      return current.with(op.index, op.value);
    }
    if (op.type === 'insert') {
      return current.toSpliced(op.index, 0, op.value);
    }
    return current.toSpliced(op.index, 1);
  }, values);
}
`),
      starterCode: code(`
type EditOp =
  | { index: number; type: 'insert'; value: number }
  | { index: number; type: 'remove' }
  | { index: number; type: 'set'; value: number };

export function solve(values: number[], ops: EditOp[]): number[] {
  // Fold the ops over values: with() handles set, toSpliced() handles insert and remove.
  return [];
}
`),
      tests: [
        tc(
          'applies set, insert, and remove in order',
          [
            [1, 2, 3],
            [
              { index: 1, type: 'set', value: 9 },
              { index: 0, type: 'insert', value: 5 },
              { index: 2, type: 'remove' },
            ],
          ],
          [5, 1, 3],
        ),
        tc('empty script returns the input unchanged', [[4, 5, 6], []], [4, 5, 6]),
        tc('set only', [[1, 2], [{ index: 0, type: 'set', value: 7 }]], [7, 2]),
        tc(
          'inserts build on each other',
          [
            [],
            [
              { index: 0, type: 'insert', value: 1 },
              { index: 0, type: 'insert', value: 2 },
              { index: 2, type: 'insert', value: 3 },
            ],
          ],
          [2, 1, 3],
        ),
        tc(
          'remove shifts the indices later ops see',
          [
            [1, 2, 3, 4],
            [
              { index: 0, type: 'remove' },
              { index: 2, type: 'set', value: 0 },
            ],
          ],
          [2, 3, 0],
        ),
      ],
      title: 'Apply an edit script',
    },
    {
      categoryId: 'immutable-updates',
      description:
        '`entries` are already sorted by `score` ascending. Return a new array with `entry` inserted in the right ' +
        'place — after every existing entry with the same score — without re-sorting and without modifying ' +
        '`entries`.\n\n' +
        'Signature: `solve(entries: Entry[], entry: Entry): Entry[]` where `Entry` is `{ name: string; score: number }`.\n\n' +
        'Trap: “the first entry whose score is not lower” is the wrong slot when scores tie.',
      difficulty: 'expert',
      explanation:
        'A sorted list stays sorted if you insert at the right slot, and finding that slot is one linear scan: ' +
        '`findIndex` returns the first entry whose score is strictly greater than the new one, and ' +
        '`toSpliced(position, 0, entry)` inserts there without touching the input. When no entry is greater, ' +
        '`findIndex` yields `-1`, which the fallback turns into `entries.length` so the newcomer is appended. The ' +
        'comparison must be strict. With `>=`, the scan stops at the first *equal* score and the newcomer jumps ' +
        'ahead of entries that were there first — a stability bug: `[Ada 10, Bo 20, Cy 30]` plus `Di 20` reads ' +
        '`Bo, Di` with `>` but `Di, Bo` with `>=`. Appending and calling `toSorted` also passes, at O(n log n) for ' +
        'a job that needs O(n), and it only keeps the ties right because `toSorted` is stable; the scan makes the ' +
        'ordering explicit.',
      id: 'insert-sorted',
      methods: ['findIndex', 'toSpliced'],
      order: 13,
      solution: code(`
interface Entry {
  name: string;
  score: number;
}

export function solve(entries: Entry[], entry: Entry): Entry[] {
  const position = entries.findIndex((existing) => existing.score > entry.score);
  return entries.toSpliced(position === -1 ? entries.length : position, 0, entry);
}
`),
      starterCode: code(`
interface Entry {
  name: string;
  score: number;
}

export function solve(entries: Entry[], entry: Entry): Entry[] {
  // findIndex the first entry that must come AFTER the newcomer, then toSpliced it in — mind the ties.
  return [];
}
`),
      tests: [
        tc(
          'lands after an equal score (trap)',
          [
            [
              { name: 'Ada', score: 10 },
              { name: 'Bo', score: 20 },
              { name: 'Cy', score: 30 },
            ],
            { name: 'Di', score: 20 },
          ],
          [
            { name: 'Ada', score: 10 },
            { name: 'Bo', score: 20 },
            { name: 'Di', score: 20 },
            { name: 'Cy', score: 30 },
          ],
        ),
        tc(
          'inserts in the middle',
          [
            [
              { name: 'Ada', score: 10 },
              { name: 'Cy', score: 30 },
            ],
            { name: 'Bo', score: 20 },
          ],
          [
            { name: 'Ada', score: 10 },
            { name: 'Bo', score: 20 },
            { name: 'Cy', score: 30 },
          ],
        ),
        tc(
          'lowest score goes first',
          [[{ name: 'Bo', score: 20 }], { name: 'Ada', score: 5 }],
          [
            { name: 'Ada', score: 5 },
            { name: 'Bo', score: 20 },
          ],
        ),
        tc(
          'highest score goes last',
          [
            [
              { name: 'Ada', score: 10 },
              { name: 'Bo', score: 20 },
            ],
            { name: 'Cy', score: 99 },
          ],
          [
            { name: 'Ada', score: 10 },
            { name: 'Bo', score: 20 },
            { name: 'Cy', score: 99 },
          ],
        ),
        tc(
          'after several equal scores (trap)',
          [
            [
              { name: 'Ada', score: 7 },
              { name: 'Bo', score: 7 },
              { name: 'Cy', score: 7 },
            ],
            { name: 'Di', score: 7 },
          ],
          [
            { name: 'Ada', score: 7 },
            { name: 'Bo', score: 7 },
            { name: 'Cy', score: 7 },
            { name: 'Di', score: 7 },
          ],
        ),
        tc('empty list', [[], { name: 'Ada', score: 1 }], [{ name: 'Ada', score: 1 }]),
      ],
      title: 'Insert without re-sorting',
      trap: code(`
interface Entry {
  name: string;
  score: number;
}

export function solve(entries: Entry[], entry: Entry): Entry[] {
  const position = entries.findIndex((existing) => existing.score >= entry.score);
  return entries.toSpliced(position === -1 ? entries.length : position, 0, entry);
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Insert several `inserts` into `values` at once. Each `index` refers to a position in the *original* ' +
        'array, so later inserts must not be shifted by earlier ones, and inserts sharing an index appear in the ' +
        'order listed. An index equal to `values.length` appends.\n\n' +
        'Signature: `solve(values: number[], inserts: { index: number; value: number }[]): number[]`\n\n' +
        'Example: `solve([1, 2, 3, 4], [{ index: 1, value: 10 }, { index: 3, value: 30 }])` → ' +
        '`[1, 10, 2, 3, 30, 4]`.',
      difficulty: 'expert',
      explanation:
        'Each `toSpliced` insertion shifts everything after it one slot to the right, so inserts expressed ' +
        'against the *original* indices cannot be applied in listing order — after the insert at `1`, the element ' +
        'that used to be at `3` is at `4`, and the second insert lands one slot early. Applying them from the ' +
        'highest index down avoids the problem: an insert only moves elements *after* it, and every remaining ' +
        'insert targets a lower index. `toSorted((a, b) => b.index - a.index)` provides that order without ' +
        'touching the input list. Ties need care: a stable descending sort keeps two inserts at the same index ' +
        'in listing order, but inserting the first at `i` and then the second at `i` puts the second *before* ' +
        'the first — so the list is `toReversed` before sorting, which cancels that reversal. `reduce` then ' +
        'threads the growing array through the `toSpliced` calls.',
      id: 'batch-insert',
      methods: ['toReversed', 'toSorted', 'reduce', 'toSpliced'],
      order: 14,
      solution: code(`
interface Insert {
  index: number;
  value: number;
}

export function solve(values: number[], inserts: Insert[]): number[] {
  return inserts
    .toReversed()
    .toSorted((a, b) => b.index - a.index)
    .reduce((current, { index, value }) => current.toSpliced(index, 0, value), values);
}
`),
      starterCode: code(`
interface Insert {
  index: number;
  value: number;
}

export function solve(values: number[], inserts: Insert[]): number[] {
  // Apply the inserts highest index first so nothing shifts — and think about what a stable sort does to ties.
  return [];
}
`),
      tests: [
        tc(
          'later inserts keep their original indices (trap)',
          [
            [1, 2, 3, 4],
            [
              { index: 1, value: 10 },
              { index: 3, value: 30 },
            ],
          ],
          [1, 10, 2, 3, 30, 4],
        ),
        tc(
          'inserts sharing an index keep listing order (trap)',
          [
            [5],
            [
              { index: 0, value: 1 },
              { index: 0, value: 2 },
            ],
          ],
          [1, 2, 5],
        ),
        tc(
          'inserts listed out of order',
          [
            [1, 2, 3],
            [
              { index: 2, value: 20 },
              { index: 0, value: 0 },
            ],
          ],
          [0, 1, 2, 20, 3],
        ),
        tc('index equal to length appends', [[1, 2], [{ index: 2, value: 3 }]], [1, 2, 3]),
        tc('no inserts', [[1, 2], []], [1, 2]),
        tc(
          'prepend and append together (trap)',
          [
            [1],
            [
              { index: 0, value: 0 },
              { index: 1, value: 2 },
            ],
          ],
          [0, 1, 2],
        ),
      ],
      title: 'Batch insert at original indices',
      trap: code(`
interface Insert {
  index: number;
  value: number;
}

export function solve(values: number[], inserts: Insert[]): number[] {
  return inserts.reduce((current, { index, value }) => current.toSpliced(index, 0, value), values);
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Return a copy of `values` with every index in `indices` removed. `indices` refer to the original array, ' +
        'may be listed in any order, and may repeat. The input is not modified.\n\n' +
        'Signature: `solve(values: number[], indices: number[]): number[]`\n\n' +
        'Example: `solve([10, 20, 30, 40], [0, 2])` → `[20, 40]`. Trap: each removal shifts every later index by one.',
      difficulty: 'expert',
      explanation:
        'Deleting index `1` moves the element at `2` down to `1`, so a following `toSpliced(2, 1)` removes what ' +
        'used to be at `3`. Applying removals in listing order therefore deletes the wrong elements whenever a ' +
        'later index sits above an earlier one, and a repeated index deletes twice. Walking the array from the ' +
        'right fixes both without sorting anything: `reduceRight` visits indices from `length - 1` down to `0`, ' +
        'and removing at the current index only shifts elements *to its right* — all of which have already been ' +
        'visited. Each slot is visited exactly once, so a `Set` built from `indices` answers “remove this one?” ' +
        'in constant time and collapses duplicates for free, and out-of-range indices are simply never reached. ' +
        'The accumulator is seeded with `values` and each `toSpliced` returns a fresh array, so the input ' +
        'survives. `filter` with `includes` also works but rescans `indices` for every element.',
      id: 'remove-indices',
      methods: ['reduceRight', 'toSpliced'],
      order: 15,
      solution: code(`
export function solve(values: number[], indices: number[]): number[] {
  const doomed = new Set(indices);
  return values.reduceRight(
    (current, _value, index) => (doomed.has(index) ? current.toSpliced(index, 1) : current),
    values,
  );
}
`),
      starterCode: code(`
export function solve(values: number[], indices: number[]): number[] {
  // Remove from the right end first — which fold direction gives you the indices in that order?
  return [];
}
`),
      tests: [
        tc(
          'two removals, original indexing (trap)',
          [
            [10, 20, 30, 40],
            [0, 2],
          ],
          [20, 40],
        ),
        tc(
          'indices listed in any order',
          [
            [1, 2, 3, 4],
            [3, 0],
          ],
          [2, 3],
        ),
        tc(
          'repeated index removes once (trap)',
          [
            [1, 2, 3],
            [1, 1],
          ],
          [1, 3],
        ),
        tc(
          'adjacent indices (trap)',
          [
            [1, 2, 3, 4],
            [1, 2],
          ],
          [1, 4],
        ),
        tc('no indices leaves an equal array', [[1, 2], []], [1, 2]),
        tc(
          'every index empties the array (trap)',
          [
            [1, 2, 3],
            [0, 1, 2],
          ],
          [],
        ),
        tc('out-of-range index is ignored', [[1, 2], [5]], [1, 2]),
      ],
      title: 'Remove several indices at once',
      trap: code(`
export function solve(values: number[], indices: number[]): number[] {
  return indices.reduce((current, index) => current.toSpliced(index, 1), values);
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Replay `actions` against `initial` and return the final array. `set` replaces the element at `index` ' +
        'with `value`; `undo` restores the array as it was before the most recent `set` still in effect; `redo` ' +
        're-applies the most recently undone `set`. A new `set` after an `undo` discards the redo history. An ' +
        '`undo` or `redo` with nothing to do is ignored.\n\n' +
        "Signature: `solve(initial: number[], actions: { index?: number; type: 'redo' | 'set' | 'undo'; value?: number }[]): number[]`\n\n" +
        'Trap: history is only worth keeping if the arrays in it were never edited in place.',
      difficulty: 'expert',
      explanation:
        'Undo needs the array *as it was*, so the history must hold snapshots that later edits cannot reach. ' +
        '`with` guarantees that: each `set` produces a new `present`, and the one pushed onto `past` is never ' +
        'written to again. The imperative version keeps the same stacks but edits `present[index]` in place — ' +
        '`past` then holds a reference to the very array that just changed, and the first `undo` “restores” the ' +
        'current state. Nothing throws; only a value comparison catches it. `reduce` carries ' +
        '`{ future, past, present }` through the actions, building each new state from the old one: `set` ' +
        'appends the old present to `past` with a spread and empties `future`; `undo` reads the last snapshot ' +
        'with `at(-1)`, drops it with `slice(0, -1)`, and parks the present in `future`; `redo` does the mirror ' +
        'image. Every step returns fresh objects, so any snapshot can be handed back at any time.',
      id: 'undo-redo-snapshots',
      methods: ['reduce', 'with', 'at', 'slice'],
      order: 16,
      solution: code(`
interface Action {
  index?: number;
  type: 'redo' | 'set' | 'undo';
  value?: number;
}

interface History {
  future: number[][];
  past: number[][];
  present: number[];
}

export function solve(initial: number[], actions: Action[]): number[] {
  return actions.reduce<History>(
    (history, { index = 0, type, value = 0 }) => {
      const { future, past, present } = history;
      if (type === 'set') {
        return { future: [], past: [...past, present], present: present.with(index, value) };
      }
      if (type === 'undo') {
        const previous = past.at(-1);
        return previous === undefined
          ? history
          : { future: [...future, present], past: past.slice(0, -1), present: previous };
      }
      const next = future.at(-1);
      return next === undefined
        ? history
        : { future: future.slice(0, -1), past: [...past, present], present: next };
    },
    { future: [], past: [], present: initial },
  ).present;
}
`),
      starterCode: code(`
interface Action {
  index?: number;
  type: 'redo' | 'set' | 'undo';
  value?: number;
}

export function solve(initial: number[], actions: Action[]): number[] {
  // Fold { past, present, future } over the actions — every snapshot must be an array nobody edits afterwards.
  return initial;
}
`),
      tests: [
        tc(
          'undo restores the previous snapshot (trap)',
          [
            [1, 2, 3],
            [{ index: 0, type: 'set', value: 9 }, { type: 'undo' }],
          ],
          [1, 2, 3],
        ),
        tc(
          'redo re-applies the undone set',
          [
            [1, 2, 3],
            [{ index: 0, type: 'set', value: 9 }, { type: 'undo' }, { type: 'redo' }],
          ],
          [9, 2, 3],
        ),
        tc(
          'two sets, two undos (trap)',
          [
            [0, 0],
            [
              { index: 0, type: 'set', value: 1 },
              { index: 1, type: 'set', value: 2 },
              { type: 'undo' },
              { type: 'undo' },
            ],
          ],
          [0, 0],
        ),
        tc(
          'a new set clears the redo history',
          [
            [1],
            [
              { index: 0, type: 'set', value: 2 },
              { type: 'undo' },
              { index: 0, type: 'set', value: 3 },
              { type: 'redo' },
            ],
          ],
          [3],
        ),
        tc(
          'undo with no history is ignored',
          [
            [4, 5],
            [{ type: 'undo' }, { index: 1, type: 'set', value: 6 }],
          ],
          [4, 6],
        ),
        tc('redo with nothing undone is ignored', [[4], [{ index: 0, type: 'set', value: 1 }, { type: 'redo' }]], [1]),
        tc(
          'undo then a fresh set (trap)',
          [
            [1, 2],
            [
              { index: 0, type: 'set', value: 5 },
              { index: 1, type: 'set', value: 6 },
              { type: 'undo' },
              { index: 0, type: 'set', value: 7 },
            ],
          ],
          [7, 2],
        ),
        tc('no actions returns the initial array', [[8, 9], []], [8, 9]),
      ],
      title: 'Undo and redo over snapshots',
      trap: code(`
interface Action {
  index?: number;
  type: 'redo' | 'set' | 'undo';
  value?: number;
}

export function solve(initial: number[], actions: Action[]): number[] {
  const past: number[][] = [];
  const future: number[][] = [];
  let present = initial;
  for (const { index = 0, type, value = 0 } of actions) {
    if (type === 'set') {
      past.push(present);
      present[index] = value;
      future.length = 0;
    } else if (type === 'undo') {
      const previous = past.pop();
      if (previous !== undefined) {
        future.push(present);
        present = previous;
      }
    } else {
      const next = future.pop();
      if (next !== undefined) {
        past.push(present);
        present = next;
      }
    }
  }
  return present;
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Apply queue-and-stack `ops` to `start` and return the state after *each* op, oldest first: `push` and ' +
        '`unshift` add `value` at the back or front, `pop` and `shift` remove from the back or front (no-ops on ' +
        'an empty array).\n\n' +
        "Signature: `solve(start: number[], ops: { type: 'pop' | 'push' | 'shift' | 'unshift'; value?: number }[]): number[][]`\n\n" +
        'Example: `solve([1], [{ type: "push", value: 2 }, { type: "shift" }])` → `[[1, 2], [2]]`.',
      difficulty: 'expert',
      explanation:
        '`push`, `pop`, `shift`, and `unshift` are four spellings of one operation — edit the array at an end — ' +
        'and `toSpliced` covers all four without mutating: `toSpliced(length, 0, v)` pushes, `toSpliced(0, 0, v)` ' +
        'unshifts, `toSpliced(-1, 1)` pops, `toSpliced(0, 1)` shifts. On an empty array the two removals delete ' +
        'nothing, which gives the no-op behaviour for free. Because each call returns a new array, the state after ' +
        'every op is a distinct value that can be kept, and `reduce` collects them: the accumulator is the ' +
        'history, `at(-1)` reads the latest state (falling back to `start` before any op), and the next state is ' +
        'appended. The mutating version records “every state” by pushing the same array into the history after ' +
        'each edit, so the result is one final state repeated — `map` returning `state` four times returns four ' +
        'references to one array. History is only history when the entries stop changing.',
      id: 'mutator-history',
      methods: ['reduce', 'toSpliced', 'at'],
      order: 17,
      solution: code(`
interface Op {
  type: 'pop' | 'push' | 'shift' | 'unshift';
  value?: number;
}

function apply(state: number[], { type, value = 0 }: Op): number[] {
  switch (type) {
    case 'push':
      return state.toSpliced(state.length, 0, value);
    case 'unshift':
      return state.toSpliced(0, 0, value);
    case 'pop':
      return state.toSpliced(-1, 1);
    case 'shift':
      return state.toSpliced(0, 1);
  }
}

export function solve(start: number[], ops: Op[]): number[][] {
  return ops.reduce<number[][]>((history, op) => [...history, apply(history.at(-1) ?? start, op)], []);
}
`),
      starterCode: code(`
interface Op {
  type: 'pop' | 'push' | 'shift' | 'unshift';
  value?: number;
}

export function solve(start: number[], ops: Op[]): number[][] {
  // All four mutators are one toSpliced call each — collect every returned state, not one array four times.
  return [];
}
`),
      tests: [
        tc(
          'push then shift records both states (trap)',
          [[1], [{ type: 'push', value: 2 }, { type: 'shift' }]],
          [[1, 2], [2]],
        ),
        tc('unshift then pop (trap)', [[5], [{ type: 'unshift', value: 4 }, { type: 'pop' }]], [[4, 5], [4]]),
        tc('single op', [[1, 2], [{ type: 'pop' }]], [[1]]),
        tc(
          'pop and shift on empty are no-ops (trap)',
          [[], [{ type: 'pop' }, { type: 'shift' }, { type: 'push', value: 1 }]],
          [[], [], [1]],
        ),
        tc('no ops yields no states', [[1], []], []),
        tc(
          'queue: push twice, shift twice (trap)',
          [[], [{ type: 'push', value: 1 }, { type: 'push', value: 2 }, { type: 'shift' }, { type: 'shift' }]],
          [[1], [1, 2], [2], []],
        ),
      ],
      title: 'Every state a mutator would have destroyed',
      trap: code(`
interface Op {
  type: 'pop' | 'push' | 'shift' | 'unshift';
  value?: number;
}

export function solve(start: number[], ops: Op[]): number[][] {
  const state = start;
  return ops.map(({ type, value = 0 }) => {
    if (type === 'push') {
      state.push(value);
    } else if (type === 'unshift') {
      state.unshift(value);
    } else if (type === 'pop') {
      state.pop();
    } else {
      state.shift();
    }
    return state;
  });
}
`),
    },
    {
      categoryId: 'immutable-updates',
      description:
        'Set the leaf at `path` inside the nested array `tree` to `value` and return a tuple `[updated, original]` — ' +
        'the updated tree first, then `tree` itself, which must be unchanged at every level. Each element of ' +
        '`path` is an index into the next level down; an empty path leaves the tree as it is.\n\n' +
        'Signature: `solve(tree: Nested, path: number[], value: number): [Nested, Nested]` where `Nested` is ' +
        '`(Nested | number)[]`.\n\n' +
        'Trap: `[...tree]` copies one level. Everything below it is still shared with the caller.',
      difficulty: 'expert',
      explanation:
        'Spreading `tree` copies one level: the new outer array still points at the same inner arrays, so walking ' +
        'down a path and assigning at the end writes into a node the original shares — the “copy” looks right ' +
        'and the original is corrupted along with it. An immutable nested update has to copy every array *on* ' +
        'the path and may share every array off it. Recursion expresses that directly: `setAt` splits the path ' +
        'into `head` and `rest`, recurses into `node[head]` while there is path left, and returns ' +
        '`node.with(head, replacement)` at each level — `with` builds a new array for exactly the ancestors of ' +
        'the changed leaf, while siblings come through by reference. An empty path returns the node as is, and ' +
        '`Array.isArray` stops the descent if the path runs into a number early. The tuple makes the sharing ' +
        'visible: the copy has the new leaf, the original never noticed.',
      id: 'deep-set-path',
      methods: ['with', 'Array.isArray'],
      order: 18,
      solution: code(`
type Nested = (Nested | number)[];

function setAt(node: Nested, path: number[], value: number): Nested {
  const [head, ...rest] = path;
  if (head === undefined) {
    return node;
  }
  const child = node[head];
  if (rest.length === 0 || !Array.isArray(child)) {
    return node.with(head, value);
  }
  return node.with(head, setAt(child, rest, value));
}

export function solve(tree: Nested, path: number[], value: number): [Nested, Nested] {
  return [setAt(tree, path, value), tree];
}
`),
      starterCode: code(`
type Nested = (Nested | number)[];

export function solve(tree: Nested, path: number[], value: number): [Nested, Nested] {
  // Every array along the path needs its own with() — recurse down, rebuild on the way up.
  return [[], []];
}
`),
      tests: [
        tc(
          'sets a leaf two levels deep, original intact (trap)',
          [[1, [2, 3]], [1, 0], 9],
          [
            [1, [9, 3]],
            [1, [2, 3]],
          ],
        ),
        tc(
          'top-level path only needs one copy',
          [[1, 2, 3], [2], 0],
          [
            [1, 2, 0],
            [1, 2, 3],
          ],
        ),
        tc('three levels deep (trap)', [[[[1]]], [0, 0, 0], 7], [[[[7]]], [[[1]]]]),
        tc(
          'untouched siblings keep their values (trap)',
          [
            [
              [1, 2],
              [3, 4],
            ],
            [1, 1],
            0,
          ],
          [
            [
              [1, 2],
              [3, 0],
            ],
            [
              [1, 2],
              [3, 4],
            ],
          ],
        ),
        tc(
          'empty path returns the tree unchanged',
          [[1, 2], [], 5],
          [
            [1, 2],
            [1, 2],
          ],
        ),
        tc(
          'sets a leaf in the second branch (trap)',
          [[[1], [2, [3]]], [1, 1, 0], 8],
          [
            [[1], [2, [8]]],
            [[1], [2, [3]]],
          ],
        ),
      ],
      title: 'Set a nested leaf, share the rest',
      trap: code(`
type Nested = (Nested | number)[];

export function solve(tree: Nested, path: number[], value: number): [Nested, Nested] {
  const copy = [...tree];
  const parent = path.slice(0, -1).reduce<Nested>((node, index) => node[index] as Nested, copy);
  parent[path[path.length - 1]] = value;
  return [copy, tree];
}
`),
    },
  ],
};
