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
      order: 6,
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
  ],
};
