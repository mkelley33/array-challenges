import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const mutatingInPlace: CategoryModule = {
  category: {
    description:
      'Change an array where it stands — push, pop, shift, unshift, splice, fill, copyWithin, reverse, sort, and ' +
      'length assignment edit the receiver and hand back something other than the array you might expect.',
    id: 'mutating-in-place',
    order: 12,
    title: 'Mutating in Place',
  },
  challenges: [
    {
      categoryId: 'mutating-in-place',
      description:
        'Push `item` onto the end of `stack` and return a tuple `[whatPushReturned, stack]` — the value `push` ' +
        'itself hands back, then the same array. Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(stack: number[], item: number): [number, number[]]`',
      difficulty: 'novice',
      explanation:
        '`push` appends to the receiver and returns the new *length*, not the array and not the pushed item. That ' +
        'is why `const result = stack.push(item)` leaves `result` holding a number, and why chaining ' +
        '`stack.push(1).push(2)` throws — the first call returned `1`, and numbers have no `push`. The tuple in ' +
        'this challenge makes both halves visible: the first slot is the length `push` reported, the second is the ' +
        'mutated array, which now ends with `item`. Because `push` edits in place, the array you return is the ' +
        'very object the caller passed in; there is no copy to assemble and nothing to spread. Pushing `0` or a ' +
        'negative number is no different — the return value counts elements, it never inspects them.',
      id: 'push-hands-back-the-length',
      methods: ['push'],
      order: 1,
      solution: code(`
export function solve(stack: number[], item: number): [number, number[]] {
  const length = stack.push(item);
  return [length, stack];
}
`),
      starterCode: code(`
export function solve(stack: number[], item: number): [number, number[]] {
  // push() mutates stack and returns something — but what, exactly?
  return [0, stack];
}
`),
      tests: [
        tc('pushes onto three elements', [[1, 2, 3], 9], [4, [1, 2, 3, 9]]),
        tc('pushes onto an empty stack', [[], 5], [1, [5]]),
        tc('pushing a zero still counts', [[1, 2], 0], [3, [1, 2, 0]]),
        tc('pushes a negative number', [[-1], -2], [2, [-1, -2]]),
      ],
      title: 'Push hands back the length',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Call `shift` on `queue` exactly `n` times, recording what each call returned — so `undefined` appears ' +
        'in the record once the queue runs dry — and return `[taken, queue]`. Mutate the received array; do ' +
        'not copy it.\n\n' +
        'Signature: `solve(queue: number[], n: number): [(number | undefined)[], number[]]`',
      difficulty: 'novice',
      explanation:
        '`shift` removes the first element in place and returns it; every remaining element slides down one ' +
        'index. On an empty array it removes nothing and returns `undefined` — it never throws — which is why ' +
        'the record for an over-long drain ends in `undefined` slots while the queue itself simply stays empty. ' +
        '`Array.from({ length: n }, () => queue.shift())` runs the mutator exactly `n` times and collects each ' +
        'return value in order, so the taken list reads front to back. Because `shift` re-indexes the whole ' +
        'array on every call it is O(n) per removal; for a queue that drains thousands of items a read ' +
        'pointer or `copyWithin` is cheaper, but for a handful of dequeues `shift` is the clearest spelling.',
      id: 'shift-until-dry',
      methods: ['shift'],
      order: 2,
      solution: code(`
export function solve(queue: number[], n: number): [(number | undefined)[], number[]] {
  const taken = Array.from({ length: n }, () => queue.shift());
  return [taken, queue];
}
`),
      starterCode: code(`
export function solve(queue: number[], n: number): [(number | undefined)[], number[]] {
  // shift() removes from the FRONT and returns the element — or undefined when nothing is left.
  return [[], queue];
}
`),
      tests: [
        tc('shifts two of three', [[1, 2, 3], 2], [[1, 2], [3]]),
        tc('shifting past the end records undefined', [[1, 2], 4], [[1, 2, undefined, undefined], []]),
        tc('shifting zero times leaves the queue alone', [[1, 2], 0], [[], [1, 2]]),
        tc('shifts exactly everything', [[4, 5], 2], [[4, 5], []]),
        tc('an empty queue yields only undefined', [[], 1], [[undefined], []]),
      ],
      title: 'Shift until dry',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Overwrite the index range `[start, end)` of `values` with `value` in place and return `values`. ' +
        'Negative bounds count back from the end, `end` is exclusive and clamps to the length, and ' +
        '`start >= end` changes nothing. Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[], value: number, start: number, end: number): number[]`',
      difficulty: 'intermediate',
      explanation:
        '`fill(value, start, end)` writes `value` into every index from `start` up to but not including `end` ' +
        'and returns the receiver, so the whole task is one call: `values.fill(value, start, end)`. The index ' +
        'rules match `slice`: a negative bound is added to the length (`-3` on five elements means index `2`), ' +
        'an `end` beyond the length is clamped, and a `start` that resolves at or after `end` produces an empty ' +
        'range, so nothing is written. Because the method mutates and also returns the same array, it can be ' +
        'returned directly — there is no second array to keep in sync. Reach for `fill` whenever you need to ' +
        'reset a window of an existing buffer; the range arguments save you from a hand-written index loop and ' +
        'its off-by-one errors.',
      id: 'fill-range-negative-bounds',
      methods: ['fill'],
      order: 3,
      solution: code(`
export function solve(values: number[], value: number, start: number, end: number): number[] {
  return values.fill(value, start, end);
}
`),
      starterCode: code(`
export function solve(values: number[], value: number, start: number, end: number): number[] {
  // One method overwrites a range in place — its bounds follow slice's rules.
  return values;
}
`),
      tests: [
        tc('fills the middle', [[1, 2, 3, 4, 5], 0, 1, 3], [1, 0, 0, 4, 5]),
        tc('negative bounds count from the end', [[1, 2, 3, 4, 5], 9, -3, -1], [1, 2, 9, 9, 5]),
        tc('end clamps to the length', [[1, 2, 3], 7, 1, 10], [1, 7, 7]),
        tc('start at or after end is a no-op', [[1, 2, 3], 7, 2, 1], [1, 2, 3]),
        tc('negative start before the front clamps to zero', [[1, 2, 3], 0, -10, 2], [0, 0, 3]),
      ],
      title: 'Fill a range, negative bounds included',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Insert every element of `items`, in order, into `values` at `index` (negative counts back from the end) ' +
        'using a single `splice` call that removes nothing, and return `[removed, values]` — `removed` is the ' +
        'array `splice` handed back, which is always empty here. Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[], index: number, items: number[]): [number[], number[]]`',
      difficulty: 'intermediate',
      explanation:
        '`splice(start, deleteCount, ...items)` is three edits in one method: remove `deleteCount` elements at ' +
        '`start`, insert `items` in their place, and return the removed elements as a new array. With ' +
        '`deleteCount` set to `0` it becomes pure insertion — `values.splice(index, 0, ...items)` slides the ' +
        'existing elements right and drops the items into the gap — and the returned array is empty because ' +
        'nothing was removed. The spread matters: `splice(index, 0, items)` would insert the array itself as a ' +
        'single nested element. A negative `index` is added to the length, so `-1` inserts *before* the last ' +
        'element, not after it; to append, pass the length. The tuple shows both effects at once: the empty ' +
        'return value and the receiver that grew in place.',
      id: 'splice-in-without-removing',
      methods: ['splice'],
      order: 4,
      solution: code(`
export function solve(values: number[], index: number, items: number[]): [number[], number[]] {
  const removed = values.splice(index, 0, ...items);
  return [removed, values];
}
`),
      starterCode: code(`
export function solve(values: number[], index: number, items: number[]): [number[], number[]] {
  // splice() can insert without deleting — which argument makes it do that?
  return [[], values];
}
`),
      tests: [
        tc('inserts into the middle', [[1, 4], 1, [2, 3]], [[], [1, 2, 3, 4]]),
        tc('negative index inserts before the last element', [[1, 2, 3], -1, [9]], [[], [1, 2, 9, 3]]),
        tc('index equal to the length appends', [[1, 2], 2, [3]], [[], [1, 2, 3]]),
        tc('inserts at the front', [[2], 0, [1]], [[], [1, 2]]),
        tc('empty items change nothing', [[1, 2], 1, []], [[], [1, 2]]),
        tc('inserts into an empty array', [[], 0, [5, 6]], [[], [5, 6]]),
      ],
      title: 'Splice in without removing',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Append every element of `batch` to the end of `log` with a single `push` call and return ' +
        '`[newLength, log]` — the length `push` reported, then the same array. Mutate the received array; do ' +
        'not copy it.\n\n' +
        'Signature: `solve(log: number[], batch: number[]): [number, number[]]`\n\n' +
        'Trap: `push` takes elements, not an array of elements — hand it the batch itself and it nests.',
      difficulty: 'advanced',
      explanation:
        '`push` is variadic: `log.push(4, 5)` appends two elements and returns the new length. Spreading turns a ' +
        'batch into that argument list — `log.push(...batch)` — so every element lands flat at the end of the ' +
        'receiver. The trap, `log.push(batch)`, hands the method a single argument that happens to be an array, ' +
        'and `push` does exactly what it was asked: it appends one element, the array, and reports a length that ' +
        'grew by one. TypeScript flags the nested version when `log` is typed `number[]`, but on `unknown[]` or ' +
        'in plain JavaScript it slips through silently and only shows up later as `log[3]` being `[4, 5]`. ' +
        'One caveat with spreading: an enormous batch can exceed the engine’s argument limit, so for hundreds ' +
        'of thousands of items, loop or `concat` instead.',
      id: 'push-a-batch-flat',
      methods: ['push'],
      order: 5,
      solution: code(`
export function solve(log: number[], batch: number[]): [number, number[]] {
  const length = log.push(...batch);
  return [length, log];
}
`),
      starterCode: code(`
export function solve(log: number[], batch: number[]): [number, number[]] {
  // push() takes one argument PER element — how do you turn an array into an argument list?
  return [0, log];
}
`),
      tests: [
        tc(
          'appends a batch of two flat (trap)',
          [
            [1, 2, 3],
            [4, 5],
          ],
          [5, [1, 2, 3, 4, 5]],
        ),
        tc('appends a single-element batch', [[1], [2]], [2, [1, 2]]),
        tc('an empty batch changes nothing', [[1, 2], []], [2, [1, 2]]),
        tc('appends onto an empty log', [[], [7, 8, 9]], [3, [7, 8, 9]]),
      ],
      title: 'Push a batch, flat',
      trap: code(`
export function solve(log: number[], batch: number[]): [number, number[]] {
  const length = (log as unknown[]).push(batch);
  return [length, log];
}
`),
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Prepend `items` to the front of `values` so they appear in their listed order, and return ' +
        '`[newLength, values]` — the length `unshift` reported, then the same array. Mutate the received array; ' +
        'do not copy it.\n\n' +
        'Signature: `solve(values: number[], items: number[]): [number, number[]]`\n\n' +
        'Trap: one `unshift` per item puts each new item in front of the last one — the batch comes out reversed.',
      difficulty: 'advanced',
      explanation:
        '`unshift` inserts at index `0`, shifts everything else right, and returns the new length — the mirror ' +
        'image of `push`. Like `push` it is variadic, and that is the whole solution: `values.unshift(...items)` ' +
        'places the items as one block at the front, in the order they were listed. The trap loops instead: ' +
        '`items.forEach((item) => values.unshift(item))`. Each call puts its item in front of everything already ' +
        'there, including the item unshifted a moment ago, so `[1, 2, 3]` arrives as `3, 2, 1`. A single-item ' +
        'batch hides the bug, which is why the test with three items is the one that catches it. Beyond ' +
        'correctness, the loop is also O(n · k) because every call re-indexes the whole array; one variadic ' +
        'call shifts the tail once.',
      id: 'unshift-batch-keeps-order',
      methods: ['unshift'],
      order: 6,
      solution: code(`
export function solve(values: number[], items: number[]): [number, number[]] {
  const length = values.unshift(...items);
  return [length, values];
}
`),
      starterCode: code(`
export function solve(values: number[], items: number[]): [number, number[]] {
  // unshift() prepends and returns the new length — one call, or one per item?
  return [0, values];
}
`),
      tests: [
        tc('prepends three items in listed order (trap)', [[9], [1, 2, 3]], [4, [1, 2, 3, 9]]),
        tc('prepends a single item', [[2], [1]], [2, [1, 2]]),
        tc('an empty batch changes nothing', [[1], []], [1, [1]]),
        tc('prepends two items onto an empty array (trap)', [[], [5, 6]], [2, [5, 6]]),
      ],
      title: 'Unshift a batch, keep its order',
      trap: code(`
export function solve(values: number[], items: number[]): [number, number[]] {
  items.forEach((item) => values.unshift(item));
  return [values.length, values];
}
`),
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Remove exactly the element at `index` from `values` in place and return `[removed, values]` — the ' +
        'array `splice` handed back (one element, or none when `index` is past the end), then the same array. ' +
        'Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[], index: number): [number[], number[]]`\n\n' +
        'Trap: `splice` with one argument does not remove one element.',
      difficulty: 'advanced',
      explanation:
        '`splice(start, deleteCount)` removes `deleteCount` elements beginning at `start`, closes the gap, and ' +
        'returns the removed elements as a new array — so `values.splice(index, 1)` is the idiomatic “delete at ' +
        'index”. The trap drops the second argument. `splice(index)` does not default `deleteCount` to `1`; an ' +
        'omitted count means “everything from `start` to the end”, so the call guts the tail of the array and ' +
        'hands back several elements instead of one. Removing the last element hides the mistake, which is why ' +
        'the middle-index case is the witness. When `index` is beyond the end, `splice` clamps it to the length, ' +
        'removes nothing, and returns an empty array — no bounds check needed. The returned array is a fresh ' +
        'allocation; only the receiver is edited in place.',
      id: 'remove-one-not-the-tail',
      methods: ['splice'],
      order: 7,
      solution: code(`
export function solve(values: number[], index: number): [number[], number[]] {
  const removed = values.splice(index, 1);
  return [removed, values];
}
`),
      starterCode: code(`
export function solve(values: number[], index: number): [number[], number[]] {
  // splice() removes in place and returns what it removed — count your arguments.
  return [[], values];
}
`),
      tests: [
        tc('removes a middle element (trap)', [[1, 2, 3, 4], 1], [[2], [1, 3, 4]]),
        tc('removes the first element (trap)', [[1, 2, 3], 0], [[1], [2, 3]]),
        tc('removes the last element', [[1, 2, 3], 2], [[3], [1, 2]]),
        tc('index past the end removes nothing', [[1, 2], 5], [[], [1, 2]]),
        tc('removes the only element', [[7], 0], [[7], []]),
      ],
      title: 'Remove one, not the tail',
      trap: code(`
export function solve(values: number[], index: number): [number[], number[]] {
  const removed = values.splice(index);
  return [removed, values];
}
`),
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Remove the last `n` elements of `values` in place (`n >= 0`, and it may exceed the length) and return ' +
        '`[removed, values]` — the removed elements in their original order, then the same array. Mutate the ' +
        'received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[], n: number): [number[], number[]]`\n\n' +
        'Trap: a negative `start` is the obvious spelling for “the last n” — until `n` is `0`.',
      difficulty: 'advanced',
      explanation:
        '`values.splice(-n)` reads naturally — start `n` from the end, remove to the end — and works for every ' +
        '`n` from `1` up to the length. It breaks at `0`: `-0` is just `0`, so `splice(0)` starts at the front ' +
        'and empties the whole array when the caller asked for nothing to be removed. The fix is to compute a ' +
        'non-negative start instead: `values.splice(Math.max(values.length - n, 0))`. For `n = 0` that start is ' +
        'the length, so `splice` removes nothing and returns `[]`; for `n` larger than the length the ' +
        '`Math.max` clamps the start to `0` and everything is removed. Negative indices are a convenience for ' +
        'literal offsets like `-1`; whenever the offset is a variable that can be zero, spell the position from ' +
        'the front.',
      id: 'drop-last-n-zero-safe',
      methods: ['splice'],
      order: 8,
      solution: code(`
export function solve(values: number[], n: number): [number[], number[]] {
  const removed = values.splice(Math.max(values.length - n, 0));
  return [removed, values];
}
`),
      starterCode: code(`
export function solve(values: number[], n: number): [number[], number[]] {
  // Drop the tail with splice() — and make sure n = 0 drops nothing.
  return [[], values];
}
`),
      tests: [
        tc(
          'drops the last two of four',
          [[1, 2, 3, 4], 2],
          [
            [3, 4],
            [1, 2],
          ],
        ),
        tc('n of zero removes nothing (trap)', [[1, 2, 3], 0], [[], [1, 2, 3]]),
        tc('n beyond the length removes everything', [[1, 2, 3], 5], [[1, 2, 3], []]),
        tc('n equal to the length empties the array', [[1, 2], 2], [[1, 2], []]),
        tc('dropping from an empty array', [[], 3], [[], []]),
      ],
      title: 'Drop the last n, zero-safe',
      trap: code(`
export function solve(values: number[], n: number): [number[], number[]] {
  const removed = values.splice(-n);
  return [removed, values];
}
`),
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Pop the last element off `stack` and return `[value, stack]`, where `value` is the popped element — or ' +
        '`fallback` only when the stack was already empty. Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(stack: number[], fallback: number): [number, number[]]`\n\n' +
        'Trap: “use the fallback when pop gives nothing back” — decide what “nothing” means before you pick ' +
        'an operator.',
      difficulty: 'advanced',
      explanation:
        '`pop` removes the last element in place and returns it, or returns `undefined` when the array is ' +
        'empty; it never throws. That `undefined` is the only signal that there was nothing to pop, so the ' +
        'fallback must trigger on `undefined` alone: `stack.pop() ?? fallback`. The trap uses `||`, which ' +
        'substitutes the fallback for *every* falsy result — and a popped `0` is falsy. The stack still loses ' +
        'its `0` (the mutation happened), but the caller is told `fallback` instead, silently corrupting the ' +
        'value. Nullish coalescing only fires for `null` and `undefined`, which is exactly the distinction ' +
        'between “empty” and “the element was zero”. The same reasoning applies to `shift`, `at`, `find`, and ' +
        'any other method whose “not found” result is `undefined`.',
      id: 'pop-or-fall-back',
      methods: ['pop'],
      order: 9,
      solution: code(`
export function solve(stack: number[], fallback: number): [number, number[]] {
  const popped = stack.pop();
  return [popped ?? fallback, stack];
}
`),
      starterCode: code(`
export function solve(stack: number[], fallback: number): [number, number[]] {
  // pop() returns undefined on an empty array — and only then should fallback win.
  return [fallback, stack];
}
`),
      tests: [
        tc('pops the last element', [[1, 2, 3], -1], [3, [1, 2]]),
        tc('a popped zero is a real value (trap)', [[3, 0], -1], [0, [3]]),
        tc('an empty stack falls back', [[], -1], [-1, []]),
        tc('pops the only element', [[5], 0], [5, []]),
      ],
      title: 'Pop, or fall back',
      trap: code(`
export function solve(stack: number[], fallback: number): [number, number[]] {
  return [stack.pop() || fallback, stack];
}
`),
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Shorten `values` in place so it holds at most `n` elements by assigning to `length`, and return ' +
        '`values`. An array that is already `n` elements or shorter must come back exactly as it was. Mutate ' +
        'the received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[], n: number): number[]`\n\n' +
        'Trap: `length` is writable in both directions.',
      difficulty: 'advanced',
      explanation:
        'Assigning to `length` is the cheapest truncation there is: `values.length = 2` discards every element ' +
        'from index `2` on without allocating anything, unlike `slice(0, n)`, which builds a copy and leaves ' +
        'the original intact. The catch is that the assignment also works upward. Set `length` *larger* than ' +
        'the array and the array grows to that size with holes — empty slots that read as `undefined`, are ' +
        'skipped by `forEach` and `map`, and are serialised as `null` by `JSON.stringify`. So an unconditional ' +
        '`values.length = n` turns `[1, 2]` with `n = 5` into a five-slot array with three holes instead of ' +
        'leaving it alone. Guard the write: `values.length = Math.min(values.length, n)` only ever shrinks. ' +
        'The `length` property is the one array mutator that is not a method, and it is the primitive ' +
        '`pop`, `splice`, and `copyWithin`-based algorithms are built on.',
      id: 'truncate-never-grow',
      methods: ['length', 'slice'],
      order: 10,
      solution: code(`
export function solve(values: number[], n: number): number[] {
  values.length = Math.min(values.length, n);
  return values;
}
`),
      starterCode: code(`
export function solve(values: number[], n: number): number[] {
  // Assigning length shrinks an array in place — but what happens when n is bigger?
  return values;
}
`),
      tests: [
        tc('truncates four to two', [[1, 2, 3, 4], 2], [1, 2]),
        tc('n beyond the length leaves the array alone (trap)', [[1, 2], 5], [1, 2]),
        tc('n equal to the length changes nothing', [[1, 2], 2], [1, 2]),
        tc('n of zero empties the array', [[1, 2, 3], 0], []),
        tc('an empty array stays empty', [[], 3], []),
      ],
      title: 'Truncate, never grow',
      trap: code(`
export function solve(values: number[], n: number): number[] {
  values.length = n;
  return values;
}
`),
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Take a snapshot of `buffer` as it is, then zero the buffer in place with `fill`, and return ' +
        '`[snapshot, buffer]` — the contents before clearing, then the same (now all-zero) array. Mutate the ' +
        'received array; do not copy it into a new buffer.\n\n' +
        'Signature: `solve(buffer: number[]): [number[], number[]]`\n\n' +
        'Trap: assigning an array to a new variable does not take a snapshot of anything.',
      difficulty: 'advanced',
      explanation:
        '`fill(0)` overwrites every slot of the receiver and returns that same array, which is exactly what a ' +
        'reusable buffer wants: no reallocation, just a reset. The trap is on the other side of the tuple. ' +
        '`const snapshot = buffer` copies a *reference*, so `snapshot` and `buffer` are two names for one ' +
        'object; after `fill(0)` runs, the “snapshot” is all zeros too, and the tuple returns the cleared ' +
        'array twice. A snapshot has to be a distinct array taken before the mutation: `buffer.slice()` (or ' +
        '`[...buffer]`) allocates the copy, and only then is it safe to call `buffer.fill(0)`. Order matters as ' +
        'much as the copy does — slice after the fill and you have copied zeros. Every in-place mutator carries ' +
        'this hazard: anyone else holding the reference sees the change.',
      id: 'snapshot-then-clear',
      methods: ['fill', 'slice'],
      order: 11,
      solution: code(`
export function solve(buffer: number[]): [number[], number[]] {
  const snapshot = buffer.slice();
  return [snapshot, buffer.fill(0)];
}
`),
      starterCode: code(`
export function solve(buffer: number[]): [number[], number[]] {
  // Copy first, then fill(0) the receiver — a second variable name is not a copy.
  return [[], buffer];
}
`),
      tests: [
        tc(
          'snapshots then clears a non-zero buffer (trap)',
          [[1, 2, 3]],
          [
            [1, 2, 3],
            [0, 0, 0],
          ],
        ),
        tc(
          'a mixed buffer with a zero inside (trap)',
          [[5, 0, -2]],
          [
            [5, 0, -2],
            [0, 0, 0],
          ],
        ),
        tc(
          'an all-zero buffer snapshots as zeros',
          [[0, 0]],
          [
            [0, 0],
            [0, 0],
          ],
        ),
        tc('an empty buffer', [[]], [[], []]),
      ],
      title: 'Snapshot, then clear',
      trap: code(`
export function solve(buffer: number[]): [number[], number[]] {
  const snapshot = buffer;
  buffer.fill(0);
  return [snapshot, buffer];
}
`),
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Sort `values` ascending in place, then pop `min(k, length)` elements so the largest come off first, and ' +
        'return `[popped, values]` — the popped values in the order they came off, then the same array, which ' +
        'must still be sorted. Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[], k: number): [number[], number[]]`',
      difficulty: 'expert',
      explanation:
        'Three mutators in sequence. `sort((a, b) => a - b)` orders the receiver in place — the numeric ' +
        'comparator is mandatory, because the default sort compares strings and puts `10` before `9`. Once ' +
        'sorted, the largest element is always last, so `pop` hands back the maximum in O(1) and leaves the ' +
        'remainder sorted; repeating it `k` times yields the top `k` in descending order. `Array.from({ length: ' +
        'Math.min(k, values.length) }, () => values.pop())` runs exactly that many pops and collects the returns; ' +
        'the `Math.min` keeps a large `k` from producing trailing `undefined`s, and the `?? 0` in the reference ' +
        'exists only to satisfy the type checker — it never fires. The shape is a poor man’s priority queue: ' +
        'one O(n log n) sort, then each “take the max” is constant time and keeps the invariant.',
      id: 'drain-top-k',
      methods: ['sort', 'pop', 'Array.from'],
      order: 12,
      solution: code(`
export function solve(values: number[], k: number): [number[], number[]] {
  values.sort((a, b) => a - b);
  const count = Math.min(k, values.length);
  const popped = Array.from({ length: count }, () => values.pop() ?? 0);
  return [popped, values];
}
`),
      starterCode: code(`
export function solve(values: number[], k: number): [number[], number[]] {
  // Sort in place (numerically!), then pop k times — pop always takes the current maximum.
  return [[], values];
}
`),
      tests: [
        tc('drains the top two', [[3, 1, 2], 2], [[3, 2], [1]]),
        tc('k beyond the length drains everything', [[5, 4], 5], [[5, 4], []]),
        tc('k of zero only sorts', [[2, 1], 0], [[], [1, 2]]),
        tc(
          'sorts numerically, not lexically',
          [[10, 9, 2, 33], 2],
          [
            [33, 10],
            [2, 9],
          ],
        ),
        tc('an empty array', [[], 3], [[], []]),
      ],
      title: 'Drain the top k',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Dequeue the first `k` elements of `queue` (or all of them, if there are fewer) without `splice` or ' +
        '`shift`: copy them out with `slice`, slide the survivors to the front with `copyWithin`, shrink the ' +
        'array with a `length` assignment, and return `[taken, queue]`. Mutate the received array; do not copy ' +
        'it.\n\n' +
        'Signature: `solve(queue: number[], k: number): [number[], number[]]`',
      difficulty: 'expert',
      explanation:
        'Removing from the front is the expensive end of an array — `shift` re-indexes everything on every ' +
        'call, so dequeuing `k` items costs O(n · k). `copyWithin(target, start)` does the same move in one ' +
        'pass: `queue.copyWithin(0, k)` copies the elements from index `k` onward down to index `0`, ' +
        'overlapping regions handled correctly, in O(n). That leaves stale duplicates at the tail, which a ' +
        '`length` assignment removes: `queue.length -= taken.length`. The `slice(0, k)` must come *first*, ' +
        'because it is the only moment the dequeued elements still exist; it also clamps, so `taken.length` ' +
        'rather than `k` is the safe amount to shift and shrink by when `k` exceeds the queue. This is the ' +
        'primitive under ring buffers and batched consumers: move once, truncate once, never allocate a new ' +
        'array.',
      id: 'dequeue-k-without-splice',
      methods: ['slice', 'copyWithin', 'length'],
      order: 13,
      solution: code(`
export function solve(queue: number[], k: number): [number[], number[]] {
  const taken = queue.slice(0, k);
  queue.copyWithin(0, taken.length);
  queue.length -= taken.length;
  return [taken, queue];
}
`),
      starterCode: code(`
export function solve(queue: number[], k: number): [number[], number[]] {
  // slice the head out, copyWithin(0, k) to slide the rest down, then shrink length.
  return [[], queue];
}
`),
      tests: [
        tc(
          'dequeues two of five',
          [[1, 2, 3, 4, 5], 2],
          [
            [1, 2],
            [3, 4, 5],
          ],
        ),
        tc('k beyond the length dequeues everything', [[1, 2], 5], [[1, 2], []]),
        tc('k of zero leaves the queue alone', [[1, 2], 0], [[], [1, 2]]),
        tc('k equal to the length empties the queue', [[7, 8], 2], [[7, 8], []]),
        tc('dequeues one', [[1, 2, 3], 1], [[1], [2, 3]]),
      ],
      title: 'Dequeue k without splice',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Reimplement `splice` in place without calling `splice` or `toSpliced`: remove `deleteCount` elements at ' +
        '`start` (negative `start` counts from the end and clamps; `undefined` means “to the end”; a count ' +
        'past the end clamps; a `start` past the end appends), insert `items` there, and return ' +
        '`[removed, values]` using only `slice`, `copyWithin`, `length` assignment, and index writes. Mutate ' +
        'the received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[], start: number, deleteCount: number | undefined, items: number[]): [number[], number[]]`',
      difficulty: 'expert',
      explanation:
        '`splice` is three primitives in a trench coat. First normalise the arguments the way the spec does: a ' +
        'negative `start` becomes `max(length + start, 0)`, a positive one is clamped to the length, and ' +
        '`deleteCount` is clamped to `[0, length - start]` — with `undefined` meaning the whole tail, which is ' +
        'why the reference tests for `undefined` explicitly rather than using `?? 0`. `slice(from, from + ' +
        'count)` captures the removed elements before anything moves. Then the tail shifts by ' +
        '`items.length - count`: growing means raising `length` (which creates holes) and then ' +
        '`copyWithin` moving the tail *right* over them; shrinking means `copyWithin` moving the tail *left* ' +
        'and then lowering `length` to drop the stale copies. `copyWithin` handles overlapping ranges ' +
        'correctly in both directions, and the final index writes drop `items` into the gap.',
      id: 'splice-from-copywithin',
      methods: ['copyWithin', 'length', 'slice'],
      order: 14,
      solution: code(`
export function solve(
  values: number[],
  start: number,
  deleteCount: number | undefined,
  items: number[],
): [number[], number[]] {
  const length = values.length;
  const from = start < 0 ? Math.max(length + start, 0) : Math.min(start, length);
  const count = deleteCount === undefined ? length - from : Math.min(Math.max(deleteCount, 0), length - from);
  const removed = values.slice(from, from + count);
  const tailStart = from + count;
  const shift = items.length - count;
  if (shift > 0) {
    values.length += shift;
    values.copyWithin(tailStart + shift, tailStart, length);
  } else if (shift < 0) {
    values.copyWithin(tailStart + shift, tailStart, length);
    values.length += shift;
  }
  items.forEach((item, index) => {
    values[from + index] = item;
  });
  return [removed, values];
}
`),
      starterCode: code(`
export function solve(
  values: number[],
  start: number,
  deleteCount: number | undefined,
  items: number[],
): [number[], number[]] {
  // Normalise start and deleteCount, slice out the removed run, then copyWithin + length to move the tail.
  return [[], values];
}
`),
      tests: [
        tc(
          'replaces two elements with one',
          [[1, 2, 3, 4, 5], 1, 2, [9]],
          [
            [2, 3],
            [1, 9, 4, 5],
          ],
        ),
        tc('inserts more than it removes', [[1, 2, 3, 4], 1, 1, [8, 9]], [[2], [1, 8, 9, 3, 4]]),
        tc(
          'undefined deleteCount removes to the end',
          [[1, 2, 3, 4], 2, undefined, []],
          [
            [3, 4],
            [1, 2],
          ],
        ),
        tc('negative start counts from the end', [[1, 2, 3, 4], -2, 1, [7]], [[3], [1, 2, 7, 4]]),
        tc('start past the end appends', [[1, 2], 10, 3, [3, 4]], [[], [1, 2, 3, 4]]),
        tc('deleteCount clamps to the tail', [[1, 2, 3], 1, 99, []], [[2, 3], [1]]),
        tc('zero deleteCount inserts at the front', [[2, 3], 0, 0, [1]], [[], [1, 2, 3]]),
        tc('negative start before the front clamps to zero', [[1, 2], -9, 1, []], [[1], [2]]),
      ],
      title: 'Build your own splice',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        '`sorted` is in ascending order. Collapse every run of equal adjacent values down to one in place — a ' +
        'single pass with a write pointer and one final `length` truncation, O(n) time and O(1) extra space — ' +
        'and return `sorted`. Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(sorted: number[]): number[]`',
      difficulty: 'expert',
      explanation:
        'Because the input is sorted, duplicates are always neighbours, so the array can be compacted with two ' +
        'indices: a read position (the `forEach` index) and a `write` pointer that only advances when the ' +
        'current value differs from the last one written. `forEach` visits every element once; each kept value ' +
        'is stored at `sorted[write]`, and since `write` never overtakes the read index, no unread element is ' +
        'ever overwritten. When the pass ends, everything from `write` onward is stale, and one ' +
        '`sorted.length = write` discards it. The tempting alternatives are worse: `splice` inside a loop ' +
        're-indexes the tail on every removal (O(n²)) and skips elements when the index shifts under you, ' +
        'while `[...new Set(sorted)]` is O(n) but allocates a Set and a second array. Write-pointer compaction ' +
        'is the shape to reach for whenever an array must be filtered in place.',
      id: 'dedupe-sorted-in-place',
      methods: ['length', 'forEach'],
      order: 15,
      solution: code(`
export function solve(sorted: number[]): number[] {
  let write = 0;
  sorted.forEach((value, index) => {
    if (index === 0 || value !== sorted[write - 1]) {
      sorted[write] = value;
      write += 1;
    }
  });
  sorted.length = write;
  return sorted;
}
`),
      starterCode: code(`
export function solve(sorted: number[]): number[] {
  // Keep a write pointer; copy each new value down to it; truncate length once at the end.
  return sorted;
}
`),
      tests: [
        tc('collapses adjacent runs', [[1, 1, 2, 2, 3]], [1, 2, 3]),
        tc('no duplicates is a no-op', [[1, 2, 3]], [1, 2, 3]),
        tc('all equal collapses to one', [[4, 4, 4, 4]], [4]),
        tc('an empty array', [[]], []),
        tc('negative and zero runs', [[-2, -2, -1, 0, 0]], [-2, -1, 0]),
      ],
      title: 'Dedupe a sorted array in place',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Move every `0` in `values` to the end in place, keeping the non-zero elements in their original ' +
        'relative order — compact the non-zeros forward with a write pointer, then `fill` the tail with zeros — ' +
        'and return `values`. O(n) time with no second array. Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[]): number[]`',
      difficulty: 'expert',
      explanation:
        'Two passes over the same array, neither allocating. The `forEach` pass is a stable compaction: every ' +
        'non-zero value is copied down to `values[write]` and the pointer advances, so the non-zeros end up ' +
        'packed at the front in the order they were met, while `write` never passes the read index. After that ' +
        'pass the slots from `write` to the end are stale — some still hold the non-zeros that were copied ' +
        'forward — and `values.fill(0, write)` overwrites exactly that tail with zeros. The `filter`-then-' +
        '`concat` version gives the same answer but builds two intermediate arrays and a third for the result; ' +
        'a swap-based version keeps O(1) space too but is easy to get wrong about stability. Compaction plus ' +
        '`fill` is the simplest in-place spelling, and `fill`’s `start` argument is what makes the second pass ' +
        'a single call.',
      id: 'move-zeros-to-the-end-in-place',
      methods: ['fill', 'forEach'],
      order: 16,
      solution: code(`
export function solve(values: number[]): number[] {
  let write = 0;
  values.forEach((value) => {
    if (value !== 0) {
      values[write] = value;
      write += 1;
    }
  });
  values.fill(0, write);
  return values;
}
`),
      starterCode: code(`
export function solve(values: number[]): number[] {
  // Compact the non-zeros forward with a write pointer, then fill(0, write) the tail.
  return values;
}
`),
      tests: [
        tc('moves zeros behind the non-zeros', [[0, 1, 0, 3, 12]], [1, 3, 12, 0, 0]),
        tc('no zeros is a no-op', [[1, 2]], [1, 2]),
        tc('all zeros stay zeros', [[0, 0]], [0, 0]),
        tc('keeps non-zero order across a zero run', [[4, 0, 0, 5]], [4, 5, 0, 0]),
        tc('an empty array', [[]], []),
      ],
      title: 'Move the zeros to the end, in place',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Apply each op in `ops` to `values` in order and collect what each mutator RETURNED — the new length ' +
        'for `push`/`unshift`, the removed element (or `undefined`) for `pop`/`shift`, the removed slice for ' +
        '`splice` — then return `[returns, values]`. Mutate the received array; do not copy it.\n\n' +
        'Signature: `solve(values: number[], ops: Op[]): [unknown[], number[]]` where `Op` is ' +
        "`{ type: 'push' | 'unshift'; value: number } | { type: 'pop' | 'shift' } | " +
        "`{ type: 'splice'; start: number; deleteCount: number }`.",
      difficulty: 'expert',
      explanation:
        'The five classic mutators share one receiver and disagree about what to hand back. `push` and ' +
        '`unshift` add elements and return the new *length* — a number, never the element — so pushing `0` ' +
        'returns `2`, not `0`. `pop` and `shift` remove one element and return *it*, or `undefined` when the ' +
        'array was empty. `splice` returns an *array* of the removed elements, empty when nothing was removed. ' +
        'Mapping `ops` to `values.push(op.value)`, `values.pop()`, `values.splice(op.start, op.deleteCount)` ' +
        'and so on records each of those return values at the moment the mutation happens, while `values` ' +
        'accumulates every edit. The returns list is typed `unknown[]` because it genuinely mixes numbers, ' +
        '`undefined`, and arrays. Knowing which mutator returns what is why `stack.push(x).length` and ' +
        '`if (queue.shift())` are bugs, and why every method in this category is paired with its return.',
      id: 'record-what-each-mutator-returns',
      methods: ['push', 'pop', 'shift', 'unshift', 'splice'],
      order: 17,
      solution: code(`
type Op =
  | { deleteCount: number; start: number; type: 'splice' }
  | { type: 'pop' | 'shift' }
  | { type: 'push' | 'unshift'; value: number };

export function solve(values: number[], ops: Op[]): [unknown[], number[]] {
  const returns = ops.map((op): unknown => {
    switch (op.type) {
      case 'push':
        return values.push(op.value);
      case 'unshift':
        return values.unshift(op.value);
      case 'pop':
        return values.pop();
      case 'shift':
        return values.shift();
      default:
        return values.splice(op.start, op.deleteCount);
    }
  });
  return [returns, values];
}
`),
      starterCode: code(`
type Op =
  | { deleteCount: number; start: number; type: 'splice' }
  | { type: 'pop' | 'shift' }
  | { type: 'push' | 'unshift'; value: number };

export function solve(values: number[], ops: Op[]): [unknown[], number[]] {
  // Run each op on values and keep whatever the method returned — length, element, or slice.
  return [[], values];
}
`),
      tests: [
        tc(
          'records a length, an element, an element, a length, and a slice',
          [
            [1, 2],
            [
              { type: 'push', value: 3 },
              { type: 'pop' },
              { type: 'shift' },
              { type: 'unshift', value: 9 },
              { deleteCount: 1, start: 0, type: 'splice' },
            ],
          ],
          [[3, 3, 1, 2, [9]], [2]],
        ),
        tc(
          'pop and shift on an empty array return undefined',
          [[], [{ type: 'pop' }, { type: 'shift' }]],
          [[undefined, undefined], []],
        ),
        tc('no ops records nothing', [[1], []], [[], [1]]),
        tc(
          'splice returns the removed slice, push the new length',
          [
            [1, 2, 3, 4],
            [
              { deleteCount: 2, start: 1, type: 'splice' },
              { type: 'push', value: 5 },
            ],
          ],
          [
            [[2, 3], 3],
            [1, 4, 5],
          ],
        ),
        tc(
          'push and unshift return the length, not the value',
          [
            [5],
            [
              { type: 'push', value: 0 },
              { type: 'unshift', value: 0 },
            ],
          ],
          [
            [2, 3],
            [0, 5, 0],
          ],
        ),
      ],
      title: 'Record what each mutator returns',
    },
    {
      categoryId: 'mutating-in-place',
      description:
        'Rotate the `n × n` `matrix` 90° clockwise in place — transpose it by swapping `matrix[i][j]` with ' +
        '`matrix[j][i]` for `j > i`, then `reverse` each row — and return the same `matrix` object. Do not ' +
        'allocate a new matrix or new rows; mutate the received array.\n\n' +
        'Signature: `solve(matrix: number[][]): number[][]`',
      difficulty: 'expert',
      explanation:
        'A clockwise quarter turn sends the element at row `i`, column `j` to row `j`, column `n - 1 - i`. ' +
        'That is two simpler moves composed: a transpose (`(i, j)` → `(j, i)`) followed by mirroring each row ' +
        'left-to-right (`(j, i)` → `(j, n - 1 - i)`). The transpose is a nested `forEach` that swaps only the ' +
        'cells above the diagonal with their partners below it — visiting every `(i, j)` would swap each pair ' +
        'twice and undo itself. The mirror is `row.reverse()` on every row, which flips in place and returns ' +
        'the same row, so no new arrays appear. Order and axis both matter: reversing the *outer* array instead ' +
        'of each row, or reversing before transposing, produces the counter-clockwise rotation. Because every ' +
        'step edits the received rows, the returned value is the very object the caller passed in, now rotated.',
      id: 'rotate-square-in-place',
      methods: ['reverse', 'forEach'],
      order: 18,
      solution: code(`
export function solve(matrix: number[][]): number[][] {
  matrix.forEach((row, i) => {
    row.forEach((value, j) => {
      if (j > i) {
        const below = matrix[j][i];
        matrix[j][i] = value;
        row[j] = below;
      }
    });
  });
  matrix.forEach((row) => row.reverse());
  return matrix;
}
`),
      starterCode: code(`
export function solve(matrix: number[][]): number[][] {
  // Transpose by swapping across the diagonal, then reverse() each row — not the outer array.
  return matrix;
}
`),
      tests: [
        tc(
          'rotates a 2×2 clockwise',
          [
            [
              [1, 2],
              [3, 4],
            ],
          ],
          [
            [3, 1],
            [4, 2],
          ],
        ),
        tc(
          'rotates a 3×3 clockwise',
          [
            [
              [1, 2, 3],
              [4, 5, 6],
              [7, 8, 9],
            ],
          ],
          [
            [7, 4, 1],
            [8, 5, 2],
            [9, 6, 3],
          ],
        ),
        tc(
          'rotates a 4×4 clockwise',
          [
            [
              [1, 2, 3, 4],
              [5, 6, 7, 8],
              [9, 10, 11, 12],
              [13, 14, 15, 16],
            ],
          ],
          [
            [13, 9, 5, 1],
            [14, 10, 6, 2],
            [15, 11, 7, 3],
            [16, 12, 8, 4],
          ],
        ),
        tc('a 1×1 matrix is unchanged', [[[5]]], [[5]]),
        tc('an empty matrix', [[]], []),
      ],
      title: 'Rotate a square matrix in place',
    },
  ],
};
